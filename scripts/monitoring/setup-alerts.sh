#!/bin/bash

# 📊 NEONPRO - Production Monitoring & Alerts Setup
# Configures comprehensive monitoring for production environment

set -e

echo "📊 NEONPRO - Setting up Production Monitoring"
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[MONITORING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
MONITORING_DIR="./monitoring"
CONFIG_DIR="$MONITORING_DIR/config"
SCRIPTS_DIR="$MONITORING_DIR/scripts"

# Create monitoring directory structure
print_status "Creating monitoring directory structure..."
mkdir -p "$CONFIG_DIR"
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$MONITORING_DIR/logs"
mkdir -p "$MONITORING_DIR/dashboards"

# 1. Health Check Configuration
print_status "Setting up health check monitoring..."
cat > "$CONFIG_DIR/health-checks.json" << 'EOF'
{
  "healthChecks": {
    "api": {
      "endpoint": "/api/health",
      "interval": 60,
      "timeout": 10,
      "retries": 3,
      "expectedStatus": 200,
      "alertOnFailure": true
    },
    "database": {
      "endpoint": "/api/v1/health",
      "interval": 300,
      "timeout": 15,
      "retries": 2,
      "expectedStatus": 200,
      "alertOnFailure": true
    },
    "authentication": {
      "endpoint": "/api/auth/health",
      "interval": 180,
      "timeout": 10,
      "retries": 3,
      "expectedStatus": 200,
      "alertOnFailure": true
    }
  },
  "alerting": {
    "email": {
      "enabled": true,
      "recipients": ["admin@neonpro.com"],
      "cooldown": 300
    },
    "slack": {
      "enabled": false,
      "webhook": "",
      "channel": "#alerts"
    },
    "discord": {
      "enabled": false,
      "webhook": ""
    }
  }
}
EOF

# 2. Performance Monitoring Configuration
print_status "Setting up performance monitoring..."
cat > "$CONFIG_DIR/performance-monitoring.json" << 'EOF'
{
  "metrics": {
    "responseTime": {
      "warning": 500,
      "critical": 1000,
      "unit": "ms"
    },
    "errorRate": {
      "warning": 1,
      "critical": 5,
      "unit": "%"
    },
    "uptime": {
      "warning": 99,
      "critical": 95,
      "unit": "%"
    },
    "memoryUsage": {
      "warning": 80,
      "critical": 95,
      "unit": "%"
    }
  },
  "endpoints": [
    "/api/health",
    "/api/v1/health",
    "/api/patients",
    "/api/appointments",
    "/api/auth/login"
  ],
  "monitoring": {
    "interval": 60,
    "retention": "30d",
    "aggregation": "5m"
  }
}
EOF

# 3. Error Tracking Configuration
print_status "Setting up error tracking..."
cat > "$CONFIG_DIR/error-tracking.json" << 'EOF'
{
  "errorTracking": {
    "sentry": {
      "enabled": true,
      "dsn": "${SENTRY_DSN}",
      "environment": "production",
      "release": "${VERCEL_GIT_COMMIT_SHA}",
      "sampleRate": 0.1,
      "performanceMonitoring": true
    },
    "customTracking": {
      "enabled": true,
      "logLevel": "error",
      "includeStack": true,
      "includeContext": true
    }
  },
  "alerts": {
    "criticalErrors": {
      "threshold": 1,
      "timeWindow": "5m",
      "alert": true
    },
    "errorRate": {
      "threshold": 5,
      "timeWindow": "15m",
      "alert": true
    },
    "newErrors": {
      "enabled": true,
      "alert": true
    }
  }
}
EOF

# 4. Healthcare Compliance Monitoring
print_status "Setting up LGPD compliance monitoring..."
cat > "$CONFIG_DIR/compliance-monitoring.json" << 'EOF'
{
  "lgpdCompliance": {
    "auditLog": {
      "enabled": true,
      "retention": "7y",
      "encryption": true,
      "anonymization": true
    },
    "dataAccess": {
      "monitoring": true,
      "alerts": {
        "unusualPatterns": true,
        "bulkAccess": true,
        "offHoursAccess": true
      }
    },
    "consent": {
      "tracking": true,
      "expiration": true,
      "withdrawal": true
    }
  },
  "security": {
    "suspiciousActivity": {
      "enabled": true,
      "patterns": [
        "sql_injection",
        "xss_attempt",
        "brute_force",
        "unusual_access_patterns"
      ]
    },
    "dataLeakage": {
      "monitoring": true,
      "patterns": ["cpf", "email", "phone"]
    }
  }
}
EOF

# 5. Health Check Script
print_status "Creating health check script..."
cat > "$SCRIPTS_DIR/health-check.js" << 'EOF'
#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class HealthChecker {
  constructor() {
    this.config = this.loadConfig();
    this.results = [];
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/health-checks.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  async checkEndpoint(name, config) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const options = {
        hostname: process.env.DEPLOYMENT_URL || 'localhost',
        port: 443,
        path: config.endpoint,
        method: 'GET',
        timeout: config.timeout * 1000
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        const success = res.statusCode === config.expectedStatus;
        
        resolve({
          name,
          endpoint: config.endpoint,
          success,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString()
        });
      });

      req.on('error', (error) => {
        resolve({
          name,
          endpoint: config.endpoint,
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      });

      req.on('timeout', () => {
        resolve({
          name,
          endpoint: config.endpoint,
          success: false,
          error: 'Timeout',
          responseTime: config.timeout * 1000,
          timestamp: new Date().toISOString()
        });
      });

      req.end();
    });
  }

  async runHealthChecks() {
    console.log('🏥 Running Health Checks...');
    console.log('============================');

    for (const [name, config] of Object.entries(this.config.healthChecks)) {
      const result = await this.checkEndpoint(name, config);
      this.results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const time = result.responseTime ? `(${result.responseTime}ms)` : '';
      
      console.log(`${status} ${name}: ${result.endpoint} ${time}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    this.saveResults();
    this.checkAlerts();
  }

  saveResults() {
    const logPath = path.join(__dirname, '../logs/health-check-results.json');
    const logEntry = {
      timestamp: new Date().toISOString(),
      results: this.results
    };

    // Append to log file
    const logs = this.loadExistingLogs(logPath);
    logs.push(logEntry);
    
    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }

  loadExistingLogs(logPath) {
    try {
      return JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch {
      return [];
    }
  }

  checkAlerts() {
    const failedChecks = this.results.filter(r => !r.success);
    
    if (failedChecks.length > 0) {
      console.log('🚨 ALERT: Health check failures detected!');
      console.log('Failed checks:', failedChecks.map(f => f.name).join(', '));
      
      // Here you would integrate with your alerting system
      // this.sendAlert(failedChecks);
    } else {
      console.log('✅ All health checks passed!');
    }
  }
}

// Run health checks
const checker = new HealthChecker();
checker.runHealthChecks().catch(console.error);
EOF

chmod +x "$SCRIPTS_DIR/health-check.js"

# 6. Performance Monitoring Script
print_status "Creating performance monitoring script..."
cat > "$SCRIPTS_DIR/performance-monitor.js" << 'EOF'
#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.config = this.loadConfig();
    this.metrics = {
      responseTime: [],
      errorRate: 0,
      throughput: 0,
      uptime: 100
    };
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/performance-monitoring.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  async measureEndpoint(endpoint) {
    const startTime = process.hrtime.bigint();
    
    return new Promise((resolve) => {
      const options = {
        hostname: process.env.DEPLOYMENT_URL || 'localhost',
        port: 443,
        path: endpoint,
        method: 'GET',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to ms
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            endpoint,
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            success: res.statusCode >= 200 && res.statusCode < 300,
            timestamp: new Date().toISOString()
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          endpoint,
          success: false,
          error: error.message,
          responseTime: 0,
          timestamp: new Date().toISOString()
        });
      });

      req.end();
    });
  }

  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...');
    console.log('==============================');

    const results = [];

    for (const endpoint of this.config.endpoints) {
      const result = await this.measureEndpoint(endpoint);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const time = result.responseTime ? `${result.responseTime.toFixed(2)}ms` : 'N/A';
      const warning = result.responseTime > this.config.metrics.responseTime.warning ? '⚠️' : '';
      
      console.log(`${status} ${endpoint}: ${time} ${warning}`);
    }

    this.analyzeResults(results);
    this.saveResults(results);
  }

  analyzeResults(results) {
    const successfulResults = results.filter(r => r.success);
    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
    const errorRate = ((results.length - successfulResults.length) / results.length) * 100;

    console.log('\n📊 Performance Summary:');
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
    console.log(`Successful Requests: ${successfulResults.length}/${results.length}`);

    // Check thresholds
    if (avgResponseTime > this.config.metrics.responseTime.critical) {
      console.log('🚨 CRITICAL: Response time exceeds critical threshold!');
    } else if (avgResponseTime > this.config.metrics.responseTime.warning) {
      console.log('⚠️ WARNING: Response time exceeds warning threshold');
    }

    if (errorRate > this.config.metrics.errorRate.critical) {
      console.log('🚨 CRITICAL: Error rate exceeds critical threshold!');
    } else if (errorRate > this.config.metrics.errorRate.warning) {
      console.log('⚠️ WARNING: Error rate exceeds warning threshold');
    }
  }

  saveResults(results) {
    const logPath = path.join(__dirname, '../logs/performance-results.json');
    const logEntry = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        avgResponseTime: results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length,
        errorRate: ((results.length - results.filter(r => r.success).length) / results.length) * 100,
        totalRequests: results.length
      }
    };

    const logs = this.loadExistingLogs(logPath);
    logs.push(logEntry);
    
    if (logs.length > 500) {
      logs.splice(0, logs.length - 500);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }

  loadExistingLogs(logPath) {
    try {
      return JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch {
      return [];
    }
  }
}

const monitor = new PerformanceMonitor();
monitor.runPerformanceTests().catch(console.error);
EOF

chmod +x "$SCRIPTS_DIR/performance-monitor.js"

print_success "✅ Monitoring setup completed!"
print_status "Created monitoring configuration files and scripts"
print_status "To run monitoring:"
print_status "  Health checks: node ./monitoring/scripts/health-check.js"
print_status "  Performance:   node ./monitoring/scripts/performance-monitor.js"