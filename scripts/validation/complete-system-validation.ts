#!/usr/bin/env tsx
/**
 * Complete System Validation Script
 * Validates BMAD-Archon integration and all healthcare components
 * Run: npx tsx scripts/validation/complete-system-validation.ts
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Validation results interface
interface ValidationResult {
  component: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, any>;
}

class SystemValidator {
  private results: ValidationResult[] = [];
  
  async validate(): Promise<void> {
    console.log('🚀 Starting NEONPRO Complete System Validation...\n');
    
    await this.validateFileStructure();
    await this.validateBMADConfiguration();
    await this.validateArchonIntegration();
    await this.validateComplianceModules();
    await this.validateSecurityComponents();
    await this.validateDashboardComponents();
    await this.validateAPIEndpoints();
    
    this.generateReport();
  }
  
  private async validateFileStructure(): Promise<void> {
    console.log('📁 Validating file structure...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check critical directories
    const criticalPaths = [
      '.bmad-core',
      '.bmad-core/agents',
      '.bmad-core/workflows',
      '.bmad-core/templates',
      'packages/compliance/src/utils',
      'apps/web/lib/ai-scheduling.ts',
      'apps/web/components/dashboard',
    ];
    
    for (const checkPath of criticalPaths) {
      try {
        await fs.access(checkPath);
      } catch {
        errors.push(`Missing critical path: ${checkPath}`);
      }
    }
    
    // Check BMAD agent files
    const bmadAgents = ['sm-agent.yaml', 'dev-agent.yaml', 'qa-agent.yaml'];
    for (const agent of bmadAgents) {
      try {
        await fs.access(`.bmad-core/agents/${agent}`);
      } catch {
        errors.push(`Missing BMAD agent: ${agent}`);
      }
    }
    
    this.results.push({
      component: 'File Structure',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateBMADConfiguration(): Promise<void> {
    console.log('⚙️ Validating BMAD configuration...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate core config
      const coreConfig = await fs.readFile('.bmad-core/core-config.yaml', 'utf-8');
      if (!coreConfig.includes('neonpro-healthcare')) {
        errors.push('BMAD core config missing healthcare domain specification');
      }
      
      // Validate workflow configuration
      const workflowPath = '.bmad-core/workflows/sm-dev-qa-cycle.yaml';
      const workflow = await fs.readFile(workflowPath, 'utf-8');
      if (!workflow.includes('archon_actions')) {
        errors.push('Workflow missing Archon integration points');
      }
      
      // Validate task template
      const template = await fs.readFile('.bmad-core/templates/archon-task-template.yaml', 'utf-8');
      if (!template.includes('healthcare_compliance')) {
        warnings.push('Task template should include healthcare compliance requirements');
      }
      
    } catch (error) {
      errors.push(`Failed to read BMAD configuration: ${error}`);
    }
    
    this.results.push({
      component: 'BMAD Configuration',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateArchonIntegration(): Promise<void> {
    console.log('🎯 Validating Archon integration...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for MCP configuration
    try {
      const mcpConfig = await fs.readFile('.mcp.json', 'utf-8');
      const config = JSON.parse(mcpConfig);
      
      if (!config.mcpServers?.archon) {
        errors.push('Archon MCP server not configured');
      }
      
      // Check if Archon tools are properly integrated
      const archonTools = ['manage_project', 'manage_task', 'manage_document', 'perform_rag_query'];
      for (const tool of archonTools) {
        if (!mcpConfig.includes(tool)) {
          warnings.push(`Archon tool ${tool} may not be properly integrated`);
        }
      }
      
    } catch (error) {
      errors.push(`Failed to validate MCP configuration: ${error}`);
    }
    
    this.results.push({
      component: 'Archon Integration',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateComplianceModules(): Promise<void> {
    console.log('🛡️ Validating compliance modules...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check compliance utilities
    const complianceUtils = [
      'packages/compliance/src/utils/compliance-helpers.ts',
      'packages/compliance/src/utils/audit-utils.ts',
      'packages/compliance/src/utils/validation-helpers.ts'
    ];
    
    for (const util of complianceUtils) {
      try {
        const content = await fs.readFile(util, 'utf-8');
        
        // Check for critical functions
        if (util.includes('compliance-helpers')) {
          if (!content.includes('validateCPF') || !content.includes('validateCNPJ')) {
            errors.push('Compliance helpers missing Brazilian validation functions');
          }
        }
        
        if (util.includes('audit-utils')) {
          if (!content.includes('createAuditLog') || !content.includes('LGPD_BASIS')) {
            errors.push('Audit utils missing LGPD compliance functions');
          }
        }
        
      } catch {
        errors.push(`Missing compliance utility: ${util}`);
      }
    }
    
    this.results.push({
      component: 'Compliance Modules',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateSecurityComponents(): Promise<void> {
    console.log('🔒 Validating security components...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check MFA service
      const mfaService = await fs.readFile('packages/security/src/auth/mfa-service.ts', 'utf-8');
      if (!mfaService.includes('TOTP') || !mfaService.includes('healthcare')) {
        warnings.push('MFA service may not be healthcare-optimized');
      }
      
      // Check if stock alerts have proper user context
      const stockAlerts = await fs.readFile('apps/web/app/api/stock/alerts/route.ts', 'utf-8');
      if (stockAlerts.includes('testClinicId')) {
        errors.push('Stock alerts still using test clinic ID instead of user context');
      }
      
      if (!stockAlerts.includes('getUserClinicContext')) {
        errors.push('Stock alerts missing user clinic context validation');
      }
      
    } catch (error) {
      errors.push(`Failed to validate security components: ${error}`);
    }
    
    this.results.push({
      component: 'Security Components',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateDashboardComponents(): Promise<void> {
    console.log('📊 Validating dashboard components...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check healthcare dashboard
      const healthcareDashboard = await fs.readFile(
        'apps/web/components/dashboard/healthcare-dashboard.tsx',
        'utf-8'
      );
      
      if (!healthcareDashboard.includes('LGPD') || !healthcareDashboard.includes('audit')) {
        warnings.push('Healthcare dashboard may not include proper compliance features');
      }
      
      // Check AI scheduling integration
      const aiScheduling = await fs.readFile('apps/web/lib/ai-scheduling.ts', 'utf-8');
      if (!aiScheduling.includes('createAuditLog') || !aiScheduling.includes('validateHealthcareAccess')) {
        errors.push('AI scheduling missing compliance integration');
      }
      
    } catch (error) {
      errors.push(`Failed to validate dashboard components: ${error}`);
    }
    
    this.results.push({
      component: 'Dashboard Components',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private async validateAPIEndpoints(): Promise<void> {
    console.log('🔌 Validating API endpoints...');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if critical API endpoints exist
    const apiEndpoints = [
      'apps/web/app/api/ai/predictions/route.ts',
      'apps/web/app/api/stock/alerts/route.ts',
      'apps/web/app/api/auth/webauthn/credentials/route.ts',
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        await fs.access(endpoint);
      } catch {
        errors.push(`Missing API endpoint: ${endpoint}`);
      }
    }
    
    this.results.push({
      component: 'API Endpoints',
      passed: errors.length === 0,
      errors,
      warnings
    });
  }
  
  private generateReport(): void {
    console.log('\n📋 VALIDATION REPORT');
    console.log('='.repeat(50));
    
    let totalPassed = 0;
    let totalComponents = this.results.length;
    let criticalErrors = 0;
    
    for (const result of this.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.component}`);
      
      if (result.passed) {
        totalPassed++;
      } else {
        criticalErrors += result.errors.length;
      }
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => console.log(`   ❌ ${error}`));
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
      }
      
      console.log('');
    }
    
    console.log('SUMMARY');
    console.log('-'.repeat(50));
    console.log(`Components Validated: ${totalComponents}`);
    console.log(`Components Passed: ${totalPassed}`);
    console.log(`Components Failed: ${totalComponents - totalPassed}`);
    console.log(`Critical Errors: ${criticalErrors}`);
    
    const successRate = (totalPassed / totalComponents) * 100;
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('\n🎉 SYSTEM VALIDATION PASSED - Integration is ready for production!');
    } else if (successRate >= 70) {
      console.log('\n⚠️  SYSTEM VALIDATION PARTIAL - Some issues need attention');
    } else {
      console.log('\n❌ SYSTEM VALIDATION FAILED - Critical issues must be resolved');
    }
    
    // Save report to file
    this.saveReportToFile();
  }
  
  private async saveReportToFile(): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total_components: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        success_rate: (this.results.filter(r => r.passed).length / this.results.length) * 100
      }
    };
    
    try {
      await fs.writeFile(
        'validation-report.json',
        JSON.stringify(reportData, null, 2)
      );
      console.log('\n📄 Report saved to validation-report.json');
    } catch (error) {
      console.log('⚠️  Failed to save report to file');
    }
  }
}

// Execute validation
if (require.main === module) {
  const validator = new SystemValidator();
  validator.validate().catch(console.error);
}

export { SystemValidator };