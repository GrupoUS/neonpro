# 🚀 Guia de Deploy - NeonPro Healthcare

## Vercel Deploy (Recomendado)

### 1. Preparação

```bash
# Certifique-se que o build está funcionando
npm run build

# Verifique se não há erros de lint
npm run lint
```

### 2. Configuração Vercel

1. **Conectar Repositório**
   - Acesse [vercel.com](https://vercel.com)
   - Import Git Repository
   - Selecione o repositório NeonPro

2. **Configurações de Build**
   ```
   Framework: Next.js
   Root Directory: apps/neonpro-web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Variáveis de Ambiente**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   NEXTAUTH_SECRET=sua-chave-secreta
   NEXTAUTH_URL=https://seu-dominio.vercel.app
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   SENTRY_DSN=https://...
   ```

### 3. Deploy

```bash
# Via Vercel CLI (opcional)
npm i -g vercel
vercel login
vercel --prod
```

## 🏥 Configurações Healthcare

### LGPD/ANVISA Compliance

```env
LGPD_AUDIT_ENABLED=true
ANVISA_COMPLIANCE_MODE=true
HEALTHCARE_AUDIT_RETENTION_DAYS=2555  # 7 anos
```

### Rate Limiting

```env
API_RATE_LIMIT=100  # requests por minuto
PATIENT_PORTAL_RATE_LIMIT=50
```

## 📊 Monitoramento

### 1. Vercel Analytics
- Habilitado automaticamente no deploy
- Dashboard: https://vercel.com/analytics

### 2. Error Tracking (Sentry)
```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

### 3. Uptime Monitoring
- Configure webhooks para falhas
- Monitor APIs críticas

## 🔐 Segurança

### Headers de Segurança
Já configurados no `next.config.js`:
- HSTS
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options

### Certificados SSL
- Automático via Vercel
- Renovação automática

## 🚨 Troubleshooting

### Build Falha
```bash
# Limpar cache
npm run clean
rm -rf node_modules
npm install

# Verificar tipos
npm run type-check
```

### Erros de Deploy
1. Verifique variáveis de ambiente
2. Confira logs no Vercel Dashboard
3. Teste build local

### Performance Issues
1. Analise bundle size
2. Otimize imagens
3. Configure cache headers

## 📈 Post-Deploy

### 1. Testes de Produção
- [ ] Login/Logout funciona
- [ ] APIs respondem corretamente
- [ ] Portal do paciente acessível
- [ ] Relatórios carregam
- [ ] Compliance logs ativos

### 2. Monitoramento
- [ ] Configurar alertas
- [ ] Verificar métricas
- [ ] Testar backup/restore

### 3. DNS (Domínio Customizado)
```
# Configurar no Vercel
Domain: neonpro.com.br
CNAME: cname.vercel-dns.com
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Opcional)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - uses: amondnet/vercel-action@v20
```

## ✅ Checklist Final

- [ ] Build local OK (~26s)
- [ ] Variáveis de ambiente configuradas
- [ ] SSL ativo
- [ ] Monitoramento configurado
- [ ] Backup configurado
- [ ] Compliance logs ativos
- [ ] Performance otimizada
- [ ] Testes de produção OK