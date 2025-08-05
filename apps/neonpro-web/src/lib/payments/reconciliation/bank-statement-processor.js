"use strict";
// NeonPro - Bank Statement Processor
// Story 6.1 - Task 4: Bank Reconciliation System
// Automated bank statement import and processing service
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankStatementProcessor = void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var papaparse_1 = require("papaparse");
// Validation schemas
var BankStatementFileSchema = zod_1.z.object({
  bankName: zod_1.z.string().min(1, "Bank name is required"),
  accountNumber: zod_1.z.string().min(1, "Account number is required"),
  statementDate: zod_1.z.string().datetime(),
  openingBalance: zod_1.z.number(),
  closingBalance: zod_1.z.number(),
  statementPeriodStart: zod_1.z.string().datetime(),
  statementPeriodEnd: zod_1.z.string().datetime(),
  filePath: zod_1.z.string().optional(),
});
var BankTransactionFileSchema = zod_1.z.object({
  date: zod_1.z.string(),
  description: zod_1.z.string().min(1, "Description is required"),
  reference: zod_1.z.string().optional(),
  debit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
  credit: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
  balance: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
  category: zod_1.z.string().optional(),
});
var ProcessingOptionsSchema = zod_1.z.object({
  skipDuplicates: zod_1.z.boolean().default(true),
  autoMatch: zod_1.z.boolean().default(true),
  dateFormat: zod_1.z.string().default("YYYY-MM-DD"),
  encoding: zod_1.z.string().default("utf-8"),
  delimiter: zod_1.z.string().default(","),
  hasHeader: zod_1.z.boolean().default(true),
});
var BankStatementProcessor = /** @class */ (function () {
  function BankStatementProcessor() {
    this.supabase = (0, client_1.createClient)();
    this.parsers = new Map();
    this.initializeParsers();
  }
  BankStatementProcessor.prototype.initializeParsers = function () {
    // Bradesco parser
    this.parsers.set("bradesco", {
      name: "Bradesco",
      patterns: ["bradesco", "banco bradesco"],
      parseStatement: this.parseBradescoStatement.bind(this),
    });
    // Itaú parser
    this.parsers.set("itau", {
      name: "Itaú",
      patterns: ["itau", "banco itau", "itaú"],
      parseStatement: this.parseItauStatement.bind(this),
    });
    // Santander parser
    this.parsers.set("santander", {
      name: "Santander",
      patterns: ["santander", "banco santander"],
      parseStatement: this.parseSantanderStatement.bind(this),
    });
    // Generic CSV parser
    this.parsers.set("generic", {
      name: "Generic CSV",
      patterns: ["csv", "generic"],
      parseStatement: this.parseGenericCSV.bind(this),
    });
  };
  /**
   * Process bank statement file
   */
  BankStatementProcessor.prototype.processStatementFile = function (file_1, fileName_1) {
    return __awaiter(this, arguments, void 0, function (file, fileName, options) {
      var processingOptions, content, parser, parseResult, result, error_1;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            processingOptions = ProcessingOptionsSchema.parse(options);
            return [4 /*yield*/, this.readFileContent(file)];
          case 1:
            content = _a.sent();
            parser = this.detectBankParser(fileName, content);
            parseResult = parser.parseStatement(content, processingOptions);
            if (parseResult.errors.length > 0) {
              return [
                2 /*return*/,
                {
                  success: false,
                  processedTransactions: 0,
                  skippedTransactions: 0,
                  errors: parseResult.errors,
                  warnings: parseResult.warnings,
                  summary: {
                    totalCredits: 0,
                    totalDebits: 0,
                    balanceCheck: false,
                  },
                },
              ];
            }
            return [
              4 /*yield*/,
              this.processStatement(
                parseResult.header,
                parseResult.transactions,
                fileName,
                processingOptions,
              ),
            ];
          case 2:
            result = _a.sent();
            return [
              2 /*return*/,
              __assign(__assign({}, result), {
                warnings: __spreadArray(
                  __spreadArray([], result.warnings, true),
                  parseResult.warnings,
                  true,
                ),
              }),
            ];
          case 3:
            error_1 = _a.sent();
            console.error("Error processing statement file:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                processedTransactions: 0,
                skippedTransactions: 0,
                errors: [error_1 instanceof Error ? error_1.message : "Unknown error"],
                warnings: [],
                summary: {
                  totalCredits: 0,
                  totalDebits: 0,
                  balanceCheck: false,
                },
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process multiple statement files
   */
  BankStatementProcessor.prototype.processBatchFiles = function (files_1) {
    return __awaiter(this, arguments, void 0, function (files, options) {
      var results, _i, files_2, _a, file, fileName, result;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            results = [];
            (_i = 0), (files_2 = files);
            _b.label = 1;
          case 1:
            if (!(_i < files_2.length)) return [3 /*break*/, 4];
            (_a = files_2[_i]), (file = _a.file), (fileName = _a.fileName);
            return [4 /*yield*/, this.processStatementFile(file, fileName, options)];
          case 2:
            result = _b.sent();
            results.push(result);
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Get processing summary for multiple files
   */
  BankStatementProcessor.prototype.getBatchSummary = function (results) {
    return {
      totalFiles: results.length,
      successfulFiles: results.filter(function (r) {
        return r.success;
      }).length,
      failedFiles: results.filter(function (r) {
        return !r.success;
      }).length,
      totalTransactions: results.reduce(function (sum, r) {
        return sum + r.processedTransactions;
      }, 0),
      totalSkipped: results.reduce(function (sum, r) {
        return sum + r.skippedTransactions;
      }, 0),
      totalErrors: results.reduce(function (sum, r) {
        return sum + r.errors.length;
      }, 0),
      totalWarnings: results.reduce(function (sum, r) {
        return sum + r.warnings.length;
      }, 0),
    };
  };
  BankStatementProcessor.prototype.readFileContent = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (file instanceof Buffer) {
          return [2 /*return*/, file.toString("utf-8")];
        }
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var _a;
              return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
            };
            reader.onerror = function (e) {
              return reject(new Error("Failed to read file"));
            };
            reader.readAsText(file);
          }),
        ];
      });
    });
  };
  BankStatementProcessor.prototype.detectBankParser = function (fileName, content) {
    var lowerFileName = fileName.toLowerCase();
    var lowerContent = content.toLowerCase();
    for (var _i = 0, _a = this.parsers; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        parser = _b[1];
      if (key === "generic") continue; // Skip generic parser in detection
      var matches = parser.patterns.some(function (pattern) {
        return lowerFileName.includes(pattern) || lowerContent.includes(pattern);
      });
      if (matches) {
        return parser;
      }
    }
    // Default to generic parser
    return this.parsers.get("generic");
  };
  BankStatementProcessor.prototype.parseBradescoStatement = function (content, options) {
    var errors = [];
    var warnings = [];
    try {
      // Bradesco-specific parsing logic
      var lines = content.split("\n");
      // Extract header information
      var header = {
        bankName: "Bradesco",
        accountNumber: this.extractAccountNumber(lines, "bradesco"),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, "opening", "bradesco"),
        closingBalance: this.extractBalance(lines, "closing", "bradesco"),
        statementPeriodStart: this.extractPeriodStart(lines, "bradesco"),
        statementPeriodEnd: this.extractPeriodEnd(lines, "bradesco"),
      };
      // Parse transactions
      var transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, "bradesco")),
        "bradesco",
        options,
      );
      return { header: header, transactions: transactions, errors: errors, warnings: warnings };
    } catch (error) {
      errors.push(
        "Bradesco parsing error: ".concat(error instanceof Error ? error.message : "Unknown error"),
      );
      return {
        header: {},
        transactions: [],
        errors: errors,
        warnings: warnings,
      };
    }
  };
  BankStatementProcessor.prototype.parseItauStatement = function (content, options) {
    var errors = [];
    var warnings = [];
    try {
      // Itaú-specific parsing logic
      var lines = content.split("\n");
      var header = {
        bankName: "Itaú",
        accountNumber: this.extractAccountNumber(lines, "itau"),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, "opening", "itau"),
        closingBalance: this.extractBalance(lines, "closing", "itau"),
        statementPeriodStart: this.extractPeriodStart(lines, "itau"),
        statementPeriodEnd: this.extractPeriodEnd(lines, "itau"),
      };
      var transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, "itau")),
        "itau",
        options,
      );
      return { header: header, transactions: transactions, errors: errors, warnings: warnings };
    } catch (error) {
      errors.push(
        "Ita\u00FA parsing error: ".concat(
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
      return {
        header: {},
        transactions: [],
        errors: errors,
        warnings: warnings,
      };
    }
  };
  BankStatementProcessor.prototype.parseSantanderStatement = function (content, options) {
    var errors = [];
    var warnings = [];
    try {
      // Santander-specific parsing logic
      var lines = content.split("\n");
      var header = {
        bankName: "Santander",
        accountNumber: this.extractAccountNumber(lines, "santander"),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, "opening", "santander"),
        closingBalance: this.extractBalance(lines, "closing", "santander"),
        statementPeriodStart: this.extractPeriodStart(lines, "santander"),
        statementPeriodEnd: this.extractPeriodEnd(lines, "santander"),
      };
      var transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, "santander")),
        "santander",
        options,
      );
      return { header: header, transactions: transactions, errors: errors, warnings: warnings };
    } catch (error) {
      errors.push(
        "Santander parsing error: ".concat(
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
      return {
        header: {},
        transactions: [],
        errors: errors,
        warnings: warnings,
      };
    }
  };
  BankStatementProcessor.prototype.parseGenericCSV = function (content, options) {
    var errors = [];
    var warnings = [];
    try {
      var parseResult = papaparse_1.default.parse(content, {
        header: options.hasHeader,
        delimiter: options.delimiter,
        skipEmptyLines: true,
      });
      if (parseResult.errors.length > 0) {
        errors.push.apply(
          errors,
          parseResult.errors.map(function (e) {
            return e.message;
          }),
        );
      }
      var data = parseResult.data;
      if (data.length === 0) {
        errors.push("No data found in CSV file");
        return { header: {}, transactions: [], errors: errors, warnings: warnings };
      }
      // Try to detect header information from first few rows or use defaults
      var header = {
        bankName: "Generic Bank",
        accountNumber: "Unknown",
        statementDate: new Date().toISOString(),
        openingBalance: 0,
        closingBalance: 0,
        statementPeriodStart: new Date().toISOString(),
        statementPeriodEnd: new Date().toISOString(),
      };
      // Parse transactions from CSV data
      var transactions = [];
      for (var i = 0; i < data.length; i++) {
        try {
          var row = data[i];
          var transaction = this.parseCSVRow(row, options);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          warnings.push(
            "Row "
              .concat(i + 1, ": ")
              .concat(error instanceof Error ? error.message : "Parse error"),
          );
        }
      }
      return { header: header, transactions: transactions, errors: errors, warnings: warnings };
    } catch (error) {
      errors.push(
        "CSV parsing error: ".concat(error instanceof Error ? error.message : "Unknown error"),
      );
      return {
        header: {},
        transactions: [],
        errors: errors,
        warnings: warnings,
      };
    }
  };
  BankStatementProcessor.prototype.parseCSVRow = function (row, options) {
    // Handle both header and non-header CSV formats
    if (typeof row === "object" && row !== null) {
      // Header format
      return {
        date: row.date || row.Date || row.DATA || "",
        description: row.description || row.Description || row.DESCRICAO || "",
        reference: row.reference || row.Reference || row.REFERENCIA || "",
        debit: row.debit || row.Debit || row.DEBITO || "",
        credit: row.credit || row.Credit || row.CREDITO || "",
        balance: row.balance || row.Balance || row.SALDO || "",
        category: row.category || row.Category || row.CATEGORIA || "",
      };
    } else if (Array.isArray(row)) {
      // Non-header format - assume standard order
      return {
        date: row[0] || "",
        description: row[1] || "",
        reference: row[2] || "",
        debit: row[3] || "",
        credit: row[4] || "",
        balance: row[5] || "",
        category: row[6] || "",
      };
    }
    return null;
  };
  BankStatementProcessor.prototype.processStatement = function (
    header,
    transactions,
    fileName,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var errors,
        warnings,
        processedTransactions,
        skippedTransactions,
        totalCredits,
        totalDebits,
        validatedHeader,
        _a,
        statement,
        statementError,
        transactionInserts,
        _i,
        transactions_1,
        transaction,
        validatedTransaction,
        debitAmount,
        creditAmount,
        balance,
        transactionDate,
        transactionData,
        transactionError,
        updateError,
        expectedBalance,
        balanceCheck,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            errors = [];
            warnings = [];
            processedTransactions = 0;
            skippedTransactions = 0;
            totalCredits = 0;
            totalDebits = 0;
            _b.label = 1;
          case 1:
            _b.trys.push([1, 6, , 7]);
            validatedHeader = BankStatementFileSchema.parse(header);
            return [
              4 /*yield*/,
              this.supabase
                .from("bank_statements")
                .insert({
                  bank_name: validatedHeader.bankName,
                  account_number: validatedHeader.accountNumber,
                  statement_date: validatedHeader.statementDate,
                  opening_balance: validatedHeader.openingBalance,
                  closing_balance: validatedHeader.closingBalance,
                  statement_period_start: validatedHeader.statementPeriodStart,
                  statement_period_end: validatedHeader.statementPeriodEnd,
                  file_path: fileName,
                  import_status: "processing",
                })
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (statement = _a.data), (statementError = _a.error);
            if (statementError) {
              throw new Error("Failed to create statement: ".concat(statementError.message));
            }
            transactionInserts = [];
            for (_i = 0, transactions_1 = transactions; _i < transactions_1.length; _i++) {
              transaction = transactions_1[_i];
              try {
                validatedTransaction = BankTransactionFileSchema.parse(transaction);
                debitAmount = this.parseAmount(validatedTransaction.debit);
                creditAmount = this.parseAmount(validatedTransaction.credit);
                balance = this.parseAmount(validatedTransaction.balance);
                if (!debitAmount && !creditAmount) {
                  warnings.push(
                    "Transaction skipped - no amount: ".concat(validatedTransaction.description),
                  );
                  skippedTransactions++;
                  continue;
                }
                transactionDate = this.parseDate(validatedTransaction.date, options.dateFormat);
                if (!transactionDate) {
                  warnings.push(
                    "Transaction skipped - invalid date: ".concat(validatedTransaction.date),
                  );
                  skippedTransactions++;
                  continue;
                }
                transactionData = {
                  statement_id: statement.id,
                  transaction_date: transactionDate.toISOString(),
                  description: validatedTransaction.description,
                  reference_number: validatedTransaction.reference || null,
                  debit_amount: debitAmount,
                  credit_amount: creditAmount,
                  balance: balance || 0,
                  transaction_type: debitAmount ? "debit" : "credit",
                  category: validatedTransaction.category || null,
                };
                transactionInserts.push(transactionData);
                if (debitAmount) totalDebits += debitAmount;
                if (creditAmount) totalCredits += creditAmount;
                processedTransactions++;
              } catch (error) {
                warnings.push(
                  "Transaction validation error: ".concat(
                    error instanceof Error ? error.message : "Unknown error",
                  ),
                );
                skippedTransactions++;
              }
            }
            if (!(transactionInserts.length > 0)) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase.from("bank_transactions").insert(transactionInserts),
            ];
          case 3:
            transactionError = _b.sent().error;
            if (transactionError) {
              throw new Error("Failed to insert transactions: ".concat(transactionError.message));
            }
            _b.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.supabase
                .from("bank_statements")
                .update({
                  total_credits: totalCredits,
                  total_debits: totalDebits,
                  import_status: "completed",
                })
                .eq("id", statement.id),
            ];
          case 5:
            updateError = _b.sent().error;
            if (updateError) {
              warnings.push("Failed to update statement totals: ".concat(updateError.message));
            }
            expectedBalance = header.openingBalance + totalCredits - totalDebits;
            balanceCheck = Math.abs(expectedBalance - header.closingBalance) < 0.01;
            if (!balanceCheck) {
              warnings.push(
                "Balance mismatch: Expected ".concat(expectedBalance.toFixed(2), ", ") +
                  "Got ".concat(header.closingBalance.toFixed(2)),
              );
            }
            return [
              2 /*return*/,
              {
                success: true,
                statementId: statement.id,
                processedTransactions: processedTransactions,
                skippedTransactions: skippedTransactions,
                errors: errors,
                warnings: warnings,
                summary: {
                  totalCredits: totalCredits,
                  totalDebits: totalDebits,
                  balanceCheck: balanceCheck,
                },
              },
            ];
          case 6:
            error_2 = _b.sent();
            console.error("Error processing statement:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                processedTransactions: processedTransactions,
                skippedTransactions: skippedTransactions,
                errors: [error_2 instanceof Error ? error_2.message : "Unknown error"],
                warnings: warnings,
                summary: {
                  totalCredits: totalCredits,
                  totalDebits: totalDebits,
                  balanceCheck: false,
                },
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods for bank-specific parsing
  BankStatementProcessor.prototype.extractAccountNumber = function (lines, bank) {
    // Bank-specific account number extraction logic
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
      var line = lines_1[_i];
      var lowerLine = line.toLowerCase();
      if (lowerLine.includes("conta") || lowerLine.includes("account")) {
        var match = line.match(/\d{4,}/); // Find sequence of 4+ digits
        if (match) return match[0];
      }
    }
    return "Unknown";
  };
  BankStatementProcessor.prototype.extractBalance = function (lines, type, bank) {
    // Bank-specific balance extraction logic
    var searchTerms =
      type === "opening"
        ? ["saldo anterior", "opening balance", "saldo inicial"]
        : ["saldo final", "closing balance", "saldo atual"];
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
      var line = lines_2[_i];
      var lowerLine = line.toLowerCase();
      for (var _a = 0, searchTerms_1 = searchTerms; _a < searchTerms_1.length; _a++) {
        var term = searchTerms_1[_a];
        if (lowerLine.includes(term)) {
          var amount = this.parseAmount(line);
          if (amount !== null) return amount;
        }
      }
    }
    return 0;
  };
  BankStatementProcessor.prototype.extractPeriodStart = function (lines, bank) {
    // Extract statement period start date
    return new Date().toISOString(); // Placeholder
  };
  BankStatementProcessor.prototype.extractPeriodEnd = function (lines, bank) {
    // Extract statement period end date
    return new Date().toISOString(); // Placeholder
  };
  BankStatementProcessor.prototype.findTransactionStartLine = function (lines, bank) {
    // Find where transaction data starts
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].toLowerCase();
      if (line.includes("data") && line.includes("descri")) {
        return i + 1; // Skip header line
      }
    }
    return 0;
  };
  BankStatementProcessor.prototype.parseTransactionLines = function (lines, bank, options) {
    var transactions = [];
    for (var _i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
      var line = lines_3[_i];
      if (line.trim() === "") continue;
      // Bank-specific transaction parsing
      var transaction = this.parseTransactionLine(line, bank, options);
      if (transaction) {
        transactions.push(transaction);
      }
    }
    return transactions;
  };
  BankStatementProcessor.prototype.parseTransactionLine = function (line, bank, options) {
    // Basic transaction line parsing - would be customized per bank
    var parts = line.split(/\s{2,}|\t/); // Split on multiple spaces or tabs
    if (parts.length < 4) return null;
    return {
      date: parts[0] || "",
      description: parts[1] || "",
      reference: parts[2] || "",
      debit: parts[3] || "",
      credit: parts[4] || "",
      balance: parts[5] || "",
    };
  };
  BankStatementProcessor.prototype.parseAmount = function (value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "number") return value;
    // Clean up string value
    var cleaned = value
      .toString()
      .replace(/[^\d.,-]/g, "") // Remove non-numeric characters except . , -
      .replace(/,/g, ".") // Replace comma with dot
      .replace(/\.(?=.*\.)/g, ""); // Remove all but last dot
    var parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };
  BankStatementProcessor.prototype.parseDate = function (dateStr, format) {
    if (!dateStr) return null;
    // Try different date formats
    var formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    ];
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
      var formatRegex = formats_1[_i];
      var match = dateStr.match(formatRegex);
      if (match) {
        var part1 = match[1],
          part2 = match[2],
          part3 = match[3];
        // Determine if it's YYYY-MM-DD or DD/MM/YYYY format
        if (part1.length === 4) {
          // YYYY-MM-DD
          var date_1 = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
          if (!isNaN(date_1.getTime())) return date_1;
        } else {
          // DD/MM/YYYY
          var date_2 = new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
          if (!isNaN(date_2.getTime())) return date_2;
        }
      }
    }
    // Fallback to Date constructor
    var date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };
  return BankStatementProcessor;
})();
exports.BankStatementProcessor = BankStatementProcessor;
