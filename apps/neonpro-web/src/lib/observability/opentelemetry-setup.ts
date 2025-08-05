/**
 * 🔭 OpenTelemetry Integration (Opcional)
 *
 * Setup minimalista de OpenTelemetry para observability avançada
 * Ativa apenas se ENABLE_OTEL=true no ambiente
 */

interface TelemetryConfig {
  enabled: boolean;
  serviceName: string;
  environment: string;
  exporterEndpoint?: string;
}

let telemetryInitialized = false;

export class SimpleTelemetry {
  private static config: TelemetryConfig = {
    enabled: process.env.ENABLE_OTEL === "true",
    serviceName: "neonpro-clinic",
    environment: process.env.NODE_ENV || "development",
    exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  };

  /**
   * 🚀 Initialize telemetry (only if enabled)
   */
  static async initialize(): Promise<void> {
    if (!this.config.enabled || telemetryInitialized) {
      return;
    }

    try {
      // Dynamic import to avoid loading when disabled
      const { NodeSDK } = await import("@opentelemetry/sdk-node");
      const { getNodeAutoInstrumentations } = await import(
        "@opentelemetry/auto-instrumentations-node"
      );
      const { OTLPTraceExporter } = await import("@opentelemetry/exporter-otlp-http");

      const sdk = new NodeSDK({
        serviceName: this.config.serviceName,
        environment: this.config.environment,
        traceExporter: this.config.exporterEndpoint
          ? new OTLPTraceExporter({ url: this.config.exporterEndpoint })
          : undefined,
        instrumentations: [
          getNodeAutoInstrumentations({
            // Disable noisy instrumentations
            "@opentelemetry/instrumentation-fs": { enabled: false },
            "@opentelemetry/instrumentation-dns": { enabled: false },
          }),
        ],
      });

      sdk.start();
      telemetryInitialized = true;

      console.log("📡 OpenTelemetry initialized successfully");
    } catch (error) {
      console.warn("⚠️ OpenTelemetry initialization failed:", error);
      // Don't fail the app if telemetry fails
    }
  }

  /**
   * 📊 Simple trace creation (fallback to console if not enabled)
   */
  static createTrace(name: string, fn: () => Promise<any>): Promise<any> {
    if (!this.config.enabled) {
      // Fallback: just execute function
      return fn();
    }

    const startTime = Date.now();

    return fn()
      .then((result) => {
        const duration = Date.now() - startTime;
        console.log(`🔍 Trace: ${name} completed in ${duration}ms`);
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        console.error(`🔍 Trace: ${name} failed in ${duration}ms:`, error);
        throw error;
      });
  }

  /**
   * 📈 Add custom attribute (no-op if disabled)
   */
  static addAttribute(key: string, value: string | number | boolean): void {
    if (!this.config.enabled) return;

    // Simple logging fallback
    console.log(`📋 Attribute: ${key} = ${value}`);
  }

  /**
   * ⚙️ Get current configuration
   */
  static getConfig(): TelemetryConfig {
    return { ...this.config };
  }
}
