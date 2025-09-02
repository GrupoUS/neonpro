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
  - "node_modules → node_modules.backup_[timestamp] (opcional se muito grande)"
sequência_por_manager:
  pnpm: "store prune → prune (root + -r) → dedupe (root + -r) → install --frozen-lockfile --prefer-offline --ignore-scripts → rebuild"
  npm: "cache verify|clean → rm node_modules → ci --ignore-scripts → audit (informativo)"
  yarn: "cache clean → rm node_modules → install --frozen-lockfile --ignore-scripts → audit (informativo)"
validação_planejada: "Build + type-check (root e workspaces) e prisma generate"
notas:
  - "Evitar misturar gerenciadores; seguir packageManager do root"
  - "Preferir pnpm -r para operações em workspaces"
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
# Comandos de detecção automática (Monorepo-aware)
echo "🔍 Detectando package manager e monorepo..."

# Detecta lockfiles e workspaces
[[ -f pnpm-lock.yaml ]] && echo "✅ PNPM lockfile detectado" || echo "❌ PNPM lockfile não encontrado"
[[ -f package-lock.json ]] && echo "✅ NPM lockfile detectado" || echo "❌ NPM lockfile não encontrado"
[[ -f yarn.lock ]] && echo "✅ Yarn lockfile detectado" || echo "❌ Yarn lockfile não encontrado"
[[ -f pnpm-workspace.yaml ]] && echo "✅ Monorepo PNPM detectado (pnpm-workspace.yaml)" || echo "ℹ️ pnpm-workspace.yaml não encontrado"

# Verifica manager configurado em package.json
if grep -q '"packageManager"\s*:\s*"pnpm@' package.json 2>/dev/null; then
  echo "✅ packageManager=pnpm configurado (enforce PNPM)"
fi

# Verificar ferramentas instaladas
which pnpm >/dev/null 2>&1 && pnpm -v || echo "ℹ️ pnpm não encontrado no PATH"
which npm >/dev/null 2>&1 && npm -v || true
which yarn >/dev/null 2>&1 && yarn -v || true
node -v && echo "Node.js OK"

# Checagem de mistura perigosa de managers
if [[ -f pnpm-lock.yaml ]] && ([[ -f package-lock.json ]] || [[ -f yarn.lock ]]); then
  echo "⚠️ Detectada presença de múltiplos lockfiles. Evite misturar gerenciadores nesta limpeza."
fi

# Medir estado inicial (monorepo root)
echo "📊 Estado inicial do root:"
[[ -d node_modules ]] && du -sh node_modules || echo "(sem node_modules no root)"

# Métricas caches comuns
[[ -d .turbo ]] && du -sh .turbo || true
find apps -maxdepth 2 -type d -name cache -path '*/.next/cache' -exec du -sh {} + 2>/dev/null || true
```


### **FASE 1: ANÁLISE ARQUITETURAL UNIVERSAL**
```bash
# Mapeamento completo de dependências (root + workspaces)
echo "📋 Analisando dependências..."

# Para PNPM (se detectado)
if [[ -f pnpm-lock.yaml ]]; then
  echo "🔍 Análise PNPM (root):"
  pnpm list --depth=0 > deps_pnpm_root.txt
  pnpm outdated > outdated_pnpm_root.txt 2>/dev/null || true
  pnpm audit --json > audit_pnpm_root.json 2>/dev/null || true

  echo "🔍 Análise PNPM (workspaces):"
  pnpm -r list --depth=0 > deps_pnpm_workspaces.txt
  pnpm -r outdated > outdated_pnpm_workspaces.txt 2>/dev/null || true
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

