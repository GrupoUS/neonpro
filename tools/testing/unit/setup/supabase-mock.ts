import { vi } from "vitest";

// Supabase Mock for Healthcare Testing
// LGPD-compliant data mocking and healthcare-specific scenarios

export const createSupabaseMock = () => {
  const supabaseMock = {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
    realtime: {
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      })),
    },
  };

  return supabaseMock;
};

export const setupSupabaseMock = async () => {
  const mock = createSupabaseMock();

  // Setup healthcare-specific mock data
  setupPatientDataMocks(mock);
  setupAnvisaDataMocks(mock);
  setupCFMDataMocks(mock);
  setupAuditTrailMocks(mock);
  return mock;
};

function setupPatientDataMocks(mock: unknown) {
  // Mock LGPD-compliant patient data
  const mockPatients = [
    {
      id: "test-patient-1",
      name: "João Test Silva",
      cpf: "123.456.789-00",
      consent_given: true,
      data_processing_consent: new Date().toISOString(),
    },
    {
      id: "test-patient-2",
      name: "Maria Test Santos",
      cpf: "987.654.321-00",
      consent_given: true,
      data_processing_consent: new Date().toISOString(),
    },
  ];

  mock.from.mockImplementation((table: string) => {
    if (table === "patients") {
      return {
        select: () => ({ data: mockPatients, error: undefined }),
        insert: () => ({ data: mockPatients[0], error: undefined }),
        update: () => ({ data: mockPatients[0], error: undefined }),
        delete: () => ({ data: undefined, error: undefined }),
      };
    }
    return mock.from();
  });
}

function setupAnvisaDataMocks(_mock: unknown) {
  // Mock ANVISA device registration data}

function setupCFMDataMocks(_mock: unknown) {
  // Mock CFM professional validation data
}

function setupAuditTrailMocks(_mock: unknown) {
  // Implementation here
  // Mock audit trail for compliance
}
