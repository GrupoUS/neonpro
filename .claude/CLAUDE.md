# 🚀 NEONPRO DEVELOPMENT CONSTITUTION

## 🧠 FILOSOFIA CENTRAL

**Mantra**: _"Think → Research → Decompose → Plan → Implement → Validate"_
**Princípio**: KISS + YAGNI - Simplicidade que funciona sobre complexidade que não funciona
**Coordenação**: [**📋 Guia Master de Agentes**](./.claude/agents/CLAUDE.md) - Referência definitiva para coordenação inteligente

## 🎯 REGRAS UNIVERSAIS OBRIGATÓRIAS

### **ARCHON-FIRST RULE** 
Sempre usar Archon MCP para task management, knowledge management e organização do projeto.

### **SEQUÊNCIA MCP OBRIGATÓRIA**
1. **`sequential-thinking`** → Análise e decomposição (SEMPRE primeiro)
2. **`archon`** → Task setup e knowledge base  
3. **`serena`** → Análise de codebase (NUNCA busca nativa)
4. **Contextuais** → Conforme necessidade (context7, tavily, etc.)
5. **`desktop-commander`** → Implementação e operações

### **FERRAMENTAS MCP MANDATÓRIAS**
- **`serena mcp`**: Busca e análise semântica de código _(NUNCA usar busca nativa)_
- **`supabase mcp`**: Operações de database
- **`archon mcp`**: Task e knowledge management  
- **`desktop-commander mcp`**: Operações de arquivo e sistema
- **`context7 mcp`**: Análise contextual profunda _(NUNCA usar contexto nativo)_
- **`tavily mcp`**: Pesquisas web em tempo real

## 🤖 COORDENAÇÃO DE AGENTES

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

### **Guia Completo de Agentes**
**📋 [CONSULTE O GUIA MASTER](./.claude/agents/CLAUDE.md)** para:
- Registro completo de agentes e triggers
- Workflows predefinidos por cenário  
- Comandos prontos para usar
- Matriz de ativação inteligente
- Coordenação sequential vs paralelo

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
- **[Guia de Agentes](./agents/CLAUDE.md)** - Coordenação inteligente de especialistas
- **[Tech Stack](./docs/architecture/tech-stack.md)** - Decisões tecnológicas e rationale
- **[Source Tree](./docs/architecture/source-tree.md)** - Organização do código

### **Arquitetura & Padrões**
- **[Coding Standards](./docs/rules/coding-standards.md)** - Padrões de código obrigatórios
- **[Frontend Architecture](./docs/architecture/frontend-architecture.md)** - Estrutura de frontend
- **[Database Schema](./docs/database-schema/AGENTS.md)** - Organização de dados

---

**🎯 REGRA DE OURO**: Em caso de dúvida, consulte o [**Guia Master de Agentes**](./.claude/agents/CLAUDE.md) para coordenação inteligente e workflows predefinidos.

**⚡ EFICIÊNCIA**: Use o agente certo na hora certa. O apex-dev coordena tudo quando necessário.

**🔄 MELHORIA CONTÍNUA**: Sistema Archon captura learnings - feedback sempre integrado aos workflows.