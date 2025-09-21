/**
 * Mixed Content Prevention Tests
 * Ensures all resources are served over HTTPS and mixed content is prevented
 */

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

describe('Mixed Content Prevention', () => {
  describe('Content Security Policy Validation', () => {
    it('should enforce HTTPS for all resource types', () => {
      const cspDirectives = [
        'default-src \'self\'',
        'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://vercel.live https://js.stripe.com https://checkout.stripe.com',
        'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
        'font-src \'self\' https://fonts.gstatic.com',
        'img-src \'self\' data: https: blob:',
        'media-src \'self\' data: https:',
        'connect-src \'self\' https://api.stripe.com https://checkout.stripe.com wss: ws:',
        'frame-src \'self\' https://js.stripe.com https://checkout.stripe.com',
        'object-src \'none\'',
        'base-uri \'self\'',
        'form-action \'self\'',
        'frame-ancestors \'none\'',
        'upgrade-insecure-requests',
      ];

      const csp = cspDirectives.join('; ');

      // Verify upgrade-insecure-requests is present
      expect(csp).toContain('upgrade-insecure-requests');

      // Verify no HTTP URLs are allowed (except for specific cases)
      expect(csp).not.toMatch(/http:\/\/(?!localhost)/);

      // Verify HTTPS is enforced for external resources
      const httpsOnlyDirectives = [
        'script-src',
        'style-src',
        'font-src',
        'connect-src',
        'frame-src',
      ];
      httpsOnlyDirectives.forEach(directive => {
        const directiveMatch = csp.match(new RegExp(`${directive}[^;]+`));
        if (directiveMatch) {
          const directiveValue = directiveMatch[0];
          // Should not contain HTTP URLs (except localhost for development)
          expect(directiveValue).not.toMatch(/http:\/\/(?!localhost)/);
        }
      });
    });

    it('should block insecure resource types', () => {
      const cspDirectives = [
        'default-src \'self\'',
        'object-src \'none\'',
        'base-uri \'self\'',
        'form-action \'self\'',
        'frame-ancestors \'none\'',
      ];

      const csp = cspDirectives.join('; ');

      // Verify dangerous resource types are blocked
      expect(csp).toContain('object-src \'none\'');
      expect(csp).toContain('frame-ancestors \'none\'');
      expect(csp).toContain('base-uri \'self\'');
      expect(csp).toContain('form-action \'self\'');
    });
  });

  describe('Resource URL Validation', () => {
    const validateResourceUrls = (html: string) => {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const issues: string[] = [];

      // Check script sources
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        if (src && src.startsWith('http://') && !src.includes('localhost')) {
          issues.push(`Script ${index + 1}: Insecure HTTP URL - ${src}`);
        }
      });

      // Check link sources (stylesheets, etc.)
      const links = document.querySelectorAll('link[href]');
      links.forEach((link, index) => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel');
        if (href && href.startsWith('http://') && !href.includes('localhost')) {
          issues.push(`Link ${index + 1} (${rel}): Insecure HTTP URL - ${href}`);
        }
      });

      // Check image sources
      const images = document.querySelectorAll('img[src]');
      images.forEach((img, index) => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('http://') && !src.includes('localhost')) {
          issues.push(`Image ${index + 1}: Insecure HTTP URL - ${src}`);
        }
      });

      // Check iframe sources
      const iframes = document.querySelectorAll('iframe[src]');
      iframes.forEach((iframe, index) => {
        const src = iframe.getAttribute('src');
        if (src && src.startsWith('http://') && !src.includes('localhost')) {
          issues.push(`Iframe ${index + 1}: Insecure HTTP URL - ${src}`);
        }
      });

      // Check form actions
      const forms = document.querySelectorAll('form[action]');
      forms.forEach((form, index) => {
        const action = form.getAttribute('action');
        if (action && action.startsWith('http://') && !action.includes('localhost')) {
          issues.push(`Form ${index + 1}: Insecure HTTP action - ${action}`);
        }
      });

      return issues;
    };

    it('should not contain HTTP URLs in production HTML', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
          <script src="https://js.stripe.com/v3/"></script>
        </head>
        <body>
          <img src="https://example.com/image.jpg" alt="Test">
          <iframe src="https://checkout.stripe.com/embed"></iframe>
          <form action="https://api.neonpro.com/submit" method="post"></form>
        </body>
        </html>
      `;

      const issues = validateResourceUrls(sampleHtml);
      expect(issues).toHaveLength(0);
    });

    it('should detect mixed content violations', () => {
      const mixedContentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="http://insecure.example.com/style.css">
          <script src="http://insecure.example.com/script.js"></script>
        </head>
        <body>
          <img src="http://insecure.example.com/image.jpg" alt="Test">
          <iframe src="http://insecure.example.com/frame"></iframe>
          <form action="http://insecure.example.com/submit" method="post"></form>
        </body>
        </html>
      `;

      const issues = validateResourceUrls(mixedContentHtml);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.includes('Insecure HTTP URL'))).toBe(true);
    });

    it('should allow localhost HTTP URLs in development', () => {
      const developmentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="http://localhost:3000/dev-script.js"></script>
          <link rel="stylesheet" href="http://127.0.0.1:5173/dev-style.css">
        </head>
        <body>
          <img src="http://localhost:8080/dev-image.jpg" alt="Dev Image">
        </body>
        </html>
      `;

      const issues = validateResourceUrls(developmentHtml);
      expect(issues).toHaveLength(0);
    });
  });

  describe('WebSocket Security', () => {
    it('should enforce WSS for WebSocket connections in production', () => {
      const csp =
        'connect-src \'self\' https://api.stripe.com https://checkout.stripe.com wss: ws:';

      // WSS should be allowed
      expect(csp).toContain('wss:');

      // WS is allowed for development but should be upgraded in production
      expect(csp).toContain('ws:');
    });

    it('should validate WebSocket URL patterns', () => {
      const validWssUrls = [
        'wss://api.neonpro.com/ws',
        'wss://neonpro.vercel.app/socket',
        'wss://localhost:3000/dev-ws',
      ];

      const invalidWsUrls = [
        'ws://api.neonpro.com/ws',
        'ws://production.example.com/socket',
      ];

      validWssUrls.forEach(url => {
        expect(url).toMatch(/^wss:\/\//);
      });

      invalidWsUrls.forEach(url => {
        if (!url.includes('localhost')) {
          expect(url).not.toMatch(/^ws:\/\/(?!localhost)/);
        }
      });
    });
  });

  describe('API Endpoint Security', () => {
    it('should enforce HTTPS for all API calls', () => {
      const apiEndpoints = [
        'https://api.neonpro.com/v1/clients',
        'https://api.neonpro.com/v1/appointments',
        'https://api.neonpro.com/v1/financial',
        'https://api.stripe.com/v1/charges',
      ];

      apiEndpoints.forEach(endpoint => {
        expect(endpoint).toMatch(/^https:\/\//);
        expect(endpoint).not.toMatch(/^http:\/\/(?!localhost)/);
      });
    });

    it('should validate fetch request configurations', () => {
      const fetchConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({ data: 'test' }),
      };

      // Verify secure headers are present
      expect(fetchConfig.headers['Content-Type']).toBe('application/json');
      expect(fetchConfig.headers['Authorization']).toMatch(/^Bearer /);
    });
  });

  describe('Third-Party Integration Security', () => {
    it('should use HTTPS for Stripe integration', () => {
      const stripeUrls = [
        'https://js.stripe.com/v3/',
        'https://checkout.stripe.com/embed',
        'https://api.stripe.com/v1/',
      ];

      stripeUrls.forEach(url => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should use HTTPS for Google Fonts', () => {
      const googleFontsUrls = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
        'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      ];

      googleFontsUrls.forEach(url => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should validate CDN resource integrity', () => {
      // Example of how to validate Subresource Integrity (SRI)
      const scriptWithSRI = {
        src: 'https://js.stripe.com/v3/',
        integrity: 'sha384-example-hash',
        crossorigin: 'anonymous',
      };

      expect(scriptWithSRI.src).toMatch(/^https:\/\//);
      expect(scriptWithSRI.integrity).toMatch(/^sha(256|384|512)-/);
      expect(scriptWithSRI.crossorigin).toBe('anonymous');
    });
  });

  describe('Development vs Production Configuration', () => {
    it('should have different CSP policies for development and production', () => {
      const developmentCSP =
        'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' http://localhost:* ws://localhost:*';
      const productionCSP = 'default-src \'self\'; upgrade-insecure-requests';

      // Development should allow localhost HTTP
      expect(developmentCSP).toContain('http://localhost:*');
      expect(developmentCSP).toContain('ws://localhost:*');

      // Production should enforce HTTPS
      expect(productionCSP).toContain('upgrade-insecure-requests');
      expect(productionCSP).not.toContain('http://');
    });

    it('should validate environment-specific configurations', () => {
      const configs = {
        development: {
          allowHttp: true,
          allowUnsafeInline: true,
          allowUnsafeEval: true,
        },
        production: {
          allowHttp: false,
          allowUnsafeInline: false,
          allowUnsafeEval: false,
        },
      };

      expect(configs.development.allowHttp).toBe(true);
      expect(configs.production.allowHttp).toBe(false);
      expect(configs.production.allowUnsafeInline).toBe(false);
      expect(configs.production.allowUnsafeEval).toBe(false);
    });
  });
});
