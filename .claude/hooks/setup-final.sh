#!/bin/bash
# Final setup script for Claude Code hooks
# Run this script to complete the multiplataform hook setup

echo "Setting up multiplataform Claude Code hooks..."

# Navigate to project directory
cd /mnt/d/neonpro

# Replace settings file
echo "Updating settings.local.json..."
mv .claude/settings.local.json.new .claude/settings.local.json
echo "✓ Settings file updated"

# Clean up temporary files
rm -f .claude/settings.local.json.temp

# Set executable permissions on shell scripts
echo "Setting executable permissions on shell scripts..."
chmod +x .claude/hooks/commons.sh
chmod +x .claude/hooks/pre-tool.sh
chmod +x .claude/hooks/post-tool.sh
chmod +x .claude/hooks/session-stop.sh
echo "✓ Shell scripts are now executable"

# Verify setup
echo "
Setup verification:"
echo "Settings file:"
ls -la .claude/settings.local.json
echo "
Shell scripts:"
ls -la .claude/hooks/*.sh

echo "
✓ Setup completed successfully!"
echo "Your Claude Code hooks are now compatible with both Windows and Linux/Ubuntu."
echo "The system will automatically detect the environment and use the appropriate version."
