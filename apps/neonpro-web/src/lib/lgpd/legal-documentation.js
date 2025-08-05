"use strict";
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
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.legalDocumentationManager =
  exports.LegalDocumentationManager =
  exports.LegalFramework =
  exports.DocumentLanguage =
  exports.DocumentStatus =
  exports.DocumentType =
    void 0;
var events_1 = require("events");
// ============================================================================
// LEGAL DOCUMENTATION TYPES & INTERFACES
// ============================================================================
/**
 * Document Types
 */
var DocumentType;
(function (DocumentType) {
  DocumentType["PRIVACY_POLICY"] = "privacy_policy";
  DocumentType["COOKIE_POLICY"] = "cookie_policy";
  DocumentType["TERMS_OF_SERVICE"] = "terms_of_service";
  DocumentType["DATA_PROCESSING_RECORD"] = "data_processing_record";
  DocumentType["CONSENT_FORM"] = "consent_form";
  DocumentType["DATA_SUBJECT_RIGHTS"] = "data_subject_rights";
  DocumentType["INCIDENT_RESPONSE"] = "incident_response";
  DocumentType["COMPLIANCE_REPORT"] = "compliance_report";
  DocumentType["IMPACT_ASSESSMENT"] = "impact_assessment";
  DocumentType["VENDOR_AGREEMENT"] = "vendor_agreement";
  DocumentType["TRAINING_MATERIAL"] = "training_material";
  DocumentType["AUDIT_REPORT"] = "audit_report";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
/**
 * Document Status
 */
var DocumentStatus;
(function (DocumentStatus) {
  DocumentStatus["DRAFT"] = "draft";
  DocumentStatus["UNDER_REVIEW"] = "under_review";
  DocumentStatus["APPROVED"] = "approved";
  DocumentStatus["PUBLISHED"] = "published";
  DocumentStatus["ARCHIVED"] = "archived";
  DocumentStatus["REQUIRES_UPDATE"] = "requires_update";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
/**
 * Document Language
 */
var DocumentLanguage;
(function (DocumentLanguage) {
  DocumentLanguage["PT_BR"] = "pt-BR";
  DocumentLanguage["EN_US"] = "en-US";
  DocumentLanguage["ES_ES"] = "es-ES";
  DocumentLanguage["FR_FR"] = "fr-FR";
})(DocumentLanguage || (exports.DocumentLanguage = DocumentLanguage = {}));
/**
 * Legal Framework
 */
var LegalFramework;
(function (LegalFramework) {
  LegalFramework["LGPD"] = "LGPD";
  LegalFramework["GDPR"] = "GDPR";
  LegalFramework["CCPA"] = "CCPA";
  LegalFramework["PIPEDA"] = "PIPEDA";
})(LegalFramework || (exports.LegalFramework = LegalFramework = {}));
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
var LegalDocumentationManager = /** @class */ (function (_super) {
  __extends(LegalDocumentationManager, _super);
  function LegalDocumentationManager(config) {
    if (config === void 0) {
      config = {
        defaultLanguage: DocumentLanguage.PT_BR,
        autoGeneration: true,
        pdfGeneration: true,
        reviewFrequencyDays: 365,
        approvalRequired: true,
        versionControl: true,
        notificationEnabled: true,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.documents = new Map();
    _this.templates = new Map();
    _this.reports = new Map();
    _this.isInitialized = false;
    _this.reviewCheckInterval = null;
    _this.setMaxListeners(50);
    return _this;
  }
  /**
   * Initialize the legal documentation system
   */
  LegalDocumentationManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            // Load templates and documents
            return [4 /*yield*/, this.loadTemplates()];
          case 2:
            // Load templates and documents
            _a.sent();
            return [4 /*yield*/, this.loadDocuments()];
          case 3:
            _a.sent();
            return [4 /*yield*/, this.loadReports()];
          case 4:
            _a.sent();
            // Initialize default templates
            return [4 /*yield*/, this.initializeDefaultTemplates()];
          case 5:
            // Initialize default templates
            _a.sent();
            // Start review monitoring
            this.startReviewMonitoring();
            this.isInitialized = true;
            this.logActivity("system", "documentation_initialized", {
              templatesLoaded: this.templates.size,
              documentsLoaded: this.documents.size,
              reportsLoaded: this.reports.size,
            });
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            throw new Error("Failed to initialize legal documentation system: ".concat(error_1));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create document template
   */
  LegalDocumentationManager.prototype.createTemplate = function (templateData) {
    return __awaiter(this, void 0, void 0, function () {
      var template;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            template = __assign(__assign({}, templateData), {
              id: this.generateId("template"),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Validate template
            this.validateTemplate(template);
            this.templates.set(template.id, template);
            return [4 /*yield*/, this.saveTemplate(template)];
          case 3:
            _a.sent();
            this.emit("template:created", { template: template });
            this.logActivity("user", "template_created", {
              templateId: template.id,
              name: template.name,
              type: template.type,
              framework: template.framework,
              language: template.language,
              createdBy: template.createdBy,
            });
            return [2 /*return*/, template];
        }
      });
    });
  };
  /**
   * Generate legal document
   */
  LegalDocumentationManager.prototype.generateDocument = function (request, createdBy) {
    return __awaiter(this, void 0, void 0, function () {
      var template, document;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            template = this.templates.get(request.templateId);
            if (!template) {
              throw new Error("Template not found: ".concat(request.templateId));
            }
            // Validate request data
            this.validateGenerationRequest(request, template);
            document = {
              id: this.generateId("document"),
              name: request.name,
              type: template.type,
              templateId: request.templateId,
              language: request.language,
              version: "1.0.0",
              status: DocumentStatus.DRAFT,
              data: request.data,
              content: {
                html: "",
                markdown: "",
                lastGenerated: new Date(),
              },
              workflow: {
                reviewers: [],
              },
              compliance: {
                framework: template.framework,
                requirements: [],
                nextReview: new Date(
                  Date.now() + this.config.reviewFrequencyDays * 24 * 60 * 60 * 1000,
                ),
              },
              createdBy: createdBy,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            // Generate content
            return [4 /*yield*/, this.generateDocumentContent(document, template, request.options)];
          case 3:
            // Generate content
            _a.sent();
            // Set up compliance requirements
            document.compliance.requirements = this.generateComplianceRequirements(
              template.framework,
            );
            // Set up approval workflow if required
            if (this.config.approvalRequired) {
              document.workflow.reviewers = this.getDefaultReviewers(template.type);
            }
            this.documents.set(document.id, document);
            return [4 /*yield*/, this.saveDocument(document)];
          case 4:
            _a.sent();
            this.emit("document:created", { document: document });
            this.logActivity("user", "document_generated", {
              documentId: document.id,
              name: document.name,
              type: document.type,
              templateId: request.templateId,
              language: request.language,
              createdBy: createdBy,
            });
            return [2 /*return*/, document];
        }
      });
    });
  };
  /**
   * Generate document content
   */
  LegalDocumentationManager.prototype.generateDocumentContent = function (
    document,
    template,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var html,
        markdown,
        headerHtml,
        tocHtml,
        _loop_1,
        this_1,
        _i,
        _a,
        section,
        footerHtml,
        signatureHtml,
        _b;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            html = "";
            markdown = "";
            // Add header
            if (template.content.header) {
              headerHtml = this.processTemplate(
                template.content.header,
                document.data.variables,
                document.data,
              );
              html += headerHtml;
              markdown += this.htmlToMarkdown(headerHtml);
            }
            // Add table of contents if requested
            if (options === null || options === void 0 ? void 0 : options.includeToc) {
              tocHtml = this.generateTableOfContents(template);
              html += tocHtml;
              markdown += this.htmlToMarkdown(tocHtml);
            }
            _loop_1 = function (section) {
              var sectionContent = template.content.sections.find(function (s) {
                return s.sectionId === section.id;
              });
              if (!sectionContent) return "continue";
              // Process main section content
              var sectionHtml = '<section id="'
                .concat(section.id, '">\n<h2>')
                .concat(section.title, "</h2>\n");
              var sectionMarkdown = "## ".concat(section.title, "\n\n");
              var processedContent = this_1.processTemplate(
                sectionContent.content,
                document.data.variables,
                document.data,
              );
              sectionHtml += processedContent;
              sectionMarkdown += this_1.htmlToMarkdown(processedContent);
              // Process conditional content
              if (sectionContent.conditionalContent) {
                for (var _e = 0, _f = sectionContent.conditionalContent; _e < _f.length; _e++) {
                  var conditional = _f[_e];
                  if (
                    this_1.evaluateCondition(
                      conditional.condition,
                      document.data.variables,
                      document.data,
                    )
                  ) {
                    var conditionalHtml = this_1.processTemplate(
                      conditional.content,
                      document.data.variables,
                      document.data,
                    );
                    sectionHtml += conditionalHtml;
                    sectionMarkdown += this_1.htmlToMarkdown(conditionalHtml);
                  }
                }
              }
              sectionHtml += "</section>\n";
              sectionMarkdown += "\n";
              html += sectionHtml;
              markdown += sectionMarkdown;
            };
            this_1 = this;
            // Process sections
            for (
              _i = 0,
                _a = template.structure.sections.sort(function (a, b) {
                  return a.order - b.order;
                });
              _i < _a.length;
              _i++
            ) {
              section = _a[_i];
              _loop_1(section);
            }
            // Add footer
            if (template.content.footer) {
              footerHtml = this.processTemplate(
                template.content.footer,
                document.data.variables,
                document.data,
              );
              html += footerHtml;
              markdown += this.htmlToMarkdown(footerHtml);
            }
            // Add signature if requested
            if (options === null || options === void 0 ? void 0 : options.includeSignature) {
              signatureHtml = this.generateSignatureSection(document);
              html += signatureHtml;
              markdown += this.htmlToMarkdown(signatureHtml);
            }
            // Apply styling
            if ((_c = template.content.styling) === null || _c === void 0 ? void 0 : _c.css) {
              html = "<style>".concat(template.content.styling.css, "</style>\n").concat(html);
            }
            // Add watermark if requested
            if (options === null || options === void 0 ? void 0 : options.watermark) {
              html = this.addWatermark(html, options.watermark);
            }
            document.content.html = html;
            document.content.markdown = markdown;
            if (
              !(
                (options === null || options === void 0 ? void 0 : options.generatePdf) &&
                this.config.pdfGeneration
              )
            )
              return [3 /*break*/, 2];
            _b = document.content;
            return [4 /*yield*/, this.generatePdf(html)];
          case 1:
            _b.pdf = _d.sent();
            _d.label = 2;
          case 2:
            document.content.lastGenerated = new Date();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process template with variables
   */
  LegalDocumentationManager.prototype.processTemplate = function (template, variables, context) {
    var processed = template;
    // Replace simple variables
    for (var _i = 0, _a = Object.entries(variables); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      var regex = new RegExp("{{\\s*".concat(key, "\\s*}}"), "g");
      processed = processed.replace(regex, String(value || ""));
    }
    // Replace organization info
    var orgInfo = context.organizationInfo;
    processed = processed.replace(/{{\s*organization\.name\s*}}/g, orgInfo.name || "");
    processed = processed.replace(/{{\s*organization\.legalName\s*}}/g, orgInfo.legalName || "");
    processed = processed.replace(/{{\s*organization\.cnpj\s*}}/g, orgInfo.cnpj || "");
    processed = processed.replace(/{{\s*organization\.email\s*}}/g, orgInfo.contact.email || "");
    processed = processed.replace(/{{\s*organization\.phone\s*}}/g, orgInfo.contact.phone || "");
    processed = processed.replace(
      /{{\s*organization\.website\s*}}/g,
      orgInfo.contact.website || "",
    );
    // Replace DPO info if available
    if (orgInfo.dpo) {
      processed = processed.replace(/{{\s*dpo\.name\s*}}/g, orgInfo.dpo.name || "");
      processed = processed.replace(/{{\s*dpo\.email\s*}}/g, orgInfo.dpo.email || "");
      processed = processed.replace(/{{\s*dpo\.phone\s*}}/g, orgInfo.dpo.phone || "");
    }
    // Replace address info
    var address = orgInfo.address;
    processed = processed.replace(/{{\s*address\.street\s*}}/g, address.street || "");
    processed = processed.replace(/{{\s*address\.city\s*}}/g, address.city || "");
    processed = processed.replace(/{{\s*address\.state\s*}}/g, address.state || "");
    processed = processed.replace(/{{\s*address\.zipCode\s*}}/g, address.zipCode || "");
    processed = processed.replace(/{{\s*address\.country\s*}}/g, address.country || "");
    // Replace processing activities if available
    if (context.processingActivities) {
      var activitiesList = context.processingActivities
        .map(function (activity) {
          return "<li><strong>"
            .concat(activity.name, "</strong>: ")
            .concat(activity.purpose, "</li>");
        })
        .join("\n");
      processed = processed.replace(
        /{{\s*processingActivities\s*}}/g,
        "<ul>\n".concat(activitiesList, "\n</ul>"),
      );
    }
    // Replace dates
    var now = new Date();
    processed = processed.replace(/{{\s*currentDate\s*}}/g, now.toLocaleDateString("pt-BR"));
    processed = processed.replace(/{{\s*currentYear\s*}}/g, now.getFullYear().toString());
    return processed;
  };
  /**
   * Evaluate conditional expression
   */
  LegalDocumentationManager.prototype.evaluateCondition = function (condition, variables, context) {
    var _a;
    try {
      // Create safe evaluation context
      var evalContext = __assign(__assign({}, variables), {
        organization: context.organizationInfo,
        processingActivities: context.processingActivities || [],
        hasProcessingActivities:
          (((_a = context.processingActivities) === null || _a === void 0 ? void 0 : _a.length) ||
            0) > 0,
        hasDPO: !!context.organizationInfo.dpo,
      });
      // Simple condition evaluation (in production, use a safer expression evaluator)
      var func = new (Function.bind.apply(
        Function,
        __spreadArray(
          __spreadArray([void 0], Object.keys(evalContext), false),
          ["return ".concat(condition)],
          false,
        ),
      ))();
      return func.apply(void 0, Object.values(evalContext));
    } catch (error) {
      console.warn("Failed to evaluate condition: ".concat(condition), error);
      return false;
    }
  };
  /**
   * Generate table of contents
   */
  LegalDocumentationManager.prototype.generateTableOfContents = function (template) {
    var sections = template.structure.sections
      .sort(function (a, b) {
        return a.order - b.order;
      })
      .map(function (section) {
        var html = '<li><a href="#'.concat(section.id, '">').concat(section.title, "</a>");
        if (section.subsections && section.subsections.length > 0) {
          var subsections = section.subsections
            .sort(function (a, b) {
              return a.order - b.order;
            })
            .map(function (sub) {
              return '<li><a href="#'.concat(sub.id, '">').concat(sub.title, "</a></li>");
            })
            .join("\n");
          html += "\n<ul>\n".concat(subsections, "\n</ul>");
        }
        html += "</li>";
        return html;
      })
      .join("\n");
    return '<div class="table-of-contents">\n<h2>\u00CDndice</h2>\n<ul>\n'.concat(
      sections,
      "\n</ul>\n</div>\n",
    );
  };
  /**
   * Generate signature section
   */
  LegalDocumentationManager.prototype.generateSignatureSection = function (document) {
    var orgInfo = document.data.organizationInfo;
    var currentDate = new Date().toLocaleDateString("pt-BR");
    return '\n<div class="signature-section">\n<h3>Assinatura e Aprova\u00E7\u00E3o</h3>\n<p>Este documento foi aprovado e \u00E9 v\u00E1lido a partir de '
      .concat(
        currentDate,
        '.</p>\n<div class="signature-block">\n<p><strong>Organiza\u00E7\u00E3o:</strong> ',
      )
      .concat(orgInfo.legalName, "</p>\n<p><strong>CNPJ:</strong> ")
      .concat(orgInfo.cnpj || "N/A", "</p>\n")
      .concat(
        orgInfo.dpo
          ? "<p><strong>Encarregado de Dados:</strong> ".concat(orgInfo.dpo.name, "</p>")
          : "",
        "\n<p><strong>Data de Aprova\u00E7\u00E3o:</strong> ",
      )
      .concat(currentDate, "</p>\n</div>\n</div>\n");
  };
  /**
   * Add watermark to HTML
   */
  LegalDocumentationManager.prototype.addWatermark = function (html, watermark) {
    var watermarkStyle =
      "\n<style>\n.watermark {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%) rotate(-45deg);\n  font-size: 72px;\n  color: rgba(0, 0, 0, 0.1);\n  z-index: -1;\n  pointer-events: none;\n}\n</style>\n";
    var watermarkDiv = '<div class="watermark">'.concat(watermark, "</div>");
    return watermarkStyle + html + watermarkDiv;
  };
  /**
   * Convert HTML to Markdown (simplified)
   */
  LegalDocumentationManager.prototype.htmlToMarkdown = function (html) {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, "$1\n")
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, "$1\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up extra newlines
      .trim();
  };
  /**
   * Generate PDF from HTML
   */
  LegalDocumentationManager.prototype.generatePdf = function (html) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would use a PDF generation library like Puppeteer
        // For now, return a placeholder
        return [
          2 /*return*/,
          Buffer.from("PDF content for: ".concat(html.substring(0, 100), "...")),
        ];
      });
    });
  };
  /**
   * Generate compliance requirements
   */
  LegalDocumentationManager.prototype.generateComplianceRequirements = function (framework) {
    var _a;
    var requirements =
      ((_a = {}),
      (_a[LegalFramework.LGPD] = [
        {
          article: "Art. 8º",
          requirement: "Consentimento livre, informado e inequívoco",
          satisfied: false,
        },
        {
          article: "Art. 9º",
          requirement: "Direitos dos titulares de dados",
          satisfied: false,
        },
        {
          article: "Art. 18",
          requirement: "Direito de acesso aos dados",
          satisfied: false,
        },
        {
          article: "Art. 46",
          requirement: "Medidas de segurança técnicas e administrativas",
          satisfied: false,
        },
      ]),
      (_a[LegalFramework.GDPR] = [
        {
          article: "Art. 7",
          requirement: "Conditions for consent",
          satisfied: false,
        },
        {
          article: "Art. 13-14",
          requirement: "Information to be provided",
          satisfied: false,
        },
        {
          article: "Art. 15-22",
          requirement: "Rights of the data subject",
          satisfied: false,
        },
      ]),
      (_a[LegalFramework.CCPA] = [
        {
          article: "Section 1798.100",
          requirement: "Right to know about personal information",
          satisfied: false,
        },
        {
          article: "Section 1798.105",
          requirement: "Right to delete personal information",
          satisfied: false,
        },
      ]),
      (_a[LegalFramework.PIPEDA] = [
        {
          article: "Principle 3",
          requirement: "Consent",
          satisfied: false,
        },
        {
          article: "Principle 8",
          requirement: "Openness",
          satisfied: false,
        },
      ]),
      _a);
    return requirements[framework] || [];
  };
  /**
   * Get default reviewers for document type
   */
  LegalDocumentationManager.prototype.getDefaultReviewers = function (type) {
    var _a;
    var reviewerMap =
      ((_a = {}),
      (_a[DocumentType.PRIVACY_POLICY] = [
        { role: "Legal Counsel", name: "", status: "pending" },
        { role: "DPO", name: "", status: "pending" },
      ]),
      (_a[DocumentType.COOKIE_POLICY] = [{ role: "Legal Counsel", name: "", status: "pending" }]),
      (_a[DocumentType.TERMS_OF_SERVICE] = [
        { role: "Legal Counsel", name: "", status: "pending" },
        { role: "Business Owner", name: "", status: "pending" },
      ]),
      (_a[DocumentType.DATA_PROCESSING_RECORD] = [
        { role: "DPO", name: "", status: "pending" },
        { role: "IT Manager", name: "", status: "pending" },
      ]),
      (_a[DocumentType.CONSENT_FORM] = [
        { role: "Legal Counsel", name: "", status: "pending" },
        { role: "DPO", name: "", status: "pending" },
      ]),
      (_a[DocumentType.DATA_SUBJECT_RIGHTS] = [{ role: "DPO", name: "", status: "pending" }]),
      (_a[DocumentType.INCIDENT_RESPONSE] = [
        { role: "IT Security Manager", name: "", status: "pending" },
        { role: "DPO", name: "", status: "pending" },
      ]),
      (_a[DocumentType.COMPLIANCE_REPORT] = [
        { role: "Compliance Officer", name: "", status: "pending" },
      ]),
      (_a[DocumentType.IMPACT_ASSESSMENT] = [
        { role: "DPO", name: "", status: "pending" },
        { role: "Legal Counsel", name: "", status: "pending" },
      ]),
      (_a[DocumentType.VENDOR_AGREEMENT] = [
        { role: "Legal Counsel", name: "", status: "pending" },
        { role: "Procurement Manager", name: "", status: "pending" },
      ]),
      (_a[DocumentType.TRAINING_MATERIAL] = [
        { role: "HR Manager", name: "", status: "pending" },
        { role: "DPO", name: "", status: "pending" },
      ]),
      (_a[DocumentType.AUDIT_REPORT] = [
        { role: "Audit Manager", name: "", status: "pending" },
        { role: "DPO", name: "", status: "pending" },
      ]),
      _a);
    return reviewerMap[type] || [];
  };
  /**
   * Generate compliance report
   */
  LegalDocumentationManager.prototype.generateComplianceReport = function (
    reportData,
    generatedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var report;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            report = __assign(__assign({}, reportData), {
              id: this.generateId("report"),
              generatedBy: generatedBy,
              generatedAt: new Date(),
            });
            this.reports.set(report.id, report);
            return [4 /*yield*/, this.saveReport(report)];
          case 3:
            _a.sent();
            this.emit("report:generated", { report: report });
            this.logActivity("user", "report_generated", {
              reportId: report.id,
              name: report.name,
              type: report.type,
              framework: report.framework,
              period: report.period,
              generatedBy: generatedBy,
            });
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Initialize default templates
   */
  LegalDocumentationManager.prototype.initializeDefaultTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var existingTemplates, hasPrivacyPolicy;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existingTemplates = Array.from(this.templates.values());
            hasPrivacyPolicy = existingTemplates.some(function (t) {
              return t.type === DocumentType.PRIVACY_POLICY;
            });
            if (!!hasPrivacyPolicy) return [3 /*break*/, 2];
            return [4 /*yield*/, this.createDefaultPrivacyPolicyTemplate()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create default privacy policy template
   */
  LegalDocumentationManager.prototype.createDefaultPrivacyPolicyTemplate = function () {
    return __awaiter(this, void 0, void 0, function () {
      var template;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            template = {
              name: "Política de Privacidade LGPD - Padrão",
              type: DocumentType.PRIVACY_POLICY,
              framework: LegalFramework.LGPD,
              language: DocumentLanguage.PT_BR,
              version: "1.0.0",
              structure: {
                sections: [
                  {
                    id: "introduction",
                    title: "Introdução",
                    required: true,
                    order: 1,
                  },
                  {
                    id: "data_collection",
                    title: "Coleta de Dados",
                    required: true,
                    order: 2,
                  },
                  {
                    id: "data_usage",
                    title: "Uso dos Dados",
                    required: true,
                    order: 3,
                  },
                  {
                    id: "data_sharing",
                    title: "Compartilhamento de Dados",
                    required: true,
                    order: 4,
                  },
                  {
                    id: "data_rights",
                    title: "Direitos dos Titulares",
                    required: true,
                    order: 5,
                  },
                  {
                    id: "security",
                    title: "Segurança",
                    required: true,
                    order: 6,
                  },
                  {
                    id: "contact",
                    title: "Contato",
                    required: true,
                    order: 7,
                  },
                ],
                variables: [
                  {
                    name: "companyName",
                    type: "text",
                    required: true,
                    description: "Nome da empresa",
                  },
                  {
                    name: "websiteUrl",
                    type: "text",
                    required: false,
                    description: "URL do website",
                  },
                  {
                    name: "dataRetentionPeriod",
                    type: "text",
                    required: true,
                    description: "Período de retenção de dados",
                  },
                ],
              },
              content: {
                header: "<h1>Política de Privacidade - {{organization.name}}</h1>",
                sections: [
                  {
                    sectionId: "introduction",
                    content:
                      "<p>A {{organization.name}} est\u00E1 comprometida com a prote\u00E7\u00E3o da privacidade e dos dados pessoais de nossos usu\u00E1rios, em conformidade com a Lei Geral de Prote\u00E7\u00E3o de Dados (LGPD - Lei 13.709/2018).</p>\n<p>Esta Pol\u00EDtica de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informa\u00E7\u00F5es pessoais.</p>",
                  },
                  {
                    sectionId: "data_collection",
                    content:
                      "<p>Coletamos dados pessoais quando voc\u00EA:</p>\n<ul>\n<li>Utiliza nossos servi\u00E7os</li>\n<li>Cria uma conta em nossa plataforma</li>\n<li>Entra em contato conosco</li>\n<li>Navega em nosso website</li>\n</ul>",
                  },
                  {
                    sectionId: "data_usage",
                    content:
                      "<p>Utilizamos seus dados pessoais para:</p>\n<ul>\n<li>Fornecer e melhorar nossos servi\u00E7os</li>\n<li>Comunicar-nos com voc\u00EA</li>\n<li>Cumprir obriga\u00E7\u00F5es legais</li>\n<li>Proteger nossos direitos e interesses leg\u00EDtimos</li>\n</ul>",
                  },
                  {
                    sectionId: "data_sharing",
                    content:
                      "<p>N\u00E3o compartilhamos seus dados pessoais com terceiros, exceto:</p>\n<ul>\n<li>Quando necess\u00E1rio para presta\u00E7\u00E3o do servi\u00E7o</li>\n<li>Com seu consentimento expl\u00EDcito</li>\n<li>Para cumprimento de obriga\u00E7\u00F5es legais</li>\n<li>Para prote\u00E7\u00E3o de direitos, propriedade ou seguran\u00E7a</li>\n</ul>",
                  },
                  {
                    sectionId: "data_rights",
                    content:
                      "<p>Voc\u00EA tem os seguintes direitos sobre seus dados pessoais:</p>\n<ul>\n<li>Confirma\u00E7\u00E3o da exist\u00EAncia de tratamento</li>\n<li>Acesso aos dados</li>\n<li>Corre\u00E7\u00E3o de dados incompletos, inexatos ou desatualizados</li>\n<li>Anonimiza\u00E7\u00E3o, bloqueio ou elimina\u00E7\u00E3o</li>\n<li>Portabilidade dos dados</li>\n<li>Elimina\u00E7\u00E3o dos dados tratados com consentimento</li>\n<li>Informa\u00E7\u00E3o sobre compartilhamento</li>\n<li>Revoga\u00E7\u00E3o do consentimento</li>\n</ul>",
                  },
                  {
                    sectionId: "security",
                    content:
                      "<p>Implementamos medidas t\u00E9cnicas e organizacionais apropriadas para proteger seus dados pessoais contra acesso n\u00E3o autorizado, altera\u00E7\u00E3o, divulga\u00E7\u00E3o ou destrui\u00E7\u00E3o.</p>",
                  },
                  {
                    sectionId: "contact",
                    content:
                      "<p>Para exercer seus direitos ou esclarecer d\u00FAvidas sobre esta pol\u00EDtica, entre em contato:</p>\n<ul>\n<li>Email: {{organization.email}}</li>\n<li>Telefone: {{organization.phone}}</li>\n{{#if dpo}}<li>Encarregado de Dados: {{dpo.name}} - {{dpo.email}}</li>{{/if}}\n</ul>",
                  },
                ],
                footer: "<p><em>Última atualização: {{currentDate}}</em></p>",
              },
              createdBy: "System",
              approvedBy: "System",
              approvedAt: new Date(),
            };
            return [4 /*yield*/, this.createTemplate(template)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate template
   */
  LegalDocumentationManager.prototype.validateTemplate = function (template) {
    if (!template.name || template.name.trim().length === 0) {
      throw new Error("Template name is required");
    }
    if (!template.structure.sections || template.structure.sections.length === 0) {
      throw new Error("Template must have at least one section");
    }
    if (!template.content.sections || template.content.sections.length === 0) {
      throw new Error("Template must have content for sections");
    }
  };
  /**
   * Validate generation request
   */
  LegalDocumentationManager.prototype.validateGenerationRequest = function (request, template) {
    // Check required variables
    for (var _i = 0, _a = template.structure.variables; _i < _a.length; _i++) {
      var variable = _a[_i];
      if (variable.required && !request.data.variables[variable.name]) {
        throw new Error("Required variable missing: ".concat(variable.name));
      }
    }
    // Validate organization info
    if (!request.data.organizationInfo.name) {
      throw new Error("Organization name is required");
    }
    if (!request.data.organizationInfo.contact.email) {
      throw new Error("Organization email is required");
    }
  };
  /**
   * Start review monitoring
   */
  LegalDocumentationManager.prototype.startReviewMonitoring = function () {
    var _this = this;
    this.reviewCheckInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.checkDueReviews()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      24 * 60 * 60 * 1000,
    ); // Daily check
  };
  /**
   * Check for due reviews
   */
  LegalDocumentationManager.prototype.checkDueReviews = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _i, _a, document_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            (_i = 0), (_a = this.documents.values());
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            document_1 = _a[_i];
            if (
              !(
                document_1.compliance.nextReview <= now &&
                document_1.status === DocumentStatus.PUBLISHED
              )
            )
              return [3 /*break*/, 3];
            document_1.status = DocumentStatus.REQUIRES_UPDATE;
            return [4 /*yield*/, this.saveDocument(document_1)];
          case 2:
            _b.sent();
            this.emit("review:due", { document: document_1 });
            this.logActivity("system", "review_due", {
              documentId: document_1.id,
              name: document_1.name,
              nextReview: document_1.compliance.nextReview,
            });
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get documents with filtering
   */
  LegalDocumentationManager.prototype.getDocuments = function (filters) {
    var documents = Array.from(this.documents.values());
    if (filters) {
      if (filters.type) {
        documents = documents.filter(function (d) {
          return d.type === filters.type;
        });
      }
      if (filters.status) {
        documents = documents.filter(function (d) {
          return d.status === filters.status;
        });
      }
      if (filters.language) {
        documents = documents.filter(function (d) {
          return d.language === filters.language;
        });
      }
      if (filters.framework) {
        documents = documents.filter(function (d) {
          return d.compliance.framework === filters.framework;
        });
      }
    }
    return documents.sort(function (a, b) {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  };
  /**
   * Get templates with filtering
   */
  LegalDocumentationManager.prototype.getTemplates = function (filters) {
    var templates = Array.from(this.templates.values());
    if (filters) {
      if (filters.type) {
        templates = templates.filter(function (t) {
          return t.type === filters.type;
        });
      }
      if (filters.framework) {
        templates = templates.filter(function (t) {
          return t.framework === filters.framework;
        });
      }
      if (filters.language) {
        templates = templates.filter(function (t) {
          return t.language === filters.language;
        });
      }
    }
    return templates.sort(function (a, b) {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  };
  /**
   * Get reports with filtering
   */
  LegalDocumentationManager.prototype.getReports = function (filters) {
    var reports = Array.from(this.reports.values());
    if (filters) {
      if (filters.type) {
        reports = reports.filter(function (r) {
          return r.type === filters.type;
        });
      }
      if (filters.framework) {
        reports = reports.filter(function (r) {
          return r.framework === filters.framework;
        });
      }
      if (filters.dateRange) {
        reports = reports.filter(function (r) {
          return r.generatedAt >= filters.dateRange.start && r.generatedAt <= filters.dateRange.end;
        });
      }
    }
    return reports.sort(function (a, b) {
      return b.generatedAt.getTime() - a.generatedAt.getTime();
    });
  };
  /**
   * Generate ID
   */
  LegalDocumentationManager.prototype.generateId = function (prefix) {
    return ""
      .concat(prefix, "_")
      .concat(Date.now(), "_")
      .concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Load templates
   */
  LegalDocumentationManager.prototype.loadTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load documents
   */
  LegalDocumentationManager.prototype.loadDocuments = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load reports
   */
  LegalDocumentationManager.prototype.loadReports = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save template
   */
  LegalDocumentationManager.prototype.saveTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save document
   */
  LegalDocumentationManager.prototype.saveDocument = function (document) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save report
   */
  LegalDocumentationManager.prototype.saveReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Log activity
   */
  LegalDocumentationManager.prototype.logActivity = function (actor, action, details) {
    // In a real implementation, this would log to audit trail
    console.log("[LegalDocumentation] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Shutdown the system
   */
  LegalDocumentationManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.reviewCheckInterval) {
          clearInterval(this.reviewCheckInterval);
          this.reviewCheckInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "documentation_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  LegalDocumentationManager.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Legal documentation system not initialized");
    }
    if (!this.reviewCheckInterval) {
      issues.push("Review monitoring not running");
    }
    var dueReviews = Array.from(this.documents.values()).filter(function (d) {
      return d.compliance.nextReview <= new Date() && d.status === DocumentStatus.PUBLISHED;
    });
    if (dueReviews.length > 0) {
      issues.push("".concat(dueReviews.length, " documents require review"));
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        documentsCount: this.documents.size,
        templatesCount: this.templates.size,
        reportsCount: this.reports.size,
        dueReviews: dueReviews.length,
        autoGeneration: this.config.autoGeneration,
        pdfGeneration: this.config.pdfGeneration,
        issues: issues,
      },
    };
  };
  return LegalDocumentationManager;
})(events_1.EventEmitter);
exports.LegalDocumentationManager = LegalDocumentationManager;
/**
 * Default legal documentation manager instance
 */
exports.legalDocumentationManager = new LegalDocumentationManager();
