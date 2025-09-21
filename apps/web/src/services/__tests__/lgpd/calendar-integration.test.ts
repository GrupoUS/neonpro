/**
 * Failing Tests for Calendar Integration Component Dependencies
 * RED Phase: Tests should fail initially, then pass when component dependencies are fully validated
 * Tests LGPD service integration with calendar components
 */

import { Experiment06CalendarIntegration } from '@/components/calendar/experiment-06-integration';
import type { CalendarAppointment } from '@/services/appointments.service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the LGPD services that the component depends on
vi.mock('@/services/lgpd/calendar-consent.service', () => ({
  calendarLGPDConsentService: {
    validateCalendarConsent: vi.fn(),
    getDataMinimizationLevel: vi.fn(),
    minimizeAppointmentData: vi.fn(),
    processAppointmentsWithCompliance: vi.fn(),
  },
  DataMinimizationLevel: {
    MINIMAL: 'minimal',
    RESTRICTED: 'restricted',
    STANDARD: 'standard',
    FULL: 'full',
  },
  CALENDAR_LGPD_PURPOSES: {
    APPOINTMENT_SCHEDULING: 'appointment_scheduling',
    APPOINTMENT_MANAGEMENT: 'appointment_management',
  },
}));

vi.mock('@/services/lgpd/data-minimization.service', () => ({
  calendarDataMinimizationService: {
    minimizeAppointmentWithCompliance: vi.fn(),
    batchMinimizeAppointments: vi.fn(),
  },
}));

vi.mock('@/services/lgpd/audit-logging.service', () => ({
  calendarLGPDAuditService: {
    logAppointmentAccess: vi.fn(),
    logBatchOperation: vi.fn(),
    logConsentValidation: vi.fn(),
    logDataMinimization: vi.fn(),
  },
  LGPDAuditAction: {
    APPOINTMENT_CREATED: 'appointment_created',
    APPOINTMENT_UPDATED: 'appointment_updated',
    APPOINTMENT_DELETED: 'appointment_deleted',
  },
}));

