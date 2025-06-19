#!/usr/bin/env node

/**
 * NEONPRO - Generate Secrets for Production
 * Generates secure secrets for deployment
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateNextAuthSecret() {
  return crypto.randomBytes(32).toString('base64');
}

console.log('🔐 NEONPRO - Secrets Generator');
console.log('================================\n');

console.log('📋 Copy these values to your Vercel Environment Variables:\n');

console.log('NEXTAUTH_SECRET=');
console.log(generateNextAuthSecret());
console.log('');

console.log('# Additional secure secrets if needed:');
console.log('APP_SECRET=');
console.log(generateSecret(32));
console.log('');

console.log('JWT_SECRET=');
console.log(generateSecret(64));
console.log('');

console.log('ENCRYPTION_KEY=');
console.log(generateSecret(32));
console.log('');

console.log('🔒 Keep these secrets secure and never commit them to version control!');
console.log('📝 Add them directly in Vercel Dashboard > Project Settings > Environment Variables');
