import { Text } from '@react-pdf/renderer';
import styles from './pdf-styles';

export interface ClinicBrandingData {
  name: string;
  address: string;
  phone: string;
  email: string;
  cnpj: string;
  crm?: string;
  logoUrl?: string;
  website?: string;
}

interface ClinicHeaderProps {
  clinicData: ClinicBrandingData;
  documentTitle: string;
  patientName: string;
  generatedAt?: Date;
}

export const ClinicHeader: React.FC<ClinicHeaderProps> = ({
  clinicData,
  documentTitle,
  _patientName,
  _generatedAt = new Date(),
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName}>{clinicData.name}</Text>
        <Text style={styles.clinicAddress}>{clinicData.address}</Text>
        <Text style={styles.clinicAddress}>
          Tel: {clinicData.phone} | Email: {clinicData.email}
        </Text>
        <Text style={styles.clinicAddress}>
          CNPJ: {clinicData.cnpj}
          {clinicData.crm && ` | CRM: ${clinicData.crm}`}
        </Text>
      </View>

      {clinicData.logoUrl && (
        <View>
          {/* Logo será implementado quando tivermos uma URL válida */}
          <View
            style={[
              styles.logo,
              {
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: 8, color: '#6b7280' }}>LOGO</Text>
          </View>
        </View>
      )}
    </View>
  );
};

interface DocumentInfoProps {
  title: string;
  patientName: string;
  generatedAt: Date;
}

export const DocumentInfo: React.FC<DocumentInfoProps> = ({
  title,
  patientName,
  generatedAt,
}) => {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Paciente:</Text>
        <Text style={styles.value}>{patientName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Data de Geração:</Text>
        <Text style={styles.value}>
          {generatedAt.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};
