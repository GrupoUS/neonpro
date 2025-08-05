// NeonPro - Bank Transactions API Routes
// Story 6.1 - Task 4: Bank Reconciliation System
// API endpoints for individual bank transaction management
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var server_2 = require("@/lib/supabase/server");
var bank_reconciliation_manager_1 = require("@/lib/payments/reconciliation/bank-reconciliation-manager");
// Validation schemas
var GetTransactionsQuerySchema = zod_1.z.object({
  statementId: zod_1.z.string().uuid().optional(),
  status: zod_1.z.enum(["unmatched", "matched", "disputed", "ignored"]).optional(),
  dateFrom: zod_1.z.string().datetime().optional(),
  dateTo: zod_1.z.string().datetime().optional(),
  amountMin: zod_1.z.coerce.number().optional(),
  amountMax: zod_1.z.coerce.number().optional(),
  searchTerm: zod_1.z.string().optional(),
  transactionType: zod_1.z.enum(["debit", "credit"]).optional(),
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  sortBy: zod_1.z.enum(["date", "amount", "description", "status"]).default("date"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
var UpdateTransactionSchema = zod_1.z.object({
  transactionId: zod_1.z.string().uuid(),
  reconciliationStatus: zod_1.z.enum(["unmatched", "matched", "disputed", "ignored"]).optional(),
  matchedPaymentId: zod_1.z.string().uuid().nullable().optional(),
  matchingConfidence: zod_1.z.number().min(0).max(1).optional(),
  category: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
});
var BulkUpdateSchema = zod_1.z.object({
  transactionIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
  action: zod_1.z.enum([
    "mark_matched",
    "mark_unmatched",
    "mark_disputed",
    "mark_ignored",
    "set_category",
  ]),
  data: zod_1.z
    .object({
      reconciliationStatus: zod_1.z
        .enum(["unmatched", "matched", "disputed", "ignored"])
        .optional(),
      category: zod_1.z.string().optional(),
      notes: zod_1.z.string().optional(),
    })
    .optional(),
});
var MatchTransactionSchema = zod_1.z.object({
  transactionId: zod_1.z.string().uuid(),
  paymentId: zod_1.z.string().uuid(),
  confidence: zod_1.z.number().min(0).max(1).default(1.0),
  notes: zod_1.z.string().optional(),
});
/**
 * GET /api/bank-reconciliation/transactions
 * Get bank transactions with filtering, searching, and pagination
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      url,
      queryParams,
      validatedQuery,
      query,
      sortColumn,
      _b,
      transactions,
      transactionsError,
      countQuery,
      _c,
      count,
      countError,
      summary,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = GetTransactionsQuerySchema.parse(queryParams);
          query = supabase
            .from("bank_transactions")
            .select(
              "\n        *,\n        bank_statements!inner(\n          id,\n          bank_name,\n          account_number,\n          created_by\n        ),\n        payments(\n          id,\n          amount,\n          status,\n          payment_method\n        )\n      ",
            )
            .eq("bank_statements.created_by", user.id);
          // Apply filters
          if (validatedQuery.statementId) {
            query = query.eq("statement_id", validatedQuery.statementId);
          }
          if (validatedQuery.status) {
            query = query.eq("reconciliation_status", validatedQuery.status);
          }
          if (validatedQuery.dateFrom) {
            query = query.gte("transaction_date", validatedQuery.dateFrom);
          }
          if (validatedQuery.dateTo) {
            query = query.lte("transaction_date", validatedQuery.dateTo);
          }
          if (validatedQuery.transactionType) {
            query = query.eq("transaction_type", validatedQuery.transactionType);
          }
          if (validatedQuery.amountMin !== undefined) {
            query = query.or(
              "debit_amount.gte."
                .concat(validatedQuery.amountMin, ",credit_amount.gte.")
                .concat(validatedQuery.amountMin),
            );
          }
          if (validatedQuery.amountMax !== undefined) {
            query = query.or(
              "debit_amount.lte."
                .concat(validatedQuery.amountMax, ",credit_amount.lte.")
                .concat(validatedQuery.amountMax),
            );
          }
          if (validatedQuery.searchTerm) {
            query = query.or(
              "description.ilike.%"
                .concat(validatedQuery.searchTerm, "%,reference_number.ilike.%")
                .concat(validatedQuery.searchTerm, "%"),
            );
          }
          sortColumn =
            validatedQuery.sortBy === "amount"
              ? "debit_amount"
              : validatedQuery.sortBy === "date"
                ? "transaction_date"
                : validatedQuery.sortBy;
          query = query.order(sortColumn, { ascending: validatedQuery.sortOrder === "asc" });
          return [
            4 /*yield*/,
            query.range(
              (validatedQuery.page - 1) * validatedQuery.limit,
              validatedQuery.page * validatedQuery.limit - 1,
            ),
          ];
        case 3:
          (_b = _d.sent()), (transactions = _b.data), (transactionsError = _b.error);
          if (transactionsError) {
            throw new Error("Failed to fetch transactions: ".concat(transactionsError.message));
          }
          countQuery = supabase
            .from("bank_transactions")
            .select("*", { count: "exact", head: true })
            .eq("bank_statements.created_by", user.id);
          // Apply same filters for count
          if (validatedQuery.statementId) {
            countQuery = countQuery.eq("statement_id", validatedQuery.statementId);
          }
          if (validatedQuery.status) {
            countQuery = countQuery.eq("reconciliation_status", validatedQuery.status);
          }
          if (validatedQuery.dateFrom) {
            countQuery = countQuery.gte("transaction_date", validatedQuery.dateFrom);
          }
          if (validatedQuery.dateTo) {
            countQuery = countQuery.lte("transaction_date", validatedQuery.dateTo);
          }
          if (validatedQuery.transactionType) {
            countQuery = countQuery.eq("transaction_type", validatedQuery.transactionType);
          }
          if (validatedQuery.searchTerm) {
            countQuery = countQuery.or(
              "description.ilike.%"
                .concat(validatedQuery.searchTerm, "%,reference_number.ilike.%")
                .concat(validatedQuery.searchTerm, "%"),
            );
          }
          return [4 /*yield*/, countQuery];
        case 4:
          (_c = _d.sent()), (count = _c.count), (countError = _c.error);
          if (countError) {
            throw new Error("Failed to get count: ".concat(countError.message));
          }
          summary = {
            totalTransactions: count || 0,
            matchedCount:
              (transactions === null || transactions === void 0
                ? void 0
                : transactions.filter((t) => t.reconciliation_status === "matched").length) || 0,
            unmatchedCount:
              (transactions === null || transactions === void 0
                ? void 0
                : transactions.filter((t) => t.reconciliation_status === "unmatched").length) || 0,
            disputedCount:
              (transactions === null || transactions === void 0
                ? void 0
                : transactions.filter((t) => t.reconciliation_status === "disputed").length) || 0,
            totalAmount:
              (transactions === null || transactions === void 0
                ? void 0
                : transactions.reduce(
                    (sum, t) => sum + (t.debit_amount || t.credit_amount || 0),
                    0,
                  )) || 0,
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: transactions,
              summary: summary,
              pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / validatedQuery.limit),
              },
            }),
          ];
        case 5:
          error_1 = _d.sent();
          console.error("Error fetching bank transactions:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation error",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/bank-reconciliation/transactions
 * Perform transaction matching or bulk operations
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      _b,
      _validatedData,
      _reconciliationManager,
      result,
      validatedData,
      updateData,
      _c,
      updatedTransactions,
      updateError,
      transactionId,
      reconciliationManager,
      matches,
      error_2;
    var _d, _e;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 12, undefined, 13]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _f.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _f.sent();
          action = body.action;
          _b = action;
          switch (_b) {
            case "match_transaction":
              return [3 /*break*/, 4];
            case "bulk_update":
              return [3 /*break*/, 6];
            case "find_potential_matches":
              return [3 /*break*/, 8];
          }
          return [3 /*break*/, 10];
        case 4:
          validatedData = MatchTransactionSchema.parse(body);
          reconciliationManager = new bank_reconciliation_manager_1.BankReconciliationManager();
          return [
            4 /*yield*/,
            reconciliationManager.performManualMatching(
              validatedData.transactionId,
              validatedData.paymentId,
              validatedData.confidence,
              validatedData.notes,
            ),
          ];
        case 5:
          result = _f.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: result,
              message: result.success
                ? "Transaction matched successfully"
                : "Failed to match transaction",
            }),
          ];
        case 6:
          validatedData = BulkUpdateSchema.parse(body);
          updateData = {};
          switch (validatedData.action) {
            case "mark_matched":
              updateData.reconciliation_status = "matched";
              break;
            case "mark_unmatched":
              updateData.reconciliation_status = "unmatched";
              updateData.matched_payment_id = null;
              updateData.matching_confidence = null;
              break;
            case "mark_disputed":
              updateData.reconciliation_status = "disputed";
              break;
            case "mark_ignored":
              updateData.reconciliation_status = "ignored";
              break;
            case "set_category":
              if ((_d = validatedData.data) === null || _d === void 0 ? void 0 : _d.category) {
                updateData.category = validatedData.data.category;
              }
              break;
          }
          if ((_e = validatedData.data) === null || _e === void 0 ? void 0 : _e.notes) {
            updateData.notes = validatedData.data.notes;
          }
          return [
            4 /*yield*/,
            supabase
              .from("bank_transactions")
              .update(updateData)
              .in("id", validatedData.transactionIds)
              .select("\n            *,\n            bank_statements!inner(created_by)\n          ")
              .eq("bank_statements.created_by", user.id),
          ];
        case 7:
          (_c = _f.sent()), (updatedTransactions = _c.data), (updateError = _c.error);
          if (updateError) {
            throw new Error("Failed to update transactions: ".concat(updateError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedTransactions,
              message: "Successfully updated ".concat(
                (updatedTransactions === null || updatedTransactions === void 0
                  ? void 0
                  : updatedTransactions.length) || 0,
                " transactions",
              ),
            }),
          ];
        case 8:
          transactionId = body.transactionId;
          if (!transactionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Transaction ID is required" }, { status: 400 }),
            ];
          }
          reconciliationManager = new bank_reconciliation_manager_1.BankReconciliationManager();
          return [4 /*yield*/, reconciliationManager.findPotentialMatches(transactionId)];
        case 9:
          matches = _f.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: matches,
              message: "Found ".concat(matches.length, " potential matches"),
            }),
          ];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          error_2 = _f.sent();
          console.error("Error in bank transactions POST:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation error",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/bank-reconciliation/transactions
 * Update individual transaction details
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      updateData,
      _b,
      transaction,
      updateError,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = UpdateTransactionSchema.parse(body);
          updateData = {};
          if (validatedData.reconciliationStatus !== undefined) {
            updateData.reconciliation_status = validatedData.reconciliationStatus;
          }
          if (validatedData.matchedPaymentId !== undefined) {
            updateData.matched_payment_id = validatedData.matchedPaymentId;
          }
          if (validatedData.matchingConfidence !== undefined) {
            updateData.matching_confidence = validatedData.matchingConfidence;
          }
          if (validatedData.category !== undefined) {
            updateData.category = validatedData.category;
          }
          if (validatedData.notes !== undefined) {
            updateData.notes = validatedData.notes;
          }
          return [
            4 /*yield*/,
            supabase
              .from("bank_transactions")
              .update(updateData)
              .eq("id", validatedData.transactionId)
              .select(
                "\n        *,\n        bank_statements!inner(\n          id,\n          bank_name,\n          account_number,\n          created_by\n        )\n      ",
              )
              .eq("bank_statements.created_by", user.id)
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (transaction = _b.data), (updateError = _b.error);
          if (updateError) {
            throw new Error("Failed to update transaction: ".concat(updateError.message));
          }
          if (!transaction) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Transaction not found or access denied" },
                { status: 404 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: transaction,
              message: "Transaction updated successfully",
            }),
          ];
        case 5:
          error_3 = _c.sent();
          console.error("Error updating bank transaction:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation error",
                  details: error_3.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/bank-reconciliation/transactions
 * Delete bank transactions (soft delete by marking as ignored)
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      transactionIds,
      _b,
      permanent,
      deleteError,
      _c,
      transactions,
      updateError,
      error_4;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 8, undefined, 9]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          (transactionIds = body.transactionIds),
            (_b = body.permanent),
            (permanent = _b === void 0 ? false : _b);
          if (!transactionIds || !Array.isArray(transactionIds)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Transaction IDs array is required" },
                { status: 400 },
              ),
            ];
          }
          if (!permanent) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("bank_transactions")
              .delete()
              .in("id", transactionIds)
              .eq("bank_statements.created_by", user.id),
          ];
        case 4:
          deleteError = _d.sent().error;
          if (deleteError) {
            throw new Error("Failed to delete transactions: ".concat(deleteError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Successfully deleted ".concat(transactionIds.length, " transactions"),
            }),
          ];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("bank_transactions")
              .update({
                reconciliation_status: "ignored",
                notes: "Marked as ignored by user",
              })
              .in("id", transactionIds)
              .select("\n          *,\n          bank_statements!inner(created_by)\n        ")
              .eq("bank_statements.created_by", user.id),
          ];
        case 6:
          (_c = _d.sent()), (transactions = _c.data), (updateError = _c.error);
          if (updateError) {
            throw new Error("Failed to mark transactions as ignored: ".concat(updateError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: transactions,
              message: "Successfully marked ".concat(
                (transactions === null || transactions === void 0 ? void 0 : transactions.length) ||
                  0,
                " transactions as ignored",
              ),
            }),
          ];
        case 7:
          return [3 /*break*/, 9];
        case 8:
          error_4 = _d.sent();
          console.error("Error deleting bank transactions:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
