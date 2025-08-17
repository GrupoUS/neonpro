import os
import re
from pathlib import Path

def fix_typescript_errors_v2():
    """Fix TypeScript errors with more careful replacements"""
    
    domain_src = Path("E:/neonpro/packages/domain/src")
    
    # Files to process
    for root, dirs, files in os.walk(domain_src):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Fix broken imports from previous script
                    if "from '@/lib/" in content and "// PLACEHOLDER:" in content:
                        # Fix broken imports by commenting them out properly
                        content = re.sub(
                            r'// PLACEHOLDER:\s*from \'@/lib/[^\']*\'.*?;', 
                            '// Missing module - placeholder needed',
                            content
                        )
                        content = re.sub(
                            r'// PLACEHOLDER:\s*from \'@/types/[^\']*\'.*?;',
                            '// Missing types - placeholder needed', 
                            content
                        )
                        content = re.sub(
                            r'// PLACEHOLDER:\s*from \'@/contexts/[^\']*\'.*?;',
                            '// Missing context - placeholder needed',
                            content
                        )
                        content = re.sub(
                            r'// PLACEHOLDER:\s*from \'@/app/[^\']*\'.*?;',
                            '// Missing app module - placeholder needed',
                            content
                        )
                    
                    # Fix broken from statements
                    content = re.sub(r"from '@/app/utils/supabase/client'.*?;[^']*const createClient[^;]*;", 
                                   "from '@supabase/supabase-js';", content)
                    
                    # Fix any remaining broken syntax from placeholders
                    lines = content.split('\n')
                    fixed_lines = []
                    
                    for line in lines:
                        # Skip broken import lines with syntax errors
                        if ('from \'' in line and 
                            ('// PLACEHOLDER:' in line or 
                             line.count('\'') % 2 != 0 or
                             'from \'@/' in line and not line.strip().endswith(';'))):
                            fixed_lines.append('// ' + line.strip() + ' // PLACEHOLDER - NEEDS FIXING')
                        else:
                            fixed_lines.append(line)
                    
                    content = '\n'.join(fixed_lines)
                    
                    # Only write if changes were made
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed imports: {file_path}")
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_typescript_errors_v2()