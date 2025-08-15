import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar tenants de exemplo
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'clinica-bella-vita' },
    update: {},
    create: {
      name: 'Clínica Bella Vita',
      slug: 'clinica-bella-vita',
      description:
        'Clínica de estética avançada especializada em tratamentos faciais e corporais',
      logo_url: 'https://via.placeholder.com/200x200?text=Bella+Vita',
      website_url: 'https://clinicabellavita.com.br',
      contact_email: 'contato@bellavita.com.br',
      contact_phone: '(11) 99999-9999',
      subscription_plan: 'PRO',
      subscription_status: 'ACTIVE',
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'estetica-premium' },
    update: {},
    create: {
      name: 'Estética Premium',
      slug: 'estetica-premium',
      description:
        'Centro de estética com tecnologia de ponta para rejuvenescimento',
      logo_url: 'https://via.placeholder.com/200x200?text=Premium',
      website_url: 'https://esteticapremium.com.br',
      contact_email: 'info@premium.com.br',
      contact_phone: '(11) 88888-8888',
      subscription_plan: 'ENTERPRISE',
      subscription_status: 'ACTIVE',
    },
  });

  const tenant3 = await prisma.tenant.upsert({
    where: { slug: 'spa-harmonia' },
    update: {},
    create: {
      name: 'Spa Harmonia',
      slug: 'spa-harmonia',
      description: 'Spa completo com tratamentos relaxantes e terapêuticos',
      logo_url: 'https://via.placeholder.com/200x200?text=Harmonia',
      website_url: 'https://spaharmonia.com.br',
      contact_email: 'contato@harmonia.com.br',
      contact_phone: '(11) 77777-7777',
      subscription_plan: 'BASIC',
      subscription_status: 'ACTIVE',
    },
  });

  // Criar produtos de exemplo para cada tenant
  await prisma.product.createMany({
    data: [
      // Produtos Bella Vita
      {
        name: 'Limpeza de Pele Profunda',
        description:
          'Tratamento completo de limpeza facial com extração e hidratação',
        price: 150.0,
        tenant_id: tenant1.id,
      },
      {
        name: 'Peeling Químico',
        description:
          'Renovação celular com ácidos para rejuvenescimento facial',
        price: 280.0,
        tenant_id: tenant1.id,
      },
      {
        name: 'Botox',
        description: 'Aplicação de toxina botulínica para redução de rugas',
        price: 800.0,
        tenant_id: tenant1.id,
      },
      // Produtos Premium
      {
        name: 'Laser CO2 Fracionado',
        description: 'Tratamento a laser para rejuvenescimento e cicatrizes',
        price: 1200.0,
        tenant_id: tenant2.id,
      },
      {
        name: 'Preenchimento com Ácido Hialurônico',
        description: 'Preenchimento facial para volume e hidratação',
        price: 900.0,
        tenant_id: tenant2.id,
      },
      {
        name: 'Criolipólise',
        description: 'Redução de gordura localizada sem cirurgia',
        price: 600.0,
        tenant_id: tenant2.id,
      },
      // Produtos Harmonia
      {
        name: 'Massagem Relaxante',
        description: 'Massagem corporal completa para relaxamento',
        price: 120.0,
        tenant_id: tenant3.id,
      },
      {
        name: 'Drenagem Linfática',
        description: 'Massagem terapêutica para redução de inchaço',
        price: 100.0,
        tenant_id: tenant3.id,
      },
      {
        name: 'Aromaterapia',
        description: 'Sessão de relaxamento com óleos essenciais',
        price: 80.0,
        tenant_id: tenant3.id,
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(
    `📊 Criados: ${await prisma.tenant.count()} tenants e ${await prisma.product.count()} produtos`
  );
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
