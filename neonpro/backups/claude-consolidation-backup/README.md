# NeonPro Code Guardian - Healthcare AI Development Agent

## 🛡️ Comprehensive Code Analysis & Healthcare Compliance Agent

**NeonPro Code Guardian** é um agente especializado que combina 4 capacidades de especialistas em uma única entidade coordenada pelo VoidBeast V4.0, otimizado para desenvolvimento de aplicações de saúde com compliance LGPD/ANVISA/CFM.

## 🎯 Visão Geral

### Especialistas Consolidados (4-em-1)
- 🔍 **Code Analysis & Review** - Qualidade, segurança e manutenibilidade
- 🐛 **Bug Investigation & Debugging** - Análise sistemática de causa raiz
- ✅ **Quality Assurance & Validation** - QA sênior com refatoração ativa
- 🏗️ **Architecture & Business Analysis** - Validação estratégica e compliance

### Healthcare Specialization
- **LGPD Compliance**: Proteção de dados de pacientes e gestão de consentimento
- **ANVISA Compliance**: Padrões de software como dispositivo médico
- **CFM Compliance**: Regulamentações de saúde digital
- **Performance Healthcare**: <100ms para acesso a dados de pacientes

## 🚀 Guia de Uso Rápido

### Ativação Principal
```bash
/neonpro-guardian
```
Ativa o agente completo com workflow APEX de 7 etapas e coordenação MCP inteligente.

### Comandos Especializados
```bash
/analyze-code        # Foco em análise e revisão de código
/debug-issue         # Especialização em debugging e resolução de problemas
/validate-quality    # Validação QA e refatoração ativa
/audit-architecture  # Auditoria arquitetural e análise de negócio
```

## 📋 Workflow APEX (7 Etapas)

### 1. **INITIALIZE** - Validação de Compliance Arquitetural
- Verificar alinhamento com especificações NeonPro healthcare
- Identificar requisitos de compliance (LGPD/ANVISA/CFM)
- Definir escopo e critérios de sucesso (≥9.5/10)

### 2. **ANALYZE** - Análise Multi-Dimensional
- **Code Review**: Qualidade, segurança, manutenibilidade
- **Architecture**: Alinhamento com padrões NeonPro e healthcare
- **Business Logic**: Verificar suporte aos objetivos de saúde
- **Compliance**: Validação LGPD/ANVISA/CFM

### 3. **RESEARCH** - Investigação AI-Powered
- **Context7**: Validação contra documentação oficial
- **Tavily**: Melhores práticas atuais e tendências healthcare
- **Exa**: Implementações de especialistas e fontes autoridade
- **Sequential-Thinking**: Cadeias de raciocínio complexo

### 4. **PLAN** - Design Estratégico de Solução
- Soluções que atendem problemas identificados
- Priorizar intervenções baseadas em criticidade healthcare
- Considerar performance, segurança e implications compliance
- Planejar abordagem de teste e validação

### 5. **EXECUTE** - Implementação Ativa
- Escrever código corrigido/refatorado com explicações
- Implementar testes e validação faltantes
- Adicionar medidas de compliance healthcare onde necessário
- Documentar mudanças e reasoning para aprendizado

### 6. **VALIDATE** - Garantia de Qualidade Multi-Dimensional
- **Qualidade**: Verificar padrão ≥9.5/10 mantido
- **Funcionalidade**: Todos requisitos e acceptance criteria atendidos
- **Performance**: Alvos healthcare validados (<100ms API response)
- **Segurança**: OWASP Top 10 e proteção de dados healthcare
- **Compliance**: 100% LGPD/ANVISA/CFM verificação

### 7. **OPTIMIZE** - Relatório e Aprendizado
- Gerar relatório estruturado final
- Capturar learnings e padrões
- Fornecer recomendações para prevenção futura
- Próximos passos e melhoria contínua

## 🔌 Coordenação MCP Inteligente

### Roteamento Baseado em Complexidade
- **Complexidade 1-3**: Context7 + Desktop-Commander (eficiência focada)
- **Complexidade 4-6**: + Sequential-Thinking + pesquisa seletiva
- **Complexidade 7-10**: Orquestração completa MCP com especialização healthcare

### MCPs Utilizados
- **Context7**: Validação de documentação e padrões healthcare
- **Sequential-Thinking**: Cadeias de raciocínio complexo e análise causa raiz
- **Desktop-Commander**: Operações de arquivo e análise de código local
- **Tavily**: Pesquisa em tempo real e tendências healthcare
- **Exa**: Implementações de especialistas e fontes autoridade
- **Supabase-MCP**: Validação de compliance e teste de banco

