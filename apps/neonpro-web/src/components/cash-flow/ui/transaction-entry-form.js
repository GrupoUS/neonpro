// Transaction Entry Form - Add/Edit cash flow transactions
// Following financial dashboard patterns from Context7 research
"use client";
"use strict";
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
exports.TransactionEntryForm = TransactionEntryForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var validation_1 = require("../utils/validation");
var use_cash_flow_1 = require("../hooks/use-cash-flow");
var use_cash_registers_1 = require("../hooks/use-cash-registers");
var calculations_1 = require("../utils/calculations");
function TransactionEntryForm(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    userId = _a.userId,
    onSuccess = _a.onSuccess,
    onCancel = _a.onCancel;
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var createEntry = (0, use_cash_flow_1.useCashFlow)(clinicId).createEntry;
  var registers = (0, use_cash_registers_1.useCashRegisters)(clinicId).registers;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(validation_1.CashFlowEntrySchema),
    defaultValues: {
      clinic_id: clinicId,
      created_by: userId,
      currency: "BRL",
      transaction_type: "receipt",
      category: "service_payment",
      payment_method: "cash",
    },
  });
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var entryData, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsSubmitting(true);
            entryData = __assign(__assign({}, data), {
              reference_number:
                data.reference_number ||
                (0, calculations_1.generateReferenceNumber)(data.transaction_type),
            });
            return [4 /*yield*/, createEntry(entryData)];
          case 1:
            _a.sent();
            sonner_1.toast.success("Transação criada com sucesso!");
            form.reset();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error creating transaction:", error_1);
            sonner_1.toast.error("Erro ao criar transação");
            return [3 /*break*/, 4];
          case 3:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <card_1.Card className="w-full max-w-2xl">
      <card_1.CardHeader>
        <card_1.CardTitle>Nova Transação</card_1.CardTitle>
        <card_1.CardDescription>Registre uma nova movimentação financeira</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="transaction_type"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Tipo de Transação</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o tipo" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="receipt">Recebimento</select_1.SelectItem>
                          <select_1.SelectItem value="payment">Pagamento</select_1.SelectItem>
                          <select_1.SelectItem value="transfer">Transferência</select_1.SelectItem>
                          <select_1.SelectItem value="adjustment">Ajuste</select_1.SelectItem>
                          <select_1.SelectItem value="opening_balance">
                            Saldo Inicial
                          </select_1.SelectItem>
                          <select_1.SelectItem value="closing_balance">
                            Saldo Final
                          </select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="category"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Categoria</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione a categoria" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="service_payment">
                            Pagamento de Serviço
                          </select_1.SelectItem>
                          <select_1.SelectItem value="product_sale">
                            Venda de Produto
                          </select_1.SelectItem>
                          <select_1.SelectItem value="expense">Despesa</select_1.SelectItem>
                          <select_1.SelectItem value="tax">Taxa/Imposto</select_1.SelectItem>
                          <select_1.SelectItem value="fee">Tarifa</select_1.SelectItem>
                          <select_1.SelectItem value="refund">Reembolso</select_1.SelectItem>
                          <select_1.SelectItem value="other">Outros</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="amount"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Valor</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                          onChange={function (e) {
                            return field.onChange(parseFloat(e.target.value));
                          }}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="payment_method"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Forma de Pagamento</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione a forma" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="cash">Dinheiro</select_1.SelectItem>
                          <select_1.SelectItem value="credit_card">
                            Cartão de Crédito
                          </select_1.SelectItem>
                          <select_1.SelectItem value="debit_card">
                            Cartão de Débito
                          </select_1.SelectItem>
                          <select_1.SelectItem value="pix">PIX</select_1.SelectItem>
                          <select_1.SelectItem value="bank_transfer">
                            Transferência
                          </select_1.SelectItem>
                          <select_1.SelectItem value="check">Cheque</select_1.SelectItem>
                          <select_1.SelectItem value="other">Outros</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>{" "}
            <form_1.FormField
              control={form.control}
              name="register_id"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Caixa</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o caixa" />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {registers.map(function (register) {
                          return (
                            <select_1.SelectItem key={register.id} value={register.id}>
                              {register.register_name} -{" "}
                              {(0, calculations_1.formatCurrency)(register.current_balance)}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />
            <form_1.FormField
              control={form.control}
              name="description"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Descrição</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea
                        placeholder="Digite a descrição da transação..."
                        className="resize-none"
                        {...field}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />
            <form_1.FormField
              control={form.control}
              name="reference_number"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Número de Referência (Opcional)</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Ex: NF-123456, REC-789" {...field} />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />
            <div className="flex justify-end gap-3 pt-4">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Transação"}
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
