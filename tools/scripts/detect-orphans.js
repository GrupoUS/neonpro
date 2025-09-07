#!/usr/bin/env node

/**
 * NeonPro Orphaned Files Detection System
 *
 * Uses multiple heuristics to detect:
 * - Unused files (no imports/references)
 * - Orphaned test files
 * - Duplicate files (content hash)
 * - Obsolete configuration files
 * - Unused assets
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

class OrphanDetector {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.allFiles = new Set();
    this.referencedFiles = new Set();
    this.duplicates = new Map();
    this.orphans = [];
    this.testOrphans = [];
    this.configOrphans = [];
    this.assetOrphans = [];

    // Whitelist patterns for files that should not be considered orphans
    this.whitelist = [
      /^\./, // Hidden files
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/,
      /\.turbo/,
      /\.vercel/,
      /package\.json$/,
      /package-lock\.json$/,
      /bun\.lockb$/,
      /yarn\.lock$/,
      /tsconfig.*\.json$/,
      /turbo\.json$/,
      /README\.md$/,
      /LICENSE$/,
      /\.env/,
      /\.gitignore$/,
      /\.gitattributes$/,
      /vitest\.config/,
      /playwright\.config/,
      /tailwind\.config/,
      /next\.config/,
      /eslint\.config/,
      /prettier\.config/,
      /detect-orphans\.js$/,
      /unused-dependencies-report\.json$/,
      /dependencies-removal-log\.md$/,
      /orphan-files-report\.json$/,
    ];

    // File extensions to analyze for imports
    this.codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
    this.testExtensions = [".test.", ".spec.", ".e2e."];
    this.configExtensions = [".config.", ".conf."];
    this.assetExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".pdf"];
  }

  async detectOrphans() {
    console.log("🔍 Starting orphaned files detection...");

    // Step 1: Collect all files
    await this.collectAllFiles(this.rootDir);
    console.log(`📁 Found ${this.allFiles.size} files to analyze`);

    // Step 2: Analyze imports and references
    await this.analyzeReferences();
    console.log(`🔗 Found ${this.referencedFiles.size} referenced files`);

    // Step 3: Detect duplicates
    await this.detectDuplicates();

    // Step 4: Categorize orphans
    this.categorizeOrphans();

    // Step 5: Generate report
    const report = this.generateReport();

    // Step 6: Save report
    await this.saveReport(report);

    return report;
  }

  async collectAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.rootDir, fullPath);

      // Skip whitelisted patterns
      if (this.whitelist.some(pattern => pattern.test(relativePath))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.collectAllFiles(fullPath);
      } else {
        this.allFiles.add(relativePath);
      }
    }
  }

  async analyzeReferences() {
    for (const filePath of this.allFiles) {
      const fullPath = path.join(this.rootDir, filePath);
      const ext = path.extname(filePath);

      // Only analyze code files for imports
      if (this.codeExtensions.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          this.extractReferences(content, filePath);
        } catch (error) {
          console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
        }
      }
    }
  }

  extractReferences(content, currentFile) {
    // Mark current file as referenced (it exists and is being analyzed)
    this.referencedFiles.add(currentFile);

    // Extract import statements
    const importPatterns = [
      // ES6 imports
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      // Dynamic imports
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // Require statements
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // Next.js dynamic imports
      /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        const resolvedPath = this.resolveImportPath(importPath, currentFile);
        if (resolvedPath) {
          this.referencedFiles.add(resolvedPath);
        }
      }
    }

    // Extract asset references (src, href attributes)
    const assetPatterns = [
      /src\s*=\s*['"`]([^'"`]+)['"`]/g,
      /href\s*=\s*['"`]([^'"`]+)['"`]/g,
      /url\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    for (const pattern of assetPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const assetPath = match[1];
        if (!assetPath.startsWith("http") && !assetPath.startsWith("//")) {
          const resolvedPath = this.resolveAssetPath(assetPath, currentFile);
          if (resolvedPath) {
            this.referencedFiles.add(resolvedPath);
          }
        }
      }
    }
  }

  resolveImportPath(importPath, currentFile) {
    // Skip external packages
    if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
      return null;
    }

    const currentDir = path.dirname(currentFile);
    let resolvedPath;

    if (importPath.startsWith(".")) {
      resolvedPath = path.normalize(path.join(currentDir, importPath));
    } else {
      resolvedPath = path.normalize(importPath.slice(1)); // Remove leading /
    }

    // Try different extensions
    const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
    for (const ext of extensions) {
      const testPath = resolvedPath + ext;
      if (this.allFiles.has(testPath)) {
        return testPath;
      }

      // Try index files
      const indexPath = path.join(resolvedPath, "index" + ext);
      if (this.allFiles.has(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  resolveAssetPath(assetPath, currentFile) {
    const currentDir = path.dirname(currentFile);
    let resolvedPath;

    if (assetPath.startsWith(".")) {
      resolvedPath = path.normalize(path.join(currentDir, assetPath));
    } else if (assetPath.startsWith("/")) {
      resolvedPath = path.normalize(assetPath.slice(1));
    } else {
      resolvedPath = assetPath;
    }

    return this.allFiles.has(resolvedPath) ? resolvedPath : null;
  }

  async detectDuplicates() {
    const hashMap = new Map();

    for (const filePath of this.allFiles) {
      const fullPath = path.join(this.rootDir, filePath);

      try {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash("md5").update(content).digest("hex");

        if (hashMap.has(hash)) {
          const existing = hashMap.get(hash);
          if (!this.duplicates.has(hash)) {
            this.duplicates.set(hash, [existing]);
          }
          this.duplicates.get(hash).push(filePath);
        } else {
          hashMap.set(hash, filePath);
        }
      } catch (error) {
        console.warn(`⚠️  Could not hash ${filePath}: ${error.message}`);
      }
    }
  }

  categorizeOrphans() {
    for (const filePath of this.allFiles) {
      if (!this.referencedFiles.has(filePath)) {
        const ext = path.extname(filePath);
        const basename = path.basename(filePath);

        // Categorize by type
        if (this.testExtensions.some(testExt => basename.includes(testExt))) {
          this.testOrphans.push(filePath);
        } else if (this.configExtensions.some(configExt => basename.includes(configExt))) {
          this.configOrphans.push(filePath);
        } else if (this.assetExtensions.includes(ext)) {
          this.assetOrphans.push(filePath);
        } else {
          this.orphans.push(filePath);
        }
      }
    }
  }

  generateReport() {
    const totalFiles = this.allFiles.size;
    const referencedFiles = this.referencedFiles.size;
    const totalOrphans = this.orphans.length + this.testOrphans.length
      + this.configOrphans.length + this.assetOrphans.length;

    return {
      summary: {
        totalFiles,
        referencedFiles,
        totalOrphans,
        orphanPercentage: ((totalOrphans / totalFiles) * 100).toFixed(2),
        duplicateGroups: this.duplicates.size,
        analysisDate: new Date().toISOString(),
      },
      orphans: {
        code: this.orphans.sort(),
        tests: this.testOrphans.sort(),
        config: this.configOrphans.sort(),
        assets: this.assetOrphans.sort(),
      },
      duplicates: Object.fromEntries(
        Array.from(this.duplicates.entries()).map(([hash, files]) => [
          hash.slice(0, 8), // Short hash for readability
          files.sort(),
        ]),
      ),
      recommendations: this.generateRecommendations(),
    };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.orphans.length > 0) {
      recommendations.push({
        type: "code_cleanup",
        priority: "high",
        message:
          `Found ${this.orphans.length} potentially unused code files. Review and remove if confirmed unused.`,
        files: this.orphans.slice(0, 5), // Show first 5 as examples
      });
    }

    if (this.testOrphans.length > 0) {
      recommendations.push({
        type: "test_cleanup",
        priority: "medium",
        message:
          `Found ${this.testOrphans.length} orphaned test files. Verify if corresponding source files exist.`,
        files: this.testOrphans.slice(0, 5),
      });
    }

    if (this.duplicates.size > 0) {
      recommendations.push({
        type: "duplicate_removal",
        priority: "medium",
        message: `Found ${this.duplicates.size} groups of duplicate files. Consider consolidating.`,
        files: Array.from(this.duplicates.values()).slice(0, 3).flat(),
      });
    }

    if (this.assetOrphans.length > 0) {
      recommendations.push({
        type: "asset_cleanup",
        priority: "low",
        message:
          `Found ${this.assetOrphans.length} unused assets. Safe to remove if confirmed unused.`,
        files: this.assetOrphans.slice(0, 5),
      });
    }

    return recommendations;
  }

  async saveReport(report) {
    const reportPath = path.join(this.rootDir, "orphan-files-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);

    // Also create a summary markdown file
    const summaryPath = path.join(this.rootDir, "detection-heuristics.md");
    const summaryContent = this.generateMarkdownSummary(report);
    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`📝 Summary saved to: ${summaryPath}`);
  }

  generateMarkdownSummary(report) {
    return `# Orphaned Files Detection Report

## Summary
- **Total Files Analyzed**: ${report.summary.totalFiles}
- **Referenced Files**: ${report.summary.referencedFiles}
- **Orphaned Files**: ${report.summary.totalOrphans} (${report.summary.orphanPercentage}%)
- **Duplicate Groups**: ${report.summary.duplicateGroups}
- **Analysis Date**: ${report.summary.analysisDate}

## Detection Heuristics Used

### 1. Import/Export Analysis
- Scanned all TypeScript/JavaScript files for import statements
- Tracked ES6 imports, dynamic imports, and require() calls
- Resolved relative and absolute import paths

### 2. Asset Reference Detection
- Analyzed src, href, and url() references in code
- Tracked image and static asset usage
- Resolved relative asset paths

### 3. Content Hash Duplication
- Generated MD5 hashes for all files
- Identified exact content duplicates
- Grouped duplicate files by hash

### 4. File Type Categorization
- **Code Files**: .ts, .tsx, .js, .jsx files
- **Test Files**: Files containing .test., .spec., .e2e.
- **Config Files**: Files containing .config., .conf.
- **Assets**: Images, PDFs, and static resources

## Orphaned Files by Category

### Code Files (${report.orphans.code.length})
${report.orphans.code.slice(0, 10).map(f => `- ${f}`).join("\n")}
${report.orphans.code.length > 10 ? `\n... and ${report.orphans.code.length - 10} more` : ""}

### Test Files (${report.orphans.tests.length})
${report.orphans.tests.slice(0, 10).map(f => `- ${f}`).join("\n")}
${report.orphans.tests.length > 10 ? `\n... and ${report.orphans.tests.length - 10} more` : ""}

### Config Files (${report.orphans.config.length})
${report.orphans.config.slice(0, 10).map(f => `- ${f}`).join("\n")}
${report.orphans.config.length > 10 ? `\n... and ${report.orphans.config.length - 10} more` : ""}

### Asset Files (${report.orphans.assets.length})
${report.orphans.assets.slice(0, 10).map(f => `- ${f}`).join("\n")}
${report.orphans.assets.length > 10 ? `\n... and ${report.orphans.assets.length - 10} more` : ""}

## Recommendations

${
      report.recommendations.map(rec =>
        `### ${rec.type.replace("_", " ").toUpperCase()} (${rec.priority.toUpperCase()} Priority)
${rec.message}

Example files:
${rec.files.map(f => `- ${f}`).join("\n")}
`
      ).join("\n")
    }

## Next Steps

1. **Review Code Orphans**: Manually verify that code files are truly unused
2. **Clean Test Files**: Remove test files for deleted source files
3. **Consolidate Duplicates**: Choose canonical versions and remove duplicates
4. **Asset Cleanup**: Remove unused images and static assets
5. **Update Imports**: Fix any broken import paths discovered

## Whitelist Patterns

The following patterns are excluded from orphan detection:
- Hidden files (starting with .)
- Node modules and build directories
- Configuration files (package.json, tsconfig.json, etc.)
- Documentation files (README.md, LICENSE)
- Tool-specific files (.gitignore, .env files)

---
*Generated by NeonPro Orphaned Files Detection System*
`;
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const detector = new OrphanDetector(rootDir);

  try {
    const report = await detector.detectOrphans();

    console.log("\n🎉 Detection completed!");
    console.log(`📊 Summary:`);
    console.log(`   Total files: ${report.summary.totalFiles}`);
    console.log(`   Referenced: ${report.summary.referencedFiles}`);
    console.log(
      `   Orphaned: ${report.summary.totalOrphans} (${report.summary.orphanPercentage}%)`,
    );
    console.log(`   Duplicates: ${report.summary.duplicateGroups} groups`);

    if (report.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      report.recommendations.forEach(rec => {
        console.log(`   ${rec.type}: ${rec.message}`);
      });
    }
  } catch (error) {
    console.error("❌ Detection failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { OrphanDetector };
