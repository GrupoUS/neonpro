"use strict";
// Drug Search and Interaction API Endpoints
// Story 9.5: API endpoints for drug information and interaction checking
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
exports.GET = GET;
exports.POST = POST;
var medical_knowledge_base_1 = require("@/app/lib/services/medical-knowledge-base");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var service = new medical_knowledge_base_1.MedicalKnowledgeBaseService();
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      searchParams,
      action,
      _a,
      searchQuery,
      searchResults,
      drugId,
      drug,
      drugIds,
      interactions,
      error_1;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 11, , 12]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          _a = action;
          switch (_a) {
            case "search":
              return [3 /*break*/, 3];
            case "drug":
              return [3 /*break*/, 5];
            case "interactions":
              return [3 /*break*/, 7];
          }
          return [3 /*break*/, 9];
        case 3:
          searchQuery = {
            drug_name: searchParams.get("drug_name") || undefined,
            generic_name: searchParams.get("generic_name") || undefined,
            drug_class: searchParams.get("drug_class") || undefined,
            indication: searchParams.get("indication") || undefined,
            interaction_check:
              ((_b = searchParams.get("interaction_check")) === null || _b === void 0
                ? void 0
                : _b.split(",")) || undefined,
          };
          return [4 /*yield*/, service.searchDrugs(searchQuery)];
        case 4:
          searchResults = _d.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: searchResults })];
        case 5:
          drugId = searchParams.get("id");
          if (!drugId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Drug ID required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, service.getDrugById(drugId)];
        case 6:
          drug = _d.sent();
          if (!drug) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Drug not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: drug })];
        case 7:
          drugIds =
            (_c = searchParams.get("drug_ids")) === null || _c === void 0 ? void 0 : _c.split(",");
          if (!drugIds || drugIds.length < 2) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "At least 2 drug IDs required for interaction check",
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, service.checkDrugInteractions(drugIds)];
        case 8:
          interactions = _d.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: interactions })];
        case 9:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action parameter" }, { status: 400 }),
          ];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_1 = _d.sent();
          console.error("Drug Search API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      action,
      data,
      _a,
      queries,
      batchResults,
      drug_combinations,
      patient_factors,
      complexInteractions,
      allInteractions,
      uniqueInteractions,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          (action = body.action), (data = body.data);
          _a = action;
          switch (_a) {
            case "batch-search":
              return [3 /*break*/, 4];
            case "complex-interaction-check":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 4:
          queries = data.queries;
          if (!Array.isArray(queries)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Queries must be an array" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all(
              queries.map(function (query) {
                return service.searchDrugs(query);
              }),
            ),
          ];
        case 5:
          batchResults = _b.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: batchResults })];
        case 6:
          (drug_combinations = data.drug_combinations), (patient_factors = data.patient_factors);
          if (!Array.isArray(drug_combinations) || drug_combinations.length === 0) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Drug combinations required",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all(
              drug_combinations.map(function (combo) {
                return service.checkDrugInteractions(combo);
              }),
            ),
          ];
        case 7:
          complexInteractions = _b.sent();
          allInteractions = complexInteractions.flat();
          uniqueInteractions = allInteractions.filter(function (interaction, index, arr) {
            return (
              arr.findIndex(function (i) {
                return i.id === interaction.id;
              }) === index
            );
          });
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: {
                interactions: uniqueInteractions,
                combination_count: drug_combinations.length,
                patient_factors: patient_factors || {},
                risk_assessment: {
                  total_interactions: uniqueInteractions.length,
                  high_severity: uniqueInteractions.filter(function (i) {
                    return i.severity_level >= 8;
                  }).length,
                  moderate_severity: uniqueInteractions.filter(function (i) {
                    return i.severity_level >= 5 && i.severity_level < 8;
                  }).length,
                  low_severity: uniqueInteractions.filter(function (i) {
                    return i.severity_level < 5;
                  }).length,
                },
              },
            }),
          ];
        case 8:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_2 = _b.sent();
          console.error("Drug Search API Error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
