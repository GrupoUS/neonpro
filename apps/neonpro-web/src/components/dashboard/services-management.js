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
exports.ServicesManagement = ServicesManagement;
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
var use_billing_1 = require("@/hooks/use-billing");
var billing_1 = require("@/types/billing");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function ServicesManagement() {
  var _a;
  var _b = (0, use_billing_1.useBilling)(),
    loading = _b.loading,
    services = _b.services,
    fetchServices = _b.fetchServices,
    createService = _b.createService,
    updateService = _b.updateService,
    deleteService = _b.deleteService;
  var _c = (0, react_1.useState)(""),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var _d = (0, react_1.useState)({}),
    filters = _d[0],
    setFilters = _d[1];
  var _e = (0, react_1.useState)(false),
    isCreateDialogOpen = _e[0],
    setIsCreateDialogOpen = _e[1];
  var _f = (0, react_1.useState)(null),
    editingService = _f[0],
    setEditingService = _f[1];
  var _g = (0, react_1.useState)({
      name: "",
      description: "",
      type: "consultation",
      base_price: "",
      duration_minutes: "60",
      category: "",
      requires_appointment: true,
      max_sessions: "",
    }),
    formData = _g[0],
    setFormData = _g[1];
  // Load services on component mount
  (0, react_1.useEffect)(() => {
    fetchServices(filters);
  }, [fetchServices, filters]);
  // Filter services based on search term
  var filteredServices = services.filter((service) => {
    var _a, _b;
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((_a = service.description) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_b = service.category) === null || _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  var resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "consultation",
      base_price: "",
      duration_minutes: "60",
      category: "",
      requires_appointment: true,
      max_sessions: "",
    });
    setEditingService(null);
  };
  var openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  var openEditDialog = (service) => {
    var _a, _b;
    setFormData({
      name: service.name,
      description: service.description || "",
      type: service.type,
      base_price: service.base_price.toString(),
      duration_minutes:
        ((_a = service.duration_minutes) === null || _a === void 0 ? void 0 : _a.toString()) ||
        "60",
      category: service.category || "",
      requires_appointment: service.requires_appointment,
      max_sessions:
        ((_b = service.max_sessions) === null || _b === void 0 ? void 0 : _b.toString()) || "",
    });
    setEditingService(service);
    setIsCreateDialogOpen(true);
  };
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var serviceData, success;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.name.trim()) {
              sonner_1.toast.error("Nome do serviço é obrigatório");
              return [2 /*return*/];
            }
            if (!formData.base_price || parseFloat(formData.base_price) < 0) {
              sonner_1.toast.error("Preço base deve ser maior que zero");
              return [2 /*return*/];
            }
            serviceData = {
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              type: formData.type,
              base_price: parseFloat(formData.base_price),
              duration_minutes: formData.duration_minutes
                ? parseInt(formData.duration_minutes)
                : undefined,
              category: formData.category.trim() || undefined,
              requires_appointment: formData.requires_appointment,
              max_sessions: formData.max_sessions ? parseInt(formData.max_sessions) : undefined,
            };
            success = false;
            if (!editingService) return [3 /*break*/, 2];
            return [4 /*yield*/, updateService(editingService.id, serviceData)];
          case 1:
            success = _a.sent() !== null;
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, createService(serviceData)];
          case 3:
            success = _a.sent() !== null;
            _a.label = 4;
          case 4:
            if (success) {
              setIsCreateDialogOpen(false);
              resetForm();
            }
            return [2 /*return*/];
        }
      });
    });
  var handleDelete = (service) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, deleteService(service.id)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  var getServiceTypeLabel = (type) => {
    var serviceType = billing_1.SERVICE_TYPES.find((t) => t.value === type);
    return (serviceType === null || serviceType === void 0 ? void 0 : serviceType.label) || type;
  };
  var getServiceTypeColor = (type) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "procedure":
        return "bg-purple-100 text-purple-800";
      case "package":
        return "bg-orange-100 text-orange-800";
      case "maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
          <p className="text-muted-foreground">Configure os serviços oferecidos pela clínica</p>
        </div>

        <button_1.Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <lucide_react_1.Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </button_1.Button>
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
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select_1.Select
                value={((_a = filters.type) === null || _a === void 0 ? void 0 : _a[0]) || "all"}
                onValueChange={(value) =>
                  setFilters((prev) =>
                    __assign(__assign({}, prev), {
                      type: value === "all" ? undefined : [value],
                    }),
                  )
                }
              >
                <select_1.SelectTrigger className="w-[180px]">
                  <select_1.SelectValue placeholder="Tipo de serviço" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                  {billing_1.SERVICE_TYPES.map((type) => (
                    <select_1.SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={filters.is_active === undefined ? "all" : filters.is_active.toString()}
                onValueChange={(value) =>
                  setFilters((prev) =>
                    __assign(__assign({}, prev), {
                      is_active: value === "all" ? undefined : value === "true",
                    }),
                  )
                }
              >
                <select_1.SelectTrigger className="w-[120px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="true">Ativo</select_1.SelectItem>
                  <select_1.SelectItem value="false">Inativo</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <card_1.Card key={i} className="animate-pulse">
                <card_1.CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))
          : filteredServices.length === 0
            ? <div className="col-span-full text-center py-12">
                <lucide_react_1.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum serviço encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando seu primeiro serviço"}
                </p>
                {!searchTerm && (
                  <button_1.Button onClick={openCreateDialog}>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Serviço
                  </button_1.Button>
                )}
              </div>
            : filteredServices.map((service) => (
                <card_1.Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
                  <card_1.CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <card_1.CardTitle className="text-lg">{service.name}</card_1.CardTitle>
                        {service.category && (
                          <card_1.CardDescription>{service.category}</card_1.CardDescription>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                        >
                          <lucide_react_1.Edit className="h-4 w-4" />
                        </button_1.Button>

                        <alert_dialog_1.AlertDialog>
                          <alert_dialog_1.AlertDialogTrigger asChild>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Trash2 className="h-4 w-4 text-destructive" />
                            </button_1.Button>
                          </alert_dialog_1.AlertDialogTrigger>
                          <alert_dialog_1.AlertDialogContent>
                            <alert_dialog_1.AlertDialogHeader>
                              <alert_dialog_1.AlertDialogTitle>
                                Excluir Serviço
                              </alert_dialog_1.AlertDialogTitle>
                              <alert_dialog_1.AlertDialogDescription>
                                Tem certeza que deseja excluir o serviço "{service.name}"? Esta ação
                                não pode ser desfeita.
                              </alert_dialog_1.AlertDialogDescription>
                            </alert_dialog_1.AlertDialogHeader>
                            <alert_dialog_1.AlertDialogFooter>
                              <alert_dialog_1.AlertDialogCancel>
                                Cancelar
                              </alert_dialog_1.AlertDialogCancel>
                              <alert_dialog_1.AlertDialogAction
                                onClick={() => handleDelete(service)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </alert_dialog_1.AlertDialogAction>
                            </alert_dialog_1.AlertDialogFooter>
                          </alert_dialog_1.AlertDialogContent>
                        </alert_dialog_1.AlertDialog>
                      </div>
                    </div>
                  </card_1.CardHeader>

                  <card_1.CardContent className="space-y-4">
                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <badge_1.Badge className={getServiceTypeColor(service.type)}>
                        {getServiceTypeLabel(service.type)}
                      </badge_1.Badge>

                      {!service.is_active && (
                        <badge_1.Badge variant="secondary">Inativo</badge_1.Badge>
                      )}
                    </div>

                    <separator_1.Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">R$ {service.base_price.toFixed(2)}</span>
                      </div>

                      {service.duration_minutes && (
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{service.duration_minutes}min</span>
                        </div>
                      )}
                    </div>

                    {service.max_sessions && (
                      <div className="text-sm text-muted-foreground">
                        Máximo de {service.max_sessions} sessões
                      </div>
                    )}
                  </card_1.CardContent>
                </card_1.Card>
              ))}
      </div>

      {/* Create/Edit Dialog */}
      <dialog_1.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {editingService
                ? "Altere as informações do serviço abaixo"
                : "Preencha as informações do novo serviço"}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="name">Nome do Serviço *</label_1.Label>
                <input_1.Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => __assign(__assign({}, prev), { name: e.target.value }))
                  }
                  placeholder="Ex: Consulta Dermatológica"
                  required
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="type">Tipo de Serviço *</label_1.Label>
                <select_1.Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => __assign(__assign({}, prev), { type: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {billing_1.SERVICE_TYPES.map((type) => (
                      <select_1.SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="description">Descrição</label_1.Label>
              <textarea_1.Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), { description: e.target.value }),
                  )
                }
                placeholder="Descreva o serviço oferecido..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="base_price">Preço Base (R$) *</label_1.Label>
                <input_1.Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData((prev) =>
                      __assign(__assign({}, prev), { base_price: e.target.value }),
                    )
                  }
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="duration_minutes">Duração (min)</label_1.Label>
                <input_1.Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) =>
                      __assign(__assign({}, prev), { duration_minutes: e.target.value }),
                    )
                  }
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="max_sessions">Máx. Sessões</label_1.Label>
                <input_1.Input
                  id="max_sessions"
                  type="number"
                  min="1"
                  value={formData.max_sessions}
                  onChange={(e) =>
                    setFormData((prev) =>
                      __assign(__assign({}, prev), { max_sessions: e.target.value }),
                    )
                  }
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="category">Categoria</label_1.Label>
              <input_1.Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => __assign(__assign({}, prev), { category: e.target.value }))
                }
                placeholder="Ex: Dermatologia, Estética"
              />
            </div>

            <div className="flex items-center space-x-2">
              <switch_1.Switch
                id="requires_appointment"
                checked={formData.requires_appointment}
                onCheckedChange={(checked) =>
                  setFormData((prev) =>
                    __assign(__assign({}, prev), { requires_appointment: checked }),
                  )
                }
              />
              <label_1.Label htmlFor="requires_appointment">Requer agendamento</label_1.Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={loading}>
                {editingService ? "Atualizar" : "Criar"} Serviço
              </button_1.Button>
            </div>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
