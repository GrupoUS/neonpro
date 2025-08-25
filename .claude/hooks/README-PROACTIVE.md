# Claude Code Proactive Hooks System - Complete Guide

## 🚀 Overview

The Claude Code Proactive Hooks System is a comprehensive automation framework that automatically executes commands when tasks complete and plans finish. This revolutionary system transforms your development workflow by providing intelligent, context-aware command execution without manual intervention.

### 🎯 Key Features

- **🔄 Automatic Command Execution**: Commands run automatically when tasks complete and plans finish
- **📊 Intelligent Plan Tracking**: Advanced JSON-based state management tracks your entire workflow
- **🛡️ Robust Error Handling**: Comprehensive error recovery with retry logic and fallback strategies
- **⚙️ Flexible Configuration**: Easy-to-customize JSON configurations for any workflow
- **🔍 Plan Completion Detection**: Smart detection of when multi-step plans are fully completed
- **📝 Comprehensive Logging**: Detailed execution logs with performance metrics
- **🏗️ Cross-Platform Support**: Works on Windows with batch files and Node.js integration

### 🌟 What Makes This Revolutionary

Unlike traditional hooks that just log events, our proactive system:
- **Detects Plan Completion**: Knows when your entire multi-step plan is done, not just individual tasks
- **Executes Contextual Commands**: Runs different commands based on project type, success/failure, and completion phase
- **Provides Intelligent Recovery**: Automatically retries failed commands and provides fallback strategies
- **Maintains State Across Sessions**: Advanced state management tracks progress across multiple Claude Code sessions

## 🏗️ System Architecture

### Hook Components

#### 1. **Pre-Tool-Use Hook** (`pre-tool-use.bat`)
- **Triggers**: Before each tool execution
- **Purpose**: Plan initialization detection, environment preparation
- **Key Features**:
  - Detects TodoWrite usage (plan initialization)
  - Prepares execution environment
  - Validates conditions before tool execution
  - Sets up plan tracking infrastructure

#### 2. **Post-Tool-Use Hook** (`post-tool-use.bat`)
- **Triggers**: After each tool execution
- **Purpose**: Plan progression tracking, completion detection
- **Key Features**:
  - Tracks tool usage patterns
  - Detects plan completion through multiple indicators
  - Updates plan state throughout execution
  - Executes plan completion commands automatically

#### 3. **Subagent Stop Hook** (`subagent-stop.bat`)
- **Triggers**: When a subagent completes execution
- **Purpose**: Task completion command execution
- **Key Features**:
  - Executes proactive commands after task completion
  - Supports project-specific workflows (Node.js, Python, Rust)
  - Provides immediate feedback and quality checks
  - Integrates with error handling system

#### 4. **Session Stop Hook** (`session-stop.bat`)
- **Triggers**: When Claude Code session ends
- **Purpose**: Final cleanup, summarization, archival
- **Key Features**:
  - Generates comprehensive session summaries
  - Executes final completion workflows
  - Archives session data for future reference
  - Performs cleanup and maintenance

### Supporting Systems

#### 🧠 **Plan State Manager** (`plan-state-manager.js` + `.bat`)
Advanced Node.js-based state management system providing:
- Real-time plan state tracking with JSON persistence
- Timeline event logging and analysis
- Task progress monitoring and metrics
- Plan completion detection algorithms
- State backup and recovery capabilities
- Performance analytics and reporting

#### 🛠️ **Shared Utilities** (`hook-commons.bat`)
Common functionality used by all hooks:
- Centralized logging and error reporting
- Configuration file management
- Command execution with timeout handling
- Environment variable management
- Cross-platform path handling

#### ⚠️ **Error Handler** (`error-handler.bat`)
Comprehensive error handling and recovery system:
- Multi-level error severity assessment
- Automatic retry with exponential backoff
- Fallback command execution
- System health monitoring
- Recovery mode activation for critical failures

## ⚙️ Configuration System

### Main Configuration File (`hook-config.json`)

The heart of the proactive system is the `hook-config.json` file that defines what commands to run and when:

```json
{
  "taskCompletionCommands": {
    "always": [/* Commands that always run after task completion */],
    "onSuccess": [/* Commands for successful task completion */],
    "onFailure": [/* Commands for failed task completion */]
  },
  "planCompletionCommands": {
    "always": [/* Commands that always run after plan completion */],
    "onSuccess": [/* Commands for successful plan completion */],
    "onFailure": [/* Commands for failed plan completion */]
  }
}
```

### Settings Integration (`settings.local.json`)

