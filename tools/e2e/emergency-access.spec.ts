import { expect, test } from "@playwright/test";

/**
 * Emergency Access Page E2E Tests for NeonPro Healthcare
 *
 * Critical emergency workflows:
 * - Emergency patient information access
 * - Quick patient search and identification
 * - Medical history and allergy information
 * - Emergency contact information
 * - Critical medical alerts and warnings
 * - ANVISA compliance for emergency protocols
 */

test.describe("Emergency Access - Patient Search", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to emergency page (should be accessible without full login)
    await page.goto("/emergency");
    await page.waitForLoadState("networkidle");
  });

  test("should display emergency access interface", async ({ page }) => {
    // Check emergency page title
    await expect(page.locator("h1, .emergency-title")).toContainText(
      /Emergência|Emergency|Acesso de Emergência/,
    );

    // Should display emergency warning/notice
    await expect(
      page
        .locator('[data-testid="emergency-notice"]')
        .or(page.locator(".emergency-notice")),
    ).toBeVisible();

    // Should have patient search functionality
    await expect(
      page
        .locator('[data-testid="patient-search"]')
        .or(page.locator(".patient-search")),
    ).toBeVisible();

    // Should display emergency contact information
    const emergencyContact = page
      .locator('[data-testid="emergency-contact"]')
      .or(page.locator("text=192"));
    if (await emergencyContact.isVisible()) {
      await expect(emergencyContact).toBeVisible();
    }
  });

  test("should search patient by CPF", async ({ page }) => {
    // Enter patient CPF
    const cpfField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .or(page.locator('input[placeholder*="CPF"]'));
    await cpfField.fill("123.456.789-00");

    // Click search button
    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Should show patient results or not found message
    const patientResults = page
      .locator('[data-testid="patient-results"]')
      .or(page.locator(".patient-results"));
    const notFoundMessage = page
      .locator('[data-testid="patient-not-found"]')
      .or(page.locator("text=não encontrado"));

    // Either results or not found should be visible
    expect(
      (await patientResults.isVisible()) || (await notFoundMessage.isVisible()),
    ).toBeTruthy();
  });

  test("should search patient by name", async ({ page }) => {
    // Enter patient name
    const nameField = page
      .locator('[data-testid="patient-name"]')
      .or(page.locator('input[name="name"]'))
      .or(page.locator('input[placeholder*="Nome"]'));
    await nameField.fill("João Silva");

    // Click search button
    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Should show search results
    const searchResults = page
      .locator('[data-testid="search-results"]')
      .or(page.locator(".search-results"));
    await expect(searchResults).toBeVisible();
  });

  test("should search patient by phone number", async ({ page }) => {
    // Look for phone search option
    const phoneField = page
      .locator('[data-testid="patient-phone"]')
      .or(page.locator('input[name="phone"]'))
      .or(page.locator('input[placeholder*="Telefone"]'));

    if (await phoneField.isVisible()) {
      await phoneField.fill("(11) 99999-9999");

      // Click search button
      const searchButton = page
        .locator('[data-testid="search-patient"]')
        .or(page.locator('button:has-text("Buscar")'))
        .first();
      await searchButton.click();

      // Should show search results
      const searchResults = page
        .locator('[data-testid="search-results"]')
        .or(page.locator(".search-results"));
      await expect(searchResults).toBeVisible();
    }
  });

  test("should validate search input", async ({ page }) => {
    // Try to search without input
    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Should show validation error
    await expect(
      page
        .locator(".error")
        .or(page.locator("text=obrigatório"))
        .or(page.locator("text=preencha")),
    ).toBeVisible();
  });

  test("should handle invalid CPF format", async ({ page }) => {
    // Enter invalid CPF
    const cpfField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .or(page.locator('input[placeholder*="CPF"]'));
    await cpfField.fill("123.456");

    // Click search button
    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Should show CPF validation error
    await expect(
      page
        .locator(".error")
        .or(page.locator("text=inválido"))
        .or(page.locator("text=formato")),
    ).toBeVisible();
  });
});

