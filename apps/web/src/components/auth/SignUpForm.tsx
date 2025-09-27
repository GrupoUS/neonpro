import React, { useState } from 'react'
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
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="João"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Silva"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profissão *
            </Label>
            <Select
              value={formData.profession}
              onValueChange={(value: ProfessionType) => {
                setFormData(prev => ({ ...prev, profession: value }))
                if (error) setError(null)
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              Registro Profissional (CRM, CRO, etc.)
            </Label>
            <Input
              id="license"
              name="license"
              type="text"
              value={formData.license}
              onChange={handleInputChange}
              placeholder="CRM 12345/SP"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-start">
              <Checkbox
                checked={agreements.lgpd}
                onCheckedChange={(checked) => handleCheckboxChange('lgpd', checked as boolean)}
                disabled={isLoading}
                className="mt-0.5"
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
              <Checkbox
                checked={agreements.terms}
                onCheckedChange={(checked) => handleCheckboxChange('terms', checked as boolean)}
                disabled={isLoading}
                className="mt-0.5"
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

          <Button
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
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Button
              variant="link"
              onClick={onSignIn}
              disabled={isLoading}
              className="p-0 h-auto text-blue-600 hover:text-blue-500 focus:outline-none focus:underline font-medium"
            >
              Faça login
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}