import "dotenv/config";

// Configuração global para testes
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-healthcare-testing";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_KEY = "test-service-key";
process.env.LOG_LEVEL = "silent";

// Configurações específicas para testes de sistema de saúde
global.testConfig = {
  // Dados de teste para conformidade LGPD
  testPatient: {
    id: "test-patient-id",
    fullName: "João Silva Teste",
    cpf: "12345678901",
    email: "joao.teste@example.com",
    phone: "+5511999999999",
    dateOfBirth: "1990-01-01",
    tenantId: "test-tenant-id",
  },

  // Usuário de teste para autenticação
  testUser: {
    id: "test-user-id",
    email: "doctor.teste@neonpro.com",
    role: "doctor",
    tenantId: "test-tenant-id",
  },

  // Configurações de rate limiting para testes
  rateLimiting: {
    disabled: true, // Desabilitar durante testes
    testMode: true,
  },

  // Configurações de auditoria para testes
  audit: {
    enabled: true,
    testMode: true,
    retentionDays: 1, // Apenas 1 dia para testes
  },
};

// Mock para Supabase client durante testes
jest.mock("../src/plugins/supabase", () => ({
  __esModule: true,
  default: async function mockSupabasePlugin(fastify: any) {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      execute: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    fastify.decorate("supabase", mockSupabase);
  },
}));

// Mock para sistema de auditoria durante testes
jest.mock("../src/plugins/audit", () => ({
  __esModule: true,
  default: async function mockAuditPlugin(fastify: any) {
    fastify.decorate("auditLog", jest.fn().mockResolvedValue(true));
  },
}));

// Configuração para timeouts longos em testes de integração
jest.setTimeout(30000);

// Configuração de limpeza após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configuração global para teste de conformidade LGPD/ANVISA
global.healthcareTestUtils = {
  // Gerador de CPF válido para testes
  generateValidCPF: (): string => {
    // CPF de teste válido (não real)
    return "11144477735";
  },

  // Gerador de dados médicos sintéticos
  generateMedicalData: () => ({
    vitalSigns: {
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 72,
      temperature: 36.5,
      oxygenSaturation: 98,
    },
    prescription: {
      medication: "Paracetamol 500mg",
      dosage: "1 comprimido",
      frequency: "8/8 horas",
      duration: "7 dias",
    },
  }),

  // Função para criar token JWT de teste
  createTestJWT: (payload: any) => {
    const jwt = require("jsonwebtoken");
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  },

  // Função para validar conformidade LGPD em respostas
  validateLGPDCompliance: (data: any) => {
    // Verificar se dados sensíveis não estão expostos
    const sensitiveFields = ["cpf", "rg", "password", "medicalId"];
    const exposedFields = Object.keys(data).filter((key) =>
      sensitiveFields.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase())),
    );

    return {
      compliant: exposedFields.length === 0,
      exposedFields,
    };
  },
};

// Definições de tipos para testes
declare global {
  var testConfig: any;
  var healthcareTestUtils: any;
}
