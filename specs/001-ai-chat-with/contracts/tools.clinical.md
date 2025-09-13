# Contract: Tools — Clinical Metrics

## getNewTreatments(params)
- Input: { month, clinicId? }
- Output: { count, byTreatmentStage?: [{ stage, count }] }

## getPatientBalance(params)
- Input: { patientId }
- Output: { currency, balance }
- Errors: LGPD_CONSENT_REQUIRED, PERMISSION_DENIED
