# 🚀 PROMPT RÁPIDO - LIMPEZA DE DEPENDÊNCIAS PNPM

## Para uso com GitHub Copilot Chat

### Comando Básico

```
@copilot Execute limpeza de dependências PNPM:
1. Backup (package.json, pnpm-lock.yaml)
2. Medir tamanho atual node_modules
3. Executar: pnpm prune → store prune → dedupe → install
4. Validar com pnpm type-check
5. Relatório com métricas antes/depois

Meta: >5% redução, zero breakage
```

### Comando Completo

```
@copilot Seguindo metodologia A.P.T.E, execute limpeza completa de dependências PNPM no projeto NEONPRO:

**ANÁLISE:**
- Mapear package.json e pnpm-lock.yaml
- Medir tamanho/arquivos de node_modules
- Identificar dependências não utilizadas
- Verificar audit para dependências depreciadas

**PLANEJAMENTO:**
- Backup: package.json → backup-dependencies/
- Backup: pnpm-lock.yaml → backup-dependencies/
- Sequência: prune → store prune → dedupe → install --ignore-scripts --include=optional

**TESTE:**
- Validar exit codes de cada comando
- Executar pnpm type-check (deve passar)
- Verificar estrutura do projeto intacta

**EXECUÇÃO:**
- Logging detalhado de cada operação
- Métricas antes/depois
- Relatório final com economia alcançada

**SAFETY:** Backup obrigatório, rollback disponível, zero tolerância a quebras
```

### Comando de Análise Somente

```
@copilot Analise dependências do projeto:
1. Listar deps/devDeps do package.json
2. Medir tamanho atual do node_modules
3. Identificar dependências depreciadas (pnpm audit)
4. Mapear uso real de imports/requires no código
5. Relatório com oportunidades de otimização

NÃO execute limpeza, apenas análise.
```

### Comando de Rollback

```
@copilot Execute rollback da limpeza de dependências:
1. Restaurar backup-dependencies/package.json.backup-*
2. Restaurar backup-dependencies/pnpm-lock.yaml.backup-*
3. Executar pnpm install --frozen-lockfile
4. Validar com pnpm type-check
5. Confirmar funcionalidade restaurada
```

---

## 🎯 Como Usar

1. **Copiar** um dos comandos acima
2. **Colar** no GitHub Copilot Chat
3. **Aguardar** execução automática
4. **Revisar** relatório gerado
5. **Validar** funcionamento do projeto

---

_Prompts otimizados para uso eficiente com GitHub Copilot_
