#!/bin/bash

# Linux/Unix Session Stop Hook for Claude Code
# This script executes when a session stops

# Initialize session variables
SESSION_ID="${1:-session_$$}"
SESSION_ACTION="${2:-stop}"

# Set environment variables
export CLAUDE_SESSION_ID="$SESSION_ID"
export CLAUDE_SESSION_ACTION="$SESSION_ACTION"

# Suppress output to reduce token consumption
echo '{"suppressOutput": true}'
exit 0