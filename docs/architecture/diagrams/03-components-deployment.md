# 🏗️ NeonPro Healthcare Platform - Components & Deployment

## 🧩 C4 Level 3: Component Diagram - Healthcare API

```mermaid
C4Component
  title NeonPro Healthcare API - Component Architecture

  Container_Boundary(api, "Healthcare API Container") {
    Component(router, "Hono Router", "TypeScript", "HTTP request routing and middleware orchestration")
    Component(auth_comp, "Authentication Component", "JWT + jose", "Professional license validation and token management")
    Component(rate_limiter, "Rate Limiter", "Healthcare-aware", "Endpoint-specific rate limiting with emergency bypass")
    Component(validator, "Input Validator", "Zod + Brazilian schemas", "CPF, CNS, and healthcare data validation")
    Component(lgpd_comp, "LGPD Middleware", "Compliance engine", "Data access consent and audit logging")
    Component(encrypt_comp, "Encryption Service", "AES-256-GCM", "Field-level encryption for patient data")
    Component(audit_comp, "Audit Logger", "Structured logging", "Complete audit trails for regulatory compliance")
    Component(emergency_comp, "Emergency Access", "Professional oversight", "Licensed physician emergency procedures")
    
    Component(patient_svc, "Patient Service", "Business Logic", "Patient management with LGPD compliance")
    Component(appointment_svc, "Appointment Service", "Business Logic", "Scheduling with professional validation")
    Component(treatment_svc, "Treatment Service", "Business Logic", "Medical treatment tracking and reporting")
    Component(compliance_svc, "Compliance Service", "Regulatory", "ANVISA, CRM/CFM integration and reporting")
    
    Component(db_client, "Database Client", "Supabase SDK", "PostgreSQL connection with RLS enforcement")
    Component(external_apis, "External API Client", "HTTP Client", "Brazilian healthcare system integrations")
  }

  Rel(router, auth_comp, "Validates requests", "Internal API")
  Rel(router, rate_limiter, "Checks limits", "Internal API")
  Rel(auth_comp, validator, "Validates input", "Internal API")
  Rel(validator, lgpd_comp, "Checks consent", "Internal API")
  Rel(lgpd_comp, encrypt_comp, "Encrypts data", "Internal API")
  Rel(router, audit_comp, "Logs operations", "Internal API")
  Rel(auth_comp, emergency_comp, "Emergency access", "Internal API")

  Rel(router, patient_svc, "Routes requests", "Internal API")
  Rel(router, appointment_svc, "Routes requests", "Internal API")
  Rel(router, treatment_svc, "Routes requests", "Internal API")
  Rel(router, compliance_svc, "Routes requests", "Internal API")

  Rel(patient_svc, db_client, "Queries data", "SQL")
  Rel(appointment_svc, db_client, "Queries data", "SQL") 
  Rel(treatment_svc, db_client, "Queries data", "SQL")
  Rel(compliance_svc, external_apis, "Integrates APIs", "HTTPS")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## 📱 Frontend Component Architecture

```mermaid
flowchart TB
    subgraph "Next.js 15 Application"
        subgraph "App Router Structure"
            A1[app/layout.tsx - Root Layout]
            A2[app/page.tsx - Landing Page]
            A3[app/dashboard - Patient Dashboard]
            A4[app/provider - Provider Interface]
            A5[app/admin - Admin Console]
            A6[app/emergency - Emergency Access]
        end
        
        subgraph "Shared Components"
            B1[components/ui - shadcn/ui Components]
            B2[components/healthcare - Healthcare Components]
            B3[components/forms - LGPD Compliant Forms]
            B4[components/auth - Authentication Components]
            B5[components/navigation - Role-based Navigation]
        end
        
        subgraph "Business Logic"
            C1[hooks/usePatient - Patient Management]
            C2[hooks/useAppointment - Appointment Booking]
            C3[hooks/useAuth - Authentication & Roles]
            C4[hooks/useLGPD - Consent Management]
            C5[hooks/useEmergency - Emergency Procedures]
        end
        
        subgraph "State Management"
            D1[contexts/AuthContext - User Authentication]
            D2[contexts/ClinicContext - Clinic Isolation]
            D3[contexts/LGPDContext - Privacy Compliance]
            D4[contexts/ThemeContext - UI Theming]
        end
        
        subgraph "API Integration"
            E1[lib/api - Hono RPC Client]
            E2[lib/types - TypeScript Definitions]
            E3[lib/validation - Input Validation]
            E4[lib/encryption - Client-side Encryption]
        end
    end

    A1 --> B1
    A3 --> C1
    A4 --> C2
    A6 --> C5
    B2 --> B3
    C1 --> D1
    C2 --> D2
    C4 --> D3
    D1 --> E1
    E1 --> E2

    style A6 fill:#ffcdd2
    style C5 fill:#ffcdd2
    style D3 fill:#c8e6c9
    style E4 fill:#fff3e0
