# Google Calendar Integration Setup Guide

## Prerequisites

- Node.js 18 or higher
- PNPM package manager
- Supabase project
- Google Cloud Console account

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project selector at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "NeonPro Calendar Integration")
5. Click "CREATE"

### 1.2 Enable Google Calendar API

1. In the navigation menu, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "ENABLE"

### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" and click "CREATE"
3. Fill in the required fields:
   - **App name**: NeonPro
   - **User support email**: support@neonpro.com.br
   - **Developer contact email**: dev@neonpro.com.br
4. Click "SAVE AND CONTINUE"

#### Scopes Configuration

In the "Scopes" section, add the following scopes:
- `https://www.googleapis.com/auth/calendar` (Google Calendar API)
- `https://www.googleapis.com/auth/calendar.events` (Calendar Events)

#### Test Users

Add test users for development:
- Click "+ ADD USERS"
- Enter email addresses of test accounts
- Click "ADD"

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. Select "Web application" as the application type
4. Configure authorized redirect URIs:
   - Development: `http://localhost:3000/api/google-calendar/callback`
   - Production: `https://app.neonpro.com.br/api/google-calendar/callback`
5. Click "CREATE"

### 1.5 Download Credentials

1. After creating credentials, download the JSON file
2. Note the Client ID and Client Secret
3. Keep these secure - you'll need them for environment variables

## Step 2: Environment Configuration

### 2.1 Update .env.local

Add the following environment variables to your `.env.local` file:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id-from-google-cloud
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-cloud
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2.2 Update Supabase Environment

If using Supabase Edge Functions, update `.env.supabase`:

```env
GOOGLE_CLIENT_ID=your-client-id-from-google-cloud
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-cloud
GOOGLE_REDIRECT_URI=https://app.neonpro.com.br/api/google-calendar/callback
```

## Step 3: Database Setup

### 3.1 Run Migrations

The Google Calendar integration includes database migrations. Run them:

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### 3.2 Verify Schema

The following tables should be created:
- `google_calendar_integrations`
- `google_calendar_events`
- `google_calendar_sync_logs`

## Step 4: Install Dependencies

```bash
# Install Google API client
pnpm add googleapis

# Install types if needed
pnpm add -D @types/googleapis
```

## Step 5: API Routes Setup

The integration includes API routes in `/pages/api/google-calendar/`. Ensure they're properly configured:

1. **`/auth/initiate`** - Initiates OAuth flow
2. **`/auth/callback`** - Handles OAuth callback
3. **`/integration`** - CRUD operations for integrations
4. **`/sync/*`** - Synchronization endpoints
5. **`/webhook`** - Webhook handler

## Step 6: UI Integration

The React components are located in `/components/google-calendar/`:

1. **ConnectButton** - Initiates OAuth connection
2. **IntegrationPanel** - Manages integration settings
3. **SyncSettings** - Configures sync preferences
4. **ActivityMonitor** - Shows sync activity

### Add to Settings Page

```tsx
import { IntegrationPanel } from '@/components/google-calendar/integration-panel';

export default function Settings() {
  return (
    <div>
      <h1>Integrations</h1>
      <IntegrationPanel userId={user.id} />
    </div>
  );
}
```

## Step 7: Testing

### 7.1 Unit Tests

```bash
# Run Google Calendar tests
pnpm test:unit google-calendar
```

### 7.2 Manual Testing

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the settings page
3. Click "Conectar Google Calendar"
4. Complete the OAuth flow
5. Verify integration is created
6. Create an appointment and check if it syncs to Google Calendar

### 7.3 Test Scenarios

- ✅ Connect/disconnect integration
- ✅ Create appointment → sync to Google Calendar
- ✅ Update appointment → update in Google Calendar
- ✅ Cancel appointment → delete from Google Calendar
- ✅ Handle authentication errors
- ✅ Handle rate limits
- ✅ Verify compliance features

## Step 8: Production Deployment

### 8.1 Update Production Environment

1. Update production environment variables
2. Ensure production redirect URI is configured in Google Cloud Console
3. Set up proper CORS configuration

### 8.2 Security Review

1. Verify all tokens are encrypted
2. Check that client secret is not exposed
3. Ensure proper access controls are in place
4. Verify audit logging is working

### 8.3 Monitoring

Set up monitoring for:
- Sync success rates
- API error rates
- Authentication failures
- Rate limit occurrences

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error

**Problem**: OAuth callback fails with redirect URI mismatch

**Solution**:
- Verify redirect URI in Google Cloud Console exactly matches
- Check for trailing slashes
- Ensure HTTP vs HTTPS matches

#### 2. "access_denied" Error

**Problem**: User denies access or scopes not configured

**Solution**:
- Verify OAuth consent screen is configured
- Check that required scopes are added
- Ensure user is in test users list (for development)

#### 3. Sync Not Working

**Problem**: Appointments not syncing to Google Calendar

**Solution**:
- Check if integration is enabled
- Verify sync settings
- Review sync logs for errors
- Check user has calendar permissions

#### 4. Rate Limit Errors

**Problem**: Google Calendar API returns 429 errors

**Solution**:
- Implement batch operations
- Add delays between syncs
- Use exponential backoff
- Monitor API usage

### Debug Mode

Enable debug logging:

```typescript
// In development
const service = new GoogleCalendarService({
  debug: true
});
```

## Support

If you encounter issues:

1. Check the [troubleshooting guide](./google-calendar-integration.md#troubleshooting)
2. Review sync logs in the dashboard
3. Check browser console for errors
4. Verify network requests in DevTools
5. Contact the development team

## Security Best Practices

1. Never commit client secret to version control
2. Use environment variables for sensitive data
3. Regularly rotate OAuth credentials
4. Monitor API usage for anomalies
5. Keep dependencies up to date
6. Implement proper error handling to prevent data leakage

---

This setup guide should help you get the Google Calendar integration running in your NeonPro application. For more detailed information, see the [full documentation](./google-calendar-integration.md).