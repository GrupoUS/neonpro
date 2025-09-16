#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import analyzeCommand from './commands/analyze.js';
import auditCommand from './commands/audit.js';
import cleanupCommand from './commands/cleanup.js';
import reportCommand from './commands/report.js';
import scanCommand from './commands/scan.js';
import validateCommand from './commands/validate.js';

const program = new Command();

// CLI Configuration
program
  .name('audit-tool')
  .description('NeonPro Monorepo Architecture Audit and Optimization Tool')
  .version('1.0.0')
  .helpOption('-h, --help', 'Display help information');

// Global options
program
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Enable quiet mode (minimal output)')
  .option('--config <path>', 'Path to configuration file')
  .option('--dry-run', 'Run in dry-run mode (no changes)');

// Commands
program.addCommand(scanCommand);
program.addCommand(analyzeCommand);
program.addCommand(validateCommand);
program.addCommand(cleanupCommand);
program.addCommand(reportCommand);
program.addCommand(auditCommand); // Complete workflow command

// Error handling
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: cmd => cmd.name(),
});

// Custom help
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ audit-tool audit --format html --output report.html');
  console.log('  $ audit-tool scan --include "apps/**" --exclude "**/*.test.ts"');
  console.log('  $ audit-tool cleanup --dry-run --backup');
  console.log('  $ audit-tool validate --turborepo --hono --tanstack-router');
  console.log('');
  console.log('Documentation:');
  console.log('  https://github.com/neonpro/monorepo-audit-tool');
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
