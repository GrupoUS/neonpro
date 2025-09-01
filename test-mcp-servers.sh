#\!/bin/bash
source .env

echo "🚀 MCP SERVER COMPREHENSIVE TEST"
echo "================================="

# Test each server with proper timeout and error handling
test_server() {
    local name="$1"
    local command="$2"
    echo "Testing $name..."
    timeout 5 $command > /dev/null 2>&1
    if [ $? -eq 124 ]; then
        echo "✅ $name: Server started successfully (timed out as expected)"
    elif [ $? -eq 0 ]; then
        echo "✅ $name: Server responded successfully"
    else
        echo "❌ $name: Failed to start"
    fi
}

# Test stdio-based servers
test_server "Exa" "bunx exa-mcp-server@latest"
test_server "Sequential Thinking" "bunx @modelcontextprotocol/server-sequential-thinking@latest"
test_server "Tavily" "bunx @mcptools/mcp-tavily@latest"
test_server "Context7" "bunx @upstash/context7-mcp@latest"
test_server "Desktop Commander" "bunx @wonderwhy-er/desktop-commander@latest"
test_server "Supabase" "bunx @supabase/mcp-server-supabase@latest --access-token ${SUPABASE_ACCESS_TOKEN}"
test_server "Shadcn-UI" "bunx @jpisnice/shadcn-ui-mcp-server@latest"

# Test network connectivity
echo ""
echo "🌐 NETWORK CONNECTIVITY TESTS"
echo "=============================="
curl -s --connect-timeout 3 https://mcp.vercel.com > /dev/null && echo "✅ Vercel MCP: Network reachable" || echo "❌ Vercel MCP: Network unreachable"
curl -s --connect-timeout 3 http://localhost:8051/mcp > /dev/null && echo "✅ Archon: Local server reachable" || echo "❌ Archon: Local server unreachable"

echo ""
echo "✅ MCP SERVER TEST COMPLETED"
