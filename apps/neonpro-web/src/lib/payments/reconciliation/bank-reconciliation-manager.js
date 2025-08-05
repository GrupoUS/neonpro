"use strict";
// NeonPro - Bank Reconciliation Manager
// Story 6.1 - Task 4: Bank Reconciliation System
// Comprehensive bank reconciliation service for automated transaction matching
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
exports.BankReconciliationManager = void 0;
exports.getBankReconciliationManager = getBankReconciliationManager;
var client_1 = require("@/lib/supabase/client");
var zod_1 = require("zod");
// Validation schemas
var BankStatementSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    bank_name: zod_1.z.string().min(1, 'Bank name is required'),
    account_number: zod_1.z.string().min(1, 'Account number is required'),
    statement_date: zod_1.z.string().datetime(),
    opening_balance: zod_1.z.number(),
    closing_balance: zod_1.z.number(),
    total_credits: zod_1.z.number(),
    total_debits: zod_1.z.number(),
    statement_period_start: zod_1.z.string().datetime(),
    statement_period_end: zod_1.z.string().datetime(),
    file_path: zod_1.z.string().optional(),
    import_status: zod_1.z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
    created_by: zod_1.z.string().uuid()
});
var BankTransactionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    statement_id: zod_1.z.string().uuid(),
    transaction_date: zod_1.z.string().datetime(),
    description: zod_1.z.string().min(1, 'Description is required'),
    reference_number: zod_1.z.string().optional(),
    debit_amount: zod_1.z.number().optional(),
    credit_amount: zod_1.z.number().optional(),
    balance: zod_1.z.number(),
    transaction_type: zod_1.z.enum(['debit', 'credit']),
    category: zod_1.z.string().optional(),
    matched_payment_id: zod_1.z.string().uuid().optional(),
    reconciliation_status: zod_1.z.enum(['unmatched', 'matched', 'disputed', 'ignored']).default('unmatched'),
    matching_confidence: zod_1.z.number().min(0).max(1).optional(),
    notes: zod_1.z.string().optional()
});
var ReconciliationRuleSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    rule_name: zod_1.z.string().min(1, 'Rule name is required'),
    rule_type: zod_1.z.enum(['exact_match', 'amount_match', 'date_range_match', 'description_pattern', 'reference_match']),
    conditions: zod_1.z.record(zod_1.z.any()),
    priority: zod_1.z.number().min(1).max(10).default(5),
    auto_match: zod_1.z.boolean().default(false),
    is_active: zod_1.z.boolean().default(true),
    created_by: zod_1.z.string().uuid()
});
var DiscrepancySchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    statement_id: zod_1.z.string().uuid(),
    discrepancy_type: zod_1.z.enum(['missing_transaction', 'duplicate_transaction', 'amount_mismatch', 'date_mismatch', 'unmatched_payment']),
    description: zod_1.z.string().min(1, 'Description is required'),
    expected_amount: zod_1.z.number().optional(),
    actual_amount: zod_1.z.number().optional(),
    transaction_id: zod_1.z.string().uuid().optional(),
    payment_id: zod_1.z.string().uuid().optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    status: zod_1.z.enum(['open', 'investigating', 'resolved', 'closed']).default('open'),
    resolution_notes: zod_1.z.string().optional(),
    resolved_by: zod_1.z.string().uuid().optional(),
    resolved_at: zod_1.z.string().datetime().optional()
});
/**
 * Bank Reconciliation Manager
 * Handles bank statement imports, transaction matching, and discrepancy detection
 */
