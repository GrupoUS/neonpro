# HTTPS Configuration Guide for NeonPro Healthcare Platform

## Overview

This guide provides comprehensive instructions for configuring HTTPS with TLS 1.3 for the NeonPro healthcare platform, ensuring compliance with LGPD, ANVISA, and healthcare data protection requirements.

**Target Audience**: System Administrators, DevOps Engineers, Security Engineers  
**Compliance Standards**: LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework  
**Performance Requirements**: ≤300ms handshake time, 99.9% uptime  

## Prerequisites

- Domain name (e.g., `api.neonpro.com.br`)
- SSL/TLS certificate from trusted CA
- Root access to server
- Node.js 18+ environment
- NGINX or Apache web server (optional)

## Quick Start

### 1. Certificate Acquisition

#### Let's Encrypt (Recommended for Development)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.neonpro.com.br -d www.neonpro.com.br

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Commercial Certificate (Production)

```bash
# Generate CSR
openssl req -new -newkey rsa:4096 -nodes -keyout api.neonpro.com.br.key \
  -out api.neonpro.com.br.csr

# Submit CSR to your CA (DigiCert, GlobalSign, etc.)
# Download and place certificates in:
# /etc/ssl/certs/api.neonpro.com.br.crt      # Server certificate
# /etc/ssl/certs/api.neonpro.com.br.chain.crt # Certificate chain
# /etc/ssl/private/api.neonpro.com.br.key    # Private key
```

### 2. Node.js HTTPS Configuration

```javascript
// apps/api/src/config/https.ts
import https from 'https';
import fs from 'fs';
import path from 'path';

export interface HTTPSConfig {
  key: string;
  cert: string;
  ca?: string[];
  minVersion: string;
  ciphers: string[];
  honorCipherOrder: boolean;
  secureOptions: number;
}

export const createHTTPSConfig = (env: string): HTTPSConfig => {
  const isProduction = env === 'production';
  const certPath = isProduction ? '/etc/ssl/certs/' : './certs/';
  
  return {
    key: fs.readFileSync(path.join(certPath, 'api.neonpro.com.br.key')),
    cert: fs.readFileSync(path.join(certPath, 'api.neonpro.com.br.crt')),
    ca: isProduction ? [
      fs.readFileSync(path.join(certPath, 'api.neonpro.com.br.chain.crt'))
    ] : undefined,
    
    // TLS 1.3 Configuration
    minVersion: 'TLSv1.3',
    
    // Secure cipher suites (TLS 1.3)
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_CCM_8_SHA384',
      'TLS_AES_256_CCM_SHA384'
    ],
    
    honorCipherOrder: true,
    secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | 
                   crypto.constants.SSL_OP_NO_TLSv1 |
                   crypto.constants.SSL_OP_NO_TLSv1_1 |
                   crypto.constants.SSL_OP_NO_TLSv1_2
  };
};

// Create HTTPS server
export const createHTTPSServer = (app: any, config: HTTPSConfig) => {
  return https.createServer(config, app);
};
```

### 3. Environment Configuration

```bash
# .env.production
HTTPS_ENABLED=true
SSL_KEY_PATH=/etc/ssl/private/api.neonpro.com.br.key
SSL_CERT_PATH=/etc/ssl/certs/api.neonpro.com.br.crt
SSL_CHAIN_PATH=/etc/ssl/certs/api.neonpro.com.br.chain.crt

# TLS Configuration
TLS_MIN_VERSION=TLSv1.3
TLS_CIPHER_SUITS=TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256

# HSTS Configuration
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
```

## Detailed Configuration

