# 🚀 Guia de Instalação - NeonPro Healthcare Platform

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Configuração do Ambiente](#-configuração-do-ambiente)
3. [Instalação Local](#-instalação-local)
4. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
5. [Configuração do Supabase](#-configuração-do-supabase)
6. [Deploy em Produção](#-deploy-em-produção)
7. [Troubleshooting](#-troubleshooting)

## 🛠️ Pré-requisitos

### Requisitos de Sistema

- **Sistema Operacional**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Memória RAM**: Mínimo 8GB, recomendado 16GB
- **Espaço em Disco**: Mínimo 5GB livres
- **Conexão Internet**: Estável para download de dependências

### Requisitos de Software

- **Node.js** ≥ 18.17.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 (incluído com Node.js)
- **Git** ≥ 2.40.0 ([Download](https://git-scm.com/))
- **VS Code** (recomendado) com extensões:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Verificação dos Pré-requisitos

```bash
# Verificar versão do Node.js
node --version
# Deve retornar v18.17.0 ou superior

# Verificar versão do npm
npm --version
# Deve retornar 9.0.0 ou superior

# Verificar versão do Git
git --version
# Deve retornar 2.40.0 ou superior
```

## 🔧 Configuração do Ambiente

### 1. Clone do Repositório

```bash
# Clone o repositório
git clone [repository-url]
cd neonpro

# Verificar se está na branch correta
git branch
```

### 2. Instalação das Dependências

```bash
# Instalar dependências do projeto
npm install

# Verificar se todas as dependências foram instaladas
npm ls --depth=0
```

### 3. Configuração das Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar o arquivo .env.local com suas configurações
code .env.local
```

#### Variáveis de Ambiente Obrigatórias

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/neonpro"
DIRECT_URL="postgresql://username:password@localhost:5432/neonpro"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-random-secret-key-32-chars+"
NEXTAUTH_URL="http://localhost:3000"

# Security
ENCRYPTION_KEY="your-encryption-key-32-chars+"
JWT_SECRET="your-jwt-secret-key"

# LGPD Compliance
LGPD_CONSENT_VERSION="2.1"
AUDIT_LOG_RETENTION_DAYS="2555" # 7 anos em dias

# External Services (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

WHATSAPP_API_KEY="your-whatsapp-api-key"
SMS_API_KEY="your-sms-api-key"
```

## 🗃️ Configuração do Banco de Dados

### Opção 1: Usar Supabase (Recomendado)

#### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: NeonPro Healthcare
   - **Organization**: Sua organização
   - **Password**: Senha segura para o banco
   - **Region**: South America (São Paulo)

#### 2. Configurar Variáveis de Ambiente

```bash
# No painel do Supabase, vá para Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# No painel do Supabase, vá para Settings > Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
```

### Opção 2: PostgreSQL Local

#### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download e instale do site oficial: https://www.postgresql.org/download/
```

#### 2. Criar Banco de Dados

```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco de dados
CREATE DATABASE neonpro;

-- Criar usuário
CREATE USER neonpro_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE neonpro TO neonpro_user;

-- Sair
\q
```

#### 3. Configurar URL de Conexão

```env
DATABASE_URL="postgresql://neonpro_user:sua_senha_segura@localhost:5432/neonpro"
DIRECT_URL="postgresql://neonpro_user:sua_senha_segura@localhost:5432/neonpro"
```

## 💾 Inicialização do Banco de Dados

### 1. Gerar Cliente Prisma

```bash
npx prisma generate
```

### 2. Executar Migrações

```bash
# Aplicar schema ao banco de dados
npx prisma db push

# OU usar migrações (recomendado para produção)
npx prisma migrate dev --name init
```

### 3. Verificar Conexão

```bash
# Abrir Prisma Studio para verificar
npx prisma studio
# Acesse http://localhost:5555
```

### 4. Popular Dados Iniciais (Opcional)

```bash
# Se existir arquivo de seed
npm run db:seed
```

## 🚀 Instalação Local

### 1. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

### 2. Verificar Instalação

Abra o navegador e acesse:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)

### 3. Executar Testes (Opcional)

```bash
# Testes unitários
npm run test

# Verificação de tipos
npm run type-check

# Lint e formatação
npm run check
```

## 🌐 Deploy em Produção

### Vercel (Recomendado)

#### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório NeonPro

#### 2. Configurar Variáveis de Ambiente

No painel da Vercel, adicione todas as variáveis do `.env.local`

#### 3. Configurar Build

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### Deploy Manual

#### 1. Build do Projeto

```bash
npm run build
```

#### 2. Iniciar em Produção

```bash
npm run start
```

#### 3. Usar PM2 (Recomendado para VPS)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "neonpro" -- start

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

## 🔒 Configurações de Segurança

### 1. Configurar HTTPS

```bash
# Para desenvolvimento (certificado self-signed)
npm install -g mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### 2. Configurar Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 2. Erro de conexão com banco

```bash
# Verificar se o banco está rodando
npx prisma db push

# Regenerar cliente Prisma
npx prisma generate
```

#### 3. Porta já em uso

```bash
# Encontrar processo na porta 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 [PID]  # macOS/Linux
taskkill /PID [PID] /F  # Windows
```

#### 4. Problemas de permissão

```bash
# Corrigir permissões npm (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Usar npx em vez de instalação global
npx prisma generate
```

#### 5. Erro de tipos TypeScript

```bash
# Verificar tipos
npm run type-check

# Reinstalar tipos
npm install --save-dev @types/node @types/react @types/react-dom
```

### Logs e Debugging

#### 1. Verificar logs do Supabase

- Acesse o painel do Supabase
- Vá para Logs > Function Logs

#### 2. Debug local

```bash
# Modo verbose
DEBUG=* npm run dev

# Apenas logs do Next.js
DEBUG=next:* npm run dev
```

#### 3. Prisma debugging

```env
# .env.local
DATABASE_URL_NON_POOLING="postgresql://..."
DEBUG="prisma:query"
```

## 📞 Suporte

### Recursos de Ajuda

- **Documentação**: [./docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/neonpro/issues)
- **Discord**: [Servidor da Comunidade](https://discord.gg/neonpro)

### Informações do Sistema

Para reportar problemas, inclua:

```bash
# Informações do sistema
node --version
npm --version
npx next --version
npx prisma --version

# Informações do projeto
npm ls --depth=0
```

---

✅ **Instalação concluída com sucesso!**

Para próximos passos, consulte:

- [README.md](./README.md) - Visão geral do projeto
- [docs/](./docs/) - Documentação completa
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de contribuição
