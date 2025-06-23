# 🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - NEONPRO

## 1. Criar arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# ========================================
# SUPABASE CONFIGURATION
# ========================================
# Obtenha estes valores em: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic

# ========================================
# APPLICATION CONFIGURATION
# ========================================
# URL da sua aplicação em produção (sem trailing slash)
# Substitua pelo seu domínio real no Vercel
NEXT_PUBLIC_APP_URL=https://seu-projeto-neonpro.vercel.app
```

## 2. Configurar no Vercel

No [Vercel Dashboard](https://vercel.com/dashboard):

1. Vá para seu projeto
2. Settings → Environment Variables
3. Adicione cada variável acima
4. Marque todas as opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## 3. Verificar Configuração

Execute o script de verificação:

```bash
node scripts/verify-oauth-config.js
```

## ⚠️ IMPORTANTE

- **NUNCA** faça commit do arquivo `.env.local`
- O arquivo `.gitignore` já está configurado para ignorá-lo
- Use valores diferentes para desenvolvimento e produção se necessário
- Após alterar variáveis no Vercel, faça um novo deploy
