# App Flows Documentation

This folder contains structured documentation for application flows using Mermaid diagrams for the **NeonPro Healthcare Platform**.

## 📋 Instructions

The creation and organization of all files in this folder must strictly follow best practices for documenting user and system flows. Use Mermaid for sequence diagrams and maintain a consistent structure: Purpose & Scope, Compliance Requirements, Implementation Guidelines, and Mermaid Diagram.

## 🏗️ Complete Structure

### Core Application Flows

- [`main-flow.md`](./main-flow.md) - **Primary application flow** - Complete professional workflow from login to patient interaction completion
- [`auth-flow.md`](./auth-flow.md) - **Authentication processes** - Professional credential validation, multi-factor authentication, and session management
- [`ai-flow.md`](./ai-flow.md) - **AI interaction flows** - PHI sanitization, professional oversight, and healthcare AI features

### Healthcare-Specific Flows

- [`healthcare-patient-flow.md`](./healthcare-patient-flow.md) - **Patient management lifecycle** - Registration, medical documentation, appointments, and treatment tracking

### Compliance Flows

- [`compliance-lgpd-flow.md`](./compliance-lgpd-flow.md) - **LGPD compliance workflows** - Consent management, data subject rights, audit trails, and privacy protection

## 📚 Documentation Standards

### Healthcare Flow Requirements

Each flow document must include:

1. **Purpose & Scope**: Clear description with healthcare context
2. **Compliance Requirements**: LGPD, ANVISA, CFM requirements
3. **Implementation Guidelines**: Step-by-step with healthcare considerations
4. **Mermaid Diagrams**: Visual representation of workflows
5. **Error Handling**: Healthcare-specific error scenarios
6. **Security & Audit**: Patient data protection and audit requirements
7. **Performance Considerations**: Target metrics and optimization
8. **Integration Points**: External and internal system connections

### Compliance Standards

- ✅ **LGPD**: Patient data protection and consent validation
- ✅ **ANVISA**: Medical device software compliance
- ✅ **CFM**: Professional oversight and medical ethics
- ✅ **Audit Trail**: Complete logging of healthcare activities

## 🔍 Flow Categories

### **Core Flows** (Essential for platform operation)

- **Main Flow**: Primary professional workflow - foundation for all other flows
- **Authentication Flow**: Security and professional credential validation
- **Patient Flow**: Complete patient management lifecycle

### **Specialized Flows** (Domain-specific functionality)

- **AI Flow**: Healthcare AI with PHI protection and professional oversight
- **LGPD Flow**: Privacy compliance and data protection workflows

### **Future Flows** (Planned for development)

- `healthcare-appointment-flow.md` - Appointment booking and management
- `healthcare-treatment-flow.md` - Treatment tracking and documentation
- `healthcare-emergency-flow.md` - Emergency access procedures
- `compliance-anvisa-flow.md` - ANVISA regulatory compliance
- `compliance-audit-flow.md` - Audit and logging workflows

## 📊 Flow Relationships

```mermaid
graph TD
    Main[main-flow.md] --> Auth[auth-flow.md]
    Main --> Patient[healthcare-patient-flow.md]
    Main --> AI[ai-flow.md]

    Patient --> LGPD[compliance-lgpd-flow.md]
    AI --> LGPD
    Auth --> LGPD

    Patient --> Appointment[healthcare-appointment-flow.md]*
    Patient --> Treatment[healthcare-treatment-flow.md]*
    Patient --> Emergency[healthcare-emergency-flow.md]*

    LGPD --> Audit[compliance-audit-flow.md]*
    LGPD --> ANVISA[compliance-anvisa-flow.md]*

    style Main fill:#e1f5fe
    style Auth fill:#f3e5f5
    style Patient fill:#e8f5e8
    style AI fill:#fff3e0
    style LGPD fill:#fce4ec
```

_\* Indicates planned future flows_

## 🛠️ Implementation Guidelines

### Mermaid Diagram Standards

- **Consistent Participants**: Professional, Patient, System, Database, Audit Logger
- **Include Error Paths**: Show both success and failure scenarios
- **Compliance Checkpoints**: Highlight LGPD/ANVISA/CFM validation points
- **Color Coding**: Consistent colors for different interaction types

### Healthcare-Specific Considerations

- **Patient Privacy**: Always show consent validation steps
- **Professional Oversight**: Include human validation for critical decisions
- **Audit Requirements**: Document all audit trail touchpoints
- **Emergency Scenarios**: Include emergency access patterns
- **Compliance Validation**: Show regulatory compliance checkpoints

## 📖 Quick Reference

### Core Flow Navigation

- **New to Platform**: Start with [`main-flow.md`](./main-flow.md)
- **Authentication Issues**: See [`auth-flow.md`](./auth-flow.md)
- **Patient Management**: Review [`healthcare-patient-flow.md`](./healthcare-patient-flow.md)
- **AI Features**: Check [`ai-flow.md`](./ai-flow.md)
- **Privacy Compliance**: Reference [`compliance-lgpd-flow.md`](./compliance-lgpd-flow.md)

### Templates and Guidelines

- **Flow Creation**: Follow [`app-flows.md`](./app-flows.md) templates
- **Healthcare Patterns**: Use healthcare-specific templates from app-flows.md
- **Compliance Templates**: LGPD and healthcare compliance patterns available

## 📝 File Naming Conventions

- `main-flow.md` - Core application flow
- `auth-flow.md` - Authentication flow
- `ai-flow.md` - AI integration flow
- `healthcare-{domain}-flow.md` - Healthcare-specific flows
- `compliance-{regulation}-flow.md` - Regulatory compliance flows

## 🔗 External References

- [`docs/architecture/`](../architecture/) - System architecture documentation
- [`docs/prd/`](../prd/) - Product requirements and specifications
- **LGPD Documentation**: Official Brazilian data protection law resources
- **ANVISA Guidelines**: Healthcare software regulatory requirements