```

## 🏗️ Monorepo Package Architecture

```mermaid
flowchart LR
    subgraph "Apps (3)"
        APP1[web - Next.js Frontend]
        APP2[api - Hono.dev Backend] 
        APP3[docs - Documentation Site]
    end
    
    subgraph "Core Packages (23)"
        PKG1[ui - Shared UI Components]
        PKG2[types - TypeScript Definitions]
        PKG3[database - Supabase Integration]
        PKG4[auth - Authentication Logic]
        PKG5[compliance - LGPD/ANVISA Utils]
        PKG6[shared - Common Utilities]
        PKG7[utils - Helper Functions]
        PKG8[config - Configuration Management]
    end
    
    subgraph "Healthcare Packages"
        HPKG1[brazilian-healthcare-ui - BR UI Components]
        HPKG2[audit-trail - Compliance Logging]
        HPKG3[security - Security Middleware]
        HPKG4[constitutional-layer - AI Governance]
    end
    
    subgraph "Infrastructure Packages"
        IPKG1[devops - CI/CD and Deployment]
        IPKG2[monitoring - Observability Tools]
        IPKG3[cache - Caching Strategies]
        IPKG4[integrations - External API Clients]
    end
    
    subgraph "Domain Packages"
        DPKG1[domain - Business Logic]
        DPKG2[core-services - Service Layer]
        DPKG3[health-dashboard - Health Monitoring]
        DPKG4[enterprise - Enterprise Features]
        DPKG5[ai - AI/ML Integration]
    end

    APP1 --> PKG1
    APP1 --> PKG2
    APP1 --> HPKG1
    APP2 --> PKG3
    APP2 --> PKG4
    APP2 --> PKG5
    APP2 --> HPKG3
    APP3 --> PKG6
    
    PKG3 --> HPKG2
    PKG4 --> HPKG3
    PKG5 --> HPKG4
    
    DPKG2 --> IPKG2
    DPKG3 --> IPKG3
    DPKG4 --> IPKG1

    style HPKG1 fill:#e1f5fe
    style HPKG2 fill:#e8f5e8
    style HPKG3 fill:#fff3e0
    style HPKG4 fill:#f3e5f5
