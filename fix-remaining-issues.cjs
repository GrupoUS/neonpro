#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class ComprehensiveFixer {
  constructor() {
    this.filesModified = 0;
    this.totalFixes = 0;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  fixRemainingPatterns(content) {
    let fixes = 0;
    let original = content;

    // Fix remaining patterns
    const patterns = [
      { from: /_(req,_res)/g, to: "(req, res)" },
      { from: /_(_resolve,_reject)/g, to: "(resolve, reject)" },
      { from: /(resolve,_reject)/g, to: "(resolve, reject)" },
      { from: /_(_error)/g, to: "(error)" },
      { from: /_(_socket)/g, to: "(socket)" },
      { from: /_(error,_socket)/g, to: "(error, socket)" },
      {
        from: /http\.createServer\(_(_req,_res)\)/g,
        to: "http.createServer((req, res))",
      },
      {
        from: /\.listen\(_(_this\.config\.httpPort),(_this\.config\.host),_(_\(\)\s*=>)/g,
        to: ".listen(this.config.httpPort, this.config.host, () =>",
      },
      {
        from: /\.listen\(_(_this\.config\.port),(_this\.config\.host),_(_\(\)\s*=>)/g,
        to: ".listen(this.config.port, this.config.host, () =>",
      },
      {
        from: /Promise\(_(_resolve,_reject)\)/g,
        to: "Promise((resolve, reject))",
      },
      {
        from: /_new Promise<void>\(_(closeResolve)\)/g,
        to: "new Promise<void>(closeResolve",
      },
      {
        from: /Promise\.all\(stopPromises\)\.then\(_(_\(\)\s*=>)/g,
        to: "Promise.all(stopPromises).then(() =>",
      },
      {
        from: /process\.on\(_'SIGTERM',_\(_\(\)\s*=>/g,
        to: "process.on('SIGTERM', () =>",
      },
      {
        from: /process\.on\(_'SIGINT',_\(_\(\)\s*=>/g,
        to: "process.on('SIGINT', () =>",
      },
      {
        from: /certbot\.on\(_'close',_\(code:_number\)\s*=>/g,
        to: "certbot.on('close', (code: number) =>",
      },
      { from: /_\s*new/g, to: " new" }, // Remove underscore before new
      { from: /_\s*\.on/g, to: ".on" }, // Remove underscore before .on
      { from: /_\s*\.listen/g, to: ".listen" }, // Remove underscore before .listen
      { from: /_\s*Promise/g, to: "Promise" }, // Remove underscore before Promise
    ];

    for (const pattern of patterns) {
      const matches = original.match(pattern.from);
      if (matches) {
        original = original.replace(pattern.from, pattern.to);
        fixes += matches.length;
        this.log(
          `Applied pattern: ${pattern.from.toString()} - ${matches.length} matches`,
          "debug",
        );
      }
    }

    return { content: original, fixes };
  }

  processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
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

      return false;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, "error");
      return false;
    }
  }

  run() {
    this.log("Starting comprehensive fix for remaining underscore issues...");

    // Target the files we know have issues
    const targetFiles = [
      "apps/api/src/config/https-server.ts",
      "apps/api/src/config/certificate-renewal.ts",
      "apps/api/src/config/tls-config.ts",
    ];

    for (const file of targetFiles) {
      this.processFile(file);
    }

    this.log("=== COMPREHENSIVE FIX SUMMARY ===");
    this.log(`Files modified: ${this.filesModified}`);
    this.log(`Total fixes applied: ${this.totalFixes}`);

    return { filesModified: this.filesModified, totalFixes: this.totalFixes };
  }
}

// Run the fixer
const fixer = new ComprehensiveFixer();
fixer.run();
