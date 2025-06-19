# 🚀 Guia de Deploy NEONPRO - Vercel

Este guia te ajudará a fazer o deploy do projeto NEONPRO no Vercel de forma rápida e segura.

## 📋 Pré-requisitos

### ✅ Verificações Necessárias
- [ ] Node.js 18+ instalado
- [ ] NPM ou Yarn configurado
- [ ] Conta no Vercel (https://vercel.com)
- [ ] Conta no Supabase (para banco de dados)
- [ ] Projeto NEONPRO funcionando localmente

### 🔧 Dependências
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Verificar instalação
vercel --version
```

## 🚀 Métodos de Deploy

### Método 1: Deploy Automatizado (Recomendado)

```bash
# Navegar para o diretório do projeto
cd @project-core/projects/neonpro

# Executar script de deploy (preview)
node scripts/deploy-vercel.js

# Ou para produção
node scripts/deploy-vercel.js --prod
```

### Método 2: Deploy Manual

```bash
# 1. Fazer login no Vercel
vercel login

# 2. Navegar para o projeto
cd @project-core/projects/neonpro

# 3. Deploy preview
vercel

# 4. Deploy produção
vercel --prod
```

### Método 3: Deploy via GitHub (Recomendado para CI/CD)

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "feat: prepare for vercel deployment"
   git push origin main
   ```

2. **Conectar no Vercel Dashboard**:
   - Acesse https://vercel.com/dashboard
   - Clique em "New Project"
   - Importe do GitHub
   - Selecione o repositório NEONPRO

## ⚙️ Configuração de Variáveis de Ambiente

### 🔐 Variáveis Obrigatórias

No Vercel Dashboard, configure estas variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Aplicação
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key

# Produção
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 📝 Como Configurar no Vercel

1. Acesse o projeto no Vercel Dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - **Name**: Nome da variável
   - **Value**: Valor da variável
   - **Environment**: Production, Preview, Development

## 🔧 Configurações Específicas

### 📁 Estrutura de Deploy
```
neonpro/
├── .next/                 # Build output
├── public/               # Assets estáticos
├── src/                  # Código fonte
├── vercel.json          # Configuração Vercel
├── next.config.ts       # Configuração Next.js
└── package.json         # Dependências
```

### 🛠️ Build Settings no Vercel

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Development Command**: `npm run dev`

## 🧪 Validação Pós-Deploy

### ✅ Checklist de Verificação

1. **Acesso Básico**:
   - [ ] Site carrega sem erros
   - [ ] Página de login funciona
   - [ ] Dashboard é acessível

2. **Funcionalidades**:
   - [ ] Autenticação Supabase
   - [ ] Navegação entre páginas
   - [ ] Responsividade mobile

3. **Performance**:
   - [ ] Lighthouse Score > 90
   - [ ] Tempo de carregamento < 3s
   - [ ] Core Web Vitals OK

4. **SEO e Acessibilidade**:
   - [ ] Meta tags corretas
   - [ ] ARIA labels funcionando
   - [ ] Navegação por teclado

### 🔍 URLs para Testar

```
https://your-domain.vercel.app/
https://your-domain.vercel.app/login
https://your-domain.vercel.app/dashboard
https://your-domain.vercel.app/dashboard/patients
https://your-domain.vercel.app/dashboard/appointments
```

## 🚨 Troubleshooting

### ❌ Problemas Comuns

**Build Error: "Module not found"**
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variables não funcionam**
- Verifique se começam com `NEXT_PUBLIC_` para client-side
- Redeploy após adicionar variáveis
- Verifique se estão na environment correta

**Supabase Connection Error**
- Verifique URLs e keys no Supabase Dashboard
- Confirme se RLS está configurado corretamente
- Teste conexão localmente primeiro

**404 em rotas dinâmicas**
- Verifique se `vercel.json` está configurado
- Confirme estrutura de pastas em `src/app/`

### 🔧 Comandos de Debug

```bash
# Verificar build local
npm run build
npm run start

# Verificar logs Vercel
vercel logs your-deployment-url

# Testar produção localmente
vercel dev
```

## 📊 Monitoramento

### 📈 Analytics Recomendados

1. **Vercel Analytics**: Habilitado automaticamente
2. **Google Analytics**: Configure `NEXT_PUBLIC_GA_ID`
3. **Sentry**: Para error tracking
4. **Hotjar**: Para user behavior

### 🔔 Alertas

Configure alertas para:
- Erros de build
- Downtime
- Performance degradation
- Quota limits

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Domínio Personalizado**:
   - Configure DNS
   - Adicione domínio no Vercel
   - Configure SSL

2. **CI/CD**:
   - Configure GitHub Actions
   - Testes automatizados
   - Deploy automático

3. **Monitoramento**:
   - Configure Sentry
   - Setup analytics
   - Configure alertas

4. **Performance**:
   - Otimize imagens
   - Configure CDN
   - Implement caching

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**🎉 Boa sorte com seu deploy!**
