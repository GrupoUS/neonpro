# MCP Server Configuration

This document explains how to configure the MCP servers used in this project.

## Environment Variables Required

After the security fix to remove hardcoded secrets from `.vscode/.mcp.json`, you need to set the following environment variables:

### API Keys and Tokens

Create a `.env` file in the project root with the following variables:

```bash
# Exa Search API
EXA_API_KEY=your_exa_api_key_here

# Tavily Search API  
TAVILY_API_KEY=your_tavily_api_key_here

# Upstash Context7 API
UPSTASH_CONTEXT7_API_KEY=your_upstash_context7_api_key_here

# Supabase Access Token
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here

# GitHub Personal Access Token (for shadcn-ui component access)
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_personal_access_token_here
```

## Where to Get API Keys

- **EXA_API_KEY**: Get from [Exa.ai](https://exa.ai) 
- **TAVILY_API_KEY**: Get from [Tavily](https://tavily.com)
- **UPSTASH_CONTEXT7_API_KEY**: Get from [Upstash Context7](https://context7.dev)
- **SUPABASE_ACCESS_TOKEN**: Get from your [Supabase dashboard](https://supabase.com/dashboard)
- **GITHUB_PERSONAL_ACCESS_TOKEN**: Create in [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

## Security Notes

- The `.env` file is already included in `.gitignore` to prevent accidental commits
- Never commit API keys or tokens to version control
- Use environment-specific values for different deployment environments
- Regularly rotate API keys for enhanced security

## Configuration Structure

The MCP configuration in `.vscode/.mcp.json` now uses environment variable substitution:

```json
"env": {
  "API_KEY": "${env:API_KEY_NAME}"
}
```

This ensures sensitive data stays out of the codebase while maintaining functionality.