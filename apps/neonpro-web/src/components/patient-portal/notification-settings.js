"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = NotificationSettings;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var use_toast_1 = require("@/components/ui/use-toast");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Dados simulados das preferências de notificação
var mockPreferences = {
    channels: [
        {
            id: "email",
            name: "Email",
            type: "email",
            enabled: true,
            verified: true,
            contact: "paciente@email.com",
            icon: <lucide_react_1.Mail className="h-4 w-4"/>,
        },
        {
            id: "sms",
            name: "SMS",
            type: "sms",
            enabled: true,
            verified: true,
            contact: "+55 11 99999-9999",
            icon: <lucide_react_1.MessageSquare className="h-4 w-4"/>,
        },
        {
            id: "whatsapp",
            name: "WhatsApp",
            type: "whatsapp",
            enabled: false,
            verified: false,
            contact: "+55 11 99999-9999",
            icon: <lucide_react_1.MessageSquare className="h-4 w-4"/>,
        },
        {
            id: "push",
            name: "Push (App)",
            type: "push",
            enabled: true,
            verified: true,
            contact: "Dispositivo Mobile",
            icon: <lucide_react_1.Smartphone className="h-4 w-4"/>,
        },
    ],
    categories: [
        {
            id: "appointments",
            name: "Consultas e Agendamentos",
            description: "Lembretes, confirmações e alterações de consultas",
            icon: <lucide_react_1.Calendar className="h-5 w-5"/>,
            settings: { email: true, sms: true, whatsapp: false, push: true },
            frequency: "immediate",
            quietHours: true,
            lgpdConsent: true,
        },
        {
            id: "treatments",
            name: "Tratamentos e Procedimentos",
            description: "Informações sobre seus tratamentos e cuidados pós-procedimento",
            icon: <lucide_react_1.Heart className="h-5 w-5"/>,
            settings: { email: true, sms: false, whatsapp: false, push: true },
            frequency: "immediate",
            quietHours: true,
            lgpdConsent: true,
        },
        {
            id: "billing",
            name: "Financeiro e Cobrança",
            description: "Faturas, recibos e informações de pagamento",
            icon: <lucide_react_1.CreditCard className="h-5 w-5"/>,
            settings: { email: true, sms: false, whatsapp: false, push: false },
            frequency: "immediate",
            quietHours: false,
            lgpdConsent: true,
        },
        {
            id: "marketing",
            name: "Promocões e Novidades",
            description: "Ofertas especiais, novos tratamentos e eventos",
            icon: <lucide_react_1.Bell className="h-5 w-5"/>,
            settings: { email: false, sms: false, whatsapp: false, push: false },
            frequency: "weekly",
            quietHours: true,
            lgpdConsent: false,
        },
        {
            id: "security",
            name: "Segurança e Privacidade",
            description: "Alertas de segurança e atualizações de privacidade",
            icon: <lucide_react_1.Shield className="h-5 w-5"/>,
            settings: { email: true, sms: true, whatsapp: false, push: true },
            frequency: "immediate",
            quietHours: false,
            lgpdConsent: true,
        },
    ],
    quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
    },
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    doNotDisturb: false,
    emergencyOnly: false,
};
function NotificationSettings() {
    var _this = this;
    var _a = (0, react_1.useState)(mockPreferences), preferences = _a[0], setPreferences = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), saving = _c[0], setSaving = _c[1];
    var toast = (0, use_toast_1.useToast)().toast;
    // Simular salvamento das preferências
    var handleSavePreferences = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSaving(true);
                    // Simular API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simular API call
                    _a.sent();
                    setSaving(false);
                    toast({
                        title: "Preferências salvas",
                        description: "Suas configurações de notificação foram atualizadas com sucesso.",
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    // Atualizar canal de notificação
    var updateChannel = function (channelId, enabled) {
        setPreferences(function (prev) { return (__assign(__assign({}, prev), { channels: prev.channels.map(function (channel) {
                return channel.id === channelId ? __assign(__assign({}, channel), { enabled: enabled }) : channel;
            }) })); });
    };
    // Atualizar categoria de notificação
    var updateCategory = function (categoryId, field, value) {
        setPreferences(function (prev) { return (__assign(__assign({}, prev), { categories: prev.categories.map(function (category) {
                var _a;
                return category.id === categoryId ? __assign(__assign({}, category), (_a = {}, _a[field] = value, _a)) : category;
            }) })); });
    };
    // Atualizar configuração específica de categoria
    var updateCategorySetting = function (categoryId, channel, enabled) {
        setPreferences(function (prev) { return (__assign(__assign({}, prev), { categories: prev.categories.map(function (category) {
                var _a;
                return category.id === categoryId
                    ? __assign(__assign({}, category), { settings: __assign(__assign({}, category.settings), (_a = {}, _a[channel] = enabled, _a)) }) : category;
            }) })); });
    };
    // Verificar canal de comunicação
    var verifyChannel = function (channelId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    // Simular processo de verificação
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                case 1:
                    // Simular processo de verificação
                    _a.sent();
                    setPreferences(function (prev) { return (__assign(__assign({}, prev), { channels: prev.channels.map(function (channel) {
                            return channel.id === channelId ? __assign(__assign({}, channel), { verified: true }) : channel;
                        }) })); });
                    setLoading(false);
                    toast({
                        title: "Canal verificado",
                        description: "Seu canal de comunicação foi verificado com sucesso.",
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <lucide_react_1.Bell className="h-6 w-6 text-purple-600"/>
          <h1 className="text-2xl font-semibold text-gray-900">
            Configurações de Notificação
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Personalize como e quando você deseja receber notificações sobre seus
          tratamentos, consultas e outras informações importantes.
        </p>

        {/* Status Geral */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.doNotDisturb ? (<lucide_react_1.VolumeX className="h-5 w-5 text-red-600"/>) : (<lucide_react_1.Volume2 className="h-5 w-5 text-green-600"/>)}
              <div>
                <p className="font-medium text-gray-900">
                  {preferences.doNotDisturb
            ? "Modo Não Perturbe Ativo"
            : "Notificações Ativas"}
                </p>
                <p className="text-sm text-gray-600">
                  {preferences.doNotDisturb
            ? "Apenas notificações de emergência serão enviadas"
            : "Recebendo notificações conforme suas preferências"}
                </p>
              </div>
            </div>
            <switch_1.Switch checked={!preferences.doNotDisturb} onCheckedChange={function (checked) {
            return setPreferences(function (prev) { return (__assign(__assign({}, prev), { doNotDisturb: !checked })); });
        }}/>
          </div>
        </div>
      </div>
      {/* Canais de Comunicação */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Settings className="h-5 w-5"/>
            Canais de Comunicação
          </card_1.CardTitle>
          <card_1.CardDescription>
            Configure e verifique seus canais de contato. Canais verificados são
            mais confiáveis para receber notificações importantes.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {preferences.channels.map(function (channel) { return (<div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {channel.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {channel.name}
                      </span>
                      {channel.verified ? (<badge_1.Badge variant="outline" className="text-green-700 border-green-300">
                          <lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>
                          Verificado
                        </badge_1.Badge>) : (<badge_1.Badge variant="outline" className="text-orange-700 border-orange-300">
                          <lucide_react_1.AlertCircle className="h-3 w-3 mr-1"/>
                          Não Verificado
                        </badge_1.Badge>)}
                    </div>
                    <p className="text-sm text-gray-600">{channel.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!channel.verified && (<button_1.Button variant="outline" size="sm" onClick={function () { return verifyChannel(channel.id); }} disabled={loading}>
                      {loading ? <loading_spinner_1.default size="sm"/> : "Verificar"}
                    </button_1.Button>)}
                  <switch_1.Switch checked={channel.enabled} onCheckedChange={function (checked) {
                return updateChannel(channel.id, checked);
            }} disabled={!channel.verified}/>
                </div>
              </div>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>{" "}
      {/* Categorias de Notificação */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Tipos de Notificação</card_1.CardTitle>
          <card_1.CardDescription>
            Configure individualmente como deseja receber cada tipo de
            notificação. Respeite suas preferências de LGPD.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-6">
            {preferences.categories.map(function (category) { return (<div key={category.id} className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {category.icon}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          {category.lgpdConsent && (<badge_1.Badge variant="outline" className="text-blue-700 border-blue-300">
                              <lucide_react_1.Shield className="h-3 w-3 mr-1"/>
                              LGPD Autorizado
                            </badge_1.Badge>)}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <lucide_react_1.Clock className="h-4 w-4"/>
                            <span>
                              Frequência:{" "}
                              {category.frequency === "immediate"
                ? "Imediata"
                : category.frequency === "daily"
                    ? "Diária"
                    : category.frequency === "weekly"
                        ? "Semanal"
                        : "Mensal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Configurações por Canal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {Object.entries(category.settings).map(function (_a) {
                var channelKey = _a[0], enabled = _a[1];
                var channel = preferences.channels.find(function (c) { return c.type === channelKey; });
                if (!channel || !channel.enabled)
                    return null;
                return (<div key={channelKey} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              {channel.icon}
                              <span className="text-sm font-medium">
                                {channel.name}
                              </span>
                            </div>
                            <switch_1.Switch checked={enabled && category.lgpdConsent} onCheckedChange={function (checked) {
                        return updateCategorySetting(category.id, channelKey, checked);
                    }} disabled={!category.lgpdConsent}/>
                          </div>);
            })}
                  </div>

                  {/* Configurações Avançadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label_1.Label htmlFor={"frequency-".concat(category.id)} className="text-sm font-medium">
                        Frequência de Notificação
                      </label_1.Label>
                      <select_1.Select value={category.frequency} onValueChange={function (value) {
                return updateCategory(category.id, "frequency", value);
            }}>
                        <select_1.SelectTrigger className="mt-1">
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="immediate">Imediata</select_1.SelectItem>
                          <select_1.SelectItem value="daily">Diária</select_1.SelectItem>
                          <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                          <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    <div className="flex items-center justify-between pt-6">
                      <div>
                        <label_1.Label className="text-sm font-medium">
                          Respeitar horário de silêncio
                        </label_1.Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Não enviar notificações durante as horas de silêncio
                        </p>
                      </div>
                      <switch_1.Switch checked={category.quietHours} onCheckedChange={function (checked) {
                return updateCategory(category.id, "quietHours", checked);
            }}/>
                    </div>
                  </div>

                  {/* LGPD Consent */}
                  {!category.lgpdConsent && category.id === "marketing" && (<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <lucide_react_1.AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800 mb-1">
                            Consentimento LGPD Necessário
                          </p>
                          <p className="text-yellow-700 mb-3">
                            Para receber notificações de marketing, você precisa
                            autorizar o uso de seus dados para fins promocionais
                            conforme a LGPD.
                          </p>
                          <button_1.Button size="sm" variant="outline" onClick={function () {
                    return updateCategory(category.id, "lgpdConsent", true);
                }} className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                            Autorizar Uso para Marketing
                          </button_1.Button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>{" "}
      {/* Horário de Silêncio */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5"/>
            Horário de Silêncio
          </card_1.CardTitle>
          <card_1.CardDescription>
            Configure um período em que não deseja receber notificações
            não-urgentes.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label_1.Label className="text-sm font-medium">
                  Ativar horário de silêncio
                </label_1.Label>
                <p className="text-xs text-gray-600 mt-1">
                  Notificações urgentes ainda serão enviadas
                </p>
              </div>
              <switch_1.Switch checked={preferences.quietHours.enabled} onCheckedChange={function (checked) {
            return setPreferences(function (prev) { return (__assign(__assign({}, prev), { quietHours: __assign(__assign({}, prev.quietHours), { enabled: checked }) })); });
        }}/>
            </div>

            {preferences.quietHours.enabled && (<div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label_1.Label htmlFor="quiet-start" className="text-sm font-medium">
                    Início do silêncio
                  </label_1.Label>
                  <input_1.Input id="quiet-start" type="time" value={preferences.quietHours.start} onChange={function (e) {
                return setPreferences(function (prev) { return (__assign(__assign({}, prev), { quietHours: __assign(__assign({}, prev.quietHours), { start: e.target.value }) })); });
            }} className="mt-1"/>
                </div>
                <div>
                  <label_1.Label htmlFor="quiet-end" className="text-sm font-medium">
                    Fim do silêncio
                  </label_1.Label>
                  <input_1.Input id="quiet-end" type="time" value={preferences.quietHours.end} onChange={function (e) {
                return setPreferences(function (prev) { return (__assign(__assign({}, prev), { quietHours: __assign(__assign({}, prev.quietHours), { end: e.target.value }) })); });
            }} className="mt-1"/>
                </div>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Configurações Gerais */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Configurações Gerais</card_1.CardTitle>
          <card_1.CardDescription>
            Configurações globais de idioma, fuso horário e modo de emergência.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label_1.Label htmlFor="language" className="text-sm font-medium">
                Idioma das Notificações
              </label_1.Label>
              <select_1.Select value={preferences.language} onValueChange={function (value) {
            return setPreferences(function (prev) { return (__assign(__assign({}, prev), { language: value })); });
        }}>
                <select_1.SelectTrigger className="mt-1">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="pt-BR">Português (Brasil)</select_1.SelectItem>
                  <select_1.SelectItem value="en-US">English (US)</select_1.SelectItem>
                  <select_1.SelectItem value="es-ES">Español</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div>
              <label_1.Label htmlFor="timezone" className="text-sm font-medium">
                Fuso Horário
              </label_1.Label>
              <select_1.Select value={preferences.timezone} onValueChange={function (value) {
            return setPreferences(function (prev) { return (__assign(__assign({}, prev), { timezone: value })); });
        }}>
                <select_1.SelectTrigger className="mt-1">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="America/Sao_Paulo">
                    Brasília (GMT-3)
                  </select_1.SelectItem>
                  <select_1.SelectItem value="America/Manaus">Manaus (GMT-4)</select_1.SelectItem>
                  <select_1.SelectItem value="America/Rio_Branco">
                    Acre (GMT-5)
                  </select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <label_1.Label className="text-sm font-medium text-red-700">
                  Modo Somente Emergência
                </label_1.Label>
                <p className="text-xs text-gray-600 mt-1">
                  Receber apenas notificações críticas e de emergência médica
                </p>
              </div>
              <switch_1.Switch checked={preferences.emergencyOnly} onCheckedChange={function (checked) {
            return setPreferences(function (prev) { return (__assign(__assign({}, prev), { emergencyOnly: checked })); });
        }}/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button_1.Button onClick={handleSavePreferences} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          {saving ? (<>
              <loading_spinner_1.default size="sm"/>
              Salvando...
            </>) : (<>
              <lucide_react_1.CheckCircle className="h-4 w-4"/>
              Salvar Configurações
            </>)}
        </button_1.Button>

        <button_1.Button variant="outline" onClick={function () { return setPreferences(mockPreferences); }} disabled={saving}>
          Restaurar Padrões
        </button_1.Button>

        <button_1.Button variant="outline" onClick={function () {
            // Em implementação real, abrir modal de teste de notificação
            toast({
                title: "Notificação de teste enviada",
                description: "Verifique seus canais de comunicação habilitados.",
            });
        }} disabled={saving}>
          Enviar Teste
        </button_1.Button>
      </div>
      {/* Informações LGPD */}
      <card_1.Card className="border-blue-200 bg-blue-50">
        <card_1.CardContent className="p-6">
          <div className="flex items-start gap-3">
            <lucide_react_1.Shield className="h-6 w-6 text-blue-600 mt-0.5"/>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Privacidade e Consentimento LGPD
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  • Suas preferências de notificação são armazenadas de forma
                  segura e criptografada
                </p>
                <p>
                  • Você pode retirar seu consentimento para qualquer tipo de
                  comunicação a qualquer momento
                </p>
                <p>
                  • Notificações essenciais (consultas, segurança) são enviadas
                  independente das configurações
                </p>
                <p>
                  • Seus dados de contato não são compartilhados com terceiros
                  sem seu consentimento explícito
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  Para mais informações sobre tratamento de dados, consulte
                  nossa
                  <button_1.Button variant="link" className="p-0 h-auto ml-1 text-blue-700 underline">
                    Política de Privacidade
                  </button_1.Button>
                </p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
