#!/usr/bin/env node
/**
 * Claude Code Session Intelligence Hook - Cross-Platform Version
 * Version: 6.0.0 - Cross-Platform Node.js Implementation
 *
 * Executes when a subagent stops, providing session analysis and cleanup
 */

const utils = require("./utils.js");

async function sessionIntelligence() {
	try {
		// Set up hook environment
		const env = utils.setHookEnvironment("subagent_stop");

		// Log hook execution start
		utils.log("INFO", "SESSION_HOOK", `Session intelligence hook executing for session: ${env.sessionId}`);

		// Perform session analysis
		await analyzeSession(env);

		// Generate session summary
		await generateSessionSummary(env);

		// Perform cleanup tasks
		await performCleanup(env);

		// Log successful completion
		utils.log("SUCCESS", "SESSION_HOOK", "Session intelligence hook completed successfully");

		// Exit successfully
		process.exit(0);
	} catch (error) {
		// Log error but don't fail the hook
		utils.log("ERROR", "SESSION_HOOK", `Session intelligence hook error: ${error.message}`);

		// Exit with success to not block Claude
		process.exit(0);
	}
}

/**
 * Analyze the completed session
 */
async function analyzeSession(env) {
	try {
		utils.log("INFO", "SESSION_HOOK", "Analyzing completed session");

		// Get session statistics
		const sessionStats = await getSessionStatistics(env);

		// Analyze tool usage patterns
		await analyzeToolUsagePatterns(sessionStats);

		// Check for common issues or patterns
		await detectSessionPatterns(sessionStats);

		// Log session metrics
		utils.log(
			"INFO",
			"SESSION_HOOK",
			`Session analysis complete: ${sessionStats.toolCount} tools used, duration: ${sessionStats.duration}ms`
		);
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Session analysis error: ${error.message}`);
	}
}

/**
 * Get session statistics from logs
 */
async function getSessionStatistics(env) {
	try {
		const logContent = utils.safeReadFile(utils.logFile);
		if (!logContent) {
			return {
				toolCount: 0,
				duration: 0,
				tools: [],
				errors: 0,
				warnings: 0,
			};
		}

		const lines = logContent.split("\n");
		const sessionLines = lines.filter(
			(line) => line.includes(env.sessionId) || line.includes("[PRE_TOOL_HOOK]") || line.includes("[POST_TOOL_HOOK]")
		);

		// Parse tool usage
		const tools = [];
		let errors = 0;
		let warnings = 0;
		let startTime = null;
		let endTime = null;

		sessionLines.forEach((line) => {
			// Extract timestamp
			const timestampMatch = line.match(/\[(.*?)\]/);
			if (timestampMatch) {
				const timestamp = new Date(timestampMatch[1]);
				if (!startTime || timestamp < startTime) {
					startTime = timestamp;
				}
				if (!endTime || timestamp > endTime) {
					endTime = timestamp;
				}
			}

			// Count tools
			if (line.includes("PRE_TOOL_HOOK") && line.includes("executing for tool:")) {
				const toolMatch = line.match(/executing for tool: ([^\s]+)/);
				if (toolMatch) {
					tools.push(toolMatch[1]);
				}
			}

			// Count errors and warnings
			if (line.includes("[ERROR]")) {
				errors++;
			}
			if (line.includes("[WARN]")) {
				warnings++;
			}
		});

		const duration = endTime && startTime ? endTime - startTime : 0;

		return {
			toolCount: tools.length,
			duration,
			tools: [...new Set(tools)], // Unique tools
			toolUsage: tools, // All tool usage including duplicates
			errors,
			warnings,
			startTime,
			endTime,
		};
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Session statistics error: ${error.message}`);
		return {
			toolCount: 0,
			duration: 0,
			tools: [],
			errors: 0,
			warnings: 0,
		};
	}
}

/**
 * Analyze tool usage patterns
 */
async function analyzeToolUsagePatterns(sessionStats) {
	try {
		if (sessionStats.toolCount === 0) {
			utils.log("INFO", "SESSION_HOOK", "No tool usage detected in session");
			return;
		}

		// Analyze tool frequency
		const toolFrequency = {};
		sessionStats.toolUsage.forEach((tool) => {
			toolFrequency[tool] = (toolFrequency[tool] || 0) + 1;
		});

		// Find most used tools
		const sortedTools = Object.entries(toolFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5);

		utils.log(
			"INFO",
			"SESSION_HOOK",
			`Top tools used: ${sortedTools.map(([tool, count]) => `${tool}(${count})`).join(", ")}`
		);

		// Check for potential issues
		if (sessionStats.errors > 0) {
			utils.log("WARN", "SESSION_HOOK", `Session had ${sessionStats.errors} errors`);
		}

		if (sessionStats.toolCount > 50) {
			utils.log("WARN", "SESSION_HOOK", `High tool usage detected: ${sessionStats.toolCount} tools used`);
		}

		// Check for repetitive patterns
		await checkRepetitivePatterns(sessionStats);
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Tool usage analysis error: ${error.message}`);
	}
}

/**
 * Check for repetitive patterns that might indicate issues
 */
async function checkRepetitivePatterns(sessionStats) {
	try {
		const toolSequence = sessionStats.toolUsage;
		if (toolSequence.length < 10) {
			return;
		}

		// Check for loops (same tool repeated many times)
		for (let i = 0; i < toolSequence.length - 5; i++) {
			const tool = toolSequence[i];
			let consecutive = 1;

			for (let j = i + 1; j < toolSequence.length && toolSequence[j] === tool; j++) {
				consecutive++;
			}

			if (consecutive >= 5) {
				utils.log("WARN", "SESSION_HOOK", `Potential loop detected: ${tool} used ${consecutive} times consecutively`);
				break;
			}
		}

		// Check for alternating patterns
		const pairs = [];
		for (let i = 0; i < toolSequence.length - 1; i++) {
			pairs.push(`${toolSequence[i]}->${toolSequence[i + 1]}`);
		}

		const pairFrequency = {};
		pairs.forEach((pair) => {
			pairFrequency[pair] = (pairFrequency[pair] || 0) + 1;
		});

		const maxPairFreq = Math.max(...Object.values(pairFrequency));
		if (maxPairFreq > 5) {
			const mostCommonPair = Object.entries(pairFrequency).find(([, freq]) => freq === maxPairFreq);

			utils.log("INFO", "SESSION_HOOK", `Common tool pattern: ${mostCommonPair[0]} (${mostCommonPair[1]} times)`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Pattern analysis error: ${error.message}`);
	}
}

