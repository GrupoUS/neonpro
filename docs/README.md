# 📚 NeonPro Documentation

> **Healthcare-focused aesthetic clinic management system**  
> Built with Next.js 15+, Supabase, TypeScript, and Vercel

## 📋 Documentation Structure

### Core Documentation Files

- **[`architecture.md`](./architecture.md)** - Complete system architecture, data models, and technical specifications
- **[`front-end-spec.md`](./front-end-spec.md)** - UI/UX specifications, user personas, and design guidelines
- **[`project_rules.md`](./project_rules.md)** - Project rules, tech stack standards, and development guidelines

### Documentation Categories

```
docs/
├── README.md              # This file - documentation overview
├── architecture.md        # System architecture and technical specs
├── front-end-spec.md     # UI/UX specifications and design system
├── project_rules.md      # Development rules and standards
└── shards/               # Modular architecture components
    └── architecture/     # Architecture shards and modules
```

## 🚀 Quick Start Guide

### For Developers

1. **Read the Architecture**: Start with [`architecture.md`](./architecture.md) to understand the system design
2. **Review UI/UX Specs**: Check [`front-end-spec.md`](./front-end-spec.md) for design guidelines
3. **Follow Project Rules**: Use [`project_rules.md`](./project_rules.md) for development standards

### For Designers

1. **User Personas**: Review personas in [`front-end-spec.md`](./front-end-spec.md)
2. **Design System**: Follow shadcn/ui + Tailwind CSS guidelines
3. **Accessibility**: Ensure WCAG 2.1 AA compliance for healthcare applications

### For Project Managers

1. **Business Requirements**: Review business logic in [`architecture.md`](./architecture.md)
2. **Compliance**: Check LGPD/ANVISA/CFM requirements in [`project_rules.md`](./project_rules.md)
3. **Quality Gates**: Monitor quality metrics defined in project rules

## 🏥 Healthcare Compliance

### Brazilian Healthcare Regulations

- **LGPD** (Lei Geral de Proteção de Dados) - Brazilian data protection law
- **ANVISA** - Brazilian health regulatory agency compliance
- **CFM** (Conselho Federal de Medicina) - Medical council requirements

### Security & Privacy

- **Data Encryption**: AES-256 for sensitive data, TLS 1.3 for transport
- **Access Control**: Role-based permissions with Row Level Security
- **Audit Trails**: Comprehensive logging for all patient data access
- **Consent Management**: Granular consent tracking and management

## 🛠️ Tech Stack Overview

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|----------|
| **Frontend** | Next.js | 15.0+ | React framework with App Router |
| **Backend** | Supabase | Latest | Backend-as-a-Service with PostgreSQL |
| **Database** | PostgreSQL | 15+ | Primary database with RLS |
| **Deployment** | Vercel | Latest | Edge deployment platform |
| **UI Framework** | Tailwind CSS | 3.4+ | Utility-first CSS framework |
| **Components** | shadcn/ui | Latest | Accessible React components |
| **State Management** | Zustand | 4.5+ | Lightweight state management |
| **Forms** | React Hook Form | Latest | Performant forms with validation |
| **Validation** | Zod | Latest | TypeScript-first schema validation |
| **Language** | TypeScript | 5.6+ | Type-safe JavaScript |

### Healthcare-Specific Integrations

- **Twilio** - SMS notifications and communication
- **Calendly** - Appointment scheduling integration
- **Stripe/PagSeguro** - Payment processing for Brazilian market
- **FHIR/HL7** - Healthcare data standards (future)

## 📊 Quality Standards

### Code Quality Metrics

- **Test Coverage**: ≥90% for medical data handling
- **Maintainability Index**: ≥85 (healthcare-grade)
- **Security Rating**: A rating in all assessments
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <2s page load, <500ms API response

### Development Workflow

1. **Feature Development**: Feature branches with compliance impact assessment
2. **Code Review**: Minimum 2 reviewers for medical data changes
3. **Testing**: Unit, integration, and E2E tests with healthcare scenarios
4. **Deployment**: Blue-green deployment with health checks
5. **Monitoring**: Real-time monitoring with Sentry and custom metrics

## 🔧 Configuration

### Trae AI Configuration

The project includes a `.traeconfig` file in the root directory that configures:

- **Project Rules**: Automatic loading of `docs/project_rules.md`
- **Context Engineering**: Intelligent context loading and optimization
- **Healthcare Compliance**: LGPD, ANVISA, and CFM compliance settings
- **Quality Gates**: Automated quality checks and standards
- **Performance Targets**: Healthcare-specific performance requirements

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📈 Performance Targets

### Core Web Vitals (Healthcare-Optimized)

- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Healthcare-Specific Metrics

- **Appointment Booking**: <3 seconds from start to confirmation
- **Patient Search**: <500ms for patient lookup
- **Medical Forms**: <2 seconds for form validation and submission
- **Real-time Updates**: <100ms for appointment status updates

## 🚨 Emergency Procedures

### System Downtime

1. **Immediate Response**: Activate backup systems and notify stakeholders
2. **Communication**: Update status page and notify affected clinics
3. **Recovery**: Follow disaster recovery procedures in architecture docs
4. **Post-Incident**: Conduct post-mortem and update procedures

### Data Breach Response

1. **Immediate Containment**: Isolate affected systems
2. **Assessment**: Determine scope and impact of breach
3. **Notification**: Notify authorities within LGPD timeframes
4. **Recovery**: Implement recovery procedures and security improvements

## 📞 Support & Contact

### Development Team

- **Architecture Questions**: Refer to [`architecture.md`](./architecture.md)
- **UI/UX Questions**: Refer to [`front-end-spec.md`](./front-end-spec.md)
- **Development Standards**: Refer to [`project_rules.md`](./project_rules.md)

### Compliance & Legal

- **LGPD Compliance**: Data protection officer contact
- **ANVISA Requirements**: Regulatory affairs team
- **CFM Standards**: Medical advisory board

---

**Last Updated**: 2025-01-26  
**Version**: 1.0  
**Compliance**: LGPD, ANVISA, CFM  
**Architecture**: Next.js 15+ + Supabase + Vercel