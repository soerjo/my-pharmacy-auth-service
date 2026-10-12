import { Module } from '@nestjs/common';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

@Module({})
export class OtelModule {
  static sdk: NodeSDK;

  static onModuleInit() {
    const traceExporter = new OTLPTraceExporter({
      // url is taken from env OTEL_EXPORTER_OTLP_ENDPOINT
      // if not set, defaults to http://localhost:4318/v1/traces
    });

    const metricReader = new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 60000,
    });

    OtelModule.sdk = new NodeSDK({
      traceExporter,
      metricReader,
      // serviceName is taken from env OTEL_SERVICE_NAME
      // if not set, defaults to 'unknown_service'
      instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
      ],
    });

    OtelModule.sdk.start();
  }

  static onModuleDestroy() {
    return OtelModule.sdk?.shutdown();
  }
}