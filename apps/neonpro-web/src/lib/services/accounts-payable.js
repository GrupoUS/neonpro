"use strict";
// lib/services/accounts-payable.ts
// Service layer for accounts payable management
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsPayableService = void 0;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
var AccountsPayableService = /** @class */ (function () {
  function AccountsPayableService() {}
  /**
   * Get all accounts payable with optional filtering
   */
  AccountsPayableService.getAccountsPayable = function (filters_1) {
    return __awaiter(this, arguments, void 0, function (filters, page, pageSize) {
      var query, from, to, _a, accounts_payable, error, count, error_1;
      if (page === void 0) {
        page = 1;
      }
      if (pageSize === void 0) {
        pageSize = 20;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("accounts_payable")
              .select(
                "\n          *,\n          vendor:vendors(*),\n          expense_category:expense_categories(*)\n        ",
                { count: "exact" },
              )
              .is("deleted_at", null)
              .order("due_date", { ascending: true });
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
              query = query.or(
                "ap_number.ilike.%"
                  .concat(filters.search, "%,invoice_number.ilike.%")
                  .concat(filters.search, "%,description.ilike.%")
                  .concat(filters.search, "%"),
              );
            }
            if (filters === null || filters === void 0 ? void 0 : filters.vendor_id) {
              query = query.eq("vendor_id", filters.vendor_id);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.priority) {
              query = query.eq("priority", filters.priority);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.expense_category_id) {
              query = query.eq("expense_category_id", filters.expense_category_id);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.due_date_from) {
              query = query.gte("due_date", filters.due_date_from);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.due_date_to) {
              query = query.lte("due_date", filters.due_date_to);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.overdue_only) {
              query = query
                .lt("due_date", new Date().toISOString().split("T")[0])
                .in("status", ["pending", "approved", "scheduled"]);
            }
            from = (page - 1) * pageSize;
            to = from + pageSize - 1;
            query = query.range(from, to);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (accounts_payable = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              console.error("Error fetching accounts payable:", error);
              throw new Error("Failed to fetch accounts payable: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                accounts_payable: accounts_payable || [],
                total: count || 0,
              },
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Error in getAccountsPayable:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get accounts payable by ID
   */
  AccountsPayableService.getAccountsPayableById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, ap, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("accounts_payable")
                .select(
                  "\n          *,\n          vendor:vendors(*),\n          expense_category:expense_categories(*)\n        ",
                )
                .eq("id", id)
                .is("deleted_at", null)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (ap = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") {
                return [2 /*return*/, null]; // AP not found
              }
              console.error("Error fetching accounts payable:", error);
              throw new Error("Failed to fetch accounts payable: ".concat(error.message));
            }
            return [2 /*return*/, ap];
          case 2:
            error_2 = _b.sent();
            console.error("Error in getAccountsPayableById:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create new accounts payable
   */
  AccountsPayableService.createAccountsPayable = function (apData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, ap, error, _b, _c, _d, error_3;
      var _e;
      var _f;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 3, , 4]);
            _c = (_b = supabase.from("accounts_payable")).insert;
            _d = [__assign({}, apData)];
            _e = {};
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _c
                .apply(_b, [
                  [
                    __assign.apply(
                      void 0,
                      _d.concat([
                        ((_e.created_by =
                          (_f = _g.sent().data.user) === null || _f === void 0 ? void 0 : _f.id),
                        _e),
                      ]),
                    ),
                  ],
                ])
                .select(
                  "\n          *,\n          vendor:vendors(*),\n          expense_category:expense_categories(*)\n        ",
                )
                .single(),
            ];
          case 2:
            (_a = _g.sent()), (ap = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating accounts payable:", error);
              throw new Error("Failed to create accounts payable: ".concat(error.message));
            }
            return [2 /*return*/, ap];
          case 3:
            error_3 = _g.sent();
            console.error("Error in createAccountsPayable:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update existing accounts payable
   */
  AccountsPayableService.updateAccountsPayable = function (id, apData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, ap, error, _b, _c, _d, error_4;
      var _e;
      var _f;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 3, , 4]);
            _c = (_b = supabase.from("accounts_payable")).update;
            _d = [__assign({}, apData)];
            _e = {};
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _c
                .apply(_b, [
                  __assign.apply(
                    void 0,
                    _d.concat([
                      ((_e.updated_by =
                        (_f = _g.sent().data.user) === null || _f === void 0 ? void 0 : _f.id),
                      (_e.updated_at = new Date().toISOString()),
                      _e),
                    ]),
                  ),
                ])
                .eq("id", id)
                .is("deleted_at", null)
                .select(
                  "\n          *,\n          vendor:vendors(*),\n          expense_category:expense_categories(*)\n        ",
                )
                .single(),
            ];
          case 2:
            (_a = _g.sent()), (ap = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating accounts payable:", error);
              throw new Error("Failed to update accounts payable: ".concat(error.message));
            }
            return [2 /*return*/, ap];
          case 3:
            error_4 = _g.sent();
            console.error("Error in updateAccountsPayable:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Soft delete accounts payable
   */
  AccountsPayableService.deleteAccountsPayable = function (id, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, _a, _b, error_5;
      var _c;
      var _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 3, , 4]);
            _b = (_a = supabase.from("accounts_payable")).update;
            _c = {
              deleted_at: new Date().toISOString(),
            };
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            return [
              4 /*yield*/,
              _b
                .apply(_a, [
                  ((_c.deleted_by =
                    (_d = _e.sent().data.user) === null || _d === void 0 ? void 0 : _d.id),
                  (_c.deleted_reason = reason || "Deleted by user"),
                  (_c.updated_at = new Date().toISOString()),
                  _c),
                ])
                .eq("id", id),
            ];
          case 2:
            error = _e.sent().error;
            if (error) {
              console.error("Error deleting accounts payable:", error);
              throw new Error("Failed to delete accounts payable: ".concat(error.message));
            }
            return [3 /*break*/, 4];
          case 3:
            error_5 = _e.sent();
            console.error("Error in deleteAccountsPayable:", error_5);
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update accounts payable status
   */
  AccountsPayableService.updateStatus = function (id, status, notes) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, _b, ap, error, error_6;
      var _c;
      var _d, _e;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            _f.trys.push([0, 5, , 6]);
            _c = {
              status: status,
            };
            return [4 /*yield*/, supabase.auth.getUser()];
          case 1:
            updateData =
              ((_c.updated_by =
                (_d = _f.sent().data.user) === null || _d === void 0 ? void 0 : _d.id),
              (_c.updated_at = new Date().toISOString()),
              _c);
            if (!(status === "approved")) return [3 /*break*/, 3];
            updateData.approved_at = new Date().toISOString();
            _a = updateData;
            return [4 /*yield*/, supabase.auth.getUser()];
          case 2:
            _a.approved_by = (_e = _f.sent().data.user) === null || _e === void 0 ? void 0 : _e.id;
            if (notes) updateData.approval_notes = notes;
            _f.label = 3;
          case 3:
            return [
              4 /*yield*/,
              supabase
                .from("accounts_payable")
                .update(updateData)
                .eq("id", id)
                .is("deleted_at", null)
                .select(
                  "\n          *,\n          vendor:vendors(*),\n          expense_category:expense_categories(*)\n        ",
                )
                .single(),
            ];
          case 4:
            (_b = _f.sent()), (ap = _b.data), (error = _b.error);
            if (error) {
              console.error("Error updating AP status:", error);
              throw new Error("Failed to update AP status: ".concat(error.message));
            }
            return [2 /*return*/, ap];
          case 5:
            error_6 = _f.sent();
            console.error("Error in updateStatus:", error_6);
            throw error_6;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get accounts payable dashboard statistics
   */
  AccountsPayableService.getDashboardStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var today,
        _a,
        totalResult,
        pendingResult,
        overdueResult,
        dueTodayResult,
        totalAmountResult,
        totalOpenAmount,
        error_7;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            today = new Date().toISOString().split("T")[0];
            return [
              4 /*yield*/,
              Promise.all([
                supabase
                  .from("accounts_payable")
                  .select("id", { count: "exact", head: true })
                  .is("deleted_at", null),
                supabase
                  .from("accounts_payable")
                  .select("id", { count: "exact", head: true })
                  .in("status", ["pending", "approved"])
                  .is("deleted_at", null),
                supabase
                  .from("accounts_payable")
                  .select("id", { count: "exact", head: true })
                  .lt("due_date", today)
                  .in("status", ["pending", "approved", "scheduled"])
                  .is("deleted_at", null),
                supabase
                  .from("accounts_payable")
                  .select("id", { count: "exact", head: true })
                  .eq("due_date", today)
                  .in("status", ["pending", "approved", "scheduled"])
                  .is("deleted_at", null),
                supabase
                  .from("accounts_payable")
                  .select("balance_amount")
                  .in("status", ["pending", "approved", "scheduled"])
                  .is("deleted_at", null),
              ]),
            ];
          case 1:
            (_a = _c.sent()),
              (totalResult = _a[0]),
              (pendingResult = _a[1]),
              (overdueResult = _a[2]),
              (dueTodayResult = _a[3]),
              (totalAmountResult = _a[4]);
            totalOpenAmount =
              ((_b = totalAmountResult.data) === null || _b === void 0
                ? void 0
                : _b.reduce(function (sum, ap) {
                    return sum + (ap.balance_amount || 0);
                  }, 0)) || 0;
            return [
              2 /*return*/,
              {
                total: totalResult.count || 0,
                pending: pendingResult.count || 0,
                overdue: overdueResult.count || 0,
                dueToday: dueTodayResult.count || 0,
                totalOpenAmount: totalOpenAmount,
              },
            ];
          case 2:
            error_7 = _c.sent();
            console.error("Error in getDashboardStats:", error_7);
            return [
              2 /*return*/,
              {
                total: 0,
                pending: 0,
                overdue: 0,
                dueToday: 0,
                totalOpenAmount: 0,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get upcoming due dates for calendar view
   */
  AccountsPayableService.getUpcomingDueDates = function () {
    return __awaiter(this, arguments, void 0, function (days) {
      var today, endDate, _a, aps, error, error_8;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            today = new Date();
            endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("accounts_payable")
                .select(
                  "\n          *,\n          vendor:vendors(company_name),\n          expense_category:expense_categories(category_name)\n        ",
                )
                .gte("due_date", today.toISOString().split("T")[0])
                .lte("due_date", endDate.toISOString().split("T")[0])
                .in("status", ["pending", "approved", "scheduled"])
                .is("deleted_at", null)
                .order("due_date"),
            ];
          case 1:
            (_a = _b.sent()), (aps = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching upcoming due dates:", error);
              throw new Error("Failed to fetch upcoming due dates: ".concat(error.message));
            }
            return [2 /*return*/, aps || []];
          case 2:
            error_8 = _b.sent();
            console.error("Error in getUpcomingDueDates:", error_8);
            throw error_8;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate next AP number
   */
  AccountsPayableService.generateAPNumber = function () {
    return __awaiter(this, void 0, void 0, function () {
      var year, _a, data, error, lastNumber, numericPart, nextNumber, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            year = new Date().getFullYear().toString();
            return [
              4 /*yield*/,
              supabase
                .from("accounts_payable")
                .select("ap_number")
                .like("ap_number", "AP".concat(year, "-%"))
                .is("deleted_at", null)
                .order("ap_number", { ascending: false })
                .limit(1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error generating AP number:", error);
              return [2 /*return*/, "AP".concat(year, "-000001")];
            }
            if (!data || data.length === 0) {
              return [2 /*return*/, "AP".concat(year, "-000001")];
            }
            lastNumber = data[0].ap_number;
            numericPart = lastNumber.split("-")[1];
            nextNumber = parseInt(numericPart) + 1;
            return [
              2 /*return*/,
              "AP".concat(year, "-").concat(nextNumber.toString().padStart(6, "0")),
            ];
          case 2:
            error_9 = _b.sent();
            console.error("Error in generateAPNumber:", error_9);
            return [2 /*return*/, "AP".concat(new Date().getFullYear(), "-000001")];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate financial totals by status
   */
  AccountsPayableService.getFinancialSummary = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, aps, error, summary, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("accounts_payable")
                .select("status, balance_amount, net_amount")
                .is("deleted_at", null),
            ];
          case 1:
            (_a = _b.sent()), (aps = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching financial summary:", error);
              throw new Error("Failed to fetch financial summary: ".concat(error.message));
            }
            summary = aps.reduce(function (acc, ap) {
              if (!acc[ap.status]) {
                acc[ap.status] = { count: 0, totalAmount: 0, balanceAmount: 0 };
              }
              acc[ap.status].count++;
              acc[ap.status].totalAmount += ap.net_amount || 0;
              acc[ap.status].balanceAmount += ap.balance_amount || 0;
              return acc;
            }, {});
            return [2 /*return*/, summary];
          case 2:
            error_10 = _b.sent();
            console.error("Error in getFinancialSummary:", error_10);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AccountsPayableService;
})();
exports.AccountsPayableService = AccountsPayableService;
