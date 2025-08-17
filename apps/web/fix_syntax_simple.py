#!/usr/bin/env python3
"""
Simple syntax error fix script for TypeScript/JSX files.
Focused on the most common syntax errors without complex regex.
"""

import os
import re
import traceback

def process_file(filepath):
    """Process a single file to fix syntax errors"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        original_content = content
        
        # Simple fixes for common issues
        
        # Fix import statements
        content = re.sub(r'import\s+\{\s*\}\s+from', 'import {} from', content)
        content = re.sub(r'import\s+{([^}]*),\s*}\s+from', r'import {\1} from', content)
        
        # Fix export statements  
        content = re.sub(r'export\s+\{\s*\}\s*;?', 'export {};', content)
        content = re.sub(r'export\s+{([^}]*),\s*}\s*;?', r'export {\1};', content)
        
        # Fix function declarations
        content = re.sub(r'function\s+(\w+)\s*\(\s*\)\s*:\s*void\s*\{', r'function \1(): void {', content)
        content = re.sub(r'const\s+(\w+)\s*=\s*\(\s*\)\s*:\s*\w+\s*=>', r'const \1 = (): \2 =>', content)
        
        # Fix interface declarations
        content = re.sub(r'interface\s+(\w+)\s*\{', r'interface \1 {', content)
        content = re.sub(r'(\w+)\?\?\s*:', r'\1?:', content)
        
        # Fix enum declarations
        content = re.sub(r'enum\s+(\w+)\s*\{', r'enum \1 {', content)
        
        # Fix type declarations
        content = re.sub(r'type\s+(\w+)\s*=', r'type \1 =', content)
        
        # Fix object property syntax
        content = re.sub(r'(\w+):\s+([^,;}\n]+),?', r'\1: \2,', content)
        
        # Fix JSX syntax
        content = re.sub(r'<(\w+)\s+([^>]+)\s*/>', r'<\1 \2 />', content)
        content = re.sub(r'<(\w+)\s*>\s*</\1>', r'<\1></\1>', content)
        
        # Fix arrow functions
        content = re.sub(r'=>\s*\{', r'=> {', content)
        content = re.sub(r'\)\s*:\s*(\w+)\s*=>', r'): \1 =>', content)
        
        # Fix semicolons
        content = re.sub(r';\s*;+', ';', content)
        content = re.sub(r'}\s*;?\s*export', r'}\nexport', content)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all TypeScript/JSX files"""
    web_dir = r"E:\neonpro\apps\web"
    
    extensions = ['.ts', '.tsx', '.js', '.jsx']
    files_processed = 0
    files_modified = 0
    
    print("Starting simple syntax error fixes...")
    
    for root, dirs, files in os.walk(web_dir):
        # Skip node_modules and build directories
        if 'node_modules' in root or '.next' in root or 'dist' in root:
            continue
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                files_processed += 1
                
                if process_file(filepath):
                    files_modified += 1
                
                if files_processed % 100 == 0:
                    print(f"Processed {files_processed} files, modified {files_modified}")
    
    print(f"Completed: Processed {files_processed} files, modified {files_modified}")
    print("Run type-check to verify fixes.")

if __name__ == "__main__":
    main()