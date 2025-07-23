#!/usr/bin/env python3
"""
========================================
VIBECODE V2.1 - TRAE System Validator
========================================
Comprehensive system validation script
Quality Threshold: >=9.7/10
========================================
"""

import os
import sys
import json
import time
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Any

class TraeSystemValidator:
    def __init__(self):
        self.quality_score = 10.0
        self.errors = []
        self.warnings = []
        self.test_results = {}
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging configuration"""
        log_dir = Path('.trae/logs')
        log_dir.mkdir(parents=True, exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s] [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(log_dir / 'trae-system-validation.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def log_error(self, message: str):
        """Log error and update quality score"""
        self.errors.append(message)
        self.quality_score -= 0.3
        self.logger.error(message)
        
    def log_warning(self, message: str):
        """Log warning and update quality score"""
        self.warnings.append(message)
        self.quality_score -= 0.1
        self.logger.warning(message)
        
    def log_info(self, message: str):
        """Log info message"""
        self.logger.info(message)
        
    def check_python_environment(self) -> bool:
        """Check Python environment and dependencies"""
        self.log_info('Checking Python environment...')
        
        try:
            # Check Python version
            python_version = sys.version_info
            if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
                self.log_error(f'Python version {python_version.major}.{python_version.minor} is too old. Minimum required: 3.8')
                return False
            else:
                self.log_info(f'Python version {python_version.major}.{python_version.minor}.{python_version.micro} - OK')
                
            # Check required packages
            required_packages = ['requests', 'json', 'pathlib', 'subprocess']
            for package in required_packages:
                try:
                    __import__(package)
                    self.log_info(f'Package {package} - OK')
                except ImportError:
                    self.log_warning(f'Package {package} not available')
                    
            return True
            
        except Exception as e:
            self.log_error(f'Failed to check Python environment: {str(e)}')
            return False
            
    def check_file_system_integrity(self) -> bool:
        """Check file system integrity and permissions"""
        self.log_info('Checking file system integrity...')
        
        try:
            # Check critical directories
            critical_dirs = [
                '.trae',
                '.trae/scripts',
                '.trae/logs',
                '.trae/config',
                'app',
                'components',
                'lib',
                'hooks'
            ]
            
            for dir_path in critical_dirs:
                if not os.path.exists(dir_path):
                    self.log_error(f'Critical directory missing: {dir_path}')
                elif not os.access(dir_path, os.R_OK | os.W_OK):
                    self.log_error(f'Insufficient permissions for directory: {dir_path}')
                else:
                    self.log_info(f'Directory {dir_path} - OK')
                    
            # Check critical files
            critical_files = [
                'package.json',
                'next.config.mjs',
                'tailwind.config.ts',
                'tsconfig.json'
            ]
            
            for file_path in critical_files:
                if not os.path.exists(file_path):
                    self.log_error(f'Critical file missing: {file_path}')
                elif not os.access(file_path, os.R_OK):
                    self.log_error(f'Cannot read critical file: {file_path}')
                else:
                    self.log_info(f'File {file_path} - OK')
                    
            return len(self.errors) == 0
            
        except Exception as e:
            self.log_error(f'Failed to check file system integrity: {str(e)}')
            return False
            
    def check_network_connectivity(self) -> bool:
        """Check network connectivity for external services"""
        self.log_info('Checking network connectivity...')
        
        try:
            import urllib.request
            import socket
            
            # Test endpoints
            test_endpoints = [
                ('github.com', 443),
                ('npmjs.com', 443),
                ('supabase.com', 443)
            ]
            
            for host, port in test_endpoints:
                try:
                    socket.create_connection((host, port), timeout=10)
                    self.log_info(f'Network connectivity to {host}:{port} - OK')
                except (socket.timeout, socket.error) as e:
                    self.log_warning(f'Network connectivity to {host}:{port} - FAILED: {str(e)}')
                    
            return True
            
        except Exception as e:
            self.log_warning(f'Network connectivity check failed: {str(e)}')
            return True  # Non-critical for system validation
            
    def check_performance_metrics(self) -> bool:
        """Check system performance metrics"""
        self.log_info('Checking performance metrics...')
        
        try:
            import psutil
            
            # Check CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > 90:
                self.log_warning(f'High CPU usage: {cpu_percent}%')
            else:
                self.log_info(f'CPU usage: {cpu_percent}% - OK')
                
            # Check memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            if memory_percent > 90:
                self.log_warning(f'High memory usage: {memory_percent}%')
            else:
                self.log_info(f'Memory usage: {memory_percent}% - OK')
                
            # Check disk space
            disk = psutil.disk_usage('.')
            disk_percent = (disk.used / disk.total) * 100
            if disk_percent > 90:
                self.log_warning(f'Low disk space: {disk_percent:.1f}% used')
            else:
                self.log_info(f'Disk usage: {disk_percent:.1f}% - OK')
                
            return True
            
        except ImportError:
            self.log_warning('psutil not available - skipping performance metrics')
            return True
        except Exception as e:
            self.log_warning(f'Performance metrics check failed: {str(e)}')
            return True
            
    def check_security_configuration(self) -> bool:
        """Check security configuration"""
        self.log_info('Checking security configuration...')
        
        try:
            # Check environment variables
            env_file = '.env.local'
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    env_content = f.read()
                    
                # Check for sensitive data patterns
                sensitive_patterns = ['password', 'secret', 'key', 'token']
                for pattern in sensitive_patterns:
                    if pattern.lower() in env_content.lower():
                        self.log_info(f'Environment variable with {pattern} found - OK')
                        
                # Check file permissions
                file_stat = os.stat(env_file)
                file_mode = oct(file_stat.st_mode)[-3:]
                if file_mode != '600':
                    self.log_warning(f'.env.local permissions: {file_mode} (recommended: 600)')
                else:
                    self.log_info('.env.local permissions - OK')
            else:
                self.log_warning('.env.local file not found')
                
            return True
            
        except Exception as e:
            self.log_warning(f'Security configuration check failed: {str(e)}')
            return True
            
    def run_comprehensive_tests(self) -> bool:
        """Run comprehensive system tests"""
        self.log_info('Running comprehensive system tests...')
        
        test_suite = [
            ('Python Environment', self.check_python_environment),
            ('File System Integrity', self.check_file_system_integrity),
            ('Network Connectivity', self.check_network_connectivity),
            ('Performance Metrics', self.check_performance_metrics),
            ('Security Configuration', self.check_security_configuration)
        ]
        
        all_passed = True
        
        for test_name, test_func in test_suite:
            self.log_info(f'Running test: {test_name}')
            start_time = time.time()
            
            try:
                result = test_func()
                execution_time = time.time() - start_time
                
                self.test_results[test_name] = {
                    'status': 'PASS' if result else 'FAIL',
                    'execution_time': execution_time,
                    'timestamp': datetime.now().isoformat()
                }
                
                if result:
                    self.log_info(f'✅ {test_name} - PASS ({execution_time:.2f}s)')
                else:
                    self.log_error(f'❌ {test_name} - FAIL ({execution_time:.2f}s)')
                    all_passed = False
                    
            except Exception as e:
                execution_time = time.time() - start_time
                self.log_error(f'❌ {test_name} - EXCEPTION: {str(e)} ({execution_time:.2f}s)')
                
                self.test_results[test_name] = {
                    'status': 'EXCEPTION',
                    'error': str(e),
                    'execution_time': execution_time,
                    'timestamp': datetime.now().isoformat()
                }
                
                all_passed = False
                
        return all_passed
        
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        self.log_info('\n========================================')
        self.log_info('VIBECODE V2.1 TRAE System Validation Report')
        self.log_info('========================================')
        
        # Calculate final quality score
        final_quality_score = max(0.0, min(10.0, self.quality_score))
        
        self.log_info(f'Quality Score: {final_quality_score:.1f}/10.0')
        self.log_info(f'Errors: {len(self.errors)}')
        self.log_info(f'Warnings: {len(self.warnings)}')
        
        # Test results summary
        passed_tests = sum(1 for result in self.test_results.values() if result['status'] == 'PASS')
        total_tests = len(self.test_results)
        
        self.log_info(f'Tests Passed: {passed_tests}/{total_tests}')
        
        if self.errors:
            self.log_info('\nERRORS:')
            for i, error in enumerate(self.errors, 1):
                self.log_info(f'  {i}. {error}')
                
        if self.warnings:
            self.log_info('\nWARNINGS:')
            for i, warning in enumerate(self.warnings, 1):
                self.log_info(f'  {i}. {warning}')
                
        # Determine validation status
        is_valid = final_quality_score >= 9.7 and len(self.errors) == 0
        
        self.log_info('\n========================================')
        if is_valid:
            self.log_info('✅ SYSTEM VALIDATION PASSED - Quality >= 9.7/10')
        else:
            self.log_info('❌ SYSTEM VALIDATION FAILED - Quality < 9.7/10 or errors present')
        self.log_info('========================================\n')
        
        # Generate report data
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'quality_score': final_quality_score,
            'validation_passed': is_valid,
            'errors': self.errors,
            'warnings': self.warnings,
            'test_results': self.test_results,
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': total_tests - passed_tests,
                'error_count': len(self.errors),
                'warning_count': len(self.warnings)
            }
        }
        
        # Save report to file
        try:
            report_path = Path('.trae/logs/trae-system-validation-report.json')
            report_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(report_data, f, indent=2)
                
            self.log_info(f'Report saved to: {report_path}')
            
        except Exception as e:
            self.log_error(f'Failed to save report: {str(e)}')
            
        return report_data
        
    def validate(self) -> bool:
        """Main validation method"""
        self.log_info('Starting VIBECODE V2.1 TRAE system validation...')
        
        # Run comprehensive tests
        tests_passed = self.run_comprehensive_tests()
        
        # Generate report
        report = self.generate_report()
        
        # Return validation result
        return report['validation_passed']

def main():
    """Main entry point"""
    try:
        validator = TraeSystemValidator()
        is_valid = validator.validate()
        sys.exit(0 if is_valid else 1)
        
    except Exception as e:
        print(f'[FATAL] TRAE system validation failed: {str(e)}')
        sys.exit(1)

if __name__ == '__main__':
    main()