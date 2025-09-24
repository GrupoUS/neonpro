/**
 * CLI Wrapper Tests - Simplified version
 */

import { describe, expect, it, vi } from 'vitest'
import { CLIWrapper, createCLI } from '../cliWrap.js'

describe('CLIWrapper', () => {
  describe('command registration and argument parsing', () => {
    it('should register commands', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
        version: '1.0.0',
        setupErrorHandling: false,
      })

      const handler = vi.fn()
      const result = cli.command({
        name: 'test',
        description: 'Test command',
        handler,
      })

      // Should return the CLI instance for chaining
      expect(result).toBe(cli)
    })

    it('should parse command line arguments correctly', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
        setupErrorHandling: false,
      })

      // Register the test command first
      cli.command({
        name: 'test',
        description: 'Test command',
        handler: vi.fn(),
      })

      // Test argument parsing by inspecting the private method via reflection
      // This is a unit test for the internal parsing logic
      const parseArgs = (cli as any).parseArgs.bind(cli)

      const result = parseArgs([
        'test',
        'arg1',
        'arg2',
        '--option',
        'value',
        '--flag',
      ])

      expect(result.command).toBe('test')
      expect(result.positional).toEqual(['arg1', 'arg2'])
      expect(result.options.option).toBe('value')
      expect(result.options.flag).toBe(true)
    })

    it('should handle options with equals sign', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
        setupErrorHandling: false,
      })

      // Register the test command first
      cli.command({
        name: 'test',
        description: 'Test command',
        handler: vi.fn(),
      })

      const parseArgs = (cli as any).parseArgs.bind(cli)
      const result = parseArgs(['test', '--option=value', '--flag'])

      expect(result.options.option).toBe('value')
      expect(result.options.flag).toBe(true)
    })

    it('should handle short options', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
        setupErrorHandling: false,
      })

      // Register the test command first
      cli.command({
        name: 'test',
        description: 'Test command',
        handler: vi.fn(),
      })

      const parseArgs = (cli as any).parseArgs.bind(cli)
      const result = parseArgs(['test', '-o', 'value', '-f'])

      expect(result.options.o).toBe('value')
      expect(result.options.f).toBe(true)
    })
  })

  describe('configuration', () => {
    it('should set default configuration values', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
      })

      // Access private config to verify defaults
      const config = (cli as any).config

      expect(config.appName).toBe('test-cli')
      expect(config.version).toBe('1.0.0')
      expect(config.timeout).toBe(30000)
      expect(config.setupErrorHandling).toBe(true)
    })

    it('should override default configuration', () => {
      const cli = new CLIWrapper({
        appName: 'custom-cli',
        version: '2.0.0',
        timeout: 5000,
        setupErrorHandling: false,
      })

      const config = (cli as any).config

      expect(config.appName).toBe('custom-cli')
      expect(config.version).toBe('2.0.0')
      expect(config.timeout).toBe(5000)
      expect(config.setupErrorHandling).toBe(false)
    })
  })

  describe('createCLI factory', () => {
    it('should create a CLI instance', () => {
      const cli = createCLI({
        appName: 'factory-test',
        version: '2.0.0',
      })

      expect(cli).toBeInstanceOf(CLIWrapper)
    })
  })

  describe('command management', () => {
    it('should store registered commands', () => {
      const cli = new CLIWrapper({
        appName: 'test-cli',
        setupErrorHandling: false,
      })

      const handler1 = vi.fn()
      const handler2 = vi.fn()

      cli.command({ name: 'cmd1', handler: handler1 })
      cli.command({ name: 'cmd2', handler: handler2 })

      // Access private commands map
      const commands = (cli as any).commands

      expect(commands.has('cmd1')).toBe(true)
      expect(commands.has('cmd2')).toBe(true)
      expect(commands.get('cmd1').handler).toBe(handler1)
      expect(commands.get('cmd2').handler).toBe(handler2)
    })
  })
})
