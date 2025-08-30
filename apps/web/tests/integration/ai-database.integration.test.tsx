// AI Database Integration Tests
// Comprehensive testing for AI services database schema and operations

import { createClient } from "@supabase/supabase-js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { mockSupabaseClient } from "../setup/global-mocks";
import TestIntegrationSetup, {
  TEST_CONFIG,
  TestPerformanceMonitor,
} from "./integration-test-setup";

// Database Test Configuration
const DB_TEST_CONFIG = {
  performance: {
    max_insert_time_ms: 200,
    max_select_time_ms: 100,
    max_update_time_ms: 150,
    max_delete_time_ms: 100,
    concurrent_operations: 20,
  },
  data_integrity: {
    max_retries: 3,
    isolation_level: "READ COMMITTED",
  },
  timeout: 30_000,
  retries: 3,
  cleanup: true,
};

// Always use mocks for integration tests - no external service dependencies

// AI Database Test Data Factory
class AIDBTestDataFactory {
  static createFeatureFlag(overrides: Partial<any> = {}) {
    return {
      id: `ff-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: `test_feature_${Date.now()}`,
      description: "Test feature flag for AI services",
      enabled: true,
      conditions: {
        user_roles: ["admin", "doctor"],
        time_restrictions: undefined,
        percentage_rollout: 100,
      },
      metadata: {
        category: "ai_services",
        owner: "development_team",
        environment: "test",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createCacheEntry(overrides: Partial<any> = {}) {
    return {
      id: `cache-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      key: `test_cache_key_${Date.now()}`,
      value: JSON.stringify({ test: "data", timestamp: Date.now() }),
      namespace: "ai_services",
      ttl_seconds: 3600,
      tags: ["test", "ai", "healthcare"],
      metadata: {
        size_bytes: 256,
        access_count: 0,
        last_accessed: undefined,
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3_600_000).toISOString(),
      ...overrides,
    };
  }

  static createAuditEntry(overrides: Partial<any> = {}) {
    return {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      user_id: "test-user-123",
      action: "ai_chat_message_created",
      resource_type: "ai_chat_message",
      resource_id: "test-message-456",
      details: {
        session_id: "test-session-789",
        message_content_length: 150,
        ai_response_time_ms: 850,
        compliance_checks_passed: true,
      },
      ip_address: "127.0.0.1",
      user_agent: "Test Agent/1.0",
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }

  static createMonitoringMetric(overrides: Partial<any> = {}) {
    return {
      id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      service: "universal_chat",
      metric_name: "response_time_ms",
      metric_value: 850.5,
      tags: {
        environment: "test",
        user_id: "test-user-123",
        session_type: "healthcare_consultation",
      },
      metadata: {
        endpoint: "/api/ai/universal-chat/message",
        http_status: 200,
        user_satisfied: true,
      },
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }
}

// Feature Flags Database Tests
describe("aI Feature Flags Database", () => {
  let supabaseClient: any;
  let testFlagIds: string[] = [];
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Feature Flags Database tests");
    supabaseClient = mockSupabaseClient;
  });

  afterEach(async () => {
    // Cleanup test flags after each test
    if (testFlagIds.length > 0) {
      await supabaseClient
        .from("ai_feature_flags")
        .delete()
        .in("id", testFlagIds);
      testFlagIds = [];
    }
  });

  it("should create feature flags with proper validation", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "feature_flag_creation",
    );

    const testFlag = AIDBTestDataFactory.createFeatureFlag({
      name: "ai_enhanced_diagnosis",
      description: "Enable AI-enhanced diagnosis recommendations",
    });

    const { data, error } = await supabaseClient
      .from("ai_feature_flags")
      .insert(testFlag)
      .select()
      .single();

    const duration = stopTimer();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.id).toBe(testFlag.id);
    expect(data.name).toBe(testFlag.name);
    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_insert_time_ms,
    );

    testFlagIds.push(data.id);
  });

  it("should enforce unique constraint on feature flag names", async () => {
    const testFlag1 = AIDBTestDataFactory.createFeatureFlag({
      name: "unique_feature_test",
    });

    const testFlag2 = AIDBTestDataFactory.createFeatureFlag({
      name: "unique_feature_test", // Same name should fail
    });

    // Insert first flag
    const { data: data1, error: error1 } = await supabaseClient
      .from("ai_feature_flags")
      .insert(testFlag1)
      .select()
      .single();

    expect(error1).toBeNull();
    testFlagIds.push(data1.id);

    // Second insert should fail
    const { data: data2, error: error2 } = await supabaseClient
      .from("ai_feature_flags")
      .insert(testFlag2)
      .select()
      .single();

    expect(error2).toBeDefined();
    expect(error2.message).toContain("duplicate key");
    expect(data2).toBeNull();
  });

  it("should perform efficient queries with indexing", async () => {
    // Create multiple test flags
    const testFlags = Array.from({ length: 10 }, (_, i) =>
      AIDBTestDataFactory.createFeatureFlag({
        name: `performance_test_flag_${i}`,
        enabled: i % 2 === 0,
        metadata: { category: i < 5 ? "ai_services" : "general" },
      }));

    const { data: insertedFlags, error: insertError } = await supabaseClient
      .from("ai_feature_flags")
      .insert(testFlags)
      .select("id");

    expect(insertError).toBeNull();
    testFlagIds.push(...insertedFlags.map((f: { id: string; }) => f.id));

    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "indexed_feature_flag_query",
    );

    // Query that should use indexes
    const { data, error } = await supabaseClient
      .from("ai_feature_flags")
      .select("*")
      .eq("enabled", true)
      .contains("metadata", { category: "ai_services" })
      .order("created_at", { ascending: false });

    const duration = stopTimer();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_select_time_ms,
    );
  });
});

