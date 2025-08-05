// Medical Knowledge Base Main API Endpoints
// Story 9.5: API endpoints for medical knowledge base management
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
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
      dashboard,
      statusFilter,
      typeFilter,
      sources,
      knowledgeId,
      knowledge,
      searchQuery,
      searchResults,
      specialty,
      guidelineStatus,
      conditions,
      guidelines,
      guidelineId,
      guideline,
      evidenceLevels,
      knowledgeTypes,
      categories,
      cacheQuery,
      sourceId,
      cachedResults,
      error_1;
    var _b, _c, _d, _e;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 25, , 26]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _f.sent().data.session;
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
            case "dashboard":
              return [3 /*break*/, 3];
            case "sources":
              return [3 /*break*/, 5];
            case "knowledge":
              return [3 /*break*/, 7];
            case "guidelines":
              return [3 /*break*/, 11];
            case "guideline":
              return [3 /*break*/, 13];
            case "evidence-levels":
              return [3 /*break*/, 15];
            case "knowledge-types":
              return [3 /*break*/, 17];
            case "categories":
              return [3 /*break*/, 19];
            case "cache":
              return [3 /*break*/, 21];
          }
          return [3 /*break*/, 23];
        case 3:
          return [4 /*yield*/, service.getKnowledgeBaseDashboard()];
        case 4:
          dashboard = _f.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: dashboard })];
        case 5:
          statusFilter = searchParams.get("status") || undefined;
          typeFilter = searchParams.get("type") || undefined;
          return [
            4 /*yield*/,
            service.getKnowledgeSources({
              status: statusFilter,
              source_type: typeFilter,
            }),
          ];
        case 6:
          sources = _f.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: sources })];
        case 7:
          knowledgeId = searchParams.get("id");
          if (!knowledgeId) return [3 /*break*/, 9];
          return [4 /*yield*/, service.getMedicalKnowledgeById(knowledgeId)];
        case 8:
          knowledge = _f.sent();
          if (!knowledge) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Knowledge not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: knowledge })];
        case 9:
          searchQuery = {
            query: searchParams.get("query") || undefined,
            filters: {
              knowledge_type:
                ((_b = searchParams.get("knowledge_type")) === null || _b === void 0
                  ? void 0
                  : _b.split(",")) || [],
              evidence_level:
                ((_c = searchParams.get("evidence_level")) === null || _c === void 0
                  ? void 0
                  : _c.split(",")) || [],
              medical_categories:
                ((_d = searchParams.get("medical_categories")) === null || _d === void 0
                  ? void 0
                  : _d.split(",")) || [],
              quality_threshold: searchParams.get("quality_threshold")
                ? parseFloat(searchParams.get("quality_threshold"))
                : undefined,
              date_range: {
                start: searchParams.get("date_start") || undefined,
                end: searchParams.get("date_end") || undefined,
              },
            },
            sort: {
              field: searchParams.get("sort_field") || "quality_score",
              direction: searchParams.get("sort_direction") || "desc",
            },
            pagination: {
              page: parseInt(searchParams.get("page") || "1"),
              limit: parseInt(searchParams.get("limit") || "20"),
            },
          };
          return [4 /*yield*/, service.searchMedicalKnowledge(searchQuery)];
        case 10:
          searchResults = _f.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: searchResults })];
        case 11:
          specialty = searchParams.get("specialty") || undefined;
          guidelineStatus = searchParams.get("status") || undefined;
          conditions =
            ((_e = searchParams.get("conditions")) === null || _e === void 0
              ? void 0
              : _e.split(",")) || undefined;
          return [
            4 /*yield*/,
            service.getMedicalGuidelines({
              specialty: specialty,
              status: guidelineStatus,
              conditions: conditions,
            }),
          ];
        case 12:
          guidelines = _f.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: guidelines })];
        case 13:
          guidelineId = searchParams.get("id");
          if (!guidelineId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Guideline ID required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, service.getGuidelineById(guidelineId)];
        case 14:
          guideline = _f.sent();
          if (!guideline) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Guideline not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: guideline })];
        case 15:
          return [4 /*yield*/, service.getEvidenceLevels()];
        case 16:
          evidenceLevels = _f.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: evidenceLevels }),
          ];
        case 17:
          return [4 /*yield*/, service.getKnowledgeTypes()];
        case 18:
          knowledgeTypes = _f.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: knowledgeTypes }),
          ];
        case 19:
          return [4 /*yield*/, service.getMedicalCategories()];
        case 20:
          categories = _f.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: categories })];
        case 21:
          cacheQuery = searchParams.get("query");
          sourceId = searchParams.get("source_id") || undefined;
          if (!cacheQuery) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Query required for cache lookup" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, service.getCachedSearchResults(cacheQuery, sourceId)];
        case 22:
          cachedResults = _f.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: cachedResults,
              cached: !!cachedResults,
            }),
          ];
        case 23:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action parameter" }, { status: 400 }),
          ];
        case 24:
          return [3 /*break*/, 26];
        case 25:
          error_1 = _f.sent();
          console.error("Medical Knowledge Base API Error:", error_1);
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
        case 26:
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
      source,
      knowledge,
      validationResult,
      cachedData,
      source_id,
      force_full,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 16, , 17]);
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
            case "create-source":
              return [3 /*break*/, 4];
            case "create-knowledge":
              return [3 /*break*/, 6];
            case "validate-evidence":
              return [3 /*break*/, 8];
            case "cache-results":
              return [3 /*break*/, 10];
            case "trigger-sync":
              return [3 /*break*/, 12];
          }
          return [3 /*break*/, 14];
        case 4:
          return [4 /*yield*/, service.createKnowledgeSource(data)];
        case 5:
          source = _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: source }, { status: 201 }),
          ];
        case 6:
          return [4 /*yield*/, service.createMedicalKnowledge(data)];
        case 7:
          knowledge = _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: knowledge }, { status: 201 }),
          ];
        case 8:
          return [4 /*yield*/, service.validateRecommendation(data)];
        case 9:
          validationResult = _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: validationResult }),
          ];
        case 10:
          return [4 /*yield*/, service.cacheSearchResults(data)];
        case 11:
          cachedData = _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: cachedData }, { status: 201 }),
          ];
        case 12:
          (source_id = data.source_id), (force_full = data.force_full);
          if (!source_id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Source ID required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, service.triggerSync(source_id, force_full || false)];
        case 13:
          _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, message: "Sync triggered successfully" }),
          ];
        case 14:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 15:
          return [3 /*break*/, 17];
        case 16:
          error_2 = _b.sent();
          console.error("Medical Knowledge Base API Error:", error_2);
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
        case 17:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, body, action, id, data, _a, updatedSource, updatedKnowledge, error_3;
    return __generator(this, (_b) => {
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
          (action = body.action), (id = body.id), (data = body.data);
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "ID required for update operations" },
                { status: 400 },
              ),
            ];
          }
          _a = action;
          switch (_a) {
            case "update-source":
              return [3 /*break*/, 4];
            case "update-knowledge":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 4:
          return [4 /*yield*/, service.updateKnowledgeSource(id, data)];
        case 5:
          updatedSource = _b.sent();
          return [2 /*return*/, server_2.NextResponse.json({ success: true, data: updatedSource })];
        case 6:
          return [4 /*yield*/, service.updateMedicalKnowledge(id, data)];
        case 7:
          updatedKnowledge = _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: true, data: updatedKnowledge }),
          ];
        case 8:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_3 = _b.sent();
          console.error("Medical Knowledge Base API Error:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: error_3 instanceof Error ? error_3.message : "Unknown error",
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
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, searchParams, id, action, _a, error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
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
          searchParams = new URL(request.url).searchParams;
          id = searchParams.get("id");
          action = searchParams.get("action");
          if (!id) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "ID required for delete operations" },
                { status: 400 },
              ),
            ];
          }
          _a = action;
          switch (_a) {
            case "delete-source":
              return [3 /*break*/, 3];
          }
          return [3 /*break*/, 5];
        case 3:
          return [4 /*yield*/, service.deleteKnowledgeSource(id)];
        case 4:
          _b.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Knowledge source deleted successfully",
            }),
          ];
        case 5:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 6:
          return [3 /*break*/, 8];
        case 7:
          error_4 = _b.sent();
          console.error("Medical Knowledge Base API Error:", error_4);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: error_4 instanceof Error ? error_4.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
