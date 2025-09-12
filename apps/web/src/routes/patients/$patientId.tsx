/**
 * Patient Detail Route - Healthcare-specific TanStack Router implementation
 * Demonstrates type-safe navigation, data loading, and healthcare compliance patterns
 */

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PatientRiskCard } from '@neonpro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge, Button } from '@neonpro/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

// Type-safe search params schema
const patientSearchSchema = z.object({
  tab: z.enum(['overview', 'history', 'appointments', 'procedures']).optional().default('overview'),
  showRisk: z.boolean().optional().default(false),
});

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Healthcare-specific loader with LGPD compliance
async function loadPatientData(patientId: string, userRole: string) {
  // Audit log for data access
  await supabase.from('audit_logs').insert({
    action: 'patient_data_accessed',
    resource_type: 'patient',
    resource_id: patientId,
    user_id: userRole, // store who accessed in user_id or adapt schema
  });

  // Fetch patient data with RLS (Row Level Security)
  const { data: patient, error } = await supabase
    .from('patients')
    .select(`
      id,
      full_name,
      cpf,
      phone_primary,
      email,
      birth_date,
      created_at,
      updated_at,
      allergies,
      chronic_conditions,
      current_medications,
      patient_notes,
      lgpd_consent_given,
      data_consent_status
    `)
    .eq('id', patientId)
    .single();

  if (error) {
    throw new Error(`Failed to load patient data: ${error.message}`);
  }

  return patient;
}

// Route definition with healthcare-specific patterns
export const Route = createFileRoute('/patients/$patientId')({
  // Type-safe parameter validation
  params: {
    parse: params => patientParamsSchema.parse(params),
    stringify: params => params,
  },

  // Type-safe search parameter validation
  validateSearch: patientSearchSchema,

  // Healthcare-specific loader with dependencies
  loaderDeps: ({ search: { tab, showRisk } }) => ({ tab, showRisk }),

  loader: async ({ params: { patientId }, deps: { tab, showRisk } }) => {
    // Get user context for audit logging
    const { data: { user } } = await supabase.auth.getUser();
    const userRole = user?.user_metadata?.role || 'professional';

    // Load patient data with compliance logging
    const patientData = await loadPatientData(patientId, userRole);

    // Load additional data based on tab
    let additionalData = {};

    if (tab === 'history') {
      const { data: procedures } = await supabase
        .from('procedures')
        .select('*')
        .eq('patient_id', patientId)
        .order('performed_at', { ascending: false });

      additionalData = { procedures };
    }

    if (showRisk) {
      const mockRiskData = {
        score: 0.3,
        historical_no_shows: 2,
        factors: ['Histórico de faltas', 'Agendamento em horário de pico'],
        last_calculated: new Date().toISOString(),
      };

      additionalData = { ...additionalData, riskData: mockRiskData };
    }

    return {
      patient: patientData,
      ...additionalData,
    };
  },

  // Error boundary for healthcare data
  errorComponent: ({ error }) => (
    <div className='p-6 text-center'>
      <h2 className='text-xl font-semibold text-red-600 mb-2'>
        Erro ao Carregar Dados do Paciente
      </h2>
      <p className='text-gray-600 mb-4'>
        Não foi possível acessar os dados do paciente. Verifique suas permissões.
      </p>
      <p className='text-sm text-gray-500'>
        Erro: {error.message}
      </p>
    </div>
  ),

  // Loading component
  pendingComponent: () => (
    <div className='p-6 text-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'>
      </div>
      <p className='text-gray-600'>Carregando dados do paciente...</p>
    </div>
  ),

  component: PatientDetailComponent,
});

