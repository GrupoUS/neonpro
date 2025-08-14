import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, ExternalLinkIcon } from 'lucide-react'

// Interface para um Agendamento na Agenda Preditiva
interface Appointment {
  time: string
  patientName: string
  serviceName: string
  status: 'Confirmado' | 'Aguardando'
  noShowRisk: 'high' | 'medium' | 'low'
}

// Dados mock baseados na interface
const mockAppointments: Appointment[] = [
  {
    time: "09:00",
    patientName: "Ana Silva",
    serviceName: "Botox Facial",
    status: "Confirmado",
    noShowRisk: "low"
  },
  {
    time: "10:30",
    patientName: "Maria Santos",
    serviceName: "Preenchimento Labial",
    status: "Confirmado",
    noShowRisk: "medium"
  },
  {
    time: "14:00",
    patientName: "Carla Oliveira",
    serviceName: "Limpeza de Pele",
    status: "Aguardando",
    noShowRisk: "high"
  },
  {
    time: "15:30",
    patientName: "Juliana Costa",
    serviceName: "Microagulhamento",
    status: "Confirmado",
    noShowRisk: "low"
  },
  {
    time: "17:00",
    patientName: "Patricia Lima",
    serviceName: "Bioestimulador",
    status: "Aguardando",
    noShowRisk: "medium"
  }
]

// Função para determinar a cor do círculo de risco
function getRiskColor(risk: Appointment['noShowRisk']): string {
  switch (risk) {
    case 'high':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}// Função para determinar a variante do badge baseada no status
function getStatusVariant(status: Appointment['status']) {
  switch (status) {
    case 'Confirmado':
      return 'default'
    case 'Aguardando':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function AgendaPreditiva() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Agenda do Dia
          </CardTitle>
          <CardDescription>
            Agendamentos de hoje com análise preditiva
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Ver Agenda Completa
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAppointments.map((appointment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-sm font-mono font-medium text-primary">
                  {appointment.time}
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getRiskColor(appointment.noShowRisk)}`}
                    title={`Risco de no-show: ${appointment.noShowRisk}`}
                  />
                  <div>
                    <p className="font-medium text-sm">{appointment.patientName}</p>
                    <p className="text-xs text-muted-foreground">{appointment.serviceName}</p>
                  </div>
                </div>
              </div>
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          ))}
        </div>
        
        {mockAppointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum agendamento para hoje</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}