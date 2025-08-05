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
exports.default = LGPDTransparencyPortal;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var lgpd_1 = require("@/types/lgpd");
function LGPDTransparencyPortal(_a) {
  var _this = this;
  var userId = _a.userId,
    clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    consents = _b[0],
    setConsents = _b[1];
  var _c = (0, react_1.useState)([]),
    requests = _c[0],
    setRequests = _c[1];
  var _d = (0, react_1.useState)([]),
    reports = _d[0],
    setReports = _d[1];
  var _e = (0, react_1.useState)(null),
    config = _e[0],
    setConfig = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)("overview"),
    activeTab = _g[0],
    setActiveTab = _g[1];
  (0, react_1.useEffect)(
    function () {
      loadPortalData();
    },
    [userId, clinicId],
  );
  var loadPortalData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, consentsData, requestsData, reportsData, configData, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([
                fetchUserConsents(),
                fetchUserRequests(),
                fetchComplianceReports(),
                fetchLGPDConfig(),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (consentsData = _a[0]),
              (requestsData = _a[1]),
              (reportsData = _a[2]),
              (configData = _a[3]);
            setConsents(consentsData);
            setRequests(requestsData);
            setReports(reportsData);
            setConfig(configData);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _b.sent();
            console.error("Error loading portal data:", error_1);
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var fetchUserConsents = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar chamada à API
        return [2 /*return*/, []];
      });
    });
  };
  var fetchUserRequests = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar chamada à API
        return [2 /*return*/, []];
      });
    });
  };
  var fetchComplianceReports = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar chamada à API
        return [2 /*return*/, []];
      });
    });
  };
  var fetchLGPDConfig = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar chamada à API
        return [
          2 /*return*/,
          {
            clinicId: clinicId,
            dataRetentionPeriods: {},
            consentExpirationDays: 365,
            automaticAnonymization: true,
            auditLogRetentionDays: 2555, // 7 anos
            encryptionEnabled: true,
            dataProcessingPurposes: [],
            legalBases: [],
            thirdPartySharing: false,
            internationalTransfers: false,
            dpoContact: {
              name: "Data Protection Officer",
              email: "dpo@clinic.com",
              phone: "(11) 99999-9999",
            },
            lastUpdated: new Date(),
          },
        ];
      });
    });
  };
  var handleConsentAction = function (consentId, action) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Implementar ação de consentimento
            console.log("".concat(action, " consent:"), consentId);
            return [4 /*yield*/, loadPortalData()];
          case 1:
            _a.sent(); // Recarregar dados
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error handling consent action:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDataRequest = function (requestType) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Implementar solicitação de direito do titular
            console.log("Data request:", requestType);
            return [4 /*yield*/, loadPortalData()];
          case 1:
            _a.sent(); // Recarregar dados
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error handling data request:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var downloadData = function (format) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Implementar download de dados
          console.log("Download data:", format);
        } catch (error) {
          console.error("Error downloading data:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var getConsentStatusIcon = function (status) {
    switch (status) {
      case lgpd_1.ConsentStatus.GRANTED:
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case lgpd_1.ConsentStatus.WITHDRAWN:
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-500" />;
      case lgpd_1.ConsentStatus.EXPIRED:
        return <lucide_react_1.Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };
  var getRequestStatusBadge = function (status) {
    var _a;
    var variants =
      ((_a = {}),
      (_a[lgpd_1.RequestStatus.PENDING] = "secondary"),
      (_a[lgpd_1.RequestStatus.IN_PROGRESS] = "default"),
      (_a[lgpd_1.RequestStatus.COMPLETED] = "default"),
      (_a[lgpd_1.RequestStatus.REJECTED] = "destructive"),
      _a);
    return <badge_1.Badge variant={variants[status] || "secondary"}>{status}</badge_1.Badge>;
  };
  var calculateComplianceScore = function () {
    var activeConsents = consents.filter(function (c) {
      return c.status === lgpd_1.ConsentStatus.GRANTED;
    }).length;
    var totalConsents = consents.length;
    var completedRequests = requests.filter(function (r) {
      return r.status === lgpd_1.RequestStatus.COMPLETED;
    }).length;
    var totalRequests = requests.length;
    if (totalConsents === 0 && totalRequests === 0) return 100;
    var consentScore = totalConsents > 0 ? (activeConsents / totalConsents) * 50 : 50;
    var requestScore = totalRequests > 0 ? (completedRequests / totalRequests) * 50 : 50;
    return Math.round(consentScore + requestScore);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Transparência LGPD</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus dados pessoais e direitos de privacidade
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <lucide_react_1.Shield className="h-8 w-8 text-blue-600" />
          <badge_1.Badge variant="outline" className="text-sm">
            Compliance Score: {calculateComplianceScore()}%
          </badge_1.Badge>
        </div>
      </div>

      {/* Compliance Overview */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.BarChart3 className="h-5 w-5" />
            <span>Visão Geral de Compliance</span>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  consents.filter(function (c) {
                    return c.status === lgpd_1.ConsentStatus.GRANTED;
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600">Consentimentos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-sm text-gray-600">Solicitações Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reports.length}</div>
              <div className="text-sm text-gray-600">Relatórios Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {calculateComplianceScore()}%
              </div>
              <div className="text-sm text-gray-600">Score de Compliance</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Nível de Compliance</span>
              <span>{calculateComplianceScore()}%</span>
            </div>
            <progress_1.Progress value={calculateComplianceScore()} className="h-2" />
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="consents">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="requests">Meus Direitos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="data">Meus Dados</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.UserCheck className="h-5 w-5" />
                  <span>Status dos Consentimentos</span>
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {consents.slice(0, 3).map(function (consent) {
                    return (
                      <div key={consent.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getConsentStatusIcon(consent.status)}
                          <span className="text-sm">{consent.consentType}</span>
                        </div>
                        <badge_1.Badge variant="outline" className="text-xs">
                          {consent.status}
                        </badge_1.Badge>
                      </div>
                    );
                  })}
                </div>
                {consents.length > 3 && (
                  <button_1.Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={function () {
                      return setActiveTab("consents");
                    }}
                  >
                    Ver todos os consentimentos
                  </button_1.Button>
                )}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.FileText className="h-5 w-5" />
                  <span>Solicitações Recentes</span>
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 3).map(function (request) {
                    return (
                      <div key={request.id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{request.requestType}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {getRequestStatusBadge(request.status)}
                      </div>
                    );
                  })}
                </div>
                {requests.length > 3 && (
                  <button_1.Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={function () {
                      return setActiveTab("requests");
                    }}
                  >
                    Ver todas as solicitações
                  </button_1.Button>
                )}
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Quick Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie seus dados e direitos de privacidade
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button_1.Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={function () {
                    return handleDataRequest(lgpd_1.DataSubjectRight.ACCESS);
                  }}
                >
                  <lucide_react_1.Eye className="h-6 w-6" />
                  <span className="text-xs">Acessar Dados</span>
                </button_1.Button>
                <button_1.Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={function () {
                    return downloadData("json");
                  }}
                >
                  <lucide_react_1.Download className="h-6 w-6" />
                  <span className="text-xs">Baixar Dados</span>
                </button_1.Button>
                <button_1.Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={function () {
                    return handleDataRequest(lgpd_1.DataSubjectRight.RECTIFICATION);
                  }}
                >
                  <lucide_react_1.Edit className="h-6 w-6" />
                  <span className="text-xs">Corrigir Dados</span>
                </button_1.Button>
                <button_1.Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={function () {
                    return handleDataRequest(lgpd_1.DataSubjectRight.ERASURE);
                  }}
                >
                  <lucide_react_1.Trash2 className="h-6 w-6" />
                  <span className="text-xs">Excluir Dados</span>
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>{" "}
        {/* Consents Tab */}
        <tabs_1.TabsContent value="consents" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gerenciar Consentimentos</card_1.CardTitle>
              <card_1.CardDescription>
                Visualize e gerencie todos os seus consentimentos de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {consents.map(function (consent) {
                  return (
                    <div key={consent.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getConsentStatusIcon(consent.status)}
                          <h3 className="font-medium">{consent.consentType}</h3>
                        </div>
                        <badge_1.Badge variant="outline">{consent.status}</badge_1.Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{consent.purpose}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Concedido em:</span>
                          <div>{new Date(consent.grantedAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Expira em:</span>
                          <div>
                            {consent.expiresAt
                              ? new Date(consent.expiresAt).toLocaleDateString()
                              : "Nunca"}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {consent.status === lgpd_1.ConsentStatus.GRANTED
                          ? <button_1.Button
                              variant="destructive"
                              size="sm"
                              onClick={function () {
                                return handleConsentAction(consent.id, "withdraw");
                              }}
                            >
                              <lucide_react_1.XCircle className="h-4 w-4 mr-1" />
                              Retirar Consentimento
                            </button_1.Button>
                          : <button_1.Button
                              variant="default"
                              size="sm"
                              onClick={function () {
                                return handleConsentAction(consent.id, "grant");
                              }}
                            >
                              <lucide_react_1.CheckCircle className="h-4 w-4 mr-1" />
                              Conceder Consentimento
                            </button_1.Button>}
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Info className="h-4 w-4 mr-1" />
                          Detalhes
                        </button_1.Button>
                      </div>
                    </div>
                  );
                })}

                {consents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <lucide_react_1.UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum consentimento encontrado</p>
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
        {/* Data Subject Rights Tab */}
        <tabs_1.TabsContent value="requests" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Meus Direitos como Titular de Dados</card_1.CardTitle>
              <card_1.CardDescription>
                Exercite seus direitos garantidos pela LGPD
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Rights Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-lg flex items-center space-x-2">
                      <lucide_react_1.Eye className="h-5 w-5" />
                      <span>Direito de Acesso</span>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite acesso aos seus dados pessoais que processamos
                    </p>
                    <button_1.Button
                      onClick={function () {
                        return handleDataRequest(lgpd_1.DataSubjectRight.ACCESS);
                      }}
                      className="w-full"
                    >
                      Solicitar Acesso
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-lg flex items-center space-x-2">
                      <lucide_react_1.Download className="h-5 w-5" />
                      <span>Portabilidade</span>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Baixe seus dados em formato estruturado
                    </p>
                    <button_1.Button
                      onClick={function () {
                        return handleDataRequest(lgpd_1.DataSubjectRight.PORTABILITY);
                      }}
                      className="w-full"
                    >
                      Solicitar Portabilidade
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-lg flex items-center space-x-2">
                      <lucide_react_1.Edit className="h-5 w-5" />
                      <span>Retificação</span>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite correção de dados incorretos ou incompletos
                    </p>
                    <button_1.Button
                      onClick={function () {
                        return handleDataRequest(lgpd_1.DataSubjectRight.RECTIFICATION);
                      }}
                      className="w-full"
                    >
                      Solicitar Correção
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-lg flex items-center space-x-2">
                      <lucide_react_1.Trash2 className="h-5 w-5" />
                      <span>Eliminação</span>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite a exclusão dos seus dados pessoais
                    </p>
                    <button_1.Button
                      onClick={function () {
                        return handleDataRequest(lgpd_1.DataSubjectRight.ERASURE);
                      }}
                      variant="destructive"
                      className="w-full"
                    >
                      Solicitar Exclusão
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              {/* Request History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Histórico de Solicitações</h3>
                <div className="space-y-3">
                  {requests.map(function (request) {
                    return (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{request.requestType}</h4>
                          {getRequestStatusBadge(request.status)}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Solicitado em:</span>
                            <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="font-medium">Prazo:</span>
                            <div>{new Date(request.dueDate).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {request.response && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <span className="font-medium text-sm">Resposta:</span>
                            <p className="text-sm mt-1">{request.response}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {requests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma solicitação encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
        {/* My Data Tab */}
        <tabs_1.TabsContent value="data" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Meus Dados Pessoais</card_1.CardTitle>
              <card_1.CardDescription>
                Visualize e gerencie seus dados pessoais armazenados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Data Categories */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
                      <lucide_react_1.Database className="h-5 w-5" />
                      <span>Dados de Identificação</span>
                    </h3>
                    <badge_1.Badge variant="outline">Criptografado</badge_1.Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Nome, CPF, RG, Data de nascimento</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Identificação e cadastro</div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Download className="h-4 w-4 mr-1" />
                      Exportar
                    </button_1.Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
                      <lucide_react_1.Database className="h-5 w-5" />
                      <span>Dados de Contato</span>
                    </h3>
                    <badge_1.Badge variant="outline">Criptografado</badge_1.Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Email, Telefone, Endereço</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Comunicação e localização</div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Download className="h-4 w-4 mr-1" />
                      Exportar
                    </button_1.Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
                      <lucide_react_1.Database className="h-5 w-5" />
                      <span>Dados Médicos</span>
                    </h3>
                    <badge_1.Badge variant="outline">Altamente Sensível</badge_1.Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Histórico médico, Exames, Prescrições</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Prestação de cuidados médicos</div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Download className="h-4 w-4 mr-1" />
                      Exportar
                    </button_1.Button>
                  </div>
                </div>
              </div>

              {/* Data Export Options */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3">Exportar Todos os Dados</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Baixe todos os seus dados pessoais em formato estruturado
                </p>
                <div className="flex space-x-2">
                  <button_1.Button
                    onClick={function () {
                      return downloadData("json");
                    }}
                  >
                    <lucide_react_1.Download className="h-4 w-4 mr-1" />
                    JSON
                  </button_1.Button>
                  <button_1.Button
                    onClick={function () {
                      return downloadData("csv");
                    }}
                    variant="outline"
                  >
                    <lucide_react_1.Download className="h-4 w-4 mr-1" />
                    CSV
                  </button_1.Button>
                  <button_1.Button
                    onClick={function () {
                      return downloadData("pdf");
                    }}
                    variant="outline"
                  >
                    <lucide_react_1.Download className="h-4 w-4 mr-1" />
                    PDF
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
        {/* Reports Tab */}
        <tabs_1.TabsContent value="reports" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Relatórios de Transparência</card_1.CardTitle>
              <card_1.CardDescription>
                Acesse relatórios sobre o processamento dos seus dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {reports.map(function (report) {
                  return (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{report.title}</h3>
                        <badge_1.Badge variant="outline">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </badge_1.Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Período:</span>
                          <div>
                            {new Date(report.period.startDate).toLocaleDateString()} -
                            {new Date(report.period.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span>
                          <div>{report.reportType}</div>
                        </div>
                      </div>

                      <button_1.Button size="sm" variant="outline">
                        <lucide_react_1.Download className="h-4 w-4 mr-1" />
                        Baixar Relatório
                      </button_1.Button>
                    </div>
                  );
                })}

                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório disponível</p>
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Footer with DPO Contact */}
      {(config === null || config === void 0 ? void 0 : config.dpoContact) && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Shield className="h-5 w-5" />
              <span>Contato do Encarregado de Dados (DPO)</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Nome:</span>
                <div>{config.dpoContact.name}</div>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <div>{config.dpoContact.email}</div>
              </div>
              <div>
                <span className="font-medium">Telefone:</span>
                <div>{config.dpoContact.phone}</div>
              </div>
            </div>
            <alert_1.Alert className="mt-4">
              <lucide_react_1.Info className="h-4 w-4" />
              <alert_1.AlertDescription>
                Para dúvidas sobre privacidade e proteção de dados, entre em contato com nosso DPO.
                Responderemos em até 15 dias úteis conforme estabelecido pela LGPD.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
