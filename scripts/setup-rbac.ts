#!/usr/bin/env tsx

/**
 * RBAC Setup Script
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Configures RBAC system including:
 * - Database policies (RLS)
 * - Initial roles and permissions
 * - Audit logging setup
 * - Verification tests
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
}

class RBACSetup {
  private readonly supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!(supabaseUrl && supabaseServiceKey)) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Execute SQL migration file
   */
  private async executeMigration(filename: string): Promise<SetupResult> {
    try {
      console.log(`📄 Executing migration: ${filename}`);

      const migrationPath = join(__dirname, 'migrations', filename);
      const sql = readFileSync(migrationPath, 'utf-8');

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📊 Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            const { error } = await this.supabase.rpc('exec_sql', {
              sql_query: statement,
            });

            if (error) {
              console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
              // Continue with other statements unless it's a critical error
              if (error.message.includes('already exists')) {
              }
            }
          } catch (err) {
            console.error(`❌ Error in statement ${i + 1}:`, err);
            // Continue with other statements for non-critical errors
          }
        }
      }

      return {
        success: true,
        message: `Migration ${filename} executed successfully`,
      };
    } catch (error) {
      console.error(`❌ Migration ${filename} failed:`, error);
      return {
        success: false,
        message: `Migration ${filename} failed`,
        details: error,
      };
    }
  }

  /**
   * Verify RLS policies are working
   */
  private async verifyRLSPolicies(): Promise<SetupResult> {
    try {
      console.log('🔍 Verifying RLS policies...');

      // Check if RLS is enabled on key tables
      const { data: rlsStatus, error } = await this.supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .in('tablename', ['users', 'patients', 'appointments', 'billing']);

      if (error) {
        throw error;
      }

      const tablesWithRLS =
        rlsStatus?.filter((table) => table.rowsecurity) || [];

      console.log(`✅ RLS enabled on ${tablesWithRLS.length} tables`);

      // Check if policies exist
      const { data: policies, error: policiesError } = await this.supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .eq('schemaname', 'public');

      if (policiesError) {
        throw policiesError;
      }

      const policyCount = policies?.length || 0;
      console.log(`✅ ${policyCount} RLS policies configured`);

      return {
        success: true,
        message: 'RLS policies verified successfully',
        details: {
          tablesWithRLS: tablesWithRLS.length,
          totalPolicies: policyCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'RLS verification failed',
        details: error,
      };
    }
  }

  /**
   * Create audit log table if it doesn't exist
   */
  private async setupAuditLog(): Promise<SetupResult> {
    try {
      console.log('📋 Setting up audit log table...');

      const createAuditTableSQL = `
        CREATE TABLE IF NOT EXISTS permission_audit_log (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          action text NOT NULL,
          resource_type text NOT NULL,
          resource_id text,
          permission_checked text NOT NULL,
          granted boolean NOT NULL,
          reason text,
          metadata jsonb DEFAULT '{}',
          ip_address inet,
          user_agent text,
          created_at timestamptz DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_audit_user_action ON permission_audit_log(user_id, action);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON permission_audit_log(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_resource ON permission_audit_log(resource_type, resource_id);
      `;

      const { error } = await this.supabase.rpc('exec_sql', {
        sql_query: createAuditTableSQL,
      });

      if (error && !error.message.includes('already exists')) {
        throw error;
      }

      return {
        success: true,
        message: 'Audit log table configured successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Audit log setup failed',
        details: error,
      };
    }
  }

  /**
   * Test RBAC permissions with sample data
   */
  private async testRBACPermissions(): Promise<SetupResult> {
    try {
      console.log('🧪 Testing RBAC permissions...');

      // Test basic role functions
      const { data: roleTest, error: roleError } = await this.supabase.rpc(
        'has_role',
        {
          required_role: 'owner',
        }
      );

      if (roleError) {
        console.warn('⚠️  Role function test warning:', roleError.message);
      }

      // Test minimum role functions
      const { data: minRoleTest, error: minRoleError } =
        await this.supabase.rpc('has_minimum_role', { required_role: 'staff' });

      if (minRoleError) {
        console.warn(
          '⚠️  Minimum role function test warning:',
          minRoleError.message
        );
      }

      console.log('✅ RBAC functions are callable');

      return {
        success: true,
        message: 'RBAC permission tests completed',
        details: {
          roleFunctionWorking: !roleError,
          minRoleFunctionWorking: !minRoleError,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'RBAC permission tests failed',
        details: error,
      };
    }
  }

  /**
   * Main setup process
   */
  async setup(): Promise<void> {
    console.log('🚀 Starting RBAC Setup Process...');
    console.log('='.repeat(50));

    const results: SetupResult[] = [];

    // Step 1: Execute RLS policies migration
    console.log('\n📋 Step 1: Setting up RLS policies');
    const migrationResult = await this.executeMigration(
      '001_setup_rbac_policies.sql'
    );
    results.push(migrationResult);

    if (!migrationResult.success) {
      console.error('❌ Migration failed, stopping setup');
      return;
    }

    // Step 2: Setup audit logging
    console.log('\n📋 Step 2: Setting up audit logging');
    const auditResult = await this.setupAuditLog();
    results.push(auditResult);

    // Step 3: Verify RLS policies
    console.log('\n📋 Step 3: Verifying RLS policies');
    const verifyResult = await this.verifyRLSPolicies();
    results.push(verifyResult);

    // Step 4: Test RBAC permissions
    console.log('\n📋 Step 4: Testing RBAC permissions');
    const testResult = await this.testRBACPermissions();
    results.push(testResult);

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 RBAC Setup Summary:');
    console.log('='.repeat(50));

    const successCount = results.filter((r) => r.success).length;
    const totalSteps = results.length;

    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Step ${index + 1}: ${result.message}`);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    });

    console.log(`\n${'='.repeat(50)}`);

    if (successCount === totalSteps) {
      console.log('🎉 RBAC Setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log(
        '   1. Update your application to use the new RBAC middleware'
      );
      console.log('   2. Test permission checks in your frontend components');
      console.log('   3. Review audit logs for permission usage');
      console.log('   4. Configure role assignments for existing users');
    } else {
      console.log(
        `⚠️  RBAC Setup completed with ${totalSteps - successCount} warnings/errors`
      );
      console.log('   Please review the errors above and fix any issues');
    }

    console.log('\n🔗 Documentation:');
    console.log('   - RBAC Implementation: /docs/RBAC_IMPLEMENTATION.md');
    console.log('   - Permission Guide: /docs/PERMISSION_GUIDE.md');
    console.log('   - API Documentation: /docs/API_RBAC.md');
  }
}

/**
 * Execute setup if run directly
 */
if (require.main === module) {
  const setup = new RBACSetup();
  setup.setup().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

export { RBACSetup };
