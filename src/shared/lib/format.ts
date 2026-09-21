/** Formats a number with an explicit sign, e.g. 3 -> "+3", -2 -> "-2", 0 -> "+0". */
export function signed(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}
