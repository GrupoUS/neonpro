// SSO Manager - Core SSO Implementation
// Story 1.3: SSO Integration Implementation

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";
import {
  DEFAULT_SSO_PROVIDERS,
  type SSOAccountLinking,
  type SSOAuditLog,
  type SSOAuthRequest,
  type SSOAuthResponse,
  type SSOConfiguration,
  type SSOError,
  type SSOErrorCode,
  type SSOProvider,
  type SSOSession,
  type SSOTokenResponse,
  type SSOUserInfo,
} from "@/types/sso";

export class SSOManager {
  private supabase;
  private config: SSOConfiguration;
  private providers: Map<string, SSOProvider> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string, config?: SSOConfiguration) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = config || this.getDefaultConfig();
    this.initializeProviders();
  }

  /**
   * Initialize SSO providers from configuration
   */
  private initializeProviders(): void {
    this.config.providers.forEach((provider) => {
      if (provider.enabled) {
        this.providers.set(provider.id, provider);
      }
    });
  }

  /**
   * Get default SSO configuration
   */
  private getDefaultConfig(): SSOConfiguration {
    return {
      providers: DEFAULT_SSO_PROVIDERS as SSOProvider[],
      domainMappings: [],
      globalSettings: {
        enabled: true,
        allowLocalFallback: true,
        sessionTimeout: 3600000, // 1 hour
        tokenRefreshThreshold: 300000, // 5 minutes
        maxConcurrentSessions: 3,
        auditRetentionDays: 90,
        lgpdCompliance: {
          consentRequired: true,
          dataRetentionDays: 365,
          allowDataExport: true,
          allowDataDeletion: true,
        },
      },
    };
  }

  /**
   * Generate SSO authorization URL
   */
  async generateAuthUrl(
    providerId: string,
    options: Partial<SSOAuthRequest> = {},
  ): Promise<string> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw this.createError("PROVIDER_NOT_FOUND", `Provider ${providerId} not found`);
    }

    if (!provider.enabled) {
      throw this.createError("PROVIDER_DISABLED", `Provider ${providerId} is disabled`);
    }

    const state = options.state || this.generateSecureToken();
    const nonce = options.nonce || this.generateSecureToken();

    const authRequest: SSOAuthRequest = {
      providerId,
      state,
      nonce,
      redirectUri: options.redirectUri || provider.config.redirectUri,
      scopes: options.scopes || provider.config.scopes,
      ...options,
    };

    // Store auth request for validation
    await this.storeAuthRequest(authRequest);

    const params = new URLSearchParams({
      client_id: provider.config.clientId,
      response_type: "code",
      redirect_uri: authRequest.redirectUri,
      scope: authRequest.scopes.join(" "),
      state: authRequest.state,
      ...(authRequest.nonce && { nonce: authRequest.nonce }),
      ...(authRequest.domainHint && { domain_hint: authRequest.domainHint }),
      ...(authRequest.loginHint && { login_hint: authRequest.loginHint }),
      ...(authRequest.prompt && { prompt: authRequest.prompt }),
      ...(authRequest.maxAge && { max_age: authRequest.maxAge.toString() }),
    });

    return `${provider.config.authUrl}?${params.toString()}`;
  }

  /**
   * Handle SSO callback and exchange code for tokens
   */
  async handleCallback(providerId: string, response: SSOAuthResponse): Promise<SSOSession> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw this.createError("PROVIDER_NOT_FOUND", `Provider ${providerId} not found`);
    }

    // Validate state parameter
    const authRequest = await this.getAuthRequest(response.state);
    if (!authRequest || authRequest.providerId !== providerId) {
      throw this.createError("INVALID_STATE", "Invalid state parameter");
    }

    if (response.error) {
      await this.logAudit({
        providerId,
        action: "sso_login_failure",
        details: { error: response.error, description: response.errorDescription },
        success: false,
        errorMessage: response.errorDescription,
      });
      throw this.createError("PROVIDER_ERROR", response.errorDescription || response.error);
    }

    if (!response.code) {
      throw this.createError("PROVIDER_ERROR", "No authorization code received");
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(
        provider,
        response.code,
        authRequest.redirectUri,
      );

      // Get user info
      const userInfo = await this.getUserInfo(provider, tokenResponse.accessToken);

      // Create or link account
      const userId = await this.createOrLinkAccount(provider, userInfo);

      // Create SSO session
      const session = await this.createSSOSession({
        userId,
        providerId,
        providerUserId: userInfo.id,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        idToken: tokenResponse.idToken,
        tokenType: tokenResponse.tokenType,
        expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000),
        scope: tokenResponse.scope?.split(" ") || authRequest.scopes,
        userInfo,
      });

      await this.logAudit({
        userId,
        providerId,
        action: "sso_login_success",
        details: { userInfo: { email: userInfo.email, name: userInfo.name } },
        success: true,
      });

      return session;
    } catch (error) {
      await this.logAudit({
        providerId,
        action: "sso_login_failure",
        details: { error: error.message },
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(
    provider: SSOProvider,
    code: string,
    redirectUri: string,
  ): Promise<SSOTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: provider.config.clientId,
      client_secret: provider.config.clientSecret || "",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(provider.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw this.createError("PROVIDER_ERROR", `Token exchange failed: ${errorData}`);
    }

    const tokenData = await response.json();

    return {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type || "Bearer",
      expiresIn: tokenData.expires_in || 3600,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      scope: tokenData.scope,
    };
  }

  /**
   * Get user information from SSO provider
   */
  private async getUserInfo(provider: SSOProvider, accessToken: string): Promise<SSOUserInfo> {
    if (!provider.config.userInfoUrl) {
      // Try to decode user info from ID token if available
      throw this.createError("CONFIGURATION_ERROR", "No user info URL configured");
    }

    const response = await fetch(provider.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw this.createError("PROVIDER_ERROR", "Failed to fetch user info");
    }

    const userData = await response.json();

    return this.normalizeUserInfo(provider.id, userData);
  }

  /**
   * Normalize user info from different providers
   */
  private normalizeUserInfo(providerId: string, userData: any): SSOUserInfo {
    const baseInfo: SSOUserInfo = {
      id: userData.id || userData.sub || userData.oid,
      email: userData.email,
      emailVerified: userData.email_verified || userData.verified_email || false,
    };

    switch (providerId) {
      case "google":
        return {
          ...baseInfo,
          name: userData.name,
          firstName: userData.given_name,
          lastName: userData.family_name,
          picture: userData.picture,
          locale: userData.locale,
        };

      case "microsoft":
      case "azure-ad":
        return {
          ...baseInfo,
          name: userData.displayName || userData.name,
          firstName: userData.givenName,
          lastName: userData.surname,
          picture: userData.photo,
          organizationId: userData.tid,
        };

      case "facebook":
        return {
          ...baseInfo,
          name: userData.name,
          firstName: userData.first_name,
          lastName: userData.last_name,
          picture: userData.picture?.data?.url,
        };

      case "apple":
        return {
          ...baseInfo,
          name: userData.name ? `${userData.name.firstName} ${userData.name.lastName}` : undefined,
          firstName: userData.name?.firstName,
          lastName: userData.name?.lastName,
        };

      default:
        return baseInfo;
    }
  }

  /**
   * Create or link user account
   */
  private async createOrLinkAccount(provider: SSOProvider, userInfo: SSOUserInfo): Promise<string> {
    // Check if user already exists by email
    const { data: existingUser } = await this.supabase
      .from("users")
      .select("id")
      .eq("email", userInfo.email)
      .single();

    if (existingUser) {
      // Link SSO account to existing user
      await this.linkSSOAccount(existingUser.id, provider.id, userInfo);
      return existingUser.id;
    }

    // Create new user account
    const { data: newUser, error } = await this.supabase
      .from("users")
      .insert({
        email: userInfo.email,
        email_verified: userInfo.emailVerified,
        name: userInfo.name,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        avatar_url: userInfo.picture,
        locale: userInfo.locale,
        created_via_sso: true,
        sso_provider: provider.id,
      })
      .select("id")
      .single();

    if (error) {
      throw this.createError("ACCOUNT_LINKING_FAILED", `Failed to create user: ${error.message}`);
    }

    // Link SSO account
    await this.linkSSOAccount(newUser.id, provider.id, userInfo);

    return newUser.id;
  }

  /**
   * Link SSO account to user
   */
  private async linkSSOAccount(
    userId: string,
    providerId: string,
    userInfo: SSOUserInfo,
  ): Promise<void> {
    const linking: Omit<SSOAccountLinking, "id"> = {
      userId,
      providerId,
      providerUserId: userInfo.id,
      email: userInfo.email,
      linkedAt: new Date(),
      linkingMethod: "automatic",
      verified: userInfo.emailVerified,
      primary: true,
    };

    const { error } = await this.supabase.from("sso_account_links").upsert(linking, {
      onConflict: "user_id,provider_id",
    });

    if (error) {
      throw this.createError("ACCOUNT_LINKING_FAILED", `Failed to link account: ${error.message}`);
    }

    await this.logAudit({
      userId,
      providerId,
      action: "sso_account_link",
      details: { email: userInfo.email, method: "automatic" },
      success: true,
    });
  }

  /**
   * Create SSO session
   */
  private async createSSOSession(
    sessionData: Omit<SSOSession, "id" | "createdAt" | "lastUsedAt">,
  ): Promise<SSOSession> {
    const session: Omit<SSOSession, "id"> = {
      ...sessionData,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    const { data, error } = await this.supabase
      .from("sso_sessions")
      .insert(session)
      .select()
      .single();

    if (error) {
      throw this.createError("PROVIDER_ERROR", `Failed to create session: ${error.message}`);
    }

    return data;
  }

  /**
   * Refresh SSO token
   */
  async refreshToken(sessionId: string): Promise<SSOSession> {
    const { data: session, error } = await this.supabase
      .from("sso_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      throw this.createError("TOKEN_INVALID", "Session not found");
    }

    if (!session.refreshToken) {
      throw this.createError("TOKEN_INVALID", "No refresh token available");
    }

    const provider = this.providers.get(session.providerId);
    if (!provider) {
      throw this.createError("PROVIDER_NOT_FOUND", `Provider ${session.providerId} not found`);
    }

    try {
      const tokenResponse = await this.refreshAccessToken(provider, session.refreshToken);

      const updatedSession = {
        ...session,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || session.refreshToken,
        expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000),
        lastUsedAt: new Date(),
      };

      const { data, error: updateError } = await this.supabase
        .from("sso_sessions")
        .update(updatedSession)
        .eq("id", sessionId)
        .select()
        .single();

      if (updateError) {
        throw this.createError(
          "PROVIDER_ERROR",
          `Failed to update session: ${updateError.message}`,
        );
      }

      await this.logAudit({
        userId: session.userId,
        providerId: session.providerId,
        action: "sso_token_refresh",
        details: { sessionId },
        success: true,
      });

      return data;
    } catch (error) {
      await this.logAudit({
        userId: session.userId,
        providerId: session.providerId,
        action: "sso_token_refresh",
        details: { sessionId, error: error.message },
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(
    provider: SSOProvider,
    refreshToken: string,
  ): Promise<SSOTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: provider.config.clientId,
      client_secret: provider.config.clientSecret || "",
      refresh_token: refreshToken,
    });

    const response = await fetch(provider.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw this.createError("TOKEN_EXPIRED", `Token refresh failed: ${errorData}`);
    }

    const tokenData = await response.json();

    return {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type || "Bearer",
      expiresIn: tokenData.expires_in || 3600,
      refreshToken: tokenData.refresh_token,
      scope: tokenData.scope,
    };
  }

  /**
   * Logout from SSO session
   */
  async logout(sessionId: string): Promise<void> {
    const { data: session, error } = await this.supabase
      .from("sso_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return; // Session already doesn't exist
    }

    // Delete session
    await this.supabase.from("sso_sessions").delete().eq("id", sessionId);

    await this.logAudit({
      userId: session.userId,
      providerId: session.providerId,
      action: "sso_logout",
      details: { sessionId },
      success: true,
    });
  }

  /**
   * Get domain-based SSO provider
   */
  getDomainProvider(email: string): SSOProvider | null {
    const domain = email.split("@")[1];
    if (!domain) return null;

    const domainMapping = this.config.domainMappings.find(
      (mapping) => mapping.domain === domain && mapping.autoRedirect,
    );

    if (!domainMapping) return null;

    return this.providers.get(domainMapping.providerId) || null;
  }

  /**
   * Validate SSO session
   */
  async validateSession(sessionId: string): Promise<SSOSession | null> {
    const { data: session, error } = await this.supabase
      .from("sso_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return null;
    }

    // Check if token is expired
    if (new Date() > new Date(session.expiresAt)) {
      // Try to refresh token
      try {
        return await this.refreshToken(sessionId);
      } catch {
        // Delete expired session
        await this.supabase.from("sso_sessions").delete().eq("id", sessionId);
        return null;
      }
    }

    // Update last used timestamp
    await this.supabase.from("sso_sessions").update({ lastUsedAt: new Date() }).eq("id", sessionId);

    return session;
  }

  /**
   * Store auth request for validation
   */
  private async storeAuthRequest(request: SSOAuthRequest): Promise<void> {
    // Store in cache/database with expiration
    // Implementation depends on your caching strategy
    logger.info("Auth request stored", { state: request.state, providerId: request.providerId });
  }

  /**
   * Get stored auth request
   */
  private async getAuthRequest(state: string): Promise<SSOAuthRequest | null> {
    // Retrieve from cache/database
    // Implementation depends on your caching strategy
    logger.info("Auth request retrieved", { state });
    return null; // Placeholder
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  /**
   * Log audit event
   */
  private async logAudit(
    auditData: Omit<SSOAuditLog, "id" | "timestamp" | "ipAddress" | "userAgent">,
  ): Promise<void> {
    const audit: Omit<SSOAuditLog, "id"> = {
      ...auditData,
      timestamp: new Date(),
      ipAddress: "0.0.0.0", // Should be passed from request context
      userAgent: "Unknown", // Should be passed from request context
    };

    await this.supabase.from("sso_audit_logs").insert(audit);
  }

  /**
   * Create SSO error
   */
  private createError(
    code: SSOErrorCode,
    message: string,
    details?: Record<string, any>,
  ): SSOError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  /**
   * Get available SSO providers
   */
  getAvailableProviders(): SSOProvider[] {
    return Array.from(this.providers.values()).filter((provider) => provider.enabled);
  }

  /**
   * Get SSO configuration
   */
  getConfiguration(): SSOConfiguration {
    return this.config;
  }

  /**
   * Update SSO configuration
   */
  async updateConfiguration(config: Partial<SSOConfiguration>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.providers.clear();
    this.initializeProviders();

    await this.logAudit({
      providerId: "system",
      action: "sso_provider_config_change",
      details: { changes: config },
      success: true,
    });
  }
}

// Export singleton instance
export const ssoManager = new SSOManager(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
