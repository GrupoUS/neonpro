#!/usr/bin/env node

/**
 * Healthcare Compliance Verification Script for NeonPro
 * Ensures LGPD, ANVISA, and CFM compliance maintained after optimization
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const COMPLIANCE_FRAMEWORKS = {
  LGPD: {
    name: 'Lei Geral de Proteção de Dados',
    tasks: ['compliance:lgpd'],
    requirements: ['data encryption', 'consent management', 'data portability'],
  },
  ANVISA: {
    name: 'Agência Nacional de Vigilância Sanitária',
    tasks: ['compliance:anvisa'],
    requirements: [
      'treatment validation',
      'medical device compliance',
      'safety protocols',
    ],
  },
  CFM: {
    name: 'Conselho Federal de Medicina',
    tasks: ['compliance:cfm'],
    requirements: [
      'medical professional validation',
      'telemedicine compliance',
      'patient privacy',
    ],
  },
};

async function verifyCompliance() {
  const results = {
    lgpd: { status: false, details: [] },
    anvisa: { status: false, details: [] },
    cfm: { status: false, details: [] },
    overall: false,
  };

  try {
    // Verify each compliance framework
    for (const [framework, config] of Object.entries(COMPLIANCE_FRAMEWORKS)) {
      const frameworkKey = framework.toLowerCase();

      for (const task of config.tasks) {
        try {
          const output = execSync(`pnpm run ${task}`, {
            stdio: 'pipe',
            encoding: 'utf8',
          });

          results[frameworkKey].details.push({
            task,
            status: 'passed',
            output: `${output.substring(0, 200)}...`,
          });
        } catch (error) {
          results[frameworkKey].details.push({
            task,
            status: 'failed',
            error: `${error.message.substring(0, 200)}...`,
          });
        }
      }

      // Check if all tasks passed for this framework
      results[frameworkKey].status = results[frameworkKey].details.every(
        (detail) => detail.status === 'passed'
      );
    }

    // Overall compliance status
    results.overall =
      results.lgpd.status && results.anvisa.status && results.cfm.status;

    // Generate compliance report
    generateComplianceReport(results);

    if (results.overall) {
    } else {
      process.exit(1);
    }
  } catch (_error) {
    process.exit(1);
  }
}

function generateComplianceReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    neonproVersion: '1.0.0',
    complianceFrameworks: COMPLIANCE_FRAMEWORKS,
    verificationResults: results,
    recommendations: generateComplianceRecommendations(results),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'compliance-report.json'),
    JSON.stringify(report, null, 2)
  );
}

function generateComplianceRecommendations(results) {
  const recommendations = [];

  if (!results.lgpd.status) {
    recommendations.push(
      'LGPD: Review data protection and privacy compliance measures'
    );
  }

  if (!results.anvisa.status) {
    recommendations.push(
      'ANVISA: Validate medical treatment and device compliance'
    );
  }

  if (!results.cfm.status) {
    recommendations.push(
      'CFM: Ensure medical professional and telemedicine compliance'
    );
  }

  if (!results.overall) {
    recommendations.push(
      'CRITICAL: Immediate compliance review required before production deployment'
    );
  }

  return recommendations;
}

// Run compliance verification
verifyCompliance().catch(console.error);
