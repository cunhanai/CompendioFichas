import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('renders bold text', () => {
    render(<Markdown>{'Causa **1d6** de dano.'}</Markdown>);
    const strong = screen.getByText('1d6');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders a GFM table', () => {
    render(<Markdown>{'| Nível | Dano |\n| --- | --- |\n| 1 | 1d4 |'}</Markdown>);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Nível')).toBeInTheDocument();
    expect(screen.getByText('1d4')).toBeInTheDocument();
  });

  it('turns a single line break into a visible line break, like whitespace-pre-wrap text used to', () => {
    const { container } = render(<Markdown>{'Linha um\nLinha dois'}</Markdown>);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });
});
