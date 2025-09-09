import chalk from 'chalk'
import { Command, } from 'commander'
import ora from 'ora'
import type { Ora, } from 'ora'
import { ArchitectureValidator, } from '../../services/ArchitectureValidator.js'
import { CleanupEngine, } from '../../services/CleanupEngine.js'
import { DependencyAnalyzer, } from '../../services/DependencyAnalyzer.js'
import { FileScanner, } from '../../services/FileScanner.js'
import { ReportGenerator, } from '../../services/ReportGenerator.js'

export const auditCommand = new Command('audit',)
  .description('Run complete monorepo audit workflow',)
  .argument('[path]', 'Path to audit', process.cwd(),)
  .option('-o, --output <file>', 'Output report path', 'audit-report.html',)
  .option('-f, --format <type>', 'Report format (html|json|markdown)', 'html',)
  .option('--include <patterns>', 'Include patterns', 'apps/**,packages/**',)
  .option('--exclude <patterns>', 'Exclude patterns', '**/*.test.ts,**/node_modules/**,**/.git/**',)
  .option('--docs <paths>', 'Architecture documents paths', 'docs/architecture/**/*.md',)
  .option('--turborepo', 'Validate Turborepo compliance', false,)
  .option('--hono', 'Validate Hono patterns', false,)
  .option('--tanstack-router', 'Validate TanStack Router patterns', false,)
  .option('--cleanup', 'Perform safe cleanup of unused files', false,)
  .option('--backup-dir <path>', 'Backup directory for cleanup', './.audit-backups',)
  .option('--skip-scan', 'Skip file scanning (use existing data)',)
  .option('--skip-dependencies', 'Skip dependency analysis',)
  .option('--skip-validation', 'Skip architecture validation',)
  .option('--dashboard', 'Generate interactive dashboard',)
  .action(async (path: string, options: any,) => {
    console.log(chalk.blue.bold('🔍 NeonPro Monorepo Audit Tool',),)
    console.log(chalk.gray(`Auditing: ${path}`,),)
    console.log('',)

    const startTime = Date.now()
    const startTimeHr = process.hrtime.bigint()
    let spinner: Ora | undefined

    // Performance tracking variables
    let fileScanStartTime = 0n
    let fileScanEndTime = 0n
    let dependencyAnalysisStartTime = 0n
    let dependencyAnalysisEndTime = 0n
    let architectureValidationStartTime = 0n
    let architectureValidationEndTime = 0n
    const initialCpuUsage = process.cpuUsage()

    try {
      // Phase 1: File Scanning
      let scanResult: any = null
      if (!options.skipScan) {
        spinner = ora('📁 Scanning files...',).start()
        fileScanStartTime = process.hrtime.bigint()

        const scanner = new FileScanner()
        const includePatterns = options.include.split(',',).map((p: string,) => p.trim())
        const excludePatterns = options.exclude.split(',',).map((p: string,) => p.trim())

        scanResult = await scanner.scan(path, {
          includePatterns,
          excludePatterns,
          followSymlinks: false,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 50000,
          scanContent: true,
          extractMetadata: true,
        },)

        fileScanEndTime = process.hrtime.bigint()
        spinner.succeed(`📁 Scanned ${scanResult.assets.length} files`,)
      }

      // Phase 2: Dependency Analysis
      let dependencyResult: any = null
      if (!options.skipDependencies && scanResult) {
        spinner = ora('🔗 Analyzing dependencies...',).start()
        dependencyAnalysisStartTime = process.hrtime.bigint()

        const analyzer = new DependencyAnalyzer()
        const analyzeOptions = {
          followDynamicImports: true,
          includeTypeImports: false,
          maxTransitiveDepth: 10,
          detectCircularDependencies: true,
          supportedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts',],
        }

        dependencyResult = await analyzer.buildGraph(scanResult.assets, analyzeOptions,)

        dependencyAnalysisEndTime = process.hrtime.bigint()
        const circularCount = analyzer.detectCircularDependencies(dependencyResult,).length
        const unusedCount = analyzer.findUnusedAssets(dependencyResult,).length

        spinner.succeed(
          `🔗 Analyzed dependencies (${circularCount} circular, ${unusedCount} unused)`,
        )
      }

      // Phase 3: Architecture Validation
      let validationResult: any = null
      if (!options.skipValidation && scanResult) {
        spinner = ora('🏗️ Validating architecture...',).start()
        architectureValidationStartTime = process.hrtime.bigint()

        const validator = new ArchitectureValidator()
        const docPaths = options.docs.split(',',).map((p: string,) => p.trim())

        const validationOptions = {
          documentPaths: docPaths,
          validateTurborepoStandards: options.turborepo,
          validateHonoPatterns: options.hono,
          validateTanStackRouterPatterns: options.tanStackRouter,
          includeSeverities: ['error', 'warning', 'info',],
          suggestAutoFixes: true,
        }

        validationResult = await validator.validateAssets(scanResult.assets, validationOptions,)

        architectureValidationEndTime = process.hrtime.bigint()
        const errorCount = validationResult.violations.filter(
          (v: any,) => v.severity === 'error',
        ).length
        const warningCount = validationResult.violations.filter(
          (v: any,) => v.severity === 'warning',
        ).length

        spinner.succeed(
          `🏗️ Architecture validated (${errorCount} errors, ${warningCount} warnings)`,
        )
      }

      // Phase 4: Cleanup (Optional)
      let cleanupResult: any = null
      if (options.cleanup && dependencyResult) {
        spinner = ora('🧹 Preparing cleanup plan...',).start()

        const cleanupEngine = new CleanupEngine(options.backupDir,)
        const unusedAssets = cleanupEngine.findUnusedAssets
          ? cleanupEngine.findUnusedAssets(dependencyResult,)
          : []

        const cleanupOptions = {
          dryRun: false,
          createBackups: true,
          backupDirectory: options.backupDir,
          requireConfirmation: false,
          batchSize: 50,
          preservePermissions: true,
          excludeActionTypes: [],
        }

        const plan = await cleanupEngine.createCleanupPlan(
          unusedAssets,
          [], // redundant assets
          [], // orphaned assets
          cleanupOptions,
        )

        const validation = await cleanupEngine.validateCleanupPlan(plan,)

        if (validation.isValid) {
          cleanupResult = await cleanupEngine.executeCleanupPlan(plan,)
          spinner.succeed(
            `🧹 Cleanup completed (${cleanupResult.actionsCompleted} files processed)`,
          )
        } else {
          spinner.warn(`🧹 Cleanup skipped (${validation.issues.length} validation issues)`,)
          cleanupResult = { skipped: true, issues: validation.issues, }
        }
      }

      // Phase 5: Report Generation
      spinner = ora('📊 Generating report...',).start()

      const reportGenerator = new ReportGenerator()

      // Calculate real performance metrics
      const endTimeHr = process.hrtime.bigint()
      const totalExecutionTimeMs = Date.now() - startTime
      const totalExecutionTimeNs = Number(endTimeHr - startTimeHr,)
      const finalCpuUsage = process.cpuUsage(initialCpuUsage,)
      const memoryUsage = process.memoryUsage()

      const fileScanTimeMs = fileScanStartTime && fileScanEndTime
        ? Number(fileScanEndTime - fileScanStartTime,) / 1000000
        : 0
      const dependencyAnalysisTimeMs = dependencyAnalysisStartTime && dependencyAnalysisEndTime
        ? Number(dependencyAnalysisEndTime - dependencyAnalysisStartTime,) / 1000000
        : 0
      const architectureValidationTimeMs =
        architectureValidationStartTime && architectureValidationEndTime
          ? Number(architectureValidationEndTime - architectureValidationStartTime,) / 1000000
          : 0

      const filesProcessedPerSecond = scanResult && fileScanTimeMs > 0
        ? scanResult.assets.length / (fileScanTimeMs / 1000)
        : 0
      const dependenciesAnalyzedPerSecond = dependencyResult && dependencyAnalysisTimeMs > 0
        ? dependencyResult.nodes.size / (dependencyAnalysisTimeMs / 1000)
        : 0

      // CPU usage as percentage (user + system time per total execution time)
      const totalCpuTimeMs = (finalCpuUsage.user + finalCpuUsage.system) / 1000
      const cpuUsagePercentage = totalExecutionTimeMs > 0
        ? (totalCpuTimeMs / totalExecutionTimeMs) * 100
        : 0

      // Prepare audit data
      const auditData = {
        fileResults: scanResult,
        dependencyResults: dependencyResult,
        architectureResults: validationResult,
        cleanupResults: cleanupResult,
        performanceMetrics: {
          totalExecutionTime: totalExecutionTimeMs,
          memoryUsage: memoryUsage.heapUsed,
          peakMemoryUsage: memoryUsage.heapTotal,
          filesProcessedPerSecond: Math.round(filesProcessedPerSecond * 100,) / 100,
          fileScanTime: Math.round(fileScanTimeMs * 100,) / 100,
          dependencyAnalysisTime: Math.round(dependencyAnalysisTimeMs * 100,) / 100,
          architectureValidationTime: Math.round(architectureValidationTimeMs * 100,) / 100,
          dependenciesAnalyzedPerSecond: Math.round(dependenciesAnalyzedPerSecond * 100,) / 100,
          cpuUsage: Math.round(cpuUsagePercentage * 100,) / 100,
        },
      }

      const reportOptions = {
        format: options.format as 'html' | 'json' | 'markdown',
        includeSections: [
          'executive_summary',
          'file_analysis',
          'dependency_analysis',
          'architecture_validation',
          'cleanup_results',
        ],
        detailLevel: 'standard' as 'minimal' | 'standard' | 'detailed',
        includeVisualizations: options.format === 'html',
        includeRawData: options.format === 'json',
        outputPath: options.output,
        template: 'default',
      }

      const report = await reportGenerator.generateAuditReport(auditData, reportOptions,)

      // Export report
      await reportGenerator.exportReport(report, options.format, options.output,)

      spinner.succeed(`📊 Report generated: ${options.output}`,)

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.output.replace(/\.[^/.]+$/, '',) + '-dashboard.html'
        const dashboardHtml = await reportGenerator.generateDashboard(auditData,)

        const fs = await import('fs/promises')
        await fs.writeFile(dashboardPath, dashboardHtml, 'utf-8',)
        console.log(chalk.green(`📊 Dashboard generated: ${dashboardPath}`,),)
      }

      // Summary
      const totalTime = Date.now() - startTime
      console.log('',)
      console.log(chalk.green.bold('✅ Audit completed successfully!',),)
      console.log(chalk.blue('Summary:',),)

      if (scanResult) {
        console.log(`  📁 Files scanned: ${chalk.green(scanResult.assets.length,)}`,)
        if (scanResult.errors.length > 0) {
          console.log(`  ⚠️  Scan errors: ${chalk.yellow(scanResult.errors.length,)}`,)
        }
      }

      if (dependencyResult) {
        const circularDeps = dependencyResult.metadata.circularDependencies?.length || 0
        const unusedAssets = dependencyResult.metadata.unusedAssets?.length || 0
        console.log(
          `  🔗 Dependencies: ${chalk.green(dependencyResult.nodes.size,)} nodes, ${
            chalk.green(
              dependencyResult.edges.length,
            )
          } edges`,
        )
        if (circularDeps > 0) {
          console.log(`  🔄 Circular dependencies: ${chalk.red(circularDeps,)}`,)
        }
        if (unusedAssets > 0) {
          console.log(`  🗑️  Unused assets: ${chalk.yellow(unusedAssets,)}`,)
        }
      }

      if (validationResult) {
        const errors = validationResult.violations.filter(
          (v: any,) => v.severity === 'error',
        ).length
        const warnings = validationResult.violations.filter(
          (v: any,) => v.severity === 'warning',
        ).length
        console.log(
          `  🏗️ Architecture: ${
            chalk.green(
              validationResult.complianceSummary.complianceScore,
            )
          }% compliant`,
        )
        if (errors > 0) {
          console.log(`  ❌ Critical issues: ${chalk.red(errors,)}`,)
        }
        if (warnings > 0) {
          console.log(`  ⚠️  Warnings: ${chalk.yellow(warnings,)}`,)
        }
      }

      if (cleanupResult && !cleanupResult.skipped) {
        console.log(
          `  🧹 Cleanup: ${chalk.green(cleanupResult.actionsCompleted,)} files processed`,
        )
        if (cleanupResult.spaceReclaimed > 0) {
          console.log(
            `  💾 Space reclaimed: ${chalk.green(formatBytes(cleanupResult.spaceReclaimed,),)}`,
          )
        }
      }

      console.log(`  ⏱️  Total time: ${chalk.green(totalTime + 'ms',)}`,)
      console.log(`  📊 Report: ${chalk.cyan(options.output,)}`,)

      if (options.dashboard) {
        const dashboardPath = options.output.replace(/\.[^/.]+$/, '',) + '-dashboard.html'
        console.log(`  📊 Dashboard: ${chalk.cyan(dashboardPath,)}`,)
      }
    } catch (error) {
      if (spinner) {
        spinner.fail('Audit failed',)
      }
      console.error(chalk.red('Error:',), error instanceof Error ? error.message : error,)
      process.exit(1,)
    }
  },)

function formatBytes(bytes: number,): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB',]
  if (bytes === 0) {
    return '0 Bytes'
  }

  const i = Math.floor(Math.log(bytes,) / Math.log(1024,),)
  return `${Math.round((bytes / Math.pow(1024, i,)) * 100,) / 100} ${sizes[i]}`
}
