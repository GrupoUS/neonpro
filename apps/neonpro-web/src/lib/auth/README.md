# NeonPro - Clerk Authentication Implementation

## 🚀 Overview

This is a production-ready Clerk authentication implementation for the NeonPro healthcare management system, built with Next.js 14+ App Router and optimized for healthcare compliance (LGPD, HIPAA).

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy the environment example file:
```bash
cp .env.example .env.local
```

Configure your Clerk credentials in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

### 2. Clerk Dashboard Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Configure the following URLs:
   - Sign-in URL: `/entrar`
   - Sign-up URL: `/cadastro`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/onboarding`

### 3. Install Dependencies

```bash
pnpm install @clerk/nextjs
```

## 📁 Architecture

### Core Files

```
lib/auth/
├── clerk-config.ts          # Clerk configuration and healthcare appearance
├── simple-session-manager.ts # Production-ready session management
├── utils.ts                 # Authentication utilities and helpers
├── index.ts                 # Clean exports
└── README.md               # This file

middleware.ts               # Route protection middleware
app/layout.tsx             # Clerk provider setup
app/entrar/page.tsx        # Sign-in page
app/cadastro/page.tsx      # Sign-up page
app/dashboard/page.tsx     # Protected dashboard example
```

### Key Features

✅ **Production-Ready**
- Clean, maintainable code structure
- TypeScript support
- Error handling and validation
- Performance optimized

✅ **Healthcare Compliance**
- LGPD compliance notices
- Healthcare-focused UI/UX
- Security headers for sensitive data
- Audit logging capabilities

✅ **Security**
- Route protection middleware
- Session management
- Role-based access control (RBAC)
- Permission-based authorization

✅ **Developer Experience**
- Clean imports and exports
- Comprehensive TypeScript types
- Easy-to-use utility functions
- Well-documented code

## 🔐 Usage Examples

### Server Components (App Router)

```tsx
import { requireAuth, hasRole, HealthcareRoles } from '@/lib/auth';

export default async function ProtectedPage() {
  // Require authentication
  const auth = await requireAuth();
  
  // Check roles
  const isDoctor = await hasRole(HealthcareRoles.DOCTOR);
  
  return (
    <div>
      <h1>Welcome, {auth.user?.firstName}!</h1>
      {isDoctor && <DoctorOnlyComponent />}
    </div>
  );
}
```

### Client Components

```tsx
'use client';
import { useAuth, UserButton, SignedIn, SignedOut } from '@/lib/auth';

export default function ClientComponent() {
  const { isLoaded, isSignedIn, user } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      <SignedIn>
        <UserButton />
        <p>Hello, {user?.firstName}!</p>
      </SignedIn>
      <SignedOut>
        <a href="/entrar">Sign In</a>
      </SignedOut>
    </div>
  );
}
```

### API Routes

```tsx
import { getAuth, requirePermission, HealthcarePermissions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await getAuth();
  
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check specific permission
  const hasPermission = await requirePermission(HealthcarePermissions.VIEW_PATIENTS);
  
  return NextResponse.json({ message: 'Success', userId: auth.userId });
}
```

## 🛡️ Security Features

### Route Protection

Routes are automatically protected based on the configuration in `clerk-config.ts`:

```typescript
protectedRoutes: [
  '/dashboard',
  '/patients',
  '/appointments',
  '/admin',
  '/api/protected'
]
```

### Session Management

- Automatic session timeout (30 minutes default)
- Concurrent session limits (3 sessions max)
- Session activity tracking
- Clean expired session cleanup

### Healthcare Compliance

- LGPD consent notices
- Healthcare-specific styling
- Security headers for sensitive data
- Audit logging capabilities

## 🎨 Customization

### Appearance Customization

Modify the healthcare appearance in `clerk-config.ts`:

```typescript
export const healthcareAppearance = {
  variables: {
    colorPrimary: '#0ea5e9',        // Healthcare blue
    colorBackground: '#ffffff',
    // ... more customization
  }
};
```

### Role and Permission Management

Define custom roles and permissions in `utils.ts`:

```typescript
export const HealthcareRoles = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  // ... more roles
} as const;
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all environment variables are set correctly
2. **Import Errors**: Use imports from `@/lib/auth` instead of direct Clerk imports
3. **Session Issues**: Check if session cleanup is running properly
4. **Route Protection**: Verify middleware configuration in `middleware.ts`

### Debugging

Enable debug mode in development:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📚 References

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [LGPD Compliance](https://lgpd.imdaz.com.br/)
- [Healthcare Data Security](https://www.hhs.gov/hipaa/index.html)

## 🔄 Migration from Old Auth

If migrating from the old authentication system:

1. Remove old auth files (enhanced-session-manager.ts, etc.)
2. Update imports to use the new `@/lib/auth` module
3. Replace old session management calls with new utilities
4. Update middleware configuration
5. Test all protected routes

This implementation provides a solid foundation for healthcare applications requiring robust authentication with compliance features.