# 🚀 Guia Rápido - Claude Code Hooks Cross-Platform

## ⚡ Instalação em 3 Passos

### 1️⃣ Execute o Instalador Automático

```bash
# Dentro do diretório do projeto neonpro
cd .claude/hooks/cross-platform
node install.js
```

### 2️⃣ Reinicie o Claude Code

Feche e reabra o Claude Code para carregar a nova configuração.

### 3️⃣ Teste a Configuração

Execute qualquer comando para verificar se os hooks estão funcionando:

```bash
# Teste simples
ls
# ou
git status
```

## 🔍 Verificação Rápida

### Verifique se está funcionando:
```bash
# Veja os logs dos hooks
cat .claude/hooks/claude-hooks.log          # Linux
Get-Content .claude/hooks/claude-hooks.log  # Windows
```

### Deve aparecer algo como:
```
[2024-01-15T10:30:45.123Z] [INFO] [PRE_TOOL_HOOK] Pre-tool intelligence hook executing for tool: bash on win32
[2024-01-15T10:30:45.130Z] [SUCCESS] [PRE_TOOL_HOOK] Pre-tool intelligence hook completed successfully
```

## 🛠️ Configuração Manual (Se Necessário)

Se o instalador automático não funcionar:

1. **Copie a configuração:**
   ```bash
   cp .claude/settings.cross-platform.json .claude/settings.local.json    # Linux
   Copy-Item .claude\settings.cross-platform.json .claude\settings.local.json  # Windows
   ```

2. **Torne executável (Linux):**
   ```bash
   chmod +x .claude/hooks/cross-platform/*.js
   ```

## ❌ Problemas Comuns

### Node.js não encontrado
```bash
# Verifique se Node.js está instalado
node --version

# Se não estiver, instale:
# Ubuntu: sudo apt install nodejs npm
# Windows: https://nodejs.org/
```

### Hooks não executam
```bash
# Verifique o arquivo de configuração
cat .claude/settings.local.json | grep -A5 "hooks"

# Verifique permissões (Linux)
ls -la .claude/hooks/cross-platform/
```

### Timeouts
Se os hooks demoram muito, aumente o timeout em `.claude/settings.local.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "hooks": [{
        "timeout": 120  // Aumentar de 45 para 120
      }]
    }]
  }
}
```

## 📊 Recursos Habilitados

✅ **Logging inteligente** por tipo de comando  
✅ **Análise de sessões** com métricas detalhadas  
✅ **Detecção automática** de plataforma  
✅ **Relatórios finais** de cada sessão  
✅ **Limpeza automática** de cache  
✅ **Monitoramento** de builds e testes  

## 🔧 Debug Mode

Para diagnosticar problemas:

```bash
# Linux
export CLAUDE_DEBUG=true

# Windows PowerShell  
$env:CLAUDE_DEBUG="true"

# Depois execute qualquer comando Claude
```

## 📁 Estrutura Final

Após a instalação:
```
.claude/
├── settings.local.json              # ← Configuração ativa
├── settings.cross-platform.json     # ← Template cross-platform  
└── hooks/
    ├── claude-hooks.log             # ← Logs dos hooks
    ├── backup-[timestamp]/          # ← Backup da config anterior
    └── cross-platform/              # ← Scripts Node.js
        ├── utils.js
        ├── pre-tool-intelligence.js
        ├── post-tool-intelligence.js  
        ├── session-intelligence.js
        ├── session-stop.js
        ├── install.js
        ├── README.md
        └── QUICK-START.md
```

## 🎯 O Que Acontece Agora

1. **Antes de cada comando:** Hook analisa tipo e contexto
2. **Depois de cada comando:** Hook registra resultado e métricas  
3. **Fim de subagents:** Hook faz análise da sessão
4. **Fim da sessão:** Hook gera relatório final completo

## 📈 Relatórios e Análises

Os relatórios são salvos em `.cache/`:
- `session-*-summary.txt` - Resumo legível
- `final-report-*.json` - Dados completos
- `archive/` - Histórico arquivado

## 🆘 Precisa de Ajuda?

1. Leia o **README.md** completo
2. Verifique os **logs** em `.claude/hooks/claude-hooks.log`
3. Use **debug mode** com `CLAUDE_DEBUG=true`
4. Teste com **configuração mínima** primeiro

---

🎉 **Pronto!** Agora seus hooks funcionam perfeitamente no Windows e Ubuntu!