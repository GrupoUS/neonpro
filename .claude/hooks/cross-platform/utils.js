#!/usr/bin/env node
/**
 * Claude Code Cross-Platform Hook Utilities
 * Version: 6.0.0 - Cross-Platform Node.js Implementation
 *
 * Provides unified functionality for Windows (PowerShell) and Ubuntu (bash) environments
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

// Constants
const DEFAULT_COMMAND_TIMEOUT = 30_000;

class CrossPlatformUtils {
	constructor() {
		this.platform = os.platform();
		this.isWindows = this.platform === "win32";
		this.isLinux = this.platform === "linux";
		this.isDarwin = this.platform === "darwin";

		// Setup paths relative to script location
		this.scriptDir = path.dirname(__filename);
		this.hookDir = path.join(this.scriptDir, "..");
		this.projectDir = path.join(this.hookDir, "..", "..");
		this.cacheDir = path.join(this.projectDir, ".cache");
		this.logFile = path.join(this.hookDir, "claude-hooks.log");

		// Create necessary directories
		this.ensureDirectories();
	}

	/**
	 * Ensure required directories exist
	 */
	ensureDirectories() {
		const dirs = [this.cacheDir];
		for (const dir of dirs) {
			if (!fs.existsSync(dir)) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch {
					// Ignore errors - directories might already exist or be inaccessible
				}
			}
		}
	}

	/**
	 * Get current timestamp in ISO format
	 */
	getTimestamp() {
		return new Date().toISOString();
	}

	/**
	 * Format log message with timestamp and level
	 */
	formatLogMessage(level, component, message) {
		return `[${this.getTimestamp()}] [${level}] [${component}] ${message}`;
	}

	/**
	 * Write log message to file (safe - won't throw errors)
	 */
	log(level, component, message) {
		try {
			const logMessage = this.formatLogMessage(level, component, message);
			fs.appendFileSync(this.logFile, `${logMessage}\n`, { encoding: "utf8" });

			// Also log to console for debugging
			if (process.env.CLAUDE_DEBUG === "true") {
				// Console logging disabled - use this block for debugging if needed
			}
		} catch {
			// Silent fail - logging should never break the hook
		}
	}

	/**
	 * Get environment variables with fallbacks
	 */
	getEnvironment() {
		return {
			toolName: process.env.CLAUDE_TOOL_NAME || "unknown",
			toolArgs: process.env.CLAUDE_TOOL_ARGS || "",
			toolResult: process.env.CLAUDE_TOOL_RESULT || "unknown",
			sessionId: process.env.CLAUDE_SESSION_ID || `session_${Date.now()}`,
			userId: process.env.CLAUDE_USER_ID || os.userInfo().username || "unknown",
			workingDir: process.cwd(),
			nodeVersion: process.version,
			platform: this.platform,
			arch: os.arch(),
			hostname: os.hostname(),
		};
	}

	/**
	 * Set environment variables for child processes
	 */
	setHookEnvironment(phase) {
		const env = this.getEnvironment();

		// Set Claude-specific environment variables
		process.env.CLAUDE_HOOK_PHASE = phase;
		process.env.CLAUDE_CURRENT_TOOL = env.toolName;
		process.env.CLAUDE_PLATFORM = this.platform;
		process.env.CLAUDE_WORKING_DIR = env.workingDir;

		return env;
	}

	/**
	 * Get system information for diagnostics
	 */
	getSystemInfo() {
		return {
			platform: this.platform,
			isWindows: this.isWindows,
			isLinux: this.isLinux,
			isDarwin: this.isDarwin,
			arch: os.arch(),
			nodeVersion: process.version,
			hostname: os.hostname(),
			uptime: os.uptime(),
			totalMemory: os.totalmem(),
			freeMemory: os.freemem(),
			cpus: os.cpus().length,
			networkInterfaces: Object.keys(os.networkInterfaces()),
			homeDir: os.homedir(),
			tmpDir: os.tmpdir(),
		};
	}

	/**
	 * Safe file operations
	 */
	safeWriteFile(filePath, content) {
		try {
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFileSync(filePath, content, { encoding: "utf8" });
			return true;
		} catch (error) {
			this.log(
				"ERROR",
				"FILE_WRITE",
				`Failed to write file ${filePath}: ${error.message}`,
			);
			return false;
		}
	}

	safeReadFile(filePath) {
		try {
			if (fs.existsSync(filePath)) {
				return fs.readFileSync(filePath, { encoding: "utf8" });
			}
			return;
		} catch (error) {
			this.log(
				"ERROR",
				"FILE_READ",
				`Failed to read file ${filePath}: ${error.message}`,
			);
			return;
		}
	}

	/**
	 * Execute platform-specific commands safely
	 */
	executeCommand(command, options = {}) {
		const { spawn } = require("node:child_process");

		return new Promise((resolve, reject) => {
			const timeout = options.timeout || DEFAULT_COMMAND_TIMEOUT;
			let shell, args;

			// Determine shell based on platform
			if (this.isWindows) {
				shell = "powershell.exe";
				args = [
					"-NoProfile",
					"-ExecutionPolicy",
					"Bypass",
					"-Command",
					command,
				];
			} else {
				shell = "/bin/bash";
				args = ["-c", command];
			}

			const child = spawn(shell, args, {
				stdio: ["pipe", "pipe", "pipe"],
				env: { ...process.env, ...options.env },
			});

			let stdout = "";
			let stderr = "";

			child.stdout.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr.on("data", (data) => {
				stderr += data.toString();
			});

			const timeoutHandle = setTimeout(() => {
				child.kill("SIGTERM");
				reject(new Error(`Command timeout after ${timeout}ms`));
			}, timeout);

			child.on("close", (code) => {
				clearTimeout(timeoutHandle);
				resolve({
					code,
					stdout: stdout.trim(),
					stderr: stderr.trim(),
					success: code === 0,
				});
			});

			child.on("error", (error) => {
				clearTimeout(timeoutHandle);
				reject(error);
			});
		});
	}

	/**
	 * Get current Git information if available
	 */
	async getGitInfo() {
		try {
			const branch = await this.executeCommand(
				"git rev-parse --abbrev-ref HEAD",
			);
			const commit = await this.executeCommand("git rev-parse --short HEAD");
			const status = await this.executeCommand("git status --porcelain");

			return {
				branch: branch.success ? branch.stdout : "unknown",
				commit: commit.success ? commit.stdout : "unknown",
				hasChanges: status.success ? status.stdout.length > 0 : false,
				statusOutput: status.success ? status.stdout : "",
			};
		} catch (error) {
			return {
				branch: "unknown",
				commit: "unknown",
				hasChanges: false,
				statusOutput: "",
				error: error.message,
			};
		}
	}
}

// Export singleton instance
module.exports = new CrossPlatformUtils();
