/**
 * Core Web Vitals Measurement for Healthcare Applications
 * Optimized for clinical workflows and medical data handling
 */

import type { CLSMetric, FCPMetric, FIDMetric, INPMetric, LCPMetric, TTFBMetric } from "web-vitals";
import { getCLS, getFCP, getFID, getLCP, getTTFB, onINP } from "web-vitals";
import type { HealthcareVitalsMetric, PerformanceEventHandler, PerformanceThresholds, WebVitalsMetric } from "../types";

// Healthcare-optimized thresholds (stricter than standard)
export const HEALTHCARE_THRESHOLDS: PerformanceThresholds = {
	// Core Web Vitals (healthcare-optimized)
	CLS: { good: 0.05, poor: 0.1 }, // Stricter for medical forms
	FCP: { good: 1200, poor: 2000 }, // Faster for clinical urgency
	FID: { good: 80, poor: 200 }, // Responsive for medical inputs
	LCP: { good: 2000, poor: 3000 }, // Quick content for patient data
	TTFB: { good: 200, poor: 500 }, // Fast server response for medical queries
	INP: { good: 150, poor: 300 }, // Smooth interactions for forms

	// Healthcare-specific workflow thresholds
	patientLookup: { good: 300, poor: 800 },
	medicalFormLoad: { good: 800, poor: 1500 },
	procedureScheduling: { good: 1200, poor: 2500 },
	realTimeUpdate: { good: 100, poor: 300 },
};

class HealthcareWebVitals {
	private readonly handlers: PerformanceEventHandler[] = [];
	private readonly thresholds: PerformanceThresholds;
	private healthcareContext: {
		workflowType?:
			| "patient-registration"
			| "medical-form"
			| "procedure-scheduling"
			| "medical-history"
			| "real-time-update";
		clinicId?: string;
		userId?: string;
		deviceType?: "desktop" | "tablet" | "mobile";
		networkConnection?: "fast" | "slow" | "offline";
	} = {};

	constructor(thresholds: PerformanceThresholds = HEALTHCARE_THRESHOLDS) {
		this.thresholds = thresholds;
		this.detectDeviceType();
		this.detectNetworkConnection();
	}

	/**
	 * Set healthcare context for more relevant metrics
	 */
	setHealthcareContext(context: Partial<HealthcareVitalsMetric>): void {
		this.healthcareContext = {
			...this.healthcareContext,
			...(context.workflowType && { workflowType: context.workflowType }),
			...(context.clinicId && { clinicId: context.clinicId }),
			...(context.userId && { userId: context.userId }),
		};
	}

	/**
	 * Add performance event handler
	 */
	onMetric(handler: PerformanceEventHandler): void {
		this.handlers.push(handler);
	}

	/**
	 * Start monitoring Web Vitals
	 */
	startMonitoring(): void {
		// Core Web Vitals with type-safe wrappers
		getCLS(this.handleCLSMetric.bind(this));
		getFCP(this.handleFCPMetric.bind(this));
		getFID(this.handleFIDMetric.bind(this));
		getLCP(this.handleLCPMetric.bind(this));
		getTTFB(this.handleTTFBMetric.bind(this));
		onINP(this.handleINPMetric.bind(this));

		// Healthcare-specific monitoring
		this.monitorHealthcareWorkflows();
	}

	/**
	 * Handle metric measurement
	 */
	private handleMetric(metric: WebVitalsMetric): void {
		const healthcareMetric: HealthcareVitalsMetric = {
			...metric,
			...this.healthcareContext,
			deviceType: this.healthcareContext.deviceType as any,
			networkConnection: this.healthcareContext.networkConnection as any,
			criticalPath: this.isCriticalHealthcarePath(metric.name),
			rating: this.calculateHealthcareRating(metric),
		};

		// Notify all handlers
		this.handlers.forEach((handler) => handler(healthcareMetric));

		// Log critical performance issues
		if (healthcareMetric.rating === "poor" && healthcareMetric.criticalPath) {
		}
	}

