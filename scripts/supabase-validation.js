#!/usr/bin/env node

/**
 * Supabase Database Schema Validation Script
 * Validates healthcare-compliant database schema and RLS policies
 * Used by GitHub Actions CI/CD pipeline
 */

const path = require("node:path");
const fs = require("node:fs");

// Color codes for console output
const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

function log(_message, _color = colors.reset) {}

function logHeader(message) {
	log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
	log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
	log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
	log(`❌ ${message}`, colors.red);
}

async function validateMigrationFiles() {
	logHeader("Migration Files Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");

		if (!fs.existsSync(migrationsPath)) {
			logError("Supabase migrations directory not found");
			return false;
		}

		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"))
			.sort();

		if (migrationFiles.length === 0) {
			logError("No migration files found");
			return false;
		}

		logSuccess(`Found ${migrationFiles.length} migration files`);

		// Validate migration file naming convention
		let validNaming = 0;
		const migrationPattern = /^\d{14}_.*\.sql$/; // YYYYMMDDHHMMSS_name.sql

		migrationFiles.forEach((file) => {
			if (migrationPattern.test(file)) {
				logSuccess(`Valid migration naming: ${file}`);
				validNaming++;
			} else {
				logWarning(`Non-standard migration naming: ${file}`);
			}
		});

		return validNaming > 0;
	} catch (error) {
		logError(`Error validating migration files: ${error.message}`);
		return false;
	}
}

async function validateHealthcareTables() {
	logHeader("Healthcare Tables Schema Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		// Required healthcare tables
		const requiredTables = [
			"clinics",
			"patients",
			"healthcare_professionals",
			"medical_specialties",
			"consent_records",
			"data_subject_requests",
			"activity_logs",
			"data_access_logs",
			"security_events",
			"compliance_checks",
			"data_retention_policies",
		];

		const foundTables = new Set();

		// Check each migration file for table definitions
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			for (const table of requiredTables) {
				if (
					content.includes(`CREATE TABLE IF NOT EXISTS ${table}`) ||
					content.includes(`CREATE TABLE ${table}`) ||
					content.includes(`ALTER TABLE ${table}`)
				) {
					foundTables.add(table);
				}
			}
		}

		// Validate found tables
		const foundCount = foundTables.size;
		foundTables.forEach((table) => {
			logSuccess(`Healthcare table found: ${table}`);
		});

		const missingTables = requiredTables.filter(
			(table) => !foundTables.has(table),
		);
		missingTables.forEach((table) => {
			logError(`Missing healthcare table: ${table}`);
		});

		if (foundCount >= Math.ceil(requiredTables.length * 0.8)) {
			// 80% threshold
			logSuccess(
				`${foundCount}/${requiredTables.length} required healthcare tables found`,
			);
			return true;
		}

		logError(
			`Only ${foundCount}/${requiredTables.length} required healthcare tables found`,
		);
		return false;
	} catch (error) {
		logError(`Error validating healthcare tables: ${error.message}`);
		return false;
	}
}

async function validateRLSPolicies() {
	logHeader("Row Level Security (RLS) Policies Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		let hasRLSEnable = false;
		let policyCount = 0;
		const foundPolicies = [];

		// Check for RLS and policies in migration files
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			// Check for RLS enablement
			if (content.includes("ENABLE ROW LEVEL SECURITY")) {
				hasRLSEnable = true;
				logSuccess(`RLS enablement found in: ${file}`);
			}

			// Count policies
			const policyMatches = content.match(/CREATE POLICY\s+"([^"]+)"/g);
			if (policyMatches) {
				policyCount += policyMatches.length;
				policyMatches.forEach((match) => {
					const policyName = match.match(/"([^"]+)"/)[1];
					foundPolicies.push(policyName);
					logSuccess(`RLS policy found: ${policyName}`);
				});
			}
		}

		if (!hasRLSEnable) {
			logError("Row Level Security not enabled on tables");
			return false;
		}

		if (policyCount < 10) {
			// Minimum expected policies for healthcare compliance
			logError(
				`Only ${policyCount} RLS policies found, expected at least 10 for healthcare compliance`,
			);
			return false;
		}

		logSuccess(
			`${policyCount} RLS policies found - adequate for healthcare compliance`,
		);
		return true;
	} catch (error) {
		logError(`Error validating RLS policies: ${error.message}`);
		return false;
	}
}

