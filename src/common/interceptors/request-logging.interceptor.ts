import { PinoLogger } from 'nestjs-pino';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export interface RequestWithId extends Request {
  requestId: string;
}

const SENSITIVE_FIELDS = ['password', 'token', 'authorization', 'secret'];
const MAX_PAYLOAD_BYTES = 8 * 1024; // 8KB

function redact(
  obj: unknown,
  seen = new WeakSet(),
): Record<string, unknown> | string {
  if (obj === null || typeof obj !== 'object') {
    return obj as string;
  }
  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item, seen)) as unknown as Record<
      string,
      unknown
    >;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some((s) => s.toLowerCase() === key.toLowerCase())) {
      result[key] = maskSensitive(value, key);
    } else {
      result[key] = redact(value, seen);
    }
  }
  return result;
}

function maskSensitive(value: unknown, key: string): string {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'email' || lowerKey === 'username') {
    const str = String(value);
    const at = str.indexOf('@');
    return at > 0
      ? `${str.slice(0, 2)}${'*'.repeat(at - 2)}@${str.slice(at)}`
      : str;
  }
  if (lowerKey.includes('credit') || lowerKey.includes('card')) {
    const str = String(value);
    return str.length > 4 ? `************${str.slice(-4)}` : str;
  }
  return '***[REDACTED]***';
}

function shouldSkipBody(req: Request): boolean {
  const contentType = req.headers['content-type'] || '';
  const length =
    req.headers['content-length'] ?? req.headers['x-content-length'];
  const lengthBytes = length ? Number(length) : 0;

  if (lengthBytes > MAX_PAYLOAD_BYTES) {
    return true;
  }

  const skipPatterns = [
    /multipart\//,
    /application\/octet-stream/,
    /image\/|audio\/|video\/|pdf/,
    /stream/,
    /base64/,
  ];
  return skipPatterns.some((p) => p.test(contentType.toLowerCase()));
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithId & Request>();
    const startTime = process.hrtime.bigint();

    // RequestId: propagate incoming or generate
    const headerId = req.headers['x-request-id'];
    let requestId: string;
    if (
      typeof headerId === 'string' &&
      headerId.length > 0 &&
      headerId.length <= 64
    ) {
      requestId = headerId.replace(/[\r\n\t]/g, '').trim();
    } else {
      requestId = randomUUID();
    }
    req.requestId = requestId;

    let payloadRedacted: Record<string, unknown> | undefined;

    try {
      if (!shouldSkipBody(req)) {
        const body = (req.body || {}) as Record<string, unknown>;
        const parsed = JSON.parse(JSON.stringify(body)) as Record<
          string,
          unknown
        >;
        payloadRedacted = redact(parsed) as Record<string, unknown>;
      }
    } catch {
      // not JSON-serializable; skip logging body
    }

    this.logger.info({
      level: 'info',
      time: new Date().toISOString(),
      requestId,
      service: process.env.OTEL_SERVICE_NAME ?? 'my-pharmacy-auth-service',
      msg: 'request incoming',
      method: req.method,
      path: req.url,
      payload: payloadRedacted,
    });

    return next.handle().pipe(
      tap((result) => {
        const latencyNs = process.hrtime.bigint() - startTime;
        const latencyMs = Number(latencyNs) / 1e6;
        const res = context.switchToHttp().getResponse<Response>();

        if (!res.getHeader('X-Request-Id')) {
          res.setHeader('X-Request-Id', requestId);
        }

        const statusCode = res.statusCode;
        this.logger.info({
          level: 'info',
          time: new Date().toISOString(),
          requestId,
          service: process.env.OTEL_SERVICE_NAME ?? 'my-pharmacy-auth-service',
          msg: 'request completed',
          method: req.method,
          path: req.url,
          statusCode,
          latency_ms: Number(latencyMs.toFixed(3)),
          responseSummary: result ? redact(result) : undefined,
        });
      }),
      catchError(
        (err: {
          message?: string;
          constructor?: { name?: string };
          stack?: string;
        }) => {
          const latencyNs = process.hrtime.bigint() - startTime;
          const latencyMs = Number(latencyNs) / 1e6;
          const res = context.switchToHttp().getResponse<Response>();
          if (!res.getHeader('X-Request-Id')) {
            res.setHeader('X-Request-Id', requestId);
          }
          this.logger.error({
            level: 'error',
            time: new Date().toISOString(),
            requestId,
            service:
              process.env.OTEL_SERVICE_NAME ?? 'my-pharmacy-auth-service',
            msg: 'request failed',
            method: req.method,
            path: req.url,
            statusCode: res.statusCode,
            latency_ms: Number(latencyMs.toFixed(3)),
            error: {
              message: err.message ?? 'Unknown error',
              name: err.constructor?.name ?? 'Unknown',
            },
            stack: err.stack ?? 'No stack available',
          });
          return throwError(() => err);
        },
      ),
    );
  }
}
