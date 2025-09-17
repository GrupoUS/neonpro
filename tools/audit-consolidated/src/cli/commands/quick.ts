import { Command } from 'commander';
import chalk from 'chalk';
import { createLogger, LogLevel } from '@neonpro/tools-shared';

const logger = createLogger('QuickAudit', {
  level: LogLevel.INFO,
  format: 'pretty',
  enablePerformance: true,
});

const quickCommand = new Command('quick')
  .description('🚀 Quick Audit - Fast Analysis and Health Check')
  .option('--healthcare', 'Enable healthcare compliance quick check (LGPD/ANVISA/CFM)')
  .option('--performance', 'Include performance metrics in quick analysis')
  .option('--security', 'Include security vulnerability quick scan')
  .option('--architecture', 'Include architecture compliance quick check')
  .option('--dependencies', 'Include dependency analysis in quick check')
  .option('--format <format>', 'Output format (json|html|markdown|dashboard)', 'dashboard')
  .option('--output <path>', 'Output path for quick audit report')
  .option('--verbose', 'Enable verbose output for debugging')
  .action(async (options) => {
    const startTime = Date.now();

    logger.info('🚀 Starting Quick Audit Analysis');

    try {
      // Quick analysis configuration
      const analysisConfig = {
        healthcare: options.healthcare,
        performance: options.performance,
        security: options.security,
        architecture: options.architecture,
        dependencies: options.dependencies,
        verbose: options.verbose,
      };

      // If no specific analysis is requested, enable all for comprehensive quick check
      if (!options.healthcare && !options.performance && !options.security && !options.architecture && !options.dependencies) {
        analysisConfig.healthcare = true;
        analysisConfig.performance = true;
        analysisConfig.security = true;
        analysisConfig.architecture = true;
        analysisConfig.dependencies = true;
        logger.info('📋 No specific analysis requested, running comprehensive quick audit');
      }

      const quickResults = {
        metadata: {
          timestamp: new Date().toISOString(),
          projectPath: process.cwd(),
          toolVersion: '2.0.0',
          analysisConfig,
        },
        overallHealth: {
          score: 0,
          status: 'UNKNOWN',
          grade: 'F',
        },
        quickChecks: {} as any,
        recommendations: [] as string[],
        criticalIssues: [] as string[],
        summary: {
          filesScanned: 0,
          issuesFound: 0,
          warningsFound: 0,
          timeElapsed: 0,
        },
      };

      // Phase 1: Project Structure Quick Check
      logger.info('📁 Phase 1: Project structure analysis');
      quickResults.quickChecks.structure = await quickStructureCheck();

      // Phase 2: Healthcare Compliance Quick Check
      if (analysisConfig.healthcare) {
        logger.info('🏥 Phase 2: Healthcare compliance quick check');
        quickResults.quickChecks.healthcare = await quickHealthcareCheck();
      }

      // Phase 3: Performance Quick Check
      if (analysisConfig.performance) {
        logger.info('⚡ Phase 3: Performance quick check');
        quickResults.quickChecks.performance = await quickPerformanceCheck();
      }

      // Phase 4: Security Quick Check
      if (analysisConfig.security) {
        logger.info('🔒 Phase 4: Security quick scan');
        quickResults.quickChecks.security = await quickSecurityCheck();
      }

      // Phase 5: Architecture Quick Check
      if (analysisConfig.architecture) {
        logger.info('🏗️ Phase 5: Architecture quick validation');
        quickResults.quickChecks.architecture = await quickArchitectureCheck();
      }

      // Phase 6: Dependencies Quick Check
      if (analysisConfig.dependencies) {
        logger.info('📦 Phase 6: Dependencies quick analysis');
        quickResults.quickChecks.dependencies = await quickDependencyCheck();
      }

      const totalDuration = Date.now() - startTime;
      quickResults.summary.timeElapsed = totalDuration;

      // Calculate overall health score
      const healthAnalysis = calculateOverallHealth(quickResults.quickChecks);
      quickResults.overallHealth = healthAnalysis;

      // Generate recommendations
      quickResults.recommendations = generateQuickRecommendations(quickResults.quickChecks);
      quickResults.criticalIssues = identifyCriticalIssues(quickResults.quickChecks);

      // Update summary
      quickResults.summary = {
        ...quickResults.summary,
        filesScanned: calculateTotalFilesScanned(quickResults.quickChecks),
        issuesFound: quickResults.criticalIssues.length,
        warningsFound: quickResults.recommendations.length,
      };

      // Output results
      if (options.output) {
        await saveQuickReport(quickResults, options.output, options.format);
        logger.success(`✅ Quick audit report saved to: ${options.output}`);
      } else if (options.format === 'dashboard') {
        displayDashboard(quickResults);
      } else {
        console.log(JSON.stringify(quickResults, null, 2));
      }

      // Log completion with health status
      const healthEmoji = getHealthEmoji(quickResults.overallHealth.score);
      logger.success(`🚀 Quick audit completed in ${totalDuration}ms`);
      logger.info(`${healthEmoji} Overall Health: ${quickResults.overallHealth.score}% (${quickResults.overallHealth.grade})`);

      // Alert on critical issues
      if (quickResults.criticalIssues.length > 0) {
        logger.warn(`⚠️ Found ${quickResults.criticalIssues.length} critical issues requiring immediate attention`);
        quickResults.criticalIssues.forEach(issue => logger.error(`❌ ${issue}`));
      }

      // Exit with appropriate code
      if (quickResults.overallHealth.score < 70 || quickResults.criticalIssues.length > 0) {
        process.exit(1);
      }

    } catch (error) {
      logger.error('❌ Quick audit failed', {
        component: 'QuickAudit',
        operation: 'quick-analysis',
      }, error as Error);

      process.exit(1);
    }
  });

