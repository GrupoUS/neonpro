-- ================================================================================
-- NEONPRO: Google OAuth Profile Synchronization System
-- Story 1.4 - OAuth Google Integration Enhancement 
-- ================================================================================
-- Purpose: Sync Google profile data with user records automatically
-- Created: 2025-07-22 | VIBECODE V1.0 Standards
-- ================================================================================

-- Create enhanced profiles table for professional users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic profile info from Google OAuth
  email text,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  
  -- Professional profile data for clinic management
  professional_title text,
  medical_license text,
  department text,
  phone text,
  role text DEFAULT 'professional' CHECK (role IN ('admin', 'doctor', 'nurse', 'staff', 'professional')),
  
  -- Google OAuth specific data
  google_provider_id text,
  google_picture text,
  google_verified_email boolean DEFAULT false,
  
  -- Profile sync metadata
  profile_sync_status text DEFAULT 'pending' CHECK (profile_sync_status IN ('pending', 'synced', 'conflict', 'error')),
  google_sync_enabled boolean DEFAULT true,
  last_google_sync timestamptz,
  
  -- Audit fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- LGPD compliance
  data_consent_given boolean DEFAULT false,
  data_consent_date timestamptz,
  
  UNIQUE(email),
  UNIQUE(google_provider_id)
);

-- Enable RLS for security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are inserted by triggers only" ON public.profiles
  FOR INSERT WITH CHECK (false);

-- ================================================================================
-- AUTOMATED PROFILE SYNC FUNCTIONS
-- ================================================================================

