// NeonPro - Bank Reconciliation API Routes
// Story 6.1 - Task 4: Bank Reconciliation System
// Main API endpoints for bank reconciliation management
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
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
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
var bank_statement_processor_1 = require("@/lib/payments/reconciliation/bank-statement-processor");
// Validation schemas
var GetReconciliationQuerySchema = zod_1.z.object({
  statementId: zod_1.z.string().uuid().optional(),
  bankName: zod_1.z.string().optional(),
  accountNumber: zod_1.z.string().optional(),
  dateFrom: zod_1.z.string().datetime().optional(),
  dateTo: zod_1.z.string().datetime().optional(),
  status: zod_1.z.enum(["pending", "processing", "completed", "failed"]).optional(),
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
var ImportStatementSchema = zod_1.z.object({
  bankName: zod_1.z.string().min(1, "Bank name is required"),
  accountNumber: zod_1.z.string().min(1, "Account number is required"),
  statementDate: zod_1.z.string().datetime(),
  openingBalance: zod_1.z.number(),
  closingBalance: zod_1.z.number(),
  statementPeriodStart: zod_1.z.string().datetime(),
  statementPeriodEnd: zod_1.z.string().datetime(),
  processingOptions: zod_1.z
    .object({
      skipDuplicates: zod_1.z.boolean().default(true),
      autoMatch: zod_1.z.boolean().default(true),
      dateFormat: zod_1.z.string().default("YYYY-MM-DD"),
      encoding: zod_1.z.string().default("utf-8"),
      delimiter: zod_1.z.string().default(","),
      hasHeader: zod_1.z.boolean().default(true),
    })
    .optional(),
});
var ReconcileTransactionsSchema = zod_1.z.object({
  statementId: zod_1.z.string().uuid(),
  autoMatchOnly: zod_1.z.boolean().default(false),
  confidenceThreshold: zod_1.z.number().min(0).max(1).default(0.8),
});
var ManualMatchSchema = zod_1.z.object({
  transactionId: zod_1.z.string().uuid(),
  paymentId: zod_1.z.string().uuid(),
  confidence: zod_1.z.number().min(0).max(1).default(1.0),
  notes: zod_1.z.string().optional(),
});
/**
 * GET /api/bank-reconciliation
 * Get bank reconciliation data with filtering and pagination
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
      reconciliationManager,
      filters,
      _b,
      statements,
      statementsError,
      _c,
      count,
      countError,
      summary,
      error_1;
    var _d;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = GetReconciliationQuerySchema.parse(queryParams);
          reconciliationManager = new bank_reconciliation_manager_1.BankReconciliationManager();
          filters = {};
          if (validatedQuery.statementId) filters.statementId = validatedQuery.statementId;
          if (validatedQuery.bankName) filters.bankName = validatedQuery.bankName;
          if (validatedQuery.accountNumber) filters.accountNumber = validatedQuery.accountNumber;
          if (validatedQuery.dateFrom) filters.dateFrom = validatedQuery.dateFrom;
          if (validatedQuery.dateTo) filters.dateTo = validatedQuery.dateTo;
          if (validatedQuery.status) filters.status = validatedQuery.status;
          return [
            4 /*yield*/,
            supabase
              .from("bank_statements")
              .select(
                "\n        *,\n        bank_transactions(\n          id,\n          transaction_date,\n          description,\n          debit_amount,\n          credit_amount,\n          reconciliation_status,\n          matching_confidence\n        )\n      ",
              )
              .match(filters)
              .order("statement_date", { ascending: false })
              .range(
                (validatedQuery.page - 1) * validatedQuery.limit,
                validatedQuery.page * validatedQuery.limit - 1,
              ),
          ];
        case 3:
          (_b = _e.sent()), (statements = _b.data), (statementsError = _b.error);
          if (statementsError) {
            throw new Error("Failed to fetch statements: ".concat(statementsError.message));
          }
          return [
            4 /*yield*/,
            supabase
              .from("bank_statements")
              .select("*", { count: "exact", head: true })
              .match(filters),
          ];
        case 4:
          (_c = _e.sent()), (count = _c.count), (countError = _c.error);
          if (countError) {
            throw new Error("Failed to get count: ".concat(countError.message));
          }
          _d = {
            totalStatements: count || 0,
            totalPages: Math.ceil((count || 0) / validatedQuery.limit),
            currentPage: validatedQuery.page,
          };
          return [
            4 /*yield*/,
            reconciliationManager.getReconciliationSummary({
              dateFrom: validatedQuery.dateFrom,
              dateTo: validatedQuery.dateTo,
              bankName: validatedQuery.bankName,
            }),
          ];
        case 5:
          summary = ((_d.reconciliationStats = _e.sent()), _d);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: statements,
              summary: summary,
              pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / validatedQuery.limit),
              },
            }),
          ];
        case 6:
          error_1 = _e.sent();
          console.error("Error fetching reconciliation data:", error_1);
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
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/bank-reconciliation
 * Import bank statement file or perform reconciliation
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      contentType,
      formData,
      file,
      metadata,
      statementData,
      validatedData,
      processor,
      result,
      body,
      action,
      _b,
      validatedData,
      reconciliationManager,
      result,
      validatedData,
      reconciliationManager,
      result,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 13, , 14]);
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
          contentType = request.headers.get("content-type") || "";
          if (!contentType.includes("multipart/form-data")) return [3 /*break*/, 5];
          return [4 /*yield*/, request.formData()];
        case 3:
          formData = _c.sent();
          file = formData.get("file");
          metadata = formData.get("metadata");
          if (!file) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No file provided" }, { status: 400 }),
            ];
          }
          statementData = void 0;
          try {
            statementData = metadata ? JSON.parse(metadata) : {};
          } catch (_d) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid metadata JSON" }, { status: 400 }),
            ];
          }
          validatedData = ImportStatementSchema.parse(statementData);
          processor = new bank_statement_processor_1.BankStatementProcessor();
          return [
            4 /*yield*/,
            processor.processStatementFile(file, file.name, validatedData.processingOptions),
          ];
        case 4:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: result,
              message: result.success
                ? "Successfully processed ".concat(result.processedTransactions, " transactions")
                : "Failed to process statement file",
            }),
          ];
        case 5:
          return [4 /*yield*/, request.json()];
        case 6:
          body = _c.sent();
          action = body.action;
          _b = action;
          switch (_b) {
            case "reconcile":
              return [3 /*break*/, 7];
            case "manual_match":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 7:
          validatedData = ReconcileTransactionsSchema.parse(body);
          reconciliationManager = new bank_reconciliation_manager_1.BankReconciliationManager();
          return [
            4 /*yield*/,
            reconciliationManager.performAutoMatching(validatedData.statementId, {
              confidenceThreshold: validatedData.confidenceThreshold,
              autoMatchOnly: validatedData.autoMatchOnly,
            }),
          ];
        case 8:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
              message: "Matched ".concat(result.matchedCount, " transactions"),
            }),
          ];
        case 9:
          validatedData = ManualMatchSchema.parse(body);
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
        case 10:
          result = _c.sent();
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
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 12:
          return [3 /*break*/, 14];
        case 13:
          error_2 = _c.sent();
          console.error("Error in bank reconciliation POST:", error_2);
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
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/bank-reconciliation
 * Update reconciliation rules or statement status
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      _b,
      ruleId,
      ruleData,
      _c,
      rule,
      updateError,
      statementId,
      status_1,
      _d,
      statement,
      updateError,
      error_3;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _e.sent();
          action = body.action;
          _b = action;
          switch (_b) {
            case "update_rule":
              return [3 /*break*/, 4];
            case "update_statement_status":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 4:
          (ruleId = body.ruleId), (ruleData = __rest(body, ["ruleId"]));
          if (!ruleId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Rule ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("reconciliation_rules")
              .update(ruleData)
              .eq("id", ruleId)
              .eq("created_by", user.id)
              .select()
              .single(),
          ];
        case 5:
          (_c = _e.sent()), (rule = _c.data), (updateError = _c.error);
          if (updateError) {
            throw new Error("Failed to update rule: ".concat(updateError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: rule,
              message: "Reconciliation rule updated successfully",
            }),
          ];
        case 6:
          (statementId = body.statementId), (status_1 = body.status);
          if (!statementId || !status_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Statement ID and status are required" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("bank_statements")
              .update({ import_status: status_1 })
              .eq("id", statementId)
              .eq("created_by", user.id)
              .select()
              .single(),
          ];
        case 7:
          (_d = _e.sent()), (statement = _d.data), (updateError = _d.error);
          if (updateError) {
            throw new Error("Failed to update statement: ".concat(updateError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: statement,
              message: "Statement status updated successfully",
            }),
          ];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_3 = _e.sent();
          console.error("Error in bank reconciliation PUT:", error_3);
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
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/bank-reconciliation
 * Delete bank statements or reconciliation rules
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, body, action, ids, _b, deleteError, deleteError, error_4;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, , 11]);
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
          (action = body.action), (ids = body.ids);
          if (!action || !ids || !Array.isArray(ids)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Action and IDs array are required" },
                { status: 400 },
              ),
            ];
          }
          _b = action;
          switch (_b) {
            case "delete_statements":
              return [3 /*break*/, 4];
            case "delete_rules":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 4:
          return [
            4 /*yield*/,
            supabase.from("bank_statements").delete().in("id", ids).eq("created_by", user.id),
          ];
        case 5:
          deleteError = _c.sent().error;
          if (deleteError) {
            throw new Error("Failed to delete statements: ".concat(deleteError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Successfully deleted ".concat(ids.length, " bank statements"),
            }),
          ];
        case 6:
          return [
            4 /*yield*/,
            supabase.from("reconciliation_rules").delete().in("id", ids).eq("created_by", user.id),
          ];
        case 7:
          deleteError = _c.sent().error;
          if (deleteError) {
            throw new Error("Failed to delete rules: ".concat(deleteError.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Successfully deleted ".concat(ids.length, " reconciliation rules"),
            }),
          ];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_4 = _c.sent();
          console.error("Error in bank reconciliation DELETE:", error_4);
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
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
