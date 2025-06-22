import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProfessionalDetails } from '@/components/dashboard/professionals/professional-details'
import { ProfessionalSchedule } from '@/components/dashboard/professionals/professional-schedule'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, User, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProfissionalPageProps {
  params: {
    id: string
  }
}

export default async function ProfissionalPage({ params }: ProfissionalPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do profissional
  const { data: professional, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !professional) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/profissionais">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{professional.name}</h1>
            <p className="text-muted-foreground">
              Perfil do profissional e informações da equipe
            </p>
          </div>
        </div>
        <Link href={`/dashboard/profissionais/${params.id}/editar`}>
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
            <User className="mr-2 h-4 w-4" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Suspense fallback={<div>Carregando detalhes...</div>}>
            <ProfessionalDetails professional={professional} />
          </Suspense>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Suspense fallback={<div>Carregando horários...</div>}>
            <ProfessionalSchedule professionalId={params.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Performance do Profissional
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
