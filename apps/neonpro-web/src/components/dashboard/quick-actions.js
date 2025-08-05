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
exports.QuickActions = QuickActions;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
function BulkActionModal(_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    appointments = _a.appointments,
    onConfirm = _a.onConfirm;
  var _b = (0, react_1.useState)(""),
    selectedAction = _b[0],
    setSelectedAction = _b[1];
  var _c = (0, react_1.useState)([]),
    selectedAppointments = _c[0],
    setSelectedAppointments = _c[1];
  var _d = (0, react_1.useState)(""),
    reason = _d[0],
    setReason = _d[1];
  var _e = (0, react_1.useState)(false),
    loading = _e[0],
    setLoading = _e[1];
  var pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  var confirmedAppointments = appointments.filter((apt) => apt.status === "confirmed");
  var handleConfirm = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (selectedAppointments.length === 0) {
              sonner_1.toast.error("Selecione pelo menos um agendamento");
              return [2 /*return*/];
            }
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onConfirm(selectedAction, selectedAppointments, reason)];
          case 2:
            _a.sent();
            sonner_1.toast.success("Ação executada com sucesso!");
            onClose();
            setSelectedAction("");
            setSelectedAppointments([]);
            setReason("");
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao executar ação");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Ações em Lote</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Execute ações em múltiplos agendamentos simultaneamente
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>Ação</label_1.Label>
            <select_1.Select value={selectedAction} onValueChange={setSelectedAction}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecione uma ação" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="confirm">Confirmar Agendamentos</select_1.SelectItem>
                <select_1.SelectItem value="cancel">Cancelar Agendamentos</select_1.SelectItem>
                <select_1.SelectItem value="complete">Marcar como Concluído</select_1.SelectItem>
                <select_1.SelectItem value="no_show">
                  Marcar como Não Compareceu
                </select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {selectedAction && (
            <div className="space-y-2">
              <label_1.Label>Agendamentos Disponíveis</label_1.Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
                {(selectedAction === "confirm"
                  ? pendingAppointments
                  : selectedAction === "cancel"
                    ? appointments.filter((apt) => !["cancelled", "completed"].includes(apt.status))
                    : selectedAction === "complete"
                      ? confirmedAppointments
                      : confirmedAppointments
                ).map((apt) => (
                  <label key={apt.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(apt.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAppointments((prev) =>
                            __spreadArray(__spreadArray([], prev, true), [apt.id], false),
                          );
                        } else {
                          setSelectedAppointments((prev) => prev.filter((id) => id !== apt.id));
                        }
                      }}
                    />
                    <span className="text-sm">
                      {apt.patient.full_name} - {new Date(apt.date_time).toLocaleDateString()}{" "}
                      {new Date(apt.date_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(selectedAction === "cancel" || selectedAction === "no_show") && (
            <div className="space-y-2">
              <label_1.Label>
                Motivo {selectedAction === "cancel" ? "(opcional)" : ""}
              </label_1.Label>
              <textarea_1.Textarea
                placeholder={
                  selectedAction === "cancel" ? "Motivo do cancelamento..." : "Observações..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button_1.Button variant="outline" onClick={onClose}>
            Cancelar
          </button_1.Button>
          <button_1.Button
            onClick={handleConfirm}
            disabled={!selectedAction || selectedAppointments.length === 0 || loading}
          >
            {loading ? "Processando..." : "Confirmar"}
          </button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
function CancelModal(_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    appointment = _a.appointment,
    onConfirm = _a.onConfirm;
  var _b = (0, react_1.useState)(""),
    reason = _b[0],
    setReason = _b[1];
  var _c = (0, react_1.useState)(false),
    loading = _c[0],
    setLoading = _c[1];
  var handleConfirm = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, onConfirm(reason)];
          case 2:
            _a.sent();
            onClose();
            setReason("");
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Cancelar Agendamento</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            {appointment && (
              <>Confirme o cancelamento do agendamento de {appointment.patient.full_name}</>
            )}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>Motivo (opcional)</label_1.Label>
            <textarea_1.Textarea
              placeholder="Motivo do cancelamento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button_1.Button variant="outline" onClick={onClose}>
            Voltar
          </button_1.Button>
          <button_1.Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Cancelando..." : "Cancelar Agendamento"}
          </button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
function QuickActions(_a) {
  var appointments = _a.appointments,
    onConfirmAppointment = _a.onConfirmAppointment,
    onCancelAppointment = _a.onCancelAppointment,
    onRescheduleAppointment = _a.onRescheduleAppointment,
    onMarkCompleted = _a.onMarkCompleted,
    onMarkNoShow = _a.onMarkNoShow,
    onCreateAppointment = _a.onCreateAppointment,
    onBulkAction = _a.onBulkAction,
    className = _a.className;
  var _b = (0, react_1.useState)(false),
    bulkModalOpen = _b[0],
    setBulkModalOpen = _b[1];
  var _c = (0, react_1.useState)(false),
    cancelModalOpen = _c[0],
    setCancelModalOpen = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedAppointment = _d[0],
    setSelectedAppointment = _d[1];
  // Statistics
  var stats = {
    total: appointments.length,
    pending: appointments.filter((apt) => apt.status === "pending").length,
    confirmed: appointments.filter((apt) => apt.status === "confirmed").length,
    cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
    completed: appointments.filter((apt) => apt.status === "completed").length,
    noShow: appointments.filter((apt) => apt.status === "no_show").length,
  };
  var pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  var upcomingAppointments = appointments.filter((apt) => {
    var appointmentDate = new Date(apt.date_time);
    var now = new Date();
    var todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return apt.status === "confirmed" && appointmentDate <= todayEnd && appointmentDate >= now;
  });
  var handleQuickAction = (action, appointment) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, error_3;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 12, , 13]);
            _a = action;
            switch (_a) {
              case "confirm":
                return [3 /*break*/, 1];
              case "complete":
                return [3 /*break*/, 4];
              case "no_show":
                return [3 /*break*/, 7];
              case "reschedule":
                return [3 /*break*/, 10];
            }
            return [3 /*break*/, 11];
          case 1:
            if (!appointment) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              onConfirmAppointment === null || onConfirmAppointment === void 0
                ? void 0
                : onConfirmAppointment(appointment.id),
            ];
          case 2:
            _b.sent();
            sonner_1.toast.success("Agendamento confirmado!");
            _b.label = 3;
          case 3:
            return [3 /*break*/, 11];
          case 4:
            if (!appointment) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              onMarkCompleted === null || onMarkCompleted === void 0
                ? void 0
                : onMarkCompleted(appointment.id),
            ];
          case 5:
            _b.sent();
            sonner_1.toast.success("Agendamento marcado como concluído!");
            _b.label = 6;
          case 6:
            return [3 /*break*/, 11];
          case 7:
            if (!appointment) return [3 /*break*/, 9];
            return [
              4 /*yield*/,
              onMarkNoShow === null || onMarkNoShow === void 0
                ? void 0
                : onMarkNoShow(appointment.id),
            ];
          case 8:
            _b.sent();
            sonner_1.toast.success("Agendamento marcado como não compareceu!");
            _b.label = 9;
          case 9:
            return [3 /*break*/, 11];
          case 10:
            if (appointment) {
              onRescheduleAppointment === null || onRescheduleAppointment === void 0
                ? void 0
                : onRescheduleAppointment(appointment);
            }
            return [3 /*break*/, 11];
          case 11:
            return [3 /*break*/, 13];
          case 12:
            error_3 = _b.sent();
            sonner_1.toast.error("Erro ao executar ação");
            return [3 /*break*/, 13];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  var handleCancelAppointment = (reason) =>
    __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedAppointment) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              onCancelAppointment === null || onCancelAppointment === void 0
                ? void 0
                : onCancelAppointment(selectedAppointment.id, reason),
            ];
          case 2:
            _a.sent();
            sonner_1.toast.success("Agendamento cancelado!");
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            sonner_1.toast.error("Erro ao cancelar agendamento");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  return (
    <>
      <div className={(0, utils_1.cn)("grid gap-4", className)}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.UserCheck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmados</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <lucide_react_1.UserX className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.noShow}</p>
                  <p className="text-xs text-muted-foreground">Não Compareceram</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Appointment */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <card_1.CardTitle className="text-base flex items-center gap-2">
                <lucide_react_1.Plus className="h-4 w-4 text-primary" />
                Novo Agendamento
              </card_1.CardTitle>
              <card_1.CardDescription>Criar um novo agendamento rapidamente</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <button_1.Button onClick={onCreateAppointment} className="w-full">
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Criar Agendamento
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Pending Confirmations */}
          {pendingAppointments.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-base flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4 text-yellow-600" />
                  Confirmações Pendentes
                  <badge_1.Badge variant="secondary">{pendingAppointments.length}</badge_1.Badge>
                </card_1.CardTitle>
                <card_1.CardDescription>Agendamentos aguardando confirmação</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {pendingAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                    >
                      <span>{apt.patient.full_name}</span>
                      <div className="flex gap-1">
                        <button_1.Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("confirm", apt)}
                        >
                          <lucide_react_1.UserCheck className="h-3 w-3" />
                        </button_1.Button>
                        <button_1.Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setCancelModalOpen(true);
                          }}
                        >
                          <lucide_react_1.XCircle className="h-3 w-3" />
                        </button_1.Button>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingAppointments.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingAppointments.length - 3} mais pendentes
                  </p>
                )}
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Today's Appointments */}
          {upcomingAppointments.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-base flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />
                  Próximos Agendamentos
                  <badge_1.Badge variant="secondary">{upcomingAppointments.length}</badge_1.Badge>
                </card_1.CardTitle>
                <card_1.CardDescription>Agendamentos confirmados para hoje</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {upcomingAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                    >
                      <div>
                        <span className="font-medium">{apt.patient.full_name}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(apt.date_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button_1.Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("complete", apt)}
                        >
                          <lucide_react_1.CheckCircle className="h-3 w-3" />
                        </button_1.Button>
                        <button_1.Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("no_show", apt)}
                        >
                          <lucide_react_1.AlertTriangle className="h-3 w-3" />
                        </button_1.Button>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Bulk Actions */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <card_1.CardTitle className="text-base flex items-center gap-2">
                <lucide_react_1.Users className="h-4 w-4 text-purple-600" />
                Ações em Lote
              </card_1.CardTitle>
              <card_1.CardDescription>
                Execute ações em múltiplos agendamentos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <button_1.Button
                variant="outline"
                className="w-full"
                onClick={() => setBulkModalOpen(true)}
                disabled={appointments.length === 0}
              >
                Gerenciar em Lote
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      <BulkActionModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        appointments={appointments}
        onConfirm={
          onBulkAction ||
          (() =>
            __awaiter(this, void 0, void 0, function () {
              return __generator(this, (_a) => [2 /*return*/]);
            }))
        }
      />

      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onConfirm={handleCancelAppointment}
      />
    </>
  );
}