function PatientDetailComponent() {
  const { patientId } = Route.useParams();
  const { tab, showRisk } = Route.useSearch();
  const { patient, procedures, riskData } = Route.useLoaderData() as any;
  const navigate = useNavigate();
  const { user } = useAuth();

  // Type-safe navigation handlers
  const handleTabChange = (newTab: 'overview' | 'history' | 'appointments' | 'procedures') => {
    navigate({
      to: '/patients/$patientId',
      params: { patientId },
      search: { tab: newTab, showRisk },
    });
  };

  const handleRiskToggle = () => {
    navigate({
      to: '/patients/$patientId',
      params: { patientId },
      search: { tab, showRisk: !showRisk },
    });
  };

  const handleScheduleIntervention = (interventionType: string) => {
    // Navigate to scheduling with pre-filled data
    navigate({
      to: '/appointments',
      search: {
        fromPatientId: patientId,
        type: interventionType,
        priority: 'high',
      },
    });
  };

  const handleAuditLog = (action: string, details?: Record<string, any>) => {
    if (!user?.id) return;
    // Log healthcare actions for compliance
    supabase.from('audit_logs').insert({
      action,
      resource_type: 'patient',
      resource_id: patientId,
      user_id: user.id,
      details,
    });
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Patient Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {patient.full_name}
          </h1>
          <p className='text-gray-600'>
            Paciente ID: {patientId}
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant={showRisk ? 'default' : 'outline'}
            onClick={handleRiskToggle}
          >
            {showRisk ? 'Ocultar Risco' : 'Mostrar Risco'}
          </Button>

          <Button
            onClick={() =>
              navigate({
                to: '/patients/$patientId',
                params: { patientId },
                search: { tab: 'overview', showRisk },
              })}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Risk Assessment Card */}
      {showRisk && riskData && (
        <PatientRiskCard
          patient={{
            id: patient.id,
            name: patient.full_name,
            nextAppointment: '2024-01-15 14:00',
          }}
          riskScore={{
            score: riskData.score,
            historicalNoShows: riskData.historical_no_shows,
            factors: riskData.factors,
          }}
          onScheduleIntervention={handleScheduleIntervention}
          patientId={patientId}
          userRole={user?.user_metadata?.role || 'professional'}
          lgpdCompliant={true}
          onAuditLog={handleAuditLog}
        />
      )}

      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { key: 'overview', label: 'Visão Geral' },
            { key: 'history', label: 'Histórico' },
            { key: 'appointments', label: 'Agendamentos' },
            { key: 'procedures', label: 'Procedimentos' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='mt-6'>
        {tab === 'overview' && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
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
                <p>
                  <strong>Consentimento LGPD:</strong>{' '}
                  {patient.lgpd_consent_given ? '✅ Concedido' : '❌ Não concedido'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Médicas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <strong>Alergias:</strong>
                  {patient.allergies && patient.allergies.length > 0
                    ? (
                      <ul className='list-disc list-inside mt-1'>
                        {patient.allergies.map((allergy: string, index: number) => (
                          <li key={index} className='text-red-600'>{allergy}</li>
                        ))}
                      </ul>
                    )
                    : <span className='text-gray-500 ml-2'>Nenhuma alergia registrada</span>}
                </div>
                <div>
                  <strong>Condições Crônicas:</strong>
                  {patient.chronic_conditions && patient.chronic_conditions.length > 0
                    ? (
                      <ul className='list-disc list-inside mt-1'>
                        {patient.chronic_conditions.map((condition: string, index: number) => (
                          <li key={index} className='text-orange-600'>{condition}</li>
                        ))}
                      </ul>
                    )
                    : (
                      <span className='text-gray-500 ml-2'>
                        Nenhuma condição crônica registrada
                      </span>
                    )}
                </div>
                <div>
                  <strong>Medicamentos Atuais:</strong>
                  {patient.current_medications && patient.current_medications.length > 0
                    ? (
                      <ul className='list-disc list-inside mt-1'>
                        {patient.current_medications.map((medication: string, index: number) => (
                          <li key={index} className='text-blue-600'>{medication}</li>
                        ))}
                      </ul>
                    )
                    : <span className='text-gray-500 ml-2'>Nenhum medicamento registrado</span>}
                </div>
                {patient.patient_notes && (
                  <div>
                    <strong>Observações:</strong>
                    <p className='mt-1 text-gray-700'>{patient.patient_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Procedimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {procedures && procedures.length > 0
                ? (
                  <div className='space-y-4'>
                    {procedures.map((procedure: any) => (
                      <div key={procedure.id} className='border-l-4 border-blue-500 pl-4'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-semibold'>{procedure.name}</h4>
                          <Badge variant='outline'>
                            {new Date(procedure.performed_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <p className='text-gray-600 mt-1'>{procedure.description}</p>
                      </div>
                    ))}
                  </div>
                )
                : <p className='text-gray-500'>Nenhum procedimento registrado</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {/* LGPD Compliance Footer */}
      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <p className='text-xs text-gray-600 text-center'>
          🔒 Dados protegidos pela LGPD • Acesso registrado para auditoria • Paciente tem direito ao
          acesso, correção e exclusão dos dados
        </p>
      </div>
    </div>
  );
}
