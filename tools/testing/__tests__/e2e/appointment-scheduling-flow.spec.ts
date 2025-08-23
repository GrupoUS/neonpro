import { expect, test } from "@playwright/test";

test.describe("Complete Appointment Scheduling Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/login");
		await page.fill('input[type="email"]', "doctor@neonpro.com");
		await page.fill('input[type="password"]', "doctorpassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test("should display appointment calendar correctly", async ({ page }) => {
		// Navigate to appointments
		await page.click('[data-testid="nav-appointments"]');
		await expect(page).toHaveURL(/\/appointments/);

		// Should display calendar view
		await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
		await expect(page.locator('[data-testid="calendar-header"]')).toBeVisible();

		// Should display current month/year
		const currentDate = new Date();
		const monthYear = currentDate.toLocaleDateString("pt-BR", {
			month: "long",
			year: "numeric",
		});
		await expect(
			page.locator('[data-testid="calendar-month-year"]'),
		).toContainText(monthYear);

		// Should show week days
		await expect(page.locator("text=Segunda")).toBeVisible();
		await expect(page.locator("text=Terça")).toBeVisible();
		await expect(page.locator("text=Quarta")).toBeVisible();
	});

	test("should create new appointment successfully", async ({ page }) => {
		await page.goto("/appointments");

		// Click to create new appointment
		await page.click('[data-testid="new-appointment-btn"]');

		// Should open appointment form modal
		await expect(
			page.locator('[data-testid="appointment-form-modal"]'),
		).toBeVisible();

		// Select patient
		await page.click('[data-testid="patient-select"]');
		await page.fill('[data-testid="patient-search-input"]', "João Silva");
		await page.click('[data-testid="patient-option-joao-silva"]');

		// Select date and time
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

		await page.fill('[data-testid="appointment-date"]', tomorrowStr);
		await page.click('[data-testid="appointment-time"]');
		await page.click('[data-testid="time-option-09-00"]');

		// Select appointment type
		await page.click('[data-testid="appointment-type-select"]');
		await page.click('[data-testid="appointment-type-consultation"]');

		// Add notes
		await page.fill(
			'[data-testid="appointment-notes"]',
			"Consulta de rotina - verificar pressão arterial",
		);

		// Set duration
		await page.click('[data-testid="duration-select"]');
		await page.click('[data-testid="duration-30min"]');

		// Save appointment
		await page.click('[data-testid="save-appointment-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Consulta agendada com sucesso"),
		).toBeVisible();

		// Should close modal
		await expect(
			page.locator('[data-testid="appointment-form-modal"]'),
		).toBeHidden();

		// Should see appointment in calendar
		await expect(
			page.locator(`[data-testid="appointment-${tomorrowStr}"]`),
		).toBeVisible();
		await expect(page.locator("text=João Silva")).toBeVisible();
	});

	test("should handle appointment conflicts", async ({ page }) => {
		await page.goto("/appointments");

		// Try to create appointment at same time as existing one
		await page.click('[data-testid="new-appointment-btn"]');

		// Select patient
		await page.click('[data-testid="patient-select"]');
		await page.fill('[data-testid="patient-search-input"]', "Maria Santos");
		await page.click('[data-testid="patient-option-maria-santos"]');

		// Select same date/time as existing appointment
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

		await page.fill('[data-testid="appointment-date"]', tomorrowStr);
		await page.click('[data-testid="appointment-time"]');
		await page.click('[data-testid="time-option-09-00"]'); // Same time as previous test

		// Try to save
		await page.click('[data-testid="save-appointment-btn"]');

		// Should show conflict warning
		await expect(
			page.locator('[data-testid="conflict-warning"]'),
		).toBeVisible();
		await expect(
			page.locator("text=Conflito de horário detectado"),
		).toBeVisible();

		// Should suggest alternative times
		await expect(page.locator('[data-testid="suggested-times"]')).toBeVisible();

		// Select suggested time
		await page.click('[data-testid="suggested-time-09-30"]');

		// Save with new time
		await page.click('[data-testid="save-appointment-btn"]');

		// Should succeed
		await expect(
			page.locator("text=Consulta agendada com sucesso"),
		).toBeVisible();
	});

	test("should edit existing appointment", async ({ page }) => {
		await page.goto("/appointments");

		// Click on existing appointment
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

		await page.click(`[data-testid="appointment-${tomorrowStr}"]`);

		// Should open appointment details modal
		await expect(
			page.locator('[data-testid="appointment-details-modal"]'),
		).toBeVisible();

		// Click edit
		await page.click('[data-testid="edit-appointment-btn"]');

		// Should switch to edit mode
		await expect(
			page.locator('[data-testid="appointment-form-modal"]'),
		).toBeVisible();

		// Change appointment time
		await page.click('[data-testid="appointment-time"]');
		await page.click('[data-testid="time-option-10-00"]');

		// Update notes
		await page.fill(
			'[data-testid="appointment-notes"]',
			"Consulta de rotina - verificar pressão arterial e peso",
		);

		// Save changes
		await page.click('[data-testid="save-appointment-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Consulta atualizada com sucesso"),
		).toBeVisible();

		// Should see updated time in calendar
		await expect(page.locator("text=10:00")).toBeVisible();
	});

	test("should cancel appointment with proper workflow", async ({ page }) => {
		await page.goto("/appointments");

		// Click on appointment
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

		await page.click(`[data-testid="appointment-${tomorrowStr}"]`);

		// Click cancel appointment
		await page.click('[data-testid="cancel-appointment-btn"]');

		// Should show cancellation confirmation
		await expect(
			page.locator('[data-testid="cancel-confirmation-modal"]'),
		).toBeVisible();

		// Select cancellation reason
		await page.click('[data-testid="cancellation-reason-select"]');
		await page.click('[data-testid="reason-patient-request"]');

		// Add cancellation notes
		await page.fill(
			'[data-testid="cancellation-notes"]',
			"Paciente solicitou reagendamento",
		);

		// Option to notify patient
		await page.check('[data-testid="notify-patient-checkbox"]');

		// Confirm cancellation
		await page.click('[data-testid="confirm-cancellation-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Consulta cancelada com sucesso"),
		).toBeVisible();

		// Should remove appointment from calendar (or mark as cancelled)
		await expect(
			page.locator(`[data-testid="appointment-${tomorrowStr}"]`),
		).toHaveClass(/cancelled/);
	});

	test("should handle recurring appointments", async ({ page }) => {
		await page.goto("/appointments");

		// Create new appointment
		await page.click('[data-testid="new-appointment-btn"]');

		// Fill basic appointment details
		await page.click('[data-testid="patient-select"]');
		await page.fill('[data-testid="patient-search-input"]', "João Silva");
		await page.click('[data-testid="patient-option-joao-silva"]');

		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		const nextWeekStr = nextWeek.toLocaleDateString("pt-BR");

		await page.fill('[data-testid="appointment-date"]', nextWeekStr);
		await page.click('[data-testid="appointment-time"]');
		await page.click('[data-testid="time-option-14-00"]');

		// Enable recurring appointment
		await page.check('[data-testid="recurring-appointment-checkbox"]');

		// Select recurrence pattern
		await page.click('[data-testid="recurrence-pattern-select"]');
		await page.click('[data-testid="pattern-weekly"]');

		// Set number of occurrences
		await page.fill('[data-testid="occurrences-count"]', "4");

		// Save recurring appointment series
		await page.click('[data-testid="save-appointment-btn"]');

		// Should show confirmation for series
		await expect(
			page.locator("text=Série de consultas criada com sucesso"),
		).toBeVisible();

		// Should see multiple appointments in calendar
		await expect(page.locator('[data-testid^="appointment-"]')).toHaveCount(4);
	});

	test("should manage appointment reminders", async ({ page }) => {
		await page.goto("/appointments");

		// Click on existing appointment
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

		await page.click(`[data-testid="appointment-${tomorrowStr}"]`);

		// Navigate to reminders tab
		await page.click('[data-testid="reminders-tab"]');

		// Should see reminder options
		await expect(
			page.locator('[data-testid="reminder-settings"]'),
		).toBeVisible();

		// Enable SMS reminder
		await page.check('[data-testid="sms-reminder-checkbox"]');

		// Set reminder time
		await page.click('[data-testid="sms-reminder-time"]');
		await page.click('[data-testid="reminder-24h-before"]');

		// Enable email reminder
		await page.check('[data-testid="email-reminder-checkbox"]');
		await page.click('[data-testid="email-reminder-time"]');
		await page.click('[data-testid="reminder-2h-before"]');

		// Save reminder settings
		await page.click('[data-testid="save-reminders-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Lembretes configurados com sucesso"),
		).toBeVisible();

		// Should display active reminders
		await expect(
			page.locator('[data-testid="active-reminders-list"]'),
		).toContainText("SMS - 24h antes");
		await expect(
			page.locator('[data-testid="active-reminders-list"]'),
		).toContainText("Email - 2h antes");
	});

	test("should handle appointment check-in process", async ({ page }) => {
		await page.goto("/appointments");

		// Should see today's appointments
		await expect(
			page.locator('[data-testid="todays-appointments"]'),
		).toBeVisible();

		// Click on appointment that's ready for check-in
		await page.click('[data-testid="appointment-ready-checkin"]');

		// Should see check-in button
		await expect(page.locator('[data-testid="checkin-btn"]')).toBeVisible();

		// Perform check-in
		await page.click('[data-testid="checkin-btn"]');

		// Should update appointment status
		await expect(
			page.locator('[data-testid="appointment-status"]'),
		).toContainText("Paciente Presente");

		// Should show check-in time
		await expect(page.locator('[data-testid="checkin-time"]')).toBeVisible();

		// Should enable "Start Consultation" button
		await expect(
			page.locator('[data-testid="start-consultation-btn"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-testid="start-consultation-btn"]'),
		).toBeEnabled();
	});

	test("should handle no-show appointments", async ({ page }) => {
		await page.goto("/appointments");

		// Click on overdue appointment
		await page.click('[data-testid="appointment-overdue"]');

		// Should see no-show option
		await expect(
			page.locator('[data-testid="mark-no-show-btn"]'),
		).toBeVisible();

		// Mark as no-show
		await page.click('[data-testid="mark-no-show-btn"]');

		// Should show confirmation dialog
		await expect(
			page.locator('[data-testid="no-show-confirmation"]'),
		).toBeVisible();

		// Add no-show reason
		await page.fill(
			'[data-testid="no-show-reason"]',
			"Paciente não compareceu e não justificou ausência",
		);

		// Option to charge no-show fee
		await page.check('[data-testid="charge-no-show-fee-checkbox"]');

		// Confirm no-show
		await page.click('[data-testid="confirm-no-show-btn"]');

		// Should update appointment status
		await expect(
			page.locator('[data-testid="appointment-status"]'),
		).toContainText("Não Compareceu");

		// Should show no-show fee in billing
		await expect(
			page.locator('[data-testid="billing-no-show-fee"]'),
		).toBeVisible();
	});
});
