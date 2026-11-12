import { describe, it, expect } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { getClientIp } from './request.js';

function fakeRequest(headers: Record<string, string | string[] | undefined>): VercelRequest {
  return {
    headers,
    socket: { remoteAddress: '203.0.113.9' },
  } as unknown as VercelRequest;
}

describe('getClientIp', () => {
  it('uses the last entry, not the first — the first is whatever the client sent', () => {
    // A client can send its own X-Forwarded-For; Vercel's edge appends the real connecting IP
    // rather than replacing it, so the trustworthy value is the last one, not the first. Before
    // this fix, getClientIp returned the attacker-controlled first entry, letting anyone defeat
    // the per-IP login rate limiter by sending a different fake value on every attempt.
    const req = fakeRequest({ 'x-forwarded-for': '6.6.6.6, 203.0.113.42' });
    expect(getClientIp(req)).toBe('203.0.113.42');
  });

  it('trims whitespace around the last entry', () => {
    const req = fakeRequest({ 'x-forwarded-for': '6.6.6.6,  203.0.113.42  ' });
    expect(getClientIp(req)).toBe('203.0.113.42');
  });

  it('handles a single-entry header the same as before', () => {
    const req = fakeRequest({ 'x-forwarded-for': '203.0.113.42' });
    expect(getClientIp(req)).toBe('203.0.113.42');
  });

  it('falls back to the socket address when the header is absent', () => {
    const req = fakeRequest({});
    expect(getClientIp(req)).toBe('203.0.113.9');
  });
});
