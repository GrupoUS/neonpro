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
export async function runAuthE2ETest(credentials: TestCredentials, baseUrl = ""): Promise<E2ETestResult> {
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

	console.log("🚀 Iniciando teste E2E de autenticação...");

	try {
		// Limpar estado inicial
		authTokenManager.clearTokens();

		// Passo 1: Login
		console.log("📝 Testando login...");
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
		console.log("✅ Login bem-sucedido");

		// Passo 2: Verificar armazenamento de tokens
		console.log("💾 Testando armazenamento de tokens...");

		const hasTokens = authTokenManager.hasValidTokens();
		const accessToken = authTokenManager.getAccessToken();
		const refreshToken = authTokenManager.getRefreshToken();

		if (!(hasTokens && accessToken && refreshToken)) {
			result.errors.push("Token storage failed");
			return result;
		}

		result.steps.tokenStorage = true;
		console.log("✅ Tokens armazenados corretamente");

		// Passo 3: Acessar rota protegida
		console.log("🔒 Testando acesso a rota protegida...");

		const protectedResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!protectedResponse.ok) {
			result.errors.push(`Protected route access failed: ${protectedResponse.status}`);
			return result;
		}

		const userData = await protectedResponse.json();

		if (!(userData.success && userData.data)) {
			result.errors.push("Protected route response invalid");
			return result;
		}

		result.steps.protectedAccess = true;
		console.log("✅ Acesso a rota protegida bem-sucedido");

		// Passo 4: Testar refresh de token
		console.log("🔄 Testando refresh de token...");
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
		console.log("✅ Refresh de token bem-sucedido");

		// Passo 5: Testar logout
		console.log("👋 Testando logout...");
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
		console.log("✅ Logout bem-sucedido");

		// Todos os passos bem-sucedidos
		result.success = true;
		console.log("🎉 Teste E2E de autenticação concluído com sucesso!");

		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		result.errors.push(`Test execution error: ${errorMessage}`);
		console.error("❌ Erro durante teste E2E:", error);

		// Limpar estado em caso de erro
		authTokenManager.clearTokens();

		return result;
	}
}

/**
 * Testa persistência de sessão (localStorage)
 */
export async function testSessionPersistence(): Promise<boolean> {
	console.log("💾 Testando persistência de sessão...");

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
			console.error("❌ Tokens não foram armazenados");
			return false;
		}

		// Simular reload da página criando nova instância
		const newManager = new (authTokenManager.constructor as any)();

		// Verificar se tokens foram carregados
		const persistedToken = newManager.getAccessToken();
		if (!persistedToken) {
			console.error("❌ Tokens não foram persistidos");
			return false;
		}

		// Limpar
		authTokenManager.clearTokens();

		console.log("✅ Persistência de sessão funcionando");
		return true;
	} catch (error) {
		console.error("❌ Erro no teste de persistência:", error);
		return false;
	}
}

/**
 * Executa todos os testes de autenticação
 */
export async function runAllAuthTests(
	credentials: TestCredentials,
	baseUrl = ""
): Promise<{
	e2eTest: E2ETestResult;
	persistenceTest: boolean;
	overallSuccess: boolean;
}> {
	console.log("🧪 Executando todos os testes de autenticação...\n");

	const e2eTest = await runAuthE2ETest(credentials, baseUrl);
	const persistenceTest = await testSessionPersistence();

	const overallSuccess = e2eTest.success && persistenceTest;

	console.log("\n📊 Resultados dos Testes:");
	console.log(`E2E Test: ${e2eTest.success ? "✅" : "❌"}`);
	console.log(`Persistence Test: ${persistenceTest ? "✅" : "❌"}`);
	console.log(`Overall: ${overallSuccess ? "✅ PASSOU" : "❌ FALHOU"}`);

	if (!overallSuccess) {
		console.log("\n❌ Erros encontrados:");
		e2eTest.errors.forEach((error) => console.log(`  - ${error}`));
	}

	return {
		e2eTest,
		persistenceTest,
		overallSuccess,
	};
}
