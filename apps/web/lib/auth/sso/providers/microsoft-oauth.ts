// Microsoft OAuth Provider Implementation
// Story 1.3: SSO Integration - Microsoft OAuth 2.0 & Azure AD

import { logger } from '@/lib/logger';
import type { SSOProvider, SSOTokenResponse, SSOUserInfo } from '@/types/sso';

export interface MicrosoftOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  tenant?: string; // 'common', 'organizations', 'consumers', or specific tenant ID
  prompt?: 'login' | 'none' | 'consent' | 'select_account';
  domainHint?: string;
  responseMode?: 'query' | 'fragment' | 'form_post';
}

export interface MicrosoftUserInfo {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  mobilePhone?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  jobTitle?: string;
  businessPhones?: string[];
  '@odata.context'?: string;
}

export interface MicrosoftTokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
  ext_expires_in?: number;
}

export interface AzureADUserInfo extends MicrosoftUserInfo {
  onPremisesSamAccountName?: string;
  onPremisesUserPrincipalName?: string;
  employeeId?: string;
  department?: string;
  companyName?: string;
  usageLocation?: string;
}

export class MicrosoftOAuthProvider {
  private config: MicrosoftOAuthConfig;
  private readonly baseUrl = 'https://login.microsoftonline.com';
  private readonly graphUrl = 'https://graph.microsoft.com/v1.0';

  constructor(config: MicrosoftOAuthConfig) {
    this.config = {
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      tenant: 'common',
      responseMode: 'query',
      ...config,
    };
    this.validateConfig();
  }

  /**
   * Validate Microsoft OAuth configuration
   */
  private validateConfig(): void {
    if (!this.config.clientId) {
      throw new Error('Microsoft OAuth: Client ID is required');
    }
    if (!this.config.clientSecret) {
      throw new Error('Microsoft OAuth: Client Secret is required');
    }
    if (!this.config.redirectUri) {
      throw new Error('Microsoft OAuth: Redirect URI is required');
    }
  }

  /**
   * Get tenant-specific URLs
   */
  private getTenantUrls() {
    const tenant = this.config.tenant || 'common';
    return {
      authUrl: `${this.baseUrl}/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `${this.baseUrl}/${tenant}/oauth2/v2.0/token`,
      logoutUrl: `${this.baseUrl}/${tenant}/oauth2/v2.0/logout`,
    };
  }

  /**
   * Generate Microsoft OAuth authorization URL
   */
  generateAuthUrl(options: {
    state: string;
    nonce?: string;
    loginHint?: string;
    prompt?: 'login' | 'none' | 'consent' | 'select_account';
    domainHint?: string;
  }): string {
    const { authUrl } = this.getTenantUrls();

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: this.config.responseMode,
      scope: this.config.scopes.join(' '),
      state: options.state,
    });

    // Optional parameters
    if (options.nonce) {
      params.append('nonce', options.nonce);
    }
    if (options.loginHint) {
      params.append('login_hint', options.loginHint);
    }
    if (options.prompt || this.config.prompt) {
      params.append('prompt', options.prompt || this.config.prompt);
    }
    if (options.domainHint || this.config.domainHint) {
      params.append(
        'domain_hint',
        options.domainHint || this.config.domainHint
      );
    }

    const fullAuthUrl = `${authUrl}?${params.toString()}`;
    logger.info('Microsoft OAuth: Generated auth URL', {
      clientId: this.config.clientId,
      tenant: this.config.tenant,
      scopes: this.config.scopes,
      domainHint: options.domainHint || this.config.domainHint,
    });

    return fullAuthUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForTokens(code: string): Promise<SSOTokenResponse> {
    const { tokenUrl } = this.getTenantUrls();

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Microsoft OAuth: Token exchange failed', {
          status: response.status,
          error: errorData,
          tenant: this.config.tenant,
        });
        throw new Error(`Microsoft OAuth token exchange failed: ${errorData}`);
      }

      const tokenData: MicrosoftTokenInfo = await response.json();

      logger.info('Microsoft OAuth: Token exchange successful', {
        hasRefreshToken: Boolean(tokenData.refresh_token),
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        tenant: this.config.tenant,
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
      logger.error('Microsoft OAuth: Token exchange error', {
        error: error.message,
        tenant: this.config.tenant,
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<SSOTokenResponse> {
    const { tokenUrl } = this.getTenantUrls();

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: this.config.scopes.join(' '),
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Microsoft OAuth: Token refresh failed', {
          status: response.status,
          error: errorData,
          tenant: this.config.tenant,
        });
        throw new Error(`Microsoft OAuth token refresh failed: ${errorData}`);
      }

      const tokenData: MicrosoftTokenInfo = await response.json();

      logger.info('Microsoft OAuth: Token refresh successful', {
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        tenant: this.config.tenant,
      });

      return {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        refreshToken: tokenData.refresh_token || refreshToken,
        scope: tokenData.scope,
      };
    } catch (error) {
      logger.error('Microsoft OAuth: Token refresh error', {
        error: error.message,
        tenant: this.config.tenant,
      });
      throw error;
    }
  }

  /**
   * Get user information from Microsoft Graph
   */
  async getUserInfo(accessToken: string): Promise<SSOUserInfo> {
    try {
      const response = await fetch(`${this.graphUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Microsoft OAuth: User info fetch failed', {
          status: response.status,
          error: errorData,
          tenant: this.config.tenant,
        });
        throw new Error(`Microsoft OAuth user info fetch failed: ${errorData}`);
      }

