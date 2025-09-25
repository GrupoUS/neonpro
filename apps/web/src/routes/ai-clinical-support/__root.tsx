import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  // Brain,
  UserCheck,
  // Heart,
  // FileText
} from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/ai-clinical-support/__root')({
  component: AIClinicalSupportLayout,
})

function AIClinicalSupportLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Suporte Clínico com IA
          </h1>
          <p className='text-gray-600'>
            Sistema avançado de apoio à decisão clínica para tratamentos estéticos
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue='assessment' className='w-full'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='assessment' className='flex items-center gap-2'>
              <UserCheck className='h-4 w-4' />
              <span className='hidden sm:inline'>Avaliação</span>
            </TabsTrigger>
            <TabsTrigger value='recommendations' className='flex items-center gap-2'>
              <Target className='h-4 w-4' />
              <span className='hidden sm:inline'>Recomendações</span>
            </TabsTrigger>
            <TabsTrigger value='contraindications' className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' />
              <span className='hidden sm:inline'>Contraind.</span>
            </TabsTrigger>
            <TabsTrigger value='predictions' className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              <span className='hidden sm:inline'>Predições</span>
            </TabsTrigger>
            <TabsTrigger value='monitoring' className='flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              <span className='hidden sm:inline'>Monitor.</span>
            </TabsTrigger>
            <TabsTrigger value='guidelines' className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4' />
              <span className='hidden sm:inline'>Diretrizes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='assessment' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserCheck className='h-5 w-5' />
                  Avaliação do Paciente
                </CardTitle>
                <CardDescription>
                  Avaliação completa do paciente para recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='recommendations' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Recomendações de Tratamento
                </CardTitle>
                <CardDescription>
                  Recomendações baseadas em IA e evidências científicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='contraindications' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5' />
                  Análise de Contraindicações
                </CardTitle>
                <CardDescription>
                  Avaliação completa de contraindicações e riscos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='predictions' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Predição de Resultados
                </CardTitle>
                <CardDescription>
                  Análise preditiva de resultados do tratamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='monitoring' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Monitoramento de Progresso
                </CardTitle>
                <CardDescription>
                  Acompanhamento em tempo real do progresso do tratamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='guidelines' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5' />
                  Diretrizes de Tratamento
                </CardTitle>
                <CardDescription>
                  Acesso a diretrizes baseadas em evidências científicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
