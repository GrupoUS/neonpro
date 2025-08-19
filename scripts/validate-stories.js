#!/usr/bin/env node
/**
 * NeonPro Story Validation Script
 * Verifica automaticamente o status real das stories e atualiza o roadmap
 *
 * Usage: node scripts/validate-stories.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Configurações
const STORIES_DIR = 'docs/shards/stories';
const _ROADMAP_FILE = 'docs/NEONPRO_DETAILED_ROADMAP_2025.md';
const _IMPLEMENTATION_GUIDE = 'docs/IMPLEMENTATION_GUIDE_2025.md';
const SRC_DIR = 'src';

// Cores para output
const _colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class StoryValidator {
  constructor() {
    this.results = {
      completed: [],
      inProgress: [],
      pending: [],
      errors: [],
    };
  }

  log(_message, _color = 'reset') {}

  /**
   * Verifica se uma story está realmente implementada
   */
  async validateStoryImplementation(storyFile) {
    try {
      const storyPath = path.join(STORIES_DIR, storyFile);
      const content = fs.readFileSync(storyPath, 'utf8');

      // Extrair informações da story
      const storyInfo = this.parseStoryFile(content, storyFile);

      // Verificar implementação
      const implementationStatus = await this.checkImplementation(storyInfo);

      // Verificar testes
      const testStatus = await this.checkTests(storyInfo);

      // Verificar arquivos
      const fileStatus = this.checkFiles(storyInfo);

      // Calcular status final
      const finalStatus = this.calculateFinalStatus({
        implementation: implementationStatus,
        tests: testStatus,
        files: fileStatus,
        declared: storyInfo.declaredStatus,
      });

      return {
        ...storyInfo,
        validation: {
          implementation: implementationStatus,
          tests: testStatus,
          files: fileStatus,
          finalStatus,
        },
      };
    } catch (error) {
      this.results.errors.push({
        story: storyFile,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Parse do arquivo de story
   */
  parseStoryFile(content, filename) {
    const lines = content.split('\n');

    // Extrair status declarado
    const statusLine = lines.find(
      (line) => line.includes('Status:') || line.includes('**Status**:')
    );
    const declaredStatus = this.extractStatus(statusLine);

    // Extrair título
    const titleLine = lines.find(
      (line) => line.startsWith('# ') || line.startsWith('## ')
    );
    const title = titleLine ? titleLine.replace(/^#+\s*/, '') : filename;

    // Extrair epic
    const epicMatch = filename.match(/^(\d+)\./);
    const epic = epicMatch ? `Epic ${epicMatch[1]}` : 'Unknown';

    // Extrair arquivos mencionados
    const mentionedFiles = this.extractMentionedFiles(content);

    return {
      filename,
      title,
      epic,
      declaredStatus,
      mentionedFiles,
    };
  }

  /**
   * Extrai status do texto
   */
  extractStatus(statusLine) {
    if (!statusLine) {
      return 'UNKNOWN';
    }

    if (statusLine.includes('COMPLETED') || statusLine.includes('✅')) {
      return 'COMPLETED';
    }
    if (statusLine.includes('IN_PROGRESS') || statusLine.includes('🔄')) {
      return 'IN_PROGRESS';
    }
    if (statusLine.includes('PENDING') || statusLine.includes('⏳')) {
      return 'PENDING';
    }

    return 'UNKNOWN';
  }

  /**
   * Extrai arquivos mencionados na story
   */
  extractMentionedFiles(content) {
    const fileRegex = /`([^`]+\.(ts|tsx|js|jsx|sql|md))`/g;
    const files = [];
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
      files.push(match[1]);
    }

    return [...new Set(files)]; // Remove duplicatas
  }

  /**
   * Verifica se os arquivos mencionados existem
   */
  checkFiles(storyInfo) {
    const results = {
      total: storyInfo.mentionedFiles.length,
      existing: 0,
      missing: [],
      score: 0,
    };

    storyInfo.mentionedFiles.forEach((file) => {
      const fullPath = path.join(SRC_DIR, file);
      if (fs.existsSync(fullPath)) {
        results.existing++;
      } else {
        results.missing.push(file);
      }
    });

    results.score =
      results.total > 0 ? (results.existing / results.total) * 100 : 0;

    return results;
  }

  /**
   * Verifica implementação através de busca no código
   */
  async checkImplementation(storyInfo) {
    try {
      // Buscar por palavras-chave relacionadas à story
      const keywords = this.extractKeywords(storyInfo.title);
      let implementationScore = 0;
      const foundImplementations = [];

      for (const keyword of keywords) {
        try {
          const searchResult = execSync(
            `grep -r "${keyword}" ${SRC_DIR} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true`,
            { encoding: 'utf8' }
          );

          if (searchResult.trim()) {
            implementationScore += 20;
            foundImplementations.push(keyword);
          }
        } catch (_error) {
          // Ignorar erros de grep
        }
      }

      return {
        score: Math.min(implementationScore, 100),
        keywords,
        foundImplementations,
      };
    } catch (error) {
      return {
        score: 0,
        error: error.message,
      };
    }
  }

  /**
   * Extrai palavras-chave do título da story
   */
  extractKeywords(title) {
    const commonWords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ];

    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5); // Máximo 5 palavras-chave
  }

  /**
   * Verifica testes relacionados
   */
  async checkTests(storyInfo) {
    try {
      const testDirs = ['__tests__', 'tests', 'test'];
      let testsFound = 0;
      let testsTotal = 0;

      for (const testDir of testDirs) {
        const fullTestDir = path.join(SRC_DIR, testDir);
        if (fs.existsSync(fullTestDir)) {
          // Buscar por arquivos de teste relacionados
          const keywords = this.extractKeywords(storyInfo.title);

          for (const keyword of keywords) {
            try {
              const searchResult = execSync(
                `find ${fullTestDir} -name "*.test.*" -o -name "*.spec.*" | xargs grep -l "${keyword}" 2>/dev/null || true`,
                { encoding: 'utf8' }
              );

              if (searchResult.trim()) {
                testsFound++;
              }
              testsTotal++;
            } catch (_error) {
              // Ignorar erros
            }
          }
        }
      }

      return {
        found: testsFound,
        total: testsTotal,
        score: testsTotal > 0 ? (testsFound / testsTotal) * 100 : 0,
      };
    } catch (error) {
      return {
        found: 0,
        total: 0,
        score: 0,
        error: error.message,
      };
    }
  }

  /**
   * Calcula status final baseado em todas as verificações
   */
  calculateFinalStatus(checks) {
    const { implementation, tests, files, declared } = checks;

    // Critérios para COMPLETED
    const isImplemented = implementation.score >= 60;
    const hasFiles = files.score >= 70;
    const hasTests = tests.score >= 30;

    if (isImplemented && hasFiles && hasTests) {
      return 'COMPLETED';
    }
    if (isImplemented || hasFiles) {
      return 'IN_PROGRESS';
    }
    return 'PENDING';
  }

  /**
   * Executa validação de todas as stories
   */
  async validateAllStories() {
    this.log('🔍 Iniciando validação de stories...', 'blue');

    if (!fs.existsSync(STORIES_DIR)) {
      this.log(`❌ Diretório de stories não encontrado: ${STORIES_DIR}`, 'red');
      return;
    }

    const storyFiles = fs
      .readdirSync(STORIES_DIR)
      .filter((file) => file.endsWith('.story.md'))
      .sort();

    this.log(
      `📚 Encontradas ${storyFiles.length} stories para validar`,
      'blue'
    );

    for (const storyFile of storyFiles) {
      this.log(`\n📖 Validando ${storyFile}...`, 'yellow');

      const result = await this.validateStoryImplementation(storyFile);

      if (result) {
        const { validation } = result;

        // Classificar resultado
        switch (validation.finalStatus) {
          case 'COMPLETED':
            this.results.completed.push(result);
            this.log(
              `  ✅ COMPLETED (Impl: ${validation.implementation.score}%, Files: ${validation.files.score}%, Tests: ${validation.tests.score}%)`,
              'green'
            );
            break;
          case 'IN_PROGRESS':
            this.results.inProgress.push(result);
            this.log(
              `  🔄 IN_PROGRESS (Impl: ${validation.implementation.score}%, Files: ${validation.files.score}%, Tests: ${validation.tests.score}%)`,
              'yellow'
            );
            break;
          case 'PENDING':
            this.results.pending.push(result);
            this.log(
              `  ⏳ PENDING (Impl: ${validation.implementation.score}%, Files: ${validation.files.score}%, Tests: ${validation.tests.score}%)`,
              'red'
            );
            break;
        }

        // Mostrar discrepâncias
        if (result.declaredStatus !== validation.finalStatus) {
          this.log(
            `  ⚠️  Status declarado (${result.declaredStatus}) difere do real (${validation.finalStatus})`,
            'yellow'
          );
        }
      }
    }

    this.generateReport();
  }

  /**
   * Gera relatório final
   */
  generateReport() {
    this.log(`\n${'='.repeat(60)}`, 'bold');
    this.log('📊 RELATÓRIO DE VALIDAÇÃO DE STORIES', 'bold');
    this.log('='.repeat(60), 'bold');

    const total =
      this.results.completed.length +
      this.results.inProgress.length +
      this.results.pending.length;

    this.log('\n📈 RESUMO GERAL:', 'blue');
    this.log(`  Total de stories: ${total}`);
    this.log(
      `  ✅ Completed: ${this.results.completed.length} (${((this.results.completed.length / total) * 100).toFixed(1)}%)`,
      'green'
    );
    this.log(
      `  🔄 In Progress: ${this.results.inProgress.length} (${((this.results.inProgress.length / total) * 100).toFixed(1)}%)`,
      'yellow'
    );
    this.log(
      `  ⏳ Pending: ${this.results.pending.length} (${((this.results.pending.length / total) * 100).toFixed(1)}%)`,
      'red'
    );

    if (this.results.errors.length > 0) {
      this.log(`  ❌ Errors: ${this.results.errors.length}`, 'red');
    }

    // Stories com discrepâncias
    const discrepancies = [
      ...this.results.completed,
      ...this.results.inProgress,
      ...this.results.pending,
    ].filter((story) => story.declaredStatus !== story.validation.finalStatus);

    if (discrepancies.length > 0) {
      this.log(
        `\n⚠️  DISCREPÂNCIAS ENCONTRADAS (${discrepancies.length}):`,
        'yellow'
      );
      discrepancies.forEach((story) => {
        this.log(
          `  ${story.filename}: ${story.declaredStatus} → ${story.validation.finalStatus}`
        );
      });
    }

    // Top stories por implementação
    const topImplemented = [
      ...this.results.completed,
      ...this.results.inProgress,
    ]
      .sort(
        (a, b) =>
          b.validation.implementation.score - a.validation.implementation.score
      )
      .slice(0, 5);

    if (topImplemented.length > 0) {
      this.log('\n🏆 TOP 5 STORIES MAIS IMPLEMENTADAS:', 'green');
      topImplemented.forEach((story, index) => {
        this.log(
          `  ${index + 1}. ${story.filename} (${story.validation.implementation.score}%)`
        );
      });
    }

    // Stories que precisam de atenção
    const needsAttention = this.results.inProgress
      .filter((story) => story.validation.files.score < 50)
      .sort((a, b) => a.validation.files.score - b.validation.files.score);

    if (needsAttention.length > 0) {
      this.log('\n🚨 STORIES QUE PRECISAM DE ATENÇÃO:', 'red');
      needsAttention.forEach((story) => {
        this.log(
          `  ${story.filename} (Files: ${story.validation.files.score}%, Missing: ${story.validation.files.missing.length})`
        );
      });
    }

    this.log(`\n${'='.repeat(60)}`, 'bold');

    // Salvar relatório em arquivo
    this.saveReportToFile();
  }

  /**
   * Salva relatório em arquivo
   */
  saveReportToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `docs/validation-reports/story-validation-${timestamp}.json`;

    // Criar diretório se não existir
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total:
          this.results.completed.length +
          this.results.inProgress.length +
          this.results.pending.length,
        completed: this.results.completed.length,
        inProgress: this.results.inProgress.length,
        pending: this.results.pending.length,
        errors: this.results.errors.length,
      },
      details: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n💾 Relatório salvo em: ${reportPath}`, 'blue');
  }
}

// Executar validação se chamado diretamente
if (require.main === module) {
  const validator = new StoryValidator();
  validator.validateAllStories().catch(console.error);
}

module.exports = StoryValidator;