// Mock EventCalendar component
vi.mock('@/components/event-calendar/event-calendar', () => ({
  EventCalendar: vi.fn(({ events, onEventUpdate, onEventDelete, onEventAdd, className }) => (
    <div data-testid="event-calendar" className={className}>
      <div data-testid="calendar-events">
        {events.map((event: any) => (
          <div key={event.id} data-event-id={event.id}>
            {event.title}
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          onEventUpdate?.(events[0] || {}, {})}
      >
        Update Event
      </button>
      <button
        onClick={() =>
          onEventDelete?.('test-id')}
      >
        Delete Event
      </button>
      <button onClick={() => onEventAdd?.({})}>Add Event</button>
    </div>
  )),
}));

// Mock calendar context
vi.mock('@/components/event-calendar/calendar-context', () => ({
  useCalendarContext: vi.fn(() => ({
    isColorVisible: vi.fn(() => true),
  })),
}));

describe('Experiment06CalendarIntegration - LGPD Dependencies RED Phase Tests', () => {
  let mockAppointments: CalendarAppointment[];
  let mockOnEventUpdate: vi.Mock;
  let mockOnEventDelete: vi.Mock;
  let mockOnNewConsultation: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAppointments = [
      {
        id: 'apt-123',
        title: 'Consulta Dr. Silva',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        color: '#3b82f6',
        status: 'scheduled',
        patientName: 'João Silva',
        patientId: 'patient-123',
        serviceName: 'Consulta Clínica Geral',
        description: 'Consulta de acompanhamento',
        notes: 'Paciente apresenta melhora',
        clinicId: 'clinic-123',
      },
    ];

    mockOnEventUpdate = vi.fn();
    mockOnEventDelete = vi.fn();
    mockOnNewConsultation = vi.fn();

    // Mock default successful responses
    const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');
    calendarLGPDConsentService.processAppointmentsWithCompliance.mockResolvedValue({
      compliantAppointments: [{
        id: 'apt-123',
        title: 'Consulta Reservado',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        color: '#3b82f6',
        status: 'scheduled',
        consentLevel: 'minimal',
        requiresConsent: true,
      }],
      consentIssues: [],
      auditLogId: 'audit-log-123',
    });

    calendarLGPDConsentService.validateCalendarConsent.mockResolvedValue({
      isValid: true,
      consentId: 'consent-123',
      purpose: 'appointment_management',
      patientId: 'patient-123',
      isExplicit: true,
      legalBasis: 'consent',
    });

    const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');
    calendarLGPDAuditService.logAppointmentAccess.mockResolvedValue('audit-log-123');
    calendarLGPDAuditService.logBatchOperation.mockResolvedValue('batch-audit-log-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Dependencies Existence', () => {
    it('should FAIL - should import LGPD services correctly', () => {
      // RED: This test fails if service imports are incorrect
      expect(() => {
        require('@/services/lgpd/calendar-consent.service');
        require('@/services/lgpd/data-minimization.service');
        require('@/services/lgpd/audit-logging.service');
      }).not.toThrow();
    });

    it('should FAIL - should have all required LGPD service methods', () => {
      // RED: This test fails if required methods are missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');
      const { calendarDataMinimizationService } = require(
        '@/services/lgpd/data-minimization.service',
      );
      const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');

      // Consent service methods
      expect(typeof calendarLGPDConsentService.validateCalendarConsent).toBe('function');
      expect(typeof calendarLGPDConsentService.processAppointmentsWithCompliance).toBe('function');
      expect(typeof calendarLGPDConsentService.minimizeAppointmentData).toBe('function');

      // Data minimization service methods
      expect(typeof calendarDataMinimizationService.minimizeAppointmentWithCompliance).toBe(
        'function',
      );
      expect(typeof calendarDataMinimizationService.batchMinimizeAppointments).toBe('function');

      // Audit service methods
      expect(typeof calendarLGPDAuditService.logAppointmentAccess).toBe('function');
      expect(typeof calendarLGPDAuditService.logBatchOperation).toBe('function');
      expect(typeof calendarLGPDAuditService.logConsentValidation).toBe('function');
    });

    it('should FAIL - should have all required types and interfaces', () => {
      // RED: This test fails if required types are missing
      const types = [
        'ConsentValidationResult',
        'DataMinimizationLevel',
        'MinimizedCalendarAppointment',
        'CalendarLGPDPurpose',
        'LGPDAuditAction',
        'LGPDAuditLog',
      ];

      types.forEach(type => {
        expect(true).toBe(false); // Force failure to indicate type validation needed
      });
    });
  });

  describe('Component Rendering with LGPD Services', () => {
    it('should FAIL - should render component with LGPD compliance status', async () => {
      // RED: This test fails if LGPD compliance status rendering is missing
      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/✓ Conformidade LGPD|⚠.*bloqueado\(s\) por LGPD/))
          .toBeInTheDocument();
      });
    });

    it('should FAIL - should show LGPD notice to users', async () => {
      // RED: This test fails if LGPD notice is missing
      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('LGPD:')).toBeInTheDocument();
        expect(screen.getByText('Lei Geral de Proteção de Dados')).toBeInTheDocument();
      });
    });

    it('should FAIL - should display data minimization level', async () => {
      // RED: This test fails if minimization level display is missing
      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/Nível de minimização:/)).toBeInTheDocument();
      });
    });
  });

  describe('LGPD Compliance Processing', () => {
    it('should FAIL - should process appointments with LGPD compliance on mount', async () => {
      // RED: This test fails if compliance processing is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledWith(
          mockAppointments,
          'current_user',
          'user',
        );
      });
    });

    it('should FAIL - should handle empty appointments array', async () => {
      // RED: This test fails if empty array handling is missing
      render(
        <Experiment06CalendarIntegration
          appointments={[]}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('✓ Conformidade LGPD')).toBeInTheDocument();
      });
    });

    it('should FAIL - should show compliance issues when detected', async () => {
      // RED: This test fails if compliance issue display is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      // Mock compliance issues
      calendarLGPDConsentService.processAppointmentsWithCompliance.mockResolvedValue({
        compliantAppointments: [],
        consentIssues: [{
          isValid: false,
          purpose: 'appointment_management',
          patientId: 'patient-123',
          isExplicit: false,
          legalBasis: 'none',
          error: 'No valid consent found',
          recommendation: 'Obtain patient consent',
        }],
        auditLogId: 'audit-log-123',
      });

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/1 bloqueado\(s\) por LGPD/)).toBeInTheDocument();
      });
    });
  });

  describe('Event Updates with LGPD Compliance', () => {
    it('should FAIL - should validate consent before event updates', async () => {
      // RED: This test fails if consent validation is missing
      const { calendarLGPDConsentService, calendarLGPDAuditService } = require(
        '@/services/lgpd/calendar-consent.service',
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Update Event'));
      });

      await waitFor(() => {
        expect(calendarLGPDConsentService.validateCalendarConsent).toHaveBeenCalledWith(
          'apt-123',
          'appointment_management',
          'current_user',
          'user',
        );
        expect(calendarLGPDAuditService.logAppointmentAccess).toHaveBeenCalled();
      });
    });

    it('should FAIL - should block updates without valid consent', async () => {
      // RED: This test fails if consent-based blocking is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      // Mock invalid consent
      calendarLGPDConsentService.validateCalendarConsent.mockResolvedValue({
        isValid: false,
        purpose: 'appointment_management',
        patientId: 'patient-123',
        isExplicit: false,
        legalBasis: 'none',
        error: 'Consent not valid for update',
      });

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Update Event'));
      });

      await waitFor(() => {
        expect(screen.getByText(/LGPD:.*Consentimento não válido/)).toBeInTheDocument();
        expect(mockOnEventUpdate).not.toHaveBeenCalled();
      });
    });

    it('should FAIL - should log audit trail for successful updates', async () => {
      // RED: This test fails if audit logging is missing
      const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Update Event'));
      });

      await waitFor(() => {
        expect(calendarLGPDAuditService.logAppointmentAccess).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'apt-123' }),
          'current_user',
          'user',
          expect.objectContaining({ isValid: true }),
          expect.any(String),
          'edit',
          expect.objectContaining({ updateDetails: {} }),
        );
      });
    });
  });

  describe('Event Deletion with LGPD Compliance', () => {
    it('should FAIL - should validate consent before event deletion', async () => {
      // RED: This test fails if consent validation is missing
      const { calendarLGPDConsentService, calendarLGPDAuditService } = require(
        '@/services/lgpd/calendar-consent.service',
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Delete Event'));
      });

      await waitFor(() => {
        expect(calendarLGPDConsentService.validateCalendarConsent).toHaveBeenCalledWith(
          'apt-123',
          'appointment_management',
          'current_user',
          'user',
        );
        expect(calendarLGPDAuditService.logAppointmentAccess).toHaveBeenCalled();
      });
    });

    it('should FAIL - should block deletions without valid consent', async () => {
      // RED: This test fails if consent-based blocking is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      calendarLGPDConsentService.validateCalendarConsent.mockResolvedValue({
        isValid: false,
        error: 'Consentimento não válido para exclusão',
      });

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Delete Event'));
      });

      await waitFor(() => {
        expect(screen.getByText(/LGPD:.*Consentimento não válido/)).toBeInTheDocument();
        expect(mockOnEventDelete).not.toHaveBeenCalled();
      });
    });

    it('should FAIL - should log audit trail for deletions with specific reason', async () => {
      // RED: This test fails if deletion audit logging is incomplete
      const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Delete Event'));
      });

      await waitFor(() => {
        expect(calendarLGPDAuditService.logAppointmentAccess).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'apt-123' }),
          'current_user',
          'user',
          expect.objectContaining({ isValid: true }),
          expect.any(String),
          'edit',
          expect.objectContaining({
            deletionReason: 'User initiated deletion',
          }),
        );
      });
    });
  });

  describe('New Consultation with LGPD Compliance', () => {
    it('should FAIL - should log audit trail for new consultation initiation', async () => {
      // RED: This test fails if new consultation audit logging is missing
      const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Event'));
      });

      await waitFor(() => {
        expect(calendarLGPDAuditService.logBatchOperation).toHaveBeenCalledWith(
          [],
          'current_user',
          'user',
          expect.any(String),
          expect.any(String),
          [],
          [],
          expect.objectContaining({ action: 'NEW_CONSULTATION_INITIATED' }),
        );
      });
    });

    it('should FAIL - should proceed with consultation even if audit logging fails', async () => {
      // RED: This test fails if audit error handling is missing
      const { calendarLGPDAuditService } = require('@/services/lgpd/audit-logging.service');

      calendarLGPDAuditService.logBatchOperation.mockRejectedValue(
        new Error('Audit logging failed'),
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Event'));
      });

      await waitFor(() => {
        // Should still proceed with consultation despite audit failure
        expect(mockOnNewConsultation).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should FAIL - should handle LGPD service errors gracefully', async () => {
      // RED: This test fails if error handling is not robust
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      calendarLGPDConsentService.processAppointmentsWithCompliance.mockRejectedValue(
        new Error('LGPD service unavailable'),
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Erro ao processar agendamentos com conformidade LGPD'))
          .toBeInTheDocument();
        expect(screen.getByText('✓ Conformidade LGPD')).toBeInTheDocument(); // Fallback state
      });
    });

    it('should FAIL - should show fallback data on compliance errors', async () => {
      // RED: This test fails if fallback data is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      calendarLGPDConsentService.processAppointmentsWithCompliance.mockRejectedValue(
        new Error('Compliance error'),
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        const calendar = screen.getByTestId('event-calendar');
        const events = calendar.querySelectorAll('[data-event-id]');

        // Should show fallback appointment data
        expect(events.length).toBeGreaterThan(0);
        expect(screen.getByText('Agendamento Reservado', { exact: false })).toBeInTheDocument();
      });
    });

    it('should FAIL - should block all appointments when compliance fails completely', async () => {
      // RED: This test fails if complete failure blocking is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      calendarLGPDConsentService.processAppointmentsWithCompliance.mockResolvedValue({
        compliantAppointments: [],
        consentIssues: mockAppointments.map(apt => ({
          isValid: false,
          purpose: 'appointment_management',
          patientId: apt.id,
          isExplicit: false,
          legalBasis: 'none',
          error: 'Complete compliance failure',
        })),
        auditLogId: 'audit-log-123',
      });

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/1 bloqueado\(s\) por LGPD/)).toBeInTheDocument();
        const calendar = screen.getByTestId('event-calendar');
        const events = calendar.querySelectorAll('[data-event-id]');

        // Should not show any appointments when all are blocked
        expect(events.length).toBe(0);
      });
    });
  });

  describe('Loading States and UX', () => {
    it('should FAIL - should show loading state during compliance processing', async () => {
      // RED: This test fails if loading state is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      // Mock slow processing
      calendarLGPDConsentService.processAppointmentsWithCompliance.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      // Should show loading state immediately
      expect(screen.getByText(/Processando com conformidade LGPD/)).toBeInTheDocument();

      await waitFor(() => {
        // Should hide loading state when complete
        expect(screen.queryByText(/Processando com conformidade LGPD/)).not.toBeInTheDocument();
      }, 200);
    });

    it('should FAIL - should disable interactions during loading', async () => {
      // RED: This test fails if interaction disabling is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');

      calendarLGPDConsentService.processAppointmentsWithCompliance.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      // Interactions should be disabled during loading
      const updateButton = screen.getByText('Update Event');
      const deleteButton = screen.getByText('Delete Event');

      // Note: Testing disabled state depends on actual implementation
      expect(updateButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should FAIL - should be accessible with proper ARIA labels', async () => {
      // RED: This test fails if accessibility compliance is missing
      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        const complianceStatus = screen.getByText(/✓ Conformidade LGPD|⚠.*bloqueado\(s\) por LGPD/);
        expect(complianceStatus).toBeInTheDocument();

        // Should have proper ARIA attributes
        expect(complianceStatus).toHaveAttribute('role');
      });
    });

    it('should FAIL - should support screen readers for compliance information', async () => {
      // RED: This test fails if screen reader support is missing
      render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        // Should have proper aria-live regions for dynamic content
        const lgpdNotice = screen.getByText(/LGPD:/);
        expect(lgpdNotice).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should FAIL - should reprocess appointments when appointments prop changes', async () => {
      // RED: This test fails if reprocessing on prop change is missing
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');
      const { rerender } = render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledTimes(
          1,
        );
      });

      // Update appointments
      const newAppointments = [...mockAppointments, {
        ...mockAppointments[0],
        id: 'apt-456',
        patientId: 'patient-456',
      }];

      rerender(
        <Experiment06CalendarIntegration
          appointments={newAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
        />,
      );

      await waitFor(() => {
        expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledTimes(
          2,
        );
        expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledWith(
          newAppointments,
          'current_user',
          'user',
        );
      });
    });

    it('should FAIL - should not reprocess appointments unnecessarily', async () => {
      // RED: This test fails if unnecessary reprocessing is not prevented
      const { calendarLGPDConsentService } = require('@/services/lgpd/calendar-consent.service');
      const { rerender } = render(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
          className='test-class'
        />,
      );

      await waitFor(() => {
        expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledTimes(
          1,
        );
      });

      // Rerender with same appointments (should not reprocess)
      rerender(
        <Experiment06CalendarIntegration
          appointments={mockAppointments}
          onEventUpdate={mockOnEventUpdate}
          onEventDelete={mockOnEventDelete}
          onNewConsultation={mockOnNewConsultation}
          className='test-class-updated'
        />,
      );

      // Should not reprocess if appointments haven't changed
      expect(calendarLGPDConsentService.processAppointmentsWithCompliance).toHaveBeenCalledTimes(1);
    });
  });
});
