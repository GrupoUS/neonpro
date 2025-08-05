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
exports.default = EnhancedPatientProfile;
var react_1 = require("react");
var client_1 = require("@/app/utils/supabase/client");
var photo_upload_system_1 = require("./photo-upload-system");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function EnhancedPatientProfile(_a) {
  var _this = this;
  var _b;
  var patient = _a.patient,
    onPatientUpdate = _a.onPatientUpdate,
    onClose = _a.onClose;
  var _c = (0, react_1.useState)(false),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)([]),
    timelineEvents = _d[0],
    setTimelineEvents = _d[1];
  var _e = (0, react_1.useState)("overview"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  var supabase = (0, client_1.createClient)();
  // Load timeline events
  (0, react_1.useEffect)(
    function () {
      var loadTimelineEvents = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var _a, data, error, eventsWithStaff, error_1;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                if (!patient.id) return [2 /*return*/];
                _b.label = 1;
              case 1:
                _b.trys.push([1, 3, , 4]);
                return [
                  4 /*yield*/,
                  supabase
                    .from("medical_timeline")
                    .select(
                      "\n            *,\n            profiles!medical_timeline_staff_id_fkey(raw_user_meta_data)\n          ",
                    )
                    .eq("patient_id", patient.id)
                    .order("event_date", { ascending: false }),
                ];
              case 2:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                eventsWithStaff =
                  (data === null || data === void 0
                    ? void 0
                    : data.map(function (event) {
                        var _a, _b;
                        return __assign(__assign({}, event), {
                          staff_name:
                            ((_b =
                              (_a = event.profiles) === null || _a === void 0
                                ? void 0
                                : _a.raw_user_meta_data) === null || _b === void 0
                              ? void 0
                              : _b.full_name) || "Sistema",
                        });
                      })) || [];
                setTimelineEvents(eventsWithStaff);
                return [3 /*break*/, 4];
              case 3:
                error_1 = _b.sent();
                console.error("Error loading timeline:", error_1);
                sonner_1.toast.error("Erro ao carregar histórico médico");
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      };
      loadTimelineEvents();
    },
    [patient.id, supabase],
  );
  // Utility functions
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
  var calculateBMI = function (height, weight) {
    if (!height || !weight) return null;
    var heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };
  var getBMICategory = function (bmi) {
    if (bmi < 18.5) return { category: "Abaixo do peso", color: "text-blue-600" };
    if (bmi < 25) return { category: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Sobrepeso", color: "text-yellow-600" };
    return { category: "Obesidade", color: "text-red-600" };
  };
  var getRiskColor = function (level) {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getEventTypeIcon = function (type) {
    switch (type) {
      case "appointment":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "treatment":
        return <lucide_react_1.Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <lucide_react_1.Activity className="h-4 w-4" />;
      case "diagnosis":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "medication":
        return <lucide_react_1.Heart className="h-4 w-4" />;
      case "test_result":
        return <lucide_react_1.TrendingUp className="h-4 w-4" />;
      case "follow_up":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      default:
        return <lucide_react_1.FileText className="h-4 w-4" />;
    }
  };
  var getEventTypeColor = function (type) {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "procedure":
        return "bg-purple-100 text-purple-800";
      case "diagnosis":
        return "bg-orange-100 text-orange-800";
      case "medication":
        return "bg-red-100 text-red-800";
      case "test_result":
        return "bg-cyan-100 text-cyan-800";
      case "follow_up":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var formatEventType = function (type) {
    var types = {
      appointment: "Consulta",
      treatment: "Tratamento",
      procedure: "Procedimento",
      diagnosis: "Diagnóstico",
      medication: "Medicação",
      test_result: "Exame",
      follow_up: "Retorno",
    };
    return types[type] || type;
  };
  // Render functions
  var renderOverview = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic Info */}
        <card_1.Card className="lg:col-span-1">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.User className="h-5 w-5" />
              Informações Básicas
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <avatar_1.Avatar className="h-16 w-16">
                <avatar_1.AvatarImage
                  src={
                    ((_a = patient.raw_user_meta_data) === null || _a === void 0
                      ? void 0
                      : _a.profile_picture) ||
                    ((_c =
                      (_b = patient.patient_photos) === null || _b === void 0
                        ? void 0
                        : _b.find(function (p) {
                            return p.is_primary;
                          })) === null || _c === void 0
                      ? void 0
                      : _c.photo_url)
                  }
                />
                <avatar_1.AvatarFallback className="text-lg">
                  {((_e =
                    (_d = patient.raw_user_meta_data) === null || _d === void 0
                      ? void 0
                      : _d.full_name) === null || _e === void 0
                    ? void 0
                    : _e.charAt(0)) || "P"}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {((_f = patient.raw_user_meta_data) === null || _f === void 0
                    ? void 0
                    : _f.full_name) || "Nome não informado"}
                </h3>
                <p className="text-muted-foreground">
                  {(
                    (_g = patient.raw_user_meta_data) === null || _g === void 0
                      ? void 0
                      : _g.date_of_birth
                  )
                    ? "".concat(calculateAge(patient.raw_user_meta_data.date_of_birth), " anos")
                    : "Idade não informada"}
                  {((_h = patient.raw_user_meta_data) === null || _h === void 0
                    ? void 0
                    : _h.gender) &&
                    " \u2022 ".concat(
                      patient.raw_user_meta_data.gender === "male"
                        ? "Masculino"
                        : patient.raw_user_meta_data.gender === "female"
                          ? "Feminino"
                          : "Outro",
                    )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <lucide_react_1.Phone className="h-4 w-4 text-muted-foreground" />
                  {patient.phone}
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground" />
                  {patient.email}
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-sm">
                  <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground" />
                  {patient.address.city}, {patient.address.state}
                </div>
              )}
            </div>

            {((_j = patient.patient_profiles_extended) === null || _j === void 0
              ? void 0
              : _j.emergency_contact) && (
              <div className="border-t pt-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />
                  Contato de Emergência
                </h4>
                <div className="text-sm space-y-1">
                  <p>{patient.patient_profiles_extended.emergency_contact.name}</p>
                  <p className="text-muted-foreground">
                    {patient.patient_profiles_extended.emergency_contact.phone} •
                    {patient.patient_profiles_extended.emergency_contact.relationship}
                  </p>
                </div>
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>

        {/* Health Metrics */}
        <card_1.Card className="lg:col-span-1">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Activity className="h-5 w-5" />
              Métricas de Saúde
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Risk Assessment */}
            {((_k = patient.patient_profiles_extended) === null || _k === void 0
              ? void 0
              : _k.risk_level) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nível de Risco</span>
                  <badge_1.Badge
                    className={getRiskColor(patient.patient_profiles_extended.risk_level)}
                    variant="outline"
                  >
                    {patient.patient_profiles_extended.risk_level === "low" && "Baixo"}
                    {patient.patient_profiles_extended.risk_level === "medium" && "Médio"}
                    {patient.patient_profiles_extended.risk_level === "high" && "Alto"}
                    {patient.patient_profiles_extended.risk_level === "critical" && "Crítico"}
                  </badge_1.Badge>
                </div>
                {patient.patient_profiles_extended.risk_score && (
                  <div className="flex items-center gap-2">
                    <progress_1.Progress
                      value={patient.patient_profiles_extended.risk_score * 100}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(patient.patient_profiles_extended.risk_score * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* BMI */}
            {((_l = patient.patient_profiles_extended) === null || _l === void 0
              ? void 0
              : _l.height_cm) &&
              ((_m = patient.patient_profiles_extended) === null || _m === void 0
                ? void 0
                : _m.weight_kg) && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Altura</span>
                      <p className="font-medium">{patient.patient_profiles_extended.height_cm}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso</span>
                      <p className="font-medium">{patient.patient_profiles_extended.weight_kg}kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IMC</span>
                      {(function () {
                        var bmi = calculateBMI(
                          patient.patient_profiles_extended.height_cm,
                          patient.patient_profiles_extended.weight_kg,
                        );
                        if (bmi) {
                          var category = getBMICategory(parseFloat(bmi));
                          return (
                            <div>
                              <p className="font-medium">{bmi}</p>
                              <p className={"text-xs ".concat(category.color)}>
                                {category.category}
                              </p>
                            </div>
                          );
                        }
                        return <p className="font-medium">-</p>;
                      })()}
                    </div>
                  </div>
                </div>
              )}

            {/* Blood Type */}
            {((_o = patient.patient_profiles_extended) === null || _o === void 0
              ? void 0
              : _o.blood_type) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tipo Sanguíneo</span>
                <badge_1.Badge variant="outline">
                  {patient.patient_profiles_extended.blood_type}
                </badge_1.Badge>
              </div>
            )}

            {/* Profile Completeness */}
            {((_p = patient.patient_profiles_extended) === null || _p === void 0
              ? void 0
              : _p.profile_completeness_score) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completude do Perfil</span>
                  <span className="text-sm font-medium">
                    {Math.round(patient.patient_profiles_extended.profile_completeness_score * 100)}
                    %
                  </span>
                </div>
                <progress_1.Progress
                  value={patient.patient_profiles_extended.profile_completeness_score * 100}
                  className="w-full"
                />
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>

        {/* Recent Timeline */}
        <card_1.Card className="lg:col-span-1">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5" />
              Atividade Recente
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {timelineEvents.length > 0
              ? <div className="space-y-3">
                  {timelineEvents.slice(0, 5).map(function (event) {
                    return (
                      <div key={event.id} className="flex items-start gap-3">
                        <div
                          className={"\n                    flex items-center justify-center w-8 h-8 rounded-full \n                    ".concat(
                            getEventTypeColor(event.event_type),
                            "\n                  ",
                          )}
                        >
                          {getEventTypeIcon(event.event_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatEventType(event.event_type)} •
                            {new Date(event.event_date).toLocaleDateString("pt-BR")}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {timelineEvents.length > 5 && (
                    <button_1.Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={function () {
                        return setActiveTab("timeline");
                      }}
                    >
                      Ver todos ({timelineEvents.length})
                    </button_1.Button>
                  )}
                </div>
              : <div className="text-center py-6 text-muted-foreground">
                  <lucide_react_1.Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum registro médico</p>
                </div>}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  };
  var renderMedicalInfo = function () {
    var _a, _b, _c, _d, _e, _f, _g;
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conditions & Allergies */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Heart className="h-5 w-5" />
              Condições Médicas
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Chronic Conditions */}
            <div>
              <h4 className="font-medium text-sm mb-2">Condições Crônicas</h4>
              {(
                (_b =
                  (_a = patient.patient_profiles_extended) === null || _a === void 0
                    ? void 0
                    : _a.chronic_conditions) === null || _b === void 0
                  ? void 0
                  : _b.length
              )
                ? <div className="flex flex-wrap gap-1">
                    {patient.patient_profiles_extended.chronic_conditions.map(
                      function (condition, index) {
                        return (
                          <badge_1.Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </badge_1.Badge>
                        );
                      },
                    )}
                  </div>
                : <p className="text-sm text-muted-foreground">
                    Nenhuma condição crônica registrada
                  </p>}
            </div>

            {/* Allergies */}
            <div>
              <h4 className="font-medium text-sm mb-2">Alergias</h4>
              {(
                (_d =
                  (_c = patient.patient_profiles_extended) === null || _c === void 0
                    ? void 0
                    : _c.allergies) === null || _d === void 0
                  ? void 0
                  : _d.length
              )
                ? <div className="flex flex-wrap gap-1">
                    {patient.patient_profiles_extended.allergies.map(function (allergy, index) {
                      return (
                        <badge_1.Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </badge_1.Badge>
                      );
                    })}
                  </div>
                : <p className="text-sm text-muted-foreground">Nenhuma alergia registrada</p>}
            </div>

            {/* Medications */}
            <div>
              <h4 className="font-medium text-sm mb-2">Medicações</h4>
              {(
                (_f =
                  (_e = patient.patient_profiles_extended) === null || _e === void 0
                    ? void 0
                    : _e.medications) === null || _f === void 0
                  ? void 0
                  : _f.length
              )
                ? <div className="space-y-2">
                    {patient.patient_profiles_extended.medications.map(
                      function (medication, index) {
                        return (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {medication}
                          </div>
                        );
                      },
                    )}
                  </div>
                : <p className="text-sm text-muted-foreground">Nenhuma medicação registrada</p>}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* AI Insights */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5" />
              Insights de IA
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {(
              (_g = patient.patient_profiles_extended) === null || _g === void 0
                ? void 0
                : _g.ai_insights
            )
              ? <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-sm text-blue-900 mb-1">Análise de Risco</h5>
                    <p className="text-sm text-blue-800">
                      Baseado no histórico médico, este paciente apresenta
                      {patient.patient_profiles_extended.risk_level === "low" && " baixo risco"}
                      {patient.patient_profiles_extended.risk_level === "medium" &&
                        " risco moderado"}
                      {patient.patient_profiles_extended.risk_level === "high" && " alto risco"}
                      {patient.patient_profiles_extended.risk_level === "critical" &&
                        " risco crítico"}{" "}
                      para complicações.
                    </p>
                  </div>

                  {patient.patient_profiles_extended.last_assessment_date && (
                    <div className="text-xs text-muted-foreground">
                      Última avaliação:{" "}
                      {new Date(
                        patient.patient_profiles_extended.last_assessment_date,
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
              : <div className="text-center py-6 text-muted-foreground">
                  <lucide_react_1.TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum insight disponível</p>
                  <p className="text-xs">Aguardando mais dados para análise</p>
                </div>}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  };
  var renderTimeline = function () {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5" />
            Linha do Tempo Médica
          </card_1.CardTitle>
          <card_1.CardDescription>
            Histórico completo de atendimentos e procedimentos
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {timelineEvents.length > 0
            ? <div className="space-y-6">
                {timelineEvents.map(function (event, index) {
                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Timeline Line */}
                      {index < timelineEvents.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-16 bg-border" />
                      )}

                      {/* Event Icon */}
                      <div
                        className={"\n                  flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white\n                  ".concat(
                          getEventTypeColor(event.event_type),
                          "\n                ",
                        )}
                      >
                        {getEventTypeIcon(event.event_type)}
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <badge_1.Badge variant="outline" className="text-xs">
                                {formatEventType(event.event_type)}
                              </badge_1.Badge>
                              <span>•</span>
                              <span>{new Date(event.event_date).toLocaleDateString("pt-BR")}</span>
                              <span>•</span>
                              <span>{event.staff_name}</span>
                            </div>
                          </div>

                          <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                              <button_1.Button variant="ghost" size="sm">
                                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                              </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end">
                              <dropdown_menu_1.DropdownMenuItem>
                                <lucide_react_1.Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem>
                                <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                                Editar
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuSeparator />
                              <dropdown_menu_1.DropdownMenuItem>
                                <lucide_react_1.Archive className="mr-2 h-4 w-4" />
                                Arquivar
                              </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                          </dropdown_menu_1.DropdownMenu>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                        )}

                        {event.notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-xs text-gray-700 mb-1">Observações</h5>
                            <p className="text-sm text-gray-600">{event.notes}</p>
                          </div>
                        )}

                        {event.outcome_score && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Resultado:</span>
                            <div className="flex items-center gap-1">
                              {event.outcome_score >= 0.8
                                ? <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500" />
                                : event.outcome_score >= 0.5
                                  ? <lucide_react_1.Minus className="h-4 w-4 text-yellow-500" />
                                  : <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500" />}
                              <span className="text-sm font-medium">
                                {Math.round(event.outcome_score * 100)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {event.follow_up_required && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-800">
                              <lucide_react_1.Bell className="h-4 w-4" />
                              <span className="text-sm font-medium">Retorno necessário</span>
                            </div>
                            {event.follow_up_date && (
                              <p className="text-sm text-orange-600 mt-1">
                                Data sugerida:{" "}
                                {new Date(event.follow_up_date).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        )}

                        {event.photos && event.photos.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-xs text-gray-700 mb-2">Fotos</h5>
                            <div className="flex gap-2">
                              {event.photos.slice(0, 3).map(function (photoId, photoIndex) {
                                return (
                                  <div
                                    key={photoIndex}
                                    className="w-16 h-16 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={function () {
                                      return setSelectedPhoto(photoId);
                                    }}
                                  >
                                    <lucide_react_1.Camera className="w-full h-full p-4 text-gray-400" />
                                  </div>
                                );
                              })}
                              {event.photos.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">
                                    +{event.photos.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            : <div className="text-center py-12 text-muted-foreground">
                <lucide_react_1.Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento médico registrado</p>
                <p className="text-sm">O histórico aparecerá aqui conforme os atendimentos</p>
              </div>}
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var renderPhotos = function () {
    return (
      <photo_upload_system_1.PhotoUploadSystem
        patientId={patient.id}
        onPhotosUploaded={function (photos) {
          // Callback when photos are uploaded
          console.log("Photos uploaded:", photos);
          // You could update patient state here if needed
        }}
        readonly={false} // Allow upload and editing
        className="w-full"
      />
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {((_b = patient.raw_user_meta_data) === null || _b === void 0
              ? void 0
              : _b.full_name) || "Paciente"}
          </h2>
          <p className="text-muted-foreground">Perfil completo e histórico médico</p>
        </div>
        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Edit className="mr-2 h-4 w-4" />
            Editar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Share className="mr-2 h-4 w-4" />
            Compartilhar
          </button_1.Button>
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Download className="mr-2 h-4 w-4" />
                Exportar Dados
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Settings className="mr-2 h-4 w-4" />
                Configurações
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
          {onClose && (
            <button_1.Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </button_1.Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical">Informações Médicas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="timeline">Linha do Tempo</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="photos">Fotos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="medical" className="mt-6">
          {renderMedicalInfo()}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="timeline" className="mt-6">
          {renderTimeline()}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="photos" className="mt-6">
          {renderPhotos()}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
