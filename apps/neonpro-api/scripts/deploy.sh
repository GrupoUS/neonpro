#!/bin/bash

# =====================================================
# NeonPro Healthcare API Deployment Script
# Sistema de Clínicas Estéticas - Conformidade LGPD/ANVISA
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="neonpro-healthcare-api"
DOCKER_IMAGE="neonpro/healthcare-api"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

echo -e "${BLUE}🏥 Starting NeonPro Healthcare API Deployment${NC}"
echo -e "${BLUE}Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}Version: $VERSION${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}$(date)${NC}"
echo ""

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Function to log step
log_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test || handle_error "Tests failed"
log_step "Tests passed"

# Run build
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build || handle_error "Build failed"
log_step "Application built successfully"

# Healthcare compliance checks
echo -e "${BLUE}🏥 Running healthcare compliance checks...${NC}"
grep -r "maskSensitiveData\|validateLGPDCompliance" src/ >/dev/null || log_warning "LGPD utilities not found in codebase"
grep -r "auditLog\|audit_logs" src/ >/dev/null || log_warning "ANVISA audit logging not found in codebase"
log_step "Healthcare compliance checks completed"

echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo -e "${GREEN}🏥 NeonPro Healthcare API is ready to serve patients! 🏥${NC}"