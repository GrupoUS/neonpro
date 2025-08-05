"use strict";
// lib/services/expense-categories.ts
// Service layer for expense categories management
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
exports.ExpenseCategoryService = void 0;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
var ExpenseCategoryService = /** @class */ (function () {
    function ExpenseCategoryService() {
    }
    /**
     * Get all expense categories
     */
    ExpenseCategoryService.getExpenseCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, categories, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('expense_categories')
                                .select('*')
                                .eq('is_active', true)
                                .order('category_name')];
                    case 1:
                        _a = _b.sent(), categories = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching expense categories:', error);
                            throw new Error("Failed to fetch expense categories: ".concat(error.message));
                        }
                        return [2 /*return*/, categories || []];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error in getExpenseCategories:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get expense category by ID
     */
    ExpenseCategoryService.getExpenseCategoryById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('expense_categories')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 1:
                        _a = _b.sent(), category = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116') {
                                return [2 /*return*/, null]; // Category not found
                            }
                            console.error('Error fetching expense category:', error);
                            throw new Error("Failed to fetch expense category: ".concat(error.message));
                        }
                        return [2 /*return*/, category];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error in getExpenseCategoryById:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get active categories for dropdown selection
     */
    ExpenseCategoryService.getActiveCategoriesForSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, categories, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('expense_categories')
                                .select('id, category_code, category_name')
                                .eq('is_active', true)
                                .order('category_name')];
                    case 1:
                        _a = _b.sent(), categories = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching active expense categories:', error);
                            throw new Error("Failed to fetch active expense categories: ".concat(error.message));
                        }
                        return [2 /*return*/, categories.map(function (category) { return ({
                                id: category.id,
                                label: "".concat(category.category_code, " - ").concat(category.category_name),
                                value: category.id
                            }); })];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error in getActiveCategoriesForSelection:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create new expense category
     */
    ExpenseCategoryService.createExpenseCategory = function (categoryData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, error, _b, _c, _d, error_4;
            var _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 3, , 4]);
                        _c = (_b = supabase
                            .from('expense_categories'))
                            .insert;
                        _d = [__assign({}, categoryData)];
                        _e = {};
                        return [4 /*yield*/, supabase.auth.getUser()];
                    case 1: return [4 /*yield*/, _c.apply(_b, [[__assign.apply(void 0, _d.concat([(_e.created_by = (_f = (_g.sent()).data.user) === null || _f === void 0 ? void 0 : _f.id, _e)]))]])
                            .select()
                            .single()];
                    case 2:
                        _a = _g.sent(), category = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error creating expense category:', error);
                            throw new Error("Failed to create expense category: ".concat(error.message));
                        }
                        return [2 /*return*/, category];
                    case 3:
                        error_4 = _g.sent();
                        console.error('Error in createExpenseCategory:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update existing expense category
     */
    ExpenseCategoryService.updateExpenseCategory = function (id, categoryData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, error, _b, _c, _d, error_5;
            var _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 3, , 4]);
                        _c = (_b = supabase
                            .from('expense_categories'))
                            .update;
                        _d = [__assign({}, categoryData)];
                        _e = {};
                        return [4 /*yield*/, supabase.auth.getUser()];
                    case 1: return [4 /*yield*/, _c.apply(_b, [__assign.apply(void 0, _d.concat([(_e.updated_by = (_f = (_g.sent()).data.user) === null || _f === void 0 ? void 0 : _f.id, _e.updated_at = new Date().toISOString(), _e)]))])
                            .eq('id', id)
                            .select()
                            .single()];
                    case 2:
                        _a = _g.sent(), category = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error updating expense category:', error);
                            throw new Error("Failed to update expense category: ".concat(error.message));
                        }
                        return [2 /*return*/, category];
                    case 3:
                        error_5 = _g.sent();
                        console.error('Error in updateExpenseCategory:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if category code is unique
     */
    ExpenseCategoryService.isCategoryCodeUnique = function (categoryCode, excludeId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('expense_categories')
                            .select('id')
                            .eq('category_code', categoryCode);
                        if (excludeId) {
                            query = query.neq('id', excludeId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error checking category code uniqueness:', error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, data.length === 0];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error in isCategoryCodeUnique:', error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ExpenseCategoryService;
}());
exports.ExpenseCategoryService = ExpenseCategoryService;
