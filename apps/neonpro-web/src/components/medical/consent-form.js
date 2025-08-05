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
exports.ConsentForm = ConsentForm;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var checkbox_1 = require("@/components/ui/checkbox");
var radio_group_1 = require("@/components/ui/radio-group");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var FORM_TYPES = [
  {
    value: "treatment_consent",
    label: "Consentimento de Tratamento",
    icon: <lucide_react_1.Stethoscope className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
    description: "Autorização para procedimentos médicos",
  },
  {
    value: "data_processing",
    label: "Processamento de Dados",
    icon: <lucide_react_1.Database className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
    description: "Consentimento LGPD para dados pessoais",
  },
  {
    value: "research_participation",
    label: "Participação em Pesquisa",
    icon: <lucide_react_1.Microscope className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
    description: "Autorização para estudos clínicos",
  },
  {
    value: "image_recording",
    label: "Gravação de Imagens",
    icon: <lucide_react_1.Camera className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800",
    description: "Autorização para fotos e vídeos",
  },
  {
    value: "telemedicine",
    label: "Telemedicina",
    icon: <lucide_react_1.Video className="w-4 h-4" />,
    color: "bg-indigo-100 text-indigo-800",
    description: "Consentimento para consultas remotas",
  },
  {
    value: "emergency_contact",
    label: "Contato de Emergência",
    icon: <lucide_react_1.Phone className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
    description: "Autorização para contatos de emergência",
  },
];
var FIELD_TYPES = [
  { value: "text", label: "Texto", icon: <lucide_react_1.FileText className="w-4 h-4" /> },
  {
    value: "textarea",
    label: "Texto Longo",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
  { value: "select", label: "Seleção", icon: <lucide_react_1.Filter className="w-4 h-4" /> },
  {
    value: "radio",
    label: "Opção Única",
    icon: <lucide_react_1.CheckCircle className="w-4 h-4" />,
  },
  {
    value: "checkbox",
    label: "Múltipla Escolha",
    icon: <lucide_react_1.CheckCircle className="w-4 h-4" />,
  },
  { value: "date", label: "Data", icon: <lucide_react_1.Calendar className="w-4 h-4" /> },
  { value: "email", label: "Email", icon: <lucide_react_1.Mail className="w-4 h-4" /> },
  { value: "phone", label: "Telefone", icon: <lucide_react_1.Phone className="w-4 h-4" /> },
  { value: "number", label: "Número", icon: <lucide_react_1.Hash className="w-4 h-4" /> },
  { value: "signature", label: "Assinatura", icon: <lucide_react_1.Edit className="w-4 h-4" /> },
  { value: "consent", label: "Consentimento", icon: <lucide_react_1.Shield className="w-4 h-4" /> },
];
var DATA_CATEGORIES = [
  {
    value: "personal_data",
    label: "Dados Pessoais",
    icon: <lucide_react_1.User className="w-4 h-4" />,
  },
  {
    value: "health_data",
    label: "Dados de Saúde",
    icon: <lucide_react_1.Heart className="w-4 h-4" />,
  },
  {
    value: "biometric_data",
    label: "Dados Biométricos",
    icon: <lucide_react_1.Fingerprint className="w-4 h-4" />,
  },
  {
    value: "genetic_data",
    label: "Dados Genéticos",
    icon: <lucide_react_1.Brain className="w-4 h-4" />,
  },
  {
    value: "location_data",
    label: "Dados de Localização",
    icon: <lucide_react_1.MapPin className="w-4 h-4" />,
  },
  {
    value: "contact_data",
    label: "Dados de Contato",
    icon: <lucide_react_1.Phone className="w-4 h-4" />,
  },
  {
    value: "financial_data",
    label: "Dados Financeiros",
    icon: <lucide_react_1.DollarSign className="w-4 h-4" />,
  },
  {
    value: "behavioral_data",
    label: "Dados Comportamentais",
    icon: <lucide_react_1.Activity className="w-4 h-4" />,
  },
];
var LEGAL_BASIS_TYPES = [
  {
    value: "consent",
    label: "Consentimento",
    icon: <lucide_react_1.CheckCircle className="w-4 h-4" />,
    article: "Art. 7º, I",
    description: "Mediante consentimento do titular",
  },
  {
    value: "legal_obligation",
    label: "Obrigação Legal",
    icon: <lucide_react_1.Gavel className="w-4 h-4" />,
    article: "Art. 7º, II",
    description: "Para cumprimento de obrigação legal",
  },
  {
    value: "public_interest",
    label: "Interesse Público",
    icon: <lucide_react_1.Users className="w-4 h-4" />,
    article: "Art. 7º, III",
    description: "Para execução de políticas públicas",
  },
  {
    value: "vital_interests",
    label: "Proteção da Vida",
    icon: <lucide_react_1.Heart className="w-4 h-4" />,
    article: "Art. 7º, IV",
    description: "Para proteção da vida ou incolumidade física",
  },
  {
    value: "legitimate_interest",
    label: "Interesse Legítimo",
    icon: <lucide_react_1.Scale className="w-4 h-4" />,
    article: "Art. 7º, IX",
    description: "Para atender interesses legítimos",
  },
  {
    value: "health_protection",
    label: "Proteção da Saúde",
    icon: <lucide_react_1.Shield className="w-4 h-4" />,
    article: "Art. 11, II",
    description: "Para proteção da saúde (dados sensíveis)",
  },
];
var CONSENT_METHODS = [
  {
    value: "digital_signature",
    label: "Assinatura Digital",
    icon: <lucide_react_1.Edit className="w-4 h-4" />,
  },
  {
    value: "electronic_consent",
    label: "Consentimento Eletrônico",
    icon: <lucide_react_1.Smartphone className="w-4 h-4" />,
  },
  {
    value: "verbal_consent",
    label: "Consentimento Verbal",
    icon: <lucide_react_1.Mic className="w-4 h-4" />,
  },
  {
    value: "written_consent",
    label: "Consentimento Escrito",
    icon: <lucide_react_1.FileText className="w-4 h-4" />,
  },
];
function ConsentForm(_a) {
  var _this = this;
  var patientId = _a.patientId,
    clinicId = _a.clinicId,
    formId = _a.formId,
    _b = _a.mode,
    mode = _b === void 0 ? "view" : _b,
    onSubmit = _a.onSubmit,
    onSave = _a.onSave,
    _c = _a.allowWithdrawal,
    allowWithdrawal = _c === void 0 ? true : _c,
    _d = _a.requireDigitalSignature,
    requireDigitalSignature = _d === void 0 ? false : _d;
  var _e = (0, react_1.useState)([]),
    forms = _e[0],
    setForms = _e[1];
  var _f = (0, react_1.useState)([]),
    responses = _f[0],
    setResponses = _f[1];
  var _g = (0, react_1.useState)(null),
    currentForm = _g[0],
    setCurrentForm = _g[1];
  var _h = (0, react_1.useState)(null),
    currentResponse = _h[0],
    setCurrentResponse = _h[1];
  var _j = (0, react_1.useState)(false),
    isLoading = _j[0],
    setIsLoading = _j[1];
  var _k = (0, react_1.useState)(false),
    showFormBuilder = _k[0],
    setShowFormBuilder = _k[1];
  var _l = (0, react_1.useState)({}),
    formData = _l[0],
    setFormData = _l[1];
  var _m = (0, react_1.useState)({}),
    validationErrors = _m[0],
    setValidationErrors = _m[1];
  var _o = (0, react_1.useState)(""),
    searchTerm = _o[0],
    setSearchTerm = _o[1];
  var _p = (0, react_1.useState)(""),
    filterType = _p[0],
    setFilterType = _p[1];
  var _q = (0, react_1.useState)("forms"),
    selectedTab = _q[0],
    setSelectedTab = _q[1];
  // Form builder state
  var _r = (0, react_1.useState)({
      title: "",
      description: "",
      type: "",
      category: "medical",
      isActive: true,
      isRequired: false,
      content: {
        sections: [],
        fields: [],
        validationRules: [],
        styling: {},
      },
      legalBasis: [],
      dataCategories: [],
      retentionPeriod: 5,
      metadata: {},
    }),
    newForm = _r[0],
    setNewForm = _r[1];
  var _s = (0, react_1.useState)({
      title: "",
      description: "",
      isRequired: false,
    }),
    newSection = _s[0],
    setNewSection = _s[1];
  var _t = (0, react_1.useState)({
      name: "",
      label: "",
      type: "text",
      isRequired: false,
      placeholder: "",
      helpText: "",
      options: [],
      sectionId: "",
    }),
    newField = _t[0],
    setNewField = _t[1];
  var _u = (0, react_1.useState)({
      value: "",
      label: "",
      description: "",
    }),
    newOption = _u[0],
    setNewOption = _u[1];
  // Load forms and responses
  (0, react_1.useEffect)(
    function () {
      loadForms();
      loadResponses();
      if (formId) {
        loadForm(formId);
      }
    },
    [formId, patientId],
  );
  var loadForms = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockForms;
      return __generator(this, function (_a) {
        try {
          mockForms = [
            {
              id: "1",
              title: "Termo de Consentimento para Tratamento Médico",
              description: "Autorização para realização de procedimentos médicos e tratamentos",
              version: "1.0",
              type: "treatment_consent",
              category: "medical",
              isActive: true,
              isRequired: true,
              content: {
                sections: [
                  {
                    id: "section1",
                    title: "Informações do Paciente",
                    description: "Dados pessoais do paciente",
                    order: 1,
                    isRequired: true,
                    fields: ["patient_name", "patient_cpf", "patient_birth"],
                  },
                  {
                    id: "section2",
                    title: "Consentimento para Tratamento",
                    description: "Autorização para procedimentos médicos",
                    order: 2,
                    isRequired: true,
                    fields: ["treatment_consent", "emergency_consent"],
                  },
                ],
                fields: [
                  {
                    id: "patient_name",
                    name: "patient_name",
                    label: "Nome Completo",
                    type: "text",
                    isRequired: true,
                    placeholder: "Digite seu nome completo",
                    helpText: "Nome conforme documento de identidade",
                    order: 1,
                    sectionId: "section1",
                    metadata: {},
                  },
                  {
                    id: "patient_cpf",
                    name: "patient_cpf",
                    label: "CPF",
                    type: "text",
                    isRequired: true,
                    placeholder: "000.000.000-00",
                    helpText: "Documento de identificação",
                    order: 2,
                    sectionId: "section1",
                    metadata: {},
                  },
                  {
                    id: "treatment_consent",
                    name: "treatment_consent",
                    label: "Consentimento para Tratamento",
                    type: "consent",
                    isRequired: true,
                    helpText: "Autorizo a realização dos procedimentos médicos necessários",
                    order: 3,
                    sectionId: "section2",
                    metadata: {},
                  },
                ],
                validationRules: [],
                styling: {},
              },
              legalBasis: [
                {
                  type: "consent",
                  description: "Consentimento do titular para tratamento médico",
                  article: "Art. 7º, I da LGPD",
                  isRequired: true,
                },
              ],
              dataCategories: ["personal_data", "health_data"],
              retentionPeriod: 20,
              createdAt: new Date("2024-01-01"),
              updatedAt: new Date("2024-01-01"),
              createdBy: "admin",
              approvedBy: "dr-silva",
              approvedAt: new Date("2024-01-01"),
              metadata: {},
            },
          ];
          setForms(mockForms);
        } catch (error) {
          console.error("Erro ao carregar formulários:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var loadResponses = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockResponses;
      return __generator(this, function (_a) {
        try {
          mockResponses = [
            {
              id: "1",
              formId: "1",
              patientId: patientId,
              responses: {
                patient_name: "Maria Santos",
                patient_cpf: "123.456.789-00",
                treatment_consent: true,
              },
              consentGiven: true,
              consentMethod: "digital_signature",
              ipAddress: "192.168.1.100",
              userAgent: "Mozilla/5.0...",
              timestamp: new Date("2024-01-15T10:30:00"),
              isActive: true,
              digitalSignatureId: "sig_123456",
              metadata: {},
            },
          ];
          setResponses(mockResponses);
        } catch (error) {
          console.error("Erro ao carregar respostas:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var loadForm = function (id) {
    return __awaiter(_this, void 0, void 0, function () {
      var form, initialData_1;
      return __generator(this, function (_a) {
        form = forms.find(function (f) {
          return f.id === id;
        });
        if (form) {
          setCurrentForm(form);
          initialData_1 = {};
          form.content.fields.forEach(function (field) {
            if (field.defaultValue !== undefined) {
              initialData_1[field.name] = field.defaultValue;
            }
          });
          setFormData(initialData_1);
        }
        return [2 /*return*/];
      });
    });
  };
  var validateField = function (field, value) {
    if (field.isRequired && (!value || value === "")) {
      return "".concat(field.label, " \u00E9 obrigat\u00F3rio");
    }
    if (field.validation) {
      for (var _i = 0, _a = field.validation; _i < _a.length; _i++) {
        var rule = _a[_i];
        if (!rule.isActive) continue;
        switch (rule.type) {
          case "minLength":
            if (value && value.length < rule.value) {
              return rule.message;
            }
            break;
          case "maxLength":
            if (value && value.length > rule.value) {
              return rule.message;
            }
            break;
          case "pattern":
            if (value && !new RegExp(rule.value).test(value)) {
              return rule.message;
            }
            break;
          case "email":
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return rule.message;
            }
            break;
          case "cpf":
            if (value && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
              return rule.message;
            }
            break;
        }
      }
    }
    return null;
  };
  var validateForm = function () {
    if (!currentForm) return false;
    var errors = {};
    var isValid = true;
    currentForm.content.fields.forEach(function (field) {
      var error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });
    setValidationErrors(errors);
    return isValid;
  };
  var handleFieldChange = function (fieldName, value) {
    setFormData(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[fieldName] = value), _a));
    });
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(function (prev) {
        var newErrors = __assign({}, prev);
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };
  var handleSubmit = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response_1;
      return __generator(this, function (_a) {
        if (!currentForm || !validateForm()) return [2 /*return*/];
        setIsLoading(true);
        try {
          response_1 = {
            id: crypto.randomUUID(),
            formId: currentForm.id,
            patientId: patientId,
            responses: formData,
            consentGiven: true,
            consentMethod: requireDigitalSignature ? "digital_signature" : "electronic_consent",
            ipAddress: "192.168.1.100",
            userAgent: navigator.userAgent,
            timestamp: new Date(),
            isActive: true,
            metadata: {
              formVersion: currentForm.version,
              clinicId: clinicId,
            },
          };
          setResponses(function (prev) {
            return __spreadArray(__spreadArray([], prev, true), [response_1], false);
          });
          setCurrentResponse(response_1);
          onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(response_1);
          // Reset form
          setFormData({});
          setValidationErrors({});
        } catch (error) {
          console.error("Erro ao enviar formulário:", error);
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var withdrawConsent = function (responseId, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          setResponses(function (prev) {
            return prev.map(function (response) {
              return response.id === responseId
                ? __assign(__assign({}, response), {
                    isActive: false,
                    withdrawnAt: new Date(),
                    withdrawalReason: reason,
                  })
                : response;
            });
          });
        } catch (error) {
          console.error("Erro ao retirar consentimento:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var addSection = function () {
    var _a;
    if (!newSection.title) return;
    var section = {
      id: crypto.randomUUID(),
      title: newSection.title,
      description: newSection.description,
      order:
        (((_a = newForm.content) === null || _a === void 0 ? void 0 : _a.sections.length) || 0) + 1,
      isRequired: newSection.isRequired,
      fields: [],
    };
    setNewForm(function (prev) {
      var _a;
      return __assign(__assign({}, prev), {
        content: __assign(__assign({}, prev.content), {
          sections: __spreadArray(
            __spreadArray(
              [],
              ((_a = prev.content) === null || _a === void 0 ? void 0 : _a.sections) || [],
              true,
            ),
            [section],
            false,
          ),
        }),
      });
    });
    setNewSection({ title: "", description: "", isRequired: false });
  };
  var addField = function () {
    var _a;
    if (!newField.name || !newField.label || !newField.sectionId) return;
    var field = {
      id: crypto.randomUUID(),
      name: newField.name,
      label: newField.label,
      type: newField.type,
      isRequired: newField.isRequired,
      placeholder: newField.placeholder,
      helpText: newField.helpText,
      options: newField.options,
      order:
        (((_a = newForm.content) === null || _a === void 0 ? void 0 : _a.fields.length) || 0) + 1,
      sectionId: newField.sectionId,
      metadata: {},
    };
    setNewForm(function (prev) {
      var _a;
      return __assign(__assign({}, prev), {
        content: __assign(__assign({}, prev.content), {
          fields: __spreadArray(
            __spreadArray(
              [],
              ((_a = prev.content) === null || _a === void 0 ? void 0 : _a.fields) || [],
              true,
            ),
            [field],
            false,
          ),
        }),
      });
    });
    // Add field to section
    setNewForm(function (prev) {
      return __assign(__assign({}, prev), {
        content: __assign(__assign({}, prev.content), {
          sections: prev.content.sections.map(function (section) {
            return section.id === newField.sectionId
              ? __assign(__assign({}, section), {
                  fields: __spreadArray(__spreadArray([], section.fields, true), [field.id], false),
                })
              : section;
          }),
        }),
      });
    });
    setNewField({
      name: "",
      label: "",
      type: "text",
      isRequired: false,
      placeholder: "",
      helpText: "",
      options: [],
      sectionId: "",
    });
  };
  var addOption = function () {
    if (!newOption.value || !newOption.label) return;
    var option = {
      value: newOption.value,
      label: newOption.label,
      description: newOption.description,
    };
    setNewField(function (prev) {
      return __assign(__assign({}, prev), {
        options: __spreadArray(__spreadArray([], prev.options, true), [option], false),
      });
    });
    setNewOption({ value: "", label: "", description: "" });
  };
  var saveForm = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var form_1;
      return __generator(this, function (_a) {
        if (!newForm.title || !newForm.type) return [2 /*return*/];
        try {
          form_1 = {
            id: crypto.randomUUID(),
            title: newForm.title,
            description: newForm.description,
            version: "1.0",
            type: newForm.type,
            category: newForm.category,
            isActive: newForm.isActive,
            isRequired: newForm.isRequired,
            content: newForm.content,
            legalBasis: newForm.legalBasis,
            dataCategories: newForm.dataCategories,
            retentionPeriod: newForm.retentionPeriod,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "current-user",
            metadata: newForm.metadata,
          };
          setForms(function (prev) {
            return __spreadArray(__spreadArray([], prev, true), [form_1], false);
          });
          onSave === null || onSave === void 0 ? void 0 : onSave(form_1);
          setShowFormBuilder(false);
          setNewForm({
            title: "",
            description: "",
            type: "",
            category: "medical",
            isActive: true,
            isRequired: false,
            content: {
              sections: [],
              fields: [],
              validationRules: [],
              styling: {},
            },
            legalBasis: [],
            dataCategories: [],
            retentionPeriod: 5,
            metadata: {},
          });
        } catch (error) {
          console.error("Erro ao salvar formulário:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var renderField = function (field) {
    var _a, _b;
    var value = formData[field.name] || "";
    var error = validationErrors[field.name];
    var baseProps = {
      id: field.name,
      value: value,
      onChange: function (e) {
        return handleFieldChange(field.name, e.target ? e.target.value : e);
      },
      placeholder: field.placeholder,
      className: error ? "border-red-500" : "",
    };
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return <input_1.Input {...baseProps} type={field.type === "number" ? "number" : "text"} />;
      case "textarea":
        return <textarea_1.Textarea {...baseProps} rows={3} />;
      case "date":
        return <input_1.Input {...baseProps} type="date" />;
      case "select":
        return (
          <select_1.Select
            value={value}
            onValueChange={function (val) {
              return handleFieldChange(field.name, val);
            }}
          >
            <select_1.SelectTrigger className={error ? "border-red-500" : ""}>
              <select_1.SelectValue placeholder={field.placeholder} />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {(_a = field.options) === null || _a === void 0
                ? void 0
                : _a.map(function (option) {
                    return (
                      <select_1.SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </select_1.SelectItem>
                    );
                  })}
            </select_1.SelectContent>
          </select_1.Select>
        );
      case "radio":
        return (
          <radio_group_1.RadioGroup
            value={value}
            onValueChange={function (val) {
              return handleFieldChange(field.name, val);
            }}
          >
            {(_b = field.options) === null || _b === void 0
              ? void 0
              : _b.map(function (option) {
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <radio_group_1.RadioGroupItem
                        value={option.value}
                        id={"".concat(field.name, "_").concat(option.value)}
                      />
                      <label_1.Label htmlFor={"".concat(field.name, "_").concat(option.value)}>
                        {option.label}
                      </label_1.Label>
                    </div>
                  );
                })}
          </radio_group_1.RadioGroup>
        );
      case "checkbox":
        if (field.options && field.options.length > 1) {
          // Multiple checkboxes
          var selectedValues_1 = Array.isArray(value) ? value : [];
          return (
            <div className="space-y-2">
              {field.options.map(function (option) {
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id={"".concat(field.name, "_").concat(option.value)}
                      checked={selectedValues_1.includes(option.value)}
                      onCheckedChange={function (checked) {
                        var newValues = checked
                          ? __spreadArray(
                              __spreadArray([], selectedValues_1, true),
                              [option.value],
                              false,
                            )
                          : selectedValues_1.filter(function (v) {
                              return v !== option.value;
                            });
                        handleFieldChange(field.name, newValues);
                      }}
                    />
                    <label_1.Label htmlFor={"".concat(field.name, "_").concat(option.value)}>
                      {option.label}
                    </label_1.Label>
                  </div>
                );
              })}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <checkbox_1.Checkbox
                id={field.name}
                checked={!!value}
                onCheckedChange={function (checked) {
                  return handleFieldChange(field.name, checked);
                }}
              />
              <label_1.Label htmlFor={field.name}>{field.label}</label_1.Label>
            </div>
          );
        }
      case "consent":
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-start space-x-3">
                <lucide_react_1.Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Consentimento Necessário</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {field.helpText || "Sua autorização é necessária para prosseguir."}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <checkbox_1.Checkbox
                id={field.name}
                checked={!!value}
                onCheckedChange={function (checked) {
                  return handleFieldChange(field.name, checked);
                }}
                className={error ? "border-red-500" : ""}
              />
              <label_1.Label htmlFor={field.name} className="text-sm">
                Eu concordo e autorizo conforme descrito acima
              </label_1.Label>
            </div>
          </div>
        );
      default:
        return <input_1.Input {...baseProps} />;
    }
  };
  var getFormTypeInfo = function (type) {
    return (
      FORM_TYPES.find(function (t) {
        return t.value === type;
      }) || FORM_TYPES[0]
    );
  };
  var getDataCategoryInfo = function (category) {
    return (
      DATA_CATEGORIES.find(function (c) {
        return c.value === category;
      }) || DATA_CATEGORIES[0]
    );
  };
  var getLegalBasisInfo = function (type) {
    return (
      LEGAL_BASIS_TYPES.find(function (b) {
        return b.value === type;
      }) || LEGAL_BASIS_TYPES[0]
    );
  };
  var filteredForms = forms.filter(function (form) {
    var matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesType = !filterType || form.type === filterType;
    return matchesSearch && matchesType;
  });
  if (mode === "fill" && currentForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentForm.title}</h1>
          <p className="text-gray-600">{currentForm.description}</p>
          {currentForm.isRequired && (
            <badge_1.Badge className="mt-2 bg-red-100 text-red-800">
              <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1" />
              Obrigatório
            </badge_1.Badge>
          )}
        </div>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <form
              onSubmit={function (e) {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              {currentForm.content.sections.map(function (section) {
                return (
                  <div key={section.id} className="space-y-4">
                    <div className="border-b pb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                      {section.description && (
                        <p className="text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>

                    {currentForm.content.fields
                      .filter(function (field) {
                        return field.sectionId === section.id;
                      })
                      .sort(function (a, b) {
                        return a.order - b.order;
                      })
                      .map(function (field) {
                        return (
                          <div key={field.id} className="space-y-2">
                            {field.type !== "consent" && field.type !== "checkbox" && (
                              <label_1.Label
                                htmlFor={field.name}
                                className="flex items-center space-x-1"
                              >
                                <span>{field.label}</span>
                                {field.isRequired && <span className="text-red-500">*</span>}
                              </label_1.Label>
                            )}

                            {renderField(field)}

                            {field.helpText && field.type !== "consent" && (
                              <p className="text-sm text-gray-500">{field.helpText}</p>
                            )}

                            {validationErrors[field.name] && (
                              <p className="text-sm text-red-600 flex items-center space-x-1">
                                <lucide_react_1.AlertCircle className="w-4 h-4" />
                                <span>{validationErrors[field.name]}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-500">
                  <p>Versão: {currentForm.version}</p>
                  <p>Retenção: {currentForm.retentionPeriod} anos</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button_1.Button type="button" variant="outline">
                    Cancelar
                  </button_1.Button>
                  <button_1.Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? <lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      : <lucide_react_1.CheckCircle className="w-4 h-4 mr-2" />}
                    Enviar Consentimento
                  </button_1.Button>
                </div>
              </div>
            </form>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulários de Consentimento</h2>
          <p className="text-gray-600">Gerencie consentimentos e termos de autorização</p>
        </div>
        <div className="flex items-center space-x-2">
          <dialog_1.Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Novo Formulário
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Criar Formulário de Consentimento</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure um novo formulário de consentimento personalizado
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              {/* Form Builder Content - This would be a complex form builder interface */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="formTitle">Título do Formulário *</label_1.Label>
                    <input_1.Input
                      id="formTitle"
                      value={newForm.title}
                      onChange={function (e) {
                        return setNewForm(function (prev) {
                          return __assign(__assign({}, prev), { title: e.target.value });
                        });
                      }}
                      placeholder="Ex: Termo de Consentimento para Cirurgia"
                    />
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="formType">Tipo de Formulário *</label_1.Label>
                    <select_1.Select
                      value={newForm.type}
                      onValueChange={function (value) {
                        return setNewForm(function (prev) {
                          return __assign(__assign({}, prev), { type: value });
                        });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o tipo" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {FORM_TYPES.map(function (type) {
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
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="formDescription">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="formDescription"
                    value={newForm.description}
                    onChange={function (e) {
                      return setNewForm(function (prev) {
                        return __assign(__assign({}, prev), { description: e.target.value });
                      });
                    }}
                    placeholder="Descreva o propósito e contexto do formulário"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button_1.Button
                    type="button"
                    variant="outline"
                    onClick={function () {
                      return setShowFormBuilder(false);
                    }}
                  >
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={saveForm} disabled={!newForm.title || !newForm.type}>
                    Salvar Formulário
                  </button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input_1.Input
              placeholder="Buscar formulários..."
              value={searchTerm}
              onChange={function (e) {
                return setSearchTerm(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <select_1.Select value={filterType} onValueChange={setFilterType}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Filtrar por tipo" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="">Todos os tipos</select_1.SelectItem>
            {FORM_TYPES.map(function (type) {
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
      </div>

      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="forms">Formulários</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="responses">Respostas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Análises</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="forms" className="space-y-4">
          {filteredForms.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="text-center py-8">
                  <lucide_react_1.FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum formulário encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterType
                      ? "Tente ajustar os filtros de busca"
                      : "Crie seu primeiro formulário de consentimento"}
                  </p>
                  <button_1.Button
                    onClick={function () {
                      return setShowFormBuilder(true);
                    }}
                  >
                    <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                    Criar Formulário
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredForms.map(function (form) {
                  var typeInfo = getFormTypeInfo(form.type);
                  return (
                    <card_1.Card key={form.id} className="hover:shadow-md transition-shadow">
                      <card_1.CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <card_1.CardTitle className="text-lg">{form.title}</card_1.CardTitle>
                            <card_1.CardDescription className="mt-1">
                              {form.description}
                            </card_1.CardDescription>
                          </div>
                          <badge_1.Badge className={typeInfo.color}>
                            <div className="flex items-center space-x-1">
                              {typeInfo.icon}
                              <span className="text-xs">{typeInfo.label}</span>
                            </div>
                          </badge_1.Badge>
                        </div>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Versão:</span>
                            <span className="font-medium">{form.version}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <badge_1.Badge
                              className={
                                form.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {form.isActive ? "Ativo" : "Inativo"}
                            </badge_1.Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Campos:</span>
                            <span className="font-medium">{form.content.fields.length}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Retenção:</span>
                            <span className="font-medium">{form.retentionPeriod} anos</span>
                          </div>

                          {form.dataCategories.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-sm text-gray-600">Dados:</span>
                              <div className="flex flex-wrap gap-1">
                                {form.dataCategories.slice(0, 2).map(function (category) {
                                  var categoryInfo = getDataCategoryInfo(category);
                                  return (
                                    <badge_1.Badge
                                      key={category}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {categoryInfo.icon}
                                      <span className="ml-1">{categoryInfo.label}</span>
                                    </badge_1.Badge>
                                  );
                                })}
                                {form.dataCategories.length > 2 && (
                                  <badge_1.Badge variant="outline" className="text-xs">
                                    +{form.dataCategories.length - 2}
                                  </badge_1.Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-gray-500">
                              {(0, date_fns_1.format)(form.updatedAt, "dd/MM/yyyy", {
                                locale: locale_1.ptBR,
                              })}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button_1.Button
                                variant="outline"
                                size="sm"
                                onClick={function () {
                                  return loadForm(form.id);
                                }}
                              >
                                <lucide_react_1.Eye className="w-3 h-3" />
                              </button_1.Button>
                              <button_1.Button
                                variant="outline"
                                size="sm"
                                onClick={function () {
                                  setCurrentForm(form);
                                  setSelectedTab("responses");
                                }}
                              >
                                <lucide_react_1.FileText className="w-3 h-3" />
                              </button_1.Button>
                              <button_1.Button variant="outline" size="sm">
                                <lucide_react_1.MoreVertical className="w-3 h-3" />
                              </button_1.Button>
                            </div>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="responses" className="space-y-4">
          {responses.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="text-center py-8">
                  <lucide_react_1.CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma resposta encontrada
                  </h3>
                  <p className="text-gray-600">As respostas dos formulários aparecerão aqui</p>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="space-y-4">
                {responses.map(function (response) {
                  var _a;
                  var form = forms.find(function (f) {
                    return f.id === response.formId;
                  });
                  var typeInfo = form ? getFormTypeInfo(form.type) : null;
                  return (
                    <card_1.Card key={response.id}>
                      <card_1.CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <card_1.CardTitle className="text-lg">
                              {(form === null || form === void 0 ? void 0 : form.title) ||
                                "Formulário não encontrado"}
                            </card_1.CardTitle>
                            <card_1.CardDescription>
                              Respondido em{" "}
                              {(0, date_fns_1.format)(response.timestamp, "dd/MM/yyyy HH:mm", {
                                locale: locale_1.ptBR,
                              })}
                            </card_1.CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            {typeInfo && (
                              <badge_1.Badge className={typeInfo.color}>
                                <div className="flex items-center space-x-1">
                                  {typeInfo.icon}
                                  <span>{typeInfo.label}</span>
                                </div>
                              </badge_1.Badge>
                            )}
                            <badge_1.Badge
                              className={
                                response.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {response.isActive ? "Ativo" : "Retirado"}
                            </badge_1.Badge>
                          </div>
                        </div>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Método:</span>
                              <div className="font-medium">
                                {((_a = CONSENT_METHODS.find(function (m) {
                                  return m.value === response.consentMethod;
                                })) === null || _a === void 0
                                  ? void 0
                                  : _a.label) || response.consentMethod}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">IP:</span>
                              <div className="font-medium">{response.ipAddress}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Consentimento:</span>
                              <div
                                className={"font-medium ".concat(
                                  response.consentGiven ? "text-green-600" : "text-red-600",
                                )}
                              >
                                {response.consentGiven ? "Concedido" : "Negado"}
                              </div>
                            </div>
                          </div>

                          {response.withdrawnAt && (
                            <alert_1.Alert>
                              <lucide_react_1.AlertTriangle className="w-4 h-4" />
                              <alert_1.AlertDescription>
                                <strong>Consentimento retirado</strong> em{" "}
                                {(0, date_fns_1.format)(response.withdrawnAt, "dd/MM/yyyy HH:mm", {
                                  locale: locale_1.ptBR,
                                })}
                                {response.withdrawalReason && (
                                  <span className="block mt-1">
                                    Motivo: {response.withdrawalReason}
                                  </span>
                                )}
                              </alert_1.AlertDescription>
                            </alert_1.Alert>
                          )}

                          <div className="flex items-center justify-end space-x-2">
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Eye className="w-4 h-4 mr-1" />
                              Ver Detalhes
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Download className="w-4 h-4 mr-1" />
                              Exportar
                            </button_1.Button>
                            {response.isActive && allowWithdrawal && (
                              <button_1.Button variant="outline" size="sm" className="text-red-600">
                                <lucide_react_1.X className="w-4 h-4 mr-1" />
                                Retirar
                              </button_1.Button>
                            )}
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{forms.length}</div>
                    <div className="text-sm text-gray-600">Formulários</div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        responses.filter(function (r) {
                          return r.isActive;
                        }).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Consentimentos Ativos</div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.X className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        responses.filter(function (r) {
                          return !r.isActive;
                        }).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Consentimentos Retirados</div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        responses.filter(function (r) {
                          return r.consentMethod === "digital_signature";
                        }).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Assinaturas Digitais</div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
