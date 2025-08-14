# Story 12.3: Controle de Profissionais e Habilitações

## User Story

**As a** Diretor Técnico da Clínica de Estética  
**I want** um sistema automatizado de controle de habilitações profissionais que monitore registros, certificações e especializações de toda a equipe  
**So that** posso garantir que apenas profissionais devidamente habilitados realizem procedimentos, evitando responsabilidade civil e sanções do CFM/CRO

## Story Details

### Epic
Epic 12: Compliance & Auditoria Médica

### Story Points
18 (Large - Complex professional validation with external integrations)

### Priority
P0 - Critical (Professional liability and regulatory compliance)

### Dependencies
- Story 12.1: Document management foundation ✅
- Epic 6: Agenda for procedure-professional validation ✅
- Epic 9: Professional management system ✅
- Epic 10: CRM for notification management ✅

## Acceptance Criteria

### AC1: Professional Registration Management
**GIVEN** I need to manage professional certifications and registrations  
**WHEN** I access the professional compliance module  
**THEN** I can register and track all required professional credentials:
- [ ] CRM (Conselho Regional de Medicina) registration and status
- [ ] CRO (Conselho Regional de Odontologia) registration and status
- [ ] CRF (Conselho Regional de Farmácia) registration and status
- [ ] CREF (Conselho Regional de Educação Física) registration and status
- [ ] Nursing registrations (COREN) for aesthetic nursing
- [ ] Physiotherapy registrations (CREFITO) for dermato-functional

**AND** each registration includes detailed information:
- [ ] Registration number and issuing council
- [ ] Professional name and specialty area
- [ ] Registration status (Active, Suspended, Cancelled, Pending)
- [ ] Issue date and expiration date (if applicable)
- [ ] Specialty certifications and board certifications
- [ ] Continuing education requirements and status
- [ ] Authorized procedures and scope of practice

### AC2: Certification and Specialization Tracking
**GIVEN** professionals have specialized certifications for aesthetic procedures  
**WHEN** I register their qualifications  
**THEN** the system tracks comprehensive certification portfolio:
- [ ] Aesthetic medicine certifications (SBME, SOCERGS, etc.)
- [ ] Laser and IPL operation certifications
- [ ] Injectable procedure certifications (Botox, fillers)
- [ ] Thread lifting and PDO certifications
- [ ] Chemical peel and dermato-cosmetic certifications
- [ ] Equipment-specific training certificates

**AND** maintains certification validity tracking:
- [ ] Certification issuing institution and instructor
- [ ] Training hours completed and certification level
- [ ] Practical competency evaluation results
- [ ] Continuing education requirements for renewal
- [ ] Automatic alerts for certification renewals
- [ ] Skills assessment and competency matrix

### AC3: Automatic Validation and Alerts
**GIVEN** professional registrations and certifications have expiration dates  
**WHEN** the system monitors professional compliance status  
**THEN** automatic validation and alerts are triggered:
- [ ] Real-time validation against external council databases
- [ ] 90-day advance warning for registration renewals
- [ ] 30-day urgent alert for expiring certifications
- [ ] Immediate suspension alert for cancelled registrations
- [ ] Daily compliance status updates to management

**AND** professional access control is enforced:
- [ ] Automatic blocking of procedure scheduling for expired professionals
- [ ] Warning alerts when booking procedures outside scope of practice
- [ ] Temporary suspension of system access for compliance issues
- [ ] Escalation procedures to technical director for violations
- [ ] Documentation of all compliance interventions

### AC4: Procedure Authorization Matrix
**GIVEN** different procedures require different professional qualifications  
**WHEN** I configure the procedure authorization matrix  
**THEN** the system enforces strict procedure-professional matching:
- [ ] Map each procedure to required professional registrations
- [ ] Define minimum certification levels for complex procedures
- [ ] Specify supervision requirements for junior professionals
- [ ] Set up co-authorization requirements for high-risk procedures
- [ ] Configure equipment authorization based on training

**AND** provides real-time authorization checking:
- [ ] Block appointment scheduling if professional not qualified
- [ ] Display warnings for procedures near qualification expiry
- [ ] Suggest alternative qualified professionals automatically
- [ ] Generate exception reports for manual review
- [ ] Maintain audit log of all authorization decisions

### AC5: Compliance Reporting and Auditing
**GIVEN** I need to demonstrate professional compliance for inspections  
**WHEN** I generate professional compliance reports  
**THEN** comprehensive reporting is available:
- [ ] Complete professional credential summary by individual
- [ ] Clinic-wide compliance status dashboard
- [ ] Procedures performed vs. professional qualifications audit
- [ ] Continuing education completion status report
- [ ] External validation status with council databases
- [ ] Risk assessment and gap analysis reports

**AND** provides investigation and audit support:
- [ ] Professional activity history with qualification validation
- [ ] Procedure authorization decision audit trail
- [ ] Compliance intervention history and outcomes
- [ ] External verification and validation logs
- [ ] Regulatory submission ready documentation
- [ ] Professional development and training records

## Technical Requirements

### Frontend (Next.js 15)
- **Professional Dashboard**: Individual compliance status overview
- **Certification Manager**: Upload and management interface for credentials
- **Validation Alerts**: Real-time compliance status notifications
- **Authorization Matrix**: Visual configuration of procedure-professional mappings
- **Compliance Reports**: Interactive reporting and analytics dashboard
- **Mobile App**: Professional self-service for credential updates

