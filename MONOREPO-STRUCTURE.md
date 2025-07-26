# NeonPro Monorepo - Enhanced Architecture

## 🏗️ Estrutura do Monorepo

```
neonpro/
├── 📁 apps/                           # Aplicações do monorepo
│   └── web/                          # App principal Next.js 15
│       ├── app/                      # App Router (Next.js 15)
│       ├── components/               # Componentes React
│       ├── lib/                      # Utilities e configurações
│       ├── middleware.ts             # Edge middleware
│       └── types/                    # TypeScript definitions
│
├── 📁 packages/                       # Packages compartilhados
│   ├── ui/                           # Design System (shadcn/ui)
│   ├── eslint-config/                # Configurações ESLint
│   ├── typescript-config/            # Configurações TypeScript
│   ├── database/                     # Schema e migrations Supabase
│   ├── auth/                         # Utilities de autenticação
│   ├── ai/                           # Engine de IA preditiva
│   └── compliance/                   # LGPD/ANVISA/CFM utilities
│
├── 📁 docs/                          # Documentação sincronizada
│   ├── prd.md                        # ✅ FONTE DA VERDADE
│   ├── architecture.md               # ✅ FONTE DA VERDADE
│   ├── front-end-spec.md             # ✅ FONTE DA VERDADE
│   ├── prd/                          # Shards do PRD
│   ├── architecture/                 # Shards da Arquitetura
│   └── stories/                      # Stories BMad Method
│
├── 📁 infrastructure/                 # DevOps e Infrastructure as Code
│   ├── vercel/                       # Configurações Vercel
│   ├── supabase/                     # Migrations e configurações
│   ├── monitoring/                   # Observabilidade
│   └── scripts/                      # Scripts de deployment
│
├── 📁 tools/                         # Ferramentas de desenvolvimento
│   ├── build/                        # Scripts de build
│   ├── testing/                      # Configurações de teste
│   └── generators/                   # Code generators BMad
│
└── 📁 .bmad-core/                    # ✅ BMad Method Framework
    ├── agents/                       # Agentes especializados
    ├── tasks/                        # Tasks BMad
    ├── templates/                    # Templates documentação
    └── checklists/                   # Checklists validação
```

## 🚀 Comandos do Monorepo

```bash
# Desenvolvimento
pnpm dev              # Inicia todos os apps em modo desenvolvimento
pnpm build            # Build de produção de todos os packages
pnpm lint             # Lint em todo o monorepo
pnpm test             # Executa todos os testes

# Apps específicos
pnpm --filter web dev    # Desenvolvimento apenas do app web
pnpm --filter web build  # Build apenas do app web

# Packages específicos
pnpm --filter @neonpro/ui dev    # Desenvolvimento do design system
pnpm --filter @neonpro/auth dev  # Desenvolvimento do package auth
```

## 📦 Packages Compartilhados

- **@neonpro/ui**: Design System baseado em shadcn/ui
- **@neonpro/auth**: Utilities de autenticação Supabase
- **@neonpro/database**: Schema e types do banco de dados
- **@neonpro/ai**: Engine de IA preditiva para clínicas
- **@neonpro/compliance**: Utilities LGPD/ANVISA/CFM
- **@neonpro/eslint-config**: Configurações ESLint compartilhadas
- **@neonpro/typescript-config**: Configurações TypeScript

## 🏃‍♂️ Quick Start

1. **Instalar dependências:**
   ```bash
   pnpm install
   ```

2. **Configurar ambiente:**
   ```bash
   cp .env.example .env.local
   # Editar .env.local com suas credenciais
   ```

3. **Iniciar desenvolvimento:**
   ```bash
   pnpm dev
   ```

## 🎯 BMad Method Integration

Este monorepo está totalmente integrado com BMad Method v4.29.0:

- **Agents**: Especializados em `.bmad-core/agents/`
- **Stories**: Implementação em `docs/stories/`
- **Templates**: Padrões em `.bmad-core/templates/`
- **Checklists**: Validação em `.bmad-core/checklists/`

### Comandos BMad

```bash
# Ativar agentes especializados
*agent dev      # James - Full Stack Developer
*agent pm       # Product Manager
*agent po       # Product Owner
*agent sm       # Scrum Master

# Executar tasks
*create         # Criar nova story
*execute-checklist story-dod-checklist
```

## 📚 Próximos Passos

1. ✅ **Etapa 1: Estrutura de Pastas** - CONCLUÍDA
2. 🔄 **Etapa 2: Sincronização Documentação** - EM ANDAMENTO
3. ⏳ **Etapa 3: Checklist de Progresso** - PENDENTE
4. ⏳ **Etapa 4: Backlog Atualizado** - PENDENTE

---

*NeonPro Enhanced Architecture - BMad Method v4.29.0 | Monorepo Structure Complete ✅*