Enhanced hook configuration in Claude Code settings:
```json
{
  "hooks": {
    "PreToolUse": [/* Pre-execution hooks with retry logic */],
    "PostToolUse": [/* Post-execution hooks with plan tracking */],
    "SubagentStop": [/* Task completion hooks with proactive commands */],
    "Stop": [/* Session completion hooks */]
  },
  "hookConfiguration": {
    "enableProactiveCommands": true,
    "enablePlanTracking": true,
    "enableErrorRecovery": true,
    "maxRetries": 3,
    "defaultTimeout": 60
  }
}
```

## 🚀 Quick Start Guide

### Step 1: Choose Your Workflow
Select from our pre-built workflow examples:
- **Simple Workflow**: Basic linting and testing
- **Development Workflow**: Comprehensive quality checks
- **Deployment Workflow**: Production deployment pipeline
- **Testing Workflow**: Comprehensive test automation

```bash
# Copy a workflow example
cp .claude/hooks/examples/development-workflow.json .claude/hooks/hook-config.json
```

### Step 2: Verify Your Environment
Ensure you have the required tools:
```bash
# Check Node.js (required for advanced state management)
node --version

# Check npm (for most workflows)
npm --version

# Check git (for version control integration)
git --version
```

### Step 3: Configure Your Scripts
Add the required scripts to your `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src/ --fix",
    "test": "jest --coverage",
    "build": "webpack --mode=production"
  }
}
```

### Step 4: Test the System
1. Start a Claude Code session
2. Use TodoWrite to create a plan with multiple tasks
3. Complete tasks and watch the proactive commands execute automatically
4. Check `.claude/hooks/claude-hooks.log` for execution details

## 💻 Usage Examples

### Basic Development Workflow

When you complete a development task, the system automatically:
1. **Runs ESLint** to check code quality
2. **Executes tests** to ensure functionality
3. **Performs type checking** (if TypeScript)
4. **Provides success/failure feedback**

When your entire plan completes, the system automatically:
1. **Creates a production build**
2. **Generates test coverage reports**
3. **Runs comprehensive quality checks**
4. **Notifies you of completion status**

### Advanced Deployment Workflow

For production deployments, the system provides:
1. **Security audits** before any deployment
2. **Staging deployment** with smoke tests
3. **Production deployment** with health checks
4. **Automatic rollback** on failure detection
5. **Comprehensive monitoring** and alerting

### Example Session Flow

```
1. User creates TodoWrite with development tasks
   → Pre-Tool-Use: Initializes plan tracking
   
2. User completes first task (e.g., implement feature)
   → Subagent-Stop: Runs lint + tests automatically
   
3. User completes second task (e.g., write tests)
   → Subagent-Stop: Runs quality checks automatically
   
4. All todos completed, plan finished
   → Post-Tool-Use: Detects completion, runs build automatically
   
5. Session ends
   → Session-Stop: Generates summary, archives data
```

## 🔧 Advanced Configuration

### Custom Command Configuration

```json
{
  "command": "npm",
  "args": ["run", "custom-script"],
  "timeout": 120,
  "continueOnFailure": false,
  "description": "Custom script description",
  "conditions": {
    "fileExists": "package.json",
    "scriptExists": "custom-script",
    "previousCommandSuccess": true
  },
  "environment": {
    "NODE_ENV": "production",
    "CUSTOM_VAR": "value"
  }
}
```

### Conditional Execution

Commands can have conditions that determine when they run:
- **fileExists**: Only run if specific file exists
- **scriptExists**: Only run if npm script exists
- **previousCommandSuccess**: Only run if previous command succeeded
- **environmentVariable**: Check environment variable values

### Error Handling Strategies

Configure how the system handles failures:
```json
{
  "errorHandling": {
    "stopOnFirstFailure": false,
    "notifyOnFailure": true,
    "maxRetries": 3,
    "retryDelay": 2000,
    "fallbackCommands": [
      {
        "command": "echo",
        "args": ["Fallback: Primary command failed"]
      }
    ]
  }
}
```

## 📊 Plan Completion Detection

### How It Works

The system uses multiple indicators to detect plan completion:
1. **Todo Activity Monitoring**: Tracks TodoWrite usage patterns
2. **Tool Usage Analysis**: Identifies completion-indicating tools
3. **Task Progression Tracking**: Monitors subagent completion rates
4. **Build/Test Pattern Recognition**: Detects final workflow steps
5. **Inactivity Detection**: Identifies when work has stopped

### Completion Criteria

A plan is considered complete when at least 3 of these conditions are met:
- All tracked tasks have completed
- No TodoWrite activity for specified period
- Build/test commands have been executed
- All active subagents have finished
- File writing activity has ceased

### Customizing Detection

```json
{
  "planCompletionDetection": {
    "enabled": true,
    "inactivityTimeout": 300,
    "minimumCompletionIndicators": 3,
    "toolPatterns": [
      "npm.*build",
      "npm.*test",
      "deploy"
    ]
  }
}
```

