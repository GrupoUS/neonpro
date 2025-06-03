import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Plus, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';
import { CreateAgendamentoData } from '@/types/appointment';

const Agendamentos: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { appointments, loading, createAppointment, deleteAppointment } = useAppointments();
  
  // Filtrar agendamentos para hoje
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.data_agendamento).toISOString().split('T')[0] === today
  );
  
  const handleCreateAppointment = async (data: CreateAgendamentoData) => {
    try {
      await createAppointment(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie consultas e procedimentos da clínica
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {new Date().toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                }).replace(/^\w/, c => c.toUpperCase())}
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                }).replace(/^\w/, c => c.toUpperCase())}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Hoje
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Consultas de Hoje</CardTitle>
              <CardDescription>
                {todayAppointments.length} consultas agendadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList
                selectedDate={new Date()}
              />
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.filter(apt => apt.status === 'confirmado').length} confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((todayAppointments.length / 8) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.length} de 8 horários ocupados
              </p>
            </CardContent>
          </Card>

          {todayAppointments.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Próxima Consulta
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {todayAppointments[0]?.paciente?.nome || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayAppointments[0]?.hora_inicio} - {todayAppointments[0]?.tipo_consulta}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
};

export default Agendamentos;
