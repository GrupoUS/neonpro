# Performance Budgets & Monitoring Configuration

## Overview

This document outlines the performance budgets and monitoring configuration for the NeonPro healthcare platform. Performance budgets are critical for healthcare applications where slow loading times can directly impact patient care quality and operational efficiency.

## 🏥 Healthcare Performance Standards

### Why Stricter Performance Standards?

Healthcare applications require stricter performance standards than typical web applications due to:

- **Patient Safety**: Slow loading forms or dashboards can delay critical medical decisions
- **Regulatory Compliance**: LGPD and ANVISA require efficient data processing
- **Operational Efficiency**: Medical staff need fast, responsive interfaces during patient care
- **Accessibility**: Higher accessibility standards ensure compliance with healthcare regulations
- **Network Constraints**: Clinic networks may have limited bandwidth

### Performance Budget Thresholds

Our performance budgets are **stricter than Google's Core Web Vitals recommendations**:

| Metric | NeonPro Healthcare | Google Standard | Justification |
|--------|-------------------|-----------------|---------------|
| **Largest Contentful Paint (LCP)** | < 2.0s | < 2.5s | Faster patient data access |
| **First Contentful Paint (FCP)** | < 1.5s | < 1.8s | Immediate visual feedback |
| **Interaction to Next Paint (INP)** | < 150ms | < 200ms | Form responsiveness for medical data |
| **Cumulative Layout Shift (CLS)** | < 0.05 | < 0.1 | Form stability for accurate data entry |
| **Total Blocking Time (TBT)** | < 200ms | < 300ms | Uninterrupted medical workflow |
| **Accessibility Score** | ≥ 95% | ≥ 90% | Healthcare accessibility compliance |

### Resource Budget Limits

| Resource Type | Budget | Justification |
|---------------|--------|---------------|
| **Total Bundle Size** | < 1.2MB | Clinic network efficiency |
| **JavaScript** | < 500KB | Fast parsing and execution |
| **CSS** | < 100KB | Rapid styling application |
| **Images** | < 300KB | Optimized medical imagery |
| **Fonts** | < 150KB | Readable medical text |
| **Total Requests** | < 50 | Reduced network overhead |
| **Third-party Requests** | < 5 | Minimize external dependencies |

## 🛠️ Implementation

### Configuration Files

#### 1. Lighthouse CI Configuration (`lighthouserc.js`)

```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './apps/web/dist',
      startServerCommand: 'pnpm --filter @neonpro/web preview --port 4173',
      url: ['http://localhost:4173/', 'http://localhost:4173/dashboard'],
      settings: {
        preset: 'desktop',
        budgetPath: './lighthouse-budget.json',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Healthcare-specific strict assertions
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // ... (see full config in lighthouserc.js)
      },
    },
  },
};
```

#### 2. Performance Budget JSON (`lighthouse-budget.json`)

Defines specific budgets for different page types with tolerance levels:

```json
{
  "path": "/*",
  "timings": [
    {
      "metric": "largest-contentful-paint",
      "budget": 2000,
      "tolerance": 300
    }
  ],
  "resourceSizes": [...],
  "resourceCounts": [...]
}
```

### Local Validation

#### Script Usage

```bash
# Validate performance budgets locally
./tools/performance/validate-performance-budgets.sh

# Options available:
./tools/performance/validate-performance-budgets.sh --help
./tools/performance/validate-performance-budgets.sh --mobile
./tools/performance/validate-performance-budgets.sh --no-build
```

#### Performance Tools Package

```bash
# Install performance tools dependencies
cd tools/performance
pnpm install

# Available scripts:
pnpm run lighthouse:ci      # Run Lighthouse CI
pnpm run budget:validate    # Validate budgets only
pnpm run performance:check  # Complete performance check
```

### CI/CD Integration

The performance budget validation is integrated into the GitHub Actions CI pipeline:

```yaml
performance-budgets:
  name: Performance Budgets & Monitoring
  runs-on: ubuntu-latest
  needs: [setup-and-install, quality-gates]
  steps:
    - name: Install Lighthouse CI
      run: pnpm add -g @lhci/cli@latest
    - name: Build web app
      run: pnpm --filter @neonpro/web build
    - name: Run Lighthouse CI with Performance Budgets
      run: lhci autorun
```

## 📊 Monitoring & Reporting

### Automated Monitoring

1. **CI Pipeline**: Every pull request and push to main branches
2. **Build Failure**: Performance budget violations fail the build
3. **Report Generation**: Detailed Lighthouse reports for analysis
4. **Artifact Storage**: Reports stored for 14 days in CI artifacts

### Report Analysis

Performance reports include:

