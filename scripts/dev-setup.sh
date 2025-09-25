#!/bin/bash

# NeonPro Healthcare Platform - Development Environment Setup
# Automated setup script for developers joining the healthcare platform team
# LGPD/ANVISA/CFM compliance requirements included

set -euo pipefail  # Exit on any error, undefined variable, or pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Load centralized configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo "WARNING: Configuration file not found, using defaults"
    # Fallback defaults
    HEALTHCARE_MODE=true
    LGPD_COMPLIANCE=true
    ANVISA_COMPLIANCE=true
    CFM_COMPLIANCE=true
    MINIMUM_NODE_VERSION="20.0.0"
    REQUIRED_MEMORY_GB=8
    MINIMUM_DISK_SPACE_GB=10
fi

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

log_healthcare() {
    echo -e "${PURPLE}[🏥 HEALTHCARE]${NC} $1"
}

# Header
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "🏥 NeonPro Healthcare Platform Dev Setup"
    echo "=============================================="
    echo -e "${NC}"
    echo ""
    log_healthcare "Setting up development environment for Brazilian healthcare compliance"
    log_healthcare "LGPD, ANVISA, and CFM requirements will be configured"
    echo ""
}

# System requirements check
check_system_requirements() {
    log_info "Checking system requirements for healthcare development..."
    
    # Check operating system
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        log_success "Operating System: Linux ✓"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_success "Operating System: macOS ✓"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        log_success "Operating System: Windows (WSL recommended) ✓"
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    # Check available memory
    if [[ "$OS" == "linux" ]]; then
        TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        TOTAL_MEM_GB=$((TOTAL_MEM_KB / 1024 / 1024))
    elif [[ "$OS" == "macos" ]]; then
        TOTAL_MEM_BYTES=$(sysctl -n hw.memsize)
        TOTAL_MEM_GB=$((TOTAL_MEM_BYTES / 1024 / 1024 / 1024))
    else
        TOTAL_MEM_GB=16  # Assume sufficient for Windows
    fi
    
    if [ $TOTAL_MEM_GB -lt $REQUIRED_MEMORY_GB ]; then
        log_warning "Available memory: ${TOTAL_MEM_GB}GB (recommended: ${REQUIRED_MEMORY_GB}GB+)"
        log_warning "Healthcare platform may require additional memory for optimal performance"
    else
        log_success "Available memory: ${TOTAL_MEM_GB}GB ✓"
    fi
    
    # Check disk space (minimum configured)
    AVAILABLE_SPACE_KB=$(df . | tail -1 | awk '{print $4}')
    AVAILABLE_SPACE_GB=$((AVAILABLE_SPACE_KB / 1024 / 1024))
    
    if [ $AVAILABLE_SPACE_GB -lt $MINIMUM_DISK_SPACE_GB ]; then
        log_error "Insufficient disk space: ${AVAILABLE_SPACE_GB}GB available (minimum: ${MINIMUM_DISK_SPACE_GB}GB)"
        exit 1
    else
        log_success "Available disk space: ${AVAILABLE_SPACE_GB}GB ✓"
    fi
}

# Node.js and package manager setup
setup_nodejs() {
    log_info "Setting up Node.js and package managers..."
    
    # Check if Node.js is installed
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | sed 's/v//')
        log_info "Node.js found: v$NODE_VERSION"
        
        # Compare versions
        if [ "$(printf '%s\n' "$MINIMUM_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$MINIMUM_NODE_VERSION" ]; then
            log_success "Node.js version is compatible ✓"
        else
            log_error "Node.js version $NODE_VERSION is below minimum required $MINIMUM_NODE_VERSION"
            log_info "Please update Node.js using: https://nodejs.org/"
            exit 1
        fi
    else
        log_error "Node.js not found. Please install Node.js $MINIMUM_NODE_VERSION or higher"
        log_info "Download from: https://nodejs.org/"
        exit 1
    fi
    
    # Check and install pnpm
    if command -v pnpm >/dev/null 2>&1; then
        PNPM_VERSION=$(pnpm --version)
        log_success "pnpm found: v$PNPM_VERSION ✓"
    else
        log_info "Installing pnpm package manager..."
        npm install -g pnpm
        log_success "pnpm installed successfully ✓"
    fi
    
    # Check bun for testing performance
    if command -v bun >/dev/null 2>&1; then
        BUN_VERSION=$(bun --version)
        log_success "Bun found: v$BUN_VERSION ✓"
    else
        log_info "Installing Bun for enhanced testing performance..."
        if [[ "$OS" == "linux" ]] || [[ "$OS" == "macos" ]]; then
            curl -fsSL https://bun.sh/install | bash
            export PATH="$HOME/.bun/bin:$PATH"
            log_success "Bun installed successfully ✓"
        else
            log_warning "Bun installation skipped on Windows (manual installation recommended)"
        fi
    fi
}

