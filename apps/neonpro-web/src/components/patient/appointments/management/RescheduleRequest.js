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
exports.RescheduleRequest = RescheduleRequest;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Common rescheduling reasons based on Exa research
var RESCHEDULE_REASONS = [
    'Conflito de agenda',
    'Problema de transporte',
    'Compromisso profissional',
    'Viagem imprevista',
    'Questões de saúde',
    'Preferência de horário',
    'Outro motivo'
];
// Available time slots (would come from API in real implementation)
var TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];
function RescheduleRequest(_a) {
    var _this = this;
    var appointmentId = _a.appointmentId, appointment = _a.appointment, open = _a.open, onOpenChange = _a.onOpenChange, onConfirm = _a.onConfirm;
    var _b = (0, react_1.useState)(undefined), selectedDate = _b[0], setSelectedDate = _b[1];
    var _c = (0, react_1.useState)(''), selectedTime = _c[0], setSelectedTime = _c[1];
    var _d = (0, react_1.useState)(''), selectedReason = _d[0], setSelectedReason = _d[1];
    var _e = (0, react_1.useState)(''), customReason = _e[0], setCustomReason = _e[1];
    var _f = (0, react_1.useState)(false), isSubmitting = _f[0], setIsSubmitting = _f[1];
    var _g = (0, react_1.useState)([]), availableSlots = _g[0], setAvailableSlots = _g[1];
    var _h = (0, react_1.useState)(false), loadingSlots = _h[0], setLoadingSlots = _h[1];
    if (!appointment)
        return null;
    var canReschedule = appointment.can_reschedule;
    var hoursUntil = appointment.hours_until_appointment;
    // Load available slots when date changes
    (0, react_1.useEffect)(function () {
        if (selectedDate && appointment.service_id) {
            setLoadingSlots(true);
            // Simulate API call to get available slots
            setTimeout(function () {
                // In real implementation, this would check professional availability
                var mockAvailableSlots = TIME_SLOTS.filter(function (_, index) { return Math.random() > 0.3; });
                setAvailableSlots(mockAvailableSlots);
                setLoadingSlots(false);
            }, 500);
        }
        else {
            setAvailableSlots([]);
        }
    }, [selectedDate, appointment.service_id]);
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
    var handleDateSelect = function (date) {
        setSelectedDate(date);
        setSelectedTime(''); // Reset time when date changes
    };
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var formattedDate, finalReason, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedDate || !selectedTime || (!selectedReason && !customReason))
                        return [2 /*return*/];
                    formattedDate = (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd');
                    finalReason = customReason.trim() || selectedReason;
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onConfirm(appointmentId, formattedDate, selectedTime, finalReason)
                        // Reset form
                    ];
                case 2:
                    _a.sent();
                    // Reset form
                    setSelectedDate(undefined);
                    setSelectedTime('');
                    setSelectedReason('');
                    setCustomReason('');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error confirming reschedule:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () {
        setSelectedDate(undefined);
        setSelectedTime('');
        setSelectedReason('');
        setCustomReason('');
        onOpenChange(false);
    };
    // Date constraints: minimum 48h in advance, maximum 90 days
    var minDate = (0, date_fns_1.addDays)(new Date(), 2); // 48h minimum
    var maxDate = (0, date_fns_1.addDays)(new Date(), 90);
    // Disable Sundays (common for clinics)
    var isDateDisabled = function (date) {
        return date.getDay() === 0 || !(0, date_fns_1.isAfter)(date, (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(new Date(), 1)));
    };
    var _j = formatAppointmentDateTime(appointment.appointment_date, appointment.appointment_time), date = _j.date, time = _j.time;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-2xl">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.RotateCcw className="h-5 w-5 text-blue-500"/>
            Solicitar Reagendamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Solicite uma nova data e horário para seu agendamento. A solicitação será analisada pela clínica.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Details */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Agendamento atual:</h3>
            <div className="font-semibold">{appointment.service_name}</div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <lucide_react_1.CalendarIcon className="h-4 w-4"/>
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

          {/* Policy Check */}
          {!canReschedule ? (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                <div>
                  <strong>Reagendamento não permitido</strong>
                </div>
                <div className="text-sm mt-1">
                  Solicitações de reagendamento devem ser feitas com pelo menos 48h de antecedência. 
                  Restam apenas {hoursUntil}h para seu agendamento.
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>) : (<alert_1.Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-blue-600"/>
              <alert_1.AlertDescription>
                <div>
                  <strong>Reagendamento permitido</strong>
                </div>
                <div className="text-sm mt-1">
                  Você pode solicitar reagendamento até 48h antes do horário agendado.
                </div>
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {canReschedule && (<>
              {/* New Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label_1.Label className="text-sm font-medium">Nova data *</label_1.Label>
                  <popover_1.Popover>
                    <popover_1.PopoverTrigger asChild>
                      <button_1.Button variant="outline" className={(0, utils_1.cn)('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}>
                        <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4"/>
                        {selectedDate ? ((0, date_fns_1.format)(selectedDate, 'PPP', { locale: locale_1.ptBR })) : ('Selecione uma data')}
                      </button_1.Button>
                    </popover_1.PopoverTrigger>
                    <popover_1.PopoverContent className="w-auto p-0" align="start">
                      <calendar_1.Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={isDateDisabled} fromDate={minDate} toDate={maxDate} initialFocus locale={locale_1.ptBR}/>
                    </popover_1.PopoverContent>
                  </popover_1.Popover>
                  <div className="text-xs text-muted-foreground">
                    • Mínimo: 48h de antecedência
                    <br />
                    • Domingos indisponíveis
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <label_1.Label className="text-sm font-medium">Novo horário *</label_1.Label>
                  <select_1.Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um horário"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {loadingSlots ? (<select_1.SelectItem value="loading" disabled>
                          Carregando horários...
                        </select_1.SelectItem>) : availableSlots.length === 0 ? (<select_1.SelectItem value="none" disabled>
                          {selectedDate ? 'Nenhum horário disponível' : 'Selecione uma data primeiro'}
                        </select_1.SelectItem>) : (availableSlots.map(function (slot) { return (<select_1.SelectItem key={slot} value={slot}>
                            {slot}
                          </select_1.SelectItem>); }))}
                    </select_1.SelectContent>
                  </select_1.Select>
                  <div className="text-xs text-muted-foreground">
                    Duração: {appointment.service_duration} min
                  </div>
                </div>
              </div>

              {/* Reason Selection */}
              <div className="space-y-3">
                <label_1.Label className="text-sm font-medium">Motivo do reagendamento *</label_1.Label>
                <select_1.Select value={selectedReason} onValueChange={setSelectedReason}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o motivo"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {RESCHEDULE_REASONS.map(function (reason) { return (<select_1.SelectItem key={reason} value={reason}>
                        {reason}
                      </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>

                {/* Custom reason field */}
                {(selectedReason === 'Outro motivo' || selectedReason === '') && (<div className="space-y-2">
                    <label_1.Label htmlFor="customReason" className="text-sm">
                      {selectedReason === 'Outro motivo' ? 'Especifique o motivo:' : 'Ou descreva o motivo:'}
                    </label_1.Label>
                    <textarea_1.Textarea id="customReason" placeholder="Descreva o motivo do reagendamento..." value={customReason} onChange={function (e) { return setCustomReason(e.target.value); }} rows={3}/>
                  </div>)}
              </div>

              {/* Request info */}
              <alert_1.Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <lucide_react_1.AlertTriangle className="h-4 w-4 text-blue-600"/>
                <alert_1.AlertDescription>
                  <div>
                    <strong>Processo de reagendamento:</strong>
                  </div>
                  <div className="text-sm mt-1 space-y-1">
                    <div>• Sua solicitação será analisada em até 24h</div>
                    <div>• Você receberá confirmação por email e WhatsApp</div>
                    <div>• Se aprovada, seu agendamento atual será automaticamente cancelado</div>
                    <div>• Se não houver disponibilidade, você receberá opções alternativas</div>
                  </div>
                </alert_1.AlertDescription>
              </alert_1.Alert>
            </>)}
        </div>

        <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3">
          <button_1.Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancelar
          </button_1.Button>
          {canReschedule && (<button_1.Button onClick={handleConfirm} disabled={!selectedDate ||
                !selectedTime ||
                (!selectedReason && !customReason.trim()) ||
                isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Enviando...' : 'Solicitar Reagendamento'}
            </button_1.Button>)}
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
