import type { RefreshCw } from "lucide-react";
import type { Suspense } from "react";
import type { ProfileSyncManager } from "@/components/profile/profile-sync-manager";
import type { Card, CardContent } from "@/components/ui/card";

function ProfileLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando gerenciador de perfil...</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Perfil</h1>
          <p className="text-gray-600">
            Configure suas informações pessoais e profissionais com sincronização Google.
          </p>
        </div>

        <Suspense fallback={<ProfileLoading />}>
          <ProfileSyncManager />
        </Suspense>
      </div>
    </div>
  );
}