// Quick check implementations
async function quickStructureCheck() {
  const { findFiles } = await import('@neonpro/tools-shared');

  // Quick file discovery
  const tsFiles = findFiles(process.cwd(), /\.ts$/, 3);
  const jsFiles = findFiles(process.cwd(), /\.js$/, 3);
  const jsonFiles = findFiles(process.cwd(), /\.json$/, 3);

  const structure = {
    totalFiles: (tsFiles.data?.length || 0) + (jsFiles.data?.length || 0) + (jsonFiles.data?.length || 0),
    typeScriptFiles: tsFiles.data?.length || 0,
    javascriptFiles: jsFiles.data?.length || 0,
    configFiles: jsonFiles.data?.length || 0,
    hasPackageJson: jsonFiles.data?.some(f => f.endsWith('package.json')) || false,
    hasTsConfig: jsonFiles.data?.some(f => f.endsWith('tsconfig.json')) || false,
    hasTests: tsFiles.data?.some(f => f.includes('.test.') || f.includes('.spec.')) || false,
    score: 85, // Base score
  };

  // Adjust score based on project structure
  if (!structure.hasPackageJson) structure.score -= 20;
  if (!structure.hasTsConfig) structure.score -= 10;
  if (!structure.hasTests) structure.score -= 15;
  if (structure.typeScriptFiles === 0 && structure.javascriptFiles === 0) structure.score -= 30;

  return structure;
}

async function quickHealthcareCheck() {
  const { findFiles } = await import('@neonpro/tools-shared');

  // Look for healthcare compliance patterns
  const allFiles = findFiles(process.cwd(), /\.(ts|js|json)$/, 5);
  const files = allFiles.data || [];

  const healthcarePatterns = {
    lgpd: files.filter(f => f.toLowerCase().includes('lgpd') || f.toLowerCase().includes('privacy')),
    anvisa: files.filter(f => f.toLowerCase().includes('anvisa') || f.toLowerCase().includes('medical')),
    cfm: files.filter(f => f.toLowerCase().includes('cfm') || f.toLowerCase().includes('professional')),
    security: files.filter(f => f.toLowerCase().includes('security') || f.toLowerCase().includes('auth')),
    audit: files.filter(f => f.toLowerCase().includes('audit') || f.toLowerCase().includes('log')),
  };

  const complianceScore = Object.values(healthcarePatterns).filter(p => p.length > 0).length * 20;

  return {
    score: Math.min(100, complianceScore),
    patterns: healthcarePatterns,
    lgpdCompliance: healthcarePatterns.lgpd.length > 0,
    anvisaCompliance: healthcarePatterns.anvisa.length > 0,
    cfmCompliance: healthcarePatterns.cfm.length > 0,
    securityImplemented: healthcarePatterns.security.length > 0,
    auditTrailPresent: healthcarePatterns.audit.length > 0,
    recommendations: generateHealthcareRecommendations(healthcarePatterns),
  };
}

