import { Page } from "@playwright/test";

export class AuthUtils {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto("/login");
    
    // Wait for login form to load
    await this.page.waitForSelector('[data-testid="login-form"]');
    
    // Fill in login credentials
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    
    // Click login button
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login (redirect to dashboard)
    await this.page.waitForURL("/dashboard", { timeout: 10000 });
    
    console.log(`✅ Successfully logged in as ${email}`);
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    
    // Wait for logout to complete (redirect to login page)
    await this.page.waitForURL("/login", { timeout: 5000 });
    
    console.log("✅ Successfully logged out");
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    await this.page.goto("/register");
    
    // Wait for registration form to load
    await this.page.waitForSelector('[data-testid="register-form"]');
    
    // Fill in registration data
    await this.page.fill('[data-testid="name-input"]', userData.name);
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    
    if (userData.phone) {
      await this.page.fill('[data-testid="phone-input"]', userData.phone);
    }
    
    // Accept terms and conditions
    await this.page.click('[data-testid="terms-checkbox"]');
    
    // Click register button
    await this.page.click('[data-testid="register-button"]');
    
    // Wait for successful registration
    await this.page.waitForURL("/dashboard", { timeout: 10000 });
    
    console.log(`✅ Successfully registered ${userData.name}`);
  }

  async resetPassword(email: string) {
    await this.page.goto("/forgot-password");
    
    // Wait for forgot password form to load
    await this.page.waitForSelector('[data-testid="forgot-password-form"]');
    
    // Fill in email
    await this.page.fill('[data-testid="email-input"]', email);
    
    // Click reset password button
    await this.page.click('[data-testid="reset-password-button"]');
    
    // Wait for success message
    await this.page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
    
    console.log(`✅ Password reset email sent to ${email}`);
  }

  async isLoggedIn() {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser() {
    if (await this.isLoggedIn()) {
      await this.page.click('[data-testid="user-menu"]');
      const userName = await this.page.textContent('[data-testid="user-name"]');
      await this.page.click('[data-testid="user-menu"]'); // Close menu
      return userName?.trim() || null;
    }
    return null;
  }
}

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
  },
  professional: {
    email: "professional@example.com",
    password: "prof123",
    name: "Professional User",
  },
  patient: {
    email: "patient@example.com",
    password: "patient123",
    name: "Patient User",
  },
};