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
exports.default = TreatmentSuccessPage;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function TreatmentSuccessPage(_a) {
  var className = _a.className;
  var _b = (0, react_1.useState)("overview"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)(null),
    successStats = _c[0],
    setSuccessStats = _c[1];
  var _d = (0, react_1.useState)(null),
    providerStats = _d[0],
    setProviderStats = _d[1];
  var _e = (0, react_1.useState)([]),
    treatmentTypeStats = _e[0],
    setTreatmentTypeStats = _e[1];
  var _f = (0, react_1.useState)(null),
    complianceStats = _f[0],
    setComplianceStats = _f[1];
  var _g = (0, react_1.useState)([]),
    treatmentOutcomes = _g[0],
    setTreatmentOutcomes = _g[1];
  var _h = (0, react_1.useState)([]),
    successMetrics = _h[0],
    setSuccessMetrics = _h[1];
  var _j = (0, react_1.useState)([]),
    providerPerformance = _j[0],
    setProviderPerformance = _j[1];
  var _k = (0, react_1.useState)([]),
    protocolOptimizations = _k[0],
    setProtocolOptimizations = _k[1];
  var _l = (0, react_1.useState)([]),
    qualityBenchmarks = _l[0],
    setQualityBenchmarks = _l[1];
  var _m = (0, react_1.useState)([]),
    complianceReports = _m[0],
    setComplianceReports = _m[1];
  var _o = (0, react_1.useState)(true),
    loading = _o[0],
    setLoading = _o[1];
  var _p = (0, react_1.useState)(null),
    error = _p[0],
    setError = _p[1];
  // Form states
  var _q = (0, react_1.useState)({
      patient_id: "",
      treatment_type: "",
      provider_id: "",
      treatment_date: "",
      success_score: 0,
      patient_satisfaction_score: 0,
      complications: "",
      follow_up_notes: "",
      status: "completed",
    }),
    outcomeForm = _q[0],
    setOutcomeForm = _q[1];
  var _r = (0, react_1.useState)({
      treatment_type: "",
      current_protocol: "",
      suggested_improvements: "",
      success_rate_improvement: 0,
      implementation_priority: "medium",
      rationale: "",
    }),
    optimizationForm = _r[0],
    setOptimizationForm = _r[1];
  var _s = (0, react_1.useState)({
      treatment_type: "",
      target_success_rate: 0,
      minimum_satisfaction: 0,
      maximum_complication_rate: 0,
      industry_standard: 0,
      certification_requirement: "",
    }),
    benchmarkForm = _s[0],
    setBenchmarkForm = _s[1];
  (0, react_1.useEffect)(() => {
    loadDashboardData();
  }, []);
  var loadDashboardData = () =>
    __awaiter(this, void 0, void 0, function () {
      var err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([
                loadSuccessStats(),
                loadProviderStats(),
                loadTreatmentTypeStats(),
                loadComplianceStats(),
                loadTreatmentOutcomes(),
                loadSuccessMetrics(),
                loadProviderPerformance(),
                loadProtocolOptimizations(),
                loadQualityBenchmarks(),
                loadComplianceReports(),
              ]),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            err_1 = _a.sent();
            console.error("Error loading dashboard data:", err_1);
            setError("Erro ao carregar dados do dashboard");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadSuccessStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/stats/success-rate")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch success stats");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setSuccessStats(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_2 = _a.sent();
            console.error("Error loading success stats:", err_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadProviderStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/stats/provider-stats")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch provider stats");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProviderStats(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_3 = _a.sent();
            console.error("Error loading provider stats:", err_3);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadTreatmentTypeStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/stats/treatment-type")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch treatment type stats");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setTreatmentTypeStats(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_4 = _a.sent();
            console.error("Error loading treatment type stats:", err_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadComplianceStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/stats/compliance")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch compliance stats");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setComplianceStats(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_5 = _a.sent();
            console.error("Error loading compliance stats:", err_5);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadTreatmentOutcomes = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/outcomes?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch treatment outcomes");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setTreatmentOutcomes(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_6 = _a.sent();
            console.error("Error loading treatment outcomes:", err_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadSuccessMetrics = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/metrics?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch success metrics");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setSuccessMetrics(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_7 = _a.sent();
            console.error("Error loading success metrics:", err_7);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadProviderPerformance = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/provider-performance?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch provider performance");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProviderPerformance(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_8 = _a.sent();
            console.error("Error loading provider performance:", err_8);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadProtocolOptimizations = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_9;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/protocol-optimizations?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch protocol optimizations");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProtocolOptimizations(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_9 = _a.sent();
            console.error("Error loading protocol optimizations:", err_9);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadQualityBenchmarks = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_10;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/quality-benchmarks?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch quality benchmarks");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setQualityBenchmarks(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_10 = _a.sent();
            console.error("Error loading quality benchmarks:", err_10);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var loadComplianceReports = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_11;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/treatment-success/compliance-reports?limit=10")];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch compliance reports");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setComplianceReports(data.data);
            return [3 /*break*/, 4];
          case 3:
            err_11 = _a.sent();
            console.error("Error loading compliance reports:", err_11);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleCreateOutcome = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_12;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/treatment-success/outcomes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(outcomeForm),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to create outcome");
            setOutcomeForm({
              patient_id: "",
              treatment_type: "",
              provider_id: "",
              treatment_date: "",
              success_score: 0,
              patient_satisfaction_score: 0,
              complications: "",
              follow_up_notes: "",
              status: "completed",
            });
            return [4 /*yield*/, loadTreatmentOutcomes()];
          case 2:
            _a.sent();
            return [4 /*yield*/, loadSuccessStats()];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            err_12 = _a.sent();
            console.error("Error creating outcome:", err_12);
            setError("Erro ao criar resultado de tratamento");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var handleCreateOptimization = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_13;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/treatment-success/protocol-optimizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(optimizationForm),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to create optimization");
            setOptimizationForm({
              treatment_type: "",
              current_protocol: "",
              suggested_improvements: "",
              success_rate_improvement: 0,
              implementation_priority: "medium",
              rationale: "",
            });
            return [4 /*yield*/, loadProtocolOptimizations()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            err_13 = _a.sent();
            console.error("Error creating optimization:", err_13);
            setError("Erro ao criar otimização de protocolo");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleCreateBenchmark = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, err_14;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/treatment-success/quality-benchmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(benchmarkForm),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to create benchmark");
            setBenchmarkForm({
              treatment_type: "",
              target_success_rate: 0,
              minimum_satisfaction: 0,
              maximum_complication_rate: 0,
              industry_standard: 0,
              certification_requirement: "",
            });
            return [4 /*yield*/, loadQualityBenchmarks()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            err_14 = _a.sent();
            console.error("Error creating benchmark:", err_14);
            setError("Erro ao criar benchmark de qualidade");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var formatPercentage = (value) => "".concat((value * 100).toFixed(1), "%");
  var formatScore = (value) => value.toFixed(2);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando rastreamento de sucesso...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rastreamento de Sucesso de Tratamento</h1>
        <p className="text-gray-600">
          Monitore e otimize as taxas de sucesso dos tratamentos da clínica
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Taxa de Sucesso Geral
            </card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-green-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {successStats ? formatPercentage(successStats.overall_success_rate) : "0%"}
            </div>
            <p className="text-xs text-gray-600">
              {(successStats === null || successStats === void 0
                ? void 0
                : successStats.trend_direction) === "up"
                ? <span className="flex items-center text-green-600">
                    <lucide_react_1.TrendingUp className="h-3 w-3 mr-1" />
                    Em alta
                  </span>
                : <span className="flex items-center text-red-600">
                    <lucide_react_1.TrendingDown className="h-3 w-3 mr-1" />
                    Em baixa
                  </span>}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Total de Tratamentos
            </card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-blue-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(successStats === null || successStats === void 0
                ? void 0
                : successStats.total_treatments) || 0}
            </div>
            <p className="text-xs text-gray-600">
              Avaliação de satisfação:{" "}
              {successStats ? formatScore(successStats.average_satisfaction) : "0"}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Profissionais Ativos
            </card_1.CardTitle>
            <lucide_react_1.Award className="h-4 w-4 text-purple-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(providerStats === null || providerStats === void 0
                ? void 0
                : providerStats.total_providers) || 0}
            </div>
            <p className="text-xs text-gray-600">
              {(providerStats === null || providerStats === void 0
                ? void 0
                : providerStats.improvement_needed) || 0}{" "}
              precisam de melhoria
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Conformidade</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-orange-600" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {complianceStats ? formatPercentage(complianceStats.overall_compliance) : "0%"}
            </div>
            <p className="text-xs text-gray-600">
              {(complianceStats === null || complianceStats === void 0
                ? void 0
                : complianceStats.pending_reports) || 0}{" "}
              relatórios pendentes
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <tabs_1.TabsList className="grid grid-cols-7 w-full">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="outcomes">Resultados</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="metrics">Métricas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Otimização</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="benchmarks">Benchmarks</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="compliance">Conformidade</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success by Treatment Type */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Sucesso por Tipo de Tratamento</card_1.CardTitle>
                <card_1.CardDescription>
                  Taxa de sucesso e satisfação por categoria
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {treatmentTypeStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{stat.treatment_type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{formatPercentage(stat.success_rate)}</span>
                        <badge_1.Badge
                          variant={
                            stat.benchmark_status === "above"
                              ? "default"
                              : stat.benchmark_status === "at"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {stat.benchmark_status === "above"
                            ? "Acima"
                            : stat.benchmark_status === "at"
                              ? "No padrão"
                              : "Abaixo"}
                        </badge_1.Badge>
                      </div>
                    </div>
                    <progress_1.Progress value={stat.success_rate * 100} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {stat.total_treatments} tratamentos • Satisfação:{" "}
                      {formatScore(stat.satisfaction_score)}
                    </div>
                  </div>
                ))}
              </card_1.CardContent>
            </card_1.Card>

            {/* Recent Optimizations */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Otimizações Recentes</card_1.CardTitle>
                <card_1.CardDescription>
                  Melhorias nos protocolos de tratamento
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {protocolOptimizations.slice(0, 5).map((optimization) => (
                  <div key={optimization.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">{optimization.treatment_type}</h4>
                    <p className="text-sm text-gray-600">{optimization.suggested_improvements}</p>
                    <div className="flex items-center justify-between mt-2">
                      <badge_1.Badge
                        variant={
                          optimization.implementation_priority === "high"
                            ? "destructive"
                            : optimization.implementation_priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {optimization.implementation_priority === "high"
                          ? "Alta"
                          : optimization.implementation_priority === "medium"
                            ? "Média"
                            : "Baixa"}
                      </badge_1.Badge>
                      <span className="text-xs text-gray-500">
                        +{formatPercentage(optimization.success_rate_improvement)} sucesso
                      </span>
                    </div>
                  </div>
                ))}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="outcomes">
          <div className="space-y-6">
            {/* Create Outcome Form */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Registrar Resultado de Tratamento</card_1.CardTitle>
                <card_1.CardDescription>
                  Documente o resultado de um tratamento realizado
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="patient_id">ID do Paciente</label_1.Label>
                    <input_1.Input
                      id="patient_id"
                      value={outcomeForm.patient_id}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), { patient_id: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="treatment_type">Tipo de Tratamento</label_1.Label>
                    <input_1.Input
                      id="treatment_type"
                      value={outcomeForm.treatment_type}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), { treatment_type: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="provider_id">ID do Profissional</label_1.Label>
                    <input_1.Input
                      id="provider_id"
                      value={outcomeForm.provider_id}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), { provider_id: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="treatment_date">Data do Tratamento</label_1.Label>
                    <input_1.Input
                      id="treatment_date"
                      type="date"
                      value={outcomeForm.treatment_date}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), { treatment_date: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="success_score">Score de Sucesso (0-1)</label_1.Label>
                    <input_1.Input
                      id="success_score"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={outcomeForm.success_score}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), {
                            success_score: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="satisfaction_score">
                      Satisfação do Paciente (0-10)
                    </label_1.Label>
                    <input_1.Input
                      id="satisfaction_score"
                      type="number"
                      min="0"
                      max="10"
                      value={outcomeForm.patient_satisfaction_score}
                      onChange={(e) =>
                        setOutcomeForm(
                          __assign(__assign({}, outcomeForm), {
                            patient_satisfaction_score: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <label_1.Label htmlFor="complications">Complicações</label_1.Label>
                  <textarea_1.Textarea
                    id="complications"
                    value={outcomeForm.complications}
                    onChange={(e) =>
                      setOutcomeForm(
                        __assign(__assign({}, outcomeForm), { complications: e.target.value }),
                      )
                    }
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="follow_up_notes">Notas de Acompanhamento</label_1.Label>
                  <textarea_1.Textarea
                    id="follow_up_notes"
                    value={outcomeForm.follow_up_notes}
                    onChange={(e) =>
                      setOutcomeForm(
                        __assign(__assign({}, outcomeForm), { follow_up_notes: e.target.value }),
                      )
                    }
                  />
                </div>
                <button_1.Button onClick={handleCreateOutcome} className="w-full">
                  Registrar Resultado
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Outcomes List */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Resultados Recentes</card_1.CardTitle>
                <card_1.CardDescription>
                  Últimos resultados de tratamento registrados
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {treatmentOutcomes.map((outcome) => (
                    <div key={outcome.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{outcome.treatment_type}</h4>
                          <p className="text-sm text-gray-600">
                            Paciente: {outcome.patient_id} • Profissional: {outcome.provider_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Data: {new Date(outcome.treatment_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatPercentage(outcome.success_score || 0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Satisfação: {outcome.patient_satisfaction_score}/10
                          </div>
                          <badge_1.Badge
                            variant={outcome.status === "completed" ? "default" : "secondary"}
                          >
                            {outcome.status === "completed"
                              ? "Concluído"
                              : outcome.status === "in_progress"
                                ? "Em andamento"
                                : "Acompanhamento"}
                          </badge_1.Badge>
                        </div>
                      </div>
                      {outcome.complications && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Complicações:</strong> {outcome.complications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="metrics">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Métricas de Sucesso</card_1.CardTitle>
              <card_1.CardDescription>
                Análise de performance por período e tipo de tratamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {successMetrics.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{metric.treatment_type}</h4>
                        <p className="text-sm text-gray-600">
                          Período: {new Date(metric.period_start).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(metric.period_end).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {metric.total_treatments} tratamentos • {metric.successful_treatments}{" "}
                          sucessos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatPercentage(metric.success_rate)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Satisfação: {formatScore(metric.average_satisfaction || 0)}
                        </div>
                        <div className="text-sm text-red-600">
                          Complicações: {formatPercentage(metric.complication_rate || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="performance">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance dos Profissionais</card_1.CardTitle>
              <card_1.CardDescription>
                Avaliação de performance individual dos profissionais
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {providerPerformance.map((performance) => (
                  <div key={performance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Profissional: {performance.provider_id}</h4>
                        <p className="text-sm text-gray-600">
                          Período: {new Date(performance.period_start).toLocaleDateString("pt-BR")}{" "}
                          - {new Date(performance.period_end).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avaliação: {performance.evaluation_period}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPercentage(performance.overall_success_rate)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {formatScore(performance.performance_score || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="optimization">
          <div className="space-y-6">
            {/* Create Optimization Form */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Propor Otimização de Protocolo</card_1.CardTitle>
                <card_1.CardDescription>
                  Sugira melhorias nos protocolos de tratamento
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="opt_treatment_type">Tipo de Tratamento</label_1.Label>
                    <input_1.Input
                      id="opt_treatment_type"
                      value={optimizationForm.treatment_type}
                      onChange={(e) =>
                        setOptimizationForm(
                          __assign(__assign({}, optimizationForm), {
                            treatment_type: e.target.value,
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="implementation_priority">Prioridade</label_1.Label>
                    <select_1.Select
                      value={optimizationForm.implementation_priority}
                      onValueChange={(value) =>
                        setOptimizationForm(
                          __assign(__assign({}, optimizationForm), {
                            implementation_priority: value,
                          }),
                        )
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                        <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                        <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
                <div>
                  <label_1.Label htmlFor="current_protocol">Protocolo Atual</label_1.Label>
                  <textarea_1.Textarea
                    id="current_protocol"
                    value={optimizationForm.current_protocol}
                    onChange={(e) =>
                      setOptimizationForm(
                        __assign(__assign({}, optimizationForm), {
                          current_protocol: e.target.value,
                        }),
                      )
                    }
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="suggested_improvements">
                    Melhorias Sugeridas
                  </label_1.Label>
                  <textarea_1.Textarea
                    id="suggested_improvements"
                    value={optimizationForm.suggested_improvements}
                    onChange={(e) =>
                      setOptimizationForm(
                        __assign(__assign({}, optimizationForm), {
                          suggested_improvements: e.target.value,
                        }),
                      )
                    }
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="rationale">Justificativa</label_1.Label>
                  <textarea_1.Textarea
                    id="rationale"
                    value={optimizationForm.rationale}
                    onChange={(e) =>
                      setOptimizationForm(
                        __assign(__assign({}, optimizationForm), { rationale: e.target.value }),
                      )
                    }
                  />
                </div>
                <div>
                  <label_1.Label htmlFor="success_improvement">
                    Melhoria Esperada (0-1)
                  </label_1.Label>
                  <input_1.Input
                    id="success_improvement"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={optimizationForm.success_rate_improvement}
                    onChange={(e) =>
                      setOptimizationForm(
                        __assign(__assign({}, optimizationForm), {
                          success_rate_improvement: parseFloat(e.target.value),
                        }),
                      )
                    }
                  />
                </div>
                <button_1.Button onClick={handleCreateOptimization} className="w-full">
                  Propor Otimização
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Optimizations List */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Otimizações Propostas</card_1.CardTitle>
                <card_1.CardDescription>
                  Lista de melhorias de protocolo sugeridas
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {protocolOptimizations.map((optimization) => (
                    <div key={optimization.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{optimization.treatment_type}</h4>
                          <p className="text-sm text-gray-600">
                            {optimization.suggested_improvements}
                          </p>
                          {optimization.rationale && (
                            <p className="text-sm text-gray-500 mt-1">
                              <strong>Justificativa:</strong> {optimization.rationale}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <badge_1.Badge
                            variant={
                              optimization.implementation_priority === "high"
                                ? "destructive"
                                : optimization.implementation_priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {optimization.implementation_priority === "high"
                              ? "Alta"
                              : optimization.implementation_priority === "medium"
                                ? "Média"
                                : "Baixa"}
                          </badge_1.Badge>
                          <div className="text-sm text-green-600 mt-1">
                            +{formatPercentage(optimization.success_rate_improvement)}
                          </div>
                          <badge_1.Badge
                            variant={
                              optimization.approval_status === "approved"
                                ? "default"
                                : optimization.approval_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {optimization.approval_status === "pending"
                              ? "Pendente"
                              : optimization.approval_status === "approved"
                                ? "Aprovado"
                                : optimization.approval_status === "rejected"
                                  ? "Rejeitado"
                                  : "Implementado"}
                          </badge_1.Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="benchmarks">
          <div className="space-y-6">
            {/* Create Benchmark Form */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Definir Benchmark de Qualidade</card_1.CardTitle>
                <card_1.CardDescription>
                  Estabeleça padrões de qualidade para tipos de tratamento
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="bench_treatment_type">Tipo de Tratamento</label_1.Label>
                    <input_1.Input
                      id="bench_treatment_type"
                      value={benchmarkForm.treatment_type}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), { treatment_type: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="target_success_rate">
                      Meta de Sucesso (0-1)
                    </label_1.Label>
                    <input_1.Input
                      id="target_success_rate"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.target_success_rate}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), {
                            target_success_rate: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="minimum_satisfaction">
                      Satisfação Mínima (0-10)
                    </label_1.Label>
                    <input_1.Input
                      id="minimum_satisfaction"
                      type="number"
                      min="0"
                      max="10"
                      value={benchmarkForm.minimum_satisfaction}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), {
                            minimum_satisfaction: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="max_complication_rate">
                      Taxa Máx. Complicações (0-1)
                    </label_1.Label>
                    <input_1.Input
                      id="max_complication_rate"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.maximum_complication_rate}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), {
                            maximum_complication_rate: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="industry_standard">
                      Padrão da Indústria (0-1)
                    </label_1.Label>
                    <input_1.Input
                      id="industry_standard"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.industry_standard}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), {
                            industry_standard: parseFloat(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="certification_requirement">
                      Requisito de Certificação
                    </label_1.Label>
                    <input_1.Input
                      id="certification_requirement"
                      value={benchmarkForm.certification_requirement}
                      onChange={(e) =>
                        setBenchmarkForm(
                          __assign(__assign({}, benchmarkForm), {
                            certification_requirement: e.target.value,
                          }),
                        )
                      }
                    />
                  </div>
                </div>
                <button_1.Button onClick={handleCreateBenchmark} className="w-full">
                  Definir Benchmark
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Benchmarks List */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Benchmarks de Qualidade</card_1.CardTitle>
                <card_1.CardDescription>
                  Padrões de qualidade definidos por tipo de tratamento
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {qualityBenchmarks.map((benchmark) => (
                    <div key={benchmark.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{benchmark.treatment_type}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              Taxa de sucesso alvo:{" "}
                              {formatPercentage(benchmark.target_success_rate)}
                            </p>
                            <p>Satisfação mínima: {benchmark.minimum_satisfaction}/10</p>
                            <p>
                              Taxa máx. complicações:{" "}
                              {formatPercentage(benchmark.maximum_complication_rate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {formatPercentage(benchmark.industry_standard)}
                          </div>
                          <div className="text-xs text-gray-500">Padrão da indústria</div>
                          {benchmark.certification_requirement && (
                            <badge_1.Badge variant="outline" className="mt-1">
                              {benchmark.certification_requirement}
                            </badge_1.Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="compliance">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Relatórios de Conformidade</card_1.CardTitle>
              <card_1.CardDescription>
                Monitoramento de conformidade com padrões e regulamentações
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{report.report_type}</h4>
                        <p className="text-sm text-gray-600">
                          Período:{" "}
                          {new Date(report.reporting_period_start).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(report.reporting_period_end).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Criado em: {new Date(report.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {formatPercentage(report.compliance_score || 0)}
                        </div>
                        <badge_1.Badge
                          variant={
                            report.status === "finalized"
                              ? "default"
                              : report.status === "review"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {report.status === "draft"
                            ? "Rascunho"
                            : report.status === "review"
                              ? "Em revisão"
                              : "Finalizado"}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
