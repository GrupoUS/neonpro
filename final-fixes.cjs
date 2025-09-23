#!/usr/bin/env node

const fs = require("fs");

class FinalFixer {
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

      // Specific fixes for https-server.ts
      if (filePath.includes("https-server.ts")) {
        const replacements = [
          {
            from: "http.createServer(_(req,_res) => {",
            to: "http.createServer((req, res) => {",
          },
          {
            from: ".listen(_this.config.httpPort,_this.config.host,_() => {",
            to: ".listen(this.config.httpPort, this.config.host, () => {",
          },
          {
            from: ".listen(_this.config.port,_this.config.host,_() => {",
            to: ".listen(this.config.port, this.config.host, () => {",
          },
          {
            from: "return new Promise(_((resolve, reject)) => {",
            to: "return new Promise((resolve, reject) => {",
          },
          { from: "res.on(_'finish',_() => {", to: "res.on('finish', () => {" },
          {
            from: "process.on(_'SIGTERM',_() => {",
            to: "process.on('SIGTERM', () => {",
          },
          {
            from: "process.on(_'SIGINT',_() => {",
            to: "process.on('SIGINT', () => {",
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
      }

      // Specific fixes for certificate-renewal.ts
      if (filePath.includes("certificate-renewal.ts")) {
        const replacements = [
          {
            from: "certbot.on(_'close',_(code: number) => {",
            to: "certbot.on('close', (code: number) => {",
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
      }

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        this.filesModified++;
        this.totalFixes += fixes;
        this.log(`Fixed ${fixes} issues in ${filePath}`, "success");
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, "error");
      return false;
    }
  }

  run() {
    this.log("Starting final fixes for remaining underscore issues...");

    const targetFiles = [
      "apps/api/src/config/https-server.ts",
      "apps/api/src/config/certificate-renewal.ts",
      "apps/api/src/config/tls-config.ts",
    ];

    for (const file of targetFiles) {
      this.fixFile(file);
    }

    this.log("=== FINAL FIX SUMMARY ===");
    this.log(`Files modified: ${this.filesModified}`);
    this.log(`Total fixes applied: ${this.totalFixes}`);

    return { filesModified: this.filesModified, totalFixes: this.totalFixes };
  }
}

// Run the fixer
const fixer = new FinalFixer();
fixer.run();
