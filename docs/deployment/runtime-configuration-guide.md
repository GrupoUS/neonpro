# Vercel Runtime Configuration: Node.js vs Edge Runtime

## 🎯 **RUNTIME STRATEGY FOR NEONPRO**

### ✅ **RECOMMENDED DEFAULT: Node.js 20.x**

For NeonPro's Hono + Prisma + Supabase stack, **Node.js 20.x runtime is the optimal choice** due to:

- ✅ **Full Prisma Compatibility**: Complete ORM functionality including connection pooling
- ✅ **Supabase Integration**: Full Node.js client support and PostgREST compatibility  
- ✅ **Healthcare Compliance**: Complete filesystem access for audit logs and LGPD compliance
- ✅ **Performance Libraries**: Access to native modules for encryption and data processing
- ✅ **Memory Management**: Higher memory limits for complex queries and file processing

## 📊 **RUNTIME COMPARISON MATRIX**

| Feature | Node.js 20.x | Edge Runtime | Recommendation |
|---------|--------------|--------------|----------------|
| **Cold Start** | ~800ms | ~50ms | ⚡ Edge wins |
| **Memory Limit** | 1024MB | 128MB | 🗄️ Node.js wins |
| **Execution Time** | 60s | 30s | ⏱️ Node.js wins |
| **Prisma ORM** | ✅ Full Support | ⚠️ Limited | 🗄️ Node.js wins |
| **Supabase Client** | ✅ Full Client | ✅ Basic Client | 🤝 Tie |
| **File System** | ✅ Full Access | ❌ Read-only | 📁 Node.js wins |
| **Native Modules** | ✅ Full Support | ❌ Limited | 🔧 Node.js wins |
| **Streaming** | ✅ Full Support | ✅ Optimized | 🌊 Edge optimized |
| **Global Distribution** | Regional | Global | 🌍 Edge wins |

## ⚙️ **CURRENT CONFIGURATION**

### **Optimal Node.js 20.x Setup**

#### **vercel.json Configuration**
```json
{
  "version": 2,
  "framework": null,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "regions": ["gru1"],
  "buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api",
  "outputDirectory": "apps/web/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ]
}
```

#### **API Entry Point (api/index.ts)**
```typescript
// Runtime: Node.js 20.x (default)
import { handle } from 'hono/vercel';
import app from '../apps/api/src/app';

export default handle(app);
```

#### **Environment Variables for Node.js**
```bash
# Optimal for Node.js runtime
NODE_ENV=production
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
JWT_SECRET="..."
ENCRYPTION_KEY="..."

# Node.js specific optimizations
NODE_OPTIONS="--max-old-space-size=1024"
```

## 🔄 **ALTERNATIVE: Edge Runtime Configuration**

### **When to Consider Edge Runtime**

Edge Runtime is suitable for:
- ✅ **Simple API Routes**: Basic CRUD without complex database operations
- ✅ **Authentication Endpoints**: JWT validation and session management
- ✅ **Static Data**: Configuration, health checks, and status endpoints
- ✅ **Global Distribution**: APIs with worldwide traffic patterns
- ✅ **Ultra-low Latency**: Sub-100ms response requirements

### **Edge Runtime Setup**

#### **vercel.json for Edge**
```json
{
  "version": 2,
  "framework": null,
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    },
    "api/health.ts": {
      "runtime": "edge"  
    }
  },
  "regions": ["gru1"],
  "rewrites": [
    { "source": "/api/health", "destination": "/api/health.ts" },
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ]
}
```

#### **Edge-Compatible API Handler**
```typescript
// api/health.ts - Edge Runtime
export const runtime = 'edge';

export default async function handler(request: Request) {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'NeonPro API Health Check',
    timestamp: new Date().toISOString(),
    runtime: 'edge',
    region: process.env.VERCEL_REGION || 'unknown'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
```

#### **Edge-Compatible Supabase Client**
```typescript
// Edge Runtime Supabase Setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

// Edge-compatible client (no Node.js dependencies)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### **⚠️ Edge Runtime Limitations**

#### **Prisma Compatibility Issues**
```typescript
// ❌ NOT SUPPORTED in Edge Runtime
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // Will fail

// ✅ ALTERNATIVE: Direct SQL with Postgres.js
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!);
```

#### **File System Limitations**
```typescript
// ❌ NOT SUPPORTED in Edge Runtime  
import fs from 'fs';
fs.writeFileSync('./logs/audit.log', data); // Will fail

