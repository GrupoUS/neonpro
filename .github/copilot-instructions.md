# 🚀 NEONPRO DEVELOPMENT CONSTITUTION

## 🧠 FILOSOFIA CENTRAL

**Mantra**: _"Think → Research → Decompose → Plan → Implement → Validate"_
**Princípio**: KISS + YAGNI - Simplicidade que funciona sobre complexidade que não funciona
**Coordenação**: Especialização focada com workflows inteligentes - Agente certo, hora certa

## 🎯 REGRAS UNIVERSAIS OBRIGATÓRIAS

### **ARCHON-FIRST RULE**

Sempre usar Archon MCP para task management, knowledge management e organização do projeto.

### **SEQUÊNCIA MCP OBRIGATÓRIA**

1. **`sequential-thinking`** → Análise e decomposição (SEMPRE primeiro)
2. **`archon`** → Task setup e knowledge base
3. **`serena`** → Análise de codebase (NUNCA busca nativa)
4. **Contextuais** → Conforme necessidade (context7, tavily, etc.)
5. **`desktop-commander`** → Implementação e operações

### **FERRAMENTAS MANDATÓRIAS**

- **`serena mcp`**: Busca e análise semântica de código _(NUNCA usar busca nativa)_
- **`supabase cli`**: Operações de database
- **`archon mcp`**: Task e knowledge base
- **`desktop-commander mcp`**: Operações de arquivo e sistema
- **`context7 mcp`**: Análise contextual profunda

## 🏗️ ARQUITETURA & STACK TÉCNICO

### **Monorepo Turborepo** (Bun + PNPM)

```bash
# Estrutura: apps/{api,web} + packages/{types,database,shared,ui,utils,security,core-services} + tools/*
pnpm dev                    # Desenvolvimento completo
pnpm --filter @neonpro/web dev  # Frontend only
bunx turbo build            # Build otimizado com cache
bunx turbo test             # Tests em paralelo
```

### **Frontend (apps/web)** - React 19 + TanStack Router + Vite

```bash
# TanStack Router (File-based routing)
pnpm routes:generate        # Gerar route tree
pnpm routes:watch          # Watch mode para routes
pnpm dev                   # Vite dev server

# AI Integration (CopilotKit + Multi-provider)
# Providers: @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google
# Components: @copilotkit/react-core, @assistant-ui/react

# Accessibility Testing (Automático)
pnpm test:accessibility    # Axe-core testing
pnpm test:accessibility:full  # Comprehensive a11y testing
```

### **Backend (apps/api)** - Hono.dev + tRPC + Edge Runtime

```bash
# Edge Runtime (Brazilian regions: sao1, gru1)
pnpm dev:api               # Development server
pnpm build:edge            # Edge-optimized build
pnpm deploy:edge           # Deploy to Brazilian regions

# Healthcare Compliance
pnpm healthcare:compliance # Monitor compliance metrics
pnpm bundle:analyze        # Healthcare-specific bundle analysis
```

### **Database** - PostgreSQL + Prisma + Supabase (LGPD Compliant)

```bash
# Prisma Operations
pnpm prisma:generate       # Generate types
pnpm prisma:migrate:deploy # Deploy migrations

# Healthcare Testing
pnpm test:rls              # Row Level Security tests
pnpm test:compliance       # LGPD compliance validation
```

## 🤖 COORDENAÇÃO DE AGENTES

### **📋 Registro de Agentes**

#### 🚀 Agentes Core (Sempre Disponíveis)

**`apex-dev`** - Coordenador Principal

- **Triggers**: "desenvolver", "implementar", "código", "feature", "bug", "refatorar", "auditoria"
- **Especialização**: Full-stack + healthcare + refatoração + segurança integrada
- **Tecnologias**: TanStack Router + Vite + React 19 + TypeScript + tRPC
- **Modos**: Standard, Architecture, Refactor, Security Audit

**`apex-researcher`** - Inteligência de Pesquisa

- **Triggers**: "pesquisar", "analisar", "investigar", "validar", "research", "compliance"
- **Especialização**: Multi-fonte (Context7 → Tavily → Archon) + validação cruzada ≥95%
- **Capacidades**: Evidence-based implementation, compliance validation

