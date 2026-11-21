import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCsrfToken,
  createSessionToken,
  decodeBase32,
  generateTotp,
  hashPassword,
  safeCompare,
  verifyCsrfToken,
  verifyPassword,
  verifySessionToken,
  verifyTotp
} from './adminAuth.ts';

test('safeCompare handles equal and unequal values with timing safety', () => {
  assert.equal(safeCompare('secret_value_123', 'secret_value_123'), true);
  assert.equal(safeCompare('secret_value_123', 'secret_value_999'), false);
  assert.equal(safeCompare('short', 'longer_string'), false);
});

test('hashPassword and verifyPassword work with scrypt', async () => {
  const hash = await hashPassword('MySuperSecretAdminPass123!');
  assert.match(hash, /^scrypt:[0-9a-f]+:[0-9a-f]+$/);
  assert.equal(await verifyPassword('MySuperSecretAdminPass123!', hash), true);
  assert.equal(await verifyPassword('WrongPassword', hash), false);
});

test('decodeBase32 decodes RFC 4648 base32 strings correctly', () => {
  const decoded = decodeBase32('JBSWY3DPEHPK3PXP');
  assert.equal(decoded.toString('hex'), '48656c6c6f21deadbeef');
});

test('TOTP generates and verifies with 6 digits and window tolerance', () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const now = 1700000000000;
  const token = generateTotp(secret, now);

  assert.equal(/^\d{6}$/.test(token), true);
  assert.equal(verifyTotp(secret, token, now), true);

  // Still valid within 30 seconds drift (±1 window)
  assert.equal(verifyTotp(secret, token, now + 25000), true);
  assert.equal(verifyTotp(secret, token, now - 25000), true);

  // Expired / invalid outside drift window
  assert.equal(verifyTotp(secret, token, now + 90000), false);
  assert.equal(verifyTotp(secret, '000000', now), false);
  assert.equal(generateTotp('!', now), '');
});

test('Session token creation and verification flow', () => {
  const secret = 'test-session-secret-key-at-least-32-chars-long';
  const token = createSessionToken(secret);

  const verified = verifySessionToken(token, secret);
  assert.notEqual(verified, null);
  assert.equal(verified?.role, 'admin');

  // Rejected with wrong secret or tampered token
  assert.equal(verifySessionToken(token, 'different-wrong-secret'), null);
  assert.equal(verifySessionToken(token + 'tampered', secret), null);
});

test('CSRF token creation and verification flow', () => {
  const secret = 'test-csrf-secret-key-32-chars-long-here';
  const sessionNonce = 'sample-session-nonce';
  const csrf = createCsrfToken(sessionNonce, secret);

  assert.equal(verifyCsrfToken(csrf, sessionNonce, secret), true);
  assert.equal(verifyCsrfToken(csrf, 'other-session-nonce', secret), false);
  assert.equal(verifyCsrfToken(csrf, sessionNonce, 'different-secret'), false);
  assert.equal(verifyCsrfToken('invalid.format', sessionNonce, secret), false);
});
