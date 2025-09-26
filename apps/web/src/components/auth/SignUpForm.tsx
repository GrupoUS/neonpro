import React, { useState } from 'react'
import { useSignUp } from '@/hooks/useAuth'
import type { AuthError, ProfessionType } from '@neonpro/types'

interface SignUpFormProps {
  onSuccess?: () => void
  onSignIn?: () => void
  className?: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações básicas
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Por favor, preencha todos os campos obrigatórios',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'As senhas não coincidem',
      })
      return
    }

    if (formData.password.length < 8) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'A senha deve ter pelo menos 8 caracteres',
      })
      return
    }

    if (!formData.profession) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Por favor, selecione sua profissão',
      })
      return
    }

    if (!agreements.lgpd || !agreements.terms) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Você deve aceitar os termos e a política de privacidade',
      })
      return
    }

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
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null)
  }

  const handleCheckboxChange = (name: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [name]: checked }))
    if (error) setError(null)
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Criar Conta na NeonPro
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="João"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Silva"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profissão *
            </label>
            <select
              id="profession"
              name="profession"
              required
              value={formData.profession}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">Selecione sua profissão</option>
              {PROFESSION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              Registro Profissional (CRM, CRO, etc.)
            </label>
            <input
              id="license"
              name="license"
              type="text"
              value={formData.license}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="CRM 12345/SP"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={agreements.lgpd}
                onChange={(e) => handleCheckboxChange('lgpd', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">
                Aceito o tratamento dos meus dados pessoais de acordo com a{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Lei Geral de Proteção de Dados (LGPD)
                </a>
                *
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={(e) => handleCheckboxChange('terms', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">
                Aceito os{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </a>
                *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando conta...
              </div>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={onSignIn}
              className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline font-medium"
              disabled={isLoading}
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}