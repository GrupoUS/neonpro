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
  // Create default super admin user for system setup
  const _superAdmin = await prisma.user.upsert({
    where: { email: 'admin@neonpro.health' },
    update: {},
    create: {
      email: 'admin@neonpro.health',
      first_name: 'System',
      last_name: 'Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      cpf: '00000000000', // Test CPF
      phone: '+5511999999999',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // Add basic healthcare specialties
  const specialties = [
    {
      name: 'Dermatologia Estética',
      description: 'Tratamentos estéticos dermatológicos',
    },
    {
      name: 'Harmonização Facial',
      description: 'Procedimentos de harmonização facial',
    },
    { name: 'Tricologia', description: 'Tratamentos capilares especializados' },
    {
      name: 'Estética Corporal',
      description: 'Procedimentos estéticos corporais',
    },
  ];

  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: {},
      create: specialty,
    });
  }

  // Add sample procedure categories
  const categories = [
    {
      name: 'Injetáveis',
      description: 'Procedimentos com substâncias injetáveis',
    },
    { name: 'Laser', description: 'Tratamentos a laser' },
    { name: 'Radiofrequência', description: 'Tratamentos com radiofrequência' },
    { name: 'Peeling', description: 'Procedimentos de peeling' },
  ];

  for (const category of categories) {
    await prisma.procedureCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
}

main()
  .catch((_e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });