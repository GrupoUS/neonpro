# 🧹 PROMPT GITHUB COPILOT - LIMPEZA DE DEPENDÊNCIAS PNPM

## 📋 Prompt Especializado para Otimização de Dependências

**Versão:** 1.0.0  
**Data:** 26 de Agosto de 2025  
**Projeto:** NEONPRO - Sistema de Saúde Estética  
**Contexto:** Monorepo TurboRepo com PNPM

---

## 🎯 OBJETIVO DO PROMPT

Este prompt orienta o GitHub Copilot para executar limpeza completa e otimização de dependências em projetos Node.js/PNPM, seguindo metodologia A.P.T.E (Análise, Planejamento, Teste, Execução) com foco em:

- **Redução de tamanho** do node_modules
- **Eliminação de duplicatas**
- **Remoção de dependências** não utilizadas
- **Otimização de cache** PNPM
- **Preservação da funcionalidade** 100%
- **Backup e rollback** garantidos

---

## 🤖 INSTRUÇÕES PARA O COPILOT

### CONTEXTO DO PROJETO

```
Você está trabalhando em um projeto monorepo de healthcare (NEONPRO) que usa:
- PNPM como gerenciador de pacotes
- TurboRepo para monorepo
- TypeScript para type safety
- Next.js para aplicações web
- Supabase para backend
- Diversas dependências de healthcare, compliance e AI

O projeto tem estrutura:
- apps/ (aplicações principais)
- packages/ (bibliotecas compartilhadas)
- tools/ (ferramentas de desenvolvimento)
- scripts/ (scripts de automação)
```

### METODOLOGIA OBRIGATÓRIA: A.P.T.E

#### 🔍 ANÁLISE (A)

```
SEMPRE execute primeiro:

1. Mapeamento completo:
   - Ler e analisar package.json (dependencies + devDependencies)
   - Inspecionar pnpm-lock.yaml para entender resoluções
   - Mapear node_modules/.pnpm para ver estrutura atual
   - Medir tamanho atual (GB) e contagem de arquivos

2. Análise de uso real:
   - Buscar por imports/requires em todo o código
   - Identificar dependências realmente utilizadas
   - Mapear dependências transitivas importantes
   - Verificar scripts no package.json

3. Identificação de problemas:
   - Dependências depreciadas (pnpm audit)
   - Duplicatas desnecessárias
   - Pacotes órfãos sem uso
   - Configurações obsoletas
```

#### 📋 PLANEJAMENTO (P)

```
Criar estratégia detalhada:

1. Backup obrigatório:
   - package.json → backup-dependencies/
   - pnpm-lock.yaml → backup-dependencies/
   - Tentar comprimir node_modules (pode falhar no Windows)

2. Sequência de comandos:
   - pnpm prune (remover não utilizados)
   - pnpm store prune (limpar cache global)
   - pnpm dedupe (resolver duplicatas)
   - pnpm install --ignore-scripts --include=optional (reinstalar)

3. Validação planejada:
   - pnpm type-check (verificar tipos)
   - Testes básicos de funcionalidade
   - Verificar tamanho pós-limpeza
```

#### 🧪 TESTE (T)

```
Validação em cada etapa:

1. Pré-validação:
   - Verificar se PNPM está disponível
   - Confirmar que estamos no diretório correto
   - Testar comandos básicos (pnpm --version)

2. Pós-comando:
   - Verificar exit codes
   - Monitorar outputs para warnings/errors
   - Confirmar que arquivos críticos existem

3. Validação final:
   - pnpm type-check deve passar (exit code 0)
   - Estrutura do projeto deve estar intacta
   - Funcionalidades críticas preservadas
```

#### ⚡ EXECUÇÃO (E)

```
Execução segura e monitorada:

1. Logging detalhado:
   - Timestamp de cada operação
   - Output completo de comandos
   - Métricas antes/depois

2. Tratamento de erros:
   - Parar em caso de falhas críticas
   - Rollback automático se necessário
   - Documentar problemas encontrados

3. Relatório final:
   - Métricas de otimização
   - Lista de problemas resolvidos
   - Recomendações futuras
```

---

## 🔧 COMANDOS ESPECÍFICOS PARA COPILOT

### Sequência de Limpeza Principal

```bash
# 1. Backup (OBRIGATÓRIO)
mkdir -p backup-dependencies
cp package.json backup-dependencies/package.json.backup-$(date +%Y%m%d-%H%M%S)
cp pnpm-lock.yaml backup-dependencies/pnpm-lock.yaml.backup-$(date +%Y%m%d-%H%M%S)

# 2. Limpeza sequencial
pnpm prune                    # Remove pacotes não utilizados
pnpm store prune             # Limpa cache global
pnpm dedupe                  # Resolve duplicatas
pnpm install --ignore-scripts --include=optional  # Reinstala limpo

# 3. Validação obrigatória
pnpm type-check              # Deve retornar exit code 0
```

