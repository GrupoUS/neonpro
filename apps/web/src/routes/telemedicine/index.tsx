/**
 * Telemedicine Dashboard - Session Management Interface
 * Overview of active sessions, scheduled consultations, and compliance status
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Shield,
  Activity,
  FileText,
  Heart,
  Stethoscope,
  PlayCircle,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/telemedicine/')({
  component: TelemedicineDashboard,
});

function TelemedicineDashboard() {
  // Mock data - will be replaced with real tRPC calls
  const sessionStats = {
    activeNow: 3,
    scheduledToday: 12,
    completedToday: 8,
    avgDuration: 28,
  };

  const scheduledSessions = [
    {
      id: 'session-1',
      patientName: 'Maria Silva',
      time: '14:30',
      type: 'Consulta de rotina',
      duration: 30,
      status: 'scheduled',
    },
    {
      id: 'session-2',
      patientName: 'João Santos',
      time: '15:00',
      type: 'Retorno',
      duration: 20,
      status: 'waiting',
    },
    {
      id: 'session-3',
      patientName: 'Ana Costa',
      time: '15:30',
      type: 'Primeira consulta',
      duration: 45,
      status: 'scheduled',
    },
  ];

  const complianceStatus = {
    cfm: { status: 'compliant', lastCheck: '2025-09-18T10:00:00Z' },
    lgpd: { status: 'compliant', consentsToday: 23 },
    anvisa: { status: 'compliant', deviceValidated: true },
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iniciar Consulta</CardTitle>
            <Video className="h-4 w-4 ml-auto text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Comece uma nova consulta de telemedicina
            </p>
            <Link to="/telemedicine/session/new">
              <Button className="w-full" size="sm">
                <PlayCircle className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sala de Espera</CardTitle>
            <Users className="h-4 w-4 ml-auto text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Visualizar pacientes aguardando
            </p>
            <Link to="/telemedicine/waiting-room">
              <Button variant="outline" className="w-full" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Ver Sala de Espera
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 ml-auto text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Status de conformidade CFM/LGPD
            </p>
            <Link to="/telemedicine/compliance">
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Statistics */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Estatísticas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sessionStats.activeNow}</div>
                  <div className="text-xs text-muted-foreground">Ativas Agora</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessionStats.scheduledToday}</div>
                  <div className="text-xs text-muted-foreground">Agendadas Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{sessionStats.completedToday}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{sessionStats.avgDuration}min</div>
                  <div className="text-xs text-muted-foreground">Duração Média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{session.patientName}</div>
                      <div className="text-sm text-muted-foreground">{session.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">{session.time}</div>
                      <div className="text-xs text-muted-foreground">{session.duration}min</div>
                    </div>
                    
                    <Badge 
                      variant={session.status === 'waiting' ? 'default' : 'secondary'}
                      className={session.status === 'waiting' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {session.status === 'waiting' ? 'Aguardando' : 'Agendada'}
                    </Badge>
                    
                    <Link to={`/telemedicine/session/${session.id}`}>
                      <Button size="sm" variant="outline">
                        {session.status === 'waiting' ? 'Iniciar' : 'Ver'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Status de Conformidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CFM Compliance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">CFM 2.314/2022</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Conforme
                </Badge>
              </div>

              {/* LGPD Compliance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">LGPD</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {complianceStatus.lgpd.consentsToday} consentimentos
                </Badge>
              </div>

              {/* ANVISA Compliance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">ANVISA</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Dispositivos OK
                </Badge>
              </div>

              <Separator />

              {/* Connection Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Qualidade da Conexão</span>
                  <span className="text-xs text-muted-foreground">Excelente</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              {/* System Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Servidor WebRTC</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Banco de Dados</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sistema de IA</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/telemedicine/analytics" className="block">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Analytics de Saúde
                </Button>
              </Link>
              <Link to="/telemedicine/settings" className="block">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
              <Link to="/telemedicine/help" className="block">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajuda e Suporte
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}