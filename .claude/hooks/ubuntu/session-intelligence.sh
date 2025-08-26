#!/bin/bash
# Claude Code Session Intelligence Hook - Ubuntu Version
# Version: 5.0.2 - Self-Contained

# Set up logging variables
LOG_FILE="$(dirname "$0")/../claude-hooks.log"
HOOK_DIR="$(dirname "$0")/.."
CACHE_DIR="$(dirname "$0")/../../.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Initialize session variables
SESSION_ID="${1:-session_$$}"
SESSION_ACTION="${2:-monitor}"

# Log execution
echo "$(date) [INFO] [SESSION_HOOK] Session intelligence hook executing - ID: $SESSION_ID, Action: $SESSION_ACTION" >> "$LOG_FILE" 2>/dev/null

# Set environment variables
export CLAUDE_SESSION_ID="$SESSION_ID"
export CLAUDE_SESSION_ACTION="$SESSION_ACTION"

# Log success and exit
echo "$(date) [SUCCESS] [SESSION_HOOK] Session intelligence hook completed successfully" >> "$LOG_FILE" 2>/dev/null
exit 0