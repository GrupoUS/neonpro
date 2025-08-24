#!/usr/bin/env ts-node
import * as fs from "fs/promises";
import * as path from "path";
import ProductionDeploymentPipeline, { type DeploymentConfig } from "./production-pipeline";

interface CLIArguments {
	environment: "staging" | "production";
	version?: string;
	strategy?: "blue-green" | "rolling" | "canary";
	skipHealthChecks?: boolean;
	skipTests?: boolean;
	configFile?: string;
}

class DeploymentRunner {
	private static parseArguments(args: string[]): CLIArguments {
		const parsedArgs: CLIArguments = {
			environment: "staging",
		};

		for (let i = 2; i < args.length; i++) {
			const arg = args[i];

			switch (arg) {
				case "--environment":
				case "-e":
					parsedArgs.environment = args[++i] as "staging" | "production";
					break;
				case "--version":
				case "-v":
					parsedArgs.version = args[++i];
					break;
				case "--strategy":
				case "-s":
					parsedArgs.strategy = args[++i] as "blue-green" | "rolling" | "canary";
					break;
				case "--skip-health-checks":
					parsedArgs.skipHealthChecks = true;
					break;
				case "--skip-tests":
					parsedArgs.skipTests = true;
					break;
				case "--config":
				case "-c":
					parsedArgs.configFile = args[++i];
					break;
				case "--help":
				case "-h":
					DeploymentRunner.printUsage();
					process.exit(0);
					break;
				default:
					console.error(`Unknown argument: ${arg}`);
					DeploymentRunner.printUsage();
					process.exit(1);
			}
		}

		return parsedArgs;
	}

	private static printUsage(): void {
		console.log(`
NeonPro Healthcare AI Services Deployment Tool

Usage: npm run deploy [options]

Options:
  -e, --environment <env>     Target environment (staging|production) [default: staging]
  -v, --version <version>     Deployment version (defaults to current git commit)
  -s, --strategy <strategy>   Deployment strategy (blue-green|rolling|canary) [default: blue-green]
  --skip-health-checks       Skip health check validation (not recommended for production)
  --skip-tests               Skip post-deployment tests (not recommended)
  -c, --config <file>        Custom deployment configuration file
  -h, --help                 Show this help message

Examples:
  npm run deploy                                    # Deploy to staging with defaults
  npm run deploy -e production -s canary           # Canary deployment to production
  npm run deploy -e production -v v2.1.0           # Deploy specific version to production
  npm run deploy -c custom-config.json             # Use custom deployment configuration

Environment Variables Required:
  DATABASE_URL                - Production database connection string
  SUPABASE_URL               - Supabase project URL
  SUPABASE_ANON_KEY         - Supabase anonymous key
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
  REDIS_URL                 - Redis cache connection string
  OPENAI_API_KEY            - OpenAI API key for AI services
  ANTHROPIC_API_KEY         - Anthropic API key for Claude integration

Healthcare Compliance Notes:
  - All deployments include LGPD and ANVISA compliance validation
  - Health checks verify all AI services are functioning correctly
  - Automatic rollback is triggered if error rates exceed 0.5%
  - All deployment activities are logged for audit purposes
    `);
	}

	private static async loadDeploymentConfig(args: CLIArguments): Promise<DeploymentConfig> {
		let config: Partial<DeploymentConfig> = {};

		// Load from config file if specified
		if (args.configFile) {
			try {
				const configPath = path.resolve(args.configFile);
				const configFile = await fs.readFile(configPath, "utf8");
				config = JSON.parse(configFile);
			} catch (error) {
				console.error(`Failed to load config file ${args.configFile}:`, error);
				process.exit(1);
			}
		}

		// Override with CLI arguments
		const finalConfig: DeploymentConfig = {
			environment: args.environment,
			version: args.version || (await DeploymentRunner.getCurrentGitCommit()),
			deployment_strategy: args.strategy || config.deployment_strategy || "blue-green",
			health_check_timeout_ms: config.health_check_timeout_ms || 30_000,
			rollback_threshold_error_rate: config.rollback_threshold_error_rate || 0.5,
			validation_steps: config.validation_steps || [
				"validate-environment-variables",
				"validate-database-connectivity",
				"validate-supabase-configuration",
				"run-security-scans",
				"validate-ai-services-configuration",
				"check-disk-space-and-resources",
			],
			post_deployment_tests: args.skipTests
				? []
				: config.post_deployment_tests || [
						"api-integration-tests",
						"ai-services-integration-tests",
						"compliance-validation-tests",
						"performance-smoke-tests",
					],
		};

		return finalConfig;
	}

	private static async getCurrentGitCommit(): Promise<string> {
		try {
			const { exec } = require("child_process");
			const { promisify } = require("util");
			const execAsync = promisify(exec);

			const { stdout } = await execAsync("git rev-parse --short HEAD");
			return stdout.trim();
		} catch (error) {
			console.warn("Could not determine git commit, using timestamp");
			return `deploy-${Date.now()}`;
		}
	}

