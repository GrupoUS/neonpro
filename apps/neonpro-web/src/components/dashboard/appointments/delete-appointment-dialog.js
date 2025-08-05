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
exports.default = DeleteAppointmentDialog;
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function DeleteAppointmentDialog(_a) {
  var _b, _c, _d;
  var appointment = _a.appointment,
    isOpen = _a.isOpen,
    onClose = _a.onClose,
    onDelete = _a.onDelete;
  var _e = (0, react_1.useState)(""),
    reason = _e[0],
    setReason = _e[1];
  var _f = (0, react_1.useState)(false),
    isDeleting = _f[0],
    setIsDeleting = _f[1];
  if (!appointment) return null;
  // Calculate warnings based on appointment details
  var appointmentDate = new Date(appointment.start_time);
  var now = new Date();
  var isFutureAppointment = (0, date_fns_1.isAfter)(appointmentDate, now);
  var hoursUntilAppointment = (0, date_fns_1.differenceInHours)(appointmentDate, now);
  var isConfirmed = appointment.status === "confirmed";
  var isToday = appointmentDate.toDateString() === now.toDateString();
  var isUrgent = isFutureAppointment && hoursUntilAppointment <= 24;
  // Generate warning messages
  var warnings = [];
  if (isFutureAppointment) {
    warnings.push({
      icon: lucide_react_1.Calendar,
      message: "Este \u00E9 um agendamento futuro (".concat(
        (0, date_fns_1.format)(appointmentDate, "dd/MM/yyyy 'às' HH:mm", { locale: locale_1.ptBR }),
        ")",
      ),
      severity: "warning",
    });
  }
  if (isConfirmed) {
    warnings.push({
      icon: lucide_react_1.AlertTriangle,
      message: "Agendamento confirmado - paciente pode estar a caminho",
      severity: "error",
    });
  }
  if (isUrgent) {
    warnings.push({
      icon: lucide_react_1.Clock,
      message: "Agendamento em menos de 24h (".concat(hoursUntilAppointment, "h restantes)"),
      severity: "error",
    });
  }
  if (isToday) {
    warnings.push({
      icon: lucide_react_1.AlertTriangle,
      message: "Agendamento para hoje - considere reagendar ao invés de cancelar",
      severity: "warning",
    });
  }
  var handleDelete = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, errorData, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!reason.trim()) {
              sonner_1.toast.error("Por favor, informe o motivo do cancelamento");
              return [2 /*return*/];
            }
            setIsDeleting(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [
              4 /*yield*/,
              fetch("/api/appointments/".concat(appointment.id), {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ reason: reason.trim() }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            sonner_1.toast.success("Agendamento cancelado com sucesso");
            onDelete();
            handleClose();
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, response.json()];
          case 4:
            errorData = _a.sent();
            sonner_1.toast.error(errorData.error_message || "Erro ao cancelar agendamento");
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            console.error("Error deleting appointment:", error_1);
            sonner_1.toast.error("Erro interno do servidor");
            return [3 /*break*/, 8];
          case 7:
            setIsDeleting(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var handleClose = () => {
    if (!isDeleting) {
      setReason("");
      onClose();
    }
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={handleClose}>
      <dialog_1.DialogContent className="max-w-lg">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Agendamento
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Esta ação não pode ser desfeita. O agendamento será marcado como cancelado e permanecerá
            no histórico para auditoria.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {/* Appointment Details */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <lucide_react_1.User className="h-4 w-4" />
                <span className="font-medium">
                  {((_b = appointment.patient) === null || _b === void 0 ? void 0 : _b.full_name) ||
                    "Paciente não informado"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <lucide_react_1.Stethoscope className="h-4 w-4" />
                <span>
                  {((_c = appointment.professional) === null || _c === void 0
                    ? void 0
                    : _c.full_name) || "Profissional não informado"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <lucide_react_1.Calendar className="h-4 w-4" />
                <span>
                  {(0, date_fns_1.format)(appointmentDate, "dd/MM/yyyy 'às' HH:mm", {
                    locale: locale_1.ptBR,
                  })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {((_d = appointment.service_type) === null || _d === void 0 ? void 0 : _d.name) ||
                  "Serviço não especificado"}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warning, index) => {
                var IconComponent = warning.icon;
                return (
                  <alert_1.Alert
                    key={index}
                    variant={warning.severity === "error" ? "destructive" : "default"}
                  >
                    <IconComponent className="h-4 w-4" />
                    <alert_1.AlertDescription>{warning.message}</alert_1.AlertDescription>
                  </alert_1.Alert>
                );
              })}
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <label_1.Label htmlFor="reason">
              Motivo do cancelamento <span className="text-destructive">*</span>
            </label_1.Label>
            <textarea_1.Textarea
              id="reason"
              placeholder="Ex: Paciente solicitou reagendamento, conflito de horário, etc..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isDeleting}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Este motivo será registrado no histórico para auditoria.
            </p>
          </div>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Manter Agendamento
          </button_1.Button>
          <button_1.Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !reason.trim()}
          >
            {isDeleting && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
