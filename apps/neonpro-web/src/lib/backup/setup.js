#!/usr/bin/env node

/**
 * NeonPro Backup System Setup Script
 * Story 1.8: Sistema de Backup e Recovery
 * 
 * This script helps set up the backup system by:
 * - Creating necessary directories
 * - Setting up environment configuration
 * - Installing dependencies
 * - Creating database schema
 * - Running initial tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createDirectories() {
  log('\n📁 Creating necessary directories...', 'blue');
  
  const directories = [
    './logs',
    './backups',
    './temp',
    './config',
    './tests'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    } else {
      log(`📁 Directory already exists: ${dir}`, 'yellow');
    }
  });
}

async function setupEnvironment() {
  log('\n🔧 Setting up environment configuration...', 'blue');
  
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      log('✅ Created .env file from .env.example', 'green');
      log('⚠️  Please edit .env file with your configuration', 'yellow');
    } else {
      log('❌ .env.example file not found', 'red');
      return false;
    }
  } else {
    log('📄 .env file already exists', 'yellow');
  }
  
  return true;
}

async function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  
  try {
    const useYarn = await question('Use Yarn instead of npm? (y/N): ');
    const packageManager = useYarn.toLowerCase() === 'y' ? 'yarn' : 'npm';
    
    log(`Installing with ${packageManager}...`, 'cyan');
    execSync(`${packageManager} install`, { stdio: 'inherit' });
    log('✅ Dependencies installed successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to install dependencies: ${error.message}`, 'red');
    return false;
  }
}

async function setupDatabase() {
  log('\n🗄️  Setting up database schema...', 'blue');
  
  const setupDb = await question('Set up database schema now? (Y/n): ');
  if (setupDb.toLowerCase() === 'n') {
    log('⏭️  Skipping database setup', 'yellow');
    return true;
  }
  
  const supabaseUrl = await question('Enter your Supabase URL: ');
  const supabaseKey = await question('Enter your Supabase Service Role Key: ');
  
  if (!supabaseUrl || !supabaseKey) {
    log('⚠️  Supabase credentials not provided, skipping database setup', 'yellow');
    return true;
  }
  
  // Update .env file with Supabase credentials
  try {
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/SUPABASE_URL=.*/, `SUPABASE_URL=${supabaseUrl}`);
    envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${supabaseKey}`);
    fs.writeFileSync('.env', envContent);
    log('✅ Updated .env with Supabase credentials', 'green');
  } catch (error) {
    log(`❌ Failed to update .env: ${error.message}`, 'red');
    return false;
  }
  
  log('📋 Please run the SQL schema from database/backup-schema.sql in your Supabase dashboard', 'cyan');
  return true;
}

async function runTests() {
  log('\n🧪 Running initial tests...', 'blue');
  
  const runTests = await question('Run tests now? (Y/n): ');
  if (runTests.toLowerCase() === 'n') {
    log('⏭️  Skipping tests', 'yellow');
    return true;
  }
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    log('✅ All tests passed', 'green');
    return true;
  } catch (error) {
    log('⚠️  Some tests failed, but setup can continue', 'yellow');
    return true;
  }
}

async function generateConfig() {
  log('\n⚙️  Generating configuration files...', 'blue');
  
  const configTemplate = {
    backup: {
      defaultProvider: 'LOCAL',
      maxConcurrentBackups: 3,
      compressionLevel: 6,
      encryptionEnabled: true
    },
    monitoring: {
      enabled: true,
      interval: 5,
      alerts: {
        failedBackupThreshold: 1,
        storageUsageThreshold: 80,
        backupAgeThreshold: 24
      }
    },
    retention: {
      defaultDays: 30,
      maxBackups: 10,
      cleanupEnabled: true
    },
    performance: {
      chunkSize: 1048576,
      connectionTimeout: 30,
      requestTimeout: 300,
      maxRetries: 3
    }
  };
  
  const configPath = './config/backup-config.json';
  fs.writeFileSync(configPath, JSON.stringify(configTemplate, null, 2));
  log(`✅ Created configuration file: ${configPath}`, 'green');
}

async function showNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'bright');
  log('1. Edit .env file with your specific configuration', 'cyan');
  log('2. Run the SQL schema in your Supabase dashboard', 'cyan');
  log('3. Configure your storage providers (AWS S3, Google Cloud, etc.)', 'cyan');
  log('4. Test the backup system with a simple configuration', 'cyan');
  log('5. Set up monitoring and alerts', 'cyan');
  
  log('\n🚀 Quick start commands:', 'bright');
  log('npm run dev          # Start development server', 'cyan');
  log('npm test             # Run tests', 'cyan');
  log('npm run build        # Build for production', 'cyan');
  
  log('\n📚 Documentation:', 'bright');
  log('- README.md          # Main documentation', 'cyan');
  log('- database/          # Database schema and migrations', 'cyan');
  log('- config/            # Configuration examples', 'cyan');
  
  log('\n💡 Tips:', 'bright');
  log('- Start with LOCAL storage provider for testing', 'yellow');
  log('- Enable monitoring to track backup health', 'yellow');
  log('- Set up retention policies to manage storage usage', 'yellow');
  log('- Test disaster recovery procedures regularly', 'yellow');
}

async function main() {
  log('🚀 NeonPro Backup System Setup', 'bright');
  log('Story 1.8: Sistema de Backup e Recovery\n', 'magenta');
  
  try {
    await createDirectories();
    
    const envSetup = await setupEnvironment();
    if (!envSetup) {
      log('❌ Environment setup failed', 'red');
      process.exit(1);
    }
    
    const depsInstalled = await installDependencies();
    if (!depsInstalled) {
      log('❌ Dependency installation failed', 'red');
      process.exit(1);
    }
    
    await setupDatabase();
    await generateConfig();
    await runTests();
    await showNextSteps();
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  createDirectories,
  setupEnvironment,
  installDependencies,
  setupDatabase,
  generateConfig
};
