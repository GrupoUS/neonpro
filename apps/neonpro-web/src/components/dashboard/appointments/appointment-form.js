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
exports.AppointmentForm = AppointmentForm;
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var form_1 = require("@/components/ui/form");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var zod_1 = require("@hookform/resolvers/zod");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var sonner_1 = require("sonner");
var zod_2 = require("zod");
// Form validation schema
var appointmentFormSchema = zod_2.z.object({
  patient_id: zod_2.z.string().min(1, "Selecione um paciente"),
  professional_id: zod_2.z.string().min(1, "Selecione um profissional"),
  service_type_id: zod_2.z.string().min(1, "Selecione um tipo de serviço"),
  appointment_date: zod_2.z.date({
    required_error: "Selecione uma data",
  }),
  start_time: zod_2.z.string().min(1, "Selecione um horário"),
  duration_minutes: zod_2.z.number().min(15, "Duração mínima é 15 minutos"),
  notes: zod_2.z.string().optional(),
  internal_notes: zod_2.z.string().optional(),
});
function AppointmentForm(_a) {
  var _this = this;
  var patients = _a.patients,
    professionals = _a.professionals,
    serviceTypes = _a.serviceTypes,
    onSuccess = _a.onSuccess,
    defaultValues = _a.defaultValues;
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var _c = (0, react_1.useState)([]),
    conflicts = _c[0],
    setConflicts = _c[1];
  var _d = (0, react_1.useState)([]),
    availableSlots = _d[0],
    setAvailableSlots = _d[1];
  var router = (0, navigation_1.useRouter)();
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(appointmentFormSchema),
    defaultValues: __assign(
      {
        appointment_date:
          (defaultValues === null || defaultValues === void 0
            ? void 0
            : defaultValues.appointment_date) || new Date(),
        start_time:
          (defaultValues === null || defaultValues === void 0
            ? void 0
            : defaultValues.start_time) || "",
        duration_minutes: 60,
        notes:
          (defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.notes) || "",
        internal_notes:
          (defaultValues === null || defaultValues === void 0
            ? void 0
            : defaultValues.internal_notes) || "",
      },
      defaultValues,
    ),
  });
  // Generate time slots (15-minute intervals)
  var generateTimeSlots = function () {
    var slots = [];
    for (var hour = 8; hour < 18; hour++) {
      for (var minute = 0; minute < 60; minute += 15) {
        var timeString = ""
          .concat(hour.toString().padStart(2, "0"), ":")
          .concat(minute.toString().padStart(2, "0"));
        slots.push(timeString);
      }
    }
    return slots;
  };
  var timeSlots = generateTimeSlots();
  // Check for conflicts when professional, date, or time changes
  var checkConflicts = function (professionalId, date, startTime, durationMinutes) {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, hour, minute, startDateTime, endDateTime, response, result, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            (_a = startTime.split(":").map(Number)), (hour = _a[0]), (minute = _a[1]);
            startDateTime = new Date(date);
            startDateTime.setHours(hour, minute, 0, 0);
            endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
            return [
              4 /*yield*/,
              fetch("/api/appointments/check-conflicts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  professional_id: professionalId,
                  start_time: startDateTime.toISOString(),
                  end_time: endDateTime.toISOString(),
                }),
              }),
            ];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _b.sent();
            if (result.has_conflict) {
              setConflicts(result.conflicting_appointments || []);
              return [2 /*return*/, true];
            } else {
              setConflicts([]);
              return [2 /*return*/, false];
            }
            return [3 /*break*/, 4];
          case 3:
            error_1 = _b.sent();
            console.error("Error checking conflicts:", error_1);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Load available slots for selected professional and date
  var loadAvailableSlots = function (professionalId, date) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, result_1, slots, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch(
                "/api/appointments/available-slots?professional_id="
                  .concat(professionalId, "&date=")
                  .concat((0, date_fns_1.format)(date, "yyyy-MM-dd")),
              ),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result_1 = _a.sent();
            if (result_1.success) {
              slots = result_1.data
                .map(function (slot) {
                  return (0, date_fns_1.format)(new Date(slot.slot_start), "HH:mm");
                })
                .filter(function (slot, index, arr) {
                  return result_1.data[index].is_available;
                });
              setAvailableSlots(slots);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error loading available slots:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Watch for changes that require conflict checking
  var watchedProfessional = form.watch("professional_id");
  var watchedDate = form.watch("appointment_date");
  var watchedTime = form.watch("start_time");
  var watchedDuration = form.watch("duration_minutes");
  // Effect to check conflicts and load slots
  (0, react_1.useEffect)(
    function () {
      if (watchedProfessional && watchedDate) {
        loadAvailableSlots(watchedProfessional, watchedDate);
        if (watchedTime && watchedDuration) {
          checkConflicts(watchedProfessional, watchedDate, watchedTime, watchedDuration);
        }
      }
    },
    [watchedProfessional, watchedDate, watchedTime, watchedDuration],
  );
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var hasConflict,
        _a,
        hour,
        minute,
        startDateTime,
        endDateTime,
        appointmentData,
        response,
        result,
        error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            setIsSubmitting(true);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, 6, 7]);
            return [
              4 /*yield*/,
              checkConflicts(
                data.professional_id,
                data.appointment_date,
                data.start_time,
                data.duration_minutes,
              ),
            ];
          case 2:
            hasConflict = _b.sent();
            if (hasConflict) {
              sonner_1.toast.error(
                "Conflito de horário detectado. Por favor, escolha outro horário.",
              );
              setIsSubmitting(false);
              return [2 /*return*/];
            }
            (_a = data.start_time.split(":").map(Number)), (hour = _a[0]), (minute = _a[1]);
            startDateTime = new Date(data.appointment_date);
            startDateTime.setHours(hour, minute, 0, 0);
            endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + data.duration_minutes);
            appointmentData = {
              patient_id: data.patient_id,
              professional_id: data.professional_id,
              service_type_id: data.service_type_id,
              start_time: startDateTime,
              end_time: endDateTime,
              notes: data.notes || undefined,
              internal_notes: data.internal_notes || undefined,
            };
            return [
              4 /*yield*/,
              fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData),
              }),
            ];
          case 3:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 4:
            result = _b.sent();
            if (result.success && result.appointment_id) {
              sonner_1.toast.success("Agendamento criado com sucesso!");
              if (onSuccess) {
                onSuccess(result.appointment_id);
              } else {
                router.push("/dashboard/appointments");
              }
            } else {
              sonner_1.toast.error(result.error_message || "Erro ao criar agendamento");
            }
            return [3 /*break*/, 7];
          case 5:
            error_3 = _b.sent();
            console.error("Error creating appointment:", error_3);
            sonner_1.toast.error("Erro inesperado ao criar agendamento");
            return [3 /*break*/, 7];
          case 6:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <form_1.Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <lucide_react_1.User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Paciente</h3>
            </div>

            <form_1.FormField
              control={form.control}
              name="patient_id"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Selecionar Paciente</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Escolha um paciente" />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {patients.map(function (patient) {
                          return (
                            <select_1.SelectItem key={patient.id} value={patient.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{patient.full_name}</span>
                                {patient.phone && (
                                  <span className="text-sm text-muted-foreground">
                                    {patient.phone}
                                  </span>
                                )}
                              </div>
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />
          </div>

          {/* Professional & Service Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <lucide_react_1.Clock className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Serviço & Profissional</h3>
            </div>

            <form_1.FormField
              control={form.control}
              name="service_type_id"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Tipo de Serviço</form_1.FormLabel>
                    <select_1.Select
                      onValueChange={function (value) {
                        field.onChange(value);
                        var service = serviceTypes.find(function (s) {
                          return s.id === value;
                        });
                        if (service) {
                          form.setValue("duration_minutes", service.duration_minutes);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Escolha um serviço" />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {serviceTypes.map(function (service) {
                          return (
                            <select_1.SelectItem key={service.id} value={service.id}>
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium">{service.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {service.duration_minutes}min
                                </span>
                              </div>
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            <form_1.FormField
              control={form.control}
              name="professional_id"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Profissional</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Escolha um profissional" />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {professionals.map(function (professional) {
                          return (
                            <select_1.SelectItem key={professional.id} value={professional.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{professional.full_name}</span>
                                {professional.specialization && (
                                  <span className="text-sm text-muted-foreground">
                                    {professional.specialization}
                                  </span>
                                )}
                              </div>
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="grid gap-6 md:grid-cols-2">
          <form_1.FormField
            control={form.control}
            name="appointment_date"
            render={function (_a) {
              var field = _a.field;
              return (
                <form_1.FormItem className="flex flex-col">
                  <form_1.FormLabel>Data do Agendamento</form_1.FormLabel>
                  <popover_1.Popover>
                    <popover_1.PopoverTrigger asChild>
                      <form_1.FormControl>
                        <button_1.Button
                          variant="outline"
                          className={(0, utils_1.cn)(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? (0, date_fns_1.format)(field.value, "PPP", { locale: locale_1.ptBR })
                            : <span>Escolha uma data</span>}
                          <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </button_1.Button>
                      </form_1.FormControl>
                    </popover_1.PopoverTrigger>
                    <popover_1.PopoverContent className="w-auto p-0" align="start">
                      <calendar_1.Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={function (date) {
                          return date < new Date() || date < new Date("1900-01-01");
                        }}
                        initialFocus
                      />
                    </popover_1.PopoverContent>
                  </popover_1.Popover>
                  <form_1.FormMessage />
                </form_1.FormItem>
              );
            }}
          />

          <form_1.FormField
            control={form.control}
            name="start_time"
            render={function (_a) {
              var field = _a.field;
              return (
                <form_1.FormItem>
                  <form_1.FormLabel>Horário</form_1.FormLabel>
                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Escolha um horário" />
                      </select_1.SelectTrigger>
                    </form_1.FormControl>
                    <select_1.SelectContent>
                      {timeSlots.map(function (time) {
                        var isAvailable = availableSlots.includes(time);
                        return (
                          <select_1.SelectItem
                            key={time}
                            value={time}
                            disabled={!isAvailable}
                            className={(0, utils_1.cn)(
                              !isAvailable && "opacity-50 cursor-not-allowed",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {isAvailable
                                ? <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-500" />
                                : <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />}
                              <span>{time}</span>
                            </div>
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormDescription>
                    {availableSlots.length > 0
                      ? "".concat(availableSlots.length, " hor\u00E1rios dispon\u00EDveis")
                      : "Carregando horários disponíveis..."}
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>
              );
            }}
          />
        </div>

        {/* Conflict Warning */}
        {conflicts.length > 0 && (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <lucide_react_1.AlertCircle className="h-4 w-4" />
              <h4 className="font-medium">Conflito de Horário Detectado</h4>
            </div>
            <p className="text-red-600 text-sm mt-1">
              O profissional já possui agendamento neste horário. Por favor, escolha outro horário
              disponível.
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="grid gap-4 md:grid-cols-2">
          <form_1.FormField
            control={form.control}
            name="notes"
            render={function (_a) {
              var field = _a.field;
              return (
                <form_1.FormItem>
                  <form_1.FormLabel>Observações do Paciente</form_1.FormLabel>
                  <form_1.FormControl>
                    <textarea_1.Textarea
                      placeholder="Observações visíveis ao paciente..."
                      {...field}
                      rows={3}
                    />
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>
              );
            }}
          />

          <form_1.FormField
            control={form.control}
            name="internal_notes"
            render={function (_a) {
              var field = _a.field;
              return (
                <form_1.FormItem>
                  <form_1.FormLabel>Observações Internas</form_1.FormLabel>
                  <form_1.FormControl>
                    <textarea_1.Textarea
                      placeholder="Observações internas da equipe..."
                      {...field}
                      rows={3}
                    />
                  </form_1.FormControl>
                  <form_1.FormDescription>Visível apenas para a equipe</form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>
              );
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button_1.Button
            type="button"
            variant="outline"
            onClick={function () {
              return router.back();
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </button_1.Button>
          <button_1.Button
            type="submit"
            disabled={isSubmitting || conflicts.length > 0}
            className="min-w-[150px]"
          >
            {isSubmitting ? "Agendando..." : "Criar Agendamento"}
          </button_1.Button>
        </div>
      </form>
    </form_1.Form>
  );
}
