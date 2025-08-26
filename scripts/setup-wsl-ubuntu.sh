#!/bin/bash
# ==============================================================================
# 🎯 NEONPRO: Setup WSL Ubuntu Environment
# ==============================================================================
# 
# Este script migra todas as configurações de usuário do Windows para WSL Ubuntu
# Inclui: VS Code settings, Git config, NPM/PNPM settings, environment setup
#
# Uso: ./setup-wsl-ubuntu.sh
# 
# ==============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
WINDOWS_PROJECT_PATH="/mnt/d/neonpro"
WSL_PROJECT_PATH="$HOME/neonpro"
BACKUP_DIR="$HOME/.config/neonpro-backup"
LOG_FILE="$HOME/neonpro-setup.log"

# ==============================================================================
# 🚀 FUNÇÕES UTILITÁRIAS
# ==============================================================================

log() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

section() {
    echo -e "\n${PURPLE}▶ $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${PURPLE}$(printf '%.s=' {1..60})${NC}" | tee -a "$LOG_FILE"
}

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Criar backup de arquivo existente
backup_if_exists() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup_name="${BACKUP_DIR}/$(basename "$file")-$(date +%s)"
        mkdir -p "$BACKUP_DIR"
        cp "$file" "$backup_name"
        log "Backup criado: $backup_name"
    fi
}

# ==============================================================================
# 🔍 VALIDAÇÕES INICIAIS
# ==============================================================================

validate_environment() {
    section "Validando Ambiente WSL"
    
    # Verificar se está rodando no WSL
    if [[ ! -f /proc/version ]] || ! grep -qi microsoft /proc/version; then
        error "Este script deve ser executado no WSL Ubuntu"
    fi
    
    # Verificar se o diretório do projeto Windows existe
    if [[ ! -d "$WINDOWS_PROJECT_PATH" ]]; then
        error "Diretório do projeto Windows não encontrado: $WINDOWS_PROJECT_PATH"
    fi
    
    # Verificar distribuição Ubuntu
    if ! grep -qi ubuntu /etc/os-release; then
        warning "Este script foi testado no Ubuntu. Outras distribuições podem ter problemas."
    fi
    
    success "Ambiente WSL validado"
}

# ==============================================================================
# 📦 INSTALAÇÃO DE DEPENDÊNCIAS
# ==============================================================================

install_dependencies() {
    section "Instalando Dependências do Sistema"
    
    # Atualizar system packages
    log "Atualizando packages do sistema..."
    sudo apt update && sudo apt upgrade -y
    
    # Instalar ferramentas básicas
    log "Instalando ferramentas básicas..."
    sudo apt install -y \
        curl \
        wget \
        git \
        build-essential \
        ca-certificates \
        gnupg \
        lsb-release \
        unzip \
        software-properties-common
    
    success "Dependências básicas instaladas"
}

install_nodejs() {
    section "Instalando Node.js e PNPM"
    
    # Instalar Node.js via NodeSource
    if ! command_exists node; then
        log "Instalando Node.js LTS..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log "Node.js já instalado: $(node --version)"
    fi
    
    # Instalar PNPM
    if ! command_exists pnpm; then
        log "Instalando PNPM..."
        curl -fsSL https://get.pnpm.io/install.sh | sh -
        source ~/.bashrc
    else
        log "PNPM já instalado: $(pnpm --version)"
    fi
    
    success "Node.js e PNPM configurados"
}

# ==============================================================================
# 📂 CONFIGURAÇÃO DE DIRETÓRIOS E PROJETO
# ==============================================================================

setup_project_directory() {
    section "Configurando Diretório do Projeto"
    
    # Criar diretório do projeto no WSL
    if [[ ! -d "$WSL_PROJECT_PATH" ]]; then
        log "Criando diretório do projeto: $WSL_PROJECT_PATH"
        mkdir -p "$WSL_PROJECT_PATH"
    fi
    
    # Copiar estrutura básica do projeto
    log "Copiando estrutura do projeto..."
    rsync -av --exclude=node_modules --exclude=.git --exclude=.next --exclude=dist --exclude=build "$WINDOWS_PROJECT_PATH/" "$WSL_PROJECT_PATH/"
    
    success "Projeto copiado para WSL"
}

# ==============================================================================
# ⚙️ CONFIGURAÇÕES VS CODE
# ==============================================================================

setup_vscode_settings() {
    section "Configurando VS Code para WSL"
    
    local vscode_dir="$HOME/.vscode-server/data/Machine"
    mkdir -p "$vscode_dir"
    
    # Configurações adaptadas para WSL
    cat > "$vscode_dir/settings.json" << 'VSCODE_EOF'
{
    "biome.enabled": true,
    "biome.lspBin": "pnpm",
    "biome.lspBinArguments": ["exec", "biome"],
    "biome.rename": true,
    "biome.requireConfiguration": true,
    
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.formatOnPaste": false,
    "editor.codeActionsOnSave": {
        "source.fixAll.biome": "explicit",
        "source.organizeImports.biome": "explicit"
    },
    
    "npm.packageManager": "pnpm",
    "terminal.integrated.defaultProfile.linux": "bash",
    
    "vitest.enable": true,
    "vitest.commandLine": "pnpm exec vitest",
    
    "files.associations": {
        "biome.json": "jsonc",
        "biome.jsonc": "jsonc"
    }
}
VSCODE_EOF
    
    # Copiar tasks.json para o projeto WSL
    cp "$WINDOWS_PROJECT_PATH/.vscode/tasks.json" "$WSL_PROJECT_PATH/.vscode/"
    
    success "Configurações VS Code aplicadas"
}

