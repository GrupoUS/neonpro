import { BaseOAuthHandler } from '../base-oauth-handler';
import { OAuthProviderConfig, OAuthTokenResponse } from '../types.js';
import { EncryptedToken } from '../token-encryption.js';
import { logger } from '@/lib/logger';

export class HubSpotOAuthHandler extends BaseOAuthHandler {
  protected readonly config: OAuthProviderConfig;

  constructor() {
    super();
    this.config = {
      provider: 'hubspot',
      clientId: process.env.HUBSPOT_CLIENT_ID || '',
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
      redirectUri: process.env.HUBSPOT_REDIRECT_URI || '',
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
        'marketing-events.read',
        'marketing-events.write',
        'automation.read',
        'forms.read',
        'oauth.read'
      ],
      authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      userInfoUrl: 'https://api.hubapi.com/oauth/v1/access-tokens',
      revokeUrl: 'https://api.hubapi.com/oauth/v1/refresh-tokens'
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields = ['clientId', 'clientSecret', 'redirectUri'];
    const missing = requiredFields.filter(field => !this.config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required HubSpot OAuth configuration: ${missing.join(', ')}`);
    }
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scopes.join(' '),
        response_type: 'code',
        state,
        access_type: 'offline'
      });

      const authUrl = `${this.config.authorizationUrl}?${params.toString()}`;
      
      Logger.info('Generated HubSpot authorization URL', {
        provider: 'hubspot',
        state,
        scopes: this.config.scopes
      });

      return authUrl;
    } catch (error) {
      Logger.error('Failed to generate HubSpot authorization URL', { error });
      throw new Error('Unable to generate authorization URL');
    }
  }

  async exchangeCodeForTokens(code: string, state: string): Promise<EncryptedToken> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        Logger.error('HubSpot token exchange failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: OAuthTokenResponse = await response.json();
      
      // HubSpot tokens typically expire in 30 minutes
      const expiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : new Date(Date.now() + 30 * 60 * 1000); // 30 minutes default

      const encryptedToken = await this.encryptToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        scopes: this.config.scopes,
        tokenType: tokenData.token_type || 'Bearer'
      });

      Logger.info('HubSpot token exchange successful', {
        provider: 'hubspot',
        hasRefreshToken: !!tokenData.refresh_token,
        expiresAt
      });

      return encryptedToken;
    } catch (error) {
      Logger.error('HubSpot token exchange error', { error });
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
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        Logger.error('HubSpot token refresh failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: OAuthTokenResponse = await response.json();
      
      const expiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : new Date(Date.now() + 30 * 60 * 1000); // 30 minutes default

      const encryptedToken = await this.encryptToken({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken.refreshToken,
        expiresAt,
        scopes: this.config.scopes,
        tokenType: tokenData.token_type || 'Bearer'
      });

      Logger.info('HubSpot token refresh successful', {
        provider: 'hubspot',
        expiresAt
      });

      return encryptedToken;
    } catch (error) {
      Logger.error('HubSpot token refresh error', { error });
      throw error instanceof Error ? error : new Error('Token refresh failed');
    }
  }

  async revokeToken(encryptedToken: string): Promise<void> {
    try {
      const token = await this.decryptToken(encryptedToken);
      
      // Revoke refresh token if available
      if (token.refreshToken) {
        await fetch(`${this.config.revokeUrl}/${token.refreshToken}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NeonPro/1.0'
          }
        });
      }

      Logger.info('HubSpot token revocation successful', {
        provider: 'hubspot'
      });
    } catch (error) {
      Logger.error('HubSpot token revocation error', { error });
      throw error instanceof Error ? error : new Error('Token revocation failed');
    }
  }

  async getUserInfo(encryptedToken: string): Promise<any> {
    try {
      const token = await this.decryptToken(encryptedToken);
      
      const response = await fetch(`${this.config.userInfoUrl}/${token.accessToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        Logger.error('HubSpot user info fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`User info fetch failed: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();
      
      Logger.info('HubSpot user info fetch successful', {
        provider: 'hubspot',
        userId: userInfo.user_id,
        hubId: userInfo.hub_id
      });

      return userInfo;
    } catch (error) {
      Logger.error('HubSpot user info fetch error', { error });
      throw error instanceof Error ? error : new Error('User info fetch failed');
    }
  }

  async validateToken(encryptedToken: string): Promise<boolean> {
    try {
      const token = await this.decryptToken(encryptedToken);
      
      // Check if token is expired
      if (token.expiresAt && new Date() > token.expiresAt) {
        Logger.warn('HubSpot token is expired', {
          provider: 'hubspot',
          expiresAt: token.expiresAt
        });
        return false;
      }

      // Validate token by making a test API call
      const response = await fetch(`${this.config.userInfoUrl}/${token.accessToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        }
      });

      const isValid = response.ok;
      
      Logger.info('HubSpot token validation completed', {
        provider: 'hubspot',
        isValid,
        status: response.status
      });

      return isValid;
    } catch (error) {
      Logger.error('HubSpot token validation error', { error });
      return false;
    }
  }

  async getPortalInfo(encryptedToken: string): Promise<any> {
    try {
      const token = await this.decryptToken(encryptedToken);
      
      const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        Logger.error('HubSpot portal info fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Portal info fetch failed: ${response.status} ${response.statusText}`);
      }

      const portalInfo = await response.json();
      
      Logger.info('HubSpot portal info fetch successful', {
        provider: 'hubspot',
        portalId: portalInfo.portalId,
        domain: portalInfo.domain
      });

      return portalInfo;
    } catch (error) {
      Logger.error('HubSpot portal info fetch error', { error });
      throw error instanceof Error ? error : new Error('Portal info fetch failed');
    }
  }

  async getAccountInfo(encryptedToken: string): Promise<any> {
    try {
      const token = await this.decryptToken(encryptedToken);
      
      const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'NeonPro/1.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        Logger.error('HubSpot account info fetch failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Account info fetch failed: ${response.status} ${response.statusText}`);
      }

      const accountInfo = await response.json();
      
      Logger.info('HubSpot account info fetch successful', {
        provider: 'hubspot',
        accountId: accountInfo.portalId,
        currency: accountInfo.currencyCode
      });

      return accountInfo;
    } catch (error) {
      Logger.error('HubSpot account info fetch error', { error });
      throw error instanceof Error ? error : new Error('Account info fetch failed');
    }
  }
}
