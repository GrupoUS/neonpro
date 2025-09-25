# Role-Specific Cheat Sheets

## 📋 Overview

These role-specific cheat sheets provide quick, at-a-glance references for common tasks, keyboard shortcuts, and essential procedures. Perfect for printing and keeping at your workstation for instant access during daily operations.

## 👨‍⚕️ Healthcare Professional Cheat Sheet

### **Daily Workflow Checklist**

```typescript
interface DailyChecklist {
  morning: [
    "☐ Review today's schedule",
    '☐ Check patient preparation requirements',
    '☐ Verify treatment room readiness',
    '☐ Review AI recommendations for cases',
    '☐ Check for urgent patient messages',
  ]

  duringSessions: [
    '☐ Confirm patient identity',
    '☐ Verify informed consent',
    '☐ Document pre-treatment assessment',
    '☐ Execute treatment protocol',
    '☐ Record real-time observations',
    '☐ Document any complications',
    '☐ Provide post-treatment instructions',
  ]

  endOfDay: [
    '☐ Complete all clinical documentation',
    "☐ Review tomorrow's schedule",
    "☐ Follow up on today's patients",
    '☐ Update treatment plans as needed',
    '☐ Check AI insights and recommendations',
  ]
}
```

### **Critical Keyboard Shortcuts**

| Shortcut           | Action               | Priority     |
| ------------------ | -------------------- | ------------ |
| `Ctrl + P`         | Patient Search       | 🔴 Critical  |
| `Ctrl + T`         | Treatment Planning   | 🔴 Critical  |
| `Ctrl + N`         | New Clinical Note    | 🟡 Important |
| `Ctrl + I`         | AI Recommendations   | 🟡 Important |
| `Ctrl + Shift + P` | Photo Capture        | 🟡 Important |
| `Alt + S`          | Today's Schedule     | 🔴 Critical  |
| `F5`               | Refresh Patient Data | 🟡 Important |
| `Ctrl + S`         | Save Documentation   | 🔴 Critical  |

### **Patient Assessment Quick Reference**

```typescript
interface AssessmentQuickRef {
  vitalSigns: {
    bloodPressure: 'Normal: <120/80 mmHg'
    heartRate: 'Normal: 60-100 bpm'
    temperature: 'Normal: 36.1-37.2°C'
    oxygenSat: 'Normal: 95-100%'
  }

  skinAssessment: {
    type: 'Fitzpatrick Scale I-VI'
    conditions: 'Acne, rosacea, melasma, sensitivity'
    photoDamage: 'Glogau Scale I-IV'
  }

  aestheticGoals: {
    categories: ['Facial', 'Body', 'Hair', 'Skin Quality']
    priority: 'High/Medium/Low'
    timeline: 'Immediate/Short-term/Long-term'
  }
}
```

### **Treatment Documentation Template**

```
PROCEDURE PERFORMED:
- Treatment: _________________
- Date/Time: _________________
- Professional: _________________
- Duration: _________________

MATERIALS USED:
- Product 1: _______ Quantity: _______
- Product 2: _______ Quantity: _______
- Equipment: _________________

PATIENT RESPONSE:
- Tolerance: Excellent/Good/Fair/Poor
- Pain Level: 0-10 (_______)
- Immediate Reactions: _________________

COMPLICATIONS: 
- None / Minor / Moderate / Severe
- Description: _________________

FOLLOW-UP:
- Next Appointment: _________________
- Home Care Instructions: _________________
- Emergency Contact: _________________

PROFESSIONAL SIGNATURE: _________________
```

### **Emergency Procedures Quick Reference**

```typescript
interface EmergencyProcedures {
  anaphylaxis: [
    '1. STOP treatment immediately',
    '2. Call for emergency assistance (192)',
    '3. Administer epinephrine if available',
    '4. Monitor vital signs',
    '5. Document incident thoroughly',
  ]

  vasovagal: [
    '1. Lay patient flat with legs elevated',
    '2. Loosen tight clothing',
    '3. Monitor vital signs',
    '4. Provide reassurance',
    '5. Consider medical evaluation',
  ]

  burnInjury: [
    '1. Cool area with room temperature water',
    '2. Assess burn depth and area',
    '3. Apply appropriate dressing',
    '4. Provide pain management',
    '5. Refer for medical evaluation if needed',
  ]
}
```

