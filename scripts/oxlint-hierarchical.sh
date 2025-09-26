#!/bin/bash

# NeonPro OxLint Hierarchical Configuration Manager
# Usage: ./scripts/oxlint-hierarchical.sh [command] [target]

set -euo pipefail

# Configuração
PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
OXLINT_CACHE_DIR="$PROJECT_ROOT/.oxlint_cache"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Função para verificar se oxlint está instalado
check_oxlint() {
    if ! command -v oxlint &> /dev/null; then
        if ! npx oxlint --version &> /dev/null; then
            error "OxLint não encontrado. Instale com: bun add -D oxlint"
        fi
        OXLINT_CMD="npx oxlint"
    else
        OXLINT_CMD="oxlint"
    fi
}

# Função para lint específico por módulo
lint_module() {
    local module=$1
    local fix_mode=${2:-"check"}

    case $module in
        "api"|"backend")
            local path="apps/api"
            local config="apps/api/.oxlintrc.json"
            ;;
        "web"|"frontend")
            local path="apps/web"
            local config="apps/web/.oxlintrc.json"
            ;;
        "security")
            local path="packages/security"
            local config="packages/security/.oxlintrc.json"
            ;;
        "healthcare")
            local path="packages/healthcare-core"
            local config="packages/healthcare-core/.oxlintrc.json"
            ;;
        "ui")
            local path="packages/ui"
            local config="packages/ui/.oxlintrc.json"
            ;;
        "all")
            lint_all_modules $fix_mode
            return
            ;;
        *)
            error "Módulo inválido: $module. Use: api, web, security, healthcare, ui, ou all"
            ;;
    esac

    if [[ ! -d "$PROJECT_ROOT/$path" ]]; then
        error "Diretório não encontrado: $path"
    fi

    if [[ ! -f "$PROJECT_ROOT/$config" ]]; then
        warning "Config específico não encontrado para $module, usando config root"
        config=".oxlintrc.json"
    fi

    log "Executando OxLint para $module ($path)..."

    cd "$PROJECT_ROOT"

    case $fix_mode in
        "fix")
            $OXLINT_CMD --config "$config" --fix "$path"
            ;;
        "fix-all")
            $OXLINT_CMD --config "$config" --fix --fix-suggestions "$path"
            ;;
        "fix-dangerous")
            warning "Executando fixes perigosos - revise as mudanças!"
            $OXLINT_CMD --config "$config" --fix --fix-suggestions --fix-dangerously "$path"
            ;;
        *)
            $OXLINT_CMD --config "$config" "$path"
            ;;
    esac

    success "OxLint concluído para $module"
}

# Função para lint todos os módulos
lint_all_modules() {
    local fix_mode=${1:-"check"}

    log "Executando OxLint hierárquico para todos os módulos..."

    # Ordem de prioridade: security first, depois healthcare, depois o resto
    local modules=("security" "healthcare" "api" "web" "ui")

    for module in "${modules[@]}"; do
        if [[ -d "$PROJECT_ROOT/packages/$module" ]] || [[ -d "$PROJECT_ROOT/apps/$module" ]]; then
            lint_module "$module" "$fix_mode"
        else
            warning "Módulo $module não encontrado, pulando..."
        fi
    done

    success "OxLint hierárquico concluído para todos os módulos"
}

# Função para mostrar configurações ativas
show_configs() {
    log "Configurações OxLint hierárquicas ativas:"
    echo

    echo -e "${YELLOW}📋 Root Config:${NC}"
    echo "  📁 .oxlintrc.json (base)"
    echo

    echo -e "${YELLOW}🔧 Apps:${NC}"
    [[ -f "$PROJECT_ROOT/apps/api/.oxlintrc.json" ]] && echo "  🚀 apps/api/.oxlintrc.json (Node.js/tRPC)"
    [[ -f "$PROJECT_ROOT/apps/web/.oxlintrc.json" ]] && echo "  🌐 apps/web/.oxlintrc.json (React/TanStack)"
    echo

    echo -e "${YELLOW}📦 Packages:${NC}"
    [[ -f "$PROJECT_ROOT/packages/security/.oxlintrc.json" ]] && echo "  🔒 packages/security/.oxlintrc.json (Máxima Strictness)"
    [[ -f "$PROJECT_ROOT/packages/healthcare-core/.oxlintrc.json" ]] && echo "  🏥 packages/healthcare-core/.oxlintrc.json (LGPD/ANVISA)"
    [[ -f "$PROJECT_ROOT/packages/ui/.oxlintrc.json" ]] && echo "  🎨 packages/ui/.oxlintrc.json (React/A11y)"
    echo
}

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🔧 NeonPro OxLint Hierarchical Configuration Manager${NC}"
    echo
    echo -e "${YELLOW}Uso:${NC}"
    echo "  $0 [comando] [módulo]"
    echo
    echo -e "${YELLOW}Comandos:${NC}"
    echo "  check [módulo]           - Verificar lint (padrão)"
    echo "  fix [módulo]             - Aplicar fixes seguros"
    echo "  fix-all [módulo]         - Aplicar fixes + suggestions"
    echo "  fix-dangerous [módulo]   - Aplicar TODOS os fixes (CUIDADO!)"
    echo "  configs                  - Mostrar configurações ativas"
    echo "  help                     - Mostrar esta ajuda"
    echo
    echo -e "${YELLOW}Módulos:${NC}"
    echo "  api|backend              - Backend API (Node.js/tRPC)"
    echo "  web|frontend             - Frontend Web (React/TanStack)"
    echo "  security                 - Package Security (Máxima Strictness)"
    echo "  healthcare               - Package Healthcare Core (LGPD/ANVISA)"
    echo "  ui                       - Package UI (React/A11y)"
    echo "  all                      - Todos os módulos"
    echo
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  $0 check security        - Verificar package security"
    echo "  $0 fix api              - Aplicar fixes seguros na API"
    echo "  $0 fix-all all          - Aplicar fixes + suggestions em tudo"
    echo "  $0 configs              - Ver configurações hierárquicas"
    echo
}

# Main
main() {
    local command=${1:-"help"}
    local target=${2:-"all"}

    check_oxlint

    case $command in
        "check")
            lint_module "$target" "check"
            ;;
        "fix")
            lint_module "$target" "fix"
            ;;
        "fix-all")
            lint_module "$target" "fix-all"
            ;;
        "fix-dangerous")
            lint_module "$target" "fix-dangerous"
            ;;
        "configs")
            show_configs
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Comando inválido: $command. Use 'help' para ver opções disponíveis."
            ;;
    esac
}

# Executar main com todos os argumentos
main "$@"
