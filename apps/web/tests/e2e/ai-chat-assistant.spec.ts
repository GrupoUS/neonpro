import { test, expect } from "@playwright/test";

/**
 * AI Chat Assistant E2E Tests
 * Tests healthcare AI chat functionality, medical queries, and HIPAA compliance
 */

test.describe("AI Chat Assistant", () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto("/professional/login");
    await page.fill('[data-testid="professional-crm"]', "CRM12345SP");
    await page.fill(
      '[data-testid="professional-password"]',
      "MedicalPassword123!",
    );
    await page.click('[data-testid="submit-professional-login"]');
    await expect(page).toHaveURL(/.*\/professional\/dashboard/);
  });

  test("should handle medical query consultation", async ({ page }) => {
    // Open AI chat assistant
    await page.click('[data-testid="ai-chat-assistant"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Send medical query
    const medicalQuery =
      "What are the contraindications for botulinum toxin in aesthetic procedures?";
    await page.fill('[data-testid="chat-input"]', medicalQuery);
    await page.click('[data-testid="send-message"]');

    // Verify AI response
    await expect(
      page.locator('[data-testid="ai-response"]').first(),
    ).toBeVisible({ timeout: 15000 });

    // Verify medical accuracy disclaimer
    await expect(
      page.locator('[data-testid="medical-disclaimer"]'),
    ).toBeVisible();

    // Verify constitutional compliance notice
    await expect(
      page.locator('[data-testid="constitutional-compliance-notice"]'),
    ).toBeVisible();
  });

  test("should provide treatment recommendations with safety protocols", async ({
    page,
  }) => {
    await page.click('[data-testid="ai-chat-assistant"]');

    // Query for treatment recommendations
    const treatmentQuery =
      "Recommend treatment protocol for facial harmonization in 35-year-old patient";
    await page.fill('[data-testid="chat-input"]', treatmentQuery);
    await page.click('[data-testid="send-message"]');

    // Verify comprehensive response
    await expect(
      page.locator('[data-testid="ai-response"]').first(),
    ).toBeVisible({ timeout: 15000 });

    // Verify safety protocols are included
    await expect(
      page.locator('[data-testid="safety-protocols"]'),
    ).toBeVisible();

    // Verify ANVISA compliance references
    await expect(
      page.locator('[data-testid="anvisa-compliance"]'),
    ).toBeVisible();

    // Verify patient assessment requirements
    await expect(
      page.locator('[data-testid="patient-assessment-required"]'),
    ).toBeVisible();
  });

  test("should handle emergency medical queries with priority escalation", async ({
    page,
  }) => {
    await page.click('[data-testid="ai-chat-assistant"]');

    // Emergency scenario query
    const emergencyQuery =
      "Patient experiencing severe allergic reaction after dermal filler injection";
    await page.fill('[data-testid="chat-input"]', emergencyQuery);
    await page.click('[data-testid="send-message"]');

    // Verify emergency response protocol
    await expect(page.locator('[data-testid="emergency-alert"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('[data-testid="emergency-protocol"]'),
    ).toBeVisible();

    // Verify emergency contact information
    await expect(
      page.locator('[data-testid="emergency-contacts"]'),
    ).toBeVisible();

    // Verify immediate action steps
    await expect(
      page.locator('[data-testid="immediate-actions"]'),
    ).toBeVisible();
  });

  test("should maintain conversation context and medical history integration", async ({
    page,
  }) => {
    await page.click('[data-testid="ai-chat-assistant"]');

    // First query about patient
    await page.fill(
      '[data-testid="chat-input"]',
      "Patient ID 12345 - review medical history",
    );
    await page.click('[data-testid="send-message"]');
    await expect(
      page.locator('[data-testid="ai-response"]').first(),
    ).toBeVisible({ timeout: 15000 });

    // Follow-up query referencing previous context
    await page.fill(
      '[data-testid="chat-input"]',
      "What are the risks for this patient based on their history?",
    );
    await page.click('[data-testid="send-message"]');

    // Verify context-aware response
    await expect(
      page.locator('[data-testid="ai-response"]').nth(1),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('[data-testid="patient-context-maintained"]'),
    ).toBeVisible();
  });

  test("should respect HIPAA compliance and data privacy", async ({ page }) => {
    await page.click('[data-testid="ai-chat-assistant"]');

    // Attempt to query sensitive patient information
    await page.fill(
      '[data-testid="chat-input"]',
      "Show me all patients with depression treatments",
    );
    await page.click('[data-testid="send-message"]');

    // Verify privacy protection
    await expect(
      page.locator('[data-testid="privacy-protection-notice"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="hipaa-compliance-warning"]'),
    ).toBeVisible();

    // Verify no unauthorized data exposure
    await expect(
      page.locator('[data-testid="unauthorized-data-blocked"]'),
    ).toBeVisible();
  });

  test("should provide drug interaction and dosage guidance", async ({
    page,
  }) => {
    await page.click('[data-testid="ai-chat-assistant"]');

    // Drug interaction query
    await page.fill(
      '[data-testid="chat-input"]',
      "Check interactions between botulinum toxin and patient medications",
    );
    await page.click('[data-testid="send-message"]');

    // Verify comprehensive drug analysis
    await expect(
      page.locator('[data-testid="drug-interaction-analysis"]'),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('[data-testid="dosage-recommendations"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="contraindication-warnings"]'),
    ).toBeVisible();
  });
});
