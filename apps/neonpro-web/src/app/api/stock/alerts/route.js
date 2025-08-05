/**
 * Story 11.4: Stock Alerts API Routes
 * API para gerenciamento de alertas de estoque
 */
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
var stock_alerts_service_1 = require("@/app/lib/services/stock-alerts.service");
var stock_alerts_1 = require("@/app/lib/types/stock-alerts");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var alertsService = new stock_alerts_service_1.StockAlertsService();
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, profile, searchParams, queryFilters, validatedQuery, result, error_1;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          queryFilters = {
            status: searchParams.get("status"),
            severity: searchParams.get("severity"),
            type: searchParams.get("type"),
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")) : undefined,
          };
          validatedQuery = (0, stock_alerts_1.validateAlertsQuery)(
            __assign(__assign({}, queryFilters), {
              sortBy: searchParams.get("sortBy") || "created_at",
              sortOrder: searchParams.get("sortOrder") || "desc",
            }),
          );
          return [
            4 /*yield*/,
            alertsService.getActiveAlerts(profile.clinic_id, {
              severity: validatedQuery.severity ? [validatedQuery.severity] : undefined,
              type: validatedQuery.type ? [validatedQuery.type] : undefined,
              status: validatedQuery.status ? [validatedQuery.status] : undefined,
              limit: validatedQuery.limit,
            }),
          ];
        case 4:
          result = _b.sent();
          if (!result.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: result.error }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              data: result.data,
              meta: {
                total: ((_a = result.data) === null || _a === void 0 ? void 0 : _a.length) || 0,
                filters: validatedQuery,
              },
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Error in GET /api/stock/alerts:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      profile,
      body,
      action,
      _a,
      ackResult,
      resolveResult,
      dismissResult,
      generateResult,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 15, , 16]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          action = body.action;
          _a = action;
          switch (_a) {
            case "acknowledge":
              return [3 /*break*/, 5];
            case "resolve":
              return [3 /*break*/, 7];
            case "dismiss":
              return [3 /*break*/, 9];
            case "generate":
              return [3 /*break*/, 11];
          }
          return [3 /*break*/, 13];
        case 5:
          return [4 /*yield*/, alertsService.acknowledgeAlert(body.data, user.id)];
        case 6:
          ackResult = _b.sent();
          if (!ackResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: ackResult.error }, { status: 400 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ data: ackResult.data })];
        case 7:
          return [4 /*yield*/, alertsService.resolveAlert(body.data, user.id)];
        case 8:
          resolveResult = _b.sent();
          if (!resolveResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: resolveResult.error }, { status: 400 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ data: resolveResult.data })];
        case 9:
          return [
            4 /*yield*/,
            alertsService.dismissAlert(body.data.alert_id, user.id, body.data.reason),
          ];
        case 10:
          dismissResult = _b.sent();
          if (!dismissResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: dismissResult.error }, { status: 400 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ data: dismissResult.data })];
        case 11:
          return [4 /*yield*/, alertsService.generateAlerts(profile.clinic_id)];
        case 12:
          generateResult = _b.sent();
          if (!generateResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: generateResult.error }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ data: generateResult.data })];
        case 13:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 14:
          return [3 /*break*/, 16];
        case 15:
          error_2 = _b.sent();
          console.error("Error in POST /api/stock/alerts:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
