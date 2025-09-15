# NeonPro Cline Workflows

Este diretório contém workflows Cline para o projeto NeonPro, transformando prompts existentes em workflows estruturados e executáveis.

## 📁 Estrutura dos Workflows

```
.cline/workflows/
├── config.json                    # Configuração principal
├── development/                   # Workflows de desenvolvimento
│   ├── code-quality-audit.json   # Auditoria de qualidade de código
│   ├── spec-driven-development.json # Desenvolvimento guiado por especificações
│   └── task-generation.json      # Geração de tarefas atômicas
├── specification/                # Workflows de especificação
│   ├── feature-specification.json # Criação de especificações de features
│   └── implementation-planning.json # Planejamento de implementação
├── operations/                   # Workflows de operações
│   ├── repository-cleanup.json   # Limpeza segura do repositório
│   └── vercel-deployment.json   # Deploy Vercel unificado
├── optimization/                 # Workflows de otimização
│   └── prompt-enhancement.json  # Aprimoramento de prompts
└── README.md                    # Esta documentação
```

## 🚀 Como Usar os Workflows

### Pré-requisitos

1. **Cline MCP Tools**: Garanta que as ferramentas MCP necessárias estejam disponíveis
2. **Configuração**: Verifique o arquivo `config.json` para mapeamentos de workflows
3. **Permissões**: Tenha as permissões necessárias para executar comandos e acessar arquivos

### Executando Workflows

#### Via Cline Interface
```bash
# Executar workflow de auditoria de qualidade
cline workflow execute development/code-quality-audit

# Executar workflow de desenvolvimento guiado por specs
cline workflow execute development/spec-driven-development

# Executar workflow de limpeza do repositório
cline workflow execute operations/repository-cleanup
```

#### Via MCP Tools
Os workflows são projetados para serem executados através das ferramentas MCP especificadas:

- **desktop-commander**: Para comandos de terminal e manipulação de arquivos
- **archon**: Para gerenciamento de documentos e conhecimento
- **serena**: Para análise de código e validação
- **sequential-thinking**: Para raciocínio estruturado
- **supabase**: Para operações de banco de dados

## 📋 Guia de Workflows

### Development Workflows

#### 1. Code Quality Audit
**Arquivo**: `development/code-quality-audit.json`  
**Descrição**: Auditoria abrangente de qualidade de código e integração  
**Complexidade**: Alta  
**MCP Tools**: sequential-thinking, archon, serena, desktop-commander, supabase  

**Quando usar**:
- Antes de merges para main
- Após grandes mudanças no código
- Para validação de compliance LGPD

**Saída esperada**:
- Relatório de qualidade em `quality-report.txt`
- Validação de integração backend↔database
- Verificação de compliance LGPD
- Análise de testes e cobertura

#### 2. Spec-Driven Development
**Arquivo**: `development/spec-driven-development.json`  
**Descrição**: Transforma requisições de usuário em PRDs, planos e tarefas  
**Complexidade**: Alta  
**MCP Tools**: sequential-thinking, archon, tavily, context7  

**Quando usar**:
- Para novas features
- Quando há requisições não estruturadas
- Para planejamento completo de desenvolvimento

**Saída esperada**:
- PRD completo no Archon
- Plano de implementação validado
- Lista de tarefas atômicas com dependências
- Documentação da feature

#### 3. Task Generation
**Arquivo**: `development/task-generation.json`  
**Descrição**: Gera tarefas atômicas a partir de PRDs e planos  
**Complexidade**: Média  
**MCP Tools**: archon, serena  

**Quando usar**:
- Após criar PRD e plano de implementação
- Para dividir features em tarefas executáveis
- Para planejamento detalhado de sprints

**Saída esperada**:
- Arquivo `tasks.md` com tarefas numeradas
- Marcação de paralelização [P]
- Critérios de aceitação claros
- Integração com Archon

### Specification Workflows

