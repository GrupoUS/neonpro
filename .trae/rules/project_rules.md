# 🚀 NEONPRO DEVELOPMENT CONSTITUTION

## 🧠 FILOSOFIA CENTRAL

**Mantra**: `Think` → `Research` → `Decompose` → `Plan` → `Implement` → `Validate`
**Princípio**: `KISS` + `YAGNI` - Simplicidade que funciona sobre complexidade que não funciona. Priorize soluções simples, diretas e eficazes. Evite overengineering e features especulativas. Mantenha o código limpo, legível e manutenível. Implemente apenas o que é realmente necessário agora.
**Coordenação**: Especialização focada com workflows inteligentes - Agente certo, hora certa
**ATOMIC TASK**: Always Try breaking down the task into smaller atomic subtasks steps. Sempre execute atomic subtasks de forma fragmentada trabalhando com uma janela de contexto curta.
**NUNCA** colar saídas longas e somente ler trechos necessários para economizar contexto. Controle o ma output tokens dos mcps.
**TIMEOUT**: Sempre coloque timeout nos comandos de terminal para serem executados de forma mais efetiva e sem travar em loop

## 🎯 REGRAS UNIVERSAIS OBRIGATÓRIAS

### **SEQUÊNCIA MCP OBRIGATÓRIA**

1. **`sequential-thinking`** → Análise e decomposição (SEMPRE primeiro)
2. **`archon`** → Task setup e knowledge base
3. **`serena`** → Análise de codebase
4. **Contextuais** → Conforme necessidade (context7, tavily, etc.)
5. **`desktop-commander`** → Implementação e operações

### **FERRAMENTAS MCP MANDATÓRIAS**

- **`supabase mcp`**: Operações de database
- **`archon mcp`**: Task e knowledge management
- **`desktop-commander mcp`**: Operações de arquivo e sistema
- **`context7 mcp`**: Análise contextual profunda _(NUNCA usar contexto nativo)_

## 🤖 COORDENAÇÃO DE AGENTES

### **📋 Registro de Agentes**

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

### **🎯 Matriz de Ativação Inteligente**

#### Por Complexidade

**Baixa Complexidade**

- **Agente**: `apex-dev` (solo)
- **Situação**: Bug fixes, feature simples, refatoração local
- **MCP**: sequential-thinking → archon → serena → desktop-commander

**Média Complexidade**

- **Agentes**: `apex-dev` + 1-2 especialistas
- **Situação**: Features com UI, APIs, integração
- **MCP**: + context7 para research adicional

**Alta Complexidade**

- **Agentes**: Coordenação multi-agent
- **Situação**: Arquitetura, sistemas distribuídos, compliance crítico
- **MCP**: + tavily para validação abrangente

#### Por Palavra-chave (Auto-ativação)

```yaml
TRIGGERS_AUTOMATICOS:
  desenvolvimento: ["desenvolver", "implementar", "código", "feature", "bug"]
  pesquisa: ["pesquisar", "analisar", "investigar", "validar", "research"]
  design: ["design", "ui", "ux", "interface", "página", "componente"]
  qualidade: ["revisar", "quality", "performance", "otimizar", "refactor"]
  segurança: ["security", "vulnerabilidade", "audit", "compliance"]
  arquitetura: ["architecture", "sistema", "patterns", "microservices"]
  testes: ["teste", "tdd", "testing", "coverage", "quality"]
```

#### Decisão: Sequential vs Paralelo

**Sequential (Dependências lineares)**

- Research → Development → Design → Testing
- Architecture → Implementation → Security Review

**Paralelo (Tarefas independentes)**

- Code Review + Security Audit + Performance Analysis
- UI Design + Backend Development (após definição de contratos)

### **Decisão Rápida de Agente**

```yaml
QUANDO_USAR_AGENTES:
  dúvida: "Comece com @apex-dev - ele coordena outros conforme necessário"
  desenvolvimento: "@apex-dev (coordenador principal + full-stack)"
  pesquisa: "@apex-researcher (multi-fonte + compliance)"
  design: "@apex-ui-ux-designer (WCAG 2.1 AA+ + shadcn/ui)"
  qualidade: "@code-reviewer (análise + performance)"
  segurança: "@security-auditor (DevSecOps + compliance)"
  arquitetura: "@architect-review (clean architecture + patterns)"
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

### 2. Research-Driven Implementation

```yaml
sequence: 1. apex-researcher → "Multi-source research e compliance"
  2. apex-dev → "Implementação baseada em evidências"
  3. code-reviewer → "Quality gates e security check"
output: "Implementação evidence-based com qualidade garantida"
```

### 3. Qualidade & Segurança Integrada

```yaml
parallel:
  - code-reviewer → "Análise de qualidade e performance"
  - security-auditor → "Auditoria segurança e vulnerabilidades"
  - apex-dev → "Correções coordenadas e otimizações"
output: "Código seguro e otimizado"
```

### 4. Arquitetura & Sistema

```yaml
sequence: 1. architect-review → "Design e padrões arquiteturais"
  2. apex-dev → "Implementação seguindo architecture mode"
  3. security-auditor → "Validação segurança arquitetural"
