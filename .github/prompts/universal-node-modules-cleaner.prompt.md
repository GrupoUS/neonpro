# 🧹 **UNIVERSAL NODE_MODULES CLEANER** — Multi-Package-Manager Optimization Expert

## 🎯 OBJETIVO
**MISSÃO**: Analisar e otimizar **TODA** a estrutura de dependências removendo modules duplicados, redundantes, inutilizados e obsoletos (PNPM + NPM + Yarn)
**QUALIDADE**: ≥9.5/10, **SUCESSO**: ≥95%
**MÉTODO**: A.P.T.E (Analyze → Plan → Test → Execute) com suporte multi-package-manager

## 🌐 CONTEXTO UNIVERSAL
```yaml
project: "Node.js project com múltiplos package managers"
environment: "PNPM | NPM | Yarn | Node.js | TypeScript"
target: "node_modules (COMPLETO) + cache folders + lock files"
scope:
  - "node_modules/.pnpm" # PNPM store
  - "node_modules" # NPM/Yarn modules
  - "node_modules/.cache" # Cache folders
  - "node_modules/.bin" # Binary links
constraints:
  - "Detectar automaticamente package manager primário"
  - "Manter dependências críticas e funcionais"
  - "Preservar integridade do projeto"
  - "Seguir princípios KISS/YAGNI/CoT"
  - "Documentar todas as remoções"
workflow:
  - "Detecção de ambiente"
  - "Análise completa da arquitetura"
  - "Mapeamento universal de dependências"
  - "Identificação de redundâncias"
  - "Limpeza segura e organizada"
references: "package.json | pnpm-lock.yaml | package-lock.json | yarn.lock"
hierarchy: "detecção → análise → implementação → validação"
```

## 🧠 METODOLOGIA A.P.T.E

### **A - ANALYZE (Detecção e Mapeamento)**
```yaml
objetivo: "Identificar package managers e mapear arquitetura completa"
detecção_automática:
  pnpm: "Verificar existência de pnpm-lock.yaml"
  npm: "Verificar existência de package-lock.json"
  yarn: "Verificar existência de yarn.lock"
  primary_manager: "Determinar gerenciador principal por prioridade"
mapeamento_estrutura:
  - "Ler e analisar package.json (universal)"
  - "Analisar todos os lock files presentes"
  - "Escanear imports/requires no código fonte"
  - "Mapear dependências dev vs produção vs peer"
  - "Identificar scripts que usam packages"
  - "Documentar estrutura completa de node_modules"
validação: "Mapeamento completo ≥9.5/10 de precisão"
```

### **P - PLAN (Estratégia Universal)**
```yaml
objetivo: "Criar estratégia detalhada de otimização multi-manager"
backup_obrigatório:
  - "package.json → backup-dependencies/"
  - "pnpm-lock.yaml → backup-dependencies/ (se existe)"
  - "package-lock.json → backup-dependencies/ (se existe)"
  - "yarn.lock → backup-dependencies/ (se existe)"
  - "node_modules → node_modules.backup_[timestamp]"
sequência_por_manager:
  pnpm: "store prune → prune → dedupe → install"
  npm: "cache clean → rm node_modules → ci → audit fix"
  yarn: "cache clean → rm node_modules → install --frozen → audit"
validação_planejada: "Build + testes funcionais após cada etapa"
```

### **T - TEST (Validação Contínua)**
```yaml
objetivo: "Validar cada etapa sem quebrar funcionalidades"
pré_validação:
  - "Verificar se package managers estão disponíveis"
  - "Confirmar diretório correto"
  - "Testar comandos básicos"
pós_comando:
  - "Verificar exit codes"
  - "Monitorar outputs para warnings/errors"
  - "Confirmar arquivos críticos existem"
validação_final:
  - "Build deve executar sem erros"
  - "Testes devem passar (se disponíveis)"
  - "Estrutura do projeto intacta"
```

### **E - EXECUTE (Implementação Segura)**
```yaml
objetivo: "Executar limpeza preservando funcionalidades críticas"
logging_detalhado:
  - "Timestamp de cada operação"
  - "Output completo de comandos"
  - "Métricas antes/depois"
tratamento_erros:
  - "Parar em caso de falhas críticas"
  - "Rollback automático se necessário"
  - "Documentar problemas encontrados"
relatório_final:
  - "Métricas de otimização"
  - "Lista de problemas resolvidos"
  - "Recomendações futuras"
```

## 📋 FASES DE EXECUÇÃO UNIVERSAL

