#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix domain-errors.ts
const domainErrorsPath = '/home/vibecode/neonpro/packages/domain/src/errors/domain-errors.ts';
let content = fs.readFileSync(domainErrorsPath, 'utf8');

// Fix missing closing quotes in error codes
content = content.replace(/'([^']+),/g, "'$1',");

// Fix unterminated string literals in error codes
content = content.replace(/'([^']+_),\s*(\d+)/g, "'$1', $2");

// Fix other syntax issues
content = content.replace(/(\w+),\s*(\d+)\);/g, '$1\', $2);');

fs.writeFileSync(domainErrorsPath, content);
console.log('Fixed domain-errors.ts');

// Fix domain-events.ts
const domainEventsPath = '/home/vibecode/neonpro/packages/domain/src/events/domain-events.ts';
let eventsContent = fs.readFileSync(domainEventsPath, 'utf8');

// Fix unterminated template literals and string issues
eventsContent = eventsContent.replace(/`([^`]+)$/gm, '`$1`');
eventsContent = eventsContent.replace(/'([^']+)$/gm, '$1\'');

fs.writeFileSync(domainEventsPath, eventsContent);
console.log('Fixed domain-events.ts');

// Fix audit-service.ts
const auditPath = '/home/vibecode/neonpro/packages/domain/src/services/audit-service.ts';
let auditContent = fs.readFileSync(auditPath, 'utf8');

// Fix enum syntax issues
auditContent = auditContent.replace(/(\w+)\s*=\s*'([^']+)$/gm, '$1 = \'$2\';');

// Fix unterminated strings
auditContent = auditContent.replace(/'([^']+)$/gm, '$1\'');

fs.writeFileSync(auditPath, auditContent);
console.log('Fixed audit-service.ts');

// Fix consent-service.ts
const consentPath = '/home/vibecode/neonpro/packages/domain/src/services/consent-service.ts';
let consentContent = fs.readFileSync(consentPath, 'utf8');

// Fix unterminated template literals
consentContent = consentContent.replace(/`([^`]+)$/gm, '`$1`');

// Fix syntax issues
consentContent = consentContent.replace(/with\s*\(\s*([^)]+)\)/g, 'with($1)');

fs.writeFileSync(consentPath, consentContent);
console.log('Fixed consent-service.ts');

console.log('All domain syntax fixes completed');