async function quickPerformanceCheck() {
  const startTime = Date.now();

  // Quick performance metrics
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Simulate quick performance test
  const iterations = 10000;
  const testStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    Math.sqrt(i * Math.random());
  }
  const testDuration = Date.now() - testStart;

  const performanceMetrics = {
    memoryUsage: {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
    },
    cpuUsage,
    quickBenchmark: {
      iterations,
      duration: testDuration,
      operationsPerSecond: iterations / (testDuration / 1000),
    },
  };

  // Score based on performance metrics
  let score = 100;
  if (memoryUsage.heapUsed > 100 * 1024 * 1024) score -= 20; // > 100MB
  if (testDuration > 100) score -= 15; // > 100ms for simple test
  if (performanceMetrics.quickBenchmark.operationsPerSecond < 100000) score -= 10;

  return {
    score: Math.max(0, score),
    metrics: performanceMetrics,
    healthcareCompliant: testDuration <= 100, // ≤100ms requirement
    warnings: generatePerformanceWarnings(performanceMetrics),
  };
}

async function quickSecurityCheck() {
  const { findFiles } = await import('@neonpro/tools-shared');

  // Quick security pattern analysis
  const allFiles = findFiles(process.cwd(), /\.(ts|js|json)$/, 3);
  const files = allFiles.data || [];

  const securityPatterns = {
    encryption: files.filter(f =>
      f.toLowerCase().includes('encrypt') ||
      f.toLowerCase().includes('crypto') ||
      f.toLowerCase().includes('hash')
    ),
    authentication: files.filter(f =>
      f.toLowerCase().includes('auth') ||
      f.toLowerCase().includes('login') ||
      f.toLowerCase().includes('session')
    ),
    validation: files.filter(f =>
      f.toLowerCase().includes('validate') ||
      f.toLowerCase().includes('sanitize') ||
      f.toLowerCase().includes('security')
    ),
    secrets: files.filter(f =>
      f.toLowerCase().includes('.env') ||
      f.toLowerCase().includes('secret') ||
      f.toLowerCase().includes('key')
    ),
  };

  // Check for potential security issues
  const securityIssues = [];
  if (securityPatterns.secrets.some(f => !f.includes('.example'))) {
    securityIssues.push('Potential secrets or keys found in repository');
  }
  if (securityPatterns.authentication.length === 0) {
    securityIssues.push('No authentication patterns detected');
  }
  if (securityPatterns.encryption.length === 0) {
    securityIssues.push('No encryption patterns detected');
  }

  const score = Math.max(0, 100 - (securityIssues.length * 25));

  return {
    score,
    patterns: securityPatterns,
    issues: securityIssues,
    hasEncryption: securityPatterns.encryption.length > 0,
    hasAuthentication: securityPatterns.authentication.length > 0,
    hasValidation: securityPatterns.validation.length > 0,
    recommendations: generateSecurityRecommendations(securityPatterns, securityIssues),
  };
}

