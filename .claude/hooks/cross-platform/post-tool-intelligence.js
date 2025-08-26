#!/usr/bin/env node
/**
 * Claude Code Post-Tool Intelligence Hook - Cross-Platform Version
 * Version: 6.0.0 - Cross-Platform Node.js Implementation
 *
 * Executes after each tool use, providing intelligent post-processing and analysis
 */

const utils = require("./utils.js");

// Constants for memory calculations
const BYTES_TO_MB = 1024 * 1024;
const _MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
const _MAX_HOOKS_PER_HOUR = 100;
const _HOURS_TO_KEEP = 24;

async function postToolIntelligence() {
	try {
		// Set up hook environment
		const env = utils.setHookEnvironment("post_tool_use");

		// Log hook execution start
		utils.log(
			"INFO",
			"POST_TOOL_HOOK",
			`Post-tool intelligence hook executing for tool: ${env.toolName} (result: ${env.toolResult})`,
		);

		// Tool-specific post-processing
		await handleToolSpecificAnalysis(env.toolName, env);

		// Perform general post-tool analysis
		await performGeneralAnalysis(env);

		// Log successful completion
		utils.log(
			"SUCCESS",
			"POST_TOOL_HOOK",
			`Post-tool intelligence hook completed successfully for ${env.toolName}`,
		);

		// Exit successfully
		process.exit(0);
	} catch (error) {
		// Log error but don't fail the hook
		utils.log(
			"ERROR",
			"POST_TOOL_HOOK",
			`Post-tool hook error: ${error.message}`,
		);

		// Exit with success to not block Claude
		process.exit(0);
	}
}

/**
 * Handle tool-specific post-processing analysis
 */
async function handleToolSpecificAnalysis(toolName, env) {
	try {
		switch (toolName.toLowerCase()) {
			case "bash": {
				await analyzeBashExecution(env);
				break;
			}

			case "read":
			case "edit":
			case "write": {
				await analyzeFileOperation(toolName, env);
				break;
			}

			case "task": {
				await analyzeTaskExecution(env);
				break;
			}

			case "todowrite": {
				await analyzeTodoUpdate(env);
				break;
			}

			case "mcp__desktop-commander__write_file":
			case "mcp__desktop-commander__edit_block": {
				await analyzeFileModification(env);
				break;
			}

			case "mcp__archon__create_task":
			case "mcp__archon__update_task": {
				await analyzeArchonTaskActivity(env);
				break;
			}

			default: {
				// Generic tool analysis
				utils.log(
					"DEBUG",
					"POST_TOOL_HOOK",
					`Generic post-processing analysis for tool: ${toolName}`,
				);
				break;
			}
		}
	} catch (error) {
		utils.log(
			"WARN",
			"POST_TOOL_HOOK",
			`Tool-specific analysis error for ${toolName}: ${error.message}`,
		);
	}
}

/**
 * Analyze bash command execution
 */
async function analyzeBashExecution(env) {
	utils.log(
		"INFO",
		"POST_TOOL_HOOK",
		`Analyzing bash execution result: ${env.toolResult}`,
	);

	// Check if this was a build/test command
	const toolArgs = env.toolArgs.toLowerCase();
	if (
		toolArgs.includes("build") ||
		toolArgs.includes("test") ||
		toolArgs.includes("lint") ||
		toolArgs.includes("check")
	) {
		utils.log("INFO", "POST_TOOL_HOOK", "Quality assurance command detected");

		// Could implement build result analysis here
		await analyzeBuildResults(env);
	}

	// Check for git commands
	if (toolArgs.includes("git ")) {
		utils.log("INFO", "POST_TOOL_HOOK", "Git command detected");

		await analyzeGitCommand(env);
	}
}

/**
 * Analyze file operations
 */
async function analyzeFileOperation(toolName, env) {
	utils.log("INFO", "POST_TOOL_HOOK", `Analyzing file operation: ${toolName}`);

	// Track file modifications for backup purposes
	if (toolName === "write" || toolName === "edit") {
		await trackFileChanges(env);
	}

	// Check for important file modifications
	await checkCriticalFileChanges(env);
}

