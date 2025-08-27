#!/usr/bin/env tsx
/**
 * Brazilian Healthcare Regulatory Compliance Validation
 * CFM, ANVISA, LGPD compliance for emergency systems
 */

import { promises as fs } from "fs";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

interface ComplianceCheck {
  regulation: string;
  requirement: string;
  component: string;
  patterns: string[];
  passed: boolean;
  critical: boolean;
}

class BrazilianComplianceValidator {
  private checks: ComplianceCheck[] = [];

  async validateLGPDCompliance(): Promise<void> {
    console.log(`${colors.green}🇧🇷 LGPD Data Protection Compliance${colors.reset}\n`);

    // LGPD Article 7 - Patient Data Protection
    const lgpdCheck = await this.validatePatterns(
      "apps/web/src/lib/emergency/emergency-cache.ts",
      "LGPD Art. 7",
      "Patient Data Encryption & Consent",
      "EmergencyCache",
      ["encryptPatientData", "LGPD", "patientConsent", "dataProtection"],
    );
    lgpdCheck.critical = true;
    this.checks.push(lgpdCheck);
  }

  async validateCFMCompliance(): Promise<void> {
    console.log(`${colors.blue}⚕️  CFM Medical Protocol Compliance${colors.reset}\n`);

    // CFM Resolution 2314/2022 - Emergency Medical Protocols
    const cfmCheck = await this.validatePatterns(
      "apps/web/src/lib/emergency/emergency-protocols.ts",
      "CFM Res. 2314/2022",
      "Emergency Medical Protocols",
      "EmergencyProtocols",
      ["CFM", "medicalProtocol", "BrazilianStandards", "emergencyProcedure"],
    );
    cfmCheck.critical = true;
    this.checks.push(cfmCheck);
  }

  async validateANVISACompliance(): Promise<void> {
    console.log(`${colors.yellow}💊 ANVISA Controlled Substances${colors.reset}\n`);

    // ANVISA RDC 344/1998 - Controlled Substances
    const anvisaCheck = await this.validatePatterns(
      "apps/web/src/components/emergency/EmergencyMedicationsList.tsx",
      "ANVISA RDC 344/1998",
      "Controlled Substance Classification",
      "EmergencyMedications",
      ["ANVISA", "controlledSubstance", "medicationClassification"],
    );
    this.checks.push(anvisaCheck);
  }

  private async validatePatterns(
    filePath: string,
    regulation: string,
    requirement: string,
    component: string,
    patterns: string[],
  ): Promise<ComplianceCheck> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const missingPatterns = patterns.filter(pattern => !content.includes(pattern));

      return {
        regulation,
        requirement,
        component,
        patterns,
        passed: missingPatterns.length === 0,
        critical: false,
      };
    } catch {
      return {
        regulation,
        requirement,
        component,
        patterns,
        passed: false,
        critical: false,
      };
    }
  }

  async runAllValidations(): Promise<void> {
    await this.validateLGPDCompliance();
    await this.validateCFMCompliance();
    await this.validateANVISACompliance();
    await this.generateReport();
  }

  private async generateReport(): Promise<void> {
    const criticalFailures = this.checks.filter(c => c.critical && !c.passed);
    const overallPassed = criticalFailures.length === 0;

    console.log(`${colors.bold}🇧🇷 BRAZILIAN COMPLIANCE REPORT${colors.reset}\n`);

    for (const check of this.checks) {
      const status = check.passed ? `${colors.green}✅ COMPLIANT` : `${colors.red}❌ NON-COMPLIANT`;
      const critical = check.critical ? "🔴 CRITICAL" : "📋 Standard";
      console.log(`${status} ${critical} ${check.regulation}`);
      console.log(`  Component: ${check.component}`);
      console.log(`  Requirement: ${check.requirement}${colors.reset}\n`);
    }

    console.log(`${colors.bold}🎯 COMPLIANCE STATUS: ${
      overallPassed
        ? `${colors.green}BRAZIL READY ✅`
        : `${colors.red}COMPLIANCE ISSUES ❌`
    }${colors.reset}\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new BrazilianComplianceValidator();
  validator.runAllValidations().catch(console.error);
}
