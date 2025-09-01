import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";

/**
 * Utilitários comuns para testes E2E
 * Fornece funções auxiliares para autenticação, navegação e validações
 */
export class TestUtils {
  /**
   * Realiza login completo e navega para o dashboard
   */
  static async loginAndNavigateToDashboard(
    page: Page,
    credentials: {
      email: string;
      password: string;
    } = TestUtils.getValidCredentials(),
  ): Promise<{ loginPage: LoginPage; dashboardPage: DashboardPage; }> {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);
    await dashboardPage.waitForPageLoad();

    return { loginPage, dashboardPage };
  }

  /**
   * Configura contexto de teste com usuário autenticado
   */
  static async setupAuthenticatedContext(
    context: BrowserContext,
    userType: "admin" | "doctor" | "nurse" | "receptionist" = "admin",
  ): Promise<void> {
    const page = await context.newPage();
    const credentials = TestUtils.getCredentialsByUserType(userType);

    await TestUtils.loginAndNavigateToDashboard(page, credentials);
    await page.close();
  }

  /**
   * Aguarda elemento estar visível com retry
   */
  static async waitForElementWithRetry(
    page: Page,
    selector: string,
    options: { timeout?: number; retries?: number; } = {},
  ): Promise<boolean> {
    const { timeout = 5000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        await page.locator(selector).waitFor({ state: "visible", timeout });
        return true;
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        await page.waitForTimeout(1000);
      }
    }
    return false;
  }

  /**
   * Verifica se a página carregou completamente
   */
  static async waitForPageLoad(
    page: Page,
    timeout = 10_000,
  ): Promise<void> {
    await Promise.all([
      page.waitForLoadState("networkidle", { timeout }),
      page.waitForLoadState("domcontentloaded", { timeout }),
    ]);
  }

  /**
   * Captura screenshot com timestamp
   */
  static async takeScreenshot(
    page: Page,
    name: string,
    options: { fullPage?: boolean; path?: string; } = {},
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${timestamp}.png`;
    const path = options.path || `./test-results/screenshots/${filename}`;

    await page.screenshot({
      path,
      fullPage: options.fullPage || false,
    });

    return path;
  }

  /**
   * Verifica acessibilidade básica da página
   */
  static async checkBasicAccessibility(page: Page): Promise<void> {
    // Verificar se há elementos com aria-labels apropriados
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute("aria-label");
      const hasText = await button.textContent();

      expect(hasAriaLabel || hasText).toBeTruthy();
    }

    // Verificar contraste básico (simulado)
    const elements = page.locator("*:visible");
    const count = Math.min(await elements.count(), 10); // Limitar para performance

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Verificação básica de contraste (implementação simplificada)
      expect(styles.color).not.toBe(styles.backgroundColor);
    }
  }

  /**
   * Monitora performance da página
   */
  static async measurePagePerformance(page: Page): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
  }> {
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd
          - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find((p) => p.name === "first-contentful-paint")?.startTime
          || 0,
      };
    });

    return performanceMetrics;
  }

  /**
   * Simula conexão lenta
   */
  static async simulateSlowConnection(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: 50 * 1024, // 50kb/s
      uploadThroughput: 20 * 1024, // 20kb/s
      latency: 500, // 500ms
    });
  }

  /**
   * Restaura conexão normal
   */
  static async restoreNormalConnection(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }

  /**
   * Intercepta e mocka requisições de API
   */
  static async mockApiResponse(
    page: Page,
    url: string | RegExp,
    response: Record<string, unknown>,
    status = 200,
  ): Promise<void> {
    await page.route(url, async (route) => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Aguarda requisição específica
   */
  static async waitForApiCall(
    page: Page,
    url: string | RegExp,
    timeout = 10_000,
  ): Promise<any> {
    const response = await page.waitForResponse(
      (response) => {
        const responseUrl = response.url();
        if (typeof url === "string") {
          return responseUrl.includes(url);
        }
        return url.test(responseUrl);
      },
      { timeout },
    );

    return await response.json();
  }

  /**
   * Limpa dados de teste
   */
  static async cleanupTestData(page: Page): Promise<void> {
    // Limpar localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Limpar cookies
    await page.context().clearCookies();
  }

  /**
   * Gera dados de teste aleatórios
   */
  static generateTestData() {
    const timestamp = Date.now();

    return {
      patient: {
        name: `Paciente Teste ${timestamp}`,
        email: `paciente${timestamp}@teste.com`,
        cpf: TestUtils.generateCPF(),
        phone: TestUtils.generatePhone(),
        birthDate: "1990-01-01",
      },
      appointment: {
        date: TestUtils.getFutureDate(7),
        time: "14:30",
        duration: "30",
        notes: `Consulta de teste ${timestamp}`,
      },
      prescription: {
        medication: "Paracetamol 500mg",
        dosage: "1 comprimido",
        frequency: "8/8 horas",
        duration: "7 dias",
      },
    };
  }

  // Credenciais de teste
  static getValidCredentials() {
    return {
      email: "admin@neonpro.com",
      password: "admin123",
    };
  }

  static getInvalidCredentials() {
    return {
      email: "invalid@test.com",
      password: "wrongpassword",
    };
  }

  static getCredentialsByUserType(userType: string) {
    const credentials = {
      admin: { email: "admin@neonpro.com", password: "admin123" },
      doctor: { email: "doctor@neonpro.com", password: "doctor123" },
      nurse: { email: "nurse@neonpro.com", password: "nurse123" },
      receptionist: {
        email: "receptionist@neonpro.com",
        password: "receptionist123",
      },
    };

    return (
      credentials[userType as keyof typeof credentials] || credentials.admin
    );
  }

  // Utilitários de geração de dados
  private static generateCPF(): string {
    const numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Calcular dígitos verificadores (simplificado para teste)
    const digit1 = numbers.reduce((sum, num, index) => sum + num * (10 - index), 0) % 11;
    const digit2 = [...numbers, digit1].reduce(
      (sum, num, index) => sum + num * (11 - index),
      0,
    ) % 11;

    return [
      ...numbers,
      digit1 < 2 ? 0 : 11 - digit1,
      digit2 < 2 ? 0 : 11 - digit2,
    ]
      .join("")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  private static generatePhone(): string {
    const ddd = Math.floor(Math.random() * 89) + 11; // 11-99
    const number = Math.floor(Math.random() * 900_000_000) + 100_000_000; // 9 dígitos
    return `(${ddd}) ${number.toString().replace(/(\d{5})(\d{4})/, "$1-$2")}`;
  }

  private static getFutureDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
  }
}

/**
 * Constantes para testes
 */
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10_000,
    EXTRA_LONG: 30_000,
  },

  SELECTORS: {
    LOADING: '[data-testid*="loading"]',
    ERROR: '[data-testid*="error"]',
    SUCCESS: '[data-testid*="success"]',
    MODAL: '[data-testid*="modal"]',
    FORM: '[data-testid*="form"]',
  },

  API_ENDPOINTS: {
    LOGIN: "/api/auth/login",
    PATIENTS: "/api/patients",
    APPOINTMENTS: "/api/appointments",
    PRESCRIPTIONS: "/api/prescriptions",
  },

  USER_ROLES: {
    ADMIN: "admin",
    DOCTOR: "doctor",
    NURSE: "nurse",
    RECEPTIONIST: "receptionist",
  } as const,
};

/**
 * Tipos para testes
 */
export interface TestCredentials {
  email: string;
  password: string;
}

export interface TestPatient {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
}

export interface TestAppointment {
  date: string;
  time: string;
  duration: string;
  notes: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
}
