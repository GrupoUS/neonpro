'use client';
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
exports.AppointmentCancellation = AppointmentCancellation;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var radio_group_1 = require("@/components/ui/radio-group");
var textarea_1 = require("@/components/ui/textarea");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var CANCELLATION_REASONS = [
    { value: 'illness', label: 'Doença/Mal-estar', emergency: false },
    { value: 'work_conflict', label: 'Conflito de trabalho', emergency: false },
    { value: 'transportation', label: 'Problemas de transporte', emergency: false },
    { value: 'family_emergency', label: 'Emergência familiar', emergency: true },
    { value: 'medical_emergency', label: 'Emergência médica', emergency: true },
    { value: 'forgot', label: 'Esqueci do agendamento', emergency: false },
    { value: 'schedule_change', label: 'Mudança na agenda', emergency: false },
    { value: 'other', label: 'Outro motivo', emergency: false }
];
function AppointmentCancellation(_a) {
    var _this = this;
    var appointmentId = _a.appointmentId, appointment = _a.appointment, open = _a.open, onOpenChange = _a.onOpenChange, onConfirm = _a.onConfirm, cancellationPolicies = _a.cancellationPolicies;
    var _b = (0, react_1.useState)(''), selectedReason = _b[0], setSelectedReason = _b[1];
    var _c = (0, react_1.useState)(''), customReason = _c[0], setCustomReason = _c[1];
    var _d = (0, react_1.useState)(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    if (!appointment)
        return null;
    // Check if cancellation is allowed
    var canCancel = appointment.can_cancel;
    var hoursUntil = appointment.hours_until_appointment;
    var minimumHours = (cancellationPolicies === null || cancellationPolicies === void 0 ? void 0 : cancellationPolicies.minimum_hours) || 24;
    // Check if selected reason is emergency
    var selectedReasonData = CANCELLATION_REASONS.find(function (r) { return r.value === selectedReason; });
    var isEmergencyReason = (selectedReasonData === null || selectedReasonData === void 0 ? void 0 : selectedReasonData.emergency) || false;
    // Calculate fees
    var feeApplies = (cancellationPolicies === null || cancellationPolicies === void 0 ? void 0 : cancellationPolicies.fee_applies) && !isEmergencyReason && !canCancel;
    var feeAmount = (cancellationPolicies === null || cancellationPolicies === void 0 ? void 0 : cancellationPolicies.fee_amount) || 0;
    var formatAppointmentDateTime = function (date, time) {
        try {
            var dateTime = (0, date_fns_1.parseISO)("".concat(date, "T").concat(time));
            return {
                date: (0, date_fns_1.format)(dateTime, 'EEEE, dd MMMM yyyy', { locale: locale_1.ptBR }),
                time: (0, date_fns_1.format)(dateTime, 'HH:mm', { locale: locale_1.ptBR })
            };
        }
        catch (error) {
            return { date: date, time: time };
        }
    };
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var finalReason, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedReason)
                        return [2 /*return*/];
                    finalReason = selectedReason === 'other' && customReason ? customReason : selectedReason;
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onConfirm(appointmentId, finalReason)
                        // Reset form
                    ];
                case 2:
                    _a.sent();
                    // Reset form
                    setSelectedReason('');
                    setCustomReason('');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error confirming cancellation:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () {
        setSelectedReason('');
        setCustomReason('');
        onOpenChange(false);
    };
    var _e = formatAppointmentDateTime(appointment.appointment_date, appointment.appointment_time), date = _e.date, time = _e.time;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-500"/>
            Cancelar Agendamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Confirme o cancelamento do seu agendamento. Esta ação não pode ser desfeita.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">{appointment.service_name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <lucide_react_1.Calendar className="h-4 w-4"/>
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <lucide_react_1.Clock className="h-4 w-4"/>
                <span>{time}</span>
              </div>
            </div>
            {appointment.professional_name && (<div className="text-sm text-muted-foreground">
                Profissional: {appointment.professional_name}
              </div>)}
          </div>

          {/* Policy Warning */}
          {!canCancel ? (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Cancelamento fora do prazo</strong>
                  </div>
                  <div className="text-sm">
                    • Restam apenas {hoursUntil}h para o agendamento
                    <br />
                    • Política da clínica exige {minimumHours}h de antecedência
                    <br />
                    • Apenas emergências médicas/familiares são aceitas
                  </div>
                  {feeApplies && feeAmount > 0 && (<div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                      <lucide_react_1.DollarSign className="h-4 w-4"/>
                      <span className="text-sm">
                        Taxa de cancelamento tardio: <strong>R$ {feeAmount.toFixed(2)}</strong>
                      </span>
                    </div>)}
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>) : (<alert_1.Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-green-600"/>
              <alert_1.AlertDescription>
                <div>
                  <strong>Cancelamento permitido</strong>
                </div>
                <div className="text-sm mt-1">
                  Você tem {hoursUntil}h até o agendamento, dentro do prazo de {minimumHours}h exigido.
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Reason Selection */}
          <div className="space-y-3">
            <label_1.Label className="text-sm font-medium">Motivo do cancelamento *</label_1.Label>
            <radio_group_1.RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {CANCELLATION_REASONS.map(function (reason) { return (<div key={reason.value} className="flex items-center space-x-2">
                  <radio_group_1.RadioGroupItem value={reason.value} id={reason.value}/>
                  <label_1.Label htmlFor={reason.value} className={"text-sm cursor-pointer ".concat(reason.emergency ? 'font-medium text-orange-600' : '')}>
                    {reason.label}
                    {reason.emergency && <span className="ml-1 text-xs">(Emergência)</span>}
                  </label_1.Label>
                </div>); })}
            </radio_group_1.RadioGroup>

            {/* Custom reason field */}
            {selectedReason === 'other' && (<div className="space-y-2">
                <label_1.Label htmlFor="customReason" className="text-sm">Especifique o motivo:</label_1.Label>
                <textarea_1.Textarea id="customReason" placeholder="Descreva o motivo do cancelamento..." value={customReason} onChange={function (e) { return setCustomReason(e.target.value); }} rows={3}/>
              </div>)}
          </div>

          {/* Emergency Override Info */}
          {!canCancel && isEmergencyReason && (<alert_1.Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-blue-600"/>
              <alert_1.AlertDescription>
                <div>
                  <strong>Exceção por emergência</strong>
                </div>
                <div className="text-sm mt-1">
                  Emergências médicas e familiares são isentas da política de cancelamento.
                  {feeApplies && feeAmount > 0 && " Taxa de cancelamento não será aplicada."}
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Terms confirmation */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <div className="font-medium mb-1">Importante:</div>
            <div>• O cancelamento será processado imediatamente</div>
            <div>• Você receberá uma confirmação por email</div>
            <div>• Para reagendar, será necessário fazer um novo agendamento</div>
            {feeApplies && feeAmount > 0 && !isEmergencyReason && (<div>• A taxa de cancelamento será cobrada na próxima consulta</div>)}
          </div>
        </div>

        <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3">
          <button_1.Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="w-full sm:w-auto">
            Manter Agendamento
          </button_1.Button>
          <button_1.Button variant="destructive" onClick={handleConfirm} disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim()) || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
