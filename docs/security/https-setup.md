# HTTPS Configuration Guide

## Overview

This guide provides comprehensive instructions for setting up and maintaining HTTPS/TLS 1.3+ security for the NeonPro AI Agent integration. Following this guide ensures compliance with healthcare security standards and optimal performance.

## Requirements

- **TLS Version**: 1.3+ (minimum 1.2)
- **Certificate**: Valid SSL/TLS certificate from trusted CA
- **HSTS**: Enabled with max-age ≥31536000
- **Performance**: HTTPS handshake ≤300ms
- **Security**: Perfect Forward Secrecy required

## Configuration Files

### 1. Environment Variables

Create `.env.production` with HTTPS configuration:

```bash
# HTTPS Configuration
HTTPS_ENABLED=true
TLS_VERSION=1.3
SSL_CERT_PATH=/etc/ssl/certs/neonpro.crt
SSL_KEY_PATH=/etc/ssl/private/neonpro.key

# HSTS Configuration
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Security Headers
CSP_ENABLED=true
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;"
FRAME_OPTIONS=DENY
XSS_PROTECTION=1; mode=block
CONTENT_TYPE_OPTIONS=nosniff
REFERRER_POLICY=strict-origin-when-cross-origin
```

### 2. TLS Configuration

Create `config/tls-config.js`:

```javascript
/**
 * TLS 1.3 Configuration for Healthcare Compliance
 * 
 * This configuration ensures:
 * - Perfect Forward Secrecy
 * - Modern cipher suites
 * - Healthcare compliance (ANVISA/LGPD)
 * - Performance optimization
 */

const tlsConfig = {
  // TLS 1.3 only (with 1.2 fallback)
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  
  // Perfect Forward Secrecy cipher suites
  ciphers: [
    // TLS 1.3 cipher suites
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    
    // TLS 1.2 cipher suites (ECDHE required for PFS)
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    
    // Legacy support (remove if not needed)
    'ECDHE-ECDSA-AES256-SHA384',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-ECDSA-AES128-SHA256',
    'ECDHE-RSA-AES128-SHA256',
  ].join(':'),
  
  // Honor cipher order
  honorCipherOrder: true,
  
  // ECDH curve preference
  ecdhCurve: 'auto',
  
  // DH parameters
  dhparam: undefined, // Use auto-generated
  
  // Session resumption
  sessionTimeout: 300, // 5 minutes
  
  // Session tickets
  sessionTickets: {
    keys: [
      // 48-byte keys for session ticket encryption
      Buffer.from('your-48-byte-key-1-here', 'hex'),
      Buffer.from('your-48-byte-key-2-here', 'hex'),
    ],
    ticketLifetime: 86400, // 24 hours
  },
  
  // OCSP stapling
  requestOCSP: true,
  
  // Certificate chain
  cert: process.env.SSL_CERT_PATH,
  key: process.env.SSL_KEY_PATH,
  
  // CA bundle for certificate verification
  ca: process.env.SSL_CA_PATH,
};

// Security validation
function validateTLSConfig(config) {
  const required = ['cert', 'key'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required TLS configuration: ${missing.join(', ')}`);
  }
  
  // Validate cipher suites for PFS
  const pfsCiphers = config.ciphers.split(':').filter(cipher => 
    cipher.includes('ECDHE') || cipher.includes('TLS_')
  );
  
  if (pfsCiphers.length === 0) {
    throw new Error('No Perfect Forward Secrecy cipher suites configured');
  }
  
  return config;
}

module.exports = validateTLSConfig(tlsConfig);
```

### 3. Security Headers Middleware

Create `middleware/security-headers.js`:

```javascript
/**
 * Security Headers for Healthcare Compliance
 * 
 * Implements OWASP recommended headers and
 * healthcare-specific security requirements
 */

function createSecurityHeaders() {
  return {
    // Strict Transport Security
    'Strict-Transport-Security': process.env.HSTS_ENABLED === 'true' 
      ? `max-age=${process.env.HSTS_MAX_AGE || 31536000}; includeSubDomains; preload`
      : undefined,
    
    // Content Security Policy
    'Content-Security-Policy': process.env.CSP_ENABLED === 'true'
      ? process.env.CSP_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;"
      : undefined,
    
    // Frame Options
    'X-Frame-Options': process.env.FRAME_OPTIONS || 'DENY',
    
    // XSS Protection
    'X-XSS-Protection': process.env.XSS_PROTECTION || '1; mode=block',
    
    // Content Type Options
    'X-Content-Type-Options': process.env.CONTENT_TYPE_OPTIONS || 'nosniff',
    
    // Referrer Policy
    'Referrer-Policy': process.env.REFERRER_POLICY || 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // Remove server information
    'Server': undefined,
  };
}

// Middleware function for Express/Hono
function securityHeadersMiddleware() {
  return async (c, next) => {
    const headers = createSecurityHeaders();
    
    // Apply security headers
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        c.header(key, value);
      }
    });
    
    await next();
  };
}

