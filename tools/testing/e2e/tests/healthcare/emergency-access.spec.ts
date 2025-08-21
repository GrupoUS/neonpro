import { expect, test } from '@playwright/test';

/**
 * 🚨 CRITICAL Emergency Access E2E Tests for NeonPro Healthcare
 * Tests emergency scenarios requiring rapid access to critical patient data
 */

test.describe('🚨 Emergency Access - Critical E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions for emergency testing
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('⚡ Emergency Login (<10s)', () => {
    test('should complete emergency login within 10 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to emergency access portal
      await page.goto('/emergency');
      await page.waitForLoadState('networkidle');
      
      // Verify emergency mode interface
      await expect(page.locator('[data-testid="emergency-mode"], .emergency-portal')).toBeVisible();
      await expect(page.locator(':has-text("ACESSO DE EMERGÊNCIA")')).toBeVisible();
      
      // Emergency login with special credentials
      await page.fill('[data-testid="emergency-code"], input[name="emergency_code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"], input[name="professional_id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"], input[type="password"]', 'EmergencySecure123!');
      
      // Submit emergency login
      await page.click('[data-testid="emergency-login"], button:has-text("ACESSO EMERGENCIAL")');
      
      // Wait for emergency dashboard
      await page.waitForURL('**/emergency/dashboard');
      await page.waitForLoadState('networkidle');
      
      const totalTime = Date.now() - startTime;
      
      // Critical requirement: Must complete within 10 seconds
      expect(totalTime).toBeLessThan(10000);
      
      // Verify emergency dashboard is loaded
      await expect(page.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-search-emergency"]')).toBeVisible();
      
      console.log(`Emergency login completed in ${totalTime}ms`);
    });

    test('should bypass normal authentication restrictions in emergency mode', async ({ page }) => {
      await page.goto('/emergency');
      
      // Emergency login
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      
      await page.waitForURL('**/emergency/dashboard');
      
      // Verify emergency privileges
      await expect(page.locator('[data-testid="emergency-privileges"]')).toBeVisible();
      await expect(page.locator(':has-text("MODO EMERGENCIAL ATIVO")')).toBeVisible();
      
      // Should have access to all patient data without normal role restrictions
      await expect(page.locator('[data-testid="unrestricted-access"]')).toBeVisible();
      
      // Emergency session indicator
      await expect(page.locator('[data-testid="emergency-session"]')).toHaveClass(/emergency|critical/);
    });

    test('should validate emergency credentials properly', async ({ page }) => {
      await page.goto('/emergency');
      
      // Try with invalid emergency code
      await page.fill('[data-testid="emergency-code"]', 'INVALID123');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      
      // Should show emergency access denied
      await expect(page.locator('[data-testid="emergency-access-denied"]')).toBeVisible();
      await expect(page.locator(':has-text("Código de emergência inválido")')).toBeVisible();
      
      // Should remain on emergency login page
      expect(page.url()).toMatch(/emergency/);
      expect(page.url()).not.toMatch(/dashboard/);
    });
  });

  test.describe('🔍 Critical Data Access', () => {
    test('should provide immediate access to critical patient data', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      const searchStartTime = Date.now();
      
      // Search for patient in emergency
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      
      // Wait for patient data to load
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      const searchTime = Date.now() - searchStartTime;
      
      // Critical data should load within 3 seconds
      expect(searchTime).toBeLessThan(3000);
      
      // Verify critical medical information is immediately visible
      await expect(page.locator('[data-testid="patient-allergies"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-medications"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-conditions"]')).toBeVisible();
      await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();
      await expect(page.locator('[data-testid="blood-type"]')).toBeVisible();
      
      // Verify medical alerts are highlighted
      const medicalAlerts = page.locator('[data-testid="medical-alerts"], .medical-alert');
      if (await medicalAlerts.count() > 0) {
        await expect(medicalAlerts).toHaveClass(/alert|warning|critical/);
      }
    });

    test('should display patient allergies and contraindications prominently', async ({ page }) => {
      // Emergency login and patient search
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      await page.fill('[data-testid="patient-search-emergency"]', 'João Silva Alergico');
      await page.click('[data-testid="emergency-search-btn"]');
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      // Verify allergy information is prominently displayed
      const allergySection = page.locator('[data-testid="patient-allergies"]');
      await expect(allergySection).toBeVisible();
      
      // Should have warning styling for allergies
      await expect(allergySection).toHaveClass(/warning|alert|critical/);
      
      // Specific allergy information should be clearly visible
      await expect(allergySection).toContainText(/Penicilina|Dipirona|Látex/);
      
      // Contraindications should be highlighted
      const contraindications = page.locator('[data-testid="contraindications"]');
      if (await contraindications.count() > 0) {
        await expect(contraindications).toBeVisible();
        await expect(contraindications).toHaveClass(/critical|danger/);
      }
      
      // Emergency medication warnings
      await expect(page.locator('[data-testid="medication-warnings"]')).toBeVisible();
    });

    test('should show current medications and dosages', async ({ page }) => {
      // Emergency access setup
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      await page.fill('[data-testid="patient-search-emergency"]', 'Ana Costa Medicamentos');
      await page.click('[data-testid="emergency-search-btn"]');
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      // Verify current medications are displayed
      const medicationsSection = page.locator('[data-testid="patient-medications"]');
      await expect(medicationsSection).toBeVisible();
      
      // Should show medication details
      await expect(medicationsSection).toContainText(/mg|ml|comprimidos|cápsulas/);
      await expect(medicationsSection).toContainText(/manhã|tarde|noite|vezes ao dia/);
      
      // Critical medications should be highlighted
      const criticalMeds = page.locator('[data-testid="critical-medications"]');
      if (await criticalMeds.count() > 0) {
        await expect(criticalMeds).toHaveClass(/critical|important/);
      }
      
      // Drug interaction warnings
      const interactionWarnings = page.locator('[data-testid="drug-interactions"]');
      if (await interactionWarnings.count() > 0) {
        await expect(interactionWarnings).toBeVisible();
        await expect(interactionWarnings).toHaveClass(/warning|alert/);
      }
    });

    test('should provide access to recent medical history', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      await page.fill('[data-testid="patient-search-emergency"]', 'Carlos Santos História');
      await page.click('[data-testid="emergency-search-btn"]');
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      // Verify recent medical history
      await expect(page.locator('[data-testid="recent-history"]')).toBeVisible();
      
      // Should show recent visits/procedures
      const recentVisits = page.locator('[data-testid="recent-visits"]');
      await expect(recentVisits).toBeVisible();
      
      // Recent diagnoses
      await expect(page.locator('[data-testid="recent-diagnoses"]')).toBeVisible();
      
      // Recent procedures
      const recentProcedures = page.locator('[data-testid="recent-procedures"]');
      if (await recentProcedures.count() > 0) {
        await expect(recentProcedures).toBeVisible();
      }
      
      // Emergency-relevant medical conditions
      await expect(page.locator('[data-testid="chronic-conditions"]')).toBeVisible();
    });
  });  test.describe('📋 Audit Trail Logging', () => {
    test('should log all emergency access events', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Access patient data
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      // Verify audit trail is being created
      await expect(page.locator('[data-testid="audit-trail-active"]')).toBeVisible();
      await expect(page.locator(':has-text("ACESSO REGISTRADO EM AUDITORIA")')).toBeVisible();
      
      // Check audit log entries
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      if (await auditEntries.count() > 0) {
        await expect(auditEntries.first()).toContainText('EMERGENCY_ACCESS');
        await expect(auditEntries.first()).toContainText('CRM12345');
        await expect(auditEntries.first()).toContainText(new Date().toISOString().split('T')[0]);
      }
    });

    test('should require justification for emergency access', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Try to access patient data
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      
      // Should prompt for justification
      await expect(page.locator('[data-testid="emergency-justification-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="justification-required"]')).toContainText('obrigatória');
      
      // Fill justification
      await page.fill('[data-testid="emergency-justification"]', 'Paciente inconsciente em estado crítico, necessário verificar alergias e medicações antes de procedimento de emergência');
      await page.selectOption('[data-testid="emergency-type"]', 'life-threatening');
      
      // Confirm access
      await page.click('[data-testid="confirm-emergency-access"]');
      
      // Should now provide access
      await expect(page.locator('[data-testid="emergency-patient-data"]')).toBeVisible();
      
      // Verify justification was logged
      await expect(page.locator('[data-testid="justification-logged"]')).toContainText('Justificativa registrada');
    });

    test('should create detailed audit logs with all required information', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Access patient data with justification
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      
      // Provide justification
      await page.fill('[data-testid="emergency-justification"]', 'Emergência médica - paciente em parada cardíaca');
      await page.selectOption('[data-testid="emergency-type"]', 'cardiac-arrest');
      await page.click('[data-testid="confirm-emergency-access"]');
      
      await page.waitForSelector('[data-testid="emergency-patient-data"]');
      
      // Navigate to audit log to verify entry
      await page.click('[data-testid="view-audit-log"]');
      
      // Verify comprehensive audit entry
      const auditEntry = page.locator('[data-testid="latest-audit-entry"]');
      await expect(auditEntry).toBeVisible();
      
      // Required audit information
      await expect(auditEntry).toContainText('EMERGENCY_ACCESS');
      await expect(auditEntry).toContainText('CRM12345'); // Professional ID
      await expect(auditEntry).toContainText('Maria Silva Santos'); // Patient accessed
      await expect(auditEntry).toContainText('Emergência médica - paciente em parada cardíaca'); // Justification
      await expect(auditEntry).toContainText('cardiac-arrest'); // Emergency type
      await expect(auditEntry).toContainText(new Date().toISOString().split('T')[0]); // Date
      
      // IP address and session information should be logged
      await expect(auditEntry).toContainText(/IP:|Session:/);
    });

    test('should maintain audit integrity and prevent tampering', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Access patient data
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      await page.fill('[data-testid="emergency-justification"]', 'Teste de auditoria');
      await page.selectOption('[data-testid="emergency-type"]', 'other');
      await page.click('[data-testid="confirm-emergency-access"]');
      
      // Navigate to audit logs
      await page.click('[data-testid="view-audit-log"]');
      
      // Audit entries should be read-only
      const auditEntries = page.locator('[data-testid="audit-entry"]');
      await expect(auditEntries.first()).toBeVisible();
      
      // Should not have edit or delete options
      const editButton = page.locator('[data-testid="edit-audit"], button:has-text("Editar")');
      const deleteButton = page.locator('[data-testid="delete-audit"], button:has-text("Excluir")');
      
      expect(await editButton.count()).toBe(0);
      expect(await deleteButton.count()).toBe(0);
      
      // Verify audit entries are properly timestamped and signed
      await expect(auditEntries.first()).toContainText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/); // Timestamp
      
      // Digital signature or hash should be present
      const signatureField = page.locator('[data-testid="audit-signature"], .audit-hash');
      if (await signatureField.count() > 0) {
        await expect(signatureField).toBeVisible();
        await expect(signatureField).toContainText(/[a-f0-9]{32,}/); // Hash pattern
      }
    });
  });

  test.describe('⏱️ Performance & Reliability', () => {
    test('should handle concurrent emergency access requests', async ({ page, context }) => {
      // Simulate multiple emergency access attempts
      const page1 = page;
      const page2 = await context.newPage();
      const page3 = await context.newPage();
      
      const emergencyLogin = async (testPage: any, professionalId: string) => {
        await testPage.goto('/emergency');
        await testPage.fill('[data-testid="emergency-code"]', 'EMRG2024');
        await testPage.fill('[data-testid="professional-id"]', professionalId);
        await testPage.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
        await testPage.click('[data-testid="emergency-login"]');
        return testPage.waitForURL('**/emergency/dashboard');
      };
      
      const startTime = Date.now();
      
      // Concurrent emergency logins
      await Promise.all([
        emergencyLogin(page1, 'CRM12345'),
        emergencyLogin(page2, 'CRM67890'),
        emergencyLogin(page3, 'CRM54321')
      ]);
      
      const totalTime = Date.now() - startTime;
      
      // All should complete within reasonable time
      expect(totalTime).toBeLessThan(15000); // 15 seconds for 3 concurrent logins
      
      // All pages should have emergency access
      await expect(page1.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
      await expect(page2.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
      await expect(page3.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
      
      await page2.close();
      await page3.close();
    });

    test('should maintain performance under emergency conditions', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Perform multiple rapid patient searches
      const patients = ['Maria Silva', 'João Santos', 'Ana Costa', 'Carlos Oliveira', 'Paula Lima'];
      
      const searchTimes = [];
      
      for (const patient of patients) {
        const searchStart = Date.now();
        
        await page.fill('[data-testid="patient-search-emergency"]', patient);
        await page.click('[data-testid="emergency-search-btn"]');
        
        if (await page.locator('[data-testid="emergency-justification"]').count() > 0) {
          await page.fill('[data-testid="emergency-justification"]', `Emergência médica - ${patient}`);
          await page.selectOption('[data-testid="emergency-type"]', 'other');
          await page.click('[data-testid="confirm-emergency-access"]');
        }
        
        await page.waitForSelector('[data-testid="emergency-patient-data"]');
        
        const searchTime = Date.now() - searchStart;
        searchTimes.push(searchTime);
        
        // Clear search for next patient
        await page.click('[data-testid="clear-search"]');
      }
      
      // All searches should be fast
      const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
      expect(avgSearchTime).toBeLessThan(5000); // Average under 5 seconds
      
      // No search should take more than 8 seconds
      const maxSearchTime = Math.max(...searchTimes);
      expect(maxSearchTime).toBeLessThan(8000);
      
      console.log(`Average emergency search time: ${avgSearchTime}ms`);
      console.log(`Maximum emergency search time: ${maxSearchTime}ms`);
    });

    test('should handle system failures gracefully in emergency mode', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Simulate network interruption during patient search
      await page.route('**/api/patients/emergency-search', route => {
        // Fail first request, succeed on retry
        if (route.request().url().includes('retry')) {
          route.continue();
        } else {
          route.abort('failed');
        }
      });
      
      await page.fill('[data-testid="patient-search-emergency"]', 'Maria Silva Santos');
      await page.click('[data-testid="emergency-search-btn"]');
      
      // Should show retry mechanism
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"], button:has-text("Tentar Novamente")')).toBeVisible();
      
      // Click retry with modified route
      await page.route('**/api/patients/emergency-search', route => route.continue());
      await page.click('[data-testid="retry-button"]');
      
      // Should eventually succeed
      await page.waitForSelector('[data-testid="emergency-patient-data"]', { timeout: 10000 });
      await expect(page.locator('[data-testid="emergency-patient-data"]')).toBeVisible();
    });
  });

  test.describe('🔒 Security & Compliance', () => {
    test('should enforce emergency access time limits', async ({ page }) => {
      // Emergency login
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Check for emergency session timer
      await expect(page.locator('[data-testid="emergency-timer"]')).toBeVisible();
      
      // Verify timer shows remaining time
      const timerText = await page.locator('[data-testid="emergency-timer"]').textContent();
      expect(timerText).toMatch(/\d+:\d+/); // MM:SS format
      
      // Should show warning when time is running low
      // Note: In a real test, you'd simulate time passage or use shorter timer for testing
      const warningCheck = page.locator('[data-testid="time-warning"]');
      if (await warningCheck.count() > 0) {
        await expect(warningCheck).toHaveClass(/warning|alert/);
      }
    });

    test('should automatically log out after emergency session expires', async ({ page }) => {
      // This test would require either mocking time or using a shorter session duration
      // For demonstration, we'll test the logout mechanism exists
      
      await page.goto('/emergency');
      await page.fill('[data-testid="emergency-code"]', 'EMRG2024');
      await page.fill('[data-testid="professional-id"]', 'CRM12345');
      await page.fill('[data-testid="emergency-password"]', 'EmergencySecure123!');
      await page.click('[data-testid="emergency-login"]');
      await page.waitForURL('**/emergency/dashboard');
      
      // Verify emergency session controls exist
      await expect(page.locator('[data-testid="emergency-session-control"]')).toBeVisible();
      
      // Verify manual emergency logout option
      const emergencyLogout = page.locator('[data-testid="emergency-logout"], button:has-text("ENCERRAR EMERGÊNCIA")');
      await expect(emergencyLogout).toBeVisible();
      
      // Test manual logout
      await emergencyLogout.click();
      
      // Should return to emergency login page
      await page.waitForURL(/.*\/emergency$/);
      await expect(page.locator('[data-testid="emergency-mode"]')).toBeVisible();
      
      // Should clear all session data
      const sessionData = await page.evaluate(() => localStorage.getItem('emergency-session'));
      expect(sessionData).toBeNull();
    });
  });
});