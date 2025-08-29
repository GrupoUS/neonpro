# 🚀 NeonPro Healthcare Performance Testing Suite

Sistema completo de testes de performance para aplicações healthcare, com foco em otimização e monitoramento contínuo.

## 📋 Visão Geral

Este sistema fornece:

- **Testes de Performance Abrangentes**: Lighthouse, Core Web Vitals, API, Database
- **Métricas Healthcare-Específicas**: Acesso emergencial, dados de pacientes, tempo real
- **Automação CI/CD**: Integração completa com GitHub Actions
- **Relatórios Multi-formato**: JSON, Markdown, CSV
- **Monitoramento Contínuo**: Alertas e threshold automation

## 🎯 Performance Targets

### Desenvolvimento

- **Lighthouse Performance**: ≥85/100
- **Page Load Time**: <3s
- **API Response P95**: <200ms
- **Emergency Access**: <10s

### Produção

- **Lighthouse Performance**: ≥95/100
- **Page Load Time**: <1.5s
- **API Response P95**: <100ms
- **Emergency Access**: <5s

## 🚀 Quick Start

### 1. Executar Testes Localmente

```bash
# Teste completo (desenvolvimento)
cd tools/testing/performance
pnpm ts-node run-performance-tests.ts

# Teste rápido
pnpm ts-node run-performance-tests.ts --quick

# Ambiente específico
pnpm ts-node run-performance-tests.ts --environment=staging --users=20 --duration=120
```

### 2. Comandos Disponíveis

```bash
# Teste completo com todas as opções
pnpm ts-node run-performance-tests.ts \
  --baseUrl=http://localhost:3000 \
  --apiUrl=http://localhost:3001 \
  --environment=development \
  --duration=60 \
  --users=10 \
  --outputPath=./reports

# Testes específicos
pnpm ts-node run-performance-tests.ts --lighthouse --no-database
pnpm ts-node run-performance-tests.ts --api --frontend --no-bundle
```

### 3. CI/CD Integration

```yaml
# Copie o arquivo para .github/workflows/
cp scripts/ci-performance-check.yml ../../.github/workflows/performance.yml
```

## 📊 Componentes do Sistema

### 1. Performance Auditor (`analysis/performance-audit.ts`)

- Lighthouse integration
- Core Web Vitals measurement
- Healthcare-specific metrics
- Puppeteer automation

### 2. Bundle Optimizer (`analysis/bundle-optimizer.ts`)

- Bundle size analysis
- Tree shaking opportunities
- Compression analysis
- Optimization recommendations

### 3. Database Performance (`analysis/database-performance.ts`)

- Supabase connection testing
- Healthcare query optimization
- Real-time subscription performance
- Connection pool analysis

### 4. API Performance (`analysis/api-performance.ts`)

- Endpoint response time testing
- Load testing with concurrent users
- Healthcare-specific API validation
- Throughput and error rate analysis

### 5. Frontend Performance (`analysis/frontend-performance.ts`)

- Core Web Vitals measurement
- React component performance
- User interaction metrics
- Accessibility validation

### 6. Performance Test Runner (`performance-test-runner.ts`)

- Orchestrates all test suites
- Generates comprehensive reports
- Validates against targets
- Provides actionable recommendations

## 🏥 Healthcare-Specific Features

### Emergency Access Testing

- **Target**: <10s total access time
- **Crítico**: Acesso a dados vitais do paciente
- **Validação**: Formulário emergencial + dados médicos

### Patient Data Performance

- **Target**: <2s loading time
- **Escopo**: Lista de pacientes + detalhes médicos
- **Otimização**: Cache inteligente + paginação

### Real-time Updates

- **Target**: <500ms latency
- **Tecnologia**: WebSocket + Supabase subscriptions
- **Validação**: Atualizações médicas em tempo real

### Form Submission Healthcare

- **Target**: <1s processing time
- **Crítico**: Formulários médicos e prescrições
- **Validação**: LGPD compliance + data integrity

## 🔧 Configuração

### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
```

### Configuration File (`config/performance.config.json`)

- Environment-specific targets
- Alerting thresholds
- Monitoring retention policies
- CI/CD settings

## 📈 Relatórios e Métricas

### 1. JSON Report (`performance-report.json`)

```json
{
  "timestamp": "2025-08-21T...",
  "summary": {
    "overallScore": 95,
    "passedTargets": 18,
    "totalTargets": 20
  },
  "lighthouse": { "performance": 95 },
  "healthcare": { "emergencyAccessTime": 3500 },
  "recommendations": [...]
}
```

### 2. Markdown Report (`performance-report.md`)

- Human-readable summary
- Pass/fail status for each test
- Actionable recommendations
- Performance improvements

### 3. CSV Metrics (`performance-metrics.csv`)

- Trend analysis
- Historical comparison
- KPI tracking
- Dashboard integration

## 🚨 Alerting e Monitoring

### Critical Alerts

- Performance score <80
- Emergency access >10s
- API error rate >5%
- Database connection failures

### Warning Alerts

- Performance score <90
- Bundle size >500KB
- API P95 >100ms
- Memory leaks detected

## 🔄 CI/CD Integration

### GitHub Actions Features

- **Automated Testing**: Run on every PR
- **PR Comments**: Results posted automatically
- **Threshold Validation**: Fail build if targets not met
- **Artifact Storage**: Reports stored for 30 days
- **Bundle Analysis**: Size tracking and alerts

### Usage in CI

```yaml
- name: Run Performance Tests
  run: |
    cd tools/testing/performance
    pnpm ts-node run-performance-tests.ts --environment=staging
```

## 🎯 Best Practices

### 1. Development

- Run quick tests during development
- Focus on specific areas with targeted flags
- Use --quick flag for rapid feedback

### 2. Staging

- Full test suite before production
- Validate under realistic load
- Check healthcare-specific scenarios

### 3. Production

- Scheduled daily runs
- Monitor trends over time
- Alert on regressions

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Timeouts**
   ```bash
   # Increase timeout in config
   "testDuration": 120
   ```

2. **Memory Issues**
   ```bash
   # Reduce concurrent users
   --users=5
   ```

3. **CI/CD Failures**
   ```bash
   # Check environment variables
   echo $SUPABASE_URL
   ```

## 📚 Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**NeonPro Healthcare Performance Testing Suite v1.0**\
_Desenvolvido para garantir performance crítica em aplicações de saúde_
