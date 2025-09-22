'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  Check,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Info,
  Mail,
  Settings,
  Share,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Switch,
} from '@neonpro/ui';
import { cn } from '@neonpro/utils';

// LGPD consent types following Brazilian data protection law
interface ConsentRecord {
  id: string;
  patientId: string;
  consentType:
    | 'data_processing'
    | 'marketing'
    | 'third_party_sharing'
    | 'research'
    | 'telehealth';
  granted: boolean;
  purpose: string;
  dataCategories: string[];
  retentionPeriod: string;
  grantedAt?: Date;
  revokedAt?: Date;
  lastUpdated: Date;
  legalBasis:
    | 'consent'
    | 'legitimate_interest'
    | 'legal_obligation'
    | 'vital_interests';
  processingDetails?: string;
}

interface PatientConsentData {
  patientId: string;
  patientName: string;
  consents: ConsentRecord[];
  lastConsentUpdate: Date;
  dataExportRequested?: Date;
  dataErasureRequested?: Date;
}

// Zod schema for consent form validation
const consentFormSchema = z.object({
  dataProcessing: z.boolean(),
  dataProcessingPurpose: z.string().optional(),
  marketing: z.boolean(),
  marketingChannels: z.array(z.string()).optional(),
  thirdPartySharing: z.boolean(),
  thirdPartyPartners: z.array(z.string()).optional(),
  research: z.boolean(),
  researchTypes: z.array(z.string()).optional(),
  telehealth: z.boolean(),
  telehealthServices: z.array(z.string()).optional(),
  withdrawalReason: z.string().optional(),
});

type ConsentFormData = z.infer<typeof consentFormSchema>;

interface ConsentManagementDialogProps {
  patientData: PatientConsentData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConsentUpdate: (consents: Partial<ConsentFormData>) => Promise<void>;
  onDataExport: (patientId: string) => Promise<void>;
  onDataErasure: (patientId: string) => Promise<void>;
  userRole: 'admin' | 'aesthetician' | 'coordinator';
  className?: string;
}

// Brazilian consent purposes for aesthetic clinics
const CONSENT_PURPOSES = {
  data_processing: {
    title: 'Processamento de Dados Pessoais',
    description:
      'Coleta, armazenamento e processamento de dados pessoais para prestação de serviços estéticos',
    icon: Database,
    required: true,
  },
  marketing: {
    title: 'Marketing e Comunicação',
    description: 'Envio de materiais promocionais, novidades sobre tratamentos e ofertas especiais',
    icon: Mail,
    required: false,
  },
  third_party_sharing: {
    title: 'Compartilhamento com Terceiros',
    description:
      'Compartilhamento de dados com parceiros, laboratórios e fornecedores de equipamentos',
    icon: Share,
    required: false,
  },
  research: {
    title: 'Pesquisa e Desenvolvimento',
    description:
      'Uso de dados anonimizados para pesquisas científicas e desenvolvimento de novos tratamentos',
    icon: FileText,
    required: false,
  },
  telehealth: {
    title: 'Telemedicina',
    description:
      'Consultas online, monitoramento remoto e acompanhamento de tratamentos à distância',
    icon: Settings,
    required: false,
  },
};

// LGPD rights component
const LGPDRightsInfo = () => (
  <Alert className='mb-4'>
    <Info className='h-4 w-4' />
    <AlertDescription>
      <strong>Seus direitos sob a LGPD:</strong>
      <ul className='list-disc list-inside mt-2 space-y-1 text-sm'>
        <li>Confirmação da existência de tratamento de dados</li>
        <li>Acesso aos dados pessoais</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados</li>
        <li>Anonimização, bloqueio ou eliminação de dados</li>
        <li>Portabilidade dos dados</li>
        <li>Eliminação dos dados tratados com consentimento</li>
        <li>Revogação do consentimento</li>
      </ul>
    </AlertDescription>
  </Alert>
);

