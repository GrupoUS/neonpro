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
exports.default = AppointmentBookingFlow;
var client_1 = require("@/app/utils/supabase/client");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var sonner_1 = require("sonner");
var appointment_notes_form_1 = require("./appointment-notes-form");
var booking_confirmation_1 = require("./booking-confirmation");
var professional_selection_1 = require("./professional-selection");
var service_selection_1 = require("./service-selection");
var RealTimeAvailability_1 = require("@/components/patient/RealTimeAvailability");
var STEP_TITLES = {
  service: "Escolher Serviço",
  professional: "Escolher Profissional",
  time: "Escolher Horário",
  notes: "Observações",
  confirmation: "Confirmar Agendamento",
};
var STEP_DESCRIPTIONS = {
  service: "Selecione o serviço desejado",
  professional: "Escolha um profissional ou deixe automático",
  time: "Selecione a data e horário",
  notes: "Adicione observações (opcional)",
  confirmation: "Revise e confirme seu agendamento",
};
function AppointmentBookingFlow(_a) {
  var _this = this;
  var _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)("service"),
    currentStep = _c[0],
    setCurrentStep = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedService = _d[0],
    setSelectedService = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedProfessional = _e[0],
    setSelectedProfessional = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedTimeSlot = _f[0],
    setSelectedTimeSlot = _f[1];
  var _g = (0, react_1.useState)(""),
    appointmentNotes = _g[0],
    setAppointmentNotes = _g[1];
  var _h = (0, react_1.useState)([]),
    specialRequests = _h[0],
    setSpecialRequests = _h[1];
  var _j = (0, react_1.useState)(false),
    isSubmitting = _j[0],
    setIsSubmitting = _j[1];
  var _k = (0, react_1.useState)(null),
    bookingStartTime = _k[0],
    setBookingStartTime = _k[1];
  var _l = (0, react_1.useState)(""),
    error = _l[0],
    setError = _l[1];
  var router = (0, navigation_1.useRouter)();
  // Initialize bookingStartTime on client side only
  (0, react_1.useEffect)(function () {
    setBookingStartTime(Date.now());
  }, []);
  var steps = ["service", "professional", "time", "notes", "confirmation"];
  var currentStepIndex = steps.indexOf(currentStep);
  var progress = ((currentStepIndex + 1) / steps.length) * 100;
  var canProceedToNext = function () {
    switch (currentStep) {
      case "service":
        return selectedService !== null;
      case "professional":
        return true; // Professional selection is optional
      case "time":
        return selectedTimeSlot !== null;
      case "notes":
        return true; // Notes are optional
      case "confirmation":
        return false; // No next step
      default:
        return false;
    }
  };
  var canGoBack = function () {
    return currentStepIndex > 0 && currentStep !== "confirmation";
  };
  var handleNext = function () {
    if (!canProceedToNext()) return;
    var nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      setError("");
    }
  };
  var handleBack = function () {
    if (!canGoBack()) return;
    var prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      setError("");
    }
  };
  var handleConfirmBooking = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var supabase,
        _a,
        availabilityCheck,
        availabilityError,
        appointmentData,
        _b,
        appointment,
        bookingError,
        bookingDuration,
        err_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (!selectedService || !selectedTimeSlot) {
              setError("Dados incompletos para o agendamento.");
              return [2 /*return*/];
            }
            setIsSubmitting(true);
            setError("");
            _c.label = 1;
          case 1:
            _c.trys.push([1, 4, 5, 6]);
            supabase = (0, client_1.createClient)();
            return [
              4 /*yield*/,
              supabase.rpc("check_slot_availability", {
                p_datetime: selectedTimeSlot.datetime,
                p_service_id: selectedService.id,
                p_professional_id:
                  (selectedProfessional === null || selectedProfessional === void 0
                    ? void 0
                    : selectedProfessional.id) || null,
              }),
            ];
          case 2:
            (_a = _c.sent()), (availabilityCheck = _a.data), (availabilityError = _a.error);
            if (availabilityError) throw availabilityError;
            if (
              !(availabilityCheck === null || availabilityCheck === void 0
                ? void 0
                : availabilityCheck.is_available)
            ) {
              setError("Este horário não está mais disponível. Por favor, escolha outro horário.");
              setCurrentStep("time");
              return [2 /*return*/];
            }
            appointmentData = {
              service_id: selectedService.id,
              professional_id:
                (selectedProfessional === null || selectedProfessional === void 0
                  ? void 0
                  : selectedProfessional.id) || null,
              datetime: selectedTimeSlot.datetime,
              duration_minutes: selectedService.duration_minutes,
              notes: appointmentNotes.trim() || null,
              special_requests: specialRequests.length > 0 ? specialRequests : null,
              status: "confirmed",
              // Patient info will be populated by RLS/auth context
            };
            return [
              4 /*yield*/,
              supabase.from("patient_appointments").insert([appointmentData]).select().single(),
            ];
          case 3:
            (_b = _c.sent()), (appointment = _b.data), (bookingError = _b.error);
            if (bookingError) throw bookingError;
            bookingDuration = bookingStartTime ? (Date.now() - bookingStartTime) / 1000 : 0;
            console.log("Booking completed in ".concat(bookingDuration.toFixed(1), " seconds"));
            // Redirect to success page
            router.push(
              "/patient/appointments/booking/success?appointment_id=".concat(appointment.id),
            );
            return [3 /*break*/, 6];
          case 4:
            err_1 = _c.sent();
            console.error("Error creating appointment:", err_1);
            setError("Erro ao confirmar agendamento. Tente novamente.");
            return [3 /*break*/, 6];
          case 5:
            setIsSubmitting(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var getElapsedTime = function () {
    if (!bookingStartTime) return "0s";
    var elapsed = (Date.now() - bookingStartTime) / 1000;
    var minutes = Math.floor(elapsed / 60);
    var seconds = Math.floor(elapsed % 60);
    if (minutes > 0) {
      return "".concat(minutes, "m ").concat(seconds, "s");
    }
    return "".concat(seconds, "s");
  };
  var renderStepContent = function () {
    switch (currentStep) {
      case "service":
        return (
          <service_selection_1.ServiceSelection
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
          />
        );
      case "professional":
        return (
          <professional_selection_1.ProfessionalSelection
            serviceId={selectedService.id}
            selectedProfessional={selectedProfessional}
            onProfessionalSelect={setSelectedProfessional}
            allowAnyProfessional={true}
          />
        );
      case "time":
        return (
          <RealTimeAvailability_1.RealTimeAvailability
            serviceId={selectedService.id}
            professionalId={
              selectedProfessional === null || selectedProfessional === void 0
                ? void 0
                : selectedProfessional.id
            }
            dateRange={{
              start: new Date().toISOString().split("T")[0],
              end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }}
            onSlotSelect={function (slot) {
              // Convert RTTimeSlot to TimeSlot format for backward compatibility
              setSelectedTimeSlot({
                datetime: "".concat(slot.date, "T").concat(slot.time),
                is_available: slot.available,
                professional_id: slot.professional_id,
                professional_name:
                  selectedProfessional === null || selectedProfessional === void 0
                    ? void 0
                    : selectedProfessional.name,
              });
            }}
            onSlotReserve={function (slotId) {
              return __awaiter(_this, void 0, void 0, function () {
                var supabase, error_2, error_1;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      _a.trys.push([0, 2, , 3]);
                      supabase = (0, client_1.createClient)();
                      return [
                        4 /*yield*/,
                        supabase.rpc("confirm_appointment_booking", {
                          slot_id: slotId,
                          patient_id: "current_user", // Will be populated by RLS
                          appointment_data: {
                            notes: appointmentNotes,
                            special_requests: specialRequests,
                          },
                        }),
                      ];
                    case 1:
                      error_2 = _a.sent().error;
                      if (error_2) {
                        console.error("Error confirming booking:", error_2);
                        sonner_1.toast.error("Erro ao confirmar reserva");
                        return [2 /*return*/, false];
                      }
                      sonner_1.toast.success("Horário reservado com sucesso!");
                      setCurrentStep("notes"); // Advance to next step
                      return [2 /*return*/, true];
                    case 2:
                      error_1 = _a.sent();
                      console.error("Error in slot reservation:", error_1);
                      return [2 /*return*/, false];
                    case 3:
                      return [2 /*return*/];
                  }
                });
              });
            }}
            patientId="current_user"
            showAlternatives={true}
            maxAlternatives={3}
          />
        );
      case "notes":
        return (
          <appointment_notes_form_1.AppointmentNotesForm
            notes={appointmentNotes}
            onNotesChange={setAppointmentNotes}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
          />
        );
      case "confirmation":
        return (
          <booking_confirmation_1.BookingConfirmation
            service={selectedService}
            professional={selectedProfessional}
            timeSlot={selectedTimeSlot}
            notes={appointmentNotes}
            specialRequests={specialRequests}
            onConfirm={handleConfirmBooking}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className={"max-w-4xl mx-auto space-y-6 ".concat(className)}>
      {/* Header */}
      <card_1.Card>
        <card_1.CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-2xl text-gray-900">
                Agendar Consulta
              </card_1.CardTitle>
              <p className="text-gray-600 mt-1">{STEP_DESCRIPTIONS[currentStep]}</p>
            </div>
            <div className="text-right">
              <badge_1.Badge variant="outline" className="mb-2">
                <lucide_react_1.Clock className="h-3 w-3 mr-1" />
                {getElapsedTime()}
              </badge_1.Badge>
              <p className="text-sm text-gray-500">Meta: ≤ 2 minutos</p>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Etapa {currentStepIndex + 1} de {steps.length}
              </span>
              <span className="font-medium text-gray-900">{STEP_TITLES[currentStep]}</span>
            </div>
            <progress_1.Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center mt-6">
            {steps.map(function (step, index) {
              return (
                <div
                  key={step}
                  className={"flex items-center ".concat(index < steps.length - 1 ? "flex-1" : "")}
                >
                  <div
                    className={"flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ".concat(
                      index < currentStepIndex
                        ? "bg-green-100 text-green-600"
                        : index === currentStepIndex
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {index < currentStepIndex
                      ? <lucide_react_1.CheckCircle2 className="h-4 w-4" />
                      : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={"flex-1 h-1 mx-2 ".concat(
                        index < currentStepIndex ? "bg-green-200" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Error Display */}
      {error && (
        <alert_1.Alert className="border-red-200 bg-red-50">
          <alert_1.AlertDescription className="text-red-700">{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      {currentStep !== "confirmation" && (
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button_1.Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack() || isSubmitting}
            className="w-full sm:w-auto"
          >
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </button_1.Button>
          <button_1.Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            className="w-full sm:flex-1"
          >
            Próximo
            <lucide_react_1.ArrowRight className="ml-2 h-4 w-4" />
          </button_1.Button>
        </div>
      )}
    </div>
  );
}
