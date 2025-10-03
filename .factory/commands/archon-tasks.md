---
title: "Archon Pipeline Orchestrator — Automação MCP"
last_updated: 2025-09-17
form: automation-prompt
tags: [archon, mcp, devops, pipeline, automation, kanban, orchestration]
related:
  - ../../docs/agents/AGENTS.md
  - ../../docs/architecture/source-tree.md
  - ../../AGENTS.md
---

# Archon Pipeline Orchestrator — Prompt de Automação MCP

> **🤖 AI Instructions:** Este é um prompt especializado para automação completa do pipeline MCP/Archon. Execute TODOS os passos sequencialmente sem interrupção. NÃO peça confirmações desnecessárias.

## 🎯 MISSÃO PRINCIPAL

**Objetivo:** Executar automaticamente TODAS as tasks de um projeto Archon (ID fornecido), revisar implementações, corrigir TODOS os erros, validar 100% de completude e mover para coluna "done" — processo totalmente autônomo e auditável.

## 🔧 PARÂMETROS DE ENTRADA

```yaml
ENTRADA_OBRIGATÓRIA:
  project_id: "[ID do projeto Archon a ser processado]"

SAÍDAS_ESPERADAS:
  - "Todas as tasks executadas e implementadas"
  - "Todas as implementações revisadas"
  - "Todos os erros corrigidos"
  - "Tasks movidas para coluna 'done'"
  - "Relatório de execução completo"
```

## ⚡ SEQUÊNCIA MANDATÓRIA DE EXECUÇÃO

### 1. **🔍 INICIALIZAÇÃO & ANÁLISE**

```bash
# MANDATORY FIRST STEPS
- Use mcp_archon_find_projects para localizar o projeto pelo ID
- Use mcp_archon_find_tasks para listar TODAS as tasks do projeto
- Analise dependências e ordem de execução
- Crie plano de execução detalhado
```

### 2. **📋 EXECUÇÃO DAS TASKS COM TDD ORCHESTRATOR**

#### **Parallel Execution Engine Integration**

```yaml
PARALLEL_EXECUTION_ENGINE:
  coordinator: "tdd-orchestrator"
  max_concurrent_tasks: 50
  resource_management: "adaptive"
  load_balancing: "intelligent"
  performance_monitoring: "real_time"

  execution_strategies:
    parallel_execution:
      - "Independent tasks executed simultaneously"
      - "Resource allocation optimization"
      - "Dynamic agent scaling"
      - "Intelligent load balancing"

    sequential_execution:
      - "Dependent tasks executed in order"
      - "Systematic handoff validation"
      - "Quality gate enforcement"
      - "Progress tracking"

    hybrid_execution:
      - "Mixed workflows with adaptive coordination"
      - "Dynamic dependency resolution"
      - "Resource optimization"
      - "Performance scaling"
```

```bash
# PARA CADA TASK DO PROJETO (COM PARALELISMO AVANÇADO):
LOOP_PRINCIPAL:
  1. mcp_archon_manage_task("update", task_id="[ID]", status="doing")
  2. @tdd-orchestrator "coordinate task execution with parallel optimization"
  3. EXECUTAR a implementação da task conforme descrição (paralelo quando possível)
  4. @tdd-orchestrator "coordinate parallel validation with multi-agent review"
  5. REVISAR o código/implementação criada (execução paralela de revisores)
  6. TESTAR e VALIDAR funcionamento (execução paralela de testes)
  7. Se ERROS encontrados → IR PARA CORREÇÃO PARALELA
  8. Se SEM ERROS → mcp_archon_manage_task("update", task_id="[ID]", status="review")
```

### 3. **🔧 CORREÇÃO AUTOMÁTICA DE ERROS COM TDD ORCHESTRATOR**

#### **Parallel Error Recovery System**

```yaml
PARALLEL_ERROR_RECOVERY:
  coordinator: "tdd-orchestrator"
  max_concurrent_fixes: 10
  recovery_strategies:
    immediate_recovery:
      - "Real-time error detection"
      - "Parallel multi-agent fixes"
      - "Simultaneous validation"
      - "Continuous post-fix monitoring"
    systematic_recovery:
      - "Complete dependency analysis"
      - "Coordinated prioritized fixes"
      - "Cascading validation with quality gates"
      - "Error pattern documentation"
```

