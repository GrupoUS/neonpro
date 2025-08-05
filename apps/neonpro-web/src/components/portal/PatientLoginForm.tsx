'use client'

// ===============================================
// Patient Portal Login Form Component
// Story 4.3: Patient Portal & Self-Service
// ===============================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientPortalAuthService } from '@/lib/auth-advanced/patient-portal-auth'
import { registerPortalServiceWorker, enableOfflineSupport, enableInstallPrompt } from '@/lib/auth-advanced/pwa-config'
import type { PatientLoginForm as LoginFormData } from '@/types/patient-portal'

const loginSchema = z.object({
  login_type: z.enum(['email', 'phone', 'document']),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  document_number: z.string().min(11, 'Documento inválido').optional(),
  clinic_code: z.string().min(3, 'Código da clínica é obrigatório'),
  remember_me: z.boolean().default(false)
}).refine((data) => {
  if (data.login_type === 'email' && !data.email) {
    return false
  }
  if (data.login_type === 'phone' && !data.phone) {
    return false
  }
  if (data.login_type === 'document' && !data.document_number) {
    return false
  }
  return true
}, {
  message: 'Campo de identificação é obrigatório'
})

interface PatientLoginFormProps {
  initialClinicCode?: string
  redirectUrl?: string
}

export default function PatientLoginForm({ 
  initialClinicCode, 
  redirectUrl 
}: PatientLoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showPWAFeatures, setShowPWAFeatures] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login_type: 'email',
      clinic_code: initialClinicCode || '',
      remember_me: false
    }
  })

  const loginType = watch('login_type')

  useEffect(() => {
    // Initialize PWA features
    registerPortalServiceWorker()
    enableOfflineSupport()
    const { showInstallDialog } = enableInstallPrompt()
    
    // Check if PWA features should be shown
    setShowPWAFeatures(true)
    
    // Listen for install events
    const handleInstallEvent = () => {
      showInstallDialog()
    }
    
    window.addEventListener('install-portal', handleInstallEvent)
    
    return () => {
      window.removeEventListener('install-portal', handleInstallEvent)
    }
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setLoginError(null)

    try {
      const response = await PatientPortalAuthService.authenticatePatient(data)
      
      if (response.success && response.data) {
        // Authentication successful
        const redirectTo = redirectUrl || '/portal/dashboard'
        router.push(redirectTo)
      } else {
        setLoginError(response.error?.message || 'Erro ao fazer login')
      }
    } catch (error) {
      setLoginError('Erro interno. Tente novamente.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    // Simple phone formatting for Brazilian numbers
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const formatDocument = (value: string) => {
    // Simple CPF formatting
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Code */}
      <div className="space-y-2">
        <Label htmlFor="clinic_code" className="text-sm font-medium text-gray-700">
          Código da Clínica
        </Label>
        <Input
          id="clinic_code"
          type="text"
          placeholder="Ex: CLINIC123"
          className="text-center font-mono uppercase"
          {...register('clinic_code')}
          onChange={(e) => {
            setValue('clinic_code', e.target.value.toUpperCase())
          }}
        />
        {errors.clinic_code && (
          <p className="text-sm text-red-600">{errors.clinic_code.message}</p>
        )}
      </div>

      {/* Login Type Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Como deseja entrar?
        </Label>
        <Select 
          value={loginType} 
          onValueChange={(value: 'email' | 'phone' | 'document') => setValue('login_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="document">CPF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Input Field */}
      <div className="space-y-2">
        {loginType === 'email' && (
          <>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </>
        )}

        {loginType === 'phone' && (
          <>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setValue('phone', formatted)
              }}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </>
        )}

        {loginType === 'document' && (
          <>
            <Label htmlFor="document_number" className="text-sm font-medium text-gray-700">
              CPF
            </Label>
            <Input
              id="document_number"
              type="text"
              placeholder="000.000.000-00"
              {...register('document_number')}
              onChange={(e) => {
                const formatted = formatDocument(e.target.value)
                setValue('document_number', formatted)
              }}
            />
            {errors.document_number && (
              <p className="text-sm text-red-600">{errors.document_number.message}</p>
            )}
          </>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-3">
        <Switch
          id="remember_me"
          {...register('remember_me')}
          onCheckedChange={(checked) => setValue('remember_me', checked)}
        />
        <Label htmlFor="remember_me" className="text-sm text-gray-700">
          Manter conectado por 7 dias
        </Label>
      </div>

      {/* Error Message */}
      {loginError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{loginError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Entrando...</span>
          </div>
        ) : (
          'Entrar no Portal'
        )}
      </Button>

      {/* PWA Install Hint */}
      {showPWAFeatures && (
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-2">
            💡 Dica: Adicione o portal à sua tela inicial para acesso rápido
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>Primeira vez? Use os dados que você forneceu na clínica</p>
        <p className="text-xs">Email, telefone ou CPF cadastrado</p>
      </div>
    </form>
  )
}
