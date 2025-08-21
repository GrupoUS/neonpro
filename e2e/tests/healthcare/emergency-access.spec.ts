/**
 * NeonPro Healthcare - Emergency Access Protocol E2E Tests
 *
 * PRIORITY: CRITICAL - Life-saving emergency access scenarios
 * COVERAGE: Emergency override, rapid patient access, audit compliance
 * COMPLIANCE: CFM emergency protocols, LGPD emergency provisions
 */

import { expect, test } from '@playwright/test';

test.describe('Emergency Access Protocol', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page for emergency scenarios
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should handle life-threatening emergency access bypass', async ({
    page,
  }) => {
    // Click emergency access button on login screen
    await expect(
      page.locator('[data-testid="emergency-access-btn"]')
    ).toBeVisible();
    await page.click('[data-testid="emergency-access-btn"]');

    // Should show emergency authentication modal
    await expect(
      page.locator('[data-testid="emergency-auth-modal"]')
    ).toBeVisible();
    await expect(page.locator('h2')).toContainText('ACESSO DE EMERGÊNCIA');
    await expect(
      page.locator('text=Para situações de risco à vida')
    ).toBeVisible();

    // Emergency credentials
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');

    // Critical incident description
    await page.fill(
      '[data-testid="incident-description"]',
      'Paciente em parada cardiorrespiratória - necessário acesso imediato ao histórico médico'
    );

    // Emergency contact verification
    await page.fill(
      '[data-testid="authorizing-doctor"]',
      'Dr. Silva - CRM/SP 123456'
    );
    await page.fill('[data-testid="emergency-contact"]', '(11) 99999-9999');

    // Confirm emergency access
    await page.click('[data-testid="emergency-access-confirm"]');

    // Should bypass normal authentication
    await expect(page).toHaveURL(/\/emergency-dashboard/, { timeout: 10_000 });

    // Emergency dashboard should be active
    await expect(
      page.locator('[data-testid="emergency-banner"]')
    ).toBeVisible();
    await expect(page.locator('text=MODO EMERGÊNCIA ATIVO')).toBeVisible();
    await expect(page.locator('[data-testid="emergency-timer"]')).toBeVisible();

    // Should have immediate patient search access
    await expect(
      page.locator('[data-testid="emergency-patient-search"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="quick-patient-access"]')
    ).toBeVisible();

    // Emergency session should have time limit
    await expect(
      page.locator('[data-testid="session-countdown"]')
    ).toContainText(/\d{2}:\d{2}/); // Timer format
    await expect(
      page.locator('text=Sessão expira automaticamente')
    ).toBeVisible();

    // Should log emergency access immediately
    await expect(
      page.locator('[data-testid="emergency-audit-alert"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Acesso emergencial registrado nos logs')
    ).toBeVisible();
  });

  test('should provide rapid patient data access in emergency mode', async ({
    page,
  }) => {
    // Start emergency session (using helper function for setup)
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'AVC - necessário histórico de medicamentos'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    await page.waitForURL('/emergency-dashboard');

    // Quick patient search by CPF (most common emergency scenario)
    await page.fill(
      '[data-testid="emergency-patient-search"]',
      '123.456.789-00'
    );
    await page.press('[data-testid="emergency-patient-search"]', 'Enter');

    // Should show rapid search results
    await expect(
      page.locator('[data-testid="emergency-patient-results"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="patient-basic-info"]')
    ).toBeVisible();

    // Click patient to access emergency view
    await page.click('[data-testid="emergency-patient-access"]');

    // Emergency patient view should load rapidly (< 3 seconds)
    const startTime = Date.now();
    await expect(
      page.locator('[data-testid="emergency-patient-view"]')
    ).toBeVisible();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Critical information should be prominently displayed
    await expect(
      page.locator('[data-testid="critical-allergies"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="current-medications"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="critical-conditions"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="emergency-contacts"]')
    ).toBeVisible();

    // Blood type and critical alerts
    await expect(page.locator('[data-testid="blood-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="critical-alerts"]')).toBeVisible();

    // Recent vital signs
    await expect(page.locator('[data-testid="recent-vitals"]')).toBeVisible();

    // Emergency medical history
    await page.click('[data-testid="emergency-history-tab"]');
    await expect(
      page.locator('[data-testid="recent-hospitalizations"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="surgical-history"]')
    ).toBeVisible();

    // Should allow emergency data updates
    await page.click('[data-testid="add-emergency-note"]');
    await page.fill(
      '[data-testid="emergency-note-text"]',
      'Paciente encontrado inconsciente. Sinais vitais estáveis após reanimação.'
    );
    await page.click('[data-testid="save-emergency-note"]');

    await expect(page.locator('text=Nota de emergência salva')).toBeVisible();
  });

  test('should handle emergency prescription authorization', async ({
    page,
  }) => {
    // Setup emergency session
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'Infarto agudo - medicação urgente necessária'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    await page.waitForURL('/emergency-dashboard');

    // Access patient
    await page.fill(
      '[data-testid="emergency-patient-search"]',
      '123.456.789-00'
    );
    await page.press('[data-testid="emergency-patient-search"]', 'Enter');
    await page.click('[data-testid="emergency-patient-access"]');

    // Emergency prescription access
    await page.click('[data-testid="emergency-prescription-btn"]');
    await expect(
      page.locator('[data-testid="emergency-prescription-form"]')
    ).toBeVisible();

    // Should show emergency medication options
    await expect(
      page.locator('[data-testid="emergency-medications"]')
    ).toBeVisible();

    // Select emergency medication
    await page.click('[data-testid="medication-select"]');
    await page.click('[data-testid="medication-atenolol"]');

    await page.fill('[data-testid="dosage"]', '25mg');
    await page.click('[data-testid="frequency"]');
    await page.click('[data-testid="frequency-12h"]');

    // Emergency justification (required)
    await page.fill(
      '[data-testid="emergency-justification"]',
      'Infarto agudo do miocárdio - betabloqueador para redução da frequência cardíaca'
    );

    // Emergency override authorization
    await page.fill(
      '[data-testid="authorizing-physician"]',
      'Dr. Emergência - CRM/SP 999888'
    );

    // Should bypass normal prescription validation in emergency
    await expect(
      page.locator('[data-testid="emergency-override-warning"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Prescrição emergencial - validação posterior')
    ).toBeVisible();

    await page.click('[data-testid="authorize-emergency-prescription"]');

    // Should create emergency prescription
    await expect(
      page.locator('text=Prescrição emergencial autorizada')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="emergency-prescription-id"]')
    ).toBeVisible();

    // Should require post-emergency validation
    await expect(
      page.locator('[data-testid="post-emergency-validation"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Validação médica necessária em 24h')
    ).toBeVisible();
  });

  test('should enforce emergency session time limits and auto-logout', async ({
    page,
  }) => {
    // Start emergency session
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'Teste de limite de sessão'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    await page.waitForURL('/emergency-dashboard');

    // Should show session timer
    await expect(
      page.locator('[data-testid="session-countdown"]')
    ).toBeVisible();

    // Check initial timer value (should be 30 minutes = 1800 seconds)
    const initialTimer = await page
      .locator('[data-testid="session-countdown"]')
      .textContent();
    expect(initialTimer).toMatch(/29:|30:/); // Should start around 29-30 minutes

    // Should show warning messages
    await expect(
      page.locator('[data-testid="session-limit-warning"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Sessão limitada a 30 minutos')
    ).toBeVisible();

    // Test extension request
    await page.click('[data-testid="extend-session-btn"]');
    await expect(
      page.locator('[data-testid="extension-request-form"]')
    ).toBeVisible();

    await page.fill(
      '[data-testid="extension-justification"]',
      'Procedimento ainda em andamento - paciente em estado crítico'
    );
    await page.fill(
      '[data-testid="supervising-physician"]',
      'Dr. Supervisor - CRM/SP 777666'
    );

    await page.click('[data-testid="request-extension"]');

    // Should show extension request submitted
    await expect(
      page.locator('text=Solicitação de extensão enviada')
    ).toBeVisible();
    await expect(page.locator('text=Aguardando aprovação')).toBeVisible();

    // Simulate timer warning (5 minutes remaining)
    await page.evaluate(() => {
      // Mock session timer to show warning state
      window.dispatchEvent(
        new CustomEvent('emergency-session-warning', {
          detail: { remainingTime: 300 }, // 5 minutes
        })
      );
    });

    // Should show 5-minute warning
    await expect(
      page.locator('[data-testid="session-expiry-warning"]')
    ).toBeVisible();
    await expect(page.locator('text=Sessão expira em 5 minutos')).toBeVisible();

    // Should show save work reminder
    await expect(
      page.locator('[data-testid="save-work-reminder"]')
    ).toBeVisible();
  });

  test('should generate comprehensive emergency audit logs', async ({
    page,
  }) => {
    // Complete an emergency session
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'Auditoria de teste - acesso emergencial completo'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    await page.waitForURL('/emergency-dashboard');

    // Perform various emergency actions
    await page.fill(
      '[data-testid="emergency-patient-search"]',
      '123.456.789-00'
    );
    await page.press('[data-testid="emergency-patient-search"]', 'Enter');
    await page.click('[data-testid="emergency-patient-access"]');

    // Access different sections
    await page.click('[data-testid="emergency-history-tab"]');
    await page.click('[data-testid="emergency-prescription-btn"]');
    await page.click('[data-testid="add-emergency-note"]');
    await page.fill(
      '[data-testid="emergency-note-text"]',
      'Teste de auditoria'
    );
    await page.click('[data-testid="save-emergency-note"]');

    // End emergency session
    await page.click('[data-testid="end-emergency-session"]');
    await expect(
      page.locator('[data-testid="end-session-confirmation"]')
    ).toBeVisible();

    await page.fill(
      '[data-testid="session-summary"]',
      'Atendimento emergencial concluído. Paciente estabilizado.'
    );
    await page.click('[data-testid="confirm-end-session"]');

    // Should redirect to audit summary
    await expect(page).toHaveURL(/\/emergency-audit-summary/);

    // Audit summary should show all actions
    await expect(
      page.locator('[data-testid="emergency-session-summary"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="session-duration"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="actions-performed"]')
    ).toBeVisible();

    // Detailed audit log
    await expect(page.locator('[data-testid="audit-log-entry"]')).toBeVisible();

    // Should show timestamps for all actions
    await expect(
      page.locator('text=Acesso emergencial iniciado')
    ).toBeVisible();
    await expect(
      page.locator('text=Busca por paciente CPF: 123.456.789-00')
    ).toBeVisible();
    await expect(
      page.locator('text=Acesso aos dados do paciente')
    ).toBeVisible();
    await expect(
      page.locator('text=Visualização do histórico médico')
    ).toBeVisible();
    await expect(
      page.locator('text=Tentativa de prescrição emergencial')
    ).toBeVisible();
    await expect(page.locator('text=Adição de nota emergencial')).toBeVisible();
    await expect(
      page.locator('text=Sessão emergencial finalizada')
    ).toBeVisible();

    // Should show compliance information
    await expect(
      page.locator('[data-testid="lgpd-compliance-note"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Acesso justificado por situação de emergência')
    ).toBeVisible();
    await expect(page.locator('text=Conforme Art. 11 da LGPD')).toBeVisible();

    // Should require supervisor review
    await expect(
      page.locator('[data-testid="supervisor-review-required"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Revisão supervisora necessária em 24h')
    ).toBeVisible();

    // Export audit report
    await page.click('[data-testid="export-audit-report"]');
    await expect(
      page.locator('text=Relatório de auditoria gerado')
    ).toBeVisible();
  });

  test('should handle multiple concurrent emergency sessions', async ({
    page,
    context,
  }) => {
    // First emergency session
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'Emergência 1 - Infarto'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    await page.waitForURL('/emergency-dashboard');

    // Create second browser context for concurrent session
    const page2 = await context.newPage();
    await page2.goto('/login');

    // Second emergency session
    await page2.click('[data-testid="emergency-access-btn"]');
    await page2.fill('[data-testid="emergency-id"]', 'EMRG002');
    await page2.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page2.fill(
      '[data-testid="incident-description"]',
      'Emergência 2 - Acidente de trânsito'
    );
    await page2.click('[data-testid="emergency-access-confirm"]');

    await page2.waitForURL('/emergency-dashboard');

    // Both sessions should be active independently
    await expect(
      page.locator('[data-testid="emergency-banner"]')
    ).toBeVisible();
    await expect(
      page2.locator('[data-testid="emergency-banner"]')
    ).toBeVisible();

    // Each should have its own session timer
    await expect(
      page.locator('[data-testid="session-countdown"]')
    ).toBeVisible();
    await expect(
      page2.locator('[data-testid="session-countdown"]')
    ).toBeVisible();

    // Access different patients in each session
    await page.fill(
      '[data-testid="emergency-patient-search"]',
      '123.456.789-00'
    );
    await page.press('[data-testid="emergency-patient-search"]', 'Enter');

    await page2.fill(
      '[data-testid="emergency-patient-search"]',
      '987.654.321-00'
    );
    await page2.press('[data-testid="emergency-patient-search"]', 'Enter');

    // Should maintain separate audit trails
    await expect(page.locator('[data-testid="session-id"]')).not.toHaveText(
      await page2.locator('[data-testid="session-id"]').textContent()
    );

    // End first session
    await page.click('[data-testid="end-emergency-session"]');
    await page.fill(
      '[data-testid="session-summary"]',
      'Primeira emergência finalizada'
    );
    await page.click('[data-testid="confirm-end-session"]');

    // Second session should remain active
    await expect(
      page2.locator('[data-testid="emergency-banner"]')
    ).toBeVisible();
  });

  test('should validate emergency access credentials and prevent abuse', async ({
    page,
  }) => {
    // Test invalid emergency ID
    await page.click('[data-testid="emergency-access-btn"]');
    await page.fill('[data-testid="emergency-id"]', 'INVALID123');
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill(
      '[data-testid="incident-description"]',
      'Teste de validação'
    );
    await page.click('[data-testid="emergency-access-confirm"]');

    // Should show validation error
    await expect(
      page.locator('[data-testid="emergency-auth-error"]')
    ).toBeVisible();
    await expect(page.locator('text=ID de emergência inválido')).toBeVisible();

    // Test expired emergency code
    await page.fill('[data-testid="emergency-id"]', 'EMRG001');
    await page.fill('[data-testid="emergency-code"]', 'EXPIRED2023');
    await page.click('[data-testid="emergency-access-confirm"]');

    await expect(
      page.locator('text=Código de emergência expirado')
    ).toBeVisible();

    // Test insufficient incident description
    await page.fill('[data-testid="emergency-code"]', 'VIDA2024');
    await page.fill('[data-testid="incident-description"]', 'Teste'); // Too short
    await page.click('[data-testid="emergency-access-confirm"]');

    await expect(
      page.locator('text=Descrição do incidente insuficiente')
    ).toBeVisible();
    await expect(
      page.locator('text=Mínimo de 20 caracteres necessários')
    ).toBeVisible();

    // Test excessive emergency access attempts
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="emergency-code"]', `WRONG${i}`);
      await page.click('[data-testid="emergency-access-confirm"]');
      await page.waitForSelector('[data-testid="emergency-auth-error"]');
    }

    // Should show temporary lockout after multiple failed attempts
    await expect(
      page.locator('[data-testid="emergency-lockout"]')
    ).toBeVisible();
    await expect(page.locator('text=Muitas tentativas falharam')).toBeVisible();
    await expect(
      page.locator('text=Aguarde 5 minutos antes de tentar novamente')
    ).toBeVisible();

    // Should disable emergency access button temporarily
    await expect(
      page.locator('[data-testid="emergency-access-confirm"]')
    ).toBeDisabled();
  });
});