**`apex-ui-ux-designer`** - Excelência em Design

- **Triggers**: "design", "ui", "ux", "interface", "página", "componente", "acessibilidade"
- **Especialização**: WCAG 2.1 AA+ + shadcn/ui v4 + mobile-first + healthcare UX
- **MCP**: Integração automática com registries shadcn

#### ⚙️ Agentes Especializados (Sob Demanda)

**`code-reviewer`** - Qualidade de Código

- **Triggers**: "revisar", "qualidade", "review", "análise", "performance"
- **Especialização**: Análise AI-powered + security scanning + performance

**`security-auditor`** - DevSecOps Expert

- **Triggers**: "segurança", "vulnerabilidade", "auditoria", "compliance", "security"
- **Especialização**: OWASP + penetration testing + compliance frameworks

**`architect-review`** - Arquitetura de Sistema

- **Triggers**: "arquitetura", "design", "sistema", "microservices", "patterns"
- **Especialização**: Clean architecture + DDD + distributed systems

**`tdd-orchestrator`** - Coordenação TDD

- **Triggers**: "tdd", "teste", "testing", "quality", "coverage"
- **Especialização**: Red-Green-Refactor + multi-agent coordination

## 🔬 PADRÕES TÉCNICOS ESPECÍFICOS

### **TanStack Router Development**

```typescript
// File-based routing em apps/web/src/routes/
apps/web/src/routes/
├── __root.tsx              # Layout root
├── index.tsx               # Homepage 
├── auth/                   # Auth routes
├── dashboard/              # Dashboard routes
└── patients/               # Patient management

// Route generation automática
pnpm routes:generate        # Generate routeTree.gen.ts
pnpm routes:watch          # Watch mode development
```

### **AI Integration Architecture**

```typescript
// Multi-provider setup
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

// CopilotKit integration
import { CopilotKit } from '@copilotkit/react-core';
import { AssistantRuntimeProvider } from '@assistant-ui/react';

// AG-UI Protocol (Backend communication)
import { AgUiClient } from '@ag-ui/client';
```

### **Healthcare Compliance Testing**

```bash
# Healthcare-specific test categories
pnpm test:healthcare       # Full compliance suite
pnpm test:frontend         # UI/UX + accessibility
pnpm test:backend          # API + business logic
pnpm test:database         # RLS + data validation
pnpm test:quality          # Performance + security

# Compliance validation
pnpm healthcare:validate   # Lint + compliance + type-check
pnpm test:rls              # Row Level Security testing
pnpm test:compliance       # LGPD + ANVISA + CFM validation
```

### **Brazilian Edge Optimization**

```bash
# Vercel deployment (Brazilian regions)
vercel deploy --regions gru1,sao1  # São Paulo targeting
pnpm deploy:edge           # Edge-optimized deployment
pnpm bundle:analyze        # Healthcare bundle analysis

# Edge runtime configuration
edgeRuntime: {
  regions: ["sao1", "gru1"],
  healthcareCompliance: true,
  lgpdEnforcement: "strict"
}
```

### **Accessibility-First Development**

```bash
# Automated a11y testing
pnpm test:accessibility    # Component-level axe testing
pnpm test:a11y            # Full accessibility suite
jest-axe                   # Integration with vitest

# Components WCAG 2.1 AA+ compliant by default
@radix-ui/* components     # Accessible primitives
axe-core integration       # Real-time accessibility checking
```

## 🔄 WORKFLOWS ESSENCIAIS

### 1. Desenvolvimento Completo de Feature

```yaml
sequence: 1. apex-researcher → "Validação tecnológica e best practices"
  2. apex-dev → "Implementação core + architecture mode se necessário"
  3. apex-ui-ux-designer → "Interface otimizada (se aplicável)"
  4. code-reviewer → "Validação final de qualidade"
output: "Feature production-ready com qualidade validada"
```

### 2. AI Feature Integration

```yaml
sequence: 1. apex-researcher → "AI provider evaluation e best practices"
  2. apex-dev → "CopilotKit integration + multi-provider setup"
  3. security-auditor → "AI security + data privacy validation"
  4. test → "AI functionality + compliance testing"
output: "AI feature segura e compliant"
```

## 📋 WORKFLOW ARCHON OBRIGATÓRIO

