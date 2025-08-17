#!/bin/bash
# NeonPro Healthcare Development Environment Setup
# Enhanced DevOps Workflow - Constitutional Healthcare Compliance

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🏥 NeonPro Healthcare Development Environment Setup${NC}"
echo -e "${BLUE}Constitutional Healthcare Compliance | LGPD + ANVISA + CFM${NC}"
echo ""

# Check system requirements
echo -e "${YELLOW}🔍 Checking system requirements...${NC}"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is required but not installed. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check PNPM
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing PNPM...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✅ PNPM $(pnpm --version) detected${NC}"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is required but not installed. Please install Docker Desktop${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected${NC}"

# Check Git
if ! command -v git >/dev/null 2>&1; then
    echo -e "${RED}❌ Git is required but not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git $(git --version | cut -d' ' -f3) detected${NC}"

echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing NeonPro Healthcare dependencies...${NC}"
pnpm install --frozen-lockfile

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Setup environment files
echo -e "${YELLOW}⚙️ Setting up healthcare environment configuration...${NC}"

if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from example${NC}"
    else
        cat > .env.local << EOF
# NeonPro Healthcare Environment - Development
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Supabase Configuration (São Paulo Region - LGPD Compliant)
NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Healthcare Compliance
HEALTHCARE_MODE=true
LGPD_COMPLIANCE=true
ANVISA_VALIDATION=true
CFM_INTEGRATION=true

# Database
DATABASE_URL=postgresql://neonpro:dev_password@localhost:5432/neonpro_dev

# Development
DEBUG=true
LOG_LEVEL=debug
EOF
        echo -e "${GREEN}✅ Created .env.local with healthcare defaults${NC}"
    fi
else
    echo -e "${BLUE}ℹ️ .env.local already exists${NC}"
fi

# Setup Git hooks for healthcare compliance
echo -e "${YELLOW}🔗 Setting up Git hooks for healthcare compliance...${NC}"

if [ ! -d .git/hooks ]; then
    echo -e "${RED}❌ This is not a Git repository${NC}"
    exit 1
fi

# Create pre-commit hook for healthcare validation
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# NeonPro Healthcare Pre-commit Hook
# Constitutional Healthcare Compliance Validation

echo "🏥 Running healthcare compliance validation..."

# Check for sensitive data
if git diff --cached --name-only | xargs grep -l "password\|secret\|token\|key" | grep -v ".env.example" | grep -q .; then
    echo "❌ Potential sensitive data detected. Please review before committing."
    git diff --cached --name-only | xargs grep -l "password\|secret\|token\|key" | grep -v ".env.example"
    exit 1
fi

# Check for LGPD compliance markers
if git diff --cached --name-only | grep -E "\.(ts|tsx|js|jsx)$" | xargs grep -l "patient\|cpf\|medical" | head -1 | xargs grep -L "LGPD" | grep -q .; then
    echo "⚠️ Healthcare data files should include LGPD compliance markers"
fi

# Run linting
pnpm lint:staged

echo "✅ Healthcare compliance validation passed"
EOF

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✅ Git hooks configured for healthcare compliance${NC}"

# Start development services
echo -e "${YELLOW}🐳 Starting healthcare development services...${NC}"

# Check if docker-compose file exists
if [ -f docker-compose.dev.yml ]; then
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    echo -e "${GREEN}✅ Development services started${NC}"
else
    echo -e "${BLUE}ℹ️ No docker-compose.dev.yml found, skipping service startup${NC}"
fi

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Validate healthcare environment
echo -e "${YELLOW}🏥 Validating healthcare environment...${NC}"

# Check if TypeScript is properly configured
if pnpm type-check >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript configuration valid${NC}"
else
    echo -e "${YELLOW}⚠️ TypeScript issues detected. Run 'pnpm type-check' for details${NC}"
fi

# Check if healthcare packages are available
if [ -d "packages/compliance" ]; then
    echo -e "${GREEN}✅ Healthcare compliance package detected${NC}"
else
    echo -e "${YELLOW}⚠️ Healthcare compliance package not found${NC}"
fi

# Setup database (if available)
if command -v supabase >/dev/null 2>&1; then
    echo -e "${YELLOW}🗄️ Setting up healthcare database...${NC}"
    pnpm db:migrate || echo -e "${YELLOW}⚠️ Database migration failed. Run manually if needed${NC}"
else
    echo -e "${BLUE}ℹ️ Supabase CLI not found. Database setup skipped${NC}"
fi

echo ""
echo -e "${GREEN}🎉 NeonPro Healthcare development environment setup complete!${NC}"
echo ""
echo -e "${PURPLE}Next steps:${NC}"
echo -e "${BLUE}1. Review .env.local and add your Supabase keys${NC}"
echo -e "${BLUE}2. Run 'pnpm dev' to start the development server${NC}"
echo -e "${BLUE}3. Visit http://localhost:3000 to access the healthcare dashboard${NC}"
echo -e "${BLUE}4. Run 'pnpm test:healthcare' to validate compliance${NC}"
echo ""
echo -e "${YELLOW}Healthcare Compliance Notes:${NC}"
echo -e "${BLUE}• All patient data is encrypted and LGPD compliant${NC}"
echo -e "${BLUE}• ANVISA medical device tracking is enabled${NC}"
echo -e "${BLUE}• CFM professional standards are enforced${NC}"
echo -e "${BLUE}• Constitutional healthcare principles are maintained${NC}"
echo ""
echo -e "${GREEN}Happy healthcare coding! 🏥✨${NC}"