async function quickArchitectureCheck() {
  const { findFiles, readPackageJson } = await import('@neonpro/tools-shared');

  // Quick architecture analysis
  const packageResult = readPackageJson();
  const packageData = packageResult.data;

  const allFiles = findFiles(process.cwd(), /\.(ts|js|json)$/, 4);
  const files = allFiles.data || [];

  const architecturePatterns = {
    monorepo: files.some(f => f.includes('turbo.json') || f.includes('lerna.json')),
    typescript: files.some(f => f.includes('tsconfig.json')),
    testing: files.some(f => f.includes('test') || f.includes('spec')),
    linting: files.some(f => f.includes('eslint') || f.includes('.lint')),
    cicd: files.some(f => f.includes('.github') || f.includes('.ci')),
  };

  const frameworkCompliance = {
    react: packageData?.dependencies?.react || packageData?.devDependencies?.react,
    typescript: packageData?.devDependencies?.typescript,
    vite: packageData?.devDependencies?.vite,
    turborepo: packageData?.devDependencies?.turbo,
  };

  let score = 80;
  if (architecturePatterns.typescript) score += 10;
  if (architecturePatterns.testing) score += 5;
  if (architecturePatterns.linting) score += 3;
  if (architecturePatterns.cicd) score += 2;

  return {
    score: Math.min(100, score),
    patterns: architecturePatterns,
    frameworks: frameworkCompliance,
    recommendations: generateArchitectureRecommendations(architecturePatterns, frameworkCompliance),
  };
}

async function quickDependencyCheck() {
  const { readPackageJson } = await import('@neonpro/tools-shared');

  const packageResult = readPackageJson();
  if (!packageResult.success || !packageResult.data) {
    return {
      score: 0,
      error: 'No package.json found',
      recommendations: ['Create a package.json file for dependency management'],
    };
  }

  const packageData = packageResult.data;
  const dependencies = packageData.dependencies || {};
  const devDependencies = packageData.devDependencies || {};

  const analysis = {
    totalDependencies: Object.keys(dependencies).length,
    totalDevDependencies: Object.keys(devDependencies).length,
    hasSecurityDeps: Object.keys(dependencies).some(dep =>
      dep.includes('crypto') || dep.includes('bcrypt') || dep.includes('helmet')
    ),
    hasTestingDeps: Object.keys(devDependencies).some(dep =>
      dep.includes('test') || dep.includes('jest') || dep.includes('vitest')
    ),
    hasLintingDeps: Object.keys(devDependencies).some(dep =>
      dep.includes('eslint') || dep.includes('prettier') || dep.includes('oxlint')
    ),
  };

  let score = 70;
  if (analysis.hasSecurityDeps) score += 10;
  if (analysis.hasTestingDeps) score += 10;
  if (analysis.hasLintingDeps) score += 5;
  if (analysis.totalDependencies > 0) score += 5;

  return {
    score: Math.min(100, score),
    analysis,
    recommendations: generateDependencyRecommendations(analysis),
  };
}

// Health calculation and reporting
function calculateOverallHealth(quickChecks: any) {
  const scores = Object.values(quickChecks)
    .map((check: any) => check.score || 0)
    .filter(score => score > 0);

  const averageScore = scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  const roundedScore = Math.round(averageScore);

  let grade = 'F';
  let status = 'CRITICAL';

  if (roundedScore >= 95) {
    grade = 'A+';
    status = 'EXCELLENT';
  } else if (roundedScore >= 90) {
    grade = 'A';
    status = 'EXCELLENT';
  } else if (roundedScore >= 85) {
    grade = 'B+';
    status = 'GOOD';
  } else if (roundedScore >= 80) {
    grade = 'B';
    status = 'GOOD';
  } else if (roundedScore >= 75) {
    grade = 'B-';
    status = 'FAIR';
  } else if (roundedScore >= 70) {
    grade = 'C+';
    status = 'FAIR';
  } else if (roundedScore >= 65) {
    grade = 'C';
    status = 'POOR';
  } else if (roundedScore >= 60) {
    grade = 'C-';
    status = 'POOR';
  } else if (roundedScore >= 55) {
    grade = 'D';
    status = 'CRITICAL';
  } else {
    grade = 'F';
    status = 'CRITICAL';
  }

  return {
    score: roundedScore,
    status,
    grade,
  };
}

