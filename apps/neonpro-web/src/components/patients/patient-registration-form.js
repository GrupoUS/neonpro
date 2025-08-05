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
exports.default = PatientRegistrationForm;
var react_1 = require("react");
var client_1 = require("@/app/utils/supabase/client");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var progress_1 = require("@/components/ui/progress");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var lucide_react_1 = require("lucide-react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var sonner_1 = require("sonner");
// Validation schemas for each step
var personalInfoSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  date_of_birth: z.string().min(10, "Data de nascimento é obrigatória"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  emergency_contact_name: z.string().min(2, "Nome do contato de emergência obrigatório"),
  emergency_contact_phone: z.string().min(10, "Telefone do contato de emergência obrigatório"),
  emergency_contact_relationship: z.string().min(2, "Relacionamento obrigatório"),
});
var addressSchema = z.object({
  street: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  zip_code: z.string().min(8, "CEP deve ter 8 dígitos"),
});
var medicalInfoSchema = z.object({
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  allergies: z.array(z.string()).optional(),
  chronic_conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  previous_surgeries: z.array(z.string()).optional(),
  family_history: z.string().optional(),
});
var lgpdConsentSchema = z.object({
  data_processing_consent: z.boolean().refine(function (val) {
    return val === true;
  }, "Consentimento obrigatório"),
  medical_data_consent: z.boolean().refine(function (val) {
    return val === true;
  }, "Consentimento obrigatório"),
  photo_consent: z.boolean(),
  marketing_consent: z.boolean(),
  data_sharing_consent: z.boolean(),
  retention_period_consent: z.boolean().refine(function (val) {
    return val === true;
  }, "Consentimento obrigatório"),
});
function PatientRegistrationForm(_a) {
  var _this = this;
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel,
    initialData = _a.initialData,
    _b = _a.isOpen,
    isOpen = _b === void 0 ? false : _b,
    onOpenChange = _a.onOpenChange;
  var _c = (0, react_1.useState)(1),
    currentStep = _c[0],
    setCurrentStep = _c[1];
  var _d = (0, react_1.useState)(0),
    completionScore = _d[0],
    setCompletionScore = _d[1];
  var _e = (0, react_1.useState)(false),
    isSubmitting = _e[0],
    setIsSubmitting = _e[1];
  var _f = (0, react_1.useState)(false),
    showConsentDetails = _f[0],
    setShowConsentDetails = _f[1];
  var supabase = (0, client_1.createClient)();
  var steps = [
    { id: 1, title: "Dados Pessoais", icon: lucide_react_1.User, schema: personalInfoSchema },
    { id: 2, title: "Endereço", icon: lucide_react_1.MapPin, schema: addressSchema },
    {
      id: 3,
      title: "Informações Médicas",
      icon: lucide_react_1.Stethoscope,
      schema: medicalInfoSchema,
    },
    { id: 4, title: "Consentimento LGPD", icon: lucide_react_1.Shield, schema: lgpdConsentSchema },
  ];
  // Forms for each step
  var personalForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(personalInfoSchema),
    defaultValues: __assign(
      {
        full_name: "",
        date_of_birth: "",
        gender: "prefer_not_to_say",
        cpf: "",
        phone: "",
        email: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
      },
      initialData === null || initialData === void 0 ? void 0 : initialData.personal,
    ),
  });
  var addressForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(addressSchema),
    defaultValues: __assign(
      {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      },
      initialData === null || initialData === void 0 ? void 0 : initialData.address,
    ),
  });
  var medicalForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(medicalInfoSchema),
    defaultValues: __assign(
      {
        height_cm: "",
        weight_kg: "",
        blood_type: "unknown",
        allergies: [],
        chronic_conditions: [],
        medications: [],
        previous_surgeries: [],
        family_history: "",
      },
      initialData === null || initialData === void 0 ? void 0 : initialData.medical,
    ),
  });
  var consentForm = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(lgpdConsentSchema),
    defaultValues: __assign(
      {
        data_processing_consent: false,
        medical_data_consent: false,
        photo_consent: false,
        marketing_consent: false,
        data_sharing_consent: false,
        retention_period_consent: false,
      },
      initialData === null || initialData === void 0 ? void 0 : initialData.consent,
    ),
  });
  // Calculate completion score
  (0, react_1.useEffect)(
    function () {
      var score = 0;
      // Personal info (40%)
      var personalData = personalForm.getValues();
      var personalFields = Object.keys(personalInfoSchema.shape);
      var personalCompleted = personalFields.filter(function (field) {
        return personalData[field] && personalData[field] !== "";
      }).length;
      score += (personalCompleted / personalFields.length) * 40;
      // Address (20%)
      var addressData = addressForm.getValues();
      var addressFields = Object.keys(addressSchema.shape);
      var addressCompleted = addressFields.filter(function (field) {
        return addressData[field] && addressData[field] !== "";
      }).length;
      score += (addressCompleted / addressFields.length) * 20;
      // Medical info (20%)
      var medicalData = medicalForm.getValues();
      var medicalFieldsCount = Object.keys(medicalData).filter(function (key) {
        return (
          medicalData[key] &&
          (Array.isArray(medicalData[key])
            ? medicalData[key].length > 0
            : medicalData[key] !== "" && medicalData[key] !== "unknown")
        );
      }).length;
      score += (medicalFieldsCount / 8) * 20;
      // LGPD consent (20%)
      var consentData = consentForm.getValues();
      var requiredConsents = [
        "data_processing_consent",
        "medical_data_consent",
        "retention_period_consent",
      ];
      var consentCompleted = requiredConsents.filter(function (field) {
        return consentData[field];
      }).length;
      score += (consentCompleted / requiredConsents.length) * 20;
      setCompletionScore(Math.round(score));
    },
    [personalForm.watch(), addressForm.watch(), medicalForm.watch(), consentForm.watch()],
  );
  var getCurrentForm = function () {
    switch (currentStep) {
      case 1:
        return personalForm;
      case 2:
        return addressForm;
      case 3:
        return medicalForm;
      case 4:
        return consentForm;
      default:
        return personalForm;
    }
  };
  var validateCurrentStep = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var currentForm;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            currentForm = getCurrentForm();
            return [4 /*yield*/, currentForm.trigger()];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  var handleNext = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var isValid;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, validateCurrentStep()];
          case 1:
            isValid = _a.sent();
            if (isValid && currentStep < steps.length) {
              setCurrentStep(currentStep + 1);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  var handlePrevious = function () {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  var handleSubmit = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var isPersonalValid,
        isAddressValid,
        isMedicalValid,
        isConsentValid,
        personalData,
        addressData,
        medicalData,
        consentData,
        _a,
        authData,
        authError,
        userId,
        profileError,
        extendedProfileError,
        addressError,
        auditError,
        error_1,
        errorMessage;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, personalForm.trigger()];
          case 1:
            isPersonalValid = _c.sent();
            return [4 /*yield*/, addressForm.trigger()];
          case 2:
            isAddressValid = _c.sent();
            return [4 /*yield*/, medicalForm.trigger()];
          case 3:
            isMedicalValid = _c.sent();
            return [4 /*yield*/, consentForm.trigger()];
          case 4:
            isConsentValid = _c.sent();
            if (!isPersonalValid || !isAddressValid || !isMedicalValid || !isConsentValid) {
              sonner_1.toast.error("Por favor, corrija os erros antes de continuar");
              return [2 /*return*/];
            }
            setIsSubmitting(true);
            _c.label = 5;
          case 5:
            _c.trys.push([5, 11, 12, 13]);
            personalData = personalForm.getValues();
            addressData = addressForm.getValues();
            medicalData = medicalForm.getValues();
            consentData = consentForm.getValues();
            return [
              4 /*yield*/,
              supabase.auth.signUp({
                email: personalData.email,
                password: generateTemporaryPassword(),
                options: {
                  data: {
                    full_name: personalData.full_name,
                    date_of_birth: personalData.date_of_birth,
                    gender: personalData.gender,
                    cpf: personalData.cpf,
                    role: "patient",
                  },
                },
              }),
            ];
          case 6:
            (_a = _c.sent()), (authData = _a.data), (authError = _a.error);
            if (authError) throw authError;
            userId = (_b = authData.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) throw new Error("Erro ao criar usuário");
            return [
              4 /*yield*/,
              supabase.from("profiles").insert({
                id: userId,
                email: personalData.email,
                phone: personalData.phone,
                role: "patient",
                raw_user_meta_data: {
                  full_name: personalData.full_name,
                  date_of_birth: personalData.date_of_birth,
                  gender: personalData.gender,
                  cpf: personalData.cpf,
                },
                created_at: new Date().toISOString(),
              }),
            ];
          case 7:
            profileError = _c.sent().error;
            if (profileError) throw profileError;
            return [
              4 /*yield*/,
              supabase.from("patient_profiles_extended").insert({
                patient_id: userId,
                height_cm: medicalData.height_cm ? parseFloat(medicalData.height_cm) : null,
                weight_kg: medicalData.weight_kg ? parseFloat(medicalData.weight_kg) : null,
                blood_type: medicalData.blood_type !== "unknown" ? medicalData.blood_type : null,
                allergies: medicalData.allergies || [],
                chronic_conditions: medicalData.chronic_conditions || [],
                medications: medicalData.medications || [],
                emergency_contact: {
                  name: personalData.emergency_contact_name,
                  phone: personalData.emergency_contact_phone,
                  relationship: personalData.emergency_contact_relationship,
                },
                consent_status: consentData,
                privacy_settings: {
                  data_processing: consentData.data_processing_consent,
                  medical_data: consentData.medical_data_consent,
                  photo_consent: consentData.photo_consent,
                  marketing: consentData.marketing_consent,
                  data_sharing: consentData.data_sharing_consent,
                },
                profile_completeness_score: completionScore / 100,
                created_at: new Date().toISOString(),
              }),
            ];
          case 8:
            extendedProfileError = _c.sent().error;
            if (extendedProfileError) throw extendedProfileError;
            return [
              4 /*yield*/,
              supabase.from("patient_addresses").insert({
                patient_id: userId,
                street: addressData.street,
                number: addressData.number,
                complement: addressData.complement,
                neighborhood: addressData.neighborhood,
                city: addressData.city,
                state: addressData.state,
                zip_code: addressData.zip_code,
                is_primary: true,
              }),
            ];
          case 9:
            addressError = _c.sent().error;
            if (addressError) throw addressError;
            return [
              4 /*yield*/,
              supabase.from("lgpd_audit_log").insert({
                patient_id: userId,
                action_type: "consent_given",
                consent_details: consentData,
                ip_address: "", // Would be filled by backend
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 10:
            auditError = _c.sent().error;
            if (auditError) console.warn("Audit log error:", auditError);
            sonner_1.toast.success("Paciente cadastrado com sucesso!");
            // Reset forms
            personalForm.reset();
            addressForm.reset();
            medicalForm.reset();
            consentForm.reset();
            setCurrentStep(1);
            onSubmit === null || onSubmit === void 0
              ? void 0
              : onSubmit({
                  personal: personalData,
                  address: addressData,
                  medical: medicalData,
                  consent: consentData,
                  userId: userId,
                });
            onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false);
            return [3 /*break*/, 13];
          case 11:
            error_1 = _c.sent();
            errorMessage =
              error_1 instanceof Error ? error_1.message : "Erro ao cadastrar paciente";
            sonner_1.toast.error("Erro: ".concat(errorMessage));
            console.error("Registration error:", error_1);
            return [3 /*break*/, 13];
          case 12:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  var generateTemporaryPassword = function () {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };
  var formatCPF = function (value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };
  var formatPhone = function (value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
      .replace(/(-\d{4})\d+?$/, "$1");
  };
  var formatCEP = function (value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };
  // Render step content
  var renderStepContent = function () {
    switch (currentStep) {
      case 1:
        return (
          <form_1.Form {...personalForm}>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <form_1.FormField
                  control={personalForm.control}
                  name="full_name"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Nome Completo *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Digite o nome completo" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={personalForm.control}
                  name="date_of_birth"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Nascimento *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="date" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={personalForm.control}
                  name="gender"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Sexo *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Selecione" />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="male">Masculino</select_1.SelectItem>
                            <select_1.SelectItem value="female">Feminino</select_1.SelectItem>
                            <select_1.SelectItem value="other">Outro</select_1.SelectItem>
                            <select_1.SelectItem value="prefer_not_to_say">
                              Prefiro não informar
                            </select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={personalForm.control}
                  name="cpf"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>CPF *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="000.000.000-00"
                            {...field}
                            onChange={function (e) {
                              return field.onChange(formatCPF(e.target.value));
                            }}
                            maxLength={14}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={personalForm.control}
                  name="phone"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Telefone *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            onChange={function (e) {
                              return field.onChange(formatPhone(e.target.value));
                            }}
                            maxLength={15}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={personalForm.control}
                  name="email"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Email *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="email" placeholder="email@exemplo.com" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />
                  Contato de Emergência
                </h4>

                <div className="grid gap-4 md:grid-cols-3">
                  <form_1.FormField
                    control={personalForm.control}
                    name="emergency_contact_name"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Nome *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Nome do contato" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={personalForm.control}
                    name="emergency_contact_phone"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Telefone *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              placeholder="(11) 99999-9999"
                              {...field}
                              onChange={function (e) {
                                return field.onChange(formatPhone(e.target.value));
                              }}
                              maxLength={15}
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={personalForm.control}
                    name="emergency_contact_relationship"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Parentesco *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Ex: Mãe, Cônjuge, Filho" {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </form>
          </form_1.Form>
        );
      case 2:
        return (
          <form_1.Form {...addressForm}>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <form_1.FormField
                    control={addressForm.control}
                    name="street"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Endereço *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Rua, Avenida, etc." {...field} />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <form_1.FormField
                  control={addressForm.control}
                  name="number"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Número *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="123" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={addressForm.control}
                  name="complement"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Complemento</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Apto, Bloco, etc." {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={addressForm.control}
                  name="neighborhood"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Bairro *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Nome do bairro" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={addressForm.control}
                  name="zip_code"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>CEP *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            placeholder="00000-000"
                            {...field}
                            onChange={function (e) {
                              return field.onChange(formatCEP(e.target.value));
                            }}
                            maxLength={9}
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={addressForm.control}
                  name="city"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Cidade *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Nome da cidade" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={addressForm.control}
                  name="state"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Estado *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Selecione" />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="AC">Acre</select_1.SelectItem>
                            <select_1.SelectItem value="AL">Alagoas</select_1.SelectItem>
                            <select_1.SelectItem value="AP">Amapá</select_1.SelectItem>
                            <select_1.SelectItem value="AM">Amazonas</select_1.SelectItem>
                            <select_1.SelectItem value="BA">Bahia</select_1.SelectItem>
                            <select_1.SelectItem value="CE">Ceará</select_1.SelectItem>
                            <select_1.SelectItem value="DF">Distrito Federal</select_1.SelectItem>
                            <select_1.SelectItem value="ES">Espírito Santo</select_1.SelectItem>
                            <select_1.SelectItem value="GO">Goiás</select_1.SelectItem>
                            <select_1.SelectItem value="MA">Maranhão</select_1.SelectItem>
                            <select_1.SelectItem value="MT">Mato Grosso</select_1.SelectItem>
                            <select_1.SelectItem value="MS">Mato Grosso do Sul</select_1.SelectItem>
                            <select_1.SelectItem value="MG">Minas Gerais</select_1.SelectItem>
                            <select_1.SelectItem value="PA">Pará</select_1.SelectItem>
                            <select_1.SelectItem value="PB">Paraíba</select_1.SelectItem>
                            <select_1.SelectItem value="PR">Paraná</select_1.SelectItem>
                            <select_1.SelectItem value="PE">Pernambuco</select_1.SelectItem>
                            <select_1.SelectItem value="PI">Piauí</select_1.SelectItem>
                            <select_1.SelectItem value="RJ">Rio de Janeiro</select_1.SelectItem>
                            <select_1.SelectItem value="RN">
                              Rio Grande do Norte
                            </select_1.SelectItem>
                            <select_1.SelectItem value="RS">Rio Grande do Sul</select_1.SelectItem>
                            <select_1.SelectItem value="RO">Rondônia</select_1.SelectItem>
                            <select_1.SelectItem value="RR">Roraima</select_1.SelectItem>
                            <select_1.SelectItem value="SC">Santa Catarina</select_1.SelectItem>
                            <select_1.SelectItem value="SP">São Paulo</select_1.SelectItem>
                            <select_1.SelectItem value="SE">Sergipe</select_1.SelectItem>
                            <select_1.SelectItem value="TO">Tocantins</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>
            </form>
          </form_1.Form>
        );
      case 3:
        return (
          <form_1.Form {...medicalForm}>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <form_1.FormField
                  control={medicalForm.control}
                  name="height_cm"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Altura (cm)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="number" placeholder="170" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={medicalForm.control}
                  name="weight_kg"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Peso (kg)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="number" placeholder="70" {...field} />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={medicalForm.control}
                  name="blood_type"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Tipo Sanguíneo</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Selecione" />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="A+">A+</select_1.SelectItem>
                            <select_1.SelectItem value="A-">A-</select_1.SelectItem>
                            <select_1.SelectItem value="B+">B+</select_1.SelectItem>
                            <select_1.SelectItem value="B-">B-</select_1.SelectItem>
                            <select_1.SelectItem value="AB+">AB+</select_1.SelectItem>
                            <select_1.SelectItem value="AB-">AB-</select_1.SelectItem>
                            <select_1.SelectItem value="O+">O+</select_1.SelectItem>
                            <select_1.SelectItem value="O-">O-</select_1.SelectItem>
                            <select_1.SelectItem value="unknown">Não sei</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <div className="space-y-4">
                <form_1.FormField
                  control={medicalForm.control}
                  name="family_history"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Histórico Familiar</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Descreva doenças na família (diabetes, hipertensão, câncer, etc.)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Informe se há casos de doenças hereditárias na família
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Alergias, condições crônicas e medicamentos podem ser adicionados após o cadastro
                  inicial.
                </p>
              </div>
            </form>
          </form_1.Form>
        );
      case 4:
        return (
          <form_1.Form {...consentForm}>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <lucide_react_1.Shield className="h-4 w-4 text-blue-500" />
                    Consentimentos LGPD Obrigatórios
                  </h4>
                  <button_1.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      return setShowConsentDetails(!showConsentDetails);
                    }}
                  >
                    {showConsentDetails
                      ? <lucide_react_1.EyeOff className="h-4 w-4" />
                      : <lucide_react_1.Eye className="h-4 w-4" />}
                    {showConsentDetails ? "Ocultar" : "Detalhes"}
                  </button_1.Button>
                </div>

                {showConsentDetails && (
                  <card_1.Card className="p-4 bg-blue-50 border-blue-200">
                    <h5 className="font-medium mb-2">Lei Geral de Proteção de Dados (LGPD)</h5>
                    <p className="text-sm text-muted-foreground">
                      Seus dados pessoais e médicos são protegidos por lei. Você tem direito a:
                      acessar, corrigir, excluir, portar seus dados e retirar consentimento a
                      qualquer momento. Entre em contato conosco em privacidade@neonpro.com.br para
                      exercer seus direitos.
                    </p>
                  </card_1.Card>
                )}

                <div className="space-y-4">
                  <form_1.FormField
                    control={consentForm.control}
                    name="data_processing_consent"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <form_1.FormControl>
                            <checkbox_1.Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </form_1.FormControl>
                          <div className="space-y-1 leading-none">
                            <form_1.FormLabel className="text-sm font-normal">
                              * Autorizo o processamento dos meus dados pessoais para prestação de
                              serviços médicos
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Obrigatório para agendamentos, consultas e tratamentos
                            </form_1.FormDescription>
                          </div>
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={consentForm.control}
                    name="medical_data_consent"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <form_1.FormControl>
                            <checkbox_1.Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </form_1.FormControl>
                          <div className="space-y-1 leading-none">
                            <form_1.FormLabel className="text-sm font-normal">
                              * Autorizo o processamento dos meus dados médicos sensíveis
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Obrigatório para prontuário eletrônico e acompanhamento médico
                            </form_1.FormDescription>
                          </div>
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={consentForm.control}
                    name="retention_period_consent"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <form_1.FormControl>
                            <checkbox_1.Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </form_1.FormControl>
                          <div className="space-y-1 leading-none">
                            <form_1.FormLabel className="text-sm font-normal">
                              * Estou ciente do período de retenção dos dados (20 anos conforme CFM)
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Dados médicos são mantidos por 20 anos conforme resolução do CFM
                            </form_1.FormDescription>
                          </div>
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">Consentimentos Opcionais</h5>
                  <div className="space-y-4">
                    <form_1.FormField
                      control={consentForm.control}
                      name="photo_consent"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <form_1.FormControl>
                              <checkbox_1.Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                            <div className="space-y-1 leading-none">
                              <form_1.FormLabel className="text-sm font-normal">
                                Autorizo uso de fotos para documentação médica (antes/depois)
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Para acompanhamento de tratamentos estéticos
                              </form_1.FormDescription>
                            </div>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={consentForm.control}
                      name="marketing_consent"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <form_1.FormControl>
                              <checkbox_1.Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                            <div className="space-y-1 leading-none">
                              <form_1.FormLabel className="text-sm font-normal">
                                Autorizo recebimento de comunicações promocionais
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Ofertas, novidades e campanhas por email/WhatsApp
                              </form_1.FormDescription>
                            </div>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={consentForm.control}
                      name="data_sharing_consent"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <form_1.FormControl>
                              <checkbox_1.Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                            <div className="space-y-1 leading-none">
                              <form_1.FormLabel className="text-sm font-normal">
                                Autorizo compartilhamento com profissionais parceiros
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Para encaminhamentos e segunda opinião médica
                              </form_1.FormDescription>
                            </div>
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </form_1.Form>
        );
      default:
        return null;
    }
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.UserPlus className="h-5 w-5" />
            Cadastro de Novo Paciente
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Preencha os dados do paciente para criar um perfil completo
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do cadastro</span>
              <span className="font-medium">{completionScore}%</span>
            </div>
            <progress_1.Progress value={completionScore} className="w-full" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between">
            {steps.map(function (step, index) {
              var Icon = step.icon;
              var isActive = step.id === currentStep;
              var isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={"\n                    flex items-center justify-center w-10 h-10 rounded-full border-2 \n                    ".concat(
                      isActive
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300 bg-white text-gray-500",
                      "\n                  ",
                    )}
                  >
                    {isCompleted
                      ? <lucide_react_1.Check className="h-5 w-5" />
                      : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={"text-sm font-medium ".concat(
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600"
                            : "text-gray-500",
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={"hidden sm:block w-16 h-px mx-4 ".concat(
                        isCompleted ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                {react_1.default.createElement(steps[currentStep - 1].icon, {
                  className: "h-5 w-5",
                })}
                {steps[currentStep - 1].title}
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>{renderStepContent()}</card_1.CardContent>
          </card_1.Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button_1.Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              disabled={isSubmitting}
            >
              {currentStep === 1
                ? "Cancelar"
                : <>
                    <lucide_react_1.ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </>}
            </button_1.Button>

            {currentStep < steps.length
              ? <button_1.Button type="button" onClick={handleNext} disabled={isSubmitting}>
                  Próximo
                  <lucide_react_1.ChevronRight className="ml-2 h-4 w-4" />
                </button_1.Button>
              : <button_1.Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || completionScore < 50}
                  className="min-w-32"
                >
                  {isSubmitting
                    ? <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    : <>
                        <lucide_react_1.Check className="mr-2 h-4 w-4" />
                        Finalizar Cadastro
                      </>}
                </button_1.Button>}
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
