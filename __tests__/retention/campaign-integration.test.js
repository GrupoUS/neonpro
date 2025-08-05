"use strict";
// RETENTION CAMPAIGN INTEGRATION TESTS
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// Comprehensive test suite for retention campaign integration
// =====================================================================================
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var node_mocks_http_1 = require("node-mocks-http");
var route_1 = require("@/app/api/retention-analytics/campaigns/route");
var route_2 = require("@/app/api/retention-analytics/campaigns/[id]/route");
// =====================================================================================
// MOCKS
// =====================================================================================
// Mock Supabase client
jest.mock("@/app/utils/supabase/server", function () {
  return {
    createClient: jest.fn(function () {
      return {
        from: jest.fn(function () {
          return {
            select: jest.fn(function () {
              return {
                eq: jest.fn(function () {
                  return {
                    order: jest.fn(function () {
                      return {
                        data: mockCampaigns,
                        error: null,
                      };
                    }),
                    single: jest.fn(function () {
                      return {
                        data: mockCampaigns[0],
                        error: null,
                      };
                    }),
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            data: mockCampaigns,
                            error: null,
                          };
                        }),
                      };
                    }),
                    in: jest.fn(function () {
                      return {
                        data: mockCampaigns.slice(0, 2),
                        error: null,
                      };
                    }),
                  };
                }),
                insert: jest.fn(function () {
                  return {
                    select: jest.fn(function () {
                      return {
                        data: [mockCampaigns[0]],
                        error: null,
                      };
                    }),
                  };
                }),
                update: jest.fn(function () {
                  return {
                    eq: jest.fn(function () {
                      return {
                        select: jest.fn(function () {
                          return {
                            data: [
                              __assign(__assign({}, mockCampaigns[0]), {
                                name: "Updated Campaign",
                              }),
                            ],
                            error: null,
                          };
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
    }),
  };
});
// Mock campaign data
var mockCampaigns = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    clinic_id: "22222222-2222-2222-2222-222222222222",
    name: "High-Risk Patient Re-engagement",
    target_segments: ["high_churn_risk"],
    intervention_strategy: {
      type: "personalized_communication",
      channels: ["email", "sms"],
      content_template_id: "retention_001",
      timing: { days_since_last_visit: 30 },
      frequency_cap: { max_per_month: 2 },
    },
    measurement_criteria: {
      success_metrics: ["retention_rate", "booking_conversion"],
      target_improvement: 15,
      measurement_window_days: 90,
      abtest_enabled: true,
      abtest_split_percentage: 50,
    },
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    campaign_metrics: [
      {
        sent: 1000,
        delivered: 950,
        opened: 380,
        clicked: 76,
        conversions: 45,
        revenue: 22500,
        costs: 1200,
      },
    ],
    executions: [
      {
        id: "33333333-3333-3333-3333-333333333333",
        patients_targeted: 250,
        status: "executed",
        executed_at: "2024-01-16T09:00:00Z",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        patients_targeted: 300,
        status: "executed",
        executed_at: "2024-01-17T09:00:00Z",
      },
    ],
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    clinic_id: "22222222-2222-2222-2222-222222222222",
    name: "First-Time Patient Follow-up",
    target_segments: ["new_patients"],
    intervention_strategy: {
      type: "educational_series",
      channels: ["email"],
      content_template_id: "education_001",
      timing: { days_after_first_visit: 7 },
      frequency_cap: { max_per_month: 4 },
    },
    measurement_criteria: {
      success_metrics: ["retention_rate", "satisfaction_score"],
      target_improvement: 20,
      measurement_window_days: 60,
      abtest_enabled: false,
    },
    status: "draft",
    created_at: "2024-01-20T10:00:00Z",
    campaign_metrics: [
      {
        sent: 500,
        delivered: 485,
        opened: 242,
        clicked: 48,
        conversions: 30,
        revenue: 15000,
        costs: 800,
      },
    ],
    executions: [],
  },
];
// =====================================================================================
// CAMPAIGN CRUD TESTS
// =====================================================================================
describe("/api/retention-analytics/campaigns", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  describe("GET - List campaigns", function () {
    it("should return campaigns for a clinic", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns?clinic_id=22222222-2222-2222-2222-222222222222",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.campaigns).toHaveLength(2);
              expect(responseData.data.campaigns[0].name).toBe("High-Risk Patient Re-engagement");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should filter campaigns by status", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns?clinic_id=22222222-2222-2222-2222-222222222222&status=active",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(
                responseData.data.campaigns.every(function (c) {
                  return c.status === "active";
                }),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should return 400 for invalid clinic_id", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/retention-analytics/campaigns?clinic_id=invalid-uuid",
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(400);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("Invalid query parameters");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("POST - Create campaign", function () {
    it("should create a new retention campaign", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var campaignData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              campaignData = {
                clinic_id: "22222222-2222-2222-2222-222222222222",
                name: "New Retention Campaign",
                target_segments: ["moderate_churn_risk"],
                intervention_strategy: {
                  type: "incentive_offer",
                  channels: ["email"],
                  content_template_id: "incentive_001",
                  timing: { days_since_last_visit: 45 },
                },
                measurement_criteria: {
                  success_metrics: ["retention_rate"],
                  target_improvement: 10,
                  measurement_window_days: 60,
                },
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: campaignData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(201);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.campaign.name).toBe("New Retention Campaign");
              expect(responseData.data.campaign.status).toBe("draft");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate required fields", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              invalidData = {
                name: "Incomplete Campaign",
                // Missing required fields
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: invalidData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(400);
              responseData = JSON.parse(res._getData());
              expect(responseData.error).toBe("Invalid campaign data");
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
// =====================================================================================
// CAMPAIGN EXECUTION TESTS
// =====================================================================================
describe("/api/retention-analytics/campaigns/[id]", function () {
  describe("PUT - Execute campaign", function () {
    it("should execute a retention campaign", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var executionData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              executionData = {
                execution_type: "immediate",
                target_criteria: {
                  patient_segments: ["high_churn_risk"],
                  max_patients: 100,
                },
                test_mode: false,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "PUT",
                body: executionData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [
                4 /*yield*/,
                (0, route_2.PUT)(req, { params: { id: "11111111-1111-1111-1111-111111111111" } }),
              ];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.execution).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle test mode execution", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var testExecutionData, _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              testExecutionData = {
                execution_type: "test",
                target_criteria: {
                  patient_segments: ["high_churn_risk"],
                  max_patients: 10,
                },
                test_mode: true,
              };
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "PUT",
                body: testExecutionData,
              })),
                (req = _a.req),
                (res = _a.res);
              return [
                4 /*yield*/,
                (0, route_2.PUT)(req, { params: { id: "11111111-1111-1111-1111-111111111111" } }),
              ];
            case 1:
              _b.sent();
              responseData = JSON.parse(res._getData());
              expect(responseData.data.execution.test_mode).toBe(true);
              expect(responseData.data.execution.patients_targeted).toBeLessThanOrEqual(10);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("GET - Get campaign by ID", function () {
    it("should return campaign details with metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, responseData;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
              })),
                (req = _a.req),
                (res = _a.res);
              return [
                4 /*yield*/,
                (0, route_2.GET)(req, { params: { id: "11111111-1111-1111-1111-111111111111" } }),
              ];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(200);
              responseData = JSON.parse(res._getData());
              expect(responseData.success).toBe(true);
              expect(responseData.data.campaign.id).toBe("11111111-1111-1111-1111-111111111111");
              expect(responseData.data.campaign.name).toBe("High-Risk Patient Re-engagement");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should return 404 for non-existent campaign", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, _a, req, res;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockSupabase = require("@/app/utils/supabase/server").createClient();
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockReturnValueOnce({
                  data: null,
                  error: { message: "Not found" },
                });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
              })),
                (req = _a.req),
                (res = _a.res);
              return [
                4 /*yield*/,
                (0, route_2.GET)(req, { params: { id: "99999999-9999-9999-9999-999999999999" } }),
              ];
            case 1:
              _b.sent();
              expect(res._getStatusCode()).toBe(404);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
