import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// Registrar fontes (Roboto é uma boa opção para documentos médicos)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src:
        'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src:
        'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src:
        'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Estilos padrão para documentos médicos brasileiros
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.3,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 15,
    marginTop: 20,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 9,
    fontWeight: 500,
    color: '#374151',
  },
  value: {
    width: '60%',
    fontSize: 9,
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    color: '#374151',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    fontWeight: 500,
    color: '#111827',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#6b7280',
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  checkboxLabel: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 40,
    fontSize: 8,
    color: '#6b7280',
  },
  // Estilos específicos para conformidade médica
  medicalDisclaimer: {
    backgroundColor: '#fef3c7',
    padding: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disclaimerText: {
    fontSize: 8,
    color: '#92400e',
    lineHeight: 1.4,
  },
  // Estilos para LGPD
  lgpdSection: {
    backgroundColor: '#ecfdf5',
    padding: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  lgpdTitle: {
    fontSize: 10,
    fontWeight: 500,
    color: '#047857',
    marginBottom: 8,
  },
  lgpdText: {
    fontSize: 8,
    color: '#065f46',
    lineHeight: 1.4,
  },
  // Estilos para assinaturas
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureBox: {
    width: '45%',
    borderBottomWidth: 1,
    borderBottomColor: '#6b7280',
    paddingBottom: 5,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 5,
  },
});

export default styles;
