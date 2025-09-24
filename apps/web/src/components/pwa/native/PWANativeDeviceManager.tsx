import {
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  Contact,
  Image,
  MapPin,
  MessageSquare,
  Mic,
  Phone,
  Video,
} from 'lucide-react';
import * as React from 'react';

interface NativeDeviceCapability {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  description: string;
  aestheticUse: string;
}

interface PWANativeDeviceManagerProps {
  className?: string;
  onCapabilityChange?: (capabilityId: string, status: boolean) => void;
}

export const PWANativeDeviceManager: React.FC<PWANativeDeviceManagerProps> = ({
  className,
  onCapabilityChange,
}) => {
  const [capabilities, setCapabilities] = React.useState<NativeDeviceCapability[]>([
    {
      id: 'camera',
      name: 'Câmera',
      icon: Camera,
      available: false,
      permission: 'prompt',
      description: 'Acesso à câmera do dispositivo',
      aestheticUse: 'Registrar procedimentos, tirar fotos antes/depois',
    },
    {
      id: 'contacts',
      name: 'Contatos',
      icon: Contact,
      available: false,
      permission: 'prompt',
      description: 'Acesso à lista de contatos',
      aestheticUse: 'Importar contatos de pacientes e profissionais',
    },
    {
      id: 'calendar',
      name: 'Calendário',
      icon: Calendar,
      available: false,
      permission: 'prompt',
      description: 'Sincronização com calendário do dispositivo',
      aestheticUse: 'Integrar agendamentos com calendário pessoal',
    },
    {
      id: 'microphone',
      name: 'Microfone',
      icon: Mic,
      available: false,
      permission: 'prompt',
      description: 'Gravação de áudio',
      aestheticUse: 'Notas de voz, transcrição de consultas',
    },
    {
      id: 'location',
      name: 'Localização',
      icon: MapPin,
      available: false,
      permission: 'prompt',
      description: 'Acesso à localização do dispositivo',
      aestheticUse: 'Check-in de pacientes, rotas para clínica',
    },
    {
      id: 'phone',
      name: 'Telefone',
      icon: Phone,
      available: false,
      permission: 'prompt',
      description: 'Acesso a funcionalidades de telefone',
      aestheticUse: 'Chamadas diretas para pacientes e profissionais',
    },
    {
      id: 'notifications',
      name: 'Notificações',
      icon: MessageSquare,
      available: false,
      permission: 'prompt',
      description: 'Notificações push do sistema',
      aestheticUse: 'Lembretes de agendamentos, confirmações',
    },
  ]);

  const [selectedCapability, setSelectedCapability] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  const checkDeviceCapabilities = async () => {
    const updatedCapabilities = await Promise.all(
      capabilities.map(async capability => {
        let available = false;
        let permission: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'unsupported';

        switch (capability.id) {
          case 'camera':
            available = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
            if (available) {
              try {
                const result = await navigator.permissions.query({
                  name: 'camera' as PermissionName,
                });
                permission = result.state as 'granted' | 'denied' | 'prompt';
              } catch {
                permission = 'prompt';
              }
            }
            break;

          case 'contacts':
            available = 'contacts' in navigator;
            if (available) {
              try {
                const result = await navigator.permissions.query({
                  name: 'contacts' as PermissionName,
                });
                permission = result.state as 'granted' | 'denied' | 'prompt';
              } catch {
                permission = 'prompt';
              }
            }
            break;

          case 'calendar':
            available = 'calendar' in navigator;
            if (available) {
              try {
                const result = await navigator.permissions.query({
                  name: 'calendar' as PermissionName,
                });
                permission = result.state as 'granted' | 'denied' | 'prompt';
              } catch {
                permission = 'prompt';
              }
            }
            break;

          case 'microphone':
            available = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
            if (available) {
              try {
                const result = await navigator.permissions.query({
                  name: 'microphone' as PermissionName,
                });
                permission = result.state as 'granted' | 'denied' | 'prompt';
              } catch {
                permission = 'prompt';
              }
            }
            break;

          case 'location':
            available = 'geolocation' in navigator;
            if (available) {
              try {
                const result = await navigator.permissions.query({
                  name: 'geolocation' as PermissionName,
                });
                permission = result.state as 'granted' | 'denied' | 'prompt';
              } catch {
                permission = 'prompt';
              }
            }
            break;

          case 'phone':
            available = false; // PWA phone access is limited
            break;

          case 'notifications':
            available = 'Notification' in window;
            permission = Notification.permission as 'granted' | 'denied' | 'prompt';
            break;
        }

        return { ...capability, available, permission };
      }),
    );

    setCapabilities(updatedCapabilities);
  };

  const requestPermission = async (capabilityId: string) => {
    const capability = capabilities.find(c => c.id === capabilityId);
    if (!capability || !capability.available) return;

    setIsProcessing(true);
    setSelectedCapability(capabilityId);

    try {
      let granted = false;

      switch (capabilityId) {
        case 'camera':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          } catch {
            granted = false;
          }
          break;

        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          } catch {
            granted = false;
          }
          break;

        case 'contacts':
          try {
            // @ts-ignore - Contacts API is experimental
            const contacts = await navigator.contacts.select(['name', 'email', 'tel'], {
              multiple: false,
            });
            granted = contacts.length > 0;
          } catch {
            granted = false;
          }
          break;

        case 'calendar':
          try {
            // @ts-ignore - Calendar API is experimental
            const calendars = await navigator.calendars.get();
            granted = calendars.length > 0;
          } catch {
            granted = false;
          }
          break;

        case 'location':
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            granted = !!position;
          } catch {
            granted = false;
          }
          break;

        case 'notifications':
          const permission = await Notification.requestPermission();
          granted = permission === 'granted';
          break;
      }

      // Update capability status
      setCapabilities(prev =>
        prev.map(cap =>
          cap.id === capabilityId
            ? { ...cap, permission: granted ? 'granted' : 'denied' }
            : cap
        )
      );

      onCapabilityChange?.(capabilityId, granted);
    } catch (error) {
      console.error(`Error requesting ${capabilityId} permission:`, error);
    } finally {
      setIsProcessing(false);
      setSelectedCapability(null);
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'granted':
        return 'text-green-600 bg-green-100';
      case 'denied':
        return 'text-red-600 bg-red-100';
      case 'prompt':
        return 'text-yellow-600 bg-yellow-100';
      case 'unsupported':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPermissionText = (permission: string) => {
    switch (permission) {
      case 'granted':
        return 'Concedido';
      case 'denied':
        return 'Negado';
      case 'prompt':
        return 'Solicitar';
      case 'unsupported':
        return 'Não suportado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className='flex items-center mb-6'>
        <div className='flex-shrink-0'>
          <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <AlertTriangle className='h-5 w-5 text-white' />
          </div>
        </div>
        <div className='ml-3'>
          <h3 className='text-lg font-medium text-gray-900'>
            Recursos do Dispositivo
          </h3>
          <p className='text-sm text-gray-500'>
            Gerencie permissões para funcionalidades avançadas da clínica
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {capabilities.map(capability => {
          const Icon = capability.icon;
          return (
            <div
              key={capability.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                capability.available
                  ? 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                  : 'border-gray-100 bg-gray-50 opacity-50'
              }`}
              onClick={() =>
                capability.available && capability.permission === 'prompt' && !isProcessing
                && requestPermission(capability.id)}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3'>
                  <div
                    className={`flex-shrink-0 ${
                      capability.available ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium text-gray-900 truncate'>
                      {capability.name}
                    </h4>
                    <p className='text-xs text-gray-500 mt-1'>
                      {capability.description}
                    </p>
                    <p className='text-xs text-blue-600 mt-1'>
                      {capability.aestheticUse}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {capability.permission === 'granted' && (
                    <Check className='h-4 w-4 text-green-600' />
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getPermissionColor(capability.permission)
                    }`}
                  >
                    {getPermissionText(capability.permission)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isProcessing && selectedCapability && (
        <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='flex items-center'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'>
            </div>
            <span className='text-sm text-blue-800'>
              Solicitando permissão para {capabilities.find(c =>
                c.id === selectedCapability
              )?.name}...
            </span>
          </div>
        </div>
      )}

      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <h4 className='text-sm font-medium text-gray-900 mb-2'>
          Privacidade e Segurança
        </h4>
        <ul className='text-xs text-gray-600 space-y-1'>
          <li>• Todas as permissões são opcionais e podem ser revogadas a qualquer momento</li>
          <li>• Dados sensíveis são criptografados e armazenados conforme LGPD</li>
          <li>• Recursos são usados apenas para melhorar a experiência clínica</li>
          <li>• Nenhum dado é compartilhado com terceiros sem consentimento</li>
        </ul>
      </div>
    </div>
  );
};
