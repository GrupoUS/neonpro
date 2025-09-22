import { describe, test } from 'vitest';
import { TempPatientDocumentService } from '../services/temp-patient-document-service';

describe('Temp Service Test',() => {
  test('should have getDocument method',() => {
<<<<<<< HEAD
    const service = new TempPatientDocumentService(
=======
    const service = new TempPatientDocumentService();
>>>>>>> origin/main
    console.log(
      'Temp service methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
    
    console.log('Has getDocument?', typeof service.getDocument === 'function')
    console.log(
      'Has getFileContent?',
      typeof service.getFileContent === 'function',
    
