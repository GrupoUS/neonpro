import { confirm, } from '@inquirer/prompts'
import chalk from 'chalk'
import { Command, } from 'commander'
import { promises as fs, } from 'fs'
import ora from 'ora'
import path from 'path'
import { CleanupEngine, } from '../../services/CleanupEngine.js'
import { CleanupPlan, CleanupResult, RollbackResult, } from '../../types/index.js'

interface CleanupOptions {
  dryRun?: boolean
  interactive?: boolean
  backupDir?: string
  target?: string
  force?: boolean
}

interface RollbackOptions {
  backupDir?: string
  interactive?: boolean
}

interface StatusOptions {
  backupDir?: string
}

export default function setupCleanupCommand(program: Command,): Command {
  const cleanupCmd = program
    .command('cleanup',)
    .description('Safe cleanup operations with backup and rollback capabilities',)
    .addHelpText(
      'after',
      `
Examples:
  $ audit-tool cleanup plan                    # Show cleanup plan without executing
  $ audit-tool cleanup execute --dry-run      # Dry run execution
  $ audit-tool cleanup execute --interactive  # Interactive cleanup with confirmations
  $ audit-tool cleanup rollback              # Rollback last cleanup operation
  $ audit-tool cleanup status                # Show cleanup status and history
`,
    )

  // Plan subcommand
  cleanupCmd
    .command('plan',)
    .description('Create and display cleanup plan without executing',)
    .option('-t, --target <path>', 'Target directory to analyze', process.cwd(),)
    .option('-b, --backup-dir <path>', 'Backup directory', './backup',)
    .action(async (options: CleanupOptions,) => {
      await handleCleanupPlan(options,)
    },)

  // Execute subcommand
  cleanupCmd
    .command('execute',)
    .description('Execute cleanup plan with optional confirmation',)
    .option('-d, --dry-run', 'Show what would be done without making changes', false,)
    .option('-i, --interactive', 'Ask for confirmation before each operation', false,)
    .option('-b, --backup-dir <path>', 'Backup directory', './backup',)
    .option('-t, --target <path>', 'Target directory to clean', process.cwd(),)
    .option('-f, --force', 'Execute without confirmation prompts', false,)
    .action(async (options: CleanupOptions,) => {
      await handleCleanupExecute(options,)
    },)

  // Rollback subcommand
  cleanupCmd
    .command('rollback',)
    .description('Rollback the last cleanup operation',)
    .option('-b, --backup-dir <path>', 'Backup directory', './backup',)
    .option('-i, --interactive', 'Ask for confirmation before rollback', false,)
    .action(async (options: RollbackOptions,) => {
      await handleRollback(options,)
    },)

  // Status subcommand
  cleanupCmd
    .command('status',)
    .description('Show cleanup status and operation history',)
    .option('-b, --backup-dir <path>', 'Backup directory', './backup',)
    .action(async (options: StatusOptions,) => {
      await handleStatus(options,)
    },)

  return cleanupCmd
}

