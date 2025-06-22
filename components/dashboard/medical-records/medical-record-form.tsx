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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, FileText, User, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Schema de validação conforme PRD
const medicalRecordSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  chief_complaint: z.string().min(10, 'Queixa principal deve ter pelo menos 10 caracteres'),
  history_present_illness: z.string().optional(),
  past_medical_history: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  social_history: z.string().optional(),
  family_history: z.string().optional(),
  physical_examination: z.string().optional(),
  assessment: z.string().optional(),
  treatment_plan: z.string().min(10, 'Plano de tratamento deve ter pelo menos 10 caracteres'),
  status: z.string().default('active'),
  notes: z.string().optional(),
})

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  birthdate: string | null
}

interface MedicalRecordFormProps {
  mode: 'create' | 'edit'
  clients: Client[]
  preselectedClient?: Client | null
  medicalRecord?: any
}

export function MedicalRecordForm({ 
  mode, 
  clients, 
  preselectedClient,
  medicalRecord 
}: MedicalRecordFormProps) {
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
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: medicalRecord ? {
      client_id: medicalRecord.client_id || '',
      chief_complaint: medicalRecord.chief_complaint || '',
      history_present_illness: medicalRecord.history_present_illness || '',
      past_medical_history: medicalRecord.past_medical_history || '',
      medications: medicalRecord.medications || '',
      allergies: medicalRecord.allergies || '',
      social_history: medicalRecord.social_history || '',
      family_history: medicalRecord.family_history || '',
      physical_examination: medicalRecord.physical_examination || '',
      assessment: medicalRecord.assessment || '',
      treatment_plan: medicalRecord.treatment_plan || '',
      status: medicalRecord.status || 'active',
      notes: medicalRecord.notes || '',
    } : {
      client_id: preselectedClient?.id || '',
      chief_complaint: '',
      history_present_illness: '',
      past_medical_history: '',
      medications: '',
      allergies: '',
      social_history: '',
      family_history: '',
      physical_examination: '',
      assessment: '',
      treatment_plan: '',
      status: 'active',
      notes: '',
    }
  })

  const onSubmit = async (data: MedicalRecordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const recordData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('medical_records')
          .insert([{
            ...recordData,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error

        router.push('/dashboard/prontuarios')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('medical_records')
          .update(recordData)
          .eq('id', medicalRecord.id)
          .eq('user_id', user.id)

        if (error) throw error

        router.push(`/dashboard/prontuarios/${medicalRecord.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar prontuário')
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
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Cliente *</Label>
              <Select
                value={watch('client_id')}
                onValueChange={(value) => setValue('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-sm text-red-600 mt-1">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status do Tratamento</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="chief_complaint">Queixa Principal *</Label>
            <Textarea
              id="chief_complaint"
              {...register('chief_complaint')}
              placeholder="Descreva a queixa principal do cliente..."
              rows={3}
            />
            {errors.chief_complaint && (
              <p className="text-sm text-red-600 mt-1">{errors.chief_complaint.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anamnese */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Anamnese
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="history_present_illness">História da Doença Atual</Label>
            <Textarea
              id="history_present_illness"
              {...register('history_present_illness')}
              placeholder="Descreva a evolução da condição atual..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="past_medical_history">Antecedentes Médicos</Label>
            <Textarea
              id="past_medical_history"
              {...register('past_medical_history')}
              placeholder="Histórico médico anterior, cirurgias, doenças..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medications">Medicamentos em Uso</Label>
              <Textarea
                id="medications"
                {...register('medications')}
                placeholder="Liste medicamentos atuais..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                {...register('allergies')}
                placeholder="Alergias conhecidas..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="social_history">História Social</Label>
              <Textarea
                id="social_history"
                {...register('social_history')}
                placeholder="Hábitos, estilo de vida..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="family_history">História Familiar</Label>
              <Textarea
                id="family_history"
                {...register('family_history')}
                placeholder="Histórico familiar relevante..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exame e Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Exame e Tratamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="physical_examination">Exame Físico</Label>
            <Textarea
              id="physical_examination"
              {...register('physical_examination')}
              placeholder="Achados do exame físico..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="assessment">Avaliação/Diagnóstico</Label>
            <Textarea
              id="assessment"
              {...register('assessment')}
              placeholder="Avaliação clínica e diagnóstico..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="treatment_plan">Plano de Tratamento *</Label>
            <Textarea
              id="treatment_plan"
              {...register('treatment_plan')}
              placeholder="Descreva o plano de tratamento proposto..."
              rows={4}
            />
            {errors.treatment_plan && (
              <p className="text-sm text-red-600 mt-1">{errors.treatment_plan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações Gerais</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações adicionais..."
              rows={3}
            />
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
          {mode === 'create' ? 'Criar Prontuário' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
