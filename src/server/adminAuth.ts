import crypto from 'node:crypto';
const scrypt = (password: string, salt: string, keylen: number, options: crypto.ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

export interface AdminCredentialsConfig {
  passwordHash?: string;
  totpSecret?: string;
  sessionSecret?: string;
}

export interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
  nonce: string;
}

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Timing-safe string comparison.
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash a plain password with scrypt.
 * Format: scrypt:<salt-hex>:<derived-key-hex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}

/**
 * Verify a plain password against a salted scrypt hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  if (!/^[0-9a-f]{32}$/i.test(salt) || !/^[0-9a-f]{128}$/i.test(expectedHex)) return false;
  try {
    const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }) as Buffer;
    return safeCompare(derived.toString('hex'), expectedHex.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Base32 decode for RFC 6238 TOTP secrets.
 */
export function decodeBase32(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[\s=-]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generate standard RFC 6238 TOTP code (HMAC-SHA1, 6 digits, 30s step).
 */
export function generateTotp(secret: string, timestamp = Date.now(), timeStepSec = 30): string {
  const key = decodeBase32(secret);
  if (key.length === 0) return '';

  const counter = Math.floor(timestamp / 1000 / timeStepSec);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (binary % 1_000_000).toString().padStart(6, '0');
  return code;
}

/**
 * Verify TOTP token with a ±1 time step tolerance (prevents minor drift issues).
 */
export function verifyTotp(
  secret: string,
  token: string,
  timestamp = Date.now(),
  timeStepSec = 30
): boolean {
  if (!token || !secret) return false;
  const normalizedToken = token.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalizedToken)) return false;

  const currentWindow = Math.floor(timestamp / 1000 / timeStepSec);
  for (let delta = -1; delta <= 1; delta++) {
    const testTs = (currentWindow + delta) * timeStepSec * 1000;
    const expected = generateTotp(secret, testTs, timeStepSec);
    if (safeCompare(expected, normalizedToken)) {
      return true;
    }
  }
  return false;
}

/**
 * Create HMAC-SHA256 signed stateless session token.
 */
export function createSessionToken(secret: string): string {
  const payload: SessionPayload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(16).toString('hex')
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token: string | undefined, secret: string): SessionPayload | null {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as SessionPayload;

    if (parsed.role !== 'admin' || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Generate CSRF token and its verification tag.
 */
export function createCsrfToken(sessionNonce: string, secret: string): string {
  const issuedAt = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const payload = `${sessionNonce}.${issuedAt}.${random}`;
  const tag = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${issuedAt}.${random}.${tag}`;
}

export function verifyCsrfToken(token: string | undefined, sessionNonce: string, secret: string): boolean {
  if (!token || !sessionNonce || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAtRaw, random, tag] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isSafeInteger(issuedAt) || Date.now() - issuedAt > 2 * 60 * 60 * 1000 || issuedAt > Date.now()) {
    return false;
  }
  const payload = `${sessionNonce}.${issuedAtRaw}.${random}`;
  const expectedTag = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return safeCompare(tag, expectedTag);
}
