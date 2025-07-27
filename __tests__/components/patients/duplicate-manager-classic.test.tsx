import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DuplicateManagerClassic from '@/components/patients/duplicate-manager-classic';

const mockDuplicates = [
  {
    id: 'group-1',
    confidence: 0.85,
    patients: [
      {
        id: 'patient-1',
        name: 'John Doe',
        birthDate: '1990-01-01',
        email: 'john@example.com',
        phone: '555-0123'
      },
      {
        id: 'patient-2',
        name: 'Jon Doe',
        birthDate: '1990-01-01',
        email: 'jon@example.com',
        phone: '555-0124'
      }
    ],
    suggestedPrimary: 'patient-1'
  }
];

describe('DuplicateManagerClassic', () => {
  const mockOnMerge = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnMerge.mockClear();
    mockOnDismiss.mockClear();
  });

  test('renders duplicate detection UI', () => {
    render(
      <DuplicateManagerClassic
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Found 1 potential duplicate')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  test('shows confidence percentage', () => {
    render(
      <DuplicateManagerClassic
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  test('displays patient information', () => {
    render(
      <DuplicateManagerClassic
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jon Doe')).toBeInTheDocument();
    expect(screen.getByText('Birth Date: 1990-01-01')).toBeInTheDocument();
  });
});
