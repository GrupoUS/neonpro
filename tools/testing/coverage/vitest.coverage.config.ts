/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

/**
 * 📊 NeonPro - Configuração Avançada de Cobertura de Código
 *
 * Configuração para cobertura de código abrangente com múltiplos formatos
 * de relatório e thresholds rigorosos para qualidade de código.
 *
 * Features:
 * - Cobertura de branches, funções, linhas e statements
 * - Relatórios HTML, JSON, LCOV para CI/CD
 * - Thresholds específicos por domínio (Healthcare, Security, Business)
 * - Exclusão inteligente de arquivos desnecessários
 * - Integração com SonarQube e ferramentas de CI/CD
 */

export default defineConfig({
	test: {
		// 🎯 Configuração de Cobertura
		coverage: {
			// Provider de cobertura (c8 para melhor performance)
			provider: "c8",

			// Diretório de saída dos relatórios
			reportsDirectory: "./coverage",

			// 📊 Formatos de Relatório
			reporter: [
				"text", // Console output
				"text-summary", // Resumo no console
				"html", // HTML interativo para análise
				"lcov", // Para SonarQube/Codecov
				"json", // Para CI/CD automation
				"json-summary", // Resumo em JSON
				"cobertura", // XML para ferramentas de CI
				"clover", // XML para análise
			],

			// 🎯 Arquivos incluídos na cobertura
			include: [
				"app/**/*.{ts,tsx}",
				"apps/**/*.{ts,tsx}",
				"packages/**/*.{ts,tsx}",
				"lib/**/*.{ts,tsx}",
				"components/**/*.{ts,tsx}",
				"hooks/**/*.{ts,tsx}",
				"providers/**/*.{ts,tsx}",
			],

			// ❌ Arquivos excluídos da cobertura
			exclude: [
				// Build outputs
				"coverage/**",
				"dist/**",
				"build/**",
				".next/**",

				// Config files
				"**/*.config.{js,ts,mjs}",
				"**/vitest.*.{js,ts}",
				"**/vite.*.{js,ts}",
				"**/next.config.*",
				"**/tailwind.config.*",
				"**/postcss.config.*",

				// Test files
				"**/*.test.{js,ts,tsx}",
				"**/*.spec.{js,ts,tsx}",
				"**/__tests__/**",
				"**/tests/**",
				"**/*.d.ts",

				// Development files
				"**/.*.{js,ts}",
				"**/dev/**",
				"**/scripts/**",

				// External dependencies
				"node_modules/**",

				// Generated files
				"**/generated/**",
				"**/*.generated.{js,ts}",
				"**/schema.ts",

				// Storybook
				"**/*.stories.{js,ts,tsx}",
				"**/.storybook/**",

				// Deployment
				"**/deploy/**",
				"**/docker/**",
			],

			// 🎯 Thresholds de Cobertura (Rigorosos para Healthcare)
			thresholds: {
				// Global thresholds
				global: {
					branches: 90, // 90% cobertura de branches
					functions: 95, // 95% cobertura de funções
					lines: 92, // 92% cobertura de linhas
					statements: 92, // 92% cobertura de statements
				},

				// Thresholds específicos por diretório
				"app/api/**": {
					branches: 95, // APIs críticas - 95%
					functions: 98, // Todas as funções de API
					lines: 95,
					statements: 95,
				},

				"lib/auth/**": {
					branches: 98, // Segurança - 98%
					functions: 100, // Todas as funções de auth
					lines: 98,
					statements: 98,
				},

				"lib/lgpd/**": {
					branches: 100, // Compliance LGPD - 100%
					functions: 100, // Todas as funções de compliance
					lines: 100,
					statements: 100,
				},

				"components/ui/**": {
					branches: 80, // UI components - 80%
					functions: 85,
					lines: 80,
					statements: 80,
				},

				"hooks/**": {
					branches: 90, // Custom hooks - 90%
					functions: 95,
					lines: 90,
					statements: 90,
				},
			},

			// 🔍 Configurações avançadas
			all: true, // Incluir todos os arquivos (mesmo não testados)
			skipFull: false, // Mostrar arquivos com 100% cobertura
			clean: true, // Limpar coverage anterior
			cleanOnRerun: true, // Limpar em cada execução

			// 📁 Watermarks para coloração dos relatórios
			watermarks: {
				statements: [80, 95], // Amarelo < 80%, Verde >= 95%
				functions: [80, 95],
				branches: [80, 95],
				lines: [80, 95],
			},
		},

		// 🎪 Configuração de ambiente para testes
		environment: "node",

		// 📝 Setup files
		setupFiles: ["./vitest.setup.ts"],

		// 🎯 Configuração de globais
		globals: true,

		// 📊 Reporters para testes
		reporter: ["verbose", "json", "html"],

		// ⏱️ Timeout para testes
		testTimeout: 10000,

		// 🔄 Watch configurações
		watch: false,

		// 📁 Diretórios de testes
		include: [
			"tools/testing/**/*.{test,spec}.{js,ts,tsx}",
			"apps/**/*.{test,spec}.{js,ts,tsx}",
			"packages/**/*.{test,spec}.{js,ts,tsx}",
		],
	},

	// 🔗 Resolve configuration
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../../"),
			"@/components": path.resolve(__dirname, "../../components"),
			"@/lib": path.resolve(__dirname, "../../lib"),
			"@/hooks": path.resolve(__dirname, "../../hooks"),
			"@/app": path.resolve(__dirname, "../../app"),
			"@/types": path.resolve(__dirname, "../../types"),
		},
	},
});
