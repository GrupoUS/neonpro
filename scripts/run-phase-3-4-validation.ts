#!/usr/bin/env tsx
/**
 * Phase 3.4 Master Validation Runner
 * Brazilian Mobile Emergency Interface Implementation
 *
 * CRITICAL SYSTEMS VALIDATION:
 * - Emergency data access < 100ms (life-threatening)
 * - SAMU 192 integration (Brazilian emergency services)
 * - Brazilian regulatory compliance (CFM, ANVISA, LGPD)
 * - WCAG 2.1 AAA+ accessibility (emergency scenarios)
 * - Mobile-first emergency interface design
 */

import { spawn } from "child_process";
import { promises as fs } from "fs";
import { performance } from "perf_hooks";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

interface ValidationScript {
  name: string;
  file: string;
  critical: boolean;
  description: string;
  requirements: string[];
}

interface ValidationResult {
  script: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
  critical: boolean;
}

class Phase34ValidationRunner {
  private validationScripts: ValidationScript[] = [
    {
      name: "Emergency Performance",
      file: "validate-emergency-performance.ts",
      critical: true,
      description: "Critical data access < 100ms for life-threatening situations",
      requirements: [
        "<100ms emergency data",
        "<50ms critical alerts",
        "<75ms SAMU dial",
        "<25ms cache access",
      ],
    },
    {
      name: "Comprehensive System",
      file: "validate-phase-3-4.ts",
      critical: true,
      description: "Complete emergency system integration and architecture",
      requirements: [
        "All components exist",
        "Integration points",
        "Type definitions",
        "Performance optimization",
      ],
    },
    {
      name: "Brazilian Compliance",
      file: "validate-brazilian-compliance.ts",
      critical: true,
      description: "CFM, ANVISA, LGPD regulatory compliance",
      requirements: [
        "LGPD data protection",
        "CFM medical protocols",
        "ANVISA controlled substances",
      ],
    },
    {
      name: "Emergency Accessibility",
      file: "validate-emergency-accessibility.ts",
      critical: true,
      description: "WCAG 2.1 AAA+ compliance for emergency scenarios",
      requirements: [
        "56px touch targets",
        "21:1 contrast ratio",
        "Screen reader support",
        "Voice commands",
      ],
    },
  ];

  private results: ValidationResult[] = [];
  private startTime: number = 0;

  constructor() {
    console.log(
      `${colors.cyan}${colors.bold}🚨 PHASE 3.4 - BRAZILIAN MOBILE EMERGENCY INTERFACE${colors.reset}`,
    );
    console.log(
      `${colors.cyan}${colors.bold}🏥 CRITICAL HEALTHCARE SYSTEMS VALIDATION${colors.reset}`,
    );
    console.log(
      `${colors.dim}Mobile Emergency Interface Implementation - Life-Critical Systems${colors.reset}\n`,
    );
  }

  async runAllValidations(): Promise<void> {
    this.startTime = performance.now();

    console.log(
      `${colors.yellow}🚀 Starting comprehensive Phase 3.4 validation...${colors.reset}\n`,
    );

    // Display validation plan
    await this.displayValidationPlan();

    // Run each validation script
    for (const script of this.validationScripts) {
      console.log(`${colors.blue}▶️  Running ${script.name}...${colors.reset}`);
      const result = await this.runValidationScript(script);
      this.results.push(result);

      if (result.critical && !result.passed) {
        console.log(`${colors.red}🔴 CRITICAL FAILURE in ${script.name}${colors.reset}\n`);
      } else if (result.passed) {
        console.log(`${colors.green}✅ ${script.name} completed successfully${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⚠️  ${script.name} completed with issues${colors.reset}\n`);
      }
    }

    await this.generateMasterReport();
  }

  private async displayValidationPlan(): Promise<void> {
    console.log(`${colors.bold}📋 VALIDATION PLAN - CRITICAL EMERGENCY SYSTEMS${colors.reset}\n`);

    for (let i = 0; i < this.validationScripts.length; i++) {
      const script = this.validationScripts[i];
      const criticalBadge = script.critical ? "🔴 CRITICAL" : "📋 Standard";

      console.log(`${i + 1}. ${colors.bold}${script.name}${colors.reset} ${criticalBadge}`);
      console.log(`   ${colors.dim}${script.description}${colors.reset}`);
      console.log(`   Requirements: ${script.requirements.join(", ")}\n`);
    }

    console.log(`${colors.yellow}⚠️  CRITICAL NOTICE:${colors.reset}`);
    console.log(`These validations test life-critical emergency systems.`);
    console.log(`ALL critical validations must pass before deployment.\n`);
    console.log(`${colors.dim}Press ENTER to continue or Ctrl+C to abort...${colors.reset}`);

    // Wait for user confirmation in interactive mode
    if (process.stdin.isTTY) {
      await new Promise((resolve) => {
        process.stdin.once("data", () => resolve(undefined));
      });
    }

    console.log(`${colors.green}🚀 Starting validation sequence...${colors.reset}\n`);
  }

