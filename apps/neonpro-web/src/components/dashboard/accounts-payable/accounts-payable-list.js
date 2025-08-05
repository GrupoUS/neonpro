"use client";
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
exports.AccountsPayableList = AccountsPayableList;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var accounts_payable_1 = require("@/lib/services/accounts-payable");
var expense_categories_1 = require("@/lib/services/expense-categories");
var vendors_1 = require("@/lib/services/vendors");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var accounts_payable_form_1 = require("./accounts-payable-form");
function AccountsPayableList() {
  var _a = (0, react_1.useState)([]),
    accountsPayable = _a[0],
    setAccountsPayable = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(0),
    totalAP = _c[0],
    setTotalAP = _c[1];
  var _d = (0, react_1.useState)(1),
    currentPage = _d[0],
    setCurrentPage = _d[1];
  var pageSize = (0, react_1.useState)(20)[0];
  // Form state
  var _e = (0, react_1.useState)(false),
    showForm = _e[0],
    setShowForm = _e[1];
  var _f = (0, react_1.useState)(),
    selectedAP = _f[0],
    setSelectedAP = _f[1];
  var _g = (0, react_1.useState)(false),
    showDeleteDialog = _g[0],
    setShowDeleteDialog = _g[1];
  var _h = (0, react_1.useState)(null),
    apToDelete = _h[0],
    setApToDelete = _h[1];
  var _j = (0, react_1.useState)(false),
    deleteLoading = _j[0],
    setDeleteLoading = _j[1];
  // Filter options
  var _k = (0, react_1.useState)([]),
    vendors = _k[0],
    setVendors = _k[1];
  var _l = (0, react_1.useState)([]),
    categories = _l[0],
    setCategories = _l[1];
  // Filters
  var _m = (0, react_1.useState)({
      search: "",
      vendor_id: undefined,
      status: undefined,
      priority: undefined,
      expense_category_id: undefined,
      due_date_from: undefined,
      due_date_to: undefined,
      overdue_only: false,
    }),
    filters = _m[0],
    setFilters = _m[1];
  (0, react_1.useEffect)(() => {
    loadAccountsPayable();
    loadFilterOptions();
  }, [filters, currentPage]);
  var loadAccountsPayable = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [
              4 /*yield*/,
              accounts_payable_1.AccountsPayableService.getAccountsPayable(
                filters,
                currentPage,
                pageSize,
              ),
            ];
          case 1:
            response = _a.sent();
            setAccountsPayable(response.accounts_payable);
            setTotalAP(response.total);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error loading accounts payable:", error_1);
            sonner_1.toast.error("Erro ao carregar contas a pagar");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadFilterOptions = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, vendorsData, categoriesData, error_2;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
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
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            console.error("Error loading filter options:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleSearch = (search) => {
    setFilters((prev) => __assign(__assign({}, prev), { search: search }));
    setCurrentPage(1);
  };
  var handleFilterChange = (key, value) => {
    setFilters((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[key] = value), _a));
    });
    setCurrentPage(1);
  };
  var handleEdit = (ap) => {
    setSelectedAP(ap);
    setShowForm(true);
  };
  var handleDelete = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!apToDelete) return [2 /*return*/];
            setDeleteLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              accounts_payable_1.AccountsPayableService.deleteAccountsPayable(
                apToDelete.id,
                "Deletado pelo usuário",
              ),
            ];
          case 2:
            _a.sent();
            sonner_1.toast.success("Conta a pagar deletada com sucesso!");
            loadAccountsPayable();
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Error deleting accounts payable:", error_3);
            sonner_1.toast.error("Erro ao deletar conta a pagar");
            return [3 /*break*/, 5];
          case 4:
            setDeleteLoading(false);
            setShowDeleteDialog(false);
            setApToDelete(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleStatusUpdate = (ap, newStatus) =>
    __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              accounts_payable_1.AccountsPayableService.updateStatus(ap.id, newStatus),
            ];
          case 1:
            _a.sent();
            sonner_1.toast.success("Status atualizado com sucesso!");
            loadAccountsPayable();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error updating AP status:", error_4);
            sonner_1.toast.error("Erro ao atualizar status");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleFormSuccess = () => {
    loadAccountsPayable();
    setSelectedAP(undefined);
  };
  var formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  var formatDate = (date) =>
    (0, date_fns_1.format)(new Date(date), "dd/MM/yyyy", { locale: locale_1.ptBR });
  var getStatusBadge = (status) => {
    var statusMap = {
      draft: {
        label: "Rascunho",
        variant: "secondary",
        icon: lucide_react_1.FileText,
      },
      pending: { label: "Pendente", variant: "default", icon: lucide_react_1.Clock },
      approved: {
        label: "Aprovado",
        variant: "default",
        icon: lucide_react_1.CheckCircle,
      },
      scheduled: {
        label: "Agendado",
        variant: "secondary",
        icon: lucide_react_1.Calendar,
      },
      paid: { label: "Pago", variant: "default", icon: lucide_react_1.CheckCircle },
      partially_paid: {
        label: "Pago Parcial",
        variant: "secondary",
        icon: lucide_react_1.Clock,
      },
      overdue: {
        label: "Vencido",
        variant: "destructive",
        icon: lucide_react_1.AlertTriangle,
      },
      disputed: {
        label: "Disputado",
        variant: "destructive",
        icon: lucide_react_1.AlertTriangle,
      },
      cancelled: {
        label: "Cancelado",
        variant: "outline",
        icon: lucide_react_1.Trash2,
      },
      refunded: {
        label: "Reembolsado",
        variant: "outline",
        icon: lucide_react_1.CheckCircle,
      },
    };
    var statusInfo = statusMap[status] || statusMap.pending;
    var Icon = statusInfo.icon;
    return (
      <badge_1.Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </badge_1.Badge>
    );
  };
  var getPriorityBadge = (priority) => {
    var priorityMap = {
      low: { label: "Baixa", variant: "outline" },
      normal: { label: "Normal", variant: "secondary" },
      high: { label: "Alta", variant: "default" },
      urgent: { label: "Urgente", variant: "destructive" },
    };
    var priorityInfo = priorityMap[priority] || priorityMap.normal;
    return <badge_1.Badge variant={priorityInfo.variant}>{priorityInfo.label}</badge_1.Badge>;
  };
  var isOverdue = (dueDate, status) => {
    var today = new Date();
    var due = new Date(dueDate);
    return due < today && ["pending", "approved", "scheduled"].includes(status);
  };
  var totalPages = Math.ceil(totalAP / pageSize);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie todas as contas a pagar</p>
        </div>
        <button_1.Button onClick={() => setShowForm(true)}>
          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
          Nova Conta a Pagar
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar por número AP, fatura ou descrição..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select_1.Select
                value={filters.vendor_id || "all"}
                onValueChange={(value) =>
                  handleFilterChange("vendor_id", value === "all" ? undefined : value)
                }
              >
                <select_1.SelectTrigger className="w-[180px]">
                  <select_1.SelectValue placeholder="Fornecedor" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os fornecedores</select_1.SelectItem>
                  {vendors.map((vendor) => (
                    <select_1.SelectItem key={vendor.id} value={vendor.value}>
                      {vendor.label}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? undefined : value)
                }
              >
                <select_1.SelectTrigger className="w-[140px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="draft">Rascunho</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="approved">Aprovado</select_1.SelectItem>
                  <select_1.SelectItem value="scheduled">Agendado</select_1.SelectItem>
                  <select_1.SelectItem value="paid">Pago</select_1.SelectItem>
                  <select_1.SelectItem value="overdue">Vencido</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  handleFilterChange("priority", value === "all" ? undefined : value)
                }
              >
                <select_1.SelectTrigger className="w-[120px]">
                  <select_1.SelectValue placeholder="Prioridade" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                  <select_1.SelectItem value="normal">Normal</select_1.SelectItem>
                  <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                  <select_1.SelectItem value="urgent">Urgente</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={filters.expense_category_id || "all"}
                onValueChange={(value) =>
                  handleFilterChange("expense_category_id", value === "all" ? undefined : value)
                }
              >
                <select_1.SelectTrigger className="w-[160px]">
                  <select_1.SelectValue placeholder="Categoria" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                  {categories.map((category) => (
                    <select_1.SelectItem key={category.id} value={category.value}>
                      {category.label}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Table */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Número AP / Fatura</table_1.TableHead>
                <table_1.TableHead>Fornecedor</table_1.TableHead>
                <table_1.TableHead>Vencimento</table_1.TableHead>
                <table_1.TableHead>Valor</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Prioridade</table_1.TableHead>
                <table_1.TableHead className="w-[50px]"></table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {loading
                ? <table_1.TableRow>
                    <table_1.TableCell colSpan={7} className="text-center py-8">
                      <lucide_react_1.Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Carregando contas a pagar...
                      </p>
                    </table_1.TableCell>
                  </table_1.TableRow>
                : accountsPayable.length === 0
                  ? <table_1.TableRow>
                      <table_1.TableCell colSpan={7} className="text-center py-8">
                        <lucide_react_1.FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          {Object.values(filters).some((v) => v !== undefined && v !== "")
                            ? "Nenhuma conta a pagar encontrada com os filtros aplicados"
                            : "Nenhuma conta a pagar cadastrada"}
                        </p>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  : accountsPayable.map((ap) => {
                      var _a, _b;
                      return (
                        <table_1.TableRow key={ap.id}>
                          <table_1.TableCell>
                            <div>
                              <div className="font-medium">{ap.ap_number}</div>
                              {ap.invoice_number && (
                                <div className="text-sm text-muted-foreground">
                                  Fatura: {ap.invoice_number}
                                </div>
                              )}
                            </div>
                          </table_1.TableCell>

                          <table_1.TableCell>
                            <div>
                              <div className="font-medium">
                                {(_a = ap.vendor) === null || _a === void 0
                                  ? void 0
                                  : _a.company_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(_b = ap.expense_category) === null || _b === void 0
                                  ? void 0
                                  : _b.category_name}
                              </div>
                            </div>
                          </table_1.TableCell>

                          <table_1.TableCell>
                            <div
                              className={(0, utils_1.cn)(
                                "text-sm",
                                isOverdue(ap.due_date, ap.status) && "text-destructive font-medium",
                              )}
                            >
                              {formatDate(ap.due_date)}
                              {isOverdue(ap.due_date, ap.status) && (
                                <div className="flex items-center gap-1 text-destructive">
                                  <lucide_react_1.AlertTriangle className="h-3 w-3" />
                                  Vencido
                                </div>
                              )}
                            </div>
                          </table_1.TableCell>

                          <table_1.TableCell>
                            <div>
                              <div className="font-medium">{formatCurrency(ap.balance_amount)}</div>
                              {ap.balance_amount < ap.net_amount && (
                                <div className="text-sm text-muted-foreground">
                                  de {formatCurrency(ap.net_amount)}
                                </div>
                              )}
                            </div>
                          </table_1.TableCell>

                          <table_1.TableCell>{getStatusBadge(ap.status)}</table_1.TableCell>

                          <table_1.TableCell>{getPriorityBadge(ap.priority)}</table_1.TableCell>

                          <table_1.TableCell>
                            <dropdown_menu_1.DropdownMenu>
                              <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                  <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                                </button_1.Button>
                              </dropdown_menu_1.DropdownMenuTrigger>
                              <dropdown_menu_1.DropdownMenuContent align="end">
                                <dropdown_menu_1.DropdownMenuItem onClick={() => handleEdit(ap)}>
                                  <lucide_react_1.Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </dropdown_menu_1.DropdownMenuItem>

                                {ap.status === "pending" && (
                                  <dropdown_menu_1.DropdownMenuItem
                                    onClick={() => handleStatusUpdate(ap, "approved")}
                                  >
                                    <lucide_react_1.CheckCircle className="mr-2 h-4 w-4" />
                                    Aprovar
                                  </dropdown_menu_1.DropdownMenuItem>
                                )}

                                <dropdown_menu_1.DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setApToDelete(ap);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <lucide_react_1.Trash2 className="mr-2 h-4 w-4" />
                                  Deletar
                                </dropdown_menu_1.DropdownMenuItem>
                              </dropdown_menu_1.DropdownMenuContent>
                            </dropdown_menu_1.DropdownMenu>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
            </table_1.TableBody>
          </table_1.Table>
        </card_1.CardContent>
      </card_1.Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, totalAP)} de {totalAP} contas a pagar
          </div>
          <div className="flex items-center gap-2">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button_1.Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                var pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                return (
                  <button_1.Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button_1.Button>
                );
              })}
            </div>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </button_1.Button>
          </div>
        </div>
      )}

      {/* AP Form Dialog */}
      <accounts_payable_form_1.AccountsPayableForm
        accountsPayable={selectedAP}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setSelectedAP(undefined);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <dialog_1.Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Confirmar Exclusão</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Tem certeza de que deseja deletar a conta a pagar "
              {apToDelete === null || apToDelete === void 0 ? void 0 : apToDelete.ap_number}"? Esta
              ação não pode ser desfeita.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
