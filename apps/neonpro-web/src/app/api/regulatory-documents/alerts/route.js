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
// Request validation schemas
var ListAlertsSchema = zod_1.z.object({
  page: zod_1.z
    .string()
    .transform(function (val) {
      return parseInt(val) || 1;
    })
    .optional(),
  limit: zod_1.z
    .string()
    .transform(function (val) {
      return Math.min(parseInt(val) || 10, 50);
    })
    .optional(),
  alert_type: zod_1.z
    .enum([
      "90_days_before",
      "30_days_before",
      "7_days_before",
      "expired",
      "training_due",
      "document_review",
    ])
    .optional(),
  status: zod_1.z.enum(["pending", "sent", "acknowledged"]).optional(),
  priority: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
});
var AcknowledgeAlertSchema = zod_1.z.object({
  alert_id: zod_1.z.string().uuid(),
  acknowledgment_note: zod_1.z.string().optional(),
});
// GET /api/regulatory-documents/alerts - List compliance alerts
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      queryParams,
      _b,
      _c,
      page,
      _d,
      limit,
      alert_type,
      status_1,
      priority,
      profile,
      query,
      userProfile,
      statusFilter,
      offset,
      _e,
      alerts,
      error,
      count,
      totalPages,
      hasNextPage,
      hasPrevPage,
      error_1;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 7, , 8]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _f.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          queryParams = Object.fromEntries(searchParams.entries());
          (_b = ListAlertsSchema.parse(queryParams)),
            (_c = _b.page),
            (page = _c === void 0 ? 1 : _c),
            (_d = _b.limit),
            (limit = _d === void 0 ? 10 : _d),
            (alert_type = _b.alert_type),
            (status_1 = _b.status),
            (priority = _b.priority);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 3:
          profile = _f.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "User not associated with clinic" },
                { status: 403 },
              ),
            ];
          }
          query = supabase
            .from("compliance_alerts")
            .select(
              "\n        *,\n        regulatory_documents!inner(\n          id,\n          document_type,\n          document_category,\n          authority,\n          document_number,\n          expiration_date,\n          status,\n          clinic_id\n        )\n      ",
            )
            .eq("regulatory_documents.clinic_id", profile.clinic_id)
            .order("created_at", { ascending: false });
          if (!(profile.role !== "admin" && profile.role !== "manager")) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase.from("profiles").select("department").eq("id", user.id).single(),
          ];
        case 4:
          userProfile = _f.sent().data;
          if (userProfile === null || userProfile === void 0 ? void 0 : userProfile.department) {
            query = query.eq("target_department", userProfile.department);
          }
          _f.label = 5;
        case 5:
          // Apply filters
          if (alert_type) {
            query = query.eq("alert_type", alert_type);
          }
          if (status_1) {
            statusFilter =
              status_1 === "pending"
                ? "is.null"
                : status_1 === "sent"
                  ? "not.is.null"
                  : "not.is.null";
            if (status_1 === "pending") {
              query = query.is("sent_at", null);
            } else if (status_1 === "sent") {
              query = query.not("sent_at", "is", null).is("acknowledged_at", null);
            } else if (status_1 === "acknowledged") {
              query = query.not("acknowledged_at", "is", null);
            }
          }
          if (priority) {
            query = query.eq("priority", priority);
          }
          offset = (page - 1) * limit;
          query = query.range(offset, offset + limit - 1);
          return [4 /*yield*/, query];
        case 6:
          (_e = _f.sent()), (alerts = _e.data), (error = _e.error), (count = _e.count);
          if (error) {
            console.error("Error fetching compliance alerts:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 }),
            ];
          }
          totalPages = Math.ceil((count || 0) / limit);
          hasNextPage = page < totalPages;
          hasPrevPage = page > 1;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              alerts: alerts || [],
              pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
              },
            }),
          ];
        case 7:
          error_1 = _f.sent();
          console.error("API Error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/regulatory-documents/alerts - Acknowledge alert
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      requestBody,
      _b,
      alert_id,
      acknowledgment_note,
      _c,
      alert_1,
      error,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          requestBody = _d.sent();
          (_b = AcknowledgeAlertSchema.parse(requestBody)),
            (alert_id = _b.alert_id),
            (acknowledgment_note = _b.acknowledgment_note);
          return [
            4 /*yield*/,
            supabase
              .from("compliance_alerts")
              .update({
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: user.id,
                acknowledgment_note: acknowledgment_note,
              })
              .eq("id", alert_id)
              .select(
                "\n        *,\n        regulatory_documents!inner(document_type, document_category)\n      ",
              )
              .single(),
          ];
        case 4:
          (_c = _d.sent()), (alert_1 = _c.data), (error = _c.error);
          if (error) {
            console.error("Error acknowledging alert:", error);
            if (error.code === "PGRST116") {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Alert not found" }, { status: 404 }),
              ];
            }
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Alert acknowledged successfully",
              alert: alert_1,
            }),
          ];
        case 5:
          error_2 = _d.sent();
          console.error("API Error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
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
