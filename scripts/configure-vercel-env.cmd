@echo off
echo 🏥 NeonPro Healthcare - Configuração Automática de Environment Variables
echo =====================================================================

cd /d "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"

echo.
echo 🔧 Configurando DATABASE URLs...
vercel env add DATABASE_URL "postgresql://postgres.ownkoxryswokcdanrdgj:Drwolf00$$@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" production
vercel env add DIRECT_URL "postgresql://postgres.ownkoxryswokcdanrdgj:Drwolf00$$@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" production

echo.
echo 🗃️ Configurando SUPABASE...
vercel env add NEXT_PUBLIC_SUPABASE_URL "https://ownkoxryswokcdanrdgj.supabase.co" production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E" production
vercel env add SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMzYwOSwiZXhwIjoyMDY4ODc5NjA5fQ.FN_lcEIVq0xJ7W2YfIwXoprS9x7WqCRl2Q3Cn-wYfTs" production

echo.
echo 🔐 Configurando CLERK Authentication...
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "pk_test_ZmFpci1kYW5lLTk1LmNsZXJrLmFjY291bnRzLmRldiQ" production
vercel env add CLERK_SECRET_KEY "sk_test_lj93jhP4QVIuD01pn2YffWBuuEq6Cp8zlxbaUnbvI9" production

echo.
echo ⚙️ Configurando ENVIRONMENT Settings...
vercel env add NODE_ENV "production" production
vercel env add NEXT_TELEMETRY_DISABLED "1" production
vercel env add SKIP_ENV_VALIDATION "true" production

echo.
echo 🏥 Configurando HEALTHCARE Compliance...
vercel env add HEALTHCARE_MODE "true" production
vercel env add LGPD_COMPLIANCE "true" production
vercel env add ANVISA_COMPLIANCE "true" production
vercel env add LGPD_RETENTION_YEARS "7" production
vercel env add ANVISA_AUDIT_ENABLED "true" production

echo.
echo 🔒 Configurando SECURITY...
vercel env add NEXTAUTH_SECRET "neonpro-healthcare-super-secure-secret-2025" production
vercel env add NEXTAUTH_URL "https://neonpro-5rm1a956f-grupous-projects.vercel.app" production
vercel env add HEALTHCARE_ENCRYPTION_KEY "healthcare-encrypt-key-2025-secure" production
vercel env add JWT_SECRET "jwt-secret-neonpro-healthcare-2025" production

echo.
echo 🔧 Configurando PRISMA...
vercel env add PRISMA_GENERATE_SKIP_AUTOINSTALL "true" production
vercel env add PRISMA_CLI_BINARY_TARGETS "rhel-openssl-1.0.x,linux-musl" production
vercel env add SKIP_PRISMA_GENERATE_ON_VERCEL "false" production

echo.
echo ✅ Configuração completa! Environment Variables configuradas no Vercel.
echo 🚀 Próximo passo: Deploy para produção
pause