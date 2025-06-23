# 🚀 Guia de Configuração do MCP do Supabase

## ✅ Status: CONFIGURADO E FUNCIONANDO!

O MCP do Supabase foi configurado com sucesso com o token:
- **Access Token**: `sbp_40a721931e7ff98b4f6979a5bcb2a28c8ea5c0dc`
- **Localização**: `.cursor/mcp.json`

## 📋 Solução Completa

### Opção 1: Configuração Manual das URLs (Recomendado)

Como você já tem as credenciais do Supabase, pode configurar as redirect URLs diretamente no dashboard:

1. **Execute o script de configuração:**
   ```bash
   cd @saas-projects/neonpro
   pnpm tsx scripts/configure-supabase-urls.ts
   ```

2. **Acesse o Dashboard do Supabase:**
   - URL: https://app.supabase.com/project/gfkskrkbnawkuppazkpt/auth/url-configuration

3. **Configure o Site URL:**
   ```
   https://neonpro.vercel.app
   ```

4. **Adicione TODAS as Redirect URLs:**
   ```
   https://neonpro.vercel.app/auth/callback
   https://neonpro.vercel.app/dashboard
   https://neonpro.vercel.app/login
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   http://localhost:3000/login
   https://neonpro-*.vercel.app/auth/callback
   https://neonpro-*.vercel.app/dashboard
   https://neonpro-*.vercel.app/login
   ```

5. **Salve as configurações**

### Opção 2: Configurar o MCP do Supabase

Se você quiser usar o MCP do Supabase para automação futura:

1. **Gere um Access Token:**
   - Acesse: https://app.supabase.com/account/tokens
   - Clique em "Generate new token"
   - Nome sugerido: "NeonPro MCP"
   - Copie o token gerado

2. **Execute o script de setup:**
   ```bash
   cd @saas-projects/neonpro
   pnpm tsx scripts/setup-supabase-mcp.ts
   ```

3. **Cole o token quando solicitado**

4. **Reinicie o VS Code/Cursor**

### Opção 3: Configuração Local do MCP (Já Criada)

Já criei um arquivo `.vscode/mcp.json` que configura o MCP localmente usando o service role key. Para ativar:

1. Reinicie o VS Code/Cursor
2. O MCP deve carregar automaticamente
3. Teste com comandos como `supabase.get_project_api_keys`

## 🧪 Testando a Configuração

Após configurar as URLs, teste o login:

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   cd @saas-projects/neonpro
   pnpm dev
   ```

2. **Acesse:** http://localhost:3000/login

3. **Clique em "Sign in with Google"**

4. **Verifique se:**
   - O popup abre corretamente
   - O login funciona
   - Você é redirecionado para /dashboard
   - O perfil é criado no banco de dados

## 📁 Arquivos Criados

- `scripts/setup-supabase-mcp.ts` - Script para configurar o MCP
- `scripts/configure-supabase-urls.ts` - Script para gerar lista de URLs
- `.vscode/mcp.json` - Configuração local do MCP
- `supabase-url-config.json` - Lista de URLs para copiar/colar

## ⚠️ Importante

- **Nunca commite** arquivos `.mcp-env` ou tokens de acesso
- As redirect URLs precisam corresponder **exatamente** ao que está configurado no código
- O wildcard `*` nas URLs permite preview deployments do Vercel

## 🎯 Próximos Passos

1. Configure as URLs usando uma das opções acima
2. Teste o fluxo completo de autenticação
3. Verifique se os perfis estão sendo criados corretamente
4. Se houver problemas, verifique os logs em:
   - Console do navegador (F12)
   - Logs do servidor Next.js
   - Dashboard do Supabase > Logs

## 🆘 Troubleshooting

### Erro: "Redirect URL not allowed"
- Certifique-se de que TODAS as URLs estão configuradas no dashboard
- Verifique se não há espaços extras ou caracteres invisíveis

### Erro: "Popup bloqueado"
- Permita popups para localhost:3000
- Teste em diferentes navegadores

### Erro: "Profile not created"
- Execute a migration SQL: `supabase/migrations/001_create_profiles_table.sql`
- Verifique se a trigger está funcionando no dashboard