```bash
# PROCESSO DE CORREÇÃO PARALELA:
CORREÇÃO_LOOP:
  1. @tdd-orchestrator "coordinate parallel error detection and analysis"
  2. IDENTIFICAR todos os erros (syntax, logic, tests, lint, type) em paralelo
  3. @tdd-orchestrator "coordinate parallel systematic error fixing"
  4. CORRIGIR cada erro sistematicamente com múltiplos agentes
  5. @tdd-orchestrator "coordinate parallel test re-execution and validation"
  6. RE-EXECUTAR testes e validações em paralelo
  7. Se ainda há ERROS → REPETIR correção paralela
  8. Se SEM ERROS → @tdd-orchestrator "validate parallel recovery completion"
  9. CONTINUAR para próxima task com coordenação otimizada
```

### 4. **✅ VALIDAÇÃO FINAL & MOVIMENTAÇÃO COM TDD ORCHESTRATOR**

#### **Parallel Final Validation System**

```yaml
PARALLEL_VALIDATION_SYSTEM:
  coordinator: "tdd-orchestrator"
  max_concurrent_validations: 20
  validation_strategies:
    parallel_validation:
      - "Multi-agent final review"
      - "Simultaneous test execution"
      - "Cross-validation with quality gates"
      - "Real-time progress monitoring"
    comprehensive_validation:
      - "Complete dependency validation"
      - "Performance benchmark validation"
      - "Security compliance verification"
      - "Architecture pattern validation"
```

```bash
# APÓS TODAS AS TASKS EXECUTADAS (VALIDAÇÃO PARALELA):
VALIDAÇÃO_FINAL:
  1. @tdd-orchestrator "coordinate parallel final validation with multi-agent review"
  2. REVISAR todas as tasks implementadas (execução paralela de revisores)
  3. @tdd-orchestrator "coordinate comprehensive parallel test execution"
  4. EXECUTAR suite completa de testes (execução paralela maximizada)
  5. @tdd-orchestrator "coordinate parallel error detection and final fixes"
  6. VERIFICAR que NÃO há erros pendentes (validação paralela completa)
  7. @tdd-orchestrator "validate 100% completude with parallel confirmation"
  8. mcp_archon_manage_task("update", task_id="[ID]", status="done") PARA TODAS
```

## 🧠 FRAMEWORK DE EXECUÇÃO AVANÇADO

```yaml
COGNITIVE_APPROACH:
  mantra: "Execute → Revise → Corrija → Valide → Mova"

PRINCÍPIOS_OBRIGATÓRIOS:
  - "NUNCA pular etapas de revisão"
  - "NUNCA mover task para 'done' com erros"
  - "SEMPRE corrigir TODOS os erros encontrados"
  - "SEMPRE validar implementação antes de finalizar"
  - "SEMPRE usar ferramentas MCP adequadas"
  - "MAXIMIZAR execução paralela sempre que possível"
  - "OTIMIZAR uso de recursos com alocação dinâmica"

FERRAMENTAS_MCP_PRINCIPAIS:
  archon: "Gerenciamento de tasks e projetos"
  serena: "Análise e manipulação de código"
  desktop-commander: "Operações de arquivo e sistema"
  sequential-thinking: "Análise cognitiva de problemas complexos"
  tdd-orchestrator: "Coordenação multi-agente e execução paralela"
```

### **TDD Orchestrator Integration Framework**

```yaml
TDD_ORCHESTRATOR_FRAMEWORK:
  version: "3.0.0"
  parallel_execution: true
  max_concurrent_agents: 50
  coordination_engine: "multi_factor_analysis"
  resource_optimization: "adaptive"

  agent_coordination:
    dynamic_selection: true
    capability_matching: true
    load_balancing: "intelligent"
    conflict_resolution: "automated"

  task_execution:
    atomic_subtask_division: true
    dependency_resolution: "real_time"
    parallel_scaling: "auto"
    performance_monitoring: "continuous"

  quality_automation:
    automated_gates: true
    parallel_validation: true
    predictive_analysis: true
    continuous_improvement: true
```

## 📊 CHECKLIST DE QUALIDADE

```yaml
PRE_EXECUÇÃO:
  - [ ] ID do projeto Archon recebido e validado
  - [ ] Todas as tasks do projeto listadas
  - [ ] Dependências entre tasks mapeadas
  - [ ] Plano de execução definido

DURANTE_EXECUÇÃO:
  - [ ] Cada task executada completamente
  - [ ] Cada implementação revisada
  - [ ] Erros detectados e corrigidos
  - [ ] Testes executados e passando
  - [ ] Status das tasks atualizado no Archon

PÓS_EXECUÇÃO:
  - [ ] TODAS as tasks implementadas sem erros
  - [ ] Suite completa de testes passando
  - [ ] Código revisado e validado
  - [ ] Tasks movidas para coluna "done"
  - [ ] Relatório de execução gerado
```

