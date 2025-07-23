#!/usr/bin/env node
/**
 * ========================================
 * VIBECODE V2.1 - Main Runner
 * ========================================
 * Central orchestration of all VIBECODE scripts
 * Quality Threshold: >=9.5/10
 * ========================================
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { performance } = require('perf_hooks');

class VibecodeRunner {
    constructor() {
        this.qualityScore = 10.0;
        this.executionResults = {};
        this.errors = [];
        this.warnings = [];
        this.logFile = '.trae/logs/vibecode-execution.log';
        this.configFile = '.trae/vibecode.config.json';
        this.ensureLogDirectory();
        this.loadConfiguration();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }

    addError(message) {
        this.errors.push(message);
        this.qualityScore -= 0.5;
        this.log(message, 'ERROR');
    }

    addWarning(message) {
        this.warnings.push(message);
        this.qualityScore -= 0.1;
        this.log(message, 'WARN');
    }

    loadConfiguration() {
        this.log('Loading VIBECODE V2.1 configuration...');
        
        const defaultConfig = {
            version: '2.1',
            qualityThreshold: 9.5,
            scripts: {
                'install-mcps': {
                    enabled: true,
                    command: 'cmd',
                    args: ['/c', '.trae/scripts/install-mcps.cmd'],
                    timeout: 300000,
                    critical: true
                },
                'verify-config': {
                    enabled: true,
                    command: 'node',
                    args: ['.trae/scripts/verify-config.js'],
                    timeout: 60000,
                    critical: true
                },
                'validate-mcps': {
                    enabled: true,
                    command: 'node',
                    args: ['.trae/scripts/validate-mcps.js'],
                    timeout: 120000,
                    critical: true
                },
                'trae-system-validator': {
                    enabled: true,
                    command: 'python',
                    args: ['.trae/scripts/trae-system-validator.py'],
                    timeout: 180000,
                    critical: true
                },
                'optimize-performance': {
                    enabled: true,
                    command: 'node',
                    args: ['.trae/scripts/optimize-performance.js'],
                    timeout: 120000,
                    critical: false
                },
                'security-analyzer': {
                    enabled: true,
                    command: 'python',
                    args: ['.trae/scripts/security-analyzer.py'],
                    timeout: 180000,
                    critical: true
                },
                'generate-docs': {
                    enabled: true,
                    command: 'node',
                    args: ['.trae/scripts/generate-docs.js'],
                    timeout: 120000,
                    critical: false
                },
                'run-tests': {
                    enabled: true,
                    command: 'node',
                    args: ['.trae/scripts/run-tests.js'],
                    timeout: 600000,
                    critical: true
                },
                'quality-monitor': {
                    enabled: true,
                    command: 'python',
                    args: ['.trae/scripts/quality-monitor.py'],
                    timeout: 300000,
                    critical: true
                },
                'deploy-automation': {
                    enabled: false,
                    command: 'node',
                    args: ['.trae/scripts/deploy-automation.js'],
                    timeout: 900000,
                    critical: false
                }
            },
            modes: {
                'PLAN': {
                    description: 'Planning and architecture mode',
                    scripts: ['verify-config', 'validate-mcps', 'trae-system-validator', 'generate-docs'],
                    mcpChain: ['sequential-thinking', 'context7-mcp', 'tavily-mcp', 'exa-mcp']
                },
                'ACT': {
                    description: 'Implementation and development mode',
                    scripts: ['verify-config', 'validate-mcps', 'optimize-performance', 'run-tests', 'quality-monitor'],
                    mcpChain: ['context7-mcp', 'desktop-commander', 'sequential-thinking']
                },
                'RESEARCH': {
                    description: 'Research and analysis mode',
                    scripts: ['verify-config', 'validate-mcps', 'security-analyzer', 'quality-monitor'],
                    mcpChain: ['exa-mcp', 'tavily-mcp', 'context7-mcp', 'sequential-thinking']
                },
                'FULL': {
                    description: 'Complete VIBECODE V2.1 execution',
                    scripts: ['install-mcps', 'verify-config', 'validate-mcps', 'trae-system-validator', 'optimize-performance', 'security-analyzer', 'generate-docs', 'run-tests', 'quality-monitor'],
                    mcpChain: ['sequential-thinking', 'desktop-commander', 'context7-mcp', 'tavily-mcp', 'exa-mcp']
                }
            },
            reporting: {
                enabled: true,
                format: 'json',
                includeDetails: true,
                saveToFile: true
            }
        };

        if (fs.existsSync(this.configFile)) {
            try {
                const userConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
                this.config = { ...defaultConfig, ...userConfig };
                this.log('Configuration loaded from file');
            } catch (error) {
                this.addWarning(`Failed to load config file: ${error.message}`);
                this.config = defaultConfig;
            }
        } else {
            this.config = defaultConfig;
            this.saveConfiguration();
        }
    }

    saveConfiguration() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
            this.log('Configuration saved to file');
        } catch (error) {
            this.addError(`Failed to save configuration: ${error.message}`);
        }
    }

    async runCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            
            const child = spawn(command, args, {
                stdio: 'pipe',
                shell: true,
                ...options
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                // Real-time output for critical scripts
                if (options.realTimeOutput) {
                    process.stdout.write(output);
                }
            });

            child.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                if (options.realTimeOutput) {
                    process.stderr.write(output);
                }
            });

            child.on('close', (code) => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                resolve({
                    code,
                    stdout,
                    stderr,
                    duration
                });
            });

            child.on('error', (error) => {
                reject(error);
            });

            // Handle timeout
            if (options.timeout) {
                setTimeout(() => {
                    child.kill('SIGTERM');
                    reject(new Error(`Command timeout after ${options.timeout}ms`));
                }, options.timeout);
            }
        });
    }

    async executeScript(scriptName, scriptConfig) {
        this.log(`\n--- Executing ${scriptName} ---`);
        
        if (!scriptConfig.enabled) {
            this.log(`Script ${scriptName} is disabled, skipping...`);
            return { success: true, skipped: true };
        }

        // Check if script file exists
        const scriptPath = scriptConfig.args[0];
        if (!fs.existsSync(scriptPath)) {
            const error = `Script file not found: ${scriptPath}`;
            if (scriptConfig.critical) {
                this.addError(error);
                return { success: false, error };
            } else {
                this.addWarning(error);
                return { success: true, skipped: true, reason: 'File not found' };
            }
        }

        try {
            const result = await this.runCommand(
                scriptConfig.command,
                scriptConfig.args,
                {
                    timeout: scriptConfig.timeout,
                    realTimeOutput: scriptConfig.critical
                }
            );

            const executionResult = {
                success: result.code === 0,
                duration: result.duration,
                output: result.stdout,
                errors: result.stderr,
                exitCode: result.code
            };

            if (executionResult.success) {
                this.log(`✅ ${scriptName} completed successfully (${(result.duration / 1000).toFixed(2)}s)`);
            } else {
                const message = `❌ ${scriptName} failed with exit code ${result.code}`;
                if (scriptConfig.critical) {
                    this.addError(message);
                } else {
                    this.addWarning(message);
                }
                
                // Log error details
                if (result.stderr) {
                    this.log(`Error output: ${result.stderr}`, 'ERROR');
                }
            }

            return executionResult;

        } catch (error) {
            const message = `Script execution failed: ${error.message}`;
            if (scriptConfig.critical) {
                this.addError(message);
                return { success: false, error: error.message };
            } else {
                this.addWarning(message);
                return { success: true, skipped: true, reason: error.message };
            }
        }
    }

    async executeMode(mode) {
        this.log(`\n========================================`);
        this.log(`VIBECODE V2.1 - ${mode} MODE EXECUTION`);
        this.log(`========================================`);
        
        const modeConfig = this.config.modes[mode];
        if (!modeConfig) {
            this.addError(`Unknown mode: ${mode}`);
            return false;
        }

        this.log(`Mode: ${modeConfig.description}`);
        this.log(`Scripts to execute: ${modeConfig.scripts.join(', ')}`);
        this.log(`MCP Chain: ${modeConfig.mcpChain.join(' → ')}`);

        const startTime = performance.now();
        let allScriptsSuccessful = true;

        // Execute scripts in sequence
        for (const scriptName of modeConfig.scripts) {
            const scriptConfig = this.config.scripts[scriptName];
            
            if (!scriptConfig) {
                this.addWarning(`Script configuration not found: ${scriptName}`);
                continue;
            }

            const result = await this.executeScript(scriptName, scriptConfig);
            this.executionResults[scriptName] = result;

            // Check if critical script failed
            if (!result.success && scriptConfig.critical && !result.skipped) {
                allScriptsSuccessful = false;
                this.log(`Critical script ${scriptName} failed, stopping execution`);
                break;
            }
        }

        const endTime = performance.now();
        const totalDuration = endTime - startTime;

        this.log(`\nMode execution completed in ${(totalDuration / 1000).toFixed(2)}s`);
        
        return allScriptsSuccessful;
    }

    generateExecutionReport() {
        this.log('\n========================================');
        this.log('VIBECODE V2.1 EXECUTION REPORT');
        this.log('========================================');
        
        this.log(`Quality Score: ${this.qualityScore.toFixed(1)}/10.0`);
        this.log(`Quality Threshold: ${this.config.qualityThreshold}/10.0`);
        this.log(`Meets Threshold: ${this.qualityScore >= this.config.qualityThreshold ? '✅ YES' : '❌ NO'}`);
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        // Script execution summary
        this.log('\nScript Execution Summary:');
        for (const [scriptName, result] of Object.entries(this.executionResults)) {
            let status;
            if (result.skipped) {
                status = '⏭️ SKIP';
            } else if (result.success) {
                status = '✅ PASS';
            } else {
                status = '❌ FAIL';
            }
            
            const duration = result.duration ? `(${(result.duration / 1000).toFixed(2)}s)` : '';
            this.log(`  ${status} ${scriptName} ${duration}`);
        }
        
        if (this.errors.length > 0) {
            this.log('\nErrors:');
            this.errors.forEach((error, index) => {
                this.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (this.warnings.length > 0) {
            this.log('\nWarnings:');
            this.warnings.forEach((warning, index) => {
                this.log(`  ${index + 1}. ${warning}`);
            });
        }
        
        const isSuccessful = this.qualityScore >= this.config.qualityThreshold && this.errors.length === 0;
        
        this.log('\n========================================');
        if (isSuccessful) {
            this.log(`✅ VIBECODE V2.1 EXECUTION SUCCESSFUL`);
        } else {
            this.log(`❌ VIBECODE V2.1 EXECUTION FAILED`);
        }
        this.log('========================================\n');
        
        // Save detailed report
        if (this.config.reporting.saveToFile) {
            const reportData = {
                timestamp: new Date().toISOString(),
                version: this.config.version,
                qualityScore: this.qualityScore,
                qualityThreshold: this.config.qualityThreshold,
                meetsThreshold: isSuccessful,
                executionResults: this.executionResults,
                errors: this.errors,
                warnings: this.warnings,
                isSuccessful
            };
            
            try {
                const reportFile = '.trae/logs/vibecode-execution-report.json';
                fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
                this.log(`Detailed report saved to ${reportFile}`);
            } catch (error) {
                this.addError(`Failed to save execution report: ${error.message}`);
            }
        }
        
        return isSuccessful;
    }

    async validateEnvironment() {
        this.log('Validating VIBECODE V2.1 environment...');
        
        // Check Node.js version
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
            
            if (majorVersion < 16) {
                this.addError(`Node.js version ${nodeVersion} is not supported. Minimum required: 16.x`);
                return false;
            }
            
            this.log(`✅ Node.js version: ${nodeVersion}`);
        } catch (error) {
            this.addError(`Failed to check Node.js version: ${error.message}`);
            return false;
        }
        
        // Check Python availability
        try {
            const pythonCheck = await this.runCommand('python', ['--version'], { timeout: 10000 });
            if (pythonCheck.code === 0) {
                this.log(`✅ Python available: ${pythonCheck.stdout.trim()}`);
            } else {
                this.addWarning('Python not available - some scripts may fail');
            }
        } catch (error) {
            this.addWarning('Python not available - some scripts may fail');
        }
        
        // Check required directories
        const requiredDirs = ['.trae', '.trae/scripts', '.trae/logs'];
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                this.addError(`Required directory missing: ${dir}`);
                return false;
            }
        }
        
        this.log('✅ Environment validation completed');
        return true;
    }

    printUsage() {
        console.log(`
VIBECODE V2.1 Runner - Usage:
`);
        console.log(`node vibecode-runner.js [mode] [options]
`);
        console.log(`Modes:`);
        for (const [mode, config] of Object.entries(this.config.modes)) {
            console.log(`  ${mode.padEnd(10)} - ${config.description}`);
        }
        console.log(`\nOptions:`);
        console.log(`  --help     Show this help message`);
        console.log(`  --config   Show current configuration`);
        console.log(`  --validate Validate environment only`);
        console.log(`\nExamples:`);
        console.log(`  node vibecode-runner.js FULL`);
        console.log(`  node vibecode-runner.js ACT`);
        console.log(`  node vibecode-runner.js PLAN`);
        console.log(``);
    }

    async run(args) {
        const mode = args[0];
        const options = args.slice(1);

        // Handle options
        if (options.includes('--help') || !mode) {
            this.printUsage();
            return true;
        }

        if (options.includes('--config')) {
            console.log('\nCurrent Configuration:');
            console.log(JSON.stringify(this.config, null, 2));
            return true;
        }

        if (options.includes('--validate')) {
            return await this.validateEnvironment();
        }

        // Validate environment before execution
        const envValid = await this.validateEnvironment();
        if (!envValid) {
            this.addError('Environment validation failed');
            return this.generateExecutionReport();
        }

        // Execute mode
        const success = await this.executeMode(mode);
        
        // Generate final report
        return this.generateExecutionReport();
    }
}

// Main execution
if (require.main === module) {
    const runner = new VibecodeRunner();
    const args = process.argv.slice(2);
    
    runner.run(args).then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('[FATAL] VIBECODE execution failed:', error);
        process.exit(1);
    });
}

module.exports = VibecodeRunner;