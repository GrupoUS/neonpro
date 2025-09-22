/**
 * Security Headers Test Suite
 * Tests for enhanced security headers middleware including HSTS and CSP
 *
 * @version 1.0.0
 * @compliance LGPD, OWASP
 * @healthcare-platform NeonPro
 */

import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  healthcareSecurityHeadersMiddleware,
  securityHeadersMiddleware,
} from '../../middleware/security-headers';

<<<<<<< HEAD
describe('Security Headers Middleware',() => {
=======
describe(_'Security Headers Middleware',() => {
>>>>>>> origin/main
  let app: Hono;

  beforeEach(() => {
    app = new Hono(

<<<<<<< HEAD
  describe('Basic Security Headers',() => {
    it('should apply basic security headers',async () => {
      app.use('*', securityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
  describe(_'Basic Security Headers',() => {
    it(_'should apply basic security headers',async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin',
      
      expect(response.headers.get('X-Request-ID')).toBeDefined(

<<<<<<< HEAD
    it('should apply healthcare compliance headers',async () => {
      app.use('*', healthcareSecurityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
    it(_'should apply healthcare compliance headers',async () => {
      app.use('*', healthcareSecurityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      expect(response.headers.get('X-Healthcare-Compliance')).toBe(
        'LGPD,ANVISA,CFM',
      
      expect(response.headers.get('X-Data-Classification')).toBe(
        'HIGHLY_RESTRICTED',
      
      expect(response.headers.get('X-Audit-Trail')).toBe('enabled')
      expect(response.headers.get('X-Encryption-Status')).toBe('enabled')

<<<<<<< HEAD
    it('should apply HSTS in production environment',async () => {
=======
    it(_'should apply HSTS in production environment',async () => {
>>>>>>> origin/main
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.use('*', healthcareSecurityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })

      const response = await app.request('/test')

      const hstsHeader = response.headers.get('Strict-Transport-Security')
      expect(hstsHeader).toBeDefined(
      expect(hstsHeader).toContain('max-age=')
      expect(hstsHeader).toContain('includeSubDomains')

      process.env.NODE_ENV = originalEnv;

<<<<<<< HEAD
    it('should not apply HSTS in development environment',async () => {
=======
    it(_'should not apply HSTS in development environment',async () => {
>>>>>>> origin/main
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.use('*', healthcareSecurityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })

      const response = await app.request('/test')

      const hstsHeader = response.headers.get('Strict-Transport-Security')
      expect(hstsHeader).toBeNull(

      process.env.NODE_ENV = originalEnv;

<<<<<<< HEAD
  describe('Cross-Origin Security Headers',() => {
    it('should apply Cross-Origin Embedder Policy',async () => {
      app.use('*', securityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
  describe(_'Cross-Origin Security Headers',() => {
    it(_'should apply Cross-Origin Embedder Policy',async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe(
        'require-corp',
      

<<<<<<< HEAD
    it('should apply Cross-Origin Opener Policy',async () => {
      app.use('*', securityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
    it(_'should apply Cross-Origin Opener Policy',async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(
        'same-origin',
      

<<<<<<< HEAD
    it('should apply Cross-Origin Resource Policy',async () => {
      app.use('*', securityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
    it(_'should apply Cross-Origin Resource Policy',async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe(
        'same-origin',
      

<<<<<<< HEAD
  describe('Permissions Policy',() => {
    it('should apply restrictive permissions policy',async () => {
      app.use('*', securityHeadersMiddleware()
      app.get('/test', c => c.json({ message: 'test' })
=======
  describe(_'Permissions Policy',() => {
    it(_'should apply restrictive permissions policy',async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));
>>>>>>> origin/main

      const response = await app.request('/test')

      const permissionsPolicy = response.headers.get('Permissions-Policy')
      expect(permissionsPolicy).toBeDefined(
      expect(permissionsPolicy).toContain('camera=()')
      expect(permissionsPolicy).toContain('microphone=()')
      expect(permissionsPolicy).toContain('geolocation=()')
      expect(permissionsPolicy).toContain('payment=()')

<<<<<<< HEAD
  describe('Security Context',() => {
    it('should add security context to request',async () => {
=======
  describe(_'Security Context',() => {
    it(_'should add security context to request',async () => {
>>>>>>> origin/main
      let capturedContext: any;

      app.use('*', securityHeadersMiddleware()
      app.use('*', (c, next) => {
        capturedContext = c.get('securityHeaders')
        return next(
      app.get('/test', c => c.json({ message: 'test' })

      await app.request('/test')

      expect(capturedContext).toBeDefined(
      expect(capturedContext.requestId).toBeDefined(
      expect(capturedContext.timestamp).toBeDefined(
      expect(capturedContext.headersApplied).toBeDefined(
      expect(Array.isArray(capturedContext.headersApplied)).toBe(true);