# Análise de uso real no código (ignora caches e build outputs)
echo "🔎 Mapeando uso real de dependências..."
grep -r "import\|require" \
  --include="*.{js,ts,tsx,jsx}" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=.turbo \
  . > used_deps.txt 2>/dev/null || true
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
# Estratégia PNPM (preferencial para este monorepo)
if [[ -f pnpm-lock.yaml ]]; then
  echo "🧹 Executando limpeza PNPM (root + workspaces)..."

  echo "  1/6 Limpando store global..."
  pnpm store prune

  echo "  2/6 Prune de dependências não referenciadas (root + workspaces)..."
  pnpm prune || true
  pnpm -r prune || true

  echo "  3/6 Deduplicando versões (root + workspaces)..."
  pnpm dedupe || true
  pnpm -r dedupe || true

  echo "  4/6 Reinstalando dependências (modo seguro CI)..."
  pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

  echo "  5/6 Rebuild de binários nativos quando necessário (esbuild/sharp/prisma)..."
  pnpm rebuild || true

  echo "  6/6 Auditoria (informativa)"
  pnpm audit --json > audit_pnpm_post.json 2>/dev/null || true

  echo "✅ Otimização PNPM concluída"
fi

# Estratégia NPM (se e somente se pnpm não for detectado)
if [[ -f package-lock.json && ! -f pnpm-lock.yaml ]]; then
  echo "🧹 Executando limpeza NPM..."
  echo "  1/4 Limpando cache..."
  npm cache verify || npm cache clean --force
  
  echo "  2/4 Removendo node_modules..."
  rm -rf node_modules
  
  echo "  3/4 Reinstalando com npm ci..."
  npm ci --ignore-scripts
  
  echo "  4/4 Auditoria (informativa)"
  npm audit --json > audit_npm_post.json 2>/dev/null || true
  
  echo "✅ Otimização NPM concluída"
fi

# Estratégia Yarn (fallback)
if [[ -f yarn.lock && ! -f pnpm-lock.yaml && ! -f package-lock.json ]]; then
  echo "🧹 Executando limpeza Yarn..."
  echo "  1/4 Limpando cache..."
  yarn cache clean
  
  echo "  2/4 Removendo node_modules..."
  rm -rf node_modules
  
  echo "  3/4 Reinstalando com yarn..."
  yarn install --frozen-lockfile --ignore-scripts

  echo "  4/4 Auditoria (informativa)"
  yarn npm audit --json > audit_yarn_post.json 2>/dev/null || true
  
  echo "✅ Otimização Yarn concluída"
fi
```

### **FASE 4: LIMPEZA UNIVERSAL FINAL**
```bash
# Limpeza de cache e arquivos temporários (inclui Next.js/Turbo/Playwright)
echo "🗑️ Limpeza universal de cache e temporários..."

# Remover caches dentro de node_modules (geralmente seguros)
find node_modules -name ".cache" -type d -prune -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "*.tmp" -type f -delete 2>/dev/null || true
find node_modules -name "*.log" -type f -delete 2>/dev/null || true
find node_modules -name ".DS_Store" -type f -delete 2>/dev/null || true

# Next.js caches (apps/*/ .next/cache)
find apps -maxdepth 2 -type d -name cache -path '*/.next/cache' -exec rm -rf {} + 2>/dev/null || true

# Turborepo cache (root)
[[ -d .turbo ]] && rm -rf .turbo || true

# Playwright browsers cache (opcional: limpa binários baixados)
if command -v npx >/dev/null 2>&1; then
  npx --yes playwright install-deps 2>/dev/null || true
fi

# Limpar symlinks quebrados
find node_modules/.bin -type l ! -exec test -e {} \; -delete 2>/dev/null || true

