import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import { Calendar, FileText, Phone, Plus, User, } from 'lucide-react'

export function QuickActionsSection() {
  const quickActions = [
    {
      icon: Calendar,
      label: 'Nova Consulta',
      description: 'Agendar consulta',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: User,
      label: 'Novo Paciente',
      description: 'Cadastrar paciente',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: FileText,
      label: 'Prontuário',
      description: 'Criar prontuário',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: Phone,
      label: 'Teleconsulta',
      description: 'Iniciar chamada',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index,) => {
            const { icon: IconComponent, } = action
            return (
              <Button
                className={`flex h-20 flex-col items-center justify-center gap-2 p-4 ${action.color} border-0 text-white transition-all duration-200 hover:scale-105`}
                key={index}
                onClick={() => {
                  // Handle action click - implement navigation or action here
                }}
                variant="outline"
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            )
          },)}
        </div>
      </CardContent>
    </Card>
  )
}
