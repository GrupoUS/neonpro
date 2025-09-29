#!/bin/bash

# Deploy Edge Functions to Supabase
# Part of NeonPro Hybrid Architecture Migration

set -e

echo "🚀 Deploying Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    bun install -g supabase
fi

# Link to Supabase project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "🔗 Linking to Supabase project..."
    supabase link --project-ref ownkoxryswokcdanrdgj
fi

# Deploy edge-reads function
echo "📖 Deploying edge-reads function..."
supabase functions deploy edge-reads \
    --project-ref ownkoxryswokcdanrdgj \
    --no-verify-jwt

# Deploy node-writes function  
echo "✍️ Deploying node-writes function..."
supabase functions deploy node-writes \
    --project-ref ownkoxryswokcdanrdgj \
    --no-verify-jwt

# Set function secrets
echo "🔑 Setting function secrets..."
supabase secrets set \
    --project-ref ownkoxryswokcdanrdgj \
    SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2) \
    SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2) \
    SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env | cut -d '=' -f2)

echo "✅ Edge Functions deployed successfully!"
echo ""
echo "🌐 Function URLs:"
echo "   Edge Reads: https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/edge-reads"
echo "   Node Writes: https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/node-writes"
echo ""
echo "📊 Monitor your functions at: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj/functions"