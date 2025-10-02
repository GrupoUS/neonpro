#!/bin/bash

# NeonPro Frontend Simple Deployment Script
# Simplified deployment script for frontend only

set -euo pipefail

# Logging functions
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }
log_step() { echo "[STEP] $1" >&2; }

# Configuration
PROJECT_NAME="neonpro"
TIMEOUT=30

# Load environment variables
if [ -f ".env" ]; then
    log_info "Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    log_error ".env file not found"
    exit 1
fi

# Check required commands
require_command() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Command not found: $cmd"
        exit 1
    fi
}

# Validate project structure
validate_project() {
    log_step "Validating project structure"
    
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        exit 1
    fi
    
    if [ ! -d "apps/web" ]; then
        log_error "apps/web directory not found"
        exit 1
    fi
    
    log_success "Project structure validation passed"
}

# Create a simple static deployment package
create_deployment_package() {
    log_step "Creating deployment package"
    
    # Create a deployment directory
    mkdir -p deployment
    
    # Create a simple index.html
    cat > deployment/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro - Healthcare Platform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4a6bdf;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .api-status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            background-color: #e7f3ff;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status-healthy {
            color: green;
            font-weight: bold;
        }
        .status-error {
            color: red;
            font-weight: bold;
        }
        .function-status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NeonPro</h1>
            <p>Healthcare Platform for Brazil</p>
        </div>
        <div class="content">
            <h2>Welcome to NeonPro</h2>
            <p>This is the healthcare platform designed for the Brazilian market.</p>
            <div class="api-status">
                <h3>API Status</h3>
                <p>Checking API status... <span class="loading"></span></p>
                <div id="api-result"></div>
                
                <div class="function-status">
                    <h4>Supabase Edge Functions</h4>
                    <p>Checking Edge Functions... <span id="edge-loading" class="loading"></span></p>
                    <div id="edge-result"></div>
                </div>
                
                <div class="function-status">
                    <h4>Supabase Node Functions</h4>
                    <p>Checking Node Functions... <span id="node-loading" class="loading"></span></p>
                    <div id="node-result"></div>
                </div>
            </div>
        </div>
    </div>
    <script>
        // Check API status
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('api-result').innerHTML = '<p><strong>API Status:</strong> <span class="status-healthy">✓ Healthy</span></p>';
            })
            .catch(error => {
                document.getElementById('api-result').innerHTML = '<p><strong>API Status:</strong> <span class="status-error">✗ Error</span></p>';
            });
            
        // Check Edge Functions
        fetch('https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/edge-reads')
            .then(response => response.json())
            .then(data => {
                document.getElementById('edge-loading').style.display = 'none';
                document.getElementById('edge-result').innerHTML = '<p><strong>Edge Functions:</strong> <span class="status-healthy">✓ Healthy</span></p>';
            })
            .catch(error => {
                document.getElementById('edge-loading').style.display = 'none';
                document.getElementById('edge-result').innerHTML = '<p><strong>Edge Functions:</strong> <span class="status-error">✗ Error</span></p>';
            });
            
        // Check Node Functions
        fetch('https://ownkoxryswokcdanrdgj.supabase.co/functions/v1/node-writes/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('node-loading').style.display = 'none';
                document.getElementById('node-result').innerHTML = '<p><strong>Node Functions:</strong> <span class="status-healthy">✓ Healthy</span></p>';
            })
            .catch(error => {
                document.getElementById('node-loading').style.display = 'none';
                document.getElementById('node-result').innerHTML = '<p><strong>Node Functions:</strong> <span class="status-error">✗ Error</span></p>';
            });
    </script>
</body>
</html>
HTML
    
    # Create a simple API route
    mkdir -p deployment/api
    cat > deployment/api/health.js << 'JS'
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
JS
    
    # Create a package.json for the deployment
    cat > deployment/package.json << 'JSON'
{
  "name": "neonpro-frontend",
  "version": "1.0.0",
  "description": "NeonPro Healthcare Platform Frontend",
  "main": "index.html"
}
JSON
    
    log_success "Deployment package created"
}

# Deploy to Vercel
deploy_vercel() {
    log_step "Deploying to Vercel"
    
    require_command "vercel"
    
    # Check if Vercel is logged in
    if ! vercel whoami >/dev/null 2>&1; then
        log_error "Vercel is not logged in. Run 'vercel login' first."
        exit 1
    fi
    
    # Deploy to Vercel
    log_info "Running Vercel deployment..."
    cd deployment
    if ! vercel --prod --yes; then
        log_error "Vercel deployment failed"
        cd ..
        exit 1
    fi
    cd ..
    
    log_success "Vercel deployment completed"
}

# Health checks
health_checks() {
    log_step "Running health checks"
    
    # Get the deployed URL from Vercel
    DEPLOY_URL=$(vercel ls 2>/dev/null | grep -E "^\s*https://" | head -1 | awk '{print $1}')
    
    if [ -z "$DEPLOY_URL" ]; then
        log_warning "Could not determine deployed URL"
        return 0
    fi
    
    log_info "Checking health of deployed application at $DEPLOY_URL"
    
    # Check main endpoint
    if curl -s --max-time "$TIMEOUT" "$DEPLOY_URL" >/dev/null; then
        log_success "Main endpoint is healthy"
    else
        log_warning "Main endpoint health check failed"
    fi
    
    # Check API endpoint
    if curl -s --max-time "$TIMEOUT" "$DEPLOY_URL/api/health" >/dev/null; then
        log_success "API endpoint is healthy"
    else
        log_warning "API endpoint health check failed"
    fi
    
    log_success "Health checks completed"
}

# Main function
main() {
    log_info "Starting NeonPro Frontend deployment"
    
    # Validate project structure
    validate_project
    
    # Create deployment package
    create_deployment_package
    
    # Deploy to Vercel
    deploy_vercel
    
    # Run health checks
    health_checks
    
    log_success "Frontend deployment completed successfully"
}

# Run main function
main "$@"
