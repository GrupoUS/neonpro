#!/usr/bin/env node

const fs = require("fs");

class CleanupFixer {
  constructor() {
    this.filesModified = 0;
    this.totalFixes = 0;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let fixes = 0;
      let fixedContent = content;

      // Fix remaining patterns
      const replacements = [
        {
          from: "Promise.all(stopPromises).then(_() => {",
          to: "Promise.all(stopPromises).then(() => {",
        },
        {
          from: "process.on(_'SIGTERM',_() => shutdown('SIGTERM'));",
          to: "process.on('SIGTERM', () => shutdown('SIGTERM'));",
        },
        {
          from: "process.on(_'SIGINT',_() => shutdown('SIGINT'));",
          to: "process.on('SIGINT', () => shutdown('SIGINT'));",
        },
      ];

      for (const replacement of replacements) {
        if (fixedContent.includes(replacement.from)) {
          fixedContent = fixedContent.replace(
            new RegExp(
              replacement.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              "g",
            ),
            replacement.to,
          );
          fixes++;
        }
      }

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        this.filesModified++;
        this.totalFixes += fixes;
        this.log(`Fixed ${fixes} final issues in ${filePath}`, "success");
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, "error");
      return false;
    }
  }

  run() {
    this.log("Starting cleanup of remaining underscore issues...");

    const targetFiles = [
      "apps/api/src/config/https-server.ts",
      "apps/api/src/config/certificate-renewal.ts",
    ];

    for (const file of targetFiles) {
      this.fixFile(file);
    }

    this.log("=== CLEANUP FIX SUMMARY ===");
    this.log(`Files modified: ${this.filesModified}`);
    this.log(`Total fixes applied: ${this.totalFixes}`);

    return { filesModified: this.filesModified, totalFixes: this.totalFixes };
  }
}

// Run the fixer
const fixer = new CleanupFixer();
fixer.run();
