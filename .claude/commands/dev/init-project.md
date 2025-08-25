# Command: /init-project | /iniciar-projeto

## Universal Description
**Project Initialization** - Intelligent project setup with technology detection, best practices, and constitutional framework integration for any development domain.

## Purpose
Bootstrap new projects with intelligent technology stack setup, quality standards, development tools, and constitutional AI principles, ensuring optimal development foundation for any complexity level.

## Context Detection
- **Technology Stack**: Auto-detect or intelligently recommend optimal tech stack
- **Project Type**: Frontend, Backend, Full-Stack, Mobile, DevOps, AI/ML
- **Development Environment**: Tools, dependencies, configuration setup
- **Quality Framework**: Linting, testing, CI/CD, documentation setup
- **Team Workflow**: Git workflow, collaboration tools, standards

## Auto-Activation Triggers
```yaml
bilingual_triggers:
  portuguese: ["iniciar", "criar-projeto", "setup", "bootstrap", "começar"]
  english: ["init", "init-project", "create-project", "setup", "bootstrap", "start"]
  
context_triggers:
  - "Empty directory or new repository"
  - "Missing basic project files (README, package.json, etc.)"
  - "New project initialization request"
  - "Technology stack setup needed"
  - "Development environment setup required"
  
automatic_scenarios:
  - Context detector identifies empty/new project
  - Missing essential project structure
  - Development environment not configured
  - Quality tools not setup
  - Documentation not initialized
```

## Execution Pattern

### 1. Project Assessment & Planning
```bash
# Analyze current directory and requirements
echo "🔍 Analyzing project requirements..."

PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

# Check existing structure
HAS_PACKAGE_JSON=false
HAS_README=false
HAS_GIT=false

[ -f "package.json" ] && HAS_PACKAGE_JSON=true
[ -f "README.md" ] && HAS_README=true
[ -d ".git" ] && HAS_GIT=true

echo "Project: $PROJECT_NAME"
echo "Package.json: $HAS_PACKAGE_JSON"
echo "README: $HAS_README" 
echo "Git: $HAS_GIT"
```

### 2. Technology Stack Detection & Selection
```bash
# Intelligent technology stack selection
echo "🚀 Determining optimal technology stack..."

# Auto-detect based on context clues
if [[ "$PROJECT_NAME" == *"web"* ]] || [[ "$PROJECT_NAME" == *"app"* ]]; then
    SUGGESTED_STACK="frontend"
elif [[ "$PROJECT_NAME" == *"api"* ]] || [[ "$PROJECT_NAME" == *"server"* ]]; then
    SUGGESTED_STACK="backend"
elif [[ "$PROJECT_NAME" == *"mobile"* ]] || [[ "$PROJECT_NAME" == *"native"* ]]; then
    SUGGESTED_STACK="mobile"
else
    SUGGESTED_STACK="fullstack"
fi

echo "Suggested stack: $SUGGESTED_STACK"
```

## Technology Stack Templates

### Frontend Stack Initialization
```yaml
frontend_modern_stack:
  framework: "React 18+ with TypeScript"
  build_tool: "Vite or Next.js"
  styling: "Tailwind CSS with PostCSS"
  ui_library: "shadcn/ui or Material-UI"
  state_management: "Context API + useReducer or Zustand"
  testing: "Vitest + React Testing Library"
  linting: "ESLint + Prettier + TypeScript ESLint"
  
setup_commands:
  - "pnpm create vite@latest . -- --template react-ts"
  - "pnpm add -D tailwindcss postcss autoprefixer"
  - "pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser"
  - "pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier"
  - "pnpm add -D @testing-library/react @testing-library/jest-dom vitest"
```

### Backend Stack Initialization
```yaml
backend_modern_stack:
  runtime: "Node.js with TypeScript"
  framework: "Express.js or Fastify"
  database: "PostgreSQL with Prisma ORM"
  authentication: "JWT with bcrypt"
  validation: "Joi or Zod"
  testing: "Jest + Supertest"
  api_docs: "OpenAPI/Swagger"
  
setup_commands:
  - "pnpm init && pnpm add express typescript @types/node"
  - "pnpm add -D ts-node nodemon @types/express"
  - "pnpm add prisma @prisma/client"
  - "pnpm add jsonwebtoken bcryptjs joi"
  - "pnpm add -D jest @types/jest supertest @types/supertest"
```