- **Core Web Vitals scores** with pass/fail status
- **Resource breakdown** by type and size
- **Accessibility audit** with specific findings
- **Optimization recommendations** for violations
- **Historical comparison** (when using Lighthouse CI server)

### Alert Thresholds

| Severity | Condition | Action |
|----------|-----------|--------|
| **Error** | Budget violation | Build fails, blocks deployment |
| **Warning** | Near threshold | Warning in PR, monitoring alert |
| **Info** | Improved performance | Success notification |

## 🔧 Optimization Guidelines

### When Performance Budgets Fail

1. **Analyze the Report**:
   ```bash
   # View detailed Lighthouse report
   open .lighthouseci/lhci_reports/lighthouse-*.html
   ```

2. **Common Healthcare App Optimizations**:
   - **Code Splitting**: Lazy load non-critical medical modules
   - **Image Optimization**: Compress medical imagery and charts
   - **Bundle Analysis**: Remove unused medical libraries
   - **Critical Path**: Prioritize patient data loading
   - **Font Optimization**: Use system fonts for medical text
   - **Third-party Auditing**: Minimize external healthcare APIs

3. **Form-Specific Optimizations**:
   - **Layout Stability**: Ensure medical forms don't shift during loading
   - **Input Responsiveness**: Optimize form validation for medical data
   - **Progressive Enhancement**: Load critical patient fields first

### Performance Budget Adjustments

Budget adjustments should be **carefully considered** and documented:

1. **Business Justification**: Document why adjustment is needed
2. **Temporary vs Permanent**: Set timeline for improvements
3. **Alternative Solutions**: Consider technical alternatives
4. **Patient Impact**: Assess impact on healthcare workflows

```javascript
// Example: Temporary adjustment with justification
'largest-contentful-paint': [
  'error', 
  { 
    maxNumericValue: 2500,  // Temporarily relaxed from 2000ms
    // TODO: Optimize patient data loading by Q2 2025
    // Justification: Complex patient dashboard requires additional medical modules
  }
],
```

## 🧪 Testing & Validation

### Automated Tests

The performance budget system includes comprehensive tests:

```typescript
// Performance budget validation tests
describe('Performance Budget Validation System', () => {
  it('should have healthcare-specific performance budgets defined', () => {
    const config = readFileSync('lighthouserc.js', 'utf8')
    expect(config).toContain('maxNumericValue: 2000')  // LCP 2s
    expect(config).toContain('minScore: 0.95')         // Accessibility 95%
  })
})
```

### Manual Testing

1. **Local Development**:
   ```bash
   pnpm --filter @neonpro/web build
   ./tools/performance/validate-performance-budgets.sh
   ```

2. **Different Network Conditions**:
   ```bash
   ./tools/performance/validate-performance-budgets.sh --mobile
   ```

3. **Regression Testing**: Run before major feature releases

## 📈 Performance Metrics Dashboard

### Key Healthcare Performance Indicators

Track these metrics specific to healthcare applications:

1. **Patient Data Loading Time**: Time to display patient information
2. **Form Submission Response**: Medical form processing speed
3. **Dashboard Interactivity**: Time to interactive for medical dashboards
4. **Accessibility Score**: Compliance with healthcare accessibility standards
5. **Layout Stability**: Form field stability during data entry

### Monitoring Tools Integration

- **Lighthouse CI Server**: Historical performance tracking
- **Core Web Vitals**: Real user monitoring
- **Synthetic Testing**: Automated performance validation
- **Resource Monitoring**: Bundle size tracking

## 🔒 Healthcare Compliance

### Performance-Related Compliance

1. **LGPD Compliance**:
   - Fast data processing and retrieval
   - Efficient consent management loading
   - Minimal third-party data sharing

2. **ANVISA Standards**:
   - Reliable medical software performance
   - Consistent application responsiveness
   - Accurate form data handling

3. **Accessibility Requirements**:
   - 95% Lighthouse accessibility score
   - Fast screen reader compatibility
   - Keyboard navigation responsiveness

## 📚 References

### Healthcare Performance Standards
- [Web Performance for Healthcare Applications](https://web.dev/healthcare-performance)
- [Medical Software Performance Guidelines](https://www.anvisa.gov.br/software-medico)
- [LGPD Technical Requirements](https://www.lgpd.gov.br/technical-requirements)

### Web Performance Resources
- [Core Web Vitals Thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance Budget Guide](https://web.dev/performance-budgets-101/)

### Tool Documentation
- [Lighthouse Configuration](https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md)
- [Budget.json Reference](https://github.com/GoogleChrome/budget.json)
- [GitHub Actions Integration](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)

---

**Last Updated**: January 2025  
**Next Review**: Q2 2025 (or when major performance architecture changes occur)