import { SharedAnimatedList } from '@neonpro/ui';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

describe(_'SharedAnimatedList',_() => {
  test(_'renders loading state',_() => {
    render(<SharedAnimatedList items={[]} loading ariaLabel='Lista' />);
    expect(screen.getByRole('status')).toHaveTextContent(/carregando/i);
  });

  test(_'renders empty state',_() => {
    render(<SharedAnimatedList items={[]} ariaLabel='Lista' />);
    expect(screen.getByRole('list', { name: 'Lista' })).toHaveTextContent(
      /Nada para exibir/i,
    );
  });

  test(_'renders items',_() => {
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
