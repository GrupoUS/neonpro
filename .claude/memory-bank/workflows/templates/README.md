# Workflow Templates Guide

Este diretório contém templates de workflow sequencial para coordenação inteligente entre agentes especializados do Claude Code. Cada template define padrões otimizados para diferentes tipos de tarefas e níveis de complexidade.

## 📚 Templates Disponíveis

### 1. Complex Development Workflow
**Arquivo:** `complex-development-workflow.yaml`
**Complexidade:** 7/10
**Duração:** 4-6 horas
**Agentes:** Research → Architecture → Development → QA → Consensus

**Ideal para:**
- Desenvolvimento de features complexas com requisitos de pesquisa
- Integrações de sistema críticas
- Implementações que requerem arquitetura cuidadosa
- Desenvolvimento enterprise com padrões de qualidade ≥9.0/10

**Características:**
- Pesquisa comprehensiva de best practices
- Design arquitetural detalhado
- Implementação com cobertura de testes ≥90%
- Validação de qualidade rigorosa
- Consensus building com múltiplas perspectivas

### 2. Research Analysis Workflow
**Arquivo:** `research-analysis-workflow.yaml`
**Complexidade:** 5/10
**Duração:** 2-3 horas
**Agentes:** Research → Architecture → Learning → Consensus

**Ideal para:**
- Avaliação de tecnologias e ferramentas
- Análise de mercado e competitiva
- Investigação de best practices
- Estudos de feasibilidade
- Aquisição e síntese de conhecimento

**Características:**
- Foco em pesquisa profunda e análise
- Avaliação de implicações arquiteturais
- Consolidação de learnings para reuso
- Síntese de insights de múltiplas fontes

### 3. Rapid Development Workflow
**Arquivo:** `rapid-development-workflow.yaml`
**Complexidade:** 4/10
**Duração:** 1.5-2.5 horas
**Agentes:** Architecture → Development → QA → Consensus

**Ideal para:**
- Implementações rápidas de features
- Correção de bugs com validação arquitetural
- Tarefas de desenvolvimento pequenas a médias
- Prototipagem rápida com qualidade
- Entregas time-sensitive

**Características:**
- Guidance arquitetural focado e direto
- Implementação otimizada para velocidade
- Validação de qualidade essencial
- Consensus building streamlined

### 4. QA and Optimization Workflow
**Arquivo:** `qa-optimization-workflow.yaml`
**Complexidade:** 6/10
**Duração:** 2-4 horas
**Agentes:** Architecture Review → QA → Development → Learning → Consensus

**Ideal para:**
- Avaliação e melhoria de qualidade de código
- Otimização de performance e tuning
- Investigação e resolução de bugs
- Assessment de vulnerabilidades de segurança
- Redução de technical debt

**Características:**
- Review arquitetural comprehensivo
- Análise de QA em profundidade
- Implementação de otimizações
- Validação de melhorias de performance
- Consolidação de patterns de otimização

### 5. Decision Consensus Workflow
**Arquivo:** `decision-consensus-workflow.yaml`
**Complexidade:** 5/10
**Duração:** 2-3 horas
**Agentes:** Research → Architecture → Development → QA → Consensus

**Ideal para:**
- Tomada de decisões técnicas complexas
- Avaliação e seleção de arquiteturas
- Seleção de technology stack com trade-off analysis
- Planejamento estratégico multi-stakeholder
- Resolução de conflitos entre abordagens

**Características:**
- Análise comprehensiva de opções
- Perspectivas de múltiplos agentes especializados
- Consensus building robusto
- Documentação de alternativas e rationale
- Estratégias de mitigação de riscos

## 🎯 Seleção de Templates

### Por Complexidade
- **Complexidade 1-3:** Use templates customizados ou agentes individuais
- **Complexidade 4-5:** `rapid-development-workflow.yaml` ou `research-analysis-workflow.yaml`
- **Complexidade 6-7:** `qa-optimization-workflow.yaml` ou `complex-development-workflow.yaml`
- **Complexidade 8-10:** `complex-development-workflow.yaml` com customizações

### Por Objetivo
- **Pesquisa e Análise:** `research-analysis-workflow.yaml`
- **Desenvolvimento Rápido:** `rapid-development-workflow.yaml`
- **Desenvolvimento Complexo:** `complex-development-workflow.yaml`
- **Qualidade e Otimização:** `qa-optimization-workflow.yaml`
- **Tomada de Decisão:** `decision-consensus-workflow.yaml`

### Por Duração Disponível
- **1-2 horas:** `rapid-development-workflow.yaml`
- **2-3 horas:** `research-analysis-workflow.yaml` ou `decision-consensus-workflow.yaml`
- **2-4 horas:** `qa-optimization-workflow.yaml`
- **4-6 horas:** `complex-development-workflow.yaml`

## 🔧 Personalização de Templates

### Modificações Comuns
1. **Ajustar Quality Standards:** Modificar `minimum_quality_score` e critérios específicos
2. **Customizar Duração:** Ajustar `estimated_duration` para cada agente
3. **Adicionar/Remover Agentes:** Modificar sequência de `agents` conforme necessário
4. **Personalizar Quality Gates:** Ajustar critérios de validação
5. **Configurar Memory Integration:** Personalizar pontos de persistência

### Exemplo de Customização
```yaml
# Modificar qualidade mínima para contexto específico
quality_standards:
  minimum_quality_score: 8.0  # Reduzido de 9.0 para prototipagem
  
# Adicionar agent personalizado
agents:
  - agent_id: "custom_security_review"
    agent_type: "apex-qa-debugger"
    execution_order: 2.5
    focus: "security_validation"
```

## 📊 Métricas e Monitoramento

Todos os templates incluem:
- **Performance Monitoring:** Tracking de tempo de execução e qualidade
- **Success Metrics:** Critérios de sucesso específicos para cada workflow
- **Quality Gates:** Checkpoints de validação automáticos
- **Contingency Plans:** Planos de recuperação para falhas

## 🧠 Memory Integration

### Persistent Learning
- **Cross-Session Learning:** Learnings preservados entre sessões
- **Pattern Recognition:** Identificação de patterns de sucesso
- **Knowledge Base Updates:** Atualização contínua da base de conhecimento

### Memory Points
Cada template define pontos específicos onde patterns são capturados:
- Após cada fase de agente
- Durante quality gates
- Após consensus building
- Durante recovery procedures

## 🚀 Próximos Passos

1. **Selecionar Template:** Escolha baseado em complexidade e objetivo
2. **Personalizar se Necessário:** Ajuste para contexto específico
3. **Executar via Workflow Orchestrator:** Use o agente `workflow-orchestrator`
4. **Monitorar Execução:** Acompanhe quality gates e métricas
5. **Capturar Learnings:** Aproveite memory integration para melhoria contínua

## 📝 Contribuição e Evolução

Os templates evoluem baseado em:
- **Execution History:** Análise de execuções passadas
- **Performance Metrics:** Otimização baseada em métricas
- **Learning Patterns:** Integração de patterns aprendidos
- **User Feedback:** Feedback de uso e resultados

Para sugerir melhorias ou novos templates, analise os patterns de execução através do `learning-aggregator` e proponha otimizações baseadas em dados.