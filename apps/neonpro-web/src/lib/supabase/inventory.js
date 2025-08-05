/**
 * Inventory Database Functions
 * Supabase database operations for inventory management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
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
exports.getInventoryItems = getInventoryItems;
exports.getInventoryItemById = getInventoryItemById;
exports.getInventoryItemByBarcode = getInventoryItemByBarcode;
exports.createInventoryItem = createInventoryItem;
exports.updateInventoryItem = updateInventoryItem;
exports.updateStockLevel = updateStockLevel;
exports.getStockMovements = getStockMovements;
exports.getStockAlerts = getStockAlerts;
exports.resolveStockAlert = resolveStockAlert;
exports.createBarcodeSession = createBarcodeSession;
exports.addScannedItem = addScannedItem;
exports.completeBarcodeSession = completeBarcodeSession;
exports.getInventoryCategories = getInventoryCategories;
exports.getInventoryLocations = getInventoryLocations;
exports.subscribeToInventoryUpdates = subscribeToInventoryUpdates;
exports.subscribeToStockAlerts = subscribeToStockAlerts;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
// =====================================================
// INVENTORY ITEMS
// =====================================================
function getInventoryItems(filters) {
  return __awaiter(this, void 0, void 0, function () {
    var query, _a, data, error, count, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          query = supabase
            .from("inventory_items")
            .select(
              "\n        *,\n        category:inventory_categories(*),\n        location:inventory_locations(*)\n      ",
            )
            .eq("is_active", true)
            .order("name");
          // Apply filters
          if (filters === null || filters === void 0 ? void 0 : filters.category_id) {
            query = query.eq("category_id", filters.category_id);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.location_id) {
            query = query.eq("location_id", filters.location_id);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.status) {
            query = query.eq("status", filters.status);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.search) {
            query = query.or(
              "name.ilike.%"
                .concat(filters.search, "%,sku.ilike.%")
                .concat(filters.search, "%,description.ilike.%")
                .concat(filters.search, "%"),
            );
          }
          if (filters === null || filters === void 0 ? void 0 : filters.limit) {
            query = query.limit(filters.limit);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || [],
              timestamp: new Date().toISOString(),
              total_count: count || (data === null || data === void 0 ? void 0 : data.length) || 0,
            },
          ];
        case 2:
          error_1 = _b.sent();
          console.error("Error fetching inventory items:", error_1);
          return [
            2 /*return*/,
            {
              success: false,
              data: [],
              message: error_1 instanceof Error ? error_1.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function getInventoryItemById(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("inventory_items")
              .select(
                "\n        *,\n        category:inventory_categories(*),\n        location:inventory_locations(*)\n      ",
              )
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_2 = _b.sent();
          console.error("Error fetching inventory item:", error_2);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_2 instanceof Error ? error_2.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function getInventoryItemByBarcode(barcode) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("inventory_items")
              .select(
                "\n        *,\n        category:inventory_categories(*),\n        location:inventory_locations(*)\n      ",
              )
              .or("barcode.eq.".concat(barcode, ",qr_code.eq.").concat(barcode))
              .eq("is_active", true)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error && error.code !== "PGRST116") {
            // PGRST116 = not found
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || null,
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_3 = _b.sent();
          console.error("Error fetching inventory item by barcode:", error_3);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_3 instanceof Error ? error_3.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function createInventoryItem(item) {
  return __awaiter(this, void 0, void 0, function () {
    var userData, _a, data, error, error_4;
    var _b, _c;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 3, , 4]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          userData = _d.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("inventory_items")
              .insert(
                __assign(__assign({}, item), {
                  created_by: (_b = userData.user) === null || _b === void 0 ? void 0 : _b.id,
                  last_updated_by: (_c = userData.user) === null || _c === void 0 ? void 0 : _c.id,
                }),
              )
              .select(
                "\n        *,\n        category:inventory_categories(*),\n        location:inventory_locations(*)\n      ",
              )
              .single(),
          ];
        case 2:
          (_a = _d.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          error_4 = _d.sent();
          console.error("Error creating inventory item:", error_4);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_4 instanceof Error ? error_4.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function updateInventoryItem(id, updates) {
  return __awaiter(this, void 0, void 0, function () {
    var userData, _a, data, error, error_5;
    var _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          userData = _c.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("inventory_items")
              .update(
                __assign(__assign({}, updates), {
                  last_updated_by: (_b = userData.user) === null || _b === void 0 ? void 0 : _b.id,
                }),
              )
              .eq("id", id)
              .select(
                "\n        *,\n        category:inventory_categories(*),\n        location:inventory_locations(*)\n      ",
              )
              .single(),
          ];
        case 2:
          (_a = _c.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          error_5 = _c.sent();
          console.error("Error updating inventory item:", error_5);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_5 instanceof Error ? error_5.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// STOCK MOVEMENTS
// =====================================================
function updateStockLevel(inventoryItemId, quantity, movementType, locationId, options) {
  return __awaiter(this, void 0, void 0, function () {
    var userData, _a, data, error, error_6;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          userData = _b.sent().data;
          if (!userData.user) {
            throw new Error("User not authenticated");
          }
          return [
            4 /*yield*/,
            supabase.rpc("update_stock_level", {
              p_inventory_item_id: inventoryItemId,
              p_quantity: quantity,
              p_movement_type: movementType,
              p_location_id: locationId,
              p_user_id: userData.user.id,
              p_reference_type:
                (options === null || options === void 0 ? void 0 : options.referenceType) || null,
              p_reference_id:
                (options === null || options === void 0 ? void 0 : options.referenceId) || null,
              p_notes: (options === null || options === void 0 ? void 0 : options.notes) || null,
            }),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: true,
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          error_6 = _b.sent();
          console.error("Error updating stock level:", error_6);
          return [
            2 /*return*/,
            {
              success: false,
              data: false,
              message: error_6 instanceof Error ? error_6.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function getStockMovements(filters) {
  return __awaiter(this, void 0, void 0, function () {
    var query, _a, data, error, error_7;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          query = supabase
            .from("stock_movements")
            .select(
              "\n        *,\n        inventory_item:inventory_items(*),\n        location:inventory_locations(*)\n      ",
            )
            .order("created_at", { ascending: false });
          // Apply filters
          if (filters === null || filters === void 0 ? void 0 : filters.inventory_item_id) {
            query = query.eq("inventory_item_id", filters.inventory_item_id);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.location_id) {
            query = query.eq("location_id", filters.location_id);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.movement_type) {
            query = query.eq("movement_type", filters.movement_type);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.from_date) {
            query = query.gte("created_at", filters.from_date);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.to_date) {
            query = query.lte("created_at", filters.to_date);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.limit) {
            query = query.limit(filters.limit);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || [],
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_7 = _b.sent();
          console.error("Error fetching stock movements:", error_7);
          return [
            2 /*return*/,
            {
              success: false,
              data: [],
              message: error_7 instanceof Error ? error_7.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// STOCK ALERTS
// =====================================================
function getStockAlerts(filters) {
  return __awaiter(this, void 0, void 0, function () {
    var query, _a, data, error, error_8;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          query = supabase
            .from("stock_alerts")
            .select("\n        *,\n        inventory_item:inventory_items(*)\n      ")
            .order("created_at", { ascending: false });
          // Apply filters
          if (filters === null || filters === void 0 ? void 0 : filters.status) {
            query = query.eq("status", filters.status);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.severity) {
            query = query.eq("severity", filters.severity);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.alert_type) {
            query = query.eq("alert_type", filters.alert_type);
          }
          if (filters === null || filters === void 0 ? void 0 : filters.limit) {
            query = query.limit(filters.limit);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || [],
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_8 = _b.sent();
          console.error("Error fetching stock alerts:", error_8);
          return [
            2 /*return*/,
            {
              success: false,
              data: [],
              message: error_8 instanceof Error ? error_8.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function resolveStockAlert(alertId, resolutionNotes) {
  return __awaiter(this, void 0, void 0, function () {
    var userData, error, error_9;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          userData = _b.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .update({
                status: "resolved",
                resolved_at: new Date().toISOString(),
                resolved_by: (_a = userData.user) === null || _a === void 0 ? void 0 : _a.id,
                resolution_notes: resolutionNotes,
              })
              .eq("id", alertId),
          ];
        case 2:
          error = _b.sent().error;
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: true,
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          error_9 = _b.sent();
          console.error("Error resolving stock alert:", error_9);
          return [
            2 /*return*/,
            {
              success: false,
              data: false,
              message: error_9 instanceof Error ? error_9.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// BARCODE SESSIONS
// =====================================================
function createBarcodeSession(sessionType, locationId) {
  return __awaiter(this, void 0, void 0, function () {
    var userData, _a, data, error, error_10;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          userData = _b.sent().data;
          if (!userData.user) {
            throw new Error("User not authenticated");
          }
          return [
            4 /*yield*/,
            supabase
              .from("barcode_sessions")
              .insert({
                user_id: userData.user.id,
                session_type: sessionType,
                location_id: locationId,
                status: "active",
              })
              .select()
              .single(),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          error_10 = _b.sent();
          console.error("Error creating barcode session:", error_10);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_10 instanceof Error ? error_10.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function addScannedItem(sessionId, barcodeValue, scanResult, inventoryItemId, errorMessage) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, _b, _c, error_11;
    var _d;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            supabase
              .from("scanned_items")
              .insert({
                session_id: sessionId,
                barcode_value: barcodeValue,
                scan_result: scanResult,
                inventory_item_id: inventoryItemId,
                error_message: errorMessage,
                needs_manual_review: scanResult !== "success",
              })
              .select()
              .single(),
          ];
        case 1:
          (_a = _e.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          _c = (_b = supabase.from("barcode_sessions")).update;
          _d = {};
          return [4 /*yield*/, getSessionItemCount(sessionId)];
        case 2:
          // Update session total count
          return [
            4 /*yield*/,
            _c.apply(_b, [((_d.total_items_scanned = _e.sent()), _d)]).eq("id", sessionId),
          ];
        case 3:
          // Update session total count
          _e.sent();
          return [
            2 /*return*/,
            {
              success: true,
              data: data,
              timestamp: new Date().toISOString(),
            },
          ];
        case 4:
          error_11 = _e.sent();
          console.error("Error adding scanned item:", error_11);
          return [
            2 /*return*/,
            {
              success: false,
              data: null,
              message: error_11 instanceof Error ? error_11.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function getSessionItemCount(sessionId) {
  return __awaiter(this, void 0, void 0, function () {
    var count;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("scanned_items")
              .select("*", { count: "exact", head: true })
              .eq("session_id", sessionId),
          ];
        case 1:
          count = _a.sent().count;
          return [2 /*return*/, count || 0];
      }
    });
  });
}
function completeBarcodeSession(sessionId, notes) {
  return __awaiter(this, void 0, void 0, function () {
    var error, error_12;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("barcode_sessions")
              .update({
                status: "completed",
                ended_at: new Date().toISOString(),
                notes: notes,
              })
              .eq("id", sessionId),
          ];
        case 1:
          error = _a.sent().error;
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: true,
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_12 = _a.sent();
          console.error("Error completing barcode session:", error_12);
          return [
            2 /*return*/,
            {
              success: false,
              data: false,
              message: error_12 instanceof Error ? error_12.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// CATEGORIES AND LOCATIONS
// =====================================================
function getInventoryCategories() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_13;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase.from("inventory_categories").select("*").eq("is_active", true).order("name"),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || [],
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_13 = _b.sent();
          console.error("Error fetching inventory categories:", error_13);
          return [
            2 /*return*/,
            {
              success: false,
              data: [],
              message: error_13 instanceof Error ? error_13.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function getInventoryLocations() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_14;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase.from("inventory_locations").select("*").eq("is_active", true).order("name"),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            {
              success: true,
              data: data || [],
              timestamp: new Date().toISOString(),
            },
          ];
        case 2:
          error_14 = _b.sent();
          console.error("Error fetching inventory locations:", error_14);
          return [
            2 /*return*/,
            {
              success: false,
              data: [],
              message: error_14 instanceof Error ? error_14.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================
function subscribeToInventoryUpdates(callback) {
  return supabase
    .channel("inventory_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "inventory_items",
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stock_movements",
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stock_alerts",
      },
      callback,
    )
    .subscribe();
}
function subscribeToStockAlerts(callback) {
  return supabase
    .channel("stock_alerts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "stock_alerts",
      },
      callback,
    )
    .subscribe();
}
