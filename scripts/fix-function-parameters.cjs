#!/usr/bin/env node

/**
 * Fix function parameter syntax issues introduced by automated scripts
 * Targets specific patterns that were incorrectly modified
 */

const fs = require("fs");
const path = require("path");

// Count of fixes applied
let fixesApplied = 0;
let filesProcessed = 0;

/**
 * Fix common function parameter syntax issues
 */
function fixFunctionParameters(content, filePath) {
  let fixed = content;
  let localFixes = 0;

  // Fix: .map(_(param) => ...) -> .map((param) => ...)
  fixed = fixed.replace(/\.map\(_\((.*?)\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.map((${params}) =>`;
  });

  // Fix: .filter(_({ param }) => ...) -> .filter(({ param }) => ...)
  fixed = fixed.replace(/\.filter\(_\(({.*?})\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.filter((${params}) =>`;
  });

  // Fix: .sort(_(a,_b) => ...) -> .sort((a, b) => ...)
  fixed = fixed.replace(
    /\.sort\(_\((.*?),_(.*?)\)\s*=>/g,
    (match, param1, param2) => {
      localFixes++;
      return `.sort((${param1}, ${param2}) =>`;
    },
  );

  // Fix: describe(_"text",_() => { -> describe("text", () => {
  fixed = fixed.replace(/describe\(_"([^"]*)",_\(\)\s*=>/g, (match, text) => {
    localFixes++;
    return `describe("${text}", () =>`;
  });

  // Fix: it(_"text",_() => { -> it("text", () => {
  fixed = fixed.replace(/it\(_"([^"]*)",_\(\)\s*=>/g, (match, text) => {
    localFixes++;
    return `it("${text}", () =>`;
  });

  // Fix: new Set(_[...array] -> new Set([...array]
  fixed = fixed.replace(/new Set\(_\[/g, () => {
    localFixes++;
    return "new Set([";
  });

  // Fix: find(_(param) => -> find((param) =>
  fixed = fixed.replace(/\.find\(_\((.*?)\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.find((${params}) =>`;
  });

  // Fix: some(_(param) => -> some((param) =>
  fixed = fixed.replace(/\.some\(_\((.*?)\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.some((${params}) =>`;
  });

  // Fix: every(_(param) => -> every((param) =>
  fixed = fixed.replace(/\.every\(_\((.*?)\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.every((${params}) =>`;
  });

  // Fix: forEach(_(param,_index) => -> forEach((param, index) =>
  fixed = fixed.replace(
    /\.forEach\(_\((.*?),_(.*?)\)\s*=>/g,
    (match, param1, param2) => {
      localFixes++;
      return `.forEach((${param1}, ${param2}) =>`;
    },
  );

  // Fix: forEach(_(param) => -> forEach((param) =>
  fixed = fixed.replace(/\.forEach\(_\((.*?)\)\s*=>/g, (match, params) => {
    localFixes++;
    return `.forEach((${params}) =>`;
  });

  // Fix callback functions: callback(_(param) => -> callback((param) =>
  fixed = fixed.replace(
    /(\w+)\(_\((.*?)\)\s*=>/g,
    (match, funcName, params) => {
      // Skip if it's already a proper function name
      if (funcName.startsWith("_")) return match;
      localFixes++;
      return `${funcName}((${params}) =>`;
    },
  );

  if (localFixes > 0) {
    console.log(`Fixed ${localFixes} function parameter issues in ${filePath}`);
    fixesApplied += localFixes;
  }

  return fixed;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixed = fixFunctionParameters(content, filePath);

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, "utf8");
    }

    filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(
  dirPath,
  extensions = [".ts", ".tsx", ".js", ".jsx"],
) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!["node_modules", "dist", "build", ".git"].includes(item)) {
        processDirectory(fullPath, extensions);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (extensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

// Main execution
console.log("🔧 Fixing function parameter syntax issues...");

const packagesDir = path.join(__dirname, "..", "packages");
processDirectory(packagesDir);

const appsDir = path.join(__dirname, "..", "apps");
if (fs.existsSync(appsDir)) {
  processDirectory(appsDir);
}

console.log(`\n✅ Completed processing ${filesProcessed} files`);
console.log(`🔧 Applied ${fixesApplied} function parameter fixes`);

if (fixesApplied > 0) {
  console.log("\n🎯 Function parameter syntax has been repaired!");
  console.log("📝 Run build verification to check for remaining issues.");
} else {
  console.log("\n✨ No function parameter issues found!");
}
