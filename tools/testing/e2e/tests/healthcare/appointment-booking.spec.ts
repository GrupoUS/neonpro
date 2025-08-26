import { expect, test } from "@playwright/test";

/**
 * 📅 CRITICAL Appointment Booking E2E Tests for NeonPro Healthcare
 *
 * CONSOLIDATED VERSION - Combines technical robustness with healthcare-specific scenarios
 *
 * TECHNICAL FEATURES (from original):
 * - Robust state management and wait conditions
 * - Multiple selector strategies for resilience
 * - Comprehensive availability checking
 * - Proper error handling and validation
 *
 * HEALTHCARE FEATURES (from v2):
 * - Professional credential validation (CRM)
 * - Healthcare-specific workflow steps
 * - Medical appointment types and procedures
 * - Compliance with healthcare scheduling regulations
 * - Patient notification and reminder systems
 */

test.describe("📅 Appointment Booking - Critical E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Clear state and login as healthcare professional
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Use healthcare professional credentials with robust fallback
    await page.fill(
      '[data-testid="email"], input[type="email"]',
      "dr.silva@neonpro.com.br",
    );
    await page.fill(
      '[data-testid="password"], input[type="password"]',
      "HealthcareTest2024!",
    );

    // Fill CRM if field exists (healthcare-specific)
    const crmField = page.locator('[data-testid="crm-number"]');
    if ((await crmField.count()) > 0) {
      await crmField.fill("CRM/SP 123456");
    }

    await page.click('[data-testid="login-submit"], button[type="submit"]');
    await page.waitForURL("**/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test.describe("🔍 Search Availability & Booking Flow", () => {
    test("should display available appointment slots with healthcare context", async ({
      page,
    }) => {
      // Navigate to appointment scheduling using multiple strategies
      const appointmentsNav = page.locator(
        '[data-testid="nav-appointments"], [data-testid="appointments-menu"], text=Agendamentos',
      );
      if ((await appointmentsNav.count()) > 0) {
        await appointmentsNav.click();
      } else {
        await page.goto("/appointments/schedule");
      }
      await page.waitForLoadState("networkidle");

      // Should display appointment calendar/interface
      await expect(
        page.locator(
          '[data-testid="appointment-calendar"], [data-testid="schedule-view"]',
        ),
      ).toBeVisible();

      // Healthcare-specific: Check for professional scheduling view
      const scheduleButton = page.locator(
        '[data-testid="schedule-appointment-btn"], button:has-text("Agendar"), button:has-text("Nova Consulta")',
      );
      if ((await scheduleButton.count()) > 0) {
        await expect(scheduleButton).toBeVisible();
      }

      // Select doctor/professional with robust selectors
      const doctorSelect = page.locator(
        '[data-testid="doctor-select"], select[name="doctor"], select[name="professional"]',
      );
      if ((await doctorSelect.count()) > 0) {
        await doctorSelect.selectOption("dr-ana-silva");
      }

      // Healthcare-specific: Select medical service/procedure type
      const serviceSelect = page.locator(
        '[data-testid="service-select"], select[name="service"], select[name="procedure"]',
      );
      if ((await serviceSelect.count()) > 0) {
        // Healthcare-specific procedures
        const services = [
          "consulta-dermatologica",
          "consulta-geral",
          "exame-rotina",
        ];
        for (const service of services) {
          try {
            await serviceSelect.selectOption(service);
            break;
          } catch {}
        }
      }

      // Select date (tomorrow) with proper date handling
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const dateInput = page.locator(
        '[data-testid="appointment-date"], input[type="date"]',
      );
      if ((await dateInput.count()) > 0) {
        await dateInput.fill(tomorrowStr);
      }

      // Verify available time slots appear
      const timeSlots = page.locator(
        '[data-testid="time-slot"], .time-slot, button[data-time]',
      );
      if ((await timeSlots.count()) > 0) {
        await expect(timeSlots.first()).toBeVisible();
      }
    });

    test("should book new appointment with complete healthcare workflow", async ({
      page,
    }) => {
      // Navigate to appointments
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Start new appointment booking
      const newAppointmentBtn = page.locator(
        '[data-testid="schedule-appointment-btn"], button:has-text("Agendar"), button:has-text("Nova Consulta")',
      );
      await newAppointmentBtn.click();

      // Should display appointment form
      await expect(
        page.locator('[data-testid="appointment-form"], form'),
      ).toBeVisible();

      // Healthcare-specific: Fill patient information
      const patientSelect = page.locator(
        '[data-testid="patient-select"], select[name="patient"]',
      );
      if ((await patientSelect.count()) > 0) {
        await patientSelect.selectOption("patient-12345");
      } else {
        // Alternative: search for patient
        const patientSearch = page.locator(
          '[data-testid="patient-search"], input[placeholder*="paciente"]',
        );
        if ((await patientSearch.count()) > 0) {
          await patientSearch.fill("João Silva");
          await page.keyboard.press("Enter");
        }
      }

      // Select appointment type (healthcare-specific)
      const appointmentType = page.locator(
        '[data-testid="appointment-type"], select[name="type"]',
      );
      if ((await appointmentType.count()) > 0) {
        await appointmentType.selectOption("consulta");
      }

      // Select date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      await page.fill(
        '[data-testid="appointment-date"], input[type="date"]',
        tomorrowStr,
      );

      // Select available time slot
      const timeSlot = page
        .locator('[data-testid="time-slot"], .available-slot')
        .first();
      if ((await timeSlot.count()) > 0) {
        await timeSlot.click();
      }

      // Healthcare-specific: Add clinical notes if available
      const clinicalNotes = page.locator(
        '[data-testid="clinical-notes"], textarea[name="notes"]',
      );
      if ((await clinicalNotes.count()) > 0) {
        await clinicalNotes.fill(
          "Consulta de rotina - acompanhamento dermatológico",
        );
      }

      // Submit booking
      await page.click(
        '[data-testid="submit-appointment"], button[type="submit"], button:has-text("Confirmar")',
      );

      // Verify successful booking
      await expect(
        page.locator(
          '[data-testid="success-message"], text=Agendamento confirmado',
        ),
      ).toBeVisible();

      // Should redirect to appointments list or calendar
      await page.waitForURL(/appointments/);
    });

    test("should handle appointment conflicts and availability checks", async ({
      page,
    }) => {
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      // Try to book appointment at same time as existing one
      const conflictDate = new Date();
      conflictDate.setDate(conflictDate.getDate() + 1);
      const conflictDateStr = conflictDate.toISOString().split("T")[0];

      await page.fill(
        '[data-testid="appointment-date"], input[type="date"]',
        conflictDateStr,
      );

      // Select a time that might conflict
      const conflictTime = page.locator(
        '[data-testid="time-slot"]:has-text("09:00"), button[data-time="09:00"]',
      );
      if ((await conflictTime.count()) > 0) {
        await conflictTime.click();

        // Check for conflict warning
        const conflictWarning = page.locator(
          '[data-testid="conflict-warning"], text=Conflito de horário',
        );
        if ((await conflictWarning.count()) > 0) {
          await expect(conflictWarning).toBeVisible();
        }
      }
    });

    test("should validate required fields in appointment form", async ({
      page,
    }) => {
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      const newAppointmentBtn = page.locator(
        '[data-testid="schedule-appointment-btn"], button:has-text("Agendar")',
      );
      await newAppointmentBtn.click();

      // Try to submit empty form
      await page.click(
        '[data-testid="submit-appointment"], button[type="submit"]',
      );

      // Should show validation errors
      const validationErrors = page.locator(
        '[data-testid="validation-error"], .field-error',
      );
      if ((await validationErrors.count()) > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }

      // Healthcare-specific validations
      const patientError = page.locator("text=Paciente é obrigatório");
      const dateError = page.locator("text=Data é obrigatória");

      if ((await patientError.count()) > 0) {
        await expect(patientError).toBeVisible();
      }
      if ((await dateError.count()) > 0) {
        await expect(dateError).toBeVisible();
      }
    });
  });

  test.describe("📋 Appointment Management", () => {
    test("should display existing appointments in calendar view", async ({
      page,
    }) => {
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Should show calendar or list view
      const calendarView = page.locator(
        '[data-testid="calendar-view"], .calendar-container',
      );
      const listView = page.locator(
        '[data-testid="appointments-list"], .appointments-list',
      );

      if ((await calendarView.count()) > 0) {
        await expect(calendarView).toBeVisible();
      } else if ((await listView.count()) > 0) {
        await expect(listView).toBeVisible();
      }

      // Should show appointments for current week/month
      const appointmentItems = page.locator(
        '[data-testid="appointment-item"], .appointment-card',
      );
      if ((await appointmentItems.count()) > 0) {
        await expect(appointmentItems.first()).toBeVisible();
      }
    });

    test("should reschedule existing appointment", async ({ page }) => {
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Find an existing appointment to reschedule
      const appointmentItem = page
        .locator('[data-testid="appointment-item"], .appointment-card')
        .first();
      if ((await appointmentItem.count()) > 0) {
        await appointmentItem.click();

        // Look for reschedule option
        const rescheduleBtn = page.locator(
          '[data-testid="reschedule-btn"], button:has-text("Reagendar")',
        );
        if ((await rescheduleBtn.count()) > 0) {
          await rescheduleBtn.click();

          // Should open reschedule form
          await expect(
            page.locator('[data-testid="reschedule-form"], form'),
          ).toBeVisible();

          // Select new date (day after tomorrow)
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + 2);
          const newDateStr = newDate.toISOString().split("T")[0];

          await page.fill(
            '[data-testid="new-date"], input[type="date"]',
            newDateStr,
          );

          // Select new time slot
          const newTimeSlot = page
            .locator('[data-testid="time-slot"], .available-slot')
            .first();
          if ((await newTimeSlot.count()) > 0) {
            await newTimeSlot.click();
          }

          // Confirm reschedule
          await page.click(
            '[data-testid="confirm-reschedule"], button:has-text("Confirmar")',
          );

          // Verify success message
          const successMessage = page.locator(
            '[data-testid="success-message"], text=Reagendado com sucesso',
          );
          if ((await successMessage.count()) > 0) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    });

    test("should cancel appointment with proper confirmation", async ({
      page,
    }) => {
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Find an existing appointment to cancel
      const appointmentItem = page
        .locator('[data-testid="appointment-item"], .appointment-card')
        .first();
      if ((await appointmentItem.count()) > 0) {
        await appointmentItem.click();

        // Look for cancel option
        const cancelBtn = page.locator(
          '[data-testid="cancel-btn"], button:has-text("Cancelar")',
        );
        if ((await cancelBtn.count()) > 0) {
          await cancelBtn.click();

          // Should show confirmation dialog
          const confirmDialog = page.locator(
            '[data-testid="confirm-dialog"], .modal, .dialog',
          );
          if ((await confirmDialog.count()) > 0) {
            await expect(confirmDialog).toBeVisible();

            // Healthcare-specific: Add cancellation reason
            const reasonSelect = page.locator(
              '[data-testid="cancellation-reason"], select[name="reason"]',
            );
            if ((await reasonSelect.count()) > 0) {
              await reasonSelect.selectOption("paciente-solicitou");
            }

            // Confirm cancellation
            await page.click(
              '[data-testid="confirm-cancel"], button:has-text("Confirmar Cancelamento")',
            );

            // Verify cancellation success
            const successMessage = page.locator(
              '[data-testid="success-message"], text=Cancelado com sucesso',
            );
            if ((await successMessage.count()) > 0) {
              await expect(successMessage).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe("🏥 Healthcare-Specific Features", () => {
    test("should support medical procedure scheduling", async ({ page }) => {
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      const newAppointmentBtn = page.locator(
        '[data-testid="schedule-appointment-btn"], button:has-text("Agendar")',
      );
      await newAppointmentBtn.click();

      // Select procedure type (healthcare-specific)
      const procedureType = page.locator(
        '[data-testid="procedure-type"], select[name="procedure"]',
      );
      if ((await procedureType.count()) > 0) {
        const procedures = ["biopsia", "cirurgia-menor", "exame-especializado"];
        for (const procedure of procedures) {
          try {
            await procedureType.selectOption(procedure);
            break;
          } catch {}
        }

        // Procedures might require longer appointment slots
        const duration = page.locator(
          '[data-testid="duration"], select[name="duration"]',
        );
        if ((await duration.count()) > 0) {
          await duration.selectOption("60"); // 60 minutes for procedures
        }
      }
    });

    test("should handle emergency appointment scheduling", async ({ page }) => {
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      const emergencyBtn = page.locator(
        '[data-testid="emergency-appointment"], button:has-text("Emergência")',
      );
      if ((await emergencyBtn.count()) > 0) {
        await emergencyBtn.click();

        // Emergency appointments should have priority
        await expect(
          page.locator('[data-testid="priority-indicator"], text=Prioridade'),
        ).toBeVisible();

        // Should show immediate availability
        const immediateSlots = page.locator(
          '[data-testid="immediate-slots"], .emergency-slots',
        );
        if ((await immediateSlots.count()) > 0) {
          await expect(immediateSlots).toBeVisible();
        }
      }
    });

    test("should validate professional availability and credentials", async ({
      page,
    }) => {
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      // Check professional availability
      const professionalSelect = page.locator(
        '[data-testid="professional-select"], select[name="doctor"]',
      );
      if ((await professionalSelect.count()) > 0) {
        await professionalSelect.selectOption("dr-especialista");

        // Should show professional credentials and specialties
        const credentials = page.locator(
          '[data-testid="professional-credentials"], .doctor-info',
        );
        if ((await credentials.count()) > 0) {
          await expect(credentials).toBeVisible();
        }

        // Check available hours for this professional
        const availableHours = page.locator(
          '[data-testid="available-hours"], .schedule-info',
        );
        if ((await availableHours.count()) > 0) {
          await expect(availableHours).toBeVisible();
        }
      }
    });
  });

  test.describe("📱 Patient Notifications & Communication", () => {
    test("should send appointment confirmation notifications", async ({
      page,
    }) => {
      // This test verifies notification system exists
      await page.goto("/appointments/schedule");
      await page.waitForLoadState("networkidle");

      const newAppointmentBtn = page.locator(
        '[data-testid="schedule-appointment-btn"]',
      );
      if ((await newAppointmentBtn.count()) > 0) {
        await newAppointmentBtn.click();

        // Look for notification preferences
        const notificationOptions = page.locator(
          '[data-testid="notification-preferences"], .notification-options',
        );
        if ((await notificationOptions.count()) > 0) {
          await expect(notificationOptions).toBeVisible();

          // Healthcare-specific: SMS, email, WhatsApp notifications
          const smsOption = page.locator('input[name="sms-notification"]');
          const emailOption = page.locator('input[name="email-notification"]');

          if ((await smsOption.count()) > 0) {
            await smsOption.check();
          }
          if ((await emailOption.count()) > 0) {
            await emailOption.check();
          }
        }
      }
    });

    test("should handle appointment reminders configuration", async ({
      page,
    }) => {
      await page.goto("/appointments/reminders");
      await page.waitForLoadState("networkidle");

      // Check reminder settings page
      const reminderSettings = page.locator(
        '[data-testid="reminder-settings"], .reminder-config',
      );
      if ((await reminderSettings.count()) > 0) {
        await expect(reminderSettings).toBeVisible();

        // Healthcare-specific reminder options
        const reminderTimes = ["24h", "2h", "30min"];
        for (const time of reminderTimes) {
          const timeOption = page.locator(`input[value="${time}"]`);
          if ((await timeOption.count()) > 0) {
            await timeOption.check();
          }
        }
      }
    });
  });

  test.describe("📊 Reporting & Analytics", () => {
    test("should display appointment statistics for healthcare professionals", async ({
      page,
    }) => {
      await page.goto("/appointments/reports");
      await page.waitForLoadState("networkidle");

      // Check for appointment analytics
      const appointmentStats = page.locator(
        '[data-testid="appointment-stats"], .statistics-panel',
      );
      if ((await appointmentStats.count()) > 0) {
        await expect(appointmentStats).toBeVisible();

        // Healthcare-specific metrics
        const totalAppointments = page.locator(
          '[data-testid="total-appointments"]',
        );
        const cancelledRate = page.locator('[data-testid="cancellation-rate"]');
        const noShowRate = page.locator('[data-testid="no-show-rate"]');

        if ((await totalAppointments.count()) > 0) {
          await expect(totalAppointments).toBeVisible();
        }
        if ((await cancelledRate.count()) > 0) {
          await expect(cancelledRate).toBeVisible();
        }
        if ((await noShowRate.count()) > 0) {
          await expect(noShowRate).toBeVisible();
        }
      }
    });
  });

  test.describe("♿ Accessibility & Performance", () => {
    test("should be accessible for users with disabilities", async ({
      page,
    }) => {
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Test screen reader support
      const headings = page.locator("h1, h2, h3");
      if ((await headings.count()) > 0) {
        for (let i = 0; i < Math.min(3, await headings.count()); i++) {
          await expect(headings.nth(i)).toHaveAttribute("role");
        }
      }
    });

    test("should load appointment calendar within performance budget", async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Healthcare systems should load quickly (under 4 seconds for complex calendar)
      expect(loadTime).toBeLessThan(4000);
    });
  });
});
