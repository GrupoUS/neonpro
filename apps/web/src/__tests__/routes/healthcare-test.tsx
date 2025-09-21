/**
 * Healthcare Integration Test Route
 * Tests the TanStack Query hooks with real Supabase data
 */

import {
  useCreateAppointment,
  usePatient,
  usePatientAppointments,
  useUpdatePatient,
} from '@/hooks/useHealthcareQuery';
import { Badge } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__tests/healthcare-test')({
  component: HealthcareTestComponent,
});

function HealthcareTestComponent() {
  // Test patient ID from the database
  const testPatientId = '74487444-9b01-48ed-8878-9485d11f01d4';
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Test healthcare hooks
  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
  } = usePatient(testPatientId);
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments(
    testPatientId,
  );
  const updatePatientMutation = useUpdatePatient();
  const createAppointmentMutation = useCreateAppointment();

  const handleUpdatePatient = async () => {
    setIsUpdating(true);
    try {
      await updatePatientMutation.mutateAsync({
        patientId: testPatientId,
        updates: {
          patient_notes: `Atualizado em ${
            new Date().toLocaleString(
              'pt-BR',
            )
          } - Teste de integração healthcare`,
        },
      });
      toast.success('Paciente atualizado com sucesso!');
    } catch (_error) {
      console.error('Erro ao atualizar paciente:', error);
      toast.error('Erro ao atualizar paciente');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateAppointment = async () => {
    setIsCreatingAppointment(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      await createAppointmentMutation.mutateAsync({
        patient_id: testPatientId,
        scheduled_at: tomorrow.toISOString(),
        procedure_type: 'Consulta de Teste',
        notes: 'Agendamento criado via teste de integração healthcare',
        priority: 'medium',
      });
      toast.success('Agendamento criado com sucesso!');
    } catch (_error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  if (patientLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'>
          </div>
          <p>Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (patientError) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='text-red-600'>
              Erro ao Carregar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-red-700'>{patientError.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>
          🏥 Teste de Integração Healthcare
        </h1>
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200'
        >
          ✅ Conectado ao Supabase
        </Badge>
      </div>

      {/* Patient Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {patient
            ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p>
                    <strong>Nome:</strong> {patient.full_name}
                  </p>
                  <p>
                    <strong>CPF:</strong> {patient.cpf || 'Não informado'}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {patient.phone_primary || 'Não informado'}
                  </p>
                  <p>
                    <strong>Email:</strong> {patient.email || 'Não informado'}
                  </p>
                  <p>
                    <strong>Data de Nascimento:</strong> {patient.birth_date || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Consentimento LGPD:</strong>
                    <Badge
                      variant={patient.lgpd_consent_given ? 'default' : 'destructive'}
                      className='ml-2'
                    >
                      {patient.lgpd_consent_given
                        ? '✅ Concedido'
                        : '❌ Não concedido'}
                    </Badge>
                  </p>
                  <p>
                    <strong>Status dos Dados:</strong>{' '}
                    {patient.data_consent_status || 'Não definido'}
                  </p>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <strong>Alergias:</strong>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {patient.allergies.map(
                          (allergy: string, index: number) => (
                            <Badge
                              key={index}
                              variant='destructive'
                              className='text-xs'
                            >
                              {allergy}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {patient.chronic_conditions
                    && patient.chronic_conditions.length > 0 && (
                    <div>
                      <strong>Condições Crônicas:</strong>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {patient.chronic_conditions.map(
                          (condition: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='text-xs'
                            >
                              {condition}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {patient.current_medications
                    && patient.current_medications.length > 0 && (
                    <div>
                      <strong>Medicamentos:</strong>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {patient.current_medications.map(
                          (medication: string, index: number) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'
                            >
                              {medication}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
            : <p className='text-gray-500'>Nenhum dado de paciente encontrado</p>}

          {patient?.patient_notes && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <strong>Observações:</strong>
              <p className='mt-1 text-gray-700'>{patient.patient_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Card */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Agendamentos do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsLoading
            ? <p className='text-gray-500'>Carregando agendamentos...</p>
            : appointments && appointments.length > 0
            ? (
              <div className='space-y-3'>
                {appointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className='border-l-4 border-blue-500 pl-4 py-2'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='font-semibold'>
                        {appointment.procedure_type}
                      </h4>
                      <Badge variant='outline'>
                        {new Date(appointment.scheduled_at).toLocaleString(
                          'pt-BR',
                        )}
                      </Badge>
                    </div>
                    <p className='text-gray-600 text-sm'>{appointment.notes}</p>
                    <p className='text-xs text-gray-500'>
                      Status: {appointment.status}
                    </p>
                  </div>
                ))}
              </div>
            )
            : <p className='text-gray-500'>Nenhum agendamento encontrado</p>}
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Ações de Teste</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={handleUpdatePatient}
              disabled={isUpdating || updatePatientMutation.isPending}
              variant='outline'
            >
              {isUpdating
                ? 'Atualizando...'
                : '📝 Atualizar Observações do Paciente'}
            </Button>

            <Button
              onClick={handleCreateAppointment}
              disabled={isCreatingAppointment || createAppointmentMutation.isPending}
              variant='outline'
            >
              {isCreatingAppointment
                ? 'Criando...'
                : '📅 Criar Agendamento de Teste'}
            </Button>
          </div>

          <div className='text-sm text-gray-600 space-y-1'>
            <p>
              • <strong>Atualizar Observações:</strong>{' '}
              Testa a mutação de atualização com logging LGPD
            </p>
            <p>
              • <strong>Criar Agendamento:</strong>{' '}
              Testa a criação de agendamento com validações healthcare
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LGPD Compliance Footer */}
      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <p className='text-xs text-gray-600 text-center'>
          🔒 Dados protegidos pela LGPD • Acesso registrado para auditoria • Teste de integração
          healthcare com Supabase • ID do Paciente: {testPatientId}
        </p>
      </div>
    </div>
  );
}
