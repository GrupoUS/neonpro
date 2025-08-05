"use client";
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
exports.default = PaymentSettings;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var switch_1 = require("@/components/ui/switch");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var paymentSettingsSchema = z.object({
  // PIX Configuration
  pix: z.object({
    enabled: z.boolean(),
    pixKey: z.string().optional(),
    merchantName: z.string().optional(),
    merchantCity: z.string().optional(),
    automaticConfirmation: z.boolean(),
    expirationMinutes: z.number().min(5).max(1440),
  }),
  // Credit/Debit Cards
  cards: z.object({
    enabled: z.boolean(),
    acceptCredit: z.boolean(),
    acceptDebit: z.boolean(),
    installments: z.object({
      enabled: z.boolean(),
      maxInstallments: z.number().min(1).max(12),
      minAmountPerInstallment: z.number().min(10),
      interestRate: z.number().min(0).max(10),
    }),
  }),
  // Bank Transfer
  bankTransfer: z.object({
    enabled: z.boolean(),
    bankName: z.string().optional(),
    accountType: z.enum(["corrente", "poupanca"]).optional(),
    agency: z.string().optional(),
    account: z.string().optional(),
    accountHolder: z.string().optional(),
    cpfCnpj: z.string().optional(),
  }),
  // Boleto
  boleto: z.object({
    enabled: z.boolean(),
    expirationDays: z.number().min(1).max(30),
    instructions: z.string().optional(),
    fine: z.number().min(0).max(10),
    interest: z.number().min(0).max(1),
  }),
  // Cash
  cash: z.object({
    enabled: z.boolean(),
    discountPercent: z.number().min(0).max(50),
  }),
  // Payment Terms
  paymentTerms: z.object({
    requireUpfrontPayment: z.boolean(),
    upfrontPercentage: z.number().min(0).max(100),
    allowPartialPayments: z.boolean(),
    lateFeePercentage: z.number().min(0).max(10),
    cancelationRefundPolicy: z.enum(["full", "partial", "none"]),
  }),
});
function PaymentSettings() {
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(false),
    isSaving = _b[0],
    setIsSaving = _b[1];
  var _c = (0, react_1.useState)(null),
    lastSaved = _c[0],
    setLastSaved = _c[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(paymentSettingsSchema),
    defaultValues: {
      pix: {
        enabled: true,
        pixKey: "",
        merchantName: "",
        merchantCity: "",
        automaticConfirmation: true,
        expirationMinutes: 30,
      },
      cards: {
        enabled: true,
        acceptCredit: true,
        acceptDebit: true,
        installments: {
          enabled: true,
          maxInstallments: 12,
          minAmountPerInstallment: 50,
          interestRate: 2.99,
        },
      },
      bankTransfer: {
        enabled: true,
        bankName: "",
        accountType: "corrente",
        agency: "",
        account: "",
        accountHolder: "",
        cpfCnpj: "",
      },
      boleto: {
        enabled: false,
        expirationDays: 3,
        instructions: "Não receber após o vencimento",
        fine: 2,
        interest: 0.033,
      },
      cash: {
        enabled: true,
        discountPercent: 5,
      },
      paymentTerms: {
        requireUpfrontPayment: false,
        upfrontPercentage: 50,
        allowPartialPayments: true,
        lateFeePercentage: 2,
        cancelationRefundPolicy: "partial",
      },
    },
  });
  // Load existing settings
  (0, react_1.useEffect)(() => {
    var loadPaymentSettings = () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          setIsLoading(true);
          try {
            // TODO: Replace with actual API call
          } catch (error) {
            console.error("Erro ao carregar configurações:", error);
            sonner_1.toast.error("Erro ao carregar configurações de pagamento");
          } finally {
            setIsLoading(false);
          }
          return [2 /*return*/];
        });
      });
    loadPaymentSettings();
  }, [form]);
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setIsSaving(true);
        try {
          setLastSaved(new Date());
          sonner_1.toast.success("Configurações de pagamento salvas com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          sonner_1.toast.error("Erro ao salvar configurações");
        } finally {
          setIsSaving(false);
        }
        return [2 /*return*/];
      });
    });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <alert_1.Alert>
        <lucide_react_1.CreditCard className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Métodos de Pagamento:</strong> Configure as formas de pagamento aceitas pela
          clínica, incluindo PIX, cartões, transferência e dinheiro.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* PIX */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Smartphone className="h-5 w-5" />
                PIX
              </card_1.CardTitle>
              <card_1.CardDescription>
                Sistema de pagamentos instantâneos do Banco Central
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="pix.enabled"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Aceitar PIX</form_1.FormLabel>
                        <form_1.FormDescription>
                          Habilitar pagamentos via PIX
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("pix.enabled") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={form.control}
                    name="pix.pixKey"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Chave PIX</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="CPF, CNPJ, email ou telefone" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="pix.expirationMinutes"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Validade (minutos)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              type="number"
                              min="5"
                              max="1440"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Tempo para expiração do QR Code
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Cards */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.CreditCard className="h-5 w-5" />
                Cartões de Crédito e Débito
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="cards.enabled"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Aceitar Cartões</form_1.FormLabel>
                        <form_1.FormDescription>
                          Habilitar pagamentos com cartão
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("cards.enabled") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="cards.acceptCredit"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Cartão de Crédito</form_1.FormLabel>
                              <form_1.FormDescription>
                                Aceitar cartões de crédito
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="cards.acceptDebit"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Cartão de Débito</form_1.FormLabel>
                              <form_1.FormDescription>
                                Aceitar cartões de débito
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <form_1.FormField
                      control={form.control}
                      name="cards.installments.enabled"
                      render={(_a) => {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">
                                Parcelamento
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Permitir pagamento parcelado
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    {form.watch("cards.installments.enabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <form_1.FormField
                          control={form.control}
                          name="cards.installments.maxInstallments"
                          render={(_a) => {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Máx. Parcelas</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="cards.installments.minAmountPerInstallment"
                          render={(_a) => {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Mín. por Parcela (R$)</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="number"
                                    min="10"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value) || 50)
                                    }
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />

                        <form_1.FormField
                          control={form.control}
                          name="cards.installments.interestRate"
                          render={(_a) => {
                            var field = _a.field;
                            return (
                              <form_1.FormItem>
                                <form_1.FormLabel>Taxa de Juros (% a.m.)</form_1.FormLabel>
                                <form_1.FormControl>
                                  <input_1.Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value) || 2.99)
                                    }
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Bank Transfer */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Banknote className="h-5 w-5" />
                Transferência Bancária
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="bankTransfer.enabled"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">
                          Aceitar Transferência
                        </form_1.FormLabel>
                        <form_1.FormDescription>
                          TED, DOC ou transferência via app
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("bankTransfer.enabled") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={form.control}
                    name="bankTransfer.bankName"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Banco</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Banco do Brasil" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="bankTransfer.accountType"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Tipo de Conta</form_1.FormLabel>
                          <form_1.FormControl>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="corrente">Conta Corrente</option>
                              <option value="poupanca">Poupança</option>
                            </select>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="bankTransfer.agency"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Agência</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="1234-5" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="bankTransfer.account"
                    render={(_a) => {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Conta</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="12345-6" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Cash */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Dinheiro</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="cash.enabled"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">Aceitar Dinheiro</form_1.FormLabel>
                        <form_1.FormDescription>Pagamento em espécie</form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("cash.enabled") && (
                <form_1.FormField
                  control={form.control}
                  name="cash.discountPercent"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="md:w-1/3">
                        <form_1.FormLabel>Desconto à Vista (%)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Desconto para pagamento em dinheiro
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <button_1.Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                : <>
                    <lucide_react_1.Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