# ==============================================================================
# 🔧 CONFIGURAÇÕES GIT
# ==============================================================================

setup_git_config() {
    section "Configurando Git"
    
    # Verificar se Git já está configurado
    if ! git config --global user.name >/dev/null 2>&1; then
        log "Configurando Git pela primeira vez..."
        echo -n "Digite seu nome para Git: "
        read git_name
        echo -n "Digite seu email para Git: "
        read git_email
        
        git config --global user.name "$git_name"
        git config --global user.email "$git_email"
    else
        log "Git já configurado para: $(git config --global user.name) <$(git config --global user.email)>"
    fi
    
    # Configurações adicionais para WSL
    git config --global core.autocrlf input
    git config --global core.eol lf
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    
    success "Git configurado"
}

# ==============================================================================
# 📦 CONFIGURAÇÕES NPM/PNPM
# ==============================================================================

setup_npm_pnpm_config() {
    section "Configurando NPM e PNPM"
    
    # Configurar diretórios NPM globais
    mkdir -p "$HOME/.npm-global"
    npm config set prefix "$HOME/.npm-global"
    
    # Copiar configurações PNPM
    backup_if_exists "$HOME/.pnpmrc"
    cp "$WINDOWS_PROJECT_PATH/.pnpmrc" "$HOME/.pnpmrc"
    
    # Copiar configurações NPM do projeto
    backup_if_exists "$WSL_PROJECT_PATH/.npmrc"
    cp "$WINDOWS_PROJECT_PATH/.npmrc" "$WSL_PROJECT_PATH/.npmrc"
    
    success "NPM e PNPM configurados"
}

# ==============================================================================
# 🌍 CONFIGURAÇÕES DE AMBIENTE
# ==============================================================================

setup_environment_variables() {
    section "Configurando Variáveis de Ambiente"
    
    # Backup do bashrc
    backup_if_exists "$HOME/.bashrc"
    
    # Adicionar configurações ao bashrc
    cat >> "$HOME/.bashrc" << 'BASHRC_EOF'

# ==============================================================================
# 🎯 NEONPRO WSL Environment Configuration
# ==============================================================================

# Node.js e NPM
export PATH="$HOME/.npm-global/bin:$PATH"
export NODE_OPTIONS="--max-old-space-size=4096"

# PNPM
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Aliases úteis
alias ll="ls -alF"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."

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

# ==============================================================================
BASHRC_EOF
    
    success "Variáveis de ambiente configuradas"
}

# ==============================================================================
# 🏗️ INSTALAÇÃO DE DEPENDÊNCIAS DO PROJETO
# ==============================================================================

install_project_dependencies() {
    section "Instalando Dependências do Projeto"
    
    cd "$WSL_PROJECT_PATH"
    
    # Instalar dependências
    log "Instalando dependências com PNPM..."
    pnpm install
    
    success "Dependências do projeto instaladas"
}

# ==============================================================================
# 🧪 VALIDAÇÃO FINAL
# ==============================================================================

validate_installation() {
    section "Validando Instalação"
    
    cd "$WSL_PROJECT_PATH"
    
    # Verificar comandos essenciais
    local commands=("node" "npm" "pnpm" "git")
    for cmd in "${commands[@]}"; do
        if command_exists "$cmd"; then
            success "$cmd: $(command -v $cmd)"
        else
            error "$cmd não encontrado"
        fi
    done
    
    success "Validação concluída"
}

# ==============================================================================
# 🎯 FUNÇÃO PRINCIPAL
# ==============================================================================

main() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🎯 NEONPRO WSL Ubuntu Setup                               ║
║                                                                              ║
║    Este script configura um ambiente de desenvolvimento completo            ║
║    no WSL Ubuntu com todas as configurações do projeto NeonPro              ║
╚══════════════════════════════════════════════════════════════════════════════╝
${NC}"
    
    log "Iniciando setup do ambiente WSL Ubuntu"
    
    # Executar etapas do setup
    validate_environment
    install_dependencies
    install_nodejs
    setup_project_directory
    setup_vscode_settings
    setup_git_config
    setup_npm_pnpm_config
    setup_environment_variables
    install_project_dependencies
    validate_installation
    
    echo -e "\n${GREEN}
╔══════════════════════════════════════════════════════════════════════════════╗
║                           ✅ SETUP CONCLUÍDO!                               ║
║                                                                              ║
║    Ambiente WSL Ubuntu configurado com sucesso!                             ║
║    Execute 'source ~/.bashrc' ou reinicie o terminal                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
${NC}"
    
    success "Setup WSL Ubuntu concluído com sucesso!"
}

# Executar se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
