import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  IngestionConfig,
  IngestionResult,
  IngestionEvent,
  IngestionError,
  ValidationRule,
  TransformationRule,
  DataQualityAssessment,
  ComplianceValidationResult,
  StreamConfig,
  WebhookConfig,
  IngestionMonitoringMetrics,
  IngestionEventType,
  IngestionErrorType,
  isIngestionEvent,
  isIngestionConfig,
  isValidationRule,
} from "../types/ingestion";
import {
  IngestionAdapter,
  BaseIngestionAdapter,
  DatabaseIngestionAdapter,
  APIIngestionAdapter,
  HealthStatus,
} from "../adapters/ingestion-adapter";

describe("Ingestion Types and Adapters", () => {
  describe("Type Guards", () => {
    it("should validate IngestionEvent objects", () => {
      const validEvent: IngestionEvent = {
        id: "event_001",
        eventType: "data_received",
        timestamp: new Date(),
        source: {
          sourceId: "source_001",
          sourceType: "database",
          recordCount: 100,
          dataSize: 1024,
        },
        processing: {
          startTime: new Date(),
          status: "processing",
        },
        quality: {
          validRecords: 95,
          invalidRecords: 5,
          duplicateRecords: 2,
          transformedRecords: 93,
        },
        metadata: {},
        clinicId: "clinic_123",
        _userId: "user_456",
      };

      expect(isIngestionEvent(validEvent)).toBe(true);
      expect(isIngestionEvent({})).toBe(false);
      expect(isIngestionEvent(null)).toBe(false);
    }

    it("should validate IngestionConfig objects", () => {
      const validConfig: IngestionConfig = {
        sourceId: "db_source_001",
        sourceType: "database",
        processing: {
          batchSize: 1000,
          frequency: "hourly",
          validation: true,
          transformation: true,
          deduplication: true,
        },
        security: {
          encryption: true,
          anonymization: true,
          auditTrail: true,
          complianceFrameworks: ["LGPD", "ANVISA"],
        },
        errorHandling: {
          retryAttempts: 3,
          failureNotification: true,
          deadLetterQueue: true,
        },
      };

      expect(isIngestionConfig(validConfig)).toBe(true);
      expect(isIngestionConfig({})).toBe(false);
    }

    it("should validate ValidationRule objects", () => {
      const validRule: ValidationRule = {
        ruleId: "rule_001",
        description: "Required field validation",
        field: "patientId",
        type: "required",
        parameters: {},
        onError: "reject",
      };

      expect(isValidationRule(validRule)).toBe(true);
      expect(isValidationRule({})).toBe(false);
    }
  }

  describe("BaseIngestionAdapter", () => {
    let adapter: TestIngestionAdapter;
    let mockConfig: IngestionConfig;

    class TestIngestionAdapter extends BaseIngestionAdapter {
      async connect(): Promise<void> {
        this.isConnectedFlag = true;
      }

      async disconnect(): Promise<void> {
        this.isConnectedFlag = false;
      }

      async ingestBatch(data: any[]): Promise<IngestionResult> {
        const startTime = new Date(
        const operationId = `test_${Date.now()}`;

        return {
          operationId,
          status: "success",
          summary: {
            totalRecords: data.length,
            processedRecords: data.length,
            validRecords: data.length,
            invalidRecords: 0,
            errors: [],
            warnings: [],
          },
          metrics: [],
          events: [],
          timing: {
            startTime,
            endTime: new Date(),
            duration: 100,
            stages: { validation: 50, transformation: 30, storage: 20 },
          },
        };
      }

      async ingestStream(stream: ReadableStream): Promise<IngestionResult> {
        return this.ingestBatch([]
      }

      async getMetrics(): Promise<IngestionMonitoringMetrics> {
        return {
          period: { start: new Date(Date.now() - 3600000), end: new Date() },
          throughput: {
            recordsPerSecond: 100,
            bytesPerSecond: 1024,
            peakThroughput: 200,
            averageThroughput: 150,
          },
          performance: {
            averageLatency: 50,
            p95Latency: 100,
            p99Latency: 200,
            errorRate: 0.01,
            uptime: 99.9,
          },
          resources: {
            cpuUsage: 45,
            memoryUsage: 512,
            diskUsage: 1024,
            networkIO: 256,
          },
          quality: {
            dataQualityScore: 95,
            complianceScore: 98,
            validationSuccessRate: 99,
            transformationSuccessRate: 97,
          },
        };
      }
    }

    beforeEach(() => {
      mockConfig = {
        sourceId: "test_source",
        sourceType: "database",
        processing: {
          batchSize: 100,
          frequency: "hourly",
          validation: true,
          transformation: true,
          deduplication: true,
        },
        security: {
          encryption: true,
          anonymization: true,
          auditTrail: true,
          complianceFrameworks: ["LGPD"],
        },
        errorHandling: {
          retryAttempts: 3,
          failureNotification: true,
          deadLetterQueue: true,
        },
      };

      adapter = new TestIngestionAdapter("test_adapter", mockConfig
    }

    it("should initialize correctly", () => {
      expect(adapter.adapterId).toBe("test_adapter"
      expect(adapter.config).toBe(mockConfig
      expect(adapter.isConnected()).toBe(false);
    }

    it(_"should handle connection lifecycle",_async () => {
      expect(adapter.isConnected()).toBe(false);

      await adapter.connect(
      expect(adapter.isConnected()).toBe(true);

      await adapter.disconnect(
      expect(adapter.isConnected()).toBe(false);
    }

    it("should manage event listeners", () => {
      const mockHandler = vi.fn(
      const eventType: IngestionEventType = "data_received";

      adapter.addEventListener(eventType, mockHandler

      // Trigger an event
      const testEvent: IngestionEvent = {
        id: "test_event",
        eventType: "data_received",
        timestamp: new Date(),
        source: {
          sourceId: "test",
          sourceType: "test",
          recordCount: 1,
          dataSize: 100,
        },
        processing: { startTime: new Date(), status: "completed" },
        quality: {
          validRecords: 1,
          invalidRecords: 0,
          duplicateRecords: 0,
          transformedRecords: 1,
        },
        metadata: {},
        clinicId: "test_clinic",
        _userId: "test_user",
      };

      (adapter as any).emitEvent(testEvent
      expect(mockHandler).toHaveBeenCalledWith(testEvent

      adapter.removeEventListener(eventType, mockHandler
      (adapter as any).emitEvent(testEvent
      expect(mockHandler).toHaveBeenCalledTimes(1); // Should not be called again
    }

    it(_"should manage validation rules",_async () => {
      const validationRule: ValidationRule = {
        ruleId: "test_rule",
        description: "Test validation",
        field: "testField",
        type: "required",
        parameters: {},
        onError: "reject",
      };

      await adapter.addValidationRule(validationRule
      expect((adapter as any).validationRules).toContain(validationRule
    }

    it(_"should manage transformation rules",_async () => {
      const transformationRule: TransformationRule = {
        transformId: "test_transform",
        description: "Test transformation",
        sourceField: "source.field",
        targetField: "target.field",
        type: "map",
        logic: { mapping: { old: "new" } },
      };

      await adapter.addTransformationRule(transformationRule
      expect((adapter as any).transformationRules).toContain(
        transformationRule,
      
    }

    it(_"should provide health status",_async () => {
<<<<<<< HEAD
      const healthStatus = await adapter.getHealthStatus(
=======
      const healthStatus = await adapter.getHealthStatus();
>>>>>>> origin/main

      expect(healthStatus.status).toMatch(/^(healthy|degraded|unhealthy)$/
      expect(healthStatus.lastCheck).toBeInstanceOf(Date
      expect(healthStatus.details).toBeDefined(
      expect(Array.isArray(healthStatus.errors)).toBe(true);
    }

    it("should validate data using validation rules", () => {
      const testData = [
        { patientId: "P001", name: "John Doe" },
        { patientId: "", name: "Jane Doe" }, // Invalid: empty patientId
        { name: "Bob Smith" }, // Invalid: missing patientId
      ];

      const validationRule: ValidationRule = {
        ruleId: "patient_id_required",
        description: "Patient ID is required",
        field: "patientId",
        type: "required",
        parameters: {},
        onError: "reject",
      };

      (adapter as any).validationRules = [validationRule];
      const result = (adapter as any).validateData(testData

      expect(result.valid).toHaveLength(1
      expect(result.invalid).toHaveLength(2
      expect(result.errors).toHaveLength(2
    }

    it("should transform data using transformation rules", () => {
      const testData = [
        { oldField: "value1", otherField: "keep1" },
        { oldField: "value2", otherField: "keep2" },
      ];

      const transformationRule: TransformationRule = {
        transformId: "field_rename",
        description: "Rename field",
        sourceField: "oldField",
        targetField: "newField",
        type: "map",
        logic: {},
      };

      (adapter as any).transformationRules = [transformationRule];
      const result = (adapter as any).transformData(testData

      expect(result.transformed).toHaveLength(2
      expect(result.transformed[0]).toHaveProperty("newField"
      expect(result.transformed[0]).toHaveProperty("otherField", "keep1"
    }
  }

  describe("DatabaseIngestionAdapter", () => {
    let dbAdapter: DatabaseIngestionAdapter;
    let mockConfig: IngestionConfig;

    beforeEach(() => {
      mockConfig = {
        sourceId: "db_source",
        sourceType: "database",
        processing: {
          batchSize: 1000,
          frequency: "hourly",
          validation: true,
          transformation: false,
          deduplication: true,
        },
        security: {
          encryption: true,
          anonymization: false,
          auditTrail: true,
          complianceFrameworks: ["LGPD"],
        },
        errorHandling: {
          retryAttempts: 5,
          failureNotification: true,
          deadLetterQueue: true,
        },
      };

      dbAdapter = new DatabaseIngestionAdapter("db_adapter", mockConfig
    }

    it(_"should connect to database source",_async () => {
      expect(dbAdapter.isConnected()).toBe(false);

      await dbAdapter.connect(
      expect(dbAdapter.isConnected()).toBe(true);
    }

    it(_"should ingest batch data",_async () => {
<<<<<<< HEAD
      await dbAdapter.connect(
=======
      await dbAdapter.connect();
>>>>>>> origin/main

      const testData = [
        { id: 1, name: "Record 1" },
        { id: 2, name: "Record 2" },
      ];

      const result = await dbAdapter.ingestBatch(testData

      expect(result.status).toMatch(/^(success|partial_success|failure)$/
      expect(result.summary.totalRecords).toBe(2
      expect(result.operationId).toBeDefined(
      expect(result.timing.duration).toBeGreaterThan(0
    }

    it(_"should provide database-specific metrics",_async () => {
<<<<<<< HEAD
      const metrics = await dbAdapter.getMetrics(
=======
      const metrics = await dbAdapter.getMetrics();
>>>>>>> origin/main

      expect(metrics.period).toBeDefined(
      expect(metrics.throughput.recordsPerSecond).toBeGreaterThan(0
      expect(metrics.performance.uptime).toBeGreaterThan(0
      expect(metrics.quality.dataQualityScore).toBeGreaterThan(0
    }
  }

  describe("APIIngestionAdapter", () => {
    let apiAdapter: APIIngestionAdapter;
    let mockConfig: IngestionConfig;

    beforeEach(() => {
      mockConfig = {
        sourceId: "api_source",
        sourceType: "api",
        processing: {
          batchSize: 500,
          frequency: "realtime",
          validation: true,
          transformation: true,
          deduplication: false,
        },
        security: {
          encryption: true,
          anonymization: true,
          auditTrail: true,
          complianceFrameworks: ["LGPD", "ANVISA"],
        },
        errorHandling: {
          retryAttempts: 3,
          failureNotification: true,
          deadLetterQueue: false,
        },
      };

      apiAdapter = new APIIngestionAdapter("api_adapter", mockConfig
    }

    it(_"should connect to API source",_async () => {
      expect(apiAdapter.isConnected()).toBe(false);

      await apiAdapter.connect(
      expect(apiAdapter.isConnected()).toBe(true);
    }

    it(_"should provide API-specific metrics",_async () => {
<<<<<<< HEAD
      const metrics = await apiAdapter.getMetrics(
=======
      const metrics = await apiAdapter.getMetrics();
>>>>>>> origin/main

      expect(metrics.throughput.recordsPerSecond).toBeGreaterThan(0
      expect(metrics.performance.errorRate).toBeGreaterThanOrEqual(0
      expect(metrics.performance.errorRate).toBeLessThanOrEqual(1
    }
  }

  describe("Data Quality Assessment", () => {
    it("should assess data quality dimensions", () => {
      const assessment: DataQualityAssessment = {
        assessmentId: "quality_001",
        timestamp: new Date(),
        sourceId: "test_source",
        dimensions: {
          completeness: 95.5,
          accuracy: 92.0,
          consistency: 88.5,
          validity: 97.2,
          timeliness: 85.0,
        },
        overallScore: 91.6,
        issues: [
          {
            type: "missing_values",
            description: "Some required fields are missing",
            severity: "medium",
            field: "patientAge",
            count: 12,
          },
        ],
        recommendations: [
          "Implement field validation at source",
          "Add data completion checks",
        ],
      };

      expect(assessment.dimensions.completeness).toBeGreaterThan(90
      expect(assessment.overallScore).toBeGreaterThan(0
      expect(assessment.issues).toHaveLength(1
      expect(assessment.recommendations).toHaveLength(2
    }
  }

  describe("Compliance Validation", () => {
    it("should validate compliance with healthcare regulations", () => {
      const validation: ComplianceValidationResult = {
        validationId: "compliance_001",
        framework: "LGPD",
        status: "non_compliant",
        details: {
          rulesChecked: 25,
          rulesPassed: 20,
          rulesFailed: 3,
          warnings: 2,
        },
        violations: [
          {
            rule: "data_retention",
            description: "Data retention period not defined",
            severity: "high",
            remediation: "Define and implement data retention policy",
          },
        ],
        complianceScore: 80.0,
      };

      expect(validation.framework).toBe("LGPD"
      expect(validation.status).toMatch(/^(compliant|non_compliant|warning)$/
      expect(validation.complianceScore).toBeGreaterThan(0
      expect(validation.violations).toHaveLength(1
    }
  }

  describe("Error Handling", () => {
    it("should handle and categorize ingestion errors", () => {
      const error: IngestionError = {
        errorId: "error_001",
        type: "validation_error",
        message: "Required field missing: patientId",
        source: {
          sourceId: "test_source",
          recordId: "record_123",
          field: "patientId",
        },
        _context: {
          operation: "validation",
          timestamp: new Date(),
          retryCount: 0,
        },
        recovery: {
          recoverable: true,
          suggestions: [
            "Add default value",
            "Skip record",
            "Request manual input",
          ],
        },
      };

      expect(error.type).toBe("validation_error"
      expect(error.recovery?.recoverable).toBe(true);
      expect(error.recovery?.suggestions).toHaveLength(3
    }

    it("should handle different error types", () => {
      const errorTypes: IngestionErrorType[] = [
        "connection_error",
        "authentication_error",
        "validation_error",
        "transformation_error",
        "storage_error",
        "compliance_error",
        "timeout_error",
        "resource_error",
        "unknown_error",
      ];

      errorTypes.forEach((errorType) => {
        expect(typeof errorType).toBe("string"
      }
    }
  }

  describe("Monitoring Metrics", () => {
    it("should track comprehensive monitoring metrics", () => {
      const metrics: IngestionMonitoringMetrics = {
        period: {
          start: new Date(Date.now() - 3600000), // 1 hour ago
          end: new Date(),
        },
        throughput: {
          recordsPerSecond: 150.5,
          bytesPerSecond: 2048,
          peakThroughput: 300,
          averageThroughput: 175,
        },
        performance: {
          averageLatency: 45,
          p95Latency: 120,
          p99Latency: 250,
          errorRate: 0.025,
          uptime: 99.8,
        },
        resources: {
          cpuUsage: 42.5,
          memoryUsage: 768,
          diskUsage: 1536,
          networkIO: 512,
        },
        quality: {
          dataQualityScore: 94.2,
          complianceScore: 97.8,
          validationSuccessRate: 98.5,
          transformationSuccessRate: 96.2,
        },
      };

      expect(metrics.throughput.recordsPerSecond).toBeGreaterThan(0
      expect(metrics.performance.uptime).toBeGreaterThan(95
      expect(metrics.quality.dataQualityScore).toBeGreaterThan(90
    }
  }

  describe("Stream Configuration", () => {
    it("should configure real-time data streams", () => {
      const streamConfig: StreamConfig = {
        streamId: "patient_vitals_stream",
        source: {
          type: "websocket",
          endpoint: "wss://api.example.com/vitals",
          authentication: {
            token: "bearer_token_here",
          },
        },
        processing: {
          messageFormat: "json",
          batchProcessing: true,
          batchSize: 50,
          bufferTime: 5000, // 5 seconds
        },
        reliability: {
          acknowledgments: true,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: "exponential",
            baseDelay: 1000,
          },
          deadLetterHandling: true,
        },
      };

      expect(streamConfig.source.type).toBe("websocket"
      expect(streamConfig.processing.batchProcessing).toBe(true);
      expect(streamConfig.reliability.acknowledgments).toBe(true);
    }
  }

  describe("Webhook Configuration", () => {
    it("should configure webhook endpoints for external systems", () => {
      const webhookConfig: WebhookConfig = {
        webhookId: "compliance_alerts",
        endpoint: {
          url: "https://external-system.com/webhooks/compliance",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Version": "v1",
          },
          authentication: {
            type: "bearer",
            credentials: {
              token: "webhook_auth_token",
            },
          },
        },
        triggers: {
          eventTypes: ["compliance_error", "validation_failed"],
          conditions: {
            severity: "high",
          },
        },
        delivery: {
          retryAttempts: 5,
          timeout: 30000,
          retryDelay: 2000,
        },
      };

      expect(webhookConfig.endpoint.method).toBe("POST"
      expect(webhookConfig.triggers.eventTypes).toContain("compliance_error"
      expect(webhookConfig.delivery.retryAttempts).toBe(5
    }
  }
}
