#!/usr/bin/env node

/**
 * Vercel Deployment Configuration Verification Script
 * 
 * This script validates that all deployment configurations are correct
 * and creates comprehensive verification report for manual validation steps.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

class DeploymentConfigVerifier {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.verifications = [];
  }

  /**
   * Verify Vercel configuration
   */
  verifyVercelConfig() {
    console.log('🔍 Verifying Vercel Configuration...\n');
    
    const vercelConfigPath = join(PROJECT_ROOT, 'vercel.json');
    if (!existsSync(vercelConfigPath)) {
      this.issues.push('❌ vercel.json not found');
      return;
    }

    try {
      const config = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
      
      // Check framework
      if (config.framework) {
        this.issues.push(`⚠️  Framework specified in vercel.json: ${config.framework}`);
        this.recommendations.push('Remove framework field from vercel.json to avoid conflicts');
      } else {
        this.verifications.push('✅ No framework specified in vercel.json (correct)');
      }

      // Check functions configuration
      if (config.functions && config.functions['api/index.ts']) {
        const funcConfig = config.functions['api/index.ts'];
        this.verifications.push(`✅ Function config found for api/index.ts`);
        this.verifications.push(`   - Runtime: ${funcConfig.runtime || 'nodejs20.x'}`);
        this.verifications.push(`   - Memory: ${funcConfig.memory || '1024MB'}`);
        
        if (funcConfig.runtime !== 'nodejs20.x') {
          this.recommendations.push('Consider using nodejs20.x for latest Node.js features');
        }
      } else {
        this.issues.push('❌ No function configuration found for api/index.ts');
      }

      // Check builds configuration
      if (config.builds && config.builds.length > 0) {
        this.issues.push('⚠️  Legacy builds configuration detected');
        this.recommendations.push('Remove builds array - use functions configuration instead');
      }

      // Check rewrites
      if (config.rewrites) {
        const hasApiRewrite = config.rewrites.some(rule => 
          rule.source === '/api/(.*)'
        );
        if (hasApiRewrite) {
          this.verifications.push('✅ API rewrite rule configured');
        } else {
          this.issues.push('❌ Missing API rewrite rule');
        }
      }

    } catch (error) {
      this.issues.push(`❌ Error parsing vercel.json: ${error.message}`);
    }
  }

  /**
   * Verify API structure
   */
  verifyApiStructure() {
    console.log('🔍 Verifying API Structure...\n');
    
    const apiIndexPath = join(PROJECT_ROOT, 'api/index.ts');
    if (!existsSync(apiIndexPath)) {
      this.issues.push('❌ api/index.ts not found');
      return;
    }

    try {
      const content = readFileSync(apiIndexPath, 'utf8');
      
      // Check for Hono imports
      if (content.includes('from "hono') || content.includes('from \'hono') || content.includes('hono/vercel')) {
        this.verifications.push('✅ Hono framework imported');
      } else {
        this.issues.push('❌ Hono framework not imported');
      }

      // Check for Vercel adapter
      if (content.includes('@hono/node-server') || content.includes('handle')) {
        this.verifications.push('✅ Vercel adapter configured');
      } else {
        this.issues.push('❌ Vercel adapter not found');
      }

      // Check export
      if (content.includes('export default')) {
        this.verifications.push('✅ Default export present');
      } else {
        this.issues.push('❌ Missing default export');
      }

    } catch (error) {
      this.issues.push(`❌ Error reading api/index.ts: ${error.message}`);
    }
  }

  /**
   * Verify package.json configuration
   */
  verifyPackageConfig() {
    console.log('🔍 Verifying Package Configuration...\n');
    
    const packagePath = join(PROJECT_ROOT, 'package.json');
    if (!existsSync(packagePath)) {
      this.issues.push('❌ package.json not found');
      return;
    }

    try {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
      
      // Check Node.js version
      if (pkg.engines && pkg.engines.node) {
        this.verifications.push(`✅ Node.js version specified: ${pkg.engines.node}`);
      } else {
        this.recommendations.push('Consider specifying Node.js version in engines field');
      }

      // Check build scripts
      if (pkg.scripts && pkg.scripts.build) {
        this.verifications.push('✅ Build script configured');
      } else {
        this.issues.push('❌ No build script found');
      }

      // Check dependencies
      const hasDependencies = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
      if (hasDependencies) {
        this.verifications.push(`✅ Dependencies configured (${Object.keys(pkg.dependencies).length} packages)`);
      }

    } catch (error) {
      this.issues.push(`❌ Error parsing package.json: ${error.message}`);
    }
  }

  /**
   * Generate deployment checklist
   */
  generateDeploymentChecklist() {
    return `
## 📋 Manual Deployment Verification Checklist

### Vercel Dashboard Checks:

#### 1. Framework Configuration
- [ ] Navigate to Project Settings > General
- [ ] Verify "Framework Preset" is set to "Other" (NOT Next.js)
- [ ] If showing Next.js, change to "Other" and redeploy

#### 2. Functions Tab Verification
- [ ] Navigate to Functions tab in Vercel dashboard
- [ ] Verify \`api/index.ts\` is listed as an active function
- [ ] Check function runtime shows nodejs20.x
- [ ] Check memory allocation shows 1024MB
- [ ] Review function logs for initialization errors

#### 3. Deployment Logs
- [ ] Go to Deployments tab
- [ ] Click on latest deployment
- [ ] Review build logs for:
  - [ ] No Next.js framework detection
  - [ ] Successful function creation
  - [ ] No cached file conflicts
- [ ] Check function logs for:
  - [ ] Successful Hono app initialization
  - [ ] No import/module errors

#### 4. Live Testing
- [ ] Test API endpoints directly:
  - [ ] \`https://yourapp.vercel.app/api/health\`
  - [ ] \`https://yourapp.vercel.app/api/auth/callback\`
  - [ ] \`https://yourapp.vercel.app/api/trpc/\`
- [ ] Verify responses are from Hono (not static files)
- [ ] Check response headers include Hono signatures

#### 5. Cache Clearing (if needed)
- [ ] In Vercel dashboard, go to Settings > Data Cache
- [ ] Clear all cached data
- [ ] Trigger new deployment from scratch
- [ ] Monitor for proper function detection

### Environment Variables
- [ ] Navigate to Settings > Environment Variables
- [ ] Verify all required variables are set:
  - [ ] SUPABASE_URL, SUPABASE_ANON_KEY
  - [ ] DATABASE_URL, DIRECT_URL
  - [ ] JWT_SECRET, ENCRYPTION_KEY
  - [ ] VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

### Alternative Deployment (if issues persist)
- [ ] Create new Vercel project: \`vercel --name neonpro-v2\`
- [ ] Connect to same GitHub repository
- [ ] Copy environment variables
- [ ] Deploy and test functionality
- [ ] Update DNS if successful
`;
  }

  /**
   * Generate verification report
   */
  generateReport() {
    let report = `
# 🚀 Deployment Configuration Verification Report

Generated: ${new Date().toISOString()}

## ✅ Verifications Passed

${this.verifications.map(v => v).join('\n')}

## ❌ Issues Found

${this.issues.length > 0 ? this.issues.map(i => i).join('\n') : 'No critical issues found!'}

## 💡 Recommendations

${this.recommendations.length > 0 ? this.recommendations.map(r => r).join('\n') : 'Configuration looks good!'}

${this.generateDeploymentChecklist()}

## 🔧 Quick Fixes

### If Function Not Detected:
\`\`\`bash
# Clear Vercel cache and redeploy
vercel --prod --force

# Or deploy to fresh project
vercel --name neonpro-v2
\`\`\`

### If Framework Conflicts:
1. Remove any framework specification from vercel.json
2. Clear Vercel cache in dashboard
3. Set framework to "Other" in dashboard
4. Redeploy from scratch

### Environment Variables Script:
\`\`\`bash
# Copy .env.example to .env and configure
cp .env.example .env
# Then manually add variables to Vercel dashboard
\`\`\`

---
Report generated by deployment-config-verifier
`;

    return report;
  }

  /**
   * Run all verifications
   */
  async run() {
    console.log('🚀 Starting Deployment Configuration Verification\n');
    console.log('================================================\n');

    this.verifyVercelConfig();
    this.verifyApiStructure();
    this.verifyPackageConfig();

    const report = this.generateReport();
    
    console.log(report);

    // Summary
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('========================');
    console.log(`✅ Verifications Passed: ${this.verifications.length}`);
    console.log(`❌ Issues Found: ${this.issues.length}`);
    console.log(`💡 Recommendations: ${this.recommendations.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 Configuration is ready for deployment!');
      console.log('   Follow the manual checklist for Vercel dashboard verification.');
    } else {
      console.log('\n⚠️  Please address the issues before deployment.');
    }

    return {
      verifications: this.verifications.length,
      issues: this.issues.length,
      recommendations: this.recommendations.length,
      report
    };
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new DeploymentConfigVerifier();
  try {
    await verifier.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

export default DeploymentConfigVerifier;