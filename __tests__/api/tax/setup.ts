// Test Setup for Tax APIs - Story 5.5
// Brazilian Tax System Integration Test Environment
// Author: VoidBeast V6.0 Master Orchestrator

import { jest } from "@jest/globals";

// Global test setup for Tax APIs
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

  // Mock environment for Brazilian tax services
  process.env.BRASIL_API_URL = "https://brasilapi.com.br/api/v1";
  process.env.RECEITA_FEDERAL_API_URL = "https://www.receitaws.com.br/v1";
  process.env.NFE_WEBSERVICE_URL = "https://nfe.fazenda.gov.br/nfe";
  process.env.TAX_CALCULATION_MODE = "test";

  // Configure test database connection
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/neonpro_test";

  console.log("🧪 Tax APIs Test Environment Initialized");
  console.log("📊 Brazilian Tax System Integration Tests - Story 5.5");
});

// Global test cleanup
afterAll(() => {
  // Cleanup test environment
  jest.clearAllMocks();
  console.log("✅ Tax APIs Test Environment Cleaned Up");
});

// Mock global fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        cnpj: "12345678000190",
        razao_social: "CLINICA TESTE LTDA",
        situacao: "ATIVA",
      }),
  }),
) as jest.MockedFunction<typeof fetch>;

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console logs during tests unless in debug mode
  if (!process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  if (!process.env.DEBUG_TESTS) {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }

  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Mock clinic data
  mockClinic: {
    id: "test-clinic-id",
    name: "Clínica Teste NeonPro",
    cnpj: "12345678000190",
    tax_regime: "simples_nacional",
    municipio: "São Paulo",
    uf: "SP",
  },

  // Mock invoice data
  mockInvoice: {
    id: "test-invoice-id",
    clinic_id: "test-clinic-id",
    customer_cnpj: "98765432000111",
    total_amount: 1000.0,
    services: [
      {
        codigo_servico: "1.01",
        descricao: "Consulta médica",
        valor_unitario: 200.0,
        quantidade: 1,
        valor_total: 200.0,
      },
    ],
  },

  // Mock customer data
  mockCustomer: {
    cnpj: "98765432000111",
    razao_social: "EMPRESA CLIENTE LTDA",
    endereco: {
      logradouro: "Rua Cliente",
      numero: "456",
      bairro: "Vila Nova",
      municipio: "São Paulo",
      uf: "SP",
      cep: "02000-000",
    },
  },

  // Test assertion helpers
  assertValidCNPJ: (cnpj: string) => {
    expect(cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  },

  assertValidNFENumber: (numero: string) => {
    expect(numero).toMatch(/^\d{9}$/);
  },

  assertValidTaxCalculation: (calculation: any) => {
    expect(calculation).toHaveProperty("total_taxes");
    expect(calculation).toHaveProperty("effective_rate");
    expect(calculation.total_taxes).toBeGreaterThanOrEqual(0);
    expect(calculation.effective_rate).toBeGreaterThanOrEqual(0);
  },

  // Mock data generators
  generateMockNFE: () => ({
    id: `nfe-${Date.now()}`,
    clinic_id: "test-clinic-id",
    invoice_id: "test-invoice-id",
    numero_nfe: "000000001",
    serie_nfe: 1,
    chave_nfe: `test-chave-${Date.now()}`,
    valor_total: 1000.0,
    status: "generated",
    created_at: new Date().toISOString(),
  }),

  generateMockDeclaration: (type: string = "DEFIS") => ({
    id: `declaration-${Date.now()}`,
    clinic_id: "test-clinic-id",
    declaration_type: type,
    period: { year: 2024 },
    status: "generated",
    total_revenue: 1200000.0,
    total_taxes: 150000.0,
    created_at: new Date().toISOString(),
  }),
};

// Error simulation utilities
global.simulateError = {
  databaseError: () => ({
    data: null,
    error: { message: "Database connection failed" },
  }),

  apiError: (status: number, message: string) => {
    throw new Error(`API Error ${status}: ${message}`);
  },

  validationError: (field: string) => ({
    valid: false,
    errors: [`Invalid ${field} format`],
  }),
};

// Performance testing utilities
global.performanceUtils = {
  measureExecutionTime: async (fn: () => Promise<any>) => {
    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    return {
      result,
      executionTime: endTime - startTime,
    };
  },

  assertPerformance: (executionTime: number, maxTime: number, operation: string) => {
    expect(executionTime).toBeLessThan(maxTime);
    if (executionTime >= maxTime) {
      console.warn(
        `⚠️ Performance Warning: ${operation} took ${executionTime}ms (max: ${maxTime}ms)`,
      );
    }
  },
};

// Compliance testing utilities
global.complianceUtils = {
  validateLGPDCompliance: (data: any) => {
    // Mock LGPD compliance validation
    expect(data).not.toHaveProperty("personal_sensitive_data");
    return true;
  },

  validateTaxCompliance: (calculation: any) => {
    // Mock tax compliance validation
    expect(calculation).toHaveProperty("calculation_method");
    expect(calculation).toHaveProperty("legal_basis");
    return true;
  },

  validateAuditTrail: (auditData: any) => {
    // Mock audit trail validation
    expect(auditData).toHaveProperty("timestamp");
    expect(auditData).toHaveProperty("user_id");
    expect(auditData).toHaveProperty("action");
    return true;
  },
};

console.log("✅ Tax APIs Test Setup Complete - Story 5.5 Ready");
console.log("🇧🇷 Brazilian Tax System Integration Test Environment");
console.log("📋 Test Coverage: NFSe, CNPJ Validation, Tax Calculation, Declarations");
console.log("⚡ Performance Thresholds: NFSe <3s, CNPJ <1s, Declarations <10s");
console.log("🔒 Compliance: LGPD, ANVISA, CFM, Receita Federal");
