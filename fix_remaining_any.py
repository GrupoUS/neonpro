#!/usr/bin/env python3
"""
Quick fix script to fix remaining 'any' types in report-builder and other files
"""
import os
import re
import glob

def fix_remaining_any_types():
    """Fix remaining any types that are preventing commit"""
    
    # Specific files that need fixing
    files_to_fix = [
        "E:/neonpro/apps/web/app/lib/services/report-builder.ts",
        "E:/neonpro/apps/web/app/lib/validations/report-builder.ts", 
        "E:/neonpro/apps/web/app/types/report-builder.ts",
        "E:/neonpro/tools/testing/validate-migration.js"
    ]
    
    for file_path in files_to_fix:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace any types with unknown
            content = re.sub(r'\bdata\?\: any\b', 'data?: unknown', content)
            content = re.sub(r'\bvalue: any\b', 'value: unknown', content)
            content = re.sub(r'\bdefault_value: any\b', 'default_value: unknown', content)
            content = re.sub(r'\bdefault_value\?: any\b', 'default_value?: unknown', content)
            content = re.sub(r'\bconstraint: any\b', 'constraint: unknown', content)
            content = re.sub(r'\bdata: any\b', 'data: unknown', content)
            content = re.sub(r'\[key: string\]: any', '[key: string]: unknown', content)
            content = re.sub(r'Record<string, any>', 'Record<string, unknown>', content)
            content = re.sub(r'session_data: Record<string, any>', 'session_data: Record<string, unknown>', content)
            
            # Fix empty block statements
            content = re.sub(r'(_msg) => \{\}', '(_msg) => { /* intentionally empty */ }', content)
            
            # Write back if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_remaining_any_types()