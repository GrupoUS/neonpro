#!/usr/bin/env python3
"""
T011d: Catalogar tipos exportados dos packages
Part of Phase 3.3: Core Analysis Implementation
"""

import json
import os
import subprocess
import re
from datetime import datetime
from pathlib import Path

def analyze_exported_types():
    """Catalog exported types from all packages"""
    
    analysis_data = {
        'analysis_date': datetime.now().isoformat(),
        'task': 'T011d - Catalog exported types from packages',
        'method': 'TypeScript declaration analysis + export scanning',
        'packages_analyzed': [],
        'exported_types_catalog': {},
        'type_export_patterns': {},
        'package_entry_points': {},
        'summary': {
            'total_packages': 0,
            'packages_with_types': 0,
            'total_exported_types': 0,
            'packages_without_exports': []
        }
    }

    base_dir = '/home/vibecode/neonpro'
    packages_dir = os.path.join(base_dir, 'packages')
    
    if not os.path.exists(packages_dir):
        print(f"Packages directory not found: {packages_dir}")
        return

    # Analisar cada package
    for package_name in os.listdir(packages_dir):
        package_path = os.path.join(packages_dir, package_name)
        
        if not os.path.isdir(package_path):
            continue
            
        print(f"Analisando package: {package_name}")
        
        package_analysis = {
            'package_name': f'@neonpro/{package_name}',
            'path': package_path,
            'entry_points': [],
            'exported_types': [],
            'exported_interfaces': [],
            'exported_enums': [],
            'exported_functions': [],
            'exported_classes': [],
            'type_only_exports': [],
            'has_index_file': False,
            'package_json_exports': None
        }
        
        # Verificar package.json para exports
        package_json_path = os.path.join(package_path, 'package.json')
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    package_json = json.load(f)
                    package_analysis['package_json_exports'] = {
                        'main': package_json.get('main'),
                        'types': package_json.get('types'),
                        'exports': package_json.get('exports')
                    }
            except Exception as e:
                package_analysis['package_json_error'] = str(e)
        
        # Procurar por arquivos index.ts/index.js
        for index_file in ['index.ts', 'index.js', 'src/index.ts', 'src/index.js']:
            index_path = os.path.join(package_path, index_file)
            if os.path.exists(index_path):
                package_analysis['has_index_file'] = True
                package_analysis['entry_points'].append(index_file)
                
                # Analisar exports no arquivo index
                try:
                    with open(index_path, 'r') as f:
                        content = f.read()
                        
                    # Encontrar exports
                    export_patterns = [
                        r'export\s+(?:type\s+)?interface\s+(\w+)',  # interfaces
                        r'export\s+(?:type\s+)?enum\s+(\w+)',      # enums
                        r'export\s+(?:type\s+)?class\s+(\w+)',     # classes
                        r'export\s+(?:type\s+)?function\s+(\w+)',  # functions
                        r'export\s+(?:type\s+)?const\s+(\w+)',     # const exports
                        r'export\s+type\s+(\w+)',                  # type aliases
                        r'export\s+\{([^}]+)\}',                   # named exports
                        r'export\s+\*\s+from\s+["\']([^"\']+)["\']', # re-exports
                    ]
                    
                    for pattern in export_patterns:
                        matches = re.findall(pattern, content, re.MULTILINE)
                        for match in matches:
                            if 'interface' in pattern:
                                package_analysis['exported_interfaces'].extend(
                                    [m.strip() for m in match.split(',') if m.strip()]
                                )
                            elif 'enum' in pattern:
                                package_analysis['exported_enums'].extend(
                                    [m.strip() for m in match.split(',') if m.strip()]
                                )
                            elif 'class' in pattern:
                                package_analysis['exported_classes'].extend(
                                    [m.strip() for m in match.split(',') if m.strip()]
                                )
                            elif 'function' in pattern or 'const' in pattern:
                                package_analysis['exported_functions'].extend(
                                    [m.strip() for m in match.split(',') if m.strip()]
                                )
                            elif 'type' in pattern and 'interface' not in pattern:
                                package_analysis['type_only_exports'].extend(
                                    [m.strip() for m in match.split(',') if m.strip()]
                                )
                            elif '{' in pattern:  # named exports
                                exports = [e.strip() for e in match.split(',') if e.strip()]
                                package_analysis['exported_functions'].extend(exports)
                
                except Exception as e:
                    package_analysis['index_analysis_error'] = str(e)
        
        # Procurar por arquivos .d.ts (declaration files)
        dts_files = []
        for root, dirs, files in os.walk(package_path):
            for file in files:
                if file.endswith('.d.ts'):
                    dts_files.append(os.path.relpath(os.path.join(root, file), package_path))
        
        package_analysis['declaration_files'] = dts_files
        
        # Consolidar todos os tipos exportados
        all_exported = (
            package_analysis['exported_interfaces'] +
            package_analysis['exported_enums'] + 
            package_analysis['exported_classes'] +
            package_analysis['exported_functions'] +
            package_analysis['type_only_exports']
        )
        package_analysis['exported_types'] = list(set(all_exported))  # remove duplicates
        
        analysis_data['packages_analyzed'].append(package_name)
        analysis_data['exported_types_catalog'][package_name] = package_analysis

    # Calcular summary
    analysis_data['summary']['total_packages'] = len(analysis_data['packages_analyzed'])
    analysis_data['summary']['packages_with_types'] = sum(
        1 for pkg in analysis_data['exported_types_catalog'].values() 
        if pkg['exported_types']
    )
    analysis_data['summary']['total_exported_types'] = sum(
        len(pkg['exported_types']) for pkg in analysis_data['exported_types_catalog'].values()
    )
    analysis_data['summary']['packages_without_exports'] = [
        pkg_name for pkg_name, pkg_data in analysis_data['exported_types_catalog'].items()
        if not pkg_data['exported_types']
    ]

    # Salvar análise
    output_path = '/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/exported-types-catalog.json'
    with open(output_path, 'w') as f:
        json.dump(analysis_data, f, indent=2)

    print(f'\n=== ANÁLISE T011d COMPLETA ===')
    print(f'Packages analisados: {analysis_data["summary"]["total_packages"]}')
    print(f'Packages com tipos: {analysis_data["summary"]["packages_with_types"]}')
    print(f'Total de tipos exportados: {analysis_data["summary"]["total_exported_types"]}')
    print(f'Packages sem exports: {len(analysis_data["summary"]["packages_without_exports"])}')
    if analysis_data["summary"]["packages_without_exports"]:
        print(f'  - {", ".join(analysis_data["summary"]["packages_without_exports"])}')
    print(f'Resultado salvo em: {output_path}')

if __name__ == '__main__':
    analyze_exported_types()