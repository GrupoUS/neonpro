/**
 * WCAGTester - Automated WCAG accessibility testing using axe-core
 * Tests against WCAG 2.1 Level A, AA, and AAA guidelines
 */

import type { ComplianceTestResult, ComplianceViolation } from "../types";

// axe-core result types
interface AxeResult {
  violations: AxeViolation[];
  passes: AxeCheck[];
  incomplete: AxeCheck[];
  inapplicable: AxeCheck[];
  timestamp: string;
  url: string;
}

interface AxeViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

interface AxeCheck {
  id: string;
  impact?: string;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

interface AxeNode {
  target: string[];
  html: string;
  unknown: AxeCheckResult[];
  all: AxeCheckResult[];
  none: AxeCheckResult[];
  failureSummary?: string;
}

interface AxeCheckResult {
  id: string;
  impact?: string;
  message: string;
  data?: unknown;
}

export interface WCAGTestConfig {
  level: "A" | "AA" | "AAA";
  tags?: string[];
  rules?: {
    include?: string[];
    exclude?: string[];
  };
  selectors?: {
    include?: string[];
    exclude?: string[];
  };
  timeout?: number;
  screenshot?: boolean;
}

export class WCAGTester {
  private defaultConfig: WCAGTestConfig = {
    level: "AA",
    tags: ["wcag2a", "wcag2aa"],
    timeout: 30_000,
    screenshot: true,
  };

