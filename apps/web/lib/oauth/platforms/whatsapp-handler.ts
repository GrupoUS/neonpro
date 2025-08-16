import { logger } from '@/lib/logger';
import { BaseOAuthHandler } from '../base-oauth-handler';
import type { EncryptedToken } from '../token-encryption';
import type { OAuthProviderConfig, OAuthTokenResponse } from '../types';

export class WhatsAppOAuthHandler extends BaseOAuthHandler {
  protected readonly config: OAuthProviderConfig;

  constructor() {
    super();
    this.config = {
      provider: 'whatsapp',
      clientId: process.env.WHATSAPP_CLIENT_ID || '',
      clientSecret: process.env.WHATSAPP_CLIENT_SECRET || '',
      redirectUri: process.env.WHATSAPP_REDIRECT_URI || '',
      scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
      authorizationUrl: 'https://developers.facebook.com/oauth/authorization',
      tokenUrl: 'https://graph.facebook.com/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me',
      revokeUrl: 'https://graph.facebook.com/oauth/revoke',
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields = ['clientId', 'clientSecret', 'redirectUri'];
    const missing = requiredFields.filter((field) => !this.config[field]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required WhatsApp OAuth configuration: ${missing.join(', ')}`,
      );
    }
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scopes.join(','),
        response_type: 'code',
        state,
        access_type: 'offline',
        approval_prompt: 'force',
      });

      const authUrl = `${this.config.authorizationUrl}?${params.toString()}`;

      logger.info('Generated WhatsApp authorization URL', {
        provider: 'whatsapp',
        state,
        scopes: this.config.scopes,
      });

      return authUrl;
    } catch (error) {
      logger.error('Failed to generate WhatsApp authorization URL', { error });
      throw new Error('Unable to generate authorization URL');
    }
  }

  async exchangeCodeForTokens(
    code: string,
    _state: string,
  ): Promise<EncryptedToken> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'NeonPro/1.0',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('WhatsApp token exchange failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `Token exchange failed: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData: OAuthTokenResponse = await response.json();

      // WhatsApp Business API tokens are long-lived by default
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

      const encryptedToken = await this.encryptToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        scopes: this.config.scopes,
        tokenType: tokenData.token_type || 'Bearer',
      });

      logger.info('WhatsApp token exchange successful', {
        provider: 'whatsapp',
        hasRefreshToken: Boolean(tokenData.refresh_token),
        expiresAt,
      });

      return encryptedToken;
    } catch (error) {
      logger.error('WhatsApp token exchange error', { error });
      throw error instanceof Error ? error : new Error('Token exchange failed');
    }
  }

  async refreshToken(encryptedRefreshToken: string): Promise<EncryptedToken> {
    try {
      const refreshToken = await this.decryptToken(encryptedRefreshToken);

      if (!refreshToken.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'NeonPro/1.0',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('WhatsApp token refresh failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `Token refresh failed: ${response.status} ${response.statusText}`,
        );
      }

      const tokenData: OAuthTokenResponse = await response.json();

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

      const encryptedToken = await this.encryptToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken.refreshToken,
        expiresAt,
        scopes: this.config.scopes,
        tokenType: tokenData.token_type || 'Bearer',
      });

      logger.info('WhatsApp token refresh successful', {
        provider: 'whatsapp',
        expiresAt,
      });

      return encryptedToken;
    } catch (error) {
      logger.error('WhatsApp token refresh error', { error });
      throw error instanceof Error ? error : new Error('Token refresh failed');
    }
  }

  async revokeToken(encryptedToken: string): Promise<void> {
    try {
      const token = await this.decryptToken(encryptedToken);

      // Revoke access token
      await fetch(this.config.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'NeonPro/1.0',
        },
        body: new URLSearchParams({
          token: token.accessToken,
        }),
      });

      // Revoke refresh token if available
      if (token.refreshToken) {
        await fetch(this.config.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            'User-Agent': 'NeonPro/1.0',
          },
          body: new URLSearchParams({
            token: token.refreshToken,
          }),
        });
      }

      logger.info('WhatsApp token revocation successful', {
        provider: 'whatsapp',
      });
    } catch (error) {
      logger.error('WhatsApp token revocation error', { error });
      throw error instanceof Error
        ? error
        : new Error('Token revocation failed');
    }
  }

  async getUserInfo(encryptedToken: string): Promise<any> {
    try {
      const token = await this.decryptToken(encryptedToken);

      const response = await fetch(
        `${this.config.userInfoUrl}?fields=id,name,email&access_token=${token.accessToken}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NeonPro/1.0',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('WhatsApp user info fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `User info fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const userInfo = await response.json();

      logger.info('WhatsApp user info fetch successful', {
        provider: 'whatsapp',
        userId: userInfo.id,
      });

      return userInfo;
    } catch (error) {
      logger.error('WhatsApp user info fetch error', { error });
      throw error instanceof Error
        ? error
        : new Error('User info fetch failed');
    }
  }

  async validateToken(encryptedToken: string): Promise<boolean> {
    try {
      const token = await this.decryptToken(encryptedToken);

      // Check if token is expired
      if (token.expiresAt && new Date() > token.expiresAt) {
        logger.warn('WhatsApp token is expired', {
          provider: 'whatsapp',
          expiresAt: token.expiresAt,
        });
        return false;
      }

      // Validate token by making a test API call
      const response = await fetch(
        `${this.config.userInfoUrl}?access_token=${token.accessToken}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NeonPro/1.0',
          },
        },
      );

      const isValid = response.ok;

      logger.info('WhatsApp token validation completed', {
        provider: 'whatsapp',
        isValid,
        status: response.status,
      });

      return isValid;
    } catch (error) {
      logger.error('WhatsApp token validation error', { error });
      return false;
    }
  }

  async getBusinessAccounts(encryptedToken: string): Promise<any[]> {
    try {
      const token = await this.decryptToken(encryptedToken);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/businesses?access_token=${token.accessToken}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NeonPro/1.0',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('WhatsApp business accounts fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          `Business accounts fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      logger.info('WhatsApp business accounts fetch successful', {
        provider: 'whatsapp',
        accountCount: data.data?.length || 0,
      });

      return data.data || [];
    } catch (error) {
      logger.error('WhatsApp business accounts fetch error', { error });
      throw error instanceof Error
        ? error
        : new Error('Business accounts fetch failed');
    }
  }

  async getPhoneNumbers(
    encryptedToken: string,
    businessId: string,
  ): Promise<any[]> {
    try {
      const token = await this.decryptToken(encryptedToken);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${businessId}/phone_numbers?access_token=${token.accessToken}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NeonPro/1.0',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('WhatsApp phone numbers fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          businessId,
        });
        throw new Error(
          `Phone numbers fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      logger.info('WhatsApp phone numbers fetch successful', {
        provider: 'whatsapp',
        businessId,
        phoneNumberCount: data.data?.length || 0,
      });

      return data.data || [];
    } catch (error) {
      logger.error('WhatsApp phone numbers fetch error', { error, businessId });
      throw error instanceof Error
        ? error
        : new Error('Phone numbers fetch failed');
    }
  }
}
