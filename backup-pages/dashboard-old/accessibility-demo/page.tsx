'use client'

import {
    AccessibleButton,
    AccessibleDialog,
    AccessibleInput,
    AccessibleSelect,
    LiveRegion,
    SkipLink
} from '@/components/ui/accessible'
import { AccessibilityProvider } from '@/contexts/accessibility-context'
import { LocalizationProvider, useAccessibilityTranslations, useFormTranslations } from '@/lib/localization'
import React from 'react'

// Example usage of accessible components in a healthcare form
function PatientRegistrationForm() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    gender: ''
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')

  const a11y = useAccessibilityTranslations()
  const form = useFormTranslations()

  const genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'O', label: 'Outro' },
    { value: 'N', label: 'Prefiro não informar' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = form.fieldRequired('Nome')
    }
    
    if (!formData.email.trim()) {
      newErrors.email = form.fieldRequired('E-mail')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Digite um e-mail válido'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = form.fieldRequired('Telefone')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitMessage(form.pleaseCorrectErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitMessage('Paciente cadastrado com sucesso!')
      setFormData({ name: '', email: '', phone: '', gender: '' })
      setErrors({})
    } catch (error) {
      setSubmitMessage('Erro ao cadastrar paciente. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Skip navigation link */}
      <SkipLink href="#main-content">
        Ir para formulário de cadastro
      </SkipLink>

      <header>
        <h1 id="page-title" className="text-2xl font-bold mb-6">
          Cadastro de Paciente
        </h1>
      </header>

      <main id="main-content">
        <form onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className="text-lg font-semibold mb-4">
              Dados Pessoais
            </legend>

            <AccessibleInput
              label="Nome completo"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
              description="Digite o nome completo do paciente"
            />

            <AccessibleInput
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              description="E-mail será usado para comunicação com o paciente"
            />

            <AccessibleInput
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
              description="Telefone para contato em caso de emergência"
            />

            <AccessibleSelect
              label="Gênero"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={genderOptions}
              placeholder="Selecione o gênero"
              description="Informação opcional para melhor atendimento"
            />
          </fieldset>

          <div className="flex gap-4 mt-6">
            <AccessibleButton
              type="submit"
              loading={isSubmitting}
              loadingText={form.saving}
              aria-describedby="submit-description"
            >
              {form.submit}
            </AccessibleButton>

            <AccessibleButton
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              aria-label={a11y.openDialog('ajuda')}
            >
              Ajuda
            </AccessibleButton>
          </div>

          <p id="submit-description" className="text-sm text-muted-foreground mt-2">
            Clique em {form.submit} para cadastrar o paciente no sistema
          </p>

          {/* Live region for status messages */}
          {submitMessage && (
            <LiveRegion politeness="assertive">
              {submitMessage}
            </LiveRegion>
          )}
        </form>

        {/* Accessible dialog example */}
        <AccessibleDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Ajuda - Cadastro de Paciente"
          description="Informações sobre como preencher o formulário de cadastro"
        >
          <div className="space-y-4">
            <section>
              <h3 className="font-medium mb-2">Nome completo</h3>
              <p className="text-sm text-muted-foreground">
                Digite o nome completo do paciente conforme documento de identidade.
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-2">E-mail</h3>
              <p className="text-sm text-muted-foreground">
                E-mail válido será usado para envio de lembretes de consultas e resultados de exames.
              </p>
            </section>

            <section>
              <h3 className="font-medium mb-2">Telefone</h3>
              <p className="text-sm text-muted-foreground">
                Número de telefone com DDD para contato direto com o paciente.
              </p>
            </section>

            <div className="flex justify-end mt-6">
              <AccessibleButton
                onClick={() => setIsDialogOpen(false)}
                aria-label={a11y.closeDialog}
              >
                Entendi
              </AccessibleButton>
            </div>
          </div>
        </AccessibleDialog>
      </main>
    </div>
  )
}

// Main component with providers
export default function AccessibilityDemo() {
  return (
    <LocalizationProvider locale="pt-BR">
      <AccessibilityProvider>
        <div className="min-h-screen bg-background">
          <PatientRegistrationForm />
        </div>
      </AccessibilityProvider>
    </LocalizationProvider>
  )
}
