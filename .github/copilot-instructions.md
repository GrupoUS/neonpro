# NeonPro - BMad-Enhanced AI Coding Agent Instructions

## 🎯 Project Overview

NeonPro is a modern clinic management system for aesthetic and beauty clinics built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. It features comprehensive patient management, appointment scheduling, financial tracking, and PWA capabilities.

**Database**: All NeonPro data is hosted on Supabase Project `ownkoxryswokcdanrdgj` (região sa-east-1 - São Paulo, Brasil) with 40+ tables including core clinic management, CRM system, financial management, and performance monitoring.

**⚠️ CRITICAL DATABASE RULE**:
- **ALWAYS use MCP Supabase tools for ALL database operations**
- **NEVER use Supabase CLI or direct SQL without MCP**
- **Supabase is the ONLY database - no local database development**
- **All migrations, queries, and schema changes MUST go through MCP Supabase**

**BMad Integration**: This project uses BMad Method v4.29.0 for structured AI-driven development with specialized agent workflows.

## 💾 MANDATORY MEMORY BANK INTEGRATION (NEONPRO CONTEXT)

### 🔥 MEMORY BANK ACCESS PROTOCOL (CRITICAL)

**Memory Bank Path**: `C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\memory-bank` (workspace root level)

**EVERY NEONPRO TASK MUST BEGIN WITH MEMORY BANK CONTEXT LOADING:**

```yaml
NEONPRO_MEMORY_PROTOCOL:
  mandatory_context_loading:
    1_project_foundation: "mcp_desktop-comma_read_file memory-bank/projectbrief.md - NeonPro project scope and objectives"
    2_active_development: "mcp_desktop-comma_read_file memory-bank/activeContext.md - Current NeonPro development focus"
    3_progress_tracking: "mcp_desktop-comma_read_file memory-bank/progress.md - NeonPro completed and pending tasks"
    4_technical_setup: "mcp_desktop-comma_read_file memory-bank/techContext.md - NeonPro tech stack and configuration"
    5_system_architecture: "mcp_desktop-comma_read_file memory-bank/systemPatterns.md - NeonPro architecture patterns"

  neonpro_quality_gates:
    - "VALIDATE: Memory bank context aligns with NeonPro clinic management requirements"
    - "SYNTHESIZE: Project context with BMad story requirements and implementation plans"
    - "OPTIMIZE: Development decisions based on established NeonPro patterns and constraints"
    - "DOCUMENT: All changes in memory-bank progress tracking and active context"

NEONPRO_ENFORCEMENT: "❌ NO NEONPRO DEVELOPMENT without complete memory bank context"
```

### 📁 NeonPro Memory Bank Files Priority

1. **`memory-bank/projectbrief.md`** - NeonPro clinic management scope and objectives
2. **`memory-bank/activeContext.md`** - Current NeonPro development focus and priorities
3. **`memory-bank/progress.md`** - NeonPro completed features and pending tasks
4. **`memory-bank/techContext.md`** - Next.js 15, Supabase, TypeScript configuration
5. **`memory-bank/systemPatterns.md`** - NeonPro architecture patterns and design decisions

## 🤖 BMad Method Integration (NeonPro-Specific)

### Project Configuration

- **BMad Version**: 4.29.0 (configured in `.bmad-core/core-config.yaml`)
- **PRD Management**: Sharded PRD in `docs/prd/` (v4)
- **Architecture**: Sharded architecture in `docs/architecture/` (v4)
- **Story Location**: `docs/stories/` for implementation tracking
- **Debug Logging**: `.ai/debug-log.md` for development troubleshooting
- **Slash Prefix**: `BMad` for command recognition

### Dev Agent Mandatory Files (Auto-loaded on @dev activation)

Per `core-config.yaml` devLoadAlwaysFiles:

- `docs/architecture/coding-standards.md` - Project coding standards and patterns
- `docs/architecture/tech-stack.md` - Technology decisions and configurations
- `docs/architecture/source-tree.md` - File organization and component structure

### NeonPro BMad Agent Workflows

#### Story Implementation Cycle

```bash
# 1. Story Creation
@sm                    # Create story from sharded PRD docs
*create               # Use create-next-story task

# 2. Development Implementation
@dev                  # James (Full Stack Developer)
# Auto-loads: coding-standards.md, tech-stack.md, source-tree.md
# Implements story following sequential task order
# Updates ONLY Dev Agent Record sections

# 3. Quality Assurance (Optional)
@qa                   # Code review and refactoring
# Reviews implementation against standards
# Fixes issues and validates completion

# 4. Validation and Completion
*execute-checklist story-dod-checklist    # Definition of Done validation
# Story status: Draft → Approved → Ready for Review → Done
```