```

## ☁️ Deployment Architecture

```mermaid
C4Deployment
  title NeonPro Healthcare Platform - Production Deployment

  Deployment_Node(cdn, "Vercel Edge Network", "Global CDN") {
    Deployment_Node(edge_locations, "Edge Locations", "Worldwide") {
      Container(static_assets, "Static Assets", "CSS, JS, Images", "Cached static content")
      Container(edge_functions, "Edge Functions", "Hono.dev Runtime", "API endpoints at the edge")
    }
  }

  Deployment_Node(vercel_platform, "Vercel Platform", "Serverless Infrastructure") {
    Deployment_Node(frontend_runtime, "Next.js Runtime", "Node.js 18+") {
      Container(nextjs_app, "NeonPro Web App", "Next.js 15", "Healthcare management interface")
    }
    
    Deployment_Node(api_runtime, "Hono Runtime", "Edge Runtime") {
      Container(healthcare_api, "Healthcare API", "Hono.dev 4.5.8", "RESTful APIs with Brazilian compliance")
    }
  }

  Deployment_Node(supabase_cloud, "Supabase Cloud", "Database Infrastructure") {
    Deployment_Node(db_cluster, "PostgreSQL Cluster", "High Availability") {
      ContainerDb(primary_db, "Primary Database", "PostgreSQL 15", "Patient data with RLS")
      ContainerDb(replica_db, "Read Replicas", "PostgreSQL 15", "Query performance optimization")
    }
    
    Deployment_Node(supabase_services, "Supabase Services", "Managed Services") {
      Container(auth_service, "Auth Service", "GoTrue", "User authentication and sessions")
      Container(realtime_service, "Realtime Service", "WebSocket", "Real-time data synchronization")
      Container(edge_functions_sb, "Database Functions", "PostgreSQL", "Database-level business logic")
    }
  }

  Deployment_Node(external_services, "External Services", "Third-party Integrations") {
    System_Ext(anvisa_apis, "ANVISA APIs", "Brazilian health surveillance integration")
    System_Ext(crm_systems, "CRM/CRF Systems", "Professional license validation")
    System_Ext(payment_gateways, "Payment Systems", "Healthcare payment processing")
    System_Ext(notification_services, "Notification Services", "SMS, Email, Push notifications")
  }

  Deployment_Node(monitoring_stack, "Observability Stack", "Monitoring & Logging") {
    Container(sentry, "Sentry", "Error Tracking", "Application error monitoring and alerting")
    Container(vercel_analytics, "Vercel Analytics", "Performance", "Real user monitoring and performance metrics")
    Container(audit_storage, "Audit Storage", "Long-term Storage", "LGPD compliance audit logs")
  }

  Rel(cdn, vercel_platform, "Routes traffic", "HTTPS")
  Rel(nextjs_app, healthcare_api, "API calls", "HTTPS/JSON")
  Rel(healthcare_api, primary_db, "Database queries", "PostgreSQL Protocol")
  Rel(primary_db, replica_db, "Replication", "Streaming Replication")
  Rel(healthcare_api, auth_service, "Authentication", "Internal API")
  Rel(nextjs_app, realtime_service, "Real-time updates", "WebSocket")
  
  Rel(healthcare_api, anvisa_apis, "Compliance reporting", "HTTPS")
  Rel(healthcare_api, crm_systems, "License validation", "HTTPS")
  Rel(healthcare_api, payment_gateways, "Payment processing", "HTTPS")
  Rel(healthcare_api, notification_services, "Send notifications", "HTTPS")
  
  Rel(nextjs_app, sentry, "Error reporting", "HTTPS")
  Rel(healthcare_api, sentry, "Error reporting", "HTTPS")
  Rel(nextjs_app, vercel_analytics, "Performance data", "HTTPS")
  Rel(healthcare_api, audit_storage, "Audit logs", "HTTPS")

  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## 🔧 Infrastructure Components

```mermaid
flowchart TB
    subgraph "CI/CD Pipeline"
        CI1[GitHub Actions Workflows]
        CI2[Turborepo Build Cache]
        CI3[TypeScript Type Checking]
        CI4[Oxlint Code Quality]
        CI5[Vitest Unit Tests]
        CI6[Playwright E2E Tests]
        CI7[Security Scanning]
        CI8[LGPD Compliance Checks]
    end
    
    subgraph "Development Environment"
        DEV1[Local Development Server]
        DEV2[Supabase Local Stack]
        DEV3[Database Migrations]
        DEV4[Hot Module Replacement]
        DEV5[TypeScript Watch Mode]
        DEV6[Mock External APIs]
    end
    
    subgraph "Staging Environment"
        STAGE1[Vercel Preview Deployments]
        STAGE2[Supabase Staging Database]
        STAGE3[Integration Testing]
        STAGE4[Security Validation]
        STAGE5[Performance Testing]
        STAGE6[Compliance Verification]
    end
    
    subgraph "Production Environment"
        PROD1[Vercel Production Deployment]
        PROD2[Supabase Production Database]
        PROD3[CDN Global Distribution]
        PROD4[Real-time Monitoring]
        PROD5[Error Tracking & Alerting]
        PROD6[Audit Log Storage]
        PROD7[Backup & Recovery]
        PROD8[Security Monitoring]
    end
    
    subgraph "Monitoring & Observability"
        MON1[Sentry Error Tracking]
        MON2[Vercel Analytics]
        MON3[Database Performance Monitoring]
        MON4[API Response Time Monitoring]
        MON5[Security Event Monitoring]
        MON6[LGPD Compliance Monitoring]
        MON7[Professional License Monitoring]
        MON8[Emergency Access Monitoring]
    end

    CI1 --> STAGE1
    STAGE6 --> PROD1
    PROD1 --> MON1
    PROD2 --> MON3
    PROD4 --> MON5

    style CI7 fill:#ffcdd2
    style CI8 fill:#c8e6c9
    style PROD8 fill:#ffcdd2
    style MON6 fill:#c8e6c9
    style MON8 fill:#fff3e0
```

