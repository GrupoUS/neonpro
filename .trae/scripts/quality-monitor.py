#!/usr/bin/env python3
"""
========================================
VIBECODE V2.1 - Quality Monitor
========================================
Continuous quality monitoring and reporting
Quality Threshold: >=9.5/10
========================================
"""

import os
import sys
import json
import time
import subprocess
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import threading
import schedule

class QualityMonitor:
    def __init__(self):
        self.quality_score = 10.0
        self.metrics = {}
        self.errors = []
        self.warnings = []
        self.monitoring_active = False
        self.log_file = '.trae/logs/quality-monitor.log'
        self.report_file = '.trae/logs/quality-report.json'
        self.setup_logging()
        self.ensure_log_directory()
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s] [%(levelname)s] %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def ensure_log_directory(self):
        """Ensure log directory exists"""
        log_dir = Path(self.log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup file handler for logging
        file_handler = logging.FileHandler(self.log_file)
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
    def add_error(self, message: str):
        """Add error and reduce quality score"""
        self.errors.append(message)
        self.quality_score -= 0.5
        self.logger.error(message)
        
    def add_warning(self, message: str):
        """Add warning and slightly reduce quality score"""
        self.warnings.append(message)
        self.quality_score -= 0.1
        self.logger.warning(message)
        
    def run_command(self, command: List[str], cwd: Optional[str] = None) -> Dict[str, Any]:
        """Run shell command and return result"""
        try:
            start_time = time.time()
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                cwd=cwd,
                timeout=300  # 5 minute timeout
            )
            duration = time.time() - start_time
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'duration': duration
            }
        except subprocess.TimeoutExpired:
            self.add_error(f"Command timeout: {' '.join(command)}")
            return {'success': False, 'error': 'timeout'}
        except Exception as e:
            self.add_error(f"Command execution failed: {e}")
            return {'success': False, 'error': str(e)}
            
    def check_code_quality(self) -> Dict[str, Any]:
        """Check code quality metrics"""
        self.logger.info('Checking code quality...')
        
        quality_metrics = {
            'eslint': self.run_eslint_check(),
            'typescript': self.run_typescript_check(),
            'prettier': self.run_prettier_check(),
            'complexity': self.analyze_code_complexity(),
            'coverage': self.check_test_coverage()
        }
        
        # Calculate overall code quality score
        successful_checks = sum(1 for metric in quality_metrics.values() if metric.get('success', False))
        total_checks = len(quality_metrics)
        code_quality_score = (successful_checks / total_checks) * 10 if total_checks > 0 else 0
        
        quality_metrics['overall_score'] = code_quality_score
        
        if code_quality_score < 8.0:
            self.add_warning(f"Code quality score below threshold: {code_quality_score:.1f}/10")
            
        return quality_metrics
        
    def run_eslint_check(self) -> Dict[str, Any]:
        """Run ESLint code quality check"""
        if not Path('package.json').exists():
            return {'success': False, 'reason': 'No package.json found'}
            
        # Check if ESLint is configured
        eslint_configs = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js']
        if not any(Path(config).exists() for config in eslint_configs):
            self.add_warning('No ESLint configuration found')
            return {'success': False, 'reason': 'No ESLint config'}
            
        result = self.run_command(['npx', 'eslint', '.', '--format', 'json'])
        
        if result['success']:
            try:
                eslint_output = json.loads(result['stdout']) if result['stdout'] else []
                total_errors = sum(len(file.get('messages', [])) for file in eslint_output)
                
                return {
                    'success': total_errors == 0,
                    'errors': total_errors,
                    'files_checked': len(eslint_output),
                    'duration': result['duration']
                }
            except json.JSONDecodeError:
                self.add_warning('Failed to parse ESLint output')
                return {'success': False, 'reason': 'Parse error'}
        else:
            return {'success': False, 'error': result.get('stderr', 'Unknown error')}
            
    def run_typescript_check(self) -> Dict[str, Any]:
        """Run TypeScript type checking"""
        if not Path('tsconfig.json').exists():
            return {'success': False, 'reason': 'No TypeScript configuration'}
            
        result = self.run_command(['npx', 'tsc', '--noEmit'])
        
        return {
            'success': result['success'],
            'duration': result['duration'],
            'errors': result.get('stderr', '') if not result['success'] else None
        }
        
    def run_prettier_check(self) -> Dict[str, Any]:
        """Check code formatting with Prettier"""
        prettier_configs = ['.prettierrc', '.prettierrc.json', '.prettierrc.js', 'prettier.config.js']
        if not any(Path(config).exists() for config in prettier_configs):
            self.add_warning('No Prettier configuration found')
            return {'success': False, 'reason': 'No Prettier config'}
            
        result = self.run_command(['npx', 'prettier', '--check', '.'])
        
        return {
            'success': result['success'],
            'duration': result['duration'],
            'unformatted_files': result.get('stdout', '').count('Code style issues') if not result['success'] else 0
        }
        
    def analyze_code_complexity(self) -> Dict[str, Any]:
        """Analyze code complexity"""
        # Simple complexity analysis based on file sizes and structure
        complexity_metrics = {
            'large_files': 0,
            'total_files': 0,
            'avg_file_size': 0,
            'max_file_size': 0
        }
        
        source_dirs = ['app', 'src', 'components', 'lib', 'utils']
        file_sizes = []
        
        for source_dir in source_dirs:
            if Path(source_dir).exists():
                for file_path in Path(source_dir).rglob('*.{ts,tsx,js,jsx}'):
                    if file_path.is_file():
                        size = file_path.stat().st_size
                        file_sizes.append(size)
                        complexity_metrics['total_files'] += 1
                        
                        # Flag files larger than 10KB as potentially complex
                        if size > 10240:  # 10KB
                            complexity_metrics['large_files'] += 1
                            
        if file_sizes:
            complexity_metrics['avg_file_size'] = sum(file_sizes) / len(file_sizes)
            complexity_metrics['max_file_size'] = max(file_sizes)
            
        # Calculate complexity score
        if complexity_metrics['total_files'] > 0:
            large_file_ratio = complexity_metrics['large_files'] / complexity_metrics['total_files']
            complexity_score = max(0, 10 - (large_file_ratio * 5))  # Penalize high ratio of large files
        else:
            complexity_score = 10
            
        complexity_metrics['score'] = complexity_score
        complexity_metrics['success'] = complexity_score >= 7.0
        
        return complexity_metrics
        
    def check_test_coverage(self) -> Dict[str, Any]:
        """Check test coverage"""
        # Check if coverage script exists
        if Path('package.json').exists():
            with open('package.json', 'r') as f:
                package_data = json.load(f)
                
            scripts = package_data.get('scripts', {})
            if 'test:coverage' in scripts or 'coverage' in scripts:
                coverage_script = 'test:coverage' if 'test:coverage' in scripts else 'coverage'
                result = self.run_command(['npm', 'run', coverage_script])
                
                # Parse coverage output (simplified)
                coverage_percentage = 0
                if result['success'] and result['stdout']:
                    # Look for coverage percentage in output
                    import re
                    coverage_match = re.search(r'(\d+(?:\.\d+)?)%', result['stdout'])
                    if coverage_match:
                        coverage_percentage = float(coverage_match.group(1))
                        
                return {
                    'success': result['success'] and coverage_percentage >= 80,
                    'coverage_percentage': coverage_percentage,
                    'duration': result['duration']
                }
            else:
                self.add_warning('No test coverage script found')
                return {'success': False, 'reason': 'No coverage script'}
        else:
            return {'success': False, 'reason': 'No package.json'}
            
    def check_performance_metrics(self) -> Dict[str, Any]:
        """Check performance metrics"""
        self.logger.info('Checking performance metrics...')
        
        performance_metrics = {
            'build_time': self.measure_build_time(),
            'bundle_size': self.analyze_bundle_size(),
            'dependency_audit': self.audit_dependencies(),
            'lighthouse': self.run_lighthouse_audit()
        }
        
        return performance_metrics
        
    def measure_build_time(self) -> Dict[str, Any]:
        """Measure build time"""
        if not Path('package.json').exists():
            return {'success': False, 'reason': 'No package.json'}
            
        # Clean build
        clean_result = self.run_command(['npm', 'run', 'clean']) if self.has_script('clean') else {'success': True}
        
        # Measure build time
        build_result = self.run_command(['npm', 'run', 'build'])
        
        build_time_threshold = 120  # 2 minutes
        is_fast_build = build_result['duration'] < build_time_threshold
        
        if not is_fast_build:
            self.add_warning(f"Build time exceeds threshold: {build_result['duration']:.1f}s > {build_time_threshold}s")
            
        return {
            'success': build_result['success'] and is_fast_build,
            'build_time': build_result['duration'],
            'threshold': build_time_threshold,
            'build_output': build_result.get('stdout', '')
        }
        
    def analyze_bundle_size(self) -> Dict[str, Any]:
        """Analyze bundle size"""
        # Check for Next.js build output
        next_build_dir = Path('.next')
        if next_build_dir.exists():
            # Look for build manifest or analyze .next directory
            static_dir = next_build_dir / 'static'
            if static_dir.exists():
                total_size = sum(f.stat().st_size for f in static_dir.rglob('*') if f.is_file())
                
                # Convert to MB
                size_mb = total_size / (1024 * 1024)
                
                # Threshold: 5MB for static assets
                size_threshold = 5.0
                is_optimal_size = size_mb < size_threshold
                
                if not is_optimal_size:
                    self.add_warning(f"Bundle size exceeds threshold: {size_mb:.1f}MB > {size_threshold}MB")
                    
                return {
                    'success': is_optimal_size,
                    'size_mb': size_mb,
                    'threshold_mb': size_threshold
                }
                
        return {'success': False, 'reason': 'No build output found'}
        
    def audit_dependencies(self) -> Dict[str, Any]:
        """Audit dependencies for security and performance"""
        audit_result = self.run_command(['npm', 'audit', '--json'])
        
        if audit_result['success']:
            try:
                audit_data = json.loads(audit_result['stdout'])
                vulnerabilities = audit_data.get('metadata', {}).get('vulnerabilities', {})
                
                high_vulns = vulnerabilities.get('high', 0)
                critical_vulns = vulnerabilities.get('critical', 0)
                
                has_serious_vulns = high_vulns > 0 or critical_vulns > 0
                
                if has_serious_vulns:
                    self.add_warning(f"Security vulnerabilities found: {critical_vulns} critical, {high_vulns} high")
                    
                return {
                    'success': not has_serious_vulns,
                    'vulnerabilities': vulnerabilities,
                    'duration': audit_result['duration']
                }
            except json.JSONDecodeError:
                self.add_warning('Failed to parse npm audit output')
                return {'success': False, 'reason': 'Parse error'}
        else:
            return {'success': False, 'error': audit_result.get('stderr', 'Unknown error')}
            
    def run_lighthouse_audit(self) -> Dict[str, Any]:
        """Run Lighthouse performance audit (if available)"""
        # Check if Lighthouse CLI is available
        lighthouse_check = self.run_command(['lighthouse', '--version'])
        
        if not lighthouse_check['success']:
            self.add_warning('Lighthouse CLI not available')
            return {'success': False, 'reason': 'Lighthouse not installed'}
            
        # For now, return placeholder - would need actual URL to audit
        return {
            'success': True,
            'reason': 'Lighthouse available but no URL to audit',
            'performance_score': None
        }
        
    def has_script(self, script_name: str) -> bool:
        """Check if npm script exists"""
        if Path('package.json').exists():
            with open('package.json', 'r') as f:
                package_data = json.load(f)
            return script_name in package_data.get('scripts', {})
        return False
        
    def check_security_metrics(self) -> Dict[str, Any]:
        """Check security metrics"""
        self.logger.info('Checking security metrics...')
        
        security_metrics = {
            'dependency_audit': self.audit_dependencies(),
            'env_security': self.check_env_security(),
            'file_permissions': self.check_file_permissions(),
            'secrets_scan': self.scan_for_secrets()
        }
        
        return security_metrics
        
    def check_env_security(self) -> Dict[str, Any]:
        """Check environment security"""
        env_files = ['.env', '.env.local', '.env.production']
        security_issues = []
        
        for env_file in env_files:
            if Path(env_file).exists():
                # Check file permissions (Unix-like systems)
                if os.name != 'nt':  # Not Windows
                    stat_info = Path(env_file).stat()
                    # Check if file is readable by others
                    if stat_info.st_mode & 0o044:  # Others can read
                        security_issues.append(f"{env_file} is readable by others")
                        
        return {
            'success': len(security_issues) == 0,
            'issues': security_issues
        }
        
    def check_file_permissions(self) -> Dict[str, Any]:
        """Check critical file permissions"""
        if os.name == 'nt':  # Windows
            return {'success': True, 'reason': 'Windows - permissions check skipped'}
            
        critical_files = ['package.json', 'next.config.js', 'next.config.mjs']
        permission_issues = []
        
        for file_path in critical_files:
            if Path(file_path).exists():
                stat_info = Path(file_path).stat()
                # Check if file is writable by others
                if stat_info.st_mode & 0o022:  # Others can write
                    permission_issues.append(f"{file_path} is writable by others")
                    
        return {
            'success': len(permission_issues) == 0,
            'issues': permission_issues
        }
        
    def scan_for_secrets(self) -> Dict[str, Any]:
        """Scan for potential secrets in code"""
        secret_patterns = [
            r'api[_-]?key[\s]*[=:][\s]*["\'][^"\'
]{10,}["\']',
            r'secret[_-]?key[\s]*[=:][\s]*["\'][^"\'
]{10,}["\']',
            r'password[\s]*[=:][\s]*["\'][^"\'
]{8,}["\']',
            r'token[\s]*[=:][\s]*["\'][^"\'
]{20,}["\']'
        ]
        
        import re
        potential_secrets = []
        
        source_dirs = ['app', 'src', 'components', 'lib', 'utils']
        
        for source_dir in source_dirs:
            if Path(source_dir).exists():
                for file_path in Path(source_dir).rglob('*.{ts,tsx,js,jsx}'):
                    if file_path.is_file():
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                            for pattern in secret_patterns:
                                matches = re.finditer(pattern, content, re.IGNORECASE)
                                for match in matches:
                                    potential_secrets.append({
                                        'file': str(file_path),
                                        'pattern': pattern,
                                        'line': content[:match.start()].count('\n') + 1
                                    })
                        except Exception as e:
                            self.add_warning(f"Could not scan {file_path}: {e}")
                            
        if potential_secrets:
            self.add_warning(f"Found {len(potential_secrets)} potential secrets in code")
            
        return {
            'success': len(potential_secrets) == 0,
            'potential_secrets': len(potential_secrets),
            'details': potential_secrets[:5]  # Limit details to first 5
        }
        
    def generate_quality_report(self) -> Dict[str, Any]:
        """Generate comprehensive quality report"""
        self.logger.info('Generating quality report...')
        
        # Run all quality checks
        code_quality = self.check_code_quality()
        performance_metrics = self.check_performance_metrics()
        security_metrics = self.check_security_metrics()
        
        # Calculate overall quality score
        category_scores = {
            'code_quality': code_quality.get('overall_score', 0),
            'performance': self.calculate_performance_score(performance_metrics),
            'security': self.calculate_security_score(security_metrics)
        }
        
        overall_score = sum(category_scores.values()) / len(category_scores)
        
        # Adjust quality score based on errors and warnings
        final_score = min(overall_score, self.quality_score)
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'overall_quality_score': final_score,
            'category_scores': category_scores,
            'code_quality': code_quality,
            'performance_metrics': performance_metrics,
            'security_metrics': security_metrics,
            'errors': self.errors,
            'warnings': self.warnings,
            'meets_threshold': final_score >= 9.5
        }
        
        # Save report
        try:
            with open(self.report_file, 'w') as f:
                json.dump(report, f, indent=2)
            self.logger.info(f'Quality report saved to {self.report_file}')
        except Exception as e:
            self.add_error(f'Failed to save quality report: {e}')
            
        return report
        
    def calculate_performance_score(self, performance_metrics: Dict[str, Any]) -> float:
        """Calculate performance score from metrics"""
        scores = []
        
        # Build time score
        build_time = performance_metrics.get('build_time', {})
        if build_time.get('success'):
            scores.append(10.0)
        elif build_time.get('build_time', 0) < 300:  # Under 5 minutes
            scores.append(7.0)
        else:
            scores.append(5.0)
            
        # Bundle size score
        bundle_size = performance_metrics.get('bundle_size', {})
        if bundle_size.get('success'):
            scores.append(10.0)
        else:
            scores.append(6.0)
            
        # Dependency audit score
        dep_audit = performance_metrics.get('dependency_audit', {})
        if dep_audit.get('success'):
            scores.append(10.0)
        else:
            scores.append(7.0)
            
        return sum(scores) / len(scores) if scores else 5.0
        
    def calculate_security_score(self, security_metrics: Dict[str, Any]) -> float:
        """Calculate security score from metrics"""
        scores = []
        
        for metric_name, metric_data in security_metrics.items():
            if metric_data.get('success'):
                scores.append(10.0)
            else:
                scores.append(6.0)
                
        return sum(scores) / len(scores) if scores else 5.0
        
    def start_continuous_monitoring(self, interval_minutes: int = 30):
        """Start continuous quality monitoring"""
        self.logger.info(f'Starting continuous quality monitoring (interval: {interval_minutes} minutes)')
        
        self.monitoring_active = True
        
        # Schedule periodic quality checks
        schedule.every(interval_minutes).minutes.do(self.run_quality_check)
        
        # Schedule daily comprehensive report
        schedule.every().day.at("09:00").do(self.generate_daily_report)
        
        # Run monitoring loop
        while self.monitoring_active:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    def stop_monitoring(self):
        """Stop continuous monitoring"""
        self.monitoring_active = False
        self.logger.info('Quality monitoring stopped')
        
    def run_quality_check(self):
        """Run periodic quality check"""
        self.logger.info('Running periodic quality check...')
        report = self.generate_quality_report()
        
        if not report['meets_threshold']:
            self.logger.warning(f"Quality threshold not met: {report['overall_quality_score']:.1f}/10")
            
    def generate_daily_report(self):
        """Generate daily quality report"""
        self.logger.info('Generating daily quality report...')
        report = self.generate_quality_report()
        
        # Save daily report with timestamp
        daily_report_file = f".trae/logs/daily-quality-{datetime.now().strftime('%Y-%m-%d')}.json"
        try:
            with open(daily_report_file, 'w') as f:
                json.dump(report, f, indent=2)
            self.logger.info(f'Daily report saved to {daily_report_file}')
        except Exception as e:
            self.add_error(f'Failed to save daily report: {e}')
            
    def print_summary(self, report: Dict[str, Any]):
        """Print quality report summary"""
        print('\n' + '='*50)
        print('VIBECODE V2.1 Quality Monitor Report')
        print('='*50)
        print(f"Overall Quality Score: {report['overall_quality_score']:.1f}/10.0")
        print(f"Meets Threshold (≥9.5): {'✅ YES' if report['meets_threshold'] else '❌ NO'}")
        print(f"Errors: {len(report['errors'])}")
        print(f"Warnings: {len(report['warnings'])}")
        
        print('\nCategory Scores:')
        for category, score in report['category_scores'].items():
            status = '✅' if score >= 8.0 else '⚠️' if score >= 6.0 else '❌'
            print(f"  {status} {category.replace('_', ' ').title()}: {score:.1f}/10")
            
        if report['errors']:
            print('\nErrors:')
            for i, error in enumerate(report['errors'][:5], 1):
                print(f"  {i}. {error}")
                
        if report['warnings']:
            print('\nWarnings:')
            for i, warning in enumerate(report['warnings'][:5], 1):
                print(f"  {i}. {warning}")
                
        print('\n' + '='*50)
        
def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='VIBECODE V2.1 Quality Monitor')
    parser.add_argument('--continuous', action='store_true', help='Run continuous monitoring')
    parser.add_argument('--interval', type=int, default=30, help='Monitoring interval in minutes')
    parser.add_argument('--report-only', action='store_true', help='Generate report only')
    
    args = parser.parse_args()
    
    monitor = QualityMonitor()
    
    try:
        if args.continuous:
            monitor.start_continuous_monitoring(args.interval)
        else:
            report = monitor.generate_quality_report()
            monitor.print_summary(report)
            
            # Exit with appropriate code
            sys.exit(0 if report['meets_threshold'] else 1)
            
    except KeyboardInterrupt:
        monitor.logger.info('Quality monitoring interrupted by user')
        monitor.stop_monitoring()
        sys.exit(0)
    except Exception as e:
        monitor.logger.error(f'Quality monitoring failed: {e}')
        sys.exit(1)
        
if __name__ == '__main__':
    main()