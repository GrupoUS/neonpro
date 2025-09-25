import { describe, it, expect, beforeEach } from 'vitest'

describe('Package Structure Integration Tests', () => {
  let rootPackageJson: any
  let testPackageJson: any
  const rootDir = process.cwd()

  beforeEach(() => {
    // Read package.json files
    rootPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(rootDir, 'package.json'),
        'utf8'
      )
    )
    testPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(rootDir, 'tools/tests/package.json'),
        'utf8'
      )
    )
  })

  describe('Workspace Configuration Integration', () => {
    it('should have consistent workspace package management', () => {
      const workspaceConfig = getWorkspaceConfig()
      const rootPackageManager = rootPackageJson.packageManager
      
      // This test FAILS if workspace config doesn't match package manager
      if (rootPackageManager?.includes('pnpm')) {
        expect(workspaceConfig.type).toBe('pnpm')
      } else {
        expect(workspaceConfig.type).toBe('bun')
      }
    })

    it('should include test package in workspace packages', () => {
      const workspaceConfig = getWorkspaceConfig()
      
      // This test FAILS if test package is not included in workspace
      const includesTestPackage = workspaceConfig.packages.some((pkg: string) => 
        pkg.includes('tools/tests') || 
        pkg.includes('tests') || 
        pkg === '**'
      )
      expect(includesTestPackage).toBe(true)
    })

    it('should have valid workspace package references', () => {
      const workspaceConfig = getWorkspaceConfig()
      
      workspaceConfig.packages.forEach((pkgPattern: string) => {
        if (pkgPattern !== '**') {
          // Expand pattern to check for actual packages
          const packages = expandWorkspacePattern(pkgPattern, rootDir)
          
          packages.forEach(pkgPath => {
            const packageJsonPath = require('path').join(pkgPath, 'package.json')
            const exists = require('fs').existsSync(packageJsonPath)
            
            // This test FAILS if workspace pattern points to non-existent packages
            expect(exists).toBe(true)
          })
        }
      })
    })
  })

  describe('Cross-Package Dependencies', () => {
    it('should resolve internal package dependencies correctly', () => {
      const workspacePackages = getAllWorkspacePackages(rootDir)
      
      workspacePackages.forEach(pkg => {
        const packageJson = JSON.parse(
          require('fs').readFileSync(
            require('path').join(pkg, 'package.json'),
            'utf8'
          )
        )
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
        
        Object.entries(dependencies).forEach(([depName, depVersion]) => {
          if (depName.startsWith('@neonpro/')) {
            // Check if internal dependency exists
            const depPath = findPackagePath(depName, rootDir)
            
            // This test FAILS if internal dependency cannot be resolved
            expect(depPath).toBeDefined()
            expect(require('fs').existsSync(depPath as string)).toBe(true)
          }
        })
      })
    })

    it('should have consistent dependency versions across packages', () => {
      const workspacePackages = getAllWorkspacePackages(rootDir)
      const dependencyVersions: Record<string, Set<string>> = {}
      
      // Collect all dependency versions
      workspacePackages.forEach(pkg => {
        const packageJson = JSON.parse(
          require('fs').readFileSync(
            require('path').join(pkg, 'package.json'),
            'utf8'
          )
        )
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
        
        Object.entries(dependencies).forEach(([depName, depVersion]) => {
          if (!dependencyVersions[depName]) {
            dependencyVersions[depName] = new Set()
          }
          dependencyVersions[depName].add(depVersion as string)
        })
      })
      
      // Check for version conflicts
      Object.entries(dependencyVersions).forEach(([depName, versions]) => {
        if (versions.size > 1 && !depName.startsWith('@neonpro/')) {
          // This test FAILS if there are version conflicts for external dependencies
          console.warn(`Version conflict for ${depName}: ${Array.from(versions).join(', ')}`)
          expect(versions.size).toBe(1)
        }
      })
    })
  })

  describe('Test Package Integration', () => {
    it('should have correct test package name and structure', () => {
      // This test FAILS if test package has incorrect name
      expect(testPackageJson.name).toBe('@neonpro/tests')
      
      // Verify test package structure
      const expectedDirs = ['categories', 'configs', 'fixtures']
      expectedDirs.forEach(dir => {
        const dirPath = require('path').join(rootDir, 'tools/tests', dir)
        const exists = require('fs').existsSync(dirPath)
        
        // This test FAILS if expected directories are missing
        expect(exists).toBe(true)
      })
    })

    it('should have working test scripts with correct paths', () => {
      const testScripts = testPackageJson.scripts || {}
      
      Object.entries(testScripts).forEach(([scriptName, scriptCommand]) => {
        if (typeof scriptCommand === 'string' && scriptCommand.includes('categories/')) {
          // Extract path from command
          const pathMatch = scriptCommand.match(/categories\/[^\/\s]+/g)
          if (pathMatch) {
            pathMatch.forEach(path => {
              const fullPath = require('path').join(rootDir, 'tools/tests', path)
              const exists = require('fs').existsSync(fullPath)
              
              // This test FAILS if script references non-existent path
              expect(exists).toBe(true)
            })
          }
        }
      })
    })

    it('should have consistent test configuration files', () => {
      const configFiles = [
        'configs/vitest.config.ts',
        'configs/playwright.config.ts',
        'configs/.oxlintrc.json'
      ]
      
      configFiles.forEach(configFile => {
        const configPath = require('path').join(rootDir, 'tools/tests', configFile)
        const exists = require('fs').existsSync(configPath)
        
        // This test FAILS if configuration files are missing
        expect(exists).toBe(true)
        
        if (exists) {
          // Try to require/parse config file
          try {
            if (configFile.endsWith('.json')) {
              JSON.parse(require('fs').readFileSync(configPath, 'utf8'))
            }
          } catch (error) {
            // This test FAILS if config file is malformed
            expect(false).toBe(true)
          }
        }
      })
    })
  })

  describe('Build System Integration', () => {
    it('should have consistent build commands across all packages', () => {
      const workspacePackages = getAllWorkspacePackages(rootDir)
      const buildCommands: string[] = []
      
      workspacePackages.forEach(pkg => {
        const packageJson = JSON.parse(
          require('fs').readFileSync(
            require('path').join(pkg, 'package.json'),
            'utf8'
          )
        )
        
        const scripts = packageJson.scripts || {}
        Object.entries(scripts).forEach(([scriptName, scriptCommand]) => {
          if (scriptName.startsWith('build') && typeof scriptCommand === 'string') {
            buildCommands.push(scriptCommand)
          }
        })
      })
      
      // Check for mixed package manager usage in build commands
      const bunCommands = buildCommands.filter(cmd => cmd.includes('bun run'))
      const pnpmCommands = buildCommands.filter(cmd => cmd.includes('pnpm run'))
      
      // This test FAILS if there are mixed package manager commands
      expect(bunCommands.length + pnpmCommands.length).toBe(0)
    })

    it('should have working test execution paths', () => {
      const testScripts = testPackageJson.scripts || {}
      
      Object.entries(testScripts).forEach(([scriptName, scriptCommand]) => {
        if (scriptName.startsWith('test') && typeof scriptCommand === 'string') {
          // Check if the test command would work
          const hasValidConfig = scriptCommand.includes('--config')
          const configPath = scriptCommand.match(/--config\s+(\S+)/)?.[1]
          
          if (configPath) {
            const fullConfigPath = require('path').join(rootDir, 'tools/tests', configPath)
            const exists = require('fs').existsSync(fullConfigPath)
            
            // This test FAILS if referenced config doesn't exist
            expect(exists).toBe(true)
          }
        }
      })
    })
  })

  describe('Import Path Resolution', () => {
    it('should resolve all imports in test files', () => {
      const testFiles = getAllTestFiles(rootDir)
      
      testFiles.forEach(testFile => {
        try {
          const content = require('fs').readFileSync(testFile, 'utf8')
          const imports = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || []
          
          imports.forEach(importStatement => {
            const importPath = importStatement.match(/from\s+['"]([^'"]+)['"]/)?.[1]
            if (importPath && !importPath.startsWith('.')) {
              // Try to resolve external import
              try {
                require.resolve(importPath, { paths: [rootDir] })
              } catch {
                // This test FAILS if external import cannot be resolved
                expect(false).toBe(true)
              }
            }
          })
        } catch (error) {
          // This test FAILS if test file cannot be read
          expect(false).toBe(true)
        }
      })
    })

    it('should have consistent module resolution across test categories', () => {
      const testCategories = ['backend', 'frontend', 'database', 'quality']
      
      testCategories.forEach(category => {
        const categoryPath = require('path').join(rootDir, 'tools/tests/categories', category)
        const testFiles = getAllTestFiles(categoryPath)
        
        // Check if test files in category can be loaded
        testFiles.forEach(testFile => {
          if (testFile.endsWith('.ts')) {
            try {
              // Try to get file info (basic check)
              const stats = require('fs').statSync(testFile)
              expect(stats.isFile()).toBe(true)
            } catch (error) {
              // This test FAILS if test file cannot be accessed
              expect(false).toBe(true)
            }
          }
        })
      })
    })
  })

  // Helper functions
  function getWorkspaceConfig() {
    const rootDir = process.cwd()
    
    // Check for pnpm workspace
    const pnpmWorkspacePath = require('path').join(rootDir, 'pnpm-workspace.yaml')
    if (require('fs').existsSync(pnpmWorkspacePath)) {
      const content = require('fs').readFileSync(pnpmWorkspacePath, 'utf8')
      const packagesMatch = content.match(/packages:\s*\n([\s\S]*?)(?=\n\w|\n*$)/)
      const packages = packagesMatch 
        ? packagesMatch[1].split('\n').map(line => line.trim().replace('- ', '')).filter(Boolean)
        : []
      
      return { type: 'pnpm', packages }
    }
    
    // Check for bun workspace
    const bunWorkspacePath = require('path').join(rootDir, 'bun-workspace.json')
    if (require('fs').existsSync(bunWorkspacePath)) {
      const content = JSON.parse(require('fs').readFileSync(bunWorkspacePath, 'utf8'))
      return { type: 'bun', packages: Array.isArray(content) ? content : content.packages || [] }
    }
    
    return { type: 'none', packages: [] }
  }

  function getAllWorkspacePackages(rootDir: string): string[] {
    const workspaceConfig = getWorkspaceConfig()
    const packages: string[] = []
    
    workspaceConfig.packages.forEach((pkgPattern: string) => {
      if (pkgPattern !== '**') {
        packages.push(...expandWorkspacePattern(pkgPattern, rootDir))
      }
    })
    
    return packages
  }

  function expandWorkspacePattern(pattern: string, rootDir: string): string[] {
    // Simple pattern expansion - in real implementation would use glob
    if (pattern.includes('/*')) {
      const baseDir = pattern.replace('/*', '')
      const dirPath = require('path').join(rootDir, baseDir)
      if (require('fs').existsSync(dirPath)) {
        return require('fs').readdirSync(dirPath)
          .filter(item => {
            const itemPath = require('path').join(dirPath, item)
            return require('fs').statSync(itemPath).isDirectory()
          })
          .map(item => require('path').join(dirPath, item))
      }
    }
    
    const fullPath = require('path').join(rootDir, pattern)
    return require('fs').existsSync(fullPath) ? [fullPath] : []
  }

  function findPackagePath(packageName: string, rootDir: string): string | undefined {
    const workspacePackages = getAllWorkspacePackages(rootDir)
    
    for (const pkgPath of workspacePackages) {
      try {
        const packageJson = JSON.parse(
          require('fs').readFileSync(
            require('path').join(pkgPath, 'package.json'),
            'utf8'
          )
        )
        if (packageJson.name === packageName) {
          return pkgPath
        }
      } catch {
        // Continue to next package
      }
    }
    
    return undefined
  }

  function getAllTestFiles(rootDir: string): string[] {
    const testFiles: string[] = []
    const testDir = require('path').join(rootDir, 'tools/tests/categories')
    
    function scanDirectory(dir: string) {
      if (!require('fs').existsSync(dir)) return
      
      const items = require('fs').readdirSync(dir)
      items.forEach(item => {
        const itemPath = require('path').join(dir, item)
        const stats = require('fs').statSync(itemPath)
        
        if (stats.isDirectory()) {
          scanDirectory(itemPath)
        } else if (item.endsWith('.test.ts')) {
          testFiles.push(itemPath)
        }
      })
    }
    
    scanDirectory(testDir)
    return testFiles
  }
})