  private async runValidationScript(script: ValidationScript): Promise<ValidationResult> {
    const start = performance.now();

    return new Promise((resolve) => {
      const scriptPath = `scripts/${script.file}`;
      const process = spawn("npx", ["tsx", scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      });

      let output = "";
      let error = "";

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        error += data.toString();
      });

      process.on("close", (code) => {
        const duration = performance.now() - start;
        const passed = code === 0 && !error.includes("FAILED") && !error.includes("ERROR");

        resolve({
          script: script.name,
          passed,
          duration,
          output,
          error: error || undefined,
          critical: script.critical,
        });
      });

      process.on("error", (err) => {
        const duration = performance.now() - start;
        resolve({
          script: script.name,
          passed: false,
          duration,
          output: "",
          error: err.message,
          critical: script.critical,
        });
      });
    });
  }

  private async generateMasterReport(): Promise<void> {
    const totalDuration = performance.now() - this.startTime;
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;
    const criticalFailures = this.results.filter(r => !r.passed && r.critical).length;

    console.log(
      `\n${colors.cyan}${colors.bold}📊 PHASE 3.4 MASTER VALIDATION REPORT${colors.reset}`,
    );
    console.log(
      `${colors.cyan}${colors.bold}🏥 Brazilian Mobile Emergency Interface Implementation${colors.reset}\n`,
    );

    // Executive Summary
    const overallStatus = criticalFailures === 0 && passedTests === totalTests;
    console.log(`${colors.bold}🎯 OVERALL STATUS: ${
      overallStatus
        ? `${colors.green}EMERGENCY DEPLOYMENT READY ✅${colors.reset}`
        : `${colors.red}CRITICAL ISSUES - DEPLOYMENT BLOCKED ❌${colors.reset}`
    }${colors.reset}\n`);

    // Critical Systems Status
    console.log(`${colors.bold}🚨 CRITICAL SYSTEMS STATUS:${colors.reset}`);
    console.log(`• Total Validations: ${totalTests}`);
    console.log(`• Passed: ${colors.green}${passedTests}${colors.reset}`);
    console.log(
      `• Failed: ${
        failedTests > 0 ? `${colors.red}${failedTests}` : `${colors.green}0`
      }${colors.reset}`,
    );
    console.log(
      `• Critical Failures: ${
        criticalFailures > 0 ? `${colors.red}${criticalFailures} ⚠️` : `${colors.green}0 ✅`
      }${colors.reset}`,
    );
    console.log(`• Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

    // Individual Script Results
    console.log(`${colors.bold}📋 VALIDATION SCRIPT RESULTS:${colors.reset}\n`);
    for (const result of this.results) {
      const status = result.passed
        ? `${colors.green}✅ PASSED`
        : `${colors.red}❌ FAILED`;
      const critical = result.critical ? "🔴 CRITICAL" : "📋 Standard";
      const duration = `${(result.duration / 1000).toFixed(2)}s`;

      console.log(`${status} ${critical} ${result.script} (${duration})`);

      if (!result.passed && result.error) {
        console.log(`${colors.red}  Error: ${result.error}${colors.reset}`);
      }

      console.log("");
    }

    // Critical Requirements Assessment
    console.log(`${colors.bold}🎯 CRITICAL REQUIREMENTS ASSESSMENT:${colors.reset}`);
    console.log(
      `• Emergency Data Access < 100ms: ${this.getRequirementStatus("Emergency Performance")}`,
    );
    console.log(`• SAMU 192 Integration: ${this.getRequirementStatus("Comprehensive System")}`);
    console.log(
      `• Brazilian Regulatory Compliance: ${this.getRequirementStatus("Brazilian Compliance")}`,
    );
    console.log(
      `• WCAG 2.1 AAA+ Accessibility: ${this.getRequirementStatus("Emergency Accessibility")}`,
    );

    // Deployment Decision
    console.log(`\n${colors.bold}🚀 DEPLOYMENT DECISION:${colors.reset}`);
    if (overallStatus) {
      console.log(
        `${colors.green}${colors.bold}✅ PHASE 3.4 APPROVED FOR DEPLOYMENT${colors.reset}`,
      );
      console.log(
        `${colors.green}Brazilian Mobile Emergency Interface is ready for production.${colors.reset}`,
      );
      console.log(
        `${colors.green}All critical emergency systems meet life-safety requirements.${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.red}${colors.bold}❌ DEPLOYMENT BLOCKED - CRITICAL ISSUES${colors.reset}`,
      );
      console.log(
        `${colors.red}Emergency systems have critical failures that must be resolved.${colors.reset}`,
      );
      console.log(
        `${colors.red}Lives may be at risk - immediate remediation required.${colors.reset}`,
      );
    }

    // Save comprehensive report
    await this.saveDetailedReport(
      overallStatus,
      totalTests,
      passedTests,
      failedTests,
      criticalFailures,
      totalDuration,
    );
  }

  private getRequirementStatus(scriptName: string): string {
    const result = this.results.find(r => r.script === scriptName);
    if (!result) return `${colors.yellow}NOT TESTED ⚠️${colors.reset}`;
    return result.passed
      ? `${colors.green}COMPLIANT ✅${colors.reset}`
      : `${colors.red}FAILED ❌${colors.reset}`;
  }

  private async saveDetailedReport(
    overallStatus: boolean,
    totalTests: number,
    passedTests: number,
    failedTests: number,
    criticalFailures: number,
    totalDuration: number,
  ): Promise<void> {
    const reportDir = "validation-reports";
    const reportFile = `${reportDir}/phase-3-4-master-report.json`;

    try {
      await fs.mkdir(reportDir, { recursive: true });

      const masterReport = {
        phase: "3.4",
        title: "Brazilian Mobile Emergency Interface Implementation",
        timestamp: new Date().toISOString(),
        deploymentStatus: {
          approved: overallStatus,
          ready: overallStatus && criticalFailures === 0,
          blockers: criticalFailures,
        },
        summary: {
          totalTests,
          passed: passedTests,
          failed: failedTests,
          criticalFailures,
          successRate: Math.round((passedTests / totalTests) * 100),
          duration: Math.round(totalDuration),
        },
        criticalSystems: {
          emergencyPerformance: this.getRequirementStatus("Emergency Performance").includes(
            "COMPLIANT",
          ),
          samuIntegration: this.getRequirementStatus("Comprehensive System").includes("COMPLIANT"),
          brazilianCompliance: this.getRequirementStatus("Brazilian Compliance").includes(
            "COMPLIANT",
          ),
          accessibilityCompliance: this.getRequirementStatus("Emergency Accessibility").includes(
            "COMPLIANT",
          ),
        },
        validationResults: this.results.map(result => ({
          script: result.script,
          passed: result.passed,
          duration: Math.round(result.duration),
          critical: result.critical,
          hasError: !!result.error,
        })),
        recommendations: overallStatus
          ? [
            "Deploy to production",
            "Monitor emergency system performance",
            "Conduct user training",
          ]
          : [
            "Resolve critical failures immediately",
            "Re-run validations",
            "Do not deploy until all critical tests pass",
          ],
      };

      await fs.writeFile(reportFile, JSON.stringify(masterReport, null, 2), "utf-8");
      console.log(`\n📄 Master validation report saved: ${reportFile}`);

      // Also save a human-readable summary
      const summaryFile = `${reportDir}/phase-3-4-summary.md`;
      const summaryContent = this.generateMarkdownSummary(masterReport);
      await fs.writeFile(summaryFile, summaryContent, "utf-8");
      console.log(`📄 Human-readable summary saved: ${summaryFile}`);
    } catch (error) {
      console.error(`❌ Failed to save master report: ${error}`);
    }
  }

  private generateMarkdownSummary(report: any): string {
    return `# Phase 3.4 - Brazilian Mobile Emergency Interface Validation

## 🎯 Deployment Status: ${report.deploymentStatus.approved ? "✅ APPROVED" : "❌ BLOCKED"}

**Generated:** ${report.timestamp}  
**Success Rate:** ${report.summary.successRate}%  
**Critical Failures:** ${report.summary.criticalFailures}

## 🚨 Critical Systems Status

- **Emergency Performance:** ${
      report.criticalSystems.emergencyPerformance ? "✅ PASSED" : "❌ FAILED"
    }
- **SAMU Integration:** ${report.criticalSystems.samuIntegration ? "✅ PASSED" : "❌ FAILED"}  
- **Brazilian Compliance:** ${
      report.criticalSystems.brazilianCompliance ? "✅ PASSED" : "❌ FAILED"
    }
- **Accessibility:** ${report.criticalSystems.accessibilityCompliance ? "✅ PASSED" : "❌ FAILED"}

## 📊 Validation Summary

- **Total Tests:** ${report.summary.totalTests}
- **Passed:** ${report.summary.passed}  
- **Failed:** ${report.summary.failed}
- **Duration:** ${(report.summary.duration / 1000).toFixed(2)}s

## 🚀 Recommendations

${report.recommendations.map((rec: string) => `- ${rec}`).join("\n")}

---

*This report validates life-critical emergency systems for Brazilian healthcare deployment.*
`;
  }
}

// Execute master validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new Phase34ValidationRunner();
  runner.runAllValidations().catch(console.error);
}

export { Phase34ValidationRunner };
