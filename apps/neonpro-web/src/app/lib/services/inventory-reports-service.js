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
exports.createinventoryReportsService = void 0;
var client_1 = require("@/lib/supabase/client");
var InventoryReportsService = /** @class */ (() => {
  function InventoryReportsService() {}
  // Supabase client created per method for proper request context
  // =============================================================================
  // STOCK MOVEMENT REPORTS
  // =============================================================================
  InventoryReportsService.prototype.generateStockMovementReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, query, _a, movements, error, reportData, summary;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            query = supabase
              .from("stock_transactions")
              .select(
                "\n        id,\n        item_id,\n        inventory_items!inner(name, sku, category),\n        transaction_type,\n        quantity_change,\n        unit_cost,\n        clinic_id,\n        room_id,\n        clinics!inner(name),\n        rooms(name),\n        created_at,\n        user_id,\n        reference_document,\n        notes,\n        batch_number\n      ",
              );
            // Apply filters
            if (filters.start_date) {
              query = query.gte("created_at", filters.start_date);
            }
            if (filters.end_date) {
              query = query.lte("created_at", filters.end_date);
            }
            if (filters.clinic_id) {
              query = query.eq("clinic_id", filters.clinic_id);
            }
            if (filters.room_id) {
              query = query.eq("room_id", filters.room_id);
            }
            if (filters.category) {
              query = query.eq("inventory_items.category", filters.category);
            }
            if (filters.item_id) {
              query = query.eq("item_id", filters.item_id);
            }
            if (filters.movement_type) {
              query = query.eq("transaction_type", filters.movement_type);
            }
            query = query.order("created_at", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (movements = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch stock movements: ".concat(error.message));
            }
            reportData =
              (movements === null || movements === void 0
                ? void 0
                : movements.map((movement) => {
                    var _a;
                    return {
                      movement_id: movement.id,
                      item_id: movement.item_id,
                      item_name: movement.inventory_items.name,
                      item_sku: movement.inventory_items.sku,
                      category: movement.inventory_items.category,
                      movement_type: movement.transaction_type,
                      quantity: Math.abs(movement.quantity_change),
                      unit_cost: movement.unit_cost || 0,
                      total_cost: Math.abs(movement.quantity_change) * (movement.unit_cost || 0),
                      clinic_name: movement.clinics.name,
                      room_name:
                        ((_a = movement.rooms) === null || _a === void 0 ? void 0 : _a.name) ||
                        "N/A",
                      movement_date: movement.created_at,
                      reference_document: movement.reference_document,
                      notes: movement.notes,
                      batch_number: movement.batch_number,
                    };
                  })) || [];
            summary = this.calculateStockMovementSummary(reportData);
            return [
              2 /*return*/,
              {
                data: reportData,
                summary: summary,
                metadata: {
                  generated_at: new Date().toISOString(),
                  parameters: { type: "stock_movement", filters: filters, format: "json" },
                  total_records: reportData.length,
                  execution_time: Date.now() - startTime,
                },
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateStockMovementSummary = (data) => {
    var summary = {
      total_movements: data.length,
      total_in: 0,
      total_out: 0,
      total_value_in: 0,
      total_value_out: 0,
      net_movement: 0,
      net_value: 0,
      by_type: {},
      by_category: {},
      by_location: {},
    };
    data.forEach((movement) => {
      var isInbound = ["in", "return", "adjustment"].includes(movement.movement_type);
      if (isInbound) {
        summary.total_in += movement.quantity;
        summary.total_value_in += movement.total_cost;
      } else {
        summary.total_out += movement.quantity;
        summary.total_value_out += movement.total_cost;
      }
      // By type
      if (!summary.by_type[movement.movement_type]) {
        summary.by_type[movement.movement_type] = { count: 0, quantity: 0, value: 0 };
      }
      summary.by_type[movement.movement_type].count++;
      summary.by_type[movement.movement_type].quantity += movement.quantity;
      summary.by_type[movement.movement_type].value += movement.total_cost;
      // By category
      if (!summary.by_category[movement.category]) {
        summary.by_category[movement.category] = { count: 0, quantity: 0, value: 0 };
      }
      summary.by_category[movement.category].count++;
      summary.by_category[movement.category].quantity += movement.quantity;
      summary.by_category[movement.category].value += movement.total_cost;
      // By location
      var locationKey = "".concat(movement.clinic_name, " - ").concat(movement.room_name);
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = { count: 0, quantity: 0, value: 0 };
      }
      summary.by_location[locationKey].count++;
      summary.by_location[locationKey].quantity += movement.quantity;
      summary.by_location[locationKey].value += movement.total_cost;
    });
    summary.net_movement = summary.total_in - summary.total_out;
    summary.net_value = summary.total_value_in - summary.total_value_out;
    return summary;
  };
  // =============================================================================
  // STOCK VALUATION REPORTS
  // =============================================================================
  InventoryReportsService.prototype.generateStockValuationReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, query, _a, stockData, error, reportData, summary;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            query = supabase
              .from("inventory_stock")
              .select(
                "\n        item_id,\n        inventory_items!inner(name, sku, category, minimum_quantity),\n        clinic_id,\n        room_id,\n        clinics!inner(name),\n        rooms(name),\n        current_quantity,\n        cost_per_unit,\n        last_updated\n      ",
              );
            // Apply filters
            if (filters.clinic_id) {
              query = query.eq("clinic_id", filters.clinic_id);
            }
            if (filters.room_id) {
              query = query.eq("room_id", filters.room_id);
            }
            if (filters.category) {
              query = query.eq("inventory_items.category", filters.category);
            }
            if (filters.item_id) {
              query = query.eq("item_id", filters.item_id);
            }
            if (!filters.include_zero_stock) {
              query = query.gt("current_quantity", 0);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (stockData = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch stock valuation data: ".concat(error.message));
            }
            reportData =
              (stockData === null || stockData === void 0
                ? void 0
                : stockData.map((stock) => {
                    var _a;
                    var daysSinceMovement = stock.last_updated
                      ? Math.floor(
                          (Date.now() - new Date(stock.last_updated).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : null;
                    var minimumQuantity = stock.inventory_items.minimum_quantity || 0;
                    var stockStatus = "adequate";
                    if (stock.current_quantity === 0) {
                      stockStatus = "critical";
                    } else if (stock.current_quantity <= minimumQuantity * 0.5) {
                      stockStatus = "critical";
                    } else if (stock.current_quantity <= minimumQuantity) {
                      stockStatus = "low";
                    } else if (stock.current_quantity > minimumQuantity * 3) {
                      stockStatus = "overstock";
                    }
                    return {
                      item_id: stock.item_id,
                      item_name: stock.inventory_items.name,
                      item_sku: stock.inventory_items.sku,
                      category: stock.inventory_items.category,
                      clinic_name: stock.clinics.name,
                      room_name:
                        ((_a = stock.rooms) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                      current_quantity: stock.current_quantity,
                      unit_cost: stock.cost_per_unit || 0,
                      total_value: stock.current_quantity * (stock.cost_per_unit || 0),
                      last_movement_date: stock.last_updated,
                      days_since_movement: daysSinceMovement,
                      stock_status: stockStatus,
                    };
                  })) || [];
            summary = this.calculateStockValuationSummary(reportData);
            return [
              2 /*return*/,
              {
                data: reportData,
                summary: summary,
                metadata: {
                  generated_at: new Date().toISOString(),
                  parameters: { type: "stock_valuation", filters: filters, format: "json" },
                  total_records: reportData.length,
                  execution_time: Date.now() - startTime,
                },
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateStockValuationSummary = (data) => {
    var summary = {
      total_items: data.length,
      total_quantity: 0,
      total_value: 0,
      average_unit_cost: 0,
      by_category: {},
      by_location: {},
      by_status: {},
    };
    var totalCostSum = 0;
    var itemsWithCost = 0;
    data.forEach((item) => {
      summary.total_quantity += item.current_quantity;
      summary.total_value += item.total_value;
      if (item.unit_cost > 0) {
        totalCostSum += item.unit_cost;
        itemsWithCost++;
      }
      // By category
      if (!summary.by_category[item.category]) {
        summary.by_category[item.category] = { items: 0, quantity: 0, value: 0, percentage: 0 };
      }
      summary.by_category[item.category].items++;
      summary.by_category[item.category].quantity += item.current_quantity;
      summary.by_category[item.category].value += item.total_value;
      // By location
      var locationKey = "".concat(item.clinic_name, " - ").concat(item.room_name);
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = { items: 0, quantity: 0, value: 0, percentage: 0 };
      }
      summary.by_location[locationKey].items++;
      summary.by_location[locationKey].quantity += item.current_quantity;
      summary.by_location[locationKey].value += item.total_value;
      // By status
      if (!summary.by_status[item.stock_status]) {
        summary.by_status[item.stock_status] = { items: 0, quantity: 0, value: 0, percentage: 0 };
      }
      summary.by_status[item.stock_status].items++;
      summary.by_status[item.stock_status].quantity += item.current_quantity;
      summary.by_status[item.stock_status].value += item.total_value;
    });
    summary.average_unit_cost = itemsWithCost > 0 ? totalCostSum / itemsWithCost : 0;
    // Calculate percentages
    Object.values(summary.by_category).forEach((cat) => {
      cat.percentage = summary.total_value > 0 ? (cat.value / summary.total_value) * 100 : 0;
    });
    Object.values(summary.by_location).forEach((loc) => {
      loc.percentage = summary.total_value > 0 ? (loc.value / summary.total_value) * 100 : 0;
    });
    Object.values(summary.by_status).forEach((status) => {
      status.percentage = summary.total_value > 0 ? (status.value / summary.total_value) * 100 : 0;
    });
    return summary;
  };
  // =============================================================================
  // EXPIRING ITEMS REPORTS
  // =============================================================================
  InventoryReportsService.prototype.generateExpiringItemsReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, query, futureDate, _a, expiringData, error, reportData, summary;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            query = supabase
              .from("inventory_stock")
              .select(
                "\n        item_id,\n        inventory_items!inner(name, sku, category),\n        clinic_id,\n        room_id,\n        clinics!inner(name),\n        rooms(name),\n        current_quantity,\n        cost_per_unit,\n        expiry_date,\n        batch_number\n      ",
              )
              .not("expiry_date", "is", null)
              .gt("current_quantity", 0);
            // Apply filters
            if (filters.clinic_id) {
              query = query.eq("clinic_id", filters.clinic_id);
            }
            if (filters.room_id) {
              query = query.eq("room_id", filters.room_id);
            }
            if (filters.category) {
              query = query.eq("inventory_items.category", filters.category);
            }
            futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 90);
            query = query.lte("expiry_date", futureDate.toISOString());
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (expiringData = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch expiring items: ".concat(error.message));
            }
            reportData =
              (expiringData === null || expiringData === void 0
                ? void 0
                : expiringData.map((item) => {
                    var _a;
                    var expiryDate = new Date(item.expiry_date);
                    var today = new Date();
                    var daysToExpiry = Math.ceil(
                      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    );
                    var urgencyLevel = "watch";
                    var suggestedAction = "dispose";
                    if (daysToExpiry <= 0) {
                      urgencyLevel = "immediate";
                      suggestedAction = "dispose";
                    } else if (daysToExpiry <= 7) {
                      urgencyLevel = "urgent";
                      suggestedAction = "use_immediately";
                    } else if (daysToExpiry <= 30) {
                      urgencyLevel = "warning";
                      suggestedAction = "discount";
                    } else {
                      urgencyLevel = "watch";
                      suggestedAction = "transfer";
                    }
                    return {
                      item_id: item.item_id,
                      item_name: item.inventory_items.name,
                      item_sku: item.inventory_items.sku,
                      category: item.inventory_items.category,
                      clinic_name: item.clinics.name,
                      room_name:
                        ((_a = item.rooms) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                      batch_number: item.batch_number || "N/A",
                      expiry_date: item.expiry_date,
                      days_to_expiry: daysToExpiry,
                      current_quantity: item.current_quantity,
                      unit_cost: item.cost_per_unit || 0,
                      total_value: item.current_quantity * (item.cost_per_unit || 0),
                      urgency_level: urgencyLevel,
                      suggested_action: suggestedAction,
                    };
                  })) || [];
            // Sort by urgency and days to expiry
            reportData.sort((a, b) => {
              var urgencyOrder = { immediate: 0, urgent: 1, warning: 2, watch: 3 };
              var urgencyDiff = urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level];
              if (urgencyDiff !== 0) return urgencyDiff;
              return a.days_to_expiry - b.days_to_expiry;
            });
            summary = this.calculateExpiringItemsSummary(reportData);
            return [
              2 /*return*/,
              {
                data: reportData,
                summary: summary,
                metadata: {
                  generated_at: new Date().toISOString(),
                  parameters: { type: "expiring_items", filters: filters, format: "json" },
                  total_records: reportData.length,
                  execution_time: Date.now() - startTime,
                },
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateExpiringItemsSummary = (data) => {
    var summary = {
      total_expiring_items: data.length,
      total_expiring_value: 0,
      by_urgency: {},
      by_category: {},
      by_location: {},
      upcoming_expirations_30_days: 0,
      upcoming_expirations_60_days: 0,
      upcoming_expirations_90_days: 0,
    };
    data.forEach((item) => {
      summary.total_expiring_value += item.total_value;
      // Count by time periods
      if (item.days_to_expiry <= 30) summary.upcoming_expirations_30_days++;
      if (item.days_to_expiry <= 60) summary.upcoming_expirations_60_days++;
      if (item.days_to_expiry <= 90) summary.upcoming_expirations_90_days++;
      // By urgency
      if (!summary.by_urgency[item.urgency_level]) {
        summary.by_urgency[item.urgency_level] = { items: 0, quantity: 0, value: 0 };
      }
      summary.by_urgency[item.urgency_level].items++;
      summary.by_urgency[item.urgency_level].quantity += item.current_quantity;
      summary.by_urgency[item.urgency_level].value += item.total_value;
      // By category
      if (!summary.by_category[item.category]) {
        summary.by_category[item.category] = { items: 0, quantity: 0, value: 0 };
      }
      summary.by_category[item.category].items++;
      summary.by_category[item.category].quantity += item.current_quantity;
      summary.by_category[item.category].value += item.total_value;
      // By location
      var locationKey = "".concat(item.clinic_name, " - ").concat(item.room_name);
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = { items: 0, quantity: 0, value: 0 };
      }
      summary.by_location[locationKey].items++;
      summary.by_location[locationKey].quantity += item.current_quantity;
      summary.by_location[locationKey].value += item.total_value;
    });
    return summary;
  };
  // =============================================================================
  // TRANSFER REPORTS
  // =============================================================================
  InventoryReportsService.prototype.generateTransferReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, query, _a, transfers, error, reportData, summary;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            query = supabase
              .from("stock_transfers")
              .select(
                "\n        id,\n        item_id,\n        inventory_items!inner(name, sku, category),\n        from_clinic_id,\n        to_clinic_id,\n        from_room_id,\n        to_room_id,\n        from_clinics:clinics!from_clinic_id(name),\n        to_clinics:clinics!to_clinic_id(name),\n        from_rooms:rooms!from_room_id(name),\n        to_rooms:rooms!to_room_id(name),\n        quantity,\n        unit_cost,\n        status,\n        reason,\n        created_at,\n        completed_at,\n        notes\n      ",
              );
            // Apply filters
            if (filters.start_date) {
              query = query.gte("created_at", filters.start_date);
            }
            if (filters.end_date) {
              query = query.lte("created_at", filters.end_date);
            }
            if (filters.clinic_id) {
              query = query.or(
                "from_clinic_id.eq."
                  .concat(filters.clinic_id, ",to_clinic_id.eq.")
                  .concat(filters.clinic_id),
              );
            }
            if (filters.category) {
              query = query.eq("inventory_items.category", filters.category);
            }
            query = query.order("created_at", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (transfers = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch transfer data: ".concat(error.message));
            }
            reportData =
              (transfers === null || transfers === void 0
                ? void 0
                : transfers.map((transfer) => {
                    var _a, _b;
                    return {
                      transfer_id: transfer.id,
                      item_id: transfer.item_id,
                      item_name: transfer.inventory_items.name,
                      item_sku: transfer.inventory_items.sku,
                      category: transfer.inventory_items.category,
                      from_clinic_name: transfer.from_clinics.name,
                      from_room_name:
                        ((_a = transfer.from_rooms) === null || _a === void 0 ? void 0 : _a.name) ||
                        "N/A",
                      to_clinic_name: transfer.to_clinics.name,
                      to_room_name:
                        ((_b = transfer.to_rooms) === null || _b === void 0 ? void 0 : _b.name) ||
                        "N/A",
                      quantity: transfer.quantity,
                      unit_cost: transfer.unit_cost || 0,
                      total_value: transfer.quantity * (transfer.unit_cost || 0),
                      transfer_date: transfer.created_at,
                      status: transfer.status,
                      reason: transfer.reason,
                      notes: transfer.notes,
                    };
                  })) || [];
            summary = this.calculateTransferSummary(reportData);
            return [
              2 /*return*/,
              {
                data: reportData,
                summary: summary,
                metadata: {
                  generated_at: new Date().toISOString(),
                  parameters: { type: "transfers", filters: filters, format: "json" },
                  total_records: reportData.length,
                  execution_time: Date.now() - startTime,
                },
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateTransferSummary = (data) => {
    var summary = {
      total_transfers: data.length,
      completed_transfers: 0,
      pending_transfers: 0,
      total_value_transferred: 0,
      average_transfer_value: 0,
      by_status: {},
      by_route: {},
      by_category: {},
      most_transferred_items: [],
    };
    var itemCounts = {};
    data.forEach((transfer) => {
      summary.total_value_transferred += transfer.total_value;
      if (transfer.status === "completed") {
        summary.completed_transfers++;
      } else if (transfer.status === "pending") {
        summary.pending_transfers++;
      }
      // By status
      if (!summary.by_status[transfer.status]) {
        summary.by_status[transfer.status] = { count: 0, value: 0 };
      }
      summary.by_status[transfer.status].count++;
      summary.by_status[transfer.status].value += transfer.total_value;
      // By route
      var route = "".concat(transfer.from_clinic_name, " ? ").concat(transfer.to_clinic_name);
      if (!summary.by_route[route]) {
        summary.by_route[route] = { count: 0, value: 0, avg_time: 0 };
      }
      summary.by_route[route].count++;
      summary.by_route[route].value += transfer.total_value;
      // By category
      if (!summary.by_category[transfer.category]) {
        summary.by_category[transfer.category] = { count: 0, value: 0 };
      }
      summary.by_category[transfer.category].count++;
      summary.by_category[transfer.category].value += transfer.total_value;
      // Track item counts
      if (!itemCounts[transfer.item_name]) {
        itemCounts[transfer.item_name] = { name: transfer.item_name, count: 0, total_quantity: 0 };
      }
      itemCounts[transfer.item_name].count++;
      itemCounts[transfer.item_name].total_quantity += transfer.quantity;
    });
    summary.average_transfer_value =
      summary.total_transfers > 0 ? summary.total_value_transferred / summary.total_transfers : 0;
    // Get most transferred items
    summary.most_transferred_items = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return summary;
  };
  // =============================================================================
  // LOCATION PERFORMANCE REPORTS
  // =============================================================================
  InventoryReportsService.prototype.generateLocationPerformanceReport = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        locationsQuery,
        _a,
        clinics,
        clinicsError,
        reportData,
        _i,
        _b,
        clinic,
        performance_1,
        summary;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            startTime = Date.now();
            locationsQuery = supabase.from("clinics").select("id, name");
            if (filters.clinic_id) {
              locationsQuery = locationsQuery.eq("id", filters.clinic_id);
            }
            return [4 /*yield*/, locationsQuery];
          case 1:
            (_a = _c.sent()), (clinics = _a.data), (clinicsError = _a.error);
            if (clinicsError) {
              throw new Error("Failed to fetch clinics: ".concat(clinicsError.message));
            }
            reportData = [];
            (_i = 0), (_b = clinics || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            clinic = _b[_i];
            return [4 /*yield*/, this.calculateLocationPerformance(clinic.id, filters)];
          case 3:
            performance_1 = _c.sent();
            reportData.push(
              __assign({ clinic_id: clinic.id, clinic_name: clinic.name }, performance_1),
            );
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            summary = this.calculateLocationPerformanceSummary(reportData);
            return [
              2 /*return*/,
              {
                data: reportData,
                summary: summary,
                metadata: {
                  generated_at: new Date().toISOString(),
                  parameters: { type: "location_performance", filters: filters, format: "json" },
                  total_records: reportData.length,
                  execution_time: Date.now() - startTime,
                },
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateLocationPerformance = function (clinicId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        stockData,
        movementQuery,
        movements,
        transfersOut,
        transfersIn,
        totalItems,
        totalValue,
        totalMovements,
        movementsIn,
        movementsOut,
        valueIn,
        valueOut,
        lowStockItems,
        turnoverRate,
        stockAccuracy,
        transferRequests,
        utilizationRate,
        performanceScore;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("inventory_stock")
                .select("current_quantity, cost_per_unit, inventory_items!inner(minimum_quantity)")
                .eq("clinic_id", clinicId),
            ];
          case 2:
            stockData = _a.sent().data;
            movementQuery = supabase
              .from("stock_transactions")
              .select("transaction_type, quantity_change, unit_cost, created_at")
              .eq("clinic_id", clinicId);
            if (filters.start_date) {
              movementQuery = movementQuery.gte("created_at", filters.start_date);
            }
            if (filters.end_date) {
              movementQuery = movementQuery.lte("created_at", filters.end_date);
            }
            return [4 /*yield*/, movementQuery];
          case 3:
            movements = _a.sent().data;
            return [
              4 /*yield*/,
              supabase.from("stock_transfers").select("id").eq("from_clinic_id", clinicId),
            ];
          case 4:
            transfersOut = _a.sent().data;
            return [
              4 /*yield*/,
              supabase.from("stock_transfers").select("id").eq("to_clinic_id", clinicId),
            ];
          case 5:
            transfersIn = _a.sent().data;
            totalItems =
              (stockData === null || stockData === void 0 ? void 0 : stockData.length) || 0;
            totalValue =
              (stockData === null || stockData === void 0
                ? void 0
                : stockData.reduce(
                    (sum, item) => sum + item.current_quantity * (item.cost_per_unit || 0),
                    0,
                  )) || 0;
            totalMovements =
              (movements === null || movements === void 0 ? void 0 : movements.length) || 0;
            movementsIn =
              (movements === null || movements === void 0
                ? void 0
                : movements.filter(
                    (m) =>
                      ["in", "return", "adjustment"].includes(m.transaction_type) &&
                      m.quantity_change > 0,
                  ).length) || 0;
            movementsOut =
              (movements === null || movements === void 0
                ? void 0
                : movements.filter(
                    (m) =>
                      ["out", "transfer", "waste"].includes(m.transaction_type) &&
                      m.quantity_change < 0,
                  ).length) || 0;
            valueIn =
              (movements === null || movements === void 0
                ? void 0
                : movements
                    .filter((m) => m.quantity_change > 0)
                    .reduce(
                      (sum, m) => sum + Math.abs(m.quantity_change) * (m.unit_cost || 0),
                      0,
                    )) || 0;
            valueOut =
              (movements === null || movements === void 0
                ? void 0
                : movements
                    .filter((m) => m.quantity_change < 0)
                    .reduce(
                      (sum, m) => sum + Math.abs(m.quantity_change) * (m.unit_cost || 0),
                      0,
                    )) || 0;
            lowStockItems =
              (stockData === null || stockData === void 0
                ? void 0
                : stockData.filter(
                    (item) => item.current_quantity <= (item.inventory_items.minimum_quantity || 0),
                  ).length) || 0;
            turnoverRate = totalValue > 0 ? (valueOut / totalValue) * 100 : 0;
            stockAccuracy =
              totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100;
            transferRequests =
              ((transfersOut === null || transfersOut === void 0 ? void 0 : transfersOut.length) ||
                0) +
              ((transfersIn === null || transfersIn === void 0 ? void 0 : transfersIn.length) || 0);
            utilizationRate = totalItems > 0 ? (movementsOut / totalItems) * 100 : 0;
            performanceScore = Math.min(
              100,
              turnoverRate * 0.3 +
                stockAccuracy * 0.3 +
                utilizationRate * 0.2 +
                Math.min(100, (totalMovements / Math.max(1, totalItems)) * 20) * 0.2,
            );
            return [
              2 /*return*/,
              {
                total_items: totalItems,
                total_value: totalValue,
                total_movements: totalMovements,
                movements_in: movementsIn,
                movements_out: movementsOut,
                value_in: valueIn,
                value_out: valueOut,
                turnover_rate: turnoverRate,
                stock_accuracy: stockAccuracy,
                low_stock_items: lowStockItems,
                expiring_items: 0, // Would need separate query
                transfer_requests: transferRequests,
                utilization_rate: utilizationRate,
                performance_score: performanceScore,
              },
            ];
        }
      });
    });
  };
  InventoryReportsService.prototype.calculateLocationPerformanceSummary = (data) => {
    if (data.length === 0) {
      return {
        total_locations: 0,
        average_performance_score: 0,
        best_performing_location: "",
        worst_performing_location: "",
        total_system_value: 0,
        total_system_movements: 0,
        average_turnover_rate: 0,
        locations_needing_attention: 0,
      };
    }
    var bestLocation = data.reduce((best, location) =>
      location.performance_score > best.performance_score ? location : best,
    );
    var worstLocation = data.reduce((worst, location) =>
      location.performance_score < worst.performance_score ? location : worst,
    );
    return {
      total_locations: data.length,
      average_performance_score:
        data.reduce((sum, loc) => sum + loc.performance_score, 0) / data.length,
      best_performing_location: bestLocation.clinic_name,
      worst_performing_location: worstLocation.clinic_name,
      total_system_value: data.reduce((sum, loc) => sum + loc.total_value, 0),
      total_system_movements: data.reduce((sum, loc) => sum + loc.total_movements, 0),
      average_turnover_rate: data.reduce((sum, loc) => sum + loc.turnover_rate, 0) / data.length,
      locations_needing_attention: data.filter((loc) => loc.performance_score < 70).length,
    };
  };
  // =============================================================================
  // UNIFIED REPORT GENERATION
  // =============================================================================
  InventoryReportsService.prototype.generateReport = function (parameters) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = parameters.type;
            switch (_a) {
              case "stock_movement":
                return [3 /*break*/, 1];
              case "stock_valuation":
                return [3 /*break*/, 2];
              case "expiring_items":
                return [3 /*break*/, 3];
              case "transfers":
                return [3 /*break*/, 4];
              case "location_performance":
                return [3 /*break*/, 5];
              case "low_stock":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 8];
          case 1:
            return [2 /*return*/, this.generateStockMovementReport(parameters.filters)];
          case 2:
            return [2 /*return*/, this.generateStockValuationReport(parameters.filters)];
          case 3:
            return [2 /*return*/, this.generateExpiringItemsReport(parameters.filters)];
          case 4:
            return [2 /*return*/, this.generateTransferReport(parameters.filters)];
          case 5:
            return [2 /*return*/, this.generateLocationPerformanceReport(parameters.filters)];
          case 6:
            return [4 /*yield*/, this.generateStockValuationReport(parameters.filters)];
          case 7:
            result = _b.sent();
            result.data = result.data.filter(
              (item) => item.stock_status === "low" || item.stock_status === "critical",
            );
            return [2 /*return*/, result];
          case 8:
            throw new Error("Unsupported report type: ".concat(parameters.type));
        }
      });
    });
  };
  // =============================================================================
  // REPORT MANAGEMENT
  // =============================================================================
  InventoryReportsService.prototype.saveReportDefinition = function (definition) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("report_definitions")
                .insert([
                  __assign(__assign({}, definition), {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                ])
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to save report definition: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  InventoryReportsService.prototype.getReportDefinitions = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("report_definitions")
              .select("*")
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.created_by) {
              query = query.eq("created_by", filters.created_by);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined
            ) {
              query = query.eq("is_active", filters.is_active);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch report definitions: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  InventoryReportsService.prototype.getDashboardStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would typically query report execution history
        // For now, return mock data
        return [
          2 /*return*/,
          {
            total_reports_generated: 150,
            scheduled_reports: 12,
            active_executions: 2,
            failed_executions_today: 0,
            storage_used: 2.3, // GB
            most_generated_type: "stock_valuation",
            average_generation_time: 3.2, // seconds
          },
        ];
      });
    });
  };
  return InventoryReportsService;
})();
var createinventoryReportsService = () => new InventoryReportsService();
exports.createinventoryReportsService = createinventoryReportsService;
