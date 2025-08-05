"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
var profile_sync_manager_1 = require("@/components/profile/profile-sync-manager");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function ProfileLoading() {
  return (
    <card_1.Card>
      <card_1.CardContent className="p-6">
        <div className="flex items-center justify-center">
          <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando gerenciador de perfil...</span>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Perfil</h1>
          <p className="text-gray-600">
            Configure suas informações pessoais e profissionais com sincronização Google.
          </p>
        </div>

        <react_1.Suspense fallback={<ProfileLoading />}>
          <profile_sync_manager_1.ProfileSyncManager />
        </react_1.Suspense>
      </div>
    </div>
  );
}
