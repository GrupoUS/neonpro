# 🏥 NeonPro Web Application

> Next.js 15 frontend application for NeonPro healthcare management platform

## 📱 Application Overview

The NeonPro web application is a modern, responsive frontend built with Next.js 15 and designed specifically for Brazilian aesthetic healthcare professionals. It provides a comprehensive suite of tools for patient management, appointment scheduling, and LGPD compliance tracking.

## 🚀 Features

### ✅ Authentication System

- **Login/Register Pages**: Secure authentication with form validation
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic redirect based on authentication status

### ✅ Dashboard & Navigation

- **Responsive Dashboard**: Clean, intuitive main dashboard
- **Sidebar Navigation**: Collapsible sidebar with all main sections
- **Header Component**: Search, notifications, and user dropdown

### ✅ Patient Management

- **Patient Listing**: Comprehensive patient directory with search
- **Patient Cards**: Detailed patient information cards
- **Filter System**: Advanced filtering by status and criteria
- **Quick Actions**: View, edit, and schedule appointments

### ✅ Appointment System

- **Appointment Dashboard**: Overview of all appointments
- **Status Tracking**: Color-coded appointment statuses
- **Scheduling Interface**: Easy appointment creation and management
- **Calendar Integration**: Visual appointment scheduling

### ✅ LGPD Compliance

- **Compliance Dashboard**: Real-time compliance monitoring
- **Progress Tracking**: Visual progress indicators for compliance tasks
- **Audit Alerts**: System for tracking compliance issues
- **Data Management**: Tools for LGPD-compliant data handling

## 🏗️ Architecture

### Application Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   │
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   └── layout.tsx            # Auth layout
│   │
│   └── (dashboard)/              # Protected dashboard routes
│       ├── dashboard/page.tsx    # Main dashboard
│       ├── patients/page.tsx     # Patient management
│       ├── appointments/page.tsx # Appointment system
│       ├── compliance/page.tsx   # LGPD compliance
│       └── profile/page.tsx      # User profile
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── layouts/                  # Layout components
│   └── forms/                    # Form components
│
├── lib/                          # Utility libraries
│   ├── utils.ts                  # Common utilities
│   ├── api-client.ts             # Hono RPC client
│   └── validations.ts            # Zod schemas
│
├── contexts/                     # React contexts
│   ├── auth-context.tsx          # Authentication
│   ├── api-context.tsx           # API client
│   └── theme-context.tsx         # Theme management
│
├── hooks/                        # Custom hooks
│   ├── use-auth.ts               # Authentication hooks
│   ├── use-api.ts                # API hooks
│   └── use-healthcare.ts         # Healthcare hooks
│
└── types/                        # TypeScript types
    ├── api.ts                    # API types
    ├── auth.ts                   # Auth types
    └── healthcare.ts             # Healthcare types
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- PNPM package manager

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open in browser
# http://localhost:3000
```

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript validation
pnpm format                 # Format code with Prettier

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e               # Run E2E tests
pnpm test:coverage          # Test coverage report
```

## 🎨 UI Components

### Implemented Components

- **Button**: Primary, secondary, and destructive variants
- **Input**: Form inputs with validation states
- **Card**: Content containers with headers and footers
- **Badge**: Status indicators with color variants
- **Progress**: Progress bars for compliance tracking
- **DropdownMenu**: Complex dropdown menus with submenus
- **Switch**: Toggle switches for settings
- **Textarea**: Multi-line text inputs
- **Separator**: Visual content separators

## 🔐 Authentication Flow

### Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check authentication status
    // Redirect to login if not authenticated
  }
}
```

### Authentication Context

```typescript
// contexts/auth-context.tsx
const AuthContext = createContext({
  user: null,
  login: async (credentials) => {/* ... */},
  logout: async () => {/* ... */},
  register: async (userData) => {/* ... */},
});
```

## 🌐 API Integration

### Hono RPC Client

```typescript
// lib/api-client.ts
import type { AppType } from "@neonpro/api";
import { hc } from "hono/client";

const client = hc<AppType>("/api");

export class PatientAPI {
  static async getPatients() {
    return await client.patients.$get();
  }

  static async createPatient(data: CreatePatientData) {
    return await client.patients.$post({ json: data });
  }
}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Layout Patterns

- **Sidebar**: Collapsible on mobile, fixed on desktop
- **Cards**: Responsive grid with flexible columns
- **Forms**: Single column on mobile, multi-column on desktop

## 🔍 Code Quality

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured (@/ for src/)
- Absolute imports preferred

### Linting & Formatting

- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## 🚀 Deployment

### Build Process

```bash
# Production build
pnpm build

# Build verification
pnpm start
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3004
NODE_ENV=production
```

## 📊 Current Status

### ✅ Completed Features

- Authentication system with login/register
- Dashboard navigation with responsive sidebar
- Patient management with search and filters
- Appointment system with status tracking
- LGPD compliance dashboard
- User profile management
- UI component library (27 components)

### 🔄 In Progress

- Advanced appointment scheduling
- Real-time notifications
- Enhanced patient forms

### 📋 Performance Metrics

- **Lighthouse Score**: Target >90
- **Bundle Size**: ~800KB (compressed)
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s

---

Built with ❤️ for Brazilian healthcare professionals using modern web technologies.
