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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CustomerList;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var crm_context_1 = require("@/contexts/crm-context");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function CustomerList(_a) {
  var onCustomerSelect = _a.onCustomerSelect,
    onCreateCustomer = _a.onCreateCustomer,
    onEditCustomer = _a.onEditCustomer;
  var _b = (0, crm_context_1.useCRM)(),
    state = _b.state,
    dispatch = _b.dispatch,
    filteredCustomers = _b.filteredCustomers,
    totalCustomers = _b.totalCustomers,
    activeCustomers = _b.activeCustomers,
    vipCustomers = _b.vipCustomers,
    setFilter = _b.setFilter,
    resetFilters = _b.resetFilters,
    setLoading = _b.setLoading,
    setError = _b.setError;
  var _c = (0, react_1.useState)([]),
    selectedCustomers = _c[0],
    setSelectedCustomers = _c[1];
  // Mock data for development - will be replaced with real data
  (0, react_1.useEffect)(() => {
    var loadCustomers = () =>
      __awaiter(this, void 0, void 0, function () {
        var mockCustomers, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setLoading("customers", true);
              setError("customers", undefined);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              mockCustomers = [
                {
                  id: "1",
                  profile_id: "profile-1",
                  profile: {
                    full_name: "Ana Silva Santos",
                    email: "ana.silva@email.com",
                    phone: "(11) 99999-1234",
                  },
                  customer_since: "2024-01-15",
                  lifetime_value: 3450.0,
                  last_treatment: "2024-12-20",
                  last_visit: "2024-12-20",
                  total_visits: 8,
                  preferred_contact_method: "whatsapp",
                  notes: "Prefere horários pela manhã. Alérgica a produtos com parabenos.",
                  tags: ["vip", "fidelizada"],
                  status: "vip",
                  created_at: "2024-01-15T10:00:00Z",
                  updated_at: "2024-12-20T15:30:00Z",
                },
                {
                  id: "2",
                  profile_id: "profile-2",
                  profile: {
                    full_name: "Maria Oliveira Costa",
                    email: "maria.costa@email.com",
                    phone: "(11) 98888-5678",
                  },
                  customer_since: "2024-06-10",
                  lifetime_value: 1250.0,
                  last_treatment: "2024-11-15",
                  last_visit: "2024-11-15",
                  total_visits: 4,
                  preferred_contact_method: "email",
                  notes: "Interessada em tratamentos anti-idade.",
                  tags: ["regular"],
                  status: "active",
                  created_at: "2024-06-10T14:00:00Z",
                  updated_at: "2024-11-15T16:45:00Z",
                },
                {
                  id: "3",
                  profile_id: "profile-3",
                  profile: {
                    full_name: "Juliana Ferreira Lima",
                    email: "juliana.lima@email.com",
                    phone: "(11) 97777-9012",
                  },
                  customer_since: "2024-03-22",
                  lifetime_value: 850.0,
                  last_treatment: "2024-08-30",
                  last_visit: "2024-08-30",
                  total_visits: 2,
                  preferred_contact_method: "phone",
                  notes: "Cliente nova, ainda experimentando os serviços.",
                  tags: ["nova"],
                  status: "inactive",
                  created_at: "2024-03-22T09:30:00Z",
                  updated_at: "2024-08-30T11:20:00Z",
                },
                {
                  id: "4",
                  profile_id: "profile-4",
                  profile: {
                    full_name: "Carla Mendes Souza",
                    email: "carla.souza@email.com",
                    phone: "(11) 96666-3456",
                  },
                  customer_since: "2023-11-08",
                  lifetime_value: 5200.0,
                  last_treatment: "2024-12-18",
                  last_visit: "2024-12-18",
                  total_visits: 15,
                  preferred_contact_method: "whatsapp",
                  notes: "Cliente fidelíssima, sempre indica amigas.",
                  tags: ["vip", "embaixadora"],
                  status: "vip",
                  created_at: "2023-11-08T16:15:00Z",
                  updated_at: "2024-12-18T14:00:00Z",
                },
              ];
              // Simulate API delay
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 800))];
            case 2:
              // Simulate API delay
              _a.sent();
              // In real app, this would be:
              // const { data: customers, error } = await supabase
              //   .from('customers')
              //   .select(`
              //     *,
              //     profile:profiles(full_name, email, phone)
              //   `)
              //   .eq('profiles.clinic_id', userClinicId);
              // if (error) throw error;
              // For now, dispatch mock data
              dispatch({ type: "SET_CUSTOMERS", payload: mockCustomers });
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Error loading customers:", error_1);
              setError("customers", "Erro ao carregar clientes. Tente novamente.");
              return [3 /*break*/, 5];
            case 4:
              setLoading("customers", false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    loadCustomers();
  }, [setLoading, setError, dispatch]);
  var handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
  };
  var handleSelectCustomer = (customerId) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));
    } else {
      setSelectedCustomers((prev) =>
        __spreadArray(__spreadArray([], prev, true), [customerId], false),
      );
    }
  };
  var getStatusBadge = (status) => {
    var variants = {
      active: { variant: "default", label: "Ativo" },
      vip: { variant: "secondary", label: "VIP" },
      inactive: { variant: "outline", label: "Inativo" },
      blocked: { variant: "destructive", label: "Bloqueado" },
    };
    var config = variants[status];
    return <badge_1.Badge variant={config.variant}>{config.label}</badge_1.Badge>;
  };
  var handleExportCustomers = () => {
    // Create CSV content
    var headers = [
      "Nome",
      "Email",
      "Telefone",
      "Status",
      "Valor Total",
      "Última Visita",
      "Total de Visitas",
    ];
    var csvContent = __spreadArray(
      [headers.join(",")],
      filteredCustomers.map((customer) => {
        var _a, _b, _c;
        return [
          ((_a = customer.profile) === null || _a === void 0 ? void 0 : _a.full_name) || "",
          ((_b = customer.profile) === null || _b === void 0 ? void 0 : _b.email) || "",
          ((_c = customer.profile) === null || _c === void 0 ? void 0 : _c.phone) || "",
          customer.status,
          customer.lifetime_value.toString(),
          customer.last_visit ? (0, utils_1.formatDate)(customer.last_visit) : "",
          customer.total_visits.toString(),
        ].join(",");
      }),
      true,
    ).join("\n");
    // Download CSV
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clientes-".concat(new Date().toISOString().split("T")[0], ".csv");
    link.click();
  };
  if (state.loading.customers) {
    return (
      <card_1.Card className="w-full">
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando clientes...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (state.errors.customers) {
    return (
      <card_1.Card className="w-full">
        <card_1.CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{state.errors.customers}</p>
            <button_1.Button onClick={() => window.location.reload()} className="mt-4">
              Tentar Novamente
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                👥
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                ✅
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes VIP</p>
                <p className="text-2xl font-bold">{vipCustomers}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                ⭐
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Customer List */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <card_1.CardTitle>Clientes</card_1.CardTitle>

            <div className="flex items-center gap-2">
              <button_1.Button onClick={handleExportCustomers} variant="outline" size="sm">
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar
              </button_1.Button>
              {onCreateCustomer && (
                <button_1.Button onClick={onCreateCustomer} size="sm">
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </button_1.Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input_1.Input
                placeholder="Buscar por nome ou email..."
                value={state.filters.customer_search}
                onChange={(e) => setFilter("customer_search", e.target.value)}
                className="pl-10"
              />
            </div>

            <select_1.Select
              value={state.filters.customer_status}
              onValueChange={(value) => setFilter("customer_status", value)}
            >
              <select_1.SelectTrigger className="w-full sm:w-[180px]">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="">Todos</select_1.SelectItem>
                <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
                <select_1.SelectItem value="vip">VIP</select_1.SelectItem>
                <select_1.SelectItem value="inactive">Inativo</select_1.SelectItem>
                <select_1.SelectItem value="blocked">Bloqueado</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            {(state.filters.customer_search || state.filters.customer_status) && (
              <button_1.Button onClick={resetFilters} variant="outline" size="sm">
                Limpar Filtros
              </button_1.Button>
            )}
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="p-0">
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedCustomers.length === filteredCustomers.length &&
                        filteredCustomers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </table_1.TableHead>
                  <table_1.TableHead>Cliente</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Valor Total</table_1.TableHead>
                  <table_1.TableHead>Última Visita</table_1.TableHead>
                  <table_1.TableHead>Visitas</table_1.TableHead>
                  <table_1.TableHead className="w-12"></table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredCustomers.length === 0
                  ? <table_1.TableRow>
                      <table_1.TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {state.filters.customer_search || state.filters.customer_status
                            ? <>Nenhum cliente encontrado com os filtros aplicados.</>
                            : <>Nenhum cliente cadastrado ainda.</>}
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  : filteredCustomers.map((customer) => {
                      var _a, _b, _c;
                      return (
                        <table_1.TableRow
                          key={customer.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            onCustomerSelect === null || onCustomerSelect === void 0
                              ? void 0
                              : onCustomerSelect(customer)
                          }
                        >
                          <table_1.TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleSelectCustomer(customer.id)}
                              className="rounded border-gray-300"
                            />
                          </table_1.TableCell>
                          <table_1.TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {(_a = customer.profile) === null || _a === void 0
                                  ? void 0
                                  : _a.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(_b = customer.profile) === null || _b === void 0
                                  ? void 0
                                  : _b.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(_c = customer.profile) === null || _c === void 0
                                  ? void 0
                                  : _c.phone}
                              </p>
                            </div>
                          </table_1.TableCell>
                          <table_1.TableCell>{getStatusBadge(customer.status)}</table_1.TableCell>
                          <table_1.TableCell className="font-medium">
                            {(0, utils_1.formatCurrency)(customer.lifetime_value)}
                          </table_1.TableCell>
                          <table_1.TableCell>
                            {customer.last_visit
                              ? (0, utils_1.formatDate)(customer.last_visit)
                              : "-"}
                          </table_1.TableCell>
                          <table_1.TableCell>{customer.total_visits}</table_1.TableCell>
                          <table_1.TableCell onClick={(e) => e.stopPropagation()}>
                            <dropdown_menu_1.DropdownMenu>
                              <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" size="sm">
                                  <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                                </button_1.Button>
                              </dropdown_menu_1.DropdownMenuTrigger>
                              <dropdown_menu_1.DropdownMenuContent align="end">
                                <dropdown_menu_1.DropdownMenuLabel>
                                  Ações
                                </dropdown_menu_1.DropdownMenuLabel>
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem
                                  onClick={() =>
                                    onCustomerSelect === null || onCustomerSelect === void 0
                                      ? void 0
                                      : onCustomerSelect(customer)
                                  }
                                >
                                  Ver Detalhes
                                </dropdown_menu_1.DropdownMenuItem>
                                {onEditCustomer && (
                                  <dropdown_menu_1.DropdownMenuItem
                                    onClick={() => onEditCustomer(customer)}
                                  >
                                    Editar
                                  </dropdown_menu_1.DropdownMenuItem>
                                )}
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                                  Excluir
                                </dropdown_menu_1.DropdownMenuItem>
                              </dropdown_menu_1.DropdownMenuContent>
                            </dropdown_menu_1.DropdownMenu>
                          </table_1.TableCell>
                        </table_1.TableRow>
                      );
                    })}
              </table_1.TableBody>
            </table_1.Table>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Selected customers actions */}
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <span>{selectedCustomers.length} cliente(s) selecionado(s)</span>
            <button_1.Button size="sm" variant="secondary">
              Criar Campanha
            </button_1.Button>
            <button_1.Button size="sm" variant="secondary">
              Exportar Selecionados
            </button_1.Button>
          </div>
        </div>
      )}
    </div>
  );
}
