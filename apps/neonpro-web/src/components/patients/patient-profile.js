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
exports.default = PatientProfile;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function PatientProfile(_a) {
  var _this = this;
  var _b, _c, _d, _e, _f, _g, _h, _j, _k;
  var selectedPatient = _a.selectedPatient;
  var _l = (0, react_1.useState)(false),
    loadingInsights = _l[0],
    setLoadingInsights = _l[1];
  var _m = (0, react_1.useState)(null),
    insights = _m[0],
    setInsights = _m[1];
  var patient = selectedPatient;
  var calculateAge = function (dateOfBirth) {
    var today = new Date();
    var birthDate = new Date(dateOfBirth);
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };
  var getCompletenessColor = function (score) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  var getCompletenessStatus = function (score) {
    if (score >= 80) return "Completo";
    if (score >= 60) return "Parcial";
    return "Incompleto";
  };
  var loadPatientInsights = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!patient) return [2 /*return*/];
            setLoadingInsights(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, 6, 7]);
            return [
              4 /*yield*/,
              fetch("/api/patients/profile/".concat(patient.patient_id, "/insights")),
            ];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setInsights(data);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error loading insights:", error_1);
            return [3 /*break*/, 7];
          case 6:
            setLoadingInsights(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  react_1.default.useEffect(
    function () {
      if (patient) {
        loadPatientInsights();
      }
    },
    [patient],
  );
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <lucide_react_1.User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum paciente selecionado</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um paciente na busca para visualizar o perfil completo
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <lucide_react_1.User className="h-8 w-8 text-blue-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">{patient.demographics.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{calculateAge(patient.demographics.date_of_birth)} anos</span>
              <span>{patient.demographics.gender}</span>
              <span>Nascimento: {formatDate(patient.demographics.date_of_birth)}</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <badge_1.Badge variant={patient.is_active ? "default" : "secondary"}>
                {patient.is_active ? "Ativo" : "Inativo"}
              </badge_1.Badge>
              <badge_1.Badge
                variant="outline"
                className={getCompletenessColor(patient.profile_completeness_score)}
              >
                {getCompletenessStatus(patient.profile_completeness_score)}
              </badge_1.Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Completude do Perfil:</span>
            <span
              className={"font-bold ".concat(
                getCompletenessColor(patient.profile_completeness_score),
              )}
            >
              {Math.round(patient.profile_completeness_score)}%
            </span>
          </div>
          <progress_1.Progress value={patient.profile_completeness_score} className="w-32" />
        </div>
      </div>

      {/* Profile Content */}
      <tabs_1.Tabs defaultValue="overview" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical">Histórico Médico</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">Insights IA</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="timeline">Linha do Tempo</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          {/* Contact Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Phone className="h-5 w-5" />
                Informações de Contato
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              {patient.demographics.phone && (
                <div className="flex items-center gap-2">
                  <lucide_react_1.Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.phone}</span>
                </div>
              )}

              {patient.demographics.email && (
                <div className="flex items-center gap-2">
                  <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.email}</span>
                </div>
              )}

              {patient.demographics.address && (
                <div className="flex items-center gap-2">
                  <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.address}</span>
                </div>
              )}

              {patient.last_accessed && (
                <div className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Último acesso: {formatDate(patient.last_accessed)}</span>
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Heart className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {((_c =
                        (_b = patient.medical_history) === null || _b === void 0
                          ? void 0
                          : _b.conditions) === null || _c === void 0
                        ? void 0
                        : _c.length) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Condições</p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {((_e =
                        (_d = patient.medical_history) === null || _d === void 0
                          ? void 0
                          : _d.allergies) === null || _e === void 0
                        ? void 0
                        : _e.length) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Alergias</p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {((_g =
                        (_f = patient.medical_history) === null || _f === void 0
                          ? void 0
                          : _f.current_medications) === null || _g === void 0
                        ? void 0
                        : _g.length) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Medicações</p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="medical" className="space-y-4">
          {/* Medical Conditions */}
          {((_h = patient.medical_history) === null || _h === void 0 ? void 0 : _h.conditions) &&
            patient.medical_history.conditions.length > 0 && (
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Heart className="h-5 w-5" />
                    Condições Médicas
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.medical_history.conditions.map(function (condition, index) {
                      return (
                        <badge_1.Badge key={index} variant="outline">
                          {condition}
                        </badge_1.Badge>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            )}

          {/* Allergies */}
          {((_j = patient.medical_history) === null || _j === void 0 ? void 0 : _j.allergies) &&
            patient.medical_history.allergies.length > 0 && (
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.AlertTriangle className="h-5 w-5" />
                    Alergias
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.medical_history.allergies.map(function (allergy, index) {
                      return (
                        <badge_1.Badge key={index} variant="destructive">
                          {allergy}
                        </badge_1.Badge>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            )}

          {/* Current Medications */}
          {((_k = patient.medical_history) === null || _k === void 0
            ? void 0
            : _k.current_medications) &&
            patient.medical_history.current_medications.length > 0 && (
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Activity className="h-5 w-5" />
                    Medicações Atuais
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.medical_history.current_medications.map(function (medication, index) {
                      return (
                        <badge_1.Badge key={index} variant="secondary">
                          {medication}
                        </badge_1.Badge>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            )}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Insights de IA</h3>
            <button_1.Button
              variant="outline"
              onClick={loadPatientInsights}
              disabled={loadingInsights}
            >
              {loadingInsights
                ? <lucide_react_1.Brain className="h-4 w-4 animate-pulse mr-2" />
                : <lucide_react_1.TrendingUp className="h-4 w-4 mr-2" />}
              {loadingInsights ? "Analisando..." : "Atualizar Insights"}
            </button_1.Button>
          </div>

          {insights
            ? <div className="space-y-4">
                {/* Risk Factors */}
                {insights.risk_factors && insights.risk_factors.length > 0 && (
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Fatores de Risco
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <ul className="space-y-2">
                        {insights.risk_factors.map(function (factor, index) {
                          return (
                            <li key={index} className="flex items-start gap-2">
                              <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{factor}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </card_1.CardContent>
                  </card_1.Card>
                )}

                {/* Recommendations */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Star className="h-5 w-5 text-blue-500" />
                        Recomendações
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <ul className="space-y-2">
                        {insights.recommendations.map(function (recommendation, index) {
                          return (
                            <li key={index} className="flex items-start gap-2">
                              <lucide_react_1.Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{recommendation}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </card_1.CardContent>
                  </card_1.Card>
                )}
              </div>
            : <card_1.Card>
                <card_1.CardContent className="pt-6">
                  <div className="text-center py-8">
                    <lucide_react_1.Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Clique em "Atualizar Insights" para gerar análises de IA
                    </p>
                  </div>
                </card_1.CardContent>
              </card_1.Card>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="timeline" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5" />
                Linha do Tempo
              </card_1.CardTitle>
              <card_1.CardDescription>Histórico de atividades e interações</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">
                  Em breve você poderá visualizar todo o histórico de atividades do paciente
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
