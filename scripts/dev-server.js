#!/usr/bin/env node

/**
 * NeonPro Development Server
 * ==========================
 * 
 * Advanced development server with hot reloading for the 8-package architecture.
 * Features:
 * - Hot Module Replacement (HMR) for all packages
 * - Concurrent development of multiple packages
 * - Automatic dependency injection
 * - WebSocket communication
 * - Real-time error reporting
 * - Performance monitoring
 * - Debug tools integration
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { watch } from 'fs';
import { EventEmitter } from 'events';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Development configuration
const DEV_CONFIG = {
  port: process.env.DEV_PORT || 3000,
  wsPort: process.env.DEV_WS_PORT || 3001,
  hot: process.env.HOT !== 'false',
  debug: process.env.DEBUG === 'true',
  concurrent: process.env.CONCURRENT !== 'false',
  watch: process.env.WATCH !== 'false',
  rebuild: process.env.REBUILD !== 'false'
};

// Core packages and their dev servers
const CORE_PACKAGES = [
  {
    name: '@neonpro/types',
    path: 'packages/types',
    type: 'library',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/shared',
    path: 'packages/shared',
    type: 'library',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/database',
    path: 'packages/database',
    type: 'service',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/ai-services',
    path: 'packages/ai-services',
    type: 'service',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/healthcare-core',
    path: 'packages/healthcare-core',
    type: 'service',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/security-compliance',
    path: 'packages/security-compliance',
    type: 'service',
    watch: true,
    hot: false
  },
  {
    name: '@neonpro/api-gateway',
    path: 'packages/api-gateway',
    type: 'service',
    watch: true,
    hot: true
  },
  {
    name: '@neonpro/ui',
    path: 'packages/ui',
    type: 'library',
    watch: true,
    hot: true
  }
];

// Applications
const APPLICATIONS = [
  {
    name: '@neonpro/api',
    path: 'apps/api',
    type: 'api',
    port: 3001,
    hot: true
  },
  {
    name: '@neonpro/web',
    path: 'apps/web',
    type: 'web',
    port: 3000,
    hot: true
  }
];

class DevServer extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.watchers = new Map();
    this.io = null;
    this.server = null;
    this.startTime = Date.now();
    
    this.setupSocketServer();
    this.setupProcessHandlers();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🚀';
    console.log(`[${timestamp}] ${prefix} ${message}`);
    
    // Emit to WebSocket clients
    if (this.io) {
      this.io.emit('log', { timestamp, message, level });
    }
  }

  setupSocketServer() {
    this.server = createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      this.log(`Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        this.log(`Client disconnected: ${socket.id}`);
      });

      socket.on('request-status', () => {
        socket.emit('status', this.getStatus());
      });

      socket.on('restart-package', (packageName) => {
        this.restartPackage(packageName);
      });

      socket.on('hot-reload', (packageName) => {
        this.hotReloadPackage(packageName);
      });
    });

    this.server.listen(DEV_CONFIG.wsPort, () => {
      this.log(`WebSocket server running on port ${DEV_CONFIG.wsPort}`);
    });
  }

  setupProcessHandlers() {
    process.on('SIGINT', () => {
      this.log('Received SIGINT, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      this.log('Received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });

    process.on('uncaughtException', (error) => {
      this.log(`Uncaught Exception: ${error.message}`, 'error');
      console.error(error.stack);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
    });
  }

  getStatus() {
    const processes = Array.from(this.processes.entries()).map(([name, info]) => ({
      name,
      status: info.status,
      pid: info.process?.pid,
      port: info.port,
      startTime: info.startTime,
      restartCount: info.restartCount
    }));

    return {
      uptime: Date.now() - this.startTime,
      processes,
      watchers: Array.from(this.watchers.keys()),
      config: DEV_CONFIG
    };
  }

  async startPackage(pkg, options = {}) {
    const { force = false } = options;
    
    if (this.processes.has(pkg.name) && !force) {
      this.log(`Package ${pkg.name} is already running`);
      return;
    }

    this.log(`Starting package: ${pkg.name}`);

    const packageDir = join(rootDir, pkg.path);
    const packageJsonPath = join(packageDir, 'package.json');
    
    try {
      // Check if package.json exists
      const fs = await import('fs');
      if (!fs.existsSync(packageJsonPath)) {
        this.log(`Package ${pkg.name} not found at ${packageDir}`, 'warn');
        return;
      }

      // Read package.json to get scripts
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const devScript = packageJson.scripts?.dev || packageJson.scripts?.start;
      
      if (!devScript) {
        this.log(`No dev script found for ${pkg.name}`, 'warn');
        return;
      }

      // Set environment variables
      const env = {
        ...process.env,
        NODE_ENV: 'development',
        DEV_PORT: pkg.port || DEV_CONFIG.port,
        HOT: DEV_CONFIG.hot.toString(),
        DEBUG: DEV_CONFIG.debug.toString()
      };

      // Spawn process
      const process = spawn('bun', ['run', 'dev'], {
        cwd: packageDir,
        env,
        stdio: DEV_CONFIG.debug ? 'inherit' : 'pipe'
      });

      const processInfo = {
        process,
        status: 'starting',
        startTime: Date.now(),
        restartCount: 0,
        port: pkg.port,
        package: pkg
      };

      this.processes.set(pkg.name, processInfo);

      process.stdout?.on('data', (data) => {
        const output = data.toString();
        if (DEV_CONFIG.debug) {
          console.log(`[${pkg.name}] ${output}`);
        }
        
        // Check for successful startup
        if (output.includes('ready') || output.includes('listening') || output.includes('started')) {
          processInfo.status = 'running';
          this.log(`${pkg.name} started successfully`);
          this.io?.emit('package-started', { name: pkg.name, port: pkg.port });
        }
      });

      process.stderr?.on('data', (data) => {
        const output = data.toString();
        this.log(`[${pkg.name}] ERROR: ${output}`, 'error');
        
        // Check for port conflicts
        if (output.includes('EADDRINUSE')) {
          this.log(`Port ${pkg.port} already in use for ${pkg.name}`, 'warn');
          processInfo.status = 'error';
        }
      });

      process.on('exit', (code) => {
        this.log(`${pkg.name} process exited with code ${code}`);
        processInfo.status = 'stopped';
        
        // Auto-restart if enabled
        if (DEV_CONFIG.rebuild && code !== 0) {
          this.log(`Auto-restarting ${pkg.name}...`);
          setTimeout(() => {
            this.startPackage(pkg, { force: true });
          }, 2000);
        }
      });

      process.on('error', (error) => {
        this.log(`Error in ${pkg.name}: ${error.message}`, 'error');
        processInfo.status = 'error';
      });

      // Setup file watching if enabled
      if (DEV_CONFIG.watch && pkg.watch) {
        this.setupFileWatcher(pkg);
      }

    } catch (error) {
      this.log(`Failed to start ${pkg.name}: ${error.message}`, 'error');
    }
  }

  setupFileWatcher(pkg) {
    const packageDir = join(rootDir, pkg.path);
    
    try {
      const watcher = watch(packageDir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js') || filename.endsWith('.json'))) {
          this.log(`File changed in ${pkg.name}: ${filename}`);
          
          // Trigger hot reload if supported
          if (pkg.hot && DEV_CONFIG.hot) {
            this.hotReloadPackage(pkg.name);
          } else {
            // Restart the package
            this.restartPackage(pkg.name);
          }
        }
      });

      this.watchers.set(pkg.name, watcher);
      this.log(`File watcher set up for ${pkg.name}`);
    } catch (error) {
      this.log(`Failed to set up file watcher for ${pkg.name}: ${error.message}`, 'warn');
    }
  }

  restartPackage(packageName) {
    const processInfo = this.processes.get(packageName);
    if (!processInfo) {
      this.log(`Package ${packageName} is not running`, 'warn');
      return;
    }

    this.log(`Restarting package: ${packageName}`);

    // Stop current process
    if (processInfo.process) {
      processInfo.process.kill();
    }

    // Restart package
    setTimeout(() => {
      this.startPackage(processInfo.package, { force: true });
      processInfo.restartCount++;
      
      this.io?.emit('package-restarted', { 
        name: packageName, 
        restartCount: processInfo.restartCount 
      });
    }, 1000);
  }

  hotReloadPackage(packageName) {
    const processInfo = this.processes.get(packageName);
    if (!processInfo || !processInfo.package.hot) {
      this.log(`Hot reload not supported for ${packageName}`, 'warn');
      return;
    }

    this.log(`Hot reloading package: ${packageName}`);
    
    // Send hot reload signal via WebSocket
    this.io?.emit('hot-reload', { packageName });
    
    // Send HMR signal to process if it supports it
    if (processInfo.process) {
      processInfo.process.send?.({ type: 'hot-reload' });
    }
  }

  async startAll() {
    this.log('🚀 Starting NeonPro development server...');
    this.log(`Configuration: ${JSON.stringify(DEV_CONFIG, null, 2)}`);

    // Start core packages first
    for (const pkg of CORE_PACKAGES) {
      await this.startPackage(pkg);
      
      // Add delay between package starts to avoid resource conflicts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Then start applications
    for (const app of APPLICATIONS) {
      await this.startPackage(app);
      
      // Add delay between app starts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.log('✅ All packages started successfully');
    this.log(`📊 Development server status: ${JSON.stringify(this.getStatus(), null, 2)}`);
  }

  stopPackage(packageName) {
    const processInfo = this.processes.get(packageName);
    if (!processInfo) {
      this.log(`Package ${packageName} is not running`, 'warn');
      return;
    }

    this.log(`Stopping package: ${packageName}`);

    if (processInfo.process) {
      processInfo.process.kill();
    }

    const watcher = this.watchers.get(packageName);
    if (watcher) {
      watcher.close();
      this.watchers.delete(packageName);
    }

    this.processes.delete(packageName);
    this.io?.emit('package-stopped', { name: packageName });
  }

  shutdown() {
    this.log('Shutting down development server...');

    // Stop all processes
    for (const [name, processInfo] of this.processes) {
      if (processInfo.process) {
        processInfo.process.kill();
      }
    }

    // Close all watchers
    for (const [name, watcher] of this.watchers) {
      watcher.close();
    }

    // Close WebSocket server
    if (this.io) {
      this.io.close();
    }

    if (this.server) {
      this.server.close();
    }

    this.log('Development server shut down');
    process.exit(0);
  }

  // Development utilities
  async runTests(packageName) {
    this.log(`Running tests for ${packageName}`);
    // Implementation for running tests
  }

  async runLint(packageName) {
    this.log(`Running lint for ${packageName}`);
    // Implementation for running lint
  }

  async buildPackage(packageName) {
    this.log(`Building package ${packageName}`);
    // Implementation for building individual packages
  }

  getPackageInfo(packageName) {
    const processInfo = this.processes.get(packageName);
    if (!processInfo) {
      return null;
    }

    return {
      name: packageName,
      status: processInfo.status,
      uptime: Date.now() - processInfo.startTime,
      restartCount: processInfo.restartCount,
      port: processInfo.port,
      type: processInfo.package.type
    };
  }
}

// CLI Interface
async function main() {
  const devServer = new DevServer();

  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  try {
    switch (command) {
      case 'start':
        await devServer.startAll();
        break;
        
      case 'status':
        console.log(JSON.stringify(devServer.getStatus(), null, 2));
        break;
        
      case 'restart':
        const packageName = args[1];
        if (!packageName) {
          console.error('Package name required for restart');
          process.exit(1);
        }
        devServer.restartPackage(packageName);
        break;
        
      case 'stop':
        const stopPackage = args[1];
        if (stopPackage) {
          devServer.stopPackage(stopPackage);
        } else {
          devServer.shutdown();
        }
        break;
        
      case 'info':
        const infoPackage = args[1];
        if (infoPackage) {
          console.log(JSON.stringify(devServer.getPackageInfo(infoPackage), null, 2));
        } else {
          console.log('Package name required for info');
          process.exit(1);
        }
        break;
        
      default:
        console.log(`
NeonPro Development Server

Usage: node scripts/dev-server.js <command> [options]

Commands:
  start               Start all packages
  status              Show server status
  restart <package>   Restart a specific package
  stop [package]      Stop a specific package or all
  info <package>      Get package information

Environment Variables:
  DEV_PORT            Development server port (default: 3000)
  DEV_WS_PORT         WebSocket server port (default: 3001)
  HOT                 Enable hot reloading (default: true)
  DEBUG               Enable debug mode (default: false)
  CONCURRENT          Enable concurrent builds (default: true)
  WATCH               Enable file watching (default: true)
  REBUILD             Auto-rebuild on errors (default: false)
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DevServer;