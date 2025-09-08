@echo off
echo ========================================
echo 🚀 NeonPro - Setup Automatizado
echo ========================================
echo.

echo 📦 Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo 🗄️ Executando migrações do Prisma...
pnpm dlx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Erro ao executar migrações
    pause
    exit /b 1
)

echo.
echo 🔧 Gerando cliente Prisma...
pnpm dlx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar cliente Prisma
    pause
    exit /b 1
)

echo.
echo 🌱 Executando seed do banco de dados...
pnpm dlx prisma db seed
if %errorlevel% neq 0 (
    echo ⚠️ Aviso: Seed não executado (normal se não configurado)
)

echo.
echo ✅ Setup concluído com sucesso!
echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo 📱 Acesse: http://localhost:3000
echo 🏢 Tenants: http://localhost:3000/tenants
echo 🔌 API: http://localhost:3000/api/tenants
echo.
npm run dev