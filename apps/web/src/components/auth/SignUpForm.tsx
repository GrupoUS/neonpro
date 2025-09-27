import React, { useState, useRef, useEffect } from 'react'
import { useSignUp } from '@/hooks/useAuth.js'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from '@neonpro/ui'
import type { AuthError, ProfessionType } from '@neonpro/types'
import { cn } from '@/lib/utils'

interface SignUpFormProps {
  onSuccess?: () => void
  onSignIn?: () => void
  className?: string
}

interface AccessibleFieldProps {
  id: string
  label: string
  description?: string
  required?: boolean
  error?: string
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

export const SignUpForm: React.FC<SignUpFormProps> = ({
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

  // Refs for focus management
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const professionRef = useRef<HTMLButtonElement>(null)
  const licenseRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const lgpdRef = useRef<HTMLInputElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

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

  // Focus management for error handling
  const focusFirstError = () => {
    if (formErrors.firstName) firstNameRef.current?.focus()
    else if (formErrors.lastName) lastNameRef.current?.focus()
    else if (formErrors.email) emailRef.current?.focus()
    else if (formErrors.profession) professionRef.current?.focus()
    else if (formErrors.license) licenseRef.current?.focus()
    else if (formErrors.password) passwordRef.current?.focus()
    else if (formErrors.confirmPassword) confirmPasswordRef.current?.focus()
    else if (formErrors.lgpd) lgpdRef.current?.focus()
    else if (formErrors.terms) termsRef.current?.focus()
  }

  // Keyboard navigation support with type safety
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault()
      ;(nextRef.current as HTMLElement).focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Enhanced validation
    if (!validateForm()) {
      setIsSubmitting(false)
      // Focus first field with error
      setTimeout(focusFirstError, 100)
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
        // Focus on first field for server errors
        firstNameRef.current?.focus()
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Erro de conexão. Por favor, tente novamente.',
      })
      firstNameRef.current?.focus()
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

  // Accessible field description helper
  const getFieldDescription = (fieldId: string, description: string) => {
    return `${fieldId}-description`
  }

  // Generate accessible field props
  const getAccessibleFieldProps = ({ id, label, description, required, error }: AccessibleFieldProps) => {
    const descriptionId = description ? getFieldDescription(id, description) : undefined
    const errorId = error ? `${id}-error` : undefined

    return {
      'aria-label': label,
      'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
      'aria-required': required,
      'aria-invalid': !!error,
      ...(error && { 'aria-errormessage': errorId }),
    }
  }

  return (
    <div
      className={`w-full max-w-md mx-auto ${className}`}
      role="region"
      aria-label="Formulário de Cadastro NeonPro"
    >
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6" tabIndex={0}>
          Criar Conta na NeonPro
        </h2>

        {/* Live region for screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {error && `Erro: ${error.message}`}
          {isSubmitting && 'Processando cadastro...'}
        </div>

        {/* Accessible error message */}
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-600 font-medium">
              <span className="sr-only">Erro: </span>
              {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name fields with enhanced accessibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </Label>
              <Input
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, lastNameRef)}
                placeholder="João"
                disabled={isLoading || isSubmitting}
                {...getAccessibleFieldProps({
                  id: 'firstName',
                  label: 'Nome completo',
                  description: 'Digite seu primeiro nome',
                  required: true,
                  error: formErrors.firstName,
                })}
                className={cn(
                  formErrors.firstName && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
              />
              {formErrors.firstName && (
                <p
                  id="firstName-error"
                  className="text-sm text-red-600 mt-1"
                  role="alert"
                >
                  {formErrors.firstName}
                </p>
              )}
              <p
                id="firstName-description"
                className="text-xs text-gray-500 mt-1"
              >
                Digite apenas seu primeiro nome
              </p>
            </div>

            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </Label>
              <Input
                ref={lastNameRef}
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                placeholder="Silva"
                disabled={isLoading || isSubmitting}
                {...getAccessibleFieldProps({
                  id: 'lastName',
                  label: 'Sobrenome',
                  description: 'Digite seu sobrenome',
                  required: true,
                  error: formErrors.lastName,
                })}
                className={cn(
                  formErrors.lastName && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
              />
              {formErrors.lastName && (
                <p
                  id="lastName-error"
                  className="text-sm text-red-600 mt-1"
                  role="alert"
                >
                  {formErrors.lastName}
                </p>
              )}
              <p
                id="lastName-description"
                className="text-xs text-gray-500 mt-1"
              >
                Digite seu sobrenome completo
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Profissional *
            </Label>
            <Input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, professionRef)}
              placeholder="seu@clinica.com.br"
              disabled={isLoading || isSubmitting}
              {...getAccessibleFieldProps({
                id: 'email',
                label: 'Email profissional',
                description: 'Digite seu email profissional para acesso ao sistema',
                required: true,
                error: formErrors.email,
              })}
              className={cn(
                formErrors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {formErrors.email && (
              <p
                id="email-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
              >
                {formErrors.email}
              </p>
            )}
            <p
              id="email-description"
              className="text-xs text-gray-500 mt-1"
            >
              Use seu email profissional da clínica
            </p>
          </div>

          <div>
            <Label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profissão na Área da Saúde *
            </Label>
            <Select
              value={formData.profession}
              onValueChange={(value: ProfessionType) => {
                setFormData(prev => ({ ...prev, profession: value }))
                // Clear profession error
                if (formErrors.profession) {
                  setFormErrors(prev => ({ ...prev, profession: undefined }))
                }
                if (error) setError(null)

                // Focus license field if profession requires it
                if (value !== 'admin' && value !== 'recepcionista') {
                  setTimeout(() => licenseRef.current?.focus(), 100)
                } else {
                  setTimeout(() => passwordRef.current?.focus(), 100)
                }
              }}
              disabled={isLoading || isSubmitting}
              {...getAccessibleFieldProps({
                id: 'profession',
                label: 'Profissão na área da saúde',
                description: 'Selecione sua especialidade profissional',
                required: true,
                error: formErrors.profession,
              })}
            >
              <SelectTrigger ref={professionRef}>
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSION_OPTIONS.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    aria-label={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.profession && (
              <p
                id="profession-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
              >
                {formErrors.profession}
              </p>
            )}
            <p
              id="profession-description"
              className="text-xs text-gray-500 mt-1"
            >
              Selecione sua especialidade profissional
            </p>
          </div>

          <div>
            <Label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              Registro Profissional (CRM, CRO, COREN, CRP, etc.)
              {formData.profession && formData.profession !== 'admin' && formData.profession !== 'recepcionista' && ' *'}
            </Label>
            <Input
              ref={licenseRef}
              id="license"
              name="license"
              type="text"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.license}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              placeholder={formData.profession === 'medico' ? 'CRM 12345/SP' : formData.profession === 'dentista' ? 'CRO 12345/SP' : 'Registro profissional'}
              disabled={isLoading || isSubmitting}
              {...getAccessibleFieldProps({
                id: 'license',
                label: 'Registro profissional',
                description: 'Digite seu número de registro no conselho profissional',
                required: formData.profession && formData.profession !== 'admin' && formData.profession !== 'recepcionista',
                error: formErrors.license,
              })}
              className={cn(
                formErrors.license && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {formErrors.license && (
              <p
                id="license-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
              >
                {formErrors.license}
              </p>
            )}
            <p
              id="license-description"
              className="text-xs text-gray-500 mt-1"
            >
              {formData.profession === 'medico' && 'Conselho Regional de Medicina (CRM)'}
              {formData.profession === 'dentista' && 'Conselho Regional de Odontologia (CRO)'}
              {formData.profession === 'enfermeiro' && 'Conselho Regional de Enfermagem (COREN)'}
              {formData.profession === 'psicologo' && 'Conselho Regional de Psicologia (CRP)'}
              {!formData.profession && 'Seu registro no conselho profissional'}
            </p>
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha de Acesso *
            </Label>
            <Input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
              placeholder="••••••••"
              disabled={isLoading || isSubmitting}
              {...getAccessibleFieldProps({
                id: 'password',
                label: 'Senha de acesso ao sistema',
                description: 'Crie uma senha segura com letras maiúsculas, minúsculas e números',
                required: true,
                error: formErrors.password,
              })}
              className={cn(
                formErrors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {formErrors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
              >
                {formErrors.password}
              </p>
            )}
            <p
              id="password-description"
              className="text-xs text-gray-500 mt-1"
            >
              Mínimo 8 caracteres. Use letras maiúsculas, minúsculas e números.
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </Label>
            <Input
              ref={confirmPasswordRef}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, lgpdRef)}
              placeholder="••••••••"
              disabled={isLoading || isSubmitting}
              {...getAccessibleFieldProps({
                id: 'confirmPassword',
                label: 'Confirmação de senha',
                description: 'Digite a mesma senha novamente para confirmação',
                required: true,
                error: formErrors.confirmPassword,
              })}
              className={cn(
                formErrors.confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {formErrors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
              >
                {formErrors.confirmPassword}
              </p>
            )}
            <p
              id="confirmPassword-description"
              className="text-xs text-gray-500 mt-1"
            >
              Digite a mesma senha para confirmação
            </p>
          </div>

          {/* Healthcare compliance checkboxes with enhanced accessibility */}
          <div className="space-y-4" role="group" aria-label="Termos e autorizações">
            <div className="space-y-3">
              <label className="flex items-start group">
                <Checkbox
                  ref={lgpdRef}
                  id="lgpd-agreement"
                  checked={agreements.lgpd}
                  onCheckedChange={(checked) => handleCheckboxChange('lgpd', checked as boolean)}
                  disabled={isLoading || isSubmitting}
                  className="mt-0.5"
                  {...getAccessibleFieldProps({
                    id: 'lgpd-agreement',
                    label: 'Concordo com a Lei Geral de Proteção de Dados',
                    description: 'Autorizo o tratamento de dados conforme a LGPD',
                    required: true,
                    error: formErrors.lgpd,
                  })}
                />
                <span className="ml-2 text-sm text-gray-600">
                  <span className="font-medium">Li e concordo</span> com o tratamento dos meus dados pessoais de acordo com a{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    aria-label="Lei Geral de Proteção de Dados, abre em nova janela"
                  >
                    Lei Geral de Proteção de Dados (LGPD)
                  </a>
                  <span className="text-red-600 ml-1" aria-label="obrigatório">*</span>
                </span>
              </label>
              {formErrors.lgpd && (
                <p
                  id="lgpd-agreement-error"
                  className="text-sm text-red-600 ml-6"
                  role="alert"
                >
                  {formErrors.lgpd}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-start group">
                <Checkbox
                  ref={termsRef}
                  id="terms-agreement"
                  checked={agreements.terms}
                  onCheckedChange={(checked) => handleCheckboxChange('terms', checked as boolean)}
                  disabled={isLoading || isSubmitting}
                  className="mt-0.5"
                  {...getAccessibleFieldProps({
                    id: 'terms-agreement',
                    label: 'Aceito os termos de uso e política de privacidade',
                    description: 'Concordo com os termos do serviço',
                    required: true,
                    error: formErrors.terms,
                  })}
                />
                <span className="ml-2 text-sm text-gray-600">
                  <span className="font-medium">Li e aceito</span> os{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    aria-label="Termos de Uso, abre em nova janela"
                  >
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    aria-label="Política de Privacidade, abre em nova janela"
                  >
                    Política de Privacidade
                  </a>
                  <span className="text-red-600 ml-1" aria-label="obrigatório">*</span>
                </span>
              </label>
              {formErrors.terms && (
                <p
                  id="terms-agreement-error"
                  className="text-sm text-red-600 ml-6"
                  role="alert"
                >
                  {formErrors.terms}
                </p>
              )}
            </div>

            {/* Healthcare-specific compliance notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Informações para profissionais de saúde:</span> Este sistema está em conformidade com as normas do CFM, ANVISA e demais conselhos profissionais. Seus dados estão protegidos pela LGPD.
              </p>
            </div>
          </div>

          {/* Accessible submit button */}
          <Button
            ref={submitRef}
            type="submit"
            disabled={isLoading || isSubmitting}
            aria-disabled={isLoading || isSubmitting}
            aria-busy={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                  aria-label="Carregando"
                  role="status"
                ></div>
                <span>Criando conta...</span>
              </div>
            ) : (
              <span>Criar Conta Profissional</span>
            )}
          </Button>

          {/* Keyboard navigation help */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Use <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Tab</kbd> para navegar e{' '}
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Enter</kbd> para selecionar
            </p>
          </div>
        </form>

        {/* Accessible login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta profissional?{' '}
            <Button
              variant="link"
              onClick={onSignIn}
              disabled={isLoading || isSubmitting}
              className="p-0 h-auto text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded font-medium text-sm"
              aria-label="Fazer login na conta existente"
            >
              Faça login
            </Button>
          </p>
        </div>

        {/* Healthcare accessibility footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            NeonPro Saúde - Sistema em conformidade com WCAG 2.1 AA+, LGPD, CFM e ANVISA.
            <br />
            Navegação por teclado totalmente acessível. {' '}
            <a
              href="/accessibility"
              className="text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Declaração de acessibilidade"
            >
              Acessibilidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}