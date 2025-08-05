"use client";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBilling = useBilling;
var client_1 = require("@/lib/supabase/client");
var react_1 = require("react");
var sonner_1 = require("sonner");
function useBilling() {
    var _this = this;
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), services = _b[0], setServices = _b[1];
    var _c = (0, react_1.useState)([]), invoices = _c[0], setInvoices = _c[1];
    var _d = (0, react_1.useState)([]), payments = _d[0], setPayments = _d[1];
    var _e = (0, react_1.useState)(null), financialSummary = _e[0], setFinancialSummary = _e[1];
    var _f = (0, react_1.useState)(null), settings = _f[0], setSettings = _f[1];
    var supabase = yield (0, client_1.createClient)();
    // =====================================================
    // SERVICES MANAGEMENT
    // =====================================================
    var fetchServices = (0, react_1.useCallback)(function (filters) { return __awaiter(_this, void 0, void 0, function () {
        var query, sortBy, sortOrder, _a, data, error, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    query = supabase.from("services").select("\n          *,\n          pricing_plans(*)\n        ");
                    // Apply filters
                    if ((_b = filters === null || filters === void 0 ? void 0 : filters.type) === null || _b === void 0 ? void 0 : _b.length) {
                        query = query.in("type", filters.type);
                    }
                    if ((_c = filters === null || filters === void 0 ? void 0 : filters.category) === null || _c === void 0 ? void 0 : _c.length) {
                        query = query.in("category", filters.category);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined) {
                        query = query.eq("is_active", filters.is_active);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.price_min) !== undefined) {
                        query = query.gte("base_price", filters.price_min);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.price_max) !== undefined) {
                        query = query.lte("base_price", filters.price_max);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.search) {
                        query = query.or("name.ilike.%".concat(filters.search, "%,description.ilike.%").concat(filters.search, "%"));
                    }
                    sortBy = (filters === null || filters === void 0 ? void 0 : filters.sort_by) || "name";
                    sortOrder = (filters === null || filters === void 0 ? void 0 : filters.sort_order) || "asc";
                    query = query.order(sortBy, { ascending: sortOrder === "asc" });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _d.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error fetching services:", error);
                        sonner_1.toast.error("Erro ao carregar serviços");
                        return [2 /*return*/];
                    }
                    setServices(data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _d.sent();
                    console.error("Error in fetchServices:", error_1);
                    sonner_1.toast.error("Erro inesperado ao carregar serviços");
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    var createService = (0, react_1.useCallback)(function (serviceData) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from("services")
                            .insert([serviceData])
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error creating service:", error);
                        sonner_1.toast.error("Erro ao criar serviço");
                        return [2 /*return*/, null];
                    }
                    sonner_1.toast.success("Serviço criado com sucesso");
                    return [4 /*yield*/, fetchServices()];
                case 2:
                    _b.sent(); // Refresh list
                    return [2 /*return*/, data];
                case 3:
                    error_2 = _b.sent();
                    console.error("Error in createService:", error_2);
                    sonner_1.toast.error("Erro inesperado ao criar serviço");
                    return [2 /*return*/, null];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchServices]);
    var updateService = (0, react_1.useCallback)(function (id, updates) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from("services")
                            .update(updates)
                            .eq("id", id)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error updating service:", error);
                        sonner_1.toast.error("Erro ao atualizar serviço");
                        return [2 /*return*/, null];
                    }
                    sonner_1.toast.success("Serviço atualizado com sucesso");
                    return [4 /*yield*/, fetchServices()];
                case 2:
                    _b.sent(); // Refresh list
                    return [2 /*return*/, data];
                case 3:
                    error_3 = _b.sent();
                    console.error("Error in updateService:", error_3);
                    sonner_1.toast.error("Erro inesperado ao atualizar serviço");
                    return [2 /*return*/, null];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchServices]);
    var deleteService = (0, react_1.useCallback)(function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, supabase.from("services").delete().eq("id", id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error deleting service:", error);
                        sonner_1.toast.error("Erro ao excluir serviço");
                        return [2 /*return*/, false];
                    }
                    sonner_1.toast.success("Serviço excluído com sucesso");
                    return [4 /*yield*/, fetchServices()];
                case 2:
                    _a.sent(); // Refresh list
                    return [2 /*return*/, true];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error in deleteService:", error_4);
                    sonner_1.toast.error("Erro inesperado ao excluir serviço");
                    return [2 /*return*/, false];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchServices]);
    // =====================================================
    // INVOICES MANAGEMENT
    // =====================================================
    var fetchInvoices = (0, react_1.useCallback)(function (filters) { return __awaiter(_this, void 0, void 0, function () {
        var query, page, limit, offset, sortBy, sortOrder, _a, data, error, error_5;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    query = supabase.from("invoices").select("\n          *,\n          patient:profiles!invoices_patient_id_fkey(id, name, email, phone),\n          appointment:appointments(id, scheduled_for),\n          items:invoice_items(*),\n          payments(*)\n        ");
                    // Apply filters
                    if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                        query = query.in("status", filters.status);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.patient_id) {
                        query = query.eq("patient_id", filters.patient_id);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.date_from) {
                        query = query.gte("issue_date", filters.date_from);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.date_to) {
                        query = query.lte("issue_date", filters.date_to);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.amount_min) !== undefined) {
                        query = query.gte("total_amount", filters.amount_min);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.amount_max) !== undefined) {
                        query = query.lte("total_amount", filters.amount_max);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.search) {
                        query = query.or("invoice_number.ilike.%".concat(filters.search, "%,notes.ilike.%").concat(filters.search, "%"));
                    }
                    page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                    limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                    offset = (page - 1) * limit;
                    query = query.range(offset, offset + limit - 1);
                    sortBy = (filters === null || filters === void 0 ? void 0 : filters.sort_by) || "issue_date";
                    sortOrder = (filters === null || filters === void 0 ? void 0 : filters.sort_order) || "desc";
                    query = query.order(sortBy, { ascending: sortOrder === "asc" });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error fetching invoices:", error);
                        sonner_1.toast.error("Erro ao carregar faturas");
                        return [2 /*return*/];
                    }
                    setInvoices(data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_5 = _c.sent();
                    console.error("Error in fetchInvoices:", error_5);
                    sonner_1.toast.error("Erro inesperado ao carregar faturas");
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    var createInvoice = (0, react_1.useCallback)(function (invoiceData) { return __awaiter(_this, void 0, void 0, function () {
        var calculations, _a, invoice_1, invoiceError, itemsWithInvoiceId, itemsError, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, 7, 8]);
                    setLoading(true);
                    calculations = calculateInvoiceTotals(invoiceData.items);
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .insert([
                            {
                                patient_id: invoiceData.patient_id,
                                appointment_id: invoiceData.appointment_id,
                                due_date: invoiceData.due_date,
                                notes: invoiceData.notes,
                                payment_terms: invoiceData.payment_terms,
                                subtotal: calculations.subtotal,
                                discount_amount: calculations.total_discount,
                                tax_amount: calculations.tax_amount,
                                total_amount: calculations.total_amount,
                            },
                        ])
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), invoice_1 = _a.data, invoiceError = _a.error;
                    if (invoiceError) {
                        console.error("Error creating invoice:", invoiceError);
                        sonner_1.toast.error("Erro ao criar fatura");
                        return [2 /*return*/, null];
                    }
                    itemsWithInvoiceId = invoiceData.items.map(function (item) { return (__assign(__assign({}, item), { invoice_id: invoice_1.id, subtotal: item.quantity * item.unit_price, total: item.quantity * item.unit_price - (item.discount_value || 0) })); });
                    return [4 /*yield*/, supabase
                            .from("invoice_items")
                            .insert(itemsWithInvoiceId)];
                case 2:
                    itemsError = (_b.sent()).error;
                    if (!itemsError) return [3 /*break*/, 4];
                    console.error("Error creating invoice items:", itemsError);
                    // Rollback invoice creation
                    return [4 /*yield*/, supabase.from("invoices").delete().eq("id", invoice_1.id)];
                case 3:
                    // Rollback invoice creation
                    _b.sent();
                    sonner_1.toast.error("Erro ao criar itens da fatura");
                    return [2 /*return*/, null];
                case 4:
                    sonner_1.toast.success("Fatura criada com sucesso");
                    return [4 /*yield*/, fetchInvoices()];
                case 5:
                    _b.sent(); // Refresh list
                    return [2 /*return*/, invoice_1];
                case 6:
                    error_6 = _b.sent();
                    console.error("Error in createInvoice:", error_6);
                    sonner_1.toast.error("Erro inesperado ao criar fatura");
                    return [2 /*return*/, null];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchInvoices]);
    var updateInvoice = (0, react_1.useCallback)(function (id, updates) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .update(updates)
                            .eq("id", id)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error updating invoice:", error);
                        sonner_1.toast.error("Erro ao atualizar fatura");
                        return [2 /*return*/, null];
                    }
                    sonner_1.toast.success("Fatura atualizada com sucesso");
                    return [4 /*yield*/, fetchInvoices()];
                case 2:
                    _b.sent(); // Refresh list
                    return [2 /*return*/, data];
                case 3:
                    error_7 = _b.sent();
                    console.error("Error in updateInvoice:", error_7);
                    sonner_1.toast.error("Erro inesperado ao atualizar fatura");
                    return [2 /*return*/, null];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchInvoices]);
    // =====================================================
    // PAYMENTS MANAGEMENT
    // =====================================================
    var fetchPayments = (0, react_1.useCallback)(function (filters) { return __awaiter(_this, void 0, void 0, function () {
        var query, page, limit, offset, sortBy, sortOrder, _a, data, error, error_8;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    query = supabase.from("payments").select("\n          *,\n          invoice:invoices(\n            *,\n            patient:profiles!invoices_patient_id_fkey(id, name, email)\n          ),\n          installment_payments:installments(*)\n        ");
                    // Apply filters
                    if ((_b = filters === null || filters === void 0 ? void 0 : filters.status) === null || _b === void 0 ? void 0 : _b.length) {
                        query = query.in("status", filters.status);
                    }
                    if ((_c = filters === null || filters === void 0 ? void 0 : filters.method) === null || _c === void 0 ? void 0 : _c.length) {
                        query = query.in("method", filters.method);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.date_from) {
                        query = query.gte("payment_date", filters.date_from);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.date_to) {
                        query = query.lte("payment_date", filters.date_to);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.amount_min) !== undefined) {
                        query = query.gte("amount", filters.amount_min);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.amount_max) !== undefined) {
                        query = query.lte("amount", filters.amount_max);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.search) {
                        query = query.or("payment_number.ilike.%".concat(filters.search, "%,notes.ilike.%").concat(filters.search, "%"));
                    }
                    page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
                    limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 20;
                    offset = (page - 1) * limit;
                    query = query.range(offset, offset + limit - 1);
                    sortBy = (filters === null || filters === void 0 ? void 0 : filters.sort_by) || "payment_date";
                    sortOrder = (filters === null || filters === void 0 ? void 0 : filters.sort_order) || "desc";
                    query = query.order(sortBy, { ascending: sortOrder === "asc" });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _d.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error fetching payments:", error);
                        sonner_1.toast.error("Erro ao carregar pagamentos");
                        return [2 /*return*/];
                    }
                    setPayments(data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_8 = _d.sent();
                    console.error("Error in fetchPayments:", error_8);
                    sonner_1.toast.error("Erro inesperado ao carregar pagamentos");
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    var createPayment = (0, react_1.useCallback)(function (paymentData) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .insert([paymentData])
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error creating payment:", error);
                        sonner_1.toast.error("Erro ao criar pagamento");
                        return [2 /*return*/, null];
                    }
                    sonner_1.toast.success("Pagamento criado com sucesso");
                    return [4 /*yield*/, fetchPayments()];
                case 2:
                    _b.sent(); // Refresh list
                    return [2 /*return*/, data];
                case 3:
                    error_9 = _b.sent();
                    console.error("Error in createPayment:", error_9);
                    sonner_1.toast.error("Erro inesperado ao criar pagamento");
                    return [2 /*return*/, null];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [supabase, fetchPayments]);
    // =====================================================
    // FINANCIAL ANALYTICS
    // =====================================================
    var fetchFinancialSummary = (0, react_1.useCallback)(function (startDate, endDate) { return __awaiter(_this, void 0, void 0, function () {
        var now, _a, invoicesData, invoicesError, summary_1, daysDiff, monthsDiff, error_10;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    // Default to current month if no dates provided
                    if (!startDate) {
                        now = new Date();
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                            .toISOString()
                            .split("T")[0];
                    }
                    if (!endDate) {
                        endDate = new Date().toISOString().split("T")[0];
                    }
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .select("status, total_amount, paid_amount")
                            .gte("issue_date", startDate)
                            .lte("issue_date", endDate)];
                case 1:
                    _a = _b.sent(), invoicesData = _a.data, invoicesError = _a.error;
                    if (invoicesError) {
                        console.error("Error fetching invoices summary:", invoicesError);
                        return [2 /*return*/];
                    }
                    summary_1 = {
                        total_revenue: 0,
                        pending_invoices: 0,
                        overdue_invoices: 0,
                        paid_invoices: 0,
                        total_outstanding: 0,
                        monthly_revenue: 0,
                        daily_revenue: 0,
                        period: { start_date: startDate, end_date: endDate },
                    };
                    invoicesData === null || invoicesData === void 0 ? void 0 : invoicesData.forEach(function (invoice) {
                        summary_1.total_revenue += invoice.paid_amount || 0;
                        switch (invoice.status) {
                            case "paid":
                                summary_1.paid_invoices += 1;
                                break;
                            case "pending":
                                summary_1.pending_invoices += 1;
                                summary_1.total_outstanding +=
                                    invoice.total_amount - (invoice.paid_amount || 0);
                                break;
                            case "overdue":
                                summary_1.overdue_invoices += 1;
                                summary_1.total_outstanding +=
                                    invoice.total_amount - (invoice.paid_amount || 0);
                                break;
                        }
                    });
                    daysDiff = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) /
                        (1000 * 60 * 60 * 24)));
                    monthsDiff = Math.max(1, daysDiff / 30);
                    summary_1.daily_revenue = summary_1.total_revenue / daysDiff;
                    summary_1.monthly_revenue = summary_1.total_revenue / monthsDiff;
                    setFinancialSummary(summary_1);
                    return [3 /*break*/, 4];
                case 2:
                    error_10 = _b.sent();
                    console.error("Error in fetchFinancialSummary:", error_10);
                    sonner_1.toast.error("Erro ao carregar resumo financeiro");
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    var fetchRevenueByPeriod = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (period, startDate, endDate) {
            var now, _a, data, error, grouped_1, error_11;
            if (period === void 0) { period = "monthly"; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // Default to last 12 periods if no dates provided
                        if (!startDate) {
                            now = new Date();
                            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
                                .toISOString()
                                .split("T")[0];
                        }
                        if (!endDate) {
                            endDate = new Date().toISOString().split("T")[0];
                        }
                        return [4 /*yield*/, supabase
                                .from("payments")
                                .select("amount, payment_date")
                                .eq("status", "completed")
                                .gte("payment_date", startDate)
                                .lte("payment_date", endDate)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error("Error fetching revenue by period:", error);
                            return [2 /*return*/, []];
                        }
                        grouped_1 = {};
                        data === null || data === void 0 ? void 0 : data.forEach(function (payment) {
                            var date = new Date(payment.payment_date);
                            var periodKey = "";
                            switch (period) {
                                case "daily":
                                    periodKey = date.toISOString().split("T")[0];
                                    break;
                                case "weekly":
                                    var weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
                                    periodKey = weekStart.toISOString().split("T")[0];
                                    break;
                                case "monthly":
                                    periodKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, "0"));
                                    break;
                            }
                            if (!grouped_1[periodKey]) {
                                grouped_1[periodKey] = { revenue: 0, count: 0 };
                            }
                            grouped_1[periodKey].revenue += payment.amount;
                            grouped_1[periodKey].count += 1;
                        });
                        return [2 /*return*/, Object.entries(grouped_1)
                                .map(function (_a) {
                                var period = _a[0], data = _a[1];
                                return ({
                                    period: period,
                                    revenue: data.revenue,
                                    invoices_count: data.count,
                                    payments_count: data.count,
                                });
                            })
                                .sort(function (a, b) { return a.period.localeCompare(b.period); })];
                    case 2:
                        error_11 = _b.sent();
                        console.error("Error in fetchRevenueByPeriod:", error_11);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }, [supabase]);
    // =====================================================
    // SETTINGS MANAGEMENT
    // =====================================================
    var fetchFinancialSettings = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from("financial_settings")
                            .select("*")
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error fetching financial settings:", error);
                        return [2 /*return*/];
                    }
                    setSettings(data);
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _b.sent();
                    console.error("Error in fetchFinancialSettings:", error_12);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [supabase]);
    var updateFinancialSettings = (0, react_1.useCallback)(function (updates) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_13;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, supabase
                            .from("financial_settings")
                            .update(updates)
                            .eq("id", settings === null || settings === void 0 ? void 0 : settings.id)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error updating financial settings:", error);
                        sonner_1.toast.error("Erro ao atualizar configurações");
                        return [2 /*return*/, false];
                    }
                    setSettings(data);
                    sonner_1.toast.success("Configurações atualizadas com sucesso");
                    return [2 /*return*/, true];
                case 2:
                    error_13 = _b.sent();
                    console.error("Error in updateFinancialSettings:", error_13);
                    sonner_1.toast.error("Erro inesperado ao atualizar configurações");
                    return [2 /*return*/, false];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [supabase, settings === null || settings === void 0 ? void 0 : settings.id]);
    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================
    var calculateInvoiceTotals = (0, react_1.useCallback)(function (items) {
        var subtotal = 0;
        var totalDiscount = 0;
        items.forEach(function (item) {
            var itemSubtotal = item.quantity * item.unit_price;
            subtotal += itemSubtotal;
            totalDiscount += item.discount_value || 0;
        });
        var taxAmount = (subtotal - totalDiscount) * (((settings === null || settings === void 0 ? void 0 : settings.tax_rate) || 0) / 100);
        var totalAmount = subtotal - totalDiscount + taxAmount;
        return {
            subtotal: subtotal,
            total_discount: totalDiscount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
        };
    }, [settings === null || settings === void 0 ? void 0 : settings.tax_rate]);
    var calculatePaymentBalance = (0, react_1.useCallback)(function (invoice) {
        var totalPaid = invoice.paid_amount || 0;
        var remainingBalance = invoice.total_amount - totalPaid;
        var isFullyPaid = remainingBalance <= 0.01; // Consider small amounts as paid
        return {
            total_paid: totalPaid,
            remaining_balance: remainingBalance,
            is_fully_paid: isFullyPaid,
        };
    }, []);
    // Initialize data on mount
    (0, react_1.useEffect)(function () {
        fetchServices();
        fetchFinancialSettings();
        fetchFinancialSummary();
    }, [fetchServices, fetchFinancialSettings, fetchFinancialSummary]);
    return {
        // State
        loading: loading,
        services: services,
        invoices: invoices,
        payments: payments,
        financialSummary: financialSummary,
        settings: settings,
        // Services
        fetchServices: fetchServices,
        createService: createService,
        updateService: updateService,
        deleteService: deleteService,
        // Invoices
        fetchInvoices: fetchInvoices,
        createInvoice: createInvoice,
        updateInvoice: updateInvoice,
        // Payments
        fetchPayments: fetchPayments,
        createPayment: createPayment,
        // Analytics
        fetchFinancialSummary: fetchFinancialSummary,
        fetchRevenueByPeriod: fetchRevenueByPeriod,
        // Settings
        fetchFinancialSettings: fetchFinancialSettings,
        updateFinancialSettings: updateFinancialSettings,
        // Utilities
        calculateInvoiceTotals: calculateInvoiceTotals,
        calculatePaymentBalance: calculatePaymentBalance,
    };
}
