#!/bin/bash

# NeonPro OxLint Continuous Monitoring Script
# Monitora mudanças nos arquivos e executa linting específico por módulo

set -euo pipefail

# Configuração
PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
MONITOR_INTERVAL=${MONITOR_INTERVAL:-2}
LOG_FILE="$PROJECT_ROOT/.oxlint_monitor.log"
PID_FILE="$PROJECT_ROOT/.oxlint_monitor.pid"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para logging
log() {
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[$timestamp] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[$timestamp] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[$timestamp] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Função para mapear arquivo para módulo
get_module_for_file() {
    local file=$1

    case $file in
        apps/api/*)
            echo "api"
            ;;
        apps/web/*)
            echo "web"
            ;;
        packages/security/*)
            echo "security"
            ;;
        packages/healthcare-core/*)
            echo "healthcare"
            ;;
        packages/ui/*)
            echo "ui"
            ;;
        packages/*)
            echo "packages"
            ;;
        *)
            echo "root"
            ;;
    esac
}

# Função para executar lint específico
run_specific_lint() {
    local module=$1
    local file_changed=$2

    log "Arquivo alterado: $file_changed (módulo: $module)"

    if [[ "$module" == "root" ]] || [[ "$module" == "packages" ]]; then
        log "Executando lint geral..."
        if oxlint . --import-plugin --react-plugin --jsx-a11y-plugin > /dev/null 2>&1; then
            success "Lint geral passou"
        else
            warning "Lint geral encontrou problemas"
        fi
    else
        log "Executando lint específico para $module..."
        if "$PROJECT_ROOT/scripts/oxlint-hierarchical.sh" check "$module" > /dev/null 2>&1; then
            success "Lint específico para $module passou"
        else
            warning "Lint específico para $module encontrou problemas"
        fi
    fi
}

# Função para verificar se processo já está rodando
check_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "Monitor já está rodando (PID: $pid)"
            echo "Use 'stop' para parar o monitor atual"
            exit 1
        else
            rm -f "$PID_FILE"
        fi
    fi
}

# Função para parar o monitor
stop_monitor() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill "$pid"
            rm -f "$PID_FILE"
            success "Monitor parado (PID: $pid)"
        else
            warning "Monitor não estava rodando"
            rm -f "$PID_FILE"
        fi
    else
        warning "Monitor não estava rodando"
    fi
}

# Função para mostrar status
show_status() {
    echo -e "${PURPLE}🔍 Status do Monitor OxLint${NC}"
    echo

    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Monitor rodando (PID: $pid)${NC}"
            echo -e "${BLUE}📁 Diretório: $PROJECT_ROOT${NC}"
            echo -e "${BLUE}📄 Log: $LOG_FILE${NC}"
            echo -e "${BLUE}⏱️  Intervalo: ${MONITOR_INTERVAL}s${NC}"
        else
            echo -e "${RED}❌ PID file existe mas processo não está rodando${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⏸️  Monitor não está rodando${NC}"
    fi

    if [[ -f "$LOG_FILE" ]]; then
        echo
        echo -e "${YELLOW}📊 Últimas 10 linhas do log:${NC}"
        tail -10 "$LOG_FILE"
    fi
}

# Função para monitorar mudanças
start_monitor() {
    check_running

    # Salvar PID
    echo $$ > "$PID_FILE"

    log "Iniciando monitor OxLint hierárquico..."
    log "Diretório: $PROJECT_ROOT"
    log "Intervalo: ${MONITOR_INTERVAL}s"
    log "Log: $LOG_FILE"

    # Verificar se inotify está disponível
    if command -v inotifywait > /dev/null; then
        log "Usando inotifywait para monitoramento"
        monitor_with_inotify
    else
        log "inotifywait não disponível, usando polling"
        monitor_with_polling
    fi
}

# Monitoramento com inotify (Linux)
monitor_with_inotify() {
    local watched_paths=(
        "apps/api/src"
        "apps/web/src"
        "packages/security/src"
        "packages/healthcare-core/src"
        "packages/ui/src"
    )

    for path in "${watched_paths[@]}"; do
        if [[ -d "$PROJECT_ROOT/$path" ]]; then
            log "Monitorando: $path"
        fi
    done

    # Monitor em background
    inotifywait -m -r -e modify,create,delete,move \
        --format '%w%f %e' \
        "${watched_paths[@]/#/$PROJECT_ROOT/}" 2>/dev/null | \
    while read file event; do
        # Filtrar apenas arquivos relevantes
        if [[ "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
            local rel_file=${file#$PROJECT_ROOT/}
            local module=$(get_module_for_file "$rel_file")
            run_specific_lint "$module" "$rel_file"
        fi
    done
}

# Monitoramento com polling (fallback)
monitor_with_polling() {
    local last_check=$(date +%s)

    while true; do
        local current_time=$(date +%s)

        # Verificar arquivos modificados nos últimos MONITOR_INTERVAL segundos
        local modified_files=$(find "$PROJECT_ROOT" \
            -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
            xargs stat --format='%Y %n' 2>/dev/null | \
            awk -v since="$last_check" '$1 > since {print $2}')

        if [[ -n "$modified_files" ]]; then
            while IFS= read -r file; do
                local rel_file=${file#$PROJECT_ROOT/}
                local module=$(get_module_for_file "$rel_file")
                run_specific_lint "$module" "$rel_file"
            done <<< "$modified_files"
        fi

        last_check=$current_time
        sleep "$MONITOR_INTERVAL"
    done
}

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🔍 NeonPro OxLint Continuous Monitor${NC}"
    echo
    echo -e "${YELLOW}Uso:${NC}"
    echo "  $0 [comando]"
    echo
    echo -e "${YELLOW}Comandos:${NC}"
    echo "  start                    - Iniciar monitoramento contínuo"
    echo "  stop                     - Parar monitoramento"
    echo "  restart                  - Reiniciar monitoramento"
    echo "  status                   - Mostrar status do monitor"
    echo "  log                      - Mostrar log completo"
    echo "  clean                    - Limpar logs"
    echo "  help                     - Mostrar esta ajuda"
    echo
    echo -e "${YELLOW}Variáveis de Ambiente:${NC}"
    echo "  MONITOR_INTERVAL=N       - Intervalo de polling em segundos (padrão: 2)"
    echo
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  $0 start                 - Iniciar monitor"
    echo "  MONITOR_INTERVAL=5 $0 start  - Iniciar com intervalo de 5s"
    echo "  $0 status                - Ver status"
    echo "  $0 stop                  - Parar monitor"
    echo
    echo -e "${YELLOW}Como funciona:${NC}"
    echo "  • Monitora mudanças em arquivos .ts/.tsx/.js/.jsx"
    echo "  • Executa lint específico apenas no módulo alterado"
    echo "  • Usa configurações hierárquicas por módulo"
    echo "  • Log contínuo em .oxlint_monitor.log"
    echo
}

# Função para limpeza ao sair
cleanup() {
    if [[ -f "$PID_FILE" ]]; then
        rm -f "$PID_FILE"
    fi
    log "Monitor finalizado"
}

# Trap para limpeza
trap cleanup EXIT INT TERM

# Main
main() {
    local command=${1:-"help"}

    case $command in
        "start")
            start_monitor
            ;;
        "stop")
            stop_monitor
            ;;
        "restart")
            stop_monitor
            sleep 1
            start_monitor
            ;;
        "status")
            show_status
            ;;
        "log")
            if [[ -f "$LOG_FILE" ]]; then
                cat "$LOG_FILE"
            else
                warning "Log file não encontrado: $LOG_FILE"
            fi
            ;;
        "clean")
            if [[ -f "$LOG_FILE" ]]; then
                > "$LOG_FILE"
                success "Log limpo"
            else
                warning "Log file não encontrado"
            fi
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Comando inválido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Executar main com todos os argumentos
main "$@"
