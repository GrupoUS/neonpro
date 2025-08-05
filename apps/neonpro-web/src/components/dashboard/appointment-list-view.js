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
exports.AppointmentListView = AppointmentListView;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var table_1 = require("@/components/ui/table");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var statusConfig = {
  pending: {
    label: "Pendente",
    variant: "secondary",
    icon: lucide_react_1.Clock,
    className: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  confirmed: {
    label: "Confirmado",
    variant: "default",
    icon: lucide_react_1.CheckCircle,
    className: "text-blue-600 bg-blue-50 border-blue-200",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    icon: lucide_react_1.XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
  completed: {
    label: "Concluído",
    variant: "default",
    icon: lucide_react_1.CheckCircle,
    className: "text-green-600 bg-green-50 border-green-200",
  },
  no_show: {
    label: "Não Compareceu",
    variant: "destructive",
    icon: lucide_react_1.XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
  rescheduled: {
    label: "Reagendado",
    variant: "secondary",
    icon: lucide_react_1.Calendar,
    className: "text-purple-600 bg-purple-50 border-purple-200",
  },
};
function AppointmentListView(_a) {
  var appointments = _a.appointments,
    onEdit = _a.onEdit,
    onCancel = _a.onCancel,
    onConfirm = _a.onConfirm,
    onReschedule = _a.onReschedule,
    onMarkCompleted = _a.onMarkCompleted,
    onMarkNoShow = _a.onMarkNoShow,
    onContact = _a.onContact,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    className = _a.className;
  var _c = (0, react_1.useState)({}),
    loadingActions = _c[0],
    setLoadingActions = _c[1];
  var handleAction = (actionId, action) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setLoadingActions((prev) => {
              var _a;
              return __assign(__assign({}, prev), ((_a = {}), (_a[actionId] = true), _a));
            });
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, action()];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error executing action:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setLoadingActions((prev) => {
              var _a;
              return __assign(__assign({}, prev), ((_a = {}), (_a[actionId] = false), _a));
            });
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getInitials = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  var formatTime = (dateTime) =>
    (0, date_fns_1.format)(new Date(dateTime), "HH:mm", { locale: locale_1.pt });
  var formatDate = (dateTime) =>
    (0, date_fns_1.format)(new Date(dateTime), "dd/MM/yyyy", { locale: locale_1.pt });
  if (loading) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="space-y-4">
            {__spreadArray([], Array(5), true).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (appointments.length === 0) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <lucide_react_1.Calendar className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Nenhum agendamento encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não há agendamentos que correspondam aos filtros selecionados.
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardContent className="p-0">
        <table_1.Table>
          <table_1.TableHeader>
            <table_1.TableRow>
              <table_1.TableHead>Paciente</table_1.TableHead>
              <table_1.TableHead>Data</table_1.TableHead>
              <table_1.TableHead>Horário</table_1.TableHead>
              <table_1.TableHead>Serviço</table_1.TableHead>
              <table_1.TableHead>Profissional</table_1.TableHead>
              <table_1.TableHead>Status</table_1.TableHead>
              <table_1.TableHead className="text-right">Ações</table_1.TableHead>
            </table_1.TableRow>
          </table_1.TableHeader>
          <table_1.TableBody>
            {appointments.map((appointment) => {
              var _a, _b, _c, _d;
              var statusInfo = statusConfig[appointment.status];
              var StatusIcon = statusInfo.icon;
              return (
                <table_1.TableRow key={appointment.id} className="group hover:bg-muted/50">
                  {/* Patient */}
                  <table_1.TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <avatar_1.Avatar className="h-8 w-8">
                        <avatar_1.AvatarImage
                          src={appointment.patient.avatar_url}
                          alt={appointment.patient.full_name}
                        />
                        <avatar_1.AvatarFallback className="text-xs">
                          {getInitials(appointment.patient.full_name)}
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                      <div>
                        <p className="font-medium">{appointment.patient.full_name}</p>
                        {appointment.patient.phone && (
                          <p className="text-xs text-muted-foreground">
                            {appointment.patient.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </table_1.TableCell>

                  {/* Date */}
                  <table_1.TableCell>{formatDate(appointment.date_time)}</table_1.TableCell>

                  {/* Time */}
                  <table_1.TableCell>
                    <div className="flex items-center gap-1">
                      <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(appointment.date_time)}
                    </div>
                  </table_1.TableCell>

                  {/* Service */}
                  <table_1.TableCell>
                    <div>
                      <p className="font-medium">{appointment.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service.duration}min • R$ {appointment.service.price}
                      </p>
                    </div>
                  </table_1.TableCell>

                  {/* Professional */}
                  <table_1.TableCell>
                    <div className="flex items-center space-x-2">
                      <avatar_1.Avatar className="h-6 w-6">
                        <avatar_1.AvatarImage
                          src={
                            (_a = appointment.professional) === null || _a === void 0
                              ? void 0
                              : _a.avatar_url
                          }
                          alt={
                            (_b = appointment.professional) === null || _b === void 0
                              ? void 0
                              : _b.full_name
                          }
                        />
                        <avatar_1.AvatarFallback className="text-xs">
                          {(
                            (_c = appointment.professional) === null || _c === void 0
                              ? void 0
                              : _c.full_name
                          )
                            ? getInitials(appointment.professional.full_name)
                            : "N/A"}
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                      <span className="text-sm">
                        {((_d = appointment.professional) === null || _d === void 0
                          ? void 0
                          : _d.full_name) || "Não atribuído"}
                      </span>
                    </div>
                  </table_1.TableCell>

                  {/* Status */}
                  <table_1.TableCell>
                    <badge_1.Badge
                      variant={statusInfo.variant}
                      className={(0, utils_1.cn)("flex items-center gap-1", statusInfo.className)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </badge_1.Badge>
                  </table_1.TableCell>

                  {/* Actions */}
                  <table_1.TableCell className="text-right">
                    <dropdown_menu_1.DropdownMenu>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <lucide_react_1.MoreHorizontal className="h-4 w-4" />
                        </button_1.Button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                        {/* Edit */}
                        <dropdown_menu_1.DropdownMenuItem
                          onClick={() =>
                            onEdit === null || onEdit === void 0 ? void 0 : onEdit(appointment)
                          }
                          disabled={loadingActions["edit-".concat(appointment.id)]}
                        >
                          <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                          Editar
                        </dropdown_menu_1.DropdownMenuItem>

                        {/* Quick Actions based on status */}
                        {appointment.status === "pending" && (
                          <>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() =>
                                handleAction("confirm-".concat(appointment.id), () =>
                                  onConfirm === null || onConfirm === void 0
                                    ? void 0
                                    : onConfirm(appointment.id),
                                )
                              }
                              disabled={loadingActions["confirm-".concat(appointment.id)]}
                            >
                              <lucide_react_1.UserCheck className="h-4 w-4 mr-2" />
                              Confirmar
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() =>
                                onReschedule === null || onReschedule === void 0
                                  ? void 0
                                  : onReschedule(appointment)
                              }
                              disabled={loadingActions["reschedule-".concat(appointment.id)]}
                            >
                              <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                              Reagendar
                            </dropdown_menu_1.DropdownMenuItem>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() =>
                                handleAction("complete-".concat(appointment.id), () =>
                                  onMarkCompleted === null || onMarkCompleted === void 0
                                    ? void 0
                                    : onMarkCompleted(appointment.id),
                                )
                              }
                              disabled={loadingActions["complete-".concat(appointment.id)]}
                            >
                              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                              Marcar Concluído
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() =>
                                handleAction("no-show-".concat(appointment.id), () =>
                                  onMarkNoShow === null || onMarkNoShow === void 0
                                    ? void 0
                                    : onMarkNoShow(appointment.id),
                                )
                              }
                              disabled={loadingActions["no-show-".concat(appointment.id)]}
                            >
                              <lucide_react_1.XCircle className="h-4 w-4 mr-2" />
                              Marcar Falta
                            </dropdown_menu_1.DropdownMenuItem>
                          </>
                        )}

                        <dropdown_menu_1.DropdownMenuSeparator />

                        {/* Contact Actions */}
                        {appointment.patient.phone && (
                          <dropdown_menu_1.DropdownMenuItem
                            onClick={() =>
                              onContact === null || onContact === void 0
                                ? void 0
                                : onContact(appointment)
                            }
                          >
                            <lucide_react_1.Phone className="h-4 w-4 mr-2" />
                            Contatar
                          </dropdown_menu_1.DropdownMenuItem>
                        )}

                        <dropdown_menu_1.DropdownMenuItem
                          onClick={() =>
                            onContact === null || onContact === void 0
                              ? void 0
                              : onContact(appointment)
                          }
                        >
                          <lucide_react_1.MessageCircle className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </dropdown_menu_1.DropdownMenuItem>

                        <dropdown_menu_1.DropdownMenuSeparator />

                        {/* Cancel */}
                        {!["cancelled", "completed", "no_show"].includes(appointment.status) && (
                          <dropdown_menu_1.DropdownMenuItem
                            onClick={() =>
                              handleAction("cancel-".concat(appointment.id), () =>
                                onCancel === null || onCancel === void 0
                                  ? void 0
                                  : onCancel(appointment.id),
                              )
                            }
                            disabled={loadingActions["cancel-".concat(appointment.id)]}
                            className="text-red-600"
                          >
                            <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                            Cancelar
                          </dropdown_menu_1.DropdownMenuItem>
                        )}
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                  </table_1.TableCell>
                </table_1.TableRow>
              );
            })}
          </table_1.TableBody>
        </table_1.Table>
      </card_1.CardContent>
    </card_1.Card>
  );
}
