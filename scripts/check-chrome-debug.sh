#!/bin/bash

# Chrome Debugging Status Checker for WSL + Windows Chrome
# This script checks if Chrome is running with remote debugging enabled

echo "Checking Chrome debugging status..."
echo "=================================="

# Check if Chrome debugging port is accessible
if nc -z localhost 9222 2>/dev/null; then
    echo "✅ Chrome debugging port (9222) is accessible"
    
    # Try to get Chrome debugging info
    echo "📊 Getting Chrome debugging information..."
    if curl -s http://localhost:9222/json | grep -q "webSocketDebuggerUrl"; then
        echo "✅ Chrome DevTools Protocol is responding"
        
        # Count open tabs/pages
        page_count=$(curl -s http://localhost:9222/json | grep '"type": "page"' | wc -l)
        echo "📄 Found $page_count open page(s) in Chrome"
        
        echo ""
        echo "🌐 Available debugging endpoints:"
        echo "   Main debugger: http://localhost:9222"
        echo "   JSON endpoint: http://localhost:9222/json"
        echo ""
        
        # Show first few pages if available
        if [ "$page_count" -gt 0 ]; then
            echo "📋 Open pages:"
            curl -s http://localhost:9222/json | grep -o '"url":"[^"]*"' | head -3 | sed 's/"url":"//;s/"$//' | while read url; do
                echo "   - $url"
            done
        fi
        
    else
        echo "❌ Chrome DevTools Protocol is not responding properly"
        echo "💡 Chrome might be running but not with proper debugging flags"
    fi
else
    echo "❌ Chrome debugging port (9222) is not accessible"
    echo ""
    echo "📋 To fix this:"
    echo "1. Open PowerShell or Command Prompt in Windows (as Administrator)"
    echo "2. Run the exact command:"
    echo "   \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --remote-debugging-port=9222 --remote-allow-origins=*"
    echo "3. Or run the corrected script: scripts/start-chrome-debug.bat"
    echo ""
    echo "🔧 Note: Make sure Chrome is not already running when starting with debugging flags"
    echo ""
    echo "📋 Alternative PowerShell command:"
    echo "   & 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' --remote-debugging-port=9222 --remote-allow-origins=*"
fi

echo ""
echo "💡 Tip: Keep Chrome running with debugging enabled for MCP tools to work"
echo "📚 MCP Chrome DevTools server should now be able to connect when Chrome is running with debugging"