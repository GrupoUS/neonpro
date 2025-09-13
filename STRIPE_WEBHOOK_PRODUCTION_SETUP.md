# 🔗 Stripe Webhook Production Setup Guide

## Step 1: Configure Webhook in Stripe Dashboard

### 1.1 Access Stripe Dashboard
1. Log into your **production** Stripe Dashboard at https://dashboard.stripe.com
2. Ensure you're in **Live mode** (not Test mode)
3. Navigate to **Developers** → **Webhooks**

### 1.2 Create New Webhook Endpoint
1. Click **"Add endpoint"**
2. Set **Endpoint URL** to: `https://your-production-domain.com/webhooks/stripe/webhook`
   - Replace `your-production-domain.com` with your actual production domain
   - Example: `https://api.neonpro.com.br/webhooks/stripe/webhook`

### 1.3 Configure Webhook Events
Select the following events to listen for:

**Required Events:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated` 
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Optional Events (recommended):**
- ✅ `customer.subscription.trial_will_end`
- ✅ `invoice.payment_action_required`
- ✅ `customer.created`
- ✅ `customer.updated`

### 1.4 Save and Get Signing Secret
1. Click **"Add endpoint"** to save
2. Click on the newly created webhook endpoint
3. In the **"Signing secret"** section, click **"Reveal"**
4. Copy the signing secret (starts with `whsec_`)
5. **IMPORTANT**: Store this securely - you'll need it for environment variables

## Step 2: Verify Webhook Endpoint

### 2.1 Test Webhook Endpoint
```bash
# Test that your production API can receive webhooks
curl -X POST https://your-production-domain.com/webhooks/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"type": "ping", "data": {"object": {}}}'
```

Expected response: `200 OK` with JSON response

### 2.2 Webhook Handler Verification
Your webhook handler at `/webhooks/stripe/webhook` should:
- ✅ Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
- ✅ Handle all configured event types
- ✅ Update user profiles in Supabase
- ✅ Return appropriate HTTP status codes
- ✅ Log events for monitoring

## Step 3: Environment Variables Configuration

### 3.1 Required Environment Variables
Add these to your production environment:

```bash
# Stripe Configuration (PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_live_...                    # Your live secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...               # Your live publishable key
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook signing secret from Step 1.4
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # Public key for frontend

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3.2 Environment Variable Security
- ✅ Never commit these values to version control
- ✅ Use your deployment platform's secure environment variable storage
- ✅ Rotate keys regularly
- ✅ Use different keys for staging/production environments

## Step 4: Deployment Verification

### 4.1 Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Webhook endpoint accessible at production URL
- [ ] Database migration applied (subscription fields added)
- [ ] SSL certificate valid for webhook endpoint
- [ ] Firewall allows incoming webhook requests

### 4.2 Post-Deployment Testing
1. **Test Webhook Delivery**:
   - Go to Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Verify event appears in your application logs

2. **Test Subscription Flow**:
   - Create a test subscription using your payment link
   - Verify webhook events are received and processed
   - Check that user profile is updated in database

3. **Monitor Webhook Failures**:
   - Check Stripe Dashboard for failed webhook deliveries
   - Review application logs for processing errors
   - Set up alerts for webhook failures

## Step 5: Monitoring and Maintenance

### 5.1 Webhook Monitoring
- Monitor webhook success/failure rates in Stripe Dashboard
- Set up application logging for webhook events
- Configure alerts for webhook processing failures
- Track subscription status changes in your database

### 5.2 Error Handling
Your webhook handler should:
- Return `200` for successfully processed events
- Return `400` for malformed requests
- Return `500` for temporary processing errors (Stripe will retry)
- Log all errors with sufficient detail for debugging

### 5.3 Security Best Practices
- Always verify webhook signatures
- Use HTTPS for all webhook endpoints
- Implement rate limiting if needed
- Monitor for suspicious webhook activity
- Keep webhook secrets secure and rotate regularly

## Troubleshooting Common Issues

### Issue: Webhook Signature Verification Fails
**Solution**: 
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure raw request body is used for signature verification
- Check that webhook endpoint URL matches exactly

### Issue: Events Not Being Processed
**Solution**:
- Check Stripe Dashboard for webhook delivery status
- Verify all required events are selected
- Review application logs for processing errors
- Test webhook endpoint accessibility

### Issue: Database Updates Failing
**Solution**:
- Verify Supabase connection and permissions
- Check that subscription fields exist in profiles table
- Review database query logs for errors
- Ensure user exists before updating subscription

## Next Steps After Configuration

1. **Test End-to-End Flow**: Complete a real subscription purchase
2. **Monitor for 24 Hours**: Watch for any webhook processing issues
3. **Set Up Alerts**: Configure monitoring for webhook failures
4. **Document Procedures**: Create runbooks for common webhook issues
5. **Plan Maintenance**: Schedule regular webhook health checks

---

**⚠️ IMPORTANT REMINDERS:**
- Use **LIVE** Stripe keys for production (not test keys)
- Test webhook delivery after any infrastructure changes
- Monitor webhook processing regularly
- Keep webhook secrets secure and rotate them periodically
