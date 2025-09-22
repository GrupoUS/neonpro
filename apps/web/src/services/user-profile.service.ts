/**
 * User Profile Service
 * Handles user role management, clinic associations, and permissions
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/supabase/types/database';

// Type definitions
// type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];
type StaffMemberRow = Database['public']['Tables']['staff_members']['Row'];

export interface UserProfile {
  id: string;
  email: string;
  _role: UserRole;
  clinicId: string;
  clinicName?: string;
  fullName: string;
  permissions: UserPermissions;
  professionalInfo?: ProfessionalInfo;
  staffInfo?: StaffInfo;
}

export interface ProfessionalInfo {
  id: string;
  specialization: string | null;
  licenseNumber: string | null;
  serviceTypeIds: string[];
  workingHours: {
    startTime: string | null;
    endTime: string | null;
    breakStart: string | null;
    breakEnd: string | null;
  };
  canWorkWeekends: boolean;
  color: string | null;
}

export interface StaffInfo {
  id: string;
  _role: string;
  specialization: string | null;
  crmNumber: string | null;
  avatarUrl: string | null;
}

export type UserRole =
  | 'patient'
  | 'professional'
  | 'staff'
  | 'admin'
  | 'clinic_owner';

export interface UserPermissions {
  canViewAllAppointments: boolean;
  canCreateAppointments: boolean;
  canEditAppointments: boolean;
  canDeleteAppointments: boolean;
  canViewPatients: boolean;
  canEditPatients: boolean;
  canViewReports: boolean;
  canManageStaff: boolean;
  canManageSettings: boolean;
}

class UserProfileService {
  /**
   * Get user profile with role and clinic information
   */
  async getUserProfile(_userId: string): Promise<UserProfile> {
    console.log('🔍 getUserProfile called for _userId:', _userId);

    // Handle fallback user case immediately
    if (_userId === 'fallback-user') {
      console.log('🔧 Creating fallback profile for development');
      return this.createFallbackProfile(_userId);
    }

    try {
      // Add timeout to all database operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database operation timeout')), 5000)
      );

      // First check if user is a professional
      console.log('🔍 Checking for professional profile...');
      const professionalPromise = supabase
        .from('professionals')
        .select(
          `
          *,
          clinics!inner(id, clinic_name)
        `,
        )
        .eq('user_id', _userId)
        .eq('is_active', true)
        .single();

      const { data: professional, error: profError } = (await Promise.race([
        professionalPromise,
        timeoutPromise,
      ])) as any;

      if (professional && !profError) {
        console.log('✅ Found professional profile:', professional.full_name);
        return this.buildProfessionalProfile(professional);
      }

      console.log('⚠️ No professional profile found, checking staff...');
      // Check if user is staff member
      const staffPromise = supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', _userId)
        .eq('is_active', true)
        .single();

      const { data: staff, error: staffError } = (await Promise.race([
        staffPromise,
        timeoutPromise,
      ])) as any;

      if (staff && !staffError) {
        console.log('✅ Found staff profile:', staff.name);
        return this.buildStaffProfile(staff);
      }

      console.log('⚠️ No staff profile found, checking auth user...');
      // If not professional or staff, treat as patient
      // Get user info from auth.users
      const authPromise = supabase.auth.getUser();
      const { data: authUser, error: authError } = (await Promise.race([
        authPromise,
        timeoutPromise,
      ])) as any;

      if (authError || !authUser.user) {
        console.warn('⚠️ Could not get authenticated user, throwing error');
        throw new Error('No authenticated user found');
      }

      console.log(
        '✅ Found auth user, creating patient profile:',
        authUser.user.email,
      );
      return this.buildPatientProfile(authUser.user);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // Throw error instead of creating fallback to let caller handle it
      throw error;
    }
  }

  /**
   * Build professional profile
   */
  private buildProfessionalProfile(professional: any): UserProfile {
    const permissions = this.getProfessionalPermissions();

    return {
      id: professional.user_id,
      email: professional.email || '',
      _role: 'professional',
      clinicId: professional.clinic_id,
      clinicName: professional.clinics?.clinic_name,
      fullName: professional.full_name,
      permissions,
      professionalInfo: {
        id: professional.id,
        specialization: professional.specialization,
        licenseNumber: professional.license_number,
        serviceTypeIds: professional.service_type_ids || [],
        workingHours: {
          startTime: professional.default_start_time,
          endTime: professional.default_end_time,
          breakStart: professional.default_break_start,
          breakEnd: professional.default_break_end,
        },
        canWorkWeekends: professional.can_work_weekends || false,
        color: professional.color,
      },
    };
  }

  /**
   * Build staff profile
   */
  private buildStaffProfile(staff: StaffMemberRow): UserProfile {
    const permissions = this.getStaffPermissions(staff._role);
    const anyStaff = staff as any;

    return {
      id: anyStaff.user_id || '',
      email: anyStaff.email || '',
      _role: this.mapStaffRole(anyStaff._role),
      clinicId: '', // Staff members don't have direct clinic association in current schema
      fullName: anyStaff.full_name || anyStaff.name || '',
      permissions,
      staffInfo: {
        id: anyStaff.id,
        _role: anyStaff._role,
        specialization: anyStaff.specialization || '',
        crmNumber: anyStaff.crm_number || '',
        avatarUrl: anyStaff.avatar_url || '',
      },
    };
  }

  /**
   * Build patient profile
   */
  private buildPatientProfile(authUser: any): UserProfile {
    const permissions = this.getPatientPermissions();

    return {
      id: authUser.id,
      email: authUser.email || '',
      _role: 'patient',
      clinicId: '', // Patients don't have a fixed clinic association
      fullName: authUser.user_metadata?.full_name || authUser.email || '',
      permissions,
    };
  }

  /**
   * Create fallback profile for development/testing
   */
  private createFallbackProfile(userId: string): UserProfile {
    const permissions = this.getProfessionalPermissions(); // Give full permissions for development

    return {
      id: userId,
      email: 'dev@neonpro.com',
      _role: 'professional',
      clinicId: '89084c3a-9200-4058-a15a-b440d3c60687', // Default clinic ID
      clinicName: 'Clínica NeonPro',
      fullName: 'Usuário de Desenvolvimento',
      permissions,
      professionalInfo: {
        id: 'dev-professional-id',
        specialization: 'Estética Geral',
        licenseNumber: 'DEV-001',
        serviceTypeIds: [],
        workingHours: {
          startTime: '08:00',
          endTime: '18:00',
          breakStart: '12:00',
          breakEnd: '13:00',
        },
        canWorkWeekends: false,
        color: '#3b82f6',
      },
    };
  }

  /**
   * Get permissions for professional role
   */
  private getProfessionalPermissions(): UserPermissions {
    return {
      canViewAllAppointments: true,
      canCreateAppointments: true,
      canEditAppointments: true,
      canDeleteAppointments: true,
      canViewPatients: true,
      canEditPatients: true,
      canViewReports: false,
      canManageStaff: false,
      canManageSettings: false,
    };
  }

  /**
   * Get permissions for staff role
   */
  private getStaffPermissions(_role: string): UserPermissions {
    const basePermissions = {
      canViewAllAppointments: false,
      canCreateAppointments: false,
      canEditAppointments: false,
      canDeleteAppointments: false,
      canViewPatients: false,
      canEditPatients: false,
      canViewReports: false,
      canManageStaff: false,
      canManageSettings: false,
    };

    switch (_role.toLowerCase()) {
      case 'admin':
      case 'clinic_admin':
        return {
          ...basePermissions,
          canViewAllAppointments: true,
          canCreateAppointments: true,
          canEditAppointments: true,
          canDeleteAppointments: true,
          canViewPatients: true,
          canEditPatients: true,
          canViewReports: true,
          canManageStaff: true,
          canManageSettings: true,
        };
      case 'receptionist':
      case 'secretary':
        return {
          ...basePermissions,
          canViewAllAppointments: true,
          canCreateAppointments: true,
          canEditAppointments: true,
          canViewPatients: true,
          canEditPatients: true,
        };
      case 'nurse':
      case 'assistant':
        return {
          ...basePermissions,
          canViewAllAppointments: true,
          canCreateAppointments: true,
          canViewPatients: true,
        };
      default:
        return basePermissions;
    }
  }

  /**
   * Get permissions for patient role
   */
  private getPatientPermissions(): UserPermissions {
    return {
      canViewAllAppointments: false, // Patients can only see their own appointments
      canCreateAppointments: true,
      canEditAppointments: false, // Patients can request changes but not directly edit
      canDeleteAppointments: false, // Patients can cancel but not delete
      canViewPatients: false,
      canEditPatients: false,
      canViewReports: false,
      canManageStaff: false,
      canManageSettings: false,
    };
  }

  /**
   * Map staff role to user role
   */
  private mapStaffRole(staffRole: string): UserRole {
    switch (staffRole.toLowerCase()) {
      case 'admin':
      case 'clinic_admin':
        return 'admin';
      case 'clinic_owner':
        return 'clinic_owner';
      default:
        return 'staff';
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    userProfile: UserProfile,
    permission: keyof UserPermissions,
  ): boolean {
    return userProfile.permissions[permission];
  }

  /**
   * Get user's accessible clinic IDs
   */
  async getAccessibleClinics(userId: string): Promise<string[]> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];

      // For now, return single clinic ID
      // In future, could support multi-clinic access
      return profile.clinicId ? [profile.clinicId] : [];
    } catch (error) {
      console.error('Error getting accessible clinics:', error);
      return [];
    }
  }
}

export const userProfileService = new UserProfileService();
