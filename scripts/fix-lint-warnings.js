#!/usr/bin/env node

/**
 * Script to fix common lint warnings in the web package
 * Focuses on unused imports and variables that can be safely prefixed with underscore
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Common patterns to fix
const PATTERNS = [
  // Unused parameters - prefix with underscore
  {
    pattern:
      /(\w+): [^}]+is declared but never used\. Unused parameters should start with a '_'\./g,
    fix: (content, matches) => {
      matches.forEach((match) => {
        const paramName = match[1];
        // Only fix if it's clearly a parameter context
        const paramRegex = new RegExp(
          `\\b${paramName}\\b(?=\\s*[,)]|\\s*:)`,
          "g",
        );
        content = content.replace(paramRegex, `_${paramName}`);
      });
      return content;
    },
  },

  // Unused variables - prefix with underscore
  {
    pattern:
      /(\w+)' is declared but never used\. Unused variables should start with a '_'\./g,
    fix: (content, matches) => {
      matches.forEach((match) => {
        const varName = match[1];
        // Only fix if it's clearly a variable declaration
        const varRegex = new RegExp(`(const|let|var)\\s+${varName}\\b`, "g");
        content = content.replace(varRegex, `$1 _${varName}`);
      });
      return content;
    },
  },

  // Unused catch parameters
  {
    pattern: /Catch parameter '(\w+)' is caught but never used\./g,
    fix: (content, matches) => {
      matches.forEach((match) => {
        const paramName = match[1];
        const catchRegex = new RegExp(
          `catch\\s*\\(\\s*${paramName}\\s*\\)`,
          "g",
        );
        content = content.replace(catchRegex, `catch (_${paramName})`);
      });
      return content;
    },
  },

  // Remove unused imports completely
  {
    pattern: /Identifier '(\w+)' is imported but never used\./g,
    fix: (content, matches) => {
      matches.forEach((match) => {
        const importName = match[1];

        // Remove from named imports
        const namedImportRegex = new RegExp(
          `\\s*,?\\s*${importName}\\s*,?`,
          "g",
        );
        content = content.replace(namedImportRegex, (match) => {
          // Keep comma if it's between other imports
          if (match.includes(",")) {
            return match.replace(importName, "").replace(/,\s*,/, ",");
          }
          return "";
        });

        // Clean up empty import statements
        content = content.replace(
          /import\s*{\s*}\s*from\s*['""][^'"]*['""];?\s*/g,
          "",
        );
        content = content.replace(
          /import\s*{\s*,\s*([^}]+)\s*}/g,
          "import { $1 }",
        );
        content = content.replace(
          /import\s*{\s*([^}]+)\s*,\s*}/g,
          "import { $1 }",
        );
      });
      return content;
    },
  },
];

function extractLintWarnings(lintOutput) {
  const warnings = [];
  const lines = lintOutput.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes("is declared but never used") ||
      line.includes("is imported but never used") ||
      line.includes("is caught but never used")
    ) {
      warnings.push(line);
    }
  }

  return warnings;
}

function fixFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  patterns.forEach((pattern) => {
    const matches = [...content.matchAll(pattern.pattern)];
    if (matches.length > 0) {
      const newContent = pattern.fix(content, matches);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function findTsxFiles(dir) {
  const files = [];

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        walkDir(fullPath);
      } else if (
        stat.isFile() &&
        (item.endsWith(".tsx") || item.endsWith(".ts"))
      ) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

// Main execution
const webDir = path.join(__dirname, "../apps/web/src");
const files = findTsxFiles(webDir);

console.log(`Found ${files.length} TypeScript files to process...`);

let fixedCount = 0;
files.forEach((file) => {
  if (fixFile(file, PATTERNS)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with lint warnings.`);
