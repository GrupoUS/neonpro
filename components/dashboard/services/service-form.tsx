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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Settings, Clock, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação para serviços
const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  duration_minutes: z.number().min(5, 'Duração mínima de 5 minutos').max(480, 'Duração máxima de 8 horas'),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  is_active: z.boolean().default(true),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  mode: 'create' | 'edit'
  service?: any
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
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
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      name: service.name || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes || 60,
      price: service.price || 0,
      category: service.category || '',
      is_active: service.is_active ?? true,
    } : {
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      category: '',
      is_active: true,
    }
  })

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const serviceData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('services')
          .insert([{
            ...serviceData,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error

        router.push('/dashboard/servicos')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id)
          .eq('user_id', user.id)

        if (error) throw error

        router.push(`/dashboard/servicos/${service.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar serviço')
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { value: 'facial', label: 'Facial' },
    { value: 'corporal', label: 'Corporal' },
    { value: 'estetica', label: 'Estética' },
    { value: 'massagem', label: 'Massagem' },
    { value: 'depilacao', label: 'Depilação' },
    { value: 'outros', label: 'Outros' },
  ]

  const durationPresets = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Limpeza de Pele"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o serviço oferecido..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', !!checked)}
              />
              <Label htmlFor="is_active">
                Serviço ativo
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duração e Preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Duração e Preço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
            <div className="flex gap-2">
              <Input
                id="duration_minutes"
                type="number"
                min="5"
                max="480"
                {...register('duration_minutes', { valueAsNumber: true })}
                placeholder="60"
                className="flex-1"
              />
              <Select
                onValueChange={(value) => setValue('duration_minutes', parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Presets" />
                </SelectTrigger>
                <SelectContent>
                  {durationPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value.toString()}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.duration_minutes && (
              <p className="text-sm text-red-600 mt-1">{errors.duration_minutes.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Preço (R$) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
            )}
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
          {mode === 'create' ? 'Criar Serviço' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
