"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentCard = AppointmentCard;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var getStatusInfo = function (status) {
    var statusMap = {
        scheduled: { label: "Agendado", color: "bg-blue-500 text-white" },
        confirmed: { label: "Confirmado", color: "bg-green-500 text-white" },
        in_progress: { label: "Em Andamento", color: "bg-yellow-500 text-white" },
        completed: { label: "Concluído", color: "bg-emerald-500 text-white" },
        cancelled: { label: "Cancelado", color: "bg-red-500 text-white" },
        no_show: { label: "Não Compareceu", color: "bg-gray-500 text-white" },
    };
    return (statusMap[status] || {
        label: status,
        color: "bg-gray-500 text-white",
    });
};
function AppointmentCard(_a) {
    var _b, _c, _d, _e, _f, _g;
    var appointment = _a.appointment, onClick = _a.onClick, _h = _a.variant, variant = _h === void 0 ? "default" : _h, _j = _a.showActions, showActions = _j === void 0 ? true : _j, _k = _a.showPatient, showPatient = _k === void 0 ? true : _k, _l = _a.showProfessional, showProfessional = _l === void 0 ? true : _l, onEdit = _a.onEdit, onDelete = _a.onDelete, onCancel = _a.onCancel, onConfirm = _a.onConfirm, onComplete = _a.onComplete;
    var status = getStatusInfo(appointment.status);
    var startTime = new Date(appointment.start_time);
    var endTime = new Date(appointment.end_time);
    // Create comprehensive ARIA label
    var ariaLabel = [
        "Agendamento ".concat(status.label),
        ((_b = appointment.patient) === null || _b === void 0 ? void 0 : _b.full_name)
            ? "para ".concat(appointment.patient.full_name)
            : "",
        ((_c = appointment.service_type) === null || _c === void 0 ? void 0 : _c.name)
            ? "servi\u00E7o: ".concat(appointment.service_type.name)
            : "",
        ((_d = appointment.professional) === null || _d === void 0 ? void 0 : _d.full_name)
            ? "com ".concat(appointment.professional.full_name)
            : "",
        "\u00E0s ".concat((0, date_fns_1.format)(startTime, "HH:mm", { locale: locale_1.ptBR })),
        "at\u00E9 ".concat((0, date_fns_1.format)(endTime, "HH:mm", { locale: locale_1.ptBR })),
    ]
        .filter(Boolean)
        .join(", ");
    var duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    var handleCardClick = function (e) {
        if (onClick && !e.defaultPrevented) {
            onClick();
        }
    };
    var handleActionClick = function (e, action) {
        e.preventDefault();
        e.stopPropagation();
        action();
    };
    if (variant === "compact") {
        return (<div role="button" tabIndex={0} aria-label={ariaLabel} className={(0, utils_1.cn)("p-2 rounded-md border-l-4 cursor-pointer hover:shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20", status.color.replace("bg-", "border-l-").replace("text-white", ""))} onClick={handleCardClick} onKeyDown={function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(e);
                }
            }}>
        <div className="flex flex-col gap-1">
          {/* Time */}
          <div className="flex items-center gap-1">
            <lucide_react_1.Clock className="h-3 w-3 text-muted-foreground"/>
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              {(0, date_fns_1.format)(startTime, "HH:mm", { locale: locale_1.ptBR })}
            </span>
          </div>

          {/* Patient */}
          <div className="flex items-start gap-2">
            <lucide_react_1.User2 className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0"/>
            {showPatient && appointment.patient && (<span className="text-sm font-medium truncate">
                {appointment.patient.full_name}
              </span>)}
          </div>

          {/* Service */}
          {appointment.service_type && (<badge_1.Badge variant="outline" className="text-xs">
              {appointment.service_type.name}
            </badge_1.Badge>)}

          <badge_1.Badge className={(0, utils_1.cn)("text-xs", status.color)}>{status.label}</badge_1.Badge>
        </div>
      </div>);
    }
    if (variant === "grid") {
        return (<card_1.Card className={(0, utils_1.cn)("p-3 cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary/20", status.color
                .replace("bg-", "border-l-4 border-l-")
                .replace("text-white", ""))} role="button" tabIndex={0} aria-label={ariaLabel} onClick={handleCardClick} onKeyDown={function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(e);
                }
            }}>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between items-start">
            <span className="font-medium">
              {(0, date_fns_1.format)(startTime, "HH:mm", { locale: locale_1.ptBR })} -{" "}
              {(0, date_fns_1.format)(endTime, "HH:mm", { locale: locale_1.ptBR })}
            </span>
            <badge_1.Badge className={(0, utils_1.cn)("text-xs", status.color)}>
              {status.label}
            </badge_1.Badge>
          </div>

          {showPatient && appointment.patient && (<p className="font-medium text-sm truncate">
              {appointment.patient.full_name}
            </p>)}

          {appointment.service_type && (<p className="text-xs text-muted-foreground truncate">
              {appointment.service_type.name}
            </p>)}

          {showProfessional && appointment.professional && (<p className="text-xs text-muted-foreground truncate">
              {appointment.professional.full_name}
            </p>)}

          {showActions && (<div className="flex justify-end">
              <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <button_1.Button variant="ghost" className="h-6 w-6 p-0 focus:ring-2 focus:ring-primary/20" aria-label={"A\u00E7\u00F5es para agendamento de ".concat(((_e = appointment.patient) === null || _e === void 0 ? void 0 : _e.full_name) || "paciente")}>
                    <lucide_react_1.MoreHorizontal className="h-3 w-3"/>
                  </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent>
                  {onEdit && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onEdit); }}>
                      Editar
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onConfirm && appointment.status === "scheduled" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onConfirm); }}>
                      Confirmar
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onComplete && appointment.status === "confirmed" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onComplete); }}>
                      Concluir
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onDelete && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onDelete); }} className="text-red-600">
                      Excluir
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onCancel && appointment.status !== "cancelled" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onCancel); }} className="text-red-600">
                      Cancelar
                    </dropdown_menu_1.DropdownMenuItem>)}
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>
            </div>)}
        </div>
      </card_1.Card>);
    } // Default variant (detailed card)
    return (<card_1.Card className={(0, utils_1.cn)("cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary/20", status.color
            .replace("bg-", "border-l-4 border-l-")
            .replace("text-white", ""))} role="button" tabIndex={0} aria-label={ariaLabel} onClick={handleCardClick} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(e);
            }
        }}>
      <card_1.CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with time and actions */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
              <span className="font-medium">
                {(0, date_fns_1.format)(startTime, "HH:mm", { locale: locale_1.ptBR })} -{" "}
                {(0, date_fns_1.format)(endTime, "HH:mm", { locale: locale_1.ptBR })}
              </span>
              <span className="text-sm text-muted-foreground">
                ({duration} min)
              </span>
            </div>

            {showActions && (<dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <button_1.Button variant="ghost" size="sm" aria-label={"A\u00E7\u00F5es para agendamento de ".concat(((_f = appointment.patient) === null || _f === void 0 ? void 0 : _f.full_name) || "paciente")} className="focus:ring-2 focus:ring-primary/20">
                    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                  </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent>
                  {onEdit && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onEdit); }}>
                      Editar
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onConfirm && appointment.status === "scheduled" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onConfirm); }}>
                      Confirmar
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onComplete && appointment.status === "confirmed" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onComplete); }}>
                      Concluir
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onDelete && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onDelete); }} className="text-red-600">
                      Excluir
                    </dropdown_menu_1.DropdownMenuItem>)}
                  {onCancel && appointment.status !== "cancelled" && (<dropdown_menu_1.DropdownMenuItem onClick={function (e) { return handleActionClick(e, onCancel); }} className="text-red-600">
                      Cancelar
                    </dropdown_menu_1.DropdownMenuItem>)}
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>)}
          </div>

          {/* Patient info */}
          {showPatient && appointment.patient && (<div className="flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {appointment.patient.full_name}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {appointment.patient.phone && (<span className="flex items-center gap-1">
                      <lucide_react_1.Phone className="h-3 w-3"/>
                      {appointment.patient.phone}
                    </span>)}
                  {appointment.patient.email && (<span className="flex items-center gap-1">
                      <lucide_react_1.Mail className="h-3 w-3"/>
                      {appointment.patient.email}
                    </span>)}
                </div>
              </div>
            </div>)}

          {/* Professional info */}
          {showProfessional && appointment.professional && (<div className="flex items-center gap-2">
              <lucide_react_1.Stethoscope className="h-4 w-4 text-muted-foreground"/>
              <div>
                <p className="font-medium">
                  {appointment.professional.full_name}
                </p>
                {appointment.professional.specialization && (<p className="text-sm text-muted-foreground">
                    {appointment.professional.specialization}
                  </p>)}
              </div>
            </div>)}

          {/* Service info */}
          {appointment.service_type && (<div className="flex items-center gap-2">
              <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground"/>
              <div>
                <p className="font-medium">{appointment.service_type.name}</p>
                {appointment.service_type.description && (<p className="text-sm text-muted-foreground">
                    {appointment.service_type.description}
                  </p>)}
              </div>
            </div>)}

          {/* Notes */}
          {appointment.notes && (<div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{appointment.notes}</p>
            </div>)}

          {/* Status */}
          <div className="flex justify-between items-center">
            <badge_1.Badge className={(0, utils_1.cn)("text-xs", status.color)}>
              {status.label}
            </badge_1.Badge>
            {((_g = appointment.service_type) === null || _g === void 0 ? void 0 : _g.price) && (<span className="text-sm font-medium">
                R$ {appointment.service_type.price.toFixed(2)}
              </span>)}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
