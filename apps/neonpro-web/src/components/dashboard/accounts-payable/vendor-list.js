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
exports.VendorList = VendorList;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var vendors_1 = require("@/lib/services/vendors");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var vendor_form_1 = require("./vendor-form");
function VendorList() {
  var _a = (0, react_1.useState)([]),
    vendors = _a[0],
    setVendors = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(0),
    totalVendors = _c[0],
    setTotalVendors = _c[1];
  var _d = (0, react_1.useState)(1),
    currentPage = _d[0],
    setCurrentPage = _d[1];
  var pageSize = (0, react_1.useState)(20)[0];
  // Form state
  var _e = (0, react_1.useState)(false),
    showForm = _e[0],
    setShowForm = _e[1];
  var _f = (0, react_1.useState)(),
    selectedVendor = _f[0],
    setSelectedVendor = _f[1];
  var _g = (0, react_1.useState)(false),
    showDeleteDialog = _g[0],
    setShowDeleteDialog = _g[1];
  var _h = (0, react_1.useState)(null),
    vendorToDelete = _h[0],
    setVendorToDelete = _h[1];
  var _j = (0, react_1.useState)(false),
    deleteLoading = _j[0],
    setDeleteLoading = _j[1];
  // Filters
  var _k = (0, react_1.useState)({
      search: "",
      vendor_type: undefined,
      is_active: undefined,
      payment_method: undefined,
      requires_approval: undefined,
    }),
    filters = _k[0],
    setFilters = _k[1];
  (0, react_1.useEffect)(() => {
    loadVendors();
  }, [filters, currentPage]);
  var loadVendors = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [
              4 /*yield*/,
              vendors_1.VendorService.getVendors(filters, currentPage, pageSize),
            ];
          case 1:
            response = _a.sent();
            setVendors(response.vendors);
            setTotalVendors(response.total);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error loading vendors:", error_1);
            sonner_1.toast.error("Erro ao carregar fornecedores");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
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
  var handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setShowForm(true);
  };
  var handleDelete = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!vendorToDelete) return [2 /*return*/];
            setDeleteLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              vendors_1.VendorService.deleteVendor(vendorToDelete.id, "Deletado pelo usuário"),
            ];
          case 2:
            _a.sent();
            sonner_1.toast.success("Fornecedor deletado com sucesso!");
            loadVendors();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error deleting vendor:", error_2);
            sonner_1.toast.error("Erro ao deletar fornecedor");
            return [3 /*break*/, 5];
          case 4:
            setDeleteLoading(false);
            setShowDeleteDialog(false);
            setVendorToDelete(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleToggleStatus = (vendor) =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              vendors_1.VendorService.toggleVendorStatus(vendor.id, !vendor.is_active),
            ];
          case 1:
            _a.sent();
            sonner_1.toast.success(
              "Fornecedor ".concat(!vendor.is_active ? "ativado" : "desativado", " com sucesso!"),
            );
            loadVendors();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error toggling vendor status:", error_3);
            sonner_1.toast.error("Erro ao alterar status do fornecedor");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleFormSuccess = () => {
    loadVendors();
    setSelectedVendor(undefined);
  };
  var formatCurrency = (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  var formatPhone = (phone) => {
    if (!phone) return "-";
    return phone;
  };
  var getVendorTypeBadge = (type) => {
    var types = {
      supplier: { label: "Fornecedor", variant: "default" },
      service_provider: { label: "Prestador", variant: "secondary" },
      contractor: { label: "Empreiteiro", variant: "outline" },
      consultant: { label: "Consultor", variant: "secondary" },
      other: { label: "Outro", variant: "outline" },
    };
    var typeInfo = types[type] || types.other;
    return <badge_1.Badge variant={typeInfo.variant}>{typeInfo.label}</badge_1.Badge>;
  };
  var getPaymentMethodBadge = (method) => {
    var methods = {
      cash: "Dinheiro",
      check: "Cheque",
      bank_transfer: "Transferência",
      pix: "PIX",
      credit_card: "Cartão",
      other: "Outro",
    };
    return methods[method] || method;
  };
  var totalPages = Math.ceil(totalVendors / pageSize);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie os fornecedores do sistema</p>
        </div>
        <button_1.Button onClick={() => setShowForm(true)}>
          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar por nome, código ou contato..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <select_1.Select
              value={filters.vendor_type || "all"}
              onValueChange={(value) =>
                handleFilterChange("vendor_type", value === "all" ? undefined : value)
              }
            >
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Tipo" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                <select_1.SelectItem value="supplier">Fornecedor</select_1.SelectItem>
                <select_1.SelectItem value="service_provider">Prestador</select_1.SelectItem>
                <select_1.SelectItem value="contractor">Empreiteiro</select_1.SelectItem>
                <select_1.SelectItem value="consultant">Consultor</select_1.SelectItem>
                <select_1.SelectItem value="other">Outro</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.is_active === undefined ? "all" : filters.is_active.toString()}
              onValueChange={(value) =>
                handleFilterChange("is_active", value === "all" ? undefined : value === "true")
              }
            >
              <select_1.SelectTrigger className="w-[120px]">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="true">Ativos</select_1.SelectItem>
                <select_1.SelectItem value="false">Inativos</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={filters.payment_method || "all"}
              onValueChange={(value) =>
                handleFilterChange("payment_method", value === "all" ? undefined : value)
              }
            >
              <select_1.SelectTrigger className="w-[140px]">
                <select_1.SelectValue placeholder="Pagamento" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                <select_1.SelectItem value="cash">Dinheiro</select_1.SelectItem>
                <select_1.SelectItem value="pix">PIX</select_1.SelectItem>
                <select_1.SelectItem value="bank_transfer">Transferência</select_1.SelectItem>
                <select_1.SelectItem value="check">Cheque</select_1.SelectItem>
                <select_1.SelectItem value="credit_card">Cartão</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Table */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Fornecedor</table_1.TableHead>
                <table_1.TableHead>Contato</table_1.TableHead>
                <table_1.TableHead>Tipo</table_1.TableHead>
                <table_1.TableHead>Pagamento</table_1.TableHead>
                <table_1.TableHead>Prazo</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead className="w-[50px]"></table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {loading
                ? <table_1.TableRow>
                    <table_1.TableCell colSpan={7} className="text-center py-8">
                      <lucide_react_1.Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Carregando fornecedores...
                      </p>
                    </table_1.TableCell>
                  </table_1.TableRow>
                : vendors.length === 0
                  ? <table_1.TableRow>
                      <table_1.TableCell colSpan={7} className="text-center py-8">
                        <lucide_react_1.Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          {filters.search || filters.vendor_type || filters.is_active !== undefined
                            ? "Nenhum fornecedor encontrado com os filtros aplicados"
                            : "Nenhum fornecedor cadastrado"}
                        </p>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  : vendors.map((vendor) => (
                      <table_1.TableRow key={vendor.id}>
                        <table_1.TableCell>
                          <div>
                            <div className="font-medium">{vendor.company_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor.vendor_code}
                            </div>
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="space-y-1">
                            {vendor.contact_person && (
                              <div className="text-sm">{vendor.contact_person}</div>
                            )}
                            {vendor.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <lucide_react_1.Mail className="h-3 w-3" />
                                {vendor.email}
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <lucide_react_1.Phone className="h-3 w-3" />
                                {formatPhone(vendor.phone)}
                              </div>
                            )}
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          {getVendorTypeBadge(vendor.vendor_type)}
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="text-sm">
                            {getPaymentMethodBadge(vendor.payment_method)}
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="text-sm">{vendor.payment_terms_days} dias</div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            <badge_1.Badge variant={vendor.is_active ? "default" : "secondary"}>
                              {vendor.is_active ? "Ativo" : "Inativo"}
                            </badge_1.Badge>
                            {vendor.requires_approval && (
                              <badge_1.Badge variant="outline" className="text-xs">
                                Aprovação
                              </badge_1.Badge>
                            )}
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                              <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                              </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end">
                              <dropdown_menu_1.DropdownMenuItem onClick={() => handleEdit(vendor)}>
                                <lucide_react_1.Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => handleToggleStatus(vendor)}
                              >
                                {vendor.is_active
                                  ? <lucide_react_1.ToggleLeft className="mr-2 h-4 w-4" />
                                  : <lucide_react_1.ToggleRight className="mr-2 h-4 w-4" />}
                                {vendor.is_active ? "Desativar" : "Ativar"}
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setVendorToDelete(vendor);
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
                    ))}
            </table_1.TableBody>
          </table_1.Table>
        </card_1.CardContent>
      </card_1.Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, totalVendors)} de {totalVendors} fornecedores
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

      {/* Vendor Form Dialog */}
      <vendor_form_1.VendorForm
        vendor={selectedVendor}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setSelectedVendor(undefined);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <dialog_1.Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Confirmar Exclusão</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Tem certeza de que deseja deletar o fornecedor "
              {vendorToDelete === null || vendorToDelete === void 0
                ? void 0
                : vendorToDelete.company_name}
              "? Esta ação não pode ser desfeita.
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
