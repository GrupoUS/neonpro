# Variáveis de Ambiente - NeonPro

## Configuração Local (.env.local)

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase - OBRIGATÓRIO
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic

# Site URL - OBRIGATÓRIO
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Para produção, mude para:
# NEXT_PUBLIC_SITE_URL=https://neonpro.vercel.app
```

## Configuração no Vercel

No dashboard do Vercel (neonpro.vercel.app), adicione as mesmas variáveis:

1. Vá para **Settings** > **Environment Variables**
2. Adicione cada variável:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://neonpro.vercel.app`

3. Marque as variáveis para todos os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Variáveis Opcionais

### Stripe (para pagamentos)

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email (Resend)

```bash
RESEND_API_KEY=re_...
```

### Cache (Upstash Redis)

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Verificação

Execute o script de verificação:

```bash
pnpm tsx scripts/verify-supabase-config.ts
```

Este script irá:

- ✅ Verificar se as variáveis estão definidas
- ✅ Testar a conexão com o Supabase
- ✅ Listar todas as URLs necessárias
- ✅ Fornecer links diretos para configuração
