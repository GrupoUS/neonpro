/**
 * Authentication Service Types
 * Healthcare-compliant authentication interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  healthcareProvider?: HealthcareProvider;
  permissions: Permission[];
  mfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  cns: string; // Cartão Nacional de Saúde
  specialty: string;
  license: string;
  verified: boolean;
}

export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "admin"
  | "receptionist"
  | "manager"
  | "auditor"
  | "system";

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, string | number | boolean>;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  mfaRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  audit: {
    enabled: boolean;
    logLevel: "basic" | "detailed" | "forensic";
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  ip: string;
  fingerprint: string;
  trusted: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresMfa?: boolean;
  error?: string;
  sessionId?: string;
}

export interface MfaSetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: string;
  iat: number;
  exp: number;
  exp: number;
}

export interface SecurityEvent {
  type:
    | "login"
    | "logout"
    | "failed_login"
    | "mfa_success"
    | "mfa_failure"
    | "suspicious_activity";
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, string | number | boolean>;
  riskScore: number;
}

export interface RolePermissions {
  [role: string]: Permission[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
}

export interface AuthService {
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ user: User; token: string; }>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<User>;
  getCurrentUser: () => Promise<User | null>;
  refreshToken: () => Promise<string>;
}
