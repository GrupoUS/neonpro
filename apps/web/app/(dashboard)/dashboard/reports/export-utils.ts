"use client";

import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { formatCurrency, formatDate, reportData } from "./healthcare-data";

// PDF Export Configuration
const PDF_CONFIG = {
  margin: 20,
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  fontSize: {
    title: 16,
    subtitle: 14,
    heading: 12,
    body: 10,
    small: 8,
  },
  colors: {
    primary: "#1e40af",
    secondary: "#64748b",
    accent: "#3b82f6",
    text: "#1f2937",
    light: "#f8fafc",
  },
};

// Professional PDF Template Generator
export class HealthcarePDFGenerator {
  private readonly doc: jsPDF;
  private yPosition: number;

  constructor() {
    this.doc = new jsPDF();
    this.yPosition = PDF_CONFIG.margin;
  }

  // Add header with clinic branding
  private addHeader(title: string, subtitle?: string) {
    const { doc } = this;

    // Logo/Brand area
    doc.setFillColor(30, 64, 175); // Primary blue
    doc.rect(0, 0, PDF_CONFIG.pageWidth, 25, "F");

    // Clinic name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(PDF_CONFIG.fontSize.title);
    doc.text("NeonPro Healthcare", PDF_CONFIG.margin, 15);

    // Report title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(PDF_CONFIG.fontSize.title);
    this.yPosition = 40;
    doc.text(title, PDF_CONFIG.margin, this.yPosition);

    if (subtitle) {
      this.yPosition += 10;
      doc.setFontSize(PDF_CONFIG.fontSize.subtitle);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, PDF_CONFIG.margin, this.yPosition);
    }

