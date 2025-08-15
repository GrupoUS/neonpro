/**
 * LGPD Legal Documentation Automation System
 * Implements automated generation and management of legal documentation for LGPD compliance
 *
 * Features:
 * - Automated privacy policy generation
 * - Data processing records (ROPA)
 * - Consent documentation
 * - Data subject rights procedures
 * - Incident response documentation
 * - Compliance reports and certificates
 * - Legal template management
 * - Multi-language support
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { EventEmitter } from 'node:events';

// ============================================================================
// LEGAL DOCUMENTATION TYPES & INTERFACES
// ============================================================================

/**
 * Document Types
 */
export enum DocumentType {
  PRIVACY_POLICY = 'privacy_policy',
  COOKIE_POLICY = 'cookie_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  DATA_PROCESSING_RECORD = 'data_processing_record',
  CONSENT_FORM = 'consent_form',
  DATA_SUBJECT_RIGHTS = 'data_subject_rights',
  INCIDENT_RESPONSE = 'incident_response',
  COMPLIANCE_REPORT = 'compliance_report',
  IMPACT_ASSESSMENT = 'impact_assessment',
  VENDOR_AGREEMENT = 'vendor_agreement',
  TRAINING_MATERIAL = 'training_material',
  AUDIT_REPORT = 'audit_report',
}

/**
 * Document Status
 */
export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REQUIRES_UPDATE = 'requires_update',
}

/**
 * Document Language
 */
export enum DocumentLanguage {
  PT_BR = 'pt-BR',
  EN_US = 'en-US',
  ES_ES = 'es-ES',
  FR_FR = 'fr-FR',
}

/**
 * Legal Framework
 */
export enum LegalFramework {
  LGPD = 'LGPD',
  GDPR = 'GDPR',
  CCPA = 'CCPA',
  PIPEDA = 'PIPEDA',
}

/**
 * Document Template
 */
