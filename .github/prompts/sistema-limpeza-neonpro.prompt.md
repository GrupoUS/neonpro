# 🧹 SISTEMA DE LIMPEZA NEONPRO v2.0 — **Especialista em Otimização e Arquitetura**

## 📋 Prompt Especializado para Limpeza Sistemática Completa

**Versão:** 2.0.0  
**Data:** 28 de Agosto de 2025  
**Projeto:** NEONPRO - Plataforma AI Advanced Aesthetic  
**Contexto:** Monorepo TurboRepo com sistema brownfield

---

## 🎯 OBJETIVO DO PROMPT

**MISSÃO**: Executar limpeza completa e sistemática do projeto D:\neonpro removendo arquivos desnecessários, redundantes e temporários
**META**: Otimização ≥95% de espaço e organização, mantendo 100% da integridade arquitetural  
**MÉTODO**: A.P.T.E (Analyze → Pesquisar → Think → Elaborate) com validação contínua contra arquitetura de referência

---

## 🌐 CONTEXTO DO PROJETO

```yaml
projeto: "NEONPRO - Sistema Brownfield de Healthcare"
ambiente: "D:\neonpro (root) + todas subpastas e packages"
arquitetura_ref: 
  - "D:\neonpro\docs\architecture\source-tree.md"
  - "Estrutura: 3 apps + 24 packages (Turborepo)"
entrada: "Sistema com arquivos redundantes/temporários/obsoletos"
saida: "Sistema limpo e otimizado seguindo source-tree.md"
restricoes:
  - "Manter integridade arquitetural 100%"
  - "Preservar todos os arquivos essenciais"
  - "Seguir source-tree.md rigorosamente"
  - "Backup automático antes de qualquer remoção"
timeline: "Execução completa sem interrupção"
referencias: 
  - "source-tree.md (arquitetura autorizada)"
  - "24 packages + 3 apps estrutura"
hierarquia: "contexto arquitetural → execução segura → validação"
```

---

## 🤖 INSTRUÇÕES PARA O GITHUB COPILOT

### METODOLOGIA OBRIGATÓRIA: A.P.T.E

#### 🔍 ANALYZE (A) - Análise Arquitetural

```
SEMPRE execute primeiro:

1. Leitura obrigatória da arquitetura:
   - Ler e analisar docs/architecture/source-tree.md COMPLETO
   - Mapear estrutura autorizada: 3 apps + 24 packages
   - Identificar arquivos essenciais que NUNCA devem ser removidos
   - Entender hierarquia: apps/ packages/ tools/ docs/ etc.

2. Mapeamento do estado atual:
   - Escanear estrutura atual vs arquitetura de referência
   - Identificar desvios da estrutura padrão
   - Mapear tamanho total (GB) e contagem de arquivos
   - Listar diretórios e arquivos por categoria

3. Análise de conformidade:
   - Verificar se estrutura está conforme source-tree.md
   - Identificar arquivos/diretórios não documentados
   - Mapear arquivos temporários e redundantes
   - Validar integridade dos packages essenciais
```

#### 🔎 PESQUISAR (P) - Identificação de Alvos

```
Catalogar arquivos para remoção segura por categoria:

CATEGORIA 1 - TEMPORÁRIOS (RISCO BAIXO):
- "*.tmp, *.temp, *.cache, *.bak"
- "node_modules/.cache/"
- ".next/cache/, .next/static/chunks/"
- "dist/temp/, build/temp/"
- "turbo/.cache/"

CATEGORIA 2 - LOGS (RISCO BAIXO):
- "*.log, *.log.*, debug.log"
- "logs/*.log, debug/*.log"
- "npm-debug.log*, yarn-debug.log*"
- "lerna-debug.log*"

CATEGORIA 3 - BACKUPS OBSOLETOS (RISCO MÉDIO):
- "*.backup, *.old, *.orig"
- "backup_*/, *_backup/"
- "backup-dependencies/ (arquivos >7 dias)"
- "*.copy, *-copy.*"

CATEGORIA 4 - REPORTS/COVERAGE (RISCO MÉDIO):
- "coverage/, nyc_output/"
- "reports/"
- "*.report, *.coverage"
- "lighthouse-results/"

CATEGORIA 5 - PLACEHOLDERS (RISCO ALTO - VALIDAÇÃO EXTRA):
- "TODO.md sem conteúdo real"
- "placeholder_*, example_* não essenciais"
- "TEMPLATE_*, template_* não utilizados"
- "sample_* arquivos não referenciados"

CATEGORIA 6 - CÓDIGO REDUNDANTE (RISCO ALTO - VALIDAÇÃO EXTRA):
- Arquivos duplicados (mesmo conteúdo, nomes diferentes)
- Código morto não referenciado
- Dependências não utilizadas
- Configurações obsoletas não ativas

⚠️ NUNCA REMOVER SEM VALIDAÇÃO:
- Qualquer arquivo listado em source-tree.md
- package.json, pnpm-lock.yaml
- Arquivos de configuração ativos
- Código fonte dos 24 packages
- Documentação essencial em docs/
```

