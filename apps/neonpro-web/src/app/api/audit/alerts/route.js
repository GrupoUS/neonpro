"use strict";
/**
 * NeonPro Security Alerts API
 *
 * API para gestao de alertas de seguranca do sistema de auditoria.
 * Permite consulta, atualizacao de status e atribuicao de alertas.
 *
 * Endpoints:
 * - GET /api/audit/alerts - Lista alertas
 * - PATCH /api/audit/alerts - Atualiza status de alerta
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
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
exports.PATCH = PATCH;
exports.POST = POST;
var server_1 = require("next/server");
var client_1 = require("@/lib/supabase/client");
var zod_1 = require("zod");
var audit_system_1 = require("@/lib/audit/audit-system");
var rate_limiting_1 = require("@/lib/security/rate-limiting");
// Rate limiting: 100 requests per minute
var limiter = (0, rate_limiting_1.rateLimit)({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
/**
 * Schema para filtragem de alertas
 */
var AlertsFilterSchema = zod_1.z.object({
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  status: zod_1.z.enum(["open", "investigating", "resolved", "false_positive"]).optional(),
  date_from: zod_1.z.string().optional(),
  date_to: zod_1.z.string().optional(),
  assigned_to: zod_1.z.string().optional(),
  limit: zod_1.z.number().min(1).max(100).default(20),
  offset: zod_1.z.number().min(0).default(0),
});
/**
 * Schema para atualizacao de alerta
 */
