# VIBECODE V2.1 Scripts Documentation

## 🚀 Overview

This directory contains the complete suite of VIBECODE V2.1 automation scripts designed to ensure ≥9.5/10 quality standards across all development phases. These scripts implement the mandatory protocols defined in `user_rules.md` and provide comprehensive automation for the NeonPro project.

## 📁 Script Inventory

### 🔧 Core Infrastructure Scripts

#### 1. `install-mcps.cmd`
**Purpose**: Install mandatory Model Context Protocols (MCPs)
- **Type**: Windows Batch Script
- **Quality Target**: 100% MCP installation success
- **Dependencies**: npm, Node.js
- **Execution**: `install-mcps.cmd`
- **Critical**: ✅ Yes

**MCPs Installed**:
- `sequential-thinking` - Complex problem-solving
- `desktop-commander` - File operations
- `context7-mcp` - Documentation and APIs
- `tavily-mcp` - Research with validation
- `exa-mcp` - Advanced web search

#### 2. `verify-config.js`
**Purpose**: VIBECODE V2.1 Configuration Validator
- **Type**: Node.js Script
- **Quality Target**: ≥9.5/10
- **Execution**: `node verify-config.js`
- **Critical**: ✅ Yes

**Validation Checks**:
- Node.js environment (≥16.x)
- Project structure integrity
- Environment variables
- Package dependencies
- MCP configuration

#### 3. `validate-mcps.js`
**Purpose**: MCP Functionality Validator
- **Type**: Node.js Script
- **Quality Target**: 100% MCP success rate
- **Execution**: `node validate-mcps.js`
- **Critical**: ✅ Yes

**Validation Features**:
- Individual MCP server testing
- Mode-specific chain validation (PLAN/ACT/RESEARCH)
- Comprehensive JSON reporting
- Real-time status monitoring

#### 4. `trae-system-validator.py`
**Purpose**: Comprehensive System Validator
- **Type**: Python Script
- **Quality Target**: ≥9.7/10
- **Execution**: `python trae-system-validator.py`
- **Critical**: ✅ Yes

**System Checks**:
- Python environment validation
- File system integrity
- Network connectivity
- Performance metrics (CPU, Memory, Disk)
- Security configuration

### ⚡ Performance & Optimization Scripts

#### 5. `optimize-performance.js`
**Purpose**: Automated Performance Optimizer
- **Type**: Node.js Script
- **Quality Target**: ≥9.0/10
- **Execution**: `node optimize-performance.js`
- **Critical**: ⚠️ No

**Optimization Areas**:
- `package.json` performance scripts
- Next.js configuration (gzip, SWC, etc.)
- Tailwind CSS optimization
- TypeScript configuration
- Bundle analysis
- Temporary file cleanup

#### 6. `quality-monitor.py`
**Purpose**: Continuous Quality Monitoring
- **Type**: Python Script
- **Quality Target**: ≥9.5/10
- **Execution**: `python quality-monitor.py [--continuous] [--interval 30]`
- **Critical**: ✅ Yes

**Monitoring Features**:
- Real-time code quality assessment
- Performance metrics tracking
- Security vulnerability scanning
- Automated reporting
- Continuous monitoring mode
- Daily quality reports

### 🔒 Security & Analysis Scripts

#### 7. `security-analyzer.py`
**Purpose**: Comprehensive Security Analyzer
- **Type**: Python Script
- **Quality Target**: ≥9.8/10
- **Execution**: `python security-analyzer.py`
- **Critical**: ✅ Yes

**Security Checks**:
- Source code pattern scanning
- Hardcoded secrets detection
- SQL injection vulnerabilities
- XSS vulnerability patterns
- Environment security
- Dependency vulnerability audit
- Configuration file security

### 🧪 Testing & Quality Assurance Scripts

#### 8. `run-tests.js`
**Purpose**: Comprehensive Test Runner
- **Type**: Node.js Script
- **Quality Target**: ≥9.6/10
- **Execution**: `node run-tests.js`
- **Critical**: ✅ Yes

**Test Types**:
- TypeScript type checking
- ESLint code quality
- Unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright/Cypress)
- Test coverage analysis

### 📚 Documentation & Deployment Scripts

#### 9. `generate-docs.js`
**Purpose**: Automated Documentation Generator
- **Type**: Node.js Script
- **Quality Target**: ≥9.3/10
- **Execution**: `node generate-docs.js`
- **Critical**: ⚠️ No