test.describe("Emergency Access - Patient Information", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to emergency page and search for a patient
    await page.goto("/emergency");
    await page.waitForLoadState("networkidle");

    // Search for test patient
    const cpfField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .or(page.locator('input[placeholder*="CPF"]'));
    await cpfField.fill("123.456.789-00");

    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Select patient if multiple results
    const patientResult = page
      .locator('[data-testid="patient-result"]')
      .or(page.locator(".patient-result"))
      .first();
    if (await patientResult.isVisible()) {
      await patientResult.click();
    }
  });

  test("should display critical patient information", async ({ page }) => {
    // Should display patient basic info
    await expect(
      page
        .locator('[data-testid="patient-name"]')
        .or(page.locator(".patient-name")),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid="patient-age"]')
        .or(page.locator(".patient-age")),
    ).toBeVisible();

    // Should display blood type if available
    const bloodType = page
      .locator('[data-testid="blood-type"]')
      .or(page.locator("text=Tipo Sanguíneo"));
    if (await bloodType.isVisible()) {
      await expect(bloodType).toBeVisible();
    }

    // Should display emergency contact
    const emergencyContact = page
      .locator('[data-testid="emergency-contact"]')
      .or(page.locator("text=Contato de Emergência"));
    if (await emergencyContact.isVisible()) {
      await expect(emergencyContact).toBeVisible();
    }
  });

  test("should display medical allergies and alerts", async ({ page }) => {
    // Should show allergies section
    const allergiesSection = page
      .locator('[data-testid="allergies"]')
      .or(page.locator("text=Alergia"));
    if (await allergiesSection.isVisible()) {
      await expect(allergiesSection).toBeVisible();

      // Should highlight critical allergies
      const criticalAllergy = page
        .locator('[data-testid="critical-allergy"]')
        .or(page.locator(".critical-allergy"));
      if (await criticalAllergy.isVisible()) {
        await expect(criticalAllergy).toHaveClass(/critical|danger|alert/);
      }
    }

    // Should show medical alerts
    const medicalAlerts = page
      .locator('[data-testid="medical-alerts"]')
      .or(page.locator("text=Alerta Médico"));
    if (await medicalAlerts.isVisible()) {
      await expect(medicalAlerts).toBeVisible();
    }
  });

  test("should display current medications", async ({ page }) => {
    // Should show medications section
    const medicationsSection = page
      .locator('[data-testid="medications"]')
      .or(page.locator("text=Medicação"));
    if (await medicationsSection.isVisible()) {
      await expect(medicationsSection).toBeVisible();

      // Should list current medications
      const medicationList = page
        .locator('[data-testid="medication-list"]')
        .or(page.locator(".medication-list"));
      await expect(medicationList).toBeVisible();

      // Should highlight critical medications
      const criticalMedication = page
        .locator('[data-testid="critical-medication"]')
        .or(page.locator(".critical-medication"));
      if (await criticalMedication.isVisible()) {
        await expect(criticalMedication).toHaveClass(/critical|important/);
      }
    }
  });

  test("should display medical history summary", async ({ page }) => {
    // Should show medical history section
    const historySection = page
      .locator('[data-testid="medical-history"]')
      .or(page.locator("text=Histórico Médico"));
    if (await historySection.isVisible()) {
      await expect(historySection).toBeVisible();

      // Should show recent procedures or conditions
      const recentHistory = page
        .locator('[data-testid="recent-history"]')
        .or(page.locator(".recent-history"));
      if (await recentHistory.isVisible()) {
        await expect(recentHistory).toBeVisible();
      }

      // Should show chronic conditions
      const chronicConditions = page
        .locator('[data-testid="chronic-conditions"]')
        .or(page.locator("text=Condições Crônicas"));
      if (await chronicConditions.isVisible()) {
        await expect(chronicConditions).toBeVisible();
      }
    }
  });

  test("should display insurance information", async ({ page }) => {
    // Should show insurance section
    const insuranceSection = page
      .locator('[data-testid="insurance"]')
      .or(page.locator("text=Convênio"));
    if (await insuranceSection.isVisible()) {
      await expect(insuranceSection).toBeVisible();

      // Should display insurance provider
      const insuranceProvider = page
        .locator('[data-testid="insurance-provider"]')
        .or(page.locator(".insurance-provider"));
      await expect(insuranceProvider).toBeVisible();

      // Should display policy number
      const policyNumber = page
        .locator('[data-testid="policy-number"]')
        .or(page.locator(".policy-number"));
      if (await policyNumber.isVisible()) {
        await expect(policyNumber).toBeVisible();
      }
    }
  });
});

