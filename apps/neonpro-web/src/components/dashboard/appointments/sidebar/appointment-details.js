// components/dashboard/appointments/sidebar/appointment-details.tsx
// Read-only appointment details component
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppointmentDetails;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Status configuration with colors and labels
var statusConfig = {
    scheduled: { label: 'Agendado', color: 'bg-blue-500', variant: 'default' },
    confirmed: { label: 'Confirmado', color: 'bg-green-500', variant: 'default' },
    in_progress: { label: 'Em Andamento', color: 'bg-yellow-500', variant: 'secondary' },
    completed: { label: 'Concluído', color: 'bg-emerald-500', variant: 'default' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500', variant: 'destructive' },
    no_show: { label: 'Não Compareceu', color: 'bg-gray-500', variant: 'secondary' }
};
function AppointmentDetails(_a) {
    var appointment = _a.appointment, onDelete = _a.onDelete;
    var _b = (0, react_1.useState)(''), deleteReason = _b[0], setDeleteReason = _b[1];
    var formatDateTime = function (dateString) {
        return (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: locale_1.ptBR });
    };
    var formatDuration = function (minutes) {
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        if (hours > 0) {
            return "".concat(hours, "h").concat(mins > 0 ? " ".concat(mins, "min") : '');
        }
        return "".concat(mins, "min");
    };
    var formatPrice = function (price) {
        if (!price)
            return 'Não definido';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };
    var handleDelete = function () {
        if (onDelete) {
            onDelete(deleteReason || 'Cancelado pelo usuário');
        }
    };
    var status = statusConfig[appointment.status] || statusConfig.scheduled;
    return (<div className="space-y-6">
      {/* Status and Basic Info */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="text-lg">Informações Gerais</card_1.CardTitle>
            <badge_1.Badge variant={status.variant}>
              {status.label}
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
            <div>
              <p className="font-medium">Data e Horário</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(appointment.start_time)}
              </p>
            </div>
          </div>          <div className="flex items-center gap-3">
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
            <div>
              <p className="font-medium">Duração</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(appointment.service_duration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground"/>
            <div>
              <p className="font-medium">Clínica</p>
              <p className="text-sm text-muted-foreground">
                {appointment.clinic_name}
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Patient Information */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.User className="h-5 w-5"/>
            Paciente
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3">
          <div>
            <p className="font-medium">{appointment.patient_name}</p>
          </div>
          
          {appointment.patient_email && (<div className="flex items-center gap-3">
              <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground"/>
              <p className="text-sm text-muted-foreground">
                {appointment.patient_email}
              </p>
            </div>)}
          
          {appointment.patient_phone && (<div className="flex items-center gap-3">
              <lucide_react_1.Phone className="h-4 w-4 text-muted-foreground"/>
              <p className="text-sm text-muted-foreground">
                {appointment.patient_phone}
              </p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>      {/* Professional Information */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.UserCheck className="h-5 w-5"/>
            Profissional
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="font-medium">{appointment.professional_name}</p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Service Information */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="text-lg">Serviço</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3">
          <div>
            <p className="font-medium">{appointment.service_name}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
              <span className="text-sm text-muted-foreground">
                {formatDuration(appointment.service_duration)}
              </span>
            </div>
            
            {appointment.service_price && (<div className="flex items-center gap-2">
                <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(appointment.service_price)}
                </span>
              </div>)}
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: appointment.service_color }}/>
            <span className="text-sm text-muted-foreground">
              Cor do serviço
            </span>
          </div>
        </card_1.CardContent>
      </card_1.Card>      {/* Notes */}
      {(appointment.notes || appointment.internal_notes) && (<card_1.Card>
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-lg flex items-center gap-2">
              <lucide_react_1.FileText className="h-5 w-5"/>
              Observações
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {appointment.notes && (<div>
                <label_1.Label className="text-sm font-medium">Observações do Cliente</label_1.Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {appointment.notes}
                </p>
              </div>)}
            
            {appointment.internal_notes && (<div>
                <label_1.Label className="text-sm font-medium">Observações Internas</label_1.Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {appointment.internal_notes}
                </p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Actions */}
      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (<card_1.Card className="border-red-200">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-lg text-red-600">Ações</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <alert_dialog_1.AlertDialog>
              <alert_dialog_1.AlertDialogTrigger asChild>
                <button_1.Button variant="destructive" className="w-full">
                  <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                  Cancelar Agendamento
                </button_1.Button>
              </alert_dialog_1.AlertDialogTrigger>
              <alert_dialog_1.AlertDialogContent>
                <alert_dialog_1.AlertDialogHeader>
                  <alert_dialog_1.AlertDialogTitle>Cancelar Agendamento</alert_dialog_1.AlertDialogTitle>
                  <alert_dialog_1.AlertDialogDescription>
                    Esta ação não pode ser desfeita. O agendamento será cancelado permanentemente.
                  </alert_dialog_1.AlertDialogDescription>
                </alert_dialog_1.AlertDialogHeader>                <div className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="delete-reason">Motivo do cancelamento</label_1.Label>
                    <textarea_1.Textarea id="delete-reason" placeholder="Informe o motivo do cancelamento..." value={deleteReason} onChange={function (e) { return setDeleteReason(e.target.value); }} className="mt-1"/>
                  </div>
                </div>
                <alert_dialog_1.AlertDialogFooter>
                  <alert_dialog_1.AlertDialogCancel>Cancelar</alert_dialog_1.AlertDialogCancel>
                  <alert_dialog_1.AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Confirmar Cancelamento
                  </alert_dialog_1.AlertDialogAction>
                </alert_dialog_1.AlertDialogFooter>
              </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
