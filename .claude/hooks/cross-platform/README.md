# 🌍 Claude Code Cross-Platform Hooks

Uma solução unificada para executar hooks do Claude Code tanto no **Windows (PowerShell)** quanto no **Ubuntu (terminal)** usando Node.js.

## ✨ Características

- ✅ **Cross-Platform**: Funciona nativamente no Windows e Linux
- ✅ **Node.js Based**: Usa JavaScript para máxima compatibilidade
- ✅ **Intelligent Analytics**: Análise avançada de sessões e uso de tools
- ✅ **Auto-Detection**: Detecta automaticamente a plataforma
- ✅ **Safe Operations**: Operações seguras que não bloqueiam o Claude
- ✅ **Comprehensive Logging**: Sistema de logging detalhado e estruturado

## 📁 Estrutura de Arquivos

```
.claude/hooks/cross-platform/
├── utils.js                     # Utilitário base cross-platform
├── pre-tool-intelligence.js     # Hook pré-uso de tool
├── post-tool-intelligence.js    # Hook pós-uso de tool
├── session-intelligence.js      # Hook de análise de sessão
├── session-stop.js              # Hook de parada de sessão
└── README.md                    # Esta documentação
```

## 🚀 Configuração Rápida

### 1. Usando a Configuração Cross-Platform

Copie o arquivo `settings.cross-platform.json` para `settings.local.json`:

```bash
# Windows PowerShell
Copy-Item .claude\settings.cross-platform.json .claude\settings.local.json

# Linux/Ubuntu
cp .claude/settings.cross-platform.json .claude/settings.local.json
```

### 2. Verificação da Instalação

Os hooks devem executar automaticamente. Para verificar:

```bash
# Verifique os logs
cat .claude/hooks/claude-hooks.log    # Linux
Get-Content .claude\hooks\claude-hooks.log    # Windows
```

## 🔧 Configuração Manual

### Opção 1: Arquivo de Configuração Único (Recomendado)

Use `settings.cross-platform.json` que já está configurado para ambas as plataformas:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{ 
        "type": "command",
        "command": "node .claude/hooks/cross-platform/pre-tool-intelligence.js",
        "timeout": 45
      }]
    }],
    "PostToolUse": [{
      "matcher": "*", 
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/cross-platform/post-tool-intelligence.js",
        "timeout": 60
      }]
    }],
    "SubagentStop": [{
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/cross-platform/session-intelligence.js",
        "timeout": 120
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command", 
        "command": "node .claude/hooks/cross-platform/session-stop.js",
        "timeout": 90
      }]
    }]
  }
}
```

### Opção 2: Configurações Separadas por Plataforma

Se preferir manter configurações separadas:

**Windows (`settings.local.windows.json`):**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"node '.claude/hooks/cross-platform/pre-tool-intelligence.js'\"",
        "timeout": 45
      }]
    }]
  }
}
```