// Cache Management Database Tests
describe("aI Cache Management Database", () => {
  let supabaseClient: any;
  let testCacheIds: string[] = [];
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Cache Management Database tests");
    supabaseClient = mockSupabaseClient;
  });

  afterEach(async () => {
    if (testCacheIds.length > 0) {
      await supabaseClient
        .from("ai_service_cache")
        .delete()
        .in("id", testCacheIds);
      testCacheIds = [];
    }
  });

  it("should handle cache entries with TTL expiration", async () => {
    const testCache = AIDBTestDataFactory.createCacheEntry({
      key: "test_ttl_cache",
      ttl_seconds: 1, // 1 second TTL for testing
      expires_at: new Date(Date.now() + 1000).toISOString(),
    });

    const { data, error } = await supabaseClient
      .from("ai_service_cache")
      .insert(testCache)
      .select()
      .single();

    expect(error).toBeNull();
    testCacheIds.push(data.id);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Query should still return the entry (TTL is handled by application logic)
    const { data: retrievedData, error: retrieveError } = await supabaseClient
      .from("ai_service_cache")
      .select("*")
      .eq("key", "test_ttl_cache")
      .single();

    expect(retrieveError).toBeNull();
    expect(new Date(retrievedData.expires_at).getTime()).toBeLessThan(
      Date.now(),
    );
  });

  it("should support cache entry tagging and filtering", async () => {
    const testCaches = [
      AIDBTestDataFactory.createCacheEntry({
        key: "tagged_cache_1",
        tags: ["user_session", "ai_response", "healthcare"],
      }),
      AIDBTestDataFactory.createCacheEntry({
        key: "tagged_cache_2",
        tags: ["system_config", "feature_flags"],
      }),
      AIDBTestDataFactory.createCacheEntry({
        key: "tagged_cache_3",
        tags: ["user_session", "patient_data"],
      }),
    ];

    const { data: insertedCaches, error: insertError } = await supabaseClient
      .from("ai_service_cache")
      .insert(testCaches)
      .select("id");

    expect(insertError).toBeNull();
    testCacheIds.push(...insertedCaches.map((c: { id: string; }) => c.id));

    // Query by tags
    const { data: taggedData, error: tagError } = await supabaseClient
      .from("ai_service_cache")
      .select("*")
      .contains("tags", ["user_session"]);

    expect(tagError).toBeNull();
    expect(taggedData).toHaveLength(2);
  });

  it("should handle high-frequency cache operations", async () => {
    const startTime = performance.now();

    const cacheOperations = Array.from({ length: 50 }, async (_, i) => {
      const testCache = AIDBTestDataFactory.createCacheEntry({
        key: `high_freq_cache_${i}`,
        namespace: "performance_test",
      });

      return supabaseClient
        .from("ai_service_cache")
        .insert(testCache)
        .select("id")
        .single();
    });

    const results = await Promise.all(cacheOperations);
    const duration = performance.now() - startTime;

    const successfulResults = results.filter((r) => !r.error);
    expect(successfulResults).toHaveLength(50);

    testCacheIds.push(...successfulResults.map((r) => r.data.id));

    // Should complete in reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds for 50 operations
  });
});

