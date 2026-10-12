import type { LevelWithSilent } from 'pino';
import type { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: (process.env.LOG_LEVEL as LevelWithSilent) ?? 'info',
    autoLogging: false,
    base: {
      service: process.env.OTEL_SERVICE_NAME ?? 'my-pharmacy-auth-service',
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
};
