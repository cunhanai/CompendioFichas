import { randomInt } from 'node:crypto';

/** Unambiguous alphanumeric set — no 0/O/1/l/I to avoid transcription mistakes. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

/** Cryptographically random temporary password, shown once and never stored in plaintext. */
export function generateTempPassword(length = 14): string {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += ALPHABET[randomInt(ALPHABET.length)];
  }
  return password;
}
