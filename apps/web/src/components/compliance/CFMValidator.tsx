/**
 * CFM Professional Validation Component
 * Real-time Brazilian medical license validation with visual feedback
 * Integrated with CFM database and audit trail
 */

import { cn, } from '@neonpro/utils'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  RefreshCw,
  Shield,
  User,
  XCircle,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState, } from 'react'

import type {
  CFMValidationBadgeProps,
  CFMValidationResult,
  ValidationResponse,
} from '../../types/compliance'
// import { CFMLicenseStatus, MedicalSpecialty } from "../../types/compliance"; // Unused imports

import { cfmUtils, cfmValidationService, } from '../../lib/compliance/cfm-professional-validation'

// Status configuration with NEONPRO theme colors
const STATUS_CONFIG = {
  active: {
    label: 'Ativo',
    icon: CheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    description: 'Licença válida e ativa',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    description: 'Validação em andamento',
  },
  expired: {
    label: 'Expirado',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    description: 'Licença expirada',
  },
  suspended: {
    label: 'Suspenso',
    icon: AlertTriangle,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    description: 'Licença suspensa pelo CFM',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    description: 'Licença cancelada',
  },
} as const

// Validation input component
export interface CFMValidationInputProps {
  onValidationComplete?: (
    result: ValidationResponse<CFMValidationResult>,
  ) => void
  autoValidate?: boolean
  placeholder?: string
  className?: string
}

