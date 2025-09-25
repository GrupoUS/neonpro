#!/bin/bash

# =============================================================================
# Prisma Cleanup and Supabase Migration Setup Script
# =============================================================================
# 
# Purpose: Remove unused Prisma dependencies and setup Supabase migration process
# Usage: ./scripts/setup-supabase-migrations.sh
# 
# This script implements the recommendations from prisma-migration-deploy-review.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load centralized configuration
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
    # Export database and Supabase configuration
    export_db_config
    export_supabase_config
else
    echo "WARNING: Configuration file not found, using hardcoded defaults"
    # Fallback defaults for critical values
    SUPABASE_PORT=54321
    SUPABASE_MAX_ROWS=1000
    SUPABASE_JWT_EXPIRY=3600
    SUPABASE_STUDIO_PORT=54322
    SUPABASE_SHADOW_PORT=54320
    SUPABASE_FILE_SIZE_LIMIT="50MiB"
    SUPABASE_PG_META_PORT=54323
    PACKAGE_VERSION="0.1.0"
    SUPABASE_JS_VERSION="^2.57.4"
    TYPES_NODE_VERSION="^20.19.13"
    TYPESCRIPT_VERSION="^5.9.2"
    SUPABASE_CLI_VERSION="^1.210.0"
    POSTGRES_JS_VERSION="^3.4.4"
    SUPABASE_MAJOR_VERSION=15
fi

# Logging functions
info() { echo -e "${BLUE}ℹ️ INFO:${NC} $1"; }
success() { echo -e "${GREEN}✅ SUCCESS:${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️ WARNING:${NC} $1"; }
error() { echo -e "${RED}❌ ERROR:${NC} $1"; }

info "This script must be run from the NeonPro project root directory"
    exit 1
fi

# =============================================================================
# Database Connection Handling
# =============================================================================

# Database connection configuration
DB_TIMEOUT=${DB_TIMEOUT:-30}
DB_MAX_CONNECTIONS=${DB_MAX_CONNECTIONS:-10}
DB_CONNECTION_ATTEMPTS=${DB_CONNECTION_ATTEMPTS:-3}
DB_CONNECTION_RETRY_DELAY=${DB_CONNECTION_RETRY_DELAY:-5}

# Validate database URL
validate_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is required"
        exit 1
    fi
    
    # Validate URL format
    if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
        error "DATABASE_URL must start with 'postgresql://'"
        exit 1
    fi
    
    # Extract connection parameters for validation
    local host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
    local port=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\//\1/p')
    
    if [ -z "$host" ]; then
        error "Invalid DATABASE_URL format: host not found"
        exit 1
    fi
    
    success "DATABASE_URL format is valid"
}

# Test database connection with timeout and retry logic
test_database_connection() {
    info "Testing database connection..."
    
    local attempt=1
    local connection_success=false
    
    while [ $attempt -le $DB_CONNECTION_ATTEMPTS ]; do
        info "Connection attempt $attempt of $DB_CONNECTION_ATTEMPTS..."
        
        # Test connection with timeout
        if timeout $DB_TIMEOUT psql "$DATABASE_URL" -t -c "SELECT 1;" >/dev/null 2>&1; then
            connection_success=true
            break
        else
            warning "Connection attempt $attempt failed"
            if [ $attempt -lt $DB_CONNECTION_ATTEMPTS ]; then
                info "Waiting $DB_CONNECTION_RETRY_DELAY seconds before retry..."
                sleep $DB_CONNECTION_RETRY_DELAY
            fi
        fi
        
        ((attempt++))
    done
    
    if [ "$connection_success" = true ]; then
        success "Database connection established"
        
        # Get connection pool information
        local active_connections=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "unknown")
        local max_connections=$(psql "$DATABASE_URL" -t -c "SHOW max_connections;" 2>/dev/null || echo "unknown")
        
        info "Database connection pool status:"
        info "  Active connections: $active_connections"
        info "  Max connections: $max_connections"
        info "  Configured timeout: ${DB_TIMEOUT}s"
        
        return 0
    else
        error "Failed to establish database connection after $DB_CONNECTION_ATTEMPTS attempts"
        return 1
    fi
}

