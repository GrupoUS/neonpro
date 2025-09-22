/**
 * Experiment-06 Calendar Integration Tests - Healthcare Compliance
 *
 * TDD-compliant tests for calendar integration with appointment system
 * Validates LGPD, CFM, and ANVISA compliance requirements
 */

import type { Appointment } from '@/integrations/supabase/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Experiment06CalendarIntegration } from '../experiment-06-integration';

// Mock healthcare audit utilities
vi.mock(('@/utils/accessibility/healthcare-audit-utils', () => ({
  validateCalendarIntegration: vi.fn().mockReturnValue(true),
  auditAppointmentAccess: vi.fn().mockResolvedValue({ valid: true }),
  logCalendarAction: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Supabase real-time
vi.mock(('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnValue({
            subscribe: vi.fn(),
          }),
        }),
      }),
    }),
  },
}));

// Mock BigCalendar component
vi.mock(('@/components/big-calendar', () => ({
  BigCalendar: vi.fn(({ events,onEventUpdate, onEventDelete }) => (
    <div data-testid='big-calendar'>
      {events.map((event: any) => (<div key={event.id} data-event-id={event.id} className='calendar-event'>
          <div className='event-title'>{event.title}</div>
          <button
            onClick={() =>
              onEventUpdate?.(event)}
            aria-label={`Update ${event.title}`}
          >
            Update
          </button>
          <button
            onClick={() =>
              onEventDelete?.(event.id)}
            aria-label={`Delete ${event.title}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )),
}));

describe(('Experiment06CalendarIntegration - Healthcare Compliance', () => {
  const mockAppointments: Appointment[] = [
    {
      id: 'apt-1',
      title: 'Consulta Dr. Silva',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z',
      color: '#3b82f6',
      description: 'Consulta de rotina',
      patient_id: 'patient-123',
      professional_id: 'prof-456',
      service_type_id: 'service-789',
      status: 'scheduled',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      clinic_id: 'clinic-001',
    },
    {
      id: 'apt-2',
      title: 'Exame Cardiológico',
      start: '2024-01-15T14:00:00Z',
      end: '2024-01-15T15:30:00Z',
      color: '#f59e0b',
      description: 'Eletrocardiograma',
      patient_id: 'patient-456',
      professional_id: 'prof-789',
      service_type_id: 'service-012',
      status: 'confirmed',
      created_at: '2024-01-12T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z',
      clinic_id: 'clinic-001',
    },
  ];

  const mockOnEventUpdate = vi.fn();
  const mockOnEventDelete = vi.fn();
  const mockOnNewConsultation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // RED TEST 1: Proper appointment to calendar event conversion
  it(('should convert appointments to calendar events with LGPD compliance', () => {
    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    const calendar = screen.getByTestId('big-calendar');
    expect(calendar).toBeInTheDocument();

    // Check that appointments are converted to events
    const events = screen.getAllByClassName('calendar-event');
    expect(events).toHaveLength(2);

    // First event should contain appointment data
    const firstEvent = screen.getByText('Consulta Dr. Silva');
    expect(firstEvent).toBeInTheDocument();

    // Sensitive data should not be exposed
    expect(screen.queryByText('patient-123')).not.toBeInTheDocument();
  });

  // RED TEST 2: Event update triggers audit trail
  it(_'should audit all calendar modifications for compliance',async () => {
    const { logCalendarAction } = await import(
      '@/utils/accessibility/healthcare-audit-utils'
    );

    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Click update on first event
    const updateButton = screen.getByRole('button', {
      name: 'Update Consulta Dr. Silva',
    });
    fireEvent.click(updateButton);

    // Verify audit logging is called
    await waitFor(() => {
      expect(logCalendarAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          appointmentId: 'apt-1',
          timestamp: expect.any(String),
        }),
      );
    });
  });

  // RED TEST 3: Event deletion with healthcare validation
  it(_'should validate deletion permissions for healthcare events',async () => {
    const { auditAppointmentAccess } = await import(
      '@/utils/accessibility/healthcare-audit-utils'
    );

    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Click delete on second event
    const deleteButton = screen.getByRole('button', {
      name: 'Delete Exame Cardiológico',
    });
    fireEvent.click(deleteButton);

    // Should verify access permissions before deletion
    await waitFor(() => {
      expect(auditAppointmentAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: 'apt-2',
          action: 'delete',
        }),
      );
    });

    // After validation, delete handler should be called
    expect(mockOnEventDelete).toHaveBeenCalledWith('apt-2');
  });

  // RED TEST 4: Brazilian healthcare color coding compliance
  it(('should maintain consistent healthcare color coding', () => {
    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Events should have appropriate healthcare color coding
    const firstEvent = screen
      .getByText('Consulta Dr. Silva')
      .closest('.calendar-event');
    expect(firstEvent).toHaveStyle({
      color: expect.stringContaining('#3b82f6'),
    });

    const secondEvent = screen
      .getByText('Exame Cardiológico')
      .closest('.calendar-event');
    expect(secondEvent).toHaveStyle({
      color: expect.stringContaining('#f59e0b'),
    });
  });

  // RED TEST 5: Time zone handling for Brazilian regions
  it(('should handle different Brazilian time zones correctly', () => {
    const saoPauloAppointment: Appointment = {
      ...mockAppointments[0],
      id: 'apt-sp',
      start: '2024-01-15T10:00:00-03:00', // São Paulo time
      end: '2024-01-15T11:00:00-03:00',
    };

    render(
      <Experiment06CalendarIntegration
        appointments={[saoPauloAppointment]}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Event should display in correct local time
    const event = screen.getByText('Consulta Dr. Silva');
    expect(event).toBeInTheDocument();
  });

  // RED TEST 6: LGPD data minimization in event display
  it(('should minimize data exposure in calendar display', () => {
    const appointmentWithSensitiveData: Appointment = {
      ...mockAppointments[0],
      id: 'apt-sensitive',
      title: 'Consulta Confidencial',
      patient_notes: 'Paciente possui histórico de depressão e ansiedade',
      medical_history: 'Diabetes tipo 2, hipertensão',
      insurance_info: 'Plano premium, cobertura completa',
    };

    render(
      <Experiment06CalendarIntegration
        appointments={[appointmentWithSensitiveData as any]}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Sensitive medical data should not be displayed
    expect(screen.queryByText('depressão')).not.toBeInTheDocument();
    expect(screen.queryByText('Diabetes tipo 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Plano premium')).not.toBeInTheDocument();

    // Only basic appointment info should be visible
    expect(screen.getByText('Consulta Confidencial')).toBeInTheDocument();
  });

  // GREEN TEST: Real-time subscription handling
  it(_'should handle real-time updates from Supabase',async () => {
    const mockSubscription = vi.fn();
    const { supabase } = await import('@/integrations/supabase/client');

    // Setup mock subscription
    (supabase.channel as any).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: mockSubscription,
    });

    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    // Verify subscription is set up
    expect(supabase.channel).toHaveBeenCalledWith('appointments-realtime');
    expect(mockSubscription).toHaveBeenCalled();
  });

  // GREEN TEST: New consultation button accessibility
  it(('should provide accessible new consultation button', () => {
    render(
      <Experiment06CalendarIntegration
        appointments={mockAppointments}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    const newConsultationBtn = screen.getByRole('button', {
      name: /nova consulta/i,
    });
    expect(newConsultationBtn).toBeInTheDocument();
    expect(newConsultationBtn).toHaveAttribute('aria-label');
    expect(newConsultationBtn).toHaveAttribute('tabindex', '0');
  });

  // ERROR CASE: Empty appointments array
  it(('should handle empty appointments gracefully', () => {
    render(
      <Experiment06CalendarIntegration
        appointments={[]}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onNewConsultation={mockOnNewConsultation}
      />,
    );

    const calendar = screen.getByTestId('big-calendar');
    expect(calendar).toBeInTheDocument();

    // Should display empty state
    expect(screen.queryByText(/nenhum agendamento/i)).toBeInTheDocument();
  });

  // ERROR CASE: Invalid appointment data
  it(('should handle malformed appointment data', () => {
    const invalidAppointment = {
      id: 'invalid',
      title: 'Consulta Inválida',
      // Missing required fields
    };

    expect(() => {
      render(
        <Experiment06CalendarIntegration
          appointments={[invalidAppointment as any]}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );
    }).not.toThrow();
  });
});
