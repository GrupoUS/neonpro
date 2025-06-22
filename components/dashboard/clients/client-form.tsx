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
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação conforme PRD
const clientSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional().or(z.literal('')),
  birthdate: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
  consent_marketing: z.boolean().default(false),
  preferred_language: z.string().default('pt-BR'),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  mode: 'create' | 'edit'
  client?: any
}

export function ClientForm({ mode, client }: ClientFormProps) {
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
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      full_name: client.full_name || '',
      email: client.email || '',
      phone: client.phone || '',
      birthdate: client.birthdate || '',
      allergies: client.allergies || '',
      medical_conditions: client.medical_conditions || '',
      emergency_contact_name: client.emergency_contact_name || '',
      emergency_contact_phone: client.emergency_contact_phone || '',
      notes: client.notes || '',
      consent_marketing: client.consent_marketing || false,
      preferred_language: client.preferred_language || 'pt-BR',
    } : {
      consent_marketing: false,
      preferred_language: 'pt-BR',
    }
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const clientData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('clients')
          .insert([{
            ...clientData,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error

        router.push('/dashboard/clientes')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id)
          .eq('user_id', user.id)

        if (error) throw error

        router.push(`/dashboard/clientes/${client.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente')
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

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Digite o nome completo"
            />
            {errors.full_name && (
              <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="birthdate">Data de Nascimento</Label>
            <Input
              id="birthdate"
              type="date"
              {...register('birthdate')}
            />
          </div>

          <div>
            <Label htmlFor="preferred_language">Idioma Preferido</Label>
            <Select
              value={watch('preferred_language')}
              onValueChange={(value) => setValue('preferred_language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informações Médicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Médicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              {...register('allergies')}
              placeholder="Descreva alergias conhecidas..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="medical_conditions">Condições Médicas</Label>
            <Textarea
              id="medical_conditions"
              {...register('medical_conditions')}
              placeholder="Descreva condições médicas relevantes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Nome</Label>
              <Input
                id="emergency_contact_name"
                {...register('emergency_contact_name')}
                placeholder="Nome do contato"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Telefone</Label>
              <Input
                id="emergency_contact_phone"
                {...register('emergency_contact_phone')}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações e Preferências */}
      <Card>
        <CardHeader>
          <CardTitle>Observações e Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações gerais sobre o cliente..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent_marketing"
              checked={watch('consent_marketing')}
              onCheckedChange={(checked) => setValue('consent_marketing', !!checked)}
            />
            <Label htmlFor="consent_marketing">
              Aceita receber comunicações de marketing
            </Label>
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
          {mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
