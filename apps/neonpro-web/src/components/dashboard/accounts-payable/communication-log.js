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
exports.default = CommunicationLog;
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var communicationTypes = [
    { value: "email", label: "E-mail", icon: lucide_react_1.Mail },
    { value: "phone", label: "Telefone", icon: lucide_react_1.Phone },
    { value: "meeting", label: "Reunião", icon: lucide_react_1.Calendar },
    { value: "video_call", label: "Video Chamada", icon: lucide_react_1.Video },
    { value: "message", label: "Mensagem", icon: lucide_react_1.MessageCircle },
    { value: "document", label: "Documento", icon: lucide_react_1.FileText },
];
var statusOptions = [
    {
        value: "pending",
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800",
    },
    {
        value: "completed",
        label: "Concluída",
        color: "bg-green-100 text-green-800",
    },
    {
        value: "follow_up_required",
        label: "Requer Acompanhamento",
        color: "bg-blue-100 text-blue-800",
    },
];
var priorityOptions = [
    { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-800" },
];
function CommunicationLog(_a) {
    var _this = this;
    var vendorId = _a.vendorId, vendorName = _a.vendorName;
    var _b = (0, react_1.useState)([]), logs = _b[0], setLogs = _b[1];
    var _c = (0, react_1.useState)([]), filteredLogs = _c[0], setFilteredLogs = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), showNewLogDialog = _e[0], setShowNewLogDialog = _e[1];
    var _f = (0, react_1.useState)(""), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = (0, react_1.useState)("all"), typeFilter = _g[0], setTypeFilter = _g[1];
    var _h = (0, react_1.useState)("all"), statusFilter = _h[0], setStatusFilter = _h[1];
    // New log form state
    var _j = (0, react_1.useState)({
        vendor_id: vendorId || "",
        communication_type: "email",
        subject: "",
        content: "",
        priority: "normal",
        status: "pending",
        due_date: "",
        follow_up_date: "",
    }), newLog = _j[0], setNewLog = _j[1];
    // Mock data - In real implementation, this would come from API
    var mockLogs = [
        {
            id: "1",
            vendor_id: vendorId || "vendor1",
            vendor_name: vendorName || "Fornecedor Exemplo",
            user_id: "user1",
            user_name: "João Silva",
            communication_type: "email",
            subject: "Confirmação de pedido #001",
            content: "Enviado e-mail solicitando confirmação do pedido e prazo de entrega.",
            status: "completed",
            priority: "normal",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: "2",
            vendor_id: vendorId || "vendor1",
            vendor_name: vendorName || "Fornecedor Exemplo",
            user_id: "user2",
            user_name: "Maria Santos",
            communication_type: "phone",
            subject: "Negociação de preços",
            content: "Ligação para discussão dos novos preços para o contrato de 2024.",
            status: "follow_up_required",
            priority: "high",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: "3",
            vendor_id: vendorId || "vendor1",
            vendor_name: vendorName || "Fornecedor Exemplo",
            user_id: "user1",
            user_name: "João Silva",
            communication_type: "meeting",
            subject: "Reunião de alinhamento Q1",
            content: "Reunião presencial para alinhamento das metas do primeiro trimestre.",
            status: "pending",
            priority: "normal",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];
    (0, react_1.useEffect)(function () {
        // Simulate API call
        setTimeout(function () {
            setLogs(mockLogs);
            setLoading(false);
        }, 1000);
    }, []);
    (0, react_1.useEffect)(function () {
        var filtered = logs;
        if (searchTerm) {
            filtered = filtered.filter(function (log) {
                return log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.user_name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        if (typeFilter !== "all") {
            filtered = filtered.filter(function (log) { return log.communication_type === typeFilter; });
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter(function (log) { return log.status === statusFilter; });
        }
        setFilteredLogs(filtered);
    }, [logs, searchTerm, typeFilter, statusFilter]);
    var handleNewLogSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var newLogEntry_1;
        return __generator(this, function (_a) {
            e.preventDefault();
            try {
                newLogEntry_1 = __assign(__assign({ id: Date.now().toString() }, newLog), { communication_type: newLog.communication_type, status: newLog.status, priority: newLog.priority, vendor_name: vendorName || "Fornecedor", user_id: "current_user", user_name: "Usuário Atual", created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                setLogs(function (prev) { return __spreadArray([newLogEntry_1], prev, true); });
                setShowNewLogDialog(false);
                setNewLog({
                    vendor_id: vendorId || "",
                    communication_type: "email",
                    subject: "",
                    content: "",
                    priority: "normal",
                    status: "pending",
                    due_date: "",
                    follow_up_date: "",
                });
                sonner_1.toast.success("Log de comunicação adicionado com sucesso");
            }
            catch (error) {
                sonner_1.toast.error("Erro ao adicionar log de comunicação");
            }
            return [2 /*return*/];
        });
    }); };
    var getTypeIcon = function (type) {
        var typeConfig = communicationTypes.find(function (t) { return t.value === type; });
        return typeConfig ? typeConfig.icon : lucide_react_1.MessageCircle;
    };
    var getStatusBadge = function (status) {
        var statusConfig = statusOptions.find(function (s) { return s.value === status; });
        return statusConfig || statusOptions[0];
    };
    var getPriorityBadge = function (priority) {
        var priorityConfig = priorityOptions.find(function (p) { return p.value === priority; });
        return priorityConfig || priorityOptions[0];
    };
    var formatDateTime = function (dateString) {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    if (loading) {
        return (<div className="space-y-4">
        {[1, 2, 3].map(function (i) { return (<card_1.Card key={i}>
            <card_1.CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Log de Comunicação</h3>
          <p className="text-sm text-muted-foreground">
            {vendorName
            ? "Comunica\u00E7\u00F5es com ".concat(vendorName)
            : "Todas as comunicações"}
          </p>
        </div>

        <button_1.Button onClick={function () { return setShowNewLogDialog(true); }}>
          <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
          Nova Comunicação
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label_1.Label>Buscar</label_1.Label>
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar comunicações..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-9"/>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Tipo</label_1.Label>
              <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                  {communicationTypes.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Status</label_1.Label>
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                  {statusOptions.map(function (status) { return (<select_1.SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Ações</label_1.Label>
              <button_1.Button variant="outline" className="w-full">
                <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
                Filtros Avançados
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Communication Logs */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (<card_1.Card>
            <card_1.CardContent className="p-8 text-center">
              <lucide_react_1.MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
              <p className="text-muted-foreground">
                Nenhuma comunicação encontrada.
              </p>
            </card_1.CardContent>
          </card_1.Card>) : (filteredLogs.map(function (log) {
            var IconComponent = getTypeIcon(log.communication_type);
            var statusBadge = getStatusBadge(log.status);
            var priorityBadge = getPriorityBadge(log.priority);
            return (<card_1.Card key={log.id} className="hover:shadow-md transition-shadow">
                <card_1.CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="h-5 w-5"/>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm">
                              {log.subject}
                            </h4>
                            <badge_1.Badge className={"text-xs ".concat(statusBadge.color)}>
                              {statusBadge.label}
                            </badge_1.Badge>
                            <badge_1.Badge className={"text-xs ".concat(priorityBadge.color)}>
                              {priorityBadge.label}
                            </badge_1.Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {log.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <lucide_react_1.User className="h-3 w-3"/>
                              {log.user_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <lucide_react_1.Clock className="h-3 w-3"/>
                              {formatDateTime(log.created_at)}
                            </div>
                            {log.due_date && (<div className="flex items-center gap-1 text-orange-600">
                                <lucide_react_1.Calendar className="h-3 w-3"/>
                                Vence:{" "}
                                {new Date(log.due_date).toLocaleDateString("pt-BR")}
                              </div>)}
                            {log.follow_up_date && (<div className="flex items-center gap-1 text-blue-600">
                                <lucide_react_1.Calendar className="h-3 w-3"/>
                                Follow-up:{" "}
                                {new Date(log.follow_up_date).toLocaleDateString("pt-BR")}
                              </div>)}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <avatar_1.Avatar className="h-8 w-8">
                            <avatar_1.AvatarFallback>
                              {log.user_name.substring(0, 2).toUpperCase()}
                            </avatar_1.AvatarFallback>
                          </avatar_1.Avatar>
                        </div>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>);
        }))}
      </div>

      {/* New Communication Dialog */}
      <dialog_1.Dialog open={showNewLogDialog} onOpenChange={setShowNewLogDialog}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Nova Comunicação</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>

          <form onSubmit={handleNewLogSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="communication_type">Tipo de Comunicação</label_1.Label>
                <select_1.Select value={newLog.communication_type} onValueChange={function (value) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { communication_type: value })); });
        }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {communicationTypes.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="priority">Prioridade</label_1.Label>
                <select_1.Select value={newLog.priority} onValueChange={function (value) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { priority: value })); });
        }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {priorityOptions.map(function (priority) { return (<select_1.SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="subject">Assunto</label_1.Label>
              <input_1.Input id="subject" value={newLog.subject} onChange={function (e) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { subject: e.target.value })); });
        }} placeholder="Assunto da comunicação" required/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="content">Conteúdo</label_1.Label>
              <textarea_1.Textarea id="content" value={newLog.content} onChange={function (e) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { content: e.target.value })); });
        }} placeholder="Descreva o conteúdo da comunicação..." rows={4} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="due_date">Data de Vencimento (opcional)</label_1.Label>
                <input_1.Input id="due_date" type="datetime-local" value={newLog.due_date} onChange={function (e) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { due_date: e.target.value })); });
        }}/>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="follow_up_date">
                  Data de Follow-up (opcional)
                </label_1.Label>
                <input_1.Input id="follow_up_date" type="datetime-local" value={newLog.follow_up_date} onChange={function (e) {
            return setNewLog(function (prev) { return (__assign(__assign({}, prev), { follow_up_date: e.target.value })); });
        }}/>
              </div>
            </div>
          </form>

          <dialog_1.DialogFooter>
            <button_1.Button type="button" variant="outline" onClick={function () { return setShowNewLogDialog(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleNewLogSubmit}>Salvar Comunicação</button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
