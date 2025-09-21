/**
 * Session Consent Component for Telemedicine Platform
 * Handles LGPD compliance, CFM consent requirements, and session permissions
 * Features granular consent management, audit trails, and legal compliance
 */

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Info,
  Lock,
  Settings,
  Shield,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { useSessionConsent } from '@/hooks/use-telemedicine';
import { useLGPDConsent } from '@/hooks/useLGPDConsent';

interface SessionConsentProps {
  sessionId: string;
  patientId: string;
  professionalId: string;
  onConsentComplete?: (consent: ConsentData) => void;
  onConsentRevoke?: () => void;
  mode?: 'initial' | 'review' | 'audit';
  className?: string;
}

interface ConsentData {
  // Basic Consent
  telemedicineConsent: boolean;
  dataProcessingConsent: boolean;
  recordingConsent: boolean;

  // LGPD Specific
  lgpdDataProcessing: boolean;
  lgpdDataSharing: boolean;
  lgpdDataRetention: boolean;
  lgpdDataPortability: boolean;
  lgpdDataDeletion: boolean;

  // CFM Specific
  cfmTelemedicineAuthorization: boolean;
  cfmProfessionalValidation: boolean;
  cfmMedicalSecrecy: boolean;
  cfmTechnicalStandards: boolean;

  // Technical Permissions
  audioPermission: boolean;
  videoPermission: boolean;
  screenSharingPermission: boolean;
  fileUploadPermission: boolean;
  locationPermission: boolean;

  // Advanced Consent
  aiAssistanceConsent: boolean;
  emergencyContactConsent: boolean;
  researchParticipationConsent: boolean;
  marketingConsent: boolean;

  // Metadata
  consentVersion: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  consentMethod: 'digital_signature' | 'checkbox' | 'voice' | 'biometric';
  witnessId?: string;
  additionalNotes?: string;
}

interface ConsentSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  category: 'basic' | 'lgpd' | 'cfm' | 'technical' | 'advanced';
  legalBasis: string;
  consequences: string;
}

