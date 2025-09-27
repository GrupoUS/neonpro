# Chrome MCP Tools Setup Guide for WSL + Windows

## Overview
This guide explains how to configure Chrome MCP tools to work with Chrome running on Windows while using WSL (Ubuntu).

## Prerequisites
- Chrome installed on Windows
- WSL with Ubuntu installed
- MCP tools configured

## Setup Instructions

### 1. Start Chrome with Remote Debugging

**Option A: Use the provided script**
1. Open Windows PowerShell or Command Prompt
2. Navigate to your project directory
3. Run: `scripts\start-chrome-debug.bat`

**Option B: Manual command**
```powershell
# In Windows PowerShell/Command Prompt
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-allow-origins=*
```

### 2. Verify Chrome Debugging Status
```bash
# In WSL terminal
./scripts/check-chrome-debug.sh
```

### 3. MCP Configuration
The MCP configuration has been updated at `~/.mcp.json` with:

```json
{
  "chrome-devtools": {
    "command": "bunx",
    "args": [
      "chrome-devtools-mcp@latest",
      "--chrome-host",
      "localhost",
      "--chrome-port",
      "9222"
    ],
    "env": {
      "CHROME_HOST": "localhost",
      "CHROME_PORT": "9222",
      "WSL_HOST_ACCESS": "true"
    },
    "type": "stdio"
  }
}
```

## Testing Chrome MCP Tools

### Test Basic Connection
```bash
# Check if Chrome debugging is accessible
curl http://localhost:9222/json
```

### Test Chrome DevTools Protocol
1. Open Chrome with debugging enabled
2. Visit: http://localhost:9222
3. You should see a list of open tabs/pages

## Troubleshooting

### Chrome not accessible
- Ensure Chrome is running with debugging flags
- Check Windows Firewall allows port 9222
- Verify Chrome is not running in guest mode

### MCP connection issues
- Restart MCP client/server
- Check Chrome debugging port is accessible
- Verify Chrome debugging endpoint responds

### Network issues
- WSL can access Windows localhost as `localhost`
- If issues persist, try using Windows host IP instead

## Useful Commands

```bash
# Check Chrome status
./scripts/check-chrome-debug.sh

# Test direct connection
curl http://localhost:9222/json

# View open tabs
curl -s http://localhost:9222/json | jq '.[].url' 2>/dev/null || curl -s http://localhost:9222/json
```

## Tips

- Keep Chrome running with debugging enabled for MCP tools to work
- You can use Chrome normally while debugging is enabled
- Multiple Chrome instances: use different ports (e.g., 9223, 9224)
- The debugging session persists until Chrome is closed