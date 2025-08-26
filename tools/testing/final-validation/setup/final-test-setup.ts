/**
 * NeonPro Healthcare Platform - Final Test Setup
 *
 * Comprehensive test environment setup for final validation phase
 * Includes all necessary mocks, utilities and configurations
 */

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom";
import { logger } from "../../../../utils/logger";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.DATABASE_URL =
  "postgresql://test:test@localhost:54322/neonpro_test";

// Mock global fetch for API testing
jest.spyOn(global, "fetch").mockImplementation();

// Mock Supabase client
vi.mock<typeof import("@supabase/supabase-js")>(
  "@supabase/supabase-js",
  () => ({
    createClient: vi.fn(() => ({
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: undefined }, error: undefined }),
        ),
        getUser: vi.fn(() =>
          Promise.resolve({ data: { user: undefined }, error: undefined }),
        ),
        signInWithPassword: vi.fn(() =>
          Promise.resolve({
            data: { user: mockUser, session: mockSession },
            error: undefined,
          }),
        ),
        signOut: vi.fn(() => Promise.resolve({ error: undefined })),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: undefined })),
          single: vi.fn(() =>
            Promise.resolve({ data: undefined, error: undefined }),
          ),
        })),
        insert: vi.fn(() => Promise.resolve({ data: [], error: undefined })),
        update: vi.fn(() => Promise.resolve({ data: [], error: undefined })),
        delete: vi.fn(() => Promise.resolve({ data: [], error: undefined })),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(() =>
            Promise.resolve({ data: { path: "test-path" }, error: undefined }),
          ),
          download: vi.fn(() =>
            Promise.resolve({ data: new Blob(), error: undefined }),
          ),
        })),
      },
      realtime: {
        channel: vi.fn(() => ({
          on: vi.fn(() => ({ subscribe: vi.fn() })),
          unsubscribe: vi.fn(),
        })),
      },
    })),
  }),
);

// Mock Next.js router
vi.mock<typeof import("next/navigation")>("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock data for testing
export const mockUser = {
  id: "test-user-id",
  email: "test@neonpro.health",
  role: "healthcare_professional",
  tenant_id: "test-tenant-id",
  metadata: {
    crm_number: "12345-SP",
    specialization: "Cardiologia",
  },
};

export const mockSession = {
  access_token: "test-access-token",
  user: mockUser,
  expires_at: Date.now() + 3_600_000,
};

// Healthcare-specific test data
export const mockPatient = {
  id: "test-patient-id",
  name: "João Silva",
  email: "joao.silva@email.com",
  cpf: "123.456.789-00",
  birth_date: "1990-01-15",
  phone: "(11) 99999-9999",
  address: {
    street: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zip_code: "01234-567",
  },
  medical_history: [],
  lgpd_consent: {
    given_at: new Date().toISOString(),
    consent_version: "1.0",
    purposes: ["treatment", "analytics"],
  },
};

export const mockAppointment = {
  id: "test-appointment-id",
  patient_id: "test-patient-id",
  professional_id: "test-user-id",
  scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
  status: "scheduled",
  type: "consultation",
  notes: "Consulta de rotina",
};

// Global test setup
beforeAll(() => {
  // Setup test database if needed
  logger.info("🧪 Final Testing Phase - Setup Complete");
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup resources
  vi.restoreAllMocks();
});
