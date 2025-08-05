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
exports.EditAppointmentDialog = EditAppointmentDialog;
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
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Form validation schema
var appointmentEditSchema = zod_2.z.object({
  patient_id: zod_2.z.string().min(1, "Paciente é obrigatório"),
  professional_id: zod_2.z.string().min(1, "Profissional é obrigatório"),
  service_type_id: zod_2.z.string().min(1, "Tipo de serviço é obrigatório"),
  start_time: zod_2.z.string().min(1, "Data e horário são obrigatórios"),
  status: zod_2.z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  notes: zod_2.z.string().optional(),
  internal_notes: zod_2.z.string().optional(),
  change_reason: zod_2.z.string().min(1, "Motivo da alteração é obrigatório"),
});
function EditAppointmentDialog(_a) {
  var _this = this;
  var appointment = _a.appointment,
    open = _a.open,
    onOpenChange = _a.onOpenChange,
    onUpdate = _a.onUpdate;
  var _b = (0, react_1.useState)([]),
    patients = _b[0],
    setPatients = _b[1];
  var _c = (0, react_1.useState)([]),
    professionals = _c[0],
    setProfessionals = _c[1];
  var _d = (0, react_1.useState)([]),
    services = _d[0],
    setServices = _d[1];
  var _e = (0, react_1.useState)(""),
    conflictError = _e[0],
    setConflictError = _e[1];
  var _f = (0, react_1.useState)(false),
    checkingConflict = _f[0],
    setCheckingConflict = _f[1];
  var _g = (0, react_1.useState)(false),
    isUpdating = _g[0],
    setIsUpdating = _g[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(appointmentEditSchema),
    defaultValues: {
      patient_id: "",
      professional_id: "",
      service_type_id: "",
      start_time: "",
      status: "scheduled",
      notes: "",
      internal_notes: "",
      change_reason: "",
    },
  });
  // Reset form when appointment changes
  (0, react_1.useEffect)(
    function () {
      if (appointment && open) {
        form.reset({
          patient_id: appointment.patient_id,
          professional_id: appointment.professional_id,
          service_type_id: appointment.service_type_id,
          start_time: (0, date_fns_1.format)(
            new Date(appointment.start_time),
            "yyyy-MM-dd'T'HH:mm",
          ),
          status: appointment.status,
          notes: appointment.notes || "",
          internal_notes: appointment.internal_notes || "",
          change_reason: "",
        });
      }
    },
    [appointment, open, form],
  );
  // Load reference data
  (0, react_1.useEffect)(
    function () {
      if (!open) return;
      var loadReferenceData = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var _a,
            patientsRes,
            professionalsRes,
            servicesRes,
            patientsData,
            professionalsData,
            servicesData,
            error_1;
          return __generator(this, function (_b) {
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
      };
      loadReferenceData();
    },
    [open],
  );
  // Check for conflicts when time or professional changes
  var checkConflicts = function (professionalId, startTime, serviceId) {
    return __awaiter(_this, void 0, void 0, function () {
      var selectedService, endTime, response, data, conflicts, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!professionalId || !startTime || !serviceId || !appointment) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            setCheckingConflict(true);
            setConflictError("");
            selectedService = services.find(function (s) {
              return s.id === serviceId;
            });
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
            return [3 /*break*/, 6];
          case 4:
            error_2 = _b.sent();
            console.error("Error checking conflicts:", error_2);
            return [3 /*break*/, 6];
          case 5:
            setCheckingConflict(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Watch form changes for conflict checking
  var watchedValues = form.watch(["professional_id", "start_time", "service_type_id"]);
  (0, react_1.useEffect)(
    function () {
      var professionalId = watchedValues[0],
        startTime = watchedValues[1],
        serviceId = watchedValues[2];
      if (professionalId && startTime && serviceId && services.length > 0) {
        var timer_1 = setTimeout(function () {
          checkConflicts(professionalId, startTime, serviceId);
        }, 500);
        return function () {
          return clearTimeout(timer_1);
        };
      }
    },
    [watchedValues, services, appointment],
  );
  // Handle form submission
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var selectedService, startTime, endTime, updateData, response, result, conflicts, error_3;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (conflictError) {
              sonner_1.toast.error("Resolva os conflitos antes de continuar");
              return [2 /*return*/];
            }
            if (!appointment) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, 5, 6]);
            setIsUpdating(true);
            selectedService = services.find(function (s) {
              return s.id === data.service_type_id;
            });
            if (!selectedService) {
              sonner_1.toast.error("Serviço não encontrado");
              return [2 /*return*/];
            }
            startTime = new Date(data.start_time);
            endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);
            updateData = {
              patient_id: data.patient_id,
              professional_id: data.professional_id,
              service_type_id: data.service_type_id,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              status: data.status,
              notes: data.notes,
              internal_notes: data.internal_notes,
              change_reason: data.change_reason,
            };
            return [
              4 /*yield*/,
              fetch("/api/appointments/".concat(appointment.id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
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
                  .map(function (c) {
                    return "".concat(c.patient_name, " (").concat(
                      (0, date_fns_1.format)(new Date(c.start_time), "HH:mm", {
                        locale: locale_1.ptBR,
                      }),
                      ")",
                    );
                  })
                  .join(", ");
                setConflictError("Conflito detectado: ".concat(conflicts));
                return [2 /*return*/];
              }
              throw new Error(result.error_message || "Erro ao atualizar agendamento");
            }
            if (result.data) {
              onUpdate(result.data);
              onOpenChange(false);
              sonner_1.toast.success("Agendamento atualizado com sucesso!");
            }
            return [3 /*break*/, 6];
          case 4:
            error_3 = _b.sent();
            console.error("Error updating appointment:", error_3);
            sonner_1.toast.error("Erro ao atualizar agendamento");
            return [3 /*break*/, 6];
          case 5:
            setIsUpdating(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var statusOptions = [
    { value: "scheduled", label: "Agendado" },
    { value: "confirmed", label: "Confirmado" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "completed", label: "Concluído" },
    { value: "cancelled", label: "Cancelado" },
    { value: "no_show", label: "Não Compareceu" },
  ];
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Editar Agendamento</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Modifique os detalhes do agendamento. Todos os campos são obrigatórios.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Conflict Alert */}
            {(conflictError || checkingConflict) && (
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  {checkingConflict ? "Verificando conflitos..." : conflictError}
                </alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <form_1.FormField
                control={form.control}
                name="patient_id"
                render={function (_a) {
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
                          {patients.map(function (patient) {
                            return (
                              <select_1.SelectItem key={patient.id} value={patient.id}>
                                {patient.full_name}
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

              {/* Professional Selection */}
              <form_1.FormField
                control={form.control}
                name="professional_id"
                render={function (_a) {
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
                          {professionals.map(function (professional) {
                            return (
                              <select_1.SelectItem key={professional.id} value={professional.id}>
                                {professional.full_name}
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

              {/* Service Selection */}
              <form_1.FormField
                control={form.control}
                name="service_type_id"
                render={function (_a) {
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
                          {services.map(function (service) {
                            return (
                              <select_1.SelectItem key={service.id} value={service.id}>
                                {service.name} ({Math.floor(service.duration_minutes / 60)}h
                                {service.duration_minutes % 60}min)
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

              {/* Status */}
              <form_1.FormField
                control={form.control}
                name="status"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Status</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o status" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {statusOptions.map(function (status) {
                            return (
                              <select_1.SelectItem key={status.value} value={status.value}>
                                {status.label}
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
            <form_1.FormField
              control={form.control}
              name="start_time"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Data e Horário</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input
                        type="datetime-local"
                        {...field}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Change Reason */}
            <form_1.FormField
              control={form.control}
              name="change_reason"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Motivo da Alteração</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea
                        placeholder="Descreva o motivo da alteração..."
                        {...field}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="notes"
                render={function (_a) {
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
                render={function (_a) {
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
                onClick={function () {
                  return onOpenChange(false);
                }}
                disabled={isUpdating}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                type="submit"
                disabled={isUpdating || !!conflictError || checkingConflict}
              >
                {isUpdating && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <lucide_react_1.Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
