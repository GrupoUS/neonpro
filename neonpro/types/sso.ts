// SSO Integration Types for NeonPro
// Story 1.3: SSO Integration Implementation

export interface SSOProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml' | 'oidc';
  enabled: boolean;
  config: SSOProviderConfig;
  metadata?: SSOProviderMetadata;
}

export interface SSOProviderConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  issuer?: string;
  jwksUri?: string;
  samlEntryPoint?: string;
  samlCert?: string;
  domainRestriction?: string[];
}

export interface SSOProviderMetadata {
  iconUrl?: string;
  brandColor?: string;
  description?: string;
  supportedDomains?: string[];
  enterpriseOnly?: boolean;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresAt: Date;
  scope: string[];
  userInfo: SSOUserInfo;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface SSOUserInfo {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  locale?: string;
  timezone?: string;
  domain?: string;
  organizationId?: string;
  roles?: string[];
  customClaims?: Record<string, any>;
}

export interface SSOAuthRequest {
  providerId: string;
  state: string;
  nonce?: string;
  redirectUri: string;
  scopes?: string[];
  domainHint?: string;
  loginHint?: string;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  maxAge?: number;
}

export interface SSOAuthResponse {
  code?: string;
  state: string;
  error?: string;
  errorDescription?: string;
  errorUri?: string;
}

export interface SSOTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
  scope?: string;
}

export interface SSOAccountLinking {
  id: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  email: string;
  linkedAt: Date;
  linkingMethod: 'automatic' | 'manual' | 'admin';
  verified: boolean;
  primary: boolean;
}

export interface SSODomainMapping {
  id: string;
  domain: string;
  providerId: string;
  autoRedirect: boolean;
  enforceSSO: boolean;
  fallbackAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOAuditLog {
  id: string;
  userId?: string;
  providerId: string;
  action: SSOAuditAction;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export type SSOAuditAction = 
  | 'sso_login_attempt'
  | 'sso_login_success'
  | 'sso_login_failure'
  | 'sso_logout'
  | 'sso_token_refresh'
  | 'sso_account_link'
  | 'sso_account_unlink'
  | 'sso_provider_config_change'
  | 'sso_domain_mapping_change';

export interface SSOConfiguration {
  providers: SSOProvider[];
  domainMappings: SSODomainMapping[];
  globalSettings: SSOGlobalSettings;
}

export interface SSOGlobalSettings {
  enabled: boolean;
  allowLocalFallback: boolean;
  sessionTimeout: number;
  tokenRefreshThreshold: number;
  maxConcurrentSessions: number;
  auditRetentionDays: number;
  lgpdCompliance: {
    consentRequired: boolean;
    dataRetentionDays: number;
    allowDataExport: boolean;
    allowDataDeletion: boolean;
  };
}

export interface SSOError {
  code: string;
  message: string;
  details?: Record<string, any>;
  providerId?: string;
  timestamp: Date;
}

export type SSOErrorCode = 
  | 'PROVIDER_NOT_FOUND'
  | 'PROVIDER_DISABLED'
  | 'INVALID_STATE'
  | 'INVALID_NONCE'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'DOMAIN_NOT_ALLOWED'
  | 'ACCOUNT_LINKING_FAILED'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'CONFIGURATION_ERROR';

// Default SSO Providers Configuration
export const DEFAULT_SSO_PROVIDERS: Partial<SSOProvider>[] = [
  {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    enabled: true,
    config: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: ['openid', 'email', 'profile'],
      clientId: '',
      redirectUri: '',
    },
    metadata: {
      iconUrl: '/icons/google.svg',
      brandColor: '#4285f4',
      description: 'Sign in with your Google account',
    },
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    type: 'oauth',
    enabled: true,
    config: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scopes: ['openid', 'email', 'profile'],
      clientId: '',
      redirectUri: '',
    },
    metadata: {
      iconUrl: '/icons/microsoft.svg',
      brandColor: '#0078d4',
      description: 'Sign in with your Microsoft account',
      enterpriseOnly: true,
    },
  },
  {
    id: 'azure-ad',
    name: 'Azure Active Directory',
    type: 'oauth',
    enabled: false,
    config: {
      authUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scopes: ['openid', 'email', 'profile'],
      clientId: '',
      redirectUri: '',
    },
    metadata: {
      iconUrl: '/icons/azure-ad.svg',
      brandColor: '#0078d4',
      description: 'Sign in with your organization account',
      enterpriseOnly: true,
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'oauth',
    enabled: false,
    config: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/v18.0/me',
      scopes: ['email', 'public_profile'],
      clientId: '',
      redirectUri: '',
    },
    metadata: {
      iconUrl: '/icons/facebook.svg',
      brandColor: '#1877f2',
      description: 'Sign in with Facebook',
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    type: 'oauth',
    enabled: false,
    config: {
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      scopes: ['email', 'name'],
      clientId: '',
      redirectUri: '',
    },
    metadata: {
      iconUrl: '/icons/apple.svg',
      brandColor: '#000000',
      description: 'Sign in with Apple ID',
    },
  },
];

// SSO Provider Validation Schemas
export interface SSOProviderValidation {
  required: string[];
  optional: string[];
  format: Record<string, RegExp>;
}

export const SSO_VALIDATION_SCHEMAS: Record<string, SSOProviderValidation> = {
  oauth: {
    required: ['clientId', 'authUrl', 'tokenUrl', 'redirectUri', 'scopes'],
    optional: ['clientSecret', 'userInfoUrl', 'issuer', 'jwksUri'],
    format: {
      clientId: /^[a-zA-Z0-9._-]+$/,
      authUrl: /^https:\/\/.+/,
      tokenUrl: /^https:\/\/.+/,
      redirectUri: /^https:\/\/.+/,
    },
  },
  saml: {
    required: ['samlEntryPoint', 'samlCert', 'issuer'],
    optional: ['redirectUri'],
    format: {
      samlEntryPoint: /^https:\/\/.+/,
      issuer: /^[a-zA-Z0-9._:-]+$/,
    },
  },
};
