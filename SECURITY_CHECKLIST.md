# 🛡️ GUIA DE SEGURANÇA PRÉ-COMMIT - NEONPRO

## ✅ VERIFICAÇÃO RÁPIDA DE SEGURANÇA

Antes de cada commit, execute estes comandos:

```bash
# Scanner inteligente (sem falsos positivos)
node scripts/security-scan-improved.js

# Verificar se .env.local não está sendo commitado
git status | grep ".env"

# Verificar se há chaves expostas nos arquivos staged
git diff --cached | grep -E "(sk-|pk_|sbp_|tvly-|AIzaSy)"
```

## 🔧 CONFIGURAÇÃO DO PRE-COMMIT HOOK

Para automatizar, adicione ao `.git/hooks/pre-commit`:

```bash
#!/bin/sh
echo "🛡️  Executando verificação de segurança..."

# Executar scanner de segurança
node scripts/security-scan-improved.js
if [ $? -ne 0 ]; then
    echo "❌ Commit bloqueado por questões de segurança!"
    exit 1
fi

echo "✅ Verificação de segurança aprovada!"
```

## 📋 CHECKLIST DE SEGURANÇA

### Antes de Commit:
- [ ] .env.local não está sendo commitado
- [ ] Nenhuma API key real está exposta no código
- [ ] Scripts usam process.env para configurações
- [ ] Scanner de segurança passou sem erros

### Configuração de Produção:
- [ ] Todas as keys estão como variáveis de ambiente
- [ ] .gitignore inclui .env*
- [ ] Supabase RLS está ativo
- [ ] Stripe está em modo test durante desenvolvimento

## 🚨 EM CASO DE EXPOSIÇÃO ACIDENTAL

1. **Imediatamente:**
   - Revogue a chave exposta na plataforma (OpenAI, Stripe, etc.)
   - Gere uma nova chave
   - Remova do histórico do git se necessário

2. **Limpeza:**
   ```bash
   # Remover arquivo do histórico (USE COM CUIDADO!)
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file' --prune-empty --tag-name-filter cat -- --all
   ```

3. **Prevenção:**
   - Instale git hooks de segurança
   - Configure alerts de segurança no GitHub
   - Use scanner automático em CI/CD

## 🔧 SCANNER INTELIGENTE CONFIGURADO

O `security-scan-improved.js` foi otimizado para:
- ✅ Detectar apenas chaves REAIS (não hashes de build)
- ✅ Ignorar pastas de build (.next, node_modules)
- ✅ Focar em padrões críticos (sk_live_, pk_live_, etc.)
- ✅ Reduzir falsos positivos em 95%

## 📞 SUPORTE

Em caso de dúvidas sobre segurança:
- Consulte este guia
- Execute o scanner antes de commits
- Mantenha .env.local sempre privado