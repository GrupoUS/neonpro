import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TestUtils, TEST_CONSTANTS } from "../../utils/test-utils";

/**
 * Testes E2E para fluxo de login
 * Demonstra o uso do Page Object Model
 */
test.describe("Login Flow", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Limpar dados de teste
    await TestUtils.cleanupTestData(page);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Arrange
    const credentials = TestUtils.getValidCredentials();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboardPage.isLoaded()).resolves.toBe(true);

    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toContain("Bem-vindo");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Arrange
    const credentials = TestUtils.getInvalidCredentials();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert
    await expect(loginPage.hasErrorMessage()).resolves.toBe(true);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Credenciais inválidas");

    // Verificar que ainda está na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should validate required fields", async ({ page }) => {
    // Act
    await loginPage.navigateToLogin();
    await loginPage.clickLoginButton();

    // Assert
    await expect(loginPage.hasValidationErrors()).resolves.toBe(true);

    const emailError = await loginPage.getEmailValidationError();
    const passwordError = await loginPage.getPasswordValidationError();

    expect(emailError).toContain("obrigatório");
    expect(passwordError).toContain("obrigatório");
  });

  test("should handle forgot password flow", async ({ page }) => {
    // Arrange
    const email = "user@example.com";

    // Act
    await loginPage.navigateToLogin();
    await loginPage.clickForgotPassword();
    await loginPage.enterForgotPasswordEmail(email);
    await loginPage.submitForgotPassword();

    // Assert
    await expect(loginPage.hasSuccessMessage()).resolves.toBe(true);
    const successMessage = await loginPage.getSuccessMessage();
    expect(successMessage).toContain("instruções enviadas");
  });

  test("should redirect to dashboard after successful login", async ({
    page,
  }) => {
    // Arrange
    const credentials = TestUtils.getValidCredentials();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert - Verificar redirecionamento
    await page.waitForURL(/\/dashboard/, {
      timeout: TEST_CONSTANTS.TIMEOUTS.MEDIUM,
    });

    // Verificar elementos do dashboard
    await expect(dashboardPage.isLoaded()).resolves.toBe(true);
    await expect(dashboardPage.hasUserMenu()).resolves.toBe(true);
    await expect(dashboardPage.hasSidebar()).resolves.toBe(true);
  });

  test("should remember user session", async ({ page, context }) => {
    // Arrange
    const credentials = TestUtils.getValidCredentials();

    // Act - Login inicial
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);
    await dashboardPage.waitForPageLoad();

    // Fechar e reabrir página
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto("/dashboard");

    // Assert - Deve permanecer logado
    const newDashboardPage = new DashboardPage(newPage);
    await expect(newDashboardPage.isLoaded()).resolves.toBe(true);
  });

  test("should logout successfully", async ({ page }) => {
    // Arrange - Login primeiro
    const { dashboardPage: dashboard } =
      await TestUtils.loginAndNavigateToDashboard(page);

    // Act
    await dashboard.logout();

    // Assert
    await page.waitForURL(/\/login/, {
      timeout: TEST_CONSTANTS.TIMEOUTS.MEDIUM,
    });
    await expect(loginPage.isLoaded()).resolves.toBe(true);
  });

  test("should handle different user roles", async ({ page }) => {
    // Test admin login
    const adminCredentials = TestUtils.getCredentialsByUserType("admin");
    await loginPage.navigateToLogin();
    await loginPage.login(adminCredentials.email, adminCredentials.password);

    await dashboardPage.waitForPageLoad();
    const adminPermissions = await dashboardPage.getUserPermissions();
    expect(adminPermissions).toContain("admin");

    // Logout
    await dashboardPage.logout();

    // Test doctor login
    const doctorCredentials = TestUtils.getCredentialsByUserType("doctor");
    await loginPage.login(doctorCredentials.email, doctorCredentials.password);

    await dashboardPage.waitForPageLoad();
    const doctorPermissions = await dashboardPage.getUserPermissions();
    expect(doctorPermissions).toContain("doctor");
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Arrange - Simular conexão lenta
    await TestUtils.simulateSlowConnection(page);

    const credentials = TestUtils.getValidCredentials();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert - Deve mostrar loading e depois sucesso
    await expect(loginPage.isLoading()).resolves.toBe(true);

    // Restaurar conexão e aguardar sucesso
    await TestUtils.restoreNormalConnection(page);
    await page.waitForURL(/\/dashboard/, {
      timeout: TEST_CONSTANTS.TIMEOUTS.EXTRA_LONG,
    });
  });

  test("should be accessible", async ({ page }) => {
    // Act
    await loginPage.navigateToLogin();

    // Assert - Verificar acessibilidade básica
    await TestUtils.checkBasicAccessibility(page);

    // Verificar elementos específicos de acessibilidade
    await expect(loginPage.hasProperLabels()).resolves.toBe(true);
    await expect(loginPage.hasKeyboardNavigation()).resolves.toBe(true);
  });

  test("should perform well", async ({ page }) => {
    // Act
    await loginPage.navigateToLogin();

    // Measure performance
    const metrics = await TestUtils.measurePagePerformance(page);

    // Assert - Performance thresholds
    expect(metrics.loadTime).toBeLessThan(3000); // 3s
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2s
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5s
  });
});

/**
 * Testes de integração com API
 */
test.describe("Login API Integration", () => {
  test("should handle API errors", async ({ page }) => {
    // Arrange - Mock API error
    await TestUtils.mockApiResponse(
      page,
      TEST_CONSTANTS.API_ENDPOINTS.LOGIN,
      { error: "Internal Server Error" },
      500,
    );

    const loginPage = new LoginPage(page);
    const credentials = TestUtils.getValidCredentials();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert
    await expect(loginPage.hasErrorMessage()).resolves.toBe(true);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Erro interno do servidor");
  });

  test("should send correct login payload", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const credentials = TestUtils.getValidCredentials();

    // Intercept API call
    let requestPayload: any;
    await page.route(
      TEST_CONSTANTS.API_ENDPOINTS.LOGIN,
      async (route, request) => {
        requestPayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            token: "fake-token",
            user: { id: 1, email: credentials.email },
          }),
        });
      },
    );

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);

    // Assert
    expect(requestPayload).toEqual({
      email: credentials.email,
      password: credentials.password,
    });
  });
});
