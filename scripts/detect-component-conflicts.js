#!/usr/bin/env node

/**
 * Component Conflict Detection Script
 * 
 * Detects duplicate components, import conflicts, and architecture violations
 * in the NeonPro monorepo component structure.
 * 
 * Usage: node scripts/detect-component-conflicts.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  componentsDir: 'apps/web/src/components',
  packagesDir: 'packages/ui/src/components',
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.tsx',
    '**/*.spec.tsx',
    '**/*.d.ts'
  ],
  componentExtensions: ['.tsx', '.ts'],
  prohibitedImports: [
    '@/components/ui/button',
    '@/components/ui/badge', 
    '@/components/ui/alert'
  ]
};

// Results storage
const results = {
  duplicateComponents: [],
  importConflicts: [],
  architectureViolations: [],
  prohibitedImports: [],
  summary: {
    totalComponents: 0,
    totalIssues: 0,
    criticalIssues: 0,
    warningIssues: 0
  }
};

/**
 * Get all component files in the project
 */
function getComponentFiles() {
  const patterns = [
    `${CONFIG.componentsDir}/**/*{${CONFIG.componentExtensions.join(',')}}`,
    `${CONFIG.packagesDir}/**/*{${CONFIG.componentExtensions.join(',')}}`,
  ];
  
  let files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { 
      ignore: CONFIG.excludePatterns,
      absolute: true 
    });
    files = files.concat(matches);
  });
  
  return files;
}

/**
 * Extract component name from file path
 */
function getComponentName(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  // Convert kebab-case to PascalCase
  return basename.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Parse file content to extract exports and imports
 */
function parseFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract exports
    const exportMatches = content.match(/export\s+(?:const|function|class|interface|type)?\s*\{?([^}]+)\}?/g) || [];
    const exports = exportMatches.flatMap(match => {
      const exportContent = match.replace(/export\s+(?:const|function|class|interface|type)?\s*\{?/, '').replace(/\}.*$/, '');
      return exportContent.split(',').map(exp => exp.trim().split(/\s+/)[0]);
    });
    
    // Extract imports
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    const imports = importMatches.map(match => {
      const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
      const importedItems = match.match(/import\s+\{?([^}]+)\}?/)?.[1]?.split(',').map(item => item.trim()) || [];
      return { path: importPath, items: importedItems };
    });
    
    return { exports, imports, content };
  } catch (error) {
    console.warn(`Warning: Could not parse file ${filePath}: ${error.message}`);
    return { exports: [], imports: [], content: '' };
  }
}

/**
 * Detect duplicate components
 */
function detectDuplicateComponents(files) {
  const componentMap = new Map();
  
  files.forEach(filePath => {
    const componentName = getComponentName(filePath);
    const { exports } = parseFileContent(filePath);
    
    // Skip index files and non-component files
    if (path.basename(filePath) === 'index.ts' || path.basename(filePath) === 'index.tsx') {
      return;
    }
    
    // Check if this component exports a component with the same name
    if (exports.includes(componentName) || exports.includes('default')) {
      if (!componentMap.has(componentName)) {
        componentMap.set(componentName, []);
      }
      componentMap.get(componentName).push(filePath);
    }
  });
  
  // Find duplicates
  componentMap.forEach((paths, componentName) => {
    if (paths.length > 1) {
      results.duplicateComponents.push({
        componentName,
        paths,
        severity: 'critical',
        message: `Component "${componentName}" is defined in multiple files`
      });
    }
  });
}

/**
 * Detect prohibited imports
 */
function detectProhibitedImports(files) {
  files.forEach(filePath => {
    const { imports } = parseFileContent(filePath);
    
    imports.forEach(({ path: importPath, items }) => {
      if (CONFIG.prohibitedImports.includes(importPath)) {
        results.prohibitedImports.push({
          filePath,
          importPath,
          items,
          severity: 'critical',
          message: `Prohibited import "${importPath}" found. This component has been removed.`
        });
      }
    });
  });
}

/**
 * Detect architecture violations
 */
