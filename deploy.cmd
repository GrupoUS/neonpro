@echo off
echo Iniciando deploy do NeonPro Healthcare...
echo.

echo Verificando login...
vercel whoami
if %errorlevel% neq 0 (
    echo Erro: Usuario nao logado no Vercel
    pause
    exit /b 1
)

echo.
echo Executando deploy...
vercel deploy --yes --debug