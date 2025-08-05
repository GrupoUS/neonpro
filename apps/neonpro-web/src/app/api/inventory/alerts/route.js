// =====================================================================================
// NeonPro Inventory Alerts API Endpoints
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
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
exports.PATCH = PATCH;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var AlertFiltersSchema = zod_1.z.object({
  type: zod_1.z
    .enum(["low_stock", "out_of_stock", "expired", "expiring_soon", "overstock"])
    .optional(),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  is_read: zod_1.z.boolean().optional(),
  location_id: zod_1.z.string().uuid().optional(),
  limit: zod_1.z.coerce.number().min(1).max(100).default(50),
  offset: zod_1.z.coerce.number().min(0).default(0),
});
// =====================================================================================
// GET INVENTORY ALERTS
// =====================================================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, filters, query, _a, alerts, error, transformedAlerts, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
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
          searchParams = new URL(request.url).searchParams;
          filters = AlertFiltersSchema.parse({
            type: searchParams.get("type"),
            severity: searchParams.get("severity"),
            is_read:
              searchParams.get("is_read") === "true"
                ? true
                : searchParams.get("is_read") === "false"
                  ? false
                  : undefined,
            location_id: searchParams.get("location_id"),
            limit: searchParams.get("limit"),
            offset: searchParams.get("offset"),
          });
          query = supabase
            .from("inventory_alerts")
            .select(
              "\n        *,\n        inventory_items(name, sku),\n        inventory_locations(name)\n      ",
            )
            .order("created_at", { ascending: false })
            .range(filters.offset, filters.offset + filters.limit - 1);
          // Apply filters
          if (filters.type) {
            query = query.eq("type", filters.type);
          }
          if (filters.severity) {
            query = query.eq("severity", filters.severity);
          }
          if (filters.is_read !== undefined) {
            query = query.eq("is_read", filters.is_read);
          }
          if (filters.location_id) {
            query = query.eq("location_id", filters.location_id);
          }
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (alerts = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching alerts:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 }),
            ];
          }
          transformedAlerts =
            (alerts === null || alerts === void 0
              ? void 0
              : alerts.map((alert) => {
                  var _a, _b;
                  return {
                    id: alert.id,
                    type: alert.type,
                    title: alert.title,
                    message: alert.message,
                    item_name:
                      ((_a = alert.inventory_items) === null || _a === void 0 ? void 0 : _a.name) ||
                      "Unknown Item",
                    item_id: alert.item_id,
                    location_name:
                      ((_b = alert.inventory_locations) === null || _b === void 0
                        ? void 0
                        : _b.name) || "Unknown Location",
                    current_quantity: alert.current_quantity,
                    min_quantity: alert.min_quantity,
                    expiry_date: alert.expiry_date,
                    severity: alert.severity,
                    is_read: alert.is_read,
                    created_at: alert.created_at,
                  };
                })) || [];
          return [2 /*return*/, server_2.NextResponse.json(transformedAlerts)];
        case 4:
          error_1 = _b.sent();
          console.error("Error in alerts API:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid parameters", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// CREATE INVENTORY ALERT
// =====================================================================================
var CreateAlertSchema = zod_1.z.object({
  type: zod_1.z.enum(["low_stock", "out_of_stock", "expired", "expiring_soon", "overstock"]),
  title: zod_1.z.string().min(1).max(255),
  message: zod_1.z.string().min(1).max(1000),
  item_id: zod_1.z.string().uuid(),
  location_id: zod_1.z.string().uuid().optional(),
  current_quantity: zod_1.z.number().min(0).optional(),
  min_quantity: zod_1.z.number().min(0).optional(),
  expiry_date: zod_1.z.string().datetime().optional(),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]).default("medium"),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, alertData, _a, alert_1, error, transformedAlert, error_2;
    var _b, _c;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _d.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          alertData = CreateAlertSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("inventory_alerts")
              .insert(__assign(__assign({}, alertData), { is_read: false, created_by: user.id }))
              .select(
                "\n        *,\n        inventory_items(name, sku),\n        inventory_locations(name)\n      ",
              )
              .single(),
          ];
        case 4:
          (_a = _d.sent()), (alert_1 = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating alert:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to create alert" }, { status: 500 }),
            ];
          }
          transformedAlert = {
            id: alert_1.id,
            type: alert_1.type,
            title: alert_1.title,
            message: alert_1.message,
            item_name:
              ((_b = alert_1.inventory_items) === null || _b === void 0 ? void 0 : _b.name) ||
              "Unknown Item",
            item_id: alert_1.item_id,
            location_name:
              ((_c = alert_1.inventory_locations) === null || _c === void 0 ? void 0 : _c.name) ||
              "Unknown Location",
            current_quantity: alert_1.current_quantity,
            min_quantity: alert_1.min_quantity,
            expiry_date: alert_1.expiry_date,
            severity: alert_1.severity,
            is_read: alert_1.is_read,
            created_at: alert_1.created_at,
          };
          return [2 /*return*/, server_2.NextResponse.json(transformedAlert, { status: 201 })];
        case 5:
          error_2 = _d.sent();
          console.error("Error in create alert API:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid alert data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
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
// =====================================================================================
// MARK ALL ALERTS AS READ
// =====================================================================================
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, action, error, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          if (!(action === "mark-all-read")) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase.from("inventory_alerts").update({ is_read: true }).eq("is_read", false),
          ];
        case 3:
          error = _a.sent().error;
          if (error) {
            console.error("Error marking all alerts as read:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to mark alerts as read" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ message: "All alerts marked as read" }),
          ];
        case 4:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 5:
          error_3 = _a.sent();
          console.error("Error in alerts PATCH API:", error_3);
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
