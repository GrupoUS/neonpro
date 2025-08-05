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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentManagement = AppointmentManagement;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var usePatientAppointments_1 = require("@/hooks/patient/usePatientAppointments");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var AppointmentCancellation_1 = require("./AppointmentCancellation");
var AppointmentHistory_1 = require("./AppointmentHistory");
var AppointmentStatusTracker_1 = require("./AppointmentStatusTracker");
var RescheduleRequest_1 = require("./RescheduleRequest");
var UpcomingAppointments_1 = require("./UpcomingAppointments");
function AppointmentManagement(_a) {
  var _this = this;
  var onAppointmentAction = _a.onAppointmentAction;
  var _b = (0, usePatientAppointments_1.usePatientAppointments)(),
    upcomingAppointments = _b.upcomingAppointments,
    pastAppointments = _b.pastAppointments,
    loading = _b.loading,
    error = _b.error,
    cancellationPolicies = _b.cancellationPolicies,
    cancelAppointment = _b.cancelAppointment,
    requestReschedule = _b.requestReschedule,
    refreshAppointments = _b.refreshAppointments,
    getNoShowPattern = _b.getNoShowPattern,
    getCancellationStats = _b.getCancellationStats;
  var _c = (0, react_1.useState)(null),
    selectedAppointmentId = _c[0],
    setSelectedAppointmentId = _c[1];
  var _d = (0, react_1.useState)(false),
    showCancellationDialog = _d[0],
    setShowCancellationDialog = _d[1];
  var _e = (0, react_1.useState)(false),
    showRescheduleDialog = _e[0],
    setShowRescheduleDialog = _e[1];
  var _f = (0, react_1.useState)("upcoming"),
    activeTab = _f[0],
    setActiveTab = _f[1];
  // Analytics data based on research insights
  var noShowPattern = getNoShowPattern();
  var cancellationStats = getCancellationStats();
  // Handle appointment actions with analytics tracking
  var handleAppointmentAction = function (action, appointmentId) {
    setSelectedAppointmentId(appointmentId);
    switch (action) {
      case "cancel":
        setShowCancellationDialog(true);
        break;
      case "reschedule":
        setShowRescheduleDialog(true);
        break;
      case "view":
        // Navigate to detailed view or expand
        break;
    }
    onAppointmentAction === null || onAppointmentAction === void 0
      ? void 0
      : onAppointmentAction(action, appointmentId);
  };
  // Handle cancellation completion
  var handleCancellationComplete = function (appointmentId, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var success;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, cancelAppointment(appointmentId, reason)];
          case 1:
            success = _a.sent();
            if (!success) return [3 /*break*/, 3];
            setShowCancellationDialog(false);
            setSelectedAppointmentId(null);
            return [4 /*yield*/, refreshAppointments()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Handle reschedule request completion
  var handleRescheduleComplete = function (appointmentId, newDate, newTime, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var success;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, requestReschedule(appointmentId, newDate, newTime, reason)];
          case 1:
            success = _a.sent();
            if (!success) return [3 /*break*/, 3];
            setShowRescheduleDialog(false);
            setSelectedAppointmentId(null);
            return [4 /*yield*/, refreshAppointments()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {__spreadArray([], Array(3), true).map(function (_, i) {
            return (
              <card_1.Card key={i} className="animate-pulse">
                <card_1.CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="h-8 bg-muted rounded w-1/2" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
        <card_1.Card className="animate-pulse">
          <card_1.CardContent className="pt-6">
            <div className="space-y-3">
              {__spreadArray([], Array(3), true).map(function (_, i) {
                return <div key={i} className="h-16 bg-muted rounded" />;
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertCircle className="h-4 w-4" />
        <alert_1.AlertTitle>Erro ao carregar agendamentos</alert_1.AlertTitle>
        <alert_1.AlertDescription>
          {error}
          <button_1.Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={refreshAppointments}
          >
            Tentar novamente
          </button_1.Button>
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Overview Cards - Based on Tavily healthcare dashboard patterns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Próximos Agendamentos
            </card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                upcomingAppointments.filter(function (apt) {
                  return apt.can_cancel;
                }).length
              }{" "}
              podem ser cancelados
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Presença
            </card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{Math.round(100 - noShowPattern.rate)}%</div>
            <p className="text-xs text-muted-foreground">
              {noShowPattern.rate}% de faltas (média: 27%)
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo para Cancelar
            </card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(cancellationPolicies === null || cancellationPolicies === void 0
                ? void 0
                : cancellationPolicies.minimum_hours) || 24}
              h
            </div>
            <p className="text-xs text-muted-foreground">Antecedência mínima obrigatória</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Histórico Total
            </card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{pastAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {cancellationStats.rate}% taxa de cancelamento
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Policy Information Alert - Based on Exa cancellation policy patterns */}
      {cancellationPolicies && (
        <alert_1.Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <lucide_react_1.AlertCircle className="h-4 w-4 text-blue-600" />
          <alert_1.AlertTitle>Política de Cancelamento</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                • Cancelamentos devem ser feitos com{" "}
                <strong>{cancellationPolicies.minimum_hours}h de antecedência</strong>
              </div>
              <div>
                • Reagendamentos precisam de <strong>48h de antecedência</strong> para solicitação
              </div>
              {cancellationPolicies.fee_applies && (
                <div>
                  • Taxa de cancelamento tardio:{" "}
                  <strong>R$ {cancellationPolicies.fee_amount.toFixed(2)}</strong>
                </div>
              )}
              <div>• Exceções para emergências médicas e familiares</div>
            </div>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Main Tabs Interface */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="upcoming" className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4" />
            Próximos ({upcomingAppointments.length})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history" className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-4 w-4" />
            Histórico ({pastAppointments.length})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="status" className="flex items-center gap-2">
            <lucide_react_1.User className="h-4 w-4" />
            Status & Analytics
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Upcoming Appointments Tab */}
        <tabs_1.TabsContent value="upcoming" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Próximos Agendamentos</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie seus agendamentos futuros. Cancele ou reagende seguindo as políticas da
                clínica.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <UpcomingAppointments_1.UpcomingAppointments
                appointments={upcomingAppointments}
                onCancel={function (id) {
                  return handleAppointmentAction("cancel", id);
                }}
                onReschedule={function (id) {
                  return handleAppointmentAction("reschedule", id);
                }}
                onView={function (id) {
                  return handleAppointmentAction("view", id);
                }}
                cancellationPolicies={cancellationPolicies}
              />
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Appointment History Tab */}
        <tabs_1.TabsContent value="history" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Histórico de Agendamentos</card_1.CardTitle>
              <card_1.CardDescription>
                Visualize seus agendamentos passados, cancelados e completados.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <AppointmentHistory_1.AppointmentHistory
                appointments={pastAppointments}
                onView={function (id) {
                  return handleAppointmentAction("view", id);
                }}
              />
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Status & Analytics Tab */}
        <tabs_1.TabsContent value="status" className="space-y-4">
          <AppointmentStatusTracker_1.AppointmentStatusTracker
            upcomingCount={upcomingAppointments.length}
            pastCount={pastAppointments.length}
            noShowPattern={noShowPattern}
            cancellationStats={cancellationStats}
            cancellationPolicies={cancellationPolicies}
          />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Modals for Actions */}
      {selectedAppointmentId && showCancellationDialog && (
        <AppointmentCancellation_1.AppointmentCancellation
          appointmentId={selectedAppointmentId}
          appointment={upcomingAppointments.find(function (apt) {
            return apt.id === selectedAppointmentId;
          })}
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          onConfirm={handleCancellationComplete}
          cancellationPolicies={cancellationPolicies}
        />
      )}

      {selectedAppointmentId && showRescheduleDialog && (
        <RescheduleRequest_1.RescheduleRequest
          appointmentId={selectedAppointmentId}
          appointment={upcomingAppointments.find(function (apt) {
            return apt.id === selectedAppointmentId;
          })}
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onConfirm={handleRescheduleComplete}
        />
      )}
    </div>
  );
}
exports.default = AppointmentManagement;
