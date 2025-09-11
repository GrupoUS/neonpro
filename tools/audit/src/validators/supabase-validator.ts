import { access, constants, readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { performance } from 'perf_hooks';
import {
  Performance,
  SecurityResult,
  SystemValidator,
  ValidationResult,
} from '../core/system-validator';

/**
 * SupabaseValidator - Constitutional TDD Compliance for Supabase Healthcare Systems
 *
 * Validates Supabase configurations, database schemas, and healthcare compliance
 * for NeonPro healthcare management system with LGPD/ANVISA requirements.
 *
 * Constitutional Requirements:
 * - Process 10k+ files in <4 hours
 * - Memory usage <2GB
 * - Healthcare compliance validation (LGPD/ANVISA)
 * - Real-time security assessment
 * - Database schema validation
 */

interface SupabaseConfig {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
  realtimeConfig?: RealtimeConfig;
  clientOptions?: SupabaseClientOptions;
  database?: DatabaseConfig;
}

interface RealtimeConfig {
  enabled: boolean;
  channels?: string[];
  heartbeatInterval?: number;
  reconnectAfter?: number;
  logger?: string;
  encode?: string;
  decode?: string;
}

interface SupabaseClientOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
    flowType?: string;
  };
  global?: {
    headers?: Record<string, string>;
  };
  db?: {
    schema?: string;
  };
  realtime?: RealtimeConfig;
}

interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
  connectionTimeout?: number;
}

interface TableDefinition {
  name: string;
  schema: string;
  columns: ColumnDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
  rlsPolicies: RLSPolicy[];
  isHealthcareRelated: boolean;
  sensitiveDataFields: string[];
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  isSensitiveHealthcareData: boolean;
  lgpdClassification: 'public' | 'personal' | 'sensitive' | 'healthcare';
}

interface ConstraintDefinition {
  name: string;
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  definition: string;
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
  healthcareOptimized: boolean;
}

interface RLSPolicy {
  name: string;
  table: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  using?: string;
  withCheck?: string;
  healthcareCompliant: boolean;
  lgpdCompliant: boolean;
}

interface DatabaseFunction {
  name: string;
  schema: string;
  returnType: string;
  parameters: FunctionParameter[];
  definition: string;
  isHealthcareRelated: boolean;
  hasAuditLogging: boolean;
}

interface FunctionParameter {
  name: string;
  type: string;
  defaultValue?: string;
}

interface DatabaseTrigger {
  name: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  definition: string;
  isAuditTrigger: boolean;
  healthcareCompliant: boolean;
}

interface MigrationFile {
  filename: string;
  timestamp: string;
  description: string;
  content: string;
  hasHealthcareChanges: boolean;
  rlsPolicyChanges: string[];
  sensitiveDataChanges: string[];
}

interface SupabaseValidationResult extends ValidationResult {
  configuration: {
    valid: boolean;
    issues: string[];
    environmentVariables: {
      present: string[];
      missing: string[];
      insecure: string[];
    };
    clientConfiguration: {
      valid: boolean;
      issues: string[];
      healthcareOptimized: boolean;
    };
  };
  database: {
    schema: {
      valid: boolean;
      tables: TableDefinition[];
      functions: DatabaseFunction[];
      triggers: DatabaseTrigger[];
      issues: string[];
    };
    rlsPolicies: {
      total: number;
      healthcareCompliant: number;
      lgpdCompliant: number;
      missing: string[];
      issues: string[];
    };
    migrations: {
      total: number;
      healthcareRelated: number;
      issues: string[];
      files: MigrationFile[];
    };
  };
  realtime: {
    configured: boolean;
    channels: string[];
    securityIssues: string[];
    healthcareChannels: string[];
    performanceOptimized: boolean;
  };
  healthcareCompliance: {
    lgpdScore: number;
    anvisaScore: number;
    overallScore: number;
    criticalIssues: string[];
    recommendations: string[];
  };
  security: SecurityResult & {
    dataEncryption: {
      atRest: boolean;
      inTransit: boolean;
      keyManagement: string;
      issues: string[];
    };
    auditLogging: {
      enabled: boolean;
      coverage: string[];
      missing: string[];
      healthcareCompliant: boolean;
    };
  };
  performance: Performance & {
    databaseOptimization: {
      indexing: {
        score: number;
        recommendations: string[];
        healthcareOptimized: string[];
      };
      queryPatterns: {
        optimized: number;
        needsImprovement: number;
        recommendations: string[];
      };
    };
    connectionPooling: {
      configured: boolean;
      optimal: boolean;
      recommendations: string[];
    };
  };
}

export class SupabaseValidator extends SystemValidator {
  private config: SupabaseConfig = {};
  private validationStartTime: number = 0;

  // Healthcare compliance patterns for Brazilian regulations
  private readonly healthcareDataPatterns = {
    // LGPD Sensitive Personal Data (Article 5, XI)
    lgpd: [
      /cpf|cnpj|rg|carteira.*identidade/i,
      /biometric|biometria|digital|impressao.*digital/i,
      /genetic|genetico|dna|cromossomo/i,
      /racial|racial|etnia|cor.*pele/i,
      /religious|religioso|crenca|fe/i,
      /political|politico|partido|ideologia/i,
      /sexual.*orientation|orientacao.*sexual|genero/i,
      /health|saude|medico|doenca|tratamento|diagnostico/i,
      /password|senha|token|secret|chave/i,
    ],

    // ANVISA Healthcare Data Requirements
    anvisa: [
      /patient|paciente|usuario|cliente/i,
      /medical.*record|prontuario.*medico|ficha.*medica/i,
      /prescription|receita.*medica|medicamento/i,
      /diagnosis|diagnostico|cid|doenca/i,
      /treatment|tratamento|terapia|procedimento/i,
      /appointment|consulta|agendamento|horario/i,
      /clinic|clinica|hospital|posto.*saude/i,
      /doctor|medico|profissional.*saude/i,
      /laboratory|laboratorio|exame|analise/i,
      /allergy|alergia|reacao.*adversa/i,
    ],

    // Security and Encryption Patterns
    security: [
      /encrypt|criptograf|cipher|aes|rsa/i,
      /hash|bcrypt|argon|pbkdf|scrypt/i,
      /audit|auditoria|log|rastro/i,
      /access.*control|controle.*acesso|permissao/i,
      /authentication|autenticacao|login|auth/i,
      /authorization|autorizacao|role|funcao/i,
      /session|sessao|token|jwt/i,
      /ssl|tls|https|certificate/i,
    ],
  };

  // RLS Policy patterns for healthcare compliance
  private readonly rlsPatterns = {
    patientDataIsolation: /auth\.uid\(\)\s*=\s*user_id|auth\.uid\(\)\s*=\s*patient_id/i,
    healthcareProviderAccess:
      /auth\.role\(\)\s*=\s*'healthcare_provider'|auth\.role\(\)\s*=\s*'doctor'/i,
    organizationScope: /organization_id\s*=\s*auth\.organization_id\(\)/i,
    auditLogging: /audit_log|log_access|track_changes/i,
    consentBased: /consent|consentimento|authorized|autorizado/i,
  };

  constructor() {
    super();
  }

  async validate(projectPath: string): Promise<SupabaseValidationResult> {
    this.validationStartTime = performance.now();

    console.log('🔍 Starting Supabase validation for healthcare compliance...');

    const result: SupabaseValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      performance: {
        duration: 0,
        filesProcessed: 0,
        memoryUsage: 0,
      },
      configuration: {
        valid: false,
        issues: [],
        environmentVariables: {
          present: [],
          missing: [],
          insecure: [],
        },
        clientConfiguration: {
          valid: false,
          issues: [],
          healthcareOptimized: false,
        },
      },
      database: {
        schema: {
          valid: false,
          tables: [],
          functions: [],
          triggers: [],
          issues: [],
        },
        rlsPolicies: {
          total: 0,
          healthcareCompliant: 0,
          lgpdCompliant: 0,
          missing: [],
          issues: [],
        },
        migrations: {
          total: 0,
          healthcareRelated: 0,
          issues: [],
          files: [],
        },
      },
      realtime: {
        configured: false,
        channels: [],
        securityIssues: [],
        healthcareChannels: [],
        performanceOptimized: false,
      },
      healthcareCompliance: {
        lgpdScore: 0,
        anvisaScore: 0,
        overallScore: 0,
        criticalIssues: [],
        recommendations: [],
      },
      security: {
        score: 0,
        issues: [],
        recommendations: [],
        dataEncryption: {
          atRest: false,
          inTransit: false,
          keyManagement: 'none',
          issues: [],
        },
        auditLogging: {
          enabled: false,
          coverage: [],
          missing: [],
          healthcareCompliant: false,
        },
      },
      performance: {
        duration: 0,
        filesProcessed: 0,
        memoryUsage: 0,
        databaseOptimization: {
          indexing: {
            score: 0,
            recommendations: [],
            healthcareOptimized: [],
          },
          queryPatterns: {
            optimized: 0,
            needsImprovement: 0,
            recommendations: [],
          },
        },
        connectionPooling: {
          configured: false,
          optimal: false,
          recommendations: [],
        },
      },
    };

