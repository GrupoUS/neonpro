import { AlertTriangle, CheckCircle, Eye, Keyboard, Volume2, X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { ContrastValidator, calculateContrastRatio } from "./contrast-validator";

/**
 * NEONPRO HEALTHCARE - ACCESSIBILITY MONITOR
 *
 * Real-time accessibility monitoring component for development and testing.
 * Provides live feedback about accessibility violations and improvements.
 *
 * Features:
 * - Real-time WCAG 2.1 AA compliance monitoring
 * - Color contrast validation
 * - Keyboard navigation testing
 * - Screen reader compatibility checks
 * - Healthcare-specific accessibility requirements
 * - Live violation reporting
 * - Performance impact monitoring
 */

interface AccessibilityIssue {
	id: string;
	type: "contrast" | "keyboard" | "aria" | "heading" | "form" | "landmark";
	severity: "critical" | "serious" | "moderate" | "minor";
	element: HTMLElement;
	description: string;
	wcagCriterion: string;
	suggestion: string;
	healthcare?: boolean;
}

interface AccessibilityStats {
	totalElements: number;
	violationsCount: number;
	contrastIssues: number;
	keyboardIssues: number;
	ariaIssues: number;
	healthcareCompliance: number; // percentage
	wcagLevel: "AA" | "AAA" | "Failed";
	lastScan: Date;
}

interface AccessibilityMonitorProps {
	/**
	 * Whether the monitor is active
	 */
	enabled?: boolean;

	/**
	 * Position of the monitor panel
	 */
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

	/**
	 * Healthcare context for specialized monitoring
	 */
	healthcareContext?: boolean;

	/**
	 * Auto-scan interval in milliseconds (0 to disable)
	 */
	scanInterval?: number;

	/**
	 * Minimum severity level to report
	 */
	minimumSeverity?: "critical" | "serious" | "moderate" | "minor";

	/**
	 * Include performance metrics
	 */
	includePerformance?: boolean;

	/**
	 * Callback when issues are found
	 */
	onIssuesFound?: (issues: AccessibilityIssue[], stats: AccessibilityStats) => void;

	/**
	 * Development mode (shows more detailed information)
	 */
	devMode?: boolean;
}

const AccessibilityMonitor: React.FC<AccessibilityMonitorProps> = ({
	enabled = process.env.NODE_ENV === "development",
	position = "bottom-right",
	healthcareContext = true,
	scanInterval = 5000,
	minimumSeverity = "moderate",
	includePerformance = true,
	onIssuesFound,
	devMode = process.env.NODE_ENV === "development",
}) => {
	const [isExpanded, setIsExpanded] = React.useState(false);
	const [issues, setIssues] = React.useState<AccessibilityIssue[]>([]);
	const [stats, setStats] = React.useState<AccessibilityStats>({
		totalElements: 0,
		violationsCount: 0,
		contrastIssues: 0,
		keyboardIssues: 0,
		ariaIssues: 0,
		healthcareCompliance: 100,
		wcagLevel: "AA",
		lastScan: new Date(),
	});
	const [isScanning, setIsScanning] = React.useState(false);

	const scanTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	/**
	 * Scan for color contrast violations
	 */
	const scanContrastViolations = (): AccessibilityIssue[] => {
		const violations: AccessibilityIssue[] = [];
		const elements = document.querySelectorAll("*");

		elements.forEach((element, index) => {
			const htmlElement = element as HTMLElement;
			const computedStyle = window.getComputedStyle(htmlElement);
			const backgroundColor = computedStyle.backgroundColor;
			const color = computedStyle.color;
			const fontSize = Number.parseFloat(computedStyle.fontSize);

			// Skip elements with transparent backgrounds or no text
			if (backgroundColor === "rgba(0, 0, 0, 0)" || !htmlElement.textContent?.trim()) {
				return;
			}

			const textSize = fontSize >= 18 || computedStyle.fontWeight === "bold" ? "large" : "normal";
			const isHealthcareElement =
				htmlElement.hasAttribute("data-medical-context") ||
				htmlElement.hasAttribute("data-sensitive") ||
				htmlElement.hasAttribute("data-emergency");

			const minimumRatio =
				healthcareContext || isHealthcareElement
					? textSize === "large"
						? 4.5
						: 7.0
					: textSize === "large"
						? 3.0
						: 4.5;

			const ratio = calculateContrastRatio(backgroundColor, color);

			if (ratio < minimumRatio && ratio > 0) {
				violations.push({
					id: `contrast-${index}`,
					type: "contrast",
					severity: ratio < 3.0 ? "critical" : ratio < 4.5 ? "serious" : "moderate",
					element: htmlElement,
					description: `Color contrast ratio ${ratio.toFixed(2)}:1 is below minimum ${minimumRatio}:1`,
					wcagCriterion: "WCAG 2.1 SC 1.4.3 Contrast (Minimum)",
					suggestion: `Increase contrast between background (${backgroundColor}) and text (${color})`,
					healthcare: isHealthcareElement,
				});
			}
		});

		return violations;
	};

	/**
	 * Scan for keyboard navigation issues
	 */
	const scanKeyboardViolations = (): AccessibilityIssue[] => {
		const violations: AccessibilityIssue[] = [];
		const interactiveElements = document.querySelectorAll(
			'button, [role="button"], input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
		);

		interactiveElements.forEach((element, index) => {
			const htmlElement = element as HTMLElement;
			const tabIndex = htmlElement.tabIndex;
			const computedStyle = window.getComputedStyle(htmlElement);

			// Check if focusable element has visible focus indicator
			const hasFocusStyles =
				computedStyle.outline !== "none" ||
				computedStyle.boxShadow.includes("0px 0px") ||
				htmlElement.classList.contains("focus:ring") ||
				htmlElement.classList.contains("focus-visible:ring");

			if (tabIndex >= 0 && !hasFocusStyles) {
				violations.push({
					id: `keyboard-focus-${index}`,
					type: "keyboard",
					severity: "serious",
					element: htmlElement,
					description: "Interactive element lacks visible focus indicator",
					wcagCriterion: "WCAG 2.1 SC 2.4.7 Focus Visible",
					suggestion: "Add focus-visible:ring or similar focus styling",
					healthcare: htmlElement.hasAttribute("data-medical-context"),
				});
			}

			// Check for skip links
			if (htmlElement.tagName === "MAIN" && !document.querySelector('[data-skip-link="true"]')) {
				violations.push({
					id: "missing-skip-link",
					type: "keyboard",
					severity: "moderate",
					element: htmlElement,
					description: "Missing skip link for main content",
					wcagCriterion: "WCAG 2.1 SC 2.4.1 Bypass Blocks",
					suggestion: "Add SkipToContent component before main navigation",
					healthcare: true,
				});
			}
		});

		return violations;
	};

	/**
	 * Scan for ARIA and semantic issues
	 */
	const scanAriaViolations = (): AccessibilityIssue[] => {
		const violations: AccessibilityIssue[] = [];

		// Check for missing alt text on images
		const images = document.querySelectorAll("img:not([alt])");
		images.forEach((img, index) => {
			violations.push({
				id: `img-alt-${index}`,
				type: "aria",
				severity: "serious",
				element: img as HTMLElement,
				description: "Image missing alt attribute",
				wcagCriterion: "WCAG 2.1 SC 1.1.1 Non-text Content",
				suggestion: 'Add descriptive alt text or alt="" for decorative images',
				healthcare: (img as HTMLElement).hasAttribute("data-medical-context"),
			});
		});

		// Check for form labels
		const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
		inputs.forEach((input, index) => {
			const htmlInput = input as HTMLInputElement;
			const hasLabel = htmlInput.labels && htmlInput.labels.length > 0;
			const hasAriaLabel = htmlInput.hasAttribute("aria-label") || htmlInput.hasAttribute("aria-labelledby");

			if (!(hasLabel || hasAriaLabel)) {
				violations.push({
					id: `form-label-${index}`,
					type: "form",
					severity: "critical",
					element: htmlInput,
					description: "Form control missing accessible label",
					wcagCriterion: "WCAG 2.1 SC 3.3.2 Labels or Instructions",
					suggestion: "Add <label>, aria-label, or aria-labelledby attribute",
					healthcare: htmlInput.hasAttribute("data-medical-type"),
				});
			}
		});

		// Check for heading hierarchy
		const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
		let previousLevel = 0;

		headings.forEach((heading, index) => {
			const level = Number.parseInt(heading.tagName.slice(1));

			if (level > previousLevel + 1 && previousLevel !== 0) {
				violations.push({
					id: `heading-hierarchy-${index}`,
					type: "heading",
					severity: "moderate",
					element: heading as HTMLElement,
					description: `Heading level ${level} skips from level ${previousLevel}`,
					wcagCriterion: "WCAG 2.1 SC 1.3.1 Info and Relationships",
					suggestion: "Use sequential heading levels (h1, h2, h3, etc.)",
					healthcare: false,
				});
			}

			previousLevel = level;
		});

		return violations;
	};

	/**
	 * Run comprehensive accessibility scan
	 */
	const runAccessibilityScan = React.useCallback(async () => {
		if (!enabled) return;

		setIsScanning(true);

		try {
			// Simulate scan delay for visual feedback
			await new Promise((resolve) => setTimeout(resolve, 500));

			const contrastViolations = scanContrastViolations();
			const keyboardViolations = scanKeyboardViolations();
			const ariaViolations = scanAriaViolations();

			const allViolations = [...contrastViolations, ...keyboardViolations, ...ariaViolations].filter((issue) => {
				const severityLevels = {
					critical: 4,
					serious: 3,
					moderate: 2,
					minor: 1,
				};
				return severityLevels[issue.severity] >= severityLevels[minimumSeverity];
			});

			const totalElements = document.querySelectorAll("*").length;
			const healthcareElements = document.querySelectorAll(
				"[data-medical-context], [data-sensitive], [data-lgpd]"
			).length;
			const healthcareViolations = allViolations.filter((v) => v.healthcare).length;

			const newStats: AccessibilityStats = {
				totalElements,
				violationsCount: allViolations.length,
				contrastIssues: contrastViolations.length,
				keyboardIssues: keyboardViolations.length,
				ariaIssues: ariaViolations.length,
				healthcareCompliance:
					healthcareElements > 0
						? Math.round(((healthcareElements - healthcareViolations) / healthcareElements) * 100)
						: 100,
				wcagLevel: allViolations.some((v) => v.severity === "critical")
					? "Failed"
					: allViolations.some((v) => v.severity === "serious")
						? "AA"
						: "AAA",
				lastScan: new Date(),
			};

			setIssues(allViolations);
			setStats(newStats);
			onIssuesFound?.(allViolations, newStats);
		} catch (error) {
			console.error("Accessibility scan failed:", error);
		} finally {
			setIsScanning(false);
		}
	}, [enabled, minimumSeverity, onIssuesFound, healthcareContext]);

	// Auto-scan setup
	React.useEffect(() => {
		if (!enabled || scanInterval === 0) return;

		// Initial scan
		runAccessibilityScan();

		// Set up interval scanning
		scanTimeoutRef.current = setInterval(runAccessibilityScan, scanInterval);

		return () => {
			if (scanTimeoutRef.current) {
				clearInterval(scanTimeoutRef.current);
			}
		};
	}, [enabled, scanInterval, runAccessibilityScan]);

	// Don't render in production unless explicitly enabled
	if (!enabled && process.env.NODE_ENV === "production") {
		return null;
	}

	const getSeverityColor = (severity: AccessibilityIssue["severity"]) => {
		switch (severity) {
			case "critical":
				return "text-red-600 bg-red-50";
			case "serious":
				return "text-orange-600 bg-orange-50";
			case "moderate":
				return "text-yellow-600 bg-yellow-50";
			case "minor":
				return "text-blue-600 bg-blue-50";
		}
	};

	const getWcagLevelColor = () => {
		switch (stats.wcagLevel) {
			case "AAA":
				return "text-green-600 bg-green-50";
			case "AA":
				return "text-yellow-600 bg-yellow-50";
			case "Failed":
				return "text-red-600 bg-red-50";
		}
	};

	return (
		<div
			aria-label="Accessibility Monitor"
			className={cn("fixed z-[9999] max-w-sm shadow-2xl", {
				"top-4 left-4": position === "top-left",
				"top-4 right-4": position === "top-right",
				"bottom-4 left-4": position === "bottom-left",
				"right-4 bottom-4": position === "bottom-right",
			})}
			role="complementary"
		>
			{/* Collapsed Summary */}
			<div
				className={cn(
					"cursor-pointer rounded-lg border bg-white p-3 transition-all duration-200 hover:shadow-lg",
					isExpanded && "rounded-b-none border-b-0"
				)}
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setIsExpanded(!isExpanded);
					}
				}}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"h-3 w-3 rounded-full",
								stats.wcagLevel === "AAA" ? "bg-green-500" : stats.wcagLevel === "AA" ? "bg-yellow-500" : "bg-red-500"
							)}
						/>
						<span className="font-medium text-sm">A11y Monitor</span>
						<span className={cn("rounded px-2 py-1 font-medium text-xs", getWcagLevelColor())}>{stats.wcagLevel}</span>
					</div>

					<div className="flex items-center gap-2">
						{isScanning && (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						)}
						<span className="text-gray-500 text-xs">{stats.violationsCount} issues</span>
						<button
							aria-label="Close accessibility monitor"
							className="text-gray-400 hover:text-gray-600"
							onClick={(e) => {
								e.stopPropagation();
								setIsExpanded(false);
							}}
						>
							{isExpanded ? <X className="h-4 w-4" /> : null}
						</button>
					</div>
				</div>
			</div>

			{/* Expanded Details */}
			{isExpanded && (
				<div className="max-h-96 overflow-y-auto rounded-b-lg border border-t-0 bg-white">
					{/* Stats Summary */}
					<div className="border-b bg-gray-50 p-3">
						<div className="grid grid-cols-2 gap-4 text-xs">
							<div>
								<div className="font-medium text-gray-700">Elements Scanned</div>
								<div className="font-bold text-gray-900 text-lg">{stats.totalElements}</div>
							</div>
							<div>
								<div className="font-medium text-gray-700">Healthcare Compliance</div>
								<div className="font-bold text-green-600 text-lg">{stats.healthcareCompliance}%</div>
							</div>
						</div>

						<div className="mt-3 flex gap-4 text-xs">
							<div className="flex items-center gap-1">
								<Eye className="h-3 w-3 text-blue-500" />
								<span>{stats.contrastIssues} contrast</span>
							</div>
							<div className="flex items-center gap-1">
								<Keyboard className="h-3 w-3 text-green-500" />
								<span>{stats.keyboardIssues} keyboard</span>
							</div>
							<div className="flex items-center gap-1">
								<Volume2 className="h-3 w-3 text-purple-500" />
								<span>{stats.ariaIssues} ARIA</span>
							</div>
						</div>

						<div className="mt-2 text-gray-500 text-xs">Last scan: {stats.lastScan.toLocaleTimeString()}</div>
					</div>

					{/* Issues List */}
					<div className="p-2">
						{issues.length === 0 ? (
							<div className="flex items-center gap-2 p-3 text-green-600">
								<CheckCircle className="h-4 w-4" />
								<span className="font-medium text-sm">No accessibility issues found!</span>
							</div>
						) : (
							<div className="space-y-2">
								{issues.slice(0, 10).map((issue) => (
									<div
										className={cn(
											"cursor-pointer rounded-md border-l-4 p-2 hover:bg-gray-50",
											issue.severity === "critical" && "border-l-red-500",
											issue.severity === "serious" && "border-l-orange-500",
											issue.severity === "moderate" && "border-l-yellow-500",
											issue.severity === "minor" && "border-l-blue-500"
										)}
										key={issue.id}
										onClick={() => {
											issue.element.scrollIntoView({
												behavior: "smooth",
												block: "center",
											});
											issue.element.focus();
										}}
										role="button"
										tabIndex={0}
									>
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-2">
												<AlertTriangle
													className={cn(
														"mt-0.5 h-3 w-3",
														issue.severity === "critical" && "text-red-500",
														issue.severity === "serious" && "text-orange-500",
														issue.severity === "moderate" && "text-yellow-500",
														issue.severity === "minor" && "text-blue-500"
													)}
												/>
												<div className="flex-1">
													<div className="font-medium text-gray-900 text-xs">{issue.description}</div>
													<div className="mt-1 text-gray-500 text-xs">{issue.wcagCriterion}</div>
													{devMode && <div className="mt-1 text-gray-400 text-xs">{issue.suggestion}</div>}
												</div>
											</div>
											<div className="flex gap-1">
												<span
													className={cn("rounded px-1.5 py-0.5 font-medium text-xs", getSeverityColor(issue.severity))}
												>
													{issue.severity}
												</span>
												{issue.healthcare && (
													<span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600 text-xs">HC</span>
												)}
											</div>
										</div>
									</div>
								))}

								{issues.length > 10 && (
									<div className="p-2 text-center text-gray-500 text-xs">... and {issues.length - 10} more issues</div>
								)}
							</div>
						)}

						<div className="mt-3 border-t pt-2">
							<button
								className="w-full rounded-md bg-primary px-3 py-2 font-medium text-white text-xs transition-colors hover:bg-primary/90"
								disabled={isScanning}
								onClick={runAccessibilityScan}
							>
								{isScanning ? "Scanning..." : "Rescan Now"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

AccessibilityMonitor.displayName = "AccessibilityMonitor";

export { AccessibilityMonitor, type AccessibilityIssue, type AccessibilityStats, type AccessibilityMonitorProps };