#### 4. Feature Specification
**Arquivo**: `specification/feature-specification.json`  
**Descrição**: Cria especificações de features a partir de linguagem natural  
**Complexidade**: Média  
**MCP Tools**: desktop-commander  

**Quando usar**:
- Para iniciar desenvolvimento de novas features
- Quando há descrições informais de requisitos
- Para padronizar especificações

**Saída esperada**:
- Branch de feature criado
- Arquivo de especificação estruturado
- Template preenchido com detalhes concretos

#### 5. Implementation Planning
**Arquivo**: `specification/implementation-planning.json`  
**Descrição**: Executa template de planejamento de implementação  
**Complexidade**: Alta  
**MCP Tools**: desktop-commander, archon  

**Quando usar**:
- Após criar especificação de feature
- Para planejamento técnico detalhado
- Antes de gerar tarefas de implementação

**Saída esperada**:
- Artefatos de design (research.md, data-model.md, contracts/)
- Plano de implementação completo
- Validação constitucional
- Pronto para geração de tarefas

### Operations Workflows

#### 6. Repository Cleanup
**Arquivo**: `operations/repository-cleanup.json`  
**Descrição**: Sistema de limpeza segura do repositório  
**Complexidade**: Alta  
**MCP Tools**: sequential-thinking, archon, serena, desktop-commander  

**Quando usar**:
- Para limpar arquivos temporários e caches
- Manutenção regular do repositório
- Antes de releases importantes

**Modos de execução**:
- **DRY-RUN** (padrão): Apenas análise, sem alterações
- **APPLY**: Executa limpeza (requer confirmação explícita)

**Categorias de limpeza**:
- Temporários (*.tmp, *.cache, node_modules/.cache/)
- Logs (*.log, npm-debug.log*)
- Backups (*.backup, *.old)
- Reports (coverage/, test-results/)
- Órfãos (arquivos não referenciados)

#### 7. Vercel Deployment
**Arquivo**: `operations/vercel-deployment.json`  
**Descrição**: Sistema de deploy Vercel unificado com compliance  
**Complexidade**: Média  
**MCP Tools**: desktop-commander  

**Quando usar**:
- Para deploys de produção
- Para deploys de preview
- Validação de compliance pós-deploy

**Estratégias de build**:
- **Turborepo** (padrão): ~45s, 85% cache hit
- **Bun**: ~60s, 70% cache hit
- **NPM**: ~90s, 60% cache hit

**Compliance healthcare**:
- Validação LGPD automática
- Audit logging
- Verificação de componentes healthcare

### Optimization Workflows

#### 8. Prompt Enhancement
**Arquivo**: `optimization/prompt-enhancement.json`  
**Descrição**: Aprimora prompts com layered reasoning e validation gates  
**Complexidade**: Média  
**MCP Tools**: Nenhuma (análise estática)  

**Quando usar**:
- Para melhorar prompts existentes
- Adicionar validação constitucional
- Padronizar estrutura de prompts

**Fases de aprimoramento**:
1. **Análise**: Extrai requisitos explícitos e implícitos
2. **Enhancement**: Aplica layered reasoning e validation gates
3. **Compliance**: Garante conformidade constitucional
4. **Optimization**: Otimiza para performance e maintainability
5. **Validation**: Valida critérios de qualidade

## 🔧 Configuração

### Arquivo config.json

O arquivo de configuração principal mapeia workflows e define requisitos MCP:

```json
{
  "workflows": {
    "development": {
      "code-quality-audit": {
        "name": "Code Quality Audit",
        "file": "development/code-quality-audit.json",
        "mcp_tools": ["sequential-thinking", "archon", "serena", "desktop-commander", "supabase"]
      }
    }
  },
  "mcp_requirements": {
    "mandatory": ["sequential-thinking", "archon", "serena", "desktop-commander"],
    "optional": ["tavily", "context7", "supabase"]
  }
}
```

### MCP Tools Necessárias

