import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClinicSettings } from '@/components/dashboard/settings/clinic-settings'
import { NotificationSettings } from '@/components/dashboard/settings/notification-settings'
import { AppointmentSettings } from '@/components/dashboard/settings/appointment-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Building, Bell, Calendar, Palette } from 'lucide-react'

// Skeleton para loading
function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

export default async function ConfiguracoesPage() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua clínica e preferências do sistema
        </p>
      </div>

      {/* Tabs para diferentes configurações */}
      <Tabs defaultValue="clinic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clinic" className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <ClinicSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <AppointmentSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <NotificationSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="text-center py-8">
            <Palette className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Configurações de Aparência
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
