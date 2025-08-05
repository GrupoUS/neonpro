"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.useAvailabilityManager = useAvailabilityManager;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var use_realtime_availability_1 = require("@/hooks/use-realtime-availability");
function useAvailabilityManager() {
  var _this = this;
  var _a = (0, react_1.useState)({
      onlyAvailable: true,
    }),
    filters = _a[0],
    setFilters = _a[1];
  var _b = (0, react_1.useState)(null),
    selectedSlot = _b[0],
    setSelectedSlot = _b[1];
  var _c = (0, react_1.useState)(false),
    isBooking = _c[0],
    setIsBooking = _c[1];
  // Hook realtime com filtros aplicados
  var _d = (0, use_realtime_availability_1.useRealtimeAvailability)({
      professionalId: filters.professionalId,
      serviceId: filters.serviceId,
      date: filters.date ? (0, date_fns_1.format)(filters.date, "yyyy-MM-dd") : undefined,
    }),
    timeSlots = _d.timeSlots,
    isConnected = _d.isConnected,
    isLoading = _d.isLoading,
    error = _d.error,
    bookSlot = _d.bookSlot,
    refetch = _d.refetch;
  // Slots filtrados e processados
  var filteredSlots = (0, react_1.useMemo)(
    function () {
      var filtered = timeSlots;
      // Filtrar por disponibilidade
      if (filters.onlyAvailable) {
        filtered = filtered.filter(function (slot) {
          return slot.is_available;
        });
      }
      // Filtrar por data de início
      if (filters.startDate) {
        var startDateStr_1 = (0, date_fns_1.format)(filters.startDate, "yyyy-MM-dd");
        filtered = filtered.filter(function (slot) {
          return slot.date >= startDateStr_1;
        });
      }
      // Filtrar por data de fim
      if (filters.endDate) {
        var endDateStr_1 = (0, date_fns_1.format)(filters.endDate, "yyyy-MM-dd");
        filtered = filtered.filter(function (slot) {
          return slot.date <= endDateStr_1;
        });
      }
      return filtered;
    },
    [timeSlots, filters],
  );
  // Slots agrupados por data
  var groupedSlots = (0, react_1.useMemo)(
    function () {
      var grouped = {};
      filteredSlots.forEach(function (slot) {
        var dateKey = slot.date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(slot);
      });
      // Ordenar slots dentro de cada data
      Object.keys(grouped).forEach(function (date) {
        grouped[date].sort(function (a, b) {
          return a.start_time.localeCompare(b.start_time);
        });
      });
      return grouped;
    },
    [filteredSlots],
  );
  // Estatísticas de disponibilidade
  var availability = (0, react_1.useMemo)(
    function () {
      var total = timeSlots.length;
      var available = timeSlots.filter(function (slot) {
        return slot.is_available;
      }).length;
      var booked = total - available;
      var availabilityRate = total > 0 ? (available / total) * 100 : 0;
      return {
        total: total,
        available: available,
        booked: booked,
        availabilityRate: Math.round(availabilityRate * 100) / 100,
      };
    },
    [timeSlots],
  );
  // Função para atualizar filtros
  var updateFilters = (0, react_1.useCallback)(function (newFilters) {
    setFilters(function (prev) {
      return __assign(__assign({}, prev), newFilters);
    });
  }, []);
  // Função para limpar filtros
  var clearFilters = (0, react_1.useCallback)(function () {
    setFilters({ onlyAvailable: true });
  }, []);
  // Função para selecionar slot
  var selectSlot = (0, react_1.useCallback)(function (slot) {
    setSelectedSlot(slot);
  }, []);
  // Função para reservar slot selecionado
  var bookSelectedSlot = (0, react_1.useCallback)(
    function (patientId) {
      return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!selectedSlot)
                return [2 /*return*/, { success: false, error: "Nenhum slot selecionado" }];
              setIsBooking(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, , 3, 4]);
              return [4 /*yield*/, bookSlot(selectedSlot.id, patientId)];
            case 2:
              result = _a.sent();
              if (result.success) {
                setSelectedSlot(null); // Limpar seleção após sucesso
              }
              return [2 /*return*/, result];
            case 3:
              setIsBooking(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [selectedSlot, bookSlot],
  );
  // Função para verificar se um slot está disponível para reserva
  var isSlotBookable = (0, react_1.useCallback)(function (slot) {
    if (!slot.is_available) return false;
    var slotDateTime = new Date("".concat(slot.date, "T").concat(slot.start_time));
    var now = new Date();
    // Não permitir reserva de slots no passado
    return (0, date_fns_1.isAfter)(slotDateTime, now);
  }, []);
  // Função para encontrar próximos slots disponíveis
  var getNextAvailableSlots = (0, react_1.useCallback)(
    function (limit) {
      if (limit === void 0) {
        limit = 5;
      }
      var now = new Date();
      return filteredSlots
        .filter(function (slot) {
          var slotDateTime = new Date("".concat(slot.date, "T").concat(slot.start_time));
          return slot.is_available && (0, date_fns_1.isAfter)(slotDateTime, now);
        })
        .slice(0, limit);
    },
    [filteredSlots],
  );
  // Função para verificar conflitos de horário
  var hasTimeConflict = (0, react_1.useCallback)(
    function (newSlot, excludeSlotId) {
      return timeSlots.some(function (existingSlot) {
        if (excludeSlotId && existingSlot.id === excludeSlotId) return false;
        if (existingSlot.date !== newSlot.date) return false;
        var newStart = new Date("".concat(newSlot.date, "T").concat(newSlot.start_time));
        var newEnd = new Date("".concat(newSlot.date, "T").concat(newSlot.end_time));
        var existingStart = new Date(
          "".concat(existingSlot.date, "T").concat(existingSlot.start_time),
        );
        var existingEnd = new Date("".concat(existingSlot.date, "T").concat(existingSlot.end_time));
        // Verificar sobreposição
        return (
          ((0, date_fns_1.isBefore)(newStart, existingEnd) &&
            (0, date_fns_1.isAfter)(newEnd, existingStart)) ||
          ((0, date_fns_1.isBefore)(existingStart, newEnd) &&
            (0, date_fns_1.isAfter)(existingEnd, newStart))
        );
      });
    },
    [timeSlots],
  );
  return {
    // Estado
    timeSlots: filteredSlots,
    groupedSlots: groupedSlots,
    selectedSlot: selectedSlot,
    isBooking: isBooking,
    filters: filters,
    // Conexão e dados
    isConnected: isConnected,
    isLoading: isLoading,
    error: error,
    availability: availability,
    // Ações
    updateFilters: updateFilters,
    clearFilters: clearFilters,
    selectSlot: selectSlot,
    bookSelectedSlot: bookSelectedSlot,
    refetch: refetch,
    // Utilitários
    isSlotBookable: isSlotBookable,
    getNextAvailableSlots: getNextAvailableSlots,
    hasTimeConflict: hasTimeConflict,
  };
}
