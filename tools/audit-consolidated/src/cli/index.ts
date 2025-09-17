#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { createLogger, LogLevel } from '@neonpro/tools-shared';
import analyzeCommand from './commands/analyze.js';
import auditCommand from './commands/audit.js';
import cleanupCommand from './commands/cleanup.js';
import reportCommand from './commands/report.js';
import scanCommand from './commands/scan.js';
import validateCommand from './commands/validate.js';
import constitutionalCommand from './commands/constitutional.js';
import benchmarkCommand from './commands/benchmark.js';
import quickCommand from './commands/quick.js';

// Initialize logger
const logger = createLogger('AuditTool', {
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  format: 'pretty',
  enableConstitutional: true,
  enablePerformance: true,
});

const program = new Command();

// CLI Configuration
program
  .name('neonpro-audit')
  .description('🏥 NeonPro Unified Audit Tool - Constitutional TDD Compliance & Monorepo Optimization')
  .version('2.0.0')
  .helpOption('-h, --help', 'Display help information');

// Global options with enhanced constitutional compliance
program
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Enable quiet mode (minimal output)')
  .option('--config <path>', 'Path to configuration file')
  .option('--dry-run', 'Run in dry-run mode (no changes)')
  .option('--healthcare', 'Enable healthcare compliance mode (LGPD/ANVISA/CFM)')
  .option('--constitutional', 'Enable constitutional TDD compliance tracking')
  .option('--performance', 'Enable performance benchmarking')
  .option('--format <format>', 'Output format (json|html|markdown|dashboard)', 'json');

// Commands - Enhanced with constitutional compliance
program.addCommand(scanCommand);
program.addCommand(analyzeCommand);
program.addCommand(validateCommand);
program.addCommand(cleanupCommand);
program.addCommand(reportCommand);
program.addCommand(auditCommand); // Complete workflow command
program.addCommand(constitutionalCommand); // Constitutional TDD compliance
program.addCommand(benchmarkCommand); // Performance benchmarking
program.addCommand(quickCommand); // Quick analysis

// Error handling
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: cmd => cmd.name(),
});

// Custom help with constitutional compliance examples
program.on('--help', () => {
  console.log('');
  console.log('🚀 Examples:');
  console.log('  $ neonpro-audit audit --format html --output report.html --healthcare');
  console.log('  $ neonpro-audit constitutional --lgpd --anvisa --cfm');
  console.log('  $ neonpro-audit scan --include "apps/**" --exclude "**/*.test.ts"');
  console.log('  $ neonpro-audit cleanup --dry-run --backup --constitutional');
  console.log('  $ neonpro-audit benchmark --performance --verbose');
  console.log('  $ neonpro-audit quick --healthcare --format dashboard');
  console.log('');
  console.log('🏥 Healthcare Compliance:');
  console.log('  $ neonpro-audit validate --lgpd --anvisa --cfm --output compliance-report.json');
  console.log('  $ neonpro-audit constitutional --audit-trail --patient-data --requirements');
  console.log('');
  console.log('📊 Performance & Quality:');
  console.log('  $ neonpro-audit benchmark --memory --cpu --throughput');
  console.log('  $ neonpro-audit analyze --architecture --dependencies --performance');
  console.log('');
  console.log('📚 Documentation:');
  console.log('  https://github.com/neonpro/neonpro/tree/main/tools/audit-consolidated');
});

// Handle unknown commands
program.on('command:*', operands => {
  console.error(chalk.red(`Unknown command: ${operands[0]}`));
  console.log('Use --help to see available commands');
  process.exit(1);
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Parse and execute
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export default program;