## 🛡️ Error Handling & Recovery

### Error Severity Levels

1. **Minor (Level 1)**: Simple retry with short delay
2. **Moderate (Level 2-3)**: Retry with exponential backoff, fallback commands
3. **Critical (Level 4+)**: Emergency recovery, system reset, notifications

### Recovery Strategies

- **Simple Retry**: For transient failures
- **Exponential Backoff**: For resource-related issues
- **Fallback Commands**: Alternative commands when primary fails
- **System Reset**: Clean slate recovery for critical failures
- **Emergency Stop**: Halt all hook activity if necessary

### Monitoring & Alerting

The error handling system provides:
- Real-time error tracking and classification
- System health monitoring and reporting
- Performance metrics and bottleneck identification
- Automatic recovery execution and verification

## 📝 Logging & Monitoring

### Log Files

- **`claude-hooks.log`**: Main execution log with all hook activity
- **`error-log.txt`**: Detailed error information and stack traces
- **`recovery-log.txt`**: Recovery attempt logs and outcomes
- **`system-health.txt`**: System health metrics and monitoring data
- **`tool-usage.log`**: Tool execution tracking and patterns
- **`plan-timeline.log`**: Complete timeline of plan execution

### Log Analysis

```bash
# View recent hook activity
tail -f .claude/hooks/claude-hooks.log

# Check for errors
grep "ERROR" .claude/hooks/error-log.txt

# Monitor plan progression
tail -f .claude/hooks/.cache/plan-timeline.log

# View performance metrics
cat .claude/hooks/.cache/hook-performance.log
```

### State Inspection

```bash
# Check current plan state
node .claude/hooks/plan-state-manager.js load

# View plan summary
node .claude/hooks/plan-state-manager.js summary

# Check completion status
node .claude/hooks/plan-state-manager.js check-completion
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Commands Don't Execute
**Problem**: Hook system is active but commands don't run
**Solutions**:
- Verify `hook-config.json` exists and is valid JSON
- Check that required npm scripts exist in `package.json`
- Ensure Node.js is available in PATH
- Check `claude-hooks.log` for error messages

#### 2. Plan Completion Never Detected
**Problem**: Individual tasks work but plan completion doesn't trigger
**Solutions**:
- Ensure you're using TodoWrite to create plans
- Check plan state with `plan-state-manager.js summary`
- Verify completion detection settings in configuration
- Look for plan tracking logs in `.cache/plan-timeline.log`

#### 3. Commands Take Too Long
**Problem**: Hook execution is slow or times out
**Solutions**:
- Increase timeout values in hook configurations
- Enable parallel execution where possible
- Optimize npm scripts for speed
- Use `continueOnFailure: true` for non-critical commands

#### 4. Error Recovery Not Working
**Problem**: Failures aren't handled gracefully
**Solutions**:
- Check error handler configuration
- Verify retry settings and fallback commands
- Ensure error thresholds are appropriate
- Review error classification in `error-log.txt`

#### 5. State Management Issues
**Problem**: Plan state becomes corrupted or inconsistent
**Solutions**:
- Use state manager reset: `plan-state-manager.js reset`
- Check for Node.js availability and permissions
- Verify `.cache` directory is writable
- Review state backups in `.cache/state-backups/`

### Debug Mode

Enable verbose logging for troubleshooting:
```bash
# Windows
set HOOK_DEBUG=1

# Then run Claude Code and check detailed logs
```

### System Health Check

```bash
# Run comprehensive system health check
.claude/hooks/error-handler.bat health-check

