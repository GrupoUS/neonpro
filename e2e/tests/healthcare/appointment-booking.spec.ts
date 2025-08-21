/**
 * NeonPro Healthcare - Appointment Booking E2E Tests
 *
 * PRIORITY: CRITICAL - Core scheduling and appointment management
 * COVERAGE: Booking, rescheduling, cancellation, conflicts, reminders
 * COMPLIANCE: Healthcare scheduling regulations, patient notifications
 */

import { expect, test } from '@playwright/test';

test.describe('Appointment Booking Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dr.silva@neonpro.com');
    await page.fill('input[type="password"]', 'HealthcareTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should book new appointment with complete workflow', async ({
    page,
  }) => {
    // Navigate to appointments
    await page.click('[data-testid="nav-appointments"]');
    await expect(page).toHaveURL(/\/appointments/);

    // Should display appointment calendar
    await expect(
      page.locator('[data-testid="appointment-calendar"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="schedule-appointment-btn"]')
    ).toBeVisible();

    // Start new appointment booking
    await page.click('[data-testid="schedule-appointment-btn"]');
    await expect(
      page.locator('[data-testid="appointment-form"]')
    ).toBeVisible();

    // STEP 1: Patient Selection
    await page.click('[data-testid="patient-search"]');
    await page.fill('[data-testid="patient-search"]', 'João Silva');

    // Should show patient suggestions
    await expect(
      page.locator('[data-testid="patient-suggestions"]')
    ).toBeVisible();
    await page.click('[data-testid="patient-option-123.456.789-00"]');

    // Should populate patient information
    await expect(
      page.locator('[data-testid="selected-patient-name"]')
    ).toContainText('João Silva Santos');
    await expect(
      page.locator('[data-testid="selected-patient-insurance"]')
    ).toContainText('Unimed');

    // STEP 2: Doctor and Specialty Selection
    await page.click('[data-testid="doctor-select"]');
    await expect(page.locator('[data-testid="doctor-options"]')).toBeVisible();

    // Filter by specialty
    await page.click('[data-testid="specialty-filter"]');
    await page.click('[data-testid="specialty-cardiologia"]');

    await page.click('[data-testid="doctor-dr-cardio"]');
    await expect(page.locator('[data-testid="selected-doctor"]')).toContainText(
      'Dr. João Cardio'
    );

    // STEP 3: Date and Time Selection
    await page.click('[data-testid="appointment-date"]');

    // Should show calendar with available dates
    await expect(page.locator('[data-testid="calendar-widget"]')).toBeVisible();

    // Select future date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.getDate().toString();

    await page.click(`[data-testid="calendar-day-${tomorrowStr}"]`);

    // Should show available time slots
    await expect(page.locator('[data-testid="time-slots"]')).toBeVisible();
    await expect(page.locator('[data-testid="slot-09:00"]')).toBeVisible();
    await expect(page.locator('[data-testid="slot-14:00"]')).toBeVisible();

    // Select time slot
    await page.click('[data-testid="slot-14:00"]');
    await expect(page.locator('[data-testid="selected-time"]')).toContainText(
      '14:00'
    );

    // STEP 4: Appointment Type and Details
    await page.click('[data-testid="appointment-type"]');
    await page.click('[data-testid="type-consultation"]');

    await page.click('[data-testid="consultation-duration"]');
    await page.click('[data-testid="duration-30min"]');

    // Chief complaint
    await page.fill(
      '[data-testid="chief-complaint"]',
      'Dor no peito e palpitações'
    );

    // Symptoms duration
    await page.click('[data-testid="symptoms-duration"]');
    await page.click('[data-testid="duration-1week"]');

    // Priority level
    await page.click('[data-testid="priority-level"]');
    await page.click('[data-testid="priority-routine"]');

    // STEP 5: Insurance and Payment
    await expect(page.locator('[data-testid="insurance-info"]')).toContainText(
      'Unimed'
    );
    await expect(page.locator('[data-testid="coverage-status"]')).toContainText(
      'Cobertura confirmada'
    );

    // Co-payment information
    await expect(page.locator('[data-testid="copay-amount"]')).toContainText(
      'R$ 25,00'
    );

    // STEP 6: Patient Notifications
    await page.check('[data-testid="send-sms-reminder"]');
    await page.check('[data-testid="send-email-confirmation"]');
    await page.check('[data-testid="send-whatsapp-reminder"]');

    // Reminder timing
    await page.click('[data-testid="reminder-timing"]');
    await page.click('[data-testid="reminder-24h"]');

    // STEP 7: Additional Notes
    await page.fill(
      '[data-testid="appointment-notes"]',
      'Paciente relata histórico familiar de problemas cardíacos'
    );

    // Special instructions
    await page.fill(
      '[data-testid="special-instructions"]',
      'Trazer exames anteriores e lista de medicamentos'
    );

    // Save appointment
    await page.click('[data-testid="save-appointment-btn"]');

    // Should show booking confirmation
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
    await expect(
      page.locator('text=Consulta agendada com sucesso')
    ).toBeVisible();

    // Should display appointment details
    await expect(page.locator('[data-testid="appointment-id"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="confirmation-date"]')
    ).toContainText(tomorrow.toLocaleDateString('pt-BR'));
    await expect(
      page.locator('[data-testid="confirmation-time"]')
    ).toContainText('14:00');

    // Should send notifications
    await expect(
      page.locator('[data-testid="notifications-sent"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Confirmação enviada para joao.silva@email.com')
    ).toBeVisible();
    await expect(
      page.locator('text=SMS enviado para (11) 99999-9999')
    ).toBeVisible();

    // Should update calendar view
    await page.click('[data-testid="back-to-calendar"]');
    await expect(
      page.locator(
        `[data-testid="appointment-${tomorrow.toISOString().split('T')[0]}-14:00"]`
      )
    ).toBeVisible();
  });

  test('should handle appointment conflicts and show alternatives', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-appointments"]');
    await page.click('[data-testid="schedule-appointment-btn"]');

    // Select patient and doctor
    await page.click('[data-testid="patient-search"]');
    await page.fill('[data-testid="patient-search"]', 'Maria Silva');
    await page.click('[data-testid="patient-option-first"]');

    await page.click('[data-testid="doctor-select"]');
    await page.click('[data-testid="doctor-dr-silva"]');

    // Try to book an already occupied slot
    await page.click('[data-testid="appointment-date"]');
    const today = new Date();
    const todayStr = today.getDate().toString();
    await page.click(`[data-testid="calendar-day-${todayStr}"]`);

    // Select occupied time slot
    await page.click('[data-testid="slot-10:00"]');

    // Should show conflict warning
    await expect(
      page.locator('[data-testid="conflict-warning"]')
    ).toBeVisible();
    await expect(page.locator('text=Horário já ocupado')).toBeVisible();

    // Should suggest alternative times
    await expect(
      page.locator('[data-testid="alternative-slots"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="alternative-slot-11:00"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="alternative-slot-15:00"]')
    ).toBeVisible();

    // Accept alternative time
    await page.click('[data-testid="alternative-slot-11:00"]');

    // Should update selected time
    await expect(page.locator('[data-testid="selected-time"]')).toContainText(
      '11:00'
    );

    // Complete booking
    await page.click('[data-testid="appointment-type"]');
    await page.click('[data-testid="type-followup"]');

    await page.click('[data-testid="save-appointment-btn"]');
    await expect(
      page.locator('text=Consulta agendada com sucesso')
    ).toBeVisible();
  });

  test('should handle emergency appointment booking', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');

    // Click emergency appointment button
    await page.click('[data-testid="emergency-appointment-btn"]');
    await expect(
      page.locator('[data-testid="emergency-booking-form"]')
    ).toBeVisible();

    // Emergency appointment form
    await page.click('[data-testid="patient-search"]');
    await page.fill('[data-testid="patient-search"]', 'Carlos Emergência');
    await page.click('[data-testid="patient-option-first"]');

    // Emergency details
    await page.fill(
      '[data-testid="emergency-symptoms"]',
      'Dor torácica intensa, sudorese fria'
    );

    await page.click('[data-testid="emergency-severity"]');
    await page.click('[data-testid="severity-high"]');

    // Should bypass normal scheduling constraints
    await page.click('[data-testid="doctor-select"]');
    await page.click('[data-testid="doctor-available-now"]');

    // Should show immediate availability
    await expect(page.locator('[data-testid="immediate-slot"]')).toBeVisible();
    await page.click('[data-testid="book-immediate-btn"]');

    // Should show emergency override confirmation
    await expect(
      page.locator('[data-testid="emergency-override-modal"]')
    ).toBeVisible();
    await expect(page.locator('text=Agendamento emergencial')).toBeVisible();
    await expect(
      page.locator('text=Irá sobrescrever consulta existente')
    ).toBeVisible();

    // Confirm emergency booking
    await page.click('[data-testid="confirm-emergency-booking"]');

    // Should create priority appointment
    await expect(
      page.locator('text=Consulta emergencial agendada')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="emergency-appointment-id"]')
    ).toBeVisible();

    // Should notify affected parties
    await expect(
      page.locator('[data-testid="notifications-emergency"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Paciente original foi notificado do reagendamento')
    ).toBeVisible();
  });

  test('should reschedule existing appointment', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');

    // Find existing appointment
    await expect(
      page.locator('[data-testid="appointment-list"]')
    ).toBeVisible();
    await page.click('[data-testid="appointment-item-first"]');

    // Should show appointment details
    await expect(
      page.locator('[data-testid="appointment-details"]')
    ).toBeVisible();

    // Click reschedule button
    await page.click('[data-testid="reschedule-btn"]');
    await expect(page.locator('[data-testid="reschedule-form"]')).toBeVisible();

    // Select new date
    await page.click('[data-testid="new-appointment-date"]');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.getDate().toString();
    await page.click(`[data-testid="calendar-day-${nextWeekStr}"]`);

    // Select new time
    await page.click('[data-testid="slot-16:00"]');

    // Reason for rescheduling
    await page.fill(
      '[data-testid="reschedule-reason"]',
      'Conflito com outro compromisso médico'
    );

    // Save rescheduling
    await page.click('[data-testid="save-reschedule-btn"]');

    // Should show confirmation
    await expect(
      page.locator('text=Consulta reagendada com sucesso')
    ).toBeVisible();

    // Should send notifications
    await expect(
      page.locator('text=Paciente notificado da mudança')
    ).toBeVisible();
    await expect(
      page.locator('text=Médico notificado da mudança')
    ).toBeVisible();

    // Should update calendar
    await expect(
      page.locator(
        `[data-testid="appointment-${nextWeek.toISOString().split('T')[0]}-16:00"]`
      )
    ).toBeVisible();
  });

  test('should cancel appointment with proper workflow', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');
    await page.click('[data-testid="appointment-item-first"]');

    // Click cancel button
    await page.click('[data-testid="cancel-appointment-btn"]');

    // Should show cancellation form
    await expect(
      page.locator('[data-testid="cancellation-form"]')
    ).toBeVisible();
    await expect(page.locator('text=Cancelar Consulta')).toBeVisible();

    // Cancellation reason
    await page.click('[data-testid="cancellation-reason"]');
    await page.click('[data-testid="reason-patient-request"]');

    // Additional details
    await page.fill(
      '[data-testid="cancellation-details"]',
      'Paciente não poderá comparecer devido a trabalho'
    );

    // Cancellation timing
    await expect(
      page.locator('[data-testid="cancellation-notice"]')
    ).toContainText('24 horas de antecedência');

    // Policy compliance check
    await expect(
      page.locator('[data-testid="policy-compliance"]')
    ).toContainText('✓ Dentro da política de cancelamento');

    // Refund/billing information
    await expect(page.locator('[data-testid="billing-impact"]')).toBeVisible();
    await expect(page.locator('text=Sem cobrança de taxa')).toBeVisible();

    // Confirm cancellation
    await page.check('[data-testid="confirm-cancellation"]');
    await page.click('[data-testid="process-cancellation-btn"]');

    // Should show cancellation confirmation
    await expect(
      page.locator('text=Consulta cancelada com sucesso')
    ).toBeVisible();

    // Should send notifications
    await expect(
      page.locator('text=Médico notificado do cancelamento')
    ).toBeVisible();
    await expect(page.locator('text=Horário liberado na agenda')).toBeVisible();

    // Should update appointment status
    await expect(
      page.locator('[data-testid="appointment-status"]')
    ).toContainText('Cancelada');
  });

  test('should handle appointment reminders and confirmations', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-appointments"]');

    // Navigate to reminders management
    await page.click('[data-testid="reminders-tab"]');
    await expect(
      page.locator('[data-testid="reminders-dashboard"]')
    ).toBeVisible();

    // Should show upcoming appointments requiring reminders
    await expect(
      page.locator('[data-testid="upcoming-appointments"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="reminder-24h"]')).toBeVisible();
    await expect(page.locator('[data-testid="reminder-2h"]')).toBeVisible();

    // Configure reminder preferences
    await page.click('[data-testid="configure-reminders-btn"]');

    await page.check('[data-testid="reminder-sms"]');
    await page.check('[data-testid="reminder-email"]');
    await page.check('[data-testid="reminder-whatsapp"]');

    // Reminder timing
    await page.click('[data-testid="reminder-timing-24h"]');
    await page.click('[data-testid="reminder-timing-2h"]');

    // Reminder content customization
    await page.fill(
      '[data-testid="reminder-message"]',
      'Lembrete: Você tem consulta marcada para {date} às {time}. Por favor, chegue 15 minutos antes.'
    );

    await page.click('[data-testid="save-reminder-config"]');

    // Test manual reminder sending
    await page.click('[data-testid="send-manual-reminder"]');
    await page.click('[data-testid="appointment-select-reminder"]');
    await page.click('[data-testid="appointment-tomorrow-14:00"]');

    await page.click('[data-testid="send-reminder-now-btn"]');

    // Should show reminder sent confirmation
    await expect(
      page.locator('text=Lembrete enviado com sucesso')
    ).toBeVisible();
    await expect(page.locator('[data-testid="reminder-log"]')).toContainText(
      'Lembrete enviado por SMS'
    );

    // Patient confirmation handling
    await expect(
      page.locator('[data-testid="confirmation-responses"]')
    ).toBeVisible();

    // Simulate patient confirmation
    await page.click('[data-testid="simulate-patient-response"]');
    await page.click('[data-testid="response-confirmed"]');

    // Should update appointment status
    await expect(
      page.locator('[data-testid="appointment-status"]')
    ).toContainText('Confirmada pelo paciente');
  });

  test('should manage appointment waiting list', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');
    await page.click('[data-testid="waiting-list-tab"]');

    // Should show waiting list dashboard
    await expect(
      page.locator('[data-testid="waiting-list-dashboard"]')
    ).toBeVisible();

    // Add patient to waiting list
    await page.click('[data-testid="add-to-waiting-list-btn"]');

    await page.click('[data-testid="patient-search"]');
    await page.fill('[data-testid="patient-search"]', 'Ana Waiting');
    await page.click('[data-testid="patient-option-first"]');

    await page.click('[data-testid="preferred-doctor"]');
    await page.click('[data-testid="doctor-dr-silva"]');

    // Preferred time ranges
    await page.check('[data-testid="time-morning"]');
    await page.check('[data-testid="time-afternoon"]');

    // Urgency level
    await page.click('[data-testid="urgency-level"]');
    await page.click('[data-testid="urgency-routine"]');

    // Maximum wait time
    await page.click('[data-testid="max-wait-time"]');
    await page.click('[data-testid="wait-2weeks"]');

    await page.click('[data-testid="add-to-list-btn"]');

    // Should add to waiting list
    await expect(
      page.locator('text=Paciente adicionado à lista de espera')
    ).toBeVisible();

    // Should show in waiting list
    await expect(
      page.locator('[data-testid="waiting-list-item"]')
    ).toContainText('Ana Waiting');

    // Test automatic slot notification
    await page.click('[data-testid="simulate-slot-availability"]');

    // Should show notification sent
    await expect(page.locator('text=Vaga disponível notificada')).toBeVisible();
    await expect(
      page.locator('[data-testid="notification-sent"]')
    ).toContainText('SMS enviado com link para agendamento');

    // Should have time limit for response
    await expect(
      page.locator('[data-testid="response-deadline"]')
    ).toContainText('Resposta até: 2 horas');
  });
});
