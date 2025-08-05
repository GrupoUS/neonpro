'use client';
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
exports.BookingConfirmation = BookingConfirmation;
var alert_1 = require("@/components/ui/alert");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function BookingConfirmation(_a) {
    var _this = this;
    var service = _a.service, professional = _a.professional, timeSlot = _a.timeSlot, notes = _a.notes, specialRequests = _a.specialRequests, onConfirm = _a.onConfirm, onBack = _a.onBack, _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = (0, react_1.useState)(false), isConfirming = _c[0], setIsConfirming = _c[1];
    var _d = (0, react_1.useState)(''), confirmationError = _d[0], setConfirmationError = _d[1];
    var _e = (0, react_1.useState)(false), agreedToTerms = _e[0], setAgreedToTerms = _e[1];
    var _f = (0, react_1.useState)({
        emailConfirmation: true,
        smsConfirmation: false,
        emailReminder: true,
        smsReminder: false
    }), notificationPrefs = _f[0], setNotificationPrefs = _f[1];
    var formatAppointmentDate = function () {
        var date = new Date(timeSlot.datetime);
        return (0, date_fns_1.format)(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: locale_1.ptBR });
    };
    var formatAppointmentTime = function () {
        var date = new Date(timeSlot.datetime);
        return (0, date_fns_1.format)(date, 'HH:mm', { locale: locale_1.ptBR });
    };
    var getInitials = function (name) {
        return name
            .split(' ')
            .map(function (n) { return n[0]; })
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!agreedToTerms) {
                        setConfirmationError('Você deve aceitar os termos e condições para prosseguir.');
                        return [2 /*return*/];
                    }
                    setIsConfirming(true);
                    setConfirmationError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onConfirm()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error confirming booking:', error_1);
                    setConfirmationError('Erro ao confirmar agendamento. Tente novamente.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsConfirming(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleNotificationChange = function (key, value) {
        setNotificationPrefs(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    return (<div className={"space-y-6 ".concat(className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Confirmar Agendamento
        </h2>
        <p className="text-gray-600">
          Revise os detalhes do seu agendamento antes de confirmar
        </p>
      </div>

      {/* Appointment Summary */}
      <card_1.Card className="border-2 border-blue-200">
        <card_1.CardHeader className="bg-blue-50">
          <card_1.CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <lucide_react_1.CheckCircle2 className="h-5 w-5"/>
            Resumo do Agendamento
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="p-6 space-y-4">
          {/* Service Information */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
              <lucide_react_1.FileText className="h-6 w-6"/>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <badge_1.Badge variant="outline" className="mt-1 capitalize">
                {service.category}
              </badge_1.Badge>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <lucide_react_1.Clock className="h-4 w-4"/>
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center gap-1">
                  <lucide_react_1.DollarSign className="h-4 w-4"/>
                  <span>R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <separator_1.Separator />

          {/* Professional Information */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full">
              {professional ? (<avatar_1.Avatar className="w-12 h-12">
                  <avatar_1.AvatarImage src={professional.avatar_url || undefined} alt={"Foto de ".concat(professional.name)}/>
                  <avatar_1.AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(professional.name)}
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>) : (<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <lucide_react_1.User className="h-6 w-6"/>
                </div>)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {professional ? professional.name : 'Qualquer profissional disponível'}
              </h3>
              {professional && professional.specialties.length > 0 && (<div className="flex flex-wrap gap-1 mt-1">
                  {professional.specialties.slice(0, 2).map(function (specialty) { return (<badge_1.Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </badge_1.Badge>); })}
                  {professional.specialties.length > 2 && (<badge_1.Badge variant="secondary" className="text-xs">
                      +{professional.specialties.length - 2}
                    </badge_1.Badge>)}
                </div>)}
            </div>
          </div>

          <separator_1.Separator />

          {/* Date and Time */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
              <lucide_react_1.Calendar className="h-6 w-6"/>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 capitalize">
                {formatAppointmentDate()}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-lg font-medium text-green-600">
                <lucide_react_1.Clock className="h-5 w-5"/>
                <span>{formatAppointmentTime()}</span>
              </div>
            </div>
          </div>

          {/* Notes and Special Requests */}
          {(notes.trim() || specialRequests.length > 0) && (<>
              <separator_1.Separator />
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600">
                  <lucide_react_1.MessageSquare className="h-6 w-6"/>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Observações e Solicitações
                  </h3>
                  {specialRequests.length > 0 && (<div className="space-y-1 mb-3">
                      {specialRequests.map(function (request, index) { return (<div key={index} className="text-sm text-gray-700">
                          • {request}
                        </div>); })}
                    </div>)}
                  {notes.trim() && (<div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                      {notes.split('\n').map(function (line, index) { return (<div key={index}>{line || <br />}</div>); })}
                    </div>)}
                </div>
              </div>
            </>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Notification Preferences */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Preferências de Notificação</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-500"/>
                Confirmação do Agendamento
              </h4>
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-3">
                  <checkbox_1.Checkbox id="email-confirmation" checked={notificationPrefs.emailConfirmation} onCheckedChange={function (checked) { return handleNotificationChange('emailConfirmation', checked); }}/>
                  <label_1.Label htmlFor="email-confirmation" className="flex items-center gap-2 text-sm">
                    <lucide_react_1.Mail className="h-4 w-4"/>
                    Por e-mail
                  </label_1.Label>
                </div>
                <div className="flex items-center space-x-3">
                  <checkbox_1.Checkbox id="sms-confirmation" checked={notificationPrefs.smsConfirmation} onCheckedChange={function (checked) { return handleNotificationChange('smsConfirmation', checked); }}/>
                  <label_1.Label htmlFor="sms-confirmation" className="flex items-center gap-2 text-sm">
                    <lucide_react_1.Smartphone className="h-4 w-4"/>
                    Por SMS
                  </label_1.Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4 text-blue-500"/>
                Lembretes da Consulta
              </h4>
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-3">
                  <checkbox_1.Checkbox id="email-reminder" checked={notificationPrefs.emailReminder} onCheckedChange={function (checked) { return handleNotificationChange('emailReminder', checked); }}/>
                  <label_1.Label htmlFor="email-reminder" className="flex items-center gap-2 text-sm">
                    <lucide_react_1.Mail className="h-4 w-4"/>
                    Por e-mail (24h antes)
                  </label_1.Label>
                </div>
                <div className="flex items-center space-x-3">
                  <checkbox_1.Checkbox id="sms-reminder" checked={notificationPrefs.smsReminder} onCheckedChange={function (checked) { return handleNotificationChange('smsReminder', checked); }}/>
                  <label_1.Label htmlFor="sms-reminder" className="flex items-center gap-2 text-sm">
                    <lucide_react_1.Smartphone className="h-4 w-4"/>
                    Por SMS (2h antes)
                  </label_1.Label>
                </div>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Terms and Conditions */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <checkbox_1.Checkbox id="terms-agreement" checked={agreedToTerms} onCheckedChange={function (checked) { return setAgreedToTerms(checked); }} className="mt-1"/>
            <label_1.Label htmlFor="terms-agreement" className="text-sm text-gray-700 cursor-pointer">
              Li e aceito os{' '}
              <button className="text-blue-600 hover:underline font-medium">
                termos e condições
              </button>
              {' '}e a{' '}
              <button className="text-blue-600 hover:underline font-medium">
                política de privacidade
              </button>
              {' '}da clínica. Autorizo o tratamento dos meus dados pessoais 
              conforme a Lei Geral de Proteção de Dados (LGPD).
            </label_1.Label>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Error Display */}
      {confirmationError && (<alert_1.Alert className="border-red-200 bg-red-50">
          <lucide_react_1.AlertCircle className="h-4 w-4"/>
          <alert_1.AlertDescription className="text-red-700">
            {confirmationError}
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button_1.Button variant="outline" onClick={onBack} disabled={isConfirming} className="w-full sm:w-auto">
          Voltar
        </button_1.Button>
        <button_1.Button onClick={handleConfirm} disabled={isConfirming || !agreedToTerms} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
          {isConfirming ? (<>
              <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              Confirmando...
            </>) : (<>
              <lucide_react_1.CheckCircle2 className="mr-2 h-4 w-4"/>
              Confirmar Agendamento
            </>)}
        </button_1.Button>
      </div>

      {/* Important Notice */}
      <alert_1.Alert className="border-blue-200 bg-blue-50">
        <lucide_react_1.AlertCircle className="h-4 w-4"/>
        <alert_1.AlertDescription className="text-blue-700">
          <strong>Importante:</strong> Após a confirmação, você receberá as notificações 
          selecionadas. Para cancelar ou reagendar, entre em contato conosco com pelo 
          menos 24 horas de antecedência.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    </div>);
}
