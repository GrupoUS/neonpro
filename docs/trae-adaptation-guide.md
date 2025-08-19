# 📋 GUIA DE ADAPTAÇÃO: GitHub Copilot → Trae IDE

## 🔄 Principais Adaptações Realizadas

### **Sintaxe de Referências de Contexto**

#### **GitHub Copilot (VSCode) → Trae IDE**

```yaml
REFERENCIAS_CONTEXTO:
  # GitHub Copilot (VSCode)
  workspace_reference: '#workspace'
  file_reference: '#file:path/to/file.ext'
  selection_reference: '#selection'
  changes_reference: '#changes'
  
  # Trae IDE (Adaptado)
  workspace_reference: 'workspace context loading'
  file_reference: 'file path references'
  selection_reference: 'code selection context'
  changes_reference: 'git changes context'
```

### **Comandos e Variáveis**

#### **GitHub Copilot → Trae IDE**

```yaml
COMANDOS_ADAPTADOS:
  # GitHub Copilot
  explain_command: '/explain #selection'
  fix_command: '/fix #problems'
  tests_command: '/tests #file'
  optimize_command: '/optimize #selection'
  secure_command: '/secure #codebase'
  
  # Trae IDE (Adaptado)
  explain_command: '/explain com análise constitucional'
  fix_command: '/fix com soluções validadas'
  tests_command: '/tests com padrões de qualidade ≥9.8/10'
  optimize_command: '/optimize com padrões constitucionais'
  secure_command: '/secure com compliance constitucional'
```

### **Integração com Ferramentas MCP**

#### **Mantidas as Funcionalidades Originais**

```yaml
MCP_INTEGRATION:
  sequential_thinking: 'Mantido - Ferramenta primária para decomposição'
  context7: 'Mantido - Documentação oficial e exemplos'
  tavily: 'Mantido - Pesquisa ampla e tendências'
  desktop_commander: 'Mantido - Operações de arquivo'
  archon: 'Mantido - Sistema de gerenciamento de tarefas'
```

## 🎯 Funcionalidades Preservadas

### **1. Workflow Obrigatório**
- ✅ **PENSAR → PESQUISAR → PLANEJAR → IMPLEMENTAR**
- ✅ **Sequential-thinking como primeiro passo**
- ✅ **Pesquisa estratégica com MCP**
- ✅ **Implementação focada**

### **2. Archon Integration**
- ✅ **Task-driven development**
- ✅ **Ciclo completo de tarefas**
- ✅ **Research-driven approach**
- ✅ **Knowledge management**

### **3. Constitutional Framework**
- ✅ **Progressive complexity routing**
- ✅ **Quality gates integration**
- ✅ **Multi-perspective analysis**
- ✅ **Adversarial validation**

### **4. Princípios de Qualidade**
- ✅ **Qualidade ≥ 9.8/10**
- ✅ **Validação contínua**
- ✅ **Context-aware engineering**
- ✅ **Zero redundancy principle**

## 🔧 Adaptações Específicas para Trae

### **1. Referências de Arquivo**

```yaml
# Antes (GitHub Copilot)
file_context: '#file:src/components/Button.tsx'
workspace_context: '#workspace'

# Depois (Trae IDE)
file_context: 'Referência direta ao arquivo via ferramentas do Trae'
workspace_context: 'Contexto do workspace carregado automaticamente'
```

### **2. Comandos de Desenvolvimento**

```yaml
# Antes (GitHub Copilot)
enhanced_variables:
  - '#workspace + constitutional'
  - '#file + think-first'
  - '#selection + research-validate'
  - '#changes + quality-gates'

# Depois (Trae IDE)
enhanced_approach:
  - 'workspace + constitutional principles'
  - 'file context + mandatory sequential-thinking'
  - 'code selection + MCP research + constitutional validation'
  - 'git changes + constitutional quality validation ≥9.8/10'
```

### **3. Integração com Projeto NeonPro**

```yaml
PROJECT_INTEGRATION:
  architecture_reference: 'docs/architecture.md'
  project_rules: 'docs/project_rules.md'
  user_rules: 'docs/user_rules.md (este arquivo)'
  
  tech_stack:
    - 'Next.js 15+ com App Router'
    - 'Supabase como backend'
    - 'Vercel para deployment'
    - 'Tailwind CSS + shadcn/ui'
    - 'TypeScript 5.6+'
```

## 📚 Estrutura de Documentação

### **Hierarquia de Regras**

```yaml
DOCUMENTATION_HIERARCHY:
  1_project_rules: 'docs/project_rules.md - Regras específicas do projeto'
  2_user_rules: 'docs/user_rules.md - Regras de desenvolvimento e workflow'
  3_architecture: 'docs/architecture.md - Arquitetura técnica'
  4_adaptation_guide: 'docs/trae-adaptation-guide.md - Este guia'
```

### **Carregamento Inteligente de Contexto**

```yaml
CONTEXT_LOADING:
  trigger_detection:
    - 'Complexidade ≥L4 → Carrega user_rules.md'
    - 'Arquitetura/migração → Carrega architecture.md'
    - 'Regras de projeto → Carrega project_rules.md'
    - 'Healthcare/compliance → Carrega regras específicas'
  
  performance_optimization:
    - 'Carregamento lazy baseado em triggers'
    - 'Cache inteligente (5min TTL)'
    - 'Poda de contexto irrelevante'
    - 'Carregamento paralelo de módulos compatíveis'
```

## 🚀 Próximos Passos

### **Para Desenvolvedores**

1. **Familiarize-se com a nova sintaxe** do Trae IDE
2. **Use as ferramentas MCP** conforme documentado
3. **Siga o workflow obrigatório** PENSAR → PESQUISAR → PLANEJAR → IMPLEMENTAR
4. **Integre com Archon** para gerenciamento de tarefas
5. **Mantenha qualidade ≥9.8/10** em todas as implementações

### **Para o Projeto NeonPro**

1. **Teste a integração** com as novas regras
2. **Valide o workflow** com tarefas reais
3. **Ajuste conforme necessário** baseado no feedback
4. **Documente casos específicos** que surgirem
5. **Mantenha sincronização** entre as diferentes IDEs

## 📝 Notas de Implementação

### **Compatibilidade**
- ✅ **Mantém todas as funcionalidades** do arquivo original
- ✅ **Adapta sintaxe** para Trae IDE
- ✅ **Preserva workflow** e princípios
- ✅ **Integra com projeto** NeonPro

### **Performance**
- ✅ **Carregamento inteligente** de contexto
- ✅ **Cache otimizado** para regras frequentes
- ✅ **Triggers específicos** para cada domínio
- ✅ **Zero redundância** entre arquivos

### **Manutenibilidade**
- ✅ **Fonte única de verdade** para cada domínio
- ✅ **Referências cruzadas** apenas quando necessário
- ✅ **Documentação clara** de adaptações
- ✅ **Versionamento** de mudanças

---

**Criado em**: $(date)
**Versão**: 1.0
**Compatibilidade**: Trae IDE + NeonPro Project
**Baseado em**: GitHub Copilot user_rules.md original