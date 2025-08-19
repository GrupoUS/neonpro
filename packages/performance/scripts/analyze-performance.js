#!/usr/bin/env node

/**
 * Healthcare Performance Analysis Script
 * Comprehensive performance analysis with Lighthouse and Web Vitals
 */

const fs = require('node:fs');
const path = require('node:path');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function analyzePerformance() {
  try {
    const config = loadConfig();

    if (config.urls && config.urls.length > 0) {
      for (const url of config.urls) {
        await analyzeUrl(url, config);
      }
    } else {
    }
  } catch (_error) {
    process.exit(1);
  }
}

function loadConfig() {
  const configPath = path.join(process.cwd(), 'performance-config.json');

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  // Default configuration
  return {
    urls: ['http://localhost:3000'],
    healthcareMode: true,
    mobileAnalysis: true,
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  };
}

async function analyzeUrl(url, config) {
  let chrome;

  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    });
    const desktopResults = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: config.categories || ['performance', 'accessibility'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10_240,
        cpuSlowdownMultiplier: 1,
      },
    });

    // Mobile analysis if enabled
    let mobileResults = null;
    if (config.mobileAnalysis) {
      mobileResults = await lighthouse(url, {
        port: chrome.port,
        onlyCategories: config.categories || ['performance', 'accessibility'],
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      });
    }

    // Generate healthcare-specific report
    const _report = generateHealthcareReport(
      url,
      desktopResults,
      mobileResults,
      config
    );

    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlSafe = url.replace(/[^a-zA-Z0-9]/g, '_');

    const desktopPath = path.join(
      process.cwd(),
      `lighthouse-desktop-${urlSafe}-${timestamp}.json`
    );
    fs.writeFileSync(desktopPath, JSON.stringify(desktopResults.lhr, null, 2));

    if (mobileResults) {
      const mobilePath = path.join(
        process.cwd(),
        `lighthouse-mobile-${urlSafe}-${timestamp}.json`
      );
      fs.writeFileSync(mobilePath, JSON.stringify(mobileResults.lhr, null, 2));
    }
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function generateHealthcareReport(url, desktopResults, mobileResults, _config) {
  const desktop = desktopResults.lhr;
  const mobile = mobileResults?.lhr;

  const report = `
🏥 HEALTHCARE PERFORMANCE ANALYSIS REPORT
=========================================
URL: ${url}
Timestamp: ${new Date().toISOString()}

📊 PERFORMANCE SCORES:
${formatScores('Desktop', desktop)}
${mobile ? formatScores('Mobile', mobile) : ''}

⚡ CORE WEB VITALS (HEALTHCARE THRESHOLDS):
${formatWebVitals('Desktop', desktop)}
${mobile ? formatWebVitals('Mobile', mobile) : ''}

🏥 HEALTHCARE-SPECIFIC METRICS:
${formatHealthcareMetrics('Desktop', desktop)}
${mobile ? formatHealthcareMetrics('Mobile', mobile) : ''}

🎯 HEALTHCARE RECOMMENDATIONS:
${formatHealthcareRecommendations(desktop, mobile)}

♿ ACCESSIBILITY (HEALTHCARE CRITICAL):
${formatAccessibility('Desktop', desktop)}
${mobile ? formatAccessibility('Mobile', mobile) : ''}
`;

  return report;
}

function formatScores(device, results) {
  const performance = results.categories.performance?.score * 100 || 0;
  const accessibility = results.categories.accessibility?.score * 100 || 0;
  const bestPractices = results.categories['best-practices']?.score * 100 || 0;

  return `
${device}:
  Performance: ${performance.toFixed(0)}/100 ${getScoreEmoji(performance)}
  Accessibility: ${accessibility.toFixed(0)}/100 ${getScoreEmoji(accessibility)}
  Best Practices: ${bestPractices.toFixed(0)}/100 ${getScoreEmoji(bestPractices)}`;
}

