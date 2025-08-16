import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type React from 'react';

// Register fonts (optional)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// })

// PDF Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    paddingTop: 50,
    paddingHorizontal: 50,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    textAlign: 'right',
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billToBox: {
    width: '45%',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  text: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 3,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 11,
    color: '#6b7280',
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    color: '#374151',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
    paddingTop: 5,
    marginTop: 5,
  },
  finalTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  },
});

// Invoice data interface
export type InvoicePDFData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';

  // Company info
  company: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
  };

  // Client info
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  // Items
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;

  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;

  // Payment info
  paymentMethod?: string;
  paymentTerms?: string;
  notes?: string;
}; // Invoice PDF Document Component
export const InvoicePDFDocument: React.FC<{ data: InvoicePDFData }> = ({
  data,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>NeonPro</Text>
          <Text style={styles.text}>Clinic Management System</Text>
        </View>
        <View style={styles.company}>
          <Text style={styles.text}>{data.company.name}</Text>
          <Text style={styles.text}>{data.company.email}</Text>
          {data.company.phone && (
            <Text style={styles.text}>{data.company.phone}</Text>
          )}
          {data.company.address && (
            <Text style={styles.text}>{data.company.address}</Text>
          )}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>INVOICE #{data.invoiceNumber}</Text>

      {/* Invoice Info & Bill To */}
      <View style={styles.billToSection}>
        <View style={styles.billToBox}>
          <Text style={styles.label}>Invoice Information</Text>
          <Text style={styles.text}>Date: {data.invoiceDate}</Text>
          <Text style={styles.text}>Due Date: {data.dueDate}</Text>
          <Text style={styles.text}>Status: {data.status.toUpperCase()}</Text>
          {data.paymentTerms && (
            <Text style={styles.text}>Terms: {data.paymentTerms}</Text>
          )}
        </View>

        <View style={styles.billToBox}>
          <Text style={styles.label}>Bill To</Text>
          <Text style={styles.text}>{data.client.name}</Text>
          <Text style={styles.text}>{data.client.email}</Text>
          {data.client.phone && (
            <Text style={styles.text}>{data.client.phone}</Text>
          )}
          {data.client.address && (
            <Text style={styles.text}>{data.client.address}</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Description</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Quantity</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Rate</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
        </View>

        {/* Table Rows */}
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.description}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>${item.rate.toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
        </View>

        {data.tax > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({data.taxRate}%):</Text>
            <Text style={styles.totalValue}>${data.tax.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.finalTotal}>
          <Text style={styles.finalTotalLabel}>Total:</Text>
          <Text style={styles.finalTotalValue}>${data.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes */}
      {data.notes && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.label}>Notes:</Text>
          <Text style={styles.text}>{data.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for your business! • NeonPro Clinic Management System
      </Text>
    </Page>
  </Document>
);

// Generate PDF Buffer
export const generateInvoicePDF = async (
  data: InvoicePDFData,
): Promise<Buffer> => {
  const document = <InvoicePDFDocument data={data} />;
  const pdfBuffer = await pdf(document).toBuffer();
  return pdfBuffer;
};

// Generate PDF Blob (for download)
export const generateInvoicePDFBlob = async (
  data: InvoicePDFData,
): Promise<Blob> => {
  const document = <InvoicePDFDocument data={data} />;
  const pdfBlob = await pdf(document).toBlob();
  return pdfBlob;
};