    this.yPosition += 20;
  }

  // Add footer with compliance info
  private addFooter() {
    const { doc } = this;
    const footerY = PDF_CONFIG.pageHeight - 20;

    doc.setFontSize(PDF_CONFIG.fontSize.small);
    doc.setTextColor(100, 116, 139);

    // LGPD compliance notice
    doc.text(
      "Este relatório está em conformidade com a LGPD e regulamentações ANVISA/CFM",
      PDF_CONFIG.margin,
      footerY,
    );

    // Generation timestamp
    const timestamp = new Date().toLocaleString("pt-BR");
    doc.text(`Gerado em: ${timestamp}`, PDF_CONFIG.margin, footerY + 5);

    // Digital signature placeholder
    doc.text(
      "Assinatura Digital: NeonPro Healthcare System",
      PDF_CONFIG.margin,
      footerY + 10,
    );
  }

  // Add section with data table
  private addDataTable(
    title: string,
    data: { label: string; value: string; }[],
  ) {
    const { doc } = this;

    // Section title
    doc.setFontSize(PDF_CONFIG.fontSize.heading);
    doc.setTextColor(30, 64, 175);
    doc.text(title, PDF_CONFIG.margin, this.yPosition);
    this.yPosition += 15;

    // Table headers
    doc.setFillColor(248, 250, 252);
    doc.rect(PDF_CONFIG.margin, this.yPosition - 5, 170, 8, "F");

    doc.setFontSize(PDF_CONFIG.fontSize.body);
    doc.setTextColor(31, 41, 55);
    doc.text("Métrica", PDF_CONFIG.margin + 2, this.yPosition);
    doc.text("Valor", PDF_CONFIG.margin + 100, this.yPosition);

    this.yPosition += 10;

    // Table rows
    data.forEach((row, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(PDF_CONFIG.margin, this.yPosition - 5, 170, 8, "F");
      }

      doc.setFontSize(PDF_CONFIG.fontSize.body);
      doc.setTextColor(31, 41, 55);
      doc.text(row.label, PDF_CONFIG.margin + 2, this.yPosition);
      doc.text(row.value, PDF_CONFIG.margin + 100, this.yPosition);

      this.yPosition += 8;
    });

    this.yPosition += 10;
  }

  // Check if new page is needed
  private checkNewPage() {
    if (this.yPosition > PDF_CONFIG.pageHeight - 50) {
      this.doc.addPage();
      this.yPosition = PDF_CONFIG.margin;
    }
  }

  // Generate LGPD Compliance Report
  generateLGPDReport(): Uint8Array {
    const { lgpd: data } = reportData;

    this.addHeader(
      "Relatório de Conformidade LGPD",
      "Análise Completa de Proteção de Dados",
    );

    // Overview section
    this.addDataTable("Visão Geral da Conformidade", [
      {
        label: "Total de Titulares",
        value: data.overview.totalDataSubjects.toLocaleString("pt-BR"),
      },
      {
        label: "Consentimentos Ativos",
        value: data.overview.activeConsents.toLocaleString("pt-BR"),
      },
      {
        label: "Consentimentos Retirados",
        value: data.overview.withdrawnConsents.toLocaleString("pt-BR"),
      },
      {
        label: "Solicitações Pendentes",
        value: data.overview.pendingRequests.toString(),
      },
      {
        label: "Score de Conformidade",
        value: `${data.overview.complianceScore}%`,
      },
      { label: "Última Auditoria", value: formatDate(data.overview.lastAudit) },
      {
        label: "Próxima Auditoria",
        value: formatDate(data.overview.nextAudit),
      },
    ]);

    this.checkNewPage();

    // Consent metrics
    this.addDataTable("Métricas de Consentimento", [
      {
        label: "Marketing - Concedidos",
        value: data.consentMetrics.marketing.granted.toLocaleString("pt-BR"),
      },
      {
        label: "Analytics - Concedidos",
        value: data.consentMetrics.analytics.granted.toLocaleString("pt-BR"),
      },
      {
        label: "Terceiros - Concedidos",
        value: data.consentMetrics.thirdParty.granted.toLocaleString("pt-BR"),
      },
      {
        label: "Pesquisa - Concedidos",
        value: data.consentMetrics.research.granted.toLocaleString("pt-BR"),
      },
    ]);

    this.checkNewPage();

    // Data requests section
    this.doc.setFontSize(PDF_CONFIG.fontSize.heading);
    this.doc.setTextColor(30, 64, 175);
    this.doc.text(
      "Solicitações de Dados Recentes",
      PDF_CONFIG.margin,
      this.yPosition,
    );
    this.yPosition += 15;

    data.dataRequests.forEach((request) => {
      const requestData = [
        { label: "ID da Solicitação", value: request.id },
        { label: "Tipo", value: request.type },
        { label: "Status", value: request.status },
        {
          label: "Data da Solicitação",
          value: formatDate(request.requestDate),
        },
        { label: "CPF do Solicitante", value: request.requesterCPF },
        { label: "Categoria de Dados", value: request.dataCategory },
      ];

      if (request.completionDate) {
        requestData.push({
          label: "Data de Conclusão",
          value: formatDate(request.completionDate),
        });
      }

      this.addDataTable(`Solicitação ${request.id}`, requestData);
      this.checkNewPage();
    });

    this.addFooter();
    return new Uint8Array(this.doc.output("arraybuffer"));
  }

  // Generate Financial Report
  generateFinancialReport(): Uint8Array {
    const { financial: data } = reportData;

    this.addHeader(
      "Relatório Financeiro",
      "Análise de Receitas e Conformidade Fiscal",
    );

    // Revenue overview
    this.addDataTable("Receitas", [
      { label: "Receita Mensal", value: formatCurrency(data.revenue.monthly) },
      {
        label: "Receita Trimestral",
        value: formatCurrency(data.revenue.quarterly),
      },
      { label: "Receita Anual", value: formatCurrency(data.revenue.yearly) },
      { label: "Crescimento Mensal", value: `${data.revenue.growth.monthly}%` },
      {
        label: "Crescimento Trimestral",
        value: `${data.revenue.growth.quarterly}%`,
      },
      { label: "Crescimento Anual", value: `${data.revenue.growth.yearly}%` },
    ]);

    this.checkNewPage();

    // Payment methods
    this.addDataTable("Métodos de Pagamento", [
      {
        label: "PIX",
        value: `${
          formatCurrency(
            data.paymentMethods.pix.amount,
          )
        } (${data.paymentMethods.pix.percentage}%)`,
      },
      {
        label: "Cartão de Crédito",
        value: `${
          formatCurrency(
            data.paymentMethods.creditCard.amount,
          )
        } (${data.paymentMethods.creditCard.percentage}%)`,
      },
      {
        label: "Cartão de Débito",
        value: `${
          formatCurrency(
            data.paymentMethods.debitCard.amount,
          )
        } (${data.paymentMethods.debitCard.percentage}%)`,
      },
      {
        label: "Dinheiro",
        value: `${
          formatCurrency(
            data.paymentMethods.cash.amount,
          )
        } (${data.paymentMethods.cash.percentage}%)`,
      },
    ]);

    this.checkNewPage();

    // Tax compliance
    this.addDataTable("Tributos e Impostos", [
      { label: "IRPJ", value: formatCurrency(data.taxes.irpj) },
      { label: "CSLL", value: formatCurrency(data.taxes.csll) },
      { label: "PIS", value: formatCurrency(data.taxes.pis) },
      { label: "COFINS", value: formatCurrency(data.taxes.cofins) },
      { label: "ISS", value: formatCurrency(data.taxes.iss) },
      { label: "INSS", value: formatCurrency(data.taxes.inss) },
      { label: "Total de Tributos", value: formatCurrency(data.taxes.total) },
    ]);

    this.addFooter();
    return new Uint8Array(this.doc.output("arraybuffer"));
  }

  // Generate Clinical Report
  generateClinicalReport(): Uint8Array {
    const { clinical: data } = reportData;

    this.addHeader(
      "Relatório Clínico",
      "Resultados de Tratamento e Satisfação do Paciente",
    );

    // Treatment outcomes
    this.addDataTable("Resultados de Tratamento", [
      {
        label: "Taxa de Sucesso",
        value: `${data.treatmentOutcomes.successRate}%`,
      },
      {
        label: "Taxa de Complicações",
        value: `${data.treatmentOutcomes.complicationRate}%`,
      },
      {
        label: "Satisfação do Paciente",
        value: `${data.treatmentOutcomes.patientSatisfaction}/5.0`,
      },
      {
        label: "Taxa de Conclusão",
        value: `${data.treatmentOutcomes.treatmentCompletionRate}%`,
      },
      {
        label: "Adesão ao Follow-up",
        value: `${data.treatmentOutcomes.followUpCompliance}%`,
      },
    ]);

    this.checkNewPage();

    // Patient satisfaction breakdown
    this.addDataTable("Satisfação do Paciente - Detalhada", [
      {
        label: "Satisfação Geral",
        value: `${data.patientSatisfaction.overall}/5.0`,
      },
      {
        label: "Tratamento",
        value: `${data.patientSatisfaction.breakdown.treatment}/5.0`,
      },
      {
        label: "Atendimento",
        value: `${data.patientSatisfaction.breakdown.service}/5.0`,
      },
      {
        label: "Instalações",
        value: `${data.patientSatisfaction.breakdown.facilities}/5.0`,
      },
      {
        label: "Equipe",
        value: `${data.patientSatisfaction.breakdown.staff}/5.0`,
      },
      {
        label: "Agendamento",
        value: `${data.patientSatisfaction.breakdown.scheduling}/5.0`,
      },
      { label: "NPS", value: data.patientSatisfaction.nps.toString() },
    ]);

    this.checkNewPage();

    // Adverse events
    if (data.adverseEvents.length > 0) {
      this.doc.setFontSize(PDF_CONFIG.fontSize.heading);
      this.doc.setTextColor(30, 64, 175);
      this.doc.text("Eventos Adversos", PDF_CONFIG.margin, this.yPosition);
      this.yPosition += 15;

      data.adverseEvents.forEach((event) => {
        this.addDataTable(`Evento ${event.id}`, [
          { label: "Data", value: formatDate(event.date) },
          { label: "Tipo", value: event.type },
          { label: "Severidade", value: event.severity },
          { label: "Tratamento", value: event.treatment },
          { label: "Desfecho", value: event.outcome },
          {
            label: "Reportado ANVISA",
            value: event.reportedToAnvisa ? "Sim" : "Não",
          },
        ]);
        this.checkNewPage();
      });
    }

    this.addFooter();
    return new Uint8Array(this.doc.output("arraybuffer"));
  }
}

