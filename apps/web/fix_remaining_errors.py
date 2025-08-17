#!/usr/bin/env python3
"""
More Aggressive TypeScript Error Fixer for @neonpro/web
Handles the most common remaining patterns: object destructuring, prop syntax, JSX structure
"""

import os
import re
import sys
import json
from pathlib import Path

def fix_file_content(file_path, content):
    """Apply fixes to file content"""
    
    original_content = content
    
    # Fix 1: Fix object property destructuring
    # Pattern: { propName ? null : type; }
    content = re.sub(
        r'(\s+)(\w+)\s+\?\s+null\s+:\s+([^;]+);',
        r'\1\2: \3;',
        content
    )
    
    # Fix 2: Fix object property syntax with spread
    # Pattern: ...props -> ...props,
    content = re.sub(
        r'(\s+)(\.\.\.[\w]+)$',
        r'\1\2,',
        content,
        flags=re.MULTILINE
    )
    
    # Fix 3: Fix JSX prop destructuring in components
    # Pattern: }) => { -> }: PropsType) => {
    content = re.sub(
        r'}\)\s*=>\s*{',
        r'}): any) => {',
        content
    )
    
    # Fix 4: Fix array type syntax issues
    # Pattern: type[] -> Array<type>
    content = re.sub(
        r'(\w+)\[\];',
        r'Array<\1>;',
        content
    )
    
    # Fix 5: Fix expression expected issues
    # Pattern: }, -> },
    content = re.sub(
        r'(\s+),\s*\n',
        r'\1\n',
        content
    )
    
    # Fix 6: Fix property assignment in object literals
    # Pattern: property: 'value', -> property: 'value',
    content = re.sub(
        r'(\w+):\s*([^,\n}]+),\s*(\w+):',
        r'\1: \2,\n    \3:',
        content
    )
    
    # Fix 7: Fix JSX closing tag mismatches
    # Simple attempt to fix obvious mismatches
    content = re.sub(
        r'</(\w+)>\s*</(\w+)>',
        lambda m: f'</{m.group(2)}>' if m.group(1) != m.group(2) else m.group(0),
        content
    )
    
    # Fix 8: Fix function return type issues
    content = re.sub(
        r'(\w+)\s*\?\s*null\s*:\s*\(\)\s*=>\s*void;',
        r'\1?: () => void;',
        content
    )
    
    # Fix 9: Fix React component props structure
    # Pattern: {children, className} -> {children, className}: {children: React.ReactNode, className?: string}
    content = re.sub(
        r'=\s*\(\s*{\s*children,\s*className\s*}\s*\)\s*=>\s*{',
        r'= ({ children, className }: { children: React.ReactNode; className?: string }) => {',
        content
    )
    
    # Fix 10: Fix object property access issues
    # Pattern: selectedPatient.(property as any) -> selectedPatient[property as keyof typeof selectedPatient]
    content = re.sub(
        r'(\w+)\.(\([\w\s]+\s+as\s+any\))',
        r'\1[\2 as keyof typeof \1]',
        content
    )
    
    # Fix 11: Fix CSS properties object syntax
    content = re.sub(
        r'(\w+):\s*([^,}]+)\(\)\s*',
        r'\1: \2',
        content
    )
    
    # Fix 12: Fix import statement issues
    content = re.sub(
        r'import\s+\*\s+as\s+(\w+)\s+from\s+[\'"]([^\'"]+)[\'"];?',
        r'import * as \1 from "\2";',
        content
    )
    
    # Fix 13: Fix type assertion syntax
    content = re.sub(
        r'\s+as\s+React\.CSSProperties\(\)',
        r' as React.CSSProperties',
        content
    )
    
    # Fix 14: Fix array element access
    content = re.sub(
        r'(\w+)\[\];',
        r'Array<\1>;',
        content
    )
    
    # Fix 15: Fix missing semicolons in object properties
    content = re.sub(
        r'(\w+):\s*([^,\n}]+)(?=\n\s*\w+:)',
        r'\1: \2;',
        content
    )
    
    # Fix 16: Fix malformed interface/type definitions
    content = re.sub(
        r'interface\s+(\w+)\s*{([^}]*)}',
        lambda m: f'interface {m.group(1)} {{\n{fix_interface_body(m.group(2))}\n}}',
        content,
        flags=re.DOTALL
    )
    
    # Fix 17: Fix JSX expression syntax
    content = re.sub(
        r'{\s*([^}]+)\s*}\)',
        r'{\1})',
        content
    )
    
    return content != original_content, content

def fix_interface_body(body):
    """Fix interface body syntax"""
    lines = body.split('\n')
    fixed_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Fix property syntax
        if ':' in line and not line.endswith(';') and not line.endswith(','):
            line = line.rstrip(',') + ';'
        
        fixed_lines.append('  ' + line)
    
    return '\n'.join(fixed_lines)

def fix_typescript_file(file_path):
    """Fix TypeScript errors in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Skip empty files
        if not content.strip():
            return False
        
        # Apply fixes
        was_modified, fixed_content = fix_file_content(file_path, content)
        
        if was_modified:
            # Write back the fixed content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
    
    return False

def main():
    """Main execution function"""
    
    web_dir = Path("E:/neonpro/apps/web")
    if not web_dir.exists():
        print(f"Error: {web_dir} does not exist")
        return 1
    
    print("Starting aggressive TypeScript error fixes...")
    
    # File patterns to process
    patterns = ['**/*.ts', '**/*.tsx']
    
    # Exclude patterns
    exclude_patterns = [
        'node_modules',
        '.next',
        'dist',
        'build',
        '__tests__',
        '.test.',
        '.spec.',
        'cypress'
    ]
    
    files_processed = 0
    files_modified = 0
    
    for pattern in patterns:
        for file_path in web_dir.glob(pattern):
            # Skip excluded paths
            if any(exclude in str(file_path) for exclude in exclude_patterns):
                continue
            
            files_processed += 1
            
            if fix_typescript_file(file_path):
                files_modified += 1
                print(f"Fixed: {file_path.relative_to(web_dir)}")
            
            # Progress indicator
            if files_processed % 100 == 0:
                print(f"Processed {files_processed} files, modified {files_modified}")
    
    print(f"\nCompleted: Processed {files_processed} files, modified {files_modified}")
    print("Run type-check again to verify remaining errors")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())