## 🔄 TRATAMENTO DE ERROS & RECUPERAÇÃO AVANÇADO

```yaml
ESTRATÉGIA_ERRO_PARALELA:
  detecção:
    - "Erros de syntax (TypeScript, ESLint)"
    - "Falhas de teste (unit, integration, e2e)"
    - "Problemas de tipo (type-check)"
    - "Erros de runtime"
    - "Problemas de linting/formatting"
    - "Coordenação entre agentes"
    - "Gerenciamento de recursos"

  correção_paralela:
    - "@tdd-orchestrator coordena correção em paralelo"
    - "Análise root-cause multi-agente (serena MCP + context7 MCP)"
    - "Aplicação de fixes incrementais em paralelo"
    - "Re-execução paralela de testes após cada fix"
    - "Validação cruzada de que fix não quebra outras funcionalidades"

  validação_paralela:
    - "@tdd-orchestrator coordena validação paralela"
    - "Confirmação paralela de que erro específico foi resolvido"
    - "Verificação paralela de que não foram introduzidos novos erros"
    - "Execução paralela de suite completa de testes"
    - "Validação multi-agente de que funcionalidade está operacional"

  recuperação_automática:
    - "Detecção automática de padrões de erro"
    - "Correção baseada em padrões pré-configurados"
    - "Recuperação de estado com validação"
    - "Retentativa inteligente com backoff exponencial"
    - "Aprendizado contínuo de padrões de erro"
```

### **TDD Orchestrator Error Recovery Pipeline**

```yaml
TDD_ERROR_RECOVERY:
  coordinator: "tdd-orchestrator"
  parallel_recovery: true
  max_concurrent_fixes: 10
  recovery_strategies:
    immediate_recovery:
      - "Erro detection em tempo real"
      - "Correção paralela com múltiplos agentes"
      - "Validação simultânea de fixes"
      - "Monitoramento contínuo pós-correção"

    systematic_recovery:
      - "Análise completa de dependências"
      - "Correção coordenada com priorização"
      - "Validação em cascata com qualidade gates"
      - "Documentação de padrões de erro"

    predictive_recovery:
      - "Prevenção proativa de erros conhecidos"
      - "Validação preditiva de impacto"
      - "Otimização preventiva de recursos"
      - "Aprendizado contínuo de falhas"
```

## 📋 TEMPLATE DE EXECUÇÃO OTIMIZADO

**Para usar este prompt com TDD Orchestrator:**

1. **Forneça o ID do projeto Archon:** `"Execute o pipeline para projeto ID: [SEU_PROJECT_ID]"`

2. **O TDD Orchestrator executará automaticamente:**
   - Análise de complexidade e padrão de execução
   - Alocação dinâmica de agentes (até 50 concorrentes)
   - Coordenação inteligente de recursos
   - Execução paralela de tasks independentes
   - Validação em cascata com qualidade gates
   - Recuperação automática de erros
   - Monitoramento contínuo de performance

3. **Aguarde o relatório final** com status de todas as tasks, métricas de performance e otimizações aplicadas

### **TDD Orchestrator Execution Matrix**

```yaml
EXECUTION_MATRIX:
  complexity_analysis:
    low_complexity:
      agents: ["apex-dev"]
      parallel_mode: "single_agent"
      estimated_performance_gain: "3-5x"

    medium_complexity:
      agents: ["apex-dev", "apex-researcher", "apex-ui-ux-designer"]
      parallel_mode: "coordinated_parallel"
      estimated_performance_gain: "8-12x"

    high_complexity:
      agents:
        [
          "tdd-orchestrator",
          "apex-dev",
          "code-reviewer",
          "security-auditor",
          "architect-review",
        ]
      parallel_mode: "full_parallel_orchestration"
      estimated_performance_gain: "15-25x"

  resource_allocation:
    dynamic_scaling: true
    max_concurrent_agents: 50
    agent_utilization_target: "≥90%"
    memory_optimization: "adaptive"
    cpu_load_balancing: "intelligent"
```

## 🚨 REGRAS CRÍTICAS OTIMIZADAS