**Ubuntu (`settings.local.ubuntu.json`):**  
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "bash -c 'node .claude/hooks/cross-platform/pre-tool-intelligence.js'",
        "timeout": 45
      }]
    }]
  }
}
```

## 📊 Funcionalidades dos Hooks

### 🔍 Pre-Tool Hook (`pre-tool-intelligence.js`)
Executado **antes** de cada uso de tool:

- ✅ Detecção de plataforma e ambiente
- ✅ Preparação específica por tipo de tool
- ✅ Verificação de pré-requisitos (git, node, npm)
- ✅ Logging inteligente por contexto

### 📈 Post-Tool Hook (`post-tool-intelligence.js`)
Executado **após** cada uso de tool:

- ✅ Análise de resultados de comandos bash
- ✅ Detecção de modificações críticas de arquivo
- ✅ Análise de atividades do Archon MCP
- ✅ Verificação de build/test/lint
- ✅ Monitoramento de status do Git
- ✅ Health check do sistema

### 🧠 Session Intelligence (`session-intelligence.js`)  
Executado quando um **subagent para**:

- ✅ Análise completa de padrões de uso
- ✅ Estatísticas de ferramentas utilizadas
- ✅ Detecção de loops e comportamentos repetitivos
- ✅ Métricas de performance da sessão
- ✅ Limpeza automática de cache
- ✅ Rotação de logs grandes

### 🏁 Session Stop (`session-stop.js`)
Executado quando a **sessão principal termina**:

- ✅ Relatório final completo da sessão
- ✅ Métricas detalhadas de performance
- ✅ Análise de workflows detectados
- ✅ Arquivamento de dados importantes
- ✅ Manutenção do sistema
- ✅ Otimização de cache

## 🔧 Sistema de Utilitários (`utils.js`)

### Funcionalidades Cross-Platform:
- ✅ **Detecção automática** de plataforma (Windows/Linux/macOS)
- ✅ **Logging seguro** que nunca falha
- ✅ **Operações de arquivo** com fallback gracioso
- ✅ **Execução de comandos** adaptada por plataforma
- ✅ **Gestão de cache** e diretórios
- ✅ **Informações do Git** automáticas

### APIs Principais:

```javascript
// Detecção de plataforma
utils.isWindows    // true no Windows
utils.isLinux      // true no Linux
utils.isDarwin     // true no macOS

// Logging seguro
utils.log('INFO', 'COMPONENT', 'message');
utils.log('ERROR', 'COMPONENT', 'error message');

// Operações de arquivo seguras
utils.safeWriteFile(path, content);
utils.safeReadFile(path);

// Execução de comandos cross-platform
await utils.executeCommand('git status');
await utils.executeCommand('npm test');

// Informações do sistema
const systemInfo = utils.getSystemInfo();
const gitInfo = await utils.getGitInfo();
```

## 📝 Sistema de Logging

### Localização dos Logs:
```bash
.claude/hooks/claude-hooks.log    # Log principal
.cache/session-*-summary.json     # Resumos de sessão  
.cache/final-report-*.json        # Relatórios finais
.cache/archive/                   # Arquivo histórico
```

### Níveis de Log:
- `DEBUG`: Informações detalhadas de desenvolvimento
- `INFO`: Informações gerais de operação  
- `WARN`: Avisos que não impedem execução
- `ERROR`: Erros que foram tratados
- `SUCCESS`: Operações concluídas com sucesso

### Exemplo de Saída:
```
[2024-01-15T10:30:45.123Z] [INFO] [PRE_TOOL_HOOK] Pre-tool intelligence hook executing for tool: bash on win32
[2024-01-15T10:30:45.125Z] [DEBUG] [PRE_TOOL_HOOK] System: win32 x64, Node: v18.17.0
[2024-01-15T10:30:45.130Z] [SUCCESS] [PRE_TOOL_HOOK] Pre-tool intelligence hook completed successfully for bash
```

## 🐛 Troubleshooting

### ❌ Hook não executa
```bash
# Verifique se Node.js está disponível
node --version

# Verifique permissões do arquivo
ls -la .claude/hooks/cross-platform/    # Linux
dir .claude\hooks\cross-platform\       # Windows

