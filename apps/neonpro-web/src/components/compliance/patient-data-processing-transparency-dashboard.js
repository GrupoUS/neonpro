// 🔍 Patient Data Processing Transparency Dashboard Component
// NeonPro - Sistema de Automação de Compliance LGPD - Phase 3 Task 3.2
// Quality Standard: ≥9.5/10 (BMad Enhanced)
"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientDataProcessingTransparencyDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function PatientDataProcessingTransparencyDashboard(_a) {
  var _this = this;
  var patientId = _a.patientId,
    _b = _a.viewMode,
    viewMode = _b === void 0 ? "patient" : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c;
  var _d = (0, react_1.useState)(null),
    dashboardData = _d[0],
    setDashboardData = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)("overview"),
    activeTab = _f[0],
    setActiveTab = _f[1];
  var _g = (0, react_1.useState)(false),
    refreshing = _g[0],
    setRefreshing = _g[1];
  // Load dashboard data
  (0, react_1.useEffect)(
    function () {
      loadTransparencyData();
    },
    [patientId],
  );
  var loadTransparencyData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockData;
      return __generator(this, function (_a) {
        try {
          setLoading(true);
          mockData = {
            patientId: patientId,
            patientName: "Maria Silva Santos",
            lastUpdated: new Date(),
            overallTransparencyScore: 9.2,
            processingActivities: [
              {
                purpose: "medical_care",
                description: "Cuidados médicos e procedimentos estéticos",
                legalBasis: "Interesses vitais - Cuidados de saúde",
                dataCategories: ["dados pessoais", "dados médicos", "dados sensíveis"],
                frequency: "Conforme necessário",
                lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                canOptOut: false,
                riskLevel: "low",
                complianceScore: 9.5,
              },
              {
                purpose: "appointment_scheduling",
                description: "Agendamento e gestão de consultas",
                legalBasis: "Execução de contrato",
                dataCategories: ["dados pessoais", "dados de contato"],
                frequency: "Semanal",
                lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                canOptOut: false,
                riskLevel: "low",
                complianceScore: 9.8,
              },
              {
                purpose: "marketing",
                description: "Comunicações promocionais personalizadas",
                legalBasis: "Consentimento",
                dataCategories: ["dados pessoais", "preferências"],
                frequency: "Mensal",
                lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                canOptOut: true,
                riskLevel: "medium",
                complianceScore: 8.5,
              },
            ],
            thirdPartySharing: [
              {
                recipient: "Laboratório Alpha",
                recipientType: "processor",
                purpose: "Análises clínicas e exames",
                dataShared: ["dados pessoais", "resultados de exames"],
                safeguards: ["Contrato de processamento", "Criptografia", "Acesso restrito"],
                location: "Brasil",
                canOptOut: false,
                sharingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: "active",
              },
              {
                recipient: "Plano de Saúde Beta",
                recipientType: "controller",
                purpose: "Autorização e reembolso de procedimentos",
                dataShared: ["dados pessoais", "dados financeiros", "relatórios médicos"],
                safeguards: ["Acordo de confidencialidade", "Portal seguro", "Auditoria regular"],
                location: "Brasil",
                canOptOut: false,
                sharingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                status: "active",
              },
            ],
            dataFlows: {
              internal: [
                {
                  system: "Sistema de Prontuário Eletrônico",
                  purpose: "Gestão de histórico médico",
                  dataTypes: ["dados médicos", "resultados de exames", "prescrições"],
                  frequency: "Diário",
                  encryption: true,
                  lastAccess: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
                {
                  system: "Sistema de Agendamento",
                  purpose: "Gestão de consultas",
                  dataTypes: ["dados pessoais", "dados de contato", "preferências"],
                  frequency: "Conforme necessário",
                  encryption: true,
                  lastAccess: new Date(Date.now() - 3 * 60 * 60 * 1000),
                },
              ],
              external: [
                {
                  system: "Gateway de Pagamento",
                  purpose: "Processamento de pagamentos",
                  dataTypes: ["dados financeiros", "dados de transação"],
                  frequency: "Por transação",
                  encryption: true,
                  lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              ],
            },
            rights: {
              access: {
                available: true,
                lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                description: "Solicitar cópia de todos os seus dados pessoais",
              },
              correction: {
                available: true,
                description: "Corrigir ou atualizar dados pessoais incorretos",
              },
              deletion: {
                available: true,
                description: "Solicitar exclusão de dados pessoais (sujeito a restrições legais)",
              },
              portability: {
                available: true,
                description: "Receber seus dados em formato estruturado",
              },
              objection: {
                available: true,
                description: "Contestar o processamento de dados para marketing",
              },
            },
            recentActivities: [
              {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                action: "data_access",
                description: "Acesso ao prontuário médico para consulta",
                complianceStatus: "compliant",
              },
              {
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                action: "appointment_update",
                description: "Atualização de dados de agendamento",
                complianceStatus: "compliant",
              },
              {
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                action: "consent_renewal",
                description: "Renovação de consentimento para marketing",
                complianceStatus: "compliant",
              },
            ],
            privacySettings: {
              marketingConsent: true,
              analyticsConsent: false,
              thirdPartySharing: true,
              researchParticipation: false,
            },
          };
          setDashboardData(mockData);
        } catch (error) {
          console.error("Error loading transparency data:", error);
          sonner_1.toast.error("Erro ao carregar dados de transparência");
        } finally {
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var refreshData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setRefreshing(true);
            return [4 /*yield*/, loadTransparencyData()];
          case 1:
            _a.sent();
            setRefreshing(false);
            sonner_1.toast.success("Dados atualizados com sucesso");
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRightExercise = function (rightType) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // In production, this would call the privacy rights manager
          sonner_1.toast.success(
            "Solicita\u00E7\u00E3o de ".concat(rightType, " enviada com sucesso"),
          );
        } catch (error) {
          sonner_1.toast.error("Erro ao processar solicitação");
        }
        return [2 /*return*/];
      });
    });
  };
  var exportTransparencyReport = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // In production, this would generate a comprehensive transparency report
          sonner_1.toast.success("Relatório de transparência gerado com sucesso");
        } catch (error) {
          sonner_1.toast.error("Erro ao gerar relatório");
        }
        return [2 /*return*/];
      });
    });
  };
  var getScoreColor = function (score) {
    if (score >= 9) return "text-green-600";
    if (score >= 7) return "text-yellow-600";
    return "text-red-600";
  };
  var getScoreBadgeVariant = function (score) {
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  };
  var getRiskLevelColor = function (level) {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  var getComplianceStatusIcon = function (status) {
    switch (status) {
      case "compliant":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "violation":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <lucide_react_1.Info className="h-4 w-4 text-gray-600" />;
    }
  };
  if (loading) {
    return (
      <div className={"space-y-4 ".concat(className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }
  if (!dashboardData) {
    return (
      <alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Não foi possível carregar os dados de transparência. Tente novamente.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header with Overall Score */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <lucide_react_1.Eye className="h-6 w-6" />
            Transparência de Dados
            {viewMode === "admin" && (
              <badge_1.Badge variant="outline">Visão Administrativa</badge_1.Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Última atualização:{" "}
            {(0, date_fns_1.format)(dashboardData.lastUpdated, "dd/MM/yyyy 'às' HH:mm", {
              locale: locale_1.ptBR,
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">Score de Transparência</div>
            <div
              className={"text-2xl font-bold ".concat(
                getScoreColor(dashboardData.overallTransparencyScore),
              )}
            >
              {dashboardData.overallTransparencyScore}/10
            </div>
          </div>
          <div className="flex gap-2">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              {refreshing
                ? <lucide_react_1.Clock className="h-4 w-4" />
                : <lucide_react_1.Activity className="h-4 w-4" />}
              Atualizar
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" onClick={exportTransparencyReport}>
              <lucide_react_1.Download className="h-4 w-4" />
              Exportar Relatório
            </button_1.Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="processing">Processamento</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="sharing">Compartilhamento</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rights">Direitos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="activities">Atividades</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Atividades de Processamento
                </card_1.CardTitle>
                <lucide_react_1.Database className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.processingActivities.length}
                </div>
                <p className="text-xs text-muted-foreground">ativas no sistema</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Compartilhamentos Externos
                </card_1.CardTitle>
                <lucide_react_1.Share2 className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{dashboardData.thirdPartySharing.length}</div>
                <p className="text-xs text-muted-foreground">parceiros ativos</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Fluxos de Dados</card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.dataFlows.internal.length +
                    dashboardData.dataFlows.external.length}
                </div>
                <p className="text-xs text-muted-foreground">sistemas integrados</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Compliance Score
                </card_1.CardTitle>
                <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div
                  className={"text-2xl font-bold ".concat(
                    getScoreColor(dashboardData.overallTransparencyScore),
                  )}
                >
                  {dashboardData.overallTransparencyScore}/10
                </div>
                <p className="text-xs text-muted-foreground">transparência geral</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Recent Activities Summary */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5" />
                Atividades Recentes
              </card_1.CardTitle>
              <card_1.CardDescription>
                Últimas ações relacionadas aos seus dados pessoais
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivities.slice(0, 5).map(function (activity, index) {
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getComplianceStatusIcon(activity.complianceStatus)}
                        <div>
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {(0, date_fns_1.format)(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", {
                              locale: locale_1.ptBR,
                            })}
                          </div>
                        </div>
                      </div>
                      <badge_1.Badge
                        variant={
                          activity.complianceStatus === "compliant" ? "default" : "secondary"
                        }
                      >
                        {activity.complianceStatus === "compliant" ? "Conforme" : "Atenção"}
                      </badge_1.Badge>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Processing Activities Tab */}
        <tabs_1.TabsContent value="processing" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Database className="h-5 w-5" />
                Atividades de Processamento de Dados
              </card_1.CardTitle>
              <card_1.CardDescription>
                Finalidades e bases legais para o processamento dos seus dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {dashboardData.processingActivities.map(function (activity, index) {
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{activity.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Base legal: {activity.legalBasis}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge
                            variant={getScoreBadgeVariant(activity.complianceScore)}
                            className={getRiskLevelColor(activity.riskLevel)}
                          >
                            {activity.riskLevel === "low"
                              ? "Baixo Risco"
                              : activity.riskLevel === "medium"
                                ? "Médio Risco"
                                : "Alto Risco"}
                          </badge_1.Badge>
                          <badge_1.Badge variant="outline">
                            Score: {activity.complianceScore}/10
                          </badge_1.Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Categorias de dados:</span>
                          <div className="text-muted-foreground">
                            {activity.dataCategories.join(", ")}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Frequência:</span>
                          <div className="text-muted-foreground">{activity.frequency}</div>
                        </div>
                        <div>
                          <span className="font-medium">Última atividade:</span>
                          <div className="text-muted-foreground">
                            {(0, date_fns_1.format)(activity.lastActivity, "dd/MM/yyyy", {
                              locale: locale_1.ptBR,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Pode recusar:</span>
                          <badge_1.Badge variant={activity.canOptOut ? "default" : "secondary"}>
                            {activity.canOptOut ? "Sim" : "Não"}
                          </badge_1.Badge>
                        </div>
                      </div>

                      {activity.canOptOut && (
                        <div className="pt-2 border-t">
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return handleRightExercise("objection");
                            }}
                          >
                            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                            Gerenciar Consentimento
                          </button_1.Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Third-Party Sharing Tab */}
        <tabs_1.TabsContent value="sharing" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Share2 className="h-5 w-5" />
                Compartilhamento com Terceiros
              </card_1.CardTitle>
              <card_1.CardDescription>
                Parceiros e prestadores de serviços que têm acesso aos seus dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {dashboardData.thirdPartySharing.map(function (sharing, index) {
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium flex items-center gap-2">
                            {sharing.recipient}
                            <lucide_react_1.Globe className="h-4 w-4 text-muted-foreground" />
                          </h4>
                          <p className="text-sm text-muted-foreground">{sharing.purpose}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge
                            variant={sharing.status === "active" ? "default" : "secondary"}
                          >
                            {sharing.status === "active" ? "Ativo" : "Inativo"}
                          </badge_1.Badge>
                          <badge_1.Badge variant="outline">
                            {sharing.recipientType === "processor" ? "Processador" : "Controlador"}
                          </badge_1.Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Dados compartilhados:</span>
                          <div className="text-muted-foreground">
                            {sharing.dataShared.join(", ")}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Localização:</span>
                          <div className="text-muted-foreground">{sharing.location}</div>
                        </div>
                        <div>
                          <span className="font-medium">Data do compartilhamento:</span>
                          <div className="text-muted-foreground">
                            {(0, date_fns_1.format)(sharing.sharingDate, "dd/MM/yyyy", {
                              locale: locale_1.ptBR,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Pode recusar:</span>
                          <badge_1.Badge variant={sharing.canOptOut ? "default" : "secondary"}>
                            {sharing.canOptOut ? "Sim" : "Não"}
                          </badge_1.Badge>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm">Salvaguardas implementadas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sharing.safeguards.map(function (safeguard, i) {
                            return (
                              <badge_1.Badge key={i} variant="outline" className="text-xs">
                                <lucide_react_1.Lock className="h-3 w-3 mr-1" />
                                {safeguard}
                              </badge_1.Badge>
                            );
                          })}
                        </div>
                      </div>

                      {sharing.canOptOut && (
                        <div className="pt-2 border-t">
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return handleRightExercise("objection");
                            }}
                          >
                            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                            Recusar Compartilhamento
                          </button_1.Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Patient Rights Tab */}
        <tabs_1.TabsContent value="rights" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Shield className="h-5 w-5" />
                Seus Direitos de Privacidade
              </card_1.CardTitle>
              <card_1.CardDescription>
                Exercite seus direitos de proteção de dados pessoais
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(dashboardData.rights).map(function (_a) {
                  var rightKey = _a[0],
                    right = _a[1];
                  return (
                    <div key={rightKey} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">
                          {rightKey === "access"
                            ? "Acesso aos Dados"
                            : rightKey === "correction"
                              ? "Correção"
                              : rightKey === "deletion"
                                ? "Exclusão"
                                : rightKey === "portability"
                                  ? "Portabilidade"
                                  : "Objeção"}
                        </h4>
                        <badge_1.Badge variant={right.available ? "default" : "secondary"}>
                          {right.available ? "Disponível" : "Indisponível"}
                        </badge_1.Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{right.description}</p>

                      {right.lastUsed && (
                        <p className="text-xs text-muted-foreground">
                          Último uso:{" "}
                          {(0, date_fns_1.format)(right.lastUsed, "dd/MM/yyyy", {
                            locale: locale_1.ptBR,
                          })}
                        </p>
                      )}

                      {right.available && (
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={function () {
                            return handleRightExercise(rightKey);
                          }}
                          className="w-full"
                        >
                          <lucide_react_1.User className="h-4 w-4 mr-2" />
                          Exercer Direito
                        </button_1.Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Privacy Settings */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                Configurações de Privacidade
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardData.privacySettings).map(function (_a) {
                  var setting = _a[0],
                    enabled = _a[1];
                  return (
                    <div key={setting} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {setting === "marketingConsent"
                            ? "Marketing e Promoções"
                            : setting === "analyticsConsent"
                              ? "Análises e Estatísticas"
                              : setting === "thirdPartySharing"
                                ? "Compartilhamento com Terceiros"
                                : "Participação em Pesquisas"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {setting === "marketingConsent"
                            ? "Receber comunicações promocionais"
                            : setting === "analyticsConsent"
                              ? "Permitir análise de uso do sistema"
                              : setting === "thirdPartySharing"
                                ? "Compartilhar dados com parceiros"
                                : "Participar de estudos clínicos"}
                        </div>
                      </div>
                      <badge_1.Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Activities Tab */}
        <tabs_1.TabsContent value="activities" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Activity className="h-5 w-5" />
                Log de Atividades Detalhado
              </card_1.CardTitle>
              <card_1.CardDescription>
                Histórico completo de acesso e processamento dos seus dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivities.map(function (activity, index) {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getComplianceStatusIcon(activity.complianceStatus)}
                        <div>
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {(0, date_fns_1.format)(
                              activity.timestamp,
                              "dd/MM/yyyy 'às' HH:mm:ss",
                              { locale: locale_1.ptBR },
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <badge_1.Badge
                          variant={
                            activity.complianceStatus === "compliant" ? "default" : "secondary"
                          }
                        >
                          {activity.complianceStatus === "compliant" ? "Conforme" : "Atenção"}
                        </badge_1.Badge>
                        {viewMode === "admin" && (
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.ExternalLink className="h-4 w-4" />
                          </button_1.Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
