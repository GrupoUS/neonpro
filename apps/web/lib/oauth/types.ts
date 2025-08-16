/**
 * OAuth Integration Types for NeonPro Social Media Management
 * Research-backed implementation following best practices from Instagram Graph API,
 * Meta Developer documentation, and OAuth 2.0 security standards.
 */

export type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  apiBaseUrl: string;
};

export type OAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
  expiresAt: Date;
};

export type OAuthUserProfile = {
  id: string;
  name: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  isVerified?: boolean;
  followerCount?: number;
  mediaCount?: number;
};

export type OAuthState = {
  userId: string;
  clinicId: string;
  platform: string;
  nonce: string;
  createdAt: Date;
  redirectTo?: string;
};

export type OAuthError = {
  error: string;
  errorDescription?: string;
  errorUri?: string;
  state?: string;
};

export type OAuthAuthorizationCodeRequest = {
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
};

export type TokenRefreshRequest = {
  accountId: string;
  platform: string;
};

export type TokenRefreshResponse = {
  success: boolean;
  tokens?: OAuthTokens;
  error?: string;
};

export type SocialMediaPlatform =
  | 'instagram'
  | 'facebook'
  | 'whatsapp_business'
  | 'hubspot'
  | 'twitter'
  | 'linkedin';

export type PlatformCredentials = {
  platform: SocialMediaPlatform;
  clientId: string;
  clientSecret: string;
  webhookSecret?: string;
  isEnabled: boolean;
  testMode: boolean;
};

export type EncryptedTokenData = {
  encryptedAccessToken: string;
  encryptedRefreshToken?: string;
  tokenMetadata: {
    expiresAt: string;
    scopes: string[];
    tokenType: string;
    issuedAt: string;
  };
};

export abstract class IOAuthHandler {
  abstract getAuthorizationUrl(state: OAuthState): string;
  abstract exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens>;
  abstract refreshTokens(refreshToken: string): Promise<OAuthTokens>;
  abstract getUserProfile(accessToken: string): Promise<OAuthUserProfile>;
  abstract validateTokens(tokens: OAuthTokens): Promise<boolean>;
  abstract revokeTokens(accessToken: string): Promise<boolean>;
}
