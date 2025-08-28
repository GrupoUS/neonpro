// AI Services Integration Tests
// Comprehensive testing for Universal AI Chat, Compliance Automation, and Conversation Management

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import TestIntegrationSetup, {
  TEST_CONFIG,
  TestDataFactory,
  TestPerformanceMonitor,
} from "./integration-test-setup";

// AI Services Test Configuration
const AI_TEST_CONFIG = {
  chat: {
    max_response_time_ms: 2000,
    min_response_length: 10,
    safety_check_required: true,
  },
  compliance: {
    max_processing_time_ms: 1000,
    violation_detection_accuracy: 0.95,
  },
  conversation: {
    max_analysis_time_ms: 1500,
    sentiment_accuracy_threshold: 0.8,
  },
  database: {
    max_query_time_ms: 200,
    concurrent_sessions: 10,
  },
};

// AI Services Test Data Factory
class AITestDataFactory extends TestDataFactory {
  static createMockChatSession(overrides: Partial<any> = {}) {
    return {
      id: `ai-session-${Date.now()}`,
      user_id: "test-user-123",
      title: "Test Healthcare Consultation",
      status: "active",
      language: "pt-BR",
      compliance_flags: {
        lgpd_compliant: true,
        sensitive_data_detected: false,
        emergency_keywords: false,
      },
      metadata: {
        specialty: "general",
        urgency: "normal",
        patient_context: true,
      },
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createMockChatMessage(overrides: Partial<any> = {}) {
    return {
      id: `ai-message-${Date.now()}`,
      session_id: "ai-session-123",
      role: "user" as const,
      content: "Estou sentindo dores no peito. O que devo fazer?",
      timestamp: new Date().toISOString(),
      metadata: {
        safety_score: 0.95,
        compliance_score: 0.98,
        urgency_detected: false,
      },
      ...overrides,
    };
  }

  static createMockComplianceRule(overrides: Partial<any> = {}) {
    return {
      id: `compliance-rule-${Date.now()}`,
      name: "LGPD Data Processing",
      category: "lgpd",
      description: "Validate LGPD compliance for patient data processing",
      conditions: {
        data_types: ["personal_data", "health_data"],
        operations: ["create", "update", "delete"],
        consent_required: true,
      },
      severity: "high",
      active: true,
      ...overrides,
    };
  }

  static createMockConversationAnalytics(overrides: Partial<any> = {}) {
    return {
      session_id: "ai-session-123",
      message_count: 8,
      duration_minutes: 15.5,
      sentiment_analysis: {
        overall_sentiment: "neutral",
        confidence: 0.85,
        emotions: ["concern", "hope"],
      },
      topic_analysis: {
        primary_topics: ["chest_pain", "symptoms", "emergency"],
        medical_keywords: ["dor", "peito", "coração"],
        urgency_indicators: ["preciso de ajuda", "é grave?"],
      },
      safety_assessment: {
        emergency_detected: false,
        suicide_risk: 0.05,
        violence_risk: 0.02,
        substance_abuse: 0.01,
      },
      compliance_status: {
        lgpd_violations: 0,
        anvisa_violations: 0,
        cfm_violations: 0,
      },
      ...overrides,
    };
  }
}

// Universal AI Chat Integration Tests
describe("universal AI Chat Integration", () => {
  let supabaseClient: unknown;
  let testSessionId: string;

  beforeAll(async () => {
    supabaseClient = createClient(
      TEST_CONFIG.supabase.test_project_url,
      TEST_CONFIG.supabase.test_service_role_key,
    );

    // Create test chat session
    const testSession = AITestDataFactory.createMockChatSession();
    const { data, error } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    if (error) {
      throw error;
    }
    testSessionId = data.id;
  });

  it("should create new chat session with proper LGPD compliance", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "chat_session_creation",
    );

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          user_id: "test-user-456",
          language: "pt-BR",
          context: {
            specialty: "cardiology",
            patient_id: "test-patient-789",
          },
        }),
      },
    );

    const duration = stopTimer();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.session_id).toBeDefined();
    expect(result.compliance_status.lgpd_compliant).toBeTruthy();
    expect(duration).toBeLessThan(AI_TEST_CONFIG.chat.max_response_time_ms);
  });

  it("should process healthcare chat messages with safety checks", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "chat_message_processing",
    );

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testSessionId,
          message: "Tenho dores no peito há 2 horas. Devo ir ao hospital?",
          context: {
            emergency_detection: true,
            compliance_check: true,
          },
        }),
      },
    );

    const duration = stopTimer();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.response).toBeDefined();
    expect(result.response.length).toBeGreaterThan(
      AI_TEST_CONFIG.chat.min_response_length,
    );
    expect(result.safety_assessment.emergency_score).toBeGreaterThan(0.7);
    expect(duration).toBeLessThan(AI_TEST_CONFIG.chat.max_response_time_ms);
  });

  it("should detect and handle emergency situations appropriately", async () => {
    const emergencyMessage =
      "SOCORRO! Estou tendo um infarto! Preciso de ajuda urgente!";

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testSessionId,
          message: emergencyMessage,
          context: {
            emergency_detection: true,
            priority: "critical",
          },
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.emergency_detected).toBeTruthy();
    expect(result.emergency_response.priority).toBe("critical");
    expect(result.emergency_response.instructions).toContain("192");
    expect(result.audit_logged).toBeTruthy();
  });

  it("should maintain conversation context across multiple messages", async () => {
    const messages = [
      "Tenho diabetes tipo 2",
      "Qual a minha glicemia ideal?",
      "E sobre exercícios físicos?",
    ];

    let lastResponse: unknown;

    for (const message of messages) {
      const response = await fetch(
        `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-jwt-token",
          },
          body: JSON.stringify({
            session_id: testSessionId,
            message,
            context: {
              maintain_context: true,
            },
          }),
        },
      );

      lastResponse = await response.json();

      expect(response.status).toBe(200);
      expect(lastResponse.success).toBeTruthy();
    }

    // Verify context awareness in final response
    expect(lastResponse.response.toLowerCase()).toContain("diabete");
    expect(lastResponse.context_maintained).toBeTruthy();
  });

  afterAll(async () => {
    // Cleanup test session
    await supabaseClient
      .from("ai_chat_sessions")
      .delete()
      .eq("id", testSessionId);
  });
});

// Compliance Automation Integration Tests
describe("compliance Automation Integration", () => {
  let _supabaseClient: unknown;

  beforeAll(async () => {
    _supabaseClient = createClient(
      TEST_CONFIG.supabase.test_project_url,
      TEST_CONFIG.supabase.test_service_role_key,
    );
  });

  it("should validate LGPD compliance for patient data operations", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "lgpd_compliance_check",
    );

    const testPatient = TestDataFactory.createMockPatient({
      lgpd_consent: true,
      lgpd_consent_date: new Date().toISOString(),
    });

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/compliance/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          operation: "data_processing",
          category: "lgpd",
          data: {
            patient: testPatient,
            processing_purpose: "medical_care",
            legal_basis: "consent",
          },
        }),
      },
    );

    const duration = stopTimer();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.compliance_status.lgpd_compliant).toBeTruthy();
    expect(result.violations).toHaveLength(0);
    expect(duration).toBeLessThan(
      AI_TEST_CONFIG.compliance.max_processing_time_ms,
    );
  });

  it("should detect LGPD violations for non-compliant operations", async () => {
    const nonCompliantPatient = TestDataFactory.createMockPatient({
      lgpd_consent: false,
      lgpd_consent_date: undefined,
    });

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/compliance/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          operation: "data_processing",
          category: "lgpd",
          data: {
            patient: nonCompliantPatient,
            processing_purpose: "medical_care",
            legal_basis: "consent",
          },
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.compliance_status.lgpd_compliant).toBeFalsy();
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0].category).toBe("lgpd");
    expect(result.violations[0].severity).toBe("high");
  });

  it("should validate ANVISA compliance for medical device operations", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/compliance/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          operation: "medical_device_usage",
          category: "anvisa",
          data: {
            device: {
              name: "Desfibrilador Automático",
              registration_number: "80146170015",
              category: "Class III",
              manufacturer: "Phillips Healthcare",
            },
            usage_context: {
              location: "Emergency Room",
              operator_certified: true,
              maintenance_valid: true,
            },
          },
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.compliance_status.anvisa_compliant).toBeTruthy();
    expect(result.device_validation.registration_valid).toBeTruthy();
  });

  it("should validate CFM compliance for telemedicine operations", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/compliance/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          operation: "telemedicine_consultation",
          category: "cfm",
          data: {
            doctor: {
              crm: "CRM-SP-123456",
              specialty: "Cardiologia",
              telemedicine_certified: true,
            },
            consultation: {
              type: "follow_up",
              duration_minutes: 30,
              patient_consent: true,
              digital_signature: true,
            },
          },
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.compliance_status.cfm_compliant).toBeTruthy();
    expect(result.telemedicine_validation.crm_valid).toBeTruthy();
    expect(result.telemedicine_validation.certification_valid).toBeTruthy();
  });

  it("should generate comprehensive compliance reports", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/compliance/report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          period: {
            start_date: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_date: new Date().toISOString(),
          },
          categories: ["lgpd", "anvisa", "cfm"],
          include_violations: true,
          include_recommendations: true,
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.report.summary).toBeDefined();
    expect(result.report.lgpd_compliance_rate).toBeGreaterThan(0.95);
    expect(result.report.violations).toBeDefined();
    expect(result.report.recommendations).toBeDefined();
  });
});

// Conversation Management Integration Tests
describe("conversation Management Integration", () => {
  let supabaseClient: unknown;
  let testConversationId: string;

  beforeAll(async () => {
    supabaseClient = createClient(
      TEST_CONFIG.supabase.test_project_url,
      TEST_CONFIG.supabase.test_service_role_key,
    );

    // Create test conversation data
    const testSession = AITestDataFactory.createMockChatSession();
    const { data, error } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    if (error) {
      throw error;
    }
    testConversationId = data.id;

    // Add test messages
    const testMessages = [
      AITestDataFactory.createMockChatMessage({
        session_id: testConversationId,
        role: "user",
        content: "Oi, estou preocupado com minha pressão arterial",
      }),
      AITestDataFactory.createMockChatMessage({
        session_id: testConversationId,
        role: "assistant",
        content:
          "Entendo sua preocupação. Pode me contar mais sobre os sintomas?",
      }),
      AITestDataFactory.createMockChatMessage({
        session_id: testConversationId,
        role: "user",
        content: "Tenho sentido tonturas e dor de cabeça",
      }),
    ];

    await supabaseClient.from("ai_chat_messages").insert(testMessages);
  });

  it("should analyze conversation sentiment and emotions", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "conversation_sentiment_analysis",
    );

    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testConversationId,
          analysis_type: "sentiment",
          include_emotions: true,
        }),
      },
    );

    const duration = stopTimer();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.sentiment_analysis.overall_sentiment).toBeDefined();
    expect(result.sentiment_analysis.confidence).toBeGreaterThan(
      AI_TEST_CONFIG.conversation.sentiment_accuracy_threshold,
    );
    expect(result.sentiment_analysis.emotions).toBeDefined();
    expect(duration).toBeLessThan(
      AI_TEST_CONFIG.conversation.max_analysis_time_ms,
    );
  });

  it("should extract medical topics and keywords", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testConversationId,
          analysis_type: "topics",
          language: "pt-BR",
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.topic_analysis.primary_topics).toBeDefined();
    expect(result.topic_analysis.medical_keywords).toContain(
      "pressão arterial",
    );
    expect(result.topic_analysis.urgency_indicators).toBeDefined();
  });

  it("should perform comprehensive safety assessment", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testConversationId,
          analysis_type: "safety",
          emergency_detection: true,
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.safety_assessment.emergency_detected).toBeDefined();
    expect(result.safety_assessment.suicide_risk).toBeLessThan(0.5);
    expect(result.safety_assessment.violence_risk).toBeLessThan(0.5);
    expect(result.safety_assessment.substance_abuse).toBeLessThan(0.5);
  });

  it("should generate conversation summary with key insights", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testConversationId,
          summary_type: "comprehensive",
          include_recommendations: true,
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.summary.main_topics).toBeDefined();
    expect(result.summary.patient_concerns).toBeDefined();
    expect(result.summary.recommendations).toBeDefined();
    expect(result.summary.follow_up_required).toBeDefined();
  });

  it("should validate conversation compliance across all regulations", async () => {
    const response = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/compliance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: testConversationId,
          regulations: ["lgpd", "anvisa", "cfm"],
          detailed_analysis: true,
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBeTruthy();
    expect(result.compliance_status.lgpd_violations).toBe(0);
    expect(result.compliance_status.anvisa_violations).toBe(0);
    expect(result.compliance_status.cfm_violations).toBe(0);
    expect(result.audit_trail_created).toBeTruthy();
  });

  afterAll(async () => {
    // Cleanup test conversation data
    await supabaseClient
      .from("ai_chat_messages")
      .delete()
      .eq("session_id", testConversationId);

    await supabaseClient
      .from("ai_chat_sessions")
      .delete()
      .eq("id", testConversationId);
  });
});

// AI Database Integration Tests
describe("aI Database Integration", () => {
  let supabaseClient: unknown;

  beforeAll(async () => {
    supabaseClient = createClient(
      TEST_CONFIG.supabase.test_project_url,
      TEST_CONFIG.supabase.test_service_role_key,
    );
  });

  it("should handle concurrent AI chat sessions", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "concurrent_sessions",
    );

    const sessionPromises = Array.from(
      { length: AI_TEST_CONFIG.database.concurrent_sessions },
      (_, i) => {
        const testSession = AITestDataFactory.createMockChatSession({
          user_id: `test-user-${i}`,
          title: `Concurrent Test Session ${i}`,
        });

        return supabaseClient
          .from("ai_chat_sessions")
          .insert(testSession)
          .select()
          .single();
      },
    );

    const results = await Promise.allSettled(sessionPromises);
    const duration = stopTimer();

    const successfulSessions = results.filter((r) => r.status === "fulfilled");

    expect(successfulSessions).toHaveLength(
      AI_TEST_CONFIG.database.concurrent_sessions,
    );
    expect(duration).toBeLessThan(
      AI_TEST_CONFIG.database.max_query_time_ms * 2,
    );

    // Cleanup
    const sessionIds = successfulSessions.map(
      (r) => (r as PromiseFulfilledResult<any>).value.data.id,
    );

    await supabaseClient.from("ai_chat_sessions").delete().in("id", sessionIds);
  });

  it("should enforce Row Level Security for AI data", async () => {
    // Test RLS with different user contexts
    const userClient = createClient(
      TEST_CONFIG.supabase.test_project_url,
      TEST_CONFIG.supabase.test_anon_key,
    );

    // Should not be able to access other users' sessions
    const { data, error } = await userClient
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", "different-user-123");

    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it("should maintain data integrity for AI services schema", async () => {
    // Test foreign key constraints
    const invalidMessage = {
      id: `invalid-message-${Date.now()}`,
      session_id: "non-existent-session",
      role: "user",
      content: "This should fail",
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("ai_chat_messages")
      .insert(invalidMessage);

    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it("should perform efficient queries on AI data with proper indexing", async () => {
    // Create test data for performance testing
    const testSession = AITestDataFactory.createMockChatSession();
    const { data: sessionData, error: sessionError } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "indexed_query_performance",
    );

    // Query that should use indexes
    const { data, error } = await supabaseClient
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", testSession.user_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    const duration = stopTimer();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(AI_TEST_CONFIG.database.max_query_time_ms);

    // Cleanup
    await supabaseClient
      .from("ai_chat_sessions")
      .delete()
      .eq("id", sessionData.id);
  });
});

// Comprehensive Integration Test Suite
describe("aI Services End-to-End Integration", () => {
  it("should complete full healthcare conversation flow with compliance", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "e2e_healthcare_conversation",
    );

    // Step 1: Create session
    const sessionResponse = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          user_id: "test-user-e2e",
          language: "pt-BR",
          context: { specialty: "general" },
        }),
      },
    );

    const sessionResult = await sessionResponse.json();
    expect(sessionResult.success).toBeTruthy();

    const { session_id: sessionId } = sessionResult;

    // Step 2: Send healthcare message
    const messageResponse = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/universal-chat/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message:
            "Tenho sentido muita fadiga e perdi peso sem motivo aparente",
        }),
      },
    );

    const messageResult = await messageResponse.json();
    expect(messageResult.success).toBeTruthy();

    // Step 3: Analyze conversation
    const analysisResponse = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: sessionId,
          analysis_type: "comprehensive",
        }),
      },
    );

    const analysisResult = await analysisResponse.json();
    expect(analysisResult.success).toBeTruthy();

    // Step 4: Validate compliance
    const complianceResponse = await fetch(
      `${TEST_CONFIG.api.test_api_base_url}/api/ai/conversation/compliance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt-token",
        },
        body: JSON.stringify({
          session_id: sessionId,
          regulations: ["lgpd", "cfm"],
        }),
      },
    );

    const complianceResult = await complianceResponse.json();
    expect(complianceResult.success).toBeTruthy();
    expect(complianceResult.compliance_status.lgpd_violations).toBe(0);

    const duration = stopTimer();
    expect(duration).toBeLessThan(AI_TEST_CONFIG.chat.max_response_time_ms * 4);
  });
});

// Setup and cleanup
TestIntegrationSetup.setupIntegrationTests();
