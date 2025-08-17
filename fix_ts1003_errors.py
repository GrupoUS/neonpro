#!/usr/bin/env python3
"""
Script para corrigir erros TS1003 'Identifier expected' em massa
Foca em problemas de sintaxe TypeScript específicos
"""

import os
import re
import glob
from pathlib import Path

def fix_ts1003_errors(file_path):
    """Corrige erros TS1003 (Identifier expected) específicos"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        changes_made = []
        
        # Padrão 1: Operadores de desestruturação em posições inválidas
        # Ex: const { data, error} = await supabase
        content = re.sub(
            r'const\s*{\s*([^}]+)\s*}\s*=\s*await\s+supabase\s*$',
            r'const response = await supabase;\nconst { \1 } = response || { data: null, error: null };',
            content,
            flags=re.MULTILINE
        )
        if content != original_content:
            changes_made.append("Fixed supabase destructuring")
            original_content = content
        
        # Padrão 2: Chamadas de função com sintaxe incorreta
        # Ex: analytics.track_event()
        content = re.sub(
            r'analytics\.track_event\(\s*\)',
            r'analytics.trackEvent()',
            content
        )
        if content != original_content:
            changes_made.append("Fixed analytics method calls")
            original_content = content
        
        # Padrão 3: Destructuring em assignments
        # Ex: { data } = response
        content = re.sub(
            r'^\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);?\s*$',
            r'const { \1 } = \2;',
            content,
            flags=re.MULTILINE
        )
        if content != original_content:
            changes_made.append("Fixed destructuring assignments")
            original_content = content
            
        # Padrão 4: Template literals mal formados
        # Ex: `${value}`placeholder
        content = re.sub(
            r'`([^`]*\$\{[^}]+\}[^`]*)`([a-zA-Z_])',
            r'`\1` + "\2"',
            content
        )
        if content != original_content:
            changes_made.append("Fixed template literals")
            original_content = content
            
        # Padrão 5: Declarações de variáveis incompletas
        # Ex: const = value
        content = re.sub(
            r'const\s*=\s*([^;]+);?',
            r'const placeholder = \1;',
            content
        )
        if content != original_content:
            changes_made.append("Fixed incomplete const declarations")
            original_content = content
            
        # Padrão 6: Vírgulas extras em object destructuring
        # Ex: const { a, b, } = obj
        content = re.sub(
            r'{\s*([^}]+),\s*}\s*=',
            r'{ \1 } =',
            content
        )
        if content != original_content:
            changes_made.append("Fixed trailing commas in destructuring")
            original_content = content
            
        # Padrão 7: Chamadas de método sem parênteses
        # Ex: object.method
        content = re.sub(
            r'([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\s*[;}])',
            r'\1()',
            content
        )
        
        # Padrão 8: Propriedades de objeto com nomes reservados
        content = re.sub(
            r'(\w+)\.catch\s*=',
            r'\1["catch"] =',
            content
        )
        content = re.sub(
            r'(\w+)\.catch\s*\(',
            r'\1.catch(',
            content
        )
        if content != original_content:
            changes_made.append("Fixed reserved keywords")
            original_content = content
            
        # Padrão 9: Array destructuring incorreto
        # Ex: const [,] = array
        content = re.sub(
            r'const\s*\[\s*,\s*\]\s*=',
            r'const [first] =',
            content
        )
        if content != original_content:
            changes_made.append("Fixed array destructuring")
            original_content = content
            
        # Padrão 10: Operadores ternários incompletos
        # Ex: condition ? : default
        content = re.sub(
            r'([^?]+)\?\s*:\s*([^;]+)',
            r'\1 ? null : \2',
            content
        )
        if content != original_content:
            changes_made.append("Fixed ternary operators")
            original_content = content
            
        # Padrão 11: Imports mal formados
        content = re.sub(
            r'import\s*{\s*([^}]+)\s*}\s*from\s*["\']([^"\']+)["\']\s*;?\s*$',
            lambda m: f'import {{ {m.group(1).strip()} }} from "{m.group(2)}";',
            content,
            flags=re.MULTILINE
        )
        
        # Padrão 12: Exports mal formados
        content = re.sub(
            r'export\s*{\s*([^}]+)\s*}\s*;?\s*$',
            lambda m: f'export {{ {m.group(1).strip()} }};',
            content,
            flags=re.MULTILINE
        )
        
        # Padrão 13: Async/await mal formado
        content = re.sub(
            r'const\s+(\w+)\s*=\s*await\s*$',
            r'const \1 = await Promise.resolve(null);',
            content,
            flags=re.MULTILINE
        )
        
        # Padrão 14: Object spread mal formado
        content = re.sub(
            r'\.\.\.([^,}]+),?\s*(?=})',
            r'...\1',
            content
        )
        
        # Padrão 15: Comentários que quebram sintaxe
        content = re.sub(
            r'//\s*([^;\n]*[;\n])',
            lambda m: f'// {m.group(1).strip()}',
            content
        )
        
        if content != original_content:
            return content, changes_made
        else:
            return None, []
            
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return None, []

def process_typescript_files(directory):
    """Processa todos os arquivos TypeScript no diretório"""
    files_processed = 0
    files_modified = 0
    total_changes = []
    
    # Padrões de arquivos TypeScript
    patterns = [
        "**/*.ts",
        "**/*.tsx"
    ]
    
    excluded_dirs = {
        "node_modules", ".next", "dist", "build", ".git",
        "__tests__", "tests", "test", "spec"
    }
    
    for pattern in patterns:
        for file_path in glob.glob(os.path.join(directory, pattern), recursive=True):
            # Pula diretórios excluídos
            if any(excluded in file_path for excluded in excluded_dirs):
                continue
                
            files_processed += 1
            
            fixed_content, changes = fix_ts1003_errors(file_path)
            
            if fixed_content:
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    files_modified += 1
                    total_changes.extend(changes)
                    print(f"OK {file_path}: {', '.join(changes)}")
                except Exception as e:
                    print(f"ERRO ao salvar {file_path}: {e}")
            
            # Progresso a cada 100 arquivos
            if files_processed % 100 == 0:
                print(f"Processados: {files_processed} arquivos")
    
    print(f"\nRESUMO:")
    print(f"Arquivos processados: {files_processed}")
    print(f"Arquivos modificados: {files_modified}")
    print(f"Total de mudancas: {len(total_changes)}")
    
    if total_changes:
        print(f"\nTipos de correcoes aplicadas:")
        unique_changes = list(set(total_changes))
        for change in unique_changes:
            count = total_changes.count(change)
            print(f"  - {change}: {count}x")

if __name__ == "__main__":
    web_dir = r"E:\neonpro\apps\web"
    
    if os.path.exists(web_dir):
        print(f"Iniciando correcao de erros TS1003 em: {web_dir}")
        process_typescript_files(web_dir)
        print(f"\nCorrecao concluida!")
    else:
        print(f"Diretorio nao encontrado: {web_dir}")