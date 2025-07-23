#!/usr/bin/env node
/**
 * ========================================
 * VIBECODE V2.1 - Configuration Validator
 * ========================================
 * Validates environment and configuration
 * Quality Threshold: >=9.5/10
 * ========================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.qualityScore = 10.0;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
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

    checkNodeEnvironment() {
        this.log('Checking Node.js environment...');
        
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
            
            if (majorVersion < 18) {
                this.addError(`Node.js version ${nodeVersion} is too old. Minimum required: 18.x`);
            } else {
                this.log(`Node.js version ${nodeVersion} - OK`);
            }
        } catch (error) {
            this.addError(`Failed to check Node.js version: ${error.message}`);
        }
    }

    checkProjectStructure() {
        this.log('Checking project structure...');
        
        const requiredDirs = [
            '.trae',
            '.trae/scripts',
            '.trae/logs',
            '.trae/config',
            'app',
            'components',
            'lib'
        ];

        const requiredFiles = [
            'package.json',
            'next.config.mjs',
            'tailwind.config.ts',
            'tsconfig.json'
        ];

        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                this.addError(`Required directory missing: ${dir}`);
            } else {
                this.log(`Directory ${dir} - OK`);
            }
        });

        requiredFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.addError(`Required file missing: ${file}`);
            } else {
                this.log(`File ${file} - OK`);
            }
        });
    }

    checkEnvironmentVariables() {
        this.log('Checking environment variables...');
        
        const requiredEnvVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];

        // Check .env.local file
        if (fs.existsSync('.env.local')) {
            const envContent = fs.readFileSync('.env.local', 'utf8');
            
            requiredEnvVars.forEach(envVar => {
                if (!envContent.includes(envVar)) {
                    this.addWarning(`Environment variable ${envVar} not found in .env.local`);
                } else {
                    this.log(`Environment variable ${envVar} - OK`);
                }
            });
        } else {
            this.addWarning('.env.local file not found');
        }
    }

    checkDependencies() {
        this.log('Checking package dependencies...');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            const criticalDeps = [
                'next',
                'react',
                'typescript',
                '@supabase/supabase-js',
                'tailwindcss'
            ];

            criticalDeps.forEach(dep => {
                if (!dependencies[dep]) {
                    this.addError(`Critical dependency missing: ${dep}`);
                } else {
                    this.log(`Dependency ${dep} - OK`);
                }
            });
        } catch (error) {
            this.addError(`Failed to check dependencies: ${error.message}`);
        }
    }

    checkMCPConfiguration() {
        this.log('Checking MCP configuration...');
        
        const mcpConfigFiles = [
            '.mcp.json',
            '.trae/config/mcp.json'
        ];

        let mcpConfigFound = false;
        mcpConfigFiles.forEach(configFile => {
            if (fs.existsSync(configFile)) {
                mcpConfigFound = true;
                this.log(`MCP config found: ${configFile}`);
            }
        });

        if (!mcpConfigFound) {
            this.addWarning('No MCP configuration file found');
        }
    }

    generateReport() {
        this.log('\n========================================');
        this.log('VIBECODE V2.1 Configuration Validation Report');
        this.log('========================================');
        
        this.log(`Quality Score: ${this.qualityScore.toFixed(1)}/10.0`);
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            this.log('\nERRORS:');
            this.errors.forEach((error, index) => {
                this.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (this.warnings.length > 0) {
            this.log('\nWARNINGS:');
            this.warnings.forEach((warning, index) => {
                this.log(`  ${index + 1}. ${warning}`);
            });
        }
        
        const isValid = this.qualityScore >= 9.5 && this.errors.length === 0;
        
        this.log('\n========================================');
        if (isValid) {
            this.log('✅ CONFIGURATION VALID - Quality >= 9.5/10', 'SUCCESS');
        } else {
            this.log('❌ CONFIGURATION INVALID - Quality < 9.5/10 or errors present', 'ERROR');
        }
        this.log('========================================\n');
        
        return isValid;
    }

    async validate() {
        this.log('Starting VIBECODE V2.1 configuration validation...');
        
        this.checkNodeEnvironment();
        this.checkProjectStructure();
        this.checkEnvironmentVariables();
        this.checkDependencies();
        this.checkMCPConfiguration();
        
        const isValid = this.generateReport();
        
        process.exit(isValid ? 0 : 1);
    }
}

// Execute validation
if (require.main === module) {
    const validator = new ConfigValidator();
    validator.validate().catch(error => {
        console.error('[FATAL] Configuration validation failed:', error);
        process.exit(1);
    });
}

module.exports = ConfigValidator;