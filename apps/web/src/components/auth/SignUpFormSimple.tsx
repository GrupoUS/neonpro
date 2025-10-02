import React, { useState, useRef, useEffect } from 'react'
import { useSignUp } from '@/hooks/useAuth.ts'
import type { AuthError, ProfessionType } from '@/types'

interface SignUpFormProps {
  onSuccess?: () => void
  onSignIn?: () => void
  className?: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  profession?: string
  password?: string
  confirmPassword?: string
  lgpd?: string
  terms?: string
  license?: string
}

const PROFESSION_OPTIONS: { value: ProfessionType; label: string }[] = [
  { value: 'medico', label: 'Médico(a)' },
  { value: 'enfermeiro', label: 'Enfermeiro(a)' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'psicologo', label: 'Psicólogo(a)' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'admin', label: 'Administrador' },
]

export const SignUpFormSimple: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSignIn,
  className = '',
}) => {
  const { register, isLoading } = useSignUp()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: '' as ProfessionType,
    license: '',
  })
  const [error, setError] = useState<AuthError | null>(null)
  const [agreements, setAgreements] = useState({
    lgpd: false,
    terms: false,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-focus first field on mount
  useEffect(() => {
    firstNameRef.current?.focus()
  }, [])

  // Enhanced validation with field-specific errors
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'Nome é obrigatório'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Sobrenome é obrigatório'
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido'
      }
    }

    if (!formData.profession) {
      errors.profession = 'Profissão é obrigatória'
    }

    // License validation for healthcare professionals
    if (formData.profession !== 'admin' && formData.profession !== 'recepcionista') {
      if (!formData.license.trim()) {
        errors.license = 'Registro profissional é obrigatório'
      } else if (formData.license.trim().length < 3) {
        errors.license = 'Registro profissional inválido'
      }
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 8) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'A senha deve conter letras maiúsculas, minúsculas e números'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem'
    }

    if (!agreements.lgpd) {
      errors.lgpd = 'Aceite da LGPD é obrigatório'
    }

    if (!agreements.terms) {
      errors.terms = 'Aceite dos termos é obrigatório'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Enhanced validation
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.profession,
        formData.license || undefined
      )

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Erro de conexão. Por favor, tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear specific field error when user starts typing
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Clear general error
    if (error) setError(null)
  }

  const handleCheckboxChange = (name: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [name]: checked }))

    // Clear specific field error
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }

    if (error) setError(null)
  }

  // Refs for form fields
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const professionRef = useRef<HTMLSelectElement>(null)
  const licenseRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const lgpdRef = useRef<HTMLInputElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Criar Conta na NeonPro
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-medium">
              {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="João"
                disabled={isLoading || isSubmitting}
                className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {formErrors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                ref={lastNameRef}
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Silva"
                disabled={isLoading || isSubmitting}
                className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {formErrors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Profissional *
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@clinica.com.br"
              disabled={isLoading || isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profissão na Área da Saúde *
            </label>
            <select
              ref={professionRef}
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value as ProfessionType
                setFormData(prev => ({ ...prev, profession: value }))
                // Clear profession error
                if (formErrors.profession) {
                  setFormErrors(prev => ({ ...prev, profession: undefined }))
                }
                if (error) setError(null)
              }}
              disabled={isLoading || isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione sua profissão</option>
              {PROFESSION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.profession && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.profession}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              Registro Profissional (CRM, CRO, COREN, CRP, etc.)
              {formData.profession && formData.profession !== 'admin' && formData.profession !== 'recepcionista' && ' *'}
            </label>
            <input
              ref={licenseRef}
              id="license"
              name="license"
              type="text"
              autoComplete="off"
              value={formData.license}
              onChange={handleInputChange}
              placeholder={formData.profession === 'medico' ? 'CRM 12345/SP' : 'Registro profissional'}
              disabled={isLoading || isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.license && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.license}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha de Acesso *
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="•••••••••"
              disabled={isLoading || isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              ref={confirmPasswordRef}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="•••••••••"
              disabled={isLoading || isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                ref={lgpdRef}
                id="lgpd-agreement"
                type="checkbox"
                checked={agreements.lgpd}
                onChange={(e) => handleCheckboxChange('lgpd', e.target.checked)}
                disabled={isLoading || isSubmitting}
                className="mt-0.5 h-5 w-5"
              />
              <span className="ml-2 text-sm text-gray-600">
                <span className="font-medium">Li e concordo</span> com o tratamento dos meus dados pessoais de acordo com a{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Lei Geral de Proteção de Dados (LGPD)
                </a>
                <span className="text-red-600 ml-1">*</span>
              </span>
            </label>
            {formErrors.lgpd && (
              <p className="text-sm text-red-600 ml-6">
                {formErrors.lgpd}
              </p>
            )}

            <label className="flex items-start">
              <input
                ref={termsRef}
                id="terms-agreement"
                type="checkbox"
                checked={agreements.terms}
                onChange={(e) => handleCheckboxChange('terms', e.target.checked)}
                disabled={isLoading || isSubmitting}
                className="mt-0.5 h-5 w-5"
              />
              <span className="ml-2 text-sm text-gray-600">
                <span className="font-medium">Li e aceito</span> os{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Política de Privacidade
                </a>
                <span className="text-red-600 ml-1">*</span>
              </span>
            </label>
            {formErrors.terms && (
              <p className="text-sm text-red-600 ml-6">
                {formErrors.terms}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full flex justify-center min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                ></div>
                <span>Criando conta...</span>
              </div>
            ) : (
              <span>Criar Conta Profissional</span>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta profissional?{' '}
            <button
              type="button"
              onClick={onSignIn}
              disabled={isLoading || isSubmitting}
              className="p-0 h-auto text-blue-600 hover:text-blue-500 underline font-medium text-sm"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}