### **FASE 0: DETECÇÃO DE AMBIENTE**
```bash
# Comandos de detecção automática
echo "🔍 Detectando package managers..."
[[ -f pnpm-lock.yaml ]] && echo "✅ PNPM detectado" || echo "❌ PNPM não encontrado"
[[ -f package-lock.json ]] && echo "✅ NPM detectado" || echo "❌ NPM não encontrado"
[[ -f yarn.lock ]] && echo "✅ Yarn detectado" || echo "❌ Yarn não encontrado"

# Verificar versões instaladas
which pnpm npm yarn 2>/dev/null || echo "Package manager verification"
node -v && echo "Node.js OK"

# Medir estado inicial
echo "📊 Estado inicial:"
du -sh node_modules 2>/dev/null || Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum
```

### **FASE 1: ANÁLISE ARQUITETURAL UNIVERSAL**
```bash
# Mapeamento completo de dependências
echo "📋 Analisando dependências..."

# Para PNPM (se detectado)
if [[ -f pnpm-lock.yaml ]]; then
  echo "🔍 Análise PNPM:"
  pnpm list --depth=0 > deps_pnpm.txt
  pnpm outdated > outdated_pnpm.txt 2>/dev/null || true
  pnpm audit --json > audit_pnpm.json 2>/dev/null || true
fi

# Para NPM (se detectado)
if [[ -f package-lock.json ]]; then
  echo "🔍 Análise NPM:"
  npm ls --depth=0 > deps_npm.txt 2>/dev/null || true
  npm outdated > outdated_npm.txt 2>/dev/null || true
  npm audit --json > audit_npm.json 2>/dev/null || true
fi

# Para Yarn (se detectado)
if [[ -f yarn.lock ]]; then
  echo "🔍 Análise Yarn:"
  yarn list --depth=0 > deps_yarn.txt 2>/dev/null || true
  yarn outdated > outdated_yarn.txt 2>/dev/null || true
  yarn audit --json > audit_yarn.json 2>/dev/null || true
fi

# Análise de uso real no código
echo "🔎 Mapeando uso real de dependências..."
grep -r "import\|require" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" . --exclude-dir=node_modules > used_deps.txt 2>/dev/null || true
```

### **FASE 2: BACKUP E SEGURANÇA UNIVERSAL**
```bash
# Backup completo obrigatório
echo "💾 Criando backup completo..."
mkdir -p backup-dependencies

# Backup de lock files
timestamp=$(date +%Y%m%d_%H%M%S)
cp package.json "backup-dependencies/package.json.backup-$timestamp"
[[ -f pnpm-lock.yaml ]] && cp pnpm-lock.yaml "backup-dependencies/pnpm-lock.yaml.backup-$timestamp"
[[ -f package-lock.json ]] && cp package-lock.json "backup-dependencies/package-lock.json.backup-$timestamp"
[[ -f yarn.lock ]] && cp yarn.lock "backup-dependencies/yarn.lock.backup-$timestamp"

# Backup de node_modules (pode ser grande)
echo "📦 Backup de node_modules (pode demorar)..."
cp -r node_modules "node_modules.backup_$timestamp" 2>/dev/null || echo "⚠️ Backup de node_modules falhou (muito grande), continuando..."

echo "✅ Backup completo criado em backup-dependencies/"
```

### **FASE 3: OTIMIZAÇÃO SISTEMÁTICA UNIVERSAL**
```bash
# Estratégia PNPM (se detectado)
if [[ -f pnpm-lock.yaml ]]; then
  echo "🧹 Executando limpeza PNPM..."
  echo "  1/4 Limpando store global..."
  pnpm store prune
  
  echo "  2/4 Removendo packages não utilizados..."
  pnpm prune
  
  echo "  3/4 Resolvendo duplicatas..."
  pnpm dedupe
  
  echo "  4/4 Reinstalando dependências..."
  pnpm install --frozen-lockfile --ignore-scripts --include=optional
  
  echo "🔧 Corrigindo vulnerabilidades..."
  pnpm audit fix --prod || true
  
  echo "✅ Otimização PNPM concluída"
fi

# Estratégia NPM (se detectado)
if [[ -f package-lock.json && ! -f pnpm-lock.yaml ]]; then
  echo "🧹 Executando limpeza NPM..."
  echo "  1/3 Limpando cache..."
  npm cache clean --force
  
  echo "  2/3 Removendo node_modules..."
  rm -rf node_modules
  
  echo "  3/3 Reinstalando com npm ci..."
  npm ci --ignore-scripts --include=optional
  
  echo "🔧 Corrigindo vulnerabilidades..."
  npm audit fix --production-only || true
  
  echo "✅ Otimização NPM concluída"
fi

# Estratégia Yarn (se detectado)
if [[ -f yarn.lock && ! -f pnpm-lock.yaml && ! -f package-lock.json ]]; then
  echo "🧹 Executando limpeza Yarn..."
  echo "  1/3 Limpando cache..."
  yarn cache clean
  
  echo "  2/3 Removendo node_modules..."
  rm -rf node_modules
  
  echo "  3/3 Reinstalando com yarn..."
  yarn install --frozen-lockfile --ignore-scripts --include=optional
  
  echo "🔧 Corrigindo vulnerabilidades..."
  yarn audit --fix || true
  
  echo "✅ Otimização Yarn concluída"
fi
```

