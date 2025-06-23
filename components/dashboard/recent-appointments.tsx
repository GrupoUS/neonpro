'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

const recentAppointments = [
  {
    id: 1,
    clientName: "Maria Silva",
    service: "Limpeza de Pele",
    time: "14:00",
    date: "Hoje",
    status: "confirmado"
  },
  {
    id: 2,
    clientName: "Ana Costa",
    service: "Massagem Relaxante",
    time: "16:30",
    date: "Hoje",
    status: "confirmado"
  },
  {
    id: 3,
    clientName: "Carla Santos",
    service: "Peeling Químico",
    time: "10:00",
    date: "Amanhã",
    status: "pendente"
  },
  {
    id: 4,
    clientName: "Julia Oliveira",
    service: "Hidratação Facial",
    time: "15:00",
    date: "Amanhã",
    status: "confirmado"
  }
];

export function RecentAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos Recentes</CardTitle>
        <CardDescription>
          Últimos agendamentos da sua clínica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{appointment.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.service}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.time}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{appointment.date}</span>
                  <Badge 
                    variant={appointment.status === 'confirmado' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
