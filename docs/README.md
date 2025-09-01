# 📚 NeonPro Documentation

> **Healthcare-focused aesthetic clinic management system**\
> Built with Next.js 15+, Supabase, TypeScript, and Vercel

## 📋 Documentation Structure

### Core Documentation Files

- **[`architecture.md`](./architecture.md)** - Complete system architecture, data models, and technical specifications
- **[`frontend-comprehensive-guide.md`](./frontend-comprehensive-guide.md)** - Frontend development guide with UI/UX specifications and design patterns
- **[`project.md`](./project.md)** - Project configuration, tech stack standards, and development guidelines

### Documentation Categories

```
docs/
├── README.md                           # This file - documentation overview
├── architecture.md                     # System architecture and technical specs
├── frontend-comprehensive-guide.md     # Frontend development guide and UI/UX specs
├── project.md                          # Project configuration and development standards
├── prd.md                             # Product Requirements Document
├── ttd-flow.md                        # Test-Driven Development workflow
├── memory.md                          # Memory management guidelines
├── brief.md                           # Project brief and overview
├── architecture/                      # Architecture documentation
│   └── source-tree.md                 # Monorepo structure and organization
├── database-schema/                   # Database documentation
│   └── database-schema-consolidated.md # Complete database schema
├── prd/                               # Product requirements documentation
├── testing/                           # Testing documentation
├── qa/                                # Quality assurance documentation
└── mistakes/                          # Learning and mistake documentation
```

## 🚀 Quick Start Guide

### For Developers

1. **Read the Architecture**: Start with [`architecture.md`](./architecture.md) to understand the system design
2. **Review Frontend Guide**: Check [`frontend-comprehensive-guide.md`](./frontend-comprehensive-guide.md) for development patterns and UI/UX guidelines
3. **Follow Project Standards**: Use [`project.md`](./project.md) for project configuration and development standards

### For Designers

1. **User Personas**: Review personas and design patterns in [`frontend-comprehensive-guide.md`](./frontend-comprehensive-guide.md)
2. **Design System**: Follow shadcn/ui + Tailwind CSS guidelines with healthcare-specific components
3. **Accessibility**: Ensure WCAG 2.1 AA+ compliance for healthcare applications

### For Project Managers

1. **Business Requirements**: Review business logic and system architecture in [`architecture.md`](./architecture.md)
2. **Product Requirements**: Check feature specifications and compliance requirements in [`prd.md`](./prd.md)
3. **Project Configuration**: Review project setup and quality gates in [`project.md`](./project.md)
4. **Quality Standards**: Monitor development workflow and testing in [`ttd-flow.md`](./ttd-flow.md)

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

| Category             | Technology      | Version | Purpose                              |
| -------------------- | --------------- | ------- | ------------------------------------ |
| **Frontend**         | Next.js         | 15.0+   | React framework with App Router      |
| **Backend**          | Supabase        | Latest  | Backend-as-a-Service with PostgreSQL |
| **Database**         | PostgreSQL      | 15+     | Primary database with RLS            |
| **Deployment**       | Vercel          | Latest  | Edge deployment platform             |
| **UI Framework**     | Tailwind CSS    | 3.4+    | Utility-first CSS framework          |
| **Components**       | shadcn/ui       | Latest  | Accessible React components          |
| **State Management** | Zustand         | 4.5+    | Lightweight state management         |
| **Forms**            | React Hook Form | Latest  | Performant forms with validation     |
| **Validation**       | Zod             | Latest  | TypeScript-first schema validation   |
| **Language**         | TypeScript      | 5.6+    | Type-safe JavaScript                 |

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

### Development Configuration

The project follows a systematic development approach configured through:

- **Project Configuration**: Comprehensive setup in `docs/project.md`
- **Context Engineering**: Intelligent context loading and optimization via Archon MCP
- **Healthcare Compliance**: LGPD, ANVISA, and CFM compliance settings
- **Quality Gates**: Automated quality checks and constitutional principles
- **Performance Targets**: Healthcare-specific performance requirements
- **Workflow Management**: TDD workflow defined in `docs/ttd-flow.md`

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
- **Frontend Development**: Refer to [`frontend-comprehensive-guide.md`](./frontend-comprehensive-guide.md)
- **Project Configuration**: Refer to [`project.md`](./project.md)
- **Database Schema**: Refer to [`database-schema/database-schema-consolidated.md`](./database-schema/database-schema-consolidated.md)

### Compliance & Legal

- **LGPD Compliance**: Data protection officer contact
- **ANVISA Requirements**: Regulatory affairs team
- **CFM Standards**: Medical advisory board

---

**Last Updated**: 2025-01-26\
**Version**: 1.0\
**Compliance**: LGPD, ANVISA, CFM\
**Architecture**: Next.js 15+ + Supabase + Vercel