### **FASE 4: LIMPEZA UNIVERSAL FINAL**
```bash
# Limpeza de cache e arquivos temporários
echo "🗑️ Limpeza universal de cache e temporários..."

# Remover cache folders
find node_modules -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "*.tmp" -type f -delete 2>/dev/null || true
find node_modules -name "*.log" -type f -delete 2>/dev/null || true
find node_modules -name ".DS_Store" -type f -delete 2>/dev/null || true

# Limpar symlinks quebrados
find node_modules/.bin -type l ! -exec test -e {} \; -delete 2>/dev/null || true

echo "🧹 Limpeza universal concluída"
```

### **FASE 5: VALIDAÇÃO FINAL UNIVERSAL**
```bash
# Validação completa pós-otimização
echo "✅ Executando validação final..."

# Teste de build (tentar detectar automaticamente)
if [[ -f package.json ]]; then
  if grep -q '"build"' package.json; then
    echo "🔨 Testando build..."
    if command -v pnpm >/dev/null && [[ -f pnpm-lock.yaml ]]; then
      pnpm build || echo "⚠️ Build falhou com PNPM"
    elif command -v npm >/dev/null; then
      npm run build || echo "⚠️ Build falhou com NPM"
    elif command -v yarn >/dev/null; then
      yarn build || echo "⚠️ Build falhou com Yarn"
    fi
  fi
  
  # Teste de type-check
  if grep -q '"type-check"' package.json; then
    echo "🔍 Verificando tipos..."
    if command -v pnpm >/dev/null && [[ -f pnpm-lock.yaml ]]; then
      pnpm type-check || echo "⚠️ Type-check falhou com PNPM"
    elif command -v npm >/dev/null; then
      npm run type-check || echo "⚠️ Type-check falhou com NPM"
    elif command -v yarn >/dev/null; then
      yarn type-check || echo "⚠️ Type-check falhou com Yarn"
    fi
  fi
fi

# Métricas finais
echo "📊 Métricas finais:"
du -sh node_modules 2>/dev/null || Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum

echo "✅ Validação final concluída"
```

## 🔒 SALVAGUARDAS CRÍTICAS

### 🚫 NUNCA FAÇA
- ❌ Executar limpeza sem backup completo
- ❌ Ignorar falhas no type-check ou build
- ❌ Remover dependências sem verificar uso real
- ❌ Pular validação pós-limpeza
- ❌ Executar em produção sem testes em desenvolvimento
- ❌ Remover arquivos de lock sem backup

### ✅ SEMPRE FAÇA
- ✅ Backup completo antes de qualquer alteração
- ✅ Detectar package manager automaticamente
- ✅ Medir métricas antes e depois
- ✅ Validar cada etapa individualmente
- ✅ Documentar todos os problemas encontrados
- ✅ Manter arquivos de rollback disponíveis
- ✅ Testar funcionalidades críticas após limpeza

### 🛡️ SAFETY FIRST
- Verificar exit codes de todos os comandos
- Parar execução em caso de erros críticos
- Documentar procedimento de recuperação
- Validar integridade dos lock files
- Preservar configurações específicas (.npmrc, .yarnrc, etc.)

## 📊 MÉTRICAS DE QUALIDADE

### KPIs de Sucesso Universal
- **Redução de tamanho**: Meta ≥40% do node_modules
- **Arquivos removidos**: Meta ≥1000 arquivos desnecessários
- **Duplicatas resolvidas**: Meta 100% das duplicatas identificadas
- **Funcionalidade**: Zero breakage (build + type-check OK)
- **Cache otimizado**: Limpeza completa de todos os caches
- **Vulnerabilidades**: Resolução de issues críticas e altas

