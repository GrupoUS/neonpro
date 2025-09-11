/**
 * 404 Not Found Error Page
 * 
 * User-friendly 404 page with navigation options and healthcare-appropriate messaging
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search, Phone } from 'lucide-react';
import { Link, useRouter } from '@tanstack/react-router';

export function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: '/' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Search className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Página Não Encontrada
          </CardTitle>
          <CardDescription className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 mb-6">
            <p>Código do erro: 404</p>
            <p>Isso pode acontecer se:</p>
            <ul className="mt-2 text-left space-y-1 ml-4">
              <li>• O link está incorreto ou desatualizado</li>
              <li>• A página foi removida ou renomeada</li>
              <li>• Você não tem permissão para acessar esta área</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleGoBack}
              variant="default" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Ir para Início
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Precisa de ajuda?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => window.location.href = 'mailto:suporte@neonpro.com.br'}
            >
              <Phone className="mr-2 h-3 w-3" />
              Entrar em Contato
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFoundPage;
