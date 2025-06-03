import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  User, 
  Phone,
  Edit,
  Trash2,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento, StatusAgendamento, getTipoConsultaLabel, getStatusLabel } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import AppointmentForm from './AppointmentForm';
import { toast } from 'sonner';

interface AppointmentListProps {
  selectedDate?: Date;
  onAppointmentSelect?: (appointment: Agendamento) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  selectedDate = new Date(),
  onAppointmentSelect 
}) => {
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Agendamento | null>(null);

  // Filtrar agendamentos por data selecionada e termo de busca
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.data_agendamento);
    const isSameDay = appointmentDate.toDateString() === selectedDate.toDateString();
    
    const matchesSearch = searchTerm === '' || 
      appointment.paciente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoConsultaLabel(appointment.tipo_consulta).toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());

    return isSameDay && matchesSearch;
  });

  // Ordenar por horário
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  const getStatusIcon = (status: StatusAgendamento) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'agendado':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'faltou':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: StatusAgendamento) => {
    switch (status) {
      case 'confirmado':
        return 'default' as const;
      case 'agendado':
        return 'secondary' as const;
      case 'cancelado':
        return 'destructive' as const;
      case 'concluido':
        return 'outline' as const;
      case 'em_andamento':
        return 'default' as const;
      case 'faltou':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleEdit = (appointment: Agendamento) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleDelete = async (appointment: Agendamento) => {
    try {
      await deleteAppointment(appointment.id);
      toast.success('Agendamento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    } finally {
      setAppointmentToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos - {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {sortedAppointments.length} agendamentos para este dia
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente ou procedimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedAppointment(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedAppointment 
                        ? 'Edite as informações do agendamento' 
                        : 'Preencha as informações para criar um novo agendamento'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <AppointmentForm
                    appointment={selectedAppointment || undefined}
                    onSubmit={async () => {
                      handleFormClose();
                    }}
                    onCancel={handleFormClose}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum agendamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Nenhum agendamento encontrado para este filtro.' : 'Não há agendamentos para este dia.'}
              </p>
              <div className="mt-4">
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Agendamento
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onAppointmentSelect?.(appointment)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{appointment.hora_inicio.substring(0, 5)}</span>
                      {appointment.hora_fim && (
                        <span className="text-xs text-muted-foreground">até {appointment.hora_fim.substring(0, 5)}</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{appointment.paciente?.nome || 'Sem nome'}</span>
                      </div>
                      {appointment.paciente?.telefone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{appointment.paciente.telefone}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground truncate">{getTipoConsultaLabel(appointment.tipo_consulta)}</p>
                      {appointment.observacoes && (
                        <p className="text-xs text-muted-foreground truncate">{appointment.observacoes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(appointment);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAppointmentToDelete(appointment);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento de{' '}
              <strong>{appointmentToDelete?.paciente?.nome}</strong> para{' '}
              <strong>{appointmentToDelete?.hora_inicio.substring(0, 5)}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appointmentToDelete && handleDelete(appointmentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentList;
