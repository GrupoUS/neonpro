# 📚 NeonPro Documentation

This is the documentation application for NeonPro, built with [Next.js](https://nextjs.org) and optimized for healthcare documentation and compliance requirements.

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the documentation.

## Features

- **📖 Comprehensive Documentation**: Complete API and component documentation
- **🏥 Healthcare Compliance**: HIPAA, ANVISA, and regulatory compliance guides
- **🎨 Interactive Components**: Live component playground with shadcn/ui
- **🔍 Advanced Search**: Fast documentation search with real-time indexing
- **📱 Responsive Design**: Mobile-first design for all devices
- **🌙 Dark Mode**: Automatic dark/light mode switching
- **♿ Accessibility**: WCAG 2.1 AA compliant documentation

## Project Structure

```
docs/
├── app/                    # Next.js App Router pages
│   ├── components/         # Component documentation
│   ├── api/               # API documentation
│   ├── guides/            # Usage guides
│   └── compliance/        # Regulatory compliance docs
├── public/                # Static assets
└── components/            # Shared documentation components
```

## Documentation Standards

All documentation follows:
- **Markdown-first**: Using MDX for enhanced content
- **Component-driven**: Live examples with code snippets
- **Version control**: Automatic versioning with git hooks
- **Internationalization**: Multi-language support (PT-BR, EN)

## Learn More

- [NeonPro Main Application](../web/README.md)
- [Component Library](../../packages/ui/README.md)
- [Development Guide](../../CONTRIBUTING.md)

## Deployment

Documentation is automatically deployed on:
- **Staging**: Vercel Preview deployments
- **Production**: Vercel production deployment
- **Internal**: Corporate documentation portal

For deployment details, see our [deployment documentation](./docs/deployment.md).