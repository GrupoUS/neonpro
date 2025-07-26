#!/bin/bash

# 🚀 NeonPro Vercel Deployment Setup Script
# 
# Configura automaticamente todas as variáveis de ambiente
# e prepara o projeto para deployment no Vercel
# 
# Usage: ./scripts/setup-vercel.sh

set -e  # Exit on any error

echo "🚀 Setting up NeonPro for Vercel deployment..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️ .env.local not found. Please create it based on .env.example"
    exit 1
fi

echo "🔧 Setting up Vercel environment variables..."

# Function to set environment variable in Vercel
set_vercel_env() {
    local key=$1
    local value=$(grep "^${key}=" .env.local | cut -d '=' -f2-)
    
    if [ -n "$value" ]; then
        echo "Setting $key..."
        echo "$value" | vercel env add "$key" production
    else
        echo "⚠️ Warning: $key not found in .env.local"
    fi
}

# Set required environment variables
echo "📋 Required Supabase variables:"
set_vercel_env "NEXT_PUBLIC_SUPABASE_URL"
set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"
set_vercel_env "SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "📋 Authentication variables:"
set_vercel_env "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
set_vercel_env "GOOGLE_CLIENT_SECRET"
set_vercel_env "NEXT_PUBLIC_SITE_URL"

echo ""
echo "📋 Email service variables:"
set_vercel_env "RESEND_API_KEY"
set_vercel_env "DEFAULT_FROM_EMAIL"
set_vercel_env "DEFAULT_REPLY_TO_EMAIL"

echo ""
echo "📋 Trigger.dev background jobs:"
set_vercel_env "TRIGGER_SECRET_KEY"
set_vercel_env "TRIGGER_API_URL"
set_vercel_env "TRIGGER_PROJECT_ID"

echo ""
echo "📋 Optional monitoring:"
set_vercel_env "SENTRY_DSN"
set_vercel_env "NEXT_PUBLIC_SENTRY_DSN"

echo ""
echo "🏗️ Running pre-deployment checks..."

# Check build works
echo "📦 Testing production build..."
pnpm build

# Check TypeScript compilation
echo "🔍 Running TypeScript checks..."
pnpm run type-check

# Check linting
echo "🔍 Running lint checks..."
pnpm lint

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Ready for deployment! Run one of:"
echo "   vercel --prod              # Deploy to production"
echo "   vercel                     # Deploy to preview"
echo ""
echo "📋 After deployment, don't forget to:"
echo "   1. Test the /api/trigger endpoint"
echo "   2. Create a test appointment via /api/appointments/enhanced"
echo "   3. Check Trigger.dev dashboard for job executions"
echo "   4. Verify emails are being sent correctly"
echo ""