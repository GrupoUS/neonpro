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
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Schema de validaï¿½ï¿½o para configuraï¿½ï¿½o de automaï¿½ï¿½o
var AutomationConfigSchema = zod_1.z.object({
  enabled: zod_1.z.boolean(),
  schedules: zod_1.z.object({
    consentExpiry: zod_1.z.string(),
    dataRetention: zod_1.z.string(),
    auditReports: zod_1.z.string(),
    healthChecks: zod_1.z.string(),
    anonymization: zod_1.z.string(),
  }),
  notifications: zod_1.z.object({
    email: zod_1.z.boolean(),
    webhook: zod_1.z.boolean(),
    dashboard: zod_1.z.boolean(),
    webhookUrl: zod_1.z.string().url().optional(),
  }),
  thresholds: zod_1.z.object({
    riskScore: zod_1.z.number().min(0).max(100),
    complianceScore: zod_1.z.number().min(0).max(100),
    auditCoverage: zod_1.z.number().min(0).max(100),
    consentExpiryDays: zod_1.z.number().min(1).max(365),
  }),
  features: zod_1.z.object({
    autoConsentManagement: zod_1.z.boolean(),
    autoDataSubjectRights: zod_1.z.boolean(),
    autoAuditReporting: zod_1.z.boolean(),
    autoAnonymization: zod_1.z.boolean(),
    realTimeMonitoring: zod_1.z.boolean(),
  }),
});
// GET - Obter configuraï¿½ï¿½o atual
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, session, authError, _b, config, error, defaultConfig, error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_automation_config")
              .select("*")
              .eq("clinic_id", session.user.user_metadata.clinic_id)
              .single(),
          ];
        case 3:
          (_b = _c.sent()), (config = _b.data), (error = _b.error);
          if (error && error.code !== "PGRST116") {
            throw error;
          }
          // Se nï¿½o existe configuraï¿½ï¿½o, retornar padrï¿½o
          if (!config) {
            defaultConfig = {
              enabled: false,
              schedules: {
                consentExpiry: "0 2 * * *", // 2h da manhï¿½ diariamente
                dataRetention: "0 3 * * 0", // 3h da manhï¿½ aos domingos
                auditReports: "0 1 1 * *", // 1h da manhï¿½ no primeiro dia do mï¿½s
                healthChecks: "0 */6 * * *", // A cada 6 horas
                anonymization: "0 4 * * 0", // 4h da manhï¿½ aos domingos
              },
              notifications: {
                email: true,
                webhook: false,
                dashboard: true,
                webhookUrl: "",
              },
              thresholds: {
                riskScore: 70,
                complianceScore: 85,
                auditCoverage: 90,
                consentExpiryDays: 365,
              },
              features: {
                autoConsentManagement: true,
                autoDataSubjectRights: true,
                autoAuditReporting: true,
                autoAnonymization: false,
                realTimeMonitoring: true,
              },
            };
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                data: defaultConfig,
              }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: config.config,
            }),
          ];
        case 4:
          error_1 = _c.sent();
          console.error("Erro ao obter configuraï¿½ï¿½o:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// PUT - Atualizar configuraï¿½ï¿½o
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      validationResult,
      config,
      clinicId,
      _b,
      data,
      error,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validationResult = AutomationConfigSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados invï¿½lidos",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          config = validationResult.data;
          clinicId = session.user.user_metadata.clinic_id;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_automation_config")
              .upsert({
                clinic_id: clinicId,
                config: config,
                updated_at: new Date().toISOString(),
                updated_by: session.user.id,
              })
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (data = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          // Registrar evento de auditoria
          return [
            4 /*yield*/,
            supabase.from("lgpd_audit_trail").insert({
              clinic_id: clinicId,
              event_type: "system",
              action: "automation_config_updated",
              user_id: session.user.id,
              details: {
                previousConfig: body.previousConfig || null,
                newConfig: config,
              },
              severity: "info",
            }),
          ];
        case 5:
          // Registrar evento de auditoria
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data.config,
              message: "Configuraï¿½ï¿½o atualizada com sucesso",
            }),
          ];
        case 6:
          error_2 = _c.sent();
          console.error("Erro ao atualizar configuraï¿½ï¿½o:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
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
