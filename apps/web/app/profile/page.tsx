import { RefreshCw } from 'lucide-react';
import { Suspense } from 'react';
import { ProfileSyncManager } from '@/components/profile/profile-sync-manager';
import { Card, CardContent } from '@/components/ui/card';

function ProfileLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
          <span>Carregando gerenciador de perfil...</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-gray-900">
            Gerenciar Perfil
          </h1>
          <p className="text-gray-600">
            Configure suas informações pessoais e profissionais com
            sincronização Google.
          </p>
        </div>

        <Suspense fallback={<ProfileLoading />}>
          <ProfileSyncManager />
        </Suspense>
      </div>
    </div>
  );
}
