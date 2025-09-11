# 🔧 Vercel + Hono Framework Detection Troubleshooting
*Complete guide for resolving Vercel framework detection issues with Hono APIs*

## 🚨 Issue Overview

**Symptom**: API endpoints return web app responses instead of Hono API responses
**Root Cause**: Vercel auto-detects monorepo as Next.js despite correct configuration
**Impact**: Complete API functionality loss in production

---

## 🔍 Diagnosis Checklist

### 1. **Confirm Framework Detection Issue**

Run diagnostic commands to identify the problem:

```bash
# Test API endpoint directly
curl -v https://your-app.vercel.app/api/health

# Expected (Hono): {"status":"ok"}
# Actual (Next.js): {"status":"healthy","service":"neonpro-web",...}
```

### 2. **Check Response Headers**

Look for Next.js artifacts in headers:
```bash
curl -I https://your-app.vercel.app/api/health

# ❌ Next.js Detection Indicators:
# vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch
# x-matched-path: /api/health

# ✅ Correct Hono Response Should Have:
# content-type: application/json
# No Next.js specific headers
```

### 3. **Verify Vercel Project Settings**

```bash
# Check project configuration
vercel project ls

# Framework should show "Other", NOT "Next.js"
```

---

## 🛠️ Resolution Methods

### Method 1: **Dashboard Framework Reset** (Primary Solution)

1. **Access Vercel Dashboard**:
   - Go to your project in Vercel Dashboard
   - Navigate to **Settings** → **General**

2. **Reset Framework Preset**:
   - Find **Framework Preset** section
   - Change from "Next.js" to **"Other"**
   - Save changes

3. **Clear Cache and Redeploy**:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Select **"Use existing build cache"** → **OFF**
   - Click **"Redeploy"**

4. **Verification**:
   ```bash
   # Wait 2-3 minutes for propagation
   curl https://your-app.vercel.app/api/health
   # Should now return: {"status":"ok"}
   ```

### Method 2: **Configuration Override** (If Method 1 Fails)

1. **Ensure Correct vercel.json**:
   ```json
   {
     "version": 2,
     "framework": null,  // CRITICAL: Must be null
     "buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api",
     "outputDirectory": "apps/web/dist",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/index.ts" }
     ]
   }
   ```

2. **Force Framework Override**:
   ```bash
   # Deploy with explicit framework override
   vercel --prod --build-env FRAMEWORK=null
   ```

### Method 3: **Fresh Project Deployment** (Nuclear Option)

If cache issues persist, deploy to a fresh Vercel project:

1. **Create New Project**:
   ```bash
   vercel --name neonpro-v2 --prod
   ```

2. **Configure Environment Variables**:
   ```bash
   # Copy from original project
   vercel env pull .env.backup --project original-project
   vercel env push .env.backup --project neonpro-v2
   ```

3. **Test and Switch**:
   ```bash
   # Test new deployment
   ./scripts/simple-smoke-test.sh https://neonpro-v2.vercel.app
   
   # If successful, update DNS/domain
   vercel domains add your-domain.com --project neonpro-v2
   ```

---

## ⚡ Prevention Strategies

### 1. **Repository Structure Optimization**

Minimize framework detection conflicts:

```
neonpro/
├── vercel.json           # Root configuration with framework: null
├── api/                  # API function entry point
│   └── index.ts         # export default app
├── apps/
│   ├── web/             # React app (separate build)
│   └── api/             # Hono API source
└── .vercelignore        # Exclude conflicting files
```

### 2. **Deployment-Time Validation**