// ✅ ALTERNATIVE: External logging service
await fetch('https://logging-service.com/api/logs', {
  method: 'POST',
  body: JSON.stringify({ level: 'info', message: data })
});
```

## 🏗️ **HYBRID RUNTIME ARCHITECTURE**

### **Recommended Mixed Approach**

For optimal performance and compatibility, use **both runtimes strategically**:

#### **Node.js 20.x Routes (Primary)**
- `/api/patients/*` - Prisma ORM operations
- `/api/appointments/*` - Complex database queries  
- `/api/auth/login` - Session management with filesystem
- `/api/compliance/*` - LGPD audit logging
- `/api/reports/*` - Data processing and file generation

#### **Edge Runtime Routes (Secondary)**
- `/api/health` - Health checks and status
- `/api/auth/validate` - JWT token validation
- `/api/config` - Application configuration
- `/api/metrics` - Real-time performance metrics

### **Configuration for Hybrid Setup**

#### **vercel.json - Mixed Runtime**
```json
{
  "version": 2,
  "framework": null,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 60
    },
    "api/health.ts": {
      "runtime": "edge"
    },
    "api/auth/validate.ts": {
      "runtime": "edge"
    },
    "api/config.ts": {
      "runtime": "edge"
    }
  },
  "rewrites": [
    { "source": "/api/health", "destination": "/api/health.ts" },
    { "source": "/api/auth/validate", "destination": "/api/auth/validate.ts" },
    { "source": "/api/config", "destination": "/api/config.ts" },
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ]
}
```

#### **File-Level Runtime Hints**
```typescript
// apps/api/src/routes/health.ts
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default async function healthCheck() {
  return {
    status: 'ok',
    runtime: 'edge',
    timestamp: new Date().toISOString()
  };
}
```

```typescript
// apps/api/src/routes/patients.ts  
export const runtime = 'nodejs20.x';
export const preferredRegion = 'gru1';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function getPatients() {
  return await prisma.patient.findMany({
    where: { isActive: true }
  });
}
```

## 📈 **PERFORMANCE OPTIMIZATION STRATEGIES**

### **Node.js 20.x Optimizations**

#### **Connection Pooling**
```typescript
// apps/api/src/lib/database.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### **Memory Management**
```typescript
// vercel.json - Memory optimization
{
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,  // Increased for Prisma + Supabase
      "maxDuration": 60
    }
  }
}
```

### **Edge Runtime Optimizations**

#### **Caching Strategy**
```typescript
// Edge runtime with aggressive caching
export default async function handler(request: Request) {
  const response = await processRequest(request);
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'CDN-Cache-Control': 'public, max-age=3600'
    }
  });
}
```

#### **Regional Distribution**
```json
{
  "functions": {
    "api/health.ts": {
      "runtime": "edge",
      "regions": ["gru1", "iad1", "cdg1"]  // Multi-region for global reach
    }
  }
}
```

## 🔍 **DEVELOPMENT AND DEBUGGING**

### **Local Development with Node.js**
```bash
# Start local development with Node.js runtime
vercel dev --runtime=nodejs20.x

# Environment variables for development
VERCEL_ENV=development
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/neonpro_dev"
```

### **Testing Runtime Compatibility**
```typescript
// test/runtime-compatibility.test.ts
import { describe, it, expect } from 'vitest';

describe('Runtime Compatibility', () => {
  it('should work with Node.js runtime', async () => {
    // Test Prisma operations
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
  });

  it('should work with Edge runtime limitations', async () => {
    // Test Edge-compatible operations only
    const response = await fetch('/api/health');
    expect(response.status).toBe(200);
  });
});
```

### **Performance Monitoring**
```typescript
// Performance monitoring for both runtimes
export async function withPerformanceMonitoring(handler: Function) {
  const start = Date.now();
  
  try {
    const result = await handler();
    const duration = Date.now() - start;
    
    // Log performance metrics
    console.log(`Runtime: ${process.env.VERCEL_RUNTIME || 'nodejs20.x'}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Memory: ${process.memoryUsage().heapUsed / 1024 / 1024}MB`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Error after ${duration}ms:`, error);
    throw error;
  }
}
```

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment Verification**
- [ ] Runtime specified in `vercel.json` functions config
- [ ] Memory limits appropriate for workload
- [ ] Environment variables compatible with chosen runtime
- [ ] Database connections configured correctly
- [ ] File system operations compatible (Node.js only)

### **Post-Deployment Monitoring**
- [ ] Cold start times within acceptable limits
- [ ] Memory usage not exceeding limits
- [ ] Database connections functioning
- [ ] Error rates acceptable
- [ ] Performance metrics meeting SLAs

## 🎯 **FINAL RECOMMENDATIONS**

### **For NeonPro Healthcare Platform**

1. **Primary Runtime**: Node.js 20.x
   - All main API routes (`/api/patients`, `/api/appointments`, etc.)
   - Prisma ORM operations
   - LGPD compliance and audit logging
   - File processing and data exports

2. **Secondary Runtime**: Edge (Strategic Use)
   - Health checks (`/api/health`)
   - JWT validation (`/api/auth/validate`)
   - Configuration endpoints (`/api/config`)
   - Real-time metrics (`/api/metrics`)

3. **Configuration**: Root-level `vercel.json` with mixed runtime setup
4. **Memory**: 1024MB for Node.js functions
5. **Region**: Primary in `gru1` (São Paulo) for LGPD compliance

This hybrid approach provides:
- ✅ **Maximum Compatibility**: Full Prisma + Supabase support
- ✅ **Optimal Performance**: Fast edge responses where possible
- ✅ **Regulatory Compliance**: Full filesystem access for LGPD audit trails
- ✅ **Scalability**: Regional distribution for global performance