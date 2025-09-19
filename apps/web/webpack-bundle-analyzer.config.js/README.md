# Webpack Bundle Analyzer Configuration

## Overview
This configuration provides comprehensive bundle analysis and performance budget monitoring for the NeonPro healthcare platform. It ensures optimal performance, LGPD compliance, and healthcare-specific requirements.

## Features

### Healthcare-Specific Performance Budgets
- **Critical healthcare workflows**: 300KB max size, <2s load time
- **Emergency features**: 200KB max size, <1s load time
- **Mobile optimization**: 350KB max size, <3s load time
- **Accessibility features**: 250KB max size, <2.5s load time
- **Telemedicine features**: 500KB max size for real-time video

### LGPD Compliance Performance Requirements
- **Data transfer efficiency**: 500KB max per transfer
- **PII processing budget**: 2s max processing time, 50MB max memory
- **Audit trail performance**: 1s max for audit logging
- **Encryption overhead**: 5% max overhead for encryption

### Code Splitting Strategies
- **Route-based splitting**: Optimize by application routes
- **Feature-based splitting**: Separate healthcare features (patients, appointments, medical records, billing, admin)
- **Vendor-based splitting**: Split vendor libraries into separate chunks

### Monitoring and Alerting
- **Real-time monitoring**: 10% sample rate with customizable thresholds
- **Healthcare metrics**: Emergency, critical data, mobile, accessibility load times
- **Compliance violation alerts**: Automatic build failure on LGPD violations
- **Performance budget violations**: Configurable warning and critical thresholds

## Usage

### Development Mode
```bash
# Run bundle analysis in development
ANALYZE=true npm run build
```

### Production Mode
```bash
# Production build with performance budget checks
npm run build
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Build and Analyze
  run: |
    npm ci
    ANALYZE=true npm run build
    npx webpack-bundle-analyzer stats/bundle-stats.json
```

## Configuration Files

### Main Configuration
- `webpack-bundle-analyzer.config.js/config.js` - Main configuration file

### Generated Reports
- `bundle-analysis-report.html` - Comprehensive analysis report
- `healthcare-performance-report.json` - Healthcare-specific performance metrics
- `bundle-analysis-alerts.log` - Alert notifications

## Performance Budgets

### Budget Categories
- **Critical**: Emergency healthcare features
- **Main**: Primary application bundle
- **Telemedicine**: Real-time video features
- **Patient Data**: Patient management features
- **Admin**: Administrative and reporting features

### Feature-Specific Budgets
- **Emergency**: Ultra-lightweight emergency access
- **Mobile**: Optimized for healthcare workers in field
- **Accessibility**: WCAG 2.1 AA+ compliant features

## Compliance Integration

### LGPD Compliance
- Automatic PII detection and size monitoring
- Data transfer efficiency tracking
- Encryption overhead monitoring
- Audit trail performance monitoring

### Healthcare Compliance
- Emergency access performance guarantees
- Mobile optimization for field workers
- Accessibility compliance monitoring
- Security score validation

## Recommendations

The system provides automated recommendations for:
- Code splitting strategies
- Lazy loading opportunities
- Compression optimization
- Caching strategies
- Performance improvements

## Integration with Vite

This configuration integrates seamlessly with the existing Vite setup:
- Compatible with existing healthcare SRI plugin
- Works with TanStack Router code splitting
- Supports existing optimization settings
- Maintains healthcare security requirements

## Monitoring Dashboard

The configuration generates comprehensive reports including:
- Bundle size analysis
- Performance budget compliance
- LGPD compliance metrics
- Healthcare-specific performance indicators
- Optimization recommendations

## Healthcare Context

This configuration is specifically designed for healthcare applications:
- Emergency access prioritization
- Mobile optimization for healthcare workers
- Accessibility compliance for medical interfaces
- LGPD compliance for Brazilian healthcare data
- Performance requirements for real-time telemedicine