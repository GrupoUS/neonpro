# Claude Code Proactive Hooks - Workflow Examples

This directory contains example configurations for different types of proactive workflows that can be used with Claude Code's hook system. Each example demonstrates how to configure automatic command execution for specific development scenarios.

## 📋 Available Workflow Examples

### 1. 🔧 **Simple Workflow** (`simple-workflow.json`)
**Best for**: Personal projects, learning, quick prototyping

**What it does**:
- Runs basic linting after task completion
- Runs tests after plan completion
- Provides encouraging feedback messages
- Minimal configuration, maximum ease of use

**Use this if**: You want automatic code quality checks without complex configuration.

### 2. 💻 **Development Workflow** (`development-workflow.json`)
**Best for**: Active development projects, team collaboration

**What it does**:
- **After each task**: Runs ESLint → Tests → TypeScript checking
- **After plan completion**: Creates production build → Generates coverage reports
- Includes auto-fixing for common issues
- Comprehensive quality gates

**Use this if**: You're actively developing features and want comprehensive quality checks.

### 3. 🚀 **Deployment Workflow** (`deployment-workflow.json`)
**Best for**: Production deployments, CI/CD pipelines

**What it does**:
- **After each task**: Security audit → Quality checks → Production tests
- **After plan completion**: Build → Deploy to staging → Smoke tests → Deploy to production → Health checks
- Automatic rollback on failures
- Comprehensive monitoring and notifications

**Use this if**: You're deploying to production and need bulletproof reliability.

### 4. 🧪 **Testing-Focused Workflow** (`testing-workflow.json`)
**Best for**: Test-driven development, quality assurance

**What it does**:
- **After each task**: Unit tests → Changed file tests → Test linting
- **After plan completion**: Full test suite → Integration tests → E2E tests → Coverage reports → Performance tests
- Comprehensive test reporting
- Multiple test environment support

**Use this if**: Testing is critical to your project and you want comprehensive test automation.

## 🚀 Quick Start Guide

### Step 1: Choose Your Workflow
Pick the workflow example that best matches your project needs:
- **New to hooks?** → Start with `simple-workflow.json`
- **Active development?** → Use `development-workflow.json` 
- **Ready to deploy?** → Use `deployment-workflow.json`
- **Test-focused project?** → Use `testing-workflow.json`

### Step 2: Install the Configuration
```bash
# Copy your chosen workflow to the main hooks directory
cp .claude/hooks/examples/simple-workflow.json .claude/hooks/hook-config.json
```

### Step 3: Verify Your Scripts
Make sure your `package.json` has the scripts your chosen workflow needs:

**For Simple Workflow:**
```json
{
  "scripts": {
    "lint": "eslint src/",
    "test": "jest"
  }
}
```

