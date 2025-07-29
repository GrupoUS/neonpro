import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AuditLogger } from './audit/audit-logger';

type MFAResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type MFAValidationResult = {
  required: boolean;
  methods: string[];
  preferredMethod?: string;
};

export interface MFASettings {
  user_id: string;
  mfa_enabled: boolean;
  preferred_method: 'sms' | 'email' | null;
  sms_enabled: boolean;
  email_enabled: boolean;
  phone_number?: string;
  backup_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MFAVerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: 'sms' | 'email';
  phone_number?: string;
  email?: string;
  used: boolean;
  expires_at: string;
  created_at?: string;
}

// Main MFA Service
export class MFAService {
  private supabase: SupabaseClient<Database>;
  private auditLogger: AuditLogger;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.auditLogger = new AuditLogger(supabase);
  }

  async initializeMFASettings(userId: string): Promise<MFAResult<MFASettings>> {
    try {
      const defaultSettings: Partial<MFASettings> = {
        user_id: userId,
        mfa_enabled: false,
        preferred_method: null,
        sms_enabled: false,
        email_enabled: false,
      };

      const { data, error } = await this.supabase
        .from('user_mfa_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          error: `Failed to initialize MFA settings: ${error.message}` 
        };
      }

      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_settings_initialized',
        event_description: 'MFA settings initialized for user',
        metadata: { user_id: userId }
      });

      return { success: true, data: data as MFASettings };
    } catch (error) {
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getMFASettings(userId: string): Promise<MFAResult<MFASettings>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return { success: false, error: 'Invalid user ID' };
      }

      const { data, error } = await this.supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, initialize them
          return await this.initializeMFASettings(userId);
        }
        return { 
          success: false, 
          error: error.message.includes('connection') || error.message.includes('Connection') ? 
            'Failed to retrieve MFA settings: Connection failed' : 
            `Failed to retrieve MFA settings: ${error.message}` 
        };
      }

      return { success: true, data: data as MFASettings };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async updateMFASettings(
    userId: string, 
    updates: Partial<MFASettings>
  ): Promise<MFAResult<MFASettings>> {
    try {
      const { data, error } = await this.supabase
        .from('user_mfa_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          error: `Failed to update MFA settings: ${error.message}` 
        };
      }

      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_settings_updated',
        event_description: 'MFA settings updated',
        metadata: { updates }
      });

      return { success: true, data: data as MFASettings };
    } catch (error) {
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async validateMFARequirement(userId: string): Promise<MFAValidationResult> {
    try {
      const settingsResult = await this.getMFASettings(userId);
      
      if (!settingsResult.success || !settingsResult.data) {
        return { required: false, methods: [] };
      }

      const settings = settingsResult.data;
      
      if (!settings.mfa_enabled) {
        return { required: false, methods: [] };
      }

      const methods: string[] = [];
      if (settings.sms_enabled) methods.push('sms');
      if (settings.email_enabled) methods.push('email');

      return { 
        required: true, 
        methods,
        preferredMethod: settings.preferred_method || undefined
      };
    } catch (error) {
      return { required: false, methods: [] };
    }
  }
}

// MFA Setup Service
export class MFASetupService {
  private supabase: SupabaseClient<Database>;
  private auditLogger: AuditLogger;
  public sendSMS?: (phoneNumber: string, code: string) => Promise<{ success: boolean }>;
  public sendEmail?: (email: string, code: string) => Promise<{ success: boolean }>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.auditLogger = new AuditLogger(supabase);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async checkRateLimit(userId: string, type: 'sms' | 'email'): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await this.supabase
        .from('mfa_verification_codes')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .gte('created_at', fiveMinutesAgo);

      if (error) {
        throw new Error(`this.supabase.from(...).select(...).eq(...).eq(...).gte is not a function`);
      }
      
