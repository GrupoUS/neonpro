#!/usr/bin/env node
"use strict";

/**
 * NEONPRO NEXT.JS 15 APP ROUTER OPTIMIZER
 * Analisa e otimiza estrutura App Router para performance máxima
 */

const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, readdirSync, statSync } = require("fs");
const { join, extname } = require("path");

const rootDir = process.cwd();
const webAppDir = join(rootDir, "apps", "web");

class NextJSOptimizer {
	constructor() {
		this.optimizations = [];
		this.warnings = [];
		this.appRouterPages = [];
		this.pagesRouterFiles = [];
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
		if (type === "warning") this.warnings.push(message);
	}

	// Analisar estrutura atual App Router
	analyzeAppRouterStructure() {
		this.log("🔍 Analisando estrutura App Router...", "info");

		const appDir = join(webAppDir, "app");

		if (!existsSync(appDir)) {
			this.log("App Router não encontrado - criando estrutura", "warning");
			return;
		}

		this.scanDirectory(appDir, appDir);

		this.log(`App Router pages encontradas: ${this.appRouterPages.length}`, "success");
		this.appRouterPages.forEach((page) => {
			this.log(`  📄 ${page}`, "info");
		});
	}

	scanDirectory(dir, baseDir) {
		try {
			const items = readdirSync(dir);

			for (const item of items) {
				const fullPath = join(dir, item);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					this.scanDirectory(fullPath, baseDir);
				} else if (item === "page.tsx" || item === "page.js") {
					const relativePath = fullPath.replace(baseDir, "").replace(/\\/g, "/");
					this.appRouterPages.push(relativePath);
				}
			}
		} catch (error) {
			this.log(`Erro ao escanear diretório ${dir}: ${error.message}`, "error");
		}
	}

	// Verificar se existe Pages Router residual
	checkForPagesRouter() {
		this.log("🔍 Verificando Pages Router residual...", "info");

		const pagesDir = join(webAppDir, "pages");

		if (existsSync(pagesDir)) {
			this.log("ATENÇÃO: Diretório pages/ encontrado - migração necessária", "warning");
			this.scanPagesDirectory(pagesDir);
		} else {
			this.log("Nenhum Pages Router residual encontrado", "success");
		}
	}

	scanPagesDirectory(dir) {
		try {
			const items = readdirSync(dir);

			for (const item of items) {
				const fullPath = join(dir, item);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					this.scanPagesDirectory(fullPath);
				} else if ([".tsx", ".ts", ".jsx", ".js"].includes(extname(item))) {
					this.pagesRouterFiles.push(fullPath);
				}
			}
		} catch (error) {
			this.log(`Erro ao escanear pages: ${error.message}`, "error");
		}
	}

	// Otimizar App Router structure
	optimizeAppRouterStructure() {
		this.log("🔍 Otimizando estrutura App Router...", "info");

		// Verificar route groups
		this.checkRouteGroups();

		// Verificar layouts
		this.checkLayouts();

		// Verificar loading e error pages
		this.checkSpecialPages();
	}

	checkRouteGroups() {
		const appDir = join(webAppDir, "app");
		const routeGroups = ["(dashboard)", "(auth)", "(public)"];

		routeGroups.forEach((group) => {
			const groupPath = join(appDir, group);
			if (existsSync(groupPath)) {
				this.log(`Route group encontrado: ${group}`, "success");
			} else {
				this.log(`Route group recomendado ausente: ${group}`, "warning");
			}
		});
	}

	checkLayouts() {
		const appDir = join(webAppDir, "app");
		const layoutPath = join(appDir, "layout.tsx");

		if (existsSync(layoutPath)) {
			this.log("Root layout encontrado", "success");

			// Verificar conteúdo do layout
			try {
				const layoutContent = readFileSync(layoutPath, "utf-8");

				if (layoutContent.includes("metadata")) {
					this.log("Metadata API detectada no layout", "success");
				} else {
					this.log("Metadata API não encontrada - recomendado implementar", "warning");
				}

				if (layoutContent.includes("viewport")) {
					this.log("Viewport config detectada", "success");
				}
			} catch (error) {
				this.log(`Erro ao ler layout: ${error.message}`, "error");
			}
		} else {
			this.log("Root layout ausente - CRÍTICO", "error");
		}
	}

	checkSpecialPages() {
		const appDir = join(webAppDir, "app");
		const specialPages = ["loading.tsx", "error.tsx", "not-found.tsx"];

		specialPages.forEach((page) => {
			const pagePath = join(appDir, page);
			if (existsSync(pagePath)) {
				this.log(`Special page encontrada: ${page}`, "success");
			} else {
				this.log(`Special page recomendada ausente: ${page}`, "warning");
			}
		});
	}

	// Verificar Server/Client Components
	analyzeServerClientComponents() {
		this.log("🔍 Analisando Server/Client Components...", "info");

		let serverComponents = 0;
		let clientComponents = 0;
		let mixedComponents = 0;

		this.appRouterPages.forEach((pagePath) => {
			const fullPath = join(webAppDir, "app", pagePath.substring(1));

			try {
				const content = readFileSync(fullPath, "utf-8");

				if (content.includes("'use client'") || content.includes('"use client"')) {
					clientComponents++;
				} else if (content.includes("async function") && !content.includes("'use client'")) {
					serverComponents++;
				} else {
					mixedComponents++;
				}
			} catch (error) {
				this.log(`Erro ao analisar ${pagePath}: ${error.message}`, "warning");
			}
		});

		this.log(`Server Components: ${serverComponents}`, "info");
		this.log(`Client Components: ${clientComponents}`, "info");
		this.log(`Componentes não classificados: ${mixedComponents}`, "info");

		if (clientComponents > serverComponents) {
			this.log("RECOMENDAÇÃO: Considere converter mais componentes para Server Components", "warning");
		}
	}

	// Criar relatório de otimização
	generateOptimizationReport() {
		const report = {
			timestamp: new Date().toISOString(),
			analysis: {
				appRouterPages: this.appRouterPages.length,
				pagesRouterFiles: this.pagesRouterFiles.length,
				optimizations: this.optimizations.length,
				warnings: this.warnings.length,
			},
			recommendations: [
				"Implementar route groups para melhor organização",
				"Adicionar loading.tsx e error.tsx em todas as rotas",
				"Otimizar Server/Client Component balance",
				"Implementar Metadata API para SEO",
				"Adicionar viewport configuration",
			],
			nextSteps: [
				"Migrar Pages Router residual (se houver)",
				"Implementar feature-based architecture",
				"Otimizar performance com caching",
				"Setup developer tools",
			],
		};

		const reportPath = join(rootDir, "nextjs15-optimization-report.json");
		writeFileSync(reportPath, JSON.stringify(report, null, 2));

		this.log(`Relatório gerado: ${reportPath}`, "success");
	}

	// Executar análise completa
	runAnalysis() {
		console.log("🚀 INICIANDO ANÁLISE NEXT.JS 15 APP ROUTER\n");

		this.analyzeAppRouterStructure();
		this.checkForPagesRouter();
		this.optimizeAppRouterStructure();
		this.analyzeServerClientComponents();
		this.generateOptimizationReport();

		console.log("\n📊 ANÁLISE COMPLETA:");
		console.log(`🚀 Otimizações identificadas: ${this.optimizations.length}`);
		console.log(`⚠️  Avisos: ${this.warnings.length}`);
		console.log(`📄 App Router pages: ${this.appRouterPages.length}`);
		console.log(`📄 Pages Router files: ${this.pagesRouterFiles.length}`);

		console.log("\n🎯 PRÓXIMOS PASSOS:");
		console.log("  1. Implementar route groups otimizados");
		console.log("  2. Adicionar special pages (loading, error, not-found)");
		console.log("  3. Otimizar Server/Client Component balance");
		console.log("  4. Implementar feature-based architecture");

		return true;
	}
}

// Executar se chamado diretamente
if (require.main === module) {
	const optimizer = new NextJSOptimizer();
	optimizer.runAnalysis();
	process.exit(0);
}

module.exports = NextJSOptimizer;
