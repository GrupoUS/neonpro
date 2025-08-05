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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BusinessSettings;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var daysOfWeek = [
  { value: "monday", label: "Segunda-feira", short: "SEG" },
  { value: "tuesday", label: "Terça-feira", short: "TER" },
  { value: "wednesday", label: "Quarta-feira", short: "QUA" },
  { value: "thursday", label: "Quinta-feira", short: "QUI" },
  { value: "friday", label: "Sexta-feira", short: "SEX" },
  { value: "saturday", label: "Sábado", short: "SAB" },
  { value: "sunday", label: "Domingo", short: "DOM" },
];
var timeSlots = Array.from({ length: 24 * 4 }, function (_, i) {
  var hour = Math.floor(i / 4);
  var minute = (i % 4) * 15;
  var time = ""
    .concat(hour.toString().padStart(2, "0"), ":")
    .concat(minute.toString().padStart(2, "0"));
  return { value: time, label: time };
});
var workingHoursSchema = z
  .object({
    day: z.string(),
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    breakStart: z.string().optional(),
    breakEnd: z.string().optional(),
  })
  .superRefine(function (data, ctx) {
    if (data.isOpen) {
      if (!data.openTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de abertura é obrigatório",
          path: ["openTime"],
        });
      }
      if (!data.closeTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de fechamento é obrigatório",
          path: ["closeTime"],
        });
      }
      if (data.openTime && data.closeTime && data.openTime >= data.closeTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de fechamento deve ser após o de abertura",
          path: ["closeTime"],
        });
      }
      if (data.breakStart && data.breakEnd && data.breakStart >= data.breakEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fim do intervalo deve ser após o início",
          path: ["breakEnd"],
        });
      }
    }
  });