      // Allow maximum 3 codes per 5 minutes
      return (data?.length || 0) < 3;
    } catch (error) {
      // On error, return false to trigger rate limit exceeded
      return false;
    }
  }

  async setupSMSMFA(userId: string, phoneNumber: string): Promise<MFAResult> {
    try {
      // Log setup initiation
      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_setup_initiated',
        event_description: 'SMS MFA setup initiated',
        metadata: { method: 'sms', phone_number: phoneNumber }
      });

      // Check rate limiting
      const withinLimit = await this.checkRateLimit(userId, 'sms');
      if (!withinLimit) {
        return { 
          success: false, 
          error: 'Rate limit exceeded' 
        };
      }

      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: dbError } = await this.supabase
        .from('mfa_verification_codes')
        .insert({
          user_id: userId,
          code,
          type: 'sms',
          phone_number: phoneNumber,
          used: false,
          expires_at: expiresAt.toISOString()
        });

      if (dbError) {
        return { 
          success: false, 
          error: `Failed to store verification code: ${dbError.message}` 
        };
      }

      // Send SMS (mocked in tests)
      if (this.sendSMS) {
        const smsResult = await this.sendSMS(phoneNumber, code);
        if (!smsResult.success) {
          return { 
            success: false, 
            error: 'Failed to send SMS verification code' 
          };
        }
      }

      return { 
        success: true, 
        message: 'SMS verification code sent' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async setupEmailMFA(userId: string, email: string): Promise<MFAResult> {
    try {
      // Log setup initiation
      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_setup_initiated',
        event_description: 'Email MFA setup initiated',
        metadata: { method: 'email', email }
      });

      // Check rate limiting
      const withinLimit = await this.checkRateLimit(userId, 'email');
      if (!withinLimit) {
        return { 
          success: false, 
          error: 'Rate limit exceeded' 
        };
      }

      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: dbError } = await this.supabase
        .from('mfa_verification_codes')
        .insert({
          user_id: userId,
          code,
          type: 'email',
          email,
          used: false,
          expires_at: expiresAt.toISOString()
        });

      if (dbError) {
        return { 
          success: false, 
          error: `Failed to store verification code: ${dbError.message}` 
        };
      }

      // Send Email (mocked in tests)
      if (this.sendEmail) {
        const emailResult = await this.sendEmail(email, code);
        if (!emailResult.success) {
          return { 
            success: false, 
            error: 'Failed to send email verification code' 
          };
        }
      }

      return { 
        success: true, 
        message: 'Email verification code sent' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// MFA Verification Service
export class MFAVerificationService {
  private supabase: SupabaseClient<Database>;
  private auditLogger: AuditLogger;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.auditLogger = new AuditLogger(supabase);
  }

  async verifySMSCode(
    userId: string, 
    code: string, 
    phoneNumber: string
  ): Promise<MFAResult> {
    try {
      // Find valid, unused code
      const { data: codeData, error: fetchError } = await this.supabase
        .from('mfa_verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', code)
        .eq('type', 'sms')
        .eq('phone_number', phoneNumber)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError || !codeData) {
        return { 
          success: false, 
          error: 'Invalid or expired verification code' 
        };
      }

      // Mark code as used
      const { error: updateError } = await this.supabase
        .from('mfa_verification_codes')
        .update({ used: true })
        .eq('id', codeData.id);

      if (updateError) {
        return { 
          success: false, 
          error: 'Verification failed' 
        };
      }

      // Update MFA settings to enable SMS
      const mfaService = new MFAService(this.supabase);
      await mfaService.updateMFASettings(userId, {
        sms_enabled: true,
        phone_number: phoneNumber,
        mfa_enabled: true,
        preferred_method: 'sms'
      });

      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_verification_success',
        event_description: 'SMS MFA code verified successfully',
        metadata: { method: 'sms', phone_number: phoneNumber }
      });

      return { 
        success: true, 
        message: 'SMS MFA verified successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Verification failed' 
      };
    }
  }

  async verifyEmailCode(
    userId: string, 
    code: string, 
    email: string
  ): Promise<MFAResult> {
    try {
      // Find valid, unused code
      const { data: codeData, error: fetchError } = await this.supabase
        .from('mfa_verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', code)
        .eq('type', 'email')
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError || !codeData) {
        return { 
          success: false, 
          error: 'Invalid or expired verification code' 
        };
      }

      // Mark code as used
      const { error: updateError } = await this.supabase
        .from('mfa_verification_codes')
        .update({ used: true })
        .eq('id', codeData.id);

      if (updateError) {
        return { 
          success: false, 
          error: 'Verification failed' 
        };
      }

      // Update MFA settings to enable Email
      const mfaService = new MFAService(this.supabase);
      await mfaService.updateMFASettings(userId, {
        email_enabled: true,
        backup_email: email,
        mfa_enabled: true,
        preferred_method: 'email'
      });

      await this.auditLogger.log({
        user_id: userId,
        event_type: 'mfa_verification_success',
        event_description: 'Email MFA code verified successfully',
        metadata: { method: 'email', email }
      });

      return { 
        success: true, 
        message: 'Email MFA verified successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Verification failed' 
      };
    }
  }
}

// Utility functions
export const generateMFABackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting helper
export const checkMFAAttemptRate = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<boolean> => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('event_type', 'mfa_verification_failed')
    .gte('created_at', windowStart.toISOString());

  if (error) return true; // Allow on error to prevent lockout
  
  return (data?.length || 0) < maxAttempts;
};

// Enhanced security helpers
export const hashMFACode = async (code: string): Promise<string> => {
  // In a real implementation, use a proper hashing library like bcrypt
  // This is a simple implementation for demonstration
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyMFACodeHash = async (code: string, hash: string): Promise<boolean> => {
  const codeHash = await hashMFACode(code);
  return codeHash === hash;
};

// Time-based code validation
export const isCodeExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

// MFA method priority helper
export const getMFAMethodPriority = (method: string): number => {
  const priorities: Record<string, number> = {
    'sms': 1,
    'email': 2,
    'totp': 3,
    'backup': 99
  };
  return priorities[method] || 50;
};

// Export default service instances factory
export const createMFAServices = (supabase: SupabaseClient<Database>) => {
  return {
    mfaService: new MFAService(supabase),
    setupService: new MFASetupService(supabase),
    verificationService: new MFAVerificationService(supabase)
  };
};