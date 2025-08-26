#!/usr/bin/env node
/**
 * Claude Code Session Stop Hook - Cross-Platform Version
 * Version: 6.0.0 - Cross-Platform Node.js Implementation
 *
 * Executes when the main Claude session stops, providing final cleanup and reporting
 */

const utils = require("./utils.js");

async function sessionStop() {
	try {
		// Set up hook environment
		const env = utils.setHookEnvironment("session_stop");

		// Log hook execution start
		utils.log("INFO", "SESSION_STOP", `Session stop hook executing for session: ${env.sessionId}`);

		// Generate final session report
		await generateFinalReport(env);

		// Perform final cleanup
		await performFinalCleanup(env);

		// Archive session data
		await archiveSessionData(env);

		// Perform system maintenance
		await performSystemMaintenance(env);

		// Log successful completion
		utils.log("SUCCESS", "SESSION_STOP", "Session stop hook completed successfully");

		// Exit successfully
		process.exit(0);
	} catch (error) {
		// Log error but don't fail the hook
		utils.log("ERROR", "SESSION_STOP", `Session stop hook error: ${error.message}`);

		// Exit with success to not block Claude
		process.exit(0);
	}
}

/**
 * Generate comprehensive final session report
 */
async function generateFinalReport(env) {
	try {
		utils.log("INFO", "SESSION_STOP", "Generating final session report");

		// Get comprehensive session data
		const sessionData = await gatherSessionData(env);

		// Generate detailed metrics
		const metrics = await calculateSessionMetrics(sessionData);

		// Create final report
		const report = {
			sessionId: env.sessionId,
			finalTimestamp: utils.getTimestamp(),
			platform: env.platform,
			summary: {
				totalDuration: metrics.totalDuration,
				totalTools: metrics.totalTools,
				uniqueTools: metrics.uniqueTools,
				successRate: metrics.successRate,
				errors: metrics.errors,
				warnings: metrics.warnings,
			},
			toolUsage: metrics.toolUsage,
			performance: metrics.performance,
			patterns: metrics.patterns,
			system: utils.getSystemInfo(),
			git: await utils.getGitInfo(),
		};

		// Save comprehensive report
		const reportFile = `${utils.cacheDir}/final-report-${env.sessionId}.json`;
		utils.safeWriteFile(reportFile, JSON.stringify(report, null, 2));

		// Create summary for easy reading
		const summaryFile = `${utils.cacheDir}/session-summary-${env.sessionId}.txt`;
		const summaryText = await generateSummaryText(report);
		utils.safeWriteFile(summaryFile, summaryText);

		utils.log(
			"INFO",
			"SESSION_STOP",
			`Final report generated: ${metrics.totalTools} tools, ${Math.round(metrics.totalDuration / 1000)}s duration`
		);
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `Final report generation error: ${error.message}`);
	}
}

/**
 * Gather comprehensive session data
 */
async function gatherSessionData(_env) {
	try {
		const logContent = utils.safeReadFile(utils.logFile);
		if (!logContent) {
			return {
				tools: [],
				errors: [],
				warnings: [],
				activities: [],
			};
		}

		const lines = logContent.split("\n").filter((line) => line.trim());
		const sessionLines = lines.filter(
			(line) =>
				line.includes("[PRE_TOOL_HOOK]") ||
				line.includes("[POST_TOOL_HOOK]") ||
				line.includes("[SESSION_HOOK]") ||
				line.includes("[ERROR]") ||
				line.includes("[WARN]")
		);

		const tools = [];
		const errors = [];
		const warnings = [];
		const activities = [];

		sessionLines.forEach((line) => {
			// Parse timestamp
			const timestampMatch = line.match(/\[(.*?)\]/);
			const timestamp = timestampMatch ? timestampMatch[1] : null;

			// Parse tool usage
			if (line.includes("PRE_TOOL_HOOK") && line.includes("executing for tool:")) {
				const toolMatch = line.match(/executing for tool: ([^\s]+)/);
				if (toolMatch) {
					tools.push({
						name: toolMatch[1],
						timestamp,
						phase: "pre",
					});
				}
			}

			if (line.includes("POST_TOOL_HOOK") && line.includes("completed successfully")) {
				const toolMatch = line.match(/completed successfully for ([^\s]+)/);
				if (toolMatch) {
					// Find matching pre-tool entry
					const matchingPre = tools.find((t) => t.name === toolMatch[1] && t.phase === "pre" && !t.completed);
					if (matchingPre) {
						matchingPre.completed = true;
						matchingPre.completedTimestamp = timestamp;
					}
				}
			}

			// Parse errors and warnings
			if (line.includes("[ERROR]")) {
				errors.push({
					message: line,
					timestamp,
				});
			}

			if (line.includes("[WARN]")) {
				warnings.push({
					message: line,
					timestamp,
				});
			}

			// Parse activities
			activities.push({
				message: line,
				timestamp,
				type: line.includes("[ERROR]")
					? "error"
					: line.includes("[WARN]")
						? "warning"
						: line.includes("[SUCCESS]")
							? "success"
							: "info",
			});
		});

		return {
			tools,
			errors,
			warnings,
			activities,
		};
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `Session data gathering error: ${error.message}`);
		return {
			tools: [],
			errors: [],
			warnings: [],
			activities: [],
		};
	}
}

