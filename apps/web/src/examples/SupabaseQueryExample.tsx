import { AppointmentLink } from '@/components/common/SmartPrefetcher';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { invalidateAppointmentData, invalidatePatientData } from '@/lib/cache/cache-utils';
import { supabase } from '@/lib/supabase';
import { appointmentsQueryOptions } from '@/queries/appointments';
import { patientsQueryOptions } from '@/queries/patients';
import type { Appointment } from '@neonpro/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

/**
 * Exemplo completo de integração TanStack Query + Supabase + Real-time
 *
 * Este componente demonstra todas as features implementadas:
 * - Query options type-safe
 * - Real-time subscriptions
 * - Prefetching inteligente
 * - Cache e invalidação otimizados
 * - Links com prefetching
 */
export function SupabaseQueryExample() {
  const queryClient = useQueryClient();

  // Hook personalizado para Supabase (com real-time)
  const {
    data: patients,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useSupabaseQuery(
    patientsQueryOptions({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
  );

  // Query tradicional para agendamentos
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useQuery(
    appointmentsQueryOptions({
      page: 1,
      pageSize: 5,
      sortBy: 'scheduled_at',
      sortOrder: 'asc',
    }),
  );

  // Mutation para atualizar paciente
  const updatePatientMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Patient>;
    }) => {
      const { data: updatedPatient, error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedPatient;
    },
    onSuccess: updatedPatient => {
      // Invalidar cache do paciente (automaticamente atualiza todas as queries relacionadas)
      invalidatePatientData(updatedPatient.id);

      // Atualizar manualmente a lista de pacientes
      queryClient.setQueryData(
        patientsQueryOptions().queryKey,
        (oldData: any) => ({
          ...oldData,
          patients: oldData?.patients?.map((p: Patient) =>
            p.id === updatedPatient.id ? updatedPatient : p
          ),
        }),
      );

      toast.success(`Paciente ${updatedPatient.name} atualizado com sucesso!`);
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao atualizar paciente: ${error.message}`);
    },
  });

  // Mutation para atualizar agendamento
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Appointment>;
    }) => {
      const { data: updatedAppointment, error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedAppointment;
    },
    onSuccess: updatedAppointment => {
      // Invalidar cache do agendamento
      invalidateAppointmentData(updatedAppointment.id);

      toast.success(`Agendamento atualizado com sucesso!`);
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    },
  });

  // Exemplo de prefetching manual
  const handlePatientHover = (_patientId: [a-zA-Z][a-zA-Z]*) => {
    queryClient.prefetchQuery(
      patientsQueryOptions({
        page: 1,
        pageSize: 10,
        search: patientId,
      }),
    );
  };

  // Atualizar status do paciente
  const handleUpdatePatientStatus = (patient: Patient, status: string) => {
    updatePatientMutation.mutate({
      id: patient.id,
      data: { status },
    });
  };

  // Atualizar status do agendamento
  const handleUpdateAppointmentStatus = (
    appointment: Appointment,
    status: string,
  ) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      data: { status },
    });
  };

  if (patientsLoading) return <div>Carregando pacientes...</div>;
  if (patientsError) {
    return <div>Erro ao carregar pacientes: {patientsError.message}</div>;
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>
          🚀 Exemplo de Integração TanStack Query + Supabase
        </h1>
        <p className='text-gray-600 mb-4'>
          Demonstração completa com real-time, prefetching, cache e invalidação otimizados
        </p>
      </div>

      {/* Seção de Pacientes */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-2xl font-semibold mb-4'>👥 Pacientes</h2>

        <div className='mb-4 flex gap-2'>
          <button
            onClick={() => refetchPatients()}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            🔄 Atualizar Lista
          </button>
          <button
            onClick={() => {
              // Exemplo de invalidação manual
              queryClient.invalidateQueries({ queryKey: ['patients'] });
              toast.info('Cache de pacientes invalidado!');
            }}
            className='px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600'
          >
            🗑️ Invalidar Cache
          </button>
        </div>

        <div className='space-y-3'>
          {patients?.patients?.map((patient: Patient) => (
            <div
              key={patient.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {/* Link com prefetching inteligente */}
                  <PatientLink
                    patient={patient}
                    includeRelated={true}
                    className='text-blue-600 hover:text-blue-800 font-medium'
                  >
                    {patient.name}
                  </PatientLink>

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      patient.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => handleUpdatePatientStatus(patient, 'active')}
                    className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                    disabled={updatePatientMutation.isPending}
                  >
                    Ativar
                  </button>
                  <button
                    onClick={() => handleUpdatePatientStatus(patient, 'inactive')}
                    className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600'
                    disabled={updatePatientMutation.isPending}
                  >
                    Inativar
                  </button>

                  {/* Hover prefetch */}
                  <div
                    onMouseEnter={() => handlePatientHover(patient.id)}
                    className='px-3 py-1 bg-gray-500 text-white rounded text-sm cursor-help'
                  >
                    ℹ️
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Agendamentos */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-2xl font-semibold mb-4'>📅 Agendamentos</h2>

        {appointmentsLoading
          ? <div>Carregando agendamentos...</div>
          : appointmentsError
          ? <div>Erro ao carregar agendamentos: {appointmentsError.message}</div>
          : (
            <div className='space-y-3'>
              {appointments?.appointments?.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      {/* Link com prefetching inteligente */}
                      <AppointmentLink
                        appointment={appointment}
                        includeRelated={true}
                        className='text-blue-600 hover:text-blue-800 font-medium'
                      >
                        Agendamento {appointment.id.slice(0, 8)}
                      </AppointmentLink>

                      <span className='text-sm text-gray-600'>
                        {new Date(appointment.scheduled_at).toLocaleString(
                          'pt-BR',
                        )}
                      </span>

                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment, 'completed')}
                        className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                        disabled={updateAppointmentMutation.isPending}
                      >
                        Concluir
                      </button>
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment, 'cancelled')}
                        className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600'
                        disabled={updateAppointmentMutation.isPending}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Exemplo de Prefetching com Componente Smart */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-2xl font-semibold mb-4'>
          🎯 Prefetching Inteligente
        </h2>

        <div className='space-y-4'>
          <SmartPrefetcher
            type='patients-list'
            trigger='visible'
            delay={100}
            className='p-4 border-2 border-dashed border-gray-300 rounded-lg'
          >
            <p>
              Esta área irá fazer prefetch da lista de pacientes quando se tornar visível
            </p>
          </SmartPrefetcher>

          <SmartPrefetcher
            type='appointments-list'
            trigger='hover'
            delay={300}
            className='p-4 border-2 border-dashed border-blue-300 rounded-lg'
          >
            <p>Passe o mouse aqui para prefetch da lista de agendamentos</p>
          </SmartPrefetcher>

          <SmartPrefetcher
            type='dashboard'
            trigger='immediate'
            className='p-4 border-2 border-dashed border-green-300 rounded-lg'
          >
            <p>Dados do dashboard são pré-carregados imediatamente</p>
          </SmartPrefetcher>
        </div>
      </div>

      {/* Status do Cache */}
      <div className='bg-gray-50 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>📊 Status do Cache</h3>
        <div className='text-sm text-gray-600 space-y-1'>
          <p>• Total queries: {queryClient.getQueryCache().getAll().length}</p>
          <p>
            • Queries ativas: {queryClient
              .getQueryCache()
              .findAll()
              .filter(q => q.isActive()).length}
          </p>
          <p>• Real-time subscriptions: Ativas para pacientes e agendamentos</p>
          <p>• Cache persistence: Ativado para dados críticos</p>
        </div>
      </div>
    </div>
  );
}
