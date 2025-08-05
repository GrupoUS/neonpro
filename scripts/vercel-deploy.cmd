@echo off
echo ========================================
echo NEONPRO HEALTHCARE - VERCEL DEPLOYMENT
echo ========================================
echo.

REM Verificar se esta logado
echo [1/6] Verificando autenticacao no Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NAO LOGADO - Fazendo login...
    echo.
    echo 🔐 AGUARDE: O navegador vai abrir para login
    echo    1. Faca login com sua conta GitHub/Google/Email
    echo    2. Autorize o Vercel CLI
    echo    3. Volte para este terminal
    echo.
    pause
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ Falha no login. Tente manualmente: vercel login
        pause
        exit /b 1
    )
) else (
    echo ✅ Ja logado no Vercel
)

echo.
echo [2/6] Iniciando deploy inicial...
cd /d "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"
echo.
echo 📝 CONFIGURACOES DO PROJETO:
echo    - Project Name: neonpro-healthcare
echo    - Directory: apps/neonpro-web  
echo    - Framework: Next.js (auto-detect)
echo    - Build Command: prisma generate ^&^& next build
echo.
pause
vercel
if %errorlevel% neq 0 (
    echo ❌ Falha no deploy inicial
    pause
    exit /b 1
)

echo.
echo [3/6] ✅ Deploy inicial concluido!
echo.
echo 🔧 PROXIMO PASSO - CONFIGURAR VARIAVEIS DE AMBIENTE:
echo    1. Abra: https://vercel.com/dashboard
echo    2. Va para: Project Settings → Environment Variables
echo    3. Adicione todas as variaveis do arquivo .env.vercel
echo.
echo 📋 Variaveis principais a configurar:
echo    - DATABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_URL  
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - SUPABASE_SERVICE_ROLE_KEY
echo    - CLERK keys
echo.
echo Pressione qualquer tecla quando terminar de configurar...
pause

echo.
echo [4/6] Fazendo deploy para producao...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Falha no deploy de producao
    pause
    exit /b 1
)

echo.
echo [5/6] ✅ Deploy de producao concluido!
echo.
echo [6/6] Testando endpoints...
echo Digite a URL do seu app (ex: https://neonpro-healthcare.vercel.app):
set /p APP_URL=

echo.
echo 🧪 Testando health check...
curl -s "%APP_URL%/api/health" | echo.
echo.
echo 🧪 Testando readiness check...  
curl -s "%APP_URL%/api/ready" | echo.
echo.

echo ========================================
echo 🎉 DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Verificar se todos os endpoints estao funcionando
echo 2. Testar login/cadastro de usuarios
echo 3. Validar operacoes CRUD de pacientes
echo 4. Monitorar metricas no Vercel Dashboard
echo.
echo URL da aplicacao: %APP_URL%
echo Vercel Dashboard: https://vercel.com/dashboard
echo.
pause