/**
 * @fileoverview NeonPro Healthcare Database Seed
 * Healthcare-compliant seed data for development and testing
 *
 * @version 1.0.0
 * @author NeonPro Healthcare
 * @compliance LGPD + ANVISA + CFM
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default super admin profile for system setup
  const _superAdmin = await prisma.profile.upsert({
    where: { email: 'admin@neonpro.health' },
    update: {},
    create: {
      email: 'admin@neonpro.health',
      full_name: 'System Administrator',
      role: 'SUPER_ADMIN',
      department: 'System',
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // Create sample healthcare professionals with specialties
  const professionals = [
    {
      first_name: 'Dr. Ana',
      last_name: 'Silva',
      email: 'ana.silva@neonpro.health',
      phone: '+5511998877665',
      specialty: 'Dermatologia Estética',
      registration: { crm: '123456', estado: 'SP' },
    },
    {
      first_name: 'Dr. Carlos',
      last_name: 'Santos',
      email: 'carlos.santos@neonpro.health',
      phone: '+5511988776654',
      specialty: 'Harmonização Facial',
      registration: { crm: '789012', estado: 'SP' },
    },
  ];

  for (const professional of professionals) {
    await prisma.professional.upsert({
      where: { email: professional.email },
      update: {},
      create: professional,
    });
  }

  // Add sample service types (procedure categories)
  const serviceTypes = [
    {
      name: 'Toxina Botulínica',
      description: 'Aplicação de toxina botulínica para harmonização facial',
      duration_minutes: 60,
      price: 800,
      category: 'Injetáveis',
    },
    {
      name: 'Preenchimento com Ácido Hialurônico',
      description: 'Preenchimento facial com ácido hialurônico',
      duration_minutes: 90,
      price: 1200,
      category: 'Injetáveis',
    },
    {
      name: 'Laser Fracionado',
      description: 'Tratamento de rejuvenescimento com laser fracionado',
      duration_minutes: 45,
      price: 600,
      category: 'Laser',
    },
    {
      name: 'Radiofrequência Facial',
      description: 'Tratamento de flacidez com radiofrequência',
      duration_minutes: 60,
      price: 450,
      category: 'Radiofrequência',
    },
    {
      name: 'Peeling Químico',
      description: 'Peeling químico para renovação da pele',
      duration_minutes: 30,
      price: 300,
      category: 'Peeling',
    },
  ];

  for (const serviceType of serviceTypes) {
    const existingServiceType = await prisma.serviceType.findFirst({
      where: { name: serviceType.name },
    });

    if (!existingServiceType) {
      await prisma.serviceType.create({
        data: serviceType,
      });
    }
  }
}

main()
  .catch((_e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
