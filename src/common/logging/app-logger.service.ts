import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: pino.Logger;
  private context?: string;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      base: {
        env: process.env.NODE_ENV || 'development',
        service: 'nestjs-app',
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label: string) => {
          return { level: label.toUpperCase() };
        },
      },
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  private formatMessage(message: string, context?: string): string {
    const ctx = context || this.context;
    return ctx ? `[${ctx}] ${message}` : message;
  }

  log(message: string, context?: string): void {
    this.logger.info({ traceId: uuidv4() }, this.formatMessage(message, context));
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ traceId: uuidv4(), stack: trace }, this.formatMessage(message, context));
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ traceId: uuidv4() }, this.formatMessage(message, context));
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ traceId: uuidv4() }, this.formatMessage(message, context));
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ traceId: uuidv4() }, this.formatMessage(message, context));
  }

  child(context: string): AppLogger {
    const childLogger = new AppLogger();
    childLogger.setContext(context);
    return childLogger;
  }
}
