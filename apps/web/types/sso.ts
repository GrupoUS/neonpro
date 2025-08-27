// Single Sign-On Types
export interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oauth2" | "oidc" | "ldap";
  enabled: boolean;
  configuration: SSOConfiguration;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOConfiguration {
  // OAuth2/OIDC Configuration  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  // SAML Configuration  entityId: string;
  ssoUrl: string;
  sloUrl: string;
  certificate: string;
  signatureAlgorithm: string;
  // LDAP Configuration  serverUrl: string;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  userSearchFilter: string;
  // Common Configuration  attributeMapping: AttributeMapping;
  autoProvision: boolean;
  defaultRole: string;
  allowedDomains: string[];
}

export interface AttributeMapping {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  groups: string;
  department: string;
  title: string;
  phone: string;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsed: Date;
}

export interface SSOUser {
  id: string;
  providerId: string;
  providerUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  attributes: Record<string, unknown>;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOAuthRequest {
  id: string;
  providerId: string;
  state: string;
  nonce: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface SSOAuthResponse {
  code: string;
  state: string;
  error: string;
  errorDescription: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  idToken: string;
}

export interface SSOTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface SSOUserInfo {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  locale: string;
  groups: string[];
  [key: string]: unknown;
}

export interface SSOAuditLog {
  id: string;
  providerId: string;
  userId: string;
  action: SSOAction;
  result: "success" | "failure";
  error: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

export type SSOAction =
  | "login_initiated"
  | "login_completed"
  | "login_failed"
  | "logout_initiated"
  | "logout_completed"
  | "token_refreshed"
  | "user_provisioned"
  | "user_updated"
  | "session_expired";

export interface SSOMetrics {
  providerId: string;
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  activeUsers: number;
  averageSessionDuration: number;
  lastLogin: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface SSOProviderStatus {
  providerId: string;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  error: string;
  uptime: number;
}

// Predefined SSO providers
export const SSO_PROVIDERS = {
  GOOGLE: "google",
  MICROSOFT: "microsoft",
  OKTA: "okta",
  AUTH0: "auth0",
  AZURE_AD: "azure_ad",
  SAML_GENERIC: "saml_generic",
  LDAP: "ldap",
} as const;

export type SSOProviderType = (typeof SSO_PROVIDERS)[keyof typeof SSO_PROVIDERS];

// SAML specific types
export interface SAMLAssertion {
  issuer: string;
  subject: string;
  audience: string;
  sessionIndex: string;
  attributes: Record<string, string | string[]>;
  conditions: {
    notBefore: Date;
    notOnOrAfter: Date;
  };
  signature: {
    algorithm: string;
    value: string;
  };
}

export interface SAMLRequest {
  id: string;
  issuer: string;
  destination: string;
  assertionConsumerServiceURL: string;
  protocolBinding: string;
  nameIdPolicy: {
    format: string;
    allowCreate: boolean;
  };
}

export interface SAMLResponse {
  id: string;
  inResponseTo: string;
  issuer: string;
  destination: string;
  status: {
    code: string;
    message: string;
  };
  assertion: SAMLAssertion;
}
