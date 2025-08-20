import { expect, test } from '@playwright/test';

test.describe('LGPD Compliance Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@neonpro.com');
    await page.fill('input[type="password"]', 'doctorpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle patient consent management', async ({ page }) => {
    await page.goto('/patients');
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="privacy-settings-tab"]');

    // Should display LGPD consent dashboard
    await expect(
      page.locator('[data-testid="lgpd-consent-dashboard"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Gestão de Consentimentos LGPD')
    ).toBeVisible();

    // Current consent status
    await expect(
      page.locator('[data-testid="consent-status-active"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="consent-date"]')).toBeVisible();

    // Detailed consent breakdown
    await expect(
      page.locator('[data-testid="consent-data-processing"]')
    ).toContainText('✅ Processamento de dados pessoais');
    await expect(
      page.locator('[data-testid="consent-medical-records"]')
    ).toContainText('✅ Armazenamento de prontuário médico');
    await expect(
      page.locator('[data-testid="consent-telemedicine"]')
    ).toContainText('✅ Consultas por telemedicina');
    await expect(
      page.locator('[data-testid="consent-marketing"]')
    ).toContainText('❌ Comunicações de marketing');

    // Request additional consent
    await page.click('[data-testid="request-additional-consent-btn"]');

    // Select marketing communications
    await page.check('[data-testid="consent-marketing-checkbox"]');
    await page.fill(
      '[data-testid="consent-purpose"]',
      'Envio de informações sobre campanhas de saúde preventiva'
    );

    // Send consent request to patient
    await page.click('[data-testid="send-consent-request-btn"]');
    await expect(
      page.locator('text=Solicitação de consentimento enviada')
    ).toBeVisible();

    // Should show pending consent request
    await expect(
      page.locator('[data-testid="pending-consent-marketing"]')
    ).toContainText('⏳ Aguardando resposta do paciente');
  });

  test('should manage patient data access rights', async ({ page }) => {
    await page.goto('/patients');
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="privacy-settings-tab"]');

    // Navigate to data access section
    await page.click('[data-testid="data-access-rights-tab"]');

    // Should display LGPD rights information
    await expect(
      page.locator('[data-testid="lgpd-rights-panel"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Direitos do Titular dos Dados')
    ).toBeVisible();

    // Data portability - Export patient data
    await page.click('[data-testid="export-patient-data-btn"]');

    // Should show export options
    await expect(
      page.locator('[data-testid="export-options-modal"]')
    ).toBeVisible();

    // Select data categories to export
    await page.check('[data-testid="export-personal-data"]');
    await page.check('[data-testid="export-medical-records"]');
    await page.check('[data-testid="export-appointments"]');
    await page.check('[data-testid="export-prescriptions"]');

    // Select export format
    await page.click('[data-testid="export-format-select"]');
    await page.click('[data-testid="format-pdf"]');

    // Add export reason (for audit trail)
    await page.fill(
      '[data-testid="export-reason"]',
      'Solicitação do paciente para portabilidade de dados conforme Art. 18 da LGPD'
    );

    // Generate export
    await page.click('[data-testid="generate-export-btn"]');

    // Should show processing status
    await expect(
      page.locator('[data-testid="export-processing"]')
    ).toContainText('Processando exportação...');

    // Wait for completion (in real scenario would be async)
    await page.waitForSelector('[data-testid="export-completed"]', {
      timeout: 10_000,
    });

    // Should provide download link
    await expect(
      page.locator('[data-testid="download-export-btn"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Exportação concluída com sucesso')
    ).toBeVisible();

    // Should log the export action
    await expect(page.locator('[data-testid="audit-log-entry"]')).toContainText(
      'Exportação de dados realizada'
    );
  });

  test('should handle data rectification requests', async ({ page }) => {
    await page.goto('/patients');
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="privacy-settings-tab"]');
    await page.click('[data-testid="data-access-rights-tab"]');

    // Data rectification request
    await page.click('[data-testid="request-data-rectification-btn"]');

    // Should show rectification form
    await expect(
      page.locator('[data-testid="rectification-form-modal"]')
    ).toBeVisible();

    // Select field to rectify
    await page.click('[data-testid="rectify-field-select"]');
    await page.click('[data-testid="field-phone"]');

    // Current value
    await expect(page.locator('[data-testid="current-value"]')).toContainText(
      '(11) 99999-9999'
    );

    // New value
    await page.fill('[data-testid="new-value"]', '(11) 88888-8888');

    // Justification
    await page.fill(
      '[data-testid="rectification-justification"]',
      'Número de telefone atualizado pelo paciente'
    );

    // Supporting documentation option
    await page.setInputFiles(
      '[data-testid="rectification-evidence"]',
      'test-document.pdf'
    );

    // Submit rectification request
    await page.click('[data-testid="submit-rectification-btn"]');

    // Should show confirmation
    await expect(
      page.locator('text=Solicitação de retificação registrada')
    ).toBeVisible();

    // Should create audit trail entry
    await page.click('[data-testid="audit-log-tab"]');
    await expect(page.locator('[data-testid="audit-log-entry"]')).toContainText(
      'Retificação solicitada - Campo: telefone'
    );

    // Should show pending approval status
    await expect(
      page.locator('[data-testid="rectification-status"]')
    ).toContainText('Aguardando aprovação');
  });

  test('should manage data retention and deletion', async ({ page }) => {
    await page.goto('/patients');
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="privacy-settings-tab"]');

    // Navigate to data retention section
    await page.click('[data-testid="data-retention-tab"]');

    // Should display retention policy information
    await expect(
      page.locator('[data-testid="retention-policy-panel"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Política de Retenção de Dados')
    ).toBeVisible();

    // Show retention periods for different data types
    await expect(
      page.locator('[data-testid="retention-medical-records"]')
    ).toContainText('Prontuário médico: 20 anos');
    await expect(
      page.locator('[data-testid="retention-personal-data"]')
    ).toContainText('Dados pessoais: 5 anos após último contato');
    await expect(
      page.locator('[data-testid="retention-financial-data"]')
    ).toContainText('Dados financeiros: 5 anos');

    // Data deletion request (right to erasure)
    await page.click('[data-testid="request-data-deletion-btn"]');

    // Should show deletion warning modal
    await expect(
      page.locator('[data-testid="deletion-warning-modal"]')
    ).toBeVisible();
    await expect(
      page.locator('text=ATENÇÃO: Solicitação de Exclusão de Dados')
    ).toBeVisible();

    // Legal requirements warning
    await expect(
      page.locator('[data-testid="legal-requirements-warning"]')
    ).toContainText(
      'Alguns dados médicos devem ser mantidos por período legal mínimo'
    );

    // Deletion options
    await page.check('[data-testid="delete-personal-data"]');
    await page.check('[data-testid="anonymize-medical-records"]'); // Instead of complete deletion

    // Deletion justification
    await page.fill(
      '[data-testid="deletion-justification"]',
      'Solicitação do titular dos dados conforme Art. 18, VI da LGPD'
    );

    // Legal basis verification
    await page.check('[data-testid="verify-legal-basis"]');
    await page.check('[data-testid="confirm-patient-identity"]');

    // Data controller approval required
    await page.fill(
      '[data-testid="controller-authorization"]',
      'Dr. Maria Silva - Responsável pela Proteção de Dados'
    );

    // Submit deletion request
    await page.click('[data-testid="submit-deletion-request-btn"]');

    // Should show deletion confirmation
    await expect(
      page.locator('text=Solicitação de exclusão registrada')
    ).toBeVisible();

    // Should show what will be deleted vs. anonymized
    await expect(
      page.locator('[data-testid="deletion-summary"]')
    ).toContainText('Dados pessoais: Serão excluídos em 30 dias');
    await expect(
      page.locator('[data-testid="anonymization-summary"]')
    ).toContainText('Prontuário médico: Será anonimizado');
  });

  test('should handle data breach incident workflow', async ({ page }) => {
    // Navigate to admin/compliance section
    await page.goto('/admin/compliance');

    // Should require admin privileges
    await expect(
      page.locator('[data-testid="compliance-dashboard"]')
    ).toBeVisible();

    // Report data breach
    await page.click('[data-testid="report-data-breach-btn"]');

    // Should open incident report form
    await expect(
      page.locator('[data-testid="breach-report-form"]')
    ).toBeVisible();

    // Incident classification
    await page.click('[data-testid="breach-type-select"]');
    await page.click('[data-testid="breach-type-unauthorized-access"]');

    // Severity assessment
    await page.click('[data-testid="breach-severity-select"]');
    await page.click('[data-testid="severity-high"]');

    // Affected data description
    await page.fill(
      '[data-testid="affected-data-description"]',
      'Acesso não autorizado a prontuários médicos de 50 pacientes'
    );

    // Number of affected individuals
    await page.fill('[data-testid="affected-individuals-count"]', '50');

    // Risk assessment
    await page.check('[data-testid="risk-identity-theft"]');
    await page.check('[data-testid="risk-medical-discrimination"]');

    // Discovery details
    const currentDateTime = new Date().toLocaleString('pt-BR');
    await page.fill('[data-testid="incident-discovery-date"]', currentDateTime);
    await page.fill(
      '[data-testid="incident-description"]',
      'Funcionário acessou dados sem autorização utilizando credenciais de colega'
    );

    // Immediate containment actions
    await page.check('[data-testid="action-system-secured"]');
    await page.check('[data-testid="action-access-revoked"]');
    await page.fill('[data-testid="containment-actions'
    ]', 'Sistema bloqueado temporariamente. Acesso
    do { funcionário  }suspenso. Logs
    auditados.
    ');

    // ANPD notification requirement
    await page.click('[data-testid="anpd-notification-required"]')
    await expect(
      page.locator('[data-testid="anpd-notification-warning"]')
    ).toContainText('Notificação à ANPD necessária em 72 horas')

    // Affected individuals notification
    await page.check('[data-testid="notify-affected-individuals"]')
    await page.fill(
      '[data-testid="notification-method"]',
      'Email e carta registrada'
    )

    // Submit breach report
    await page.click('[data-testid="submit-breach-report-btn"]')

    // Should create incident ID
    await expect(page.locator('[data-testid="incident-id"]')).toBeVisible()

    // Should show next steps timeline
    await expect(
      page.locator('[data-testid="response-timeline"]')
    ).toContainText('72h: Notificar ANPD');
    await expect(
      page.locator('[data-testid="response-timeline"]')
    ).toContainText('5 dias: Notificar indivíduos afetados');

    // Should create audit log entry
    await expect(
      page.locator('text=Incidente de violação de dados registrado')
    ).toBeVisible();
  });

  test('should manage consent withdrawal process', async ({ page }) => {
    await page.goto('/patients');
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="privacy-settings-tab"]');

    // Withdraw specific consent
    await page.click('[data-testid="withdraw-consent-btn"]');

    // Should show consent withdrawal form
    await expect(
      page.locator('[data-testid="consent-withdrawal-modal"]')
    ).toBeVisible();

    // Select consents to withdraw
    await page.check('[data-testid="withdraw-marketing-consent"]');
    await page.check('[data-testid="withdraw-telemedicine-consent"]');

    // Keep essential consents (required for medical care)
    await expect(
      page.locator('[data-testid="essential-consent-info"]')
    ).toContainText(
      'Alguns consentimentos são essenciais para o atendimento médico'
    );

    // Withdrawal reason
    await page.fill(
      '[data-testid="withdrawal-reason"]',
      'Paciente não deseja mais receber comunicações de marketing'
    );

    // Effective date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('pt-BR');
    await page.fill('[data-testid="withdrawal-effective-date"]', tomorrowStr);

    // Process withdrawal
    await page.click('[data-testid="process-withdrawal-btn"]');

    // Should show withdrawal confirmation
    await expect(
      page.locator('text=Retirada de consentimento processada')
    ).toBeVisible();

    // Should update consent status
    await expect(
      page.locator('[data-testid="consent-marketing"]')
    ).toContainText('❌ Retirado em');
    await expect(
      page.locator('[data-testid="consent-telemedicine"]')
    ).toContainText('❌ Retirado em');

    // Should show impact of withdrawal
    await expect(
      page.locator('[data-testid="withdrawal-impact"]')
    ).toContainText('Comunicações de marketing serão interrompidas');
    await expect(
      page.locator('[data-testid="withdrawal-impact"]')
    ).toContainText('Teleconsultas não estarão mais disponíveis');

    // Should create audit trail
    await page.click('[data-testid="audit-log-tab"]');
    await expect(page.locator('[data-testid="audit-log-entry"]')).toContainText(
      'Consentimento retirado - Marketing e Telemedicina'
    );
  });

  test('should handle ANPD reporting and compliance monitoring', async ({
    page,
  }) => {
    await page.goto('/admin/compliance');

    // ANPD reporting dashboard
    await page.click('[data-testid="anpd-reporting-tab"]');
    await expect(page.locator('[data-testid="anpd-dashboard"]')).toBeVisible();

    // Generate monthly compliance report
    await page.click('[data-testid="generate-monthly-report-btn"]');

    // Should show report generation options
    await expect(
      page.locator('[data-testid="report-options-modal"]')
    ).toBeVisible();

    // Select report period
    const currentMonth = new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
    await page.click('[data-testid="report-period-select"]');
    await page.click(`[data-testid="period-${currentMonth}"]`);

    // Include sections
    await page.check('[data-testid="include-consent-metrics"]');
    await page.check('[data-testid="include-data-requests"]');
    await page.check('[data-testid="include-breach-incidents"]');
    await page.check('[data-testid="include-retention-actions"]');

    // Generate report
    await page.click('[data-testid="generate-report-btn"]');

    // Should show report summary
    await expect(
      page.locator('[data-testid="compliance-report-summary"]')
    ).toBeVisible();

    // Key metrics should be displayed
    await expect(page.locator('[data-testid="total-patients"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-consents"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="data-requests-processed"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="breach-incidents"]')
    ).toBeVisible();

    // Should generate PDF report for ANPD
    await page.click('[data-testid="download-anpd-report-btn"]');
    await expect(
      page.locator('text=Relatório ANPD gerado com sucesso')
    ).toBeVisible();

    // Compliance status indicators
    await expect(
      page.locator('[data-testid="compliance-status-consents"]')
    ).toContainText('✅ Em conformidade');
    await expect(
      page.locator('[data-testid="compliance-status-retention"]')
    ).toContainText('✅ Em conformidade');
    await expect(
      page.locator('[data-testid="compliance-status-security"]')
    ).toContainText('✅ Em conformidade');
  });
});
