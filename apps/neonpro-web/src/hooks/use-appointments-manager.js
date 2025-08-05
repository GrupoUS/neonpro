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
exports.useAppointmentsManager = useAppointmentsManager;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function useAppointmentsManager() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    appointments = _a[0],
    setAppointments = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)(false),
    isConnected = _d[0],
    setIsConnected = _d[1];
  var _e = (0, react_1.useState)({
      dateRange: "week",
    }),
    filters = _e[0],
    setFilters = _e[1];
  var supabase = yield (0, client_1.createClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  // Calculate date ranges based on filters
  var dateRange = (0, react_1.useMemo)(
    function () {
      var now = new Date();
      switch (filters.dateRange) {
        case "today":
          return { start: (0, date_fns_1.startOfDay)(now), end: (0, date_fns_1.endOfDay)(now) };
        case "week":
          return {
            start: (0, date_fns_1.startOfWeek)(now, { locale: locale_1.pt }),
            end: (0, date_fns_1.endOfWeek)(now, { locale: locale_1.pt }),
          };
        case "month":
          return { start: (0, date_fns_1.startOfMonth)(now), end: (0, date_fns_1.endOfMonth)(now) };
        case "custom":
          return {
            start: filters.startDate || (0, date_fns_1.startOfDay)(now),
            end: filters.endDate || (0, date_fns_1.endOfDay)(now),
          };
        default:
          return {
            start: (0, date_fns_1.startOfWeek)(now, { locale: locale_1.pt }),
            end: (0, date_fns_1.endOfWeek)(now, { locale: locale_1.pt }),
          };
      }
    },
    [filters.dateRange, filters.startDate, filters.endDate],
  );
  // Fetch appointments from database
  var fetchAppointments = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var query, _a, data, error_1, filteredData, searchTerm_1, err_1, errorMessage;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setIsLoading(true);
              setError(null);
              query = supabase
                .from("appointments")
                .select(
                  "\n          *,\n          patient:profiles!appointments_patient_id_fkey(\n            id,\n            name:full_name,\n            email,\n            phone\n          ),\n          professional:professionals(\n            id,\n            name,\n            specialty\n          ),\n          service:services(\n            id,\n            name,\n            duration,\n            price\n          ),\n          time_slot:time_slots(\n            id,\n            date,\n            start_time,\n            end_time\n          )\n        ",
                )
                .gte("time_slot.date", (0, date_fns_1.format)(dateRange.start, "yyyy-MM-dd"))
                .lte("time_slot.date", (0, date_fns_1.format)(dateRange.end, "yyyy-MM-dd"))
                .order("time_slot(date)", { ascending: true })
                .order("time_slot(start_time)", { ascending: true });
              // Apply filters
              if (filters.professionalId) {
                query = query.eq("professional_id", filters.professionalId);
              }
              if (filters.status) {
                query = query.eq("status", filters.status);
              }
              return [4 /*yield*/, query];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error_1 = _a.error);
              if (error_1) {
                throw new Error("Erro ao carregar agendamentos: ".concat(error_1.message));
              }
              filteredData = data || [];
              if (filters.patientName) {
                searchTerm_1 = filters.patientName.toLowerCase();
                filteredData = filteredData.filter(function (apt) {
                  var _a, _b;
                  return (_b = (_a = apt.patient) === null || _a === void 0 ? void 0 : _a.name) ===
                    null || _b === void 0
                    ? void 0
                    : _b.toLowerCase().includes(searchTerm_1);
                });
              }
              setAppointments(filteredData);
              return [3 /*break*/, 4];
            case 2:
              err_1 = _b.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Erro desconhecido";
              setError(errorMessage);
              console.error("Erro ao buscar agendamentos:", err_1);
              toast({
                title: "Erro ao carregar agendamentos",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 3:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [dateRange, filters, supabase, toast],
  );
  // Setup real-time subscriptions
  (0, react_1.useEffect)(
    function () {
      fetchAppointments();
      var channel = supabase
        .channel("appointments_management")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "appointments",
          },
          function (payload) {
            console.log("Appointment update:", payload);
            switch (payload.eventType) {
              case "INSERT":
                handleAppointmentInsert(payload.new);
                break;
              case "UPDATE":
                handleAppointmentUpdate(payload.new, payload.old);
                break;
              case "DELETE":
                handleAppointmentDelete(payload.old);
                break;
            }
          },
        )
        .subscribe(function (status) {
          console.log("Appointments subscription status:", status);
          setIsConnected(status === "SUBSCRIBED");
        });
      return function () {
        supabase.removeChannel(channel);
      };
    },
    [fetchAppointments, supabase],
  );
  // Real-time event handlers
  var handleAppointmentInsert = function (newAppointment) {
    // Fetch full appointment data with relations
    fetchAppointments();
    toast({
      title: "Novo agendamento",
      description: "Um novo agendamento foi criado",
      duration: 3000,
    });
  };
  var handleAppointmentUpdate = function (updatedAppointment, oldAppointment) {
    setAppointments(function (prev) {
      return prev.map(function (apt) {
        return apt.id === updatedAppointment.id
          ? __assign(__assign(__assign({}, apt), updatedAppointment), {
              updated_at: new Date().toISOString(),
            })
          : apt;
      });
    });
    // Notify about status changes
    if (oldAppointment.status !== updatedAppointment.status) {
      var statusMessages = {
        confirmed: "Agendamento confirmado",
        cancelled: "Agendamento cancelado",
        completed: "Agendamento concluído",
        no_show: "Paciente não compareceu",
        rescheduled: "Agendamento reagendado",
      };
      toast({
        title: statusMessages[updatedAppointment.status] || "Agendamento atualizado",
        description: "Status alterado para ".concat(updatedAppointment.status),
        duration: 3000,
      });
    }
  };
  var handleAppointmentDelete = function (deletedAppointment) {
    setAppointments(function (prev) {
      return prev.filter(function (apt) {
        return apt.id !== deletedAppointment.id;
      });
    });
    toast({
      title: "Agendamento removido",
      description: "Um agendamento foi removido do sistema",
      duration: 3000,
    });
  };
  // Action functions
  var updateAppointmentStatus = (0, react_1.useCallback)(
    function (appointmentId, newStatus, notes) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_2, err_2, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("appointments")
                  .update({
                    status: newStatus,
                    notes: notes || null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", appointmentId),
              ];
            case 1:
              error_2 = _a.sent().error;
              if (error_2) {
                throw new Error("Erro ao atualizar status: ".concat(error_2.message));
              }
              return [2 /*return*/, { success: true }];
            case 2:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Erro desconhecido";
              toast({
                title: "Erro ao atualizar agendamento",
                description: errorMessage,
                variant: "destructive",
              });
              return [2 /*return*/, { success: false, error: errorMessage }];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase, toast],
  );
  var confirmAppointment = (0, react_1.useCallback)(
    function (appointmentId) {
      return updateAppointmentStatus(appointmentId, "confirmed");
    },
    [updateAppointmentStatus],
  );
  var cancelAppointment = (0, react_1.useCallback)(
    function (appointmentId, reason) {
      return updateAppointmentStatus(appointmentId, "cancelled", reason);
    },
    [updateAppointmentStatus],
  );
  var completeAppointment = (0, react_1.useCallback)(
    function (appointmentId, notes) {
      return updateAppointmentStatus(appointmentId, "completed", notes);
    },
    [updateAppointmentStatus],
  );
  var markNoShow = (0, react_1.useCallback)(
    function (appointmentId) {
      return updateAppointmentStatus(appointmentId, "no_show");
    },
    [updateAppointmentStatus],
  );
  // Statistics
  var statistics = (0, react_1.useMemo)(
    function () {
      var total = appointments.length;
      var confirmed = appointments.filter(function (apt) {
        return apt.status === "confirmed";
      }).length;
      var pending = appointments.filter(function (apt) {
        return apt.status === "pending";
      }).length;
      var cancelled = appointments.filter(function (apt) {
        return apt.status === "cancelled";
      }).length;
      var completed = appointments.filter(function (apt) {
        return apt.status === "completed";
      }).length;
      var noShow = appointments.filter(function (apt) {
        return apt.status === "no_show";
      }).length;
      var today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
      var todayTotal = appointments.filter(function (apt) {
        var _a;
        return ((_a = apt.time_slot) === null || _a === void 0 ? void 0 : _a.date) === today;
      }).length;
      var weekStart = (0, date_fns_1.format)(
        (0, date_fns_1.startOfWeek)(new Date(), { locale: locale_1.pt }),
        "yyyy-MM-dd",
      );
      var weekEnd = (0, date_fns_1.format)(
        (0, date_fns_1.endOfWeek)(new Date(), { locale: locale_1.pt }),
        "yyyy-MM-dd",
      );
      var weekTotal = appointments.filter(function (apt) {
        var _a, _b;
        return (
          ((_a = apt.time_slot) === null || _a === void 0 ? void 0 : _a.date) >= weekStart &&
          ((_b = apt.time_slot) === null || _b === void 0 ? void 0 : _b.date) <= weekEnd
        );
      }).length;
      return {
        total: total,
        confirmed: confirmed,
        pending: pending,
        cancelled: cancelled,
        completed: completed,
        noShow: noShow,
        todayTotal: todayTotal,
        weekTotal: weekTotal,
      };
    },
    [appointments],
  );
  // Grouped appointments
  var appointmentsByDate = (0, react_1.useMemo)(
    function () {
      var grouped = {};
      appointments.forEach(function (appointment) {
        var _a;
        var date = (_a = appointment.time_slot) === null || _a === void 0 ? void 0 : _a.date;
        if (date) {
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(appointment);
        }
      });
      // Sort appointments within each date
      Object.keys(grouped).forEach(function (date) {
        grouped[date].sort(function (a, b) {
          var _a, _b;
          var timeA =
            ((_a = a.time_slot) === null || _a === void 0 ? void 0 : _a.start_time) || "00:00";
          var timeB =
            ((_b = b.time_slot) === null || _b === void 0 ? void 0 : _b.start_time) || "00:00";
          return timeA.localeCompare(timeB);
        });
      });
      return grouped;
    },
    [appointments],
  );
  // Update filters
  var updateFilters = (0, react_1.useCallback)(function (newFilters) {
    setFilters(function (prev) {
      return __assign(__assign({}, prev), newFilters);
    });
  }, []);
  var clearFilters = (0, react_1.useCallback)(function () {
    setFilters({ dateRange: "week" });
  }, []);
  return {
    // Data
    appointments: appointments,
    appointmentsByDate: appointmentsByDate,
    statistics: statistics,
    // State
    isLoading: isLoading,
    error: error,
    isConnected: isConnected,
    filters: filters,
    dateRange: dateRange,
    // Actions
    updateFilters: updateFilters,
    clearFilters: clearFilters,
    refetch: fetchAppointments,
    confirmAppointment: confirmAppointment,
    cancelAppointment: cancelAppointment,
    completeAppointment: completeAppointment,
    markNoShow: markNoShow,
    updateAppointmentStatus: updateAppointmentStatus,
  };
}