/**
 * Calculate detailed session metrics
 */
async function calculateSessionMetrics(sessionData) {
	try {
		const tools = sessionData.tools;
		const totalTools = tools.length;
		const uniqueTools = [...new Set(tools.map((t) => t.name))];

		// Calculate duration
		let totalDuration = 0;
		const timestamps = sessionData.activities
			.map((a) => a.timestamp)
			.filter((t) => t)
			.map((t) => new Date(t))
			.sort((a, b) => a - b);

		if (timestamps.length > 1) {
			totalDuration = timestamps.at(-1) - timestamps[0];
		}

		// Calculate success rate
		const completedTools = tools.filter((t) => t.completed).length;
		const successRate = totalTools > 0 ? (completedTools / totalTools) * 100 : 100;

		// Tool usage frequency
		const toolUsage = {};
		tools.forEach((tool) => {
			toolUsage[tool.name] = (toolUsage[tool.name] || 0) + 1;
		});

		// Performance metrics
		const performance = {
			avgToolDuration: 0,
			fastestTool: null,
			slowestTool: null,
			toolDurations: [],
		};

		// Calculate individual tool durations
		tools.forEach((tool) => {
			if (tool.completed && tool.timestamp && tool.completedTimestamp) {
				try {
					const start = new Date(tool.timestamp);
					const end = new Date(tool.completedTimestamp);
					const duration = end - start;

					performance.toolDurations.push({
						tool: tool.name,
						duration,
					});
				} catch (_e) {
					// Ignore timestamp parsing errors
				}
			}
		});

		if (performance.toolDurations.length > 0) {
			const durations = performance.toolDurations.map((t) => t.duration);
			performance.avgToolDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

			const sorted = performance.toolDurations.sort((a, b) => a.duration - b.duration);
			performance.fastestTool = sorted[0];
			performance.slowestTool = sorted.at(-1);
		}

		// Pattern analysis
		const patterns = await analyzeUsagePatterns(tools, sessionData);

		return {
			totalDuration,
			totalTools,
			uniqueTools: uniqueTools.length,
			successRate,
			errors: sessionData.errors.length,
			warnings: sessionData.warnings.length,
			toolUsage,
			performance,
			patterns,
		};
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `Metrics calculation error: ${error.message}`);
		return {
			totalDuration: 0,
			totalTools: 0,
			uniqueTools: 0,
			successRate: 0,
			errors: 0,
			warnings: 0,
			toolUsage: {},
			performance: {},
			patterns: {},
		};
	}
}

/**
 * Analyze usage patterns
 */