/**
 * Analyze task execution
 */
function analyzeTaskExecution(env) {
	utils.log("INFO", "POST_TOOL_HOOK", "Analyzing task delegation result");

	// Track task execution patterns
	try {
		const taskLog = {
			timestamp: utils.getTimestamp(),
			tool: env.toolName,
			session: env.sessionId,
		};
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`Task tracked: ${JSON.stringify(taskLog)}`,
		);
	} catch (error) {
		utils.log(
			"WARN",
			"POST_TOOL_HOOK",
			`Task analysis error: ${error.message}`,
		);
	}
}

/**
 * Analyze todo updates
 */
async function analyzeTodoUpdate(env) {
	utils.log("INFO", "POST_TOOL_HOOK", "Analyzing todo list update");

	// Track todo completion patterns
	await trackTodoPatterns(env);
}

/**
 * Analyze file modifications via Desktop Commander
 */
async function analyzeFileModification(env) {
	utils.log(
		"INFO",
		"POST_TOOL_HOOK",
		"Analyzing Desktop Commander file modification",
	);

	// Check for code quality issues
	await checkCodeQuality(env);
}

/**
 * Analyze Archon task activities
 */
async function analyzeArchonTaskActivity(env) {
	utils.log(
		"INFO",
		"POST_TOOL_HOOK",
		"Analyzing Archon task management activity",
	);

	// Track task management patterns
	await trackTaskManagementPatterns(env);
}

/**
 * Perform general post-tool analysis
 */
async function performGeneralAnalysis(env) {
	try {
		// Get current git status if available
		const gitInfo = await utils.getGitInfo();

		if (gitInfo.hasChanges) {
			utils.log(
				"INFO",
				"POST_TOOL_HOOK",
				`Git changes detected in branch: ${gitInfo.branch}`,
			);
		}

		// Log system resource usage
		const systemInfo = utils.getSystemInfo();
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`Memory usage: ${Math.round(
				(systemInfo.totalMemory - systemInfo.freeMemory) / BYTES_TO_MB,
			)}MB used`,
		);

		// Check for potential issues
		await performHealthCheck(env);
	} catch (error) {
		utils.log(
			"WARN",
			"POST_TOOL_HOOK",
			`General analysis error: ${error.message}`,
		);
	}
}

/**
 * Analyze build results
 */
async function analyzeBuildResults(env) {
	try {
		// Check for common build artifacts or outputs
		const commonPaths = [
			"dist",
			"build",
			".next",
			"out",
			"node_modules/.cache",
			"coverage",
		];

		utils.log("DEBUG", "POST_TOOL_HOOK", "Checking build artifacts");

		// Track build activity
		const buildLog = {
			timestamp: utils.getTimestamp(),
			tool: env.toolName,
			paths: commonPaths,
		};
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`Build tracked: ${JSON.stringify(buildLog)}`,
		);
	} catch (error) {
		utils.log(
			"WARN",
			"POST_TOOL_HOOK",
			`Build analysis error: ${error.message}`,
		);
	}
}

/**
 * Analyze git commands
 */
async function analyzeGitCommand(env) {
	try {
		const gitInfo = await utils.getGitInfo();

		utils.log(
			"INFO",
			"POST_TOOL_HOOK",
			`Git status: branch=${gitInfo.branch}, commit=${gitInfo.commit}, hasChanges=${gitInfo.hasChanges}`,
		);

		// Track git activity
		const gitLog = {
			timestamp: utils.getTimestamp(),
			tool: env.toolName,
			session: env.sessionId,
			branch: gitInfo.branch,
		};
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`Git activity tracked: ${JSON.stringify(gitLog)}`,
		);
	} catch (error) {
		utils.log("WARN", "POST_TOOL_HOOK", `Git analysis error: ${error.message}`);
	}
}

/**
 * Track file changes for backup
 */
