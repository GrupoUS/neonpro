"use client";
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
exports.AppointmentBookingForm = AppointmentBookingForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var schemas_1 = require("@/lib/healthcare/schemas");
var sonner_1 = require("sonner");
function AppointmentBookingForm(_a) {
  var patients = _a.patients,
    professionals = _a.professionals,
    services = _a.services,
    onSubmit = _a.onSubmit,
    _b = _a.isLoading,
    isLoading = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(null),
    selectedService = _c[0],
    setSelectedService = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedProfessional = _d[0],
    setSelectedProfessional = _d[1];
  var _e = (0, react_1.useState)([]),
    availableSlots = _e[0],
    setAvailableSlots = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedDate = _f[0],
    setSelectedDate = _f[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(schemas_1.appointmentSchema),
    defaultValues: {
      patient_id: "",
      professional_id: "",
      service_id: "",
      duration_minutes: 60,
      notes: "",
      consent_procedure: false,
      payment_method: "card",
      total_amount: 0,
      special_requirements: "",
    },
  });
  // Generate available time slots
  var generateTimeSlots = (professional, date) => {
    var slots = [];
    var today = new Date();
    // Don't allow booking for past dates
    if (date < today) return slots;
    // Generate slots based on professional availability
    professional.available_times.forEach((timeStr) => {
      var _a = timeStr.split(":").map(Number),
        hours = _a[0],
        minutes = _a[1];
      var slotTime = new Date(date);
      slotTime.setHours(hours, minutes, 0, 0);
      // Don't show past time slots for today
      if ((0, date_fns_1.isToday)(date) && slotTime <= today) return;
      slots.push(slotTime);
    });
    return slots;
  };
  // Update available slots when professional or date changes
  (0, react_1.useEffect)(() => {
    if (selectedProfessional && selectedDate) {
      var slots = generateTimeSlots(selectedProfessional, selectedDate);
      setAvailableSlots(slots);
    }
  }, [selectedProfessional, selectedDate]);
  var handleSubmitForm = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, onSubmit(data)];
          case 1:
            _a.sent();
            sonner_1.toast.success("Agendamento realizado com sucesso!", {
              description: "O paciente receberá uma confirmação em breve.",
            });
            form.reset();
            setSelectedService(null);
            setSelectedProfessional(null);
            setAvailableSlots([]);
            setSelectedDate(null);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao criar agendamento", {
              description: "Verifique os dados e tente novamente.",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var formatDateLabel = (date) => {
    if ((0, date_fns_1.isToday)(date))
      return "Hoje - ".concat((0, date_fns_1.format)(date, "dd/MM", { locale: locale_1.ptBR }));
    if ((0, date_fns_1.isTomorrow)(date))
      return "Amanh\u00E3 - ".concat(
        (0, date_fns_1.format)(date, "dd/MM", { locale: locale_1.ptBR }),
      );
    return (0, date_fns_1.format)(date, "EEEE - dd/MM", { locale: locale_1.ptBR });
  };
  return (
    <card_1.Card className="w-full max-w-4xl mx-auto medical-card">
      <card_1.CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <lucide_react_1.Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <card_1.CardTitle className="text-2xl">Novo Agendamento</card_1.CardTitle>
            <card_1.CardDescription>
              Agende consultas e procedimentos com confirmação automática
            </card_1.CardDescription>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8">
            {/* Patient Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <lucide_react_1.User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Paciente</h3>
              </div>

              <form_1.FormField
                control={form.control}
                name="patient_id"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Selecionar Paciente *</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger className="bg-background">
                            <select_1.SelectValue placeholder="Escolha o paciente" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {patients.map((patient) => (
                            <select_1.SelectItem key={patient.id} value={patient.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{patient.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {patient.cpf} • {patient.phone}
                                </span>
                              </div>
                            </select_1.SelectItem>
                          ))}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={() => (onCancel === null || onCancel === void 0 ? void 0 : onCancel())}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  : <>
                      <lucide_react_1.Calendar className="w-4 h-4 mr-2" />
                      Confirmar Agendamento
                    </>}
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
