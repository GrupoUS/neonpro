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
exports.ConsentPreferences = ConsentPreferences;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var sonner_1 = require("sonner");
var use_patient_auth_1 = require("@/lib/hooks/use-patient-auth");
function ConsentPreferences() {
  var _this = this;
  var _a = (0, use_patient_auth_1.usePatientAuth)(),
    patient = _a.patient,
    updatePatient = _a.updatePatient;
  var _b = (0, react_1.useState)(false),
    isUpdating = _b[0],
    setIsUpdating = _b[1];
  // LGPD Consent Management
  var _c = (0, react_1.useState)([
      {
        id: "lgpd_basic",
        type: "lgpd_basic",
        title: "Tratamento de Dados Básicos (Obrigatório)",
        description:
          "Autorização para tratamento de dados pessoais necessários para prestação de serviços médicos e estéticos.",
        required: true,
        granted: true,
        granted_at: "2025-01-20T10:00:00Z",
        icon: lucide_react_1.Shield,
        legal_basis: "Consentimento do titular (Art. 7º, I, LGPD)",
        data_retention_period: "20 anos (conforme CFM)",
        purposes: [
          "Prestação de serviços médicos e estéticos",
          "Agendamento e controle de consultas",
          "Histórico médico e acompanhamento",
          "Comunicação sobre procedimentos",
        ],
      },
      {
        id: "marketing",
        type: "marketing",
        title: "Comunicações de Marketing",
        description:
          "Receber informações sobre novos tratamentos, promoções e conteúdo educativo sobre estética e saúde.",
        required: false,
        granted: true,
        granted_at: "2025-01-20T10:00:00Z",
        icon: lucide_react_1.Mail,
        legal_basis: "Consentimento específico do titular",
        data_retention_period: "2 anos após revogação",
        purposes: [
          "Envio de newsletters sobre tratamentos",
          "Promoções e ofertas especiais",
          "Conteúdo educativo sobre estética",
          "Pesquisas de satisfação",
        ],
      },
      {
        id: "whatsapp",
        type: "whatsapp",
        title: "WhatsApp Business",
        description:
          "Receber lembretes de consulta, confirmações e comunicações importantes via WhatsApp.",
        required: false,
        granted: false,
        icon: lucide_react_1.MessageSquare,
        legal_basis: "Consentimento específico do titular",
        data_retention_period: "1 ano após revogação",
        purposes: [
          "Lembretes de consultas agendadas",
          "Confirmações de agendamento",
          "Orientações pós-procedimento",
          "Comunicações urgentes",
        ],
      },
      {
        id: "photography",
        type: "photography",
        title: "Registro Fotográfico",
        description:
          "Autorização para captura e armazenamento de fotos para acompanhamento médico (antes/depois).",
        required: false,
        granted: true,
        granted_at: "2025-01-20T10:00:00Z",
        icon: lucide_react_1.Camera,
        legal_basis: "Consentimento específico para fins médicos",
        data_retention_period: "20 anos (arquivo médico)",
        purposes: [
          "Acompanhamento da evolução dos tratamentos",
          "Documentação médica obrigatória",
          "Comparação de resultados",
          "Análise de eficácia dos procedimentos",
        ],
      },
      {
        id: "research",
        type: "research",
        title: "Pesquisa e Desenvolvimento",
        description:
          "Uso de dados anonimizados para pesquisas científicas e desenvolvimento de novos tratamentos.",
        required: false,
        granted: false,
        icon: lucide_react_1.Database,
        legal_basis: "Consentimento para fins de pesquisa científica",
        data_retention_period: "Indefinido (dados anonimizados)",
        purposes: [
          "Pesquisas científicas em estética",
          "Desenvolvimento de novos tratamentos",
          "Estudos de eficácia e segurança",
          "Publicações científicas (dados anonimizados)",
        ],
      },
    ]),
    consents = _c[0],
    setConsents = _c[1];
  // LGPD Rights
  var dataRights = [
    {
      id: "access",
      title: "Acesso aos Dados",
      description: "Solicitar uma cópia de todos os seus dados pessoais que processamos.",
      action: "Solicitar Cópia",
      icon: lucide_react_1.Eye,
    },
    {
      id: "rectification",
      title: "Correção de Dados",
      description: "Corrigir dados pessoais incompletos, inexatos ou desatualizados.",
      action: "Solicitar Correção",
      icon: lucide_react_1.Edit,
    },
    {
      id: "deletion",
      title: "Exclusão de Dados",
      description:
        "Solicitar a exclusão de dados pessoais desnecessários ou tratados inadequadamente.",
      action: "Solicitar Exclusão",
      icon: lucide_react_1.Trash2,
    },
    {
      id: "portability",
      title: "Portabilidade",
      description: "Receber seus dados em formato estruturado para transferir a outro prestador.",
      action: "Exportar Dados",
      icon: lucide_react_1.Download,
    },
    {
      id: "history",
      title: "Histórico de Consentimentos",
      description: "Visualizar o histórico completo de consentimentos concedidos e revogados.",
      action: "Ver Histórico",
      icon: lucide_react_1.History,
    },
  ];
  var handleConsentToggle = function (consentId, granted) {
    return __awaiter(_this, void 0, void 0, function () {
      var consent, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (isUpdating) return [2 /*return*/];
            setIsUpdating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            consent = consents.find(function (c) {
              return c.id === consentId;
            });
            if (!consent) return [2 /*return*/];
            // Can't revoke required consents
            if (consent.required && !granted) {
              sonner_1.toast.error("Este consentimento é obrigatório para o uso dos serviços");
              return [2 /*return*/];
            }
            // Update local state optimistically
            setConsents(function (prev) {
              return prev.map(function (c) {
                return c.id === consentId
                  ? __assign(__assign({}, c), {
                      granted: granted,
                      granted_at: granted ? new Date().toISOString() : c.granted_at,
                      revoked_at: !granted ? new Date().toISOString() : undefined,
                    })
                  : c;
              });
            });
            // TODO: Call API to update consent
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 2:
            // TODO: Call API to update consent
            _a.sent();
            sonner_1.toast.success(
              granted
                ? "Consentimento concedido com sucesso"
                : "Consentimento revogado com sucesso",
            );
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            // Revert optimistic update on error
            setConsents(function (prev) {
              return prev.map(function (c) {
                return c.id === consentId ? __assign(__assign({}, c), { granted: !granted }) : c;
              });
            });
            sonner_1.toast.error("Erro ao atualizar consentimento");
            return [3 /*break*/, 5];
          case 4:
            setIsUpdating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDataRightRequest = function (rightId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // TODO: Call API to process data right request
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 1:
            // TODO: Call API to process data right request
            _a.sent();
            sonner_1.toast.success("Solicitação enviada com sucesso", {
              description: "Você receberá uma resposta em até 15 dias úteis conforme a LGPD",
            });
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            sonner_1.toast.error("Erro ao processar solicitação");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getConsentStatus = function (consent) {
    if (consent.granted) {
      return {
        label: "Ativo",
        color: "bg-green-100 text-green-800",
        date: consent.granted_at
          ? (0, date_fns_1.format)(
              (0, date_fns_1.parseISO)(consent.granted_at),
              "d 'de' MMM, yyyy",
              { locale: locale_1.ptBR },
            )
          : "",
      };
    } else {
      return {
        label: consent.revoked_at ? "Revogado" : "Não Concedido",
        color: "bg-red-100 text-red-800",
        date: consent.revoked_at
          ? (0, date_fns_1.format)(
              (0, date_fns_1.parseISO)(consent.revoked_at),
              "d 'de' MMM, yyyy",
              { locale: locale_1.ptBR },
            )
          : "",
      };
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Privacidade e Consentimentos LGPD
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências de privacidade e exercite seus direitos sobre dados pessoais
        </p>
      </div>

      {/* LGPD Overview */}
      <alert_1.Alert className="border-blue-200 bg-blue-50">
        <lucide_react_1.Shield className="h-4 w-4 text-blue-600" />
        <alert_1.AlertDescription className="text-blue-800">
          <strong>Seus Direitos LGPD:</strong> Como titular dos dados, você tem direito a
          confirmação da existência de tratamento, acesso aos dados, correção, anonimização,
          bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revogação do
          consentimento a qualquer momento.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      {/* Consent Management */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="w-5 h-5 text-primary" />
            Gerenciar Consentimentos
          </card_1.CardTitle>
          <card_1.CardDescription>
            Controle como seus dados pessoais são utilizados para diferentes finalidades
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {consents.map(function (consent) {
            var Icon = consent.icon;
            var status = getConsentStatus(consent);
            return (
              <div key={consent.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{consent.title}</h3>
                        <badge_1.Badge className={status.color}>{status.label}</badge_1.Badge>
                        {consent.required && (
                          <badge_1.Badge variant="outline" className="text-xs">
                            Obrigatório
                          </badge_1.Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{consent.description}</p>
                      {status.date && (
                        <p className="text-xs text-muted-foreground">
                          {consent.granted ? "Concedido" : "Revogado"} em {status.date}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <dialog_1.Dialog>
                        <dialog_1.DialogTrigger asChild>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </button_1.Button>
                        </dialog_1.DialogTrigger>
                        <dialog_1.DialogContent className="max-w-2xl">
                          <dialog_1.DialogHeader>
                            <dialog_1.DialogTitle className="flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              {consent.title}
                            </dialog_1.DialogTitle>
                          </dialog_1.DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Descrição</h4>
                              <p className="text-sm text-muted-foreground">{consent.description}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Base Legal</h4>
                              <p className="text-sm text-muted-foreground">{consent.legal_basis}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Período de Retenção</h4>
                              <p className="text-sm text-muted-foreground">
                                {consent.data_retention_period}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Finalidades do Tratamento</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {consent.purposes.map(function (purpose, index) {
                                  return (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-1.5">•</span>
                                      <span>{purpose}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </dialog_1.DialogContent>
                      </dialog_1.Dialog>

                      <div className="flex items-center gap-2">
                        <label_1.Label htmlFor={"consent-".concat(consent.id)} className="text-sm">
                          {consent.granted ? "Ativo" : "Inativo"}
                        </label_1.Label>
                        <switch_1.Switch
                          id={"consent-".concat(consent.id)}
                          checked={consent.granted}
                          onCheckedChange={function (checked) {
                            return handleConsentToggle(consent.id, checked);
                          }}
                          disabled={consent.required || isUpdating}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </card_1.CardContent>
      </card_1.Card>

      {/* Data Rights */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.FileText className="w-5 h-5 text-primary" />
            Direitos sobre seus Dados
          </card_1.CardTitle>
          <card_1.CardDescription>
            Exercite seus direitos fundamentais conforme a Lei Geral de Proteção de Dados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataRights.map(function (right) {
              var Icon = right.icon;
              return (
                <div key={right.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{right.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{right.description}</p>
                    <button_1.Button
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return handleDataRightRequest(right.id);
                      }}
                    >
                      {right.action}
                    </button_1.Button>
                  </div>
                </div>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Privacy Policy */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="w-5 h-5 text-primary" />
            Política de Privacidade
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nossa Política de Privacidade detalha como coletamos, usamos, armazenamos e protegemos
            seus dados pessoais, sempre em conformidade com a LGPD.
          </p>

          <div className="flex gap-3">
            <button_1.Button variant="outline" asChild>
              <a href="/privacy-policy" target="_blank">
                <lucide_react_1.FileText className="w-4 h-4 mr-2" />
                Ler Política Completa
              </a>
            </button_1.Button>
            <button_1.Button variant="outline" asChild>
              <a href="/privacy-policy.pdf" target="_blank">
                <lucide_react_1.Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Contact DPO */}
      <card_1.Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 medical-card">
        <card_1.CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <lucide_react_1.Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Dúvidas sobre Privacidade?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Entre em contato com nosso Encarregado de Proteção de Dados (DPO) para esclarecer
                dúvidas sobre o tratamento dos seus dados pessoais.
              </p>
              <div className="flex flex-wrap gap-3">
                <button_1.Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300"
                >
                  <lucide_react_1.Mail className="w-4 h-4 mr-2" />
                  dpo@neonpro.com.br
                </button_1.Button>
                <button_1.Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300"
                >
                  <lucide_react_1.Phone className="w-4 h-4 mr-2" />
                  (11) 3333-4444
                </button_1.Button>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
