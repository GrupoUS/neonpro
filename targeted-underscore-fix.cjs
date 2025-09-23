#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class TargetedUnderscoreFixer {
  constructor() {
    this.filesModified = 0;
    this.totalFixes = 0;
    this.targetPatterns = [
      {
        name: "event handlers",
        regex: /\.on\(_'([^']+)',_\s*\(([^)]+)\)/g,
        replacement: ".on('$1', ($2)",
        files: [
          "apps/api/src/config/https-server.ts",
          "apps/api/src/config/certificate-renewal.ts",
        ],
      },
      {
        name: "function parameters",
        regex: /setInterval\(_\(\s*\)\s*=>/g,
        replacement: "setInterval(() =>",
        files: ["apps/api/src/config/https-server.ts"],
      },
      {
        name: "string literals in events",
        regex: /_'([^']+)'_/g,
        replacement: "'$1'",
        files: [
          "apps/api/src/config/https-server.ts",
          "apps/api/src/config/certificate-renewal.ts",
        ],
      },
    ];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`File not found: ${filePath}`, "warn");
        return false;
      }

      const originalContent = fs.readFileSync(filePath, "utf8");
      let content = originalContent;
      let fileFixes = 0;

      // Apply relevant patterns to this file
      for (const pattern of this.targetPatterns) {
        if (pattern.files.includes(filePath)) {
          const matches = content.match(pattern.regex);
          if (matches) {
            content = content.replace(pattern.regex, pattern.replacement);
            fileFixes += matches.length;
            this.log(
              `Applied ${pattern.name} to ${filePath}: ${matches.length} matches`,
              "debug",
            );
          }
        }
      }

      // Additional targeted fixes
      if (filePath.includes("https-server.ts")) {
        // Fix specific patterns in https-server.ts
        const fixes = [
          { from: "setInterval(_() => {", to: "setInterval(() => {" },
          { from: ".on(_'close',_() => {", to: ".on('close', () => {" },
          {
            from: ".on(_'request',_(req,_res) => {",
            to: ".on('request', (req, res) => {",
          },
          { from: ".on(_'finish',_() => {", to: ".on('finish', () => {" },
          { from: "res.on(_'finish',_() => {", to: "res.on('finish', () => {" },
        ];

        for (const fix of fixes) {
          if (content.includes(fix.from)) {
            content = content.replace(
              new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              fix.to,
            );
            fileFixes++;
          }
        }
      }

      if (filePath.includes("certificate-renewal.ts")) {
        // Fix specific patterns in certificate-renewal.ts
        const fixes = [
          { from: "_(", to: "(" },
          { from: ",_", to: ", " },
          { from: "')_", to: "')" },
        ];

        for (const fix of fixes) {
          const matches = (
            content.match(
              new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            ) || []
          ).length;
          if (matches > 0) {
            content = content.replace(
              new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              fix.to,
            );
            fileFixes += matches;
          }
        }
      }

      // Only write if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        this.filesModified++;
        this.totalFixes += fileFixes;
        this.log(`Fixed ${fileFixes} issues in ${filePath}`, "success");
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, "error");
      return false;
    }
  }

  run() {
    this.log("Starting targeted underscore syntax fix...");

    // Target specific problematic files first
    const targetFiles = [
      "apps/api/src/config/https-server.ts",
      "apps/api/src/config/certificate-renewal.ts",
      "apps/api/src/config/tls-config.ts",
    ];

    for (const file of targetFiles) {
      this.processFile(file);
    }

    this.log("=== TARGETED FIX SUMMARY ===");
    this.log(`Files modified: ${this.filesModified}`);
    this.log(`Total fixes applied: ${this.totalFixes}`);

    return { filesModified: this.filesModified, totalFixes: this.totalFixes };
  }
}

// Run the fixer
const fixer = new TargetedUnderscoreFixer();
fixer.run();
