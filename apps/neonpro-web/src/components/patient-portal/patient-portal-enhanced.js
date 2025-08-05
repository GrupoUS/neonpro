/**
 * NeonPro - Patient Portal Enhanced (FASE 2)
 * Portal do paciente otimizado para experiência holística
 *
 * Melhorias Fase 2:
 * - Interface acolhedora focada na persona Ana Costa
 * - Redução de ansiedade através de transparência
 * - Acompanhamento visual do progresso do tratamento
 * - Comunicação clara e educativa
 * - Agendamento simplificado com 3 cliques
 * - Integração com wellness intelligence
 */
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientPortalEnhanced = PatientPortalEnhanced;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var avatar_1 = require("@/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var accessibility_context_1 = require("@/contexts/accessibility-context");
function PatientPortalEnhanced(_a) {
    var patient = _a.patient, className = _a.className;
    var announceToScreenReader = (0, accessibility_context_1.useAccessibility)().announceToScreenReader;
    var _b = (0, react_1.useState)('home'), activeTab = _b[0], setActiveTab = _b[1];
    // Mock data - em produção viria de APIs
    var nextAppointment = {
        id: '1',
        date: '2025-01-30',
        time: '14:30',
        type: 'Retorno - Botox',
        status: 'confirmed',
        doctor: 'Dra. Marina Silva',
        preparation: [
            'Não usar maquiagem no rosto',
            'Evitar anti-inflamatórios 24h antes',
            'Chegar 15 minutos antes do horário'
        ]
    };
    var treatments = [
        {
            id: '1',
            name: 'Rejuvenescimento Facial',
            startDate: '2024-12-15',
            progress: 65,
            nextSession: '2025-01-30',
            status: 'active',
            sessions: { completed: 2, total: 4 }
        },
        {
            id: '2',
            name: 'Tratamento Anti-idade',
            startDate: '2024-11-20',
            progress: 100,
            status: 'completed',
            sessions: { completed: 3, total: 3 }
        }
    ];
    var wellnessMetrics = [
        {
            id: 'satisfaction',
            name: 'Satisfação',
            value: 95,
            unit: '%',
            trend: 'up',
            icon: lucide_react_1.Smile
        },
        {
            id: 'confidence',
            name: 'Confiança',
            value: 88,
            unit: '%',
            trend: 'up',
            icon: lucide_react_1.TrendingUp
        },
        {
            id: 'wellbeing',
            name: 'Bem-estar',
            value: 92,
            unit: '%',
            trend: 'stable',
            icon: lucide_react_1.Heart
        }
    ];
    var upcomingAppointments = [
        nextAppointment,
        {
            id: '2',
            date: '2025-02-15',
            time: '16:00',
            type: 'Manutenção',
            status: 'pending',
            doctor: 'Dra. Marina Silva'
        }
    ];
    // Cálculos derivados
    var daysUntilNext = (0, react_1.useMemo)(function () {
        if (!nextAppointment)
            return null;
        var today = new Date();
        var appointmentDate = new Date(nextAppointment.date);
        var diffTime = appointmentDate.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [nextAppointment]);
    var completedTreatments = treatments.filter(function (t) { return t.status === 'completed'; }).length;
    var activeTreatments = treatments.filter(function (t) { return t.status === 'active'; }).length;
    // Anúncios para acessibilidade
    (0, react_1.useEffect)(function () {
        if (daysUntilNext !== null && daysUntilNext <= 2) {
            announceToScreenReader("Lembrete: Voc\u00EA tem uma consulta em ".concat(daysUntilNext, " dia").concat(daysUntilNext > 1 ? 's' : ''), 'polite');
        }
    }, [daysUntilNext, announceToScreenReader]);
    var getStatusColor = function (status) {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    var getStatusLabel = function (status) {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendente';
            case 'completed': return 'Concluída';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'up': return '↗️';
            case 'down': return '↘️';
            case 'stable': return '→';
            default: return '';
        }
    };
    return (<div className={(0, utils_1.cn)('max-w-6xl mx-auto space-y-6 p-6', className)}>
      
      {/* Header acolhedor */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <avatar_1.Avatar className="h-20 w-20">
            <avatar_1.AvatarImage src={patient.avatar} alt={patient.name}/>
            <avatar_1.AvatarFallback className="text-2xl">
              {patient.name.split(' ').map(function (n) { return n[0]; }).join('')}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {patient.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Seja bem-vinda ao seu espaço de bem-estar e beleza
          </p>
        </div>

        {/* Status cards rápidos */}
        <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
          <card_1.Card className="text-center">
            <card_1.CardContent className="pt-4">
              <lucide_react_1.Calendar className="h-8 w-8 mx-auto text-primary mb-2"/>
              <p className="text-2xl font-bold">{daysUntilNext || 0}</p>
              <p className="text-sm text-muted-foreground">
                {daysUntilNext === 1 ? 'dia' : 'dias'} até próxima consulta
              </p>
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card className="text-center">
            <card_1.CardContent className="pt-4">
              <lucide_react_1.Activity className="h-8 w-8 mx-auto text-green-600 mb-2"/>
              <p className="text-2xl font-bold">{activeTreatments}</p>
              <p className="text-sm text-muted-foreground">
                tratamento{activeTreatments !== 1 ? 's' : ''} ativo{activeTreatments !== 1 ? 's' : ''}
              </p>
            </card_1.CardContent>
          </card_1.Card>
          
          <card_1.Card className="text-center">
            <card_1.CardContent className="pt-4">
              <lucide_react_1.Award className="h-8 w-8 mx-auto text-yellow-600 mb-2"/>
              <p className="text-2xl font-bold">{completedTreatments}</p>
              <p className="text-sm text-muted-foreground">
                tratamento{completedTreatments !== 1 ? 's' : ''} concluído{completedTreatments !== 1 ? 's' : ''}
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Tabs principais */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="home">Início</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="appointments">Consultas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="treatments">Tratamentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="wellness">Bem-estar</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="education">Educação</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="home" className="space-y-6">
          
          {/* Próxima consulta em destaque */}
          {nextAppointment && (<card_1.Card className="border-primary/20 bg-primary/5">
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center text-primary">
                  <lucide_react_1.Calendar className="h-5 w-5 mr-2"/>
                  Próxima Consulta
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <badge_1.Badge className={getStatusColor(nextAppointment.status)}>
                        {getStatusLabel(nextAppointment.status)}
                      </badge_1.Badge>
                      {daysUntilNext && daysUntilNext <= 2 && (<badge_1.Badge variant="outline" className="animate-pulse">
                          <lucide_react_1.Bell className="h-3 w-3 mr-1"/>
                          Lembrete
                        </badge_1.Badge>)}
                    </div>
                    <p className="text-lg font-semibold">{nextAppointment.type}</p>
                    <p className="text-muted-foreground">
                      {new Date(nextAppointment.date).toLocaleDateString('pt-BR')} às {nextAppointment.time}
                    </p>
                    <p className="text-muted-foreground">com {nextAppointment.doctor}</p>
                  </div>
                  
                  {nextAppointment.preparation && (<div>
                      <h4 className="font-medium mb-2">Preparação:</h4>
                      <ul className="space-y-1">
                        {nextAppointment.preparation.map(function (item, index) { return (<li key={index} className="flex items-start text-sm">
                            <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"/>
                            {item}
                          </li>); })}
                      </ul>
                    </div>)}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button_1.Button size="sm">
                    <lucide_react_1.Calendar className="h-4 w-4 mr-2"/>
                    Reagendar
                  </button_1.Button>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.MessageCircle className="h-4 w-4 mr-2"/>
                    Dúvidas
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Progresso dos tratamentos ativos */}
          <div className="grid gap-4 md:grid-cols-2">
            {treatments
            .filter(function (t) { return t.status === 'active'; })
            .map(function (treatment) { return (<card_1.Card key={treatment.id}>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-lg">{treatment.name}</card_1.CardTitle>
                    <card_1.CardDescription>
                      Sessão {treatment.sessions.completed} de {treatment.sessions.total}
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{treatment.progress}%</span>
                        </div>
                        <progress_1.Progress value={treatment.progress} className="h-2"/>
                      </div>
                      
                      {treatment.nextSession && (<div className="flex items-center text-sm text-muted-foreground">
                          <lucide_react_1.Clock className="h-4 w-4 mr-1"/>
                          Próxima sessão: {new Date(treatment.nextSession).toLocaleDateString('pt-BR')}
                        </div>)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>); })}
          </div>

          {/* Métricas de bem-estar */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Heart className="h-5 w-5 mr-2 text-red-500"/>
                Seu Bem-estar
              </card_1.CardTitle>
              <card_1.CardDescription>
                Acompanhe sua jornada de bem-estar e autoestima
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {wellnessMetrics.map(function (metric) {
            var IconComponent = metric.icon;
            return (<div key={metric.id} className="text-center">
                      <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary"/>
                      <div className="text-2xl font-bold">
                        {metric.value}{metric.unit}
                        <span className="text-lg ml-1">{getTrendIcon(metric.trend)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                    </div>);
        })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="appointments" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>Minhas Consultas</card_1.CardTitle>
                <button_1.Button>
                  <lucide_react_1.Calendar className="h-4 w-4 mr-2"/>
                  Agendar Nova
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map(function (appointment) { return (<div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {new Date(appointment.date).getDate()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time} - {appointment.doctor}
                        </p>
                        <badge_1.Badge className={getStatusColor(appointment.status)} variant="outline">
                          {getStatusLabel(appointment.status)}
                        </badge_1.Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button_1.Button variant="outline" size="sm">Detalhes</button_1.Button>
                      {appointment.status === 'confirmed' && (<button_1.Button variant="outline" size="sm">Reagendar</button_1.Button>)}
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="treatments" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Meus Tratamentos</card_1.CardTitle>
              <card_1.CardDescription>
                Acompanhe o progresso de todos os seus tratamentos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-6">
                {treatments.map(function (treatment) { return (<div key={treatment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{treatment.name}</h3>
                        <p className="text-muted-foreground">
                          Iniciado em {new Date(treatment.startDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <badge_1.Badge variant={treatment.status === 'completed' ? 'default' : 'secondary'} className={treatment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                        {treatment.status === 'completed' ? 'Concluído' :
                treatment.status === 'active' ? 'Ativo' : 'Pausado'}
                      </badge_1.Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso Geral</span>
                          <span>{treatment.progress}%</span>
                        </div>
                        <progress_1.Progress value={treatment.progress} className="h-3"/>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Sessões realizadas:</span>
                        <span>{treatment.sessions.completed} de {treatment.sessions.total}</span>
                      </div>
                      
                      {treatment.nextSession && (<div className="flex justify-between text-sm">
                          <span>Próxima sessão:</span>
                          <span>{new Date(treatment.nextSession).toLocaleDateString('pt-BR')}</span>
                        </div>)}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Camera className="h-4 w-4 mr-2"/>
                        Ver Fotos
                      </button_1.Button>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.MessageCircle className="h-4 w-4 mr-2"/>
                        Dúvidas
                      </button_1.Button>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="wellness" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Heart className="h-5 w-5 mr-2 text-red-500"/>
                Wellness Intelligence
              </card_1.CardTitle>
              <card_1.CardDescription>
                Sua jornada holística de bem-estar e autoestima
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Heart className="h-16 w-16 mx-auto mb-4 text-red-200"/>
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p>Métricas avançadas de bem-estar serão disponibilizadas em breve</p>
                <p className="text-sm mt-2">
                  Incluindo análise de autoestima, satisfação com resultados e qualidade de vida
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="education" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.BookOpen className="h-5 w-5 mr-2"/>
                Educação e Cuidados
              </card_1.CardTitle>
              <card_1.CardDescription>
                Conteúdo educativo personalizado para você
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-200"/>
                <h3 className="text-lg font-semibold mb-2">Conteúdo Personalizado</h3>
                <p>Artigos e dicas baseados no seu perfil e tratamentos</p>
                <p className="text-sm mt-2">
                  Cuidados pré e pós-procedimento, dicas de bem-estar e muito mais
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

      </tabs_1.Tabs>

      {/* Botão de ação flutuante para contato rápido */}
      <div className="fixed bottom-6 right-6">
        <button_1.Button className="rounded-full h-14 w-14 shadow-lg">
          <lucide_react_1.MessageCircle className="h-6 w-6"/>
          <span className="sr-only">Contatar clínica</span>
        </button_1.Button>
      </div>
    </div>);
}