    try {
      // 1. Validate Supabase configuration
      await this.validateConfiguration(projectPath, result);

      // 2. Analyze database schema and migrations
      await this.validateDatabaseSchema(projectPath, result);

      // 3. Validate RLS policies for healthcare compliance
      await this.validateRLSPolicies(projectPath, result);

      // 4. Check real-time configuration
      await this.validateRealtimeConfig(projectPath, result);

      // 5. Healthcare compliance assessment
      await this.assessHealthcareCompliance(projectPath, result);

      // 6. Security validation
      await this.validateSecurity(projectPath, result);

      // 7. Performance optimization analysis
      await this.analyzePerformance(projectPath, result);

      // Calculate overall validity
      result.valid = this.calculateOverallValidity(result);
    } catch (error) {
      result.errors.push(`Supabase validation failed: ${error.message}`);
    }

    // Performance metrics
    const endTime = performance.now();
    result.performance.duration = endTime - this.validationStartTime;
    result.performance.memoryUsage = process.memoryUsage().heapUsed;

    console.log(`✅ Supabase validation completed in ${result.performance.duration.toFixed(2)}ms`);
    console.log(`📊 Healthcare compliance score: ${result.healthcareCompliance.overallScore}/100`);

    return result;
  }

  private async validateConfiguration(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('🔧 Validating Supabase configuration...');

    // Check for Supabase configuration files
    const configFiles = [
      'supabase/config.toml',
      'supabase/config.ts',
      'supabase/config.js',
      'src/lib/supabase.ts',
      'src/lib/supabase.js',
      'src/utils/supabase.ts',
      'lib/supabase.ts',
    ];

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');
        await this.analyzeConfigurationFile(content, configFile, result);
        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Check environment variables patterns
    await this.checkEnvironmentVariables(projectPath, result);

    // Validate client configuration for healthcare optimization
    this.validateClientConfiguration(result);
  }

  private async analyzeConfigurationFile(
    content: string,
    filename: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Extract Supabase URL patterns
    const urlPattern = /supabase.*url.*['"](https?:\/\/[^'"]+)['"]/i;
    const urlMatch = content.match(urlPattern);
    if (urlMatch) {
      this.config.url = urlMatch[1];
      result.configuration.environmentVariables.present.push('SUPABASE_URL');
    }

    // Extract API key patterns
    const keyPattern = /supabase.*key.*['"](eyJ[^'"]+)['"]/i;
    const keyMatch = content.match(keyPattern);
    if (keyMatch) {
      this.config.anonKey = keyMatch[1];
      result.configuration.environmentVariables.present.push('SUPABASE_ANON_KEY');
    }

    // Check for service role key (should be environment variable only)
    const serviceKeyPattern = /service.*role.*key|serviceRoleKey/i;
    if (serviceKeyPattern.test(content)) {
      result.configuration.issues.push(
        `Service role key detected in ${filename} - should be environment variable only`,
      );
    }

    // Check for healthcare-optimized configurations
    if (content.includes('realtime') || content.includes('channels')) {
      result.realtime.configured = true;
    }

    // Check for security configurations
    if (content.includes('autoRefreshToken')) {
      result.configuration.clientConfiguration.healthcareOptimized = true;
    }

    // Check for insecure patterns
    if (content.includes('localhost') && !filename.includes('dev')) {
      result.configuration.environmentVariables.insecure.push(
        'Localhost URL in production configuration',
      );
    }

    if (content.includes('eyJ') && content.includes('anon')) {
      result.configuration.environmentVariables.insecure.push('Hardcoded API key detected');
    }
  }

  private async checkEnvironmentVariables(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    const envFiles = ['.env', '.env.local', '.env.example', '.env.template'];

    for (const envFile of envFiles) {
      const filePath = join(projectPath, envFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');

        // Check for required Supabase environment variables
        const requiredVars = [
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'VITE_SUPABASE_URL',
          'VITE_SUPABASE_ANON_KEY',
        ];

        for (const envVar of requiredVars) {
          if (content.includes(envVar)) {
            result.configuration.environmentVariables.present.push(envVar);
          }
        }

        // Check for service role key (should only be in server environment)
        if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          result.configuration.environmentVariables.present.push('SUPABASE_SERVICE_ROLE_KEY');
        }

        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Check for missing required variables
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    for (const envVar of required) {
      if (
        !result.configuration.environmentVariables.present.includes(envVar)
        && !result.configuration.environmentVariables.present.includes(`VITE_${envVar}`)
      ) {
        result.configuration.environmentVariables.missing.push(envVar);
      }
    }
  }

  private validateClientConfiguration(result: SupabaseValidationResult): void {
    // Validate based on extracted configuration
    if (!this.config.url) {
      result.configuration.issues.push('Supabase URL not configured');
    }

    if (!this.config.anonKey) {
      result.configuration.issues.push('Supabase anonymous key not configured');
    }

    // Healthcare-specific client optimizations
    const healthcareOptimizations = [];

    if (result.realtime.configured) {
      healthcareOptimizations.push('Real-time configured for live updates');
    }

    if (result.configuration.environmentVariables.present.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      healthcareOptimizations.push('Service role key available for admin operations');
    }

    result.configuration.clientConfiguration.healthcareOptimized =
      healthcareOptimizations.length > 0;
    result.configuration.valid = result.configuration.issues.length === 0;
  }

  private async validateDatabaseSchema(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('🗄️ Analyzing database schema and migrations...');

    // Look for migration files
    const migrationPaths = [
      'supabase/migrations',
      'migrations',
      'db/migrations',
      'database/migrations',
    ];

    for (const migrationPath of migrationPaths) {
      const fullPath = join(projectPath, migrationPath);
      try {
        await access(fullPath, constants.F_OK);
        await this.analyzeMigrations(fullPath, result);
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }

    // Look for generated types
    await this.analyzeGeneratedTypes(projectPath, result);

    // Analyze schema files
    await this.analyzeSchemaFiles(projectPath, result);
  }

  private async analyzeMigrations(
    migrationPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    try {
      const files = await readdir(migrationPath);
      const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

      for (const file of sqlFiles) {
        const filePath = join(migrationPath, file);
        const content = await readFile(filePath, 'utf-8');

        const migration: MigrationFile = {
          filename: file,
          timestamp: file.split('_')[0] || '',
          description: this.extractMigrationDescription(file, content),
          content,
          hasHealthcareChanges: this.detectHealthcareChanges(content),
          rlsPolicyChanges: this.extractRLSPolicyChanges(content),
          sensitiveDataChanges: this.extractSensitiveDataChanges(content),
        };

        result.database.migrations.files.push(migration);
        result.database.migrations.total++;

        if (migration.hasHealthcareChanges) {
          result.database.migrations.healthcareRelated++;
        }

        // Analyze table definitions in migration
        await this.analyzeTableDefinitions(content, result);

        result.performance.filesProcessed++;
      }
    } catch (error) {
      result.database.migrations.issues.push(`Failed to analyze migrations: ${error.message}`);
    }
  }

  private extractMigrationDescription(filename: string, content: string): string {
    // Try to extract description from filename
    const parts = filename.split('_');
    if (parts.length > 1) {
      return parts.slice(1).join('_').replace('.sql', '').replace(/[-_]/g, ' ');
    }

    // Try to extract from comment in file
    const commentMatch = content.match(/--\s*(.+)/);
    if (commentMatch) {
      return commentMatch[1].trim();
    }

    return 'Migration';
  }

  private detectHealthcareChanges(content: string): boolean {
    const healthcareKeywords = [
      'patient',
      'paciente',
      'medical',
      'medico',
      'health',
      'saude',
      'appointment',
      'consulta',
      'prescription',
      'receita',
      'diagnosis',
      'diagnostico',
      'treatment',
      'tratamento',
      'clinic',
      'clinica',
      'doctor',
      'doutor',
      'laboratory',
      'laboratorio',
    ];

    const lowerContent = content.toLowerCase();
    return healthcareKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private extractRLSPolicyChanges(content: string): string[] {
    const policyPattern = /CREATE POLICY|ALTER POLICY|DROP POLICY/gi;
    const matches = content.match(policyPattern);
    return matches || [];
  }

  private extractSensitiveDataChanges(content: string): string[] {
    const changes = [];

    for (const [category, patterns] of Object.entries(this.healthcareDataPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          changes.push(`${category}: ${pattern.source}`);
        }
      }
    }

    return changes;
  }
  private async analyzeTableDefinitions(
    content: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Extract CREATE TABLE statements
    const tablePattern = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?([^\s\(]+)\s*\(([\s\S]*?)\);/gi;
    let match;

    while ((match = tablePattern.exec(content)) !== null) {
      const tableName = match[1].replace(/["`]/g, '');
      const tableDefinition = match[2];

      const table: TableDefinition = {
        name: tableName,
        schema: 'public',
        columns: this.parseColumnDefinitions(tableDefinition),
        constraints: this.parseConstraintDefinitions(tableDefinition),
        indexes: [],
        rlsPolicies: [],
        isHealthcareRelated: this.isHealthcareRelatedTable(tableName, tableDefinition),
        sensitiveDataFields: this.identifySensitiveDataFields(tableDefinition),
      };

      result.database.schema.tables.push(table);
    }

    // Extract RLS ENABLE statements
    const rlsPattern = /ALTER TABLE\s+([^\s]+)\s+ENABLE ROW LEVEL SECURITY/gi;
    while ((match = rlsPattern.exec(content)) !== null) {
      const tableName = match[1].replace(/["`]/g, '');
      const table = result.database.schema.tables.find(t => t.name === tableName);
      if (table) {
        // Table has RLS enabled - this will be analyzed further in RLS validation
      }
    }
  }

  private parseColumnDefinitions(tableDefinition: string): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];

    // Split by commas but handle nested parentheses
    const lines = tableDefinition.split('\n').map(line => line.trim()).filter(line =>
      line && !line.startsWith('CONSTRAINT')
    );

    for (const line of lines) {
      if (line.includes(' ')) {
        const parts = line.replace(/,$/, '').trim().split(/\s+/);
        if (parts.length >= 2) {
          const columnName = parts[0].replace(/["`]/g, '');
          const columnType = parts[1];

          const column: ColumnDefinition = {
            name: columnName,
            type: columnType,
            nullable: !line.includes('NOT NULL'),
            primaryKey: line.includes('PRIMARY KEY'),
            unique: line.includes('UNIQUE'),
            isSensitiveHealthcareData: this.isSensitiveHealthcareField(columnName, line),
            lgpdClassification: this.classifyLGPDData(columnName, line),
          };

          // Check for foreign key references
          const fkMatch = line.match(/REFERENCES\s+([^\s\(]+)(?:\s*\(\s*([^\)]+)\s*\))?/i);
          if (fkMatch) {
            column.foreignKey = {
              table: fkMatch[1].replace(/["`]/g, ''),
              column: fkMatch[2]?.replace(/["`]/g, '') || 'id',
            };
          }

          columns.push(column);
        }
      }
    }

    return columns;
  }

  private parseConstraintDefinitions(tableDefinition: string): ConstraintDefinition[] {
    const constraints: ConstraintDefinition[] = [];

    // Extract CONSTRAINT definitions
    const constraintPattern =
      /CONSTRAINT\s+([^\s]+)\s+(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)\s*\(([^\)]+)\)(?:\s+REFERENCES\s+([^\s\(]+)(?:\s*\(\s*([^\)]+)\s*\))?)?/gi;
    let match;

    while ((match = constraintPattern.exec(tableDefinition)) !== null) {
      const constraint: ConstraintDefinition = {
        name: match[1].replace(/["`]/g, ''),
        type: match[2].toUpperCase() as any,
        columns: match[3].split(',').map(col => col.trim().replace(/["`]/g, '')),
        definition: match[0],
      };

      if (match[4]) {
        constraint.referencedTable = match[4].replace(/["`]/g, '');
        constraint.referencedColumns = match[5]
          ? match[5].split(',').map(col => col.trim().replace(/["`]/g, ''))
          : ['id'];
      }

      constraints.push(constraint);
    }

    return constraints;
  }

  private isHealthcareRelatedTable(tableName: string, definition: string): boolean {
    const healthcareTablePatterns = [
      /patient|paciente|user|usuario/i,
      /appointment|consulta|agendamento/i,
      /medical|medico|health|saude/i,
      /prescription|receita|medication|medicamento/i,
      /diagnosis|diagnostico|treatment|tratamento/i,
      /clinic|clinica|hospital|facility/i,
      /doctor|medico|provider|professional/i,
      /laboratory|laboratorio|exam|exame/i,
    ];

    const combinedText = `${tableName} ${definition}`.toLowerCase();
    return healthcareTablePatterns.some(pattern => pattern.test(combinedText));
  }

  private identifySensitiveDataFields(definition: string): string[] {
    const sensitiveFields = [];
    const lines = definition.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();

      // Check against LGPD sensitive data patterns
      for (const pattern of this.healthcareDataPatterns.lgpd) {
        if (pattern.test(trimmedLine)) {
          const fieldMatch = trimmedLine.match(/^(\w+)/);
          if (fieldMatch) {
            sensitiveFields.push(fieldMatch[1]);
          }
        }
      }

      // Check against ANVISA healthcare patterns
      for (const pattern of this.healthcareDataPatterns.anvisa) {
        if (pattern.test(trimmedLine)) {
          const fieldMatch = trimmedLine.match(/^(\w+)/);
          if (fieldMatch) {
            sensitiveFields.push(fieldMatch[1]);
          }
        }
      }
    }

    return [...new Set(sensitiveFields)]; // Remove duplicates
  }

  private isSensitiveHealthcareField(columnName: string, definition: string): boolean {
    const combinedText = `${columnName} ${definition}`.toLowerCase();

    // Check against all healthcare data patterns
    for (const patterns of Object.values(this.healthcareDataPatterns)) {
      if (patterns.some(pattern => pattern.test(combinedText))) {
        return true;
      }
    }

    return false;
  }

  private classifyLGPDData(
    columnName: string,
    definition: string,
  ): 'public' | 'personal' | 'sensitive' | 'healthcare' {
    const combinedText = `${columnName} ${definition}`.toLowerCase();

    // Healthcare data (most sensitive)
    if (this.healthcareDataPatterns.anvisa.some(pattern => pattern.test(combinedText))) {
      return 'healthcare';
    }

    // LGPD sensitive personal data
    if (this.healthcareDataPatterns.lgpd.some(pattern => pattern.test(combinedText))) {
      return 'sensitive';
    }

    // Personal identifiers
    if (/name|nome|email|phone|telefone|address|endereco|birth|nascimento/i.test(combinedText)) {
      return 'personal';
    }

    // Public data
    return 'public';
  }

  private async analyzeGeneratedTypes(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    const typesFiles = [
      'supabase/database.types.ts',
      'types/supabase.ts',
      'types/database.ts',
      'src/types/supabase.ts',
    ];

    for (const typesFile of typesFiles) {
      const filePath = join(projectPath, typesFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');
        await this.analyzeTypeDefinitions(content, result);
        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private async analyzeTypeDefinitions(
    content: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Extract table interface definitions
    const interfacePattern = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = interfacePattern.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];

      // Check if this represents a database table
      if (
        interfaceBody.includes('id:') || interfaceBody.includes('created_at:')
        || interfaceBody.includes('updated_at:')
      ) {
        // Analyze the interface for healthcare compliance
        const isHealthcareRelated = this.isHealthcareRelatedTable(interfaceName, interfaceBody);
        const sensitiveFields = this.identifySensitiveDataFields(interfaceBody);

        // Add to analysis if not already present from migrations
        const existingTable = result.database.schema.tables.find(t =>
          t.name.toLowerCase() === interfaceName.toLowerCase()
        );
        if (!existingTable) {
          const table: TableDefinition = {
            name: interfaceName,
            schema: 'public',
            columns: this.parseTypeScriptInterface(interfaceBody),
            constraints: [],
            indexes: [],
            rlsPolicies: [],
            isHealthcareRelated,
            sensitiveDataFields: sensitiveFields,
          };

          result.database.schema.tables.push(table);
        }
      }
    }
  }

  private parseTypeScriptInterface(interfaceBody: string): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];
    const lines = interfaceBody.split('\n').map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      const fieldMatch = line.match(/(\w+)(\??):\s*([^;]+)/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const isOptional = fieldMatch[2] === '?';
        const fieldType = fieldMatch[3].trim();

        const column: ColumnDefinition = {
          name: fieldName,
          type: fieldType,
          nullable: isOptional || fieldType.includes('null'),
          primaryKey: fieldName === 'id',
          unique: false,
          isSensitiveHealthcareData: this.isSensitiveHealthcareField(fieldName, fieldType),
          lgpdClassification: this.classifyLGPDData(fieldName, fieldType),
        };

        columns.push(column);
      }
    }

    return columns;
  }

  private async analyzeSchemaFiles(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    const schemaFiles = [
      'supabase/schema.sql',
      'database/schema.sql',
      'db/schema.sql',
    ];

    for (const schemaFile of schemaFiles) {
      const filePath = join(projectPath, schemaFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');

        // Analyze functions and triggers
        await this.analyzeFunctions(content, result);
        await this.analyzeTriggers(content, result);

        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private async analyzeFunctions(
    content: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    const functionPattern =
      /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s\(]+)\s*\(([^\)]*)\)\s+RETURNS\s+([^\s]+)\s+(?:LANGUAGE\s+\w+\s+)?AS\s+\$\$([^$]+)\$\$/gi;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      const functionName = match[1].trim();
      const parameters = match[2].trim();
      const returnType = match[3].trim();
      const definition = match[4].trim();

      const func: DatabaseFunction = {
        name: functionName,
        schema: 'public',
        returnType: returnType,
        parameters: this.parseFunctionParameters(parameters),
        definition: definition,
        isHealthcareRelated: this.isHealthcareRelatedTable(functionName, definition),
        hasAuditLogging: /audit|log|track/i.test(definition),
      };

      result.database.schema.functions.push(func);
    }
  }

  private parseFunctionParameters(parametersStr: string): FunctionParameter[] {
    if (!parametersStr.trim()) return [];

    const parameters: FunctionParameter[] = [];
    const paramParts = parametersStr.split(',').map(p => p.trim());

    for (const param of paramParts) {
      const match = param.match(/(\w+)\s+([^\s=]+)(?:\s*=\s*(.+))?/);
      if (match) {
        parameters.push({
          name: match[1],
          type: match[2],
          defaultValue: match[3],
        });
      }
    }

    return parameters;
  }

  private async analyzeTriggers(content: string, result: SupabaseValidationResult): Promise<void> {
    const triggerPattern =
      /CREATE\s+TRIGGER\s+([^\s]+)\s+(BEFORE|AFTER|INSTEAD OF)\s+(INSERT|UPDATE|DELETE)\s+ON\s+([^\s]+)\s+FOR EACH ROW\s+EXECUTE\s+(FUNCTION|PROCEDURE)\s+([^\s\(]+)/gi;
    let match;

    while ((match = triggerPattern.exec(content)) !== null) {
      const trigger: DatabaseTrigger = {
        name: match[1],
        table: match[4],
        event: match[3] as any,
        timing: match[2] as any,
        definition: match[0],
        isAuditTrigger: /audit|log|track|history/i.test(match[1]),
        healthcareCompliant: this.isHealthcareRelatedTable(match[4], match[0]),
      };

      result.database.schema.triggers.push(trigger);
    }
  }
  private async validateRLSPolicies(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('🔐 Validating Row Level Security policies...');

    // Look for RLS policy definitions in migrations and schema files
    const policyFiles = [
      ...result.database.migrations.files,
      'supabase/schema.sql',
      'database/schema.sql',
      'db/schema.sql',
    ];

    for (const file of policyFiles) {
      let content: string;

      if (typeof file === 'string') {
        // It's a file path
        const filePath = join(projectPath, file);
        try {
          await access(filePath, constants.F_OK);
          content = await readFile(filePath, 'utf-8');
          result.performance.filesProcessed++;
        } catch (error) {
          continue; // File doesn't exist
        }
      } else {
        // It's a MigrationFile object
        content = file.content;
      }

      await this.analyzeRLSPolicies(content, result);
    }

    // Assess RLS coverage for healthcare tables
    this.assessRLSCoverage(result);
  }

  private async analyzeRLSPolicies(
    content: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Extract RLS ENABLE statements
    const enableRLSPattern = /ALTER TABLE\s+([^\s]+)\s+ENABLE ROW LEVEL SECURITY/gi;
    let match;

    while ((match = enableRLSPattern.exec(content)) !== null) {
      const tableName = match[1].replace(/["`]/g, '');
      const table = result.database.schema.tables.find(t => t.name === tableName);
      if (table) {
        // RLS is enabled for this table
      }
    }

    // Extract CREATE POLICY statements
    const policyPattern =
      /CREATE POLICY\s+([^\s]+)\s+ON\s+([^\s]+)\s+(?:FOR\s+(\w+))?\s*(?:TO\s+([^)]+))?\s*(?:USING\s*\(([^)]+)\))?\s*(?:WITH CHECK\s*\(([^)]+)\))?/gi;

    while ((match = policyPattern.exec(content)) !== null) {
      const policy: RLSPolicy = {
        name: match[1].replace(/["`]/g, ''),
        table: match[2].replace(/["`]/g, ''),
        command: (match[3] || 'ALL').toUpperCase() as any,
        roles: match[4] ? match[4].split(',').map(r => r.trim()) : ['public'],
        using: match[5],
        withCheck: match[6],
        healthcareCompliant: false,
        lgpdCompliant: false,
      };

      // Assess healthcare compliance
      policy.healthcareCompliant = this.assessPolicyHealthcareCompliance(policy);
      policy.lgpdCompliant = this.assessPolicyLGPDCompliance(policy);

      // Add policy to the corresponding table
      const table = result.database.schema.tables.find(t => t.name === policy.table);
      if (table) {
        table.rlsPolicies.push(policy);
      }

      result.database.rlsPolicies.total++;

      if (policy.healthcareCompliant) {
        result.database.rlsPolicies.healthcareCompliant++;
      }

      if (policy.lgpdCompliant) {
        result.database.rlsPolicies.lgpdCompliant++;
      }
    }
  }

  private assessPolicyHealthcareCompliance(policy: RLSPolicy): boolean {
    const policyText = `${policy.using || ''} ${policy.withCheck || ''}`.toLowerCase();

    // Check for healthcare-specific access patterns
    const healthcarePatterns = [
      // Patient data isolation
      this.rlsPatterns.patientDataIsolation,
      // Healthcare provider access
      this.rlsPatterns.healthcareProviderAccess,
      // Organization scope
      this.rlsPatterns.organizationScope,
      // Consent-based access
      this.rlsPatterns.consentBased,
    ];

    return healthcarePatterns.some(pattern => pattern.test(policyText));
  }

  private assessPolicyLGPDCompliance(policy: RLSPolicy): boolean {
    const policyText = `${policy.using || ''} ${policy.withCheck || ''}`.toLowerCase();

    // LGPD compliance patterns
    const lgpdPatterns = [
      // Data subject access (user owns their data)
      /auth\.uid\(\)\s*=\s*user_id|auth\.uid\(\)\s*=\s*owner_id/i,
      // Purpose limitation (specific role-based access)
      /auth\.role\(\)\s*=|has_role\(/i,
      // Consent verification
      /consent|authorized|permission/i,
      // Data minimization (specific field access)
      /select.*specific.*fields|limited.*access/i,
      // Audit trail
      /audit|log|track/i,
    ];

    return lgpdPatterns.some(pattern => pattern.test(policyText));
  }

  private assessRLSCoverage(result: SupabaseValidationResult): void {
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    const tablesWithoutRLS = [];

    for (const table of healthcareTables) {
      if (table.rlsPolicies.length === 0) {
        tablesWithoutRLS.push(table.name);
        result.database.rlsPolicies.missing.push(
          `Missing RLS policies for healthcare table: ${table.name}`,
        );
      }

      // Check for comprehensive RLS coverage
      const hasSelectPolicy = table.rlsPolicies.some(p =>
        p.command === 'SELECT' || p.command === 'ALL'
      );
      const hasInsertPolicy = table.rlsPolicies.some(p =>
        p.command === 'INSERT' || p.command === 'ALL'
      );
      const hasUpdatePolicy = table.rlsPolicies.some(p =>
        p.command === 'UPDATE' || p.command === 'ALL'
      );
      const hasDeletePolicy = table.rlsPolicies.some(p =>
        p.command === 'DELETE' || p.command === 'ALL'
      );

      if (!hasSelectPolicy) {
        result.database.rlsPolicies.issues.push(`Missing SELECT policy for table: ${table.name}`);
      }
      if (!hasInsertPolicy) {
        result.database.rlsPolicies.issues.push(`Missing INSERT policy for table: ${table.name}`);
      }
      if (!hasUpdatePolicy) {
        result.database.rlsPolicies.issues.push(`Missing UPDATE policy for table: ${table.name}`);
      }
      if (!hasDeletePolicy) {
        result.database.rlsPolicies.issues.push(`Missing DELETE policy for table: ${table.name}`);
      }
    }

    // Validate RLS policy quality
    for (const table of result.database.schema.tables) {
      for (const policy of table.rlsPolicies) {
        if (!policy.using && !policy.withCheck) {
          result.database.rlsPolicies.issues.push(
            `Policy ${policy.name} on ${table.name} has no conditions`,
          );
        }

        if (policy.roles.includes('anon') && table.sensitiveDataFields.length > 0) {
          result.database.rlsPolicies.issues.push(
            `Policy ${policy.name} allows anonymous access to sensitive data in ${table.name}`,
          );
        }

        if (!policy.healthcareCompliant && table.isHealthcareRelated) {
          result.database.rlsPolicies.issues.push(
            `Policy ${policy.name} on healthcare table ${table.name} may not be healthcare compliant`,
          );
        }
      }
    }
  }

  private async validateRealtimeConfig(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('⚡ Validating real-time configuration...');

    // Look for real-time configuration files
    const realtimeFiles = [
      'supabase/config.toml',
      'src/lib/realtime.ts',
      'src/utils/realtime.ts',
      'lib/realtime.ts',
    ];

    for (const realtimeFile of realtimeFiles) {
      const filePath = join(projectPath, realtimeFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');
        await this.analyzeRealtimeConfiguration(content, result);
        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Look for real-time usage in React components
    await this.analyzeRealtimeUsage(projectPath, result);
  }

  private async analyzeRealtimeConfiguration(
    content: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Check for real-time subscription patterns
    const subscriptionPatterns = [
      /\.subscribe\(/g,
      /\.channel\(/g,
      /\.on\('postgres_changes'/g,
      /\.on\('broadcast'/g,
      /\.on\('presence'/g,
    ];

    for (const pattern of subscriptionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.realtime.configured = true;
        break;
      }
    }

    // Extract channel configurations
    const channelPattern = /\.channel\(['"`]([^'"`]+)['"`]\)/g;
    let match;

    while ((match = channelPattern.exec(content)) !== null) {
      const channelName = match[1];
      result.realtime.channels.push(channelName);

      // Check if it's a healthcare-related channel
      if (this.isHealthcareRelatedTable(channelName, content)) {
        result.realtime.healthcareChannels.push(channelName);
      }
    }

    // Check for security configurations
    if (content.includes('auth.') || content.includes('user_id')) {
      result.realtime.performanceOptimized = true;
    }

    // Look for potential security issues
    if (content.includes('*') && content.includes('postgres_changes')) {
      result.realtime.securityIssues.push(
        'Wildcard subscription detected - may expose sensitive data',
      );
    }

    if (content.includes('public') && !content.includes('auth.')) {
      result.realtime.securityIssues.push('Public real-time access without authentication checks');
    }
  }

  private async analyzeRealtimeUsage(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Look for React components using real-time
    const componentPaths = [
      'src/components',
      'components',
      'src/pages',
      'pages',
      'src/app',
      'app',
    ];

    for (const componentPath of componentPaths) {
      const fullPath = join(projectPath, componentPath);
      try {
        await access(fullPath, constants.F_OK);
        await this.scanRealtimeInDirectory(fullPath, result);
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }
  }

  private async scanRealtimeInDirectory(
    dirPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanRealtimeInDirectory(fullPath, result);
        } else if (
          entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))
        ) {
          const content = await readFile(fullPath, 'utf-8');

          // Check for real-time usage patterns
          if (content.includes('.subscribe(') || content.includes('.channel(')) {
            // Analyze the real-time usage for security
            this.analyzeRealtimeSecurityInComponent(content, entry.name, result);
            result.performance.filesProcessed++;
          }
        }
      }
    } catch (error) {
      // Directory read failed, continue
    }
  }

  private analyzeRealtimeSecurityInComponent(
    content: string,
    filename: string,
    result: SupabaseValidationResult,
  ): void {
    // Check for authentication in real-time subscriptions
    if (!content.includes('auth') && !content.includes('user') && !content.includes('session')) {
      result.realtime.securityIssues.push(
        `Component ${filename} uses real-time without authentication checks`,
      );
    }

    // Check for healthcare data subscriptions
    const healthcareKeywords = ['patient', 'medical', 'health', 'appointment', 'prescription'];
    const lowerContent = content.toLowerCase();

    if (healthcareKeywords.some(keyword => lowerContent.includes(keyword))) {
      if (!content.includes('rls') && !content.includes('policy')) {
        result.realtime.securityIssues.push(
          `Component ${filename} subscribes to healthcare data without RLS verification`,
        );
      }
    }

    // Check for proper error handling
    if (!content.includes('.catch(') && !content.includes('try {')) {
      result.realtime.securityIssues.push(
        `Component ${filename} lacks error handling for real-time subscriptions`,
      );
    }
  }

  private async assessHealthcareCompliance(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('🏥 Assessing healthcare compliance (LGPD/ANVISA)...');

    let lgpdScore = 0;
    let anvisaScore = 0;
    const maxScore = 100;

    // LGPD Compliance Assessment
    lgpdScore += this.assessLGPDDataClassification(result) * 20; // 20 points
    lgpdScore += this.assessLGPDAccessControl(result) * 25; // 25 points
    lgpdScore += this.assessLGPDConsentManagement(result) * 20; // 20 points
    lgpdScore += this.assessLGPDAuditTrail(result) * 15; // 15 points
    lgpdScore += this.assessLGPDDataMinimization(result) * 10; // 10 points
    lgpdScore += this.assessLGPDRightToErasure(result) * 10; // 10 points

    // ANVISA Compliance Assessment
    anvisaScore += this.assessANVISADataSecurity(result) * 30; // 30 points
    anvisaScore += this.assessANVISAHealthcareWorkflow(result) * 25; // 25 points
    anvisaScore += this.assessANVISAPatientSafety(result) * 20; // 20 points
    anvisaScore += this.assessANVISARegulatory(result) * 15; // 15 points
    anvisaScore += this.assessANVISATraceability(result) * 10; // 10 points

    // Calculate overall score
    const overallScore = (lgpdScore + anvisaScore) / 2;

    result.healthcareCompliance.lgpdScore = Math.min(lgpdScore, maxScore);
    result.healthcareCompliance.anvisaScore = Math.min(anvisaScore, maxScore);
    result.healthcareCompliance.overallScore = Math.min(overallScore, maxScore);

    // Generate recommendations
    this.generateHealthcareRecommendations(result);

    // Identify critical issues
    this.identifyHealthcareCriticalIssues(result);
  }

  private assessLGPDDataClassification(result: SupabaseValidationResult): number {
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    if (healthcareTables.length === 0) return 1.0;

    let classifiedTables = 0;

    for (const table of healthcareTables) {
      const hasSensitiveFields = table.columns.some(c =>
        c.lgpdClassification === 'sensitive' || c.lgpdClassification === 'healthcare'
      );
      const hasProperClassification = table.columns.every(c =>
        c.lgpdClassification !== 'public' || !c.isSensitiveHealthcareData
      );

      if (hasSensitiveFields && hasProperClassification) {
        classifiedTables++;
      }
    }

    return classifiedTables / healthcareTables.length;
  }

  private assessLGPDAccessControl(result: SupabaseValidationResult): number {
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    if (healthcareTables.length === 0) return 1.0;

    let tablesWithProperRLS = 0;

    for (const table of healthcareTables) {
      const hasRLSPolicies = table.rlsPolicies.length > 0;
      const hasLGPDCompliantPolicies = table.rlsPolicies.some(p => p.lgpdCompliant);

      if (hasRLSPolicies && hasLGPDCompliantPolicies) {
        tablesWithProperRLS++;
      }
    }

    return tablesWithProperRLS / healthcareTables.length;
  }

  private assessLGPDConsentManagement(result: SupabaseValidationResult): number {
    // Look for consent management tables and functions
    const consentTables = result.database.schema.tables.filter(t =>
      t.name.toLowerCase().includes('consent')
      || t.name.toLowerCase().includes('permission')
      || t.name.toLowerCase().includes('authorization')
    );

    const consentFunctions = result.database.schema.functions.filter(f =>
      f.name.toLowerCase().includes('consent')
      || f.name.toLowerCase().includes('permission')
      || f.definition.toLowerCase().includes('consent')
    );

    // Basic consent infrastructure present
    if (consentTables.length > 0 || consentFunctions.length > 0) {
      return 0.7; // 70% for having consent infrastructure
    }

    return 0.2; // 20% for minimal compliance
  }

  private assessLGPDAuditTrail(result: SupabaseValidationResult): number {
    const auditTables = result.database.schema.tables.filter(t =>
      t.name.toLowerCase().includes('audit')
      || t.name.toLowerCase().includes('log')
      || t.name.toLowerCase().includes('history')
    );

    const auditTriggers = result.database.schema.triggers.filter(t => t.isAuditTrigger);
    const auditFunctions = result.database.schema.functions.filter(f => f.hasAuditLogging);

    let score = 0;

    if (auditTables.length > 0) score += 0.4;
    if (auditTriggers.length > 0) score += 0.3;
    if (auditFunctions.length > 0) score += 0.3;

    return score;
  }

  private assessLGPDDataMinimization(result: SupabaseValidationResult): number {
    // Check if healthcare tables have appropriate field restrictions
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    if (healthcareTables.length === 0) return 1.0;

    let optimizedTables = 0;

    for (const table of healthcareTables) {
      // Check if table has focused, specific columns rather than catch-all fields
      const hasSpecificFields = table.columns.length < 20; // Reasonable number of columns
      const noGenericFields = !table.columns.some(c =>
        c.name.toLowerCase().includes('data')
        || c.name.toLowerCase().includes('info')
        || c.name.toLowerCase().includes('details')
        || c.type.toLowerCase().includes('json') && c.name.toLowerCase().includes('meta')
      );

      if (hasSpecificFields && noGenericFields) {
        optimizedTables++;
      }
    }

    return optimizedTables / healthcareTables.length;
  }

  private assessLGPDRightToErasure(result: SupabaseValidationResult): number {
    // Look for deletion/erasure functions and policies
    const deletionFunctions = result.database.schema.functions.filter(f =>
      f.name.toLowerCase().includes('delete')
      || f.name.toLowerCase().includes('erase')
      || f.name.toLowerCase().includes('anonymize')
      || f.definition.toLowerCase().includes('delete')
      || f.definition.toLowerCase().includes('right to erasure')
    );

    const deletionPolicies = result.database.rlsPolicies.total > 0
      ? result.database.schema.tables.some(t => t.rlsPolicies.some(p => p.command === 'DELETE'))
      : false;

    let score = 0;

    if (deletionFunctions.length > 0) score += 0.6;
    if (deletionPolicies) score += 0.4;

    return score;
  }
  private assessANVISADataSecurity(result: SupabaseValidationResult): number {
    let score = 0;

    // Check for encryption patterns
    const hasEncryption = result.database.schema.functions.some(f =>
      f.definition.toLowerCase().includes('encrypt')
      || f.definition.toLowerCase().includes('decrypt')
      || f.definition.toLowerCase().includes('pgp_sym')
    );

    if (hasEncryption) score += 0.4;

    // Check for secure authentication
    const hasSecureAuth = result.configuration.clientConfiguration.healthcareOptimized;
    if (hasSecureAuth) score += 0.3;

    // Check for RLS on healthcare tables
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    const healthcareTablesWithRLS = healthcareTables.filter(t => t.rlsPolicies.length > 0);

    if (healthcareTables.length > 0) {
      score += (healthcareTablesWithRLS.length / healthcareTables.length) * 0.3;
    }

    return score;
  }

  private assessANVISAHealthcareWorkflow(result: SupabaseValidationResult): number {
    // Check for healthcare-specific tables and workflows
    const healthcareWorkflowTables = [
      'patients',
      'appointments',
      'prescriptions',
      'diagnoses',
      'treatments',
      'medical_records',
      'consultations',
      'pacientes',
      'consultas',
      'receitas',
      'diagnosticos',
      'tratamentos',
      'prontuarios',
    ];

    let workflowTablesFound = 0;

    for (const table of result.database.schema.tables) {
      if (healthcareWorkflowTables.some(workflow => table.name.toLowerCase().includes(workflow))) {
        workflowTablesFound++;
      }
    }

    // Check for healthcare-specific functions
    const healthcareFunctions = result.database.schema.functions.filter(f =>
      f.isHealthcareRelated || this.isHealthcareRelatedTable(f.name, f.definition)
    );

    let score = 0;

    // Workflow table coverage (up to 0.6)
    score += Math.min(workflowTablesFound / 5, 0.6);

    // Healthcare functions (up to 0.4)
    score += Math.min(healthcareFunctions.length / 3, 0.4);

    return score;
  }

  private assessANVISAPatientSafety(result: SupabaseValidationResult): number {
    let score = 0;

    // Check for patient identification and safety measures
    const patientTables = result.database.schema.tables.filter(t =>
      t.name.toLowerCase().includes('patient')
      || t.name.toLowerCase().includes('paciente')
      || t.name.toLowerCase().includes('user') && t.isHealthcareRelated
    );

    if (patientTables.length > 0) {
      score += 0.3;

      // Check for proper patient identification fields
      const hasPatientId = patientTables.some(t => t.columns.some(c => c.primaryKey || c.unique));

      if (hasPatientId) score += 0.2;

      // Check for patient data protection
      const hasDataProtection = patientTables.some(t =>
        t.rlsPolicies.some(p => p.healthcareCompliant)
      );

      if (hasDataProtection) score += 0.3;
    }

    // Check for medication safety measures
    const prescriptionTables = result.database.schema.tables.filter(t =>
      t.name.toLowerCase().includes('prescription')
      || t.name.toLowerCase().includes('medication')
      || t.name.toLowerCase().includes('receita')
      || t.name.toLowerCase().includes('medicamento')
    );

    if (prescriptionTables.length > 0) score += 0.2;

    return score;
  }

  private assessANVISARegulatory(result: SupabaseValidationResult): number {
    // Check for regulatory compliance features
    let score = 0;

    // Check for audit trails (mandatory for ANVISA)
    const hasAuditTrail = result.database.schema.triggers.some(t => t.isAuditTrigger)
      || result.database.schema.functions.some(f => f.hasAuditLogging);

    if (hasAuditTrail) score += 0.4;

    // Check for data retention policies
    const hasRetentionPolicies = result.database.schema.functions.some(f =>
      f.definition.toLowerCase().includes('retention')
      || f.definition.toLowerCase().includes('archive')
      || f.definition.toLowerCase().includes('purge')
    );

    if (hasRetentionPolicies) score += 0.3;

    // Check for compliance reporting functions
    const hasReportingFunctions = result.database.schema.functions.some(f =>
      f.name.toLowerCase().includes('report')
      || f.name.toLowerCase().includes('compliance')
      || f.definition.toLowerCase().includes('anvisa')
    );

    if (hasReportingFunctions) score += 0.3;

    return score;
  }

  private assessANVISATraceability(result: SupabaseValidationResult): number {
    // Check for data traceability and change tracking
    let score = 0;

    // Check for versioning or history tables
    const hasVersioning = result.database.schema.tables.some(t =>
      t.name.toLowerCase().includes('history')
      || t.name.toLowerCase().includes('version')
      || t.name.toLowerCase().includes('audit')
      || t.columns.some(c =>
        c.name.toLowerCase().includes('version')
        || c.name.toLowerCase().includes('created_at')
        || c.name.toLowerCase().includes('updated_at')
      )
    );

    if (hasVersioning) score += 0.5;

    // Check for change tracking triggers
    const hasChangeTracking = result.database.schema.triggers.some(t =>
      t.name.toLowerCase().includes('track')
      || t.name.toLowerCase().includes('history')
      || t.name.toLowerCase().includes('audit')
    );

    if (hasChangeTracking) score += 0.3;

    // Check for user action logging
    const hasUserActionLogging = result.database.schema.functions.some(f =>
      f.definition.toLowerCase().includes('log_user_action')
      || f.definition.toLowerCase().includes('track_access')
    );

    if (hasUserActionLogging) score += 0.2;

    return score;
  }

  private async validateSecurity(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('🔒 Validating security configurations...');

    // Initialize security result
    result.security.dataEncryption = {
      atRest: false,
      inTransit: false,
      keyManagement: 'none',
      issues: [],
    };

    result.security.auditLogging = {
      enabled: false,
      coverage: [],
      missing: [],
      healthcareCompliant: false,
    };

    // Check for encryption configuration
    await this.validateEncryption(projectPath, result);

    // Check for audit logging
    this.validateAuditLogging(result);

    // Check for authentication and authorization
    this.validateAuthenticationSecurity(result);

    // Calculate security score
    this.calculateSecurityScore(result);
  }

  private async validateEncryption(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Check for encryption functions in database
    const encryptionFunctions = result.database.schema.functions.filter(f =>
      f.definition.toLowerCase().includes('encrypt')
      || f.definition.toLowerCase().includes('decrypt')
      || f.definition.toLowerCase().includes('pgp_sym')
      || f.definition.toLowerCase().includes('gen_salt')
    );

    if (encryptionFunctions.length > 0) {
      result.security.dataEncryption.atRest = true;
      result.security.dataEncryption.keyManagement = 'database';
    }

    // Check for SSL/TLS configuration
    const configFiles = ['supabase/config.toml', '.env', '.env.local'];

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');

        if (content.includes('ssl=require') || content.includes('sslmode=require')) {
          result.security.dataEncryption.inTransit = true;
        }

        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Check for encryption issues
    if (!result.security.dataEncryption.atRest) {
      result.security.dataEncryption.issues.push(
        'No encryption at rest detected for sensitive healthcare data',
      );
    }

    if (!result.security.dataEncryption.inTransit) {
      result.security.dataEncryption.issues.push('SSL/TLS not enforced for database connections');
    }
  }

  private validateAuditLogging(result: SupabaseValidationResult): void {
    // Check for audit logging infrastructure
    const auditTables = result.database.schema.tables.filter(t =>
      t.name.toLowerCase().includes('audit')
      || t.name.toLowerCase().includes('log')
      || t.name.toLowerCase().includes('access_log')
    );

    const auditTriggers = result.database.schema.triggers.filter(t => t.isAuditTrigger);
    const auditFunctions = result.database.schema.functions.filter(f => f.hasAuditLogging);

    if (auditTables.length > 0 || auditTriggers.length > 0 || auditFunctions.length > 0) {
      result.security.auditLogging.enabled = true;
    }

    // Check coverage
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    const tablesWithAuditTriggers = healthcareTables.filter(t =>
      result.database.schema.triggers.some(trigger =>
        trigger.table === t.name && trigger.isAuditTrigger
      )
    );

    result.security.auditLogging.coverage = tablesWithAuditTriggers.map(t => t.name);

    // Identify missing audit coverage
    for (const table of healthcareTables) {
      if (!result.security.auditLogging.coverage.includes(table.name)) {
        result.security.auditLogging.missing.push(table.name);
      }
    }

    // Assess healthcare compliance
    result.security.auditLogging.healthcareCompliant =
      result.security.auditLogging.coverage.length >= healthcareTables.length * 0.8; // 80% coverage
  }

  private validateAuthenticationSecurity(result: SupabaseValidationResult): void {
    // Check RLS policies for proper authentication
    let authenticationIssues = 0;
    const totalPolicies = result.database.rlsPolicies.total;

    for (const table of result.database.schema.tables) {
      for (const policy of table.rlsPolicies) {
        // Check if policy uses authentication
        const policyText = `${policy.using || ''} ${policy.withCheck || ''}`.toLowerCase();

        if (!policyText.includes('auth.') && !policyText.includes('current_user')) {
          authenticationIssues++;
          result.security.issues.push(
            `Policy ${policy.name} on table ${table.name} may allow unauthenticated access`,
          );
        }

        // Check for overly permissive policies
        if (policy.roles.includes('anon') && table.isHealthcareRelated) {
          result.security.issues.push(
            `Policy ${policy.name} allows anonymous access to healthcare data in table ${table.name}`,
          );
        }
      }
    }

    // Check for missing authentication on healthcare tables
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    const unauthenticatedTables = healthcareTables.filter(t =>
      t.rlsPolicies.length === 0
      || t.rlsPolicies.some(p => p.roles.includes('anon') || p.roles.includes('public'))
    );

    for (const table of unauthenticatedTables) {
      result.security.issues.push(
        `Healthcare table ${table.name} may allow unauthenticated access`,
      );
    }
  }

  private calculateSecurityScore(result: SupabaseValidationResult): void {
    let score = 100;

    // Deduct points for security issues
    score -= result.security.issues.length * 10;
    score -= result.security.dataEncryption.issues.length * 15;
    score -= result.database.rlsPolicies.issues.length * 5;
    score -= result.realtime.securityIssues.length * 10;

    // Bonus points for good security practices
    if (result.security.dataEncryption.atRest) score += 10;
    if (result.security.dataEncryption.inTransit) score += 10;
    if (result.security.auditLogging.enabled) score += 15;
    if (result.security.auditLogging.healthcareCompliant) score += 10;

    // Ensure score is within bounds
    result.security.score = Math.max(0, Math.min(100, score));

    // Generate security recommendations
    if (result.security.score < 70) {
      result.security.recommendations.push(
        'Implement comprehensive RLS policies for all healthcare tables',
      );
      result.security.recommendations.push('Enable encryption for sensitive healthcare data');
      result.security.recommendations.push(
        'Set up comprehensive audit logging for all data access',
      );
    }

    if (!result.security.auditLogging.healthcareCompliant) {
      result.security.recommendations.push(
        'Extend audit logging coverage to all healthcare-related tables',
      );
    }

    if (result.realtime.securityIssues.length > 0) {
      result.security.recommendations.push(
        'Review and secure real-time subscriptions for healthcare data',
      );
    }
  }

  private async analyzePerformance(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    console.log('⚡ Analyzing performance optimizations...');

    // Initialize performance result
    result.performance.databaseOptimization = {
      indexing: {
        score: 0,
        recommendations: [],
        healthcareOptimized: [],
      },
      queryPatterns: {
        optimized: 0,
        needsImprovement: 0,
        recommendations: [],
      },
    };

    result.performance.connectionPooling = {
      configured: false,
      optimal: false,
      recommendations: [],
    };

    // Analyze database indexing
    this.analyzeIndexing(result);

    // Analyze connection pooling
    await this.analyzeConnectionPooling(projectPath, result);

    // Analyze query patterns
    await this.analyzeQueryPatterns(projectPath, result);
  }

  private analyzeIndexing(result: SupabaseValidationResult): void {
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    let indexedTables = 0;
    let healthcareOptimizedIndexes = 0;

    for (const table of healthcareTables) {
      let tableHasIndexes = false;

      // Check for primary key indexes
      if (table.columns.some(c => c.primaryKey)) {
        tableHasIndexes = true;
      }

      // Check for foreign key indexes
      if (table.columns.some(c => c.foreignKey)) {
        tableHasIndexes = true;
      }

      // Check for healthcare-specific optimized indexes
      const hasHealthcareOptimizedIndexes = table.indexes.some(idx => idx.healthcareOptimized)
        || table.columns.some(c =>
          (c.name.includes('patient') || c.name.includes('appointment')
            || c.name.includes('medical'))
          && (c.unique || c.primaryKey)
        );

      if (hasHealthcareOptimizedIndexes) {
        healthcareOptimizedIndexes++;
        result.performance.databaseOptimization.indexing.healthcareOptimized.push(table.name);
      }

      if (tableHasIndexes) {
        indexedTables++;
      } else {
        result.performance.databaseOptimization.indexing.recommendations.push(
          `Add indexes for healthcare table: ${table.name}`,
        );
      }
    }

    // Calculate indexing score
    if (healthcareTables.length > 0) {
      result.performance.databaseOptimization.indexing.score =
        (indexedTables / healthcareTables.length) * 100;
    } else {
      result.performance.databaseOptimization.indexing.score = 100;
    }

    // Add healthcare-specific indexing recommendations
    if (healthcareOptimizedIndexes < healthcareTables.length * 0.5) {
      result.performance.databaseOptimization.indexing.recommendations.push(
        'Consider adding composite indexes for common healthcare query patterns (patient_id + date, appointment_time + status)',
      );
    }
  }

  private async analyzeConnectionPooling(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Check for connection pooling configuration
    const configFiles = [
      'supabase/config.toml',
      'src/lib/supabase.ts',
      'src/utils/supabase.ts',
      'database/config.ts',
    ];

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile);
      try {
        await access(filePath, constants.F_OK);
        const content = await readFile(filePath, 'utf-8');

        // Check for connection pool settings
        if (
          content.includes('pool') || content.includes('connection')
          || content.includes('max_connections')
        ) {
          result.performance.connectionPooling.configured = true;
        }

        // Check for optimal settings
        if (content.includes('pool_size') || content.includes('max_pool_size')) {
          result.performance.connectionPooling.optimal = true;
        }

        result.performance.filesProcessed++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Generate recommendations
    if (!result.performance.connectionPooling.configured) {
      result.performance.connectionPooling.recommendations.push(
        'Configure connection pooling for better performance with healthcare workloads',
      );
    }

    if (!result.performance.connectionPooling.optimal) {
      result.performance.connectionPooling.recommendations.push(
        'Optimize connection pool size based on expected concurrent healthcare users',
      );
    }
  }

  private async analyzeQueryPatterns(
    projectPath: string,
    result: SupabaseValidationResult,
  ): Promise<void> {
    // Look for SQL query patterns in the codebase
    const queryFiles = [];
    const searchPaths = ['src', 'lib', 'utils', 'queries'];

    for (const searchPath of searchPaths) {
      const fullPath = join(projectPath, searchPath);
      try {
        await access(fullPath, constants.F_OK);
        await this.findQueryFiles(fullPath, queryFiles);
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }

    let optimizedQueries = 0;
    let needsImprovement = 0;

    for (const queryFile of queryFiles) {
      try {
        const content = await readFile(queryFile, 'utf-8');

        // Analyze query patterns
        const queryAnalysis = this.analyzeQueryContent(content);
        optimizedQueries += queryAnalysis.optimized;
        needsImprovement += queryAnalysis.needsImprovement;

        result.performance.filesProcessed++;
      } catch (error) {
        // File read failed, continue
      }
    }

    result.performance.databaseOptimization.queryPatterns.optimized = optimizedQueries;
    result.performance.databaseOptimization.queryPatterns.needsImprovement = needsImprovement;

    // Generate query optimization recommendations
    if (needsImprovement > optimizedQueries) {
      result.performance.databaseOptimization.queryPatterns.recommendations.push(
        'Use specific column selection instead of SELECT *',
      );
      result.performance.databaseOptimization.queryPatterns.recommendations.push(
        'Add WHERE clauses with indexed columns for healthcare queries',
      );
      result.performance.databaseOptimization.queryPatterns.recommendations.push(
        'Consider using LIMIT for large healthcare datasets',
      );
    }
  }

  private async findQueryFiles(dirPath: string, queryFiles: string[]): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.findQueryFiles(fullPath, queryFiles);
        } else if (
          entry.isFile() && (
            entry.name.endsWith('.ts')
            || entry.name.endsWith('.js')
            || entry.name.endsWith('.sql')
          )
        ) {
          queryFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Directory read failed, continue
    }
  }

  private analyzeQueryContent(content: string): { optimized: number; needsImprovement: number } {
    const lines = content.split('\n');
    let optimized = 0;
    let needsImprovement = 0;

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();

      // Check for SQL patterns
      if (lowerLine.includes('select')) {
        if (lowerLine.includes('select *')) {
          needsImprovement++;
        } else if (lowerLine.includes('where') && lowerLine.includes('limit')) {
          optimized++;
        } else if (lowerLine.includes('where')) {
          optimized++;
        } else {
          needsImprovement++;
        }
      }
    }

    return { optimized, needsImprovement };
  }

  private generateHealthcareRecommendations(result: SupabaseValidationResult): void {
    const recommendations = result.healthcareCompliance.recommendations;

    // LGPD Recommendations
    if (result.healthcareCompliance.lgpdScore < 80) {
      recommendations.push('Implement comprehensive data classification for all healthcare fields');
      recommendations.push('Add consent management system for patient data processing');
      recommendations.push('Enable comprehensive audit logging for all healthcare data access');
    }

    if (result.healthcareCompliance.lgpdScore < 60) {
      recommendations.push('Implement right to erasure functionality for patient data');
      recommendations.push('Add data minimization controls to limit healthcare data exposure');
    }

    // ANVISA Recommendations
    if (result.healthcareCompliance.anvisaScore < 80) {
      recommendations.push(
        'Implement healthcare workflow tables (patients, appointments, prescriptions)',
      );
      recommendations.push('Add patient safety controls and identification measures');
      recommendations.push('Enable regulatory compliance reporting functions');
    }

    if (result.healthcareCompliance.anvisaScore < 60) {
      recommendations.push('Implement comprehensive data traceability for healthcare operations');
      recommendations.push('Add medication safety and prescription tracking');
    }

    // Overall Recommendations
    if (result.healthcareCompliance.overallScore < 70) {
      recommendations.push('Conduct comprehensive healthcare compliance audit with legal team');
      recommendations.push('Implement LGPD-compliant data processing workflows');
      recommendations.push('Add ANVISA-compliant healthcare operation tracking');
    }
  }

  private identifyHealthcareCriticalIssues(result: SupabaseValidationResult): void {
    const criticalIssues = result.healthcareCompliance.criticalIssues;

    // Critical LGPD Issues
    const healthcareTables = result.database.schema.tables.filter(t => t.isHealthcareRelated);
    const tablesWithoutRLS = healthcareTables.filter(t => t.rlsPolicies.length === 0);

    if (tablesWithoutRLS.length > 0) {
      criticalIssues.push(
        `CRITICAL: ${tablesWithoutRLS.length} healthcare tables lack RLS policies: ${
          tablesWithoutRLS.map(t => t.name).join(', ')
        }`,
      );
    }

    // Critical Security Issues
    if (!result.security.auditLogging.enabled) {
      criticalIssues.push('CRITICAL: No audit logging detected for healthcare data access');
    }

    if (!result.security.dataEncryption.atRest) {
      criticalIssues.push('CRITICAL: No encryption at rest detected for sensitive healthcare data');
    }

    // Critical Real-time Issues
    if (result.realtime.securityIssues.length > 0) {
      criticalIssues.push(
        `CRITICAL: ${result.realtime.securityIssues.length} real-time security issues detected`,
      );
    }

    // Critical Configuration Issues
    if (result.configuration.environmentVariables.insecure.length > 0) {
      criticalIssues.push('CRITICAL: Insecure configuration detected in environment variables');
    }
  }

  private calculateOverallValidity(result: SupabaseValidationResult): boolean {
    // Configuration must be valid
    if (!result.configuration.valid) return false;

    // Must have minimal healthcare compliance
    if (result.healthcareCompliance.overallScore < 50) return false;

    // Security score must be acceptable
    if (result.security.score < 60) return false;

    // No critical healthcare compliance issues
    if (result.healthcareCompliance.criticalIssues.length > 0) return false;

    // Database schema must be reasonably valid
    if (result.database.schema.issues.length > 10) return false;

    return true;
  }

  // Public method to get validation summary
  getValidationSummary(result: SupabaseValidationResult): string {
    return `
🔍 Supabase Healthcare Audit Summary
=====================================

📊 Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}

🏥 Healthcare Compliance:
  • LGPD Score: ${result.healthcareCompliance.lgpdScore.toFixed(1)}/100
  • ANVISA Score: ${result.healthcareCompliance.anvisaScore.toFixed(1)}/100  
  • Overall Score: ${result.healthcareCompliance.overallScore.toFixed(1)}/100

🔒 Security Assessment:
  • Security Score: ${result.security.score}/100
  • Encryption at Rest: ${result.security.dataEncryption.atRest ? '✅' : '❌'}
  • Encryption in Transit: ${result.security.dataEncryption.inTransit ? '✅' : '❌'}
  • Audit Logging: ${result.security.auditLogging.enabled ? '✅' : '❌'}

🗄️ Database Analysis:
  • Total Tables: ${result.database.schema.tables.length}
  • Healthcare Tables: ${result.database.schema.tables.filter(t => t.isHealthcareRelated).length}
  • RLS Policies: ${result.database.rlsPolicies.total}
  • Healthcare Compliant: ${result.database.rlsPolicies.healthcareCompliant}

⚡ Real-time Configuration:
  • Configured: ${result.realtime.configured ? '✅' : '❌'}
  • Healthcare Channels: ${result.realtime.healthcareChannels.length}
  • Security Issues: ${result.realtime.securityIssues.length}

⚡ Performance:
  • Processing Time: ${result.performance.duration.toFixed(2)}ms
  • Files Processed: ${result.performance.filesProcessed}
  • Memory Usage: ${(result.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB

🚨 Critical Issues: ${result.healthcareCompliance.criticalIssues.length}
⚠️ Warnings: ${result.warnings.length}
❌ Errors: ${result.errors.length}
    `.trim();
  }
}
