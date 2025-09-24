import { test, expect } from '@playwright/test';
import { AuthUtils, TEST_USERS } from '../utils/auth-utils.js';
import { createTestUtils } from '../utils/test-utils.js';

test.describe('Appointment Management', () => {
  let authUtils: AuthUtils;
  let testUtils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthUtils(page);
    testUtils = createTestUtils(page);
    
    // Login before each test
    await authUtils.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  });

  test('should display appointments page', async ({ page }) => {
    await page.goto('/appointments');
    
    await expect(page.locator('[data-testid="appointments-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-appointment-button"]')).toBeVisible();
  });

  test('should create new appointment', async ({ page }) => {
    await page.goto('/appointments');
    
    await page.click('[data-testid="create-appointment-button"]');
    
    await expect(page).toHaveURL('/appointments/new');
    await expect(page.locator('[data-testid="appointment-form"]')).toBeVisible();
    
    // Fill appointment form
    const appointmentData = {
      patientId: '1',
      professionalId: '1',
      startTime: '2024-12-20T14:00',
      endTime: '2024-12-20T15:00',
      title: 'Consulta de Avaliação',
      notes: 'Primeira consulta do paciente',
    };
    
    await page.fill('[data-testid="patient-id-input"]', appointmentData.patientId);
    await page.fill('[data-testid="professional-id-input"]', appointmentData.professionalId);
    await page.fill('[data-testid="start-time-input"]', appointmentData.startTime);
    await page.fill('[data-testid="end-time-input"]', appointmentData.endTime);
    await page.fill('[data-testid="title-input"]', appointmentData.title);
    await page.fill('[data-testid="notes-input"]', appointmentData.notes);
    
    await page.click('[data-testid="submit-button"]');
    
    await expect(page).toHaveURL('/appointments');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Appointment created successfully');
  });

  test('should edit existing appointment', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointment-item"]');
    
    // Click edit button on first appointment
    await page.click('[data-testid="edit-appointment-1"]');
    
    await expect(page).toHaveURL('/appointments/1/edit');
    await expect(page.locator('[data-testid="appointment-form"]')).toBeVisible();
    
    // Update appointment details
    await page.fill('[data-testid="title-input"]', 'Consulta de Avaliação - Atualizada');
    await page.fill('[data-testid="notes-input"]', 'Notas atualizadas da consulta');
    
    await page.click('[data-testid="submit-button"]');
    
    await expect(page).toHaveURL('/appointments');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Appointment updated successfully');
  });

  test('should delete appointment with confirmation', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointment-item"]');
    
    // Click delete button on first appointment
    await page.click('[data-testid="delete-appointment-1"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Appointment deleted successfully');
  });

  test('should view appointment details', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointment-item"]');
    
    // Click on appointment to view details
    await page.click('[data-testid="appointment-item-1"]');
    
    await expect(page).toHaveURL('/appointments/1');
    await expect(page.locator('[data-testid="appointment-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="professional-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointment-time"]')).toBeVisible();
  });

  test('should filter appointments by date', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointments-calendar"]');
    
    // Select date range
    await page.click('[data-testid="date-filter-button"]');
    await page.fill('[data-testid="start-date-input"]', '2024-12-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    await page.click('[data-testid="apply-filter-button"]');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify filtered appointments
    const appointments = await page.locator('[data-testid="appointment-item"]').count();
    expect(appointments).toBeGreaterThan(0);
  });

  test('should search appointments by patient name', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="search-input"]');
    
    // Search for patient
    await page.fill('[data-testid="search-input"]', 'Maria Silva');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results
    const appointments = await page.locator('[data-testid="appointment-item"]').count();
    expect(appointments).toBeGreaterThan(0);
  });

  test('should validate appointment time conflicts', async ({ page }) => {
    await page.goto('/appointments/new');
    
    // Try to create appointment with conflicting time
    await page.fill('[data-testid="patient-id-input"]', '1');
    await page.fill('[data-testid="professional-id-input"]', '1');
    await page.fill('[data-testid="start-time-input"]', '2024-12-20T14:00');
    await page.fill('[data-testid="end-time-input"]', '2024-12-20T15:00');
    await page.fill('[data-testid="title-input"]', 'Consulta Conflitante');
    
    await page.click('[data-testid="submit-button"]');
    
    // Should show conflict error
    await expect(page.locator('[data-testid="conflict-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="conflict-error"]')).toContainText('Time conflict with existing appointment');
  });

  test('should handle appointment status changes', async ({ page }) => {
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointment-item"]');
    
    // Change appointment status
    await page.click('[data-testid="status-dropdown-1"]');
    await page.click('[data-testid="status-confirmed"]');
    
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Appointment status updated');
  });

  test('should display calendar view', async ({ page }) => {
    await page.goto('/appointments');
    
    // Switch to calendar view
    await page.click('[data-testid="calendar-view-button"]');
    
    await expect(page.locator('[data-testid="appointments-calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    
    // Verify appointments are displayed on calendar
    const calendarEvents = await page.locator('[data-testid="calendar-event"]').count();
    expect(calendarEvents).toBeGreaterThan(0);
  });

  test('should export appointments to PDF', async ({ page }) => {
    await page.goto('/appointments');
    
    // Click export button
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-pdf"]');
    
    // Should show download notification
    await expect(page.locator('[data-testid="download-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-notification"]')).toContainText('PDF exported successfully');
  });

  test('should send appointment reminders', async ({ page }) => {
    await page.goto('/appointments');
    
    // Select appointment
    await page.check('[data-testid="select-appointment-1"]');
    
    // Send reminder
    await page.click('[data-testid="send-reminder-button"]');
    
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Reminder sent successfully');
  });

  test('should have accessible appointment management interface', async ({ page }) => {
    await page.goto('/appointments');
    
    // Check accessibility
    const violations = await testUtils.checkAccessibility();
    expect(violations).toBeNull();
    
    // Verify all interactive elements are accessible
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      await expect(button).toHaveAccessibleName('');
    }
    
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      await expect(input).toHaveAccessibleName('');
    }
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    await page.goto('/appointments');
    
    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-message"]')).toContainText('You are currently offline');
    
    // Restore online mode
    await page.context().setOffline(false);
    
    // Should refresh and show appointments
    await page.reload();
    await expect(page.locator('[data-testid="appointments-page"]')).toBeVisible();
  });
});