# 🏥 Healthcare Compliance Reference

**For healthcare-specific guidelines, see:**

## 🛡️ Regulatory Compliance
- **LGPD**: Patient data protection by design
- **ANVISA**: Medical device regulatory framework (Class IIa)
- **CFM**: Medical ethics and professional responsibility
- **Complete Details**: [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)

## 🔒 Security Patterns
- **AES-256-GCM**: Encryption for PHI (Protected Health Information)
- **Multi-Factor Authentication**: Required for healthcare access
- **Audit Trail**: Immutable logging for all patient data operations
- **Row Level Security**: Constitutional RLS patterns

## ⚡ Performance Requirements
- **Emergency Response**: <200ms for critical patient data
- **Healthcare Operations**: <2s response time guarantee
- **Compliance Validation**: Real-time LGPD/ANVISA checking

## 🤖 AI Healthcare Integration
- **Privacy-First**: PHI sanitization before AI processing
- **Medical Context**: Healthcare-specific AI prompts and validation
- **Compliance Automation**: AI-powered regulatory adherence

---

> 📝 **Note**: This file provides healthcare overview. Complete compliance details in [`docs/architecture/coding-standards.md`](../docs/architecture/coding-standards.md)