
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, UserIcon, DollarSignIcon } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import type { 
  CreateAgendamentoData, 
  AgendamentoSimplificado
} from '@/hooks/useAppointments';

interface AppointmentFormProps {
  appointment?: AgendamentoSimplificado;
  onSubmit: (data: CreateAgendamentoData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { patients, loading: patientsLoading } = usePatients();

  // Form state
  const [formData, setFormData] = useState<CreateAgendamentoData>({
    paciente_id: '',
    servico_id: '',
    profissional_id: '',
    data_hora: '',
    duracao: 60,
    status: 'agendado',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with appointment data if editing
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.data_hora);
      const dateString = appointmentDate.toISOString().split('T')[0];
      const timeString = appointmentDate.toTimeString().split(' ')[0].substring(0, 5);
      
      setFormData({
        paciente_id: appointment.paciente_id || '',
        servico_id: appointment.servico_id || '',
        profissional_id: appointment.profissional_id || '',
        data_hora: `${dateString}T${timeString}`,
        duracao: appointment.duracao || 60,
        status: appointment.status || 'agendado',
        observacoes: appointment.observacoes || ''
      });
    }
  }, [appointment]);

  const handleInputChange = (field: keyof CreateAgendamentoData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente_id) newErrors.paciente_id = 'Paciente é obrigatório';
    if (!formData.data_hora) newErrors.data_hora = 'Data e horário são obrigatórios';

    // Check for past dates
    const appointmentDate = new Date(formData.data_hora);
    const now = new Date();
    if (appointmentDate < now) {
      newErrors.data_hora = 'Não é possível agendar para datas passadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.paciente_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do Agendamento */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              Dados do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select 
                value={formData.paciente_id} 
                onValueChange={(value) => handleInputChange('paciente_id', value)}
              >
                <SelectTrigger className={errors.paciente_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nome} {patient.telefone ? `- ${patient.telefone}` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.paciente_id && <p className="text-sm text-red-600">{errors.paciente_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_hora">Data e Horário *</Label>
              <Input
                id="data_hora"
                type="datetime-local"
                value={formData.data_hora}
                onChange={(e) => handleInputChange('data_hora', e.target.value)}
                className={errors.data_hora ? 'border-red-500' : ''}
              />
              {errors.data_hora && <p className="text-sm text-red-600">{errors.data_hora}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => handleInputChange('duracao', parseInt(e.target.value) || 60)}
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações sobre o agendamento..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Info Display */}
      {selectedPatient && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-900 mb-2">Informações do Paciente</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Nome:</span> {selectedPatient.nome}
              </div>
              {selectedPatient.telefone && (
                <div>
                  <span className="font-medium">Telefone:</span> {selectedPatient.telefone}
                </div>
              )}
              {selectedPatient.email && (
                <div>
                  <span className="font-medium">Email:</span> {selectedPatient.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : appointment ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
