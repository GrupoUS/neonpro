/**
 * Integration Test Setup
 * Configures mocks, utilities, and environment for integration tests
 */

import { vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { cleanup } from "@testing-library/react";

// Global test utilities
declare global {
  let __INTEGRATION_TEST_UTILS__: {
    supabase: ReturnType<typeof createClient>;
    resetDatabase: () => Promise<void>;
    createTestUser: (userData?: Partial<Record<string, unknown>>) => Promise<unknown>;
    createTestPatient: (patientData?: Partial<Record<string, unknown>>) => Promise<unknown>;
    waitForAsync: (ms?: number) => Promise<void>;
  };
}

// Setup Supabase client for integration tests
const setupSupabaseClient = () => {
  const supabaseUrl = process.env.TEST_SUPABASE_URL || "http://localhost:54321";
  const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY || "test-key";
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database reset utility
const resetDatabase = async () => {
  const supabase = global.__INTEGRATION_TEST_UTILS__.supabase;
  
  try {
    // Clean up test data in reverse dependency order
    await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("medical_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("patients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    console.log("🧹 Database reset completed");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
};

// Create test user utility
const createTestUser = async (userData: Partial<Record<string, unknown>> = {}) => {
  const supabase = global.__INTEGRATION_TEST_UTILS__.supabase;
  
  const defaultUserData = {
    email: `test-${Date.now()}@example.com`,
    password: "test123456",
    name: "Test User",
    role: "doctor",
    ...userData,
  };
  
  const { data, error } = await supabase.auth.signUp({
    email: defaultUserData.email,
    password: defaultUserData.password,
    options: {
      data: {
        name: defaultUserData.name,
        role: defaultUserData.role,
      },
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data.user;
};

// Create test patient utility
const createTestPatient = async (patientData: Partial<Record<string, unknown>> = {}) => {
  const supabase = global.__INTEGRATION_TEST_UTILS__.supabase;
  
  const defaultPatientData = {
    name: `Test Patient ${Date.now()}`,
    email: `patient-${Date.now()}@example.com`,
    phone: "+1234567890",
    birth_date: "1990-01-01",
    gender: "other",
    address: "123 Test Street",
    emergency_contact: "Emergency Contact",
    emergency_phone: "+0987654321",
    ...patientData,
  };
  
  const { data, error } = await supabase
    .from("patients")
    .insert(defaultPatientData)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Wait utility for async operations
const waitForAsync = async (ms: number = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Setup global utilities
beforeAll(() => {
  // Initialize Supabase client
  const supabase = setupSupabaseClient();
  
  // Setup global test utilities
  global.__INTEGRATION_TEST_UTILS__ = {
    supabase,
    resetDatabase,
    createTestUser,
    createTestPatient,
    waitForAsync,
  };
  
  console.log("🔧 Integration test utilities initialized");
});

// Setup before each test
beforeEach(async () => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Cleanup React Testing Library
  cleanup();
  
  // Reset database state
  await resetDatabase();
  
  console.log("🧪 Test environment reset");
});

// Cleanup after each test
afterEach(async () => {
  // Additional cleanup if needed
  cleanup();
  
  // Clear any pending timers
  vi.clearAllTimers();
  
  // Reset all mocks
  vi.resetAllMocks();
});

// Global cleanup
afterAll(async () => {
  // Final cleanup
  await resetDatabase();
  
  console.log("🏁 Integration tests completed");
});

// Mock implementations for integration tests

// Mock Next.js router for integration tests
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));

// Mock Next.js navigation for App Router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || "test-key";

// Export utilities for use in tests
export {
  resetDatabase,
  createTestUser,
  createTestPatient,
  waitForAsync,
};

// Export test data factories
export const testDataFactories = {
  user: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    name: "Test User",
    role: "doctor",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  patient: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: `patient-${Date.now()}`,
    name: `Test Patient ${Date.now()}`,
    email: `patient-${Date.now()}@example.com`,
    phone: "+1234567890",
    birth_date: "1990-01-01",
    gender: "other",
    address: "123 Test Street",
    emergency_contact: "Emergency Contact",
    emergency_phone: "+0987654321",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  appointment: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: `appointment-${Date.now()}`,
    patient_id: `patient-${Date.now()}`,
    doctor_id: `user-${Date.now()}`,
    date: new Date().toISOString(),
    time: "10:00",
    duration: 30,
    status: "scheduled",
    notes: "Test appointment",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
};