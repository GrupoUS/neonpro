"use strict";
// Cash Flow Service - Supabase operations for cash flow management
// Following financial dashboard patterns from Context7 research
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createcashFlowService = exports.CashFlowService = void 0;
var client_1 = require("@/lib/supabase/client");
var CashFlowService = /** @class */ (function () {
    function CashFlowService() {
        this.supabase = (0, client_1.createClient)();
    }
    // Cash Flow Entries Operations
    CashFlowService.prototype.getCashFlowEntries = function (clinicId_1, filters_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, filters, page, limit) {
            var query, offset, _a, data, error, count, error_1;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('cash_flow_entries')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.dateFrom) {
                            query = query.gte('created_at', filters.dateFrom);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dateTo) {
                            query = query.lte('created_at', filters.dateTo);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.registerId) {
                            query = query.eq('register_id', filters.registerId);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.transactionType) {
                            query = query.eq('transaction_type', filters.transactionType);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.category) {
                            query = query.eq('category', filters.category);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.paymentMethod) {
                            query = query.eq('payment_method', filters.paymentMethod);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.isReconciled) !== undefined) {
                            query = query.eq('is_reconciled', filters.isReconciled);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.search) {
                            query = query.or("description.ilike.%".concat(filters.search, "%,reference_number.ilike.%").concat(filters.search, "%"));
                        }
                        offset = (page - 1) * limit;
                        query = query.range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                data: data,
                                count: count || 0,
                                totalPages: Math.ceil((count || 0) / limit),
                                currentPage: page
                            }];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error fetching cash flow entries:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.createCashFlowEntry = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .insert(entry)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!entry.register_id) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateRegisterBalance(entry.register_id, entry.amount, entry.transaction_type)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, data];
                    case 4:
                        error_2 = _b.sent();
                        console.error('Error creating cash flow entry:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.updateCashFlowEntry = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                .eq('id', id)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error updating cash flow entry:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.deleteCashFlowEntry = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error deleting cash flow entry:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Cash Register Operations
    CashFlowService.prototype.getCashRegisters = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_registers')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .eq('is_active', true)
                                .order('register_name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error fetching cash registers:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.createCashRegister = function (register) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_registers')
                                .insert(register)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error creating cash register:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.updateRegisterBalance = function (registerId, amount, transactionType) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, register, fetchError, currentBalance, newBalance, _b, data, error, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('cash_registers')
                                .select('current_balance')
                                .eq('id', registerId)
                                .single()];
                    case 1:
                        _a = _c.sent(), register = _a.data, fetchError = _a.error;
                        if (fetchError)
                            throw fetchError;
                        currentBalance = register.current_balance || 0;
                        newBalance = currentBalance;
                        // Calculate new balance based on transaction type
                        if (['receipt', 'opening_balance'].includes(transactionType)) {
                            newBalance = currentBalance + amount;
                        }
                        else if (['payment', 'closing_balance'].includes(transactionType)) {
                            newBalance = currentBalance - amount;
                        }
                        return [4 /*yield*/, this.supabase
                                .from('cash_registers')
                                .update({
                                current_balance: newBalance,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', registerId)
                                .select()
                                .single()];
                    case 2:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 3:
                        error_7 = _c.sent();
                        console.error('Error updating register balance:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }; // Analytics and Calculations
    CashFlowService.prototype.getCashFlowAnalytics = function (clinicId, periodStart, periodEnd, registerId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, entries, error, analytics, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('cash_flow_entries')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .gte('created_at', periodStart)
                            .lte('created_at', periodEnd);
                        if (registerId) {
                            query = query.eq('register_id', registerId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), entries = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        analytics = this.calculateAnalytics(entries, periodStart, periodEnd);
                        return [2 /*return*/, analytics];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error fetching cash flow analytics:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CashFlowService.prototype.calculateAnalytics = function (entries, periodStart, periodEnd) {
        var incomeTypes = ['receipt', 'opening_balance'];
        var expenseTypes = ['payment', 'closing_balance'];
        var totalIncome = entries
            .filter(function (e) { return incomeTypes.includes(e.transaction_type); })
            .reduce(function (sum, e) { return sum + e.amount; }, 0);
        var totalExpenses = entries
            .filter(function (e) { return expenseTypes.includes(e.transaction_type); })
            .reduce(function (sum, e) { return sum + e.amount; }, 0);
        return {
            totalIncome: totalIncome,
            totalExpenses: totalExpenses,
            netCashFlow: totalIncome - totalExpenses,
            periodStart: periodStart,
            periodEnd: periodEnd,
            byCategory: this.groupByCategory(entries),
            byPaymentMethod: this.groupByPaymentMethod(entries),
            byDay: this.groupByDay(entries, periodStart, periodEnd),
            registers: [] // Will be populated by separate query
        };
    };
    CashFlowService.prototype.groupByCategory = function (entries) {
        var total = entries.reduce(function (sum, e) { return sum + e.amount; }, 0);
        var grouped = entries.reduce(function (acc, entry) {
            acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
            return acc;
        }, {});
        return Object.entries(grouped).map(function (_a) {
            var category = _a[0], amount = _a[1];
            return ({
                category: category,
                amount: amount,
                percentage: total > 0 ? (amount / total) * 100 : 0
            });
        });
    };
    CashFlowService.prototype.groupByPaymentMethod = function (entries) {
        var grouped = entries.reduce(function (acc, entry) {
            var key = entry.payment_method;
            if (!acc[key]) {
                acc[key] = { amount: 0, count: 0 };
            }
            acc[key].amount += entry.amount;
            acc[key].count += 1;
            return acc;
        }, {});
        return Object.entries(grouped).map(function (_a) {
            var method = _a[0], data = _a[1];
            return ({
                method: method,
                amount: data.amount,
                count: data.count
            });
        });
    };
    CashFlowService.prototype.groupByDay = function (entries, periodStart, periodEnd) {
        var start = new Date(periodStart);
        var end = new Date(periodEnd);
        var days = [];
        var _loop_1 = function (d) {
            var dateStr = d.toISOString().split('T')[0];
            var dayEntries = entries.filter(function (e) { return e.created_at.startsWith(dateStr); });
            var income = dayEntries
                .filter(function (e) { return ['receipt', 'opening_balance'].includes(e.transaction_type); })
                .reduce(function (sum, e) { return sum + e.amount; }, 0);
            var expenses = dayEntries
                .filter(function (e) { return ['payment', 'closing_balance'].includes(e.transaction_type); })
                .reduce(function (sum, e) { return sum + e.amount; }, 0);
            days.push({
                date: dateStr,
                income: income,
                expenses: expenses,
                net: income - expenses
            });
        };
        for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            _loop_1(d);
        }
        return days;
    };
    // Reconciliation Operations
    CashFlowService.prototype.getReconciliations = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('payment_reconciliations')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .order('reconciliation_date', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error fetching reconciliations:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CashFlowService;
}());
exports.CashFlowService = CashFlowService;
var createcashFlowService = function () { return new CashFlowService(); };
exports.createcashFlowService = createcashFlowService;
