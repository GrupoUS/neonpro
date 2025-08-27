#!/usr/bin/env node

/**
 * Performance Regression Detection Script
 * Detects performance regressions by comparing current metrics against baseline
 */

const fs = require("fs").promises;
const path = require("path");

class RegressionDetector {
  constructor() {
    this.baselineMetricsFile = "performance-baseline.json";
    this.currentMetricsFile = "healthcare-metrics.json";
    this.regressionThresholds = {
      // Performance regression thresholds (% increase)
      critical: 25, // 25% worse is critical
      warning: 15, // 15% worse is warning
      minor: 10, // 10% worse is minor
    };

    this.healthcareMetricsWeight = {
      // Weight different metrics by healthcare importance
      patient_data_load_time: 1.0,
      emergency_access_time: 1.5, // Emergency access is most critical
      medical_record_access_time: 1.2,
      appointment_scheduling_time: 0.8,
      ai_response_time: 0.9,
      database_query_time: 1.1,
    };

    this.regressions = [];
    this.improvements = [];
    this.status = "UNKNOWN";
  }

  async loadBaseline() {
    try {
      const baselinePath = path.join(process.cwd(), this.baselineMetricsFile);
      const baselineData = await fs.readFile(baselinePath, "utf8");
      return JSON.parse(baselineData);
    } catch (error) {
      // console.warn(
        `⚠️ Warning: Could not load baseline metrics from ${this.baselineMetricsFile}`,
      );
      // console.warn(
        "This might be the first run. Creating baseline from current metrics.",
      );
      return null;
    }
  }

  async loadCurrentMetrics() {
    try {
      const currentPath = path.join(process.cwd(), this.currentMetricsFile);
      const currentData = await fs.readFile(currentPath, "utf8");
      return JSON.parse(currentData);
    } catch (error) {
      // console.error(
        `❌ Error: Could not load current metrics from ${this.currentMetricsFile}`,
      );
      // console.error("Make sure to run collect-healthcare-metrics.js first");
      throw error;
    }
  }

  async createBaseline(currentMetrics) {
    // console.log("📊 Creating new performance baseline...");

    const baseline = {
      created_at: new Date().toISOString(),
      version: currentMetrics.version || "1.0.0",
      environment: currentMetrics.environment || "production",
      performance: currentMetrics.performance,
      accessibility: currentMetrics.accessibility,
      security: currentMetrics.security,
      healthcare_specific: currentMetrics.healthcare_specific,
    };

    const baselinePath = path.join(process.cwd(), this.baselineMetricsFile);
    await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));

    // console.log(`✅ Baseline created and saved to ${this.baselineMetricsFile}`);
    return baseline;
  }

  comparePerformanceMetrics(baseline, current) {
    // console.log("🔍 Comparing performance metrics...");

    const baselinePerf = baseline.performance?.metrics || {};
    const currentPerf = current.performance?.metrics || {};

    Object.keys(baselinePerf).forEach((metric) => {
      if (currentPerf[metric] !== undefined) {
        const baselineValue = baselinePerf[metric];
        const currentValue = currentPerf[metric];
        const percentageChange = ((currentValue - baselineValue) / baselineValue) * 100;
        const weight = this.healthcareMetricsWeight[metric] || 1.0;
        const weightedChange = percentageChange * weight;

        const comparison = {
          metric,
          baseline_value: baselineValue,
          current_value: currentValue,
          absolute_change: currentValue - baselineValue,
          percentage_change: Math.round(percentageChange * 100) / 100,
          weighted_change: Math.round(weightedChange * 100) / 100,
          weight,
          severity: this.calculateSeverity(percentageChange),
          healthcare_impact: this.assessHealthcareImpact(
            metric,
            percentageChange,
          ),
        };

        if (percentageChange > this.regressionThresholds.minor) {
          this.regressions.push(comparison);
        } else if (percentageChange < -5) {
          // 5% improvement
          this.improvements.push(comparison);
        }
      }
    });
  }

  calculateSeverity(percentageChange) {
    if (percentageChange >= this.regressionThresholds.critical) {
      return "CRITICAL";
    } else if (percentageChange >= this.regressionThresholds.warning) {
      return "WARNING";
    } else if (percentageChange >= this.regressionThresholds.minor) {
      return "MINOR";
    } else if (percentageChange < -15) {
      return "MAJOR_IMPROVEMENT";
    } else if (percentageChange < -5) {
      return "IMPROVEMENT";
    }
    return "STABLE";
  }

  assessHealthcareImpact(metric, percentageChange) {
    const impacts = {
      emergency_access_time: {
        critical: "PATIENT_SAFETY_RISK",
        warning: "EMERGENCY_RESPONSE_DELAY",
        minor: "WORKFLOW_SLOWDOWN",
      },
      patient_data_load_time: {
        critical: "CLINICAL_WORKFLOW_DISRUPTION",
        warning: "PROVIDER_EFFICIENCY_LOSS",
        minor: "USER_EXPERIENCE_DEGRADATION",
      },
      medical_record_access_time: {
        critical: "CARE_DELIVERY_IMPACT",
        warning: "DOCUMENTATION_DELAY",
        minor: "MINOR_WORKFLOW_IMPACT",
      },
      appointment_scheduling_time: {
        critical: "SCHEDULING_SYSTEM_FAILURE",
        warning: "PATIENT_ACCESS_DELAY",
        minor: "ADMINISTRATIVE_SLOWDOWN",
      },
      ai_response_time: {
        critical: "CLINICAL_DECISION_SUPPORT_FAILURE",
        warning: "AI_ASSISTANCE_DELAY",
        minor: "MINOR_AI_PERFORMANCE_IMPACT",
      },
      database_query_time: {
        critical: "SYSTEM_WIDE_PERFORMANCE_DEGRADATION",
        warning: "DATA_ACCESS_SLOWDOWN",
        minor: "QUERY_PERFORMANCE_IMPACT",
      },
    };

    const metricImpacts = impacts[metric];
    if (!metricImpacts) return "UNKNOWN_IMPACT";

    const severity = this.calculateSeverity(percentageChange);
    return (
      metricImpacts[severity.toLowerCase()] || "GENERAL_PERFORMANCE_IMPACT"
    );
  }

  compareComplianceMetrics(baseline, current) {
    // console.log("🏥 Comparing compliance metrics...");

    const baselineCompliance = baseline.compliance || {};
    const currentCompliance = current.compliance || {};

    ["hipaa", "lgpd", "anvisa", "cfm"].forEach((area) => {
      const baselineStatus = baselineCompliance[area]?.status;
      const currentStatus = currentCompliance[area]?.status;

      if (baselineStatus && currentStatus && baselineStatus !== currentStatus) {
        const isRegression = baselineStatus === "COMPLIANT" && currentStatus !== "COMPLIANT";

        const change = {
          area,
          baseline_status: baselineStatus,
          current_status: currentStatus,
          is_regression: isRegression,
          severity: isRegression ? "CRITICAL" : "IMPROVEMENT",
          healthcare_impact: isRegression
            ? "REGULATORY_VIOLATION"
            : "COMPLIANCE_IMPROVEMENT",
        };

        if (isRegression) {
          this.regressions.push(change);
        } else {
          this.improvements.push(change);
        }
      }
    });
  }

  compareSecurityMetrics(baseline, current) {
    // console.log("🔒 Comparing security metrics...");

    // Check for security feature regressions
    const baselineSecurity = baseline.security || {};
    const currentSecurity = current.security || {};

    const securityChecks = [
      {
        path: "authentication.mfa_enabled",
        name: "MFA Enabled",
        critical: true,
      },
      {
        path: "authorization.rbac_enabled",
        name: "RBAC Enabled",
        critical: true,
      },
      {
        path: "monitoring.intrusion_detection",
        name: "Intrusion Detection",
        critical: false,
      },
      {
        path: "monitoring.anomaly_detection",
        name: "Anomaly Detection",
        critical: false,
      },
    ];

    securityChecks.forEach((check) => {
      const baselineValue = this.getNestedValue(baselineSecurity, check.path);
      const currentValue = this.getNestedValue(currentSecurity, check.path);

      if (baselineValue !== undefined && currentValue !== undefined) {
        const isRegression = this.isSecurityRegression(
          baselineValue,
          currentValue,
        );

        if (isRegression) {
          this.regressions.push({
            metric: check.name,
            type: "security",
            baseline_value: baselineValue,
            current_value: currentValue,
            severity: check.critical ? "CRITICAL" : "WARNING",
            healthcare_impact: check.critical
              ? "SECURITY_VULNERABILITY"
              : "SECURITY_FEATURE_DEGRADATION",
          });
        }
      }
    });
  }

  getNestedValue(obj, path) {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  isSecurityRegression(baseline, current) {
    // Security regression if feature was enabled and now disabled
    if (typeof baseline === "boolean" && typeof current === "boolean") {
      return baseline === true && current === false;
    }

    // Security regression if status changed from active/enabled to inactive/disabled
    if (typeof baseline === "string" && typeof current === "string") {
      const activeStates = ["ACTIVE", "ENABLED", "TRUE", "ON"];
      const baselineActive = activeStates.includes(baseline.toUpperCase());
      const currentActive = activeStates.includes(current.toUpperCase());
      return baselineActive && !currentActive;
    }

    return false;
  }

  generateRegressionReport() {
    // console.log("📄 Generating regression analysis report...");

    const totalRegressions = this.regressions.length;
    const criticalRegressions = this.regressions.filter(
      (r) => r.severity === "CRITICAL",
    ).length;
    const warningRegressions = this.regressions.filter(
      (r) => r.severity === "WARNING",
    ).length;

    // Determine overall status
    if (criticalRegressions > 0) {
      this.status = "CRITICAL_REGRESSIONS_DETECTED";
    } else if (warningRegressions > 0) {
      this.status = "WARNING_REGRESSIONS_DETECTED";
    } else if (totalRegressions > 0) {
      this.status = "MINOR_REGRESSIONS_DETECTED";
    } else {
      this.status = "NO_REGRESSIONS_DETECTED";
    }

    const report = {
      generated_at: new Date().toISOString(),
      status: this.status,
      summary: {
        total_regressions: totalRegressions,
        critical_regressions: criticalRegressions,
        warning_regressions: warningRegressions,
        minor_regressions: totalRegressions - criticalRegressions - warningRegressions,
        improvements: this.improvements.length,
      },
      regressions: this.regressions.sort((a, b) => {
        const severityOrder = { CRITICAL: 3, WARNING: 2, MINOR: 1 };
        return (
          (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
        );
      }),
      improvements: this.improvements.sort(
        (a, b) =>
          Math.abs(b.percentage_change || 0)
          - Math.abs(a.percentage_change || 0),
      ),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Critical performance regressions
    const criticalPerf = this.regressions.filter(
      (r) => r.severity === "CRITICAL" && r.healthcare_impact,
    );

    criticalPerf.forEach((regression) => {
      recommendations.push({
        priority: "HIGH",
        category: "PERFORMANCE",
        issue: `Critical regression in ${regression.metric}`,
        impact: regression.healthcare_impact,
        recommendation: this.getPerformanceRecommendation(regression.metric),
        action_required: "IMMEDIATE",
      });
    });

    // Security regressions
    const securityRegressions = this.regressions.filter(
      (r) => r.type === "security",
    );
    securityRegressions.forEach((regression) => {
      recommendations.push({
        priority: "CRITICAL",
        category: "SECURITY",
        issue: `Security feature regression: ${regression.metric}`,
        impact: regression.healthcare_impact,
        recommendation: "Restore security feature immediately and investigate root cause",
        action_required: "IMMEDIATE",
      });
    });

    // Compliance regressions
    const complianceRegressions = this.regressions.filter(
      (r) => r.area && r.is_regression,
    );
    complianceRegressions.forEach((regression) => {
      recommendations.push({
        priority: "CRITICAL",
        category: "COMPLIANCE",
        issue: `Compliance violation: ${regression.area.toUpperCase()}`,
        impact: "REGULATORY_VIOLATION",
        recommendation: "Immediate compliance remediation required",
        action_required: "IMMEDIATE",
      });
    });

    return recommendations;
  }

  getPerformanceRecommendation(metric) {
    const recommendations = {
      patient_data_load_time:
        "Optimize patient data queries, implement caching, check database indexes",
      emergency_access_time:
        "CRITICAL: Optimize emergency access path, implement dedicated fast lanes",
      medical_record_access_time: "Review medical record queries, optimize database performance",
      appointment_scheduling_time:
        "Optimize scheduling algorithms, implement caching for availability",
      ai_response_time: "Check AI model performance, optimize inference pipeline, scale resources",
      database_query_time: "Analyze slow queries, update indexes, consider query optimization",
    };

    return (
      recommendations[metric]
      || "Investigate performance bottlenecks and optimize accordingly"
    );
  }

  async saveReport(report) {
    const reportPath = path.join(process.cwd(), "regression-analysis.json");
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    await this.generateHumanReadableReport(report);

    // console.log(`✅ Regression analysis saved to: ${reportPath}`);
    return reportPath;
  }

  async generateHumanReadableReport(report) {
    const markdown = `
# NeonPro Healthcare Performance Regression Analysis

## Summary
- **Status**: ${report.status}
- **Total Regressions**: ${report.summary.total_regressions}
- **Critical**: ${report.summary.critical_regressions}
- **Warning**: ${report.summary.warning_regressions}
- **Minor**: ${report.summary.minor_regressions}
- **Improvements**: ${report.summary.improvements}

${
      report.summary.critical_regressions > 0
        ? `
## 🚨 Critical Regressions
${
          report.regressions
            .filter((r) => r.severity === "CRITICAL")
            .map(
              (r) => `
### ${r.metric}
- **Change**: ${r.percentage_change}% (${r.current_value} vs ${r.baseline_value})
- **Healthcare Impact**: ${r.healthcare_impact}
- **Severity**: ${r.severity}
`,
            )
            .join("\n")
        }
`
        : ""
    }

${
      report.summary.warning_regressions > 0
        ? `
## ⚠️ Warning Level Regressions
${
          report.regressions
            .filter((r) => r.severity === "WARNING")
            .map(
              (r) => `
### ${r.metric}
- **Change**: ${r.percentage_change}% (${r.current_value} vs ${r.baseline_value})
- **Healthcare Impact**: ${r.healthcare_impact}
`,
            )
            .join("\n")
        }
`
        : ""
    }

${
      report.summary.improvements > 0
        ? `
## ✅ Performance Improvements
${
          report.improvements
            .slice(0, 5)
            .map(
              (r) => `
### ${r.metric}
- **Improvement**: ${Math.abs(r.percentage_change)}% faster
- **Values**: ${r.current_value} vs ${r.baseline_value}
`,
            )
            .join("\n")
        }
`
        : ""
    }

${
      report.recommendations.length > 0
        ? `
## 📋 Recommendations
${
          report.recommendations
            .map(
              (rec, i) => `
${i + 1}. **[${rec.priority}] ${rec.category}**: ${rec.issue}
   - **Impact**: ${rec.impact}
   - **Action**: ${rec.recommendation}
   - **Timeline**: ${rec.action_required}
`,
            )
            .join("\n")
        }
`
        : ""
    }

---
Generated on: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(process.cwd(), "regression-analysis.md"),
      markdown,
    );
  }

  async run() {
    // console.log("🔍 Starting performance regression detection...\n");

    try {
      // Load current metrics
      const currentMetrics = await this.loadCurrentMetrics();
      // console.log("✅ Current metrics loaded");

      // Load or create baseline
      let baseline = await this.loadBaseline();
      if (!baseline) {
        baseline = await this.createBaseline(currentMetrics);
        // console.log(
          "ℹ️  New baseline created. Run again after next metrics collection for comparison.",
        );
        return { status: "BASELINE_CREATED" };
      }

      // console.log("✅ Baseline metrics loaded");

      // Compare metrics
      this.comparePerformanceMetrics(baseline, currentMetrics);
      this.compareComplianceMetrics(baseline, currentMetrics);
      this.compareSecurityMetrics(baseline, currentMetrics);

      // Generate and save report
      const report = this.generateRegressionReport();
      await this.saveReport(report);

      // Log summary
      // console.log("\n📊 Regression Detection Results:");
      // console.log(`Status: ${report.status}`);
      // console.log(
        `Regressions: ${report.summary.total_regressions} (${report.summary.critical_regressions} critical)`,
      );
      // console.log(`Improvements: ${report.summary.improvements}`);

      if (report.summary.critical_regressions > 0) {
        // console.log("\n🚨 CRITICAL REGRESSIONS DETECTED!");
        process.exit(1);
      } else if (report.summary.warning_regressions > 0) {
        // console.log("\n⚠️  Warning level regressions detected");
        process.exit(1);
      } else {
        // console.log("\n✅ No significant regressions detected");
      }

      return report;
    } catch (error) {
      // console.error("❌ Error during regression detection:", error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const detector = new RegressionDetector();
  detector.run();
}

module.exports = RegressionDetector;