	private static validateEnvironmentForProduction(config: DeploymentConfig): void {
		if (config.environment !== "production") return;

		const requiredEnvVars = [
			"DATABASE_URL",
			"SUPABASE_URL",
			"SUPABASE_ANON_KEY",
			"SUPABASE_SERVICE_ROLE_KEY",
			"REDIS_URL",
			"OPENAI_API_KEY",
			"ANTHROPIC_API_KEY",
		];

		const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

		if (missingVars.length > 0) {
			console.error("❌ Missing required environment variables for production deployment:");
			missingVars.forEach((varName) => console.error(`  - ${varName}`));
			process.exit(1);
		}

		// Additional production safety checks
		if (config.deployment_strategy === "blue-green" && !process.env.LOAD_BALANCER_URL) {
			console.warn("⚠️  LOAD_BALANCER_URL not set - blue-green deployment may not work correctly");
		}

		if (config.rollback_threshold_error_rate > 1.0) {
			console.error("❌ Production rollback threshold cannot exceed 1.0% for healthcare applications");
			process.exit(1);
		}
	}

	private static async confirmProductionDeployment(config: DeploymentConfig): Promise<boolean> {
		if (config.environment !== "production") return true;

		console.log("\n🚨 PRODUCTION DEPLOYMENT CONFIRMATION 🚨\n");
		console.log(`Environment: ${config.environment}`);
		console.log(`Version: ${config.version}`);
		console.log(`Strategy: ${config.deployment_strategy}`);
		console.log(`Rollback threshold: ${config.rollback_threshold_error_rate}%`);
		console.log("\nThis will deploy to the PRODUCTION environment serving real patients.");
		console.log("Healthcare data and patient safety are at stake.\n");

		// In a real implementation, this would use readline for interactive confirmation
		const confirmationEnv = process.env.DEPLOYMENT_CONFIRMATION;
		if (confirmationEnv !== "CONFIRMED") {
			console.error("❌ Production deployment must be explicitly confirmed.");
			console.error("Set DEPLOYMENT_CONFIRMATION=CONFIRMED environment variable to proceed.");
			return false;
		}

		return true;
	}

	static async run(args: string[]): Promise<void> {
		console.log("🏥 NeonPro Healthcare AI Services Deployment\n");

		try {
			// Parse command line arguments
			const cliArgs = DeploymentRunner.parseArguments(args);

			// Load deployment configuration
			const config = await DeploymentRunner.loadDeploymentConfig(cliArgs);

			// Validate environment for production
			DeploymentRunner.validateEnvironmentForProduction(config);

			// Confirm production deployment if needed
			const confirmed = await DeploymentRunner.confirmProductionDeployment(config);
			if (!confirmed) {
				console.log("❌ Deployment cancelled by user");
				process.exit(1);
			}

			console.log("📋 Deployment Configuration:");
			console.log(`  Environment: ${config.environment}`);
			console.log(`  Version: ${config.version}`);
			console.log(`  Strategy: ${config.deployment_strategy}`);
			console.log(`  Health Check Timeout: ${config.health_check_timeout_ms}ms`);
			console.log(`  Rollback Threshold: ${config.rollback_threshold_error_rate}%`);
			console.log("");

			// Create and execute deployment pipeline
			const pipeline = new ProductionDeploymentPipeline(config);
			const result = await pipeline.executeDeployment();

			console.log("\n✅ Deployment completed successfully!");
			console.log("📊 Final Status:");
			console.log(`  Deployment ID: ${result.deployment_id}`);
			console.log(`  Duration: ${new Date(result.completed_at!).getTime() - new Date(result.started_at).getTime()}ms`);
			console.log(
				`  Health Checks: ${result.health_checks.filter((hc) => hc.status === "healthy").length}/${result.health_checks.length} healthy`
			);
			console.log(`  Error Rate: ${result.error_rate.toFixed(2)}%`);
			console.log(`  Success Rate: ${result.performance_metrics.success_rate.toFixed(2)}%`);

			if (result.rollback_triggered) {
				console.log("⚠️  Note: Automatic rollback was triggered during deployment");
			}

			process.exit(0);
		} catch (error) {
			console.error("\n❌ Deployment failed:", error.message);

			if (error.stack) {
				console.error("\nStack trace:");
				console.error(error.stack);
			}

			console.error("\n🔍 Troubleshooting tips:");
			console.error("  1. Check all required environment variables are set");
			console.error("  2. Verify database connectivity and Supabase configuration");
			console.error("  3. Ensure all AI services are properly configured");
			console.error("  4. Review deployment logs for specific error details");
			console.error("  5. Check system resources (disk space, memory)");
			console.error("\n📞 For urgent production issues, contact the oncall team");

			process.exit(1);
		}
	}
}

// Run the deployment if this file is executed directly
if (require.main === module) {
	DeploymentRunner.run(process.argv);
}

export default DeploymentRunner;
