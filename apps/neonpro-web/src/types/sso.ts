// Temporary SSO types for build compatibility
export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth';
  enabled: boolean;
  config: Record<string, any>;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  token: string;
  expiresAt?: string;
}

export interface SSOUserInfo {
  id: string;
  email: string;
  name?: string;
}

export interface SSOAuthRequest {
  provider: string;
  redirectUri: string;
  state?: string;
}

export interface SSOAuthResponse {
  success: boolean;
  user?: SSOUserInfo;
  session?: SSOSession;
  isNewUser?: boolean;
  error?: any;
}

export interface SSOTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface SSOAccountLinking {
  userId: string;
  providerId: string;
}

export interface SSOAuditLog {
  userId: string;
  action: string;
  timestamp: Date;
}

export enum SSOErrorCode {
  INVALID_PROVIDER = 'INVALID_PROVIDER',
  AUTH_FAILED = 'AUTH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED'
}

export interface SSOError {
  code: SSOErrorCode;
  message: string;
}

export interface SSOConfiguration {
  providers: SSOProvider[];
  domainMappings: any[];
}

// Default SSO providers configuration
export const DEFAULT_SSO_PROVIDERS: SSOProvider[] = [
  {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    enabled: true,
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      scope: 'openid email profile'
    }
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    type: 'oauth',
    enabled: true,
    config: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      scope: 'openid email profile'
    }
  }
];
