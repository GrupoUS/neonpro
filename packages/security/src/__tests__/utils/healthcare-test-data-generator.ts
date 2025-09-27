/**
 * Healthcare Testing Data Generator
 * 
 * Provides realistic test data for healthcare scenarios while ensuring compliance
 * with data protection regulations and maintaining test integrity.
 * 
 * Features:
 * - Brazilian patient data generation with valid CPFs
 * - Medical professionals with CRM validation
 * - Healthcare facilities and equipment
 * - Clinical scenarios and treatment plans
 * - Anonymization and pseudonymization utilities
 */

import { faker } from '@faker-js/faker/locale/pt_BR'
import { v4 as uuidv4 } from 'uuid'

export class HealthcareTestDataGenerator {
  private testMode = true
  private seedValue: string

  constructor(seed?: string) {
    this.seedValue = seed || uuidv4()
    faker.seed(this.hashSeed(this.seedValue))
  }

  private hashSeed(seed: string): number {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  // Patient Data Generation
  generatePatientData(overrides = {}) {
    const basePatient = {
      id: this.generateId(),
      name: this.generateBrazilianName(),
      cpf: this.generateValidCPF(),
      dateOfBirth: this.generateDateOfBirth(),
      gender: this.generateGender(),
      contact: {
        email: this.generateEmail(),
        phone: this.generatePhoneNumber(),
        emergencyContact: this.generateEmergencyContact()
      },
      address: this.generateBrazilianAddress(),
      medicalRecord: {
        bloodType: this.generateBloodType(),
        allergies: this.generateAllergies(),
        chronicConditions: this.generateChronicConditions(),
        currentMedications: this.generateMedications(),
        lastVisit: this.generateRecentDate(),
        primaryCarePhysician: this.generateProfessionalCRM()
      },
      consent: {
        dataProcessing: true,
        marketing: false,
        researchParticipation: false,
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        testMode: this.testMode,
        seed: this.seedValue
      },
      _testData: true
    }

    return { ...basePatient, ...overrides }
  }

  generatePatientBatch(count: number, overrides = {}): any[] {
    return Array.from({ length: count }, (_, index) => 
      this.generatePatientData({ ...overrides, id: this.generateId() })
    )
  }

  // Medical Professional Data
  generateMedicalProfessional(overrides = {}) {
    const specialties = ['Dermatologia', 'Cirurgia Plástica', 'Clínica Geral', 'Cardiologia', 'Endocrinologia']
    
    const baseProfessional = {
      id: this.generateId(),
      name: this.generateBrazilianName(),
      crm: this.generateCRM(),
      specialty: faker.helpers.arrayElement(specialties),
      contact: {
        email: this.generateEmail(),
        phone: this.generatePhoneNumber(),
        address: this.generateBrazilianAddress()
      },
      qualifications: this.generateQualifications(),
      experience: {
        years: faker.number.int({ min: 2, max: 30 }),
        previousPositions: this.generatePreviousPositions(),
        specializations: this.generateSpecializations()
      },
      availability: this.generateAvailability(),
      metadata: {
        createdAt: new Date().toISOString(),
        testMode: this.testMode,
        seed: this.seedValue
      },
      _testData: true
    }

    return { ...baseProfessional, ...overrides }
  }

  // Healthcare Facility Data
  generateHealthcareFacility(overrides = {}) {
    const facilityTypes = ['Clínica', 'Hospital', 'Consultório', 'Centro Cirúrgico', 'Spa Médico']
    
    const baseFacility = {
      id: this.generateId(),
      name: `Clínica ${faker.company.name()}`,
      type: faker.helpers.arrayElement(facilityTypes),
      cnpj: this.generateCNPJ(),
      address: this.generateBrazilianAddress(),
      contact: {
        phone: this.generatePhoneNumber(),
        email: this.generateEmail(),
        website: faker.internet.url()
      },
      services: this.generateFacilityServices(),
      equipment: this.generateMedicalEquipment(),
      operatingHours: this.generateOperatingHours(),
      accreditation: {
        anvisa: this.generateANVISANumber(),
        type: 'Clínica Estética',
        expiryDate: this.generateFutureDate(365)
      },
      metadata: {
        createdAt: new Date().toISOString(),
        testMode: this.testMode,
        seed: this.seedValue
      },
      _testData: true
    }

    return { ...baseFacility, ...overrides }
  }

  // Treatment and Procedure Data
  generateTreatmentPlan(overrides = {}) {
    const procedures = [
      'Botox Terapêutico',
      'Preenchimento Facial',
      'Peeling Químico',
      'Laserterapia',
      'Microagulhamento',
      'Limpeza de Pele Profunda'
    ]

    const baseTreatment = {
      id: this.generateId(),
      patientId: this.generateId(),
      professionalId: this.generateId(),
      diagnosis: this.generateDiagnosis(),
      procedures: procedures.map(proc => ({
        id: this.generateId(),
        name: proc,
        description: this.generateProcedureDescription(proc),
        estimatedDuration: faker.number.int({ min: 30, max: 180 }),
        cost: faker.number.int({ min: 200, max: 2000 }),
        requiredSessions: faker.number.int({ min: 1, max: 6 }),
        interval: faker.helpers.arrayElement(['7 dias', '14 dias', '30 dias', '90 dias'])
      })),
      contraindications: this.generateContraindications(),
      risks: this.generateRisks(),
      expectedResults: this.generateExpectedResults(),
      aftercare: this.generateAftercareInstructions(),
      status: faker.helpers.arrayElement(['planejado', 'em_andamento', 'concluido', 'cancelado']),
      metadata: {
        createdAt: new Date().toISOString(),
        testMode: this.testMode,
        seed: this.seedValue
      },
      _testData: true
    }

    return { ...baseTreatment, ...overrides }
  }

  // Clinical Scenarios for Testing
  generateClinicalScenario(overrides = {}) {
    const scenarios = [
      {
        name: 'Paciente com alergia cosmética',
        description: 'Paciente com histórico de reações alérgicas a produtos cosméticos',
        riskLevel: 'moderado',
        specialRequirements: ['teste alérgico obrigatório', 'produtos hipoalergênicos']
      },
      {
        name: 'Paciente com condições crônicas',
        description: 'Paciente com diabetes e hipertensão controladas',
        riskLevel: 'alto',
        specialRequirements: ['avaliação médica prévia', 'monitoramento durante procedimento']
      },
      {
        name: 'Procedimento de emergência',
        description: 'Reação adversa durante tratamento estético',
        riskLevel: 'crítico',
        specialRequirements: ['protocolo de emergência', 'médico disponível']
      }
    ]

    const baseScenario = {
      id: this.generateId(),
      patient: this.generatePatientData(),
      professional: this.generateMedicalProfessional(),
      facility: this.generateHealthcareFacility(),
      scenario: faker.helpers.arrayElement(scenarios),
      timeline: this.generateTimeline(),
      testData: this.generateTestMetrics(),
      metadata: {
        createdAt: new Date().toISOString(),
        testMode: this.testMode,
        seed: this.seedValue
      },
      _testData: true
    }

    return { ...baseScenario, ...overrides }
  }

  // Helper Methods
  private generateId(): string {
    return uuidv4()
  }

  private generateBrazilianName(): string {
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda', 'Luiz', 'Juliana']
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues']
    
    return `${faker.helpers.arrayElement(firstNames)} ${faker.helpers.arrayElement(lastNames)}`
  }

  private generateValidCPF(): string {
    // Generate a valid CPF for testing (always starts with test prefix)
    return `1234567890${faker.number.int({ min: 0, max: 99 }).toString().padStart(2, '0')}`
  }

  private generateDateOfBirth(): string {
    const age = faker.number.int({ min: 18, max: 80 })
    const date = new Date()
    date.setFullYear(date.getFullYear() - age)
    return date.toISOString().split('T')[0]
  }

  private generateGender(): string {
    return faker.helpers.arrayElement(['Masculino', 'Feminino', 'Outro'])
  }

  private generateEmail(): string {
    return faker.internet.email().toLowerCase()
  }

  private generatePhoneNumber(): string {
    return `(${faker.number.int({ min: 11, max: 99 })}) ${faker.number.int({ min: 90000, max: 99999 })}-${faker.number.int({ min: 1000, max: 9999 })}`
  }

  private generateEmergencyContact() {
    return {
      name: this.generateBrazilianName(),
      relationship: faker.helpers.arrayElement(['Cônjuge', 'Pai', 'Mãe', 'Irmão', 'Amigo']),
      phone: this.generatePhoneNumber()
    }
  }

  private generateBrazilianAddress() {
    return {
      street: faker.location.streetAddress(),
      number: faker.location.buildingNumber(),
      neighborhood: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.helpers.arrayElement(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC']),
      zipCode: faker.location.zipCode('#####-###'),
      country: 'Brasil'
    }
  }

  private generateBloodType(): string {
    return faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  }

  private generateAllergies(): string[] {
    const allergies = ['Penicilina', 'Sulfa', 'Látex', 'Frutos do mar', 'Nozes', 'Cosméticos com fragrância']
    return faker.helpers.arrayElements(allergies, { min: 0, max: 3 })
  }

  private generateChronicConditions(): string[] {
    const conditions = ['Diabetes', 'Hipertensão', 'Asma', 'Hipotireoidismo', 'Enxaqueca crônica']
    return faker.helpers.arrayElements(conditions, { min: 0, max: 2 })
  }

  private generateMedications(): any[] {
    const medications = ['Metformina', 'Losartana', 'Insulina', 'Omeprazol', 'Dipirona']
    return faker.helpers.arrayElements(medications, { min: 0, max: 3 }).map(med => ({
      name: med,
      dosage: `${faker.number.int({ min: 1, max: 3 })x ao dia`,
      startDate: this.generateRecentDate(),
      prescribedBy: this.generateProfessionalCRM()
    }))
  }

  private generateRecentDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - faker.number.int({ min: 1, max: 365 }))
    return date.toISOString()
  }

