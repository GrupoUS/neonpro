#!/bin/bash
# Healthcare Compliance Validation Hook
# Ensures LGPD, ANVISA, and CFM compliance for NeonPro

echo "🏥 Healthcare Compliance Validation Started"

COMPLIANCE_SCORE=100
COMPLIANCE_ISSUES=()

# LGPD Compliance Check
echo "🔐 LGPD (Lei Geral de Proteção de Dados) Validation"

# Multi-tenant isolation check
if grep -r "clinic_id.*=.*auth\.uid\|clinic_id.*=.*session\.user\.id" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ LGPD: Multi-tenant isolation implemented"
else
    echo "❌ LGPD: Multi-tenant isolation missing"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 20))
    COMPLIANCE_ISSUES+=("LGPD: Implement multi-tenant isolation with clinic_id = auth.uid()")
fi

# Consent management check
if grep -r "consent.*lgpd\|consent.*data.*processing" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ LGPD: Consent management detected"
else
    echo "⚠️  LGPD: Consider explicit consent management"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
fi

# Data encryption check
if grep -r "encrypt\|bcrypt\|crypto" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ LGPD: Data encryption implementation detected"
else
    echo "⚠️  LGPD: Data encryption recommended for sensitive data"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 15))
    COMPLIANCE_ISSUES+=("LGPD: Implement encryption for sensitive patient data")
fi

# Audit trail check
if grep -r "audit_log\|audit.*trail" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ LGPD: Audit trail implementation detected"
else
    echo "❌ LGPD: Audit trail required for patient data access"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 25))
    COMPLIANCE_ISSUES+=("LGPD: Implement audit trail for all patient data operations")
fi

# ANVISA Compliance Check (if medical device features detected)
echo "🏛️ ANVISA (Agência Nacional de Vigilância Sanitária) Validation"

if grep -r "medical.*device\|health.*data\|clinical.*decision" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 Medical device functionality detected - ANVISA compliance required"
    
    if grep -r "validation.*medical\|clinical.*validation" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ ANVISA: Clinical validation patterns detected"
    else
        echo "⚠️  ANVISA: Clinical validation recommended"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
    fi
    
    if grep -r "cybersecurity\|security.*medical" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ ANVISA: Medical cybersecurity considerations detected"
    else
        echo "⚠️  ANVISA: Enhanced cybersecurity for medical devices required"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
        COMPLIANCE_ISSUES+=("ANVISA: Implement enhanced cybersecurity for medical device features")
    fi
else
    echo "ℹ️  No medical device functionality detected - ANVISA compliance optional"
fi

# CFM Compliance Check (for telemedicine features)
echo "⚕️ CFM (Conselho Federal de Medicina) Digital Health Validation"

if grep -r "telemedicine\|remote.*consultation\|digital.*health" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 Telemedicine functionality detected - CFM compliance required"
    
    if grep -r "crf.*validation\|medical.*license" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ CFM: Medical license validation detected"
    else
        echo "❌ CFM: Medical license validation required"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 20))
        COMPLIANCE_ISSUES+=("CFM: Implement CRM medical license validation")
    fi
    
    if grep -r "ngs2\|icp.*brasil" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ CFM: Digital certificate compliance detected"
    else
        echo "⚠️  CFM: Consider NGS2 digital certificate implementation"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
    fi
else
    echo "ℹ️  No telemedicine functionality detected - CFM compliance optional"
fi

# Performance compliance for healthcare
echo "⚡ Healthcare Performance Compliance"

if grep -r "timeout.*100\|response.*time.*<.*100" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ Healthcare performance targets considered"
else
    echo "ℹ️  Consider <100ms API response targets for patient data"
fi

# Final compliance assessment
echo ""
echo "📊 Healthcare Compliance Assessment Complete"
echo "   - Compliance Score: $COMPLIANCE_SCORE/100"
echo "   - Required Minimum: 80/100"

if [ $COMPLIANCE_SCORE -lt 80 ]; then
    echo "❌ HEALTHCARE COMPLIANCE FAILED: Score $COMPLIANCE_SCORE < 80"
    echo "🛑 Critical compliance issues must be resolved:"
    printf '   - %s\n' "${COMPLIANCE_ISSUES[@]}"
    echo ""
    echo "🏥 Healthcare compliance is mandatory for production deployment"
    exit 2
else
    echo "✅ HEALTHCARE COMPLIANCE PASSED: Score $COMPLIANCE_SCORE ≥ 80"
    echo "🎯 NeonPro healthcare standards maintained"
fi

# Log compliance metrics
echo "$(date): Healthcare Compliance Score $COMPLIANCE_SCORE/100" >> .claude/compliance-log.txt

echo "🏥 Healthcare Compliance Validation Complete"
exit 0