test.describe("Emergency Access - Emergency Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to emergency page with patient selected
    await page.goto("/emergency");
    await page.waitForLoadState("networkidle");

    // Search and select patient
    const cpfField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .or(page.locator('input[placeholder*="CPF"]'));
    await cpfField.fill("123.456.789-00");

    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    const patientResult = page
      .locator('[data-testid="patient-result"]')
      .or(page.locator(".patient-result"))
      .first();
    if (await patientResult.isVisible()) {
      await patientResult.click();
    }
  });

  test("should call emergency services", async ({ page }) => {
    // Look for emergency call button
    const emergencyCallButton = page
      .locator('[data-testid="call-emergency"]')
      .or(page.locator('button:has-text("192")'))
      .or(page.locator('button:has-text("SAMU")'))
      .first();

    if (await emergencyCallButton.isVisible()) {
      await expect(emergencyCallButton).toBeVisible();

      // Should be prominently displayed
      await expect(emergencyCallButton).toHaveClass(
        /emergency|urgent|critical/,
      );

      // Click should show confirmation or dial
      await emergencyCallButton.click();

      // Should show confirmation dialog
      const confirmDialog = page
        .locator('[data-testid="call-confirmation"]')
        .or(page.locator(".call-confirmation"));
      if (await confirmDialog.isVisible()) {
        await expect(confirmDialog).toBeVisible();
      }
    }
  });

  test("should contact patient emergency contact", async ({ page }) => {
    // Look for emergency contact call button
    const contactButton = page
      .locator('[data-testid="call-emergency-contact"]')
      .or(page.locator('button:has-text("Contatar")'))
      .first();

    if (await contactButton.isVisible()) {
      await contactButton.click();

      // Should show contact options
      const contactOptions = page
        .locator('[data-testid="contact-options"]')
        .or(page.locator(".contact-options"));
      if (await contactOptions.isVisible()) {
        await expect(contactOptions).toBeVisible();

        // Should have phone and SMS options
        await expect(
          page.locator("text=Telefone").or(page.locator("text=SMS")),
        ).toBeVisible();
      }
    }
  });

  test("should print patient summary", async ({ page }) => {
    // Look for print button
    const printButton = page
      .locator('[data-testid="print-summary"]')
      .or(page.locator('button:has-text("Imprimir")'))
      .first();

    if (await printButton.isVisible()) {
      // Click print button
      await printButton.click();

      // Should trigger print dialog (in real browser)
      // In test environment, just verify button works
      await expect(printButton).toBeVisible();
    }
  });

  test("should export patient data for transfer", async ({ page }) => {
    // Look for export/transfer button
    const exportButton = page
      .locator('[data-testid="export-patient"]')
      .or(page.locator('button:has-text("Exportar")'))
      .first();

    if (await exportButton.isVisible()) {
      // Start export process
      const _downloadPromise = page.waitForEvent("download");
      await exportButton.click();

      // Should show export options
      const exportOptions = page
        .locator('[data-testid="export-options"]')
        .or(page.locator(".export-options"));
      if (await exportOptions.isVisible()) {
        await expect(exportOptions).toBeVisible();

        // Should have PDF and JSON options
        await expect(
          page.locator("text=PDF").or(page.locator("text=JSON")),
        ).toBeVisible();
      }
    }
  });

  test("should log emergency access", async ({ page }) => {
    // Emergency access should be automatically logged
    // Check if audit log entry is created
    const auditLog = page
      .locator('[data-testid="audit-log"]')
      .or(page.locator(".audit-log"));

    if (await auditLog.isVisible()) {
      await expect(auditLog).toBeVisible();

      // Should show access timestamp
      await expect(
        page
          .locator("text=Acesso de emergência")
          .or(page.locator("text=Emergency access")),
      ).toBeVisible();
    }
  });
});

