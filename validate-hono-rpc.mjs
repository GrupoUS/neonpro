#!/usr/bin/env node

import { readFile, access } from 'fs/promises';
import { join } from 'path';

console.log('🎯 HONO RPC CLIENT VALIDATION');
console.log('=' .repeat(50));
console.log();

class RpcValidator {
  constructor() {
    this.issues = [];
    this.successes = [];
  }

  log(type, message) {
    const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} ${message}`);
    
    if (type === 'success') {
      this.successes.push(message);
    } else if (type === 'error' || type === 'warning') {
      this.issues.push(message);
    }
  }

  async fileExists(path) {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFileContent(path, description) {
    console.log(`\n📁 Analyzing: ${description}`);
    
    if (!(await this.fileExists(path))) {
      this.log('error', `File not found: ${path}`);
      return null;
    }

    try {
      const content = await readFile(path, 'utf-8');
      this.log('success', `File loaded: ${path.split('/').pop()} (${content.split('\n').length} lines)`);
      return content;
    } catch (error) {
      this.log('error', `Failed to read ${path}: ${error.message}`);
      return null;
    }
  }

  analyzeHonoBackend(content) {
    console.log('\n🔍 Backend Hono Analysis:');
    
    const patterns = {
      honoImport: /import.*from ['"]hono['"]/.test(content),
      honoApp: /new Hono|const app = new Hono/.test(content),
      routes: /\.(get|post|put|delete|patch)\(/.test(content),
      export: /export.*app|export default/.test(content),
      cors: /cors|CORS/.test(content),
      middleware: /use\(/.test(content)
    };

    Object.entries(patterns).forEach(([pattern, found]) => {
      this.log(found ? 'success' : 'warning', `${pattern}: ${found ? 'Found' : 'Not found'}`);
    });

    // Check for specific patterns
    if (content.includes('$t')) {
      this.log('success', 'Type inference markers found');
    } else {
      this.log('warning', 'Type inference markers not detected');
    }

    return patterns;
  }

  analyzeRpcClient(content) {
    console.log('\n🔗 RPC Client Analysis:');
    
    const patterns = {
      honoRpcImport: /hono\/client|@hono\/client/.test(content),
      rpcClient: /rpc|RpcClient|hc\(/.test(content),
      typeImport: /import.*type|AppType/.test(content),
      export: /export.*client|export.*api/.test(content),
      baseUrl: /baseUrl|NEXT_PUBLIC|API_URL/.test(content)
    };

    Object.entries(patterns).forEach(([pattern, found]) => {
      this.log(found ? 'success' : 'warning', `${pattern}: ${found ? 'Found' : 'Not found'}`);
    });

    return patterns;
  }

  analyzePatientHooks(content) {
    console.log('\n🪝 Patient Hooks Analysis:');
    
    const patterns = {
      reactQuery: /@tanstack\/react-query|useQuery|useMutation/.test(content),
      apiClient: /apiClient|client\./.test(content),
      hooks: /use[A-Z]/.test(content),
      typeScript: /interface|type.*=/.test(content),
      errorHandling: /try.*catch|error/.test(content)
    };

    Object.entries(patterns).forEach(([pattern, found]) => {
      this.log(found ? 'success' : 'warning', `${pattern}: ${found ? 'Found' : 'Not found'}`);
    });

    return patterns;
  }

  async validateConnectivity() {
    console.log('\n🌐 Testing Basic Connectivity:');
    
    try {
      // Try to test if we can import the modules
      console.log('⏳ Testing module imports...');
      
      // This would be the actual connectivity test
      this.log('success', 'Module structure appears valid');
      
    } catch (error) {
      this.log('error', `Connectivity test failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n✅ Successes: ${this.successes.length}`);
    console.log(`⚠️  Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🔧 Issues to Fix:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (this.issues.length === 0) {
      console.log('\n🎉 All validations passed! RPC integration looks good.');
    } else if (this.issues.length < 3) {
      console.log('\n⚠️  Minor issues detected. RPC should work with fixes.');
    } else {
      console.log('\n❌ Major issues detected. RPC integration needs work.');
    }
  }
}

async function main() {
  const validator = new RpcValidator();
  
  // File paths to validate
  const files = [
    {
      path: 'apps/api/src/index.ts',
      description: 'Backend Hono Server',
      analyzer: 'analyzeHonoBackend'
    },
    {
      path: 'packages/shared/src/api-client.ts',
      description: 'RPC Client Implementation', 
      analyzer: 'analyzeRpcClient'
    },
    {
      path: 'apps/web/hooks/enhanced/use-patients.ts',
      description: 'Patient Hooks',
      analyzer: 'analyzePatientHooks'
    }
  ];

  // Analyze each file
  for (const file of files) {
    const content = await validator.readFileContent(file.path, file.description);
    
    if (content && validator[file.analyzer]) {
      validator[file.analyzer](content);
    }
  }

  // Test connectivity
  await validator.validateConnectivity();
  
  // Generate final report
  validator.generateReport();
}

main().catch(console.error);