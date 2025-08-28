/**
 * Base Page Object Model
 * Provides common functionality for all page objects
 */

import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || "http://localhost:3000";
  }

  // Navigation methods
  async goto(path: string = "/") {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  async goForward() {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  // Wait methods
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForElement(selector: string, timeout: number = 10_000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToBeVisible(locator: Locator, timeout: number = 10_000) {
    await locator.waitFor({ state: "visible", timeout });
  }

  async waitForElementToBeHidden(locator: Locator, timeout: number = 10_000) {
    await locator.waitFor({ state: "hidden", timeout });
  }

  async waitForUrl(url: string | RegExp, timeout: number = 10_000) {
    await this.page.waitForURL(url, { timeout });
  }

  // Interaction methods
  async clickElement(locator: Locator) {
    await this.waitForElementToBeVisible(locator);
    await locator.click();
  }

  async fillInput(locator: Locator, value: string) {
    await this.waitForElementToBeVisible(locator);
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string) {
    await this.waitForElementToBeVisible(locator);
    await locator.selectOption(value);
  }

  async uploadFile(locator: Locator, filePath: string) {
    await this.waitForElementToBeVisible(locator);
    await locator.setInputFiles(filePath);
  }

  // Assertion methods
  async expectElementToBeVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async expectElementToBeHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  async expectElementToContainText(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  async expectElementToHaveValue(locator: Locator, value: string) {
    await expect(locator).toHaveValue(value);
  }

  async expectPageToHaveTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }

  async expectPageToHaveUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  // Utility methods
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElementToBeVisible(locator);
    return await locator.textContent() || "";
  }

  async getElementValue(locator: Locator): Promise<string> {
    await this.waitForElementToBeVisible(locator);
    return await locator.inputValue();
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async takeScreenshot(name?: string) {
    const screenshotName = name || `screenshot-${Date.now()}.png`;
    await this.page.screenshot({ path: `test-results/screenshots/${screenshotName}` });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async typeText(text: string) {
    await this.page.keyboard.type(text);
  }

  // Common UI patterns
  async closeModal() {
    const modalCloseButton = this.page.locator('[data-testid="modal-close"], .modal-close, [aria-label="Close"]');
    if (await this.isElementVisible(modalCloseButton)) {
      await this.clickElement(modalCloseButton);
    }
  }

  async acceptAlert() {
    this.page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
  }

  async dismissAlert() {
    this.page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });
  }

  // Loading states
  async waitForLoadingToFinish() {
    const loadingIndicator = this.page.locator('[data-testid="loading"], .loading, .spinner');
    try {
      await loadingIndicator.waitFor({ state: "visible", timeout: 1000 });
      await loadingIndicator.waitFor({ state: "hidden", timeout: 30_000 });
    } catch {
      // Loading indicator might not be present
    }
  }

  // Form helpers
  async submitForm(formSelector: string = "form") {
    const form = this.page.locator(formSelector);
    await form.press("Enter");
  }

  async resetForm(formSelector: string = "form") {
    const resetButton = this.page.locator(`${formSelector} [type="reset"]`);
    if (await this.isElementVisible(resetButton)) {
      await this.clickElement(resetButton);
    }
  }

  // Abstract methods that must be implemented by child classes
  abstract isLoaded(): Promise<boolean>;
  abstract getPageTitle(): Promise<string>;
}