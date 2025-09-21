import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { WaitingRoom } from '../WaitingRoom';

// Mock the cn utility function
vi.mock(_'@/lib/utils',_() => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock hooks used by WaitingRoom
vi.mock(_'@/hooks/use-telemedicine',_() => ({
  useWaitingRoom: vi.fn(() => ({
    connectionStatus: 'connected',
    joinWaitingRoom: vi.fn(),
    leaveWaitingRoom: vi.fn(),
    updatePreConsultationData: vi.fn(),
    isJoining: false,
    isLeaving: false,
  })),
  useQueuePosition: vi.fn(_() => ({
    queueInfo: { position: 1, estimatedWaitTime: 15 },
    refreshPosition: vi.fn(),
  })),
  usePreConsultationCheck: vi.fn(_() => ({
    checkResults: null,
    performCheck: vi.fn(),
    isChecking: false,
  })),
  useSessionConsent: vi.fn(_() => ({
    consent: null,
    loading: false,
    updateConsent: vi.fn(),
    isUpdating: false,
  })),
  useEmergencyTriage: vi.fn(_() => ({
    triageAssessment: null,
    performTriage: vi.fn(),
  })),
}));

// Mock UI components
vi.mock(_'@/components/ui',_() => ({
  Button: ({ children,_onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: (_{ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: (_{ children, ...props }: any) => <span {...props}>{children}</span>,
  // Avatar components removed - using User icon instead
}));

describe(_'WaitingRoom',_() => {
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

  beforeEach(_() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test(_'renders waiting room in loading state',_() => {
    render(<WaitingRoom {...mockProps} />);
    expect(
      screen.getByText('Conectando à sala de espera...'),
    ).toBeInTheDocument();
  });

  test(_'displays loading activity indicator',_() => {
    render(<WaitingRoom {...mockProps} />);
    // Should show activity/loading spinner with lucide-activity class
    const activityIcon = document.querySelector('.lucide-activity');
    expect(activityIcon).toBeInTheDocument();
  });

  test(_'renders with correct appointment and patient props',_() => {
    render(<WaitingRoom {...mockProps} />);
    // Component should render without errors with provided props
    expect(
      screen.getByText('Conectando à sala de espera...'),
    ).toBeInTheDocument();
  });

  test(_'handles missing props gracefully',_() => {
    render(
      <WaitingRoom appointmentId='test-appointment' patientId='test-patient' />,
    );
    // Should render loading state even with minimal props
    expect(
      screen.getByText('Conectando à sala de espera...'),
    ).toBeInTheDocument();
  });

  test(_'displays centered loading layout',_() => {
    render(<WaitingRoom {...mockProps} />);
    const loadingContainer = screen
      .getByText('Conectando à sala de espera...')
      .closest('div');
    expect(loadingContainer).toHaveClass('text-center');
  });

  test(_'shows activity spinner during connection',_() => {
    render(<WaitingRoom {...mockProps} />);
    // Should show activity/loading spinner
    const activityIcon = document.querySelector('.lucide-activity');
    expect(activityIcon).toBeInTheDocument();
  });

  test(_'renders with proper accessibility attributes',_() => {
    render(<WaitingRoom {...mockProps} />);
    // Activity icon should have aria-hidden
    const activityIcon = document.querySelector('[aria-hidden="true"]');
    expect(activityIcon).toBeInTheDocument();
  });

  test(_'component structure is correct for loading state',_() => {
    render(<WaitingRoom {...mockProps} />);
    const container = screen
      .getByText('Conectando à sala de espera...')
      .closest('div');
    expect(container?.parentElement).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'h-screen',
    );
  });

  test(_'loading text is in Portuguese',_() => {
    render(<WaitingRoom {...mockProps} />);
    expect(
      screen.getByText('Conectando à sala de espera...'),
    ).toBeInTheDocument();
  });
});