# Torne os arquivos executáveis (Linux)
chmod +x .claude/hooks/cross-platform/*.js
```

### ❌ Erros de timeout
```json
{
  "hooks": {
    "PreToolUse": [{
      "hooks": [{
        "timeout": 120  // Aumente o timeout se necessário
      }]
    }]
  }
}
```

### ❌ Problemas de path
```bash
# Use paths absolutos se necessário
"command": "node /full/path/to/.claude/hooks/cross-platform/pre-tool-intelligence.js"
```

### ❌ Debug Mode
```bash
# Ative debug para mais informações
export CLAUDE_DEBUG=true     # Linux
$env:CLAUDE_DEBUG="true"     # Windows PowerShell
```

## 🔍 Monitoramento e Análise

### Verificar Atividade dos Hooks:
```bash
# Últimas 50 entradas do log
tail -50 .claude/hooks/claude-hooks.log     # Linux  
Get-Content .claude\hooks\claude-hooks.log -Tail 50  # Windows

# Filtrar por tipo de hook
grep "PRE_TOOL_HOOK" .claude/hooks/claude-hooks.log   # Linux
Select-String "PRE_TOOL_HOOK" .claude\hooks\claude-hooks.log  # Windows
```

### Relatórios de Sessão:
```bash
# Ver resumos de sessão
ls -la .cache/session-*-summary.txt    # Linux
dir .cache\session-*-summary.txt       # Windows

# Ver relatórios completos
cat .cache/final-report-*.json          # Linux  
Get-Content .cache\final-report-*.json  # Windows
```

## ⚙️ Configurações Avançadas

### Personalização de Hooks:

Edite os arquivos JavaScript diretamente para:
- Adicionar lógica específica por tipo de tool
- Modificar critérios de análise
- Adicionar integrações customizadas
- Alterar estratégias de cleanup

### Variables de Ambiente Disponíveis:
```bash
CLAUDE_TOOL_NAME        # Nome do tool sendo executado
CLAUDE_TOOL_ARGS        # Argumentos do tool
CLAUDE_TOOL_RESULT      # Resultado do tool (post-hook)
CLAUDE_SESSION_ID       # ID da sessão atual
CLAUDE_HOOK_PHASE       # Fase do hook (pre_tool_use, post_tool_use, etc.)
CLAUDE_PLATFORM         # Plataforma detectada
CLAUDE_DEBUG            # Modo debug (true/false)
```

## 🚀 Migração de Hooks Existentes

### Do sistema BAT/SH anterior:

1. **Backup** dos hooks existentes:
```bash
cp -r .claude/hooks .claude/hooks.backup    # Linux
xcopy .claude\hooks .claude\hooks.backup /E /I  # Windows  
```

2. **Teste** a nova configuração:
```bash
# Modifique temporariamente settings.local.json
# Execute alguns comandos para testar
# Verifique os logs
```

3. **Ativação completa**:
```bash
# Use settings.cross-platform.json como base
# Remova hooks antigos se funcionando corretamente
```

## 📋 Checklist de Configuração

- [ ] Node.js instalado e acessível via `node` command
- [ ] Arquivos hook copiados para `.claude/hooks/cross-platform/`
- [ ] Configuração atualizada em `settings.local.json`  
- [ ] Permissões de execução definidas (Linux)
- [ ] Teste executado com comando simples
- [ ] Logs verificados em `.claude/hooks/claude-hooks.log`
- [ ] Timeout ajustado se necessário

## 🎯 Benefícios da Solução Cross-Platform

### ✅ **Compatibilidade Universal**
- Mesmo código funciona no Windows e Linux
- Sem necessidade de manter scripts separados
- Detecção automática de ambiente

### ✅ **Manutenção Simplificada**  
- Um só ponto de atualização
- Lógica centralizada no JavaScript
- Menos arquivos para gerenciar

### ✅ **Analytics Avançados**
- Relatórios detalhados de uso
- Detecção de padrões de workflow
- Métricas de performance

### ✅ **Robustez**
- Tratamento gracioso de erros
- Operações que nunca bloqueiam Claude
- Fallbacks seguros

---

## 🤝 Contribuição

Para melhorar estes hooks:

1. Modifique os arquivos `.js` na pasta `cross-platform/`
2. Teste em ambas as plataformas
3. Verifique os logs para confirmar funcionamento
4. Documente mudanças importantes

## 📞 Suporte

Se encontrar problemas:

1. Verifique o log: `.claude/hooks/claude-hooks.log`
2. Confirme Node.js funcionando: `node --version`
3. Teste configuração mínima primeiro
4. Use modo debug: `CLAUDE_DEBUG=true`

---

**🎉 Pronto!** Seus hooks cross-platform estão configurados e funcionando tanto no Windows quanto no Ubuntu!