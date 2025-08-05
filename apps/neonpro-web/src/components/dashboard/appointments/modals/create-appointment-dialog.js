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
exports.CreateAppointmentDialog = CreateAppointmentDialog;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Form validation schema
var createAppointmentSchema = zod_2.z.object({
  patient_id: zod_2.z.string().min(1, "Paciente é obrigatório"),
  professional_id: zod_2.z.string().min(1, "Profissional é obrigatório"),
  service_type_id: zod_2.z.string().min(1, "Tipo de serviço é obrigatório"),
  start_time: zod_2.z.string().min(1, "Data e horário são obrigatórios"),
  status: zod_2.z.enum(["scheduled", "confirmed"]).default("scheduled"),
  notes: zod_2.z.string().optional(),
  internal_notes: zod_2.z.string().optional(),
  send_confirmation: zod_2.z.boolean().default(true),
  send_reminder: zod_2.z.boolean().default(true),
});
function CreateAppointmentDialog(_a) {
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    onCreateSuccess = _a.onCreateSuccess,
    defaultDate = _a.defaultDate,
    defaultTime = _a.defaultTime,
    professionalId = _a.professionalId;
  var _b = (0, react_1.useState)([]),
    patients = _b[0],
    setPatients = _b[1];
  var _c = (0, react_1.useState)([]),
    professionals = _c[0],
    setProfessionals = _c[1];
  var _d = (0, react_1.useState)([]),
    services = _d[0],
    setServices = _d[1];
  var _e = (0, react_1.useState)([]),
    availableSlots = _e[0],
    setAvailableSlots = _e[1];
  var _f = (0, react_1.useState)(""),
    conflictError = _f[0],
    setConflictError = _f[1];
  var _g = (0, react_1.useState)(false),
    checkingConflict = _g[0],
    setCheckingConflict = _g[1];
  var _h = (0, react_1.useState)(false),
    loadingSlots = _h[0],
    setLoadingSlots = _h[1];
  var _j = (0, react_1.useState)(false),
    isCreating = _j[0],
    setIsCreating = _j[1];
  var _k = (0, react_1.useState)(""),
    selectedDate = _k[0],
    setSelectedDate = _k[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(createAppointmentSchema),
    defaultValues: {
      patient_id: "",
      professional_id: professionalId || "",
      service_type_id: "",
      start_time: "",
      status: "scheduled",
      notes: "",
      internal_notes: "",
      send_confirmation: true,
      send_reminder: true,
    },
  });
  // Set default values when dialog opens
  (0, react_1.useEffect)(() => {
    if (open) {
      var defaultDateTime =
        defaultDate && defaultTime
          ? "".concat((0, date_fns_1.format)(defaultDate, "yyyy-MM-dd"), "T").concat(defaultTime)
          : "";
      form.reset({
        patient_id: "",
        professional_id: professionalId || "",
        service_type_id: "",
        start_time: defaultDateTime,
        status: "scheduled",
        notes: "",
        internal_notes: "",
        send_confirmation: true,
        send_reminder: true,
      });
      if (defaultDate) {
        setSelectedDate((0, date_fns_1.format)(defaultDate, "yyyy-MM-dd"));
      }
    }
  }, [open, defaultDate, defaultTime, professionalId, form]);
  // Load reference data
  (0, react_1.useEffect)(() => {
    if (!open) return;
    var loadReferenceData = () =>
      __awaiter(this, void 0, void 0, function () {
        var _a,
          patientsRes,
          professionalsRes,
          servicesRes,
          patientsData,
          professionalsData,
          servicesData,
          error_1;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 8, , 9]);
              return [
                4 /*yield*/,
                Promise.all([
                  fetch("/api/patients"),
                  fetch("/api/professionals"),
                  fetch("/api/service-types"),
                ]),
              ];
            case 1:
              (_a = _b.sent()),
                (patientsRes = _a[0]),
                (professionalsRes = _a[1]),
                (servicesRes = _a[2]);
              if (!patientsRes.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, patientsRes.json()];
            case 2:
              patientsData = _b.sent();
              setPatients(patientsData.data || []);
              _b.label = 3;
            case 3:
              if (!professionalsRes.ok) return [3 /*break*/, 5];
              return [4 /*yield*/, professionalsRes.json()];
            case 4:
              professionalsData = _b.sent();
              setProfessionals(professionalsData.data || []);
              _b.label = 5;
            case 5:
              if (!servicesRes.ok) return [3 /*break*/, 7];
              return [4 /*yield*/, servicesRes.json()];
            case 6:
              servicesData = _b.sent();
              setServices(servicesData.data || []);
              _b.label = 7;
            case 7:
              return [3 /*break*/, 9];
            case 8:
              error_1 = _b.sent();
              console.error("Error loading reference data:", error_1);
              sonner_1.toast.error("Erro ao carregar dados de referência");
              return [3 /*break*/, 9];
            case 9:
              return [2 /*return*/];
          }
        });
      });
    loadReferenceData();
  }, [open]);
  // Load available slots when professional, date, or service changes
  (0, react_1.useEffect)(() => {
    var professionalId = form.watch("professional_id");
    var serviceId = form.watch("service_type_id");
    if (selectedDate && professionalId && serviceId) {
      loadAvailableSlots(selectedDate, professionalId, serviceId);
    }
  }, [selectedDate, form.watch("professional_id"), form.watch("service_type_id")]);
  var loadAvailableSlots = (date, professionalId, serviceId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoadingSlots(true);
            return [
              4 /*yield*/,
              fetch(
                "/api/appointments/available-slots?" +
                  new URLSearchParams({
                    professional_id: professionalId,
                    service_type_id: serviceId,
                    date: date,
                  }),
              ),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (response.ok) {
              setAvailableSlots(data.available_slots || []);
            }
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error loading available slots:", error_2);
            return [3 /*break*/, 5];
          case 4:
            setLoadingSlots(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Check for conflicts when time changes
  var checkConflicts = (professionalId, startTime, serviceId) =>
    __awaiter(this, void 0, void 0, function () {
      var selectedService, endTime, response, data, conflicts, error_3;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            if (!professionalId || !startTime || !serviceId) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            setCheckingConflict(true);
            setConflictError("");
            selectedService = services.find((s) => s.id === serviceId);
            if (!selectedService) return [2 /*return*/];
            endTime = new Date(
              new Date(startTime).getTime() + selectedService.duration_minutes * 60000,
            ).toISOString();
            return [
              4 /*yield*/,
              fetch("/api/appointments/check-conflicts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  professional_id: professionalId,
                  start_time: startTime,
                  end_time: endTime,
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
                .map((c) =>
                  "".concat(c.patient_name, " (").concat(
                    (0, date_fns_1.format)(new Date(c.start_time), "HH:mm", {
                      locale: locale_1.ptBR,
                    }),
                    ")",
                  ),
                )
                .join(", ");
              setConflictError("Conflito detectado com: ".concat(conflicts));
            }
            return [3 /*break*/, 6];
          case 4:
            error_3 = _b.sent();
            console.error("Error checking conflicts:", error_3);
            return [3 /*break*/, 6];
          case 5:
            setCheckingConflict(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  // Watch form changes for conflict checking
  var watchedValues = form.watch(["professional_id", "start_time", "service_type_id"]);
  (0, react_1.useEffect)(() => {
    var professionalId = watchedValues[0],
      startTime = watchedValues[1],
      serviceId = watchedValues[2];
    if (professionalId && startTime && serviceId && services.length > 0) {
      var timer_1 = setTimeout(() => {
        checkConflicts(professionalId, startTime, serviceId);
      }, 500);
      return () => clearTimeout(timer_1);
    }
  }, [watchedValues, services]);
  // Handle date selection for slot loading
  var handleDateChange = (date) => {
    setSelectedDate(date);
    form.setValue("start_time", "");
  };
  // Handle slot selection
  var handleSlotSelect = (slot) => {
    if (!slot.is_available) return;
    var dateTimeValue = (0, date_fns_1.format)(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm");
    form.setValue("start_time", dateTimeValue);
  };
  // Handle form submission
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var selectedService,
        startTime,
        endTime,
        appointmentData,
        response,
        result,
        conflicts,
        error_4;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            if (conflictError) {
              sonner_1.toast.error("Resolva os conflitos antes de continuar");
              return [2 /*return*/];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            setIsCreating(true);
            selectedService = services.find((s) => s.id === data.service_type_id);
            if (!selectedService) {
              sonner_1.toast.error("Serviço não encontrado");
              return [2 /*return*/];
            }
            startTime = new Date(data.start_time);
            endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);
            appointmentData = {
              patient_id: data.patient_id,
              professional_id: data.professional_id,
              service_type_id: data.service_type_id,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              status: data.status,
              notes: data.notes,
              internal_notes: data.internal_notes,
              send_confirmation: data.send_confirmation,
              send_reminder: data.send_reminder,
            };
            return [
              4 /*yield*/,
              fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData),
              }),
            ];
          case 2:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            result = _b.sent();
            if (!response.ok) {
              if ((_a = result.conflicts) === null || _a === void 0 ? void 0 : _a.length) {
                conflicts = result.conflicts
                  .map((c) =>
                    "".concat(c.patient_name, " (").concat(
                      (0, date_fns_1.format)(new Date(c.start_time), "HH:mm", {
                        locale: locale_1.ptBR,
                      }),
                      ")",
                    ),
                  )
                  .join(", ");
                setConflictError("Conflito detectado: ".concat(conflicts));
                return [2 /*return*/];
              }
              throw new Error(result.error_message || "Erro ao criar agendamento");
            }
            onCreateSuccess();
            onOpenChange(false);
            sonner_1.toast.success("Agendamento criado com sucesso!");
            return [3 /*break*/, 6];
          case 4:
            error_4 = _b.sent();
            console.error("Error creating appointment:", error_4);
            sonner_1.toast.error("Erro ao criar agendamento");
            return [3 /*break*/, 6];
          case 5:
            setIsCreating(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var getMinDateTime = () => (0, date_fns_1.format)(new Date(), "yyyy-MM-dd'T'HH:mm");
  var getMaxDate = () =>
    (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 90), "yyyy-MM-dd");
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.Plus className="h-5 w-5" />
            Novo Agendamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Crie um novo agendamento preenchendo todos os campos obrigatórios
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Conflict Alert */}
            {(conflictError || checkingConflict) && (
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  {checkingConflict ? "Verificando conflitos..." : conflictError}
                </alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {/* Patient and Professional Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="patient_id"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Paciente</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o paciente" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {patients.map((patient) => (
                            <select_1.SelectItem key={patient.id} value={patient.id}>
                              <div className="flex items-center gap-2">
                                <lucide_react_1.User className="h-4 w-4" />
                                {patient.full_name}
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

              <form_1.FormField
                control={form.control}
                name="professional_id"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Profissional</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o profissional" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {professionals.map((professional) => (
                            <select_1.SelectItem key={professional.id} value={professional.id}>
                              <div>
                                <div className="font-medium">{professional.full_name}</div>
                                {professional.specialization && (
                                  <div className="text-xs text-muted-foreground">
                                    {professional.specialization}
                                  </div>
                                )}
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

            {/* Service Selection */}
            <form_1.FormField
              control={form.control}
              name="service_type_id"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Serviço</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o serviço" />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {services.map((service) => (
                          <select_1.SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <badge_1.Badge variant="secondary" className="text-xs">
                                  {Math.floor(service.duration_minutes / 60)}h
                                  {service.duration_minutes % 60}min
                                </badge_1.Badge>
                                {service.price && (
                                  <badge_1.Badge variant="outline" className="text-xs">
                                    R$ {service.price.toFixed(2)}
                                  </badge_1.Badge>
                                )}
                              </div>
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

            {/* Date Selection for Available Slots */}
            <div className="space-y-3">
              <form_1.FormLabel>Selecione uma data</form_1.FormLabel>
              <input_1.Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={(0, date_fns_1.format)(new Date(), "yyyy-MM-dd")}
                max={getMaxDate()}
              />
            </div>

            {/* Available Slots */}
            {selectedDate && form.watch("professional_id") && form.watch("service_type_id") && (
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
                        {availableSlots.map((slot, index) => (
                          <button_1.Button
                            key={index}
                            type="button"
                            variant={
                              form.watch("start_time") ===
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
                            onClick={() => handleSlotSelect(slot)}
                            className="relative"
                          >
                            {(0, date_fns_1.format)(new Date(slot.start_time), "HH:mm")}
                            {slot.is_available &&
                              form.watch("start_time") ===
                                (0, date_fns_1.format)(
                                  new Date(slot.start_time),
                                  "yyyy-MM-dd'T'HH:mm",
                                ) && (
                                <lucide_react_1.CheckCircle className="h-3 w-3 absolute -top-1 -right-1" />
                              )}
                          </button_1.Button>
                        ))}
                      </div>
                    : <div className="text-center py-8 text-muted-foreground">
                        <lucide_react_1.Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum horário disponível para esta data</p>
                      </div>}
              </div>
            )}

            {/* Manual Date/Time Selection */}
            <form_1.FormField
              control={form.control}
              name="start_time"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Ou digite data e horário manualmente</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input
                        type="datetime-local"
                        {...field}
                        min={getMinDateTime()}
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

            {/* Status and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="status"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Status Inicial</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="scheduled">Agendado</select_1.SelectItem>
                          <select_1.SelectItem value="confirmed">Confirmado</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <div className="space-y-4">
                <form_1.FormField
                  control={form.control}
                  name="send_confirmation"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <form_1.FormControl>
                          <checkbox_1.Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </form_1.FormControl>
                        <div className="space-y-1 leading-none">
                          <form_1.FormLabel>Enviar confirmação</form_1.FormLabel>
                        </div>
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="send_reminder"
                  render={(_a) => {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <form_1.FormControl>
                          <checkbox_1.Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </form_1.FormControl>
                        <div className="space-y-1 leading-none">
                          <form_1.FormLabel>Enviar lembrete</form_1.FormLabel>
                        </div>
                      </form_1.FormItem>
                    );
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="notes"
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Observações do Cliente</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea
                          placeholder="Observações visíveis ao cliente..."
                          {...field}
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
                render={(_a) => {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Observações Internas</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea
                          placeholder="Observações internas da equipe..."
                          {...field}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>

            <dialog_1.DialogFooter className="gap-2 sm:gap-0">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                type="submit"
                disabled={
                  isCreating || !!conflictError || checkingConflict || !form.watch("start_time")
                }
              >
                {isCreating && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <lucide_react_1.Save className="mr-2 h-4 w-4" />
                Criar Agendamento
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
