#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix unterminated string literal patterns in TypeScript files
const patterns = [
  // Fix unterminated string literals - add missing closing quote
  {
    // Handles cases like 'client_data_ | (missing quote)
    pattern: /('client_data_)\s*\|/g,
    replacement: "'client_data' |"
  },
  {
    // Handle unterminated strings at end of lines
    pattern: /:\s*'([^'\n]*)$/gm,
    replacement: ": '$1';"
  },
  {
    // Handle unterminated strings in object properties
    pattern: /:\s*'([^'\n,}]*),/g,
    replacement: ": '$1',"
  },
  {
    // Handle unterminated strings in array/union types
    pattern: /\|\s*'([^'\n\|]*)\s*\|/g,
    replacement: "| '$1' |"
  },
  {
    // Handle export const with unterminated strings
    pattern: /export\s+const\s+\w+\s*=\s*'([^'\n]*);/g,
    replacement: (match, content) => {
      const [declaration, value] = match.split('=');
      return `${declaration.trim()} = '${content}';`;
    }
  },
  {
    // Fix malformed object property definitions
    pattern: /(\w+):\s*'([^'\n]*)\n/g,
    replacement: "$1: '$2',\n"
  },
  {
    // Fix export default with unterminated string
    pattern: /export\s+default\s+'([^'\n]*);/g,
    replacement: "export default '$1';"
  }
];

// Special patterns for specific problematic lines
const specificFixes = [
  {
    // Fix the QueryIntent type definition
    pattern: /export type QueryIntent = 'client_data_[^']*\|/g,
    replacement: "export type QueryIntent = 'client_data' |"
  },
  {
    // Fix incomplete union types
    pattern: /'client_data_\s*\|\s*'appointments'/g,
    replacement: "'client_data' | 'appointments'"
  },
  {
    // Fix status types with missing quotes
    pattern: /status:\s*'([^'\n]*)\n/g,
    replacement: "status: '$1';\n"
  },
  {
    // Fix the specific problematic lines from error output
    pattern: /'client_data_\s+\|/g,
    replacement: "'client_data' |"
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = 0;
    
    // Apply specific fixes first
    for (const { pattern, replacement } of specificFixes) {
      const before = content;
      content = content.replace(pattern, replacement);
      const matches = (before.match(pattern) || []).length;
      fixed += matches;
    }
    
    // Apply general patterns
    for (const { pattern, replacement } of patterns) {
      const before = content;
      content = content.replace(pattern, replacement);
      const matches = (before.match(pattern) || []).length;
      fixed += matches;
    }
    
    // Special handling for complex string literal repairs
    content = content
      // Fix any remaining single quotes that are clearly incomplete
      .replace(/:\s*'([^'\n{}\[\]]+)(\s*[,;}])/g, ": '$1'$2")
      // Fix array/union type incomplete strings
      .replace(/\[\s*'([^'\n\]]+)(\s*\])/g, "['$1'$2")
      // Fix incomplete strings at end of exports
      .replace(/export\s+(const|type|interface)\s+\w+[^=]*=\s*'([^'\n]*);/g, (match, keyword, value) => {
        if (!value.endsWith("'")) {
          return match.replace(value, value + "'");
        }
        return match;
      });

    if (fixed > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fixed} string literals in: ${filePath}`);
    }
    
    return fixed;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let totalFixed = 0;
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory ${dirPath} does not exist, skipping...`);
    return totalFixed;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
        totalFixed += processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.ts', '.tsx'].includes(ext)) {
        totalFixed += fixFile(fullPath);
      }
    }
  }
  
  return totalFixed;
}

console.log('🔧 Starting string literal repair for types package...\n');

const typesDir = './packages/types/src';
const totalFixed = processDirectory(typesDir);

console.log('\n📊 String Literal Repair Summary:');
console.log(`   Total fixes applied: ${totalFixed}`);

if (totalFixed > 0) {
  console.log('\n✅ String literal repair completed!');
  console.log('   Re-running types build...');
} else {
  console.log('\n ℹ️ No string literal errors found.');
}