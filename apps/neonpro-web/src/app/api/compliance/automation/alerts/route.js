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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Schema para criação de alertas
var CreateAlertSchema = zod_1.z.object({
  title: zod_1.z.string().min(1).max(200),
  description: zod_1.z.string().min(1).max(1000),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
  category: zod_1.z.enum([
    "consent",
    "data_subject_rights",
    "audit",
    "security",
    "retention",
    "anonymization",
  ]),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  auto_resolve: zod_1.z.boolean().default(false),
  resolve_after_hours: zod_1.z.number().min(1).max(8760).optional(), // máximo 1 ano
});
// Schema para atualização de alertas
var UpdateAlertSchema = zod_1.z.object({
  status: zod_1.z.enum(["active", "resolved", "dismissed"]).optional(),
  resolution_notes: zod_1.z.string().max(1000).optional(),
  resolved_by: zod_1.z.string().optional(),
});
// GET - Listar alertas
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      status_1,
      severity,
      category,
      limit,
      offset,
      clinicId,
      query,
      _b,
      alerts,
      error,
      countQuery,
      count,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, undefined, 6]);
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
          searchParams = new URL(request.url).searchParams;
          status_1 = searchParams.get("status");
          severity = searchParams.get("severity");
          category = searchParams.get("category");
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          clinicId = session.user.user_metadata.clinic_id;
          query = supabase
            .from("lgpd_compliance_alerts")
            .select("*")
            .eq("clinic_id", clinicId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (severity) {
            query = query.eq("severity", severity);
          }
          if (category) {
            query = query.eq("category", category);
          }
          return [4 /*yield*/, query];
        case 3:
          (_b = _c.sent()), (alerts = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          countQuery = supabase
            .from("lgpd_compliance_alerts")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinicId);
          if (status_1) countQuery = countQuery.eq("status", status_1);
          if (severity) countQuery = countQuery.eq("severity", severity);
          if (category) countQuery = countQuery.eq("category", category);
          return [4 /*yield*/, countQuery];
        case 4:
          count = _c.sent().count;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                alerts: alerts,
                pagination: {
                  total: count || 0,
                  limit: limit,
                  offset: offset,
                  hasMore: (count || 0) > offset + limit,
                },
              },
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("Erro ao listar alertas:", error_1);
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
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// POST - Criar novo alerta
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      validationResult,
      alertData,
      clinicId,
      autoResolveAt,
      _b,
      alert_1,
      error,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, undefined, 7]);
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
          validationResult = CreateAlertSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados inválidos",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          alertData = validationResult.data;
          clinicId = session.user.user_metadata.clinic_id;
          autoResolveAt = null;
          if (alertData.auto_resolve && alertData.resolve_after_hours) {
            autoResolveAt = new Date(
              Date.now() + alertData.resolve_after_hours * 60 * 60 * 1000,
            ).toISOString();
          }
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_alerts")
              .insert({
                clinic_id: clinicId,
                title: alertData.title,
                description: alertData.description,
                severity: alertData.severity,
                category: alertData.category,
                status: "active",
                metadata: alertData.metadata || {},
                auto_resolve: alertData.auto_resolve,
                auto_resolve_at: autoResolveAt,
                created_by: session.user.id,
              })
              .select()
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (alert_1 = _b.data), (error = _b.error);
          if (error) {
            throw error;
          }
          // Registrar evento de auditoria
          return [
            4 /*yield*/,
            supabase.from("lgpd_audit_trail").insert({
              clinic_id: clinicId,
              event_type: "system",
              action: "compliance_alert_created",
              user_id: session.user.id,
              details: {
                alertId: alert_1.id,
                severity: alertData.severity,
                category: alertData.category,
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
              data: alert_1,
              message: "Alerta criado com sucesso",
            }),
          ];
        case 6:
          error_2 = _c.sent();
          console.error("Erro ao criar alerta:", error_2);
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
// PUT - Atualizar alerta existente
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      searchParams,
      alertId,
      body,
      validationResult,
      updateData,
      clinicId,
      _b,
      existingAlert,
      fetchError,
      updatePayload,
      _c,
      updatedAlert,
      error,
      error_3;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 7, undefined, 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _d.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          alertId = searchParams.get("id");
          if (!alertId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          validationResult = UpdateAlertSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Dados inválidos",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          updateData = validationResult.data;
          clinicId = session.user.user_metadata.clinic_id;
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_alerts")
              .select("*")
              .eq("id", alertId)
              .eq("clinic_id", clinicId)
              .single(),
          ];
        case 4:
          (_b = _d.sent()), (existingAlert = _b.data), (fetchError = _b.error);
          if (fetchError || !existingAlert) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 }),
            ];
          }
          updatePayload = {
            updated_at: new Date().toISOString(),
            updated_by: session.user.id,
          };
          if (updateData.status) {
            updatePayload.status = updateData.status;
            if (updateData.status === "resolved") {
              updatePayload.resolved_at = new Date().toISOString();
              updatePayload.resolved_by = session.user.id;
            }
          }
          if (updateData.resolution_notes) {
            updatePayload.resolution_notes = updateData.resolution_notes;
          }
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_compliance_alerts")
              .update(updatePayload)
              .eq("id", alertId)
              .eq("clinic_id", clinicId)
              .select()
              .single(),
          ];
        case 5:
          (_c = _d.sent()), (updatedAlert = _c.data), (error = _c.error);
          if (error) {
            throw error;
          }
          // Registrar evento de auditoria
          return [
            4 /*yield*/,
            supabase.from("lgpd_audit_trail").insert({
              clinic_id: clinicId,
              event_type: "system",
              action: "compliance_alert_updated",
              user_id: session.user.id,
              details: {
                alertId: alertId,
                previousStatus: existingAlert.status,
                newStatus: updateData.status,
                changes: updateData,
              },
              severity: "info",
            }),
          ];
        case 6:
          // Registrar evento de auditoria
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedAlert,
              message: "Alerta atualizado com sucesso",
            }),
          ];
        case 7:
          error_3 = _d.sent();
          console.error("Erro ao atualizar alerta:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Erro interno do servidor",
                details: error_3 instanceof Error ? error_3.message : "Erro desconhecido",
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
