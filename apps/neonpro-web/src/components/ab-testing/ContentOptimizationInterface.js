/**
 * Content Optimization Interface
 * NeonPro - Interface completa para gestão de testes A/B e otimização de conteúdo
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
exports.default = ContentOptimizationInterface;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var tooltip_1 = require("@/components/ui/tooltip");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var ab_testing_engine_1 = require("@/lib/ab-testing/ab-testing-engine");
function ContentOptimizationInterface(_a) {
    var _this = this;
    var clinicId = _a.clinicId, userId = _a.userId;
    // State Management
    var _b = (0, react_1.useState)([]), tests = _b[0], setTests = _b[1];
    var _c = (0, react_1.useState)([]), templates = _c[0], setTemplates = _c[1];
    var _d = (0, react_1.useState)(null), selectedTest = _d[0], setSelectedTest = _d[1];
    var _e = (0, react_1.useState)(null), testResults = _e[0], setTestResults = _e[1];
    var _f = (0, react_1.useState)(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)('overview'), activeTab = _g[0], setActiveTab = _g[1];
    var _h = (0, react_1.useState)({
        clinicId: clinicId,
        page: 1,
        limit: 20
    }), filter = _h[0], setFilter = _h[1];
    // Test Creation State
    var _j = (0, react_1.useState)(false), isCreating = _j[0], setIsCreating = _j[1];
    var _k = (0, react_1.useState)(1), creationStep = _k[0], setCreationStep = _k[1];
    var _l = (0, react_1.useState)({
        name: '',
        description: '',
        type: 'email',
        audienceFilter: {
            includeAll: true,
            ageRange: { min: 18, max: 80 },
            gender: 'all'
        },
        primaryGoal: {
            id: 'conversion',
            name: 'Conversão',
            type: 'conversion',
            description: 'Taxa de conversão geral'
        },
        secondaryGoals: [],
        trafficAllocation: 100,
        confidenceLevel: 95,
        minimumDetectableEffect: 5,
        variations: [
            { name: 'Controle', trafficPercentage: 50, content: {} },
            { name: 'Variação A', trafficPercentage: 50, content: {} }
        ]
    }), testCreationState = _l[0], setTestCreationState = _l[1];
    // Load initial data
    (0, react_1.useEffect)(function () {
        loadTests();
        loadTemplates();
    }, []);
    // Auto-refresh active tests
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            if ((selectedTest === null || selectedTest === void 0 ? void 0 : selectedTest.status) === 'active') {
                loadTestResults(selectedTest.id);
            }
        }, 30000); // 30 seconds
        return function () { return clearInterval(interval); };
    }, [selectedTest]);
    /**
     * ====================================================================
     * DATA LOADING
     * ====================================================================
     */
    var loadTests = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.getTests(filter)];
                case 1:
                    result = _a.sent();
                    setTests(result.tests);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading tests:', error_1);
                    sonner_1.toast.error('Erro ao carregar testes A/B');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadTemplates = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Implementar busca de templates do banco
                // Por enquanto, usando dados mock
                setTemplates([
                    {
                        id: 'email-1',
                        name: 'Confirmação de Consulta',
                        type: 'email',
                        category: 'appointment',
                        description: 'Template para confirmação de consultas',
                        content: {
                            subject: 'Confirmação de Consulta - {clinic_name}',
                            body: 'Olá {patient_name}, sua consulta está confirmada para {appointment_date}.'
                        },
                        tags: ['consulta', 'confirmação'],
                        usage: 245,
                        performance: { conversionRate: 85.5, openRate: 92.3 },
                        lastUsed: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ]);
            }
            catch (error) {
                console.error('Error loading templates:', error);
            }
            return [2 /*return*/];
        });
    }); };
    var loadTestResults = function (testId) { return __awaiter(_this, void 0, void 0, function () {
        var results, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.calculateTestResults(testId)];
                case 1:
                    results = _a.sent();
                    setTestResults(results);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error loading test results:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * ====================================================================
     * TEST MANAGEMENT
     * ====================================================================
     */
    var createTest = function () { return __awaiter(_this, void 0, void 0, function () {
        var testConfig, newTest_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    testConfig = {
                        clinicId: clinicId,
                        name: testCreationState.name,
                        description: testCreationState.description,
                        type: testCreationState.type,
                        audienceFilter: testCreationState.audienceFilter,
                        primaryGoal: testCreationState.primaryGoal,
                        secondaryGoals: testCreationState.secondaryGoals,
                        startDate: testCreationState.startDate,
                        endDate: testCreationState.endDate,
                        duration: testCreationState.duration,
                        trafficAllocation: testCreationState.trafficAllocation,
                        confidenceLevel: testCreationState.confidenceLevel,
                        minimumDetectableEffect: testCreationState.minimumDetectableEffect,
                        variations: testCreationState.variations,
                        createdBy: userId
                    };
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.createTest(testConfig)];
                case 1:
                    newTest_1 = _a.sent();
                    setTests(function (prev) { return __spreadArray([newTest_1], prev, true); });
                    setIsCreating(false);
                    setCreationStep(1);
                    sonner_1.toast.success('Teste A/B criado com sucesso!');
                    return [3 /*break*/, 4];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error creating test:', error_3);
                    sonner_1.toast.error('Erro ao criar teste A/B');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var startTest = function (testId) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.startTest(testId)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTests()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Teste iniciado com sucesso!');
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error starting test:', error_4);
                    sonner_1.toast.error('Erro ao iniciar teste');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var pauseTest = function (testId) { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.pauseTest(testId, 'Pausado pelo usuário')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTests()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Teste pausado');
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error pausing test:', error_5);
                    sonner_1.toast.error('Erro ao pausar teste');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var completeTest = function (testId) { return __awaiter(_this, void 0, void 0, function () {
        var results, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ab_testing_engine_1.abTestingEngine.completeTest(testId, 'Finalizado pelo usuário')];
                case 1:
                    results = _a.sent();
                    setTestResults(results);
                    return [4 /*yield*/, loadTests()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Teste finalizado');
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error completing test:', error_6);
                    sonner_1.toast.error('Erro ao finalizar teste');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * ====================================================================
     * TEMPLATE MANAGEMENT
     * ====================================================================
     */
    var duplicateTemplate = function (template) {
        var newVariation = {
            name: "Baseado em ".concat(template.name),
            content: template.content,
            trafficPercentage: 50
        };
        setTestCreationState(function (prev) { return (__assign(__assign({}, prev), { variations: __spreadArray(__spreadArray([], prev.variations, true), [newVariation], false) })); });
        sonner_1.toast.success('Template adicionado como variação');
    };
    var applyTemplate = function (template, variationIndex) {
        setTestCreationState(function (prev) { return (__assign(__assign({}, prev), { variations: prev.variations.map(function (variation, index) {
                return index === variationIndex
                    ? __assign(__assign({}, variation), { content: template.content }) : variation;
            }) })); });
        sonner_1.toast.success('Template aplicado à variação');
    };
    /**
     * ====================================================================
     * VALIDATION
     * ====================================================================
     */
    var validateTestCreation = function () {
        if (!testCreationState.name.trim()) {
            sonner_1.toast.error('Nome do teste é obrigatório');
            return false;
        }
        if (testCreationState.variations.length < 2) {
            sonner_1.toast.error('É necessário pelo menos 2 variações');
            return false;
        }
        var totalTraffic = testCreationState.variations.reduce(function (sum, v) { return sum + (v.trafficPercentage || 0); }, 0);
        if (Math.abs(totalTraffic - 100) > 0.01) {
            sonner_1.toast.error('A soma das porcentagens de tráfego deve ser 100%');
            return false;
        }
        return true;
    };
    /**
     * ====================================================================
     * RENDER HELPERS
     * ====================================================================
     */
    var getStatusBadge = function (status) {
        var variants = {
            draft: { variant: 'secondary', icon: lucide_react_1.Edit },
            active: { variant: 'default', icon: lucide_react_1.Play },
            paused: { variant: 'outline', icon: lucide_react_1.Pause },
            completed: { variant: 'success', icon: lucide_react_1.CheckCircle }
        };
        var config = variants[status] || variants.draft;
        var Icon = config.icon;
        return (<badge_1.Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3"/>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </badge_1.Badge>);
    };
    var getPerformanceIndicator = function (metric, threshold) {
        if (threshold === void 0) { threshold = 50; }
        if (metric >= threshold * 1.2) {
            return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500"/>;
        }
        else if (metric <= threshold * 0.8) {
            return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500"/>;
        }
        return <lucide_react_1.Activity className="h-4 w-4 text-yellow-500"/>;
    };
    var getSignificanceColor = function (significance) {
        switch (significance) {
            case 'highly_significant': return 'text-green-600';
            case 'significant': return 'text-blue-600';
            case 'marginally_significant': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };
    /**
     * ====================================================================
     * RENDER COMPONENTS
     * ====================================================================
     */
    var renderTestsList = function () {
        var _a;
        return (<div className="space-y-4">
      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input_1.Input placeholder="Buscar testes..." value={filter.searchTerm || ''} onChange={function (e) { return setFilter(function (prev) { return (__assign(__assign({}, prev), { searchTerm: e.target.value })); }); }} className="w-full"/>
        </div>
        <select_1.Select value={((_a = filter.status) === null || _a === void 0 ? void 0 : _a[0]) || 'all'} onValueChange={function (value) { return setFilter(function (prev) { return (__assign(__assign({}, prev), { status: value === 'all' ? undefined : [value] })); }); }}>
          <select_1.SelectTrigger className="w-[180px]">
            <select_1.SelectValue placeholder="Status"/>
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos</select_1.SelectItem>
            <select_1.SelectItem value="draft">Rascunho</select_1.SelectItem>
            <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
            <select_1.SelectItem value="paused">Pausado</select_1.SelectItem>
            <select_1.SelectItem value="completed">Finalizado</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
        <button_1.Button onClick={function () { return setIsCreating(true); }}>
          <lucide_react_1.Zap className="h-4 w-4 mr-2"/>
          Novo Teste A/B
        </button_1.Button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(function (test) { return (<card_1.Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={function () { return setSelectedTest(test); }}>
            <card_1.CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <card_1.CardTitle className="text-lg">{test.name}</card_1.CardTitle>
                  <card_1.CardDescription className="text-sm">
                    {test.description}
                  </card_1.CardDescription>
                </div>
                {getStatusBadge(test.status)}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <lucide_react_1.Users className="h-3 w-3"/>
                    {test.currentSampleSize || 0} / {test.sampleSize} amostras
                  </span>
                  <span className="flex items-center gap-1">
                    <lucide_react_1.Target className="h-3 w-3"/>
                    {test.confidenceLevel}% confiança
                  </span>
                </div>

                {test.status === 'active' && (<progress_1.Progress value={(test.currentSampleSize / test.sampleSize) * 100} className="h-2"/>)}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {test.variations.length} variações
                  </span>
                  <div className="flex gap-1">
                    {test.status === 'draft' && (<button_1.Button size="sm" variant="outline" onClick={function (e) {
                        e.stopPropagation();
                        startTest(test.id);
                    }}>
                        <lucide_react_1.Play className="h-3 w-3"/>
                      </button_1.Button>)}
                    {test.status === 'active' && (<button_1.Button size="sm" variant="outline" onClick={function (e) {
                        e.stopPropagation();
                        pauseTest(test.id);
                    }}>
                        <lucide_react_1.Pause className="h-3 w-3"/>
                      </button_1.Button>)}
                    <button_1.Button size="sm" variant="outline" onClick={function (e) {
                    e.stopPropagation();
                    setSelectedTest(test);
                    loadTestResults(test.id);
                }}>
                      <lucide_react_1.BarChart3 className="h-3 w-3"/>
                    </button_1.Button>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>

      {tests.length === 0 && !isLoading && (<card_1.Card>
          <card_1.CardContent className="text-center py-8">
            <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
            <h3 className="text-lg font-medium mb-2">Nenhum teste encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro teste A/B para otimizar suas comunicações.
            </p>
            <button_1.Button onClick={function () { return setIsCreating(true); }}>
              Criar Primeiro Teste
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
    };
    var renderTestCreation = function () { return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Criar Novo Teste A/B</card_1.CardTitle>
        <card_1.CardDescription>
          Configure um teste para otimizar suas comunicações
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(function (step) { return (<div key={step} className={(0, utils_1.cn)("flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium", step <= creationStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground")}>
                {step}
              </div>); })}
          </div>

          {/* Step Content */}
          {creationStep === 1 && (<div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="test-name">Nome do Teste</label_1.Label>
                  <input_1.Input id="test-name" value={testCreationState.name} onChange={function (e) { return setTestCreationState(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} placeholder="Ex: Teste de Subject Line - Janeiro 2025"/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="test-type">Tipo de Comunicação</label_1.Label>
                  <select_1.Select value={testCreationState.type} onValueChange={function (value) { return setTestCreationState(function (prev) { return (__assign(__assign({}, prev), { type: value })); }); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Mail className="h-4 w-4"/>
                          Email
                        </div>
                      </select_1.SelectItem>
                      <select_1.SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.MessageSquare className="h-4 w-4"/>
                          SMS
                        </div>
                      </select_1.SelectItem>
                      <select_1.SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.MessageSquare className="h-4 w-4"/>
                          WhatsApp
                        </div>
                      </select_1.SelectItem>
                      <select_1.SelectItem value="notification">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Bell className="h-4 w-4"/>
                          Notificação
                        </div>
                      </select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="test-description">Descrição</label_1.Label>
                <textarea_1.Textarea id="test-description" value={testCreationState.description} onChange={function (e) { return setTestCreationState(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }} placeholder="Descreva o objetivo e hipótese do teste..." rows={3}/>
              </div>
            </div>)}

          {/* Navigation */}
          <div className="flex justify-between">
            <button_1.Button variant="outline" onClick={function () { return setIsCreating(false); }}>
              Cancelar
            </button_1.Button>
            <div className="flex gap-2">
              {creationStep > 1 && (<button_1.Button variant="outline" onClick={function () { return setCreationStep(function (prev) { return prev - 1; }); }}>
                  Voltar
                </button_1.Button>)}
              {creationStep < 4 ? (<button_1.Button onClick={function () { return setCreationStep(function (prev) { return prev + 1; }); }} disabled={creationStep === 1 && !testCreationState.name.trim()}>
                  Próximo
                </button_1.Button>) : (<button_1.Button onClick={createTest} disabled={!validateTestCreation() || isLoading}>
                  {isLoading ? 'Criando...' : 'Criar Teste'}
                </button_1.Button>)}
            </div>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>); };
    var renderTestResults = function () {
        if (!selectedTest || !testResults)
            return null;
        return (<div className="space-y-6">
        {/* Test Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedTest.name}</h2>
            <p className="text-muted-foreground">{selectedTest.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTest.status)}
            <button_1.Button variant="outline" onClick={function () { return setSelectedTest(null); }}>
              Voltar
            </button_1.Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressões</p>
                  <p className="text-2xl font-bold">{testResults.totalImpressions.toLocaleString()}</p>
                </div>
                <lucide_react_1.Eye className="h-8 w-8 text-blue-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversões</p>
                  <p className="text-2xl font-bold">{testResults.totalConversions.toLocaleString()}</p>
                </div>
                <lucide_react_1.Target className="h-8 w-8 text-green-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{testResults.overallConversionRate.toFixed(2)}%</p>
                </div>
                <lucide_react_1.PieChart className="h-8 w-8 text-purple-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Significância</p>
                  <p className={(0, utils_1.cn)("text-2xl font-bold", getSignificanceColor(testResults.statisticalSignificance))}>
                    {testResults.statisticalSignificance === 'highly_significant' ? 'Alta' :
                testResults.statisticalSignificance === 'significant' ? 'Média' :
                    testResults.statisticalSignificance === 'marginally_significant' ? 'Baixa' : 'N/A'}
                  </p>
                </div>
                <lucide_react_1.BarChart3 className="h-8 w-8 text-orange-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Variations Results */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Resultados por Variação</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {testResults.variationResults.map(function (result, index) {
                var _a;
                return (<div key={result.variationId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{result.variationName}</h4>
                      {result.isWinner && (<badge_1.Badge variant="success" className="flex items-center gap-1">
                          <lucide_react_1.Trophy className="h-3 w-3"/>
                          Vencedor
                        </badge_1.Badge>)}
                      {index === 0 && (<badge_1.Badge variant="outline">Controle</badge_1.Badge>)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getPerformanceIndicator(result.conversionRate)}
                      <span className="text-sm text-muted-foreground">
                        {result.liftPercentage > 0 ? '+' : ''}{result.liftPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressões</p>
                      <p className="text-lg font-medium">{result.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversões</p>
                      <p className="text-lg font-medium">{result.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-lg font-medium">{result.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>

                  {result.significance !== 'not_significant' && (<div className="mt-3 p-2 bg-muted rounded">
                      <p className="text-sm">
                        <span className={(0, utils_1.cn)("font-medium", getSignificanceColor(result.significance))}>
                          Significância: {result.significance}
                        </span>
                        {' '}(p-value: {(_a = result.pValue) === null || _a === void 0 ? void 0 : _a.toFixed(4)})
                      </p>
                    </div>)}
                </div>);
            })}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Insights and Recommendations */}
        {testResults.insights.length > 0 && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Insights e Recomendações</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {testResults.insights.map(function (insight, index) { return (<alert_1.Alert key={index}>
                    <lucide_react_1.Star className="h-4 w-4"/>
                    <alert_1.AlertTitle>Insight {index + 1}</alert_1.AlertTitle>
                    <alert_1.AlertDescription>{insight}</alert_1.AlertDescription>
                  </alert_1.Alert>); })}
                
                {testResults.recommendations.length > 0 && (<div className="mt-4">
                    <h4 className="font-medium mb-2">Recomendações:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {testResults.recommendations.map(function (rec, index) { return (<li key={index} className="text-sm text-muted-foreground">{rec}</li>); })}
                    </ul>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>);
    };
    /**
     * ====================================================================
     * MAIN RENDER
     * ====================================================================
     */
    return (<tooltip_1.TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Otimização de Conteúdo</h1>
            <p className="text-muted-foreground">
              Testes A/B e otimização de comunicações
            </p>
          </div>
          <button_1.Button onClick={loadTests} variant="outline" disabled={isLoading}>
            <lucide_react_1.RefreshCw className={(0, utils_1.cn)("h-4 w-4 mr-2", isLoading && "animate-spin")}/>
            Atualizar
          </button_1.Button>
        </div>

        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="results">Resultados</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="settings">Configurações</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="overview" className="space-y-6">
            {isCreating ? renderTestCreation() : renderTestsList()}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="templates" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Biblioteca de Templates</card_1.CardTitle>
                <card_1.CardDescription>
                  Templates otimizados para diferentes tipos de comunicação
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(function (template) { return (<card_1.Card key={template.id} className="cursor-pointer hover:shadow-md">
                      <card_1.CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <badge_1.Badge variant="outline">{template.type}</badge_1.Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span>Taxa de conversão: {template.performance.conversionRate}%</span>
                            <span>{template.usage} usos</span>
                          </div>

                          <div className="flex gap-2">
                            <button_1.Button size="sm" variant="outline" onClick={function () { return duplicateTemplate(template); }}>
                              <lucide_react_1.Copy className="h-3 w-3 mr-1"/>
                              Usar
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Eye className="h-3 w-3 mr-1"/>
                              Preview
                            </button_1.Button>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="results" className="space-y-6">
            {selectedTest ? renderTestResults() : (<card_1.Card>
                <card_1.CardContent className="text-center py-8">
                  <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                  <h3 className="text-lg font-medium mb-2">Selecione um teste</h3>
                  <p className="text-muted-foreground">
                    Escolha um teste da lista para ver os resultados detalhados.
                  </p>
                </card_1.CardContent>
              </card_1.Card>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="settings" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Configurações de Testes A/B</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label htmlFor="auto-winner">Seleção Automática de Vencedor</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar automaticamente a variação vencedora quando significância for atingida
                    </p>
                  </div>
                  <switch_1.Switch id="auto-winner"/>
                </div>

                <separator_1.Separator />

                <div className="space-y-2">
                  <label_1.Label>Nível de Confiança Padrão</label_1.Label>
                  <select_1.Select defaultValue="95">
                    <select_1.SelectTrigger className="w-[200px]">
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="90">90%</select_1.SelectItem>
                      <select_1.SelectItem value="95">95%</select_1.SelectItem>
                      <select_1.SelectItem value="99">99%</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </tooltip_1.TooltipProvider>);
}