## 🌐 Network Architecture & Security

```mermaid
flowchart TB
    subgraph "External Users"
        EU1[Patients - Web Browsers]
        EU2[Healthcare Providers - Professional Apps]  
        EU3[Emergency Physicians - Mobile/Web]
        EU4[Clinic Administrators - Management Console]
    end
    
    subgraph "Edge Security Layer"
        ES1[Vercel Edge Network]
        ES2[DDoS Protection]
        ES3[Web Application Firewall]
        ES4[Rate Limiting]
        ES5[Geographic Restrictions]
        ES6[TLS 1.3 Termination]
    end
    
    subgraph "Application Security Layer"
        AS1[JWT Authentication]
        AS2[Professional License Validation]
        AS3[Role-Based Access Control]
        AS4[LGPD Consent Validation]
        AS5[Input Sanitization]
        AS6[Output Encoding]
        AS7[Audit Logging]
        AS8[Emergency Access Controls]
    end
    
    subgraph "Data Security Layer"
        DS1[Field-Level Encryption]
        DS2[Database Row-Level Security]
        DS3[Clinic Isolation clinic_id]
        DS4[Encrypted Backups]
        DS5[Secure Key Management]
        DS6[Data Anonymization]
        DS7[Audit Trail Encryption]
    end
    
    subgraph "Network Security"
        NS1[Private Network Supabase]
        NS2[API Gateway Protection]
        NS3[Database Connection Pooling]
        NS4[Encrypted Inter-Service Communication]
        NS5[Certificate Management]
        NS6[Network Monitoring]
    end

    EU1 --> ES1
    EU2 --> ES2
    EU3 --> ES3
    EU4 --> ES4
    
    ES1 --> AS1
    ES2 --> AS2
    ES3 --> AS3
    ES4 --> AS4
    
    AS1 --> DS1
    AS2 --> DS2
    AS3 --> DS3
    AS7 --> DS7
    AS8 --> DS6
    
    DS1 --> NS1
    DS2 --> NS2
    DS3 --> NS3

    style ES2 fill:#ffcdd2
    style AS8 fill:#fff3e0
    style DS1 fill:#e8f5e8
    style DS7 fill:#c8e6c9
```

---

## 🔧 Component Dependencies & Data Flow

### 📦 Package Dependency Graph

```
┌─ apps/web (Next.js Frontend)
│  ├─ @neonpro/ui (Shared Components)
│  ├─ @neonpro/types (TypeScript Definitions)
│  ├─ @neonpro/brazilian-healthcare-ui (BR Components)
│  ├─ @neonpro/auth (Authentication)
│  └─ @neonpro/compliance (LGPD Utils)
│
├─ apps/api (Hono.dev Backend)  
│  ├─ @neonpro/database (Supabase Client)
│  ├─ @neonpro/auth (JWT Validation)
│  ├─ @neonpro/security (Middleware)
│  ├─ @neonpro/compliance (LGPD Engine)
│  ├─ @neonpro/audit-trail (Logging)
│  └─ @neonpro/integrations (External APIs)
│
└─ shared packages
   ├─ @neonpro/types (Shared TypeScript)
   ├─ @neonpro/utils (Common Utilities)
   ├─ @neonpro/config (Configuration)
   └─ @neonpro/domain (Business Logic)
```

### 🏥 Healthcare Component Interactions

```
Patient Request → Rate Limiter → JWT Auth → License Validation → 
LGPD Consent → Input Validation → Business Logic → Database (RLS) → 
Audit Logger → Response Encryption → Client
```

### 🔐 Security Component Stack

1. **Network Layer**: TLS 1.3, DDoS protection, WAF
2. **Authentication Layer**: JWT with professional licenses
3. **Authorization Layer**: RBAC with clinic isolation
4. **Application Layer**: Input validation, output encoding
5. **Data Layer**: Field encryption, RLS, audit trails
6. **Monitoring Layer**: Security events, anomaly detection
