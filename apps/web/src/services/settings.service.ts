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