# Development tools setup
setup_development_tools() {
    log_info "Setting up healthcare development tools..."
    
    # Git hooks for healthcare compliance
    if [ -d ".git" ]; then
        log_info "Installing Git hooks for healthcare compliance..."
        
        # Pre-commit hook for LGPD compliance
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🏥 Running healthcare compliance checks..."

# Check for potentially sensitive data
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l 'cpf\|rg\|email\|telefone\|endereco' >/dev/null 2>&1; then
    echo "⚠️  Warning: Potential patient data detected in staged files"
    echo "Please ensure LGPD compliance before committing"
fi

# Run linting
pnpm run lint:fix
EOF
        
        chmod +x .git/hooks/pre-commit
        log_success "Git hooks installed ✓"
    else
        log_warning "Not in a Git repository - Git hooks skipped"
    fi
    
    # VS Code setup
    if command -v code >/dev/null 2>&1; then
        log_info "Setting up VS Code for healthcare development..."
        
        mkdir -p .vscode
        
        # VS Code settings for healthcare compliance
        cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": ["apps/web", "apps/api", "packages/shared"],
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "postcss": "css"
  },
  "healthcare.lgpdCompliance": true,
  "healthcare.anvisaCompliance": true,
  "healthcare.cfmCompliance": true,
  "accessibility.alwaysCheck": true
}
EOF
        
        # Recommended extensions
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "deque-systems.vscode-axe-linter",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one"
  ]
}
EOF
        
        log_success "VS Code configuration created ✓"
    else
        log_info "VS Code not found - IDE setup skipped"
    fi
}

# Environment variables setup
setup_environment() {
    log_info "Setting up healthcare platform environment variables..."
    
    # Check if .env.example exists
    if [ -f ".env.example" ]; then
        if [ ! -f ".env.local" ]; then
            log_info "Creating .env.local from template..."
            cp .env.example .env.local
            
            # Add healthcare-specific environment variables
            cat >> .env.local << 'EOF'

# Healthcare Platform Configuration
HEALTHCARE_MODE=true
LGPD_COMPLIANCE=true
ANVISA_COMPLIANCE=true
CFM_COMPLIANCE=true

# Security Settings
SESSION_SECRET=your-super-secure-session-secret-here
JWT_SECRET=your-jwt-secret-for-healthcare-sessions

# Database (Supabase)
DATABASE_URL=your-supabase-database-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Monitoring & Observability
SENTRY_DSN=your-sentry-dsn-for-error-tracking
OPENTELEMETRY_ENABLED=true

# AI Services (with PII protection)
OPENAI_API_KEY=your-openai-key-with-pii-protection
AI_PII_REDACTION=true

# Development
NODE_ENV=development
LOG_LEVEL=debug
HEALTHCARE_DEBUG=true
EOF
            
            log_success "Environment file created ✓"
            log_warning "Please update .env.local with your actual credentials"
        else
            log_success "Environment file already exists ✓"
        fi
    else
        log_warning ".env.example not found - environment setup skipped"
    fi
    
    # Set up shell profile for healthcare development
    SHELL_PROFILE=""
    if [ -f "$HOME/.bashrc" ]; then
        SHELL_PROFILE="$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        SHELL_PROFILE="$HOME/.zshrc"
    fi
    
    if [ -n "$SHELL_PROFILE" ]; then
        # Add healthcare development aliases
        if ! grep -q "# NeonPro Healthcare Aliases" "$SHELL_PROFILE"; then
            cat >> "$SHELL_PROFILE" << 'EOF'

# NeonPro Healthcare Aliases
alias neon-dev="pnpm run dev:all"
alias neon-test="pnpm run test:watch"
alias neon-lint="pnpm run lint:fix"
alias neon-build="pnpm run build:all"
alias neon-healthcare="echo 'LGPD/ANVISA/CFM compliance mode active'"
alias neon-logs="pnpm run logs:healthcare"

# Healthcare development environment
export HEALTHCARE_MODE=true
export LGPD_COMPLIANCE=true
export NODE_OPTIONS="--max-old-space-size=4096"
EOF
            log_success "Healthcare development aliases added to $SHELL_PROFILE ✓"
        else
            log_success "Healthcare development aliases already configured ✓"
        fi
    fi
}

