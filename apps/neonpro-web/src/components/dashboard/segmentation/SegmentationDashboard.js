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
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var PerformanceTracking_1 = require("./PerformanceTracking");
var PrivacyCompliance_1 = require("./PrivacyCompliance");
var SegmentBuilder_1 = require("./SegmentBuilder");
var SegmentationDashboard = () => {
  var _a = (0, react_1.useState)([]),
    segments = _a[0],
    setSegments = _a[1];
  var _b = (0, react_1.useState)({}),
    performance = _b[0],
    setPerformance = _b[1];
  var _c = (0, react_1.useState)([]),
    rules = _c[0],
    setRules = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedSegment = _f[0],
    setSelectedSegment = _f[1];
  var _g = (0, react_1.useState)("overview"),
    activeTab = _g[0],
    setActiveTab = _g[1];
  // New segment form state
  var _h = (0, react_1.useState)(false),
    showCreateDialog = _h[0],
    setShowCreateDialog = _h[1];
  var _j = (0, react_1.useState)({
      name: "",
      description: "",
      segment_type: "custom",
      criteria: {},
      auto_update: true,
      update_frequency: "daily",
    }),
    newSegment = _j[0],
    setNewSegment = _j[1];
  (0, react_1.useEffect)(() => {
    loadSegmentationData();
  }, []);
  var loadSegmentationData = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var segmentsResponse,
        segmentsData,
        performanceData,
        _i,
        _a,
        segment,
        perfResponse,
        perfData,
        error_1,
        rulesResponse,
        rulesData,
        error_2;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 14, 15, 16]);
            setLoading(true);
            setError(null);
            return [4 /*yield*/, fetch("/api/segmentation/segments")];
          case 1:
            segmentsResponse = _b.sent();
            if (!segmentsResponse.ok) throw new Error("Failed to load segments");
            return [4 /*yield*/, segmentsResponse.json()];
          case 2:
            segmentsData = _b.sent();
            setSegments(segmentsData.data || []);
            performanceData = {};
            (_i = 0), (_a = segmentsData.data || []);
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 10];
            segment = _a[_i];
            _b.label = 4;
          case 4:
            _b.trys.push([4, 8, , 9]);
            return [
              4 /*yield*/,
              fetch("/api/segmentation/segments/".concat(segment.id, "/performance")),
            ];
          case 5:
            perfResponse = _b.sent();
            if (!perfResponse.ok) return [3 /*break*/, 7];
            return [4 /*yield*/, perfResponse.json()];
          case 6:
            perfData = _b.sent();
            performanceData[segment.id] = perfData.data;
            _b.label = 7;
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_1 = _b.sent();
            console.warn(
              "Failed to load performance for segment ".concat(segment.id, ":"),
              error_1,
            );
            return [3 /*break*/, 9];
          case 9:
            _i++;
            return [3 /*break*/, 3];
          case 10:
            setPerformance(performanceData);
            return [4 /*yield*/, fetch("/api/segmentation/rules")];
          case 11:
            rulesResponse = _b.sent();
            if (!rulesResponse.ok) return [3 /*break*/, 13];
            return [4 /*yield*/, rulesResponse.json()];
          case 12:
            rulesData = _b.sent();
            setRules(rulesData.data || []);
            _b.label = 13;
          case 13:
            return [3 /*break*/, 16];
          case 14:
            error_2 = _b.sent();
            console.error("Error loading segmentation data:", error_2);
            setError(
              error_2 instanceof Error ? error_2.message : "Failed to load segmentation data",
            );
            return [3 /*break*/, 16];
          case 15:
            setLoading(false);
            return [7 /*endfinally*/];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  var createSegment = () =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, errorData, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/segmentation/segments", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newSegment),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to create segment");
          case 3:
            // Reset form and reload data
            setNewSegment({
              name: "",
              description: "",
              segment_type: "custom",
              criteria: {},
              auto_update: true,
              update_frequency: "daily",
            });
            setShowCreateDialog(false);
            return [4 /*yield*/, loadSegmentationData()];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            console.error("Error creating segment:", error_3);
            setError(error_3 instanceof Error ? error_3.message : "Failed to create segment");
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var getSegmentTypeColor = (type) => {
    var colors = {
      demographic: "bg-blue-100 text-blue-800",
      behavioral: "bg-green-100 text-green-800",
      clinical: "bg-red-100 text-red-800",
      engagement: "bg-purple-100 text-purple-800",
      financial: "bg-yellow-100 text-yellow-800",
      custom: "bg-gray-100 text-gray-800",
      ai_generated: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || colors.custom;
  };
  var formatPercentage = (value) => "".concat((value * 100).toFixed(1), "%");
  var formatCurrency = (value) =>
    "R$ ".concat(value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
  var filteredSegments =
    selectedSegment === "all" ? segments : segments.filter((s) => s.id === selectedSegment);
  var totalPatients = segments.reduce((sum, segment) => sum + segment.member_count, 0);
  var aiGeneratedCount = segments.filter((s) => s.ai_generated).length;
  var activeSegmentsCount = segments.filter((s) => s.is_active).length;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentação de Pacientes</h1>
          <p className="text-muted-foreground">
            Análise inteligente e segmentação automatizada de pacientes
          </p>
        </div>
        <div className="flex space-x-2">
          <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                Novo Segmento
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-md">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Criar Novo Segmento</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure um novo segmento de pacientes
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <div className="space-y-4">
                <div>
                  <label_1.Label htmlFor="segment-name">Nome do Segmento</label_1.Label>
                  <input_1.Input
                    id="segment-name"
                    value={newSegment.name}
                    onChange={(e) =>
                      setNewSegment(__assign(__assign({}, newSegment), { name: e.target.value }))
                    }
                    placeholder="Ex: Pacientes Premium"
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="segment-description">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="segment-description"
                    value={newSegment.description}
                    onChange={(e) =>
                      setNewSegment(
                        __assign(__assign({}, newSegment), { description: e.target.value }),
                      )
                    }
                    placeholder="Descreva o segmento..."
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="segment-type">Tipo de Segmento</label_1.Label>
                  <select_1.Select
                    value={newSegment.segment_type}
                    onValueChange={(value) =>
                      setNewSegment(__assign(__assign({}, newSegment), { segment_type: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="demographic">Demográfico</select_1.SelectItem>
                      <select_1.SelectItem value="behavioral">Comportamental</select_1.SelectItem>
                      <select_1.SelectItem value="clinical">Clínico</select_1.SelectItem>
                      <select_1.SelectItem value="engagement">Engajamento</select_1.SelectItem>
                      <select_1.SelectItem value="financial">Financeiro</select_1.SelectItem>
                      <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                <div className="flex items-center space-x-2">
                  <switch_1.Switch
                    id="auto-update"
                    checked={newSegment.auto_update}
                    onCheckedChange={(checked) =>
                      setNewSegment(__assign(__assign({}, newSegment), { auto_update: checked }))
                    }
                  />
                  <label_1.Label htmlFor="auto-update">Atualização Automática</label_1.Label>
                </div>
                <div className="flex space-x-2">
                  <button_1.Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={createSegment} disabled={!newSegment.name}>
                    Criar Segmento
                  </button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
          <button_1.Button variant="outline" onClick={loadSegmentationData}>
            <lucide_react_1.BarChart3 className="mr-2 h-4 w-4" />
            Atualizar
          </button_1.Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Pacientes</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Em {segments.length} segmentos ativos</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Segmentos Ativos</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{activeSegmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {segments.length - activeSegmentsCount} inativos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">IA Ativa</card_1.CardTitle>
            <lucide_react_1.Brain className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{aiGeneratedCount}</div>
            <p className="text-xs text-muted-foreground">Segmentos gerados por IA</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Regras Ativas</card_1.CardTitle>
            <lucide_react_1.Zap className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{rules.filter((r) => r.is_active).length}</div>
            <p className="text-xs text-muted-foreground">{rules.length} regras totais</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="builder">Construtor</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="privacy">Privacidade</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="segments">Segmentos</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="rules">Regras de Automação</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <div className="flex items-center space-x-2">
            <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground" />
            <select_1.Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <select_1.SelectTrigger className="w-[200px]">
                <select_1.SelectValue placeholder="Filtrar segmentos" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os Segmentos</select_1.SelectItem>
                {segments.map((segment) => (
                  <select_1.SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </select_1.SelectItem>
                ))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => {
              var segmentPerf = performance[segment.id];
              return (
                <card_1.Card key={segment.id}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="flex items-center gap-2">
                          {segment.name}
                          <badge_1.Badge className={getSegmentTypeColor(segment.segment_type)}>
                            {segment.segment_type}
                          </badge_1.Badge>
                          {segment.ai_generated && (
                            <badge_1.Badge variant="secondary">
                              <lucide_react_1.Brain className="w-3 h-3 mr-1" />
                              IA
                            </badge_1.Badge>
                          )}
                          {segment.is_active
                            ? <badge_1.Badge variant="default">
                                <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
                                Ativo
                              </badge_1.Badge>
                            : <badge_1.Badge variant="secondary">
                                <lucide_react_1.Clock className="w-3 h-3 mr-1" />
                                Inativo
                              </badge_1.Badge>}
                        </card_1.CardTitle>
                        <card_1.CardDescription>{segment.description}</card_1.CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{segment.member_count}</div>
                        <div className="text-sm text-muted-foreground">pacientes</div>
                      </div>
                    </div>
                  </card_1.CardHeader>
                  {segmentPerf && (
                    <card_1.CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium">Retenção</div>
                          <div className="text-lg">
                            {formatPercentage(segmentPerf.member_retention_rate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Engajamento</div>
                          <div className="text-lg">
                            {formatPercentage(segmentPerf.average_engagement_score)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Receita Total</div>
                          <div className="text-lg">{formatCurrency(segmentPerf.total_revenue)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">ROI</div>
                          <div
                            className={"text-lg ".concat(
                              segmentPerf.roi > 0 ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {formatPercentage(segmentPerf.roi)}
                          </div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  )}
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => (
              <card_1.Card key={segment.id}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>{segment.name}</card_1.CardTitle>
                      <card_1.CardDescription>
                        Criado em {new Date(segment.created_at).toLocaleDateString("pt-BR")}
                      </card_1.CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </button_1.Button>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Membros:</span>
                      <span className="font-medium">{segment.member_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <badge_1.Badge className={getSegmentTypeColor(segment.segment_type)}>
                        {segment.segment_type}
                      </badge_1.Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <badge_1.Badge variant={segment.is_active ? "default" : "secondary"}>
                        {segment.is_active ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => {
              var segmentPerf = performance[segment.id];
              if (!segmentPerf) return null;
              return (
                <card_1.Card key={segment.id}>
                  <card_1.CardHeader>
                    <card_1.CardTitle>{segment.name} - Performance</card_1.CardTitle>
                    <card_1.CardDescription>
                      Métricas de performance do segmento
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label_1.Label>Taxa de Retenção</label_1.Label>
                        <div className="mt-2">
                          <progress_1.Progress value={segmentPerf.member_retention_rate * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.member_retention_rate)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label_1.Label>Engajamento Médio</label_1.Label>
                        <div className="mt-2">
                          <progress_1.Progress value={segmentPerf.average_engagement_score * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.average_engagement_score)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label_1.Label>Taxa de Sucesso</label_1.Label>
                        <div className="mt-2">
                          <progress_1.Progress value={segmentPerf.treatment_success_rate * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.treatment_success_rate)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label_1.Label>Novos Membros</label_1.Label>
                        <div className="text-2xl font-bold text-green-600">
                          +{segmentPerf.new_members}
                        </div>
                      </div>
                      <div>
                        <label_1.Label>Membros que Saíram</label_1.Label>
                        <div className="text-2xl font-bold text-red-600">
                          -{segmentPerf.departed_members}
                        </div>
                      </div>
                      <div>
                        <label_1.Label>ROI</label_1.Label>
                        <div
                          className={"text-2xl font-bold ".concat(
                            segmentPerf.roi > 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {formatPercentage(segmentPerf.roi)}
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {rules.map((rule) => (
              <card_1.Card key={rule.id}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>{rule.rule_name}</card_1.CardTitle>
                      <card_1.CardDescription>{rule.rule_description}</card_1.CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {rule.requires_ai && (
                        <badge_1.Badge variant="secondary">
                          <lucide_react_1.Brain className="w-3 h-3 mr-1" />
                          IA
                        </badge_1.Badge>
                      )}
                      <badge_1.Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Ativa" : "Inativa"}
                      </badge_1.Badge>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label_1.Label>Correspondências</label_1.Label>
                      <div className="text-lg font-semibold">{rule.matches_count}</div>
                    </div>
                    <div>
                      <label_1.Label>Precisão</label_1.Label>
                      <div className="text-lg font-semibold">
                        {rule.accuracy_rate ? formatPercentage(rule.accuracy_rate) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <label_1.Label>Última Avaliação</label_1.Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(rule.last_evaluated).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      <label_1.Label>Ações</label_1.Label>
                      <div className="flex space-x-2">
                        <button_1.Button variant="outline" size="sm">
                          Editar
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm">
                          Executar
                        </button_1.Button>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="builder" className="space-y-4">
          <SegmentBuilder_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="performance" className="space-y-4">
          <PerformanceTracking_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="privacy" className="space-y-4">
          <PrivacyCompliance_1.default />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
};
exports.default = SegmentationDashboard;
