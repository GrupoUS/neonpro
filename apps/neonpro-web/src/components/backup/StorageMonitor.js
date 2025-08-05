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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var StorageMonitor = function () {
  var _a = (0, react_1.useState)([]),
    providers = _a[0],
    setProviders = _a[1];
  var _b = (0, react_1.useState)(null),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)(null),
    health = _c[0],
    setHealth = _c[1];
  var _d = (0, react_1.useState)([]),
    distribution = _d[0],
    setDistribution = _d[1];
  var _e = (0, react_1.useState)(""),
    selectedProvider = _e[0],
    setSelectedProvider = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(false),
    refreshing = _g[0],
    setRefreshing = _g[1];
  (0, react_1.useEffect)(function () {
    loadStorageData();
  }, []);
  var loadStorageData = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([loadProviders(), loadMetrics(), loadHealth(), loadDistribution()]),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao carregar dados de armazenamento:", error_1);
            sonner_1.toast.error("Erro ao carregar dados de armazenamento");
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
  var loadProviders = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/backup/storage/providers")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProviders(data.data || []);
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadMetrics = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/backup/metrics/storage")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setMetrics(data.data);
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadHealth = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/backup/storage/health")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setHealth(data.data);
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadDistribution = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, fetch("/api/backup/metrics/distribution")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setDistribution(data.data || []);
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRefresh = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setRefreshing(true);
            return [4 /*yield*/, loadStorageData()];
          case 1:
            _a.sent();
            setRefreshing(false);
            sonner_1.toast.success("Dados atualizados com sucesso");
            return [2 /*return*/];
        }
      });
    });
  };
  var handleTestConnection = function (providerId) {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/backup/storage/providers/".concat(providerId, "/test"), {
                method: "POST",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              sonner_1.toast.success("Conexão testada com sucesso");
              loadProviders();
            } else {
              sonner_1.toast.error("Falha no teste de conexão");
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao testar conexão:", error_2);
            sonner_1.toast.error("Erro ao testar conexão");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getProviderIcon = function (type) {
    switch (type) {
      case "LOCAL":
        return <lucide_react_1.HardDrive className="h-5 w-5" />;
      case "S3":
      case "AZURE":
      case "GCS":
        return <lucide_react_1.Cloud className="h-5 w-5" />;
      case "FTP":
        return <lucide_react_1.Database className="h-5 w-5" />;
      default:
        return <lucide_react_1.Archive className="h-5 w-5" />;
    }
  };
  var getStatusColor = function (status) {
    switch (status) {
      case "ACTIVE":
      case "CONNECTED":
      case "HEALTHY":
        return "text-green-500";
      case "WARNING":
        return "text-yellow-500";
      case "INACTIVE":
      case "DISCONNECTED":
      case "ERROR":
      case "CRITICAL":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  var getSeverityIcon = function (severity) {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500" />;
      case "MEDIUM":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "LOW":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  var filteredProviders = selectedProvider
    ? providers.filter(function (p) {
        return p.id === selectedProvider;
      })
    : providers;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando dados de armazenamento...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Armazenamento</h2>
          <p className="text-muted-foreground">
            Monitore o uso e saúde dos sistemas de armazenamento
          </p>
        </div>
        <div className="flex space-x-2">
          <select_1.Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <select_1.SelectTrigger className="w-[200px]">
              <select_1.SelectValue placeholder="Todos os provedores" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="">Todos os provedores</select_1.SelectItem>
              {providers.map(function (provider) {
                return (
                  <select_1.SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button onClick={handleRefresh} disabled={refreshing}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(refreshing ? "animate-spin" : "")}
            />
            Atualizar
          </button_1.Button>
        </div>
      </div>

      {/* Status Geral */}
      {health && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center">
              <lucide_react_1.Activity className="h-5 w-5 mr-2" />
              Status Geral
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div
                  className={"h-3 w-3 rounded-full ".concat(
                    health.overall_status === "HEALTHY"
                      ? "bg-green-500"
                      : health.overall_status === "WARNING"
                        ? "bg-yellow-500"
                        : "bg-red-500",
                  )}
                />
                <span className="font-medium">
                  {health.overall_status === "HEALTHY"
                    ? "Saudável"
                    : health.overall_status === "WARNING"
                      ? "Atenção"
                      : "Crítico"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Última verificação: {(0, utils_1.formatDate)(new Date(health.last_check))}
              </span>
            </div>

            {health.issues.length > 0 && (
              <div className="space-y-2">
                {health.issues.map(function (issue, index) {
                  return (
                    <alert_1.Alert
                      key={index}
                      className={
                        issue.severity === "CRITICAL" || issue.severity === "HIGH"
                          ? "border-red-200 bg-red-50"
                          : issue.severity === "MEDIUM"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-blue-200 bg-blue-50"
                      }
                    >
                      <div className="flex items-start space-x-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <alert_1.AlertDescription>
                            <strong>{issue.type}:</strong> {issue.message}
                            {issue.recommendation && (
                              <div className="mt-1 text-sm">
                                <strong>Recomendação:</strong> {issue.recommendation}
                              </div>
                            )}
                          </alert_1.AlertDescription>
                        </div>
                      </div>
                    </alert_1.Alert>
                  );
                })}
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Métricas Gerais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.total_backups}</p>
                  <p className="text-sm text-muted-foreground">Total de Backups</p>
                </div>
                <lucide_react_1.Archive className="h-8 w-8 text-blue-500" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {(0, utils_1.formatBytes)(metrics.total_size)}
                  </p>
                  <p className="text-sm text-muted-foreground">Espaço Utilizado</p>
                </div>
                <lucide_react_1.HardDrive className="h-8 w-8 text-green-500" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.used_percentage.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Capacidade Usada</p>
                </div>
                <lucide_react_1.BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {(0, utils_1.formatBytes)(metrics.growth_rate_mb_per_day * 1024 * 1024)}/dia
                  </p>
                  <p className="text-sm text-muted-foreground">Taxa de Crescimento</p>
                </div>
                {metrics.growth_rate_mb_per_day > 0
                  ? <lucide_react_1.TrendingUp className="h-8 w-8 text-green-500" />
                  : <lucide_react_1.TrendingDown className="h-8 w-8 text-red-500" />}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Distribuição por Provedor */}
      {distribution.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center">
              <lucide_react_1.BarChart3 className="h-5 w-5 mr-2" />
              Distribuição por Provedor
            </card_1.CardTitle>
            <card_1.CardDescription>
              Como os backups estão distribuídos entre os provedores
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {distribution.map(function (item) {
                return (
                  <div key={item.provider_id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.provider_name}</span>
                      <div className="text-sm text-muted-foreground">
                        {item.backup_count} backups • {(0, utils_1.formatBytes)(item.total_size)}
                      </div>
                    </div>
                    <progress_1.Progress value={item.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}% do total
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Provedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProviders.map(function (provider) {
          return (
            <card_1.Card key={provider.id}>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getProviderIcon(provider.type)}
                    <span>{provider.name}</span>
                    <badge_1.Badge variant="outline">{provider.type}</badge_1.Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={"h-2 w-2 rounded-full ".concat(getStatusColor(provider.status))}
                    />
                    <span className={"text-sm ".concat(getStatusColor(provider.status))}>
                      {provider.status}
                    </span>
                  </div>
                </card_1.CardTitle>
                <card_1.CardDescription>
                  {provider.connection_status === "CONNECTED"
                    ? <span className="text-green-600 flex items-center">
                        <lucide_react_1.CheckCircle className="h-4 w-4 mr-1" />
                        Conectado
                      </span>
                    : provider.connection_status === "ERROR"
                      ? <span className="text-red-600 flex items-center">
                          <lucide_react_1.AlertTriangle className="h-4 w-4 mr-1" />
                          Erro de conexão
                        </span>
                      : <span className="text-gray-600 flex items-center">
                          <lucide_react_1.Clock className="h-4 w-4 mr-1" />
                          Desconectado
                        </span>}
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {/* Capacidade */}
                  {provider.total_capacity && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Capacidade</span>
                        <span>
                          {(0, utils_1.formatBytes)(provider.used_capacity || 0)} /{" "}
                          {(0, utils_1.formatBytes)(provider.total_capacity)}
                        </span>
                      </div>
                      <progress_1.Progress
                        value={((provider.used_capacity || 0) / provider.total_capacity) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {(0, utils_1.formatBytes)(provider.available_capacity || 0)} disponível
                      </div>
                    </div>
                  )}

                  {/* Última sincronização */}
                  {provider.last_sync && (
                    <div className="flex justify-between text-sm">
                      <span>Última sync:</span>
                      <span className="text-muted-foreground">
                        {(0, utils_1.formatDate)(new Date(provider.last_sync))}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-2">
                    <button_1.Button
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return handleTestConnection(provider.id);
                      }}
                      className="flex-1"
                    >
                      <lucide_react_1.Zap className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </button_1.Button>
                    {provider.config && (
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Shield className="h-4 w-4 mr-2" />
                        Configurar
                      </button_1.Button>
                    )}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {providers.length === 0 && (
        <card_1.Card>
          <card_1.CardContent className="text-center py-8">
            <lucide_react_1.Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum provedor de armazenamento configurado</p>
            <button_1.Button className="mt-4">Configurar Provedor</button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
};
exports.default = StorageMonitor;
