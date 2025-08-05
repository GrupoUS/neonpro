"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.default = AppointmentBookingWizard;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
// Step components (to be imported)
var service_selection_1 = require("./service-selection");
var professional_selection_1 = require("./professional-selection");
var time_slot_picker_1 = require("./time-slot-picker");
var appointment_notes_1 = require("./appointment-notes");
var booking_confirmation_1 = require("./booking-confirmation");
var use_availability_manager_1 = require("@/hooks/use-availability-manager");
function AppointmentBookingWizard(_a) {
  var _b, _c, _d, _e, _f;
  var patientId = _a.patientId,
    onBookingComplete = _a.onBookingComplete,
    _g = _a.className,
    className = _g === void 0 ? "" : _g;
  var t = (0, use_translation_1.useTranslation)().t;
  // Wizard state management
  var _h = (0, react_1.useState)({
      currentStep: 1,
      selectedService: undefined,
      selectedProfessional: undefined,
      selectedTimeSlot: undefined,
      patientNotes: "",
      isLoading: false,
      error: undefined,
    }),
    state = _h[0],
    setState = _h[1];
  // Real-time availability manager
  var availabilityManager = (0, use_availability_manager_1.useAvailabilityManager)();
  var _j = (0, react_1.useState)(null),
    selectedRealtimeSlot = _j[0],
    setSelectedRealtimeSlot = _j[1];
  // Define booking steps
  var steps = (0, react_1.useMemo)(
    () => [
      {
        id: 1,
        title: t("booking.steps.service.title"),
        description: t("booking.steps.service.description"),
        isCompleted: !!state.selectedService,
        isActive: state.currentStep === 1,
      },
      {
        id: 2,
        title: t("booking.steps.professional.title"),
        description: t("booking.steps.professional.description"),
        isCompleted: !!state.selectedProfessional,
        isActive: state.currentStep === 2,
      },
      {
        id: 3,
        title: t("booking.steps.time.title"),
        description: t("booking.steps.time.description"),
        isCompleted: !!state.selectedTimeSlot,
        isActive: state.currentStep === 3,
      },
      {
        id: 4,
        title: t("booking.steps.notes.title"),
        description: t("booking.steps.notes.description"),
        isCompleted: state.patientNotes.length >= 0,
        isActive: state.currentStep === 4,
      },
      {
        id: 5,
        title: t("booking.steps.confirmation.title"),
        description: t("booking.steps.confirmation.description"),
        isCompleted: false,
        isActive: state.currentStep === 5,
      },
    ],
    [state, t],
  );
  // Calculate progress percentage
  var progressPercentage = (0, react_1.useMemo)(() => {
    var completedSteps = steps.filter((step) => step.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  }, [steps]);
  // Navigation functions
  var goToNextStep = (0, react_1.useCallback)(() => {
    if (state.currentStep < steps.length) {
      setState((prev) => __assign(__assign({}, prev), { currentStep: prev.currentStep + 1 }));
    }
  }, [state.currentStep, steps.length]);
  var goToPreviousStep = (0, react_1.useCallback)(() => {
    if (state.currentStep > 1) {
      setState((prev) => __assign(__assign({}, prev), { currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);
  // Selection handlers
  var handleServiceSelection = (0, react_1.useCallback)(
    (service) => {
      setState((prev) =>
        __assign(__assign({}, prev), {
          selectedService: service,
          selectedProfessional: undefined,
          selectedTimeSlot: undefined,
          error: undefined,
        }),
      );
      goToNextStep();
    },
    [goToNextStep],
  );
  var handleProfessionalSelection = (0, react_1.useCallback)(
    (professional) => {
      setState((prev) =>
        __assign(__assign({}, prev), {
          selectedProfessional: professional,
          selectedTimeSlot: undefined,
          error: undefined,
        }),
      );
      goToNextStep();
    },
    [goToNextStep],
  );
  var handleTimeSlotSelection = (0, react_1.useCallback)(
    (timeSlot) => {
      setState((prev) =>
        __assign(__assign({}, prev), { selectedTimeSlot: timeSlot, error: undefined }),
      );
      goToNextStep();
    },
    [goToNextStep],
  );
  var handleNotesChange = (0, react_1.useCallback)((notes) => {
    setState((prev) => __assign(__assign({}, prev), { patientNotes: notes }));
  }, []);
  // Data validation utility
  var validateBookingData = (0, react_1.useCallback)((bookingData) => {
    if (!bookingData.patient_id) return "ID do paciente é obrigatório";
    if (!bookingData.professional_id) return "Profissional é obrigatório";
    if (!bookingData.service_type_id) return "Tipo de serviço é obrigatório";
    if (!bookingData.start_time) return "Horário de início é obrigatório";
    if (!bookingData.end_time) return "Horário de término é obrigatório";
    // Validate that end_time is after start_time
    if (new Date(bookingData.start_time) >= new Date(bookingData.end_time)) {
      return "Horário de término deve ser após o início";
    }
    return null; // No validation errors
  }, []);
  // Booking submission - Real API implementation
  // This function handles the complete booking flow with proper error handling,
  // validation, timeout handling, and authentication
  var handleBookingSubmit = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var startTime,
          endTime,
          bookingData,
          validationError_1,
          response,
          errorData,
          result_1,
          successResponse,
          error_1,
          errorMessage_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (
                !state.selectedService ||
                !state.selectedProfessional ||
                !state.selectedTimeSlot
              ) {
                setState((prev) =>
                  __assign(__assign({}, prev), { error: t("booking.errors.incomplete") }),
                );
                return [2 /*return*/];
              }
              setState((prev) =>
                __assign(__assign({}, prev), { isLoading: true, error: undefined }),
              );
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, 7, 8]);
              startTime = new Date(state.selectedTimeSlot.start_time);
              endTime = new Date(
                startTime.getTime() + state.selectedService.duration_minutes * 60 * 1000,
              );
              bookingData = {
                patient_id: patientId,
                professional_id: state.selectedProfessional.id,
                service_type_id: state.selectedService.id,
                start_time: startTime,
                end_time: endTime,
                notes: state.patientNotes || null,
                internal_notes: null,
              };
              validationError_1 = validateBookingData(bookingData);
              if (validationError_1) {
                setState((prev) => __assign(__assign({}, prev), { error: validationError_1 }));
                return [2 /*return*/];
              }
              return [
                4 /*yield*/,
                fetch("/api/appointments", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify(bookingData),
                  signal: AbortSignal.timeout(30000), // 30 second timeout
                }),
              ];
            case 2:
              response = _a.sent();
              if (response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json().catch(() => ({}))];
            case 3:
              errorData = _a.sent();
              if (response.status === 401) {
                throw new Error(t("booking.errors.unauthorized") || "Não autorizado");
              } else if (response.status === 409) {
                throw new Error(
                  errorData.error_message || t("booking.errors.conflict") || "Conflito de horário",
                );
              } else if (response.status === 400) {
                throw new Error(
                  errorData.error_message || t("booking.errors.validation") || "Dados inválidos",
                );
              } else {
                throw new Error(
                  errorData.error_message || t("booking.errors.network") || "Erro de rede",
                );
              }
              _a.label = 4;
            case 4:
              return [4 /*yield*/, response.json()];
            case 5:
              result_1 = _a.sent();
              if (result_1.success) {
                successResponse = {
                  success: true,
                  confirmation_code: result_1.appointment_id || "N/A",
                  appointment: result_1.appointment,
                };
                onBookingComplete === null || onBookingComplete === void 0
                  ? void 0
                  : onBookingComplete(successResponse);
              } else {
                // API returned success: false
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    error:
                      result_1.error_message ||
                      result_1.error_details ||
                      t("booking.errors.generic"),
                  }),
                );
              }
              return [3 /*break*/, 8];
            case 6:
              error_1 = _a.sent();
              console.error("Booking submission error:", error_1);
              if (error_1 instanceof DOMException && error_1.name === "TimeoutError") {
                errorMessage_1 =
                  t("booking.errors.timeout") || "Tempo limite excedido. Tente novamente.";
              } else if (error_1 instanceof DOMException && error_1.name === "AbortError") {
                errorMessage_1 = t("booking.errors.aborted") || "Operação cancelada.";
              } else if (error_1 instanceof TypeError && error_1.message.includes("fetch")) {
                errorMessage_1 =
                  t("booking.errors.network") || "Erro de conexão. Verifique sua internet.";
              } else if (error_1 instanceof Error) {
                errorMessage_1 = error_1.message;
              } else {
                errorMessage_1 = t("booking.errors.generic") || "Erro inesperado ao agendar";
              }
              setState((prev) => __assign(__assign({}, prev), { error: errorMessage_1 }));
              return [3 /*break*/, 8];
            case 7:
              setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      }),
    [state, patientId, onBookingComplete, t, validateBookingData],
  );
  // Check if current step can proceed
  var canProceed = (0, react_1.useMemo)(() => {
    switch (state.currentStep) {
      case 1:
        return !!state.selectedService;
      case 2:
        return !!state.selectedProfessional;
      case 3:
        return !!state.selectedTimeSlot;
      case 4:
        return true; // Notes are optional
      case 5:
        return false; // Final step
      default:
        return false;
    }
  }, [state]);
  return (
    <div className={"w-full max-w-4xl mx-auto space-y-6 ".concat(className)}>
      {/* Progress Header */}
      <card_1.Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="flex items-center justify-between">
            <span className="text-lg font-medium">{t("booking.wizard.title")}</span>
            <badge_1.Badge variant="outline" className="text-xs">
              {t("booking.wizard.step", { current: state.currentStep, total: steps.length })}
            </badge_1.Badge>
          </card_1.CardTitle>
          <div className="space-y-2">
            <progress_1.Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {(_b = steps[state.currentStep - 1]) === null || _b === void 0
                ? void 0
                : _b.description}
            </p>
          </div>
        </card_1.CardHeader>
      </card_1.Card>{" "}
      {/* Error Alert */}
      {state.error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>{state.error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}
      {/* Step Content */}
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <framer_motion_1.AnimatePresence mode="wait">
            <framer_motion_1.motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {state.currentStep === 1 && (
                <service_selection_1.default
                  selectedService={state.selectedService}
                  onServiceSelect={handleServiceSelection}
                  isLoading={state.isLoading}
                />
              )}

              {state.currentStep === 2 && (
                <professional_selection_1.default
                  serviceId={
                    (_c = state.selectedService) === null || _c === void 0 ? void 0 : _c.id
                  }
                  selectedProfessional={state.selectedProfessional}
                  onProfessionalSelect={handleProfessionalSelection}
                  isLoading={state.isLoading}
                />
              )}

              {state.currentStep === 3 && (
                <time_slot_picker_1.default
                  serviceId={
                    (_d = state.selectedService) === null || _d === void 0 ? void 0 : _d.id
                  }
                  professionalId={
                    (_e = state.selectedProfessional) === null || _e === void 0 ? void 0 : _e.id
                  }
                  selectedTimeSlot={state.selectedTimeSlot}
                  onTimeSlotSelect={handleTimeSlotSelection}
                  isLoading={state.isLoading}
                  patientId={patientId}
                />
              )}

              {state.currentStep === 4 && (
                <appointment_notes_1.default
                  notes={state.patientNotes}
                  onNotesChange={handleNotesChange}
                  maxLength={1000}
                  serviceInstructions={
                    (_f = state.selectedService) === null || _f === void 0
                      ? void 0
                      : _f.preparation_instructions
                  }
                />
              )}

              {state.currentStep === 5 && (
                <booking_confirmation_1.default
                  service={state.selectedService}
                  professional={state.selectedProfessional}
                  timeSlot={state.selectedTimeSlot}
                  notes={state.patientNotes}
                  onConfirm={handleBookingSubmit}
                  isLoading={state.isLoading}
                />
              )}
            </framer_motion_1.motion.div>
          </framer_motion_1.AnimatePresence>
        </card_1.CardContent>
      </card_1.Card>
      {/* Navigation Footer */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center justify-between">
            <button_1.Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={state.currentStep === 1 || state.isLoading}
              className="flex items-center gap-2"
            >
              <lucide_react_1.ArrowLeft className="h-4 w-4" />
              {t("common.previous")}
            </button_1.Button>

            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={"w-3 h-3 rounded-full transition-colors ".concat(
                    step.isCompleted
                      ? "bg-green-500"
                      : step.isActive
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600",
                  )}
                  title={step.title}
                />
              ))}
            </div>

            <button_1.Button
              onClick={state.currentStep === steps.length ? undefined : goToNextStep}
              disabled={!canProceed || state.isLoading}
              className="flex items-center gap-2"
            >
              {state.currentStep === steps.length
                ? <lucide_react_1.Check className="h-4 w-4" />
                : <>
                    {t("common.next")}
                    <lucide_react_1.ArrowRight className="h-4 w-4" />
                  </>}
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Summary Sidebar for Mobile */}
      <div className="md:hidden">
        {(state.selectedService || state.selectedProfessional || state.selectedTimeSlot) && (
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-base">
                {t("booking.summary.title")}
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              {state.selectedService && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("booking.summary.service")}</span>
                  <span className="font-medium">{state.selectedService.name}</span>
                </div>
              )}

              {state.selectedProfessional && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("booking.summary.professional")}</span>
                  <span className="font-medium">{state.selectedProfessional.name}</span>
                </div>
              )}

              {state.selectedTimeSlot && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("booking.summary.time")}</span>
                  <span className="font-medium">
                    {new Date(state.selectedTimeSlot.start_time).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        )}
      </div>
    </div>
  );
}
