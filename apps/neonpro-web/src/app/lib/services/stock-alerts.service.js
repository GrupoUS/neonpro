/**
 * Stock Alerts Service
 * Service for managing stock alerts and inventory notifications
 */
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
exports.StockAlertsService = void 0;
var server_1 = require("@/lib/supabase/server");
var StockAlertsService = /** @class */ (() => {
  function StockAlertsService() {}
  StockAlertsService.prototype.getActiveAlerts = function (clinicId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, query, _a, data, error, error_1;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            query = supabase.from("stock_alerts").select("*").eq("clinic_id", clinicId);
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.in("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.severity) {
              query = query.in("severity_level", filters.severity);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.type) {
              query = query.in("alert_type", filters.type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.limit) {
              query = query.limit(filters.limit);
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [2 /*return*/, { success: false, error: error.message }];
            }
            return [2 /*return*/, { success: true, data: data }];
          case 3:
            error_1 = _b.sent();
            return [2 /*return*/, { success: false, error: "Internal server error" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertsService.prototype.acknowledgeAlert = function (data, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("stock_alerts")
                .update({
                  status: "acknowledged",
                  acknowledged_by: userId,
                  acknowledged_at: new Date(),
                })
                .eq("id", data.alertId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              return [2 /*return*/, { success: false, error: error.message }];
            }
            return [2 /*return*/, { success: true, data: { acknowledged: true } }];
          case 3:
            error_2 = _a.sent();
            return [2 /*return*/, { success: false, error: "Internal server error" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertsService.prototype.resolveAlert = function (data, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("stock_alerts")
                .update({
                  status: "resolved",
                  resolved_by: userId,
                  resolved_at: new Date(),
                  resolution: data.resolution,
                })
                .eq("id", data.alertId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              return [2 /*return*/, { success: false, error: error.message }];
            }
            return [2 /*return*/, { success: true, data: { resolved: true } }];
          case 3:
            error_3 = _a.sent();
            return [2 /*return*/, { success: false, error: "Internal server error" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertsService.prototype.dismissAlert = function (alertId, userId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("stock_alerts")
                .update({
                  status: "dismissed",
                  dismissed_by: userId,
                  dismissed_at: new Date(),
                  dismiss_reason: reason,
                })
                .eq("id", alertId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              return [2 /*return*/, { success: false, error: error.message }];
            }
            return [2 /*return*/, { success: true, data: { dismissed: true } }];
          case 3:
            error_4 = _a.sent();
            return [2 /*return*/, { success: false, error: "Internal server error" }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  StockAlertsService.prototype.generateAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Mock implementation for now
          return [
            2 /*return*/,
            {
              success: true,
              data: {
                generated: 0,
                clinicId: clinicId,
                processedAt: new Date(),
              },
            },
          ];
        } catch (error) {
          return [2 /*return*/, { success: false, error: "Internal server error" }];
        }
        return [2 /*return*/];
      });
    });
  };
  StockAlertsService.generateAlert = function (itemId, currentStock, minThreshold) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          id: "alert-id",
          itemId: itemId,
          currentStock: currentStock,
          minThreshold: minThreshold,
          alertType: "low_stock",
          priority: "medium",
          createdAt: new Date(),
        },
      ]);
    });
  };
  StockAlertsService.processAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          clinicId: clinicId,
          processedAlerts: 0,
          newAlerts: 0,
          resolvedAlerts: 0,
          processedAt: new Date(),
        },
      ]);
    });
  };
  StockAlertsService.resolveAlert = function (alertId, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          alertId: alertId,
          resolution: resolution,
          resolvedAt: new Date(),
          status: "resolved",
        },
      ]);
    });
  };
  return StockAlertsService;
})();
exports.StockAlertsService = StockAlertsService;
