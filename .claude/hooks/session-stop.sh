#!/bin/bash

# Linux/Unix Session Stop Hook for Claude Code
# This script executes when a session stops

# Get script directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${HOOK_DIR}/claude-hooks.log"
CACHE_DIR="${HOOK_DIR}/../../.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Initialize session variables
SESSION_ID="${1:-session_$$}"
SESSION_ACTION="${2:-stop}"

# Set environment variables
export CLAUDE_SESSION_ID="$SESSION_ID"
export CLAUDE_SESSION_ACTION="$SESSION_ACTION"

# Log execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Session hook: $SESSION_ID ($SESSION_ACTION)" >> "$LOG_FILE" 2>/dev/null

# Exit successfully
exit 0