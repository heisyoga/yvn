import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode
} from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  X
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Language, PortfolioCopy } from '../data/portfolioData.ts';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  sanitizeSuggestedSection,
  type ChatHistoryTurn,
  type ChatSectionHref
} from '../utils/chatDomain.ts';
import { formatChatAnswer } from '../utils/chatAnswerPresentation.ts';
import { APPLE_EASE, APPLE_SPRING_SNAPPY } from './MotionPrimitives.tsx';

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inScope: boolean;
  answerBlocks?: ReturnType<typeof formatChatAnswer>;
  suggestedSection?: ChatSectionHref | '';
  followUpPrompts?: string[];
}

interface PortfolioChatbotProps {
  language: Language;
  copy: PortfolioCopy['chatbot'];
  onNavigateSection: (href: ChatSectionHref) => void;
  leadingAccessory?: ReactNode;
}

export function PortfolioChatbot({
  language,
  copy,
  onNavigateSection,
  leadingAccessory
}: PortfolioChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [messages, isLoading, errorMessage, prefersReducedMotion]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      inScope: true
    };

    const historySnapshot: ChatHistoryTurn[] = messages
      .filter((m) => m.inScope)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setErrorMessage(null);
    setLastFailedPrompt(null);
    setIsLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 26000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          language,
          history: historySnapshot
        })
      });

      const responseText = await response.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Proxies and serverless platforms may return plain-text error pages.
      }
      const data =
        typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;

      if (
        !response.ok ||
        !data ||
        typeof data.answer !== 'string' ||
        !data.answer.trim()
      ) {
        const serverError = typeof data?.error === 'string' ? data.error : null;
        throw new Error(serverError || copy.errorFallback);
      }

      const assistantMsg: ChatMessageItem = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        inScope: data.inScope === true,
        answerBlocks: formatChatAnswer(data.answer),
        suggestedSection:
          typeof data.suggestedSection === 'string'
            ? sanitizeSuggestedSection(data.suggestedSection)
            : '',
        followUpPrompts: Array.isArray(data.followUpPrompts)
          ? data.followUpPrompts
              .filter((prompt): prompt is string => typeof prompt === 'string')
              .slice(0, 3)
          : []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (abortControllerRef.current === controller) {
          setErrorMessage(copy.errorFallback);
          setLastFailedPrompt(trimmed);
        }
      } else {
        setErrorMessage(
          err instanceof Error && err.message ? err.message : copy.errorFallback
        );
        setLastFailedPrompt(trimmed);
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(inputValue);
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setMessages([]);
    setErrorMessage(null);
    setLastFailedPrompt(null);
    setInputValue('');
    inputRef.current?.focus();
  };

  const latestAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.id;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="portfolio-chatbot-sheet"
            id="portfolio-chatbot-dialog"
            role="dialog"
            aria-label={copy.title}
            data-testid="chatbot-dialog"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.97 }
            }
            transition={{ duration: 0.24, ease: APPLE_EASE }}
            className="fixed right-4 bottom-20 z-40 flex max-h-[min(560px,calc(100vh-7.25rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/95 shadow-[0_24px_64px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:right-8 sm:bottom-22 sm:w-[400px] dark:border-white/[0.12] dark:bg-[#161618]/95 dark:shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
              <div className="min-w-0">
                <h2 className="truncate font-[var(--font-display)] text-sm font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {copy.title}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    aria-label={copy.resetLabel}
                    title={copy.resetLabel}
                    data-testid="chatbot-reset"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6E6E73] transition-colors hover:bg-black/[0.05] hover:text-[#1D1D1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:text-[#A1A1A6] dark:hover:bg-white/[0.08] dark:hover:text-[#F5F5F7]"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={copy.closeLabel}
                  data-testid="chatbot-close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6E6E73] transition-colors hover:bg-black/[0.05] hover:text-[#1D1D1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:text-[#A1A1A6] dark:hover:bg-white/[0.08] dark:hover:text-[#F5F5F7]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-[#F5F5F7] px-4 py-3 text-[13.5px] leading-relaxed text-[#1D1D1F] dark:bg-[#232326] dark:text-[#F5F5F7]">
                {copy.welcomeMessage}
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {copy.starterQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void sendMessage(question)}
                      className="min-h-[36px] max-w-full rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-left text-xs font-medium text-[#1D1D1F] transition-colors hover:border-[#0071E3]/40 hover:bg-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.10] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:hover:border-[#2997FF]/50 dark:hover:bg-[#1F1F23]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const sectionLabel =
                  msg.suggestedSection &&
                  copy.sectionLabels[msg.suggestedSection];
                const showFollowUps =
                  !isUser &&
                  msg.id === latestAssistantId &&
                  !isLoading &&
                  msg.followUpPrompts &&
                  msg.followUpPrompts.length > 0;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      data-testid={
                        isUser
                          ? 'chat-message-user'
                          : msg.inScope
                            ? 'chat-message-assistant'
                            : 'chat-message-blocked'
                      }
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                        isUser
                          ? 'rounded-br-md bg-[#0071E3] text-white dark:bg-[#2997FF] dark:text-[#000000]'
                          : 'rounded-bl-md bg-[#F5F5F7] text-[#1D1D1F] dark:bg-[#232326] dark:text-[#F5F5F7]'
                      }`}
                    >
                      {!isUser && !msg.inScope && (
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                          <ShieldAlert
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{copy.outOfScopeBadge}</span>
                        </div>
                      )}

                      {!isUser ? (
                        <div className="space-y-2.5">
                          {msg.answerBlocks?.map((block, index) =>
                            block.type === 'paragraph' ? (
                              <p key={`paragraph-${index}`}>{block.text}</p>
                            ) : block.ordered ? (
                              <ol
                                key={`list-${index}`}
                                className="list-decimal space-y-1 pl-5 marker:text-[#6E6E73] dark:marker:text-[#A1A1A6]"
                              >
                                {block.items.map((item, itemIndex) => (
                                  <li key={`item-${itemIndex}`}>{item}</li>
                                ))}
                              </ol>
                            ) : (
                              <ul
                                key={`list-${index}`}
                                className="list-disc space-y-1 pl-5 marker:text-[#6E6E73] dark:marker:text-[#A1A1A6]"
                              >
                                {block.items.map((item, itemIndex) => (
                                  <li key={`item-${itemIndex}`}>{item}</li>
                                ))}
                              </ul>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{msg.content}</p>
                      )}

                      {!isUser && msg.suggestedSection && sectionLabel && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateSection(msg.suggestedSection as ChatSectionHref);
                            if (window.innerWidth < 640) {
                              setIsOpen(false);
                            }
                          }}
                          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-[#0071E3] transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:text-[#2997FF]"
                        >
                          <span>{sectionLabel}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {showFollowUps && (
                      <div className="mt-2 flex max-w-[92%] flex-wrap gap-1.5">
                        {msg.followUpPrompts!.map((followUp) => (
                          <button
                            key={followUp}
                            type="button"
                            onClick={() => void sendMessage(followUp)}
                            className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-left text-[11.5px] font-medium text-[#424245] transition-colors hover:border-[#0071E3]/40 hover:text-[#1D1D1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.10] dark:bg-[#0B0B0D] dark:text-[#A1A1A6] dark:hover:border-[#2997FF]/45 dark:hover:text-[#F5F5F7]"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div
                  role="status"
                  aria-label={copy.thinkingLabel}
                  className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-[#F5F5F7] px-4 py-3 text-xs text-[#6E6E73] dark:bg-[#232326] dark:text-[#A1A1A6]"
                >
                  <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6E6E73] dark:bg-[#A1A1A6]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6E6E73] [animation-delay:150ms] dark:bg-[#A1A1A6]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6E6E73] [animation-delay:300ms] dark:bg-[#A1A1A6]" />
                  </span>
                  <span aria-live="polite">{copy.thinkingLabel}</span>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#D70015]/20 bg-[#D70015]/[0.06] px-3.5 py-2.5 text-xs text-[#D70015] dark:border-[#FF6961]/25 dark:bg-[#FF6961]/10 dark:text-[#FF6961]"
                >
                  <p>{errorMessage}</p>
                  {lastFailedPrompt && (
                    <button
                      type="button"
                      onClick={() => void sendMessage(lastFailedPrompt)}
                      className="mt-1.5 font-semibold underline underline-offset-2"
                    >
                      {copy.retryLabel}
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-black/[0.06] bg-white/80 p-3 dark:border-white/[0.08] dark:bg-[#161618]/80"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-black/[0.10] bg-[#F5F5F7] pr-1.5 pl-3.5 transition-colors focus-within:border-[#0071E3] focus-within:bg-white dark:border-white/[0.12] dark:bg-[#0B0B0D] dark:focus-within:border-[#2997FF] dark:focus-within:bg-[#1C1C1E]">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={MAX_CHAT_MESSAGE_LENGTH}
                  placeholder={copy.placeholder}
                  aria-label={copy.placeholder}
                  data-testid="chatbot-input"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none dark:text-[#F5F5F7] dark:placeholder-[#8E8E93]"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label={copy.sendLabel}
                  data-testid="chatbot-send"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-white transition-all hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF] dark:disabled:bg-white/15 dark:disabled:text-white/40"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="fixed right-5 bottom-6 z-30 flex items-center gap-2.5 sm:right-8 sm:bottom-8">
        {leadingAccessory}

        <motion.button
          type="button"
          data-testid="chatbot-launcher"
          aria-expanded={isOpen}
          aria-controls="portfolio-chatbot-dialog"
          aria-label={isOpen ? copy.closeLabel : copy.title}
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.03 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          transition={APPLE_SPRING_SNAPPY}
          className={`inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold whitespace-nowrap backdrop-blur-xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
            isOpen
              ? 'border-[#0071E3] bg-[#0071E3] text-white shadow-[0_8px_24px_rgba(0,113,227,0.3)] dark:border-[#2997FF] dark:bg-[#2997FF] dark:text-[#000000]'
              : 'border-black/[0.08] bg-white/92 text-[#1D1D1F] shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#0071E3]/30 hover:bg-white hover:text-[#0071E3] dark:border-white/[0.14] dark:bg-[#1C1C1E]/92 dark:text-[#F5F5F7] dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)] dark:hover:border-[#2997FF]/40 dark:hover:bg-[#2C2C2E] dark:hover:text-[#2997FF]'
          }`}
        >
          {isOpen ? (
            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{copy.openLabel}</span>
        </motion.button>
      </div>
    </>
  );
}
