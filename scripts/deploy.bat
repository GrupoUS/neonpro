@echo off
REM NeonPro Healthcare - Deploy Script (Windows)

echo 🏥 NeonPro Healthcare - Deploy Script
echo ====================================

REM 1. Verificações pré-deploy
echo 🔍 Executando verificações pré-deploy...

REM Build local
echo 📦 Testando build local...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build falhou!
    exit /b 1
)

REM Linting
echo 🔍 Verificando código...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Lint falhou!
    exit /b 1
)

echo ✅ Todas as verificações passaram!

REM 2. Deploy
echo 🚀 Iniciando deploy...

where vercel >nul 2>nul
if %errorlevel% equ 0 (
    echo 📤 Fazendo deploy via Vercel CLI...
    call vercel --prod
) else (
    echo ⚠️ Vercel CLI não encontrada.
    echo 📋 Push para main branch para deploy automático ou:
    echo    npm install -g vercel
    echo    vercel login
    echo    vercel --prod
)

echo ✅ Deploy concluído!
echo 📊 Acesse: https://vercel.com/dashboard para monitorar
pause