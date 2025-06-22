'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, User, Mail, Phone, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação para profissionais
const professionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  specialties: z.string().min(1, 'Pelo menos uma especialidade é obrigatória'),
  commission_rate: z.number().min(0, 'Comissão deve ser maior ou igual a 0').max(100, 'Comissão não pode ser maior que 100%'),
  bio: z.string().optional(),
  work_schedule: z.string().optional(),
  is_active: z.boolean().default(true),
})

type ProfessionalFormData = z.infer<typeof professionalSchema>

interface ProfessionalFormProps {
  mode: 'create' | 'edit'
  professional?: any
}

export function ProfessionalForm({ mode, professional }: ProfessionalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: professional ? {
      name: professional.name || '',
      email: professional.email || '',
      phone: professional.phone || '',
      specialties: professional.specialties || '',
      commission_rate: professional.commission_rate || 0,
      bio: professional.bio || '',
      work_schedule: professional.work_schedule || '',
      is_active: professional.is_active ?? true,
    } : {
      name: '',
      email: '',
      phone: '',
      specialties: '',
      commission_rate: 0,
      bio: '',
      work_schedule: '',
      is_active: true,
    }
  })

  const onSubmit = async (data: ProfessionalFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const professionalData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('professionals')
          .insert([{
            ...professionalData,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error

        router.push('/dashboard/profissionais')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', professional.id)
          .eq('user_id', user.id)

        if (error) throw error

        router.push(`/dashboard/profissionais/${professional.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar profissional')
    } finally {
      setIsLoading(false)
    }
  }

  const specialtyPresets = [
    'Esteticista',
    'Massoterapeuta',
    'Dermatologista',
    'Fisioterapeuta',
    'Podólogo',
    'Manicure',
    'Depiladora',
    'Maquiador'
  ]

  const addSpecialty = (specialty: string) => {
    const current = watch('specialties')
    const specialties = current ? current.split(',').map(s => s.trim()) : []
    if (!specialties.includes(specialty)) {
      specialties.push(specialty)
      setValue('specialties', specialties.join(', '))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Maria Silva"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="maria@exemplo.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

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
          </div>

          <div>
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Breve descrição sobre o profissional..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', !!checked)}
            />
            <Label htmlFor="is_active">
              Profissional ativo
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Especialidades e Comissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Especialidades e Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specialties">Especialidades *</Label>
            <Textarea
              id="specialties"
              {...register('specialties')}
              placeholder="Ex: Esteticista, Massoterapeuta"
              rows={2}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {specialtyPresets.map((specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSpecialty(specialty)}
                >
                  + {specialty}
                </Button>
              ))}
            </div>
            {errors.specialties && (
              <p className="text-sm text-red-600 mt-1">{errors.specialties.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register('commission_rate', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.commission_rate && (
              <p className="text-sm text-red-600 mt-1">{errors.commission_rate.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horário de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Horário de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="work_schedule">Horários</Label>
            <Textarea
              id="work_schedule"
              {...register('work_schedule')}
              placeholder="Ex: Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descreva os horários de trabalho do profissional
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Criar Profissional' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