	/**
	 * Type-safe wrapper for CLS metrics
	 */
	private handleCLSMetric(metric: CLSMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Type-safe wrapper for FCP metrics
	 */
	private handleFCPMetric(metric: FCPMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Type-safe wrapper for FID metrics
	 */
	private handleFIDMetric(metric: FIDMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Type-safe wrapper for LCP metrics
	 */
	private handleLCPMetric(metric: LCPMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Type-safe wrapper for TTFB metrics
	 */
	private handleTTFBMetric(metric: TTFBMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Type-safe wrapper for INP metrics
	 */
	private handleINPMetric(metric: INPMetric): void {
		const webVitalsMetric: WebVitalsMetric = {
			...metric,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};
		this.handleMetric(webVitalsMetric);
	}

	/**
	 * Calculate healthcare-specific rating
	 */
	private calculateHealthcareRating(metric: WebVitalsMetric): "good" | "needs-improvement" | "poor" {
		const threshold = this.thresholds[metric.name];
		if (!threshold) {
			return metric.rating;
		}

		if (metric.value <= threshold.good) {
			return "good";
		}
		if (metric.value <= threshold.poor) {
			return "needs-improvement";
		}
		return "poor";
	}

	/**
	 * Check if this is a critical healthcare path
	 */
	private isCriticalHealthcarePath(_metricName: string): boolean {
		const criticalWorkflows = ["patient-registration", "medical-form", "real-time-update"];

		return criticalWorkflows.includes(this.healthcareContext.workflowType || "");
	}

	/**
	 * Monitor healthcare-specific workflows
	 */
	private monitorHealthcareWorkflows(): void {
		// Patient lookup performance
		this.monitorPatientLookup();

		// Medical form performance
		this.monitorMedicalForms();

		// Real-time updates performance
		this.monitorRealTimeUpdates();

		// Procedure scheduling performance
		this.monitorProcedureScheduling();
	}

	/**
	 * Monitor patient lookup performance
	 */
	private monitorPatientLookup(): void {
		const observer = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				if (entry.name.includes("patient-lookup") || entry.name.includes("/api/patients")) {
					const metric: HealthcareVitalsMetric = {
						name: "TTFB",
						value: entry.duration,
						delta: entry.duration,
						rating:
							entry.duration <= this.thresholds.patientLookup.good
								? "good"
								: entry.duration <= this.thresholds.patientLookup.poor
									? "needs-improvement"
									: "poor",
						id: `patient-lookup-${Date.now()}`,
						navigationType: "navigate",
						timestamp: Date.now(),
						url: window.location.href,
						userAgent: navigator.userAgent,
						workflowType: "patient-registration" as const,
						...this.healthcareContext,
						criticalPath: true,
					};

					this.handlers.forEach((handler) => handler(metric));
				}
			});
		});

		observer.observe({ entryTypes: ["navigation", "resource"] });
	}

	/**
	 * Monitor medical form performance
	 */
	private monitorMedicalForms(): void {
		// Monitor form rendering performance
		const formObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element;
							if (element.tagName === "FORM" || element.classList.contains("medical-form")) {
								const renderTime = performance.now();
								const metric: HealthcareVitalsMetric = {
									name: "LCP",
									value: renderTime,
									delta: renderTime,
									rating:
										renderTime <= this.thresholds.medicalFormLoad.good
											? "good"
											: renderTime <= this.thresholds.medicalFormLoad.poor
												? "needs-improvement"
												: "poor",
									id: `medical-form-${Date.now()}`,
									navigationType: "navigate",
									timestamp: Date.now(),
									url: window.location.href,
									userAgent: navigator.userAgent,
									workflowType: "medical-form" as const,
									...this.healthcareContext,
									criticalPath: true,
								};

								this.handlers.forEach((handler) => handler(metric));
							}
						}
					});
				}
			});
		});

		formObserver.observe(document.body, { childList: true, subtree: true });
	}

	/**
	 * Monitor real-time updates performance
	 */
	private monitorRealTimeUpdates(): void {
		// Monitor WebSocket and real-time data updates
		let lastUpdateTime = performance.now();

		// Listen for custom real-time update events
		document.addEventListener("healthcare-realtime-update", () => {
			const updateTime = performance.now();
			const timeSinceLastUpdate = updateTime - lastUpdateTime;

			const metric: HealthcareVitalsMetric = {
				name: "INP",
				value: timeSinceLastUpdate,
				delta: timeSinceLastUpdate,
				rating:
					timeSinceLastUpdate <= this.thresholds.realTimeUpdate.good
						? "good"
						: timeSinceLastUpdate <= this.thresholds.realTimeUpdate.poor
							? "needs-improvement"
							: "poor",
				id: `realtime-update-${Date.now()}`,
				navigationType: "navigate",
				timestamp: Date.now(),
				url: window.location.href,
				userAgent: navigator.userAgent,
				workflowType: "real-time-update" as const,
				...this.healthcareContext,
				criticalPath: true,
			};

			this.handlers.forEach((handler) => handler(metric));
			lastUpdateTime = updateTime;
		});
	}

	/**
	 * Monitor procedure scheduling performance
	 */
	private monitorProcedureScheduling(): void {
		// Monitor calendar and scheduling interactions
		document.addEventListener("click", (event) => {
			const target = event.target as Element;
			if (target.closest(".scheduling-calendar") || target.closest(".appointment-form")) {
				const interactionTime = performance.now();

				setTimeout(() => {
					const responseTime = performance.now() - interactionTime;
					const metric: HealthcareVitalsMetric = {
						name: "FID",
						value: responseTime,
						delta: responseTime,
						rating:
							responseTime <= this.thresholds.procedureScheduling.good
								? "good"
								: responseTime <= this.thresholds.procedureScheduling.poor
									? "needs-improvement"
									: "poor",
						id: `procedure-scheduling-${Date.now()}`,
						navigationType: "navigate",
						timestamp: Date.now(),
						url: window.location.href,
						userAgent: navigator.userAgent,
						workflowType: "procedure-scheduling" as const,
						...this.healthcareContext,
						criticalPath: false,
					};

					this.handlers.forEach((handler) => handler(metric));
				}, 0);
			}
		});
	}

	/**
	 * Detect device type
	 */
	private detectDeviceType(): void {
		const userAgent = navigator.userAgent.toLowerCase();
		if (/tablet|ipad|playbook|silk/.test(userAgent)) {
			this.healthcareContext.deviceType = "tablet";
		} else if (
			/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)
		) {
			this.healthcareContext.deviceType = "mobile";
		} else {
			this.healthcareContext.deviceType = "desktop";
		}
	}

	/**
	 * Detect network connection
	 */
	private detectNetworkConnection(): void {
		if ("connection" in navigator) {
			const connection = (navigator as any).connection;
			if (connection.effectiveType === "4g") {
				this.healthcareContext.networkConnection = "fast";
			} else if (connection.effectiveType === "3g") {
				this.healthcareContext.networkConnection = "slow";
			} else {
				this.healthcareContext.networkConnection = "slow";
			}
		} else {
			this.healthcareContext.networkConnection = "fast"; // Default assumption
		}
	}
}

export { HealthcareWebVitals };
export default HealthcareWebVitals;
