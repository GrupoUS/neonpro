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
exports.InvoicesManagement = InvoicesManagement;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var textarea_1 = require("@/components/ui/textarea");
var use_billing_1 = require("@/hooks/use-billing");
var billing_1 = require("@/types/billing");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function InvoicesManagement() {
  var _this = this;
  var _a, _b;
  var _c = (0, use_billing_1.useBilling)(),
    loading = _c.loading,
    invoices = _c.invoices,
    services = _c.services,
    fetchInvoices = _c.fetchInvoices,
    fetchServices = _c.fetchServices,
    createInvoice = _c.createInvoice,
    updateInvoice = _c.updateInvoice;
  var _d = (0, react_1.useState)(""),
    searchTerm = _d[0],
    setSearchTerm = _d[1];
  var _e = (0, react_1.useState)({}),
    filters = _e[0],
    setFilters = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedInvoice = _f[0],
    setSelectedInvoice = _f[1];
  var _g = (0, react_1.useState)(false),
    isCreateDialogOpen = _g[0],
    setIsCreateDialogOpen = _g[1];
  var _h = (0, react_1.useState)(false),
    isViewDialogOpen = _h[0],
    setIsViewDialogOpen = _h[1];
  var _j = (0, react_1.useState)({}),
    dateRange = _j[0],
    setDateRange = _j[1];
  // Add patients state
  var _k = (0, react_1.useState)([]),
    patients = _k[0],
    setPatients = _k[1];
  var _l = (0, react_1.useState)(false),
    loadingPatients = _l[0],
    setLoadingPatients = _l[1];
  var _m = (0, react_1.useState)({
      patient_id: "",
      due_date: "",
      items: [{ service_id: "", quantity: 1, unit_price: 0 }],
      notes: "",
      discount_amount: "",
      tax_amount: "",
    }),
    formData = _m[0],
    setFormData = _m[1];
  // Function to fetch patients from API
  var fetchPatients = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoadingPatients(true);
            return [4 /*yield*/, fetch("/api/patients")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setPatients(data.data || []);
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Erro ao carregar pacientes");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error fetching patients:", error_1);
            sonner_1.toast.error("Erro ao carregar pacientes");
            return [3 /*break*/, 7];
          case 6:
            setLoadingPatients(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Load invoices, services and patients on component mount
  (0, react_1.useEffect)(
    function () {
      fetchInvoices(filters);
      if (services.length === 0) {
        fetchServices({});
      }
      if (patients.length === 0) {
        fetchPatients();
      }
    },
    [fetchInvoices, fetchServices, filters, services.length, patients.length],
  );
  // Update filters when date range changes
  (0, react_1.useEffect)(
    function () {
      if (dateRange.from || dateRange.to) {
        setFilters(function (prev) {
          return __assign(__assign({}, prev), { date_range: dateRange });
        });
      }
    },
    [dateRange],
  );
  // Filter invoices based on search term
  var filteredInvoices = invoices.filter(function (invoice) {
    var _a, _b;
    return (
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((_a = invoice.patient_id) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_b = invoice.notes) === null || _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  var resetForm = function () {
    setFormData({
      patient_id: "",
      due_date: "",
      items: [{ service_id: "", quantity: 1, unit_price: 0 }],
      notes: "",
      discount_amount: "",
      tax_amount: "",
    });
  };
  var openCreateDialog = function () {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  var openViewDialog = function (invoice) {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };
  var addInvoiceItem = function () {
    setFormData(function (prev) {
      return __assign(__assign({}, prev), {
        items: __spreadArray(
          __spreadArray([], prev.items, true),
          [{ service_id: "", quantity: 1, unit_price: 0 }],
          false,
        ),
      });
    });
  };
  var removeInvoiceItem = function (index) {
    setFormData(function (prev) {
      return __assign(__assign({}, prev), {
        items: prev.items.filter(function (_, i) {
          return i !== index;
        }),
      });
    });
  };
  var updateInvoiceItem = function (index, field, value) {
    setFormData(function (prev) {
      return __assign(__assign({}, prev), {
        items: prev.items.map(function (item, i) {
          var _a;
          return i === index
            ? __assign(__assign({}, item), ((_a = {}), (_a[field] = value), _a))
            : item;
        }),
      });
    });
  };
  var calculateTotal = function () {
    var subtotal = formData.items.reduce(function (sum, item) {
      return sum + item.quantity * item.unit_price;
    }, 0);
    var discount = parseFloat(formData.discount_amount || "0");
    var tax = parseFloat(formData.tax_amount || "0");
    return subtotal - discount + tax;
  };
  var handleSubmit = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var invoiceItems, invoiceData, success;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.patient_id || !formData.due_date) {
              sonner_1.toast.error("Paciente e data de vencimento são obrigatórios");
              return [2 /*return*/];
            }
            if (
              formData.items.length === 0 ||
              formData.items.some(function (item) {
                return !item.service_id;
              })
            ) {
              sonner_1.toast.error("Adicione pelo menos um item à fatura");
              return [2 /*return*/];
            }
            invoiceItems = formData.items.map(function (item) {
              return {
                service_id: item.service_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                description: item.description || "Serviço",
              };
            });
            invoiceData = {
              patient_id: formData.patient_id,
              due_date: formData.due_date,
              items: invoiceItems,
              notes: formData.notes || undefined,
              discount_amount: formData.discount_amount
                ? parseFloat(formData.discount_amount)
                : undefined,
              tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : undefined,
            };
            return [4 /*yield*/, createInvoice(invoiceData)];
          case 1:
            success = _a.sent() !== null;
            if (success) {
              setIsCreateDialogOpen(false);
              resetForm();
            }
            return [2 /*return*/];
        }
      });
    });
  };
  var handleStatusUpdate = function (invoice, status) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, updateInvoice(invoice.id, { status: status })];
          case 1:
            _a.sent();
            sonner_1.toast.success("Status da fatura atualizado");
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao atualizar status:", error_2);
            sonner_1.toast.error("Erro ao atualizar status da fatura");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleSendInvoice = function (invoice) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Simulate send invoice functionality
          sonner_1.toast.success("Fatura enviada com sucesso");
        } catch (error) {
          console.error("Erro ao enviar fatura:", error);
          sonner_1.toast.error("Erro ao enviar fatura");
        }
        return [2 /*return*/];
      });
    });
  };
  var handleDownloadInvoice = function (invoice) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Simulate download functionality
          sonner_1.toast.success("Download iniciado");
        } catch (error) {
          console.error("Erro ao fazer download:", error);
          sonner_1.toast.error("Erro ao fazer download da fatura");
        }
        return [2 /*return*/];
      });
    });
  };
  var getStatusColor = function (status) {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "partially_paid":
        return "bg-orange-100 text-orange-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getStatusLabel = function (status) {
    var statusOption = billing_1.INVOICE_STATUSES.find(function (s) {
      return s.value === status;
    });
    return (
      (statusOption === null || statusOption === void 0 ? void 0 : statusOption.label) || status
    );
  };
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var formatDate = function (dateString) {
    try {
      return (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy", { locale: locale_1.ptBR });
    } catch (_a) {
      return "Data inválida";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Faturas</h2>
          <p className="text-muted-foreground">Visualize e gerencie todas as faturas da clínica</p>
        </div>

        <button_1.Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <lucide_react_1.Plus className="h-4 w-4 mr-2" />
          Nova Fatura
        </button_1.Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Pendente</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter(function (inv) {
                    return ["sent", "viewed", "overdue"].includes(inv.status);
                  })
                  .reduce(function (sum, inv) {
                    return sum + inv.total_amount;
                  }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                invoices.filter(function (inv) {
                  return ["sent", "viewed", "overdue"].includes(inv.status);
                }).length
              }{" "}
              faturas
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pagas Este Mês</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter(function (inv) {
                    return inv.status === "paid";
                  })
                  .reduce(function (sum, inv) {
                    return sum + inv.total_amount;
                  }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                invoices.filter(function (inv) {
                  return inv.status === "paid";
                }).length
              }{" "}
              faturas
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Em Atraso</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {
                invoices.filter(function (inv) {
                  return inv.status === "overdue";
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                invoices
                  .filter(function (inv) {
                    return inv.status === "overdue";
                  })
                  .reduce(function (sum, inv) {
                    return sum + inv.total_amount;
                  }, 0),
              )}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Pagamento</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {invoices.length > 0
                ? Math.round(
                    (invoices.filter(function (inv) {
                      return inv.status === "paid";
                    }).length /
                      invoices.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">nos últimos 30 dias</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Search and Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar faturas..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select_1.Select
                value={((_a = filters.status) === null || _a === void 0 ? void 0 : _a[0]) || "all"}
                onValueChange={function (value) {
                  return setFilters(function (prev) {
                    return __assign(__assign({}, prev), {
                      status: value === "all" ? undefined : [value],
                    });
                  });
                }}
              >
                <select_1.SelectTrigger className="w-[150px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                  {billing_1.INVOICE_STATUSES.map(function (status) {
                    return (
                      <select_1.SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Invoices Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Faturas</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading
            ? <div className="space-y-3">
                {Array.from({ length: 5 }).map(function (_, i) {
                  return <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>;
                })}
              </div>
            : filteredInvoices.length === 0
              ? <div className="text-center py-12">
                  <lucide_react_1.DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma fatura encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando sua primeira fatura"}
                  </p>
                  {!searchTerm && (
                    <button_1.Button onClick={openCreateDialog}>
                      <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Fatura
                    </button_1.Button>
                  )}
                </div>
              : <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Número</table_1.TableHead>
                      <table_1.TableHead>Paciente</table_1.TableHead>
                      <table_1.TableHead>Data Emissão</table_1.TableHead>
                      <table_1.TableHead>Vencimento</table_1.TableHead>
                      <table_1.TableHead>Valor</table_1.TableHead>
                      <table_1.TableHead>Status</table_1.TableHead>
                      <table_1.TableHead>Ações</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {filteredInvoices.map(function (invoice) {
                      return (
                        <table_1.TableRow key={invoice.id}>
                          <table_1.TableCell className="font-medium">
                            {invoice.invoice_number}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.User className="h-4 w-4" />
                              <span>{invoice.patient_id}</span>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>{formatDate(invoice.issue_date)}</table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Calendar className="h-4 w-4" />
                              {invoice.due_date ? formatDate(invoice.due_date) : "N/A"}
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell className="font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <badge_1.Badge className={getStatusColor(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </badge_1.Badge>
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="flex gap-1">
                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return openViewDialog(invoice);
                                }}
                              >
                                <lucide_react_1.Eye className="h-4 w-4" />
                              </button_1.Button>

                              <button_1.Button
                                variant="ghost"
                                size="sm"
                                onClick={function () {
                                  return handleDownloadInvoice(invoice);
                                }}
                              >
                                <lucide_react_1.Download className="h-4 w-4" />
                              </button_1.Button>

                              {invoice.status !== "paid" && (
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    return handleSendInvoice(invoice);
                                  }}
                                >
                                  <lucide_react_1.Send className="h-4 w-4" />
                                </button_1.Button>
                              )}

                              <select_1.Select
                                value={invoice.status}
                                onValueChange={function (value) {
                                  return handleStatusUpdate(invoice, value);
                                }}
                              >
                                <select_1.SelectTrigger className="w-auto h-8">
                                  <select_1.SelectValue />
                                </select_1.SelectTrigger>
                                <select_1.SelectContent>
                                  {billing_1.INVOICE_STATUSES.map(function (status) {
                                    return (
                                      <select_1.SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </select_1.SelectItem>
                                    );
                                  })}
                                </select_1.SelectContent>
                              </select_1.Select>
                            </div>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
                  </table_1.TableBody>
                </table_1.Table>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Create Invoice Dialog */}
      <dialog_1.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Nova Fatura</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Crie uma nova fatura para o paciente
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="patient_id">Paciente *</label_1.Label>
                <select_1.Select
                  value={formData.patient_id}
                  onValueChange={function (value) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { patient_id: value });
                    });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecionar paciente" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {loadingPatients
                      ? <select_1.SelectItem value="" disabled>
                          Carregando pacientes...
                        </select_1.SelectItem>
                      : patients.length > 0
                        ? patients.map(function (patient) {
                            return (
                              <select_1.SelectItem key={patient.id} value={patient.id}>
                                <div className="flex items-center gap-2">
                                  <lucide_react_1.User className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{patient.full_name}</div>
                                    {patient.email && (
                                      <div className="text-xs text-muted-foreground">
                                        {patient.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </select_1.SelectItem>
                            );
                          })
                        : <select_1.SelectItem value="" disabled>
                            Nenhum paciente cadastrado
                          </select_1.SelectItem>}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="due_date">Data de Vencimento *</label_1.Label>
                <input_1.Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { due_date: e.target.value });
                    });
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label_1.Label className="text-base font-medium">Itens da Fatura</label_1.Label>
                <button_1.Button type="button" variant="outline" onClick={addInvoiceItem}>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </button_1.Button>
              </div>

              {formData.items.map(function (item, index) {
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item #{index + 1}</h4>
                      {formData.items.length > 1 && (
                        <button_1.Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={function () {
                            return removeInvoiceItem(index);
                          }}
                        >
                          Remover
                        </button_1.Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label_1.Label>Serviço *</label_1.Label>
                        <select_1.Select
                          value={item.service_id}
                          onValueChange={function (value) {
                            var service = services.find(function (s) {
                              return s.id === value;
                            });
                            updateInvoiceItem(index, "service_id", value);
                            if (service) {
                              updateInvoiceItem(index, "unit_price", service.base_price);
                            }
                          }}
                        >
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecionar serviço" />
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {services.map(function (service) {
                              return (
                                <select_1.SelectItem key={service.id} value={service.id}>
                                  {service.name} - {formatCurrency(service.base_price)}
                                </select_1.SelectItem>
                              );
                            })}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      <div className="space-y-2">
                        <label_1.Label>Quantidade</label_1.Label>
                        <input_1.Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={function (e) {
                            return updateInvoiceItem(index, "quantity", parseInt(e.target.value));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label_1.Label>Preço Unitário (R$)</label_1.Label>
                        <input_1.Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={function (e) {
                            return updateInvoiceItem(
                              index,
                              "unit_price",
                              parseFloat(e.target.value),
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label>Descrição Adicional</label_1.Label>
                      <input_1.Input
                        value={item.description || ""}
                        onChange={function (e) {
                          return updateInvoiceItem(index, "description", e.target.value);
                        }}
                        placeholder="Descrição personalizada (opcional)"
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">
                        Subtotal: {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <separator_1.Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="discount_amount">Desconto (R$)</label_1.Label>
                <input_1.Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { discount_amount: e.target.value });
                    });
                  }}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="tax_amount">Taxa/Imposto (R$)</label_1.Label>
                <input_1.Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { tax_amount: e.target.value });
                    });
                  }}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <label_1.Label className="text-lg font-medium">Total</label_1.Label>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="notes">Observações</label_1.Label>
              <textarea_1.Textarea
                id="notes"
                value={formData.notes}
                onChange={function (e) {
                  return setFormData(function (prev) {
                    return __assign(__assign({}, prev), { notes: e.target.value });
                  });
                }}
                placeholder="Observações adicionais para a fatura..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={function () {
                  return setIsCreateDialogOpen(false);
                }}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={loading}>
                Criar Fatura
              </button_1.Button>
            </div>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* View Invoice Dialog */}
      <dialog_1.Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              Fatura #
              {selectedInvoice === null || selectedInvoice === void 0
                ? void 0
                : selectedInvoice.invoice_number}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>Detalhes completos da fatura</dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">Status</label_1.Label>
                  <badge_1.Badge className={"mt-1 ".concat(getStatusColor(selectedInvoice.status))}>
                    {getStatusLabel(selectedInvoice.status)}
                  </badge_1.Badge>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">
                    Valor Total
                  </label_1.Label>
                  <div className="text-lg font-bold">
                    {formatCurrency(selectedInvoice.total_amount)}
                  </div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">
                    Data de Emissão
                  </label_1.Label>
                  <div>{formatDate(selectedInvoice.issue_date)}</div>
                </div>
                <div>
                  <label_1.Label className="text-sm text-muted-foreground">
                    Data de Vencimento
                  </label_1.Label>
                  <div>
                    {selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : "N/A"}
                  </div>
                </div>
              </div>

              <separator_1.Separator />

              <div>
                <label_1.Label className="text-base font-medium mb-4 block">
                  Itens da Fatura
                </label_1.Label>
                {((_b = selectedInvoice.items) === null || _b === void 0
                  ? void 0
                  : _b.map(function (item, index) {
                      return (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity}x {formatCurrency(item.unit_price)}
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                      );
                    })) || <div className="text-muted-foreground">Nenhum item encontrado</div>}
              </div>

              {selectedInvoice.notes && (
                <>
                  <separator_1.Separator />
                  <div>
                    <label_1.Label className="text-base font-medium mb-2 block">
                      Observações
                    </label_1.Label>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return handleDownloadInvoice(selectedInvoice);
                  }}
                >
                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                  Download
                </button_1.Button>
                <button_1.Button
                  onClick={function () {
                    return handleSendInvoice(selectedInvoice);
                  }}
                >
                  <lucide_react_1.Send className="h-4 w-4 mr-2" />
                  Enviar
                </button_1.Button>
              </div>
            </div>
          )}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
