# NeonPro - AI Coding Agent Instructions

## 🎯 Project Overview
NeonPro is a modern clinic management system for aesthetic and beauty clinics built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. It features comprehensive patient management, appointment scheduling, financial tracking, and PWA capabilities.

## 🔧 VIBECODE Integration & Quality Standards

### Core Development Principles (Following VIBECODE V1.0)
- **"Aprimore, Não Prolifere"**: ≥85% code reuse, avoid duplicating existing solutions
- **Quality Threshold**: Minimum 8/10 quality score for all code changes
- **Confidence Minimum**: 90% confidence before implementing solutions
- **Context First**: Understand system completely before making changes

### Mandatory Workflow (7-Step Process)
1. **ANALYZE** → Evaluate complexity (1-10 scale)
2. **SELECT** → Choose appropriate tools based on complexity
3. **EXECUTE** → Use MCP tools and follow file operation protocols
4. **REFLECT** → Assess output quality
5. **REFINE** → Improve if quality <8/10 (max 3 iterations)
6. **VALIDATE** → Confirm quality ≥8/10 and completeness
7. **LEARN** → Update Knowledge Graph and memory bank

### File Operations Protocol
- **≤200 lines**: Use desktop-commander or standard file operations
- **>200 lines**: Use cursor-editor or VS Code native tools
- **Always verify**: Read file after write operations
- **System files**: Use cursor-editor regardless of size

### Research & Documentation Protocol
- **Mandatory sequence**: context7 → tavily → exa for any research needs
- **Auto-activation triggers**: pesquisar, buscar, documentação, tutorial, API, etc.
- **Quality requirements**: ≥8/10 synthesis from all 3 sources
- **Documentation**: Document all sources and synthesis process

## 🏗️ Architecture & Core Patterns

### Authentication & Authorization
- **Supabase Auth Integration**: Use dual client pattern with `@/app/utils/supabase/client` for client-side and `@/app/utils/supabase/server` for server-side operations
- **Session Management**: Every protected page starts with:
  ```tsx
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  ```
- **Middleware Protection**: Routes under `/dashboard/*` are automatically protected by `middleware.ts`
- **Context Pattern**: Global auth state managed via `@/contexts/auth-context.tsx` with real-time session tracking

### Database & Security
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
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint check

# VIBECODE System Validation
uv run python .cursor/scripts/finaltest.py
uv run python .cursor/scripts/vibecode_core_validator.py
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

### VIBECODE Compliance Requirements
- **Quality Gate**: All changes must meet ≥8/10 quality threshold
- **Verification Protocol**: Always read files after write operations
- **Sync Validation**: Ensure configurations remain consistent
- **Research Compliance**: Use all 3 research tools (context7 → tavily → exa) when needed

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
# System health check
uv run python .cursor/scripts/finaltest.py

# Core system validation
uv run python .cursor/scripts/vibecode_core_validator.py

# Knowledge graph validation
uv run python memory-bank/python/knowledge_graph_manager.py --validate_connections
```
