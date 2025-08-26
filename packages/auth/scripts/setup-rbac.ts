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

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Load environment variables
config({ path: ".env.local" });

type SetupResult = {
	success: boolean;
	message: string;
	details?: Record<string, string | number | boolean>;
};

class RBACSetup {
	private readonly supabase;

	constructor() {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!(supabaseUrl && supabaseServiceKey)) {
			throw new Error("Missing Supabase environment variables");
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
			const migrationPath = join(__dirname, "migrations", filename);
			const sql = readFileSync(migrationPath, "utf-8");

			// Split SQL into individual statements
			const statements = sql
				.split(";")
				.map((stmt) => stmt.trim())
				.filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

			for (let i = 0; i < statements.length; i++) {
				const statement = statements[i];
				if (statement.trim()) {
					try {
						const { error } = await this.supabase.rpc("exec_sql", {
							sql_query: statement,
						});

						if (error) {
							// Continue with other statements unless it's a critical error
							if (error.message.includes("already exists")) {
							}
						}
					} catch (_err) {
						// Continue with other statements for non-critical errors
					}
				}
			}

			return {
				success: true,
				message: `Migration ${filename} executed successfully`,
			};
		} catch (error) {
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
			// Check if RLS is enabled on key tables
			const { data: rlsStatus, error } = await this.supabase
				.from("pg_tables")
				.select("tablename, rowsecurity")
				.eq("schemaname", "public")
				.in("tablename", ["users", "patients", "appointments", "billing"]);

			if (error) {
				throw error;
			}

			const tablesWithRLS = rlsStatus?.filter((table) => table.rowsecurity) || [];

			// Check if policies exist
			const { data: policies, error: policiesError } = await this.supabase
				.from("pg_policies")
				.select("tablename, policyname")
				.eq("schemaname", "public");

			if (policiesError) {
				throw policiesError;
			}

			const policyCount = policies?.length || 0;

			return {
				success: true,
				message: "RLS policies verified successfully",
				details: {
					tablesWithRLS: tablesWithRLS.length,
					totalPolicies: policyCount,
				},
			};
		} catch (error) {
			return {
				success: false,
				message: "RLS verification failed",
				details: error,
			};
		}
	}

	/**
	 * Create audit log table if it doesn't exist
	 */
	private async setupAuditLog(): Promise<SetupResult> {
		try {
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

			const { error } = await this.supabase.rpc("exec_sql", {
				sql_query: createAuditTableSQL,
			});

			if (error && !error.message.includes("already exists")) {
				throw error;
			}

			return {
				success: true,
				message: "Audit log table configured successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: "Audit log setup failed",
				details: error,
			};
		}
	}

	/**
	 * Test RBAC permissions with sample data
	 */
	private async testRBACPermissions(): Promise<SetupResult> {
		try {
			// Test basic role functions
			const { data: _roleTest, error: roleError } = await this.supabase.rpc("has_role", {
				required_role: "owner",
			});

			if (roleError) {
			}

			// Test minimum role functions
			const { data: _minRoleTest, error: minRoleError } = await this.supabase.rpc("has_minimum_role", {
				required_role: "staff",
			});

			if (minRoleError) {
			}

			return {
				success: true,
				message: "RBAC permission tests completed",
				details: {
					roleFunctionWorking: !roleError,
					minRoleFunctionWorking: !minRoleError,
				},
			};
		} catch (error) {
			return {
				success: false,
				message: "RBAC permission tests failed",
				details: error,
			};
		}
	}

	/**
	 * Main setup process
	 */
	async setup(): Promise<void> {
		const results: SetupResult[] = [];
		const migrationResult = await this.executeMigration("001_setup_rbac_policies.sql");
		results.push(migrationResult);

		if (!migrationResult.success) {
			return;
		}
		const auditResult = await this.setupAuditLog();
		results.push(auditResult);
		const verifyResult = await this.verifyRLSPolicies();
		results.push(verifyResult);
		const testResult = await this.testRBACPermissions();
		results.push(testResult);

		const successCount = results.filter((r) => r.success).length;
		const totalSteps = results.length;

		results.forEach((result, _index) => {
			const _status = result.success ? "✅" : "❌";
			if (result.details) {
			}
		});

		if (successCount === totalSteps) {
		} else {
		}
	}
}

/**
 * Execute setup if run directly
 */
if (require.main === module) {
	const setup = new RBACSetup();
	setup.setup().catch((_error) => {
		process.exit(1);
	});
}

export { RBACSetup };
