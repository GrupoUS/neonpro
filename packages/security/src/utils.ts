/**
 * Security utilities for NeonPro healthcare platform
 * Provides input sanitization, validation, and security helper functions
 * @version 1.0.0
 */

import { randomUUID } from 'crypto';

/**
 * Input sanitization utilities for preventing XSS and injection attacks
 */
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   * @param input The input string to sanitize
   * @returns Sanitized string
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return input
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize HTML content to prevent XSS
   * @param html The HTML content to sanitize
   * @returns Sanitized HTML string
   */
  static sanitizeHTML(html: string): string {
    if (typeof html !== 'string') {
      return '';
    }

    // Remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '');
  }

  /**
   * Validate and sanitize email addresses
   * @param email The email to validate
   * @returns Sanitized email or empty string if invalid
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '';
    }

    return email.toLowerCase().trim();
  }

  /**
   * Sanitize phone numbers (Brazilian format)
   * @param phone The phone number to sanitize
   * @returns Sanitized phone number
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Validate Brazilian phone number length
    if (digitsOnly.length === 10 || digitsOnly.length === 11) {
      return digitsOnly;
    }
    
    return '';
  }

  /**
   * Sanitize CPF (Brazilian tax ID)
   * @param cpf The CPF to sanitize
   * @returns Sanitized CPF or empty string if invalid
   */
  static sanitizeCPF(cpf: string): string {
    if (typeof cpf !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    const digitsOnly = cpf.replace(/\D/g, '');
    
    // Validate CPF length
    if (digitsOnly.length !== 11) {
      return '';
    }
    
    return digitsOnly;
  }

  /**
   * Validate CPF using the official algorithm
   * @param cpf The CPF to validate
   * @returns True if CPF is valid
   */
  static validateCPF(cpf: string): boolean {
    const sanitized = this.sanitizeCPF(cpf);
    if (!sanitized) {
      return false;
    }

    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(sanitized)) {
      return false;
    }

    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(sanitized[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    const digit1 = remainder === 10 ? 0 : remainder;

    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(sanitized[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    const digit2 = remainder === 10 ? 0 : remainder;

    // Check if verification digits match
    return (
      parseInt(sanitized[9]) === digit1 &&
      parseInt(sanitized[10]) === digit2
    );
  }

