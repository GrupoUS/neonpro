"use strict";
// NFE API Tests - Story 5.5
// Testing NFE generation, emission, and management functionality
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
var server_1 = require("next/server");
// Mock Supabase client for NFE operations
var mockSupabase = {
  from: globals_1.jest.fn(function () {
    return {
      select: globals_1.jest.fn(function () {
        return {
          eq: globals_1.jest.fn(function () {
            return {
              order: globals_1.jest.fn(function () {
                return {
                  limit: globals_1.jest.fn(function () {
                    return Promise.resolve({
                      data: [
                        {
                          id: "test-nfe-id",
                          clinic_id: "test-clinic-id",
                          invoice_id: "test-invoice-id",
                          numero_nfe: "000000001",
                          serie_nfe: 1,
                          chave_nfe: "test-chave-nfe",
                          valor_total: 1000.0,
                          status: "generated",
                          created_at: new Date().toISOString(),
                        },
                      ],
                      error: null,
                    });
                  }),
                };
              }),
              single: globals_1.jest.fn(function () {
                return Promise.resolve({
                  data: {
                    id: "test-nfe-id",
                    clinic_id: "test-clinic-id",
                    invoice_id: "test-invoice-id",
                    numero_nfe: "000000001",
                    serie_nfe: 1,
                    chave_nfe: "test-chave-nfe",
                    valor_total: 1000.0,
                    status: "generated",
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                });
              }),
            };
          }),
        };
      }),
      insert: globals_1.jest.fn(function () {
        return {
          select: globals_1.jest.fn(function () {
            return {
              single: globals_1.jest.fn(function () {
                return Promise.resolve({
                  data: { id: "test-nfe-insert-id" },
                  error: null,
                });
              }),
            };
          }),
        };
      }),
      update: globals_1.jest.fn(function () {
        return {
          eq: globals_1.jest.fn(function () {
            return {
              select: globals_1.jest.fn(function () {
                return {
                  single: globals_1.jest.fn(function () {
                    return Promise.resolve({
                      data: { id: "test-nfe-update-id", status: "emitted" },
                      error: null,
                    });
                  }),
                };
              }),
            };
          }),
        };
      }),
    };
  }),
};
// Mock NFE Integration Service
globals_1.jest.mock("@/lib/services/tax/nfe-service", function () {
  return {
    NFEIntegrationService: globals_1.jest.fn().mockImplementation(function () {
      return {
        generateNFE: globals_1.jest.fn().mockResolvedValue({
          clinic_id: "test-clinic-id",
          invoice_id: "test-invoice-id",
          numero_nfe: "000000001",
          serie_nfe: 1,
          chave_nfe: "test-chave-nfe-12345",
          valor_total: 1000.0,
          status: "generated",
          xml_content: "<xml>NFE XML content</xml>",
          emission_date: new Date().toISOString(),
        }),
        emitNFE: globals_1.jest.fn().mockResolvedValue({
          status: "emitted",
          chave_nfe: "test-chave-nfe-12345",
          protocolo: "test-protocol-67890",
          data_emissao: new Date().toISOString(),
          codigo_verificacao: "VER123456",
          link_visualizacao: "https://nfe.prefeitura.sp.gov.br/nfe/12345",
        }),
        cancelNFE: globals_1.jest.fn().mockResolvedValue({
          status: "cancelled",
          chave_nfe: "test-chave-nfe-12345",
          protocolo_cancelamento: "cancel-protocol-123",
          motivo_cancelamento: "Erro na emissão",
          data_cancelamento: new Date().toISOString(),
        }),
        consultarStatusNFE: globals_1.jest.fn().mockResolvedValue({
          status: "authorized",
          situacao: "Normal",
          protocolo: "test-protocol-67890",
          data_autorizacao: new Date().toISOString(),
          municipio: "São Paulo",
          codigo_municipio: "3550308",
        }),
        retransmitirNFE: globals_1.jest.fn().mockResolvedValue({
          status: "retransmitted",
          chave_nfe: "test-chave-nfe-12345",
          novo_protocolo: "retrans-protocol-999",
          data_retransmissao: new Date().toISOString(),
        }),
      };
    }),
  };
});
globals_1.jest.mock("@/app/utils/supabase/server", function () {
  return {
    createClient: function () {
      return mockSupabase;
    },
  };
});
// Import NFE API handlers
var route_1 = require("@/app/api/tax/nfe/route");
(0, globals_1.describe)(
  "NFE API - Story 5.5 AC1: Automated NFSe Generation and Submission",
  function () {
    var testClinicId = "test-clinic-id";
    var testInvoiceId = "test-invoice-id";
    var testNFEId = "test-nfe-id";
    (0, globals_1.beforeAll)(function () {
      process.env.NODE_ENV = "test";
    });
    (0, globals_1.afterAll)(function () {
      globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)("GET /api/tax/nfe - NFE Listing and Status", function () {
      (0, globals_1.it)("should list NFEs for a clinic", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?clinic_id=".concat(testClinicId, "&action=list"),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                (0, globals_1.expect)(result.data).toHaveLength(1);
                (0, globals_1.expect)(result.data[0]).toHaveProperty("numero_nfe");
                (0, globals_1.expect)(result.data[0]).toHaveProperty("chave_nfe");
                (0, globals_1.expect)(result.pagination).toHaveProperty("total");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should get specific NFE details", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?nfe_id=".concat(testNFEId, "&action=details"),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toHaveProperty("id");
                (0, globals_1.expect)(result.data).toHaveProperty("numero_nfe");
                (0, globals_1.expect)(result.data).toHaveProperty("chave_nfe");
                (0, globals_1.expect)(result.data.clinic_id).toBe(testClinicId);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should check NFE status with municipal authority", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?nfe_id=".concat(testNFEId, "&action=status"),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toHaveProperty("status");
                (0, globals_1.expect)(result.data).toHaveProperty("situacao");
                (0, globals_1.expect)(result.data).toHaveProperty("protocolo");
                (0, globals_1.expect)(result.data.status).toBe("authorized");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should download NFE XML", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?nfe_id=".concat(
                    testNFEId,
                    "&action=download&format=xml",
                  ),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toHaveProperty("download_url");
                (0, globals_1.expect)(result.data).toHaveProperty("filename");
                (0, globals_1.expect)(result.data.format).toBe("xml");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should filter NFEs by date range", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var startDate, endDate, request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                startDate = "2024-01-01";
                endDate = "2024-12-31";
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?clinic_id="
                    .concat(testClinicId, "&action=list&start_date=")
                    .concat(startDate, "&end_date=")
                    .concat(endDate),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                (0, globals_1.expect)(result.filters).toEqual({
                  start_date: startDate,
                  end_date: endDate,
                });
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should filter NFEs by status", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?clinic_id=".concat(
                    testClinicId,
                    "&action=list&status=emitted",
                  ),
                );
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                (0, globals_1.expect)(result.filters).toEqual({ status: "emitted" });
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, globals_1.describe)("POST /api/tax/nfe - NFE Generation and Operations", function () {
      (0, globals_1.it)("should generate new NFE", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "generate",
                    clinic_id: testClinicId,
                    invoice_id: testInvoiceId,
                    customer: {
                      cnpj: "12345678000190",
                      razao_social: "EMPRESA TESTE LTDA",
                      endereco: {
                        logradouro: "Rua Teste",
                        numero: "123",
                        bairro: "Centro",
                        municipio: "São Paulo",
                        uf: "SP",
                        cep: "01000-000",
                      },
                    },
                    services: [
                      {
                        codigo_servico: "1.01",
                        descricao: "Consulta médica",
                        valor_unitario: 200.0,
                        quantidade: 1,
                        valor_total: 200.0,
                        iss_retido: false,
                      },
                    ],
                    emit_immediately: false,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(201);
                (0, globals_1.expect)(result.data).toHaveProperty("nfe_id");
                (0, globals_1.expect)(result.data).toHaveProperty("numero_nfe");
                (0, globals_1.expect)(result.data).toHaveProperty("chave_nfe");
                (0, globals_1.expect)(result.data.status).toBe("generated");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should emit NFE to municipal authority", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "emit",
                    nfe_id: testNFEId,
                    force_emission: false,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data.status).toBe("emitted");
                (0, globals_1.expect)(result.data).toHaveProperty("chave_nfe");
                (0, globals_1.expect)(result.data).toHaveProperty("protocolo");
                (0, globals_1.expect)(result.data).toHaveProperty("link_visualizacao");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should generate and emit NFE immediately", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "generate",
                    clinic_id: testClinicId,
                    invoice_id: testInvoiceId,
                    customer: {
                      cpf: "12345678901",
                      nome: "PACIENTE TESTE",
                      endereco: {
                        logradouro: "Rua Teste",
                        numero: "456",
                        bairro: "Vila Nova",
                        municipio: "São Paulo",
                        uf: "SP",
                        cep: "02000-000",
                      },
                    },
                    services: [
                      {
                        codigo_servico: "4.01",
                        descricao: "Cirurgia estética",
                        valor_unitario: 5000.0,
                        quantidade: 1,
                        valor_total: 5000.0,
                      },
                    ],
                    emit_immediately: true,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(201);
                (0, globals_1.expect)(result.data.status).toBe("emitted");
                (0, globals_1.expect)(result.data).toHaveProperty("protocolo");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should cancel NFE", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "cancel",
                    nfe_id: testNFEId,
                    motivo_cancelamento: "Erro na emissão do documento fiscal",
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data.status).toBe("cancelled");
                (0, globals_1.expect)(result.data).toHaveProperty("protocolo_cancelamento");
                (0, globals_1.expect)(result.data).toHaveProperty("motivo_cancelamento");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should retransmit NFE", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "retransmit",
                    nfe_id: testNFEId,
                    motivo_retransmissao: "Problemas na transmissão original",
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data.status).toBe("retransmitted");
                (0, globals_1.expect)(result.data).toHaveProperty("novo_protocolo");
                (0, globals_1.expect)(result.data).toHaveProperty("data_retransmissao");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should validate NFE data before generation", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "validate",
                    clinic_id: testClinicId,
                    customer: {
                      cnpj: "12345678000190",
                      razao_social: "EMPRESA TESTE LTDA",
                    },
                    services: [
                      {
                        codigo_servico: "1.01",
                        descricao: "Consulta médica",
                        valor_unitario: 200.0,
                        quantidade: 1,
                        valor_total: 200.0,
                      },
                    ],
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data.valid).toBe(true);
                (0, globals_1.expect)(result.data).toHaveProperty("validation_details");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle batch NFE generation", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "batch-generate",
                    clinic_id: testClinicId,
                    invoices: [
                      {
                        invoice_id: "invoice-001",
                        customer: {
                          cnpj: "12345678000190",
                          razao_social: "EMPRESA TESTE 1 LTDA",
                        },
                        services: [
                          {
                            codigo_servico: "1.01",
                            descricao: "Consulta 1",
                            valor_total: 200.0,
                          },
                        ],
                      },
                      {
                        invoice_id: "invoice-002",
                        customer: {
                          cpf: "98765432109",
                          nome: "PACIENTE TESTE 2",
                        },
                        services: [
                          {
                            codigo_servico: "4.01",
                            descricao: "Procedimento 2",
                            valor_total: 1500.0,
                          },
                        ],
                      },
                    ],
                    emit_immediately: false,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data.batch_id).toBeDefined();
                (0, globals_1.expect)(result.data.total_processed).toBe(2);
                (0, globals_1.expect)(result.data.results).toHaveLength(2);
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, globals_1.describe)("PUT /api/tax/nfe - NFE Updates", function () {
      (0, globals_1.it)("should update NFE metadata", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "PUT",
                  body: JSON.stringify({
                    nfe_id: testNFEId,
                    updates: {
                      observacoes: "NFE atualizada para inclusão de observações",
                      informacoes_adicionais: "Informações complementares do procedimento",
                    },
                  }),
                });
                return [4 /*yield*/, (0, route_1.PUT)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.data).toHaveProperty("id");
                (0, globals_1.expect)(result.data.status).toBeDefined();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, globals_1.describe)("DELETE /api/tax/nfe - NFE Removal", function () {
      (0, globals_1.it)("should delete NFE (logical deletion)", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?nfe_id=".concat(testNFEId),
                );
                return [4 /*yield*/, (0, route_1.DELETE)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(result.message).toBe("NFE deleted successfully");
                (0, globals_1.expect)(result.data.deleted_at).toBeDefined();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, globals_1.describe)("Error Handling and Edge Cases", function () {
      (0, globals_1.it)("should handle missing clinic_id parameter", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe?action=list");
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(400);
                (0, globals_1.expect)(result.error).toBe("clinic_id parameter is required");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle invalid NFE ID", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest(
                  "http://localhost/api/tax/nfe?nfe_id=invalid-id&action=details",
                );
                // Mock database error for invalid ID
                mockSupabase.from.mockReturnValueOnce({
                  select: globals_1.jest.fn(function () {
                    return {
                      eq: globals_1.jest.fn(function () {
                        return {
                          single: globals_1.jest.fn(function () {
                            return Promise.resolve({
                              data: null,
                              error: { message: "NFE not found" },
                            });
                          }),
                        };
                      }),
                    };
                  }),
                });
                return [4 /*yield*/, (0, route_1.GET)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(404);
                (0, globals_1.expect)(result.error).toBe("NFE not found");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle missing required fields for NFE generation", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "generate",
                    clinic_id: testClinicId,
                    // Missing required fields: invoice_id, customer, services
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(400);
                (0, globals_1.expect)(result.error).toBe(
                  "Missing required fields: invoice_id, customer, services",
                );
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle NFE emission failures", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // Mock emission failure
                globals_1.jest
                  .mocked(require("@/lib/services/tax/nfe-service").NFEIntegrationService)
                  .mockImplementationOnce(function () {
                    return {
                      emitNFE: globals_1.jest
                        .fn()
                        .mockRejectedValue(new Error("Municipal service unavailable")),
                    };
                  });
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "emit",
                    nfe_id: testNFEId,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(500);
                (0, globals_1.expect)(result.error).toBe("Failed to emit NFE");
                (0, globals_1.expect)(result.details).toContain("Municipal service unavailable");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle database transaction failures", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // Mock database transaction failure
                mockSupabase.from.mockReturnValueOnce({
                  insert: globals_1.jest.fn(function () {
                    return {
                      select: globals_1.jest.fn(function () {
                        return {
                          single: globals_1.jest.fn(function () {
                            return Promise.resolve({
                              data: null,
                              error: { message: "Database transaction failed" },
                            });
                          }),
                        };
                      }),
                    };
                  }),
                });
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "generate",
                    clinic_id: testClinicId,
                    invoice_id: testInvoiceId,
                    customer: {
                      cpf: "12345678901",
                      nome: "TESTE",
                    },
                    services: [
                      {
                        codigo_servico: "1.01",
                        descricao: "Teste",
                        valor_total: 100.0,
                      },
                    ],
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                (0, globals_1.expect)(response.status).toBe(500);
                (0, globals_1.expect)(result.error).toBe("Failed to save NFE to database");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, globals_1.describe)("Performance Requirements - AC1", function () {
      (0, globals_1.it)("should generate NFE within 3 seconds", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var startTime, request, response, endTime;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                startTime = Date.now();
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "generate",
                    clinic_id: testClinicId,
                    invoice_id: testInvoiceId,
                    customer: {
                      cpf: "12345678901",
                      nome: "PERFORMANCE TEST",
                    },
                    services: [
                      {
                        codigo_servico: "1.01",
                        descricao: "Performance test service",
                        valor_total: 100.0,
                      },
                    ],
                    emit_immediately: false,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                endTime = Date.now();
                (0, globals_1.expect)(response.status).toBe(201);
                (0, globals_1.expect)(endTime - startTime).toBeLessThan(3000); // 3 seconds
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should emit NFE within 5 seconds", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var startTime, request, response, endTime;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                startTime = Date.now();
                request = new server_1.NextRequest("http://localhost/api/tax/nfe", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "emit",
                    nfe_id: testNFEId,
                  }),
                });
                return [4 /*yield*/, (0, route_1.POST)(request)];
              case 1:
                response = _a.sent();
                endTime = Date.now();
                (0, globals_1.expect)(response.status).toBe(200);
                (0, globals_1.expect)(endTime - startTime).toBeLessThan(5000); // 5 seconds
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should handle concurrent NFE generations efficiently", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var concurrentRequests, startTime, responses, endTime;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                concurrentRequests = Array.from({ length: 5 }, function (_, index) {
                  return new server_1.NextRequest("http://localhost/api/tax/nfe", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "generate",
                      clinic_id: testClinicId,
                      invoice_id: "concurrent-invoice-".concat(index),
                      customer: {
                        cpf: "1234567890".concat(index),
                        nome: "CONCURRENT TEST ".concat(index),
                      },
                      services: [
                        {
                          codigo_servico: "1.01",
                          descricao: "Concurrent service ".concat(index),
                          valor_total: 100.0 + index * 10,
                        },
                      ],
                    }),
                  });
                });
                startTime = Date.now();
                return [
                  4 /*yield*/,
                  Promise.all(
                    concurrentRequests.map(function (request) {
                      return (0, route_1.POST)(request);
                    }),
                  ),
                ];
              case 1:
                responses = _a.sent();
                endTime = Date.now();
                // All requests should succeed
                responses.forEach(function (response) {
                  (0, globals_1.expect)(response.status).toBe(201);
                });
                // Total time should be reasonable for concurrent processing
                (0, globals_1.expect)(endTime - startTime).toBeLessThan(10000); // 10 seconds for 5 concurrent requests
                return [2 /*return*/];
            }
          });
        });
      });
    });
  },
);