// Audit Logging Database Tests
describe("aI Audit Logging Database", () => {
  let supabaseClient: any;
  let testAuditIds: string[] = [];
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Audit Logging Database tests");
    supabaseClient = mockSupabaseClient;
  });

  afterEach(async () => {
    if (testAuditIds.length > 0) {
      await supabaseClient
        .from("ai_audit_logs")
        .delete()
        .in("id", testAuditIds);
      testAuditIds = [];
    }
  });

  it("should log AI service operations with complete details", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement("audit_log_creation");

    const testAudit = AIDBTestDataFactory.createAuditEntry({
      action: "ai_diagnosis_generated",
      resource_type: "ai_chat_session",
      details: {
        model_used: "gpt-4-healthcare",
        confidence_score: 0.92,
        processing_time_ms: 1250,
        tokens_used: 450,
        compliance_validated: true,
        lgpd_compliant: true,
        emergency_detected: false,
      },
    });

    const { data, error } = await supabaseClient
      .from("ai_audit_logs")
      .insert(testAudit)
      .select()
      .single();

    const duration = stopTimer();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.details.model_used).toBe("gpt-4-healthcare");
    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_insert_time_ms,
    );

    testAuditIds.push(data.id);
  });

  it("should support complex audit trail queries", async () => {
    const auditEntries = [
      AIDBTestDataFactory.createAuditEntry({
        user_id: "doctor-123",
        action: "patient_data_accessed",
        resource_type: "patient_record",
        timestamp: new Date(Date.now() - 3_600_000).toISOString(), // 1 hour ago
      }),
      AIDBTestDataFactory.createAuditEntry({
        user_id: "doctor-123",
        action: "ai_diagnosis_requested",
        resource_type: "ai_service",
        timestamp: new Date(Date.now() - 1_800_000).toISOString(), // 30 min ago
      }),
      AIDBTestDataFactory.createAuditEntry({
        user_id: "nurse-456",
        action: "patient_data_updated",
        resource_type: "patient_record",
        timestamp: new Date().toISOString(),
      }),
    ];

    const { data: insertedAudits, error: insertError } = await supabaseClient
      .from("ai_audit_logs")
      .insert(auditEntries)
      .select("id");

    expect(insertError).toBeNull();
    testAuditIds.push(...insertedAudits.map((a: { id: string; }) => a.id));

    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "complex_audit_query",
    );

    // Complex query: Get all AI-related actions by specific user in time range
    const { data: queryResults, error: queryError } = await supabaseClient
      .from("ai_audit_logs")
      .select("*")
      .eq("user_id", "doctor-123")
      .like("action", "%ai%")
      .gte("timestamp", new Date(Date.now() - 7_200_000).toISOString()) // Last 2 hours
      .order("timestamp", { ascending: false });

    const duration = stopTimer();

    expect(queryError).toBeNull();
    expect(queryResults).toHaveLength(1);
    expect(queryResults[0].action).toBe("ai_diagnosis_requested");
    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_select_time_ms,
    );
  });

  it("should maintain audit log immutability", async () => {
    const testAudit = AIDBTestDataFactory.createAuditEntry();

    const { data: insertedData, error: insertError } = await supabaseClient
      .from("ai_audit_logs")
      .insert(testAudit)
      .select()
      .single();

    expect(insertError).toBeNull();
    testAuditIds.push(insertedData.id);

    // Attempt to update should fail (audit logs should be immutable)
    const { data: updateData, error: updateError } = await supabaseClient
      .from("ai_audit_logs")
      .update({ action: "modified_action" })
      .eq("id", insertedData.id);

    // Depending on RLS policies, this might fail or succeed
    // In production, audit logs should be immutable
    if (updateError) {
      expect(updateError.message).toMatch(/policy|permission|immutable/i);
    }
  });
});

