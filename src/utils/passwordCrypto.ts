export interface HashedPasswordRecord {
  algorithm: 'PBKDF2-SHA256';
  iterations: number;
  saltHex: string;
  hashHex: string;
}

const DEFAULT_ITERATIONS = 120000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const len = Math.floor(clean.length / 2);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derivePbkdf2Bits(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derived = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derived);
}

export async function hashAdminPassword(password: string): Promise<HashedPasswordRecord> {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  const hashBytes = await derivePbkdf2Bits(password, salt, DEFAULT_ITERATIONS);

  return {
    algorithm: 'PBKDF2-SHA256',
    iterations: DEFAULT_ITERATIONS,
    saltHex: bytesToHex(salt),
    hashHex: bytesToHex(hashBytes),
  };
}

export async function verifyAdminPassword(
  password: string,
  record: HashedPasswordRecord
): Promise<boolean> {
  const salt = hexToBytes(record.saltHex);
  const expected = hexToBytes(record.hashHex);
  const candidate = await derivePbkdf2Bits(password, salt, record.iterations || DEFAULT_ITERATIONS);

  if (candidate.length !== expected.length) return false;

  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= candidate[i] ^ expected[i];
  }
  return diff === 0;
}