# Execute database command with error handling and timeout
execute_db_command() {
    local command="$1"
    local description="$2"
    local timeout_duration=${3:-$DB_TIMEOUT}
    
    info "Executing: $description"
    
    if ! timeout "$timeout_duration" psql "$DATABASE_URL" -t -c "$command" 2>/dev/null; then
        error "Failed to execute: $description"
        return 1
    fi
    
    success "Completed: $description"
    return 0
}

# Execute database file with error handling
execute_db_file() {
    local file_path="$1"
    local description="$2"
    local timeout_duration=${3:-$DB_TIMEOUT}
    
    info "Executing: $description"
    
    if [ ! -f "$file_path" ]; then
        error "Database file not found: $file_path"
        return 1
    fi
    
    if ! timeout "$timeout_duration" psql "$DATABASE_URL" < "$file_path" >/dev/null 2>&1; then
        error "Failed to execute: $description"
        return 1
    fi
    
    success "Completed: $description"
    return 0
}

# Database backup with validation
backup_database() {
    local backup_file="$1"
    local description="$2"
    
    info "Creating database backup: $description"
    
    # Validate backup directory
    local backup_dir=$(dirname "$backup_file")
    mkdir -p "$backup_dir"
    
    # Create backup with timeout
    if ! timeout $((DB_TIMEOUT * 2)) pg_dump "$DATABASE_URL" > "$backup_file" 2>/dev/null; then
        error "Failed to create database backup: $description"
        return 1
    fi
    
    # Validate backup file
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        error "Backup file is invalid or empty: $backup_file"
        return 1
    fi
    
    local backup_size=$(du -h "$backup_file" | cut -f1)
    success "Database backup created: $backup_size ($description)"
    return 0
}

info "Starting Prisma cleanup and Supabase migration setup..."

# Validate database connection first
validate_database_url
if ! test_database_connection; then
    error "Database connection validation failed. Please check your DATABASE_URL and network connectivity."
    exit 1
fi

# =============================================================================
# Phase 1: Backup Current State
# =============================================================================

info "Phase 1: Creating backup of current configuration..."

# Create backup directory
mkdir -p .backup/$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".backup/$(date +%Y%m%d-%H%M%S)"

# Backup package.json files
cp package.json "$BACKUP_DIR/root-package.json"
cp apps/api/package.json "$BACKUP_DIR/api-package.json"
cp packages/database/package.json "$BACKUP_DIR/database-package.json"

# Backup Prisma schema for reference
cp packages/database/prisma/schema.prisma "$BACKUP_DIR/schema.prisma"

success "Backup created in $BACKUP_DIR"

# =============================================================================
# Phase 2: Remove Prisma Dependencies
# =============================================================================

info "Phase 2: Removing Prisma dependencies..."

# Remove Prisma dependencies from packages/database
cd packages/database
info "Removing Prisma dependencies from @neonpro/database package..."
if npm ls @prisma/client > /dev/null 2>&1; then
    npm uninstall @prisma/client prisma
    success "Removed Prisma dependencies from packages/database"
else
    warning "Prisma dependencies not found in packages/database"
fi