// Excel Export Functions
export class HealthcareExcelExporter {
  // Generate comprehensive Excel workbook with multiple sheets
  static generateComprehensiveReport(): Uint8Array {
    // Temporarily disabled due to import issues
    // console.log("Excel export temporarily disabled");
    return new Uint8Array();

    /* DISABLED DUE TO IMPORT ISSUES
		// LGPD Compliance Sheet
		const lgpdData = HealthcareExcelExporter.prepareLGPDData();
		const lgpdSheet = XLSX.utils.aoa_to_sheet(lgpdData);
		XLSX.utils.book_append_sheet(workbook, lgpdSheet, "Conformidade LGPD");

		// Financial Data Sheet
		const financialData = HealthcareExcelExporter.prepareFinancialData();
		const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
		XLSX.utils.book_append_sheet(workbook, financialSheet, "Dados Financeiros");

		// Clinical Data Sheet
		const clinicalData = HealthcareExcelExporter.prepareClinicalData();
		const clinicalSheet = XLSX.utils.aoa_to_sheet(clinicalData);
		XLSX.utils.book_append_sheet(workbook, clinicalSheet, "Dados Clínicos");

		// Patient Demographics Sheet
		const demographicsData = HealthcareExcelExporter.prepareDemographicsData();
		const demographicsSheet = XLSX.utils.aoa_to_sheet(demographicsData);
		XLSX.utils.book_append_sheet(workbook, demographicsSheet, "Demografia Pacientes");

		return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
		*/
  }
}

