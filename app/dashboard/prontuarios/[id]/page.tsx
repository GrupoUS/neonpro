import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { MedicalRecordDetails } from '@/components/dashboard/medical-records/medical-record-details'
import { MedicalRecordEvolutions } from '@/components/dashboard/medical-records/medical-record-evolutions'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, FileText, Camera, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProntuarioPageProps {
  params: {
    id: string
  }
}

export default async function ProntuarioPage({ params }: ProntuarioPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do prontuário
  const { data: medicalRecord, error } = await supabase
    .from('medical_records')
    .select(`
      *,
      clients (
        id,
        full_name,
        email,
        phone,
        birthdate
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !medicalRecord) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/prontuarios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Prontuário - {medicalRecord.clients?.full_name}
            </h1>
            <p className="text-muted-foreground">
              Prontuário eletrônico completo e evolução do tratamento
            </p>
          </div>
        </div>
        <Link href={`/dashboard/prontuarios/${params.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Anamnese
          </TabsTrigger>
          <TabsTrigger value="evolutions" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Evolução
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center">
            <Camera className="mr-2 h-4 w-4" />
            Fotos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Suspense fallback={<div>Carregando detalhes...</div>}>
            <MedicalRecordDetails medicalRecord={medicalRecord} />
          </Suspense>
        </TabsContent>

        <TabsContent value="evolutions" className="space-y-4">
          <Suspense fallback={<div>Carregando evolução...</div>}>
            <MedicalRecordEvolutions medicalRecordId={params.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <div className="text-center py-8">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Fotos do Tratamento
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Funcionalidade em desenvolvimento.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
