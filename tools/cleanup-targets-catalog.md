# 🎯 CATÁLOGO DE ALVOS PARA REMOÇÃO - NeonPro Cleanup

**Data:** 2025-08-22 **FASE 2:** Identificação completa de alvos por categoria de risco

## 📋 CATEGORIAS DE LIMPEZA

### **1. TEMPORÁRIOS (RISCO: BAIXO) ⭐**

**Descrição:** Arquivos/diretórios temporários seguros para remoção **Tempo estimado:** 15-30min

```bash
# Diretórios de Cache
.next/cache/              # Next.js cache - pode ser regenerado
.turbo/                   # Turborepo cache - pode ser regenerado
node_modules/.cache/      # NPM/PNPM cache local

# Arquivos temporários identificados
temp-auth-analysis.ts
temp-backend-content.ts
temp-file-read.txt
temp-read-api-client.ts
temp_read_certification.bat

# Arquivos de build temporários
*.tsbuildinfo            # TypeScript build cache
```

### **2. LOGS E REPORTS (RISCO: BAIXO) ⭐**

**Descrição:** Logs e relatórios de testes/builds anteriores **Tempo estimado:** 10-20min

```bash
# Diretórios de Reports (se existirem)
coverage/
reports/
playwright-report/
test-results/
tools/testing/outputs/
tools/testing/e2e/reports/html/
tools/testing/e2e/reports/junit-results.xml
tools/testing/e2e/reports/performance-metrics.json
tools/testing/e2e/reports/performance-summary.json

# Arquivos de log individuais
logs/*.log               # Diretório logs está vazio
```

### **3. BACKUPS (RISCO: MÉDIO) ⭐⭐**

**Descrição:** Arquivos de backup antigos e desnecessários **Tempo estimado:** 30-60min

```bash
# Arquivos .backup identificados
biome.json.backup
playwright.config.ts.backup
vitest.config.ts.backup
apps/web/tests/hooks/use-auth.test.tsx.backup

# Arquivos .bak
tools/developer/healthcare-dev-tools.ts.bak
tools/turbo/advanced-config.ts.bak

# Diretório completo de backup do VS Code
backups/vscode-consolidation-backup/        # ATENÇÃO: Verificar tamanho antes!
backups/                                    # Todo o diretório pode ser removido
```

### **4. ARQUIVOS DE TESTE TEMPORÁRIOS (RISCO: MÉDIO-ALTO) ⭐⭐⭐**

**Descrição:** Scripts de teste/validação não integrados ao suite principal **Tempo estimado:**
20-40min

```bash
# Scripts de teste temporários
test-api.mjs
test-rpc-basic.ts
validate-hono-rpc.mjs
validate-rpc-connection.mjs
rpc-implementation-fixes.ts
rpc-integration-test.ts
run-final-validation.cmd

# Arquivos de documentação temporária
backend-hono.txt
```

### **5. ARQUIVOS DESABILITADOS (RISCO: BAIXO) ⭐**

**Descrição:** Arquivos explicitamente desabilitados **Tempo estimado:** 5-10min

```bash
# Arquivos .disabled
packages/domain/src/hooks/legacy/use-subscription-enhanced.ts.disabled
packages/domain/src/hooks/legacy/useSession.ts.disabled
packages/ui/vitest.config.mjs.disabled
```

### **6. ARQUIVOS COMPILADOS ÓRFÃOS (RISCO: ALTO) ⭐⭐⭐⭐**

**Descrição:** Arquivos .js/.d.ts em projetos TypeScript (VALIDAÇÃO CRÍTICA) **Tempo estimado:**
45-90min

```bash
# ATENÇÃO: Verificar se são artefatos de build ou código fonte!
packages/compliance/src/**/*.js
packages/compliance/src/**/*.d.ts
packages/types/src/**/*.js
packages/types/src/**/*.d.ts

# Método de validação:
# 1. Verificar se há .ts correspondente
# 2. Verificar package.json para scripts de build
# 3. Verificar turbo.json para outputs
# 4. BACKUP antes de remover qualquer .js/.d.ts
```

## 📊 ESTATÍSTICAS ESTIMADAS

| Categoria     | Arquivos  | Tamanho Est. | Risco       | Tempo    |
| ------------- | --------- | ------------ | ----------- | -------- |
| Temporários   | ~50       | 100-500MB    | Baixo       | 30min    |
| Logs/Reports  | ~20       | 50-200MB     | Baixo       | 20min    |
| Backups       | ~15 + dir | 500MB-2GB    | Médio       | 60min    |
| Testes Temp   | ~10       | 1-10MB       | Médio-Alto  | 40min    |
| Desabilitados | ~5        | <1MB         | Baixo       | 10min    |
| Compilados    | ~100+     | 10-50MB      | Alto        | 90min    |
| **TOTAL**     | **~200+** | **1-3GB**    | **Variado** | **4-5h** |

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

1. **Backup Completo** (CRÍTICO)
2. **Temporários** → Logs/Reports → Desabilitados (Baixo Risco)
3. **Backups** (Médio Risco - verificar tamanhos)
4. **Testes Temporários** (Médio-Alto - validar não são parte do suite)
5. **Compilados** (Alto Risco - validação extensiva obrigatória)

## ✅ VALIDAÇÕES OBRIGATÓRIAS

- [ ] Backup completo criado e verificado
- [ ] Cada categoria validada contra source-tree.md
- [ ] Arquivos .js/.d.ts verificados individualmente
- [ ] Testes funcionais após cada categoria
- [ ] Build sem erros após limpeza

## 🔄 SCRIPT DE ROLLBACK

```bash
# Em caso de problemas, restaurar do backup
# Localização: D:\neonpro_backup_[timestamp]
# Script: restore-from-backup.ps1
```
