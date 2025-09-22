import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@playwright/test';
import crypto from 'crypto';

describe('AI Chat Interface E2E Tests', () => {
  let authToken: string;
  let sessionId: string;

  beforeAll(async () => {
    // Generate test session ID
    sessionId = crypto.randomUUID();
    
    // Get authentication token (this would normally come from your auth system)
    // For testing, we'll use a mock token
    authToken = 'mock-jwt-token-for-testing';
  });

  afterAll(async () => {
    // Cleanup any test data if needed
  });

  beforeEach(async () => {
    // Reset test state before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('Chat Interface Loading', () => {
    test('should load chat interface successfully', async ({ page }) => {
      await page.goto('/');

      // Wait for chat interface to load
      await page.waitForSelector('[data-testid="ai-chat-interface"]', { timeout: 10000 });
      
      // Verify chat interface is visible
      const chatInterface = await page.locator('[data-testid="ai-chat-interface"]');
      await expect(chatInterface).toBeVisible();
      
      // Verify chat input is present
      const chatInput = await page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toBeVisible();
      
      // Verify send button is present
      const sendButton = await page.locator('[data-testid="send-button"]');
      await expect(sendButton).toBeVisible();
    });

    test('should display welcome message', async ({ page }) => {
      await page.goto('/');

      // Wait for welcome message
      await page.waitForSelector('[data-testid="welcome-message"]', { timeout: 10000 });
      
      const welcomeMessage = await page.locator('[data-testid="welcome-message"]');
      await expect(welcomeMessage).toBeVisible();
      
      // Verify welcome message content
      const messageText = await welcomeMessage.textContent();
      expect(messageText).toContain('Olá');
      expect(messageText).toContain('assistente virtual');
    });

    test('should be mobile responsive', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Verify chat interface adapts to mobile
      const chatInterface = await page.locator('[data-testid="ai-chat-interface"]');
      await expect(chatInterface).toBeVisible();
      
      // Verify mobile-specific elements
      const mobileMenu = await page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      // Verify chat interface adapts to tablet
      await expect(chatInterface).toBeVisible();
    });
  });

  describe('Chat Functionality', () => {
    test('should send and receive messages', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Type a message
      const testMessage = 'Olá, como você está?';
      await page.fill('[data-testid="chat-input"]', testMessage);
      
      // Send message
      await page.click('[data-testid="send-button"]');
      
      // Wait for message to appear in chat
      await page.waitForSelector(`[data-testid="user-message"]:text-is("${testMessage}")`, { timeout: 10000 });
      
      // Verify user message is displayed
      const userMessage = await page.locator(`[data-testid="user-message"]:text-is("${testMessage}")`);
      await expect(userMessage).toBeVisible();
      
      // Wait for bot response
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 15000 });
      
      // Verify bot response is displayed
      const botMessage = await page.locator('[data-testid="bot-message"]');
      await expect(botMessage).toBeVisible();
      
      // Verify bot response contains expected content
      const botResponseText = await botMessage.textContent();
      expect(botResponseText).not.toBe('');
    });

    test('should handle multiple messages in conversation', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      const messages = [
        'Mostrar clientes',
        'Agendamentos para amanhã',
        'Como está o faturamento?',
      ];

      for (const message of messages) {
        // Send message
        await page.fill('[data-testid="chat-input"]', message);
        await page.click('[data-testid="send-button"]');
        
        // Wait for response
        await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
        
        // Verify message was sent
        const userMessage = await page.locator(`[data-testid="user-message"]:text-is("${message}")`);
        await expect(userMessage).toBeVisible();
      }

      // Verify conversation history is maintained
      const allUserMessages = await page.locator('[data-testid="user-message"]').count();
      const allBotMessages = await page.locator('[data-testid="bot-message"]').count();
      
      expect(allUserMessages).toBe(messages.length);
      expect(allBotMessages).toBe(messages.length);
    });

    test('should handle empty messages', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Try to send empty message
      await page.fill('[data-testid="chat-input"]', '');
      await page.click('[data-testid="send-button"]');
      
      // Verify error message is shown
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
      const errorMessage = await page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('vazia');
    });

    test('should display typing indicator while waiting for response', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send message
      await page.fill('[data-testid="chat-input"]', 'Listar todos os clientes');
      await page.click('[data-testid="send-button"]');
      
      // Check for typing indicator (should appear briefly)
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible({ timeout: 5000 });
      
      // Wait for response
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 15000 });
      
      // Verify typing indicator is hidden after response
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeHidden();
    });
  });

  describe('Data Query Tests', () => {
    test('should query client data successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Query client data
      await page.fill('[data-testid="chat-input"]', 'mostrar clientes João Silva');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Verify response contains table format
      const responseTable = await page.locator('[data-testid="response-table"]');
      await expect(responseTable).toBeVisible();
      
      // Verify table headers
      const tableHeaders = await responseTable.locator('th').allTextContents();
      expect(tableHeaders).toContain('Nome');
      expect(tableHeaders).toContain('Email');
    });

    test('should query appointment data successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Query appointment data
      await page.fill('[data-testid="chat-input"]', 'agendamentos para amanhã');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Verify response contains list format
      const responseList = await page.locator('[data-testid="response-list"]');
      await expect(responseList).toBeVisible();
    });

    test('should query financial data successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Query financial data
      await page.fill('[data-testid="chat-input"]', 'como está o faturamento?');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Verify response contains chart format
      const responseChart = await page.locator('[data-testid="response-chart"]');
      await expect(responseChart).toBeVisible();
    });

    test('should handle no results scenarios gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Query with specific criteria that should return no results
      await page.fill('[data-testid="chat-input"]', 'cliente XYZ que não existe');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Verify "no results" message
      const responseText = await page.locator('[data-testid="bot-message"]:last-child').textContent();
      expect(responseText).toContain('Nenhum Cliente Encontrado');
    });
  });

  describe('Interactive Elements', () => {
    test('should handle action buttons in responses', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send message that should trigger action buttons
      await page.fill('[data-testid="chat-input"]', 'mostrar clientes');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response with action buttons
      await page.waitForSelector('[data-testid="action-button"]', { timeout: 15000 });
      
      // Click action button
      await page.click('[data-testid="action-button"]:first-child');
      
      // Verify action triggers new request/response cycle
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Verify new response is displayed
      const responses = await page.locator('[data-testid="bot-message"]').count();
      expect(responses).toBeGreaterThan(1);
    });

    test('should handle expandable content sections', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send message that should return expandable content
      await page.fill('[data-testid="chat-input"]', 'listar todos os clientes');
      await page.click('[data-testid="send-button"]');
      
      // Wait for response with expandable sections
      await page.waitForSelector('[data-testid="expandable-section"]', { timeout: 15000 });
      
      // Click expand button
      await page.click('[data-testid="expand-button"]:first-child');
      
      // Verify content expands
      const expandedContent = await page.locator('[data-testid="expanded-content"]:first-child');
      await expect(expandedContent).toBeVisible();
      
      // Click collapse button
      await page.click('[data-testid="collapse-button"]:first-child');
      
      // Verify content collapses
      await expect(expandedContent).toBeHidden();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network error by intercepting requests
      await page.route('**/api/ai/data-agent', async route => {
        await route.abort('failed');
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Try to send message
      await page.fill('[data-testid="chat-input"]', 'test message');
      await page.click('[data-testid="send-button"]');
      
      // Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      
      // Verify error message
      const errorMessage = await page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('conexão');
      expect(errorText).toContain('tente novamente');

      // Restore normal routing
      await page.unroute('**/api/ai/data-agent');
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/ai/data-agent', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal server error'
          })
        });
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Try to send message
      await page.fill('[data-testid="chat-input"]', 'test message');
      await page.click('[data-testid="send-button"]');
      
      // Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      
      // Verify error message
      const errorMessage = await page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();

      // Restore normal routing
      await page.unroute('**/api/ai/data-agent');
    });

    test('should handle timeout errors gracefully', async ({ page }) => {
      // Simulate timeout
      await page.route('**/api/ai/data-agent', async route => {
        // Delay response significantly
        await new Promise(resolve => setTimeout(resolve, 10000));
        await route.continue();
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Try to send message
      await page.fill('[data-testid="chat-input"]', 'test message');
      await page.click('[data-testid="send-button"]');
      
      // Wait for timeout error message
      await page.waitForSelector('[data-testid="timeout-message"]', { timeout: 15000 });
      
      // Verify timeout message
      const timeoutMessage = await page.locator('[data-testid="timeout-message"]');
      await expect(timeoutMessage).toBeVisible();

      // Restore normal routing
      await page.unroute('**/api/ai/data-agent');
    });
  });

  describe('Accessibility Tests', () => {
    test('should meet WCAG 2.1 AA accessibility standards', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper ARIA labels
      const chatInput = await page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toHaveAttribute('aria-label');
      
      const sendButton = await page.locator('[data-testid="send-button"]');
      await expect(sendButton).toHaveAttribute('aria-label');
      
      // Check for keyboard navigation
      await page.keyboard.press('Tab');
      await expect(chatInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(sendButton).toBeFocused();
      
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      expect(headings).toBeGreaterThan(0);
      
      // Check for color contrast (basic check)
      const welcomeMessage = await page.locator('[data-testid="welcome-message"]');
      const backgroundColor = await welcomeMessage.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const textColor = await welcomeMessage.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      expect(backgroundColor).not.toBe('transparent');
      expect(textColor).not.toBe('transparent');
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper screen reader announcements
      const liveRegion = await page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Check for proper role attributes
      const chatInterface = await page.locator('[data-testid="ai-chat-interface"]');
      await expect(chatInterface).toHaveAttribute('role', 'application');
      
      // Check for proper landmark roles
      const mainContent = await page.locator('main');
      await expect(mainContent).toBeVisible();
      
      const navigation = await page.locator('nav');
      await expect(navigation).toBeVisible();
    });
  });

  describe('Performance Tests', () => {
    test('should load chat interface within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="ai-chat-interface"]', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test('should handle messages within response time budget', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send message and measure response time
      await page.fill('[data-testid="chat-input"]', 'Olá');
      await page.click('[data-testid="send-button"]');
      
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // Should respond in under 2 seconds
    });

    test('should handle concurrent user interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send multiple messages rapidly
      const messages = ['teste 1', 'teste 2', 'teste 3'];
      const sendPromises = messages.map(async (message) => {
        await page.fill('[data-testid="chat-input"]', message);
        await page.click('[data-testid="send-button']);
      });

      await Promise.all(sendPromises);
      
      // Wait for all responses
      await page.waitForSelector('[data-testid="bot-message"]:nth-child(' + messages.length + ')', { timeout: 20000 });
      
      // Verify all messages were processed
      const allUserMessages = await page.locator('[data-testid="user-message"]').count();
      expect(allUserMessages).toBe(messages.length);
    });
  });

  describe('Security Tests', () => {
    test('should use HTTPS for all communications', async ({ page }) => {
      await page.goto('/');
      
      // Verify URL uses HTTPS
      expect(page.url()).toMatch(/^https:/);
      
      // Verify all API requests use HTTPS
      await page.route('**', route => {
        const url = route.request().url();
        expect(url).toMatch(/^https:/);
        route.continue();
      });
    });

    test('should not expose sensitive information in responses', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Send various messages
      await page.fill('[data-testid="chat-input"]', 'mostrar dados sensíveis');
      await page.click('[data-testid="send-button"]');
      
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      // Check that response doesn't contain sensitive patterns
      const responseText = await page.locator('[data-testid="bot-message"]:last-child').textContent();
      
      // Should not contain passwords, tokens, or other sensitive data
      expect(responseText).not.toMatch(/password|token|key|secret/);
      expect(responseText).not.toMatch(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/); // Email pattern
    });

    test('should validate user input for security', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Try to send potentially malicious input
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        'SELECT * FROM users',
      ];

      for (const input of maliciousInputs) {
        await page.fill('[data-testid="chat-input"]', input);
        await page.click('[data-testid="send-button"]');
        
        await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
        
        // Verify malicious content is not rendered
        const responseText = await page.locator('[data-testid="bot-message"]:last-child').textContent();
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('javascript:');
      }
    });
  });

  describe('LGPD Compliance Tests', () => {
    test('should include privacy notice', async ({ page }) => {
      await page.goto('/');
      
      // Check for privacy notice
      const privacyNotice = await page.locator('[data-testid="privacy-notice"]');
      await expect(privacyNotice).toBeVisible();
      
      const privacyText = await privacyNotice.textContent();
      expect(privacyText).toContain('LGPD');
      expect(privacyText).toContain('dados');
      expect(privacyText).toContain('privacidade');
    });

    test('should provide data access controls', async ({ page }) => {
      await page.goto('/');
      
      // Check for data access control elements
      const accessControls = await page.locator('[data-testid="access-controls"]');
      await expect(accessControls).toBeVisible();
      
      // Verify data deletion option is available
      const deleteDataButton = await page.locator('[data-testid="delete-data-button"]');
      await expect(deleteDataButton).toBeVisible();
    });

    test('should log data access for audit purposes', async ({ page }) => {
      // This would typically be verified server-side, but we can check
      // that the client sends appropriate headers
      await page.goto('/');
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });

      // Intercept request to verify audit logging headers
      await page.route('**/api/ai/data-agent', async route => {
        const request = route.request();
        const headers = request.headers();
        
        // Verify audit headers are present
        expect(headers['x-audit-session-id']).toBeDefined();
        expect(headers['x-audit-user-id']).toBeDefined();
        expect(headers['x-audit-timestamp']).toBeDefined();
        
        await route.continue();
      });

      await page.fill('[data-testid="chat-input"]', 'teste de auditoria');
      await page.click('[data-testid="send-button"]');
      
      await page.waitForSelector('[data-testid="bot-message"]:last-child', { timeout: 15000 });
      
      await page.unroute('**/api/ai/data-agent');
    });
  });
});