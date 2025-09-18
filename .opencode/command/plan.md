---
description: Execute the implementation planning workflow using the plan template to generate design artifacts for NeonPro platform features.
---

Given the implementation details provided as an argument, do this:

1. **Environment Setup & Path Resolution**
   - Run `.specify/scripts/bash/setup-plan.sh --json` from the repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH
   - All future file paths must be absolute
   - Validate that the feature specification exists and is properly formatted

2. **Comprehensive Specification Analysis**
   Read and analyze the feature specification to understand:
   - **User Stories & Acceptance Criteria**: Parse all functional requirements and user scenarios
   - **Business Objectives**: Extract value propositions and success metrics 
   - **Technical Constraints**: Identify dependencies, performance requirements, and integration points
   - **Compliance Requirements**: Healthcare-specific needs (LGPD, ANVISA, CFM)
   - **Success Criteria**: Measurable outcomes and KPIs

3. **Constitutional Compliance Review**
   Read the constitution at `.specify/memory/constitution.md` to ensure alignment with:
   - **Compliance-First Development**: LGPD (Lei Geral de Proteção de Dados), ANVISA medical device regulations, CFM professional standards
   - **Test-Driven Development**: 90% coverage for healthcare-critical components, automated accessibility testing
   - **AI-Enhanced Architecture**: Conversational AI capabilities, predictive analytics integration, multi-provider failover
   - **Mobile-First Design**: 70%+ mobile usage optimization, progressive web app capabilities
   - **Real-Time Operations**: WebSocket subscriptions, <500ms response times for critical healthcare workflows
   - **Security & Privacy**: Patient data protection, audit trails, role-based access control

4. **NeonPro Platform Context Integration**
   Incorporate NeonPro-specific requirements from existing PRDs:
   - **AI-Powered Patient Engagement**: 24/7 Portuguese chat system, WhatsApp Business API integration
   - **Anti-No-Show Engine**: Behavioral prediction algorithms, personalized reminder automation
   - **Unified Command Dashboard**: Real-time operational metrics, mobile-responsive interfaces
   - **Predictive Analytics**: No-show risk scoring (0.00-1.00), inventory management, behavioral CRM
   - **Revenue Protection**: Target $468,750+ annual revenue protection through efficiency gains
   - **Performance Targets**: <2s page load, <500ms API response, 99.9% uptime, NPS >70

5. **Enhanced Implementation Planning Execution**
   Execute the implementation plan template with NeonPro-specific enhancements:
   
   **Phase 0 - Research & Discovery**:
   - Load `.specify/templates/plan-template.md` (copied to IMPL_PLAN path)
   - Generate comprehensive `research.md` including:
     * Healthcare compliance research (LGPD, ANVISA, CFM)
     * Technology stack validation (Turborepo, PNPM, Bun, TypeScript, React 19)
     * AI/ML integration patterns (OpenAI GPT-4, Anthropic Claude, TensorFlow.js)
     * Mobile-first design patterns and performance optimization
     * Brazilian healthcare market analysis and regulations
   
   **Phase 1 - Architecture & Contracts**:
   - Generate `data-model.md` with healthcare-compliant data structures
   - Create `contracts/` directory with OpenAPI 3.1 specifications
   - Generate `quickstart.md` for rapid development setup
   - Include patient data protection schemas and audit trail requirements
   
   **Phase 2 - Implementation Planning**:
   - Generate detailed `tasks.md` with healthcare-specific considerations
   - Include accessibility testing requirements (WCAG 2.1 AA compliance)
   - Define security testing protocols for patient data handling
   - Plan AI cost optimization and performance monitoring strategies

6. **Quality Gates & Validation**
   Ensure comprehensive coverage of:
   - **Healthcare Compliance**: All patient data handling meets LGPD requirements
   - **Performance Standards**: Mobile-first design with <2s load times
   - **AI Integration**: Cost optimization, failover strategies, Portuguese language support
   - **Security Requirements**: Authentication, authorization, audit trails, data encryption
   - **Accessibility**: WCAG 2.1 AA compliance for all patient-facing interfaces
   - **Testing Strategy**: Unit, integration, E2E, accessibility, and security testing plans

7. **NeonPro-Specific Artifact Generation**
   Additional artifacts tailored for healthcare platform development:
   - **compliance-checklist.md**: LGPD, ANVISA, CFM requirement validation
   - **ai-integration-guide.md**: Multi-provider AI setup, cost optimization, Portuguese chat
   - **mobile-optimization.md**: Progressive web app setup, offline capabilities
   - **security-protocols.md**: Patient data protection, role-based access, audit requirements
   - **performance-monitoring.md**: Healthcare-critical SLA monitoring and alerting

8. **User-Provided Context Integration**
   Incorporate user-provided details from arguments into Technical Context: $ARGUMENTS
   - Merge with existing NeonPro platform requirements
   - Ensure compatibility with aesthetic clinic management workflows
   - Validate against established user personas (clinic owners, administrators, patients)
   - Update Progress Tracking as each phase completes

9. **Execution Verification & Quality Assurance**
   Verify comprehensive execution completion:
   - **Progress Tracking**: All phases marked complete with detailed deliverables
   - **Artifact Validation**: All required files generated with substantive content
   - **Error State Check**: No ERROR states in execution flow
   - **Healthcare Compliance**: All regulatory requirements addressed
   - **Technical Feasibility**: Implementation plan validated against existing stack
   - **Resource Planning**: Development estimates and team allocation defined

10. **Results Documentation & Handoff**
    Report comprehensive results including:
    - **Branch Name**: Current feature branch and deployment target
    - **File Paths**: All generated artifacts with absolute paths
    - **Generated Artifacts**: Complete list with descriptions and purposes
    - **Healthcare Compliance Status**: LGPD, ANVISA, CFM requirement coverage
    - **Next Steps**: Clear development handoff with priorities and dependencies
    - **Risk Assessment**: Technical, business, and compliance risks with mitigation strategies

## NeonPro Platform Enhancement Guidelines

When planning features for the NeonPro healthcare platform, ensure:

### **Regulatory Compliance Priority**
- LGPD (Lei Geral de Proteção de Dados) compliance for all patient data
- ANVISA medical device software regulations alignment
- CFM (Conselho Federal de Medicina) professional standards adherence
- Complete audit trail capabilities for healthcare compliance

### **AI Integration Excellence**
- Portuguese-native conversational AI with healthcare terminology
- Multi-provider failover (OpenAI GPT-4 → Anthropic Claude)
- Cost optimization through semantic caching and prompt engineering
- Patient data anonymization before AI processing

### **Mobile-First Healthcare UX**
- <2 second page load times on mobile devices (70%+ usage)
- Progressive web app capabilities for offline access
- Touch-optimized interfaces for medical professionals
- Accessibility compliance (WCAG 2.1 AA) for diverse user needs

### **Performance & Reliability**
- 99.9% uptime for critical healthcare operations
- <500ms API response times for appointment scheduling
- Real-time synchronization for multi-device clinic workflows
- Automated monitoring and alerting for system health

### **Security & Privacy**
- End-to-end encryption for patient communications
- Role-based access control for medical staff
- Secure authentication with MFA for sensitive operations
- Regular security audits and penetration testing

Use absolute paths with the repository root for all file operations to avoid path resolution issues.