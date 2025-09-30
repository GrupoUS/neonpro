# NeonPro Healthcare Platform

A modern, high-performance healthcare platform for Brazilian clinics, built with a hybrid architecture combining Bun, Vercel Edge, and Supabase Functions.

## Architecture

### Hybrid Architecture

Our platform uses a hybrid architecture that combines:

- **Bun**: A modern JavaScript runtime and package manager for improved performance
- **Vercel Edge**: Edge functions for low-latency, global deployment
- **Supabase Functions**: Serverless functions with real-time capabilities

### Healthcare Compliance

The platform is fully compliant with Brazilian healthcare regulations:

- **LGPD**: Lei Geral de Proteção de Dados (General Data Protection Law)
- **ANVISA**: Agência Nacional de Vigilância Sanitária (National Health Surveillance Agency)
- **CFM**: Conselho Federal de Medicina (Federal Council of Medicine)
- **WCAG**: Web Content Accessibility Guidelines (2.1 AA+)

## Performance

Our platform delivers exceptional performance:

- **Package Installation**: 3-5x faster with Bun
- **Build Times**: 3-5x faster with Bun
- **Bundle Size**: 20% reduction
- **Edge TTFB**: ≤ 150ms
- **Cache Hit Rate**: ≥ 80%
- **Cold Start Frequency**: ≤ 5%
- **UI Patch Time**: ≤ 1.5s
- **Connection Latency**: ≤ 200ms
- **Message Delivery Time**: ≤ 100ms
- **Copilot Tool Roundtrip**: ≤ 2s
- **Model Inference Time**: ≤ 1s
- **Response Generation Time**: ≤ 500ms
- **Uptime**: ≥ 99.9%
- **Memory Usage**: ≤ 80%
- **CPU Usage**: ≤ 70%
- **Disk Usage**: ≤ 80%

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/neonpro/healthcare-platform.git
   cd healthcare-platform
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Set up the database:
   ```bash
   bun packages/database/scripts/setup.ts
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

## Development

### Scripts

- `bun dev`: Start the development server
- `bun build`: Build the application for production
- `bun test`: Run the test suite
- `bun lint`: Run the linter
- `bun typecheck`: Run type checking

### Testing

We use a comprehensive testing strategy:

- **Contract Tests**: Test API contracts in `tests/contract/`
- **Unit Tests**: Test individual components in `tests/unit/`
- **Performance Tests**: Test performance benchmarks in `tests/performance/`

To run all tests:
```bash
bun test
```

To run specific test suites:
```bash
bun test tests/contract
bun test tests/unit
bun test tests/performance
```

### Validation

To validate the Bun migration and ensure all success criteria are met:
```bash
bun scripts/validate-bun-migration.ts
```

## Deployment

### Vercel

1. Install the Vercel CLI:
   ```bash
   bun i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

### Supabase

1. Create a new Supabase project
2. Run the database setup script:
   ```bash
   bun packages/database/scripts/setup.ts
   ```

3. Configure environment variables for Supabase

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Bun Migration](docs/architecture/bun-migration.md)
- [Bun Migration Summary](docs/architecture/bun-migration-summary.md)
- [API Documentation](docs/api/README.md)
- [Database Schema](docs/database/README.md)
- [Deployment Guide](docs/deployment/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact support@neonpro.com or create an issue in the repository.

## Acknowledgments

- [Bun](https://bun.sh/) for the modern JavaScript runtime
- [Vercel](https://vercel.com/) for the edge functions platform
- [Supabase](https://supabase.com/) for the backend services
- [tRPC](https://trpc.io/) for the end-to-end type-safe APIs
- [React](https://reactjs.org/) for the UI framework
- [TypeScript](https://www.typescriptlang.org/) for the type system
