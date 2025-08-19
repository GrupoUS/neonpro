#!/usr/bin/env node
/**
 * NeonPro Roadmap Update Script
 * Atualiza automaticamente o roadmap com base na validação real das stories
 *
 * Usage: node scripts/update-roadmap.js [--dry-run]
 */

const fs = require('node:fs');
const path = require('node:path');
const StoryValidator = require('./validate-stories');

// Configurações
const ROADMAP_FILE = 'docs/NEONPRO_DETAILED_ROADMAP_2025.md';
const BACKUP_DIR = 'docs/roadmap-backups';

class RoadmapUpdater {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.validator = new StoryValidator();
    this.changes = [];
  }

  log(_message, _color = 'reset') {
    const _colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
      bold: '\x1b[1m',
    };
  }

  /**
   * Cria backup do roadmap atual
   */
  createBackup() {
    if (!fs.existsSync(ROADMAP_FILE)) {
      this.log(`❌ Arquivo de roadmap não encontrado: ${ROADMAP_FILE}`, 'red');
      return false;
    }

    // Criar diretório de backup
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Criar backup com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `roadmap-backup-${timestamp}.md`);

    fs.copyFileSync(ROADMAP_FILE, backupPath);
    this.log(`💾 Backup criado: ${backupPath}`, 'blue');

    return true;
  }

  /**
   * Valida todas as stories e coleta resultados
   */
  async validateStories() {
    this.log('🔍 Validando stories para atualização do roadmap...', 'blue');

    // Executar validação silenciosa
    const originalLog = console.log;
    console.log = () => {}; // Silenciar logs da validação

    await this.validator.validateAllStories();

    console.log = originalLog; // Restaurar logs

    return this.validator.results;
  }

  /**
   * Atualiza o conteúdo do roadmap
   */
  updateRoadmapContent(validationResults) {
    const content = fs.readFileSync(ROADMAP_FILE, 'utf8');
    const lines = content.split('\n');
    const updatedLines = [];

    // Criar mapa de stories por filename
    const storyMap = new Map();

    [
      ...validationResults.completed,
      ...validationResults.inProgress,
      ...validationResults.pending,
    ].forEach((story) => {
      const storyNumber = story.filename.replace('.story.md', '');
      storyMap.set(storyNumber, story);
    });

    let inStorySection = false;
    let currentStoryNumber = null;
    let changesMade = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar início de uma story
      const storyMatch = line.match(/###\s+Story\s+(\d+\.\d+):/i);
      if (storyMatch) {
        inStorySection = true;
        currentStoryNumber = storyMatch[1];
        updatedLines.push(line);
        continue;
      }

      // Detectar fim de uma story (próxima story ou seção)
      if (
        inStorySection &&
        (line.startsWith('###') ||
          line.startsWith('##') ||
          line.startsWith('#'))
      ) {
        inStorySection = false;
        currentStoryNumber = null;
      }

      // Atualizar status se estivermos em uma story
      if (
        inStorySection &&
        currentStoryNumber &&
        storyMap.has(currentStoryNumber)
      ) {
        const story = storyMap.get(currentStoryNumber);
        const updatedLine = this.updateStoryLine(line, story);

        if (updatedLine !== line) {
          changesMade++;
          this.changes.push({
            story: currentStoryNumber,
            from: line.trim(),
            to: updatedLine.trim(),
          });
        }

        updatedLines.push(updatedLine);
      } else {
        updatedLines.push(line);
      }
    }

    // Atualizar estatísticas gerais
    const updatedContent = this.updateGeneralStatistics(
      updatedLines.join('\n'),
      validationResults
    );

    this.log(
      `📝 ${changesMade} alterações de status identificadas`,
      changesMade > 0 ? 'yellow' : 'green'
    );

    return updatedContent;
  }

  /**
   * Atualiza uma linha específica de story
   */
  updateStoryLine(line, story) {
    const { validation, declaredStatus } = story;
    const realStatus = validation.finalStatus;

    // Padrões de status para atualizar
    const statusPatterns = [
      /\*\*Status\*\*:\s*([^\n]+)/i,
      /Status:\s*([^\n]+)/i,
      /\*\*Priority\*\*:\s*([^|]+)\|\s*\*\*Status\*\*:\s*([^\n]+)/i,
    ];

    let updatedLine = line;

    statusPatterns.forEach((pattern) => {
      if (pattern.test(line)) {
        // Determinar emoji e texto do status
        const statusInfo = this.getStatusInfo(realStatus, validation);

        if (pattern.source.includes('Priority')) {
          // Linha com Priority e Status
          updatedLine = line.replace(
            pattern,
            (_match, priority, _oldStatus) => {
              return `**Priority**: ${priority.trim()} | **Status**: ${statusInfo.text}`;
            }
          );
        } else {
          // Linha só com Status
          updatedLine = line.replace(pattern, `**Status**: ${statusInfo.text}`);
        }
      }
    });

    return updatedLine;
  }

  /**
   * Retorna informações formatadas do status
   */
  getStatusInfo(status, validation) {
    const { implementation, files, tests } = validation;

    switch (status) {
      case 'COMPLETED':
        return {
          text: `COMPLETED ✅ (Impl: ${implementation.score}%, Files: ${files.score}%, Tests: ${tests.score}%)`,
          emoji: '✅',
        };
      case 'IN_PROGRESS':
        return {
          text: `IN_PROGRESS 🔄 (Impl: ${implementation.score}%, Files: ${files.score}%, Tests: ${tests.score}%)`,
          emoji: '🔄',
        };
      case 'PENDING':
        return {
          text: `PENDING ⏳ (Impl: ${implementation.score}%, Files: ${files.score}%, Tests: ${tests.score}%)`,
          emoji: '⏳',
        };
      default:
        return {
          text: 'UNKNOWN ❓',
          emoji: '❓',
        };
    }
  }

  /**
   * Atualiza estatísticas gerais do roadmap
   */
  updateGeneralStatistics(content, validationResults) {
    const total =
      validationResults.completed.length +
      validationResults.inProgress.length +
      validationResults.pending.length;
    const completedPercent = (
      (validationResults.completed.length / total) *
      100
    ).toFixed(1);
    const inProgressPercent = (
      (validationResults.inProgress.length / total) *
      100
    ).toFixed(1);
    const pendingPercent = (
      (validationResults.pending.length / total) *
      100
    ).toFixed(1);

    // Atualizar seção de estatísticas
    const statsPattern = /(## 📊 Status Geral do Projeto[\s\S]*?)(## |$)/;

    if (statsPattern.test(content)) {
      const newStats = `## 📊 Status Geral do Projeto

**Última Atualização**: ${new Date().toLocaleDateString('pt-BR')}
**Validação Automática**: ✅ Executada

### Progresso Geral
- **Total de Stories**: ${total}
- **Completed**: ${validationResults.completed.length} stories (${completedPercent}%)
- **In Progress**: ${validationResults.inProgress.length} stories (${inProgressPercent}%)
- **Pending**: ${validationResults.pending.length} stories (${pendingPercent}%)

### Métricas de Qualidade
- **Stories com Implementação > 80%**: ${validationResults.completed.filter((s) => s.validation.implementation.score > 80).length}
- **Stories com Arquivos Completos**: ${[...validationResults.completed, ...validationResults.inProgress].filter((s) => s.validation.files.score > 90).length}
- **Stories com Testes**: ${[...validationResults.completed, ...validationResults.inProgress].filter((s) => s.validation.tests.score > 50).length}

### Próximas Prioridades
1. **Finalizar Stories In Progress**: Focar nas ${validationResults.inProgress.length} stories em andamento
2. **Implementar Testes**: Aumentar cobertura de testes nas stories completed
3. **Documentação**: Atualizar documentação das funcionalidades implementadas

`;

      content = content.replace(statsPattern, `${newStats}\n## `);
    }

    return content;
  }

  /**
   * Salva o roadmap atualizado
   */
  saveUpdatedRoadmap(content) {
    if (this.dryRun) {
      this.log('🔍 DRY RUN - Roadmap não foi salvo', 'yellow');
      return;
    }

    fs.writeFileSync(ROADMAP_FILE, content);
    this.log(`💾 Roadmap atualizado: ${ROADMAP_FILE}`, 'green');
  }

  /**
   * Mostra resumo das alterações
   */
  showChangesSummary() {
    if (this.changes.length === 0) {
      this.log(
        '✅ Nenhuma alteração necessária - roadmap já está atualizado!',
        'green'
      );
      return;
    }

    this.log(`\n📋 RESUMO DAS ALTERAÇÕES (${this.changes.length}):`, 'bold');
    this.log('='.repeat(60));

    this.changes.forEach((change, index) => {
      this.log(`\n${index + 1}. Story ${change.story}:`);
      this.log(`   Antes: ${change.from}`, 'red');
      this.log(`   Depois: ${change.to}`, 'green');
    });

    this.log(`\n${'='.repeat(60)}`);
  }

  /**
   * Executa a atualização completa do roadmap
   */
  async updateRoadmap() {
    this.log('🚀 Iniciando atualização do roadmap...', 'blue');

    // Criar backup
    if (!this.createBackup()) {
      return;
    }

    try {
      // Validar stories
      const validationResults = await this.validateStories();

      // Atualizar conteúdo
      const updatedContent = this.updateRoadmapContent(validationResults);

      // Mostrar alterações
      this.showChangesSummary();

      // Salvar roadmap
      this.saveUpdatedRoadmap(updatedContent);

      // Estatísticas finais
      const total =
        validationResults.completed.length +
        validationResults.inProgress.length +
        validationResults.pending.length;
      this.log('\n📊 ESTATÍSTICAS FINAIS:', 'bold');
      this.log(`   Total: ${total} stories`);
      this.log(
        `   ✅ Completed: ${validationResults.completed.length}`,
        'green'
      );
      this.log(
        `   🔄 In Progress: ${validationResults.inProgress.length}`,
        'yellow'
      );
      this.log(`   ⏳ Pending: ${validationResults.pending.length}`, 'red');

      if (this.dryRun) {
        this.log(
          '\n🔍 Modo DRY RUN - Execute sem --dry-run para aplicar as alterações',
          'yellow'
        );
      } else {
        this.log('\n✅ Roadmap atualizado com sucesso!', 'green');
      }
    } catch (error) {
      this.log(`❌ Erro durante atualização: ${error.message}`, 'red');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
  }

  const updater = new RoadmapUpdater(dryRun);
  updater.updateRoadmap().catch(console.error);
}

module.exports = RoadmapUpdater;
