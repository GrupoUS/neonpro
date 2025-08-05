"use strict";
// Tax Declarations API Tests - Story 5.5 AC5
// Testing automated tax reporting and declaration generation
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
// Mock Supabase client for Tax Declarations operations
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
                          id: "test-declaration-id",
                          clinic_id: "test-clinic-id",
                          declaration_type: "DEFIS",
                          period: { year: 2024, month: null, quarter: null },
                          status: "generated",
                          total_revenue: 1200000.0,
                          total_taxes: 150000.0,
                          file_path: "/declarations/defis_2024.xml",
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
                    id: "test-declaration-id",
                    clinic_id: "test-clinic-id",
                    declaration_type: "DEFIS",
                    period: { year: 2024 },
                    status: "generated",
                    total_revenue: 1200000.0,
                    total_taxes: 150000.0,
                    effective_rate: 12.5,
                    file_path: "/declarations/defis_2024.xml",
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
                  data: {
                    id: "test-insert-id",
                    declaration_type: "DEFIS",
                    status: "generated",
                  },
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
                      data: {
                        id: "test-update-id",
                        status: "submitted",
                      },
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
// Mock Tax Declaration Services
globals_1.jest.mock("@/lib/services/tax/declaration-generator", function () {
  return {
    TaxDeclarationGenerator: globals_1.jest.fn().mockImplementation(function () {
      return {
        generateDEFIS: globals_1.jest.fn().mockResolvedValue({
          declaration_id: "defis-2024-test",
          declaration_type: "DEFIS",
          period: { year: 2024 },
          status: "generated",
          file_path: "/tmp/defis_2024.xml",
          xml_content: "<DEFIS><year>2024</year><revenue>1200000.00</revenue></DEFIS>",
          validation_result: {
            valid: true,
            schema_compliant: true,
            calculation_correct: true,
          },
          summary: {
            total_revenue: 1200000.0,
            total_deductions: 200000.0,
            taxable_income: 1000000.0,
            total_taxes: 150000.0,
            effective_rate: 15.0,
          },
        }),
        generateDIMOB: globals_1.jest.fn().mockResolvedValue({
          declaration_id: "dimob-2024-test",
          declaration_type: "DIMOB",
          period: { year: 2024 },
          status: "generated",
          file_path: "/tmp/dimob_2024.txt",
          txt_content: "DIMOB2024|12345678000190|1200000.00",
          validation_result: {
            valid: true,
            format_compliant: true,
          },
        }),
        generateDCTF: globals_1.jest.fn().mockResolvedValue({
          declaration_id: "dctf-202412-test",
          declaration_type: "DCTF",
          period: { year: 2024, month: 12 },
          status: "generated",
          file_path: "/tmp/dctf_202412.xml",
          xml_content: "<DCTF><period>202412</period></DCTF>",
          validation_result: {
            valid: true,
            schema_compliant: true,
          },
        }),
        submitDeclaration: globals_1.jest.fn().mockResolvedValue({
          submission_id: "submission-12345",
          status: "submitted",
          protocol: "PROTOCOL-98765",
          submission_date: new Date().toISOString(),
          receipt_code: "RECEIPT-ABC123",
          processing_status: "accepted",
        }),
        validateDeclaration: globals_1.jest.fn().mockResolvedValue({
          valid: true,
          schema_compliant: true,
          calculation_correct: true,
          consistency_check: true,
          validation_errors: [],
          validation_warnings: [],
          validation_date: new Date().toISOString(),
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
// Import Tax Declarations API handlers
var route_1 = require("@/app/api/tax/declarations/route");
(0, globals_1.describe)(
  "Tax Declarations API - Story 5.5 AC5: Automated Tax Reporting and Declaration Generation",
  function () {
    var testClinicId = "test-clinic-id";
    var testDeclarationId = "test-declaration-id";
    var testYear = 2024;
    (0, globals_1.beforeAll)(function () {
      process.env.NODE_ENV = "test";
    });
    (0, globals_1.afterAll)(function () {
      globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)(
      "GET /api/tax/declarations - Declaration Listing and Status",
      function () {
        (0, globals_1.it)("should list all declarations for a clinic", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?clinic_id=".concat(
                      testClinicId,
                      "&action=list",
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
                  (0, globals_1.expect)(result.data).toHaveLength(1);
                  (0, globals_1.expect)(result.data[0]).toHaveProperty("declaration_type");
                  (0, globals_1.expect)(result.data[0]).toHaveProperty("period");
                  (0, globals_1.expect)(result.data[0]).toHaveProperty("status");
                  (0, globals_1.expect)(result.pagination).toHaveProperty("total");
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should get specific declaration details", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?declaration_id=".concat(
                      testDeclarationId,
                      "&action=details",
                    ),
                  );
                  return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(200);
                  (0, globals_1.expect)(result.data).toHaveProperty("id");
                  (0, globals_1.expect)(result.data).toHaveProperty("declaration_type");
                  (0, globals_1.expect)(result.data).toHaveProperty("period");
                  (0, globals_1.expect)(result.data).toHaveProperty("total_revenue");
                  (0, globals_1.expect)(result.data).toHaveProperty("total_taxes");
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should filter declarations by type", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?clinic_id=".concat(
                      testClinicId,
                      "&action=list&type=DEFIS",
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
                  (0, globals_1.expect)(result.filters).toEqual({ type: "DEFIS" });
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should filter declarations by period", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?clinic_id="
                      .concat(testClinicId, "&action=list&year=")
                      .concat(testYear),
                  );
                  return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(200);
                  (0, globals_1.expect)(result.data).toBeInstanceOf(Array);
                  (0, globals_1.expect)(result.filters).toEqual({ year: testYear });
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should filter declarations by status", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?clinic_id=".concat(
                      testClinicId,
                      "&action=list&status=generated",
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
                  (0, globals_1.expect)(result.filters).toEqual({ status: "generated" });
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should download declaration file", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?declaration_id=".concat(
                      testDeclarationId,
                      "&action=download",
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
                  (0, globals_1.expect)(result.data).toHaveProperty("file_size");
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should check declaration submission status", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?declaration_id=".concat(
                      testDeclarationId,
                      "&action=submission-status",
                    ),
                  );
                  return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(200);
                  (0, globals_1.expect)(result.data).toHaveProperty("submission_status");
                  (0, globals_1.expect)(result.data).toHaveProperty("last_checked");
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should get declaration statistics", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest(
                    "http://localhost/api/tax/declarations?clinic_id="
                      .concat(testClinicId, "&action=statistics&year=")
                      .concat(testYear),
                  );
                  return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(200);
                  (0, globals_1.expect)(result.data).toHaveProperty("total_declarations");
                  (0, globals_1.expect)(result.data).toHaveProperty("by_type");
                  (0, globals_1.expect)(result.data).toHaveProperty("by_status");
                  (0, globals_1.expect)(result.data).toHaveProperty("total_revenue");
                  (0, globals_1.expect)(result.data).toHaveProperty("total_taxes");
                  return [2 /*return*/];
              }
            });
          });
        });
      },
    );
    (0, globals_1.describe)(
      "POST /api/tax/declarations - Declaration Generation and Submission",
      function () {
        (0, globals_1.it)("should generate DEFIS declaration", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "generate",
                      declaration_type: "DEFIS",
                      clinic_id: testClinicId,
                      period: { year: testYear },
                      auto_submit: false,
                      include_optional_data: true,
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(201);
                  (0, globals_1.expect)(result.data).toHaveProperty("declaration_id");
                  (0, globals_1.expect)(result.data.declaration_type).toBe("DEFIS");
                  (0, globals_1.expect)(result.data.period.year).toBe(testYear);
                  (0, globals_1.expect)(result.data.status).toBe("generated");
                  (0, globals_1.expect)(result.data.validation_result.valid).toBe(true);
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should generate DIMOB declaration", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "generate",
                      declaration_type: "DIMOB",
                      clinic_id: testClinicId,
                      period: { year: testYear },
                      include_real_estate_transactions: true,
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(201);
                  (0, globals_1.expect)(result.data).toHaveProperty("declaration_id");
                  (0, globals_1.expect)(result.data.declaration_type).toBe("DIMOB");
                  (0, globals_1.expect)(result.data.validation_result.valid).toBe(true);
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should generate DCTF declaration", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "generate",
                      declaration_type: "DCTF",
                      clinic_id: testClinicId,
                      period: { year: testYear, month: 12 },
                      include_withheld_taxes: true,
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(201);
                  (0, globals_1.expect)(result.data).toHaveProperty("declaration_id");
                  (0, globals_1.expect)(result.data.declaration_type).toBe("DCTF");
                  (0, globals_1.expect)(result.data.period.month).toBe(12);
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should submit declaration to tax authority", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "submit",
                      declaration_id: testDeclarationId,
                      test_mode: false,
                      digital_certificate: "mock-certificate-data",
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(200);
                  (0, globals_1.expect)(result.data.status).toBe("submitted");
                  (0, globals_1.expect)(result.data).toHaveProperty("protocol");
                  (0, globals_1.expect)(result.data).toHaveProperty("receipt_code");
                  (0, globals_1.expect)(result.data.processing_status).toBe("accepted");
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should validate declaration before submission", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "validate",
                      declaration_id: testDeclarationId,
                      validation_level: "comprehensive",
                      check_calculations: true,
                      check_consistency: true,
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
                  (0, globals_1.expect)(result.data.schema_compliant).toBe(true);
                  (0, globals_1.expect)(result.data.calculation_correct).toBe(true);
                  (0, globals_1.expect)(result.data.consistency_check).toBe(true);
                  (0, globals_1.expect)(result.data.validation_errors).toHaveLength(0);
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should generate multiple declarations in batch", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "batch-generate",
                      clinic_id: testClinicId,
                      declarations: [
                        {
                          declaration_type: "DEFIS",
                          period: { year: testYear },
                        },
                        {
                          declaration_type: "DIMOB",
                          period: { year: testYear },
                        },
                        {
                          declaration_type: "DCTF",
                          period: { year: testYear, month: 12 },
                        },
                      ],
                      auto_validate: true,
                      auto_submit: false,
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
                  (0, globals_1.expect)(result.data.total_generated).toBe(3);
                  (0, globals_1.expect)(result.data.results).toHaveLength(3);
                  (0, globals_1.expect)(
                    result.data.results.every(function (r) {
                      return r.status === "generated";
                    }),
                  ).toBe(true);
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should schedule automatic declaration generation", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "schedule",
                      clinic_id: testClinicId,
                      declaration_type: "DEFIS",
                      schedule_type: "annual",
                      auto_generate: true,
                      auto_submit: false,
                      notification_preferences: {
                        email: true,
                        sms: false,
                        dashboard: true,
                      },
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(201);
                  (0, globals_1.expect)(result.data).toHaveProperty("schedule_id");
                  (0, globals_1.expect)(result.data.schedule_type).toBe("annual");
                  (0, globals_1.expect)(result.data.next_execution).toBeDefined();
                  return [2 /*return*/];
              }
            });
          });
        });
        (0, globals_1.it)("should generate corrective declaration", function () {
          return __awaiter(void 0, void 0, void 0, function () {
            var request, response, result;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                    method: "POST",
                    body: JSON.stringify({
                      action: "generate-corrective",
                      original_declaration_id: testDeclarationId,
                      correction_reason: "Erro na informação de receita",
                      corrections: {
                        total_revenue: 1250000.0,
                        deductions: {
                          medical_supplies: 25000.0,
                        },
                      },
                    }),
                  });
                  return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                  response = _a.sent();
                  return [4 /*yield*/, response.json()];
                case 2:
                  result = _a.sent();
                  (0, globals_1.expect)(response.status).toBe(201);
                  (0, globals_1.expect)(result.data).toHaveProperty("corrective_declaration_id");
                  (0, globals_1.expect)(result.data.correction_type).toBe("corrective");
                  (0, globals_1.expect)(result.data).toHaveProperty("original_declaration_id");
                  return [2 /*return*/];
              }
            });
          });
        });
      },
    );
    (0, globals_1.describe)("PUT /api/tax/declarations - Declaration Updates", function () {
      (0, globals_1.it)("should update declaration metadata", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                  method: "PUT",
                  body: JSON.stringify({
                    declaration_id: testDeclarationId,
                    updates: {
                      notes: "Declaração atualizada com correções",
                      responsible_person: "João Silva",
                      contact_email: "joao@clinica.com.br",
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
                (0, globals_1.expect)(result.data.updated_at).toBeDefined();
                return [2 /*return*/];
            }
          });
        });
      });
      (0, globals_1.it)("should update declaration status", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var request, response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
                  method: "PUT",
                  body: JSON.stringify({
                    declaration_id: testDeclarationId,
                    status_update: {
                      new_status: "reviewed",
                      reviewed_by: "Contador Principal",
                      review_notes: "Declaração revisada e aprovada",
                    },
                  }),
                });
                return [4 /*yield*/, (0, route_1.PUT)(request)];
              case 1:
                response = _a.sent();
                result = data;
                return [2 /*return*/];
            }
          });
        });
      });
      var result = yield response.json();
      (0, globals_1.expect)(response.status).toBe(200);
      (0, globals_1.expect)(result.data.status).toBe("reviewed");
      (0, globals_1.expect)(result.data).toHaveProperty("reviewed_by");
    });
  },
);
(0, globals_1.describe)("Error Handling and Edge Cases", function () {
  (0, globals_1.it)("should handle missing clinic_id parameter", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost/api/tax/declarations?action=list");
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
  (0, globals_1.it)("should handle invalid declaration type", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "generate",
                declaration_type: "INVALID_TYPE",
                clinic_id: testClinicId,
                period: { year: testYear },
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(400);
            (0, globals_1.expect)(result.error).toBe("Invalid declaration type");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle missing required period", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "generate",
                declaration_type: "DEFIS",
                clinic_id: testClinicId,
                // Missing period
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
              "Period is required for declaration generation",
            );
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle declaration generation failures", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Mock generation failure
            globals_1.jest
              .mocked(require("@/lib/services/tax/declaration-generator").TaxDeclarationGenerator)
              .mockImplementationOnce(function () {
                return {
                  generateDEFIS: globals_1.jest
                    .fn()
                    .mockRejectedValue(new Error("Insufficient data for declaration generation")),
                };
              });
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "generate",
                declaration_type: "DEFIS",
                clinic_id: testClinicId,
                period: { year: testYear },
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(500);
            (0, globals_1.expect)(result.error).toBe("Failed to generate declaration");
            (0, globals_1.expect)(result.details).toContain("Insufficient data");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle submission failures", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Mock submission failure
            globals_1.jest
              .mocked(require("@/lib/services/tax/declaration-generator").TaxDeclarationGenerator)
              .mockImplementationOnce(function () {
                return {
                  submitDeclaration: globals_1.jest
                    .fn()
                    .mockRejectedValue(new Error("Tax authority system unavailable")),
                };
              });
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "submit",
                declaration_id: testDeclarationId,
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(503);
            (0, globals_1.expect)(result.error).toBe("Tax authority system unavailable");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle validation failures", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Mock validation failure
            globals_1.jest
              .mocked(require("@/lib/services/tax/declaration-generator").TaxDeclarationGenerator)
              .mockImplementationOnce(function () {
                return {
                  validateDeclaration: globals_1.jest.fn().mockResolvedValue({
                    valid: false,
                    schema_compliant: false,
                    validation_errors: [
                      "Invalid revenue amount",
                      "Missing required field: taxpayer_id",
                    ],
                    validation_warnings: ["Unusual deduction amount detected"],
                  }),
                };
              });
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "validate",
                declaration_id: testDeclarationId,
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(result.data.valid).toBe(false);
            (0, globals_1.expect)(result.data.validation_errors).toHaveLength(2);
            (0, globals_1.expect)(result.data.validation_warnings).toHaveLength(1);
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
            // Mock database error
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
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "generate",
                declaration_type: "DEFIS",
                clinic_id: testClinicId,
                period: { year: testYear },
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(500);
            (0, globals_1.expect)(result.error).toBe("Failed to save declaration to database");
            return [2 /*return*/];
        }
      });
    });
  });
});
(0, globals_1.describe)("Performance Requirements - AC5", function () {
  (0, globals_1.it)("should generate DEFIS declaration within 10 seconds", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var startTime, request, response, endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "generate",
                declaration_type: "DEFIS",
                clinic_id: testClinicId,
                period: { year: testYear },
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            endTime = Date.now();
            (0, globals_1.expect)(response.status).toBe(201);
            (0, globals_1.expect)(endTime - startTime).toBeLessThan(10000); // 10 seconds
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should validate declaration within 3 seconds", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var startTime, request, response, endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "validate",
                declaration_id: testDeclarationId,
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            endTime = Date.now();
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(endTime - startTime).toBeLessThan(3000); // 3 seconds
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should handle concurrent declaration generations efficiently", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var concurrentRequests, startTime, responses, endTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            concurrentRequests = Array.from({ length: 3 }, function (_, index) {
              return new server_1.NextRequest("http://localhost/api/tax/declarations", {
                method: "POST",
                body: JSON.stringify({
                  action: "generate",
                  declaration_type: index === 0 ? "DEFIS" : index === 1 ? "DIMOB" : "DCTF",
                  clinic_id: testClinicId,
                  period: { year: testYear, month: index === 2 ? 12 : undefined },
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
            (0, globals_1.expect)(endTime - startTime).toBeLessThan(15000); // 15 seconds for 3 concurrent generations
            return [2 /*return*/];
        }
      });
    });
  });
});
(0, globals_1.describe)("Compliance and Audit Requirements", function () {
  (0, globals_1.it)("should maintain complete audit trail for declarations", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest(
              "http://localhost/api/tax/declarations?declaration_id=".concat(
                testDeclarationId,
                "&action=audit-trail",
              ),
            );
            return [4 /*yield*/, (0, route_1.GET)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(result.data).toHaveProperty("audit_events");
            (0, globals_1.expect)(result.data.audit_events).toBeInstanceOf(Array);
            (0, globals_1.expect)(result.data.audit_events[0]).toHaveProperty("event_type");
            (0, globals_1.expect)(result.data.audit_events[0]).toHaveProperty("timestamp");
            (0, globals_1.expect)(result.data.audit_events[0]).toHaveProperty("user_id");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should ensure declaration data integrity", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "verify-integrity",
                declaration_id: testDeclarationId,
                verification_level: "comprehensive",
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(result.data.integrity_verified).toBe(true);
            (0, globals_1.expect)(result.data).toHaveProperty("checksum");
            (0, globals_1.expect)(result.data).toHaveProperty("verification_timestamp");
            return [2 /*return*/];
        }
      });
    });
  });
  (0, globals_1.it)("should support digital signature verification", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var request, response, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            request = new server_1.NextRequest("http://localhost/api/tax/declarations", {
              method: "POST",
              body: JSON.stringify({
                action: "verify-signature",
                declaration_id: testDeclarationId,
                certificate_validation: true,
              }),
            });
            return [4 /*yield*/, (0, route_1.POST)(request)];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(result.data.signature_valid).toBeDefined();
            (0, globals_1.expect)(result.data).toHaveProperty("certificate_status");
            (0, globals_1.expect)(result.data).toHaveProperty("signature_timestamp");
            return [2 /*return*/];
        }
      });
    });
  });
});
