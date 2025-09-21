import { Document } from '@react-pdf/renderer';
import { type ClinicBrandingData } from './ClinicBranding';
import styles from './pdf-styles';

// Tipos baseados no schema do formulário
export interface AestheticAssessmentData {
  patientData: {
    name: string;
    age: number;
    skinType: '1' | '2' | '3' | '4' | '5' | '6';
    gender: 'masculino' | 'feminino' | 'outro';
  };
  skinAnalysis: {
    primaryConcerns: string[];
    skinCondition: 'seca' | 'oleosa' | 'mista' | 'sensivel' | 'normal';
    acnePresent: boolean;
    melasmaPresent: boolean;
    wrinklesPresent: boolean;
    sunDamage: 'nenhum' | 'leve' | 'moderado' | 'severo';
  };
  medicalHistory: {
    isPregnant: boolean;
    isBreastfeeding: boolean;
    hasDiabetes: boolean;
    hasAutoimmune: boolean;
    currentMedications: string;
    allergies: string;
    previousTreatments: string;
  };
  lifestyle: {
    sunExposure: 'baixa' | 'moderada' | 'alta';
    smoking: boolean;
    alcoholConsumption: 'nenhum' | 'social' | 'moderado' | 'frequente';
    exerciseFrequency: 'sedentario' | 'leve' | 'moderado' | 'intenso';
  };
  lgpdConsent: {
    dataProcessing: boolean;
    imageAnalysis: boolean;
    marketingCommunication: boolean;
  };
}

interface AestheticReportPDFProps {
  assessmentData: AestheticAssessmentData;
  clinicData: ClinicBrandingData;
  generatedAt?: Date;
}

