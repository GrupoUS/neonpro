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
exports.AccountsPayableForm = AccountsPayableForm;
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var accounts_payable_1 = require("@/lib/services/accounts-payable");
var documents_1 = require("@/lib/services/documents");
var expense_categories_1 = require("@/lib/services/expense-categories");
var vendors_1 = require("@/lib/services/vendors");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var document_upload_1 = require("./document-upload");
var paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "check", label: "Cheque" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "other", label: "Outro" },
];
var statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "scheduled", label: "Agendado" },
];
var priorityOptions = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];
function AccountsPayableForm(_a) {
  var _this = this;
  var accountsPayable = _a.accountsPayable,
    open = _a.open,
    onOpenChange = _a.onOpenChange,
    onSuccess = _a.onSuccess;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)([]),
    vendors = _c[0],
    setVendors = _c[1];
  var _d = (0, react_1.useState)([]),
    categories = _d[0],
    setCategories = _d[1];
  var _e = (0, react_1.useState)(true),
    loadingOptions = _e[0],
    setLoadingOptions = _e[1];
  var _f = (0, react_1.useState)([]),
    documents = _f[0],
    setDocuments = _f[1];
  var _g = (0, react_1.useState)(false),
    loadingDocuments = _g[0],
    setLoadingDocuments = _g[1];
  var _h = (0, react_1.useState)({
      vendor_id: "",
      expense_category_id: "",
      invoice_number: "",
      invoice_date: undefined,
      due_date: "",
      gross_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      net_amount: 0,
      payment_terms_days: 30,
      payment_method: "pix",
      status: "draft",
      priority: "normal",
      description: "",
      notes: "",
    }),
    formData = _h[0],
    setFormData = _h[1];
  var _j = (0, react_1.useState)({
      invoice: false,
      due: false,
    }),
    showCalendar = _j[0],
    setShowCalendar = _j[1];
  var loadDocuments = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var payableDocuments, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (
              !(accountsPayable === null || accountsPayable === void 0
                ? void 0
                : accountsPayable.id)
            )
              return [2 /*return*/];
            setLoadingDocuments(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              documents_1.documentsService.getDocuments("payable", accountsPayable.id),
            ];
          case 2:
            payableDocuments = _a.sent();
            setDocuments(payableDocuments);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao carregar documentos:", error_1);
            sonner_1.toast.error("Erro ao carregar documentos da conta a pagar");
            return [3 /*break*/, 5];
          case 4:
            setLoadingDocuments(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Load options (vendors and categories)
  (0, react_1.useEffect)(
    function () {
      var loadOptions = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var _a, vendorsData, categoriesData, error_2;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _b.trys.push([0, 2, 3, 4]);
                setLoadingOptions(true);
                return [
                  4 /*yield*/,
                  Promise.all([
                    vendors_1.VendorService.getActiveVendorsForSelection(),
                    expense_categories_1.ExpenseCategoryService.getActiveCategoriesForSelection(),
                  ]),
                ];
              case 1:
                (_a = _b.sent()), (vendorsData = _a[0]), (categoriesData = _a[1]);
                setVendors(vendorsData);
                setCategories(categoriesData);
                return [3 /*break*/, 4];
              case 2:
                error_2 = _b.sent();
                console.error("Error loading options:", error_2);
                sonner_1.toast.error("Erro ao carregar opções");
                return [3 /*break*/, 4];
              case 3:
                setLoadingOptions(false);
                return [7 /*endfinally*/];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      };
      if (open) {
        loadOptions();
      }
    },
    [open],
  );
  // Populate form when editing existing AP
  (0, react_1.useEffect)(
    function () {
      if (accountsPayable && open) {
        setFormData({
          vendor_id: accountsPayable.vendor_id,
          expense_category_id: accountsPayable.expense_category_id,
          invoice_number: accountsPayable.invoice_number || "",
          invoice_date: accountsPayable.invoice_date || undefined,
          due_date: accountsPayable.due_date,
          gross_amount: accountsPayable.gross_amount,
          tax_amount: accountsPayable.tax_amount,
          discount_amount: accountsPayable.discount_amount,
          net_amount: accountsPayable.net_amount,
          payment_terms_days: accountsPayable.payment_terms_days,
          payment_method: accountsPayable.payment_method,
          status: accountsPayable.status,
          priority: accountsPayable.priority,
          description: accountsPayable.description || "",
          notes: accountsPayable.notes || "",
        });
      } else if (open && !accountsPayable) {
        // Reset form for new AP
        setFormData({
          vendor_id: "",
          expense_category_id: "",
          invoice_number: "",
          invoice_date: undefined,
          due_date: "",
          gross_amount: 0,
          tax_amount: 0,
          discount_amount: 0,
          net_amount: 0,
          payment_terms_days: 30,
          payment_method: "pix",
          status: "draft",
          priority: "normal",
          description: "",
          notes: "",
        });
      }
    },
    [accountsPayable, open],
  );
  // Load documents when AP changes or dialog opens
  (0, react_1.useEffect)(
    function () {
      if (
        open &&
        (accountsPayable === null || accountsPayable === void 0 ? void 0 : accountsPayable.id)
      ) {
        loadDocuments();
      }
    },
    [open, accountsPayable === null || accountsPayable === void 0 ? void 0 : accountsPayable.id],
  );
  // Calculate net amount when gross, tax, or discount changes
  (0, react_1.useEffect)(
    function () {
      var netAmount =
        (formData.gross_amount || 0) + (formData.tax_amount || 0) - (formData.discount_amount || 0);
      if (netAmount !== formData.net_amount) {
        setFormData(function (prev) {
          return __assign(__assign({}, prev), { net_amount: netAmount });
        });
      }
    },
    [formData.gross_amount, formData.tax_amount, formData.discount_amount],
  );
  // Auto-calculate due date when invoice date and payment terms change
  (0, react_1.useEffect)(
    function () {
      if (formData.invoice_date && formData.payment_terms_days) {
        var invoiceDate = new Date(formData.invoice_date);
        var dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + formData.payment_terms_days);
        var dueDateString_1 = dueDate.toISOString().split("T")[0];
        if (dueDateString_1 !== formData.due_date) {
          setFormData(function (prev) {
            return __assign(__assign({}, prev), { due_date: dueDateString_1 });
          });
        }
      }
    },
    [formData.invoice_date, formData.payment_terms_days],
  );
  var handleSubmit = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.vendor_id || !formData.expense_category_id || !formData.due_date) {
              sonner_1.toast.error(
                "Fornecedor, categoria de despesa e data de vencimento são obrigatórios",
              );
              return [2 /*return*/];
            }
            if (formData.net_amount <= 0) {
              sonner_1.toast.error("O valor líquido deve ser maior que zero");
              return [2 /*return*/];
            }
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            if (!accountsPayable) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              accounts_payable_1.AccountsPayableService.updateAccountsPayable(
                accountsPayable.id,
                formData,
              ),
            ];
          case 2:
            _a.sent();
            sonner_1.toast.success("Conta a pagar atualizada com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            return [
              4 /*yield*/,
              accounts_payable_1.AccountsPayableService.createAccountsPayable(formData),
            ];
          case 4:
            _a.sent();
            sonner_1.toast.success("Conta a pagar criada com sucesso!");
            _a.label = 5;
          case 5:
            onSuccess();
            onOpenChange(false);
            return [3 /*break*/, 8];
          case 6:
            error_3 = _a.sent();
            console.error("Error saving accounts payable:", error_3);
            sonner_1.toast.error(error_3.message || "Erro ao salvar conta a pagar");
            return [3 /*break*/, 8];
          case 7:
            setLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateField = function (field, value) {
    setFormData(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  var handleDateSelect = function (date, field) {
    if (date) {
      var dateString = date.toISOString().split("T")[0];
      updateField(field, dateString);
    }
    setShowCalendar(function (prev) {
      var _a;
      return __assign(
        __assign({}, prev),
        ((_a = {}), (_a[field === "invoice_date" ? "invoice" : "due"] = false), _a),
      );
    });
  };
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  if (loadingOptions) {
    return (
      <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
        <dialog_1.DialogContent>
          <div className="flex items-center justify-center py-8">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Carregando opções...</p>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    );
  }
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {accountsPayable ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            {accountsPayable
              ? "Atualize as informações da conta a pagar."
              : "Cadastre uma nova conta a pagar no sistema."}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <tabs_1.Tabs defaultValue="info" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="info" className="flex items-center gap-2">
              <lucide_react_1.Receipt className="h-4 w-4" />
              Informações
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger
              value="documents"
              className="flex items-center gap-2"
              disabled={
                !(accountsPayable === null || accountsPayable === void 0
                  ? void 0
                  : accountsPayable.id)
              }
            >
              <lucide_react_1.FileText className="h-4 w-4" />
              Documentos
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="info" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Informações Básicas</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="vendor_id">Fornecedor *</label_1.Label>
                    <select_1.Select
                      value={formData.vendor_id}
                      onValueChange={function (value) {
                        return updateField("vendor_id", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o fornecedor" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {vendors.map(function (vendor) {
                          return (
                            <select_1.SelectItem key={vendor.id} value={vendor.value}>
                              {vendor.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="expense_category_id">
                      Categoria de Despesa *
                    </label_1.Label>
                    <select_1.Select
                      value={formData.expense_category_id}
                      onValueChange={function (value) {
                        return updateField("expense_category_id", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione a categoria" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {categories.map(function (category) {
                          return (
                            <select_1.SelectItem key={category.id} value={category.value}>
                              {category.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="invoice_number">Número da Fatura</label_1.Label>
                    <input_1.Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={function (e) {
                        return updateField("invoice_number", e.target.value);
                      }}
                      placeholder="NF-001234"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="status">Status</label_1.Label>
                    <select_1.Select
                      value={formData.status}
                      onValueChange={function (value) {
                        return updateField("status", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {statusOptions.map(function (status) {
                          return (
                            <select_1.SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Dates */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Datas</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label_1.Label htmlFor="invoice_date">Data da Fatura</label_1.Label>
                    <popover_1.Popover
                      open={showCalendar.invoice}
                      onOpenChange={function (open) {
                        return setShowCalendar(function (prev) {
                          return __assign(__assign({}, prev), { invoice: open });
                        });
                      }}
                    >
                      <popover_1.PopoverTrigger asChild>
                        <button_1.Button
                          variant="outline"
                          className={(0, utils_1.cn)(
                            "w-full justify-start text-left font-normal",
                            !formData.invoice_date && "text-muted-foreground",
                          )}
                        >
                          <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.invoice_date
                            ? (0, date_fns_1.format)(new Date(formData.invoice_date), "PPP", {
                                locale: locale_1.ptBR,
                              })
                            : "Selecionar data"}
                        </button_1.Button>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent className="w-auto p-0">
                        <calendar_1.Calendar
                          mode="single"
                          selected={
                            formData.invoice_date ? new Date(formData.invoice_date) : undefined
                          }
                          onSelect={function (date) {
                            return handleDateSelect(date, "invoice_date");
                          }}
                          initialFocus
                        />
                      </popover_1.PopoverContent>
                    </popover_1.Popover>
                  </div>

                  <div>
                    <label_1.Label htmlFor="payment_terms_days">
                      Prazo de Pagamento (dias)
                    </label_1.Label>
                    <input_1.Input
                      id="payment_terms_days"
                      type="number"
                      value={formData.payment_terms_days}
                      onChange={function (e) {
                        return updateField("payment_terms_days", parseInt(e.target.value) || 30);
                      }}
                      min="0"
                      max="365"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="due_date">Data de Vencimento *</label_1.Label>
                    <popover_1.Popover
                      open={showCalendar.due}
                      onOpenChange={function (open) {
                        return setShowCalendar(function (prev) {
                          return __assign(__assign({}, prev), { due: open });
                        });
                      }}
                    >
                      <popover_1.PopoverTrigger asChild>
                        <button_1.Button
                          variant="outline"
                          className={(0, utils_1.cn)(
                            "w-full justify-start text-left font-normal",
                            !formData.due_date && "text-muted-foreground",
                          )}
                        >
                          <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date
                            ? (0, date_fns_1.format)(new Date(formData.due_date), "PPP", {
                                locale: locale_1.ptBR,
                              })
                            : "Selecionar data"}
                        </button_1.Button>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent className="w-auto p-0">
                        <calendar_1.Calendar
                          mode="single"
                          selected={formData.due_date ? new Date(formData.due_date) : undefined}
                          onSelect={function (date) {
                            return handleDateSelect(date, "due_date");
                          }}
                          initialFocus
                        />
                      </popover_1.PopoverContent>
                    </popover_1.Popover>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Financial Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Calculator className="h-5 w-5" />
                    Informações Financeiras
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label_1.Label htmlFor="gross_amount">Valor Bruto</label_1.Label>
                      <input_1.Input
                        id="gross_amount"
                        type="number"
                        value={formData.gross_amount}
                        onChange={function (e) {
                          return updateField("gross_amount", parseFloat(e.target.value) || 0);
                        }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="tax_amount">Impostos</label_1.Label>
                      <input_1.Input
                        id="tax_amount"
                        type="number"
                        value={formData.tax_amount}
                        onChange={function (e) {
                          return updateField("tax_amount", parseFloat(e.target.value) || 0);
                        }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="discount_amount">Desconto</label_1.Label>
                      <input_1.Input
                        id="discount_amount"
                        type="number"
                        value={formData.discount_amount}
                        onChange={function (e) {
                          return updateField("discount_amount", parseFloat(e.target.value) || 0);
                        }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Valor Líquido:</span>
                      <span className="text-2xl">{formatCurrency(formData.net_amount)}</span>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Payment Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Informações de Pagamento</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="payment_method">Método de Pagamento</label_1.Label>
                    <select_1.Select
                      value={formData.payment_method}
                      onValueChange={function (value) {
                        return updateField("payment_method", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {paymentMethods.map(function (method) {
                          return (
                            <select_1.SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="priority">Prioridade</label_1.Label>
                    <select_1.Select
                      value={formData.priority}
                      onValueChange={function (value) {
                        return updateField("priority", value);
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {priorityOptions.map(function (priority) {
                          return (
                            <select_1.SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Additional Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Informações Adicionais</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="description">Descrição</label_1.Label>
                    <textarea_1.Textarea
                      id="description"
                      value={formData.description}
                      onChange={function (e) {
                        return updateField("description", e.target.value);
                      }}
                      placeholder="Descrição da despesa..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="notes">Observações</label_1.Label>
                    <textarea_1.Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={function (e) {
                        return updateField("notes", e.target.value);
                      }}
                      placeholder="Observações internas..."
                      rows={2}
                    />
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </form>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="documents" className="mt-6">
            {(accountsPayable === null || accountsPayable === void 0
              ? void 0
              : accountsPayable.id) && (
              <document_upload_1.default
                entityType="payable"
                entityId={accountsPayable.id}
                existingDocuments={documents}
                onDocumentsChange={loadDocuments}
              />
            )}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        <dialog_1.DialogFooter>
          <button_1.Button
            type="button"
            variant="outline"
            onClick={function () {
              return onOpenChange(false);
            }}
          >
            Cancelar
          </button_1.Button>
          <button_1.Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {accountsPayable ? "Atualizar" : "Criar"} Conta a Pagar
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
