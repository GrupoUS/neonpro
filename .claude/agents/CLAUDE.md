---
title: "NeonPro Agents Master Guide"
description: "Guia definitivo para coordenação inteligente de agentes"
version: "1.0.0"
last_updated: "2025-09-18"
---

# 🤖 NeonPro Agents Master Guide

## 🎯 Filosofia Central

**Mantra**: _"Think → Research → Decompose → Plan → Implement → Validate"_
**Princípio**: KISS + YAGNI - Agente certo, hora certa, sem overengineering
**Coordenação**: Especialização focada com workflows inteligentes

---

## 📋 Registro de Agentes

### 🚀 Agentes Core (Sempre Disponíveis)

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

### ⚙️ Agentes Especializados (Sob Demanda)

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

### 🛠️ Agentes Suporte

**Outros disponíveis**: documentation, prd, briefing, rules

---

## 🎯 Matriz de Ativação Inteligente

### Por Complexidade

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

### Por Palavra-chave (Auto-ativação)

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

### Decisão: Sequential vs Paralelo

**Sequential (Dependências lineares)**
- Research → Development → Design → Testing
- Architecture → Implementation → Security Review

**Paralelo (Tarefas independentes)**
- Code Review + Security Audit + Performance Analysis
- UI Design + Backend Development (após definição de contratos)

---

## 🔄 Workflows Essenciais

### 1. Desenvolvimento Completo de Feature
```yaml
sequence:
  1. apex-researcher → "Validação tecnológica e best practices"
  2. apex-dev → "Implementação core + architecture mode se necessário"
  3. apex-ui-ux-designer → "Interface otimizada (se aplicável)"
  4. code-reviewer → "Validação final de qualidade"
output: "Feature production-ready com qualidade validada"
```

### 2. Research-Driven Implementation
```yaml
sequence:
  1. apex-researcher → "Multi-source research e compliance"
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
sequence:
  1. architect-review → "Design e padrões arquiteturais"
  2. apex-dev → "Implementação seguindo architecture mode"
  3. security-auditor → "Validação segurança arquitetural"
output: "Sistema bem arquitetado e seguro"
```

---

## ⚡ Comandos Rápidos

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

### Casos Específicos
```bash
# Refatoração segura
@apex-dev "refactor authentication module using refactor mode"

# Arquitetura complexa  
@architect-review,apex-dev "design system using architecture mode"

# Security audit
@security-auditor,apex-dev "security review using security audit mode"
```

---

## 🔧 MCP Tools Essenciais

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

---

## 📚 Referências Rápidas

### Documentação Principal
- **Workflow Completo**: [`../../docs/AGENTS.md`](../../docs/AGENTS.md)
- **Coordenação Agents**: [`../../docs/agents/AGENTS.md`](../../docs/agents/AGENTS.md)
- **Tech Stack**: [`../../docs/architecture/tech-stack.md`](../../docs/architecture/tech-stack.md)
- **Source Tree**: [`../../docs/architecture/source-tree.md`](../../docs/architecture/source-tree.md)

### Agentes Individuais
- **APEX Dev**: [`./apex-dev.md`](./apex-dev.md)
- **APEX Research**: [`./apex-researcher.md`](./apex-researcher.md)  
- **APEX UI/UX**: [`./apex-ui-ux-designer.md`](./apex-ui-ux-designer.md)
- **Code Review**: [`./code-review/code-reviewer.md`](./code-review/code-reviewer.md)
- **Security**: [`./code-review/security-auditor.md`](./code-review/security-auditor.md)
- **Architecture**: [`./code-review/architect-review.md`](./code-review/architect-review.md)

### Padrões & Regras
- **Coding Standards**: [`../../docs/rules/coding-standards.md`](../../docs/rules/coding-standards.md)
- **Project Instructions**: [`../../CLAUDE.md`](../../CLAUDE.md)

---

**🎯 Decisão Rápida**: Dúvida sobre qual agente usar? Comece com `@apex-dev` - ele coordena e ativa outros conforme necessário.

**⚡ Eficiência Máxima**: Use workflows predefinidos para tarefas complexas, agentes únicos para tarefas focadas.

**🔄 Iteração Contínua**: Agents aprendem e melhoram através do sistema Archon - feedback sempre bem-vindo.