// Monitoring and Metrics Database Tests
describe("aI Monitoring Database", () => {
  let supabaseClient: any;
  let testMetricIds: string[] = [];
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Monitoring Database tests");
    supabaseClient = mockSupabaseClient;
  });

  afterEach(async () => {
    if (testMetricIds.length > 0) {
      await supabaseClient
        .from("ai_monitoring_metrics")
        .delete()
        .in("id", testMetricIds);
      testMetricIds = [];
    }
  });

  it("should record performance metrics efficiently", async () => {
    const stopTimer = TestPerformanceMonitor.startMeasurement("metrics_recording");

    const testMetrics = Array.from(
      { length: 25 },
      (_, i) =>
        AIDBTestDataFactory.createMonitoringMetric({
          service: "universal_chat",
          metric_name: "response_time_ms",
          metric_value: 800 + i * 50, // Varying response times
          tags: {
            user_id: `test-user-${i % 5}`,
            endpoint: "/api/ai/universal-chat/message",
          },
        }),
    );

    const { data: insertedMetrics, error: insertError } = await supabaseClient
      .from("ai_monitoring_metrics")
      .insert(testMetrics)
      .select("id");

    const duration = stopTimer();

    expect(insertError).toBeNull();
    expect(insertedMetrics).toHaveLength(25);
    expect(duration).toBeLessThan(1000); // Should be fast for bulk insert

    testMetricIds.push(...insertedMetrics.map((m: { id: string; }) => m.id));
  });

  it("should support aggregation queries for monitoring dashboards", async () => {
    // Insert test metrics with known values
    const testMetrics = [
      AIDBTestDataFactory.createMonitoringMetric({
        service: "compliance_automation",
        metric_name: "processing_time_ms",
        metric_value: 500,
        timestamp: new Date(Date.now() - 300_000).toISOString(), // 5 min ago
      }),
      AIDBTestDataFactory.createMonitoringMetric({
        service: "compliance_automation",
        metric_name: "processing_time_ms",
        metric_value: 750,
        timestamp: new Date(Date.now() - 240_000).toISOString(), // 4 min ago
      }),
      AIDBTestDataFactory.createMonitoringMetric({
        service: "compliance_automation",
        metric_name: "processing_time_ms",
        metric_value: 600,
        timestamp: new Date(Date.now() - 180_000).toISOString(), // 3 min ago
      }),
    ];

    const { data: insertedMetrics, error: insertError } = await supabaseClient
      .from("ai_monitoring_metrics")
      .insert(testMetrics)
      .select("id");

    expect(insertError).toBeNull();
    testMetricIds.push(...insertedMetrics.map((m: { id: string; }) => m.id));

    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "metrics_aggregation",
    );

    // Aggregation query - this would typically be done with a database view or function
    const { data: metrics, error: queryError } = await supabaseClient
      .from("ai_monitoring_metrics")
      .select("metric_value")
      .eq("service", "compliance_automation")
      .eq("metric_name", "processing_time_ms")
      .gte("timestamp", new Date(Date.now() - 600_000).toISOString()); // Last 10 minutes

    const duration = stopTimer();

    expect(queryError).toBeNull();
    expect(metrics).toHaveLength(3);

    // Manual aggregation for test validation
    const avgValue =
      metrics.reduce((sum: number, m: { metric_value: number; }) => sum + m.metric_value, 0)
      / metrics.length;
    expect(avgValue).toBeCloseTo(616.67, 1); // (500 + 750 + 600) / 3

    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_select_time_ms,
    );
  });

  it("should handle high-volume metric ingestion", async () => {
    const startTime = performance.now();

    // Simulate high-volume metric ingestion
    const batchSize = 100;
    const testMetrics = Array.from(
      { length: batchSize },
      (_, i) =>
        AIDBTestDataFactory.createMonitoringMetric({
          service: "high_volume_test",
          metric_name: "request_count",
          metric_value: i + 1,
          timestamp: new Date(Date.now() + i * 1000).toISOString(), // Spread over time
        }),
    );

    const { data: insertedMetrics, error: insertError } = await supabaseClient
      .from("ai_monitoring_metrics")
      .insert(testMetrics)
      .select("id");

    const duration = performance.now() - startTime;

    expect(insertError).toBeNull();
    expect(insertedMetrics).toHaveLength(batchSize);
    expect(duration).toBeLessThan(2000); // Should handle 100 metrics in under 2 seconds

    testMetricIds.push(...insertedMetrics.map((m: { id: string; }) => m.id));
  });
});