#### Specialized NeonPro Agents

- **@bmad-master**: Universal task executor for any BMad operation in NeonPro
- **@dev (James)**: Full-stack developer with NeonPro architecture knowledge
- **@architect**: System design specialist familiar with clinic management patterns
- **@pm**: Product manager understanding healthcare/beauty clinic requirements
- **@po**: Product owner for NeonPro feature validation and acceptance
- **@sm**: Story manager creating implementation stories from NeonPro PRD
- **@qa**: Quality assurance with NeonPro coding standards expertise
- **@analyst**: Requirements analyst for clinic workflow analysis

### BMad Agent Delegation Protocol (VIBECODE V4.0 Enhanced)

**SMART DELEGATION TRIGGERS**: For complex multi-domain tasks or specialized expertise:

- **Architecture & System Design**: Consider `#E:\vscode\.github\chatmodes\voidbeast-modular.chatmode.md` for complex system architecture
- **Multi-Agent Coordination**: Use BMad Orchestrator for coordinating multiple specialized agents
- **Quality Assurance**: @qa for comprehensive code review and refactoring
- **User Experience**: @ux-expert for interface design and user journey optimization
- **Product Strategy**: @pm for feature prioritization and product decisions

### VIBECODE V4.0 Quality Integration

**Automatic Quality Gates**: All NeonPro development must maintain:

- ≥9.5/10 code quality (enhanced from BMad 8/10)
- ≥95% confidence before implementation (enhanced from 90%)
- Mandatory research validation for all technical decisions
- Desktop Commander enforcement for all file operations

### BMad Workflow Compliance Requirements (NeonPro)

1. **Story-First Development**: All implementation must follow approved stories from `docs/stories/`
2. **Document Integrity**: Never modify `docs/prd/` or `docs/architecture/` without proper BMad workflow
3. **Sequential Implementation**: Complete one story fully before starting next
4. **Dev Agent Record Only**: When implementing stories, only update designated sections:
   - Task checkboxes: `[ ]` → `[x]`
   - Debug Log References: Link to `.ai/debug-log.md` entries
   - Completion Notes: Implementation notes and decisions
   - File List: Track ALL modified files
   - Change Log: Summary of changes made
   - Status: Draft → Approved → Ready for Review → Done
5. **Clean Context Pattern**: Use fresh agent chats for each major phase
6. **Quality Gates**: Execute `story-dod-checklist` before marking stories complete

### NeonPro-Specific BMad Resources

#### Templates Available

- `prd-tmpl.yaml` - Product requirements document template
- `story-tmpl.yaml` - User story implementation template
- `architecture-tmpl.yaml` - System architecture documentation
- `brownfield-prd-tmpl.yaml` - Enhancement PRD for existing features
- `brownfield-architecture-tmpl.yaml` - Architecture updates for enhancements

#### Tasks Available

- `create-next-story.md` - Create implementation story from sharded PRD
- `brownfield-create-story.md` - Create enhancement story for existing features
- `execute-checklist.md` - Run validation checklists
- `shard-doc.md` - Break large documents into manageable pieces
- `document-project.md` - Analyze and document existing project state

#### Checklists Available

- `story-dod-checklist.md` - Definition of Done validation for stories
- `story-draft-checklist.md` - Draft story quality validation
- `architect-checklist.md` - Architecture document validation
- `pm-checklist.md` - Product management validation
- `po-master-checklist.md` - Product owner acceptance validation

## 🔧 VIBECODE Integration & Quality Standards

### Core Development Principles (Following VIBECODE V1.0 + BMad Method)

- **"Aprimore, Não Prolifere"**: ≥85% code reuse, avoid duplicating existing solutions
- **Quality Threshold**: Minimum 9.5/10 quality score for all code changes (enhanced from 8/10)
- **Confidence Minimum**: 95% confidence before implementing solutions (enhanced from 90%)
- **Context First**: Understand system completely before making changes
- **BMad-First**: Follow BMad Method workflows for all development activities

### VIBECODE V4.0 Hub Integration

