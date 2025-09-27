# Chrome MCP Tools Setup Guide for WSL + Windows - CORRIGIDO

## Overview
Este guia explica como configurar o Chrome MCP tools para funcionar com Chrome rodando no Windows enquanto usa WSL (Ubuntu).

## Prerequisites
- Chrome instalado no Windows
- WSL com Ubuntu instalado
- MCP tools configurados

## Setup Instructions

### 1. Iniciar Chrome com Remote Debugging

**Opção A: Usar o script corrigido**
1. Abra PowerShell ou Command Prompt **como Administrador**
2. Navegue até o diretório do projeto
3. Execute: `scripts\start-chrome-debug.bat`

**Opção B: Comando manual (funciona)**
```powershell
# No PowerShell ou Command Prompt (como Administrador)
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-allow-origins=*
```

**Importante:** 
- Execute como Administrador para evitar problemas de permissão
- Feche todas as instâncias do Chrome antes de iniciar com debugging
- O Chrome deve permanecer aberto com debugging ativado

### 2. Verificar Status do Chrome Debugging
```bash
# No terminal WSL
./scripts/check-chrome-debug.sh
```

### 3. Configuração MCP
A configuração MCP foi atualizada em `~/.mcp.json` com:

```json
{
  "chrome-devtools": {
    "command": "bunx",
    "args": [
      "chrome-devtools-mcp@latest",
      "--chrome-host",
      "localhost",
      "--chrome-port",
      "9222"
    ],
    "env": {
      "CHROME_HOST": "localhost",
      "CHROME_PORT": "9222",
      "WSL_HOST_ACCESS": "true"
    },
    "type": "stdio"
  }
}
```

## Testando Chrome MCP Tools

### Testar Conexão Básica
```bash
# Verificar se Chrome debugging está acessível
curl http://localhost:9222/json
```

### Testar Chrome DevTools Protocol
1. Abra Chrome com debugging habilitado
2. Visite: http://localhost:9222
3. Você deve ver uma lista de abas/páginas abertas

## Troubleshooting

### Chrome não acessível
- Execute Chrome como Administrador
- Feche todas as instâncias do Chrome antes de iniciar com debugging
- Verifique se o Firewall do Windows permite a porta 9222
- Não execute Chrome em modo visitante

### Problemas de conexão MCP
- Reinicie o cliente/servidor MCP
- Verifique se a porta de debugging do Chrome está acessível
- Confirme se o endpoint de debugging do Chrome responde

### Problemas de rede
- WSL pode acessar Windows localhost como `localhost`
- se tiver problemas, tente usar o IP do host Windows: `172.x.x.x`

## Comandos Úteis

```bash
# Verificar status do Chrome
./scripts/check-chrome-debug.sh

# Testar conexão direta
curl http://localhost:9222/json

# Verificar abas abertas
curl -s http://localhost:9222/json | grep -o '"url":"[^"]*"' | head -5
```

## Dicas

- Mantenha Chrome rodando com debugging habilitado para os MCP tools funcionarem
- Você pode usar o Chrome normalmente enquanto debugging está habilitado
- Múltiplas instâncias do Chrome: use portas diferentes (ex: 9223, 9224)
- A sessão de debugging persiste até o Chrome ser fechado

## Fluxo de Trabalho Recomendado

1. Abra PowerShell como Administrador no Windows
2. Execute: `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-allow-origins=*`
3. No WSL, execute: `./scripts/check-chrome-debug.sh` para verificar
4. Reinicie o MCP client para aplicar configurações
5. Use os Chrome MCP tools normalmente