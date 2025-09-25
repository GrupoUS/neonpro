#!/usr/bin/env node

/**
 * 🏥 NeonPro Production Environment Validation Script
 * Validates all required environment variables and configurations for production deployment
 * 
 * 🔒 Healthcare Compliance: LGPD, ANVISA, CFM
 * 🛡️ Security Hardening: Environment validation and secret management
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation configuration
const VALIDATION_CONFIG = {
  // Required environment variables
  required: {
    // Application Configuration
    'NEXT_PUBLIC_APP_ENV': { required: true, pattern: /^production$/ },
    'NEXT_PUBLIC_APP_VERSION': { required: true },
    'NEXT_PUBLIC_API_URL': { required: true, pattern: /^https:\/\// },
    
    // Supabase Configuration
    'NEXT_PUBLIC_SUPABASE_URL': { required: true, pattern: /^https:\/\// },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': { required: true, minLength: 32 },
    'SUPABASE_SERVICE_ROLE_KEY': { required: true, minLength: 32 },
    'SUPABASE_JWT_SECRET': { required: true, minLength: 32 },
    
    // Database Configuration
    'DATABASE_URL': { required: true, pattern: /^postgresql:\/\// },
    'DATABASE_DIRECT_URL': { required: true, pattern: /^postgresql:\/\// },
    
    // AI Configuration
    'OPENAI_API_KEY': { required: true, pattern: /^sk-/ },
    'ANTHROPIC_API_KEY': { required: true, pattern: /^sk-ant-/ },
    
    // Security Configuration
    'JWT_SECRET': { required: true, minLength: 32 },
    'SESSION_SECRET': { required: true, minLength: 32 },
    'ENCRYPTION_KEY': { required: true, minLength: 32 },
    
    // Monitoring
    'SENTRY_DSN': { required: true, pattern: /^https:\/\// },
    
    // External Services
    'STRIPE_SECRET_KEY': { required: true, pattern: /^sk_/ },
    'RESEND_API_KEY': { required: true },
    
    // Storage
    'AWS_ACCESS_KEY_ID': { required: true },
    'AWS_SECRET_ACCESS_KEY': { required: true },
    'AWS_S3_BUCKET': { required: true },
    
    // Compliance
    'NEXT_PUBLIC_COMPANY_NAME': { required: true },
    'NEXT_PUBLIC_COMPANY_CNPJ': { required: true, pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/ },
    'LGPD_DPO_EMAIL': { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  },
  
  // Optional but recommended environment variables
  recommended: {
    'REDIS_URL': { required: false },
    'TWILIO_ACCOUNT_SID': { required: false },
    'GOOGLE_AI_API_KEY': { required: false },
    'AI_DEFAULT_MODEL': { required: false, defaultValue: 'gpt-4o-mini' },
    'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID': { required: false },
  },
  
  // Security checks
  security: {
    // Default values to check for
    dangerousDefaults: [
      'your_',
      'secret_here',
      'key_here',
      'password',
      'changeme',
      'default',
      'test_',
      'demo_',
      'development',
      'localhost',
      '127.0.0.1'
    ],
    
    // Minimum secret lengths
    minimumSecretLengths: {
      'JWT_SECRET': 32,
      'SESSION_SECRET': 32,
      'ENCRYPTION_KEY': 32,
      'SUPABASE_JWT_SECRET': 32,
      'DATABASE_URL': 20,
      'SUPABASE_SERVICE_ROLE_KEY': 32
    },
    
    // URL patterns
    allowedOrigins: [
      'https://neonpro.healthcare',
      'https://www.neonpro.healthcare',
      'https://app.neonpro.healthcare'
    ]
  }
};

// Validation functions
class EnvironmentValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  validateValue(key, value, config) {
    const checks = [];
    
    // Check if required and present
    if (config.required && !value) {
      this.issues.push(`Missing required environment variable: ${key}`);
      return false;
    }
    
    // Skip further checks if value is not provided and not required
    if (!value) {
      return true;
    }
    
    // Check minimum length
    if (config.minLength && value.length < config.minLength) {
      this.issues.push(`${key} is too short (min ${config.minLength} chars)`);
      checks.push(false);
    }
    
    // Check pattern
    if (config.pattern && !config.pattern.test(value)) {
      this.issues.push(`${key} format is invalid`);
      checks.push(false);
    }
    
    // Check for dangerous default values
    for (const dangerous of VALIDATION_CONFIG.security.dangerousDefaults) {
      if (value.toLowerCase().includes(dangerous)) {
        this.issues.push(`${key} appears to be using a default/test value: ${value}`);
        checks.push(false);
        break;
      }
    }
    
    // Check minimum secret lengths
    if (VALIDATION_CONFIG.security.minimumSecretLengths[key]) {
      const minLength = VALIDATION_CONFIG.security.minimumSecretLengths[key];
      if (value.length < minLength) {
        this.issues.push(`${key} is too short for production (min ${minLength} chars)`);
        checks.push(false);
      }
    }
    
    const passed = checks.length === 0 || !checks.some(check => !check);
    if (passed) {
      this.passed++;
    }
    
    return passed;
  }

  validateEnvironment() {
    this.log('🚀 Starting NeonPro Production Environment Validation');
    this.log('=' * 60);
    
    // Load environment variables
    const envPath = path.join(__dirname, '../../.env.production');
    let envVars = {};
    
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envVars = this.parseEnvFile(envContent);
        this.log(`✅ Loaded ${Object.keys(envVars).length} variables from .env.production`);
      } else {
        this.issues.push('Production environment file not found: .env.production');
      }
    } catch (error) {
      this.issues.push(`Failed to load environment file: ${error.message}`);
    }
    
    // Check required variables
    this.log('\n📋 Validating Required Variables:');
    this.log('-' * 40);
    
    for (const [key, config] of Object.entries(VALIDATION_CONFIG.required)) {
      const value = envVars[key] || process.env[key];
      this.log(`  ${key}: ${value ? '✅' : '❌'}`);
      this.validateValue(key, value, config);
    }
    
    // Check recommended variables
    this.log('\n💡 Validating Recommended Variables:');
    this.log('-' * 40);
    
    for (const [key, config] of Object.entries(VALIDATION_CONFIG.recommended)) {
      const value = envVars[key] || process.env[key] || config.defaultValue;
      if (!value && config.required === false) {
        this.warnings.push(`Recommended variable not set: ${key}`);
        this.log(`  ${key}: ⚠️ (not set)`);
      } else {
        this.log(`  ${key}: ${value ? '✅' : '⚠️'}`);
      }
    }
    
    // Security checks
    this.log('\n🔒 Performing Security Checks:');
    this.log('-' * 40);
    
    this.performSecurityChecks(envVars);
    
    // Database connectivity check
    this.log('\n🗄️ Testing Database Connectivity:');
    this.log('-' * 40);
    this.testDatabaseConnectivity(envVars);
    
    // External service checks
    this.log('\n🌐 Testing External Services:');
    this.log('-' * 40);
    this.testExternalServices(envVars);
    
    // Generate report
    this.generateReport();
    
    // Return validation result
    return {
      passed: this.issues.length === 0,
      issues: this.issues,
      warnings: this.warnings,
      passedChecks: this.passed,
      totalChecks: Object.keys(VALIDATION_CONFIG.required).length
    };
  }

  parseEnvFile(content) {
    const envVars = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
    
    return envVars;
  }

  performSecurityChecks(envVars) {
    // Check CORS configuration
    const allowedOrigins = envVars.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || [];
    const hasInvalidOrigins = allowedOrigins.some(origin => {
      return !VALIDATION_CONFIG.security.allowedOrigins.includes(origin.trim());
    });
    
    if (hasInvalidOrigins) {
      this.issues.push('Invalid CORS origins detected in production configuration');
    } else {
      this.log('  CORS Configuration: ✅');
    }
    
    // Check if debug mode is disabled
    if (envVars.DEBUG_MODE === 'true') {
      this.issues.push('DEBUG_MODE is enabled in production - this is a security risk');
    } else {
      this.log('  Debug Mode: ✅ (disabled)');
    }
    
    // Check HTTPS enforcement
    if (envVars.NEXT_PUBLIC_API_URL && !envVars.NEXT_PUBLIC_API_URL.startsWith('https://')) {
      this.issues.push('API URL must use HTTPS in production');
    } else {
      this.log('  HTTPS Enforcement: ✅');
    }
    
    // Check for plaintext secrets
    const secretKeys = Object.keys(envVars).filter(key => 
      key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')
    );
    
    for (const key of secretKeys) {
      const value = envVars[key];
      if (value && value.length < 16) {
        this.issues.push(`${key} appears to be too short for production use`);
      }
    }
  }

  testDatabaseConnectivity(envVars) {
    if (!envVars.DATABASE_URL) {
      this.issues.push('Database URL not configured');
      return;
    }
    
    try {
      // This would typically use a database client to test connectivity
      // For now, we'll validate the URL format
      const url = new URL(envVars.DATABASE_URL);
      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        this.issues.push('Database must use PostgreSQL protocol');
      } else {
        this.log('  Database URL Format: ✅');
      }
    } catch (error) {
      this.issues.push(`Invalid database URL format: ${error.message}`);
    }
  }

  testExternalServices(envVars) {
    // Test Supabase connectivity
    if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const url = new URL(envVars.NEXT_PUBLIC_SUPABASE_URL);
        this.log('  Supabase URL Format: ✅');
      } catch (error) {
        this.issues.push(`Invalid Supabase URL: ${error.message}`);
      }
    }
    
    // Test AI service keys format
    const aiKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
    for (const key of aiKeys) {
      if (envVars[key]) {
        if (key === 'OPENAI_API_KEY' && !envVars[key].startsWith('sk-')) {
          this.issues.push(`${key} format appears invalid`);
        } else if (key === 'ANTHROPIC_API_KEY' && !envVars[key].startsWith('sk-ant-')) {
          this.issues.push(`${key} format appears invalid`);
        } else {
          this.log(`  ${key}: ✅`);
        }
      }
    }
  }

  generateReport() {
    this.log('\n' + '=' * 60);
    this.log('📊 VALIDATION REPORT');
    this.log('=' * 60);
    
    if (this.issues.length === 0) {
      this.log('🎉 All critical checks passed!');
      this.log(`✅ ${this.passed} validation checks passed`);
    } else {
      this.log(`❌ ${this.issues.length} critical issues found`);
      this.log(`⚠️ ${this.warnings.length} warnings to review`);
      
      this.log('\n🚨 CRITICAL ISSUES:');
      this.issues.forEach((issue, index) => {
        this.log(`   ${index + 1}. ${issue}`);
      });
      
      if (this.warnings.length > 0) {
        this.log('\n⚠️ WARNINGS:');
        this.warnings.forEach((warning, index) => {
          this.log(`   ${index + 1}. ${warning}`);
        });
      }
    }
    
    this.log('\n📋 RECOMMENDATIONS:');
    this.log('1. Store all secrets in Vercel Environment Variables');
    this.log('2. Enable SSL/TLS for all services');
    this.log('3. Set up monitoring and alerting');
    this.log('4. Implement backup and disaster recovery');
    this.log('5. Perform regular security audits');
    this.log('6. Test disaster recovery procedures');
    
    const success = this.issues.length === 0;
    this.log(`\n${success ? '✅' : '❌'} Environment validation ${success ? 'PASSED' : 'FAILED'}`);
    
    if (!success) {
      process.exit(1);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EnvironmentValidator();
  const result = validator.validateEnvironment();
  
  process.exit(result.passed ? 0 : 1);
}

export default EnvironmentValidator;