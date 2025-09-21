/**
 * Test suite for ProfessionalDashboard component
 * RED PHASE: Identify TypeScript compilation errors
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { ProfessionalDashboard } from '../ProfessionalDashboard';
import type {
  ComplianceAlert,
  DashboardMetrics,
  ProfessionalDashboardProps,
  RecentActivity,
} from '../ProfessionalDashboard';

// Mock data for testing
const mockMetrics: DashboardMetrics = {
  patientsToday: 5,
  totalPatients: 120,
  revenue: {
    today: 2500,
    month: 45000,
    currency: 'BRL',
  },
  procedures: {
    completed: 12,
    scheduled: 8,
    pending: 3,
  },
  compliance: {
    lgpdCompliance: 95,
    anvisaCompliance: 88,
    auditScore: 92,
  },
  satisfaction: {
    averageRating: 4.8,
    totalReviews: 89,
    npsScore: 72,
  },
};

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'consultation',
    patientName: 'Maria Silva',
    patientAge: 34,
    description: 'Consulta de acompanhamento',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    procedureType: 'Consulta',
    price: 300,
    currency: 'BRL',
  },
];

const mockAlerts: ComplianceAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Atualização LGPD',
    description: 'Nova regulamentação LGPD entra em vigor em 30 dias',
    actionRequired: 'Atualizar políticas de privacidade',
  },
];

const mockAppointments = [
  {
    id: '1',
    patientName: 'João Santos',
    patientAge: 45,
    procedure: 'Limpeza de pele',
    time: '2024-01-15T14:00:00Z',
    duration: '30 min',
    type: 'procedure' as const,
  },
];

const mockProfessionalInfo = {
  name: 'Dra. Ana Costa',
  specialization: 'Dermatologia Estética',
  registrationNumber: 'CRM/SP 123456',
  clinic: 'NeonPro Aesthetic Clinic',
};

describe('ProfessionalDashboard Component', () => {
  it('should render without crashing', () => {
    const props: ProfessionalDashboardProps = {
      metrics: mockMetrics,
      recentActivities: mockActivities,
      complianceAlerts: mockAlerts,
      upcomingAppointments: mockAppointments,
      professionalInfo: mockProfessionalInfo,
      onNavigateToPatients: vi.fn(),
      onNavigateToSchedule: vi.fn(),
      onNavigateToCompliance: vi.fn(),
      onViewActivity: vi.fn(),
    };

    expect(() => {
      render(<ProfessionalDashboard {...props} />);
    }).not.toThrow();
  });

  it('should display dashboard metrics correctly', () => {
    const props: ProfessionalDashboardProps = {
      metrics: mockMetrics,
      recentActivities: mockActivities,
      complianceAlerts: mockAlerts,
      upcomingAppointments: mockAppointments,
      professionalInfo: mockProfessionalInfo,
      onNavigateToPatients: vi.fn(),
      onNavigateToSchedule: vi.fn(),
      onNavigateToCompliance: vi.fn(),
      onViewActivity: vi.fn(),
    };

    render(<ProfessionalDashboard {...props} />);

    expect(screen.getByText('Pacientes Hoje')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Receita do Mês')).toBeInTheDocument();
  });

  it('should handle activity click events', () => {
    const onViewActivity = vi.fn();
    const props: ProfessionalDashboardProps = {
      metrics: mockMetrics,
      recentActivities: mockActivities,
      complianceAlerts: mockAlerts,
      upcomingAppointments: mockAppointments,
      professionalInfo: mockProfessionalInfo,
      onNavigateToPatients: vi.fn(),
      onNavigateToSchedule: vi.fn(),
      onNavigateToCompliance: vi.fn(),
      onViewActivity,
    };

    render(<ProfessionalDashboard {...props} />);

    // This test will help identify the onViewActivity parameter issue
    // The component uses _onViewActivity but interface expects onViewActivity
  });

  it('should display compliance status correctly', () => {
    const props: ProfessionalDashboardProps = {
      metrics: mockMetrics,
      recentActivities: mockActivities,
      complianceAlerts: mockAlerts,
      upcomingAppointments: mockAppointments,
      professionalInfo: mockProfessionalInfo,
      onNavigateToPatients: vi.fn(),
      onNavigateToSchedule: vi.fn(),
      onNavigateToCompliance: vi.fn(),
      onViewActivity: vi.fn(),
    };

    render(<ProfessionalDashboard {...props} />);

    expect(screen.getByText('Status de Conformidade')).toBeInTheDocument();
    expect(screen.getByText('LGPD')).toBeInTheDocument();
    expect(screen.getByText('ANVISA')).toBeInTheDocument();
  });
});
