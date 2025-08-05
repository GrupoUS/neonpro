"use strict";
// =====================================================================================
// Financial Reporting Engine - Core System
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
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
exports.FinancialReportingEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var financial_reporting_1 = require("@/lib/types/financial-reporting");
var financial_reporting_2 = require("@/lib/validations/financial-reporting");
var FinancialReportingEngine = /** @class */ (function () {
    function FinancialReportingEngine() {
        this.supabase = (0, client_1.createClient)();
    }
    // =====================================================================================
    // CORE REPORT GENERATION METHODS
    // =====================================================================================
    /**
     * Generate Profit & Loss Statement with Brazilian accounting standards
     */
    FinancialReportingEngine.prototype.generateProfitLossStatement = function (clinicId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var period_start, period_end, _a, revenueData, revenueError, _b, expenseData, expenseError, consultationRevenue, treatmentRevenue, productRevenue, otherRevenue, totalRevenue, staffCosts, rentUtilities, marketingExpenses, administrativeExpenses, directCosts, materialsCosts, equipmentCosts, otherExpenses, totalCostOfServices, grossProfit, grossProfitMargin, totalOperatingExpenses, operatingProfit, operatingProfitMargin, taxExpenses, profitBeforeTax, netProfit, netProfitMargin, profitLossStatement, validation;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        period_start = parameters.period_start, period_end = parameters.period_end;
                        return [4 /*yield*/, this.supabase
                                .from('invoices')
                                .select("\n        total_amount,\n        tax_amount,\n        status,\n        invoice_items (\n          service_id,\n          total_amount,\n          description\n        )\n      ")
                                .eq('clinic_id', clinicId)
                                .gte('issue_date', period_start)
                                .lte('issue_date', period_end)
                                .eq('status', 'paid')];
                    case 1:
                        _a = _c.sent(), revenueData = _a.data, revenueError = _a.error;
                        if (revenueError)
                            throw new Error("Revenue data fetch failed: ".concat(revenueError.message));
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('transaction_date', period_start)
                                .lte('transaction_date', period_end)
                                .eq('transaction_type', 'expense')];
                    case 2:
                        _b = _c.sent(), expenseData = _b.data, expenseError = _b.error;
                        if (expenseError)
                            throw new Error("Expense data fetch failed: ".concat(expenseError.message));
                        consultationRevenue = (revenueData === null || revenueData === void 0 ? void 0 : revenueData.filter(function (inv) { return inv.invoice_items.some(function (item) { var _a; return (_a = item.description) === null || _a === void 0 ? void 0 : _a.includes('consulta'); }); }).reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        treatmentRevenue = (revenueData === null || revenueData === void 0 ? void 0 : revenueData.filter(function (inv) { return inv.invoice_items.some(function (item) { var _a; return (_a = item.description) === null || _a === void 0 ? void 0 : _a.includes('tratamento'); }); }).reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        productRevenue = (revenueData === null || revenueData === void 0 ? void 0 : revenueData.filter(function (inv) { return inv.invoice_items.some(function (item) { var _a; return (_a = item.description) === null || _a === void 0 ? void 0 : _a.includes('produto'); }); }).reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        otherRevenue = (revenueData === null || revenueData === void 0 ? void 0 : revenueData.filter(function (inv) { return !inv.invoice_items.some(function (item) {
                            var _a, _b, _c;
                            return ((_a = item.description) === null || _a === void 0 ? void 0 : _a.includes('consulta')) ||
                                ((_b = item.description) === null || _b === void 0 ? void 0 : _b.includes('tratamento')) ||
                                ((_c = item.description) === null || _c === void 0 ? void 0 : _c.includes('produto'));
                        }); }).reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        totalRevenue = consultationRevenue + treatmentRevenue + productRevenue + otherRevenue;
                        staffCosts = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'staff' || exp.category === 'payroll'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        rentUtilities = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'rent' || exp.category === 'utilities'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        marketingExpenses = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'marketing'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        administrativeExpenses = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'administrative'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        directCosts = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'materials' || exp.category === 'supplies'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        materialsCosts = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'materials'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        equipmentCosts = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return exp.category === 'equipment'; }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        otherExpenses = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return !['staff', 'payroll', 'rent', 'utilities', 'marketing', 'administrative', 'materials', 'supplies', 'equipment'].includes(exp.category); }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        totalCostOfServices = directCosts + materialsCosts + equipmentCosts;
                        grossProfit = totalRevenue - totalCostOfServices;
                        grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                        totalOperatingExpenses = staffCosts + rentUtilities + marketingExpenses + administrativeExpenses + otherExpenses;
                        operatingProfit = grossProfit - totalOperatingExpenses;
                        operatingProfitMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;
                        taxExpenses = totalRevenue * (financial_reporting_1.FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.ISS +
                            financial_reporting_1.FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.PIS +
                            financial_reporting_1.FINANCIAL_CONSTANTS.BRAZILIAN_TAX_RATES.COFINS);
                        profitBeforeTax = operatingProfit;
                        netProfit = profitBeforeTax - taxExpenses;
                        netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
                        profitLossStatement = {
                            period_start: period_start,
                            period_end: period_end,
                            clinic_id: clinicId,
                            revenue: {
                                consultation_revenue: consultationRevenue,
                                treatment_revenue: treatmentRevenue,
                                product_revenue: productRevenue,
                                other_revenue: otherRevenue,
                                total_revenue: totalRevenue
                            },
                            cost_of_services: {
                                direct_costs: directCosts,
                                materials_costs: materialsCosts,
                                equipment_costs: equipmentCosts,
                                total_cost_of_services: totalCostOfServices
                            },
                            gross_profit: grossProfit,
                            gross_profit_margin: grossProfitMargin,
                            operating_expenses: {
                                staff_costs: staffCosts,
                                rent_utilities: rentUtilities,
                                marketing_expenses: marketingExpenses,
                                administrative_expenses: administrativeExpenses,
                                other_expenses: otherExpenses,
                                total_operating_expenses: totalOperatingExpenses
                            },
                            operating_profit: operatingProfit,
                            operating_profit_margin: operatingProfitMargin,
                            other_income_expenses: {
                                financial_income: 0,
                                financial_expenses: 0,
                                other_income: 0,
                                other_expenses: 0,
                                total_other: 0
                            },
                            profit_before_tax: profitBeforeTax,
                            tax_expenses: taxExpenses,
                            net_profit: netProfit,
                            net_profit_margin: netProfitMargin
                        };
                        validation = financial_reporting_2.profitLossStatementSchema.safeParse(profitLossStatement);
                        if (!validation.success) {
                            throw new Error("P&L validation failed: ".concat(validation.error.message));
                        }
                        return [2 /*return*/, profitLossStatement];
                }
            });
        });
    };
    /**
     * Generate Balance Sheet with asset and liability tracking
     */
    FinancialReportingEngine.prototype.generateBalanceSheet = function (clinicId, asOfDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cashData, cashError, _b, receivableData, receivableError, _c, payableData, payableError, cashAndEquivalents, accountsReceivable, inventory, prepaidExpenses, otherCurrentAssets, totalCurrentAssets, equipment, accumulatedDepreciation, netEquipment, softwareLicenses, otherNonCurrentAssets, totalNonCurrentAssets, totalAssets, accountsPayable, accruedExpenses, shortTermDebt, otherCurrentLiabilities, totalCurrentLiabilities, longTermDebt, otherNonCurrentLiabilities, totalNonCurrentLiabilities, totalLiabilities, paidInCapital, retainedEarnings, currentPeriodEarnings, totalEquity, balanceSheet, validation;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('cash_registers')
                            .select('current_balance')
                            .eq('clinic_id', clinicId)
                            .single()];
                    case 1:
                        _a = _d.sent(), cashData = _a.data, cashError = _a.error;
                        if (cashError)
                            throw new Error("Cash data fetch failed: ".concat(cashError.message));
                        return [4 /*yield*/, this.supabase
                                .from('invoices')
                                .select('total_amount')
                                .eq('clinic_id', clinicId)
                                .in('status', ['issued', 'sent', 'overdue'])
                                .lte('issue_date', asOfDate)];
                    case 2:
                        _b = _d.sent(), receivableData = _b.data, receivableError = _b.error;
                        if (receivableError)
                            throw new Error("Receivable data fetch failed: ".concat(receivableError.message));
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('amount')
                                .eq('clinic_id', clinicId)
                                .eq('transaction_type', 'expense')
                                .eq('payment_status', 'pending')
                                .lte('transaction_date', asOfDate)];
                    case 3:
                        _c = _d.sent(), payableData = _c.data, payableError = _c.error;
                        if (payableError)
                            throw new Error("Payable data fetch failed: ".concat(payableError.message));
                        cashAndEquivalents = (cashData === null || cashData === void 0 ? void 0 : cashData.current_balance) || 0;
                        accountsReceivable = (receivableData === null || receivableData === void 0 ? void 0 : receivableData.reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        inventory = 0;
                        prepaidExpenses = 0;
                        otherCurrentAssets = 0;
                        totalCurrentAssets = cashAndEquivalents + accountsReceivable + inventory + prepaidExpenses + otherCurrentAssets;
                        equipment = 0;
                        accumulatedDepreciation = 0;
                        netEquipment = equipment - accumulatedDepreciation;
                        softwareLicenses = 0;
                        otherNonCurrentAssets = 0;
                        totalNonCurrentAssets = netEquipment + softwareLicenses + otherNonCurrentAssets;
                        totalAssets = totalCurrentAssets + totalNonCurrentAssets;
                        accountsPayable = (payableData === null || payableData === void 0 ? void 0 : payableData.reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        accruedExpenses = 0;
                        shortTermDebt = 0;
                        otherCurrentLiabilities = 0;
                        totalCurrentLiabilities = accountsPayable + accruedExpenses + shortTermDebt + otherCurrentLiabilities;
                        longTermDebt = 0;
                        otherNonCurrentLiabilities = 0;
                        totalNonCurrentLiabilities = longTermDebt + otherNonCurrentLiabilities;
                        totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
                        paidInCapital = 0;
                        retainedEarnings = 0;
                        currentPeriodEarnings = 0;
                        totalEquity = paidInCapital + retainedEarnings + currentPeriodEarnings;
                        balanceSheet = {
                            as_of_date: asOfDate,
                            clinic_id: clinicId,
                            assets: {
                                current_assets: {
                                    cash_and_equivalents: cashAndEquivalents,
                                    accounts_receivable: accountsReceivable,
                                    inventory: inventory,
                                    prepaid_expenses: prepaidExpenses,
                                    other_current_assets: otherCurrentAssets,
                                    total_current_assets: totalCurrentAssets
                                },
                                non_current_assets: {
                                    equipment: equipment,
                                    accumulated_depreciation: accumulatedDepreciation,
                                    net_equipment: netEquipment,
                                    software_licenses: softwareLicenses,
                                    other_non_current_assets: otherNonCurrentAssets,
                                    total_non_current_assets: totalNonCurrentAssets
                                },
                                total_assets: totalAssets
                            },
                            liabilities: {
                                current_liabilities: {
                                    accounts_payable: accountsPayable,
                                    accrued_expenses: accruedExpenses,
                                    short_term_debt: shortTermDebt,
                                    other_current_liabilities: otherCurrentLiabilities,
                                    total_current_liabilities: totalCurrentLiabilities
                                },
                                non_current_liabilities: {
                                    long_term_debt: longTermDebt,
                                    other_non_current_liabilities: otherNonCurrentLiabilities,
                                    total_non_current_liabilities: totalNonCurrentLiabilities
                                },
                                total_liabilities: totalLiabilities
                            },
                            equity: {
                                paid_in_capital: paidInCapital,
                                retained_earnings: retainedEarnings,
                                current_period_earnings: currentPeriodEarnings,
                                total_equity: totalEquity
                            },
                            total_liabilities_and_equity: totalLiabilities + totalEquity
                        };
                        validation = financial_reporting_2.balanceSheetSchema.safeParse(balanceSheet);
                        if (!validation.success) {
                            throw new Error("Balance sheet validation failed: ".concat(validation.error.message));
                        }
                        return [2 /*return*/, balanceSheet];
                }
            });
        });
    };
    /**
     * Generate Cash Flow Statement with operating, investing, and financing activities
     */
    FinancialReportingEngine.prototype.generateCashFlowStatement = function (clinicId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var period_start, period_end, _a, cashFlowData, cashFlowError, beginningCashData, endingCashData, beginningCash, endingCash, operatingRevenue, operatingExpenses, netProfit, depreciation, accountsReceivableChange, inventoryChange, accountsPayableChange, otherWorkingCapitalChanges, netCashFromOperations, equipmentPurchases, softwarePurchases, otherInvestments, netCashFromInvesting, debtProceeds, debtPayments, ownerContributions, ownerDistributions, netCashFromFinancing, netCashChange, cashFlowStatement, validation;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        period_start = parameters.period_start, period_end = parameters.period_end;
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('transaction_date', period_start)
                                .lte('transaction_date', period_end)];
                    case 1:
                        _a = _d.sent(), cashFlowData = _a.data, cashFlowError = _a.error;
                        if (cashFlowError)
                            throw new Error("Cash flow data fetch failed: ".concat(cashFlowError.message));
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('running_balance')
                                .eq('clinic_id', clinicId)
                                .lt('transaction_date', period_start)
                                .order('transaction_date', { ascending: false })
                                .limit(1)];
                    case 2:
                        beginningCashData = (_d.sent()).data;
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('running_balance')
                                .eq('clinic_id', clinicId)
                                .lte('transaction_date', period_end)
                                .order('transaction_date', { ascending: false })
                                .limit(1)];
                    case 3:
                        endingCashData = (_d.sent()).data;
                        beginningCash = ((_b = beginningCashData === null || beginningCashData === void 0 ? void 0 : beginningCashData[0]) === null || _b === void 0 ? void 0 : _b.running_balance) || 0;
                        endingCash = ((_c = endingCashData === null || endingCashData === void 0 ? void 0 : endingCashData[0]) === null || _c === void 0 ? void 0 : _c.running_balance) || 0;
                        operatingRevenue = (cashFlowData === null || cashFlowData === void 0 ? void 0 : cashFlowData.filter(function (entry) { return entry.transaction_type === 'revenue'; }).reduce(function (sum, entry) { return sum + entry.amount; }, 0)) || 0;
                        operatingExpenses = (cashFlowData === null || cashFlowData === void 0 ? void 0 : cashFlowData.filter(function (entry) { return entry.transaction_type === 'expense' && entry.category !== 'equipment' && entry.category !== 'investment'; }).reduce(function (sum, entry) { return sum + entry.amount; }, 0)) || 0;
                        netProfit = operatingRevenue - operatingExpenses;
                        depreciation = 0;
                        accountsReceivableChange = 0;
                        inventoryChange = 0;
                        accountsPayableChange = 0;
                        otherWorkingCapitalChanges = 0;
                        netCashFromOperations = netProfit + depreciation + accountsReceivableChange + inventoryChange + accountsPayableChange + otherWorkingCapitalChanges;
                        equipmentPurchases = (cashFlowData === null || cashFlowData === void 0 ? void 0 : cashFlowData.filter(function (entry) { return entry.transaction_type === 'expense' && entry.category === 'equipment'; }).reduce(function (sum, entry) { return sum + entry.amount; }, 0)) || 0;
                        softwarePurchases = (cashFlowData === null || cashFlowData === void 0 ? void 0 : cashFlowData.filter(function (entry) { return entry.transaction_type === 'expense' && entry.category === 'software'; }).reduce(function (sum, entry) { return sum + entry.amount; }, 0)) || 0;
                        otherInvestments = (cashFlowData === null || cashFlowData === void 0 ? void 0 : cashFlowData.filter(function (entry) { return entry.transaction_type === 'expense' && entry.category === 'investment'; }).reduce(function (sum, entry) { return sum + entry.amount; }, 0)) || 0;
                        netCashFromInvesting = -(equipmentPurchases + softwarePurchases + otherInvestments);
                        debtProceeds = 0;
                        debtPayments = 0;
                        ownerContributions = 0;
                        ownerDistributions = 0;
                        netCashFromFinancing = debtProceeds - debtPayments + ownerContributions - ownerDistributions;
                        netCashChange = netCashFromOperations + netCashFromInvesting + netCashFromFinancing;
                        cashFlowStatement = {
                            period_start: period_start,
                            period_end: period_end,
                            clinic_id: clinicId,
                            operating_activities: {
                                net_profit: netProfit,
                                depreciation: depreciation,
                                accounts_receivable_change: accountsReceivableChange,
                                inventory_change: inventoryChange,
                                accounts_payable_change: accountsPayableChange,
                                other_working_capital_changes: otherWorkingCapitalChanges,
                                net_cash_from_operations: netCashFromOperations
                            },
                            investing_activities: {
                                equipment_purchases: -equipmentPurchases,
                                software_purchases: -softwarePurchases,
                                other_investments: -otherInvestments,
                                net_cash_from_investing: netCashFromInvesting
                            },
                            financing_activities: {
                                debt_proceeds: debtProceeds,
                                debt_payments: -debtPayments,
                                owner_contributions: ownerContributions,
                                owner_distributions: -ownerDistributions,
                                net_cash_from_financing: netCashFromFinancing
                            },
                            net_cash_change: netCashChange,
                            beginning_cash: beginningCash,
                            ending_cash: endingCash
                        };
                        validation = financial_reporting_2.cashFlowStatementSchema.safeParse(cashFlowStatement);
                        if (!validation.success) {
                            throw new Error("Cash flow statement validation failed: ".concat(validation.error.message));
                        }
                        return [2 /*return*/, cashFlowStatement];
                }
            });
        });
    };
    // =====================================================================================
    // ANALYTICS AND KPI CALCULATION METHODS
    // =====================================================================================
    /**
     * Calculate comprehensive revenue analytics
     */
    FinancialReportingEngine.prototype.calculateRevenueAnalytics = function (clinicId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var period_start, period_end, _a, revenueData, error, totalRevenue, serviceRevenue, revenueByService, providerRevenue, revenueByProvider, dailyAverage, weeklyAverage, monthlyAverage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        period_start = parameters.period_start, period_end = parameters.period_end;
                        return [4 /*yield*/, this.supabase
                                .from('invoices')
                                .select("\n        total_amount,\n        issue_date,\n        invoice_items (\n          service_id,\n          total_amount,\n          description\n        ),\n        appointments (\n          professional_id,\n          professionals (\n            name\n          )\n        )\n      ")
                                .eq('clinic_id', clinicId)
                                .gte('issue_date', period_start)
                                .lte('issue_date', period_end)
                                .eq('status', 'paid')];
                    case 1:
                        _a = _b.sent(), revenueData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Revenue analytics fetch failed: ".concat(error.message));
                        totalRevenue = (revenueData === null || revenueData === void 0 ? void 0 : revenueData.reduce(function (sum, inv) { return sum + inv.total_amount; }, 0)) || 0;
                        serviceRevenue = new Map();
                        revenueData === null || revenueData === void 0 ? void 0 : revenueData.forEach(function (invoice) {
                            invoice.invoice_items.forEach(function (item) {
                                var serviceName = item.description || 'Other';
                                serviceRevenue.set(serviceName, (serviceRevenue.get(serviceName) || 0) + item.total_amount);
                            });
                        });
                        revenueByService = Array.from(serviceRevenue.entries()).map(function (_a) {
                            var service_name = _a[0], revenue = _a[1];
                            return ({
                                service_name: service_name,
                                revenue: revenue,
                                percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
                            });
                        });
                        providerRevenue = new Map();
                        revenueData === null || revenueData === void 0 ? void 0 : revenueData.forEach(function (invoice) {
                            var _a, _b;
                            var providerName = ((_b = (_a = invoice.appointments) === null || _a === void 0 ? void 0 : _a.professionals) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown';
                            var current = providerRevenue.get(providerName) || { revenue: 0, patient_count: 0 };
                            current.revenue += invoice.total_amount;
                            current.patient_count += 1;
                            providerRevenue.set(providerName, current);
                        });
                        revenueByProvider = Array.from(providerRevenue.entries()).map(function (_a) {
                            var provider_name = _a[0], data = _a[1];
                            return ({
                                provider_name: provider_name,
                                revenue: data.revenue,
                                percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
                                patient_count: data.patient_count
                            });
                        });
                        dailyAverage = totalRevenue / 30;
                        weeklyAverage = dailyAverage * 7;
                        monthlyAverage = totalRevenue;
                        return [2 /*return*/, {
                                total_revenue: totalRevenue,
                                revenue_by_service: revenueByService,
                                revenue_by_provider: revenueByProvider,
                                revenue_by_period: [], // TODO: Implement period-based breakdown
                                revenue_trends: {
                                    daily_average: dailyAverage,
                                    weekly_average: weeklyAverage,
                                    monthly_average: monthlyAverage,
                                    seasonal_patterns: {} // TODO: Implement seasonal analysis
                                }
                            }];
                }
            });
        });
    };
    /**
     * Calculate comprehensive expense analytics
     */
    FinancialReportingEngine.prototype.calculateExpenseAnalytics = function (clinicId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var period_start, period_end, _a, expenseData, error, totalExpenses, categoryExpenses, expenseByCategory, fixedExpenses, variableExpenses;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        period_start = parameters.period_start, period_end = parameters.period_end;
                        return [4 /*yield*/, this.supabase
                                .from('cash_flow_entries')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('transaction_date', period_start)
                                .lte('transaction_date', period_end)
                                .eq('transaction_type', 'expense')];
                    case 1:
                        _a = _b.sent(), expenseData = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Expense analytics fetch failed: ".concat(error.message));
                        totalExpenses = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        categoryExpenses = new Map();
                        expenseData === null || expenseData === void 0 ? void 0 : expenseData.forEach(function (expense) {
                            var category = expense.category || 'Other';
                            categoryExpenses.set(category, (categoryExpenses.get(category) || 0) + expense.amount);
                        });
                        expenseByCategory = Array.from(categoryExpenses.entries()).map(function (_a) {
                            var category_name = _a[0], amount = _a[1];
                            return ({
                                category_name: category_name,
                                amount: amount,
                                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                            });
                        });
                        fixedExpenses = (expenseData === null || expenseData === void 0 ? void 0 : expenseData.filter(function (exp) { return ['rent', 'utilities', 'insurance', 'software'].includes(exp.category); }).reduce(function (sum, exp) { return sum + exp.amount; }, 0)) || 0;
                        variableExpenses = totalExpenses - fixedExpenses;
                        return [2 /*return*/, {
                                total_expenses: totalExpenses,
                                expense_by_category: expenseByCategory,
                                expense_trends: {
                                    fixed_expenses: fixedExpenses,
                                    variable_expenses: variableExpenses,
                                    growth_rate: 0 // TODO: Calculate growth rate
                                },
                                cost_per_patient: 0, // TODO: Calculate cost per patient
                                cost_per_service: {} // TODO: Calculate cost per service
                            }];
                }
            });
        });
    };
    // =====================================================================================
    // REPORT MANAGEMENT METHODS
    // =====================================================================================
    /**
     * Save generated report to database and file system
     */
    FinancialReportingEngine.prototype.saveFinancialReport = function (report, content) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('financial_reports')
                            .insert([__assign(__assign({}, report), { status: 'generated', generated_date: new Date().toISOString(), download_count: 0 })])
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to save report: ".concat(error.message));
                        // TODO: Save report content to file system and update file_path
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Get saved financial reports with filtering
     */
    FinancialReportingEngine.prototype.getFinancialReports = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, filters) {
            var query, page, limit, offset, _a, data, error, count;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.supabase
                            .from('financial_reports')
                            .select('*', { count: 'exact' })
                            .eq('clinic_id', clinicId);
                        if (filters.report_type) {
                            query = query.eq('report_type', filters.report_type);
                        }
                        if (filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if (filters.period_start) {
                            query = query.gte('period_start', filters.period_start);
                        }
                        if (filters.period_end) {
                            query = query.lte('period_end', filters.period_end);
                        }
                        page = filters.page || 1;
                        limit = filters.limit || 20;
                        offset = (page - 1) * limit;
                        query = query
                            .order('generated_date', { ascending: false })
                            .range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw new Error("Failed to fetch reports: ".concat(error.message));
                        return [2 /*return*/, {
                                reports: data || [],
                                total: count || 0
                            }];
                }
            });
        });
    };
    /**
     * Validate report parameters and data integrity
     */
    FinancialReportingEngine.prototype.validateReportParameters = function (parameters) {
        var validation = financial_reporting_2.reportParametersSchema.safeParse(parameters);
        if (!validation.success) {
            return {
                is_valid: false,
                errors: validation.error.errors.map(function (err) { return ({
                    code: 'VALIDATION_ERROR',
                    message: err.message,
                    details: { path: err.path, value: err.input },
                    timestamp: new Date().toISOString()
                }); }),
                warnings: []
            };
        }
        var warnings = [];
        // Check for reasonable date ranges
        var startDate = new Date(parameters.period_start);
        var endDate = new Date(parameters.period_end);
        var diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
            warnings.push('Report period exceeds 1 year, performance may be impacted');
        }
        if (endDate > new Date()) {
            warnings.push('Report period includes future dates');
        }
        return {
            is_valid: true,
            errors: [],
            warnings: warnings
        };
    };
    return FinancialReportingEngine;
}());
exports.FinancialReportingEngine = FinancialReportingEngine;