### Full-Stack Stack Initialization
```yaml
fullstack_modern_stack:
  frontend: "Next.js 14+ with TypeScript"
  backend: "Next.js API Routes or separate Express API"
  database: "PostgreSQL with Drizzle ORM or Prisma"
  authentication: "NextAuth.js or custom JWT"
  deployment: "Vercel or Docker"
  testing: "Jest + Playwright for E2E"
  
setup_commands:
  - "npx create-next-app@latest . --typescript --tailwind --eslint --app"
  - "pnpm add @next/bundle-analyzer"
  - "pnpm add prisma @prisma/client"
  - "pnpm add next-auth"
  - "pnpm add -D @playwright/test"
```

### Mobile Stack Initialization
```yaml
mobile_modern_stack:
  framework: "React Native with TypeScript"
  navigation: "React Navigation 6+"
  state_management: "Context API + useReducer"
  ui_library: "React Native Elements or NativeBase"
  testing: "Jest + React Native Testing Library"
  build_tools: "Metro bundler with Flipper"
  
setup_commands:
  - "npx react-native@latest init ProjectName --template react-native-template-typescript"
  - "pnpm add @react-navigation/native @react-navigation/stack"
  - "pnpm add react-native-elements react-native-vector-icons"
  - "pnpm add -D @testing-library/react-native"
```

## Quality Foundation Setup

### Linting & Formatting Configuration
```yaml
eslint_config:
  extends:
    - "@typescript-eslint/recommended"
    - "prettier/@typescript-eslint"
    - "plugin:prettier/recommended"
  rules:
    "@typescript-eslint/no-unused-vars": "error"
    "@typescript-eslint/no-explicit-any": "warn"
    "prefer-const": "error"
    
prettier_config:
  semi: true
  singleQuote: true
  tabWidth: 2
  trailingComma: "es5"
  printWidth: 100
```

### Testing Framework Setup
```yaml
jest_config:
  preset: "ts-jest"
  testEnvironment: "jsdom"
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"]
  collectCoverageFrom:
    - "src/**/*.{ts,tsx}"
    - "!src/**/*.d.ts"
    - "!src/index.tsx"
  coverageThreshold:
    global:
      branches: 80
      functions: 80
      lines: 80
      statements: 80
```

### Git Workflow Setup
```yaml
git_configuration:
  gitignore_template:
    - "node_modules/"
    - ".env.local"
    - ".env.*.local"
    - "dist/"
    - "build/"
    - "coverage/"
    - ".DS_Store"
    - "*.log"
    
  git_hooks:
    pre_commit: "lint-staged"
    pre_push: "npm run test"
    commit_msg: "commitizen"
    
  branch_strategy: "GitFlow or GitHub Flow"
  commit_convention: "Conventional Commits"
```

## Constitutional AI Integration

### Project Principles Setup
```yaml
constitutional_principles:
  quality_first: "Quality standards integrated from project start"
  security_by_design: "Security considerations in all architectural decisions"
  accessibility_first: "WCAG 2.1 AA+ compliance from the beginning"
  performance_optimized: "Performance considerations in all implementation"
  maintainable_code: "Clean, documented, and maintainable code practices"
  
implementation_guidelines:
  - "Progressive quality standards (L1-L10) integration"
  - "Security-first development practices"
  - "Constitutional AI validation for architectural decisions"
  - "Multi-perspective stakeholder consideration"
  - "Sustainable development practices"
```

## MCP Integration for Initialization

### Desktop Commander (Primary)
```yaml
file_operations:
  - "Project structure creation and organization"
  - "Configuration file generation (package.json, tsconfig.json, etc.)"
  - "Template file creation and customization"
  - "Documentation generation (README, API docs, etc.)"
  - "Git repository initialization and configuration"
```

### Context7 (Best Practices)
```yaml
framework_guidance:
  - "Framework-specific best practices and setup"
  - "Official documentation and configuration guides"
  - "Security recommendations and implementation"
  - "Performance optimization setup"
```

### Sequential Thinking (Complex Setup)
```yaml
complex_initialization:
  - "Multi-technology stack integration analysis"
  - "Architecture decision analysis for complex projects"
  - "Dependency management and compatibility analysis"
  - "Performance and security trade-off analysis"
```

## Progressive Setup Based on Complexity

