# Consolidação de Infraestrutura - Paths Atualizados

## 🗂️ Nova Estrutura de Infraestrutura

A partir desta migração, toda a infraestrutura foi consolidada em uma única pasta organizada:

```
infrastructure/
├── database/
│   ├── config/
│   │   ├── config.toml        # Configuração do Supabase (antes: supabase/config.toml)
│   │   └── .gitignore         # Gitignore do Supabase
│   └── migrations/            # Todas as migrations consolidadas (89 arquivos)
├── functions/                 # Edge Functions do Supabase
│   ├── stock-alerts-processor/
│   ├── stock-reports-generator/
│   └── subscription-billing-processor/
└── scripts/                   # Scripts de setup, testes e configuração
```

## 📋 Pastas Removidas

- ❌ `E:\neonpro\supabase/` (conteúdo movido para infrastructure/)
- ❌ `E:\neonpro\infrastructure\supabase/` (duplicata removida)
- ❌ `E:\neonpro\prisma/` (continha apenas schema_temp.prisma temporário)

## 🔄 Redirects Necessários

### Para arquivos de configuração:

```bash
# ANTES
./supabase/config.toml
# AGORA
./infrastructure/database/config/config.toml
```

### Para Edge Functions:

```bash
# ANTES
./supabase/functions/stock-alerts-processor/
# AGORA
./infrastructure/functions/stock-alerts-processor/
```

### Para migrations:

```bash
# ANTES
./supabase/migrations/ (89 arquivos)
./infrastructure/supabase/migrations/ (20 arquivos - desatualizada)
# AGORA
./infrastructure/database/migrations/ (todas as 89 migrations consolidadas)
```

## ✅ Benefícios da Consolidação

1. **Eliminação de Duplicações**: Removidas duplicações de config.toml, .gitignore e migrations
2. **Organização Melhorada**: Estrutura hierárquica clara e lógica
3. **Centralização**: Toda infraestrutura em um local único
4. **Facilidade de Manutenção**: Menos pontos de configuração para gerenciar
5. **Consistência**: Uma única fonte de verdade para configurações

## 🔧 Próximos Passos

Verificar e atualizar referências nos seguintes arquivos de configuração:

- `turbo.json`
- `pnpm-workspace.yaml`
- Scripts de deployment
- Arquivos de configuração do Supabase CLI
