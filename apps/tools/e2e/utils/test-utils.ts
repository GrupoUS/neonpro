import { Page, expect } from "@playwright/test";

export class TestUtils {
  constructor(private page: Page) {}

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  async waitForToast(message: string, timeout = 5000) {
    await expect(this.page.locator('[role="alert"]')).toContainText(message, { timeout });
  }

  async clickAndWaitForNavigation(selector: string, url?: string) {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        url ? (res) => res.url().includes(url) : () => true,
        { timeout: 10000 }
      ),
      this.page.click(selector),
    ]);
    return response;
  }

  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid="${field}-input"]`, value);
    }
  }

  async selectOption(selectSelector: string, option: string) {
    await this.page.click(selectSelector);
    await this.page.click(`text=${option}`);
  }

  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
  }

  async waitForLoadingComplete(timeout = 10000) {
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout });
  }

  async checkAccessibility() {
    // Basic accessibility check
    const violations = await this.page.accessibility.snapshot();
    
    if (violations) {
      console.log("🔍 Accessibility violations found:", violations);
    }
    
    return violations;
  }

  async verifyElementVisible(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout });
  }

  async verifyElementHidden(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toBeHidden({ timeout });
  }

  async verifyTextContent(selector: string, text: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toContainText(text, { timeout });
  }

  async verifyElementDisabled(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toBeDisabled({ timeout });
  }

  async verifyElementEnabled(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector)).toBeEnabled({ timeout });
  }

  async waitForAPIResponse(endpoint: string, timeout = 10000) {
    const response = await this.page.waitForResponse(
      (res) => res.url().includes(endpoint),
      { timeout }
    );
    return response;
  }

  async getLocalStorageItem(key: string) {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string) {
    await this.page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [key, value]
    );
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async mockAPIResponse(endpoint: string, mockData: any) {
    await this.page.route(endpoint, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  async getPerformanceMetrics() {
    const metrics = await this.page.metrics();
    console.log("📊 Performance metrics:", metrics);
    return metrics;
  }

  async waitForStableNetwork(timeout = 2000) {
    await this.page.waitForTimeout(timeout);
  }
}

export const createTestUtils = (page: Page) => new TestUtils(page);