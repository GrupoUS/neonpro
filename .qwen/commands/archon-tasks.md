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

### 2. **📋 EXECUÇÃO DAS TASKS**

```bash
# PARA CADA TASK DO PROJETO:
LOOP_PRINCIPAL:
  1. mcp_archon_manage_task("update", task_id="[ID]", status="doing")
  2. EXECUTAR a implementação da task conforme descrição
  3. REVISAR o código/implementação criada
  4. TESTAR e VALIDAR funcionamento
  5. Se ERROS encontrados → IR PARA CORREÇÃO
  6. Se SEM ERROS → mcp_archon_manage_task("update", task_id="[ID]", status="review")
```

### 3. **🔧 CORREÇÃO AUTOMÁTICA DE ERROS**

```bash
# PROCESSO DE CORREÇÃO:
CORREÇÃO_LOOP:
  1. IDENTIFICAR todos os erros (syntax, logic, tests, lint, type)
  2. CORRIGIR cada erro sistematicamente
  3. RE-EXECUTAR testes e validações
  4. Se ainda há ERROS → REPETIR correção
  5. Se SEM ERROS → CONTINUAR para próxima task
```

### 4. **✅ VALIDAÇÃO FINAL & MOVIMENTAÇÃO**

```bash
# APÓS TODAS AS TASKS EXECUTADAS:
VALIDAÇÃO_FINAL:
  1. REVISAR todas as tasks implementadas
  2. EXECUTAR suite completa de testes
  3. VERIFICAR que NÃO há erros pendentes
  4. CONFIRMAR 100% de completude
  5. mcp_archon_manage_task("update", task_id="[ID]", status="done") PARA TODAS
```

## 🧠 FRAMEWORK DE EXECUÇÃO

```yaml
COGNITIVE_APPROACH:
  mantra: "Execute → Revise → Corrija → Valide → Mova"

PRINCÍPIOS_OBRIGATÓRIOS:
  - "NUNCA pular etapas de revisão"
  - "NUNCA mover task para 'done' com erros"
  - "SEMPRE corrigir TODOS os erros encontrados"
  - "SEMPRE validar implementação antes de finalizar"
  - "SEMPRE usar ferramentas MCP adequadas"

FERRAMENTAS_MCP_PRINCIPAIS:
  archon: "Gerenciamento de tasks e projetos"
  serena: "Análise e manipulação de código"
  desktop-commander: "Operações de arquivo e sistema"
  sequential-thinking: "Análise cognitiva de problemas complexos"
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

## 🔄 TRATAMENTO DE ERROS & RECUPERAÇÃO

```yaml
ESTRATÉGIA_ERRO:
  detecção:
    - "Erros de syntax (TypeScript, ESLint)"
    - "Falhas de teste (unit, integration, e2e)"
    - "Problemas de tipo (type-check)"
    - "Erros de runtime"
    - "Problemas de linting/formatting"

  correção:
    - "Análise root-cause com serena MCP"
    - "Consulta documentação com context7 MCP"
    - "Aplicação de fixes incrementais"
    - "Re-execução de testes após cada fix"
    - "Validação de que fix não quebra outras funcionalidades"

  validação:
    - "Confirmar que erro específico foi resolvido"
    - "Verificar que não foram introduzidos novos erros"
    - "Executar suite completa de testes"
    - "Validar que funcionalidade está operacional"
```

## 📋 TEMPLATE DE EXECUÇÃO

**Para usar este prompt:**

1. **Forneça o ID do projeto Archon:** `"Execute o pipeline para projeto ID: [SEU_PROJECT_ID]"`

2. **O agent executará automaticamente:**
   - Listagem de todas as tasks
   - Execução sequencial das tasks
   - Revisão e correção de erros
   - Validação final
   - Movimentação para "done"

3. **Aguarde o relatório final** com status de todas as tasks

## 🚨 REGRAS CRÍTICAS

```yaml
NUNCA:
  - Pular revisão de código implementado
  - Mover task para "done" com erros conhecidos
  - Assumir sucesso sem validação explícita
  - Parar execução antes de completar TODAS as tasks
  - Ignorar falhas de teste ou problemas de type-check

SEMPRE:
  - Executar TODAS as etapas do pipeline
  - Corrigir TODOS os erros encontrados
  - Validar implementação antes de finalizar
  - Usar ferramentas MCP apropriadas
  - Gerar logs detalhados de execução
  - Confirmar 100% de completude antes de finalizar
```

---

**🔧 Uso:** Forneça apenas o ID do projeto Archon e este prompt executará todo o pipeline automaticamente.
**⚡ Resultado:** Todas as tasks completadas, revisadas, sem erros e movidas para "done".
