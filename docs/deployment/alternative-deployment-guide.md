# Alternative API Deployment Guide

## 🎯 Overview

This guide provides alternative deployment strategies for the NeonPro API when Vercel framework conflicts prevent proper API function deployment.

## 🚨 Problem Summary

**Issue**: Vercel treats the project as Next.js despite all configuration changes, causing API endpoints to return 404 or web app responses.

**Root Cause**: Persistent framework detection cache and configuration overrides that cannot be cleared through standard methods.

**Solution**: Deploy API separately using alternative platforms while keeping the web app on Vercel.

---

## 🚀 OPTION 1: Railway Deployment (Recommended)

### Why Railway?
- ✅ No framework detection conflicts
- ✅ Simple configuration
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ Easy environment variable management

### Deployment Steps

1. **Prepare Railway Configuration**
   ```bash
   # railway.json is already created in project root
   ```

2. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_supabase_url
   railway variables set SUPABASE_ANON_KEY=your_anon_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key
   railway variables set JWT_SECRET=your_jwt_secret
   railway variables set ENCRYPTION_KEY=your_encryption_key
   ```

4. **Update Web App Configuration**
   ```typescript
   // In web app environment variables
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```

---

## 🚀 OPTION 2: Docker + Any Platform

### Platforms Supporting Docker
- **Render**: Simple, automatic deployments
- **Fly.io**: Global edge deployment
- **DigitalOcean App Platform**: Managed container service
- **Google Cloud Run**: Serverless containers
- **AWS ECS/Fargate**: Enterprise-grade containers

### Deployment Steps

1. **Build Docker Image**
   ```bash
   docker build -f Dockerfile.api -t neonpro-api .
   ```

2. **Test Locally**
   ```bash
   docker run -p 3004:3004 \
     -e NODE_ENV=production \
     -e SUPABASE_URL=your_url \
     -e SUPABASE_ANON_KEY=your_key \
     neonpro-api
   ```

3. **Deploy to Platform**
   
   **Render Example:**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: neonpro-api
       env: docker
       dockerfilePath: ./Dockerfile.api
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 3004
   ```

   **Fly.io Example:**
   ```toml
   # fly.toml
   app = "neonpro-api"
   
   [build]
     dockerfile = "Dockerfile.api"
   
   [[services]]
     http_checks = []
     internal_port = 3004
     processes = ["app"]
     protocol = "tcp"
   ```

---

## 🚀 OPTION 3: Separate Vercel Project

### When to Use
- Want to keep everything on Vercel
- Have access to create new Vercel projects
- Can manage multiple deployments

### Steps

1. **Create New Vercel Project**
   ```bash
   # Use the prepared script
   ./scripts/deploy-api-separate.sh
   ```

2. **Manual Alternative**
   ```bash
   # Create temporary directory
   mkdir /tmp/neonpro-api
   
   # Copy API files
   cp -r apps/api/* /tmp/neonpro-api/
   cp api/* /tmp/neonpro-api/api/
   cp api-vercel.json /tmp/neonpro-api/vercel.json
   
   # Deploy
   cd /tmp/neonpro-api
   vercel --prod
   ```

---

## 🔧 Configuration Updates

### Web App Environment Variables

After deploying the API to an alternative platform, update the web app:

```bash
# Vercel environment variables for web app
VITE_API_URL=https://your-api-domain.com/api
VITE_API_BASE_URL=https://your-api-domain.com
```

### CORS Configuration

Update the API CORS settings to allow the web app domain:

```typescript
// In apps/api/src/app.ts
app.use('*', cors({
  origin: [
    'https://neonpro.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
```

---

## 📊 Testing Alternative Deployment

### Health Check Script

```bash
#!/bin/bash
API_URL="https://your-api-domain.com"

echo "Testing API deployment..."

# Test health endpoint
curl -s "$API_URL/api/health" | jq .

# Test v1 health endpoint  
curl -s "$API_URL/api/v1/health" | jq .

# Test OpenAPI endpoint
curl -s "$API_URL/api/openapi.json" | jq .

echo "API deployment test completed!"
```

### Integration Test

```bash
# Run the API resolution test against new deployment
npx tsx tools/testing/api-resolution-test.ts https://your-api-domain.com
```

---

## 🎯 Success Criteria

After alternative deployment:

✅ **API Endpoints Accessible**
- `/api/health` returns `{"status":"ok"}`
- `/api/v1/health` returns detailed health info
- `/api/openapi.json` returns OpenAPI spec

✅ **Web App Integration**
- Web app can communicate with API
- CORS configured correctly
- Authentication working

✅ **Performance**
- API response times <500ms
- Health checks passing
- Error handling working

---

## 🚨 Rollback Plan

If alternative deployment fails:

1. **Revert Web App Environment Variables**
   ```bash
   # Point back to original (non-working) API
   VITE_API_URL=/api
   ```

2. **Continue Troubleshooting Vercel**
   - Try manual cache clearing in dashboard
   - Contact Vercel support
   - Consider recreating Vercel project

---

## 📞 Next Steps

1. **Choose Platform**: Railway (recommended) or Docker-based platform
2. **Deploy API**: Follow platform-specific steps
3. **Update Web App**: Configure environment variables
4. **Test Integration**: Verify all endpoints work
5. **Monitor**: Set up monitoring and alerts

The alternative deployment approach ensures the API is functional while maintaining the web app on Vercel, providing a complete working solution.
