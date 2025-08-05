"use client";
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DueDateMonitoring = DueDateMonitoring;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data - substituir por dados reais do Supabase
var mockPaymentReminders = [
    {
        id: "1",
        vendor: {
            id: "1",
            name: "Fornecedor Alpha",
            document: "12.345.678/0001-90",
        },
        description: "Equipamentos médicos",
        amount: 15000,
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        status: "pending",
        priority: "high",
        alert_type: "due_soon",
        days_until_due: 1,
        days_overdue: 0,
    },
    {
        id: "2",
        vendor: {
            id: "2",
            name: "Fornecedor Beta",
            document: "98.765.432/0001-10",
        },
        description: "Material de consumo",
        amount: 8500,
        due_date: new Date().toISOString(), // Hoje
        status: "approved",
        priority: "high",
        alert_type: "due_today",
        days_until_due: 0,
        days_overdue: 0,
    },
    {
        id: "3",
        vendor: {
            id: "3",
            name: "Fornecedor Gamma",
            document: "11.222.333/0001-44",
        },
        description: "Serviços de limpeza",
        amount: 3200,
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
        status: "pending",
        priority: "urgent",
        alert_type: "overdue",
        days_until_due: 0,
        days_overdue: 3,
    },
    {
        id: "4",
        vendor: {
            id: "4",
            name: "Fornecedor Delta",
            document: "55.666.777/0001-88",
        },
        description: "Software médico",
        amount: 25000,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana
        status: "pending",
        priority: "medium",
        alert_type: "due_soon",
        days_until_due: 7,
        days_overdue: 0,
    },
    {
        id: "5",
        vendor: {
            id: "5",
            name: "Fornecedor Epsilon",
            document: "99.888.777/0001-66",
        },
        description: "Manutenção de equipamentos",
        amount: 12000,
        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
        status: "pending",
        priority: "urgent",
        alert_type: "overdue",
        days_until_due: 0,
        days_overdue: 10,
    },
];
function DueDateMonitoring(_a) {
    var _this = this;
    var clinicId = _a.clinicId;
    var _b = (0, react_1.useState)([]), reminders = _b[0], setReminders = _b[1];
    var _c = (0, react_1.useState)([]), filteredReminders = _c[0], setFilteredReminders = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)("all"), filterType = _e[0], setFilterType = _e[1];
    var _f = (0, react_1.useState)("all"), filterPriority = _f[0], setFilterPriority = _f[1];
    var _g = (0, react_1.useState)(""), searchTerm = _g[0], setSearchTerm = _g[1];
    (0, react_1.useEffect)(function () {
        loadReminders();
    }, [clinicId]);
    (0, react_1.useEffect)(function () {
        applyFilters();
    }, [reminders, filterType, filterPriority, searchTerm]);
    var loadReminders = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setLoading(true);
                // TODO: Implementar chamada real para o serviço
                // const data = await notificationService.getDuePayments(clinicId, 30)
                // Usando dados mock por enquanto
                setTimeout(function () {
                    setReminders(mockPaymentReminders);
                    setLoading(false);
                }, 500);
            }
            catch (error) {
                console.error("Error loading reminders:", error);
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var applyFilters = function () {
        var filtered = reminders;
        // Filtro por tipo de alerta
        if (filterType !== "all") {
            filtered = filtered.filter(function (reminder) { return reminder.alert_type === filterType; });
        }
        // Filtro por prioridade
        if (filterPriority !== "all") {
            filtered = filtered.filter(function (reminder) { return reminder.priority === filterPriority; });
        }
        // Filtro por termo de busca
        if (searchTerm) {
            var term_1 = searchTerm.toLowerCase();
            filtered = filtered.filter(function (reminder) {
                return reminder.vendor.name.toLowerCase().includes(term_1) ||
                    reminder.description.toLowerCase().includes(term_1) ||
                    reminder.vendor.document.includes(term_1);
            });
        }
        setFilteredReminders(filtered);
    };
    var getPriorityBadgeColor = function (priority) {
        switch (priority) {
            case "urgent":
                return "destructive";
            case "high":
                return "destructive";
            case "medium":
                return "secondary";
            case "low":
                return "outline";
            default:
                return "outline";
        }
    };
    var getAlertTypeBadgeColor = function (alertType) {
        switch (alertType) {
            case "overdue":
                return "destructive";
            case "due_today":
                return "destructive";
            case "due_soon":
                return "secondary";
            default:
                return "outline";
        }
    };
    var getAlertTypeLabel = function (alertType) {
        switch (alertType) {
            case "overdue":
                return "Em atraso";
            case "due_today":
                return "Vence hoje";
            case "due_soon":
                return "Vence em breve";
            default:
                return "Desconhecido";
        }
    };
    var formatDateDisplay = function (dateString) {
        var date = new Date(dateString);
        if ((0, date_fns_1.isToday)(date)) {
            return "Hoje";
        }
        else if ((0, date_fns_1.isTomorrow)(date)) {
            return "Amanhã";
        }
        else if ((0, date_fns_1.isYesterday)(date)) {
            return "Ontem";
        }
        else {
            return (0, date_fns_1.format)(date, "dd/MM/yyyy", { locale: locale_1.ptBR });
        }
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };
    var getDaysDisplay = function (reminder) {
        if (reminder.days_overdue > 0) {
            return "".concat(reminder.days_overdue, " dias em atraso");
        }
        else if (reminder.days_until_due === 0) {
            return "Vence hoje";
        }
        else if (reminder.days_until_due === 1) {
            return "Vence amanhã";
        }
        else {
            return "Vence em ".concat(reminder.days_until_due, " dias");
        }
    };
    // Estatísticas resumidas
    var stats = {
        total: reminders.length,
        overdue: reminders.filter(function (r) { return r.alert_type === "overdue"; }).length,
        dueToday: reminders.filter(function (r) { return r.alert_type === "due_today"; }).length,
        dueSoon: reminders.filter(function (r) { return r.alert_type === "due_soon"; }).length,
        totalAmount: reminders.reduce(function (sum, r) { return sum + r.amount; }, 0),
        urgentAmount: reminders
            .filter(function (r) { return r.priority === "urgent"; })
            .reduce(function (sum, r) { return sum + r.amount; }, 0),
    };
    if (loading) {
        return (<div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(function (i) { return (<card_1.Card key={i}>
              <card_1.CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </card_1.CardHeader>
            </card_1.Card>); })}
        </div>
        <card_1.Card>
          <card_1.CardContent className="animate-pulse p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(function (i) { return (<div key={i} className="h-4 bg-gray-300 rounded"></div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Em Atraso</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.urgentAmount)} urgente
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Vence Hoje</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-orange-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.dueToday}
            </div>
            <p className="text-xs text-muted-foreground">Atenção imediata</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Próximos</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-blue-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.dueSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)} total
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filtros e Busca */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5"/>
            Monitoramento de Vencimentos
          </card_1.CardTitle>
          <card_1.CardDescription>
            Acompanhe contas próximas do vencimento e em atraso
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar por fornecedor, descrição ou documento..." className="pl-8" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
              </div>
            </div>
            <select_1.Select value={filterType} onValueChange={setFilterType}>
              <select_1.SelectTrigger className="w-[180px]">
                <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
                <select_1.SelectValue placeholder="Tipo de alerta"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                <select_1.SelectItem value="overdue">Em atraso</select_1.SelectItem>
                <select_1.SelectItem value="due_today">Vence hoje</select_1.SelectItem>
                <select_1.SelectItem value="due_soon">Vence em breve</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <select_1.Select value={filterPriority} onValueChange={setFilterPriority}>
              <select_1.SelectTrigger className="w-[150px]">
                <lucide_react_1.TrendingUp className="h-4 w-4 mr-2"/>
                <select_1.SelectValue placeholder="Prioridade"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                <select_1.SelectItem value="urgent">Urgente</select_1.SelectItem>
                <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Tabela de Lembretes */}
          <div className="rounded-md border">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Fornecedor</table_1.TableHead>
                  <table_1.TableHead>Descrição</table_1.TableHead>
                  <table_1.TableHead>Valor</table_1.TableHead>
                  <table_1.TableHead>Vencimento</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Prioridade</table_1.TableHead>
                  <table_1.TableHead>Situação</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredReminders.length === 0 ? (<table_1.TableRow>
                    <table_1.TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <lucide_react_1.Calendar className="h-8 w-8 text-muted-foreground"/>
                        <p className="text-muted-foreground">
                          {reminders.length === 0
                ? "Nenhum pagamento próximo do vencimento"
                : "Nenhum resultado encontrado para os filtros aplicados"}
                        </p>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>) : (filteredReminders.map(function (reminder) { return (<table_1.TableRow key={reminder.id}>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">
                            {reminder.vendor.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reminder.vendor.document}
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="max-w-[200px] truncate">
                          {reminder.description}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="font-medium">
                          {formatCurrency(reminder.amount)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="text-sm">
                          {formatDateDisplay(reminder.due_date)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">
                          {reminder.status === "pending"
                ? "Pendente"
                : reminder.status === "approved"
                    ? "Aprovado"
                    : "Pago"}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant={getPriorityBadgeColor(reminder.priority)}>
                          {reminder.priority === "urgent"
                ? "Urgente"
                : reminder.priority === "high"
                    ? "Alta"
                    : reminder.priority === "medium"
                        ? "Média"
                        : "Baixa"}
                        </badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="space-y-1">
                          <badge_1.Badge variant={getAlertTypeBadgeColor(reminder.alert_type)}>
                            {getAlertTypeLabel(reminder.alert_type)}
                          </badge_1.Badge>
                          <div className="text-xs text-muted-foreground">
                            {getDaysDisplay(reminder)}
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex gap-2">
                          <button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Eye className="h-4 w-4"/>
                          </button_1.Button>
                          <button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Mail className="h-4 w-4"/>
                          </button_1.Button>
                          <button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Zap className="h-4 w-4"/>
                          </button_1.Button>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>); }))}
              </table_1.TableBody>
            </table_1.Table>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
