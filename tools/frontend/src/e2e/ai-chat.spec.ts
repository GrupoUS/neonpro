// E2E Tests for AI Chat - NeonPro Aesthetic Clinic
import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:5173";

test.describe("AI Chat E2E - NeonPro Aesthetic Clinic", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("complete AI chat workflow for aesthetic treatments", async ({
    page,
  }) => {
    // Navigate to AI chat (assuming it's integrated into a page)
    await page.waitForLoadState("networkidle");

    // Look for AI chat interface
    await expect(page.getByText("Assistente NeonPro")).toBeVisible();
    await expect(page.getByText(/como posso ajudar hoje/i)).toBeVisible();

    // Test search input
    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("Quero saber sobre botox");
    await searchInput.press("Enter");

    // Wait for AI response
    await page.waitForSelector(".animate-pulse", {
      state: "hidden",
      timeout: 10000,
    });

    // Verify AI response appears
    await expect(page.getByText(/tratamentos estéticos/i)).toBeVisible();

    // Test message persistence
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should maintain chat history
    await expect(page.getByText("Quero saber sobre botox")).toBeVisible();
  });

  test("search suggestions for aesthetic treatments", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("bot");

    // Wait for suggestions to appear
    await expect(page.getByText(/botox/i)).toBeVisible();
    await expect(page.getByText(/preenchimento/i)).toBeVisible();

    // Click on a suggestion
    await page.getByText(/botox/i).first().click();

    // Should populate the input
    await expect(searchInput).toHaveValue(/botox/i);
  });

  test("voice controls accessibility", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for voice control buttons
    const micButton = page.getByLabel(/iniciar gravação de voz/i);
    const speakerButton = page.getByLabel(/reproduzir resposta/i);

    await expect(micButton).toBeVisible();
    await expect(speakerButton).toBeVisible();

    // Test keyboard navigation
    await micButton.focus();
    await expect(micButton).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(speakerButton).toBeFocused();
  });

  test("LGPD compliance and privacy notices", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for LGPD compliance notice
    await expect(
      page.getByText(/respeitamos sua privacidade \(lgpd\)/i),
    ).toBeVisible();

    // Test data input with PII
    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("Meu CPF é 123.456.789-00 e quero agendar");
    await searchInput.press("Enter");

    // Should handle PII appropriately (not expose in logs)
    await page.waitForTimeout(1000);
    await expect(page.getByText(/123\.456\.789-00/)).not.toBeVisible();
  });

  test("error handling and fallback providers", async ({ page }) => {
    // Mock API failure
    await page.route("**/api/v1/ai-chat/stream", async (route) => {
      await route.abort("failed");
    });

    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("Test error handling");
    await searchInput.press("Enter");

    // Should show error message
    await expect(page.getByText(/erro/i)).toBeVisible();
  });

  test("mobile responsiveness for clinic tablets", async ({ page }) => {
    // Test tablet viewport (common in clinics)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState("networkidle");

    // Check that interface adapts properly
    await expect(page.getByText("Assistente NeonPro")).toBeVisible();

    // Test touch interactions
    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.tap();
    await expect(searchInput).toBeFocused();

    // Test voice controls sizing for touch
    const micButton = page.getByLabel(/iniciar gravação de voz/i);
    const boundingBox = await micButton.boundingBox();

    // Should have adequate touch target size (44px minimum)
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
  });

  test("performance and loading states", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("Performance test query");

    // Start timing
    const startTime = Date.now();
    await searchInput.press("Enter");

    // Should show loading state immediately
    await expect(page.getByText(/pensando/i)).toBeVisible();

    // Wait for response
    await page.waitForSelector(".animate-pulse", {
      state: "hidden",
      timeout: 10000,
    });
    const endTime = Date.now();

    // Should respond within reasonable time (5 seconds)
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test("clear chat functionality", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Send a message first
    const searchInput = page.getByPlaceholder(
      /digite sua pergunta sobre tratamentos/i,
    );
    await searchInput.fill("Test message");
    await searchInput.press("Enter");

    // Wait for message to appear
    await expect(page.getByText("Test message")).toBeVisible();

    // Clear chat
    await page.getByText(/limpar conversa/i).click();

    // Should return to empty state
    await expect(page.getByText(/como posso ajudar hoje/i)).toBeVisible();
    await expect(page.getByText("Test message")).not.toBeVisible();
  });
});