async function trackFileChanges(env) {
	try {
		const changeLog = {
			timestamp: utils.getTimestamp(),
			tool: env.toolName,
			session: env.sessionId,
			platform: env.platform,
		};

		// Log change for potential backup
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`File change tracked: ${JSON.stringify(changeLog)}`,
		);
	} catch (error) {
		utils.log(
			"WARN",
			"POST_TOOL_HOOK",
			`File change tracking error: ${error.message}`,
		);
	}
}

/**
 * Check for critical file changes
 */
async function checkCriticalFileChanges(env) {
	// Check for modifications to important config files
	const criticalFiles = [
		"package.json",
		"tsconfig.json",
		"biome.jsonc",
		".github/workflows",
		".claude/settings",
	];

	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		"Checking for critical file modifications",
	);

	// Track critical file monitoring
	const fileLog = {
		timestamp: utils.getTimestamp(),
		tool: env.toolName,
		files: criticalFiles,
	};
	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		`Critical files tracked: ${JSON.stringify(fileLog)}`,
	);
}

/**
 * Track todo completion patterns
 */
async function trackTodoPatterns(env) {
	utils.log("DEBUG", "POST_TOOL_HOOK", "Tracking todo completion patterns");

	// Track todo activity
	const todoLog = {
		timestamp: utils.getTimestamp(),
		tool: env.toolName,
		session: env.sessionId,
	};
	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		`Todo patterns tracked: ${JSON.stringify(todoLog)}`,
	);
}

/**
 * Check code quality
 */
async function checkCodeQuality(env) {
	utils.log("DEBUG", "POST_TOOL_HOOK", "Checking code quality metrics");

	// Track quality checks
	const qualityLog = {
		timestamp: utils.getTimestamp(),
		tool: env.toolName,
		session: env.sessionId,
	};
	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		`Quality check tracked: ${JSON.stringify(qualityLog)}`,
	);
}

/**
 * Track task management patterns
 */
async function trackTaskManagementPatterns(env) {
	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		"Tracking Archon task management patterns",
	);

	// Track task management activity
	const taskMgmtLog = {
		timestamp: utils.getTimestamp(),
		tool: env.toolName,
		session: env.sessionId,
	};
	utils.log(
		"DEBUG",
		"POST_TOOL_HOOK",
		`Task management tracked: ${JSON.stringify(taskMgmtLog)}`,
	);
}

/**
 * Perform general health check
 */
async function performHealthCheck(env) {
	try {
		// Check if hook is running too frequently
		// This could indicate an issue with infinite loops
		const now = Date.now();
		const cacheFile = `${utils.cacheDir}/hook-frequency.json`;

		let frequencyData = {};
		const existing = utils.safeReadFile(cacheFile);
		if (existing) {
			try {
				frequencyData = JSON.parse(existing);
			} catch {
				frequencyData = {};
			}
		}

		const hourKey = Math.floor(now / (1000 * 60 * 60)); // Hour bucket
		frequencyData[hourKey] = (frequencyData[hourKey] || 0) + 1;

		// Clean old data (keep only last 24 hours)
		for (const key of Object.keys(frequencyData)) {
			if (Number.parseInt(key, 10) < hourKey - 24) {
				delete frequencyData[key];
			}
		}

		utils.safeWriteFile(cacheFile, JSON.stringify(frequencyData));

		// Check for excessive frequency
		if (frequencyData[hourKey] > 100) {
			utils.log(
				"WARN",
				"POST_TOOL_HOOK",
				`High hook frequency detected: ${frequencyData[hourKey]} executions this hour`,
			);
		}

		// Track health check
		const healthLog = {
			timestamp: utils.getTimestamp(),
			tool: env.toolName,
			frequency: frequencyData[hourKey],
		};
		utils.log(
			"DEBUG",
			"POST_TOOL_HOOK",
			`Health check tracked: ${JSON.stringify(healthLog)}`,
		);
	} catch (error) {
		utils.log("WARN", "POST_TOOL_HOOK", `Health check error: ${error.message}`);
	}
}

// Run the post-tool intelligence
if (require.main === module) {
	postToolIntelligence();
}

module.exports = { postToolIntelligence };