var UpdateAlertSchema = zod_1.z.object({
  alert_id: zod_1.z.string().uuid(),
  status: zod_1.z.enum(["open", "investigating", "resolved", "false_positive"]),
  assigned_to: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
});
/**
 * GET /api/audit/alerts
 *
 * Lista alertas de seguranca com filtros opcionais
 *
 * Query Parameters:
 * - severity: Nivel de severidade (low, medium, high, critical)
 * - status: Status do alerta (open, investigating, resolved, false_positive)
 * - date_from: Data inicial (ISO string)
 * - date_to: Data final (ISO string)
 * - assigned_to: ID do usuario responsavel
 * - limit: Limite de resultados (1-100, default: 20)
 * - offset: Deslocamento para paginacao (default: 0)
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      success,
      rateLimit_1,
      remaining,
      reset,
      url,
      searchParams,
      validatedParams,
      supabase,
      query,
      _b,
      alerts,
      error,
      count,
      totalCount,
      error_1;
    var _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 7, , 9]);
          return [
            4 /*yield*/,
            limiter.check((_c = request.ip) !== null && _c !== void 0 ? _c : "anonymous"),
          ];
        case 1:
          (_a = _d.sent()),
            (success = _a.success),
            (rateLimit_1 = _a.limit),
            (remaining = _a.remaining),
            (reset = _a.reset);
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Rate limit exceeded",
                  limit: rateLimit_1,
                  remaining: remaining,
                  reset: reset,
                },
                { status: 429 },
              ),
            ];
          }
          url = new URL(request.url);
          searchParams = Object.fromEntries(url.searchParams.entries());
          // Convert numeric strings
          if (searchParams.limit) searchParams.limit = parseInt(searchParams.limit);
          if (searchParams.offset) searchParams.offset = parseInt(searchParams.offset);
          validatedParams = AlertsFilterSchema.parse(searchParams);
          supabase = (0, client_1.createClient)();
          query = supabase
            .from("security_alerts")
            .select(
              "\n        id,\n        type,\n        severity,\n        status,\n        title,\n        description,\n        source_ip,\n        user_id,\n        resource_affected,\n        metadata,\n        assigned_to,\n        created_at,\n        updated_at,\n        resolved_at,\n        notes\n      ",
            );
          // Apply filters
          if (validatedParams.severity) {
            query = query.eq("severity", validatedParams.severity);
          }
          if (validatedParams.status) {
            query = query.eq("status", validatedParams.status);
          }
          if (validatedParams.date_from) {
            query = query.gte("created_at", validatedParams.date_from);
          }
          if (validatedParams.date_to) {
            query = query.lte("created_at", validatedParams.date_to);
          }
          if (validatedParams.assigned_to) {
            query = query.eq("assigned_to", validatedParams.assigned_to);
          }
          // Apply pagination and ordering
          query = query
            .order("created_at", { ascending: false })
            .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);
          return [4 /*yield*/, query];
        case 2:
          (_b = _d.sent()), (alerts = _b.data), (error = _b.error), (count = _b.count);
          if (!error) return [3 /*break*/, 4];
          console.error("Error fetching security alerts:", error);
          // Log audit event for error
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_ACCESS,
              severity: audit_system_1.AuditSeverity.HIGH,
              description: "Failed to fetch security alerts: ".concat(error.message),
              metadata: {
                error: error.message,
                filters: validatedParams,
              },
            }),
          ];
        case 3:
          // Log audit event for error
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to fetch security alerts" },
              { status: 500 },
            ),
          ];
        case 4:
          return [
            4 /*yield*/,
            supabase
              .from("security_alerts")
              .select("*", { count: "exact", head: true }),
            // Log successful access
          ];
        case 5:
          totalCount = _d.sent().count;
          // Log successful access
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_ACCESS,
              severity: audit_system_1.AuditSeverity.MEDIUM,
              description: "Security alerts accessed successfully",
              metadata: {
                filters: validatedParams,
                count: (alerts === null || alerts === void 0 ? void 0 : alerts.length) || 0,
              },
            }),
          ];
        case 6:
          // Log successful access
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              alerts: alerts,
              pagination: {
                limit: validatedParams.limit,
                offset: validatedParams.offset,
                total: totalCount,
                hasMore: validatedParams.offset + validatedParams.limit < (totalCount || 0),
              },
            }),
          ];
        case 7:
          error_1 = _d.sent();
          console.error("Security alerts API error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid parameters",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          // Log audit event for unexpected error
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_ACCESS,
              severity: audit_system_1.AuditSeverity.HIGH,
              description: "Unexpected error in security alerts API: ".concat(
                error_1 instanceof Error ? error_1.message : "Unknown error",
              ),
              metadata: {
                error: error_1 instanceof Error ? error_1.stack : error_1,
              },
            }),
          ];
        case 8:
          // Log audit event for unexpected error
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PATCH /api/audit/alerts
 *
 * Atualiza status e informacoes de um alerta de seguranca
 *
 * Body:
 * - alert_id: ID do alerta (UUID)
 * - status: Novo status (open, investigating, resolved, false_positive)
 * - assigned_to: ID do usuario responsavel (opcional)
 * - notes: Observacoes sobre a atualizacao (opcional)
 */
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      success,
      rateLimit_2,
      remaining,
      reset,
      body,
      validatedData,
      supabase,
      updateData,
      _b,
      updatedAlert,
      error,
      error_2;
    var _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 7, , 9]);
          return [
            4 /*yield*/,
            limiter.check((_c = request.ip) !== null && _c !== void 0 ? _c : "anonymous"),
          ];
        case 1:
          (_a = _d.sent()),
            (success = _a.success),
            (rateLimit_2 = _a.limit),
            (remaining = _a.remaining),
            (reset = _a.reset);
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Rate limit exceeded",
                  limit: rateLimit_2,
                  remaining: remaining,
                  reset: reset,
                },
                { status: 429 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _d.sent();
          validatedData = UpdateAlertSchema.parse(body);
          supabase = (0, client_1.createClient)();
          updateData = {
            status: validatedData.status,
            updated_at: new Date().toISOString(),
          };
          if (validatedData.assigned_to) {
            updateData.assigned_to = validatedData.assigned_to;
          }
          if (validatedData.notes) {
            updateData.notes = validatedData.notes;
          }
          // Set resolved_at if status is resolved
          if (validatedData.status === "resolved") {
            updateData.resolved_at = new Date().toISOString();
          }
          return [
            4 /*yield*/,
            supabase
              .from("security_alerts")
              .update(updateData)
              .eq("id", validatedData.alert_id)
              .select()
              .single(),
          ];
        case 3:
          (_b = _d.sent()), (updatedAlert = _b.data), (error = _b.error);
          if (!error) return [3 /*break*/, 5];
          console.error("Error updating security alert:", error);
          // Log audit event for error
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_UPDATE,
              severity: audit_system_1.AuditSeverity.HIGH,
              description: "Failed to update security alert: ".concat(error.message),
              metadata: {
                alert_id: validatedData.alert_id,
                error: error.message,
                update_data: validatedData,
              },
            }),
          ];
        case 4:
          // Log audit event for error
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to update security alert" },
              { status: 500 },
            ),
          ];
        case 5:
          // Log successful update
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_UPDATE,
              severity: audit_system_1.AuditSeverity.MEDIUM,
              description: "Security alert updated successfully",
              metadata: {
                alert_id: validatedData.alert_id,
                old_status:
                  updatedAlert === null || updatedAlert === void 0 ? void 0 : updatedAlert.status,
                new_status: validatedData.status,
                assigned_to: validatedData.assigned_to,
              },
            }),
          ];
        case 6:
          // Log successful update
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Alert updated successfully",
              alert: updatedAlert,
            }),
          ];
        case 7:
          error_2 = _d.sent();
          console.error("Security alert update API error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          // Log audit event for unexpected error
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_UPDATE,
              severity: audit_system_1.AuditSeverity.HIGH,
              description: "Unexpected error in security alert update API: ".concat(
                error_2 instanceof Error ? error_2.message : "Unknown error",
              ),
              metadata: {
                error: error_2 instanceof Error ? error_2.stack : error_2,
              },
            }),
          ];
        case 8:
          // Log audit event for unexpected error
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/audit/alerts
 *
 * Cria um novo alerta de seguranca
 * Geralmente usado por sistemas automatizados de monitoramento
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      success,
      rateLimit_3,
      remaining,
      reset,
      body,
      requiredFields,
      _i,
      requiredFields_1,
      field,
      supabase,
      alertData,
      _b,
      newAlert,
      error,
      error_3;
    var _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            limiter.check(
              (_c = request.ip) !== null && _c !== void 0 ? _c : "anonymous",
              10, // Limite de 10 por minuto para criacao
            ),
          ];
        case 1:
          (_a = _d.sent()),
            (success = _a.success),
            (rateLimit_3 = _a.limit),
            (remaining = _a.remaining),
            (reset = _a.reset);
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Rate limit exceeded",
                  limit: rateLimit_3,
                  remaining: remaining,
                  reset: reset,
                },
                { status: 429 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            request.json(),
            // Validacao basica dos campos obrigatorios
          ];
        case 2:
          body = _d.sent();
          requiredFields = ["type", "severity", "title", "description"];
          for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            field = requiredFields_1[_i];
            if (!body[field]) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required field: ".concat(field) },
                  { status: 400 },
                ),
              ];
            }
          }
          supabase = (0, client_1.createClient)();
          alertData = {
            type: body.type,
            severity: body.severity,
            status: "open",
            title: body.title,
            description: body.description,
            source_ip: body.source_ip || request.ip,
            user_id: body.user_id,
            resource_affected: body.resource_affected,
            metadata: body.metadata || {},
            created_at: new Date().toISOString(),
          };
          return [
            4 /*yield*/,
            supabase.from("security_alerts").insert(alertData).select().single(),
          ];
        case 3:
          (_b = _d.sent()), (newAlert = _b.data), (error = _b.error);
          if (error) {
            console.error("Error creating security alert:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create security alert" },
                { status: 500 },
              ),
            ];
          }
          // Log audit event for new alert
          return [
            4 /*yield*/,
            (0, audit_system_1.logAuditEvent)({
              type: audit_system_1.AuditEventType.SECURITY_ALERT_CREATE,
              severity: audit_system_1.AuditSeverity.HIGH,
              description: "New security alert created: ".concat(alertData.title),
              metadata: {
                alert_id: newAlert.id,
                alert_type: alertData.type,
                severity: alertData.severity,
              },
            }),
          ];
        case 4:
          // Log audit event for new alert
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                message: "Alert created successfully",
                alert: newAlert,
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_3 = _d.sent();
          console.error("Security alert creation API error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
