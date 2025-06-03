# Regras de Integração Supabase - Projeto NeonPro

## Segurança Obrigatória
- NUNCA commitar arquivos .env com credenciais
- SEMPRE usar RLS policies em todas as tabelas
- SEMPRE validar inputs antes de queries SQL

## Padrões de Desenvolvimento
- Use sempre MCP tools para operações de banco
- Mantenha tipos TypeScript sincronizados com schema
- Implemente error boundaries para operações async

## Troubleshooting
- Use get_logs MCP tool antes de debug manual
- Documente erros recorrentes neste arquivo
- Mantenha backup antes de migrations major
