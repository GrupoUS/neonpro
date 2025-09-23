#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class AdvancedUnderscoreFixer {
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

  fixRemainingPatterns(content) {
    let fixes = 0;
    let original = content;

    // Advanced patterns for remaining underscore issues
    const patterns = [
      // Mixed parameter patterns with underscores
      {
        regex: /\.listen\(_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_\(\s*\)\s*=>/g,
        replacement: ".listen($1, () =>",
        count: 0,
      },

      // Async function declarations with underscores
      {
        regex: /setTimeout\(_async\s*\(\s*\)\s*=>/g,
        replacement: "setTimeout(async () =>",
        count: 0,
      },
      {
        regex: /setInterval\(_async\s*\(\s*\)\s*=>/g,
        replacement: "setInterval(async () =>",
        count: 0,
      },

      // Function calls with underscore parameters
      {
        regex: /Promise\.(_\s*resolve|_\s*reject|_resolve|_reject)\s*\(/g,
        replacement: "Promise.$1(",
        count: 0,
      },

      // Mixed parameter lists with underscores
      {
        regex:
          /\(_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*\(\s*\)\s*=>/g,
        replacement: "($1, $2, () =>",
        count: 0,
      },

      // Array access with underscore strings
      { regex: /\[\s*_'([^']+)'\s*\]/g, replacement: "['$1']", count: 0 },

      // Object property access with underscores
      {
        regex: /\.(_[a-zA-Z_][a-zA-Z0-9_]*)\s*\./g,
        replacement: ".$1.",
        count: 0,
      },

      // Event handler parameters with mixed patterns
      {
        regex: /\.on\(_'([^']+)',\s*_\s*\(\s*([^)]+)\s*\)/g,
        replacement: ".on('$1', ($2)",
        count: 0,
      },

      // Function declarations with underscore prefixes
      {
        regex: /function\s+_([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        replacement: "function $1(",
        count: 0,
      },

      // Variable declarations with underscore prefixes in certain contexts
      {
        regex: /const\s+_([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g,
        replacement: "const $1 =",
        count: 0,
      },

      // Catch parameters with underscores
      {
        regex: /catch\s*\(_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: "catch ($1)",
        count: 0,
      },

      // Arrow functions with single underscore parameter
      {
        regex: /_\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=>/g,
        replacement: "$1 =>",
        count: 0,
      },

      // Template literals with underscore prefixes
      { regex: /_`([^`]+)`/g, replacement: "`$1`", count: 0 },

      // Method calls with underscore prefixes
      {
        regex: /(_[a-zA-Z_][a-zA-Z0-9_]*)\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "$1.$2",
        count: 0,
      },

      // Import/export statements with underscores
      {
        regex: /import\s+_\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "import $1",
        count: 0,
      },
      {
        regex: /export\s+_\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "export $1",
        count: 0,
      },

      // Type annotations with underscores
      {
        regex: /:\s*_([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: ": $1",
        count: 0,
      },

      // Return statements with underscores
      {
        regex: /return\s+_([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "return $1",
        count: 0,
      },

      // New expressions with underscores
      {
        regex: /new\s+_([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "new $1",
        count: 0,
      },

      // Throw statements with underscores
      {
        regex: /throw\s+_([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: "throw $1",
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

        if (matches.length > 0) {
          this.log(
            `Applied pattern: ${pattern.regex.toString()} (${matches.length} times)`,
            "debug",
          );
        }
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
      const result = this.fixRemainingPatterns(originalContent);

      if (result.fixes > 0) {
        fs.writeFileSync(filePath, result.content, "utf8");
        this.filesModified++;
        this.totalFixes += result.fixes;

        this.log(
          `Fixed ${result.fixes} remaining issues in ${filePath}`,
          "success",
        );

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
    this.log(
      `Processing directory for remaining patterns: ${dirPath} (max ${maxFiles} files)`,
    );

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
    this.log("Starting remaining underscore patterns fix...");

    // Focus on remaining directories that might have issues
    const targetDirs = [
      "apps/api/src",
      "apps/web/src",
      "packages",
      "apps/api/src/lib",
      "apps/api/src/config",
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        this.processDirectory(dir, 800); // Reasonable limit per directory
      }
    }

    const report = this.generateReport();

    this.log("=== 剩余模式修复总结 ===", "info");
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
        "remaining-underscore-fix-report.json",
        JSON.stringify(report, null, 2),
      );
      this.log(
        "详细报告已保存到: remaining-underscore-fix-report.json",
        "success",
      );
    } catch (saveError) {
      this.log(`无法保存报告: ${saveError.message}`, "error");
    }

    return report;
  }
}

// Run the fixer
const fixer = new AdvancedUnderscoreFixer();
fixer.run();
