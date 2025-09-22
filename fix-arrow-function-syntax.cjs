#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to fix
const patterns = [
  // Fix double arrow patterns: ) => => {
  {
    pattern: /\)\s*=>\s*=>\s*\{/g,
    replacement: ') => {'
  },
  
  // Fix arrow function with Promise constructor issue: (() => => {
  {
    pattern: /\(\(\)\s*=>\s*=>\s*\{/g,
    replacement: '(() => {'
  },
  
  // Fix malformed setState/useState patterns: () => => {
  {
    pattern: /\(\)\s*=>\s*=>\s*\{/g,
    replacement: '() => {'
  },
  
  // Fix useEffect/useMemo/useCallback patterns: }) => => {
  {
    pattern: /\}\)\s*=>\s*=>\s*\{/g,
    replacement: '}) => {'
  },
  
  // Fix event handler patterns: (e) => => {
  {
    pattern: /\([^)]*\)\s*=>\s*=>\s*\{/g,
    replacement: (match) => match.replace(/=>\s*=>/g, '=>')
  },
  
  // Fix async arrow function patterns: async () => => {
  {
    pattern: /async\s*\([^)]*\)\s*=>\s*=>\s*\{/g,
    replacement: (match) => match.replace(/=>\s*=>/g, '=>')
  },
  
  // Fix malformed Promise patterns: new Promise((resolve, reject) => => {
  {
    pattern: /new\s+Promise\s*\(\s*\([^)]*\)\s*=>\s*=>\s*\{/g,
    replacement: (match) => match.replace(/=>\s*=>/g, '=>')
  },
  
  // Fix generic arrow function with double arrow
  {
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^=]*)\s*=>\s*=>\s*\{/g,
    replacement: '$1 => {'
  },
  
  // Fix map/filter/reduce patterns: .map(() => => {
  {
    pattern: /\.(map|filter|reduce|forEach|find|some|every)\s*\(\s*\([^)]*\)\s*=>\s*=>\s*\{/g,
    replacement: (match, method) => match.replace(/=>\s*=>/g, '=>')
  },
  
  // Fix React.useEffect patterns
  {
    pattern: /React\.useEffect\s*\(\s*\(\)\s*=>\s*=>\s*\{/g,
    replacement: 'React.useEffect(() => {'
  },
  
  // Fix setTimeout/setInterval patterns
  {
    pattern: /(setTimeout|setInterval)\s*\(\s*\(\)\s*=>\s*=>\s*\{/g,
    replacement: '$1(() => {'
  }
];

// Directories to process
const dirsToProcess = [
  './apps/web/src',
  './packages/ui/src',
  './packages/utils/src',
  './packages/domain/src'
];

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalFilesProcessed = 0;
let totalErrorsFixed = 0;

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let fileErrorsFixed = 0;
    
    // Apply all patterns
    for (const { pattern, replacement } of patterns) {
      const before = modifiedContent;
      modifiedContent = modifiedContent.replace(pattern, replacement);
      const matches = (before.match(pattern) || []).length;
      fileErrorsFixed += matches;
    }
    
    // Only write if content changed
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Fixed ${fileErrorsFixed} arrow function errors in: ${filePath}`);
      totalErrorsFixed += fileErrorsFixed;
    }
    
    totalFilesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory ${dirPath} does not exist, skipping...`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!item.startsWith('.') && item !== 'node_modules') {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (fileExtensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

console.log('🔧 Starting arrow function syntax repair...\n');

// Process all directories
for (const dir of dirsToProcess) {
  console.log(`📁 Processing directory: ${dir}`);
  processDirectory(dir);
}

console.log('\n📊 Arrow Function Syntax Repair Summary:');
console.log(`   Files processed: ${totalFilesProcessed}`);
console.log(`   Total errors fixed: ${totalErrorsFixed}`);

if (totalErrorsFixed > 0) {
  console.log('\n✅ Arrow function syntax repair completed successfully!');
  console.log('   Please run your build again to verify the fixes.');
} else {
  console.log('\n ℹ️ No arrow function syntax errors found.');
}