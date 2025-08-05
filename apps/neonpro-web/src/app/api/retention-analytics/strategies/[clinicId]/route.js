// =====================================================================================
// RETENTION STRATEGIES API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for retention strategy management and execution
// =====================================================================================
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var retention_analytics_1 = require("@/app/types/retention-analytics");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var StrategiesParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
var StrategiesQuerySchema = zod_1.z.object({
  activeOnly: zod_1.z.coerce.boolean().default(false),
  strategyType: zod_1.z.nativeEnum(retention_analytics_1.RetentionStrategyType).optional(),
  status: zod_1.z.nativeEnum(retention_analytics_1.RetentionStrategyStatus).optional(),
  limit: zod_1.z.coerce.number().min(1).max(200).default(50),
  offset: zod_1.z.coerce.number().min(0).default(0),
  sortBy: zod_1.z.enum(["created_at", "updated_at", "name", "success_rate"]).default("created_at"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
var CreateStrategySchema = zod_1.z.object({
  name: zod_1.z.string().min(1).max(200),
  description: zod_1.z.string().min(1).max(1000),
  strategy_type: zod_1.z.nativeEnum(retention_analytics_1.RetentionStrategyType),
  trigger_conditions: zod_1.z.record(zod_1.z.any()),
  action_sequence: zod_1.z.array(zod_1.z.record(zod_1.z.any())),
  target_criteria: zod_1.z.record(zod_1.z.any()),
  priority: zod_1.z.number().min(1).max(10).default(5),
  is_active: zod_1.z.boolean().default(true),
  schedule_config: zod_1.z.record(zod_1.z.any()).optional(),
});
var ExecuteStrategySchema = zod_1.z.object({
  strategyId: zod_1.z.string().uuid("Invalid strategy ID format"),
  patientIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  executeImmediately: zod_1.z.boolean().default(false),
  scheduledAt: zod_1.z.string().optional(),
});
// =====================================================================================
// GET RETENTION STRATEGIES
// =====================================================================================
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId,
      searchParams,
      queryValidation,
      _c,
      activeOnly,
      strategyType_1,
      status_1,
      limit,
      offset,
      sortBy_1,
      sortOrder_1,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      retentionService,
      strategies,
      filteredStrategies_1,
      paginatedStrategies,
      summary,
      error_1;
    var params = _b.params;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 5, , 6]);
          clinicValidation = StrategiesParamsSchema.safeParse({
            clinicId: params.clinicId,
          });
          if (!clinicValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid clinic ID",
                  details: clinicValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          clinicId = clinicValidation.data.clinicId;
          searchParams = new URL(request.url).searchParams;
          queryValidation = StrategiesQuerySchema.safeParse({
            activeOnly: searchParams.get("activeOnly"),
            strategyType: searchParams.get("strategyType"),
            status: searchParams.get("status"),
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
            sortBy: searchParams.get("sortBy"),
            sortOrder: searchParams.get("sortOrder"),
          });
          if (!queryValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  details: queryValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_c = queryValidation.data),
            (activeOnly = _c.activeOnly),
            (strategyType_1 = _c.strategyType),
            (status_1 = _c.status),
            (limit = _c.limit),
            (offset = _c.offset),
            (sortBy_1 = _c.sortBy),
            (sortOrder_1 = _c.sortOrder);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_d = _f.sent()), (user = _d.data.user), (authError = _d.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 3:
          (_e = _f.sent()), (userProfile = _e.data), (profileError = _e.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User profile not found" }, { status: 403 }),
            ];
          }
          if (userProfile.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to clinic data" },
                { status: 403 },
              ),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [4 /*yield*/, retentionService.getRetentionStrategies(clinicId, activeOnly)];
        case 4:
          strategies = _f.sent();
          filteredStrategies_1 = strategies;
          if (strategyType_1) {
            filteredStrategies_1 = filteredStrategies_1.filter(
              (s) => s.strategy_type === strategyType_1,
            );
          }
          if (status_1) {
            filteredStrategies_1 = filteredStrategies_1.filter((s) => s.status === status_1);
          }
          // Apply sorting
          filteredStrategies_1.sort((a, b) => {
            var valueA, valueB;
            switch (sortBy_1) {
              case "created_at":
                valueA = new Date(a.created_at);
                valueB = new Date(b.created_at);
                break;
              case "updated_at":
                valueA = new Date(a.updated_at);
                valueB = new Date(b.updated_at);
                break;
              case "name":
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
              case "success_rate":
                valueA = a.success_rate || 0;
                valueB = b.success_rate || 0;
                break;
              default:
                valueA = new Date(a.created_at);
                valueB = new Date(b.created_at);
            }
            if (sortOrder_1 === "desc") {
              return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            } else {
              return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            }
          });
          paginatedStrategies = filteredStrategies_1.slice(offset, offset + limit);
          summary = {
            total_strategies: filteredStrategies_1.length,
            active_strategies: filteredStrategies_1.filter((s) => s.is_active).length,
            strategy_types: Object.values(retention_analytics_1.RetentionStrategyType).map(
              (type) => ({
                type: type,
                count: filteredStrategies_1.filter((s) => s.strategy_type === type).length,
              }),
            ),
            average_success_rate:
              filteredStrategies_1.reduce((sum, s) => sum + (s.success_rate || 0), 0) /
                filteredStrategies_1.length || 0,
            total_executions: filteredStrategies_1.reduce((sum, s) => sum + s.execution_count, 0),
            successful_executions: filteredStrategies_1.reduce(
              (sum, s) => sum + s.successful_executions,
              0,
            ),
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                strategies: paginatedStrategies,
                summary: summary,
                pagination: {
                  limit: limit,
                  offset: offset,
                  total: filteredStrategies_1.length,
                  hasMore: offset + limit < filteredStrategies_1.length,
                },
                filters: {
                  activeOnly: activeOnly,
                  strategyType: strategyType_1,
                  status: status_1,
                  sortBy: sortBy_1,
                  sortOrder: sortOrder_1,
                },
              },
              timestamp: new Date().toISOString(),
            }),
          ];
        case 5:
          error_1 = _f.sent();
          console.error("Error getting retention strategies:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// CREATE RETENTION STRATEGY
// =====================================================================================
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId,
      body,
      validation,
      strategyData,
      supabase,
      _c,
      user,
      authError,
      _d,
      userProfile,
      profileError,
      allowedRoles,
      retentionService,
      createData,
      strategy,
      error_2;
    var params = _b.params;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          clinicValidation = StrategiesParamsSchema.safeParse({
            clinicId: params.clinicId,
          });
          if (!clinicValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid clinic ID",
                  details: clinicValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          clinicId = clinicValidation.data.clinicId;
          return [4 /*yield*/, request.json()];
        case 1:
          body = _e.sent();
          validation = CreateStrategySchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid strategy data",
                  details: validation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          strategyData = validation.data;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 4:
          (_d = _e.sent()), (userProfile = _d.data), (profileError = _d.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User profile not found" }, { status: 403 }),
            ];
          }
          if (userProfile.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to clinic data" },
                { status: 403 },
              ),
            ];
          }
          allowedRoles = ["admin", "manager", "analyst"];
          if (!allowedRoles.includes(userProfile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions to create strategies" },
                { status: 403 },
              ),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          createData = __assign(__assign({}, strategyData), {
            clinic_id: clinicId,
            created_by: user.id,
          });
          return [4 /*yield*/, retentionService.createRetentionStrategy(createData)];
        case 5:
          strategy = _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: strategy,
              message: "Retention strategy created successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          error_2 = _e.sent();
          console.error("Error creating retention strategy:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