**For Development Workflow:**
```json
{
  "scripts": {
    "lint": "eslint src/ --fix",
    "test": "jest --coverage",
    "build": "webpack --mode=production",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 4: Test It Out
1. Start working with Claude Code
2. Create a todo list with `TodoWrite`
3. Complete some tasks
4. Watch the hooks run automatically!
5. Check `.claude/hooks/claude-hooks.log` to see what happened

## ⚙️ Customization Guide

### Modifying Commands
Each workflow is highly customizable. Here's how to make common changes:

#### Adding New Commands
```json
{
  "taskCompletionCommands": {
    "onSuccess": [
      {
        "command": "npm",
        "args": ["run", "your-custom-script"],
        "timeout": 60,
        "continueOnFailure": true,
        "description": "Your custom command description"
      }
    ]
  }
}
```

#### Changing Timeouts
```json
{
  "command": "npm",
  "args": ["run", "slow-script"],
  "timeout": 300,  // 5 minutes instead of default
  "continueOnFailure": false
}
```

#### Adding Conditions
```json
{
  "command": "npm",
  "args": ["run", "docker-build"],
  "conditions": {
    "fileExists": "Dockerfile",
    "scriptExists": "docker-build"
  }
}
```

### Creating Custom Workflows

You can also create your own workflow by combining elements from the examples:

```json
{
  "title": "My Custom Workflow",
  "workflowType": "custom",
  "taskCompletionCommands": {
    "onSuccess": [
      // Take commands from development-workflow.json
    ]
  },
  "planCompletionCommands": {
    "onSuccess": [
      // Take commands from deployment-workflow.json
    ]
  }
}
```

## 📊 Understanding Workflow Phases

### Task Completion Phase
Triggered when a **subagent completes a task** (via `SubagentStop` hook):
- ✅ Good for: Quick quality checks, immediate feedback
- ⏱️ Keep it fast: Usually under 2 minutes total
- 🔄 Happens frequently: After every major task

### Plan Completion Phase
Triggered when an **entire plan finishes** (detected by `PostToolUse` hook):
- ✅ Good for: Comprehensive builds, deployments, final validation
- ⏱️ Can be slower: Up to 15-30 minutes for complex workflows
- 🔄 Happens rarely: Only when all planned work is complete

## 🛠️ Environment Setup

### Required Tools
Most workflows expect these tools to be available:
- **Node.js** (for npm commands)
- **Git** (for version control operations)

### Optional Tools (depending on your workflow):
- **Docker** (for containerized deployments)
- **TypeScript** (for type checking)
- **ESLint** (for code linting)
- **Jest/Mocha/etc** (for testing)

### Environment Variables
Some workflows use environment variables:
```bash
export NODE_ENV=development
export CI=false
export HOOK_DEBUG=1  # Enable verbose logging
```

## 📝 Workflow Configuration Reference

### Basic Structure
```json
{
  "taskCompletionCommands": {
    "always": [/* runs regardless of success/failure */],
    "onSuccess": [/* runs only if task succeeded */],
    "onFailure": [/* runs only if task failed */]
  },
  "planCompletionCommands": {
    "always": [/* runs regardless of success/failure */],
    "onSuccess": [/* runs only if plan succeeded */],
    "onFailure": [/* runs only if plan failed */]
  }
}
```

### Command Structure
```json
{
  "command": "npm",
  "args": ["run", "test"],
  "timeout": 60,
  "continueOnFailure": false,
  "description": "Run test suite",
  "conditions": {
    "fileExists": "package.json",
    "scriptExists": "test",
    "previousCommandSuccess": true
  }
}
```

### Available Conditions
- `fileExists`: Check if file exists before running
- `scriptExists`: Check if npm script exists in package.json
- `previousCommandSuccess`: Only run if previous command succeeded
- `environmentVariable`: Check environment variable value

## 🐛 Troubleshooting

### Common Issues

#### "Nothing happens when tasks complete"
1. Check that `.claude/hooks/hook-config.json` exists
2. Verify your `package.json` has the required scripts
3. Look at `.claude/hooks/claude-hooks.log` for error messages
4. Try the simple workflow first to test basic functionality

#### "Commands fail with 'not found' errors"
1. Make sure the required tools (npm, git, etc.) are installed
2. Check your PATH environment variable
3. Try running the commands manually to verify they work
4. Use absolute paths if necessary

#### "Hooks take too long to run"
1. Increase timeout values in your configuration
2. Set `continueOnFailure: true` for non-critical commands
3. Consider splitting long-running tasks into separate commands
4. Use parallel execution where possible

#### "Plan completion never triggers"
1. Check that you're using TodoWrite to create plans
2. Ensure tasks are completing successfully
3. Look for plan completion logs in claude-hooks.log
4. Try the simple workflow to test plan detection

### Debug Mode
Enable debug logging to see exactly what's happening:
```bash
export HOOK_DEBUG=1
```

Then check `.claude/hooks/claude-hooks.log` for detailed execution logs.

### Getting Help
1. Check the troubleshooting sections in each workflow example
2. Review the main hooks documentation in `.claude/hooks/README.md`
3. Enable debug logging and examine the log files
4. Start with the simple workflow to isolate issues

## 🎯 Best Practices

### For Beginners
1. **Start simple**: Use `simple-workflow.json` first
2. **Test locally**: Run commands manually before automating
3. **Check logs**: Always look at claude-hooks.log when things go wrong
4. **One change at a time**: Don't modify multiple things simultaneously

### For Advanced Users
1. **Layer your workflows**: Combine task and plan commands strategically
2. **Use conditions**: Prevent commands from running inappropriately
3. **Set appropriate timeouts**: Balance speed vs reliability
4. **Monitor performance**: Track how long your workflows take
5. **Plan for failures**: Use `continueOnFailure` and fallback commands

### For Teams
1. **Document your workflow**: Add descriptions to all commands
2. **Standardize scripts**: Ensure all team members have the same package.json scripts
3. **Version control**: Keep your hook-config.json in git
4. **Environment consistency**: Use the same Node.js, npm versions across the team

## 🔗 Related Documentation

- [Main Hooks README](../README.md) - Overview of the entire hook system
- [Hook Commons](../hook-commons.bat) - Shared utilities used by all hooks
- [Plan State Manager](../plan-state-manager.js) - Advanced state tracking system
- [Error Handler](../error-handler.bat) - Error handling and recovery system

## 📄 License & Contributing

These examples are part of the Claude Code Proactive Hooks system. Feel free to modify them for your specific needs or create new examples based on these templates.

---

**Happy coding with automated workflows! 🚀**