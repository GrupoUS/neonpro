import chalk from 'chalk'
import { Command, } from 'commander'
import ora from 'ora'
import path from 'path'
import { FileScanner, } from '../../services/FileScanner.js'

export const scanCommand = new Command('scan',)
  .description('Scan monorepo for files and assets',)
  .argument('[path]', 'Path to scan', process.cwd(),)
  .option('-i, --include <patterns>', 'Include patterns (comma-separated)', 'apps/**,packages/**',)
  .option(
    '-e, --exclude <patterns>',
    'Exclude patterns (comma-separated)',
    '**/*.test.ts,**/node_modules/**,**/.git/**',
  )
  .option('-o, --output <file>', 'Output file path',)
  .option('-f, --format <type>', 'Output format', 'json',)
  .option('--max-size <bytes>', 'Maximum file size to scan (bytes)', '10485760',) // 10MB
  .option('--max-files <number>', 'Maximum number of files to scan', '50000',)
  .option('--follow-symlinks', 'Follow symbolic links',)
  .action(async (path: string, options: any,) => {
    const spinner = ora('Scanning files...',).start()

    try {
      const scanner = new FileScanner()

      // Parse options
      const includePatterns = options.include.split(',',).map((p: string,) => p.trim())
      const excludePatterns = options.exclude.split(',',).map((p: string,) => p.trim())
      const maxSize = parseInt(options.maxSize,)
      const maxFiles = parseInt(options.maxFiles,)

      const scanOptions = {
        includePatterns,
        excludePatterns,
        followSymlinks: options.followSymlinks || false,
        maxFileSize: maxSize,
        maxFiles,
        scanContent: true,
        extractMetadata: true,
      }

      spinner.text = `Scanning ${path}...`
      const startTime = Date.now()

      const result = await scanner.scan(path, scanOptions,)

      const duration = Date.now() - startTime
      spinner.succeed(`Scan completed in ${duration}ms`,)

      // Display summary
      console.log(chalk.blue('\nScan Summary:',),)
      console.log(`  Files found: ${chalk.green(result.assets.length,)}`,)
      console.log(`  Total size: ${chalk.green(formatBytes(result.totalSize,),)}`,)
      console.log(`  Duration: ${chalk.green(duration + 'ms',)}`,)

      if (result.errors.length > 0) {
        console.log(`  Errors: ${chalk.red(result.errors.length,)}`,)
        if (options.verbose) {
          console.log(chalk.red('\nErrors:',),)
          result.errors.forEach(error => {
            console.log(`  ${chalk.red('•',)} ${error.filePath}: ${error.error}`,)
          },)
        }
      }

      // File type distribution
      const distribution = getFileTypeDistribution(result.assets,)
      if (Object.keys(distribution,).length > 0) {
        console.log(chalk.blue('\nFile Types:',),)
        Object.entries(distribution,)
          .sort(([, a,], [, b,],) => b - a)
          .slice(0, 10,)
          .forEach(([type, count,],) => {
            console.log(`  ${chalk.cyan(type.padEnd(15,),)} ${chalk.green(count,)}`,)
          },)
      }

      // Output to file if requested
      if (options.output) {
        const outputData = options.format === 'json'
          ? JSON.stringify(result, null, 2,)
          : generateTextOutput(result,)

        const fs = await import('fs/promises')
        await fs.writeFile(options.output, outputData, 'utf-8',)
        console.log(chalk.green(`\nOutput saved to: ${options.output}`,),)
      }
    } catch (error) {
      spinner.fail('Scan failed',)
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

function getFileTypeDistribution(assets: any[],): Record<string, number> {
  const distribution: Record<string, number> = {}

  for (const asset of assets) {
    const ext = extractFileExtension(asset.path,)
    distribution[ext] = (distribution[ext] || 0) + 1
  }

  return distribution
}

function extractFileExtension(filePath: string,): string {
  // Get the basename to avoid issues with directory paths containing dots
  const basename = path.basename(filePath,)

  // Handle files without extensions
  if (!basename.includes('.',) || basename.startsWith('.',)) {
    return basename.startsWith('.',) ? 'dotfiles' : 'no-extension'
  }

  // Get the raw extension using path.extname
  const rawExt = path.extname(basename,).toLowerCase()

  // Handle compound extensions for common cases
  const compoundExtensions = [
    '.d.ts',
    '.test.ts',
    '.test.tsx',
    '.test.js',
    '.test.jsx',
    '.spec.ts',
    '.spec.tsx',
    '.spec.js',
    '.spec.jsx',
    '.config.js',
    '.config.ts',
    '.config.mjs',
    '.config.cjs',
    '.min.js',
    '.min.css',
    '.bundle.js',
    '.bundle.css',
  ]

  for (const compound of compoundExtensions) {
    if (basename.toLowerCase().endsWith(compound,)) {
      return compound
    }
  }

  // Return the simple extension, removing the leading dot
  return rawExt ? rawExt.slice(1,) : 'no-extension'
}

function generateTextOutput(result: any,): string {
  let output = `Scan Results\n${'='.repeat(50,)}\n\n`
  output += `Files found: ${result.assets.length}\n`
  output += `Total size: ${formatBytes(result.totalSize,)}\n`
  output += `Errors: ${result.errors.length}\n\n`

  output += `Files:\n`
  for (const asset of result.assets.slice(0, 100,)) {
    // Limit to first 100
    output += `  ${asset.path} (${formatBytes(asset.size,)})\n`
  }

  if (result.assets.length > 100) {
    output += `  ... and ${result.assets.length - 100} more files\n`
  }

  return output
}