output: "Sistema bem arquitetado e seguro"
```

## ⚡ COMANDOS RÁPIDOS

### Agente Único

```bash
@apex-dev "implementar autenticação JWT com refresh token"
@apex-researcher "validar padrões LGPD para dados de pacientes"
@apex-ui-ux-designer "criar interface de agendamento acessível"
@code-reviewer "analisar performance da API de pacientes"
```

### Múltiplos Agentes (Paralelo)

```bash
@apex-dev,code-reviewer "implementar e revisar sistema de notificações"
@apex-ui-ux-designer,apex-dev "criar dashboard responsivo com backend"
@security-auditor,code-reviewer "auditoria completa de segurança"
```

### Workflows Completos

```bash
@apex-researcher,apex-dev "pesquisar e implementar integração FHIR"
@architect-review,apex-dev,security-auditor "design e implementação microservice seguro"
@apex-researcher,apex-dev,apex-ui-ux-designer,code-reviewer "feature completa de telemedicina"
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

## 💡 PRINCÍPIOS CONSTITUCIONAIS

### **KISS Principle**

- Escolher solução mais simples que atende requisitos
- Código legível sobre otimizações inteligentes
- Reduzir carga cognitiva
- Evitar over-engineering

### **YAGNI Principle**

- Construir apenas o que requisitos especificam
- Resistir features "por precaução"
- Refatorar quando requisitos emergirem
- Focar nas user stories atuais

### **Chain of Thought**

- Quebrar problemas em passos sequenciais
- Verbalizar processo de raciocínio
- Mostrar decisões intermediárias
- Validar contra requisitos

## 🚀 METODOLOGIA A.P.T.E

**Analyze** → Análise abrangente de requisitos
**Plan** → Planejamento estratégico de implementação
**Think** → Meta-cognição e avaliação multi-perspectiva
**Execute** → Implementação sistemática com quality gates

**Padrão de Qualidade**: ≥9.5/10 em todas as entregas

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### **Build & Runtime**

- **Turborepo**: Cache inteligente para builds 3-5x mais rápidos
- **Bun**: Scripts e testes (3-5x performance vs npm)
- **PNPM**: Package management eficiente
- **Vite**: Dev server <2s startup, HMR <100ms

### **Desenvolvimento**

- **TypeScript Strict**: Máxima type safety
- **TanStack Router**: Type-safe routing end-to-end
- **tRPC v11**: API type-safe sem overhead
- **Prisma**: ORM com auto-generated types

## 🔒 SEGURANÇA & COMPLIANCE

### **Healthcare Compliance (Automático)**

- **LGPD**: Proteção de dados de pacientes
- **ANVISA**: Regulamentações de dispositivos médicos
- **CFM**: Padrões profissionais médicos
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

## 🔧 MCP TOOLS ESSENCIAIS

### Obrigatórios (Todos os Agentes)

- **`sequential-thinking`**: SEMPRE primeiro passo - análise e decomposição
- **`archon`**: Task management e knowledge base (nunca pular)
- **`serena`**: Análise de codebase (NUNCA usar busca nativa)

### Por Contexto

```yaml
research_stack:
  - context7: Documentação oficial e frameworks
  - tavily: Informações atuais e trends
  - exa: Implementações reais (complexidade ≥5)

development_stack:
  - desktop-commander: Operações de arquivo e sistema
  - supabase-mcp: Database operations
  - shadcn-ui: Componentes e registries (UI/UX agent)

quality_stack:
  - Integração CI/CD via desktop-commander
  - Testes automatizados e coverage
  - Security scanning tools
```

### Sequência MCP Padrão

1. **sequential-thinking** (análise)
2. **archon** (task setup)
3. **serena** (codebase context)
4. **Contextuais** (conforme necessidade)
5. **desktop-commander** (implementação)

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

- **[Workflow Completo](./docs/AGENTS.md)** - Processo de desenvolvimento mandatório
- **[Tech Stack](./docs/architecture/tech-stack.md)** - Decisões tecnológicas e rationale
- **[Source Tree](./docs/architecture/source-tree.md)** - Organização do código

### **Arquitetura & Padrões**

- **[Coding Standards](./docs/rules/coding-standards.md)** - Padrões de código obrigatórios
- **[Frontend Architecture](./docs/architecture/frontend-architecture.md)** - Estrutura de frontend
- **[Database Schema](./docs/database-schema/AGENTS.md)** - Organização de dados

### **Agentes Individuais**

- **[APEX Dev](./agents/apex-dev.md)** - Especialização full-stack
- **[APEX Research](./agents/apex-researcher.md)** - Inteligência de pesquisa
- **[APEX UI/UX](./agents/apex-ui-ux-designer.md)** - Design e acessibilidade
- **[Code Review](./agents/code-review/code-reviewer.md)** - Qualidade de código
- **[Security](./agents/code-review/security-auditor.md)** - Auditoria de segurança
- **[Architecture](./agents/code-review/architect-review.md)** - Arquitetura de sistema

---

**🎯 REGRA DE OURO**: Em caso de dúvida, comece com `@apex-dev` - ele coordena e ativa outros conforme necessário.

**⚡ EFICIÊNCIA**: Use o agente certo na hora certa. Use workflows predefinidos para tarefas complexas, agentes únicos para tarefas focadas.

**🔄 MELHORIA CONTÍNUA**: Sistema Archon captura learnings - feedback sempre integrado aos workflows.