- **Central Hub**: `#E:\vscode\.github\copilot-instructions.md` (VIBECODE master hub)
- **Active Chatmodes**: Integration with `neonpro-development.chatmode.md` and `voidbeast-modular.chatmode.md`
- **Smart Agent Delegation**: Auto-delegate complex tasks to specialized VIBECODE agents
- **Modular Architecture**: Hub-and-spoke system with 85%+ context reduction
- **Research Integration**: Mandatory Context7 + Tavily + Exa for all research tasks

### Mandatory Workflow (BMad-Enhanced 7-Step Process)

1. **ANALYZE** → Evaluate complexity and check for active BMad stories
2. **SELECT** → Choose BMad agents and tools based on complexity and story requirements
3. **EXECUTE** → Follow BMad task workflows and file operation protocols
4. **REFLECT** → Assess output quality against BMad checklists
5. **REFINE** → Improve if quality <8/10 using BMad QA patterns (max 3 iterations)
6. **VALIDATE** → Confirm quality ≥8/10 and BMad story requirements met
7. **LEARN** → Update Knowledge Graph, memory bank, and BMad story records

### File Operations Protocol (BMad-Enhanced)

- **Story Files**: Always update only Dev Agent Record sections in story files
- **≤200 lines**: Use desktop-commander or standard file operations
- **>200 lines**: Use cursor-editor or VS Code native tools
- **Always verify**: Read file after write operations and update File List in stories
- **System files**: Use cursor-editor regardless of size
- **BMad Files**: Never modify `.bmad-core/` contents without explicit instruction

### Research & Documentation Protocol (BMad-Compliant + VIBECODE V4.0 Enhanced)

- **BMad Knowledge**: Reference `.bmad-core/data/bmad-kb.md` for BMad methodology questions
- **VIBECODE V4.0 Enhanced Research**: context7 → tavily → exa with smart MCP routing
- **Context7 Integration**: Auto-validate all code patterns against current documentation
- **Auto-activation triggers**: pesquisar, buscar, documentação, tutorial, API, etc.
- **Quality requirements**: ≥9.5/10 synthesis from all 3 sources (enhanced from 8/10)
- **Documentation**: Document all sources and synthesis process in story records
- **Hub Integration**: Reference `#E:\vscode\.github\copilot-instructions.md` for VIBECODE orchestration

## 🏗️ Architecture & Core Patterns

### Database & Security

- **Supabase Auth Integration**: Use dual client pattern with `@/app/utils/supabase/client` for client-side and `@/app/utils/supabase/server` for server-side operations
- **⚠️ MANDATORY MCP USAGE**: ALL database operations MUST use MCP Supabase tools:
  - `mcp_supabase-mcp_execute_sql` for queries
  - `mcp_supabase-mcp_apply_migration` for schema changes
  - `mcp_supabase-mcp_list_tables` for structure verification
  - NEVER use CLI or direct database connections
- **Session Management**: Every protected page starts with:
  ```tsx
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  ```
- **Middleware Protection**: Routes under `/dashboard/*` are automatically protected by `middleware.ts`
- **Context Pattern**: Global auth state managed via `@/contexts/auth-context.tsx` with real-time session tracking

### Database & Security (Additional)

- **Row Level Security (RLS)**: All tables use RLS policies - see `scripts/01-setup-profiles.sql` for patterns
- **Auto-Generated Profiles**: User profiles are automatically created via database triggers on auth registration
- **Server-Side Data Fetching**: Always fetch data in Server Components when possible for better security and performance

### UI Component System

- **shadcn/ui Foundation**: Built on Radix UI primitives with custom theming via CSS variables
- **Design Tokens**: Colors defined as HSL CSS variables in `app/globals.css`, accessed via Tailwind
- **Component Library**: Reusable components in `@/components/ui/` following shadcn/ui patterns
- **Layout Pattern**: Use `DashboardLayout` component for all dashboard pages with consistent breadcrumbs:
  ```tsx
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Page Name" }
  ];
  return <DashboardLayout user={user} breadcrumbs={breadcrumbs}>{content}</DashboardLayout>
  ```

### File Organization

- **App Router**: Using Next.js 15 App Router with Server Components by default
- **Page Structure**: Dashboard pages follow pattern: `app/dashboard/[feature]/page.tsx`
- **Component Structure**:
  - `components/ui/` - Base UI components (shadcn/ui)
  - `components/auth/` - Authentication-specific components
  - `components/dashboard/` - Business logic components
  - `components/navigation/` - Layout and navigation components

## 🛠️ Development Workflows

### BMad-Enhanced Development Process

