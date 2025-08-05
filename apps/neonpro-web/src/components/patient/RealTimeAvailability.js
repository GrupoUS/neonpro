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
exports.RealTimeAvailability = RealTimeAvailability;
var react_1 = require("react");
var useRealTimeAvailability_1 = require("@/hooks/useRealTimeAvailability");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
function RealTimeAvailability(_a) {
  var _this = this;
  var professionalId = _a.professionalId,
    serviceId = _a.serviceId,
    dateRange = _a.dateRange,
    onSlotSelect = _a.onSlotSelect,
    onSlotReserve = _a.onSlotReserve,
    patientId = _a.patientId,
    className = _a.className,
    _b = _a.showAlternatives,
    showAlternatives = _b === void 0 ? true : _b,
    _c = _a.maxAlternatives,
    maxAlternatives = _c === void 0 ? 3 : _c;
  var _d = (0, react_1.useState)(null),
    selectedSlot = _d[0],
    setSelectedSlot = _d[1];
  var _e = (0, react_1.useState)(null),
    reservingSlot = _e[0],
    setReservingSlot = _e[1];
  var _f = (0, useRealTimeAvailability_1.useRealTimeAvailability)({
      professionalId: professionalId,
      serviceId: serviceId,
      dateRange: dateRange,
      autoRefetch: true,
      enableOptimistic: true,
    }),
    slots = _f.slots,
    loading = _f.loading,
    error = _f.error,
    connectionStatus = _f.connectionStatus,
    optimisticUpdates = _f.optimisticUpdates,
    refetch = _f.refetch,
    reserveSlot = _f.reserveSlot,
    getAlternatives = _f.getAlternatives;
  /**
   * Handle slot selection with optimistic reservation
   */
  var handleSlotSelect = (0, react_1.useCallback)(
    function (slot) {
      return __awaiter(_this, void 0, void 0, function () {
        var reserved, confirmed, alternatives_1, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (reservingSlot) return [2 /*return*/];
              setSelectedSlot(slot.id);
              setReservingSlot(slot.id);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 7, 8, 9]);
              return [4 /*yield*/, reserveSlot(slot.id, patientId)];
            case 2:
              reserved = _a.sent();
              if (!reserved) return [3 /*break*/, 5];
              // Show success message
              sonner_1.toast.success("Horário reservado temporariamente", {
                description: "Você tem 5 minutos para confirmar o agendamento",
                duration: 5000,
              });
              // Call parent handler if provided
              if (onSlotSelect) {
                onSlotSelect(slot);
              }
              if (!onSlotReserve) return [3 /*break*/, 4];
              return [4 /*yield*/, onSlotReserve(slot.id)];
            case 3:
              confirmed = _a.sent();
              if (!confirmed) {
                sonner_1.toast.error("Não foi possível confirmar o agendamento");
              }
              _a.label = 4;
            case 4:
              return [3 /*break*/, 6];
            case 5:
              // Reservation failed, show alternatives
              if (showAlternatives) {
                alternatives_1 = getAlternatives(slot, maxAlternatives);
                if (alternatives_1.length > 0) {
                  sonner_1.toast.error("Horário não disponível", {
                    description: "Encontramos ".concat(
                      alternatives_1.length,
                      " alternativa(s) similar(es)",
                    ),
                    action: {
                      label: "Ver alternativas",
                      onClick: function () {
                        return scrollToAlternatives();
                      },
                    },
                  });
                } else {
                  sonner_1.toast.error("Horário não disponível", {
                    description: "Não encontramos alternativas próximas",
                  });
                }
              }
              setSelectedSlot(null);
              _a.label = 6;
            case 6:
              return [3 /*break*/, 9];
            case 7:
              error_1 = _a.sent();
              console.error("Error reserving slot:", error_1);
              sonner_1.toast.error("Erro ao reservar horário", {
                description: "Tente novamente em alguns instantes",
              });
              setSelectedSlot(null);
              return [3 /*break*/, 9];
            case 8:
              setReservingSlot(null);
              return [7 /*endfinally*/];
            case 9:
              return [2 /*return*/];
          }
        });
      });
    },
    [
      reservingSlot,
      reserveSlot,
      patientId,
      onSlotSelect,
      onSlotReserve,
      showAlternatives,
      getAlternatives,
      maxAlternatives,
    ],
  );
  /**
   * Scroll to alternatives section
   */
  var scrollToAlternatives = function () {
    var alternativesElement = document.getElementById("alternatives-section");
    if (alternativesElement) {
      alternativesElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  /**
   * Format time slot for display
   */
  var formatTimeSlot = function (date, time, duration) {
    var startTime = new Date("".concat(date, "T").concat(time));
    var endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    return {
      date: new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(startTime),
      time: ""
        .concat(
          startTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          " - ",
        )
        .concat(
          endTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        ),
    };
  };
  /**
   * Get connection status indicator
   */
  var getConnectionStatusIndicator = function () {
    switch (connectionStatus) {
      case "connected":
        return <lucide_react_1.Wifi className="h-4 w-4 text-green-500" aria-label="Conectado" />;
      case "connecting":
      case "reconnecting":
        return (
          <lucide_react_1.RefreshCw
            className="h-4 w-4 text-yellow-500 animate-spin"
            aria-label="Conectando"
          />
        );
      case "disconnected":
        return (
          <lucide_react_1.WifiOff className="h-4 w-4 text-red-500" aria-label="Desconectado" />
        );
      default:
        return null;
    }
  };
  /**
   * Render slot card
   */
  var renderSlotCard = function (slot, isAlternative) {
    if (isAlternative === void 0) {
      isAlternative = false;
    }
    var formatted = formatTimeSlot(slot.date, slot.time, slot.duration);
    var isSelected = selectedSlot === slot.id;
    var isReserving = reservingSlot === slot.id;
    var isOptimistic = optimisticUpdates.has(slot.id);
    return (
      <card_1.Card
        key={slot.id}
        className={(0, utils_1.cn)(
          "transition-all duration-200 cursor-pointer hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          isAlternative && "border-amber-200 bg-amber-50",
          !slot.available && "opacity-50 cursor-not-allowed",
        )}
        onClick={function () {
          return slot.available && handleSlotSelect(slot);
        }}
      >
        <card_1.CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">{formatted.date}</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4" />
                {formatted.time}
              </p>
              {slot.duration && (
                <p className="text-xs text-muted-foreground">Duração: {slot.duration} minutos</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {isReserving
                ? <button_1.Button size="sm" disabled>
                    <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Reservando...
                  </button_1.Button>
                : <button_1.Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    disabled={!slot.available}
                  >
                    {isSelected ? "Selecionado" : "Selecionar"}
                  </button_1.Button>}

              {isOptimistic && (
                <badge_1.Badge variant="secondary" className="text-xs">
                  Aguardando confirmação
                </badge_1.Badge>
              )}

              {isAlternative && (
                <badge_1.Badge variant="outline" className="text-xs">
                  Alternativa
                </badge_1.Badge>
              )}

              {slot.reserved_until && (
                <badge_1.Badge variant="destructive" className="text-xs">
                  Temporariamente reservado
                </badge_1.Badge>
              )}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  // Get alternatives for selected slot if needed
  var alternatives =
    selectedSlot && showAlternatives
      ? getAlternatives(
          slots.find(function (s) {
            return s.id === selectedSlot;
          }),
          maxAlternatives,
        )
      : [];
  if (loading) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Carregando horários disponíveis...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className={(0, utils_1.cn)("space-y-4", className)}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getConnectionStatusIndicator()}
          <span className="text-sm text-muted-foreground">
            {connectionStatus === "connected" && "Atualizações em tempo real ativas"}
            {connectionStatus === "connecting" && "Conectando às atualizações..."}
            {connectionStatus === "reconnecting" && "Reconectando..."}
            {connectionStatus === "disconnected" && "Atualizações desconectadas"}
          </span>
        </div>

        <button_1.Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          <lucide_react_1.RefreshCw
            className={(0, utils_1.cn)("h-4 w-4 mr-2", loading && "animate-spin")}
          />
          Atualizar
        </button_1.Button>
      </div>

      {/* Error Alert */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Available Slots */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Horários Disponíveis</span>
            <badge_1.Badge variant="secondary">
              {slots.length} disponível{slots.length !== 1 ? "eis" : ""}
            </badge_1.Badge>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3">
          {slots.length === 0
            ? <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum horário disponível no período selecionado</p>
                <p className="text-sm">Tente selecionar outras datas ou profissionais</p>
              </div>
            : slots.map(function (slot) {
                return renderSlotCard(slot);
              })}
        </card_1.CardContent>
      </card_1.Card>

      {/* Alternative Suggestions */}
      {alternatives.length > 0 && (
        <card_1.Card id="alternatives-section">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-amber-500" />
              Sugestões Alternativas
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            <alert_1.Alert>
              <alert_1.AlertDescription>
                Encontramos {alternatives.length} horário{alternatives.length !== 1 ? "s" : ""}
                similar{alternatives.length !== 1 ? "es" : ""} que podem interessar
              </alert_1.AlertDescription>
            </alert_1.Alert>

            {alternatives.map(function (slot) {
              return renderSlotCard(slot, true);
            })}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
exports.default = RealTimeAvailability;