export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  framework: LegalFramework;
  language: DocumentLanguage;
  version: string;

  // Template structure
  structure: {
    sections: {
      id: string;
      title: string;
      required: boolean;
      order: number;
      subsections?: {
        id: string;
        title: string;
        required: boolean;
        order: number;
      }[];
    }[];
    variables: {
      name: string;
      type: 'text' | 'date' | 'number' | 'boolean' | 'list' | 'object';
      required: boolean;
      description: string;
      defaultValue?: any;
      validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
      };
    }[];
  };

  // Template content
  content: {
    header?: string;
    footer?: string;
    sections: {
      sectionId: string;
      content: string; // Template with variables like {{variable_name}}
      conditionalContent?: {
        condition: string; // JavaScript expression
        content: string;
      }[];
    }[];
    styling?: {
      css?: string;
      formatting?: Record<string, any>;
    };
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Legal Document
 */
export interface LegalDocument {
  id: string;
  name: string;
  type: DocumentType;
  templateId: string;
  language: DocumentLanguage;
  version: string;
  status: DocumentStatus;

  // Document data
  data: {
    variables: Record<string, any>;
    organizationInfo: {
      name: string;
      legalName: string;
      cnpj?: string;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      contact: {
        email: string;
        phone: string;
        website?: string;
      };
      dpo?: {
        name: string;
        email: string;
        phone?: string;
      };
    };
    processingActivities?: {
      id: string;
      name: string;
      purpose: string;
      legalBasis: string;
      dataTypes: string[];
      retention: string;
      recipients: string[];
    }[];
  };

  // Generated content
  content: {
    html: string;
    markdown: string;
    pdf?: Buffer;
    lastGenerated: Date;
  };

  // Workflow
  workflow: {
    reviewers: {
      role: string;
      name: string;
      status: 'pending' | 'approved' | 'rejected' | 'conditional';
      comments?: string;
      reviewedAt?: Date;
    }[];
    approver?: {
      name: string;
      approvedAt?: Date;
      conditions?: string[];
    };
    publishedBy?: string;
    publishedAt?: Date;
  };

  // Compliance tracking
  compliance: {
    framework: LegalFramework;
    requirements: {
      article: string;
      requirement: string;
      satisfied: boolean;
      evidence?: string;
    }[];
    lastAudit?: Date;
    nextReview: Date;
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

/**
 * Document Generation Request
 */
export interface DocumentGenerationRequest {
  templateId: string;
  name: string;
  language: DocumentLanguage;
  data: {
    variables: Record<string, any>;
    organizationInfo: LegalDocument['data']['organizationInfo'];
    processingActivities?: LegalDocument['data']['processingActivities'];
  };
  options?: {
    generatePdf: boolean;
    includeToc: boolean;
    includeSignature: boolean;
    watermark?: string;
  };
}

/**
 * Compliance Report
 */
export interface ComplianceReport {
  id: string;
  name: string;
  type: 'periodic' | 'audit' | 'incident' | 'assessment';
  framework: LegalFramework;
  period: {
    start: Date;
    end: Date;
  };

  // Report content
  content: {
    executiveSummary: string;
    complianceStatus: {
      overall: number; // percentage
      byCategory: {
        category: string;
        status: number;
        issues: number;
      }[];
    };
    findings: {
      id: string;
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
      status: 'open' | 'in_progress' | 'resolved';
      dueDate?: Date;
    }[];
    metrics: {
      dataSubjectRequests: number;
      incidentsReported: number;
      consentWithdrawals: number;
      trainingCompleted: number;
      auditsPerformed: number;
    };
    recommendations: {
      priority: 'low' | 'medium' | 'high' | 'critical';
      recommendation: string;
      effort: 'low' | 'medium' | 'high';
      timeline: string;
      responsible: string;
    }[];
  };

  // Generation info
  generatedBy: string;
  generatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Documentation Events
 */
export interface DocumentationEvents {
  'document:created': { document: LegalDocument };
  'document:updated': { document: LegalDocument };
  'document:approved': { document: LegalDocument };
  'document:published': { document: LegalDocument };
  'document:archived': { document: LegalDocument };
  'template:created': { template: DocumentTemplate };
  'template:updated': { template: DocumentTemplate };
  'report:generated': { report: ComplianceReport };
  'review:due': { document: LegalDocument };
}

// ============================================================================
// LEGAL DOCUMENTATION SYSTEM
// ============================================================================

/**
 * Legal Documentation Manager
 *
 * Implements automated legal documentation including:
 * - Template management and customization
 * - Document generation and versioning
 * - Compliance tracking and reporting
 * - Multi-language support
 * - Approval workflows
 * - Automated updates and notifications
 */
export class LegalDocumentationManager extends EventEmitter {
  private readonly documents: Map<string, LegalDocument> = new Map();
  private readonly templates: Map<string, DocumentTemplate> = new Map();
  private readonly reports: Map<string, ComplianceReport> = new Map();
  private isInitialized = false;
  private reviewCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: {
      defaultLanguage: DocumentLanguage;
      autoGeneration: boolean;
      pdfGeneration: boolean;
      reviewFrequencyDays: number;
      approvalRequired: boolean;
      versionControl: boolean;
      notificationEnabled: boolean;
    } = {
      defaultLanguage: DocumentLanguage.PT_BR,
      autoGeneration: true,
      pdfGeneration: true,
      reviewFrequencyDays: 365,
      approvalRequired: true,
      versionControl: true,
      notificationEnabled: true,
    }
  ) {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Initialize the legal documentation system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load templates and documents
      await this.loadTemplates();
      await this.loadDocuments();
      await this.loadReports();

      // Initialize default templates
      await this.initializeDefaultTemplates();

      // Start review monitoring
      this.startReviewMonitoring();

      this.isInitialized = true;
      this.logActivity('system', 'documentation_initialized', {
        templatesLoaded: this.templates.size,
        documentsLoaded: this.documents.size,
        reportsLoaded: this.reports.size,
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize legal documentation system: ${error}`
      );
    }
  }

  /**
   * Create document template
   */
  async createTemplate(
    templateData: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DocumentTemplate> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const template: DocumentTemplate = {
      ...templateData,
      id: this.generateId('template'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate template
    this.validateTemplate(template);

    this.templates.set(template.id, template);
    await this.saveTemplate(template);

    this.emit('template:created', { template });

    this.logActivity('user', 'template_created', {
      templateId: template.id,
      name: template.name,
      type: template.type,
      framework: template.framework,
      language: template.language,
      createdBy: template.createdBy,
    });

    return template;
  }

  /**
   * Generate legal document
   */
  async generateDocument(
    request: DocumentGenerationRequest,
    createdBy: string
  ): Promise<LegalDocument> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const template = this.templates.get(request.templateId);
    if (!template) {
      throw new Error(`Template not found: ${request.templateId}`);
    }

    // Validate request data
    this.validateGenerationRequest(request, template);

    const document: LegalDocument = {
      id: this.generateId('document'),
      name: request.name,
      type: template.type,
      templateId: request.templateId,
      language: request.language,
      version: '1.0.0',
      status: DocumentStatus.DRAFT,
      data: request.data,
      content: {
        html: '',
        markdown: '',
        lastGenerated: new Date(),
      },
      workflow: {
        reviewers: [],
      },
      compliance: {
        framework: template.framework,
        requirements: [],
        nextReview: new Date(
          Date.now() + this.config.reviewFrequencyDays * 24 * 60 * 60 * 1000
        ),
      },
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate content
    await this.generateDocumentContent(document, template, request.options);

    // Set up compliance requirements
    document.compliance.requirements = this.generateComplianceRequirements(
      template.framework
    );

    // Set up approval workflow if required
    if (this.config.approvalRequired) {
      document.workflow.reviewers = this.getDefaultReviewers(template.type);
    }

    this.documents.set(document.id, document);
    await this.saveDocument(document);

    this.emit('document:created', { document });

    this.logActivity('user', 'document_generated', {
      documentId: document.id,
      name: document.name,
      type: document.type,
      templateId: request.templateId,
      language: request.language,
      createdBy,
    });

    return document;
  }

  /**
   * Generate document content
   */
  private async generateDocumentContent(
    document: LegalDocument,
    template: DocumentTemplate,
    options?: DocumentGenerationRequest['options']
  ): Promise<void> {
    let html = '';
    let markdown = '';

    // Add header
    if (template.content.header) {
      const headerHtml = this.processTemplate(
        template.content.header,
        document.data.variables,
        document.data
      );
      html += headerHtml;
      markdown += this.htmlToMarkdown(headerHtml);
    }

    // Add table of contents if requested
    if (options?.includeToc) {
      const tocHtml = this.generateTableOfContents(template);
      html += tocHtml;
      markdown += this.htmlToMarkdown(tocHtml);
    }

    // Process sections
    for (const section of template.structure.sections.sort(
      (a, b) => a.order - b.order
    )) {
      const sectionContent = template.content.sections.find(
        (s) => s.sectionId === section.id
      );
      if (!sectionContent) {
        continue;
      }

      // Process main section content
      let sectionHtml = `<section id="${section.id}">\n<h2>${section.title}</h2>\n`;
      let sectionMarkdown = `## ${section.title}\n\n`;

      const processedContent = this.processTemplate(
        sectionContent.content,
        document.data.variables,
        document.data
      );
      sectionHtml += processedContent;
      sectionMarkdown += this.htmlToMarkdown(processedContent);

      // Process conditional content
      if (sectionContent.conditionalContent) {
        for (const conditional of sectionContent.conditionalContent) {
          if (
            this.evaluateCondition(
              conditional.condition,
              document.data.variables,
              document.data
            )
          ) {
            const conditionalHtml = this.processTemplate(
              conditional.content,
              document.data.variables,
              document.data
            );
            sectionHtml += conditionalHtml;
            sectionMarkdown += this.htmlToMarkdown(conditionalHtml);
          }
        }
      }

      sectionHtml += '</section>\n';
      sectionMarkdown += '\n';

      html += sectionHtml;
      markdown += sectionMarkdown;
    }

    // Add footer
    if (template.content.footer) {
      const footerHtml = this.processTemplate(
        template.content.footer,
        document.data.variables,
        document.data
      );
      html += footerHtml;
      markdown += this.htmlToMarkdown(footerHtml);
    }

    // Add signature if requested
    if (options?.includeSignature) {
      const signatureHtml = this.generateSignatureSection(document);
      html += signatureHtml;
      markdown += this.htmlToMarkdown(signatureHtml);
    }

    // Apply styling
    if (template.content.styling?.css) {
      html = `<style>${template.content.styling.css}</style>\n${html}`;
    }

    // Add watermark if requested
    if (options?.watermark) {
      html = this.addWatermark(html, options.watermark);
    }

    document.content.html = html;
    document.content.markdown = markdown;

    // Generate PDF if requested
    if (options?.generatePdf && this.config.pdfGeneration) {
      document.content.pdf = await this.generatePdf(html);
    }

    document.content.lastGenerated = new Date();
  }

  /**
   * Process template with variables
   */
  private processTemplate(
    template: string,
    variables: Record<string, any>,
    context: LegalDocument['data']
  ): string {
    let processed = template;

    // Replace simple variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }

    // Replace organization info
    const orgInfo = context.organizationInfo;
    processed = processed.replace(
      /{{\s*organization\.name\s*}}/g,
      orgInfo.name || ''
    );
    processed = processed.replace(
      /{{\s*organization\.legalName\s*}}/g,
      orgInfo.legalName || ''
    );
    processed = processed.replace(
      /{{\s*organization\.cnpj\s*}}/g,
      orgInfo.cnpj || ''
    );
    processed = processed.replace(
      /{{\s*organization\.email\s*}}/g,
      orgInfo.contact.email || ''
    );
    processed = processed.replace(
      /{{\s*organization\.phone\s*}}/g,
      orgInfo.contact.phone || ''
    );
    processed = processed.replace(
      /{{\s*organization\.website\s*}}/g,
      orgInfo.contact.website || ''
    );

    // Replace DPO info if available
    if (orgInfo.dpo) {
      processed = processed.replace(
        /{{\s*dpo\.name\s*}}/g,
        orgInfo.dpo.name || ''
      );
      processed = processed.replace(
        /{{\s*dpo\.email\s*}}/g,
        orgInfo.dpo.email || ''
      );
      processed = processed.replace(
        /{{\s*dpo\.phone\s*}}/g,
        orgInfo.dpo.phone || ''
      );
    }

    // Replace address info
    const address = orgInfo.address;
    processed = processed.replace(
      /{{\s*address\.street\s*}}/g,
      address.street || ''
    );
    processed = processed.replace(
      /{{\s*address\.city\s*}}/g,
      address.city || ''
    );
    processed = processed.replace(
      /{{\s*address\.state\s*}}/g,
      address.state || ''
    );
    processed = processed.replace(
      /{{\s*address\.zipCode\s*}}/g,
      address.zipCode || ''
    );
    processed = processed.replace(
      /{{\s*address\.country\s*}}/g,
      address.country || ''
    );

    // Replace processing activities if available
    if (context.processingActivities) {
      const activitiesList = context.processingActivities
        .map(
          (activity) =>
            `<li><strong>${activity.name}</strong>: ${activity.purpose}</li>`
        )
        .join('\n');
      processed = processed.replace(
        /{{\s*processingActivities\s*}}/g,
        `<ul>\n${activitiesList}\n</ul>`
      );
    }

    // Replace dates
    const now = new Date();
    processed = processed.replace(
      /{{\s*currentDate\s*}}/g,
      now.toLocaleDateString('pt-BR')
    );
    processed = processed.replace(
      /{{\s*currentYear\s*}}/g,
      now.getFullYear().toString()
    );

    return processed;
  }

  /**
   * Evaluate conditional expression
   */
  private evaluateCondition(
    condition: string,
    variables: Record<string, any>,
    context: LegalDocument['data']
  ): boolean {
    try {
      // Create safe evaluation context
      const evalContext = {
        ...variables,
        organization: context.organizationInfo,
        processingActivities: context.processingActivities || [],
        hasProcessingActivities:
          (context.processingActivities?.length || 0) > 0,
        hasDPO: Boolean(context.organizationInfo.dpo),
      };

      // Simple condition evaluation (in production, use a safer expression evaluator)
      const func = new Function(
        ...Object.keys(evalContext),
        `return ${condition}`
      );
      return func(...Object.values(evalContext));
    } catch (error) {
      console.warn(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(template: DocumentTemplate): string {
    const sections = template.structure.sections
      .sort((a, b) => a.order - b.order)
      .map((section) => {
        let html = `<li><a href="#${section.id}">${section.title}</a>`;

        if (section.subsections && section.subsections.length > 0) {
          const subsections = section.subsections
            .sort((a, b) => a.order - b.order)
            .map((sub) => `<li><a href="#${sub.id}">${sub.title}</a></li>`)
            .join('\n');
          html += `\n<ul>\n${subsections}\n</ul>`;
        }

        html += '</li>';
        return html;
      })
      .join('\n');

    return `<div class="table-of-contents">\n<h2>Índice</h2>\n<ul>\n${sections}\n</ul>\n</div>\n`;
  }

  /**
   * Generate signature section
   */
  private generateSignatureSection(document: LegalDocument): string {
    const orgInfo = document.data.organizationInfo;
    const currentDate = new Date().toLocaleDateString('pt-BR');

    return `
<div class="signature-section">
<h3>Assinatura e Aprovação</h3>
<p>Este documento foi aprovado e é válido a partir de ${currentDate}.</p>
<div class="signature-block">
<p><strong>Organização:</strong> ${orgInfo.legalName}</p>
<p><strong>CNPJ:</strong> ${orgInfo.cnpj || 'N/A'}</p>
${orgInfo.dpo ? `<p><strong>Encarregado de Dados:</strong> ${orgInfo.dpo.name}</p>` : ''}
<p><strong>Data de Aprovação:</strong> ${currentDate}</p>
</div>
</div>
`;
  }

  /**
   * Add watermark to HTML
   */
  private addWatermark(html: string, watermark: string): string {
    const watermarkStyle = `
<style>
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 72px;
  color: rgba(0, 0, 0, 0.1);
  z-index: -1;
  pointer-events: none;
}
</style>
`;

    const watermarkDiv = `<div class="watermark">${watermark}</div>`;

    return watermarkStyle + html + watermarkDiv;
  }

  /**
   * Convert HTML to Markdown (simplified)
   */
  private htmlToMarkdown(html: string): string {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
      .trim();
  }

  /**
   * Generate PDF from HTML
   */
  private async generatePdf(html: string): Promise<Buffer> {
    // In a real implementation, this would use a PDF generation library like Puppeteer
    // For now, return a placeholder
    return Buffer.from(`PDF content for: ${html.substring(0, 100)}...`);
  }

  /**
   * Generate compliance requirements
   */
  private generateComplianceRequirements(
    framework: LegalFramework
  ): LegalDocument['compliance']['requirements'] {
    const requirements: Record<
      LegalFramework,
      LegalDocument['compliance']['requirements']
    > = {
      [LegalFramework.LGPD]: [
        {
          article: 'Art. 8º',
          requirement: 'Consentimento livre, informado e inequívoco',
          satisfied: false,
        },
        {
          article: 'Art. 9º',
          requirement: 'Direitos dos titulares de dados',
          satisfied: false,
        },
        {
          article: 'Art. 18',
          requirement: 'Direito de acesso aos dados',
          satisfied: false,
        },
        {
          article: 'Art. 46',
          requirement: 'Medidas de segurança técnicas e administrativas',
          satisfied: false,
        },
      ],
      [LegalFramework.GDPR]: [
        {
          article: 'Art. 7',
          requirement: 'Conditions for consent',
          satisfied: false,
        },
        {
          article: 'Art. 13-14',
          requirement: 'Information to be provided',
          satisfied: false,
        },
        {
          article: 'Art. 15-22',
          requirement: 'Rights of the data subject',
          satisfied: false,
        },
      ],
      [LegalFramework.CCPA]: [
        {
          article: 'Section 1798.100',
          requirement: 'Right to know about personal information',
          satisfied: false,
        },
        {
          article: 'Section 1798.105',
          requirement: 'Right to delete personal information',
          satisfied: false,
        },
      ],
      [LegalFramework.PIPEDA]: [
        {
          article: 'Principle 3',
          requirement: 'Consent',
          satisfied: false,
        },
        {
          article: 'Principle 8',
          requirement: 'Openness',
          satisfied: false,
        },
      ],
    };

    return requirements[framework] || [];
  }

  /**
   * Get default reviewers for document type
   */
  private getDefaultReviewers(
    type: DocumentType
  ): LegalDocument['workflow']['reviewers'] {
    const reviewerMap: Record<
      DocumentType,
      LegalDocument['workflow']['reviewers']
    > = {
      [DocumentType.PRIVACY_POLICY]: [
        { role: 'Legal Counsel', name: '', status: 'pending' },
        { role: 'DPO', name: '', status: 'pending' },
      ],
      [DocumentType.COOKIE_POLICY]: [
        { role: 'Legal Counsel', name: '', status: 'pending' },
      ],
      [DocumentType.TERMS_OF_SERVICE]: [
        { role: 'Legal Counsel', name: '', status: 'pending' },
        { role: 'Business Owner', name: '', status: 'pending' },
      ],
      [DocumentType.DATA_PROCESSING_RECORD]: [
        { role: 'DPO', name: '', status: 'pending' },
        { role: 'IT Manager', name: '', status: 'pending' },
      ],
      [DocumentType.CONSENT_FORM]: [
        { role: 'Legal Counsel', name: '', status: 'pending' },
        { role: 'DPO', name: '', status: 'pending' },
      ],
      [DocumentType.DATA_SUBJECT_RIGHTS]: [
        { role: 'DPO', name: '', status: 'pending' },
      ],
      [DocumentType.INCIDENT_RESPONSE]: [
        { role: 'IT Security Manager', name: '', status: 'pending' },
        { role: 'DPO', name: '', status: 'pending' },
      ],
      [DocumentType.COMPLIANCE_REPORT]: [
        { role: 'Compliance Officer', name: '', status: 'pending' },
      ],
      [DocumentType.IMPACT_ASSESSMENT]: [
        { role: 'DPO', name: '', status: 'pending' },
        { role: 'Legal Counsel', name: '', status: 'pending' },
      ],
      [DocumentType.VENDOR_AGREEMENT]: [
        { role: 'Legal Counsel', name: '', status: 'pending' },
        { role: 'Procurement Manager', name: '', status: 'pending' },
      ],
      [DocumentType.TRAINING_MATERIAL]: [
        { role: 'HR Manager', name: '', status: 'pending' },
        { role: 'DPO', name: '', status: 'pending' },
      ],
      [DocumentType.AUDIT_REPORT]: [
        { role: 'Audit Manager', name: '', status: 'pending' },
        { role: 'DPO', name: '', status: 'pending' },
      ],
    };

    return reviewerMap[type] || [];
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportData: Omit<ComplianceReport, 'id' | 'generatedAt' | 'generatedBy'>,
    generatedBy: string
  ): Promise<ComplianceReport> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const report: ComplianceReport = {
      ...reportData,
      id: this.generateId('report'),
      generatedBy,
      generatedAt: new Date(),
    };

    this.reports.set(report.id, report);
    await this.saveReport(report);

    this.emit('report:generated', { report });

    this.logActivity('user', 'report_generated', {
      reportId: report.id,
      name: report.name,
      type: report.type,
      framework: report.framework,
      period: report.period,
      generatedBy,
    });

    return report;
  }

  /**
   * Initialize default templates
   */
  private async initializeDefaultTemplates(): Promise<void> {
    // Check if default templates already exist
    const existingTemplates = Array.from(this.templates.values());
    const hasPrivacyPolicy = existingTemplates.some(
      (t) => t.type === DocumentType.PRIVACY_POLICY
    );

    if (!hasPrivacyPolicy) {
      await this.createDefaultPrivacyPolicyTemplate();
    }

    // Add more default templates as needed
  }

  /**
   * Create default privacy policy template
   */
  private async createDefaultPrivacyPolicyTemplate(): Promise<void> {
    const template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Política de Privacidade LGPD - Padrão',
      type: DocumentType.PRIVACY_POLICY,
      framework: LegalFramework.LGPD,
      language: DocumentLanguage.PT_BR,
      version: '1.0.0',
      structure: {
        sections: [
          {
            id: 'introduction',
            title: 'Introdução',
            required: true,
            order: 1,
          },
          {
            id: 'data_collection',
            title: 'Coleta de Dados',
            required: true,
            order: 2,
          },
          {
            id: 'data_usage',
            title: 'Uso dos Dados',
            required: true,
            order: 3,
          },
          {
            id: 'data_sharing',
            title: 'Compartilhamento de Dados',
            required: true,
            order: 4,
          },
          {
            id: 'data_rights',
            title: 'Direitos dos Titulares',
            required: true,
            order: 5,
          },
          {
            id: 'security',
            title: 'Segurança',
            required: true,
            order: 6,
          },
          {
            id: 'contact',
            title: 'Contato',
            required: true,
            order: 7,
          },
        ],
        variables: [
          {
            name: 'companyName',
            type: 'text',
            required: true,
            description: 'Nome da empresa',
          },
          {
            name: 'websiteUrl',
            type: 'text',
            required: false,
            description: 'URL do website',
          },
          {
            name: 'dataRetentionPeriod',
            type: 'text',
            required: true,
            description: 'Período de retenção de dados',
          },
        ],
      },
      content: {
        header: '<h1>Política de Privacidade - {{organization.name}}</h1>',
        sections: [
          {
            sectionId: 'introduction',
            content: `<p>A {{organization.name}} está comprometida com a proteção da privacidade e dos dados pessoais de nossos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).</p>
<p>Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.</p>`,
          },
          {
            sectionId: 'data_collection',
            content: `<p>Coletamos dados pessoais quando você:</p>
<ul>
<li>Utiliza nossos serviços</li>
<li>Cria uma conta em nossa plataforma</li>
<li>Entra em contato conosco</li>
<li>Navega em nosso website</li>
</ul>`,
          },
          {
            sectionId: 'data_usage',
            content: `<p>Utilizamos seus dados pessoais para:</p>
<ul>
<li>Fornecer e melhorar nossos serviços</li>
<li>Comunicar-nos com você</li>
<li>Cumprir obrigações legais</li>
<li>Proteger nossos direitos e interesses legítimos</li>
</ul>`,
          },
          {
            sectionId: 'data_sharing',
            content: `<p>Não compartilhamos seus dados pessoais com terceiros, exceto:</p>
<ul>
<li>Quando necessário para prestação do serviço</li>
<li>Com seu consentimento explícito</li>
<li>Para cumprimento de obrigações legais</li>
<li>Para proteção de direitos, propriedade ou segurança</li>
</ul>`,
          },
          {
            sectionId: 'data_rights',
            content: `<p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
<ul>
<li>Confirmação da existência de tratamento</li>
<li>Acesso aos dados</li>
<li>Correção de dados incompletos, inexatos ou desatualizados</li>
<li>Anonimização, bloqueio ou eliminação</li>
<li>Portabilidade dos dados</li>
<li>Eliminação dos dados tratados com consentimento</li>
<li>Informação sobre compartilhamento</li>
<li>Revogação do consentimento</li>
</ul>`,
          },
          {
            sectionId: 'security',
            content:
              '<p>Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>',
          },
          {
            sectionId: 'contact',
            content: `<p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:</p>
<ul>
<li>Email: {{organization.email}}</li>
<li>Telefone: {{organization.phone}}</li>
{{#if dpo}}<li>Encarregado de Dados: {{dpo.name}} - {{dpo.email}}</li>{{/if}}
</ul>`,
          },
        ],
        footer: '<p><em>Última atualização: {{currentDate}}</em></p>',
      },
      createdBy: 'System',
      approvedBy: 'System',
      approvedAt: new Date(),
    };

    await this.createTemplate(template);
  }

  /**
   * Validate template
   */
  private validateTemplate(template: DocumentTemplate): void {
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (
      !template.structure.sections ||
      template.structure.sections.length === 0
    ) {
      throw new Error('Template must have at least one section');
    }

    if (!template.content.sections || template.content.sections.length === 0) {
      throw new Error('Template must have content for sections');
    }
  }

  /**
   * Validate generation request
   */
  private validateGenerationRequest(
    request: DocumentGenerationRequest,
    template: DocumentTemplate
  ): void {
    // Check required variables
    for (const variable of template.structure.variables) {
      if (variable.required && !request.data.variables[variable.name]) {
        throw new Error(`Required variable missing: ${variable.name}`);
      }
    }

    // Validate organization info
    if (!request.data.organizationInfo.name) {
      throw new Error('Organization name is required');
    }

    if (!request.data.organizationInfo.contact.email) {
      throw new Error('Organization email is required');
    }
  }

  /**
   * Start review monitoring
   */
  private startReviewMonitoring(): void {
    this.reviewCheckInterval = setInterval(
      async () => {
        await this.checkDueReviews();
      },
      24 * 60 * 60 * 1000
    ); // Daily check
  }

  /**
   * Check for due reviews
   */
  private async checkDueReviews(): Promise<void> {
    const now = new Date();

    for (const document of this.documents.values()) {
      if (
        document.compliance.nextReview <= now &&
        document.status === DocumentStatus.PUBLISHED
      ) {
        document.status = DocumentStatus.REQUIRES_UPDATE;
        await this.saveDocument(document);

        this.emit('review:due', { document });

        this.logActivity('system', 'review_due', {
          documentId: document.id,
          name: document.name,
          nextReview: document.compliance.nextReview,
        });
      }
    }
  }

  /**
   * Get documents with filtering
   */
  getDocuments(filters?: {
    type?: DocumentType;
    status?: DocumentStatus;
    language?: DocumentLanguage;
    framework?: LegalFramework;
  }): LegalDocument[] {
    let documents = Array.from(this.documents.values());

    if (filters) {
      if (filters.type) {
        documents = documents.filter((d) => d.type === filters.type);
      }
      if (filters.status) {
        documents = documents.filter((d) => d.status === filters.status);
      }
      if (filters.language) {
        documents = documents.filter((d) => d.language === filters.language);
      }
      if (filters.framework) {
        documents = documents.filter(
          (d) => d.compliance.framework === filters.framework
        );
      }
    }

    return documents.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Get templates with filtering
   */
  getTemplates(filters?: {
    type?: DocumentType;
    framework?: LegalFramework;
    language?: DocumentLanguage;
  }): DocumentTemplate[] {
    let templates = Array.from(this.templates.values());

    if (filters) {
      if (filters.type) {
        templates = templates.filter((t) => t.type === filters.type);
      }
      if (filters.framework) {
        templates = templates.filter((t) => t.framework === filters.framework);
      }
      if (filters.language) {
        templates = templates.filter((t) => t.language === filters.language);
      }
    }

    return templates.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Get reports with filtering
   */
  getReports(filters?: {
    type?: ComplianceReport['type'];
    framework?: LegalFramework;
    dateRange?: { start: Date; end: Date };
  }): ComplianceReport[] {
    let reports = Array.from(this.reports.values());

    if (filters) {
      if (filters.type) {
        reports = reports.filter((r) => r.type === filters.type);
      }
      if (filters.framework) {
        reports = reports.filter((r) => r.framework === filters.framework);
      }
      if (filters.dateRange) {
        reports = reports.filter(
          (r) =>
            r.generatedAt >= filters.dateRange?.start &&
            r.generatedAt <= filters.dateRange?.end
        );
      }
    }

    return reports.sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
    );
  }

  /**
   * Generate ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load templates
   */
  private async loadTemplates(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Load documents
   */
  private async loadDocuments(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Load reports
   */
  private async loadReports(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Save template
   */
  private async saveTemplate(_template: DocumentTemplate): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Save document
   */
  private async saveDocument(_document: LegalDocument): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Save report
   */
  private async saveReport(_report: ComplianceReport): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Log activity
   */
  private logActivity(
    actor: string,
    action: string,
    details: Record<string, any>
  ): void {
    // In a real implementation, this would log to audit trail
    console.log(`[LegalDocumentation] ${actor} - ${action}:`, details);
  }

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    if (this.reviewCheckInterval) {
      clearInterval(this.reviewCheckInterval);
      this.reviewCheckInterval = null;
    }

    this.removeAllListeners();
    this.isInitialized = false;

    this.logActivity('system', 'documentation_shutdown', {
      timestamp: new Date(),
    });
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const issues: string[] = [];

    if (!this.isInitialized) {
      issues.push('Legal documentation system not initialized');
    }

    if (!this.reviewCheckInterval) {
      issues.push('Review monitoring not running');
    }

    const dueReviews = Array.from(this.documents.values()).filter(
      (d) =>
        d.compliance.nextReview <= new Date() &&
        d.status === DocumentStatus.PUBLISHED
    );

    if (dueReviews.length > 0) {
      issues.push(`${dueReviews.length} documents require review`);
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        documentsCount: this.documents.size,
        templatesCount: this.templates.size,
        reportsCount: this.reports.size,
        dueReviews: dueReviews.length,
        autoGeneration: this.config.autoGeneration,
        pdfGeneration: this.config.pdfGeneration,
        issues,
      },
    };
  }
}

/**
 * Default legal documentation manager instance
 */
export const legalDocumentationManager = new LegalDocumentationManager();

/**
 * Export types for external use
 */
export type {
  LegalDocument,
  DocumentTemplate,
  ComplianceReport,
  DocumentGenerationRequest,
  DocumentationEvents,
};
