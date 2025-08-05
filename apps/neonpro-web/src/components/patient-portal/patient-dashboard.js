"use client";
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientDashboard = PatientDashboard;
var react_1 = require("react");
var link_1 = require("next/link");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var alert_1 = require("@/components/ui/alert");
var patient_auth_1 = require("@/lib/auth/patient-auth");
var use_patient_data_1 = require("@/lib/hooks/use-patient-data");
function PatientDashboard() {
    var _a, _b;
    var patient = (0, patient_auth_1.usePatientAuth)().patient;
    var _c = (0, use_patient_data_1.usePatientData)(), appointments = _c.appointments, treatmentHistory = _c.treatmentHistory, isLoading = _c.isLoading;
    // Sample data - in production, this would come from API
    var upcomingAppointments = [
        {
            id: '1',
            date: '2025-01-29',
            time: '14:30',
            service: 'Harmonização Facial',
            professional: 'Dra. Marina Silva',
            professional_avatar: '',
            location: 'Sala 102',
            status: 'confirmed',
            type: 'procedure'
        },
        {
            id: '2',
            date: '2025-02-05',
            time: '10:00',
            service: 'Consulta de Retorno',
            professional: 'Dra. Marina Silva',
            location: 'Sala 101',
            status: 'confirmed',
            type: 'follow_up'
        }
    ];
    var wellnessMetrics = [
        {
            id: '1',
            label: 'Satisfação com Tratamentos',
            value: 95,
            target: 100,
            unit: '%',
            trend: 'up',
            color: 'text-green-600'
        },
        {
            id: '2',
            label: 'Aderência ao Protocolo',
            value: 88,
            target: 90,
            unit: '%',
            trend: 'up',
            color: 'text-blue-600'
        },
        {
            id: '3',
            label: 'Consultas Realizadas',
            value: 12,
            target: 15,
            unit: '',
            trend: 'stable',
            color: 'text-purple-600'
        }
    ];
    var recentActivities = [
        {
            id: '1',
            type: 'appointment',
            title: 'Consulta realizada',
            description: 'Avaliação pré-procedimento com Dra. Marina',
            date: '2025-01-20',
            icon: lucide_react_1.CalendarCheck
        },
        {
            id: '2',
            type: 'document',
            title: 'Novo documento disponível',
            description: 'Laudo de exame pré-operatório',
            date: '2025-01-18',
            icon: lucide_react_1.FileText
        },
        {
            id: '3',
            type: 'message',
            title: 'Mensagem recebida',
            description: 'Orientações pós-procedimento',
            date: '2025-01-15',
            icon: lucide_react_1.MessageCircle
        }
    ];
    var getGreeting = function () {
        var hour = new Date().getHours();
        if (hour < 12)
            return 'Bom dia';
        if (hour < 18)
            return 'Boa tarde';
        return 'Boa noite';
    };
    var formatAppointmentDate = function (dateStr) {
        var date = (0, date_fns_1.parseISO)(dateStr);
        if ((0, date_fns_1.isToday)(date))
            return 'Hoje';
        if ((0, date_fns_1.isTomorrow)(date))
            return 'Amanhã';
        return (0, date_fns_1.format)(date, "d 'de' MMMM", { locale: locale_1.ptBR });
    };
    var getStatusBadge = function (status) {
        var badges = {
            confirmed: { label: 'Confirmado', variant: 'default' },
            pending: { label: 'Pendente', variant: 'secondary' },
            rescheduled: { label: 'Reagendado', variant: 'outline' }
        };
        return badges[status] || badges.pending;
    };
    if (isLoading) {
        return (<div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {__spreadArray([], Array(6), true).map(function (_, i) { return (<div key={i} className="h-32 bg-muted rounded-lg"></div>); })}
          </div>
        </div>
      </div>);
    }
    return (<div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <avatar_1.Avatar className="h-16 w-16 border-4 border-white/30">
              <avatar_1.AvatarImage src={patient === null || patient === void 0 ? void 0 : patient.avatar_url} alt={patient === null || patient === void 0 ? void 0 : patient.name}/>
              <avatar_1.AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {(_a = patient === null || patient === void 0 ? void 0 : patient.name) === null || _a === void 0 ? void 0 : _a.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase()}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {(_b = patient === null || patient === void 0 ? void 0 : patient.name) === null || _b === void 0 ? void 0 : _b.split(' ')[0]}! ✨
              </h1>
              <p className="text-white/90 text-lg">
                Bem-vindo ao seu portal de saúde e beleza
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-white/80 text-sm">Consultas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-white/80 text-sm">Tratamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-white/80 text-sm">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-white/80 text-sm">Retornos</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <lucide_react_1.Sparkles className="w-12 h-12"/>
          </div>
          <div className="absolute bottom-4 left-4">
            <lucide_react_1.Heart className="w-8 h-8"/>
          </div>
          <div className="absolute top-1/2 right-1/4">
            <lucide_react_1.Star className="w-6 h-6"/>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button_1.Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <link_1.default href="/patient-portal/appointments/new">
            <lucide_react_1.Plus className="w-5 h-5"/>
            <span className="text-sm">Agendar</span>
          </link_1.default>
        </button_1.Button>
        <button_1.Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <link_1.default href="/patient-portal/history">
            <lucide_react_1.Activity className="w-5 h-5"/>
            <span className="text-sm">Histórico</span>
          </link_1.default>
        </button_1.Button>
        <button_1.Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <link_1.default href="/patient-portal/documents">
            <lucide_react_1.Download className="w-5 h-5"/>
            <span className="text-sm">Documentos</span>
          </link_1.default>
        </button_1.Button>
        <button_1.Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <link_1.default href="/patient-portal/profile">
            <lucide_react_1.User className="w-5 h-5"/>
            <span className="text-sm">Perfil</span>
          </link_1.default>
        </button_1.Button>
      </div>

      {/* Alerts/Notifications */}
      <div className="space-y-4">
        <alert_1.Alert className="border-blue-200 bg-blue-50">
          <lucide_react_1.Bell className="h-4 w-4 text-blue-600"/>
          <alert_1.AlertDescription className="text-blue-800">
            <strong>Lembrete:</strong> Você tem uma consulta agendada para amanhã às 14:30. 
            <link_1.default href="/patient-portal/appointments" className="underline ml-1">
              Ver detalhes
            </link_1.default>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <card_1.Card className="medical-card">
          <card_1.CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <lucide_react_1.Calendar className="w-5 h-5 text-primary"/>
                <card_1.CardTitle className="text-lg">Próximas Consultas</card_1.CardTitle>
              </div>
              <button_1.Button asChild variant="ghost" size="sm">
                <link_1.default href="/patient-portal/appointments">
                  Ver todas
                </link_1.default>
              </button_1.Button>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (upcomingAppointments.map(function (appointment) { return (<div key={appointment.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <lucide_react_1.Calendar className="w-5 h-5 text-primary"/>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">{appointment.service}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.professional}
                        </p>
                      </div>
                      <badge_1.Badge {...getStatusBadge(appointment.status)}>
                        {getStatusBadge(appointment.status).label}
                      </badge_1.Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="w-3 h-3"/>
                        <span>{formatAppointmentDate(appointment.date)} às {appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <lucide_react_1.MapPin className="w-3 h-3"/>
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                  </div>
                </div>); })) : (<div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Calendar className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <p>Nenhuma consulta agendada</p>
                <button_1.Button asChild variant="outline" size="sm" className="mt-2">
                  <link_1.default href="/patient-portal/appointments/new">
                    Agendar consulta
                  </link_1.default>
                </button_1.Button>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Wellness Metrics */}
        <card_1.Card className="medical-card">
          <card_1.CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="w-5 h-5 text-primary"/>
              <card_1.CardTitle className="text-lg">Indicadores de Bem-estar</card_1.CardTitle>
            </div>
            <card_1.CardDescription>
              Acompanhe seu progresso nos tratamentos
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {wellnessMetrics.map(function (metric) { return (<div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className={"text-sm font-semibold ".concat(metric.color)}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <progress_1.Progress value={(metric.value / metric.target) * 100} className="h-2"/>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Meta: {metric.target}{metric.unit}</span>
                  <div className="flex items-center gap-1">
                    <lucide_react_1.TrendingUp className={"w-3 h-3 ".concat(metric.color)}/>
                    <span className={metric.color}>
                      {metric.trend === 'up' ? 'Melhorando' :
                metric.trend === 'down' ? 'Atenção' : 'Estável'}
                    </span>
                  </div>
                </div>
              </div>); })}
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Recent Activity */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Activity className="w-5 h-5 text-primary"/>
              <card_1.CardTitle className="text-lg">Atividade Recente</card_1.CardTitle>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {recentActivities.map(function (activity, index) {
            var Icon = activity.icon;
            return (<div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary"/>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(0, date_fns_1.format)((0, date_fns_1.parseISO)(activity.date), "d 'de' MMMM 'às' HH:mm", { locale: locale_1.ptBR })}
                      </p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && (<separator_1.Separator className="my-4"/>)}
                </div>);
        })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* LGPD Privacy Notice */}
      <card_1.Card className="bg-blue-50 border-blue-200 medical-card">
        <card_1.CardContent className="p-6">
          <div className="flex items-start gap-4">
            <lucide_react_1.Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"/>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Seus Dados Estão Protegidos
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Todas as suas informações médicas são tratadas com máxima segurança, 
                seguindo rigorosamente a Lei Geral de Proteção de Dados (LGPD) e 
                as normas do Conselho Federal de Medicina (CFM).
              </p>
              <div className="flex flex-wrap gap-2">
                <button_1.Button asChild variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <link_1.default href="/patient-portal/consent">
                    Gerenciar Consentimentos
                  </link_1.default>
                </button_1.Button>
                <button_1.Button asChild variant="ghost" size="sm" className="text-blue-700">
                  <link_1.default href="/privacy-policy">
                    Política de Privacidade
                  </link_1.default>
                </button_1.Button>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
