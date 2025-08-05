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
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, _a, biMetrics, error, analytics, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 5, , 6]);
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("stock_items")
              .select(
                "\n        id,\n        name,\n        current_quantity,\n        min_threshold,\n        max_threshold,\n        unit_price,\n        supplier_id,\n        category,\n        location,\n        created_at,\n        updated_at,\n        movements:stock_movements(\n          id,\n          movement_type,\n          quantity,\n          unit_price,\n          reason,\n          created_at,\n          user_id\n        )\n      ",
              )
              .order("created_at", { ascending: false }),
          ];
        case 4:
          (_a = _b.sent()), (biMetrics = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: error.message }, { status: 500 }),
            ];
          }
          analytics = {
            totalItems:
              (biMetrics === null || biMetrics === void 0 ? void 0 : biMetrics.length) || 0,
            totalValue:
              (biMetrics === null || biMetrics === void 0
                ? void 0
                : biMetrics.reduce(function (acc, item) {
                    return acc + item.current_quantity * item.unit_price;
                  }, 0)) || 0,
            lowStockItems:
              (biMetrics === null || biMetrics === void 0
                ? void 0
                : biMetrics.filter(function (item) {
                    return item.current_quantity <= item.min_threshold;
                  }).length) || 0,
            overStockItems:
              (biMetrics === null || biMetrics === void 0
                ? void 0
                : biMetrics.filter(function (item) {
                    return item.current_quantity >= item.max_threshold;
                  }).length) || 0,
            categoryDistribution:
              (biMetrics === null || biMetrics === void 0
                ? void 0
                : biMetrics.reduce(function (acc, item) {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                  }, {})) || {},
            movementsTrend:
              (biMetrics === null || biMetrics === void 0
                ? void 0
                : biMetrics
                    .flatMap(function (item) {
                      return item.movements || [];
                    })
                    .reduce(function (acc, movement) {
                      var date = new Date(movement.created_at).toISOString().split("T")[0];
                      acc[date] = (acc[date] || 0) + movement.quantity;
                      return acc;
                    }, {})) || {},
          };
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: analytics,
              items: biMetrics,
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("BI Integration Error:", error_1);
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
      session,
      body,
      exportFormat,
      dateRange,
      filters,
      query,
      _a,
      exportData,
      error,
      processedData,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 6, , 7]);
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          (exportFormat = body.exportFormat),
            (dateRange = body.dateRange),
            (filters = body.filters);
          query = supabase
            .from("stock_items")
            .select("\n        *,\n        movements:stock_movements(*)\n      ");
          if (filters === null || filters === void 0 ? void 0 : filters.category) {
            query = query.eq("category", filters.category);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.location) {
            query = query.eq("location", filters.location);
          }
          if (
            (dateRange === null || dateRange === void 0 ? void 0 : dateRange.start) &&
            (dateRange === null || dateRange === void 0 ? void 0 : dateRange.end)
          ) {
            query = query.gte("created_at", dateRange.start).lte("created_at", dateRange.end);
          }
          return [4 /*yield*/, query];
        case 5:
          (_a = _b.sent()), (exportData = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: error.message }, { status: 500 }),
            ];
          }
          processedData = {
            exportFormat: exportFormat,
            timestamp: new Date().toISOString(),
            filters: filters,
            data: exportData,
            summary: {
              totalItems:
                (exportData === null || exportData === void 0 ? void 0 : exportData.length) || 0,
              totalValue:
                (exportData === null || exportData === void 0
                  ? void 0
                  : exportData.reduce(function (acc, item) {
                      return acc + item.current_quantity * item.unit_price;
                    }, 0)) || 0,
            },
          };
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              export: processedData,
            }),
          ];
        case 6:
          error_2 = _b.sent();
          console.error("BI Export Error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
