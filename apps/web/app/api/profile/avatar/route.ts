// app/api/profile/avatar/route.ts
// VIBECODE V1.0 - Avatar/Photo Synchronization API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

interface AvatarSyncData {
  google_picture_url?: string;
  sync_to_local_storage?: boolean;
  force_update?: boolean;
  custom_avatar_url?: string;
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
    const {
      google_picture_url,
      sync_to_local_storage = false,
      force_update = false,
      custom_avatar_url,
    }: AvatarSyncData = body;

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

    let finalAvatarUrl = '';
    let syncMethod = '';

    // Priority order: custom_avatar_url > google_picture_url > existing
    if (custom_avatar_url) {
      finalAvatarUrl = custom_avatar_url;
      syncMethod = 'custom_upload';
    } else if (google_picture_url) {
      if (sync_to_local_storage) {
        // Download and store Google photo locally in Supabase Storage
        try {
          const response = await fetch(google_picture_url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch Google avatar: ${response.statusText}`
            );
          }

          const imageBuffer = await response.arrayBuffer();
          const fileName = `avatars/${user.id}/google-avatar-${Date.now()}.jpg`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from('avatars')
              .upload(fileName, imageBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
              });

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            // Fallback to direct Google URL
            finalAvatarUrl = google_picture_url;
            syncMethod = 'google_direct_fallback';
          } else {
            // Get public URL of uploaded file
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            finalAvatarUrl = publicUrlData.publicUrl;
            syncMethod = 'local_storage';
          }
        } catch (error) {
          console.error('Local storage sync error:', error);
          // Fallback to direct Google URL
          finalAvatarUrl = google_picture_url;
          syncMethod = 'google_direct_fallback';
        }
      } else {
        // Use Google URL directly
        finalAvatarUrl = google_picture_url;
        syncMethod = 'google_direct';
      }
    } else {
      // No new avatar provided, keep existing
      finalAvatarUrl = currentProfile.avatar_url || '';
      syncMethod = 'no_change';
    }

    // Check if update is needed
    const needsUpdate =
      force_update ||
      finalAvatarUrl !== currentProfile.avatar_url ||
      (google_picture_url &&
        google_picture_url !== currentProfile.google_picture);

    if (!needsUpdate && syncMethod === 'no_change') {
      return NextResponse.json({
        success: true,
        message: 'Avatar already up to date',
        avatar_url: currentProfile.avatar_url,
        sync_method: 'no_change_needed',
      });
    }

    // Update profile with new avatar information
    const updateData = {
      avatar_url: finalAvatarUrl,
      google_picture: google_picture_url || currentProfile.google_picture,
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
      console.error('Profile avatar update error:', updateError);
      return NextResponse.json(
        { error: 'Update failed', message: updateError.message },
        { status: 500 }
      );
    }

    // Log avatar sync event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      event_type: 'avatar_sync',
      event_data: {
        sync_method: syncMethod,
        previous_avatar: currentProfile.avatar_url,
        new_avatar: finalAvatarUrl,
        google_picture_url,
        sync_to_local_storage,
        force_update,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar synchronized successfully',
      profile: updatedProfile,
      sync_details: {
        method: syncMethod,
        avatar_url: finalAvatarUrl,
        local_storage_used:
          sync_to_local_storage && syncMethod === 'local_storage',
        previous_avatar: currentProfile.avatar_url,
      },
    });
  } catch (error) {
    console.error('Avatar sync API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Avatar synchronization failed',
      },
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

    // Get current profile avatar information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'avatar_url, google_picture, google_sync_enabled, last_google_sync'
      )
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found', message: profileError.message },
        { status: 404 }
      );
    }

    // Get recent avatar sync logs
    const { data: syncLogs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_type', 'avatar_sync')
      .order('created_at', { ascending: false })
      .limit(5);

    // Check storage bucket info
    const { data: bucketInfo, error: bucketError } = await supabase.storage
      .from('avatars')
      .list(`avatars/${user.id}`, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    return NextResponse.json({
      current_avatar: profile.avatar_url,
      google_picture: profile.google_picture,
      google_sync_enabled: profile.google_sync_enabled,
      last_sync: profile.last_google_sync,
      recent_syncs: syncLogs || [],
      local_storage: {
        has_local_avatars: bucketInfo && bucketInfo.length > 0,
        avatar_count: bucketInfo?.length || 0,
        recent_uploads: bucketInfo || [],
      },
      sync_options: {
        can_sync_from_google: Boolean(profile.google_picture),
        can_upload_custom: true,
        can_sync_to_local_storage: true,
      },
    });
  } catch (error) {
    console.error('Avatar info GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Could not fetch avatar information',
      },
      { status: 500 }
    );
  }
}
