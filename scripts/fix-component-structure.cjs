#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

/**
 * Fix-Component-Structure Script
 * Fixes malformed React.forwardRef and component structures
 */

const problematicFiles = [
  "packages/ui/src/components/ui/card.tsx",
  "packages/ui/src/components/ui/dialog.tsx",
  "packages/ui/src/components/ui/dropdown-menu.tsx",
  "packages/ui/src/components/ui/form.tsx",
];

function fixComponentStructure(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Fix React.forwardRef missing function keyword
    // Pattern: >(parameters) => { should be >(function_body
    const forwardRefFixes = [
      // Fix card.tsx pattern: }>\n(\n  { becomes }>((\n  {
      {
        from: /}>\s*\(\s*\n\s*\{/g,
        to: "}>((\n  {",
      },
      // Fix closing patterns: }) => { becomes }), ref) => {
      {
        from: /}\s*,\s*ref\s*,?\s*\)\s*=>\s*\{/g,
        to: "}, ref) => {",
      },
    ];

    forwardRefFixes.forEach(({ from, to }) => {
      const before = content;
      content = content.replace(from, to);
      if (content !== before) {
        hasChanges = true;
      }
    });

    // Write back if there were changes
    if (hasChanges) {
      fs.writeFileSync(filePath, content, "utf8");
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log("🔧 Fixing React component structures...");

  let fixedFiles = 0;

  for (const file of problematicFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      if (fixComponentStructure(fullPath)) {
        console.log(`✅ Fixed: ${file}`);
        fixedFiles++;
      } else {
        console.log(`⚠️  No changes needed: ${file}`);
      }
    } else {
      console.log(`❌ File not found: ${file}`);
    }
  }

  console.log(`\n🎉 Fixed ${fixedFiles} component structures`);

  if (fixedFiles === 0) {
    console.log("\n🔍 Let me check the actual content...");

    // Let's manually fix the card.tsx file based on what we saw
    const cardPath = path.join(
      process.cwd(),
      "packages/ui/src/components/ui/card.tsx",
    );
    if (fs.existsSync(cardPath)) {
      let content = fs.readFileSync(cardPath, "utf8");

      // Manual fix for the specific pattern in card.tsx
      const originalPattern =
        />([\s\n]*\{[\s\S]*?\}[\s\n]*,[\s\n]*ref[\s\n]*,?[\s\n]*\))(?!\s*\))/;
      const replacement =
        '>(({\n  className, magic = false, disableShine = false, enableShineBorder, shineDuration = 8, shineColor = "#AC9469", borderWidth = 1, children, ...props\n}, ref) =>';

      if (originalPattern.test(content)) {
        content = content.replace(originalPattern, replacement);
        fs.writeFileSync(cardPath, content, "utf8");
        console.log("✅ Manually fixed card.tsx structure");
        fixedFiles++;
      }
    }
  }
}

if (require.main === module) {
  main();
}