## 👩‍💼 Reception Staff Cheat Sheet

### **Front Desk Daily Checklist**

```typescript
interface ReceptionChecklist {
  opening: [
    '☐ Turn on all systems and equipment',
    '☐ Check voicemail and messages',
    "☐ Review today's appointment schedule",
    '☐ Verify staff availability',
    '☐ Check treatment room readiness',
    '☐ Prepare patient registration materials',
  ]

  duringDay: [
    '☐ Manage patient check-in/out',
    '☐ Handle phone calls and inquiries',
    '☐ Process payments and transactions',
    '☐ Schedule new appointments',
    '☐ Manage patient flow and wait times',
    '☐ Maintain reception area organization',
  ]

  closing: [
    '☐ Reconcile daily payments',
    "☐ Verify tomorrow's schedule",
    '☐ Secure sensitive documents',
    '☐ Back up daily data',
    '☐ Prepare end-of-day reports',
    '☐ Secure facility and equipment',
  ]
}
```

### **Essential Keyboard Shortcuts**

| Shortcut           | Action             | Frequency    |
| ------------------ | ------------------ | ------------ |
| `F3`               | Patient Search     | 🔴 Very High |
| `Ctrl + Shift + A` | New Appointment    | 🔴 Very High |
| `Ctrl + I`         | Patient Check-in   | 🔴 Very High |
| `Ctrl + Shift + P` | Payment Processing | 🔴 Very High |
| `Alt + T`          | Today's Schedule   | 🟡 High      |
| `Ctrl + Q`         | Patient Queue      | 🟡 High      |
| `F5`               | Refresh Schedule   | 🟡 High      |
| `Ctrl + S`         | Save Changes       | 🟡 High      |

### **Appointment Scheduling Flowchart**

```
START
  │
  ▼
Patient Contact → Check Availability → Select Time Slot
  │                    │                     │
  ▼                    ▼                     ▼
Verify Insurance → Confirm Professional → Set Reminders
  │                    │                     │
  ▼                    ▼                     ▼
Collect Deposit → Send Confirmation → Add to Calendar
  │                    │                     │
  ▼                    ▼                     ▼
END → Update Patient Record → Schedule Follow-up
```

### **Payment Processing Quick Steps**

```typescript
interface PaymentSteps {
  creditCard: [
    '1. Select Credit Card payment',
    '2. Enter card details or swipe',
    '3. Verify amount and currency',
    '4. Process transaction',
    '5. Print receipt',
    '6. Update patient account',
  ]

  pixPayment: [
    '1. Generate PIX QR code',
    '2. Show code to patient',
    '3. Wait for payment confirmation',
    '4. Verify payment in system',
    '5. Generate receipt',
    '6. Mark as paid',
  ]

  installmentPlan: [
    '1. Select installment option',
    '2. Choose number of installments (2-12x)',
    '3. Calculate payment amounts',
    '4. Set up payment schedule',
    '5. Obtain patient agreement',
    '6. Process first payment',
  ]
}
```

### **Customer Service Scripts**

```typescript
interface ServiceScripts {
  greeting: 'Bom dia! Clínica NeonPro, em que posso ajudar?'
  appointmentBooking: 'Posso agendar seu horário? Qual tratamento você gostaria de agendar?'
  paymentInquiry: 'Sobre o pagamento, aceitamos cartão, PIX, boleto e parcelamento em até 12x.'
  emergencyCall:
    'Entendo. Vou transferir para nosso profissional médico. Por favor, aguarde um momento.'
  complaintHandling:
    'Sinto muito por esse inconveniente. Vou resolver isso imediatamente. Pode me dar mais detalhes?'
  closing: 'Obrigado pelo contato! Estamos à disposição para qualquer dúvida.'
}
```

## 🧑‍💼 Administrator Cheat Sheet

### **System Administration Daily Tasks**

