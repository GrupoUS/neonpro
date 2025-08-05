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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfBooking = SelfBooking;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var calendar_1 = require("@/components/ui/calendar");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var avatar_1 = require("@/components/ui/avatar");
var separator_1 = require("@/components/ui/separator");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var sonner_1 = require("sonner");
var bookingSteps = [
  { step: 1, title: "Serviço", description: "Escolha o tratamento desejado" },
  { step: 2, title: "Profissional", description: "Selecione o especialista" },
  { step: 3, title: "Data e Hora", description: "Escolha quando prefere" },
  { step: 4, title: "Confirmação", description: "Revise e confirme" },
];
function SelfBooking() {
  var _a = (0, react_1.useState)(1),
    currentStep = _a[0],
    setCurrentStep = _a[1];
  var _b = (0, react_1.useState)(null),
    selectedService = _b[0],
    setSelectedService = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedProfessional = _c[0],
    setSelectedProfessional = _c[1];
  var _d = (0, react_1.useState)(),
    selectedDate = _d[0],
    setSelectedDate = _d[1];
  var _e = (0, react_1.useState)(""),
    selectedTime = _e[0],
    setSelectedTime = _e[1];
  var _f = (0, react_1.useState)([]),
    availableSlots = _f[0],
    setAvailableSlots = _f[1];
  var _g = (0, react_1.useState)(""),
    notes = _g[0],
    setNotes = _g[1];
  var _h = (0, react_1.useState)(false),
    isLoading = _h[0],
    setIsLoading = _h[1];
  var _j = (0, react_1.useState)(false),
    isBooking = _j[0],
    setIsBooking = _j[1];
  // Sample data - in production, this would come from API
  var services = [
    {
      id: "1",
      name: "Consulta de Avaliação",
      description: "Avaliação inicial para planejamento de tratamentos estéticos",
      duration: 60,
      price: 150,
      category: "consultation",
      requires_evaluation: false,
      icon: "👩‍⚕️",
    },
    {
      id: "2",
      name: "Harmonização Facial",
      description: "Procedimento com ácido hialurônico para harmonização facial",
      duration: 90,
      price: 800,
      category: "procedure",
      requires_evaluation: true,
      icon: "✨",
    },
    {
      id: "3",
      name: "Botox Terapêutico",
      description: "Aplicação de toxina botulínica para linhas de expressão",
      duration: 45,
      price: 600,
      category: "procedure",
      requires_evaluation: true,
      icon: "💫",
    },
    {
      id: "4",
      name: "Retorno Pós-Procedimento",
      description: "Consulta de acompanhamento após procedimentos realizados",
      duration: 30,
      price: 0,
      category: "follow_up",
      requires_evaluation: false,
      icon: "🔄",
    },
  ];
  var professionals = [
    {
      id: "1",
      name: "Dra. Marina Silva",
      specialty: "Dermatologia Estética",
      avatar_url: "",
      rating: 4.9,
      reviews_count: 127,
      available_services: ["1", "2", "3", "4"],
    },
    {
      id: "2",
      name: "Dr. Carlos Mendes",
      specialty: "Cirurgia Plástica",
      avatar_url: "",
      rating: 4.8,
      reviews_count: 89,
      available_services: ["1", "2", "4"],
    },
  ];
  // Generate available time slots (sample data)
  (0, react_1.useEffect)(() => {
    if (selectedDate && selectedProfessional && selectedService) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        var slots = [
          {
            time: "09:00",
            available: true,
            professional_id: selectedProfessional.id,
            service_id: selectedService.id,
          },
          {
            time: "10:30",
            available: false,
            professional_id: selectedProfessional.id,
            service_id: selectedService.id,
          },
          {
            time: "14:00",
            available: true,
            professional_id: selectedProfessional.id,
            service_id: selectedService.id,
          },
          {
            time: "15:30",
            available: true,
            professional_id: selectedProfessional.id,
            service_id: selectedService.id,
          },
          {
            time: "17:00",
            available: false,
            professional_id: selectedProfessional.id,
            service_id: selectedService.id,
          },
        ];
        setAvailableSlots(slots);
        setIsLoading(false);
      }, 1000);
    }
  }, [selectedDate, selectedProfessional, selectedService]);
  var handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };
  var handleProfessionalSelect = (professional) => {
    setSelectedProfessional(professional);
    setCurrentStep(3);
  };
  var handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };
  var handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(4);
  };
  var handleBookingConfirm = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
              sonner_1.toast.error("Dados incompletos para agendamento");
              return [2 /*return*/];
            }
            setIsBooking(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))];
          case 2:
            // Simulate API call
            _a.sent();
            sonner_1.toast.success("Agendamento realizado com sucesso!", {
              description: ""
                .concat(selectedService.name, " em ")
                .concat(
                  (0, date_fns_1.format)(selectedDate, "d 'de' MMMM", { locale: locale_1.ptBR }),
                  " \u00E0s ",
                )
                .concat(selectedTime),
            });
            // Reset form
            setCurrentStep(1);
            setSelectedService(null);
            setSelectedProfessional(null);
            setSelectedDate(undefined);
            setSelectedTime("");
            setNotes("");
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao realizar agendamento", {
              description: "Tente novamente ou entre em contato conosco",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsBooking(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var canSelectDates = (date) => {
    var today = new Date();
    var maxDate = (0, date_fns_1.addDays)(today, 60); // 60 days ahead
    return date >= today && date <= maxDate;
  };
  var getCategoryBadge = (category) => {
    var badges = {
      consultation: { label: "Consulta", color: "bg-blue-100 text-blue-800" },
      procedure: { label: "Procedimento", color: "bg-purple-100 text-purple-800" },
      follow_up: { label: "Retorno", color: "bg-green-100 text-green-800" },
    };
    return badges[category];
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Agendar Consulta
        </h1>
        <p className="text-muted-foreground mt-2">
          Escolha o melhor horário para cuidar da sua saúde e beleza
        </p>
      </div>

      {/* Progress Steps */}
      <card_1.Card className="medical-card">
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-between">
            {bookingSteps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={"w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ".concat(
                      currentStep >= step.step
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {currentStep > step.step
                      ? <lucide_react_1.CheckCircle className="w-5 h-5" />
                      : step.step}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < bookingSteps.length - 1 && (
                  <div
                    className={"flex-1 h-px mx-4 transition-colors ".concat(
                      currentStep > step.step ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Escolha o Serviço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              var badge = getCategoryBadge(service.category);
              return (
                <card_1.Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-md transition-shadow medical-card"
                  onClick={() => handleServiceSelect(service)}
                >
                  <card_1.CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          <badge_1.Badge className={badge.color}>{badge.label}</badge_1.Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <lucide_react_1.Clock className="w-4 h-4" />
                              <span>{service.duration}min</span>
                            </div>
                            <div className="font-semibold text-foreground">
                              {service.price > 0
                                ? "R$ ".concat(service.price.toLocaleString("pt-BR"))
                                : "Gratuito"}
                            </div>
                          </div>
                        </div>
                        {service.requires_evaluation && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                            <lucide_react_1.AlertCircle className="w-4 h-4" />
                            <span>Requer avaliação prévia</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Professional Selection */}
      {currentStep === 2 && selectedService && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <button_1.Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button_1.Button>
          </div>

          <h2 className="text-xl font-semibold mb-2">Escolha o Profissional</h2>
          <p className="text-muted-foreground mb-6">
            Para: <strong>{selectedService.name}</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals
              .filter((prof) => prof.available_services.includes(selectedService.id))
              .map((professional) => (
                <card_1.Card
                  key={professional.id}
                  className="cursor-pointer hover:shadow-md transition-shadow medical-card"
                  onClick={() => handleProfessionalSelect(professional)}
                >
                  <card_1.CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <avatar_1.Avatar className="h-16 w-16">
                        <avatar_1.AvatarImage src={professional.avatar_url} />
                        <avatar_1.AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {professional.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {professional.specialty}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {__spreadArray([], Array(5), true).map((_, i) => (
                              <lucide_react_1.Heart
                                key={i}
                                className={"w-4 h-4 ".concat(
                                  i < Math.floor(professional.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{professional.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({professional.reviews_count} avaliações)
                          </span>
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time Selection */}
      {currentStep === 3 && selectedService && selectedProfessional && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <button_1.Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button_1.Button>
          </div>

          <h2 className="text-xl font-semibold mb-2">Escolha Data e Horário</h2>
          <p className="text-muted-foreground mb-6">
            <strong>{selectedService.name}</strong> com <strong>{selectedProfessional.name}</strong>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <card_1.Card className="medical-card">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Selecione a Data</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <calendar_1.Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => !canSelectDates(date)}
                  locale={locale_1.ptBR}
                  className="rounded-md border"
                />
              </card_1.CardContent>
            </card_1.Card>

            {/* Time Slots */}
            <card_1.Card className="medical-card">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Horários Disponíveis</card_1.CardTitle>
                {selectedDate && (
                  <card_1.CardDescription>
                    {(0, date_fns_1.format)(selectedDate, "EEEE, d 'de' MMMM", {
                      locale: locale_1.ptBR,
                    })}
                  </card_1.CardDescription>
                )}
              </card_1.CardHeader>
              <card_1.CardContent>
                {!selectedDate
                  ? <div className="text-center py-8 text-muted-foreground">
                      <lucide_react_1.Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma data para ver os horários</p>
                    </div>
                  : isLoading
                    ? <div className="text-center py-8">
                        <lucide_react_1.Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando horários...</p>
                      </div>
                    : <div className="grid grid-cols-2 gap-3">
                        {availableSlots.map((slot) => (
                          <button_1.Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => handleTimeSelect(slot.time)}
                            className="h-12"
                          >
                            {slot.time}
                          </button_1.Button>
                        ))}
                      </div>}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 &&
        selectedService &&
        selectedProfessional &&
        selectedDate &&
        selectedTime && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <button_1.Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button_1.Button>
            </div>

            <h2 className="text-xl font-semibold mb-6">Confirmar Agendamento</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <card_1.Card className="medical-card">
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">Resumo do Agendamento</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{selectedService.icon}</div>
                    <div>
                      <h3 className="font-semibold">{selectedService.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                    </div>
                  </div>

                  <separator_1.Separator />

                  <div className="flex items-center gap-3">
                    <lucide_react_1.User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedProfessional.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProfessional.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <lucide_react_1.Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {(0, date_fns_1.format)(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                          locale: locale_1.ptBR,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">às {selectedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <lucide_react_1.Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duração: {selectedService.duration} minutos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <lucide_react_1.MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Clínica NeonPro</p>
                      <p className="text-sm text-muted-foreground">
                        Rua das Flores, 123 - São Paulo, SP
                      </p>
                    </div>
                  </div>

                  {selectedService.price > 0 && (
                    <>
                      <separator_1.Separator />
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Valor:</span>
                        <span>R$ {selectedService.price.toLocaleString("pt-BR")}</span>
                      </div>
                    </>
                  )}
                </card_1.CardContent>
              </card_1.Card>

              {/* Additional Information */}
              <div className="space-y-6">
                <card_1.Card className="medical-card">
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">Observações (Opcional)</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <label_1.Label htmlFor="notes" className="text-sm font-medium">
                      Alguma informação importante para a consulta?
                    </label_1.Label>
                    <textarea_1.Textarea
                      id="notes"
                      placeholder="Descreva sintomas, dúvidas ou informações relevantes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </card_1.CardContent>
                </card_1.Card>

                <alert_1.Alert>
                  <lucide_react_1.CheckCircle className="h-4 w-4" />
                  <alert_1.AlertDescription>
                    <strong>Importante:</strong> Você receberá uma confirmação por email e WhatsApp
                    (se autorizado). Lembre-se de chegar 15 minutos antes do horário agendado.
                  </alert_1.AlertDescription>
                </alert_1.Alert>

                <div className="flex gap-3">
                  <button_1.Button
                    onClick={handleBookingConfirm}
                    disabled={isBooking}
                    className="flex-1"
                    size="lg"
                  >
                    {isBooking && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isBooking ? "Agendando..." : "Confirmar Agendamento"}
                  </button_1.Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
