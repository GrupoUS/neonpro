import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { ServiceForm } from '../ServiceForm';

const noop = () => {};

describe('ServiceForm ARIA and validation', () => {
  it('shows error for empty name on submit and clears after typing', async () => {
    render(<ServiceForm onSuccess={noop} clinicId='test-clinic' /> as any);

    // Submit without filling required name
    const submit = screen.getByRole('button', {
      name: /Criar Serviço|Atualizar Serviço/i,
    });
    submit.click();

    // Error appears
    expect(
      await screen.findByText(/Nome do serviço é obrigatório/i),
    ).toBeInTheDocument();

    // Type a valid name and ensure error disappears
    const nameInput = screen.getByLabelText(/Nome do Serviço/i);
    fireEvent.change(nameInput, { target: { value: 'Consulta' } });

    expect(screen.queryByText(/Nome do serviço é obrigatório/i)).toBeNull();
  });

  it('price input uses numeric inputMode for mobile keyboards', () => {
    render(<ServiceForm onSuccess={noop} clinicId='test-clinic' /> as any);
    const price = screen.getByLabelText(/Preço/i) as HTMLInputElement;
    expect(price).toHaveAttribute('inputmode', 'numeric');
  });
});
