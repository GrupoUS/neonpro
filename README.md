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

### 🔐 Sistema de Sessões e Segurança

- ✅ Gerenciamento avançado de sessões
- ✅ Autenticação multi-dispositivo
- ✅ Monitoramento de segurança em tempo real
- ✅ Detecção de atividades suspeitas
- ✅ Auditoria e conformidade LGPD
- ✅ Fingerprinting de dispositivos
- ✅ Geolocalização e análise de risco
- ✅ Políticas de sessão personalizáveis

### 🧪 Testes Automatizados

- ✅ Testes unitários com Jest
- ✅ Testes de componentes com Testing Library
- ✅ Cobertura de código
- ✅ Testes de integração

## 📦 Estrutura do Projeto

Este projeto contém todos os arquivos necessários para funcionar independentemente:

\`\`\`
neonpro/
├── app/ # Next.js App Router
├── components/ # Componentes React
│ └── ui/ # Componentes UI (shadcn/ui)
├── lib/ # Utilitários e configurações
├── public/ # Arquivos públicos
├── styles/ # Estilos globais
├── .env.example # Template de variáveis de ambiente
├── .gitignore # Arquivos ignorados pelo Git
├── next.config.mjs # Configuração Next.js
├── package.json # Dependências e scripts
├── tailwind.config.ts # Configuração Tailwind
└── tsconfig.json # Configuração TypeScript
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

- **Supabase** - Backend as a Service (Project ID: `ownkoxryswokcdanrdgj` - Brasil/São Paulo)
- **PostgreSQL** - Banco de dados completo com 40+ tabelas
- **Row Level Security** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real
- **Performance Monitoring** - Sistema de monitoramento integrado
- **CRM System** - Gestão completa de relacionamento com clientes
- **Financial Management** - Contas a pagar, fornecedores, relatórios

### Testes

- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes
- **Playwright** - Testes E2E

### PWA

- **Service Worker** - Cache e offline
- **Web App Manifest** - Instalação
- **Background Sync** - Sincronização

## 🗄️ Arquitetura do Banco de Dados

**Projeto Supabase: `ownkoxryswokcdanrdgj` (São Paulo, Brasil)**  
**Todas as tabelas do NeonPro estão hospedadas neste projeto Supabase**

### Tabelas Principais (Sistema Core)

- `profiles` - Perfis de usuários com dados de autenticação
- `clients` - Gestão completa de pacientes/clientes
- `services` - Catálogo de serviços oferecidos pela clínica
- `professionals` - Equipe e profissionais da clínica
- `appointments` - Sistema de agendamentos e consultas
- `transactions` - Controle financeiro e transações
- `clinic_settings` - Configurações gerais do sistema

### Sistema Educacional

- `courses` - Cursos e programas educacionais
- `course_enrollments` - Inscrições e matrículas
- `medical_documents` - Documentos médicos com verificação

### CRM Avançado

- `customers` - Base de clientes CRM
- `customer_segments` - Segmentação inteligente
- `customer_segment_memberships` - Relacionamentos de segmentos
- `customer_interactions` - Histórico de interações
- `marketing_campaigns` - Campanhas de marketing

### Gestão Financeira

- `vendors` - Cadastro de fornecedores
- `expense_categories` - Categorização de despesas
- `accounts_payable` - Contas a pagar
- `payment_schedules` - Cronogramas de pagamento
- `ap_payments` - Registro de pagamentos
- `ap_documents` - Documentos fiscais
- `ap_audit_log` - Auditoria financeira

### Sistema de Performance

- `performance_metrics` - Métricas de performance em tempo real
- `performance_alerts` - Alertas automáticos de performance
- `bundle_analysis` - Análise de bundles de JavaScript
- `cache_performance` - Monitoramento de cache do sistema

### Sistema de Sessões e Segurança

- `user_sessions` - Gerenciamento de sessões de usuários
- `device_registrations` - Registro e validação de dispositivos
- `session_audit_logs` - Logs de auditoria de sessões
- `security_events` - Eventos de segurança e monitoramento
- `ip_blacklist` - Lista de IPs bloqueados
- `session_policies` - Políticas de sessão personalizáveis

### Recursos Avançados

- **Row Level Security (RLS)** em todas as tabelas
- **Triggers automáticos** para criação de perfis
- **Funções PostgreSQL** para cálculos complexos
- **Real-time subscriptions** para atualizações instantâneas
- **Índices otimizados** para consultas rápidas

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
pnpm install
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
pnpm run db:migrate
\`\`\`

### 5. Execute o projeto

\`\`\`bash
pnpm run dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Executando Testes

### Testes unitários

\`\`\`bash

# Executar todos os testes

pnpm run test

# Executar em modo watch

pnpm run test:watch

# Executar com cobertura

pnpm run test:coverage
\`\`\`

### Testes E2E

\`\`\`bash

# Executar testes E2E

pnpm run test:e2e

# Executar com interface gráfica

pnpm run test:e2e:ui
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

### Sistema de Sessões Avançado

- **Gerenciamento Multi-Dispositivo**: Controle de sessões simultâneas
- **Fingerprinting de Dispositivos**: Identificação única de dispositivos
- **Monitoramento de Segurança**: Detecção de atividades suspeitas em tempo real
- **Geolocalização**: Análise de risco baseada em localização
- **Auditoria LGPD**: Logs completos para conformidade
- **Políticas Personalizáveis**: Configurações flexíveis por clínica
- **Renovação Automática**: Tokens rotativos para máxima segurança
- **Blacklist de IPs**: Bloqueio automático de IPs maliciosos

### Autenticação

- Autenticação via Supabase Auth
- Sessões seguras com JWT
- Logout automático em caso de inatividade
- Validação contínua de sessões
- Detecção de sequestro de sessão

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@neonpro.com
- 💬 Discord: [NeonPro Community](https://discord.gg/neonpro)
- 📖 Documentação: [docs.neonpro.com](https://docs.neonpro.com)

---

Desenvolvido com ❤️ para profissionais da estética e beleza.
