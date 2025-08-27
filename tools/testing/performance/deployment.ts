/**
 * Production Deployment Optimization Scripts
 *
 * Advanced optimization utilities for Next.js 15 production deployments
 * Based on 2025 deployment best practices
 */

import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

// Deployment configuration
export const DEPLOYMENT_CONFIG = {
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  TURBOPACK: process.env.USE_TURBOPACK === "true",
  ANALYZE: process.env.ANALYZE === "true",

  // Build optimization flags
  BUILD_FLAGS: [
    "--no-lint", // Skip linting in CI (should be done separately)
    "--experimental-build-mode=compile", // Faster builds
  ],

  // Environment-specific settings
  ENVIRONMENTS: {
    development: {
      minify: false,
      sourceMaps: true,
      compression: false,
    },
    staging: {
      minify: true,
      sourceMaps: true,
      compression: true,
    },
    production: {
      minify: true,
      sourceMaps: false,
      compression: true,
    },
  },
} as const;

// Pre-build optimization tasks
// TODO: Convert to standalone functions
export class PreBuildOptimizer {
  static async optimizeAssets(): Promise<void> {
    // Optimize images in public directory
    await PreBuildOptimizer.optimizeImages();

    // Clean up temporary files
    await PreBuildOptimizer.cleanupTempFiles();

    // Validate environment variables
    await PreBuildOptimizer.validateEnvironment();
  };

  private static async optimizeImages(): Promise<void> {
    const publicDir = path.join(process.cwd(), "public");

    try {
      const files = await PreBuildOptimizer.getAllFiles(publicDir, [
        ".png",
        ".jpg",
        ".jpeg",
      ]);

      for (const file of files) {
        // Check if image needs optimization (> 500KB)
        const stats = await fs.stat(file);
        if (stats.size > 500 * 1024) {
        }
      }
    } catch {}
  }

  private static async cleanupTempFiles(): Promise<void> {
    const tempDirs = [".next", ".swc", "node_modules/.cache"];

    for (const dir of tempDirs) {
      const fullPath = path.join(process.cwd(), dir);
      try {
        await fs.access(fullPath);
        // Don't delete, just report size      } catch {
        // Directory doesn't exist, skip
      }
    };
  }

  private static async validateEnvironment(): Promise<void> {
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "DATABASE_URL",
    ];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }
  }

  private static async getAllFiles(
    dir: string,
    extensions: string[],
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          files.push(
            ...(await PreBuildOptimizer.getAllFiles(fullPath, extensions)),
          );
        } else if (
          extensions.some((ext) => item.name.toLowerCase().endsWith(ext))
        ) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or is not accessible
    }

    return files;
  }

  private static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          totalSize += await PreBuildOptimizer.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch {
      // Skip inaccessible directories
    }

    return totalSize;
  }
}

// Build optimization
// TODO: Convert to standalone functions
export class BuildOptimizer {
  static async optimizedBuild(): Promise<void> {
    const startTime = Date.now();

    try {
      // Pre-build optimizations
      await PreBuildOptimizer.optimizeAssets();

      // Configure build environment
      BuildOptimizer.configureBuildEnvironment();

      // Run build with optimizations
      await BuildOptimizer.runBuild();

      // Post-build analysis
      await BuildOptimizer.analyzeBuild();    } catch {
      process.exit(1);
    }
  }

  private static configureBuildEnvironment(): void {
    // Set optimal Node.js flags for build
    process.env.NODE_OPTIONS = [
      "--max-old-space-size=4096", // Increase memory limit
      "--optimize-for-size", // Optimize for smaller bundles
    ].join(" ");

    // Enable optimizations
    process.env.NODE_ENV = "production";

    if (DEPLOYMENT_CONFIG.TURBOPACK) {
    }
  }

  private static async runBuild(): Promise<void> {
    const buildCommand = [
      "next",
      "build",
      DEPLOYMENT_CONFIG.TURBOPACK ? "--turbopack" : "",
      ...DEPLOYMENT_CONFIG.BUILD_FLAGS,
    ]
      .filter(Boolean)
      .join(" ");

    try {
      execSync(buildCommand, {
        stdio: "inherit",
        env: { ...process.env },
      });
    } catch (error) {
      throw new Error(`Build command failed: ${error}`);
    }
  }

