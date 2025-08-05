@echo off
echo Configurando variaveis de ambiente no Vercel...
cd /d "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"

REM Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo https://ownkoxryswokcdanrdgj.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E

REM Database URLs
vercel env add DATABASE_URL production
echo postgresql://postgres.ownkoxryswokcdanrdgj:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

vercel env add DIRECT_URL production  
echo postgresql://postgres.ownkoxryswokcdanrdgj:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

REM Clerk Configuration
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo pk_test_ZmFpci1kYW5lLTk1LmNsZXJrLmFjY291bnRzLmRldiQ

vercel env add CLERK_SECRET_KEY production  
echo sk_test_lj93jhP4QVIuD01pn2YffWBuuEq6Cp8zlxbaUnbvI9

REM NextAuth Configuration  
vercel env add NEXTAUTH_SECRET production
echo your-nextauth-secret-key-32-chars-long

vercel env add NEXTAUTH_URL production
echo https://neonpro-healthcare.vercel.app

REM Healthcare Compliance
vercel env add HEALTHCARE_MODE production
echo true

vercel env add LGPD_COMPLIANCE production  
echo true

vercel env add ANVISA_COMPLIANCE production
echo true

REM Environment Settings
vercel env add NODE_ENV production
echo production

vercel env add NEXT_TELEMETRY_DISABLED production
echo 1

echo Configuracao concluida!
pause