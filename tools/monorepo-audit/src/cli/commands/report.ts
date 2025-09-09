import { confirm, input, select, } from '@inquirer/prompts'
import chalk from 'chalk'
import { Command, } from 'commander'
import { promises as fs, } from 'fs'
import ora from 'ora'
import path from 'path'
import { ReportGenerator, } from '../../services/ReportGenerator.js'
import { AuditReport, ReportFormat, } from '../../types/index.js'

interface GenerateOptions {
  format?: string
  outputDir?: string
  template?: string
  includeDashboard?: boolean
  dataFile?: string
  projectName?: string
}

interface ExportCliOptions {
  format?: string
  outputDir?: string
  inputFile?: string
  template?: string
}

interface CompareOptions {
  baseline?: string
  current?: string
  outputDir?: string
  format?: string
}

interface DashboardOptions {
  port?: number
  host?: string
  dataFile?: string
  outputDir?: string
}

export default function setupReportCommand(program: Command,): Command {
  const reportCmd = program
    .command('report',)
    .description('Generate comprehensive audit reports and dashboards',)
    .addHelpText(
      'after',
      `
Examples:
  $ audit-tool report generate --data-file audit-results.json
  $ audit-tool report generate --format html --include-dashboard
  $ audit-tool report export --format pdf --input-file report.json
  $ audit-tool report compare --baseline old-audit.json --current new-audit.json
  $ audit-tool report dashboard --port 3000
`,
    )

  // Generate subcommand
  reportCmd
    .command('generate',)
    .description('Generate audit report from analysis data',)
    .option('-f, --format <format>', 'Output format (html|json|markdown|pdf)', 'html',)
    .option('-o, --output-dir <path>', 'Output directory', './reports',)
    .option('-t, --template <path>', 'Custom report template',)
    .option('-d, --include-dashboard', 'Generate interactive HTML dashboard', false,)
    .option('--data-file <path>', 'Input audit data file (JSON)',)
    .option('-p, --project-name <name>', 'Project name for report',)
    .action(async (options: GenerateOptions,) => {
      await handleReportGenerate(options,)
    },)

  // Export subcommand
  reportCmd
    .command('export',)
    .description('Export existing report to different formats',)
    .option('-f, --format <format>', 'Export format (html|json|markdown|pdf)', 'pdf',)
    .option('-o, --output-dir <path>', 'Output directory', './reports',)
    .option('-i, --input-file <path>', 'Input report file', 'reports/audit-report.json',)
    .option('-t, --template <path>', 'Custom export template',)
    .action(async (options: ExportCliOptions,) => {
      await handleReportExport(options,)
    },)

  // Compare subcommand
  reportCmd
    .command('compare',)
    .description('Compare multiple audit results and generate comparison report',)
    .option('-b, --baseline <path>', 'Baseline audit results file',)
    .option('-c, --current <path>', 'Current audit results file',)
    .option('-o, --output-dir <path>', 'Output directory', './reports',)
    .option('-f, --format <format>', 'Output format (html|json|markdown)', 'html',)
    .action(async (options: CompareOptions,) => {
      await handleReportCompare(options,)
    },)

  // Dashboard subcommand
  reportCmd
    .command('dashboard',)
    .description('Generate interactive HTML dashboard',)
    .option('-p, --port <port>', 'Port for development server', '3000',)
    .option('-h, --host <host>', 'Host for development server', 'localhost',)
    .option('--data-file <path>', 'Audit data file for dashboard',)
    .option('-o, --output-dir <path>', 'Output directory for dashboard files', './reports',)
    .action(async (options: DashboardOptions,) => {
      await handleDashboard(options,)
    },)

  return reportCmd
}

