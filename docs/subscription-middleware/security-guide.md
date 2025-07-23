# Security Guide - Subscription Middleware

## Security Architecture

### Authentication & Authorization

#### 1. Supabase Authentication
- JWT-based session management
- Row Level Security (RLS) policies
- Multi-factor authentication support
- Session timeout and refresh handling

#### 2. Middleware Security
```typescript
// Route protection in middleware.ts
export async function middleware(request: NextRequest) {
  // 1. CSRF protection
  if (!isValidCSRFToken(request)) {
    return NextResponse.redirect('/login');
  }
  
  // 2. Rate limiting
  if (isRateLimited(request)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // 3. Subscription validation
  const subscription = await validateSubscription(request);
  if (!subscription.isValid) {
    return NextResponse.redirect('/subscription/expired');
  }
  
  return NextResponse.next();
}
```

### Data Protection

#### 1. Database Security
```sql
-- Row Level Security Policy Example
CREATE POLICY "Users can only access own subscription data"
  ON profiles FOR ALL
  USING (auth.uid() = user_id);

-- Sensitive data encryption
CREATE POLICY "Encrypt sensitive fields"
  ON profiles FOR ALL
  USING (
    pgp_sym_encrypt(subscription_details::text, current_setting('app.encryption_key'))
  );
```