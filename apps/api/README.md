# Hono.dev API Server

## Overview

High-performance TypeScript API server using Hono.dev framework, designed for NeonPro clinic
management system.

## Features

- **Ultra-fast**: 402,820 req/sec benchmark performance
- **TypeScript**: First-class TypeScript support
- **Vercel Ready**: Native Edge Functions deployment
- **Database**: Prisma ORM + Supabase PostgreSQL
- **Authentication**: Supabase Auth + JWT
- **Validation**: Zod schema validation
- **Compliance**: LGPD + ANVISA compliance built-in
- **Middleware**: Rate limiting, audit logging, error handling

## Quick Start

### Install Dependencies

```bash
# From apps/api directory
pnpm install

# Or run the install script
./install-deps.sh
```

### Environment Setup

Create `.env` file:

```bash
NODE_ENV=development
PORT=8000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Database
DATABASE_URL=your_postgres_url

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Rate Limiting
REDIS_URL=optional_redis_url
```

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh tokens
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Clinics

- `GET /api/v1/clinics` - List clinics
- `POST /api/v1/clinics` - Create clinic
- `GET /api/v1/clinics/:id` - Get clinic details
- `PUT /api/v1/clinics/:id` - Update clinic

### Patients

- `GET /api/v1/patients` - List/search patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient

### Appointments

- `GET /api/v1/appointments` - List/filter appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/:id` - Get appointment details
- `PUT /api/v1/appointments/:id` - Update appointment

### Utilities

- `GET /health` - Health check
- `GET /` - API information

## Architecture

### Middleware Stack

1. **Timing** - Request timing
2. **Logger** - Request logging
3. **Security Headers** - Security headers
4. **CORS** - Cross-origin configuration
5. **Compression** - Response compression
6. **Audit** - Audit logging for compliance
7. **LGPD** - Data protection compliance
8. **Rate Limiting** - Request rate limiting
9. **Database** - Database connection management

### Error Handling

- Global error handler with structured responses
- Zod validation errors
- Database errors
- Authentication errors
- Business logic errors

### Performance

- **Framework**: Hono.dev (fastest JS web framework)
- **Runtime**: Node.js with TypeScript
- **Bundling**: Built-in optimization
- **Deployment**: Vercel Edge Functions
- **Caching**: Response caching where appropriate

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Vercel)

Set in Vercel dashboard:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## Compliance Features

### LGPD (Brazilian Data Protection)

- Data consent tracking
- Data access rights
- Data deletion rights
- Audit logging
- Privacy by design

### ANVISA (Brazilian Health Agency)

- Non-medical system compliance
- Aesthetic clinic regulations
- Product tracking
- Professional licensing

## Development Notes

### Code Organization

```
src/
├── index.ts          # Main application
├── types/            # TypeScript types
├── lib/              # Utilities and database
├── middleware/       # Middleware functions
└── routes/           # API route handlers
```

### Best Practices

- Use TypeScript strict mode
- Validate all inputs with Zod
- Handle errors gracefully
- Log security events
- Rate limit sensitive endpoints
- Implement proper CORS
- Use secure headers

### Testing

```bash
# Run tests (when implemented)
pnpm test

# Run with coverage
pnpm test:coverage
```

## Migration Notes

This API server replaces the previous FastAPI Python backend with:

- **Better Performance**: 3x faster than FastAPI
- **Type Safety**: Full TypeScript integration
- **Deployment**: Native Vercel support
- **Maintenance**: Unified TypeScript codebase
- **Developer Experience**: Better tooling and debugging

All endpoints maintain compatibility with the existing frontend while providing better performance
and developer experience.
