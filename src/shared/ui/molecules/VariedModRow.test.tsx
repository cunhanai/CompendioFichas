import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { VariedModRowEdit } from './VariedModRow';

describe('VariedModRowEdit', () => {
  it('does not collapse to 0 while a negative number is still being typed', () => {
    const onValueChange = vi.fn();
    render(
      <VariedModRowEdit
        label="Furtividade"
        value={0}
        onLabelChange={() => {}}
        onValueChange={onValueChange}
        onRemove={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText('+0');

    // Typing a lone "-" is an incomplete number (Number("-") is NaN) — it must not be committed
    // as 0, or the field would snap back and the user could never finish typing "-5".
    fireEvent.change(input, { target: { value: '-' } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '-5' } });
    expect(onValueChange).toHaveBeenCalledWith(-5);
  });

  it('commits a positive value as soon as it parses', () => {
    const onValueChange = vi.fn();
    render(
      <VariedModRowEdit
        label="Furtividade"
        value={0}
        onLabelChange={() => {}}
        onValueChange={onValueChange}
        onRemove={() => {}}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('+0'), { target: { value: '3' } });
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it('does not force the field back to 0 while it is cleared out', () => {
    const onValueChange = vi.fn();
    render(
      <VariedModRowEdit
        label="Furtividade"
        value={5}
        onLabelChange={() => {}}
        onValueChange={onValueChange}
        onRemove={() => {}}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('+0'), { target: { value: '' } });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
