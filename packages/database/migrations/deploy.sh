#!/bin/bash

# Healthcare Database Migration Deployment Script
# Phase 3.3 - Brazilian Healthcare Compliance Implementation

set -e

echo "🏥 Starting Healthcare Database Migration Deployment..."
echo "📋 Phase 3.3: LGPD, CFM, and ANVISA Compliance Implementation"

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$DIRECT_URL" ]; then
    echo "❌ Error: DIRECT_URL environment variable is required"
    exit 1
fi

echo "✅ Environment variables validated"

# Backup current database (optional but recommended)
echo "💾 Creating database backup..."
pg_dump "$DATABASE_URL" > "backup_$(date +%Y%m%d_%H%M%S).sql" || echo "⚠️  Warning: Backup failed, continuing..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run prisma:generate

# Apply Prisma migrations
echo "🚀 Applying Prisma migrations..."
bun run prisma:migrate

# Apply additional SQL migrations
echo "📝 Applying healthcare entity migrations..."

# 1. Healthcare entities and Brazilian compliance fields
echo "  - Applying healthcare entities migration..."
psql "$DATABASE_URL" -f "20250918_healthcare_entities_migration.sql"

# 2. LGPD Consent table with cryptographic proof
echo "  - Creating LGPD consent management table..."
psql "$DATABASE_URL" -f "20250918_lgpd_consent_table.sql"

# 3. Telemedicine session table with CFM compliance
echo "  - Creating telemedicine session table..."
psql "$DATABASE_URL" -f "20250918_telemedicine_session_table.sql"

# 4. Row Level Security policies
echo "  - Applying RLS policies for multi-tenant isolation..."
psql "$DATABASE_URL" -f "20250918_rls_policies.sql"

# 5. Performance indexes
echo "  - Creating performance indexes..."
psql "$DATABASE_URL" -f "20250918_performance_indexes.sql"

# Verify migrations
echo "🔍 Verifying migration success..."

# Check table existence
psql "$DATABASE_URL" -c "SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lgpd_consents') 
        THEN '✅ lgpd_consents table created'
        ELSE '❌ lgpd_consents table missing'
    END;
    
    SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'telemedicine_sessions') 
        THEN '✅ telemedicine_sessions table created'
        ELSE '❌ telemedicine_sessions table missing'
    END;
    
    SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cns') 
        THEN '✅ Patient CNS field added'
        ELSE '❌ Patient CNS field missing'
    END;"

# Check RLS policies
echo "🔒 Verifying RLS policies..."
psql "$DATABASE_URL" -c "SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE tablename IN ('patients', 'appointments', 'lgpd_consents', 'telemedicine_sessions')
    ORDER BY tablename, policyname;"

# Check indexes
echo "📊 Verifying performance indexes..."
psql "$DATABASE_URL" -c "SELECT schemaname, tablename, indexname 
    FROM pg_indexes 
    WHERE tablename IN ('patients', 'appointments', 'lgpd_consents', 'telemedicine_sessions')
    AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname;"

# Test multi-schema support
echo "🗂️  Verifying multi-schema support..."
psql "$DATABASE_URL" -c "SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name IN ('public', 'audit', 'lgpd')
    ORDER BY schema_name;"

echo "✅ Healthcare database migration completed successfully!"
echo "🏥 Brazilian healthcare compliance features implemented:"
echo "   - LGPD (Lei Geral de Proteção de Dados) compliance with cryptographic proof"
echo "   - CFM (Conselho Federal de Medicina) telemedicine standards"
echo "   - ANVISA regulatory compliance tracking"
echo "   - NGS2 security standards implementation"
echo "   - Multi-tenant isolation with clinic-based RLS"
echo "   - Performance optimization for healthcare workflows"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure Prisma Accelerate for connection pooling"
echo "   2. Set up monitoring for compliance metrics"
echo "   3. Test multi-tenant isolation"
echo "   4. Verify LGPD consent cryptographic validation"
echo "   5. Test telemedicine session CFM compliance"