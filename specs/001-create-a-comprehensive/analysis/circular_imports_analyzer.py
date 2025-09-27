#!/usr/bin/env python3
"""
T011e: Validar imports circulares
Part of Phase 3.3: Core Analysis Implementation
"""

import json
import os
import re
from datetime import datetime
from collections import defaultdict, deque

def analyze_circular_imports():
    """Detect circular dependencies between packages"""
    
    analysis_data = {
        'analysis_date': datetime.now().isoformat(),
        'task': 'T011e - Circular import validation',
        'method': 'Dependency graph analysis with cycle detection',
        'packages_analyzed': [],
        'dependency_graph': {},
        'circular_dependencies': [],
        'dependency_chains': {},
        'risk_assessment': {},
        'summary': {
            'total_packages': 0,
            'circular_dependencies_found': 0,
            'risk_level': 'UNKNOWN',
            'affected_packages': []
        }
    }

    base_dir = '/home/vibecode/neonpro'
    packages_dir = os.path.join(base_dir, 'packages')
    
    if not os.path.exists(packages_dir):
        print(f"Packages directory not found: {packages_dir}")
        return

    # Primeiro, construir grafo de dependências
    dependency_graph = defaultdict(set)
    packages_info = {}
    
    print("=== FASE 1: Mapeando dependências dos packages ===")
    
    for package_name in os.listdir(packages_dir):
        package_path = os.path.join(packages_dir, package_name)
        
        if not os.path.isdir(package_path):
            continue
            
        print(f"Analisando dependências: @neonpro/{package_name}")
        
        packages_info[package_name] = {
            'path': package_path,
            'internal_dependencies': [],
            'external_dependencies': [],
            'import_statements': []
        }
        
        # Analisar package.json para dependências
        package_json_path = os.path.join(package_path, 'package.json')
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    package_json = json.load(f)
                    
                dependencies = package_json.get('dependencies', {})
                dev_dependencies = package_json.get('devDependencies', {})
                
                # Procurar dependências internas (@neonpro/*)
                for dep in {**dependencies, **dev_dependencies}:
                    if dep.startswith('@neonpro/'):
                        dep_name = dep.replace('@neonpro/', '')
                        if dep_name != package_name:  # Evitar auto-referência
                            dependency_graph[package_name].add(dep_name)
                            packages_info[package_name]['internal_dependencies'].append(dep_name)
                        
            except Exception as e:
                packages_info[package_name]['error'] = f"Erro ao ler package.json: {str(e)}"
        
        # Analisar imports nos arquivos fonte
        for root, dirs, files in os.walk(package_path):
            # Pular node_modules e dist
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
            
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                        # Procurar imports @neonpro
                        import_patterns = [
                            r'import\s+.*?from\s+["\'](@neonpro/[^"\']+)["\']',
                            r'import\s*\(\s*["\'](@neonpro/[^"\']+)["\']\s*\)',
                            r'require\s*\(\s*["\'](@neonpro/[^"\']+)["\']\s*\)'
                        ]
                        
                        for pattern in import_patterns:
                            matches = re.findall(pattern, content)
                            for match in matches:
                                dep_name = match.replace('@neonpro/', '')
                                if dep_name != package_name:
                                    dependency_graph[package_name].add(dep_name)
                                    packages_info[package_name]['import_statements'].append({
                                        'file': os.path.relpath(file_path, package_path),
                                        'import': match
                                    })
                                    
                    except Exception as e:
                        # Log error but continue
                        pass
        
        analysis_data['packages_analyzed'].append(package_name)

    print(f"\n=== FASE 2: Detectando ciclos ===")
    
    # Converter para estrutura JSON serializable
    analysis_data['dependency_graph'] = {
        pkg: list(deps) for pkg, deps in dependency_graph.items()
    }
    
    # Detectar ciclos usando DFS
    def find_cycles(graph):
        """Encontrar todos os ciclos no grafo de dependências"""
        cycles = []
        visited = set()
        rec_stack = set()
        path = []
        
        def dfs(node):
            if node in rec_stack:
                # Encontrou um ciclo
                cycle_start = path.index(node)
                cycle = path[cycle_start:] + [node]
                cycles.append(cycle)
                return
                
            if node in visited:
                return
                
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in graph.get(node, []):
                dfs(neighbor)
                
            rec_stack.remove(node)
            path.pop()
        
        for node in graph:
            if node not in visited:
                dfs(node)
                
        return cycles
    
    cycles = find_cycles(dependency_graph)
    
    print(f"Ciclos encontrados: {len(cycles)}")
    
    # Processar ciclos encontrados
    for i, cycle in enumerate(cycles):
        cycle_info = {
            'cycle_id': f"cycle_{i+1}",
            'packages_involved': cycle,
            'cycle_length': len(cycle) - 1,  # -1 porque o último é repetição do primeiro
            'dependency_chain': ' → '.join(cycle),
            'risk_level': 'HIGH' if len(cycle) > 3 else 'MEDIUM',
            'impact': 'Circular dependency can cause build issues and runtime errors'
        }
        
        analysis_data['circular_dependencies'].append(cycle_info)
        print(f"  Ciclo {i+1}: {cycle_info['dependency_chain']}")

    # Risk assessment
    if len(cycles) == 0:
        analysis_data['risk_assessment'] = {
            'overall_risk': 'LOW',
            'status': 'NO_CIRCULAR_DEPENDENCIES',
            'recommendation': 'Dependency structure is clean'
        }
    elif len(cycles) <= 2:
        analysis_data['risk_assessment'] = {
            'overall_risk': 'MEDIUM',
            'status': 'LIMITED_CIRCULAR_DEPENDENCIES',
            'recommendation': 'Review and refactor identified cycles'
        }
    else:
        analysis_data['risk_assessment'] = {
            'overall_risk': 'HIGH',
            'status': 'MULTIPLE_CIRCULAR_DEPENDENCIES',
            'recommendation': 'Urgent refactoring required to break dependency cycles'
        }
    
    # Summary
    analysis_data['summary']['total_packages'] = len(analysis_data['packages_analyzed'])
    analysis_data['summary']['circular_dependencies_found'] = len(cycles)
    analysis_data['summary']['risk_level'] = analysis_data['risk_assessment']['overall_risk']
    
    affected_packages = set()
    for cycle in cycles:
        affected_packages.update(cycle[:-1])  # -1 para remover duplicata
    analysis_data['summary']['affected_packages'] = list(affected_packages)
    
    # Adicionar informações dos packages analisados
    analysis_data['packages_info'] = packages_info

    # Salvar análise
    output_path = '/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/circular-imports-validation.json'
    with open(output_path, 'w') as f:
        json.dump(analysis_data, f, indent=2)

    print(f'\n=== ANÁLISE T011e COMPLETA ===')
    print(f'Packages analisados: {analysis_data["summary"]["total_packages"]}')
    print(f'Dependências circulares encontradas: {analysis_data["summary"]["circular_dependencies_found"]}')
    print(f'Nível de risco: {analysis_data["summary"]["risk_level"]}')
    if analysis_data["summary"]["affected_packages"]:
        print(f'Packages afetados: {", ".join(analysis_data["summary"]["affected_packages"])}')
    print(f'Resultado salvo em: {output_path}')

if __name__ == '__main__':
    analyze_circular_imports()