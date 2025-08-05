"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSection = ContactSection;
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var contactSchema = zod_2.z.object({
    name: zod_2.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: zod_2.z.string().email("Email inválido"),
    phone: zod_2.z.string().min(10, "Telefone inválido"),
    clinic: zod_2.z.string().min(2, "Nome da clínica é obrigatório"),
    specialty: zod_2.z.string().min(1, "Selecione uma especialidade"),
    message: zod_2.z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});
var specialties = [
    "Harmonização Facial",
    "Dermatologia Estética",
    "Cirurgia Plástica",
    "Medicina Estética",
    "Tricologia",
    "Podologia",
    "Fisioterapia Dermato-Funcional",
    "Biomedicina Estética",
    "Odontologia Estética",
    "Outro"
];
var contactMethods = [
    {
        icon: lucide_react_1.Phone,
        title: "Telefone Comercial",
        value: "(11) 3000-4000",
        description: "Seg-Sex, 8h às 18h",
        action: "tel:+551130004000",
        actionText: "Ligar Agora"
    },
    {
        icon: lucide_react_1.MessageCircle,
        title: "WhatsApp Business",
        value: "(11) 99999-8888",
        description: "Atendimento 24/7",
        action: "https://wa.me/5511999998888",
        actionText: "Conversar"
    },
    {
        icon: lucide_react_1.Mail,
        title: "Email Comercial",
        value: "vendas@neonpro.com.br",
        description: "Resposta em até 2 horas",
        action: "mailto:vendas@neonpro.com.br",
        actionText: "Enviar Email"
    },
    {
        icon: lucide_react_1.Video,
        title: "Demonstração Online",
        value: "Agende uma demo",
        description: "30 minutos personalizados",
        action: "#demo",
        actionText: "Agendar Demo"
    }
];
var offices = [
    {
        city: "São Paulo - Matriz",
        address: "Av. Paulista, 1000 - 15º andar\nBela Vista, São Paulo - SP\nCEP: 01310-100",
        phone: "(11) 3000-4000",
        hours: "Seg-Sex: 8h às 18h"
    },
    {
        city: "Rio de Janeiro",
        address: "Av. Copacabana, 500 - 8º andar\nCopacabana, Rio de Janeiro - RJ\nCEP: 22070-001",
        phone: "(21) 3000-4000",
        hours: "Seg-Sex: 9h às 17h"
    },
    {
        city: "Belo Horizonte",
        address: "Av. do Contorno, 300 - 12º andar\nSanto Agostinho, Belo Horizonte - MG\nCEP: 30112-000",
        phone: "(31) 3000-4000",
        hours: "Seg-Sex: 8h às 17h"
    }
];
var supportServices = [
    {
        icon: lucide_react_1.Headphones,
        title: "Suporte Técnico 24/7",
        description: "Equipe especializada sempre disponível"
    },
    {
        icon: lucide_react_1.Users,
        title: "Treinamento Completo",
        description: "Capacitação da sua equipe inclusa"
    },
    {
        icon: lucide_react_1.FileText,
        title: "Migração de Dados",
        description: "Transferência gratuita do seu sistema atual"
    },
    {
        icon: lucide_react_1.Shield,
        title: "Garantia de Compliance",
        description: "100% conforme LGPD, ANVISA e CFM"
    }
];
function ContactSection() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isSubmitting = _a[0], setIsSubmitting = _a[1];
    var _b = (0, react_1.useState)(false), submitSuccess = _b[0], setSubmitSuccess = _b[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            clinic: "",
            specialty: "",
            message: "",
        },
    });
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    setSubmitSuccess(true);
                    form.reset();
                    // Reset success message after 5 seconds
                    setTimeout(function () { return setSubmitSuccess(false); }, 5000);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    form.setError("root", {
                        message: "Erro ao enviar mensagem. Tente novamente."
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <badge_1.Badge className="mb-4 bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
          <lucide_react_1.Heart className="h-3 w-3 mr-1"/>
          Entre em Contato
        </badge_1.Badge>
        
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Vamos Revolucionar sua{" "}
          <span className="bg-gradient-to-r from-[#6366f1] to-purple-600 bg-clip-text text-transparent">
            Clínica Estética Juntos
          </span>
        </h2>
        
        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
          Nossa equipe de especialistas está pronta para desenhar a solução perfeita 
          para sua clínica. Fale conosco e descubra como podemos transformar seus resultados.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <card_1.Card className="bg-white shadow-xl border-0">
          <card_1.CardHeader className="pb-6">
            <card_1.CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <lucide_react_1.Send className="h-6 w-6 text-[#6366f1] mr-3"/>
              Solicite uma Proposta Personalizada
            </card_1.CardTitle>
            <p className="text-slate-600">
              Preencha o formulário e receba uma proposta sob medida para sua clínica
            </p>
          </card_1.CardHeader>
          
          <card_1.CardContent>
            {submitSuccess ? (<div className="text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600"/>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Mensagem Enviada com Sucesso!
                </h3>
                <p className="text-slate-600">
                  Nossa equipe entrará em contato em até 2 horas úteis.
                </p>
              </div>) : (<form_1.Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="name" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                          <form_1.FormLabel>Nome Completo *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Dr(a). Seu Nome" className="h-12" disabled={isSubmitting}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
            }}/>
                    
                    <form_1.FormField control={form.control} name="email" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                          <form_1.FormLabel>Email Profissional *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} type="email" placeholder="seu@email.com" className="h-12" disabled={isSubmitting}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
            }}/>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="phone" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                          <form_1.FormLabel>Telefone *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} type="tel" placeholder="(11) 99999-9999" className="h-12" disabled={isSubmitting}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
            }}/>
                    
                    <form_1.FormField control={form.control} name="clinic" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                          <form_1.FormLabel>Nome da Clínica *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Clínica Estética..." className="h-12" disabled={isSubmitting}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
            }}/>
                  </div>

                  <form_1.FormField control={form.control} name="specialty" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                        <form_1.FormLabel>Especialidade Principal *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger className="h-12">
                              <select_1.SelectValue placeholder="Selecione sua especialidade"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {specialties.map(function (specialty) { return (<select_1.SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </select_1.SelectItem>); })}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>);
            }}/>

                  <form_1.FormField control={form.control} name="message" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                        <form_1.FormLabel>Conte-nos sobre sua clínica *</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea {...field} placeholder="Descreva sua clínica, principais desafios e objetivos..." className="min-h-[120px] resize-none" disabled={isSubmitting}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>);
            }}/>

                  {form.formState.errors.root && (<div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600 font-medium">
                        {form.formState.errors.root.message}
                      </p>
                    </div>)}

                  <button_1.Button type="submit" size="lg" className="w-full h-12 bg-[#6366f1] hover:bg-[#5855eb] text-white font-semibold shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? (<div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>) : (<>
                        <lucide_react_1.Send className="h-4 w-4 mr-2"/>
                        Solicitar Proposta Gratuita
                      </>)}
                  </button_1.Button>
                </form>
              </form_1.Form>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactMethods.map(function (method, index) { return (<card_1.Card key={index} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#6366f1]/30">
                <card_1.CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#6366f1] to-purple-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <method.icon className="h-6 w-6 text-white"/>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {method.title}
                    </h4>
                    <p className="text-lg font-medium text-[#6366f1] mb-1">
                      {method.value}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      {method.description}
                    </p>
                    <button_1.Button size="sm" variant="outline" className="w-full border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white" asChild>
                      <a href={method.action}>
                        {method.actionText}
                      </a>
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>

          {/* Support Services */}
          <card_1.Card className="bg-gradient-to-br from-[#6366f1]/5 to-purple-500/5 border-[#6366f1]/20">
            <card_1.CardHeader>
              <card_1.CardTitle className="text-xl font-bold text-slate-900">
                Suporte Completo Incluído
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {supportServices.map(function (service, index) { return (<div key={index} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#6366f1] flex items-center justify-center flex-shrink-0 mt-1">
                    <service.icon className="h-4 w-4 text-white"/>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">
                      {service.title}
                    </h5>
                    <p className="text-sm text-slate-600">
                      {service.description}
                    </p>
                  </div>
                </div>); })}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Office Locations */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Nossos Escritórios
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {offices.map(function (office, index) { return (<card_1.Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <card_1.CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#6366f1] to-purple-600 flex items-center justify-center mx-auto">
                  <lucide_react_1.MapPin className="h-6 w-6 text-white"/>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {office.city}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3 whitespace-pre-line">
                    {office.address}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-sm text-slate-600">
                      <lucide_react_1.Phone className="h-4 w-4 mr-2"/>
                      {office.phone}
                    </div>
                    <div className="flex items-center justify-center text-sm text-slate-600">
                      <lucide_react_1.Clock className="h-4 w-4 mr-2"/>
                      {office.hours}
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="text-center bg-slate-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Suporte de Emergência 24/7
        </h3>
        <p className="text-slate-700 mb-6">
          Para questões técnicas urgentes fora do horário comercial
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button_1.Button size="lg" variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white" asChild>
            <a href="tel:+5511999997777">
              <lucide_react_1.Phone className="h-4 w-4 mr-2"/>
              (11) 99999-7777
            </a>
          </button_1.Button>
          <button_1.Button size="lg" variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white" asChild>
            <a href="mailto:emergencia@neonpro.com.br">
              <lucide_react_1.Mail className="h-4 w-4 mr-2"/>
              emergencia@neonpro.com.br
            </a>
          </button_1.Button>
        </div>
      </div>
    </div>);
}
