#!/bin/bash
# Universal Business Compliance Validation Hook
# Ensures GDPR, LGPD, SOC2, PCI-DSS and domain-specific compliance

echo "🏢 Universal Business Compliance Validation Started"

COMPLIANCE_SCORE=100
COMPLIANCE_ISSUES=()

# GDPR/LGPD Universal Data Protection Check
echo "🔐 GDPR/LGPD (Universal Data Protection) Validation"

# Multi-tenant isolation check
if grep -r "organization_id.*=.*auth\.uid\|tenant_id.*=.*session\.user\.id\|company_id.*=.*auth\.uid" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ GDPR/LGPD: Multi-tenant isolation implemented"
else
    echo "❌ GDPR/LGPD: Multi-tenant isolation missing"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 20))
    COMPLIANCE_ISSUES+=("GDPR/LGPD: Implement multi-tenant isolation with organization_id = auth.uid()")
fi

# Consent management check
if grep -r "consent.*gdpr\|consent.*data.*processing\|user.*consent" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ GDPR/LGPD: Consent management detected"
else
    echo "⚠️  GDPR/LGPD: Consider explicit consent management"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
fi

# Data encryption check
if grep -r "encrypt\|bcrypt\|crypto" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ GDPR/LGPD: Data encryption implementation detected"
else
    echo "⚠️  GDPR/LGPD: Data encryption recommended for sensitive data"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 15))
    COMPLIANCE_ISSUES+=("GDPR/LGPD: Implement encryption for sensitive user data")
fi

# Audit trail check
if grep -r "audit_log\|audit.*trail" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ GDPR/LGPD: Audit trail implementation detected"
else
    echo "❌ GDPR/LGPD: Audit trail required for user data access"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 25))
    COMPLIANCE_ISSUES+=("GDPR/LGPD: Implement audit trail for all user data operations")
fi

# Domain-Specific Compliance Check (Healthcare, Fintech, etc.)
echo "🏛️ Domain-Specific Regulatory Validation"

# Healthcare Domain (ANVISA, FDA)
if grep -r "medical.*device\|health.*data\|clinical.*decision\|patient" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 Healthcare functionality detected - Medical device compliance required"
    
    if grep -r "validation.*medical\|clinical.*validation" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ Healthcare: Clinical validation patterns detected"
    else
        echo "⚠️  Healthcare: Clinical validation recommended"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
    fi
    
    if grep -r "cybersecurity\|security.*medical" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ Healthcare: Medical cybersecurity considerations detected"
    else
        echo "⚠️  Healthcare: Enhanced cybersecurity for medical features required"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
        COMPLIANCE_ISSUES+=("Healthcare: Implement enhanced cybersecurity for medical features")
    fi
    
# Fintech Domain (PCI-DSS, SOX)
elif grep -r "payment\|financial\|transaction\|bank\|card" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 Fintech functionality detected - Financial compliance required"
    
    if grep -r "pci.*dss\|payment.*security" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ Fintech: PCI-DSS compliance patterns detected"
    else
        echo "⚠️  Fintech: PCI-DSS compliance recommended"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 15))
        COMPLIANCE_ISSUES+=("Fintech: Implement PCI-DSS compliance for payment processing")
    fi
    
# E-commerce Domain (Consumer Protection)
elif grep -r "product\|order\|cart\|checkout\|purchase" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 E-commerce functionality detected - Consumer protection compliance required"
    
    if grep -r "consumer.*protection\|refund.*policy" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ E-commerce: Consumer protection patterns detected"
    else
        echo "⚠️  E-commerce: Consumer protection policies recommended"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 5))
    fi
else
    echo "ℹ️  No domain-specific functionality detected - Generic business compliance applied"
fi

# Digital Services & Remote Operations Validation
echo "⚕️ Digital Services & Remote Operations Validation"

if grep -r "remote.*service\|digital.*consultation\|online.*service\|virtual.*meeting" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "🔍 Remote/Digital services functionality detected - Enhanced validation required"
    
    if grep -r "professional.*license\|service.*validation\|provider.*credentials" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ Digital Services: Professional validation detected"
    else
        echo "❌ Digital Services: Professional validation required"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 15))
        COMPLIANCE_ISSUES+=("Digital Services: Implement professional credential validation")
    fi
    
    if grep -r "digital.*certificate\|ssl.*certificate\|security.*certificate" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "✅ Digital Services: Digital certificate compliance detected"
    else
        echo "⚠️  Digital Services: Consider digital certificate implementation"
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
    fi
    
    # Additional check for telemedicine (healthcare domain)
    if grep -r "telemedicine\|medical.*consultation" "$MODIFIED_FILES" > /dev/null 2>&1; then
        echo "🔍 Telemedicine detected - CFM/Medical board compliance required"
        if ! grep -r "medical.*license\|crm.*validation" "$MODIFIED_FILES" > /dev/null 2>&1; then
            COMPLIANCE_SCORE=$((COMPLIANCE_SCORE - 10))
            COMPLIANCE_ISSUES+=("Healthcare: CFM/Medical board compliance required for telemedicine")
        fi
    fi
else
    echo "ℹ️  No remote/digital services detected - Standard validation applied"
fi

# Performance compliance for business applications
echo "⚡ Business Application Performance Compliance"

if grep -r "timeout.*100\|response.*time.*<.*100\|performance.*target" "$MODIFIED_FILES" > /dev/null 2>&1; then
    echo "✅ Business performance targets considered"
else
    echo "ℹ️  Consider <100ms API response targets for user data operations"
fi

# Final compliance assessment
echo ""
echo "📊 Universal Business Compliance Assessment Complete"
echo "   - Compliance Score: $COMPLIANCE_SCORE/100"
echo "   - Required Minimum: 80/100"

if [ $COMPLIANCE_SCORE -lt 80 ]; then
    echo "❌ BUSINESS COMPLIANCE FAILED: Score $COMPLIANCE_SCORE < 80"
    echo "🛑 Critical compliance issues must be resolved:"
    printf '   - %s\n' "${COMPLIANCE_ISSUES[@]}"
    echo ""
    echo "🏢 Business compliance is mandatory for production deployment"
    exit 2
else
    echo "✅ BUSINESS COMPLIANCE PASSED: Score $COMPLIANCE_SCORE ≥ 80"
    echo "🎯 Universal SaaS business standards maintained"
fi

# Log compliance metrics
echo "$(date): Business Compliance Score $COMPLIANCE_SCORE/100" >> .claude/compliance-log.txt

echo "🏢 Universal Business Compliance Validation Complete"
exit 0