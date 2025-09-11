import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { ArchitectureValidator } from '../../services/ArchitectureValidator.js';
import { FileScanner } from '../../services/FileScanner.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const validateCommand = new Command('validate')
  .description('Validate architecture and coding standards')
  .argument('[path]', 'Path to validate', process.cwd())
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <type>', 'Output format (json|text|html)', 'text')
  .option(
    '--docs <paths>',
    'Architecture documents (comma-separated)',
    'docs/architecture/**/*.md',
  )
  .option('--turborepo', 'Validate Turborepo standards')
  .option('--hono', 'Validate Hono patterns')
  .option('--tanstack-router', 'Validate TanStack Router patterns')
  .option(
    '--severity <levels>',
    'Include severity levels (error,warning,info)',
    'error,warning,info',
  )
  .option('--auto-fix', 'Apply automatic fixes where possible')
  .option('--include <patterns>', 'Include patterns', 'apps/**,packages/**')
  .option('--exclude <patterns>', 'Exclude patterns', '**/*.test.ts,**/node_modules/**')
  .action(async (path: string, options: any) => {
    const spinner = ora('Validating architecture...').start();

    try {
      // Scan files first
      spinner.text = 'Scanning files...';
      const scanner = new FileScanner();
      const includePatterns = options.include.split(',').map((p: string) => p.trim());
      const excludePatterns = options.exclude.split(',').map((p: string) => p.trim());

      const scanResult = await scanner.scan(path, {
        includePatterns,
        excludePatterns,
        followSymlinks: false,
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 50000,
        scanContent: true,
        extractMetadata: true,
      });

      // Validate architecture
      spinner.text = 'Validating architecture...';
      const validator = new ArchitectureValidator();

      const documentPaths = options.docs.split(',').map((p: string) => p.trim());
      const severityLevels = options.severity.split(',').map((s: string) => s.trim());

      const validationOptions = {
        documentPaths,
        validateTurborepoStandards: options.turborepo || false,
        validateHonoPatterns: options.hono || false,
        validateTanStackRouterPatterns: options.tanstackRouter || false,
        includeSeverities: severityLevels,
        suggestAutoFixes: options.autoFix || false,
      };

      const result = await validator.validateAssets(scanResult.assets, validationOptions);

      spinner.succeed('Architecture validation completed');

      // Display summary
      console.log(chalk.blue('\nArchitecture Validation Summary:'));
      console.log(
        `  Overall status: ${getStatusColor(result.overallStatus)} ${result.overallStatus}`,
      );
      console.log(
        `  Compliance score: ${
          getScoreColor(
            result.complianceSummary.complianceScore,
          )
        }${result.complianceSummary.complianceScore}%`,
      );
      console.log(`  Assets validated: ${chalk.green(result.metrics.totalAssetsValidated)}`);
      console.log(`  Total violations: ${chalk.red(result.violations.length)}`);

      // Breakdown by severity
      const errorCount = result.violations.filter((v: any) => v.severity === 'error').length;
      const warningCount = result.violations.filter((v: any) => v.severity === 'warning').length;
      const infoCount = result.violations.filter((v: any) => v.severity === 'info').length;

      if (errorCount > 0) {
        console.log(`  Errors: ${chalk.red(errorCount)}`);
      }
      if (warningCount > 0) {
        console.log(`  Warnings: ${chalk.yellow(warningCount)}`);
      }
      if (infoCount > 0) {
        console.log(`  Info: ${chalk.blue(infoCount)}`);
      }

      // Show violations
      if (result.violations.length > 0) {
        console.log(chalk.blue('\nTop Violations:'));

        const violationsByCategory = groupBy(result.violations, 'category');
        const topCategories = Object.entries(violationsByCategory)
          .sort(([, a], [, b]) => (b as any).length - (a as any).length)
          .slice(0, 5);

        topCategories.forEach(([category, violations]) => {
          console
            .log(`  ${chalk.cyan(category)}: ${(violations as any).length} issues`)(
              // Show a few examples
              violations as any,
            )
            .slice(0, 3)
            .forEach((violation: any) => {
              const severityColor = violation.severity === 'error'
                ? chalk.red
                : violation.severity === 'warning'
                ? chalk.yellow
                : chalk.blue;
              console.log(
                `    ${severityColor('•')} ${violation.ruleName}: ${violation.description}`,
              );
              console.log(
                `      ${chalk.gray(`File: ${violation.filePath}:${violation.location.line}`)}`,
              );
            });

          if ((violations as any).length > 3) {
            console.log(`    ${chalk.gray(`... and ${(violations as any).length - 3} more`)}`);
          }
          console.log('');
        });
      }

      // Show recommendations
      if (result.recommendations.length > 0) {
        console.log(chalk.blue('Recommendations:'));
        result.recommendations.forEach((rec: any, i: number) => {
          const priorityColor = rec.priority === 'high'
            ? chalk.red
            : rec.priority === 'medium'
            ? chalk.yellow
            : chalk.green;
          console.log(`  ${i + 1}. ${rec.description} (${priorityColor(rec.priority)} priority)`);
        });
        console.log('');
      }

      // Auto-fix results
      if (options.autoFix && result.violations.some((v: any) => v.suggestedFix)) {
        spinner.start('Applying automatic fixes...');

        try {
          const fixableViolations = result.violations.filter((v: any) => v.suggestedFix);
          const fixResults = await validator.applyAutoFixes(fixableViolations, {
            enableAutoFix: true,
            dryRun: false,
          });

          const successfulFixes = fixResults.filter(r => r.applied).length;
          const failedFixes = fixResults.filter(r => !r.applied && r.error).length;

          if (failedFixes > 0) {
            spinner.warn(
              `Applied ${successfulFixes}/${fixResults.length} automatic fixes (${failedFixes} failed)`,
            );

            // Show failed fixes
            const failedFixResults = fixResults.filter(r => !r.applied && r.error);
            if (failedFixResults.length > 0) {
              console.log(chalk.yellow(`\n⚠️  Failed to apply ${failedFixes} fixes:`));
              failedFixResults.slice(0, 3).forEach(fix => {
                console.log(`  ✗ ${fix.description} in ${fix.filePath}`);
                console.log(`    ${chalk.gray(`Error: ${fix.error}`)}`);
              });

              if (failedFixResults.length > 3) {
                console.log(`  ... and ${failedFixResults.length - 3} more failed fixes`);
              }
            }
          } else {
            spinner.succeed(`Applied ${successfulFixes}/${fixResults.length} automatic fixes`);
          }

          if (successfulFixes > 0) {
            console.log(chalk.green(`\n✨ Fixed ${successfulFixes} issues automatically`));

            // Show what was fixed
            fixResults
              .filter(r => r.applied)
              .slice(0, 5)
              .forEach(fix => {
                console.log(`  ✓ ${fix.description} in ${fix.filePath}`);
              });

            if (successfulFixes > 5) {
              console.log(`  ... and ${successfulFixes - 5} more fixes`);
            }
          }
        } catch (error) {
          spinner.fail('Auto-fix operation failed');
          console.error(
            chalk.red(
              `❌ Auto-fix error: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
          console.log(
            chalk.yellow('⚠️  Continuing with validation results (auto-fix disabled)...'),
          );
        }
      }

      // Generate compliance report if requested
      if (options.output) {
        spinner.start('Generating report...');

        let outputData: string;

        switch (options.format) {
          case 'json':
            outputData = JSON.stringify(result, null, 2);
            break;
          case 'html':
            outputData = await validator.generateComplianceReport(result);
            outputData = wrapInHtml(outputData);
            break;
          default: // text
            outputData = await validator.generateComplianceReport(result);
        }

        const fs = await import('fs/promises');
        await fs.writeFile(options.output, outputData, 'utf-8');
        spinner.succeed(`Report saved to: ${options.output}`);
      }

      // Exit with appropriate code
      if (errorCount > 0) {
        process.exit(1);
      } else if (warningCount > 0) {
        process.exit(0); // Warnings don't cause failure
      }
    } catch (error) {
      spinner.fail('Architecture validation failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function getStatusColor(status: string): chalk.Chalk {
  switch (status) {
    case 'passed':
      return chalk.green;
    case 'failed':
      return chalk.red;
    case 'warning':
      return chalk.yellow;
    default:
      return chalk.gray;
  }
}

function getScoreColor(score: number): chalk.Chalk {
  if (score >= 80) {
    return chalk.green;
  }
  if (score >= 60) {
    return chalk.yellow;
  }
  return chalk.red;
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups: Record<string, T[]>, item: T) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

function wrapInHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Architecture Validation Report</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #374151; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .violation { margin: 10px 0; padding: 10px; border-left: 3px solid #e5e7eb; }
        .error { border-left-color: #ef4444; background: #fef2f2; }
        .warning { border-left-color: #f59e0b; background: #fffbeb; }
        .info { border-left-color: #3b82f6; background: #eff6ff; }
    </style>
</head>
<body>
    <h1>Architecture Validation Report</h1>
    <div id="content">
${
    content
      .split('\n')
      .map(line => `        <p>${escapeHtml(line)}</p>`)
      .join('\n')
  }
    </div>
</body>
</html>`;
}