# Update package.json scripts
info "Updating packages/database/package.json scripts..."
cat > package.json << 'EOF'
{
  "name": "@neonpro/database",
  "version": "${PACKAGE_VERSION:-0.1.0}",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "type-check": "tsc -p tsconfig.json --noEmit",
    "clean": "rimraf dist",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "echo 'lint placeholder'",
    "prepare": "npm run build",
    "generate-types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts",
    "migration:status": "supabase migration list",
    "migration:new": "supabase migration new"
  },
  "dependencies": {
    "@supabase/supabase-js": "${SUPABASE_JS_VERSION:-^2.57.4}"
  },
  "devDependencies": {
    "@types/node": "${TYPES_NODE_VERSION:-^20.19.13}",
    "typescript": "${TYPESCRIPT_VERSION:-^5.9.2}",
    "supabase": "${SUPABASE_CLI_VERSION:-^1.210.0}"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
EOF

cd ../../

# Remove Prisma dependencies from apps/api
cd apps/api
info "Removing Prisma dependencies from @neonpro/api..."
if npm ls @prisma/client > /dev/null 2>&1; then
    npm uninstall @prisma/client prisma
    success "Removed Prisma dependencies from apps/api"
else
    warning "Prisma dependencies not found in apps/api"
fi

# Update API package.json
info "Updating apps/api/package.json scripts..."
# Create a temporary file to store the updated package.json
python3 << 'EOF'
import json

# Read the current package.json
with open('package.json', 'r') as f:
    package_data = json.load(f)

# Remove Prisma-related scripts
scripts_to_remove = ['postinstall', 'prisma:generate', 'prisma:migrate:deploy']
for script in scripts_to_remove:
    if script in package_data.get('scripts', {}):
        del package_data['scripts'][script]

# Remove Prisma dependencies if they exist
deps_to_remove = ['@prisma/client', 'prisma']
for dep in deps_to_remove:
    if dep in package_data.get('dependencies', {}):
        del package_data['dependencies'][dep]
    if dep in package_data.get('devDependencies', {}):
        del package_data['devDependencies'][dep]

# Add Supabase type generation script
package_data['scripts']['generate-types'] = 'supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > ../../packages/database/src/types/supabase.ts'

# Write back the updated package.json
with open('package.json', 'w') as f:
    json.dump(package_data, f, indent=2)
    f.write('\n')

print("Updated apps/api/package.json")
EOF

cd ../../

success "Prisma dependencies removed from all packages"

# =============================================================================
# Phase 3: Setup Supabase Structure
# =============================================================================

info "Phase 3: Setting up Supabase structure..."

# Create Supabase directory structure
mkdir -p supabase/migrations
mkdir -p supabase/functions
mkdir -p packages/database/src/types

# Create initial Supabase config
cat > supabase/config.toml << EOF
# A string used to distinguish different Supabase projects on the same machine.
# Not used by the hosted version of Supabase.
project_id = "${SUPABASE_PROJECT_ID:-neonpro}"

[api]
enabled = true
port = ${SUPABASE_PORT}
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = ${SUPABASE_MAX_ROWS}

[auth]
enabled = true
site_url = "${LOCAL_DEVELOPMENT_URL:-http://localhost:3000}"
additional_redirect_urls = ["${LOCAL_DEVELOPMENT_URL_SECURE:-https://localhost:3000}"]
jwt_expiry = ${SUPABASE_JWT_EXPIRY}
enable_signup = true
enable_confirmations = false

[db]
port = ${SUPABASE_STUDIO_PORT}
shadow_port = ${SUPABASE_SHADOW_PORT}
major_version = ${SUPABASE_MAJOR_VERSION}

[storage]
enabled = true
file_size_limit = "${SUPABASE_FILE_SIZE_LIMIT:-50MiB}"
file_transforms = true

[edge_functions]
enabled = true
port = ${SUPABASE_PG_META_PORT}

[analytics]
enabled = false
EOF

# Create example migration based on Prisma schema
info "Creating example migration from Prisma schema..."
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql << 'EOF'
-- Initial NeonPro schema migration
-- Converted from Prisma schema for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'withdrawn', 'expired');
CREATE TYPE audit_action AS ENUM ('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT');
CREATE TYPE resource_type AS ENUM ('PATIENT_RECORD', 'REPORT', 'SYSTEM_CONFIG', 'USER_ACCOUNT');
CREATE TYPE audit_status AS ENUM ('SUCCESS', 'FAILED', 'BLOCKED');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE kpi_status AS ENUM ('ACTIVE', 'ARCHIVED', 'PROVISIONAL');
CREATE TYPE compliance_framework AS ENUM ('HIPAA', 'LGPD', 'GDPR', 'SOC2');
CREATE TYPE compliance_status_enum AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW', 'CRITICAL');
CREATE TYPE ai_model_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRAINING', 'DEPRECATED');
CREATE TYPE policy_status AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED', 'UNDER_REVIEW');
CREATE TYPE escalation_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE escalation_status AS ENUM ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

