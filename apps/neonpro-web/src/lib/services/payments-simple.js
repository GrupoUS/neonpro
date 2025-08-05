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
  PaymentsService.prototype.createPayment = function (paymentData) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUser, insertData, _a, data, error, error_1;
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
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            if (!(paymentData.status === "completed")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.updatePayablePaidAmount(paymentData.accounts_payable_id)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [2 /*return*/, data];
          case 5:
            error_1 = _b.sent();
            console.error("Error creating payment:", error_1);
            throw new Error("Falha ao criar pagamento");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.processBulkPayments = function (bulkData) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUser_1, payments, _a, data, error, _i, _b, payment, error_2;
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
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
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
            error_2 = _c.sent();
            console.error("Error processing bulk payments:", error_2);
            throw new Error("Falha ao processar pagamentos em lote");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PaymentsService.prototype.updatePayablePaidAmount = function (payableId) {
    return __awaiter(this, void 0, void 0, function () {
      var payments, totalPaid, error_3;
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
            error_3 = _a.sent();
            console.error("Error updating payable paid amount:", error_3);
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
