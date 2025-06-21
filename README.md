# NeonPro - SaaS Application

## 🚀 Sobre o Projeto

NeonPro é uma aplicação SaaS completa e independente, pronta para deploy.

## 📦 Estrutura do Projeto

Este projeto contém todos os arquivos necessários para funcionar independentemente:

```
neonpro/
├── app/              # Next.js App Router
├── components/       # Componentes React
│   └── ui/          # Componentes UI (shadcn/ui)
├── lib/             # Utilitários e configurações
├── public/          # Arquivos públicos
├── styles/          # Estilos globais
├── .env.example     # Template de variáveis de ambiente
├── .gitignore       # Arquivos ignorados pelo Git
├── next.config.mjs  # Configuração Next.js
├── package.json     # Dependências e scripts
├── tailwind.config.ts # Configuração Tailwind
└── tsconfig.json    # Configuração TypeScript
```

## 🛠️ Tecnologias

- **Framework**: Next.js 15.2.4
- **UI**: TailwindCSS + shadcn/ui
- **Database**: Supabase
- **Payments**: Stripe
- **Language**: TypeScript
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## 🚀 Deploy

### 1. Preparação

```bash
# Clone apenas este projeto
git clone https://github.com/seu-usuario/neonpro.git
cd neonpro

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 2. Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 3. Deploy no Vercel

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel

# Ou conecte ao GitHub e faça deploy automático
```

### 4. Deploy Manual

```bash
# Build para produção
npm run build

# Teste localmente
npm run start

# Deploy em qualquer serviço que suporte Node.js
```

## 📝 Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev

# Verificar tipos
npm run type-check

# Lint
npm run lint
```

## 🔧 Configuração do Banco de Dados

1. Crie um projeto no Supabase
2. Execute as migrations em `supabase/migrations`
3. Configure as políticas RLS
4. Adicione as credenciais ao `.env.local`

## 🎨 Customização

- **Cores**: Edite `app/globals.css`
- **Componentes**: Modifique arquivos em `components/ui`
- **Layout**: Ajuste `app/layout.tsx`

## 📄 Licença

Este projeto é independente e pronto para uso comercial.

---

**Nota**: Este projeto é completamente independente e não possui dependências externas além das listadas no `package.json`.