async function handleReportGenerate(options: GenerateOptions,): Promise<void> {
  console.log(chalk.cyan('📊 Generating Audit Report',),)
  console.log(chalk.gray('═'.repeat(50,),),)

  const spinner = ora('Preparing report generation...',).start()

  try {
    const reportGenerator = new ReportGenerator()
    const outputDir = path.resolve(options.outputDir || './reports',)

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true, },)

    let auditData: any

    // Load audit data
    if (options.dataFile) {
      const dataPath = path.resolve(options.dataFile,)
      spinner.text = 'Loading audit data...'

      try {
        const dataContent = await fs.readFile(dataPath, 'utf-8',)
        auditData = JSON.parse(dataContent,)
        spinner.text = 'Audit data loaded successfully'
      } catch (error) {
        spinner.fail('Failed to load audit data',)
        console.error(
          chalk.red(
            `❌ Error loading ${dataPath}: ${
              error instanceof Error ? error.message : String(error,)
            }`,
          ),
        )
        return
      }
    } else {
      // Interactive mode - ask for data file
      spinner.stop()

      const dataFile = await input({
        message: 'Path to audit data file (JSON):',
        default: './audit-results.json',
      },)

      const dataPath = path.resolve(dataFile,)
      spinner.start('Loading audit data...',)

      try {
        const dataContent = await fs.readFile(dataPath, 'utf-8',)
        auditData = JSON.parse(dataContent,)
      } catch (error) {
        spinner.fail('Failed to load audit data',)
        console.error(
          chalk.red(
            `❌ Error loading ${dataPath}: ${
              error instanceof Error ? error.message : String(error,)
            }`,
          ),
        )
        return
      }
    }

    // Validate format
    const format = options.format?.toLowerCase() as ReportFormat
    if (!['html', 'json', 'markdown', 'pdf',].includes(format,)) {
      spinner.fail('Invalid format specified',)
      console.error(
        chalk.red(`❌ Unsupported format: ${options.format}. Use: html, json, markdown, pdf`,),
      )
      return
    }

    spinner.text = `Generating ${format.toUpperCase()} report...`

    // Generate report
    const report = await reportGenerator.generateAuditReport({
      scanResult: auditData.scanResult,
      dependencyGraph: auditData.dependencyGraph,
      validationResults: auditData.validationResults,
      cleanupPlan: auditData.cleanupPlan,
      projectName: options.projectName || 'Monorepo Audit',
      generatedAt: new Date(),
    },)

    // Export report
    const exportOptions = {
      outputDirectory: outputDir,
      filename: `audit-report.${format}`,
      format,
      includeAssets: true,
    }

    if (options.template) {
      exportOptions.templatePath = path.resolve(options.template,)
    }

    const exportResult = await reportGenerator.exportReport(report, exportOptions,)

    spinner.succeed(`Report generated successfully`,)

    // Display results
    console.log(chalk.green(`\n✅ Report Generated`,),)
    console.log(chalk.gray(`📁 Output Directory: ${outputDir}`,),)
    console.log(chalk.gray(`📄 Report File: ${exportResult.filePath}`,),)
    console.log(chalk.gray(`📏 File Size: ${formatBytes(exportResult.size,)}`,),)

    // Generate dashboard if requested
    if (options.includeDashboard) {
      spinner.start('Generating interactive dashboard...',)

      const dashboard = await reportGenerator.generateDashboard(report, {
        outputDirectory: outputDir,
        includeCharts: true,
        includeInteractiveElements: true,
      },)

      spinner.succeed('Dashboard generated successfully',)
      console.log(chalk.cyan(`🎯 Dashboard: ${dashboard.indexPath}`,),)
    }

    // Provide next steps
    console.log(chalk.cyan('\n🚀 Next Steps:',),)
    console.log(chalk.gray(`  • Open: ${exportResult.filePath}`,),)
    if (options.includeDashboard) {
      console.log(chalk.gray(`  • View Dashboard: open ${path.join(outputDir, 'index.html',)}`,),)
    }
    console.log(
      chalk.gray(
        `  • Export to other formats: report export --input-file ${exportResult.filePath}`,
      ),
    )
  } catch (error) {
    spinner.fail('Report generation failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleReportExport(options: ExportCliOptions,): Promise<void> {
  console.log(chalk.cyan('📤 Exporting Report',),)
  console.log(chalk.gray('═'.repeat(50,),),)

  const spinner = ora('Loading report data...',).start()

  try {
    const reportGenerator = new ReportGenerator()
    const inputPath = path.resolve(options.inputFile || 'reports/audit-report.json',)
    const outputDir = path.resolve(options.outputDir || './reports',)

    // Load existing report
    let reportData: AuditReport
    try {
      const reportContent = await fs.readFile(inputPath, 'utf-8',)
      reportData = JSON.parse(reportContent,)
    } catch (error) {
      spinner.fail('Failed to load report data',)
      console.error(
        chalk.red(
          `❌ Error loading ${inputPath}: ${
            error instanceof Error ? error.message : String(error,)
          }`,
        ),
      )
      return
    }

    // Validate export format
    const format = options.format?.toLowerCase() as ReportFormat
    if (!['html', 'json', 'markdown', 'pdf',].includes(format,)) {
      spinner.fail('Invalid export format',)
      console.error(
        chalk.red(`❌ Unsupported format: ${options.format}. Use: html, json, markdown, pdf`,),
      )
      return
    }

    await fs.mkdir(outputDir, { recursive: true, },)

    spinner.text = `Exporting to ${format.toUpperCase()}...`

    // Export report  
    const exportOptions = {
      outputDirectory: outputDir,
      filename: `exported-report.${format}`,
      format,
      includeAssets: true,
    }

    if (options.template) {
      exportOptions.templatePath = path.resolve(options.template,)
    }

    const result = await reportGenerator.exportReport(reportData, exportOptions,)

    spinner.succeed('Export completed successfully',)

    // Display results
    console.log(chalk.green(`\n✅ Export Successful`,),)
    console.log(chalk.gray(`📁 Output Directory: ${outputDir}`,),)
    console.log(chalk.gray(`📄 Exported File: ${result.filePath}`,),)
    console.log(chalk.gray(`📏 File Size: ${formatBytes(result.size,)}`,),)
    console.log(chalk.gray(`🎨 Format: ${format.toUpperCase()}`,),)
  } catch (error) {
    spinner.fail('Export failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleReportCompare(options: CompareOptions,): Promise<void> {
  console.log(chalk.cyan('🔍 Comparing Audit Results',),)
  console.log(chalk.gray('═'.repeat(50,),),)

  const spinner = ora('Loading baseline audit data...',).start()

  try {
    const reportGenerator = new ReportGenerator()
    let baselinePath: string
    let currentPath: string

    // Get file paths
    if (options.baseline && options.current) {
      baselinePath = path.resolve(options.baseline,)
      currentPath = path.resolve(options.current,)
    } else {
      spinner.stop()

      baselinePath = await input({
        message: 'Baseline audit results file:',
        default: './baseline-audit.json',
      },)

      currentPath = await input({
        message: 'Current audit results file:',
        default: './current-audit.json',
      },)

      baselinePath = path.resolve(baselinePath,)
      currentPath = path.resolve(currentPath,)
      spinner.start('Loading audit data...',)
    }

    // Load both audit results
    let baselineData: any
    let currentData: any

    try {
      const baselineContent = await fs.readFile(baselinePath, 'utf-8',)
      baselineData = JSON.parse(baselineContent,)

      spinner.text = 'Loading current audit data...'
      const currentContent = await fs.readFile(currentPath, 'utf-8',)
      currentData = JSON.parse(currentContent,)
    } catch (error) {
      spinner.fail('Failed to load audit data',)
      console.error(
        chalk.red(
          `❌ Error loading audit files: ${
            error instanceof Error ? error.message : String(error,)
          }`,
        ),
      )
      return
    }

    const outputDir = path.resolve(options.outputDir || './reports',)
    await fs.mkdir(outputDir, { recursive: true, },)

    spinner.text = 'Generating comparison report...'

    // Generate comparison report
    const comparisonReport = await reportGenerator.generateComparisonReport({
      baseline: baselineData,
      current: currentData,
      compareDate: new Date(),
    },)

    // Export comparison report
    const format = (options.format?.toLowerCase() as ReportFormat) || 'html'
    const exportResult = await reportGenerator.exportReport(comparisonReport, {
      outputDirectory: outputDir,
      filename: `comparison-report.${format}`,
      format,
      includeAssets: true,
    },)

    spinner.succeed('Comparison report generated successfully',)

    // Display results
    console.log(chalk.green(`\n✅ Comparison Report Generated`,),)
    console.log(chalk.gray(`📁 Output Directory: ${outputDir}`,),)
    console.log(chalk.gray(`📄 Report File: ${exportResult.filePath}`,),)
    console.log(chalk.gray(`📏 File Size: ${formatBytes(exportResult.size,)}`,),)

    // Show key differences
    if (comparisonReport.summary) {
      console.log(chalk.cyan('\n📈 Key Changes:',),)
      const summary = comparisonReport.summary

      if (summary.filesChanged) {
        console.log(chalk.yellow(`  📁 Files Changed: ${summary.filesChanged}`,),)
      }
      if (summary.dependenciesChanged) {
        console.log(chalk.yellow(`  🔗 Dependencies Changed: ${summary.dependenciesChanged}`,),)
      }
      if (summary.issuesResolved) {
        console.log(chalk.green(`  ✅ Issues Resolved: ${summary.issuesResolved}`,),)
      }
      if (summary.newIssues) {
        console.log(chalk.red(`  ⚠️  New Issues: ${summary.newIssues}`,),)
      }
    }
  } catch (error) {
    spinner.fail('Comparison failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleDashboard(options: DashboardOptions,): Promise<void> {
  console.log(chalk.cyan('🎯 Generating Interactive Dashboard',),)
  console.log(chalk.gray('═'.repeat(50,),),)

  const spinner = ora('Preparing dashboard generation...',).start()

  try {
    const reportGenerator = new ReportGenerator()
    const outputDir = path.resolve(options.outputDir || './reports',)

    let auditData: any

    // Load audit data for dashboard
    if (options.dataFile) {
      const dataPath = path.resolve(options.dataFile,)
      spinner.text = 'Loading audit data...'

      const dataContent = await fs.readFile(dataPath, 'utf-8',)
      auditData = JSON.parse(dataContent,)
    } else {
      spinner.stop()

      const dataFile = await input({
        message: 'Path to audit data file for dashboard:',
        default: './audit-results.json',
      },)

      const dataPath = path.resolve(dataFile,)
      spinner.start('Loading audit data...',)

      const dataContent = await fs.readFile(dataPath, 'utf-8',)
      auditData = JSON.parse(dataContent,)
    }

    await fs.mkdir(outputDir, { recursive: true, },)

    // Convert audit data to report format
    const report: AuditReport = {
      summary: auditData.summary || {},
      scanResults: auditData.scanResult || {},
      dependencyAnalysis: auditData.dependencyGraph || {},
      architectureValidation: auditData.validationResults || {},
      cleanupRecommendations: auditData.cleanupPlan || {},
      metadata: {
        projectName: 'Monorepo Audit Dashboard',
        generatedAt: new Date(),
        version: '1.0.0',
      },
    }

    spinner.text = 'Generating interactive dashboard...'

    // Generate dashboard
    const dashboard = await reportGenerator.generateDashboard(report, {
      outputDirectory: outputDir,
      includeCharts: true,
      includeInteractiveElements: true,
      port: parseInt(options.port || '3000',),
      host: options.host || 'localhost',
    },)

    spinner.succeed('Dashboard generated successfully',)

    // Display results
    console.log(chalk.green(`\n✅ Dashboard Generated`,),)
    console.log(chalk.gray(`📁 Output Directory: ${outputDir}`,),)
    console.log(chalk.gray(`🎯 Dashboard Index: ${dashboard.indexPath}`,),)
    console.log(chalk.gray(`📊 Charts: ${dashboard.chartsGenerated}`,),)
    console.log(chalk.gray(`🔗 Interactive Elements: ${dashboard.interactiveElements}`,),)

    // Show access information
    console.log(chalk.cyan('\n🌐 Access Information:',),)
    console.log(chalk.gray(`  • Local File: file://${dashboard.indexPath}`,),)
    if (dashboard.serverUrl) {
      console.log(chalk.gray(`  • Development Server: ${dashboard.serverUrl}`,),)
      console.log(chalk.yellow(`  • Server running on ${options.host}:${options.port}`,),)
    }

    console.log(chalk.cyan('\n🚀 Dashboard Features:',),)
    console.log(chalk.gray('  • Interactive dependency graphs',),)
    console.log(chalk.gray('  • Architecture compliance metrics',),)
    console.log(chalk.gray('  • File usage statistics',),)
    console.log(chalk.gray('  • Cleanup recommendations',),)
  } catch (error) {
    spinner.fail('Dashboard generation failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

function formatBytes(bytes: number,): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB',]
  const i = Math.floor(Math.log(bytes,) / Math.log(k,),)
  return parseFloat((bytes / Math.pow(k, i,)).toFixed(2,),) + ' ' + sizes[i]
}