function detectArchitectureViolations(files) {
  files.forEach(filePath => {
    const { imports } = parseFileContent(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check atomic design violations
    if (relativePath.includes('/atoms/')) {
      imports.forEach(({ path: importPath }) => {
        if (importPath.includes('/molecules/') || importPath.includes('/organisms/')) {
          results.architectureViolations.push({
            filePath,
            importPath,
            severity: 'warning',
            message: `Atom component importing from higher-level component (${importPath})`
          });
        }
      });
    }
    
    if (relativePath.includes('/molecules/')) {
      imports.forEach(({ path: importPath }) => {
        if (importPath.includes('/organisms/')) {
          results.architectureViolations.push({
            filePath,
            importPath,
            severity: 'warning',
            message: `Molecule component importing from organism (${importPath})`
          });
        }
      });
    }
  });
}

/**
 * Generate summary statistics
 */
function generateSummary() {
  results.summary.totalComponents = results.duplicateComponents.length + 
    results.importConflicts.length + 
    results.architectureViolations.length + 
    results.prohibitedImports.length;
  
  const allIssues = [
    ...results.duplicateComponents,
    ...results.importConflicts,
    ...results.architectureViolations,
    ...results.prohibitedImports
  ];
  
  results.summary.totalIssues = allIssues.length;
  results.summary.criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length;
  results.summary.warningIssues = allIssues.filter(issue => issue.severity === 'warning').length;
}

/**
 * Format and display results
 */
function displayResults() {
  console.log('\n🔍 NeonPro Component Conflict Detection Results\n');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Total Issues: ${results.summary.totalIssues}`);
  console.log(`   Critical: ${results.summary.criticalIssues}`);
  console.log(`   Warnings: ${results.summary.warningIssues}`);
  
  // Duplicate Components
  if (results.duplicateComponents.length > 0) {
    console.log(`\n🔴 Duplicate Components (${results.duplicateComponents.length}):`);
    results.duplicateComponents.forEach(issue => {
      console.log(`   ❌ ${issue.componentName}`);
      issue.paths.forEach(path => {
        console.log(`      - ${path.replace(process.cwd(), '.')}`);
      });
    });
  }
  
  // Prohibited Imports
  if (results.prohibitedImports.length > 0) {
    console.log(`\n🔴 Prohibited Imports (${results.prohibitedImports.length}):`);
    results.prohibitedImports.forEach(issue => {
      console.log(`   ❌ ${issue.importPath}`);
      console.log(`      File: ${issue.filePath.replace(process.cwd(), '.')}`);
      console.log(`      Items: ${issue.items.join(', ')}`);
    });
  }
  
  // Architecture Violations
  if (results.architectureViolations.length > 0) {
    console.log(`\n🟡 Architecture Violations (${results.architectureViolations.length}):`);
    results.architectureViolations.forEach(issue => {
      console.log(`   ⚠️  ${issue.message}`);
      console.log(`      File: ${issue.filePath.replace(process.cwd(), '.')}`);
    });
  }
  
  // Success message
  if (results.summary.totalIssues === 0) {
    console.log('\n✅ No component conflicts detected! Architecture is clean.');
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Main execution function
 */
function main() {
  console.log('🔍 Starting component conflict detection...\n');
  
  try {
    // Get all component files
    const files = getComponentFiles();
    console.log(`Found ${files.length} component files to analyze`);
    
    // Run detection algorithms
    console.log('Detecting duplicate components...');
    detectDuplicateComponents(files);
    
    console.log('Detecting prohibited imports...');
    detectProhibitedImports(files);
    
    console.log('Detecting architecture violations...');
    detectArchitectureViolations(files);
    
    // Generate summary and display results
    generateSummary();
    displayResults();
    
    // Exit with appropriate code
    const exitCode = results.summary.criticalIssues > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Error during component conflict detection:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  detectDuplicateComponents,
  detectProhibitedImports,
  detectArchitectureViolations,
  getComponentFiles,
  parseFileContent
};
