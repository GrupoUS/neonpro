import axios from 'axios';
import { BaseOAuthHandler } from '../base-oauth-handler';
import type {
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  OAuthUserProfile,
} from '../types';

/**
 * Instagram Graph API OAuth Handler for NeonPro
 * Implements Instagram-specific OAuth 2.0 flow with best practices
 * Based on official Meta Developer documentation and security standards
 */

export class InstagramOAuthHandler extends BaseOAuthHandler {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
      scopes: ['user_profile', 'user_media'],
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      refreshUrl: 'https://graph.instagram.com/refresh_access_token',
      apiBaseUrl: 'https://graph.instagram.com',
    };

    super(config, 'instagram');
    this.validateInstagramConfig();
  }

  private validateInstagramConfig(): void {
    if (!process.env.INSTAGRAM_CLIENT_ID) {
      throw new Error('INSTAGRAM_CLIENT_ID environment variable is required');
    }
    if (!process.env.INSTAGRAM_CLIENT_SECRET) {
      throw new Error(
        'INSTAGRAM_CLIENT_SECRET environment variable is required',
      );
    }
    if (!process.env.INSTAGRAM_REDIRECT_URI) {
      throw new Error(
        'INSTAGRAM_REDIRECT_URI environment variable is required',
      );
    }
  }

  /**
   * Generate Instagram authorization URL with state for CSRF protection
   */
  getAuthorizationUrl(state: OAuthState): string {
    // Store state for validation
    this.storeOAuthState(state);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      state: state.nonce,
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Instagram access tokens
   * Implements short-lived to long-lived token exchange
   */
  async exchangeCodeForTokens(
    code: string,
    stateParam: string,
  ): Promise<OAuthTokens> {
    try {
      // Validate state parameter
      const state = await this.validateOAuthState(stateParam);
      if (!state) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Step 1: Exchange code for short-lived token
      const shortLivedResponse = await axios.post(
        this.config.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
          code,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (!shortLivedResponse.data.access_token) {
        throw new Error('Failed to receive access token from Instagram');
      }

      // Step 2: Exchange short-lived token for long-lived token
      const longLivedResponse = await axios.get(
        'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: this.config.clientSecret,
            access_token: shortLivedResponse.data.access_token,
          },
        },
      );

      const tokens: OAuthTokens = {
        accessToken: longLivedResponse.data.access_token,
        tokenType: longLivedResponse.data.token_type || 'Bearer',
        expiresIn: longLivedResponse.data.expires_in || 5_184_000, // 60 days default
        expiresAt: new Date(
          Date.now() + (longLivedResponse.data.expires_in || 5_184_000) * 1000,
        ),
        scope: this.config.scopes.join(' '),
      };

      return tokens;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `Instagram token exchange failed: ${errorData?.error_description || error.message}`,
        );
      }
      throw new Error(
        `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Refresh Instagram long-lived access token
   */
  async refreshTokens(accessToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/refresh_access_token',
        {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: accessToken,
          },
        },
      );

      const tokens: OAuthTokens = {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn: response.data.expires_in || 5_184_000, // 60 days default
        expiresAt: new Date(
          Date.now() + (response.data.expires_in || 5_184_000) * 1000,
        ),
        scope: this.config.scopes.join(' '),
      };

      return tokens;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `Instagram token refresh failed: ${errorData?.error?.message || error.message}`,
        );
      }
      throw new Error(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get Instagram user profile information
   */
  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    try {
      const response = await axios.get(`${this.config.apiBaseUrl}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      const profile: OAuthUserProfile = {
        id: response.data.id,
        name: response.data.username,
        username: response.data.username,
        mediaCount: response.data.media_count,
        isVerified:
          response.data.account_type === 'BUSINESS' ||
          response.data.account_type === 'CREATOR',
      };

      return profile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `Instagram profile fetch failed: ${errorData?.error?.message || error.message}`,
        );
      }
      throw new Error(
        `Profile fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Validate Instagram access token
   */
  async validateTokens(tokens: OAuthTokens): Promise<boolean> {
    try {
      await this.getUserProfile(tokens.accessToken);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Revoke Instagram access token
   * Note: Instagram doesn't provide a direct revoke endpoint
   * Users must revoke access through Instagram settings
   */
  async revokeTokens(_accessToken: string): Promise<boolean> {
    // Instagram doesn't provide a programmatic way to revoke tokens
    // The token will expire naturally after 60 days
    // Users can revoke access through Instagram settings manually
    return true;
  }

  /**
   * Get Instagram media for the authenticated user
   */
  async getUserMedia(accessToken: string, limit = 25): Promise<any[]> {
    try {
      const response = await axios.get(`${this.config.apiBaseUrl}/me/media`, {
        params: {
          fields:
            'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          limit,
          access_token: accessToken,
        },
      });

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          `Instagram media fetch failed: ${errorData?.error?.message || error.message}`,
        );
      }
      throw new Error(
        `Media fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get Instagram account insights (Business/Creator accounts only)
   */
  async getAccountInsights(
    accessToken: string,
    period: 'day' | 'week' | 'days_28' = 'day',
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.apiBaseUrl}/me/insights`,
        {
          params: {
            metric: 'impressions,reach,profile_views',
            period,
            access_token: accessToken,
          },
        },
      );

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        // Insights are only available for Business/Creator accounts
        if (errorData?.error?.code === 100) {
          return [];
        }
        throw new Error(
          `Instagram insights fetch failed: ${errorData?.error?.message || error.message}`,
        );
      }
      throw new Error(
        `Insights fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
