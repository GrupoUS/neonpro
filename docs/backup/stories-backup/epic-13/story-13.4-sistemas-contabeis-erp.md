# Story 13.4: Sistemas Contábeis e ERP

## User Story

**As a** Contador/Escritório Contábil responsável pela clínica de estética  
**I want** integração automatizada com sistemas contábeis que exporte dados financeiros, gere documentos fiscais e mantenha compliance contábil  
**So that** posso reduzir 90% do trabalho manual de escrituração, garantir 100% compliance fiscal e fechar a contabilidade em 2 dias ao invés de 15 dias

## Story Details

### Epic
Epic 13: Integração com Plataformas Externas

### Story Points
20 (XLarge - Complex ERP integration with fiscal compliance and automated accounting)

### Priority
P0 - Critical (Fiscal compliance and operational efficiency)

### Dependencies
- Epic 7: Financial management system ✅
- Story 13.1: Payment processing for revenue data ✅
- Epic 11: Inventory for cost accounting ✅
- Story 12.1: Compliance for audit trails ✅

## Acceptance Criteria

### AC1: ERP and Accounting System Integration
**GIVEN** I need to integrate with accounting software used by the clinic  
**WHEN** I configure ERP integrations  
**THEN** comprehensive accounting system connectivity is available:
- [ ] Conta Azul integration for SME accounting and fiscal management
- [ ] ContaSimples integration for simplified accounting workflows
- [ ] Omie ERP integration for complete business management
- [ ] QuickBooks integration for international accounting standards
- [ ] SAP Business One integration for enterprise-level clinics
- [ ] Sage Intacct integration for advanced financial management

**AND** supports complete chart of accounts synchronization:
- [ ] Automatic chart of accounts mapping and creation
- [ ] Revenue account classification by service type
- [ ] Expense categorization with cost center allocation
- [ ] Asset tracking for equipment and infrastructure
- [ ] Liability management for financing and payables
- [ ] Equity tracking for ownership and retained earnings

### AC2: Automated Financial Data Export
**GIVEN** financial transactions occur in NeonPro  
**WHEN** accounting synchronization is triggered  
**THEN** automated financial data export occurs:
- [ ] Real-time revenue posting from completed appointments
- [ ] Automatic expense recording from purchase transactions
- [ ] Inventory valuation and cost of goods sold calculation
- [ ] Payroll integration with professional compensation
- [ ] Tax calculation and withholding management
- [ ] Depreciation calculation for medical equipment

**AND** maintains accounting accuracy and compliance:
- [ ] Double-entry bookkeeping validation
- [ ] Balance sheet and income statement reconciliation
- [ ] Trial balance verification and error detection
- [ ] Period-end closing automation with approval workflows
- [ ] Audit trail maintenance with immutable transaction logs
- [ ] Multi-currency handling for international transactions

### AC3: Fiscal Document Generation and Management
**GIVEN** I need to generate fiscal documents for compliance  
**WHEN** transactions require fiscal documentation  
**THEN** automated document generation is performed:
- [ ] Nota Fiscal de Serviço (NFS-e) generation and transmission
- [ ] Nota Fiscal Eletrônica (NF-e) for product sales
- [ ] Cupom Fiscal Eletrônico (CF-e) for retail transactions
- [ ] Manifesto Eletrônico de Documentos Fiscais (MDF-e)
- [ ] Conhecimento de Transporte Eletrônico (CT-e) for logistics
- [ ] SPED fiscal and accounting file generation

**AND** ensures fiscal compliance and submission:
- [ ] Automatic SEFAZ integration for document validation
- [ ] Electronic signature and digital certification
- [ ] Real-time document status tracking and validation
- [ ] Automatic retry and error recovery for failed submissions
- [ ] Cancellation and correction procedures for fiscal documents
- [ ] Archive management with legal retention periods

### AC4: Tax Management and Compliance
**GIVEN** complex Brazilian tax requirements must be met  
**WHEN** tax calculations and submissions are needed  
**THEN** comprehensive tax management is provided:
- [ ] ISS (Service Tax) calculation and submission
- [ ] ICMS (State Tax) management for product sales
- [ ] PIS/COFINS federal tax calculation and reporting
- [ ] INSS and FGTS payroll tax management
- [ ] IR (Income Tax) calculation and withholding
- [ ] Simples Nacional tax regime optimization

