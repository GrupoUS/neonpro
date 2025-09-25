#!/bin/bash

# 📦 NEONPRO - Package Scripts Setup
# Adds development workflow scripts to package.json

set -e

echo "📦 Setting up package.json scripts for NeonPro development workflow..."

# Backup existing package.json
cp package.json package.json.backup
echo "✅ Created backup: package.json.backup"

# Create temporary JSON with additional scripts
cat > temp_scripts.json << 'EOF'
{
  "scripts": {
    "dev:workflow": "./scripts/dev-workflow.sh",
    "dev:setup": "./scripts/dev-workflow.sh setup",
    "dev:quality": "./scripts/dev-workflow.sh quality",
    "dev:test-all": "./scripts/dev-workflow.sh test",
    "dev:build-validate": "./scripts/dev-workflow.sh build",
    "dev:deploy": "./scripts/dev-workflow.sh deploy",
    "dev:monitor": "./scripts/dev-workflow.sh monitor",
    "dev:compliance": "./scripts/dev-workflow.sh compliance",
    "dev:performance": "./scripts/dev-workflow.sh performance",
    "healthcare:compliance": "./scripts/dev-workflow.sh compliance",
    "healthcare:performance": "node scripts/performance/dashboard-generator.cjs",
    "monitoring:health": "node monitoring/scripts/health-check.js",
    "monitoring:performance": "node monitoring/scripts/performance-monitor.js",
    "performance:report": "node scripts/performance/dashboard-generator.cjs",
    "performance:vitals": "node scripts/performance/core-web-vitals.cjs",
    "e2e:post-deploy": "node tools/tests/e2e/post-deploy-tests.js",
    "deploy:production": "./scripts/deploy.sh",
    "deploy:dry-run": "./scripts/deploy.sh --dry-run",
    "setup:monitoring": "./scripts/monitoring/setup-alerts.sh",
    "quality:full": "npm run build && npm run lint && npm run type-check",
    "workflow:ci": "./scripts/dev-workflow.sh quality && ./scripts/dev-workflow.sh test",
    "workflow:pre-deploy": "./scripts/dev-workflow.sh full"
  },
  "devDependencies": {
    "web-vitals": "^4.0.0"
  }
}
EOF

# Merge the scripts into package.json using Node.js
node << 'EOF'
const fs = require('fs');

// Read existing package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newScripts = JSON.parse(fs.readFileSync('temp_scripts.json', 'utf8'));

// Merge scripts
packageJson.scripts = {
  ...packageJson.scripts,
  ...newScripts.scripts
};

// Merge devDependencies
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  ...newScripts.devDependencies
};

// Write updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Scripts merged successfully!');
EOF

# Clean up temporary file
rm temp_scripts.json

echo ""
echo "🎉 Package.json updated with NeonPro development workflow scripts!"
echo ""
echo "📋 Available commands:"
echo "  npm run dev:workflow          # Run complete development workflow"
echo "  npm run dev:quality           # Code quality checks"
echo "  npm run dev:compliance        # Healthcare compliance validation"
echo "  npm run healthcare:performance # Healthcare performance monitoring"
echo "  npm run e2e:post-deploy       # Post-deployment E2E tests"
echo "  npm run deploy:production     # Production deployment"
echo "  npm run monitoring:health     # Health monitoring"
echo "  npm run performance:report    # Performance dashboard"
echo ""
echo "🏥 Healthcare-specific commands:"
echo "  npm run healthcare:compliance  # LGPD compliance check"
echo "  npm run healthcare:performance # Medical performance monitoring"
echo ""
echo "⚡ Quick start:"
echo "  npm run dev:setup             # Setup development environment"
echo "  npm run workflow:pre-deploy   # Pre-deployment validation"
echo ""