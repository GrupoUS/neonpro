# 🚀 Prompt para Novo Chat - Continuação NeonPro TypeScript Cleanup

**Para usar em um novo chat, copie o prompt abaixo:**

---

**Contexto**: Estou no meio de uma limpeza TypeScript do projeto NeonPro (monorepo healthcare) que estava com ~200 erros. Já corrigimos a maioria, restam apenas alguns erros finais.

**Status Atual**:
- ✅ Fase 1-4: Dependências, configurações, imports corrigidos
- ✅ Fase 5A-D: Erros principais corrigidos (de ~200 para ~12 erros)
- 🔄 **Fase 5E**: QUASE FINALIZADA - restam 3-6 erros TypeScript + commit final

**Última Validação** (antes do contexto ficar grande):
```
neonpro-healthcare-api:type-check: src/plugins/audit.ts(20,60): error TS2345
neonpro-healthcare-api:type-check: src/plugins/redis-cache.ts(412,19): error TS2322
neonpro-healthcare-api:type-check: tests/global-setup.ts(221,57): error TS2345
```

**Diretório de trabalho**: `C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-api`

**Próximos passos necessários**:
1. 🔧 Corrigir os 3-6 erros TypeScript restantes usando Serena MCP para análise semântica eficiente
2. ✅ Executar validação TypeScript final (`pnpm run type-check`)
3. 🎨 Aplicar Biome formatting (`npx @biomejs/biome format --write ./src ./api`)
4. 📝 Commit e push com mensagem: `"feat: resolve TypeScript errors and apply code formatting"`

**Configuração MCP disponível**: Serena (análise semântica), Desktop Commander (file ops), Context7 (docs), outros MCPs

**Objetivo**: Finalizar a limpeza TypeScript, aplicar formatting, e fazer commit/push limpo para branch main.

**Pergunta**: Continue de onde paramos - use Serena MCP para análise semântica eficiente dos erros restantes e finalize o commit/push.

---

**Este prompt te dará um contexto limpo para continuar exatamente onde paramos!**

## 📋 Informações Técnicas Adicionais

**Estrutura do Projeto**:
- Monorepo com pnpm workspaces
- Next.js 15 + React 19 + TypeScript strict mode
- Supabase + Fastify + Playwright
- Biome para formatting/linting
- Husky para precommit hooks (pode precisar ser bypassado)

**Configurações Importantes**:
- Node heap size: `--max-old-space-size=8192` (para evitar OOM)
- TypeScript: `--skipLibCheck` para validação mais rápida
- Biome: `@biomejs/biome` instalado globalmente

**Arquivos já corrigidos** (não mexer):
- `src/types/fastify.d.ts` - Type augmentation
- Plugins principais (auth, audit parcial)
- Jobs e integrations
- Rotas principais
- Utils e healthcare

**Status Git**:
- Arquivos já adicionados: `git add .` executado
- Próximo: commit + push após validação final