import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, FileText, Phone } from 'lucide-react';

export function QuickActionsSection() {
  const quickActions = [
    { 
      icon: Calendar, 
      label: 'Nova Consulta', 
      description: 'Agendar consulta',
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      icon: User, 
      label: 'Novo Paciente', 
      description: 'Cadastrar paciente',
      color: 'bg-green-500 hover:bg-green-600' 
    },
    { 
      icon: FileText, 
      label: 'Prontuário', 
      description: 'Criar prontuário',
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      icon: Phone, 
      label: 'Teleconsulta', 
      description: 'Iniciar chamada',
      color: 'bg-orange-500 hover:bg-orange-600' 
    },
  ];

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
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center gap-2 p-4 ${action.color} text-white border-0 hover:scale-105 transition-all duration-200`}
                onClick={() => console.log(`Clicked ${action.label}`)}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}