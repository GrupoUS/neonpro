# NeonPro Healthcare API - Deployment Guide

## 🏥 Brazilian Healthcare Compliance Ready

Este guia descreve o deployment da NeonPro Healthcare API com compliance LGPD e ANVISA usando Vercel, Biome e metodologia BMAD.

## 🚀 Deployment Platforms

### Vercel (Recomendado)
- **Preview**: Automático em Pull Requests  
- **Staging**: `https://api-staging.neonpro.health` (branch `develop`)
- **Production**: `https://api.neonpro.health` (branch `main`)

## 📋 Pré-requisitos

### Variáveis de Ambiente Obrigatórias
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_KEY=your_service_key

# Cache & Jobs
REDIS_URL=your_redis_url

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Healthcare Compliance
LGPD_AUDIT_WEBHOOK=your_lgpd_webhook
ANVISA_API_KEY=your_anvisa_key

# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## 🔧 Configuração Local

### 1. Instalar Dependências
```bash
cd neonpro/apps/neonpro-api
pnpm install
```

### 2. Configurar Biome (já configurado)
```bash
# Verificar qualidade do código
pnpm biome check ./src

# Corrigir automaticamente
pnpm biome check --write ./src
```

### 3. Executar Testes de Compliance
```bash
# Testes específicos para healthcare
pnpm test:healthcare
pnpm test:lgpd
pnpm test:anvisa
```

### 4. Validar Deployment Local
```bash
# Executar validação completa
node scripts/validate-deployment.js preview
```

## 🎯 Processo de Deployment

### Automático via GitHub Actions

#### Pull Request → Preview
1. Abrir PR para `main` ou `develop`
2. GitHub Actions executa:
   - ✅ Biome code quality check
   - ✅ TypeScript validation
   - ✅ Healthcare compliance tests
   - ✅ Deploy preview no Vercel
   - ✅ Validation script
3. URL de preview comentada no PR

#### Develop → Staging
1. Merge para branch `develop`
2. Deploy automático para staging
3. Testes de integração completos
4. Validation script executado

#### Main → Production
1. Merge para branch `main`
2. Deploy com blue-green strategy
3. Health checks abrangentes
4. Notification no Slack

### Manual via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

## 🏥 Healthcare Compliance Checks

### LGPD (Lei Geral de Proteção de Dados)
- ✅ Data sanitization automática
- ✅ Consent management
- ✅ Data retention policies
- ✅ Audit trails

### ANVISA (Agência Nacional de Vigilância Sanitária)
- ✅ Medical device validation
- ✅ Healthcare data compliance
- ✅ Audit logging
- ✅ Medical record security

### BMAD Methodology
- **B**usiness: Regras de negócio validadas
- **M**edical: Validações médicas implementadas
- **A**NVISA: Compliance ANVISA ativo
- **D**ata: Proteção de dados LGPD

## 📊 Monitoring & Health Checks

### Endpoints de Saúde
- `/health` - Status geral da API
- `/health/db` - Status database
- `/health/redis` - Status cache
- `/health/jobs` - Status job queue
- `/metrics` - Métricas Prometheus

### Healthcare Compliance Endpoints
- `/api/v3/compliance/lgpd/status`
- `/api/v3/compliance/anvisa/status`
- `/api/version/stats`

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Build Failures
```bash
# Verificar tipagem TypeScript
pnpm type-check

# Corrigir com Biome
pnpm biome check --write ./src
```

#### 2. Health Check Failures
```bash
# Testar localmente
curl https://your-deployment-url/health

# Verificar logs
vercel logs your-deployment-url
```

#### 3. Compliance Issues
```bash
# Executar testes de compliance
pnpm test:compliance

# Validar LGPD
pnpm test:lgpd

# Validar ANVISA
pnpm test:anvisa
```

### Logs e Debugging

```bash
# Vercel logs em tempo real
vercel logs --follow

# Logs específicos por função
vercel logs --function=api

# Logs por ambiente
vercel logs --environment=production
```

## 🎯 Performance Optimization

### Vercel Specific
- ✅ Function regions: `gru1` (Brazil), `iad1` (US East)
- ✅ Max duration: 30s para cálculos médicos complexos
- ✅ Body limit: 10MB para uploads médicos
- ✅ Response limit: 50MB para relatórios médicos

### Caching Strategy
- ✅ API v3: cache 10s (dados dinâmicos)
- ✅ API v2: cache 30s (compatibilidade)
- ✅ API v1: cache 60s (deprecated)
- ✅ Health checks: no-cache

## 🔒 Security Features

### Headers de Segurança Healthcare
```
X-Healthcare-Compliance: LGPD,ANVISA
X-BMAD-Methodology: active
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### CORS Healthcare
- Permitido apenas para domínios `*.neonpro.health`
- Headers específicos para healthcare APIs
- Credentials support para sessões médicas

## 📈 Success Metrics

### Deployment Success Criteria
- ✅ 95%+ health check success rate
- ✅ Response time < 2s (95th percentile)
- ✅ Zero critical security vulnerabilities
- ✅ 100% healthcare compliance tests passing
- ✅ LGPD audit trail functional
- ✅ ANVISA validation active

### Monitoring Alerts
- Response time > 5s
- Error rate > 1%
- Health check failures
- LGPD compliance violations
- ANVISA validation failures

## 🆘 Emergency Procedures

### Rollback Production
```bash
# Via GitHub Actions (automático em falhas)
# Ou manual via Vercel
vercel rollback your-production-url
```

### Emergency Hotfix
1. Branch `hotfix/emergency-fix` de `main`
2. Implementar fix mínimo
3. Tests obrigatórios
4. Deploy direto para production
5. Merge back para `develop`

## 📞 Suporte

- **GitHub Issues**: Para bugs e features
- **Slack**: `#neonpro-api` para suporte urgente
- **Email**: api-support@neonpro.health
- **Compliance**: compliance@neonpro.health

---

**Status**: ✅ Production Ready com Healthcare Compliance LGPD/ANVISA
**Última Atualização**: Janeiro 2024
**Próxima Revisão**: Fevereiro 2024