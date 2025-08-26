#!/usr/bin/env node

/**
 * NeonPro Healthcare Test Runner
 * ============================
 *
 * Utility script to run Vitest and Playwright tests
 * with the correct configurations and environments.
 */

const { spawn } = require("node:child_process");
const _path = require("node:path");

// Test configurations
const CONFIGS = {
	vitest: {
		simple: "vitest.simple.config.ts",
		full: "vitest.config.ts",
	},
	playwright: {
		simple: "playwright.simple.config.ts",
		full: "playwright.config.ts",
	},
};

// Environment setup
const HEALTHCARE_ENV = {
	NODE_ENV: "test",
	HEALTHCARE_MODE: "true",
	LGPD_COMPLIANCE: "true",
	ANVISA_VALIDATION: "true",
	CFM_STANDARDS: "true",
};

/**
 * Run command with proper environment and error handling
 */
function runCommand(command, args = [], options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: "inherit",
			shell: true,
			env: { ...process.env, ...HEALTHCARE_ENV, ...options.env },
			cwd: options.cwd || process.cwd(),
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve(code);
			} else {
				reject(new Error(`Command failed with code ${code}`));
			}
		});

		child.on("error", (error) => {
			reject(error);
		});
	});
}

/**
 * Run Vitest tests
 */
async function runVitest(config = "simple") {
	const configFile = CONFIGS.vitest[config];

	try {
		await runCommand("npx", [
			"vitest",
			"run",
			"--config",
			configFile,
			"--reporter=verbose",
		]);
	} catch (_error) {
		process.exit(1);
	}
}

/**
 * Run Playwright tests
 */
async function runPlaywright(config = "simple") {
	const configFile = CONFIGS.playwright[config];

	try {
		await runCommand("npx", [
			"playwright",
			"test",
			"--config",
			configFile,
			"--reporter=line",
		]);
	} catch (_error) {
		process.exit(1);
	}
}

/**
 * Main CLI interface
 */
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];
	const config = args[1] || "simple";

	switch (command) {
		case "vitest":
			await runVitest(config);
			break;

		case "playwright":
			await runPlaywright(config);
			break;

		case "all":
			await runVitest(config);
			await runPlaywright(config);
			break;
		default:
			break;
	}
}

// Run the CLI
main().catch((_error) => {
	process.exit(1);
});