const CheckboxComponent: React.FC<{ checked: boolean; label: string }> = (_{
  checked,_label,_}) => (
  <View style={styles.checkboxRow}>
    <View
      style={[styles.checkbox, ...(checked ? [styles.checkboxChecked] : [])]}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

export const AestheticReportPDF: React.FC<AestheticReportPDFProps> = ({
  assessmentData,
  clinicData,
  generatedAt = new Date(),
}) => {
  const { patientData, skinAnalysis, medicalHistory, lifestyle, lgpdConsent } = assessmentData;

  // Mapear valores para texto legível
  const skinTypeLabels = {
    '1': 'Tipo I (Muito clara, sempre queima)',
    '2': 'Tipo II (Clara, queima facilmente)',
    '3': 'Tipo III (Morena clara, bronzeia gradualmente)',
    '4': 'Tipo IV (Morena, bronzeia facilmente)',
    '5': 'Tipo V (Morena escura, raramente queima)',
    '6': 'Tipo VI (Negra, nunca queima)',
  };

  const skinConditionLabels = {
    seca: 'Seca',
    oleosa: 'Oleosa',
    mista: 'Mista',
    sensivel: 'Sensível',
    normal: 'Normal',
  };

  const sunDamageLabels = {
    nenhum: 'Nenhum',
    leve: 'Leve',
    moderado: 'Moderado',
    severo: 'Severo',
  };

  return (
    <Document
      title={`Avaliação Estética - ${patientData.name}`}
      author={clinicData.name}
      subject='Relatório de Avaliação Estética'
      creator='NeonPro - Sistema de Gestão Estética'
    >
      <Page size='A4' style={styles.page}>
        {/* Header da clínica */}
        <ClinicHeader
          clinicData={clinicData}
          documentTitle='Relatório de Avaliação Estética'
          patientName={patientData.name}
          generatedAt={generatedAt}
        />
        {/* Informações do documento */}
        <DocumentInfo
          title='Relatório de Avaliação Estética'
          patientName={patientData.name}
          generatedAt={generatedAt}
        />
        {/* Disclaimer médico */}
        <View style={styles.medicalDisclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ AVISO MÉDICO: Este documento contém informações confidenciais de avaliação estética.
            Destinado exclusivamente para fins médicos e de tratamento. Manter sigilo conforme
            legislação vigente (CFM, ANVISA, LGPD).
          </Text>
        </View>{' '}
        {/* Seção 1: Dados do Paciente */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>1. DADOS DO PACIENTE</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.value}>{patientData.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.value}>{patientData.age} anos</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gênero:</Text>
            <Text style={styles.value}>{patientData.gender}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Fototipo de Pele:</Text>
            <Text style={styles.value}>
              {skinTypeLabels[patientData.skinType]}
            </Text>
          </View>
        </View>
        {/* Seção 2: Análise da Pele */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>2. ANÁLISE DA PELE</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Condição da Pele:</Text>
            <Text style={styles.value}>
              {skinConditionLabels[skinAnalysis.skinCondition]}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Danos Solares:</Text>
            <Text style={styles.value}>
              {sunDamageLabels[skinAnalysis.sunDamage]}
            </Text>
          </View>

          <Text style={[styles.label, { marginTop: 10, marginBottom: 8 }]}>
            Preocupações Primárias:
          </Text>
          {skinAnalysis.primaryConcerns.map(_(concern, _index) => (
            <Text
              key={index}
              style={[styles.value, { marginLeft: 20, marginBottom: 4 }]}
            >
              • {concern}
            </Text>
          ))}

          <Text style={[styles.label, { marginTop: 10, marginBottom: 8 }]}>
            Condições Presentes:
          </Text>
          <CheckboxComponent
            checked={skinAnalysis.acnePresent}
            label='Presença de Acne'
          />
          <CheckboxComponent
            checked={skinAnalysis.melasmaPresent}
            label='Presença de Melasma'
          />
          <CheckboxComponent
            checked={skinAnalysis.wrinklesPresent}
            label='Presença de Rugas'
          />
        </View>
        {/* Seção 3: Histórico Médico */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>3. HISTÓRICO MÉDICO</Text>

          <Text style={[styles.label, { marginBottom: 8 }]}>
            Condições Médicas:
          </Text>
          <CheckboxComponent
            checked={medicalHistory.isPregnant}
            label='Gravidez'
          />
          <CheckboxComponent
            checked={medicalHistory.isBreastfeeding}
            label='Amamentação'
          />
          <CheckboxComponent
            checked={medicalHistory.hasDiabetes}
            label='Diabetes'
          />
          <CheckboxComponent
            checked={medicalHistory.hasAutoimmune}
            label='Doença Autoimune'
          />

          {medicalHistory.currentMedications && (
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.label}>Medicações Atuais:</Text>
              <Text style={styles.value}>
                {medicalHistory.currentMedications}
              </Text>
            </View>
          )}

          {medicalHistory.allergies && (
            <View style={styles.row}>
              <Text style={styles.label}>Alergias:</Text>
              <Text style={styles.value}>{medicalHistory.allergies}</Text>
            </View>
          )}

          {medicalHistory.previousTreatments && (
            <View style={styles.row}>
              <Text style={styles.label}>Tratamentos Anteriores:</Text>
              <Text style={styles.value}>
                {medicalHistory.previousTreatments}
              </Text>
            </View>
          )}
        </View>{' '}
        {/* Seção 4: Estilo de Vida */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>4. ESTILO DE VIDA</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Exposição Solar:</Text>
            <Text style={styles.value}>{lifestyle.sunExposure}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Consumo de Álcool:</Text>
            <Text style={styles.value}>{lifestyle.alcoholConsumption}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Frequência de Exercícios:</Text>
            <Text style={styles.value}>{lifestyle.exerciseFrequency}</Text>
          </View>

          <CheckboxComponent checked={lifestyle.smoking} label='Fumante' />
        </View>
        {/* Seção 5: Consentimento LGPD */}
        <View style={styles.lgpdSection}>
          <Text style={styles.lgpdTitle}>
            5. CONSENTIMENTO LGPD - LEI GERAL DE PROTEÇÃO DE DADOS
          </Text>

          <CheckboxComponent
            checked={lgpdConsent.dataProcessing}
            label='Autorizo o processamento dos meus dados pessoais para fins de tratamento médico-estético'
          />
          <CheckboxComponent
            checked={lgpdConsent.imageAnalysis}
            label='Autorizo o uso das minhas imagens para análise de IA e documentação médica'
          />
          <CheckboxComponent
            checked={lgpdConsent.marketingCommunication}
            label='Autorizo o recebimento de comunicações de marketing da clínica'
          />

          <Text style={[styles.lgpdText, { marginTop: 10 }]}>
            Declaro estar ciente dos meus direitos conforme a LGPD (Lei 13.709/2018), incluindo
            acesso, retificação, exclusão e portabilidade dos dados. Posso revogar este
            consentimento a qualquer momento.
          </Text>
        </View>
        {/* Seção de Assinaturas */}
        <View style={styles.signatureSection}>
          <Text style={styles.subtitle}>6. ASSINATURAS</Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Assinatura do Paciente</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>
                Assinatura do Profissional
              </Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 20 }]}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>
              {generatedAt.toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        {/* Footer */}
        <Text style={styles.footer}>
          Este documento foi gerado automaticamente pelo sistema NeonPro em{'  '}
          {generatedAt.toLocaleDateString('pt-BR')} às{' '}
          {generatedAt.toLocaleTimeString('pt-BR')}.{'\n'}Documento confidencial - Manter sigilo
          médico conforme legislação vigente.
        </Text>
        <Text
          style={styles.pageNumber}
          render={(_{ pageNumber,_totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default AestheticReportPDF;