function generateQuickRecommendations(quickChecks: any): string[] {
  const recommendations = [];

  if (quickChecks.structure?.score < 80) {
    recommendations.push('Improve project structure and configuration files');
  }

  if (quickChecks.healthcare?.score < 80) {
    recommendations.push('Enhance healthcare compliance implementation (LGPD/ANVISA/CFM)');
  }

  if (quickChecks.performance?.score < 80) {
    recommendations.push('Optimize performance for healthcare requirements (≤100ms patient data operations)');
  }

  if (quickChecks.security?.score < 80) {
    recommendations.push('Strengthen security patterns and patient data protection');
  }

  if (quickChecks.architecture?.score < 80) {
    recommendations.push('Review and improve architectural patterns');
  }

  if (quickChecks.dependencies?.score < 80) {
    recommendations.push('Update and optimize dependency management');
  }

  return recommendations;
}

function identifyCriticalIssues(quickChecks: any): string[] {
  const criticalIssues = [];

  if (quickChecks.structure?.score < 50) {
    criticalIssues.push('Critical project structure issues detected');
  }

  if (quickChecks.healthcare?.score < 60) {
    criticalIssues.push('Healthcare compliance requirements not met');
  }

  if (quickChecks.performance && !quickChecks.performance.healthcareCompliant) {
    criticalIssues.push('Performance does not meet healthcare requirements (≤100ms)');
  }

  if (quickChecks.security?.issues && quickChecks.security.issues.length > 0) {
    criticalIssues.push(...quickChecks.security.issues);
  }

  return criticalIssues;
}

function calculateTotalFilesScanned(quickChecks: any): number {
  let total = 0;
  if (quickChecks.structure?.totalFiles) total += quickChecks.structure.totalFiles;
  return total;
}

function getHealthEmoji(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 80) return '🟡';
  if (score >= 70) return '🟠';
  return '🔴';
}

// Recommendation generators
function generateHealthcareRecommendations(patterns: any): string[] {
  const recommendations = [];

  if (patterns.lgpd.length === 0) {
    recommendations.push('Implement LGPD compliance patterns for patient data protection');
  }

  if (patterns.anvisa.length === 0) {
    recommendations.push('Add ANVISA medical device compliance validation');
  }

  if (patterns.cfm.length === 0) {
    recommendations.push('Implement CFM professional standards compliance');
  }

  if (patterns.audit.length === 0) {
    recommendations.push('Add comprehensive audit trail for healthcare compliance');
  }

  return recommendations;
}

function generatePerformanceWarnings(metrics: any): string[] {
  const warnings = [];

  if (metrics.memoryUsage.heapUsed > 100 * 1024 * 1024) {
    warnings.push('High memory usage detected (>100MB)');
  }

  if (metrics.quickBenchmark.duration > 100) {
    warnings.push('Performance test exceeded healthcare threshold (>100ms)');
  }

  if (metrics.quickBenchmark.operationsPerSecond < 100000) {
    warnings.push('Low computational performance detected');
  }

  return warnings;
}

function generateSecurityRecommendations(patterns: any, issues: string[]): string[] {
  const recommendations = [];

  if (patterns.encryption.length === 0) {
    recommendations.push('Implement encryption for patient data protection');
  }

  if (patterns.authentication.length === 0) {
    recommendations.push('Add robust authentication system');
  }

  if (patterns.validation.length === 0) {
    recommendations.push('Implement input validation and sanitization');
  }

  if (issues.length > 0) {
    recommendations.push('Address identified security issues immediately');
  }

  return recommendations;
}

function generateArchitectureRecommendations(patterns: any, frameworks: any): string[] {
  const recommendations = [];

  if (!patterns.typescript) {
    recommendations.push('Adopt TypeScript for better type safety');
  }

  if (!patterns.testing) {
    recommendations.push('Implement comprehensive testing strategy');
  }

  if (!patterns.linting) {
    recommendations.push('Add code linting and formatting tools');
  }

  if (!patterns.cicd) {
    recommendations.push('Set up CI/CD pipeline for automated quality checks');
  }

  return recommendations;
}

