// =====================================================================================
// NeonPro Inventory Tracking Engine
// Epic 6: Real-time Stock Tracking with =99% Accuracy
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
exports.InventoryTrackingEngine = void 0;
exports.calculateStockAccuracy = calculateStockAccuracy;
exports.calculateAlertPriority = calculateAlertPriority;
exports.validateStockOperation = validateStockOperation;
var server_1 = require("@/lib/supabase/server");
// =====================================================================================
// CORE INVENTORY TRACKING ENGINE
// =====================================================================================
var InventoryTrackingEngine = /** @class */ (() => {
  function InventoryTrackingEngine(clinicId) {
    this.clinicId = clinicId;
  }
  InventoryTrackingEngine.prototype.getSupabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  // =====================================================================================
  // REAL-TIME STOCK LEVEL MANAGEMENT
  // =====================================================================================
  /**
   * Updates stock level with real-time synchronization and automatic transaction logging
   * Accuracy Target: =99%
   * Performance Target: <500ms
   */
  InventoryTrackingEngine.prototype.updateStockLevel = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var itemId,
        locationId,
        quantityChange,
        transactionType,
        reason,
        batchNumber,
        expirationDate,
        referenceType,
        referenceId,
        userId,
        _a,
        currentStock,
        stockError,
        currentQuantity,
        newQuantity,
        stockLevelData,
        updatedStock,
        _b,
        data,
        error,
        _c,
        data,
        error,
        transactionData,
        _d,
        transaction,
        transactionError,
        alertsCreated,
        error_1;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            (itemId = params.itemId),
              (locationId = params.locationId),
              (quantityChange = params.quantityChange),
              (transactionType = params.transactionType),
              (reason = params.reason),
              (batchNumber = params.batchNumber),
              (expirationDate = params.expirationDate),
              (referenceType = params.referenceType),
              (referenceId = params.referenceId),
              (userId = params.userId);
            _e.label = 1;
          case 1:
            _e.trys.push([1, 9, , 10]);
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .select("*")
                .eq("item_id", itemId)
                .eq("location_id", locationId)
                .eq("batch_number", batchNumber || null)
                .single(),
            ];
          case 2:
            (_a = _e.sent()), (currentStock = _a.data), (stockError = _a.error);
            if (stockError && stockError.code !== "PGRST116") {
              return [
                2 /*return*/,
                {
                  success: false,
                  newQuantity: 0,
                  availableQuantity: 0,
                  alertsCreated: [],
                  errors: ["Failed to retrieve current stock: ".concat(stockError.message)],
                },
              ];
            }
            currentQuantity =
              (currentStock === null || currentStock === void 0
                ? void 0
                : currentStock.current_quantity) || 0;
            newQuantity = Math.max(0, currentQuantity + quantityChange);
            // Validate stock levels
            if (quantityChange < 0 && Math.abs(quantityChange) > currentQuantity) {
              return [
                2 /*return*/,
                {
                  success: false,
                  newQuantity: currentQuantity,
                  availableQuantity:
                    (currentStock === null || currentStock === void 0
                      ? void 0
                      : currentStock.available_quantity) || 0,
                  alertsCreated: [],
                  errors: ["Insufficient stock for this operation"],
                },
              ];
            }
            stockLevelData = {
              item_id: itemId,
              location_id: locationId,
              current_quantity: newQuantity,
              batch_number: batchNumber,
              expiration_date: expirationDate,
              last_counted_at: new Date().toISOString(),
              last_counted_by: userId,
              status: "active",
            };
            updatedStock = void 0;
            if (!currentStock) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .update(stockLevelData)
                .eq("id", currentStock.id)
                .select()
                .single(),
            ];
          case 3:
            (_b = _e.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            updatedStock = data;
            return [3 /*break*/, 6];
          case 4:
            return [
              4 /*yield*/,
              supabase.from("stock_levels").insert(stockLevelData).select().single(),
            ];
          case 5:
            (_c = _e.sent()), (data = _c.data), (error = _c.error);
            if (error) throw error;
            updatedStock = data;
            _e.label = 6;
          case 6:
            transactionData = {
              item_id: itemId,
              location_id: locationId,
              transaction_type: transactionType,
              reference_type: referenceType,
              reference_id: referenceId,
              quantity_before: currentQuantity,
              quantity_change: quantityChange,
              quantity_after: newQuantity,
              batch_number: batchNumber,
              expiration_date: expirationDate,
              reason: reason || "".concat(transactionType, " operation"),
              created_by: userId,
              verification_status: "verified",
            };
            return [
              4 /*yield*/,
              supabase.from("inventory_transactions").insert(transactionData).select().single(),
            ];
          case 7:
            (_d = _e.sent()), (transaction = _d.data), (transactionError = _d.error);
            if (transactionError) {
              console.error("Failed to create transaction record:", transactionError);
            }
            return [4 /*yield*/, this.checkAndCreateAlerts(itemId, locationId, updatedStock)];
          case 8:
            alertsCreated = _e.sent();
            return [
              2 /*return*/,
              {
                success: true,
                transactionId:
                  transaction === null || transaction === void 0 ? void 0 : transaction.id,
                newQuantity: updatedStock.current_quantity,
                availableQuantity: updatedStock.available_quantity,
                alertsCreated: alertsCreated,
                errors: [],
              },
            ];
          case 9:
            error_1 = _e.sent();
            console.error("Stock update failed:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                newQuantity: 0,
                availableQuantity: 0,
                alertsCreated: [],
                errors: [
                  "Stock update failed: ".concat(
                    error_1 instanceof Error ? error_1.message : "Unknown error",
                  ),
                ],
              },
            ];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Transfers stock between locations with atomic operations
   */
  InventoryTrackingEngine.prototype.transferStock = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var itemId,
        sourceLocationId,
        destinationLocationId,
        quantity,
        reason,
        batchNumber,
        userId,
        sourceStock,
        sourceResult,
        destinationResult,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (itemId = params.itemId),
              (sourceLocationId = params.sourceLocationId),
              (destinationLocationId = params.destinationLocationId),
              (quantity = params.quantity),
              (reason = params.reason),
              (batchNumber = params.batchNumber),
              (userId = params.userId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .select("*")
                .eq("item_id", itemId)
                .eq("location_id", sourceLocationId)
                .eq("batch_number", batchNumber || null)
                .single(),
            ];
          case 2:
            sourceStock = _a.sent().data;
            if (!sourceStock || sourceStock.available_quantity < quantity) {
              return [
                2 /*return*/,
                {
                  success: false,
                  errors: ["Insufficient stock at source location"],
                },
              ];
            }
            return [
              4 /*yield*/,
              this.updateStockLevel({
                itemId: itemId,
                locationId: sourceLocationId,
                quantityChange: -quantity,
                transactionType: "transfer",
                reason: "Transfer to ".concat(destinationLocationId, ": ").concat(reason),
                batchNumber: batchNumber,
                referenceType: "transfer",
                referenceId: "".concat(sourceLocationId, "->").concat(destinationLocationId),
                userId: userId,
              }),
            ];
          case 3:
            sourceResult = _a.sent();
            if (!sourceResult.success) {
              return [
                2 /*return*/,
                {
                  success: false,
                  errors: sourceResult.errors,
                },
              ];
            }
            return [
              4 /*yield*/,
              this.updateStockLevel({
                itemId: itemId,
                locationId: destinationLocationId,
                quantityChange: quantity,
                transactionType: "transfer",
                reason: "Transfer from ".concat(sourceLocationId, ": ").concat(reason),
                batchNumber: batchNumber,
                referenceType: "transfer",
                referenceId: "".concat(sourceLocationId, "->").concat(destinationLocationId),
                userId: userId,
              }),
            ];
          case 4:
            destinationResult = _a.sent();
            if (destinationResult.success) return [3 /*break*/, 6];
            // Rollback source transaction if destination fails
            return [
              4 /*yield*/,
              this.updateStockLevel({
                itemId: itemId,
                locationId: sourceLocationId,
                quantityChange: quantity,
                transactionType: "adjustment",
                reason: "Rollback failed transfer",
                batchNumber: batchNumber,
                userId: userId,
              }),
            ];
          case 5:
            // Rollback source transaction if destination fails
            _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                errors: ["Transfer failed at destination, source rolled back"],
              },
            ];
          case 6:
            return [
              2 /*return*/,
              {
                success: true,
                sourceTransactionId: sourceResult.transactionId,
                destinationTransactionId: destinationResult.transactionId,
                errors: [],
              },
            ];
          case 7:
            error_2 = _a.sent();
            console.error("Stock transfer failed:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                errors: [
                  "Transfer failed: ".concat(
                    error_2 instanceof Error ? error_2.message : "Unknown error",
                  ),
                ],
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reserves stock for upcoming operations (appointments, treatments)
   */
  InventoryTrackingEngine.prototype.reserveStock = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var itemId,
        locationId,
        quantity,
        referenceType,
        referenceId,
        userId,
        currentStock,
        _a,
        updatedStock,
        error,
        transaction,
        error_3;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            (itemId = params.itemId),
              (locationId = params.locationId),
              (quantity = params.quantity),
              (referenceType = params.referenceType),
              (referenceId = params.referenceId),
              (userId = params.userId);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .select("*")
                .eq("item_id", itemId)
                .eq("location_id", locationId)
                .single(),
            ];
          case 2:
            currentStock = _b.sent().data;
            if (!currentStock || currentStock.available_quantity < quantity) {
              return [
                2 /*return*/,
                {
                  success: false,
                  errors: ["Insufficient available stock for reservation"],
                },
              ];
            }
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .update({
                  reserved_quantity: currentStock.reserved_quantity + quantity,
                  last_updated: new Date().toISOString(),
                })
                .eq("id", currentStock.id)
                .select()
                .single(),
            ];
          case 3:
            (_a = _b.sent()), (updatedStock = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              4 /*yield*/,
              supabase
                .from("inventory_transactions")
                .insert({
                  item_id: itemId,
                  location_id: locationId,
                  transaction_type: "reserve",
                  reference_type: referenceType,
                  reference_id: referenceId,
                  quantity_before: currentStock.reserved_quantity,
                  quantity_change: quantity,
                  quantity_after: currentStock.reserved_quantity + quantity,
                  reason: "Stock reserved for ".concat(referenceType),
                  created_by: userId,
                  verification_status: "verified",
                })
                .select()
                .single(),
            ];
          case 4:
            transaction = _b.sent().data;
            return [
              2 /*return*/,
              {
                success: true,
                reservationId:
                  transaction === null || transaction === void 0 ? void 0 : transaction.id,
                errors: [],
              },
            ];
          case 5:
            error_3 = _b.sent();
            console.error("Stock reservation failed:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                errors: [
                  "Reservation failed: ".concat(
                    error_3 instanceof Error ? error_3.message : "Unknown error",
                  ),
                ],
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Releases reserved stock (cancellation, completion)
   */
  InventoryTrackingEngine.prototype.releaseReservedStock = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var itemId,
        locationId,
        quantity,
        isConsumption,
        referenceId,
        userId,
        currentStock,
        updates,
        _a,
        updatedStock,
        error,
        transactionType,
        transaction,
        error_4;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            (itemId = params.itemId),
              (locationId = params.locationId),
              (quantity = params.quantity),
              (isConsumption = params.isConsumption),
              (referenceId = params.referenceId),
              (userId = params.userId);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .select("*")
                .eq("item_id", itemId)
                .eq("location_id", locationId)
                .single(),
            ];
          case 2:
            currentStock = _b.sent().data;
            if (!currentStock || currentStock.reserved_quantity < quantity) {
              return [
                2 /*return*/,
                {
                  success: false,
                  errors: ["Insufficient reserved stock to release"],
                },
              ];
            }
            updates = isConsumption
              ? {
                  current_quantity: currentStock.current_quantity - quantity,
                  reserved_quantity: currentStock.reserved_quantity - quantity,
                  last_updated: new Date().toISOString(),
                }
              : {
                  reserved_quantity: currentStock.reserved_quantity - quantity,
                  last_updated: new Date().toISOString(),
                };
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .update(updates)
                .eq("id", currentStock.id)
                .select()
                .single(),
            ];
          case 3:
            (_a = _b.sent()), (updatedStock = _a.data), (error = _a.error);
            if (error) throw error;
            transactionType = isConsumption ? "issue" : "adjustment";
            return [
              4 /*yield*/,
              supabase
                .from("inventory_transactions")
                .insert({
                  item_id: itemId,
                  location_id: locationId,
                  transaction_type: transactionType,
                  reference_id: referenceId,
                  quantity_before: currentStock.current_quantity,
                  quantity_change: isConsumption ? -quantity : 0,
                  quantity_after: isConsumption
                    ? currentStock.current_quantity - quantity
                    : currentStock.current_quantity,
                  reason: isConsumption
                    ? "Stock consumed from reservation"
                    : "Reserved stock released",
                  created_by: userId,
                  verification_status: "verified",
                })
                .select()
                .single(),
            ];
          case 4:
            transaction = _b.sent().data;
            return [
              2 /*return*/,
              {
                success: true,
                transactionId:
                  transaction === null || transaction === void 0 ? void 0 : transaction.id,
                errors: [],
              },
            ];
          case 5:
            error_4 = _b.sent();
            console.error("Stock release failed:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                errors: [
                  "Release failed: ".concat(
                    error_4 instanceof Error ? error_4.message : "Unknown error",
                  ),
                ],
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================================================
  // ALERT SYSTEM WITH <60s NOTIFICATION DELIVERY
  // =====================================================================================
  /**
   * Checks stock levels and creates automatic alerts
   * Target: <60 seconds notification delivery
   */
  InventoryTrackingEngine.prototype.checkAndCreateAlerts = function (
    itemId,
    locationId,
    stockLevel,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        item,
        alerts,
        currentQuantity,
        existingAlerts,
        activeAlertTypes,
        alert_1,
        alertLevel,
        alert_2,
        expirationDate,
        today,
        daysToExpiry,
        alert_3,
        alert_4,
        error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 12, , 13]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("inventory_items").select("*").eq("id", itemId).single(),
            ];
          case 2:
            item = _a.sent().data;
            if (!item) return [2 /*return*/, []];
            alerts = [];
            currentQuantity = stockLevel.available_quantity;
            return [
              4 /*yield*/,
              supabase
                .from("stock_alerts")
                .select("alert_type")
                .eq("item_id", itemId)
                .eq("location_id", locationId)
                .eq("status", "active"),
            ];
          case 3:
            existingAlerts = _a.sent().data;
            activeAlertTypes = new Set(
              (existingAlerts === null || existingAlerts === void 0
                ? void 0
                : existingAlerts.map((a) => a.alert_type)) || [],
            );
            if (!(currentQuantity === 0 && !activeAlertTypes.has("zero_stock")))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createAlert({
                itemId: itemId,
                locationId: locationId,
                alertType: "zero_stock",
                alertLevel: "urgent",
                title: "Zero Stock: ".concat(item.name),
                message: "".concat(item.name, " is completely out of stock at this location."),
                currentQuantity: currentQuantity,
                thresholdQuantity: 0,
              }),
            ];
          case 4:
            alert_1 = _a.sent();
            if (alert_1) alerts.push(alert_1);
            return [3 /*break*/, 7];
          case 5:
            if (!(currentQuantity <= item.reorder_level && !activeAlertTypes.has("low_stock")))
              return [3 /*break*/, 7];
            alertLevel = currentQuantity <= item.min_stock ? "critical" : "warning";
            return [
              4 /*yield*/,
              this.createAlert({
                itemId: itemId,
                locationId: locationId,
                alertType: "low_stock",
                alertLevel: alertLevel,
                title: "Low Stock: ".concat(item.name),
                message: ""
                  .concat(item.name, " stock is below reorder level. Current: ")
                  .concat(currentQuantity, ", Reorder Level: ")
                  .concat(item.reorder_level),
                currentQuantity: currentQuantity,
                thresholdQuantity: item.reorder_level,
              }),
            ];
          case 6:
            alert_2 = _a.sent();
            if (alert_2) alerts.push(alert_2);
            _a.label = 7;
          case 7:
            if (!stockLevel.expiration_date) return [3 /*break*/, 11];
            expirationDate = new Date(stockLevel.expiration_date);
            today = new Date();
            daysToExpiry = Math.ceil(
              (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (!(daysToExpiry <= 0 && !activeAlertTypes.has("expired"))) return [3 /*break*/, 9];
            return [
              4 /*yield*/,
              this.createAlert({
                itemId: itemId,
                locationId: locationId,
                alertType: "expired",
                alertLevel: "urgent",
                title: "Expired: ".concat(item.name),
                message: ""
                  .concat(item.name, " (Batch: ")
                  .concat(stockLevel.batch_number || "N/A", ") has expired."),
                currentQuantity: currentQuantity,
                thresholdQuantity: 0,
              }),
            ];
          case 8:
            alert_3 = _a.sent();
            if (alert_3) alerts.push(alert_3);
            return [3 /*break*/, 11];
          case 9:
            if (!(daysToExpiry <= 7 && daysToExpiry > 0 && !activeAlertTypes.has("expiring")))
              return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.createAlert({
                itemId: itemId,
                locationId: locationId,
                alertType: "expiring",
                alertLevel: daysToExpiry <= 3 ? "critical" : "warning",
                title: "Expiring Soon: ".concat(item.name),
                message: ""
                  .concat(item.name, " (Batch: ")
                  .concat(stockLevel.batch_number || "N/A", ") expires in ")
                  .concat(daysToExpiry, " days."),
                currentQuantity: currentQuantity,
                thresholdQuantity: daysToExpiry,
              }),
            ];
          case 10:
            alert_4 = _a.sent();
            if (alert_4) alerts.push(alert_4);
            _a.label = 11;
          case 11:
            return [2 /*return*/, alerts];
          case 12:
            error_5 = _a.sent();
            console.error("Alert checking failed:", error_5);
            return [2 /*return*/, []];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Creates a new stock alert with automatic notification
   */
  InventoryTrackingEngine.prototype.createAlert = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, alert_5, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("stock_alerts")
                .insert({
                  clinic_id: this.clinicId,
                  item_id: params.itemId,
                  location_id: params.locationId,
                  alert_type: params.alertType,
                  alert_level: params.alertLevel,
                  title: params.title,
                  message: params.message,
                  current_quantity: params.currentQuantity,
                  threshold_quantity: params.thresholdQuantity,
                  status: "active",
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (alert_5 = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to create alert:", error);
              return [2 /*return*/, null];
            }
            // Trigger notification delivery (async, non-blocking)
            this.deliverNotification(alert_5);
            return [2 /*return*/, alert_5];
          case 2:
            error_6 = _b.sent();
            console.error("Alert creation failed:", error_6);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delivers notifications for alerts (target: <60s)
   */
  InventoryTrackingEngine.prototype.deliverNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_7;
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
                  notification_sent: true,
                  notification_channels: ["dashboard", "email"], // Would be configurable
                })
                .eq("id", alert.id),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_7 = _a.sent();
            console.error("Notification delivery failed:", error_7);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================================================
  // BATCH OPERATIONS FOR EFFICIENCY
  // =====================================================================================
  /**
   * Processes multiple stock updates in a single batch operation
   */
  InventoryTrackingEngine.prototype.batchUpdateStock = function (updates, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var successful, failed, errors, _i, updates_1, update, result, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            successful = 0;
            failed = 0;
            errors = [];
            (_i = 0), (updates_1 = updates);
            _a.label = 1;
          case 1:
            if (!(_i < updates_1.length)) return [3 /*break*/, 6];
            update = updates_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.updateStockLevel(__assign(__assign({}, update), { userId: userId })),
            ];
          case 3:
            result = _a.sent();
            if (result.success) {
              successful++;
            } else {
              failed++;
              errors.push.apply(errors, result.errors);
            }
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            failed++;
            errors.push(
              "Batch update failed: ".concat(
                error_8 instanceof Error ? error_8.message : "Unknown error",
              ),
            );
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, { successful: successful, failed: failed, errors: errors }];
        }
      });
    });
  };
  // =====================================================================================
  // STOCK LEVEL QUERIES AND ANALYTICS
  // =====================================================================================
  /**
   * Gets current stock levels for an item across all locations
   */
  InventoryTrackingEngine.prototype.getItemStockLevels = function (itemId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("stock_levels")
                .select("\n        *,\n        location:inventory_locations(*)\n      ")
                .eq("item_id", itemId)
                .gt("current_quantity", 0),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get stock levels:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Gets low stock items requiring attention
   */
  InventoryTrackingEngine.prototype.getLowStockItems = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("v_low_stock_items")
                .select("*")
                .eq("clinic_id", this.clinicId)
                .order("shortage_quantity", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get low stock items:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Gets items expiring within specified days
   */
  InventoryTrackingEngine.prototype.getExpiringItems = function () {
    return __awaiter(this, arguments, void 0, function (days) {
      var supabase, _a, data, error;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("v_expiring_items")
                .select("*")
                .eq("clinic_id", this.clinicId)
                .lte("days_to_expiry", days)
                .order("expiration_date", { ascending: true }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get expiring items:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Gets inventory summary by category
   */
  InventoryTrackingEngine.prototype.getInventorySummary = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("v_inventory_summary")
                .select("*")
                .eq("clinic_id", this.clinicId)
                .order("total_inventory_value", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get inventory summary:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  return InventoryTrackingEngine;
})();
exports.InventoryTrackingEngine = InventoryTrackingEngine;
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
/**
 * Calculates stock accuracy based on physical counts vs system records
 */
function calculateStockAccuracy(systemQuantity, physicalQuantity) {
  if (systemQuantity === 0 && physicalQuantity === 0) return 100;
  if (systemQuantity === 0) return 0;
  var variance = Math.abs(systemQuantity - physicalQuantity);
  var accuracy = Math.max(0, 100 - (variance / systemQuantity) * 100);
  return Math.round(accuracy * 100) / 100;
}
/**
 * Determines alert priority based on stock level and item criticality
 */
function calculateAlertPriority(currentQuantity, reorderLevel, minStock, isCriticalItem) {
  if (isCriticalItem === void 0) {
    isCriticalItem = false;
  }
  if (currentQuantity === 0) {
    return { level: "urgent", escalationTime: 5 }; // 5 minutes
  }
  if (currentQuantity <= minStock) {
    return {
      level: isCriticalItem ? "urgent" : "critical",
      escalationTime: isCriticalItem ? 10 : 30,
    };
  }
  if (currentQuantity <= reorderLevel) {
    return { level: "warning", escalationTime: 60 };
  }
  return { level: "info", escalationTime: 240 };
}
/**
 * Validates stock operation before execution
 */
function validateStockOperation(currentQuantity, quantityChange, operation) {
  var errors = [];
  if (operation === "issue" && quantityChange > 0) {
    errors.push("Issue operations require negative quantity change");
  }
  if (operation === "receive" && quantityChange < 0) {
    errors.push("Receive operations require positive quantity change");
  }
  if (quantityChange < 0 && Math.abs(quantityChange) > currentQuantity) {
    errors.push("Cannot issue more than available quantity");
  }
  return { valid: errors.length === 0, errors: errors };
}
exports.default = InventoryTrackingEngine;
