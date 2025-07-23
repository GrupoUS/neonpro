#!/usr/bin/env node
/**
 * ========================================
 * VIBECODE V2.1 - Documentation Generator
 * ========================================
 * Automated documentation generation
 * Quality Threshold: >=9.3/10
 * ========================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationGenerator {
    constructor() {
        this.qualityScore = 10.0;
        this.generatedDocs = [];
        this.errors = [];
        this.warnings = [];
        this.logFile = '.trae/logs/documentation-generation.log';
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }

    addError(message) {
        this.errors.push(message);
        this.qualityScore -= 0.5;
        this.log(message, 'ERROR');
    }

    addWarning(message) {
        this.warnings.push(message);
        this.qualityScore -= 0.1;
        this.log(message, 'WARN');
    }

    addGeneratedDoc(name, path, description) {
        this.generatedDocs.push({
            name,
            path,
            description,
            timestamp: new Date().toISOString()
        });
        this.log(`✅ Generated documentation: ${name} at ${path}`);
    }

    analyzeProjectStructure() {
        this.log('Analyzing project structure...');
        
        const structure = {
            components: [],
            pages: [],
            hooks: [],
            utils: [],
            types: [],
            apis: []
        };

        const scanDirectories = {
            'components': 'components',
            'pages': 'app',
            'hooks': 'hooks',
            'utils': 'lib',
            'types': 'types'
        };

        for (const [category, directory] of Object.entries(scanDirectories)) {
            if (fs.existsSync(directory)) {
                this.scanDirectory(directory, structure[category]);
            }
        }

        return structure;
    }

    scanDirectory(dirPath, results) {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory() && !item.name.startsWith('.')) {
                    this.scanDirectory(fullPath, results);
                } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
                    results.push({
                        name: item.name,
                        path: fullPath,
                        type: this.determineFileType(fullPath)
                    });
                }
            }
        } catch (error) {
            this.addWarning(`Failed to scan directory ${dirPath}: ${error.message}`);
        }
    }

    determineFileType(filePath) {
        const content = this.readFileContent(filePath);
        if (!content) return 'unknown';

        if (content.includes('export default function') || content.includes('export function')) {
            if (content.includes('useState') || content.includes('useEffect')) {
                return 'component';
            }
            return 'function';
        }
        
        if (content.includes('interface ') || content.includes('type ')) {
            return 'types';
        }
        
        if (content.includes('use') && content.includes('return')) {
            return 'hook';
        }
        
        return 'utility';
    }

    readFileContent(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            this.addWarning(`Failed to read file ${filePath}: ${error.message}`);
            return null;
        }
    }

    extractJSDocComments(content) {
        const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
        const comments = [];
        let match;
        
        while ((match = jsdocRegex.exec(content)) !== null) {
            comments.push(match[1].trim());
        }
        
        return comments;
    }

    extractFunctionSignatures(content) {
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
        const arrowFunctionRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
        const functions = [];
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                signature: match[0],
                type: 'function'
            });
        }
        
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                signature: match[0],
                type: 'arrow_function'
            });
        }
        
        return functions;
    }

    generateAPIDocumentation() {
        this.log('Generating API documentation...');
        
        const apiDocsPath = 'docs/api';
        if (!fs.existsSync(apiDocsPath)) {
            fs.mkdirSync(apiDocsPath, { recursive: true });
        }

        // Scan for API routes
        const apiRoutesPath = 'app/api';
        if (fs.existsSync(apiRoutesPath)) {
            const apiRoutes = [];
            this.scanAPIRoutes(apiRoutesPath, apiRoutes);
            
            const apiDocContent = this.generateAPIMarkdown(apiRoutes);
            const apiDocPath = path.join(apiDocsPath, 'README.md');
            
            fs.writeFileSync(apiDocPath, apiDocContent);
            this.addGeneratedDoc('API Documentation', apiDocPath, 'Complete API routes documentation');
        } else {
            this.addWarning('No API routes found');
        }
    }

    scanAPIRoutes(dirPath, routes) {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    this.scanAPIRoutes(fullPath, routes);
                } else if (item.name === 'route.ts' || item.name === 'route.js') {
                    const content = this.readFileContent(fullPath);
                    if (content) {
                        const route = this.parseAPIRoute(fullPath, content);
                        routes.push(route);
                    }
                }
            }
        } catch (error) {
            this.addWarning(`Failed to scan API routes in ${dirPath}: ${error.message}`);
        }
    }

    parseAPIRoute(filePath, content) {
        const routePath = filePath.replace('app/api', '').replace('/route.ts', '').replace('/route.js', '') || '/';
        const methods = [];
        
        // Extract HTTP methods
        const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g;
        let match;
        
        while ((match = methodRegex.exec(content)) !== null) {
            methods.push(match[1]);
        }
        
        // Extract JSDoc comments for description
        const comments = this.extractJSDocComments(content);
        const description = comments.length > 0 ? comments[0] : 'No description available';
        
        return {
            path: routePath,
            methods,
            description,
            filePath
        };
    }

    generateAPIMarkdown(routes) {
        let markdown = `# API Documentation\n\n`;
        markdown += `Generated on: ${new Date().toISOString()}\n\n`;
        markdown += `## Available Routes\n\n`;
        
        for (const route of routes) {
            markdown += `### ${route.path}\n\n`;
            markdown += `**Methods:** ${route.methods.join(', ')}\n\n`;
            markdown += `**Description:** ${route.description}\n\n`;
            markdown += `**File:** \`${route.filePath}\`\n\n`;
            markdown += `---\n\n`;
        }
        
        return markdown;
    }

    generateComponentDocumentation() {
        this.log('Generating component documentation...');
        
        const componentDocsPath = 'docs/components';
        if (!fs.existsSync(componentDocsPath)) {
            fs.mkdirSync(componentDocsPath, { recursive: true });
        }

        const componentsPath = 'components';
        if (fs.existsSync(componentsPath)) {
            const components = [];
            this.scanDirectory(componentsPath, components);
            
            const componentDocContent = this.generateComponentMarkdown(components);
            const componentDocPath = path.join(componentDocsPath, 'README.md');
            
            fs.writeFileSync(componentDocPath, componentDocContent);
            this.addGeneratedDoc('Component Documentation', componentDocPath, 'React components documentation');
        } else {
            this.addWarning('No components directory found');
        }
    }

    generateComponentMarkdown(components) {
        let markdown = `# Component Documentation\n\n`;
        markdown += `Generated on: ${new Date().toISOString()}\n\n`;
        markdown += `## Available Components\n\n`;
        
        for (const component of components) {
            if (component.type === 'component') {
                const content = this.readFileContent(component.path);
                if (content) {
                    const functions = this.extractFunctionSignatures(content);
                    const comments = this.extractJSDocComments(content);
                    
                    markdown += `### ${component.name}\n\n`;
                    markdown += `**Path:** \`${component.path}\`\n\n`;
                    
                    if (comments.length > 0) {
                        markdown += `**Description:** ${comments[0]}\n\n`;
                    }
                    
                    if (functions.length > 0) {
                        markdown += `**Functions:**\n`;
                        for (const func of functions) {
                            markdown += `- \`${func.signature}\`\n`;
                        }
                        markdown += `\n`;
                    }
                    
                    markdown += `---\n\n`;
                }
            }
        }
        
        return markdown;
    }

    generateProjectOverview() {
        this.log('Generating project overview...');
        
        const docsPath = 'docs';
        if (!fs.existsSync(docsPath)) {
            fs.mkdirSync(docsPath, { recursive: true });
        }

        const structure = this.analyzeProjectStructure();
        const overviewContent = this.generateOverviewMarkdown(structure);
        const overviewPath = path.join(docsPath, 'PROJECT_OVERVIEW.md');
        
        fs.writeFileSync(overviewPath, overviewContent);
        this.addGeneratedDoc('Project Overview', overviewPath, 'Complete project structure overview');
    }

    generateOverviewMarkdown(structure) {
        let markdown = `# NeonPro Project Overview\n\n`;
        markdown += `Generated on: ${new Date().toISOString()}\n\n`;
        markdown += `## Project Structure\n\n`;
        
        // Package.json info
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            markdown += `**Name:** ${packageJson.name || 'N/A'}\n`;
            markdown += `**Version:** ${packageJson.version || 'N/A'}\n`;
            markdown += `**Description:** ${packageJson.description || 'N/A'}\n\n`;
        } catch (error) {
            this.addWarning('Failed to read package.json');
        }
        
        // Structure breakdown
        for (const [category, items] of Object.entries(structure)) {
            if (items.length > 0) {
                markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${items.length})\n\n`;
                
                const typeGroups = {};
                for (const item of items) {
                    if (!typeGroups[item.type]) {
                        typeGroups[item.type] = [];
                    }
                    typeGroups[item.type].push(item);
                }
                
                for (const [type, typeItems] of Object.entries(typeGroups)) {
                    markdown += `**${type}s:**\n`;
                    for (const item of typeItems) {
                        markdown += `- \`${item.name}\` (${item.path})\n`;
                    }
                    markdown += `\n`;
                }
            }
        }
        
        return markdown;
    }

    generateDevelopmentGuide() {
        this.log('Generating development guide...');
        
        const docsPath = 'docs';
        const guideContent = this.generateDevelopmentMarkdown();
        const guidePath = path.join(docsPath, 'DEVELOPMENT_GUIDE.md');
        
        fs.writeFileSync(guidePath, guideContent);
        this.addGeneratedDoc('Development Guide', guidePath, 'Development setup and guidelines');
    }

    generateDevelopmentMarkdown() {
        let markdown = `# Development Guide\n\n`;
        markdown += `Generated on: ${new Date().toISOString()}\n\n`;
        
        markdown += `## Getting Started\n\n`;
        markdown += `### Prerequisites\n\n`;
        markdown += `- Node.js 18+ \n`;
        markdown += `- npm or yarn\n`;
        markdown += `- Git\n\n`;
        
        markdown += `### Installation\n\n`;
        markdown += `\`\`\`bash\n`;
        markdown += `# Clone the repository\n`;
        markdown += `git clone <repository-url>\n`;
        markdown += `cd neonpro\n\n`;
        markdown += `# Install dependencies\n`;
        markdown += `npm install\n\n`;
        markdown += `# Setup environment\n`;
        markdown += `cp .env.example .env.local\n`;
        markdown += `\`\`\`\n\n`;
        
        markdown += `### Development Commands\n\n`;
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (packageJson.scripts) {
                markdown += `\`\`\`bash\n`;
                for (const [script, command] of Object.entries(packageJson.scripts)) {
                    markdown += `# ${script}\n`;
                    markdown += `npm run ${script}\n\n`;
                }
                markdown += `\`\`\`\n\n`;
            }
        } catch (error) {
            this.addWarning('Failed to read package.json scripts');
        }
        
        markdown += `## Project Architecture\n\n`;
        markdown += `### Directory Structure\n\n`;
        markdown += `\`\`\`\n`;
        markdown += `neonpro/\n`;
        markdown += `├── app/              # Next.js app directory\n`;
        markdown += `├── components/       # Reusable React components\n`;
        markdown += `├── hooks/           # Custom React hooks\n`;
        markdown += `├── lib/             # Utility functions and configurations\n`;
        markdown += `├── styles/          # Global styles and Tailwind config\n`;
        markdown += `├── docs/            # Project documentation\n`;
        markdown += `└── .trae/           # VIBECODE V2.1 scripts and logs\n`;
        markdown += `\`\`\`\n\n`;
        
        markdown += `## Code Standards\n\n`;
        markdown += `- Use TypeScript for type safety\n`;
        markdown += `- Follow ESLint and Prettier configurations\n`;
        markdown += `- Write comprehensive tests\n`;
        markdown += `- Document components with JSDoc\n`;
        markdown += `- Follow VIBECODE V2.1 quality standards (>=9.5/10)\n\n`;
        
        return markdown;
    }

    generateReport() {
        this.log('\n========================================');
        this.log('VIBECODE V2.1 Documentation Generation Report');
        this.log('========================================');
        
        this.log(`Quality Score: ${this.qualityScore.toFixed(1)}/10.0`);
        this.log(`Documents Generated: ${this.generatedDocs.length}`);
        this.log(`Errors: ${this.errors.length}`);
        this.log(`Warnings: ${this.warnings.length}`);
        
        if (this.generatedDocs.length > 0) {
            this.log('\nGenerated Documentation:');
            this.generatedDocs.forEach((doc, index) => {
                this.log(`  ${index + 1}. ${doc.name} - ${doc.path}`);
                this.log(`     ${doc.description}`);
            });
        }
        
        if (this.errors.length > 0) {
            this.log('\nErrors:');
            this.errors.forEach((error, index) => {
                this.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (this.warnings.length > 0) {
            this.log('\nWarnings:');
            this.warnings.forEach((warning, index) => {
                this.log(`  ${index + 1}. ${warning}`);
            });
        }
        
        const isSuccessful = this.qualityScore >= 9.3 && this.errors.length === 0;
        
        this.log('\n========================================');
        if (isSuccessful) {
            this.log('✅ DOCUMENTATION GENERATION COMPLETED - Quality >= 9.3/10');
        } else {
            this.log('⚠️  DOCUMENTATION GENERATION COMPLETED - Quality < 9.3/10 or errors present');
        }
        this.log('========================================\n');
        
        // Save report
        const reportData = {
            timestamp: new Date().toISOString(),
            qualityScore: this.qualityScore,
            generatedDocs: this.generatedDocs,
            errors: this.errors,
            warnings: this.warnings,
            isSuccessful
        };
        
        try {
            fs.writeFileSync('.trae/logs/documentation-generation-report.json', JSON.stringify(reportData, null, 2));
            this.log('Report saved to .trae/logs/documentation-generation-report.json');
        } catch (error) {
            this.addError(`Failed to save report: ${error.message}`);
        }
        
        return isSuccessful;
    }

    async generate() {
        this.log('Starting VIBECODE V2.1 documentation generation...');
        
        const generationTasks = [
            () => this.generateProjectOverview(),
            () => this.generateAPIDocumentation(),
            () => this.generateComponentDocumentation(),
            () => this.generateDevelopmentGuide()
        ];
        
        for (const task of generationTasks) {
            try {
                task();
            } catch (error) {
                this.addError(`Documentation generation task failed: ${error.message}`);
            }
        }
        
        const isSuccessful = this.generateReport();
        
        process.exit(isSuccessful ? 0 : 1);
    }
}

// Execute documentation generation
if (require.main === module) {
    const generator = new DocumentationGenerator();
    generator.generate().catch(error => {
        console.error('[FATAL] Documentation generation failed:', error);
        process.exit(1);
    });
}

module.exports = DocumentationGenerator;