### Scripts de Análise

```bash
# Medir tamanho do node_modules
du -sh node_modules 2>/dev/null || Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum

# Contar arquivos
find node_modules -type f | wc -l 2>/dev/null || (Get-ChildItem node_modules -Recurse -File).Count

# Verificar dependências depreciadas
pnpm audit --json

# Mapear uso real de dependências
grep -r "import\|require" apps/ packages/ --exclude-dir=node_modules
```

---

## ⚠️ REGRAS CRÍTICAS PARA O COPILOT

### 🚫 NUNCA FAÇA

- ❌ Executar limpeza sem backup completo
- ❌ Ignorar falhas no type-check
- ❌ Remover dependências sem verificar uso
- ❌ Pular validação pós-limpeza
- ❌ Executar em produção sem testes

### ✅ SEMPRE FAÇA

- ✅ Backup antes de qualquer alteração
- ✅ Medir métricas antes e depois
- ✅ Validar cada etapa individualmente
- ✅ Documentar todos os problemas encontrados
- ✅ Fornecer relatório final com métricas

### 🛡️ SAFETY FIRST

- Verificar exit codes de todos os comandos
- Parar execução em caso de erros críticos
- Manter arquivos de rollback disponíveis
- Documentar procedimento de recuperação
- Testar em ambiente não-crítico primeiro

---

## 📊 MÉTRICAS ESPERADAS

### KPIs de Sucesso

- **Redução de tamanho**: Meta >5% do node_modules
- **Arquivos removidos**: Meta >1000 arquivos desnecessários
- **Duplicatas resolvidas**: Meta 100% das duplicatas
- **Funcionalidade**: Zero breakage (type-check OK)
- **Cache otimizado**: Limpeza completa do store

### Formato de Relatório

```markdown
## 📊 RESULTADOS DA LIMPEZA

| Métrica  | ANTES     | DEPOIS  | ECONOMIA              |
| -------- | --------- | ------- | --------------------- |
| Tamanho  | X.XX GB   | X.XX GB | X.XX GB (X.X%)        |
| Arquivos | XXX,XXX   | XXX,XXX | X,XXX arquivos        |
| Cache    | Não limpo | Limpo   | XXX pacotes removidos |

## ✅ VALIDAÇÕES

- [x] Type-check passou sem erros
- [x] Estrutura do projeto preservada
- [x] Backup criado e validado
- [x] Performance melhorada
```

---

## 🎯 CASOS ESPECÍFICOS DO NEONPRO

### Dependências Críticas (NÃO REMOVER)

```json
{
  "@supabase/supabase-js": "Conexão com backend",
  "next": "Framework principal",
  "react": "UI library",
  "typescript": "Type safety",
  "@types/*": "Definições de tipos",
  "turbo": "Monorepo management"
}
```

### Dependências Suspeitas (INVESTIGAR)

```json
{
  "boom": "Depreciado → @hapi/boom",
  "cryptiles": "Depreciado → @hapi/cryptiles",
  "har-validator": "Descontinuado",
  "uuid": "Versão antiga disponível"
}
```

### Configurações Específicas PNPM

```yaml
# .npmrc importantes para preservar
auto-install-peers=true
shamefully-hoist=false
strict-peer-dependencies=false
```

---

## 🚀 EXEMPLO DE USO PELO COPILOT

### Prompt de Invocação

```
@copilot Execute uma limpeza completa de dependências PNPM seguindo o workflow A.P.T.E definido no prompt de limpeza. Inclua:

1. Análise completa atual (tamanho, dependências, uso real)
2. Backup seguro de todos os arquivos críticos
3. Execução da sequência: prune → store prune → dedupe → install
4. Validação completa (type-check + testes)
5. Relatório final com métricas de otimização

Foque em segurança, documentação e rollback. Meta: >5% de redução sem quebrar funcionalidades.
```

### Resposta Esperada do Copilot

O Copilot deve:

1. Executar análise usando os comandos especificados
2. Criar backup seguindo estrutura definida
3. Executar limpeza seguindo metodologia A.P.T.E
4. Validar resultados com métricas
5. Gerar relatório no formato especificado
6. Fornecer instruções de rollback se necessário

---

## 🔄 MANUTENÇÃO DO PROMPT

### Versioning

- v1.0.0 - Versão inicial (26/08/2025)
- Atualizar conforme novos aprendizados
- Manter compatibilidade com estrutura NEONPRO

### Customização por Projeto

Para adaptar a outros projetos:

1. Ajustar dependências críticas
2. Modificar estrutura de diretórios
3. Adaptar validações específicas
4. Personalizar métricas de sucesso

---

_Prompt criado especificamente para otimização de dependências em projetos healthcare com PNPM_
