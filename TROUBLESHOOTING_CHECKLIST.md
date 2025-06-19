# ✅ Checklist de Troubleshooting - Erro process/browser no Vercel

## 🔍 Diagnóstico Rápido

### 1. Verificações Iniciais
- [ ] O erro aparece apenas no Vercel ou também localmente?
- [ ] Qual versão do Next.js está sendo usada? (15.x tem mais problemas)
- [ ] O arquivo `next.config.ts` tem `output: "standalone"`?
- [ ] As dependências de polyfill estão instaladas?

### 2. Soluções Imediatas

#### A. Configuração do next.config.ts
```typescript
// ❌ REMOVER
output: "standalone"

// ✅ ADICIONAR
webpack: (config, { webpack }) => {
  config.resolve.fallback = {
    process: require.resolve("process/browser"),
    buffer: require.resolve("buffer"),
  };
  
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );
  
  return config;
}
```

#### B. Limpeza de Cache (Dashboard Vercel)
1. Vá para o projeto no Vercel
2. Settings → Environment Variables
3. Adicione: `VERCEL_FORCE_NO_BUILD_CACHE = 1`
4. Ou use o botão "Redeploy" desmarcando "Use existing build cache"

#### C. Dependências Necessárias
```bash
npm install --save process buffer util url querystring-es3
```

### 3. Soluções Alternativas

#### Opção 1: Build Local + Deploy
```bash
# Build localmente
npm run build

# Deploy apenas os arquivos
vercel --prod --prebuilt
```

#### Opção 2: Configuração Mínima
```javascript
// next.config.js simples
module.exports = {
  // Sem experimental features
  // Sem output standalone
  // Apenas o essencial
}
```

#### Opção 3: Downgrade Temporário
```json
{
  "dependencies": {
    "next": "14.2.3", // Versão mais estável
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

### 4. Verificação de Logs

```bash
# Logs detalhados do Vercel
vercel logs [deployment-url] --output raw

# Verificar erros específicos
vercel logs [deployment-url] | grep -i "process\|browser\|webpack"
```

### 5. Scripts de Emergência

#### Reset Completo
```bash
# reset.sh
#!/bin/bash
rm -rf node_modules .next .vercel package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

#### Deploy Limpo
```bash
# clean-deploy.sh
#!/bin/bash
export VERCEL_FORCE_NO_BUILD_CACHE=1
vercel --prod --force --no-cache
```

### 6. Quando Nada Funciona

1. **Trocar de Plataforma Temporariamente**
   - Railway: `railway up`
   - Render: Push para GitHub com render.yaml
   - Netlify: `netlify deploy --prod`

2. **Contatar Suporte**
   - Vercel Status: https://vercel-status.com
   - GitHub Issues: Reportar com logs completos
   - Discord/Forum: Comunidade pode ter soluções

3. **Rollback de Emergência**
   - Use última versão funcional
   - `vercel rollback [deployment-id]`

## 🎯 Solução Definitiva Recomendada

1. Use a configuração webpack completa (arquivo next.config.solution.ts)
2. Limpe TODOS os caches
3. Instale dependências explicitamente
4. Deploy com `--force` flag
5. Se falhar, mude temporariamente para Railway/Render

## 📝 Prevenção Futura

- Sempre teste builds localmente antes de fazer push
- Mantenha dependências atualizadas gradualmente
- Use CI/CD com testes de build
- Tenha uma plataforma de backup configurada
- Documente configurações que funcionam