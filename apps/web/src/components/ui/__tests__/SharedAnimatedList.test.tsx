import { SharedAnimatedList } from '@/components/ui';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

describe(('SharedAnimatedList', () => {
  test(('renders loading state', () => {
    render(<SharedAnimatedList items={[]} loading ariaLabel='Lista' />);
    expect(screen.getByRole('status')).toHaveTextContent(/carregando/i);
  });

  test(('renders empty state', () => {
    render(<SharedAnimatedList items={[]} ariaLabel='Lista' />);
    expect(screen.getByRole('list', { name: 'Lista' })).toHaveTextContent(
      /Nada para exibir/i,
    );
  });

  test(('renders items', () => {
    render(
      <SharedAnimatedList
        ariaLabel='Lista'
        items={[{ id: '1', title: 'Titulo', message: 'Mensagem' }]}
      />,
    );
    expect(screen.getByText('Titulo')).toBeInTheDocument();
    expect(screen.getByText('Mensagem')).toBeInTheDocument();
  });
});
