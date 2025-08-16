@echo off
echo.
echo 🔐 TESTE DE AUTENTICACAO GIT/GITHUB - NEONPRO
echo ================================================
echo.
echo 📁 Navegando para diretório do projeto...
cd /d E:\neonpro
echo ✅ Diretório atual: %CD%
echo.
echo 🔍 Verificando configuração Git...
git config --list | findstr credential
echo.
echo 🌐 Verificando remote origin...
git remote -v
echo.
echo 🚀 Testando autenticação com git push...
echo ⚠️  ATENÇÃO: Quando solicitar credenciais:
echo    - Username: Seu username do GitHub
echo    - Password: Cole o Personal Access Token (NÃO a senha!)
echo.
pause
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCESSO! Autenticação funcionando corretamente!
) else (
    echo ❌ ERRO: Verifique se o token foi criado e colado corretamente
)
echo.
pause