#!/usr/bin/env python3
"""
Final comprehensive syntax error fix script for TypeScript files
Targets the most common remaining syntax patterns
"""

import os
import re
import glob
from pathlib import Path

def fix_jsx_syntax_errors(content):
    """Fix JSX syntax errors - malformed tags and expressions"""
    
    # Fix self-closing tags with extra spaces and malformed syntax
    content = re.sub(r'(\s+/\s+/>)', ' />', content)
    content = re.sub(r'(<[^>]+)\s+/\s*>', r'\1 />', content)
    
    # Fix JSX expressions with missing closing brackets
    content = re.sub(r'className="([^"]*)"([^>]*)/>', r'className="\1"\2 />', content)
    
    # Fix malformed JSX closing tags
    content = re.sub(r'</([a-zA-Z][a-zA-Z0-9]*)\s+/>', r'</\1>', content)
    
    # Fix JSX expressions with malformed syntax
    content = re.sub(r'{\s*([^}]+)\s*}\s*(?=\s*[<>/])', r'{\1}', content)
    
    # Fix broken function components - ensure proper return structure
    content = re.sub(r'(\w+):\s*React\.FC<([^>]*)>\s*/?\s*=\s*\(\{', r'\1: React.FC<\2> = ({', content)
    
    return content

def fix_function_signatures(content):
    """Fix malformed function signatures and method definitions"""
    
    # Fix async function signatures
    content = re.sub(r'async\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]*>\s*\{', 
                    lambda m: f"async {m.group(1)}({m.group(0).split('(')[1].split(')')[0]}): {m.group(0).split(': ')[1].split(' {')[0]} {{", content)
    
    # Fix object method signatures  
    content = re.sub(r'(\w+):\s*\([^)]*\)\s*=>\s*\{', r'\1: (\2) => {', content)
    
    # Fix arrow function expressions
    content = re.sub(r'}\s*:\s*any\)\s*=>\s*\{', r'}: any) => {', content)
    
    # Fix interface/type property signatures
    content = re.sub(r'(\w+)\?\?\s*:\s*([^;]+);', r'\1?: \2;', content)
    content = re.sub(r'(\w+)\?\s*:\s*\(\)\s*=>\s*void;', r'\1?: () => void;', content)
    
    return content

def fix_type_definitions(content):
    """Fix enum and type definition syntax errors"""
    
    # Fix enum definitions with malformed syntax
    content = re.sub(r'export\s+const\s+(\w+)\s*=\s*\{([^}]+)\}\s*as\s*const;', 
                    lambda m: f"export const {m.group(1)} = {{{m.group(2).replace(':', ': ')}}} as const;", content)
    
    # Fix object literal property syntax in enums/constants
    content = re.sub(r'(\w+):\s*"([^"]*)",?', r'\1: "\2",', content)
    content = re.sub(r'(\w+):\s*([^,}\s]+),?', r'\1: \2,', content)
    
    # Fix union type syntax
    content = re.sub(r'\|\s*\'([^\']+)\'(?=\s*\||\s*;|\s*\})', r"| '\1'", content)
    
    # Fix interface property syntax
    content = re.sub(r'(\w+)\?\?\s*:\s*([^;,}]+)[;,]?', r'\1?: \2;', content)
    
    return content

def fix_import_export_syntax(content):
    """Fix import/export statement syntax errors"""
    
    # Fix malformed import statements
    content = re.sub(r'import\s*{\s*([^}]*)\s*}\s*from\s*[\'"]([^\'"]*)[\'"];?', 
                    r"import { \1 } from '\2';", content)
    
    # Fix export statements
    content = re.sub(r'export\s*{\s*([^}]*)\s*};?', r'export { \1 };', content)
    
    # Fix default exports
    content = re.sub(r'export\s+default\s+([^;]+);?', r'export default \1;', content)
    
    return content

def fix_object_syntax(content):
    """Fix object literal and property syntax"""
    
    # Fix object property syntax
    content = re.sub(r'(\w+):\s*\{([^}]*)\}[,;]?', 
                    lambda m: f"{m.group(1)}: {{{m.group(2).strip()}}},", content)
    
    # Fix config object syntax in tailwind.config.ts and similar files
    content = re.sub(r'const\s+(\w+):\s*(\w+)\s*=\s*\{;', r'const \1: \2 = {', content)
    
    # Fix trailing commas and semicolons
    content = re.sub(r',\s*;', ',', content)
    content = re.sub(r';\s*,', ',', content)
    
    return content

def fix_conditional_syntax(content):
    """Fix conditional expressions and ternary operators"""
    
    # Fix malformed conditional expressions
    content = re.sub(r'(\w+)\s*\?\?\s*([^:]+):\s*([^;,}]+)', r'\1 ? \2 : \3', content)
    
    # Fix logical operators
    content = re.sub(r'(\w+)\?\?\s*\.(\w+)', r'\1?.\2', content)
    
    return content

def fix_regex_and_special_chars(content):
    """Fix regex patterns and special character issues"""
    
    # Fix malformed regex patterns
    content = re.sub(r'=\s*/>', r'= >', content)
    
    # Fix special character encoding issues
    content = content.replace('\ufeff', '')  # Remove BOM
    
    return content

def fix_file_content(file_path):
    """Apply all fixes to file content"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Apply all fixes in sequence
        content = fix_jsx_syntax_errors(content)
        content = fix_function_signatures(content)
        content = fix_type_definitions(content)
        content = fix_import_export_syntax(content)
        content = fix_object_syntax(content)
        content = fix_conditional_syntax(content)
        content = fix_regex_and_special_chars(content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
        
    return False

def main():
    """Main execution function"""
    print("Starting final comprehensive syntax error fixes...")
    
    # Target directories with TypeScript/React files
    base_dir = Path("E:/neonpro/apps/web")
    patterns = [
        "**/*.ts",
        "**/*.tsx", 
        "**/*.js",
        "**/*.jsx"
    ]
    
    all_files = []
    for pattern in patterns:
        all_files.extend(base_dir.glob(pattern))
    
    # Filter out node_modules, .next, and other build directories
    files_to_process = [
        f for f in all_files 
        if not any(exclude in str(f) for exclude in [
            'node_modules', '.next', 'dist', 'build', '.git'
        ])
    ]
    
    print(f"Processing {len(files_to_process)} files...")
    
    modified_count = 0
    processed_count = 0
    
    for file_path in files_to_process:
        processed_count += 1
        
        if processed_count % 50 == 0:
            print(f"Processed {processed_count}/{len(files_to_process)} files, modified {modified_count}")
            
        if fix_file_content(file_path):
            modified_count += 1
            print(f"Fixed: {file_path}")
    
    print(f"\nCompleted: Processed {processed_count} files, modified {modified_count}")
    print("Final syntax error fixes complete. Run type-check to verify.")

if __name__ == "__main__":
    main()