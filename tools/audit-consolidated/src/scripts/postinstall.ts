#!/usr/bin/env node

import chalk from 'chalk';

/**
 * Post-installation script for Monorepo Audit Tool
 * Displays welcome message and setup instructions
 */

console.log('');
console.log(chalk.green('🚀 NeonPro Monorepo Audit Tool installed successfully!'));
console.log('');
console.log(chalk.cyan('Quick Start:'));
console.log(`  ${chalk.white('audit-tool --help')}          # Show all available commands`);
console.log(`  ${chalk.white('audit-tool audit --dry-run')}  # Run complete audit (dry-run)`);
console.log(`  ${chalk.white('audit-tool scan')}             # Scan workspace for files`);
console.log('');
console.log(chalk.cyan('Common Workflows:'));
console.log(`  ${chalk.white('audit-tool audit')}            # Complete audit workflow`);
console.log(`  ${chalk.white('audit-tool cleanup plan')}     # Create cleanup plan`);
console.log(`  ${chalk.white('audit-tool validate --strict')} # Strict architecture validation`);
console.log('');
console.log(chalk.cyan('Documentation:'));
console.log(`  ${chalk.white('README.md')}           # Project overview and quick start`);
console.log(`  ${chalk.white('docs/USER_GUIDE.md')}  # Comprehensive user guide`);
console.log(`  ${chalk.white('docs/API_REFERENCE.md')} # API documentation`);
console.log('');
console.log(chalk.yellow('💡 Tip: Run in dry-run mode first to see what the tool will do:'));
console.log(`   ${chalk.white('audit-tool audit --dry-run --verbose')}`);
console.log('');

// Check for common monorepo indicators
const fs = await import('fs');
const path = await import('path');

const indicators = ['turbo.json', 'lerna.json', 'rush.json', 'package.json'];

const foundIndicators: string[] = [];
const cwd = process.cwd();

for (const indicator of indicators) {
  try {
    const indicatorPath = path.join(cwd, indicator);
    await fs.promises.access(indicatorPath, fs.constants.F_OK);
    foundIndicators.push(indicator);
  } catch {
    // Indicator not found
  }
}

if (foundIndicators.length > 0) {
  console.log(chalk.green('✅ Detected monorepo configuration:'));
  foundIndicators.forEach(indicator => {
    console.log(`   ${chalk.white(indicator)}`);
  });
  console.log('');
} else {
  console.log(chalk.yellow('⚠️  No monorepo configuration detected.'));
  console.log('   This tool works best in Turborepo/Lerna/Rush monorepos.');
  console.log('');
}

console.log(
  chalk.gray('For issues and support: https://github.com/neonpro/monorepo-audit-tool/issues'),
);
console.log('');
