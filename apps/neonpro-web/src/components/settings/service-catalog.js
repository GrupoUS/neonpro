"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceCatalog;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var serviceCategories = [
    { value: "facial", label: "Tratamentos Faciais", color: "bg-blue-100 text-blue-800" },
    { value: "corporal", label: "Tratamentos Corporais", color: "bg-green-100 text-green-800" },
    { value: "depilacao", label: "Depilação", color: "bg-purple-100 text-purple-800" },
    { value: "massagem", label: "Massoterapia", color: "bg-yellow-100 text-yellow-800" },
    { value: "estetico", label: "Procedimentos Estéticos", color: "bg-pink-100 text-pink-800" },
    { value: "consulta", label: "Consultas", color: "bg-gray-100 text-gray-800" },
    { value: "manutencao", label: "Manutenção", color: "bg-orange-100 text-orange-800" },
];
var durationOptions = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1h" },
    { value: 90, label: "1h 30min" },
    { value: 120, label: "2h" },
    { value: 150, label: "2h 30min" },
    { value: 180, label: "3h" },
];
var serviceSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    category: z.string().min(1, "Categoria é obrigatória"),
    duration: z.number().min(15, "Duração mínima é 15 minutos"),
    price: z.number().min(0, "Preço deve ser maior que zero"),
    cost: z.number().min(0, "Custo deve ser maior ou igual a zero").optional(),
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
    requiresSpecialist: z.boolean().default(false),
    allowOnlineBooking: z.boolean().default(true),
    maxAdvanceBookingDays: z.number().min(0).max(365).optional(),
    minAdvanceBookingHours: z.number().min(0).max(168).optional(),
    sessionPackages: z.array(z.object({
        sessions: z.number().min(2),
        discountPercent: z.number().min(0).max(50),
    })).optional(),
    tags: z.string().optional(),
});
function ServiceCatalog() {
    var _this = this;
    var _a = (0, react_1.useState)([]), services = _a[0], setServices = _a[1];
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(false), isDialogOpen = _c[0], setIsDialogOpen = _c[1];
    var _d = (0, react_1.useState)(null), editingService = _d[0], setEditingService = _d[1];
    var _e = (0, react_1.useState)(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = (0, react_1.useState)("all"), filterCategory = _f[0], setFilterCategory = _f[1];
    var _g = (0, react_1.useState)("all"), filterStatus = _g[0], setFilterStatus = _g[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(serviceSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            duration: 60,
            price: 0,
            cost: 0,
            active: true,
            featured: false,
            requiresSpecialist: false,
            allowOnlineBooking: true,
            maxAdvanceBookingDays: 30,
            minAdvanceBookingHours: 2,
            sessionPackages: [],
            tags: "",
        },
    });
    // Load services
    (0, react_1.useEffect)(function () {
        var loadServices = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    // TODO: Replace with actual API call
                    // const response = await fetch("/api/settings/services");
                    // const data = await response.json();
                    // setServices(data);
                    // Mock data for demonstration
                    setServices([
                        {
                            id: "1",
                            name: "Limpeza de Pele Profunda",
                            description: "Limpeza completa com extração e hidratação",
                            category: "facial",
                            duration: 90,
                            price: 150.00,
                            cost: 45.00,
                            active: true,
                            featured: true,
                            requiresSpecialist: true,
                            allowOnlineBooking: true,
                            maxAdvanceBookingDays: 30,
                            minAdvanceBookingHours: 24,
                            tags: "limpeza, extração, hidratação",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            totalBookings: 45,
                            averageRating: 4.8,
                            revenue: 6750.00,
                        },
                        {
                            id: "2",
                            name: "Depilação a Laser - Face",
                            description: "Remoção de pelos faciais com laser diodo",
                            category: "depilacao",
                            duration: 30,
                            price: 80.00,
                            cost: 15.00,
                            active: true,
                            featured: false,
                            requiresSpecialist: true,
                            allowOnlineBooking: true,
                            maxAdvanceBookingDays: 60,
                            minAdvanceBookingHours: 4,
                            sessionPackages: [
                                { sessions: 6, discountPercent: 15 },
                                { sessions: 10, discountPercent: 25 },
                            ],
                            tags: "depilação, laser, face",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            totalBookings: 120,
                            averageRating: 4.9,
                            revenue: 9600.00,
                        },
                    ]);
                }
                catch (error) {
                    console.error("Erro ao carregar serviços:", error);
                    sonner_1.toast.error("Erro ao carregar catálogo de serviços");
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        loadServices();
    }, []);
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var updatedService_1, newService_1;
        return __generator(this, function (_a) {
            try {
                if (editingService) {
                    updatedService_1 = __assign(__assign(__assign({}, editingService), data), { updatedAt: new Date() });
                    setServices(function (prev) { return prev.map(function (service) {
                        return service.id === editingService.id ? updatedService_1 : service;
                    }); });
                    sonner_1.toast.success("Serviço atualizado com sucesso!");
                }
                else {
                    newService_1 = __assign(__assign({}, data), { id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() });
                    setServices(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newService_1], false); });
                    sonner_1.toast.success("Serviço adicionado com sucesso!");
                }
                setIsDialogOpen(false);
                setEditingService(null);
                form.reset();
            }
            catch (error) {
                console.error("Erro ao salvar serviço:", error);
                sonner_1.toast.error("Erro ao salvar serviço");
            }
            return [2 /*return*/];
        });
    }); };
    var handleEdit = function (service) {
        setEditingService(service);
        form.reset(__assign(__assign({}, service), { tags: service.tags || "" }));
        setIsDialogOpen(true);
    };
    var handleDelete = function (serviceId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (confirm("Tem certeza que deseja remover este serviço?")) {
                try {
                    setServices(function (prev) { return prev.filter(function (service) { return service.id !== serviceId; }); });
                    sonner_1.toast.success("Serviço removido com sucesso!");
                }
                catch (error) {
                    console.error("Erro ao remover serviço:", error);
                    sonner_1.toast.error("Erro ao remover serviço");
                }
            }
            return [2 /*return*/];
        });
    }); };
    var handleToggleActive = function (serviceId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setServices(function (prev) { return prev.map(function (service) {
                    return service.id === serviceId ? __assign(__assign({}, service), { active: !service.active, updatedAt: new Date() }) : service;
                }); });
                sonner_1.toast.success("Status atualizado com sucesso!");
            }
            catch (error) {
                console.error("Erro ao atualizar status:", error);
                sonner_1.toast.error("Erro ao atualizar status");
            }
            return [2 /*return*/];
        });
    }); };
    var handleToggleFeatured = function (serviceId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setServices(function (prev) { return prev.map(function (service) {
                    return service.id === serviceId ? __assign(__assign({}, service), { featured: !service.featured, updatedAt: new Date() }) : service;
                }); });
                sonner_1.toast.success("Destaque atualizado com sucesso!");
            }
            catch (error) {
                console.error("Erro ao atualizar destaque:", error);
                sonner_1.toast.error("Erro ao atualizar destaque");
            }
            return [2 /*return*/];
        });
    }); };
    var filteredServices = services.filter(function (service) {
        var matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (service.tags && service.tags.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesCategory = filterCategory === "all" || service.category === filterCategory;
        var matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && service.active) ||
            (filterStatus === "inactive" && !service.active) ||
            (filterStatus === "featured" && service.featured);
        return matchesSearch && matchesCategory && matchesStatus;
    });
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    var formatDuration = function (minutes) {
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? "".concat(hours, "h ").concat(mins, "min") : "".concat(hours, "h");
        }
        return "".concat(mins, "min");
    };
    var calculateProfit = function (price, cost) {
        if (cost === void 0) { cost = 0; }
        var profit = price - cost;
        var margin = price > 0 ? (profit / price) * 100 : 0;
        return { profit: profit, margin: margin };
    };
    return (<div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Catálogo de Serviços ({services.length})
          </h2>
          <p className="text-gray-600">
            Gerenciar serviços, preços e configurações
          </p>
        </div>
        
        <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button onClick={function () {
            setEditingService(null);
            form.reset();
        }}>
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Adicionar Serviço
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>
                {editingService ? "Editar Serviço" : "Adicionar Serviço"}
              </dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Configure os detalhes do serviço oferecido pela clínica
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            
            <form_1.Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">Informações Básicas</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <form_1.FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Nome do Serviço *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Limpeza de Pele Profunda" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="description" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Descrição</form_1.FormLabel>
                          <form_1.FormControl>
                            <textarea_1.Textarea placeholder="Descrição detalhada do serviço..." className="resize-none" rows={3} {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Máximo 500 caracteres. Descrição exibida aos pacientes.
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField control={form.control} name="category" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Categoria *</form_1.FormLabel>
                            <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Selecione a categoria"/>
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                {serviceCategories.map(function (category) { return (<select_1.SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </select_1.SelectItem>); })}
                              </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="duration" render={function (_a) {
            var _b;
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Duração *</form_1.FormLabel>
                            <select_1.Select value={(_b = field.value) === null || _b === void 0 ? void 0 : _b.toString()} onValueChange={function (value) { return field.onChange(parseInt(value)); }}>
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue placeholder="Selecione a duração"/>
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                {durationOptions.map(function (option) { return (<select_1.SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </select_1.SelectItem>); })}
                              </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>
                    </div>

                    <form_1.FormField control={form.control} name="tags" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Tags</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="limpeza, extração, hidratação" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Separar tags com vírgulas para facilitar a busca
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Pricing */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">Precificação</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField control={form.control} name="price" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Preço de Venda *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" step="0.01" min="0" placeholder="150.00" {...field} onChange={function (e) { return field.onChange(parseFloat(e.target.value) || 0); }}/>
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Preço cobrado do paciente (R$)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="cost" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Custo Operacional</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" step="0.01" min="0" placeholder="45.00" {...field} onChange={function (e) { return field.onChange(parseFloat(e.target.value) || 0); }}/>
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Custo para realizar o serviço (R$)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>
                    </div>

                    {/* Profit calculation display */}
                    {form.watch("price") > 0 && (<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>
                          <span className="font-medium text-green-800">Análise de Lucratividade</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Lucro por Sessão:</span>
                            <div className="font-bold text-green-700">
                              {formatCurrency(calculateProfit(form.watch("price"), form.watch("cost")).profit)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Margem de Lucro:</span>
                            <div className="font-bold text-green-700">
                              {calculateProfit(form.watch("price"), form.watch("cost")).margin.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>)}
                  </card_1.CardContent>
                </card_1.Card>

                {/* Settings */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">Configurações</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-6">
                    {/* Status toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <form_1.FormField control={form.control} name="active" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">Serviço Ativo</form_1.FormLabel>
                              <form_1.FormDescription>
                                Disponível para agendamento
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                            </form_1.FormControl>
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="featured" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">Serviço em Destaque</form_1.FormLabel>
                              <form_1.FormDescription>
                                Destacar nas listagens
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                            </form_1.FormControl>
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="requiresSpecialist" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">Requer Especialista</form_1.FormLabel>
                              <form_1.FormDescription>
                                Apenas profissionais habilitados
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                            </form_1.FormControl>
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="allowOnlineBooking" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">Agendamento Online</form_1.FormLabel>
                              <form_1.FormDescription>
                                Permitir agendamento pelo portal
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                            </form_1.FormControl>
                          </form_1.FormItem>);
        }}/>
                    </div>

                    {/* Booking restrictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form_1.FormField control={form.control} name="maxAdvanceBookingDays" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Antecedência Máxima (dias)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" min="0" max="365" {...field} onChange={function (e) { return field.onChange(parseInt(e.target.value) || 0); }}/>
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Máximo de dias para agendar (0 = sem limite)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>

                      <form_1.FormField control={form.control} name="minAdvanceBookingHours" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                            <form_1.FormLabel>Antecedência Mínima (horas)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="number" min="0" max="168" {...field} onChange={function (e) { return field.onChange(parseInt(e.target.value) || 0); }}/>
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Mínimo de horas para agendar
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>);
        }}/>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <div className="flex justify-end gap-2 pt-4">
                  <button_1.Button type="button" variant="outline" onClick={function () {
            setIsDialogOpen(false);
            setEditingService(null);
            form.reset();
        }}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button type="submit">
                    {editingService ? "Atualizar" : "Adicionar"} Serviço
                  </button_1.Button>
                </div>
              </form>
            </form_1.Form>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                <input_1.Input placeholder="Buscar por nome, descrição ou tags..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
              </div>
            </div>
            <div className="flex gap-2">
              <select_1.Select value={filterCategory} onValueChange={setFilterCategory}>
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue placeholder="Categoria"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                  {serviceCategories.map(function (category) { return (<select_1.SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
              <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                <select_1.SelectTrigger className="w-36">
                  <select_1.SelectValue placeholder="Status"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="active">Ativos</select_1.SelectItem>
                  <select_1.SelectItem value="inactive">Inativos</select_1.SelectItem>
                  <select_1.SelectItem value="featured">Destaque</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Services Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Serviços Cadastrados</card_1.CardTitle>
          <card_1.CardDescription>
            Lista completa do catálogo de serviços
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoading ? (<div className="flex items-center justify-center p-8">
              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
            </div>) : filteredServices.length === 0 ? (<div className="text-center p-8">
              <lucide_react_1.Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== "all" || filterStatus !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Adicione o primeiro serviço ao catálogo"}
              </p>
            </div>) : (<div className="overflow-x-auto">
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Serviço</table_1.TableHead>
                    <table_1.TableHead>Categoria</table_1.TableHead>
                    <table_1.TableHead>Duração</table_1.TableHead>
                    <table_1.TableHead>Preço</table_1.TableHead>
                    <table_1.TableHead>Margem</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Performance</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredServices.map(function (service) {
                var category = serviceCategories.find(function (cat) { return cat.value === service.category; });
                var _a = calculateProfit(service.price, service.cost), profit = _a.profit, margin = _a.margin;
                return (<table_1.TableRow key={service.id}>
                        <table_1.TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{service.name}</span>
                              {service.featured && (<lucide_react_1.Star className="h-4 w-4 text-yellow-500 fill-current"/>)}
                            </div>
                            {service.description && (<div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                                {service.description}
                              </div>)}
                            {service.tags && (<div className="flex flex-wrap gap-1 mt-1">
                                {service.tags.split(',').slice(0, 3).map(function (tag, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                                    {tag.trim()}
                                  </badge_1.Badge>); })}
                              </div>)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {category && (<badge_1.Badge className={category.color}>
                              {category.label}
                            </badge_1.Badge>)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-4 w-4 text-gray-400"/>
                            {formatDuration(service.duration)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="font-medium">
                            {formatCurrency(service.price)}
                          </div>
                          {service.cost && service.cost > 0 && (<div className="text-sm text-gray-600">
                              Custo: {formatCurrency(service.cost)}
                            </div>)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="font-medium text-green-600">
                            {formatCurrency(profit)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {margin.toFixed(1)}%
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex flex-col gap-1">
                            <button onClick={function () { return handleToggleActive(service.id); }} className="flex items-center gap-1 text-sm">
                              {service.active ? (<>
                                  <lucide_react_1.Eye className="h-4 w-4 text-green-600"/>
                                  <span className="text-green-600">Ativo</span>
                                </>) : (<>
                                  <lucide_react_1.EyeOff className="h-4 w-4 text-red-600"/>
                                  <span className="text-red-600">Inativo</span>
                                </>)}
                            </button>
                            {service.featured && (<badge_1.Badge variant="secondary" className="text-xs w-fit">
                                Destaque
                              </badge_1.Badge>)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {service.totalBookings !== undefined && (<div className="text-sm">
                              <div className="font-medium">
                                {service.totalBookings} agendamentos
                              </div>
                              {service.averageRating && (<div className="flex items-center gap-1 text-gray-600">
                                  <lucide_react_1.Star className="h-3 w-3 fill-current text-yellow-500"/>
                                  {service.averageRating.toFixed(1)}
                                </div>)}
                              {service.revenue && (<div className="text-green-600 font-medium">
                                  {formatCurrency(service.revenue)}
                                </div>)}
                            </div>)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center gap-1">
                            <button_1.Button variant="ghost" size="sm" onClick={function () { return handleToggleFeatured(service.id); }} className={service.featured ? "text-yellow-600" : ""}>
                              <lucide_react_1.Star className={"h-4 w-4 ".concat(service.featured ? 'fill-current' : '')}/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm" onClick={function () { return handleEdit(service); }}>
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm" onClick={function () { return handleDelete(service.id); }} className="text-red-600 hover:text-red-800">
                              <lucide_react_1.Trash2 className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>);
            })}
                </table_1.TableBody>
              </table_1.Table>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
