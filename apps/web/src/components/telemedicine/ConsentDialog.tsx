import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MedicalDataClassification } from '@neonpro/types';
import { AlertTriangle, Eye, FileText, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (granted: boolean) => void;
  sessionId: string;
  dataTypes: MedicalDataClassification[];
  purpose:
    | 'telemedicine'
    | 'medical_treatment'
    | 'ai_assistance'
    | 'communication';
  doctorName?: string;
  clinicName?: string;
}

interface ConsentItem {
  type: MedicalDataClassification;
  label: string;
  description: string;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * LGPD-compliant consent dialog for telemedicine sessions
 * Provides granular consent options for different data types
 */
export function ConsentDialog({
  isOpen,
  onClose,
  onConsent,
  sessionId,
  dataTypes,
  purpose,
  doctorName,
  clinicName,
}: ConsentDialogProps) {
  const [selectedConsents, setSelectedConsents] = useState<
    Set<MedicalDataClassification>
  >(new Set());
  const [hasReadTerms, setHasReadTerms] = useState(false);

  // Define consent items with descriptions
  const consentItems: ConsentItem[] = [
    {
      type: 'general-medical',
      label: 'Dados Médicos Gerais',
      description:
        'Informações médicas básicas necessárias para a consulta (sintomas, histórico médico geral)',
      required: true,
      icon: FileText,
    },
    {
      type: 'sensitive-medical',
      label: 'Dados Médicos Sensíveis',
      description: 'Informações médicas sensíveis (exames, diagnósticos, tratamentos específicos)',
      required: false,
      icon: Shield,
    },
    {
      type: 'psychiatric',
      label: 'Dados Psiquiátricos',
      description: 'Informações relacionadas à saúde mental e tratamentos psiquiátricos',
      required: false,
      icon: Eye,
    },
    {
      type: 'genetic',
      label: 'Dados Genéticos',
      description: 'Informações genéticas e hereditárias',
      required: false,
      icon: AlertTriangle,
    },
  ].filter(item => dataTypes.includes(item.type));

  // Purpose descriptions
  const purposeDescriptions = {
    telemedicine: 'realização de consulta médica por telemedicina',
    medical_treatment: 'prestação de cuidados médicos e tratamento',
    ai_assistance: 'assistência por inteligência artificial para melhor atendimento',
    communication: 'comunicação entre profissionais de saúde e paciente',
  };

  useEffect(() => {
    // Auto-select required consents
    const requiredConsents = consentItems
      .filter(item => item.required)
      .map(item => item.type);
    setSelectedConsents(new Set(requiredConsents));
  }, [dataTypes]);

  const handleConsentChange = (
    dataType: MedicalDataClassification,
    checked: boolean,
  ) => {
    const newConsents = new Set(selectedConsents);
    if (checked) {
      newConsents.add(dataType);
    } else {
      newConsents.delete(dataType);
    }
    setSelectedConsents(newConsents);
  };

  const handleGrantConsent = () => {
    // Must have required consents and read terms
    const hasRequiredConsents = consentItems
      .filter(item => item.required)
      .every(item => selectedConsents.has(item.type));

    if (hasRequiredConsents && hasReadTerms) {
      onConsent(true);
    }
  };

  const handleDenyConsent = () => {
    onConsent(false);
  };

  const canGrantConsent = () => {
    const hasRequiredConsents = consentItems
      .filter(item => item.required)
      .every(item => selectedConsents.has(item.type));
    return hasRequiredConsents && hasReadTerms;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-blue-600' />
            Consentimento para Tratamento de Dados - LGPD
          </DialogTitle>
          <DialogDescription>
            Conforme a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento para
            processar seus dados pessoais durante a {purposeDescriptions[purpose]}.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Session Information */}
          <div className='bg-blue-50 p-4 rounded-lg'>
            <h4 className='font-medium text-blue-900 mb-2'>
              Informações da Sessão
            </h4>
            <div className='text-sm text-blue-800 space-y-1'>
              <p>
                <strong>ID da Sessão:</strong> {sessionId}
              </p>
              {doctorName && (
                <p>
                  <strong>Médico:</strong> {doctorName}
                </p>
              )}
              {clinicName && (
                <p>
                  <strong>Clínica:</strong> {clinicName}
                </p>
              )}
              <p>
                <strong>Finalidade:</strong> {purposeDescriptions[purpose]}
              </p>
            </div>
          </div>

          {/* Consent Items */}
          <div className='space-y-4'>
            <h4 className='font-medium text-gray-900'>
              Tipos de Dados a Serem Processados
            </h4>
            {consentItems.map(item => {
              const Icon = item.icon;
              const isSelected = selectedConsents.has(item.type);

              return (
                <div
                  key={item.type}
                  className={`border rounded-lg p-4 transition-colors ${
                    isSelected
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      <Checkbox
                        id={item.type}
                        checked={isSelected}
                        onCheckedChange={checked =>
                          handleConsentChange(item.type, checked as boolean)}
                        disabled={item.required}
                        className='mt-1'
                      />
                      <div className='min-w-0 flex-1'>
                        <label
                          htmlFor={item.type}
                          className='flex items-center gap-2 font-medium text-gray-900 cursor-pointer'
                        >
                          <Icon className='h-4 w-4 text-gray-600' />
                          {item.label}
                          {item.required && (
                            <span className='text-xs bg-red-100 text-red-600 px-2 py-1 rounded'>
                              Obrigatório
                            </span>
                          )}
                        </label>
                        <p className='text-sm text-gray-600 mt-1'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terms and Conditions */}
          <div className='border rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <Checkbox
                id='terms'
                checked={hasReadTerms}
                onCheckedChange={setHasReadTerms}
                className='mt-1'
              />
              <div className='min-w-0 flex-1'>
                <label
                  htmlFor='terms'
                  className='text-sm font-medium text-gray-900 cursor-pointer'
                >
                  Li e concordo com os termos de tratamento de dados
                </label>
                <div className='text-xs text-gray-600 mt-2 space-y-1'>
                  <p>
                    • Seus dados serão utilizados exclusivamente para a finalidade descrita
                  </p>
                  <p>• Você pode retirar o consentimento a qualquer momento</p>
                  <p>• Seus dados serão mantidos seguros e confidenciais</p>
                  <p>
                    • Você tem direito ao acesso, retificação e exclusão dos seus dados
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LGPD Rights Information */}
          <div className='bg-gray-50 p-4 rounded-lg text-xs text-gray-600'>
            <p className='font-medium mb-2'>Seus Direitos pela LGPD:</p>
            <p>
              Você tem o direito de confirmar a existência de tratamento, acessar seus dados,
              corrigi-los, anonimizá-los, bloqueá-los ou eliminá-los, bem como a portabilidade dos
              dados e informação sobre o compartilhamento.
            </p>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={handleDenyConsent}
            className='flex-1'
          >
            Não Concordo
          </Button>
          <Button
            onClick={handleGrantConsent}
            disabled={!canGrantConsent()}
            className='flex-1'
          >
            Concordo e Autorizo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConsentDialog;
