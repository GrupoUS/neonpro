// components/dashboard/appointments/sidebar/appointment-details.tsx
// Read-only appointment details component
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  User, 
  UserCheck, 
  FileText, 
  Phone,
  Mail,
  Trash2,
  MapPin,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentWithDetails } from '@/app/lib/types/appointments';

// Status configuration with colors and labels
const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-500', variant: 'default' as const },
  confirmed: { label: 'Confirmado', color: 'bg-green-500', variant: 'default' as const },
  in_progress: { label: 'Em Andamento', color: 'bg-yellow-500', variant: 'secondary' as const },
  completed: { label: 'Concluído', color: 'bg-emerald-500', variant: 'default' as const },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', variant: 'destructive' as const },
  no_show: { label: 'Não Compareceu', color: 'bg-gray-500', variant: 'secondary' as const }
};

interface AppointmentDetailsProps {
  appointment: AppointmentWithDetails;
  onDelete?: (reason: string) => void;
}

export default function AppointmentDetails({ 
  appointment, 
  onDelete 
}: AppointmentDetailsProps) {
  const [deleteReason, setDeleteReason] = useState('');  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(deleteReason || 'Cancelado pelo usuário');
    }
  };

  const status = statusConfig[appointment.status] || statusConfig.scheduled;

  return (
    <div className="space-y-6">
      {/* Status and Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Informações Gerais</CardTitle>
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Data e Horário</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(appointment.start_time)}
              </p>
            </div>
          </div>          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Duração</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(appointment.service_duration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Clínica</p>
              <p className="text-sm text-muted-foreground">
                {appointment.clinic_name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{appointment.patient_name}</p>
          </div>
          
          {appointment.patient_email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {appointment.patient_email}
              </p>
            </div>
          )}
          
          {appointment.patient_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {appointment.patient_phone}
              </p>
            </div>
          )}
        </CardContent>
      </Card>      {/* Professional Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{appointment.professional_name}</p>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{appointment.service_name}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDuration(appointment.service_duration)}
              </span>
            </div>
            
            {appointment.service_price && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatPrice(appointment.service_price)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: appointment.service_color }}
            />
            <span className="text-sm text-muted-foreground">
              Cor do serviço
            </span>
          </div>
        </CardContent>
      </Card>      {/* Notes */}
      {(appointment.notes || appointment.internal_notes) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.notes && (
              <div>
                <Label className="text-sm font-medium">Observações do Cliente</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {appointment.notes}
                </p>
              </div>
            )}
            
            {appointment.internal_notes && (
              <div>
                <Label className="text-sm font-medium">Observações Internas</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {appointment.internal_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600">Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar Agendamento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O agendamento será cancelado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delete-reason">Motivo do cancelamento</Label>
                    <Textarea
                      id="delete-reason"
                      placeholder="Informe o motivo do cancelamento..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
