import type {
  ComplianceAlert,
  ContraindicationAlert,
  DashboardMetrics,
  ProcedureRecommendation,
  RecentActivity,
} from '@/components/aesthetic';
import { AestheticAssessmentForm } from '@/components/aesthetic/AestheticAssessmentForm';
import { ProcedureRecommendations } from '@/components/aesthetic/ProcedureRecommendations';
import { ProfessionalDashboard } from '@/components/aesthetic/ProfessionalDashboard';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

function AestheticDemo() {
  const [currentStep, setCurrentStep] = useState<
    'assessment' | 'recommendations' | 'dashboard'
  >('assessment');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // Mock data para demonstração
  const mockRecommendations: ProcedureRecommendation[] = [
    {
      id: '1',
      name: 'Peeling de Ácido Glicólico',
      description: 'Tratamento para renovação celular e melhora da textura da pele',
      suitabilityScore: 85,
      estimatedSessions: 4,
      sessionDuration: '45 minutos',
      estimatedPrice: {
        min: 200,
        max: 350,
        currency: 'R$',
      },
      benefits: [
        'Renovação celular',
        'Melhora da textura',
        'Redução de manchas',
      ],
      risks: ['Vermelhidão temporária', 'Descamação leve'],
      contraindications: ['Gravidez', 'Lactação'],
      downtime: '2-3 dias',
      anvisaApproved: true,
      priorityLevel: 'alta',
      category: 'peeling',
      technicalDetails: {
        mechanism: 'Esfoliação química controlada',
        duration: '45 minutos',
        results: 'Visíveis em 7-14 dias',
      },
    },
    {
      id: '2',
      name: 'Microagulhamento',
      description: 'Estimula a produção de colágeno para redução de cicatrizes e rugas',
      suitabilityScore: 75,
      estimatedSessions: 3,
      sessionDuration: '60 minutos',
      estimatedPrice: {
        min: 300,
        max: 500,
        currency: 'R$',
      },
      benefits: [
        'Estímulo de colágeno',
        'Redução de cicatrizes',
        'Melhora da firmeza',
      ],
      risks: ['Vermelhidão', 'Inchaço leve'],
      contraindications: ['Infecções ativas', 'Queloides'],
      downtime: '1-2 dias',
      anvisaApproved: true,
      priorityLevel: 'média',
      category: 'facial',
      technicalDetails: {
        mechanism: 'Microlesões controladas',
        duration: '60 minutos',
        results: 'Visíveis em 30-60 dias',
      },
    },
    {
      id: '3',
      name: 'Laser CO2 Fracionado',
      description: 'Laser para rejuvenescimento e melhora da textura da pele',
      suitabilityScore: 60,
      estimatedSessions: 2,
      sessionDuration: '90 minutos',
      estimatedPrice: {
        min: 800,
        max: 1500,
        currency: 'R$',
      },
      benefits: [
        'Rejuvenescimento intenso',
        'Redução de rugas profundas',
        'Firmeza',
      ],
      risks: ['Vermelhidão prolongada', 'Descamação intensa'],
      contraindications: ['Pele muito escura', 'Queloides'],
      downtime: '7-10 dias',
      anvisaApproved: true,
      priorityLevel: 'baixa',
      category: 'laser',
      technicalDetails: {
        mechanism: 'Ablação fracionada controlada',
        duration: '90 minutos',
        results: 'Visíveis em 30-90 dias',
      },
    },
  ];

  const mockContraindications: ContraindicationAlert[] = [
    {
      type: 'warning',
      condition: 'Exposição solar recente',
      description:
        'Exposição solar intensa nas últimas 2 semanas pode aumentar o risco de hiperpigmentação',
      restrictions: [
        'Aguardar 2 semanas sem exposição solar antes do tratamento',
        'Usar protetor solar FPS 60+ diariamente',
      ],
      alternatives: [
        'Tratamentos mais suaves',
        'Protocolo de preparação da pele',
      ],
    },
  ];

  const mockDashboardMetrics: DashboardMetrics = {
    patientsToday: 8,
    totalPatients: 245,
    revenue: {
      today: 2800,
      month: 45000,
      currency: 'R$',
    },
    procedures: {
      completed: 156,
      scheduled: 23,
      pending: 8,
    },
    compliance: {
      lgpdCompliance: 96,
      anvisaCompliance: 98,
      auditScore: 94,
    },
    satisfaction: {
      averageRating: 4.8,
      totalReviews: 127,
      npsScore: 85,
    },
  };

  const mockRecentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'procedure',
      patientName: 'Maria Silva',
      patientAge: 35,
      description: 'Peeling de ácido glicólico - 2ª sessão',
      timestamp: new Date().toISOString(),
      status: 'completed',
      procedureType: 'Peeling',
      price: 280,
      currency: 'R$',
    },
    {
      id: '2',
      type: 'assessment',
      patientName: 'Ana Costa',
      patientAge: 42,
      description: 'Avaliação estética inicial - análise de melasma',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
    },
    {
      id: '3',
      type: 'consultation',
      patientName: 'Carla Santos',
      patientAge: 28,
      description: 'Consulta de acompanhamento - microagulhamento',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
    },
  ];

  const mockComplianceAlerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Renovação de registro ANVISA',
      description: 'O registro de alguns equipamentos vence em 30 dias',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      actionRequired: 'Renovar registros dos equipamentos laser',
    },
  ];

  const mockUpcomingAppointments = [
    {
      id: '1',
      patientName: 'Juliana Oliveira',
      patientAge: 33,
      procedure: 'Microagulhamento facial',
      time: new Date().toISOString(),
      duration: '60min',
      type: 'procedure' as const,
    },
    {
      id: '2',
      patientName: 'Patricia Lima',
      patientAge: 45,
      procedure: 'Consulta inicial',
      time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: '30min',
      type: 'consultation' as const,
    },
  ];

  const handleAssessmentSubmit = async (data: any) => {
    console.log('Assessment data:', data);
    setAssessmentData(data);
    setCurrentStep('recommendations');
  };

  const handleScheduleConsultation = (procedureIds: string[]) => {
    console.log('Scheduling consultation for procedures:', procedureIds);
    alert(`Agendamento solicitado para ${procedureIds.length} procedimento(s)`);
  };

  const handleRequestMoreInfo = (procedureId: string) => {
    console.log('Requesting more info for procedure:', procedureId);
    alert(`Mais informações sobre o procedimento ${procedureId}`);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        {/* Navegação */}
        <div className='mb-8'>
          <div className='flex space-x-4 justify-center'>
            <button
              onClick={() => setCurrentStep('assessment')}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 'assessment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Avaliação Estética
            </button>
            <button
              onClick={() => setCurrentStep('recommendations')}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 'recommendations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Recomendações
            </button>
            <button
              onClick={() => setCurrentStep('dashboard')}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard Profissional
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {currentStep === 'assessment' && (
          <AestheticAssessmentForm
            onSubmit={handleAssessmentSubmit}
            isLoading={false}
          />
        )}

        {currentStep === 'recommendations' && (
          <ProcedureRecommendations
            recommendations={mockRecommendations}
            contraindications={mockContraindications}
            patientProfile={{
              age: assessmentData?.patientData?.age || 30,
              skinType: assessmentData?.patientData?.skinType || '3',
              primaryConcerns: assessmentData?.skinAnalysis
                ?.primaryConcerns || ['Acne', 'Manchas solares'],
              medicalHistory: assessmentData?.medicalHistory || {},
            }}
            onScheduleConsultation={handleScheduleConsultation}
            onRequestMoreInfo={handleRequestMoreInfo}
          />
        )}

        {currentStep === 'dashboard' && (
          <ProfessionalDashboard
            metrics={mockDashboardMetrics}
            recentActivities={mockRecentActivities}
            complianceAlerts={mockComplianceAlerts}
            upcomingAppointments={mockUpcomingAppointments}
            professionalInfo={{
              name: 'Ana Paula Ferreira',
              specialization: 'Esteticista Especializada',
              registrationNumber: 'CREF 12345-SP',
              clinic: 'Clínica Estética Bella Vita',
            }}
            onNavigateToPatients={() => console.log('Navigate to patients')}
            onNavigateToSchedule={() => console.log('Navigate to schedule')}
            onNavigateToCompliance={() => console.log('Navigate to compliance')}
            onViewActivity={id => console.log('View activity', id)}
          />
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/demos/aesthetic-demo')({
  component: AestheticDemo,
});
