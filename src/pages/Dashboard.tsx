import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, Activity, Clock, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant={trend.isPositive ? 'default' : 'secondary'} className="text-xs">
            {trend.isPositive ? '+' : ''}{trend.value}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

interface AppointmentCardProps {
  time: string;
  patient: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ time, patient, type, status }) => {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-neon-brand/10 text-neon-brand dark:bg-neon-brand/20 dark:text-neon-brand',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  const statusLabels = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    completed: 'Concluído'
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">{time}</span>
        </div>
        <div>
          <p className="font-medium">{patient}</p>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>
      </div>
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // Dados simulados - serão substituídos por dados reais do Supabase
  const todayAppointments = [
    { time: '09:00', patient: 'Maria Silva', type: 'Consulta Geral', status: 'confirmed' as const },
    { time: '10:30', patient: 'João Santos', type: 'Retorno', status: 'pending' as const },
    { time: '14:00', patient: 'Ana Costa', type: 'Exame', status: 'confirmed' as const },
    { time: '15:30', patient: 'Pedro Lima', type: 'Consulta Geral', status: 'completed' as const },
  ];

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground capitalize">{currentDate}</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Consultas Hoje"
          value="12"
          description="4 confirmadas, 2 pendentes"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: '8%', isPositive: true }}
        />
        <MetricCard
          title="Pacientes Ativos"
          value="847"
          description="Total de pacientes cadastrados"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: '12', isPositive: true }}
        />
        <MetricCard
          title="Receita Mensal"
          value="R$ 45.231"
          description="Comparado ao mês anterior"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: '15%', isPositive: true }}
        />
        <MetricCard
          title="Taxa de Ocupação"
          value="78%"
          description="Média dos últimos 7 dias"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: '3%', isPositive: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consultas de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Consultas de Hoje</span>
            </CardTitle>
            <CardDescription>
              Agenda do dia - {todayAppointments.length} consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.map((appointment, index) => (
              <AppointmentCard key={index} {...appointment} />
            ))}
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Alertas</span>
            </CardTitle>
            <CardDescription>
              Itens que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3 p-3 border rounded-lg border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Pagamentos Pendentes
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  3 pacientes com pagamentos em atraso
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Confirmações Pendentes
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  2 consultas aguardando confirmação
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border rounded-lg border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <Users className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Retornos Agendados
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  5 pacientes com retorno esta semana
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors group">
              <Calendar className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Nova Consulta</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors group">
              <Users className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Novo Paciente</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors group">
              <DollarSign className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Registrar Pagamento</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors group">
              <Activity className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Relatórios</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
