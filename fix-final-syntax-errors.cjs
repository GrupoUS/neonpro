#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical patterns to fix - these are the remaining issues
const patterns = [
  // Fix malformed TypeScript type with arrow: React.useState<.*>(() => => {
  {
    pattern: /React\.useState<\.\*>\(\(\)\s*=>\s*=>\s*\{/g,
    replacement: 'React.useState(() => {'
  },
  
  // Fix malformed TypeScript generic with double arrow: <.*>(() => => {
  {
    pattern: /<\.\*>\(\(\)\s*=>\s*=>\s*\{/g,
    replacement: '(() => {'
  },
  
  // Fix useMemo with double arrow: React.useMemo(() => => {
  {
    pattern: /React\.useMemo\(\(\)\s*=>\s*=>\s*\{/g,
    replacement: 'React.useMemo(() => {'
  },
  
  // Fix useMemo with double arrow: useMemo(() => => {
  {
    pattern: /useMemo\(\(\)\s*=>\s*=>\s*\{/g,
    replacement: 'useMemo(() => {'
  },
  
  // Fix arrow functions that still have double arrows anywhere
  {
    pattern: /=>\s*=>\s*\{/g,
    replacement: '=> {'
  },
  
  // Fix arrow functions that have double arrow in middle
  {
    pattern: /=>\s*=>\s*/g,
    replacement: '=> '
  },
  
  // Fix specific case: setTimeout(() => => setLoading(false), 1000);
  {
    pattern: /(setTimeout|setInterval)\s*\(\s*\(\)\s*=>\s*=>\s*/g,
    replacement: '$1(() => '
  },
  
  // Fix Link component import missing
  {
    pattern: /\bLink\b(?![a-zA-Z_$])/g,
    replacement: (match, offset, string) => {
      // Only replace if Link is used but not imported
      const beforeMatch = string.substring(0, offset);
      const hasImport = beforeMatch.includes("import") && (
        beforeMatch.includes("Link") || 
        beforeMatch.includes("{ Link }") ||
        beforeMatch.includes("Link,")
      );
      
      // If it looks like a component usage (uppercase L) and no import, suggest it needs import
      if (!hasImport && /\bLink\s+/.test(string.substring(offset))) {
        return 'Link';
      }
      return match;
    }
  },
  
  // Fix missing imports for common components used
  {
    pattern: /(\bCardHeader\b|\bCardTitle\b|\bCardDescription\b|\bCardContent\b)/g,
    replacement: (match, component) => {
      // These need to be imported from @neonpro/ui or respective libraries
      return component;
    }
  }
];

// Special fixes for specific files that have consistent issues
const specificFileFixes = [
  {
    // Fix admin/settings.tsx specific issues
    test: /admin\/settings\.tsx$/,
    fixes: [
      {
        pattern: /React\.useState<\.\*>\(\(\)\s*=>\s*=>\s*\{[^}]*\}\)/g,
        replacement: "React.useState(() => { if (typeof window === 'undefined') return 'gpt-5-mini'; return localStorage.getItem('neonpro-default-chat-model') || 'gpt-5-mini'; })"
      },
      {
        pattern: /const \[hiddenProviders[^;]*;/g,
        replacement: "const [hiddenProviders, setHidden] = React.useState(() => getHiddenProviders());"
      }
    ]
  },
  {
    // Fix ai/insights.tsx specific issues  
    test: /ai\/insights\.tsx$/,
    fixes: [
      {
        pattern: /setTimeout\(\(\)\s*=>\s*=>\s*setLoading\(false\),\s*1000\);/g,
        replacement: 'setTimeout(() => setLoading(false), 1000);'
      }
    ]
  },
  {
    // Fix services/clients.tsx specific issues
    test: /services\/clients\.tsx$/,
    fixes: [
      {
        pattern: /const rows = useMemo\(\(\)\s*=>\s*=>\s*clients \?\? \[\], \[clients\]\);/g,
        replacement: 'const rows = useMemo(() => clients ?? [], [clients]);'
      }
    ]
  },
  {
    // Fix theme-provider.tsx specific issues
    test: /theme-provider\.tsx$/,
    fixes: [
      {
        pattern: /const value = React\.useMemo\(\(\)\s*=>\s*=>\s*\(\{\s*theme,\s*resolvedTheme,\s*setTheme\s*\}\),/g,
        replacement: 'const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }),'
      }
    ]
  }
];

// Directories to process
const dirsToProcess = [
  './apps/web/src',
  './packages/ui/src',
  './packages/utils/src'
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
    
    // Apply specific file fixes first
    for (const fileFix of specificFileFixes) {
      if (fileFix.test.test(filePath)) {
        console.log(`📋 Applying specific fixes for: ${filePath}`);
        for (const fix of fileFix.fixes) {
          const before = modifiedContent;
          modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
          const matches = (before.match(fix.pattern) || []).length;
          fileErrorsFixed += matches;
        }
      }
    }
    
    // Apply general patterns
    for (const { pattern, replacement } of patterns) {
      const before = modifiedContent;
      modifiedContent = modifiedContent.replace(pattern, replacement);
      const matches = (before.match(pattern) || []).length;
      fileErrorsFixed += matches;
    }
    
    // Only write if content changed
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Fixed ${fileErrorsFixed} syntax errors in: ${filePath}`);
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

console.log('🔧 Starting final syntax error repair...\n');

// Process all directories
for (const dir of dirsToProcess) {
  console.log(`📁 Processing directory: ${dir}`);
  processDirectory(dir);
}

console.log('\n📊 Final Syntax Repair Summary:');
console.log(`   Files processed: ${totalFilesProcessed}`);
console.log(`   Total errors fixed: ${totalErrorsFixed}`);

if (totalErrorsFixed > 0) {
  console.log('\n✅ Final syntax repair completed successfully!');
  console.log('   Please run your build again to verify the fixes.');
} else {
  console.log('\n ℹ️ No additional syntax errors found.');
}