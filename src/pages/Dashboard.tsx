import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total de Pacientes',
      value: '1,234',
      description: '+12% em relação ao mês passado',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Agendamentos Hoje',
      value: '23',
      description: '5 pendentes de confirmação',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Prontuários Atualizados',
      value: '89%',
      description: 'Meta: 95%',
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Receita do Mês',
      value: 'R$ 45.230',
      description: '+8% em relação ao mês anterior',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const recentAppointments = [
    { id: 1, patient: 'Maria Silva', time: '09:00', procedure: 'Limpeza de Pele', status: 'confirmado' },
    { id: 2, patient: 'João Santos', time: '10:30', procedure: 'Botox', status: 'pendente' },
    { id: 3, patient: 'Ana Costa', time: '14:00', procedure: 'Preenchimento', status: 'confirmado' },
    { id: 4, patient: 'Carlos Lima', time: '15:30', procedure: 'Peeling', status: 'cancelado' },
  ]

  const alerts = [
    { id: 1, type: 'warning', message: 'Estoque baixo: Ácido Hialurônico (3 unidades restantes)' },
    { id: 2, type: 'info', message: '5 pacientes com aniversário esta semana' },
    { id: 3, type: 'urgent', message: '2 agendamentos aguardando confirmação há mais de 24h' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral da sua clínica de estética</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span>Agendamentos de Hoje</span>
            </CardTitle>
            <CardDescription>
              Próximos atendimentos programados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.procedure}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{appointment.time}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmado' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>Alertas e Notificações</span>
            </CardTitle>
            <CardDescription>
              Itens que requerem sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'urgent' 
                    ? 'bg-red-50 border-red-400'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}>
                  <p className={`text-sm ${
                    alert.type === 'urgent' 
                      ? 'text-red-800'
                      : alert.type === 'warning'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
