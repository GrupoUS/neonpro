// app/api/profile/sync/route.ts  
// VIBECODE V1.0 - Google Profile Synchronization API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23

import { createClient } from '@/app/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user metadata for Google profile sync
    const googleData = user.user_metadata || {}
    const appData = user.app_metadata || {}

    // Check if user has Google provider
    const hasGoogleProvider = user.identities?.some(
      (identity: any) => identity.provider === 'google'
    )

    if (!hasGoogleProvider) {
      return NextResponse.json(
        { error: 'No Google provider', message: 'User is not authenticated with Google' },
        { status: 400 }
      )
    }

    // Extract Google profile data
    const profileData = {
      email: user.email,
      full_name: googleData.full_name || googleData.name,
      first_name: googleData.given_name,
      last_name: googleData.family_name,
      avatar_url: googleData.avatar_url || googleData.picture,
      google_provider_id: googleData.provider_id || googleData.sub,
      google_picture: googleData.picture,
      google_verified_email: user.email_confirmed_at ? true : false,
      profile_sync_status: 'synced',
      google_sync_enabled: true,
      last_google_sync: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Update profile with Google data
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile sync error:', updateError)
      
      // Try to insert if update failed (profile doesn't exist)
      if (updateError.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...profileData,
            role: 'professional',
            data_consent_given: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error('Profile creation error:', insertError)
          return NextResponse.json(
            { error: 'Sync failed', message: 'Could not create or update profile' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Profile created and synced with Google',
          profile: newProfile
        })
      }

      return NextResponse.json(
        { error: 'Sync failed', message: updateError.message },
        { status: 500 }
      )
    }

    // Update profile sync status
    await supabase
      .from('profile_sync_status')
      .upsert({
        user_id: user.id,
        sync_status: 'synced',
        google_sync_enabled: true,
        last_sync: new Date().toISOString(),
        google_verified: profileData.google_verified_email,
        has_conflicts: false,
        updated_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Profile successfully synced with Google',
      profile,
      sync_timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Profile sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Profile sync failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get current profile and sync status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found', message: profileError.message },
        { status: 404 }
      )
    }

    const { data: syncStatus, error: syncError } = await supabase
      .from('profile_sync_status')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      profile,
      sync_status: syncStatus,
      google_connected: user.identities?.some(
        (identity: any) => identity.provider === 'google'
      ) || false
    })

  } catch (error) {
    console.error('Profile sync GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Could not fetch profile sync data' },
      { status: 500 }
    )
  }
}
