#!/usr/bin/env python3
"""
Format and Lint Hook for Claude Code
Automatically formats and lints files after Desktop Commander operations
Supports: oxlint (JS/TS) + dprint (multi-format)
"""

import json
import sys
import os
import subprocess
import re
from pathlib import Path

def log_message(message, level="INFO"):
    """Log messages with consistent formatting"""
    print(f"🔧 [{level}] {message}", file=sys.stderr)

def run_command(cmd, cwd=None, timeout=30):
    """Run shell command with error handling"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result
    except subprocess.TimeoutExpired:
        log_message(f"Command timed out: {cmd}", "ERROR")
        return None
    except Exception as e:
        log_message(f"Command failed: {cmd} - {e}", "ERROR")
        return None

def is_lintable_file(file_path):
    """Check if file should be linted with oxlint"""
    extensions = {'.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts'}
    return Path(file_path).suffix.lower() in extensions

def is_formattable_file(file_path):
    """Check if file should be formatted with dprint"""
    # Based on dprint.json includes pattern
    extensions = {
        '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts',
        '.json', '.jsonc', '.md', '.toml', '.yaml', '.yml',
        '.css', '.scss', '.sass', '.less'
    }
    return Path(file_path).suffix.lower() in extensions or Path(file_path).name == 'Dockerfile'

def should_process_file(file_path):
    """Check if file should be processed (not in excludes)"""
    file_path = Path(file_path).as_posix()
    
    # Skip if in excluded directories/patterns based on dprint.json
    exclude_patterns = [
        '/.git/', '/.trunk/', '/.turbo/', '/.next/', '/node_modules/',
        '/dist/', '/build/', '/coverage/', '/playwright-report/',
        '/.vercel/', '/.claude/', '/.github/', '/.vscode/', '/.idea/',
        '/.trae/', '/.ruler/', '/test-results/', '/archon/', '/serena/',
        '/logs/', '/.env', '/sentry.', '/instrumentation', '/.tmp/'
    ]
    
    for pattern in exclude_patterns:
        if pattern in file_path:
            return False
    
    # Skip generated files
    if '.generated.' in file_path or file_path.endswith('.d.ts'):
        return False
        
    return True

def run_oxlint(file_path, project_root):
    """Run oxlint on specific file"""
    if not is_lintable_file(file_path) or not should_process_file(file_path):
        return None
        
    log_message(f"Running oxlint on {file_path}")
    
    # Use the existing oxlint script from package.json but target specific file
    cmd = f"npx oxlint --fix {file_path}"
    result = run_command(cmd, cwd=project_root)
    
    if result and result.returncode == 0:
        if result.stdout.strip():
            log_message(f"Oxlint applied fixes: {result.stdout.strip()}")
        return True
    elif result:
        if result.stderr.strip():
            log_message(f"Oxlint warnings: {result.stderr.strip()}", "WARN")
        return False
    
    return None

def run_dprint(file_path, project_root):
    """Run dprint fmt on specific file"""
    if not is_formattable_file(file_path) or not should_process_file(file_path):
        return None
        
    log_message(f"Running dprint fmt on {file_path}")
    
    cmd = f"dprint fmt {file_path}"
    result = run_command(cmd, cwd=project_root)
    
    if result and result.returncode == 0:
        if result.stdout.strip():
            log_message(f"Dprint formatting: {result.stdout.strip()}")
        return True
    elif result:
        if result.stderr.strip():
            log_message(f"Dprint errors: {result.stderr.strip()}", "ERROR")
        return False
    
    return None

def main():
    """Main hook execution"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Extract file path from different possible structures
        file_path = None
        tool_input = input_data.get('tool_input', {})
        
        # Handle different Desktop Commander tools
        if 'file_path' in tool_input:
            file_path = tool_input['file_path']
        elif 'path' in tool_input:
            file_path = tool_input['path']
        
        if not file_path:
            log_message("No file path found in tool input", "WARN")
            sys.exit(0)
        
        # Get project root (where package.json is located)
        project_root = input_data.get('cwd', os.getcwd())
        
        # Find actual project root by looking for package.json
        current = Path(project_root)
        while current != current.parent:
            if (current / 'package.json').exists():
                project_root = str(current)
                break
            current = current.parent
        
        log_message(f"Processing file: {file_path}")
        log_message(f"Project root: {project_root}")
        
        # Convert to absolute path if relative
        if not os.path.isabs(file_path):
            file_path = os.path.join(project_root, file_path)
        
        # Check if file exists
        if not os.path.exists(file_path):
            log_message(f"File does not exist: {file_path}", "WARN")
            sys.exit(0)
        
        actions_performed = []
        
        # Step 1: Run oxlint first (linting before formatting)
        oxlint_result = run_oxlint(file_path, project_root)
        if oxlint_result is True:
            actions_performed.append("✓ Linted with oxlint")
        elif oxlint_result is False:
            actions_performed.append("⚠ Oxlint had warnings")
        
        # Step 2: Run dprint formatting
        dprint_result = run_dprint(file_path, project_root)
        if dprint_result is True:
            actions_performed.append("✓ Formatted with dprint")
        elif dprint_result is False:
            actions_performed.append("✗ Dprint formatting failed")
        
        # Provide feedback
        if actions_performed:
            feedback = f"🎯 Code quality tools applied to {os.path.basename(file_path)}: " + ", ".join(actions_performed)
            print(feedback)
        else:
            log_message(f"No formatting/linting needed for {file_path}")
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        log_message(f"Invalid JSON input: {e}", "ERROR")
        sys.exit(1)
    except Exception as e:
        log_message(f"Unexpected error: {e}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()