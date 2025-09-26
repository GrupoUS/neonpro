#!/bin/bash

# NEONPRO - Common Logging Utilities
# Provides standardized logging functions for all scripts
# Version: 1.0 - REFACTOR Phase

set -euo pipefail

# ==============================================
# COLOR AND FORMATTING DEFINITIONS
# ==============================================

# Color definitions
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly GRAY='\033[0;90m'
readonly NC='\033[0m' # No Color

# Icons for different message types
readonly ICON_INFO="ℹ️"
readonly ICON_SUCCESS="✅"
readonly ICON_WARNING="⚠️"
readonly ICON_ERROR="❌"
readonly ICON_STEP="🔄"
readonly ICON_HEALTHCARE="🏥"
readonly ICON_SECURITY="🔒"
readonly ICON_DEBUG="🔍"
readonly ICON_PERFORMANCE="⚡"

# ==============================================
# LOG LEVEL CONFIGURATION
# ==============================================

# Log levels (in order of verbosity)
readonly LOG_LEVEL_DEBUG=0
readonly LOG_LEVEL_INFO=1
readonly LOG_LEVEL_WARNING=2
readonly LOG_LEVEL_ERROR=3
readonly LOG_LEVEL_OFF=4

# Default log level (can be overridden by environment)
NEONPRO_LOG_LEVEL="${NEONPRO_LOG_LEVEL:-$LOG_LEVEL_INFO}"

# ==============================================
# CORE LOGGING FUNCTIONS
# ==============================================

# Check if message should be displayed based on log level
_should_log() {
    local message_level="$1"
    [[ "$message_level" -ge "$NEONPRO_LOG_LEVEL" ]]
}

# Get timestamp in ISO format
_get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# Get script name for logging context
_get_script_name() {
    basename "${BASH_SOURCE[2]:-${BASH_SOURCE[1]:-${0}}}"
}

# Core logging function
_log() {
    local level="$1"
    local level_name="$2"
    local color="$3"
    local icon="$4"
    local message="$5"
    
    if ! _should_log "$level"; then
        return 0
    fi
    
    local timestamp="$(_get_timestamp)"
    local script_name="$(_get_script_name)"
    
    echo -e "${color}${icon} [${level_name}]${NC} [${timestamp}] [${script_name}] ${message}" >&2
}

# ==============================================
# PUBLIC LOGGING FUNCTIONS
# ==============================================

# Information messages
log_info() {
    _log "$LOG_LEVEL_INFO" "INFO" "$BLUE" "$ICON_INFO" "$1"
}

# Success messages
log_success() {
    _log "$LOG_LEVEL_INFO" "SUCCESS" "$GREEN" "$ICON_SUCCESS" "$1"
}

# Warning messages
log_warning() {
    _log "$LOG_LEVEL_WARNING" "WARNING" "$YELLOW" "$ICON_WARNING" "$1"
}

# Error messages
log_error() {
    _log "$LOG_LEVEL_ERROR" "ERROR" "$RED" "$ICON_ERROR" "$1"
}

# Debug messages
log_debug() {
    _log "$LOG_LEVEL_DEBUG" "DEBUG" "$GRAY" "$ICON_DEBUG" "$1"
}

# Step messages (for process flow)
log_step() {
    _log "$LOG_LEVEL_INFO" "STEP" "$PURPLE" "$ICON_STEP" "$1"
}

# Healthcare-specific messages
log_healthcare() {
    _log "$LOG_LEVEL_INFO" "HEALTHCARE" "$CYAN" "$ICON_HEALTHCARE" "$1"
}

# Security-specific messages
log_security() {
    _log "$LOG_LEVEL_INFO" "SECURITY" "$PURPLE" "$ICON_SECURITY" "$1"
}

# Performance-specific messages
log_performance() {
    _log "$LOG_LEVEL_INFO" "PERFORMANCE" "$CYAN" "$ICON_PERFORMANCE" "$1"
}

# ==============================================
# FORMATTED LOGGING FUNCTIONS
# ==============================================