```yaml
NUNCA:
  - Pular revisão de código implementado
  - Mover task para "done" com erros conhecidos
  - Assumir sucesso sem validação explícita
  - Parar execução antes de completar TODAS as tasks
  - Ignorar falhas de teste ou problemas de type-check
  - Subestimar capacidade de execução paralela do TDD Orchestrator
  - Limitar agentes quando coordenação permitir maior throughput

SEMPRE:
  - Executar TODAS as etapas do pipeline com coordenação otimizada
  - Corrigir TODOS os erros encontrados com recuperação paralela
  - Validar implementação antes de finalizar com múltiplos agentes
  - Usar ferramentas MCP apropriadas com alocação inteligente
  - Gerar logs detalhados de execução e performance
  - Confirmar 100% de completude antes de finalizar
  - Maximizar execução paralela sempre que benefício > overhead
  - Ajustar dinamicamente recursos baseado em métricas em tempo real

TDD_ORCHESTRATOR_MANDATORY:
  - Análise de complexidade antes de alocação de agentes
  - Coordenação inteligente de recursos e prioridades
  - Execução paralela otimizada com monitoramento contínuo
  - Recuperação automática de erros com múltiplos agentes
  - Validação em cascata com qualidade gates automatizados
  - Otimização contínua baseada em métricas de performance
```

### **Critical Success Factors com Parallel Execution**

```yaml
PARALLEL_SUCCESS_FACTORS:
  coordination_quality:
    - "Multi-factor analysis para pattern determination"
    - "Dynamic agent selection baseado em capabilities"
    - "Intelligent resource allocation com load balancing"
    - "Real-time performance monitoring e ajustes"

  efficiency_targets:
    - "Agent utilization ≥90% para alta carga"
    - "Task completion 15-25x mais rápido para complexidade alta"
    - "Resource optimization com scaling automático"
    - "Error recovery tempo ≤10% do tempo de execução normal"

  quality_assurance:
    - "Parallel validation com múltiplos agentes especializados"
    - "Cross-validation entre resultados de agentes diferentes"
    - "Automated quality gates com thresholds adaptativos"
    - "Continuous improvement baseado em padrões de erro"
```

---

**🔧 Uso:** Forneça apenas o ID do projeto Archon e este prompt executará todo o pipeline automaticamente com coordenação TDD Orchestrator.
**⚡ Resultado:** Todas as tasks completadas, revisadas, sem erros e movidas para "done" com performance otimizada de 15-25x.

## 🎯 MÉTRICAS DE PERFORMANCE OTIMIZADAS

### **TDD Orchestrator Performance Benchmarks**

```yaml
PERFORMANCE_TARGETS:
  execution_speed:
    low_complexity_tasks: "3-5x mais rápido"
    medium_complexity_tasks: "8-12x mais rápido"
    high_complexity_tasks: "15-25x mais rápido"
    parallel_efficiency: "≥90% utilization"

  resource_optimization:
    agent_allocation: "Dynamic scaling 1-50 agentes"
    memory_usage: "Adaptive optimization"
    cpu_balancing: "Intelligent load distribution"
    error_recovery: "≤10% overhead total"

  quality_metrics:
    validation_coverage: "100% com múltiplos agentes"
    error_detection: "Real-time com parallel scanning"
    compliance_validation: "Automated e cross-checked"
    code_quality: "≥9.5/10 padrão NEONPRO"
```

### **Monitoring & Optimization Contínuo**

```yaml
CONTINUOUS_OPTIMIZATION:
  real_time_monitoring:
    - "Agent performance tracking"
    - "Resource utilization metrics"
    - "Task completion rates"
    - "Error pattern analysis"

  adaptive_adjustment:
    - "Dynamic agent scaling"
    - "Resource reallocation"
    - "Priority rebalancing"
    - "Performance tuning"

  learning_system:
    - "Pattern recognition"
    - "Success rate optimization"
    - "Error prevention"
    - "Best practices evolution"
```

## 🏆 TDD ORCHESTRATOR EXCELLENCE FRAMEWORK

### **Excellence Metrics**

```yaml
EXCELLENCE_FRAMEWORK:
  coordination_excellence:
    multi_factor_analysis: "100% das tasks"
    dynamic_optimization: "Real-time adjustment"
    parallel_efficiency: "≥90% utilization"
    resource_awareness: "Intelligent allocation"

  execution_excellence:
    atomic_subtask_division: "Precision granularity"
    dependency_resolution: "Real-time optimization"
    quality_gate_automation: "Cascading validation"
    error_recovery_system: "Multi-agent coordination"

  performance_excellence:
    scaling_capability: "1-50 agentes dinâmicos"
    load_balancing: "Intelligent distribution"
    monitoring_system: "Real-time insights"
    continuous_improvement: "Adaptive optimization"
```

> **🚀 ARCHON-TASKS V3.0 COM TDD ORCHESTRATOR**: Pipeline de automação completa com execução paralela inteligente, coordenação multi-agente avançada, e otimização contínua para máxima eficiência e qualidade.
