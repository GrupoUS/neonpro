#!/usr/bin/env node

/**
 * NEONPRO TURBOREPO BUILD OPTIMIZER
 * Otimiza configurações de build e performance
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

class BuildOptimizer {
  constructor() {
    this.optimizations = [];
    this.recommendations = [];
  }

  log(message, type = "info") {
    if (type === "optimization") {
      this.optimizations.push(message);
    }
  }

  // Otimizar turbo.json
  optimizeTurboConfig() {
    this.log("🔍 Otimizando configuração Turbo...", "info");

    try {
      const turboConfigPath = join(rootDir, "turbo.json");
      const turboConfig = JSON.parse(readFileSync(turboConfigPath, "utf8"));

      let modified = false;

      // Otimizar task de build
      if (turboConfig.tasks?.build) {
        // Adicionar inputs otimizados
        const optimizedInputs = [
          "**/*.{ts,tsx,js,jsx}",
          "**/*.json",
          "!**/*.test.*",
          "!**/*.spec.*",
          "!**/__tests__/**",
          "!**/test/**",
          "!**/coverage/**",
        ];

        if (!turboConfig.tasks.build.inputs) {
          turboConfig.tasks.build.inputs = optimizedInputs;
          modified = true;
          this.log("Inputs otimizados adicionados ao build", "optimization");
        }

        // Otimizar outputs
        const optimizedOutputs = [
          ".next/**",
          "!.next/cache/**",
          "dist/**",
          "!**/node_modules/**",
        ];

        turboConfig.tasks.build.outputs = optimizedOutputs;
        modified = true;
        this.log("Outputs otimizados para build", "optimization");
      }

      // Adicionar task de preview se não existir
      if (!turboConfig.tasks.preview) {
        turboConfig.tasks.preview = {
          dependsOn: ["build"],
          cache: false,
          persistent: true,
        };
        modified = true;
        this.log("Task preview adicionada", "optimization");
      }

      // Otimizar globalDependencies
      const optimizedGlobalDeps = [
        "**/.env*",
        "tsconfig.json",
        "tailwind.config.*",
        "next.config.*",
        "biome.jsonc",
        "package.json",
        "pnpm-lock.yaml",
        "turbo.json",
      ];

      turboConfig.globalDependencies = optimizedGlobalDeps;
      modified = true;
      this.log("GlobalDependencies otimizadas", "optimization");

      // Configurar experimentalGlobbing se disponível
      if (!turboConfig.experimentalGlobbing) {
        turboConfig.experimentalGlobbing = true;
        modified = true;
        this.log("Experimental globbing habilitado", "optimization");
      }

      if (modified) {
        writeFileSync(
          turboConfigPath,
          JSON.stringify(turboConfig, undefined, 2),
        );
        this.log("turbo.json otimizado e salvo", "success");
      }
    } catch (error) {
      this.log(`Erro ao otimizar turbo.json: ${error.message}`, "error");
    }
  }

  // Otimizar TypeScript project references
  optimizeTypeScriptReferences() {
    this.log("🔍 Otimizando TypeScript project references...", "info");

    // Otimizar tsconfig raiz
    try {
      const rootTsConfigPath = join(rootDir, "tsconfig.json");

      if (existsSync(rootTsConfigPath)) {
        const tsConfig = JSON.parse(readFileSync(rootTsConfigPath, "utf8"));

        // Adicionar references para packages
        const references = [
          { path: "./apps/web" },
          { path: "./packages/ui" },
          { path: "./packages/utils" },
          { path: "./packages/types" },
          { path: "./packages/config" },
        ];

        if (!tsConfig.references) {
          tsConfig.references = references;
          tsConfig.files = [];
          tsConfig.include = [];

          writeFileSync(
            rootTsConfigPath,
            JSON.stringify(tsConfig, undefined, 2),
          );
          this.log(
            "TypeScript project references configuradas",
            "optimization",
          );
        }
      }
    } catch (error) {
      this.log(
        `Erro ao otimizar TypeScript references: ${error.message}`,
        "error",
      );
    }
  }

  // Otimizar package.json scripts
  optimizeRootPackageScripts() {
    this.log("🔍 Otimizando scripts do package.json raiz...", "info");

    try {
      const packageJsonPath = join(rootDir, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

      const optimizedScripts = {
        ...packageJson.scripts,

        // Build otimizado
        build: "turbo build",
        "build:force": "turbo build --force",
        "build:cache": "turbo build --cache-dir=.turbo",

        // Dev com performance
        dev: "turbo dev",
        "dev:cache": "turbo dev --cache-dir=.turbo",

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

        // Performance analysis
        analyze: "turbo analyze",
        "analyze:bundle": "turbo build && turbo analyze",

        // Health checks
        health: "node tools/migration-validator.js",
        validate: "turbo format:check lint type-check test",

        // CI/CD optimized
        ci: "pnpm install --frozen-lockfile && turbo format:check lint type-check test build",
        "ci:cache": "turbo format:check lint type-check test build --cache-dir=.turbo",
      };

      packageJson.scripts = optimizedScripts;

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
      this.log(
        "Scripts otimizados adicionados ao package.json",
        "optimization",
      );
    } catch (error) {
      this.log(`Erro ao otimizar scripts: ${error.message}`, "error");
    }
  }

  // Criar arquivo de configuração de cache
  createCacheConfig() {
    this.log("🔍 Configurando estratégia de cache...", "info");

    const cacheConfig = {
      version: "1.0.0",
      description: "NeonPro Turborepo Cache Configuration",
      strategies: {
        local: {
          enabled: true,
          location: ".turbo",
          maxSize: "500MB",
          retention: "7d",
        },
        remote: {
          enabled: false,
          provider: "vercel",
          teamId: "process.env.VERCEL_TEAM_ID",
          signature: true,
        },
      },
      optimization: {
        parallelism: "auto",
        concurrency: 4,
        outputs: {
          compression: true,
          ignore: [
            "**/node_modules/**",
            "**/.git/**",
            "**/coverage/**",
            "**/test-results/**",
          ],
        },
      },
      analysis: {
        trackUsage: true,
        reportMetrics: true,
        logLevel: "info",
      },
    };

    const configPath = join(rootDir, ".turbo", "config.json");

    try {
      writeFileSync(configPath, JSON.stringify(cacheConfig, undefined, 2));
      this.log(
        "Configuração de cache criada em .turbo/config.json",
        "optimization",
      );
    } catch (error) {
      this.log(`Erro ao criar config de cache: ${error.message}`, "error");
    }
  }

  // Executar benchmark
  runBenchmark() {
    this.log("🔍 Executando benchmark de performance...", "info");

    try {
      const start = Date.now();

      // Test build dry-run para medir performance
      execSync("turbo build --dry-run", {
        cwd: rootDir,
        stdio: "pipe",
      });

      const dryRunTime = Date.now() - start;

      this.log(`Build dry-run completed em ${dryRunTime}ms`, "success");

      // Verificar cache hit rate
      const cacheResult = execSync("turbo build --dry-run --summarize", {
        cwd: rootDir,
        encoding: "utf8",
      });

      if (cacheResult.includes("cache hit")) {
        this.log("Cache hits detectados", "success");
      }

      // Relatório de performance
      const performanceReport = {
        timestamp: new Date().toISOString(),
        dryRunTime: `${dryRunTime}ms`,
        cacheEnabled: true,
        optimizationsApplied: this.optimizations.length,
      };

      writeFileSync(
        join(rootDir, "performance-report.json"),
        JSON.stringify(performanceReport, undefined, 2),
      );

      this.log("Relatório de performance gerado", "success");
    } catch (error) {
      this.log(`Erro no benchmark: ${error.message}`, "warning");
    }
  }

  // Executar todas as otimizações
  async runAll() {
    this.optimizeTurboConfig();
    this.optimizeTypeScriptReferences();
    this.optimizeRootPackageScripts();
    this.createCacheConfig();
    this.runBenchmark();
    this.optimizations.forEach((_opt) => {});

    return true;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BuildOptimizer();
  optimizer.runAll().then(() => {
    return;
    process.exit(0);
  });
}

export default BuildOptimizer;
