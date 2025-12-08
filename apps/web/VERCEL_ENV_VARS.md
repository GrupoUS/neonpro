# Variáveis de Ambiente do Vercel - NeonPro

## ⚠️ IMPORTANTE: Configurar no Dashboard do Vercel

As variáveis de ambiente abaixo devem ser configuradas no **Vercel Dashboard** em:
`Settings > Environment Variables`

### Variáveis Obrigatórias para Produção:

```bash
# Supabase Production
VITE_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjIyODgsImV4cCI6MjA0ODczODI4OH0.VYb_AQWYvVi_JRe0kRXFHp7LpvJQQWZLRv5LjKLVAac

# API Production
VITE_API_URL=https://neonpro.vercel.app/api

# Environment
NODE_ENV=production
VITE_APP_ENV=production
```

## 🔧 Como Configurar no Vercel

### Via CLI (Recomendado):
```bash
vercel env add VITE_SUPABASE_URL production
# Cole o valor: https://ownkoxryswokcdanrdgj.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole o valor da chave anon

vercel env add VITE_API_URL production
# Cole: https://neonpro.vercel.app/api

vercel env add VITE_APP_ENV production
# Cole: production
```

### Via Dashboard:
1. Acesse: https://vercel.com/[seu-usuario]/neonpro/settings/environment-variables
2. Clique em "Add New"
3. Adicione cada variável acima
4. Selecione "Production" como environment
5. Salve e faça redeploy

## ✅ Verificação

Após configurar, force um novo deploy:
```bash
git commit --allow-empty -m "trigger: redeploy with env vars"
git push origin main
```

Ou use a CLI:
```bash
vercel --prod
```

## 🐛 Troubleshooting

Se ainda houver tela branca:
1. Verifique os logs do build no Vercel
2. Confirme que as variáveis estão configuradas
3. Verifique o console do browser (F12) para erros
