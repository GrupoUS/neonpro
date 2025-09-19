import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, test, vi } from 'vitest';
import { WaitingRoom } from '../WaitingRoom';

// Mock the cn utility function
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock hooks used by WaitingRoom
vi.mock('@/hooks/use-telemedicine', () => ({
  useWaitingRoom: vi.fn(() => ({
    connectionStatus: 'connected',
    joinWaitingRoom: vi.fn(),
    leaveWaitingRoom: vi.fn(),
    updatePreConsultationData: vi.fn(),
    isJoining: false,
    isLeaving: false,
  })),
  useQueuePosition: vi.fn(() => ({
    queueInfo: { position: 1, estimatedWaitTime: 15 },
    refreshPosition: vi.fn(),
  })),
  usePreConsultationCheck: vi.fn(() => ({
    checkResults: null,
    performCheck: vi.fn(),
    isChecking: false,
  })),
  useSessionConsent: vi.fn(() => ({
    consent: null,
    loading: false,
    updateConsent: vi.fn(),
    isUpdating: false,
  })),
  useEmergencyTriage: vi.fn(() => ({
    triageAssessment: null,
    performTriage: vi.fn(),
  })),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  // Avatar components removed - using User icon instead
}));

describe('WaitingRoom', () => {
  const mockProps = {
    currentPatient: {
      id: '1',
      name: 'Maria Silva',
      appointmentTime: new Date('2024-01-15T14:30:00'),
      estimatedWaitTime: 15,
    },
    queuedPatients: [
      {
        id: '2',
        name: 'João Santos',
        appointmentTime: new Date('2024-01-15T15:00:00'),
        estimatedWaitTime: 5,
        status: 'waiting' as const,
        priority: 'normal' as const,
        hasInsurance: true,
        isNewPatient: false,
        consultationType: 'routine' as const,
      },
    ],
    professional: {
      id: 'prof1',
      name: 'Dr. Silva',
      status: 'online' as const,
      avatar: '/avatar.jpg',
      specialty: 'Cardiologia',
      totalConsultations: 150,
      completedToday: 8,
    },
    isConnected: true,
    isMicEnabled: true,
    isCameraEnabled: true,
    queuePosition: 1,
    totalWaitTime: 15,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('renders waiting room in loading state', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Conectando à sala de espera...')).toBeInTheDocument();
  });

  test('displays loading activity indicator', () => {
    render(<WaitingRoom {...mockProps} />);
    // Should show activity/loading spinner with lucide-activity class
    const activityIcon = document.querySelector('.lucide-activity');
    expect(activityIcon).toBeInTheDocument();
  });

  test('renders with correct appointment and patient props', () => {
    render(<WaitingRoom {...mockProps} />);
    // Component should render without errors with provided props
    expect(screen.getByText('Conectando à sala de espera...')).toBeInTheDocument();
  });

  test('handles missing props gracefully', () => {
    render(<WaitingRoom appointmentId='test-appointment' patientId='test-patient' />);
    // Should render loading state even with minimal props
    expect(screen.getByText('Conectando à sala de espera...')).toBeInTheDocument();
  });

  test('displays centered loading layout', () => {
    render(<WaitingRoom {...mockProps} />);
    const loadingContainer = screen.getByText('Conectando à sala de espera...').closest('div');
    expect(loadingContainer).toHaveClass('text-center');
  });

  test('shows activity spinner during connection', () => {
    render(<WaitingRoom {...mockProps} />);
    // Should show activity/loading spinner
    const activityIcon = document.querySelector('.lucide-activity');
    expect(activityIcon).toBeInTheDocument();
  });

  test('renders with proper accessibility attributes', () => {
    render(<WaitingRoom {...mockProps} />);
    // Activity icon should have aria-hidden
    const activityIcon = document.querySelector('[aria-hidden="true"]');
    expect(activityIcon).toBeInTheDocument();
  });

  test('component structure is correct for loading state', () => {
    render(<WaitingRoom {...mockProps} />);
    const container = screen.getByText('Conectando à sala de espera...').closest('div');
    expect(container?.parentElement).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'h-screen',
    );
  });

  test('loading text is in Portuguese', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Conectando à sala de espera...')).toBeInTheDocument();
  });
});