function generateDependencyRecommendations(analysis: any): string[] {
  const recommendations = [];

  if (!analysis.hasSecurityDeps) {
    recommendations.push('Add security-focused dependencies for patient data protection');
  }

  if (!analysis.hasTestingDeps) {
    recommendations.push('Add testing framework dependencies');
  }

  if (!analysis.hasLintingDeps) {
    recommendations.push('Add code quality and linting dependencies');
  }

  if (analysis.totalDependencies === 0) {
    recommendations.push('Add core application dependencies');
  }

  return recommendations;
}

// Dashboard display
function displayDashboard(results: any) {
  const healthEmoji = getHealthEmoji(results.overallHealth.score);

  console.log('\n' + '='.repeat(80));
  console.log(chalk.bold.cyan('🚀 NeonPro Quick Audit Dashboard'));
  console.log('='.repeat(80));

  console.log(`\n${healthEmoji} Overall Health: ${chalk.bold(results.overallHealth.score + '%')} (${results.overallHealth.grade}) - ${results.overallHealth.status}`);

  console.log('\n📊 Quick Check Results:');
  console.log('-'.repeat(50));

  Object.entries(results.quickChecks).forEach(([category, data]: [string, any]) => {
    const emoji = getHealthEmoji(data.score);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    console.log(`${emoji} ${categoryName.padEnd(15)} ${data.score.toString().padStart(3)}%`);
  });

  if (results.criticalIssues.length > 0) {
    console.log(`\n❌ Critical Issues (${results.criticalIssues.length}):`);
    console.log('-'.repeat(30));
    results.criticalIssues.forEach((issue: string) => {
      console.log(`  • ${chalk.red(issue)}`);
    });
  }

  if (results.recommendations.length > 0) {
    console.log(`\n💡 Recommendations (${results.recommendations.length}):`);
    console.log('-'.repeat(30));
    results.recommendations.slice(0, 5).forEach((rec: string) => {
      console.log(`  • ${chalk.yellow(rec)}`);
    });

    if (results.recommendations.length > 5) {
      console.log(`  • ${chalk.gray(`...and ${results.recommendations.length - 5} more`)}`);
    }
  }

  console.log(`\n📈 Summary:`);
  console.log('-'.repeat(20));
  console.log(`Files Scanned: ${results.summary.filesScanned}`);
  console.log(`Issues Found: ${results.summary.issuesFound}`);
  console.log(`Warnings: ${results.summary.warningsFound}`);
  console.log(`Time Elapsed: ${results.summary.timeElapsed}ms`);

  console.log('\n' + '='.repeat(80));
}

async function saveQuickReport(report: any, outputPath: string, format: string) {
  const { writeFileSafe } = await import('@neonpro/tools-shared');

  let content: string;
  switch (format) {
    case 'html':
      content = generateHtmlQuickReport(report);
      break;
    case 'markdown':
      content = generateMarkdownQuickReport(report);
      break;
    case 'dashboard':
      content = generateTextDashboard(report);
      break;
    default:
      content = JSON.stringify(report, null, 2);
  }

  const result = writeFileSafe(outputPath, content, { createDirectories: true });
  if (!result.success) {
    throw new Error(`Failed to save quick audit report: ${result.message}`);
  }
}

