/**
 * Patient Consent Manager Component
 * Manages LGPD consent for patient data processing
 * Displays consent status and allows updates
 */

import type { Database } from '@/integrations/supabase/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator
} from '@neonpro/ui';
import {
  CheckCircle2,
  Download,
  FileText,
  Info,
  Shield,
  XCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PatientRow = Database['public']['Tables']['patients']['Row'];

interface PatientConsentManagerProps {
  patient: PatientRow;
}

export function PatientConsentManager({ patient }: PatientConsentManagerProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Não disponível';
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const consentStatus = [
    {
      label: 'Processamento de Dados Pessoais',
      description: 'Consentimento para processar dados pessoais e sensíveis do paciente',
      granted: patient.lgpd_consent_given,
      required: true,
      article: 'Art. 7º, I da LGPD',
    },
    {
      label: 'Comunicações de Marketing',
      description: 'Consentimento para envio de comunicações promocionais e ofertas',
      granted: patient.marketing_consent || false,
      required: false,
      article: 'Art. 7º, IX da LGPD',
    },
    {
      label: 'Pesquisas e Estudos',
      description: 'Consentimento para uso de dados em pesquisas e estudos científicos',
      granted: patient.research_consent || false,
      required: false,
      article: 'Art. 7º, IV da LGPD',
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Consent Status Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Status dos Consentimentos LGPD
              </CardTitle>
              <CardDescription>
                Gerenciamento de consentimentos conforme Lei Geral de Proteção de Dados
              </CardDescription>
            </div>
            <Badge variant={patient.lgpd_consent_given ? 'default' : 'destructive'}>
              {patient.lgpd_consent_given ? 'Conforme' : 'Pendente'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Main consent info */}
          <div className='bg-muted/50 border border-border rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <Info className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Informações do Consentimento</p>
                <div className='space-y-1 text-sm text-muted-foreground'>
                  <p>
                    <strong>Data do Consentimento:</strong>{' '}
                    {formatDate(patient.data_consent_date)}
                  </p>
                  {patient.lgpd_consent_version && (
                    <p>
                      <strong>Versão do Termo:</strong> {patient.lgpd_consent_version}
                    </p>
                  )}
                  <p>
                    <strong>Status Atual:</strong>{' '}
                    {patient.data_consent_status === 'granted' && 'Concedido'}
                    {patient.data_consent_status === 'pending' && 'Pendente'}
                    {patient.data_consent_status === 'withdrawn' && 'Revogado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Individual consent items */}
          <div className='space-y-3'>
            {consentStatus.map((consent, index) => (
              <div key={index} className='flex items-start gap-4 p-4 border rounded-lg'>
                <div className='flex-shrink-0 mt-1'>
                  {consent.granted ? (
                    <div className='w-8 h-8 rounded-full bg-success/10 flex items-center justify-center'>
                      <CheckCircle2 className='w-5 h-5 text-success' />
                    </div>
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
                      <XCircle className='w-5 h-5 text-muted-foreground' />
                    </div>
                  )}
                </div>

                <div className='flex-1 space-y-1'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='font-medium text-sm'>
                        {consent.label}
                        {consent.required && (
                          <Badge variant='outline' className='ml-2 text-xs'>
                            Obrigatório
                          </Badge>
                        )}
                      </p>
                      <p className='text-sm text-muted-foreground'>{consent.description}</p>
                      <p className='text-xs text-muted-foreground mt-1'>{consent.article}</p>
                    </div>
                    <Badge variant={consent.granted ? 'default' : 'secondary'}>
                      {consent.granted ? 'Concedido' : 'Não Concedido'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button variant='outline' className='gap-2' disabled>
              <Download className='w-4 h-4' />
              Baixar Comprovante de Consentimento
            </Button>
            <Button variant='outline' className='gap-2' disabled>
              <FileText className='w-4 h-4' />
              Atualizar Consentimentos
            </Button>
          </div>

          {/* LGPD Rights Information */}
          <div className='bg-info/5 border border-info/20 rounded-lg p-4'>
            <div className='flex items-start gap-2'>
              <Info className='w-5 h-5 text-info mt-0.5 flex-shrink-0' />
              <div className='space-y-2'>
                <p className='font-medium text-sm'>Direitos do Titular (Art. 18 da LGPD)</p>
                <ul className='text-sm text-muted-foreground space-y-1 list-disc list-inside'>
                  <li>Confirmação de existência de tratamento de dados</li>
                  <li>Acesso aos dados pessoais</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados a outro fornecedor</li>
                  <li>Eliminação dos dados tratados com consentimento</li>
                  <li>Revogação do consentimento</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing Consent */}
      {patient.data_sharing_consent && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Compartilhamento de Dados</CardTitle>
            <CardDescription>
              Consentimento para compartilhamento de dados com terceiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-muted/30 border rounded-lg p-4'>
              <pre className='text-xs text-muted-foreground overflow-auto'>
                {JSON.stringify(patient.data_sharing_consent, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Política de Retenção de Dados</CardTitle>
          <CardDescription>
            Informações sobre armazenamento e descarte de dados
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Período de Retenção</p>
              <p className='text-sm text-muted-foreground'>
                {patient.data_retention_until
                  ? `Até ${formatDate(patient.data_retention_until)}`
                  : '7 anos após última consulta (padrão CFM)'}
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Base Legal</p>
              <p className='text-sm text-muted-foreground'>
                Resolução CFM nº 1.821/2007 - Prontuários médicos devem ser mantidos por no mínimo 7 anos
              </p>
            </div>
          </div>

          <div className='bg-muted/30 border rounded-lg p-4'>
            <div className='flex items-start gap-2'>
              <Shield className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Segurança dos Dados</p>
                <p className='text-xs text-muted-foreground'>
                  Seus dados são protegidos com criptografia em repouso e em trânsito. Acesso restrito
                  apenas a profissionais autorizados. Backup automático diário com retenção de 30 dias.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
