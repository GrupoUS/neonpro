#!/bin/bash
# Simplified commons.sh - Linux/WSL only

# Get script directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOOK_DIR}/.."
LOG_FILE="${HOOK_DIR}/claude-hooks.log"

# Detect environment
if [[ -f /proc/version ]] && grep -q Microsoft /proc/version; then
    export IS_WSL=1
else
    export IS_WSL=0
fi

# Minimal logging - only errors to reduce token consumption
log_error() {
    local context="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] [$context] $message" >> "$LOG_FILE" 2>/dev/null
}

# Simple command execution without verbose logging
execute_command() {
    local cmd="$1"
    local args="$2"

    $cmd $args
    local result=$?

    if [ $result -ne 0 ]; then
        log_error "EXEC" "Failed: $cmd (exit code $result)"
    fi

    return $result
}

# Export functions for sourcing
export -f log_error execute_command