Add validation to CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Validate Framework Detection
  run: |
    RESPONSE=$(curl -s https://${{ steps.deploy.outputs.url }}/api/health)
    if echo "$RESPONSE" | grep -q '"status":"ok"'; then
      echo "✅ Hono API detected correctly"
    else
      echo "❌ Framework detection issue - rolling back"
      exit 1
    fi
```

### 3. **Monitoring & Alerts**

Set up continuous monitoring:

```bash
# Add to cron job or monitoring service
#!/bin/bash
RESPONSE=$(curl -s https://your-app.vercel.app/api/health)
if [[ "$RESPONSE" != *'"status":"ok"'* ]]; then
  # Send alert - framework detection issue detected
  echo "ALERT: Framework detection issue detected"
  ./scripts/rollback.sh
fi
```

---

## 📋 Common Patterns & Anti-Patterns

### ✅ Correct Patterns:

**vercel.json Configuration**:
```json
{
  "version": 2,
  "framework": null,                    // MUST be null
  "buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api",
  "outputDirectory": "apps/web/dist",   // Static files only
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ]
}
```

**API Export Pattern**:
```typescript
// api/index.ts
import { app } from '../apps/api/src/app'
export default app  // Default export required
```

**Hono App Structure**:
```typescript
// apps/api/src/app.ts
import { Hono } from 'hono'
const app = new Hono()
app.get('/api/health', (c) => c.json({ status: 'ok' }))
export { app }
```

### ❌ Anti-Patterns to Avoid:

**Wrong Framework Setting**:
```json
{
  "framework": "nextjs",  // ❌ Causes conflicts
  "framework": "vite",    // ❌ Also causes issues
}
```

**Wrong Export Pattern**:
```typescript
// ❌ Named export doesn't work
export { app } from '../apps/api/src/app'

// ❌ Re-export pattern fails
export * from '../apps/api/src/app'
```

**Conflicting Routing**:
```typescript
// ❌ Don't create /api routes in web app
// apps/web/src/pages/api/health.ts - This conflicts!
```

---

## 🧪 Testing & Validation

### Automated Detection Test:

```bash
#!/bin/bash
# framework-detection-test.sh

DEPLOYMENT_URL="$1"
if [[ -z "$DEPLOYMENT_URL" ]]; then
  echo "Usage: $0 <deployment-url>"
  exit 1
fi

echo "🔍 Testing framework detection for: $DEPLOYMENT_URL"

# Test API endpoint
RESPONSE=$(curl -s "$DEPLOYMENT_URL/api/health")
HEADERS=$(curl -s -I "$DEPLOYMENT_URL/api/health")

# Check for Hono response
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo "✅ Correct Hono API response detected"
else
  echo "❌ Wrong response (likely Next.js): $RESPONSE"
  exit 1
fi

# Check for Next.js artifacts in headers
if echo "$HEADERS" | grep -q "Next-Router\|RSC"; then
  echo "❌ Next.js headers detected in API response"
  exit 1
else
  echo "✅ No Next.js artifacts in headers"
fi

echo "🎉 Framework detection is correct!"
```

### Manual Verification Steps:

1. **API Response Test**:
   ```bash
   curl https://your-app.vercel.app/api/health
   # Expected: {"status":"ok"}
   ```

2. **Headers Inspection**:
   ```bash
   curl -I https://your-app.vercel.app/api/health
   # Should NOT contain: Next-Router, RSC headers
   ```

3. **Function Tab Verification**:
   - Go to Vercel Dashboard → Functions
   - Verify `api/index.ts` shows as deployed function
   - Check function logs for Hono initialization

4. **Performance Test**:
   ```bash
   time curl https://your-app.vercel.app/api/health
   # Should be < 1 second
   ```

---

## 📊 Monitoring Dashboard

### Key Metrics to Track:

1. **Response Validation**:
   - API endpoints returning correct JSON format
   - No Next.js artifacts in responses
   - Consistent response times

2. **Function Health**:
   - `api/index.ts` function active status
   - Function execution logs
   - Cold start times

3. **Framework Detection**:
   - Project framework setting = "Other"
   - Build logs showing correct commands
   - No Next.js build artifacts

### Alerting Rules:

```bash
# Example monitoring script
#!/bin/bash
# monitor-framework-detection.sh

URL="https://your-app.vercel.app"
WEBHOOK_URL="your-slack-webhook-url"

# Test API response
RESPONSE=$(curl -s "$URL/api/health")
if [[ "$RESPONSE" != *'"status":"ok"'* ]]; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Framework detection issue detected on '$URL'"}' \
    "$WEBHOOK_URL"
fi
```

---

## 🎯 Success Criteria

### Framework Detection Resolution Confirmed When:

- ✅ API `/health` returns `{"status":"ok"}`
- ✅ API `/v1/health` returns structured health data
- ✅ No Next.js headers in API responses
- ✅ Vercel Functions tab shows `api/index.ts` active
- ✅ Response times < 1 second for API endpoints
- ✅ All smoke tests pass (>95% success rate)

### Long-term Stability Indicators:

- ✅ Framework setting remains "Other" after deployments
- ✅ Build logs show correct Turbo commands
- ✅ No Next.js artifacts in function output
- ✅ Consistent API performance over time

---

## 📞 Escalation Path

### If Resolution Methods Fail:

1. **Immediate**: Use rollback procedures
2. **Short-term**: Deploy to fresh Vercel project
3. **Medium-term**: Contact Vercel Support (if Pro plan)
4. **Long-term**: Consider alternative deployment platforms

### Support Resources:

- **Internal**: Development team escalation
- **External**: Vercel Support (Pro plan required)
- **Community**: GitHub Issues for reproducible bugs
- **Documentation**: Always refer back to this guide

---

Remember: Framework detection issues are configuration problems, not code problems. The solution is always in deployment settings, not application code.