export const CFMValidationInput: React.FC<CFMValidationInputProps> = ({
  onValidationComplete,
  autoValidate = true,
  placeholder = 'Digite o CRM (ex: CRM-SP 123456)',
  className,
},) => {
  const [crmNumber, setCrmNumber,] = useState('',)
  const [isValidating, setIsValidating,] = useState(false,)
  const [validationResult, setValidationResult,] = useState<
    ValidationResponse<CFMValidationResult> | null
  >(null,)

  const validateCRM = useCallback(
    async (crm: string,) => {
      if (!crm.trim()) {
        setValidationResult(null,)
        return
      }

      setIsValidating(true,)
      try {
        const result = await cfmValidationService.validateLicense(crm,)
        setValidationResult(result,)
        onValidationComplete?.(result,)
      } catch (error) {
        const errorResult: ValidationResponse<CFMValidationResult> = {
          isValid: false,
          errors: [
            'Erro na validação: '
            + (error instanceof Error ? error.message : 'Erro desconhecido'),
          ],
          warnings: [],
          timestamp: new Date(),
          source: 'cfm-validator-component',
        }
        setValidationResult(errorResult,)
        onValidationComplete?.(errorResult,)
      } finally {
        setIsValidating(false,)
      }
    },
    [onValidationComplete,],
  )

  useEffect(() => {
    if (autoValidate && crmNumber) {
      const timeoutId = setTimeout(() => {
        validateCRM(crmNumber,)
      }, 500,) // Debounce validation

      return () => clearTimeout(timeoutId,)
    }
  }, [crmNumber, autoValidate, validateCRM,],)

  const handleInputChange = (value: string,) => {
    setCrmNumber(value,)
    if (!autoValidate) {
      setValidationResult(null,)
    }
  }

  const handleManualValidation = () => {
    if (crmNumber.trim()) {
      validateCRM(crmNumber,)
    }
  }

  return (
    <div className={cn('space-y-4', className,)}>
      {/* Input Field */}
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={crmNumber}
            onChange={(e,) => handleInputChange(e.target.value.toUpperCase(),)}
            placeholder={placeholder}
            className={cn(
              'flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              validationResult?.isValid === true
                ? 'border-green-300'
                : validationResult?.isValid === false
                ? 'border-red-300'
                : 'border-gray-200',
            )}
          />

          {!autoValidate && (
            <button
              onClick={handleManualValidation}
              disabled={isValidating || !crmNumber.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isValidating
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Shield className="w-4 h-4" />}
              Validar
            </button>
          )}
        </div>

        {/* Loading indicator for auto-validation */}
        {autoValidate && isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className="space-y-3">
          {/* Status Badge */}
          {validationResult.data && (
            <CFMValidationBadge
              license={validationResult.data.license}
              specialty={validationResult.data.specialty}
              validUntil={validationResult.data.validUntil}
              status={validationResult.data.status}
              showTooltip
            />
          )}

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Erro na validação</p>
                <ul className="text-sm text-red-600 mt-1">
                  {validationResult.errors.map((error, index,) => <li key={index}>• {error}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Atenções</p>
                <ul className="text-sm text-yellow-700 mt-1">
                  {validationResult.warnings.map((warning, index,) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main CFM validation badge component
export const CFMValidationBadge: React.FC<CFMValidationBadgeProps> = ({
  license,
  specialty,
  validUntil,
  status,
  automaticValidation = false,
  onStatusChange,
  showTooltip = false,
  className,
},) => {
  const [isExpiringSoon, setIsExpiringSoon,] = useState(false,)
  const [tooltipVisible, setTooltipVisible,] = useState(false,)

  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  useEffect(() => {
    const expiringSoon = cfmUtils.isLicenseExpiringSoon(validUntil, 30,)
    setIsExpiringSoon(expiringSoon,)
  }, [validUntil,],)

  const formatDate = (date: Date,) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },)
  }

  const specialtyDisplayName = cfmUtils.getSpecialtyDisplayName(specialty,)

  return (
    <div className="relative">
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
          config.bg,
          config.text,
          config.border,
          isExpiringSoon && status === 'active' && 'ring-2 ring-yellow-300',
          className,
        )}
        onMouseEnter={() => showTooltip && setTooltipVisible(true,)}
        onMouseLeave={() => showTooltip && setTooltipVisible(false,)}
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', config.dot,)} />
          <Icon className="w-4 h-4" />
          <span className="font-semibold">{config.label}</span>
        </div>

        {/* License Number */}
        <div className="flex items-center gap-2 border-l border-current border-opacity-20 pl-3">
          <Shield className="w-4 h-4" />
          <span>{license}</span>
        </div>

        {/* Expiration Warning */}
        {isExpiringSoon && status === 'active' && (
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Expira em breve</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div className="absolute z-10 top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[300px]">
          <div className="space-y-2">
            {/* Professional Info */}
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Especialidade:</span>
              <span>{specialtyDisplayName}</span>
            </div>

            {/* Valid Until */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Válido até:</span>
              <span
                className={isExpiringSoon ? 'text-yellow-600 font-medium' : ''}
              >
                {formatDate(validUntil,)}
              </span>
            </div>

            {/* Status Description */}
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-gray-600 mt-0.5">{config.description}</p>
              </div>
            </div>

            {/* Automatic Validation Note */}
            {automaticValidation && (
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Validação automática ativada</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Professional profile card with validation
export interface CFMProfessionalCardProps {
  crmNumber: string
  professionalName?: string
  showValidation?: boolean
  showDetails?: boolean
  onValidationComplete?: (
    result: ValidationResponse<CFMValidationResult>,
  ) => void
  className?: string
}

export const CFMProfessionalCard: React.FC<CFMProfessionalCardProps> = ({
  crmNumber,
  professionalName,
  showValidation = true,
  showDetails = true,
  onValidationComplete,
  className,
},) => {
  const [validationResult, setValidationResult,] = useState<
    ValidationResponse<CFMValidationResult> | null
  >(null,)
  const [isLoading, setIsLoading,] = useState(false,)

  useEffect(() => {
    if (showValidation && crmNumber) {
      validateProfessional()
    }
  }, [crmNumber, showValidation, validateProfessional,],)

  const validateProfessional = useCallback(async () => {
    setIsLoading(true,)
    try {
      const result = await cfmValidationService.validateLicense(crmNumber,)
      setValidationResult(result,)
      onValidationComplete?.(result,)
    } catch (error) {
      console.error('Error validating professional:', error,)
    } finally {
      setIsLoading(false,)
    }
  }, [crmNumber, onValidationComplete,],)

  const professional = validationResult?.data

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {professionalName
              || professional?.doctorName
              || 'Profissional de Saúde'}
          </h3>
          <p className="text-sm text-gray-600">{crmNumber}</p>
        </div>

        {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />}
      </div>

      {/* Validation Badge */}
      {showValidation && professional && (
        <div className="mb-4">
          <CFMValidationBadge
            license={professional.license}
            specialty={professional.specialty}
            validUntil={professional.validUntil}
            status={professional.status}
            showTooltip
          />
        </div>
      )}

      {/* Details */}
      {showDetails && professional && (
        <div className="space-y-3">
          {/* Specialty */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Especialidade:</span>
            <span>
              {cfmUtils.getSpecialtyDisplayName(professional.specialty,)}
            </span>
          </div>

          {/* Valid Until */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Válido até:</span>
            <span>{professional.validUntil.toLocaleDateString('pt-BR',)}</span>
          </div>

          {/* Restrictions */}
          {professional.restrictions.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 text-sm">
                    Restrições
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1">
                    {professional.restrictions.map((restriction, index,) => (
                      <li key={index}>• {restriction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Last Verified */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Última verificação: {professional.lastVerified.toLocaleString('pt-BR',)}
            </span>
            <span className="capitalize">
              Fonte: {professional.verificationSource}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {validationResult
        && !validationResult.isValid
        && validationResult.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 text-sm">
                Erro na validação
              </p>
              <p className="text-xs text-red-600 mt-1">
                {validationResult.errors[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Batch validation component for multiple professionals
export interface CFMBatchValidatorProps {
  crmNumbers: string[]
  onValidationComplete?: (
    results: ValidationResponse<CFMValidationResult[]>,
  ) => void
  className?: string
}

export const CFMBatchValidator: React.FC<CFMBatchValidatorProps> = ({
  crmNumbers,
  onValidationComplete,
  className,
},) => {
  const [results, setResults,] = useState<
    ValidationResponse<
      CFMValidationResult[]
    > | null
  >(null,)
  const [isValidating, setIsValidating,] = useState(false,)

  useEffect(() => {
    if (crmNumbers.length > 0) {
      validateBatch()
    }
  }, [crmNumbers, validateBatch,],)

  const validateBatch = useCallback(async () => {
    setIsValidating(true,)
    try {
      const result = await cfmValidationService.validateMultipleLicenses(crmNumbers,)
      setResults(result,)
      onValidationComplete?.(result,)
    } catch (error) {
      console.error('Error in batch validation:', error,)
    } finally {
      setIsValidating(false,)
    }
  }, [crmNumbers, onValidationComplete,],)

  if (!results && !isValidating) {
    return null
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Validação em Lote ({crmNumbers.length} licenças)
        </h3>
        {isValidating && <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />}
      </div>

      {results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.data?.filter((r,) => r.isValid).length || 0}
              </div>
              <div className="text-sm text-gray-600">Válidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {results.data?.filter((r,) => !r.isValid).length || 0}
              </div>
              <div className="text-sm text-gray-600">Inválidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {results.data?.filter((r,) => cfmUtils.isLicenseExpiringSoon(r.validUntil,)).length
                  || 0}
              </div>
              <div className="text-sm text-gray-600">Expirando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {results.data?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Results List */}
          {results.data && results.data.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.data.map((professional, index,) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CFMValidationBadge
                      license={professional.license}
                      specialty={professional.specialty}
                      validUntil={professional.validUntil}
                      status={professional.status}
                    />
                    <span className="text-sm font-medium">
                      {professional.doctorName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CFMValidationInput