      const userData: MicrosoftUserInfo = await response.json();

      logger.info('Microsoft OAuth: User info retrieved', {
        userPrincipalName: userData.userPrincipalName,
        mail: userData.mail,
        tenant: this.config.tenant,
      });

      return {
        id: userData.id,
        email: userData.mail || userData.userPrincipalName,
        emailVerified: true, // Microsoft accounts are considered verified
        name: userData.displayName,
        firstName: userData.givenName,
        lastName: userData.surname,
        locale: userData.preferredLanguage,
        organizationId: this.extractTenantId(userData),
      };
    } catch (error) {
      logger.error('Microsoft OAuth: User info error', {
        error: error.message,
        tenant: this.config.tenant,
      });
      throw error;
    }
  }

  /**
   * Get extended user information (Azure AD)
   */
  async getExtendedUserInfo(accessToken: string): Promise<AzureADUserInfo> {
    try {
      const response = await fetch(
        `${this.graphUrl}/me?$select=id,displayName,givenName,surname,userPrincipalName,mail,mobilePhone,officeLocation,preferredLanguage,jobTitle,businessPhones,onPremisesSamAccountName,onPremisesUserPrincipalName,employeeId,department,companyName,usageLocation`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Microsoft OAuth: Extended user info fetch failed', {
          status: response.status,
          error: errorData,
          tenant: this.config.tenant,
        });
        throw new Error(
          `Microsoft OAuth extended user info fetch failed: ${errorData}`
        );
      }

      const userData: AzureADUserInfo = await response.json();

      logger.info('Microsoft OAuth: Extended user info retrieved', {
        userPrincipalName: userData.userPrincipalName,
        department: userData.department,
        jobTitle: userData.jobTitle,
        tenant: this.config.tenant,
      });

      return userData;
    } catch (error) {
      logger.error('Microsoft OAuth: Extended user info error', {
        error: error.message,
        tenant: this.config.tenant,
      });
      throw error;
    }
  }

  /**
   * Get user's organization information
   */
  async getOrganizationInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.graphUrl}/organization`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Microsoft OAuth: Organization info fetch failed', {
          status: response.status,
          error: errorData,
          tenant: this.config.tenant,
        });
        throw new Error(
          `Microsoft OAuth organization info fetch failed: ${errorData}`
        );
      }

      const orgData = await response.json();

      logger.info('Microsoft OAuth: Organization info retrieved', {
        organizationCount: orgData.value?.length || 0,
        tenant: this.config.tenant,
      });

      return orgData.value?.[0] || null;
    } catch (error) {
      logger.error('Microsoft OAuth: Organization info error', {
        error: error.message,
        tenant: this.config.tenant,
      });
      throw error;
    }
  }

  /**
   * Extract tenant ID from user data
   */
  private extractTenantId(userData: MicrosoftUserInfo): string | undefined {
    // Try to extract tenant ID from @odata.context
    if (userData['@odata.context']) {
      const match = userData['@odata.context'].match(/\/([a-f0-9-]{36})\//i);
      if (match) {
        return match[1];
      }
    }

    // Fallback to configured tenant if it's a GUID
    if (this.config.tenant?.match(/^[a-f0-9-]{36}$/i)) {
      return this.config.tenant;
    }

    return;
  }

  /**
   * Revoke Microsoft OAuth token
   */
  async revokeToken(_token: string): Promise<void> {
    // Microsoft doesn't have a standard revoke endpoint
    // Tokens expire automatically, but we can log the revocation attempt
    logger.info('Microsoft OAuth: Token revocation requested', {
      tenant: this.config.tenant,
    });

    // In practice, you would typically just delete the token from your storage
    // and let it expire naturally
  }

  /**
   * Generate logout URL
   */
  generateLogoutUrl(postLogoutRedirectUri?: string): string {
    const { logoutUrl } = this.getTenantUrls();

    const params = new URLSearchParams();
    if (postLogoutRedirectUri) {
      params.append('post_logout_redirect_uri', postLogoutRedirectUri);
    }

    const fullLogoutUrl = params.toString()
      ? `${logoutUrl}?${params.toString()}`
      : logoutUrl;

    logger.info('Microsoft OAuth: Generated logout URL', {
      tenant: this.config.tenant,
      hasRedirect: Boolean(postLogoutRedirectUri),
    });

    return fullLogoutUrl;
  }

  /**
   * Get provider configuration as SSOProvider
   */
  getProviderConfig(): SSOProvider {
    const { authUrl, tokenUrl } = this.getTenantUrls();

    return {
      id: 'microsoft',
      name: 'Microsoft',
      type: 'oauth2',
      enabled: true,
      config: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        authUrl,
        tokenUrl,
        userInfoUrl: `${this.graphUrl}/me`,
        redirectUri: this.config.redirectUri,
        scopes: this.config.scopes,
      },
      metadata: {
        displayName: 'Microsoft',
        description: 'Sign in with your Microsoft account',
        iconUrl:
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.png',
        buttonColor: '#0078d4',
        textColor: '#ffffff',
        supportedFeatures: [
          'oauth2',
          'openid_connect',
          'refresh_tokens',
          'azure_ad',
          'graph_api',
          'organization_info',
        ],
        documentation:
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/',
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MicrosoftOAuthConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfig();
    logger.info('Microsoft OAuth: Configuration updated', {
      tenant: this.config.tenant,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): MicrosoftOAuthConfig {
    return { ...this.config };
  }

  /**
   * Check if tenant is Azure AD (not personal accounts)
   */
  isAzureAD(): boolean {
    return (
      this.config.tenant !== 'consumers' && this.config.tenant !== 'common'
    );
  }

  /**
   * Check if tenant allows personal accounts
   */
  allowsPersonalAccounts(): boolean {
    return (
      this.config.tenant === 'consumers' || this.config.tenant === 'common'
    );
  }
}

// Export factory function
export function createMicrosoftOAuthProvider(
  config: MicrosoftOAuthConfig
): MicrosoftOAuthProvider {
  return new MicrosoftOAuthProvider(config);
}

// Export default configuration
export const DEFAULT_MICROSOFT_SCOPES = [
  'openid',
  'profile',
  'email',
  'User.Read',
];

export const AZURE_AD_SCOPES = [
  ...DEFAULT_MICROSOFT_SCOPES,
  'Directory.Read.All',
  'Group.Read.All',
  'Organization.Read.All',
];

export const MICROSOFT_GRAPH_SCOPES = [
  ...DEFAULT_MICROSOFT_SCOPES,
  'Calendars.Read',
  'Files.Read',
  'Mail.Read',
  'People.Read',
];
