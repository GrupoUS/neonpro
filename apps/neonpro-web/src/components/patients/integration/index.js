"use client";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemIntegration = SystemIntegration;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var advanced_search_1 = require("./advanced-search");
var quick_access_1 = require("./quick-access");
var sonner_1 = require("sonner");
function SystemIntegration(_a) {
  var onPatientSelect = _a.onPatientSelect,
    _b = _a.userRole,
    userRole = _b === void 0 ? "staff" : _b;
  var _c = (0, react_1.useState)("quick-access"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)(null),
    stats = _d[0],
    setStats = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoadingStats = _e[0],
    setIsLoadingStats = _e[1];
  var _f = (0, react_1.useState)([]),
    selectedPatients = _f[0],
    setSelectedPatients = _f[1];
  var _g = (0, react_1.useState)(false),
    showSegmentDialog = _g[0],
    setShowSegmentDialog = _g[1];
  var _h = (0, react_1.useState)(""),
    segmentName = _h[0],
    setSegmentName = _h[1];
  var _j = (0, react_1.useState)(""),
    segmentDescription = _j[0],
    setSegmentDescription = _j[1];
  // Load system statistics
  var loadSystemStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var mockStats;
      return __generator(this, (_a) => {
        setIsLoadingStats(true);
        try {
          mockStats = {
            totalPatients: 1247,
            searchesPerformed: 3456,
            averageSearchTime: 245,
            favoritePatients: 89,
            highRiskPatients: 23,
            pendingVerifications: 12,
            upcomingAppointments: 156,
            systemPerformance: {
              responseTime: 180,
              uptime: 99.8,
              accuracy: 97.5,
            },
          };
          setStats(mockStats);
        } catch (error) {
          console.error("Error loading system stats:", error);
          sonner_1.toast.error("Erro ao carregar estatísticas do sistema");
        } finally {
          setIsLoadingStats(false);
        }
        return [2 /*return*/];
      });
    });
  // Create patient segment
  var createPatientSegment = (patients) =>
    __awaiter(this, void 0, void 0, function () {
      var criteria, response, result, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!segmentName.trim() || !segmentDescription.trim()) {
              sonner_1.toast.error("Nome e descrição são obrigatórios");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            criteria = {
              patientIds: patients.map((p) => p.id),
              filters: {
                // Extract common characteristics
                riskLevels: __spreadArray([], new Set(patients.map((p) => p.riskLevel)), true),
                treatmentTypes: __spreadArray(
                  [],
                  new Set(patients.map((p) => p.treatmentType)),
                  true,
                ),
                ageRange: {
                  min: Math.min.apply(
                    Math,
                    patients.map((p) => p.age),
                  ),
                  max: Math.max.apply(
                    Math,
                    patients.map((p) => p.age),
                  ),
                },
              },
            };
            return [
              4 /*yield*/,
              fetch("/api/patients/integration/search", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: segmentName,
                  description: segmentDescription,
                  criteria: criteria,
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            result = _a.sent();
            if (result.success) {
              sonner_1.toast.success(
                'Segmento "'
                  .concat(segmentName, '" criado com ')
                  .concat(patients.length, " pacientes"),
              );
              setShowSegmentDialog(false);
              setSegmentName("");
              setSegmentDescription("");
              setSelectedPatients([]);
            } else {
              sonner_1.toast.error(result.error || "Erro ao criar segmento");
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error creating segment:", error_1);
            sonner_1.toast.error("Erro ao criar segmento de pacientes");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Handle patient selection for segment creation
  var handleCreateSegment = (patients) => {
    setSelectedPatients(patients);
    setShowSegmentDialog(true);
  };
  (0, react_1.useEffect)(() => {
    loadSystemStats();
  }, []);
  var formatNumber = (num) => new Intl.NumberFormat("pt-BR").format(num);
  var getPerformanceColor = (value, threshold) => {
    if (value >= threshold.good) return "text-green-600";
    if (value >= threshold.warning) return "text-yellow-600";
    return "text-red-600";
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <lucide_react_1.Zap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Sistema de Integração</h1>
        </div>
        <badge_1.Badge variant="outline" className="text-sm">
          Versão 2.0 • Integração Completa
        </badge_1.Badge>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Pacientes</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats
                ? "..."
                : formatNumber(
                    (stats === null || stats === void 0 ? void 0 : stats.totalPatients) || 0,
                  )}
            </div>
            <p className="text-xs text-muted-foreground">Sistema integrado completo</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Buscas Realizadas</card_1.CardTitle>
            <lucide_react_1.Search className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats
                ? "..."
                : formatNumber(
                    (stats === null || stats === void 0 ? void 0 : stats.searchesPerformed) || 0,
                  )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio:{" "}
              {(stats === null || stats === void 0 ? void 0 : stats.averageSearchTime) || 0}ms
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alto Risco</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoadingStats
                ? "..."
                : formatNumber(
                    (stats === null || stats === void 0 ? void 0 : stats.highRiskPatients) || 0,
                  )}
            </div>
            <p className="text-xs text-muted-foreground">Requer atenção especial</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Performance</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              <span
                className={getPerformanceColor(
                  (stats === null || stats === void 0 ? void 0 : stats.systemPerformance.uptime) ||
                    0,
                  { good: 99, warning: 95 },
                )}
              >
                {(stats === null || stats === void 0 ? void 0 : stats.systemPerformance.uptime) ||
                  0}
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Uptime do sistema</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-base">Métricas de Performance</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <span
                    className={getPerformanceColor(stats.systemPerformance.responseTime, {
                      good: 200,
                      warning: 500,
                    })}
                  >
                    {stats.systemPerformance.responseTime}ms
                  </span>
                </div>
                <p className="text-sm text-gray-500">Tempo de Resposta</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  <span
                    className={getPerformanceColor(stats.systemPerformance.accuracy, {
                      good: 95,
                      warning: 90,
                    })}
                  >
                    {stats.systemPerformance.accuracy}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">Precisão da Busca</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.favoritePatients)}
                </div>
                <p className="text-sm text-gray-500">Pacientes Favoritos</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Main Integration Interface */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.Search className="h-5 w-5" />
            <span>Interface de Integração</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-2">
              <tabs_1.TabsTrigger value="quick-access" className="flex items-center space-x-2">
                <lucide_react_1.Star className="h-4 w-4" />
                <span>Acesso Rápido</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="advanced-search" className="flex items-center space-x-2">
                <lucide_react_1.Search className="h-4 w-4" />
                <span>Busca Avançada</span>
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="quick-access" className="mt-6">
              <quick_access_1.QuickAccess onPatientSelect={onPatientSelect} />
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="advanced-search" className="mt-6">
              <advanced_search_1.AdvancedSearch
                onPatientSelect={onPatientSelect}
                onCreateSegment={userRole !== "staff" ? handleCreateSegment : undefined}
              />
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>

      {/* Segment Creation Dialog */}
      {showSegmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <card_1.Card className="w-full max-w-md mx-4">
            <card_1.CardHeader>
              <card_1.CardTitle>Criar Segmento de Pacientes</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Segmento</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Pacientes Alto Risco Cardíaco"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Descreva os critérios e objetivo deste segmento..."
                  rows={3}
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-500">
                <strong>{selectedPatients.length}</strong> pacientes selecionados
              </div>

              <div className="flex space-x-2">
                <button_1.Button
                  variant="outline"
                  onClick={() => {
                    setShowSegmentDialog(false);
                    setSegmentName("");
                    setSegmentDescription("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button
                  onClick={() => createPatientSegment(selectedPatients)}
                  className="flex-1"
                  disabled={!segmentName.trim() || !segmentDescription.trim()}
                >
                  Criar Segmento
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-blue-600">
            {formatNumber(
              (stats === null || stats === void 0 ? void 0 : stats.pendingVerifications) || 0,
            )}
          </div>
          <div className="text-xs text-gray-500">Verificações Pendentes</div>
        </div>

        <div>
          <div className="text-lg font-semibold text-green-600">
            {formatNumber(
              (stats === null || stats === void 0 ? void 0 : stats.upcomingAppointments) || 0,
            )}
          </div>
          <div className="text-xs text-gray-500">Próximas Consultas</div>
        </div>

        <div>
          <div className="text-lg font-semibold text-purple-600">
            {formatNumber(
              (stats === null || stats === void 0 ? void 0 : stats.favoritePatients) || 0,
            )}
          </div>
          <div className="text-xs text-gray-500">Favoritos</div>
        </div>

        <div>
          <div className="text-lg font-semibold text-orange-600">
            {(stats === null || stats === void 0 ? void 0 : stats.averageSearchTime) || 0}ms
          </div>
          <div className="text-xs text-gray-500">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
}
