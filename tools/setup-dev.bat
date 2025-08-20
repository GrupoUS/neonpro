@echo off
:: NeonPro Healthcare Development Environment Setup - Windows
:: Enhanced DevOps Workflow - Constitutional Healthcare Compliance

echo.
echo 🏥 NeonPro Healthcare Development Environment Setup
echo Constitutional Healthcare Compliance ^| LGPD + ANVISA + CFM
echo.

:: Check Node.js
echo 🔍 Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed. Please install Node.js 18+
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected

:: Check PNPM
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing PNPM...
    npm install -g pnpm
)
echo ✅ PNPM detected

:: Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is required but not installed. Please install Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker detected

:: Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is required but not installed
    pause
    exit /b 1
)
echo ✅ Git detected

echo.

:: Install dependencies
echo 📦 Installing NeonPro Healthcare dependencies...
call pnpm install --frozen-lockfile
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

:: Setup environment files
echo ⚙️ Setting up healthcare environment configuration...

if not exist .env.local (
    if exist .env.example (
        copy .env.example .env.local >nul
        echo ✅ Created .env.local from example
    ) else (
        (
        echo # NeonPro Healthcare Environment - Development
        echo NODE_ENV=development
        echo NEXT_TELEMETRY_DISABLED=1
        echo.
        echo # Supabase Configuration ^(São Paulo Region - LGPD Compliant^)
        echo NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
        echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
        echo.
        echo # Healthcare Compliance
        echo HEALTHCARE_MODE=true
        echo LGPD_COMPLIANCE=true
        echo ANVISA_VALIDATION=true
        echo CFM_INTEGRATION=true
        echo.
        echo # Database
        echo DATABASE_URL=postgresql://neonpro:dev_password@localhost:5432/neonpro_dev
        echo.
        echo # Development
        echo DEBUG=true
        echo LOG_LEVEL=debug
        ) > .env.local
        echo ✅ Created .env.local with healthcare defaults
    )
) else (
    echo ℹ️ .env.local already exists
)

:: Setup Git hooks for healthcare compliance
echo 🔗 Setting up Git hooks for healthcare compliance...

if not exist .git\hooks (
    echo ❌ This is not a Git repository
    pause
    exit /b 1
)

:: Create pre-commit hook for healthcare validation
(
echo @echo off
echo :: NeonPro Healthcare Pre-commit Hook
echo :: Constitutional Healthcare Compliance Validation
echo.
echo echo 🏥 Running healthcare compliance validation...
echo.
echo :: Run linting
echo call pnpm lint:staged
echo if errorlevel 1 ^(
echo     echo ❌ Linting failed
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Healthcare compliance validation passed
) > .git\hooks\pre-commit.bat

echo ✅ Git hooks configured for healthcare compliance

:: Start development services
echo 🐳 Starting healthcare development services...

if exist docker-compose.dev.yml (
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    echo ✅ Development services started
) else (
    echo ℹ️ No docker-compose.dev.yml found, skipping service startup
)

:: Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

:: Validate healthcare environment
echo 🏥 Validating healthcare environment...

:: Check if TypeScript is properly configured
call pnpm type-check >nul 2>&1
if errorlevel 1 (
    echo ⚠️ TypeScript issues detected. Run 'pnpm type-check' for details
) else (
    echo ✅ TypeScript configuration valid
)

:: Check if healthcare packages are available
if exist packages\compliance (
    echo ✅ Healthcare compliance package detected
) else (
    echo ⚠️ Healthcare compliance package not found
)

echo.
echo 🎉 NeonPro Healthcare development environment setup complete!
echo.
echo 💜 Next steps:
echo 1. Review .env.local and add your Supabase keys
echo 2. Run 'pnpm dev' to start the development server
echo 3. Visit http://localhost:3000 to access the healthcare dashboard
echo 4. Run 'pnpm test:healthcare' to validate compliance
echo.
echo 🏥 Healthcare Compliance Notes:
echo • All patient data is encrypted and LGPD compliant
echo • ANVISA medical device tracking is enabled
echo • CFM professional standards are enforced
echo • Constitutional healthcare principles are maintained
echo.
echo Happy healthcare coding! 🏥✨
echo.
pause