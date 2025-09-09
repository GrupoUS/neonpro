#!/usr/bin/env node

/**
 * NeonPro Audit CLI - Command Line Interface
 *
 * Production-ready CLI for the NeonPro Audit System with Constitutional TDD compliance.
 * Provides comprehensive validation capabilities accessible from command line.
 *
 * Constitutional Requirements:
 * - Process 10k+ files in under 4 hours
 * - Memory usage under 2GB throughout processing
 * - Quality standard ≥9.5/10
 *
 * Usage:
 *   npx neonpro-audit [options]
 *   neonpro-audit --mode=constitutional --target=/path/to/project
 *   neonpro-audit --help
 */

import { Command, } from 'commander'
import * as fs from 'fs/promises'
import * as path from 'path'
import { performance, } from 'perf_hooks'
import * as process from 'process'

// Import our validation system
import SystemValidator, {
  CONSTITUTIONAL_REQUIREMENTS,
  SystemValidationConfig,
  ValidationResult,
} from '../validation/system-validator'

// CLI Configuration Interface
interface AuditCliConfig {
  target: string
  mode: 'component' | 'integration' | 'performance' | 'constitutional' | 'full'
  outputFormat: 'json' | 'html' | 'csv' | 'all'
  outputDir: string
  configFile?: string
  verbose: boolean
  quiet: boolean
  maxMemory?: string
  maxTime?: string
  includeStress: boolean
  generateReports: boolean
}

class AuditCLI {
  private program: Command
  private config: AuditCliConfig
  private validator: SystemValidator
  private startTime: number = 0

  constructor() {
    this.program = new Command()
    this.config = this.getDefaultConfig()
    this.validator = new SystemValidator()
    this.setupCommands()
    this.setupEventHandlers()
  }

  /**
   * Initialize CLI with default configuration
   */
  private getDefaultConfig(): AuditCliConfig {
    return {
      target: process.cwd(),
      mode: 'full',
      outputFormat: 'all',
      outputDir: './audit-reports',
      verbose: false,
      quiet: false,
      includeStress: false,
      generateReports: true,
    }
  }

  /**
   * Setup CLI commands and options
   */
  private setupCommands(): void {
    this.program
      .name('neonpro-audit',)
      .description('NeonPro Audit System - Constitutional TDD Compliance Validation',)
      .version('1.0.0',)
      .option('-t, --target <path>', 'Target directory to audit', process.cwd(),)
      .option(
        '-m, --mode <mode>',
        'Validation mode: component|integration|performance|constitutional|full',
        'full',
      )
      .option('-o, --output-format <format>', 'Output format: json|html|csv|all', 'all',)
      .option('-d, --output-dir <dir>', 'Output directory for reports', './audit-reports',)
      .option('-c, --config <file>', 'Configuration file path',)
      .option('-v, --verbose', 'Enable verbose logging', false,)
      .option('-q, --quiet', 'Suppress non-essential output', false,)
      .option('--max-memory <size>', 'Maximum memory usage (e.g., 2GB)', '2GB',)
      .option('--max-time <time>', 'Maximum processing time (e.g., 4h)', '4h',)
      .option('--include-stress', 'Include stress testing', false,)
      .option('--no-reports', 'Skip report generation', false,)

    // Main audit command
    this.program
      .command('audit', { isDefault: true, },)
      .description('Run audit validation',)
      .action(async () => {
        await this.runAudit()
      },)

    // Quick validation command
    this.program
      .command('quick',)
      .description('Run quick validation (component + integration only)',)
      .action(async () => {
        this.config.mode = 'integration'
        this.config.includeStress = false
        await this.runAudit()
      },)

    // Constitutional compliance command
    this.program
      .command('constitutional',)
      .description('Run full constitutional compliance validation (10k+ files, <4h, <2GB)',)
      .action(async () => {
        this.config.mode = 'constitutional'
        this.config.includeStress = true
        this.config.generateReports = true
        await this.runAudit()
      },)

    // Performance benchmark command
    this.program
      .command('benchmark',)
      .description('Run performance benchmarks only',)
      .action(async () => {
        this.config.mode = 'performance'
        this.config.includeStress = true
        await this.runAudit()
      },)

    // Configuration validation command
    this.program
      .command('validate-config',)
      .description('Validate CLI configuration',)
      .action(async () => {
        await this.validateConfig()
      },)

    // System info command
    this.program
      .command('info',)
      .description('Show system information and requirements',)
      .action(() => {
        this.showSystemInfo()
      },)
  }

