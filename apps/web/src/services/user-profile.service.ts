/**
 * User Profile Service
 * Handles user role management, clinic associations, and permissions
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];
type StaffMemberRow = Database['public']['Tables']['staff_members']['Row'];

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
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
  role: string;
  specialization: string | null;
  crmNumber: string | null;
  avatarUrl: string | null;
}

export type UserRole = 'patient' | 'professional' | 'staff' | 'admin' | 'clinic_owner';

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
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // First check if user is a professional
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select(`
          *,
          clinics!inner(id, clinic_name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (professional && !profError) {
        return this.buildProfessionalProfile(professional);
      }

      // Check if user is staff member
      const { data: staff, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (staff && !staffError) {
        return this.buildStaffProfile(staff);
      }

      // If not professional or staff, treat as patient
      // Get user info from auth.users
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser.user) {
        throw new Error('User not found');
      }

      return this.buildPatientProfile(authUser.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      role: 'professional',
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
    const permissions = this.getStaffPermissions(staff.role);
    
    return {
      id: staff.user_id || '',
      email: staff.email,
      role: this.mapStaffRole(staff.role),
      clinicId: '', // Staff members don't have direct clinic association in current schema
      fullName: staff.name,
      permissions,
      staffInfo: {
        id: staff.id,
        role: staff.role,
        specialization: staff.specialization,
        crmNumber: staff.crm_number,
        avatarUrl: staff.avatar_url,
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
      role: 'patient',
      clinicId: '', // Patients don't have a fixed clinic association
      fullName: authUser.user_metadata?.full_name || authUser.email || '',
      permissions,
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
  private getStaffPermissions(role: string): UserPermissions {
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

    switch (role.toLowerCase()) {
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
  hasPermission(userProfile: UserProfile, permission: keyof UserPermissions): boolean {
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
