# NeonPro Build System Guide

## Overview

The NeonPro build system is a comprehensive, production-ready build system designed specifically for the new 8-package architecture. It provides unified tooling for development, testing, deployment, and monitoring of all packages and applications.

## Architecture

### Core Components

1. **Build System** (`scripts/build-system.js`)
   - Unified build orchestration
   - Package dependency management
   - Build optimization and caching
   - Multi-environment support

2. **Development Server** (`scripts/dev-server.js`)
   - Hot Module Replacement (HMR)
   - Concurrent package development
   - Real-time error reporting
   - WebSocket communication

3. **Testing Infrastructure** (`scripts/testing-infrastructure.js`)
   - Unit, Integration, E2E testing
   - Coverage reporting
   - Performance testing
   - Security testing

4. **Deployment System** (`scripts/deployment.js`)
   - Multi-environment deployment
   - Zero-downtime deployments
   - Rollback capabilities
   - Health checks and monitoring

5. **Development Tooling** (`scripts/dev-tooling.js`)
   - Code analysis and optimization
   - Performance monitoring
   - Debug utilities
   - Code generation

## 8-Package Architecture

The build system is optimized for the following 8 core packages:

1. **@neonpro/types** - Core type definitions and schemas
2. **@neonpro/shared** - Shared utilities and services
3. **@neonpro/database** - Database layer and models
4. **@neonpro/ai-services** - AI and ML services
5. **@neonpro/healthcare-core** - Healthcare business logic
6. **@neonpro/security-compliance** - Security and compliance
7. **@neonpro/api-gateway** - API gateway and routing
8. **@neonpro/ui** - React component library

### Build Order

Packages are built in dependency order:
```
@neonpro/types → @neonpro/shared → @neonpro/database → @neonpro/ai-services → 
@neonpro/healthcare-core → @neonpro/security-compliance → @neonpro/api-gateway → @neonpro/ui
```

## Quick Start

### Installation

```bash
# Install dependencies
bun install

# Initialize build system
bun run build-system health
```

### Development

```bash
# Start development server for all packages
bun run dev-server start

# Start development server for specific packages
bun run dev-server start --packages @neonpro/web,@neonpro/api

# Monitor package status
bun run dev-server status
```

### Building

```bash
# Build all packages
bun run build-system build

# Build core packages only
bun run build-system build:packages

# Build applications only
bun run build-system build:apps

# Build for production
bun run build-system build:production
```

### Testing

```bash
# Run all tests
bun run testing-infrastructure test:all

# Run specific test types
bun run testing-infrastructure test:unit
bun run testing-infrastructure test:integration
bun run testing-infrastructure test:e2e

# Run tests with coverage
bun run testing-infrastructure coverage

# Generate test report
bun run testing-infrastructure report
```

### Deployment

