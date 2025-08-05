import "dotenv/config";
/// <reference types="jest" />
import { jest } from "@jest/globals";

// Global type declarations for tests
declare global {
  var testConfig: any;
  var __HEALTHCARE_DB__: any;
  var __REDIS_SERVER__: any;
  var __TEST_FASTIFY__: any;
}

export default async function globalSetup() {
  // Configuração global antes de todos os testes
  console.log("🏥 Configurando ambiente de testes para NeonPro Healthcare API...");

  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "silent";

  // Configurações específicas para sistema de saúde
  process.env.HEALTHCARE_TEST_MODE = "true";
  process.env.LGPD_AUDIT_ENABLED = "true";
  process.env.ANVISA_COMPLIANCE_MODE = "test";

  // Configurações de banco de dados de teste
  process.env.SUPABASE_URL = process.env.TEST_SUPABASE_URL || "https://test.supabase.co";
  process.env.SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || "test-anon-key";
  process.env.SUPABASE_SERVICE_KEY = process.env.TEST_SUPABASE_SERVICE_KEY || "test-service-key";

  // Configurações de autenticação para testes
  process.env.JWT_SECRET = "test-jwt-secret-key-for-neonpro-healthcare-2024";
  process.env.JWT_EXPIRES_IN = "1h";

  // Configurações de rate limiting para testes
  process.env.RATE_LIMIT_ENABLED = "false"; // Desabilitar durante testes
  process.env.RATE_LIMIT_TEST_MODE = "true";

  // Configurações de auditoria para testes
  process.env.AUDIT_LOG_RETENTION_DAYS = "1"; // Apenas 1 dia para testes
  process.env.AUDIT_LOG_LEVEL = "all"; // Log completo durante testes

  // Configurações brasileiras para testes
  process.env.DEFAULT_TIMEZONE = "America/Sao_Paulo";
  process.env.DEFAULT_CURRENCY = "BRL";
  process.env.DEFAULT_LOCALE = "pt-BR";

  // Configurações de impostos brasileiros para testes
  process.env.ISS_DEFAULT_RATE = "0.05"; // 5%
  process.env.IR_THRESHOLD = "20000"; // R$ 20.000
  process.env.TAX_CALCULATION_MODE = "test";

  // Configurações de PIX para testes (mock)
  process.env.PIX_ENABLED = "true";
  process.env.PIX_TEST_MODE = "true";
  process.env.PIX_MOCK_RESPONSES = "true";

  // Configurações de notificações para testes
  process.env.NOTIFICATIONS_ENABLED = "false"; // Desabilitar durante testes
  process.env.SMS_PROVIDER = "mock";
  process.env.EMAIL_PROVIDER = "mock";
  process.env.WHATSAPP_PROVIDER = "mock";

  // Configurações de monitoramento para testes
  process.env.MONITORING_ENABLED = "true";
  process.env.PERFORMANCE_TRACKING = "true";
  process.env.ERROR_TRACKING = "true";

  // Configurações de segurança para testes
  process.env.SECURITY_HEADERS_ENABLED = "true";
  process.env.CORS_ENABLED = "true";
  process.env.HELMET_ENABLED = "true";

  // Configurações de arquivos para testes
  process.env.MAX_FILE_SIZE = "10485760"; // 10MB
  process.env.ALLOWED_FILE_TYPES = "image/jpeg,image/png,application/pdf,text/plain";
  process.env.FILE_STORAGE_PROVIDER = "mock";

  // Configurações específicas de conformidade
  process.env.LGPD_DATA_RETENTION_YEARS = "7";
  process.env.ANVISA_AUDIT_ENABLED = "true";
  process.env.CFM_COMPLIANCE_MODE = "test";

  // Seed data para testes (IDs determinísticos)
  (global as any).testSeeds = {
    tenants: [
      {
        id: "test-tenant-id",
        name: "Clínica Teste NeonPro",
        cnpj: "11.222.333/0001-81",
        address: "Rua de Teste, 123, São Paulo, SP",
        isActive: true,
      },
    ],
    users: [
      {
        id: "test-admin-id",
        email: "admin@neonpro.test",
        role: "admin",
        tenantId: "test-tenant-id",
      },
      {
        id: "test-doctor-id",
        email: "doctor@neonpro.test",
        role: "doctor",
        tenantId: "test-tenant-id",
        crm: "CRM/SP 123456",
      },
      {
        id: "test-receptionist-id",
        email: "receptionist@neonpro.test",
        role: "receptionist",
        tenantId: "test-tenant-id",
      },
      {
        id: "test-patient-id",
        email: "patient@example.test",
        role: "patient",
        tenantId: "test-tenant-id",
      },
    ],
    patients: [
      {
        id: "test-patient-id",
        fullName: "João Silva Teste",
        cpf: "11144477735",
        email: "joao.teste@example.com",
        phone: "+5511987654321",
        dateOfBirth: "1985-05-15",
        tenantId: "test-tenant-id",
        userId: "test-patient-id",
      },
    ],
    services: [
      {
        id: "botox-service",
        name: "Aplicação de Botox",
        category: "aesthetic",
        basePrice: 800.0,
        taxable: true,
        tenantId: "test-tenant-id",
      },
      {
        id: "consultation-service",
        name: "Consulta Dermatológica",
        category: "consultation",
        basePrice: 200.0,
        taxable: true,
        tenantId: "test-tenant-id",
      },
    ],
  };

  // Configuração de timeouts para testes
  jest.setTimeout(30000); // 30 segundos para testes de integração

  // Interceptors para APIs externas durante testes
  if (typeof (global as any).fetch === "undefined") {
    (global as any).fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve("Mock response")
      })
    );
  }

  // Mock para serviços externos
  (global as any).mockServices = {
    supabase: {
      connected: true,
      testMode: true,
    },
    notifications: {
      sms: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 },
    },
    payments: {
      pix: { generated: 0, paid: 0 },
      creditCard: { processed: 0, failed: 0 },
      cash: { recorded: 0 },
    },
    taxes: {
      calculated: 0,
      issApplied: 0,
      irApplied: 0,
    },
  };

  // Função para resetar mocks entre testes
  (global as any).resetMocks = () => {
    (global as any).mockServices.notifications = {
      sms: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 },
    };
    (global as any).mockServices.payments = {
      pix: { generated: 0, paid: 0 },
      creditCard: { processed: 0, failed: 0 },
      cash: { recorded: 0 },
    };
    (global as any).mockServices.taxes = {
      calculated: 0,
      issApplied: 0,
      irApplied: 0,
    };
  };

  // Utilitários de teste específicos para sistema de saúde
  (global as any).healthcareTestUtils = {
    // Gerador de CPF válido para testes (não real)
    generateValidCPF: (): string => {
      const validTestCPFs = [
        "11144477735",
        "22233366690",
        "33377799912",
        "44455588834",
        "55599911156",
      ];
      const randomIndex = Math.floor(Math.random() * validTestCPFs.length);
      return validTestCPFs[randomIndex] || "11144477735";
    },

    // Gerador de CNPJ válido para testes (não real)
    generateValidCNPJ: (): string => {
      return "11.222.333/0001-81";
    },

    // Gerador de dados médicos sintéticos
    generateMedicalData: () => ({
      vitalSigns: {
        systolicBP: 110 + Math.floor(Math.random() * 30), // 110-140
        diastolicBP: 70 + Math.floor(Math.random() * 20), // 70-90
        heartRate: 60 + Math.floor(Math.random() * 40), // 60-100
        temperature: 36 + Math.random() * 1.5, // 36-37.5
        oxygenSaturation: 95 + Math.floor(Math.random() * 5), // 95-100
        respiratoryRate: 12 + Math.floor(Math.random() * 8), // 12-20
      },
      prescription: {
        medication: "Paracetamol 500mg",
        dosage: "1 comprimido",
        frequency: "8/8 horas",
        duration: "7 dias",
        prescribedBy: "test-doctor-id",
      },
      allergies: ["Penicilina", "Dipirona"],
      chronicConditions: ["Hipertensão"],
      medications: ["Losartana 50mg"],
      surgeries: [],
    }),

    // Função para criar token JWT de teste
    createTestJWT: (payload: any) => {
      const jwt = require("jsonwebtoken");
      return jwt.sign(payload, process.env.JWT_SECRET || "test-jwt-secret", { expiresIn: "1h" });
    },

    // Função para validar conformidade LGPD em respostas
    validateLGPDCompliance: (data: any) => {
      const sensitiveFields = ["cpf", "rg", "password", "medicalId", "ssn"];
      const exposedFields = Object.keys(data).filter((key) =>
        sensitiveFields.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase())),
      );

      return {
        compliant: exposedFields.length === 0,
        exposedFields,
        recommendation:
          exposedFields.length > 0
            ? "Campos sensíveis devem ser mascarados ou removidos da resposta"
            : "Dados em conformidade com LGPD",
      };
    },

    // Função para gerar dados de fatura de teste
    generateInvoiceData: (overrides = {}) => ({
      patientId: "test-patient-id",
      services: [
        {
          serviceId: "test-service",
          serviceName: "Serviço de Teste",
          quantity: 1,
          unitPrice: 500.0,
          discount: 0,
          taxable: true,
        },
      ],
      paymentMethod: "cash",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      taxes: {
        includeISS: true,
        includeIR: false,
        municipality: "São Paulo",
      },
      ...overrides,
    }),

    // Função para simular delay de rede
    networkDelay: (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms)),

    // Função para contar operações de auditoria
    countAuditLogs: () => (global as any).mockServices?.auditLogs?.length || 0,

    // Função para validar cálculos de impostos brasileiros
    validateBrazilianTaxes: (amount: number, taxResult: any) => {
      const expectedISS = amount * 0.05; // 5% padrão
      const tolerance = 0.01; // Tolerância de R$ 0,01

      return {
        issValid: Math.abs(taxResult.iss - expectedISS) <= tolerance,
        totalValid: taxResult.totalTax >= taxResult.iss,
        details: { expectedISS, actualISS: taxResult.iss, tolerance },
      };
    },
  };

  console.log("✅ Ambiente de testes configurado com sucesso!");
  console.log(`📊 Modo de teste: ${process.env.NODE_ENV || 'test'}`);
  console.log(`🏥 Sistema: NeonPro Healthcare API`);
  console.log(`🇧🇷 Conformidade: LGPD + ANVISA + CFM`);
  console.log(`⏱️  Timeout de testes: ${30000}ms`);
}