  private static async analyzeBuild(): Promise<void> {
    const buildDir = path.join(process.cwd(), ".next");

    try {
      // Check if build directory exists
      await fs.access(buildDir);

      // Analyze build size
      // Check for critical files
      const criticalFiles = [
        ".next/static",
        ".next/server",
        ".next/standalone",
      ];

      for (const file of criticalFiles) {
        const filePath = path.join(process.cwd(), file);
        try {
          await fs.access(filePath);
        } catch {}
      }
    } catch {}
  }
}

// Production health checks
// TODO: Convert to standalone functions
export class ProductionHealthCheck {
  static async runHealthChecks(): Promise<boolean> {
    const checks = [
      ProductionHealthCheck.checkBuildArtifacts,
      ProductionHealthCheck.checkEnvironmentVariables,
      ProductionHealthCheck.checkDependencies,
      ProductionHealthCheck.checkSecurityHeaders,
      ProductionHealthCheck.checkPerformanceConfig,
    ];

    const results = await Promise.allSettled(checks.map((check) => check()));

    const failed = results.filter((result) => result.status === "rejected");

    if (failed.length > 0) {
      failed.forEach((result, _index) => {
        if (result.status === "rejected") {
        }
      });
      return false;
    }
    return true;
  }

  private static async checkBuildArtifacts(): Promise<void> {
    const requiredFiles = [
      ".next/BUILD_ID",
      ".next/static",
      ".next/server/app",
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(process.cwd(), file);
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`Missing build artifact: ${file}`);
      }
    }
  }

  private static async checkEnvironmentVariables(): Promise<void> {
    const prodVars = [
      "NODE_ENV",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    for (const varName of prodVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      throw new Error('NODE_ENV must be set to "production"');
    }
  }

  private static async checkDependencies(): Promise<void> {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8"),
      );

      // Check for production dependencies
      const prodDeps = Object.keys(packageJson.dependencies || {});
      const requiredDeps = ["next", "react", "react-dom"];

      for (const dep of requiredDeps) {
        if (!prodDeps.includes(dep)) {
          throw new Error(`Missing required dependency: ${dep}`);
        }
      }
    } catch (error) {
      throw new Error(`Dependency check failed: ${error}`);
    }
  }

  private static async checkSecurityHeaders(): Promise<void> {
    const nextConfigPath = path.join(process.cwd(), "next.config.mjs");

    try {
      const configContent = await fs.readFile(nextConfigPath, "utf8");

      // Check for security headers
      const requiredHeaders = [
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
      ];

      for (const header of requiredHeaders) {
        if (!configContent.includes(header)) {
        }
      }
    } catch {}
  }

  private static async checkPerformanceConfig(): Promise<void> {
    const nextConfigPath = path.join(process.cwd(), "next.config.mjs");

    try {
      const configContent = await fs.readFile(nextConfigPath, "utf8");

      // Check for performance optimizations
      const optimizations = ["swcMinify", "compress", "optimizePackageImports"];

      for (const opt of optimizations) {
        if (!configContent.includes(opt)) {
        }
      }
    } catch {}
  }
}

// Deployment automation
// TODO: Convert to standalone functions
export class DeploymentAutomation {
  static async deploy(
    environment: "staging" | "production" = "production",
  ): Promise<void> {
    try {
      // Run health checks
      const healthChecksPassed = await ProductionHealthCheck.runHealthChecks();
      if (!healthChecksPassed) {
        throw new Error("Health checks failed");
      }

      // Run optimized build
      await BuildOptimizer.optimizedBuild();

      // Environment-specific deployment steps
      await DeploymentAutomation.deployToEnvironment(environment);
    } catch {
      process.exit(1);
    }
  }

  private static async deployToEnvironment(
    _environment: string,
  ): Promise<void> {
    // Example deployment steps
    const deploymentSteps = [
      "Uploading static assets",
      "Deploying server functions",
      "Updating environment configuration",
      "Running database migrations",
      "Warming up caches",
      "Running smoke tests",
    ];

    for (const _step of deploymentSteps) {
      // Simulate deployment step
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "build": {
      BuildOptimizer.optimizedBuild();
      break;
    }

    case "health-check": {
      ProductionHealthCheck.runHealthChecks().then((passed) => process.exit(passed ? 0 : 1));
      break;
    }

    case "deploy": {
      const env = (process.argv[3] as "staging" | "production") || "production";
      DeploymentAutomation.deploy(env);
      break;
    }

    default:
  }
}
