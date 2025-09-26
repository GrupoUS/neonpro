# Configurações do Workspace - OxLint Integration

## Para Qoder IDE

1. **Instalar extensão OxLint** (se disponível):
   - Procurar por "OxLint" ou "Oxc" nas extensões
   - Ou usar extensão ESLint generic configurada para OxLint

2. **Configuração em Settings > Language Servers**:
   - Habilitar TypeScript Language Server
   - Configurar Linter customizado:
     - Command: `./scripts/oxlint-ide.sh`
     - Format: JSON
     - Real-time: true

3. **Configuração em Settings > Code Actions**:
   - Habilitar "Fix on Save"
   - Habilitar "Show Problems Panel"

## Configurações Criadas

1. `.qoder/settings.json` - Configuração específica Qoder
2. `.vscode/settings.json` - Configuração VSCode-compatible
3. `scripts/oxlint-ide.sh` - Script de integração
4. `scripts/lint-watch.sh` - Monitoramento contínuo

## Verificação Manual

Para testar se OxLint está funcionando:

```bash
# Teste manual
pnpm lint

# Teste com watch
pnpm lint:watch

# Teste script da IDE
./scripts/oxlint-ide.sh arquivo.tsx
```

## Troubleshooting

Se ainda não aparecer na Problems panel:

1. Reiniciar a IDE
2. Verificar se extensão OxLint está instalada
3. Verificar se Language Server está ativo
4. Usar Command Palette: "Reload Window"
5. Verificar Output panel para logs de erro

## Configuração Alternativa

Se Problems panel não funcionar, usar o terminal integrado:

```bash
# No terminal da IDE
pnpm lint:watch
```
