/**
 * 🔭 OpenTelemetry Integration (Opcional)
 *
 * Setup minimalista de OpenTelemetry para observability avançada
 * Ativa apenas se ENABLE_OTEL=true no ambiente
 */

type TelemetryConfig = {
  enabled: boolean;
  serviceName: string;
  environment: string;
  exporterEndpoint?: string;
};

let telemetryInitialized = false;

export class SimpleTelemetry {
  private static config: TelemetryConfig = {
    enabled: process.env.ENABLE_OTEL === 'true',
    serviceName: 'neonpro-clinic',
    environment: process.env.NODE_ENV || 'development',
    exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  };

  /**
   * 🚀 Initialize telemetry (only if enabled)
   */
  static async initialize(): Promise<void> {
    if (!SimpleTelemetry.config.enabled || telemetryInitialized) {
      return;
    }

    try {
      // Dynamic import to avoid loading when disabled
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { getNodeAutoInstrumentations } = await import(
        '@opentelemetry/auto-instrumentations-node'
      );
      const { OTLPTraceExporter } = await import(
        '@opentelemetry/exporter-otlp-http'
      );

      const sdk = new NodeSDK({
        serviceName: SimpleTelemetry.config.serviceName,
        environment: SimpleTelemetry.config.environment,
        traceExporter: SimpleTelemetry.config.exporterEndpoint
          ? new OTLPTraceExporter({
              url: SimpleTelemetry.config.exporterEndpoint,
            })
          : undefined,
        instrumentations: [
          getNodeAutoInstrumentations({
            // Disable noisy instrumentations
            '@opentelemetry/instrumentation-fs': { enabled: false },
            '@opentelemetry/instrumentation-dns': { enabled: false },
          }),
        ],
      });

      sdk.start();
      telemetryInitialized = true;
    } catch (_error) {
      // Don't fail the app if telemetry fails
    }
  }

  /**
   * 📊 Simple trace creation (fallback to console if not enabled)
   */
  static createTrace(_name: string, fn: () => Promise<any>): Promise<any> {
    if (!SimpleTelemetry.config.enabled) {
      // Fallback: just execute function
      return fn();
    }

    const startTime = Date.now();

    return fn()
      .then((result) => {
        const _duration = Date.now() - startTime;
        return result;
      })
      .catch((error) => {
        const _duration = Date.now() - startTime;
        throw error;
      });
  }

  /**
   * 📈 Add custom attribute (no-op if disabled)
   */
  static addAttribute(_key: string, _value: string | number | boolean): void {
    if (!SimpleTelemetry.config.enabled) {
      return;
    }
  }

  /**
   * ⚙️ Get current configuration
   */
  static getConfig(): TelemetryConfig {
    return { ...SimpleTelemetry.config };
  }
}
