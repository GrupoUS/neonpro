# Development Setup Guide

## 🛠️ Development Environment Setup

This guide provides comprehensive instructions for setting up a development environment for the NeonPro Aesthetic Clinic system, including all necessary tools, dependencies, and configurations.

## 🚀 Prerequisites

### System Requirements

```bash
# Minimum System Requirements
- OS: macOS, Linux, or Windows (WSL2 recommended)
- RAM: 16GB minimum, 32GB recommended
- CPU: 4 cores minimum, 8 cores recommended
- Storage: 50GB free space
- Node.js: v18.x or v20.x
- Docker: 20.10+
- PostgreSQL: 15+
- Redis: 7+
```

### Required Tools

```bash
# Development Tools
- Node.js (v18.x or v20.x)
- npm or pnpm (package managers)
- Git
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- Prisma CLI
- TypeScript
- Visual Studio Code (recommended)

# Optional but Recommended
- GitHub CLI
- AWS CLI
- kubectl (for Kubernetes)
- Helm
- Terraform
- ngrok (for local tunneling)
```

## 📦 Repository Setup

### Clone and Configure

```bash
# Clone the repository
git clone https://github.com/your-org/neonpro.git
cd neonpro

# Install global dependencies
npm install -g pnpm@latest
npm install -g @prisma/cli
npm install -g typescript@latest
npm install -g ts-node@latest

# Install root dependencies
pnpm install

# Link packages
pnpm run setup:links

# Generate Prisma client
pnpm db:push
pnpm db:generate

# Build all packages
pnpm build
```

### Environment Configuration

```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env.local

# Edit environment files
nano apps/api/.env.local
nano apps/web/.env.local
nano packages/database/.env.local
```

## 🔧 Local Development Setup

### Database Setup

```bash
# Start PostgreSQL using Docker
docker run -d \
  --name neonpro-postgres \
  -e POSTGRES_DB=neonpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Start Redis using Docker
docker run -d \
  --name neonpro-redis \
  -p 6379:6379 \
  redis:7-alpine

# Alternatively, use Docker Compose
docker-compose up -d postgres redis

# Run database migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed
```

### Development Servers

```bash
# Start API server (in one terminal)
cd apps/api
pnpm dev

# Start web server (in another terminal)
cd apps/web
pnpm dev

# Or use turbo to run all services
pnpm dev
```

## 🐳 Docker Development

### Development Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/neonpro
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    command: pnpm dev

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    command: pnpm dev

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: neonpro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./packages/database/prisma:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

### Development Dockerfile

```dockerfile
# apps/api/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/pnpm-lock.yaml ./apps/api/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start development server
CMD ["pnpm", "dev"]
```

## 🧪 Testing Setup

### Test Configuration

```json
// jest.config.json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/src", "<rootDir>/tests"],
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "setupFilesAfterEnv": ["<rootDir>/src/__tests__/setup.ts"]
}
```

### Test Database Setup

```bash
# Create test database
createdb neonpro_test

# Run tests with test database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neonpro_test pnpm test

# Or use the test script
pnpm test
```

## 🔌 IDE Setup

### VS Code Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.sql": "sql"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true
  }
}
```

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-azuretools.vscode-docker",
    "humao.rest-client",
    "GitHub.vscode-pull-request-github",
    "ms-vscode.vscode-github-pullrequest",
    "ms-vscode.vscode-github-issue-notebooks"
  ]
}
```

## 🔍 Debugging Setup

### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/index.ts",
      "preLaunchTask": "build:api",
      "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development",
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/neonpro",
        "REDIS_URL": "redis://localhost:6379/0"
      },
      "sourceMaps": true,
      "smartStep": true,
      "internalConsoleOptions": "openOnSessionStart"
    },
    {
      "name": "Debug Web",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/apps/web/src",
      "preLaunchTask": "build:web",
      "sourceMaps": true,
      "userDataDir": false
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--config", "jest.config.json"],
      "env": {
        "NODE_ENV": "test",
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/neonpro_test"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Chrome DevTools Configuration

```typescript
// apps/api/src/utils/debug-config.ts
import debug from 'debug';

// Configure debug namespaces
debug.enable('neonpro:*');

export const debugLog = debug('neonpro:api');
export const debugDB = debug('neonpro:database');
export const debugAuth = debug('neonpro:auth');
export const debugCache = debug('neonpro:cache');
export const debugPerf = debug('neonpro:performance');

// Performance monitoring
export class PerformanceMonitor {
  static time(label: string): void {
    debugPerf(`Timer started: ${label}`);
    console.time(label);
  }

  static timeEnd(label: string): void {
    console.timeEnd(label);
    debugPerf(`Timer ended: ${label}`);
  }
}

// Error tracking
export class ErrorTracker {
  static track(error: Error, context?: Record<string, any>): void {
    debugLog('Error tracked:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry or similar service
    }
  }
}
```

## 🔌 API Development

### API Testing with REST Client

```http
### Get all clients
GET http://localhost:3001/api/v1/clients
Authorization: Bearer {{token}}

### Create new client
POST http://localhost:3001/api/v1/clients
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "fullName": "Maria Silva",
  "email": "maria.silva@example.com",
  "phone": "+5511999999999",
  "cpf": "12345678900",
  "dateOfBirth": "1990-01-01",
  "gender": "female",
  "skinType": "mixed",
  "skinConcerns": ["acne", "aging"],
  "lgpdConsent": true
}

### Get client details
GET http://localhost:3001/api/v1/clients/{{clientId}}
Authorization: Bearer {{token}}

### Update client
PUT http://localhost:3001/api/v1/clients/{{clientId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "phone": "+5511988888888",
  "skinConcerns": ["acne", "aging", "pigmentation"]
}
```

### tRPC Playground Setup

```typescript
// apps/api/src/trpc/playground.ts
import { createTRPCPlayground } from 'trpc-playground';

export const playgroundHandler = createTRPCPlayground({
  endpoint: '/api/trpc',
  router: appRouter,
  request: {
    headers: {
      Authorization: 'Bearer your-token-here',
    },
  },
});

// Add to Express app
app.use('/playground', playgroundHandler);
```

## 🎨 Frontend Development

### Component Development Setup

```typescript
// apps/web/src/components/shared/dev-helpers.tsx
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

// Development props panel
export const DevPanel: React.FC<{ data: any }> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className='bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg'
      >
        {isVisible ? 'Hide' : 'Show'} Dev Data
      </button>

      {isVisible && (
        <div className='absolute bottom-16 right-0 w-96 bg-white border rounded-lg shadow-xl p-4 max-h-96 overflow-auto'>
          <pre className='text-xs'>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Mock data provider
export const withMockData = <P extends object>(
  Component: React.ComponentType<P>,
  mockData: P,
) => {
  return (props: P) => <Component {...mockData} {...props} />;
};

// Development utilities
export const devUtils = {
  logRender: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 ${componentName} rendered`);
    }
  },

  logInteraction: (componentName: string, action: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🖱️ ${componentName} ${action}`);
    }
  },

  measurePerformance: (componentName: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`⏱️ ${componentName} took ${end - start}ms`);
    } else {
      fn();
    }
  },
};
```

### Storybook Configuration

```typescript
// .storybook/main.ts
module.exports = {
  stories: ['../apps/web/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  features: {
    storyStoreV7: true,
  },
};
```

## 🔄 Development Workflow

### Git Hooks Setup

```bash
#!/bin/bash
# scripts/setup-git-hooks.sh

# Install husky
npm install husky --save-dev

# Enable git hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"

# Add pre-push hook
npx husky add .husky/pre-push "pnpm test"

# Add commit message hook
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"

echo "Git hooks installed successfully!"
```

### Lint-staged Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{sql}": [
      "sql-formatter --config .sql-formatter.json"
    ]
  }
}
```

### Development Scripts

```json
// package.json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "cd apps/api && pnpm dev",
    "dev:web": "cd apps/web && pnpm dev",
    "build": "turbo run build",
    "build:api": "cd apps/api && pnpm build",
    "build:web": "cd apps/web && pnpm build",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:coverage": "turbo run test:coverage",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "type-check": "turbo run type-check",
    "db:push": "cd packages/database && pnpm db:push",
    "db:generate": "cd packages/database && pnpm db:generate",
    "db:migrate": "cd packages/database && pnpm db:migrate",
    "db:seed": "cd packages/database && pnpm db:seed",
    "db:studio": "cd packages/database && pnpm db:studio",
    "storybook": "cd apps/web && pnpm storybook",
    "build-storybook": "cd apps/web && pnpm build-storybook",
    "e2e": "cd apps/web && pnpm e2e",
    "e2e:ui": "cd apps/web && pnpm e2e:ui"
  }
}
```

## 🧪 Testing Development

### Test Utilities

```typescript
// apps/api/src/__tests__/utils/test-utils.ts
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { app } from '../src/app';

