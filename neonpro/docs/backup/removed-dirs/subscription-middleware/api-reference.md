# API Reference - Subscription Middleware

## Authentication

All API endpoints require authentication via Supabase session cookies or Bearer tokens.

### Headers Required
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### GET /api/subscription/status

Retrieves current user's subscription status and feature access.

#### Request
```http
GET /api/subscription/status
```

#### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "subscription": {
      "tier": "professional",
      "status": "active",
      "expiresAt": "2025-12-31T23:59:59Z",
      "featuresEnabled": {
        "advanced_analytics": true,
        "multi_clinic_support": true,
        "custom_reports": true
      },
      "usageLimits": {
        "monthly_patients": 1000,
        "monthly_appointments": 5000,
        "storage_gb": 100
      },
      "currentUsage": {
        "monthly_patients": 234,
        "monthly_appointments": 1456,
        "storage_gb": 23.5
      }
    },
    "performance": {
      "responseTime": 45,
      "cached": true
    }
  }
}
```