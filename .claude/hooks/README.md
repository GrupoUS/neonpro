# Claude Code Hooks - Simplified

Essential hook system for Claude Code integration with NEONPRO project.

## Files

- `pre-tool.bat` - Executes before each tool call
- `post-tool.bat` - Executes after each tool call  
- `session-stop.bat` - Handles session cleanup
- `commons.bat` - Shared utility functions
- `hook-config.json` - Hook configuration
- `claude-hooks.log` - Execution log (auto-generated)

## Environment Variables

- `CLAUDE_TOOL_NAME` - Current tool being executed
- `CLAUDE_TOOL_RESULT` - Result of tool execution
- `CLAUDE_SESSION_ID` - Current session identifier
- `CLAUDE_HOOK_PHASE` - Current hook phase (pre_tool_use/post_tool_use)

## Configuration

Use `hook-config.json` to configure:
- Task completion commands
- Logging settings
- Timeout values
- Error handling

## Logs

All hook activity is logged to `claude-hooks.log` with timestamp and status information.