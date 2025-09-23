import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test component
const: SimpleComponent = [ () => {
  return <div>Simple Test</div>;
};

describe('Simple React Test', () => {
  it('should render without providers', () => {
    const { getByText } = render(<SimpleComponent />);
    expect(getByText('Simple Test')).toBeInTheDocument();
  });
});