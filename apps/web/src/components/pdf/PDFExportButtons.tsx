import AestheticReportPDF, {
  type AestheticAssessmentData,
} from '@/components/pdf/AestheticReportPDF';
import { type ClinicBrandingData } from '@/components/pdf/ClinicBranding';
import { Button } from '@/components/ui/button';
import { generatePDFFilename, usePDFExport } from '@/hooks/usePDFExport';
import React from 'react';
import { toast } from 'sonner';

interface PDFExportButtonsProps {
  assessmentData: AestheticAssessmentData;
  clinicData?: ClinicBrandingData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
  className?: string;
}

// Dados padrão da clínica (pode vir de configuração/contexto depois)
const defaultClinicData: ClinicBrandingData = {
  name: 'Clínica Estética NeonPro',
  address: 'Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567',
  phone: '(11) 99999-9999',
  email: 'contato@clinicaestetica.com.br',
  cnpj: '12.345.678/0001-90',
  crm: '123456-SP',
  website: 'www.clinicaestetica.com.br',
};

export const PDFExportButtons: React.FC<PDFExportButtonsProps> = ({
  assessmentData,
  clinicData = defaultClinicData,
  variant = 'default',
  size = 'default',
  showPreview = true,
  className = '',
}) => {
  const { isGenerating, downloadPDF, previewPDF, error } = usePDFExport();

  const handleDownload = async () => {
    try {
      const filename = generatePDFFilename(
        'assessment',
        assessmentData.patientData.name,
      );

      await downloadPDF(
        <AestheticReportPDF
          assessmentData={assessmentData}
          clinicData={clinicData}
          generatedAt={new Date()}
        />,
        filename,
      );

      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao baixar o PDF. Tente novamente.');
    }
  };

  const handlePreview = async () => {
    try {
      await previewPDF(
        <AestheticReportPDF
          assessmentData={assessmentData}
          clinicData={clinicData}
          generatedAt={new Date()}
        />,
      );
    } catch (error) {
      console.error(error);
      toast.error('Erro ao visualizar o PDF. Tente novamente.');
    }
  };

  const buttonProps = {
    variant,
    size,
    disabled: isGenerating,
    className: `gap-2 ${className}`,
  };

  return (
    <div className='flex gap-2 flex-wrap'>
      {/* Botão de Download */}
      <Button {...buttonProps} onClick={handleDownload}>
        {isGenerating
          ? <Loader2 className='h-4 w-4 animate-spin' />
          : <Download className='h-4 w-4' />}
        {isGenerating ? 'Gerando...' : 'Baixar PDF'}
      </Button>

      {/* Botão de Preview (se habilitado) */}
      {showPreview && (
        <Button {...buttonProps} variant='outline' onClick={handlePreview}>
          {isGenerating
            ? <Loader2 className='h-4 w-4 animate-spin' />
            : <Eye className='h-4 w-4' />}
          {isGenerating ? 'Gerando...' : 'Visualizar'}
        </Button>
      )}

      {/* Exibir erro se houver */}
      {error && (
        <div className='w-full text-sm text-red-600 bg-red-50 p-2 rounded-md'>
          <FileText className='h-4 w-4 inline mr-1' />
          Erro: {error}
        </div>
      )}
    </div>
  );
};

export default PDFExportButtons;
