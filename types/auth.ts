/**
 * Authentication Types for NeonPro Healthcare Platform
 * 
 * Comprehensive TypeScript definitions for authentication, MFA, and security features
 * with healthcare compliance requirements (LGPD, ANVISA, CFM).
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { Database } from './supabase';

// Base Authentication Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  tenant_id: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  mfa_enabled: boolean;
  last_sign_in: Date;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 
  | 'patient' 
  | 'healthcare_professional' 
  | 'admin' 
  | 'super_admin'
  | 'security_officer'
  | 'audit_officer';

// Authentication Session Types
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  session_id: string;
  device_fingerprint?: string;
  ip_address: string;
  user_agent: string;
  is_trusted_device: boolean;
  mfa_verified: boolean;
  created_at: Date;
}

// Multi-Factor Authentication Types
export interface MFAConfiguration {
  issuer: string;
  label: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  window: number;
}

export interface MFASetupRequest {
  userId: string;
  method: MFAMethodType;
  phoneNumber?: string;
  deviceName: string;
  lgpdConsent: boolean;
  userAgent: string;
  ipAddress: string;
}

export interface MFASetupResult {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
  recoveryToken: string;
  expiresAt: Date;
}

export interface MFAVerificationRequest {
  userId: string;
  token: string;
  method: MFAMethodType;
  deviceFingerprint?: string;
  userAgent: string;
  ipAddress: string;
  emergencyBypass?: boolean;
  emergencyReason?: string;
}

export interface MFAVerificationResult {
  isValid: boolean;
  delta?: number;
  remainingAttempts: number;
  lockedUntil?: Date;
  isEmergencyBypass?: boolean;
  auditLogId: string;
  sessionToken?: string;
}

export type MFAMethodType = 'totp' | 'sms' | 'backup' | 'emergency';

export interface MFAMethod {
  id: string;
  userId: string;
  type: MFAMethodType;
  name: string;
  isEnabled: boolean;
  isPrimary: boolean;
  phoneNumber?: string;
  secretHash?: string;
  createdAt: Date;
  lastUsed?: Date;
  metadata?: Record<string, unknown>;
}

export interface MFAUserSettings {
  userId: string;
  isEnabled: boolean;
  methods: MFAMethod[];
  trustedDevices: TrustedDevice[];
  emergencyContacts: EmergencyContact[];
  backupCodesRemaining: number;
  backupCodesUsed: number;
  lastVerified?: Date;
  emergencyBypassesUsedToday: number;
  createdAt: Date;
  updatedAt: Date;
}

// Device and Security Types
export interface TrustedDevice {
  id: string;
  userId: string;
  name: string;
  fingerprint: string;
  userAgent: string;
  ipAddress: string;
  location?: GeoLocation;
  issuedAt: Date;
  expiresAt: Date;
  lastSeen: Date;
  isActive: boolean;
  trustLevel: 'low' | 'medium' | 'high';
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  webGL: string;
  canvas: string;
  audioFingerprint: string;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

// Emergency and Compliance Types
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  canAuthorizeBypass: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastContacted?: Date;
}

export interface EmergencyBypassRequest {
  userId: string;
  reason: string;
  contactId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  clinicalJustification: string;
  userAgent: string;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export interface EmergencyBypassResult {
  approved: boolean;
  bypassToken?: string;
  expiresAt?: Date;
  approvedBy?: string;
  auditLogId: string;
  restrictions?: string[];
}

// Audit and Compliance Types
export interface MFAAuditLog {
  id: string;
  userId: string;
  action: MFAAuditAction;
  method: string;
  result: MFAAuditResult;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  geoLocation?: GeoLocation;
  emergencyBypass?: boolean;
  emergencyReason?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  tenantId: string;
}

export type MFAAuditAction = 
  | 'setup' 
  | 'verify' 
  | 'bypass' 
  | 'disable' 
  | 'recover'
  | 'backup_code_used'
  | 'device_trusted'
  | 'emergency_contact_notified';

export type MFAAuditResult = 'success' | 'failure' | 'locked' | 'expired' | 'suspicious';

// Healthcare Compliance Types
export interface LGPDConsent {
  userId: string;
  consentType: 'mfa_setup' | 'data_processing' | 'emergency_contact' | 'audit_logging';
  consentGiven: boolean;
  consentDate: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
  withdrawalDate?: Date;
  isActive: boolean;
}

export interface ANVISAComplianceLog {
  id: string;
  userId: string;
  action: string;
  medicalContext: boolean;
  patientDataAccessed: boolean;
  justification: string;
  timestamp: Date;
  complianceOfficer?: string;
  auditTrail: string[];
}

export interface CFMAuthenticationLog {
  id: string;
  professionalId: string;
  crmNumber: string;
  specialty: string;
  authenticationType: 'password' | 'mfa' | 'emergency_bypass';
  clinicalContext: boolean;
  patientId?: string;
  timestamp: Date;
  location: GeoLocation;
  deviceInfo: DeviceFingerprint;
}

// Rate Limiting and Security Types
export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  lockoutMinutes: number;
  emergencyBypassMaxPerDay: number;
  trustedDeviceExpiryDays: number;
}

export interface SecurityPolicy {
  id: string;
  tenantId: string;
  name: string;
  type: 'mfa_required' | 'emergency_bypass' | 'device_trust' | 'audit_retention';
  rules: SecurityRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  condition: string;
  action: string;
  parameters: Record<string, unknown>;
  priority: number;
}

// API Request/Response Types
export interface MFAApiRequest<T = unknown> {
  userId: string;
  data: T;
  headers: {
    'user-agent': string;
    'x-forwarded-for': string;
    'x-device-fingerprint'?: string;
  };
  timestamp: Date;
}

export interface MFAApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    rateLimit: {
      remaining: number;
      resetAt: Date;
    };
    auditLogId?: string;
  };
}

// Component Props Types
export interface MFASetupProps {
  userId: string;
  onSetupComplete: (result: MFASetupResult) => void;
  onSetupError: (error: Error) => void;
  className?: string;
  theme?: 'light' | 'dark';
  locale?: 'pt-BR' | 'en-US';
}

export interface MFAVerifyProps {
  userId: string;
  methods: MFAMethodType[];
  onVerificationSuccess: (result: MFAVerificationResult) => void;
  onVerificationError: (error: Error) => void;
  allowEmergencyBypass?: boolean;
  showTrustedDeviceOption?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  locale?: 'pt-BR' | 'en-US';
}

// Hook Types
export interface UseMFAOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseMFAReturn {
  mfaSettings: MFAUserSettings | null;
  isLoading: boolean;
  error: Error | null;
  setupMFA: (request: MFASetupRequest) => Promise<MFASetupResult>;
  verifyMFA: (request: MFAVerificationRequest) => Promise<MFAVerificationResult>;
  disableMFA: (reason: string) => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  sendSMSOTP: () => Promise<{ success: boolean; expiresIn: number }>;
  refresh: () => Promise<void>;
}

// Utility Types
export type MFAEventType = 
  | 'mfa:setup:started'
  | 'mfa:setup:completed'
  | 'mfa:setup:failed'
  | 'mfa:verify:started'
  | 'mfa:verify:success'
  | 'mfa:verify:failed'
  | 'mfa:verify:locked'
  | 'mfa:bypass:requested'
  | 'mfa:bypass:approved'
  | 'mfa:bypass:denied'
  | 'mfa:disabled'
  | 'mfa:backup_codes:generated'
  | 'mfa:device:trusted'
  | 'mfa:device:removed';

export interface MFAEvent {
  type: MFAEventType;
  userId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// Database Types (extending from Supabase types)
export type MFAUserSettingsRow = Database['public']['Tables']['user_mfa_settings']['Row'];
export type MFAUserSettingsInsert = Database['public']['Tables']['user_mfa_settings']['Insert'];
export type MFAUserSettingsUpdate = Database['public']['Tables']['user_mfa_settings']['Update'];

export type MFAAuditLogRow = Database['public']['Tables']['mfa_audit_logs']['Row'];
export type MFAAuditLogInsert = Database['public']['Tables']['mfa_audit_logs']['Insert'];

// Error Types
export class MFAError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MFAError';
  }
}

export class MFASetupError extends MFAError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'MFA_SETUP_ERROR', 400, metadata);
    this.name = 'MFASetupError';
  }
}

export class MFAVerificationError extends MFAError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'MFA_VERIFICATION_ERROR', 401, metadata);
    this.name = 'MFAVerificationError';
  }
}

export class MFARateLimitError extends MFAError {
  constructor(message: string, lockedUntil: Date, metadata?: Record<string, unknown>) {
    super(message, 'MFA_RATE_LIMIT_ERROR', 429, { ...metadata, lockedUntil });
    this.name = 'MFARateLimitError';
  }
}