| Ferramenta | Descrição | Workflows que usam |
|------------|-----------|-------------------|
| sequential-thinking | Raciocínio estruturado | Code Quality, Repository Cleanup |
| archon | Gestão de documentos e conhecimento | Spec-Driven, Task Gen, Repository Cleanup |
| serena | Análise de código e validação | Code Quality, Task Gen, Repository Cleanup |
| desktop-commander | Comandos de terminal e arquivos | Todos os workflows |
| supabase | Operações de banco de dados | Code Quality Audit |
| tavily | Pesquisa e validação externa | Spec-Driven Development |
| context7 | Documentação oficial e APIs | Spec-Driven Development |

## 🏛️ Princípios Constitucionais

Todos os workflows seguem os princípios constitucionais do NeonPro:

1. **KISS/YAGNI**: Manter a simplicidade e evitar complexidade desnecessária
2. **Test-First Development**: RED → GREEN → REFACTOR
3. **Compliance Gates**: Validação de qualidade e segurança
4. **Healthcare Compliance**: LGPD/ANVISA/CFM para dados de saúde
5. **Monorepo Structure**: Seguir estrutura e padrões estabelecidos

## 📊 Métricas de Sucesso

### Qualidade dos Workflows
- **Executabilidade**: 100% dos workflows executáveis com MCP tools
- **Documentação**: Guias claros e exemplos práticos
- **Integração**: Aproveitamento máximo das ferramentas MCP
- **Consistência**: Padrão estrutural mantido em todos os workflows

### Benefícios Esperados
- **Padronização**: Todos os workflows seguem o mesmo padrão
- **Eficiência**: Redução de tempo em tarefas repetitivas
- **Qualidade**: Manutenção dos padrões constitucionais
- **Compliance**: Garantia de conformidade healthcare
- **Documentação**: Guias claros para uso e manutenção

## 🚨 Segurança e Compliance

### Healthcare Data Protection
- **LGPD Compliance**: Todos os workflows validam compliance LGPD
- **PHI/PII Protection**: Dados de saúde protegidos em todas as operações
- **Audit Trail**: Operações críticas registradas para auditoria

### Repository Safety
- **Protected Files**: Arquivos críticos nunca são removidos
- **Git Safety**: Apenas arquivos não versionados são afetados
- **Backup System**: Rollback disponível para operações destrutivas

## 🔄 Integração com Ecossistema NeonPro

### Archon Integration
- Documentos persistentes no Archon
- Links entre PRDs, planos e tarefas
- Gestão de conhecimento centralizada

### Template System
- Uso de templates padronizados
- Geração consistente de artefatos
- Validação automática de estrutura

### Testing Integration
- Estratégias de teste inteligentes
- Cobertura diferencial baseada em mudanças
- Validação de compliance em testes

## 📝 Melhorias Futuras

1. **Additional Workflows**: Expandir para cobrir mais cenários de desenvolvimento
2. **Enhanced MCP Integration**: Melhorar integração com novas ferramentas MCP
3. **Performance Optimization**: Otimizar execução de workflows complexos
4. **UI/UX Improvements**: Interface mais amigável para execução de workflows
5. **Advanced Analytics**: Métricas detalhadas de uso e performance

## 🆘 Suporte e Troubleshooting

### Problemas Comuns
1. **MCP Tools Não Disponíveis**: Verificar instalação e configuração das ferramentas MCP
2. **Permissões de Arquivo**: Garantar permissões necessárias para leitura/escrita
3. **Dependências Ausentes**: Verificar se todas as dependências estão instaladas
4. **Configuração Incorreta**: Validar arquivo `config.json` e mapeamentos

### Logs e Debugging
- Os workflows geram logs em `cleanup-logs/` ou diretórios específicos
- Use `--verbose` para saída detalhada durante execução
- Verifique arquivos de manifesto para diagnóstico

### Contato
Para issues ou sugestões:
- Criar issue no repositório NeonPro
- Contatar equipe de desenvolvimento
- Consultar documentação adicional em `docs/`
