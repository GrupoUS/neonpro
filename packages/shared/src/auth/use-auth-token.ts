/**
 * Hook de autenticação integrado com AuthTokenManager
 * Gerencia estado de autenticação, login, logout e refresh automático
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { authTokenManager } from "./auth-token-manager";
import type { AuthTokens } from "./auth-token-manager";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    tokens: AuthTokens;
  };
  error?: string;
  message?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook principal de autenticação
 */
export function useAuthToken() {
  const [authState, setAuthState] = useState<AuthState>({
    user: undefined,
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Atualiza estado de autenticação de forma segura
   */
  const updateAuthState = useCallback((newState: Partial<AuthState>) => {
    if (mountedRef.current) {
      setAuthState((prev) => ({ ...prev, ...newState }));
    }
  }, []);

  /**
   * Carrega usuário atual baseado no token
   */
  const loadCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const token = await authTokenManager.getValidToken();

      if (!token) {
        return;
      }

      const response = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido, limpar
          authTokenManager.clearTokens();
          return;
        }
        throw new Error(`Failed to load user: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data as AuthUser;
      }

      return;
    } catch {
      return;
    }
  }, []);

  /**
   * Configura refresh automático baseado na expiração do token
   */
  const scheduleTokenRefresh = useCallback(() => {
    // Limpa timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeUntilExpiration = authTokenManager.getTimeUntilExpiration();

    if (timeUntilExpiration > 0) {
      // Agenda refresh 2 minutos antes da expiração (ou metade do tempo se for menor)
      const refreshTime = Math.max(
        timeUntilExpiration - 120, // 2 minutos antes
        timeUntilExpiration / 2, // ou metade do tempo restante
      );

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          if (mountedRef.current && authTokenManager.hasRefreshToken()) {
            const refreshed = await authTokenManager.refreshAccessToken();

            if (refreshed) {
              scheduleTokenRefresh(); // Agenda próximo refresh
            } else {
              // Refresh falhou, fazer logout
              updateAuthState({
                user: undefined,
                isAuthenticated: false,
                error: "Sessão expirada. Faça login novamente.",
              });
            }
          }
        }, refreshTime * 1000);
      }
    }
  }, [updateAuthState]);

  /**
   * Inicializa estado de autenticação
   */
  const initializeAuth = useCallback(async () => {
    updateAuthState({ isLoading: true, error: undefined });

    try {
      // Verifica se há tokens válidos
      if (authTokenManager.hasValidTokens()) {
        const user = await loadCurrentUser();

        if (user) {
          updateAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Agenda refresh automático
          scheduleTokenRefresh();
          return;
        }
      }

      // Não há tokens válidos ou usuário não encontrado
      authTokenManager.clearTokens();
      updateAuthState({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      updateAuthState({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
        error: "Erro ao carregar autenticação",
      });
    }
  }, [loadCurrentUser, scheduleTokenRefresh, updateAuthState]);

  /**
   * Função de login
   */
  const login = useCallback(
    async (
      credentials: LoginCredentials,
    ): Promise<{ success: boolean; error?: string }> => {
      updateAuthState({ isLoading: true, error: undefined });

      try {
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const data: LoginResponse = await response.json();

        if (!(response.ok && data.success)) {
          const errorMessage = data.error || data.message || "Erro no login";
          updateAuthState({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }

        if (data.data) {
          // Armazenar tokens
          authTokenManager.setTokens(data.data.tokens);

          // Atualizar estado
          updateAuthState({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });

          // Agendar refresh automático
          scheduleTokenRefresh();

          return { success: true };
        }

        return { success: false, error: "Resposta inválida do servidor" };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro de rede";
        updateAuthState({
          isLoading: false,
          error: errorMessage,
        });
        return { success: false, error: errorMessage };
      }
    },
    [scheduleTokenRefresh, updateAuthState],
  );

  /**
   * Função de logout
   */
  const logout = useCallback(async (): Promise<void> => {
    updateAuthState({ isLoading: true });

    try {
      // Limpar timeout de refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = undefined;
      }

      // Tentar fazer logout no servidor
      const token = authTokenManager.getAccessToken();

      if (token) {
        try {
          await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken: authTokenManager.getRefreshToken(),
            }),
          });
        } catch {}
      }

      // Limpar tokens locais
      authTokenManager.clearTokens();

      // Atualizar estado
      updateAuthState({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      });
    } catch {
      // Sempre limpar estado local mesmo se houver erro
      authTokenManager.clearTokens();
      updateAuthState({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      });
    }
  }, [updateAuthState]);

  /**
   * Função para obter token válido (com refresh automático)
   */
  const getValidToken = useCallback(async (): Promise<string | null> => {
    return authTokenManager.getValidToken();
  }, []);

  /**
   * Função para obter header de autorização
   */
  const getAuthHeader = useCallback(async (): Promise<string | null> => {
    return authTokenManager.getAuthorizationHeaderWithRefresh();
  }, []);

  // Inicializar autenticação quando componente monta
  useEffect(() => {
    mountedRef.current = true;
    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [initializeAuth]);

  return {
    // Estado
    ...authState,

    // Ações
    login,
    logout,

    // Utilidades
    getValidToken,
    getAuthHeader,
    refreshToken: authTokenManager.refreshAccessToken,

    // Status de tokens
    hasValidTokens: authTokenManager.hasValidTokens(),
    willExpireSoon: authTokenManager.willExpireSoon(),
    timeUntilExpiration: authTokenManager.getTimeUntilExpiration(),
  };
}