-- Function to extract and sync Google profile data
CREATE OR REPLACE FUNCTION public.sync_google_profile_data(user_id uuid, raw_user_metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  google_email text;
  google_name text;
  google_picture text;
  google_verified_email boolean;
  google_given_name text;
  google_family_name text;
  google_provider_id text;
BEGIN
  -- Extract Google OAuth data from metadata
  google_email := raw_user_metadata->>'email';
  google_name := raw_user_metadata->>'full_name';
  google_picture := raw_user_metadata->>'avatar_url';
  google_verified_email := COALESCE((raw_user_metadata->>'email_verified')::boolean, false);
  google_given_name := raw_user_metadata->>'given_name';
  google_family_name := raw_user_metadata->>'family_name';
  google_provider_id := raw_user_metadata->>'provider_id';

  -- Log sync attempt
  RAISE LOG 'Syncing Google profile for user %: email=%, name=%, verified=%', 
    user_id, google_email, google_name, google_verified_email;

  -- Update profile with Google data
  UPDATE public.profiles SET
    email = COALESCE(google_email, email),
    full_name = COALESCE(google_name, full_name),
    first_name = COALESCE(google_given_name, first_name),
    last_name = COALESCE(google_family_name, last_name),
    avatar_url = COALESCE(google_picture, avatar_url),
    google_picture = google_picture,
    google_provider_id = COALESCE(google_provider_id, google_provider_id),
    google_verified_email = google_verified_email,
    profile_sync_status = 'synced',
    last_google_sync = now(),
    updated_at = now()
  WHERE id = user_id;

  -- Log successful sync
  RAISE LOG 'Successfully synced Google profile for user %', user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and mark sync as failed
    RAISE LOG 'Error syncing Google profile for user %: %', user_id, SQLERRM;
    
    UPDATE public.profiles SET
      profile_sync_status = 'error',
      updated_at = now()
    WHERE id = user_id;
END;
$$;

-- ================================================================================
-- PROFILE CREATION AND SYNC TRIGGERS
-- ================================================================================

-- Function to handle new user creation with Google OAuth sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  provider_name text;
  user_email text;
  user_metadata jsonb;
BEGIN
  -- Get user data
  user_email := NEW.email;
  user_metadata := NEW.raw_user_meta_data;
  
  -- Check if this is a Google OAuth signup
  provider_name := user_metadata->>'provider';
  
  RAISE LOG 'Creating profile for new user %: email=%, provider=%', 
    NEW.id, user_email, provider_name;

  -- Create initial profile
  INSERT INTO public.profiles (
    id,
    email,
    created_at,
    data_consent_given,
    data_consent_date
  ) VALUES (
    NEW.id,
    user_email,
    now(),
    true, -- Implicit consent through OAuth signup
    now()
  );

  -- If Google OAuth, sync profile data immediately
  IF provider_name = 'google' THEN
    PERFORM public.sync_google_profile_data(NEW.id, user_metadata);
  END IF;

  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Don't block user creation
END;
$$;

-- Function to handle user metadata updates (profile sync)
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  provider_name text;
  google_sync_enabled boolean;
BEGIN
  -- Check if metadata changed
  IF OLD.raw_user_meta_data = NEW.raw_user_meta_data THEN
    RETURN NEW;
  END IF;

  -- Get provider info
  provider_name := NEW.raw_user_meta_data->>'provider';
  
  -- Check if Google sync is enabled for this user
  SELECT profiles.google_sync_enabled INTO google_sync_enabled
  FROM public.profiles
  WHERE profiles.id = NEW.id;

  -- Sync Google profile data if applicable
  IF provider_name = 'google' AND COALESCE(google_sync_enabled, true) THEN
    RAISE LOG 'Syncing Google profile data for user % due to metadata update', NEW.id;
    PERFORM public.sync_google_profile_data(NEW.id, NEW.raw_user_meta_data);
  END IF;

  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error handling metadata update for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Don't block user updates
END;
$$;

-- ================================================================================
-- TRIGGER SETUP
-- ================================================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user metadata updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_metadata_update();

-- ================================================================================
-- CONFLICT RESOLUTION FUNCTIONS
-- ================================================================================

-- Function to resolve profile conflicts (manual resolution)
CREATE OR REPLACE FUNCTION public.resolve_profile_conflict(
  user_id uuid,
  resolution_data jsonb,
  keep_google_data boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update profile with resolved data
  UPDATE public.profiles SET
    full_name = COALESCE(resolution_data->>'full_name', full_name),
    first_name = COALESCE(resolution_data->>'first_name', first_name),
    last_name = COALESCE(resolution_data->>'last_name', last_name),
    professional_title = COALESCE(resolution_data->>'professional_title', professional_title),
    department = COALESCE(resolution_data->>'department', department),
    phone = COALESCE(resolution_data->>'phone', phone),
    profile_sync_status = 'synced',
    updated_at = now()
  WHERE id = user_id;

  RAISE LOG 'Resolved profile conflict for user %', user_id;
END;
$$;

-- ================================================================================
-- ROLE ASSIGNMENT FUNCTIONS (Story 1.4 Integration)
-- ================================================================================

-- Function to assign role based on email domain
CREATE OR REPLACE FUNCTION public.assign_role_by_email_domain(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  email_domain text;
  assigned_role text DEFAULT 'professional';
BEGIN
  -- Extract domain from email
  email_domain := split_part(user_email, '@', 2);
  
  -- Domain-based role assignment logic
  CASE 
    WHEN email_domain IN ('admin.neonpro.com', 'management.clinic.com') THEN
      assigned_role := 'admin';
    WHEN email_domain IN ('doctor.clinic.com', 'medic.neonpro.com') THEN
      assigned_role := 'doctor';
    WHEN email_domain IN ('nurse.clinic.com', 'nursing.neonpro.com') THEN
      assigned_role := 'nurse';
    WHEN email_domain IN ('staff.clinic.com', 'support.neonpro.com') THEN
      assigned_role := 'staff';
    ELSE
      assigned_role := 'professional'; -- Default role
  END CASE;

  RAISE LOG 'Assigned role % to email % (domain: %)', assigned_role, user_email, email_domain;
  
  RETURN assigned_role;
END;
$$;

-- ================================================================================
-- UTILITY FUNCTIONS
-- ================================================================================

-- Function to get profile sync status
CREATE OR REPLACE FUNCTION public.get_profile_sync_status(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p.id,
    'sync_status', p.profile_sync_status,
    'google_sync_enabled', p.google_sync_enabled,
    'last_sync', p.last_google_sync,
    'google_verified', p.google_verified_email,
    'has_conflicts', CASE 
      WHEN p.profile_sync_status = 'conflict' THEN true 
      ELSE false 
    END
  ) INTO result
  FROM public.profiles p
  WHERE p.id = user_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- ================================================================================
-- GRANTS AND PERMISSIONS
-- ================================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_sync_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_profile_conflict(uuid, jsonb, boolean) TO authenticated;

-- ================================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_google_provider_id ON public.profiles(google_provider_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_sync_status ON public.profiles(profile_sync_status);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- ================================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================================

COMMENT ON TABLE public.profiles IS 'Enhanced user profiles with Google OAuth synchronization for NeonPro clinic management';
COMMENT ON FUNCTION public.sync_google_profile_data(uuid, jsonb) IS 'Synchronizes Google OAuth profile data with user records';
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to create profile and sync Google data for new users';
COMMENT ON FUNCTION public.assign_role_by_email_domain(text) IS 'Assigns user role based on email domain for clinic hierarchy';

-- ================================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ================================================================================
