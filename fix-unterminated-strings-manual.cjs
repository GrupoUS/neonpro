#!/usr/bin/env node

const fs = require("fs");
// const path = require("path");

function fixUnterminatedStrings(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let fixedCount = 0;

  // Split into lines for line-by-line processing
  const lines = content.split("\n");
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let originalLine = line;

    // Pattern 1: Fix lines ending with incomplete strings like 'value_,  or 'value_
    line = line.replace(/('[^']*?)_\s*([,;)\]}]?)\s*$/g, "$1'$2");

    // Pattern 2: Fix lines with missing opening or closing quotes
    line = line.replace(/\|\s*'([^']*?)_([,;|\s]|$)/g, "| '$1'$2");

    // Pattern 3: Fix enum values missing closing quotes
    line = line.replace(/:\s*'([^']*?)_\s*([,;})\]])/g, ": '$1'$2");

    // Pattern 4: Fix array elements missing closing quotes
    line = line.replace(/'([^']*?)_\s*,/g, "'$1',");

    // Pattern 5: Fix specific patterns like ''value' (double quote start)
    line = line.replace(/''([^']+)''/g, "'$1'");

    // Pattern 6: Fix type union missing quotes
    line = line.replace(/\|\s*([a-zA-Z_]+)_\s*([,;|}])/g, "| '$1'$2");

    // Pattern 7: Fix export const with incomplete strings
    line = line.replace(
      /(export\s+const\s+\w+\s*=\s*)'([^']*?)_([,;\s]|$)/g,
      "$1'$2'$3",
    );

    if (line !== originalLine) {
      console.log(`Line ${i + 1}: "${originalLine.trim()}" → "${line.trim()}"`);
      fixedCount++;
    }

    fixedLines.push(line);
  }

  if (fixedCount > 0) {
    const newContent = fixedLines.join("\n");
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(
      `✅ Fixed ${fixedCount} unterminated strings in: ${filePath}\n`,
    );
  }

  return fixedCount;
}

// Process specific files that have errors
const filesToFix = [
  "./packages/types/src/ai-agent.ts",
  "./packages/types/src/api/contracts.ts",
];

let totalFixed = 0;

console.log("🔧 Fixing unterminated string literals...\n");

for (const filePath of filesToFix) {
  if (fs.existsSync(filePath)) {
    console.log(`📁 Processing: ${filePath}`);
    totalFixed += fixUnterminatedStrings(filePath);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
}

console.log(`\n📊 Total fixes applied: ${totalFixed}`);

if (totalFixed > 0) {
  console.log("✅ String repair completed! Try building again.");
} else {
  console.log(" ℹ️ No additional fixes needed.");
}
