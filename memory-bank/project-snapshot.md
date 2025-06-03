# NEON PRO - Project Snapshot

## Project Goals
Sistema completo de gestão clínica oferecendo funcionalidades integradas para:
- **Gestão de Agendamentos**: Calendário médico, consultas, procedimentos
- **Cadastro de Pacientes**: Histórico médico, dados pessoais, documentos
- **Controle Financeiro**: Faturamento, recebimentos, relatórios financeiros
- **Relatórios Gerenciais**: Analytics de consultório, performance médica
- **Gestão de Usuários**: Controle de acesso por perfis (médico, secretária, admin)

## Tech Stack

### Frontend
- **Framework**: React 18 com Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn-ui components
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (documentos, imagens)
- **Real-time**: Supabase Real-time subscriptions

### Development Tools
- **Build Tool**: Vite
- **Linting**: ESLint
- **Package Manager**: npm
- **Code Quality**: TypeScript strict, ESLint rules

## Core Architecture

### Application Structure
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # shadcn-ui components
│   ├── Layout.tsx      # Layout principal
│   └── ThemeToggle.tsx # Toggle dark/light mode
├── contexts/           # Context providers
│   └── auth/          # Contexto de autenticação
├── pages/             # Páginas principais
│   └── AuthPage.tsx   # Página de login/registro
├── hooks/             # Custom hooks
├── lib/               # Configurações e utilities
├── types/             # Definições TypeScript
└── utils/             # Funções utilitárias
```

### Authentication Flow
- **AuthProvider**: Context provider para estado de autenticação
- **useAuth**: Hook customizado para acesso ao contexto auth
- **useAuthOperations**: Hook para operações de login/logout/registro
- **Protected Routes**: Proteção baseada em estado de autenticação

### Data Flow
1. **UI Components** → Custom Hooks → Supabase Client
2. **Real-time Updates** via Supabase subscriptions
3. **State Management** via React Context (auth, user data)
4. **Form Validation** via Zod schemas

## Key Conventions

### File Naming
- **Components**: PascalCase.tsx (ex: `PatientCard.tsx`)
- **Hooks**: camelCase.ts with `use` prefix (ex: `usePatientData.ts`)
- **Pages**: PascalCase.tsx (ex: `Dashboard.tsx`)
- **Utils**: camelCase.ts (ex: `formatDate.ts`)

### Code Style
- **TypeScript**: Strict mode enabled
- **Imports**: Absolute imports with `@/` alias
- **Components**: Functional components with TypeScript interfaces
- **State**: Preferência por custom hooks sobre useState direto

### UI/UX Patterns
- **Design System**: shadcn-ui como base
- **Responsive**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Theme**: Dark/Light mode support
- **Loading States**: Skeleton loaders, spinners
- **Error Handling**: Toast notifications, error boundaries

### Database Conventions
- **Tables**: snake_case naming
- **RLS**: Row Level Security habilitado
- **Relationships**: Foreign keys com naming pattern `{table}_id`
- **Timestamps**: created_at, updated_at em todas as tabelas

---
**Última Atualização**: 2025-06-03 04:13:09
