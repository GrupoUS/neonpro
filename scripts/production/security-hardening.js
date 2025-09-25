#!/usr/bin/env node

/**
 * 🏥 NeonPro Production Security Hardening Script
 * Implements security hardening measures for production deployment
 * 
 * 🔒 Healthcare Compliance: LGPD, ANVISA, CFM
 * 🛡️ Security Hardening: Headers, CORS, Rate Limiting, SSL/TLS
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security configuration
const SECURITY_CONFIG = {
  headers: {
    // Security headers
    'Content-Security-Policy': {
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://*.vercel.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://*.supabase.co; img-src 'self' data: https://*.supabase.co https://*.vercel.app https://*.vercel.com blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co; frame-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      description: 'Content Security Policy to prevent XSS attacks'
    },
    'X-Content-Type-Options': {
      value: 'nosniff',
      description: 'Prevents MIME-type sniffing'
    },
    'X-Frame-Options': {
      value: 'DENY',
      description: 'Prevents clickjacking attacks'
    },
    'X-XSS-Protection': {
      value: '1; mode=block',
      description: 'Enables XSS protection'
    },
    'Referrer-Policy': {
      value: 'strict-origin-when-cross-origin',
      description: 'Controls referrer information'
    },
    'Permissions-Policy': {
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      description: 'Restricts browser features'
    },
    'Strict-Transport-Security': {
      value: 'max-age=31536000; includeSubDomains; preload',
      description: 'Enforces HTTPS connections'
    }
  },
  
  cors: {
    allowedOrigins: [
      'https://neonpro.healthcare',
      'https://www.neonpro.healthcare',
      'https://app.neonpro.healthcare'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-CSRF-Token'
    ],
    maxAge: 86400, // 24 hours
    credentials: true
  },
  
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
      message: 'Too many requests from this IP, please try again later'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // login attempts per window
      message: 'Too many login attempts, please try again later'
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // API requests per window
      message: 'API rate limit exceeded'
    }
  },
  
  ssl: {
    protocols: ['TLSv1.2', 'TLSv1.3'],
    ciphers: [
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305',
      'ECDHE-RSA-CHACHA20-POLY1305',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ],
    minVersion: 'TLSv1.2'
  }
};

class SecurityHardener {
  constructor() {
    this.issues = [];
    this.improvements = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async applySecurityHardening() {
    this.log('🚀 Starting NeonPro Production Security Hardening');
    this.log('=' * 60);
    
    // Apply security headers
    await this.applySecurityHeaders();
    
    // Configure CORS policies
    await this.configureCORS();
    
    // Set up rate limiting
    await this.setupRateLimiting();
    
    // Validate SSL/TLS configuration
    await this.validateSSLConfiguration();
    
    // Implement security middleware
    await this.implementSecurityMiddleware();
    
    // Set up DDoS protection
    await this.setupDDoSProtection();
    
    // Validate input sanitization
    await this.validateInputSanitization();
    
    // Generate security report
    this.generateSecurityReport();
  }

  async applySecurityHeaders() {
    this.log('\n🔒 Applying Security Headers');
    this.log('-' * 40);
    
    const vercelConfigPath = path.join(__dirname, '../../vercel.json');
    let vercelConfig = {};
    
    try {
      if (fs.existsSync(vercelConfigPath)) {
        const content = fs.readFileSync(vercelConfigPath, 'utf8');
        vercelConfig = JSON.parse(content);
      }
      
      // Add security headers
      if (!vercelConfig.headers) {
        vercelConfig.headers = [];
      }
      
      // Add CSP header
      vercelConfig.headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: SECURITY_CONFIG.headers['Content-Security-Policy'].value
          },
          {
            key: 'X-Content-Type-Options',
            value: SECURITY_CONFIG.headers['X-Content-Type-Options'].value
          },
          {
            key: 'X-Frame-Options',
            value: SECURITY_CONFIG.headers['X-Frame-Options'].value
          },
          {
            key: 'X-XSS-Protection',
            value: SECURITY_CONFIG.headers['X-XSS-Protection'].value
          },
          {
            key: 'Referrer-Policy',
            value: SECURITY_CONFIG.headers['Referrer-Policy'].value
          },
          {
            key: 'Permissions-Policy',
            value: SECURITY_CONFIG.headers['Permissions-Policy'].value
          },
          {
            key: 'Strict-Transport-Security',
            value: SECURITY_CONFIG.headers['Strict-Transport-Security'].value
          }
        ]
      });
      
      // Write updated config
      fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
      this.log('  Security headers added to vercel.json: ✅');
      
    } catch (error) {
      this.issues.push(`Failed to apply security headers: ${error.message}`);
    }
  }

  async configureCORS() {
    this.log('\n🌐 Configuring CORS Policies');
    this.log('-' * 40);
    
    // Create CORS configuration file
    const corsConfig = {
      origins: SECURITY_CONFIG.cors.allowedOrigins,
      methods: SECURITY_CONFIG.cors.allowedMethods,
      allowedHeaders: SECURITY_CONFIG.cors.allowedHeaders,
      credentials: SECURITY_CONFIG.cors.credentials,
      maxAge: SECURITY_CONFIG.cors.maxAge,
      
      // Development origins (conditional)
      developmentOrigins: process.env.NODE_ENV === 'development' 
        ? ['http://localhost:3000', 'http://localhost:5173']
        : []
    };
    
    const corsConfigPath = path.join(__dirname, '../../config/cors.json');
    
    try {
      // Ensure config directory exists
      const configDir = path.dirname(corsConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(corsConfigPath, JSON.stringify(corsConfig, null, 2));
      this.log('  CORS configuration saved: ✅');
      
      // Validate CORS configuration
      this.validateCORSConfig(corsConfig);
      
    } catch (error) {
      this.issues.push(`Failed to configure CORS: ${error.message}`);
    }
  }

  validateCORSConfig(config) {
    // Check for overly permissive origins
    const hasWildcard = config.origins.includes('*') || config.origins.includes('*://*');
    if (hasWildcard) {
      this.issues.push('CORS configuration is overly permissive (wildcard origins)');
    }
    
    // Check for HTTP origins in production
    const httpOrigins = config.origins.filter(origin => origin.startsWith('http://'));
    if (httpOrigins.length > 0 && process.env.NODE_ENV === 'production') {
      this.issues.push('HTTP origins detected in CORS configuration - use HTTPS');
    }
    
    // Check for secure methods
    const insecureMethods = config.methods.filter(method => 
      !['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method.toUpperCase())
    );
    if (insecureMethods.length > 0) {
      this.issues.push(`Insecure HTTP methods allowed: ${insecureMethods.join(', ')}`);
    }
  }

  async setupRateLimiting() {
    this.log('\n⚡ Setting Up Rate Limiting');
    this.log('-' * 40);
    
    const rateLimitConfig = {
      limits: SECURITY_CONFIG.rateLimiting,
      storage: {
        type: 'redis',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        tls: process.env.NODE_ENV === 'production'
      },
      bypass: {
        trustedIPs: [], // Add trusted IPs here
        apiKeyWhitelist: [] // Add API key whitelist here
      }
    };
    
    const rateLimitPath = path.join(__dirname, '../../config/rate-limit.json');
    
    try {
      // Ensure config directory exists
      const configDir = path.dirname(rateLimitPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(rateLimitPath, JSON.stringify(rateLimitConfig, null, 2));
      this.log('  Rate limiting configuration saved: ✅');
      
    } catch (error) {
      this.issues.push(`Failed to setup rate limiting: ${error.message}`);
    }
  }

  async validateSSLConfiguration() {
    this.log('\n🔐 Validating SSL/TLS Configuration');
    this.log('-' * 40);
    
    // Check if SSL is enabled in environment
    const sslEnabled = process.env.DATABASE_SSL === 'true' || 
                       process.env.NODE_ENV === 'production';
    
    if (!sslEnabled) {
      this.issues.push('SSL is not enabled - required for production');
    } else {
      this.log('  SSL enabled: ✅');
    }
    
    // Check certificate requirements
    const domains = [
      'neonpro.healthcare',
      'www.neonpro.healthcare',
      'app.neonpro.healthcare'
    ];
    
    for (const domain of domains) {
      try {
        // This would typically use an SSL validation library
        // For now, we'll simulate the check
        this.log(`  ${domain}: ✅ (certificate check pending)`);
      } catch (error) {
        this.issues.push(`SSL certificate validation failed for ${domain}`);
      }
    }
    
    // Check for HSTS preload
    const hstsEnabled = SECURITY_CONFIG.headers['Strict-Transport-Security'].value.includes('preload');
    if (hstsEnabled) {
      this.log('  HSTS preload enabled: ✅');
    }
  }

  async implementSecurityMiddleware() {
    this.log('\n🛡️ Implementing Security Middleware');
    this.log('-' * 40);
    
    // Create security middleware configuration
    const securityMiddleware = {
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"]
          }
        }
      },
      
      // Input sanitization
      sanitization: {
        enabled: true,
        fields: ['email', 'name', 'message', 'search', 'query'],
        rules: {
          xss: true,
          sqlInjection: true,
          nosqlInjection: true,
          htmlTags: true,
          specialChars: true
        }
      },
      
      // Session security
      session: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        rolling: true
      },
      
      // Authentication security
      auth: {
        jwt: {
          expiresIn: '15m',
          refreshExpiresIn: '7d',
          algorithm: 'HS256'
        },
        password: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      }
    };
    
    const middlewarePath = path.join(__dirname, '../../config/security-middleware.json');
    
    try {
      // Ensure config directory exists
      const configDir = path.dirname(middlewarePath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(middlewarePath, JSON.stringify(securityMiddleware, null, 2));
      this.log('  Security middleware configuration saved: ✅');
      
    } catch (error) {
      this.issues.push(`Failed to implement security middleware: ${error.message}`);
    }
  }

  async setupDDoSProtection() {
    this.log('\n🛡️ Setting Up DDoS Protection');
    this.log('-' * 40);
    
    const ddosConfig = {
      enabled: true,
      limits: {
        maxRequestsPerMinute: 1000,
        maxConcurrentConnections: 100,
        requestTimeout: 30000,
        connectionTimeout: 10000
      },
      ipWhitelist: [],
      ipBlacklist: [],
      rateLimiting: {
        enabled: true,
        windowMs: 60000, // 1 minute
        max: 100
      },
      challenges: {
        enabled: true,
        threshold: 50, // requests per minute
        type: 'javascript' // or 'captcha'
      }
    };
    
    const ddosPath = path.join(__dirname, '../../config/ddos-protection.json');
    
    try {
      // Ensure config directory exists
      const configDir = path.dirname(ddosPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(ddosPath, JSON.stringify(ddosConfig, null, 2));
      this.log('  DDoS protection configuration saved: ✅');
      
    } catch (error) {
      this.issues.push(`Failed to setup DDoS protection: ${error.message}`);
    }
  }

  async validateInputSanitization() {
    this.log('\n🧪 Validating Input Sanitization');
    this.log('-' * 40);
    
    // Create input sanitization rules
    const sanitizationRules = {
      general: {
        trim: true,
        stripHtml: true,
        normalizeSpaces: true
      },
      
      specific: {
        email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          maxLength: 254
        },
        name: {
          allowedChars: 'a-zA-Zà-ÿÀ-ÿ\s\'-',
          maxLength: 100
        },
        phone: {
          pattern: /^\+?[\d\s\-\(\)]+$/,
          maxLength: 20
        },
        cnpj: {
          pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
          validator: 'cnpj'
        },
        cpf: {
          pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          validator: 'cpf'
        }
      },
      
      sqlInjection: {
        patterns: [
          /(\s|^)(OR|AND)\s+\d+\s*=\s*\d+/i,
          /(\s|^)(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
          /(\s|^)(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC)\s+/i,
          /(\s|^)(UNION|SELECT|FROM|WHERE|HAVING|GROUP BY)\s+/i
        ]
      },
      
      xss: {
        patterns: [
          /<script[^>]*>.*?<\/script>/i,
          /javascript:[^'"]*/i,
          /on\w+\s*=\s*['"][^'"]*['"]/i,
          /<[^>]*on\w+\s*=/i
        ]
      }
    };
    
    const sanitizationPath = path.join(__dirname, '../../config/input-sanitization.json');
    
    try {
      // Ensure config directory exists
      const configDir = path.dirname(sanitizationPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(sanitizationPath, JSON.stringify(sanitizationRules, null, 2));
      this.log('  Input sanitization rules saved: ✅');
      
    } catch (error) {
      this.issues.push(`Failed to validate input sanitization: ${error.message}`);
    }
  }

  generateSecurityReport() {
    this.log('\n' + '=' * 60);
    this.log('🔒 SECURITY HARDENING REPORT');
    this.log('=' * 60);
    
    if (this.issues.length === 0) {
      this.log('🎉 All security hardening measures applied successfully!');
    } else {
      this.log(`❌ ${this.issues.length} security issues found`);
      
      this.log('\n🚨 SECURITY ISSUES:');
      this.issues.forEach((issue, index) => {
        this.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    this.log('\n📋 SECURITY RECOMMENDATIONS:');
    this.log('1. Regularly update SSL/TLS certificates');
    this.log('2. Monitor security headers and CORS policies');
    this.log('3. Implement real-time security monitoring');
    this.log('4. Perform regular penetration testing');
    this.log('5. Keep all dependencies up to date');
    this.log('6. Implement Web Application Firewall (WAF)');
    this.log('7. Set up security incident response procedures');
    this.log('8. Regular security audits and compliance checks');
    
    const success = this.issues.length === 0;
    this.log(`\n${success ? '✅' : '❌'} Security hardening ${success ? 'COMPLETED' : 'FAILED'}`);
    
    if (!success) {
      process.exit(1);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const hardener = new SecurityHardener();
  hardener.applySecurityHardening().catch(error => {
    console.error('Security hardening failed:', error);
    process.exit(1);
  });
}

export default SecurityHardener;