```typescript
interface AdminDailyTasks {
  morningChecks: [
    '☐ Review system performance metrics',
    '☐ Check backup completion status',
    '☐ Monitor security alerts',
    '☐ Review user activity logs',
    '☐ Verify data synchronization status',
  ]

  userManagement: [
    '☐ Process new user requests',
    '☐ Handle permission modifications',
    '☐ Review deactivated accounts',
    '☐ Monitor user compliance training',
    '☐ Update role assignments as needed',
  ]

  systemMaintenance: [
    '☐ Check available storage space',
    '☐ Monitor database performance',
    '☐ Review system update requirements',
    '☐ Test disaster recovery procedures',
    '☐ Verify security patch status',
  ]
}
```

### **Critical Administration Shortcuts**

| Shortcut           | Action                  | Priority     |
| ------------------ | ----------------------- | ------------ |
| `Ctrl + U`         | User Management         | 🔴 Critical  |
| `Ctrl + Shift + S` | System Settings         | 🔴 Critical  |
| `Ctrl + R`         | Reports Dashboard       | 🟡 Important |
| `Ctrl + L`         | Audit Logs              | 🟡 Important |
| `Ctrl + B`         | Backup Management       | 🟡 Important |
| `Ctrl + Shift + P` | Performance Monitor     | 🟡 Important |
| `Alt + A`          | Analytics Dashboard     | 🟡 Important |
| `F12`              | Developer Tools (Admin) | 🟢 Reference |

### **User Role Matrix**

```typescript
interface RoleMatrix {
  healthcareProfessional: {
    access: ['Patient Records', 'Treatment Planning', 'Clinical Documentation', 'AI Tools']
    restrictions: ['Financial Reports', 'User Management', 'System Settings']
  }

  receptionStaff: {
    access: ['Appointments', 'Patient Registration', 'Payment Processing', 'Scheduling']
    restrictions: ['Clinical Data', 'Financial Reports', 'System Administration']
  }

  administrator: {
    access: ['Full System Access', 'User Management', 'Financial Data', 'System Configuration']
    restrictions: ['None - Full access']
  }

  complianceOfficer: {
    access: ['Audit Logs', 'Compliance Reports', 'Security Settings', 'User Activity']
    restrictions: ['Clinical Decision Making', 'Financial Transactions']
  }
}
```

### **System Performance Metrics**

```typescript
interface PerformanceMetrics {
  criticalAlerts: {
    cpuUsage: '> 90% for > 5 minutes'
    memoryUsage: '> 95% available memory used'
    diskSpace: '< 10% free space'
    databaseConnections: '> 80% max connections'
    responseTime: '> 5 seconds average'
  }

  monitoringFrequency: {
    systemHealth: 'Real-time monitoring'
    performanceMetrics: 'Every 5 minutes'
    backupStatus: 'Every hour'
    securityAlerts: 'Real-time'
    userActivity: 'Every 15 minutes'
  }
}
```

### **Backup and Recovery Procedures**

```typescript
interface BackupProcedures {
  dailyBackup: {
    time: '02:00 AM'
    scope: 'All patient data, transactions, settings'
    retention: '30 days'
    verification: 'Automatic checksum verification'
  }

  weeklyBackup: {
    time: 'Sunday 02:00 AM'
    scope: 'Complete system backup'
    retention: '12 weeks'
    verification: 'Manual verification and testing'
  }

  disasterRecovery: {
    rto: '4 hours (Recovery Time Objective)'
    rpo: '15 minutes (Recovery Point Objective)'
    location: 'Off-site secure storage'
    testing: 'Quarterly recovery testing'
  }
}
```

## 🏥 Compliance Officer Cheat Sheet

### **Compliance Monitoring Daily Tasks**

```typescript
interface ComplianceDailyTasks {
  monitoring: [
    '☐ Review LGPD compliance alerts',
    '☐ Check ANVISA reporting requirements',
    '☐ Monitor CFM professional validations',
    '☐ Review data access logs',
    '☐ Check incident resolution status',
  ]

  reporting: [
    '☐ Generate daily compliance reports',
    '☐ Update compliance metrics dashboard',
    '☐ Review regulatory change alerts',
    '☐ Document compliance activities',
    '☐ Schedule upcoming audits',
  ]

  training: [
    '☐ Monitor staff training completion',
    '☐ Review new compliance requirements',
    '☐ Update training materials',
    '☐ Schedule compliance refreshers',
    '☐ Track certification expirations',
  ]
}
```

