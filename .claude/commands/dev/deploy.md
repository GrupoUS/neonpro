# /deploy - Universal Deployment Command

## Command: `/deploy [environment] [--strategy=blue-green|rolling|canary] [--validate]`

### 🎯 **Purpose**
Intelligent deployment orchestration with environment detection, progressive deployment strategies, and automated validation for any technology stack.

### 🧠 **Intelligence Integration**
```yaml
DEPLOY_INTELLIGENCE:
  activation_triggers:
    - "/deploy [env]"
    - "release [version]"
    - "publish [app]"
    - "ship [feature]"
  
  context_detection:
    environment: "Development, staging, production, preview"
    deployment_strategy: "Blue-green, rolling, canary, direct"
    technology_stack: "Auto-detect: Docker, Kubernetes, Vercel, AWS, Azure"
    validation_level: "Smoke tests, integration tests, full validation"
```

### 🚀 **Execution Flow**

#### **Phase 1: Pre-deployment Validation**
```yaml
VALIDATION:
  quality_gates:
    - "Run comprehensive test suites (unit, integration, e2e)"
    - "Validate code quality and security scans"
    - "Check deployment configuration and environment variables"
    - "Verify database migrations and schema changes"
    
  dependency_verification:
    - "Audit third-party dependencies for vulnerabilities"
    - "Validate build artifacts and checksums"
    - "Check service dependencies and health"
    - "Verify external API integrations and keys"
    
  environment_preparation:
    - "Validate target environment configuration"
    - "Check resource availability and capacity"
    - "Backup current state and data"
    - "Prepare rollback procedures"
```#### **Phase 2: Deployment Execution**
```yaml
DEPLOYMENT:
  strategy_execution:
    blue_green:
      - "Deploy to new environment while maintaining current"
      - "Run validation tests on new environment"
      - "Switch traffic atomically to new environment"
      - "Keep old environment for quick rollback"
      
    rolling:
      - "Deploy incrementally to subset of instances"
      - "Monitor health and performance during rollout"
      - "Continue deployment if validation passes"
      - "Automatic rollback on failure detection"
      
    canary:
      - "Deploy to small percentage of users"
      - "Monitor metrics and user feedback"
      - "Gradually increase traffic percentage"
      - "Full deployment after validation period"
    
  progressive_monitoring:
    - "Real-time health monitoring during deployment"
    - "Performance metrics and error rate tracking"
    - "User experience and business metrics validation"
    - "Automatic alerting on anomalies or failures"
```

#### **Phase 3: Post-deployment Validation**
```yaml
POST_DEPLOYMENT:
  smoke_testing:
    - "Validate critical application functionality"
    - "Test authentication and authorization flows"
    - "Verify database connectivity and operations"
    - "Check external service integrations"
    
  performance_validation:
    - "Monitor response times and throughput"
    - "Check resource utilization patterns"
    - "Validate caching and CDN performance"
    - "Assess database query performance"
    
  business_metrics:
    - "Monitor key business indicators and conversions"
    - "Track user engagement and retention"
    - "Validate feature adoption and usage"
    - "Alert stakeholders on significant changes"
```

### 🔧 **Technology Stack Support**

#### **Frontend Deployment Platforms**
```yaml
VERCEL_DEPLOYMENT:
  features:
    - "Automatic builds from Git repositories"
    - "Preview deployments for pull requests"
    - "Edge functions and middleware support"
    - "Analytics and performance monitoring"
  configuration: "vercel.json, environment variables, domain setup"
  
NETLIFY_DEPLOYMENT:
  features:
    - "Continuous deployment from Git"
    - "Form handling and serverless functions"
    - "Split testing and feature flags"
    - "Built-in CDN and edge optimization"
  configuration: "netlify.toml, build settings, redirects"
  
AWS_S3_CLOUDFRONT:
  features:
    - "Static site hosting with global CDN"
    - "Custom domains and SSL certificates"
    - "Cache invalidation and optimization"
    - "CloudWatch monitoring and logs"
  configuration: "S3 bucket policy, CloudFront distribution, Route53"
```

