#!/bin/bash

# ========================================================
# NeonPro - Vercel Environment Variables Setup Script
# ========================================================

set -e  # Exit on any error

echo "🚀 Setting up Vercel environment variables for NeonPro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for environment variable
prompt_env_var() {
    local var_name=$1
    local description=$2
    local is_secret=${3:-false}
    
    echo -e "${BLUE}Setting up: ${var_name}${NC}"
    echo -e "${YELLOW}Description: ${description}${NC}"
    
    if [ "$is_secret" = true ]; then
        echo -n "Enter value (hidden): "
        read -s var_value
        echo
    else
        echo -n "Enter value: "
        read var_value
    fi
    
    if [ -n "$var_value" ]; then
        vercel env add "$var_name" production <<< "$var_value"
        vercel env add "$var_name" preview <<< "$var_value"
        echo -e "${GREEN}✅ $var_name configured${NC}"
    else
        echo -e "${RED}❌ Skipped $var_name (empty value)${NC}"
    fi
    echo
}

echo -e "${GREEN}Setting up Production Environment Variables...${NC}"
echo

# Database Configuration
echo -e "${BLUE}=== DATABASE CONFIGURATION ===${NC}"
prompt_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL"
prompt_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key" true
prompt_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (admin access)" true
prompt_env_var "SUPABASE_JWT_SECRET" "Supabase JWT secret" true

# API Configuration
echo -e "${BLUE}=== API CONFIGURATION ===${NC}"
prompt_env_var "NEXT_PUBLIC_API_URL" "Public API URL (e.g., https://neonpro.vercel.app/api)"
prompt_env_var "API_BASE_URL" "Internal API base URL"

# Security
echo -e "${BLUE}=== SECURITY CONFIGURATION ===${NC}"
prompt_env_var "NEXTAUTH_SECRET" "NextAuth secret (32+ characters)" true
prompt_env_var "NEXTAUTH_URL" "NextAuth URL (your production domain)"
prompt_env_var "ENCRYPTION_KEY" "Encryption key (exactly 32 characters)" true
prompt_env_var "JWT_SECRET" "JWT secret for API authentication" true

# Monitoring & Analytics
echo -e "${BLUE}=== MONITORING & ANALYTICS ===${NC}"
prompt_env_var "NEXT_PUBLIC_VERCEL_ANALYTICS_ID" "Vercel Analytics ID"
prompt_env_var "SENTRY_DSN" "Sentry DSN for error tracking" true
prompt_env_var "NEXT_PUBLIC_SENTRY_DSN" "Public Sentry DSN"

# Email Configuration  
echo -e "${BLUE}=== EMAIL CONFIGURATION ===${NC}"
prompt_env_var "EMAIL_FROM" "From email address (e.g., noreply@neonpro.com.br)"
prompt_env_var "EMAIL_SUPPORT" "Support email address"
prompt_env_var "SMTP_HOST" "SMTP server host"
prompt_env_var "SMTP_USER" "SMTP username"
prompt_env_var "SMTP_PASS" "SMTP password" true

# Set default environment variables
echo -e "${GREEN}Setting up default environment variables...${NC}"

vercel env add "NODE_ENV" production <<< "production"
vercel env add "NEXT_PUBLIC_ENVIRONMENT" production <<< "production"
vercel env add "NEXT_PUBLIC_ENABLE_ANALYTICS" production <<< "true"
vercel env add "NEXT_PUBLIC_ENABLE_MONITORING" production <<< "true"
vercel env add "LGPD_COMPLIANCE_MODE" production <<< "strict"
vercel env add "ANVISA_AUDIT_ENABLED" production <<< "true"
vercel env add "CFM_COMPLIANCE_ENABLED" production <<< "true"
vercel env add "JWT_EXPIRY" production <<< "7d"
vercel env add "API_RATE_LIMIT_REQUESTS" production <<< "100"
vercel env add "API_RATE_LIMIT_WINDOW" production <<< "900000"
vercel env add "SECURITY_HEADERS_ENABLED" production <<< "true"

echo -e "${GREEN}✅ Environment variables configured successfully!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: vercel env pull"
echo "2. Run: vercel --prod"
echo "3. Configure custom domain: vercel domains add neonpro.com.br"
echo
echo -e "${GREEN}🚀 Ready for deployment!${NC}"