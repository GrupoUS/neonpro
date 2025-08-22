"use strict";
const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const rootDir = process.cwd();

class BuildOptimizer {
	constructor() {
		this.optimizations = [];
	}

	log(message, type = "info") {
		const timestamp = new Date().toISOString();
		const prefix = {
			error: "❌",
			warning: "⚠️ ",
			success: "✅",
			info: "ℹ️ ",
			optimization: "🚀",
		}[type];

		console.log(`${prefix} [${timestamp}] ${message}`);

		if (type === "optimization") this.optimizations.push(message);
	}

	// Otimizar package.json scripts
	optimizeRootPackageScripts() {
		this.log("🔍 Otimizando scripts do package.json raiz...", "info");

		try {
			const packageJsonPath = join(rootDir, "package.json");
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

			const newScripts = {
				// Build otimizado
				"build:force": "turbo build --force",
				"build:cache": "turbo build --cache-dir=.turbo",

				// Quality assurance
				quality: "turbo format lint type-check test",
				"quality:fix": "turbo format lint:fix",

				// Cache management
				"cache:clean": "turbo clean && rm -rf .turbo",
				"cache:prune": "turbo prune",

				// Monorepo utilities
				"workspace:graph": "turbo graph",
				"workspace:list": "pnpm list --recursive --depth=0",
				"workspace:update": "pnpm update --recursive",

				// Health checks
				health: "node tools/migration-validator.cjs",
				validate: "turbo format:check lint type-check test",

				// CI/CD optimized
				"ci:cache": "turbo format:check lint type-check test build --cache-dir=.turbo",
			};

			// Adicionar apenas scripts que não existem
			let modified = false;
			for (const [script, command] of Object.entries(newScripts)) {
				if (!packageJson.scripts[script]) {
					packageJson.scripts[script] = command;
					modified = true;
					this.log(`Script adicionado: ${script}`, "optimization");
				}
			}

			if (modified) {
				writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
				this.log("Scripts otimizados adicionados ao package.json", "success");
			}
		} catch (error) {
			this.log(`Erro ao otimizar scripts: ${error.message}`, "error");
		}
	}

	// Testar build
	testBuild() {
		this.log("🔍 Testando build...", "info");

		try {
			// Test build dry-run para medir performance
			const start = Date.now();
			execSync("turbo build --dry-run", {
				cwd: rootDir,
				stdio: "pipe",
			});
			const dryRunTime = Date.now() - start;

			this.log(`Build dry-run completo em ${dryRunTime}ms`, "success");
		} catch (error) {
			this.log(`Erro no build test: ${error.message}`, "warning");
		}
	}

	// Executar todas as otimizações
	runAll() {
		console.log("🚀 INICIANDO OTIMIZAÇÃO DE BUILD TURBOREPO\n");

		this.optimizeRootPackageScripts();
		this.testBuild();

		console.log("\n📊 OTIMIZAÇÕES APLICADAS:");
		this.optimizations.forEach((opt) => console.log(`  🚀 ${opt}`));

		console.log("\n🎉 OTIMIZAÇÃO COMPLETA!");
		console.log('💡 Execute "pnpm health" para validar todas as mudanças');

		return true;
	}
}

// Executar se chamado diretamente
if (require.main === module) {
	const optimizer = new BuildOptimizer();
	optimizer.runAll();
	process.exit(0);
}

module.exports = BuildOptimizer;
