/**
 * Teste End-to-End do Sistema de Autenticação
 * Valida todo o fluxo: login → acesso protegido → refresh → logout
 */

import { authTokenManager } from "./auth-token-manager";

export interface TestCredentials {
  email: string;
  password: string;
}

export interface E2ETestResult {
  success: boolean;
  steps: {
    login: boolean;
    tokenStorage: boolean;
    protectedAccess: boolean;
    tokenRefresh: boolean;
    logout: boolean;
  };
  errors: string[];
  timing: {
    loginTime: number;
    refreshTime: number;
    logoutTime: number;
  };
}

/**
 * Executa teste completo de autenticação end-to-end
 */
export async function runAuthE2ETest(
  credentials: TestCredentials,
  baseUrl = "",
): Promise<E2ETestResult> {
  const result: E2ETestResult = {
    success: false,
    steps: {
      login: false,
      tokenStorage: false,
      protectedAccess: false,
      tokenRefresh: false,
      logout: false,
    },
    errors: [],
    timing: {
      loginTime: 0,
      refreshTime: 0,
      logoutTime: 0,
    },
  };

  try {
    // Limpar estado inicial
    authTokenManager.clearTokens();
    const loginStart = performance.now();

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    result.timing.loginTime = performance.now() - loginStart;

    if (!loginResponse.ok) {
      result.errors.push(`Login failed: ${loginResponse.status}`);
      return result;
    }

    const loginData = await loginResponse.json();

    if (!(loginData.success && loginData.data?.tokens)) {
      result.errors.push("Login response format invalid");
      return result;
    }

    // Armazenar tokens
    authTokenManager.setTokens(loginData.data.tokens);
    result.steps.login = true;

    const hasTokens = authTokenManager.hasValidTokens();
    const accessToken = authTokenManager.getAccessToken();
    const refreshToken = authTokenManager.getRefreshToken();

    if (!(hasTokens && accessToken && refreshToken)) {
      result.errors.push("Token storage failed");
      return result;
    }

    result.steps.tokenStorage = true;

    const protectedResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!protectedResponse.ok) {
      result.errors.push(
        `Protected route access failed: ${protectedResponse.status}`,
      );
      return result;
    }

    const userData = await protectedResponse.json();

    if (!(userData.success && userData.data)) {
      result.errors.push("Protected route response invalid");
      return result;
    }

    result.steps.protectedAccess = true;
    const refreshStart = performance.now();

    const refreshSuccess = await authTokenManager.refreshAccessToken();
    result.timing.refreshTime = performance.now() - refreshStart;

    if (!refreshSuccess) {
      result.errors.push("Token refresh failed");
      return result;
    }

    // Verificar se novo token é válido
    const newToken = authTokenManager.getAccessToken();
    if (!newToken || newToken === accessToken) {
      result.errors.push("Token refresh did not provide new token");
      return result;
    }

    result.steps.tokenRefresh = true;
    const logoutStart = performance.now();

    await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: authTokenManager.getRefreshToken(),
      }),
    });

    result.timing.logoutTime = performance.now() - logoutStart;

    // Limpar tokens locais
    authTokenManager.clearTokens();

    // Verificar se tokens foram limpos
    if (authTokenManager.hasValidTokens()) {
      result.errors.push("Tokens not cleared after logout");
      return result;
    }

    // Verificar se não consegue mais acessar rota protegida
    const postLogoutResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    });

    if (postLogoutResponse.ok) {
      result.errors.push("Still can access protected route after logout");
      return result;
    }

    result.steps.logout = true;

    // Todos os passos bem-sucedidos
    result.success = true;

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Test execution error: ${errorMessage}`);

    // Limpar estado em caso de erro
    authTokenManager.clearTokens();

    return result;
  }
}

/**
 * Testa persistência de sessão (localStorage)
 */
export async function testSessionPersistence(): Promise<boolean> {
  try {
    // Simular tokens válidos
    const mockTokens = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 3600,
    };

    // Armazenar tokens
    authTokenManager.setTokens(mockTokens);

    // Verificar se foram armazenados
    if (!authTokenManager.hasValidTokens()) {
      return false;
    }

    // Simular reload da página criando nova instância
    const newManager = new (authTokenManager.constructor as any)();

    // Verificar se tokens foram carregados
    const persistedToken = newManager.getAccessToken();
    if (!persistedToken) {
      return false;
    }

    // Limpar
    authTokenManager.clearTokens();
    return true;
  } catch {
    return false;
  }
}

/**
 * Executa todos os testes de autenticação
 */
export async function runAllAuthTests(
  credentials: TestCredentials,
  baseUrl = "",
): Promise<{
  e2eTest: E2ETestResult;
  persistenceTest: boolean;
  overallSuccess: boolean;
}> {
  const e2eTest = await runAuthE2ETest(credentials, baseUrl);
  const persistenceTest = await testSessionPersistence();

  const overallSuccess = e2eTest.success && persistenceTest;

  if (!overallSuccess) {
    e2eTest.errors.forEach((_error) => {});
  }

  return {
    e2eTest,
    persistenceTest,
    overallSuccess,
  };
}
