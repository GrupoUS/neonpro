'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Building, MapPin, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação para configurações da clínica
const clinicSettingsSchema = z.object({
  clinic_name: z.string().min(2, 'Nome da clínica deve ter pelo menos 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  opening_hours: z.string().optional(),
})

type ClinicSettingsFormData = z.infer<typeof clinicSettingsSchema>

export function ClinicSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClinicSettingsFormData>({
    resolver: zodResolver(clinicSettingsSchema),
    defaultValues: {
      clinic_name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      opening_hours: '',
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setValue('clinic_name', data.clinic_name || '')
        setValue('address', data.address || '')
        setValue('phone', data.phone || '')
        setValue('email', data.email || '')
        setValue('website', data.website || '')
        setValue('description', data.description || '')
        setValue('opening_hours', data.opening_hours || '')
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    }
  }

  const onSubmit = async (data: ClinicSettingsFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const settingsData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      // Tentar atualizar primeiro
      const { error: updateError } = await supabase
        .from('clinic_settings')
        .update(settingsData)
        .eq('user_id', user.id)

      // Se não existir, criar novo
      if (updateError && updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('clinic_settings')
          .insert([{
            ...settingsData,
            created_at: new Date().toISOString(),
          }])

        if (insertError) throw insertError
      } else if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Configurações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Informações da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clinic_name">Nome da Clínica *</Label>
            <Input
              id="clinic_name"
              {...register('clinic_name')}
              placeholder="Ex: Clínica Estética Bella"
            />
            {errors.clinic_name && (
              <p className="text-sm text-red-600 mt-1">{errors.clinic_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Breve descrição sobre a clínica..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato e Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Contato e Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Rua, número, bairro, cidade, CEP"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contato@clinica.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://www.clinica.com"
            />
            {errors.website && (
              <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="opening_hours">Horários</Label>
            <Textarea
              id="opening_hours"
              {...register('opening_hours')}
              placeholder="Ex: Segunda a Sexta: 8h às 18h&#10;Sábado: 8h às 12h&#10;Domingo: Fechado"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descreva os horários de funcionamento da clínica
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