  /**
   * Setup event handlers for validation progress
   */
  private setupEventHandlers(): void {
    this.validator.on('validation:started', (data,) => {
      if (!this.config.quiet) {
        console.log(`🚀 Starting validation ${data.validationId}`,)
        console.log(`📋 Configuration: ${JSON.stringify(data.config, null, 2,)}`,)
        this.startTime = performance.now()
      }
    },)

    this.validator.on('validation:phase', (data,) => {
      if (!this.config.quiet) {
        const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1,)
        console.log(`⚡ Phase ${data.phase}: ${data.name} (${elapsed}s elapsed)`,)
      }
    },)

    this.validator.on('component:validation-started', (data,) => {
      if (this.config.verbose) {
        console.log(`🔍 Validating component: ${data.name}`,)
      }
    },)

    this.validator.on('benchmark:started', (data,) => {
      if (!this.config.quiet) {
        console.log(`📊 Starting ${data.type} benchmark with ${data.fileCount} files`,)
      }
    },)

    this.validator.on('stress-test:started', (data,) => {
      if (!this.config.quiet) {
        console.log(`💪 Running ${data.type} stress test`,)
      }
    },)

    this.validator.on('integration:test-started', (data,) => {
      if (this.config.verbose) {
        console.log(`🔗 Integration test: ${data.name}`,)
      }
    },)

    this.validator.on('performance:validation-started', () => {
      if (!this.config.quiet) {
        console.log('📈 Starting performance validation',)
      }
    },)

    this.validator.on('constitutional:validation-started', () => {
      if (!this.config.quiet) {
        console.log('🏛️ Starting constitutional compliance validation',)
      }
    },)

    this.validator.on('report:generated', (data,) => {
      if (!this.config.quiet) {
        console.log(`📄 Generated reports: ${data.formats.join(', ',)}`,)
      }
    },)

    this.validator.on('validation:completed', (data,) => {
      const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(1,)
      console.log(
        `✅ Validation completed in ${totalTime}s with status: ${data.result.overallStatus}`,
      )
    },)

