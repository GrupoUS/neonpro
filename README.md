# NeonPro Healthcare Platform

## 🏥 Plataforma SaaS de Gestão Hospitalar Modernizada

### 📋 Stack Tecnológica

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase + tRPC
- **Database**: PostgreSQL (Supabase)
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

### 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone <repo-url>
cd neonpro

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute em desenvolvimento
npm run dev

# 5. Execute o build
npm run build
```

### 📁 Estrutura do Projeto

```
neonpro/
├── apps/
│   └── neonpro-web/          # Aplicação Next.js principal
├── packages/
│   ├── config/               # Configurações compartilhadas
│   ├── types/                # Tipos TypeScript
│   ├── ui/                   # Componentes UI
│   └── utils/                # Utilitários
├── turbo.json                # Configuração Turborepo
└── vercel.json              # Configuração de deploy
```

### 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção (~26s)
npm run lint         # Linting
npm run type-check   # Verificação de tipos
npm run clean        # Limpeza
```

### 🏥 Recursos Healthcare

- ✅ Compliance LGPD/ANVISA
- ✅ Gestão de Pacientes
- ✅ Portal do Paciente
- ✅ Sistema de Comunicação
- ✅ Relatórios e Analytics
- ✅ Forecasting de Demanda
- ✅ Auditoria e Logs

### 🚀 Deploy

#### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

#### Configuração de Variáveis

No painel da Vercel, adicione:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 📊 Performance

- **Build Time**: ~26s (85% melhoria vs. anterior)
- **Bundle Size**: Otimizado com Tree Shaking
- **Cache**: Turborepo cache habilitado
- **Edge**: Deploy global via Vercel Edge

### 🔐 Segurança

- Autenticação via NextAuth.js
- RLS (Row Level Security) no Supabase
- Sanitização de dados
- Rate limiting
- Logs de auditoria

### 📈 Monitoramento

- Vercel Analytics
- Sentry para error tracking
- Custom healthcare metrics
- LGPD compliance tracking

### 🛠️ Desenvolvimento

#### Adicionando Nova Feature

```bash
# 1. Crie branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolva
npm run dev

# 3. Teste
npm run build
npm run lint

# 4. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
```

#### tRPC APIs

Migração gradual de REST para tRPC:
- `/api-legacy/` - APIs REST existentes
- `/api/trpc/` - Novas APIs tRPC

### 📞 Suporte

Para dúvidas ou suporte:
- Documentação: `/docs`
- Issues: GitHub Issues
- Healthcare Compliance: Consulte `/docs/compliance`