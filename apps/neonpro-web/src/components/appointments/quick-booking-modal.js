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
exports.QuickBookingModal = QuickBookingModal;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var moment_1 = require("moment");
require("moment/locale/pt-br");
var utils_1 = require("@/lib/utils");
moment_1.default.locale("pt-br");
// Form validation schema
var quickBookingSchema = z.object({
  patientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phoneNumber: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato: (11) 99999-9999"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  serviceType: z.enum(["consultation", "botox", "fillers", "procedure"], {
    required_error: "Selecione o tipo de serviço",
  }),
  professionalId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato: HH:MM"),
  duration: z.number().min(15).max(240),
  notes: z.string().optional(),
  whatsappReminder: z.boolean().default(true),
  equipmentNeeded: z.array(z.string()).optional(),
});
// Service type options
var serviceOptions = [
  { value: "consultation", label: "Consulta", duration: 60, color: "bg-blue-500" },
  { value: "botox", label: "Aplicação de Botox", duration: 90, color: "bg-violet-500" },
  { value: "fillers", label: "Preenchimento", duration: 120, color: "bg-emerald-500" },
  { value: "procedure", label: "Procedimento", duration: 180, color: "bg-amber-500" },
];
// Duration options in minutes
var durationOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
  { value: 240, label: "4 horas" },
];
// Equipment options
var equipmentOptions = [
  "Laser CO2",
  "Ultrassom",
  "Radiofrequência",
  "Criobiótica",
  "Microagulhamento",
  "Peeling químico",
  "Fotobiomodulação",
];
function QuickBookingModal(_a) {
  var _this = this;
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    onSubmit = _a.onSubmit,
    professionals = _a.professionals,
    selectedDate = _a.selectedDate,
    selectedSlot = _a.selectedSlot;
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var _c = (0, react_1.useState)([]),
    conflicts = _c[0],
    setConflicts = _c[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(quickBookingSchema),
    defaultValues: {
      patientName: "",
      phoneNumber: "",
      email: "",
      serviceType: "consultation",
      professionalId: "",
      date: selectedDate
        ? (0, moment_1.default)(selectedDate).format("YYYY-MM-DD")
        : (0, moment_1.default)().format("YYYY-MM-DD"),
      startTime: selectedSlot ? (0, moment_1.default)(selectedSlot.start).format("HH:mm") : "09:00",
      duration: 60,
      notes: "",
      whatsappReminder: true,
      equipmentNeeded: [],
    },
  });
  // Auto-fill form when slot is selected
  (0, react_1.useEffect)(
    function () {
      if (selectedSlot) {
        form.setValue("date", (0, moment_1.default)(selectedSlot.start).format("YYYY-MM-DD"));
        form.setValue("startTime", (0, moment_1.default)(selectedSlot.start).format("HH:mm"));
        var suggestedDuration = (0, moment_1.default)(selectedSlot.end).diff(
          (0, moment_1.default)(selectedSlot.start),
          "minutes",
        );
        if (suggestedDuration >= 15 && suggestedDuration <= 240) {
          form.setValue("duration", suggestedDuration);
        }
        if (selectedSlot.resourceId) {
          form.setValue("professionalId", selectedSlot.resourceId);
        }
      }
    },
    [selectedSlot, form],
  );
  // Watch service type to auto-adjust duration
  var watchedServiceType = form.watch("serviceType");
  (0, react_1.useEffect)(
    function () {
      var serviceOption = serviceOptions.find(function (s) {
        return s.value === watchedServiceType;
      });
      if (serviceOption) {
        form.setValue("duration", serviceOption.duration);
      }
    },
    [watchedServiceType, form],
  );
  // Phone number formatting
  var formatPhoneNumber = function (value) {
    var numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return "(".concat(numbers);
    if (numbers.length <= 6) return "(".concat(numbers.slice(0, 2), ") ").concat(numbers.slice(2));
    if (numbers.length <= 10)
      return "("
        .concat(numbers.slice(0, 2), ") ")
        .concat(numbers.slice(2, 6), "-")
        .concat(numbers.slice(6));
    return "("
      .concat(numbers.slice(0, 2), ") ")
      .concat(numbers.slice(2, 7), "-")
      .concat(numbers.slice(7, 11));
  };
  // Validate appointment slot
  var validateSlot = function (data) {
    var startDateTime = (0, moment_1.default)("".concat(data.date, " ").concat(data.startTime));
    var endDateTime = (0, moment_1.default)(startDateTime).add(data.duration, "minutes");
    var conflicts = [];
    // Check business hours
    var hour = startDateTime.hour();
    if (hour < 8 || hour >= 18) {
      conflicts.push("Horário fora do funcionamento (08:00 - 18:00)");
    }
    // Check if appointment ends after business hours
    if (endDateTime.hour() > 18) {
      conflicts.push("Consulta termina após horário de funcionamento");
    }
    // Check if it's in the past
    if (startDateTime.isBefore((0, moment_1.default)())) {
      conflicts.push("Não é possível agendar no passado");
    }
    // Check weekend
    if (startDateTime.day() === 0 || startDateTime.day() === 6) {
      conflicts.push("Não atendemos aos finais de semana");
    }
    // Check professional availability
    var professional = professionals.find(function (p) {
      return p.id === data.professionalId;
    });
    if (professional && !professional.availability) {
      conflicts.push("".concat(professional.name, " n\u00E3o est\u00E1 dispon\u00EDvel"));
    }
    return conflicts;
  };
  var onFormSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var validationErrors, startDateTime, endDateTime, appointmentData, error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            setIsSubmitting(true);
            validationErrors = validateSlot(data);
            if (validationErrors.length > 0) {
              setConflicts(validationErrors);
              setIsSubmitting(false);
              return [2 /*return*/];
            }
            // Clear conflicts
            setConflicts([]);
            startDateTime = (0, moment_1.default)("".concat(data.date, " ").concat(data.startTime));
            endDateTime = (0, moment_1.default)(startDateTime).add(data.duration, "minutes");
            appointmentData = {
              patientName: data.patientName,
              phoneNumber: data.phoneNumber,
              email: data.email || undefined,
              serviceType: data.serviceType,
              professionalId: data.professionalId,
              start: startDateTime.toDate(),
              end: endDateTime.toDate(),
              notes: data.notes || undefined,
              whatsappReminder: data.whatsappReminder,
              equipmentNeeded: (
                (_a = data.equipmentNeeded) === null || _a === void 0
                  ? void 0
                  : _a.length
              )
                ? data.equipmentNeeded
                : undefined,
              patientId: "patient_".concat(Date.now()), // In production, this would come from patient database
              status: "scheduled",
            };
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onSubmit(appointmentData)];
          case 2:
            _b.sent();
            form.reset();
            onClose();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Error creating appointment:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            <lucide_react_1.CalendarDays className="h-5 w-5" />
            <span>Nova Consulta</span>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Preencha os dados para agendar uma nova consulta
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Conflicts alert */}
            {conflicts.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Conflitos encontrados:</h4>
                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                      {conflicts.map(function (conflict, index) {
                        return <li key={index}>{conflict}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="patientName"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Nome do Paciente</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          placeholder="Nome completo"
                          {...field}
                          className="flex items-center"
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="phoneNumber"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Telefone</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={function (e) {
                            var formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
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
              name="email"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>E-mail (opcional)</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="email@exemplo.com" {...field} />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Service and Professional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="serviceType"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Tipo de Serviço</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o serviço" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {serviceOptions.map(function (service) {
                            return (
                              <select_1.SelectItem key={service.value} value={service.value}>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={(0, utils_1.cn)(
                                      "w-3 h-3 rounded-full",
                                      service.color,
                                    )}
                                  />
                                  <span>{service.label}</span>
                                  <badge_1.Badge variant="secondary" className="ml-2">
                                    {service.duration}min
                                  </badge_1.Badge>
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
                name="professionalId"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Profissional</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o profissional" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {professionals.map(function (professional) {
                            return (
                              <select_1.SelectItem
                                key={professional.id}
                                value={professional.id}
                                disabled={!professional.availability}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <div className="font-medium">{professional.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {professional.specialization}
                                    </div>
                                  </div>
                                  {!professional.availability && (
                                    <badge_1.Badge variant="secondary">Indisponível</badge_1.Badge>
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

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form_1.FormField
                control={form.control}
                name="date"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Data</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          type="date"
                          {...field}
                          min={(0, moment_1.default)().format("YYYY-MM-DD")}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="startTime"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Horário</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          type="time"
                          {...field}
                          min="08:00"
                          max="17:30"
                          step="900" // 15-minute steps
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="duration"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Duração</form_1.FormLabel>
                      <select_1.Select
                        onValueChange={function (value) {
                          return field.onChange(parseInt(value));
                        }}
                      >
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {durationOptions.map(function (option) {
                            return (
                              <select_1.SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
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

            {/* Notes */}
            <form_1.FormField
              control={form.control}
              name="notes"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Observações</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea
                        placeholder="Observações sobre a consulta..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Informações adicionais sobre a consulta ou necessidades especiais
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* WhatsApp Reminder */}
            <form_1.FormField
              control={form.control}
              name="whatsappReminder"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <form_1.FormLabel className="text-base flex items-center space-x-2">
                        <lucide_react_1.MessageCircle className="h-4 w-4 text-green-600" />
                        <span>Lembrete via WhatsApp</span>
                      </form_1.FormLabel>
                      <form_1.FormDescription>
                        Enviar lembrete 24h antes da consulta
                      </form_1.FormDescription>
                    </div>
                    <form_1.FormControl>
                      <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                    </form_1.FormControl>
                  </form_1.FormItem>
                );
              }}
            />

            <dialog_1.DialogFooter>
              <button_1.Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Agendando..." : "Agendar Consulta"}
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
