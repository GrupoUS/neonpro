
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
import { CreateAgendamentoData } from '@/hooks/useAppointments';

const Agendamentos: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { agendamentos, isLoading, createAgendamento, deleteAgendamento } = useAppointments();
  
  // Filtrar agendamentos para hoje
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = agendamentos.filter(apt => {
    const appointmentDate = new Date(apt.data_hora).toISOString().split('T')[0];
    return appointmentDate === today;
  });
  
  const handleCreateAppointment = async (data: CreateAgendamentoData) => {
    try {
      await createAgendamento(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAgendamento(id);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-accent" />
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neon-brand">Agendamentos</h1>
          <p className="text-neon-subtitle mt-1">
            Gerencie consultas e procedimentos da clínica
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="btn-neon-gradient mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card className="card-neon-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">
                {new Date().toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                }).replace(/^\w/, c => c.toUpperCase())}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                }).replace(/^\w/, c => c.toUpperCase())}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hover:shadow-neon/20">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="btn-neon-outline">
                Hoje
              </Button>
              <Button variant="outline" size="sm" className="hover:shadow-neon/20">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="card-neon">
            <CardHeader>
              <CardTitle className="text-foreground">Consultas de Hoje</CardTitle>
              <CardDescription className="text-muted-foreground">
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
          <Card className="card-neon-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Consultas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-brand">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.filter(apt => apt.status === 'confirmado').length} confirmadas
              </p>
            </CardContent>
          </Card>

          <Card className="card-neon-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Taxa de Ocupação
              </CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-brand">
                {Math.round((todayAppointments.length / 8) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {todayAppointments.length} de 8 horários ocupados
              </p>
            </CardContent>
          </Card>

          {todayAppointments.length > 0 && (
            <Card className="card-neon-interactive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Próxima Consulta
                </CardTitle>
                <User className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-foreground">
                  Próximo paciente
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(todayAppointments[0]?.data_hora).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Novo Agendamento</h2>
            <AppointmentForm
              onSubmit={handleCreateAppointment}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendamentos;
