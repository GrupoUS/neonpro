#!/usr/bin/env python3
"""
Basic syntax fixer without complex regex
"""
import os

def fix_basic_syntax_issues(file_path):
    """Fix basic syntax issues by reading and writing line by line"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        
        for line in lines:
            original_line = line
            
            # Fix common trailing comma issues
            if line.strip().endswith(',}'):
                line = line.replace(',}', '}')
                modified = True
            if line.strip().endswith(',]'):
                line = line.replace(',]', ']')
                modified = True
            if line.strip().endswith(',)'):
                line = line.replace(',)', ')')
                modified = True
                
            # Fix missing semicolons for simple cases
            stripped = line.strip()
            if (stripped and 
                not stripped.endswith((';', '{', '}', '(', ')', '[', ']', ',', ':', '\\')) and
                not stripped.startswith(('if', 'else', 'for', 'while', 'function', 'const', 'let', 'var', 'import', 'export', 'return', 'case', 'default', '//', '/*', '*')) and
                '=' in stripped and
                not stripped.endswith('=> {') and
                not stripped.endswith('=>') and
                len(stripped) > 10):
                line = line.rstrip() + ';\n'
                modified = True
            
            new_lines.append(line)
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
    
    return False

def main():
    base_dir = "E:/neonpro/apps/web"
    
    # File extensions to process
    extensions = ('.ts', '.tsx', '.js', '.jsx')
    
    processed = 0
    modified = 0
    
    print("Starting basic syntax fixes...")
    
    for root, dirs, files in os.walk(base_dir):
        # Skip node_modules and .next directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist', 'build']]
        
        for file in files:
            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                processed += 1
                
                if fix_basic_syntax_issues(file_path):
                    modified += 1
                
                if processed % 100 == 0:
                    print(f"Processed {processed} files, modified {modified}")
    
    print(f"Completed: Processed {processed} files, modified {modified}")
    print("Run type-check to verify fixes.")

if __name__ == "__main__":
    main()