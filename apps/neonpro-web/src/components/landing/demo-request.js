// components/landing/demo-request.tsx
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoRequest = DemoRequest;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
function DemoRequest() {
  var _a = (0, react_1.useState)({
      name: "",
      email: "",
      phone: "",
      clinicName: "",
      city: "",
      state: "",
      clinicType: "",
      currentPatients: "",
      currentSystem: "",
      painPoints: "",
      bestTime: "",
      gdprConsent: false,
      marketingConsent: false,
    }),
    formData = _a[0],
    setFormData = _a[1];
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var _c = (0, react_1.useState)(false),
    isSubmitted = _c[0],
    setIsSubmitted = _c[1];
  var handleInputChange = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            setIsSubmitting(true);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))];
          case 1:
            // Simulate API call
            _a.sent();
            setIsSubmitting(false);
            setIsSubmitted(true);
            return [2 /*return*/];
        }
      });
    });
  var benefits = [
    {
      icon: lucide_react_1.Calendar,
      title: "Demo Personalizada",
      description: "Demonstração focada no seu tipo de clínica",
    },
    {
      icon: lucide_react_1.Zap,
      title: "Setup em 24h",
      description: "Implementação rápida e suporte completo",
    },
    {
      icon: lucide_react_1.Award,
      title: "Treinamento Incluso",
      description: "Capacitação da equipe sem custo adicional",
    },
    {
      icon: lucide_react_1.Clock,
      title: "30 Dias Grátis",
      description: "Teste completo sem compromisso",
    },
  ];
  var states = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
  if (isSubmitted) {
    return (
      <section
        id="demo"
        className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-6">
              <lucide_react_1.CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Solicitação Recebida com Sucesso!
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Nossa equipe entrará em contato em até 2 horas úteis para agendar sua demonstração
              personalizada.
            </p>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Próximos Passos:
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">1</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Verificação das suas necessidades específicas
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Demonstração personalizada de 30 minutos
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">3</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Proposta personalizada e período de teste
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="demo" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <badge_1.Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            Demonstração Gratuita
          </badge_1.Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Veja o NeonPro em Ação
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Agende uma demonstração personalizada e descubra como nossa plataforma pode transformar
            sua clínica em apenas 30 minutos.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Benefits Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              O que você terá:
            </h3>

            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900 flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Contact Info */}
            <card_1.Card className="border-0 shadow-md bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950">
              <card_1.CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Prefere falar conosco?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <lucide_react_1.Phone className="h-4 w-4 text-sky-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      (11) 4005-2030
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <lucide_react_1.MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      WhatsApp: (11) 99999-0000
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <lucide_react_1.Mail className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      contato@neonpro.health
                    </span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <card_1.Card className="border-0 shadow-xl">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Solicitar Demonstração
                </card_1.CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Preencha os dados abaixo e nossa equipe entrará em contato em até 2 horas úteis.
                </p>
              </card_1.CardHeader>

              <card_1.CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="name">Nome Completo *</label_1.Label>
                      <input_1.Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        placeholder="Dr. João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="email">E-mail Profissional *</label_1.Label>
                      <input_1.Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        placeholder="joao@clinica.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="phone">Telefone/WhatsApp *</label_1.Label>
                      <input_1.Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        placeholder="(11) 99999-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="bestTime">Melhor Horário</label_1.Label>
                      <select_1.Select
                        onValueChange={(value) => handleInputChange("bestTime", value)}
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o horário" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="morning">Manhã (9h-12h)</select_1.SelectItem>
                          <select_1.SelectItem value="afternoon">
                            Tarde (13h-17h)
                          </select_1.SelectItem>
                          <select_1.SelectItem value="evening">Noite (18h-20h)</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="clinicName">Nome da Clínica *</label_1.Label>
                      <input_1.Input
                        id="clinicName"
                        type="text"
                        value={formData.clinicName}
                        onChange={(e) => handleInputChange("clinicName", e.target.value)}
                        required
                        placeholder="Clínica Bella Vita"
                      />
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="clinicType">Tipo de Clínica *</label_1.Label>
                      <select_1.Select
                        onValueChange={(value) => handleInputChange("clinicType", value)}
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o tipo" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="aesthetic">Estética</select_1.SelectItem>
                          <select_1.SelectItem value="dermatology">
                            Dermatologia
                          </select_1.SelectItem>
                          <select_1.SelectItem value="plastic-surgery">
                            Cirurgia Plástica
                          </select_1.SelectItem>
                          <select_1.SelectItem value="beauty">
                            Beleza e Bem-estar
                          </select_1.SelectItem>
                          <select_1.SelectItem value="other">Outro</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label_1.Label htmlFor="city">Cidade *</label_1.Label>
                      <input_1.Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                        placeholder="São Paulo"
                      />
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="state">Estado *</label_1.Label>
                      <select_1.Select onValueChange={(value) => handleInputChange("state", value)}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="UF" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {states.map((state) => (
                            <select_1.SelectItem key={state} value={state}>
                              {state}
                            </select_1.SelectItem>
                          ))}
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label htmlFor="currentPatients">Pacientes/Mês</label_1.Label>
                      <select_1.Select
                        onValueChange={(value) => handleInputChange("currentPatients", value)}
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Quantidade" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="0-100">0-100</select_1.SelectItem>
                          <select_1.SelectItem value="100-500">100-500</select_1.SelectItem>
                          <select_1.SelectItem value="500-1000">500-1000</select_1.SelectItem>
                          <select_1.SelectItem value="1000+">1000+</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="painPoints">
                      Principais Desafios (Opcional)
                    </label_1.Label>
                    <textarea_1.Textarea
                      id="painPoints"
                      value={formData.painPoints}
                      onChange={(e) => handleInputChange("painPoints", e.target.value)}
                      placeholder="Ex: conflitos de agenda, dificuldade com compliance, relatórios manuais..."
                      rows={3}
                    />
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <checkbox_1.Checkbox
                        id="gdprConsent"
                        checked={formData.gdprConsent}
                        onCheckedChange={(checked) => handleInputChange("gdprConsent", checked)}
                        required
                      />
                      <label_1.Label htmlFor="gdprConsent" className="text-sm leading-5">
                        Concordo com o processamento dos meus dados conforme a{" "}
                        <a href="#" className="text-sky-600 hover:underline">
                          Política de Privacidade
                        </a>{" "}
                        e{" "}
                        <a href="#" className="text-sky-600 hover:underline">
                          Termos de Uso
                        </a>
                        . (LGPD) *
                      </label_1.Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <checkbox_1.Checkbox
                        id="marketingConsent"
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) =>
                          handleInputChange("marketingConsent", checked)
                        }
                      />
                      <label_1.Label htmlFor="marketingConsent" className="text-sm leading-5">
                        Aceito receber comunicações sobre produtos, serviços e conteúdos relevantes
                        do NeonPro.
                      </label_1.Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button_1.Button
                    type="submit"
                    disabled={isSubmitting || !formData.gdprConsent}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-base font-semibold"
                    size="lg"
                  >
                    {isSubmitting
                      ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando Solicitação...
                        </>
                      : <>
                          Solicitar Demonstração Gratuita
                          <lucide_react_1.Calendar className="ml-2 h-4 w-4" />
                        </>}
                  </button_1.Button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    * Campos obrigatórios. Resposta em até 2 horas úteis.
                  </p>
                </form>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </div>
    </section>
  );
}
