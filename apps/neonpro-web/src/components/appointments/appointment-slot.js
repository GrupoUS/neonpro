'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentSlot = AppointmentSlot;
exports.AppointmentSlotAgenda = AppointmentSlotAgenda;
var react_1 = require("react");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var moment_1 = require("moment");
require("moment/locale/pt-br");
moment_1.default.locale('pt-br');
// Service type configurations
var serviceConfig = {
    consultation: {
        label: 'Consulta',
        color: 'bg-blue-500',
        lightColor: 'bg-blue-100 text-blue-800',
        icon: lucide_react_1.User
    },
    botox: {
        label: 'Botox',
        color: 'bg-violet-500',
        lightColor: 'bg-violet-100 text-violet-800',
        icon: lucide_react_1.Play
    },
    fillers: {
        label: 'Preenchimento',
        color: 'bg-emerald-500',
        lightColor: 'bg-emerald-100 text-emerald-800',
        icon: lucide_react_1.Play
    },
    procedure: {
        label: 'Procedimento',
        color: 'bg-amber-500',
        lightColor: 'bg-amber-100 text-amber-800',
        icon: lucide_react_1.Play
    }
};
// Status configurations
var statusConfig = {
    scheduled: {
        label: 'Agendado',
        icon: lucide_react_1.Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderStyle: 'border-dashed'
    },
    confirmed: {
        label: 'Confirmado',
        icon: lucide_react_1.CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderStyle: 'border-solid'
    },
    'in-progress': {
        label: 'Em Atendimento',
        icon: lucide_react_1.Play,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderStyle: 'border-solid animate-pulse'
    },
    completed: {
        label: 'Concluído',
        icon: lucide_react_1.CheckCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderStyle: 'border-solid opacity-70'
    },
    cancelled: {
        label: 'Cancelado',
        icon: lucide_react_1.XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderStyle: 'border-solid line-through'
    },
    'no-show': {
        label: 'Não Compareceu',
        icon: lucide_react_1.AlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderStyle: 'border-solid opacity-50'
    }
};
function AppointmentSlot(_a) {
    var event = _a.event;
    var serviceInfo = serviceConfig[event.serviceType];
    var statusInfo = statusConfig[event.status];
    var ServiceIcon = serviceInfo.icon;
    var StatusIcon = statusInfo.icon;
    // Calculate duration
    var duration = (0, moment_1.default)(event.end).diff((0, moment_1.default)(event.start), 'minutes');
    var durationText = duration >= 60
        ? "".concat(Math.floor(duration / 60), "h").concat(duration % 60 > 0 ? " ".concat(duration % 60, "min") : '')
        : "".concat(duration, "min");
    // Format time range
    var timeRange = "".concat((0, moment_1.default)(event.start).format('HH:mm'), " - ").concat((0, moment_1.default)(event.end).format('HH:mm'));
    return (<div className={(0, utils_1.cn)('relative h-full w-full p-2 rounded-md border-l-4 transition-all duration-200', serviceInfo.color.replace('bg-', 'border-l-'), statusInfo.bgColor, statusInfo.borderStyle, 'hover:shadow-sm cursor-pointer group')} role="button" tabIndex={0} aria-label={"Consulta de ".concat(event.patientName, " - ").concat(serviceInfo.label, " - ").concat(statusInfo.label)}>
      {/* Status indicator badge */}
      <div className="absolute -top-1 -right-1 z-10">
        <badge_1.Badge variant="secondary" className={(0, utils_1.cn)('text-xs px-1 py-0 h-5 min-w-0', statusInfo.color, statusInfo.bgColor, 'border border-current')}>
          <StatusIcon className="h-3 w-3"/>
        </badge_1.Badge>
      </div>

      {/* WhatsApp reminder indicator */}
      {event.whatsappReminder && (<div className="absolute top-1 right-1">
          <lucide_react_1.MessageCircle className="h-3 w-3 text-green-600"/>
        </div>)}

      {/* Main content */}
      <div className="space-y-1">
        {/* Patient name and service */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className={(0, utils_1.cn)('font-medium text-sm truncate', event.status === 'cancelled' && 'line-through', event.status === 'no-show' && 'opacity-60')}>
              {event.patientName}
            </p>
            <div className="flex items-center space-x-1 mt-0.5">
              <ServiceIcon className="h-3 w-3 text-muted-foreground"/>
              <span className="text-xs text-muted-foreground">
                {serviceInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Time and duration */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <lucide_react_1.Clock className="h-3 w-3"/>
            <span>{timeRange}</span>
          </div>
          <span className="font-medium">{durationText}</span>
        </div>

        {/* Professional name (if space allows) */}
        {event.professionalName && (<div className="text-xs text-muted-foreground truncate">
            {event.professionalName}
          </div>)}

        {/* Phone number (on hover/focus) */}
        {event.phoneNumber && (<div className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity text-xs text-muted-foreground flex items-center space-x-1">
            <lucide_react_1.Phone className="h-3 w-3"/>
            <span>{event.phoneNumber}</span>
          </div>)}

        {/* Notes preview (if available) */}
        {event.notes && (<div className="text-xs text-muted-foreground truncate opacity-75">
            {event.notes}
          </div>)}
      </div>

      {/* Equipment needed indicator */}
      {event.equipmentNeeded && event.equipmentNeeded.length > 0 && (<div className="absolute bottom-1 left-1">
          <div className="flex space-x-1">
            {event.equipmentNeeded.slice(0, 2).map(function (equipment, index) { return (<div key={index} className="w-2 h-2 rounded-full bg-current opacity-60" title={equipment}/>); })}
            {event.equipmentNeeded.length > 2 && (<div className="text-xs text-muted-foreground" title={"+".concat(event.equipmentNeeded.length - 2, " equipamentos")}>
                +{event.equipmentNeeded.length - 2}
              </div>)}
          </div>
        </div>)}

      {/* Conflict indicator (if appointment has conflicts - would be passed as prop) */}
      {/* This could be enhanced to show conflict warnings */}
    </div>);
}
// Agenda view version with more details
function AppointmentSlotAgenda(_a) {
    var event = _a.event;
    var serviceInfo = serviceConfig[event.serviceType];
    var statusInfo = statusConfig[event.status];
    var ServiceIcon = serviceInfo.icon;
    var StatusIcon = statusInfo.icon;
    var duration = (0, moment_1.default)(event.end).diff((0, moment_1.default)(event.start), 'minutes');
    var timeRange = "".concat((0, moment_1.default)(event.start).format('HH:mm'), " - ").concat((0, moment_1.default)(event.end).format('HH:mm'));
    return (<div className={(0, utils_1.cn)('flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200', statusInfo.bgColor, 'hover:shadow-md cursor-pointer group')} role="button" tabIndex={0} aria-label={"Consulta de ".concat(event.patientName, " - ").concat(serviceInfo.label, " - ").concat(statusInfo.label)}>
      {/* Time column */}
      <div className="flex-shrink-0 text-center min-w-[80px]">
        <div className="text-sm font-medium">{timeRange}</div>
        <div className="text-xs text-muted-foreground">
          {duration}min
        </div>
      </div>

      {/* Service type indicator */}
      <div className={(0, utils_1.cn)('flex-shrink-0 w-1 h-12 rounded-full', serviceInfo.color)}/>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h4 className={(0, utils_1.cn)('font-medium text-base', event.status === 'cancelled' && 'line-through text-muted-foreground')}>
              {event.patientName}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <badge_1.Badge variant="secondary" className={serviceInfo.lightColor}>
                <ServiceIcon className="h-3 w-3 mr-1"/>
                {serviceInfo.label}
              </badge_1.Badge>
              <badge_1.Badge variant="outline" className={(0, utils_1.cn)(statusInfo.color, 'border-current')}>
                <StatusIcon className="h-3 w-3 mr-1"/>
                {statusInfo.label}
              </badge_1.Badge>
            </div>
          </div>
          
          {/* Contact and reminder indicators */}
          <div className="flex items-center space-x-2">
            {event.phoneNumber && (<div className="text-xs text-muted-foreground flex items-center">
                <lucide_react_1.Phone className="h-3 w-3 mr-1"/>
                {event.phoneNumber}
              </div>)}
            {event.whatsappReminder && (<lucide_react_1.MessageCircle className="h-4 w-4 text-green-600" title="Lembrete WhatsApp ativo"/>)}
          </div>
        </div>

        {/* Professional and additional info */}
        <div className="mt-2 text-sm text-muted-foreground">
          <p>{event.professionalName}</p>
          {event.notes && (<p className="mt-1 text-xs">{event.notes}</p>)}
        </div>
      </div>
    </div>);
}
