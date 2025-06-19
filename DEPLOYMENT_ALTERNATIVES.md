# Alternativas de Deployment para Next.js

## 🌐 Plataformas Alternativas ao Vercel

### 1. **Netlify**
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Prós:**
- Suporte nativo para Next.js
- Build cache mais previsível
- Melhor controle sobre configurações

**Contras:**
- Pode requerer ajustes para ISR
- Limites mais restritivos no plano gratuito

### 2. **Railway**
```bash
# railway.json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

**Prós:**
- Deploy simples e rápido
- Suporte completo para Node.js
- Preços competitivos

**Contras:**
- Menos otimizações específicas para Next.js

### 3. **Render**
```yaml
# render.yaml
services:
  - type: web
    name: neonpro
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 20
```

**Prós:**
- Deploy automático do GitHub
- SSL gratuito
- Boa documentação

### 4. **Docker + Cloud Run/ECS**
```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**Prós:**
- Controle total sobre o ambiente
- Portabilidade entre clouds
- Escalabilidade enterprise

**Contras:**
- Mais complexo de configurar
- Requer conhecimento de Docker

## 🔧 Configuração Universal para Todas as Plataformas

```javascript
// next.config.universal.js
const nextConfig = {
  // Configurações que funcionam em qualquer plataforma
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Desabilitar telemetria
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## 📊 Comparação de Custos (USD/mês)

| Plataforma | Gratuito | Pro | Enterprise |
|------------|----------|-----|------------|
| Vercel | $0 (hobby) | $20 | Custom |
| Netlify | $0 (starter) | $19 | Custom |
| Railway | $5 credit | $20 | Custom |
| Render | $0 (static) | $7 | Custom |
| AWS/GCP | Variável | Variável | Variável |

## 🚀 Recomendação

Para resolver o problema do Vercel imediatamente:
1. Use a configuração webpack fornecida
2. Limpe o cache do build
3. Se persistir, considere Railway ou Render como alternativas rápidas
4. Para projetos enterprise, considere containerização com Docker