  /**
   * Test a page for WCAG compliance
   */
  async testPage(url: string, config?: Partial<WCAGTestConfig>): Promise<ComplianceTestResult> {
    const startTime = Date.now();
    const testConfig = { ...this.defaultConfig, ...config };

    try {
      console.log(`🔍 Running WCAG test for: ${url}`);

      // Run axe-core test
      const axeResult = await this.runAxeTest(url, testConfig);

      // Transform axe results to our format
      const violations = this.transformViolations(axeResult.violations, url);
      const score = this.calculateScore(axeResult);

      const result: ComplianceTestResult = {
        framework: "WCAG",
        page: url,
        score,
        violations,
        passes: axeResult.passes.length,
        incomplete: axeResult.incomplete.length,
        duration: Date.now() - startTime,
        timestamp: startTime,
        status: violations.filter(v =>
            v.severity === "critical" || v.severity === "high"
          ).length === 0
          ? "passed"
          : "failed",
      };

      console.log(`✅ WCAG test completed - Score: ${score}%, Violations: ${violations.length}`);
      return result;
    } catch (error) {
      console.error(`❌ WCAG test failed for ${url}:`, error);

      return {
        framework: "WCAG",
        page: url,
        score: 0,
        violations: [],
        passes: 0,
        incomplete: 0,
        duration: Date.now() - startTime,
        timestamp: startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Run axe-core accessibility test
   */
  private async runAxeTest(url: string, config: WCAGTestConfig): Promise<AxeResult> {
    // In a real implementation, this would use Playwright or Puppeteer with axe-core
    // For now, we'll simulate the axe-core API call

    const response = await fetch("/api/compliance/wcag/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        config: {
          tags: this.getAxeTags(config.level),
          rules: config.rules,
          selectors: config.selectors,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WCAG test API call failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result as AxeResult;
  }

  /**
   * Get axe-core tags based on WCAG level
   */
  private getAxeTags(level: "A" | "AA" | "AAA"): string[] {
    const baseTags = ["wcag2a"];

    if (level === "AA" || level === "AAA") {
      baseTags.push("wcag2aa");
    }

    if (level === "AAA") {
      baseTags.push("wcag2aaa");
    }

    // Add additional useful tags
    baseTags.push("section508", "best-practice");

    return baseTags;
  }

  /**
   * Transform axe violations to our violation format
   */
  private transformViolations(axeViolations: AxeViolation[], url: string): ComplianceViolation[] {
    return axeViolations.map((violation, index) => ({
      id: `wcag_${Date.now()}_${index}`,
      framework: "WCAG" as const,
      severity: this.mapImpactToSeverity(violation.impact),
      rule: `${violation.id} - ${this.extractWCAGCriterion(violation.tags)}`,
      description: violation.description,
      element: violation.nodes[0]?.target.join(" > "),
      page: url,
      timestamp: Date.now(),
      status: "open" as const,
      notes: `Help: ${violation.help}\nURL: ${violation.helpUrl}`,
    }));
  }

  /**
   * Map axe impact to our severity levels
   */
  private mapImpactToSeverity(impact: string): "low" | "medium" | "high" | "critical" {
    switch (impact) {
      case "minor":
        return "low";
      case "moderate":
        return "medium";
      case "serious":
        return "high";
      case "critical":
        return "critical";
      default:
        return "medium";
    }
  }

  /**
   * Extract WCAG criterion from tags
   */
  private extractWCAGCriterion(tags: string[]): string {
    const wcagTag = tags.find(tag => tag.match(/wcag\d+/));
    if (!wcagTag) return "WCAG";

    // Extract criterion number from tag like "wcag143" -> "1.4.3"
    const match = wcagTag.match(/wcag(\d)(\d)(\d)/);
    if (match) {
      return `WCAG ${match[1]}.${match[2]}.${match[3]}`;
    }

    return wcagTag.toUpperCase();
  }

  /**
   * Calculate WCAG compliance score
   */
  private calculateScore(axeResult: AxeResult): number {
    const totalChecks = axeResult.violations.length + axeResult.passes.length
      + axeResult.incomplete.length;

    if (totalChecks === 0) return 100;

    // Weight violations by impact
    const weightedViolations = axeResult.violations.reduce((sum, violation) => {
      const weight = this.getViolationWeight(violation.impact);
      return sum + (violation.nodes.length * weight);
    }, 0);

    // Calculate score (higher weights reduce score more)
    const maxPossibleScore = 100;
    const penaltyFactor = Math.min(weightedViolations * 2, maxPossibleScore);

    return Math.max(0, Math.round(maxPossibleScore - penaltyFactor));
  }

  /**
   * Get violation weight based on impact
   */
  private getViolationWeight(impact: string): number {
    switch (impact) {
      case "critical":
        return 10;
      case "serious":
        return 5;
      case "moderate":
        return 2;
      case "minor":
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Generate detailed WCAG report
   */
  async generateDetailedReport(results: ComplianceTestResult[]): Promise<{
    summary: {
      totalPages: number;
      averageScore: number;
      totalViolations: number;
      violationsByLevel: Record<string, number>;
    };
    recommendations: string[];
    priorityFixes: {
      rule: string;
      pages: string[];
      impact: string;
      description: string;
      solution: string;
    }[];
  }> {
    const wcagResults = results.filter(r => r.framework === "WCAG");

    const summary = {
      totalPages: wcagResults.length,
      averageScore: Math.round(
        wcagResults.reduce((sum, r) => sum + r.score, 0) / wcagResults.length,
      ),
      totalViolations: wcagResults.reduce((sum, r) => sum + r.violations.length, 0),
      violationsByLevel: this.countViolationsByLevel(wcagResults),
    };

    const recommendations = this.generateRecommendations(wcagResults);
    const priorityFixes = this.identifyPriorityFixes(wcagResults);

    return {
      summary,
      recommendations,
      priorityFixes,
    };
  }

  /**
   * Count violations by severity level
   */
  private countViolationsByLevel(results: ComplianceTestResult[]): Record<string, number> {
    const counts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    results.forEach(result => {
      result.violations.forEach(violation => {
        counts[violation.severity]++;
      });
    });

    return counts;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(results: ComplianceTestResult[]): string[] {
    const recommendations: string[] = [];
    const violationCounts = this.countViolationsByLevel(results);

    if (violationCounts.critical > 0) {
      recommendations.push(
        `Address ${violationCounts.critical} critical accessibility issues immediately`,
      );
    }

    if (violationCounts.high > 0) {
      recommendations.push(`Fix ${violationCounts.high} high-impact violations within 1 week`);
    }

    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    if (averageScore < 80) {
      recommendations.push(
        "Consider implementing automated accessibility testing in CI/CD pipeline",
      );
      recommendations.push("Provide accessibility training for development team");
    }

    if (violationCounts.medium + violationCounts.low > 10) {
      recommendations.push("Establish regular accessibility audit schedule");
    }

    return recommendations;
  }

  /**
   * Identify priority fixes across all pages
   */
  private identifyPriorityFixes(results: ComplianceTestResult[]): {
    rule: string;
    pages: string[];
    impact: string;
    description: string;
    solution: string;
  }[] {
    const violationMap = new Map<string, {
      pages: Set<string>;
      impact: string;
      description: string;
      count: number;
    }>();

    // Aggregate violations across pages
    results.forEach(result => {
      result.violations.forEach(violation => {
        const key = violation.rule;
        if (!violationMap.has(key)) {
          violationMap.set(key, {
            pages: new Set(),
            impact: violation.severity,
            description: violation.description,
            count: 0,
          });
        }

        const entry = violationMap.get(key)!;
        entry.pages.add(result.page);
        entry.count++;
      });
    });

    // Sort by impact and frequency
    return Array.from(violationMap.entries())
      .sort(([, a], [, b]) => {
        const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const impactDiff = (impactOrder[b.impact as keyof typeof impactOrder] || 0)
          - (impactOrder[a.impact as keyof typeof impactOrder] || 0);

        if (impactDiff !== 0) return impactDiff;
        return b.count - a.count;
      })
      .slice(0, 10) // Top 10 priority fixes
      .map(([rule, data]) => ({
        rule,
        pages: Array.from(data.pages),
        impact: data.impact,
        description: data.description,
        solution: this.getSolutionForRule(rule),
      }));
  }

  /**
   * Get solution recommendations for specific rules
   */
  private getSolutionForRule(rule: string): string {
    // This would contain specific solutions for common WCAG violations
    const solutions: Record<string, string> = {
      "color-contrast":
        "Increase color contrast ratio to at least 4.5:1 for normal text and 3:1 for large text",
      "image-alt": 'Add descriptive alt text to images or mark decorative images with alt=""',
      "label": "Ensure form inputs have associated labels using <label> elements or aria-label",
      "heading-order": "Use heading elements (h1-h6) in logical hierarchical order",
      "link-name": 'Provide descriptive text for links, avoid generic text like "click here"',
      "button-name": "Ensure buttons have accessible names via text content or aria-label",
      "landmark-one-main": "Include exactly one main landmark per page using <main> element",
      "page-has-heading-one": "Include exactly one h1 element per page for the main heading",
    };

    // Extract rule ID from full rule string
    const ruleId = rule.split(" - ")[0]?.toLowerCase();

    return solutions[ruleId] || "Review WCAG documentation for specific guidance on this violation";
  }
}
