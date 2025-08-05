// Google OAuth Provider Implementation
// Story 1.3: SSO Integration - Google OAuth 2.0

import type { logger } from "@/lib/logger";
import type { SSOProvider, SSOTokenResponse, SSOUserInfo } from "@/types/sso";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  hostedDomain?: string; // For Google Workspace domains
  accessType?: "online" | "offline";
  approvalPrompt?: "force" | "auto";
  includeGrantedScopes?: boolean;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  hd?: string; // Hosted domain for Google Workspace
}

export interface GoogleTokenInfo {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export class GoogleOAuthProvider {
  private config: GoogleOAuthConfig;
  private readonly authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  private readonly tokenUrl = "https://oauth2.googleapis.com/token";
  private readonly userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
  private readonly revokeUrl = "https://oauth2.googleapis.com/revoke";

  constructor(config: GoogleOAuthConfig) {
    this.config = {
      scopes: ["openid", "email", "profile"],
      accessType: "offline",
      approvalPrompt: "auto",
      includeGrantedScopes: true,
      ...config,
    };
    this.validateConfig();
  }

  /**
   * Validate Google OAuth configuration
   */
  private validateConfig(): void {
    if (!this.config.clientId) {
      throw new Error("Google OAuth: Client ID is required");
    }
    if (!this.config.clientSecret) {
      throw new Error("Google OAuth: Client Secret is required");
    }
    if (!this.config.redirectUri) {
      throw new Error("Google OAuth: Redirect URI is required");
    }
  }