export function SessionConsent({
  sessionId,
  patientId,
  _professionalId,
  onConsentComplete,
  onConsentRevoke,
  mode = 'initial',
  className = '',
}: SessionConsentProps) {
  // Hooks
  const { consent, updateConsent, revokeConsent, validateConsent, _isUpdating } = useSessionConsent(
    sessionId,
  );

  // Session consent management
  const _sessionConsent = useSessionConsent(sessionId);

  // LGPD consent management
  const _lgpdConsent = useLGPDConsent({
    userId: patientId,
    patientId,
    sessionId,
    clinicId: '', // This would be passed as a prop
    dataTypes: ['medical-history', 'diagnostic-data', 'personal-identifiers'],
    purpose: 'telemedicine',
  });

  // State
  const [consentData, setConsentData] = useState<ConsentData>({
    // Basic Consent
    telemedicineConsent: false,
    dataProcessingConsent: false,
    recordingConsent: false,

    // LGPD Specific
    lgpdDataProcessing: false,
    lgpdDataSharing: false,
    lgpdDataRetention: false,
    lgpdDataPortability: false,
    lgpdDataDeletion: false,

    // CFM Specific
    cfmTelemedicineAuthorization: false,
    cfmProfessionalValidation: false,
    cfmMedicalSecrecy: false,
    cfmTechnicalStandards: false,

    // Technical Permissions
    audioPermission: false,
    videoPermission: false,
    screenSharingPermission: false,
    fileUploadPermission: false,
    locationPermission: false,

    // Advanced Consent
    aiAssistanceConsent: false,
    emergencyContactConsent: false,
    researchParticipationConsent: false,
    marketingConsent: false,

    // Metadata
    consentVersion: '2.1.0',
    timestamp: new Date(),
    ipAddress: '',
    userAgent: '',
    consentMethod: 'checkbox',
  });

  const [currentStep, _setCurrentStep] = useState(0);
  const [showLegalText, setShowLegalText] = useState(false);
  const [_showAuditDialog, setShowAuditDialog] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [consentProgress, setConsentProgress] = useState(0);

  // Consent sections configuration
  const consentSections: ConsentSection[] = [
    {
      id: 'telemedicineConsent',
      title: 'Consentimento para Telemedicina',
      description:
        'Autorizo a realização de consulta médica por telemedicina, compreendendo suas limitações e benefícios.',
      required: true,
      category: 'basic',
      legalBasis: 'Resolução CFM nº 2.314/2022',
      consequences: 'Sem este consentimento, não é possível realizar a consulta por telemedicina.',
    },
    {
      id: 'dataProcessingConsent',
      title: 'Processamento de Dados Pessoais',
      description:
        'Autorizo o processamento dos meus dados pessoais para finalidades médicas e administrativas.',
      required: true,
      category: 'lgpd',
      legalBasis: 'LGPD Art. 7º, II - execução de contrato',
      consequences: 'Dados necessários para prestação do serviço médico.',
    },
    {
      id: 'recordingConsent',
      title: 'Gravação da Consulta',
      description: 'Autorizo a gravação da consulta para fins médicos, legais e de qualidade.',
      required: true,
      category: 'cfm',
      legalBasis: 'CFM nº 2.314/2022 Art. 8º',
      consequences: 'Gravação necessária para documentação médica e conformidade legal.',
    },
    {
      id: 'cfmTelemedicineAuthorization',
      title: 'Autorização CFM para Telemedicina',
      description:
        'Reconheço que o profissional está devidamente habilitado pelo CFM para telemedicina.',
      required: true,
      category: 'cfm',
      legalBasis: 'Resolução CFM nº 2.314/2022',
      consequences: 'Validação obrigatória da habilitação profissional.',
    },
    {
      id: 'lgpdDataRetention',
      title: 'Retenção de Dados LGPD',
      description:
        'Autorizo a retenção dos meus dados pelo período legal de 20 anos (prontuário médico).',
      required: true,
      category: 'lgpd',
      legalBasis: 'LGPD Art. 7º, II + CFM Resolução 1.821/2007',
      consequences: 'Retenção legal obrigatória para prontuário médico.',
    },
    {
      id: 'audioPermission',
      title: 'Permissão de Áudio',
      description: 'Autorizo o uso do microfone para comunicação durante a consulta.',
      required: true,
      category: 'technical',
      legalBasis: 'Necessário para teleconsulta',
      consequences: 'Sem áudio, a consulta não pode ser realizada adequadamente.',
    },
    {
      id: 'videoPermission',
      title: 'Permissão de Vídeo',
      description: 'Autorizo o uso da câmera para visualização durante a consulta.',
      required: true,
      category: 'technical',
      legalBasis: 'Necessário para teleconsulta',
      consequences: 'Vídeo é fundamental para avaliação médica visual.',
    },
    {
      id: 'aiAssistanceConsent',
      title: 'Assistência de Inteligência Artificial',
      description: 'Autorizo o uso de IA para auxiliar na consulta (triagem, sugestões, tradução).',
      required: false,
      category: 'advanced',
      legalBasis: 'LGPD Art. 7º, I - consentimento',
      consequences: 'IA pode melhorar a qualidade do atendimento.',
    },
    {
      id: 'emergencyContactConsent',
      title: 'Contato de Emergência',
      description:
        'Autorizo contato com serviços de emergência caso necessário durante a consulta.',
      required: false,
      category: 'advanced',
      legalBasis: 'Interesse legítimo - proteção à vida',
      consequences: 'Permite atendimento emergencial rápido se necessário.',
    },
    {
      id: 'screenSharingPermission',
      title: 'Compartilhamento de Tela',
      description: 'Autorizo o compartilhamento de tela para mostrar exames ou documentos.',
      required: false,
      category: 'technical',
      legalBasis: 'Consentimento específico',
      consequences: 'Facilita discussão de exames e documentos.',
    },
  ];

  // Load existing consent
  useEffect(() => {
    if (consent) {
      setConsentData(prev => ({ ...prev, ...consent }));
    }
  }, [consent]);

  // Calculate progress
  useEffect(() => {
    const requiredSections = consentSections.filter(s => s.required);
    const _completedRequired = requiredSections.filter(
      s => consentData[s.id as keyof ConsentData] === true,
    ).length;

    const totalSections = consentSections.length;
    const completedTotal = consentSections.filter(
      s => consentData[s.id as keyof ConsentData] === true,
    ).length;

    const progress = (completedTotal / totalSections) * 100;
    setConsentProgress(progress);
  }, [consentData, consentSections]);

  // Handle consent change
  const handleConsentChange = useCallback(
    (sectionId: string, value: boolean) => {
      setConsentData(prev => ({
        ...prev,
        [sectionId]: value,
        timestamp: new Date(),
      }));

      // Log the action
      logConsentAction({
        action: value ? 'granted' : 'revoked',
        section: sectionId,
        timestamp: new Date(),
        metadata: { step: currentStep },
      });
    },
    [currentStep, logConsentAction],
  );

  // Validate all required consents
  const validateRequiredConsents = useCallback(() => {
    const requiredSections = consentSections.filter(s => s.required);
    const missingConsents = requiredSections.filter(
      s => !consentData[s.id as keyof ConsentData],
    );

    return missingConsents.length === 0;
  }, [consentData, consentSections]);

  // Handle consent submission
  const handleSubmitConsent = useCallback(async () => {
    if (!validateRequiredConsents()) {
      toast.error('Por favor, complete todos os consentimentos obrigatórios');
      return;
    }

    setIsValidating(true);

    try {
      // Add metadata
      const finalConsentData: ConsentData = {
        ...consentData,
        timestamp: new Date(),
        ipAddress: 'xxx.xxx.xxx.xxx', // Should be retrieved from request
        userAgent: navigator.userAgent,
        additionalNotes,
      };

      // Update consent
      await updateConsent(finalConsentData);

      // Validate compliance
      const isValid = await validateConsent(sessionId);

      if (isValid) {
        // Log completion
        await logConsentAction({
          action: 'completed',
          section: 'all',
          timestamp: new Date(),
          metadata: {
            version: finalConsentData.consentVersion,
            method: finalConsentData.consentMethod,
            notes: additionalNotes,
          },
        });

        onConsentComplete?.(finalConsentData);
        toast.success('Consentimento registrado com sucesso');
      } else {
        toast.error('Falha na validação do consentimento');
      }
    } catch (_error) {
      toast.error('Erro ao registrar consentimento');
    } finally {
      setIsValidating(false);
    }
  }, [
    validateRequiredConsents,
    consentData,
    additionalNotes,
    updateConsent,
    validateConsent,
    sessionId,
    logConsentAction,
    onConsentComplete,
  ]);

  // Handle consent revocation
  const handleRevokeConsent = useCallback(async () => {
    try {
      await revokeConsent();
      await logConsentAction({
        action: 'revoked_all',
        section: 'all',
        timestamp: new Date(),
        metadata: { reason: 'user_request' },
      });

      onConsentRevoke?.();
      toast.success('Consentimento revogado');
    } catch (_error) {
      toast.error('Erro ao revogar consentimento');
    }
  }, [revokeConsent, logConsentAction, onConsentRevoke]);

  // Get section status icon
  const getSectionStatusIcon = useCallback(
    (_section: any) => {
      const isConsented = consentData[
        section.id as keyof ConsentData
      ] as boolean;

      if (isConsented) {
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      } else if (section.required) {
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      } else {
        return <XCircle className='h-4 w-4 text-gray-400' />;
      }
    },
    [consentData],
  );

  // Get category icon
  const getCategoryIcon = useCallback((_category: any) => {
    switch (category) {
      case 'basic':
        return <FileText className='h-4 w-4' />;
      case 'lgpd':
        return <Shield className='h-4 w-4' />;
      case 'cfm':
        return <Stethoscope className='h-4 w-4' />;
      case 'technical':
        return <Settings className='h-4 w-4' />;
      case 'advanced':
        return <Activity className='h-4 w-4' />;
      default:
        return <Info className='h-4 w-4' />;
    }
  }, []);

  // Render consent section
  const renderConsentSection = useCallback(
    (_section: any) => {
      const isConsented = consentData[
        section.id as keyof ConsentData
      ] as boolean;

      return (
        <Card
          key={section.id}
          className={`${
            isConsented
              ? 'border-green-200 bg-green-50'
              : section.required
              ? 'border-red-200'
              : 'border-gray-200'
          }`}
        >
          <CardContent className='p-4'>
            <div className='flex items-start space-x-3'>
              <div className='mt-1'>{getSectionStatusIcon(section)}</div>

              <div className='flex-1 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {getCategoryIcon(section.category)}
                    <h4 className='font-medium text-sm'>{section.title}</h4>
                    {section.required && (
                      <Badge variant='destructive' className='text-xs'>
                        Obrigatório
                      </Badge>
                    )}
                  </div>

                  <Checkbox
                    checked={isConsented}
                    onCheckedChange={checked => handleConsentChange(section.id, checked as boolean)}
                    className='ml-2'
                  />
                </div>

                <p className='text-sm text-gray-600'>{section.description}</p>

                <div className='text-xs text-gray-500 space-y-1'>
                  <div>
                    <span className='font-medium'>Base Legal:</span> {section.legalBasis}
                  </div>
                  <div>
                    <span className='font-medium'>Consequências:</span> {section.consequences}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
    [consentData, handleConsentChange, getSectionStatusIcon, getCategoryIcon],
  );

  if (mode === 'audit') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5' />
              <span>Auditoria de Consentimento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='current' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='current'>Atual</TabsTrigger>
                <TabsTrigger value='history'>Histórico</TabsTrigger>
                <TabsTrigger value='compliance'>Conformidade</TabsTrigger>
                <TabsTrigger value='export'>Exportar</TabsTrigger>
              </TabsList>

              <TabsContent value='current' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {Object.entries(consentData).map(([key, value]) => (
                    <div key={key} className='flex justify-between text-sm'>
                      <span className='font-medium'>{key}:</span>
                      <span
                        className={typeof value === 'boolean'
                          ? value
                            ? 'text-green-600'
                            : 'text-red-600'
                          : ''}
                      >
                        {typeof value === 'boolean'
                          ? value
                            ? '✓'
                            : '✗'
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='history' className='space-y-4'>
                <ScrollArea className='h-96'>
                  {auditTrail.map((entry, index) => (
                    <div
                      key={index}
                      className='flex justify-between text-sm py-2 border-b'
                    >
                      <div>
                        <span className='font-medium'>{entry.action}</span>
                        <span className='text-gray-600 ml-2'>
                          {entry.section}
                        </span>
                      </div>
                      <span className='text-gray-500'>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value='compliance' className='space-y-4'>
                <Alert>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>
                    Todos os consentimentos estão em conformidade com LGPD e CFM.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value='export' className='space-y-4'>
                <div className='space-y-2'>
                  <Button
                    onClick={() => exportAuditTrail('pdf')}
                    className='w-full'
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Exportar como PDF
                  </Button>
                  <Button
                    onClick={() => exportAuditTrail('json')}
                    variant='outline'
                    className='w-full'
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Exportar como JSON
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Shield className='h-6 w-6 text-blue-600' />
              <span>Consentimento para Telemedicina</span>
            </div>
            <Badge variant='outline' className='bg-blue-50 text-blue-700'>
              Versão {consentData.consentVersion}
            </Badge>
          </CardTitle>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progresso do Consentimento</span>
              <span>{Math.round(consentProgress)}% completo</span>
            </div>
            <Progress value={consentProgress} className='h-2' />
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Indicators */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <Shield className='h-8 w-8 text-green-600 mx-auto mb-2' />
            <div className='text-sm font-medium'>LGPD Compliant</div>
            <div className='text-xs text-gray-600'>
              Lei Geral de Proteção de Dados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <Stethoscope className='h-8 w-8 text-blue-600 mx-auto mb-2' />
            <div className='text-sm font-medium'>CFM Authorized</div>
            <div className='text-xs text-gray-600'>
              Conselho Federal de Medicina
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <Lock className='h-8 w-8 text-purple-600 mx-auto mb-2' />
            <div className='text-sm font-medium'>End-to-End Encrypted</div>
            <div className='text-xs text-gray-600'>
              Criptografia de ponta a ponta
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          <strong>Importante:</strong>{' '}
          Leia atentamente cada seção antes de dar seu consentimento. Você pode revogar seu
          consentimento a qualquer momento, exceto para dados já processados sob base legal
          legítima. Campos marcados como "Obrigatório" são necessários para a realização da
          consulta.
        </AlertDescription>
      </Alert>

      {/* Consent Sections */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Seções de Consentimento</h3>

        {/* Group by category */}
        {['basic', 'lgpd', 'cfm', 'technical', 'advanced'].map(category => {
          const sectionsInCategory = consentSections.filter(
            s => s.category === category,
          );
          if (sectionsInCategory.length === 0) return null;

          return (
            <div key={category} className='space-y-3'>
              <h4 className='font-medium text-gray-900 capitalize flex items-center space-x-2'>
                {getCategoryIcon(category)}
                <span>
                  {category === 'basic' && 'Consentimentos Básicos'}
                  {category === 'lgpd'
                    && 'LGPD - Lei Geral de Proteção de Dados'}
                  {category === 'cfm' && 'CFM - Conselho Federal de Medicina'}
                  {category === 'technical' && 'Permissões Técnicas'}
                  {category === 'advanced' && 'Consentimentos Avançados'}
                </span>
              </h4>

              <div className='space-y-3'>
                {sectionsInCategory.map(renderConsentSection)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Observações Adicionais (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value)}
            placeholder='Adicione qualquer observação ou comentário sobre o consentimento...'
            className='min-h-[80px]'
          />
        </CardContent>
      </Card>

      {/* Legal Text Dialog */}
      <Dialog open={showLegalText} onOpenChange={setShowLegalText}>
        <DialogTrigger asChild>
          <Button variant='outline' className='w-full'>
            <FileText className='h-4 w-4 mr-2' />
            Ler Texto Legal Completo
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-4xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle>Texto Legal Completo</DialogTitle>
          </DialogHeader>
          <ScrollArea className='h-96'>
            <div className='space-y-4 text-sm'>
              <h4 className='font-medium'>
                Termos e Condições para Telemedicina
              </h4>
              <p>
                Este documento estabelece os termos e condições para a realização de consulta médica
                por telemedicina, em conformidade com a Resolução CFM nº 2.314/2022 e a Lei Geral de
                Proteção de Dados (LGPD - Lei 13.709/2018).
              </p>

              <h5 className='font-medium'>1. Definições</h5>
              <p>
                Telemedicina: exercício da medicina mediado por tecnologias para fins de
                assistência, educação, pesquisa, prevenção de doenças e lesões e promoção de saúde.
              </p>

              <h5 className='font-medium'>2. Consentimento do Paciente</h5>
              <p>
                O paciente deve consentir de forma livre e esclarecida para a realização da
                telemedicina, após ser informado sobre as limitações inerentes ao uso da tecnologia.
              </p>

              <h5 className='font-medium'>3. Proteção de Dados</h5>
              <p>
                Todos os dados pessoais serão tratados em conformidade com a LGPD, garantindo a
                segurança, confidencialidade e integridade das informações.
              </p>

              {/* Add more legal text as needed */}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {mode === 'review'
          ? (
            <>
              <Button
                variant='destructive'
                onClick={handleRevokeConsent}
                className='flex-1'
              >
                <XCircle className='h-4 w-4 mr-2' />
                Revogar Consentimento
              </Button>
              <Button
                onClick={() => setShowAuditDialog(true)}
                variant='outline'
                className='flex-1'
              >
                <Eye className='h-4 w-4 mr-2' />
                Ver Auditoria
              </Button>
            </>
          )
          : (
            <>
              <Button
                onClick={handleSubmitConsent}
                disabled={!validateRequiredConsents() || isValidating}
                className='flex-1'
              >
                {isValidating
                  ? <Activity className='h-4 w-4 mr-2 animate-spin' />
                  : <CheckCircle className='h-4 w-4 mr-2' />}
                {isValidating ? 'Processando...' : 'Confirmar Consentimento'}
              </Button>

              <Button
                variant='outline'
                onClick={() => setShowAuditDialog(true)}
                className='sm:w-auto'
              >
                <Eye className='h-4 w-4 mr-2' />
                Revisar
              </Button>
            </>
          )}
      </div>

      {/* Validation Status */}
      {!validateRequiredConsents() && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertTriangle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800'>
            Para prosseguir, é necessário aceitar todos os consentimentos obrigatórios.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default SessionConsent;
