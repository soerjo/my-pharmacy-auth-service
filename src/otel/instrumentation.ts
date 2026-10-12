import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

const baseUrl =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://otel-collector:4318';
const exporterUrl = baseUrl.endsWith('/v1/traces')
  ? baseUrl
  : `${baseUrl.replace(/\/+$/, '')}/v1/traces`;

const otelSdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: exporterUrl }),
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'my-pharmacy-auth-service',
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

otelSdk.start();

const shutdownOtel = () => {
  otelSdk
    .shutdown()
    .catch((error) => {
      console.error('error shutting down OpenTelemetry SDK', error);
    })
    .finally(() => process.exit(0));
};

process.on('SIGTERM', shutdownOtel);
process.on('SIGINT', shutdownOtel);
