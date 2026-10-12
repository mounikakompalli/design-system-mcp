import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

/**
 * Tracing setup. Defaults to the console exporter (spans print to stderr,
 * which is safe — MCP uses stdout for its protocol).
 * Set OTEL_EXPORTER_OTLP_ENDPOINT to ship spans to a real collector instead.
 */
export function initTelemetry(): void {
  const useOtlp = !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const traceExporter = useOtlp ? new OTLPTraceExporter() : new ConsoleSpanExporter();
  const sdk = new NodeSDK({ traceExporter });
  sdk.start();
  console.error(`[telemetry] exporter=${useOtlp ? 'otlp' : 'console'}`);
}