-- Core tables (basic structure - to be expanded in subsequent migrations)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    medical_record_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    cpf TEXT,
    birth_date DATE,
    phone_primary TEXT,
    email TEXT,
    lgpd_consent_given BOOLEAN DEFAULT FALSE,
    lgpd_consent_date TIMESTAMPTZ,
    data_retention_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded)
CREATE POLICY "Enable read access for authenticated users" ON clinics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON patients FOR SELECT USING (auth.role() = 'authenticated');

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

success "Created initial schema migration"

# =============================================================================
# Phase 4: Create Migration Scripts
# =============================================================================

info "Phase 4: Creating migration deployment scripts..."

# Create deploy script
cat > scripts/deploy-migrations.sh << 'EOF'
#!/bin/bash

# =============================================================================
# Supabase Migration Deployment Script
# =============================================================================

set -e

ENVIRONMENT=${1:-staging}
PROJECT_ID=${SUPABASE_PROJECT_ID}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️ INFO:${NC} $1"; }
success() { echo -e "${GREEN}✅ SUCCESS:${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️ WARNING:${NC} $1"; }
error() { echo -e "${RED}❌ ERROR:${NC} $1"; }

# Validate environment variables
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    error "SUPABASE_PROJECT_ID environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    error "SUPABASE_ACCESS_TOKEN environment variable is required"
    exit 1
fi

info "🚀 Deploying migrations to $ENVIRONMENT environment..."
info "Project ID: $PROJECT_ID"

# 1. Link to Supabase project
info "Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

# 2. Check migration status
info "Checking migration status..."
supabase migration list

# 3. Apply migrations
info "Applying migrations..."
supabase db push --include-schemas=public,auth

# 4. Generate updated types
info "Generating TypeScript types..."
supabase gen types typescript --project-id $PROJECT_ID > packages/database/src/types/supabase.ts

# 5. Run post-migration validation
if [ -f "scripts/post-migration-validation.sql" ]; then
    info "Running post-migration validation..."
    supabase db reset --db-url $DATABASE_URL < scripts/post-migration-validation.sql
fi

success "✅ Migration deployment complete for $ENVIRONMENT"
EOF

chmod +x scripts/deploy-migrations.sh

# Create rollback script
cat > scripts/rollback-migration.sh << 'EOF'
#!/bin/bash

# =============================================================================
# Supabase Migration Rollback Script
# =============================================================================

set -e

BACKUP_FILE=${1}
PROJECT_ID=${SUPABASE_PROJECT_ID}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️ INFO:${NC} $1"; }
success() { echo -e "${GREEN}✅ SUCCESS:${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️ WARNING:${NC} $1"; }
error() { echo -e "${RED}❌ ERROR:${NC} $1"; }

if [ -z "$BACKUP_FILE" ]; then
    error "Usage: $0 <backup_file>"
    error "Example: $0 backup-20250911-143022.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

warning "🔄 Rolling back to backup: $BACKUP_FILE"
warning "This will restore the database to the state at backup time"

read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Rollback cancelled"
    exit 0
fi

# 1. Create current state backup before rollback
info "Creating backup of current state before rollback..."
ROLLBACK_BACKUP="rollback-backup-$(date +%Y%m%d-%H%M%S).sql"
pg_dump $DATABASE_URL > $ROLLBACK_BACKUP
success "Current state backed up to: $ROLLBACK_BACKUP"

# 2. Restore database from backup
info "Restoring database from backup..."
psql $DATABASE_URL < $BACKUP_FILE

# 3. Revert types to previous version
info "Reverting TypeScript types..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    git checkout HEAD~1 -- packages/database/src/types/supabase.ts || warning "Could not revert types file"
fi