### NGINX Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/api.neonpro.com.br
server {
    listen 80;
    server_name api.neonpro.com.br www.neonpro.com.br;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.neonpro.com.br www.neonpro.com.br;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/api.neonpro.com.br.crt;
    ssl_certificate_key /etc/ssl/private/api.neonpro.com.br.key;
    ssl_trusted_certificate /etc/ssl/certs/api.neonpro.com.br.chain.crt;
    
    # TLS 1.3 Configuration
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' wss:; frame-ancestors 'none';" always;
    
    # Performance Optimization
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Healthcare-specific headers
    add_header X-Healthcare-Security "LGPD-Compliant" always;
    add_header X-LGPD-Compliance "true" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for healthcare compliance
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### Node.js Application HTTPS Setup

```typescript
// apps/api/src/server.ts
import { createHTTPSServer, createHTTPSConfig } from './config/https';
import app from './app';
import { logger } from './lib/logger';

const startServer = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3001;
    
    if (process.env.HTTPS_ENABLED === 'true') {
      const httpsConfig = createHTTPSConfig(env);
      const server = createHTTPSServer(app, httpsConfig);
      
      server.listen(port, () => {
        logger.info(`HTTPS Server running on port ${port}`, {
          environment: env,
          tlsVersion: httpsConfig.minVersion,
          cipherCount: httpsConfig.ciphers.length
        });
      });
      
      // Handle HTTPS-specific errors
      server.on('tlsClientError', (err) => {
        logger.error('TLS Client Error:', { error: err.message });
      });
      
      server.on('secureConnection', (tlsSocket) => {
        logger.debug('Secure connection established', {
          protocol: tlsSocket.getProtocol(),
          cipher: tlsSocket.getCipher(),
          servername: tlsSocket.servername
        });
      });
      
    } else {
      // HTTP only for development
      const http = require('http');
      const server = http.createServer(app);
      
      server.listen(port, () => {
        logger.info(`HTTP Server running on port ${port}`, { environment: env });
      });
    }
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### Security Headers Middleware

```typescript
// apps/api/src/middleware/security-headers.ts
import { Context } from 'hono';

export const securityHeadersMiddleware = async (c: Context, next: () => Promise<void>) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Security Headers
  c.header('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' wss: https:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; '));
  
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  c.header('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'battery=()',
    'bluetooth=()'
  ].join(', '));
  
  // Healthcare Compliance Headers
  c.header('X-Healthcare-Security', 'LGPD-Compliant');
  c.header('X-LGPD-Compliance', 'true');
  
  // HSTS (Production Only)
  if (isProduction) {
    const maxAge = process.env.HSTS_MAX_AGE || '31536000';
    const includeSubDomains = process.env.HSTS_INCLUDE_SUBDOMAINS === 'true';
    const preload = process.env.HSTS_PRELOAD === 'true';
    
    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) hstsValue += '; includeSubDomains';
    if (preload) hstsValue += '; preload';
    
    c.header('Strict-Transport-Security', hstsValue);
  }
  
  await next();
};
```

### HTTPS Monitoring Service

```typescript
// apps/api/src/services/monitoring/https-monitoring-service.ts
export class HTTPSMonitoringService {
  private metrics = {
    totalHandshakes: 0,
    failedHandshakes: 0,
    averageHandshakeTime: 0,
    cipherUsage: new Map<string, number>(),
    protocolUsage: new Map<string, number>(),
    certificateExpiry: 0,
    complianceRate: 100.0
  };
  
  private alerts: SecurityAlert[] = [];
  private handshakeTimes: number[] = [];
  
  constructor() {
    this.startMonitoring();
  }
  
  recordHandshake(handshakeTime: number, cipher: string, protocol: string, success: boolean) {
    this.metrics.totalHandshakes++;
    
    if (success) {
      this.handshakeTimes.push(handshakeTime);
      this.metrics.averageHandshakeTime = this.calculateAverageHandshakeTime();
      
      // Track cipher usage
      const cipherCount = this.metrics.cipherUsage.get(cipher) || 0;
      this.metrics.cipherUsage.set(cipher, cipherCount + 1);
      
      // Track protocol usage
      const protocolCount = this.metrics.protocolUsage.get(protocol) || 0;
      this.metrics.protocolUsage.set(protocol, protocolCount + 1);
    } else {
      this.metrics.failedHandshakes++;
      this.createAlert('HANDSHAKE_FAILED', 'TLS handshake failed', 'high');
    }
    
    // Check compliance (≤300ms handshake time)
    if (handshakeTime > 300) {
      this.createAlert('SLOW_HANDSHAKE', `Handshake time ${handshakeTime}ms exceeds 300ms limit`, 'medium');
    }
  }
  