**Documentation Types**:
- API documentation
- Component documentation
- Project overview
- Development guides

#### 10. `deploy-automation.js`
**Purpose**: Automated Deployment Pipeline
- **Type**: Node.js Script
- **Quality Target**: ≥9.8/10
- **Execution**: `node deploy-automation.js`
- **Critical**: ⚠️ No

**Deployment Features**:
- Pre-deployment quality gates
- Multi-platform support (Vercel, Netlify)
- Automated testing
- Post-deployment validation
- Comprehensive reporting

### 🎯 Central Orchestration Script

#### 11. `vibecode-runner.js`
**Purpose**: Main VIBECODE V2.1 Orchestrator
- **Type**: Node.js Script
- **Quality Target**: ≥9.5/10
- **Execution**: `node vibecode-runner.js [MODE] [OPTIONS]`
- **Critical**: ✅ Yes

**Execution Modes**:
- `PLAN` - Planning and architecture
- `ACT` - Implementation and development
- `RESEARCH` - Research and analysis
- `FULL` - Complete VIBECODE execution

## 🎮 Usage Guide

### Quick Start

```bash
# Complete VIBECODE V2.1 execution
node .trae/scripts/vibecode-runner.js FULL

# Development mode
node .trae/scripts/vibecode-runner.js ACT

# Planning mode
node .trae/scripts/vibecode-runner.js PLAN

# Research mode
node .trae/scripts/vibecode-runner.js RESEARCH
```

### Individual Script Execution

```bash
# Install MCPs
.trae/scripts/install-mcps.cmd

# Validate configuration
node .trae/scripts/verify-config.js

# Run comprehensive tests
node .trae/scripts/run-tests.js

# Monitor quality continuously
python .trae/scripts/quality-monitor.py --continuous --interval 30

# Security analysis
python .trae/scripts/security-analyzer.py

# Performance optimization
node .trae/scripts/optimize-performance.js
```

### Advanced Usage

```bash
# Environment validation only
node .trae/scripts/vibecode-runner.js --validate

# Show configuration
node .trae/scripts/vibecode-runner.js --config

# Help and usage
node .trae/scripts/vibecode-runner.js --help
```

## 📊 Quality Gates & Thresholds

| Script | Quality Target | Critical | Timeout |
|--------|---------------|----------|----------|
| install-mcps | 100% success | ✅ | 5 min |
| verify-config | ≥9.5/10 | ✅ | 1 min |
| validate-mcps | 100% success | ✅ | 2 min |
| trae-system-validator | ≥9.7/10 | ✅ | 3 min |
| optimize-performance | ≥9.0/10 | ⚠️ | 2 min |
| security-analyzer | ≥9.8/10 | ✅ | 3 min |
| generate-docs | ≥9.3/10 | ⚠️ | 2 min |
| run-tests | ≥9.6/10 | ✅ | 10 min |
| quality-monitor | ≥9.5/10 | ✅ | 5 min |
| deploy-automation | ≥9.8/10 | ⚠️ | 15 min |

## 🔄 Mode-Specific Script Chains

### PLAN Mode
**MCP Chain**: sequential-thinking → context7-mcp → tavily-mcp → exa-mcp
**Scripts**: verify-config → validate-mcps → trae-system-validator → generate-docs

### ACT Mode
**MCP Chain**: context7-mcp → desktop-commander → sequential-thinking
**Scripts**: verify-config → validate-mcps → optimize-performance → run-tests → quality-monitor

### RESEARCH Mode
**MCP Chain**: exa-mcp → tavily-mcp → context7-mcp → sequential-thinking
**Scripts**: verify-config → validate-mcps → security-analyzer → quality-monitor

### FULL Mode
**MCP Chain**: All MCPs integrated
**Scripts**: All scripts in optimal sequence

## 📁 File Structure

```
.trae/
├── scripts/
│   ├── install-mcps.cmd
│   ├── verify-config.js
│   ├── validate-mcps.js
│   ├── trae-system-validator.py
│   ├── optimize-performance.js
│   ├── security-analyzer.py
│   ├── generate-docs.js
│   ├── run-tests.js
│   ├── quality-monitor.py
│   ├── deploy-automation.js
│   ├── vibecode-runner.js
│   └── README.md
├── logs/
│   ├── vibecode-execution.log
│   ├── quality-monitor.log
│   ├── deployment.log
│   └── *.json (reports)
└── vibecode.config.json
```

