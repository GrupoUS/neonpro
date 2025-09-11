/**
 * OpenAPI Configuration and Documentation Setup
 * 
 * This module configures the OpenAPI documentation generator for the NeonPro Healthcare API,
 * providing automatic Swagger UI generation and API schema validation.
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Environment } from '../types/environment'

// Security schemes
const securitySchemes = {
  BearerAuth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token for authenticated access'
  }
}

// OpenAPI specification
export const openAPISpec = {
  openapi: '3.1.0',
  info: {
    title: 'NeonPro Healthcare API',
    version: '1.0.0',
    description: `
# NeonPro Healthcare Management API

A LGPD-compliant healthcare management system API built with Hono and TypeScript.

## Features
- **LGPD Compliance**: All patient data access requires explicit consent
- **Healthcare Validation**: ANVISA-compliant data structures and validation
- **Security First**: JWT authentication, rate limiting, and audit logging
- **Performance**: Edge-optimized with cold start monitoring
- **Error Tracking**: Comprehensive error monitoring and reporting

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## LGPD Compliance
Patient data access is restricted and requires:
- Valid healthcare professional authentication
- Explicit patient consent (LGPD Article 7)
- Audit trail for all data access
- Data minimization (only necessary fields returned)

## Rate Limits
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Admin endpoints: 500 requests/minute

## Error Codes
- \`LGPD_CONSENT_REQUIRED\`: Patient has not provided data processing consent
- \`HEALTHCARE_VALIDATION_FAILED\`: Data doesn't meet ANVISA requirements
- \`AUTHENTICATION_REQUIRED\`: Valid JWT token required
- \`RATE_LIMIT_EXCEEDED\`: Too many requests

## Support
For API support, contact: api-support@neonpro.health
    `,
    contact: {
      name: 'NeonPro API Support',
      email: 'api-support@neonpro.health',
      url: 'https://docs.neonpro.health'
    },
    license: {
      name: 'Proprietary',
      identifier: 'LicenseRef-NeonPro-Healthcare'
    }
  },
  servers: [
    {
      url: 'https://api.neonpro.health',
      description: 'Production server'
    },
    {
      url: 'https://api-staging.neonpro.health',
      description: 'Staging server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'System',
      description: 'System health and information endpoints'
    },
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Patients',
      description: 'Patient management (LGPD compliant)'
    },
    {
      name: 'Appointments',
      description: 'Appointment scheduling and management'
    }
  ],
  components: {
    securitySchemes
  }
}

/**
 * Create OpenAPI-enabled Hono app instance
 */
export function createOpenAPIApp() {
  return new OpenAPIHono<Environment>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: 'Validation failed',
            details: result.error.flatten(),
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString()
          },
          400
        )
      }
    }
  })
}

/**
 * Setup OpenAPI documentation endpoints
 */
export function setupOpenAPIDocumentation(app: OpenAPIHono<Environment>) {
  // OpenAPI JSON endpoint
  app.doc('/openapi.json', openAPISpec)

  // Swagger UI endpoint
  app.get('/docs', (c) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>NeonPro Healthcare API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        background: #fafafa;
      }
      .swagger-ui .topbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .swagger-ui .topbar .download-url-wrapper .select-label {
        color: white;
      }
      .swagger-ui .topbar .download-url-wrapper input[type=text] {
        border: 2px solid white;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          validatorUrl: null,
          tryItOutEnabled: true,
          supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
          docExpansion: 'list',
          operationsSorter: 'alpha',
          tagsSorter: 'alpha'
        });
      };
    </script>
  </body>
</html>
    `
    return c.html(html)
  })

  // API documentation redirect
  app.get('/documentation', (c) => {
    return c.redirect('/docs')
  })

  // Health check for documentation
  app.get('/docs/health', (c) => {
    return c.json({
      status: 'ok',
      documentation: 'available',
      endpoints: {
        swagger_ui: '/docs',
        openapi_json: '/openapi.json',
        documentation_redirect: '/documentation'
      },
      timestamp: new Date().toISOString()
    })
  })
}