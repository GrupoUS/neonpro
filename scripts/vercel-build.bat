@echo off
rem Vercel Build Script for NeonPro Monorepo (Windows)
rem Handles workspace dependencies and build optimization

echo 🚀 Starting NeonPro Vercel Build Process...

rem Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Script must be run from project root.
    exit /b 1
)

rem Verify this is the NeonPro project
findstr /C:"\"name\": \"neonpro\"" package.json >nul
if errorlevel 1 (
    echo ❌ Error: This script must be run from the NeonPro root directory.
    exit /b 1
)

echo ✅ Verified NeonPro project structure

rem Clean any existing build artifacts
echo 🧹 Cleaning build artifacts...
if exist "apps\web\.next" rmdir /s /q "apps\web\.next"
if exist "apps\web\.turbo" rmdir /s /q "apps\web\.turbo"
if exist ".turbo" rmdir /s /q ".turbo"

rem Install dependencies
echo 📦 Installing dependencies...
pnpm install --frozen-lockfile --production=false

rem Build workspace packages first
echo 🔨 Building workspace packages...
pnpm run build --filter=!@neonpro/web

rem Build the web application
echo 🌐 Building web application...
cd apps\web
pnpm run build

echo ✅ NeonPro build completed successfully!