async function analyzeUsagePatterns(tools, _sessionData) {
	try {
		const patterns = {
			mostUsedTool: null,
			toolSequences: [],
			workflowTypes: [],
			peakActivity: null,
		};

		// Find most used tool
		const toolCounts = {};
		tools.forEach((tool) => {
			toolCounts[tool.name] = (toolCounts[tool.name] || 0) + 1;
		});

		if (Object.keys(toolCounts).length > 0) {
			const maxCount = Math.max(...Object.values(toolCounts));
			patterns.mostUsedTool = {
				tool: Object.keys(toolCounts).find((key) => toolCounts[key] === maxCount),
				count: maxCount,
			};
		}

		// Analyze tool sequences
		const toolNames = tools.map((t) => t.name);
		const sequences = [];
		for (let i = 0; i < toolNames.length - 2; i++) {
			sequences.push(`${toolNames[i]} → ${toolNames[i + 1]} → ${toolNames[i + 2]}`);
		}

		const sequenceFreq = {};
		sequences.forEach((seq) => {
			sequenceFreq[seq] = (sequenceFreq[seq] || 0) + 1;
		});

		patterns.toolSequences = Object.entries(sequenceFreq)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([seq, count]) => ({ sequence: seq, count }));

		// Detect workflow types
		const uniqueToolNames = [...new Set(toolNames)];
		if (uniqueToolNames.includes("bash") && uniqueToolNames.includes("write")) {
			patterns.workflowTypes.push("development");
		}
		if (uniqueToolNames.some((t) => t.includes("archon"))) {
			patterns.workflowTypes.push("task-management");
		}
		if (uniqueToolNames.includes("read") && uniqueToolNames.includes("edit")) {
			patterns.workflowTypes.push("code-review");
		}

		return patterns;
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `Pattern analysis error: ${error.message}`);
		return {};
	}
}

/**
 * Generate human-readable summary text
 */
async function generateSummaryText(report) {
	const lines = [
		"Claude Code Session Summary",
		"==========================",
		`Session ID: ${report.sessionId}`,
		`Platform: ${report.platform}`,
		`End Time: ${report.finalTimestamp}`,
		`Duration: ${Math.round(report.summary.totalDuration / 1000)} seconds`,
		"",
		"Tool Usage:",
		`- Total tools used: ${report.summary.totalTools}`,
		`- Unique tools: ${report.summary.uniqueTools}`,
		`- Success rate: ${report.summary.successRate.toFixed(1)}%`,
		`- Errors: ${report.summary.errors}`,
		`- Warnings: ${report.summary.warnings}`,
		"",
	];

	if (report.patterns.mostUsedTool) {
		lines.push(`Most Used Tool: ${report.patterns.mostUsedTool.tool} (${report.patterns.mostUsedTool.count} times)`);
	}

	if (report.patterns.workflowTypes.length > 0) {
		lines.push(`Workflow Types: ${report.patterns.workflowTypes.join(", ")}`);
	}

	if (report.git.branch !== "unknown") {
		lines.push("");
		lines.push("Git Status:");
		lines.push(`- Branch: ${report.git.branch}`);
		lines.push(`- Has changes: ${report.git.hasChanges}`);
	}

	return lines.join("\n");
}

/**
 * Perform final cleanup tasks
 */
async function performFinalCleanup(env) {
	try {
		utils.log("INFO", "SESSION_STOP", "Performing final cleanup");

		// Clear temporary session data
		await clearSessionTempData(env);

		// Optimize cache
		await optimizeCache();

		utils.log("INFO", "SESSION_STOP", "Final cleanup completed");
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `Final cleanup error: ${error.message}`);
	}
}

/**
 * Clear temporary session data
 */
