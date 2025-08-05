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
exports.useRealTimeAvailability = useRealTimeAvailability;
exports.useConflictDetection = useConflictDetection;
exports.useOptimisticBooking = useOptimisticBooking;
var client_1 = require("@/lib/supabase/client");
var react_1 = require("react");
function useRealTimeAvailability(_a) {
  var serviceId = _a.serviceId,
    professionalId = _a.professionalId,
    startDate = _a.startDate,
    endDate = _a.endDate,
    _b = _a.enabled,
    enabled = _b === void 0 ? true : _b;
  var _c = (0, react_1.useState)([]),
    slots = _c[0],
    setSlots = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)(false),
    isConnected = _f[0],
    setIsConnected = _f[1];
  var _g = (0, react_1.useState)(null),
    lastUpdated = _g[0],
    setLastUpdated = _g[1];
  var _h = (0, react_1.useState)(null),
    channel = _h[0],
    setChannel = _h[1];
  var supabase = yield (0, client_1.createClient)();
  var fetchAvailability = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, fetchError, enrichedSlots, err_1;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              if (!serviceId || !enabled) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, 4, 5]);
              setLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase.rpc("get_patient_available_slots_realtime", {
                  p_service_id: serviceId,
                  p_professional_id: professionalId || null,
                  p_start_date: startDate,
                  p_end_date: endDate,
                }),
              ];
            case 2:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
              if (fetchError) throw fetchError;
              enrichedSlots = data.map((slot) => ({
                datetime: slot.datetime,
                is_available: slot.is_available,
                professional_id: slot.professional_id,
                professional_name: slot.professional_name,
                booking_count: slot.booking_count || 0,
                conflict_reason: slot.conflict_reason,
              }));
              setSlots(enrichedSlots);
              setLastUpdated(new Date());
              return [3 /*break*/, 5];
            case 3:
              err_1 = _b.sent();
              console.error("Error fetching availability:", err_1);
              setError("Erro ao carregar disponibilidade em tempo real.");
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [serviceId, professionalId, startDate, endDate, enabled, supabase],
  );
  // Set up real-time subscription
  (0, react_1.useEffect)(() => {
    if (!serviceId || !enabled) return;
    var channelName = "availability:"
      .concat(serviceId)
      .concat(professionalId ? ":".concat(professionalId) : "");
    var newChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: professionalId ? "professional_id=eq.".concat(professionalId) : undefined,
        },
        (payload) => {
          console.log("Real-time appointment change:", payload);
          // Refresh availability when appointments change
          fetchAvailability();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_appointments",
        },
        (payload) => {
          console.log("Real-time patient appointment change:", payload);
          // Refresh availability when patient appointments change
          fetchAvailability();
        },
      )
      .on("presence", { event: "sync" }, () => {
        setIsConnected(true);
        console.log("Real-time availability connected");
      })
      .on("presence", { event: "leave" }, () => {
        setIsConnected(false);
        console.log("Real-time availability disconnected");
      });
    newChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        console.log("Real-time availability subscribed");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setIsConnected(false);
        console.error("Real-time availability connection error:", status);
      }
    });
    setChannel(newChannel);
    // Initial fetch
    fetchAvailability();
    // Cleanup on unmount
    return () => {
      newChannel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    };
  }, [serviceId, professionalId, enabled, fetchAvailability, supabase]);
  // Periodic refresh fallback (every 30 seconds)
  (0, react_1.useEffect)(() => {
    if (!enabled) return;
    var interval = setInterval(() => {
      if (!isConnected) {
        console.log("Real-time disconnected, fallback refresh");
        fetchAvailability();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [enabled, isConnected, fetchAvailability]);
  var refreshAvailability = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetchAvailability()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [fetchAvailability],
  );
  return {
    slots: slots,
    loading: loading,
    error: error,
    refreshAvailability: refreshAvailability,
    isConnected: isConnected,
    lastUpdated: lastUpdated,
  };
}
// Hook for conflict detection during booking
function useConflictDetection() {
  var supabase = yield (0, client_1.createClient)();
  var checkForConflicts = (0, react_1.useCallback)(
    (datetime, serviceId, professionalId, duration) =>
      __awaiter(this, void 0, void 0, function () {
        var _a, conflictCheck, conflictError, _b, alternatives, altError, error_1;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                supabase.rpc("detect_appointment_conflicts_advanced", {
                  p_datetime: datetime,
                  p_service_id: serviceId,
                  p_professional_id: professionalId || null,
                  p_duration_minutes: duration || 60,
                }),
              ];
            case 1:
              (_a = _c.sent()), (conflictCheck = _a.data), (conflictError = _a.error);
              if (conflictError) throw conflictError;
              if (
                !(conflictCheck === null || conflictCheck === void 0
                  ? void 0
                  : conflictCheck.has_conflict)
              )
                return [3 /*break*/, 3];
              return [
                4 /*yield*/,
                supabase.rpc("get_alternative_slots", {
                  p_original_datetime: datetime,
                  p_service_id: serviceId,
                  p_professional_id: professionalId || null,
                  p_duration_minutes: duration || 60,
                  p_search_range_hours: 48,
                }),
              ];
            case 2:
              (_b = _c.sent()), (alternatives = _b.data), (altError = _b.error);
              if (altError) {
                console.warn("Error fetching alternatives:", altError);
              }
              return [
                2 /*return*/,
                {
                  hasConflict: true,
                  conflictReason: conflictCheck.conflict_reason,
                  suggestedAlternatives: alternatives || [],
                },
              ];
            case 3:
              return [2 /*return*/, { hasConflict: false }];
            case 4:
              error_1 = _c.sent();
              console.error("Error checking conflicts:", error_1);
              return [
                2 /*return*/,
                {
                  hasConflict: true,
                  conflictReason: "Erro ao verificar conflitos. Tente novamente.",
                },
              ];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  return { checkForConflicts: checkForConflicts };
}
// Hook for optimistic booking (temporary reservation)
function useOptimisticBooking() {
  var supabase = yield (0, client_1.createClient)();
  var _a = (0, react_1.useState)(new Set()),
    reservedSlots = _a[0],
    setReservedSlots = _a[1];
  var reserveSlot = (0, react_1.useCallback)(
    (datetime, serviceId, professionalId) =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_2;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase.rpc("create_temporary_reservation", {
                  p_datetime: datetime,
                  p_service_id: serviceId,
                  p_professional_id: professionalId || null,
                  p_expires_in_minutes: 10,
                }),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error = _a.error);
              if (error) throw error;
              if (data === null || data === void 0 ? void 0 : data.reservation_id) {
                setReservedSlots(
                  (prev) =>
                    new Set(__spreadArray(__spreadArray([], prev, true), [datetime], false)),
                );
                // Auto-remove from reserved slots after 10 minutes
                setTimeout(
                  () => {
                    setReservedSlots((prev) => {
                      var newSet = new Set(prev);
                      newSet.delete(datetime);
                      return newSet;
                    });
                  },
                  10 * 60 * 1000,
                );
                return [2 /*return*/, { success: true, reservationId: data.reservation_id }];
              }
              return [2 /*return*/, { success: false }];
            case 2:
              error_2 = _b.sent();
              console.error("Error reserving slot:", error_2);
              return [2 /*return*/, { success: false }];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  var releaseSlot = (0, react_1.useCallback)(
    (reservationId) =>
      __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase.rpc("release_temporary_reservation", {
                  p_reservation_id: reservationId,
                }),
              ];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              error_3 = _a.sent();
              console.error("Error releasing slot:", error_3);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  return {
    reserveSlot: reserveSlot,
    releaseSlot: releaseSlot,
    reservedSlots: Array.from(reservedSlots),
  };
}
