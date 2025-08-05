"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var dashboard_1 = require("@/app/lib/validations/dashboard");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, url, alertId, status_1, query, _a, data, error, error_1;
    return __generator(this, function (_b) {
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
          url = new URL(request.url);
          alertId = url.searchParams.get("alert_id");
          status_1 = url.searchParams.get("status");
          query = supabase.from("dashboard_alerts").select("*").eq("user_id", user.id);
          if (alertId) {
            query = query.eq("id", alertId);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          query = query.order("created_at", { ascending: false });
          return [4 /*yield*/, query];
        case 3:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching dashboard alerts:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 }),
            ];
          }
          if (alertId && data && data.length === 0) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Alert not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json(alertId && data ? data[0] : data)];
        case 4:
          error_1 = _b.sent();
          console.error("Dashboard alerts GET error:", error_1);
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, _a, data, error, error_2;
    return __generator(this, function (_b) {
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
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = dashboard_1.createAlertSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("dashboard_alerts")
              .insert([__assign(__assign({}, validatedData), { user_id: user.id })])
              .select()
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating alert:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to create alert" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json(data, { status: 201 })];
        case 5:
          error_2 = _b.sent();
          console.error("Dashboard alerts POST error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid request data" }, { status: 400 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validatedData, url, alertId, _a, data, error, error_3;
    return __generator(this, function (_b) {
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
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = dashboard_1.updateAlertSchema.parse(body);
          url = new URL(request.url);
          alertId = url.searchParams.get("alert_id") || body.id;
          if (!alertId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Alert ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("dashboard_alerts")
              .update(validatedData)
              .eq("id", alertId)
              .eq("user_id", user.id)
              .select()
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error updating alert:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to update alert" }, { status: 500 }),
            ];
          }
          if (!data) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Alert not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json(data)];
        case 5:
          error_3 = _b.sent();
          console.error("Dashboard alerts PUT error:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Invalid request data" }, { status: 400 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, url, alertId, error, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
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
          url = new URL(request.url);
          alertId = url.searchParams.get("alert_id");
          if (!alertId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Alert ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("dashboard_alerts").delete().eq("id", alertId).eq("user_id", user.id),
          ];
        case 3:
          error = _a.sent().error;
          if (error) {
            console.error("Error deleting alert:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to delete alert" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ message: "Alert deleted successfully" }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("Dashboard alerts DELETE error:", error_4);
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
