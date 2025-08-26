#!/usr/bin/env node
/**
 * Claude Code Cross-Platform Hook Installer
 * Version: 6.0.0 - Installation and Setup Script
 *
 * Automatically configures cross-platform hooks for Windows and Ubuntu
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

class HookInstaller {
	constructor() {
		this.platform = os.platform();
		this.isWindows = this.platform === "win32";
		this.isLinux = this.platform === "linux";

		// Paths
		this.rootDir = path.join(__dirname, "..", "..");
		this.hooksDir = path.join(__dirname, "..");
		this.crossPlatformDir = __dirname;

		this.settingsFile = path.join(this.rootDir, "settings.local.json");
		this.crossPlatformSettingsFile = path.join(this.rootDir, "settings.cross-platform.json");
		this.backupDir = path.join(this.hooksDir, `backup-${Date.now()}`);
	}

	/**
	 * Run the complete installation process
	 */
	async install() {
		try {
			// Step 1: Check prerequisites
			await this.checkPrerequisites();

			// Step 2: Backup existing configuration
			await this.backupExistingConfig();

			// Step 3: Install cross-platform configuration
			await this.installCrossPlatformConfig();

			// Step 4: Make scripts executable (Linux/macOS)
			await this.setExecutablePermissions();

			// Step 5: Verify installation
			await this.verifyInstallation();

			// Step 6: Show completion message
			this.showCompletionMessage();
		} catch (error) {
			console.error("❌ Installation failed:", error.message);
			process.exit(1);
		}
	}

	/**
	 * Check if all prerequisites are met
	 */
	async checkPrerequisites() {
		// Check Node.js
		try {
			const nodeVersion = process.version;

			// Check if version is compatible (Node 14+)
			const majorVersion = Number.parseInt(nodeVersion.substring(1).split(".")[0], 10);
			if (majorVersion < 14) {
				throw new Error("Node.js 14 or higher is required");
			}
		} catch (error) {
			console.error("❌ Node.js version check failed:", error.message);
			throw new Error("Node.js is not available or version is too old");
		}

		// Check if we're in the right directory
		if (!fs.existsSync(this.crossPlatformSettingsFile)) {
			throw new Error("Cross-platform settings file not found. Make sure you're in the correct directory.");
		}

		// Check write permissions
		try {
			const testFile = path.join(this.rootDir, "test-write-permissions.tmp");
			fs.writeFileSync(testFile, "test");
			fs.unlinkSync(testFile);
		} catch (error) {
			console.error("❌ Write permission check failed:", error.message);
			throw new Error("No write permissions in the configuration directory");
		}
	}

	/**
	 * Backup existing configuration
	 */
	async backupExistingConfig() {
		try {
			// Create backup directory
			if (!fs.existsSync(this.backupDir)) {
				fs.mkdirSync(this.backupDir, { recursive: true });
			}

			// Backup existing settings file if it exists
			if (fs.existsSync(this.settingsFile)) {
				const backupSettingsFile = path.join(this.backupDir, "settings.local.json");
				fs.copyFileSync(this.settingsFile, backupSettingsFile);
			}

			// Backup old hook files if they exist
			const oldHookFiles = [
				"pre-tool-intelligence.bat",
				"post-tool-intelligence.bat",
				"session-intelligence.bat",
				"session-stop.bat",
			];

			let backedUpFiles = 0;
			oldHookFiles.forEach((file) => {
				const oldFile = path.join(this.hooksDir, file);
				if (fs.existsSync(oldFile)) {
					const backupFile = path.join(this.backupDir, file);
					fs.copyFileSync(oldFile, backupFile);
					backedUpFiles++;
				}
			});

			if (backedUpFiles > 0) {
			}

			// Backup Ubuntu hooks if they exist
			const ubuntuHooksDir = path.join(this.hooksDir, "ubuntu");
			if (fs.existsSync(ubuntuHooksDir)) {
				const backupUbuntuDir = path.join(this.backupDir, "ubuntu");
				this.copyDirectoryRecursive(ubuntuHooksDir, backupUbuntuDir);
			}
		} catch (error) {
			console.error("❌ Backup failed:", error.message);
		}
	}

	/**
	 * Install cross-platform configuration
	 */
	async installCrossPlatformConfig() {
		try {
			// Copy cross-platform settings to local settings
			const crossPlatformConfig = fs.readFileSync(this.crossPlatformSettingsFile, "utf8");
			fs.writeFileSync(this.settingsFile, crossPlatformConfig);
		} catch (error) {
			throw new Error(`Failed to install configuration: ${error.message}`);
		}
	}

	/**
	 * Set executable permissions (Linux/macOS only)
	 */
	async setExecutablePermissions() {
		if (this.isWindows) {
			return;
		}

		try {
			const { spawn } = require("node:child_process");
			const scriptFiles = [
				"utils.js",
				"pre-tool-intelligence.js",
				"post-tool-intelligence.js",
				"session-intelligence.js",
				"session-stop.js",
				"install.js",
			];

			for (const file of scriptFiles) {
				const filePath = path.join(this.crossPlatformDir, file);
				if (fs.existsSync(filePath)) {
					await this.executeCommand(`chmod +x "${filePath}"`);
				}
			}
		} catch (error) {
			console.error("❌ Failed to set executable permissions:", error.message);
		}
	}

	/**
	 * Verify installation
	 */
	async verifyInstallation() {
		try {
			// Check if settings file exists and is valid
			if (!fs.existsSync(this.settingsFile)) {
				throw new Error("Settings file not found after installation");
			}

			// Try to parse the settings file
			const settings = JSON.parse(fs.readFileSync(this.settingsFile, "utf8"));

			// Check if hooks are configured
			if (!settings.hooks?.PreToolUse) {
				throw new Error("Hooks not properly configured in settings file");
			}

			// Check if cross-platform scripts exist
			const requiredScripts = [
				"utils.js",
				"pre-tool-intelligence.js",
				"post-tool-intelligence.js",
				"session-intelligence.js",
				"session-stop.js",
			];

			for (const script of requiredScripts) {
				const scriptPath = path.join(this.crossPlatformDir, script);
				if (!fs.existsSync(scriptPath)) {
					throw new Error(`Required script not found: ${script}`);
				}
			}
		} catch (error) {
			throw new Error(`Installation verification failed: ${error.message}`);
		}
	}

	/**
	 * Show completion message with next steps
	 */
	showCompletionMessage() {}

	/**
	 * Execute a command and return result
	 */
	async executeCommand(command) {
		return new Promise((resolve, reject) => {
			const { spawn } = require("node:child_process");
			const shell = this.isWindows ? "powershell.exe" : "/bin/bash";
			const args = this.isWindows ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command] : ["-c", command];

			const child = spawn(shell, args, {
				stdio: ["pipe", "pipe", "pipe"],
			});

			let stdout = "";
			let stderr = "";

			child.stdout.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (code) => {
				if (code === 0) {
					resolve(stdout.trim());
				} else {
					reject(new Error(stderr.trim() || `Command failed with code ${code}`));
				}
			});
		});
	}

	/**
	 * Copy directory recursively
	 */
	copyDirectoryRecursive(src, dest) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}

		const files = fs.readdirSync(src);
		files.forEach((file) => {
			const srcFile = path.join(src, file);
			const destFile = path.join(dest, file);

			if (fs.lstatSync(srcFile).isDirectory()) {
				this.copyDirectoryRecursive(srcFile, destFile);
			} else {
				fs.copyFileSync(srcFile, destFile);
			}
		});
	}
}

// Run installer if called directly
if (require.main === module) {
	const installer = new HookInstaller();
	installer.install().catch((error) => {
		console.error("❌ Installation failed:", error.message);
		process.exit(1);
	});
}

module.exports = HookInstaller;
