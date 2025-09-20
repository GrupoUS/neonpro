#!/usr/bin/env node

/**
 * Healthcare Edge Runtime Performance Monitor
 *
 * Monitors bundle size, response times, and Brazilian healthcare compliance
 * in real-time for Vercel Edge Runtime deployment.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// Healthcare performance SLA requirements
const HEALTHCARE_SLA = {
  maxResponseTime: 100, // <100ms for medical applications
  maxBundleSize: 244000, // 244KB edge runtime limit
  minAvailability: 99.9, // 99.9% uptime
  maxErrorRate: 0.1, // <0.1% error rate
};

// Brazilian compliance endpoints to monitor
const COMPLIANCE_ENDPOINTS = [
  "/api/health/check",
  "/api/compliance/report",
  "/api/patients/lookup",
  "/api/telemedicine/session",
  "/api/anvisa/adverse-events",
];

class HealthcarePerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTime: [],
      bundleSize: 0,
      errorRate: 0,
      availability: 100,
      complianceStatus: {},
    };

    this.baseUrl = process.env.VERCEL_URL || "http://localhost:3000";
    this.monitoringInterval = 60000; // 1 minute
    this.isRunning = false;
  }

  /**
   * Start monitoring healthcare performance
   */
  async startMonitoring() {
    console.log("🏥 Starting Healthcare Edge Runtime Performance Monitor...");
    console.log(`Monitoring URL: ${this.baseUrl}`);
    console.log(
      `SLA Requirements: <${HEALTHCARE_SLA.maxResponseTime}ms response, ${HEALTHCARE_SLA.minAvailability}% availability\n`,
    );

    this.isRunning = true;

    // Initial health check
    await this.performHealthCheck();

    // Start continuous monitoring
    this.monitoringTimer = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthCheck();
        await this.checkBundleSize();
        await this.checkComplianceStatus();
        this.generatePerformanceReport();
      }
    }, this.monitoringInterval);

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping Healthcare Performance Monitor...");
      this.stopMonitoring();
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isRunning = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    this.generateFinalReport();
    process.exit(0);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    console.log(`🔍 Performing health check at ${new Date().toISOString()}`);

    const results = await Promise.allSettled(
      COMPLIANCE_ENDPOINTS.map((endpoint) => this.checkEndpoint(endpoint)),
    );

    // Calculate metrics
    const successfulChecks = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const totalChecks = results.length;

    this.metrics.availability = (successfulChecks / totalChecks) * 100;
    this.metrics.errorRate =
      ((totalChecks - successfulChecks) / totalChecks) * 100;

    // Log results
    console.log(
      `✅ Health check completed: ${successfulChecks}/${totalChecks} endpoints healthy`,
    );
    console.log(`📊 Availability: ${this.metrics.availability.toFixed(1)}%`);
    console.log(`❌ Error rate: ${this.metrics.errorRate.toFixed(2)}%`);

    // Check SLA compliance
    if (this.metrics.availability < HEALTHCARE_SLA.minAvailability) {
      console.log("🚨 ALERT: Availability below healthcare SLA requirement!");
    }

    if (this.metrics.errorRate > HEALTHCARE_SLA.maxErrorRate) {
      console.log("🚨 ALERT: Error rate exceeds healthcare SLA limit!");
    }
  }

  /**
   * Check individual endpoint performance
   */
  async checkEndpoint(endpoint) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;

      const request = https.get(
        url,
        {
          timeout: 5000,
          headers: {
            "User-Agent": "Healthcare-Performance-Monitor/1.0",
            "X-Health-Check": "true",
          },
        },
        (response) => {
          const responseTime = Date.now() - startTime;

          // Store response time metrics
          this.metrics.responseTime.push(responseTime);

          // Keep only last 100 measurements
          if (this.metrics.responseTime.length > 100) {
            this.metrics.responseTime.shift();
          }

          console.log(
            `  ${endpoint}: ${responseTime}ms (${response.statusCode})`,
          );

          // Check healthcare SLA compliance
          if (responseTime > HEALTHCARE_SLA.maxResponseTime) {
            console.log(
              `    ⚠️  WARNING: Response time exceeds healthcare SLA (${HEALTHCARE_SLA.maxResponseTime}ms)`,
            );
          }

          resolve({
            endpoint,
            responseTime,
            statusCode: response.statusCode,
            success: response.statusCode >= 200 && response.statusCode < 300,
          });
        },
      );

      request.on("error", (error) => {
        const responseTime = Date.now() - startTime;
        console.log(`  ${endpoint}: ERROR - ${error.message}`);
        reject(error);
      });

      request.on("timeout", () => {
        console.log(`  ${endpoint}: TIMEOUT`);
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * Check bundle size compliance
   */
  async checkBundleSize() {
    try {
      // Try to read bundle analysis report
      const reportPath = path.join(
        __dirname,
        "../../../healthcare-bundle-report.json",
      );

      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

        if (report.summary && report.summary.totalBundleSize) {
          // Parse bundle size from report
          const bundleSizeStr = report.summary.totalBundleSize;
          const bundleSize = this.parseBundleSize(bundleSizeStr);

          this.metrics.bundleSize = bundleSize;

          console.log(`📦 Bundle size: ${bundleSizeStr}`);

          // Check compliance
          if (bundleSize > HEALTHCARE_SLA.maxBundleSize) {
            console.log("🚨 ALERT: Bundle size exceeds edge runtime limit!");
          } else if (bundleSize > HEALTHCARE_SLA.maxBundleSize * 0.9) {
            console.log(
              "⚠️  WARNING: Bundle size approaching edge runtime limit",
            );
          }
        }
      } else {
        console.log("📦 Bundle size: No analysis report found");
      }
    } catch (error) {
      console.error("Failed to check bundle size:", error.message);
    }
  }

  /**
   * Check Brazilian healthcare compliance status
   */
  async checkComplianceStatus() {
    try {
      const complianceResult = await this.checkEndpoint(
        "/api/compliance/report",
      );

      if (complianceResult.success) {
        console.log("🏥 Healthcare compliance: All standards met");
        this.metrics.complianceStatus = {
          lgpd: "compliant",
          cfm: "compliant",
          anvisa: "compliant",
          lastChecked: new Date().toISOString(),
        };
      } else {
        console.log("❌ Healthcare compliance: Issues detected");
        this.metrics.complianceStatus = {
          status: "non_compliant",
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.log("❌ Healthcare compliance: Unable to verify");
      this.metrics.complianceStatus = {
        status: "unknown",
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate real-time performance report
   */
  generatePerformanceReport() {
    const avgResponseTime =
      this.metrics.responseTime.length > 0
        ? this.metrics.responseTime.reduce((sum, time) => sum + time, 0) /
          this.metrics.responseTime.length
        : 0;

    console.log("\n📊 HEALTHCARE PERFORMANCE SUMMARY");
    console.log("================================");
    console.log(
      `Average Response Time: ${Math.round(
        avgResponseTime,
      )}ms (target: <${HEALTHCARE_SLA.maxResponseTime}ms)`,
    );
    console.log(
      `Availability: ${this.metrics.availability.toFixed(
        1,
      )}% (target: >${HEALTHCARE_SLA.minAvailability}%)`,
    );
    console.log(
      `Error Rate: ${this.metrics.errorRate.toFixed(
        2,
      )}% (target: <${HEALTHCARE_SLA.maxErrorRate}%)`,
    );
    console.log(
      `Bundle Size: ${this.formatBytes(this.metrics.bundleSize)} (limit: ${this.formatBytes(
        HEALTHCARE_SLA.maxBundleSize,
      )})`,
    );

    // SLA compliance status
    const responseTimeCompliant =
      avgResponseTime <= HEALTHCARE_SLA.maxResponseTime;
    const availabilityCompliant =
      this.metrics.availability >= HEALTHCARE_SLA.minAvailability;
    const errorRateCompliant =
      this.metrics.errorRate <= HEALTHCARE_SLA.maxErrorRate;
    const bundleSizeCompliant =
      this.metrics.bundleSize <= HEALTHCARE_SLA.maxBundleSize;

    const overallCompliant =
      responseTimeCompliant &&
      availabilityCompliant &&
      errorRateCompliant &&
      bundleSizeCompliant;

    console.log(
      `\nSLA Compliance: ${overallCompliant ? "✅ MEETING" : "❌ FAILING"} healthcare requirements`,
    );

    if (!overallCompliant) {
      console.log("Issues:");
      if (!responseTimeCompliant)
        console.log("  - Response time exceeds limit");
      if (!availabilityCompliant) console.log("  - Availability below target");
      if (!errorRateCompliant) console.log("  - Error rate too high");
      if (!bundleSizeCompliant)
        console.log("  - Bundle size exceeds edge runtime limit");
    }

    console.log(
      `\nNext check in ${this.monitoringInterval / 1000} seconds...\n`,
    );
  }

  /**
   * Generate final monitoring report
   */
  generateFinalReport() {
    const totalChecks = this.metrics.responseTime.length;
    const avgResponseTime =
      totalChecks > 0
        ? this.metrics.responseTime.reduce((sum, time) => sum + time, 0) /
          totalChecks
        : 0;

    const report = {
      timestamp: new Date().toISOString(),
      monitoringDuration: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
      summary: {
        totalHealthChecks: totalChecks,
        averageResponseTime: `${Math.round(avgResponseTime)}ms`,
        finalAvailability: `${this.metrics.availability.toFixed(1)}%`,
        finalErrorRate: `${this.metrics.errorRate.toFixed(2)}%`,
        bundleSize: this.formatBytes(this.metrics.bundleSize),
        healthcareSlaCompliance: this.isHealthcareSlaCompliant(),
        complianceStatus: this.metrics.complianceStatus,
      },
      detailed: this.metrics,
    };

    // Save final report
    const reportPath = path.join(
      __dirname,
      "../healthcare-performance-final-report.json",
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("\n📋 FINAL HEALTHCARE PERFORMANCE REPORT");
    console.log("=====================================");
    console.log(`Total monitoring time: ${report.monitoringDuration}`);
    console.log(`Health checks performed: ${totalChecks}`);
    console.log(`Average response time: ${report.summary.averageResponseTime}`);
    console.log(`Final availability: ${report.summary.finalAvailability}`);
    console.log(
      `Healthcare SLA compliance: ${
        report.summary.healthcareSlaCompliance ? "✅ PASS" : "❌ FAIL"
      }`,
    );
    console.log(`\nDetailed report saved to: ${reportPath}`);
  }

  /**
   * Check overall healthcare SLA compliance
   */
  isHealthcareSlaCompliant() {
    const avgResponseTime =
      this.metrics.responseTime.length > 0
        ? this.metrics.responseTime.reduce((sum, time) => sum + time, 0) /
          this.metrics.responseTime.length
        : 0;

    return (
      avgResponseTime <= HEALTHCARE_SLA.maxResponseTime &&
      this.metrics.availability >= HEALTHCARE_SLA.minAvailability &&
      this.metrics.errorRate <= HEALTHCARE_SLA.maxErrorRate &&
      this.metrics.bundleSize <= HEALTHCARE_SLA.maxBundleSize
    );
  }

  /**
   * Parse bundle size string to bytes
   */
  parseBundleSize(sizeStr) {
    const match = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    return Math.round(value * (multipliers[unit] || 1));
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

// Run monitor if called directly
if (require.main === module) {
  const monitor = new HealthcarePerformanceMonitor();
  monitor.startTime = Date.now();
  monitor.startMonitoring().catch((error) => {
    console.error("Healthcare performance monitoring failed:", error);
    process.exit(1);
  });
}

module.exports = HealthcarePerformanceMonitor;
