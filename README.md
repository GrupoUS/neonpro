# 🌟 NeonPro - Sistema de Gestão para Clínicas Estéticas

Sistema completo e moderno para gestão de clínicas de estética e beleza, desenvolvido com Next.js 15, TypeScript, Supabase e Tailwind CSS.

## ✨ Funcionalidades Principais

### 📋 Gestão de Serviços

- ✅ CRUD completo de serviços
- ✅ Categorização por especialidades
- ✅ Configuração de duração e preços
- ✅ Status ativo/inativo
- ✅ Histórico de agendamentos por serviço

### 👥 Gestão de Profissionais

- ✅ Cadastro completo da equipe
- ✅ Especialidades e comissões
- ✅ Horários de trabalho
- ✅ Agenda individual
- ✅ Performance e estatísticas

### ⚙️ Configurações da Clínica

- ✅ Informações básicas da clínica
- ✅ Configurações de agendamento
- ✅ Horários de funcionamento
- ✅ Políticas de cancelamento

### 📱 WhatsApp Business Integration

- ✅ Envio automático de lembretes
- ✅ Confirmações de agendamento
- ✅ Notificações de cancelamento
- ✅ Templates personalizáveis
- ✅ Teste de conexão

### 📱 PWA (Progressive Web App)

- ✅ Instalação como app nativo
- ✅ Funcionamento offline
- ✅ Sincronização em background
- ✅ Notificações push
- ✅ Cache inteligente

### 🧪 Testes Automatizados

- ✅ Testes unitários com Jest
- ✅ Testes de componentes com Testing Library
- ✅ Cobertura de código
- ✅ Testes de integração

## 📦 Estrutura do Projeto

Este projeto contém todos os arquivos necessários para funcionar independentemente:

\`\`\`
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
\`\`\`

## 🚀 Tecnologias Utilizadas

### Frontend

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend

- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

### Testes

- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes
- **Playwright** - Testes E2E

### PWA

- **Service Worker** - Cache e offline
- **Web App Manifest** - Instalação
- **Background Sync** - Sincronização

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório

\`\`\`bash
git clone https://github.com/seu-usuario/neonpro.git
cd neonpro
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

### 3. Configure as variáveis de ambiente

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edite o arquivo `.env.local` com suas configurações:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
\`\`\`

### 4. Configure o banco de dados

Execute as migrações do Supabase:

\`\`\`bash
npm run db:migrate
\`\`\`

### 5. Execute o projeto

\`\`\`bash
npm run dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Executando Testes

### Testes unitários

\`\`\`bash
# Executar todos os testes
npm run test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
\`\`\`

### Testes E2E

\`\`\`bash
# Executar testes E2E
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui
\`\`\`

## 📱 PWA - Progressive Web App

O NeonPro é um PWA completo que pode ser instalado como um aplicativo nativo:

### Funcionalidades PWA

- **Instalação**: Pode ser instalado em dispositivos móveis e desktop
- **Offline**: Funciona sem conexão com internet
- **Sincronização**: Dados são sincronizados quando a conexão retorna
- **Notificações**: Suporte a notificações push
- **Performance**: Cache inteligente para carregamento rápido

### Como instalar

1. Acesse o site no navegador
2. Procure pelo ícone de "Instalar app" na barra de endereços
3. Clique em "Instalar" quando solicitado
4. O app será adicionado à sua tela inicial

## 📞 Integração WhatsApp Business

### Configuração

1. Acesse **Configurações > Notificações**
2. Ative as notificações por WhatsApp
3. Configure sua API Key do WhatsApp Business
4. Adicione o número do WhatsApp
5. Teste a conexão

### Templates Disponíveis

- **Lembrete de Agendamento**: Enviado automaticamente antes do horário
- **Confirmação**: Enviado quando agendamento é confirmado
- **Cancelamento**: Enviado quando agendamento é cancelado

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros provedores

O projeto é compatível com qualquer provedor que suporte Next.js:

- Netlify
- Railway
- DigitalOcean App Platform

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas do Supabase utilizam RLS para garantir que:

- Usuários só acessem seus próprios dados
- Operações são validadas no nível do banco
- Dados sensíveis são protegidos

### Autenticação

- Autenticação via Supabase Auth
- Sessões seguras com JWT
- Logout automático em caso de inatividade

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@neonpro.com
- 💬 Discord: [NeonPro Community](https://discord.gg/neonpro)
- 📖 Documentação: [docs.neonpro.com](https://docs.neonpro.com)

---

Desenvolvido com ❤️ para profissionais da estética e beleza.
