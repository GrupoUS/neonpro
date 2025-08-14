# NeonPro Project Configuration

## Project Overview
- **Project Name**: NeonPro
- **Type**: Next.js SaaS Application
- **Architecture**: Full-stack web application with modern UI/UX
- **Primary Focus**: Professional dashboard and analytics platform

## Development Guidelines

### Frontend Development
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with consistent theming
- **State Management**: React hooks and context for local state
- **TypeScript**: Strict mode enabled for type safety

### Backend Development
- **API Routes**: Next.js API routes for server-side logic
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js or Supabase Auth
- **File Storage**: Cloud storage integration
- **Environment**: Separate dev/staging/production configs

### Code Standards
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Testing**: Jest and React Testing Library
- **Git Workflow**: Feature branches with PR reviews
- **Documentation**: Inline comments and README updates

### Project-Specific Rules
1. Follow NeonPro design system guidelines
2. Implement responsive design for all components
3. Ensure accessibility compliance (WCAG 2.1)
4. Optimize for performance and SEO
5. Maintain consistent API response formats
6. Use proper error handling and logging
7. Implement proper security measures
8. Follow database migration best practices

## Memory Management
- Store project-specific context in `neonpro/.cursor/memory/`
- Track feature development progress
- Document architectural decisions
- Maintain component library documentation