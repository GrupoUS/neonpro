/**
 * AuthProvider - Context provider para autenticação global
 * Usa o useAuthToken hook e AuthTokenManager para gerenciar estado
 */

"use client";

import { type ReactNode, createContext, useContext } from "react";
import { type AuthUser, type LoginCredentials, useAuthToken } from "./use-auth-token";

type AuthContextType = {
	// Estado
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Ações
	login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;

	// Utilidades
	getValidToken: () => Promise<string | null>;
	getAuthHeader: () => Promise<string | null>;
	refreshToken: () => Promise<boolean>;

	// Status de tokens
	hasValidTokens: boolean;
	willExpireSoon: boolean;
	timeUntilExpiration: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type AuthProviderProps = {
	children: ReactNode;
};

/**
 * Provider de autenticação global
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const authHook = useAuthToken();

	const contextValue: AuthContextType = {
		// Estado
		user: authHook.user,
		isAuthenticated: authHook.isAuthenticated,
		isLoading: authHook.isLoading,
		error: authHook.error,

		// Ações
		login: authHook.login,
		logout: authHook.logout,

		// Utilidades
		getValidToken: authHook.getValidToken,
		getAuthHeader: authHook.getAuthHeader,
		refreshToken: authHook.refreshToken,

		// Status de tokens
		hasValidTokens: authHook.hasValidTokens,
		willExpireSoon: authHook.willExpireSoon,
		timeUntilExpiration: authHook.timeUntilExpiration,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}

/**
 * Hook para verificar se usuário está autenticado
 */
export function useIsAuthenticated(): boolean {
	const { isAuthenticated } = useAuth();
	return isAuthenticated;
}

/**
 * Hook para obter dados do usuário atual
 */
export function useCurrentUser(): AuthUser | null {
	const { user } = useAuth();
	return user;
}

/**
 * Hook para obter token válido com refresh automático
 */
export function useAuthTokenHelpers(): {
	getToken: () => Promise<string | null>;
	getAuthHeader: () => Promise<string | null>;
} {
	const { getValidToken, getAuthHeader } = useAuth();

	return {
		getToken: getValidToken,
		getAuthHeader,
	};
}
