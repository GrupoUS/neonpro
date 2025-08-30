import { vi } from "vitest";

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: "test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "test-key",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  JWT_SECRET: "test-secret",
};

// Mock crypto
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid",
    getRandomValues: (arr: Uint8Array) => arr,
  },
});

// Mock fetch with proper AI services responses
const mockFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    console.log("🔍 Mock fetch called with URL:", url);

    // Handle mock server URLs specifically
    if (url.includes("mock-api-server") || url.includes("mock-supabase-server")) {
      console.log("✅ Mock server URL detected:", url);
      // AI Services API endpoints
      if (url.includes("/api/ai/universal-chat/session")) {
        console.log("🎯 Session endpoint matched, returning mock data");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              session_id: "test-session-123",
              user_id: "test-user-456",
              created_at: "2024-01-01T00:00:00Z",
              status: "active",
              compliance_status: {
                lgpd_compliant: true,
                anvisa_compliant: true,
                cfm_compliant: true,
              },
            }),
          text: () =>
            Promise.resolve(JSON.stringify({
              success: true,
              session_id: "test-session-123",
              user_id: "test-user-456",
              created_at: "2024-01-01T00:00:00Z",
              status: "active",
              compliance_status: {
                lgpd_compliant: true,
                anvisa_compliant: true,
                cfm_compliant: true,
              },
            })),
        } as Response);
      }

      if (url.includes("/api/ai/universal-chat/message")) {
        console.log("🎯 Message endpoint matched, returning mock data");
        const requestBody = init?.body ? JSON.parse(init.body as string) : {};
        const message = requestBody.message?.toLowerCase() || "";
        const isEmergency = message.includes("emergência") || message.includes("emergency")
          || message.includes("urgent") || message.includes("help");
        const containsDiabetes = message.includes("diabete") || message.includes("diabetes")
          || message.includes("glicose") || message.includes("açúcar");
        const containsPressure = message.includes("pressão arterial")
          || message.includes("hipertensão");
        const isHealthcareMessage = message.includes("healthcare") || message.includes("saúde")
          || message.includes("medical") || message.includes("health") || containsDiabetes
          || containsPressure;

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              message_id: "test-message-789",
              response: containsDiabetes
                ? "Sobre diabete: é importante monitorar os níveis de glicose regularmente. Vamos discutir seu diabete."
                : containsPressure
                ? "Sobre pressão arterial: mantenha uma dieta saudável e exercite-se regularmente."
                : isHealthcareMessage
                ? "This is a test AI response for healthcare consultation."
                : "general ai response.",
              emergency_detected: isEmergency,
              emergency_response: isEmergency
                ? {
                  priority: "critical",
                  instructions: "Ligue para 192 imediatamente",
                  estimated_response_time: "5-10 minutes",
                }
                : null,
              context_maintained: true,
              audit_logged: true,
              safety_assessment: {
                emergency_score: isEmergency ? 0.95 : (isHealthcareMessage ? 0.85 : 0.1),
                suicide_risk: isEmergency ? 0.8 : 0.1,
                self_harm_risk: isEmergency ? 0.7 : 0.05,
                violence_risk: isEmergency ? 0.6 : 0.02,
                substance_abuse: 0.03,
              },
            }),
        } as Response);
      }

      if (url.includes("/api/ai/compliance")) {
        console.log("🎯 Compliance endpoint matched, returning mock data");
        const requestBody = init?.body ? JSON.parse(init.body as string) : {};
        const isNonCompliant = requestBody.operation_type === "non_compliant"
          || requestBody.operation_type === "data_export"
          || requestBody.test_violations === true
          || requestBody.data_type === "sensitive"
          || (requestBody.message && requestBody.message.includes("violation"));

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              compliance_id: "test-compliance-456",
              lgpd_compliant: !isNonCompliant,
              compliance_status: {
                lgpd_compliant: !isNonCompliant,
                anvisa_compliant: true,
                cfm_compliant: true,
              },
              violations: isNonCompliant
                ? [{
                  category: "lgpd",
                  severity: "high",
                  description: "Unauthorized data processing detected",
                  recommendation: "Implement proper consent mechanisms",
                }]
                : [],
              device_validation: {
                registration_valid: true,
                certification_valid: true,
              },
              telemedicine_validation: {
                crm_valid: true,
                license_valid: true,
                certification_valid: true,
              },
              report: {
                summary: isNonCompliant
                  ? "LGPD violations detected"
                  : "All compliance checks passed",
                lgpd_compliance_rate: isNonCompliant ? 0.75 : 0.98,
                anvisa_compliance_rate: 0.95,
                cfm_compliance_rate: 0.97,
                violations: isNonCompliant
                  ? [{
                    category: "lgpd",
                    count: 1,
                    severity: "high",
                  }]
                  : [],
                recommendations: isNonCompliant ? ["Implement LGPD compliance measures"] : [],
              },
            }),
        } as Response);
      }

      if (url.includes("/api/ai/conversation")) {
        console.log("🎯 Conversation endpoint matched, returning mock data");
        const requestBody = init?.body ? JSON.parse(init.body as string) : {};
        const containsPressure = requestBody.message?.toLowerCase().includes("pressão arterial");

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              conversation_id: "test-conv-456",
              messages: [],
              status: "active",
              sentiment_analysis: {
                overall_sentiment: "neutral",
                confidence: 0.85,
                emotions: ["calm", "concerned"],
              },
              topic_analysis: {
                primary_topics: ["healthcare", "consultation"],
                medical_keywords: containsPressure
                  ? ["pressão arterial", "hipertensão", "symptoms", "treatment"]
                  : ["symptoms", "treatment", "pressão arterial"],
                urgency_indicators: containsPressure
                  ? ["high blood pressure", "hypertension"]
                  : ["routine checkup"],
              },
              safety_assessment: {
                emergency_detected: false,
                suicide_risk: 0.1,
                self_harm_risk: 0.05,
                violence_risk: 0.02,
                substance_abuse: 0.03,
              },
              summary: {
                main_topics: ["Patient consultation"],
                patient_concerns: ["General health inquiry"],
                recommendations: ["Follow up with doctor"],
                follow_up_required: true,
              },
              compliance_status: {
                lgpd_violations: 0,
                anvisa_violations: 0,
                cfm_violations: 0,
              },
              audit_trail_created: true,
            }),
        } as Response);
      }
    }

    // Default mock response for other URLs
    console.log("⚠️ No specific mock found for URL, returning default response");
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    } as Response);
  },
);

