import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Popup } from './Popup';

function ControlledPopup() {
  const [open, setOpen] = useState(true);
  return (
    <Popup open={open} onOpenChange={setOpen} title="Pontos de vida" subtitle="Elyndra Duskwhisper">
      <p>Conteúdo do popup</p>
    </Popup>
  );
}

describe('Popup', () => {
  it('renders title, subtitle and children when open', () => {
    render(
      <Popup open onOpenChange={() => {}} title="Iniciativa">
        <p>+7</p>
      </Popup>,
    );
    expect(screen.getByText('Iniciativa')).toBeInTheDocument();
    expect(screen.getByText('+7')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Popup open={false} onOpenChange={() => {}} title="Iniciativa">
        <p>+7</p>
      </Popup>,
    );
    expect(screen.queryByText('Iniciativa')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when the close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Popup open onOpenChange={onOpenChange} title="Iniciativa">
        <p>+7</p>
      </Popup>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('closes itself when used as a controlled component', () => {
    render(<ControlledPopup />);
    expect(screen.getByText('Pontos de vida')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Pontos de vida')).not.toBeInTheDocument();
  });

  it('renders tab and footer slots', () => {
    render(
      <Popup
        open
        onOpenChange={() => {}}
        title="Classe de Armadura"
        tabs={<div>tabs-slot</div>}
        footer={<button type="button">Salvar</button>}
      >
        <p>corpo</p>
      </Popup>,
    );
    expect(screen.getByText('tabs-slot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });
});
