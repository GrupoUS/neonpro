"use strict";
const { execSync } = require("child_process");
const { readFileSync, existsSync } = require("fs");
const { join } = require("path");

const rootDir = process.cwd();

class MigrationValidator {
	constructor() {
		this.errors = [];
		this.warnings = [];
		this.success = [];
	}

	log(message, type = "info") {
		const timestamp = new Date().toISOString();
		const prefix = {
			error: "❌",
			warning: "⚠️ ",
			success: "✅",
			info: "ℹ️ ",
		}[type];

		console.log(`${prefix} [${timestamp}] ${message}`);

		if (type === "error") this.errors.push(message);
		if (type === "warning") this.warnings.push(message);
		if (type === "success") this.success.push(message);
	}

	// Validar estrutura básica do Turborepo
	validateTurborepoStructure() {
		this.log("🔍 Validando estrutura Turborepo...", "info");

		const requiredFiles = ["turbo.json", "pnpm-workspace.yaml", "package.json"];

		const requiredDirs = ["apps", "packages", "apps/web", "packages/ui", "packages/utils", "packages/types"];

		// Verificar arquivos obrigatórios
		for (const file of requiredFiles) {
			const filePath = join(rootDir, file);
			if (existsSync(filePath)) {
				this.log(`Arquivo encontrado: ${file}`, "success");
			} else {
				this.log(`Arquivo obrigatório ausente: ${file}`, "error");
			}
		}

		// Verificar diretórios obrigatórios
		for (const dir of requiredDirs) {
			const dirPath = join(rootDir, dir);
			if (existsSync(dirPath)) {
				this.log(`Diretório encontrado: ${dir}`, "success");
			} else {
				this.log(`Diretório obrigatório ausente: ${dir}`, "error");
			}
		}
	}

	// Validar configuração do Turbo
	validateTurboConfig() {
		this.log("🔍 Validando configuração Turbo...", "info");

		try {
			const turboConfigPath = join(rootDir, "turbo.json");
			const turboConfig = JSON.parse(readFileSync(turboConfigPath, "utf-8"));

			// Verificar tasks essenciais
			const requiredTasks = ["build", "dev", "lint", "test", "type-check"];

			for (const task of requiredTasks) {
				if (turboConfig.tasks && turboConfig.tasks[task]) {
					this.log(`Task configurada: ${task}`, "success");
				} else {
					this.log(`Task ausente: ${task}`, "warning");
				}
			}

			// Verificar remote cache
			if (turboConfig.remoteCache) {
				this.log("Remote cache configurado", "success");
			} else {
				this.log("Remote cache não configurado", "warning");
			}
		} catch (error) {
			this.log(`Erro ao ler turbo.json: ${error.message}`, "error");
		}
	}

	// Validar workspace PNPM
	validatePnpmWorkspace() {
		this.log("🔍 Validando PNPM workspace...", "info");

		try {
			const workspacePath = join(rootDir, "pnpm-workspace.yaml");
			const workspaceContent = readFileSync(workspacePath, "utf-8");

			if (workspaceContent.includes("apps/*")) {
				this.log("Apps workspace configurado", "success");
			} else {
				this.log("Apps workspace não configurado", "error");
			}

			if (workspaceContent.includes("packages/*")) {
				this.log("Packages workspace configurado", "success");
			} else {
				this.log("Packages workspace não configurado", "error");
			}

			// Verificar catalog
			if (workspaceContent.includes("catalog:")) {
				this.log("PNPM catalog configurado", "success");
			} else {
				this.log("PNPM catalog ausente", "warning");
			}
		} catch (error) {
			this.log(`Erro ao ler pnpm-workspace.yaml: ${error.message}`, "error");
		}
	}

	// Executar todas as validações
	runAll() {
		console.log("🚀 INICIANDO VALIDAÇÃO COMPLETA DA MIGRAÇÃO TURBOREPO\n");

		this.validateTurborepoStructure();
		this.validateTurboConfig();
		this.validatePnpmWorkspace();

		console.log("\n📊 RELATÓRIO FINAL:");
		console.log(`✅ Sucessos: ${this.success.length}`);
		console.log(`⚠️  Avisos: ${this.warnings.length}`);
		console.log(`❌ Erros: ${this.errors.length}`);

		if (this.errors.length === 0) {
			console.log("\n🎉 MIGRAÇÃO VALIDADA COM SUCESSO!");
			return true;
		}
		console.log("\n🔧 ERROS ENCONTRADOS - REQUER ATENÇÃO");
		return false;
	}
}

// Executar se chamado diretamente
if (require.main === module) {
	const validator = new MigrationValidator();
	const success = validator.runAll();
	process.exit(success ? 0 : 1);
}

module.exports = MigrationValidator;
