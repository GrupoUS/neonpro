/**
 * Login Page Object Model
 * Handles login page interactions and validations
 */

import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly signUpLink: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly loadingSpinner: Locator;
  private readonly showPasswordButton: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.emailInput = page.locator(
      '[data-testid="email-input"], input[type="email"], input[name="email"]',
    );
    this.passwordInput = page.locator(
      '[data-testid="password-input"], input[type="password"], input[name="password"]',
    );
    this.loginButton = page.locator(
      '[data-testid="login-button"], button[type="submit"], .login-button',
    );
    this.forgotPasswordLink = page.locator(
      '[data-testid="forgot-password-link"], a[href*="forgot"]',
    );
    this.signUpLink = page.locator(
      '[data-testid="signup-link"], a[href*="signup"], a[href*="register"]',
    );
    this.errorMessage = page.locator(
      '[data-testid="error-message"], .error-message, .alert-error',
    );
    this.successMessage = page.locator(
      '[data-testid="success-message"], .success-message, .alert-success',
    );
    this.loadingSpinner = page.locator(
      '[data-testid="loading"], .loading, .spinner',
    );
    this.showPasswordButton = page.locator(
      '[data-testid="show-password"], .show-password',
    );
    this.rememberMeCheckbox = page.locator(
      '[data-testid="remember-me"], input[name="remember"]',
    );
    this.loginForm = page.locator(
      '[data-testid="login-form"], form, .login-form',
    );
  }

  // Navigation methods
  async navigateToLogin() {
    await this.goto("/login");
    await this.waitForPageLoad();
  }

  // Form interaction methods
  async enterEmail(email: string) {
    await this.fillInput(this.emailInput, email);
  }

  async enterPassword(password: string) {
    await this.fillInput(this.passwordInput, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.loginButton);
    await this.waitForLoadingToFinish();
  }

  async toggleShowPassword() {
    if (await this.isElementVisible(this.showPasswordButton)) {
      await this.clickElement(this.showPasswordButton);
    }
  }

  async toggleRememberMe() {
    if (await this.isElementVisible(this.rememberMeCheckbox)) {
      await this.clickElement(this.rememberMeCheckbox);
    }
  }

  async clickForgotPassword() {
    await this.clickElement(this.forgotPasswordLink);
  }

  async clickSignUpLink() {
    await this.clickElement(this.signUpLink);
  }

  // High-level action methods
  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.enterEmail(email);
    await this.enterPassword(password);

    if (rememberMe) {
      await this.toggleRememberMe();
    }

    await this.clickLoginButton();
  }

  async loginWithValidCredentials(
    email: string = "test@example.com",
    password: string = "password123",
  ) {
    await this.login(email, password);
    await this.waitForSuccessfulLogin();
  }

  async loginWithInvalidCredentials(
    email: string = "invalid@example.com",
    password: string = "wrongpassword",
  ) {
    await this.login(email, password);
    await this.waitForErrorMessage();
  }

  async quickLogin(email: string, password: string) {
    await this.navigateToLogin();
    await this.login(email, password);
  }

  // Validation methods
  async waitForSuccessfulLogin() {
    // Wait for redirect to dashboard or success indication
    await Promise.race([
      this.waitForUrl(/\/dashboard/),
      this.waitForUrl(/\/home/),
      this.waitForElementToBeVisible(this.successMessage),
    ]);
  }

  async waitForErrorMessage() {
    await this.waitForElementToBeVisible(this.errorMessage);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElementToBeVisible(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForElementToBeVisible(this.successMessage);
    return await this.getElementText(this.successMessage);
  }

  // Assertion methods
  async expectLoginFormToBeVisible() {
    await this.expectElementToBeVisible(this.loginForm);
    await this.expectElementToBeVisible(this.emailInput);
    await this.expectElementToBeVisible(this.passwordInput);
    await this.expectElementToBeVisible(this.loginButton);
  }

  async expectErrorMessage(expectedMessage: string) {
    await this.expectElementToBeVisible(this.errorMessage);
    await this.expectElementToContainText(this.errorMessage, expectedMessage);
  }

  async expectSuccessMessage(expectedMessage: string) {
    await this.expectElementToBeVisible(this.successMessage);
    await this.expectElementToContainText(this.successMessage, expectedMessage);
  }

  async expectLoginButtonToBeDisabled() {
    const isEnabled = await this.isElementEnabled(this.loginButton);
    if (isEnabled) {
      throw new Error(
        "Expected login button to be disabled, but it was enabled",
      );
    }
  }

  async expectLoginButtonToBeEnabled() {
    const isEnabled = await this.isElementEnabled(this.loginButton);
    if (!isEnabled) {
      throw new Error(
        "Expected login button to be enabled, but it was disabled",
      );
    }
  }

  async expectRedirectToDashboard() {
    await this.expectPageToHaveUrl(/\/dashboard/);
  }

  // Form validation methods
  async expectEmailValidationError() {
    const emailError = this.page.locator(
      '[data-testid="email-error"], .email-error',
    );
    await this.expectElementToBeVisible(emailError);
  }

  async expectPasswordValidationError() {
    const passwordError = this.page.locator(
      '[data-testid="password-error"], .password-error',
    );
    await this.expectElementToBeVisible(passwordError);
  }

  // Utility methods
  async clearForm() {
    await this.fillInput(this.emailInput, "");
    await this.fillInput(this.passwordInput, "");
  }

  async isLoginFormValid(): Promise<boolean> {
    const emailValue = await this.getElementValue(this.emailInput);
    const passwordValue = await this.getElementValue(this.passwordInput);

    return emailValue.length > 0 && passwordValue.length > 0;
  }

  async getEmailValue(): Promise<string> {
    return await this.getElementValue(this.emailInput);
  }

  async getPasswordValue(): Promise<string> {
    return await this.getElementValue(this.passwordInput);
  }

  async isRememberMeChecked(): Promise<boolean> {
    if (await this.isElementVisible(this.rememberMeCheckbox)) {
      return await this.rememberMeCheckbox.isChecked();
    }
    return false;
  }

  // Keyboard navigation
  async navigateWithTab() {
    await this.emailInput.focus();
    await this.pressKey("Tab");
    await this.pressKey("Tab");
    await this.pressKey("Enter");
  }

  async submitWithEnter() {
    await this.passwordInput.focus();
    await this.pressKey("Enter");
    await this.waitForLoadingToFinish();
  }

  // Implementation of abstract methods
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElementToBeVisible(this.loginForm);
      await this.waitForElementToBeVisible(this.emailInput);
      await this.waitForElementToBeVisible(this.passwordInput);
      await this.waitForElementToBeVisible(this.loginButton);
      return true;
    } catch {
      return false;
    }
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  // Test data helpers
  static getValidTestCredentials() {
    return {
      email: "test@neonpro.com",
      password: "Test123456!",
    };
  }

  static getInvalidTestCredentials() {
    return {
      email: "invalid@example.com",
      password: "wrongpassword",
    };
  }

  static getTestCredentialsWithWeakPassword() {
    return {
      email: "test@neonpro.com",
      password: "123",
    };
  }

  static getTestCredentialsWithInvalidEmail() {
    return {
      email: "invalid-email",
      password: "Test123456!",
    };
  }
}
