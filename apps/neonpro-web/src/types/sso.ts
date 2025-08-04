// Temporary SSO types for build compatibility
export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth';
  config: Record<string, any>;
}

export interface SSOSession {
  userId: string;
  providerId: string;
  token: string;
}