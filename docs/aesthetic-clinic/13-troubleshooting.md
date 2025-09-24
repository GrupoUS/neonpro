# Troubleshooting Guide

## 🔧 Common Issues & Solutions

This guide provides comprehensive troubleshooting information for common issues encountered while developing, deploying, and maintaining the NeonPro Aesthetic Clinic system.

## 📋 Table of Contents

- [Development Environment Issues](#-development-environment-issues)
- [Database Issues](#-database-issues)
- [API Issues](#-api-issues)
- [Frontend Issues](#-frontend-issues)
- [Authentication Issues](#-authentication-issues)
- [Performance Issues](#-performance-issues)
- [Deployment Issues](#-deployment-issues)
- [Testing Issues](#-testing-issues)
- [Compliance Issues](#-compliance-issues)
- [Security Issues](#-security-issues)

## 🛠️ Development Environment Issues

### Node.js Version Compatibility

```bash
# Check current Node.js version
node --version

# Expected: v18.x or v20.x
# If using wrong version:

# Using nvm (recommended)
nvm install 20
nvm use 20

# Or install from official website
# https://nodejs.org/
```

### Dependency Installation Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For pnpm users
rm -rf node_modules pnpm-lock.yaml
pnpm install

# If permission issues occur:
sudo chown -R $USER:$USER node_modules
npm install --no-optional

# Or use pnpm with sudo (not recommended, use npm config)
npm config set prefix ~/.npm-global
```

### Port Conflicts

```bash
# Check if port is in use
lsof -i :3000  # Web app
lsof -i :3001  # API server
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill process using port
kill -9 $(lsof -t -i:3000)

# Or use different ports in .env.local
PORT=3001
WEB_PORT=3000
```

### Docker Issues

```bash
# Docker not starting
docker --version

# If Docker is not installed or not running:
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
sudo systemctl enable docker

# Docker permission issues
sudo usermod -aG docker $USER
newgrp docker  # Log out and back in or restart terminal

# Docker Compose issues
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs api
docker-compose logs postgres
docker-compose logs redis
```

## 🗄️ Database Issues

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U postgres -d neonpro

# If connection fails:
# 1. Check if PostgreSQL is running
sudo systemctl status postgresql

# 2. Start PostgreSQL if not running
sudo systemctl start postgresql

# 3. Check database exists
psql -h localhost -U postgres -c "\l"

# 4. Create database if not exists
createdb -h localhost -U postgres neonpro

# Check connection string in .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neonpro"
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset database and apply migrations
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Database Performance Issues

```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_fetch DESC;
```

### Database Permission Issues

```sql
-- Check user permissions
SELECT * FROM pg_user;
SELECT * FROM pg_roles;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE neonpro TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Check RLS policies
SELECT * FROM pg_policies;

-- Create RLS policies if missing
ALTER TABLE aesthetic_client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_isolation ON aesthetic_client_profiles
  FOR ALL TO authenticated_user
  USING (professional_id = current_user_id());
```

## 🔌 API Issues

### API Server Won't Start

```bash
# Check for syntax errors
cd apps/api
npm run build

# If build fails, check error output
# Common issues:
# - Missing dependencies
# - TypeScript errors
# - Configuration issues

# Check environment variables
npm run start:dev

# If port conflict, use different port
PORT=3002 npm run start:dev
```

### API Response Issues

```typescript
// Check API health
curl http://localhost:3001/health

// Check specific endpoint
curl -H "Authorization: Bearer your-token" \
     http://localhost:3001/api/v1/clients

// Enable debug logging
DEBUG=neonpro:* npm run start:dev

// Check request/response headers
curl -v http://localhost:3001/health
```

### tRPC Issues

```typescript
// Common tRPC issues and solutions

// 1. Type mismatch
export const clientRouter = t.router({
  // ✅ Correct
  getClient: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.client.findUnique({ where: { id: input.id } });
    }),
  
  // ❌ Missing input validation
  getClient: t.procedure
    .query(async ({ input }) => {
      // input will be undefined
    })
});

// 2. Missing context
export const createProtectedRouter = () => {
  return t.router({
    // ✅ Correct - uses context
    protectedProcedure: t.procedure
      .use(({ ctx, next }) => {
        if (!ctx.user) {
          throw new Error('Unauthorized');
        }
        return next({ ctx: { ...ctx, user: ctx.user } });
      })
      .query(async ({ ctx }) => {
        return ctx.user;
      })
  });
};
```

## 🎨 Frontend Issues

### Build Issues

```bash
# Check build errors
cd apps/web
npm run build

# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Import errors
# - Environment variables missing

# Clear build cache
rm -rf .next dist build
npm run build

# Check for memory issues
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### React Component Issues

```typescript
// Common React issues and solutions

// 1. Infinite loops in useEffect
// ❌ Problem: Missing dependency array
useEffect(() => {
  fetchClients();
});

// ✅ Solution: Add empty dependency array for initial load
useEffect(() => {
  fetchClients();
}, []);

// ✅ Solution: Add dependencies when needed
useEffect(() => {
  fetchClients(searchTerm);
}, [searchTerm]);

// 2. State mutation
// ❌ Problem: Direct state mutation
const updateClient = (client) => {
  client.name = 'New Name'; // Direct mutation
  setClients(clients);
};

// ✅ Solution: Create new reference
const updateClient = (clientId, newName) => {
  setClients(prev => 
    prev.map(client => 
      client.id === clientId 
        ? { ...client, name: newName }
        : client
    )
  );
};

// 3. Prop drilling issues
// ❌ Problem: Passing props through many levels
function GrandParent() {
  const [user, setUser] = useState(null);
  return <Parent user={user} setUser={setUser} />;
}

function Parent({ user, setUser }) {
  return <Child user={user} setUser={setUser} />;
}

function Child({ user, setUser }) {
  return <GrandChild user={user} setUser={setUser} />;
}

// ✅ Solution: Use Context API
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

function GrandChild() {
  const { user, setUser } = useContext(UserContext);
  // Use user and setUser directly
}
```

### Styling Issues

```css
/* Common CSS issues and solutions */

/* 1. Style conflicts */
/* ❌ Problem: Generic class names */
.card {
  padding: 1rem;
  border: 1px solid #ccc;
}

/* ✅ Solution: Use specific or scoped class names */
.aesthetic-client-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

/* 2. Responsive design issues */
/* ❌ Problem: Fixed widths */
.container {
  width: 1200px;
}

/* ✅ Solution: Use responsive units */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 3. Z-index conflicts */
/* Define z-index scale */
:root {
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal: 1040;
  --z-index-popover: 1050;
  --z-index-tooltip: 1060;
}

.modal {
  z-index: var(--z-index-modal);
}
```

## 🔐 Authentication Issues

### JWT Token Issues

```typescript
// Common JWT issues and solutions

// 1. Token expiration
// ❌ Problem: Token expired but still trying to use
const token = localStorage.getItem('token');
// Token is expired but still being sent

// ✅ Solution: Check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const token = localStorage.getItem('token');
if (token && !isTokenExpired(token)) {
  // Use valid token
} else {
  // Refresh or logout
}

// 2. Token validation issues
// ❌ Problem: Insecure token validation
jwt.verify(token, 'hardcoded-secret');

// ✅ Solution: Use environment variable
jwt.verify(token, process.env.JWT_SECRET);

// 3. Token storage issues
// ❌ Problem: Storing sensitive data in localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// ✅ Solution: Use more secure options
// Use httpOnly cookies for production
document.cookie = `token=${token}; path=/; secure; httpOnly; samesite=strict`;
```

### Session Management Issues

```typescript
// Common session issues and solutions

// 1. Session timeout
// ❌ Problem: No session timeout
const session = {
  userId: user.id,
  token: jwt.sign({ userId: user.id }, secret)
};

// ✅ Solution: Add session timeout
const session = {
  userId: user.id,
  token: jwt.sign(
    { userId: user.id }, 
    secret, 
    { expiresIn: '24h' }
  ),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
};

// 2. Concurrent session issues
// ❌ Problem: Multiple sessions for same user
const sessions = await db.session.findMany({
  where: { userId: user.id }
});

// ✅ Solution: Single active session
const existingSession = await db.session.findFirst({
  where: { userId: user.id, isActive: true }
});

if (existingSession) {
  await db.session.update({
    where: { id: existingSession.id },
    data: { isActive: false }
  });
}

// Create new session
const newSession = await db.session.create({
  data: {
    userId: user.id,
    token,
    isActive: true
  }
});
```

### Permission Issues

```typescript
// Common permission issues and solutions

// 1. Role-based access control issues
// ❌ Problem: Hardcoded role checks
if (user.role === 'admin') {
  // Allow access
}

// ✅ Solution: Use permission-based system
const permissions = {
  admin: ['clients:create', 'clients:read', 'clients:update', 'clients:delete'],
  professional: ['clients:read', 'clients:update'],
  receptionist: ['clients:read', 'clients:create']
};

const hasPermission = (user: User, permission: string): boolean => {
  return permissions[user.role]?.includes(permission) || false;
};

// 2. Resource ownership issues
// ❌ Problem: No ownership check
app.put('/clients/:id', authMiddleware, async (req, res) => {
  // Anyone can update any client
});

// ✅ Solution: Check ownership
app.put('/clients/:id', authMiddleware, async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id }
  });
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  
  if (client.professionalId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Update client
});
```

## ⚡ Performance Issues

### Frontend Performance Issues

```typescript
// Common frontend performance issues and solutions

// 1. Unnecessary re-renders
// ❌ Problem: Component re-renders on every state change
const Parent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveComponent />
    </div>
  );
};

// ✅ Solution: Use React.memo and useMemo
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// 2. Large bundle size
// ❌ Problem: Large JavaScript bundle
import { Chart, Calendar, DatePicker } from 'heavy-library';

// ✅ Solution: Code splitting and lazy loading
const Chart = lazy(() => import('heavy-library').then(mod => ({ default: mod.Chart })));
const Calendar = lazy(() => import('heavy-library').then(mod => ({ default: mod.Calendar })));

// 3. Inefficient data fetching
// ❌ Problem: Multiple API calls for related data
useEffect(() => {
  fetchClients();
  fetchTreatments();
  fetchAppointments();
}, []);

// ✅ Solution: Use GraphQL or batch requests
const { data, loading } = useQuery(GET_DASHBOARD_DATA, {
  variables: { clientId }
});
```

### API Performance Issues

```typescript
// Common API performance issues and solutions

// 1. N+1 query problem
// ❌ Problem: N+1 database queries
const clients = await prisma.client.findMany();
for (const client of clients) {
  client.treatments = await prisma.treatment.findMany({
    where: { clientId: client.id }
  });
}

// ✅ Solution: Use eager loading
const clients = await prisma.client.findMany({
  include: {
    treatments: true,
    appointments: true
  }
});

// 2. No caching
// ❌ Problem: No caching for frequent requests
app.get('/api/v1/clients', async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});

// ✅ Solution: Implement caching
const cache = new Map();

app.get('/api/v1/clients', async (req, res) => {
  const cacheKey = 'clients:' + JSON.stringify(req.query);
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const clients = await prisma.client.findMany();
  cache.set(cacheKey, clients);
  
  // Set cache expiration
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  res.json(clients);
});

// 3. Pagination issues
// ❌ Problem: Loading all data at once
app.get('/api/v1/clients', async (req, res) => {
  const clients = await prisma.client.findMany(); // All clients
  res.json(clients);
});

// ✅ Solution: Implement pagination
app.get('/api/v1/clients', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.client.count()
  ]);
  
  res.json({
    clients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});
```

### Database Performance Issues

```sql
-- Common database performance issues and solutions

-- 1. Missing indexes
-- ❌ Problem: Slow queries on large tables
EXPLAIN ANALYZE SELECT * FROM aesthetic_client_profiles WHERE email = 'test@example.com';

-- ✅ Solution: Add appropriate indexes
CREATE INDEX idx_aesthetic_client_profiles_email ON aesthetic_client_profiles(email);
CREATE INDEX idx_aesthetic_client_profiles_status_created ON aesthetic_client_profiles(status, created_at DESC);
CREATE INDEX idx_aesthetic_treatments_client_id ON aesthetic_treatments(client_id);

-- 2. Inefficient queries
-- ❌ Problem: Using SELECT *
SELECT * FROM aesthetic_client_profiles WHERE status = 'active';

-- ✅ Solution: Select only needed columns
SELECT id, full_name, email, phone FROM aesthetic_client_profiles WHERE status = 'active';

-- 3. Connection pool issues
-- Check connection pool usage
SELECT 
  state,
  count(*) as connection_count
FROM pg_stat_activity 
WHERE datname = 'neonpro' 
GROUP BY state;

-- Adjust connection pool size in Prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool {
    maxConnections = 20
    minConnections = 5
    connectTimeout = 30
  }
}
```

## 🚀 Deployment Issues

### Build Issues in Production

```bash
# Common production build issues

# 1. Out of memory error
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 2. Missing environment variables
# Check .env.production
echo "NODE_ENV=production" > .env.production
echo "DATABASE_URL=$DATABASE_URL" >> .env.production
echo "JWT_SECRET=$JWT_SECRET" >> .env.production

# 3. Build timeout
# Use faster package manager
npm install -g pnpm
pnpm install
pnpm build
```

### Docker Deployment Issues

```bash
# Common Docker deployment issues

# 1. Container won't start
# Check container logs
docker logs container-name

# 2. Port conflicts
# Check container port mapping
docker ps

# 3. Database connection issues
# Check network configuration
docker network ls
docker network inspect network-name

# 4. Environment variables not set
# Check environment variables in container
docker exec container-name env
```

### Kubernetes Deployment Issues

```bash
# Common Kubernetes deployment issues

# 1. Pod won't start
kubectl describe pod pod-name
kubectl logs pod-name

# 2. Resource limits exceeded
kubectl top pods
kubectl describe pod pod-name | grep -A 10 "Limits"

# 3. Readiness probe failures
kubectl describe pod pod-name | grep -A 10 "Readiness"

# 4. Service discovery issues
kubectl get svc
kubectl get endpoints
kubectl describe service service-name
```

## 🧪 Testing Issues

### Unit Test Issues

```typescript
// Common unit testing issues and solutions

// 1. Test environment setup
// ❌ Problem: Tests not isolated
describe('ClientService', () => {
  let service: ClientService;
  
  beforeAll(() => {
    service = new ClientService();
  });
  
  it('should create client', async () => {
    // Tests might interfere with each other
  });
});

// ✅ Solution: Proper test isolation
describe('ClientService', () => {
  let service: ClientService;
  let prisma: PrismaClient;
  
  beforeEach(async () => {
    prisma = new TestPrismaClient();
    service = new ClientService(prisma);
    await prisma.aestheticClientProfile.deleteMany();
  });
  
  afterEach(async () => {
    await prisma.$disconnect();
  });
  
  it('should create client', async () => {
    const client = await service.createClient(validClientData);
    expect(client).toMatchObject(validClientData);
  });
});

// 2. Mock setup issues
// ❌ Problem: Incomplete mock setup
jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}));

// ✅ Solution: Complete mock setup
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));
```

### Integration Test Issues

```typescript
// Common integration testing issues and solutions

// 1. Database cleanup
// ❌ Problem: Tests leaving data behind
afterAll(async () => {
  await prisma.$disconnect();
});

// ✅ Solution: Proper cleanup
afterAll(async () => {
  await prisma.aestheticClientProfile.deleteMany();
  await prisma.aestheticTreatment.deleteMany();
  await prisma.$disconnect();
});

// 2. Test dependencies
// ❌ Problem: Tests running in wrong order
describe('Client Workflow', () => {
  it('should create client', async () => {
    // Depends on client being created first
  });
  
  it('should create treatment', async () => {
    // Depends on treatment being created second
  });
});

// ✅ Solution: Independent tests or proper setup
describe('Client Workflow', () => {
  let client: any;
  
  beforeEach(async () => {
    client = await createTestClient();
  });
  
  it('should create treatment', async () => {
    const treatment = await createTestTreatment(client.id);
    expect(treatment.clientId).toBe(client.id);
  });
});
```

### E2E Test Issues

```typescript
// Common E2E testing issues and solutions

// 1. Flaky tests
// ❌ Problem: Tests failing due to timing issues
test('should create client', async ({ page }) => {
  await page.click('[data-testid="add-client"]');
  await page.fill('[data-testid="fullName"]', 'Test Client');
  await page.click('[data-testid="submit"]');
  // Might fail if not waiting for element
  expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

// ✅ Solution: Proper waiting
test('should create client', async ({ page }) => {
  await page.click('[data-testid="add-client"]');
  await page.fill('[data-testid="fullName"]', 'Test Client');
  await page.click('[data-testid="submit"]');
  await page.waitForSelector('[data-testid="success-message"]');
  expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

// 2. Test data setup
// ❌ Problem: Tests depending on specific data
test('should display client list', async ({ page }) => {
  // Assumes clients exist in database
  await page.goto('/clients');
  expect(page.locator('[data-testid="client-item"]')).toHaveCount(5);
});

// ✅ Solution: Create test data
test('should display client list', async ({ page }) => {
  // Create test clients via API or setup script
  await createTestClients(5);
  
  await page.goto('/clients');
  await page.waitForSelector('[data-testid="client-item"]');
  expect(page.locator('[data-testid="client-item"]')).toHaveCount(5);
});
```

## 📋 Compliance Issues

### LGPD Compliance Issues

```typescript
// Common LGPD compliance issues and solutions

// 1. Missing consent
// ❌ Problem: Creating client without consent
const client = await prisma.aestheticClientProfile.create({
  data: {
    fullName: 'Test Client',
    email: 'test@example.com',
    // Missing lgpdConsent field
  }
});

// ✅ Solution: Require consent
const client = await prisma.aestheticClientProfile.create({
  data: {
    fullName: 'Test Client',
    email: 'test@example.com',
    lgpdConsent: true, // Required
    consentDate: new Date(), // When consent was given
    consentVersion: '1.0' // Version of privacy policy
  }
});

// 2. Data retention issues
// ❌ Problem: Keeping data indefinitely
const clients = await prisma.aestheticClientProfile.findMany();

// ✅ Solution: Implement data retention
const retentionDate = new Date();
retentionDate.setFullYear(retentionDate.getFullYear() - 7); // 7 years

const clientsToArchive = await prisma.aestheticClientProfile.findMany({
  where: {
    status: 'inactive',
    updatedAt: { lt: retentionDate }
  }
});

// Archive or delete old data
for (const client of clientsToArchive) {
  await prisma.aestheticClientProfile.update({
    where: { id: client.id },
    data: { 
      status: 'archived',
      archivedAt: new Date()
    }
  });
}

// 3. Data access requests
// ❌ Problem: No mechanism for data subject requests
// ✅ Solution: Implement data export
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      aestheticClientProfiles: {
        include: {
          treatments: true,
          appointments: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    personalData: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    },
    clientProfiles: user.aestheticClientProfiles,
    exportedAt: new Date()
  };
}
```

### ANVISA Compliance Issues

```typescript
// Common ANVISA compliance issues and solutions

// 1. Product tracking issues
// ❌ Problem: No ANVISA code tracking
const treatment = await prisma.aestheticTreatment.create({
  data: {
    name: 'Botox Treatment',
    // Missing ANVISA code
  }
});

// ✅ Solution: Track ANVISA codes
const treatment = await prisma.aestheticTreatment.create({
  data: {
    name: 'Botox Treatment',
    anvisaCode: '1234567890123', // ANVISA registration number
    anvisaExpiry: new Date('2025-12-31'), // ANVISA registration expiry
    batchNumber: 'LOT001', // Product batch number
    manufacturer: 'Allergan', // Manufacturer name
    // ... other fields
  }
});

// 2. Adverse event reporting
// ❌ Problem: No adverse event tracking
// ✅ Solution: Implement adverse event reporting
export async function reportAdverseEvent(data: AdverseEventReport) {
  const event = await prisma.adverseEvent.create({
    data: {
      treatmentId: data.treatmentId,
      clientId: data.clientId,
      professionalId: data.professionalId,
      event: data.event,
      severity: data.severity,
      description: data.description,
      action: data.action,
      reportedAt: new Date(),
      anvisaNotified: false
    }
  });
  
  // Notify ANVISA if required
  if (event.severity === 'severe') {
    await notifyANVISA(event);
  }
  
  return event;
}
```

## 🔒 Security Issues

### Common Security Vulnerabilities

```typescript
// Common security issues and solutions

// 1. SQL Injection
// ❌ Problem: Raw SQL with user input
const query = `SELECT * FROM clients WHERE email = '${req.body.email}'`;
const result = await prisma.$queryRawUnsafe(query);

// ✅ Solution: Use parameterized queries
const result = await prisma.client.findMany({
  where: {
    email: req.body.email
  }
});

// 2. XSS vulnerabilities
// ❌ Problem: Direct rendering of user input
const UserCard = ({ user }) => (
  <div>
    <h3>{user.fullName}</h3>
    <p>{user.bio}</p> {/* Vulnerable to XSS */}
  </div>
);

// ✅ Solution: Sanitize user input
import DOMPurify from 'dompurify';

const UserCard = ({ user }) => (
  <div>
    <h3>{user.fullName}</h3>
    <p dangerouslySetInnerHTML={{ 
      __html: DOMPurify.sanitize(user.bio) 
    }} />
  </div>
);

// 3. CSRF vulnerabilities
// ❌ Problem: No CSRF protection
app.post('/api/v1/clients', (req, res) => {
  // Vulnerable to CSRF
});

// ✅ Solution: Implement CSRF protection
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.post('/api/v1/clients', csrfProtection, (req, res) => {
  // Protected from CSRF
});

// 4. Insecure data storage
// ❌ Problem: Storing sensitive data in plaintext
const client = await prisma.client.create({
  data: {
    fullName: 'Test Client',
    cpf: '12345678900', // Sensitive data in plaintext
    phone: '+5511999999999' // Sensitive data in plaintext
  }
});

// ✅ Solution: Encrypt sensitive data
import { encrypt } from '../utils/encryption';

const client = await prisma.client.create({
  data: {
    fullName: 'Test Client',
    cpf: await encrypt('12345678900'),
    phone: await encrypt('+5511999999999')
  }
});
```

## 📞 Getting Help

### Community Support

```bash
# Join our community channels
- Discord: https://discord.gg/neonpro
- GitHub Discussions: https://github.com/neonpro/neonpro/discussions
- Stack Overflow: https://stackoverflow.com/questions/tagged/neonpro

# Search existing issues
https://github.com/neonpro/neonpro/issues

# Create new issue
https://github.com/neonpro/neonpro/issues/new
```

### Bug Reporting Template

```markdown
## 🐛 Bug Report

### Environment

- OS: [e.g., macOS 13.0, Ubuntu 22.04]
- Node.js: [e.g., v18.17.0, v20.5.0]
- Browser: [e.g., Chrome 115, Safari 16]
- NeonPro Version: [e.g., v1.0.0]

### Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior

A brief description of what you expected to happen.

### Actual Behavior

A brief description of what actually happened.

### Error Messages
```

Paste error messages here

```
### Screenshots
If applicable, add screenshots to help explain your problem.

### Additional Context
Add any other context about the problem here.
```

This comprehensive troubleshooting guide should help resolve most common issues encountered while working with the NeonPro Aesthetic Clinic system. For issues not covered here, please refer to the documentation or reach out to the community for support.
