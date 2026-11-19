import type { ContactFormInput } from '../utils/portfolioLogic.ts';

export interface TelegramContactConfig {
  botToken: string;
  chatId: string;
  threadId?: string;
}

export function escapeTelegramHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    if (character === '"') return '&quot;';
    return '&#39;';
  });
}

function singleLine(value: string): string {
  return [...value]
    .map((character) =>
      character === String.fromCharCode(10) ||
      character === String.fromCharCode(13) ||
      character === String.fromCharCode(0x2028) ||
      character === String.fromCharCode(0x2029)
        ? ' '
        : character
    )
    .join('')
    .trim();
}

export function formatContactMessage(input: ContactFormInput): string {
  const safeLine = (value: string) => escapeTelegramHtml(singleLine(value));
  const prefix = [
    '<b>📬 New Portfolio Inquiry</b>',
    '',
    `<b>From:</b> ${safeLine(input.name)}`,
    `<b>Email:</b> ${safeLine(input.email)}`,
    `<b>Purpose:</b> ${safeLine(input.purpose)}`,
    `<b>Subject:</b> ${safeLine(input.subject)}`,
    '',
    '<b>Message:</b>',
    ''
  ].join('\n');
  const maxLength = 3900;
  const remaining = Math.max(0, maxLength - prefix.length);
  let escapedMessage = '';
  for (const character of input.message.trim()) {
    const escapedCharacter = escapeTelegramHtml(character);
    if (escapedMessage.length + escapedCharacter.length > remaining) break;
    escapedMessage += escapedCharacter;
  }
  return prefix + escapedMessage;
}

export async function sendTelegramContact(
  input: ContactFormInput,
  config: TelegramContactConfig
): Promise<void> {
  const threadId = config.threadId ? Number(config.threadId) : undefined;
  if (threadId !== undefined && (!Number.isSafeInteger(threadId) || threadId <= 0)) {
    throw new Error('Invalid Telegram thread ID configuration');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(config.botToken)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chat_id: config.chatId,
          text: formatContactMessage(input),
          parse_mode: 'HTML',
          ...(threadId !== undefined ? { message_thread_id: threadId } : {})
        })
      }
    );
    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean }
      | null;
    if (!response.ok || !result?.ok) {
      throw new Error('Telegram delivery failed');
    }
  } finally {
    clearTimeout(timeout);
  }
}
