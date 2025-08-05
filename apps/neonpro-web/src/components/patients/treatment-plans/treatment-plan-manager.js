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
exports.default = TreatmentPlanManager;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var progress_1 = require("@/components/ui/progress");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function TreatmentPlanManager(_a) {
    var _this = this;
    var patientId = _a.patientId, _b = _a.readOnly, readOnly = _b === void 0 ? false : _b, onPlanUpdate = _a.onPlanUpdate;
    // State management
    var _c = (0, react_1.useState)([]), treatmentPlans = _c[0], setTreatmentPlans = _c[1];
    var _d = (0, react_1.useState)(null), selectedPlan = _d[0], setSelectedPlan = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)('overview'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)(''), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = (0, react_1.useState)('all'), filterStatus = _h[0], setFilterStatus = _h[1];
    var _j = (0, react_1.useState)('all'), filterType = _j[0], setFilterType = _j[1];
    // Dialog states
    var _k = (0, react_1.useState)(false), showPlanDialog = _k[0], setShowPlanDialog = _k[1];
    var _l = (0, react_1.useState)(false), showProtocolDialog = _l[0], setShowProtocolDialog = _l[1];
    var _m = (0, react_1.useState)(false), showProgressDialog = _m[0], setShowProgressDialog = _m[1];
    var _o = (0, react_1.useState)(null), editingPlan = _o[0], setEditingPlan = _o[1];
    var _p = (0, react_1.useState)(null), editingProtocol = _p[0], setEditingProtocol = _p[1];
    (0, react_1.useEffect)(function () {
        loadTreatmentPlans();
    }, [patientId]);
    var loadTreatmentPlans = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setLoading(true);
                // TODO: Replace with actual Supabase queries
                // const { data: plansData } = await supabase
                //   .from('treatment_plans')
                //   .select(`
                //     *,
                //     protocols:treatment_protocols(*),
                //     assignments:professional_assignments(*),
                //     progress_notes(*)
                //   `)
                //   .eq('patient_id', patientId)
                //   .order('created_at', { ascending: false });
                // Mock data for demonstration
                setTreatmentPlans(generateMockTreatmentPlans());
                if (treatmentPlans.length > 0) {
                    setSelectedPlan(treatmentPlans[0]);
                }
            }
            catch (error) {
                console.error('Error loading treatment plans:', error);
                sonner_1.toast.error('Erro ao carregar planos de tratamento');
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleCreatePlan = function (planData) { return __awaiter(_this, void 0, void 0, function () {
        var newPlan_1;
        return __generator(this, function (_a) {
            try {
                newPlan_1 = __assign(__assign({ id: "plan_".concat(Date.now()), patient_id: patientId }, planData), { completed_sessions: 0, protocols: [], assigned_professionals: [], progress_notes: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: 'current_user_id', updated_by: 'current_user_id', lgpd_consent: true, data_retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
                 });
                setTreatmentPlans(function (prev) { return __spreadArray([newPlan_1], prev, true); });
                setSelectedPlan(newPlan_1);
                setShowPlanDialog(false);
                sonner_1.toast.success('Plano de tratamento criado com sucesso');
                onPlanUpdate === null || onPlanUpdate === void 0 ? void 0 : onPlanUpdate();
            }
            catch (error) {
                console.error('Error creating treatment plan:', error);
                sonner_1.toast.error('Erro ao criar plano de tratamento');
            }
            return [2 /*return*/];
        });
    }); };
    var handleAddProtocol = function (protocolData) { return __awaiter(_this, void 0, void 0, function () {
        var newProtocol, updatedPlan_1;
        return __generator(this, function (_a) {
            if (!selectedPlan)
                return [2 /*return*/];
            try {
                newProtocol = __assign(__assign({ id: "protocol_".concat(Date.now()), treatment_plan_id: selectedPlan.id }, protocolData), { status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lgpd_consent: true });
                updatedPlan_1 = __assign(__assign({}, selectedPlan), { protocols: __spreadArray(__spreadArray([], selectedPlan.protocols, true), [newProtocol], false) });
                setSelectedPlan(updatedPlan_1);
                setTreatmentPlans(function (prev) {
                    return prev.map(function (plan) { return plan.id === selectedPlan.id ? updatedPlan_1 : plan; });
                });
                setShowProtocolDialog(false);
                sonner_1.toast.success('Protocolo adicionado com sucesso');
                onPlanUpdate === null || onPlanUpdate === void 0 ? void 0 : onPlanUpdate();
            }
            catch (error) {
                console.error('Error adding protocol:', error);
                sonner_1.toast.error('Erro ao adicionar protocolo');
            }
            return [2 /*return*/];
        });
    }); };
    var handleStartProtocol = function (protocolId) { return __awaiter(_this, void 0, void 0, function () {
        var updatedProtocols, updatedPlan_2;
        return __generator(this, function (_a) {
            if (!selectedPlan)
                return [2 /*return*/];
            try {
                updatedProtocols = selectedPlan.protocols.map(function (protocol) {
                    return protocol.id === protocolId
                        ? __assign(__assign({}, protocol), { status: 'in_progress', scheduled_date: new Date().toISOString() }) : protocol;
                });
                updatedPlan_2 = __assign(__assign({}, selectedPlan), { protocols: updatedProtocols });
                setSelectedPlan(updatedPlan_2);
                setTreatmentPlans(function (prev) {
                    return prev.map(function (plan) { return plan.id === selectedPlan.id ? updatedPlan_2 : plan; });
                });
                sonner_1.toast.success('Protocolo iniciado');
                onPlanUpdate === null || onPlanUpdate === void 0 ? void 0 : onPlanUpdate();
            }
            catch (error) {
                console.error('Error starting protocol:', error);
                sonner_1.toast.error('Erro ao iniciar protocolo');
            }
            return [2 /*return*/];
        });
    }); };
    var handleCompleteProtocol = function (protocolId, notes) { return __awaiter(_this, void 0, void 0, function () {
        var updatedProtocols, completedCount, updatedPlan_3;
        return __generator(this, function (_a) {
            if (!selectedPlan)
                return [2 /*return*/];
            try {
                updatedProtocols = selectedPlan.protocols.map(function (protocol) {
                    return protocol.id === protocolId
                        ? __assign(__assign({}, protocol), { status: 'completed', completed_date: new Date().toISOString(), notes: notes || protocol.notes }) : protocol;
                });
                completedCount = updatedProtocols.filter(function (p) { return p.status === 'completed'; }).length;
                updatedPlan_3 = __assign(__assign({}, selectedPlan), { protocols: updatedProtocols, completed_sessions: completedCount });
                setSelectedPlan(updatedPlan_3);
                setTreatmentPlans(function (prev) {
                    return prev.map(function (plan) { return plan.id === selectedPlan.id ? updatedPlan_3 : plan; });
                });
                sonner_1.toast.success('Protocolo concluído');
                onPlanUpdate === null || onPlanUpdate === void 0 ? void 0 : onPlanUpdate();
            }
            catch (error) {
                console.error('Error completing protocol:', error);
                sonner_1.toast.error('Erro ao concluir protocolo');
            }
            return [2 /*return*/];
        });
    }); };
    var calculatePlanProgress = function (plan) {
        if (plan.total_sessions === 0)
            return 0;
        return Math.round((plan.completed_sessions / plan.total_sessions) * 100);
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'revised': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'skipped': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    var getTypeIcon = function (type) {
        switch (type) {
            case 'orthodontics': return <lucide_react_1.Target className="h-4 w-4"/>;
            case 'implants': return <lucide_react_1.Award className="h-4 w-4"/>;
            case 'periodontics': return <lucide_react_1.Activity className="h-4 w-4"/>;
            case 'endodontics': return <lucide_react_1.Clipboard className="h-4 w-4"/>;
            case 'oral_surgery': return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
            default: return <lucide_react_1.FileText className="h-4 w-4"/>;
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planos de Tratamento</h2>
          <p className="text-muted-foreground">
            Gestão de planos de tratamento e protocolos padronizados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" onClick={function () {
            // Export treatment plans with LGPD compliance
            console.log('Exporting treatment plans');
            sonner_1.toast.success('Planos exportados com conformidade LGPD');
        }} className="hidden sm:flex">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Exportar
          </button_1.Button>
          {!readOnly && (<dialog_1.Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Novo Plano
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent className="max-w-4xl">
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Criar Plano de Tratamento</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Defina um novo plano de tratamento com protocolos padronizados
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <TreatmentPlanForm onSubmit={handleCreatePlan} onCancel={function () { return setShowPlanDialog(false); }}/>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>)}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder="Buscar planos de tratamento..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>
        <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
          <select_1.SelectTrigger className="w-[150px]">
            <select_1.SelectValue placeholder="Status"/>
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos</select_1.SelectItem>
            <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
            <select_1.SelectItem value="completed">Concluído</select_1.SelectItem>
            <select_1.SelectItem value="on_hold">Em Espera</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
        <select_1.Select value={filterType} onValueChange={setFilterType}>
          <select_1.SelectTrigger className="w-[150px]">
            <select_1.SelectValue placeholder="Tipo"/>
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos</select_1.SelectItem>
            <select_1.SelectItem value="orthodontics">Ortodontia</select_1.SelectItem>
            <select_1.SelectItem value="implants">Implantes</select_1.SelectItem>
            <select_1.SelectItem value="periodontics">Periodontia</select_1.SelectItem>
            <select_1.SelectItem value="endodontics">Endodontia</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Treatment Plans List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">Planos Ativos</h3>
          <div className="space-y-3">
            {treatmentPlans.map(function (plan) {
            var progress = calculatePlanProgress(plan);
            var isSelected = (selectedPlan === null || selectedPlan === void 0 ? void 0 : selectedPlan.id) === plan.id;
            return (<card_1.Card key={plan.id} className={"cursor-pointer transition-colors ".concat(isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50')} onClick={function () { return setSelectedPlan(plan); }}>
                  <card_1.CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(plan.plan_type)}
                            <h4 className="font-semibold text-sm">{plan.plan_name}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <badge_1.Badge className={getStatusColor(plan.status)} variant="secondary">
                              {plan.status}
                            </badge_1.Badge>
                            <badge_1.Badge className={getPriorityColor(plan.priority)} variant="secondary">
                              {plan.priority}
                            </badge_1.Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <progress_1.Progress value={progress} className="h-2"/>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{plan.completed_sessions}/{plan.total_sessions} sessões</span>
                          <span>{(0, date_fns_1.format)(new Date(plan.start_date), 'dd/MM/yy', { locale: locale_1.ptBR })}</span>
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
        })}
          </div>
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-2">
          {selectedPlan ? (<tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <tabs_1.TabsList className="grid w-full grid-cols-4">
                <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="protocols">Protocolos</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="progress">Progresso</tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="team">Equipe</tabs_1.TabsTrigger>
              </tabs_1.TabsList>

              {/* Overview Tab */}
              <tabs_1.TabsContent value="overview" className="space-y-4">
                <card_1.Card>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="flex items-center space-x-2">
                          {getTypeIcon(selectedPlan.plan_type)}
                          <span>{selectedPlan.plan_name}</span>
                        </card_1.CardTitle>
                        <card_1.CardDescription>{selectedPlan.description}</card_1.CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge className={getStatusColor(selectedPlan.status)}>
                          {selectedPlan.status}
                        </badge_1.Badge>
                        <badge_1.Badge className={getPriorityColor(selectedPlan.priority)}>
                          {selectedPlan.priority}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Cronograma</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Início:</span>
                              <span>{(0, date_fns_1.format)(new Date(selectedPlan.start_date), 'dd/MM/yyyy', { locale: locale_1.ptBR })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Previsão de término:</span>
                              <span>{(0, date_fns_1.format)(new Date(selectedPlan.estimated_end_date), 'dd/MM/yyyy', { locale: locale_1.ptBR })}</span>
                            </div>
                            {selectedPlan.actual_end_date && (<div className="flex justify-between">
                                <span className="text-muted-foreground">Término real:</span>
                                <span>{(0, date_fns_1.format)(new Date(selectedPlan.actual_end_date), 'dd/MM/yyyy', { locale: locale_1.ptBR })}</span>
                              </div>)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Progresso</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Sessões concluídas</span>
                              <span className="font-medium">{selectedPlan.completed_sessions}/{selectedPlan.total_sessions}</span>
                            </div>
                            <progress_1.Progress value={calculatePlanProgress(selectedPlan)} className="h-2"/>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Custos</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Estimado:</span>
                              <span>R$ {selectedPlan.estimated_cost.toLocaleString('pt-BR')}</span>
                            </div>
                            {selectedPlan.actual_cost && (<div className="flex justify-between">
                                <span className="text-muted-foreground">Real:</span>
                                <span>R$ {selectedPlan.actual_cost.toLocaleString('pt-BR')}</span>
                              </div>)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Objetivos</h4>
                          <div className="space-y-1">
                            {selectedPlan.objectives.map(function (objective, index) { return (<div key={index} className="flex items-center space-x-2 text-sm">
                                <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500"/>
                                <span>{objective}</span>
                              </div>); })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPlan.contraindications && selectedPlan.contraindications.length > 0 && (<div>
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500"/>
                          <span>Contraindicações</span>
                        </h4>
                        <div className="space-y-1">
                          {selectedPlan.contraindications.map(function (contraindication, index) { return (<div key={index} className="flex items-center space-x-2 text-sm text-orange-700">
                              <lucide_react_1.AlertCircle className="h-3 w-3"/>
                              <span>{contraindication}</span>
                            </div>); })}
                        </div>
                      </div>)}
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>

              {/* Protocols Tab */}
              <tabs_1.TabsContent value="protocols" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Protocolos de Tratamento</h3>
                  {!readOnly && (<dialog_1.Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
                      <dialog_1.DialogTrigger asChild>
                        <button_1.Button>
                          <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                          Adicionar Protocolo
                        </button_1.Button>
                      </dialog_1.DialogTrigger>
                      <dialog_1.DialogContent className="max-w-4xl">
                        <dialog_1.DialogHeader>
                          <dialog_1.DialogTitle>Adicionar Protocolo</dialog_1.DialogTitle>
                          <dialog_1.DialogDescription>
                            Adicione um novo protocolo ao plano de tratamento
                          </dialog_1.DialogDescription>
                        </dialog_1.DialogHeader>
                        <ProtocolForm onSubmit={handleAddProtocol} onCancel={function () { return setShowProtocolDialog(false); }}/>
                      </dialog_1.DialogContent>
                    </dialog_1.Dialog>)}
                </div>
                
                <div className="space-y-4">
                  {selectedPlan.protocols
                .sort(function (a, b) { return a.sequence_order - b.sequence_order; })
                .map(function (protocol) { return (<card_1.Card key={protocol.id}>
                      <card_1.CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <badge_1.Badge variant="outline">#{protocol.sequence_order}</badge_1.Badge>
                              <h4 className="font-semibold">{protocol.protocol_name}</h4>
                              <badge_1.Badge className={getStatusColor(protocol.status)}>
                                {protocol.status}
                              </badge_1.Badge>
                            </div>
                            
                            <div className="grid gap-2 md:grid-cols-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Categoria: </span>
                                <span>{protocol.category}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duração: </span>
                                <span>{protocol.estimated_duration} min</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Etapas: </span>
                                <span>{protocol.steps.length}</span>
                              </div>
                            </div>
                            
                            {protocol.scheduled_date && (<div className="text-sm">
                                <span className="text-muted-foreground">Agendado para: </span>
                                <span>{(0, date_fns_1.format)(new Date(protocol.scheduled_date), 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</span>
                              </div>)}
                            
                            {protocol.notes && (<p className="text-sm text-muted-foreground">{protocol.notes}</p>)}
                          </div>
                          
                          {!readOnly && (<div className="flex items-center space-x-2">
                              {protocol.status === 'pending' && (<button_1.Button size="sm" onClick={function () { return handleStartProtocol(protocol.id); }}>
                                  <lucide_react_1.Play className="mr-1 h-3 w-3"/>
                                  Iniciar
                                </button_1.Button>)}
                              {protocol.status === 'in_progress' && (<button_1.Button size="sm" onClick={function () { return handleCompleteProtocol(protocol.id); }}>
                                  <lucide_react_1.CheckCircle className="mr-1 h-3 w-3"/>
                                  Concluir
                                </button_1.Button>)}
                              <button_1.Button variant="ghost" size="sm">
                                <lucide_react_1.Edit className="h-3 w-3"/>
                              </button_1.Button>
                            </div>)}
                        </div>
                        
                        {/* Protocol Steps */}
                        {protocol.steps.length > 0 && (<div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium mb-2">Etapas do Protocolo</h5>
                            <div className="space-y-2">
                              {protocol.steps.map(function (step) { return (<div key={step.id} className="flex items-center space-x-3 text-sm">
                                  <badge_1.Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                                    {step.step_number}
                                  </badge_1.Badge>
                                  <div className="flex-1">
                                    <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                      {step.title}
                                    </span>
                                    <span className="text-muted-foreground ml-2">({step.estimated_time} min)</span>
                                  </div>
                                  <badge_1.Badge className={getStatusColor(step.status)} variant="secondary">
                                    {step.status}
                                  </badge_1.Badge>
                                </div>); })}
                            </div>
                          </div>)}
                      </card_1.CardContent>
                    </card_1.Card>); })}
                </div>
              </tabs_1.TabsContent>

              {/* Progress Tab */}
              <tabs_1.TabsContent value="progress" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Notas de Progresso</h3>
                  {!readOnly && (<dialog_1.Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
                      <dialog_1.DialogTrigger asChild>
                        <button_1.Button>
                          <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                          Nova Nota
                        </button_1.Button>
                      </dialog_1.DialogTrigger>
                      <dialog_1.DialogContent className="max-w-2xl">
                        <dialog_1.DialogHeader>
                          <dialog_1.DialogTitle>Adicionar Nota de Progresso</dialog_1.DialogTitle>
                          <dialog_1.DialogDescription>
                            Registre o progresso do tratamento
                          </dialog_1.DialogDescription>
                        </dialog_1.DialogHeader>
                        <ProgressNoteForm onSubmit={function (data) {
                    // Handle progress note submission
                    setShowProgressDialog(false);
                    sonner_1.toast.success('Nota de progresso adicionada');
                }} onCancel={function () { return setShowProgressDialog(false); }}/>
                      </dialog_1.DialogContent>
                    </dialog_1.Dialog>)}
                </div>
                
                <div className="space-y-4">
                  {selectedPlan.progress_notes.map(function (note) { return (<card_1.Card key={note.id}>
                      <card_1.CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{note.title}</h4>
                              <badge_1.Badge variant="outline">{note.note_type}</badge_1.Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {(0, date_fns_1.format)(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                          <div className="text-xs text-muted-foreground">
                            Por: {note.created_by}
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>); })}
                </div>
              </tabs_1.TabsContent>

              {/* Team Tab */}
              <tabs_1.TabsContent value="team" className="space-y-4">
                <h3 className="text-lg font-semibold">Equipe Responsável</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedPlan.assigned_professionals.map(function (assignment) { return (<card_1.Card key={assignment.id}>
                      <card_1.CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{assignment.professional_name}</h4>
                            <badge_1.Badge variant="outline">{assignment.role}</badge_1.Badge>
                          </div>
                          {assignment.specialization && (<p className="text-sm text-muted-foreground">{assignment.specialization}</p>)}
                          <div className="text-xs text-muted-foreground">
                            CRO: {assignment.license_number}
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">Responsabilidades:</h5>
                            <ul className="text-xs space-y-1">
                              {assignment.responsibilities.map(function (responsibility, index) { return (<li key={index} className="flex items-center space-x-1">
                                  <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500"/>
                                  <span>{responsibility}</span>
                                </li>); })}
                            </ul>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>); })}
                </div>
              </tabs_1.TabsContent>
            </tabs_1.Tabs>) : (<card_1.Card>
              <card_1.CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                  <lucide_react_1.FileText className="h-8 w-8 text-muted-foreground mx-auto"/>
                  <p className="text-muted-foreground">Selecione um plano de tratamento para ver os detalhes</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>
      </div>
    </div>);
}
// Form Components (simplified for brevity)
function TreatmentPlanForm(_a) {
    var onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    var _b = (0, react_1.useState)({
        plan_name: '',
        plan_type: 'general',
        priority: 'medium',
        start_date: '',
        estimated_end_date: '',
        total_sessions: 1,
        estimated_cost: 0,
        description: '',
        objectives: [''],
        success_criteria: ['']
    }), formData = _b[0], setFormData = _b[1];
    return (<form onSubmit={function (e) { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label_1.Label htmlFor="plan_name">Nome do Plano *</label_1.Label>
          <input_1.Input id="plan_name" value={formData.plan_name} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { plan_name: e.target.value })); }); }} required/>
        </div>
        <div>
          <label_1.Label htmlFor="plan_type">Tipo de Tratamento</label_1.Label>
          <select_1.Select value={formData.plan_type} onValueChange={function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { plan_type: value })); }); }}>
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="general">Geral</select_1.SelectItem>
              <select_1.SelectItem value="orthodontics">Ortodontia</select_1.SelectItem>
              <select_1.SelectItem value="implants">Implantes</select_1.SelectItem>
              <select_1.SelectItem value="periodontics">Periodontia</select_1.SelectItem>
              <select_1.SelectItem value="endodontics">Endodontia</select_1.SelectItem>
              <select_1.SelectItem value="oral_surgery">Cirurgia Oral</select_1.SelectItem>
              <select_1.SelectItem value="cosmetic">Estética</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label_1.Label htmlFor="priority">Prioridade</label_1.Label>
          <select_1.Select value={formData.priority} onValueChange={function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { priority: value })); }); }}>
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
              <select_1.SelectItem value="medium">Média</select_1.SelectItem>
              <select_1.SelectItem value="high">Alta</select_1.SelectItem>
              <select_1.SelectItem value="urgent">Urgente</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
        <div>
          <label_1.Label htmlFor="start_date">Data de Início</label_1.Label>
          <input_1.Input id="start_date" type="date" value={formData.start_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { start_date: e.target.value })); }); }}/>
        </div>
        <div>
          <label_1.Label htmlFor="estimated_end_date">Previsão de Término</label_1.Label>
          <input_1.Input id="estimated_end_date" type="date" value={formData.estimated_end_date} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { estimated_end_date: e.target.value })); }); }}/>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label_1.Label htmlFor="total_sessions">Total de Sessões</label_1.Label>
          <input_1.Input id="total_sessions" type="number" min="1" value={formData.total_sessions} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { total_sessions: parseInt(e.target.value) || 1 })); }); }}/>
        </div>
        <div>
          <label_1.Label htmlFor="estimated_cost">Custo Estimado (R$)</label_1.Label>
          <input_1.Input id="estimated_cost" type="number" min="0" step="0.01" value={formData.estimated_cost} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { estimated_cost: parseFloat(e.target.value) || 0 })); }); }}/>
        </div>
      </div>
      
      <div>
        <label_1.Label htmlFor="description">Descrição</label_1.Label>
        <textarea_1.Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} rows={3}/>
      </div>
      
      <div className="flex items-center space-x-2">
        <checkbox_1.Checkbox id="lgpd_consent" required/>
        <label_1.Label htmlFor="lgpd_consent" className="text-sm">
          Confirmo o consentimento LGPD para armazenamento destes dados de tratamento
        </label_1.Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button_1.Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </button_1.Button>
        <button_1.Button type="submit">
          Criar Plano
        </button_1.Button>
      </div>
    </form>);
}
function ProtocolForm(_a) {
    var onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    // Similar form structure for protocols
    return <div>Protocol Form Component</div>;
}
function ProgressNoteForm(_a) {
    var onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    // Similar form structure for progress notes
    return <div>Progress Note Form Component</div>;
}
// Mock data generators
function generateMockTreatmentPlans() {
    return [
        {
            id: 'plan_1',
            patient_id: 'patient_1',
            plan_name: 'Tratamento Ortodôntico Completo',
            plan_type: 'orthodontics',
            status: 'active',
            priority: 'medium',
            start_date: '2024-01-15',
            estimated_end_date: '2025-01-15',
            total_sessions: 24,
            completed_sessions: 8,
            estimated_cost: 8500.00,
            actual_cost: 2800.00,
            description: 'Tratamento ortodôntico completo com aparelho fixo para correção de maloclusão classe II',
            objectives: [
                'Corrigir maloclusão classe II',
                'Alinhar dentes anteriores',
                'Melhorar função mastigatória',
                'Otimizar estética do sorriso'
            ],
            contraindications: [
                'Doença periodontal ativa',
                'Higiene oral inadequada'
            ],
            success_criteria: [
                'Overjet entre 2-4mm',
                'Overbite entre 2-4mm',
                'Alinhamento dental adequado',
                'Função mastigatória normal'
            ],
            protocols: [
                {
                    id: 'protocol_1',
                    treatment_plan_id: 'plan_1',
                    protocol_name: 'Instalação de Aparelho Ortodôntico',
                    protocol_type: 'standard',
                    category: 'Ortodontia',
                    sequence_order: 1,
                    estimated_duration: 90,
                    required_materials: [
                        {
                            id: 'mat_1',
                            name: 'Brackets metálicos',
                            quantity: 20,
                            unit: 'unidades',
                            cost_per_unit: 15.00,
                            required: true
                        }
                    ],
                    required_equipment: [
                        {
                            id: 'eq_1',
                            name: 'Cadeira odontológica',
                            type: 'furniture',
                            operator_certification_required: false,
                            safety_protocols: ['Posicionamento adequado do paciente']
                        }
                    ],
                    steps: [
                        {
                            id: 'step_1',
                            step_number: 1,
                            title: 'Preparação do paciente',
                            description: 'Posicionar paciente e preparar campo operatório',
                            estimated_time: 10,
                            required_skills: ['Posicionamento', 'Isolamento'],
                            verification_points: ['Paciente confortável', 'Campo limpo'],
                            completion_criteria: 'Paciente preparado adequadamente',
                            status: 'completed',
                            completed_at: '2024-01-15T10:00:00Z',
                            completed_by: 'doctor_1'
                        }
                    ],
                    precautions: ['Verificar alergias', 'Confirmar higiene oral'],
                    post_care_instructions: [
                        'Evitar alimentos duros nas primeiras 24h',
                        'Manter higiene oral rigorosa',
                        'Retornar em caso de desconforto excessivo'
                    ],
                    follow_up_requirements: [
                        {
                            id: 'follow_1',
                            title: 'Consulta de acompanhamento',
                            description: 'Verificar adaptação ao aparelho',
                            due_date: '2024-02-15',
                            priority: 'medium',
                            assigned_to: 'doctor_1',
                            status: 'pending'
                        }
                    ],
                    quality_metrics: [
                        {
                            id: 'metric_1',
                            metric_name: 'Tempo de instalação',
                            target_value: 90,
                            actual_value: 85,
                            unit: 'minutos',
                            measurement_date: '2024-01-15',
                            measured_by: 'doctor_1'
                        }
                    ],
                    status: 'completed',
                    scheduled_date: '2024-01-15T09:00:00Z',
                    completed_date: '2024-01-15T10:30:00Z',
                    performed_by: 'doctor_1',
                    notes: 'Instalação realizada sem intercorrências',
                    created_at: '2024-01-15T08:00:00Z',
                    updated_at: '2024-01-15T10:30:00Z',
                    lgpd_consent: true
                }
            ],
            assigned_professionals: [
                {
                    id: 'assign_1',
                    professional_id: 'prof_1',
                    professional_name: 'Dr. João Silva',
                    role: 'primary_dentist',
                    specialization: 'Ortodontia',
                    license_number: 'CRO-SP 12345',
                    assignment_date: '2024-01-15',
                    responsibilities: [
                        'Planejamento do tratamento',
                        'Execução dos procedimentos',
                        'Acompanhamento do progresso'
                    ],
                    availability_schedule: [
                        {
                            day_of_week: 1,
                            start_time: '08:00',
                            end_time: '17:00',
                            location: 'Consultório 1'
                        }
                    ]
                }
            ],
            progress_notes: [
                {
                    id: 'note_1',
                    treatment_plan_id: 'plan_1',
                    note_type: 'progress',
                    title: 'Progresso após 3 meses',
                    content: 'Paciente apresenta boa evolução no alinhamento dental. Cooperação excelente com higiene oral.',
                    created_at: '2024-04-15T14:00:00Z',
                    created_by: 'Dr. João Silva',
                    lgpd_consent: true
                }
            ],
            created_at: '2024-01-15T08:00:00Z',
            updated_at: '2024-04-15T14:00:00Z',
            created_by: 'doctor_1',
            updated_by: 'doctor_1',
            lgpd_consent: true,
            data_retention_date: '2031-01-15T08:00:00Z'
        }
    ];
}