# Section header
log_section() {
    local title="$1"
    local width=80
    local padding=$(( (width - ${#title} - 4) / 2 ))
    
    echo ""
    echo -e "${PURPLE}$(printf '=%.0s' $(seq 1 $width))${NC}"
    echo -e "${PURPLE}$(printf ' %.0s' $(seq 1 $padding))${WHITE}${title}${PURPLE}$(printf ' %.0s' $(seq 1 $padding))${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' $(seq 1 $width))${NC}"
    echo ""
}

# Subsection header
log_subsection() {
    local title="$1"
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│ ${WHITE}${title}${CYAN}$(printf ' %.0s' $(seq 1 $((78 - ${#title}))))│${NC}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# Progress indicator
log_progress() {
    local current="$1"
    local total="$2"
    local message="${3:-"Processing"}"
    
    if [[ "$total" -gt 0 ]]; then
        local percentage=$(( (current * 100) / total ))
        local completed=$(( (current * 50) / total ))
        local remaining=$(( 50 - completed ))
        
        printf "\r${BLUE}[${ICON_PROGRESS}]${NC} ${message}: [${GREEN}$(printf '█%.0s' $(seq 1 $completed))${GRAY}$(printf '█%.0s' $(seq 1 $remaining))${NC}] ${percentage}%% (${current}/${total})"
    fi
    
    # Print newline if this is the final progress update
    if [[ "$current" -eq "$total" ]]; then
        echo ""
    fi
}

# ==============================================
# CONDITIONAL LOGGING FUNCTIONS
# ==============================================

# Log success or error based on exit code
log_result() {
    local exit_code="$1"
    local success_message="$2"
    local error_message="$3"
    
    if [[ "$exit_code" -eq 0 ]]; then
        log_success "$success_message"
    else
        log_error "$error_message (exit code: $exit_code)"
    fi
}

# Log with rate limiting (avoid spam)
declare -A _last_log_time
declare -r _LOG_RATE_LIMIT_SECONDS=5

_log_rate_limited() {
    local key="$1"
    local message="$2"
    
    local current_time=$(date +%s)
    local last_time="${_last_log_time[$key]:-0}"
    
    if (( current_time - last_time >= _LOG_RATE_LIMIT_SECONDS )); then
        log_info "$message"
        _last_log_time["$key"]="$current_time"
    fi
}

# ==============================================
# OUTPUT REDIRECTION
# ==============================================

# Tee output to both console and log file
log_with_file() {
    local message="$1"
    local log_file="${2:-"neonpro.log"}"
    
    echo "$message" | tee -a "$log_file"
}

# Start logging to file
start_file_logging() {
    local log_file="${1:-"neonpro.log"}"
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$log_file")"
    
    # Log session start
    local timestamp="$(_get_timestamp)"
    echo "===== Session started at $timestamp =====" >> "$log_file"
    
    log_info "Logging to file: $log_file"
}

# ==============================================
# CONFIGURATION FUNCTIONS
# ==============================================

# Set log level
set_log_level() {
    local level="$1"
    
    case "$level" in
        "debug"|0) NEONPRO_LOG_LEVEL="$LOG_LEVEL_DEBUG" ;;
        "info"|1) NEONPRO_LOG_LEVEL="$LOG_LEVEL_INFO" ;;
        "warning"|2) NEONPRO_LOG_LEVEL="$LOG_LEVEL_WARNING" ;;
        "error"|3) NEONPRO_LOG_LEVEL="$LOG_LEVEL_ERROR" ;;
        "off"|4) NEONPRO_LOG_LEVEL="$LOG_LEVEL_OFF" ;;
        *)
            log_error "Invalid log level: $level. Use: debug, info, warning, error, off"
            return 1
            ;;
    esac
    
    log_info "Log level set to: $level"
}

# ==============================================
# UTILITY FUNCTIONS
# ==============================================

# Log script start
log_script_start() {
    local script_name="$(_get_script_name)"
    local timestamp="$(_get_timestamp)"
    
    log_section "Starting $script_name"
    log_info "Script started at: $timestamp"
    log_info "Log level: $NEONPRO_LOG_LEVEL"
    
    # Log system info
    log_debug "System: $(uname -a)"
    log_debug "User: $(whoami)"
    log_debug "PID: $$"
}

# Log script end
log_script_end() {
    local script_name="$(_get_script_name)"
    local timestamp="$(_get_timestamp)"
    local exit_code="${1:-0}"
    
    if [[ "$exit_code" -eq 0 ]]; then
        log_success "Script completed successfully"
    else
        log_error "Script failed with exit code: $exit_code"
    fi
    
    log_info "Script ended at: $timestamp"
    echo ""
}

# Log command execution
log_command() {
    local command="$1"
    
    log_debug "Executing command: $command"
}

# ==============================================
# EXPORT FUNCTIONS
# ==============================================

# Make all logging functions available when sourced
export -f log_info
export -f log_success
export -f log_warning
export -f log_error
export -f log_debug
export -f log_step
export -f log_healthcare
export -f log_security
export -f log_performance
export -f log_section
export -f log_subsection
export -f log_progress
export -f log_result
export -f log_with_file
export -f start_file_logging
export -f set_log_level
export -f log_script_start
export -f log_script_end
export -f log_command

# Export configuration variables
export NEONPRO_LOG_LEVEL

# Auto-initialize logging utilities when sourced
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "Logging utilities loaded successfully"
    echo "Default log level: $NEONPRO_LOG_LEVEL"
fi