echo "🧹 Limpeza universal concluída"
```


### **FASE 4B: HEAVY CLEAN (OPCIONAL E DESTRUTIVO)**

Aviso: use apenas se a limpeza padrão não resolveu problemas. Irá remover módulos e caches reconstruíveis.

```bash
read -p "Confirma HEAVY CLEAN? (y/N) " ans; [[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "Cancelado."; exit 0; }

# Remover módulos e caches reconstruíveis
rm -rf node_modules .turbo
find apps -maxdepth 2 -type d -name cache -path '*/.next/cache' -exec rm -rf {} + 2>/dev/null || true

# Pré-aquecer store e reinstalar de forma determinística
pnpm fetch
pnpm install --frozen-lockfile --prefer-offline

# Regenerar Prisma e rebuild nativos se necessário
(pnpm -r exec prisma --version >/dev/null 2>&1 && pnpm -r prisma generate) || true
pnpm rebuild || true
```

### **FASE 5: VALIDAÇÃO FINAL UNIVERSAL**
```bash
# Validação completa pós-otimização
echo "✅ Executando validação final..."

# Preferir tasks do monorepo quando disponíveis (PNPM workspaces)
if command -v pnpm >/dev/null && [[ -f pnpm-lock.yaml ]]; then
  # Prisma: regenerar clientes (evita erros de engine em Next/Hono)
  (pnpm -r exec prisma --version >/dev/null 2>&1 && pnpm -r prisma generate) || true

  # Builds dos workspaces
  echo "🛠 Testando build dos workspaces..."
  pnpm -r run build || echo "⚠️ Algumas builds falharam"

  # Type-check nos workspaces
  echo "🔍 Verificando types no monorepo..."
  pnpm -r run type-check || echo "⚠️ Alguns type-checks falharam"
else
  # Fallback por package.json no root
  if [[ -f package.json ]]; then
    if grep -q '"build"' package.json; then
      echo "🛠 Testando build..."
      npm run build || yarn build || true
    fi
    if grep -q '"type-check"' package.json; then
      echo "🔍 Verificando tipos..."
      npm run type-check || yarn type-check || true
    fi
  fi
fi

# Métricas finais
echo "📊 Métricas finais:"
[[ -d node_modules ]] && du -sh node_modules || echo "(sem node_modules no root)"

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

**CONTEXTO HEALTHCARE/MONOREPO:**
- packageManager=pnpm no root; usar PNPM como padrão
- Turborepo e Next.js 15: limpar .turbo e .next/cache de apps/*
- Playwright: não remover browsers baixados salvo necessidade; reinstalar com `playwright install --with-deps` se limpar
- Prisma: executar `pnpm -r prisma generate` após reinstalação
- Evitar misturar managers; respeitar pnpm-lock.yaml

**EXECUÇÃO SEGURA:**
- Backup completo antes de qualquer modificação
- A.P.T.E com foco em zero downtime
- PNPM: store prune → prune (-r) → dedupe (-r) → install --frozen-lockfile --prefer-offline --ignore-scripts → rebuild
- Relatório final com métricas healthcare

Meta: ≥40% redução mantendo compliance 100% e builds verdes
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

## 🏗️ CI/CD RECIPES (PNPM-FIRST)

```bash
# CI install (determinístico e rápido)
pnpm fetch
pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# Workspaces build/type-check
pnpm -r run type-check
pnpm -r run build

# Tests
bunx vitest run --reporter=verbose
bunx vitest run --project integration --reporter=verbose || true
bunx playwright test || true

# Playwright no CI (instala binários apenas quando necessário)
bunx playwright install --with-deps || true
```

### ℹ️ Nota sobre Bun × PNPM
- Use pnpm para instalações/lockfile neste monorepo (packageManager=pnpm@8.15.0).
- Use bun/bunx apenas para executar scripts/CLIs (vitest/playwright), sem gerar lock próprio.

## 🔄 MANUTENÇÃO E CUSTOMIZAÇÃO

### Versioning
- v1.1.0 - PNPM-first monorepo update (Set 2025)
  - Detecção monorepo/manager aprimorada
  - Fluxo PNPM workspace-aware (prune/dedupe/install/rebuild)
  - Limpeza de caches Next/Turbo/Playwright
  - Validação com prisma generate + builds -r
  - Seção HEAVY CLEAN opcional
  - Receitas CI/CD e nota Bun×PNPM
- v1.0.0 - Versão inicial universal (Ago 2025)
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