/**
 * Brazilian Healthcare Compliance Automation Service
 * Complete LGPD/ANVISA/CFM automation with real-time monitoring
 *
 * @fileoverview Constitutional compliance automation for NeonPro healthcare platform
 * @version 1.0.0
 * @since 2025-01-25
 */
import type { Database } from "@neonpro/types";
import type { createClient } from "@supabase/supabase-js";
import { type ComplianceMonitoringResponse } from "../enterprise/audit/real-time-monitor.js";
/**
 * Compliance Automation Configuration
 * Constitutional compliance configuration with Brazilian healthcare requirements
 */
export type ComplianceAutomationConfig = {
	/** Tenant ID for compliance tracking */
	tenant_id: string;
	/** Enable automated LGPD compliance */
	lgpd_automation: boolean;
	/** Enable automated ANVISA compliance */
	anvisa_automation: boolean;
	/** Enable automated CFM compliance */
	cfm_automation: boolean;
	/** Real-time monitoring configuration */
	monitoring_config: {
		enabled: boolean;
		interval_minutes: number;
		alert_thresholds: {
			warning: number;
			critical: number;
			constitutional_minimum: number;
		};
	};
	/** Automated reporting configuration */
	reporting_config: {
		daily_reports: boolean;
		monthly_reports: boolean;
		anvisa_reports: boolean;
		lgpd_reports: boolean;
	};
};
/**
 * Compliance Automation Response
 * Comprehensive compliance automation results
 */
export type ComplianceAutomationResponse = {
	/** Overall compliance status */
	overall_status:
		| "compliant"
		| "warning"
		| "critical"
		| "constitutional_violation";
	/** Overall compliance score ≥9.9 */
	overall_score: number;
	/** LGPD compliance results */
	lgpd_results: {
		compliant: boolean;
		score: number;
		violations: string[];
		recommendations: string[];
	};
	/** ANVISA compliance results */
	anvisa_results: {
		compliant: boolean;
		score: number;
		issues: string[];
		recommendations: string[];
	};
	/** CFM compliance results */
	cfm_results: {
		compliant: boolean;
		score: number;
		issues: string[];
		recommendations: string[];
		professional_standards_met: boolean;
	};
	/** Real-time monitoring status */
	monitoring_status: ComplianceMonitoringResponse;
	/** Automated actions taken */
	automated_actions: {
		lgpd_actions: string[];
		anvisa_actions: string[];
		cfm_actions: string[];
		monitoring_actions: string[];
	};
	/** Compliance timestamp */
	assessed_at: Date;
};
/**
 * Brazilian Healthcare Compliance Automation Service
 * Constitutional compliance automation with ≥9.9/10 standards
 */
export declare class BrazilianComplianceAutomationService {
	private readonly supabase;
	private readonly lgpdValidator;
	private readonly anvisaServices;
	private readonly cfmServices;
	private readonly realTimeMonitor;
	private readonly config;
	constructor(
		supabaseClient: ReturnType<typeof createClient<Database>>,
		config: ComplianceAutomationConfig,
	);
	/**
	 * Execute comprehensive compliance automation
	 * Constitutional compliance automation with all Brazilian healthcare requirements
	 */
	executeComplianceAutomation(userId: string): Promise<{
		success: boolean;
		data?: ComplianceAutomationResponse;
		error?: string;
	}>;
	/**
	 * Execute LGPD compliance automation
	 * Automated LGPD compliance validation and remediation
	 */
	private executeLgpdAutomation;
	/**
	 * Execute ANVISA compliance automation
	 * Automated ANVISA regulatory compliance validation
	 */
	private executeAnvisaAutomation;
	/**
	 * Execute CFM compliance automation
	 * Automated CFM professional standards compliance validation
	 */
	private executeCfmAutomation;
	/**
	 * Execute real-time compliance monitoring
	 * Constitutional real-time monitoring with automated responses
	 */
	private executeRealTimeMonitoring;
	private remediateLgpdDataProcessing;
	private remediateLgpdConsent;
	private notifyExpiringAnvisaProducts;
	private initiateAnvisaProductRegistration;
	private notifyExpiringCfmLicenses;
	private initiateCfmLicenseRegistration;
	private calculateOverallScore;
	private determineOverallStatus;
	private storeComplianceAssessment;
	private generateDailyComplianceReport;
}
/**
 * Create Brazilian Compliance Automation Service
 * Factory function for constitutional compliance automation
 */
export declare function createBrazilianComplianceAutomationService(
	supabaseClient: ReturnType<typeof createClient<Database>>,
	config: ComplianceAutomationConfig,
): BrazilianComplianceAutomationService;
/**
 * Default compliance automation configuration
 * Constitutional configuration with Brazilian healthcare standards
 */
export declare const DEFAULT_COMPLIANCE_CONFIG: Omit<
	ComplianceAutomationConfig,
	"tenant_id"
>;