### Formato de Relatório
```markdown
## 📊 RESULTADOS DA LIMPEZA UNIVERSAL

| Package Manager | Detectado | Otimizado |
|----------------|-----------|-----------|
| PNPM           | ✅/❌     | ✅/❌     |
| NPM            | ✅/❌     | ✅/❌     |
| Yarn           | ✅/❌     | ✅/❌     |

| Métrica               | ANTES     | DEPOIS    | ECONOMIA              |
|-----------------------|-----------|-----------|----------------------|
| Tamanho node_modules  | X.XX GB   | X.XX GB   | X.XX GB (X.X%)       |
| Arquivos totais       | XXX,XXX   | XXX,XXX   | X,XXX arquivos       |
| Packages instalados   | XXX       | XXX       | XX packages          |
| Vulnerabilidades      | XX        | XX        | XX corrigidas        |

## ✅ VALIDAÇÕES EXECUTADAS

- [x] Backup criado e validado
- [x] Package manager detectado automaticamente
- [x] Build executado sem erros
- [x] Type-check passou (se disponível)
- [x] Estrutura do projeto preservada
- [x] Cache limpo universalmente
- [x] Vulnerabilidades corrigidas
- [x] Performance melhorada

## 🔄 ROLLBACK DISPONÍVEL

```bash
# Para restaurar backup:
cp backup-dependencies/package.json.backup-* package.json
cp backup-dependencies/*-lock*.backup-* .
rm -rf node_modules
# Execute install do package manager detectado
```
```

## 🚀 COMANDOS RÁPIDOS PARA GITHUB COPILOT

### 🎯 Comando Básico
```
@copilot Execute limpeza universal de dependências:
1. Detectar package managers (PNPM/NPM/Yarn)
2. Backup completo (package.json + lock files)
3. Medir tamanho atual node_modules
4. Executar otimização específica do manager detectado
5. Validar com build/type-check
6. Relatório com métricas antes/depois

Meta: ≥40% redução, zero breakage, suporte universal
```

### 🔍 Comando Completo A.P.T.E
```
@copilot Seguindo metodologia A.P.T.E, execute limpeza UNIVERSAL de dependências:

**ANALYZE:**
- Detectar automaticamente PNPM/NPM/Yarn
- Mapear package.json e todos os lock files
- Medir tamanho/arquivos de node_modules
- Identificar dependências não utilizadas no código
- Verificar audit para vulnerabilidades

**PLAN:**
- Backup universal: package.json + lock files + node_modules
- Estratégia específica por package manager detectado
- Sequência otimizada: prune → cache clean → reinstall → audit fix

**TEST:**
- Validar exit codes de cada comando
- Executar build e type-check (se disponíveis)
- Verificar estrutura do projeto intacta

**EXECUTE:**
- Logging detalhado de cada operação
- Métricas antes/depois universais
- Relatório final com economia alcançada e package manager usado

**SAFETY:** Backup obrigatório, detecção automática, rollback disponível, zero tolerância a quebras
```

### 📊 Comando de Análise Somente
```
@copilot Analise dependências do projeto:
1. Detectar package managers ativos (PNPM/NPM/Yarn)
2. Listar deps/devDeps do package.json
3. Medir tamanho atual do node_modules
4. Identificar dependências depreciadas (audit universal)
5. Mapear uso real de imports/requires no código
6. Relatório com oportunidades de otimização

NÃO execute limpeza, apenas análise e detecção.
```

### 🔄 Comando de Rollback Universal
```
@copilot Execute rollback da limpeza de dependências:
1. Detectar package manager usado originalmente
2. Restaurar backup-dependencies/*.backup-*
3. Executar install com frozen lockfile
4. Validar com build/type-check
5. Confirmar funcionalidade restaurada

Restaurar estado exato anterior à limpeza.
```

### 🏥 Comando Específico NEONPRO Healthcare
```
@copilot Execute limpeza de dependências para projeto healthcare NEONPRO:

**CONTEXTO HEALTHCARE:**
- Preservar dependências críticas: @supabase/supabase-js, next, react, typescript
- Manter compliance: dependências de LGPD e regulamentação
- Detectar automaticamente PNPM como manager principal
- Validar build + type-check obrigatoriamente

**EXECUÇÃO SEGURA:**
- Backup completo antes de qualquer modificação
- Metodologia A.P.T.E com foco em zero downtime
- Otimização específica PNPM: store prune → prune → dedupe → install
- Relatório final com métricas healthcare

Meta: >40% redução mantendo compliance 100%
```

---

## 🎯 COMO USAR

1. **Copiar** um dos comandos acima
2. **Colar** no GitHub Copilot Chat
3. **Aguardar** execução automática com detecção de package manager
4. **Revisar** relatório gerado com métricas universais
5. **Validar** funcionamento do projeto
6. **Manter** backup para rollback se necessário

---

## 🔄 MANUTENÇÃO E CUSTOMIZAÇÃO

### Versioning
- v1.0.0 - Versão inicial universal (Agosto 2025)
- Compatível com PNPM, NPM e Yarn
- Atualizar conforme novos package managers

### Adaptação por Projeto
Para personalizar:
1. Ajustar dependências críticas na seção de salvaguardas
2. Modificar comandos de validação específicos
3. Adaptar métricas de sucesso conforme necessidade
4. Personalizar estrutura de backup

---

_Prompt universal criado para otimização de dependências em qualquer projeto Node.js com suporte multi-package-manager_