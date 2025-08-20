/**
 * NEONPRO Healthcare Developer Experience Tools
 * Comprehensive developer workflow optimization for healthcare SaaS
 * Quality Standard: ≥9.9/10 Healthcare Override
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export type HealthcareDeveloperConfig = {
  project: {
    name: string;
    type: 'healthcare-saas';
    compliance: string[];
    qualityStandard: string;
  };
  development: {
    autoSetup: boolean;
    healthcareMode: boolean;
    lgpdCompliance: boolean;
    testingFramework: string;
    linting: string;
  };
  productivity: {
    codeGeneration: boolean;
    autoFormatting: boolean;
    liveReload: boolean;
    hotPatching: boolean;
  };
  validation: {
    realTimeValidation: boolean;
    complianceChecks: boolean;
    performanceMonitoring: boolean;
    securityScanning: boolean;
  };
};

export class HealthcareDeveloperTools {
  private readonly rootPath: string;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.config = this.createHealthcareConfig();
  }

  private createHealthcareConfig(): HealthcareDeveloperConfig {
    return {
      project: {
        name: 'NEONPRO',
        type: 'healthcare-saas',
        compliance: ['LGPD', 'ISO27001', 'SOC2'],
        qualityStandard: '≥9.9/10',
      },
      development: {
        autoSetup: true,
        healthcareMode: true,
        lgpdCompliance: true,
        testingFramework: 'vitest',
        linting: 'biome-healthcare',
      },
      productivity: {
        codeGeneration: true,
        autoFormatting: true,
        liveReload: true,
        hotPatching: true,
      },
      validation: {
        realTimeValidation: true,
        complianceChecks: true,
        performanceMonitoring: true,
        securityScanning: true,
      },
    };
  }

  async optimizeDeveloperExperience(): Promise<void> {
    // 1. Setup development environment
    await this.setupDevelopmentEnvironment();

    // 2. Configure productivity tools
    await this.configureProductivityTools();

    // 3. Setup validation and monitoring
    await this.setupValidationTools();

    // 4. Create developer scripts and shortcuts
    await this.createDeveloperScripts();
  }
  private async setupDevelopmentEnvironment(): Promise<void> {
    // Create .vscode settings for healthcare development
    const vscodeDir = join(this.rootPath, '.vscode');
    await fs.mkdir(vscodeDir, { recursive: true });

    const vscodeSettings = {
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.biome': true,
        'source.organizeImports.biome': true,
      },
      'typescript.preferences.includePackageJsonAutoImports': 'on',
      'healthcare.mode': true,
      'lgpd.compliance': true,
      'biome.validate': [
        'javascript',
        'javascriptreact',
        'typescript',
        'typescriptreact',
      ],
      'editor.rulers': [100], // Healthcare code line limit
      'files.exclude': {
        '**/.turbo': true,
        '**/node_modules': true,
        '**/.next': true,
        '**/dist': true,
      },
      'search.exclude': {
        '**/node_modules': true,
        '**/.next': true,
        '**/dist': true,
        '**/.turbo': true,
      },
    };

    await fs.writeFile(
      join(vscodeDir, 'settings.json'),
      JSON.stringify(vscodeSettings, null, 2)
    );

    // Create recommended extensions for healthcare development
    const extensions = {
      recommendations: [
        'bradlc.vscode-tailwindcss',
        'biomejs.biome',
        'ms-vscode.vscode-typescript-next',
        'vitest.explorer',
        'ms-vscode.vscode-json',
        'redhat.vscode-yaml',
        'ms-vscode.hexeditor',
        'ms-vscode.powershell',
      ],
    };

    await fs.writeFile(
      join(vscodeDir, 'extensions.json'),
      JSON.stringify(extensions, null, 2)
    );
  }

  private async configureProductivityTools(): Promise<void> {
    // Create healthcare-specific snippets
    const snippets = {
      'Healthcare Patient Component': {
        prefix: 'hc-patient',
        body: [
          'interface ${1:PatientComponent}Props {',
          '  patient: HealthcareTestPatient;',
          '  tenantId: string;',
          '  lgpdCompliant?: boolean;',
          '}',
          '',
          'export const ${1:PatientComponent}: React.FC<${1:PatientComponent}Props> = ({',
          '  patient,',
          '  tenantId,',
          '  lgpdCompliant = true',
          '}) => {',
          '  // Healthcare component implementation',
          '  return (',
          '    <div className="healthcare-component">',
          '      {/* ${2:Component content} */}',
          '    </div>',
          '  );',
          '};',
        ],
        description:
          'Create a healthcare patient component with LGPD compliance',
      },

      'LGPD Consent Hook': {
        prefix: 'hc-lgpd-hook',
        body: [
          'const use${1:LGPD}Consent = (patientId: string) => {',
          '  const [consent, setConsent] = useState<LGPDConsentRecord | null>(null);',
          '  const [loading, setLoading] = useState(false);',
          '',
          "  const grantConsent = useCallback(async (type: LGPDConsentRecord['consentType']) => {",
          '    setLoading(true);',
          '    try {',
          '      const result = await lgpdService.grantConsent({',
          '        patientId,',
          '        consentType: type,',
          '        granted: true,',
          "        purpose: '${2:Healthcare data processing}',",
          "        dataCategories: ['personal_data', 'health_data'],",
          '        retentionPeriod: 60',
          '      });',
          '      setConsent(result);',
          '    } finally {',
          '      setLoading(false);',
          '    }',
          '  }, [patientId]);',
          '',
          '  return { consent, grantConsent, loading };',
          '};',
        ],
        description: 'Create LGPD consent management hook',
      },
    };

    const vscodeDir = join(this.rootPath, '.vscode');
    await fs.writeFile(
      join(vscodeDir, 'healthcare.code-snippets'),
      JSON.stringify(snippets, null, 2)
    );
  }
  private async setupValidationTools(): Promise<void> {
    // Create healthcare-specific Biome configuration
    const biomeHealthcareConfig = {
      $schema: 'https://biomejs.dev/schemas/2.2.0/schema.json',
      extends: ['ultracite'],
      files: {
        includes: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      },
      linter: {
        rules: {
          style: {
            noConsole: 'warn',
            useConst: 'error',
          },
          suspicious: {
            noExplicitAny: 'error',
          },
          correctness: {
            useExhaustiveDependencies: 'error',
          },
        },
      },
      formatter: {
        enabled: true,
        indentStyle: 'space',
        indentWidth: 2,
        lineWidth: 100,
      },
    };

    // Write Biome configuration for healthcare compliance
    await fs.writeFile(
      join(this.rootPath, 'biome.healthcare.jsonc'),
      JSON.stringify(biomeHealthcareConfig, null, 2)
    );
  }

  console;
  .
  log('✅ Healthcare Biome configuration created');

  // Create package.json scripts for healthcare validation
  const;
  packageJsonPath = join(this.rootPath, 'package.json');
  const;
  packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  packageJson;
  .
  scripts = {
    ...packageJson.scripts,
    'healthcare:lint': 'biome lint --config-path biome.healthcare.jsonc .',
    'healthcare:format': 'biome format --config-path biome.healthcare.jsonc .',
    'healthcare:check': 'biome check --config-path biome.healthcare.jsonc .',
    'healthcare:fix':
      'biome check --config-path biome.healthcare.jsonc --write .',
    'healthcare:validate': 'pnpm healthcare:check && pnpm test:unit',
  };

  await;
  fs;
  .
  writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)
  )
  console;
  .
  log('✅ Healthcare validation scripts added to package.json');
}

