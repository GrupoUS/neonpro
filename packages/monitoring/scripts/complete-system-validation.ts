#!/usr/bin/env tsx

/**
 * Complete System Validation Script
 * Validates Archon integration and all healthcare components
 * Run: npx tsx scripts/validation/complete-system-validation.ts
 */

import fs from "node:fs/promises";

// Validation results interface
interface ValidationResult {
  component: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, any>;
}

class SystemValidator {
  private readonly results: ValidationResult[] = [];

  async validate(): Promise<void> {
    await this.validateFileStructure();
    await this.validateAgentConfiguration();
    await this.validateArchonIntegration();
    await this.validateComplianceModules();
    await this.validateSecurityComponents();
    await this.validateDashboardComponents();
    await this.validateAPIEndpoints();

    this.generateReport();
  }

  private async validateFileStructure(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check critical directories
    const criticalPaths = [
      ".bmad-core",
      ".bmad-core/agents",
      ".bmad-core/workflows",
      ".bmad-core/templates",
      "packages/compliance/src/utils",
      "apps/web/lib/ai-scheduling.ts",
      "apps/web/components/dashboard",
    ];

    for (const checkPath of criticalPaths) {
      try {
        await fs.access(checkPath);
      } catch {
        errors.push(`Missing critical path: ${checkPath}`);
      }
    }

    // Check agent files
    const agentFiles = ["sm-agent.yaml", "dev-agent.yaml", "qa-agent.yaml"];
    for (const agent of agentFiles) {
      try {
        await fs.access(`.bmad-core/agents/${agent}`);
      } catch {
        errors.push(`Missing agent file: ${agent}`);
      }
    }

    this.results.push({
      component: "File Structure",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateAgentConfiguration(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate core config
      const coreConfig = await fs.readFile(
        ".bmad-core/core-config.yaml",
        "utf8",
      );
      if (!coreConfig.includes("neonpro-healthcare")) {
        errors.push(
          "Agent core config missing healthcare domain specification",
        );
      }

      // Validate workflow configuration
      const workflowPath = ".bmad-core/workflows/sm-dev-qa-cycle.yaml";
      const workflow = await fs.readFile(workflowPath, "utf8");
      if (!workflow.includes("archon_actions")) {
        errors.push("Workflow missing Archon integration points");
      }

      // Validate task template
      const template = await fs.readFile(
        ".bmad-core/templates/archon-task-template.yaml",
        "utf8",
      );
      if (!template.includes("healthcare_compliance")) {
        warnings.push(
          "Task template should include healthcare compliance requirements",
        );
      }
    } catch (error) {
      errors.push(`Failed to read agent configuration: ${error}`);
    }

    this.results.push({
      component: "Agent Configuration",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateArchonIntegration(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for MCP configuration
    try {
      const mcpConfig = await fs.readFile(".mcp.json", "utf8");
      const config = JSON.parse(mcpConfig);

      if (!config.mcpServers?.archon) {
        errors.push("Archon MCP server not configured");
      }

      // Check if Archon tools are properly integrated
      const archonTools = [
        "manage_project",
        "manage_task",
        "manage_document",
        "perform_rag_query",
      ];
      for (const tool of archonTools) {
        if (!mcpConfig.includes(tool)) {
          warnings.push(`Archon tool ${tool} may not be properly integrated`);
        }
      }
    } catch (error) {
      errors.push(`Failed to validate MCP configuration: ${error}`);
    }

    this.results.push({
      component: "Archon Integration",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateComplianceModules(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check compliance utilities
    const complianceUtils = [
      "packages/compliance/src/utils/compliance-helpers.ts",
      "packages/compliance/src/utils/audit-utils.ts",
      "packages/compliance/src/utils/validation-helpers.ts",
    ];

    for (const util of complianceUtils) {
      try {
        const content = await fs.readFile(util, "utf8");

        // Check for critical functions
        if (
          util.includes("compliance-helpers") &&
          !(content.includes("validateCPF") && content.includes("validateCNPJ"))
        ) {
          errors.push(
            "Compliance helpers missing Brazilian validation functions",
          );
        }

        if (
          util.includes("audit-utils") &&
          !(
            content.includes("createAuditLog") && content.includes("LGPD_BASIS")
          )
        ) {
          errors.push("Audit utils missing LGPD compliance functions");
        }
      } catch {
        errors.push(`Missing compliance utility: ${util}`);
      }
    }

    this.results.push({
      component: "Compliance Modules",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateSecurityComponents(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check MFA service
      const mfaService = await fs.readFile(
        "packages/security/src/auth/mfa-service.ts",
        "utf8",
      );
      if (!(mfaService.includes("TOTP") && mfaService.includes("healthcare"))) {
        warnings.push("MFA service may not be healthcare-optimized");
      }

      // Check if stock alerts have proper user context
      const stockAlerts = await fs.readFile(
        "apps/web/app/api/stock/alerts/route.ts",
        "utf8",
      );
      if (stockAlerts.includes("testClinicId")) {
        errors.push(
          "Stock alerts still using test clinic ID instead of user context",
        );
      }

      if (!stockAlerts.includes("getUserClinicContext")) {
        errors.push("Stock alerts missing user clinic context validation");
      }
    } catch (error) {
      errors.push(`Failed to validate security components: ${error}`);
    }

    this.results.push({
      component: "Security Components",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateDashboardComponents(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check healthcare dashboard
      const healthcareDashboard = await fs.readFile(
        "apps/web/components/dashboard/healthcare-dashboard.tsx",
        "utf8",
      );

      if (
        !(
          healthcareDashboard.includes("LGPD") &&
          healthcareDashboard.includes("audit")
        )
      ) {
        warnings.push(
          "Healthcare dashboard may not include proper compliance features",
        );
      }

      // Check AI scheduling integration
      const aiScheduling = await fs.readFile(
        "apps/web/lib/ai-scheduling.ts",
        "utf8",
      );
      if (
        !(
          aiScheduling.includes("createAuditLog") &&
          aiScheduling.includes("validateHealthcareAccess")
        )
      ) {
        errors.push("AI scheduling missing compliance integration");
      }
    } catch (error) {
      errors.push(`Failed to validate dashboard components: ${error}`);
    }

    this.results.push({
      component: "Dashboard Components",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private async validateAPIEndpoints(): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if critical API endpoints exist
    const apiEndpoints = [
      "apps/web/app/api/ai/predictions/route.ts",
      "apps/web/app/api/stock/alerts/route.ts",
      "apps/web/app/api/auth/webauthn/credentials/route.ts",
    ];

    for (const endpoint of apiEndpoints) {
      try {
        await fs.access(endpoint);
      } catch {
        errors.push(`Missing API endpoint: ${endpoint}`);
      }
    }

    this.results.push({
      component: "API Endpoints",
      passed: errors.length === 0,
      errors,
      warnings,
    });
  }

  private generateReport(): void {
    let totalPassed = 0;
    const totalComponents = this.results.length;
    let _criticalErrors = 0;

    for (const result of this.results) {
      const _status = result.passed ? "✅" : "❌";

      if (result.passed) {
        totalPassed++;
      } else {
        _criticalErrors += result.errors.length;
      }

      if (result.errors.length > 0) {
        result.errors.forEach((_error) => {});
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach((_warning) => {});
      }
    }

    const successRate = (totalPassed / totalComponents) * 100;

    if (successRate >= 90) {
    } else if (successRate >= 70) {
    } else {
    }

    // Save report to file
    this.saveReportToFile();
  }

  private async saveReportToFile(): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total_components: this.results.length,
        passed: this.results.filter((r) => r.passed).length,
        failed: this.results.filter((r) => !r.passed).length,
        success_rate:
          (this.results.filter((r) => r.passed).length / this.results.length) *
          100,
      },
    };

    try {
      await fs.writeFile(
        "validation-report.json",
        JSON.stringify(reportData, undefined, 2),
      );
    } catch {}
  }
}

// Execute validation
if (require.main === module) {
  const validator = new SystemValidator();
  validator.validate().catch(console.error);
}

export { SystemValidator };