### **Compliance Framework Quick Reference**

```typescript
interface ComplianceFramework {
  lgpd: {
    keyPrinciples: [
      'Purpose Limitation',
      'Data Minimization',
      'Transparency',
      'Security',
      'Accountability',
    ]
    subjectRights: [
      'Access to data',
      'Correction of data',
      'Deletion of data',
      'Data portability',
      'Opt-out consent',
    ]
    breachResponse: 'Within 24 hours to ANPD'
  }

  anvisa: {
    focusAreas: [
      'Treatment registration',
      'Equipment certification',
      'Product traceability',
      'Adverse event reporting',
      'Quality control systems',
    ]
    reportingDeadlines: 'Varies by risk classification'
  }

  cfm: {
    standards: [
      'Professional conduct',
      'Patient confidentiality',
      'Informed consent',
      'Documentation standards',
      'Continuing education',
    ]
    renewalCycles: 'Annual license verification'
  }
}
```

### **Audit Preparation Checklist**

```typescript
interface AuditPreparation {
  documentation: [
    '☐ Policy and procedure manuals',
    '☐ Training records and certifications',
    '☐ Risk assessment documentation',
    '☐ Incident response records',
    '☐ Data inventory and classification',
    '☐ Consent management records',
  ]

  technicalControls: [
    '☐ Access control review',
    '☐ Encryption verification',
    '☐ Backup system testing',
    '☐ Network security assessment',
    '☐ Vulnerability scan results',
    '☐ Penetration test results',
  ]

  staffPreparation: [
    '☐ Staff awareness training',
    '☐ Role-specific compliance knowledge',
    '☐ Emergency response procedures',
    '☐ Interview preparation',
    '☐ Documentation procedures',
  ]
}
```

### **Incident Response Matrix**

```typescript
interface IncidentResponse {
  dataBreach: {
    detection: 'System alerts, user reports, monitoring tools'
    containment: 'Isolate affected systems, preserve evidence'
    notification: 'ANPD within 24h, affected individuals promptly'
    documentation: 'Detailed incident timeline and impact assessment'
    prevention: 'Root cause analysis and remediation'
  }

  complianceViolation: {
    identification: 'Audits, monitoring, self-assessment'
    assessment: 'Impact analysis and risk determination'
    correction: 'Immediate corrective actions'
    reporting: 'Regulatory body notification if required'
    prevention: 'Process improvement and training'
  }

  securityIncident: {
    response: 'Incident response team activation'
    investigation: 'Forensic analysis and evidence collection'
    containment: 'System isolation and threat neutralization'
    recovery: 'System restoration and validation'
    lessons: 'Post-incident review and improvement'
  }
}
```

## 📱 Mobile Quick Reference

### **Mobile App Essential Functions**

```typescript
interface MobileEssentials {
  quickActions: [
    'QR Code Check-in',
    'Photo Documentation',
    'Voice Notes',
    'Appointment Status',
    'Emergency Contact',
  ]

  offlineCapabilities: [
    'Patient profile viewing',
    'Appointment calendar access',
    'Basic documentation',
    'Emergency procedures',
    'Contact information',
  ]

  securityFeatures: [
    'Biometric authentication',
    'Automatic logout',
    'Remote wipe capability',
    'Data encryption',
    'VPN required for sensitive data',
  ]
}
```

---

## 📞 Cheat Sheet Support

For additional cheat sheets or role-specific guides:

- **Training Department**: training@neonpro.com.br
- **Technical Support**: suporte@neonpro.com.br
- **Compliance Questions**: compliance@neonpro.com.br
- **Emergency Support**: emergencia@neonpro.com.br

**Print these cheat sheets** and keep them at your workstation for quick reference during daily operations.

**Support Hours**: Monday-Friday, 8:00-18:00 (Brasília Time)\
**Emergency Support**: 24/7 for critical system issues

---

**Last Updated**: January 2025\
**Version**: 1.0.0\
**Cheat Sheet Coverage**: All major system roles and functions\
**Maintainers**: NeonPro Training Team\
**Status**: ✅ Complete - Role-specific cheat sheets documented