async function clearSessionTempData(env) {
	try {
		const fs = require("node:fs");
		if (!fs.existsSync(utils.cacheDir)) {
			return;
		}

		const files = fs.readdirSync(utils.cacheDir);
		const tempFiles = files.filter((f) => f.includes(env.sessionId) && f.includes("temp"));

		let removedCount = 0;
		tempFiles.forEach((file) => {
			try {
				const filePath = `${utils.cacheDir}/${file}`;
				fs.unlinkSync(filePath);
				removedCount++;
			} catch (_e) {
				// Ignore individual file errors
			}
		});

		if (removedCount > 0) {
			utils.log("INFO", "SESSION_STOP", `Cleaned up ${removedCount} temporary files`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_STOP", `Temp data cleanup error: ${error.message}`);
	}
}

/**
 * Optimize cache directory
 */
async function optimizeCache() {
	try {
		const fs = require("node:fs");
		if (!fs.existsSync(utils.cacheDir)) {
			return;
		}

		const files = fs.readdirSync(utils.cacheDir);

		// Remove very old files (older than 30 days)
		const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
		let optimizedCount = 0;

		files.forEach((file) => {
			try {
				const filePath = `${utils.cacheDir}/${file}`;
				const stats = fs.statSync(filePath);

				if (stats.mtime.getTime() < monthAgo) {
					fs.unlinkSync(filePath);
					optimizedCount++;
				}
			} catch (_e) {
				// Ignore individual file errors
			}
		});

		if (optimizedCount > 0) {
			utils.log("INFO", "SESSION_STOP", `Optimized cache: removed ${optimizedCount} old files`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_STOP", `Cache optimization error: ${error.message}`);
	}
}

/**
 * Archive important session data
 */
async function archiveSessionData(env) {
	try {
		utils.log("INFO", "SESSION_STOP", "Archiving session data");

		// Create archive directory if needed
		const archiveDir = `${utils.cacheDir}/archive`;
		const fs = require("node:fs");
		if (!fs.existsSync(archiveDir)) {
			fs.mkdirSync(archiveDir, { recursive: true });
		}

		// Archive important files
		const filesToArchive = [`final-report-${env.sessionId}.json`, `session-summary-${env.sessionId}.txt`];

		let archivedCount = 0;
		filesToArchive.forEach((file) => {
			try {
				const sourcePath = `${utils.cacheDir}/${file}`;
				const destPath = `${archiveDir}/${file}`;

				if (fs.existsSync(sourcePath)) {
					fs.copyFileSync(sourcePath, destPath);
					archivedCount++;
				}
			} catch (_e) {
				// Ignore individual file errors
			}
		});

		if (archivedCount > 0) {
			utils.log("INFO", "SESSION_STOP", `Archived ${archivedCount} session files`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_STOP", `Session archiving error: ${error.message}`);
	}
}

/**
 * Perform system maintenance tasks
 */
async function performSystemMaintenance(env) {
	try {
		utils.log("INFO", "SESSION_STOP", "Performing system maintenance");

		// Update system statistics
		await updateSystemStats(env);

		// Check system health
		await checkSystemHealth();

		utils.log("INFO", "SESSION_STOP", "System maintenance completed");
	} catch (error) {
		utils.log("ERROR", "SESSION_STOP", `System maintenance error: ${error.message}`);
	}
}

/**
 * Update system statistics
 */
async function updateSystemStats(env) {
	try {
		const statsFile = `${utils.cacheDir}/system-stats.json`;

		let stats = {};
		const existing = utils.safeReadFile(statsFile);
		if (existing) {
			try {
				stats = JSON.parse(existing);
			} catch (_e) {
				stats = {};
			}
		}

		// Update statistics
		stats.lastSession = env.sessionId;
		stats.lastSessionTime = utils.getTimestamp();
		stats.totalSessions = (stats.totalSessions || 0) + 1;
		stats.platform = env.platform;

		utils.safeWriteFile(statsFile, JSON.stringify(stats, null, 2));
	} catch (error) {
		utils.log("WARN", "SESSION_STOP", `System stats update error: ${error.message}`);
	}
}

/**
 * Check system health
 */
async function checkSystemHealth() {
	try {
		const systemInfo = utils.getSystemInfo();

		// Check available memory
		const memUsagePercent = ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100;

		if (memUsagePercent > 90) {
			utils.log("WARN", "SESSION_STOP", `High memory usage detected: ${memUsagePercent.toFixed(1)}%`);
		}

		// Check disk space for cache directory
		// This is a basic check - could be expanded
		utils.log("DEBUG", "SESSION_STOP", "System health check completed");
	} catch (error) {
		utils.log("WARN", "SESSION_STOP", `System health check error: ${error.message}`);
	}
}

// Run the session stop hook
if (require.main === module) {
	sessionStop();
}

module.exports = { sessionStop };
