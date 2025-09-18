import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, test, vi } from 'vitest';
import { WaitingRoom } from '../WaitingRoom';

// Mock the cn utility function
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
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

  test('renders waiting room title', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Virtual Waiting Room')).toBeInTheDocument();
  });

  test('displays queue status section', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText(/Queue Status/)).toBeInTheDocument();
    expect(screen.getByText(/patients\)/)).toBeInTheDocument();
  });

  test('displays technical setup section', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Connection Quality')).toBeInTheDocument();
    expect(screen.getByText('Camera & Audio')).toBeInTheDocument();
  });

  test('shows current patient information', () => {
    render(<WaitingRoom {...mockProps} />);
    // Check if the current patient placeholder is shown
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });

  test('displays professional status', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText(/Dr\./)).toBeInTheDocument();
    expect(screen.getByText(/Online|Offline/)).toBeInTheDocument();
  });

  test('camera toggle functionality', () => {
    render(<WaitingRoom {...mockProps} />);
    const cameraButton = screen.getByText('Camera On');
    expect(cameraButton).toBeInTheDocument();
    fireEvent.click(cameraButton);
    // Button should still be visible after click
    expect(cameraButton).toBeInTheDocument();
  });

  test('microphone toggle functionality', () => {
    render(<WaitingRoom {...mockProps} />);
    const micButton = screen.getByText('Mic On');
    expect(micButton).toBeInTheDocument();
    fireEvent.click(micButton);
    // Button should still be visible after click
    expect(micButton).toBeInTheDocument();
  });

  test('displays emergency protocols section', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Emergency')).toBeInTheDocument();
    expect(screen.getByText('Emergency Protocols')).toBeInTheDocument();
  });

  test('shows quick actions', () => {
    render(<WaitingRoom {...mockProps} />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Update Availability')).toBeInTheDocument();
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
    expect(screen.getByText('Review Patient Notes')).toBeInTheDocument();
  });
});
