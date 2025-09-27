interface CertificationData {
  id: string
  status: 'valid' | 'invalid' | 'pending'
  details: string
  certifiedBy: string
  date: Date
}

interface CertificationValidatorProps {
  onValidate: (data: CertificationData) => void
  certificationData: CertificationData
  // ... other props if needed
}

function CertificationValidator({ onValidate, certificationData, ...props }: CertificationValidatorProps) {
  // ... existing code ...
  // Use certificationData.status, certificationData.details, etc.
}

export { CertificationValidator }
