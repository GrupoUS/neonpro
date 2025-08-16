'use client';

import { Activity, Calendar, Clock, FileText, Heart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Appointment {
  id: string;
  date: string;
  time: string;
  procedure: string;
  doctor: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface PatientDashboardProps {
  patient?: {
    name: string;
    email: string;
    phone: string;
    nextAppointment?: Appointment;
  };
  appointments?: Appointment[];
  className?: string;
}

export function PatientDashboard({
  patient,
  appointments = [],
  className,
}: PatientDashboardProps) {
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled',
  );
  const recentAppointments = appointments
    .filter((apt) => apt.status === 'completed')
    .slice(0, 3);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Bem-vindo, {patient?.name || 'Paciente'}
          </CardTitle>
          <CardDescription>
            Gerencie seus agendamentos e acompanhe seu histórico médico
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Próximos Agendamentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {recentAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Consultas Realizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">Ativo</p>
                <p className="text-sm text-muted-foreground">Status do Plano</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment */}
      {patient?.nextAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximo Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {patient.nextAppointment.procedure}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dr. {patient.nextAppointment.doctor}
                </p>
                <p className="text-sm">
                  {patient.nextAppointment.date} às{' '}
                  {patient.nextAppointment.time}
                </p>
              </div>
              <Badge variant="outline">
                {patient.nextAppointment.status === 'scheduled'
                  ? 'Agendado'
                  : patient.nextAppointment.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{appointment.procedure}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.date} - Dr. {appointment.doctor}
                    </p>
                  </div>
                  <Badge variant="secondary">Concluído</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum histórico disponível
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Ver Histórico Completo
            </Button>
            <Button variant="outline" className="justify-start">
              <User className="mr-2 h-4 w-4" />
              Atualizar Perfil
            </Button>
            <Button variant="outline" className="justify-start">
              <Heart className="mr-2 h-4 w-4" />
              Planos de Saúde
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientDashboard;
