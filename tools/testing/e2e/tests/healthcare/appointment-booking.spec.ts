import { expect, test } from '@playwright/test';

/**
 * 📅 CRITICAL Appointment Booking E2E Tests for NeonPro Healthcare
 * Tests complete appointment booking workflow including availability, conflicts, and confirmation
 */

test.describe('📅 Appointment Booking - Critical E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login');
    await page.fill('[data-testid="email"], input[type="email"]', 'medico@neonpro.com.br');
    await page.fill('[data-testid="password"], input[type="password"]', 'MedicoSecure123!');
    await page.click('[data-testid="login-submit"], button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.describe('🔍 Search Availability', () => {
    test('should display available appointment slots', async ({ page }) => {
      // Navigate to appointment scheduling
      await page.goto('/appointments/schedule');
      await page.waitForLoadState('networkidle');

      // Select doctor/professional
      const doctorSelect = page.locator('[data-testid="doctor-select"], select[name="doctor"]');
      if (await doctorSelect.count() > 0) {
        await doctorSelect.selectOption('dr-ana-silva');
      }

      // Select service/procedure type
      const serviceSelect = page.locator('[data-testid="service-select"], select[name="service"]');
      if (await serviceSelect.count() > 0) {
        await serviceSelect.selectOption('consulta-dermatologica');
      }

      // Select date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const dateInput = page.locator('[data-testid="date-select"], input[type="date"]');
      await dateInput.fill(tomorrowStr);

      // Search for availability
      const searchButton = page.locator('[data-testid="search-availability"], button:has-text("Buscar")');
      await searchButton.click();
      await page.waitForTimeout(2000);

      // Verify available slots are displayed
      const timeSlots = page.locator('[data-testid="time-slot"], .time-slot');
      await expect(timeSlots.first()).toBeVisible();

      // Verify slots show correct information
      await expect(timeSlots.first()).toContainText(/\d{2}:\d{2}/);
      
      // Verify available status
      const availableSlot = timeSlots.filter({ hasText: 'Disponível' }).first();
      await expect(availableSlot).toBeVisible();
    });

    test('should filter availability by doctor and service type', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Test different doctor selection
      const doctorSelect = page.locator('[data-testid="doctor-select"], select[name="doctor"]');
      
      // Select first doctor
      await doctorSelect.selectOption('dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      const anaSlots = await page.locator('[data-testid="time-slot"]').count();

      // Select different doctor
      await doctorSelect.selectOption('dr-carlos-santos');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      const carlosSlots = await page.locator('[data-testid="time-slot"]').count();

      // Slots should be different for different doctors
      expect(anaSlots).not.toBe(carlosSlots);
    });

    test('should show no availability message for unavailable dates', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Select a past date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await page.fill('[data-testid="date-select"]', yesterdayStr);
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      // Should show no availability message
      await expect(page.locator('[data-testid="no-availability"], .no-availability')).toBeVisible();
      await expect(page.locator(':has-text("Nenhum horário disponível")')).toBeVisible();
    });
  });

  test.describe('📝 Book Appointment', () => {
    test('should complete appointment booking with existing patient', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Search for availability
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.selectOption('[data-testid="service-select"]', 'consulta-dermatologica');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      // Select first available time slot
      const availableSlot = page.locator('[data-testid="time-slot"]:has-text("Disponível")').first();
      await availableSlot.click();

      // Patient selection/search
      const patientSearch = page.locator('[data-testid="patient-search"], input[name="patient"]');
      await patientSearch.fill('Maria Silva Santos');
      await page.waitForTimeout(1000);

      // Select patient from dropdown
      const patientOption = page.locator('[data-testid="patient-option"]:has-text("Maria Silva Santos")').first();
      if (await patientOption.count() > 0) {
        await patientOption.click();
      }

      // Fill appointment details
      await page.fill('[data-testid="appointment-notes"]', 'Consulta de rotina - avaliação dermatológica');
      
      // Select appointment type/priority
      const prioritySelect = page.locator('[data-testid="priority-select"]');
      if (await prioritySelect.count() > 0) {
        await prioritySelect.selectOption('routine');
      }

      // Confirm booking
      await page.click('[data-testid="confirm-booking"], button:has-text("Confirmar Agendamento")');
      await page.waitForTimeout(2000);

      // Verify success confirmation
      await expect(page.locator('[data-testid="booking-success"], .booking-success')).toBeVisible();
      await expect(page.locator(':has-text("Agendamento realizado com sucesso")')).toBeVisible();

      // Verify appointment details in confirmation
      await expect(page.locator('[data-testid="appointment-confirmation"]')).toContainText('Maria Silva Santos');
      await expect(page.locator('[data-testid="appointment-confirmation"]')).toContainText('Dr. Ana Silva');
      await expect(page.locator('[data-testid="appointment-confirmation"]')).toContainText('Consulta Dermatológica');
    });

    test('should handle new patient registration during booking', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Select availability
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      await page.locator('[data-testid="time-slot"]:has-text("Disponível")').first().click();

      // Try to search for non-existing patient
      await page.fill('[data-testid="patient-search"]', 'João da Silva Novo');
      await page.waitForTimeout(1000);

      // Click "Create New Patient" option
      const newPatientButton = page.locator('[data-testid="create-new-patient"], button:has-text("Novo Paciente")');
      await newPatientButton.click();

      // Fill new patient form
      await page.fill('[data-testid="patient-name"]', 'João da Silva Novo');
      await page.fill('[data-testid="patient-cpf"]', '123.456.789-01');
      await page.fill('[data-testid="patient-phone"]', '(11) 99999-8888');
      await page.fill('[data-testid="patient-email"]', 'joao.novo@email.com');
      await page.fill('[data-testid="patient-birthdate"]', '1985-03-15');

      // LGPD consent
      await page.check('[data-testid="lgpd-consent"]');

      // Save patient
      await page.click('[data-testid="save-patient"], button:has-text("Salvar Paciente")');
      await page.waitForTimeout(1000);

      // Continue with appointment booking
      await page.fill('[data-testid="appointment-notes"]', 'Primeira consulta - paciente novo');
      await page.click('[data-testid="confirm-booking"]');
      await page.waitForTimeout(2000);

      // Verify successful booking
      await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
      await expect(page.locator(':has-text("João da Silva Novo")')).toBeVisible();
    });
  });
  test.describe('⚠️ Conflict Resolution', () => {
    test('should detect and handle appointment conflicts', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Select same time slot that's already booked
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      // Try to book an already occupied slot
      const occupiedSlot = page.locator('[data-testid="time-slot"]:has-text("Ocupado")').first();
      if (await occupiedSlot.count() > 0) {
        await occupiedSlot.click();

        // Should show conflict warning
        await expect(page.locator('[data-testid="conflict-warning"], .conflict-warning')).toBeVisible();
        await expect(page.locator(':has-text("Horário já ocupado")')).toBeVisible();

        // Should suggest alternative times
        await expect(page.locator('[data-testid="alternative-times"], .alternative-suggestions')).toBeVisible();
        
        // Click on suggested alternative
        const alternativeSlot = page.locator('[data-testid="alternative-slot"]').first();
        await alternativeSlot.click();

        // Should update selected time
        await expect(page.locator('[data-testid="selected-time"]')).not.toContainText('Ocupado');
      }
    });

    test('should handle double-booking attempts', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // First booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      const availableSlot = page.locator('[data-testid="time-slot"]:has-text("Disponível")').first();
      await availableSlot.click();

      await page.fill('[data-testid="patient-search"]', 'Maria Silva');
      await page.waitForTimeout(500);
      await page.locator('[data-testid="patient-option"]').first().click();
      
      await page.click('[data-testid="confirm-booking"]');
      await page.waitForTimeout(1000);

      // Simulate another user trying to book same slot
      await page.goto('/appointments/schedule');
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      // Slot should now show as occupied
      const refreshedSlot = page.locator('[data-testid="time-slot"]').first();
      await expect(refreshedSlot).toContainText('Ocupado');
      
      // Should not be clickable
      await expect(refreshedSlot).toHaveClass(/disabled|occupied/);
    });

    test('should validate appointment duration conflicts', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Select a procedure with longer duration
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.selectOption('[data-testid="service-select"]', 'procedimento-cirurgico'); // 2-hour procedure
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      // Select a time slot
      const timeSlot = page.locator('[data-testid="time-slot"]:has-text("14:00")').first();
      if (await timeSlot.count() > 0) {
        await timeSlot.click();

        // Should show duration warning if conflicts with next appointment
        const durationWarning = page.locator('[data-testid="duration-conflict"], .duration-warning');
        if (await durationWarning.count() > 0) {
          await expect(durationWarning).toBeVisible();
          await expect(durationWarning).toContainText('conflito de duração');

          // Should suggest alternative time
          await expect(page.locator('[data-testid="suggested-time"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('✅ Confirmation Flow', () => {
    test('should send confirmation notifications', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Complete a booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      await page.locator('[data-testid="time-slot"]:has-text("Disponível")').first().click();
      await page.fill('[data-testid="patient-search"]', 'Maria Silva');
      await page.waitForTimeout(500);
      await page.locator('[data-testid="patient-option"]').first().click();

      // Enable notifications
      const smsNotification = page.locator('[data-testid="enable-sms"]');
      const emailNotification = page.locator('[data-testid="enable-email"]');
      
      if (await smsNotification.count() > 0) {
        await smsNotification.check();
      }
      if (await emailNotification.count() > 0) {
        await emailNotification.check();
      }

      await page.click('[data-testid="confirm-booking"]');
      await page.waitForTimeout(2000);

      // Verify confirmation screen
      await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
      
      // Check notification confirmations
      if (await page.locator('[data-testid="sms-sent"]').count() > 0) {
        await expect(page.locator('[data-testid="sms-sent"]')).toContainText('SMS enviado');
      }
      if (await page.locator('[data-testid="email-sent"]').count() > 0) {
        await expect(page.locator('[data-testid="email-sent"]')).toContainText('Email enviado');
      }
    });

    test('should generate appointment summary and calendar entry', async ({ page }) => {
      await page.goto('/appointments/schedule');

      // Complete booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      await page.locator('[data-testid="time-slot"]:has-text("Disponível")').first().click();
      await page.fill('[data-testid="patient-search"]', 'Maria Silva');
      await page.waitForTimeout(500);
      await page.locator('[data-testid="patient-option"]').first().click();
      
      await page.fill('[data-testid="appointment-notes"]', 'Consulta de acompanhamento');
      await page.click('[data-testid="confirm-booking"]');
      await page.waitForTimeout(2000);

      // Verify appointment summary
      const summary = page.locator('[data-testid="appointment-summary"]');
      await expect(summary).toBeVisible();
      await expect(summary).toContainText('Maria Silva');
      await expect(summary).toContainText('Dr. Ana Silva');
      await expect(summary).toContainText(tomorrow.toLocaleDateString('pt-BR'));

      // Check calendar integration options
      const calendarDownload = page.locator('[data-testid="download-calendar"], a:has-text("Adicionar ao Calendário")');
      if (await calendarDownload.count() > 0) {
        await expect(calendarDownload).toBeVisible();
        // Verify calendar file would be generated
        await expect(calendarDownload).toHaveAttribute('href', /\.ics$/);
      }

      // Verify print option
      const printButton = page.locator('[data-testid="print-summary"], button:has-text("Imprimir")');
      if (await printButton.count() > 0) {
        await expect(printButton).toBeVisible();
      }
    });

    test('should handle appointment modifications after booking', async ({ page }) => {
      // First, create an appointment to modify
      await page.goto('/appointments/schedule');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0]);
      await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
      await page.click('[data-testid="search-availability"]');
      await page.waitForTimeout(1000);

      await page.locator('[data-testid="time-slot"]:has-text("Disponível")').first().click();
      await page.fill('[data-testid="patient-search"]', 'Maria Silva');
      await page.waitForTimeout(500);
      await page.locator('[data-testid="patient-option"]').first().click();
      await page.click('[data-testid="confirm-booking"]');
      await page.waitForTimeout(2000);

      // Get appointment ID from URL or confirmation
      const appointmentId = await page.locator('[data-testid="appointment-id"]').textContent();

      // Navigate to appointment details
      await page.goto('/appointments');
      const appointmentRow = page.locator(`[data-testid="appointment-${appointmentId}"]`);
      await appointmentRow.click();

      // Modify appointment
      const editButton = page.locator('[data-testid="edit-appointment"], button:has-text("Editar")');
      if (await editButton.count() > 0) {
        await editButton.click();

        // Change appointment time
        await page.selectOption('[data-testid="new-time"]', '15:00');
        await page.fill('[data-testid="modification-reason"]', 'Reagendamento por solicitação do paciente');
        
        await page.click('[data-testid="confirm-modification"]');
        await page.waitForTimeout(1000);

        // Verify modification success
        await expect(page.locator('[data-testid="modification-success"]')).toBeVisible();
        await expect(page.locator(':has-text("Agendamento modificado com sucesso")')).toBeVisible();
      }
    });

    test('should allow appointment cancellation with proper workflow', async ({ page }) => {
      // Navigate to appointments list
      await page.goto('/appointments');
      
      // Find an existing appointment to cancel
      const appointmentRow = page.locator('[data-testid="appointment-row"]').first();
      await appointmentRow.click();

      // Cancel appointment
      const cancelButton = page.locator('[data-testid="cancel-appointment"], button:has-text("Cancelar")');
      if (await cancelButton.count() > 0) {
        await cancelButton.click();

        // Fill cancellation form
        await page.selectOption('[data-testid="cancellation-reason"]', 'paciente-solicitou');
        await page.fill('[data-testid="cancellation-notes"]', 'Paciente precisou cancelar por motivos pessoais');
        
        // Select refund option if applicable
        const refundOption = page.locator('[data-testid="process-refund"]');
        if (await refundOption.count() > 0) {
          await refundOption.check();
        }

        // Confirm cancellation
        await page.click('[data-testid="confirm-cancellation"]');
        await page.waitForTimeout(1000);

        // Verify cancellation
        await expect(page.locator('[data-testid="cancellation-success"]')).toBeVisible();
        await expect(page.locator(':has-text("Agendamento cancelado com sucesso")')).toBeVisible();

        // Verify appointment status updated
        await expect(page.locator('[data-testid="appointment-status"]')).toContainText('Cancelado');
      }
    });
  });

  test.describe('🚀 Performance Validation', () => {
    test('should load appointment calendar within performance targets', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/appointments/schedule');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Calendar should be interactive
      await expect(page.locator('[data-testid="date-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="doctor-select"]')).toBeVisible();
    });

    test('should handle rapid booking attempts efficiently', async ({ page }) => {
      await page.goto('/appointments/schedule');
      
      // Perform rapid searches
      const searches = [];
      for (let i = 0; i < 5; i++) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + i + 1);
        
        searches.push(
          page.fill('[data-testid="date-select"]', tomorrow.toISOString().split('T')[0])
            .then(() => page.click('[data-testid="search-availability"]'))
        );
      }
      
      const startTime = Date.now();
      await Promise.all(searches);
      const totalTime = Date.now() - startTime;
      
      // All searches should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 searches
      
      // Results should be displayed
      await expect(page.locator('[data-testid="time-slot"]')).toBeVisible();
    });
  });
});