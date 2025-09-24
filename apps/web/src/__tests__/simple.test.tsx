import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

// Simple test component
const SimpleComponent = () => {
  return <div>Simple Test</div>
}

describe('Simple React Test', () => {
  it('should render without providers', () => {
    const { getByText } = render(<SimpleComponent />)
    expect(getByText('Simple Test')).toBeInTheDocument()
  })
})
