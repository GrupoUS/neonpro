/**
 * NeonPro Bundle Analyzer
 * Automated bundle analysis and optimization recommendations
 */

import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface BundleStats {
  totalSize: number
  gzippedSize: number
  chunks: Array<{
    name: string
    size: number
    modules: string[]
  }>
  recommendations: string[]
}

/**
 * Analyze Next.js bundle and generate optimization recommendations
 */
export async function analyzeBundleSize(): Promise<BundleStats> {
  console.log('🔍 Starting bundle analysis...')
  
  try {
    // Run Next.js build with bundle analyzer - secure approach
    const { stdout, stderr } = await execFileAsync('npm', ['run', 'build'], {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: { ...process.env, ANALYZE: 'true' } // Pass ANALYZE as environment variable
    })

    if (stderr) {
      console.warn('Build warnings:', stderr)
    }

    console.log('✅ Build completed successfully')

    // Parse build output for size information
    const stats = parseBuildOutput(stdout)
    
    // Generate optimization recommendations
    const recommendations = generateRecommendations(stats)
    
    // Save analysis report
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      recommendations,
    }

    writeFileSync(
      join(process.cwd(), 'performance', 'bundle-analysis.json'),
      JSON.stringify(report, null, 2)
    )

    console.log('📊 Bundle analysis saved to performance/bundle-analysis.json')
    
    return {
      totalSize: stats.totalSize,
      gzippedSize: stats.gzippedSize,
      chunks: stats.chunks,
      recommendations,
    }
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error)
    throw error
  }
}

/**
 * Parse Next.js build output to extract size information
 */
function parseBuildOutput(output: string): any {
  const lines = output.split('\n')
  const sizeRegex = /│\s*(\S+)\s*│\s*(\d+(?:\.\d+)?)\s*kB\s*│\s*(\d+(?:\.\d+)?)\s*kB\s*│/
  
  let totalSize = 0
  let gzippedSize = 0
  const chunks: Array<{ name: string; size: number; modules: string[] }> = []

  for (const line of lines) {
    const match = line.match(sizeRegex)
    if (match) {
      const [, name, size, gzipped] = match
      const sizeKB = Number.parseFloat(size)
      const gzippedKB = Number.parseFloat(gzipped)
      
      totalSize += sizeKB
      gzippedSize += gzippedKB
      
      chunks.push({
        name: name.trim(),
        size: sizeKB,
        modules: [] // Would need webpack-bundle-analyzer output for detailed modules
      })
    }
  }

  return {
    totalSize: Math.round(totalSize * 100) / 100,
    gzippedSize: Math.round(gzippedSize * 100) / 100,
    chunks: chunks.sort((a, b) => b.size - a.size)
  }
}

/**
 * Generate optimization recommendations based on bundle analysis
 */
function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = []
  
  // Check total bundle size
  if (stats.totalSize > 1000) { // 1MB threshold
    recommendations.push(
      `⚠️ Large bundle size (${stats.totalSize}kB). Consider code splitting and dynamic imports.`
    )
  }

  // Check for large chunks
  const largeChunks = stats.chunks.filter((chunk: any) => chunk.size > 200)
  if (largeChunks.length > 0) {
    recommendations.push(
      `📦 Large chunks detected: ${largeChunks.map((c: any) => `${c.name} (${c.size}kB)`).join(', ')}. Consider splitting these chunks.`
    )
  }

  // Check compression ratio
  const compressionRatio = stats.gzippedSize / stats.totalSize
  if (compressionRatio > 0.7) {
    recommendations.push(
      `🗜️ Poor compression ratio (${Math.round(compressionRatio * 100)}%). Check for repetitive code or large JSON files.`
    )
  }

  // Specific optimization suggestions
  recommendations.push(
    '✨ Enable optimizePackageImports for icon libraries and utility packages',
    '🔄 Use React.lazy() for heavy components',
    '📊 Consider using dynamic imports for chart libraries',
    '🖼️ Optimize images with next/image component',
    '🚀 Enable Turbopack for faster builds (--turbopack flag)'
  )

  return recommendations
}

/**
 * Generate Lighthouse performance report
 */
export async function generateLighthouseReport(url: string = 'http://localhost:3000'): Promise<void> {
  console.log(`🔍 Running Lighthouse analysis on ${url}...`)
  
  try {
    const { stdout } = await execFileAsync('npx', [
      'lighthouse',
      url,
      '--output=json',
      '--output-path=./performance/lighthouse-report.json',
      '--chrome-flags=--headless',
      '--quiet'
    ])

    console.log('✅ Lighthouse report generated at performance/lighthouse-report.json')
    
    // Parse and summarize results
    const reportPath = join(process.cwd(), 'performance', 'lighthouse-report.json')
    const report = JSON.parse(readFileSync(reportPath, 'utf8'))
    
    const scores = {
      performance: Math.round(report.lhr.categories.performance.score * 100),
      accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
      seo: Math.round(report.lhr.categories.seo.score * 100),
    }

    console.log('📊 Lighthouse Scores:')
    console.log(`  Performance: ${scores.performance}/100`)
    console.log(`  Accessibility: ${scores.accessibility}/100`)
    console.log(`  Best Practices: ${scores.bestPractices}/100`)
    console.log(`  SEO: ${scores.seo}/100`)

    // Save summary
    writeFileSync(
      join(process.cwd(), 'performance', 'lighthouse-summary.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        url,
        scores,
        recommendations: extractLighthouseRecommendations(report.lhr)
      }, null, 2)
    )

  } catch (error) {
    console.error('❌ Lighthouse analysis failed:', error)
    throw error
  }
}

/**
 * Extract key recommendations from Lighthouse report
 */
function extractLighthouseRecommendations(lhr: any): string[] {
  const recommendations: string[] = []
  
  const audits = lhr.audits
  
  // Check key performance audits
  if (audits['largest-contentful-paint']?.score < 0.9) {
    recommendations.push('🎯 Optimize Largest Contentful Paint (LCP) - consider image optimization and preloading')
  }
  
  if (audits['first-input-delay']?.score < 0.9) {
    recommendations.push('⚡ Improve First Input Delay (FID) - reduce JavaScript execution time')
  }
  
  if (audits['cumulative-layout-shift']?.score < 0.9) {
    recommendations.push('📐 Fix Cumulative Layout Shift (CLS) - ensure images and ads have dimensions')
  }
  
  if (audits['unused-javascript']?.score < 0.9) {
    recommendations.push('🧹 Remove unused JavaScript - consider code splitting and tree shaking')
  }
  
  if (audits['render-blocking-resources']?.score < 0.9) {
    recommendations.push('🚫 Eliminate render-blocking resources - inline critical CSS and defer non-critical resources')
  }

  return recommendations
}

/**
 * Run complete performance analysis
 */
export async function runFullAnalysis(url?: string): Promise<void> {
  console.log('🚀 Starting complete performance analysis...')
  
  try {
    // 1. Bundle analysis
    console.log('\n📦 Step 1: Bundle Analysis')
    await analyzeBundleSize()
    
    // 2. Lighthouse analysis
    if (url) {
      console.log('\n🔍 Step 2: Lighthouse Analysis')
      await generateLighthouseReport(url)
    }
    
    console.log('\n✅ Performance analysis complete!')
    console.log('📁 Reports saved in ./performance/ directory')
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error)
    process.exit(1)
  }
}

// CLI interface
if (require.main === module) {
  const url = process.argv[2];
  runFullAnalysis(url);
}