function formatWebVitals(device, results) {
  const audits = results.audits;
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const fid = audits['max-potential-fid']?.numericValue || 0;

  return `
${device}:
  FCP: ${(fcp / 1000).toFixed(2)}s ${getWebVitalRating(fcp, 'FCP')}
  LCP: ${(lcp / 1000).toFixed(2)}s ${getWebVitalRating(lcp, 'LCP')}
  CLS: ${cls.toFixed(3)} ${getWebVitalRating(cls, 'CLS')}
  FID: ${(fid / 1000).toFixed(2)}s ${getWebVitalRating(fid, 'FID')}`;
}

function formatHealthcareMetrics(device, results) {
  const audits = results.audits;
  const tti = audits.interactive?.numericValue || 0;
  const si = audits['speed-index']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;

  return `
${device}:
  Time to Interactive: ${(tti / 1000).toFixed(2)}s (Target: <3s for medical forms)
  Speed Index: ${(si / 1000).toFixed(2)}s (Target: <2s for patient data)
  Total Blocking Time: ${tbt.toFixed(0)}ms (Target: <200ms for clinical workflows)`;
}

function formatHealthcareRecommendations(desktop, mobile) {
  const recommendations = [];

  // Performance recommendations
  const desktopPerf = desktop.categories.performance?.score * 100 || 0;
  if (desktopPerf < 90) {
    recommendations.push(
      '🔧 Optimize for clinical workflows - Performance score below healthcare standards (90+)'
    );
  }

  // Accessibility recommendations
  const desktopA11y = desktop.categories.accessibility?.score * 100 || 0;
  if (desktopA11y < 95) {
    recommendations.push(
      '♿ Critical: Improve accessibility for healthcare compliance (target: 95+)'
    );
  }

  // Mobile-specific recommendations
  if (mobile) {
    const mobilePerf = mobile.categories.performance?.score * 100 || 0;
    if (mobilePerf < 85) {
      recommendations.push(
        '📱 Optimize mobile performance for clinic tablets and phones'
      );
    }
  }

  // Core Web Vitals recommendations
  const lcp = desktop.audits['largest-contentful-paint']?.numericValue || 0;
  if (lcp > 2000) {
    recommendations.push('⚡ Reduce LCP for faster patient data loading');
  }

  const cls = desktop.audits['cumulative-layout-shift']?.numericValue || 0;
  if (cls > 0.05) {
    recommendations.push('🎯 Improve CLS for stable medical form interactions');
  }

  return recommendations.length > 0
    ? recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')
    : '✅ All healthcare performance targets met!';
}

function formatAccessibility(device, results) {
  const score = results.categories.accessibility?.score * 100 || 0;
  const audits = results.audits;

  const issues = [];
  if (audits['color-contrast']?.score < 1) {
    issues.push('Color contrast issues (critical for medical readability)');
  }
  if (audits['aria-labels']?.score < 1) {
    issues.push('Missing ARIA labels (required for screen readers)');
  }
  if (audits['keyboard-navigation']?.score < 1) {
    issues.push('Keyboard navigation issues (critical for accessibility)');
  }

  return `
${device}: ${score.toFixed(0)}/100 ${getScoreEmoji(score)}
${issues.length > 0 ? `  Issues: ${issues.join(', ')}` : '  ✅ No accessibility issues detected'}`;
}

function getScoreEmoji(score) {
  if (score >= 90) {
    return '✅';
  }
  if (score >= 75) {
    return '⚠️';
  }
  return '❌';
}

function getWebVitalRating(value, metric) {
  const thresholds = {
    FCP: { good: 1200, poor: 2000 },
    LCP: { good: 2000, poor: 3000 },
    CLS: { good: 0.05, poor: 0.1 },
    FID: { good: 80, poor: 200 },
  };

  const threshold = thresholds[metric];
  if (!threshold) {
    return '';
  }

  if (value <= threshold.good) {
    return '✅ Good';
  }
  if (value <= threshold.poor) {
    return '⚠️ Needs Improvement';
  }
  return '❌ Poor';
}

// Run if called directly
if (require.main === module) {
  analyzePerformance();
}

module.exports = { analyzePerformance };