  /**
   * Generate Google OAuth authorization URL
   */
  generateAuthUrl(options: {
    state: string;
    nonce?: string;
    loginHint?: string;
    prompt?: "none" | "consent" | "select_account";
  }): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      redirect_uri: this.config.redirectUri,
      state: options.state,
      access_type: this.config.accessType,
      include_granted_scopes: this.config.includeGrantedScopes.toString(),
    });

    // Optional parameters
    if (options.nonce) {
      params.append("nonce", options.nonce);
    }
    if (options.loginHint) {
      params.append("login_hint", options.loginHint);
    }
    if (options.prompt) {
      params.append("prompt", options.prompt);
    }
    if (this.config.hostedDomain) {
      params.append("hd", this.config.hostedDomain);
    }
    if (this.config.approvalPrompt === "force") {
      params.append("approval_prompt", "force");
    }

    const authUrl = `${this.authUrl}?${params.toString()}`;
    logger.info("Google OAuth: Generated auth URL", {
      clientId: this.config.clientId,
      scopes: this.config.scopes,
      hostedDomain: this.config.hostedDomain,
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForTokens(code: string): Promise<SSOTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: this.config.redirectUri,
    });

    try {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error("Google OAuth: Token exchange failed", {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Google OAuth token exchange failed: ${errorData}`);
      }

      const tokenData: GoogleTokenInfo = await response.json();

      logger.info("Google OAuth: Token exchange successful", {
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      });

      return {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        scope: tokenData.scope,
      };
    } catch (error) {
      logger.error("Google OAuth: Token exchange error", { error: error.message });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<SSOTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    try {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error("Google OAuth: Token refresh failed", {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Google OAuth token refresh failed: ${errorData}`);
      }

      const tokenData: GoogleTokenInfo = await response.json();

      logger.info("Google OAuth: Token refresh successful", {
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      });

      return {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        refreshToken: tokenData.refresh_token || refreshToken, // Google may not return new refresh token
        scope: tokenData.scope,
      };
    } catch (error) {
      logger.error("Google OAuth: Token refresh error", { error: error.message });
      throw error;
    }
  }

  /**
   * Get user information from Google
   */
  async getUserInfo(accessToken: string): Promise<SSOUserInfo> {
    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error("Google OAuth: User info fetch failed", {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Google OAuth user info fetch failed: ${errorData}`);
      }

      const userData: GoogleUserInfo = await response.json();

      // Validate hosted domain if configured
      if (this.config.hostedDomain && userData.hd !== this.config.hostedDomain) {
        logger.warn("Google OAuth: User not from expected hosted domain", {
          expected: this.config.hostedDomain,
          actual: userData.hd,
          email: userData.email,
        });
        throw new Error(`User must be from ${this.config.hostedDomain} domain`);
      }

      logger.info("Google OAuth: User info retrieved", {
        email: userData.email,
        verified: userData.verified_email,
        hostedDomain: userData.hd,
      });

      return {
        id: userData.id,
        email: userData.email,
        emailVerified: userData.verified_email,
        name: userData.name,
        firstName: userData.given_name,
        lastName: userData.family_name,
        picture: userData.picture,
        locale: userData.locale,
        organizationId: userData.hd, // Hosted domain as organization ID
      };
    } catch (error) {
      logger.error("Google OAuth: User info error", { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke Google OAuth token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.revokeUrl}?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error("Google OAuth: Token revocation failed", {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Google OAuth token revocation failed: ${errorData}`);
      }

      logger.info("Google OAuth: Token revoked successfully");
    } catch (error) {
      logger.error("Google OAuth: Token revocation error", { error: error.message });
      throw error;
    }
  }

  /**
   * Validate ID token (JWT)
   */
  async validateIdToken(idToken: string): Promise<any> {
    try {
      // For production, use Google's token validation endpoint
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

      if (!response.ok) {
        throw new Error("Invalid ID token");
      }

      const tokenInfo = await response.json();

      // Validate audience (client ID)
      if (tokenInfo.aud !== this.config.clientId) {
        throw new Error("ID token audience mismatch");
      }

      // Validate issuer
      if (!["accounts.google.com", "https://accounts.google.com"].includes(tokenInfo.iss)) {
        throw new Error("ID token issuer mismatch");
      }

      // Validate expiration
      if (Date.now() >= tokenInfo.exp * 1000) {
        throw new Error("ID token expired");
      }

      logger.info("Google OAuth: ID token validated", {
        subject: tokenInfo.sub,
        email: tokenInfo.email,
        emailVerified: tokenInfo.email_verified,
      });

      return tokenInfo;
    } catch (error) {
      logger.error("Google OAuth: ID token validation error", { error: error.message });
      throw error;
    }
  }

  /**
   * Get provider configuration as SSOProvider
   */
  getProviderConfig(): SSOProvider {
    return {
      id: "google",
      name: "Google",
      type: "oauth2",
      enabled: true,
      config: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        authUrl: this.authUrl,
        tokenUrl: this.tokenUrl,
        userInfoUrl: this.userInfoUrl,
        redirectUri: this.config.redirectUri,
        scopes: this.config.scopes,
      },
      metadata: {
        displayName: "Google",
        description: "Sign in with your Google account",
        iconUrl: "https://developers.google.com/identity/images/g-logo.png",
        buttonColor: "#4285f4",
        textColor: "#ffffff",
        supportedFeatures: [
          "oauth2",
          "openid_connect",
          "refresh_tokens",
          "hosted_domains",
          "id_tokens",
        ],
        documentation: "https://developers.google.com/identity/protocols/oauth2",
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GoogleOAuthConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfig();
    logger.info("Google OAuth: Configuration updated");
  }

  /**
   * Get current configuration
   */
  getConfig(): GoogleOAuthConfig {
    return { ...this.config };
  }
}

// Export factory function
export function createGoogleOAuthProvider(config: GoogleOAuthConfig): GoogleOAuthProvider {
  return new GoogleOAuthProvider(config);
}

// Export default configuration
export const DEFAULT_GOOGLE_SCOPES = ["openid", "email", "profile"];

export const GOOGLE_WORKSPACE_SCOPES = [
  ...DEFAULT_GOOGLE_SCOPES,
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
  "https://www.googleapis.com/auth/admin.directory.group.readonly",
];
