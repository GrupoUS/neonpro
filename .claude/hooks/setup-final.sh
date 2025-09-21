#!/bin/bash
# Final setup script for Claude Code hooks
# Run this script to complete the hook setup

# Get hook directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set executable permissions on shell scripts
chmod +x "$HOOK_DIR"/*.sh 2>/dev/null

# Clean up temporary files
rm -f "$HOOK_DIR"/../*.temp 2>/dev/null

# Suppress output to reduce token consumption
echo '{"suppressOutput": true}'
exit 0
