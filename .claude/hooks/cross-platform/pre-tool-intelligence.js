#!/usr/bin/env node
/**
 * Claude Code Pre-Tool Intelligence Hook - Cross-Platform Version
 * Version: 6.0.0 - Cross-Platform Node.js Implementation
 *
 * Executes before each tool use, providing intelligent pre-processing and logging
 */

const utils = require("./utils.js");

async function preToolIntelligence() {
	try {
		// Set up hook environment
		const env = utils.setHookEnvironment("pre_tool_use");

		// Log hook execution start
		utils.log(
			"INFO",
			"PRE_TOOL_HOOK",
			`Pre-tool intelligence hook executing for tool: ${env.toolName} on ${env.platform}`,
		);

		// Get system information for context
		const systemInfo = utils.getSystemInfo();
		utils.log(
			"DEBUG",
			"PRE_TOOL_HOOK",
			`System: ${systemInfo.platform} ${systemInfo.arch}, Node: ${systemInfo.nodeVersion}`,
		);

		// Tool-specific intelligence
		await handleToolSpecificLogic(env.toolName, env);

		// Log successful completion
		utils.log(
			"SUCCESS",
			"PRE_TOOL_HOOK",
			`Pre-tool intelligence hook completed successfully for ${env.toolName}`,
		);

		// Exit successfully
		process.exit(0);
	} catch (error) {
		// Log error but don't fail the hook
		utils.log(
			"ERROR",
			"PRE_TOOL_HOOK",
			`Pre-tool hook error: ${error.message}`,
		);

		// Exit with success to not block Claude
		process.exit(0);
	}
}

/**
 * Handle tool-specific pre-processing logic
 */
async function handleToolSpecificLogic(toolName, env) {
	try {
		switch (toolName.toLowerCase()) {
			case "bash": {
				await handleBashTool(env);
				break;
			}

			case "read":
			case "edit":
			case "write": {
				handleFileTool(toolName, env);
				break;
			}

			case "task": {
				handleTaskTool(env);
				break;
			}

			case "todowrite": {
				handleTodoTool(env);
				break;
			}

			default: {
				// Generic tool handling
				utils.log(
					"DEBUG",
					"PRE_TOOL_HOOK",
					`Generic pre-processing for tool: ${toolName}`,
				);
				break;
			}
		}
	} catch (error) {
		utils.log(
			"WARN",
			"PRE_TOOL_HOOK",
			`Tool-specific logic error for ${toolName}: ${error.message}`,
		);
	}
}

/**
 * Handle Bash tool pre-processing
 */
async function handleBashTool(env) {
	utils.log(
		"INFO",
		"PRE_TOOL_HOOK",
		`Bash command preparation on ${env.platform}`,
	);

	// Platform-specific bash handling
	if (utils.isWindows) {
		utils.log(
			"DEBUG",
			"PRE_TOOL_HOOK",
			"Windows PowerShell environment detected",
		);
	} else if (utils.isLinux) {
		utils.log("DEBUG", "PRE_TOOL_HOOK", "Linux bash environment detected");
	}

	// Check for common issues
	await checkBashPrerequisites();
}

/**
 * Handle file operation tools
 */
function handleFileTool(toolName, env) {
	utils.log("INFO", "PRE_TOOL_HOOK", `File operation ${toolName} preparation`);

	// Ensure cache directory exists
	utils.ensureDirectories();

	// Log working directory
	utils.log("DEBUG", "PRE_TOOL_HOOK", `Working directory: ${env.workingDir}`);
}

/**
 * Handle Task tool pre-processing
 */
function handleTaskTool(env) {
	utils.log("INFO", "PRE_TOOL_HOOK", "Task delegation preparation");

	// Log session info for task tracking
	utils.log("DEBUG", "PRE_TOOL_HOOK", `Task session: ${env.sessionId}`);
}

/**
 * Handle TodoWrite tool pre-processing
 */
function handleTodoTool(env) {
	utils.log("INFO", "PRE_TOOL_HOOK", "Todo management preparation");

	// Log todo session tracking
	utils.log("DEBUG", "PRE_TOOL_HOOK", `Todo session: ${env.sessionId}`);
}

/**
 * Check bash prerequisites
 */
async function checkBashPrerequisites() {
	try {
		// Check if common tools are available
		const checks = ["git", "node", "npm"];

		for (const tool of checks) {
			try {
				const result = await utils.executeCommand(
					utils.isWindows ? `Get-Command ${tool}` : `which ${tool}`,
					{
						timeout: 5000,
					},
				);

				if (result.success) {
					utils.log("DEBUG", "PRE_TOOL_HOOK", `Tool available: ${tool}`);
				} else {
					utils.log("WARN", "PRE_TOOL_HOOK", `Tool not found: ${tool}`);
				}
			} catch (error) {
				utils.log(
					"WARN",
					"PRE_TOOL_HOOK",
					`Could not check tool ${tool}: ${error.message}`,
				);
			}
		}
	} catch (error) {
		utils.log(
			"ERROR",
			"PRE_TOOL_HOOK",
			`Prerequisite check failed: ${error.message}`,
		);
	}
}

// Run the pre-tool intelligence
if (require.main === module) {
	preToolIntelligence();
}

module.exports = { preToolIntelligence };
