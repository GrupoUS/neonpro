"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.QuickAccess = QuickAccess;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var avatar_1 = require("@/components/ui/avatar");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function QuickAccess(_a) {
  var _this = this;
  var onPatientSelect = _a.onPatientSelect;
  var _b = (0, react_1.useState)("recent"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)({}),
    data = _c[0],
    setData = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  // Load quick access data
  var loadQuickAccessData = function (type) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result_1, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (data[type]) return [2 /*return*/]; // Already loaded
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            return [
              4 /*yield*/,
              fetch("/api/patients/integration/quick-access?type=".concat(type, "&limit=20")),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            result_1 = _a.sent();
            if (result_1.success) {
              setData(function (prev) {
                var _a;
                return __assign(__assign({}, prev), ((_a = {}), (_a[type] = result_1.data), _a));
              });
            } else {
              sonner_1.toast.error(result_1.error || "Erro ao carregar dados");
            }
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading quick access data:", error_1);
            sonner_1.toast.error("Erro ao carregar dados de acesso rápido");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Toggle favorite status
  var toggleFavorite = function (patientId, currentStatus) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/patients/integration/quick-access", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  patientId: patientId,
                  action: currentStatus ? "remove" : "add",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            if (result.success) {
              // Update local state
              setData(function (prev) {
                var updated = __assign({}, prev);
                Object.keys(updated).forEach(function (key) {
                  var _a;
                  var listType = key;
                  if ((_a = updated[listType]) === null || _a === void 0 ? void 0 : _a.patients) {
                    updated[listType] = __assign(__assign({}, updated[listType]), {
                      patients: updated[listType].patients.map(function (p) {
                        return p.id === patientId
                          ? __assign(__assign({}, p), { isFavorite: !currentStatus })
                          : p;
                      }),
                    });
                  }
                });
                return updated;
              });
              sonner_1.toast.success(
                currentStatus
                  ? "Paciente removido dos favoritos"
                  : "Paciente adicionado aos favoritos",
              );
            } else {
              sonner_1.toast.error(result.error || "Erro ao atualizar favoritos");
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error toggling favorite:", error_2);
            sonner_1.toast.error("Erro ao atualizar favoritos");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Load data when tab changes
  (0, react_1.useEffect)(
    function () {
      loadQuickAccessData(activeTab);
    },
    [activeTab],
  );
  // Initial load
  (0, react_1.useEffect)(function () {
    loadQuickAccessData("recent");
  }, []);
  var getRiskLevelColor = function (level) {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getVerificationStatusColor = function (status) {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getTabIcon = function (type) {
    switch (type) {
      case "recent":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "favorites":
        return <lucide_react_1.Star className="h-4 w-4" />;
      case "high-risk":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "upcoming-appointments":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "pending-verification":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      case "frequent":
        return <lucide_react_1.TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };
  var getTabLabel = function (type) {
    switch (type) {
      case "recent":
        return "Recentes";
      case "favorites":
        return "Favoritos";
      case "high-risk":
        return "Alto Risco";
      case "upcoming-appointments":
        return "Próximas Consultas";
      case "pending-verification":
        return "Verificação Pendente";
      case "frequent":
        return "Frequentes";
      default:
        return type;
    }
  };
  var renderPatientCard = function (patient) {
    return (
      <card_1.Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <card_1.CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <avatar_1.Avatar className="h-10 w-10">
                <avatar_1.AvatarImage src={patient.photoUrl} alt={patient.name} />
                <avatar_1.AvatarFallback>
                  {patient.name
                    .split(" ")
                    .map(function (n) {
                      return n[0];
                    })
                    .join("")
                    .toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-sm truncate">{patient.name}</h3>
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={function (e) {
                      e.stopPropagation();
                      toggleFavorite(patient.id, patient.isFavorite);
                    }}
                  >
                    <lucide_react_1.Star
                      className={"h-3 w-3 ".concat(
                        patient.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400",
                      )}
                    />
                  </button_1.Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    {patient.age} anos • {patient.gender === "male" ? "M" : "F"}
                  </div>
                  <div className="truncate">{patient.email}</div>
                  <div>{patient.phone}</div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <badge_1.Badge
                    className={getRiskLevelColor(patient.riskLevel)}
                    variant="secondary"
                  >
                    {patient.riskLevel === "high"
                      ? "Alto"
                      : patient.riskLevel === "medium"
                        ? "Médio"
                        : "Baixo"}
                  </badge_1.Badge>

                  {activeTab === "pending-verification" && (
                    <badge_1.Badge
                      className={getVerificationStatusColor(patient.verificationStatus)}
                      variant="secondary"
                    >
                      {patient.verificationStatus === "verified"
                        ? "Verificado"
                        : patient.verificationStatus === "pending"
                          ? "Pendente"
                          : "Falhou"}
                    </badge_1.Badge>
                  )}

                  {patient.hasPhotos && (
                    <badge_1.Badge variant="outline" className="text-xs">
                      📸
                    </badge_1.Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">
                {activeTab === "recent" && (
                  <span>
                    Última visita:{" "}
                    {(0, date_fns_1.formatDistanceToNow)(new Date(patient.lastVisit), {
                      addSuffix: true,
                      locale: locale_1.ptBR,
                    })}
                  </span>
                )}

                {activeTab === "upcoming-appointments" && patient.nextAppointment && (
                  <span>
                    Próxima:{" "}
                    {(0, date_fns_1.formatDistanceToNow)(new Date(patient.nextAppointment), {
                      addSuffix: true,
                      locale: locale_1.ptBR,
                    })}
                  </span>
                )}

                {activeTab === "frequent" && <span>{patient.visitCount} visitas</span>}
              </div>

              <button_1.Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={function () {
                  return onPatientSelect === null || onPatientSelect === void 0
                    ? void 0
                    : onPatientSelect(patient);
                }}
              >
                Ver Perfil
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var currentData = data[activeTab];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <lucide_react_1.Heart className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Acesso Rápido</h2>
      </div>

      {/* Quick Access Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <tabs_1.TabsTrigger value="recent" className="flex items-center space-x-1">
            {getTabIcon("recent")}
            <span className="hidden sm:inline">Recentes</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="favorites" className="flex items-center space-x-1">
            {getTabIcon("favorites")}
            <span className="hidden sm:inline">Favoritos</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="high-risk" className="flex items-center space-x-1">
            {getTabIcon("high-risk")}
            <span className="hidden sm:inline">Alto Risco</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="upcoming-appointments" className="flex items-center space-x-1">
            {getTabIcon("upcoming-appointments")}
            <span className="hidden sm:inline">Consultas</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="pending-verification" className="flex items-center space-x-1">
            {getTabIcon("pending-verification")}
            <span className="hidden sm:inline">Verificação</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="frequent" className="flex items-center space-x-1">
            {getTabIcon("frequent")}
            <span className="hidden sm:inline">Frequentes</span>
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Tab Contents */}
        {[
          "recent",
          "favorites",
          "high-risk",
          "upcoming-appointments",
          "pending-verification",
          "frequent",
        ].map(function (type) {
          return (
            <tabs_1.TabsContent key={type} value={type} className="space-y-4">
              {isLoading && !currentData
                ? <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Carregando pacientes...</p>
                  </div>
                : (currentData === null || currentData === void 0
                      ? void 0
                      : currentData.patients.length) > 0
                  ? <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {currentData.totalCount} pacientes • Atualizado{" "}
                          {(0, date_fns_1.formatDistanceToNow)(new Date(currentData.lastUpdated), {
                            addSuffix: true,
                            locale: locale_1.ptBR,
                          })}
                        </span>
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={function () {
                            delete data[type];
                            loadQuickAccessData(type);
                          }}
                        >
                          Atualizar
                        </button_1.Button>
                      </div>

                      <div className="grid gap-3">
                        {currentData.patients.map(renderPatientCard)}
                      </div>
                    </>
                  : <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">{getTabIcon(type)}</div>
                      <p className="text-gray-500">Nenhum paciente encontrado</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {type === "favorites" &&
                          "Adicione pacientes aos favoritos para acesso rápido"}
                        {type === "high-risk" && "Nenhum paciente de alto risco no momento"}
                        {type === "upcoming-appointments" && "Nenhuma consulta agendada"}
                        {type === "pending-verification" && "Todas as verificações estão em dia"}
                        {type === "frequent" && "Nenhum paciente frequente identificado"}
                        {type === "recent" && "Nenhuma atividade recente"}
                      </p>
                    </div>}
            </tabs_1.TabsContent>
          );
        })}
      </tabs_1.Tabs>
    </div>
  );
}
