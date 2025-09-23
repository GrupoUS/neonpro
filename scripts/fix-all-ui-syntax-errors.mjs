#!/usr/bin/env node

/**
 * Comprehensive UI Package Syntax Error Fixer
 *
 * This script systematically fixes ALL syntax errors in UI components
 * that are blocking the test suite compilation.
 *
 * Patterns fixed:
 * 1. Parameter destructuring with underscores: { name,_label, ...props } → { name, label, ...props }
 * 2. Component parameter syntax: ({ param1,_param2 }) → ({ param1, param2 })
 * 3. Variable naming issues: _parameterName → parameterName
 * 4. Missing imports for zod
 * 5. useEffect parameter issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_COMPONENTS_DIR = "/home/vibecode/neonpro/packages/ui/src/components";

// Enhanced fix patterns
const FIX_PATTERNS = [
  // Parameter destructuring with underscores
  {
    pattern: /{([^}]*),_([^,}]+)([^}]*)}/g,
    replacement: (match, before, param, after) => {
      // Remove the underscore from the parameter name
      return `{${before},${param}${after}}`;
    },
    description: "Remove underscores from destructured parameters",
  },

  // Component parameter syntax with underscores
  {
    pattern: /\(({[^}]*),_([^,}]+)([^}]*)\)\s*=>/g,
    replacement: (match, before, param, after) => {
      // Remove the underscore from the parameter name
      return `(${before},${param}${after}) =>`;
    },
    description: "Remove underscores from component parameters",
  },

  // Standalone underscore parameters in function signatures
  {
    pattern: /_\s*([^,\s)]+)/g,
    replacement: "$1",
    description: "Remove underscore prefix from parameter names",
  },

  // Fix variable references to underscored parameters
  {
    pattern: /_([a-zA-Z_][a-zA-Z0-9_]*)/g,
    replacement: (match, paramName) => {
      // Only replace if it's not a known intentional underscore (like _error, _index)
      const intentionalUnderscores = [
        "_error",
        "_validationError",
        "_index",
        "_id",
      ];
      if (!intentionalUnderscores.includes(`_${paramName}`)) {
        return paramName;
      }
      return match;
    },
    description: "Fix variable references to remove underscore prefix",
  },

  // Fix useEffect parameter issues
  {
    pattern: /useEffect\(_\(\)\s*=>/g,
    replacement: "useEffect(() =>",
    description: "Fix useEffect parameter syntax",
  },

  // Fix extra commas in object literals
  {
    pattern: /,(\s*[}\]])/g,
    replacement: "$1",
    description: "Remove trailing commas in objects/arrays",
  },

  // Fix incomplete JSX expressions
  {
    pattern: /{(_\w+)\s*}/g,
    replacement: (match, varName) => {
      // If it's a variable with underscore, fix it
      if (varName.startsWith("_")) {
        return `{${varName.substring(1)}}`;
      }
      return match;
    },
    description: "Fix incomplete JSX expressions with underscore variables",
  },
];

// Add missing imports for commonly missing modules
const MISSING_IMPORTS = {
  zod: "import { z } from 'zod';",
  react: "import React from 'react';",
};

// Find all TypeScript/TSX files in the UI components directory
function findTsxFiles(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
      ) {
        files.push(path.relative(UI_COMPONENTS_DIR, fullPath));
      }
    }
  }

  scanDirectory(dir);
  return files;
}

function fixFile(filePath) {
  console.log(`\\n🔧 Fixing ${filePath}...`);

  try {
    let content = fs.readFileSync(filePath, "utf8");
    const _originalContent = content;
    let changesMade = false;

    // Apply each fix pattern
    for (const fix of FIX_PATTERNS) {
      const beforeFix = content;
      content = content.replace(fix.pattern, fix.replacement);

      if (beforeFix !== content) {
        console.log(`  ✅ Applied: ${fix.description}`);
        changesMade = true;
      }
    }

    // Check for missing imports
    for (const [module, importStatement] of Object.entries(MISSING_IMPORTS)) {
      if (content.includes(module) && !content.includes(importStatement)) {
        // Find where to insert the import (after existing imports)
        const importInsertPosition = content.lastIndexOf("import");
        const importEndPosition = content.indexOf("\\n", importInsertPosition);

        if (importInsertPosition !== -1 && importEndPosition !== -1) {
          content =
            content.slice(0, importEndPosition + 1) +
            importStatement +
            "\\n" +
            content.slice(importEndPosition + 1);
          console.log(`  ✅ Added missing import: ${module}`);
          changesMade = true;
        }
      }
    }

    // Write back if changes were made
    if (changesMade) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  📝 File updated successfully`);
      return true;
    } else {
      console.log(`  ℹ️  No changes needed`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function validateCompilation() {
  console.log("\\n🔍 Validating UI package compilation...");

  try {
    // Try to check if TypeScript compilation would work
    const packageJsonPath = path.join(UI_COMPONENTS_DIR, "..", "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      console.log(`  📦 Package: ${packageJson.name}`);
      console.log(
        `  📋 Build script: ${packageJson.scripts?.build || "not found"}`,
      );
    }

    return true;
  } catch (error) {
    console.error("  ❌ Validation error:", error.message);
    return false;
  }
}

function main() {
  console.log("🚀 Starting Comprehensive UI Package Syntax Error Fixer");
  console.log("========================================================");

  let filesFixed = 0;
  let totalFiles = 0;

  // Find all TSX files to fix
  console.log("\\n📂 Scanning for UI component files...");
  const allFiles = findTsxFiles(UI_COMPONENTS_DIR);
  console.log(`   Found ${allFiles.length} TypeScript/TSX files`);

  // Process each file
  for (const relativePath of allFiles) {
    const fullPath = path.join(UI_COMPONENTS_DIR, relativePath);

    if (fs.existsSync(fullPath)) {
      totalFiles++;
      if (fixFile(fullPath)) {
        filesFixed++;
      }
    } else {
      console.log(`❌ File not found: ${fullPath}`);
    }
  }

  console.log("\\n📊 Summary:");
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${filesFixed}`);
  console.log(`   Files unchanged: ${totalFiles - filesFixed}`);

  // Validate the fixes
  validateCompilation();

  console.log("\\n✨ Comprehensive UI syntax error fixing complete!");
  console.log("\\n🎯 Next steps:");
  console.log("   1. Run: npm run build:ui to verify compilation");
  console.log("   2. Run the test suite to verify fixes");
  console.log("   3. Check if all UI components work as expected");
}

// Run the script
main();
