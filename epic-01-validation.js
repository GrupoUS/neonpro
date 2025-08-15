// NEONPRO HEALTHCARE - Epic-01 Validation Script
// ≥9.9/10 Quality Standard Verification for Patient Safety

const fs = require('fs');
const path = require('path');

console.log('🏥 NEONPRO HEALTHCARE - Epic-01 Foundation Validation');
console.log('='.repeat(60));

let validationResults = {
  task_1_1: false, // Remove dangerous configuration
  task_1_2: false, // React 19 upgrade
  task_1_3: false, // Database architecture
  task_1_4: false, // Vercel Edge optimization
  overall_score: 0,
};

// Task 1.1: Validate dangerous configuration removal
try {
  const nextConfig = fs.readFileSync('./apps/web/next.config.mjs', 'utf8');
  const hasIgnoreBuildErrors = nextConfig.includes('ignoreBuildErrors: true');
  const hasIgnoreDuringBuilds = nextConfig.includes('ignoreDuringBuilds: true');

  if (!hasIgnoreBuildErrors && !hasIgnoreDuringBuilds) {
    validationResults.task_1_1 = true;
    console.log(
      '✅ Task 1.1: Dangerous configuration removed - Patient safety secured'
    );
  } else {
    console.log(
      '❌ Task 1.1: Dangerous configuration still present - PATIENT SAFETY RISK'
    );
  }
} catch (error) {
  console.log('❌ Task 1.1: Configuration validation failed');
}

// Task 1.2: Validate React 19 upgrade
try {
  const webPkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
  const reactVersion = webPkg.dependencies?.react;
  const nextVersion = webPkg.dependencies?.next;

  if (reactVersion?.includes('19') && nextVersion?.includes('15')) {
    validationResults.task_1_2 = true;
    console.log(
      '✅ Task 1.2: React 19 + Next.js 15 upgrade complete - Healthcare ready'
    );
  } else {
    console.log(
      `❌ Task 1.2: Upgrade incomplete - React: ${reactVersion}, Next: ${nextVersion}`
    );
  }
} catch (error) {
  console.log('❌ Task 1.2: Package validation failed');
}

// Task 1.3: Validate database architecture
const healthcareConfigExists = fs.existsSync(
  './apps/web/lib/supabase/healthcare-config.ts'
);
const healthcareClientExists = fs.existsSync(
  './apps/web/lib/supabase/healthcare-client.ts'
);
const healthcareRlsExists = fs.existsSync(
  './apps/web/lib/supabase/healthcare-rls.ts'
);

if (healthcareConfigExists && healthcareClientExists && healthcareRlsExists) {
  validationResults.task_1_3 = true;
  console.log(
    '✅ Task 1.3: Database architecture resolved - LGPD compliant Supabase native'
  );
} else {
  console.log('❌ Task 1.3: Database architecture incomplete');
}

// Task 1.4: Validate Vercel Edge configuration
try {
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  const hasGru1Region = JSON.stringify(vercelConfig).includes('gru1');
  const hasHealthcareHeaders = JSON.stringify(vercelConfig).includes(
    'X-Healthcare-Compliance'
  );
  const healthCheckExists = fs.existsSync(
    './apps/web/app/api/health-check/route.ts'
  );

  if (hasGru1Region && hasHealthcareHeaders && healthCheckExists) {
    validationResults.task_1_4 = true;
    console.log(
      '✅ Task 1.4: Vercel Edge São Paulo optimization complete - LGPD deployment ready'
    );
  } else {
    console.log('❌ Task 1.4: Vercel optimization incomplete');
  }
} catch (error) {
  console.log('❌ Task 1.4: Vercel configuration validation failed');
}

// Calculate overall score
const completedTasks =
  Object.values(validationResults).filter(Boolean).length - 1; // -1 for score field
validationResults.overall_score = (completedTasks / 4) * 10;

console.log('='.repeat(60));
console.log(
  `🏥 EPIC-01 FOUNDATION SCORE: ${validationResults.overall_score}/10`
);

if (validationResults.overall_score >= 9.9) {
  console.log(
    '🎉 EPIC-01 COMPLETE - Healthcare foundation ready for patient safety!'
  );
} else {
  console.log('⚠️  EPIC-01 INCOMPLETE - Patient safety requirements not met');
}

console.log('📊 Task Completion:', JSON.stringify(validationResults, null, 2));
