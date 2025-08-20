#!/usr/bin/env node
/**
 * NeonPro Healthcare Compliance Validation Script
 * Validates LGPD, ANVISA, and CFM compliance readiness
 * Fase 3.4 - Production Deployment Validation
 */

const fs = require('node:fs');
const path = require('node:path');

class ComplianceValidator {
  constructor() {
    this.issues = [];
    this.validations = [];
    this.rootDir = process.cwd();
  }

  log(message, type = 'info') {
    const _timestamp = new Date().toISOString();
    const _prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';

    if (type === 'error') {
      this.issues.push(message);
    } else {
      this.validations.push(message);
    }
  }

  checkLGPDCompliance() {
    this.log('=== LGPD COMPLIANCE VALIDATION ===');

    // Check for consent management
    const consentFiles = [
      'lib/compliance/consent-manager.ts',
      'components/consent/ConsentBanner.tsx',
      'app/api/consent/route.ts',
    ];

    consentFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`LGPD Consent file exists: ${file}`);
      } else {
        this.log(`LGPD Consent file missing: ${file}`, 'error');
      }
    });

    // Check for data subject rights implementation
    const dataRightsFiles = [
      'app/api/lgpd/data-subject-rights/route.ts',
      'lib/compliance/data-subject-rights.ts',
      'app/privacy/data-request/page.tsx',
    ];

    dataRightsFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`LGPD Data Rights file exists: ${file}`);
      } else {
        this.log(`LGPD Data Rights file missing: ${file}`, 'error');
      }
    });

    // Check for privacy policy and terms
    if (fs.existsSync(path.join(this.rootDir, 'app/privacy/page.tsx'))) {
      this.log('LGPD Privacy Policy page exists');
    } else {
      this.log('LGPD Privacy Policy page missing', 'error');
    }
  }

  checkANVISACompliance() {
    this.log('=== ANVISA COMPLIANCE VALIDATION ===');

    // Check for product registration tracking
    const anvisaFiles = [
      'lib/compliance/anvisa-integration.ts',
      'database/tables/anvisa_products.sql',
      'app/api/anvisa/products/route.ts',
    ];

    anvisaFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`ANVISA file exists: ${file}`);
      } else {
        this.log(`ANVISA file missing: ${file}`, 'error');
      }
    });

    // Check for adverse event reporting
    const adverseEventFiles = [
      'lib/compliance/adverse-events.ts',
      'app/api/anvisa/adverse-events/route.ts',
      'components/forms/AdverseEventForm.tsx',
    ];

    adverseEventFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`ANVISA Adverse Event file exists: ${file}`);
      } else {
        this.log(`ANVISA Adverse Event file missing: ${file}`, 'warning');
      }
    });
  }

  checkCFMCompliance() {
    this.log('=== CFM COMPLIANCE VALIDATION ===');

    // Check for professional licensing
    const cfmFiles = [
      'lib/compliance/cfm-integration.ts',
      'database/tables/cfm_professionals.sql',
      'app/api/cfm/professionals/route.ts',
    ];

    cfmFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`CFM file exists: ${file}`);
      } else {
        this.log(`CFM file missing: ${file}`, 'error');
      }
    });

    // Check for digital signature and electronic prescription
    const digitalFiles = [
      'lib/compliance/digital-signature.ts',
      'lib/compliance/electronic-prescription.ts',
      'components/prescription/EPrescriptionForm.tsx',
    ];

    digitalFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`CFM Digital file exists: ${file}`);
      } else {
        this.log(`CFM Digital file missing: ${file}`, 'warning');
      }
    });
  }

  checkSecurityCompliance() {
    this.log('=== SECURITY COMPLIANCE VALIDATION ===');

    // Check for authentication and authorization
    const authFiles = [
      'lib/auth/supabase.ts',
      'middleware.ts',
      'lib/auth/rbac.ts',
    ];

    authFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`Security file exists: ${file}`);
      } else {
        this.log(`Security file missing: ${file}`, 'error');
      }
    });

    // Check for encryption and data protection
    const encryptionFiles = [
      'lib/security/encryption.ts',
      'lib/security/data-classification.ts',
      'lib/security/audit-logging.ts',
    ];

    encryptionFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`Encryption file exists: ${file}`);
      } else {
        this.log(`Encryption file missing: ${file}`, 'warning');
      }
    });
  }

  checkDatabaseCompliance() {
    this.log('=== DATABASE COMPLIANCE VALIDATION ===');

    // Check for RLS policies
    const rlsFiles = [
      'database/policies/rls-policies.sql',
      'infrastructure/database/migrations/20231201000000_rls_setup.sql',
    ];

    rlsFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`RLS policy file exists: ${file}`);
      } else {
        this.log(`RLS policy file missing: ${file}`, 'error');
      }
    });

    // Check for audit tables
    const auditFiles = [
      'database/tables/audit_logs.sql',
      'database/triggers/audit_triggers.sql',
    ];

    auditFiles.forEach((file) => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.log(`Audit file exists: ${file}`);
      } else {
        this.log(`Audit file missing: ${file}`, 'warning');
      }
    });
  }

  generateReport() {
    this.log('=== COMPLIANCE VALIDATION REPORT ===');

    const totalChecks = this.validations.length + this.issues.length;
    const passedChecks = this.validations.length;
    const failedChecks = this.issues.length;
    const complianceScore = Math.round((passedChecks / totalChecks) * 100);

    this.log(`Total Checks: ${totalChecks}`);
    this.log(`Passed: ${passedChecks}`);
    this.log(`Failed: ${failedChecks}`);
    this.log(`Compliance Score: ${complianceScore}%`);

    const report = {
      timestamp: new Date().toISOString(),
      totalChecks,
      passedChecks,
      failedChecks,
      complianceScore,
      validations: this.validations,
      issues: this.issues,
      recommendations: this.getRecommendations(),
    };

    // Save report
    fs.writeFileSync(
      path.join(this.rootDir, 'compliance-validation-report.json'),
      JSON.stringify(report, null, 2)
    );

    this.log('Compliance report saved to: compliance-validation-report.json');

    if (complianceScore >= 80) {
      this.log(`✅ COMPLIANCE READY FOR PRODUCTION (${complianceScore}%)`);
    } else if (complianceScore >= 60) {
      this.log(
        `⚠️ COMPLIANCE NEEDS IMPROVEMENT (${complianceScore}%)`,
        'warning'
      );
    } else {
      this.log(
        `❌ COMPLIANCE NOT READY FOR PRODUCTION (${complianceScore}%)`,
        'error'
      );
    }

    return report;
  }

  getRecommendations() {
    const recommendations = [];

    if (this.issues.length > 0) {
      recommendations.push(
        'Resolve all critical compliance issues before production deployment'
      );
    }

    if (this.issues.some((issue) => issue.includes('LGPD'))) {
      recommendations.push(
        'Implement complete LGPD compliance framework (consent, data rights, privacy)'
      );
    }

    if (this.issues.some((issue) => issue.includes('Security'))) {
      recommendations.push(
        'Complete security implementation (auth, encryption, audit logging)'
      );
    }

    if (this.issues.some((issue) => issue.includes('RLS'))) {
      recommendations.push(
        'Implement Row Level Security policies for all sensitive tables'
      );
    }

    recommendations.push('Conduct comprehensive security audit before go-live');
    recommendations.push(
      'Setup monitoring and alerting for compliance violations'
    );
    recommendations.push('Schedule regular compliance reviews and updates');

    return recommendations;
  }

  async run() {
    this.log('🏥 Starting NeonPro Healthcare Compliance Validation...');
    this.log(`Working directory: ${this.rootDir}`);

    this.checkLGPDCompliance();
    this.checkANVISACompliance();
    this.checkCFMCompliance();
    this.checkSecurityCompliance();
    this.checkDatabaseCompliance();

    const report = this.generateReport();
    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new ComplianceValidator();
  validator
    .run()
    .then((report) => {
      if (report.complianceScore < 80) {
        process.exit(1);
      }
    })
    .catch((_error) => {
      process.exit(1);
    });
}

module.exports = ComplianceValidator;
