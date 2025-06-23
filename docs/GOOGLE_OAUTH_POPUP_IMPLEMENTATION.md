# Google OAuth Popup Implementation - NeonPro

## Overview

This document describes the implementation of Google OAuth authentication using popup windows instead of full page redirects in the NeonPro application.

## Implementation Details

### 1. Components

#### SignInWithGooglePopupButton Component

**Location**: `components/auth/google-popup-button.tsx`

A reusable button component that handles Google OAuth authentication via popup window.

**Features**:

- Loading states with spinner
- Error handling with toast notifications
- Customizable text and styling
- Disabled state management

**Usage**:

```tsx
import { SignInWithGooglePopupButton } from "@/components/auth/google-popup-button";

// In your component
<SignInWithGooglePopupButton
  text="Sign in with Google"
  loadingText="Signing in..."
  className="w-full"
  disabled={isLoading}
/>;
```

### 2. AuthContext Updates

**Location**: `contexts/auth-context.tsx`

The `signInWithGoogle` method has been updated to support popup-based authentication:

```typescript
signInWithGoogle: async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (data?.url) {
    // Open popup window
    const popup = window.open(
      data.url,
      "googleAuth",
      `width=500,height=700,left=${left},top=${top}`
    );

    // Monitor popup for completion
    const checkInterval = setInterval(() => {
      // Check if popup was closed or if session exists
      // Clear interval when done
    }, 500);
  }

  return { error };
};
```

**Key Features**:

- Uses `skipBrowserRedirect: true` to prevent full page redirect
- Opens centered popup window (500x700 pixels)
- Monitors popup status every 500ms
- Handles session detection when authentication completes
- 5-minute timeout for authentication
- Proper cleanup of intervals

### 3. OAuth Callback Route

**Location**: `app/auth/callback/route.ts`

Enhanced to handle profile persistence:

```typescript
// After successful authentication
const profileData = {
  id: user.id,
  email: user.email!,
  full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
  avatar_url:
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  updated_at: new Date().toISOString(),
};

// Create or update profile in database
```

### 4. Database Schema

**Location**: `supabase/migrations/001_create_profiles_table.sql`

Created profiles table with:

- User profile storage
- RLS policies for security
- Automatic profile creation trigger
- Indexes for performance

### 5. Updated Pages

#### Login Page

**Location**: `app/login/page.tsx`

- Replaced custom Google button with `SignInWithGooglePopupButton`
- Removed duplicate OAuth handling logic

#### Signup Page

**Location**: `app/signup/page.tsx`

- Replaced custom Google button with `SignInWithGooglePopupButton`
- Removed duplicate OAuth handling logic

## Configuration Requirements

### Supabase Dashboard

1. **Site URL**:

   ```
   https://neonpro.vercel.app
   ```

2. **Redirect URLs** (add all):

   ```
   # Production
   https://neonpro.vercel.app/auth/callback
   https://neonpro.vercel.app/dashboard
   https://neonpro.vercel.app/login

   # Development
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   http://localhost:3000/login

   # Preview Deployments
   https://neonpro-*.vercel.app/auth/callback
   ```

### Google Cloud Console

1. **Authorized JavaScript origins**:

   ```
   https://neonpro.vercel.app
   http://localhost:3000
   https://gfkskrkbnawkuppazkpt.supabase.co
   ```

2. **Authorized redirect URIs**:
   ```
   https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
   https://neonpro.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

## User Flow

1. User clicks "Sign in with Google" button
2. Popup window opens with Google OAuth consent screen
3. User authorizes the application
4. Google redirects to `/auth/callback` with authorization code
5. Callback route exchanges code for session
6. Profile is created/updated in database
7. Popup closes automatically
8. Main window detects session and redirects to dashboard

## Error Handling

### Popup Blocked

- Shows toast: "Por favor, permita popups para fazer login com Google"
- User must enable popups in browser

### Authentication Cancelled

- Shows toast: "Login cancelado"
- User closed popup without completing authentication

### Authentication Timeout

- Shows toast: "Tempo de autenticação expirado. Tente novamente."
- Occurs after 5 minutes

### General Errors

- Shows toast with specific error message
- Logs detailed error to console for debugging

## Testing

### Local Development

```bash
# Start development server
pnpm dev

# Test at http://localhost:3000/login
```

### Test Scenarios

1. ✅ Successful login with existing account
2. ✅ Successful signup with new account
3. ✅ Popup blocked by browser
4. ✅ User cancels authentication
5. ✅ Authentication timeout
6. ✅ Network errors
7. ✅ Profile creation/update

## Security Considerations

- OAuth state parameter prevents CSRF attacks
- RLS policies ensure users can only access their own profiles
- Sensitive operations happen server-side in route handlers
- No client-side secrets exposed

## Troubleshooting

### Common Issues

1. **Popup doesn't open**

   - Check browser popup blocker settings
   - Ensure button click handler is synchronous

2. **"redirect_uri_mismatch" error**

   - Verify all URLs match exactly in Google Console and Supabase
   - Check for trailing slashes

3. **Session not detected after authentication**

   - Check if cookies are enabled
   - Verify Supabase client configuration
   - Check browser console for errors

4. **Profile not created**
   - Check database logs in Supabase dashboard
   - Verify RLS policies allow insert
   - Check trigger function for errors
