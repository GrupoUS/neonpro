# NEON PRO - Sistema Premium de Gestão para Clínicas de Estética

Bem-vindo ao repositório do NEON PRO, um sistema de gestão completo e premium desenvolvido para clínicas de estética. Este projeto utiliza uma stack moderna com React, TypeScript, Tailwind CSS e Supabase como backend.

## Visão Geral do Projeto

O NEON PRO oferece funcionalidades robustas para:
- **Autenticação de Usuários**: Login, cadastro, redefinição de senha e autenticação social (Google) via Supabase Auth.
- **Gestão de Clientes**: Cadastro, edição e visualização de informações de pacientes.
- **Gestão de Agendamentos**: Criação, atualização e acompanhamento de agendamentos.
- **Gestão Financeira**: Registro e controle de transações (receitas e despesas).
- **Gestão de Usuários**: Controle de acesso baseado em roles (admin, médico, secretária).
- **Relatórios**: Visão geral e análises de dados.

## Tecnologias Utilizadas

- **Frontend**:
    - React
    - TypeScript
    - Vite (para desenvolvimento rápido)
    - Tailwind CSS (para estilização)
    - shadcn/ui (componentes UI)
    - React Router DOM (para roteamento)
    - React Query (para gerenciamento de estado assíncrono)
- **Backend**:
    - Supabase (Database, Authentication, Realtime, Storage)
- **Ferramentas de Desenvolvimento**:
    - npm
    - ESLint
    - Prettier

## Configuração do Ambiente de Desenvolvimento

Para configurar e rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes)
- Uma conta Supabase e um projeto configurado.

### 1. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd neonpro
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do diretório `neonpro` com as seguintes variáveis:

```
VITE_SUPABASE_URL="SUA_URL_SUPABASE"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_SUPABASE"
```
- `VITE_SUPABASE_URL`: Encontrada no Dashboard do Supabase, em `Project Settings > API`.
- `VITE_SUPABASE_ANON_KEY`: Também encontrada no Dashboard do Supabase, em `Project Settings > API` (chave `anon public`).

**Importante**: Nunca commite seu arquivo `.env.local` para o controle de versão. O arquivo `.gitignore` já está configurado para ignorá-lo.

### 3. Instalar Dependências

No diretório `neonpro`, execute:

```bash
npm install
```

### 4. Configurar o Banco de Dados Supabase

Certifique-se de que seu projeto Supabase está configurado com as tabelas e políticas RLS (Row Level Security) corretas. As migrações e políticas RLS foram desenvolvidas para garantir a segurança e integridade dos dados.

**Estrutura de Migrações (exemplo):**
- `supabase/migrations/001_create_tables.sql`
- `supabase/migrations/002_create_appointments.sql`
- `supabase/migrations/003_create_transactions.sql`
- `supabase/migrations/004_create_patient_medical_history.sql`
- `supabase/migrations/005_create_user_profiles.sql`

**Políticas RLS**: Todas as tabelas sensíveis (`pacientes`, `agendamentos`, `transacoes`, `user_profiles`) possuem políticas RLS que restringem o acesso aos dados com base no `user_id` do usuário autenticado e suas `roles`.

### 5. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8081` (ou outra porta disponível).

## Testes e Validação

Após a configuração, você pode:
- **Acessar a aplicação no navegador**: Verifique a página de login e tente criar uma nova conta ou fazer login.
- **Testar funcionalidades**: Navegue pelas diferentes seções (Clientes, Agendamentos, Financeiro, etc.) e teste as operações CRUD.
- **Verificar logs**: Monitore o console do navegador e os logs do Supabase para quaisquer erros.

## Contribuição

Para contribuir com o projeto, por favor, siga as diretrizes de código e abra Pull Requests para novas funcionalidades ou correções.

## Licença

[Informações sobre a licença do projeto, se aplicável.]
