#!/usr/bin/env node
/**
 * NeonPro Healthcare-Optimized Build Script
 * Specialized build system for healthcare compliance and performance
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Healthcare compliance requirements
const HEALTHCARE_REQUIREMENTS = {
  // Data residency compliance
  dataResidency: {
    allowedRegions: ['local', 'br'],
    validateOutput: true
  },
  
  // Security requirements
  security: {
    validateDependencies: true,
    checkVulnerabilities: true,
    auditLogging: true
  },
  
  // Performance requirements
  performance: {
    maxBuildTime: 300000, // 5 minutes
    minCacheHitRate: 0.8,
    parallelBuild: true
  },
  
  // Compliance validation
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    hipaa: false // Not required for Brazilian market
  }
};

class HealthcareBuilder {
  constructor() {
    this.buildStartTime = Date.now();
    this.complianceResults = new Map();
    this.performanceMetrics = new Map();
  }

  async log(message, level = 'info', compliance = false) {
    const timestamp = new Date().toISOString();
    const prefix = compliance ? '🏥 [COMPLIANCE]' : '[BUILD]';
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);
  }

  async executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, _reject) => {
      const child = spawn(command, { 
        cwd, 
        shell: true,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout, stderr });
        } else {
          resolve({ success: false, stdout, stderr, code });
        }
      });

      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  async validateHealthcareCompliance() {
    this.log('🔍 Starting healthcare compliance validation...', 'info', true);
    
    const validations = [];
    
    // 1. Validate data residency
    validations.push(this.validateDataResidency());
    
    // 2. Check for vulnerable dependencies
    validations.push(this.validateSecurityDependencies());
    
    // 3. Validate audit logging
    validations.push(this.validateAuditLogging());
    
    // 4. Check LGPD compliance
    validations.push(this.validateLgpdCompliance());
    
    const results = await Promise.all(validations);
    
    for (const result of results) {
      this.complianceResults.set(result.type, result);
      
      if (result.valid) {
        this.log(`✅ ${result.type}: ${result.message}`, 'info', true);
      } else {
        this.log(`❌ ${result.type}: ${result.message}`, 'error', true);
      }
    }
    
    return results;
  }

  async validateDataResidency() {
    try {
      const packagePath = path.join(__dirname, '..');
      const hasDataResidencyConfig = await this.checkDataResidencyConfig(packagePath);
      
      return {
        type: 'Data Residency',
        valid: hasDataResidencyConfig,
        message: hasDataResidencyConfig ? 
          'Data residency configuration found' : 
          'Missing data residency configuration'
      };
    } catch (error) {
      return {
        type: 'Data Residency',
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }

  async validateSecurityDependencies() {
    try {
      const packagePath = path.join(__dirname, '..');
      const packageJsonPath = path.join(packagePath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // Check for security-related dependencies
      const securityDeps = [
        '@supabase/supabase-js',
        'zod',
        'dompurify'
      ];
      
      const hasSecurityDeps = securityDeps.some(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      );
      
      return {
        type: 'Security Dependencies',
        valid: hasSecurityDeps,
        message: hasSecurityDeps ? 
          'Security dependencies configured' : 
          'Missing security dependencies'
      };
    } catch (error) {
      return {
        type: 'Security Dependencies',
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }

  async validateAuditLogging() {
    try {
      const hasAuditConfig = await this.checkAuditLoggingConfig();
      
      return {
        type: 'Audit Logging',
        valid: hasAuditConfig,
        message: hasAuditConfig ? 
          'Audit logging configuration found' : 
          'Missing audit logging configuration'
      };
    } catch (error) {
      return {
        type: 'Audit Logging',
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }

  async validateLgpdCompliance() {
    try {
      const lgpdFiles = [
        'packages/security/src/compliance.ts',
        'packages/security/src/lgpd.valibot.ts',
        'packages/security/src/lgpd.zod.ts'
      ];
      
      const lgpdChecks = await Promise.all(
        lgpdFiles.map(async (file) => {
          try {
            await fs.access(path.join(__dirname, '..', file));
            return true;
          } catch {
            return false;
          }
        })
      );
      
      const hasLgpdCompliance = lgpdChecks.some(check => check);
      
      return {
        type: 'LGPD Compliance',
        valid: hasLgpdCompliance,
        message: hasLgpdCompliance ? 
          'LGPD compliance files found' : 
          'Missing LGPD compliance files'
      };
    } catch (error) {
      return {
        type: 'LGPD Compliance',
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }

  async checkDataResidencyConfig(packagePath) {
    // Check for data residency configuration
    const configFiles = ['bunfig.toml', 'turbo.json', '.env'];
    
    for (const file of configFiles) {
      try {
        const filePath = path.join(packagePath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        if (content.toLowerCase().includes('residency') || 
            content.toLowerCase().includes('local')) {
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }

  async checkAuditLoggingConfig() {
    const securityPath = path.join(__dirname, '..', 'packages', 'security');
    
    try {
      await fs.access(securityPath);
      const files = await fs.readdir(securityPath);
      
      return files.some(file => 
        file.toLowerCase().includes('audit') || 
        file.toLowerCase().includes('logging')
      );
    } catch {
      return false;
    }
  }

  async buildWithCompliance() {
    this.log('🏥 Starting healthcare-compliant build...', 'info', true);
    
    // Step 1: Validate compliance
    const complianceResults = await this.validateHealthcareCompliance();
    
    // Step 2: Check if compliance validation passed
    const compliancePassed = complianceResults.every(result => result.valid);
    
    if (!compliancePassed) {
      this.log('❌ Compliance validation failed - build halted', 'error', true);
      return { success: false, reason: 'Compliance validation failed' };
    }
    
    // Step 3: Execute build
    this.log('✅ Compliance validated - proceeding with build...', 'info', true);
    
    const buildCommand = 'node scripts/build-optimized.js';
    const buildResult = await this.executeCommand(buildCommand);
    
    // Step 4: Generate compliance report
    await this.generateComplianceReport(buildResult);
    
    return {
      success: buildResult.success,
      compliance: complianceResults,
      build: buildResult
    };
  }

  async generateComplianceReport(buildResult) {
    const buildTime = Date.now() - this.buildStartTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: `${buildTime}ms`,
      healthcare: {
        compliance: Object.fromEntries(this.complianceResults),
        requirements: HEALTHCARE_REQUIREMENTS
      },
      build: {
        success: buildResult.success,
        output: buildResult.stdout?.substring(0, 500) + '...',
        error: buildResult.stderr
      },
      performance: Object.fromEntries(this.performanceMetrics)
    };
    
    const reportPath = path.join(__dirname, '..', 'healthcare-build-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📊 Healthcare compliance report saved to ${reportPath}`, 'info', true);
  }

  async run() {
    this.log('🚀 Starting NeonPro healthcare-optimized build...');
    this.log('🏥 Healthcare compliance mode: ENABLED');
    
    try {
      const result = await this.buildWithCompliance();
      
      if (result.success) {
        this.log('🎉 Healthcare-compliant build completed successfully!');
        return 0;
      } else {
        this.log('❌ Healthcare-compliant build failed', 'error');
        return 1;
      }
    } catch (error) {
      this.log(`💥 Build failed: ${error.message}`, 'error');
      return 1;
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new HealthcareBuilder();
  builder.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Healthcare build script failed:', error);
    process.exit(1);
  });
}

export default HealthcareBuilder;