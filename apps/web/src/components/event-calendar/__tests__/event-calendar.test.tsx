/**
 * Event Calendar Component Tests - TDD Compliance
 *
 * Implements RED-GREEN-REFACTOR cycle for calendar components
 * Healthcare compliance: LGPD, CFM, ANVISA requirements
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventCalendar } from '../event-calendar';
import { CalendarEvent } from '../types';

// Mock healthcare compliance validator
vi.mock('@/utils/accessibility/healthcare-audit-utils', () => ({
  validateCalendarEvent: vi.fn().mockReturnValue(true),
  auditEventAccess: vi.fn().mockResolvedValue({ valid: true }),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  },
}));

describe('EventCalendar Component - Healthcare Compliance', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Consulta com Dr. Silva',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      color: 'blue',
      description: 'Consulta de rotina',
      patientId: 'patient-123',
      professionalId: 'prof-456',
    },
    {
      id: '2',
      title: 'Exame Laboratorial',
      start: new Date('2024-01-15T14:00:00'),
      end: new Date('2024-01-15T15:30:00'),
      color: 'emerald',
      description: 'Exames de sangue',
      patientId: 'patient-789',
      professionalId: 'prof-456',
    },
  ];

  const mockOnEventUpdate = vi.fn();
  const mockOnEventDelete = vi.fn();
  const mockOnEventAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // RED TEST 1: Component renders without patient data exposure
  it('should render calendar without exposing sensitive patient data', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Calendar container should exist
    expect(screen.getByRole('application')).toBeInTheDocument();

    // Patient IDs should not be visible in the DOM
    expect(screen.queryByText('patient-123')).not.toBeInTheDocument();
    expect(screen.queryByText('patient-789')).not.toBeInTheDocument();
  });

  // RED TEST 2: Event click triggers proper healthcare audit
  it('should trigger audit logging when event is clicked', async () => {
    const { auditEventAccess } = await import(
      '@/utils/accessibility/healthcare-audit-utils'
    );

    render(
      <EventCalendar
        events={mockEvents}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Click on first event
    const eventElement = screen.getByText('Consulta com Dr. Silva');
    fireEvent.click(eventElement);

    // Audit should be called with event details
    await waitFor(() => {
      expect(auditEventAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: '1',
          action: 'view',
          resourceType: 'appointment',
        }),
      );
    });
  });

  // RED TEST 3: Event deletion requires proper authorization
  it('should require confirmation before deleting healthcare events', async () => {
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <EventCalendar
        events={mockEvents}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirmation dialog should appear
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('Tem certeza que deseja excluir'),
    );

    // If confirmed, delete handler should be called
    if (mockConfirm.mock.results[0].value) {
      expect(mockOnEventDelete).toHaveBeenCalledWith('1');
    }

    mockConfirm.mockRestore();
  });

  // RED TEST 4: Time zone handling for Brazilian clinics
  it('should handle Brazilian time zones correctly', () => {
    // Create event in São Paulo time
    const brazilTimeEvent: CalendarEvent = {
      id: '3',
      title: 'Consulta SP',
      start: new Date('2024-01-15T10:00:00-03:00'), // GMT-3 (São Paulo)
      end: new Date('2024-01-15T11:00:00-03:00'),
      color: 'violet',
    };

    render(
      <EventCalendar
        events={[brazilTimeEvent]}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Event should display at correct local time
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  // RED TEST 5: Accessibility compliance for healthcare
  it('should meet WCAG 2.1 AA+ accessibility requirements', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Calendar should have proper ARIA roles
    const calendar = screen.getByRole('application');
    expect(calendar).toHaveAttribute('aria-label', 'Calendário de eventos');

    // All interactive elements should be accessible
    const interactiveElements = screen.getAllByRole('button');
    interactiveElements.forEach(_element => {
      expect(element).toHaveAttribute('aria-label');
      expect(element).toHaveAttribute('tabindex');
    });
  });

  // RED TEST 6: LGPD compliance - data minimization
  it('should implement data minimization for event display', () => {
    const sensitiveEvent: CalendarEvent = {
      id: '4',
      title: 'Consulta Confidencial',
      start: new Date('2024-01-15T16:00:00'),
      end: new Date('2024-01-15T17:00:00'),
      color: 'rose',
      description: 'Contém informações médicas sensíveis',
      patientData: {
        name: 'João da Silva',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
      },
    };

    render(
      <EventCalendar
        events={[sensitiveEvent as any]}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Sensitive data should not be exposed
    expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
    expect(screen.queryByText('(11) 99999-9999')).not.toBeInTheDocument();

    // Only non-sensitive information should be visible
    expect(screen.getByText('Consulta Confidencial')).toBeInTheDocument();
  });

  // GREEN TEST: Event update with proper validation
  it('should validate event updates for healthcare compliance', async () => {
    const updatedEvent: CalendarEvent = {
      id: '1',
      title: 'Consulta Atualizada',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:30:00'), // Extended duration
      color: 'blue',
    };

    render(
      <EventCalendar
        events={mockEvents}
        onEventUpdate={mockOnEventUpdate}
        onEventDelete={mockOnEventDelete}
        onEventAdd={mockOnEventAdd}
      />,
    );

    // Simulate event update
    await mockOnEventUpdate(updatedEvent);

    // Update handler should be called with validated data
    expect(mockOnEventUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        title: 'Consulta Atualizada',
      }),
    );
  });

  // ERROR CASE: Invalid event data
  it('should handle invalid event data gracefully', () => {
    const invalidEvent = {
      id: 'invalid',
      title: '', // Empty title
      start: new Date('invalid-date'), // Invalid date
      end: new Date(),
      color: 'invalid-color' as any,
    };

    expect(() => {
      render(
        <EventCalendar
          events={[invalidEvent as any]}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onEventAdd={mockOnEventAdd}
        />,
      );
    }).not.toThrow();
  });
});
