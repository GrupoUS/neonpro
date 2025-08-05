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
exports.TimeSlotDisplay = TimeSlotDisplay;
var client_1 = require("@/app/utils/supabase/client");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function TimeSlotDisplay(_a) {
  var serviceId = _a.serviceId,
    selectedSlot = _a.selectedSlot,
    onSlotSelect = _a.onSlotSelect,
    professionalId = _a.professionalId,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)([]),
    availableSlots = _c[0],
    setAvailableSlots = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)((0, date_fns_1.format)(new Date(), "yyyy-MM-dd")),
    selectedDate = _f[0],
    setSelectedDate = _f[1];
  (0, react_1.useEffect)(() => {
    if (serviceId) {
      fetchAvailableSlots();
    }
  }, [serviceId, professionalId, selectedDate]);
  var fetchAvailableSlots = () =>
    __awaiter(this, void 0, void 0, function () {
      var supabase, startDate, endDate, _a, data, fetchError, groupedSlots_1, slotsArray, err_1;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            setLoading(true);
            supabase = (0, client_1.createClient)();
            startDate = (0, date_fns_1.startOfDay)(new Date(selectedDate));
            endDate = (0, date_fns_1.endOfDay)((0, date_fns_1.addDays)(startDate, 6)); // Show 7 days at a time
            return [
              4 /*yield*/,
              supabase.rpc("get_patient_available_slots", {
                p_service_id: serviceId,
                p_professional_id: professionalId || null,
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString(),
              }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
            if (fetchError) throw fetchError;
            groupedSlots_1 = {};
            data.forEach((slot) => {
              var date = (0, date_fns_1.format)(new Date(slot.datetime), "yyyy-MM-dd");
              if (!groupedSlots_1[date]) {
                groupedSlots_1[date] = [];
              }
              groupedSlots_1[date].push({
                datetime: slot.datetime,
                is_available: slot.is_available,
                professional_id: slot.professional_id,
                professional_name: slot.professional_name,
              });
            });
            slotsArray = Object.entries(groupedSlots_1).map((_a) => {
              var date = _a[0],
                slots = _a[1];
              return {
                date: date,
                slots: slots.sort(
                  (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
                ),
              };
            });
            setAvailableSlots(slotsArray.sort((a, b) => a.date.localeCompare(b.date)));
            return [3 /*break*/, 4];
          case 2:
            err_1 = _b.sent();
            console.error("Error fetching available slots:", err_1);
            setError("Erro ao carregar horários disponíveis. Tente novamente.");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var formatDateHeader = (dateString) => {
    var date = new Date(dateString);
    if ((0, date_fns_1.isToday)(date)) return "Hoje";
    if ((0, date_fns_1.isTomorrow)(date)) return "Amanhã";
    return (0, date_fns_1.format)(date, "EEEE, d 'de' MMMM", { locale: locale_1.ptBR });
  };
  var formatTimeSlot = (datetime) =>
    (0, date_fns_1.format)(new Date(datetime), "HH:mm", { locale: locale_1.ptBR });
  // Generate date navigation
  var generateDateOptions = () => {
    var options = [];
    for (var i = 0; i < 30; i++) {
      var date = (0, date_fns_1.addDays)(new Date(), i);
      options.push({
        value: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
        label: (0, date_fns_1.format)(date, "d 'de' MMM", { locale: locale_1.ptBR }),
        isToday: (0, date_fns_1.isToday)(date),
        isTomorrow: (0, date_fns_1.isTomorrow)(date),
      });
    }
    return options;
  };
  if (loading) {
    return (
      <div className={"flex justify-center p-8 ".concat(className)}>
        <loading_spinner_1.LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert className={"".concat(className, " border-red-200 bg-red-50")}>
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertDescription className="text-red-700">{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Escolha o Horário</h2>
        <p className="text-gray-600">Selecione a data e horário desejado para seu agendamento</p>
      </div>

      {/* Date Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {generateDateOptions()
          .slice(0, 7)
          .map((option) => (
            <button_1.Button
              key={option.value}
              variant={selectedDate === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(option.value)}
              className="whitespace-nowrap min-w-fit"
            >
              {option.isToday ? "Hoje" : option.isTomorrow ? "Amanhã" : option.label}
            </button_1.Button>
          ))}
      </div>

      {/* Available Slots */}
      <div className="space-y-6">
        {availableSlots.length === 0
          ? <card_1.Card className="p-6 text-center">
              <lucide_react_1.Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário disponível</h3>
              <p className="text-gray-600">
                Não há horários disponíveis para o período selecionado. Tente escolher outra data.
              </p>
              <button_1.Button variant="outline" onClick={fetchAvailableSlots} className="mt-4">
                Atualizar Horários
              </button_1.Button>
            </card_1.Card>
          : availableSlots.map((_a) => {
              var date = _a.date,
                slots = _a.slots;
              return (
                <card_1.Card key={date} className="overflow-hidden">
                  <card_1.CardHeader className="bg-gray-50 py-4">
                    <card_1.CardTitle className="text-lg capitalize">
                      {formatDateHeader(date)}
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {slots
                        .filter((slot) => slot.is_available)
                        .map((slot) => (
                          <button_1.Button
                            key={slot.datetime}
                            variant={
                              (selectedSlot === null || selectedSlot === void 0
                                ? void 0
                                : selectedSlot.datetime) === slot.datetime
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => onSlotSelect(slot)}
                            className={"flex flex-col items-center p-3 h-auto ".concat(
                              (selectedSlot === null || selectedSlot === void 0
                                ? void 0
                                : selectedSlot.datetime) === slot.datetime
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:border-blue-300 hover:bg-blue-50",
                            )}
                            aria-pressed={
                              (selectedSlot === null || selectedSlot === void 0
                                ? void 0
                                : selectedSlot.datetime) === slot.datetime
                            }
                          >
                            <lucide_react_1.Clock className="h-4 w-4 mb-1" />
                            <span className="font-medium">{formatTimeSlot(slot.datetime)}</span>
                            {slot.professional_name && (
                              <span className="text-xs opacity-80 truncate w-full">
                                {slot.professional_name}
                              </span>
                            )}
                          </button_1.Button>
                        ))}
                    </div>

                    {slots.filter((slot) => slot.is_available).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <lucide_react_1.Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>Nenhum horário disponível nesta data</p>
                      </div>
                    )}
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
      </div>

      {/* Real-time availability notice */}
      <alert_1.Alert className="border-blue-200 bg-blue-50">
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertDescription className="text-blue-700">
          Os horários são atualizados em tempo real. Se um horário não estiver mais disponível
          durante o agendamento, sugeriremos alternativas próximas.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    </div>
  );
}
