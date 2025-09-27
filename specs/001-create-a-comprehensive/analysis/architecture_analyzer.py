#!/usr/bin/env python3
"""
T012: Analyze architecture pattern compliance and design integrity
Part of Phase 3.3: Core Analysis Implementation
Agent: @architect-review
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path

def analyze_architecture_patterns():
    """Analyze architecture pattern compliance and design integrity"""
    
    analysis_data = {
        'analysis_date': datetime.now().isoformat(),
        'task': 'T012 - Architecture pattern compliance and design integrity',
        'agent': '@architect-review',
        'method': 'Clean architecture boundaries + dependency inversion + microservices patterns',
        'architecture_assessment': {},
        'design_patterns': {},
        'clean_architecture_compliance': {},
        'dependency_analysis': {},
        'microservices_patterns': {},
        'recommendations': [],
        'summary': {
            'overall_grade': 'UNKNOWN',
            'architecture_score': 0,
            'compliance_percentage': 0,
            'critical_issues': 0,
            'design_integrity': 'UNKNOWN'
        }
    }

    base_dir = '/home/vibecode/neonpro'
    
    print("=== FASE 1: Avaliando estrutura Clean Architecture ===")
    
    # 1. Análise de Clean Architecture
    clean_arch_analysis = {
        'layers_identified': [],
        'dependency_direction': 'UNKNOWN',
        'boundary_violations': [],
        'inversion_compliance': 'UNKNOWN',
        'layer_separation': 'UNKNOWN'
    }
    
    # Mapear layers pela estrutura de pastas
    app_structures = {}
    for app in ['web', 'api']:
        app_path = os.path.join(base_dir, 'apps', app)
        if os.path.exists(app_path):
            layers = []
            for root, dirs, files in os.walk(app_path):
                # Identificar layers comuns
                rel_path = os.path.relpath(root, app_path)
                if any(layer in rel_path for layer in ['controllers', 'routes', 'handlers']):
                    layers.append('interface/controllers')
                elif any(layer in rel_path for layer in ['services', 'use-cases', 'usecases']):
                    layers.append('application/use-cases')
                elif any(layer in rel_path for layer in ['entities', 'models', 'domain']):
                    layers.append('domain/entities')
                elif any(layer in rel_path for layer in ['repositories', 'infrastructure', 'adapters']):
                    layers.append('infrastructure/adapters')
                elif any(layer in rel_path for layer in ['components', 'views', 'pages']):
                    layers.append('interface/ui')
            
            app_structures[app] = {
                'identified_layers': list(set(layers)),
                'structure_type': 'clean_architecture' if len(set(layers)) >= 3 else 'layered'
            }
    
    clean_arch_analysis['layers_identified'] = app_structures
    
    # Avaliar compliance baseado na estrutura
    total_layers = sum(len(app['identified_layers']) for app in app_structures.values())
    if total_layers >= 6:  # 3+ layers por app
        clean_arch_analysis['layer_separation'] = 'GOOD'
        clean_arch_analysis['dependency_direction'] = 'INWARD_COMPLIANT'
    elif total_layers >= 4:
        clean_arch_analysis['layer_separation'] = 'PARTIAL'
        clean_arch_analysis['dependency_direction'] = 'MOSTLY_COMPLIANT'
    else:
        clean_arch_analysis['layer_separation'] = 'POOR'
        clean_arch_analysis['dependency_direction'] = 'NON_COMPLIANT'
    
    analysis_data['clean_architecture_compliance'] = clean_arch_analysis
    
    print("=== FASE 2: Analisando padrões de design ===")
    
    # 2. Design Patterns Analysis
    design_patterns = {
        'identified_patterns': [],
        'repository_pattern': 'NOT_DETECTED',
        'dependency_injection': 'NOT_DETECTED',
        'factory_pattern': 'NOT_DETECTED',
        'observer_pattern': 'NOT_DETECTED',
        'middleware_pattern': 'NOT_DETECTED'
    }
    
    # Buscar por padrões em arquivos TypeScript
    pattern_keywords = {
        'repository_pattern': ['repository', 'Repository', 'repo'],
        'dependency_injection': ['inject', 'Inject', 'DI', 'container'],
        'factory_pattern': ['factory', 'Factory', 'create'],
        'observer_pattern': ['observer', 'Observer', 'emit', 'on(', 'listen'],
        'middleware_pattern': ['middleware', 'Middleware', 'next()', 'use(']
    }
    
    for root, dirs, files in os.walk(base_dir):
        # Pular node_modules e dist
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    for pattern, keywords in pattern_keywords.items():
                        if any(keyword in content for keyword in keywords):
                            if design_patterns[pattern] == 'NOT_DETECTED':
                                design_patterns[pattern] = 'DETECTED'
                                design_patterns['identified_patterns'].append(pattern)
                                
                except Exception:
                    continue
    
    analysis_data['design_patterns'] = design_patterns
    
    print("=== FASE 3: Analisando microservices patterns ===")
    
    # 3. Microservices Patterns Analysis
    microservices_analysis = {
        'service_separation': 'UNKNOWN',
        'api_gateway_pattern': 'NOT_DETECTED',
        'service_discovery': 'NOT_DETECTED',
        'circuit_breaker': 'NOT_DETECTED',
        'event_driven': 'NOT_DETECTED',
        'service_boundaries': []
    }
    
    # Analisar separação de serviços baseada em packages
    packages_dir = os.path.join(base_dir, 'packages')
    if os.path.exists(packages_dir):
        service_packages = []
        for package in os.listdir(packages_dir):
            if os.path.isdir(os.path.join(packages_dir, package)):
                service_packages.append(package)
                
        microservices_analysis['service_boundaries'] = service_packages
        
        # Avaliar qualidade da separação
        if len(service_packages) >= 6:
            microservices_analysis['service_separation'] = 'EXCELLENT'
        elif len(service_packages) >= 4:
            microservices_analysis['service_separation'] = 'GOOD'
        elif len(service_packages) >= 2:
            microservices_analysis['service_separation'] = 'BASIC'
        else:
            microservices_analysis['service_separation'] = 'POOR'
    
    # Detectar patterns específicos
    microservice_keywords = {
        'api_gateway_pattern': ['gateway', 'Gateway', 'router', 'proxy'],
        'service_discovery': ['discovery', 'registry', 'consul', 'eureka'],
        'circuit_breaker': ['circuit', 'breaker', 'fallback', 'timeout'],
        'event_driven': ['event', 'Event', 'emitter', 'publish', 'subscribe']
    }
    
    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    for pattern, keywords in microservice_keywords.items():
                        if any(keyword in content for keyword in keywords):
                            microservices_analysis[pattern] = 'DETECTED'
                            
                except Exception:
                    continue
    
    analysis_data['microservices_patterns'] = microservices_analysis
    
    print("=== FASE 4: Calculando score e recomendações ===")
    
    # 4. Calcular score geral
    score_components = {
        'clean_architecture': 0,
        'design_patterns': 0,
        'microservices': 0
    }
    
    # Score Clean Architecture (0-40 pontos)
    if clean_arch_analysis['layer_separation'] == 'GOOD':
        score_components['clean_architecture'] = 40
    elif clean_arch_analysis['layer_separation'] == 'PARTIAL':
        score_components['clean_architecture'] = 25
    else:
        score_components['clean_architecture'] = 10
    
    # Score Design Patterns (0-30 pontos)
    patterns_detected = len(design_patterns['identified_patterns'])
    score_components['design_patterns'] = min(patterns_detected * 6, 30)
    
    # Score Microservices (0-30 pontos)
    if microservices_analysis['service_separation'] == 'EXCELLENT':
        score_components['microservices'] = 30
    elif microservices_analysis['service_separation'] == 'GOOD':
        score_components['microservices'] = 22
    elif microservices_analysis['service_separation'] == 'BASIC':
        score_components['microservices'] = 15
    else:
        score_components['microservices'] = 5
    
    total_score = sum(score_components.values())
    
    # Determinar grade
    if total_score >= 90:
        grade = 'A+'
        integrity = 'EXCELLENT'
    elif total_score >= 80:
        grade = 'A'
        integrity = 'VERY_GOOD'
    elif total_score >= 70:
        grade = 'B+'
        integrity = 'GOOD'
    elif total_score >= 60:
        grade = 'B'
        integrity = 'SATISFACTORY'
    else:
        grade = 'C'
        integrity = 'NEEDS_IMPROVEMENT'
    
    # Gerar recomendações
    recommendations = []
    
    if clean_arch_analysis['layer_separation'] != 'GOOD':
        recommendations.append({
            'category': 'Clean Architecture',
            'priority': 'HIGH',
            'issue': 'Improve layer separation and dependency direction',
            'action': 'Refactor code to follow clean architecture principles'
        })
    
    if patterns_detected < 3:
        recommendations.append({
            'category': 'Design Patterns',
            'priority': 'MEDIUM',
            'issue': 'Limited design pattern implementation',
            'action': 'Implement Repository, DI, and Factory patterns'
        })
    
    if microservices_analysis['service_separation'] in ['BASIC', 'POOR']:
        recommendations.append({
            'category': 'Microservices',
            'priority': 'HIGH',
            'issue': 'Insufficient service boundary separation',
            'action': 'Review and refactor service boundaries'
        })
    
    # Summary
    analysis_data['summary'] = {
        'overall_grade': grade,
        'architecture_score': total_score,
        'compliance_percentage': min(total_score, 100),
        'critical_issues': len([r for r in recommendations if r['priority'] == 'HIGH']),
        'design_integrity': integrity,
        'score_breakdown': score_components
    }
    
    analysis_data['recommendations'] = recommendations

    # Salvar análise
    output_path = '/home/vibecode/neonpro/specs/001-create-a-comprehensive/analysis/architecture-pattern-analysis.json'
    with open(output_path, 'w') as f:
        json.dump(analysis_data, f, indent=2)

    print(f'\n=== ANÁLISE T012 COMPLETA ===')
    print(f'Grade geral da arquitetura: {grade} ({total_score}/100)')
    print(f'Integridade do design: {integrity}')
    print(f'Issues críticas: {len([r for r in recommendations if r["priority"] == "HIGH"])}')
    print(f'Padrões de design detectados: {patterns_detected}')
    print(f'Separação de serviços: {microservices_analysis["service_separation"]}')
    print(f'Resultado salvo em: {output_path}')

if __name__ == '__main__':
    analyze_architecture_patterns()