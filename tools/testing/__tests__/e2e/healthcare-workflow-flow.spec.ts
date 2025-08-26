import { expect, test } from "@playwright/test";

test.describe("Complete Healthcare Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto("/login");
    await page.fill('input[type="email"]', "doctor@neonpro.com");
    await page.fill('input[type="password"]', "doctorpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should complete full consultation workflow", async ({ page }) => {
    // Start from appointment
    await page.goto("/appointments");
    await page.click('[data-testid="appointment-ready-checkin"]');
    await page.click('[data-testid="start-consultation-btn"]');

    // Should navigate to consultation interface
    await expect(page).toHaveURL(/\/consultation\/[a-zA-Z0-9-]+/);

    // Patient information should be visible
    await expect(
      page.locator('[data-testid="patient-info-panel"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="patient-name"]')).toContainText(
      "João Silva Santos",
    );

    // Record vital signs
    await page.click('[data-testid="vital-signs-tab"]');
    await page.fill('[data-testid="blood-pressure-systolic"]', "130");
    await page.fill('[data-testid="blood-pressure-diastolic"]', "80");
    await page.fill('[data-testid="heart-rate"]', "75");
    await page.fill('[data-testid="temperature"]', "36.5");
    await page.fill('[data-testid="weight"]', "78.5");
    await page.fill('[data-testid="height"]', "175");

    // Save vital signs
    await page.click('[data-testid="save-vital-signs-btn"]');
    await expect(page.locator("text=Sinais vitais registrados")).toBeVisible();

    // Record chief complaint and history
    await page.click('[data-testid="anamnesis-tab"]');
    await page.fill(
      '[data-testid="chief-complaint"]',
      "Dor de cabeça há 3 dias",
    );
    await page.fill(
      '[data-testid="present-illness"]',
      "Paciente relata cefaleia pulsátil, de intensidade moderada, iniciada há 3 dias. Não houve fatores desencadeantes identificados. Melhora parcial com analgésicos comuns.",
    );
    await page.fill(
      '[data-testid="review-systems"]',
      "Nega náuseas, vômitos, alterações visuais ou neurológicas associadas.",
    );

    // Physical examination
    await page.click('[data-testid="physical-exam-tab"]');
    await page.fill(
      '[data-testid="general-appearance"]',
      "Paciente em bom estado geral, consciente, orientado.",
    );
    await page.fill(
      '[data-testid="cardiovascular-exam"]',
      "Ritmo cardíaco regular, bulhas normofonéticas, sem sopros.",
    );
    await page.fill(
      '[data-testid="neurological-exam"]',
      "Sem sinais neurológicos focais. Reflexos normais.",
    );

    // Clinical reasoning and diagnosis
    await page.click('[data-testid="diagnosis-tab"]');
    await page.fill(
      '[data-testid="clinical-reasoning"]',
      "Quadro compatível com cefaleia tensional, sem sinais de alarme.",
    );

    // Add diagnosis
    await page.click('[data-testid="add-diagnosis-btn"]');
    await page.fill('[data-testid="diagnosis-code"]', "G44.2");
    await page.fill(
      '[data-testid="diagnosis-description"]',
      "Cefaleia do tipo tensional",
    );
    await page.click('[data-testid="diagnosis-primary-checkbox"]');
    await page.click('[data-testid="save-diagnosis-btn"]');

    // Treatment plan
    await page.click('[data-testid="treatment-tab"]');
    await page.fill(
      '[data-testid="treatment-plan"]',
      "Orientações sobre higiene do sono, redução de estresse. Analgésico se necessário. Retorno se persistir ou piorar.",
    );

    // Save consultation
    await page.click('[data-testid="save-consultation-btn"]');
    await expect(
      page.locator("text=Consulta registrada com sucesso"),
    ).toBeVisible();
  });

  test("should manage prescriptions with controlled medications", async ({
    page,
  }) => {
    // Start from consultation or patient profile
    await page.goto("/patients");
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="prescriptions-tab"]');

    // Create new prescription
    await page.click('[data-testid="new-prescription-btn"]');

    // Add regular medication
    await page.click('[data-testid="add-medication-btn"]');
    await page.fill('[data-testid="medication-name"]', "Paracetamol");
    await page.fill('[data-testid="medication-dose"]', "500mg");
    await page.fill('[data-testid="medication-frequency"]', "A cada 6 horas");
    await page.fill('[data-testid="medication-duration"]', "5 dias");
    await page.fill(
      '[data-testid="medication-instructions"]',
      "Tomar se dor ou febre",
    );

    // Add controlled medication (requires special handling)
    await page.click('[data-testid="add-medication-btn"]');
    await page.fill('[data-testid="medication-name"]', "Clonazepam");
    await page.fill('[data-testid="medication-dose"]', "0,5mg");
    await page.fill(
      '[data-testid="medication-frequency"]',
      "1x ao dia à noite",
    );
    await page.fill('[data-testid="medication-duration"]', "30 dias");

    // Should show controlled medication warning
    await expect(
      page.locator('[data-testid="controlled-medication-warning"]'),
    ).toBeVisible();
    await expect(
      page.locator("text=Medicamento controlado - Receita Azul"),
    ).toBeVisible();

    // Fill controlled medication requirements
    await page.fill(
      '[data-testid="controlled-justification"]',
      "Tratamento de ansiedade conforme avaliação clínica",
    );
    await page.check('[data-testid="patient-consent-controlled"]');

    // Digital signature and CRM validation
    await page.fill('[data-testid="digital-signature-pin"]', "123456");
    await page.click('[data-testid="validate-crm-btn"]');
    await expect(page.locator("text=CRM validado com sucesso")).toBeVisible();

    // Generate prescription
    await page.click('[data-testid="generate-prescription-btn"]');

    // Should show prescription preview
    await expect(
      page.locator('[data-testid="prescription-preview"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="prescription-pdf"]'),
    ).toBeVisible();

    // Should have separate controlled medication receipt
    await expect(
      page.locator('[data-testid="controlled-prescription-pdf"]'),
    ).toBeVisible();

    // Print and save
    await page.click('[data-testid="save-and-print-btn"]');
    await expect(page.locator("text=Receitas geradas e salvas")).toBeVisible();
  });

  test("should handle medical certificate issuance", async ({ page }) => {
    await page.goto("/patients");
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="certificates-tab"]');

    // Create work absence certificate
    await page.click('[data-testid="new-certificate-btn"]');
    await page.click('[data-testid="certificate-type-work-absence"]');

    // Fill certificate details
    await page.fill(
      '[data-testid="certificate-reason"]',
      "Cefaleia incapacitante",
    );
    await page.fill('[data-testid="absence-days"]', "2");

    // Set certificate dates
    const today = new Date().toLocaleDateString("pt-BR");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString("pt-BR");

    await page.fill('[data-testid="absence-start-date"]', today);
    await page.fill('[data-testid="absence-end-date"]', tomorrowStr);

    // Add medical observations
    await page.fill(
      '[data-testid="medical-observations"]',
      "Repouso recomendado devido a quadro de cefaleia intensa",
    );

    // CID code
    await page.fill('[data-testid="cid-code"]', "G44.2");

    // Digital signature
    await page.fill('[data-testid="digital-signature-pin"]', "123456");

    // Generate certificate
    await page.click('[data-testid="generate-certificate-btn"]');

    // Should show certificate preview
    await expect(
      page.locator('[data-testid="certificate-preview"]'),
    ).toBeVisible();
    await expect(page.locator("text=ATESTADO MÉDICO")).toBeVisible();

    // Validate certificate information
    await expect(
      page.locator('[data-testid="certificate-patient-name"]'),
    ).toContainText("João Silva Santos");
    await expect(
      page.locator('[data-testid="certificate-days"]'),
    ).toContainText("2 dias");

    // Save certificate
    await page.click('[data-testid="save-certificate-btn"]');
    await expect(
      page.locator("text=Atestado emitido com sucesso"),
    ).toBeVisible();
  });

  test("should manage medical exams and referrals", async ({ page }) => {
    await page.goto("/patients");
    await page.click('[data-testid="patient-item-123.456.789-00"]');
    await page.click('[data-testid="exams-referrals-tab"]');

    // Request laboratory exam
    await page.click('[data-testid="request-exam-btn"]');
    await page.click('[data-testid="exam-type-laboratory"]');

    // Select laboratory tests
    await page.check('[data-testid="exam-hemograma"]');
    await page.check('[data-testid="exam-glicemia"]');
    await page.check('[data-testid="exam-colesterol"]');

    // Add clinical indication
    await page.fill(
      '[data-testid="exam-clinical-indication"]',
      "Avaliação de rotina - controle de diabetes e dislipidemia",
    );

    // Set exam priority
    await page.click('[data-testid="exam-priority-routine"]');

    // Patient preparation instructions
    await page.fill('[data-testid="exam-preparation"]', "Jejum de 12 horas");

    // Generate exam request
    await page.click('[data-testid="generate-exam-request-btn"]');

    // Should show exam request preview
    await expect(
      page.locator('[data-testid="exam-request-preview"]'),
    ).toBeVisible();
    await page.click('[data-testid="save-exam-request-btn"]');

    // Request medical referral
    await page.click('[data-testid="request-referral-btn"]');

    // Select specialty
    await page.click('[data-testid="referral-specialty-select"]');
    await page.click('[data-testid="specialty-cardiology"]');

    // Fill referral details
    await page.fill(
      '[data-testid="referral-reason"]',
      "Avaliação cardiológica - hipertensão arterial",
    );
    await page.fill(
      '[data-testid="referral-clinical-summary"]',
      "Paciente com HAS em uso de Losartana, PA atual 130x80mmHg. Solicito avaliação para ajuste terapêutico.",
    );

    // Set referral priority
    await page.click('[data-testid="referral-priority-routine"]');

    // Generate referral
    await page.click('[data-testid="generate-referral-btn"]');
    await expect(
      page.locator('[data-testid="referral-preview"]'),
    ).toBeVisible();
    await page.click('[data-testid="save-referral-btn"]');

    await expect(
      page.locator("text=Encaminhamento gerado com sucesso"),
    ).toBeVisible();
  });

  test("should handle emergency protocols and alerts", async ({ page }) => {
    // Simulate emergency scenario
    await page.goto("/patients");
    await page.click('[data-testid="patient-item-123.456.789-00"]');

    // Trigger emergency alert
    await page.click('[data-testid="emergency-alert-btn"]');

    // Should show emergency protocol interface
    await expect(
      page.locator('[data-testid="emergency-interface"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="emergency-header"]'),
    ).toContainText("PROTOCOLO DE EMERGÊNCIA");

    // Select emergency type
    await page.click('[data-testid="emergency-type-select"]');
    await page.click('[data-testid="emergency-type-cardiac"]');

    // Should load cardiac emergency protocol
    await expect(page.locator('[data-testid="protocol-steps"]')).toBeVisible();
    await expect(
      page.locator("text=Protocolo de Parada Cardiorrespiratória"),
    ).toBeVisible();

    // Mark protocol steps as completed
    await page.check('[data-testid="step-1-airway"]');
    await page.check('[data-testid="step-2-breathing"]');
    await page.check('[data-testid="step-3-circulation"]');

    // Record emergency medications administered
    await page.click('[data-testid="emergency-medications-tab"]');
    await page.click('[data-testid="add-emergency-med-btn"]');
    await page.fill('[data-testid="emergency-med-name"]', "Epinefrina");
    await page.fill('[data-testid="emergency-med-dose"]', "1mg");
    await page.fill('[data-testid="emergency-med-route"]', "IV");

    const currentTime = new Date().toLocaleTimeString("pt-BR");
    await page.fill('[data-testid="emergency-med-time"]', currentTime);

    // Record vital signs during emergency
    await page.click('[data-testid="emergency-vitals-tab"]');
    await page.fill('[data-testid="emergency-bp"]', "70/40");
    await page.fill('[data-testid="emergency-hr"]', "40");
    await page.fill('[data-testid="emergency-resp"]', "6");

    // Call for backup/ambulance
    await page.click('[data-testid="call-ambulance-btn"]');
    await expect(
      page.locator('[data-testid="ambulance-called-status"]'),
    ).toContainText("SAMU chamado");

    // Document emergency outcome
    await page.click('[data-testid="emergency-outcome-tab"]');
    await page.fill(
      '[data-testid="emergency-outcome"]',
      "Paciente estabilizado após protocolo de RCP. Transferido para CTI.",
    );

    // Save emergency record
    await page.click('[data-testid="save-emergency-record-btn"]');
    await expect(
      page.locator("text=Registro de emergência salvo"),
    ).toBeVisible();

    // Should generate emergency report
    await expect(
      page.locator('[data-testid="emergency-report-generated"]'),
    ).toBeVisible();
  });

  test("should handle telemedicine consultation workflow", async ({ page }) => {
    await page.goto("/appointments");

    // Start telemedicine appointment
    await page.click('[data-testid="telemedicine-appointment"]');
    await page.click('[data-testid="start-video-consultation-btn"]');

    // Should initialize video interface
    await expect(
      page.locator('[data-testid="video-consultation-interface"]'),
    ).toBeVisible();

    // Video controls should be available
    await expect(page.locator('[data-testid="video-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="mute-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-btn"]')).toBeVisible();

    // Patient should appear as connected
    await expect(
      page.locator('[data-testid="patient-connection-status"]'),
    ).toContainText("Conectado");

    // Share screen for showing exam results
    await page.click('[data-testid="share-screen-btn"]');
    await expect(
      page.locator('[data-testid="screen-sharing-active"]'),
    ).toBeVisible();

    // Record consultation notes during call
    await page.fill(
      '[data-testid="telemedicine-notes"]',
      "Consulta por telemedicina. Paciente apresenta melhora do quadro de cefaleia.",
    );

    // Take screenshot for medical record
    await page.click('[data-testid="capture-screenshot-btn"]');
    await expect(
      page.locator("text=Captura salva no prontuário"),
    ).toBeVisible();

    // End consultation
    await page.click('[data-testid="end-consultation-btn"]');

    // Should show consultation summary
    await expect(
      page.locator('[data-testid="consultation-summary"]'),
    ).toBeVisible();

    // Duration should be recorded
    await expect(
      page.locator('[data-testid="consultation-duration"]'),
    ).toBeVisible();

    // Save telemedicine record
    await page.click('[data-testid="save-telemedicine-record-btn"]');
    await expect(
      page.locator("text=Teleconsulta registrada com sucesso"),
    ).toBeVisible();
  });
});