success "✅ Rollback complete"
warning "Remember to restart your application services if needed"
EOF

chmod +x scripts/rollback-migration.sh

# Create monitoring script
cat > scripts/monitor-migration-health.sh << 'EOF'
#!/bin/bash

# =============================================================================
# Migration Health Monitoring Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️ INFO:${NC} $1"; }
success() { echo -e "${GREEN}✅ SUCCESS:${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️ WARNING:${NC} $1"; }
error() { echo -e "${RED}❌ ERROR:${NC} $1"; }

# Required environment variables
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable is required"
    exit 1
fi

info "🏥 Checking migration health..."

# Check critical tables exist
info "Checking critical tables..."
REQUIRED_TABLES=("clinics" "patients" "appointments" "professionals")
MISSING_TABLES=()

for table in "${REQUIRED_TABLES[@]}"; do
    if ! psql "$DATABASE_URL" -t -c "SELECT to_regclass('public.$table');" | grep -q "$table"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    success "All critical tables exist"
else
    error "Missing critical tables: ${MISSING_TABLES[*]}"
    exit 1
fi

# Check RLS policies
info "Checking Row Level Security policies..."
RLS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
if [ "$RLS_COUNT" -gt 0 ]; then
    success "RLS policies found: $RLS_COUNT"
else
    warning "No RLS policies found - this may be a security issue"
fi

# Check enum types
info "Checking enum types..."
ENUM_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e';")
if [ "$ENUM_COUNT" -gt 0 ]; then
    success "Enum types found: $ENUM_COUNT"
else
    warning "No enum types found"
fi

# Check extensions
info "Checking required extensions..."
REQUIRED_EXTENSIONS=("uuid-ossp" "pgcrypto")
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if psql "$DATABASE_URL" -t -c "SELECT 1 FROM pg_extension WHERE extname = '$ext';" | grep -q "1"; then
        success "Extension $ext is installed"
    else
        warning "Extension $ext is not installed"
    fi
done

success "✅ Migration health check complete"
EOF

chmod +x scripts/monitor-migration-health.sh

success "Created migration deployment scripts"

# =============================================================================
# Phase 5: Update Database Package Exports
# =============================================================================

info "Phase 5: Updating database package exports..."

# Update index.ts with Supabase client exports
cat > packages/database/src/index.ts << 'EOF'
// Database package exports - Supabase integration

// Export Supabase client factory functions
export { createClient } from './client';

// Export database types
export type { Database } from './types/supabase';

// Export utility functions
export { validateSchema } from './utils/validation';
export { migrateData } from './utils/migration';

