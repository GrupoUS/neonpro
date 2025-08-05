import type { FastifyInstance } from "fastify";

export interface EdgeServiceConfig {
  analyticsUrl: string;
  fileProcessingUrl: string;
  realtimeMonitoringUrl: string;
  timeout: number;
  retries: number;
  circuitBreaker: {
    enabled: boolean;
    threshold: number;
    resetTime: number;
  };
}

export interface EdgeServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  processingTime: number;
}

export interface AnalyticsRequest {
  tenantId: string;
  metrics: string[];
  timeRange: {
    start: string;
    end: string;
  };
  granularity?: "minute" | "hour" | "day" | "week" | "month";
}

export interface FileProcessingRequest {
  fileId: string;
  tenantId: string;
  documentType: string;
  requiresOCR: boolean;
  requiresAIAnalysis: boolean;
  patientId?: string;
  appointmentId?: string;
}

export interface VitalSignsData {
  patientId: string;
  tenantId: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  recordedBy: string;
  deviceId?: string;
  timestamp?: string;
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold: number,
    private resetTime: number,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.resetTime) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = "open";
    }
  }

  getState(): string {
    return this.state;
  }
}

export class EdgeServicesIntegration {
  private config: EdgeServiceConfig;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(config: EdgeServiceConfig) {
    this.config = config;

    // Initialize circuit breakers for each service
    if (config.circuitBreaker.enabled) {
      this.circuitBreakers.set(
        "analytics",
        new CircuitBreaker(config.circuitBreaker.threshold, config.circuitBreaker.resetTime),
      );

      this.circuitBreakers.set(
        "fileProcessing",
        new CircuitBreaker(config.circuitBreaker.threshold, config.circuitBreaker.resetTime),
      );

      this.circuitBreakers.set(
        "realtimeMonitoring",
        new CircuitBreaker(config.circuitBreaker.threshold, config.circuitBreaker.resetTime),
      );
    }
  }