async function handleCleanupPlan(options: CleanupOptions,): Promise<void> {
  const spinner = ora('Creating cleanup plan...',).start()

  try {
    const cleanupEngine = new CleanupEngine()
    const targetPath = path.resolve(options.target || process.cwd(),)
    const backupDir = path.resolve(options.backupDir || './backup',)

    // Create cleanup plan
    const plan = await cleanupEngine.createCleanupPlan({
      targetPaths: [targetPath,],
      backupDirectory: backupDir,
      dryRun: true,
      includeUnused: true,
      includeDuplicates: true,
      includeOrphaned: true,
    },)

    spinner.succeed('Cleanup plan created successfully',)

    // Display plan summary
    console.log(chalk.cyan('\n📋 Cleanup Plan Summary',),)
    console.log(chalk.gray('═'.repeat(50,),),)

    if (plan.operations.length === 0) {
      console.log(chalk.green('✨ No cleanup operations needed!',),)
      return
    }

    console.log(chalk.yellow(`📁 Target Directory: ${targetPath}`,),)
    console.log(chalk.yellow(`💾 Backup Directory: ${backupDir}`,),)
    console.log(chalk.yellow(`🗂️  Total Operations: ${plan.operations.length}`,),)

    // Group operations by type
    const operationsByType = plan.operations.reduce(
      (acc, op,) => {
        if (!acc[op.type]) {
          acc[op.type] = []
        }
        acc[op.type].push(op,)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Display operations by type
    for (const [type, operations,] of Object.entries(operationsByType,)) {
      console.log(
        chalk.cyan(`\n${getOperationIcon(type,)} ${type.toUpperCase()} (${operations.length})`,),
      )

      operations.slice(0, 10,).forEach(op => {
        console.log(chalk.gray(`  • ${path.relative(targetPath, op.sourcePath,)}`,),)
        if (op.reason) {
          console.log(chalk.dim(`    → ${op.reason}`,),)
        }
      },)

      if (operations.length > 10) {
        console.log(chalk.dim(`  ... and ${operations.length - 10} more`,),)
      }
    }

    // Display estimated savings
    const totalSize = plan.operations.reduce((sum, op,) => sum + (op.metadata?.size || 0), 0,)
    if (totalSize > 0) {
      console.log(chalk.green(`\n💾 Estimated Space Savings: ${formatBytes(totalSize,)}`,),)
    }

    console.log(chalk.cyan('\n🚀 Next Steps:',),)
    console.log(chalk.gray('  • Run with --dry-run to see detailed changes',),)
    console.log(chalk.gray('  • Run cleanup execute to perform operations',),)
    console.log(chalk.gray('  • Use --interactive for step-by-step confirmation',),)
  } catch (error) {
    spinner.fail('Failed to create cleanup plan',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleCleanupExecute(options: CleanupOptions,): Promise<void> {
  const targetPath = path.resolve(options.target || process.cwd(),)
  const backupDir = path.resolve(options.backupDir || './backup',)

  console.log(chalk.cyan('🧹 Executing Cleanup Operations',),)
  console.log(chalk.gray('═'.repeat(50,),),)
  console.log(chalk.yellow(`📁 Target: ${targetPath}`,),)
  console.log(chalk.yellow(`💾 Backup: ${backupDir}`,),)
  console.log(chalk.yellow(`🏃 Mode: ${options.dryRun ? 'DRY RUN' : 'EXECUTE'}`,),)

  if (!options.force && !options.dryRun) {
    const shouldContinue = await confirm({
      message: 'This will modify files in your project. Continue?',
      default: false,
    },)

    if (!shouldContinue) {
      console.log(chalk.yellow('🚫 Operation cancelled',),)
      return
    }
  }

  const spinner = ora('Creating cleanup plan...',).start()

  try {
    const cleanupEngine = new CleanupEngine()

    // Create and validate plan
    const plan = await cleanupEngine.createCleanupPlan({
      targetPaths: [targetPath,],
      backupDirectory: backupDir,
      dryRun: options.dryRun || false,
      includeUnused: true,
      includeDuplicates: true,
      includeOrphaned: true,
    },)

    const validation = await cleanupEngine.validateCleanupPlan(plan,)

    if (!validation.isValid) {
      spinner.fail('Cleanup plan validation failed',)
      console.error(chalk.red('❌ Validation Errors:',),)
      validation.errors.forEach(error => {
        console.error(chalk.red(`  • ${error}`,),)
      },)
      return
    }

    spinner.text = options.dryRun
      ? 'Simulating cleanup operations...'
      : 'Executing cleanup operations...'

    // Execute plan
    const result = await cleanupEngine.executeCleanupPlan(plan, {
      interactive: options.interactive,
      onProgress: (operation, index, total,) => {
        spinner.text = `Processing ${index + 1}/${total}: ${path.basename(operation.sourcePath,)}`
      },
    },)

    spinner.succeed(
      options.dryRun ? 'Dry run completed successfully' : 'Cleanup completed successfully',
    )

    // Display results
    displayCleanupResults(result, options.dryRun || false,)
  } catch (error) {
    spinner.fail(options.dryRun ? 'Dry run failed' : 'Cleanup execution failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleRollback(options: RollbackOptions,): Promise<void> {
  const backupDir = path.resolve(options.backupDir || './backup',)

  console.log(chalk.cyan('🔄 Rolling Back Cleanup Operations',),)
  console.log(chalk.gray('═'.repeat(50,),),)
  console.log(chalk.yellow(`💾 Backup Directory: ${backupDir}`,),)

  if (options.interactive) {
    const shouldContinue = await confirm({
      message: 'This will restore files from backup. Continue?',
      default: false,
    },)

    if (!shouldContinue) {
      console.log(chalk.yellow('🚫 Rollback cancelled',),)
      return
    }
  }

  const spinner = ora('Creating rollback plan...',).start()

  try {
    const cleanupEngine = new CleanupEngine()

    // Create rollback from most recent backup
    const rollback = await cleanupEngine.createRollback(backupDir,)

    spinner.text = 'Executing rollback...'

    const result = await cleanupEngine.executeRollback(rollback, {
      onProgress: (operation, index, total,) => {
        spinner.text = `Restoring ${index + 1}/${total}: ${path.basename(operation.targetPath,)}`
      },
    },)

    spinner.succeed('Rollback completed successfully',)

    // Display rollback results
    console.log(chalk.green(`\n✅ Rollback Results`,),)
    console.log(chalk.gray(`📁 Restored Files: ${result.restoredFiles.length}`,),)
    console.log(chalk.gray(`❌ Failed Operations: ${result.failedOperations.length}`,),)

    if (result.failedOperations.length > 0) {
      console.log(chalk.yellow('\n⚠️  Failed Operations:',),)
      result.failedOperations.forEach(op => {
        console.log(chalk.red(`  • ${op.operation.targetPath}: ${op.error}`,),)
      },)
    }
  } catch (error) {
    spinner.fail('Rollback failed',)
    console.error(
      chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error,)}`,),
    )
    process.exit(1,)
  }
}

async function handleStatus(options: StatusOptions,): Promise<void> {
  const backupDir = path.resolve(options.backupDir || './backup',)

  console.log(chalk.cyan('📊 Cleanup Status',),)
  console.log(chalk.gray('═'.repeat(50,),),)

  try {
    const cleanupEngine = new CleanupEngine()
    const status = cleanupEngine.getExecutionStatus()

    // Display current status
    console.log(chalk.yellow(`🏃 Current Status: ${status.status}`,),)

    if (status.currentOperation) {
      console.log(chalk.gray(`📝 Current Operation: ${status.currentOperation.type}`,),)
      console.log(chalk.gray(`📁 Processing: ${status.currentOperation.sourcePath}`,),)
    }

    console.log(
      chalk.gray(`📊 Progress: ${status.completedOperations}/${status.totalOperations}`,),
    )

    // Check backup directory
    try {
      await fs.access(backupDir,)
      const backupContents = await fs.readdir(backupDir,)
      console.log(chalk.green(`\n💾 Backup Directory: ${backupDir}`,),)
      console.log(chalk.gray(`📁 Backup Files: ${backupContents.length}`,),)
    } catch {
      console.log(chalk.yellow(`\n💾 Backup Directory: Not found (${backupDir})`,),)
    }
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error getting status: ${error instanceof Error ? error.message : String(error,)}`,
      ),
    )
    process.exit(1,)
  }
}

function displayCleanupResults(result: CleanupResult, isDryRun: boolean,): void {
  console.log(chalk.green(`\n✅ ${isDryRun ? 'Dry Run' : 'Cleanup'} Results`,),)
  console.log(chalk.gray('═'.repeat(30,),),)

  console.log(chalk.gray(`📁 Processed Files: ${result.processedFiles.length}`,),)
  console.log(chalk.gray(`❌ Failed Operations: ${result.failedOperations.length}`,),)

  if (result.backupPath && !isDryRun) {
    console.log(chalk.gray(`💾 Backup Created: ${result.backupPath}`,),)
  }

  const totalSize = result.processedFiles.reduce((sum, file,) => {
    return sum + (file.metadata?.size || 0)
  }, 0,)

  if (totalSize > 0) {
    console.log(
      chalk.green(`💾 Space ${isDryRun ? 'Would Be' : ''} Freed: ${formatBytes(totalSize,)}`,),
    )
  }

  if (result.failedOperations.length > 0) {
    console.log(chalk.yellow('\n⚠️  Failed Operations:',),)
    result.failedOperations.forEach(op => {
      console.log(chalk.red(`  • ${op.operation.sourcePath}: ${op.error}`,),)
    },)
  }

  if (!isDryRun && result.backupPath) {
    console.log(chalk.cyan('\n🔄 Rollback Available:',),)
    console.log(chalk.gray(`  Use: cleanup rollback --backup-dir "${result.backupPath}"`,),)
  }
}

function getOperationIcon(type: string,): string {
  switch (type) {
    case 'delete':
      return '🗑️'
    case 'move':
      return '📦'
    case 'archive':
      return '📚'
    default:
      return '🔧'
  }
}

function formatBytes(bytes: number,): string {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB',]
  const i = Math.min(Math.floor(Math.log(bytes,) / Math.log(k,),), sizes.length - 1,)
  return parseFloat((bytes / Math.pow(k, i,)).toFixed(2,),) + ' ' + sizes[i]
}