// Consent status indicator
const ConsentStatusBadge = ({
  granted,lastUpdated,
}: {
  granted: boolean;
  lastUpdated: Date;
}) => (
  <div className='flex items-center gap-2'>
    <Badge
      variant={granted ? 'default' : 'secondary'}
      className={cn(
        granted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
      )}
    >
      {granted
        ? (
          <>
            <Check className='h-3 w-3 mr-1' />
            Concedido
          </>
        )
        : (
          <>
            <X className='h-3 w-3 mr-1' />
            Negado
          </>
        )}
    </Badge>
    <span className='text-xs text-muted-foreground'>
      {format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
    </span>
  </div>
);

export function ConsentManagementDialog({
  patientData,
  isOpen,
  onOpenChange,
  onConsentUpdate,
  onDataExport,
  onDataErasure,
  userRole: userRole,
  className,
}: ConsentManagementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'consents' | 'rights' | 'history'>(
    'consents',
  );

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: {
      dataProcessing: false,
      marketing: false,
      thirdPartySharing: false,
      research: false,
      telehealth: false,
    },
  });

  // Load current consent status
  useEffect(() => {
    if (patientData.consents) {
      const currentConsents = patientData.consents.reduce((acc, consent) => {
          acc[consent.consentType.replace('_', '')] = consent.granted;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      form.reset(currentConsents as ConsentFormData);
    }
  }, [patientData.consents, form]);

  const handleConsentSubmit = async (_data: any) => {
    setIsLoading(true);
    try {
      await onConsentUpdate(data);
      onOpenChange(false);
    } catch (_error) {
      console.error('Erro ao atualizar consentimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      await onDataExport(patientData.patientId);
    } catch (_error) {
      console.error('Erro ao exportar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataErasure = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja solicitar a exclusão dos dados? Esta ação não pode ser desfeita.',
      )
    ) {
      setIsLoading(true);
      try {
        await onDataErasure(patientData.patientId);
      } catch (_error) {
        console.error('Erro ao solicitar exclusão:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getConsentByType = (type: string) => patientData.consents.find(c => c.consentType === type);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', className)}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-blue-600' />
            Gerenciamento de Consentimento LGPD
          </DialogTitle>
          <DialogDescription>
            Gerenciar consentimentos e exercer direitos de proteção de dados para{' '}
            <strong>{patientData.patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Tab navigation */}
        <div className='flex space-x-1 bg-muted p-1 rounded-lg'>
          {[
            { id: 'consents', label: 'Consentimentos', icon: Check },
            { id: 'rights', label: 'Direitos', icon: Eye },
            { id: 'history', label: 'Histórico', icon: Clock },
          ].map(({ id,label, icon: Icon }) => (<button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className='h-4 w-4' />
              {label}
            </button>
          ))}
        </div>

        {/* Consents tab */}
        {activeTab === 'consents' && (
          <div className='space-y-4'>
            <LGPDRightsInfo />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleConsentSubmit)}
                className='space-y-4'
              >
                {Object.entries(CONSENT_PURPOSES).map(([key, purpose]) => {
                  const consent = getConsentByType(key);

                  return (
                    <Card key={key}>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-3'>
                            <purpose.icon className='h-5 w-5 mt-0.5 text-blue-600' />
                            <div>
                              <CardTitle className='text-base flex items-center gap-2'>
                                {purpose.title}
                                {purpose.required && (
                                  <Badge variant='outline' className='text-xs'>
                                    Obrigatório
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className='text-sm mt-1'>
                                {purpose.description}
                              </CardDescription>
                            </div>
                          </div>

                          {consent && (
                            <ConsentStatusBadge
                              granted={consent.granted}
                              lastUpdated={consent.lastUpdated}
                            />
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <FormField
                          control={form.control}
                          name={key.replace('_', '') as keyof ConsentFormData}
                          render={({ field }) => (
                            <FormItem className='flex flex-row items-center justify-between space-y-0'>
                              <div className='space-y-0.5'>
                                <FormLabel className='text-sm font-medium'>
                                  {field.value
                                    ? 'Consentimento concedido'
                                    : 'Consentimento negado'}
                                </FormLabel>
                                <FormDescription className='text-xs'>
                                  {consent?.retentionPeriod && (
                                    <>
                                      Período de retenção: {consent.retentionPeriod}
                                    </>
                                  )}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={purpose.required || isLoading}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {consent?.dataCategories
                          && consent.dataCategories.length > 0 && (
                          <div className='mt-3'>
                            <p className='text-xs font-medium mb-1'>
                              Categorias de dados:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {consent.dataCategories.map(
                                (category, _index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {category}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                <div className='flex gap-2 pt-4'>
                  <Button type='submit' disabled={isLoading} className='flex-1'>
                    {isLoading ? 'Salvando...' : 'Salvar Consentimentos'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Rights tab */}
        {activeTab === 'rights' && (
          <div className='space-y-4'>
            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                <strong>Exercer Direitos do Titular dos Dados</strong>
                <br />
                Conforme a Lei Geral de Proteção de Dados (LGPD), você pode exercer os seguintes
                direitos:
              </AlertDescription>
            </Alert>

            <div className='grid gap-3'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Download className='h-4 w-4' />
                    Portabilidade de Dados
                  </CardTitle>
                  <CardDescription>
                    Exportar uma cópia de todos os dados pessoais em formato estruturado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDataExport}
                    disabled={isLoading}
                    className='w-full'
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Solicitar Exportação de Dados
                  </Button>
                  {patientData.dataExportRequested && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      Última solicitação: {format(
                        patientData.dataExportRequested,
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: ptBR,
                        },
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Trash2 className='h-4 w-4' />
                    Direito ao Esquecimento
                  </CardTitle>
                  <CardDescription>
                    Solicitar a exclusão de dados pessoais quando não há base legal para
                    processamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className='mb-3'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription className='text-xs'>
                      <strong>Atenção:</strong>{' '}
                      A exclusão de dados pode impactar o atendimento médico futuro. Alguns dados
                      podem ser mantidos por obrigação legal.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleDataErasure}
                    disabled={isLoading}
                    variant='destructive'
                    className='w-full'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Solicitar Exclusão de Dados
                  </Button>
                  {patientData.dataErasureRequested && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      Solicitação enviada: {format(
                        patientData.dataErasureRequested,
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: ptBR,
                        },
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (<div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>
                Histórico de Consentimentos
              </h3>
              <Badge variant='outline'>
                {patientData.consents.length} registros
              </Badge>
            </div>

            <div className='space-y-3'>
              {patientData.consents
                .sort(
                  (a, b) =>
                    new Date(b.lastUpdated).getTime()
                    - new Date(a.lastUpdated).getTime(),
                )
                .map(consent => (
                  <Card key={consent.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h4 className='font-medium'>
                            {CONSENT_PURPOSES[
                              consent.consentType as keyof typeof CONSENT_PURPOSES
                            ]?.title || consent.consentType}
                          </h4>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {consent.purpose}
                          </p>
                          <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
                            <span>Base legal: {consent.legalBasis}</span>
                            <span>Retenção: {consent.retentionPeriod}</span>
                          </div>
                        </div>
                        <ConsentStatusBadge
                          granted={consent.granted}
                          lastUpdated={consent.lastUpdated}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ConsentManagementDialog;