var BankReconciliationManager = /** @class */ (function () {
    function BankReconciliationManager() {
        this.supabase = (0, client_1.createClient)();
    }
    /**
     * Import bank statement from file
     */
    BankReconciliationManager.prototype.importBankStatement = function (statementData, transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedStatement, _a, statement_1, statementError, importResult, batchSize, i, batch, validatedTransactions, _b, data, error, validationError_1, finalStatus, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        validatedStatement = BankStatementSchema.parse(statementData);
                        return [4 /*yield*/, this.supabase
                                .from('bank_statements')
                                .insert(validatedStatement)
                                .select()
                                .single()];
                    case 1:
                        _a = _c.sent(), statement_1 = _a.data, statementError = _a.error;
                        if (statementError) {
                            throw new Error("Failed to insert bank statement: ".concat(statementError.message));
                        }
                        importResult = {
                            statement_id: statement_1.id,
                            total_transactions: transactions.length,
                            imported_transactions: 0,
                            failed_transactions: 0,
                            errors: [],
                            warnings: []
                        };
                        batchSize = 100;
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < transactions.length)) return [3 /*break*/, 7];
                        batch = transactions.slice(i, i + batchSize);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        validatedTransactions = batch.map(function (transaction) {
                            var validated = BankTransactionSchema.parse(__assign(__assign({}, transaction), { statement_id: statement_1.id }));
                            return validated;
                        });
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .insert(validatedTransactions)
                                .select()];
                    case 4:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error) {
                            importResult.errors.push("Batch ".concat(Math.floor(i / batchSize) + 1, ": ").concat(error.message));
                            importResult.failed_transactions += batch.length;
                        }
                        else {
                            importResult.imported_transactions += data.length;
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        validationError_1 = _c.sent();
                        importResult.errors.push("Validation error in batch ".concat(Math.floor(i / batchSize) + 1, ": ").concat(validationError_1));
                        importResult.failed_transactions += batch.length;
                        return [3 /*break*/, 6];
                    case 6:
                        i += batchSize;
                        return [3 /*break*/, 2];
                    case 7:
                        finalStatus = importResult.failed_transactions === 0 ? 'completed' : 'failed';
                        return [4 /*yield*/, this.supabase
                                .from('bank_statements')
                                .update({ import_status: finalStatus })
                                .eq('id', statement_1.id)];
                    case 8:
                        _c.sent();
                        return [2 /*return*/, importResult];
                    case 9:
                        error_1 = _c.sent();
                        throw new Error("Import failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform automatic transaction matching
     */
    BankReconciliationManager.prototype.performAutoMatching = function (statementId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, transactions, transError, _b, rules, rulesError, matchingResults, _i, transactions_1, transaction, matchResult, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .select('*')
                                .eq('statement_id', statementId)
                                .eq('reconciliation_status', 'unmatched')];
                    case 1:
                        _a = _c.sent(), transactions = _a.data, transError = _a.error;
                        if (transError) {
                            throw new Error("Failed to fetch transactions: ".concat(transError.message));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('reconciliation_rules')
                                .select('*')
                                .eq('is_active', true)
                                .order('priority', { ascending: false })];
                    case 2:
                        _b = _c.sent(), rules = _b.data, rulesError = _b.error;
                        if (rulesError) {
                            throw new Error("Failed to fetch reconciliation rules: ".concat(rulesError.message));
                        }
                        matchingResults = [];
                        _i = 0, transactions_1 = transactions;
                        _c.label = 3;
                    case 3:
                        if (!(_i < transactions_1.length)) return [3 /*break*/, 7];
                        transaction = transactions_1[_i];
                        return [4 /*yield*/, this.findMatchingPayment(transaction, rules)];
                    case 4:
                        matchResult = _c.sent();
                        if (!matchResult) return [3 /*break*/, 6];
                        matchingResults.push(matchResult);
                        // Update transaction with match
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .update({
                                matched_payment_id: matchResult.payment_id,
                                reconciliation_status: matchResult.auto_matched ? 'matched' : 'unmatched',
                                matching_confidence: matchResult.confidence_score,
                                notes: "Auto-matched using criteria: ".concat(matchResult.matching_criteria.join(', '))
                            })
                                .eq('id', matchResult.transaction_id)];
                    case 5:
                        // Update transaction with match
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, matchingResults];
                    case 8:
                        error_2 = _c.sent();
                        throw new Error("Auto matching failed: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find matching payment for a bank transaction
     */
    BankReconciliationManager.prototype.findMatchingPayment = function (transaction, rules) {
        return __awaiter(this, void 0, void 0, function () {
            var amount, transactionDate, dateRange, startDate, endDate, _a, payments, error, bestMatch, highestConfidence, _i, payments_1, payment, confidence, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        amount = transaction.credit_amount || transaction.debit_amount || 0;
                        transactionDate = new Date(transaction.transaction_date);
                        dateRange = 7;
                        startDate = new Date(transactionDate);
                        startDate.setDate(startDate.getDate() - dateRange);
                        endDate = new Date(transactionDate);
                        endDate.setDate(endDate.getDate() + dateRange);
                        return [4 /*yield*/, this.supabase
                                .from('payments')
                                .select('*')
                                .gte('created_at', startDate.toISOString())
                                .lte('created_at', endDate.toISOString())
                                .eq('status', 'completed')];
                    case 1:
                        _a = _b.sent(), payments = _a.data, error = _a.error;
                        if (error || !payments) {
                            return [2 /*return*/, null];
                        }
                        bestMatch = null;
                        highestConfidence = 0;
                        for (_i = 0, payments_1 = payments; _i < payments_1.length; _i++) {
                            payment = payments_1[_i];
                            confidence = this.calculateMatchingConfidence(transaction, payment, rules);
                            if (confidence.score > highestConfidence && confidence.score >= 0.7) {
                                highestConfidence = confidence.score;
                                bestMatch = {
                                    transaction_id: transaction.id,
                                    payment_id: payment.id,
                                    confidence_score: confidence.score,
                                    matching_criteria: confidence.criteria,
                                    auto_matched: confidence.score >= 0.9
                                };
                            }
                        }
                        return [2 /*return*/, bestMatch];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error finding matching payment:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate matching confidence between transaction and payment
     */
    BankReconciliationManager.prototype.calculateMatchingConfidence = function (transaction, payment, rules) {
        var score = 0;
        var criteria = [];
        var amount = transaction.credit_amount || transaction.debit_amount || 0;
        // Exact amount match (40% weight)
        if (Math.abs(payment.amount - amount) < 0.01) {
            score += 0.4;
            criteria.push('exact_amount_match');
        }
        else if (Math.abs(payment.amount - amount) / payment.amount < 0.05) {
            score += 0.2;
            criteria.push('approximate_amount_match');
        }
        // Date proximity (30% weight)
        var transactionDate = new Date(transaction.transaction_date);
        var paymentDate = new Date(payment.created_at);
        var daysDiff = Math.abs(transactionDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff === 0) {
            score += 0.3;
            criteria.push('same_date');
        }
        else if (daysDiff <= 1) {
            score += 0.2;
            criteria.push('next_day');
        }
        else if (daysDiff <= 3) {
            score += 0.1;
            criteria.push('within_3_days');
        }
        // Reference number match (20% weight)
        if (transaction.reference_number && payment.reference_id) {
            if (transaction.reference_number === payment.reference_id) {
                score += 0.2;
                criteria.push('reference_match');
            }
            else if (transaction.reference_number.includes(payment.reference_id) ||
                payment.reference_id.includes(transaction.reference_number)) {
                score += 0.1;
                criteria.push('partial_reference_match');
            }
        }
        // Description similarity (10% weight)
        if (transaction.description && payment.description) {
            var similarity = this.calculateStringSimilarity(transaction.description.toLowerCase(), payment.description.toLowerCase());
            if (similarity > 0.8) {
                score += 0.1;
                criteria.push('description_match');
            }
            else if (similarity > 0.5) {
                score += 0.05;
                criteria.push('partial_description_match');
            }
        }
        return { score: Math.min(score, 1), criteria: criteria };
    };
    /**
     * Calculate string similarity using Levenshtein distance
     */
    BankReconciliationManager.prototype.calculateStringSimilarity = function (str1, str2) {
        var matrix = [];
        var len1 = str1.length;
        var len2 = str2.length;
        for (var i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (var j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }
        for (var i = 1; i <= len2; i++) {
            for (var j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        var maxLength = Math.max(len1, len2);
        return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
    };
    /**
     * Detect discrepancies in reconciliation
     */
    BankReconciliationManager.prototype.detectDiscrepancies = function (statementId) {
        return __awaiter(this, void 0, void 0, function () {
            var discrepancies, _a, statement, stmtError, _b, transactions, transError, calculatedBalance, unmatchedTransactions, _i, unmatchedTransactions_1, transaction, duplicates, _c, duplicates_1, duplicate, discError, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        discrepancies = [];
                        return [4 /*yield*/, this.supabase
                                .from('bank_statements')
                                .select('*')
                                .eq('id', statementId)
                                .single()];
                    case 1:
                        _a = _d.sent(), statement = _a.data, stmtError = _a.error;
                        if (stmtError) {
                            throw new Error("Failed to fetch statement: ".concat(stmtError.message));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .select('*')
                                .eq('statement_id', statementId)];
                    case 2:
                        _b = _d.sent(), transactions = _b.data, transError = _b.error;
                        if (transError) {
                            throw new Error("Failed to fetch transactions: ".concat(transError.message));
                        }
                        calculatedBalance = transactions.reduce(function (balance, trans) {
                            var credit = trans.credit_amount || 0;
                            var debit = trans.debit_amount || 0;
                            return balance + credit - debit;
                        }, statement.opening_balance);
                        if (Math.abs(calculatedBalance - statement.closing_balance) > 0.01) {
                            discrepancies.push({
                                statement_id: statementId,
                                discrepancy_type: 'amount_mismatch',
                                description: 'Calculated balance does not match statement closing balance',
                                expected_amount: statement.closing_balance,
                                actual_amount: calculatedBalance,
                                severity: 'high'
                            });
                        }
                        unmatchedTransactions = transactions.filter(function (trans) { return trans.reconciliation_status === 'unmatched'; });
                        for (_i = 0, unmatchedTransactions_1 = unmatchedTransactions; _i < unmatchedTransactions_1.length; _i++) {
                            transaction = unmatchedTransactions_1[_i];
                            discrepancies.push({
                                statement_id: statementId,
                                discrepancy_type: 'unmatched_payment',
                                description: "Unmatched transaction: ".concat(transaction.description),
                                actual_amount: transaction.credit_amount || transaction.debit_amount,
                                transaction_id: transaction.id,
                                severity: 'medium'
                            });
                        }
                        duplicates = this.findDuplicateTransactions(transactions);
                        for (_c = 0, duplicates_1 = duplicates; _c < duplicates_1.length; _c++) {
                            duplicate = duplicates_1[_c];
                            discrepancies.push({
                                statement_id: statementId,
                                discrepancy_type: 'duplicate_transaction',
                                description: "Potential duplicate transaction: ".concat(duplicate.description),
                                actual_amount: duplicate.credit_amount || duplicate.debit_amount,
                                transaction_id: duplicate.id,
                                severity: 'medium'
                            });
                        }
                        if (!(discrepancies.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('reconciliation_discrepancies')
                                .insert(discrepancies)];
                    case 3:
                        discError = (_d.sent()).error;
                        if (discError) {
                            console.error('Failed to save discrepancies:', discError);
                        }
                        _d.label = 4;
                    case 4: return [2 /*return*/, discrepancies];
                    case 5:
                        error_4 = _d.sent();
                        throw new Error("Discrepancy detection failed: ".concat(error_4 instanceof Error ? error_4.message : 'Unknown error'));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find duplicate transactions
     */
    BankReconciliationManager.prototype.findDuplicateTransactions = function (transactions) {
        var duplicates = [];
        var seen = new Map();
        for (var _i = 0, transactions_2 = transactions; _i < transactions_2.length; _i++) {
            var transaction = transactions_2[_i];
            var key = "".concat(transaction.transaction_date, "_").concat(transaction.credit_amount || transaction.debit_amount, "_").concat(transaction.description);
            if (seen.has(key)) {
                duplicates.push(transaction);
            }
            else {
                seen.set(key, transaction);
            }
        }
        return duplicates;
    };
    /**
     * Get reconciliation summary
     */
    BankReconciliationManager.prototype.getReconciliationSummary = function (statementId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, transactions, error, total, matched, unmatched, disputed, _b, discrepancies, discError, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .select('reconciliation_status')
                                .eq('statement_id', statementId)];
                    case 1:
                        _a = _c.sent(), transactions = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to fetch transactions: ".concat(error.message));
                        }
                        total = transactions.length;
                        matched = transactions.filter(function (t) { return t.reconciliation_status === 'matched'; }).length;
                        unmatched = transactions.filter(function (t) { return t.reconciliation_status === 'unmatched'; }).length;
                        disputed = transactions.filter(function (t) { return t.reconciliation_status === 'disputed'; }).length;
                        return [4 /*yield*/, this.supabase
                                .from('reconciliation_discrepancies')
                                .select('id')
                                .eq('statement_id', statementId)
                                .eq('status', 'open')];
                    case 2:
                        _b = _c.sent(), discrepancies = _b.data, discError = _b.error;
                        if (discError) {
                            throw new Error("Failed to fetch discrepancies: ".concat(discError.message));
                        }
                        return [2 /*return*/, {
                                statement_id: statementId,
                                total_transactions: total,
                                matched_transactions: matched,
                                unmatched_transactions: unmatched,
                                disputed_transactions: disputed,
                                total_discrepancies: discrepancies.length,
                                reconciliation_percentage: total > 0 ? (matched / total) * 100 : 0,
                                balance_difference: 0, // This would be calculated from actual vs expected balance
                                last_reconciled_at: new Date().toISOString()
                            }];
                    case 3:
                        error_5 = _c.sent();
                        throw new Error("Failed to get reconciliation summary: ".concat(error_5 instanceof Error ? error_5.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Manual transaction matching
     */
    BankReconciliationManager.prototype.manualMatch = function (transactionId, paymentId, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('bank_transactions')
                                .update({
                                matched_payment_id: paymentId,
                                reconciliation_status: 'matched',
                                matching_confidence: 1.0,
                                notes: notes || 'Manually matched'
                            })
                                .eq('id', transactionId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to update transaction: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Manual matching failed: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create reconciliation rule
     */
    BankReconciliationManager.prototype.createReconciliationRule = function (ruleData) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedRule, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        validatedRule = ReconciliationRuleSchema.parse(ruleData);
                        return [4 /*yield*/, this.supabase
                                .from('reconciliation_rules')
                                .insert(validatedRule)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to create reconciliation rule: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_7 = _b.sent();
                        throw new Error("Rule creation failed: ".concat(error_7 instanceof Error ? error_7.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return BankReconciliationManager;
}());
exports.BankReconciliationManager = BankReconciliationManager;
// Export singleton instance
var bankReconciliationManager;
function getBankReconciliationManager() {
    if (!bankReconciliationManager) {
        bankReconciliationManager = new BankReconciliationManager();
    }
    return bankReconciliationManager;
}
