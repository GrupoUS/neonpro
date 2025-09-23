#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class ScalableUnderscoreFixer {
  constructor() {
    this.filesProcessed = 0;
    this.filesModified = 0;
    this.totalFixes = 0;
    this.errors = [];
    this.startTime = Date.now();
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  shouldProcessFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const validExtensions = [".ts", ".tsx", ".js", ".jsx"];

    // Skip directories and non-relevant files
    const skipDirs = [
      "node_modules",
      "dist",
      "build",
      ".git",
      ".next",
      ".turbo",
      ".tscache",
    ];

    return (
      validExtensions.includes(ext) &&
      !skipDirs.some((dir) => filePath.includes(`/${dir}/`)) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    );
  }

  fixUnderscorePatterns(content) {
    let fixes = 0;
    let original = content;

    // Comprehensive patterns for underscore syntax fixes
    const patterns = [
      // Function parameters
      { regex: /_\(\s*([^)]+)\s*\)/g, replacement: "($1)", count: 0 },

      // String literals with underscores
      { regex: /_'([^']+)'_/g, replacement: "'$1'", count: 0 },

      // Parameter separation with underscores
      { regex: /_\s*,\s*_/g, replacement: ", ", count: 0 },

      // Event handlers with underscores
      {
        regex: /\.on\(_'([^']+)',_\s*\(([^)]+)\)/g,
        replacement: ".on('$1', ($2)",
        count: 0,
      },

      // Timer functions with underscore callbacks
      {
        regex: /(setInterval|setTimeout|setImmediate)\s*\(_\(\s*\)\s*=>/g,
        replacement: "$1(() =>",
        count: 0,
      },

      // Promise with underscore parameters
      {
        regex: /Promise\(_\(([^)]+)\)\)/g,
        replacement: "Promise(($1))",
        count: 0,
      },

      // Process event handlers
      {
        regex: /process\.on\(_'([^']+)',_\s*\(\s*\)\s*=>/g,
        replacement: "process.on('$1', () =>",
        count: 0,
      },

      // HTTP createServer with underscore parameters
      {
        regex: /http\.createServer\(_\(([^)]+)\)\)/g,
        replacement: "http.createServer(($1))",
        count: 0,
      },

      // Server listen with underscores
      {
        regex: /\.listen\(_([^,]+),\s*_([^,]+),\s*_\(\s*\)\s*=>/g,
        replacement: ".listen($1, $2, () =>",
        count: 0,
      },

      // Single parameter with underscore
      {
        regex: /\(_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: "($1)",
        count: 0,
      },

      // Multiple parameters with underscores
      {
        regex: /\(_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: "($1, $2)",
        count: 0,
      },

      // Triple parameters with underscores
      {
        regex:
          /\(_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: "($1, $2, $3)",
        count: 0,
      },

      // Array/object access with underscores
      { regex: /\[\s*_'([^']+)'\s*\]/g, replacement: "['$1']", count: 0 },

      // New with underscore prefix
      { regex: /_\s*new\s+/g, replacement: "new ", count: 0 },

      // Method calls with underscore prefix
      {
        regex: /_\s*\.\s*(on|listen|then|catch|finally)/g,
        replacement: ".$1",
        count: 0,
      },
    ];

    // Apply each pattern and count matches
    for (const pattern of patterns) {
      const matches = original.match(pattern.regex);
      if (matches) {
        original = original.replace(pattern.regex, pattern.replacement);
        pattern.count = matches.length;
        fixes += matches.length;
      }
    }

    return { content: original, fixes, patterns };
  }

  processFile(filePath) {
    try {
      if (!this.shouldProcessFile(filePath)) {
        return false;
      }

      const originalContent = fs.readFileSync(filePath, "utf8");
      const result = this.fixUnderscorePatterns(originalContent);

      if (result.fixes > 0) {
        fs.writeFileSync(filePath, result.content, "utf8");
        this.filesModified++;
        this.totalFixes += result.fixes;

        // Log the patterns found in this file
        const appliedPatterns = result.patterns.filter((p) => p.count > 0);
        this.log(`Fixed ${result.fixes} issues in ${filePath}`, "success");

        return true;
      }

      this.filesProcessed++;
      return false;
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message,
      });
      this.log(`Error processing ${filePath}: ${error.message}`, "error");
      return false;
    }
  }

  processDirectory(dirPath, maxFiles = 1000) {
    this.log(`Processing directory: ${dirPath} (max ${maxFiles} files)`);

    const walkDir = (currentPath, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion

      try {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
          if (this.filesProcessed >= maxFiles) {
            this.log(`Reached maximum file limit (${maxFiles})`, "warn");
            return;
          }

          const fullPath = path.join(currentPath, item);
          try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              walkDir(fullPath, depth + 1);
            } else if (stat.isFile()) {
              this.processFile(fullPath);
            }
          } catch (statError) {
            // Skip files/directories that can't be accessed
            this.log(
              `Cannot access ${fullPath}: ${statError.message}`,
              "debug",
            );
          }
        }
      } catch (readdirError) {
        // Skip directories that can't be read
        this.log(
          `Cannot read directory ${currentPath}: ${readdirError.message}`,
          "debug",
        );
      }
    };

    walkDir(dirPath);
  }

  runTypeScriptCheck() {
    try {
      this.log("Running TypeScript compilation check...");
      const result = require("child_process").execSync(
        "npx tsc --noEmit --skipLibCheck 2>&1",
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      const errors = result
        .split("\n")
        .filter((line) => line.includes("error TS"));
      this.log(
        `TypeScript check completed. ${errors.length} errors remaining.`,
      );

      return errors.length;
    } catch (error) {
      this.log(`TypeScript check failed: ${error.message}`, "error");
      return -1;
    }
  }

  generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;

    const report = {
      summary: {
        filesProcessed: this.filesProcessed,
        filesModified: this.filesModified,
        totalFixes: this.totalFixes,
        errors: this.errors.length,
        duration: duration,
      },
      errors: this.errors,
      performance: {
        filesPerSecond: (this.filesProcessed / duration).toFixed(2),
        fixesPerSecond: (this.totalFixes / duration).toFixed(2),
      },
    };

    return report;
  }

  run() {
    this.log("Starting大规模下划线语法修复...");

    // Focus on high-impact directories first
    const highImpactDirs = [
      "apps/web/src",
      "apps/api/src",
      "packages/core-services/src",
      "packages/shared/src",
      "packages/ui/src",
    ];

    for (const dir of highImpactDirs) {
      if (fs.existsSync(dir)) {
        this.processDirectory(dir, 500); // Limit files per directory
      }
    }

    const report = this.generateReport();

    this.log("=== 大规模修复总结 ===", "info");
    this.log(`处理文件: ${report.summary.filesProcessed}`, "info");
    this.log(`修改文件: ${report.summary.filesModified}`, "info");
    this.log(`修复问题: ${report.summary.totalFixes}`, "info");
    this.log(`遇到错误: ${report.summary.errors}`, "info");
    this.log(`处理时间: ${report.summary.duration.toFixed(2)} 秒`, "info");
    this.log(`处理速度: ${report.performance.filesPerSecond} 文件/秒`, "info");
    this.log(`修复速度: ${report.performance.fixesPerSecond} 问题/秒`, "info");

    if (report.summary.errors > 0) {
      this.log("处理错误:", "warn");
      report.errors.slice(0, 5).forEach((err) => {
        this.log(`  ${err.file}: ${err.error}`, "warn");
      });
    }

    // Save detailed report
    try {
      fs.writeFileSync(
        "large-scale-underscore-fix-report.json",
        JSON.stringify(report, null, 2),
      );
      this.log(
        "详细报告已保存到: large-scale-underscore-fix-report.json",
        "success",
      );
    } catch (saveError) {
      this.log(`无法保存报告: ${saveError.message}`, "error");
    }

    return report;
  }
}

// Run the fixer
const fixer = new ScalableUnderscoreFixer();
fixer.run();
