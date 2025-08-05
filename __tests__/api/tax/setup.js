"use strict";
// Test Setup for Tax APIs - Story 5.5
// Brazilian Tax System Integration Test Environment
// Author: VoidBeast V6.0 Master Orchestrator
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
// Global test setup for Tax APIs
beforeAll(function () {
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
afterAll(function () {
  // Cleanup test environment
  globals_1.jest.clearAllMocks();
  console.log("✅ Tax APIs Test Environment Cleaned Up");
});
// Mock global fetch for external API calls
global.fetch = globals_1.jest.fn(function () {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: function () {
      return Promise.resolve({
        cnpj: "12345678000190",
        razao_social: "CLINICA TESTE LTDA",
        situacao: "ATIVA",
      });
    },
  });
});
// Mock console methods to reduce test noise
var originalConsoleLog = console.log;
var originalConsoleError = console.error;
var originalConsoleWarn = console.warn;
beforeEach(function () {
  // Suppress console logs during tests unless in debug mode
  if (!process.env.DEBUG_TESTS) {
    console.log = globals_1.jest.fn();
    console.error = globals_1.jest.fn();
    console.warn = globals_1.jest.fn();
  }
});
afterEach(function () {
  // Restore console methods
  if (!process.env.DEBUG_TESTS) {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
  // Clear all mocks after each test
  globals_1.jest.clearAllMocks();
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
  assertValidCNPJ: function (cnpj) {
    expect(cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  },
  assertValidNFENumber: function (numero) {
    expect(numero).toMatch(/^\d{9}$/);
  },
  assertValidTaxCalculation: function (calculation) {
    expect(calculation).toHaveProperty("total_taxes");
    expect(calculation).toHaveProperty("effective_rate");
    expect(calculation.total_taxes).toBeGreaterThanOrEqual(0);
    expect(calculation.effective_rate).toBeGreaterThanOrEqual(0);
  },
  // Mock data generators
  generateMockNFE: function () {
    return {
      id: "nfe-".concat(Date.now()),
      clinic_id: "test-clinic-id",
      invoice_id: "test-invoice-id",
      numero_nfe: "000000001",
      serie_nfe: 1,
      chave_nfe: "test-chave-".concat(Date.now()),
      valor_total: 1000.0,
      status: "generated",
      created_at: new Date().toISOString(),
    };
  },
  generateMockDeclaration: function (type) {
    if (type === void 0) {
      type = "DEFIS";
    }
    return {
      id: "declaration-".concat(Date.now()),
      clinic_id: "test-clinic-id",
      declaration_type: type,
      period: { year: 2024 },
      status: "generated",
      total_revenue: 1200000.0,
      total_taxes: 150000.0,
      created_at: new Date().toISOString(),
    };
  },
};
// Error simulation utilities
global.simulateError = {
  databaseError: function () {
    return {
      data: null,
      error: { message: "Database connection failed" },
    };
  },
  apiError: function (status, message) {
    throw new Error("API Error ".concat(status, ": ").concat(message));
  },
  validationError: function (field) {
    return {
      valid: false,
      errors: ["Invalid ".concat(field, " format")],
    };
  },
};
// Performance testing utilities
global.performanceUtils = {
  measureExecutionTime: function (fn) {
    return __awaiter(void 0, void 0, void 0, function () {
      var startTime, result, endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            return [4 /*yield*/, fn()];
          case 1:
            result = _a.sent();
            endTime = Date.now();
            return [
              2 /*return*/,
              {
                result: result,
                executionTime: endTime - startTime,
              },
            ];
        }
      });
    });
  },
  assertPerformance: function (executionTime, maxTime, operation) {
    expect(executionTime).toBeLessThan(maxTime);
    if (executionTime >= maxTime) {
      console.warn(
        "\u26A0\uFE0F Performance Warning: "
          .concat(operation, " took ")
          .concat(executionTime, "ms (max: ")
          .concat(maxTime, "ms)"),
      );
    }
  },
};
// Compliance testing utilities
global.complianceUtils = {
  validateLGPDCompliance: function (data) {
    // Mock LGPD compliance validation
    expect(data).not.toHaveProperty("personal_sensitive_data");
    return true;
  },
  validateTaxCompliance: function (calculation) {
    // Mock tax compliance validation
    expect(calculation).toHaveProperty("calculation_method");
    expect(calculation).toHaveProperty("legal_basis");
    return true;
  },
  validateAuditTrail: function (auditData) {
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
