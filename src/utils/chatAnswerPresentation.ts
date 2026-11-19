export type ChatAnswerBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

const LIST_ITEM_PATTERN = /^\s*(?:([-*•])\s+|(\d+)[.)]\s+)(.+?)\s*$/;

/** Formats the existing answer string for display without changing its wording. */
export function formatChatAnswer(answer: string): ChatAnswerBlock[] {
  const blocks: ChatAnswerBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listOrdered: boolean | null = null;

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length && listOrdered !== null) {
      blocks.push({ type: 'list', ordered: listOrdered, items: listItems });
    }
    listItems = [];
    listOrdered = null;
  };

  for (const line of answer.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const match = trimmed.match(LIST_ITEM_PATTERN);
    if (match) {
      flushParagraph();
      const ordered = Boolean(match[2]);
      if (listOrdered !== null && listOrdered !== ordered) flushList();
      listOrdered = ordered;
      listItems.push(match[3].trim());
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}
