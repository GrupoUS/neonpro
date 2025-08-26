/**
 * @fileoverview NeonPro Healthcare Database Seed
 * Healthcare-compliant seed data for development and testing
 *
 * @version 1.0.0
 * @author NeonPro Healthcare
 * @compliance LGPD + ANVISA + CFM
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default super admin user for system setup
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@neonpro.health" },
    update: {},
    create: {
      email: "admin@neonpro.health",
      first_name: "System",
      last_name: "Administrator",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      email_verified: true,
      is_verified: true,
      lgpd_consent_date: new Date(),
      lgpd_consent_version: "1.0",
    },
  });

  // Create sample healthcare professionals
  const doctorAna = await prisma.user.upsert({
    where: { email: "ana.silva@neonpro.health" },
    update: {},
    create: {
      email: "ana.silva@neonpro.health",
      first_name: "Ana",
      last_name: "Silva",
      phone: "+5511998877665",
      role: "DOCTOR",
      status: "ACTIVE",
      email_verified: true,
      is_verified: true,
      specialty: "Dermatologia Estética",
      professional_id: "CRM123456SP",
      license_number: "123456",
      lgpd_consent_date: new Date(),
      lgpd_consent_version: "1.0",
    },
  });

  const doctorCarlos = await prisma.user.upsert({
    where: { email: "carlos.santos@neonpro.health" },
    update: {},
    create: {
      email: "carlos.santos@neonpro.health",
      first_name: "Carlos",
      last_name: "Santos",
      phone: "+5511988776654",
      role: "DOCTOR",
      status: "ACTIVE",
      email_verified: true,
      is_verified: true,
      specialty: "Harmonização Facial",
      professional_id: "CRM789012SP",
      license_number: "789012",
      lgpd_consent_date: new Date(),
      lgpd_consent_version: "1.0",
    },
  });

  // Create healthcare provider profiles for the doctors
  await prisma.healthcareProvider.upsert({
    where: { user_id: doctorAna.id },
    update: {},
    create: {
      user_id: doctorAna.id,
      provider_type: "DOCTOR",
      specialization: ["Dermatologia Estética"],
      license_state: "SP",
      board_certified: true,
      consultation_duration: 60,
    },
  });

  await prisma.healthcareProvider.upsert({
    where: { user_id: doctorCarlos.id },
    update: {},
    create: {
      user_id: doctorCarlos.id,
      provider_type: "DOCTOR",
      specialization: ["Harmonização Facial"],
      license_state: "SP",
      board_certified: true,
      consultation_duration: 90,
    },
  });

  // Add sample specialties
  const specialties = [
    "Dermatologia Estética",
    "Harmonização Facial",
    "Medicina Estética",
    "Cirurgia Plástica",
    "Dermatologia Clínica",
  ];

  for (const specialtyName of specialties) {
    await prisma.specialty.upsert({
      where: { name: specialtyName },
      update: {},
      create: {
        name: specialtyName,
        description: `Especialidade médica: ${specialtyName}`,
      },
    });
  }

  // Add sample procedure categories
  const procedureCategories = [
    {
      name: "Injetáveis",
      description: "Procedimentos com aplicação de injetáveis",
    },
    { name: "Laser", description: "Tratamentos com tecnologia laser" },
    {
      name: "Radiofrequência",
      description: "Procedimentos com radiofrequência",
    },
    { name: "Peeling", description: "Tratamentos de renovação da pele" },
    { name: "Cirúrgicos", description: "Procedimentos cirúrgicos estéticos" },
  ];

  for (const category of procedureCategories) {
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
