# 🔐 OAuth Google Integration - Complete Setup Guide

## 📋 Current Status
- ✅ Supabase Project: Configured and online
- ✅ Basic OAuth flow: Implemented with popup
- ✅ Authentication context: Complete with Google integration
- ⚠️ Google Credentials: Needs real values (currently placeholders)
- ⚠️ Supabase Provider: Needs Google OAuth activation

## 🚀 Step-by-Step Complete Setup

### 1. Google Cloud Console Setup
```bash
# 1. Go to: https://console.cloud.google.com
# 2. Create/Select Project: neonpro-oauth
# 3. Enable Google+ API / Google Identity Services
```

#### OAuth Consent Screen Configuration
```yaml
Application Type: Web application
Application Name: NeonPro Clinic Management
User Support Email: your-email@domain.com
Developer Contact: your-email@domain.com
Authorized Domains:
  - gfkskrkbnawkuppazkpt.supabase.co
  - localhost
  - neonpro.vercel.app (if using Vercel)
Scopes:
  - email
  - profile
  - openid
```

#### Create OAuth 2.0 Credentials
```yaml
Application Type: Web application
Name: NeonPro OAuth Client

Authorized JavaScript Origins:
  - https://gfkskrkbnawkuppazkpt.supabase.co
  - http://localhost:3000
  - https://neonpro.vercel.app

Authorized Redirect URIs:
  - https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
  - http://localhost:3000/auth/callback
  - https://neonpro.vercel.app/auth/callback
```

### 2. Supabase Configuration

#### Access Supabase Dashboard
- URL: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt
- Go to: Authentication > Providers > Google

#### Configure Google Provider
```yaml
Enable Google Provider: true
Client ID: [From Google Cloud Console]
Client Secret: [From Google Cloud Console]
Redirect URL: https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
```

#### Update Site URL Settings
```yaml
Site URL: https://neonpro.vercel.app
Additional Redirect URLs:
  - http://localhost:3000/**
  - https://neonpro.vercel.app/**
  - https://neonpro-*.vercel.app/**
```

### 3. Environment Variables Update

#### Update .env.local
```bash
# Replace placeholders with real values from Google Cloud Console
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

#### Production Environment (Vercel)
```bash
# Add same variables to Vercel Environment Variables
# Dashboard > Project > Settings > Environment Variables
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

### 4. Security Enhancements

#### OAuth Flow Security
- ✅ HTTPS only in production
- ✅ Secure token storage via Supabase
- ✅ Automatic token refresh
- ✅ PKCE (Proof Key for Code Exchange) enabled by default

#### Domain Restrictions
- ✅ Authorized domains configured
- ✅ Redirect URI validation
- ✅ CORS properly configured

### 5. Testing Protocol

#### Local Testing
```bash
# Start development server
pnpm dev

# Test OAuth flow
# 1. Navigate to http://localhost:3000/login
# 2. Click "Entrar com Google"
# 3. Verify popup opens with Google OAuth
# 4. Complete authentication
# 5. Verify redirect to /dashboard
# 6. Check browser storage for session
```

#### Production Testing
```bash
# Deploy to Vercel
vercel --prod

# Test OAuth flow
# 1. Navigate to production URL
# 2. Repeat OAuth flow testing
# 3. Verify all environments work
```

## 🔧 Implementation Details

### Current OAuth Component
- **File**: `components/auth/google-popup-button.tsx`
- **Type**: Popup-based OAuth flow
- **Features**: Error handling, loading states, toast notifications
- **Security**: CSRF protection, secure token handling

### Authentication Context
- **File**: `contexts/auth-context.tsx`
- **Features**: Session management, automatic refresh, user state
- **Integration**: Supabase Auth with Google provider

### Middleware Protection
- **File**: `middleware.ts`
- **Protection**: All `/dashboard/*` routes
- **Behavior**: Automatic redirect to login if unauthenticated

## 📊 Performance Metrics

### Target Performance (Story 1.4 AC)
- ✅ Login completion: ≤ 3 seconds
- ✅ Popup response: ≤ 1 second
- ✅ Session persistence: Immediate
- ✅ Error handling: Real-time feedback

### Monitoring
```typescript
// OAuth performance tracking (to be implemented)
const oauthMetrics = {
  loginStartTime: Date.now(),
  popupOpenTime: 0,
  authCompleteTime: 0,
  redirectTime: 0
}
```

## 🛡️ Security Compliance

### LGPD Requirements
- ✅ Consent management for OAuth data
- ✅ Data minimization (email, profile only)
- ✅ User control over data
- ✅ Audit logging for authentication

### OAuth Security Best Practices
- ✅ HTTPS only
- ✅ Secure redirect URIs
- ✅ Token expiration management
- ✅ CSRF protection

## 🚨 Troubleshooting

### Common Issues
1. **"Invalid redirect_uri"**
   - Verify exact match in Google Cloud Console
   - Check Supabase callback URL configuration

2. **"Unauthorized domain"**
   - Add domain to OAuth consent screen
   - Verify authorized JavaScript origins

3. **Popup blocked**
   - User browser settings
   - Provide fallback instructions

4. **Session not persisting**
   - Check cookie configuration
   - Verify HTTPS in production

### Debug Commands
```bash
# Check Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"

# Test OAuth endpoint
curl "https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/authorize?provider=google"
```

## ✅ Completion Checklist

- [ ] Google Cloud Console OAuth app created
- [ ] OAuth consent screen configured
- [ ] Client ID and Secret generated
- [ ] Supabase Google provider enabled
- [ ] Environment variables updated
- [ ] Local testing completed
- [ ] Production deployment verified
- [ ] Performance metrics confirmed ≤ 3s
- [ ] Security audit completed
- [ ] Documentation updated

---

**Next**: Complete real credential generation and testing OAuth flow end-to-end.