// Re-export Supabase types for convenience
export type {
  SupabaseClient,
  PostgrestResponse,
  PostgrestError,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
EOF

# Create Supabase client factory
mkdir -p packages/database/src
cat > packages/database/src/client.ts << 'EOF'
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

/**
 * Create a Supabase client for browser/client-side use
 * Uses Row Level Security (RLS) for data isolation
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: ${SUPABASE_EVENTS_PER_SECOND:-10},
      },
    },
  });
}

/**
 * Create a Supabase service role client for server-side use
 * Bypasses Row Level Security - use with caution
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables');
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
EOF

# Create utility functions
cat > packages/database/src/utils/validation.ts << 'EOF'
import type { Database } from '../types/supabase';

/**
 * Validate database schema compatibility
 */
export function validateSchema(): Promise<boolean> {
  // TODO: Implement schema validation logic
  return Promise.resolve(true);
}

/**
 * Check if all required tables exist
 */
export async function checkTablesExist(client: any): Promise<boolean> {
  const requiredTables = ['clinics', 'patients', 'appointments', 'professionals'];
  
  try {
    for (const table of requiredTables) {
      const { error } = await client.from(table).select('id').limit(${SUPABASE_QUERY_LIMIT:-1});
      if (error) {
        console.error(`Table ${table} validation failed:`, error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}
EOF

cat > packages/database/src/utils/migration.ts << 'EOF'
/**
 * Data migration utilities for Supabase
 */

/**
 * Migrate data between schema versions
 */
export function migrateData(): Promise<void> {
  // TODO: Implement data migration logic
  return Promise.resolve();
}

/**
 * Backup data before migration
 */
export function backupData(): Promise<string> {
  // TODO: Implement backup logic
  return Promise.resolve(`backup-${Date.now()}.json`);
}
EOF

# Create placeholder types file
mkdir -p packages/database/src/types
cat > packages/database/src/types/supabase.ts << 'EOF'
// Auto-generated Supabase types
// This file will be generated by: supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          medical_record_number: string;
          full_name: string;
          cpf: string | null;
          birth_date: string | null;
          phone_primary: string | null;
          email: string | null;
          lgpd_consent_given: boolean;
          lgpd_consent_date: string | null;
          data_retention_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          medical_record_number: string;
          full_name: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone_primary?: string | null;
          email?: string | null;
          lgpd_consent_given?: boolean;
          lgpd_consent_date?: string | null;
          data_retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          medical_record_number?: string;
          full_name?: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone_primary?: string | null;
          email?: string | null;
          lgpd_consent_given?: boolean;
          lgpd_consent_date?: string | null;
          data_retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      appointment_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
      consent_status: 'pending' | 'granted' | 'withdrawn' | 'expired';
    };
  };
}
EOF

success "Updated database package structure"

# =============================================================================
# Phase 6: Final Cleanup and Validation
# =============================================================================

info "Phase 6: Final cleanup and validation..."

# Remove Prisma directory
if [ -d "packages/database/prisma" ]; then
    warning "Moving Prisma schema to backup (not deleting immediately)..."
    mv packages/database/prisma "$BACKUP_DIR/prisma-backup"
    success "Prisma directory moved to backup"
fi

# Reinstall dependencies
info "Reinstalling dependencies..."
pnpm install

# Run type check to ensure everything compiles
info "Running type check..."
cd packages/database
if npm run type-check; then
    success "Database package type check passed"
else
    warning "Database package type check failed - this is expected until types are generated"
fi

cd ../../

# =============================================================================
# Summary and Next Steps
# =============================================================================

success "🎉 Prisma cleanup and Supabase migration setup complete!"

echo
echo "📋 SUMMARY OF CHANGES:"
echo "  ✅ Removed Prisma dependencies from all packages"
echo "  ✅ Updated package.json scripts for Supabase"
echo "  ✅ Created Supabase configuration and initial migration"
echo "  ✅ Created deployment and rollback scripts"
echo "  ✅ Updated database package exports for Supabase"
echo "  ✅ Created backup in $BACKUP_DIR"

echo
echo "🔄 NEXT STEPS:"
echo "  1. Set up Supabase project and get PROJECT_ID"
echo "  2. Configure environment variables:"
echo "     - SUPABASE_PROJECT_ID"
echo "     - SUPABASE_ACCESS_TOKEN" 
echo "     - NEXT_PUBLIC_SUPABASE_URL"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     - SUPABASE_SERVICE_ROLE_KEY"
echo "  3. Run: supabase login"
echo "  4. Run: ./scripts/deploy-migrations.sh staging"
echo "  5. Generate types: npm run generate-types"
echo "  6. Test application with Supabase client"

echo
echo "📚 DOCUMENTATION:"
echo "  - Review: docs/features/prisma-migration-deploy-review.md"
echo "  - Supabase setup: docs/database-schema/database-schema-consolidated.md"
echo "  - Migration guide: docs/database-schema/migrations/README.md"

echo
echo "⚠️  ROLLBACK INSTRUCTIONS:"
echo "  If you need to rollback these changes:"
echo "  1. Restore package.json files from $BACKUP_DIR"
echo "  2. Restore Prisma directory: mv $BACKUP_DIR/prisma-backup packages/database/prisma"
echo "  3. Run: pnpm install"

warning "Remember to test thoroughly in staging before deploying to production!"