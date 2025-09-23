import { test, expect } from '@playwright/test';

test.describe('Clinic Appointment Management @clinic @appointments', () => {
  test.beforeEach(async ({ page }) => {
    // Login as professional before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'professional@clinic.com');
    await page.fill('input[type="password"]', 'securePassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard/professional');
  });

  test.describe('Appointment Dashboard @professional', () => {
    test('should show appointment dashboard @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      
      await expect(page.locator('text=Appointment Dashboard')).toBeVisible();
      await expect(page.locator('text=Today\'s Schedule')).toBeVisible();
      await expect(page.locator('text=Upcoming Appointments')).toBeVisible();
      await expect(page.locator('text=Recent Appointments')).toBeVisible();
      await expect(page.locator('text=No-Show Risk Assessment')).toBeVisible();
    });

    test('should show calendar view @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Calendar View');
      
      // Check calendar features
      await expect(page.locator('text=Monthly Calendar')).toBeVisible();
      await expect(page.locator('text=Weekly View')).toBeVisible();
      await expect(page.locator('text=Daily View')).toBeVisible();
      await expect(page.locator('text=Appointment Legend')).toBeVisible();
    });

    test('should show appointment statistics @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Statistics');
      
      // Check statistics
      await expect(page.locator('text=Appointment Metrics')).toBeVisible();
      await expect(page.locator('text=No-Show Rate')).toBeVisible();
      await expect(page.locator('text=Revenue Analytics')).toBeVisible();
      await expect(page.locator('text=Peak Hours')).toBeVisible();
    });
  });

  test.describe('Booking New Appointments @professional', () => {
    test('should book new appointment @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Book New Appointment');
      
      // Fill appointment form
      await page.selectOption('select[name="patient"]', 'Jane Smith');
      await page.selectOption('select[name="treatment"]', 'Botox Treatment');
      await page.fill('input[name="date"]', '2024-01-15');
      await page.selectOption('select[name="time"]', '14:00');
      await page.fill('textarea[name="notes"]', 'Patient wants to address forehead lines');
      
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=Appointment booked successfully')).toBeVisible();
    });

    test('should use AI for time optimization @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Smart Scheduling');
      
      // Check AI scheduling features
      await expect(page.locator('text=AI Time Optimization')).toBeVisible();
      await expect(page.locator('text=Optimal Slots')).toBeVisible();
      await expect(page.locator('text=Efficiency Score')).toBeVisible();
      await expect(page.locator('text=Patient Preference Analysis')).toBeVisible();
    });

    test('should handle recurring appointments @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Recurring Appointments');
      
      // Set up recurring appointment
      await page.selectOption('select[name="patient"]', 'Jane Smith');
      await page.selectOption('select[name="treatment"]', 'Botox Maintenance');
      await page.fill('input[name="startDate"]', '2024-01-15');
      await page.selectOption('select[name="frequency"]', '6');
      await page.selectOption('select[name="period"]', 'months');
      await page.check('input[name="autoRemind"]');
      
      await page.click('button[type="submit"]');
      
      // Should show recurring schedule
      await expect(page.locator('text=Recurring Schedule Created')).toBeVisible();
    });
  });

  test.describe('Anti-No-Show Engine @professional', () => {
    test('should show no-show risk assessment @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=No-Show Analysis');
      
      // Check risk assessment features
      await expect(page.locator('text=No-Show Risk Assessment')).toBeVisible();
      await expect(page.locator('text=Risk Factors')).toBeVisible();
      await expect(page.locator('text=Risk Level')).toBeVisible();
      await expect(page.locator('text=Prevention Strategies')).toBeVisible();
    });

    test('should calculate risk scores @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Risk Calculator');
      
      // Fill risk factors
      await page.selectOption('select[name="patient"]', 'Jane Smith');
      await page.check('input[name="firstTime"]');
      await page.check('input[name="noShowHistory"]');
      await page.selectOption('select[name="timeOfDay"]', 'early-morning');
      await page.selectOption('select[name="dayOfWeek"]', 'monday');
      
      await page.click('button[type="submit"]');
      
      // Should show risk score
      await expect(page.locator('text=Risk Score')).toBeVisible();
      await expect(page.locator('text=Risk Level: High')).toBeVisible();
    });

    test('should suggest mitigation strategies @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Mitigation Strategies');
      
      // Check mitigation options
      await expect(page.locator('text=Recommended Actions')).toBeVisible();
      await expect(page.locator('text=WhatsApp Reminders')).toBeVisible();
      await expect(page.locator('text=Confirmation Calls')).toBeVisible();
      await expect(page.locator('text=Deposit Requirements')).toBeVisible();
    });
  });

  test.describe('WhatsApp Integration @professional', () => {
    test('should send WhatsApp reminders @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=WhatsApp Reminders');
      
      // Check WhatsApp features
      await expect(page.locator('text=WhatsApp Integration')).toBeVisible();
      await expect(page.locator('text=Automated Reminders')).toBeVisible();
      await expect(page.locator('text=Message Templates')).toBeVisible();
      await expect(page.locator('text=Delivery Status')).toBeVisible();
    });

    test('should customize WhatsApp messages @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Message Templates');
      
      // Check message template customization
      await expect(page.locator('text=Reminder Template')).toBeVisible();
      await expect(page.locator('text=Confirmation Template')).toBeVisible();
      await expect(page.locator('text=Follow-up Template')).toBeVisible();
      await expect(page.locator('text=Cancellation Template')).toBeVisible();
    });

    test('should track WhatsApp delivery @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Message Delivery');
      
      // Check delivery tracking
      await expect(page.locator('text=Delivery Status')).toBeVisible();
      await expect(page.locator('text=Message Logs')).toBeVisible();
      await expect(page.locator('text=Failed Deliveries')).toBeVisible();
      await expect(page.locator('text=Success Rate')).toBeVisible();
    });
  });

  test.describe('Appointment Management @professional', () => {
    test('should edit existing appointments @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Today\'s Schedule');
      
      // Select appointment to edit
      await page.click('text=Jane Smith - Botox Treatment');
      await page.click('text=Edit');
      
      // Modify appointment details
      await page.fill('input[name="date"]', '2024-01-16');
      await page.selectOption('select[name="time"]', '15:00');
      await page.fill('textarea[name="notes"]', 'Rescheduled due to patient request');
      
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=Appointment updated successfully')).toBeVisible();
    });

    test('should cancel appointments @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Today\'s Schedule');
      
      // Select appointment to cancel
      await page.click('text=Jane Smith - Botox Treatment');
      await page.click('text=Cancel');
      
      // Fill cancellation reason
      await page.selectOption('select[name="reason"]', 'patient-request');
      await page.fill('textarea[name="cancellationNotes"]', 'Patient requested reschedule');
      
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=Appointment cancelled successfully')).toBeVisible();
    });

    test('should handle waitlist @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Waitlist');
      
      // Check waitlist features
      await expect(page.locator('text=Waitlist Management')).toBeVisible();
      await expect(page.locator('text=Available Slots')).toBeVisible();
      await expect(page.locator('text=Waitlisted Patients')).toBeVisible();
      await expect(page.locator('text=Auto-fill Settings')).toBeVisible();
    });
  });

  test.describe('Client Booking Experience @client', () => {
    test.beforeEach(async ({ page }) => {
      // Login as client
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'client@example.com');
      await page.fill('input[type="password"]', 'clientPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard/client');
    });

    test('should show available appointment slots @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.click('text=Book Appointment');
      
      // Check available slots
      await expect(page.locator('text=Available Appointments')).toBeVisible();
      await expect(page.locator('text=Select Treatment')).toBeVisible();
      await expect(page.locator('text=Choose Date')).toBeVisible();
      await expect(page.locator('text=Select Time')).toBeVisible();
    });

    test('should book appointment as client @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.click('text=Book Appointment');
      
      // Select treatment
      await page.selectOption('select[name="treatment"]', 'Botox Treatment');
      
      // Select date
      await page.click('text=Select Date');
      await page.click('text=15');
      
      // Select time
      await page.selectOption('select[name="time"]', '14:00');
      
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=Appointment booked successfully')).toBeVisible();
    });

    test('should receive WhatsApp confirmation @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.click('text=My Appointments');
      
      // Check appointment confirmation
      await expect(page.locator('text=WhatsApp Confirmation Sent')).toBeVisible();
      await expect(page.locator('text=Appointment Details')).toBeVisible();
      await expect(page.locator('text=Reminders Scheduled')).toBeVisible();
    });
  });

  test.describe('Real-time Updates @professional', () => {
    test('should show real-time appointment updates @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Real-time Updates');
      
      // Check real-time features
      await expect(page.locator('text=Live Updates')).toBeVisible();
      await expect(page.locator('text=Appointment Status')).toBeVisible();
      await expect(page.locator('text=Patient Arrivals')).toBeVisible();
      await expect(page.locator('text=Schedule Changes')).toBeVisible();
    });

    test('should handle appointment conflicts @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Conflict Detection');
      
      // Check conflict detection
      await expect(page.locator('text=Scheduling Conflicts')).toBeVisible();
      await expect(page.locator('text=Resource Availability')).toBeVisible();
      await expect(page.locator('text=Professional Schedule')).toBeVisible();
    });
  });

  test.describe('Analytics and Reporting @professional', () => {
    test('should show appointment analytics @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Analytics');
      
      // Check analytics
      await expect(page.locator('text=Appointment Analytics')).toBeVisible();
      await expect(page.locator('text=Revenue Trends')).toBeVisible();
      await expect(page.locator('text=Popular Treatments')).toBeVisible();
      await expect(page.locator('text=Time Analysis')).toBeVisible();
    });

    test('should generate appointment reports @desktop', async ({ page }) => {
      await page.click('text=Appointments');
      await page.click('text=Reports');
      
      // Generate report
      await page.click('text=Generate Report');
      
      // Should show report options
      await expect(page.locator('text=Report Type')).toBeVisible();
      await expect(page.locator('text=Date Range')).toBeVisible();
      await expect(page.locator('text=Export Format')).toBeVisible();
      
      await page.click('button[type="submit"]');
      
      // Should show generated report
      await expect(page.locator('text=Appointment Report')).toBeVisible();
    });
  });
});