var holidaySchema = z.object({
  date: z.string(),
  name: z.string().min(1, "Nome do feriado é obrigatório"),
  isRecurring: z.boolean(),
});
var businessSettingsSchema = z.object({
  // Working Hours
  workingHours: z.array(workingHoursSchema),
  // Appointment Settings
  defaultAppointmentDuration: z.number().min(15, "Duração mínima é 15 minutos"),
  appointmentBuffer: z.number().min(0, "Buffer deve ser 0 ou maior"),
  maxAppointmentsPerDay: z.number().min(1, "Máximo deve ser pelo menos 1"),
  // Booking Rules
  advanceBookingLimit: z.number().min(0, "Limite deve ser 0 ou maior"),
  cancellationDeadline: z.number().min(0, "Prazo deve ser 0 ou maior"),
  rescheduleLimit: z.number().min(0, "Limite deve ser 0 ou maior"),
  // Automatic Confirmations
  autoConfirmBookings: z.boolean(),
  autoConfirmHours: z.number().min(0).max(168),
  // Reminders
  enableReminders: z.boolean(),
  reminderHours: z.array(z.number()),
  // No-show Policy
  noShowFee: z.number().min(0),
  noShowAfterMinutes: z.number().min(0),
  blacklistAfterNoShows: z.number().min(0),
  // Special Schedules
  holidays: z.array(holidaySchema),
  // Timezone
  timezone: z.string(),
});
var brazilianTimezones = [
  { value: "America/Sao_Paulo", label: "Brasília (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (UTC-2)" },
];
function BusinessSettings() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(false),
    isSaving = _b[0],
    setIsSaving = _b[1];
  var _c = (0, react_1.useState)(null),
    lastSaved = _c[0],
    setLastSaved = _c[1];
  var _d = (0, react_1.useState)("hours"),
    activeTab = _d[0],
    setActiveTab = _d[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(businessSettingsSchema),
    defaultValues: {
      workingHours: daysOfWeek.map(function (day) {
        return {
          day: day.value,
          isOpen: day.value !== "sunday",
          openTime: "08:00",
          closeTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
        };
      }),
      defaultAppointmentDuration: 60,
      appointmentBuffer: 15,
      maxAppointmentsPerDay: 20,
      advanceBookingLimit: 30,
      cancellationDeadline: 24,
      rescheduleLimit: 2,
      autoConfirmBookings: true,
      autoConfirmHours: 2,
      enableReminders: true,
      reminderHours: [24, 2],
      noShowFee: 50.0,
      noShowAfterMinutes: 15,
      blacklistAfterNoShows: 3,
      holidays: [],
      timezone: "America/Sao_Paulo",
    },
  });
  var _e = (0, react_hook_form_1.useFieldArray)({
      control: form.control,
      name: "holidays",
    }),
    holidayFields = _e.fields,
    appendHoliday = _e.append,
    removeHoliday = _e.remove;
  // Load existing settings
  (0, react_1.useEffect)(
    function () {
      var loadBusinessSettings = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            setIsLoading(true);
            try {
              // TODO: Replace with actual API call
              // const response = await fetch("/api/settings/business");
              // const data = await response.json();
              // form.reset(data);
            } catch (error) {
              console.error("Erro ao carregar configurações:", error);
              sonner_1.toast.error("Erro ao carregar configurações de funcionamento");
            } finally {
              setIsLoading(false);
            }
            return [2 /*return*/];
          });
        });
      };
      loadBusinessSettings();
    },
    [form],
  );
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        setIsSaving(true);
        try {
          // TODO: Replace with actual API call
          // await fetch("/api/settings/business", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify(data),
          // });
          setLastSaved(new Date());
          sonner_1.toast.success("Configurações salvas com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          sonner_1.toast.error("Erro ao salvar configurações");
        } finally {
          setIsSaving(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var copyScheduleToAll = function (sourceDay) {
    var sourceSchedule = form.getValues(
      "workingHours.".concat(
        daysOfWeek.findIndex(function (d) {
          return d.value === sourceDay;
        }),
      ),
    );
    daysOfWeek.forEach(function (day, index) {
      if (day.value !== sourceDay) {
        form.setValue(
          "workingHours.".concat(index),
          __assign(__assign({}, sourceSchedule), { day: day.value }),
        );
      }
    });
    sonner_1.toast.success("Horário copiado para todos os dias!");
  };
  var addBrazilianHoliday = function () {
    var currentYear = new Date().getFullYear();
    var commonHolidays = [
      {
        date: "".concat(currentYear, "-01-01"),
        name: "Confraternização Universal",
        isRecurring: true,
      },
      { date: "".concat(currentYear, "-04-21"), name: "Tiradentes", isRecurring: true },
      { date: "".concat(currentYear, "-05-01"), name: "Dia do Trabalhador", isRecurring: true },
      {
        date: "".concat(currentYear, "-07-09"),
        name: "Independência do Brasil",
        isRecurring: true,
      },
      {
        date: "".concat(currentYear, "-10-12"),
        name: "Nossa Senhora Aparecida",
        isRecurring: true,
      },
      { date: "".concat(currentYear, "-11-02"), name: "Finados", isRecurring: true },
      {
        date: "".concat(currentYear, "-11-15"),
        name: "Proclamação da República",
        isRecurring: true,
      },
      { date: "".concat(currentYear, "-12-25"), name: "Natal", isRecurring: true },
    ];
    var existingDates = form.getValues("holidays").map(function (h) {
      return h.date;
    });
    var newHolidays = commonHolidays.filter(function (h) {
      return !existingDates.includes(h.date);
    });
    newHolidays.forEach(function (holiday) {
      appendHoliday(holiday);
    });
    if (newHolidays.length > 0) {
      sonner_1.toast.success("".concat(newHolidays.length, " feriados nacionais adicionados!"));
    } else {
      sonner_1.toast.info("Todos os feriados nacionais já estão cadastrados");
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <alert_1.Alert>
        <lucide_react_1.Clock className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Horário de Brasília:</strong> As configurações seguem o fuso horário brasileiro.
          Certifique-se de configurar corretamente os horários de funcionamento para sua região.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="hours" className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4" />
                Horários
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="appointments" className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-4 w-4" />
                Agendamentos
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="policies" className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-4 w-4" />
                Políticas
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="holidays" className="flex items-center gap-2">
                <lucide_react_1.Coffee className="h-4 w-4" />
                Feriados
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Working Hours Tab */}
            <tabs_1.TabsContent value="hours" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Horários de Funcionamento</card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure os horários de funcionamento para cada dia da semana
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  {daysOfWeek.map(function (day, index) {
                    return (
                      <div key={day.value} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <badge_1.Badge variant="outline" className="w-12 text-center">
                              {day.short}
                            </badge_1.Badge>
                            <span className="font-medium">{day.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <form_1.FormField
                              control={form.control}
                              name={"workingHours.".concat(index, ".isOpen")}
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem className="flex items-center space-x-2">
                                    <form_1.FormLabel className="text-sm">Aberto</form_1.FormLabel>
                                    <form_1.FormControl>
                                      <switch_1.Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </form_1.FormControl>
                                  </form_1.FormItem>
                                );
                              }}
                            />
                            <button_1.Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={function () {
                                return copyScheduleToAll(day.value);
                              }}
                              disabled={!form.watch("workingHours.".concat(index, ".isOpen"))}
                            >
                              Copiar para todos
                            </button_1.Button>
                          </div>
                        </div>

                        {form.watch("workingHours.".concat(index, ".isOpen")) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <form_1.FormField
                              control={form.control}
                              name={"workingHours.".concat(index, ".openTime")}
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Abertura</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="00:00" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        {timeSlots
                                          .slice(0, timeSlots.length - 4)
                                          .map(function (slot) {
                                            return (
                                              <select_1.SelectItem
                                                key={slot.value}
                                                value={slot.value}
                                              >
                                                {slot.label}
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
                              name={"workingHours.".concat(index, ".closeTime")}
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Fechamento</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="00:00" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        {timeSlots.slice(4).map(function (slot) {
                                          return (
                                            <select_1.SelectItem
                                              key={slot.value}
                                              value={slot.value}
                                            >
                                              {slot.label}
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
                              name={"workingHours.".concat(index, ".breakStart")}
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Início Intervalo</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="Sem intervalo" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        <select_1.SelectItem value="">
                                          Sem intervalo
                                        </select_1.SelectItem>
                                        {timeSlots.map(function (slot) {
                                          return (
                                            <select_1.SelectItem
                                              key={slot.value}
                                              value={slot.value}
                                            >
                                              {slot.label}
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
                              name={"workingHours.".concat(index, ".breakEnd")}
                              render={function (_a) {
                                var field = _a.field;
                                return (
                                  <form_1.FormItem>
                                    <form_1.FormLabel>Fim Intervalo</form_1.FormLabel>
                                    <select_1.Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <form_1.FormControl>
                                        <select_1.SelectTrigger>
                                          <select_1.SelectValue placeholder="Sem intervalo" />
                                        </select_1.SelectTrigger>
                                      </form_1.FormControl>
                                      <select_1.SelectContent>
                                        <select_1.SelectItem value="">
                                          Sem intervalo
                                        </select_1.SelectItem>
                                        {timeSlots.map(function (slot) {
                                          return (
                                            <select_1.SelectItem
                                              key={slot.value}
                                              value={slot.value}
                                            >
                                              {slot.label}
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
                        )}
                      </div>
                    );
                  })}

                  <form_1.FormField
                    control={form.control}
                    name="timezone"
                    render={function (_a) {
                      var field = _a.field;
                      return (
                        <form_1.FormItem className="md:w-1/2">
                          <form_1.FormLabel>Fuso Horário</form_1.FormLabel>
                          <select_1.Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <form_1.FormControl>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Selecione o fuso horário" />
                              </select_1.SelectTrigger>
                            </form_1.FormControl>
                            <select_1.SelectContent>
                              {brazilianTimezones.map(function (tz) {
                                return (
                                  <select_1.SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                  </select_1.SelectItem>
                                );
                              })}
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormDescription>
                            Fuso horário utilizado para agendamentos e relatórios
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>
                      );
                    }}
                  />
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Appointments Tab */}
            <tabs_1.TabsContent value="appointments" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Configurações de Agendamento</card_1.CardTitle>
                  <card_1.CardDescription>
                    Defina regras para agendamentos e consultas
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="defaultAppointmentDuration"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Duração Padrão (min)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="15"
                                step="15"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 60);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Duração padrão para novos agendamentos
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="appointmentBuffer"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Intervalo Entre Consultas (min)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                step="5"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 0);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Tempo livre entre consultas
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="maxAppointmentsPerDay"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Máximo Consultas/Dia</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 20);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Limite de agendamentos por dia
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form_1.FormField
                      control={form.control}
                      name="autoConfirmBookings"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">
                                Confirmação Automática
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Confirmar agendamentos automaticamente após o prazo
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    {form.watch("autoConfirmBookings") && (
                      <form_1.FormField
                        control={form.control}
                        name="autoConfirmHours"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Confirmar Após (horas)</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="0"
                                  max="168"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value) || 2);
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Horas para confirmação automática
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Policies Tab */}
            <tabs_1.TabsContent value="policies" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Políticas de Agendamento</card_1.CardTitle>
                  <card_1.CardDescription>
                    Configure regras de cancelamento, reagendamento e faltas
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="advanceBookingLimit"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Antecedência Máxima (dias)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 30);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Máximo de dias para agendar (0 = ilimitado)
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="cancellationDeadline"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Prazo Cancelamento (horas)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 24);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Horas mínimas para cancelar sem taxa
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="rescheduleLimit"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Limite de Reagendamentos</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 2);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Máximo reagendamentos por consulta
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium mb-4">Política de Faltas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <form_1.FormField
                        control={form.control}
                        name="noShowFee"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Taxa por Falta (R$)</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseFloat(e.target.value) || 0);
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Taxa cobrada por falta sem aviso
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="noShowAfterMinutes"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Tolerância (minutos)</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value) || 15);
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Minutos de atraso para considerar falta
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />

                      <form_1.FormField
                        control={form.control}
                        name="blacklistAfterNoShows"
                        render={function (_a) {
                          var field = _a.field;
                          return (
                            <form_1.FormItem>
                              <form_1.FormLabel>Bloqueio Após Faltas</form_1.FormLabel>
                              <form_1.FormControl>
                                <input_1.Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={function (e) {
                                    return field.onChange(parseInt(e.target.value) || 3);
                                  }}
                                />
                              </form_1.FormControl>
                              <form_1.FormDescription>
                                Faltas para bloquear agendamentos (0 = nunca)
                              </form_1.FormDescription>
                              <form_1.FormMessage />
                            </form_1.FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <form_1.FormField
                      control={form.control}
                      name="enableReminders"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <form_1.FormLabel className="text-base">
                                Lembretes Automáticos
                              </form_1.FormLabel>
                              <form_1.FormDescription>
                                Enviar lembretes por email/SMS antes das consultas
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    {form.watch("enableReminders") && (
                      <div className="mt-4">
                        <form_1.FormLabel className="text-base">
                          Horários dos Lembretes
                        </form_1.FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[1, 2, 4, 24, 48].map(function (hours) {
                            var _a;
                            return (
                              <label key={hours} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    ((_a = form.watch("reminderHours")) === null || _a === void 0
                                      ? void 0
                                      : _a.includes(hours)) || false
                                  }
                                  onChange={function (e) {
                                    var current = form.getValues("reminderHours") || [];
                                    if (e.target.checked) {
                                      form.setValue(
                                        "reminderHours",
                                        __spreadArray(
                                          __spreadArray([], current, true),
                                          [hours],
                                          false,
                                        ),
                                      );
                                    } else {
                                      form.setValue(
                                        "reminderHours",
                                        current.filter(function (h) {
                                          return h !== hours;
                                        }),
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">{hours}h antes</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* Holidays Tab */}
            <tabs_1.TabsContent value="holidays" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>Feriados e Dias de Folga</card_1.CardTitle>
                      <card_1.CardDescription>
                        Configure os dias em que a clínica não funcionará
                      </card_1.CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <button_1.Button
                        type="button"
                        variant="outline"
                        onClick={addBrazilianHoliday}
                      >
                        Adicionar Feriados Nacionais
                      </button_1.Button>
                      <button_1.Button
                        type="button"
                        onClick={function () {
                          return appendHoliday({
                            date: "",
                            name: "",
                            isRecurring: false,
                          });
                        }}
                      >
                        <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                        Adicionar Feriado
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {holidayFields.length === 0
                    ? <div className="text-center p-8">
                        <lucide_react_1.Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum feriado cadastrado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Adicione feriados e dias de folga da clínica
                        </p>
                      </div>
                    : <div className="space-y-4">
                        {holidayFields.map(function (field, index) {
                          return (
                            <div
                              key={field.id}
                              className="flex items-end gap-4 p-4 border rounded-lg"
                            >
                              <form_1.FormField
                                control={form.control}
                                name={"holidays.".concat(index, ".date")}
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem className="flex-1">
                                      <form_1.FormLabel>Data</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input type="date" {...field} />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />

                              <form_1.FormField
                                control={form.control}
                                name={"holidays.".concat(index, ".name")}
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem className="flex-2">
                                      <form_1.FormLabel>Nome do Feriado</form_1.FormLabel>
                                      <form_1.FormControl>
                                        <input_1.Input placeholder="Natal" {...field} />
                                      </form_1.FormControl>
                                      <form_1.FormMessage />
                                    </form_1.FormItem>
                                  );
                                }}
                              />

                              <form_1.FormField
                                control={form.control}
                                name={"holidays.".concat(index, ".isRecurring")}
                                render={function (_a) {
                                  var field = _a.field;
                                  return (
                                    <form_1.FormItem className="flex flex-row items-center space-x-2">
                                      <form_1.FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={field.onChange}
                                          className="rounded border-gray-300"
                                        />
                                      </form_1.FormControl>
                                      <form_1.FormLabel className="text-sm">Anual</form_1.FormLabel>
                                    </form_1.FormItem>
                                  );
                                }}
                              />

                              <button_1.Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={function () {
                                  return removeHoliday(index);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <lucide_react_1.Trash2 className="h-4 w-4" />
                              </button_1.Button>
                            </div>
                          );
                        })}
                      </div>}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <button_1.Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                : <>
                    <lucide_react_1.Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