```bash
# Deploy to staging
bun run deployment deploy staging

# Deploy to production
bun run deployment deploy production

# Create deployment package
bun run deployment package production

# Rollback deployment
bun run deployment rollback production <deployment-id>
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `CI` | CI/CD mode | `false` |
| `DEV_PORT` | Development server port | `3000` |
| `DEV_WS_PORT` | WebSocket server port | `3001` |
| `HOT` | Enable hot reloading | `true` |
| `DEBUG` | Enable debug mode | `false` |
| `CONCURRENT` | Enable concurrent builds | `true` |
| `WATCH` | Enable file watching | `true` |
| `REBUILD` | Auto-rebuild on errors | `false` |

### Package Configuration

Each package can have its own build configuration in `package.json`:

```json
{
  "name": "@neonpro/types",
  "scripts": {
    "build": "bun x tsc -b",
    "dev": "tsc -w -p tsconfig.json",
    "type-check": "tsc -p tsconfig.json --noEmit",
    "test": "bun test",
    "clean": "rimraf dist"
  }
}
```

## Build System Commands

### Core Commands

```bash
# Build System
bun run build-system build              # Build all packages
bun run build-system build:packages     # Build core packages
bun run build-system build:apps         # Build applications
bun run build-system build:production   # Production build
bun run build-system dev                # Start development server
bun run build-system test               # Run tests
bun run build-system type-check         # Type checking
bun run build-system lint               # Linting
bun run build-system quality            # Quality gates
bun run build-system clean              # Clean artifacts
bun run build-system health             # Health check
```

### Development Server

```bash
bun run dev-server start          # Start all packages
bun run dev-server status         # Show server status
bun run dev-server restart <pkg>  # Restart specific package
bun run dev-server stop [pkg]     # Stop package or all
bun run dev-server info <pkg>     # Get package info
```

### Testing Infrastructure

```bash
bun run testing-infrastructure init               # Initialize test environment
bun run testing-infrastructure test [package]     # Run tests
bun run testing-infrastructure test:all          # Run all tests
bun run testing-infrastructure test:unit         # Unit tests
bun run testing-infrastructure test:integration  # Integration tests
bun run testing-infrastructure test:e2e          # E2E tests
bun run testing-infrastructure test:performance  # Performance tests
bun run testing-infrastructure test:security     # Security tests
bun run testing-infrastructure coverage          # Coverage report
bun run testing-infrastructure report            # Test report
```

### Deployment System

```bash
bun run deployment deploy [env]         # Deploy to environment
bun run deployment package [env]        # Create deployment package
bun run deployment rollback [env] [id]  # Rollback deployment
bun run deployment health [env]         # Run health checks
bun run deployment backup [env]         # Create backup
bun run deployment status [env]         # Get deployment status
```

### Development Tooling

```bash
bun run dev-tooling analyze [packages]   # Analyze code
bun run dev-tooling debug                # Setup debug environment
bun run dev-tooling monitor              # Start monitoring
bun run dev-tooling generate <type> <pkg> <name>  # Generate code
bun run dev-tooling deps [action]        # Manage dependencies
bun run dev-tooling metrics              # Get metrics
```

## CI/CD Pipeline

### Enhanced CI/CD Workflow

The system includes an enhanced CI/CD pipeline (`.github/workflows/ci-enhanced.yml`) with:

- **Health Check**: Validates build system integrity
- **Build Matrix**: Parallel builds for different package groups
- **Type Checking**: Comprehensive TypeScript validation
- **Quality Gates**: Linting, formatting, and security scans
- **Test Matrix**: Unit, integration, and E2E tests
- **Performance Analysis**: Build optimization and metrics
- **Security Scanning**: Vulnerability assessment
- **Deployment**: Multi-environment deployment with rollback

### Pipeline Stages

1. **Setup and Install**: Dependency installation and caching
2. **Health Check**: Build system validation
3. **Build Matrix**: Parallel package builds
4. **Type Check**: TypeScript validation
5. **Quality Gates**: Code quality checks
6. **Test Matrix**: Comprehensive testing
7. **Performance Analysis**: Build optimization
8. **Security Scan**: Vulnerability assessment
9. **Production Build**: Optimized builds
10. **Deployment**: Environment deployment

## Development Workflows

### Local Development

1. **Start Development Server**
   ```bash
   bun run dev-server start
   ```

2. **Make Changes**
   - Edit files in any package
   - Hot reload automatically applies changes
   - Real-time error reporting

3. **Run Tests**
   ```bash
   bun run testing-infrastructure test:all
   ```

4. **Check Quality**
   ```bash
   bun run build-system quality
   ```

### Code Generation

1. **Generate Component**
   ```bash
   bun run dev-tooling generate component @neonpro/ui MyComponent
   ```

2. **Generate Service**
   ```bash
   bun run dev-tooling generate service @neonpro/api-gateway MyService
   ```

3. **Generate Test**
   ```bash
   bun run dev-tooling generate test @neonpro/types MyType
   ```

### Performance Monitoring

1. **Start Monitoring**
   ```bash
   bun run dev-tooling monitor
   ```

2. **View Metrics**
   ```bash
   bun run dev-tooling metrics
   ```

3. **Analyze Performance**
   ```bash
   bun run dev-tooling analyze --performance
   ```

## Testing

### Test Types

- **Unit Tests**: Individual package functionality
- **Integration Tests**: Package interactions
- **E2E Tests**: End-to-end workflows
- **Performance Tests**: Performance benchmarks
- **Security Tests**: Security validation

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts']
  },
  coverage: {
    reporter: ['text', 'lcov', 'html'],
    thresholds: {
      global: 75
    }
  }
});
```

