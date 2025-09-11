# Edge Cold Start Measurement

This tool measures cold start performance for the NeonPro Hono API in Edge Runtime simulation conditions.

## Overview

Cold start latency is a critical performance metric for serverless applications, especially in edge environments where functions may be cold-started frequently. This tool provides comprehensive measurement and analysis of cold start behavior.

## Features

- **Simulated Cold Starts**: Restarts the server process to simulate true cold start conditions
- **Multi-Endpoint Testing**: Tests all major API endpoints (`/`, `/health`, `/v1/health`, `/v1/info`)
- **Comprehensive Metrics**: Measures cold vs warm request times, calculates penalties
- **Performance Analysis**: Generates detailed reports with recommendations
- **Automated Testing**: Full automation with error handling and cleanup

## Usage

### Quick Start

```bash
# Run the measurement script
./tools/performance/run-cold-start-measurement.sh
```

### Programmatic Usage

```typescript
import { ColdStartMeasurement } from './tools/performance/cold-start-measurement';

const measurement = new ColdStartMeasurement({
  port: 3004,
  warmupRequests: 5,
  measurementRequests: 10,
  endpoints: ['/api', '/api/health', '/api/v1/health', '/api/v1/info']
});

const results = await measurement.measureAll();
await measurement.saveResults(results);
```

## Configuration Options

```typescript
interface MeasurementConfig {
  port: number;              // Server port (default: 3004)
  warmupRequests: number;     // Warmup requests before measurement (default: 5)
  measurementRequests: number; // Number of warm requests to measure (default: 10)
  restartDelay: number;       // Delay after server restart (default: 1000ms)
  endpoints: string[];        // Endpoints to test (default: main API endpoints)
}
```

## Measured Metrics

### Cold Start Metrics

- **Initial Start Time**: Time to start server process
- **First Request Time**: Cold start request latency
- **Warm Request Times**: Array of warm request latencies
- **Average Warm Time**: Mean latency of warm requests
- **Cold Start Delta**: Difference between cold and warm performance
- **Memory Usage**: Runtime memory consumption

### Environment Information

- Node.js version
- Platform and architecture
- Measurement timestamp

## Performance Thresholds

### Optimal Performance
- **Cold Start**: < 300ms
- **Warm Requests**: < 100ms
- **Memory Usage**: < 50MB

### Warning Thresholds
- **Cold Start**: > 500ms (bundle optimization needed)
- **Cold Start**: > 1000ms (critical optimization required)

## Output Files

### JSON Data (`docs/performance/cold-start-metrics.json`)
```json
{
  "/api": {
    "initialStartTime": 1234567890,
    "firstRequestTime": 245.67,
    "subsequentRequests": [12.34, 13.56, 11.89],
    "averageWarmTime": 12.60,
    "coldStartDelta": 233.07,
    "memoryUsage": { ... },
    "environment": { ... }
  }
}
```

### Performance Report (`docs/performance/cold-start-performance-report.md`)
- Executive summary table
- Detailed per-endpoint analysis
- Memory usage statistics
- Performance recommendations
- Edge runtime optimization tips

## Integration with CI/CD

### Performance Regression Testing
```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  cold-start-measurement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: ./tools/performance/run-cold-start-measurement.sh
      - name: Check Performance Thresholds
        run: |
          # Fail if cold start > 500ms for any endpoint
          node -e "
            const metrics = require('./docs/performance/cold-start-metrics.json');
            for (const [endpoint, data] of Object.entries(metrics)) {
              if (data.firstRequestTime > 500) {
                console.error(\`Cold start regression: \${endpoint} = \${data.firstRequestTime}ms\`);
                process.exit(1);
              }
            }
            console.log('All endpoints within performance budget');
          "
```

### Performance Budgets
```json
{
  "performance": {
    "cold-start-budget": {
      "/api": 300,
      "/api/health": 200,
      "/api/v1/health": 200,
      "/api/v1/info": 250
    },
    "warm-request-budget": {
      "average": 50,
      "p95": 100
    }
  }
}
```

## Troubleshooting

### Common Issues

**Server Startup Timeout**
```
Error: Server startup timeout
```
- Check if port 3004 is available
- Verify API dependencies are installed
- Check server logs for initialization errors

**Request Failures**
```
Request failed: ECONNREFUSED
```
- Ensure API server started successfully
- Verify endpoint paths are correct
- Check firewall/network settings

**High Cold Start Latency**
- Analyze bundle size with `npm run analyze`
- Check for large synchronous imports
- Consider lazy loading heavy dependencies

### Debug Mode

Enable detailed logging:
```typescript
const measurement = new ColdStartMeasurement({
  // ... config
});

// Add custom logging
measurement.on('measurement-start', (endpoint) => {
  console.log(`Starting measurement for ${endpoint}`);
});
```

## Performance Optimization Strategies

### Bundle Size Optimization
1. **Tree Shaking**: Ensure unused code is eliminated
2. **Dynamic Imports**: Lazy load heavy dependencies
3. **Code Splitting**: Split vendor and application code
4. **Dependency Analysis**: Review and minimize dependencies

### Edge Runtime Optimization
1. **Web APIs**: Prefer Web APIs over Node.js APIs
2. **Bundle Size**: Keep under 1MB for optimal performance
3. **Initialization**: Minimize synchronous work in module scope
4. **Memory Management**: Avoid memory leaks in global scope

### Server Optimization
1. **Hono Optimizations**: Use minimal middleware stack
2. **Database Connections**: Use connection pooling
3. **Caching**: Implement response and data caching
4. **Compression**: Enable response compression

## Related Documentation

- [Architecture Documentation](../../docs/architecture/AGENTS.md)
- [Performance Testing Strategy](../../docs/testing/AGENTS.md)
- [Deployment Guide](../../docs/features/deploy-vercel.md)
- [Monitoring and Analytics](../../docs/features/lgpd-analytics-consent.md)

## Continuous Improvement

### Baseline Establishment
- Run measurements after major changes
- Document performance baselines
- Set up automated performance regression tests

### Monitoring Strategy
- Track cold start trends over time
- Set up alerts for performance degradation
- Correlate performance with deployment changes

---

**Last Updated**: 2024-12-28  
**Tool Version**: 1.0.0  
**Compatibility**: NeonPro Hono API, Vercel Edge Runtime