    this.validator.on('validation:failed', (data,) => {
      console.error(`❌ Validation failed: ${data.error}`,)
    },)
  }

  /**
   * Parse CLI arguments and update configuration
   */
  private parseOptions(options: any,): void {
    this.config = {
      ...this.config,
      target: options.target || this.config.target,
      mode: options.mode || this.config.mode,
      outputFormat: options.outputFormat || this.config.outputFormat,
      outputDir: options.outputDir || this.config.outputDir,
      configFile: options.config,
      verbose: options.verbose || this.config.verbose,
      quiet: options.quiet || this.config.quiet,
      maxMemory: options.maxMemory || this.config.maxMemory,
      maxTime: options.maxTime || this.config.maxTime,
      includeStress: options.includeStress || this.config.includeStress,
      generateReports: options.reports !== false,
    }
  }

  /**
   * Load configuration from file if specified
   */
  private async loadConfigFile(): Promise<void> {
    if (!this.config.configFile) return

    try {
      const configPath = path.resolve(this.config.configFile,)
      const configContent = await fs.readFile(configPath, 'utf8',)
      const fileConfig = JSON.parse(configContent,)

      this.config = { ...this.config, ...fileConfig, }

      if (this.config.verbose) {
        console.log(`📝 Loaded configuration from ${configPath}`,)
      }
    } catch (error) {
      console.error(`❌ Failed to load config file: ${error.message}`,)
      process.exit(1,)
    }
  }

  /**
   * Validate CLI configuration
   */
  private async validateConfig(): Promise<void> {
    console.log('🔍 Validating CLI configuration...',)

    const errors: string[] = []
    const warnings: string[] = []

    // Validate target directory
    try {
      const targetStat = await fs.stat(this.config.target,)
      if (!targetStat.isDirectory()) {
        errors.push(`Target path is not a directory: ${this.config.target}`,)
      }
    } catch (error) {
      errors.push(`Target directory not found: ${this.config.target}`,)
    }

    // Validate mode
    const validModes = ['component', 'integration', 'performance', 'constitutional', 'full',]
    if (!validModes.includes(this.config.mode,)) {
      errors.push(`Invalid mode: ${this.config.mode}. Valid options: ${validModes.join(', ',)}`,)
    }

    // Validate output format
    const validFormats = ['json', 'html', 'csv', 'all',]
    if (!validFormats.includes(this.config.outputFormat,)) {
      errors.push(
        `Invalid output format: ${this.config.outputFormat}. Valid options: ${
          validFormats.join(', ',)
        }`,
      )
    }

    // Validate memory limit
    if (this.config.maxMemory) {
      const memoryBytes = this.parseMemoryLimit(this.config.maxMemory,)
      if (memoryBytes > CONSTITUTIONAL_REQUIREMENTS.MAX_MEMORY_BYTES) {
        warnings.push(
          `Memory limit ${this.config.maxMemory} exceeds constitutional requirement of 2GB`,
        )
      }
    }

    // Validate time limit
    if (this.config.maxTime) {
      const timeMs = this.parseTimeLimit(this.config.maxTime,)
      if (timeMs > CONSTITUTIONAL_REQUIREMENTS.MAX_PROCESSING_TIME_MS) {
        warnings.push(
          `Time limit ${this.config.maxTime} exceeds constitutional requirement of 4 hours`,
        )
      }
    }

    // Display results
    if (errors.length > 0) {
      console.error('❌ Configuration errors:',)
      errors.forEach(error => console.error(`  • ${error}`,))
      process.exit(1,)
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:',)
      warnings.forEach(warning => console.warn(`  • ${warning}`,))
    }

    console.log('✅ Configuration is valid',)
    console.log(`📋 Configuration summary:`,)
    console.log(`  Target: ${this.config.target}`,)
    console.log(`  Mode: ${this.config.mode}`,)
    console.log(`  Output: ${this.config.outputFormat} -> ${this.config.outputDir}`,)
    console.log(`  Stress tests: ${this.config.includeStress ? 'enabled' : 'disabled'}`,)
    console.log(`  Reports: ${this.config.generateReports ? 'enabled' : 'disabled'}`,)
  }

  /**
   * Parse memory limit string (e.g., "2GB", "1024MB")
   */
  private parseMemoryLimit(limit: string,): number {
    const match = limit.match(/^(\d+(?:\.\d+)?)\s*(GB|MB|KB|B)?$/i,)
    if (!match) return 0

    const value = parseFloat(match[1],)
    const unit = (match[2] || 'B').toUpperCase()

    switch (unit) {
      case 'GB':
        return value * 1024 * 1024 * 1024
      case 'MB':
        return value * 1024 * 1024
      case 'KB':
        return value * 1024
      case 'B':
        return value
      default:
        return 0
    }
  }

  /**
   * Parse time limit string (e.g., "4h", "30m", "120s")
   */
  private parseTimeLimit(limit: string,): number {
    const match = limit.match(/^(\d+(?:\.\d+)?)\s*(h|m|s)?$/i,)
    if (!match) return 0

    const value = parseFloat(match[1],)
    const unit = (match[2] || 's').toLowerCase()

    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000
      case 'm':
        return value * 60 * 1000
      case 's':
        return value * 1000
      default:
        return 0
    }
  }

  /**
   * Show system information and constitutional requirements
   */
  private showSystemInfo(): void {
    console.log('🏛️ NeonPro Audit System - Constitutional Requirements',)
    console.log('='.repeat(60,),)

    console.log('\n📊 Constitutional Requirements:',)
    console.log(
      `  • Max Processing Time: ${
        CONSTITUTIONAL_REQUIREMENTS.MAX_PROCESSING_TIME_MS / 1000 / 60 / 60
      } hours`,
    )
    console.log(
      `  • Max Memory Usage: ${
        CONSTITUTIONAL_REQUIREMENTS.MAX_MEMORY_BYTES / 1024 / 1024 / 1024
      } GB`,
    )
    console.log(
      `  • Min File Capacity: ${CONSTITUTIONAL_REQUIREMENTS.MIN_FILES_PROCESSED.toLocaleString()} files`,
    )
    console.log(`  • Min Uptime: ${CONSTITUTIONAL_REQUIREMENTS.MIN_UPTIME_PERCENTAGE}%`,)
    console.log(`  • Max Failure Rate: ${CONSTITUTIONAL_REQUIREMENTS.MAX_FAILURE_RATE * 100}%`,)
    console.log(
      `  • Min Integration Score: ${CONSTITUTIONAL_REQUIREMENTS.MIN_INTEGRATION_SCORE * 100}%`,
    )

    console.log('\n💻 System Information:',)
    console.log(`  • Node.js Version: ${process.version}`,)
    console.log(`  • Platform: ${process.platform} ${process.arch}`,)
    console.log(`  • Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1,)} MB used`,)
    console.log(`  • CPU: ${require('os',).cpus().length} cores`,)
    console.log(`  • Working Directory: ${process.cwd()}`,)

    console.log('\n🎯 Validation Modes:',)
    console.log('  • component    - Validate individual components',)
    console.log('  • integration  - Test component interactions',)
    console.log('  • performance  - Run performance benchmarks',)
    console.log('  • constitutional - Full constitutional compliance',)
    console.log('  • full         - Complete validation suite',)

    console.log('\n📄 Output Formats:',)
    console.log('  • json - Machine-readable JSON reports',)
    console.log('  • html - Human-readable HTML reports',)
    console.log('  • csv  - Spreadsheet-compatible CSV summaries',)
    console.log('  • all  - Generate all formats',)

    console.log('\n🚀 Quick Start Examples:',)
    console.log('  neonpro-audit --mode=quick --target=./src',)
    console.log('  neonpro-audit constitutional --output-format=html',)
    console.log('  neonpro-audit benchmark --include-stress',)
    console.log('  neonpro-audit --config=audit.json --verbose',)
  } /**
   * Main audit execution method
   */

  private async runAudit(): Promise<void> {
    try {
      // Parse and validate configuration
      await this.loadConfigFile()
      await this.ensureOutputDirectory()

      // Create SystemValidationConfig from CLI config
      const validationConfig = this.createValidationConfig()

      // Display startup information
      if (!this.config.quiet) {
        this.displayStartupInfo()
      }

      // Run validation
      console.log('\n🚀 Starting NeonPro Audit System Validation...',)
      const result = await this.validator.validateSystem(validationConfig,)

      // Process and display results
      await this.processResults(result,)

      // Generate reports if requested
      if (this.config.generateReports) {
        await this.generateReports(result,)
      }

      // Display final summary
      this.displayFinalSummary(result,)

      // Exit with appropriate code
      const exitCode = result.overallStatus === 'PASS' ? 0 : 1
      process.exit(exitCode,)
    } catch (error) {
      console.error('\n❌ Audit execution failed:',)
      console.error(`   Error: ${error.message}`,)

      if (this.config.verbose && error.stack) {
        console.error(`   Stack: ${error.stack}`,)
      }

      process.exit(1,)
    }
  }

  /**
   * Create SystemValidationConfig from CLI configuration
   */
  private createValidationConfig(): SystemValidationConfig {
    // Determine test data size based on mode
    const testDataSize = this.getTestDataSize()

    return {
      targetDirectory: this.config.target,
      testDataSize,
      includePerformanceTests: this.shouldIncludePerformance(),
      includeIntegrationTests: this.shouldIncludeIntegration(),
      includeConstitutionalTests: this.shouldIncludeConstitutional(),
      includeStressTests: this.config.includeStress,
      generateComplianceReport: this.config.generateReports,
      validateAllOptimizers: this.config.mode === 'full' || this.config.mode === 'constitutional',
    }
  }

  /**
   * Determine test data size based on mode
   */
  private getTestDataSize(): SystemValidationConfig['testDataSize'] {
    switch (this.config.mode) {
      case 'constitutional':
        return 'constitutional'
      case 'performance':
        return 'large'
      case 'component':
      case 'integration':
        return 'medium'
      case 'full':
        return 'large'
      default:
        return 'medium'
    }
  }

  /**
   * Should include performance testing based on mode
   */
  private shouldIncludePerformance(): boolean {
    return ['performance', 'constitutional', 'full',].includes(this.config.mode,)
  }

  /**
   * Should include integration testing based on mode
   */
  private shouldIncludeIntegration(): boolean {
    return ['integration', 'constitutional', 'full',].includes(this.config.mode,)
  }

  /**
   * Should include constitutional testing based on mode
   */
  private shouldIncludeConstitutional(): boolean {
    return ['constitutional', 'full',].includes(this.config.mode,)
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true, },)

      if (this.config.verbose) {
        console.log(`📁 Output directory: ${path.resolve(this.config.outputDir,)}`,)
      }
    } catch (error) {
      throw new Error(`Failed to create output directory: ${error.message}`,)
    }
  }

  /**
   * Display startup information
   */
  private displayStartupInfo(): void {
    console.log('\n🏛️ NeonPro Audit System',)
    console.log('='.repeat(50,),)
    console.log(`📁 Target: ${path.resolve(this.config.target,)}`,)
    console.log(`🎯 Mode: ${this.config.mode}`,)
    console.log(`📊 Output: ${this.config.outputFormat}`,)
    console.log(`📂 Reports: ${this.config.outputDir}`,)

    if (this.config.includeStress) {
      console.log('💪 Stress tests: enabled',)
    }

    console.log(`⏰ Started: ${new Date().toLocaleString()}`,)
  }

  /**
   * Process validation results
   */
  private async processResults(result: ValidationResult,): Promise<void> {
    const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(1,)

    console.log('\n' + '='.repeat(50,),)
    console.log('📊 VALIDATION RESULTS',)
    console.log('='.repeat(50,),)

    console.log(
      `\n🎯 Overall Status: ${this.getStatusIcon(result.overallStatus,)} ${result.overallStatus}`,
    )
    console.log(`⏱️  Duration: ${totalTime}s`,)
    console.log(`🆔 Validation ID: ${result.validationId}`,)

    // Component validation summary
    if (result.componentValidation.components) {
      console.log('\n📦 Component Validation:',)
      const components = result.componentValidation.components
      const passed = components.filter(c => c.status === 'PASS').length
      const warnings = components.filter(c => c.status === 'WARNING').length
      const failed = components.filter(c => c.status === 'FAIL').length

      console.log(`   ✅ Passed: ${passed}`,)
      console.log(`   ⚠️  Warnings: ${warnings}`,)
      console.log(`   ❌ Failed: ${failed}`,)
      console.log(`   📈 Score: ${(result.componentValidation.overallScore * 100).toFixed(1,)}%`,)
    }

    // Integration validation summary
    if (result.integrationValidation.integrationTests) {
      console.log('\n🔗 Integration Validation:',)
      const tests = result.integrationValidation.integrationTests
      const passed = tests.filter(t => t.status === 'PASS').length
      const failed = tests.filter(t => t.status === 'FAIL').length

      console.log(`   ✅ Passed: ${passed}`,)
      console.log(`   ❌ Failed: ${failed}`,)
      console.log(
        `   📈 Score: ${(result.integrationValidation.overallIntegrationScore * 100).toFixed(1,)}%`,
      )
    }

    // Performance validation summary
    if (result.performanceValidation.benchmarks) {
      console.log('\n📈 Performance Validation:',)
      const benchmarks = result.performanceValidation.benchmarks
      const constitutional = benchmarks.filter(b => b.constitutionalCompliance).length

      console.log(`   📊 Benchmarks run: ${benchmarks.length}`,)
      console.log(`   🏛️ Constitutional compliant: ${constitutional}`,)

      // Show constitutional benchmark if present
      const constitutionalBench = benchmarks.find(b => b.name.includes('Constitutional',))
      if (constitutionalBench) {
        const timeHours = (constitutionalBench.processingTime / 1000 / 60 / 60).toFixed(2,)
        const memoryGB = (constitutionalBench.memoryPeak / 1024 / 1024 / 1024).toFixed(2,)
        const throughput = constitutionalBench.throughput.toFixed(0,)

        console.log(`   📋 Constitutional Benchmark:`,)
        console.log(`      • Files: ${constitutionalBench.fileCount.toLocaleString()}`,)
        console.log(`      • Time: ${timeHours}h (limit: 4h)`,)
        console.log(`      • Memory: ${memoryGB}GB (limit: 2GB)`,)
        console.log(`      • Throughput: ${throughput} files/sec`,)
        console.log(
          `      • Compliant: ${constitutionalBench.constitutionalCompliance ? '✅' : '❌'}`,
        )
      }
    }

    // Constitutional compliance summary
    if (result.constitutionalCompliance.requirements) {
      console.log('\n🏛️ Constitutional Compliance:',)
      const requirements = result.constitutionalCompliance.requirements
      const passed = requirements.filter(r => r.status === 'PASS').length
      const failed = requirements.filter(r => r.status === 'FAIL').length

      console.log(`   📜 Status: ${result.constitutionalCompliance.overall}`,)
      console.log(`   ✅ Requirements passed: ${passed}/${requirements.length}`,)
      console.log(`   📈 Score: ${(result.constitutionalCompliance.score * 100).toFixed(1,)}%`,)

      if (failed > 0) {
        console.log(`   ❌ Failed requirements:`,)
        requirements.filter(r => r.status === 'FAIL').forEach(req => {
          console.log(`      • ${req.requirement}: ${req.details}`,)
        },)
      }
    }

    // Critical issues
    if (result.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:',)
      result.criticalIssues.slice(0, 5,).forEach(issue => {
        console.log(`   ❌ ${issue}`,)
      },)

      if (result.criticalIssues.length > 5) {
        console.log(`   ... and ${result.criticalIssues.length - 5} more issues`,)
      }
    }

    // Top recommendations
    if (result.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:',)
      result.recommendations.slice(0, 3,).forEach((rec, index,) => {
        console.log(`   ${index + 1}. ${rec}`,)
      },)

      if (result.recommendations.length > 3) {
        console.log(`   ... and ${result.recommendations.length - 3} more recommendations`,)
      }
    }
  }

  /**
   * Generate reports in requested formats
   */
  private async generateReports(result: ValidationResult,): Promise<void> {
    console.log('\n📄 Generating Reports...',)

    const reportBase = `audit_${result.validationId}_${Date.now()}`
    const formats = this.config.outputFormat === 'all'
      ? ['json', 'html', 'csv',]
      : [this.config.outputFormat,]

    const reportPaths: string[] = []

    for (const format of formats) {
      try {
        const reportPath = await this.generateReport(result, format, reportBase,)
        reportPaths.push(reportPath,)

        if (!this.config.quiet) {
          const fileSize = (await fs.stat(reportPath,)).size
          console.log(
            `   📄 ${format.toUpperCase()}: ${reportPath} (${(fileSize / 1024).toFixed(1,)} KB)`,
          )
        }
      } catch (error) {
        console.error(`   ❌ Failed to generate ${format} report: ${error.message}`,)
      }
    }

    if (reportPaths.length > 0 && !this.config.quiet) {
      console.log(`\n✅ Generated ${reportPaths.length} report(s) in ${this.config.outputDir}`,)
    }
  }

  /**
   * Generate individual report file
   */
  private async generateReport(
    result: ValidationResult,
    format: string,
    baseName: string,
  ): Promise<string> {
    const reportPath = path.join(this.config.outputDir, `${baseName}.${format}`,)

    let content: string

    switch (format) {
      case 'json':
        content = JSON.stringify(result, null, 2,)
        break

      case 'html':
        content = this.generateHtmlReport(result,)
        break

      case 'csv':
        content = this.generateCsvReport(result,)
        break

      default:
        throw new Error(`Unsupported report format: ${format}`,)
    }

    await fs.writeFile(reportPath, content, 'utf8',)
    return reportPath
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(result: ValidationResult,): string {
    const totalTime = (result.duration / 1000).toFixed(1,)
    const timestamp = new Date(result.timestamp,).toLocaleString()

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro Audit Report - ${result.validationId}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, oxygen, ubuntu, cantarell, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header .subtitle { font-size: 1.2em; opacity: 0.9; margin-top: 10px; }
        .content { padding: 30px; }
        .status-card { padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .status-pass { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .status-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .status-fail { background: #f8d7da; border: 1px solid #f1aeb5; color: #721c24; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #495057; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        .requirements-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .requirements-table th, .requirements-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef; }
        .requirements-table th { background: #f8f9fa; font-weight: 600; }
        .status-icon { font-size: 1.2em; margin-right: 8px; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .issues { background: #ffe6e6; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; }
        .footer { text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #e9ecef; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ NeonPro Audit Report</h1>
            <div class="subtitle">Constitutional TDD Compliance Validation</div>
            <div style="margin-top: 20px; font-size: 1em;">
                <strong>Validation ID:</strong> ${result.validationId}<br>
                <strong>Generated:</strong> ${timestamp}<br>
                <strong>Duration:</strong> ${totalTime} seconds
            </div>
        </div>
        
        <div class="content">
            <div class="status-card status-${result.overallStatus.toLowerCase()}">
                <h2>${
      this.getStatusIcon(result.overallStatus,)
    } Overall Status: ${result.overallStatus}</h2>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${result.summary.totalTestsRun}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${
      (result.summary.overallPassRate * 100).toFixed(1,)
    }%</div>
                    <div class="metric-label">Pass Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${
      result.summary.performanceScore.toFixed(1,)
    }/10</div>
                    <div class="metric-label">Performance Score</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.summary.criticalFailures}</div>
                    <div class="metric-label">Critical Failures</div>
                </div>
            </div>

            ${
      result.constitutionalCompliance.requirements
        ? `
            <div class="section">
                <h2>🏛️ Constitutional Compliance</h2>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 1.5em; font-weight: bold; color: ${
          result.constitutionalCompliance.overall === 'COMPLIANT' ? '#28a745' : '#dc3545'
        };">
                        ${result.constitutionalCompliance.overall}
                    </div>
                    <div style="font-size: 1.2em; margin-top: 10px;">
                        Score: ${(result.constitutionalCompliance.score * 100).toFixed(1,)}%
                    </div>
                </div>
                <table class="requirements-table">
                    <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Status</th>
                            <th>Actual Value</th>
                            <th>Required Value</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
          result.constitutionalCompliance.requirements.map(req => `
                            <tr>
                                <td>${req.requirement}</td>
                                <td><span class="status-icon">${
            req.status === 'PASS' ? '✅' : '❌'
          }</span>${req.status}</td>
                                <td>${req.actualValue} ${req.unit}</td>
                                <td>${req.requiredValue} ${req.unit}</td>
                                <td>${req.details}</td>
                            </tr>
                        `).join('',)
        }
                    </tbody>
                </table>
            </div>
            `
        : ''
    }

            <div class="section">
                <h2>📊 Summary Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${
      result.summary.reliabilityScore.toFixed(1,)
    }/10</div>
                        <div class="metric-label">Reliability</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
      result.summary.constitutionalScore.toFixed(1,)
    }/10</div>
                        <div class="metric-label">Constitutional</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
      result.summary.readinessLevel.replace('_', ' ',)
    }</div>
                        <div class="metric-label">Readiness</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
      result.summary.certificationLevel.replace('_', ' ',)
    }</div>
                        <div class="metric-label">Certification</div>
                    </div>
                </div>
            </div>

            ${
      result.recommendations.length > 0
        ? `
            <div class="section">
                <div class="recommendations">
                    <h2>💡 Recommendations</h2>
                    <ul>
                        ${result.recommendations.map(rec => `<li>${rec}</li>`).join('',)}
                    </ul>
                </div>
            </div>
            `
        : ''
    }

            ${
      result.criticalIssues.length > 0
        ? `
            <div class="section">
                <div class="issues">
                    <h2>🚨 Critical Issues</h2>
                    <ul>
                        ${result.criticalIssues.map(issue => `<li>${issue}</li>`).join('',)}
                    </ul>
                </div>
            </div>
            `
        : ''
    }
        </div>
        
        <div class="footer">
            <p>Generated by NeonPro Audit System v1.0 | Constitutional TDD Framework</p>
            <p>For more information, visit the project documentation</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Generate CSV report
   */
  private generateCsvReport(result: ValidationResult,): string {
    const lines = [
      'Metric,Value',
      `Validation ID,${result.validationId}`,
      `Timestamp,${new Date(result.timestamp,).toISOString()}`,
      `Duration (seconds),${(result.duration / 1000).toFixed(1,)}`,
      `Overall Status,${result.overallStatus}`,
      `Total Tests,${result.summary.totalTestsRun}`,
      `Tests Passed,${result.summary.totalTestsPassed}`,
      `Tests Failed,${result.summary.totalTestsFailed}`,
      `Pass Rate (%),${(result.summary.overallPassRate * 100).toFixed(1,)}`,
      `Critical Failures,${result.summary.criticalFailures}`,
      `Performance Score,${result.summary.performanceScore.toFixed(1,)}`,
      `Reliability Score,${result.summary.reliabilityScore.toFixed(1,)}`,
      `Constitutional Score,${result.summary.constitutionalScore.toFixed(1,)}`,
      `Readiness Level,${result.summary.readinessLevel}`,
      `Certification Level,${result.summary.certificationLevel}`,
    ]

    if (result.constitutionalCompliance.requirements) {
      lines.push('Constitutional Compliance,Requirements',)
      result.constitutionalCompliance.requirements.forEach(req => {
        lines.push(`${req.requirement},${req.status}`,)
      },)
    }

    return lines.join('\n',)
  }

  /**
   * Display final summary
   */
  private displayFinalSummary(result: ValidationResult,): void {
    const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(1,)

    console.log('\n' + '='.repeat(50,),)
    console.log('🏆 FINAL SUMMARY',)
    console.log('='.repeat(50,),)

    console.log(
      `\n🎯 Status: ${this.getStatusIcon(result.overallStatus,)} ${result.overallStatus}`,
    )
    console.log(`⏱️  Total Time: ${totalTime}s`,)
    console.log(`📊 Quality Score: ${result.summary.performanceScore.toFixed(1,)}/10`,)
    console.log(`🏛️ Constitutional: ${result.constitutionalCompliance.overall || 'N/A'}`,)
    console.log(`🚀 Readiness: ${result.summary.readinessLevel}`,)
    console.log(`🏅 Certification: ${result.summary.certificationLevel}`,)

    if (result.overallStatus === 'PASS') {
      console.log('\n✅ Audit completed successfully!',)
      if (result.constitutionalCompliance.overall === 'COMPLIANT') {
        console.log('🏛️ System is constitutionally compliant and ready for production!',)
      }
    } else {
      console.log(
        '\n⚠️ Audit completed with issues. Please review the recommendations and critical issues.',
      )
    }

    console.log(`\n📄 Reports saved to: ${path.resolve(this.config.outputDir,)}`,)
    console.log(`🆔 Reference ID: ${result.validationId}`,)
    console.log(`📅 Completed: ${new Date().toLocaleString()}`,)
  }

  /**
   * Get status icon for display
   */
  private getStatusIcon(status: string,): string {
    switch (status) {
      case 'PASS':
        return '✅'
      case 'WARNING':
        return '⚠️'
      case 'FAIL':
        return '❌'
      default:
        return '❓'
    }
  }

  /**
   * Run the CLI application
   */
  public async run(): Promise<void> {
    try {
      // Parse command line arguments
      this.program.parse(process.argv,)

      // Update configuration with parsed options
      this.parseOptions(this.program.opts(),)
    } catch (error) {
      console.error(`❌ CLI error: ${error.message}`,)
      process.exit(1,)
    }
  }
}

// Export the CLI class
export { AuditCLI, AuditCliConfig, }

// Auto-run if this file is executed directly
if (require.main === module) {
  const cli = new AuditCLI()
  cli.run().catch((error,) => {
    console.error('Fatal CLI error:', error,)
    process.exit(1,)
  },)
}