function generateHtmlQuickReport(report: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quick Audit Report</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .dashboard { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .health-score { font-size: 4em; font-weight: bold; margin: 20px 0; }
        .excellent { color: #10b981; }
        .good { color: #f59e0b; }
        .poor { color: #ef4444; }
        .checks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .check-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; }
        .check-score { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .issues { background: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .recommendations { background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🚀 Quick Audit Report</h1>
            <div class="health-score ${report.overallHealth.score >= 80 ? 'excellent' : report.overallHealth.score >= 60 ? 'good' : 'poor'}">
                ${report.overallHealth.score}%
            </div>
            <h2>Grade: ${report.overallHealth.grade} - ${report.overallHealth.status}</h2>
        </div>

        <div class="checks-grid">
            ${Object.entries(report.quickChecks).map(([category, data]: [string, any]) => `
                <div class="check-card">
                    <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div class="check-score ${data.score >= 80 ? 'excellent' : data.score >= 60 ? 'good' : 'poor'}">${data.score}%</div>
                </div>
            `).join('')}
        </div>

        ${report.criticalIssues.length > 0 ? `
            <div class="issues">
                <h3>❌ Critical Issues</h3>
                <ul>
                    ${report.criticalIssues.map((issue: string) => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${report.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; color: #6b7280;">
            <p>Generated on ${new Date(report.metadata.timestamp).toLocaleString()}</p>
            <p>Analysis completed in ${report.summary.timeElapsed}ms</p>
        </div>
    </div>
</body>
</html>`;
}

function generateMarkdownQuickReport(report: any): string {
  return `# 🚀 Quick Audit Report

## Overall Health: ${report.overallHealth.score}% (${report.overallHealth.grade}) - ${report.overallHealth.status}

**Generated**: ${new Date(report.metadata.timestamp).toLocaleString()}
**Analysis Time**: ${report.summary.timeElapsed}ms
**Files Scanned**: ${report.summary.filesScanned}

## Quick Check Results

${Object.entries(report.quickChecks).map(([category, data]: [string, any]) =>
  `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${data.score}%`
).join('\n')}

${report.criticalIssues.length > 0 ? `
## ❌ Critical Issues

${report.criticalIssues.map((issue: string) => `- ${issue}`).join('\n')}
` : ''}

${report.recommendations.length > 0 ? `
## 💡 Recommendations

${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
` : ''}

## Summary

- **Issues Found**: ${report.summary.issuesFound}
- **Warnings**: ${report.summary.warningsFound}
- **Time Elapsed**: ${report.summary.timeElapsed}ms
`;
}

function generateTextDashboard(report: any): string {
  let dashboard = '='.repeat(80) + '\n';
  dashboard += '🚀 NeonPro Quick Audit Dashboard\n';
  dashboard += '='.repeat(80) + '\n\n';

  dashboard += `${getHealthEmoji(report.overallHealth.score)} Overall Health: ${report.overallHealth.score}% (${report.overallHealth.grade}) - ${report.overallHealth.status}\n\n`;

  dashboard += '📊 Quick Check Results:\n';
  dashboard += '-'.repeat(50) + '\n';

  Object.entries(report.quickChecks).forEach(([category, data]: [string, any]) => {
    const emoji = getHealthEmoji(data.score);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    dashboard += `${emoji} ${categoryName.padEnd(15)} ${data.score.toString().padStart(3)}%\n`;
  });

  if (report.criticalIssues.length > 0) {
    dashboard += `\n❌ Critical Issues (${report.criticalIssues.length}):\n`;
    dashboard += '-'.repeat(30) + '\n';
    report.criticalIssues.forEach((issue: string) => {
      dashboard += `  • ${issue}\n`;
    });
  }

  if (report.recommendations.length > 0) {
    dashboard += `\n💡 Recommendations (${report.recommendations.length}):\n`;
    dashboard += '-'.repeat(30) + '\n';
    report.recommendations.slice(0, 5).forEach((rec: string) => {
      dashboard += `  • ${rec}\n`;
    });

    if (report.recommendations.length > 5) {
      dashboard += `  • ...and ${report.recommendations.length - 5} more\n`;
    }
  }

  dashboard += `\n📈 Summary:\n`;
  dashboard += '-'.repeat(20) + '\n';
  dashboard += `Files Scanned: ${report.summary.filesScanned}\n`;
  dashboard += `Issues Found: ${report.summary.issuesFound}\n`;
  dashboard += `Warnings: ${report.summary.warningsFound}\n`;
  dashboard += `Time Elapsed: ${report.summary.timeElapsed}ms\n`;

  dashboard += '\n' + '='.repeat(80);

  return dashboard;
}

export default quickCommand;