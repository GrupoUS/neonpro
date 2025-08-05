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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordsForm = MedicalRecordsForm;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var RECORD_TYPES = [
  {
    value: "consultation",
    label: "Consulta",
    icon: <lucide_react_1.Stethoscope className="w-4 h-4" />,
  },
  {
    value: "diagnosis",
    label: "Diagnóstico",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  { value: "treatment", label: "Tratamento", icon: <lucide_react_1.Plus className="w-4 h-4" /> },
  {
    value: "prescription",
    label: "Prescrição",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  {
    value: "lab_result",
    label: "Resultado de Exame",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  { value: "imaging", label: "Imagem", icon: <lucide_react_1.FileImage className="w-4 h-4" /> },
  { value: "surgery", label: "Cirurgia", icon: <lucide_react_1.Plus className="w-4 h-4" /> },
  { value: "vaccination", label: "Vacinação", icon: <lucide_react_1.Shield className="w-4 h-4" /> },
  {
    value: "allergy",
    label: "Alergia",
    icon: <lucide_react_1.AlertTriangle className="w-4 h-4" />,
  },
  {
    value: "vital_signs",
    label: "Sinais Vitais",
    icon: <lucide_react_1.Stethoscope className="w-4 h-4" />,
  },
  {
    value: "progress_note",
    label: "Nota de Progresso",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  {
    value: "discharge_summary",
    label: "Resumo de Alta",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  {
    value: "referral",
    label: "Encaminhamento",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  {
    value: "emergency",
    label: "Emergência",
    icon: <lucide_react_1.AlertTriangle className="w-4 h-4" />,
  },
  {
    value: "follow_up",
    label: "Acompanhamento",
    icon: <lucide_react_1.Clock className="w-4 h-4" />,
  },
];
var STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho", color: "bg-gray-100 text-gray-800" },
  { value: "pending_review", label: "Aguardando Revisão", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewed", label: "Revisado", color: "bg-blue-100 text-blue-800" },
  { value: "approved", label: "Aprovado", color: "bg-green-100 text-green-800" },
  { value: "signed", label: "Assinado", color: "bg-purple-100 text-purple-800" },
  { value: "archived", label: "Arquivado", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" },
];
var PRIORITY_OPTIONS = [
  { value: 1, label: "Baixa", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: 3, label: "Alta", color: "bg-yellow-100 text-yellow-800" },
  { value: 4, label: "Urgente", color: "bg-orange-100 text-orange-800" },
  { value: 5, label: "Crítica", color: "bg-red-100 text-red-800" },
];
function MedicalRecordsForm(_a) {
  var _this = this;
  var _b, _c;
  var patientId = _a.patientId,
    clinicId = _a.clinicId,
    initialRecord = _a.initialRecord,
    onSave = _a.onSave,
    onCancel = _a.onCancel,
    _d = _a.mode,
    mode = _d === void 0 ? "create" : _d;
  var _e = (0, react_1.useState)(
      __assign(
        {
          clinicId: clinicId,
          patientId: patientId,
          recordType: "consultation",
          title: "",
          description: "",
          content: {},
          status: "draft",
          priority: 2,
          isConfidential: false,
          isEmergency: false,
          version: 1,
          tags: [],
          metadata: {},
        },
        initialRecord,
      ),
    ),
    record = _e[0],
    setRecord = _e[1];
  var _f = (0, react_1.useState)([]),
    attachments = _f[0],
    setAttachments = _f[1];
  var _g = (0, react_1.useState)(""),
    newTag = _g[0],
    setNewTag = _g[1];
  var _h = (0, react_1.useState)(false),
    isLoading = _h[0],
    setIsLoading = _h[1];
  var _j = (0, react_1.useState)({}),
    errors = _j[0],
    setErrors = _j[1];
  var _k = (0, react_1.useState)("basic"),
    activeTab = _k[0],
    setActiveTab = _k[1];
  var _l = (0, react_1.useState)(0),
    uploadProgress = _l[0],
    setUploadProgress = _l[1];
  var isReadOnly = mode === "view";
  var isEditing = mode === "edit";
  // Validation
  var validateForm = function () {
    var _a;
    var newErrors = {};
    if (!((_a = record.title) === null || _a === void 0 ? void 0 : _a.trim())) {
      newErrors.title = "Título é obrigatório";
    }
    if (!record.recordType) {
      newErrors.recordType = "Tipo de registro é obrigatório";
    }
    if (record.priority && (record.priority < 1 || record.priority > 5)) {
      newErrors.priority = "Prioridade deve estar entre 1 e 5";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle form submission
  var handleSubmit = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var recordData;
      return __generator(this, function (_a) {
        e.preventDefault();
        if (!validateForm()) {
          return [2 /*return*/];
        }
        setIsLoading(true);
        try {
          recordData = {
            id: record.id || crypto.randomUUID(),
            clinicId: record.clinicId,
            patientId: record.patientId,
            doctorId: record.doctorId,
            recordType: record.recordType,
            title: record.title,
            description: record.description,
            content: record.content || {},
            status: record.status,
            priority: record.priority || 2,
            isConfidential: record.isConfidential || false,
            isEmergency: record.isEmergency || false,
            appointmentId: record.appointmentId,
            parentRecordId: record.parentRecordId,
            version: record.version || 1,
            tags: record.tags || [],
            metadata: record.metadata || {},
            createdBy: record.createdBy || "current-user",
            createdAt: record.createdAt || new Date(),
            updatedAt: new Date(),
            signedAt: record.signedAt,
            signedBy: record.signedBy,
          };
          onSave === null || onSave === void 0 ? void 0 : onSave(recordData);
        } catch (error) {
          console.error("Erro ao salvar registro médico:", error);
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  // Handle tag addition
  var handleAddTag = function () {
    var _a;
    if (
      newTag.trim() &&
      !((_a = record.tags) === null || _a === void 0 ? void 0 : _a.includes(newTag.trim()))
    ) {
      setRecord(function (prev) {
        return __assign(__assign({}, prev), {
          tags: __spreadArray(__spreadArray([], prev.tags || [], true), [newTag.trim()], false),
        });
      });
      setNewTag("");
    }
  };
  // Handle tag removal
  var handleRemoveTag = function (tagToRemove) {
    setRecord(function (prev) {
      var _a;
      return __assign(__assign({}, prev), {
        tags:
          ((_a = prev.tags) === null || _a === void 0
            ? void 0
            : _a.filter(function (tag) {
                return tag !== tagToRemove;
              })) || [],
      });
    });
  };
  // Handle file upload
  var handleFileUpload = function (files) {
    return __awaiter(_this, void 0, void 0, function () {
      var _loop_1, i;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setUploadProgress(0);
            _loop_1 = function (i) {
              var file, progress, attachment;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    file = files[i];
                    progress = 0;
                    _b.label = 1;
                  case 1:
                    if (!(progress <= 100)) return [3 /*break*/, 4];
                    setUploadProgress(progress);
                    return [
                      4 /*yield*/,
                      new Promise(function (resolve) {
                        return setTimeout(resolve, 100);
                      }),
                    ];
                  case 2:
                    _b.sent();
                    _b.label = 3;
                  case 3:
                    progress += 10;
                    return [3 /*break*/, 1];
                  case 4:
                    attachment = {
                      id: crypto.randomUUID(),
                      recordId: record.id,
                      patientId: record.patientId,
                      clinicId: record.clinicId,
                      category: "document",
                      fileName: "".concat(Date.now(), "_").concat(file.name),
                      originalName: file.name,
                      filePath: "/uploads/medical/"
                        .concat(record.patientId, "/")
                        .concat(Date.now(), "_")
                        .concat(file.name),
                      fileSize: file.size,
                      mimeType: file.type,
                      description: "",
                      isSensitive: false,
                      accessLevel: "internal",
                      metadata: {},
                      uploadedBy: "current-user",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    setAttachments(function (prev) {
                      return __spreadArray(__spreadArray([], prev, true), [attachment], false);
                    });
                    return [2 /*return*/];
                }
              });
            };
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < files.length)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(i)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            i++;
            return [3 /*break*/, 1];
          case 4:
            setUploadProgress(0);
            return [2 /*return*/];
        }
      });
    });
  };
  var getStatusBadge = function (status) {
    var statusOption = STATUS_OPTIONS.find(function (opt) {
      return opt.value === status;
    });
    return (
      <badge_1.Badge
        className={statusOption === null || statusOption === void 0 ? void 0 : statusOption.color}
      >
        {statusOption === null || statusOption === void 0 ? void 0 : statusOption.label}
      </badge_1.Badge>
    );
  };
  var getPriorityBadge = function (priority) {
    var priorityOption = PRIORITY_OPTIONS.find(function (opt) {
      return opt.value === priority;
    });
    return (
      <badge_1.Badge
        className={
          priorityOption === null || priorityOption === void 0 ? void 0 : priorityOption.color
        }
      >
        {priorityOption === null || priorityOption === void 0 ? void 0 : priorityOption.label}
      </badge_1.Badge>
    );
  };
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create"
              ? "Novo Registro Médico"
              : mode === "edit"
                ? "Editar Registro Médico"
                : "Visualizar Registro Médico"}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === "create"
              ? "Criar um novo registro médico para o paciente"
              : mode === "edit"
                ? "Editar informações do registro médico"
                : "Visualizar detalhes do registro médico"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {record.status && getStatusBadge(record.status)}
          {record.priority && getPriorityBadge(record.priority)}
          {record.isEmergency && (
            <badge_1.Badge className="bg-red-100 text-red-800">
              <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1" />
              Emergência
            </badge_1.Badge>
          )}
          {record.isConfidential && (
            <badge_1.Badge className="bg-purple-100 text-purple-800">
              <lucide_react_1.Shield className="w-3 h-3 mr-1" />
              Confidencial
            </badge_1.Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-4">
            <tabs_1.TabsTrigger value="basic">Informações Básicas</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="content">Conteúdo</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="attachments">Anexos</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="metadata">Metadados</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="basic" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.FileText className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Informações principais do registro médico
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="recordType">Tipo de Registro *</label_1.Label>
                    <select_1.Select
                      value={record.recordType}
                      onValueChange={function (value) {
                        return setRecord(function (prev) {
                          return __assign(__assign({}, prev), { recordType: value });
                        });
                      }}
                      disabled={isReadOnly}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o tipo" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {RECORD_TYPES.map(function (type) {
                          return (
                            <select_1.SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                {type.icon}
                                <span>{type.label}</span>
                              </div>
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    {errors.recordType && (
                      <p className="text-sm text-red-600">{errors.recordType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="status">Status</label_1.Label>
                    <select_1.Select
                      value={record.status}
                      onValueChange={function (value) {
                        return setRecord(function (prev) {
                          return __assign(__assign({}, prev), { status: value });
                        });
                      }}
                      disabled={isReadOnly}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o status" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {STATUS_OPTIONS.map(function (status) {
                          return (
                            <select_1.SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="title">Título *</label_1.Label>
                  <input_1.Input
                    id="title"
                    value={record.title || ""}
                    onChange={function (e) {
                      return setRecord(function (prev) {
                        return __assign(__assign({}, prev), { title: e.target.value });
                      });
                    }}
                    placeholder="Digite o título do registro"
                    disabled={isReadOnly}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="description">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="description"
                    value={record.description || ""}
                    onChange={function (e) {
                      return setRecord(function (prev) {
                        return __assign(__assign({}, prev), { description: e.target.value });
                      });
                    }}
                    placeholder="Digite uma descrição detalhada"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="priority">Prioridade</label_1.Label>
                    <select_1.Select
                      value={
                        (_b = record.priority) === null || _b === void 0 ? void 0 : _b.toString()
                      }
                      onValueChange={function (value) {
                        return setRecord(function (prev) {
                          return __assign(__assign({}, prev), { priority: parseInt(value) });
                        });
                      }}
                      disabled={isReadOnly}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {PRIORITY_OPTIONS.map(function (priority) {
                          return (
                            <select_1.SelectItem
                              key={priority.value}
                              value={priority.value.toString()}
                            >
                              {priority.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <checkbox_1.Checkbox
                      id="isConfidential"
                      checked={record.isConfidential}
                      onCheckedChange={function (checked) {
                        return setRecord(function (prev) {
                          return __assign(__assign({}, prev), { isConfidential: !!checked });
                        });
                      }}
                      disabled={isReadOnly}
                    />
                    <label_1.Label htmlFor="isConfidential" className="flex items-center space-x-1">
                      <lucide_react_1.Shield className="w-4 h-4" />
                      <span>Confidencial</span>
                    </label_1.Label>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <checkbox_1.Checkbox
                      id="isEmergency"
                      checked={record.isEmergency}
                      onCheckedChange={function (checked) {
                        return setRecord(function (prev) {
                          return __assign(__assign({}, prev), { isEmergency: !!checked });
                        });
                      }}
                      disabled={isReadOnly}
                    />
                    <label_1.Label htmlFor="isEmergency" className="flex items-center space-x-1">
                      <lucide_react_1.AlertTriangle className="w-4 h-4" />
                      <span>Emergência</span>
                    </label_1.Label>
                  </div>
                </div>

                <separator_1.Separator />

                <div className="space-y-2">
                  <label_1.Label>Tags</label_1.Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(_c = record.tags) === null || _c === void 0
                      ? void 0
                      : _c.map(function (tag, index) {
                          return (
                            <badge_1.Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <lucide_react_1.Tag className="w-3 h-3" />
                              <span>{tag}</span>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={function () {
                                    return handleRemoveTag(tag);
                                  }}
                                  className="ml-1 hover:text-red-600"
                                >
                                  ×
                                </button>
                              )}
                            </badge_1.Badge>
                          );
                        })}
                  </div>
                  {!isReadOnly && (
                    <div className="flex space-x-2">
                      <input_1.Input
                        value={newTag}
                        onChange={function (e) {
                          return setNewTag(e.target.value);
                        }}
                        placeholder="Nova tag"
                        onKeyPress={function (e) {
                          return e.key === "Enter" && (e.preventDefault(), handleAddTag());
                        }}
                      />
                      <button_1.Button type="button" onClick={handleAddTag} variant="outline">
                        <lucide_react_1.Plus className="w-4 h-4" />
                      </button_1.Button>
                    </div>
                  )}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="content" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.FileText className="w-5 h-5" />
                  <span>Conteúdo do Registro</span>
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Conteúdo detalhado e estruturado do registro médico
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <textarea_1.Textarea
                  value={JSON.stringify(record.content, null, 2)}
                  onChange={function (e) {
                    try {
                      var content_1 = JSON.parse(e.target.value);
                      setRecord(function (prev) {
                        return __assign(__assign({}, prev), { content: content_1 });
                      });
                    } catch (_a) {
                      // Invalid JSON, keep as string for now
                    }
                  }}
                  placeholder="Conteúdo em formato JSON"
                  rows={15}
                  className="font-mono text-sm"
                  disabled={isReadOnly}
                />
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="attachments" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.Paperclip className="w-5 h-5" />
                  <span>Anexos</span>
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Documentos, imagens e outros arquivos relacionados
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {!isReadOnly && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={function (e) {
                        return e.target.files && handleFileUpload(e.target.files);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <lucide_react_1.Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Clique para fazer upload ou arraste arquivos aqui
                      </p>
                    </label>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <progress_1.Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">
                          Upload em progresso: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {attachments.map(function (attachment) {
                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <lucide_react_1.FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{attachment.originalName}</p>
                            <p className="text-sm text-gray-600">
                              {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                              {attachment.mimeType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4" />
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Download className="w-4 h-4" />
                          </button_1.Button>
                          {!isReadOnly && (
                            <button_1.Button variant="outline" size="sm" className="text-red-600">
                              <lucide_react_1.Trash2 className="w-4 h-4" />
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

          <tabs_1.TabsContent value="metadata" className="space-y-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center space-x-2">
                  <lucide_react_1.History className="w-5 h-5" />
                  <span>Metadados e Auditoria</span>
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Informações de auditoria e metadados do registro
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label>Versão</label_1.Label>
                    <input_1.Input value={record.version || 1} disabled />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Criado em</label_1.Label>
                    <input_1.Input
                      value={
                        record.createdAt
                          ? (0, date_fns_1.format)(record.createdAt, "dd/MM/yyyy HH:mm", {
                              locale: locale_1.ptBR,
                            })
                          : ""
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Atualizado em</label_1.Label>
                    <input_1.Input
                      value={
                        record.updatedAt
                          ? (0, date_fns_1.format)(record.updatedAt, "dd/MM/yyyy HH:mm", {
                              locale: locale_1.ptBR,
                            })
                          : ""
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Assinado em</label_1.Label>
                    <input_1.Input
                      value={
                        record.signedAt
                          ? (0, date_fns_1.format)(record.signedAt, "dd/MM/yyyy HH:mm", {
                              locale: locale_1.ptBR,
                            })
                          : "Não assinado"
                      }
                      disabled
                    />
                  </div>
                </div>

                <separator_1.Separator />

                <div className="space-y-2">
                  <label_1.Label>Metadados (JSON)</label_1.Label>
                  <textarea_1.Textarea
                    value={JSON.stringify(record.metadata, null, 2)}
                    onChange={function (e) {
                      try {
                        var metadata_1 = JSON.parse(e.target.value);
                        setRecord(function (prev) {
                          return __assign(__assign({}, prev), { metadata: metadata_1 });
                        });
                      } catch (_a) {
                        // Invalid JSON, keep as string for now
                      }
                    }}
                    placeholder="Metadados em formato JSON"
                    rows={8}
                    className="font-mono text-sm"
                    disabled={isReadOnly}
                  />
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {!isReadOnly && (
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button_1.Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <lucide_react_1.Save className="w-4 h-4" />
              <span>{isLoading ? "Salvando..." : "Salvar Registro"}</span>
            </button_1.Button>
          </div>
        )}
      </form>

      {record.signedAt && (
        <alert_1.Alert>
          <lucide_react_1.Signature className="w-4 h-4" />
          <alert_1.AlertDescription>
            Este registro foi assinado digitalmente em{" "}
            {(0, date_fns_1.format)(record.signedAt, "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR })}
            {record.signedBy && " por ".concat(record.signedBy)}.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}
    </div>
  );
}