## 🏥 Especialização Healthcare

### Padrões de Compliance LGPD
```typescript
// Isolamento multi-tenant obrigatório
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', session.user.id) // Isolamento multi-tenant

// Trilha de auditoria para acesso de dados de pacientes
await supabase.from('audit_log').insert({
  user_id: session.user.id,
  action: 'view_patients',
  resource: 'patients',
  clinic_id: session.user.id,
  timestamp: new Date().toISOString()
})
```

### Validação de Performance Healthcare
- **Acesso a Dados de Pacientes**: <100ms (P95)
- **Operações Críticas Médicas**: <200ms
- **Disponibilidade do Sistema**: ≥99.99% uptime para operações clínicas
- **Eficiência de Workflow**: ≥75% redução de overhead administrativo

### Integração com Dispositivos Médicos
- **FHIR**: Padrões de interoperabilidade healthcare
- **HL7**: Protocolos de comunicação médica
- **ANVISA**: Compliance de software como dispositivo médico
- **CFM**: Regulamentações de telemedicina

## 🛡️ Sistema VoidBeast V4.0

### Enforcement Absoluto
- **Quality Gates**: ≥9.5/10 blocking automático
- **Healthcare Compliance**: 100% LGPD/ANVISA/CFM enforcement
- **Performance Monitoring**: Validação tempo real contra targets
- **Melhoria Contínua**: Integração de learning para otimização padrões

### Hooks Configurados
- **Pre-task Validation**: Detecção de contexto healthcare e assessment complexidade
- **Quality Enforcement**: Validação contínua ≥9.5/10 com blocking
- **Healthcare Compliance**: Verificação automática LGPD/ANVISA/CFM

## 📊 Métricas de Qualidade

| Métrica | Target | Status |
|---------|--------|--------|
| Code Quality Score | ≥9.5/10 | ✅ Enforced |
| Healthcare Compliance | 100% | ✅ LGPD/ANVISA/CFM |
| Performance (Patient Data) | <100ms | ✅ Monitored |
| Security Validation | OWASP + Healthcare | ✅ Comprehensive |
| Test Coverage | ≥90% Critical Paths | ✅ Healthcare Focus |
| Anthropic Compliance | 100% | ✅ Official Guidelines |

## 🔧 Troubleshooting

### Problemas Comuns

#### Agent Não Ativando
```bash
# Verificar se arquivo existe
ls .claude/agents/neonpro-code-guardian.md

# Validar YAML frontmatter
head -10 .claude/agents/neonpro-code-guardian.md
```

#### Comandos Slash Não Funcionando
```bash
# Verificar comandos criados
ls .claude/commands/neonpro-*.md
ls .claude/commands/analyze-*.md
ls .claude/commands/debug-*.md
ls .claude/commands/validate-*.md
ls .claude/commands/audit-*.md
```

#### Quality Gates Bloqueando
- Verificar score ≥9.5/10 em todas dimensões
- Garantir compliance LGPD com isolamento multi-tenant
- Implementar trilhas de auditoria para dados de pacientes
- Adicionar criptografia para informações médicas sensíveis

## 📚 Recursos Adicionais

### Arquivos de Configuração
- `.claude/agents/neonpro-code-guardian.md` - Agente principal
- `.claude/mcp-config.json` - Configuração MCP inteligente
- `.claude/hooks/` - Scripts VoidBeast V4.0 enforcement
- `.claude/commands/` - Comandos slash interface

### Documentação de Referência
- `validation-report.md` - Relatório de validação completo
- `CLAUDE.md` - Instruções principais VoidBeast V4.0
- `docs/architecture.md` - Especificações arquiteturais NeonPro
- `docs/front-end-spec.md` - Padrões frontend healthcare

## 🎯 Próximos Passos

1. **Teste Prático**: Use `/neonpro-guardian` em código real
2. **Validação Compliance**: Execute análise LGPD em features existentes
3. **Performance Optimization**: Aplique em workflows críticos healthcare
4. **Feedback Loop**: Monitore qualidade e ajuste conforme necessário

---

**VoidBeast V4.0 Coordinated Excellence**: Zero Tolerance for Quality Compromise  
**NeonPro Healthcare Optimization**: Specialized for Brazilian Clinic Management  
**Multi-Specialist Integration**: 4 Expert Capabilities Unified for Maximum Effectiveness