private
async;
createDeveloperScripts();
: Promise<void>
{
  // Create developer convenience scripts with Biome integration
  const devScripts = {
    'healthcare:setup': 'node tools/developer/healthcare-dev-tools.js',
    'healthcare:dev': "turbo dev --filter='apps/web' --env-mode=development",
    'healthcare:test:watch': 'turbo test:healthcare --watch',
    'healthcare:validate:quick': 'turbo typecheck healthcare:check --parallel',
    'healthcare:validate:full': 'turbo healthcare:full-validation',
    'healthcare:build:analyze': 'turbo build:healthcare --summarize --dry=json',
    'healthcare:performance':
      'artillery run tools/testing/configs/artillery-healthcare.yml',
    'healthcare:compliance': 'turbo validate:lgpd',
    'healthcare:db:reset': 'supabase db reset',
    'healthcare:db:migrate': 'supabase db push',
    'healthcare:clean': 'turbo clean && rm -rf node_modules/.cache',
  };

  // Update package.json with healthcare scripts
  const packageJsonPath = join(this.rootPath, 'package.json');
  try {
    const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageContent);

    packageJson.scripts = {
      ...packageJson.scripts,
      ...devScripts,
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (_error) {}

  // Create healthcare developer README
  const devReadme = `# Healthcare Developer Guide

## Quick Start
\`\`\`bash
# Setup healthcare development environment
pnpm healthcare:setup

# Start healthcare development server
pnpm healthcare:dev

# Run healthcare Biome validation
pnpm healthcare:check

# Auto-fix healthcare code formatting
pnpm healthcare:fix

# Run healthcare validation
pnpm healthcare:validate:quick
\`\`\`

## Healthcare Development Commands

### Development
- \`pnpm healthcare:dev\` - Start development server with healthcare mode
- \`pnpm healthcare:test:watch\` - Run tests in watch mode
- \`pnpm healthcare:validate:quick\` - Quick validation (TypeScript + ESLint)
- \`pnpm healthcare:validate:full\` - Full validation pipeline

### Testing & Quality
- \`pnpm healthcare:performance\` - Run performance tests
- \`pnpm healthcare:compliance\` - LGPD compliance validation
- \`pnpm test:healthcare\` - Run healthcare test suite

### Database
- \`pnpm healthcare:db:reset\` - Reset test database
- \`pnpm healthcare:db:migrate\` - Apply database migrations

### Utilities
- \`pnpm healthcare:clean\` - Clean all build artifacts and caches
- \`pnpm healthcare:build:analyze\` - Analyze build performance

## Healthcare Quality Standards
- **Quality Target**: ≥9.9/10
- **Test Coverage**: ≥95%
- **Performance**: P95 < 500ms, P99 < 1s
- **Compliance**: LGPD + ISO27001

## LGPD Compliance Checklist
- [ ] Patient consent validation
- [ ] Data encryption at rest and in transit
- [ ] Audit trail for all data access
- [ ] Tenant isolation verified
- [ ] Data retention policies implemented
`;

  await fs.writeFile(join(this.rootPath, 'HEALTHCARE-DEV-GUIDE.md'), devReadme);
}

async;
generateOptimizationReport();
: Promise<void>
{
}
}

// Execute optimization if run directly
if (require.main === module) {
  const devTools = new HealthcareDeveloperTools();
  devTools
    .optimizeDeveloperExperience()
    .then(() => devTools.generateOptimizationReport())
    .catch(console.error);
}

export { HealthcareDeveloperTools };
