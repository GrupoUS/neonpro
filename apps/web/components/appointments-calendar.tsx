/**
 * 📅 Appointments Calendar - NeonPro Healthcare
 * ===========================================
 * 
 * Calendar view for appointments with scheduling
 * and healthcare-specific features.
 */

'use client';

import React from 'react';
import { useSearch } from '@tanstack/react-router';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AppointmentsCalendar() {
  const search = useSearch({ from: '/appointments' });
  
  // Mock appointments data
  const appointments = [
    {
      id: '1',
      patient: 'Ana Silva',
      service: 'Limpeza de Pele',
      professional: 'Dr. Maria Santos',
      time: '09:00',
      duration: 60,
      status: 'confirmed',
      room: 'Sala 1',
    },
    {
      id: '2',
      patient: 'Carlos Oliveira',
      service: 'Botox',
      professional: 'Dr. João Costa',
      time: '10:30',
      duration: 45,
      status: 'pending',
      room: 'Sala 2',
    },
    {
      id: '3',
      patient: 'Fernanda Lima',
      service: 'Preenchimento',
      professional: 'Dr. Maria Santos',
      time: '14:00',
      duration: 90,
      status: 'confirmed',
      room: 'Sala 1',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie suas consultas e horários
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          <Button>
            Agendar Consulta
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <Badge variant="outline">
              {appointments.length} consultas hoje
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Appointments Timeline */}
      <div className="grid grid-cols-1 gap-4">
        {appointments.map((appointment, index) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium mt-2">{appointment.time}</span>
                    {index < appointments.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.service}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {appointment.patient}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment.room}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Profissional</p>
                        <p className="text-muted-foreground">{appointment.professional}</p>
                      </div>
                      <div>
                        <p className="font-medium">Duração</p>
                        <p className="text-muted-foreground">{appointment.duration} minutos</p>
                      </div>
                      <div>
                        <p className="font-medium">Horário</p>
                        <p className="text-muted-foreground">
                          {appointment.time} - {
                            new Date(
                              new Date(`2024-01-01 ${appointment.time}`).getTime() + 
                              appointment.duration * 60000
                            ).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        Reagendar
                      </Button>
                      {appointment.status === 'pending' && (
                        <Button size="sm">
                          Confirmar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma consulta hoje</h3>
            <p className="text-muted-foreground text-center mb-6">
              Você não tem consultas agendadas para hoje.
            </p>
            <Button>
              Agendar Nova Consulta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}