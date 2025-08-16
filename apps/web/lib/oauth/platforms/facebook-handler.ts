import axios from 'axios';
import { BaseOAuthHandler } from '../base-oauth-handler';
import type {
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  OAuthUserProfile,
} from '../types';

/**
 * Facebook Graph API OAuth Handler for NeonPro
 * Implementa o fluxo OAuth 2.0 do Facebook com melhores práticas
 * Baseado na documentação oficial do Meta Developer e research-backed patterns
 *
 * Features:
 * - OAuth 2.0 authorization code flow
 * - Long-lived token management (60-day tokens)
 * - Facebook Pages access for business accounts
 * - Comprehensive error handling
 * - CSRF protection with state parameter
 * - Token encryption and secure storage
 */
export class FacebookOAuthHandler extends BaseOAuthHandler {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirectUri:
        process.env.FACEBOOK_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/facebook/callback`,
      scopes: [
        'public_profile',
        'email',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'business_management',
        'read_insights',
      ],
      authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
      apiBaseUrl: 'https://graph.facebook.com/v19.0',
    };

    super(config, 'facebook');
    this.validateFacebookConfig();
  }

  private validateFacebookConfig(): void {
    if (!process.env.FACEBOOK_CLIENT_ID) {
      throw new Error('FACEBOOK_CLIENT_ID environment variable is required');
    }
    if (!process.env.FACEBOOK_CLIENT_SECRET) {
      throw new Error(
        'FACEBOOK_CLIENT_SECRET environment variable is required'
      );
    }
    if (
      !(process.env.FACEBOOK_REDIRECT_URI || process.env.NEXT_PUBLIC_APP_URL)
    ) {
      throw new Error(
        'FACEBOOK_REDIRECT_URI or NEXT_PUBLIC_APP_URL environment variable is required'
      );
    }
  }

  /**
   * Generate Facebook OAuth authorization URL with state for CSRF protection
   * @param state OAuth state object containing user and clinic information
   * @returns Complete authorization URL for redirect
   */
  getAuthorizationUrl(state: OAuthState): string {
    this.storeOAuthState(state);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      state: state.nonce,
      auth_type: 'rerequest', // Force permission re-request for updated scopes
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Facebook access tokens
   * Facebook provides long-lived tokens by default for server-side flows
   * @param code Authorization code from Facebook callback
   * @param stateParam State parameter for CSRF validation
   * @returns OAuth tokens including long-lived access token
   */
  async exchangeCodeForTokens(
    code: string,
    stateParam: string
  ): Promise<OAuthTokens> {
    // Validate state to prevent CSRF attacks
    const state = await this.validateOAuthState(stateParam);
    if (!state) {
      throw new Error('Invalid or expired OAuth state');
    }

    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      });

      const response = await axios.get(
        `${this.config.tokenUrl}?${params.toString()}`
      );

      if (!response.data.access_token) {
        throw new Error('No access token received from Facebook');
      }

      // Facebook server-side tokens are long-lived by default (60 days)
      const expiresIn = response.data.expires_in || 5_184_000; // 60 days default

      return {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        scope: this.config.scopes.join(' '),
      };
    } catch (error) {
      throw new Error(
        `Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Refresh Facebook access tokens using token exchange
   * Facebook uses fb_exchange_token instead of traditional refresh tokens
   * @param refreshToken Current access token to exchange for new long-lived token
   * @returns New OAuth tokens with extended expiration
   */
  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    try {
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        fb_exchange_token: refreshToken,
      });

      const response = await axios.get(
        `${this.config.tokenUrl}?${params.toString()}`
      );

      if (!response.data.access_token) {
        throw new Error('No refreshed token received from Facebook');
      }

      const expiresIn = response.data.expires_in || 5_184_000; // 60 days default

      return {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type || 'Bearer',
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        scope: this.config.scopes.join(' '),
      };
    } catch (error) {
      throw new Error(
        `Failed to refresh Facebook tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Facebook user profile information including pages access
   * @param accessToken Valid Facebook access token
   * @returns User profile with Facebook-specific data
   */
  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    try {
      // Get basic user information
      const userResponse = await axios.get(`${this.config.apiBaseUrl}/me`, {
        params: {
          fields: 'id,name,email,picture.type(large)',
          access_token: accessToken,
        },
      });

      const userData = userResponse.data;

      // Get user's Facebook pages (for business account management)
      let pageCount = 0;
      try {
        const pagesResponse = await axios.get(
          `${this.config.apiBaseUrl}/me/accounts`,
          {
            params: {
              access_token: accessToken,
            },
          }
        );
        pageCount = pagesResponse.data.data?.length || 0;
      } catch (_error) {}

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture?.data?.url,
        isVerified: false, // Facebook Graph API doesn't provide verification status for regular users
        followerCount: pageCount, // Use page count as a proxy for business capabilities
      };
    } catch (error) {
      throw new Error(
        `Failed to get Facebook user profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate if Facebook tokens are still active
   * @param tokens OAuth tokens to validate
   * @returns True if tokens are valid and active
   */
  async validateTokens(tokens: OAuthTokens): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.apiBaseUrl}/me`, {
        params: {
          access_token: tokens.accessToken,
        },
      });

      return response.status === 200 && response.data.id;
    } catch {
      return false;
    }
  }

  /**
   * Revoke Facebook access tokens
   * @param accessToken Access token to revoke
   * @returns True if revocation was successful
   */
  async revokeTokens(accessToken: string): Promise<boolean> {
    try {
      // First get user ID
      const userResponse = await axios.get(`${this.config.apiBaseUrl}/me`, {
        params: {
          access_token: accessToken,
        },
      });

      if (!userResponse.data.id) {
        return false;
      }

      // Revoke all permissions for the application
      const revokeResponse = await axios.delete(
        `${this.config.apiBaseUrl}/${userResponse.data.id}/permissions`,
        {
          params: {
            access_token: accessToken,
          },
        }
      );

      return revokeResponse.status === 200;
    } catch (_error) {
      return false;
    }
  }
}
