# DEVELOPMENT COMMANDS & HEALTHCARE WORKFLOWS

## Core Healthcare Development Commands

```bash
# Development server with healthcare monitoring
pnpm dev

# Build with healthcare compliance validation
pnpm build

# Healthcare-specific linting with medical code standards
pnpm lint:healthcare

# LGPD compliance check
pnpm compliance:lgpd

# Patient data security audit
pnpm audit:patient-data

# Medical API performance test
pnpm test:api:healthcare

# Start production server with medical environment
pnpm start:medical
```

## Healthcare Testing Commands

```bash
# Run all healthcare tests
npm run test:healthcare

# Run LGPD compliance tests
npm run test:lgpd

# Run patient data security tests
npm run test:security

# Run appointment booking E2E tests
npm run test:e2e:appointments

# Run medical workflow tests
npm run test:e2e:medical

# Performance testing for clinic operations
npm run test:performance:clinic
```

## Healthcare Database Commands

```bash
# Run healthcare-specific Supabase migrations
npm run db:migrate:healthcare

# Seed database with healthcare test data
npm run db:seed:medical

# Generate types from healthcare schema
npm run db:types:healthcare

# LGPD compliance database audit
npm run db:audit:lgpd

# Patient data encryption verification
npm run db:verify:encryption
```

## NeonPro Quantified Personas & Jobs-to-be-Done

### Dr. Marina Silva - Clinic Owner (Persona Principal)

```yaml
DR_MARINA_PROFILE:
  clinic_type: "Aesthetic clinic with 150+ patients/month"
  pain_points_quantified:
    treatment_success_rate: "70% atual vs. 85%+ desejado"
    administrative_burden: "40% do tempo em tarefas administrativas"
    compliance_time: "15h/semana em documentação compliance"
    decision_making: "70% das decisões baseadas em intuição vs. dados"
    patient_satisfaction: "75% NPS vs. 85%+ target"
    
  jobs_to_be_done_measurable:
    increase_success_rate: "70% → 85%+ através de AI prediction"
    reduce_admin_burden: "40% → 15% do tempo através de automação"
    improve_compliance: "85% → 99%+ através de sistemas integrados"
    increase_ebitda: "+20% através de otimização inteligente"
    enhance_patient_experience: "75 → 85+ NPS através de wellness integration"
    
  ai_powered_solutions:
    - "Treatment Success Prediction Engine (85%+ accuracy)"
    - "Automated compliance documentation and reporting"
    - "Predictive analytics dashboard for business decisions"
    - "Computer vision analysis for treatment optimization"
    - "Wellness integration for holistic patient care"
```

### Carla Santos - Receptionist/Coordinator (Operational Excellence)

```yaml
CARLA_PROFILE:
  role: "Front-desk coordinator managing 50+ appointments/day"
  pain_points_quantified:
    scheduling_conflicts: "20% de conflitos de horário por semana"
    patient_history_access: "15min/paciente para localizar histórico completo"
    follow_up_calls: "2h/dia em ligações de follow-up manuais"
    data_compilation: "3h/semana em compilação manual de relatórios"
    no_show_management: "15-20% no-show rate sem previsibilidade"
    
  jobs_to_be_done_measurable:
    eliminate_conflicts: "20% → <2% através de AI scheduling optimization"
    instant_access: "15min → <30seg para acesso completo ao histórico"
    automate_follow_ups: "2h/dia → automação inteligente com AI"
    automated_reporting: "3h/semana → relatórios automáticos em tempo real"
    predict_no_shows: "15-20% → <10% através de prediction engine"
    
  ai_powered_solutions:
    - "Intelligent scheduling with conflict detection and resolution"
    - "Instant patient history access with smart search"
    - "Automated follow-up system with personalized messaging"
    - "Real-time analytics dashboards with automated reporting"
    - "No-show prediction with proactive intervention strategies"
```

### Ana Costa - Digital Patient (Patient Experience Focus)