## 🚨 Error Handling & Recovery

### Critical Script Failures
- **Immediate Stop**: Execution halts on critical script failure
- **Error Logging**: Detailed error logs in `.trae/logs/`
- **Quality Impact**: Each error reduces quality score by 0.5
- **Recovery**: Manual intervention required for critical failures

### Non-Critical Script Failures
- **Continue Execution**: Non-critical failures don't stop execution
- **Warning Logging**: Warnings logged with reduced quality impact
- **Quality Impact**: Each warning reduces quality score by 0.1
- **Recovery**: Automatic retry mechanisms where applicable

## 📈 Reporting & Monitoring

### Execution Reports
- **Location**: `.trae/logs/vibecode-execution-report.json`
- **Format**: Structured JSON with detailed metrics
- **Content**: Quality scores, execution times, errors, warnings
- **Frequency**: After each execution

### Quality Reports
- **Location**: `.trae/logs/quality-report.json`
- **Format**: Comprehensive quality assessment
- **Content**: Code quality, performance, security metrics
- **Frequency**: Configurable (default: every 30 minutes)

### Daily Reports
- **Location**: `.trae/logs/daily-quality-YYYY-MM-DD.json`
- **Format**: Daily quality summary
- **Content**: Trend analysis, quality evolution
- **Frequency**: Daily at 09:00

## 🔧 Configuration

### Main Configuration File
**Location**: `.trae/vibecode.config.json`

```json
{
  "version": "2.1",
  "qualityThreshold": 9.5,
  "scripts": {
    "script-name": {
      "enabled": true,
      "command": "node",
      "args": [".trae/scripts/script.js"],
      "timeout": 60000,
      "critical": true
    }
  },
  "modes": {
    "MODE_NAME": {
      "description": "Mode description",
      "scripts": ["script1", "script2"],
      "mcpChain": ["mcp1", "mcp2"]
    }
  }
}
```

## 🛠️ Prerequisites

### System Requirements
- **Node.js**: ≥16.x
- **Python**: ≥3.8
- **npm**: Latest version
- **Operating System**: Windows (primary), Linux/macOS (compatible)

### Dependencies
- **Node.js packages**: Installed via `npm install`
- **Python packages**: `requests`, `json`, `subprocess`
- **MCP servers**: Installed via `install-mcps.cmd`

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   .trae/scripts/install-mcps.cmd
   ```

2. **Validate Environment**:
   ```bash
   node .trae/scripts/vibecode-runner.js --validate
   ```

3. **Run Full VIBECODE**:
   ```bash
   node .trae/scripts/vibecode-runner.js FULL
   ```

4. **Monitor Quality**:
   ```bash
   python .trae/scripts/quality-monitor.py --continuous
   ```

## 📞 Support & Troubleshooting

### Common Issues

1. **MCP Installation Failures**:
   - Check npm connectivity
   - Verify Node.js version
   - Run `npm cache clean --force`

2. **Python Script Errors**:
   - Verify Python installation
   - Check required packages
   - Ensure proper file permissions

3. **Quality Threshold Not Met**:
   - Review error logs in `.trae/logs/`
   - Check individual script outputs
   - Address critical failures first

### Log Locations
- **Main Log**: `.trae/logs/vibecode-execution.log`
- **Quality Log**: `.trae/logs/quality-monitor.log`
- **Deployment Log**: `.trae/logs/deployment.log`
- **Reports**: `.trae/logs/*.json`

---

## 🎯 VIBECODE V2.1 Compliance

✅ **Mandatory MCP Integration**: All scripts support MCP chains  
✅ **Quality Threshold ≥9.5/10**: Enforced across all scripts  
✅ **Enhanced 7-Step Workflow**: Implemented in orchestration  
✅ **Batch Operations**: Optimized for ≥70% API call reduction  
✅ **Desktop Commander Protocols**: Integrated file operations  
✅ **Memory Bank Integration**: Persistent quality tracking  
✅ **AI Safety Framework**: Security-first approach  
✅ **Performance Research Workflow**: Comprehensive optimization  

**🚨 ABSOLUTE COMPLIANCE**: All scripts strictly follow `C:\Users\Mauri\.trae\user_rules.md` protocols with zero tolerance for deviations.

---

*VIBECODE V2.1 - Autonomous Excellence Through Intelligent Automation*