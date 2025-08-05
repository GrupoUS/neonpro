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
exports.EnhancedAppointmentForm = EnhancedAppointmentForm;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var error_boundary_1 = require("@/components/ui/error-boundary");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var use_conflict_prevention_1 = require("@/hooks/appointments/use-conflict-prevention");
var zod_1 = require("@hookform/resolvers/zod");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var sonner_1 = require("sonner");
var zod_2 = require("zod");
// Form validation schema
var appointmentFormSchema = zod_2.z.object({
  patient_id: zod_2.z.string().min(1, "Selecione um paciente"),
  professional_id: zod_2.z.string().min(1, "Selecione um profissional"),
  service_type_id: zod_2.z.string().min(1, "Selecione um serviço"),
  start_time: zod_2.z.string().min(1, "Selecione data e horário"),
  end_time: zod_2.z.string().min(1, "Horário de fim é obrigatório"),
  notes: zod_2.z.string().optional(),
});
function EnhancedAppointmentForm(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    editingAppointment = _a.editingAppointment,
    onSave = _a.onSave,
    onCancel = _a.onCancel;
  // Form state
  var _b = (0, react_1.useState)(false),
    isSubmitting = _b[0],
    setIsSubmitting = _b[1];
  var _c = (0, react_1.useState)([]),
    patients = _c[0],
    setPatients = _c[1];
  var _d = (0, react_1.useState)([]),
    professionals = _d[0],
    setProfessionals = _d[1];
  var _e = (0, react_1.useState)([]),
    services = _e[0],
    setServices = _e[1];
  var _f = (0, react_1.useState)(60),
    estimatedDuration = _f[0],
    setEstimatedDuration = _f[1]; // minutes
  // Conflict prevention integration
  var _g = (0, use_conflict_prevention_1.useConflictPrevention)({
      debounceMs: 500,
      enableRealTime: true,
    }),
    isValidating = _g.isValidating,
    conflicts = _g.conflicts,
    warnings = _g.warnings,
    alternativeSlots = _g.alternativeSlots,
    isAvailable = _g.isAvailable,
    hasErrors = _g.hasErrors,
    hasWarnings = _g.hasWarnings,
    validateSlot = _g.validateSlot,
    clearValidation = _g.clearValidation,
    getSuggestedSlots = _g.getSuggestedSlots;
  // Form setup
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(appointmentFormSchema),
    defaultValues: {
      patient_id:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.patient_id) || "",
      professional_id:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.professional_id) || "",
      service_type_id:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.service_type_id) || "",
      start_time:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.start_time) || "",
      end_time:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.end_time) || "",
      notes:
        (editingAppointment === null || editingAppointment === void 0
          ? void 0
          : editingAppointment.notes) || "",
    },
  });
  // Load data on mount
  (0, react_1.useEffect)(
    function () {
      Promise.all([loadPatients(), loadProfessionals(), loadServices()]);
    },
    [clinicId],
  );
  // Auto-calculate end time when start time or service changes
  (0, react_1.useEffect)(
    function () {
      var startTime = form.watch("start_time");
      var serviceId = form.watch("service_type_id");
      if (startTime && serviceId) {
        var service = services.find(function (s) {
          return s.id === serviceId;
        });
        if (service) {
          setEstimatedDuration(service.duration);
          var endTime = (0, date_fns_1.addMinutes)(
            (0, date_fns_1.parseISO)(startTime),
            service.duration,
          ).toISOString();
          form.setValue("end_time", endTime);
          // Trigger validation for new time slot
          triggerValidation();
        }
      }
    },
    [form.watch("start_time"), form.watch("service_type_id"), services],
  );
  var loadPatients = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/patients"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setPatients(
              data.map(function (p) {
                return { id: p.id, name: p.name };
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading patients:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadProfessionals = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/professionals"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProfessionals(
              data.map(function (p) {
                return { id: p.id, name: p.name };
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error loading professionals:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadServices = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/services"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setServices(
              data.map(function (s) {
                return {
                  id: s.id,
                  name: s.name,
                  duration: s.duration_minutes || 60,
                };
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error loading services:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var triggerValidation = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var values, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            values = form.getValues();
            if (
              !(
                values.professional_id &&
                values.service_type_id &&
                values.start_time &&
                values.end_time
              )
            )
              return [3 /*break*/, 4];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              validateSlot({
                professional_id: values.professional_id,
                service_type_id: values.service_type_id,
                start_time: values.start_time,
                end_time: values.end_time,
                exclude_appointment_id:
                  editingAppointment === null || editingAppointment === void 0
                    ? void 0
                    : editingAppointment.id,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Validation error:", error_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var applyAlternativeSlot = function (slot) {
    form.setValue("start_time", slot.start_time);
    form.setValue("end_time", slot.end_time);
    clearValidation();
    // This will trigger validation through the useEffect
  };
  var handleSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Final validation before submission
            if (hasErrors) {
              sonner_1.toast.error(
                "Existem conflitos que impedem o agendamento. Por favor, resolva-os primeiro.",
              );
              return [2 /*return*/];
            }
            setIsSubmitting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onSave(data)];
          case 2:
            _a.sent();
            sonner_1.toast.success(
              editingAppointment ? "Agendamento atualizado!" : "Agendamento criado!",
            );
            return [3 /*break*/, 5];
          case 3:
            error_5 = _a.sent();
            console.error("Error saving appointment:", error_5);
            sonner_1.toast.error("Erro ao salvar agendamento");
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
  var formatDateTime = function (dateTime) {
    try {
      return (0, date_fns_1.format)((0, date_fns_1.parseISO)(dateTime), "dd/MM/yyyy HH:mm", {
        locale: locale_1.ptBR,
      });
    } catch (_a) {
      return dateTime;
    }
  };
  var getValidationStatusIcon = function () {
    if (isValidating) {
      return <lucide_react_1.Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
    if (hasErrors) {
      return <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (isAvailable) {
      return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return null;
  };
  var suggestedSlots = getSuggestedSlots(3);
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Calendar className="h-5 w-5" />
          {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          {getValidationStatusIcon()}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label_1.Label htmlFor="patient">Paciente *</label_1.Label>
            <react_hook_form_1.Controller
              name="patient_id"
              control={form.control}
              render={function (_a) {
                var field = _a.field;
                return (
                  <select_1.Select value={field.value} onValueChange={field.onChange}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um paciente" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {patients.map(function (patient) {
                        return (
                          <select_1.SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.User className="h-4 w-4" />
                              {patient.name}
                            </div>
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                );
              }}
            />
            {form.formState.errors.patient_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.patient_id.message}
              </p>
            )}
          </div>

          {/* Professional Selection */}
          <div>
            <label_1.Label htmlFor="professional">Profissional *</label_1.Label>
            <react_hook_form_1.Controller
              name="professional_id"
              control={form.control}
              render={function (_a) {
                var field = _a.field;
                return (
                  <select_1.Select
                    value={field.value}
                    onValueChange={function (value) {
                      field.onChange(value);
                      clearValidation();
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um profissional" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {professionals.map(function (professional) {
                        return (
                          <select_1.SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                );
              }}
            />
            {form.formState.errors.professional_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.professional_id.message}
              </p>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label_1.Label htmlFor="service">Serviço *</label_1.Label>
            <react_hook_form_1.Controller
              name="service_type_id"
              control={form.control}
              render={function (_a) {
                var field = _a.field;
                return (
                  <select_1.Select
                    value={field.value}
                    onValueChange={function (value) {
                      field.onChange(value);
                      clearValidation();
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um serviço" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {services.map(function (service) {
                        return (
                          <select_1.SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between w-full">
                              {service.name}
                              <badge_1.Badge variant="secondary" className="ml-2">
                                {service.duration}min
                              </badge_1.Badge>
                            </div>
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                );
              }}
            />
            {form.formState.errors.service_type_id && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.service_type_id.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label_1.Label htmlFor="start_time">Data e Horário *</label_1.Label>
              <react_hook_form_1.Controller
                name="start_time"
                control={form.control}
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <input_1.Input
                      type="datetime-local"
                      {...field}
                      onChange={function (e) {
                        field.onChange(e.target.value);
                        clearValidation();
                      }}
                      className={
                        hasErrors ? "border-red-500" : isAvailable ? "border-green-500" : ""
                      }
                    />
                  );
                }}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>

            <div>
              <label_1.Label htmlFor="duration">Duração Estimada</label_1.Label>
              <div className="flex items-center gap-2 mt-1">
                <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{estimatedDuration} minutos</span>
                {isValidating && <badge_1.Badge variant="secondary">Validando...</badge_1.Badge>}
              </div>
            </div>
          </div>

          {/* Conflict Display */}
          {(hasErrors || hasWarnings) && (
            <div className="space-y-3">
              {conflicts
                .filter(function (c) {
                  return c.severity === "error";
                })
                .map(function (conflict, index) {
                  return (
                    <alert_1.Alert key={index} className="border-red-200 bg-red-50">
                      <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600" />
                      <alert_1.AlertDescription className="text-red-700">
                        <strong>Conflito:</strong> {conflict.message}
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                  );
                })}

              {warnings.map(function (warning, index) {
                return (
                  <alert_1.Alert key={index} className="border-amber-200 bg-amber-50">
                    <lucide_react_1.AlertCircle className="h-4 w-4 text-amber-600" />
                    <alert_1.AlertDescription className="text-amber-700">
                      <strong>Aviso:</strong> {warning.message}
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                );
              })}
            </div>
          )}

          {/* Alternative Slots Suggestions */}
          {hasErrors && suggestedSlots.length > 0 && (
            <card_1.Card className="border-blue-200 bg-blue-50">
              <card_1.CardContent className="p-4">
                <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
                  <lucide_react_1.CalendarDays className="h-4 w-4" />
                  Horários Alternativos Sugeridos
                </h4>
                <div className="space-y-2">
                  {suggestedSlots.map(function (slot, index) {
                    return (
                      <button_1.Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return applyAlternativeSlot(slot);
                        }}
                        className="w-full justify-between text-sm"
                      >
                        <span>{formatDateTime(slot.start_time)}</span>
                        <lucide_react_1.ArrowRight className="h-3 w-3" />
                      </button_1.Button>
                    );
                  })}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Clique em um horário para aplicar automaticamente
                </p>
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Success State */}
          {isAvailable && !hasErrors && !hasWarnings && (
            <alert_1.Alert className="border-green-200 bg-green-50">
              <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
              <alert_1.AlertDescription className="text-green-700">
                Horário disponível! O agendamento pode ser realizado sem conflitos.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}

          {/* Notes */}
          <div>
            <label_1.Label htmlFor="notes">Observações</label_1.Label>
            <react_hook_form_1.Controller
              name="notes"
              control={form.control}
              render={function (_a) {
                var field = _a.field;
                return (
                  <textarea_1.Textarea
                    {...field}
                    placeholder="Observações adicionais sobre o agendamento..."
                    rows={3}
                  />
                );
              }}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button_1.Button type="submit" disabled={isSubmitting || hasErrors} className="flex-1">
              {isSubmitting
                ? <>
                    <lucide_react_1.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingAppointment ? "Atualizando..." : "Criando..."}
                  </>
                : <>
                    <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                    {editingAppointment ? "Atualizar" : "Criar"} Agendamento
                  </>}
            </button_1.Button>
            <button_1.Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </button_1.Button>
          </div>
        </form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Export with Error Boundary protection for critical appointment functionality
exports.default = (0, error_boundary_1.withErrorBoundary)(EnhancedAppointmentForm, {
  onError: function (error, errorInfo) {
    console.error("Critical error in appointment form:", error, errorInfo);
    // Send to Sentry monitoring service
    if (typeof window !== "undefined") {
      Promise.resolve()
        .then(function () {
          return require("@sentry/nextjs");
        })
        .then(function (_a) {
          var withScope = _a.withScope,
            captureException = _a.captureException;
          withScope(function (scope) {
            scope.setTag("component", "EnhancedAppointmentForm");
            scope.setTag("criticalError", true);
            scope.setContext("appointmentForm", {
              componentStack: errorInfo.componentStack,
              timestamp: new Date().toISOString(),
              userAgent: window.navigator.userAgent,
              url: window.location.href,
            });
            captureException(error, {
              level: "error",
              tags: {
                section: "appointment-booking",
                feature: "conflict-prevention",
              },
              extra: {
                errorInfo: errorInfo,
              },
            });
          });
        })
        .catch(function (sentryError) {
          console.error("Failed to report error to Sentry:", sentryError);
        });
    }
  },
  showDetails: process.env.NODE_ENV === "development",
});
