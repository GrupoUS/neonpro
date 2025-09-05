/**
 * DEPRECATED: @neonpro/auth package
 *
 * This package has been merged into @neonpro/security/auth/enterprise.
 * Please migrate imports to @neonpro/security/auth/enterprise.
 *
 * This re-export shim will be removed in a future version.
 */

// Re-export from new location in @neonpro/security
// Note: This will work after @neonpro/security is built
// For now, we'll provide a minimal stub to prevent build errors

export interface AuthConfig {
  jwtSecret: string;
  sessionTimeout: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
}

// TODO: Remove this stub once @neonpro/security build is complete
// export * from "@neonpro/security/auth/enterprise";
