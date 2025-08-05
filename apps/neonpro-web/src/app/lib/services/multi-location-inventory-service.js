"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLocationInventoryService = void 0;
var client_1 = require("@/lib/supabase/client");
var MultiLocationInventoryService = /** @class */ (function () {
    function MultiLocationInventoryService() {
    }
    // Supabase client created per method for proper request context
    // ===== INVENTORY ITEMS =====
    MultiLocationInventoryService.prototype.getInventoryItems = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('inventory_items')
                            .select('*')
                            .order('name');
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.category) {
                            query = query.eq('category', filters.category);
                        }
                        if (filters.active_only !== false) {
                            query = query.eq('is_active', true);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.getInventoryItem = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('inventory_items')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.createInventoryItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('inventory_items')
                                .insert(item)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.updateInventoryItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updates, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = item.id, updates = __rest(item, ["id"]);
                        return [4 /*yield*/, supabase
                                .from('inventory_items')
                                .update(updates)
                                .eq('id', id)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.deleteInventoryItem = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('inventory_items')
                            .delete()
                            .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    // ===== INVENTORY STOCK =====
    MultiLocationInventoryService.prototype.getInventoryStock = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, nextMonth, _a, data, error;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('inventory_stock')
                            .select("\n        *,\n        inventory_item:inventory_items(*),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name, description)\n      ")
                            .order('updated_at', { ascending: false });
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.room_id) {
                            query = query.eq('room_id', filters.room_id);
                        }
                        if (filters.low_stock) {
                            query = query.lt('available_quantity', 'inventory_items.minimum_stock_alert');
                        }
                        if (filters.expiring_soon) {
                            nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            query = query.lte('expiry_date', nextMonth.toISOString().split('T')[0]);
                        }
                        if (filters.batch_number) {
                            query = query.eq('batch_number', filters.batch_number);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.getStockByLocation = function (clinic_id, room_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getInventoryStock({ clinic_id: clinic_id, room_id: room_id })];
            });
        });
    };
    MultiLocationInventoryService.prototype.updateStock = function (stock) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updates, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = stock.id, updates = __rest(stock, ["id"]);
                        return [4 /*yield*/, supabase
                                .from('inventory_stock')
                                .update(__assign(__assign({}, updates), { last_counted_at: new Date().toISOString() }))
                                .eq('id', id)
                                .select("\n        *,\n        inventory_item:inventory_items(*),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name, description)\n      ")
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.createOrUpdateStock = function (stock) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('inventory_stock')
                                .upsert(stock)
                                .select("\n        *,\n        inventory_item:inventory_items(*),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name, description)\n      ")
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    }; // ===== STOCK TRANSFERS =====
    MultiLocationInventoryService.prototype.getStockTransfers = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('stock_transfers')
                            .select("\n        *,\n        inventory_item:inventory_items(id, name, sku, category),\n        from_clinic:from_clinic_id(id, clinic_name, clinic_code),\n        from_room:from_room_id(id, name),\n        to_clinic:to_clinic_id(id, clinic_name, clinic_code),\n        to_room:to_room_id(id, name),\n        requester:requested_by(id, full_name)\n      ")
                            .order('created_at', { ascending: false });
                        if (filters.clinic_id) {
                            query = query.or("from_clinic_id.eq.".concat(filters.clinic_id, ",to_clinic_id.eq.").concat(filters.clinic_id));
                        }
                        if (filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if (filters.transfer_type) {
                            query = query.eq('transfer_type', filters.transfer_type);
                        }
                        if (filters.date_from) {
                            query = query.gte('created_at', filters.date_from);
                        }
                        if (filters.date_to) {
                            query = query.lte('created_at', filters.date_to);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.createStockTransfer = function (transfer) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('stock_transfers')
                                .insert(__assign(__assign({}, transfer), { requested_at: new Date().toISOString() }))
                                .select("\n        *,\n        inventory_item:inventory_items(id, name, sku, category),\n        from_clinic:from_clinic_id(id, clinic_name, clinic_code),\n        from_room:from_room_id(id, name),\n        to_clinic:to_clinic_id(id, clinic_name, clinic_code),\n        to_room:to_room_id(id, name)\n      ")
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.updateStockTransfer = function (transfer) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updates, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = transfer.id, updates = __rest(transfer, ["id"]);
                        // Add timestamps based on status changes
                        if (updates.status === 'approved' && !updates.approved_at) {
                            updates.approved_at = new Date().toISOString();
                        }
                        if (updates.status === 'in_transit' && !updates.sent_at) {
                            updates.sent_at = new Date().toISOString();
                        }
                        if (updates.status === 'completed' && !updates.received_at) {
                            updates.received_at = new Date().toISOString();
                        }
                        return [4 /*yield*/, supabase
                                .from('stock_transfers')
                                .update(updates)
                                .eq('id', id)
                                .select("\n        *,\n        inventory_item:inventory_items(id, name, sku, category),\n        from_clinic:from_clinic_id(id, clinic_name, clinic_code),\n        from_room:from_room_id(id, name),\n        to_clinic:to_clinic_id(id, clinic_name, clinic_code),\n        to_room:to_room_id(id, name)\n      ")
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // ===== STOCK TRANSACTIONS =====
    MultiLocationInventoryService.prototype.getStockTransactions = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('stock_transactions')
                            .select("\n        *,\n        inventory_item:inventory_items(id, name, sku, category),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name),\n        performer:performed_by(id, full_name)\n      ")
                            .order('created_at', { ascending: false });
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.room_id) {
                            query = query.eq('room_id', filters.room_id);
                        }
                        if (filters.transaction_type) {
                            query = query.eq('transaction_type', filters.transaction_type);
                        }
                        if (filters.inventory_item_id) {
                            query = query.eq('inventory_item_id', filters.inventory_item_id);
                        }
                        if (filters.date_from) {
                            query = query.gte('created_at', filters.date_from);
                        }
                        if (filters.date_to) {
                            query = query.lte('created_at', filters.date_to);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.createStockTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('stock_transactions')
                                .insert(transaction)
                                .select("\n        *,\n        inventory_item:inventory_items(id, name, sku, category),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name)\n      ")
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // ===== DASHBOARD & ANALYTICS =====
    MultiLocationInventoryService.prototype.getLocationStockSummary = function (clinic_id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .rpc('get_location_stock_summary');
                        if (clinic_id) {
                            query = query.eq('clinic_id', clinic_id);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.getInventoryMovementSummary = function (clinic_id_1) {
        return __awaiter(this, arguments, void 0, function (clinic_id, days) {
            var fromDate, supabase, _a, data, error;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fromDate = new Date();
                        fromDate.setDate(fromDate.getDate() - days);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .rpc('get_inventory_movement_summary', {
                                clinic_filter: clinic_id,
                                from_date: fromDate.toISOString(),
                                to_date: new Date().toISOString()
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.getLowStockAlerts = function (clinic_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getInventoryStock({
                        clinic_id: clinic_id,
                        low_stock: true
                    })];
            });
        });
    };
    MultiLocationInventoryService.prototype.getExpiringItems = function (clinic_id_1) {
        return __awaiter(this, arguments, void 0, function (clinic_id, days) {
            if (days === void 0) { days = 30; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getInventoryStock({
                        clinic_id: clinic_id,
                        expiring_soon: true
                    })];
            });
        });
    };
    // ===== BULK OPERATIONS =====
    MultiLocationInventoryService.prototype.bulkUpdateStock = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('inventory_stock')
                                .upsert(updates.map(function (update) { return (__assign(__assign({}, update), { last_counted_at: new Date().toISOString() })); }))
                                .select("\n        *,\n        inventory_item:inventory_items(*),\n        clinic:clinics(id, clinic_name, clinic_code),\n        room:rooms(id, name, description)\n      ")];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    MultiLocationInventoryService.prototype.transferStock = function (inventory_item_id, from_clinic_id, to_clinic_id, quantity, from_room_id, to_room_id, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var transfer;
            return __generator(this, function (_a) {
                transfer = {
                    inventory_item_id: inventory_item_id,
                    from_clinic_id: from_clinic_id,
                    to_clinic_id: to_clinic_id,
                    from_room_id: from_room_id,
                    to_room_id: to_room_id,
                    quantity: quantity,
                    transfer_type: from_clinic_id === to_clinic_id ? 'internal' : 'inter_clinic',
                    notes: notes,
                    requested_by: '',
                };
                return [2 /*return*/, this.createStockTransfer(transfer)];
            });
        });
    };
    return MultiLocationInventoryService;
}());
exports.MultiLocationInventoryService = MultiLocationInventoryService;