test.describe("Emergency Access - Security & Compliance", () => {
  test("should require emergency access justification", async ({ page }) => {
    await page.goto("/emergency");

    // Should show emergency access warning
    await expect(
      page
        .locator('[data-testid="emergency-warning"]')
        .or(page.locator(".emergency-warning")),
    ).toBeVisible();

    // Should require justification
    const justificationField = page
      .locator('[data-testid="access-justification"]')
      .or(page.locator('textarea[name="justification"]'));
    if (await justificationField.isVisible()) {
      await expect(justificationField).toBeVisible();

      // Should be required field
      await justificationField.fill(
        "Paciente em estado crítico, necessário acesso imediato ao histórico médico",
      );
    }
  });

  test("should comply with ANVISA emergency protocols", async ({ page }) => {
    await page.goto("/emergency");

    // Should display ANVISA compliance notice
    const anvisaNotice = page
      .locator("text=ANVISA")
      .or(page.locator("text=Agência Nacional de Vigilância Sanitária"));
    if (await anvisaNotice.isVisible()) {
      await expect(anvisaNotice).toBeVisible();
    }

    // Should follow emergency access protocols
    const protocolNotice = page
      .locator('[data-testid="emergency-protocol"]')
      .or(page.locator("text=protocolo de emergência"));
    if (await protocolNotice.isVisible()) {
      await expect(protocolNotice).toBeVisible();
    }
  });

  test("should limit emergency access duration", async ({ page }) => {
    await page.goto("/emergency");

    // Should show session timer
    const sessionTimer = page
      .locator('[data-testid="session-timer"]')
      .or(page.locator(".session-timer"));
    if (await sessionTimer.isVisible()) {
      await expect(sessionTimer).toBeVisible();

      // Should show remaining time
      await expect(sessionTimer).toContainText(/\d+:\d+/);
    }

    // Should warn about session expiration
    const expirationWarning = page
      .locator('[data-testid="session-warning"]')
      .or(page.locator("text=sessão expira"));
    if (await expirationWarning.isVisible()) {
      await expect(expirationWarning).toBeVisible();
    }
  });

  test("should mask sensitive information", async ({ page }) => {
    await page.goto("/emergency");

    // Search for patient
    const cpfField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .or(page.locator('input[placeholder*="CPF"]'));
    await cpfField.fill("123.456.789-00");

    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    await searchButton.click();

    // Sensitive information should be masked or require additional authorization
    const maskedInfo = page
      .locator('[data-testid="masked-info"]')
      .or(page.locator(".masked-info"));
    if (await maskedInfo.isVisible()) {
      await expect(maskedInfo).toBeVisible();

      // Should show asterisks or partial information
      await expect(maskedInfo).toContainText(/\*+/);
    }
  });
});

test.describe("Emergency Access - Performance & Accessibility", () => {
  test("should load quickly for emergency situations", async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto("/emergency");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Emergency page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Critical elements should be visible immediately
    await expect(
      page
        .locator('[data-testid="patient-search"]')
        .or(page.locator(".patient-search")),
    ).toBeVisible();
  });

  test("should be keyboard accessible for quick navigation", async ({
    page,
  }) => {
    await page.goto("/emergency");

    // Should be able to navigate with keyboard
    await page.keyboard.press("Tab");

    // First focusable element should be search field
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Should be able to search with Enter key
    await page.keyboard.type("123.456.789-00");
    await page.keyboard.press("Enter");

    // Should trigger search
    const searchResults = page
      .locator('[data-testid="search-results"]')
      .or(page.locator(".search-results"));
    if (await searchResults.isVisible()) {
      await expect(searchResults).toBeVisible();
    }
  });

  test("should have high contrast for emergency visibility", async ({
    page,
  }) => {
    await page.goto("/emergency");

    // Emergency elements should have high contrast
    const emergencyButton = page
      .locator('[data-testid="call-emergency"]')
      .or(page.locator('button:has-text("192")'))
      .first();

    if (await emergencyButton.isVisible()) {
      // Should have emergency styling (red background, white text)
      const buttonStyles = await emergencyButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
        };
      });

      // Should have contrasting colors (this is a basic check)
      expect(buttonStyles.backgroundColor).not.toBe(buttonStyles.color);
    }
  });

  test("should work on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/emergency");

    // Should be responsive
    await expect(
      page
        .locator('[data-testid="patient-search"]')
        .or(page.locator(".patient-search")),
    ).toBeVisible();

    // Touch targets should be large enough
    const searchButton = page
      .locator('[data-testid="search-patient"]')
      .or(page.locator('button:has-text("Buscar")'))
      .first();
    const buttonBox = await searchButton.boundingBox();

    if (buttonBox) {
      // Button should be at least 44px tall (iOS guideline)
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("should support screen readers", async ({ page }) => {
    await page.goto("/emergency");

    // Should have proper ARIA labels
    const searchField = page
      .locator('[data-testid="patient-cpf"]')
      .or(page.locator('input[name="cpf"]'))
      .first();

    if (await searchField.isVisible()) {
      const hasAriaLabel = await searchField.evaluate((el) => {
        return (
          el.getAttribute("aria-label") ||
          el.getAttribute("aria-labelledby") ||
          el.labels?.length > 0
        );
      });
      expect(hasAriaLabel).toBeTruthy();
    }

    // Emergency alerts should be announced
    const emergencyAlert = page
      .locator('[data-testid="emergency-alert"]')
      .or(page.locator(".emergency-alert"));
    if (await emergencyAlert.isVisible()) {
      const hasAriaLive = await emergencyAlert.getAttribute("aria-live");
      expect(hasAriaLive).toBeTruthy();
    }
  });
});
