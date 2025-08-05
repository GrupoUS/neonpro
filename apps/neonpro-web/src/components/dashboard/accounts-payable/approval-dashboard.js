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
exports.default = ApprovalDashboard;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var approval_hierarchy_config_1 = require("./approval-hierarchy-config");
var approval_request_tracker_1 = require("./approval-request-tracker");
var statusConfig = {
    pending: {
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800",
        icon: lucide_react_1.Clock,
    },
    approved: {
        label: "Aprovado",
        color: "bg-green-100 text-green-800",
        icon: lucide_react_1.CheckCircle,
    },
    rejected: {
        label: "Rejeitado",
        color: "bg-red-100 text-red-800",
        icon: lucide_react_1.XCircle,
    },
    escalated: {
        label: "Escalado",
        color: "bg-orange-100 text-orange-800",
        icon: lucide_react_1.AlertTriangle,
    },
    cancelled: {
        label: "Cancelado",
        color: "bg-gray-100 text-gray-800",
        icon: lucide_react_1.XCircle,
    },
};
var priorityConfig = {
    low: { label: "Baixa", color: "bg-blue-100 text-blue-800" },
    normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
    high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
    urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
};
function ApprovalDashboard(_a) {
    var _this = this;
    var onRequestApproval = _a.onRequestApproval;
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)({
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0,
        overdue: 0,
        myPending: 0,
        avgApprovalTime: 0,
        totalAmount: 0,
    }), stats = _c[0], setStats = _c[1];
    var _d = (0, react_1.useState)([]), pendingApprovals = _d[0], setPendingApprovals = _d[1];
    var _e = (0, react_1.useState)([]), myRequests = _e[0], setMyRequests = _e[1];
    var _f = (0, react_1.useState)([]), allRequests = _f[0], setAllRequests = _f[1];
    // Filters
    var _g = (0, react_1.useState)(""), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = (0, react_1.useState)("all"), statusFilter = _h[0], setStatusFilter = _h[1];
    var _j = (0, react_1.useState)("all"), priorityFilter = _j[0], setPriorityFilter = _j[1];
    // Modals
    var _k = (0, react_1.useState)(""), selectedRequestId = _k[0], setSelectedRequestId = _k[1];
    var _l = (0, react_1.useState)(false), showRequestTracker = _l[0], setShowRequestTracker = _l[1];
    var _m = (0, react_1.useState)(false), showHierarchyConfig = _m[0], setShowHierarchyConfig = _m[1];
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, []);
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockStats, mockPendingApprovals, mockMyRequests, mockAllRequests;
        return __generator(this, function (_a) {
            setLoading(true);
            try {
                mockStats = {
                    pending: 15,
                    approved: 42,
                    rejected: 3,
                    escalated: 2,
                    overdue: 5,
                    myPending: 8,
                    avgApprovalTime: 18.5,
                    totalAmount: 125000,
                };
                mockPendingApprovals = [
                    {
                        id: "req_001",
                        accounts_payable_id: "ap_001",
                        requester_name: "Ana Silva",
                        request_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: 15000,
                        current_level: 2,
                        status: "pending",
                        priority: "high",
                        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                        vendor_name: "MedEquip Ltda",
                        invoice_number: "INV-2024-001",
                        category: "Equipamentos",
                        level_name: "Gerente Departamental",
                        time_remaining_hours: 24,
                    },
                    {
                        id: "req_002",
                        accounts_payable_id: "ap_002",
                        requester_name: "Carlos Santos",
                        request_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: 3500,
                        current_level: 1,
                        status: "pending",
                        priority: "normal",
                        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        vendor_name: "Office Solutions",
                        invoice_number: "INV-2024-002",
                        category: "Material de Escritório",
                        level_name: "Supervisor Direto",
                        time_remaining_hours: 48,
                    },
                    {
                        id: "req_003",
                        accounts_payable_id: "ap_003",
                        requester_name: "Marina Costa",
                        request_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: 25000,
                        current_level: 3,
                        status: "pending",
                        priority: "urgent",
                        due_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Overdue
                        vendor_name: "TechCorp Brasil",
                        invoice_number: "INV-2024-003",
                        category: "Software",
                        level_name: "Diretor Financeiro",
                        time_remaining_hours: -2, // Overdue by 2 hours
                    },
                ];
                mockMyRequests = [
                    {
                        id: "req_004",
                        accounts_payable_id: "ap_004",
                        requester_name: "Eu mesmo",
                        request_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: 5000,
                        current_level: 2,
                        status: "pending",
                        priority: "normal",
                        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                        vendor_name: "Supplies Inc",
                        invoice_number: "INV-2024-004",
                        category: "Suprimentos",
                        level_name: "Gerente Departamental",
                        time_remaining_hours: 24,
                    },
                ];
                mockAllRequests = __spreadArray(__spreadArray(__spreadArray([], mockPendingApprovals, true), mockMyRequests, true), [
                    {
                        id: "req_005",
                        accounts_payable_id: "ap_005",
                        requester_name: "João Oliveira",
                        request_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        amount: 8000,
                        current_level: 3,
                        status: "approved",
                        priority: "normal",
                        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        vendor_name: "Service Pro",
                        invoice_number: "INV-2024-005",
                        category: "Serviços",
                        level_name: "Diretor Financeiro",
                    },
                ], false);
                setStats(mockStats);
                setPendingApprovals(mockPendingApprovals);
                setMyRequests(mockMyRequests);
                setAllRequests(mockAllRequests);
            }
            catch (error) {
                console.error("Error loading dashboard data:", error);
                sonner_1.toast.error("Erro ao carregar dados do dashboard");
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };
    var getTimeRemaining = function (dueDate) {
        var now = new Date();
        var deadline = new Date(dueDate);
        var diff = deadline.getTime() - now.getTime();
        var hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 0) {
            return { text: "".concat(Math.abs(hours), "h atrasado"), isOverdue: true };
        }
        else if (hours < 24) {
            return { text: "".concat(hours, "h restantes"), isOverdue: false };
        }
        else {
            var days = Math.floor(hours / 24);
            return { text: "".concat(days, "d ").concat(hours % 24, "h restantes"), isOverdue: false };
        }
    };
    var handleViewRequest = function (requestId) {
        setSelectedRequestId(requestId);
        setShowRequestTracker(true);
    };
    var filterRequests = function (requests) {
        return requests.filter(function (request) {
            var _a, _b;
            var matchesSearch = searchTerm === "" ||
                request.requester_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                ((_a = request.vendor_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
                ((_b = request.invoice_number) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase()));
            var matchesStatus = statusFilter === "all" || request.status === statusFilter;
            var matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    };
    var StatsCards = function () { return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-4 w-4 text-yellow-600"/>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
              <p className="text-xs text-muted-foreground">Aprovadas</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.XCircle className="h-4 w-4 text-red-600"/>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
              <p className="text-xs text-muted-foreground">Rejeitadas</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-600"/>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.escalated}
              </p>
              <p className="text-xs text-muted-foreground">Escaladas</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600"/>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.User className="h-4 w-4 text-blue-600"/>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.myPending}
              </p>
              <p className="text-xs text-muted-foreground">Minhas</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-4 w-4 text-purple-600"/>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avgApprovalTime}h
              </p>
              <p className="text-xs text-muted-foreground">Tempo Médio</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.DollarSign className="h-4 w-4 text-green-600"/>
            <div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(stats.totalAmount)
            .replace("R$", "R$")
            .slice(0, 6)}
                k
              </p>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var RequestTable = function (_a) {
        var requests = _a.requests, title = _a.title;
        return (<card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between">
        <card_1.CardTitle className="text-sm">{title}</card_1.CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-8 w-48 h-9"/>
          </div>
          <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
            <select_1.SelectTrigger className="w-28 h-9">
              <select_1.SelectValue placeholder="Status"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
              <select_1.SelectItem value="approved">Aprovado</select_1.SelectItem>
              <select_1.SelectItem value="rejected">Rejeitado</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <select_1.Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <select_1.SelectTrigger className="w-28 h-9">
              <select_1.SelectValue placeholder="Prioridade"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todas</select_1.SelectItem>
              <select_1.SelectItem value="urgent">Urgente</select_1.SelectItem>
              <select_1.SelectItem value="high">Alta</select_1.SelectItem>
              <select_1.SelectItem value="normal">Normal</select_1.SelectItem>
              <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="p-0">
        <table_1.Table>
          <table_1.TableHeader>
            <table_1.TableRow>
              <table_1.TableHead>Solicitação</table_1.TableHead>
              <table_1.TableHead>Valor</table_1.TableHead>
              <table_1.TableHead>Nível Atual</table_1.TableHead>
              <table_1.TableHead>Prazo</table_1.TableHead>
              <table_1.TableHead>Status</table_1.TableHead>
              <table_1.TableHead className="w-[100px]">Ações</table_1.TableHead>
            </table_1.TableRow>
          </table_1.TableHeader>
          <table_1.TableBody>
            {filterRequests(requests).map(function (request) {
                var StatusIcon = statusConfig[request.status].icon;
                var timeInfo = getTimeRemaining(request.due_date);
                return (<table_1.TableRow key={request.id}>
                  <table_1.TableCell>
                    <div>
                      <p className="font-medium">{request.vendor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.invoice_number} • {request.requester_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <badge_1.Badge className={(0, utils_1.cn)("text-xs", priorityConfig[request.priority].color)}>
                          {priorityConfig[request.priority].label}
                        </badge_1.Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <p className="font-medium">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(0, date_fns_1.format)(new Date(request.request_date), "dd/MM/yyyy", {
                        locale: locale_1.ptBR,
                    })}
                    </p>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {request.current_level}
                      </div>
                      <span className="text-sm">{request.level_name}</span>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div>
                      <p className="text-sm">
                        {(0, date_fns_1.format)(new Date(request.due_date), "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR })}
                      </p>
                      <p className={(0, utils_1.cn)("text-xs", timeInfo.isOverdue
                        ? "text-red-600"
                        : "text-muted-foreground")}>
                        {timeInfo.text}
                      </p>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <badge_1.Badge className={(0, utils_1.cn)("text-xs", statusConfig[request.status].color)}>
                      <StatusIcon className="h-3 w-3 mr-1"/>
                      {statusConfig[request.status].label}
                    </badge_1.Badge>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <button_1.Button variant="ghost" size="sm" onClick={function () { return handleViewRequest(request.id); }}>
                      <lucide_react_1.Eye className="h-3 w-3"/>
                    </button_1.Button>
                  </table_1.TableCell>
                </table_1.TableRow>);
            })}
            {filterRequests(requests).length === 0 && (<table_1.TableRow>
                <table_1.TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma solicitação encontrada.
                </table_1.TableCell>
              </table_1.TableRow>)}
          </table_1.TableBody>
        </table_1.Table>
      </card_1.CardContent>
    </card_1.Card>);
    };
    if (loading) {
        return (<div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aprovações</h2>
          <p className="text-muted-foreground">
            Gerencie solicitações de aprovação de contas a pagar
          </p>
        </div>
        <button_1.Button onClick={function () { return setShowHierarchyConfig(true); }} variant="outline">
          <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
          Configurar Hierarquia
        </button_1.Button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Tabs */}
      <tabs_1.Tabs defaultValue="pending" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="pending">
            Pendentes para Mim ({stats.myPending})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="my-requests">
            Minhas Solicitações ({myRequests.length})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="all">
            Todas as Solicitações ({allRequests.length})
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="pending">
          <RequestTable requests={pendingApprovals} title="Aprovações Pendentes"/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="my-requests">
          <RequestTable requests={myRequests} title="Minhas Solicitações de Aprovação"/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="all">
          <RequestTable requests={allRequests} title="Todas as Solicitações"/>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Modals */}
      <approval_request_tracker_1.default requestId={selectedRequestId} open={showRequestTracker} onOpenChange={setShowRequestTracker}/>

      <approval_hierarchy_config_1.default open={showHierarchyConfig} onOpenChange={setShowHierarchyConfig} onSave={function () {
            sonner_1.toast.success("Hierarquia de aprovação atualizada");
            loadDashboardData(); // Reload data
        }}/>
    </div>);
}
