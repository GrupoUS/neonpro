#!/usr/bin/env python3
"""
========================================
VIBECODE V2.1 - Security Analyzer
========================================
Comprehensive security analysis tool
Quality Threshold: >=9.8/10
========================================
"""

import os
import re
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Any

class SecurityAnalyzer:
    def __init__(self):
        self.quality_score = 10.0
        self.vulnerabilities = []
        self.warnings = []
        self.security_checks = {}
        self.setup_logging()
        
        # Security patterns to detect
        self.security_patterns = {
            'hardcoded_secrets': [
                r'password\s*=\s*["\'][^"\'
]+["\']',
                r'api[_-]?key\s*=\s*["\'][^"\'
]+["\']',
                r'secret\s*=\s*["\'][^"\'
]+["\']',
                r'token\s*=\s*["\'][^"\'
]+["\']',
                r'private[_-]?key\s*=\s*["\'][^"\'
]+["\']'
            ],
            'sql_injection': [
                r'SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+',
                r'INSERT\s+INTO\s+.*\s+VALUES\s*\(.*\+',
                r'UPDATE\s+.*\s+SET\s+.*\+',
                r'DELETE\s+FROM\s+.*\s+WHERE\s+.*\+'
            ],
            'xss_vulnerabilities': [
                r'innerHTML\s*=\s*.*\+',
                r'document\.write\s*\(',
                r'eval\s*\(',
                r'dangerouslySetInnerHTML'
            ],
            'insecure_protocols': [
                r'http://(?!localhost|127\.0\.0\.1)',
                r'ftp://',
                r'telnet://'
            ],
            'weak_crypto': [
                r'md5\s*\(',
                r'sha1\s*\(',
                r'DES\s*\(',
                r'RC4\s*\('
            ]
        }
        
    def setup_logging(self):
        """Setup logging configuration"""
        log_dir = Path('.trae/logs')
        log_dir.mkdir(parents=True, exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s] [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(log_dir / 'security-analysis.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def log_vulnerability(self, severity: str, message: str, file_path: str = None, line_number: int = None):
        """Log security vulnerability"""
        vuln = {
            'severity': severity,
            'message': message,
            'file_path': file_path,
            'line_number': line_number,
            'timestamp': datetime.now().isoformat()
        }
        
        self.vulnerabilities.append(vuln)
        
        if severity == 'CRITICAL':
            self.quality_score -= 1.0
        elif severity == 'HIGH':
            self.quality_score -= 0.5
        elif severity == 'MEDIUM':
            self.quality_score -= 0.2
        else:  # LOW
            self.quality_score -= 0.1
            
        location = f" in {file_path}:{line_number}" if file_path and line_number else ""
        self.logger.error(f"[{severity}] {message}{location}")
        
    def log_warning(self, message: str, file_path: str = None):
        """Log security warning"""
        warning = {
            'message': message,
            'file_path': file_path,
            'timestamp': datetime.now().isoformat()
        }
        
        self.warnings.append(warning)
        self.quality_score -= 0.05
        
        location = f" in {file_path}" if file_path else ""
        self.logger.warning(f"SECURITY WARNING: {message}{location}")
        
    def log_info(self, message: str):
        """Log info message"""
        self.logger.info(message)
        
    def scan_file_for_patterns(self, file_path: str) -> Dict[str, List[Tuple[int, str]]]:
        """Scan a file for security patterns"""
        findings = {}
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                
            for category, patterns in self.security_patterns.items():
                category_findings = []
                
                for line_num, line in enumerate(lines, 1):
                    for pattern in patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            category_findings.append((line_num, line.strip()))
                            
                if category_findings:
                    findings[category] = category_findings
                    
        except Exception as e:
            self.log_warning(f"Failed to scan file {file_path}: {str(e)}")
            
        return findings
        
    def analyze_source_code(self) -> bool:
        """Analyze source code for security vulnerabilities"""
        self.log_info('Analyzing source code for security vulnerabilities...')
        
        # File extensions to scan
        scan_extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.env']
        
        # Directories to scan
        scan_dirs = ['app', 'components', 'lib', 'hooks', 'pages', 'api']
        
        files_scanned = 0
        vulnerabilities_found = 0
        
        for scan_dir in scan_dirs:
            if not os.path.exists(scan_dir):
                continue
                
            for root, dirs, files in os.walk(scan_dir):
                # Skip node_modules and other irrelevant directories
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]
                
                for file in files:
                    file_path = os.path.join(root, file)
                    file_ext = os.path.splitext(file)[1]
                    
                    if file_ext in scan_extensions:
                        files_scanned += 1
                        findings = self.scan_file_for_patterns(file_path)
                        
                        for category, matches in findings.items():
                            for line_num, line_content in matches:
                                vulnerabilities_found += 1
                                
                                # Determine severity based on category
                                if category == 'hardcoded_secrets':
                                    severity = 'CRITICAL'
                                elif category in ['sql_injection', 'xss_vulnerabilities']:
                                    severity = 'HIGH'
                                elif category in ['insecure_protocols', 'weak_crypto']:
                                    severity = 'MEDIUM'
                                else:
                                    severity = 'LOW'
                                    
                                self.log_vulnerability(
                                    severity,
                                    f"{category.replace('_', ' ').title()} detected: {line_content[:100]}...",
                                    file_path,
                                    line_num
                                )
        
        self.security_checks['source_code_analysis'] = {
            'files_scanned': files_scanned,
            'vulnerabilities_found': vulnerabilities_found,
            'status': 'PASS' if vulnerabilities_found == 0 else 'FAIL'
        }
        
        self.log_info(f"Source code analysis completed: {files_scanned} files scanned, {vulnerabilities_found} vulnerabilities found")
        
        return vulnerabilities_found == 0
        
    def check_environment_security(self) -> bool:
        """Check environment configuration security"""
        self.log_info('Checking environment security configuration...')
        
        env_files = ['.env', '.env.local', '.env.development', '.env.production']
        issues_found = 0
        
        for env_file in env_files:
            if os.path.exists(env_file):
                self.log_info(f"Analyzing {env_file}...")
                
                # Check file permissions
                try:
                    file_stat = os.stat(env_file)
                    file_mode = oct(file_stat.st_mode)[-3:]
                    
                    if file_mode != '600':
                        self.log_vulnerability(
                            'MEDIUM',
                            f"Environment file {env_file} has insecure permissions: {file_mode} (should be 600)",
                            env_file
                        )
                        issues_found += 1
                        
                except Exception as e:
                    self.log_warning(f"Failed to check permissions for {env_file}: {str(e)}")
                    
                # Check for sensitive data patterns
                try:
                    with open(env_file, 'r') as f:
                        content = f.read()
                        
                    # Check for potential secrets in plain text
                    if re.search(r'password\s*=\s*[^\s]+', content, re.IGNORECASE):
                        self.log_vulnerability(
                            'HIGH',
                            f"Plain text password found in {env_file}",
                            env_file
                        )
                        issues_found += 1
                        
                    # Check for development keys in production
                    if 'production' in env_file and 'localhost' in content:
                        self.log_vulnerability(
                            'MEDIUM',
                            f"Development configuration found in production environment file {env_file}",
                            env_file
                        )
                        issues_found += 1
                        
                except Exception as e:
                    self.log_warning(f"Failed to analyze {env_file}: {str(e)}")
                    
        self.security_checks['environment_security'] = {
            'files_checked': len([f for f in env_files if os.path.exists(f)]),
            'issues_found': issues_found,
            'status': 'PASS' if issues_found == 0 else 'FAIL'
        }
        
        return issues_found == 0
        
    def check_dependency_security(self) -> bool:
        """Check dependency security"""
        self.log_info('Checking dependency security...')
        
        package_json_path = 'package.json'
        if not os.path.exists(package_json_path):
            self.log_warning('package.json not found')
            return True
            
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                
            dependencies = {}
            if 'dependencies' in package_data:
                dependencies.update(package_data['dependencies'])
            if 'devDependencies' in package_data:
                dependencies.update(package_data['devDependencies'])
                
            # Known vulnerable packages (simplified list)
            known_vulnerable = {
                'lodash': ['<4.17.21'],
                'axios': ['<0.21.1'],
                'express': ['<4.17.1'],
                'react': ['<16.14.0'],
                'next': ['<10.0.0']
            }
            
            vulnerable_deps = 0
            
            for dep_name, version in dependencies.items():
                if dep_name in known_vulnerable:
                    # Simple version check (in real implementation, use proper semver)
                    if any(version.startswith(v.replace('<', '')) for v in known_vulnerable[dep_name]):
                        self.log_vulnerability(
                            'HIGH',
                            f"Potentially vulnerable dependency: {dep_name}@{version}",
                            package_json_path
                        )
                        vulnerable_deps += 1
                        
            self.security_checks['dependency_security'] = {
                'dependencies_checked': len(dependencies),
                'vulnerable_dependencies': vulnerable_deps,
                'status': 'PASS' if vulnerable_deps == 0 else 'FAIL'
            }
            
            self.log_info(f"Dependency security check completed: {len(dependencies)} dependencies checked, {vulnerable_deps} vulnerabilities found")
            
            return vulnerable_deps == 0
            
        except Exception as e:
            self.log_warning(f"Failed to check dependency security: {str(e)}")
            return True
            
    def check_configuration_security(self) -> bool:
        """Check configuration files security"""
        self.log_info('Checking configuration security...')
        
        config_files = {
            'next.config.mjs': ['security headers', 'HTTPS enforcement'],
            'tsconfig.json': ['strict mode', 'type checking'],
            '.gitignore': ['environment files', 'sensitive directories']
        }
        
        issues_found = 0
        
        for config_file, checks in config_files.items():
            if os.path.exists(config_file):
                try:
                    with open(config_file, 'r') as f:
                        content = f.read()
                        
                    # Basic security checks
                    if config_file == 'next.config.mjs':
                        if 'headers' not in content:
                            self.log_vulnerability(
                                'MEDIUM',
                                'No security headers configured in Next.js config',
                                config_file
                            )
                            issues_found += 1
                            
                    elif config_file == '.gitignore':
                        if '.env' not in content:
                            self.log_vulnerability(
                                'HIGH',
                                'Environment files not ignored in .gitignore',
                                config_file
                            )
                            issues_found += 1
                            
                except Exception as e:
                    self.log_warning(f"Failed to check {config_file}: {str(e)}")
                    
        self.security_checks['configuration_security'] = {
            'files_checked': len([f for f in config_files.keys() if os.path.exists(f)]),
            'issues_found': issues_found,
            'status': 'PASS' if issues_found == 0 else 'FAIL'
        }
        
        return issues_found == 0
        
    def generate_security_report(self) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        self.log_info('\n========================================')
        self.log_info('VIBECODE V2.1 Security Analysis Report')
        self.log_info('========================================')
        
        # Calculate final quality score
        final_quality_score = max(0.0, min(10.0, self.quality_score))
        
        self.log_info(f'Security Quality Score: {final_quality_score:.1f}/10.0')
        self.log_info(f'Vulnerabilities Found: {len(self.vulnerabilities)}')
        self.log_info(f'Warnings: {len(self.warnings)}')
        
        # Vulnerability breakdown by severity
        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        for vuln in self.vulnerabilities:
            severity_counts[vuln['severity']] += 1
            
        self.log_info('\nVulnerability Breakdown:')
        for severity, count in severity_counts.items():
            if count > 0:
                self.log_info(f'  {severity}: {count}')
                
        # Security checks summary
        self.log_info('\nSecurity Checks:')
        for check_name, result in self.security_checks.items():
            status_icon = '✅' if result['status'] == 'PASS' else '❌'
            self.log_info(f'  {status_icon} {check_name.replace("_", " ").title()}: {result["status"]}')
            
        # Detailed vulnerabilities
        if self.vulnerabilities:
            self.log_info('\nDetailed Vulnerabilities:')
            for i, vuln in enumerate(self.vulnerabilities[:10], 1):  # Show first 10
                location = f" ({vuln['file_path']}:{vuln['line_number']})" if vuln['file_path'] else ""
                self.log_info(f"  {i}. [{vuln['severity']}] {vuln['message']}{location}")
                
            if len(self.vulnerabilities) > 10:
                self.log_info(f"  ... and {len(self.vulnerabilities) - 10} more vulnerabilities")
                
        # Determine security status
        critical_vulns = severity_counts['CRITICAL']
        high_vulns = severity_counts['HIGH']
        
        is_secure = final_quality_score >= 9.8 and critical_vulns == 0 and high_vulns == 0
        
        self.log_info('\n========================================')
        if is_secure:
            self.log_info('✅ SECURITY ANALYSIS PASSED - Quality >= 9.8/10, No Critical/High Vulnerabilities')
        else:
            self.log_info('❌ SECURITY ANALYSIS FAILED - Quality < 9.8/10 or Critical/High Vulnerabilities Found')
        self.log_info('========================================\n')
        
        # Generate report data
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'security_quality_score': final_quality_score,
            'security_passed': is_secure,
            'vulnerabilities': self.vulnerabilities,
            'warnings': self.warnings,
            'security_checks': self.security_checks,
            'severity_breakdown': severity_counts,
            'summary': {
                'total_vulnerabilities': len(self.vulnerabilities),
                'critical_vulnerabilities': critical_vulns,
                'high_vulnerabilities': high_vulns,
                'medium_vulnerabilities': severity_counts['MEDIUM'],
                'low_vulnerabilities': severity_counts['LOW'],
                'warnings_count': len(self.warnings)
            }
        }
        
        # Save report to file
        try:
            report_path = Path('.trae/logs/security-analysis-report.json')
            report_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(report_data, f, indent=2)
                
            self.log_info(f'Security report saved to: {report_path}')
            
        except Exception as e:
            self.log_warning(f'Failed to save security report: {str(e)}')
            
        return report_data
        
    def analyze(self) -> bool:
        """Main security analysis method"""
        self.log_info('Starting VIBECODE V2.1 comprehensive security analysis...')
        
        # Run security checks
        security_tests = [
            ('Source Code Analysis', self.analyze_source_code),
            ('Environment Security', self.check_environment_security),
            ('Dependency Security', self.check_dependency_security),
            ('Configuration Security', self.check_configuration_security)
        ]
        
        all_passed = True
        
        for test_name, test_func in security_tests:
            self.log_info(f'Running security test: {test_name}')
            try:
                result = test_func()
                if not result:
                    all_passed = False
                    
            except Exception as e:
                self.log_vulnerability('HIGH', f'Security test {test_name} failed: {str(e)}')
                all_passed = False
                
        # Generate comprehensive report
        report = self.generate_security_report()
        
        return report['security_passed']

def main():
    """Main entry point"""
    try:
        analyzer = SecurityAnalyzer()
        is_secure = analyzer.analyze()
        exit_code = 0 if is_secure else 1
        exit(exit_code)
        
    except Exception as e:
        print(f'[FATAL] Security analysis failed: {str(e)}')
        exit(1)

if __name__ == '__main__':
    main()