**ANTES de qualquer código:**

1. **Check Current Task** → Revisar detalhes e requisitos no Archon
2. **Research for Task** → Buscar docs e exemplos relevantes
3. **Implement Task** → Escrever código baseado em research
4. **Update Status** → Mover task "todo" → "doing" → "review"
5. **Get Next Task** → Verificar próxima prioridade

**Task Management:**

- Atualizar todas ações no Archon
- Nunca mover diretamente para "complete" (sempre passar por "review")
- Manter descrições e adicionar notas de implementação
- NÃO FAZER SUPOSIÇÕES - checar documentação do projeto

## 🚀 COMANDOS CRÍTICOS DE DESENVOLVIMENTO

### **Quality Gates (Mandatory)**

```bash
# Constitutional checks (sempre executar)
pnpm lint:fix              # Fix linting issues
pnpm format                # Format code
pnpm type-check            # TypeScript validation
pnpm healthcare:validate   # Full compliance check

# Testing by category
pnpm test:frontend         # UI + accessibility tests
pnpm test:backend          # API + business logic
pnpm test:healthcare       # LGPD + compliance tests
pnpm test:e2e             # End-to-end validation
```

### **Development Workflows**

```bash
# Frontend development
pnpm dev:web              # Frontend only
pnpm routes:generate      # Generate route tree
pnpm test:accessibility   # A11y validation

# Backend development  
pnpm dev:api              # API server only
pnpm prisma:generate      # Database types
pnpm healthcare:compliance # Compliance monitoring

# Full-stack development
pnpm dev                  # All services
pnpm test:all-categories  # All test categories
```

## 🔒 SEGURANÇA & COMPLIANCE

### **Healthcare Compliance (Automático)**

- **LGPD**: Proteção de dados de pacientes
- **WCAG 2.1 AA+**: Acessibilidade obrigatória

### **Security Standards**

- Validação de input obrigatória
- Sanitização e escape de dados
- Autenticação multi-fator
- Audit logging completo
- Encryption at rest + in transit

## 🎯 QUALITY GATES UNIVERSAIS

### **Funcionalidade**

- Todos requisitos atendidos
- Funcionalidade existente preservada
- Backward compatibility mantida

### **Segurança**

- Zero vulnerabilidades introduzidas
- Compliance mantido
- Audit trail completo

### **Performance**

- Sem degradação em paths críticos
- Otimização onde apropriado
- Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1

### **Manutenibilidade**

- Código legível e bem estruturado
- Documentação adequada
- Test coverage ≥90% (componentes críticos)

## 🚫 RESTRIÇÕES UNIVERSAIS

### **NUNCA FAÇA**

- Alterar funcionalidade sem aprovação explícita
- Remover testes sem cobertura equivalente
- Usar busca de codebase nativa (sempre Serena MCP)
- Pular workflow Archon obrigatório
- Proceder com <85% de confiança
- Deletar arquivos `/docs` sem aprovação

### **SEMPRE FAÇA**

- Iniciar com sequential-thinking
- Completar ciclo Archon antes de código
- Pesquisar antes de implementações críticas
- Seguir princípios KISS e YAGNI
- Atualizar status no Archon continuamente
- Validar qualidade antes de completar
- Continuar até conclusão absoluta

## 📚 REFERÊNCIAS CRÍTICAS

### **Documentação Obrigatória**

- **[Workflow Completo](../docs/AGENTS.md)** - Processo de desenvolvimento mandatório
- **[Tech Stack](../docs/architecture/tech-stack.md)** - Decisões tecnológicas e rationale
- **[Source Tree](../docs/architecture/source-tree.md)** - Organização do código
- **[AGENTS DE EXECUÇÃO](../docs/agents/AGENTS.md)** - Detalhes dos agentes e triggers

---

**🎯 REGRA DE OURO**: Em caso de dúvida, comece com `@apex-dev` - ele coordena e ativa outros conforme necessário.

**⚡ EFICIÊNCIA**: Use o agente certo na hora certa. Use workflows predefinidos para tarefas complexas, agentes únicos para tarefas focadas.

**🔄 MELHORIA CONTÍNUA**: Sistema Archon captura learnings - feedback sempre integrado aos workflows.