// Test database client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
        || 'postgresql://postgres:postgres@localhost:5432/neonpro_test',
    },
  },
});

// Test Redis client
export const testRedis = new Redis(process.env.TEST_REDIS_URL || 'redis://localhost:6379/1');

// Test app instance
export const testApp = app;

// Cleanup utilities
export const cleanup = async () => {
  await testPrisma.aestheticClientProfile.deleteMany();
  await testPrisma.aestheticTreatment.deleteMany();
  await testPrisma.aestheticSession.deleteMany();
  await testRedis.flushdb();
};

// Test data factories
export const factories = {
  createClient: async (overrides = {}) => {
    return testPrisma.aestheticClientProfile.create({
      data: {
        fullName: 'Test Client',
        email: 'test@example.com',
        phone: '+5511999999999',
        cpf: '12345678900',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        skinType: 'mixed',
        skinConcerns: ['acne'],
        lgpdConsent: true,
        status: 'active',
        ...overrides,
      },
    });
  },

  createTreatment: async (clientId: string, overrides = {}) => {
    return testPrisma.aestheticTreatment.create({
      data: {
        clientId,
        name: 'Test Treatment',
        description: 'Test treatment description',
        category: 'facial',
        sessionCount: 4,
        intervalDays: 14,
        price: 800.00,
        duration: 60,
        status: 'active',
        ...overrides,
      },
    });
  },

  createSession: async (treatmentId: string, overrides = {}) => {
    return testPrisma.aestheticSession.create({
      data: {
        treatmentId,
        professionalId: 'test-professional-id',
        date: new Date(),
        status: 'scheduled',
        notes: 'Test session',
        ...overrides,
      },
    });
  },
};

// Test helpers
export const auth = {
  generateToken: (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  },

  generateHeaders: (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }),
};
```

## 🌐 Local Development with ngrok

### ngrok Setup

```bash
# Install ngrok
npm install -g ngrok

# Start API server in background
cd apps/api && pnpm dev &

# Create ngrok tunnel
ngrok http 3001

# Update environment with ngrok URL
export VITE_API_URL=https://your-ngrok-url.ngrok.io
```

### Local HTTPS Setup

```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365

# Start servers with HTTPS
HTTPS=true SSL_KEY_PATH=./key.pem SSL_CERT_PATH=./cert.pem pnpm dev
```

## 📊 Development Monitoring

### Local Monitoring Setup

```typescript
// apps/api/src/monitoring/dev-monitoring.ts
import express from 'express';
import prometheus from 'prom-client';

const app = express();

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Enable the collection of default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to collect metrics
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.route?.path || req.path, code: res.statusCode, method: req.method });
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

export default app;
```

This comprehensive development setup guide ensures developers can quickly and efficiently set up their local development environment with all necessary tools, configurations, and best practices for contributing to the NeonPro Aesthetic Clinic system.