async function validateHealthcareCompliance() {
	logHeader("Healthcare Compliance Features Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		const complianceFeatures = {
			anvisa_license: false,
			cfm_registration: false,
			lgpd_consent: false,
			audit_trail: false,
			data_retention: false,
			encryption_fields: false,
		};

		// Check for compliance features in migration files
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			if (content.includes("anvisa_license")) {
				complianceFeatures.anvisa_license = true;
			}
			if (content.includes("cfm_registration")) {
				complianceFeatures.cfm_registration = true;
			}
			if (
				content.includes("consent_records") ||
				content.includes("lgpd_consent")
			) {
				complianceFeatures.lgpd_consent = true;
			}
			if (content.includes("activity_logs") || content.includes("audit")) {
				complianceFeatures.audit_trail = true;
			}
			if (
				content.includes("data_retention_policies") ||
				content.includes("retention_period")
			) {
				complianceFeatures.data_retention = true;
			}
			if (
				content.includes("encrypted") ||
				content.includes("hash") ||
				content.includes("pgp_sym_encrypt")
			) {
				complianceFeatures.encryption_fields = true;
			}
		}

		// Validate compliance features
		let passedFeatures = 0;
		Object.entries(complianceFeatures).forEach(([feature, found]) => {
			if (found) {
				logSuccess(`Healthcare compliance feature found: ${feature}`);
				passedFeatures++;
			} else {
				logWarning(`Healthcare compliance feature missing: ${feature}`);
			}
		});

		if (passedFeatures >= 4) {
			// At least 4/6 features required
			logSuccess(`${passedFeatures}/6 healthcare compliance features found`);
			return true;
		}

		logError(`Only ${passedFeatures}/6 healthcare compliance features found`);
		return false;
	} catch (error) {
		logError(`Error validating healthcare compliance: ${error.message}`);
		return false;
	}
}

async function validateIndexes() {
	logHeader("Database Indexes Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		let indexCount = 0;
		const foundIndexes = [];

		// Check for indexes in migration files
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			const indexMatches = content.match(
				/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi,
			);
			if (indexMatches) {
				indexCount += indexMatches.length;
				indexMatches.forEach((match) => {
					foundIndexes.push(match);
					logSuccess(`Index found: ${match}`);
				});
			}
		}

		if (indexCount < 5) {
			logWarning(
				`Only ${indexCount} indexes found - consider adding more for performance`,
			);
			return true; // Don't fail, just warn
		}

		logSuccess(`${indexCount} database indexes found - good for performance`);
		return true;
	} catch (error) {
		logError(`Error validating indexes: ${error.message}`);
		return false;
	}
}

async function validateTriggers() {
	logHeader("Database Triggers Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		let triggerCount = 0;
		const foundTriggers = [];

		// Check for triggers in migration files
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			const triggerMatches = content.match(/CREATE\s+TRIGGER\s+(\w+)/gi);
			if (triggerMatches) {
				triggerCount += triggerMatches.length;
				triggerMatches.forEach((match) => {
					foundTriggers.push(match);
					logSuccess(`Trigger found: ${match}`);
				});
			}
		}

		// Check for update_updated_at triggers (common pattern)
		let hasUpdatedAtTriggers = false;
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");
			if (
				content.includes("update_updated_at_column") ||
				content.includes("updated_at")
			) {
				hasUpdatedAtTriggers = true;
				break;
			}
		}

		if (hasUpdatedAtTriggers) {
			logSuccess("Updated_at triggers found - good for audit trails");
		} else {
			logWarning(
				"No updated_at triggers found - consider adding for audit trails",
			);
		}

		logSuccess(`${triggerCount} database triggers found`);
		return true;
	} catch (error) {
		logError(`Error validating triggers: ${error.message}`);
		return false;
	}
}

async function validateForeignKeys() {
	logHeader("Foreign Key Constraints Validation");

	try {
		const migrationsPath = path.resolve(process.cwd(), "supabase/migrations");
		const migrationFiles = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"));

		let foreignKeyCount = 0;

		// Check for foreign key references
		for (const file of migrationFiles) {
			const content = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			// Count REFERENCES clauses
			const fkMatches = content.match(/REFERENCES\s+\w+\s*\(\s*\w+\s*\)/gi);
			if (fkMatches) {
				foreignKeyCount += fkMatches.length;
				fkMatches.forEach((match) => {
					logSuccess(`Foreign key constraint found: ${match}`);
				});
			}
		}

		if (foreignKeyCount < 5) {
			logWarning(
				`Only ${foreignKeyCount} foreign key constraints found - consider adding more for data integrity`,
			);
			return true; // Don't fail, just warn
		}

		logSuccess(
			`${foreignKeyCount} foreign key constraints found - good for data integrity`,
		);
		return true;
	} catch (error) {
		logError(`Error validating foreign keys: ${error.message}`);
		return false;
	}
}