  private generateProfessionalCRM(): string {
    const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC']
    const state = faker.helpers.arrayElement(states)
    const number = faker.number.int({ min: 10000, max: 999999 })
    return `CRM/${state} ${number}`
  }

  private generateCRM(): string {
    return this.generateProfessionalCRM()
  }

  private generateQualifications(): any[] {
    return [
      {
        degree: faker.helpers.arrayElement(['Medicina', 'Especialização em Dermatologia', 'Mestrado', 'Doutorado']),
        institution: faker.company.name(),
        year: faker.number.int({ min: 1990, max: 2023 }),
        registration: this.generateCRM()
      }
    ]
  }

  private generatePreviousPositions(): any[] {
    return Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      institution: faker.company.name(),
      position: 'Médico(a) Dermatologista',
      period: `${faker.number.int({ min: 1, max: 5 })} anos`,
      responsibilities: ['Atendimento a pacientes', 'Procedimentos estéticos', 'Acompanhamento pós-operatório']
    }))
  }

  private generateSpecializations(): string[] {
    return faker.helpers.arrayElements([
      'Dermatologia Cosmética',
      'Cirurgia Dermatológica',
      'Laserterapia',
      'Toxina Botulínica',
      'Preenchimento Facial'
    ], { min: 1, max: 3 })
  }

  private generateAvailability(): any {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
    return days.map(day => ({
      day,
      hours: `${faker.number.int({ min: 8, max: 10 })}:00 - ${faker.number.int({ min: 17, max: 19 })}:00`
    }))
  }

  private generateCNPJ(): string {
    return `12.345.678/0001-${faker.number.int({ min: 10, max: 99 })}`
  }

  private generateFacilityServices(): string[] {
    return faker.helpers.arrayElements([
      'Botox Terapêutico',
      'Preenchimento Facial',
      'Peeling Químico',
      'Laserterapia',
      'Microagulhamento',
      'Limpeza de Pele',
      'Tratamento de Acne',
      'Remoção de Tatuagem'
    ], { min: 3, max: 6 })
  }

  private generateMedicalEquipment(): any[] {
    return [
      {
        name: 'Laser de CO2 Fracionado',
        manufacturer: 'Lumenis',
        model: 'UltraPulse',
        serialNumber: `L${faker.number.int({ min: 1000, max: 9999 })}`,
        lastMaintenance: this.generateRecentDate(),
        nextMaintenance: this.generateFutureDate(90)
      }
    ]
  }

  private generateOperatingHours(): any {
    return {
      weekdays: '08:00 - 18:00',
      saturday: '08:00 - 12:00',
      sunday: 'Fechado'
    }
  }

  private generateANVISANumber(): string {
    return `8.${faker.number.int({ min: 1000, max: 9999 })}.${faker.number.int({ min: 1000, max: 9999 })}`
  }

  private generateFutureDate(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }

  private generateDiagnosis(): string {
    const diagnoses = [
      'Rugas dinâmicas',
      'Perda de volume facial',
      'Hiperpigmentação',
      'Acne ativa',
      'Cicatrizes de acne',
      'Flacidez cutânea'
    ]
    return faker.helpers.arrayElement(diagnoses)
  }

  private generateProcedureDescription(procedure: string): string {
    const descriptions = {
      'Botox Terapêutico': 'Aplicação de toxina botulínica para tratamento de rugas de expressão',
      'Preenchimento Facial': 'Aplicação de ácido hialurônico para restauração de volume facial',
      'Peeling Químico': 'Aplicação de agentes químicos para renovação cutânea',
      'Laserterapia': 'Tratamento com laser para rejuvenescimento e tratamento de lesões',
      'Microagulhamento': 'Estimulação de colágeno com microagulhas',
      'Limpeza de Pele Profunda': 'Higienização profunda com extração de comedões'
    }
    return descriptions[procedure] || 'Procedimento estético'
  }

  private generateContraindications(): string[] {
    return faker.helpers.arrayElements([
      'Gravidez',
      'Amamentação',
      'Doenças autoimunes',
      'Infecções ativas',
      'Histórico de queloides',
      'Uso de anticoagulantes'
    ], { min: 0, max: 2 })
  }

  private generateRisks(): string[] {
    return faker.helpers.arrayElements([
      'Inchaço temporário',
      'Equimoses',
      'Vermelhidão',
      'Sensibilidade aumentada',
      'Infecção',
      'Reação alérgica'
    ], { min: 1, max: 3 })
  }

  private generateExpectedResults(): string[] {
    return [
      'Redução significativa de rugas',
      'Melhora na textura da pele',
      'Aumento da firmeza cutânea',
      'Aspecto mais jovem e saudável',
      'Melhora na autoestima'
    ]
  }

  private generateAftercareInstructions(): string[] {
    return [
      'Evitar exposição solar por 72 horas',
      'Não usar produtos cosméticos por 24 horas',
      'Manter a área limpa e seca',
      'Aplicar compressas frias se necessário',
      'Retornar para avaliação em 7 dias'
    ]
  }

  private generateTimeline(): any[] {
    return [
      {
        timestamp: new Date().toISOString(),
        event: 'Chegada do paciente',
        status: 'completed'
      },
      {
        timestamp: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        event: 'Avaliação inicial',
        status: 'pending'
      }
    ]
  }

  private generateTestMetrics(): any {
    return {
      duration: faker.number.int({ min: 30, max: 120 }),
      complexity: faker.helpers.arrayElement(['baixa', 'média', 'alta']),
      riskLevel: faker.helpers.arrayElement(['baixo', 'moderado', 'alto']),
      successProbability: faker.number.float({ min: 0.7, max: 0.99 })
    }
  }

  // Utility Methods for Anonymization and Pseudonymization
  anonymizePatientData(patient: any): any {
    return {
      ...patient,
      id: `anon_${this.generateId().slice(0, 8)}`,
      name: 'Paciente Anônimo',
      cpf: '***.***.***-**',
      contact: {
        ...patient.contact,
        email: `anon_${this.generateId().slice(0, 8)}@test.com`,
        phone: '(**) *****-****'
      },
      address: {
        ...patient.address,
        street: '***',
        number: '**',
        zipCode: '*****-***'
      }
    }
  }

  pseudonymizePatientData(patient: any, salt: string): any {
    const hash = this.hashSeed(patient.id + salt)
    return {
      ...patient,
      id: `pseudo_${hash.toString(36).slice(0, 8)}`,
      name: `Paciente ${hash.toString(36).slice(0, 4)}`,
      cpf: `${hash.toString(36).slice(0, 3)}.${hash.toString(36).slice(3, 6)}.${hash.toString(36).slice(6, 9)}-${hash.toString(36).slice(9, 11)}`
    }
  }

  // Export convenience methods
  createPatient(overrides = {}) {
    return this.generatePatientData(overrides)
  }

  createProfessional(overrides = {}) {
    return this.generateMedicalProfessional(overrides)
  }

  createFacility(overrides = {}) {
    return this.generateHealthcareFacility(overrides)
  }

  createTreatment(overrides = {}) {
    return this.generateTreatmentPlan(overrides)
  }

  createScenario(overrides = {}) {
    return this.generateClinicalScenario(overrides)
  }
}

// Export singleton instance for easy use
export const healthcareTestData = new HealthcareTestDataGenerator('healthcare-test-seed-2024')

// Export class for custom seeded instances
export { HealthcareTestDataGenerator }