  private async makeRequest<T>(
    url: string,
    serviceName: string,
    options: RequestInit = {},
  ): Promise<EdgeServiceResponse<T>> {
    const startTime = Date.now();

    const requestOperation = async (): Promise<EdgeServiceResponse<T>> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "NeonPro-API/1.0",
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as T;
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          processingTime,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        const processingTime = Date.now() - startTime;

        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          processingTime,
        };
      }
    };

    // Use circuit breaker if enabled
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      try {
        return await circuitBreaker.execute(requestOperation);
      } catch (error) {
        const processingTime = Date.now() - startTime;
        return {
          success: false,
          error: `Circuit breaker: ${
            error instanceof Error ? error.message : "Service unavailable"
          }`,
          timestamp: new Date().toISOString(),
          processingTime,
        };
      }
    }

    return await requestOperation();
  }

  // Analytics Service Integration
  async getAnalytics(request: AnalyticsRequest): Promise<EdgeServiceResponse> {
    const url = `${this.config.analyticsUrl}/api/v1/analytics`;

    return this.makeRequest(url, "analytics", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPatientMetrics(tenantId: string, patientId: string): Promise<EdgeServiceResponse> {
    const url = `${this.config.analyticsUrl}/api/v1/metrics/patients/${patientId}`;

    return this.makeRequest(url, "analytics", {
      method: "GET",
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
  }

  async getRevenueAnalytics(
    tenantId: string,
    timeRange: { start: string; end: string },
  ): Promise<EdgeServiceResponse> {
    const url = `${this.config.analyticsUrl}/api/v1/analytics/revenue`;

    return this.makeRequest(url, "analytics", {
      method: "POST",
      body: JSON.stringify({ tenantId, timeRange }),
    });
  }

  // File Processing Service Integration
  async processFile(request: FileProcessingRequest): Promise<EdgeServiceResponse> {
    const url = `${this.config.fileProcessingUrl}/api/v1/process`;

    return this.makeRequest(url, "fileProcessing", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "X-Tenant-ID": request.tenantId,
      },
    });
  }

  async getFileProcessingStatus(fileId: string, tenantId: string): Promise<EdgeServiceResponse> {
    const url = `${this.config.fileProcessingUrl}/api/v1/status/${fileId}`;

    return this.makeRequest(url, "fileProcessing", {
      method: "GET",
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
  }

  async uploadFileToEdge(
    file: Buffer,
    metadata: {
      originalName: string;
      mimeType: string;
      tenantId: string;
      patientId?: string;
      documentType: string;
    },
  ): Promise<EdgeServiceResponse> {
    const url = `${this.config.fileProcessingUrl}/api/v1/upload`;

    const formData = new FormData();
    formData.append("file", new Blob([Buffer.from(file.buffer)]), metadata.originalName);
    formData.append("metadata", JSON.stringify(metadata));

    return this.makeRequest(url, "fileProcessing", {
      method: "POST",
      body: formData,
      headers: {
        "X-Tenant-ID": metadata.tenantId,
      },
    });
  }

  // Real-time Monitoring Service Integration
  async submitVitalSigns(vitalSigns: VitalSignsData): Promise<EdgeServiceResponse> {
    const url = `${this.config.realtimeMonitoringUrl}/api/v1/vital-signs`;

    return this.makeRequest(url, "realtimeMonitoring", {
      method: "POST",
      body: JSON.stringify(vitalSigns),
      headers: {
        "X-Tenant-ID": vitalSigns.tenantId,
      },
    });
  }

  async getRealtimeVitalSigns(patientId: string, tenantId: string): Promise<EdgeServiceResponse> {
    const url = `${this.config.realtimeMonitoringUrl}/api/v1/vital-signs/${patientId}/realtime`;

    return this.makeRequest(url, "realtimeMonitoring", {
      method: "GET",
      headers: {
        "X-Tenant-ID": tenantId,
      },
    });
  }

  async triggerAlert(alert: {
    tenantId: string;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    patientId?: string;
    message: string;
    metadata?: any;
  }): Promise<EdgeServiceResponse> {
    const url = `${this.config.realtimeMonitoringUrl}/api/v1/alerts`;

    return this.makeRequest(url, "realtimeMonitoring", {
      method: "POST",
      body: JSON.stringify(alert),
      headers: {
        "X-Tenant-ID": alert.tenantId,
      },
    });
  }

  // Health Check for all Edge Services
  async checkEdgeServicesHealth(): Promise<{
    analytics: EdgeServiceResponse;
    fileProcessing: EdgeServiceResponse;
    realtimeMonitoring: EdgeServiceResponse;
  }> {
    const [analytics, fileProcessing, realtimeMonitoring] = await Promise.allSettled([
      this.makeRequest(`${this.config.analyticsUrl}/health`, "analytics", { method: "GET" }),
      this.makeRequest(`${this.config.fileProcessingUrl}/health`, "fileProcessing", {
        method: "GET",
      }),
      this.makeRequest(`${this.config.realtimeMonitoringUrl}/health`, "realtimeMonitoring", {
        method: "GET",
      }),
    ]);

    return {
      analytics:
        analytics.status === "fulfilled"
          ? analytics.value
          : {
              success: false,
              error: "Service unavailable",
              timestamp: new Date().toISOString(),
              processingTime: 0,
            },
      fileProcessing:
        fileProcessing.status === "fulfilled"
          ? fileProcessing.value
          : {
              success: false,
              error: "Service unavailable",
              timestamp: new Date().toISOString(),
              processingTime: 0,
            },
      realtimeMonitoring:
        realtimeMonitoring.status === "fulfilled"
          ? realtimeMonitoring.value
          : {
              success: false,
              error: "Service unavailable",
              timestamp: new Date().toISOString(),
              processingTime: 0,
            },
    };
  }

  // Get Circuit Breaker Status
  getCircuitBreakerStatus(): Record<string, string> {
    const status: Record<string, string> = {};

    this.circuitBreakers.forEach((breaker, service) => {
      status[service] = breaker.getState();
    });

    return status;
  }

  // Batch Operations for Performance
  async batchAnalyticsRequest(requests: AnalyticsRequest[]): Promise<EdgeServiceResponse[]> {
    const url = `${this.config.analyticsUrl}/api/v1/analytics/batch`;

    const response = await this.makeRequest(url, "analytics", {
      method: "POST",
      body: JSON.stringify({ requests }),
    });

    return response.success ? (response.data as EdgeServiceResponse[]) : [response];
  }

  async batchFileProcessing(requests: FileProcessingRequest[]): Promise<EdgeServiceResponse[]> {
    const url = `${this.config.fileProcessingUrl}/api/v1/process/batch`;

    const response = await this.makeRequest(url, "fileProcessing", {
      method: "POST",
      body: JSON.stringify({ requests }),
    });

    return response.success ? (response.data as EdgeServiceResponse[]) : [response];
  }

  // Configuration and Management
  updateConfig(newConfig: Partial<EdgeServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EdgeServiceConfig {
    return { ...this.config };
  }

  // Metrics for Monitoring
  getMetrics(): {
    circuitBreakers: Record<string, string>;
    config: EdgeServiceConfig;
    uptime: number;
  } {
    return {
      circuitBreakers: this.getCircuitBreakerStatus(),
      config: this.config,
      uptime: process.uptime(),
    };
  }
}

// Fastify Plugin for Edge Services Integration
export default async function edgeServicesPlugin(fastify: FastifyInstance) {
  const config: EdgeServiceConfig = {
    analyticsUrl: process.env.ANALYTICS_SERVICE_URL || "https://analytics.neonpro.com.br",
    fileProcessingUrl: process.env.FILE_PROCESSING_SERVICE_URL || "https://files.neonpro.com.br",
    realtimeMonitoringUrl:
      process.env.MONITORING_SERVICE_URL || "https://monitoring.neonpro.com.br",
    timeout: parseInt(process.env.EDGE_SERVICE_TIMEOUT || "30000"),
    retries: parseInt(process.env.EDGE_SERVICE_RETRIES || "3"),
    circuitBreaker: {
      enabled: process.env.CIRCUIT_BREAKER_ENABLED === "true",
      threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || "5"),
      resetTime: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIME || "60000"),
    },
  };

  const edgeServices = new EdgeServicesIntegration(config);

  // Register as Fastify decorator
  fastify.decorate("edgeServices", edgeServices);

  // Add health check endpoint for edge services
  fastify.get(
    "/health/edge-services",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
    },
    async (_request, reply) => {
      const health = await edgeServices.checkEdgeServicesHealth();
      const metrics = edgeServices.getMetrics();

      reply.send({
        success: true,
        timestamp: new Date().toISOString(),
        services: health,
        metrics,
      });
    },
  );
}
