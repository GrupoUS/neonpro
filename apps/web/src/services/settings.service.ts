/**
 * Settings Service - Fetches and updates user/clinic settings from Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    preferred_language: string | null;
    notification_preferences: NotificationPreferences | null;
    clinic_id: string | null;
    tenant_id: string | null;
    role: string | null;
}

export interface ClinicSettings {
    id: string;
    clinic_name: string | null;
    timezone: string | null;
    address: string | null;
    phone: string | null;
}

export interface NotificationPreferences {
    appointment_notifications: boolean;
    appointment_reminders: boolean;
    financial_reports: boolean;
    system_updates: boolean;
}

export interface TeamStats {
    activeUsers: number;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    appointment_notifications: true,
    appointment_reminders: true,
    financial_reports: false,
    system_updates: true,
};

/**
 * Fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        id,
        email,
        full_name,
        preferred_language,
        notification_preferences,
        clinic_id,
        tenant_id,
        role
      `)
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[settings] Error fetching user profile:', error.message);
            return null;
        }

        return data as UserProfile;
    } catch (e) {
        console.error('[settings] Exception fetching user profile:', e);
        return null;
    }
}

/**
 * Fetch clinic settings
 */
export async function fetchClinicSettings(clinicId: string): Promise<ClinicSettings | null> {
    console.log('[settings] fetchClinicSettings called with clinicId:', clinicId);
    try {
        const { data, error } = await supabase
            .from('clinics')
            .select(`
        id,
        clinic_name,
        timezone,
        address,
        phone
      `)
            .eq('id', clinicId)
            .single();

        if (error) {
            console.error('[settings] Error fetching clinic settings:', error.message);
            return null;
        }

        console.log('[settings] Clinic data fetched:', data);
        return data as ClinicSettings;
    } catch (e) {
        console.error('[settings] Exception fetching clinic settings:', e);
        return null;
    }
}

/**
 * Update user preferred language
 */
export async function updateUserLanguage(userId: string, language: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ preferred_language: language })
            .eq('id', userId);

        if (error) {
            console.error('[settings] Error updating language:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[settings] Exception updating language:', e);
        return false;
    }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ notification_preferences: preferences as any })
            .eq('id', userId);

        if (error) {
            console.error('[settings] Error updating notification preferences:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[settings] Exception updating notification preferences:', e);
        return false;
    }
}

/**
 * Update clinic name
 */
export async function updateClinicName(clinicId: string, clinicName: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('clinics')
            .update({ clinic_name: clinicName })
            .eq('id', clinicId);

        if (error) {
            console.error('[settings] Error updating clinic name:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[settings] Exception updating clinic name:', e);
        return false;
    }
}

/**
 * Update clinic timezone
 */
export async function updateClinicTimezone(clinicId: string, timezone: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('clinics')
            .update({ timezone: timezone })
            .eq('id', clinicId);

        if (error) {
            console.error('[settings] Error updating timezone:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[settings] Exception updating timezone:', e);
        return false;
    }
}

/**
 * Get team statistics (active users count)
 */
export async function fetchTeamStats(tenantId: string): Promise<TeamStats> {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        if (error) {
            console.error('[settings] Error fetching team stats:', error.message);
            return { activeUsers: 0 };
        }

        return { activeUsers: count || 0 };
    } catch (e) {
        console.error('[settings] Exception fetching team stats:', e);
        return { activeUsers: 0 };
    }
}

/**
 * Get notification preferences with defaults
 */
export function getNotificationPreferences(
    raw: NotificationPreferences | null
): NotificationPreferences {
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return {
        appointment_notifications: raw.appointment_notifications ?? DEFAULT_NOTIFICATION_PREFERENCES.appointment_notifications,
        appointment_reminders: raw.appointment_reminders ?? DEFAULT_NOTIFICATION_PREFERENCES.appointment_reminders,
        financial_reports: raw.financial_reports ?? DEFAULT_NOTIFICATION_PREFERENCES.financial_reports,
        system_updates: raw.system_updates ?? DEFAULT_NOTIFICATION_PREFERENCES.system_updates,
    };
}

/**
 * Create clinic request data
 */
export interface CreateClinicData {
    clinicName: string;
    timezone?: string;
    clinicType?: 'aesthetic' | 'beauty' | 'medical_aesthetic' | 'dermatology' | 'plastic_surgery' | 'wellness' | 'spa' | 'other';
    email?: string;
    phone?: string;
}

/**
 * Generate unique clinic code
 */
function generateClinicCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLI-${timestamp.slice(-4)}${random}`;
}

/**
 * Create a new clinic for a user
 */
export async function createClinic(
    userId: string,
    data: CreateClinicData
): Promise<{ clinicId: string; success: boolean; error?: string }> {
    try {
        const clinicCode = generateClinicCode();

        const { data: clinic, error } = await supabase
            .from('clinics')
            .insert({
                clinic_code: clinicCode,
                clinic_name: data.clinicName,
                timezone: data.timezone || 'America/Sao_Paulo',
                clinic_type: data.clinicType || 'aesthetic',
                email: data.email,
                phone: data.phone,
                created_by: userId,
                status: 'active',
                is_active: true,
                compliance_level: 'basic',
                business_type: 'clinic',
                features_enabled: ['appointments', 'patients', 'financial'],
            })
            .select('id')
            .single();

        if (error) {
            console.error('[settings] Error creating clinic:', error.message);
            return { clinicId: '', success: false, error: error.message };
        }

        // Link user to the newly created clinic
        const linked = await linkUserToClinic(userId, clinic.id);
        if (!linked) {
            return { clinicId: clinic.id, success: false, error: 'Clínica criada, mas falha ao vincular usuário' };
        }

        return { clinicId: clinic.id, success: true };
    } catch (e) {
        console.error('[settings] Exception creating clinic:', e);
        return { clinicId: '', success: false, error: 'Erro ao criar clínica' };
    }
}

/**
 * Link a user to a clinic (update profile with clinic_id)
 */
export async function linkUserToClinic(userId: string, clinicId: string): Promise<boolean> {
    try {
        // Only update clinic_id - tenant_id has FK to different table
        const { error } = await supabase
            .from('profiles')
            .update({
                clinic_id: clinicId,
            })
            .eq('id', userId);

        if (error) {
            console.error('[settings] Error linking user to clinic:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[settings] Exception linking user to clinic:', e);
        return false;
    }
}

/**
 * Get or create clinic for user
 * If user has no clinic, creates one with the given name
 */
export async function getOrCreateClinic(
    userId: string,
    clinicName: string
): Promise<{ clinicId: string | null; isNew: boolean; error?: string }> {
    try {
        // First check if user already has a clinic
        const profile = await fetchUserProfile(userId);
        const existingClinicId = profile?.clinic_id || profile?.tenant_id;

        if (existingClinicId) {
            return { clinicId: existingClinicId, isNew: false };
        }

        // Create new clinic
        const result = await createClinic(userId, { clinicName });
        if (!result.success) {
            return { clinicId: null, isNew: false, error: result.error };
        }

        return { clinicId: result.clinicId, isNew: true };
    } catch (e) {
        console.error('[settings] Exception in getOrCreateClinic:', e);
        return { clinicId: null, isNew: false, error: 'Erro ao obter ou criar clínica' };
    }
}