### L1-L2 Simple Project Setup
```yaml
simple_setup:
  - "Basic project structure with essential files"
  - "Simple package.json with core dependencies"
  - "Basic README with setup instructions"
  - "Essential linting and formatting setup"
  - "Simple testing framework setup"
```

### L3-L4 Moderate Project Setup
```yaml
moderate_setup:
  - "Comprehensive project structure with organized directories"
  - "Full package.json with development and production dependencies"
  - "Detailed README with API documentation"
  - "Advanced linting with TypeScript and custom rules"
  - "Comprehensive testing setup with coverage requirements"
  - "Basic CI/CD configuration"
```

### L5-L6 Complex Project Setup
```yaml
complex_setup:
  - "Enterprise project structure with modular organization"
  - "Advanced configuration with environment-specific setups"
  - "Comprehensive documentation with architecture guides"
  - "Advanced tooling with pre-commit hooks and automation"
  - "Full testing suite with integration and E2E tests"
  - "Advanced CI/CD with quality gates and deployment automation"
```

### L7+ Enterprise Project Setup
```yaml
enterprise_setup:
  - "Enterprise-grade project structure with governance"
  - "Comprehensive configuration management and security"
  - "Enterprise documentation with compliance and audit trails"
  - "Advanced tooling with security scanning and compliance"
  - "Enterprise testing with chaos engineering and security tests"
  - "Enterprise CI/CD with compliance, security, and governance"
```

## Deliverables

### 1. Complete Project Structure
```
project-name/
├── src/                     # Source code directory
│   ├── components/          # Reusable components
│   ├── pages/               # Application pages/routes
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── tests/               # Test files
├── public/                  # Static assets
├── docs/                    # Project documentation
├── .github/                 # GitHub workflows and templates
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest testing configuration
├── .gitignore              # Git ignore patterns
└── README.md               # Project documentation
```

### 2. Configuration Files
```yaml
essential_configs:
  package_json: "Dependencies, scripts, and project metadata"
  typescript_config: "TypeScript compiler configuration"
  eslint_config: "Code quality and linting rules"
  prettier_config: "Code formatting standards"
  jest_config: "Testing framework configuration"
  git_config: "Version control and workflow setup"
```

### 3. Documentation Package
```markdown
# Project Documentation

## README.md
- Project overview and purpose
- Technology stack and architecture
- Setup and installation instructions
- Development workflow and guidelines
- Testing and deployment procedures

## CONTRIBUTING.md
- Contribution guidelines and standards
- Code review process
- Git workflow and branching strategy
- Issue reporting and feature requests

## API.md (if applicable)
- API documentation and endpoints
- Authentication and authorization
- Request/response examples
- Error handling and codes
```

## Bilingual Support

### Portuguese Initialization Commands
- **`/iniciar-projeto`** - Inicialização completa de projeto
- **`/setup-dev`** - Configuração de ambiente de desenvolvimento
- **`/criar-estrutura`** - Criação de estrutura de projeto
- **`/config-qualidade`** - Configuração de ferramentas de qualidade

### English Initialization Commands
- **`/init-project`** - Complete project initialization
- **`/setup-dev`** - Development environment setup
- **`/create-structure`** - Project structure creation
- **`/setup-quality`** - Quality tools configuration

## Success Metrics

### Initialization Effectiveness
- **Setup Completeness**: All essential tools and configurations setup
- **Quality Integration**: Quality standards integrated from the start
- **Documentation Quality**: Comprehensive and accurate documentation
- **Development Readiness**: Immediate development capability after setup

### Long-term Success Indicators
- **Maintainability**: Project structure supports long-term maintenance
- **Scalability**: Architecture supports future growth and complexity
- **Team Productivity**: Development workflow optimizes team efficiency
- **Quality Consistency**: Quality standards maintained throughout development

---

## Ready for Initialization

Intelligent project initialization system activated. The init-project command will:

✅ **Analyze project requirements** and recommend optimal technology stack  
✅ **Setup complete development environment** with best practices and tools  
✅ **Configure quality standards** with linting, testing, and CI/CD  
✅ **Generate comprehensive documentation** with setup and contribution guides  
✅ **Initialize constitutional AI framework** with quality and security principles  
✅ **Prepare development workflow** with Git configuration and team guidelines  

**Usage**: Type `/init-project` or `/iniciar-projeto` to begin project initialization, or let the system auto-activate when empty project structure is detected.

The init-project command ensures every new project starts with a solid foundation, quality standards, and constitutional principles for optimal long-term development success.