import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, UserIcon, DollarSignIcon } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import useAppointments from '@/hooks/useAppointments';
import type { 
  CreateAgendamentoData, 
  UpdateAgendamentoData, 
  Agendamento
} from '@/types/appointment';
import {
  TIPOS_CONSULTA_OPTIONS,
  STATUS_AGENDAMENTO_OPTIONS,
  FORMAS_PAGAMENTO_OPTIONS
} from '@/types/appointment';

interface AppointmentFormProps {
  appointment?: Agendamento;
  onSubmit: (data: CreateAgendamentoData | UpdateAgendamentoData) => Promise<void>;
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
  const { checkTimeConflict } = useAppointments();

  // Form state
  const [formData, setFormData] = useState<CreateAgendamentoData>({
    paciente_id: '',
    medico_nome: '',
    medico_especialidade: '',
    data_agendamento: '',
    hora_inicio: '',
    hora_fim: '',
    tipo_consulta: 'consulta',
    status: 'agendado',
    observacoes: '',
    valor_consulta: 0,
    forma_pagamento: 'dinheiro',
    convenio_nome: '',
    numero_carteirinha: '',
    sala: '',
    telefone_contato: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeConflict, setTimeConflict] = useState(false);

  // Initialize form with appointment data if editing
  useEffect(() => {
    if (appointment) {
      setFormData({
        paciente_id: appointment.paciente_id,
        medico_nome: appointment.medico_nome,
        medico_especialidade: appointment.medico_especialidade || '',
        data_agendamento: appointment.data_agendamento,
        hora_inicio: appointment.hora_inicio.substring(0, 5), // Remove seconds
        hora_fim: appointment.hora_fim.substring(0, 5), // Remove seconds
        tipo_consulta: appointment.tipo_consulta,
        status: appointment.status,
        observacoes: appointment.observacoes || '',
        valor_consulta: appointment.valor_consulta || 0,
        forma_pagamento: appointment.forma_pagamento || 'dinheiro',
        convenio_nome: appointment.convenio_nome || '',
        numero_carteirinha: appointment.numero_carteirinha || '',
        sala: appointment.sala || '',
        telefone_contato: appointment.telefone_contato || ''
      });
    }
  }, [appointment]);

  // Check for time conflicts when date/time changes
  useEffect(() => {
    if (formData.data_agendamento && formData.hora_inicio && formData.hora_fim) {
      const hasConflict = checkTimeConflict(
        formData.data_agendamento,
        formData.hora_inicio + ':00',
        formData.hora_fim + ':00',
        appointment?.id
      );
      setTimeConflict(hasConflict);
    }
  }, [formData.data_agendamento, formData.hora_inicio, formData.hora_fim, checkTimeConflict, appointment?.id]);

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
    if (!formData.medico_nome) newErrors.medico_nome = 'Nome do médico é obrigatório';
    if (!formData.data_agendamento) newErrors.data_agendamento = 'Data é obrigatória';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Horário de início é obrigatório';
    if (!formData.hora_fim) newErrors.hora_fim = 'Horário de fim é obrigatório';

    // Validate time logic
    if (formData.hora_inicio && formData.hora_fim) {
      if (formData.hora_inicio >= formData.hora_fim) {
        newErrors.hora_fim = 'Horário de fim deve ser posterior ao de início';
      }
    }

    // Check for past dates
    const appointmentDate = new Date(formData.data_agendamento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      newErrors.data_agendamento = 'Não é possível agendar para datas passadas';
    }

    // Time conflict check
    if (timeConflict) {
      newErrors.hora_inicio = 'Conflito de horário detectado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        hora_inicio: formData.hora_inicio + ':00', // Add seconds
        hora_fim: formData.hora_fim + ':00', // Add seconds
        valor_consulta: formData.valor_consulta || undefined
      };

      if (appointment) {
        await onSubmit({ ...submitData, id: appointment.id } as UpdateAgendamentoData);
      } else {
        await onSubmit(submitData);
      }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_agendamento">Data *</Label>
                <Input
                  id="data_agendamento"
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => handleInputChange('data_agendamento', e.target.value)}
                  className={errors.data_agendamento ? 'border-red-500' : ''}
                />
                {errors.data_agendamento && <p className="text-sm text-red-600">{errors.data_agendamento}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_consulta">Tipo de Consulta</Label>
                <Select 
                  value={formData.tipo_consulta} 
                  onValueChange={(value) => handleInputChange('tipo_consulta', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONSULTA_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Horário Início *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                  className={errors.hora_inicio ? 'border-red-500' : ''}
                />
                {errors.hora_inicio && <p className="text-sm text-red-600">{errors.hora_inicio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fim">Horário Fim *</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => handleInputChange('hora_fim', e.target.value)}
                  className={errors.hora_fim ? 'border-red-500' : ''}
                />
                {errors.hora_fim && <p className="text-sm text-red-600">{errors.hora_fim}</p>}
              </div>
            </div>

            {timeConflict && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">
                  ⚠️ Conflito de horário detectado! Já existe um agendamento neste período.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {STATUS_AGENDAMENTO_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sala">Sala</Label>
                <Input
                  id="sala"
                  value={formData.sala}
                  onChange={(e) => handleInputChange('sala', e.target.value)}
                  placeholder="Ex: Sala 1, Consultório A"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Médico */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="h-5 w-5" />
              Dados do Médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medico_nome">Nome do Médico *</Label>
              <Input
                id="medico_nome"
                value={formData.medico_nome}
                onChange={(e) => handleInputChange('medico_nome', e.target.value)}
                placeholder="Dr. João Silva"
                className={errors.medico_nome ? 'border-red-500' : ''}
              />
              {errors.medico_nome && <p className="text-sm text-red-600">{errors.medico_nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico_especialidade">Especialidade</Label>
              <Input
                id="medico_especialidade"
                value={formData.medico_especialidade}
                onChange={(e) => handleInputChange('medico_especialidade', e.target.value)}
                placeholder="Ex: Cardiologia, Dermatologia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone_contato">Telefone de Contato</Label>
              <Input
                id="telefone_contato"
                value={formData.telefone_contato}
                onChange={(e) => handleInputChange('telefone_contato', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Financeiros e Observações */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSignIcon className="h-5 w-5" />
            Dados Financeiros e Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_consulta">Valor da Consulta</Label>
              <Input
                id="valor_consulta"
                type="number"
                step="0.01"
                value={formData.valor_consulta}
                onChange={(e) => handleInputChange('valor_consulta', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select 
                value={formData.forma_pagamento} 
                onValueChange={(value) => handleInputChange('forma_pagamento', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="convenio_nome">Convênio</Label>
              <Input
                id="convenio_nome"
                value={formData.convenio_nome}
                onChange={(e) => handleInputChange('convenio_nome', e.target.value)}
                placeholder="Nome do convênio"
              />
            </div>
          </div>

          {formData.convenio_nome && (
            <div className="space-y-2">
              <Label htmlFor="numero_carteirinha">Número da Carteirinha</Label>
              <Input
                id="numero_carteirinha"
                value={formData.numero_carteirinha}
                onChange={(e) => handleInputChange('numero_carteirinha', e.target.value)}
                placeholder="000000000000"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre a consulta..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

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
          disabled={isLoading || timeConflict}
        >
          {isLoading ? 'Salvando...' : appointment ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
