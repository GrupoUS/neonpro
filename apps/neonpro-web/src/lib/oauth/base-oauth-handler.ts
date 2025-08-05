import type { createClient } from "@/lib/supabase/server";
import type { TokenEncryptionService } from "./token-encryption";
import type {
  EncryptedTokenData,
  IOAuthHandler,
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  OAuthUserProfile,
  SocialMediaPlatform,
} from "./types";

/**
 * Base OAuth Handler for NeonPro Social Media Integration
 * Implements common OAuth 2.0 patterns with security best practices
 * Research-backed implementation from Meta Graph API documentation
 */

export abstract class BaseOAuthHandler implements IOAuthHandler {
  protected config: OAuthConfig;
  protected platform: SocialMediaPlatform;

  constructor(config: OAuthConfig, platform: SocialMediaPlatform) {
    this.config = config;
    this.platform = platform;
    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ["clientId", "clientSecret", "redirectUri", "authUrl", "tokenUrl"];
    for (const field of required) {
      if (!this.config[field as keyof OAuthConfig]) {
        throw new Error(`OAuth configuration missing required field: ${field}`);
      }
    }
  }

  /**
   * Generate OAuth authorization URL with state parameter for CSRF protection
   */
  abstract getAuthorizationUrl(state: OAuthState): string;

  /**
   * Exchange authorization code for access tokens
   */
  abstract exchangeCodeForTokens(code: string, state: string): Promise<OAuthTokens>;

  /**
   * Refresh expired access tokens
   */
  abstract refreshTokens(refreshToken: string): Promise<OAuthTokens>;

  /**
   * Get user profile information
   */
  abstract getUserProfile(accessToken: string): Promise<OAuthUserProfile>;

  /**
   * Validate if tokens are still valid
   */
  abstract validateTokens(tokens: OAuthTokens): Promise<boolean>;

  /**
   * Revoke access tokens
   */
  abstract revokeTokens(accessToken: string): Promise<boolean>;

  /**
   * Store OAuth state in database for CSRF protection
   */
  protected async storeOAuthState(state: OAuthState): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("oauth_states").insert({
      state_id: state.nonce,
      user_id: state.userId,
      clinic_id: state.clinicId,
      platform: state.platform,
      created_at: state.createdAt.toISOString(),
      redirect_to: state.redirectTo,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    if (error) {
      throw new Error(`Failed to store OAuth state: ${error.message}`);
    }
  }

  /**
   * Validate and retrieve OAuth state from database
   */
  protected async validateOAuthState(stateId: string): Promise<OAuthState | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state_id", stateId)
      .eq("platform", this.platform)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Delete the used state to prevent replay attacks
    await supabase.from("oauth_states").delete().eq("state_id", stateId);

    return {
      userId: data.user_id,
      clinicId: data.clinic_id,
      platform: data.platform,
      nonce: data.state_id,
      createdAt: new Date(data.created_at),
      redirectTo: data.redirect_to,
    };
  }

  /**
   * Store encrypted tokens in database
   */
  protected async storeTokens(
    userId: string,
    clinicId: string,
    tokens: OAuthTokens,
    profile: OAuthUserProfile,
  ): Promise<string> {
    const supabase = await createClient();

    // Encrypt tokens
    const encryptedAccessToken = TokenEncryptionService.encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken
      ? TokenEncryptionService.encryptToken(tokens.refreshToken)
      : null;

    const accountData = {
      user_id: userId,
      clinic_id: clinicId,
      platform_id: this.platform,
      platform_user_id: profile.id,
      platform_username: profile.username || profile.name,
      platform_name: profile.name,
      profile_picture_url: profile.profilePicture,
      follower_count: profile.followerCount || 0,
      is_verified: profile.isVerified || false,
      encrypted_access_token: JSON.stringify(encryptedAccessToken),
      encrypted_refresh_token: encryptedRefreshToken ? JSON.stringify(encryptedRefreshToken) : null,
      token_expires_at: tokens.expiresAt.toISOString(),
      token_scopes: tokens.scope ? tokens.scope.split(" ") : this.config.scopes,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("social_media_accounts")
      .upsert(accountData, {
        onConflict: "user_id,platform_id,platform_user_id",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to store social media account: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Retrieve and decrypt tokens from database
   */
  protected async getStoredTokens(accountId: string): Promise<OAuthTokens | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("social_media_accounts")
      .select("encrypted_access_token, encrypted_refresh_token, token_expires_at, token_scopes")
      .eq("id", accountId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    try {
      const accessTokenData = JSON.parse(data.encrypted_access_token);
      const accessToken = TokenEncryptionService.decryptToken(accessTokenData);

      let refreshToken: string | undefined;
      if (data.encrypted_refresh_token) {
        const refreshTokenData = JSON.parse(data.encrypted_refresh_token);
        refreshToken = TokenEncryptionService.decryptToken(refreshTokenData);
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: new Date(data.token_expires_at),
        expiresIn: Math.floor((new Date(data.token_expires_at).getTime() - Date.now()) / 1000),
        tokenType: "Bearer",
        scope: data.token_scopes?.join(" "),
      };
    } catch (error) {
      throw new Error(
        `Failed to decrypt tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if tokens need refresh (within 24 hours of expiry)
   */
  protected shouldRefreshTokens(tokens: OAuthTokens): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return tokens.expiresAt.getTime() - Date.now() < twentyFourHours;
  }

  /**
   * Clean up expired OAuth states
   */
  protected async cleanupExpiredStates(): Promise<void> {
    const supabase = await createClient();

    await supabase.from("oauth_states").delete().lt("expires_at", new Date().toISOString());
  }
}
