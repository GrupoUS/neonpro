# 📚 NeonPro Documentation Portal

> Modern documentation platform built with Next.js, TypeScript, and MDX for the NeonPro healthcare management ecosystem.

## 🎯 Purpose

The documentation portal serves as the central knowledge hub for developers, administrators, and users working with the NeonPro platform. It provides comprehensive guides, API references, and technical documentation for all system components.

## 🏗️ Architecture

```
apps/docs/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Documentation components
├── content/              # MDX content files
├── lib/                  # Utilities and helpers
├── public/               # Static assets
├── styles/               # Additional stylesheets
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ with `pnpm` package manager
- Access to the NeonPro monorepo

### Development

```bash
# From monorepo root
pnpm install

# Start documentation server
pnpm dev:docs

# Or run from docs directory
cd apps/docs
pnpm dev
```

The documentation portal will be available at `http://localhost:3002`.

### Building

```bash
# Build for production
pnpm build:docs

# Preview production build
pnpm preview:docs
```

## 📖 Content Structure

### Content Organization

- **Guides**: Step-by-step tutorials and walkthroughs
- **API Reference**: Comprehensive API documentation
- **Architecture**: System design and component diagrams
- **Deployment**: Infrastructure and deployment guides
- **Examples**: Code samples and usage patterns

### Writing Documentation

Documentation is written in MDX (Markdown + JSX), allowing for:

- Rich formatting with Markdown syntax
- Interactive React components
- Code syntax highlighting
- Dynamic content generation

## 🎨 Features

### Modern Documentation Experience

- **Responsive Design**: Optimized for all devices
- **Search Functionality**: Full-text search across all content
- **Navigation**: Intelligent sidebar with progress tracking
- **Dark Mode**: Automatic dark/light theme switching
- **Code Highlighting**: Syntax highlighting for 20+ languages

### Developer-Friendly

- **Live Reload**: Instant updates during development
- **Type Safety**: Full TypeScript support throughout
- **Component Library**: Reusable documentation components
- **SEO Optimized**: Meta tags and structured data
- **Fast Performance**: Optimized for Core Web Vitals

### Integration

- **Monorepo Aware**: Automatically pulls examples from other packages
- **API Integration**: Live API status and health checks
- **Version Control**: Git-based content management
- **Deployment**: Automated builds and deployments

## 🔧 Configuration

### Environment Variables

```bash
# Next.js configuration
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3004

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-analytics-id
```

### Content Configuration

Content is configured through:

- `content/` directory structure
- Front matter in MDX files
- Navigation configuration in `lib/navigation.ts`

## 📦 Dependencies

### Core Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **MDX**: Markdown with JSX components

### Documentation Tools

- **@next/mdx**: MDX integration for Next.js
- **rehype/remark**: Markdown processing
- **shiki**: Code syntax highlighting
- **lucide-react**: Icon library

### Shared Packages

- `@neonpro/ui`: Shared UI components
- `@neonpro/types`: TypeScript definitions
- `@neonpro/config`: Shared configuration

## 🚦 Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript checking
```

## 📊 Performance

### Core Web Vitals

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimization Features

- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: Automatic image resizing and formats
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Intelligent caching strategies

## 🔐 Security

### Content Security

- **Sanitized Content**: MDX content is sanitized
- **HTTPS Only**: Enforced HTTPS in production
- **CSP Headers**: Content Security Policy implementation
- **XSS Protection**: Cross-site scripting prevention

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

### Manual Deployment

```bash
# Build and export
pnpm build
pnpm export

# Deploy static files to your hosting provider
```

## 📈 Analytics & Monitoring

### Built-in Analytics

- **Page Views**: Track documentation usage
- **Search Queries**: Monitor search behavior
- **User Flow**: Understand navigation patterns
- **Performance**: Core Web Vitals tracking

### Health Monitoring

- **Build Status**: Automated build verification
- **Link Checking**: Broken link detection
- **Content Validation**: MDX syntax verification
- **Performance Monitoring**: Runtime performance tracking

## 🤝 Contributing

### Content Guidelines

1. **Clear Structure**: Use proper heading hierarchy
2. **Code Examples**: Include working code samples
3. **Screenshots**: Add visual aids where helpful
4. **Testing**: Verify all examples work correctly

### Development Workflow

1. Create feature branch
2. Add/modify content in `content/` directory
3. Test locally with `pnpm dev`
4. Submit pull request
5. Review and merge

## 📝 Content Types

### API Documentation

```mdx
---
title: "Authentication API"
description: "User authentication and session management"
category: "api"
---

# Authentication API

The authentication API provides...
```

### Guides

```mdx
---
title: "Getting Started"
description: "Quick start guide for new developers"
category: "guides"
difficulty: "beginner"
---

# Getting Started

This guide will help you...
```

### Architecture

```mdx
---
title: "System Architecture"
description: "Overview of NeonPro system design"
category: "architecture"
---

# System Architecture

NeonPro follows a microservices...
```

## 🔗 Links

- **Live Documentation**: [docs.neonpro.dev](https://docs.neonpro.dev)
- **Repository**: [GitHub](https://github.com/neonpro/neonpro)
- **Issues**: [GitHub Issues](https://github.com/neonpro/neonpro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/neonpro/neonpro/discussions)

## 📄 License

This documentation is part of the NeonPro project and follows the same license terms.

---

_Built with ❤️ using Next.js, TypeScript, and MDX_