#### **Backend Deployment Platforms**
```yaml
AWS_ECS_FARGATE:
  features:
    - "Containerized application deployment"
    - "Auto-scaling and load balancing"
    - "Service discovery and networking"
    - "CloudWatch logs and monitoring"
  configuration: "Task definitions, services, load balancers"
  
KUBERNETES:
  features:
    - "Container orchestration and scaling"
    - "Rolling updates and rollback capabilities"
    - "Service mesh and ingress controllers"
    - "ConfigMaps and secrets management"
  configuration: "Deployments, services, ingress, ConfigMaps"
  
DOCKER_SWARM:
  features:
    - "Docker native orchestration"
    - "Service scaling and load balancing"
    - "Overlay networks and service discovery"
    - "Stack deployment and management"
  configuration: "Docker compose files, stack definitions"
  
GOOGLE_CLOUD_RUN:
  features:
    - "Serverless container deployment"
    - "Automatic scaling to zero"
    - "Pay-per-use pricing model"
    - "Cloud Build integration"
  configuration: "Cloud Run service, Cloud Build triggers"
```

#### **Database Migration Support**
```yaml
DATABASE_MIGRATIONS:
  postgresql:
    tools: "Flyway, Liquibase, Alembic, Prisma Migrate"
    patterns: "Schema versioning, rollback strategies, data migrations"
    
  mysql:
    tools: "Flyway, Liquibase, Laravel Migrations, Sequelize"
    patterns: "Version control, backup verification, zero-downtime"
    
  mongodb:
    tools: "Mongoose, MongoDB Migrate, custom scripts"
    patterns: "Document migrations, index management, validation"
    
  sqlite:
    tools: "Alembic, Django Migrations, custom scripts"
    patterns: "File backup, schema evolution, data integrity"
```

### 📊 **Deployment Strategies**

#### **Blue-Green Deployment**
```yaml
BLUE_GREEN_STRATEGY:
  advantages:
    - "Zero-downtime deployment"
    - "Instant rollback capability"
    - "Full environment validation"
    - "Minimal risk to production"
    
  requirements:
    - "Double infrastructure capacity"
    - "Load balancer or traffic router"
    - "Database migration compatibility"
    - "Session state management"
    
  best_for: "Production systems with strict uptime requirements"
```

#### **Rolling Deployment**
```yaml
ROLLING_STRATEGY:
  advantages:
    - "Gradual deployment with monitoring"
    - "Lower resource requirements"
    - "Partial rollback capability"
    - "Continuous service availability"
    
  configuration:
    batch_size: "Number of instances updated simultaneously"
    health_check: "Health validation before proceeding"
    timeout: "Maximum time for instance replacement"
    
  best_for: "Microservices and containerized applications"
```

#### **Canary Deployment**
```yaml
CANARY_STRATEGY:
  advantages:
    - "Risk mitigation through gradual rollout"
    - "Real user feedback and validation"
    - "Performance monitoring under load"
    - "Easy rollback for small user subset"
    
  metrics_monitoring:
    - "Error rates and response times"
    - "Business metrics and conversions"
    - "User feedback and satisfaction"
    - "Resource utilization patterns"
    
  best_for: "User-facing applications with high availability needs"
```

### 🤝 **Agent Orchestration**

```yaml
AGENT_COORDINATION:
  apex_dev:
    role: "Primary deployment orchestration"
    focus: "Infrastructure and application deployment"
    
  apex_qa_debugger:
    role: "Validation and testing coordination"
    activation: "All deployment operations"
    
  apex_researcher:
    role: "Platform best practices research"
    activation: "New deployment platforms or complex configurations"
```

### 🔍 **Usage Examples**

```bash
# Production deployment with validation
/deploy production --strategy=blue-green --validate

# Staging deployment with canary strategy
/deploy staging --strategy=canary

# Development environment quick deployment
/deploy development --strategy=rolling

# Preview deployment for feature testing
/deploy preview --validate
```

### 🎯 **Success Criteria**

```yaml
COMPLETION_VALIDATION:
  deployment_success: "Application successfully deployed and accessible"
  functionality_validation: "All critical features working correctly"
  performance_metrics: "Response times and throughput within acceptable ranges"
  error_rates: "Error rates below threshold (typically <0.1%)"
  monitoring_setup: "Health checks and alerting configured and active"
  rollback_readiness: "Rollback procedures tested and ready if needed"
```

---

**Status**: 🟢 **Universal Deploy Command** | **Strategies**: Blue-Green + Rolling + Canary | **Platforms**: All Major