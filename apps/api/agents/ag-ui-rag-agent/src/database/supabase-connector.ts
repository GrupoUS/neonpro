/**
 * Supabase Database Connector for Healthcare Agent
 * Provides LGPD-compliant data access with audit logging and role-based permissions
 * T051: Implement custom data retrieval functions
 * T056: Implement role-based permission checking in data service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthcareLogger } from '../logging/healthcare-logger';

interface UserPermissions {
  _userId: string;
  clinicId: string;
  _role: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'agent';
  permissions: {
    canAccessPatients: boolean;
    canModifyPatients: boolean;
    canAccessMedicalRecords: boolean;
    canModifyMedicalRecords: boolean;
    canAccessAppointments: boolean;
    canModifyAppointments: boolean;
    canAccessAuditLogs: boolean;
  };
}

interface DataAccessRequest {
  action: 'read' | 'write' | 'delete';
  resourceType: 'patient' | 'appointment' | 'medical_record' | 'ai_log';
  resourceId?: string;
  patientId?: string;
  clinicId: string;
  _userId: string;
  sessionId: string;
}

export class SupabaseConnector {
  private supabase: SupabaseClient | null = null;
  private logger: HealthcareLogger;
  private permissionsCache = new Map<string, UserPermissions>();
  private cacheExpiry = new Map<string, number>();

  constructor(logger?: HealthcareLogger) {
    this.logger = logger || new HealthcareLogger();
  }

  /**
   * Initialize Supabase connection with healthcare compliance
   */
  public async initialize(): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'X-Healthcare-App': 'NeonPro-Agent',
          'X-LGPD-Compliance': 'true',
        },
      },
    });

    this.logger.info('Supabase connector initialized', {
      component: 'supabase-connector',
      url: supabaseUrl.substring(0, 20) + '...',
    });
  }

  /**
   * Get user permissions with role-based access control
   */
  private async getUserPermissions(
    _userId: string,
    clinicId: string,
  ): Promise<UserPermissions | null> {
    const cacheKey = `${userId}-${clinicId}`;
    const _now = Date.now();

    // Check cache (5 minute expiry)
    if (this.permissionsCache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.permissionsCache.get(cacheKey)!;
    }

    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      // Get professional role and permissions
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .select(`
          id,
          user_id,
          clinic_id,
          role,
          is_active,
          permissions
        `)
        .eq('user_id', _userId)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .single();

      if (error || !professional) {
        this.logger.warn('User permissions not found', {
          userId,
          clinicId,
          error: error?.message,
        });
        return null;
      }

      const permissions: UserPermissions = {
        userId,
        clinicId,
        _role: professional.role,
        permissions: {
          canAccessPatients: this.getRolePermission(professional.role, 'read', 'patients'),
          canModifyPatients: this.getRolePermission(professional.role, 'write', 'patients'),
          canAccessMedicalRecords: this.getRolePermission(
            professional.role,
            'read',
            'medical_records',
          ),
          canModifyMedicalRecords: this.getRolePermission(
            professional.role,
            'write',
            'medical_records',
          ),
          canAccessAppointments: this.getRolePermission(professional.role, 'read', 'appointments'),
          canModifyAppointments: this.getRolePermission(professional.role, 'write', 'appointments'),
          canAccessAuditLogs: this.getRolePermission(professional.role, 'read', 'audit_logs'),
        },
      };

      // Cache permissions for 5 minutes
      this.permissionsCache.set(cacheKey, permissions);
      this.cacheExpiry.set(cacheKey, now + 5 * 60 * 1000);

      return permissions;
    } catch (error) {
      this.logger.error('Failed to get user permissions', error as Error, {
        userId,
        clinicId,
      });
      return null;
    }
  }

  /**
   * Get role-based permissions for specific actions
   */
  private getRolePermission(_role: string, action: string, resource: string): boolean {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      doctor: {
        read: ['patients', 'medical_records', 'appointments', 'audit_logs'],
        write: ['patients', 'medical_records', 'appointments'],
      },
      nurse: {
        read: ['patients', 'appointments'],
        write: ['appointments'],
      },
      admin: {
        read: ['patients', 'medical_records', 'appointments', 'audit_logs'],
        write: ['patients', 'appointments'],
      },
      receptionist: {
        read: ['patients', 'appointments'],
        write: ['appointments'],
      },
      agent: {
        read: ['patients', 'appointments'],
        write: [],
      },
    };

    return rolePermissions[role]?.[action]?.includes(resource) || false;
  }

  /**
   * Validate data access request
   */
  private async validateDataAccess(_request: DataAccessRequest): Promise<boolean> {
    const permissions = await this.getUserPermissions(request.userId, request.clinicId);

    if (!permissions) {
      await this.logger.logDataAccess(request.userId, request.clinicId, {
        action: request.action,
        resource_type: request.resourceType,
        resource_id: request.resourceId,
        patient_id: request.patientId,
        result: 'denied',
        reason: 'no_permissions_found',
      });
      return false;
    }

    // Check specific permission based on action and resource
    let hasPermission = false;

    switch (request.resourceType) {
      case 'patient':
        hasPermission = request.action === 'read'
          ? permissions.permissions.canAccessPatients
          : permissions.permissions.canModifyPatients;
        break;
      case 'appointment':
        hasPermission = request.action === 'read'
          ? permissions.permissions.canAccessAppointments
          : permissions.permissions.canModifyAppointments;
        break;
      case 'medical_record':
        hasPermission = request.action === 'read'
          ? permissions.permissions.canAccessMedicalRecords
          : permissions.permissions.canModifyMedicalRecords;
        break;
      case 'ai_log':
        hasPermission = permissions.permissions.canAccessAuditLogs;
        break;
    }

    // Additional check for patient-specific data access
    if (hasPermission && request.patientId) {
      hasPermission = await this.validatePatientAccess(
        request.userId,
        request.patientId,
        request.clinicId,
      );
    }

    // Log the access attempt
    await this.logger.logDataAccess(request.userId, request.clinicId, {
      action: request.action,
      resource_type: request.resourceType,
      resource_id: request.resourceId,
      patient_id: request.patientId,
      result: hasPermission ? 'granted' : 'denied',
      reason: hasPermission ? 'authorized' : 'insufficient_permissions',
      session_id: request.sessionId,
    });

    return hasPermission;
  }

  /**
   * Validate patient-specific access (LGPD compliance)
   */
  private async validatePatientAccess(
    _userId: string,
    patientId: string,
    clinicId: string,
  ): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      // Check if patient belongs to the clinic
      const { data: patient } = await this.supabase
        .from('patients')
        .select('clinic_id')
        .eq('id', patientId)
        .eq('clinic_id', clinicId)
        .single();

      if (!patient) {
        return false;
      }

      // Check LGPD consent for AI assistance
      const { data: consent } = await this.supabase
        .from('consent_records')
        .select('status, expires_at')
        .eq('patient_id', patientId)
        .eq('purpose', 'ai_assistance')
        .eq('status', 'granted')
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!consent;
    } catch (error) {
      this.logger.error('Failed to validate patient access', error as Error, {
        userId,
        patientId,
        clinicId,
      });
      return false;
    }
  }

  /**
   * Set AI session context for database operations
   */
  public async setAISessionContext(
    sessionId: string,
    _userId: string,
    clinicId: string,
  ): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      // Set session context using Supabase RLS
      await this.supabase.rpc('set', {
        parameter_name: 'app.ai_session_id',
        parameter_value: sessionId,
      });

      await this.supabase.rpc('set', {
        parameter_name: 'app.user_id',
        parameter_value: userId,
      });

      await this.supabase.rpc('set', {
        parameter_name: 'app.clinic_id',
        parameter_value: clinicId,
      });

      this.logger.info('AI session context set', {
        sessionId,
        userId,
        clinicId,
      });
    } catch (error) {
      this.logger.error('Failed to set AI session context', error as Error, {
        sessionId,
        userId,
        clinicId,
      });
      throw error;
    }
  }

  /**
   * Get patient data with LGPD compliance and role-based access
   */
  public async getPatientData(
    patientId: string,
    _userId: string,
    clinicId: string,
    sessionId: string,
  ): Promise<any> {
    const _request: DataAccessRequest = {
      action: 'read',
      resourceType: 'patient',
      resourceId: patientId,
      patientId,
      clinicId,
      userId,
      sessionId,
    };

    if (!await this.validateDataAccess(request)) {
      throw new Error('Access denied: Insufficient permissions to view patient data');
    }

    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      await this.setAISessionContext(sessionId, userId, clinicId);

      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          id,
          full_name,
          birth_date,
          phone,
          email,
          lgpd_consent_given,
          created_at
        `)
        .eq('id', patientId)
        .single();

      if (error) {
        throw new Error(`Failed to retrieve patient data: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to get patient data', error as Error, {
        patientId,
        userId,
        clinicId,
      });
      throw error;
    }
  }

  /**
   * Get appointment data for clinic with role-based access
   */
  public async getAppointmentData(
    clinicId: string,
    _userId: string,
    sessionId: string,
    filters?: any,
  ): Promise<any> {
    const _request: DataAccessRequest = {
      action: 'read',
      resourceType: 'appointment',
      clinicId,
      userId,
      sessionId,
    };

    if (!await this.validateDataAccess(request)) {
      throw new Error('Access denied: Insufficient permissions to view appointment data');
    }

    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      await this.setAISessionContext(sessionId, userId, clinicId);

      let query = this.supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          professional_id,
          scheduled_at,
          duration_hours,
          status,
          notes,
          no_show_risk_score,
          patients:patient_id (
            full_name,
            phone
          ),
          professionals:professional_id (
            full_name,
            specialization
          )
        `)
        .eq('clinic_id', clinicId);

      // Apply filters if provided
      if (filters?.startDate) {
        query = query.gte('scheduled_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('scheduled_at', filters.endDate);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query
        .order('scheduled_at', { ascending: true })
        .limit(100);

      if (error) {
        throw new Error(`Failed to retrieve appointment data: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to get appointment data', error as Error, {
        clinicId,
        userId,
        filters,
      });
      throw error;
    }
  }

  /**
   * Get clinic summary data for AI context
   */
  public async getClinicSummary(clinicId: string, _userId: string, sessionId: string): Promise<any> {
    const _request: DataAccessRequest = {
      action: 'read',
      resourceType: 'appointment',
      clinicId,
      userId,
      sessionId,
    };

    if (!await this.validateDataAccess(request)) {
      throw new Error('Access denied: Insufficient permissions to view clinic data');
    }

    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      await this.setAISessionContext(sessionId, userId, clinicId);

      // Get clinic basic info
      const { data: clinic } = await this.supabase
        .from('clinics')
        .select('name, address, phone')
        .eq('id', clinicId)
        .single();

      // Get today's appointments count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await this.supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('scheduled_at', today)
        .lt('scheduled_at', today + 'T23:59:59');

      // Get total patients count
      const { count: totalPatients } = await this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);

      return {
        clinic,
        statistics: {
          todayAppointments: todayAppointments || 0,
          totalPatients: totalPatients || 0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get clinic summary', error as Error, {
        clinicId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Clear permissions cache (useful for role changes)
   */
  public clearPermissionsCache(_userId?: string, clinicId?: string): void {
    if (userId && clinicId) {
      const cacheKey = `${userId}-${clinicId}`;
      this.permissionsCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
    } else {
      this.permissionsCache.clear();
      this.cacheExpiry.clear();
    }
  }
}