module.exports = {
  createSecurityHeaders,
  securityHeadersMiddleware,
};
```

### 4. Server Configuration

Create `server/https-server.js`:

```javascript
const https = require('https');
const { Hono } = require('hono');
const { handle } = require('hono/vercel');
const tlsConfig = require('../config/tls-config');
const { securityHeadersMiddleware } = require('../middleware/security-headers');

// Create Hono app
const app = new Hono();

// Apply security headers
app.use('*', securityHeadersMiddleware());

// HTTPS redirect middleware
app.use('*', async (c, next) => {
  if (c.req.header('x-forwarded-proto') !== 'https') {
    return c.redirect(`https://${c.req.header('host')}${c.req.url}`, 301);
  }
  await next();
});

// Your routes here
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    tls_version: 'TLS 1.3',
    security_headers: 'enabled'
  });
});

// Create HTTPS server
const server = https.createServer(tlsConfig, handle(app));

// Start server
const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
  console.log(`TLS Version: ${tlsConfig.minVersion} - ${tlsConfig.maxVersion}`);
  console.log(`Perfect Forward Secrecy: Enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
```

### 5. Certificate Management Script

Create `scripts/ssl-manager.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * SSL Certificate Management
 * 
 * Handles certificate renewal, validation, and monitoring
 */

class SSLManager {
  constructor() {
    this.certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs/neonpro.crt';
    this.keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private/neonpro.key';
    this.caPath = process.env.SSL_CA_PATH || '/etc/ssl/certs/ca-bundle.crt';
    
    // Monitoring settings
    this.renewalThreshold = 30; // days before expiry
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Check certificate expiry
   */
  checkCertificateExpiry() {
    try {
      const cert = fs.readFileSync(this.certPath);
      const certInfo = new crypto.X509Certificate(cert);
      
      const expiryDate = new Date(certInfo.validTo);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      console.log(`Certificate expires in ${daysUntilExpiry} days`);
      
      if (daysUntilExpiry <= this.renewalThreshold) {
        this.renewCertificate();
      }
      
      return {
        valid: true,
        expiryDate,
        daysUntilExpiry,
        issuer: certInfo.issuer,
        subject: certInfo.subject,
      };
    } catch (error) {
      console.error('Certificate check failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Renew certificate using Let's Encrypt or your CA
   */
  async renewCertificate() {
    try {
      console.log('Starting certificate renewal...');
      
      // Example using Certbot (Let's Encrypt)
      const domain = process.env.DOMAIN || 'api.neonpro.com.br';
      const email = process.env.SSL_EMAIL || 'admin@neonpro.com.br';
      
      execSync(`certbot certonly --nginx --non-interactive --agree-tos --email ${email} -d ${domain}`, {
        stdio: 'inherit',
      });
      
      console.log('Certificate renewed successfully');
      
      // Reload server with new certificate
      this.reloadServer();
      
      return { success: true, message: 'Certificate renewed successfully' };
    } catch (error) {
      console.error('Certificate renewal failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test HTTPS configuration
   */
  async testHTTPSConfiguration() {
    const options = {
      hostname: process.env.DOMAIN || 'localhost',
      port: 443,
      path: '/health',
      method: 'GET',
      rejectUnauthorized: true,
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        const handshakeTime = res.socket.getPeerCertificate ? 
          res.socket.getPeerCertificate().raw : 'N/A';
        
        const tlsVersion = res.socket.getProtocol ? 
          res.socket.getProtocol() : 'N/A';
        
        const startTime = Date.now();
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: true,
            statusCode: res.statusCode,
            tlsVersion,
            handshakeTime: Date.now() - startTime,
            headers: res.headers,
            response: JSON.parse(data),
          });
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      req.end();
    });
  }

  /**
   * Monitor certificate status
   */
  startMonitoring() {
    console.log('Starting SSL certificate monitoring...');
    
    // Check immediately
    this.checkCertificateExpiry();
    
    // Check periodically
    setInterval(() => {
      this.checkCertificateExpiry();
    }, this.checkInterval);
  }

  /**
   * Reload server with new certificate
   */
  reloadServer() {
    // Implement server reload logic
    // This depends on your deployment setup
    console.log('Reloading server with new certificate...');
    
    // Example: send SIGHUP to process
    if (process.send) {
      process.send('reload');
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const manager = new SSLManager();

  switch (command) {
    case 'check':
      const result = manager.checkCertificateExpiry();
      console.log('Certificate status:', result);
      break;
      
    case 'renew':
      manager.renewCertificate()
        .then(result => console.log('Renewal result:', result))
        .catch(error => console.error('Renewal failed:', error));
      break;
      
    case 'test':
      manager.testHTTPSConfiguration()
        .then(result => console.log('HTTPS test result:', result))
        .catch(error => console.error('HTTPS test failed:', error));
      break;
      
    case 'monitor':
      manager.startMonitoring();
      break;
      
    default:
      console.log('Usage: node ssl-manager.js [check|renew|test|monitor]');
  }
}

module.exports = SSLManager;
```

### 6. Docker Configuration

Create `docker/https/Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install SSL/TLS dependencies
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    certbot \
    nginx

# Create SSL directories
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy SSL configuration
COPY config/tls-config.js /app/config/tls-config.js
COPY middleware/security-headers.js /app/middleware/security-headers.js

# Set permissions
RUN chmod 600 /etc/ssl/private/neonpro.key
RUN chmod 644 /etc/ssl/certs/neonpro.crt

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f https://localhost/health || exit 1

# Expose HTTPS port
EXPOSE 443

# Start server
CMD ["node", "server/https-server.js"]
```

### 7. Nginx Configuration (Optional)

Create `config/nginx.conf`:

```nginx
server {
    listen 80;
    server_name api.neonpro.com.br;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.neonpro.com.br;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/neonpro.crt;
    ssl_certificate_key /etc/ssl/private/neonpro.key;
    ssl_trusted_certificate /etc/ssl/certs/ca-bundle.crt;
    
    # TLS 1.3 configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    # Perfect Forward Secrecy
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    
    # Performance optimizations
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets on;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_stapling_file /etc/ssl/certs/ocsp.resp;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

## Deployment

### 1. Generate SSL Certificate

```bash
# Using Let's Encrypt (recommended)
sudo certbot --nginx --non-interactive --agree-tos --email admin@neonpro.com.br -d api.neonpro.com.br

# Or use your own certificate
# Copy your certificate and key to the specified paths
sudo cp your-certificate.crt /etc/ssl/certs/neonpro.crt
sudo cp your-private.key /etc/ssl/private/neonpro.key
sudo cp ca-bundle.crt /etc/ssl/certs/ca-bundle.crt
```

### 2. Set Permissions

```bash
sudo chmod 600 /etc/ssl/private/neonpro.key
sudo chmod 644 /etc/ssl/certs/neonpro.crt
sudo chmod 644 /etc/ssl/certs/ca-bundle.crt
```

### 3. Generate DH Parameters

```bash
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 4096
```

### 4. Test Configuration

```bash
# Test SSL certificate
node scripts/ssl-manager.js test

# Test HTTPS handshake
curl -I https://api.neonpro.com.br/health

# Test SSL configuration
npx ssl-checker api.neonpro.com.br
```

### 5. Start Monitoring

```bash
# Start SSL certificate monitoring
node scripts/ssl-manager.js monitor
```

## Monitoring and Maintenance

### 1. Certificate Monitoring

- Set up automated renewal
- Monitor expiry dates
- Alert on certificate issues
- Test connectivity regularly

### 2. Performance Monitoring

- Monitor HTTPS handshake times
- Track TLS version usage
- Monitor cipher suite distribution
- Alert on performance degradation

### 3. Security Monitoring

- Monitor SSL/TLS vulnerabilities
- Track security header compliance
- Audit certificate transparency
- Monitor for misconfigurations

### 4. Log Monitoring

```bash
# SSL/TLS handshake errors
sudo journalctl -u nginx | grep 'SSL handshake error'

# Certificate expiry warnings
sudo journalctl -u certbot | grep 'expiry'

# Security header validation
curl -I https://api.neonpro.com.br/health | grep -E '(Strict-Transport-Security|Content-Security-Policy|X-Frame-Options)'
```

## Troubleshooting

### 1. Certificate Issues

```bash
# Check certificate details
openssl x509 -in /etc/ssl/certs/neonpro.crt -text -noout

# Verify certificate chain
openssl verify -CAfile /etc/ssl/certs/ca-bundle.crt /etc/ssl/certs/neonpro.crt

# Test private key matches certificate
openssl x509 -noout -modulus -in /etc/ssl/certs/neonpro.crt | openssl md5
openssl rsa -noout -modulus -in /etc/ssl/private/neonpro.key | openssl md5
```

### 2. TLS Configuration Issues

```bash
# Test TLS configuration
npx cipherscan api.neonpro.com.br

# Check supported protocols
openssl s_client -connect api.neonpro.com.br:443 -tls1_3
openssl s_client -connect api.neonpro.com.br:443 -tls1_2
```

### 3. Performance Issues

```bash
# Test handshake time
curl -w "@curl-format.txt" -o /dev/null -s https://api.neonpro.com.br/health

# Monitor TLS session resumption
openssl s_client -connect api.neonpro.com.br:443 -reconnect
```

## Compliance Validation

### 1. Healthcare Compliance

Validate your configuration meets healthcare standards:

```bash
# Run security scan
npx nmap --script ssl-enum-ciphers -p 443 api.neonpro.com.br

# Check SSL Labs rating
curl -s https://api.ssllabs.com/api/v3/analyze?host=api.neonpro.com.br

# Validate security headers
npx securityheaders-cli api.neonpro.com.br
```

### 2. Performance Validation

```bash
# Test response times
npm run test:https-performance

# Validate handshake performance
npm run test:handshake-performance
```

## Support

For additional support:

- **SSL/TLS Issues**: Contact your certificate authority
- **Configuration Issues**: Review OWASP TLS guidelines
- **Compliance Issues**: Consult ANVISA and CFM guidelines
- **Performance Issues**: Monitor CDN and caching configurations

---

**Last Updated**: September 21, 2025