**AND** provides automated tax compliance:
- [ ] Monthly tax return generation (PGDAS, DEFIS)
- [ ] Quarterly LALUR and tax book generation
- [ ] Annual income tax return preparation
- [ ] Tax payment scheduling and deadline management
- [ ] Tax obligation calendar with automatic reminders
- [ ] Tax optimization analysis and regime recommendations

### AC5: Advanced Financial Analytics and Reporting
**GIVEN** I need comprehensive financial reporting for management and compliance  
**WHEN** I generate financial reports  
**THEN** advanced analytics and reporting are available:
- [ ] Real-time profit and loss statements with drill-down capability
- [ ] Balance sheet automation with asset and liability tracking
- [ ] Cash flow statements with operating, investing, and financing activities
- [ ] Cost center profitability analysis by service and professional
- [ ] Budget vs. actual variance analysis with explanations
- [ ] Financial ratios and KPI dashboard for management

**AND** supports stakeholder reporting needs:
- [ ] Investor reports with standardized formatting
- [ ] Bank loan compliance reporting with covenant tracking
- [ ] Insurance company financial verification reports
- [ ] Franchise or network consolidated reporting
- [ ] Government regulatory reporting (BACEN, CVM)
- [ ] External audit preparation packages

## Technical Requirements

### Frontend (Next.js 15)
- **ERP Dashboard**: Integration status and configuration management interface
- **Chart of Accounts**: Visual mapping and synchronization interface
- **Fiscal Documents**: Document generation, tracking, and management interface
- **Tax Calendar**: Tax obligation tracking and deadline management
- **Financial Reports**: Interactive financial reporting and analytics dashboard
- **Audit Trail**: Complete transaction history and compliance verification

### Backend (Supabase)
- **Database Schema**:
  ```sql
  erp_integrations (
    id: uuid primary key,
    clinic_id: uuid references clinics(id),
    erp_system: text not null check (erp_system in ('conta_azul', 'conta_simples', 'omie', 'quickbooks', 'sap', 'sage')),
    api_credentials: jsonb not null, -- encrypted
    company_id: text not null,
    sync_enabled: boolean default true,
    sync_frequency: interval default '1 day',
    last_sync: timestamp,
    chart_of_accounts_mapping: jsonb,
    tax_configuration: jsonb,
    fiscal_settings: jsonb,
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  accounting_transactions (
    id: uuid primary key,
    clinic_id: uuid references clinics(id),
    erp_integration_id: uuid references erp_integrations(id),
    transaction_type: text check (transaction_type in ('revenue', 'expense', 'asset', 'liability', 'equity')),
    reference_id: uuid not null, -- appointment_id, payment_id, etc.
    reference_type: text not null,
    debit_account: text not null,
    credit_account: text not null,
    amount: decimal not null,
    description: text not null,
    transaction_date: date not null,
    cost_center: text,
    project_code: text,
    erp_transaction_id: text,
    sync_status: text check (sync_status in ('pending', 'synced', 'error', 'cancelled')),
    sync_error: text,
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  fiscal_documents (
    id: uuid primary key,
    clinic_id: uuid references clinics(id),
    document_type: text check (document_type in ('nfse', 'nfe', 'cfe', 'mdfe', 'cte')),
    document_number: text not null,
    series: text,
    patient_id: uuid references patients(id),
    appointment_ids: uuid[],
    payment_id: uuid references payment_transactions(id),
    gross_amount: decimal not null,
    tax_amount: decimal not null,
    net_amount: decimal not null,
    tax_breakdown: jsonb not null,
    document_xml: text,
    access_key: text,
    status: text check (status in ('draft', 'generated', 'transmitted', 'authorized', 'cancelled', 'rejected')),
    sefaz_status: text,
    protocol_number: text,
    authorization_date: timestamp,
    cancellation_reason: text,
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  
  tax_obligations (
    id: uuid primary key,
    clinic_id: uuid references clinics(id),
    obligation_type: text not null,
    tax_authority: text not null,
    period_start: date not null,
    period_end: date not null,
    due_date: date not null,
    calculated_amount: decimal,
    paid_amount: decimal,
    status: text check (status in ('pending', 'calculated', 'filed', 'paid', 'overdue')),
    filing_data: jsonb,
    payment_confirmation: text,
    penalties: decimal default 0,
    created_at: timestamp default now(),
    updated_at: timestamp default now()
  )
  ```

