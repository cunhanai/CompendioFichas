import { describe, expect, it } from 'vitest';
import { parseNumberInput } from './parseNumberInput';

describe('parseNumberInput', () => {
  it('returns null for a lone "-" (an in-progress negative number)', () => {
    expect(parseNumberInput('-')).toBeNull();
  });

  it('returns null for an emptied field', () => {
    expect(parseNumberInput('')).toBeNull();
  });

  it('parses a complete negative number', () => {
    expect(parseNumberInput('-5')).toBe(-5);
  });

  it('parses a complete positive number', () => {
    expect(parseNumberInput('42')).toBe(42);
  });

  it('parses zero', () => {
    expect(parseNumberInput('0')).toBe(0);
  });

  it('parses a decimal', () => {
    expect(parseNumberInput('1.5')).toBe(1.5);
  });
});
