/**
 * Quality Gates Configuration for NeonPro Healthcare Platform
 *
 * This module defines the quality thresholds and validation rules
 * for maintaining healthcare-grade code quality and compliance.
 */

export type QualityGates = {
	coverage: CoverageThresholds;
	complexity: ComplexityThresholds;
	security: SecurityThresholds;
	performance: PerformanceThresholds;
	accessibility: AccessibilityThresholds;
	compliance: ComplianceThresholds;
};

export type CoverageThresholds = {
	/** Minimum overall code coverage percentage */
	global: number;
	/** Minimum statement coverage percentage */
	statements: number;
	/** Minimum branch coverage percentage */
	branches: number;
	/** Minimum function coverage percentage */
	functions: number;
	/** Minimum line coverage percentage */
	lines: number;
	/** Critical packages requiring higher coverage */
	critical: {
		packages: string[];
		threshold: number;
	};
};

export type ComplexityThresholds = {
	/** Maximum cyclomatic complexity per function */
	cyclomatic: number;
	/** Maximum cognitive complexity per function */
	cognitive: number;
	/** Maximum lines of code per file */
	linesPerFile: number;
	/** Maximum parameters per function */
	parameters: number;
	/** Maximum nesting depth */
	nestingDepth: number;
};

export type SecurityThresholds = {
	/** Maximum security vulnerabilities allowed */
	vulnerabilities: {
		critical: number;
		high: number;
		medium: number;
		low: number;
	};
	/** Required security score (0-10) */
	securityScore: number;
	/** OWASP compliance checks */
	owaspCompliance: boolean;
};

export type PerformanceThresholds = {
	/** Maximum bundle size in MB */
	bundleSize: number;
	/** Maximum lighthouse performance score */
	lighthousePerformance: number;
	/** Maximum Core Web Vitals thresholds */
	webVitals: {
		lcp: number; // Largest Contentful Paint (ms)
		fid: number; // First Input Delay (ms)
		cls: number; // Cumulative Layout Shift
	};
	/** Maximum API response time (ms) */
	apiResponseTime: number;
};

export type AccessibilityThresholds = {
	/** Minimum WCAG compliance level */
	wcagLevel: "A" | "AA" | "AAA";
	/** Minimum accessibility score */
	axeScore: number;
	/** Required accessibility audits */
	audits: string[];
};

export type ComplianceThresholds = {
	/** LGPD compliance score */
	lgpd: number;
	/** ANVISA compliance score */
	anvisa: number;
	/** CFM compliance score */
	cfm: number;
	/** ISO 27001 compliance score */
	iso27001: number;
	/** FHIR compliance score */
	fhir: number;
};

/**
 * Healthcare-grade quality gates configuration
 * These thresholds ensure regulatory compliance and production readiness
 */
export const QUALITY_GATES: QualityGates = {
	coverage: {
		global: 90,
		statements: 92,
		branches: 88,
		functions: 95,
		lines: 90,
		critical: {
			packages: [
				"@neonpro/security",
				"@neonpro/compliance",
				"@neonpro/database",
				"@neonpro/audit",
			],
			threshold: 98,
		},
	},

	complexity: {
		cyclomatic: 10,
		cognitive: 15,
		linesPerFile: 300,
		parameters: 5,
		nestingDepth: 4,
	},

	security: {
		vulnerabilities: {
			critical: 0,
			high: 0,
			medium: 2,
			low: 10,
		},
		securityScore: 9.5,
		owaspCompliance: true,
	},

	performance: {
		bundleSize: 2.5,
		lighthousePerformance: 95,
		webVitals: {
			lcp: 2500,
			fid: 100,
			cls: 0.1,
		},
		apiResponseTime: 200,
	},

	accessibility: {
		wcagLevel: "AA",
		axeScore: 95,
		audits: [
			"keyboard-navigation",
			"screen-reader",
			"color-contrast",
			"focus-management",
			"semantic-markup",
		],
	},

	compliance: {
		lgpd: 98,
		anvisa: 95,
		cfm: 92,
		iso27001: 88,
		fhir: 85,
	},
};

/**
 * Quality gate validation results
 */
export type QualityReport = {
	overall: QualityStatus;
	coverage: QualityResult;
	complexity: QualityResult;
	security: QualityResult;
	performance: QualityResult;
	accessibility: QualityResult;
	compliance: QualityResult;
	timestamp: string;
	recommendations: string[];
};

export type QualityResult = {
	status: QualityStatus;
	score: number;
	threshold: number;
	details: Record<string, any>;
	issues: QualityIssue[];
};

export type QualityIssue = {
	type: "error" | "warning" | "info";
	category: string;
	message: string;
	file?: string;
	line?: number;
	severity: "critical" | "high" | "medium" | "low";
	recommendation: string;
};

export enum QualityStatus {
	PASS = "PASS",
	FAIL = "FAIL",
	WARNING = "WARNING",
}

/**
 * Healthcare-specific quality validators
 */
export class HealthcareQualityValidator {
	/**
	 * Validates if code meets healthcare regulatory standards
	 */
	static validateCompliance(report: QualityReport): boolean {
		const criticalChecks = [
			report.security.status === QualityStatus.PASS,
			report.compliance.score >= QUALITY_GATES.compliance.lgpd,
			report.coverage.score >= QUALITY_GATES.coverage.global,
			report.accessibility.status === QualityStatus.PASS,
		];

		return criticalChecks.every((check) => check);
	}

	/**
	 * Validates if code is production-ready
	 */
	static validateProductionReadiness(report: QualityReport): boolean {
		return Object.values(report).every((result) =>
			typeof result === "object" && "status" in result
				? result.status !== QualityStatus.FAIL
				: true,
		);
	}

	/**
	 * Generates compliance recommendations
	 */
	static generateRecommendations(report: QualityReport): string[] {
		const recommendations: string[] = [];

		if (report.coverage.score < QUALITY_GATES.coverage.global) {
			recommendations.push(
				`Increase test coverage to ${QUALITY_GATES.coverage.global}% (current: ${report.coverage.score}%)`,
			);
		}

		if (report.security.status === QualityStatus.FAIL) {
			recommendations.push(
				"Address critical security vulnerabilities before deployment",
			);
		}

		if (report.compliance.score < QUALITY_GATES.compliance.lgpd) {
			recommendations.push("Ensure LGPD compliance requirements are met");
		}

		if (report.accessibility.status === QualityStatus.FAIL) {
			recommendations.push(
				"Fix accessibility issues to meet WCAG 2.1 AA standards",
			);
		}

		return recommendations;
	}
}

export default QUALITY_GATES;
