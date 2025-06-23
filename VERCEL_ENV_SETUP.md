# Vercel Environment Variables Setup

## Required Environment Variables for NeonPro

Add these environment variables in your Vercel project settings:

### 1. Supabase Configuration (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. App Configuration (Required)
```
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_APP_NAME=NeonPro
NODE_ENV=production
```

### 3. Optional Services (Can be added later)
```
# WhatsApp Business API
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=your_whatsapp_phone_number_id

# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM=noreply@yourdomain.com

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

## How to Add in Vercel:

1. Go to your project in Vercel Dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables" in the left sidebar
4. For each variable:
   - Enter the Key (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the Value
   - Select environments (Production, Preview, Development)
   - Click "Add"

## Getting Supabase Keys:

1. Go to https://supabase.com/dashboard
2. Select your project (gfkskrkbnawkuppazkpt)
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## After Adding Variables:

1. Cancel the current deployment
2. Click "Create Deployment" again
3. The deployment should now proceed without errors

## Security Notes:

- Never commit `.env` files with real values to Git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use different keys for development and production