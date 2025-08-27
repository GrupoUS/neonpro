/**
 * AuthTokenManager - Sistema completo de gerenciamento de tokens de autenticação
 * Funcionalidades:
 * - Armazenamento seguro de tokens
 * - Refresh automático de tokens
 * - Persistência em localStorage
 * - Validação de expiração
 * - Limpeza segura de dados sensíveis
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType?: string;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
  tokenType: string;
}

export class AuthTokenManager {
  private static instance: AuthTokenManager;
  private accessToken: string | null = undefined;
  private refreshToken: string | null = undefined;
  private expiresAt: number | null = undefined;
  private tokenType = "Bearer";
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = undefined;
  private readonly refreshCallbacks: ((success: boolean) => void)[] = [];

  // Storage keys
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: "neonpro_access_token",
    REFRESH_TOKEN: "neonpro_refresh_token",
    EXPIRES_AT: "neonpro_token_expires_at",
    TOKEN_TYPE: "neonpro_token_type",
  } as const;

  constructor() {
    // Load tokens from storage on initialization
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  } /**
   * Singleton pattern - ensure only one instance
   */

  static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager();
    }
    return AuthTokenManager.instance;
  }

  /**
   * Load tokens from localStorage with error handling
   */
  private loadFromStorage(): void {
    try {
      const accessToken = localStorage.getItem(
        AuthTokenManager.STORAGE_KEYS.ACCESS_TOKEN,
      );
      const refreshToken = localStorage.getItem(
        AuthTokenManager.STORAGE_KEYS.REFRESH_TOKEN,
      );
      const expiresAt = localStorage.getItem(
        AuthTokenManager.STORAGE_KEYS.EXPIRES_AT,
      );
      const tokenType = localStorage.getItem(
        AuthTokenManager.STORAGE_KEYS.TOKEN_TYPE,
      );

      if (accessToken && refreshToken && expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = Number.parseInt(expiresAt, 10);
        this.tokenType = tokenType || "Bearer";

        // Validate loaded tokens
        if (Number.isNaN(this.expiresAt) || this.expiresAt < Date.now()) {
          this.clearTokens();
        }
      }
    } catch {
      this.clearTokens();
    }
  } /**
   * Save tokens to localStorage with error handling
   */

  private saveToStorage(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (this.accessToken && this.refreshToken && this.expiresAt) {
        localStorage.setItem(
          AuthTokenManager.STORAGE_KEYS.ACCESS_TOKEN,
          this.accessToken,
        );
        localStorage.setItem(
          AuthTokenManager.STORAGE_KEYS.REFRESH_TOKEN,
          this.refreshToken,
        );
        localStorage.setItem(
          AuthTokenManager.STORAGE_KEYS.EXPIRES_AT,
          this.expiresAt.toString(),
        );
        localStorage.setItem(
          AuthTokenManager.STORAGE_KEYS.TOKEN_TYPE,
          this.tokenType,
        );
      }
    } catch {
      // Clear tokens if storage fails to prevent inconsistent state
      this.clearTokens();
    }
  }

  /**
   * Clear tokens from localStorage
   */
  private clearStorage(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      Object.values(AuthTokenManager.STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch {}
  } /**
   * Set authentication tokens
   */

  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenType = tokens.tokenType || "Bearer";
    // Calculate expiration timestamp (with safety margin of 30 seconds)
    this.expiresAt = Date.now() + (tokens.expiresIn - 30) * 1000;

    this.saveToStorage();
  }

  /**
   * Get current access token if valid
   */
  getAccessToken(): string | null {
    if (!(this.accessToken && this.expiresAt)) {
      return;
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      return;
    }

    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get token type (usually 'Bearer')
   */
  getTokenType(): string {
    return this.tokenType;
  }

  /**
   * Get authorization header value
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return;
    }
    return `${this.tokenType} ${token}`;
  } /**
   * Check if user has valid tokens
   */

  hasValidTokens(): boolean {
    return !!(this.accessToken && this.refreshToken && !this.isTokenExpired());
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    if (!this.expiresAt) {
      return true;
    }
    return Date.now() >= this.expiresAt;
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return !!this.refreshToken;
  }

  /**
   * Get time until token expiration (in seconds)
   */
  getTimeUntilExpiration(): number {
    if (!this.expiresAt) {
      return 0;
    }
    return Math.max(0, Math.floor((this.expiresAt - Date.now()) / 1000));
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    } // If already refreshing, wait for that operation
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    // If multiple requests come in while refreshing, queue them
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshCallbacks.push(resolve);
      });
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;

      // Notify queued callbacks
      this.refreshCallbacks.forEach((callback) => callback(result));
      this.refreshCallbacks.length = 0;

      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = undefined;
    }
  }

  /**
   * Perform actual token refresh API call
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        await response.json().catch(() => {});

        // If refresh token is invalid/expired, clear all tokens
        if (response.status === 401 || response.status === 403) {
          this.clearTokens();
        }

        return false;
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
          tokenType: data.data.tokenType,
        });
        return true;
      }
      this.clearTokens();
      return false;
    } catch (error) {
      // Only clear tokens on network errors if the error suggests auth failure
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network error - don't clear tokens, might be temporary
        return false;
      }

      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all tokens and storage (logout)
   */
  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.expiresAt = undefined;
    this.tokenType = "Bearer";
    this.clearStorage();
  }

  /**
   * Get valid token for API requests with automatic refresh
   */
  async getValidToken(): Promise<string | null> {
    // Check if current token is valid
    const currentToken = this.getAccessToken();
    if (currentToken) {
      return currentToken;
    }

    // Token is expired or missing, try to refresh
    if (this.hasRefreshToken()) {
      const refreshSuccessful = await this.refreshAccessToken();

      if (refreshSuccessful) {
        return this.getAccessToken();
      }
    }

    // No valid token available
    return;
  } /**
   * Get authorization header for API requests with automatic refresh
   */

  async getAuthorizationHeaderWithRefresh(): Promise<string | null> {
    const token = await this.getValidToken();
    if (!token) {
      return;
    }
    return `${this.tokenType} ${token}`;
  }

  /**
   * Get all token data for debugging/testing
   */
  getTokenData(): AuthTokenData | null {
    if (!(this.accessToken && this.refreshToken && this.expiresAt)) {
      return;
    }

    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
      tokenType: this.tokenType,
    };
  }

  /**
   * Check if tokens will expire soon (within specified minutes)
   */
  willExpireSoon(minutes = 5): boolean {
    if (!this.expiresAt) {
      return true;
    }
    const timeUntilExpiration = this.expiresAt - Date.now();
    return timeUntilExpiration <= minutes * 60 * 1000;
  }
}

// Export singleton instance
export const authTokenManager = AuthTokenManager.getInstance();
