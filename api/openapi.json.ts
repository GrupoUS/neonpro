export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const baseUrl = (() => {
    const fromEnv = process.env.API_URL as string | undefined;
    if (fromEnv) return fromEnv.startsWith('http') ? `${fromEnv}/api` : `https://${fromEnv}/api`;
    const host = req.headers?.host ?? 'localhost:3000';
    const proto = (req.headers?.['x-forwarded-proto'] as string) || 'https';
    return `${proto}://${host}/api`;
  })();

  const doc = {
    openapi: '3.0.0',
    info: {
      title: 'NeonPro Healthcare API',
      version: '2.1.0',
      description: `
## NeonPro Healthcare Platform API

Complete API documentation for the NeonPro healthcare management platform, designed for Brazilian healthcare standards with LGPD compliance.

### Key Features
- **LGPD Compliant**: Full compliance with Brazilian data protection regulations
- **Healthcare Standards**: Follows ANVISA and CFM guidelines
- **Brazilian Integrations**: SUS, Health Plans (ANS), CBHPM procedures
- **Security**: Role-based access control, audit trails, data encryption
- **Accessibility**: WCAG 2.1 AA compliant interfaces

### Authentication
All endpoints require authentication via Bearer token unless otherwise specified.

### Error Handling
Standardized error responses with LGPD-compliant error messages.

### Audit Trail
All data modifications are automatically logged for compliance.
      `,
      contact: {
        name: 'NeonPro Support',
        email: 'support@neonpro.com.br',
        url: 'https://neonpro.com.br/docs'
      },
      license: {
        name: 'Proprietary',
        url: 'https://neonpro.com.br/license'
      }
    },
    servers: [
      { url: baseUrl, description: 'API Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Base schemas
        UUID: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        DateTime: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z'
        },
        CPF: {
          type: 'string',
          pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
          example: '123.456.789-00'
        },
        CID10Code: {
          type: 'string',
          pattern: '^[A-Z][0-9]{2}(\\.[0-9]+)?$',
          example: 'Z00.0'
        },
        CBHPMCode: {
          type: 'string',
          pattern: '^\\d{8}$',
          example: '10101012'
        },
        
        // Medical Records schemas
        MedicalRecord: {
          type: 'object',
          required: ['id', 'patientId', 'professionalId', 'clinicId', 'recordType', 'title'],
          properties: {
            id: { $ref: '#/components/schemas/UUID' },
            patientId: { $ref: '#/components/schemas/UUID' },
            professionalId: { $ref: '#/components/schemas/UUID' },
            clinicId: { $ref: '#/components/schemas/UUID' },
            recordType: {
              type: 'string',
              enum: ['consultation', 'exam', 'procedure', 'prescription', 'evolution', 'discharge'],
              description: 'Type of medical record'
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Consulta de rotina'
            },
            content: {
              type: 'string',
              description: 'Medical record content (encrypted)',
              example: 'Paciente apresenta bom estado geral...'
            },
            diagnoses: {
              type: 'array',
              items: { $ref: '#/components/schemas/Diagnosis' }
            },
            prescriptions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Prescription' }
            },
            attachments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Attachment' }
            },
            lgpdCompliant: {
              type: 'boolean',
              default: true,
              description: 'LGPD compliance flag'
            },
            consentGiven: {
              type: 'boolean',
              description: 'Patient consent for data processing'
            },
            createdAt: { $ref: '#/components/schemas/DateTime' },
            updatedAt: { $ref: '#/components/schemas/DateTime' },
            auditTrail: {
              type: 'array',
              items: { $ref: '#/components/schemas/AuditEntry' }
            }
          }
        },
        
        Diagnosis: {
          type: 'object',
          required: ['cid10Code', 'description'],
          properties: {
            cid10Code: { $ref: '#/components/schemas/CID10Code' },
            description: {
              type: 'string',
              example: 'Exame médico geral'
            },
            primary: {
              type: 'boolean',
              default: false,
              description: 'Primary diagnosis indicator'
            },
            confirmed: {
              type: 'boolean',
              default: true,
              description: 'Diagnosis confirmation status'
            },
            notes: {
              type: 'string',
              description: 'Additional diagnosis notes'
            }
          }
        },
        
        Prescription: {
          type: 'object',
          required: ['medication', 'dosage', 'instructions'],
          properties: {
            medication: {
              type: 'string',
              example: 'Paracetamol 500mg'
            },
            dosage: {
              type: 'string',
              example: '1 comprimido'
            },
            frequency: {
              type: 'string',
              example: '8/8 horas'
            },
            duration: {
              type: 'string',
              example: '7 dias'
            },
            instructions: {
              type: 'string',
              example: 'Tomar após as refeições'
            }
          }
        },
        
        // Billing schemas
        Billing: {
          type: 'object',
          required: ['id', 'patientId', 'clinicId', 'professionalId', 'items', 'total'],
          properties: {
            id: { $ref: '#/components/schemas/UUID' },
            invoiceNumber: {
              type: 'string',
              example: 'INV-2025-001234'
            },
            patientId: { $ref: '#/components/schemas/UUID' },
            clinicId: { $ref: '#/components/schemas/UUID' },
            professionalId: { $ref: '#/components/schemas/UUID' },
            appointmentId: { $ref: '#/components/schemas/UUID' },
            billingType: {
              type: 'string',
              enum: ['sus', 'health_plan', 'private', 'mixed'],
              description: 'Type of billing according to Brazilian healthcare system'
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/BillingItem' }
            },
            subtotal: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 150.00
            },
            discounts: {
              type: 'number',
              format: 'float',
              minimum: 0,
              default: 0,
              example: 10.00
            },
            taxes: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Brazilian taxes (ISS, PIS, COFINS)',
              example: 7.50
            },
            total: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 147.50
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'authorized', 'paid', 'cancelled', 'refunded', 'partially_paid', 'overdue'],
              default: 'pending'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'debit_card', 'credit_card', 'pix', 'bank_transfer', 'health_plan', 'sus', 'installment']
            },
            dueDate: { $ref: '#/components/schemas/DateTime' },
            healthPlan: { $ref: '#/components/schemas/HealthPlan' },
            taxInfo: { $ref: '#/components/schemas/TaxInfo' },
            createdAt: { $ref: '#/components/schemas/DateTime' },
            updatedAt: { $ref: '#/components/schemas/DateTime' }
          }
        },
        
        BillingItem: {
          type: 'object',
          required: ['id', 'procedureCode', 'quantity', 'unitValue', 'totalValue'],
          properties: {
            id: { $ref: '#/components/schemas/UUID' },
            procedureCode: { $ref: '#/components/schemas/ProcedureCode' },
            quantity: {
              type: 'number',
              minimum: 1,
              default: 1
            },
            unitValue: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 150.00
            },
            totalValue: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 150.00
            },
            discount: {
              type: 'number',
              format: 'float',
              minimum: 0,
              default: 0
            },
            date: { $ref: '#/components/schemas/DateTime' }
          }
        },
        
        ProcedureCode: {
          type: 'object',
          required: ['cbhpmCode', 'description', 'value', 'category'],
          properties: {
            cbhpmCode: { $ref: '#/components/schemas/CBHPMCode' },
            description: {
              type: 'string',
              example: 'Consulta médica em consultório'
            },
            value: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 150.00
            },
            category: {
              type: 'string',
              example: 'Consultas'
            },
            specialtyRequired: {
              type: 'string',
              example: 'Medicina Geral'
            }
          }
        },
        
        HealthPlan: {
          type: 'object',
          required: ['planId', 'planName', 'ansNumber', 'cardNumber'],
          properties: {
            planId: { type: 'string' },
            planName: { type: 'string', example: 'UNIMED Premium' },
            ansNumber: {
              type: 'string',
              pattern: '^\\d{6}$',
              description: 'ANS registration number',
              example: '123456'
            },
            cardNumber: { type: 'string', example: '1234567890123456' },
            validUntil: { $ref: '#/components/schemas/DateTime' },
            coverageType: {
              type: 'string',
              enum: ['partial', 'full']
            },
            coveragePercentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 80
            }
          }
        },
        
        TaxInfo: {
          type: 'object',
          properties: {
            issAliquot: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'ISS tax rate',
              example: 0.05
            },
            issRetention: { type: 'number', minimum: 0, maximum: 1 },
            pisRetention: { type: 'number', minimum: 0, maximum: 1 },
            cofinsFRetention: { type: 'number', minimum: 0, maximum: 1 },
            nfseNumber: {
              type: 'string',
              description: 'Electronic service invoice number'
            },
            municipalInscription: { type: 'string' }
          }
        },
        
        // Common schemas
        Attachment: {
          type: 'object',
          required: ['id', 'fileName', 'fileType', 'url'],
          properties: {
            id: { $ref: '#/components/schemas/UUID' },
            fileName: { type: 'string', example: 'exam_result.pdf' },
            fileType: { type: 'string', example: 'application/pdf' },
            url: { type: 'string', format: 'uri', example: 'https://storage.example.com/files/exam.pdf' },
            uploadedAt: { $ref: '#/components/schemas/DateTime' }
          }
        },
        
        AuditEntry: {
          type: 'object',
          required: ['action', 'performedBy', 'timestamp'],
          properties: {
            action: {
              type: 'string',
              example: 'create',
              description: 'Action performed (create, update, delete, access, etc.)'
            },
            performedBy: { $ref: '#/components/schemas/UUID' },
            timestamp: { $ref: '#/components/schemas/DateTime' },
            details: {
              type: 'string',
              description: 'Additional action details'
            },
            ipAddress: { type: 'string', format: 'ipv4' },
            userAgent: { type: 'string' }
          }
        },
        
        // Response schemas
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Invalid request data' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'patientId' },
                  message: { type: 'string', example: 'Required field missing' },
                  code: { type: 'string', example: 'VALIDATION_ERROR' }
                }
              }
            }
          }
        },
        
        PaginationInfo: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, example: 20 },
            total: { type: 'integer', minimum: 0, example: 150 },
            totalPages: { type: 'integer', minimum: 1, example: 8 }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ],    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Check API health status',
          security: [],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      status: { type: 'string' },
                      ts: { type: 'string', format: 'date-time' },
                      path: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/health': {
        get: {
          summary: 'v1 Health check',
          description: 'Check API v1 health status',
          security: [],
          responses: { '200': { description: 'OK' } },
        },
      },
      
      // Medical Records endpoints
      '/v1/medical-records': {
        get: {
          summary: 'List medical records',
          description: 'Get a paginated list of medical records with optional filtering',
          tags: ['Medical Records'],
          parameters: [
            {
              name: 'patientId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by patient ID'
            },
            {
              name: 'professionalId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by professional ID'
            },
            {
              name: 'recordType',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['consultation', 'exam', 'procedure', 'prescription', 'evolution', 'discharge']
              },
              description: 'Filter by record type'
            },
            {
              name: 'dateFrom',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter records from this date'
            },
            {
              name: 'dateTo',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter records until this date'
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number for pagination'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
              description: 'Number of records per page'
            }
          ],
          responses: {
            '200': {
              description: 'List of medical records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          records: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/MedicalRecord' }
                          },
                          pagination: { $ref: '#/components/schemas/PaginationInfo' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing authentication',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '403': {
              description: 'Forbidden - Insufficient permissions',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        
        post: {
          summary: 'Create medical record',
          description: 'Create a new medical record with LGPD compliance and audit trail',
          tags: ['Medical Records'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['patientId', 'professionalId', 'clinicId', 'recordType', 'title'],
                  properties: {
                    patientId: { $ref: '#/components/schemas/UUID' },
                    professionalId: { $ref: '#/components/schemas/UUID' },
                    clinicId: { $ref: '#/components/schemas/UUID' },
                    recordType: {
                      type: 'string',
                      enum: ['consultation', 'exam', 'procedure', 'prescription', 'evolution', 'discharge']
                    },
                    title: { type: 'string', minLength: 3, maxLength: 200 },
                    content: { type: 'string' },
                    diagnoses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Diagnosis' }
                    },
                    prescriptions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Prescription' }
                    },
                    consentGiven: { type: 'boolean', default: true }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Medical record created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MedicalRecord' },
                      message: { type: 'string', example: 'Prontuário criado com sucesso' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error or missing required fields',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      
      '/v1/medical-records/{recordId}': {
        get: {
          summary: 'Get medical record by ID',
          description: 'Retrieve a specific medical record with LGPD access control',
          tags: ['Medical Records'],
          parameters: [
            {
              name: 'recordId',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Medical record ID'
            }
          ],
          responses: {
            '200': {
              description: 'Medical record details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MedicalRecord' }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Medical record not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        },
        
        put: {
          summary: 'Update medical record',
          description: 'Update an existing medical record with audit trail',
          tags: ['Medical Records'],
          parameters: [
            {
              name: 'recordId',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/UUID' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', minLength: 3, maxLength: 200 },
                    content: { type: 'string' },
                    diagnoses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Diagnosis' }
                    },
                    prescriptions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Prescription' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Medical record updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MedicalRecord' },
                      message: { type: 'string', example: 'Prontuário atualizado com sucesso' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error' },
            '404': { description: 'Medical record not found' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        },
        
        delete: {
          summary: 'Delete medical record',
          description: 'Soft delete a medical record (LGPD compliant)',
          tags: ['Medical Records'],
          parameters: [
            {
              name: 'recordId',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/UUID' }
            }
          ],
          responses: {
            '200': {
              description: 'Medical record deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Prontuário removido com sucesso' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Medical record not found' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      
      // Billing endpoints
      '/v1/billing': {
        get: {
          summary: 'List billing records',
          description: 'Get a paginated list of billing records with Brazilian healthcare compliance',
          tags: ['Billing'],
          parameters: [
            {
              name: 'patientId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by patient ID'
            },
            {
              name: 'clinicId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by clinic ID'
            },
            {
              name: 'professionalId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by professional ID'
            },
            {
              name: 'billingType',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['sus', 'health_plan', 'private', 'mixed']
              },
              description: 'Filter by billing type'
            },
            {
              name: 'paymentStatus',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['pending', 'authorized', 'paid', 'cancelled', 'refunded', 'partially_paid', 'overdue']
              },
              description: 'Filter by payment status'
            },
            {
              name: 'dateFrom',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter billings from this date'
            },
            {
              name: 'dateTo',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter billings until this date'
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
            }
          ],
          responses: {
            '200': {
              description: 'List of billing records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          billings: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Billing' }
                          },
                          pagination: { $ref: '#/components/schemas/PaginationInfo' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Invalid request parameters' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        },
        
        post: {
          summary: 'Create billing record',
          description: 'Create a new billing record with Brazilian tax calculations and compliance',
          tags: ['Billing'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['patientId', 'clinicId', 'professionalId', 'items'],
                  properties: {
                    patientId: { $ref: '#/components/schemas/UUID' },
                    clinicId: { $ref: '#/components/schemas/UUID' },
                    professionalId: { $ref: '#/components/schemas/UUID' },
                    appointmentId: { $ref: '#/components/schemas/UUID' },
                    billingType: {
                      type: 'string',
                      enum: ['sus', 'health_plan', 'private', 'mixed'],
                      default: 'private'
                    },
                    items: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['procedureCode', 'quantity', 'unitValue'],
                        properties: {
                          procedureCode: { $ref: '#/components/schemas/ProcedureCode' },
                          quantity: { type: 'number', minimum: 1 },
                          unitValue: { type: 'number', minimum: 0 },
                          discount: { type: 'number', minimum: 0, default: 0 }
                        }
                      }
                    },
                    healthPlan: { $ref: '#/components/schemas/HealthPlan' },
                    discounts: { type: 'number', minimum: 0, default: 0 },
                    notes: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Billing record created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Billing' },
                      message: { type: 'string', example: 'Cobrança criada com sucesso' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      
      '/v1/billing/{billingId}': {
        get: {
          summary: 'Get billing record by ID',
          description: 'Retrieve a specific billing record',
          tags: ['Billing'],
          parameters: [
            {
              name: 'billingId',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/UUID' }
            }
          ],
          responses: {
            '200': {
              description: 'Billing record details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Billing' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Billing record not found' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      
      '/v1/billing/{billingId}/payment': {
        post: {
          summary: 'Process payment',
          description: 'Process payment for a billing record with Brazilian payment methods',
          tags: ['Billing'],
          parameters: [
            {
              name: 'billingId',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/UUID' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['paymentMethod', 'amount'],
                  properties: {
                    paymentMethod: {
                      type: 'string',
                      enum: ['cash', 'debit_card', 'credit_card', 'pix', 'bank_transfer', 'health_plan', 'sus', 'installment']
                    },
                    amount: { type: 'number', minimum: 0 },
                    installments: { type: 'integer', minimum: 1, maximum: 24 },
                    cardToken: { type: 'string', description: 'Tokenized card data for security' },
                    pixKey: { type: 'string', description: 'PIX key for PIX payments' },
                    bankAccount: {
                      type: 'object',
                      properties: {
                        bank: { type: 'string' },
                        agency: { type: 'string' },
                        account: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment processed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          paymentId: { $ref: '#/components/schemas/UUID' },
                          status: {
                            type: 'string',
                            enum: ['pending', 'authorized', 'paid', 'cancelled', 'refunded']
                          }
                        }
                      },
                      message: { type: 'string', example: 'Pagamento processado com sucesso' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Invalid payment data' },
            '404': { description: 'Billing record not found' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      
      '/v1/billing/financial-summary': {
        get: {
          summary: 'Get financial summary',
          description: 'Generate financial summary and reports for Brazilian healthcare billing',
          tags: ['Billing'],
          parameters: [
            {
              name: 'clinicId',
              in: 'query',
              schema: { $ref: '#/components/schemas/UUID' },
              description: 'Filter by clinic ID'
            },
            {
              name: 'dateFrom',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Summary from this date'
            },
            {
              name: 'dateTo',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Summary until this date'
            }
          ],
          responses: {
            '200': {
              description: 'Financial summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalRevenue: { type: 'number', example: 15000.00 },
                          totalPending: { type: 'number', example: 3000.00 },
                          totalPaid: { type: 'number', example: 12000.00 },
                          totalOverdue: { type: 'number', example: 500.00 },
                          averageTicket: { type: 'number', example: 150.00 },
                          revenueByType: {
                            type: 'object',
                            properties: {
                              sus: { type: 'number' },
                              health_plan: { type: 'number' },
                              private: { type: 'number' },
                              mixed: { type: 'number' }
                            }
                          },
                          revenueByMonth: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                month: { type: 'string', example: '2024-01' },
                                revenue: { type: 'number', example: 5000.00 }
                              }
                            }
                          },
                          topProcedures: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                procedure: { type: 'string', example: 'Consulta médica' },
                                count: { type: 'integer', example: 50 },
                                revenue: { type: 'number', example: 7500.00 }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Medical Records',
        description: 'Electronic medical records management with LGPD compliance'
      },
      {
        name: 'Billing',
        description: 'Healthcare billing and payment processing for Brazilian market'
      }
    ]
  } as const;

  res.statusCode = 200;
  res.end(JSON.stringify(doc));
}