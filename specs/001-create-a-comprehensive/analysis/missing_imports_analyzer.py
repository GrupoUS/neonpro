#!/usr/bin/env python3
"""
T011c: Missing imports analysis using TypeScript compiler diagnostics
Part of Phase 3.3: Core Analysis Implementation
"""

import json
import subprocess
import os
from datetime import datetime

def analyze_missing_imports():
    """Analyze missing imports using TypeScript compiler diagnostics"""
    
    analysis_data = {
        'analysis_date': datetime.now().isoformat(),
        'task': 'T011c - Missing imports identification',
        'method': 'TypeScript compiler diagnostics',
        'apps_analyzed': [],
        'missing_imports_found': [],
        'compilation_status': {},
        'typescript_errors': [],
        'summary': {
            'total_apps_checked': 0,
            'apps_with_errors': 0,
            'missing_import_errors': 0,
            'overall_status': 'UNKNOWN'
        }
    }

    # Testar cada app individualmente
    apps = ['apps/web', 'apps/api']
    base_dir = '/home/vibecode/neonpro'
    os.chdir(base_dir)

    for app in apps:
        if os.path.exists(app):
            print(f'Analisando {app}...')
            try:
                # Executar TypeScript check
                result = subprocess.run(['pnpm', 'tsc', '--noEmit', '--project', f'{app}/tsconfig.json'], 
                                      capture_output=True, text=True, cwd=base_dir, timeout=30)
                
                analysis_data['apps_analyzed'].append(app)
                analysis_data['compilation_status'][app] = {
                    'exit_code': result.returncode,
                    'stderr': result.stderr[:2000] if result.stderr else '',
                    'stdout': result.stdout[:2000] if result.stdout else '',
                    'status': 'PASS' if result.returncode == 0 else 'FAIL'
                }
                
                # Procurar por erros de missing imports
                if result.stderr:
                    lines = result.stderr.split('\n')
                    for line in lines:
                        line_lower = line.lower()
                        if any(keyword in line_lower for keyword in [
                            'cannot find module', 
                            'module not found', 
                            "cannot resolve module", 
                            "module '.*' has no exported member"
                        ]):
                            analysis_data['missing_imports_found'].append({
                                'app': app,
                                'error': line.strip(),
                                'type': 'missing_module'
                            })
                        
                        # Capturar outros erros TypeScript relevantes
                        if 'error ts' in line_lower:
                            analysis_data['typescript_errors'].append({
                                'app': app,
                                'error': line.strip()
                            })
                
            except subprocess.TimeoutExpired:
                analysis_data['compilation_status'][app] = {
                    'exit_code': -1,
                    'error': 'Timeout during TypeScript compilation',
                    'status': 'TIMEOUT'
                }
            except Exception as e:
                analysis_data['compilation_status'][app] = {
                    'exit_code': -1,
                    'error': str(e),
                    'status': 'ERROR'
                }

    # Calcular summary
    analysis_data['summary']['total_apps_checked'] = len(analysis_data['apps_analyzed'])
    analysis_data['summary']['apps_with_errors'] = sum(1 for app in analysis_data['compilation_status'] 
                                                     if analysis_data['compilation_status'][app]['exit_code'] != 0)
    analysis_data['summary']['missing_import_errors'] = len(analysis_data['missing_imports_found'])
    
    # Determinar status geral
    if analysis_data['summary']['missing_import_errors'] == 0 and analysis_data['summary']['apps_with_errors'] == 0:
        analysis_data['summary']['overall_status'] = 'CLEAN'
    elif analysis_data['summary']['missing_import_errors'] > 0:
        analysis_data['summary']['overall_status'] = 'MISSING_IMPORTS_DETECTED'
    else:
        analysis_data['summary']['overall_status'] = 'COMPILATION_ERRORS'

    # Salvar análise
    output_path = '/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/missing-imports.json'
    with open(output_path, 'w') as f:
        json.dump(analysis_data, f, indent=2)

    print(f'\n=== ANÁLISE T011c COMPLETA ===')
    print(f'Apps analisados: {analysis_data["summary"]["total_apps_checked"]}')
    print(f'Apps com erros: {analysis_data["summary"]["apps_with_errors"]}')
    print(f'Missing imports encontrados: {analysis_data["summary"]["missing_import_errors"]}')
    print(f'Status geral: {analysis_data["summary"]["overall_status"]}')
    print(f'Resultado salvo em: {output_path}')

if __name__ == '__main__':
    analyze_missing_imports()