### Backend (Supabase)
- **Database Schema**:
  ```sql
  professional_registrations (
    id: uuid primary key,
    professional_id: uuid references professionals(id),
    clinic_id: uuid references clinics(id),
    council_type: text not null check (council_type in ('CRM', 'CRO', 'CRF', 'CREF', 'COREN', 'CREFITO')),
    registration_number: text not null,
    registration_status: text check (status in ('active', 'suspended', 'cancelled', 'pending')),
    issue_date: date not null,
    expiration_date: date,
    specialty: text,
    scope_of_practice: text[],
    last_verified: timestamp,
    verification_source: text,
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  professional_certifications (
    id: uuid primary key,
    professional_id: uuid references professionals(id),
    certification_name: text not null,
    issuing_institution: text not null,
    instructor_name: text,
    certification_level: text,
    issue_date: date not null,
    expiration_date: date,
    training_hours: integer,
    continuing_education_required: boolean default false,
    competency_score: integer,
    certificate_url: text,
    status: text check (status in ('valid', 'expired', 'revoked', 'pending_renewal')),
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  procedure_authorizations (
    id: uuid primary key,
    procedure_id: uuid references procedures(id),
    required_registrations: text[] not null,
    required_certifications: text[],
    minimum_experience_months: integer,
    supervision_required: boolean default false,
    supervisor_qualifications: text[],
    risk_level: text check (risk_level in ('low', 'medium', 'high', 'critical')),
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  compliance_violations (
    id: uuid primary key,
    professional_id: uuid references professionals(id),
    violation_type: text not null,
    violation_description: text not null,
    severity: text check (severity in ('warning', 'minor', 'major', 'critical')),
    detected_at: timestamp not null,
    resolved_at: timestamp,
    resolution_action: text,
    reported_by: uuid references auth.users(id),
    created_at: timestamp default now()
  )
  ```

- **RLS Policies**: Role-based access with clinic isolation and professional privacy protection
- **Real-time Subscriptions**: Live compliance status updates
- **Edge Functions**: External API validation and automated compliance checking

### External Integrations
- **Professional Councils**: API integration with CRM, CRO, CRF councils for registration validation
- **Certification Bodies**: Integration with SBME, aesthetic medicine associations
- **Continuing Education**: Integration with medical education platforms
- **Digital Certificates**: Blockchain verification for certificate authenticity

## Definition of Done

### Technical DoD
- [ ] All AC acceptance criteria automated tests passing
- [ ] External council API integrations functioning ≤5 seconds
- [ ] Real-time authorization checking working ≤2 seconds
- [ ] Compliance alert system delivering ≤30 seconds
- [ ] Professional dashboard loading ≤3 seconds
- [ ] Certificate upload and validation ≤10 seconds
- [ ] Mobile app professional portal operational
- [ ] Data encryption and privacy compliance verified

### Functional DoD
- [ ] Professional registration workflow ≤5 minutes
- [ ] Certification tracking 100% accurate
- [ ] Authorization matrix blocking unauthorized procedures
- [ ] Alert system preventing compliance violations
- [ ] Compliance reporting generation ≤15 seconds
- [ ] External validation success rate ≥95%
- [ ] Professional self-service portal functional

### Quality DoD
- [ ] Code coverage ≥90% for authorization and validation logic
- [ ] Security audit for professional data protection passed
- [ ] Performance testing with 100+ professionals validated
- [ ] External API resilience and fallback testing complete
- [ ] User acceptance testing ≥4.7/5.0 rating
- [ ] Legal compliance review for professional privacy approved
- [ ] Medical director workflow validation complete

## Risk Mitigation

### Technical Risks
- **External API Failures**: Local caching with periodic synchronization and manual override capability
- **Data Privacy Violations**: End-to-end encryption and strict access controls with audit logging
- **Authorization Bypass**: Multiple validation layers and real-time compliance monitoring
- **Performance Under Load**: Optimized queries and caching for high-volume authorization checks

### Legal/Professional Risks
- **Unauthorized Procedures**: Strict technical controls with manager override requiring justification
- **Outdated Qualifications**: Automated blocking with manual emergency override procedures
- **Professional Liability**: Complete audit trail for all authorization decisions and compliance actions
- **Regulatory Sanctions**: Proactive compliance monitoring and automatic regulatory reporting

## Testing Strategy

### Unit Tests
- Professional registration validation logic
- Certification expiry calculation and alerts
- Procedure authorization matrix matching
- Compliance violation detection and escalation

### Integration Tests
- External council API validation workflows
- Real-time authorization checking in appointment system
- Alert delivery across multiple channels and systems
- Compliance reporting with accurate data aggregation

### Performance Tests
- Authorization checking speed (target: ≤2 seconds for complex validations)
- Compliance dashboard load time (target: ≤3 seconds with 100+ professionals)
- External API response handling (target: ≤5 seconds with fallback)
- Concurrent professional access (target: 50+ simultaneous users)

## Success Metrics

### Operational KPIs
- **Authorization Check Speed**: ≤2 seconds for procedure booking validation
- **External Validation Success**: ≥95% successful council database queries
- **Alert Delivery Time**: ≤30 seconds for compliance notifications
- **Professional Portal Adoption**: ≥90% professionals using self-service features
- **System Availability**: 99.9% uptime during business hours

### Compliance KPIs
- **Professional Compliance Rate**: 100% of professionals with valid registrations
- **Unauthorized Procedure Prevention**: Zero procedures performed by unqualified professionals
- **Certification Renewal Rate**: ≥95% certifications renewed before expiration
- **Audit Readiness**: ≤10 minutes to generate complete professional compliance report
- **Regulatory Compliance**: Zero sanctions for professional qualification violations

---

**Story Owner**: Medical Affairs & HR Team  
**Technical Lead**: Backend Team  
**QA Owner**: QA Team  
**Business Stakeholder**: Technical Director

---

*Created following BMad methodology by Bob, Technical Scrum Master*