#!/usr/bin/env python3
"""
File Validator Hook for Claude Code
Protects truly sensitive files from being modified by Desktop Commander operations
Runs before write_file and edit_block operations

REFINED VERSION: Only blocks files that contain actual secrets or production-critical data
Allows normal development work on components, configs, and documentation
"""

import json
import sys
import os
from pathlib import Path

def log_message(message, level="INFO"):
    """Log messages with consistent formatting"""
    print(f"🛡️ [{level}] {message}", file=sys.stderr)

def is_sensitive_file(file_path):
    """Check if file should be protected from modification"""
    file_path = Path(file_path).as_posix().lower()
    
    # Only protect files that contain actual secrets or are production-critical
    sensitive_patterns = [
        # Environment files with actual secrets (not examples)
        '.env.production',
        '.env.prod',
        '.env.staging',
        '.env.live',
        
        # Actual credential and secret files
        '/secrets/',
        'credentials.json',
        'service-account.json',
        'private-key.pem',
        'auth-key.json',
        
        # Lock files that manage exact dependency versions
        'package-lock.json',
        'pnpm-lock.yaml', 
        'yarn.lock',
        'bun.lockb',
        
        # Git internals (not .gitignore which devs may need to modify)
        '.git/',
        
        # Production deployment configs only
        'vercel.json',
        'next.config.mjs',  # Specific to the production config
        
        # Database migrations (affect production data)
        'supabase/migrations/',
        'prisma/migrations/',
        'database/migrations/',
        
        # Generated/built files (should never be manually edited)
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        '.turbo/',
        'coverage/',
        '.generated.',
        
        # CI/CD production pipelines
        '.github/workflows/deploy.yml',
        '.github/workflows/release.yml',
        
        # Actual certificates and production keys
        '.pem',
        '.key',
        '.crt',
        '.cert',
        '.p12',
        '.jks',
        
        # Production database files
        '*.db',
        '*.sqlite',
        '/backup/',
        
        # System files
        '.ds_store',
        'thumbs.db',
    ]
    
    # Check if file matches any truly sensitive pattern
    for pattern in sensitive_patterns:
        if pattern in file_path:
            return True, pattern
            
    return False, None

def is_allowed_development_file(file_path):
    """Check if this is a normal development file that should be allowed"""
    file_path = Path(file_path).as_posix().lower()
    
    # Allow all component development
    allowed_patterns = [
        '/components/',
        '/pages/',
        '/app/',
        '/src/',
        '/lib/',
        '/utils/',
        '/hooks/',
        '/types/',
        '/styles/',
        '/tests/',
        '__tests__',
        '.test.',
        '.spec.',
        
        # Allow development configs
        'tsconfig.json',
        'tailwind.config',
        'package.json',
        '.eslintrc',
        '.prettierrc',
        'dprint.json',
        
        # Allow documentation
        'readme.md',
        'claude.md',
        '.md',
        
        # Allow development environment files
        '.env.local',
        '.env.development',
        '.env.example',
        
        # Allow compliance development work
        '/compliance/',
        '/healthcare/',
        
        # Allow other development work
        '/api/',
        '/docs/',
        '/guides/',
    ]
    
    return any(pattern in file_path for pattern in allowed_patterns)

def main():
    """Main validation logic"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Extract file path and tool information
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        
        # Handle different Desktop Commander tools
        file_path = None
        if 'file_path' in tool_input:
            file_path = tool_input['file_path']
        elif 'path' in tool_input:
            file_path = tool_input['path']
        
        if not file_path:
            log_message("No file path found in tool input - allowing operation")
            sys.exit(0)
        
        # Normalize file path
        file_path = os.path.normpath(file_path)
        
        log_message(f"Validating file access: {file_path}")
        log_message(f"Tool: {tool_name}")
        
        # Check if it's an allowed development file first
        if is_allowed_development_file(file_path):
            log_message(f"Development file allowed: {file_path}")
            sys.exit(0)
        
        # Check if file is truly sensitive
        is_sensitive, matched_pattern = is_sensitive_file(file_path)
        
        if is_sensitive:
            # Block the operation
            error_message = f"""
🚨 BLOCKED: Attempted to modify sensitive file
File: {file_path}
Pattern: {matched_pattern}
Reason: This file contains secrets or production-critical configuration.

If you need to modify this file:
1. Use appropriate tools outside Claude Code
2. Ensure proper security review
3. Consider environment-specific alternatives
"""
            
            print(error_message, file=sys.stderr)
            log_message(f"Blocked access to sensitive file: {file_path} (pattern: {matched_pattern})", "BLOCKED")
            
            # Exit with code 2 to block the tool call
            sys.exit(2)
        
        # Allow the operation for all other files
        log_message(f"File validation passed for: {file_path}")
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        log_message(f"Invalid JSON input: {e}", "ERROR")
        sys.exit(1)
    except Exception as e:
        log_message(f"Validation error: {e}", "ERROR")
        # In case of errors, allow the operation to proceed (fail-open)
        sys.exit(0)

if __name__ == "__main__":
    main()