1. **Check Active Stories**: Always check `docs/stories/` for current implementation work
2. **Follow Sequential Tasks**: Complete story tasks in exact order specified
3. **Update Records Only**: Modify only Dev Agent Record sections in story files
4. **Validate Completion**: Run `story-dod-checklist` before marking stories complete
5. **Clean Context**: Use fresh chats when switching between BMad agents

### Package Management

- **pnpm**: Project uses pnpm as package manager. Always use `pnpm install`, `pnpm dev`, etc.
- **Latest Dependencies**: Most dependencies use "latest" for automatic updates

### Task Management & Complexity Assessment

- **Complexity Scoring (1-10)**:
  - Base: 1
  - Planning keywords (+1): planejar, organizar, estruturar, coordenar
  - Complexity indicators (+2): arquitetura, sistema, integração, auth, crud
  - Multi-step indicators (+1): primeiro, segundo, em seguida, finalmente
  - Long text >30 words (+2)
- **Auto-activation at complexity ≥3**: Use task management tools
- **Confidence threshold**: ≥50% confidence triggers enhanced workflows

### Testing Standards

- **Component Testing**: Use Testing Library with proper test structure
- **File Verification**: Always read files after write operations
- **Quality Validation**: All code must meet ≥8/10 quality threshold

### Environment Setup

- **Required Variables**: See `QUICK_OAUTH_SETUP.md` for complete setup guide
- **Local Development**: Use `.env.local` with Supabase credentials and `http://localhost:3000` as site URL
- **Production**: Configure same variables in Vercel dashboard with production URLs

### Key Commands

```bash
# Standard Development
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint check

# BMad Method Commands (use in agent chats)
@bmad-master     # Universal BMad task executor
@dev             # James - Full Stack Developer (auto-loads NeonPro standards)
@sm              # Story manager - create stories from PRD
@qa              # Quality assurance and code review
*help            # Show available BMad commands in agent context
*create          # Create new story (from @sm context)
*execute-checklist story-dod-checklist  # Validate story completion

# Quality Validation Commands
uv run python .cursor/scripts/finaltest.py                    # VIBECODE system validation
uv run python .cursor/scripts/vibecode_core_validator.py      # Core VIBECODE validation
```

### Database Scripts

- **Setup Scripts**: SQL files in `scripts/` directory for database initialization
- **Testing Scripts**: JavaScript utilities in `scripts/` for auth flow testing

## 🔧 Integration Patterns

### Supabase Integration

- **OAuth Setup**: Complex OAuth flow documented in `docs/oauth-setup-checklist.md`
- **Popup OAuth**: Custom Google OAuth implementation using popup windows for better UX
- **Session Handling**: Automatic session refresh and state management via auth context

### Form Handling

- **react-hook-form + zod**: Standard pattern for all forms with validation
- **Error Handling**: Consistent error display using toast notifications (sonner)
- **Loading States**: All forms implement loading states during submission

### PWA Features

- **Service Worker**: Configured for offline functionality
- **Manifest**: Web app manifest for native installation
- **Background Sync**: Data synchronization when connectivity returns

## 📱 Component Conventions

### Professional Excellence Standards

- **Context First**: Understand system completely before coding
- **Challenge Requests**: Identify edge cases, clarify requirements
- **Hold Standards**: Modular, testable, documented code
- **Design Don't Patch**: Think architecture, not quick fixes
- **Execution Standards**: One file per response, no method renaming without approval

### Page Components

- Server Components by default for better performance
- Always check authentication at page level
- Use consistent breadcrumb patterns
- Include proper TypeScript interfaces
- Follow quality gate requirements (≥8/10)

### Client Components

- Use "use client" directive only when necessary (forms, auth context, interactive elements)
- Implement proper loading and error states
- Follow React hooks patterns consistently
- Maintain ≥85% code reuse principle

### Styling Patterns

- **Tailwind Classes**: Use semantic class combinations following shadcn/ui patterns
- **CSS Variables**: Leverage design token system for colors
- **Responsive Design**: Mobile-first approach with responsive utilities
- **Dark Mode**: Automatic dark/light mode switching via next-themes

## 🚨 Critical Gotchas & Quality Gates

### BMad Method Compliance Requirements (NeonPro-Specific)

- **Story-First Rule**: NEVER implement features without approved story from `docs/stories/`
- **Document Integrity**: NEVER modify `docs/prd/` or `docs/architecture/` directly
- **Agent Context**: Use clean, fresh chats when switching between BMad agents (@dev, @sm, @qa, etc.)
- **Dev Agent Record Only**: When in @dev context, ONLY update these story sections:
  - Task checkboxes: `[ ]` → `[x]`
  - Debug Log References
  - Completion Notes
  - File List (track ALL changes)
  - Change Log
  - Status (Draft → Approved → Ready for Review → Done)
