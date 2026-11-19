import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatChatAnswer } from './chatAnswerPresentation.ts';

describe('formatChatAnswer', () => {
  it('keeps plain prose in a paragraph block without changing its wording', () => {
    const answer = 'Adi Yoga studies Informatics at INSTIKI. He builds web projects.';

    assert.deepEqual(formatChatAnswer(answer), [
      { type: 'paragraph', text: answer }
    ]);
  });

  it('preserves explicit bullets as a structured list', () => {
    const answer = 'His stack includes:\n• React\n• TypeScript';

    assert.deepEqual(formatChatAnswer(answer), [
      { type: 'paragraph', text: 'His stack includes:' },
      { type: 'list', ordered: false, items: ['React', 'TypeScript'] }
    ]);
  });

  it('preserves numbered lists and blank-line paragraph breaks', () => {
    const answer = 'Selected projects:\n1. Mandha Ru Profile\n2. eVoting SKENSA\n\nAsk about the tech stack.';

    assert.deepEqual(formatChatAnswer(answer), [
      { type: 'paragraph', text: 'Selected projects:' },
      { type: 'list', ordered: true, items: ['Mandha Ru Profile', 'eVoting SKENSA'] },
      { type: 'paragraph', text: 'Ask about the tech stack.' }
    ]);
  });

  it('keeps empty input empty and does not discard punctuation or content', () => {
    assert.deepEqual(formatChatAnswer(''), []);
    assert.deepEqual(formatChatAnswer('Ask about Adi Yoga, projects, and contact.'), [
      { type: 'paragraph', text: 'Ask about Adi Yoga, projects, and contact.' }
    ]);
  });
});