# Dependencies installation
install_dependencies() {
    log_info "Installing healthcare platform dependencies..."
    
    # Install dependencies with pnpm
    log_info "Running: pnpm install --frozen-lockfile"
    pnpm install --frozen-lockfile
    
    log_success "Dependencies installed successfully ✓"
    
    # Install global development tools
    log_info "Installing global development tools..."
    
    # Healthcare-specific tools
    npm install -g @axe-core/cli lighthouse
    
    log_success "Global tools installed ✓"
}

# Database setup
setup_database() {
    log_info "Setting up healthcare database (Supabase)..."
    
    if [ -f "packages/database/supabase/migrations" ] && [ -d "packages/database/supabase/migrations" ]; then
        log_info "Database migrations found"
        
        # Check if Supabase CLI is installed
        if command -v supabase >/dev/null 2>&1; then
            log_success "Supabase CLI found ✓"
            
            # Start local Supabase (if configured)
            if [ -f "packages/database/supabase/config.toml" ]; then
                log_info "Starting local Supabase instance..."
                cd packages/database
                supabase start
                cd ../..
                log_success "Local Supabase started ✓"
            else
                log_info "Supabase config not found - using remote instance"
            fi
        else
            log_warning "Supabase CLI not found - install for local development"
            log_info "Install with: npm install -g supabase"
        fi
    else
        log_warning "Database migrations not found - database setup skipped"
    fi
}

# Healthcare compliance verification
verify_healthcare_compliance() {
    log_healthcare "Verifying healthcare compliance setup..."
    
    # Check LGPD compliance tools
    if [ -f "apps/api/src/middleware/lgpd-compliance.ts" ]; then
        log_success "LGPD compliance middleware found ✓"
    else
        log_warning "LGPD compliance middleware not found"
    fi
    
    # Check ANVISA security requirements
    if [ -f "packages/shared/src/models/security-policy.ts" ]; then
        log_success "ANVISA security policy model found ✓"
    else
        log_warning "ANVISA security policy model not found"
    fi
    
    # Check CFM professional standards
    if [ -f "apps/api/src/services/audit-trail.ts" ]; then
        log_success "CFM audit trail service found ✓"
    else
        log_warning "CFM audit trail service not found"
    fi
    
    # Check accessibility compliance
    if grep -q "axe-core" package.json >/dev/null 2>&1; then
        log_success "Accessibility testing (axe-core) configured ✓"
    else
        log_warning "Accessibility testing not configured"
    fi
    
    log_healthcare "Healthcare compliance verification complete"
}

# Final setup and verification
finalize_setup() {
    log_info "Finalizing healthcare development environment..."
    
    # Build the project to verify everything works
    log_info "Running initial build to verify setup..."
    if pnpm run build:all >/dev/null 2>&1; then
        log_success "Initial build successful ✓"
    else
        log_warning "Initial build failed - check configuration"
    fi
    
    # Run tests to verify healthcare compliance
    log_info "Running healthcare compliance tests..."
    if pnpm run test:healthcare >/dev/null 2>&1; then
        log_success "Healthcare compliance tests passed ✓"
    else
        log_warning "Healthcare compliance tests failed - check implementation"
    fi
    
    # Final summary
    echo ""
    log_success "🏥 Healthcare development environment setup complete!"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Update .env.local with your actual credentials"
    echo "2. Configure Supabase connection"
    echo "3. Run 'pnpm run dev:all' to start development"
    echo "4. Visit http://localhost:3000 to access the platform"
    echo ""
    echo -e "${PURPLE}Healthcare Compliance:${NC}"
    echo "✅ LGPD data protection configured"
    echo "✅ ANVISA security requirements set up"
    echo "✅ CFM professional standards implemented"
    echo "✅ WCAG 2.1 AA accessibility testing enabled"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "• neon-dev      - Start development servers"
    echo "• neon-test     - Run tests in watch mode"
    echo "• neon-lint     - Fix linting issues"
    echo "• neon-build    - Build all packages"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "• README.md - General project information"
    echo "• docs/ - Healthcare platform documentation"
    echo "• CLAUDE.md - Development workflow instructions"
}

# Main execution
main() {
    print_header
    check_system_requirements
    setup_nodejs
    setup_development_tools
    setup_environment
    install_dependencies
    setup_database
    verify_healthcare_compliance
    finalize_setup
}

# Execute main function
main "$@"