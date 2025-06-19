# NEONPRO Development Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- VS Code with recommended extensions
- Git for version control

### 2. Setup
```bash
# Navigate to project
cd @project-core/projects/neonpro

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access Application
- **Main App**: http://localhost:3000
- **API Test**: http://localhost:3000/api/test-connection
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

## 📁 Key Directories & Files

### **Entry Points**
- `src/app/page.tsx` - Landing page (redirects to dashboard/login)
- `src/app/login/page.tsx` - Authentication page
- `src/app/dashboard/page.tsx` - Main dashboard

### **Core Application Structure**
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── appointments/  # Appointment management
│   │   ├── patients/     # Patient management
│   │   ├── treatments/   # Treatment management
│   │   ├── payments/     # Payment processing
│   │   └── ai-recommendations/ # AI features
│   ├── api/              # API routes
│   │   ├── appointments/ # Appointment APIs
│   │   ├── patients/     # Patient APIs
│   │   └── test-connection/ # Connection testing
│   └── login/            # Authentication pages
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   └── ui/              # Base UI components
├── lib/                 # Utilities and configurations
│   ├── supabase/       # Supabase client setup
│   ├── actions/        # Server Actions
│   └── cache/          # Caching utilities
└── middleware.ts       # Authentication middleware
```

### **Configuration Files**
- `.env.local` - Environment variables
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `drizzle.config.ts` - Database configuration

## 🛠 Development Commands

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### **Testing**
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
```

## 🔧 Development Workflow

### **1. Making Changes**
1. Start development server: `npm run dev`
2. Open VS Code in project directory
3. Make changes to files
4. Changes auto-reload in browser

### **2. Key Files to Modify**

#### **Adding New Pages**
- Create in `src/app/dashboard/[feature]/page.tsx`
- Add to navigation in `src/app/dashboard/layout.tsx`

#### **Adding New API Routes**
- Create in `src/app/api/[endpoint]/route.ts`
- Follow existing patterns for authentication

#### **Modifying UI Components**
- Base components: `src/components/ui/`
- Feature components: `src/components/dashboard/`

#### **Database Changes**
- Schema: `src/lib/supabase/types.ts`
- Queries: Use Supabase client in API routes

### **3. Testing Changes**
1. **Manual Testing**: Use browser at http://localhost:3000
2. **API Testing**: Use http://localhost:3000/api/test-connection
3. **Build Testing**: Run `npm run build` to ensure no errors

## 🌐 Port Configuration

### **Default Ports**
- **Next.js Dev Server**: 3000 (configured)
- **Alternative Port**: Use `npm run dev -- -p 3001` if needed

### **Port Conflicts**
If port 3000 is busy:
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000
npx kill-port 3000
```

## 🔍 Debugging & Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### **TypeScript Errors**
```bash
# Check types
npm run type-check
```

#### **Database Connection Issues**
- Check `.env.local` variables
- Test with: http://localhost:3000/api/test-connection

#### **Authentication Issues**
- Verify Supabase configuration
- Check middleware.ts logs

### **Development Tools**

#### **VS Code Extensions (Auto-installed)**
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Prettier Code Formatter
- ESLint
- Supabase

#### **Browser DevTools**
- **Network Tab**: Monitor API calls
- **Console**: Check for errors
- **Application Tab**: Inspect localStorage/cookies

## 📊 Performance Monitoring

### **Development Metrics**
- **Hot Reload Speed**: Should be <1s
- **Build Time**: Should be <30s
- **Page Load**: Should be <2s

### **Production Optimization**
```bash
# Analyze bundle
npm run build
# Check .next/analyze/ for bundle analysis
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### **Manual Deployment**
```bash
npm run build
npm run start
```

## 📝 Code Style

### **Formatting**
- Prettier auto-formats on save
- ESLint enforces code quality
- TypeScript ensures type safety

### **Conventions**
- Use TypeScript for all files
- Follow Next.js App Router patterns
- Use Server Components by default
- Implement proper error handling

## 🔐 Security Notes

- Never commit `.env.local` to git
- Use Server Actions for mutations
- Implement proper RLS policies
- Validate all user inputs

---

**Happy coding! 🚀**
