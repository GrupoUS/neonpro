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
exports.PatientRegistrationForm = PatientRegistrationForm;
var zod_1 = require("@hookform/resolvers/zod");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var schemas_1 = require("@/lib/healthcare/schemas");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
function PatientRegistrationForm(_a) {
  var _this = this;
  var onSubmit = _a.onSubmit,
    _b = _a.isLoading,
    isLoading = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(false),
    showLgpdDetails = _c[0],
    setShowLgpdDetails = _c[1];
  var _d = (0, react_1.useState)(1),
    currentStep = _d[0],
    setCurrentStep = _d[1];
  var totalSteps = 4;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(schemas_1.patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      emergency_contact: "",
      emergency_contact_name: "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipcode: "",
      },
      medical_conditions: "",
      allergies: "",
      medications: "",
      consent_lgpd: false,
      consent_marketing: false,
      consent_research: false,
      consent_whatsapp: false,
      legal_basis: "consent",
    },
  });
  var handleSubmitForm = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, onSubmit(data)];
          case 1:
            _a.sent();
            sonner_1.toast.success("Paciente registrado com sucesso!", {
              description: "Os dados foram salvos de forma segura e em conformidade com a LGPD.",
            });
            form.reset();
            setCurrentStep(1);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao registrar paciente", {
              description: "Verifique os dados e tente novamente.",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var nextStep = function () {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  var prevStep = function () {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  return (
    <card_1.Card className="w-full max-w-4xl mx-auto medical-card">
      <card_1.CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <lucide_react_1.Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <card_1.CardTitle className="text-2xl">Cadastro de Paciente</card_1.CardTitle>
            <card_1.CardDescription>
              Informações seguras e protegidas pela LGPD
            </card_1.CardDescription>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, function (_, i) {
            return (
              <div
                key={i}
                className={"flex-1 h-2 rounded-full transition-colors ".concat(
                  i + 1 <= currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            );
          })}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Passo {currentStep} de {totalSteps}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Informações Básicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados pessoais principais do paciente
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={form.control}
                    name="name"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Nome Completo *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              placeholder="Digite o nome completo"
                              {...field}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
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
                                var formatted = (0, utils_1.formatCpf)(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={form.control}
                    name="email"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Email</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              type="email"
                              placeholder="email@exemplo.com"
                              {...field}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Opcional. Usado para comunicações importantes.
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
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
                                var formatted = (0, utils_1.formatPhone)(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>
                <form_1.FormField
                  control={form.control}
                  name="birthdate"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Nascimento *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="date"
                            {...field}
                            value={
                              field.value ? (0, date_fns_1.format)(field.value, "yyyy-MM-dd") : ""
                            }
                            onChange={function (e) {
                              var date = e.target.value ? new Date(e.target.value) : null;
                              field.onChange(date);
                            }}
                            className="bg-background"
                          />
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
                <div className="flex justify-end">
                  <button_1.Button type="button" onClick={nextStep}>
                    Próximo
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Step 2: Contact & Emergency */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Contato e Emergência</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações de contato e pessoa de emergência
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Nome do Contato de Emergência *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              placeholder="Nome completo"
                              {...field}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="emergency_contact"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <form_1.FormLabel>Telefone de Emergência *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input
                              placeholder="(11) 99999-9999"
                              {...field}
                              onChange={function (e) {
                                var formatted = (0, utils_1.formatPhone)(e.target.value);
                                field.onChange(formatted);
                              }}
                              className="bg-background"
                            />
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="address.street"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="md:col-span-2">
                            <form_1.FormLabel>Rua/Avenida *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="Nome da rua"
                                {...field}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="address.number"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Número *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="123"
                                {...field}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="address.complement"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Complemento</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="Apt, Bloco, etc."
                                {...field}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="address.neighborhood"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Bairro *</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="Nome do bairro"
                                {...field}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </button_1.Button>
                  <button_1.Button type="button" onClick={nextStep}>
                    Próximo
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Step 3: Medical Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Informações Médicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados médicos relevantes (opcional mas recomendado)
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <lucide_react_1.Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Informações Protegidas</h4>
                      <p className="text-sm text-amber-700">
                        Dados médicos são criptografados e protegidos por padrões hospitalares de
                        segurança.
                      </p>
                    </div>
                  </div>
                </div>

                <form_1.FormField
                  control={form.control}
                  name="medical_conditions"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Condições Médicas Pré-existentes</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Descreva condições médicas relevantes, cirurgias anteriores, etc."
                            {...field}
                            className="bg-background"
                            rows={3}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Informações importantes para o planejamento do tratamento.
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="allergies"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Alergias</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Alergias a medicamentos, substâncias, materiais, etc."
                            {...field}
                            className="bg-background"
                            rows={2}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Fundamental para evitar reações adversas durante tratamentos.
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="medications"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Medicações em Uso</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Liste medicações atuais, dosagens e frequência"
                            {...field}
                            className="bg-background"
                            rows={2}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Medicamentos podem interferir com procedimentos estéticos.
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </button_1.Button>
                  <button_1.Button type="button" onClick={nextStep}>
                    Próximo
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Step 4: LGPD Consent */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Consentimentos LGPD</h3>
                  <p className="text-sm text-muted-foreground">
                    Autorização para tratamento de dados pessoais
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <lucide_react_1.Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Seus Direitos LGPD</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>• Confirmação da existência de tratamento de dados</p>
                        <p>• Acesso aos seus dados pessoais</p>
                        <p>• Correção de dados incompletos ou desatualizados</p>
                        <p>• Eliminação de dados desnecessários ou tratados em desconformidade</p>
                        <p>• Portabilidade dos dados</p>
                        <p>• Revogação do consentimento a qualquer momento</p>
                      </div>
                      <button_1.Button
                        type="button"
                        variant="link"
                        className="text-blue-600 p-0 h-auto"
                        onClick={function () {
                          return setShowLgpdDetails(!showLgpdDetails);
                        }}
                      >
                        {showLgpdDetails
                          ? <>
                              <lucide_react_1.EyeOff className="w-4 h-4 mr-1" /> Ocultar detalhes
                            </>
                          : <>
                              <lucide_react_1.Eye className="w-4 h-4 mr-1" /> Ver detalhes completos
                            </>}
                      </button_1.Button>
                    </div>
                  </div>
                </div>

                {showLgpdDetails && (
                  <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-3">
                    <h5 className="font-medium">Finalidades do Tratamento de Dados:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Prestação de serviços médicos e estéticos</li>
                      <li>Agendamento e controle de consultas</li>
                      <li>Histórico médico e acompanhamento de tratamentos</li>
                      <li>Comunicação sobre procedimentos e cuidados</li>
                      <li>Cumprimento de obrigações legais e regulamentares</li>
                    </ul>

                    <h5 className="font-medium">Base Legal:</h5>
                    <p>
                      Consentimento do titular (Art. 7º, I, LGPD) e interesse legítimo para
                      prestação de serviços de saúde.
                    </p>

                    <h5 className="font-medium">Compartilhamento:</h5>
                    <p>
                      Dados podem ser compartilhados apenas com profissionais envolvidos no seu
                      tratamento e autoridades sanitárias quando exigido por lei.
                    </p>

                    <h5 className="font-medium">Retenção:</h5>
                    <p>
                      Dados médicos são mantidos pelo prazo mínimo de 20 anos conforme CFM. Outros
                      dados por 5 anos após término da relação.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <form_1.FormField
                    control={form.control}
                    name="consent_lgpd"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="lgpd-consent">
                          <div className="flex items-start space-x-3">
                            <form_1.FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </form_1.FormControl>
                            <div className="grid gap-1.5 leading-none">
                              <form_1.FormLabel className="text-sm font-medium leading-5">
                                Consentimento LGPD (Obrigatório) *
                              </form_1.FormLabel>
                              <form_1.FormDescription className="text-xs">
                                Autorizo o tratamento dos meus dados pessoais para as finalidades
                                descritas, com base no meu consentimento livre e informado, podendo
                                revogá-lo a qualquer momento.
                              </form_1.FormDescription>
                            </div>
                          </div>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="consent_marketing"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <div className="flex items-start space-x-3">
                            <form_1.FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </form_1.FormControl>
                            <div className="grid gap-1.5 leading-none">
                              <form_1.FormLabel className="text-sm font-medium leading-5">
                                Comunicações de Marketing (Opcional)
                              </form_1.FormLabel>
                              <form_1.FormDescription className="text-xs">
                                Autorizo receber comunicações sobre novos tratamentos, promoções e
                                conteúdo educativo.
                              </form_1.FormDescription>
                            </div>
                          </div>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />

                  <form_1.FormField
                    control={form.control}
                    name="consent_whatsapp"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem>
                          <div className="flex items-start space-x-3">
                            <form_1.FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </form_1.FormControl>
                            <div className="grid gap-1.5 leading-none">
                              <form_1.FormLabel className="text-sm font-medium leading-5">
                                Comunicação via WhatsApp (Opcional)
                              </form_1.FormLabel>
                              <form_1.FormDescription className="text-xs">
                                Autorizo receber lembretes de consulta e comunicações importantes
                                via WhatsApp.
                              </form_1.FormDescription>
                            </div>
                          </div>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </div>

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevStep}>
                    Anterior
                  </button_1.Button>
                  <button_1.Button
                    type="submit"
                    disabled={isLoading || !form.watch("consent_lgpd")}
                  >
                    {isLoading ? "Salvando..." : "Cadastrar Paciente"}
                  </button_1.Button>
                </div>
              </div>
            )}
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
