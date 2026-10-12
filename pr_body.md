# Observability pilot: pino logger + interceptor + X-Request-Id + OTel OTLP

## Ringkasan
Implementasi observability pilot (step 1-6) di my-pharmacy-auth-service.

### 1. Pino JSON logger (replace Winston)
- Replaced Winston dengan pino JSON formatter (`src/config/logger.config.ts`)
- Global NestJS logger digunakan (`app.useLogger(app.get(Logger))` di `src/main.ts`)
- Environment vars: `OTEL_SERVICE_NAME`, `LOG_LEVEL`, `LOG_PAYLOAD_ENABLED`

### 2. Request logging interceptor + X-Request-Id
- `src/common/interceptors/request-logging.interceptor.ts` terdaftar global di `src/main.ts`
- Structured JSON logs: `timestamp`, `requestId`, `service`, `method`, `path`, `statusCode`, `latency_ms`, `requestPayload` (redacted), `responseSummary`
- Redaction: recursive case-insensitive match field sensitif (password, token, authorization, secret); email mask (j***@domain); credit card (last 4 digits)
- Skip payload > 8 KB serialized size; skip binary/multipart/file/stream

### 3. Response logging + requestId propagation + X-Request-Id header
- Set header `X-Request-Id` pada response (jika tidak ada incoming)
- Propagate dari incoming X-Request-Id atau generate UUID4
- Latency: monotonic timer `process.hrtime.bigint()`

### 4. OTel SDK setup + env-based endpoint/service name + graceful shutdown
- `src/otel/otel.module.ts` — NodeSDK dengan OTLPTraceExporter (endpoint dari env `OTEL_EXPORTER_OTLP_ENDPOINT`, default `http://otel-collector:4318`)
- `OTEL_SERVICE_NAME` dari env (default `my-pharmacy-auth-service`)
- Instrumentations: Express, HTTP, Prisma; graceful shutdown SIGTERM/SIGINT

### 5. Prisma query log (structured {query, params redacted, duration_ms})
- Prisma event logging di `PrismaService`; redacted password/token/email/secret

### 6. CI workflow
- `.github/workflows/ci.yml`: lint + tsc --noEmit + build + test (pull_request + push)

## Verifikasi
- `npm run build` — exit 0
- `npx tsc --noEmit` — exit 0
- `npm run lint` — exit 0
- `npm run test` — exit 0

## Env baru (document, jangan di-set di .env)
- `OTEL_EXPORTER_OTLP_ENDPOINT` (default `http://otel-collector:4318`)
- `OTEL_SERVICE_NAME` (default `my-pharmacy-auth-service`)
- `LOG_LEVEL` (default `info`)
- `LOG_PAYLOAD_ENABLED` (default `true`)

Perubahan di branch `feat/observability-pilot`. Siap review. [skip deploy]
