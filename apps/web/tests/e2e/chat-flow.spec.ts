// T049: E2E tests for complete chat flow with Playwright
import { expect, type Page, test } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000';

// Helper function to wait for chat response
async function waitForChatResponse(page: Page, timeout = 5000) {
  await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout });
}

// Helper function to simulate typing with realistic delays
async function typeMessage(page: Page, selector: string, message: string) {
  await page.click(selector);
  await page.type(selector, message, { delay: 50 });
}

test.describe('AI Chat E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat interface
    await page.goto(`${BASE_URL}/chat`);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display chat interface correctly', async ({ page }) => {
    // Check that main chat components are present
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible();

    // Check initial state
    await expect(page.locator('[data-testid="chat-messages"]')).toBeEmpty();
    await expect(page.locator('[data-testid="chat-input"]')).toHaveAttribute('placeholder');
  });

  test('should handle consent flow correctly', async ({ page }) => {
    // Start typing a message
    await typeMessage(page, '[data-testid="chat-input"]', 'Hello, I need medical help');

    // Try to send without consent - should show consent prompt
    await page.click('[data-testid="chat-send-button"]');

    // Consent modal should appear
    await expect(page.locator('[data-testid="consent-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="consent-data-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="consent-ai-interaction"]')).toBeVisible();

    // Check consent checkboxes
    await page.check('[data-testid="consent-data-processing"]');
    await page.check('[data-testid="consent-ai-interaction"]');

    // Confirm consent
    await page.click('[data-testid="consent-confirm-button"]');

    // Consent modal should disappear
    await expect(page.locator('[data-testid="consent-modal"]')).not.toBeVisible();

    // Message should be sent automatically after consent
    await waitForChatResponse(page);

    // Verify message was sent and response received
    await expect(page.locator('[data-testid="chat-message-user"]')).toContainText(
      'Hello, I need medical help',
    );
    await expect(page.locator('[data-testid="chat-message-assistant"]')).toBeVisible();
  });

  test('should complete full chat conversation flow', async ({ page }) => {
    // Skip consent by setting it in localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const conversation = [
      'Olá, gostaria de agendar uma consulta',
      'Tenho sentido dores de cabeça frequentes',
      'As dores começaram há cerca de uma semana',
      'Obrigado pela ajuda',
    ];

    for (const [index, message] of conversation.entries()) {
      // Type and send message
      await typeMessage(page, '[data-testid="chat-input"]', message);
      await page.click('[data-testid="chat-send-button"]');

      // Verify user message appears
      await expect(
        page.locator(`[data-testid="chat-message-user"]:nth-child(${(index + 1) * 2 - 1})`),
      )
        .toContainText(message);

      // Wait for and verify assistant response
      await waitForChatResponse(page);
      await expect(
        page.locator(`[data-testid="chat-message-assistant"]:nth-child(${(index + 1) * 2})`),
      )
        .toBeVisible();

      // Clear input for next message
      await page.fill('[data-testid="chat-input"]', '');
    }

    // Verify conversation history
    const userMessages = await page.locator('[data-testid="chat-message-user"]').count();
    const assistantMessages = await page.locator('[data-testid="chat-message-assistant"]').count();

    expect(userMessages).toBe(conversation.length);
    expect(assistantMessages).toBe(conversation.length);
  });

  test('should handle streaming responses correctly', async ({ page }) => {
    // Set consent
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Send a message that should trigger streaming
    await typeMessage(
      page,
      '[data-testid="chat-input"]',
      'Explain hypertension treatment in detail',
    );
    await page.click('[data-testid="chat-send-button"]');

    // Wait for streaming indicator
    await expect(page.locator('[data-testid="chat-streaming-indicator"]')).toBeVisible();

    // Wait for response to start streaming
    await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout: 10000 });

    // Monitor streaming progress
    let previousLength = 0;
    let streamingDetected = false;

    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(100);
      const currentText = await page.locator('[data-testid="chat-message-assistant"]:last-child')
        .textContent();
      const currentLength = currentText?.length || 0;

      if (currentLength > previousLength) {
        streamingDetected = true;
        previousLength = currentLength;
      }
    }

    expect(streamingDetected).toBe(true);

    // Wait for streaming to complete
    await expect(page.locator('[data-testid="chat-streaming-indicator"]')).not.toBeVisible({
      timeout: 15000,
    });

    // Verify final response
    const finalResponse = await page.locator('[data-testid="chat-message-assistant"]:last-child')
      .textContent();
    expect(finalResponse).toBeTruthy();
    expect(finalResponse!.length).toBeGreaterThan(50); // Should be a substantial response
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Set consent
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Send multiple messages rapidly to trigger rate limiting
    const rapidMessages = Array.from({ length: 12 }, (_, i) => `Rapid message ${i + 1}`);

    for (const message of rapidMessages) {
      await page.fill('[data-testid="chat-input"]', message);
      await page.click('[data-testid="chat-send-button"]');
      await page.waitForTimeout(50); // Very short delay
    }

    // Should show rate limit notification
    await expect(page.locator('[data-testid="rate-limit-notice"]')).toBeVisible({ timeout: 5000 });

    // Rate limit notice should contain helpful information
    const rateLimitText = await page.locator('[data-testid="rate-limit-notice"]').textContent();
    expect(rateLimitText).toContain('limite');
    expect(rateLimitText).toContain('minuto'); // Should mention time restriction

    // Send button should be disabled during rate limiting
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeDisabled();

    // Input should show rate limit state
    await expect(page.locator('[data-testid="chat-input"]')).toHaveAttribute('disabled');
  });

  test('should persist chat session across page reload', async ({ page }) => {
    // Set consent and start chat
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Send initial message
    await typeMessage(page, '[data-testid="chat-input"]', 'Test message for persistence');
    await page.click('[data-testid="chat-send-button"]');
    await waitForChatResponse(page);

    // Get session ID from UI or storage
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem('neonpro_chat_session_id');
    });

    expect(sessionId).toBeTruthy();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that session is restored
    const restoredSessionId = await page.evaluate(() => {
      return localStorage.getItem('neonpro_chat_session_id');
    });

    expect(restoredSessionId).toBe(sessionId);

    // Previous messages should be visible
    await expect(page.locator('[data-testid="chat-message-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-message-assistant"]')).toBeVisible();

    // Should be able to continue conversation
    await typeMessage(page, '[data-testid="chat-input"]', 'Continuation after reload');
    await page.click('[data-testid="chat-send-button"]');
    await waitForChatResponse(page);

    // Should have messages from before and after reload
    const userMessages = await page.locator('[data-testid="chat-message-user"]').count();
    expect(userMessages).toBe(2);
  });

  test('should handle accessibility requirements', async ({ page }) => {
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeFocused();

    // Check ARIA labels and roles
    await expect(page.locator('[data-testid="chat-container"]')).toHaveAttribute('role', 'main');
    await expect(page.locator('[data-testid="chat-messages"]')).toHaveAttribute('role', 'log');
    await expect(page.locator('[data-testid="chat-input"]')).toHaveAttribute('aria-label');

    // Check screen reader support
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toHaveAttribute('aria-describedby');

    // Test keyboard-only interaction
    await page.keyboard.press('Shift+Tab'); // Back to input
    await page.keyboard.type('Keyboard accessibility test');
    await page.keyboard.press('Enter');

    // Should trigger consent flow with keyboard navigation
    if (await page.locator('[data-testid="consent-modal"]').isVisible()) {
      await page.keyboard.press('Tab'); // First checkbox
      await page.keyboard.press('Space'); // Check it
      await page.keyboard.press('Tab'); // Second checkbox
      await page.keyboard.press('Space'); // Check it
      await page.keyboard.press('Tab'); // Confirm button
      await page.keyboard.press('Enter'); // Confirm
    }

    await waitForChatResponse(page);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Set consent
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Mock network error
    await page.route(`${API_BASE_URL}/api/v1/chat/query`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Send message that will fail
    await typeMessage(page, '[data-testid="chat-input"]', 'This will cause an error');
    await page.click('[data-testid="chat-send-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="chat-error-message"]')).toBeVisible({ timeout: 5000 });

    // Error message should be helpful
    const errorText = await page.locator('[data-testid="chat-error-message"]').textContent();
    expect(errorText).toContain('erro');

    // Should allow retry
    await expect(page.locator('[data-testid="chat-retry-button"]')).toBeVisible();

    // Remove network mock for retry
    await page.unroute(`${API_BASE_URL}/api/v1/chat/query`);

    // Click retry
    await page.click('[data-testid="chat-retry-button"]');

    // Should send message successfully
    await waitForChatResponse(page);
    await expect(page.locator('[data-testid="chat-error-message"]')).not.toBeVisible();
  });

  test('should handle mobile viewport correctly', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport manually if not running mobile tests
      await page.setViewportSize({ width: 375, height: 667 });
    }

    // Set consent
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check mobile-specific elements
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();

    // Chat should be responsive
    const chatContainer = page.locator('[data-testid="chat-container"]');
    const containerBox = await chatContainer.boundingBox();

    expect(containerBox!.width).toBeLessThanOrEqual(375);

    // Send message on mobile
    await typeMessage(page, '[data-testid="chat-input"]', 'Mobile test message');
    await page.click('[data-testid="chat-send-button"]');
    await waitForChatResponse(page);

    // Messages should be readable on mobile
    const userMessage = page.locator('[data-testid="chat-message-user"]');
    const messageBox = await userMessage.boundingBox();

    expect(messageBox!.width).toBeLessThan(350); // Should fit with padding

    // Virtual keyboard handling
    await page.locator('[data-testid="chat-input"]').focus();

    // Input should remain visible when focused
    await expect(page.locator('[data-testid="chat-input"]')).toBeInViewport();
  });

  test('should handle performance requirements', async ({ page }) => {
    // Set consent
    await page.evaluate(() => {
      localStorage.setItem(
        'neonpro_consent',
        JSON.stringify({
          dataProcessing: true,
          aiInteraction: true,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Measure response time
    const startTime = Date.now();

    await typeMessage(page, '[data-testid="chat-input"]', 'Performance test message');
    await page.click('[data-testid="chat-send-button"]');
    await waitForChatResponse(page);

    const responseTime = Date.now() - startTime;

    // Should meet constitutional requirement (<2s for user-facing response)
    expect(responseTime).toBeLessThan(2000);

    console.log(`E2E response time: ${responseTime}ms`);

    // UI should remain responsive during chat
    const inputField = page.locator('[data-testid="chat-input"]');
    await expect(inputField).toBeEnabled();

    // Should be able to type while processing
    await typeMessage(page, '[data-testid="chat-input"]', 'Quick follow-up');

    // Input should work immediately
    await expect(inputField).toHaveValue('Quick follow-up');
  });

  test('should support LGPD compliance features', async ({ page }) => {
    // Check data privacy notice
    await expect(page.locator('[data-testid="privacy-notice"]')).toBeVisible();

    // Consent flow should be LGPD compliant
    await typeMessage(page, '[data-testid="chat-input"]', 'LGPD compliance test');
    await page.click('[data-testid="chat-send-button"]');

    // Consent modal should appear with proper information
    await expect(page.locator('[data-testid="consent-modal"]')).toBeVisible();

    // Should have detailed consent information
    const consentText = await page.locator('[data-testid="consent-modal"]').textContent();
    expect(consentText).toContain('dados');
    expect(consentText).toContain('processamento');
    expect(consentText).toContain('LGPD');

    // Should have opt-out options
    await expect(page.locator('[data-testid="consent-decline-button"]')).toBeVisible();

    // Test declining consent
    await page.click('[data-testid="consent-decline-button"]');

    // Should not proceed with AI interaction
    await expect(page.locator('[data-testid="consent-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="chat-message-assistant"]')).not.toBeVisible();

    // Should show appropriate message
    await expect(page.locator('[data-testid="consent-required-message"]')).toBeVisible();
  });
});
