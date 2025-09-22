/**
 * Comprehensive Test Suite for Structured Logging Service
 *
 * Tests healthcare-compliant structured logging with:
 * - LGPD compliance and PII redaction
 * - Healthcare workflow context tracking
 * - Performance optimization and batching
 * - Error handling and emergency protocols
 * - Integration with observability stack
 *
 * @testType Unit Testing
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  StructuredLogger,
  logger as defaultLogger,
  LogLevel,
  HealthcareContext,
  TechnicalContext,
  LGPDCompliance,
  LogEntry,
  StructuredLoggingConfig,
} from "../structured-logging";

// Mock console methods to prevent noise during tests
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

describe("Structured Logging Service", () => {
  let testLogger: StructuredLogger;
  let mockConfig: Partial<StructuredLoggingConfig>;

  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {}
    vi.spyOn(console, "warn").mockImplementation(() => {}
    vi.spyOn(console, "error").mockImplementation(() => {}

    // Basic test configuration
    mockConfig = {
      _service: "test-service",
      enabled: true,
      level: "debug" as LogLevel,
      outputs: {
        console: false, // Disable console output during tests
        file: false,
        remote: false,
        observability: false,
      },
      performance: {
        batchSize: 5,
        flushInterval: 1000,
        maxBufferSize: 100,
        enableAsync: false, // Disable async for predictable testing
      },
      healthcareCompliance: {
        enablePIIRedaction: true,
        enableAuditLogging: true,
        criticalEventAlerts: true,
        patientSafetyLogging: true,
      },
      lgpdCompliance: {
        dataRetentionDays: 365,
        requireExplicitConsent: false,
        anonymizeByDefault: true,
        enableDataMinimization: true,
      },
      integration: {
        endpoint: "/api/v1/test/logs",
        enableDistributedTracing: false,
        enableMetricsCorrelation: false,
      },
    };

    testLogger = new StructuredLogger(mockConfig as any
  }

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Clean up logger
    testLogger.destroy(
  }

  // ============================================================================
  // BASIC FUNCTIONALITY TESTS
  // ============================================================================

  describe("Basic Logging Functionality", () => {
    it("should create a logger instance with valid configuration", () => {
      const stats = testLogger.getStatistics(
      expect(stats.isInitialized).toBe(true);
      expect(stats.config._service).toBe("test-service"
      expect(stats.config.enabled).toBe(true);
    }

    it("should log messages at different levels", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.debug("Debug message"
      testLogger.info("Info message"
      testLogger.notice("Notice message"
      testLogger.warn("Warning message"
      testLogger.error("Error message"

      expect(logSpy).toHaveBeenCalledTimes(5
    }

    it("should respect minimum log level filtering", () => {
      const warnLogger = new StructuredLogger({
        ...mockConfig,
        level: "warn",
      } as any

      const logSpy = vi.spyOn(warnLogger as any, "addToBuffer"

      warnLogger.debug("Debug message"); // Should be filtered
      warnLogger.info("Info message"); // Should be filtered
      warnLogger.warn("Warning message"); // Should pass
      warnLogger.error("Error message"); // Should pass

      expect(logSpy).toHaveBeenCalledTimes(2
      warnLogger.destroy(
    }

    it("should generate unique log entry IDs", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Message 1"
      testLogger.info("Message 2"

      expect(logSpy).toHaveBeenCalledTimes(2

      const call1 = logSpy.mock.calls[0][0] as LogEntry;
      const call2 = logSpy.mock.calls[1][0] as LogEntry;

      expect(call1.id).toBeDefined(
      expect(call2.id).toBeDefined(
      expect(call1.id).not.toBe(call2.id
      expect(call1.id).toMatch(/^log_/
      expect(call2.id).toMatch(/^log_/
    }
  }

  // ============================================================================
  // HEALTHCARE CONTEXT TESTS
  // ============================================================================

  describe("Healthcare Context Integration", () => {
    it("should handle healthcare workflow context", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      const healthcareContext: HealthcareContext = {
        workflowType: "patient_registration",
        workflowStage: "identity_verification",
        patientContext: {
          anonymizedPatientId: "anon_patient_123",
          ageGroup: "adult",
          criticalityLevel: "routine",
          hasAllergies: false,
          isEmergencyCase: false,
        },
        professionalContext: {
          anonymizedProfessionalId: "anon_prof_456",
          _role: "nurse",
          specialization: "emergency_care",
          department: "emergency",
        },
      };

      testLogger.info(
        "Patient registration started",
        {},
        { healthcare: healthcareContext },
      

      expect(logSpy).toHaveBeenCalledTimes(1
      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.healthcareContext).toEqual(healthcareContext
      expect(logEntry.tags).toContain("workflow:patient_registration"
      expect(logEntry.tags).toContain("criticality:routine"
    }

    it("should log patient safety events correctly", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"
      const flushSpy = vi.spyOn(testLogger as any, "flush"

      const healthcareContext: HealthcareContext = {
        workflowType: "medication_management",
        patientContext: {
          anonymizedPatientId: "anon_patient_789",
          criticalityLevel: "critical",
          isEmergencyCase: true,
        },
      };

      testLogger.logPatientSafetyEvent(
        "Medication allergy detected",
        "critical",
        healthcareContext,
        { medicationId: "med_123", allergyType: "severe" },
      

      expect(logSpy).toHaveBeenCalledTimes(1
      expect(flushSpy).toHaveBeenCalledTimes(1); // Critical events trigger immediate flush

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;
      expect(logEntry.level).toBe("alert"
      expect(logEntry.message).toContain("[PATIENT SAFETY]"
      expect(logEntry.data?.patientSafetyEvent).toBe(true);
      expect(logEntry.data?.severity).toBe("critical"
    }

    it("should log clinical workflow events", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.logClinicalWorkflow(
        "medical_consultation",
        "diagnosis_phase",
        "Diagnostic imaging requested",
        { imagingType: "xray", urgency: "routine" },
      

      expect(logSpy).toHaveBeenCalledTimes(1
      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.message).toContain("[WORKFLOW:MEDICAL_CONSULTATION]"
      expect(logEntry.healthcareContext?.workflowType).toBe(
        "medical_consultation",
      
      expect(logEntry.healthcareContext?.workflowStage).toBe("diagnosis_phase"
    }

    it("should log medication events with proper classification", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"
      const flushSpy = vi.spyOn(testLogger as any, "flush"

      const healthcareContext: HealthcareContext = {
        workflowType: "medication_management",
        patientContext: {
          anonymizedPatientId: "anon_patient_101",
        },
      };

      // Normal medication administration
      testLogger.logMedicationEvent(
        "administered",
        "Medication administered successfully",
        healthcareContext,
        { medicationId: "med_456", dosage: "5mg" },
      

      // Adverse reaction
      testLogger.logMedicationEvent(
        "adverse_reaction",
        "Patient experienced mild nausea",
        healthcareContext,
        { medicationId: "med_456", reactionType: "gastrointestinal" },
      

      expect(logSpy).toHaveBeenCalledTimes(2
      expect(flushSpy).toHaveBeenCalledTimes(1); // Only adverse reaction triggers flush

      const normalLog = logSpy.mock.calls[0][0] as LogEntry;
      const adverseLog = logSpy.mock.calls[1][0] as LogEntry;

      expect(normalLog.level).toBe("info"
      expect(adverseLog.level).toBe("alert"
      expect(adverseLog.message).toContain("[MEDICATION:ADVERSE_REACTION]"
    }

    it("should log emergency response events with timing", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      const healthcareContext: HealthcareContext = {
        workflowType: "emergency_response",
        patientContext: {
          isEmergencyCase: true,
          criticalityLevel: "emergency",
        },
      };

      // Fast response (under 30 seconds)
      testLogger.logEmergencyResponse(
        "code_blue_response",
        15000, // 15 seconds
        "Emergency team dispatched",
        healthcareContext,
      

      // Slow response (over 30 seconds)
      testLogger.logEmergencyResponse(
        "code_blue_response",
        45000, // 45 seconds
        "Emergency team delayed",
        healthcareContext,
      

      expect(logSpy).toHaveBeenCalledTimes(2

      const fastLog = logSpy.mock.calls[0][0] as LogEntry;
      const slowLog = logSpy.mock.calls[1][0] as LogEntry;

      expect(fastLog.level).toBe("alert"
      expect(slowLog.level).toBe("critical"); // Delayed response is critical
    }
  }

  // ============================================================================
  // LGPD COMPLIANCE AND PII REDACTION TESTS
  // ============================================================================

  describe("LGPD Compliance and PII Redaction", () => {
    it("should detect and redact CPF numbers", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Patient CPF: 123.456.789-00 registered", {
        patientData: {
          cpf: "12345678900",
          name: "Patient Name",
        },
      }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.message).toContain("[REDACTED]"
      expect(logEntry.message).not.toContain("123.456.789-00"
      expect(logEntry.data?.patientData?.cpf).toBe("[REDACTED]"
      expect(logEntry.data?.patientData?.name).toBe("[REDACTED]"
    }

    it("should detect and redact email addresses", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("User email: patient@example.com submitted form", {
        email: "patient@example.com",
      }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.message).toContain("[REDACTED]"
      expect(logEntry.message).not.toContain("patient@example.com"
      expect(logEntry.data?.email).toBe("[REDACTED]"
    }

    it("should detect and redact phone numbers", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Patient phone: (11) 99999-9999", {
        phone: "11999999999",
      }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.message).toContain("[REDACTED]"
      expect(logEntry.data?.phone).toBe("[REDACTED]"
    }

    it("should detect and redact passwords and tokens", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Authentication failed", {
        password: "secret123",
        token: "jwt_token_here",
        authDetails: "password=secret123 token=abc123",
      }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.data?.password).toBe("[REDACTED]"
      expect(logEntry.data?.token).toBe("[REDACTED]"
      expect(logEntry.data?.authDetails).toContain("[REDACTED]"
    }

    it("should determine correct LGPD compliance metadata", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      // Log with patient context (should be confidential)
      testLogger.info(
        "Patient data processed",
        {},
        {
          healthcare: {
            patientContext: {
              anonymizedPatientId: "anon_123",
            },
          },
        },
      

      // Emergency log (should be restricted)
      testLogger.emergency("Life-threatening emergency"

      expect(logSpy).toHaveBeenCalledTimes(2

      const patientLog = logSpy.mock.calls[0][0] as LogEntry;
      const emergencyLog = logSpy.mock.calls[1][0] as LogEntry;

      expect(patientLog.lgpdCompliance.dataClassification).toBe("confidential"
      expect(patientLog.lgpdCompliance.auditRequired).toBe(true);
      expect(patientLog.lgpdCompliance.legalBasis).toBe("legitimate_interests"

      expect(emergencyLog.lgpdCompliance.dataClassification).toBe("restricted"
      expect(emergencyLog.lgpdCompliance.auditRequired).toBe(true);
    }

    it("should handle PII detection correctly", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      // Log without PII
      testLogger.info("System status normal", { status: "ok" }

      // Log with PII
      testLogger.info("User action", { email: "user@example.com" }

      expect(logSpy).toHaveBeenCalledTimes(2

      const normalLog = logSpy.mock.calls[0][0] as LogEntry;
      const piiLog = logSpy.mock.calls[1][0] as LogEntry;

      expect(normalLog.lgpdCompliance.containsPII).toBe(false);
      expect(piiLog.lgpdCompliance.containsPII).toBe(true);
    }
  }

  // ============================================================================
  // PERFORMANCE AND BATCHING TESTS
  // ============================================================================

  describe("Performance and Batching", () => {
    it("should buffer logs until batch size is reached", () => {
      const flushSpy = vi.spyOn(testLogger as any, "flush"

      // Log 4 messages (below batch size of 5)
      for (let i = 0; i < 4; i++) {
        testLogger.info(`Message ${i}`
      }

      expect(flushSpy).not.toHaveBeenCalled(

      // Log 5th message (reaches batch size)
      testLogger.info("Message 4"

      expect(flushSpy).toHaveBeenCalledTimes(1
    }

    it("should flush immediately for critical events", () => {
      const flushSpy = vi.spyOn(testLogger as any, "flush"

      testLogger.critical("Critical system failure"
      expect(flushSpy).toHaveBeenCalledTimes(1

      testLogger.alert("Patient safety alert"
      expect(flushSpy).toHaveBeenCalledTimes(2

      testLogger.emergency("Emergency situation"
      expect(flushSpy).toHaveBeenCalledTimes(3
    }

    it("should manage buffer overflow correctly", () => {
      const warnSpy = vi.spyOn(console, "warn"

      // Create logger with very small buffer
      const smallBufferLogger = new StructuredLogger({
        ...mockConfig,
        performance: {
          batchSize: 2,
          maxBufferSize: 3,
          flushInterval: 10000,
          enableAsync: false,
        },
      } as any

      // Fill buffer beyond capacity
      for (let i = 0; i < 5; i++) {
        smallBufferLogger.info(`Message ${i}`
      }

      expect(warnSpy).toHaveBeenCalledWith(
        "Log buffer overflow, dropping oldest entries",
      

      smallBufferLogger.destroy(
    }

    it("should provide accurate statistics", () => {
      // Add some logs to buffer
      testLogger.info("Message 1"
      testLogger.info("Message 2"

      const stats = testLogger.getStatistics(

      expect(stats.bufferSize).toBe(2
      expect(stats.isInitialized).toBe(true);
      expect(stats.config._service).toBe("test-service"
    }
  }

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("Error Handling", () => {
    it("should handle Error objects correctly", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"
      const testError = new Error("Test error"
      testError.stack = "Error stack trace";

      testLogger.error("Operation failed", testError, { operation: "test" }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.error).toBeDefined(
      expect(logEntry.error?.name).toBe("Error"
      expect(logEntry.error?.message).toBe("Test error"
      expect(logEntry.error?.stack).toBe("Error stack trace"
    }

    it("should handle custom error objects", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"
      const customError = {
        name: "CustomError",
        message: "Custom error message",
        code: "CUSTOM_001",
      };

      testLogger.error("Custom error occurred", customError as any, {
        _context: "custom",
      }

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.error?.name).toBe("CustomError"
      expect(logEntry.error?.code).toBe("CUSTOM_001"
    }

    it("should continue logging even if individual log processing fails", () => {
      const errorSpy = vi.spyOn(console, "error"

      // Mock a failure in log processing
      const originalCreateLogEntry = (testLogger as any).createLogEntry;
      (testLogger as any).createLogEntry = vi.fn().mockImplementation(() => {
        throw new Error("Log processing failed"
      }

      testLogger.info("This should fail silently"

      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to log message:",
        expect.any(Error),
      

      // Restore original method
      (testLogger as any).createLogEntry = originalCreateLogEntry;
    }
  }

  // ============================================================================
  // TECHNICAL CONTEXT TESTS
  // ============================================================================

  describe("Technical Context Integration", () => {
    it("should include technical context in log entries", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      const technicalContext: Partial<TechnicalContext> = {
        requestId: "req_123",
        sessionId: "session_456",
        correlationId: "corr_789",
        traceId: "trace_abc",
        spanId: "span_def",
        performance: {
          duration: 150,
          memoryUsage: 64,
          cpuUsage: 25,
        },
      };

      testLogger.info(
        "API request processed",
        { endpoint: "/api/patients" },
        {
          technical: technicalContext,
        },
      

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.technicalContext.requestId).toBe("req_123"
      expect(logEntry.technicalContext.sessionId).toBe("session_456"
      expect(logEntry.technicalContext.correlationId).toBe("corr_789"
      expect(logEntry.technicalContext.traceId).toBe("trace_abc"
      expect(logEntry.technicalContext.spanId).toBe("span_def"
      expect(logEntry.technicalContext.performance?.duration).toBe(150
    }

    it("should generate request and thread IDs when not provided", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Message without context"

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.technicalContext.requestId).toMatch(/^req_/
      expect(logEntry.processingMetadata?.threadId).toMatch(/^thread_/
    }

    it("should include environment and service information", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Environment test"

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.technicalContext._service).toBe("test-service"
      expect(logEntry.technicalContext.environment).toBeDefined(
      expect(logEntry.processingMetadata?.source).toBe("test-service"
    }
  }

  // ============================================================================
  // TAG GENERATION TESTS
  // ============================================================================

  describe("Tag Generation", () => {
    it("should generate appropriate tags based on context", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.warn(
        "Warning message",
        {},
        {
          healthcare: {
            workflowType: "emergency_response",
            patientContext: {
              criticalityLevel: "critical",
            },
          },
          technical: {
            environment: "production",
          },
        },
      

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.tags).toContain("warn"
      expect(logEntry.tags).toContain("workflow:emergency_response"
      expect(logEntry.tags).toContain("criticality:critical"
      expect(logEntry.tags).toContain("env:production"
    }

    it("should handle missing context gracefully in tag generation", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      testLogger.info("Simple message"

      const logEntry = logSpy.mock.calls[0][0] as LogEntry;

      expect(logEntry.tags).toContain("info"
      expect(logEntry.tags.length).toBe(1); // Only level tag
    }
  }

  // ============================================================================
  // LOGGER LIFECYCLE TESTS
  // ============================================================================

  describe("Logger Lifecycle", () => {
    it("should initialize correctly with default configuration", () => {
      const stats = defaultLogger.getStatistics(

      expect(stats.isInitialized).toBe(true);
      expect(stats.config._service).toBe("neonpro-platform"
      expect(stats.config.healthcareCompliance.enablePIIRedaction).toBe(true);
    }

    it("should destroy logger and clean up resources", () => {
      const stats1 = testLogger.getStatistics(
      expect(stats1.isInitialized).toBe(true);

      testLogger.destroy(

      const stats2 = testLogger.getStatistics(
      expect(stats2.isInitialized).toBe(false);
      expect(stats2.bufferSize).toBe(0
    }

    it("should handle disabled logger gracefully", () => {
      const disabledLogger = new StructuredLogger({
        ...mockConfig,
        enabled: false,
      } as any

      const stats = disabledLogger.getStatistics(

      // Should create logger instance but not initialize
      expect(stats.config.enabled).toBe(false);

      disabledLogger.destroy(
    }
  }

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Scenarios", () => {
    it("should handle complete patient consultation workflow", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"

      const patientContext = {
        anonymizedPatientId: "anon_patient_workflow_001",
        ageGroup: "adult" as const,
        criticalityLevel: "routine" as const,
      };

      const professionalContext = {
        anonymizedProfessionalId: "anon_prof_001",
        _role: "doctor",
        specialization: "general_practice",
      };

      // 1. Patient registration
      testLogger.logClinicalWorkflow(
        "patient_registration",
        "identity_verification",
        "Patient identity verified successfully",
        { verificationType: "document" },
        {
          healthcare: {
            patientContext,
            professionalContext,
          },
        },
      

      // 2. Appointment start
      testLogger.logClinicalWorkflow(
        "medical_consultation",
        "consultation_start",
        "Medical consultation initiated",
        { appointmentId: "apt_001" },
        {
          healthcare: {
            patientContext,
            professionalContext,
          },
        },
      

      // 3. Medication prescribed
      testLogger.logMedicationEvent(
        "prescribed",
        "Medication prescribed for hypertension",
        {
          workflowType: "medication_management",
          patientContext,
          professionalContext,
        },
        { medicationId: "med_hypertension_001", dosage: "10mg" },
      

      expect(logSpy).toHaveBeenCalledTimes(3

      // Verify all logs have consistent patient context
      const logs = logSpy.mock.calls.map((call) => call[0] as LogEntry
      logs.forEach((log) => {
        expect(log.healthcareContext?.patientContext?.anonymizedPatientId).toBe(
          "anon_patient_workflow_001",
        
        expect(log.lgpdCompliance.containsPII).toBe(false); // Should be anonymized
        expect(log.lgpdCompliance.dataClassification).toBe("confidential"
      }
    }

    it("should handle emergency scenario with proper escalation", () => {
      const logSpy = vi.spyOn(testLogger as any, "addToBuffer"
      const flushSpy = vi.spyOn(testLogger as any, "flush"

      const emergencyContext: HealthcareContext = {
        workflowType: "emergency_response",
        patientContext: {
          anonymizedPatientId: "anon_emergency_001",
          criticalityLevel: "emergency",
          isEmergencyCase: true,
        },
      };

      // 1. Emergency detected
      testLogger.alert(
        "Cardiac arrest detected",
        {
          vitalSigns: { heartRate: 0, bloodPressure: "0/0" },
        },
        { healthcare: emergencyContext },
      

      // 2. Emergency response
      testLogger.logEmergencyResponse(
        "code_blue_activated",
        5000, // 5 seconds response time
        "Code blue team activated",
        emergencyContext,
        { teamSize: 4, equipment: ["defibrillator", "oxygen"] },
      

      // 3. Critical medication administered
      testLogger.logMedicationEvent(
        "administered",
        "Emergency epinephrine administered",
        emergencyContext,
        { medicationId: "epi_emergency", route: "IV", dosage: "1mg" },
      

      expect(logSpy).toHaveBeenCalledTimes(3
      expect(flushSpy).toHaveBeenCalledTimes(3); // All should trigger immediate flush

      const logs = logSpy.mock.calls.map((call) => call[0] as LogEntry
      logs.forEach((log) => {
        expect(["alert", "critical"]).toContain(log.level
        expect(log.lgpdCompliance.dataClassification).toBe("restricted"
        expect(log.lgpdCompliance.auditRequired).toBe(true);
      }
    }
  }
}
