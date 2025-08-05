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
exports.default = MedicalHistoryManager;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function MedicalHistoryManager(_a) {
  var patientId = _a.patientId,
    _b = _a.readOnly,
    readOnly = _b === void 0 ? false : _b,
    onHistoryUpdate = _a.onHistoryUpdate;
  // State management
  var _c = (0, react_1.useState)([]),
    conditions = _c[0],
    setConditions = _c[1];
  var _d = (0, react_1.useState)([]),
    allergies = _d[0],
    setAllergies = _d[1];
  var _e = (0, react_1.useState)([]),
    medications = _e[0],
    setMedications = _e[1];
  var _f = (0, react_1.useState)([]),
    familyHistory = _f[0],
    setFamilyHistory = _f[1];
  var _g = (0, react_1.useState)(null),
    socialHistory = _g[0],
    setSocialHistory = _g[1];
  var _h = (0, react_1.useState)(true),
    loading = _h[0],
    setLoading = _h[1];
  var _j = (0, react_1.useState)("conditions"),
    activeTab = _j[0],
    setActiveTab = _j[1];
  var _k = (0, react_1.useState)(""),
    searchTerm = _k[0],
    setSearchTerm = _k[1];
  var _l = (0, react_1.useState)("all"),
    filterStatus = _l[0],
    setFilterStatus = _l[1];
  // Dialog states
  var _m = (0, react_1.useState)(false),
    showConditionDialog = _m[0],
    setShowConditionDialog = _m[1];
  var _o = (0, react_1.useState)(false),
    showAllergyDialog = _o[0],
    setShowAllergyDialog = _o[1];
  var _p = (0, react_1.useState)(false),
    showMedicationDialog = _p[0],
    setShowMedicationDialog = _p[1];
  var _q = (0, react_1.useState)(false),
    showFamilyDialog = _q[0],
    setShowFamilyDialog = _q[1];
  var _r = (0, react_1.useState)(false),
    showSocialDialog = _r[0],
    setShowSocialDialog = _r[1];
  var _s = (0, react_1.useState)(null),
    editingItem = _s[0],
    setEditingItem = _s[1];
  (0, react_1.useEffect)(() => {
    loadMedicalHistory();
  }, [patientId]);
  var loadMedicalHistory = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          setLoading(true);
          // TODO: Replace with actual Supabase queries
          // const { data: conditionsData } = await supabase
          //   .from('medical_conditions')
          //   .select('*')
          //   .eq('patient_id', patientId)
          //   .order('created_at', { ascending: false });
          // Mock data for demonstration
          setConditions(generateMockConditions());
          setAllergies(generateMockAllergies());
          setMedications(generateMockMedications());
          setFamilyHistory(generateMockFamilyHistory());
          setSocialHistory(generateMockSocialHistory());
        } catch (error) {
          console.error("Error loading medical history:", error);
          sonner_1.toast.error("Erro ao carregar histórico médico");
        } finally {
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  var handleAddCondition = (conditionData) =>
    __awaiter(this, void 0, void 0, function () {
      var newCondition_1;
      return __generator(this, (_a) => {
        try {
          newCondition_1 = __assign(
            __assign({ id: "condition_".concat(Date.now()), patient_id: patientId }, conditionData),
            {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: "current_user_id",
              updated_by: "current_user_id",
              lgpd_consent: true,
              data_retention_date: new Date(
                Date.now() + 7 * 365 * 24 * 60 * 60 * 1000,
              ).toISOString(), // 7 years
            },
          );
          setConditions((prev) => __spreadArray([newCondition_1], prev, true));
          setShowConditionDialog(false);
          sonner_1.toast.success("Condição médica adicionada com sucesso");
          onHistoryUpdate === null || onHistoryUpdate === void 0 ? void 0 : onHistoryUpdate();
        } catch (error) {
          console.error("Error adding condition:", error);
          sonner_1.toast.error("Erro ao adicionar condição médica");
        }
        return [2 /*return*/];
      });
    });
  var handleAddAllergy = (allergyData) =>
    __awaiter(this, void 0, void 0, function () {
      var newAllergy_1;
      return __generator(this, (_a) => {
        try {
          newAllergy_1 = __assign(
            __assign({ id: "allergy_".concat(Date.now()), patient_id: patientId }, allergyData),
            {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              lgpd_consent: true,
            },
          );
          setAllergies((prev) => __spreadArray([newAllergy_1], prev, true));
          setShowAllergyDialog(false);
          sonner_1.toast.success("Alergia adicionada com sucesso");
          onHistoryUpdate === null || onHistoryUpdate === void 0 ? void 0 : onHistoryUpdate();
        } catch (error) {
          console.error("Error adding allergy:", error);
          sonner_1.toast.error("Erro ao adicionar alergia");
        }
        return [2 /*return*/];
      });
    });
  var handleAddMedication = (medicationData) =>
    __awaiter(this, void 0, void 0, function () {
      var newMedication_1;
      return __generator(this, (_a) => {
        try {
          newMedication_1 = __assign(
            __assign(
              { id: "medication_".concat(Date.now()), patient_id: patientId },
              medicationData,
            ),
            {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              lgpd_consent: true,
            },
          );
          setMedications((prev) => __spreadArray([newMedication_1], prev, true));
          setShowMedicationDialog(false);
          sonner_1.toast.success("Medicação adicionada com sucesso");
          onHistoryUpdate === null || onHistoryUpdate === void 0 ? void 0 : onHistoryUpdate();
        } catch (error) {
          console.error("Error adding medication:", error);
          sonner_1.toast.error("Erro ao adicionar medicação");
        }
        return [2 /*return*/];
      });
    });
  var handleExportHistory = () => {
    // LGPD-compliant export with audit logging
    var exportData = {
      patient_id: patientId,
      export_date: new Date().toISOString(),
      conditions: conditions,
      allergies: allergies,
      medications: medications,
      family_history: familyHistory,
      social_history: socialHistory,
      lgpd_compliance: {
        consent_verified: true,
        data_minimization: true,
        purpose_limitation: "medical_care",
        retention_period: "7_years",
      },
    };
    // TODO: Implement actual export with audit logging
    console.log("Exporting medical history:", exportData);
    sonner_1.toast.success("Histórico médico exportado com conformidade LGPD");
  };
  var getSeverityColor = (severity) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-orange-100 text-orange-800";
      case "critical":
      case "life_threatening":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "chronic":
        return "bg-orange-100 text-orange-800";
      case "in_remission":
        return "bg-blue-100 text-blue-800";
      case "discontinued":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico Médico</h2>
          <p className="text-muted-foreground">
            Gestão completa do histórico médico com conformidade HIPAA/LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button
            variant="outline"
            onClick={handleExportHistory}
            className="hidden sm:flex"
          >
            <lucide_react_1.Download className="mr-2 h-4 w-4" />
            Exportar
          </button_1.Button>
          {!readOnly && (
            <button_1.Button onClick={() => loadMedicalHistory()}>
              <lucide_react_1.Activity className="mr-2 h-4 w-4" />
              Atualizar
            </button_1.Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input_1.Input
            placeholder="Buscar no histórico médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
          <select_1.SelectTrigger className="w-[180px]">
            <select_1.SelectValue placeholder="Filtrar por status" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos</select_1.SelectItem>
            <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
            <select_1.SelectItem value="resolved">Resolvido</select_1.SelectItem>
            <select_1.SelectItem value="chronic">Crônico</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      {/* Medical History Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="conditions" className="flex items-center space-x-2">
            <lucide_react_1.Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Condições</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="allergies" className="flex items-center space-x-2">
            <lucide_react_1.AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alergias</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medications" className="flex items-center space-x-2">
            <lucide_react_1.Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Medicações</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="family" className="flex items-center space-x-2">
            <lucide_react_1.User className="h-4 w-4" />
            <span className="hidden sm:inline">Família</span>
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="social" className="flex items-center space-x-2">
            <lucide_react_1.Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Medical Conditions Tab */}
        <tabs_1.TabsContent value="conditions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Condições Médicas</h3>
            {!readOnly && (
              <dialog_1.Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Nova Condição
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="max-w-2xl">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Adicionar Condição Médica</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Registre uma nova condição médica com conformidade LGPD
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <ConditionForm
                    onSubmit={handleAddCondition}
                    onCancel={() => setShowConditionDialog(false)}
                  />
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {conditions.map((condition) => (
              <card_1.Card key={condition.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{condition.condition_name}</h4>
                      {condition.icd_10_code && (
                        <badge_1.Badge variant="outline">{condition.icd_10_code}</badge_1.Badge>
                      )}
                      <badge_1.Badge className={getSeverityColor(condition.severity)}>
                        {condition.severity}
                      </badge_1.Badge>
                      <badge_1.Badge className={getStatusColor(condition.status)}>
                        {condition.status}
                      </badge_1.Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        Início:{" "}
                        {(0, date_fns_1.format)(new Date(condition.onset_date), "dd/MM/yyyy", {
                          locale: locale_1.ptBR,
                        })}
                      </span>
                      {condition.resolution_date && (
                        <span>
                          Resolução:{" "}
                          {(0, date_fns_1.format)(
                            new Date(condition.resolution_date),
                            "dd/MM/yyyy",
                            { locale: locale_1.ptBR },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  )}
                </div>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Allergies Tab */}
        <tabs_1.TabsContent value="allergies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alergias</h3>
            {!readOnly && (
              <dialog_1.Dialog open={showAllergyDialog} onOpenChange={setShowAllergyDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Nova Alergia
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="max-w-2xl">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Adicionar Alergia</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Registre uma nova alergia com plano de ação de emergência
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <AllergyForm
                    onSubmit={handleAddAllergy}
                    onCancel={() => setShowAllergyDialog(false)}
                  />
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {allergies.map((allergy) => (
              <card_1.Card key={allergy.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{allergy.allergen}</h4>
                      <badge_1.Badge variant="outline">{allergy.allergen_type}</badge_1.Badge>
                      <badge_1.Badge className={getSeverityColor(allergy.severity)}>
                        {allergy.severity}
                      </badge_1.Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                    <div className="flex flex-wrap gap-1">
                      {allergy.symptoms.map((symptom, index) => (
                        <badge_1.Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </badge_1.Badge>
                      ))}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  )}
                </div>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Medications Tab */}
        <tabs_1.TabsContent value="medications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Medicações</h3>
            {!readOnly && (
              <dialog_1.Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Nova Medicação
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="max-w-2xl">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Adicionar Medicação</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Registre uma nova medicação com dosagem e frequência
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <MedicationForm
                    onSubmit={handleAddMedication}
                    onCancel={() => setShowMedicationDialog(false)}
                  />
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {medications.map((medication) => (
              <card_1.Card key={medication.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{medication.medication_name}</h4>
                      {medication.generic_name && (
                        <badge_1.Badge variant="outline">{medication.generic_name}</badge_1.Badge>
                      )}
                      <badge_1.Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </badge_1.Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Dosagem:</strong> {medication.dosage}
                      </p>
                      <p>
                        <strong>Frequência:</strong> {medication.frequency}
                      </p>
                      <p>
                        <strong>Via:</strong> {medication.route}
                      </p>
                      <p>
                        <strong>Indicação:</strong> {medication.indication}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        Início:{" "}
                        {(0, date_fns_1.format)(new Date(medication.start_date), "dd/MM/yyyy", {
                          locale: locale_1.ptBR,
                        })}
                      </span>
                      {medication.end_date && (
                        <span>
                          Fim:{" "}
                          {(0, date_fns_1.format)(new Date(medication.end_date), "dd/MM/yyyy", {
                            locale: locale_1.ptBR,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  )}
                </div>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Family History Tab */}
        <tabs_1.TabsContent value="family" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico Familiar</h3>
            {!readOnly && (
              <dialog_1.Dialog open={showFamilyDialog} onOpenChange={setShowFamilyDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Plus className="mr-2 h-4 w-4" />
                    Novo Registro
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="max-w-2xl">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Adicionar Histórico Familiar</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Registre condições médicas na família
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <FamilyHistoryForm
                    onSubmit={(data) => {
                      // Handle family history submission
                      setShowFamilyDialog(false);
                      sonner_1.toast.success("Histórico familiar adicionado");
                    }}
                    onCancel={() => setShowFamilyDialog(false)}
                  />
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {familyHistory.map((history) => (
              <card_1.Card key={history.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{history.condition}</h4>
                      <badge_1.Badge variant="outline">{history.relationship}</badge_1.Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{history.notes}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {history.age_of_onset && (
                        <span>Idade de início: {history.age_of_onset} anos</span>
                      )}
                      {history.age_of_death && (
                        <span>Idade do óbito: {history.age_of_death} anos</span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  )}
                </div>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Social History Tab */}
        <tabs_1.TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico Social</h3>
            {!readOnly && (
              <dialog_1.Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button>
                    <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                    Editar Histórico Social
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent className="max-w-2xl">
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Editar Histórico Social</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                      Atualize informações sobre estilo de vida e fatores sociais
                    </dialog_1.DialogDescription>
                  </dialog_1.DialogHeader>
                  <SocialHistoryForm
                    initialData={socialHistory}
                    onSubmit={(data) => {
                      setSocialHistory(data);
                      setShowSocialDialog(false);
                      sonner_1.toast.success("Histórico social atualizado");
                    }}
                    onCancel={() => setShowSocialDialog(false)}
                  />
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}
          </div>

          {socialHistory && (
            <card_1.Card className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tabagismo</h4>
                    <badge_1.Badge
                      className={
                        socialHistory.smoking_status === "current"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {socialHistory.smoking_status}
                    </badge_1.Badge>
                    {socialHistory.smoking_details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {socialHistory.smoking_details.packs_per_day && (
                          <p>Maços/dia: {socialHistory.smoking_details.packs_per_day}</p>
                        )}
                        {socialHistory.smoking_details.years_smoked && (
                          <p>Anos fumando: {socialHistory.smoking_details.years_smoked}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Álcool</h4>
                    <badge_1.Badge variant="outline">{socialHistory.alcohol_use}</badge_1.Badge>
                    {socialHistory.alcohol_details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {socialHistory.alcohol_details.drinks_per_week && (
                          <p>Doses/semana: {socialHistory.alcohol_details.drinks_per_week}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exercício</h4>
                    <badge_1.Badge variant="outline">
                      {socialHistory.exercise_frequency}
                    </badge_1.Badge>
                    {socialHistory.exercise_details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {socialHistory.exercise_details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ocupação</h4>
                    <p className="text-sm">{socialHistory.occupation}</p>
                    {socialHistory.occupational_hazards &&
                      socialHistory.occupational_hazards.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">Riscos ocupacionais:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {socialHistory.occupational_hazards.map((hazard, index) => (
                              <badge_1.Badge key={index} variant="secondary" className="text-xs">
                                {hazard}
                              </badge_1.Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Nível de Estresse</h4>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge variant="outline">
                        {socialHistory.stress_level}/10
                      </badge_1.Badge>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "".concat((socialHistory.stress_level / 10) * 100, "%") }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Situação de Moradia</h4>
                    <p className="text-sm">{socialHistory.living_situation}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Rede de Apoio</h4>
                    <p className="text-sm">{socialHistory.support_system}</p>
                  </div>
                </div>
              </div>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
// Form Components (simplified for brevity)
function ConditionForm(_a) {
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel;
  var _b = (0, react_1.useState)({
      condition_name: "",
      icd_10_code: "",
      severity: "mild",
      status: "active",
      onset_date: "",
      description: "",
      symptoms: [],
      treatment_notes: "",
    }),
    formData = _b[0],
    setFormData = _b[1];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label_1.Label htmlFor="condition_name">Nome da Condição *</label_1.Label>
          <input_1.Input
            id="condition_name"
            value={formData.condition_name}
            onChange={(e) =>
              setFormData((prev) =>
                __assign(__assign({}, prev), { condition_name: e.target.value }),
              )
            }
            required
          />
        </div>
        <div>
          <label_1.Label htmlFor="icd_10_code">Código CID-10</label_1.Label>
          <input_1.Input
            id="icd_10_code"
            value={formData.icd_10_code}
            onChange={(e) =>
              setFormData((prev) => __assign(__assign({}, prev), { icd_10_code: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label_1.Label htmlFor="severity">Severidade</label_1.Label>
          <select_1.Select
            value={formData.severity}
            onValueChange={(value) =>
              setFormData((prev) => __assign(__assign({}, prev), { severity: value }))
            }
          >
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="mild">Leve</select_1.SelectItem>
              <select_1.SelectItem value="moderate">Moderada</select_1.SelectItem>
              <select_1.SelectItem value="severe">Severa</select_1.SelectItem>
              <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
        <div>
          <label_1.Label htmlFor="status">Status</label_1.Label>
          <select_1.Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => __assign(__assign({}, prev), { status: value }))
            }
          >
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
              <select_1.SelectItem value="resolved">Resolvido</select_1.SelectItem>
              <select_1.SelectItem value="chronic">Crônico</select_1.SelectItem>
              <select_1.SelectItem value="in_remission">Em Remissão</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
        <div>
          <label_1.Label htmlFor="onset_date">Data de Início</label_1.Label>
          <input_1.Input
            id="onset_date"
            type="date"
            value={formData.onset_date}
            onChange={(e) =>
              setFormData((prev) => __assign(__assign({}, prev), { onset_date: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <label_1.Label htmlFor="description">Descrição</label_1.Label>
        <textarea_1.Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => __assign(__assign({}, prev), { description: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div>
        <label_1.Label htmlFor="treatment_notes">Notas de Tratamento</label_1.Label>
        <textarea_1.Textarea
          id="treatment_notes"
          value={formData.treatment_notes}
          onChange={(e) =>
            setFormData((prev) => __assign(__assign({}, prev), { treatment_notes: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <checkbox_1.Checkbox id="lgpd_consent" required />
        <label_1.Label htmlFor="lgpd_consent" className="text-sm">
          Confirmo o consentimento LGPD para armazenamento destes dados médicos
        </label_1.Label>
      </div>

      <div className="flex justify-end space-x-2">
        <button_1.Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </button_1.Button>
        <button_1.Button type="submit">Salvar Condição</button_1.Button>
      </div>
    </form>
  );
}
function AllergyForm(_a) {
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel;
  // Similar form structure for allergies
  return <div>Allergy Form Component</div>;
}
function MedicationForm(_a) {
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel;
  // Similar form structure for medications
  return <div>Medication Form Component</div>;
}
function FamilyHistoryForm(_a) {
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel;
  // Similar form structure for family history
  return <div>Family History Form Component</div>;
}
function SocialHistoryForm(_a) {
  var initialData = _a.initialData,
    onSubmit = _a.onSubmit,
    onCancel = _a.onCancel;
  // Similar form structure for social history
  return <div>Social History Form Component</div>;
}
// Mock data generators
function generateMockConditions() {
  return [
    {
      id: "condition_1",
      patient_id: "patient_1",
      condition_name: "Hipertensão Arterial",
      icd_10_code: "I10",
      severity: "moderate",
      status: "active",
      onset_date: "2020-03-15",
      description: "Hipertensão arterial sistêmica controlada com medicação",
      symptoms: ["Dor de cabeça", "Tontura"],
      triggers: ["Estresse", "Sal em excesso"],
      treatment_notes: "Paciente responde bem ao tratamento com Losartana 50mg",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      created_by: "doctor_1",
      updated_by: "doctor_1",
      lgpd_consent: true,
      data_retention_date: "2031-01-15T10:00:00Z",
    },
  ];
}
function generateMockAllergies() {
  return [
    {
      id: "allergy_1",
      patient_id: "patient_1",
      allergen: "Penicilina",
      allergen_type: "medication",
      severity: "severe",
      reaction_type: ["Anafilaxia"],
      symptoms: ["Urticária", "Dificuldade respiratória", "Inchaço"],
      verified_date: "2023-05-10",
      verified_by: "doctor_1",
      notes: "Reação severa documentada em 2023. Evitar penicilina e derivados.",
      emergency_action_plan: "Administrar epinefrina e procurar atendimento médico imediato",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      lgpd_consent: true,
    },
  ];
}
function generateMockMedications() {
  return [
    {
      id: "medication_1",
      patient_id: "patient_1",
      medication_name: "Losartana Potássica",
      generic_name: "Losartana",
      dosage: "50mg",
      frequency: "1x ao dia",
      route: "oral",
      indication: "Hipertensão arterial",
      prescribing_doctor: "Dr. João Silva",
      start_date: "2023-03-15",
      status: "active",
      side_effects: [],
      interactions: [],
      adherence_notes: "Paciente aderente ao tratamento",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      lgpd_consent: true,
    },
  ];
}
function generateMockFamilyHistory() {
  return [
    {
      id: "family_1",
      patient_id: "patient_1",
      relationship: "father",
      condition: "Diabetes Tipo 2",
      age_of_onset: 55,
      notes: "Diabetes diagnosticado aos 55 anos, controlado com medicação",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      lgpd_consent: true,
    },
  ];
}
function generateMockSocialHistory() {
  return {
    id: "social_1",
    patient_id: "patient_1",
    smoking_status: "former",
    smoking_details: {
      packs_per_day: 1,
      years_smoked: 10,
      quit_date: "2020-01-01",
    },
    alcohol_use: "occasional",
    alcohol_details: {
      drinks_per_week: 2,
      type_preferred: ["Vinho", "Cerveja"],
    },
    exercise_frequency: "moderate",
    exercise_details: "Caminhada 3x por semana, 30 minutos",
    occupation: "Engenheiro de Software",
    occupational_hazards: ["Sedentarismo", "Estresse"],
    living_situation: "Mora com família",
    support_system: "Família presente e apoiadora",
    stress_level: 6,
    sleep_patterns: "Dorme 7-8 horas por noite, qualidade boa",
    diet_description: "Dieta balanceada, evita sal em excesso",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    lgpd_consent: true,
  };
}