# Reset system to safe state if needed
.claude/hooks/error-handler.bat reset
```

## 📈 Performance Optimization

### Best Practices

1. **Optimize Command Timeouts**: Set realistic timeouts for each command
2. **Use Conditional Execution**: Avoid running unnecessary commands
3. **Enable Parallel Processing**: Where safe, run commands concurrently
4. **Implement Smart Caching**: Cache build outputs and test results
5. **Monitor Resource Usage**: Track memory and CPU consumption

### Performance Metrics

The system tracks:
- Hook execution times
- Command success/failure rates
- Plan completion detection accuracy
- Resource usage patterns
- Error recovery effectiveness

## 🔄 Integration Examples

### CI/CD Integration

Configure hooks to work with your CI/CD pipeline:
```json
{
  "taskCompletionCommands": {
    "onSuccess": [
      {"command": "git", "args": ["add", "."]},
      {"command": "git", "args": ["commit", "-m", "Auto-commit: Task completed"]},
      {"command": "git", "args": ["push", "origin", "feature-branch"]}
    ]
  }
}
```

### Docker Integration

For containerized development:
```json
{
  "planCompletionCommands": {
    "onSuccess": [
      {"command": "docker", "args": ["build", "-t", "myapp", "."]},
      {"command": "docker", "args": ["run", "--rm", "myapp", "npm", "test"]},
      {"command": "docker", "args": ["tag", "myapp", "myapp:latest"]}
    ]
  }
}
```

### Testing Framework Integration

For comprehensive testing workflows:
```json
{
  "taskCompletionCommands": {
    "onSuccess": [
      {"command": "npm", "args": ["run", "test:unit"]},
      {"command": "npm", "args": ["run", "test:integration"]},
      {"command": "npm", "args": ["run", "test:e2e"]}
    ]
  }
}
```

## 🎯 Best Practices

### For Development Teams

1. **Standardize Configurations**: Use version-controlled hook configurations
2. **Document Workflows**: Include descriptions for all commands
3. **Test Locally**: Verify hooks work before sharing with team
4. **Monitor Performance**: Track hook execution times and optimize
5. **Handle Failures Gracefully**: Always provide fallback strategies

### For Individual Developers

1. **Start Simple**: Begin with basic workflows before adding complexity
2. **Customize Gradually**: Add features as you become comfortable
3. **Monitor Logs**: Regularly check execution logs
4. **Backup Configurations**: Keep copies of working configurations
5. **Stay Updated**: Follow best practices as the system evolves

### For Production Deployments

1. **Use Deployment Workflows**: Never skip security and quality checks
2. **Implement Rollback Strategies**: Always have a way to revert changes
3. **Monitor Health**: Set up proper health checking and alerting
4. **Test in Staging**: Verify deployments in staging environment first
5. **Document Procedures**: Maintain runbooks for common scenarios

## 🚀 Future Enhancements

### Planned Features

- **Visual Workflow Designer**: GUI for creating and editing workflows
- **Machine Learning Integration**: AI-powered optimization of hook execution
- **Real-time Dashboard**: Live monitoring of hook system performance
- **Advanced Analytics**: Detailed insights into development patterns
- **Multi-language Support**: Support for Python, Go, Java workflows
- **Cloud Integration**: Integration with cloud deployment platforms

### Extensibility

The system is designed for easy extension:
- Add new hook types by creating additional batch files
- Extend state management with custom Node.js modules
- Create custom command types and execution strategies
- Integrate with external monitoring and notification systems

## 📚 API Reference

### Plan State Manager API

```bash
# Initialize new plan
plan-state-manager.js init [planData]

# Update plan state
plan-state-manager.js update "{\"status\":\"running\"}"

# Add timeline event
plan-state-manager.js timeline "task_completed" "{\"task\":\"build\"}"

# Track tool usage
plan-state-manager.js track-tool "npm" "success" "5000"

# Check completion status
plan-state-manager.js check-completion

# Finalize plan
plan-state-manager.js finalize "completed"
```

### Error Handler API

```bash
# Handle error with recovery
error-handler.bat handle "component" "error message" "1" "retry"

# Run system health check
error-handler.bat health-check

# Reset to safe state
error-handler.bat reset
```

## 📄 File Structure Reference

```
.claude/hooks/
├── README-PROACTIVE.md          # This comprehensive guide
├── hook-config.json             # Main configuration file
├── hook-commons.bat             # Shared utilities
├── pre-tool-use.bat            # Plan initialization hook
├── post-tool-use.bat           # Plan tracking hook
├── subagent-stop.bat           # Task completion hook
├── session-stop.bat            # Session cleanup hook
├── plan-state-manager.js       # Advanced state management
├── plan-state-manager.bat      # State management wrapper
├── error-handler.bat           # Error handling system
├── claude-hooks.log            # Main execution log
├── examples/                   # Workflow examples
│   ├── README.md              # Examples guide
│   ├── simple-workflow.json   # Basic workflow
│   ├── development-workflow.json  # Development workflow
│   ├── deployment-workflow.json   # Deployment workflow
│   └── testing-workflow.json      # Testing workflow
└── .cache/                     # Runtime data
    ├── current-plan-state.json    # Current plan state
    ├── state-backups/             # State backups
    ├── sessions/                  # Session archives
    └── *.log                      # Various activity logs
```

## 🤝 Contributing

We welcome contributions to improve the Claude Code Proactive Hooks System:

1. **Report Issues**: Use the GitHub issue tracker for bugs and feature requests
2. **Submit Examples**: Share your workflow configurations with the community
3. **Improve Documentation**: Help make the guides clearer and more comprehensive
4. **Contribute Code**: Submit pull requests for enhancements and fixes

## 📞 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the examples in the `examples/` directory
3. Enable debug logging and examine log files
4. Search existing GitHub issues
5. Create a new issue with detailed information

---

**Transform your development workflow with intelligent, proactive automation! 🚀**

*The Claude Code Proactive Hooks System - Where automation meets intelligence.*