## Deployment

### Environments

- **Development**: Local development
- **Staging**: Pre-production testing
- **Production**: Live deployment

### Deployment Strategies

1. **Rolling Deployment**: Gradual rollout with health checks
2. **Blue-Green Deployment**: Zero-downtime deployment
3. **Canary Deployment**: Gradual traffic shifting

### Deployment Process

1. **Create Package**
   ```bash
   bun run deployment package production
   ```

2. **Deploy**
   ```bash
   bun run deployment deploy production
   ```

3. **Health Check**
   ```bash
   bun run deployment health production
   ```

4. **Rollback (if needed)**
   ```bash
   bun run deployment rollback production <deployment-id>
   ```

## Monitoring and Observability

### Performance Metrics

- Build times
- Test execution times
- Memory usage
- CPU usage
- Bundle sizes

### Quality Metrics

- Test coverage
- Lint issues
- Type errors
- Security vulnerabilities

### Monitoring Tools

- **Development Server**: Real-time monitoring
- **CI/CD Pipeline**: Automated quality checks
- **Performance Analysis**: Build optimization
- **Health Checks**: Service validation

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build system health
bun run build-system health

# Clean and rebuild
bun run build-system clean
bun run build-system build
```

**Development Server Issues**
```bash
# Restart development server
bun run dev-server stop
bun run dev-server start

# Check package status
bun run dev-server status
```

**Test Failures**
```bash
# Run tests with verbose output
bun run testing-infrastructure test --verbose

# Check test environment
bun run testing-infrastructure init
```

**Deployment Issues**
```bash
# Check deployment status
bun run deployment status production

# Rollback if needed
bun run deployment rollback production <deployment-id>
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Enable debug mode
DEBUG=true bun run dev-server start

# Verbose output
bun run build-system build --verbose
```

## Best Practices

### Development

1. **Use the development server** for hot reloading
2. **Run tests frequently** to catch issues early
3. **Use code generation** for consistent patterns
4. **Monitor performance** regularly
5. **Follow the build order** for dependencies

### Testing

1. **Write comprehensive tests** for all packages
2. **Maintain test coverage** above thresholds
3. **Use appropriate test types** (unit, integration, E2E)
4. **Test in multiple environments**

### Deployment

1. **Test in staging** before production
2. **Use deployment strategies** (rolling, blue-green, canary)
3. **Monitor health** after deployment
4. **Have rollback plans** ready

### Performance

1. **Optimize build times** with caching
2. **Monitor bundle sizes** and load times
3. **Use performance analysis** tools
4. **Follow performance budgets**

## Migration Guide

### From Previous Build System

1. **Update Scripts**: Replace old build commands with new ones
2. **Configure Packages**: Update package.json files
3. **Setup CI/CD**: Update GitHub Actions workflows
4. **Update Development Workflow**: Use new development server

### Example Migration

**Before:**
```bash
npm run build
npm run test
npm run dev
```

**After:**
```bash
bun run build-system build
bun run testing-infrastructure test:all
bun run dev-server start
```

## Contributing

### Adding New Packages

1. **Create Package**: Add to packages directory
2. **Update Configuration**: Add to build system
3. **Define Dependencies**: Update build order
4. **Add Tests**: Configure testing
5. **Update CI/CD**: Add to pipeline

### Extending Build System

1. **Add Commands**: Extend build-system.js
2. **Add Tests**: Update testing infrastructure
3. **Add Deployment**: Update deployment system
4. **Add Tools**: Update development tooling

## Support

For issues and questions:
- Check the troubleshooting section
- Review logs and error messages
- Use debug mode for detailed output
- Check GitHub Actions for CI/CD issues

## License

MIT License - see LICENSE file for details.