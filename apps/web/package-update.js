// Healthcare Critical: React 19 + Next.js 15 Upgrade for Patient Safety
const fs = require('fs');
const path = require('path');

const packagePath = './package.json';

try {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  console.log('🏥 NEONPRO HEALTHCARE: Current versions:');
  console.log('React:', pkg.dependencies?.react);
  console.log('React-DOM:', pkg.dependencies?.['react-dom']);
  console.log('Next.js:', pkg.dependencies?.next);
  console.log('Types React:', pkg.devDependencies?.['@types/react']);
  console.log('Types React-DOM:', pkg.devDependencies?.['@types/react-dom']);

  // Healthcare Critical Updates for Patient Safety
  if (pkg.dependencies) {
    if (pkg.dependencies.react) {
      pkg.dependencies.react = '^19.0.0';
      console.log('✅ Updated React to 19.0.0 for healthcare error boundaries');
    }
    if (pkg.dependencies['react-dom']) {
      pkg.dependencies['react-dom'] = '^19.0.0';
      console.log('✅ Updated React-DOM to 19.0.0 for medical workflows');
    }
    if (pkg.dependencies.next) {
      pkg.dependencies.next = '^15.0.0';
      console.log(
        '✅ Updated Next.js to 15.0.0 for healthcare server components'
      );
    }
  }

  if (pkg.devDependencies) {
    if (pkg.devDependencies['@types/react']) {
      pkg.devDependencies['@types/react'] = '^19.0.0';
      console.log('✅ Updated @types/react for medical type safety');
    }
    if (pkg.devDependencies['@types/react-dom']) {
      pkg.devDependencies['@types/react-dom'] = '^19.0.0';
      console.log('✅ Updated @types/react-dom for healthcare workflows');
    }
  }

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('🏥 HEALTHCARE UPGRADE COMPLETE - React 19 + Next.js 15 ready');
} catch (error) {
  console.error('❌ Healthcare upgrade failed:', error.message);
}
