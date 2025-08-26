#!/bin/bash
# Claude Code Post-Tool Intelligence Hook - Ubuntu Version
# Version: 5.0.2 - Self-Contained

# Set up logging variables
LOG_FILE="$(dirname "$0")/../claude-hooks.log"
HOOK_DIR="$(dirname "$0")/.."
CACHE_DIR="$(dirname "$0")/../../.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Initialize core variables
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
TOOL_RESULT="${CLAUDE_TOOL_RESULT:-success}"
SESSION_ID="${CLAUDE_SESSION_ID:-$$}"

# Log execution
echo "$(date) [INFO] [POST_TOOL_HOOK] Post-tool intelligence hook executing for tool: $TOOL_NAME (result: $TOOL_RESULT)" >> "$LOG_FILE" 2>/dev/null

# Set environment variables
export CLAUDE_HOOK_PHASE="post_tool_use"
export CLAUDE_CURRENT_TOOL="$TOOL_NAME"
export CLAUDE_TOOL_RESULT="$TOOL_RESULT"

# Log success and exit
echo "$(date) [SUCCESS] [POST_TOOL_HOOK] Post-tool intelligence hook completed successfully" >> "$LOG_FILE" 2>/dev/null
exit 0