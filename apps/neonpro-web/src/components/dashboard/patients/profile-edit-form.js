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
exports.PatientProfileEditForm = PatientProfileEditForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var patient_profile_1 = require("@/lib/validations/patient-profile");
var use_lgpd_consent_1 = require("@/hooks/use-lgpd-consent");
function PatientProfileEditForm(_a) {
  var _this = this;
  var patientId = _a.patientId,
    initialData = _a.initialData,
    onSuccess = _a.onSuccess,
    onCancel = _a.onCancel;
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var _c = (0, react_1.useState)(false),
    showLgpdInfo = _c[0],
    setShowLgpdInfo = _c[1];
  var _d = (0, use_lgpd_consent_1.useLgpdConsent)(),
    recordConsent = _d.recordConsent,
    updateConsent = _d.updateConsent,
    logDataModification = _d.logDataModification,
    checkConsentValidity = _d.checkConsentValidity,
    consentLoading = _d.isLoading;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(patient_profile_1.PatientProfileSchema),
    defaultValues: __assign(
      {
        fullName: "",
        dateOfBirth: "",
        gender: "prefer_not_to_say",
        cpf: "",
        rg: "",
        phone: "",
        mobile: "",
        email: "",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
        contactPreferences: {
          allowEmail: false,
          allowSms: false,
          allowWhatsapp: false,
          allowPhone: false,
          allowMarketing: false,
          allowAppointmentReminders: true,
          allowHealthTips: false,
          bestTimeToContact: "anytime",
        },
        emergencyContacts: [],
        lgpdConsent: {
          dataProcessingConsent: false,
          sensitiveDataConsent: false,
          marketingConsent: false,
          dataRetentionAcknowledgment: false,
          consentVersion: "1.0",
        },
        healthDataPreferences: {
          shareWithFamily: false,
          shareWithInsurance: false,
          allowResearch: false,
          allowTelemedicine: false,
        },
        dataRights: {
          acknowledgeAccessRight: false,
          acknowledgeCorrectionRight: false,
          acknowledgeDeletionRight: false,
          acknowledgePortabilityRight: false,
        },
      },
      initialData,
    ),
  });
  var _e = (0, react_hook_form_1.useFieldArray)({
      control: form.control,
      name: "emergencyContacts",
    }),
    emergencyContactFields = _e.fields,
    addEmergencyContact = _e.append,
    removeEmergencyContact = _e.remove;
  // Load initial data and check consent validity
  (0, react_1.useEffect)(
    function () {
      if (initialData) {
        form.reset(initialData);
      }
      // Check if consent is still valid for editing profile
      if (patientId) {
        checkConsentValidity(patientId, ["personal_data", "health_data"]).then(function (isValid) {
          if (!isValid) {
            setShowLgpdInfo(true);
            sonner_1.toast.warning("Consentimento LGPD expirado. Renovação necessária.");
          }
        });
      }
    },
    [initialData, patientId, form, checkConsentValidity],
  );
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var modifiedFields, response, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsSubmitting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            // Validate LGPD consent before processing sensitive data
            if (!data.lgpdConsent.dataProcessingConsent || !data.lgpdConsent.sensitiveDataConsent) {
              sonner_1.toast.error(
                "Consentimento LGPD é obrigatório para processar dados de saúde",
              );
              setShowLgpdInfo(true);
              return [2 /*return*/];
            }
            modifiedFields = Object.keys(data);
            return [
              4 /*yield*/,
              logDataModification(patientId, modifiedFields, "update"),
              // Submit profile data
            ];
          case 2:
            _a.sent();
            return [
              4 /*yield*/,
              fetch("/api/patients/".concat(patientId, "/profile"), {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              }),
            ];
          case 3:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Erro ao atualizar perfil do paciente");
            }
            if (!data.lgpdConsent) return [3 /*break*/, 5];
            return [4 /*yield*/, updateConsent(patientId, data.lgpdConsent)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            sonner_1.toast.success("Perfil atualizado com sucesso!");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            console.error("Erro ao atualizar perfil:", error_1);
            sonner_1.toast.error(error_1 instanceof Error ? error_1.message : "Erro desconhecido");
            return [3 /*break*/, 8];
          case 7:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAddEmergencyContact = function () {
    if (emergencyContactFields.length < 3) {
      addEmergencyContact({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        isPrimary: emergencyContactFields.length === 0,
      });
    }
  };
  var formatPhoneInput = function (value) {
    var numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };
  return (
    <div className="space-y-6">
      {/* LGPD Information Banner */}
      {showLgpdInfo && (
        <card_1.Card className="border-orange-200 bg-orange-50">
          <card_1.CardHeader>
            <div className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5 text-orange-600" />
              <card_1.CardTitle className="text-orange-800">
                Informações sobre LGPD
              </card_1.CardTitle>
            </div>
            <card_1.CardDescription className="text-orange-700">
              Seus dados de saúde são protegidos pela Lei Geral de Proteção de Dados (LGPD). É
              necessário seu consentimento explícito para processar informações sensíveis.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center gap-4">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return setShowLgpdInfo(false);
                }}
              >
                Entendi
              </button_1.Button>
              <badge_1.Badge variant="secondary" className="text-xs">
                Versão de Consentimento: 1.0
              </badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <tabs_1.Tabs defaultValue="personal" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-5">
            <tabs_1.TabsTrigger value="personal" className="flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4" />
              Pessoal
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="contact" className="flex items-center gap-2">
              <lucide_react_1.Phone className="h-4 w-4" />
              Contato
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="address" className="flex items-center gap-2">
              <lucide_react_1.MapPin className="h-4 w-4" />
              Endereço
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="emergency" className="flex items-center gap-2">
              <lucide_react_1.Heart className="h-4 w-4" />
              Emergência
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="privacy" className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-4 w-4" />
              Privacidade
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Personal Information Tab */}
          <tabs_1.TabsContent value="personal">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Informações Pessoais</card_1.CardTitle>
                <card_1.CardDescription>
                  Dados pessoais básicos protegidos pela LGPD
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="fullName">Nome Completo *</label_1.Label>
                    <input_1.Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Digite o nome completo"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="dateOfBirth">Data de Nascimento *</label_1.Label>
                    <input_1.Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Contact Information Tab */}
          <tabs_1.TabsContent value="contact">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Informações de Contato</card_1.CardTitle>
                <card_1.CardDescription>
                  Dados de contato e preferências de comunicação
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="email">E-mail *</label_1.Label>
                    <input_1.Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="exemplo@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="phone">Telefone</label_1.Label>
                    <input_1.Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Address Tab */}
          <tabs_1.TabsContent value="address">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Endereço</card_1.CardTitle>
                <card_1.CardDescription>Informações de endereço residencial</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="street">Rua</label_1.Label>
                    <input_1.Input
                      id="street"
                      {...form.register("address.street")}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="city">Cidade</label_1.Label>
                    <input_1.Input
                      id="city"
                      {...form.register("address.city")}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Emergency Contacts Tab */}
          <tabs_1.TabsContent value="emergency">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Contatos de Emergência</card_1.CardTitle>
                <card_1.CardDescription>
                  Pessoas para contatar em caso de emergência
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <button_1.Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEmergencyContact}
                  className="w-full"
                >
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Adicionar Contato de Emergência
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Privacy Tab */}
          <tabs_1.TabsContent value="privacy">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Configurações de Privacidade</card_1.CardTitle>
                <card_1.CardDescription>
                  Controle como seus dados são utilizados
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <react_hook_form_1.Controller
                      name="lgpdConsent.dataProcessingConsent"
                      control={form.control}
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <checkbox_1.Checkbox
                            id="dataProcessingConsent"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        );
                      }}
                    />
                    <label_1.Label htmlFor="dataProcessingConsent" className="text-sm">
                      Consinto com o processamento dos meus dados pessoais
                    </label_1.Label>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button_1.Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button_1.Button>
          <button_1.Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting
              ? <>
                  <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              : <>
                  <lucide_react_1.Save className="h-4 w-4 mr-2" />
                  Salvar
                </>}
          </button_1.Button>
        </div>
      </form>
    </div>
  );
}
