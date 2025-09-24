import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  AlertTriangle,
  Calendar,
  Clock,
  DoorOpen,
  Package,
  // Users,
  Shield,
} from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/aesthetic-scheduling/')({
  component: AestheticSchedulingLayout,
})

function AestheticSchedulingLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Agendamento Estético Avançado
          </h1>
          <p className='text-gray-600'>
            Sistema completo de agendamento e gestão de procedimentos estéticos
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue='multi-session' className='w-full'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='multi-session' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span className='hidden sm:inline'>Multi-Sessão</span>
            </TabsTrigger>
            <TabsTrigger value='packages' className='flex items-center gap-2'>
              <Package className='h-4 w-4' />
              <span className='hidden sm:inline'>Pacotes</span>
            </TabsTrigger>
            <TabsTrigger value='certification' className='flex items-center gap-2'>
              <Shield className='h-4 w-4' />
              <span className='hidden sm:inline'>Certificações</span>
            </TabsTrigger>
            <TabsTrigger value='recovery' className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span className='hidden sm:inline'>Recuperação</span>
            </TabsTrigger>
            <TabsTrigger value='rooms' className='flex items-center gap-2'>
              <DoorOpen className='h-4 w-4' />
              <span className='hidden sm:inline'>Salas</span>
            </TabsTrigger>
            <TabsTrigger value='contraindications' className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' />
              <span className='hidden sm:inline'>Contraind.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='multi-session' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Agendamento Multi-Sessão
                </CardTitle>
                <CardDescription>
                  Agende múltiplas sessões de tratamento em um único processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='packages' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Pacotes de Tratamento
                </CardTitle>
                <CardDescription>
                  Gerencie e agende pacotes de procedimentos combinados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='certification' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Validação de Certificações
                </CardTitle>
                <CardDescription>
                  Verifique certificações profissionais para procedimentos específicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='recovery' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Planejamento de Recuperação
                </CardTitle>
                <CardDescription>
                  Crie planos personalizados de recuperação pós-procedimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Outlet />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='rooms' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DoorOpen className='h-5 w-5' />
                  Alocação de Salas
                </CardTitle>
                <CardDescription>
                  Gerencie e otimize a alocação de salas e equipamentos
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
                  Verificação de Contraindicações
                </CardTitle>
                <CardDescription>
                  Avalie contraindicações antes de procedimentos estéticos
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