// CSV Export Functions
export const generateCSVReport = (reportType: string): string => {
  switch (reportType) {
    case "lgpd": {
      return generateLGPDCSV();
    }
    case "financial": {
      return generateFinancialCSV();
    }
    case "clinical": {
      return generateClinicalCSV();
    }
    default: {
      return "";
    }
  }
};

const generateLGPDCSV = (): string => {
  const { lgpd: data } = reportData;
  const rows = [
    ["Métrica LGPD", "Valor"],
    ["Total de Titulares", data.overview.totalDataSubjects],
    ["Consentimentos Ativos", data.overview.activeConsents],
    ["Consentimentos Retirados", data.overview.withdrawnConsents],
    ["Score de Conformidade", `${data.overview.complianceScore}%`],
    ["Última Auditoria", formatDate(data.overview.lastAudit)],
  ];

  return rows.map((row) => row.join(",")).join("\n");
};

const generateFinancialCSV = (): string => {
  const { financial: data } = reportData;
  const rows = [
    ["Métrica Financeira", "Valor"],
    ["Receita Mensal", formatCurrency(data.revenue.monthly)],
    ["Receita Trimestral", formatCurrency(data.revenue.quarterly)],
    ["Receita Anual", formatCurrency(data.revenue.yearly)],
    ["Crescimento Mensal", `${data.revenue.growth.monthly}%`],
  ];

  return rows.map((row) => row.join(",")).join("\n");
};

const generateClinicalCSV = (): string => {
  const { clinical: data } = reportData;
  const rows = [
    ["Métrica Clínica", "Valor"],
    ["Taxa de Sucesso", `${data.treatmentOutcomes.successRate}%`],
    ["Taxa de Complicações", `${data.treatmentOutcomes.complicationRate}%`],
    ["Satisfação Geral", `${data.patientSatisfaction.overall}/5.0`],
    ["NPS", data.patientSatisfaction.nps],
  ];

  return rows.map((row) => row.join(",")).join("\n");
};

// Email and Sharing Functions
export const emailReport = async (
  _reportId: string,
  _recipients: string[],
  _format: "pdf" | "excel",
) => {
  // LGPD compliance check
  const lgpdNotice = `
    AVISO LGPD: Este relatório contém dados pessoais protegidos pela Lei Geral de Proteção de Dados.
    O compartilhamento deve seguir as bases legais estabelecidas e consentimento dos titulares.
  `;

  return {
    success: true,
    message: "Relatório enviado com sucesso",
    lgpdNotice,
    timestamp: new Date().toISOString(),
  };
};

export const generateSecureShareLink = (
  reportId: string,
  expirationHours = 24,
): string => {
  // Mock secure sharing - in production, implement proper token generation
  const token = btoa(`${reportId}-${Date.now()}-${Math.random()}`);
  const baseUrl = window.location.origin;

  return `${baseUrl}/reports/share/${token}?expires=${expirationHours}h`;
};

// Download handlers
export const downloadReport = (
  data: Uint8Array | string,
  filename: string,
  type: "pdf" | "excel" | "csv",
) => {
  const mimeTypes = {
    pdf: "application/pdf",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  };

  const blobData: BlobPart[] = typeof data === "string" ? [data] : [data as unknown as ArrayBuffer];
  const blob = new Blob(blobData, { type: mimeTypes[type] });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
