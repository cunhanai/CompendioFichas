/**
 * Parses a controlled `<input type="number">`'s raw text. A naive `Number(x) || 0` fallback
 * collapses the field back to "0" on the very first keystroke of a negative number — typing a
 * lone "-" parses to `NaN`, and `NaN || 0` is `0` — making it impossible to ever type one from
 * scratch. Returns `null` for that kind of in-progress, not-yet-a-real-number state (a lone "-",
 * or an emptied field); the caller should skip committing anything in that case and let the
 * browser keep showing exactly what was typed until it resolves into a real number.
 */
export function parseNumberInput(raw: string): number | null {
  const parsed = Number(raw);
  return raw !== '' && !Number.isNaN(parsed) ? parsed : null;
}
