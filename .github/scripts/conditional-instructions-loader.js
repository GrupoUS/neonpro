#!/usr/bin/env node

/**
 * 🧠 VIBECODE Conditional Instructions Loader
 *
 * Loads context-specific instructions based on project analysis
 * Used by VS Code tasks for intelligent context detection
 */

const fs = require('fs');
const path = require('path');

class ConditionalInstructionsLoader {
  constructor() {
    this.projectRoot = process.cwd();
    this.contexts = {
      'nextjs react typescript': {
        name: 'Next.js React TypeScript',
        instructions:
          'Focus on Next.js App Router, React Server Components, TypeScript best practices',
        priority: 10,
      },
      'security authentication': {
        name: 'Security & Authentication',
        instructions: 'Focus on LGPD compliance, security patterns, authentication flows',
        priority: 8,
      },
      base: {
        name: 'Base Development',
        instructions: 'General development practices and code quality',
        priority: 1,
      },
    };
  }

  /**
   * Analyze project context based on file existence and content
   * @param {string} contextHint - Optional context hint from caller
   * @returns {string} Detected context
   */
  analyzeContext(contextHint = null) {
    if (contextHint && this.contexts[contextHint]) {
      return contextHint;
    }

    const checks = [
      {
        context: 'nextjs react typescript',
        condition: () =>
          this.hasFiles(['package.json', 'next.config.js', 'tsconfig.json']) ||
          this.hasFiles(['package.json', 'next.config.mjs', 'tsconfig.json']) ||
          this.hasFiles(['package.json', 'next.config.ts', 'tsconfig.json']) ||
          this.hasPackageDependency(['next', 'react', 'typescript']),
      },
      {
        context: 'security authentication',
        condition: () =>
          this.hasFiles(['.env.local', '.env']) ||
          this.hasPackageDependency(['@supabase/supabase-js', 'next-auth']) ||
          this.hasDirectories(['supabase', 'auth']),
      },
    ];

    for (const check of checks) {
      if (check.condition()) {
        return check.context;
      }
    }

    return 'base';
  }

  /**
   * Check if files exist in project root
   * @param {string[]} files - Array of file paths to check
   * @returns {boolean}
   */
  hasFiles(files) {
    return files.some((file) => fs.existsSync(path.join(this.projectRoot, file)));
  }

  /**
   * Check if directories exist in project root
   * @param {string[]} dirs - Array of directory paths to check
   * @returns {boolean}
   */
  hasDirectories(dirs) {
    return dirs.some((dir) => {
      const dirPath = path.join(this.projectRoot, dir);
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    });
  }

  /**
   * Check if package.json has specific dependencies
   * @param {string[]} deps - Array of dependency names to check
   * @returns {boolean}
   */
  hasPackageDependency(deps) {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (!fs.existsSync(packagePath)) {
        return false;
      }

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
      };

      return deps.some((dep) => dep in allDeps);
    } catch (_error) {
      return false;
    }
  }

  /**
   * Load instructions for detected context
   * @param {string} context - Context to load instructions for
   */
  loadInstructions(context) {
    const contextConfig = this.contexts[context];
    if (!contextConfig) {
      process.stderr.write(`❌ Unknown context: ${context}\n`);
      process.exit(1);
    }

    process.stdout.write(`🧠 Context: ${contextConfig.name}\n`);
    process.stdout.write(`📋 Instructions: ${contextConfig.instructions}\n`);
    process.stdout.write(`⭐ Priority: ${contextConfig.priority}\n`);

    return contextConfig;
  }

  /**
   * Reset to base context
   */
  reset() {
    process.stdout.write('🔄 Resetting to base context...\n');
    return this.loadInstructions('base');
  }

  /**
   * Main execution method
   * @param {string[]} args - Command line arguments
   */
  run(args) {
    const command = args[0];
    const contextArg = args.slice(1).join(' ');

    try {
      switch (command) {
        case 'analyze': {
          const detectedContext = this.analyzeContext(contextArg);
          console.log(`🔍 Detected context: ${detectedContext}`);
          return this.loadInstructions(detectedContext);
        }

        case 'reset':
          return this.reset();

        case 'test':
          return this.runTests();

        default:
          console.log('📖 Usage:');
          console.log('  node conditional-instructions-loader.js analyze [context]');
          console.log('  node conditional-instructions-loader.js reset');
          console.log('  node conditional-instructions-loader.js test');
          console.log('');
          console.log('📝 Available contexts:');
          Object.keys(this.contexts).forEach((ctx) => {
            console.log(`  - ${ctx}: ${this.contexts[ctx].name}`);
          });
          break;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Run self-tests
   */
  runTests() {
    console.log('🧪 Running self-tests...');

    const tests = [
      {
        name: 'Context Detection - Next.js',
        test: () => {
          // Mock files check
          const originalHasFiles = this.hasFiles;
          this.hasFiles = () => true;
          const result = this.analyzeContext();
          this.hasFiles = originalHasFiles;
          return result === 'nextjs react typescript';
        },
      },
      {
        name: 'Context Loading',
        test: () => {
          const config = this.contexts.base;
          return config?.name && config.instructions;
        },
      },
      {
        name: 'Reset Functionality',
        test: () => {
          const result = this.reset();
          return result.name === 'Base Development';
        },
      },
    ];

    let passed = 0;
    const total = tests.length;

    tests.forEach((test) => {
      try {
        const result = test.test();
        if (result) {
          console.log(`✅ ${test.name}: PASSED`);
          passed++;
        } else {
          console.log(`❌ ${test.name}: FAILED`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      }
    });

    console.log(`\n📊 Test Results: ${passed}/${total} passed`);

    if (passed === total) {
      console.log('🎉 All tests passed!');
      return true;
    }
    console.log('⚠️ Some tests failed!');
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  const loader = new ConditionalInstructionsLoader();
  const args = process.argv.slice(2);
  loader.run(args);
}

module.exports = ConditionalInstructionsLoader;
