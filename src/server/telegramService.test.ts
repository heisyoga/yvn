import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeTelegramHtml, formatContactMessage } from './telegramService.ts';

const inquiry = {
  name: 'A < B & C',
  email: 'person@example.com',
  purpose: 'Project inquiry',
  subject: 'Website < redesign >',
  message: 'Please help with A & B < C.'
};

test('escapeTelegramHtml escapes Telegram HTML delimiters', () => {
  assert.equal(escapeTelegramHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
});

test('formatContactMessage creates structured escaped HTML', () => {
  const message = formatContactMessage(inquiry);
  assert.match(message, /<b>📬 New Portfolio Inquiry<\/b>/);
  assert.ok(message.length <= 3900);
  assert.match(message, /A &lt; B &amp; C/);
  assert.match(message, /Website &lt; redesign &gt;/);
  assert.match(message, /Please help with A &amp; B &lt; C\./);
});

test('formatContactMessage caps output after entity escaping', () => {
  const message = formatContactMessage({ ...inquiry, message: '&<'.repeat(5000) });
  assert.ok(message.length <= 3900);
});

test('formatContactMessage keeps single-line fields on one line', () => {
  const message = formatContactMessage({ ...inquiry, name: 'Alice\n<b>Email:</b> spoofed@example.com' });
  assert.ok(message.includes('From:</b> Alice &lt;b&gt;Email:&lt;/b&gt; spoofed@example.com'));
});
