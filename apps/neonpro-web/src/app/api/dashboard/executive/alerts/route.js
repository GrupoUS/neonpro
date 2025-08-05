"use strict";
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var alert_system_1 = require("@/lib/dashboard/executive/alert-system");
// Schema for alert rule creation/update
var CreateAlertRuleSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome ï¿½ obrigatï¿½rio"),
  description: zod_1.z.string().optional(),
  kpiDefinitionId: zod_1.z.string().uuid().optional(),
  conditionType: zod_1.z.enum(["threshold", "trend", "anomaly", "custom"]),
  conditionConfig: zod_1.z.record(zod_1.z.any()),
  severity: zod_1.z.enum(["info", "warning", "critical"]).default("warning"),
  notificationConfig: zod_1.z
    .object({
      email: zod_1.z
        .object({
          enabled: zod_1.z.boolean().default(false),
          recipients: zod_1.z.array(zod_1.z.string().email()).default([]),
        })
        .optional(),
      sms: zod_1.z
        .object({
          enabled: zod_1.z.boolean().default(false),
          recipients: zod_1.z.array(zod_1.z.string()).default([]),
        })
        .optional(),
      push: zod_1.z
        .object({
          enabled: zod_1.z.boolean().default(false),
          recipients: zod_1.z.array(zod_1.z.string()).default([]),
        })
        .optional(),
      webhook: zod_1.z
        .object({
          enabled: zod_1.z.boolean().default(false),
          url: zod_1.z.string().url().optional(),
          headers: zod_1.z.record(zod_1.z.string()).optional(),
        })
        .optional(),
    })
    .default({}),
  cooldownMinutes: zod_1.z.number().min(1).default(60),
});
var UpdateAlertRuleSchema = CreateAlertRuleSchema.partial();
// Schema for alert instance actions
var AlertActionSchema = zod_1.z.object({
  action: zod_1.z.enum(["acknowledge", "resolve", "dismiss"]),
  comment: zod_1.z.string().optional(),
});
// GET /api/dashboard/executive/alerts
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      clinicUser,
      searchParams,
      type,
      status_1,
      severity,
      limit,
      offset,
      alertSystem,
      rules,
      filters,
      instances,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 8, , 9]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Nï¿½o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Usuï¿½rio nï¿½o associado a uma clï¿½nica" },
                { status: 403 },
              ),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          type = searchParams.get("type");
          status_1 = searchParams.get("status");
          severity = searchParams.get("severity");
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          alertSystem = new alert_system_1.AlertSystem(supabase, clinicUser.clinic_id);
          if (!(type === "rules")) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            alertSystem.getAlertRules({
              isActive: status_1 !== "inactive",
            }),
          ];
        case 4:
          rules = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ rules: rules })];
        case 5:
          filters = {};
          if (status_1) filters.status = status_1;
          if (severity) filters.severity = severity;
          return [4 /*yield*/, alertSystem.getAlertInstances(filters, limit, offset)];
        case 6:
          instances = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ instances: instances })];
        case 7:
          return [3 /*break*/, 9];
        case 8:
          error_1 = _b.sent();
          console.error("Error fetching alerts:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/dashboard/executive/alerts
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, clinicUser, body, validatedData, alertSystem, rule, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Nï¿½o autorizado" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinic_users").select("clinic_id").eq("user_id", user.id).single(),
          ];
        case 3:
          clinicUser = _b.sent().data;
          if (!clinicUser) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Usuï¿½rio nï¿½o associado a uma clï¿½nica" },
                { status: 403 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = CreateAlertRuleSchema.parse(body);
          alertSystem = new alert_system_1.AlertSystem(supabase, clinicUser.clinic_id);
          return [4 /*yield*/, alertSystem.createAlertRule(validatedData)];
        case 5:
          rule = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ rule: rule }, { status: 201 })];
        case 6:
          error_2 = _b.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Dados invï¿½lidos", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("Error creating alert rule:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
