import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { usePWA } from '@/hooks/usePWA';
import {
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useState } from 'react';

export interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const {
    isOnline,
    isInstallable,
    isInstalled,
    installPWA,
    hasOfflineData,
    syncOfflineData,
    isSyncing,
    syncFailed,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [showSyncStatus, setShowSyncStatus] = React.useState(false);

  React.useEffect(() => {
    // Show install prompt if installable and not installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => setShowInstallPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isInstallable, isInstalled]);

  React.useEffect(() => {
    // Show sync status when offline or has offline data
    if (!isOnline || hasOfflineData) {
      setShowSyncStatus(true);
      return undefined;
    } else {
      const timer = setTimeout(() => setShowSyncStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasOfflineData]);

  const handleInstall = async () => {
    const outcome = await installPWA();
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
  };

  const handleSync = async () => {
    await syncOfflineData();
    setTimeout(() => setShowSyncStatus(false), 3000);
  };

  if (!showInstallPrompt && !showSyncStatus) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className='shadow-lg border border-gray-200'>
        <CardContent className='p-4'>
          {/* Install Prompt */}
          {showInstallPrompt && (
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <Smartphone className='h-5 w-5 text-blue-600' />
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Instalar NeonPro no seu dispositivo
                  </h4>
                  <p className='text-xs text-gray-500 mt-1'>
                    Acesse rapidamente e trabalhe offline
                  </p>
                </div>
                <Button
                  size='sm'
                  onClick={handleInstall}
                  className='ml-2'
                >
                  <Download className='h-4 w-4 mr-1' />
                  Instalar
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowInstallPrompt(false)}
                  className='ml-1'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {/* Sync Status */}
          {showSyncStatus && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  {isOnline
                    ? <Wifi className='h-4 w-4 text-green-500' />
                    : <WifiOff className='h-4 w-4 text-red-500' />}
                  <span className='text-sm font-medium text-gray-900'>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {hasOfflineData && (
                  <Badge variant={syncFailed ? 'destructive' : 'secondary'}>
                    {hasOfflineData} pendente(s)
                  </Badge>
                )}
              </div>

              {hasOfflineData && (
                <div className='flex items-center justify-between'>
                  <p className='text-xs text-gray-500'>
                    {isOnline
                      ? 'Dados aguardando sincronização'
                      : 'Modo offline - dados salvos localmente'}
                  </p>
                  {isOnline && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleSync}
                      disabled={isSyncing}
                      className='ml-2'
                    >
                      {isSyncing
                        ? <RefreshCw className='h-4 w-4 animate-spin' />
                        : <RefreshCw className='h-4 w-4' />}
                      Sincronizar
                    </Button>
                  )}
                </div>
              )}

              {syncFailed && (
                <div className='flex items-center space-x-2 p-2 bg-red-50 rounded-lg'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <p className='text-xs text-red-800'>
                    Falha na sincronização. Tente novamente.
                  </p>
                </div>
              )}

              {isInstalled && (
                <div className='flex items-center space-x-2 p-2 bg-green-50 rounded-lg'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <p className='text-xs text-green-800'>
                    NeonPro instalado no seu dispositivo
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
