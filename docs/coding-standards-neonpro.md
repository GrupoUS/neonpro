# NEONPRO Coding Standards - Enhanced with Archon Best Practices

> **Baseado nos padrões Archon + Next.js 15 + Healthcare Domain Specifics**

## 🎯 **Core Principles (Archon-Aligned)**

### **MANDATORY EXECUTION RULES**
- **COMPLETE IMPLEMENTATIONS**: Zero placeholders/TODOs/mocks allowed in final code
- **QUALITY STANDARD**: ≥9.5/10 progressive quality enforcement  
- **NO BACKWARDS COMPATIBILITY**: Remove deprecated code immediately
- **DETAILED ERRORS**: Prefer detailed error messages over graceful failures

### **Healthcare Domain Principles**
- **Compliance First**: All code must maintain LGPD/ANVISA/CFM compliance
- **Audit Trail Required**: Every patient data operation must be auditable
- **Security by Design**: Zero-trust security model implementation
- **Brazilian Standards**: Follow Brazilian healthcare regulations

## 🚀 **Next.js 15 & App Router Patterns (Enhanced)**

### **Component Architecture**

```typescript
// ✅ Server Component (Default) - Healthcare Context
// apps/web/app/(dashboard)/patients/page.tsx
import { PatientList } from './components/patient-list'
import { getPatients } from '@neonpro/core-services/patient'
import { validateHealthcareProfessional } from '@neonpro/security'

export default async function PatientsPage() {
  // Validate healthcare professional access
  await validateHealthcareProfessional()
  
  const patients = await getPatients()
  
  return (
    <div className="healthcare-layout space-y-6">
      <h1 className="text-2xl font-bold">Pacientes</h1>
      <PatientList patients={patients} />
    </div>
  )
}

// ✅ Client Component - Healthcare Interactive Features
'use client'

import { useState } from 'react'
import { PatientForm } from '@neonpro/ui/healthcare/patient-form'
import { useHealthcarePermissions } from '@neonpro/domain/hooks'

export function PatientModal() {
  const [open, setOpen] = useState(false)
  const { canCreatePatient } = useHealthcarePermissions()
  
  if (!canCreatePatient) return null
  
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <PatientForm onSuccess={() => setOpen(false)} />
    </Modal>
  )
}
```### **Server Actions (Healthcare Context)**

```typescript
// ✅ Server Action with Healthcare Compliance
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@neonpro/compliance'
import { validateHealthcareAccess } from '@neonpro/security'

const PatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  birthDate: z.string(),
  // Healthcare-specific validations
  healthInsurance: z.string().optional(),
  medicalConditions: z.array(z.string()).optional()
})

export async function createPatient(formData: FormData) {
  // Validate healthcare professional permissions
  const professional = await validateHealthcareAccess()
  
  const rawData = Object.fromEntries(formData)
  const validatedData = PatientSchema.parse(rawData)
  
  try {
    const patient = await db.patient.create({
      data: {
        ...validatedData,
        clinicId: professional.clinicId,
        createdBy: professional.id
      }
    })
    
    // MANDATORY: Create audit log for healthcare compliance
    await createAuditLog({
      action: 'CREATE_PATIENT',
      resourceId: patient.id,
      userId: professional.id,
      details: { patientName: patient.name }
    })
    
    revalidatePath('/dashboard/patients')
    
    return { success: true, patient }
  } catch (error) {
    // Detailed error logging for healthcare context
    console.error('Patient creation failed:', {
      error: error.message,
      professionalId: professional.id,
      timestamp: new Date().toISOString()
    })
    
    return { 
      success: false, 
      error: 'Falha ao criar paciente. Verifique os dados e tente novamente.' 
    }
  }
}
```

## 📦 **Turborepo & Package Organization (Healthcare Domain)**

### **Package Imports - Healthcare Context**

```typescript
// ✅ Healthcare Domain Imports
import { PatientService } from '@neonpro/core-services/patient'
import { ComplianceValidator } from '@neonpro/compliance/lgpd'
import { HealthcareButton } from '@neonpro/ui/healthcare/button'
import { formatCPF, validateCRM } from '@neonpro/utils/brazilian'

// ✅ Security-First Imports
import { validateHealthcareProfessional } from '@neonpro/security/auth'
import { createAuditLog } from '@neonpro/compliance/audit'
import { encrypt, decrypt } from '@neonpro/security/crypto'

// ✅ Type Safety - Healthcare Specific
import type { Patient, HealthcareProfessional, AestheticTreatment } from '@neonpro/types/healthcare'
import type { LGPDConsent, ANVISACompliance } from '@neonpro/types/compliance'
```

### **Healthcare Error Handling Patterns**

```typescript
// ✅ Detailed Healthcare Error Handling
export class HealthcareError extends Error {
  constructor(
    message: string,
    public code: string,
    public complianceImpact: boolean = false,
    public auditRequired: boolean = true
  ) {
    super(message)
    this.name = 'HealthcareError'
  }
}

// ✅ Patient Data Error Handling
export async function updatePatientData(patientId: string, data: PatientUpdate) {
  try {
    // Validate LGPD compliance
    const lgpdConsent = await validateLGPDConsent(patientId)
    if (!lgpdConsent.canUpdate) {
      throw new HealthcareError(
        'Paciente não forneceu consentimento para atualização de dados',
        'LGPD_CONSENT_REQUIRED',
        true
      )
    }
    
    const updatedPatient = await patientService.update(patientId, data)
    
    // MANDATORY audit log
    await createAuditLog({
      action: 'UPDATE_PATIENT_DATA',
      resourceId: patientId,
      changes: data,
      complianceNote: 'LGPD consent validated'
    })
    
    return updatedPatient
    
  } catch (error) {
    if (error instanceof HealthcareError && error.complianceImpact) {
      // Escalate compliance-related errors
      await notifyComplianceTeam(error)
    }
    
    throw error
  }
}
```