#### 🧠 THINK (T) - Estratégia de Limpeza Segura

```
Planejar estratégia de execução:

1. BACKUP OBRIGATÓRIO (PRIMEIRA PRIORIDADE):
   - Criar D:\neonpro_backup_[timestamp-YYYYMMDD-HHMMSS]
   - Backup completo da estrutura atual
   - Gerar log detalhado de arquivos a serem removidos
   - Validar integridade do backup (tamanho, arquivos críticos)

2. SEQUÊNCIA DE REMOÇÃO (ORDEM DE SEGURANÇA):
   - Fase 1: Temporários (.tmp, .cache) - Menor risco
   - Fase 2: Logs antigos (*.log) - Risco baixo
   - Fase 3: Backups obsoletos - Risco médio
   - Fase 4: Reports/Coverage - Risco médio
   - Fase 5: Placeholders inúteis - Risco alto (validação extra)
   - Fase 6: Código redundante - Risco alto (validação extra)

3. VALIDAÇÃO CONTÍNUA (APÓS CADA FASE):
   - Verificar estrutura conforme source-tree.md
   - Confirmar que packages essenciais estão intactos
   - Validar que apps/ ainda tem 3 aplicações
   - Confirmar que packages/ ainda tem 24 packages
   - Testar comandos básicos (pnpm install, pnpm build)
```

#### ⚡ ELABORATE (E) - Execução Sistemática

```
Execução controlada e documentada:

1. PREPARAÇÃO (SAFETY FIRST):
   - Criar diretório backup com timestamp
   - Gerar lista completa de arquivos a remover
   - Validar que estamos no diretório D:\neonpro
   - Confirmar acesso de escrita aos diretórios

2. EXECUÇÃO FASE A FASE:
   - Log detalhado: timestamp + ação + resultado
   - Verificação após cada categoria removida
   - Parar IMEDIATAMENTE se alguma validação falhar
   - Documentar cada arquivo removido com justificativa

3. VALIDAÇÃO FINAL (ZERO TOLERÂNCIA A FALHAS):
   - Estrutura DEVE estar 100% conforme source-tree.md
   - Todos os 24 packages DEVEM estar presentes
   - Todas as 3 apps DEVEM estar funcionais
   - pnpm install DEVE executar sem erros
   - Funcionalidade básica DEVE estar preservada

4. RELATÓRIO COMPLETO:
   - Métricas antes/depois (GB, arquivos)
   - Lista de categorias limpas
   - Arquivos removidos com justificativas
   - Validações realizadas
   - Instruções de rollback se necessário
```

---

## 🔒 SALVAGUARDAS CRÍTICAS

### 🚫 NUNCA FAÇA

- ❌ Remover sem consultar source-tree.md primeiro
- ❌ Executar sem backup completo validado
- ❌ Prosseguir se validação arquitetural falhar
- ❌ Remover arquivos dos 24 packages sem confirmação
- ❌ Deletar configurações ativas (package.json, configs)
- ❌ Ignorar falhas em validações intermediárias

### ✅ SEMPRE FAÇA

- ✅ Ler source-tree.md ANTES de qualquer ação
- ✅ Backup completo ANTES de qualquer remoção
- ✅ Validar cada fase antes de prosseguir
- ✅ Documentar TODAS as ações realizadas
- ✅ Confirmar que 3 apps + 24 packages estão intactos
- ✅ Fornecer instruções de rollback

### 🛡️ VALIDAÇÃO ARQUITETURAL CONTÍNUA

```yaml
CHECKPOINT_OBRIGATÓRIO_APÓS_CADA_FASE:
  estrutura_apps: "apps/ deve conter: web/, api/, docs/"
  estrutura_packages: "packages/ deve conter 24 diretórios"
  arquivos_críticos: "package.json, pnpm-lock.yaml, turbo.json"
  configurações: "next.config.*, tailwind.config.*, tsconfig.json"
  documentação: "docs/ deve estar íntegra"
  
CRITÉRIO_PARADA_IMEDIATA:
  - Qualquer package dos 24 for removido acidentalmente
  - source-tree.md não puder ser validado
  - Estrutura divergir da arquitetura autorizada
  - Comandos básicos (pnpm install) falharem
```

---

## 📊 MÉTRICAS DE QUALIDADE

### KPIs de Sucesso Obrigatórios

- **Conformidade Arquitetural**: 10/10 (obrigatório - sem exceções)
- **Segurança da Operação**: ≥9.5/10 (backup + validação contínua)
- **Eficiência de Limpeza**: ≥9.5/10 (otimização significativa)
- **Integridade do Sistema**: 10/10 (zero quebras funcionais)
- **Documentação**: ≥9.5/10 (relatório completo e claro)

