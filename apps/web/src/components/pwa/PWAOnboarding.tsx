import { Button } from '@/components/ui/button.ts'
import { Card, CardContent } from '@/components/ui/card.ts'
import { Progress } from '@/components/ui/progress.ts'
import { usePWA } from '@/hooks/usePWA.ts'
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react'
import * as React from 'react'
import { PWABottomSheet, PWATouchAction } from './PWAMobileComponents'

export interface PWAOnboardingProps {
  open: boolean
  onClose: () => void
  onComplete?: () => void
}

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  action?: {
    label: string
    onClick: () => void
    primary?: boolean
  }
}

export const PWAOnboarding: React.FC<PWAOnboardingProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const { isInstalled, installPWA, requestNotificationPermission, isOnline } = usePWA()
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Bem-vindo ao NeonPro Mobile',
      description:
        'Sua clínica estética agora cabe no seu bolso. Gerencie pacientes, agendamentos e estoque de qualquer lugar.',
      icon: Smartphone,
    },
    {
      id: 1,
      title: 'Instale no seu dispositivo',
      description:
        'Tenha acesso rápido mesmo offline e receba notificações importantes de consultas e atualizações.',
      icon: Download,
      action: {
        label: isInstalled ? 'Instalado' : 'Instalar Aplicativo',
        onClick: async () => {
          if (!isInstalled) {
            await installPWA()
            setCompletedSteps(prev => new Set([...prev, 1]))
          }
        },
        primary: !isInstalled,
      },
    },
    {
      id: 2,
      title: 'Ative as notificações',
      description:
        'Receba lembretes de consultas, confirmações automáticas e alertas importantes da sua clínica.',
      icon: Bell,
      action: {
        label: 'Ativar Notificações',
        onClick: async () => {
          await requestNotificationPermission()
          setCompletedSteps(prev => new Set([...prev, 2]))
        },
        primary: true,
      },
    },
    {
      id: 3,
      title: 'Trabalhe offline',
      description:
        'Continue usando o sistema mesmo sem internet. Todos os dados serão sincronizados automaticamente.',
      icon: WifiOff,
    },
    {
      id: 4,
      title: 'Recursos disponíveis',
      description:
        'Acesse todas as funcionalidades principais da clínica estética diretamente do seu celular.',
      icon: Zap,
    },
  ]

  const features = [
    { icon: Calendar, title: 'Agendamentos', description: 'Gerencie consultas e horários' },
    { icon: Users, title: 'Pacientes', description: 'Fichas completas e histórico' },
    { icon: Package, title: 'Estoque', description: 'Controle de produtos estéticos' },
    { icon: TrendingUp, title: 'Analytics', description: 'Relatórios e métricas' },
    { icon: Shield, title: 'Segurança', description: 'Dados criptografados LGPD' },
    { icon: Star, title: 'Suporte', description: 'Ajuda 24/7 especializada' },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete?.()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete?.()
    onClose()
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (!open) return null

  return (
    <PWABottomSheet open={open} onClose={onClose} title='Configuração do NeonPro Mobile'>
      <div className='p-6 space-y-6'>
        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-gray-600'>
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Current Step */}
        <div className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex-shrink-0'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                {steps[currentStep]?.icon && (
                  React.createElement(steps[currentStep].icon, {
                    className: 'h-6 w-6 text-blue-600',
                  })
                )}
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {steps[currentStep]?.title || ''}
              </h3>
              <p className='text-sm text-gray-600 mt-1'>
                {steps[currentStep]?.description || ''}
              </p>
            </div>
          </div>

          {/* Features Grid (shown on step 4) */}
          {currentStep === 4 && (
            <div className='grid grid-cols-2 gap-3 mt-6'>
              {features.map((feature, index) => (
                <div key={index} className='p-3 bg-gray-50 rounded-lg text-center'>
                  {React.createElement(feature.icon, {
                    className: 'h-6 w-6 text-blue-600 mx-auto mb-2',
                  })}
                  <h4 className='text-sm font-medium text-gray-900'>{feature.title}</h4>
                  <p className='text-xs text-gray-600 mt-1'>{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3'>
            {steps[currentStep]?.action && (
              <PWATouchAction
                onClick={steps[currentStep].action.onClick}
                className={steps[currentStep].action.primary ? 'w-full' : 'w-full'}
                variant={steps[currentStep].action.primary ? 'default' : 'outline'}
                haptic='medium'
              >
                {steps[currentStep].action.label}
              </PWATouchAction>
            )}

            {/* Navigation Buttons */}
            <div className='flex space-x-3'>
              {currentStep > 0 && (
                <Button
                  variant='outline'
                  onClick={handlePrevious}
                  className='flex-1'
                >
                  <ChevronLeft className='h-4 w-4 mr-2' />
                  Anterior
                </Button>
              )}

              {currentStep === steps.length - 1
                ? (
                  <Button onClick={handleSkip} className='flex-1'>
                    Começar a usar
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Button>
                )
                : (
                  <Button onClick={handleNext} className='flex-1'>
                    Próximo
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Button>
                )}
            </div>

            {/* Skip Button */}
            {currentStep < steps.length - 1 && (
              <Button
                variant='ghost'
                onClick={handleSkip}
                className='w-full text-gray-500'
              >
                Pular tutorial
              </Button>
            )}
          </div>
        </div>

        {/* Completed Steps */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-900'>Configurações concluídas:</h4>
          <div className='space-y-1'>
            {steps.slice(1).map(step => (
              <div key={step.id} className='flex items-center space-x-2'>
                {completedSteps.has(step.id) || (step.id === 1 && isInstalled)
                  ? <CheckCircle className='h-4 w-4 text-green-500' />
                  : <div className='w-4 h-4 border-2 border-gray-300 rounded-full' />}
                <span
                  className={`text-sm ${
                    completedSteps.has(step.id) || (step.id === 1 && isInstalled)
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Status */}
        {!isOnline && (
          <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
            <div className='flex items-center space-x-2'>
              <WifiOff className='h-4 w-4 text-orange-600' />
              <p className='text-sm text-orange-800'>
                Você está offline. Algumas funcionalidades podem estar limitadas.
              </p>
            </div>
          </div>
        )}
      </div>
    </PWABottomSheet>
  )
}

// PWA Installation Banner
export interface PWAInstallBannerProps {
  className?: string
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className }) => {
  const { isInstallable, isInstalled, installPWA } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) {
      setDismissed(true)
    }
  }, [])

  const handleInstall = async () => {
    const outcome = await installPWA()
    if (outcome === 'accepted') {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (dismissed || !isInstallable || isInstalled) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg z-40 ${className}`}
    >
      <div className='max-w-4xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='p-2 bg-white/20 rounded-lg'>
            <Smartphone className='h-6 w-6' />
          </div>
          <div>
            <h3 className='font-semibold'>NeonPro no seu celular</h3>
            <p className='text-sm text-blue-100'>
              Instale o aplicativo para acesso rápido e funcionalidade offline
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          <Button
            onClick={handleInstall}
            className='bg-white text-blue-600 hover:bg-gray-100'
          >
            <Download className='h-4 w-4 mr-2' />
            Instalar Agora
          </Button>
          <Button
            variant='ghost'
            onClick={handleDismiss}
            className='text-white hover:bg-white/20'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

// PWA Features Highlight
export interface PWAFeaturesProps {
  className?: string
}

export const PWAFeatures: React.FC<PWAFeaturesProps> = ({ className }) => {
  const features = [
    {
      icon: Smartphone,
      title: 'App Instalável',
      description: 'Instale na tela inicial como um aplicativo nativo',
    },
    {
      icon: WifiOff,
      title: 'Modo Offline',
      description: 'Continue trabalhando mesmo sem internet',
    },
    {
      icon: Bell,
      title: 'Notificações Push',
      description: 'Receba alertas em tempo real',
    },
    {
      icon: Zap,
      title: 'Rápido e Responsivo',
      description: 'Performance otimizada para dispositivos móveis',
    },
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {features.map((feature, index) => (
        <Card key={index} className='text-center'>
          <CardContent className='p-6'>
            {React.createElement(feature.icon, { className: 'h-8 w-8 text-blue-600 mx-auto mb-3' })}
            <h3 className='font-semibold text-gray-900 mb-2'>{feature.title}</h3>
            <p className='text-sm text-gray-600'>{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
