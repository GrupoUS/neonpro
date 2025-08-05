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
exports.MedicalHistoryManager = MedicalHistoryManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var MEDICAL_CATEGORIES = [
  {
    value: "cardiovascular",
    label: "Cardiovascular",
    icon: <lucide_react_1.Heart className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "respiratory",
    label: "Respiratório",
    icon: <lucide_react_1.Lungs className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "neurological",
    label: "Neurológico",
    icon: <lucide_react_1.Brain className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "musculoskeletal",
    label: "Musculoesquelético",
    icon: <lucide_react_1.Bone className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "gastrointestinal",
    label: "Gastrointestinal",
    icon: <lucide_react_1.Activity className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "endocrine",
    label: "Endócrino",
    icon: <lucide_react_1.Pill className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "dermatological",
    label: "Dermatológico",
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "ophthalmological",
    label: "Oftalmológico",
    icon: <lucide_react_1.Eye className="w-4 h-4" />,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "otolaryngological",
    label: "Otorrinolaringológico",
    icon: <lucide_react_1.Ear className="w-4 h-4" />,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "psychiatric",
    label: "Psiquiátrico",
    icon: <lucide_react_1.Brain className="w-4 h-4" />,
    color: "bg-teal-100 text-teal-800",
  },
  {
    value: "allergies",
    label: "Alergias",
    icon: <lucide_react_1.AlertTriangle className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "medications",
    label: "Medicamentos",
    icon: <lucide_react_1.Pill className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "surgeries",
    label: "Cirurgias",
    icon: <lucide_react_1.Activity className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "family_history",
    label: "Histórico Familiar",
    icon: <lucide_react_1.History className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "social_history",
    label: "Histórico Social",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "other",
    label: "Outros",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
];
var SEVERITY_OPTIONS = [
  { value: "mild", label: "Leve", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderado", color: "bg-yellow-100 text-yellow-800" },
  { value: "severe", label: "Grave", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Crítico", color: "bg-red-100 text-red-800" },
];
var STATUS_OPTIONS = [
  {
    value: "active",
    label: "Ativo",
    color: "bg-red-100 text-red-800",
    icon: <lucide_react_1.Activity className="w-3 h-3" />,
  },
  {
    value: "resolved",
    label: "Resolvido",
    color: "bg-green-100 text-green-800",
    icon: <lucide_react_1.CheckCircle className="w-3 h-3" />,
  },
  {
    value: "improving",
    label: "Melhorando",
    color: "bg-blue-100 text-blue-800",
    icon: <lucide_react_1.TrendingUp className="w-3 h-3" />,
  },
  {
    value: "worsening",
    label: "Piorando",
    color: "bg-orange-100 text-orange-800",
    icon: <lucide_react_1.TrendingDown className="w-3 h-3" />,
  },
  {
    value: "stable",
    label: "Estável",
    color: "bg-gray-100 text-gray-800",
    icon: <lucide_react_1.Minus className="w-3 h-3" />,
  },
  {
    value: "chronic",
    label: "Crônico",
    color: "bg-purple-100 text-purple-800",
    icon: <lucide_react_1.Clock className="w-3 h-3" />,
  },
];
function MedicalHistoryManager(_a) {
  var patientId = _a.patientId,
    clinicId = _a.clinicId,
    onHistoryUpdate = _a.onHistoryUpdate;
  var _b = (0, react_1.useState)([]),
    histories = _b[0],
    setHistories = _b[1];
  var _c = (0, react_1.useState)([]),
    filteredHistories = _c[0],
    setFilteredHistories = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    searchTerm = _e[0],
    setSearchTerm = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedCategory = _f[0],
    setSelectedCategory = _f[1];
  var _g = (0, react_1.useState)("all"),
    selectedStatus = _g[0],
    setSelectedStatus = _g[1];
  var _h = (0, react_1.useState)(false),
    showAddDialog = _h[0],
    setShowAddDialog = _h[1];
  var _j = (0, react_1.useState)(null),
    editingHistory = _j[0],
    setEditingHistory = _j[1];
  var _k = (0, react_1.useState)({
      patientId: patientId,
      clinicId: clinicId,
      category: "",
      conditionName: "",
      status: "active",
      isChronic: false,
      isHereditary: false,
      relatedRecords: [],
      metadata: {},
    }),
    newHistory = _k[0],
    setNewHistory = _k[1];
  // Load medical history
  (0, react_1.useEffect)(() => {
    loadMedicalHistory();
  }, [patientId]);
  // Filter histories
  (0, react_1.useEffect)(() => {
    var filtered = histories;
    if (searchTerm) {
      filtered = filtered.filter((history) => {
        var _a;
        return (
          history.conditionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ((_a = history.description) === null || _a === void 0
            ? void 0
            : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
          history.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((history) => history.category === selectedCategory);
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter((history) => history.status === selectedStatus);
    }
    setFilteredHistories(filtered);
  }, [histories, searchTerm, selectedCategory, selectedStatus]);
  var loadMedicalHistory = () =>
    __awaiter(this, void 0, void 0, function () {
      var mockHistories;
      return __generator(this, (_a) => {
        setIsLoading(true);
        try {
          mockHistories = [
            {
              id: "1",
              patientId: patientId,
              clinicId: clinicId,
              category: "cardiovascular",
              conditionName: "Hipertensão Arterial",
              description: "Hipertensão arterial sistêmica controlada com medicação",
              severity: "moderate",
              status: "active",
              onsetDate: new Date("2020-01-15"),
              isChronic: true,
              isHereditary: true,
              notes: "Paciente faz uso de Losartana 50mg 1x ao dia",
              relatedRecords: [],
              metadata: { medications: ["Losartana 50mg"] },
              createdBy: "dr-silva",
              createdAt: new Date("2020-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
            {
              id: "2",
              patientId: patientId,
              clinicId: clinicId,
              category: "allergies",
              conditionName: "Alergia à Penicilina",
              description: "Reação alérgica grave à penicilina e derivados",
              severity: "severe",
              status: "active",
              onsetDate: new Date("2015-06-10"),
              isChronic: false,
              isHereditary: false,
              notes: "Evitar prescrição de antibióticos beta-lactâmicos",
              relatedRecords: [],
              metadata: { allergens: ["Penicilina", "Amoxicilina"] },
              createdBy: "dr-silva",
              createdAt: new Date("2015-06-10"),
              updatedAt: new Date("2023-06-10"),
            },
            {
              id: "3",
              patientId: patientId,
              clinicId: clinicId,
              category: "surgeries",
              conditionName: "Apendicectomia",
              description: "Cirurgia de remoção do apêndice por apendicite aguda",
              severity: "moderate",
              status: "resolved",
              onsetDate: new Date("2018-03-22"),
              resolutionDate: new Date("2018-04-15"),
              isChronic: false,
              isHereditary: false,
              notes: "Cirurgia realizada sem complicações. Recuperação completa.",
              relatedRecords: [],
              metadata: { surgeon: "Dr. Santos", hospital: "Hospital Central" },
              createdBy: "dr-santos",
              createdAt: new Date("2018-03-22"),
              updatedAt: new Date("2018-04-15"),
            },
          ];
          setHistories(mockHistories);
          onHistoryUpdate === null || onHistoryUpdate === void 0
            ? void 0
            : onHistoryUpdate(mockHistories);
        } catch (error) {
          console.error("Erro ao carregar histórico médico:", error);
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  var handleSaveHistory = () =>
    __awaiter(this, void 0, void 0, function () {
      var historyData_1;
      return __generator(this, (_a) => {
        try {
          historyData_1 = {
            id:
              (editingHistory === null || editingHistory === void 0 ? void 0 : editingHistory.id) ||
              crypto.randomUUID(),
            patientId: newHistory.patientId,
            clinicId: newHistory.clinicId,
            category: newHistory.category,
            subcategory: newHistory.subcategory,
            conditionName: newHistory.conditionName,
            description: newHistory.description,
            severity: newHistory.severity,
            status: newHistory.status,
            onsetDate: newHistory.onsetDate,
            resolutionDate: newHistory.resolutionDate,
            isChronic: newHistory.isChronic || false,
            isHereditary: newHistory.isHereditary || false,
            notes: newHistory.notes,
            relatedRecords: newHistory.relatedRecords || [],
            metadata: newHistory.metadata || {},
            createdBy:
              (editingHistory === null || editingHistory === void 0
                ? void 0
                : editingHistory.createdBy) || "current-user",
            createdAt:
              (editingHistory === null || editingHistory === void 0
                ? void 0
                : editingHistory.createdAt) || new Date(),
            updatedAt: new Date(),
          };
          if (editingHistory) {
            setHistories((prev) =>
              prev.map((h) => (h.id === editingHistory.id ? historyData_1 : h)),
            );
          } else {
            setHistories((prev) =>
              __spreadArray(__spreadArray([], prev, true), [historyData_1], false),
            );
          }
          setShowAddDialog(false);
          setEditingHistory(null);
          setNewHistory({
            patientId: patientId,
            clinicId: clinicId,
            category: "",
            conditionName: "",
            status: "active",
            isChronic: false,
            isHereditary: false,
            relatedRecords: [],
            metadata: {},
          });
        } catch (error) {
          console.error("Erro ao salvar histórico médico:", error);
        }
        return [2 /*return*/];
      });
    });
  var handleEditHistory = (history) => {
    setEditingHistory(history);
    setNewHistory(history);
    setShowAddDialog(true);
  };
  var handleDeleteHistory = (historyId) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        if (confirm("Tem certeza que deseja excluir este item do histórico médico?")) {
          setHistories((prev) => prev.filter((h) => h.id !== historyId));
        }
        return [2 /*return*/];
      });
    });
  var getCategoryInfo = (category) =>
    MEDICAL_CATEGORIES.find((cat) => cat.value === category) ||
    MEDICAL_CATEGORIES[MEDICAL_CATEGORIES.length - 1];
  var getSeverityBadge = (severity) => {
    if (!severity) return null;
    var severityOption = SEVERITY_OPTIONS.find((opt) => opt.value === severity);
    return (
      <badge_1.Badge
        className={
          severityOption === null || severityOption === void 0 ? void 0 : severityOption.color
        }
      >
        {severityOption === null || severityOption === void 0 ? void 0 : severityOption.label}
      </badge_1.Badge>
    );
  };
  var getStatusBadge = (status) => {
    var statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return (
      <badge_1.Badge
        className={statusOption === null || statusOption === void 0 ? void 0 : statusOption.color}
      >
        <div className="flex items-center space-x-1">
          {statusOption === null || statusOption === void 0 ? void 0 : statusOption.icon}
          <span>
            {statusOption === null || statusOption === void 0 ? void 0 : statusOption.label}
          </span>
        </div>
      </badge_1.Badge>
    );
  };
  var getTimelineBadge = (history) => {
    if (history.status === "resolved" && history.resolutionDate) {
      return (
        <badge_1.Badge variant="outline" className="text-xs">
          <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
          Resolvido em{" "}
          {(0, date_fns_1.format)(history.resolutionDate, "MM/yyyy", { locale: locale_1.ptBR })}
        </badge_1.Badge>
      );
    }
    if (history.onsetDate) {
      var years = new Date().getFullYear() - history.onsetDate.getFullYear();
      return (
        <badge_1.Badge variant="outline" className="text-xs">
          <lucide_react_1.Clock className="w-3 h-3 mr-1" />
          {years > 0 ? "".concat(years, " ano").concat(years > 1 ? "s" : "") : "Recente"}
        </badge_1.Badge>
      );
    }
    return null;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico Médico</h2>
          <p className="text-gray-600">Condições médicas, alergias e histórico do paciente</p>
        </div>
        <dialog_1.Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button className="flex items-center space-x-2">
              <lucide_react_1.Plus className="w-4 h-4" />
              <span>Adicionar Histórico</span>
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>
                {editingHistory ? "Editar Histórico Médico" : "Novo Histórico Médico"}
              </dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                {editingHistory
                  ? "Edite as informações do histórico médico"
                  : "Adicione uma nova condição ao histórico médico do paciente"}
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="category">Categoria *</label_1.Label>
                  <select_1.Select
                    value={newHistory.category}
                    onValueChange={(value) =>
                      setNewHistory((prev) => __assign(__assign({}, prev), { category: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione a categoria" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {MEDICAL_CATEGORIES.map((category) => (
                        <select_1.SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            {category.icon}
                            <span>{category.label}</span>
                          </div>
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="status">Status *</label_1.Label>
                  <select_1.Select
                    value={newHistory.status}
                    onValueChange={(value) =>
                      setNewHistory((prev) => __assign(__assign({}, prev), { status: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione o status" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <select_1.SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            {status.icon}
                            <span>{status.label}</span>
                          </div>
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="conditionName">Nome da Condição *</label_1.Label>
                <input_1.Input
                  id="conditionName"
                  value={newHistory.conditionName || ""}
                  onChange={(e) =>
                    setNewHistory((prev) =>
                      __assign(__assign({}, prev), { conditionName: e.target.value }),
                    )
                  }
                  placeholder="Ex: Hipertensão Arterial, Diabetes Tipo 2"
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="description">Descrição</label_1.Label>
                <textarea_1.Textarea
                  id="description"
                  value={newHistory.description || ""}
                  onChange={(e) =>
                    setNewHistory((prev) =>
                      __assign(__assign({}, prev), { description: e.target.value }),
                    )
                  }
                  placeholder="Descrição detalhada da condição"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="severity">Gravidade</label_1.Label>
                  <select_1.Select
                    value={newHistory.severity || ""}
                    onValueChange={(value) =>
                      setNewHistory((prev) => __assign(__assign({}, prev), { severity: value }))
                    }
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione a gravidade" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {SEVERITY_OPTIONS.map((severity) => (
                        <select_1.SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="subcategory">Subcategoria</label_1.Label>
                  <input_1.Input
                    id="subcategory"
                    value={newHistory.subcategory || ""}
                    onChange={(e) =>
                      setNewHistory((prev) =>
                        __assign(__assign({}, prev), { subcategory: e.target.value }),
                      )
                    }
                    placeholder="Subcategoria específica"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="onsetDate">Data de Início</label_1.Label>
                  <input_1.Input
                    id="onsetDate"
                    type="date"
                    value={
                      newHistory.onsetDate
                        ? (0, date_fns_1.format)(newHistory.onsetDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      setNewHistory((prev) =>
                        __assign(__assign({}, prev), {
                          onsetDate: e.target.value ? new Date(e.target.value) : undefined,
                        }),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="resolutionDate">Data de Resolução</label_1.Label>
                  <input_1.Input
                    id="resolutionDate"
                    type="date"
                    value={
                      newHistory.resolutionDate
                        ? (0, date_fns_1.format)(newHistory.resolutionDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      setNewHistory((prev) =>
                        __assign(__assign({}, prev), {
                          resolutionDate: e.target.value ? new Date(e.target.value) : undefined,
                        }),
                      )
                    }
                    disabled={newHistory.status !== "resolved"}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <checkbox_1.Checkbox
                    id="isChronic"
                    checked={newHistory.isChronic}
                    onCheckedChange={(checked) =>
                      setNewHistory((prev) =>
                        __assign(__assign({}, prev), { isChronic: !!checked }),
                      )
                    }
                  />
                  <label_1.Label htmlFor="isChronic" className="flex items-center space-x-1">
                    <lucide_react_1.Clock className="w-4 h-4" />
                    <span>Condição Crônica</span>
                  </label_1.Label>
                </div>

                <div className="flex items-center space-x-2">
                  <checkbox_1.Checkbox
                    id="isHereditary"
                    checked={newHistory.isHereditary}
                    onCheckedChange={(checked) =>
                      setNewHistory((prev) =>
                        __assign(__assign({}, prev), { isHereditary: !!checked }),
                      )
                    }
                  />
                  <label_1.Label htmlFor="isHereditary" className="flex items-center space-x-1">
                    <lucide_react_1.History className="w-4 h-4" />
                    <span>Hereditária</span>
                  </label_1.Label>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="notes">Observações</label_1.Label>
                <textarea_1.Textarea
                  id="notes"
                  value={newHistory.notes || ""}
                  onChange={(e) =>
                    setNewHistory((prev) => __assign(__assign({}, prev), { notes: e.target.value }))
                  }
                  placeholder="Observações adicionais, medicamentos, tratamentos..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button_1.Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingHistory(null);
                    setNewHistory({
                      patientId: patientId,
                      clinicId: clinicId,
                      category: "",
                      conditionName: "",
                      status: "active",
                      isChronic: false,
                      isHereditary: false,
                      relatedRecords: [],
                      metadata: {},
                    });
                  }}
                >
                  Cancelar
                </button_1.Button>
                <button_1.Button
                  onClick={handleSaveHistory}
                  disabled={!newHistory.category || !newHistory.conditionName || !newHistory.status}
                >
                  {editingHistory ? "Atualizar" : "Adicionar"}
                </button_1.Button>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input_1.Input
                  placeholder="Buscar por condição, descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue placeholder="Categoria" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                  {MEDICAL_CATEGORIES.map((category) => (
                    <select_1.SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <select_1.SelectTrigger className="w-40">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <select_1.SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-2">
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* History List */}
      <div className="space-y-4">
        {isLoading
          ? <card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando histórico médico...</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          : filteredHistories.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="pt-6">
                  <div className="text-center py-8">
                    <lucide_react_1.Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                        ? "Nenhum histórico encontrado"
                        : "Nenhum histórico médico cadastrado"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Adicione condições médicas, alergias e outros itens do histórico"}
                    </p>
                    {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
                      <button_1.Button onClick={() => setShowAddDialog(true)}>
                        <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Histórico
                      </button_1.Button>
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            : filteredHistories.map((history) => {
                var categoryInfo = getCategoryInfo(history.category);
                return (
                  <card_1.Card key={history.id} className="hover:shadow-md transition-shadow">
                    <card_1.CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <badge_1.Badge className={categoryInfo.color}>
                              <div className="flex items-center space-x-1">
                                {categoryInfo.icon}
                                <span>{categoryInfo.label}</span>
                              </div>
                            </badge_1.Badge>
                            {getStatusBadge(history.status)}
                            {getSeverityBadge(history.severity)}
                            {getTimelineBadge(history)}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {history.conditionName}
                          </h3>

                          {history.description && (
                            <p className="text-gray-600 mb-2">{history.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {history.onsetDate && (
                              <span className="flex items-center space-x-1">
                                <lucide_react_1.Calendar className="w-4 h-4" />
                                <span>
                                  Início:{" "}
                                  {(0, date_fns_1.format)(history.onsetDate, "dd/MM/yyyy", {
                                    locale: locale_1.ptBR,
                                  })}
                                </span>
                              </span>
                            )}
                            {history.resolutionDate && (
                              <span className="flex items-center space-x-1">
                                <lucide_react_1.CheckCircle className="w-4 h-4" />
                                <span>
                                  Resolução:{" "}
                                  {(0, date_fns_1.format)(history.resolutionDate, "dd/MM/yyyy", {
                                    locale: locale_1.ptBR,
                                  })}
                                </span>
                              </span>
                            )}
                            {history.isChronic && (
                              <span className="flex items-center space-x-1">
                                <lucide_react_1.Clock className="w-4 h-4" />
                                <span>Crônica</span>
                              </span>
                            )}
                            {history.isHereditary && (
                              <span className="flex items-center space-x-1">
                                <lucide_react_1.History className="w-4 h-4" />
                                <span>Hereditária</span>
                              </span>
                            )}
                          </div>

                          {history.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Observações:</strong> {history.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditHistory(history)}
                          >
                            <lucide_react_1.Edit className="w-4 h-4" />
                          </button_1.Button>
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteHistory(history.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <lucide_react_1.Trash2 className="w-4 h-4" />
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
      </div>

      {/* Summary */}
      {filteredHistories.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.Activity className="w-5 h-5" />
              <span>Resumo do Histórico</span>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredHistories.length}</div>
                <div className="text-sm text-gray-600">Total de Condições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredHistories.filter((h) => h.status === "active").length}
                </div>
                <div className="text-sm text-gray-600">Condições Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredHistories.filter((h) => h.isChronic).length}
                </div>
                <div className="text-sm text-gray-600">Condições Crônicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredHistories.filter((h) => h.category === "allergies").length}
                </div>
                <div className="text-sm text-gray-600">Alergias</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