  checkCertificateExpiry(cert: any) {
    const now = new Date();
    const expiry = new Date(cert.valid_to);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    this.metrics.certificateExpiry = daysUntilExpiry;
    
    if (daysUntilExpiry <= 30) {
      this.createAlert('CERTIFICATE_EXPIRING', `Certificate expires in ${daysUntilExpiry} days`, 'high');
    }
  }
  
  private calculateAverageHandshakeTime(): number {
    if (this.handshakeTimes.length === 0) return 0;
    
    const sum = this.handshakeTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.handshakeTimes.length;
  }
  
  private createAlert(type: string, message: string, severity: 'low' | 'medium' | 'high') {
    const alert: SecurityAlert = {
      id: `alert-${Date.now()}`,
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Log alert
    if (severity === 'high') {
      console.error(`Security Alert [${type}]: ${message}`);
    }
  }
  
  getStatus() {
    return {
      metrics: this.metrics,
      alerts: this.alerts.filter(alert => !alert.resolved),
      config: {
        maxHandshakeTimeMs: 300,
        minimumCertificateDays: 30
      }
    };
  }
  
  private startMonitoring() {
    // Monitor certificate expiry daily
    setInterval(() => {
      this.checkCertificateExpiry(/* current certificate */);
    }, 24 * 60 * 60 * 1000);
  }
}
```

## Performance Optimization

### Session Resumption

```nginx
# NGINX session resumption
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

### OCSP Stapling

```bash
# Test OCSP stapling
openssl s_client -connect api.neonpro.com.br:443 -status -tlsextdebug < /dev/null
```

### HTTP/2 Configuration

```nginx
# Enable HTTP/2 for better performance
listen 443 ssl http2;
```

## Testing and Validation

### SSL/TLS Testing

```bash
# Test SSL configuration
sslscan api.neonpro.com.br

# Test TLS 1.3 support
openssl s_client -connect api.neonpro.com.br:443 -tls1_3

# Test certificate chain
openssl verify -CAfile /etc/ssl/certs/api.neonpro.com.br.chain.crt \
  /etc/ssl/certs/api.neonpro.com.br.crt

# Test certificate expiry
openssl x509 -in /etc/ssl/certs/api.neonpro.com.br.crt -noout -dates
```

### Security Testing

```bash
# Security headers test
curl -I https://api.neonpro.com.br

# SSL Labs test
https://www.ssllabs.com/ssltest/analyze.html?d=api.neonpro.com.br

# Headers security test
https://securityheaders.com/?q=api.neonpro.com.br
```

### Performance Testing

```bash
# Handshake time test
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://api.neonpro.com.br

# Multiple request test
ab -n 100 -c 10 https://api.neonpro.com.br/v1/health
```

## Healthcare Compliance

### LGPD Requirements

1. **Data Encryption**: All patient data encrypted in transit using TLS 1.3
2. **Access Logging**: All HTTPS connections logged with user identification
3. **Certificate Management**: Valid certificates with proper chain of trust
4. **Data Integrity**: Protection against tampering during transmission

### Audit Logging

```typescript
// apps/api/src/services/security/https-audit-logger.ts
export class HTTPSAuditLogger {
  private logAccess(connection: HTTPSConnection) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      clientIp: connection.remoteAddress,
      userAgent: connection.userAgent,
      protocol: connection.protocol,
      cipher: connection.cipher,
      sessionId: connection.sessionId,
      userId: connection.userId,
      resource: connection.requestPath,
      success: connection.success,
      duration: connection.duration,
      complianceFlags: {
        lgpdCompliant: connection.protocol >= 'TLSv1.3',
        dataEncrypted: true,
        certificateValid: connection.certificateValid
      }
    };
    
    // Store in secure audit log
    this.storeAuditLog(auditLog);
  }
}
```

## Troubleshooting

### Common Issues

#### Certificate Not Trusted

```bash
# Check certificate chain
openssl verify -CAfile /path/to/ca-bundle.crt /path/to/certificate.crt

# Fix: Ensure intermediate certificates are included
cat domain.crt intermediate.crt > bundle.crt
```

#### Mixed Content Issues

```javascript
// Ensure all resources use HTTPS
const enforceHTTPS = (url: string) => {
  return url.replace(/^http:/, 'https:');
};
```

#### HSTS Errors

```bash
# Clear HSTS from browser (for testing)
# Chrome: chrome://net-internals/#hsts
# Firefox: DevTools -> Storage -> Clear HSTS
```

### Performance Issues

#### Slow Handshake Times

```bash
# Check cipher performance
openssl s_time -connect api.neonpro.com.br:443 -new -time 30
```

#### High CPU Usage

```bash
# Monitor SSL session usage
openssl s_server -status -www -accept 443
```

## Monitoring and Alerting

### Prometheus Metrics

```typescript
// apps/api/src/metrics/https-metrics.ts
export const httpsMetrics = {
  handshakeDuration: new Histogram({
    name: 'https_handshake_duration_seconds',
    help: 'HTTPS handshake duration in seconds',
    buckets: [0.1, 0.25, 0.5, 1, 2, 5]
  }),
  
  handshakeErrors: new Counter({
    name: 'https_handshake_errors_total',
    help: 'Total number of HTTPS handshake errors'
  }),
  
  activeConnections: new Gauge({
    name: 'https_active_connections',
    help: 'Number of active HTTPS connections'
  }),
  
  certificateExpiry: new Gauge({
    name: 'https_certificate_expiry_days',
    help: 'Days until SSL certificate expires'
  })
};
```

### Alerting Rules

```yaml
# alerts.yml
groups:
- name: https_security
  rules:
  - alert: HTTPSSlowHandshake
    expr: histogram_quantile(0.95, https_handshake_duration_seconds_bucket) > 0.3
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "HTTPS handshake time is high"
      description: "95th percentile handshake time is {{ $value }}s (threshold: 0.3s)"
  
  - alert: HTTPSCertificateExpiring
    expr: https_certificate_expiry_days < 30
    labels:
      severity: critical
    annotations:
      summary: "SSL certificate expiring soon"
      description: "Certificate expires in {{ $value }} days"
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create certificates directory
RUN mkdir -p /app/certs

# Copy SSL certificates (mounted as volume)
# VOLUME ["/app/certs"]

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f https://localhost:3001/v1/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - HTTPS_ENABLED=true
      - SSL_KEY_PATH=/app/certs/api.neonpro.com.br.key
      - SSL_CERT_PATH=/app/certs/api.neonpro.com.br.crt
      - SSL_CHAIN_PATH=/app/certs/api.neonpro.com.br.chain.crt
    volumes:
      - ./certs:/app/certs:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "https://localhost:3001/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/ssl/certs:ro
      - ./private:/etc/ssl/private:ro
    depends_on:
      - api
    restart: unless-stopped
```

## Checklist

### Pre-Deployment

- [ ] SSL/TLS certificate acquired and valid
- [ ] Certificate chain properly configured
- [ ] Private key secured with appropriate permissions
- [ ] HSTS preloading submitted
- [ ] Security headers configured
- [ ] Performance testing completed
- [ ] Compliance validation completed

### Post-Deployment

- [ ] HTTPS functionality verified
- [ ] Security headers validated
- [ ] Performance metrics within thresholds
- [ ] Monitoring and alerting configured
- [ ] Audit logging operational
- [ ] Backup procedures documented

## Support

For HTTPS configuration issues:
- **Documentation**: [https://docs.neonpro.com.br](https://docs.neonpro.com.br)
- **Security Team**: security@neonpro.com.br
- **Emergency Support**: For security incidents, contact security-emergency@neonpro.com.br

---

*This guide is maintained by the NeonPro security team. For questions or contributions, please contact security@neonpro.com.br*