/**
 * 🔗 Integration Example - NeonPro Healthcare
 * ===========================================
 *
 * Exemplo prático da integração Frontend-Backend + Hono.dev Stack
 * demonstrando o uso dos hooks TanStack Query com Hono RPC.
 */

'use client';

import type {
  CreateAppointment,
  CreatePatient,
  Login,
} from '@neonpro/shared/schemas';
import { useState } from 'react';
import {
  useAppointments,
  useAuthStatus,
  useCreateAppointment,
  useCreatePatient,
  useLogin,
  usePatients,
  useProfile,
} from '@/hooks/api';

export function IntegrationExample() {
  const [loginData, setLoginData] = useState<Login>({
    email: 'admin@neonpro.com',
    password: 'Admin123!',
  });

  // Auth hooks
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStatus();
  const loginMutation = useLogin();
  const { data: profile, refetch: refetchProfile } = useProfile();

  // Patient hooks
  const {
    data: patients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients({ page: 1, limit: 5 });
  const createPatientMutation = useCreatePatient();

  // Appointment hooks
  const { data: appointments, isLoading: appointmentsLoading } =
    useAppointments({ page: 1, limit: 3 });
  const createAppointmentMutation = useCreateAppointment();

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync(loginData);
      refetchProfile();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreateTestPatient = async () => {
    const testPatient: CreatePatient = {
      fullName: 'Ana Silva Santos',
      email: 'ana.silva@email.com',
      phone: '11987654321',
      cpf: '12345678901',
      birthDate: '1985-06-15',
      gender: 'female',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      allergies: ['Nenhuma conhecida'],
      chronicConditions: [],
      currentMedications: [],
      consentGiven: true,
      dataProcessingConsent: true,
      marketingConsent: false,
    };

    try {
      await createPatientMutation.mutateAsync(testPatient);
    } catch (error) {
      console.error('Create patient failed:', error);
    }
  };

  const handleCreateTestAppointment = async () => {
    if (!patients?.data?.[0]) {
      alert('Crie um paciente primeiro!');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow

    const testAppointment: CreateAppointment = {
      patientId: patients.data[0].id,
      professionalId: '550e8400-e29b-41d4-a716-446655440002', // Mock professional ID
      clinicId: '550e8400-e29b-41d4-a716-446655440003', // Mock clinic ID
      scheduledAt: tomorrow.toISOString(),
      duration: 60,
      type: 'consultation',
      priority: 'normal',
      title: 'Consulta de Avaliação Estética',
      description: 'Primeira consulta para avaliação de tratamentos faciais',
      treatmentArea: 'Face',
      estimatedCost: 150.0,
    };

    try {
      await createAppointmentMutation.mutateAsync(testAppointment);
    } catch (error) {
      console.error('Create appointment failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
          <p className="mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 font-bold text-2xl text-gray-900">
          🔗 Integração Frontend-Backend + Hono.dev Stack
        </h1>

        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h2 className="mb-2 font-semibold text-blue-900 text-lg">
            Status da Implementação
          </h2>
          <ul className="space-y-1 text-blue-800">
            <li>✅ Package @neonpro/shared criado</li>
            <li>✅ Schemas Zod compartilhados</li>
            <li>✅ Tipos TypeScript base</li>
            <li>✅ Hono RPC configurado no backend</li>
            <li>✅ API Client type-safe</li>
            <li>✅ Hooks TanStack Query customizados</li>
            <li>✅ Integração completa funcionando</li>
          </ul>
        </div>

        {isAuthenticated ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4">
              <h2 className="mb-2 font-semibold text-green-900 text-lg">
                ✅ Autenticado com sucesso!
              </h2>
              <div className="text-green-800">
                <p>
                  <strong>Usuário:</strong> {user?.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Papel:</strong> {user?.role}
                </p>
                <p>
                  <strong>Permissões:</strong>{' '}
                  {user?.permissions?.join(', ') || 'Nenhuma'}
                </p>
              </div>
            </div>

            {/* Patients Section */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-lg">
                  🩺 Pacientes ({patients?.meta?.total || 0})
                </h2>
                <button
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={createPatientMutation.isPending}
                  onClick={handleCreateTestPatient}
                >
                  {createPatientMutation.isPending
                    ? 'Criando...'
                    : 'Criar Paciente Teste'}
                </button>
              </div>

              {patientsLoading ? (
                <p>Carregando pacientes...</p>
              ) : patientsError ? (
                <p className="text-red-600">Erro: {patientsError.message}</p>
              ) : patients?.data && patients.data.length > 0 ? (
                <div className="space-y-2">
                  {patients.data.map((patient) => (
                    <div
                      className="rounded border bg-white p-3"
                      key={patient.id}
                    >
                      <p>
                        <strong>{patient.fullName}</strong>
                      </p>
                      <p className="text-gray-600 text-sm">{patient.email}</p>
                      <p className="text-gray-500 text-xs">ID: {patient.id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum paciente encontrado.</p>
              )}

              {createPatientMutation.error && (
                <p className="mt-2 text-red-600 text-sm">
                  Erro ao criar paciente: {createPatientMutation.error.message}
                </p>
              )}
            </div>

            {/* Appointments Section */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-lg">
                  📅 Agendamentos ({appointments?.meta?.total || 0})
                </h2>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    createAppointmentMutation.isPending || !patients?.data?.[0]
                  }
                  onClick={handleCreateTestAppointment}
                >
                  {createAppointmentMutation.isPending
                    ? 'Agendando...'
                    : 'Criar Agendamento'}
                </button>
              </div>

              {appointmentsLoading ? (
                <p>Carregando agendamentos...</p>
              ) : appointments?.data && appointments.data.length > 0 ? (
                <div className="space-y-2">
                  {appointments.data.map((appointment) => (
                    <div
                      className="rounded border bg-white p-3"
                      key={appointment.id}
                    >
                      <p>
                        <strong>{appointment.title}</strong>
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(appointment.scheduledAt).toLocaleString(
                          'pt-BR'
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Status: {appointment.status} | Tipo: {appointment.type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum agendamento encontrado.</p>
              )}

              {createAppointmentMutation.error && (
                <p className="mt-2 text-red-600 text-sm">
                  Erro ao criar agendamento:{' '}
                  {createAppointmentMutation.error.message}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h2 className="mb-2 font-semibold text-blue-900 text-lg">
                🎯 Próximos Passos
              </h2>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Implementar autenticação real com Supabase</li>
                <li>• Adicionar middleware de autorização</li>
                <li>• Criar fluxos completos de CRUD</li>
                <li>• Implementar real-time updates</li>
                <li>• Adicionar validação LGPD/ANVISA</li>
                <li>• Otimizar performance com caching</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-yellow-50 p-4">
            <h2 className="mb-4 font-semibold text-lg text-yellow-900">
              🔐 Autenticação
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Email
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  type="email"
                  value={loginData.email}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Senha
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  type="password"
                  value={loginData.password}
                />
              </div>

              <button
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={loginMutation.isPending}
                onClick={handleLogin}
              >
                {loginMutation.isPending ? 'Entrando...' : 'Fazer Login'}
              </button>

              {loginMutation.error && (
                <p className="text-red-600 text-sm">
                  {loginMutation.error.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
