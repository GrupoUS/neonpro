
/**
 * Supabase MCP Server Verification Script
 * Verifies the MCP configuration and connectivity
 */

const fs = require("node:fs");
const path = require("node:path");

// Check MCP configuration file
const mcpConfigPath = path.join(__dirname, "../../../.cursor/mcp.json");

try {
  if (fs.existsSync(mcpConfigPath)) {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));

    if (mcpConfig.mcpServers?.["supabase-mcp"]) {
      const supabaseMcp = mcpConfig.mcpServers["supabase-mcp"];

      // Check environment variables
      if (supabaseMcp.env.SUPABASE_URL && supabaseMcp.env.SUPABASE_ANON_KEY) {
      } else {
      }
    } else {
    }
  } else {
  }
} catch (_error) {}

const packageJsonPath = path.join(__dirname, "../package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (packageJson.dependencies["@supabase/supabase-js"]) {
  }

  if (packageJson.dependencies["@supabase/ssr"]) {
  }
}

const clientFiles = [
  "app/utils/supabase/client.ts",
  "app/utils/supabase/server.ts",
  "contexts/auth-context.tsx",
  "supabase-url-config.json",
];

clientFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
  } else {
  }
});

const docsFiles = [
  "docs/supabase-mcp-setup.md",
  "docs/oauth-setup-checklist.md",
  "docs/production-deployment-guide.md",
];

docsFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
  } else {
  }
});
