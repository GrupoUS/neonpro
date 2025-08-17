/**
 * Appointment Booking Component Tests
 *
 * Healthcare Quality: ≥9.9/10
 * Multi-tenant Scheduling + Real-time Updates + Medical Workflow Validation
 * Brazilian Healthcare Time Zone + Professional Availability
 */

import { healthcareTestHelpers } from '@test/healthcare-test-helpers';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentBooking } from '@/components/appointments/AppointmentBooking';

// Mock implementations
const mockOnBookingSuccess = jest.fn();
const mockOnBookingError = jest.fn();
const mockOnDateChange = jest.fn();

// Mock real-time updates
const mockWebSocketService = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  send: jest.fn(),
};

jest.mock('@/lib/websocket', () => ({
  useWebSocket: () => mockWebSocketService,
}));

describe('AppointmentBooking - Healthcare Workflow Testing', () => {
  const testClinicId = 'clinic_test_001';
  const testScenario = healthcareTestHelpers.createHealthcareTestScenario(
    'appointment_flow',
    {
      clinicId: testClinicId,
    },
  );

  const testUser = healthcareTestHelpers.setupTestUser('patient', testClinicId);

  beforeEach(() => {
    mockOnBookingSuccess.mockClear();
    mockOnBookingError.mockClear();
    mockOnDateChange.mockClear();
    mockWebSocketService.subscribe.mockClear();
    mockWebSocketService.unsubscribe.mockClear();
    mockWebSocketService.send.mockClear();

    healthcareTestHelpers.mockHealthcareAuth(testUser);

    // Mock current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-08-17T10:00:00-03:00')); // São Paulo timezone
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Healthcare Professional Availability', () => {
    it('should display available time slots for healthcare professionals', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Select a professional
      const professionalSelect = screen.getByLabelText(
        /select.*professional|selecionar.*profissional/i,
      );
      await userEvent.selectOptions(
        professionalSelect,
        testScenario.professional.id,
      );

      // Select a date
      const dateInput = screen.getByLabelText(/date|data/i);
      await userEvent.type(dateInput, '2024-08-20');

      await waitFor(() => {
        // Should show available time slots
        const timeSlots = screen.getAllByRole('button', {
          name: /^\d{2}:\d{2}$/,
        });
        expect(timeSlots.length).toBeGreaterThan(0);

        // Time slots should be within professional's work hours
        timeSlots.forEach((slot) => {
          const time = slot.textContent;
          expect(time).toMatch(/^(08|09|10|11|12|13|14|15|16|17):\d{2}$/);
        });
      });
    });

    it('should respect professional lunch break and non-working hours', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Select professional and date
      const professionalSelect = screen.getByLabelText(
        /select.*professional|selecionar.*profissional/i,
      );
      await userEvent.selectOptions(
        professionalSelect,
        testScenario.professional.id,
      );

      const dateInput = screen.getByLabelText(/date|data/i);
      await userEvent.type(dateInput, '2024-08-20');

      await waitFor(() => {
        // Should not show lunch break slots (12:00-13:00)
        const lunchSlots = screen.queryAllByRole('button', {
          name: /12:[0-5]\d|13:00/,
        });
        expect(lunchSlots).toHaveLength(0);

        // Should not show after-hours slots
        const afterHoursSlots = screen.queryAllByRole('button', {
          name: /18:\d{2}|19:\d{2}|20:\d{2}/,
        });
        expect(afterHoursSlots).toHaveLength(0);
      });
    });

    it('should handle weekend availability differently', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Select Saturday
      const dateInput = screen.getByLabelText(/date|data/i);
      await userEvent.type(dateInput, '2024-08-24'); // Saturday

      const professionalSelect = screen.getByLabelText(
        /select.*professional|selecionar.*profissional/i,
      );
      await userEvent.selectOptions(
        professionalSelect,
        testScenario.professional.id,
      );

      await waitFor(() => {
        // Saturday should have limited hours (08:00-12:00)
        const timeSlots = screen.getAllByRole('button', {
          name: /^\d{2}:\d{2}$/,
        });
        timeSlots.forEach((slot) => {
          const time = slot.textContent;
          expect(time).toMatch(/^(08|09|10|11):\d{2}$/);
        });
      });

      // Select Sunday
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2024-08-25'); // Sunday

      await waitFor(() => {
        // Sunday should show no available slots
        const noSlotsMessage = screen.getByText(
          /no.*available.*slots|não.*há.*horários.*disponíveis/i,
        );
        expect(noSlotsMessage).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Slot Updates', () => {
    it('should subscribe to real-time availability updates', () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Should subscribe to real-time updates
      expect(mockWebSocketService.subscribe).toHaveBeenCalledWith(
        expect.stringContaining(`appointments:${testClinicId}`),
        expect.any(Function),
      );
    });

    it('should update available slots when another appointment is booked', async () => {
      const { rerender: _rerender } = render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Select professional and date
      const professionalSelect = screen.getByLabelText(
        /select.*professional|selecionar.*profissional/i,
      );
      await userEvent.selectOptions(
        professionalSelect,
        testScenario.professional.id,
      );

      const dateInput = screen.getByLabelText(/date|data/i);
      await userEvent.type(dateInput, '2024-08-20');

      await waitFor(() => {
        const timeSlots = screen.getAllByRole('button', {
          name: /^\d{2}:\d{2}$/,
        });
        expect(timeSlots.length).toBeGreaterThan(0);
      });

      // Simulate real-time update: another appointment booked
      const realTimeUpdate = {
        type: 'APPOINTMENT_BOOKED',
        payload: {
          professional_id: testScenario.professional.id,
          date: '2024-08-20',
          time: '09:00',
        },
      };

      // Trigger the real-time update callback
      const subscribeCall = mockWebSocketService.subscribe.mock.calls[0];
      const updateCallback = subscribeCall[1];
      updateCallback(realTimeUpdate);

      // The 09:00 slot should no longer be available
      await waitFor(() => {
        const nineonSlot = screen.queryByRole('button', { name: '09:00' });
        expect(nineonSlot).not.toBeInTheDocument();
      });
    });

    it('should show slot as temporarily reserved during booking process', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Complete appointment selection
      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
        {
          treatmentType: 'consultation',
          date: '2024-08-20',
          timeSlot: '10:00',
        },
      );

      // Slot should show as "reserving" or disabled
      const selectedSlot = screen.getByRole('button', { name: '10:00' });
      expect(selectedSlot).toHaveAttribute('aria-disabled', 'true');
      expect(selectedSlot).toHaveTextContent(/reserving|reservando/i);
    });
  });

  describe('Treatment Type Selection', () => {
    it('should display available treatments for the clinic', () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      const treatmentSelect = screen.getByLabelText(
        /treatment.*type|tipo.*tratamento/i,
      );

      // Should show healthcare treatments
      const treatmentOptions = within(treatmentSelect).getAllByRole('option');
      const treatmentTexts = treatmentOptions.map(
        (option) => option.textContent,
      );

      expect(treatmentTexts).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/consultation|consulta/i),
          expect.stringMatching(/botox/i),
          expect.stringMatching(/facial.*cleaning|limpeza.*facial/i),
          expect.stringMatching(/filling|preenchimento/i),
        ]),
      );
    });

    it('should adjust appointment duration based on treatment type', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      const treatmentSelect = screen.getByLabelText(
        /treatment.*type|tipo.*tratamento/i,
      );

      // Select consultation (30 minutes)
      await userEvent.selectOptions(treatmentSelect, 'consultation');
      expect(screen.getByText(/30.*minutes|30.*minutos/i)).toBeInTheDocument();

      // Select botox procedure (60 minutes)
      await userEvent.selectOptions(treatmentSelect, 'botox');
      expect(screen.getByText(/60.*minutes|60.*minutos/i)).toBeInTheDocument();

      // Select facial cleaning (90 minutes)
      await userEvent.selectOptions(treatmentSelect, 'facial_cleaning');
      expect(screen.getByText(/90.*minutes|90.*minutos/i)).toBeInTheDocument();
    });
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should only show professionals from the current clinic', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      const professionalSelect = screen.getByLabelText(
        /select.*professional|selecionar.*profissional/i,
      );
      const professionalOptions =
        within(professionalSelect).getAllByRole('option');

      // All professionals should belong to the current clinic
      professionalOptions.forEach((option) => {
        if (option.value) {
          // Skip empty option
          expect(option).toHaveAttribute('data-clinic-id', testClinicId);
        }
      });
    });

    it('should enforce tenant isolation in appointment data', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Complete appointment booking
      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
        {
          treatmentType: 'consultation',
          date: '2024-08-20',
          timeSlot: '14:00',
        },
      );

      await waitFor(() => {
        expect(mockOnBookingSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            clinic_id: testClinicId,
            tenant_id: testClinicId,
            patient_id: testScenario.patient.id,
          }),
        );
      });
    });
  });

  describe('Brazilian Healthcare Time Zone Handling', () => {
    it('should handle São Paulo timezone correctly', () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
          timezone="America/Sao_Paulo"
        />,
      );

      // Current time should be displayed in Brazilian timezone
      const currentTime = screen.getByText(/current.*time|horário.*atual/i);
      expect(currentTime).toHaveTextContent(/07:00|10:00/); // Accounting for UTC-3
    });

    it('should prevent booking appointments in the past', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Try to select yesterday's date
      const dateInput = screen.getByLabelText(/date|data/i);
      await userEvent.type(dateInput, '2024-08-16'); // Yesterday

      await waitFor(() => {
        expect(
          screen.getByText(
            /cannot.*book.*past|não.*é.*possível.*agendar.*passado/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('should handle daylight saving time transitions', async () => {
      // Mock a date during DST transition
      jest.setSystemTime(new Date('2024-10-20T10:00:00-02:00')); // During DST

      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Should properly handle timezone offset
      const timezoneInfo = screen.getByText(/timezone|fuso.*horário/i);
      expect(timezoneInfo).toHaveTextContent(/UTC-2|BRT/);
    });
  });

  describe('Appointment Confirmation and Notifications', () => {
    it('should send confirmation notification after successful booking', async () => {
      const mockNotificationService = jest.fn();
      jest.mock('@/lib/notifications', () => ({
        sendAppointmentConfirmation: mockNotificationService,
      }));

      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Complete appointment booking
      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
        {
          treatmentType: 'consultation',
          date: '2024-08-20',
          timeSlot: '15:00',
        },
      );

      await waitFor(() => {
        expect(mockOnBookingSuccess).toHaveBeenCalled();
        // Should show confirmation message
        expect(
          screen.getByText(/appointment.*confirmed|agendamento.*confirmado/i),
        ).toBeInTheDocument();
      });
    });

    it('should display appointment details in confirmation', async () => {
      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Complete appointment booking
      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
        {
          treatmentType: 'botox',
          date: '2024-08-20',
          timeSlot: '16:00',
        },
      );

      await waitFor(() => {
        // Should display confirmation details
        expect(screen.getByText(/botox/i)).toBeInTheDocument();
        expect(screen.getByText(/2024-08-20/)).toBeInTheDocument();
        expect(screen.getByText(/16:00/)).toBeInTheDocument();
        expect(
          screen.getByText(testScenario.professional.name),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle slot conflict gracefully', async () => {
      // Mock conflict error
      mockOnBookingError.mockImplementation((error) => {
        expect(error.type).toBe('SLOT_CONFLICT');
      });

      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Try to book a slot that becomes unavailable
      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
          simulateConflict={true}
        />,
        {
          treatmentType: 'consultation',
          date: '2024-08-20',
          timeSlot: '11:00',
        },
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /slot.*no.*longer.*available|horário.*não.*está.*mais.*disponível/i,
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', {
            name: /select.*another.*time|selecionar.*outro.*horário/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors during booking', async () => {
      // Mock network error
      mockOnBookingError.mockImplementation((error) => {
        expect(error.type).toBe('NETWORK_ERROR');
      });

      render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
          simulateNetworkError={true}
        />,
      );

      await healthcareTestHelpers.testAppointmentBooking(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
        {
          treatmentType: 'consultation',
          date: '2024-08-20',
          timeSlot: '09:30',
        },
      );

      await waitFor(() => {
        expect(
          screen.getByText(/connection.*error|erro.*conexão/i),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /try.*again|tentar.*novamente/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should be accessible for patients with disabilities', async () => {
      const { container } = render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      await healthcareTestHelpers.testAccessibilityCompliance(container, {
        level: 'AA',
        anxietyReduction: true,
      });

      // Should support keyboard navigation for time slot selection
      const timeSlots = screen.getAllByRole('button', {
        name: /^\d{2}:\d{2}$/,
      });
      timeSlots.forEach((slot) => {
        expect(slot).toHaveAttribute('tabindex', '0');
        expect(slot).toHaveAttribute(
          'aria-label',
          expect.stringContaining('time slot'),
        );
      });
    });

    it('should reduce anxiety with clear progress indicators', () => {
      const { container } = render(
        <AppointmentBooking
          clinicId={testClinicId}
          patientId={testScenario.patient.id}
          onBookingSuccess={mockOnBookingSuccess}
          onBookingError={mockOnBookingError}
        />,
      );

      // Should have anxiety-reducing design patterns
      expect(container).toHaveAnxietyReducingDesign();

      // Should show clear steps
      const progressIndicator = screen.getByRole('progressbar');
      expect(progressIndicator).toBeInTheDocument();
      expect(progressIndicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('booking progress'),
      );
    });
  });
});