- **RLS Policies**: Clinic-based isolation with role-based access for accounting team
- **Edge Functions**: Automated transaction posting, fiscal document generation, tax calculations
- **Encryption**: AES-256 encryption for ERP credentials and sensitive financial data

### External API Integrations
- **ERP Systems**: Direct API integration with Conta Azul, Omie, QuickBooks, SAP APIs
- **Government Systems**: SEFAZ integration for fiscal document transmission
- **Banking APIs**: Open Banking integration for automated reconciliation
- **Tax Calculation**: Integration with tax calculation services and government databases

## Definition of Done

### Technical DoD
- [ ] All AC acceptance criteria automated tests passing
- [ ] ERP synchronization completing ≤30 minutes for daily transactions
- [ ] Fiscal document generation ≤2 minutes per document
- [ ] Tax calculation accuracy ≥99.9% validated against manual calculations
- [ ] API integration reliability ≥99.5% for all supported ERPs
- [ ] Data encryption verified for all sensitive financial information
- [ ] Real-time synchronization working for critical transactions
- [ ] Error handling and recovery procedures tested

### Functional DoD
- [ ] Chart of accounts mapping 100% accurate for all supported ERPs
- [ ] Fiscal document generation complying with SEFAZ requirements
- [ ] Tax calculations validated by certified public accountant
- [ ] Financial reporting matching ERP system outputs exactly
- [ ] Audit trail maintaining complete transaction history
- [ ] Period-end closing automation reducing time by 90%
- [ ] Integration with Epic 7, 11, 12 validated and working

### Quality DoD
- [ ] Code coverage ≥90% for accounting and tax calculation logic
- [ ] Security audit for financial data protection passed
- [ ] Performance testing with high transaction volumes
- [ ] Accuracy validation by external accounting firm
- [ ] User acceptance testing ≥4.8/5.0 from accounting professionals
- [ ] Compliance review by tax lawyers approved
- [ ] Documentation complete for all accounting procedures

## Risk Mitigation

### Technical Risks
- **ERP API Changes**: Versioned integration with automatic adaptation and fallback procedures
- **Data Accuracy**: Multiple validation layers with reconciliation procedures and manual override
- **System Downtime**: Offline transaction queuing with automatic sync when systems recover
- **Tax Calculation Errors**: Backup calculation methods with external validation services

### Financial/Legal Risks
- **Fiscal Non-compliance**: Automated compliance checking with legal review and approval workflows
- **Audit Failures**: Complete audit trail with immutable logs and external verification
- **Tax Penalties**: Proactive deadline management with escalation procedures and legal support
- **Data Loss**: Multiple backup strategies with point-in-time recovery capabilities

## Testing Strategy

### Unit Tests
- ERP API communication and data transformation
- Tax calculation algorithms and fiscal document generation
- Chart of accounts mapping and transaction posting
- Financial reporting and analytics calculations

### Integration Tests
- End-to-end transaction flow from NeonPro to ERP systems
- Fiscal document generation and SEFAZ transmission
- Multi-ERP synchronization with different accounting standards
- Tax compliance workflows and government system integration

### Performance Tests
- High-volume transaction processing (target: 10K+ transactions/day)
- Fiscal document generation speed (target: ≤2 minutes per document)
- Financial report generation (target: ≤30 seconds for monthly reports)
- Concurrent accounting user access and processing

## Success Metrics

### Operational KPIs
- **Sync Speed**: ≤30 minutes for daily transaction synchronization
- **Document Generation**: ≤2 minutes for fiscal document creation
- **Tax Calculation**: ≤5 seconds for complex tax scenarios
- **Report Generation**: ≤30 seconds for monthly financial reports
- **System Reliability**: ≥99.9% uptime for accounting operations

### Business Impact KPIs
- **Manual Work Reduction**: 90% reduction in manual accounting data entry
- **Closing Speed**: Reduce month-end closing from 15 days to 2 days
- **Compliance Rate**: 100% fiscal compliance with zero penalties
- **Accuracy Improvement**: ≥99.9% accuracy in financial data and calculations
- **Accountant Satisfaction**: ≥4.8/5.0 satisfaction rating from accounting professionals

---

**Story Owner**: Finance & Accounting Team  
**Technical Lead**: Backend Integration Team  
**QA Owner**: QA Team  
**Business Stakeholder**: CFO & External Accounting Firm

---

*Created following BMad methodology by Bob, Technical Scrum Master*