#!/usr/bin/env node

/**
 * NeonPro Test File Syntax Error Fixer
 *
 * RED Phase: Systematic fix for syntax errors blocking test compilation
 *
 * Critical Issue: 22 test suites completely blocked due to syntax errors:
 * - String literal syntax: _('text')_ → 'text'
 * - Function parameter syntax: _() → ()
 *
 * Usage: node fix-test-syntax-errors.js
 */

const fs = require("fs");
const path = require("path");

// Configuration
const TARGET_DIRECTORIES = ["apps/api/src/__tests__", "apps/api/tests"];

// Syntax error patterns to fix
const SYNTAX_PATTERNS = [
  {
    name: "Malformed string literals with underscore prefix",
    pattern: /_\('([^']*)'\)/g,
    replacement: "'$1'",
    description: "Fix _('text') → 'text'",
  },
  {
    name: "Malformed function parameters",
    pattern: /_\(\)/g,
    replacement: "()",
    description: "Fix _() → ()",
  },
  {
    name: "Malformed arrow functions with underscore",
    pattern: /_\(([^)]*)\) =>/g,
    replacement: "($1) =>",
    description: "Fix _(param) => → (param) =>",
  },
];

class TestSyntaxFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      totalFixes: 0,
      errors: 0,
    };
    this.dryRun = process.argv.includes("--dry-run");
    this.verbose = process.argv.includes("--verbose");
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileFixes = 0;

      // Apply each syntax pattern fix
      for (const pattern of SYNTAX_PATTERNS) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          modifiedContent = modifiedContent.replace(
            pattern.pattern,
            pattern.replacement,
          );
          fileFixes += matches.length;

          if (this.verbose) {
            this.log(
              `  ${pattern.description}: ${matches.length} fixes applied`,
              "info",
            );
          }
        }
      }

      if (fileFixes > 0) {
        this.stats.totalFixes += fileFixes;
        this.stats.filesModified++;

        if (this.dryRun) {
          this.log(
            `Would fix: ${filePath} (${fileFixes} syntax errors)`,
            "info",
          );
        } else {
          fs.writeFileSync(filePath, modifiedContent, "utf8");
          this.log(`Fixed: ${filePath} (${fileFixes} syntax errors)`, "info");
        }
      } else {
        if (this.verbose) {
          this.log(`No syntax errors found in: ${filePath}`, "info");
        }
      }

      this.stats.filesProcessed++;
      return true;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, "error");
      this.stats.errors++;
      return false;
    }
  }

  async processDirectory(dirPath) {
    this.log(`Processing directory: ${dirPath}`, "info");

    if (!fs.existsSync(dirPath)) {
      this.log(`Directory not found: ${dirPath}`, "warn");
      return;
    }

    const testFiles = this.findTestFiles(dirPath);
    this.log(`Found ${testFiles.length} test files in ${dirPath}`, "info");

    for (const file of testFiles) {
      await this.fixFile(file);
    }
  }

  findTestFiles(dirPath) {
    const testFiles = [];

    const scanDirectory = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && this.isTestFile(entry.name)) {
          testFiles.push(fullPath);
        }
      }
    };

    scanDirectory(dirPath);
    return testFiles.sort();
  }

  isTestFile(filename) {
    return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filename);
  }

  async run() {
    this.log("🚀 NeonPro Test Syntax Error Fixer", "info");
    this.log("========================================", "info");
    this.log(`Mode: ${this.dryRun ? "DRY RUN" : "LIVE"}`, "info");
    this.log("", "info");

    // Process each target directory
    for (const dir of TARGET_DIRECTORIES) {
      await this.processDirectory(dir);
    }

    // Final report
    this.log("", "info");
    this.log("📊 Fix Summary", "info");
    this.log("========================================", "info");
    this.log(`Files processed: ${this.stats.filesProcessed}`, "info");
    this.log(`Files modified: ${this.stats.filesModified}`, "info");
    this.log(`Total syntax fixes: ${this.stats.totalFixes}`, "info");
    this.log(`Errors encountered: ${this.stats.errors}`, "info");

    if (this.dryRun) {
      this.log("", "warn");
      this.log("⚠️  DRY RUN MODE - No files were actually modified", "warn");
      this.log("   Run without --dry-run to apply fixes", "warn");
    }

    if (this.stats.totalFixes > 0) {
      this.log("", "info");
      this.log("✅ Syntax errors fixed successfully!", "info");
      this.log("   Test files should now compile correctly", "info");
    } else {
      this.log("", "info");
      this.log("ℹ️  No syntax errors found", "info");
    }

    process.exit(this.stats.errors > 0 ? 1 : 0);
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new TestSyntaxFixer();
  fixer.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = TestSyntaxFixer;
