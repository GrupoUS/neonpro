/**
 * TASK-003: Business Logic Enhancement
 * AI-Powered Appointment Scheduling Component
 *
 * Intelligent scheduling with conflict detection, resource optimization,
 * and automated time slot suggestions.
 */
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
exports.IntelligentScheduling = IntelligentScheduling;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_toast_1 = require("@/components/ui/use-toast");
var alert_1 = require("@/components/ui/alert");
function IntelligentScheduling(_a) {
  var patientId = _a.patientId,
    serviceId = _a.serviceId,
    onAppointmentScheduled = _a.onAppointmentScheduled;
  var _b = (0, react_1.useState)(),
    selectedDate = _b[0],
    setSelectedDate = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedPatient = _c[0],
    setSelectedPatient = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedProfessional = _d[0],
    setSelectedProfessional = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedService = _e[0],
    setSelectedService = _e[1];
  var _f = (0, react_1.useState)([]),
    availableSlots = _f[0],
    setAvailableSlots = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedSlot = _g[0],
    setSelectedSlot = _g[1];
  var _h = (0, react_1.useState)(false),
    isAnalyzing = _h[0],
    setIsAnalyzing = _h[1];
  var _j = (0, react_1.useState)([]),
    aiRecommendations = _j[0],
    setAiRecommendations = _j[1];
  var _k = (0, react_1.useState)([]),
    conflicts = _k[0],
    setConflicts = _k[1];
  var toast = (0, use_toast_1.useToast)().toast;
  // Mock data - In production, these would come from the database
  var professionals = [
    {
      id: "prof_001",
      name: "Dra. Marina Silva",
      specialties: ["Dermatologia", "Estética"],
      workingHours: { start: "08:00", end: "18:00", days: [1, 2, 3, 4, 5] },
      currentLoad: 75,
    },
    {
      id: "prof_002",
      name: "Dr. Carlos Santos",
      specialties: ["Cirurgia Plástica", "Estética"],
      workingHours: { start: "09:00", end: "17:00", days: [2, 3, 4, 5, 6] },
      currentLoad: 60,
    },
  ];
  var services = [
    {
      id: "srv_001",
      name: "Consulta Dermatológica",
      duration: 30,
      preparationTime: 5,
      cleanupTime: 5,
      requiredResources: ["sala_consulta"],
    },
    {
      id: "srv_002",
      name: "Botox Facial",
      duration: 60,
      preparationTime: 15,
      cleanupTime: 15,
      requiredResources: ["sala_procedimento", "equipamento_botox"],
    },
  ];
  // AI-powered time slot analysis
  var analyzeOptimalSlots = () =>
    __awaiter(this, void 0, void 0, function () {
      var slots, scoredSlots, availableScored, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedDate || !selectedProfessional || !selectedService) return [2 /*return*/];
            setIsAnalyzing(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate AI analysis
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))];
          case 2:
            // Simulate AI analysis
            _a.sent();
            slots = generateTimeSlots(selectedDate, selectedProfessional, selectedService);
            scoredSlots = slots.map((slot) =>
              __assign(__assign({}, slot), {
                aiScore: calculateAIScore(
                  slot,
                  selectedPatient,
                  selectedProfessional,
                  selectedService,
                ),
                reasons: generateReasons(slot, selectedPatient, selectedProfessional),
              }),
            );
            availableScored = scoredSlots
              .filter((slot) => slot.available)
              .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
            setAvailableSlots(availableScored);
            setAiRecommendations(availableScored.slice(0, 3)); // Top 3 recommendations
            toast({
              title: "Análise Concluída",
              description: "".concat(availableScored.length, " slots dispon\u00EDveis encontrados"),
            });
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            toast({
              title: "Erro na Análise",
              description: "Não foi possível analisar os horários",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsAnalyzing(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Generate time slots for a given day
  var generateTimeSlots = (date, professional, service) => {
    var slots = [];
    var dayOfWeek = date.getDay();
    if (!professional.workingHours.days.includes(dayOfWeek)) {
      return slots;
    }
    var _a = professional.workingHours.start.split(":").map(Number),
      startHour = _a[0],
      startMinute = _a[1];
    var _b = professional.workingHours.end.split(":").map(Number),
      endHour = _b[0],
      endMinute = _b[1];
    var totalDuration = service.duration + service.preparationTime + service.cleanupTime;
    for (var hour = startHour; hour < endHour; hour++) {
      for (var minute = 0; minute < 60; minute += 30) {
        var slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        var slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);
        if (
          slotEnd.getHours() > endHour ||
          (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMinute)
        ) {
          break;
        }
        // Check for conflicts (mock implementation)
        var hasConflict = Math.random() < 0.3; // 30% chance of conflict
        var conflicts_1 = hasConflict ? ["Consulta já agendada"] : [];
        slots.push({
          id: "slot_".concat(hour, "_").concat(minute),
          start: slotStart,
          end: slotEnd,
          available: !hasConflict,
          conflicts: conflicts_1,
        });
      }
    }
    return slots;
  };
  // Calculate AI score for time slot optimization
  var calculateAIScore = (slot, patient, professional, service) => {
    var score = 50; // Base score
    // Time preference scoring
    var hour = slot.start.getHours();
    if (hour >= 9 && hour <= 11) score += 20; // Morning preference
    if (hour >= 14 && hour <= 16) score += 15; // Afternoon preference
    // Professional load balancing
    var loadPenalty = professional.currentLoad * 0.3;
    score -= loadPenalty;
    // Patient preference scoring
    if (patient === null || patient === void 0 ? void 0 : patient.preferences) {
      var dayOfWeek = slot.start.getDay();
      if (patient.preferences.preferredDays.includes(dayOfWeek)) {
        score += 15;
      }
      var timeString = (0, date_fns_1.format)(slot.start, "HH:mm");
      if (patient.preferences.preferredTimes.includes(timeString)) {
        score += 10;
      }
    }
    // Service-specific optimization
    if (service.name.includes("Cirurgia") && hour < 12) {
      score += 25; // Surgeries better in morning
    }
    return Math.max(0, Math.min(100, score));
  };
  // Generate reasons for AI recommendations
  var generateReasons = (slot, patient, professional) => {
    var reasons = [];
    var hour = slot.start.getHours();
    if (hour >= 9 && hour <= 11) {
      reasons.push("Horário matinal ideal para concentração");
    }
    if (professional.currentLoad < 70) {
      reasons.push("Profissional com menor carga de trabalho");
    }
    if (patient === null || patient === void 0 ? void 0 : patient.preferences) {
      var dayOfWeek = slot.start.getDay();
      if (patient.preferences.preferredDays.includes(dayOfWeek)) {
        reasons.push("Corresponde às preferências do paciente");
      }
    }
    reasons.push("Sem conflitos de agenda identificados");
    return reasons;
  };
  // Detect and resolve scheduling conflicts
  var detectConflicts = () =>
    __awaiter(this, void 0, void 0, function () {
      var detected, resourceConflicts, professionalConflicts, patientConflicts;
      return __generator(this, (_a) => {
        if (!selectedSlot || !selectedProfessional || !selectedService) return [2 /*return*/];
        detected = [];
        resourceConflicts = checkResourceConflicts(selectedSlot, selectedService);
        detected.push.apply(detected, resourceConflicts);
        professionalConflicts = checkProfessionalConflicts(selectedSlot, selectedProfessional);
        detected.push.apply(detected, professionalConflicts);
        // Patient conflicts
        if (selectedPatient) {
          patientConflicts = checkPatientConflicts(selectedSlot, selectedPatient);
          detected.push.apply(detected, patientConflicts);
        }
        setConflicts(detected);
        return [2 /*return*/, detected];
      });
    });
  var checkResourceConflicts = (slot, service) => {
    // Mock implementation - in production, check against resource bookings
    var conflicts = [];
    if (service.requiredResources.includes("sala_procedimento") && Math.random() < 0.2) {
      conflicts.push("Sala de procedimento já reservada");
    }
    return conflicts;
  };
  var checkProfessionalConflicts = (slot, professional) => {
    // Mock implementation - in production, check against professional's schedule
    return [];
  };
  var checkPatientConflicts = (slot, patient) => {
    // Mock implementation - in production, check against patient's appointments
    return [];
  };
  // Schedule appointment with optimizations
  var scheduleAppointment = () =>
    __awaiter(this, void 0, void 0, function () {
      var detectedConflicts, appointmentData, appointmentId, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedSlot || !selectedPatient || !selectedProfessional || !selectedService) {
              toast({
                title: "Dados Incompletos",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            return [4 /*yield*/, detectConflicts()];
          case 1:
            detectedConflicts = _a.sent();
            if (detectedConflicts.length > 0) {
              toast({
                title: "Conflitos Detectados",
                description: "Resolva os conflitos antes de agendar",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            appointmentData = {
              patientId: selectedPatient.id,
              professionalId: selectedProfessional.id,
              serviceId: selectedService.id,
              start: selectedSlot.start,
              end: selectedSlot.end,
              aiScore: selectedSlot.aiScore,
              scheduledAt: new Date().toISOString(),
            };
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 3:
            _a.sent();
            appointmentId = "APP-".concat(Date.now());
            toast({
              title: "Agendamento Realizado",
              description: "Consulta agendada com sucesso - ".concat(appointmentId),
            });
            onAppointmentScheduled === null || onAppointmentScheduled === void 0
              ? void 0
              : onAppointmentScheduled(appointmentId);
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            toast({
              title: "Erro no Agendamento",
              description: "Não foi possível realizar o agendamento",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5" />
            Agendamento Inteligente
          </card_1.CardTitle>
          <card_1.CardDescription>
            Sistema AI para otimização de horários e detecção de conflitos
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label_1.Label>Paciente</label_1.Label>
              <select_1.Select
                onValueChange={(value) => {
                  var patient = {
                    id: value,
                    name: "Maria Silva",
                    preferences: {
                      preferredDays: [1, 2, 4], // Mon, Tue, Thu
                      preferredTimes: ["09:00", "14:00"],
                      previousAppointments: [],
                    },
                  };
                  setSelectedPatient(patient);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecionar paciente" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="patient_1">Maria Silva</select_1.SelectItem>
                  <select_1.SelectItem value="patient_2">João Santos</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Profissional</label_1.Label>
              <select_1.Select
                onValueChange={(value) => {
                  var professional = professionals.find((p) => p.id === value);
                  setSelectedProfessional(professional || null);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecionar profissional" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {professionals.map((prof) => (
                    <select_1.SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        {prof.name}
                        <badge_1.Badge
                          variant={prof.currentLoad > 80 ? "destructive" : "secondary"}
                        >
                          {prof.currentLoad}%
                        </badge_1.Badge>
                      </div>
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Serviço</label_1.Label>
              <select_1.Select
                onValueChange={(value) => {
                  var service = services.find((s) => s.id === value);
                  setSelectedService(service || null);
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecionar serviço" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {services.map((service) => (
                    <select_1.SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration}min)
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label_1.Label>Data</label_1.Label>
            <popover_1.Popover>
              <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="outline" className="w-full justify-start text-left">
                  <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? (0, date_fns_1.format)(selectedDate, "PPP", { locale: locale_1.pt })
                    : "Selecionar data"}
                </button_1.Button>
              </popover_1.PopoverTrigger>
              <popover_1.PopoverContent className="w-auto p-0">
                <calendar_1.Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </popover_1.PopoverContent>
            </popover_1.Popover>
          </div>

          {/* Analysis Button */}
          <button_1.Button
            onClick={analyzeOptimalSlots}
            disabled={!selectedDate || !selectedProfessional || !selectedService || isAnalyzing}
            className="w-full"
          >
            <lucide_react_1.Brain className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analisando Horários..." : "Analisar Horários Disponíveis"}
          </button_1.Button>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className="space-y-4">
              <label_1.Label className="flex items-center gap-2">
                <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                Recomendações AI
              </label_1.Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((slot) => {
                  var _a;
                  return (
                    <card_1.Card
                      key={slot.id}
                      className={"cursor-pointer transition-colors ".concat(
                        (selectedSlot === null || selectedSlot === void 0
                          ? void 0
                          : selectedSlot.id) === slot.id
                          ? "ring-2 ring-blue-500"
                          : "",
                      )}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <card_1.CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <lucide_react_1.Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {(0, date_fns_1.format)(slot.start, "HH:mm")} -{" "}
                              {(0, date_fns_1.format)(slot.end, "HH:mm")}
                            </span>
                          </div>
                          <badge_1.Badge variant="secondary">{slot.aiScore}% Match</badge_1.Badge>
                        </div>
                        <div className="space-y-1">
                          {(_a = slot.reasons) === null || _a === void 0
                            ? void 0
                            : _a.map((reason, index) => (
                                <p key={index} className="text-xs text-gray-600">
                                  • {reason}
                                </p>
                              ))}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Slots Grid */}
          {availableSlots.length > 0 && (
            <div className="space-y-4">
              <label_1.Label>Todos os Horários Disponíveis</label_1.Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button_1.Button
                    key={slot.id}
                    variant={
                      (selectedSlot === null || selectedSlot === void 0
                        ? void 0
                        : selectedSlot.id) === slot.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                    className="h-auto p-2 flex flex-col items-center"
                  >
                    <span className="text-sm font-medium">
                      {(0, date_fns_1.format)(slot.start, "HH:mm")}
                    </span>
                    {slot.aiScore && (
                      <badge_1.Badge variant="secondary" className="text-xs mt-1">
                        {slot.aiScore}%
                      </badge_1.Badge>
                    )}
                  </button_1.Button>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <alert_1.Alert>
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              <alert_1.AlertTitle>Conflitos Detectados</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}

          {/* Schedule Button */}
          <button_1.Button
            onClick={scheduleAppointment}
            disabled={!selectedSlot || conflicts.length > 0}
            className="w-full"
            size="lg"
          >
            <calendar_1.Calendar className="mr-2 h-4 w-4" />
            Confirmar Agendamento
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
