/**
 * Patient Segmentation Component
 * Story 3.4: Smart Search + NLP Integration - Task 3
 * AI-driven patient segmentation with natural language criteria
 */
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
exports.PatientSegmentation = PatientSegmentation;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var use_debounce_1 = require("@/hooks/use-debounce");
var patient_segmentation_1 = require("@/lib/search/patient-segmentation");
function PatientSegmentation(_a) {
    var _this = this;
    var onSegmentSelect = _a.onSegmentSelect, className = _a.className;
    // State
    var _b = (0, react_1.useState)([]), segments = _b[0], setSegments = _b[1];
    var _c = (0, react_1.useState)(null), selectedSegment = _c[0], setSelectedSegment = _c[1];
    var _d = (0, react_1.useState)(null), analytics = _d[0], setAnalytics = _d[1];
    var _e = (0, react_1.useState)(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(false), isCreating = _f[0], setIsCreating = _f[1];
    var _g = (0, react_1.useState)(''), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = (0, react_1.useState)('segments'), activeTab = _h[0], setActiveTab = _h[1];
    var _j = (0, react_1.useState)(false), showCreateDialog = _j[0], setShowCreateDialog = _j[1];
    var _k = (0, react_1.useState)(false), showSegmentDetails = _k[0], setShowSegmentDetails = _k[1];
    // Create segment form state
    var _l = (0, react_1.useState)({
        name: '',
        description: '',
        naturalLanguageQuery: '',
        language: 'pt'
    }), newSegment = _l[0], setNewSegment = _l[1];
    // Debounced search
    var debouncedSearchQuery = (0, use_debounce_1.useDebounce)(searchQuery, 300);
    // Load segments and analytics
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, segmentsData, analyticsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            patient_segmentation_1.patientSegmentation.getAllSegments(),
                            patient_segmentation_1.patientSegmentation.getAnalytics()
                        ])];
                case 2:
                    _a = _b.sent(), segmentsData = _a[0], analyticsData = _a[1];
                    setSegments(segmentsData);
                    setAnalytics(analyticsData);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading segmentation data:', error_1);
                    sonner_1.toast.error('Erro ao carregar dados de segmentação');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load data on mount
    (0, react_1.useEffect)(function () {
        loadData();
    }, [loadData]);
    // Filter segments based on search
    var filteredSegments = segments.filter(function (segment) {
        return segment.criteria.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            segment.criteria.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            segment.criteria.naturalLanguageQuery.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    });
    // Create new segment
    var handleCreateSegment = function () { return __awaiter(_this, void 0, void 0, function () {
        var segment_1, updatedAnalytics, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newSegment.name.trim() || !newSegment.naturalLanguageQuery.trim()) {
                        sonner_1.toast.error('Nome e critério em linguagem natural são obrigatórios');
                        return [2 /*return*/];
                    }
                    setIsCreating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, patient_segmentation_1.patientSegmentation.createSegment(newSegment.name, newSegment.naturalLanguageQuery, newSegment.language, 'current-user', // TODO: Get from auth context
                        newSegment.description)];
                case 2:
                    segment_1 = _a.sent();
                    setSegments(function (prev) { return __spreadArray([segment_1], prev, true); });
                    setShowCreateDialog(false);
                    setNewSegment({
                        name: '',
                        description: '',
                        naturalLanguageQuery: '',
                        language: 'pt'
                    });
                    sonner_1.toast.success("Segmento \"".concat(segment_1.criteria.name, "\" criado com sucesso!"));
                    return [4 /*yield*/, patient_segmentation_1.patientSegmentation.getAnalytics()];
                case 3:
                    updatedAnalytics = _a.sent();
                    setAnalytics(updatedAnalytics);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error creating segment:', error_2);
                    sonner_1.toast.error('Erro ao criar segmento');
                    return [3 /*break*/, 6];
                case 5:
                    setIsCreating(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Delete segment
    var handleDeleteSegment = function (segmentId) { return __awaiter(_this, void 0, void 0, function () {
        var updatedAnalytics, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, patient_segmentation_1.patientSegmentation.deleteSegment(segmentId)];
                case 1:
                    _a.sent();
                    setSegments(function (prev) { return prev.filter(function (s) { return s.id !== segmentId; }); });
                    if ((selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.id) === segmentId) {
                        setSelectedSegment(null);
                        setShowSegmentDetails(false);
                    }
                    sonner_1.toast.success('Segmento excluído com sucesso!');
                    return [4 /*yield*/, patient_segmentation_1.patientSegmentation.getAnalytics()];
                case 2:
                    updatedAnalytics = _a.sent();
                    setAnalytics(updatedAnalytics);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error deleting segment:', error_3);
                    sonner_1.toast.error('Erro ao excluir segmento');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Refresh segment
    var handleRefreshSegment = function (segment) { return __awaiter(_this, void 0, void 0, function () {
        var refreshedSegment_1, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, patient_segmentation_1.patientSegmentation.generateSegment(segment.criteria, { refreshData: true })];
                case 1:
                    refreshedSegment_1 = _a.sent();
                    setSegments(function (prev) { return prev.map(function (s) { return s.id === segment.id ? refreshedSegment_1 : s; }); });
                    if ((selectedSegment === null || selectedSegment === void 0 ? void 0 : selectedSegment.id) === segment.id) {
                        setSelectedSegment(refreshedSegment_1);
                    }
                    sonner_1.toast.success('Segmento atualizado com sucesso!');
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error refreshing segment:', error_4);
                    sonner_1.toast.error('Erro ao atualizar segmento');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Select segment
    var handleSelectSegment = function (segment) {
        setSelectedSegment(segment);
        setShowSegmentDetails(true);
        onSegmentSelect === null || onSegmentSelect === void 0 ? void 0 : onSegmentSelect(segment);
    };
    // Get performance color
    var getPerformanceColor = function (accuracy) {
        if (accuracy >= 0.8)
            return 'text-green-600';
        if (accuracy >= 0.6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    // Get performance icon
    var getPerformanceIcon = function (accuracy) {
        if (accuracy >= 0.8)
            return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>;
        if (accuracy >= 0.6)
            return <lucide_react_1.Clock className="h-4 w-4 text-yellow-600"/>;
        return <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600"/>;
    };
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Segmentação de Pacientes</h2>
          <p className="text-muted-foreground">
            Crie e gerencie segmentos inteligentes usando linguagem natural
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(isLoading ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          
          <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                Novo Segmento
              </button_1.Button>
            </dialog_1.DialogTrigger>
            
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Criar Novo Segmento</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Use linguagem natural para definir critérios de segmentação
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="segment-name">Nome do Segmento</label_1.Label>
                    <input_1.Input id="segment-name" placeholder="Ex: Pacientes Diabéticos Ativos" value={newSegment.name} onChange={function (e) { return setNewSegment(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }}/>
                  </div>
                  
                  <div className="space-y-2">
                    <label_1.Label htmlFor="segment-language">Idioma</label_1.Label>
                    <select_1.Select value={newSegment.language} onValueChange={function (value) {
            return setNewSegment(function (prev) { return (__assign(__assign({}, prev), { language: value })); });
        }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="pt">Português</select_1.SelectItem>
                        <select_1.SelectItem value="en">English</select_1.SelectItem>
                        <select_1.SelectItem value="es">Español</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="segment-description">Descrição (Opcional)</label_1.Label>
                  <input_1.Input id="segment-description" placeholder="Descrição do segmento..." value={newSegment.description} onChange={function (e) { return setNewSegment(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }}/>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="segment-criteria">Critérios em Linguagem Natural</label_1.Label>
                  <textarea_1.Textarea id="segment-criteria" placeholder="Ex: Pacientes com diabetes entre 40 e 65 anos que visitaram a clínica nos últimos 6 meses" value={newSegment.naturalLanguageQuery} onChange={function (e) { return setNewSegment(function (prev) { return (__assign(__assign({}, prev), { naturalLanguageQuery: e.target.value })); }); }} rows={3}/>
                  <p className="text-sm text-muted-foreground">
                    <lucide_react_1.Brain className="h-4 w-4 inline mr-1"/>
                    Use linguagem natural. A IA irá interpretar e converter em critérios estruturados.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button_1.Button variant="outline" onClick={function () { return setShowCreateDialog(false); }} disabled={isCreating}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={handleCreateSegment} disabled={isCreating}>
                    {isCreating && <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin"/>}
                    Criar Segmento
                  </button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>
      
      {/* Analytics Overview */}
      {analytics && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Segmentos</p>
                  <p className="text-2xl font-bold">{analytics.totalSegments}</p>
                </div>
                <lucide_react_1.Target className="h-8 w-8 text-blue-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
                  <p className="text-2xl font-bold">{analytics.totalPatients}</p>
                </div>
                <lucide_react_1.Users className="h-8 w-8 text-green-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamanho Médio</p>
                  <p className="text-2xl font-bold">{analytics.averageSegmentSize}</p>
                </div>
                <lucide_react_1.BarChart3 className="h-8 w-8 text-purple-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alta Performance</p>
                  <p className="text-2xl font-bold">{analytics.segmentPerformance.highPerforming}</p>
                </div>
                <lucide_react_1.TrendingUp className="h-8 w-8 text-orange-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}
      
      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="segments">Segmentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        
        <tabs_1.TabsContent value="segments" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <input_1.Input placeholder="Buscar segmentos..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-10"/>
            </div>
          </div>
          
          {/* Segments Grid */}
          {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {__spreadArray([], Array(6), true).map(function (_, i) { return (<card_1.Card key={i} className="animate-pulse">
                  <card_1.CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>) : filteredSegments.length === 0 ? (<card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.Target className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold mb-2">Nenhum segmento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Tente ajustar sua busca' : 'Crie seu primeiro segmento de pacientes'}
                </p>
                {!searchQuery && (<button_1.Button onClick={function () { return setShowCreateDialog(true); }}>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                    Criar Primeiro Segmento
                  </button_1.Button>)}
              </card_1.CardContent>
            </card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSegments.map(function (segment) { return (<card_1.Card key={segment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <card_1.CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <card_1.CardTitle className="text-lg">{segment.criteria.name}</card_1.CardTitle>
                        <card_1.CardDescription className="line-clamp-2">
                          {segment.criteria.description}
                        </card_1.CardDescription>
                      </div>
                      {getPerformanceIcon(segment.performance.accuracy)}
                    </div>
                  </card_1.CardHeader>
                  
                  <card_1.CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Patient Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pacientes</span>
                        <badge_1.Badge variant="secondary">
                          <lucide_react_1.Users className="h-3 w-3 mr-1"/>
                          {segment.patientCount}
                        </badge_1.Badge>
                      </div>
                      
                      {/* Performance */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Precisão</span>
                          <span className={getPerformanceColor(segment.performance.accuracy)}>
                            {Math.round(segment.performance.accuracy * 100)}%
                          </span>
                        </div>
                        <progress_1.Progress value={segment.performance.accuracy * 100} className="h-2"/>
                      </div>
                      
                      {/* Tags */}
                      {segment.criteria.tags && segment.criteria.tags.length > 0 && (<div className="flex flex-wrap gap-1">
                          {segment.criteria.tags.slice(0, 3).map(function (tag, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </badge_1.Badge>); })}
                          {segment.criteria.tags.length > 3 && (<badge_1.Badge variant="outline" className="text-xs">
                              +{segment.criteria.tags.length - 3}
                            </badge_1.Badge>)}
                        </div>)}
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-2">
                        <button_1.Button variant="outline" size="sm" onClick={function () { return handleSelectSegment(segment); }} className="flex-1">
                          <lucide_react_1.Eye className="h-3 w-3 mr-1"/>
                          Ver
                        </button_1.Button>
                        
                        <button_1.Button variant="outline" size="sm" onClick={function () { return handleRefreshSegment(segment); }}>
                          <lucide_react_1.RefreshCw className="h-3 w-3"/>
                        </button_1.Button>
                        
                        <button_1.Button variant="outline" size="sm" onClick={function () { return handleDeleteSegment(segment.id); }}>
                          <lucide_react_1.Trash2 className="h-3 w-3"/>
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
            </div>)}
        </tabs_1.TabsContent>
        
        <tabs_1.TabsContent value="analytics" className="space-y-6">
          {analytics && (<>
              {/* Performance Distribution */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Distribuição de Performance</card_1.CardTitle>
                  <card_1.CardDescription>
                    Análise da qualidade dos segmentos criados
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.segmentPerformance.highPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Alta Performance</div>
                      <div className="text-xs text-muted-foreground">≥80% precisão</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analytics.segmentPerformance.mediumPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Média Performance</div>
                      <div className="text-xs text-muted-foreground">60-79% precisão</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {analytics.segmentPerformance.lowPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Baixa Performance</div>
                      <div className="text-xs text-muted-foreground">&lt;60% precisão</div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
              
              {/* Common Criteria */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Critérios Mais Utilizados</card_1.CardTitle>
                  <card_1.CardDescription>
                    Tags e critérios mais frequentes nos segmentos
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.mostCommonCriteria.map(function (criteria, index) { return (<badge_1.Badge key={index} variant="secondary" className="text-sm">
                        {criteria}
                      </badge_1.Badge>); })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
              
              {/* Trends */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-green-600">Segmentos Crescendo</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <scroll_area_1.ScrollArea className="h-32">
                      {analytics.trends.growingSegments.length === 0 ? (<p className="text-sm text-muted-foreground">Nenhum segmento em crescimento</p>) : (<div className="space-y-1">
                          {analytics.trends.growingSegments.map(function (name, index) { return (<div key={index} className="text-sm">{name}</div>); })}
                        </div>)}
                    </scroll_area_1.ScrollArea>
                  </card_1.CardContent>
                </card_1.Card>
                
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-blue-600">Segmentos Estáveis</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <scroll_area_1.ScrollArea className="h-32">
                      {analytics.trends.stableSegments.length === 0 ? (<p className="text-sm text-muted-foreground">Nenhum segmento estável</p>) : (<div className="space-y-1">
                          {analytics.trends.stableSegments.map(function (name, index) { return (<div key={index} className="text-sm">{name}</div>); })}
                        </div>)}
                    </scroll_area_1.ScrollArea>
                  </card_1.CardContent>
                </card_1.Card>
                
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-red-600">Segmentos Diminuindo</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <scroll_area_1.ScrollArea className="h-32">
                      {analytics.trends.shrinkingSegments.length === 0 ? (<p className="text-sm text-muted-foreground">Nenhum segmento diminuindo</p>) : (<div className="space-y-1">
                          {analytics.trends.shrinkingSegments.map(function (name, index) { return (<div key={index} className="text-sm">{name}</div>); })}
                        </div>)}
                    </scroll_area_1.ScrollArea>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            </>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
      
      {/* Segment Details Dialog */}
      <dialog_1.Dialog open={showSegmentDetails} onOpenChange={setShowSegmentDetails}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedSegment && (<>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>{selectedSegment.criteria.name}</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  {selectedSegment.criteria.description}
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <div className="space-y-6">
                {/* Segment Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedSegment.patientCount}</div>
                    <div className="text-sm text-muted-foreground">Pacientes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={"text-2xl font-bold ".concat(getPerformanceColor(selectedSegment.performance.accuracy))}>
                      {Math.round(selectedSegment.performance.accuracy * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(selectedSegment.performance.precision * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(selectedSegment.performance.recall * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Recall</div>
                  </div>
                </div>
                
                <separator_1.Separator />
                
                {/* Natural Language Query */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <lucide_react_1.Brain className="h-4 w-4 mr-2"/>
                    Critério em Linguagem Natural
                  </h4>
                  <alert_1.Alert>
                    <alert_1.AlertDescription>
                      {selectedSegment.criteria.naturalLanguageQuery}
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                </div>
                
                {/* Insights */}
                {selectedSegment.insights && (<div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <lucide_react_1.Lightbulb className="h-4 w-4 mr-2"/>
                      Insights do Segmento
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <card_1.Card>
                        <card_1.CardHeader className="pb-2">
                          <card_1.CardTitle className="text-sm">Características Comuns</card_1.CardTitle>
                        </card_1.CardHeader>
                        <card_1.CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.commonCharacteristics.map(function (char, index) { return (<li key={index} className="text-muted-foreground">• {char}</li>); })}
                          </ul>
                        </card_1.CardContent>
                      </card_1.Card>
                      
                      <card_1.Card>
                        <card_1.CardHeader className="pb-2">
                          <card_1.CardTitle className="text-sm">Tendências</card_1.CardTitle>
                        </card_1.CardHeader>
                        <card_1.CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.trends.map(function (trend, index) { return (<li key={index} className="text-muted-foreground">• {trend}</li>); })}
                          </ul>
                        </card_1.CardContent>
                      </card_1.Card>
                      
                      <card_1.Card>
                        <card_1.CardHeader className="pb-2">
                          <card_1.CardTitle className="text-sm">Recomendações</card_1.CardTitle>
                        </card_1.CardHeader>
                        <card_1.CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.recommendations.map(function (rec, index) { return (<li key={index} className="text-muted-foreground">• {rec}</li>); })}
                          </ul>
                        </card_1.CardContent>
                      </card_1.Card>
                    </div>
                  </div>)}
                
                {/* Patient List */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <lucide_react_1.Users className="h-4 w-4 mr-2"/>
                    Pacientes no Segmento ({selectedSegment.patientCount})
                  </h4>
                  
                  <scroll_area_1.ScrollArea className="h-64">
                    <div className="space-y-2">
                      {selectedSegment.patients.slice(0, 50).map(function (patient) { return (<card_1.Card key={patient.patientId} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{patient.patientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.demographics.age} anos • {patient.demographics.gender} • {patient.demographics.location}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Última visita: {patient.medicalSummary.lastVisit}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={"font-medium ".concat(getPerformanceColor(patient.matchScore))}>
                                {Math.round(patient.matchScore * 100)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Correspondência
                              </div>
                            </div>
                          </div>
                          
                          {patient.matchedCriteria.length > 0 && (<div className="mt-2 flex flex-wrap gap-1">
                              {patient.matchedCriteria.map(function (criteria, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                                  {criteria}
                                </badge_1.Badge>); })}
                            </div>)}
                        </card_1.Card>); })}
                      
                      {selectedSegment.patients.length > 50 && (<div className="text-center text-sm text-muted-foreground py-2">
                          Mostrando 50 de {selectedSegment.patients.length} pacientes
                        </div>)}
                    </div>
                  </scroll_area_1.ScrollArea>
                </div>
              </div>
            </>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
