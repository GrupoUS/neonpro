var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createpaymentsService = exports.PaymentsService = void 0;
var client_1 = require("@/lib/supabase/client");
var PaymentsService = /** @class */ (() => {
  function PaymentsService() {
    this.supabase = (0, client_1.createClient)();
  }
  PaymentsService.prototype.getAllPayments = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_2, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select(
                  "\n          *,\n          accounts_payable:accounts_payable_id (\n            id,\n            invoice_number,\n            vendor_name,\n            net_amount\n          )\n        ",
                )
                .order("payment_date", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_2 = _a.error);
            if (error_2) throw error_2;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((payment) => {
                    var _a, _b;
                    return __assign(__assign({}, payment), {
                      vendor_name:
                        (_a = payment.accounts_payable) === null || _a === void 0
                          ? void 0
                          : _a.vendor_name,
                      invoice_number:
                        (_b = payment.accounts_payable) === null || _b === void 0
                          ? void 0
                          : _b.invoice_number,
                    });
                  })) || [],
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Error fetching payments:", error_1);
            throw new Error("Falha ao carregar pagamentos");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.getPaymentById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_4, error_3;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select(
                  "\n          *,\n          accounts_payable:accounts_payable_id (\n            id,\n            invoice_number,\n            vendor_name,\n            net_amount\n          )\n        ",
                )
                .eq("id", id)
                .single(),
            ];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error_4 = _a.error);
            if (error_4) throw error_4;
            if (!data) return [2 /*return*/, null];
            return [
              2 /*return*/,
              __assign(__assign({}, data), {
                vendor_name:
                  (_b = data.accounts_payable) === null || _b === void 0 ? void 0 : _b.vendor_name,
                invoice_number:
                  (_c = data.accounts_payable) === null || _c === void 0
                    ? void 0
                    : _c.invoice_number,
              }),
            ];
          case 2:
            error_3 = _d.sent();
            console.error("Error fetching payment:", error_3);
            throw new Error("Falha ao carregar pagamento");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.getPaymentsByPayableId = function (payableId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_6, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select("*")
                .eq("accounts_payable_id", payableId)
                .order("payment_date", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_6 = _a.error);
            if (error_6) throw error_6;
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching payments for payable:", error_5);
            throw new Error("Falha ao carregar histórico de pagamentos");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.createPayment = function (paymentData) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUser, insertData, _a, data, error_8, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.supabase.auth.getUser()];
          case 1:
            currentUser = _b.sent().data;
            if (!currentUser.user) throw new Error("Usuário não autenticado");
            insertData = __assign(__assign({}, paymentData), {
              created_by: currentUser.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              this.supabase.from("ap_payments").insert([insertData]).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error_8 = _a.error);
            if (error_8) throw error_8;
            if (!(paymentData.status === "completed")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.updatePayablePaidAmount(paymentData.accounts_payable_id)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [2 /*return*/, data];
          case 5:
            error_7 = _b.sent();
            console.error("Error creating payment:", error_7);
            throw new Error("Falha ao criar pagamento");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.processBulkPayments = function (bulkData) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUser_1, payments, _a, data, error_10, _i, _b, payment, error_9;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.supabase.auth.getUser()];
          case 1:
            currentUser_1 = _c.sent().data;
            if (!currentUser_1.user) throw new Error("Usuário não autenticado");
            payments = bulkData.payments.map((payment) => ({
              accounts_payable_id: payment.accounts_payable_id,
              payment_date: bulkData.payment_date,
              amount_paid: payment.amount_paid,
              payment_method: bulkData.payment_method,
              reference_number: "BULK".concat(Date.now()),
              notes: bulkData.notes || "Pagamento em lote",
              status: "completed",
              created_by: currentUser_1.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            return [4 /*yield*/, this.supabase.from("ap_payments").insert(payments).select()];
          case 2:
            (_a = _c.sent()), (data = _a.data), (error_10 = _a.error);
            if (error_10) throw error_10;
            (_i = 0), (_b = bulkData.payments);
            _c.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 6];
            payment = _b[_i];
            return [4 /*yield*/, this.updatePayablePaidAmount(payment.accounts_payable_id)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/, data || []];
          case 7:
            error_9 = _c.sent();
            console.error("Error processing bulk payments:", error_9);
            throw new Error("Falha ao processar pagamentos em lote");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.updatePayment = function (id, updateData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_12, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .update(
                  __assign(__assign({}, updateData), { updated_at: new Date().toISOString() }),
                )
                .eq("id", id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_12 = _a.error);
            if (error_12) throw error_12;
            if (!(updateData.status && data.accounts_payable_id)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.updatePayablePaidAmount(data.accounts_payable_id)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, data];
          case 4:
            error_11 = _b.sent();
            console.error("Error updating payment:", error_11);
            throw new Error("Falha ao atualizar pagamento");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.deletePayment = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var payment, error_14, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getPaymentById(id)];
          case 1:
            payment = _a.sent();
            if (!payment) throw new Error("Pagamento não encontrado");
            return [4 /*yield*/, this.supabase.from("ap_payments").delete().eq("id", id)];
          case 2:
            error_14 = _a.sent().error;
            if (error_14) throw error_14;
            if (!payment.accounts_payable_id) return [3 /*break*/, 4];
            return [4 /*yield*/, this.updatePayablePaidAmount(payment.accounts_payable_id)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_13 = _a.sent();
            console.error("Error deleting payment:", error_13);
            throw new Error("Falha ao deletar pagamento");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.getPaymentSummary = function (dateFrom, dateTo) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        data,
        error_16,
        payments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalAmount,
        averageAmount,
        paymentMethods_1,
        error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("ap_payments").select("*");
            if (dateFrom) {
              query = query.gte("payment_date", dateFrom);
            }
            if (dateTo) {
              query = query.lte("payment_date", dateTo);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_16 = _a.error);
            if (error_16) throw error_16;
            payments = data || [];
            completedPayments = payments.filter((p) => p.status === "completed");
            pendingPayments = payments.filter((p) => p.status === "pending");
            failedPayments = payments.filter((p) => p.status === "failed");
            totalAmount = completedPayments.reduce((sum, p) => sum + p.amount_paid, 0);
            averageAmount =
              completedPayments.length > 0 ? totalAmount / completedPayments.length : 0;
            paymentMethods_1 = {};
            completedPayments.forEach((payment) => {
              paymentMethods_1[payment.payment_method] =
                (paymentMethods_1[payment.payment_method] || 0) + 1;
            });
            return [
              2 /*return*/,
              {
                total_payments: payments.length,
                total_amount: totalAmount,
                completed_payments: completedPayments.length,
                pending_payments: pendingPayments.length,
                failed_payments: failedPayments.length,
                average_payment_amount: averageAmount,
                payment_methods: paymentMethods_1,
              },
            ];
          case 2:
            error_15 = _b.sent();
            console.error("Error getting payment summary:", error_15);
            throw new Error("Falha ao carregar resumo de pagamentos");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.searchPayments = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_18, error_17;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select(
                  "\n          *,\n          accounts_payable:accounts_payable_id (\n            id,\n            invoice_number,\n            vendor_name,\n            net_amount\n          )\n        ",
                )
                .or("reference_number.ilike.%".concat(query, "%,notes.ilike.%").concat(query, "%"))
                .order("payment_date", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_18 = _a.error);
            if (error_18) throw error_18;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((payment) => {
                    var _a, _b;
                    return __assign(__assign({}, payment), {
                      vendor_name:
                        (_a = payment.accounts_payable) === null || _a === void 0
                          ? void 0
                          : _a.vendor_name,
                      invoice_number:
                        (_b = payment.accounts_payable) === null || _b === void 0
                          ? void 0
                          : _b.invoice_number,
                    });
                  })) || [],
            ];
          case 2:
            error_17 = _b.sent();
            console.error("Error searching payments:", error_17);
            throw new Error("Falha ao pesquisar pagamentos");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.getOverduePayables = function () {
    return __awaiter(this, void 0, void 0, function () {
      var today, _a, data, error_20, error_19;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            today = new Date().toISOString().split("T")[0];
            return [
              4 /*yield*/,
              this.supabase
                .from("accounts_payable")
                .select("*")
                .lt("due_date", today)
                .neq("status", "paid")
                .order("due_date", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_20 = _a.error);
            if (error_20) throw error_20;
            return [2 /*return*/, data || []];
          case 2:
            error_19 = _b.sent();
            console.error("Error fetching overdue payables:", error_19);
            throw new Error("Falha ao carregar contas em atraso");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.getPaymentsByDateRange = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error_22, error_21;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select(
                  "\n          *,\n          accounts_payable:accounts_payable_id (\n            id,\n            invoice_number,\n            vendor_name,\n            net_amount\n          )\n        ",
                )
                .gte("payment_date", startDate)
                .lte("payment_date", endDate)
                .order("payment_date", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error_22 = _a.error);
            if (error_22) throw error_22;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((payment) => {
                    var _a, _b;
                    return __assign(__assign({}, payment), {
                      vendor_name:
                        (_a = payment.accounts_payable) === null || _a === void 0
                          ? void 0
                          : _a.vendor_name,
                      invoice_number:
                        (_b = payment.accounts_payable) === null || _b === void 0
                          ? void 0
                          : _b.invoice_number,
                    });
                  })) || [],
            ];
          case 2:
            error_21 = _b.sent();
            console.error("Error fetching payments by date range:", error_21);
            throw new Error("Falha ao carregar pagamentos por período");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.updatePayablePaidAmount = function (payableId) {
    return __awaiter(this, void 0, void 0, function () {
      var payments, totalPaid, error_23;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ap_payments")
                .select("amount_paid")
                .eq("accounts_payable_id", payableId)
                .eq("status", "completed"),
            ];
          case 1:
            payments = _a.sent().data;
            totalPaid =
              (payments === null || payments === void 0
                ? void 0
                : payments.reduce((sum, p) => sum + p.amount_paid, 0)) || 0;
            // Update the accounts payable record
            return [
              4 /*yield*/,
              this.supabase
                .from("accounts_payable")
                .update({
                  paid_amount: totalPaid,
                  status: totalPaid > 0 ? "partial" : "pending",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", payableId),
            ];
          case 2:
            // Update the accounts payable record
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_23 = _a.sent();
            console.error("Error updating payable paid amount:", error_23);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return PaymentsService;
})();
exports.PaymentsService = PaymentsService;
// Export singleton instance
var createpaymentsService = () => new PaymentsService();
exports.createpaymentsService = createpaymentsService;
