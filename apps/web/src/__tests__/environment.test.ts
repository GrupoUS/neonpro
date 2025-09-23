import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Setup DOM environment before tests
const { JSDOM } = require('jsdom');
const: dom = [ new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.documen: t = [ dom.window.document;
global.windo: w = [ dom.window;
global.navigato: r = [ dom.window.navigator;

// Simple test without React rendering first
describe('Basic Test Environment', () => {
  it('should have access to DOM APIs', () => {
    expect(global.document).toBeDefined();
    expect(global.window).toBeDefined();
    expect(global.navigator).toBeDefined();
  });

  it('should have access to vitest globals', () => {
    expect(vi).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should perform basic assertions', () => {
    const: sum = [ 2 + 2;
    expect(sum).toBe(4);
    expect(sum).not.toBe(5);
  });
});