### Formato de Relatório Final

```markdown
## 📊 RESULTADOS DA LIMPEZA SISTEMÁTICA NEONPRO

### 📋 ARQUITETURA VALIDADA
- [x] source-tree.md consultado e seguido 100%
- [x] 3 apps preservadas: web/, api/, docs/
- [x] 24 packages preservados e funcionais
- [x] Estrutura monorepo intacta

### 📈 MÉTRICAS DE OTIMIZAÇÃO

| Categoria       | Arquivos Removidos | Espaço Liberado | Status     |
|---------------- |------------------- |---------------- |----------- |
| Temporários     | XXX arquivos       | X.XX GB         | ✅ Limpo   |
| Logs           | XXX arquivos       | X.XX MB         | ✅ Limpo   |
| Backups        | XXX arquivos       | X.XX GB         | ✅ Limpo   |
| Reports        | XXX arquivos       | X.XX MB         | ✅ Limpo   |
| Placeholders   | XXX arquivos       | X.XX MB         | ✅ Limpo   |
| Redundantes    | XXX arquivos       | X.XX MB         | ✅ Limpo   |
| **TOTAL**      | **XXX arquivos**   | **X.XX GB**     | **✅ Otimizado** |

### 🔧 VALIDAÇÕES REALIZADAS
- [x] Backup completo criado: D:\neonpro_backup_[timestamp]
- [x] pnpm install executou sem erros
- [x] Estrutura conforme source-tree.md
- [x] Todos os packages funcionais
- [x] Apps web/api/docs preservadas

### 🎯 RESULTADO FINAL
**Status**: ✅ SUCESSO COMPLETO  
**Otimização**: X.XX GB liberados (X.X% de melhoria)  
**Integridade**: 100% preservada  
**Rollback**: Disponível em backup_[timestamp]/
```

---

## 🚀 COMANDOS PARA USO COM GITHUB COPILOT

### Comando Completo (Recomendado)

```
@copilot Execute limpeza completa do sistema NEONPRO seguindo metodologia A.P.T.E:

**ANALYZE**: Ler docs/architecture/source-tree.md + mapear estrutura atual vs arquitetura (3 apps + 24 packages)

**PESQUISAR**: Identificar arquivos para remoção por categoria (temporários, logs, backups, reports, placeholders, redundantes)

**THINK**: Estratégia segura: backup completo → remoção por fases → validação contínua

**ELABORATE**: Execução com validação arquitetural após cada fase + relatório final completo

**SAFETY**: Backup obrigatório, validação 100% source-tree.md, zero tolerância a quebras

Meta: ≥95% otimização mantendo integridade arquitetural 100%
```

### Comando Análise Somente

```
@copilot Analise projeto NEONPRO para limpeza:
1. Ler source-tree.md e mapear arquitetura autorizada
2. Escanear estrutura atual (tamanho, arquivos)
3. Identificar desvios e oportunidades de limpeza
4. Categorizar arquivos por risco de remoção
5. Relatório com oportunidades SEM executar limpeza
```

### Comando Rollback de Emergência

```
@copilot ROLLBACK de emergência sistema NEONPRO:
1. Localizar backup mais recente: D:\neonpro_backup_*
2. Restaurar estrutura completa do backup
3. Validar integridade: 3 apps + 24 packages
4. Confirmar funcionalidade: pnpm install + build
5. Relatório de recuperação completa
```

---

## 🔄 MANUTENÇÃO E CUSTOMIZAÇÃO

### Versioning do Prompt

- **v2.0.0** - Versão inicial completa (28/08/2025)
- Manter sincronizado com mudanças na arquitetura
- Atualizar conforme evolução dos 24 packages
- Preservar compatibilidade com source-tree.md

### Customização por Evolução

Para adaptar conforme projeto evolui:

1. Ajustar contagem de packages se arquitetura mudar
2. Modificar estrutura de apps se necessário
3. Adaptar validações específicas por funcionalidade
4. Personalizar métricas conforme necessidades

### Integração com Outros Prompts

Este prompt complementa:
- `dependency-cleanup-copilot-prompt.md` (foco em PNPM)
- `quick-dependency-cleanup-prompts.md` (limpeza rápida)

---

**STATUS**: ✅ **PROMPT PRONTO PARA PRODUÇÃO**  
**Qualidade**: 9.5/10 - Otimizado para uso recorrente  
**Segurança**: 10/10 - Backup obrigatório + validação contínua  
**Eficiência**: 9.5/10 - Limpeza sistemática completa

_Prompt especializado para limpeza completa de projetos healthcare brownfield com validação arquitetural rigorosa_