async function validateSupabaseConfig() {
	logHeader("Supabase Configuration Validation");

	try {
		// Check for Supabase config files
		const configFiles = [
			"supabase/config.toml",
			".env.local.example",
			".env.example",
		];

		let foundConfigs = 0;

		configFiles.forEach((file) => {
			const fullPath = path.resolve(process.cwd(), file);
			if (fs.existsSync(fullPath)) {
				logSuccess(`Supabase config file found: ${file}`);
				foundConfigs++;
			} else {
				logWarning(`Supabase config file missing: ${file}`);
			}
		});

		// Check package.json for Supabase dependency
		const packageJsonPaths = [
			path.resolve(process.cwd(), "apps/web/package.json"),
			path.resolve(process.cwd(), "package.json"),
		];

		let hasSupabaseDep = false;

		for (const packagePath of packageJsonPaths) {
			if (fs.existsSync(packagePath)) {
				const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
				if (
					packageJson.dependencies?.["@supabase/supabase-js"] ||
					packageJson.devDependencies?.["@supabase/supabase-js"]
				) {
					hasSupabaseDep = true;
					logSuccess(`Supabase dependency found in ${packagePath}`);
					break;
				}
			}
		}

		if (!hasSupabaseDep) {
			logError("Supabase JavaScript client dependency not found");
			return false;
		}

		return foundConfigs > 0;
	} catch (error) {
		logError(`Error validating Supabase configuration: ${error.message}`);
		return false;
	}
}

async function validateEnvironmentVariables() {
	logHeader("Environment Variables Validation");

	const requiredEnvVars = [
		"NEXT_PUBLIC_SUPABASE_URL",
		"SUPABASE_SERVICE_ROLE_KEY",
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
	];

	const allValid = true;

	requiredEnvVars.forEach((envVar) => {
		if (process.env[envVar]) {
			logSuccess(`${envVar} is set`);
		} else {
			logWarning(`${envVar} is not set (may be intentional for CI)`);
			// Don't fail on missing env vars in CI context
		}
	});

	return allValid;
}

async function runSupabaseValidation() {
	logHeader("Supabase Database Schema Validation Suite");

	const validations = [
		{ name: "Migration Files", fn: validateMigrationFiles },
		{ name: "Healthcare Tables", fn: validateHealthcareTables },
		{ name: "RLS Policies", fn: validateRLSPolicies },
		{ name: "Healthcare Compliance", fn: validateHealthcareCompliance },
		{ name: "Database Indexes", fn: validateIndexes },
		{ name: "Database Triggers", fn: validateTriggers },
		{ name: "Foreign Key Constraints", fn: validateForeignKeys },
		{ name: "Supabase Configuration", fn: validateSupabaseConfig },
		{ name: "Environment Variables", fn: validateEnvironmentVariables },
	];

	let allPassed = true;
	const results = [];

	for (const validation of validations) {
		try {
			log(`\nRunning ${validation.name} validation...`);
			const result = await validation.fn();
			results.push({ name: validation.name, passed: result });

			if (result) {
				logSuccess(`${validation.name} validation passed`);
			} else {
				logError(`${validation.name} validation failed`);
				allPassed = false;
			}
		} catch (error) {
			logError(`${validation.name} validation error: ${error.message}`);
			results.push({
				name: validation.name,
				passed: false,
				error: error.message,
			});
			allPassed = false;
		}
	}

	// Summary
	logHeader("Supabase Validation Summary");

	results.forEach((result) => {
		if (result.passed) {
			logSuccess(`${result.name}: PASSED`);
		} else {
			logError(
				`${result.name}: FAILED${result.error ? ` (${result.error})` : ""}`,
			);
		}
	});

	if (allPassed) {
		log(
			`\n${colors.bold}${colors.green}🎉 All Supabase database validations passed!${colors.reset}`,
		);
		process.exit(0);
	} else {
		log(
			`\n${colors.bold}${colors.red}💥 Some Supabase database validations failed!${colors.reset}`,
		);
		process.exit(1);
	}
}

// Run validation if called directly
if (require.main === module) {
	runSupabaseValidation().catch((error) => {
		logError(`Unexpected error: ${error.message}`);
		process.exit(1);
	});
}

module.exports = {
	validateMigrationFiles,
	validateHealthcareTables,
	validateRLSPolicies,
	validateHealthcareCompliance,
	validateIndexes,
	validateTriggers,
	validateForeignKeys,
	validateSupabaseConfig,
	validateEnvironmentVariables,
	runSupabaseValidation,
};
