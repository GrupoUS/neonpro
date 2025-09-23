import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import '@testing-library/jest-dom';

// Setup DOM environment for basic test
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Simple test component
const TestComponent = () => {
  return <div>Test Component</div>;
};

describe('Basic React Test', () => {
  it('should render a simple component', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test Component')).toBeInTheDocument();
  });
});