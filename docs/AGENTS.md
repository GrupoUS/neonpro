# 🤖 NeonPro Agent Orchestration System

**Sistema de coordenação inteligente de agentes para desenvolvimento de software em saúde**

## 🎯 **Visão Geral do Sistema**

Este documento define a arquitetura e coordenação dos agentes especializados no ecossistema NeonPro, seguindo a filosofia de "Agentes especializados com coordenação inteligente".

### **Princípios Fundamentais**

- **Think → Research → Decompose → Plan → Implement → Validate**
- **Research-driven**: Validação multi-fonte para implementações complexas
- **Agent coordination**: Roteamento inteligente APEX com apex-dev como coordenador central
- **Constitutional excellence**: Filosofia one-shot resolution do vibecoder
- **Archon-first rule**: Integração obrigatória do Archon MCP para gestão de tarefas

## 🏗️ **Arquitetura de Agentes**

### **Agentes Principais**

#### **💻 apex-dev** - Coordenador Central (Sempre Ativo)

```yaml
role: "Full-Stack Healthcare Development + Agent Coordination"
always_active: true
capabilities:
  - Next.js 15 + React 19 + TypeScript development
  - Constitutional principles (KISS/YAGNI/CoT) enforcement
  - Agent coordination and workflow orchestration
  - Production deployment and quality gates
```

#### **🔬 apex-researcher** - Inteligência de Pesquisa (On-Demand)

```yaml
role: "Multi-Source Research and Healthcare Compliance"
activation_triggers: ["research", "analyze", "investigate", "pesquisar", "analisar", "planejar"]
capabilities:
  - Context7 → Tavily → Exa intelligence chain
  - Evidence-based implementation guidance
```

#### **🎨 apex-ui-ux-designer** - Excelência em Design (On-Demand)

```yaml
role: "Healthcare UI/UX with Constitutional Accessibility"
activation_triggers: ["design", "ui", "ux", "interface", "página", "componente", "acessibilidade"]
capabilities:
  - WCAG 2.1 AA+ accessibility compliance
  - shadcn/ui v4 healthcare optimization
```

## 🔧 **Integração de Ferramentas MCP**

### **Sequência Obrigatória**

1. **🧠 sequential-thinking** (PRIMEIRO PASSO)
2. **📋 archon** (gestão de tarefas)
3. **🔍 serena** (análise de codebase - NUNCA nativo)

### **MCPs Contextuais**

- **💻 desktop-commander** - Operações de arquivo/sistema
- **📚 context7** - Documentação
- **🌐 tavily** - Informações em tempo real
- **🎨 shadcn-ui** - Componentes UI
- **🗄️ supabase** - Operações de banco de dados

## 📋 **Workflow de Desenvolvimento Obrigatório**

### **1. Research & Decomposition** 🧠

- **OBRIGATÓRIO**: Iniciar com `sequential-thinking`
- Usar `archon` para contexto do projeto e criar/atualizar tarefas
- Usar `serena` (NUNCA nativo) para entender codebase atual
- Quebrar feature em componentes menores
- **Complexidade ≥7**: Adicionar context7 → tavily
- **Travado >3x**: Usar sequential-thinking para reavaliar

### **2. Planning & Task List** 📋

- **OBRIGATÓRIO**: Usar `archon` para gestão de tarefas
- Criar lista detalhada de tarefas usando sistema archon
- Criar subtarefas atômicas para cada componente de feature
- Atribuir tarefas aos agentes apropriados
- Definir critérios de sucesso e quality gates

### **3. Test Driven Implementation**

- **Ciclo TDD** para cada componente de feature:
  1. **RED**: Escrever teste falhando primeiro
  2. **GREEN**: Escrever código mínimo para passar no teste
  3. **REFACTOR**: Melhorar código mantendo testes verdes
  4. **REPEAT**: Continuar ciclo para próximo requisito

### **4. Test Execution & Validation** ✅

- Usar `desktop-commander` para executar comandos de teste
- Executar `bun run lint:fix` para issues de linter
- Executar `bun run format && bun run lint:fix && bun run type-check`

### **5. Code Quality Check** 🔍

- Usar `desktop-commander` para comandos de qualidade
- Executar `bun run type-check` para verificar compilação TypeScript
- Usar `serena` para analisar qualidade do código
- Garantir que código atende aos padrões de qualidade

## 🎯 **Comandos de Ativação de Agentes**

```bash
# Coordenador base (apex-dev sempre ativo)
ruler

# Ativar pesquisador para tarefas de planejamento/análise
ruler --agents apex-dev,apex-researcher

# Ativar designer UI/UX para trabalho de interface
ruler --agents apex-dev,apex-ui-ux-designer

# Ativação completa da equipe de saúde
ruler --agents apex-dev,apex-researcher,apex-ui-ux-designer
```

## 🏥 **Orquestração de Workflow Específico para Saúde**

### **Fase de Pesquisa & Planejamento**

- Triggers: research, analyze, investigate, pesquisar, analisar, planejar
- Coordenação: apex-dev + apex-researcher
- Foco: Validação de compliance, melhores práticas, decisões baseadas em evidência

### **Fase de Desenvolvimento UI/UX**

- Triggers: design, ui, ux, interface, página, componente, acessibilidade
- Coordenação: apex-dev + apex-ui-ux-designer
- Foco: WCAG 2.1 AA+, design centrado no paciente, cenários de emergência

### **Fase de Desenvolvimento Core**

- Coordenação: apex-dev (sempre ativo)
- Foco: Princípios constitucionais, compliance, quality gates

## 📚 **Benefícios da Estratégia Otimizada**

### **🚀 Melhorias de Performance**

- **Overhead Reduzido**: Elimina configurações redundantes
- **Loading Contextual**: Especialistas ativam apenas quando necessário
- **Coordenação Inteligente**: apex-dev orquestra equipe eficientemente

### **🎯 Aumento de Foco**

- **Especialização em Saúde**: Todos agentes otimizam para workflows médicos
- **Princípios Constitucionais**: Qualidade e compliance consistentes
- **Expertise On-Demand**: Especialista certo para tarefa certa

---

**Status**: ✅ **ATIVO**\
**Última Atualização**: 2025-01-08\
**Versão**: 1.0.0
