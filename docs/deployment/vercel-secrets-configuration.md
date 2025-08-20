# 🔐 Configuração de Secrets Vercel para CI/CD

## 📋 **Informações Necessárias**

### **IDs Identificados:**
- **TEAM_ID**: `team_bjVDLqo42Gb3p28RelxJia6x`
- **PROJECT_ID**: `prj_64FCmux5AJquGaiteZ0h8tbV55iB` (neonpro - projeto principal)
- **ORG_ID**: `team_bjVDLqo42Gb3p28RelxJia6x` (mesmo que TEAM_ID)

### **Projetos Disponíveis:**
1. **neonpro** (principal) - `prj_64FCmux5AJquGaiteZ0h8tbV55iB`
2. neonpro-web - `prj_lW9YOQziRnZD1zFRtjKT3Ng2Hd1M`
3. neonpro-healthcare-web - `prj_JlARdIFLUDHsHCLkUGbDrwoPz1h4`
4. neonpro-healthcare - `prj_llrXCnVArFK02mUnQOiwbDO27Q6c`

---

## 🛠️ **Configuração GitHub Secrets**

### **Passo 1: Gerar VERCEL_TOKEN**

1. Acesse [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)
2. Clique em "Create Token"
3. Nome: `GitHub Actions CI/CD - NeonPro`
4. Scope: Full Account
5. Expiration: No Expiration (ou 1 ano)
6. Copie o token gerado

### **Passo 2: Adicionar Secrets no GitHub**

Acesse: `https://github.com/[seu-usuario]/neonpro/settings/secrets/actions`

Adicione os seguintes secrets:

```bash
# Vercel Authentication
VERCEL_TOKEN=<token-gerado-no-passo-1>

# Project Configuration  
VERCEL_ORG_ID=team_bjVDLqo42Gb3p28RelxJia6x
VERCEL_PROJECT_ID=prj_64FCmux5AJquGaiteZ0h8tbV55iB

# Additional Configuration (opcional)
VERCEL_TEAM_ID=team_bjVDLqo42Gb3p28RelxJia6x
```

### **Passo 3: Verificar Configuração**

Adicione este workflow temporário para testar:

```yaml
# .github/workflows/vercel-config-test.yml
name: 🔐 Test Vercel Configuration

on:
  workflow_dispatch:

jobs:
  test-vercel-config:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Test Vercel CLI
        run: |
          npm i -g vercel
          echo "VERCEL_ORG_ID=${{ secrets.VERCEL_ORG_ID }}" >> $GITHUB_ENV
          echo "VERCEL_PROJECT_ID=${{ secrets.VERCEL_PROJECT_ID }}" >> $GITHUB_ENV
          vercel --token ${{ secrets.VERCEL_TOKEN }} --confirm
          echo "✅ Vercel configuration successful!"
```

---

## 🚀 **Atualização dos Workflows Existentes**

### **1. Atualizar neonpro-optimized.yml**

Adicione no job de deploy:

```yaml
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

- name: Deploy to Vercel
  run: |
    npm i -g vercel
    vercel --token ${{ secrets.VERCEL_TOKEN }} --prod --confirm
```

### **2. Atualizar pr-validation-fast.yml**

Adicione deploy de preview:

```yaml
- name: Deploy Preview
  if: github.event_name == 'pull_request'
  run: |
    npm i -g vercel
    vercel --token ${{ secrets.VERCEL_TOKEN }} --confirm
    echo "Preview deployment ready!"
```

---

## ✅ **Checklist de Configuração**

- [ ] **VERCEL_TOKEN** gerado e adicionado aos secrets
- [ ] **VERCEL_ORG_ID** configurado: `team_bjVDLqo42Gb3p28RelxJia6x`
- [ ] **VERCEL_PROJECT_ID** configurado: `prj_64FCmux5AJquGaiteZ0h8tbV55iB`
- [ ] Workflows atualizados com variáveis de ambiente
- [ ] Teste manual executado com sucesso
- [ ] Deploy automático funcionando

---

## 🎯 **Próximos Passos**

1. **Configurar Environment Variables no Vercel**:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET

2. **Configurar Custom Domains** (se necessário)

3. **Configurar Branch Protection Rules** para main

4. **Testar Full CI/CD Pipeline**

---

## 📊 **Monitoramento**

Após configuração, monitorar:
- ✅ Deploy automático no push para main
- ✅ Preview deployments em PRs  
- ✅ Performance de deployment (<5min)
- ✅ Logs de erro no Vercel Dashboard

**URL Principal**: https://neonpro-grupous-projects.vercel.app