/**
 * 🔗 Integration Example - NeonPro Healthcare
 * ===========================================
 * 
 * Exemplo prático da integração Frontend-Backend + Hono.dev Stack
 * demonstrando o uso dos hooks TanStack Query com Hono RPC.
 */

'use client';

import { useState } from 'react';
import { 
  useLogin, 
  useProfile, 
  useAuthStatus,
  usePatients,
  useCreatePatient,
  useAppointments,
  useCreateAppointment 
} from '@/hooks/api';
import type { 
  Login, 
  CreatePatient, 
  CreateAppointment 
} from '@neonpro/shared/schemas';

export function IntegrationExample() {
  const [loginData, setLoginData] = useState<Login>({
    email: 'admin@neonpro.com',
    password: 'Admin123!'
  });

  // Auth hooks
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStatus();
  const loginMutation = useLogin();
  const { data: profile, refetch: refetchProfile } = useProfile();

  // Patient hooks
  const { 
    data: patients, 
    isLoading: patientsLoading, 
    error: patientsError 
  } = usePatients({ page: 1, limit: 5 });
  const createPatientMutation = useCreatePatient();

  // Appointment hooks
  const { 
    data: appointments, 
    isLoading: appointmentsLoading 
  } = useAppointments({ page: 1, limit: 3 });
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
        zipCode: '01234567'
      },
      allergies: ['Nenhuma conhecida'],
      chronicConditions: [],
      currentMedications: [],
      consentGiven: true,
      dataProcessingConsent: true,
      marketingConsent: false
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
      estimatedCost: 150.00
    };

    try {
      await createAppointmentMutation.mutateAsync(testAppointment);
    } catch (error) {
      console.error('Create appointment failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🔗 Integração Frontend-Backend + Hono.dev Stack
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Status da Implementação</h2>
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

        {!isAuthenticated ? (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">
              🔐 Autenticação
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={loginMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loginMutation.isPending ? 'Entrando...' : 'Fazer Login'}
              </button>
              
              {loginMutation.error && (
                <p className="text-red-600 text-sm">{loginMutation.error.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                ✅ Autenticado com sucesso!
              </h2>
              <div className="text-green-800">
                <p><strong>Usuário:</strong> {user?.fullName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Papel:</strong> {user?.role}</p>
                <p><strong>Permissões:</strong> {user?.permissions?.join(', ') || 'Nenhuma'}</p>
              </div>
            </div>

            {/* Patients Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  🩺 Pacientes ({patients?.meta?.total || 0})
                </h2>
                <button
                  onClick={handleCreateTestPatient}
                  disabled={createPatientMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {createPatientMutation.isPending ? 'Criando...' : 'Criar Paciente Teste'}
                </button>
              </div>
              
              {patientsLoading ? (
                <p>Carregando pacientes...</p>
              ) : patientsError ? (
                <p className="text-red-600">Erro: {patientsError.message}</p>
              ) : patients?.data && patients.data.length > 0 ? (
                <div className="space-y-2">
                  {patients.data.map((patient) => (
                    <div key={patient.id} className="bg-white p-3 rounded border">
                      <p><strong>{patient.fullName}</strong></p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-xs text-gray-500">ID: {patient.id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum paciente encontrado.</p>
              )}
              
              {createPatientMutation.error && (
                <p className="text-red-600 text-sm mt-2">
                  Erro ao criar paciente: {createPatientMutation.error.message}
                </p>
              )}
            </div>

            {/* Appointments Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📅 Agendamentos ({appointments?.meta?.total || 0})
                </h2>
                <button
                  onClick={handleCreateTestAppointment}
                  disabled={createAppointmentMutation.isPending || !patients?.data?.[0]}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createAppointmentMutation.isPending ? 'Agendando...' : 'Criar Agendamento'}
                </button>
              </div>
              
              {appointmentsLoading ? (
                <p>Carregando agendamentos...</p>
              ) : appointments?.data && appointments.data.length > 0 ? (
                <div className="space-y-2">
                  {appointments.data.map((appointment) => (
                    <div key={appointment.id} className="bg-white p-3 rounded border">
                      <p><strong>{appointment.title}</strong></p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.scheduledAt).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {appointment.status} | Tipo: {appointment.type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum agendamento encontrado.</p>
              )}
              
              {createAppointmentMutation.error && (
                <p className="text-red-600 text-sm mt-2">
                  Erro ao criar agendamento: {createAppointmentMutation.error.message}
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
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
        )}
      </div>
    </div>
  );
}