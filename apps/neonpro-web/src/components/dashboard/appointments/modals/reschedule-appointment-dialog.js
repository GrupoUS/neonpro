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
exports.RescheduleAppointmentDialog = RescheduleAppointmentDialog;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Form validation schema
var rescheduleSchema = zod_2.z.object({
  new_start_time: zod_2.z.string().min(1, "Nova data e horário são obrigatórios"),
  reschedule_reason: zod_2.z.string().min(1, "Motivo do reagendamento é obrigatório"),
  notify_patient: zod_2.z.boolean().default(true),
});
function RescheduleAppointmentDialog(_a) {
  var _this = this;
  var _b, _c;
  var appointment = _a.appointment,
    open = _a.open,
    onOpenChange = _a.onOpenChange,
    onReschedule = _a.onReschedule;
  var _d = (0, react_1.useState)([]),
    availableSlots = _d[0],
    setAvailableSlots = _d[1];
  var _e = (0, react_1.useState)(false),
    loadingSlots = _e[0],
    setLoadingSlots = _e[1];
  var _f = (0, react_1.useState)(""),
    conflictError = _f[0],
    setConflictError = _f[1];
  var _g = (0, react_1.useState)(false),
    isRescheduling = _g[0],
    setIsRescheduling = _g[1];
  var _h = (0, react_1.useState)(""),
    selectedDate = _h[0],
    setSelectedDate = _h[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(rescheduleSchema),
    defaultValues: {
      new_start_time: "",
      reschedule_reason: "",
      notify_patient: true,
    },
  });
  // Reset form when appointment changes
  (0, react_1.useEffect)(
    function () {
      if (appointment && open) {
        form.reset({
          new_start_time: "",
          reschedule_reason: "",
          notify_patient: true,
        });
        setSelectedDate("");
        setAvailableSlots([]);
        setConflictError("");
      }
    },
    [appointment, open, form],
  );
  // Load available slots when date is selected
  (0, react_1.useEffect)(
    function () {
      if (selectedDate && appointment) {
        loadAvailableSlots(selectedDate);
      }
    },
    [selectedDate, appointment],
  );
  var loadAvailableSlots = function (date) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!appointment) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            setLoadingSlots(true);
            return [
              4 /*yield*/,
              fetch(
                "/api/appointments/available-slots?" +
                  new URLSearchParams({
                    professional_id: appointment.professional_id,
                    service_type_id: appointment.service_type_id,
                    date: date,
                    exclude_appointment_id: appointment.id,
                  }),
              ),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (response.ok) {
              setAvailableSlots(data.available_slots || []);
            } else {
              sonner_1.toast.error("Erro ao carregar horários disponíveis");
            }
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading available slots:", error_1);
            sonner_1.toast.error("Erro ao carregar horários disponíveis");
            return [3 /*break*/, 6];
          case 5:
            setLoadingSlots(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Check for conflicts when time changes
  var checkConflicts = function (newStartTime) {
    return __awaiter(_this, void 0, void 0, function () {
      var startTime, serviceDuration, endTime, response, data, conflicts, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!appointment || !newStartTime) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, , 5]);
            setConflictError("");
            startTime = new Date(newStartTime);
            serviceDuration = appointment.service ? appointment.service.duration_minutes : 60;
            endTime = new Date(startTime.getTime() + serviceDuration * 60000);
            return [
              4 /*yield*/,
              fetch("/api/appointments/check-conflicts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  professional_id: appointment.professional_id,
                  start_time: startTime.toISOString(),
                  end_time: endTime.toISOString(),
                  exclude_appointment_id: appointment.id,
                }),
              }),
            ];
          case 2:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _b.sent();
            if (
              data.has_conflict &&
              ((_a = data.conflicting_appointments) === null || _a === void 0 ? void 0 : _a.length)
            ) {
              conflicts = data.conflicting_appointments
                .map(function (c) {
                  return "".concat(c.patient_name, " (").concat(
                    (0, date_fns_1.format)(new Date(c.start_time), "HH:mm", {
                      locale: locale_1.ptBR,
                    }),
                    ")",
                  );
                })
                .join(", ");
              setConflictError("Conflito detectado com: ".concat(conflicts));
            }
            return [3 /*break*/, 5];
          case 4:
            error_2 = _b.sent();
            console.error("Error checking conflicts:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Handle date selection
  var handleDateChange = function (date) {
    setSelectedDate(date);
    form.setValue("new_start_time", "");
  };
  // Handle slot selection
  var handleSlotSelect = function (slot) {
    if (!slot.is_available) return;
    var dateTimeValue = (0, date_fns_1.format)(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm");
    form.setValue("new_start_time", dateTimeValue);
    checkConflicts(slot.start_time);
  };
  // Handle form submission
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (conflictError) {
              sonner_1.toast.error("Resolva os conflitos antes de continuar");
              return [2 /*return*/];
            }
            if (!appointment) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setIsRescheduling(true);
            return [
              4 /*yield*/,
              onReschedule(
                appointment.id,
                new Date(data.new_start_time).toISOString(),
                data.reschedule_reason,
              ),
            ];
          case 2:
            _a.sent();
            onOpenChange(false);
            sonner_1.toast.success("Agendamento reagendado com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Error rescheduling appointment:", error_3);
            sonner_1.toast.error("Erro ao reagendar agendamento");
            return [3 /*break*/, 5];
          case 4:
            setIsRescheduling(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var getMinDate = function () {
    // Allow rescheduling from tomorrow onwards
    return (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 1), "yyyy-MM-dd");
  };
  var getMaxDate = function () {
    // Allow rescheduling up to 3 months ahead
    return (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 90), "yyyy-MM-dd");
  };
  if (!appointment) return null;
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-5 w-5" />
            Reagendar Agendamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Selecione uma nova data e horário para o agendamento de{" "}
            {(_b = appointment.patient) === null || _b === void 0 ? void 0 : _b.full_name}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {/* Current Appointment Info */}
        <card_1.Card className="bg-muted/50">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium">Agendamento Atual</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {(0, date_fns_1.format)(new Date(appointment.start_time), "dd 'de' MMMM, yyyy", {
                  locale: locale_1.ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {(0, date_fns_1.format)(new Date(appointment.start_time), "HH:mm", {
                  locale: locale_1.ptBR,
                })}{" "}
                -
                {appointment.end_time &&
                  (0, date_fns_1.format)(new Date(appointment.end_time), "HH:mm", {
                    locale: locale_1.ptBR,
                  })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline">
                {((_c = appointment.service) === null || _c === void 0 ? void 0 : _c.name) ||
                  "Serviço não especificado"}
              </badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Conflict Alert */}
            {conflictError && (
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertCircle className="h-4 w-4" />
                <alert_1.AlertDescription>{conflictError}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {/* Date Selection */}
            <div className="space-y-3">
              <form_1.FormLabel>Selecione uma nova data</form_1.FormLabel>
              <input_1.Input
                type="date"
                value={selectedDate}
                onChange={function (e) {
                  return handleDateChange(e.target.value);
                }}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full"
              />
            </div>

            {/* Available Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <form_1.FormLabel>
                  Horários disponíveis para{" "}
                  {(0, date_fns_1.format)(new Date(selectedDate), "dd 'de' MMMM", {
                    locale: locale_1.ptBR,
                  })}
                </form_1.FormLabel>

                {loadingSlots
                  ? <div className="flex items-center justify-center py-8">
                      <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Carregando horários...</span>
                    </div>
                  : availableSlots.length > 0
                    ? <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                        {availableSlots.map(function (slot, index) {
                          return (
                            <button_1.Button
                              key={index}
                              type="button"
                              variant={
                                form.watch("new_start_time") ===
                                (0, date_fns_1.format)(
                                  new Date(slot.start_time),
                                  "yyyy-MM-dd'T'HH:mm",
                                )
                                  ? "default"
                                  : slot.is_available
                                    ? "outline"
                                    : "secondary"
                              }
                              size="sm"
                              disabled={!slot.is_available}
                              onClick={function () {
                                return handleSlotSelect(slot);
                              }}
                              className="relative"
                            >
                              {(0, date_fns_1.format)(new Date(slot.start_time), "HH:mm")}
                              {slot.is_available &&
                                form.watch("new_start_time") ===
                                  (0, date_fns_1.format)(
                                    new Date(slot.start_time),
                                    "yyyy-MM-dd'T'HH:mm",
                                  ) && (
                                  <lucide_react_1.CheckCircle className="h-3 w-3 absolute -top-1 -right-1" />
                                )}
                            </button_1.Button>
                          );
                        })}
                      </div>
                    : <div className="text-center py-8 text-muted-foreground">
                        <lucide_react_1.Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum horário disponível para esta data</p>
                      </div>}
              </div>
            )}

            {/* Manual Time Selection (fallback) */}
            <form_1.FormField
              control={form.control}
              name="new_start_time"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Ou digite data e horário manualmente</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input
                        type="datetime-local"
                        {...field}
                        min={(0, date_fns_1.format)(
                          (0, date_fns_1.addDays)(new Date(), 1),
                          "yyyy-MM-dd'T'HH:mm",
                        )}
                        max={(0, date_fns_1.format)(
                          (0, date_fns_1.addDays)(new Date(), 90),
                          "yyyy-MM-dd'T'23:59",
                        )}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Reschedule Reason */}
            <form_1.FormField
              control={form.control}
              name="reschedule_reason"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Motivo do Reagendamento</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea
                        placeholder="Descreva o motivo do reagendamento..."
                        {...field}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            <dialog_1.DialogFooter className="gap-2 sm:gap-0">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={function () {
                  return onOpenChange(false);
                }}
                disabled={isRescheduling}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                type="submit"
                disabled={isRescheduling || !!conflictError || !form.watch("new_start_time")}
              >
                {isRescheduling && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
                Reagendar
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