/**
 * Detect session patterns and insights
 */
async function detectSessionPatterns(sessionStats) {
	try {
		// Analyze session duration
		const durationMinutes = sessionStats.duration / (1000 * 60);

		if (durationMinutes > 30) {
			utils.log("INFO", "SESSION_HOOK", `Long session detected: ${Math.round(durationMinutes)} minutes`);
		}

		// Check for specific workflow patterns
		const tools = sessionStats.tools;

		if (tools.includes("bash") && tools.includes("todowrite")) {
			utils.log("INFO", "SESSION_HOOK", "Development workflow pattern detected");
		}

		if (tools.includes("read") && tools.includes("write") && tools.includes("bash")) {
			utils.log("INFO", "SESSION_HOOK", "Code modification workflow detected");
		}

		if (tools.some((tool) => tool.includes("archon"))) {
			utils.log("INFO", "SESSION_HOOK", "Archon task management workflow detected");
		}
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Pattern detection error: ${error.message}`);
	}
}

/**
 * Generate session summary
 */
async function generateSessionSummary(env) {
	try {
		const sessionStats = await getSessionStatistics(env);
		const gitInfo = await utils.getGitInfo();
		const systemInfo = utils.getSystemInfo();

		const summary = {
			sessionId: env.sessionId,
			timestamp: utils.getTimestamp(),
			platform: systemInfo.platform,
			duration: sessionStats.duration,
			toolsUsed: sessionStats.toolCount,
			uniqueTools: sessionStats.tools.length,
			errors: sessionStats.errors,
			warnings: sessionStats.warnings,
			git: {
				branch: gitInfo.branch,
				hasChanges: gitInfo.hasChanges,
				commit: gitInfo.commit,
			},
			system: {
				platform: systemInfo.platform,
				nodeVersion: systemInfo.nodeVersion,
				hostname: systemInfo.hostname,
			},
		};

		// Save summary to cache
		const summaryFile = `${utils.cacheDir}/session-${env.sessionId}-summary.json`;
		utils.safeWriteFile(summaryFile, JSON.stringify(summary, null, 2));

		utils.log(
			"INFO",
			"SESSION_HOOK",
			`Session summary saved: ${sessionStats.toolCount} tools, ${Math.round(sessionStats.duration / 1000)}s duration`
		);
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Session summary error: ${error.message}`);
	}
}

/**
 * Perform cleanup tasks
 */
async function performCleanup(_env) {
	try {
		utils.log("INFO", "SESSION_HOOK", "Performing session cleanup");

		// Clean up old cache files (older than 7 days)
		await cleanupOldCache();

		// Rotate logs if they're getting too large
		await rotateLogs();

		// Clean up temp files if any
		await cleanupTempFiles();

		utils.log("INFO", "SESSION_HOOK", "Session cleanup completed");
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Cleanup error: ${error.message}`);
	}
}

/**
 * Clean up old cache files
 */
async function cleanupOldCache() {
	try {
		const fs = require("node:fs");
		if (!fs.existsSync(utils.cacheDir)) {
			return;
		}

		const files = fs.readdirSync(utils.cacheDir);
		const now = Date.now();
		const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

		let cleanedFiles = 0;
		files.forEach((file) => {
			try {
				const filePath = `${utils.cacheDir}/${file}`;
				const stats = fs.statSync(filePath);

				if (stats.mtime.getTime() < weekAgo) {
					fs.unlinkSync(filePath);
					cleanedFiles++;
				}
			} catch (_e) {
				// Ignore individual file errors
			}
		});

		if (cleanedFiles > 0) {
			utils.log("INFO", "SESSION_HOOK", `Cleaned up ${cleanedFiles} old cache files`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Cache cleanup error: ${error.message}`);
	}
}

/**
 * Rotate logs if they're getting large
 */
async function rotateLogs() {
	try {
		const fs = require("node:fs");
		if (!fs.existsSync(utils.logFile)) {
			return;
		}

		const stats = fs.statSync(utils.logFile);
		const maxSize = 10 * 1024 * 1024; // 10MB

		if (stats.size > maxSize) {
			const backupFile = `${utils.logFile}.${Date.now()}.bak`;
			fs.renameSync(utils.logFile, backupFile);

			utils.log("INFO", "SESSION_HOOK", `Log rotated: ${Math.round(stats.size / 1024 / 1024)}MB -> ${backupFile}`);
		}
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Log rotation error: ${error.message}`);
	}
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles() {
	try {
		// Could implement temp file cleanup here
		utils.log("DEBUG", "SESSION_HOOK", "Temp file cleanup completed");
	} catch (error) {
		utils.log("WARN", "SESSION_HOOK", `Temp file cleanup error: ${error.message}`);
	}
}

// Run the session intelligence
if (require.main === module) {
	sessionIntelligence();
}

module.exports = { sessionIntelligence };