- **Sequential Implementation**: Complete all tasks in one story before starting another
- **Quality Gates**: MUST run `*execute-checklist story-dod-checklist` before marking stories complete

### VIBECODE Compliance Requirements

- **Quality Gate**: All changes must meet ≥9.5/10 quality threshold (enhanced from 8/10)
- **Verification Protocol**: Always read files after write operations
- **Sync Validation**: Ensure configurations remain consistent
- **Research Compliance**: Use all 3 research tools (context7 → tavily → exa) when needed
- **BMad Integration**: Follow BMad workflows when `.bmad-core/` exists
- **MCP Enforcement**: ALL operations must use appropriate MCP tools with Desktop Commander for file operations

### Authentication

- **Cookie Management**: Server-side auth relies on cookies - test thoroughly in different browsers
- **Redirect URLs**: Must match exactly between Supabase dashboard and Google Cloud Console
- **Session Timing**: Always handle async session checks properly

### Database

- **RLS Policies**: Every table operation must respect RLS - test with different user roles
- **Triggers**: Profile creation is automatic - don't manually insert profiles

### Build & Deploy

- **Environment Variables**: Production variables must be set in Vercel dashboard
- **OAuth Configuration**: Production URLs must be configured in both Supabase and Google Cloud Console

### Code Quality Standards

- **Modular Design**: Follow component-based architecture
- **Testing Coverage**: Implement proper test coverage for all components
- **Documentation**: Maintain inline comments and README updates
- **Performance**: Optimize for loading speed and user experience

## 📚 Key Documentation & System References

### NeonPro BMad Method Documentation

- `.bmad-core/core-config.yaml` - BMad system configuration for NeonPro
- `.bmad-core/agents/` - Specialized agent definitions for NeonPro development
- `.bmad-core/workflows/` - Development workflows (greenfield, brownfield)
- `.bmad-core/templates/` - Document templates (PRD, Architecture, Stories)
- `.bmad-core/tasks/` - Reusable task definitions for implementation
- `.bmad-core/checklists/` - Quality validation checklists
- `.bmad-core/data/bmad-kb.md` - Complete BMad Method knowledge base
- `docs/prd/` - Sharded Product Requirements Documents
- `docs/architecture/` - Sharded Architecture Documents
- `docs/stories/` - Implementation stories for development
- `.ai/debug-log.md` - Development debugging and troubleshooting log

### NeonPro Project Documentation

- `README.md` - Main project documentation and setup
- `QUICK_OAUTH_SETUP.md` - 5-minute OAuth configuration guide
- `docs/oauth-setup-checklist.md` - Detailed OAuth troubleshooting
- `docs/production-deployment-guide.md` - Production deployment checklist

### VIBECODE System Documentation

- `.cursor/README-MASTER.md` - Complete VIBECODE V1.0 configuration guide
- `.cursor/rules/master_rule.mdc` - Core development rules and protocols
- `.cursor/rules/coding-standards.mdc` - Professional development standards
- `.cursor/rules/file-operation-workflow.mdc` - File operation protocols
- `.cursor/rules/mcp-protocols.mdc` - MCP tool usage guidelines
- `.cursor/rules/task-automation.mdc` - Task management and complexity assessment
- `.cursor/scripts/finaltest.py` - System validation and testing script

### Validation & Quality Control

```bash
# BMad Method Validation
@bmad-master                                              # Access BMad universal task executor
*execute-checklist story-dod-checklist                   # Validate story completion
*kb                                                       # Access BMad knowledge base

# VIBECODE System Validation
uv run python .cursor/scripts/finaltest.py               # System health check
uv run python .cursor/scripts/vibecode_core_validator.py # Core system validation

# NeonPro Development Validation
pnpm lint                                                 # Code quality check
pnpm build                                               # Build validation
pnpm tsc --noEmit                                        # TypeScript validation

# BMad Story Status Check
# Check docs/stories/ for current implementation status
# Verify all tasks are marked [x] before proceeding
# Ensure File List is complete with all changes tracked
```

---

**Remember**: NeonPro uses BMad Method v4.29.0 for structured AI-driven development. Always follow BMad agent workflows and maintain story-driven implementation patterns!