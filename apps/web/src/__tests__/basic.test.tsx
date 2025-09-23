import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import '@testing-library/jest-dom';

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