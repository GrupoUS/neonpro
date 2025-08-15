// app/api/profile/updates/route.ts
// VIBECODE V1.0 - Google Profile Updates Handler API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

interface GoogleProfileUpdate {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { google_profile_data, force_update = false } = body;

    if (!google_profile_data) {
      return NextResponse.json(
        { error: 'Missing data', message: 'google_profile_data is required' },
        { status: 400 }
      );
    }

    // Get current profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'Profile not found', message: profileError.message },
        { status: 404 }
      );
    }

    // Extract updates from Google profile data
    const googleUpdate: GoogleProfileUpdate = google_profile_data;
    const changes: Record<string, any> = {};
    const conflicts: Record<string, any> = {};

    // Check for changes and conflicts
    if (googleUpdate.email && googleUpdate.email !== currentProfile.email) {
      if (currentProfile.email && !force_update) {
        conflicts.email = {
          current: currentProfile.email,
          google: googleUpdate.email,
        };
      } else {
        changes.email = googleUpdate.email;
      }
    }

    if (googleUpdate.name && googleUpdate.name !== currentProfile.full_name) {
      if (currentProfile.full_name && !force_update) {
        conflicts.full_name = {
          current: currentProfile.full_name,
          google: googleUpdate.name,
        };
      } else {
        changes.full_name = googleUpdate.name;
      }
    }

    if (
      googleUpdate.given_name &&
      googleUpdate.given_name !== currentProfile.first_name
    ) {
      if (currentProfile.first_name && !force_update) {
        conflicts.first_name = {
          current: currentProfile.first_name,
          google: googleUpdate.given_name,
        };
      } else {
        changes.first_name = googleUpdate.given_name;
      }
    }

    if (
      googleUpdate.family_name &&
      googleUpdate.family_name !== currentProfile.last_name
    ) {
      if (currentProfile.last_name && !force_update) {
        conflicts.last_name = {
          current: currentProfile.last_name,
          google: googleUpdate.family_name,
        };
      } else {
        changes.last_name = googleUpdate.family_name;
      }
    }

    if (
      googleUpdate.picture &&
      googleUpdate.picture !== currentProfile.google_picture
    ) {
      changes.google_picture = googleUpdate.picture;
      changes.avatar_url = googleUpdate.picture;
    }

    if (googleUpdate.email_verified !== undefined) {
      changes.google_verified_email = googleUpdate.email_verified;
    }

    // If there are conflicts and force_update is false, return conflicts
    if (Object.keys(conflicts).length > 0 && !force_update) {
      await supabase
        .from('profiles')
        .update({
          profile_sync_status: 'conflict',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return NextResponse.json({
        success: false,
        message: 'Profile conflicts detected',
        conflicts,
        suggested_changes: changes,
        requires_resolution: true,
      });
    }

    // Apply changes if any
    if (Object.keys(changes).length > 0) {
      const updateData = {
        ...changes,
        profile_sync_status: 'synced',
        last_google_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: 'Update failed', message: updateError.message },
          { status: 500 }
        );
      }

      // Update sync status
      await supabase.from('profile_sync_status').upsert({
        user_id: user.id,
        sync_status: 'synced',
        google_sync_enabled: true,
        last_sync: new Date().toISOString(),
        google_verified:
          googleUpdate.email_verified || currentProfile.google_verified_email,
        has_conflicts: false,
        updated_at: new Date().toISOString(),
      });

      // Log the update for audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        event_type: 'profile_update_from_google',
        event_data: {
          changes,
          conflicts: Object.keys(conflicts),
          force_update,
          google_data: googleUpdate,
        },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully from Google',
        profile: updatedProfile,
        changes_applied: changes,
        conflicts_resolved: Object.keys(conflicts).length,
      });
    }

    // No changes needed
    return NextResponse.json({
      success: true,
      message: 'Profile already up to date',
      profile: currentProfile,
      no_changes_needed: true,
    });
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Profile update failed' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get current profile and recent update history
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found', message: profileError.message },
        { status: 404 }
      );
    }

    // Get recent update logs
    const { data: updateLogs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_type', 'profile_update_from_google')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      profile,
      sync_status: profile.profile_sync_status,
      last_google_sync: profile.last_google_sync,
      google_sync_enabled: profile.google_sync_enabled,
      recent_updates: updateLogs || [],
      can_force_update: true,
    });
  } catch (error) {
    console.error('Profile updates GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Could not fetch update information',
      },
      { status: 500 }
    );
  }
}
