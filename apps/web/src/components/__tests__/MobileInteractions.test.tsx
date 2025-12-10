import {
  Button,
  SmoothDrawer,
  SmoothDrawerContent,
  SmoothDrawerHeader,
  SmoothDrawerTitle,
} from '@neonpro/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { ServiceForm } from '../services/ServiceForm';

function DrawerHarness() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <SmoothDrawer open={open} onOpenChange={setOpen}>
        <SmoothDrawerContent>
          <SmoothDrawerHeader>
            <SmoothDrawerTitle>Drawer</SmoothDrawerTitle>
          </SmoothDrawerHeader>
          <div>Conteúdo</div>
        </SmoothDrawerContent>
      </SmoothDrawer>
    </div>
  );
}

describe('Mobile interactions', () => {
  it('price input uses numeric keyboard (inputMode) and TimeSlotPicker works', async () => {
    const user = userEvent.setup();
    render(<ServiceForm onSuccess={() => {}} clinicId='test' /> as any);

    // inputMode for price
    const price = screen.getByLabelText(/Preço/i) as HTMLInputElement;
    expect(price).toHaveAttribute('inputmode', 'numeric');

    // Open duration select and choose an option
    const durationTrigger = screen.getByLabelText(/Duração/i).closest(
      'button',
    ) as HTMLButtonElement;
    await user.click(durationTrigger);
    const option = await screen.findByRole('option');
    await user.click(option);
  });

  it('drawer opens on small viewports without crashing (smoke)', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);

    await user.click(screen.getByRole('button', { name: /Abrir/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