```yaml
ANA_PROFILE:
  demographics: "32 anos, profissional digital, alta expectativa tecnológica"
  pain_points_quantified:
    pre_treatment_anxiety: "60% anxiety level devido à falta de informações"
    progress_visibility: "40% sentem falta de visibilidade do progresso"
    information_gap: "30% se sentem mal informadas sobre tratamentos"
    holistic_approach: "70% não veem abordagem holística (estética + wellness)"
    appointment_convenience: "50% difficulty scheduling optimal times"
    
  jobs_to_be_done_measurable:
    reduce_anxiety: "60% → <20% através de informações preditivas e transparência"
    improve_visibility: "40% → 90%+ através de progress tracking automático"
    enhance_information: "30% → 95%+ através de AI-powered education"
    holistic_integration: "70% → 95%+ através de wellness integration"
    optimize_scheduling: "50% → 95%+ através de AI-powered convenience"
    
  ai_powered_solutions:
    - "Predictive treatment outcome visualization"
    - "Computer vision progress tracking with before/after analysis"
    - "AI chatbot for 24/7 information and support"
    - "Wellness integration with wearable device connectivity"
    - "Intelligent scheduling with optimal time recommendations"
```

## Claude Code Healthcare Hooks

```yaml
# .claude/hooks.yml
pre_tool_use:
  healthcare_context_check: |
    if [[ "$tool" == "edit" ]] && [[ "$file" =~ (patient|medical|health) ]]; then
      echo "🏥 Healthcare context detected - ensuring LGPD compliance"
      check_lgpd_compliance "$file"
    fi

post_tool_use:
  healthcare_audit_log: |
    if [[ "$tool" == "edit" ]] && [[ "$file" =~ (patient|medical|health) ]]; then
      log_healthcare_change "$file" "$changes"
      verify_compliance_maintained "$file"
    fi

notification:
  healthcare_compliance: |
    echo "✅ Healthcare compliance verified for $file"
    echo "🔐 Patient data security maintained"
    echo "📋 Audit trail updated"

stop:
  healthcare_cleanup: |
    generate_compliance_report
    verify_no_sensitive_data_exposed
    update_healthcare_documentation
```

## Git Workflow for Healthcare Development

```bash
# Healthcare-specific git workflow
git checkout -b feature/patient-management-enhancement
git add -A
git commit -m "feat: enhance patient data security with LGPD compliance"
git push origin feature/patient-management-enhancement

# Create pull request with healthcare compliance checklist
gh pr create --title "Patient Management Enhancement" --body "
## Healthcare Compliance Checklist
- [x] LGPD compliance verified
- [x] Patient data encryption implemented
- [x] Audit trail functionality added
- [x] Multi-tenant isolation maintained
- [x] Security testing completed
"
```

## MCP Integration Requirements

### Healthcare MCP Integration Compliance (ZERO TOLERANCE)

```yaml
MCP_MANDATORY_HEALTHCARE_INTEGRATION:
  sequential_thinking: "✅ REQUIRED: Medical complexity ≥3 reasoning, clinical planning, healthcare quality assessment"
  desktop_commander: "✅ REQUIRED: ALL medical file operations with enhanced patient data protocols + ≥70% API reduction"
  context7: "✅ REQUIRED: Medical documentation, healthcare standards, clinical validation"
  tavily: "✅ REQUIRED: Real-time medical research, healthcare trends, clinical consensus validation"
  exa: "✅ REQUIRED: Medical expert implementations, healthcare authority sources, clinical best practices"
  
HEALTHCARE_ENFORCEMENT: "❌ ABORT SESSION if ANY MCP non-functional | 100% medical compliance required"
```

### Enhanced Healthcare Research Protocol (AI-ENHANCED FOR MEDICAL CODE)

**MANDATORY 3-MCP HEALTHCARE RESEARCH WITH AI-POWERED MEDICAL ANALYSIS:**
1. **Context7 MCP** → Medical documentation, healthcare API references, clinical coding standards, FHIR specifications
2. **Tavily MCP** → Current healthcare best practices, medical industry trends, clinical community consensus  
3. **Exa MCP** → Medical expert implementations, healthcare authority patterns, clinical compliance sources
4. **AI-Enhanced Medical Synthesis** → Cross-validation via ultrathink, medical confidence ≥95%, healthcare quality ≥9.5/10
5. **Healthcare Pattern Integration** → Auto-apply medical learnings for continuous clinical improvement