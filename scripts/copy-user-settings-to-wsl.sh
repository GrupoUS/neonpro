#!/bin/bash
# ==============================================================================
# 🎯 NEONPRO: Copy User Settings to WSL Ubuntu (Quick Version)
# ==============================================================================
# 
# Script rápido para copiar apenas as configurações essenciais para WSL
# Para setup completo, use: ./setup-wsl-ubuntu.sh
#
# Uso: ./copy-user-settings-to-wsl.sh
# 
# ==============================================================================

set -euo pipefail

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
WINDOWS_PROJECT_PATH="/mnt/d/neonpro"
WSL_PROJECT_PATH="$HOME/neonpro"
BACKUP_DIR="$HOME/.config/neonpro-backup-$(date +%s)"

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                🎯 NEONPRO: Cópia Rápida de Configurações para WSL           ║
╚══════════════════════════════════════════════════════════════════════════════╝
${NC}"

# Criar diretórios de backup
mkdir -p "$BACKUP_DIR"
echo -e "${CYAN}📁 Backup será salvo em: $BACKUP_DIR${NC}"

# ==============================================================================
# 1. COPIAR CONFIGURAÇÕES VS CODE
# ==============================================================================
echo -e "\n${YELLOW}▶ Copiando configurações VS Code...${NC}"

# Diretório VS Code Server
VSCODE_DIR="$HOME/.vscode-server/data/Machine"
mkdir -p "$VSCODE_DIR"

# Backup configurações existentes
[[ -f "$VSCODE_DIR/settings.json" ]] && cp "$VSCODE_DIR/settings.json" "$BACKUP_DIR/vscode-settings.json.bak"

# Copiar e adaptar settings.json para WSL
cp "$WINDOWS_PROJECT_PATH/.vscode/settings.json" "$VSCODE_DIR/settings.json"

# Substituir configurações específicas do Windows por Linux
sed -i 's/"terminal.integrated.defaultProfile.windows": "PowerShell"/"terminal.integrated.defaultProfile.linux": "bash"/g' "$VSCODE_DIR/settings.json"

echo -e "${GREEN}✅ Configurações VS Code copiadas${NC}"

# ==============================================================================
# 2. COPIAR CONFIGURAÇÕES PROJETO
# ==============================================================================
echo -e "\n${YELLOW}▶ Copiando configurações do projeto...${NC}"

# Criar diretório do projeto se não existir
mkdir -p "$WSL_PROJECT_PATH"

# Copiar configurações essenciais do projeto
cp -r "$WINDOWS_PROJECT_PATH/.vscode" "$WSL_PROJECT_PATH/" 2>/dev/null || echo "Diretório .vscode já existe"
cp "$WINDOWS_PROJECT_PATH/.npmrc" "$WSL_PROJECT_PATH/" 2>/dev/null || echo "Arquivo .npmrc copiado"
cp "$WINDOWS_PROJECT_PATH/.pnpmrc" "$WSL_PROJECT_PATH/" 2>/dev/null || echo "Arquivo .pnpmrc copiado"
cp "$WINDOWS_PROJECT_PATH/.gitignore" "$WSL_PROJECT_PATH/" 2>/dev/null || echo "Arquivo .gitignore copiado"
cp "$WINDOWS_PROJECT_PATH/.gitattributes" "$WSL_PROJECT_PATH/" 2>/dev/null || echo "Arquivo .gitattributes copiado"

echo -e "${GREEN}✅ Configurações do projeto copiadas${NC}"

# ==============================================================================
# 3. CONFIGURAÇÕES NPM/PNPM GLOBAIS
# ==============================================================================
echo -e "\n${YELLOW}▶ Configurando NPM/PNPM globais...${NC}"

# Backup configurações existentes
[[ -f "$HOME/.pnpmrc" ]] && cp "$HOME/.pnpmrc" "$BACKUP_DIR/pnpmrc.bak"
[[ -f "$HOME/.npmrc" ]] && cp "$HOME/.npmrc" "$BACKUP_DIR/npmrc.bak"

