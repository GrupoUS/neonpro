#!/usr/bin/env node
/**
 * ========================================
 * VIBECODE V2.1 - Deploy Automation
 * ========================================
 * Automated deployment with quality gates
 * Quality Threshold: >=9.8/10
 * ========================================
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { performance } = require('perf_hooks');

class DeployAutomation {
    constructor() {
        this.qualityScore = 10.0;
        this.deploymentSteps = [];
        this.errors = [];
        this.warnings = [];
        this.deploymentConfig = {};
        this.logFile = '.trae/logs/deployment.log';
        this.ensureLogDirectory();
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
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
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
        });
    }

    loadDeploymentConfig() {
        this.log('Loading deployment configuration...');
        
        const configFiles = [
            '.trae/deploy.config.json',
            'deploy.config.json',
            'vercel.json',
            'netlify.toml',
            'package.json'
        ];

        let configLoaded = false;
        
        for (const configFile of configFiles) {
            if (fs.existsSync(configFile)) {
                try {
                    if (configFile.endsWith('.json')) {
                        this.deploymentConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                        this.log(`Configuration loaded from ${configFile}`);
                        configLoaded = true;
                        break;
                    } else if (configFile === 'netlify.toml') {
                        // Basic TOML parsing for Netlify
                        this.deploymentConfig = { platform: 'netlify' };
                        this.log(`Netlify configuration detected`);
                        configLoaded = true;
                        break;
                    }
                } catch (error) {
                    this.addWarning(`Failed to parse ${configFile}: ${error.message}`);
                }
            }
        }

        if (!configLoaded) {
            this.addWarning('No deployment configuration found, using defaults');
            this.deploymentConfig = {
                platform: 'auto-detect',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                nodeVersion: '18'
            };
        }

        return configLoaded;
    }

    detectDeploymentPlatform() {
        this.log('Detecting deployment platform...');
        
        // Check for platform-specific files
        const platformIndicators = [
            { file: 'vercel.json', platform: 'vercel' },
            { file: '.vercel', platform: 'vercel' },
            { file: 'netlify.toml', platform: 'netlify' },
            { file: '_redirects', platform: 'netlify' },
            { file: 'Dockerfile', platform: 'docker' },
            { file: '.github/workflows', platform: 'github-actions' },
            { file: 'firebase.json', platform: 'firebase' }
        ];

        for (const indicator of platformIndicators) {
            if (fs.existsSync(indicator.file)) {
                this.deploymentConfig.platform = indicator.platform;
                this.log(`Deployment platform detected: ${indicator.platform}`);
                return indicator.platform;
            }
        }

        // Check package.json for deployment scripts
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            if (packageJson.scripts) {
                if (packageJson.scripts['deploy:vercel']) {
                    this.deploymentConfig.platform = 'vercel';
                    return 'vercel';
                }
                if (packageJson.scripts['deploy:netlify']) {
                    this.deploymentConfig.platform = 'netlify';
                    return 'netlify';
                }
            }
        }

        this.addWarning('Could not detect deployment platform');
        return 'unknown';
    }

    async runPreDeploymentChecks() {
        this.log('Running pre-deployment checks...');
        
        const checks = [
            () => this.checkGitStatus(),
            () => this.checkEnvironmentVariables(),
            () => this.checkBuildConfiguration(),
            () => this.runTests(),
            () => this.checkSecurityVulnerabilities()
        ];

        let allChecksPassed = true;
        
        for (const check of checks) {
            try {
                const result = await check();
                if (!result.success) {
                    allChecksPassed = false;
                    this.addError(`Pre-deployment check failed: ${result.message}`);
                }
            } catch (error) {
                allChecksPassed = false;
                this.addError(`Pre-deployment check error: ${error.message}`);
            }
        }

        return allChecksPassed;
    }

    async checkGitStatus() {
        this.log('Checking Git status...');
        
        try {
            // Check if we're in a git repository
            const gitStatus = await this.runCommand('git', ['status', '--porcelain']);
            
            if (gitStatus.code !== 0) {
                return { success: false, message: 'Not a git repository or git not available' };
            }

            // Check for uncommitted changes
            if (gitStatus.stdout.trim()) {
                this.addWarning('Uncommitted changes detected');
                this.log('Uncommitted files:');
                this.log(gitStatus.stdout);
            }

            // Check current branch
            const branchResult = await this.runCommand('git', ['branch', '--show-current']);
            const currentBranch = branchResult.stdout.trim();
            this.log(`Current branch: ${currentBranch}`);

            return { success: true, branch: currentBranch };

        } catch (error) {
            return { success: false, message: `Git check failed: ${error.message}` };
        }
    }

    async checkEnvironmentVariables() {
        this.log('Checking environment variables...');
        
        const requiredEnvVars = [
            'NODE_ENV',
            'NEXT_PUBLIC_API_URL'
        ];

        const missingVars = [];
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingVars.push(envVar);
            }
        }

        if (missingVars.length > 0) {
            this.addWarning(`Missing environment variables: ${missingVars.join(', ')}`);
        }

        // Check for .env files
        const envFiles = ['.env', '.env.local', '.env.production'];
        let envFileFound = false;
        
        for (const envFile of envFiles) {
            if (fs.existsSync(envFile)) {
                envFileFound = true;
                this.log(`Environment file found: ${envFile}`);
            }
        }

        if (!envFileFound) {
            this.addWarning('No environment files found');
        }

        return { success: true, missingVars };
    }

    async checkBuildConfiguration() {
        this.log('Checking build configuration...');
        
        // Check package.json
        if (!fs.existsSync('package.json')) {
            return { success: false, message: 'package.json not found' };
        }

        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check for build script
        if (!packageJson.scripts || !packageJson.scripts.build) {
            return { success: false, message: 'No build script found in package.json' };
        }

        // Check for Next.js configuration
        const nextConfigFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
        let nextConfigFound = false;
        
        for (const configFile of nextConfigFiles) {
            if (fs.existsSync(configFile)) {
                nextConfigFound = true;
                this.log(`Next.js configuration found: ${configFile}`);
                break;
            }
        }

        if (!nextConfigFound) {
            this.addWarning('No Next.js configuration found');
        }

        return { success: true };
    }

    async runTests() {
        this.log('Running tests before deployment...');
        
        try {
            if (fs.existsSync('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                
                if (packageJson.scripts && packageJson.scripts.test) {
                    const testResult = await this.runCommand('npm', ['test'], {
                        env: { ...process.env, CI: 'true' }
                    });
                    
                    if (testResult.code !== 0) {
                        return { success: false, message: 'Tests failed' };
                    }
                    
                    this.log('✅ All tests passed');
                    return { success: true };
                } else {
                    this.addWarning('No test script found');
                    return { success: true, message: 'No tests configured' };
                }
            }
        } catch (error) {
            return { success: false, message: `Test execution failed: ${error.message}` };
        }
    }

    async checkSecurityVulnerabilities() {
        this.log('Checking for security vulnerabilities...');
        
        try {
            const auditResult = await this.runCommand('npm', ['audit', '--audit-level', 'high']);
            
            if (auditResult.code !== 0) {
                this.addWarning('Security vulnerabilities detected');
                this.log('Audit output:');
                this.log(auditResult.stdout);
                return { success: true, message: 'Vulnerabilities detected but not blocking' };
            }
            
            this.log('✅ No high-severity vulnerabilities found');
            return { success: true };
            
        } catch (error) {
            this.addWarning(`Security audit failed: ${error.message}`);
            return { success: true, message: 'Security audit could not be performed' };
        }
    }

    async buildProject() {
        this.log('Building project...');
        
        try {
            const buildCommand = this.deploymentConfig.buildCommand || 'npm run build';
            const [command, ...args] = buildCommand.split(' ');
            
            this.log(`Running build command: ${buildCommand}`);
            
            const buildResult = await this.runCommand(command, args, {
                env: { ...process.env, NODE_ENV: 'production' }
            });
            
            if (buildResult.code !== 0) {
                this.addError('Build failed');
                this.log('Build output:');
                this.log(buildResult.stdout);
                this.log('Build errors:');
                this.log(buildResult.stderr);
                return { success: false, message: 'Build failed' };
            }
            
            this.log(`✅ Build completed successfully (${(buildResult.duration / 1000).toFixed(2)}s)`);
            
            // Check if build output exists
            const outputDir = this.deploymentConfig.outputDirectory || 'dist';
            if (!fs.existsSync(outputDir) && !fs.existsSync('.next')) {
                this.addWarning('Build output directory not found');
            }
            
            return { success: true, duration: buildResult.duration };
            
        } catch (error) {
            this.addError(`Build execution failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async deployToVercel() {
        this.log('Deploying to Vercel...');
        
        try {
            // Check if Vercel CLI is available
            const vercelCheck = await this.runCommand('vercel', ['--version']);
            
            if (vercelCheck.code !== 0) {
                return { success: false, message: 'Vercel CLI not found. Install with: npm i -g vercel' };
            }
            
            // Deploy
            const deployResult = await this.runCommand('vercel', ['--prod', '--yes']);
            
            if (deployResult.code !== 0) {
                this.addError('Vercel deployment failed');
                this.log('Deployment output:');
                this.log(deployResult.stdout);
                this.log('Deployment errors:');
                this.log(deployResult.stderr);
                return { success: false, message: 'Vercel deployment failed' };
            }
            
            // Extract deployment URL
            const deploymentUrl = deployResult.stdout.match(/https:\/\/[^\s]+/)?.[0];
            
            this.log(`✅ Deployed to Vercel successfully`);
            if (deploymentUrl) {
                this.log(`🌐 Deployment URL: ${deploymentUrl}`);
            }
            
            return { success: true, url: deploymentUrl, duration: deployResult.duration };
            
        } catch (error) {
            this.addError(`Vercel deployment failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async deployToNetlify() {
        this.log('Deploying to Netlify...');
        
        try {
            // Check if Netlify CLI is available
            const netlifyCheck = await this.runCommand('netlify', ['--version']);
            
            if (netlifyCheck.code !== 0) {
                return { success: false, message: 'Netlify CLI not found. Install with: npm i -g netlify-cli' };
            }
            
            // Deploy
            const deployResult = await this.runCommand('netlify', ['deploy', '--prod']);
            
            if (deployResult.code !== 0) {
                this.addError('Netlify deployment failed');
                this.log('Deployment output:');
                this.log(deployResult.stdout);
                this.log('Deployment errors:');
                this.log(deployResult.stderr);
                return { success: false, message: 'Netlify deployment failed' };
            }
            
            // Extract deployment URL
            const deploymentUrl = deployResult.stdout.match(/https:\/\/[^\s]+/)?.[0];
            
            this.log(`✅ Deployed to Netlify successfully`);
            if (deploymentUrl) {
                this.log(`🌐 Deployment URL: ${deploymentUrl}`);
            }
            
            return { success: true, url: deploymentUrl, duration: deployResult.duration };
            
        } catch (error) {
            this.addError(`Netlify deployment failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async runPostDeploymentTests(deploymentUrl) {
        this.log('Running post-deployment tests...');
        
        if (!deploymentUrl) {
            this.addWarning('No deployment URL provided for post-deployment tests');
            return { success: true, message: 'No URL to test' };
        }
        
        try {
            // Basic health check
            const healthCheck = await this.runCommand('curl', ['-f', '-s', '-o', '/dev/null', '-w', '%{http_code}', deploymentUrl]);
            
            if (healthCheck.stdout.trim() === '200') {
                this.log('✅ Health check passed');
            } else {
                this.addWarning(`Health check returned status: ${healthCheck.stdout.trim()}`);
            }
            
            // Run E2E tests if configured
            if (fs.existsSync('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                
                if (packageJson.scripts && packageJson.scripts['test:e2e:prod']) {
                    this.log('Running production E2E tests...');
                    
                    const e2eResult = await this.runCommand('npm', ['run', 'test:e2e:prod'], {
                        env: { ...process.env, BASE_URL: deploymentUrl }
                    });
                    
                    if (e2eResult.code !== 0) {
                        this.addError('Post-deployment E2E tests failed');
                        return { success: false, message: 'E2E tests failed' };
                    }
                    
                    this.log('✅ Post-deployment E2E tests passed');
                }
            }
            
            return { success: true };
            
        } catch (error) {
            this.addWarning(`Post-deployment tests failed: ${error.message}`);
            return { success: true, message: 'Post-deployment tests could not be performed' };
        }
    }

    generateDeploymentReport(deploymentResult) {
        this.log('\n========================================');
        this.log('VIBECODE V2.1 Deployment Report');
        this.log('========================================');
        
        this.log(`Quality Score: ${this.qualityScore.toFixed(1)}/10.0`);
        this.log(`Platform: ${this.deploymentConfig.platform}`);
        this.log(`Deployment Status: ${deploymentResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (deploymentResult.url) {
            this.log(`Deployment URL: ${deploymentResult.url}`);
        }
        
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        // Deployment steps summary
        this.log('\nDeployment Steps:');
        this.deploymentSteps.forEach((step, index) => {
            const status = step.success ? '✅ PASS' : '❌ FAIL';
            const duration = step.duration ? `(${(step.duration / 1000).toFixed(2)}s)` : '';
            this.log(`  ${index + 1}. ${status} ${step.name} ${duration}`);
        });
        
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
        
        const isSuccessful = this.qualityScore >= 9.8 && deploymentResult.success && this.errors.length === 0;
        
        this.log('\n========================================');
        if (isSuccessful) {
            this.log(`✅ DEPLOYMENT SUCCESSFUL - Quality >= 9.8/10`);
        } else {
            this.log(`❌ DEPLOYMENT FAILED - Quality < 9.8/10 or deployment errors`);
        }
        this.log('========================================\n');
        
        // Save report
        const reportData = {
            timestamp: new Date().toISOString(),
            qualityScore: this.qualityScore,
            platform: this.deploymentConfig.platform,
            deploymentResult,
            deploymentSteps: this.deploymentSteps,
            errors: this.errors,
            warnings: this.warnings,
            isSuccessful
        };
        
        try {
            fs.writeFileSync('.trae/logs/deployment-report.json', JSON.stringify(reportData, null, 2));
            this.log('Report saved to .trae/logs/deployment-report.json');
        } catch (error) {
            this.addError(`Failed to save report: ${error.message}`);
        }
        
        return isSuccessful;
    }

    async deploy() {
        this.log('Starting VIBECODE V2.1 automated deployment...');
        
        // Load configuration
        this.loadDeploymentConfig();
        
        // Detect platform
        const platform = this.detectDeploymentPlatform();
        
        // Pre-deployment checks
        this.log('\n--- PRE-DEPLOYMENT CHECKS ---');
        const preChecksResult = await this.runPreDeploymentChecks();
        this.deploymentSteps.push({ name: 'Pre-deployment Checks', success: preChecksResult });
        
        if (!preChecksResult) {
            this.addError('Pre-deployment checks failed');
            return this.generateDeploymentReport({ success: false, message: 'Pre-deployment checks failed' });
        }
        
        // Build project
        this.log('\n--- BUILD PHASE ---');
        const buildResult = await this.buildProject();
        this.deploymentSteps.push({ name: 'Build Project', success: buildResult.success, duration: buildResult.duration });
        
        if (!buildResult.success) {
            return this.generateDeploymentReport({ success: false, message: 'Build failed' });
        }
        
        // Deploy based on platform
        this.log('\n--- DEPLOYMENT PHASE ---');
        let deploymentResult;
        
        switch (platform) {
            case 'vercel':
                deploymentResult = await this.deployToVercel();
                break;
            case 'netlify':
                deploymentResult = await this.deployToNetlify();
                break;
            default:
                this.addError(`Unsupported deployment platform: ${platform}`);
                deploymentResult = { success: false, message: `Unsupported platform: ${platform}` };
        }
        
        this.deploymentSteps.push({ name: 'Deploy to Platform', success: deploymentResult.success, duration: deploymentResult.duration });
        
        if (!deploymentResult.success) {
            return this.generateDeploymentReport(deploymentResult);
        }
        
        // Post-deployment tests
        this.log('\n--- POST-DEPLOYMENT TESTS ---');
        const postTestsResult = await this.runPostDeploymentTests(deploymentResult.url);
        this.deploymentSteps.push({ name: 'Post-deployment Tests', success: postTestsResult.success });
        
        // Generate final report
        return this.generateDeploymentReport(deploymentResult);
    }
}

// Execute deployment
if (require.main === module) {
    const deployer = new DeployAutomation();
    deployer.deploy().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('[FATAL] Deployment failed:', error);
        process.exit(1);
    });
}

module.exports = DeployAutomation;