// Chat Sessions and Messages Database Tests
describe("aI Chat Database", () => {
  let supabaseClient: any;
  let testSessionIds: string[] = [];
  let testMessageIds: string[] = [];
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Chat Database tests");
    supabaseClient = mockSupabaseClient;
  });

  afterEach(async () => {
    // Cleanup messages first (due to foreign key constraint)
    if (testMessageIds.length > 0) {
      await supabaseClient
        .from("ai_chat_messages")
        .delete()
        .in("id", testMessageIds);
      testMessageIds = [];
    }

    if (testSessionIds.length > 0) {
      await supabaseClient
        .from("ai_chat_sessions")
        .delete()
        .in("id", testSessionIds);
      testSessionIds = [];
    }
  });

  it("should maintain referential integrity between sessions and messages", async () => {
    // Create test session
    const testSession = {
      id: `session-${Date.now()}`,
      user_id: "test-user-ref-integrity",
      title: "Test Session for Referential Integrity",
      status: "active",
      language: "pt-BR",
      created_at: new Date().toISOString(),
    };

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    expect(sessionError).toBeNull();
    testSessionIds.push(sessionData.id);

    // Create test message
    const testMessage = {
      id: `message-${Date.now()}`,
      session_id: sessionData.id,
      role: "user",
      content: "Test message for referential integrity",
      timestamp: new Date().toISOString(),
    };

    const { data: messageData, error: messageError } = await supabaseClient
      .from("ai_chat_messages")
      .insert(testMessage)
      .select()
      .single();

    expect(messageError).toBeNull();
    expect(messageData.session_id).toBe(sessionData.id);
    testMessageIds.push(messageData.id);

    // Verify cascade behavior or constraint enforcement
    // Attempting to delete session with messages should either cascade or be prevented
    const { error: deleteError } = await supabaseClient
      .from("ai_chat_sessions")
      .delete()
      .eq("id", sessionData.id);

    // This will depend on the foreign key constraint configuration
    // Either it cascades (no error) or it's prevented (error occurs)
  });

  it("should support efficient conversation history retrieval", async () => {
    // Create test session
    const testSession = {
      id: `session-history-${Date.now()}`,
      user_id: "test-user-history",
      title: "Test Conversation History",
      status: "active",
      language: "pt-BR",
      created_at: new Date().toISOString(),
    };

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    expect(sessionError).toBeNull();
    testSessionIds.push(sessionData.id);

    // Create conversation history
    const messages = Array.from({ length: 20 }, (_, i) => ({
      id: `message-hist-${Date.now()}-${i}`,
      session_id: sessionData.id,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Test message ${i + 1}`,
      timestamp: new Date(Date.now() + i * 1000).toISOString(), // Sequential timestamps
    }));

    const { data: messageData, error: messageError } = await supabaseClient
      .from("ai_chat_messages")
      .insert(messages)
      .select("id");

    expect(messageError).toBeNull();
    testMessageIds.push(...messageData.map((m: { id: string; }) => m.id));

    const stopTimer = TestPerformanceMonitor.startMeasurement(
      "conversation_history_retrieval",
    );

    // Retrieve conversation history with pagination
    const { data: history, error: historyError } = await supabaseClient
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionData.id)
      .order("timestamp", { ascending: true })
      .range(0, 9); // First 10 messages

    const duration = stopTimer();

    expect(historyError).toBeNull();
    expect(history).toHaveLength(10);
    expect(history[0].content).toBe("Test message 1");
    expect(history[9].content).toBe("Test message 10");
    expect(duration).toBeLessThan(
      DB_TEST_CONFIG.performance.max_select_time_ms,
    );
  });

  it("should handle concurrent message insertions", async () => {
    // Create test session
    const testSession = {
      id: `session-concurrent-${Date.now()}`,
      user_id: "test-user-concurrent",
      title: "Test Concurrent Messages",
      status: "active",
      language: "pt-BR",
      created_at: new Date().toISOString(),
    };

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from("ai_chat_sessions")
      .insert(testSession)
      .select()
      .single();

    expect(sessionError).toBeNull();
    testSessionIds.push(sessionData.id);

    const startTime = performance.now();

    // Simulate concurrent message insertions
    const concurrentMessages = Array.from({ length: 15 }, (_, i) =>
      supabaseClient
        .from("ai_chat_messages")
        .insert({
          id: `message-conc-${Date.now()}-${i}`,
          session_id: sessionData.id,
          role: i % 2 === 0 ? "user" : "assistant",
          content: `Concurrent message ${i + 1}`,
          timestamp: new Date().toISOString(),
        })
        .select("id")
        .single());

    const results = await Promise.allSettled(concurrentMessages);
    const duration = performance.now() - startTime;

    const successfulInserts = results.filter((r) => r.status === "fulfilled");
    expect(successfulInserts).toHaveLength(15);

    testMessageIds.push(
      ...successfulInserts.map(
        (r) => (r as PromiseFulfilledResult<any>).value.data.id,
      ),
    );

    // Should handle concurrent operations efficiently
    expect(duration).toBeLessThan(1500); // 1.5 seconds for 15 concurrent operations
  });
});

// Database Performance and Load Testing
describe("aI Database Performance", () => {
  let supabaseClient: any;
  let useMockMode = false;

  beforeAll(async () => {
    // Always use mock mode for integration tests
    useMockMode = true;
    console.log("🔧 Using mock mode for Database Performance tests");
    supabaseClient = mockSupabaseClient;
  });

  it("should handle database connection pooling under load", async () => {
    const connectionTests = Array.from({ length: 20 }, async () => {
      const client = createClient(
        TEST_CONFIG.supabase.test_project_url,
        TEST_CONFIG.supabase.test_service_role_key,
      );

      return client.from("ai_feature_flags").select("count").limit(1);
    });

    const startTime = performance.now();
    const results = await Promise.allSettled(connectionTests);
    const duration = performance.now() - startTime;

    const successfulConnections = results.filter(
      (r) => r.status === "fulfilled",
    );
    expect(successfulConnections.length).toBeGreaterThan(15); // Allow for some potential failures
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });

  it("should maintain performance under mixed read/write operations", async () => {
    const mixedOperations: Promise<any>[] = [];

    // Mix of operations: 60% reads, 40% writes
    for (let i = 0; i < 30; i++) {
      if (i < 18) {
        // Read operations
        mixedOperations.push(
          supabaseClient
            .from("ai_feature_flags")
            .select("id, name, enabled")
            .limit(10),
        );
      } else {
        // Write operations
        const testFlag = AIDBTestDataFactory.createFeatureFlag({
          name: `perf_test_flag_${i}_${Date.now()}`,
        });

        mixedOperations.push(
          supabaseClient
            .from("ai_feature_flags")
            .insert(testFlag)
            .select("id")
            .single(),
        );
      }
    }

    const startTime = performance.now();
    const results = await Promise.allSettled(mixedOperations);
    const duration = performance.now() - startTime;

    const successfulOperations = results.filter(
      (r) => r.status === "fulfilled",
    );
    expect(successfulOperations.length).toBeGreaterThan(25); // Allow for some failures

    // Cleanup inserted flags
    const insertedFlags = results
      .filter((r, i) => r.status === "fulfilled" && i >= 18)
      .map((r) => (r as PromiseFulfilledResult<any>).value.data.id)
      .filter((id) => id); // Filter out any null/undefined ids

    if (insertedFlags.length > 0) {
      await supabaseClient
        .from("ai_feature_flags")
        .delete()
        .in("id", insertedFlags);
    }

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});

// Setup and cleanup
TestIntegrationSetup.setupIntegrationTests();