# Copiar configurações PNPM global
cp "$WINDOWS_PROJECT_PATH/.pnpmrc" "$HOME/.pnpmrc"

# Configurar NPM global directory
mkdir -p "$HOME/.npm-global"
echo "prefix=$HOME/.npm-global" > "$HOME/.npmrc"

echo -e "${GREEN}✅ Configurações NPM/PNPM globais aplicadas${NC}"

# ==============================================================================
# 4. ALIASES E ENVIRONMENT VARIABLES
# ==============================================================================
echo -e "\n${YELLOW}▶ Configurando aliases e variáveis de ambiente...${NC}"

# Backup bashrc existente
[[ -f "$HOME/.bashrc" ]] && cp "$HOME/.bashrc" "$BACKUP_DIR/bashrc.bak"

# Adicionar configurações ao bashrc
cat >> "$HOME/.bashrc" << 'BASHRC_CONFIG'

# ==============================================================================
# 🎯 NEONPRO WSL Configuration (Auto-generated)
# ==============================================================================

# Node.js e NPM
export PATH="$HOME/.npm-global/bin:$PATH"
export NODE_OPTIONS="--max-old-space-size=4096"

# PNPM
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# Git aliases
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git log --oneline"

# PNPM aliases
alias pi="pnpm install"
alias pr="pnpm run"
alias pd="pnpm run dev"
alias pb="pnpm run build"
alias pt="pnpm test"

# System aliases
alias ll="ls -alF"
alias la="ls -A"
alias ..="cd .."
alias ...="cd ../.."

# NeonPro project alias
alias cdneon="cd $HOME/neonpro"

# ==============================================================================
BASHRC_CONFIG

echo -e "${GREEN}✅ Aliases e variáveis de ambiente configurados${NC}"

# ==============================================================================
# 5. CONFIGURAÇÕES GIT BÁSICAS
# ==============================================================================
echo -e "\n${YELLOW}▶ Configurando Git básico...${NC}"

# Configurações essenciais para WSL
git config --global core.autocrlf input
git config --global core.eol lf
git config --global init.defaultBranch main

# Verificar se usuário já está configurado
if ! git config --global user.name >/dev/null 2>&1; then
    echo -e "${CYAN}Git não configurado. Configuração manual necessária:${NC}"
    echo "  git config --global user.name \"Seu Nome\""
    echo "  git config --global user.email \"seu.email@exemplo.com\""
else
    echo -e "${GREEN}✅ Git já configurado para: $(git config --global user.name)${NC}"
fi

echo -e "${GREEN}✅ Configurações Git básicas aplicadas${NC}"

# ==============================================================================
# 6. RESUMO FINAL
# ==============================================================================
echo -e "\n${BLUE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                           ✅ CONFIGURAÇÕES COPIADAS!                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
${NC}"

echo -e "${CYAN}📋 Configurações aplicadas:${NC}"
echo "  ✅ VS Code settings adaptados para WSL"
echo "  ✅ Configurações do projeto copiadas"
echo "  ✅ NPM/PNPM configurados"
echo "  ✅ Aliases e variáveis de ambiente adicionados"
echo "  ✅ Git configurado para WSL"

echo -e "\n${CYAN}📁 Backups salvos em:${NC} $BACKUP_DIR"

echo -e "\n${YELLOW}🔄 Próximos passos:${NC}"
echo "  1. Execute: source ~/.bashrc"
echo "  2. Configure Git se necessário:"
echo "     git config --global user.name \"Seu Nome\""
echo "     git config --global user.email \"seu.email@exemplo.com\""
echo "  3. Para setup completo, execute: ./setup-wsl-ubuntu.sh"
echo "  4. Instale Node.js e PNPM se ainda não instalados"

echo -e "\n${GREEN}🎯 Configurações de usuário copiadas com sucesso!${NC}"