global.fetch = mockFetch;

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});

// Mock Supabase client with chainable methods
const createChainableMock = (table?: string, operation?: string) => {
  const mockData = {
    "ai_sessions": [
      { id: "test-session-1", user_id: "test-user", created_at: new Date().toISOString() },
    ],
    "ai_messages": [
      {
        id: "test-message-1",
        session_id: "test-session-1",
        content: "Test message",
        created_at: new Date().toISOString(),
      },
    ],
    "compliance_reports": [
      { id: "test-report-1", lgpd_compliant: true, created_at: new Date().toISOString() },
    ],
  };

  return {
    select: vi.fn(() => createChainableMock(table, "select")),
    insert: vi.fn(() => createChainableMock(table, "insert")),
    update: vi.fn(() => createChainableMock(table, "update")),
    delete: vi.fn(() => createChainableMock(table, "delete")),
    eq: vi.fn((column, value) => {
      // Handle specific test cases
      if (table === "ai_sessions" && value === "test-session-fail") {
        return {
          ...createChainableMock(table, operation),
          eq: vi.fn(() => createChainableMock(table, operation)),
          then: vi.fn((resolve) =>
            resolve({ data: null, error: { message: "Session not found" } })
          ),
        };
      }
      if (table === "ai_messages" && operation === "insert" && !value) {
        return {
          ...createChainableMock(table, operation),
          then: vi.fn((resolve) => resolve({ data: null, error: { message: "Invalid data" } })),
        };
      }
      return createChainableMock(table, operation);
    }),
    in: vi.fn(() => createChainableMock(table, operation)),
    gte: vi.fn(() => createChainableMock(table, operation)),
    lte: vi.fn(() => createChainableMock(table, operation)),
    order: vi.fn(() => createChainableMock(table, operation)),
    limit: vi.fn(() => createChainableMock(table, operation)),
    then: vi.fn((resolve) => {
      const data = table && mockData[table] ? mockData[table] : [];
      return resolve({ data, error: null });
    }),
    catch: vi.fn(() => Promise.resolve({ data: [], error: null })),
  };
};

const mockSupabaseClient = {
  from: vi.fn((table) => createChainableMock(table)),
};

// Mock Supabase modules
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: mockSupabaseClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));
