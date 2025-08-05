'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSubjectRightsPanel = DataSubjectRightsPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function DataSubjectRightsPanel(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, useLGPD_1.useDataSubjectRights)(), requests = _b.requests, isLoading = _b.isLoading, error = _b.error, updateRequest = _b.updateRequest, processRequest = _b.processRequest, exportRequests = _b.exportRequests, refreshData = _b.refreshData;
    var _c = (0, react_1.useState)(''), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)('all'), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = (0, react_1.useState)('all'), typeFilter = _e[0], setTypeFilter = _e[1];
    var _f = (0, react_1.useState)(null), selectedRequest = _f[0], setSelectedRequest = _f[1];
    var _g = (0, react_1.useState)(false), isProcessingOpen = _g[0], setIsProcessingOpen = _g[1];
    var _h = (0, react_1.useState)({
        status: '',
        response: '',
        admin_notes: ''
    }), processingData = _h[0], setProcessingData = _h[1];
    // Filtrar solicitações
    var filteredRequests = (requests === null || requests === void 0 ? void 0 : requests.filter(function (request) {
        var _a, _b;
        var matchesSearch = ((_a = request.user_email) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = request.request_type) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        var matchesType = typeFilter === 'all' || request.request_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    })) || [];
    var getStatusBadge = function (status) {
        switch (status) {
            case 'pending':
                return <badge_1.Badge variant="secondary"><lucide_react_1.Clock className="h-3 w-3 mr-1"/>Pendente</badge_1.Badge>;
            case 'in_progress':
                return <badge_1.Badge variant="default"><lucide_react_1.RefreshCw className="h-3 w-3 mr-1"/>Em Processamento</badge_1.Badge>;
            case 'completed':
                return <badge_1.Badge variant="outline"><lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>Concluída</badge_1.Badge>;
            case 'rejected':
                return <badge_1.Badge variant="destructive"><lucide_react_1.XCircle className="h-3 w-3 mr-1"/>Rejeitada</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    var getTypeBadge = function (type) {
        var typeLabels = {
            'access': 'Acesso',
            'rectification': 'Retificação',
            'erasure': 'Exclusão',
            'portability': 'Portabilidade',
            'restriction': 'Restrição',
            'objection': 'Oposição'
        };
        return (<badge_1.Badge variant="outline">
        {typeLabels[type] || type}
      </badge_1.Badge>);
    };
    var getPriorityColor = function (createdAt) {
        var daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated > 15)
            return 'text-red-600';
        if (daysSinceCreated > 10)
            return 'text-yellow-600';
        return 'text-green-600';
    };
    var handleProcessRequest = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedRequest)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, processRequest(selectedRequest.id, processingData)];
                case 2:
                    _a.sent();
                    setIsProcessingOpen(false);
                    setSelectedRequest(null);
                    setProcessingData({ status: '', response: '', admin_notes: '' });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Erro ao processar solicitação:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openProcessingDialog = function (request) {
        setSelectedRequest(request);
        setProcessingData({
            status: request.status,
            response: request.response || '',
            admin_notes: request.admin_notes || ''
        });
        setIsProcessingOpen(true);
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando solicitações...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          Erro ao carregar solicitações: {error}
        </alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    return (<div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Direitos dos Titulares de Dados</h3>
          <p className="text-muted-foreground">
            Gerencie solicitações de acesso, retificação, exclusão e outros direitos LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" onClick={exportRequests}>
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {(requests === null || requests === void 0 ? void 0 : requests.filter(function (r) { return r.status === 'pending'; }).length) || 0}
                </p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-yellow-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Processamento</p>
                <p className="text-2xl font-bold">
                  {(requests === null || requests === void 0 ? void 0 : requests.filter(function (r) { return r.status === 'in_progress'; }).length) || 0}
                </p>
              </div>
              <lucide_react_1.RefreshCw className="h-8 w-8 text-blue-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {(requests === null || requests === void 0 ? void 0 : requests.filter(function (r) { return r.status === 'completed'; }).length) || 0}
                </p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">2.3d</p>
              </div>
              <lucide_react_1.Calendar className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filtros */}
      <card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle>Filtros</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label_1.Label htmlFor="search">Buscar</label_1.Label>
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <input_1.Input id="search" placeholder="Email ou tipo..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-8"/>
              </div>
            </div>
            
            <div>
              <label_1.Label htmlFor="status">Status</label_1.Label>
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos os status"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="in_progress">Em Processamento</select_1.SelectItem>
                  <select_1.SelectItem value="completed">Concluída</select_1.SelectItem>
                  <select_1.SelectItem value="rejected">Rejeitada</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            
            <div>
              <label_1.Label htmlFor="type">Tipo de Solicitação</label_1.Label>
              <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos os tipos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="access">Acesso</select_1.SelectItem>
                  <select_1.SelectItem value="rectification">Retificação</select_1.SelectItem>
                  <select_1.SelectItem value="erasure">Exclusão</select_1.SelectItem>
                  <select_1.SelectItem value="portability">Portabilidade</select_1.SelectItem>
                  <select_1.SelectItem value="restriction">Restrição</select_1.SelectItem>
                  <select_1.SelectItem value="objection">Oposição</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            
            <div className="flex items-end">
              <button_1.Button variant="outline" onClick={function () {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
        }}>
                <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
                Limpar
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Tabela de solicitações */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Solicitações ({filteredRequests.length})</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Usuário</table_1.TableHead>
                <table_1.TableHead>Tipo</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Data da Solicitação</table_1.TableHead>
                <table_1.TableHead>Prazo</table_1.TableHead>
                <table_1.TableHead>Prioridade</table_1.TableHead>
                <table_1.TableHead>Ações</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {filteredRequests.map(function (request) {
            var daysSinceCreated = Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
            var daysRemaining = 15 - daysSinceCreated;
            return (<table_1.TableRow key={request.id}>
                    <table_1.TableCell>
                      <div>
                        <div className="font-medium">{request.user_email}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {request.user_id}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>{getTypeBadge(request.request_type)}</table_1.TableCell>
                    <table_1.TableCell>{getStatusBadge(request.status)}</table_1.TableCell>
                    <table_1.TableCell>
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className={getPriorityColor(request.created_at)}>
                        {daysRemaining > 0 ? ("".concat(daysRemaining, " dias restantes")) : (<span className="font-semibold">Vencido há {Math.abs(daysRemaining)} dias</span>)}
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant={daysRemaining <= 0 ? "destructive" : daysRemaining <= 5 ? "secondary" : "outline"}>
                        {daysRemaining <= 0 ? 'Crítica' : daysRemaining <= 5 ? 'Alta' : 'Normal'}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex gap-2">
                        <dialog_1.Dialog>
                          <dialog_1.DialogTrigger asChild>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Eye className="h-3 w-3 mr-1"/>
                              Ver
                            </button_1.Button>
                          </dialog_1.DialogTrigger>
                          <dialog_1.DialogContent className="max-w-2xl">
                            <dialog_1.DialogHeader>
                              <dialog_1.DialogTitle>Detalhes da Solicitação</dialog_1.DialogTitle>
                              <dialog_1.DialogDescription>
                                {getTypeBadge(request.request_type)} - {getStatusBadge(request.status)}
                              </dialog_1.DialogDescription>
                            </dialog_1.DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label_1.Label>Usuário</label_1.Label>
                                  <p className="text-sm">{request.user_email}</p>
                                </div>
                                <div>
                                  <label_1.Label>Data da Solicitação</label_1.Label>
                                  <p className="text-sm">
                                    {new Date(request.created_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <label_1.Label>Descrição</label_1.Label>
                                <p className="text-sm bg-muted p-3 rounded">
                                  {request.description || 'Nenhuma descrição fornecida'}
                                </p>
                              </div>
                              
                              {request.response && (<div>
                                  <label_1.Label>Resposta</label_1.Label>
                                  <p className="text-sm bg-muted p-3 rounded">
                                    {request.response}
                                  </p>
                                </div>)}
                              
                              {request.admin_notes && (<div>
                                  <label_1.Label>Notas Administrativas</label_1.Label>
                                  <p className="text-sm bg-muted p-3 rounded">
                                    {request.admin_notes}
                                  </p>
                                </div>)}
                              
                              {request.processed_at && (<div>
                                  <label_1.Label>Processado em</label_1.Label>
                                  <p className="text-sm">
                                    {new Date(request.processed_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>)}
                            </div>
                          </dialog_1.DialogContent>
                        </dialog_1.Dialog>
                        
                        {(request.status === 'pending' || request.status === 'in_progress') && (<button_1.Button size="sm" onClick={function () { return openProcessingDialog(request); }}>
                            <lucide_react_1.MessageSquare className="h-3 w-3 mr-1"/>
                            Processar
                          </button_1.Button>)}
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>);
        })}
            </table_1.TableBody>
          </table_1.Table>
          
          {filteredRequests.length === 0 && (<div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Dialog de processamento */}
      <dialog_1.Dialog open={isProcessingOpen} onOpenChange={setIsProcessingOpen}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Processar Solicitação</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {selectedRequest && (<span>
                  {getTypeBadge(selectedRequest.request_type)} de {selectedRequest.user_email}
                </span>)}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          
          {selectedRequest && (<div className="space-y-4">
              <div>
                <label_1.Label>Solicitação Original</label_1.Label>
                <p className="text-sm bg-muted p-3 rounded">
                  {selectedRequest.description || 'Nenhuma descrição fornecida'}
                </p>
              </div>
              
              <div>
                <label_1.Label htmlFor="status">Novo Status</label_1.Label>
                <select_1.Select value={processingData.status} onValueChange={function (value) { return setProcessingData(__assign(__assign({}, processingData), { status: value })); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o status"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="in_progress">Em Processamento</select_1.SelectItem>
                    <select_1.SelectItem value="completed">Concluída</select_1.SelectItem>
                    <select_1.SelectItem value="rejected">Rejeitada</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              
              <div>
                <label_1.Label htmlFor="response">Resposta ao Usuário</label_1.Label>
                <textarea_1.Textarea id="response" value={processingData.response} onChange={function (e) { return setProcessingData(__assign(__assign({}, processingData), { response: e.target.value })); }} placeholder="Resposta que será enviada ao usuário..." rows={4}/>
              </div>
              
              <div>
                <label_1.Label htmlFor="admin_notes">Notas Administrativas (Internas)</label_1.Label>
                <textarea_1.Textarea id="admin_notes" value={processingData.admin_notes} onChange={function (e) { return setProcessingData(__assign(__assign({}, processingData), { admin_notes: e.target.value })); }} placeholder="Notas internas sobre o processamento..." rows={3}/>
              </div>
            </div>)}
          
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setIsProcessingOpen(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleProcessRequest}>
              Processar Solicitação
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
