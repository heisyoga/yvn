import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, CheckCircle2, ChevronDown, Github, Instagram, Linkedin, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Language, PortfolioCopy, ProfileData } from '../data/portfolioData.ts';
import {
  validateContactForm,
  type ContactFormInput
} from '../utils/portfolioLogic.ts';
import {
  APPLE_EASE,
  APPLE_SPRING_SNAPPY,
  RevealBlock,
  RevealDivider
} from './MotionPrimitives.tsx';

interface ContactFooterProps {
  profile: ProfileData;
  language: Language;
  copy: PortfolioCopy['contact'];
}

export function ContactFooter({
  profile,
  language,
  copy
}: ContactFooterProps) {
  const [formState, setFormState] = useState<ContactFormInput>({
    name: '',
    email: '',
    purpose: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormInput, string>>
  >({});
  const [submittedData, setSubmittedData] = useState<ContactFormInput | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<'general' | 'rateLimit' | null>(null);
  const [purposeMenuOpen, setPurposeMenuOpen] = useState(false);
  const purposeMenuRef = useRef<HTMLDivElement>(null);
  const purposeTriggerRef = useRef<HTMLButtonElement>(null);
  const successStatusRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const purposeOptions = copy.purposeOptions;
  const selectedPurposeLabel = purposeOptions.find((option) => option.value === formState.purpose)?.label ?? '';
  const resolvedPurpose = selectedPurposeLabel;

  useEffect(() => {
    if (!purposeMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!purposeMenuRef.current?.contains(event.target as Node)) {
        setPurposeMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPurposeMenuOpen(false);
        purposeTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [purposeMenuOpen]);

  useEffect(() => {
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const revalidated = validateContactForm({ ...formState, purpose: resolvedPurpose }, language);
      const next: Partial<Record<keyof ContactFormInput, string>> = {};
      if (prev.name && revalidated.errors.name) next.name = revalidated.errors.name;
      if (prev.email && revalidated.errors.email)
        next.email = revalidated.errors.email;
      if (prev.purpose && revalidated.errors.purpose)
        next.purpose = revalidated.errors.purpose;
      if (prev.subject && revalidated.errors.subject)
        next.subject = revalidated.errors.subject;
      if (prev.message && revalidated.errors.message)
        next.message = revalidated.errors.message;
      return next;
    });
  }, [language, formState, resolvedPurpose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const validation = validateContactForm({ ...formState, purpose: resolvedPurpose }, language);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);
    const submission: ContactFormInput = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      purpose: resolvedPurpose,
      subject: formState.subject.trim(),
      message: formState.message.trim()
    };
    try {
      const website = new FormData(event.currentTarget).get('website');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submission, website })
      });
      if (!response.ok) {
        setSubmitError(response.status === 429 ? 'rateLimit' : 'general');
        return;
      }
      setSubmittedData(submission);
      setFormState({ name: '', email: '', purpose: '', subject: '', message: '' });
      requestAnimationFrame(() => successStatusRef.current?.focus());
    } catch {
      setSubmitError('general');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSocialIcon = (platform: 'LinkedIn' | 'GitHub' | 'Instagram') => {
    switch (platform) {
      case 'LinkedIn':
        return <Linkedin className="h-4 w-4" aria-hidden="true" />;
      case 'GitHub':
        return <Github className="h-4 w-4" aria-hidden="true" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <footer
      id="contact"
      className="border-t border-black/[0.06] bg-[#F5F5F7] py-20 md:py-28 dark:border-white/[0.08] dark:bg-[#000000]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <RevealBlock className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF]">
                {copy.kicker}
              </p>
              <h2 className="text-balance mt-2 text-3xl font-bold tracking-tight text-[#1D1D1F] sm:text-4xl dark:text-[#F5F5F7]">
                {copy.heading}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#424245] dark:text-[#A1A1A6] dark:tracking-[0.01em]">
                {copy.closing}
              </p>

              <div className="mt-6 text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                <span>{copy.directEmail} </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-medium text-[#1D1D1F] underline underline-offset-4 transition-colors hover:text-[#0071E3] dark:text-[#F5F5F7] dark:hover:text-[#2997FF]"
                >
                  {profile.email}
                </a>
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-3 text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                {copy.socialHeading}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {profile.socials.map((social) => (
                  <motion.a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${copy.visitSocialPrefix} ${social.platform} ${profile.name}`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={APPLE_SPRING_SNAPPY}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold whitespace-nowrap text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                  >
                    {renderSocialIcon(social.platform)}
                    <span>{social.platform}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </RevealBlock>

          <RevealBlock delay={0.08} className="lg:col-span-7">
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 dark:border-white/[0.10] dark:bg-[#161618]">
              <AnimatePresence mode="wait" initial={false}>
                {submittedData ? (
                  <motion.div
                    key="submitted"
                    role="status"
                    ref={successStatusRef}
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: APPLE_EASE }}
                    className="space-y-4 py-4"
                  >
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={APPLE_SPRING_SNAPPY}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/15 dark:text-[#2997FF]"
                    >
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {copy.successTitle}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#424245] dark:text-[#A1A1A6]">
                      {copy.successBodyLead}{' '}
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {submittedData.name}
                      </span>
                      . {copy.successBodyMid}{' '}
                      <span className="font-mono text-xs">
                        {submittedData.email}
                      </span>{' '}
                      {copy.successBodyEnd}
                    </p>
                    <div className="space-y-2 rounded-xl border border-black/[0.06] bg-[#F5F5F7] p-4 text-sm text-[#424245] dark:border-white/[0.08] dark:bg-[#0B0B0D] dark:text-[#A1A1A6]">
                      <p className="text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                        {submittedData.purpose} · {submittedData.subject}
                      </p>
                      <p>“{submittedData.message}”</p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setSubmittedData(null);
                        requestAnimationFrame(() => nameInputRef.current?.focus());
                      }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={APPLE_SPRING_SNAPPY}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black/[0.10] bg-[#F5F5F7] px-5 py-2 text-sm font-semibold text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] dark:border-white/[0.12] dark:bg-[#232326] dark:text-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                    >
                      {copy.sendAnother}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: APPLE_EASE }}
                    className="space-y-5"
                  >
                    <div aria-hidden="true" className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="contact-website">Website</label>
                      <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    {submitError && (
                      <p role="alert" className="rounded-xl border border-[#D70015]/20 bg-[#D70015]/5 px-4 py-3 text-sm text-[#D70015] dark:border-[#FF6961]/20 dark:bg-[#FF6961]/10 dark:text-[#FF6961]">
                        {submitError === 'rateLimit' ? copy.rateLimitError : copy.submitError}{' '}
                        <a href={`mailto:${profile.email}`} className="font-semibold underline underline-offset-2">{profile.email}</a>
                      </p>
                    )}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {copy.nameLabel}
                      </label>
                      <input
                        id="contact-name"
                        ref={nameInputRef}
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={(e) => {
                          setSubmitError(null);
                          setFormState((prev) => ({
                            ...prev,
                            name: e.target.value
                          }));
                          if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                        placeholder={copy.namePlaceholder}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'error-name' : undefined}
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] transition-colors focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/[0.14] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:placeholder-[#6E6E73] dark:focus:border-[#2997FF] dark:focus:bg-[#161618]"
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            id="error-name"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: APPLE_EASE }}
                            className="mt-1.5 text-xs font-medium text-[#D70015] dark:text-[#FF6961]"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {copy.emailLabel}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={(e) => {
                          setSubmitError(null);
                          setFormState((prev) => ({
                            ...prev,
                            email: e.target.value
                          }));
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder={copy.emailPlaceholder}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'error-email' : undefined}
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] transition-colors focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/[0.14] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:placeholder-[#6E6E73] dark:focus:border-[#2997FF] dark:focus:bg-[#161618]"
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            id="error-email"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: APPLE_EASE }}
                            className="mt-1.5 text-xs font-medium text-[#D70015] dark:text-[#FF6961]"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-purpose"
                        className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {copy.purposeLabel}
                      </label>
                      <div ref={purposeMenuRef} className="relative mt-1.5">
                      <input type="hidden" name="purpose" value={formState.purpose} />
                        <button
                          id="contact-purpose"
                          ref={purposeTriggerRef}
                          type="button"
                          role="combobox"
                          aria-label={copy.purposeLabel}
                          aria-haspopup="listbox"
                          aria-expanded={purposeMenuOpen}
                          aria-controls="contact-purpose-options"
                          aria-invalid={Boolean(errors.purpose)}
                          aria-describedby={errors.purpose ? 'error-purpose' : undefined}
                          onClick={() => setPurposeMenuOpen((open) => !open)}
                          className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-2.5 text-left text-sm text-[#1D1D1F] transition-colors hover:border-black/[0.18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.14] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:hover:border-white/[0.22] dark:focus-visible:outline-[#2997FF]"
                        >
                          <span className={formState.purpose ? '' : 'text-[#6E6E73] dark:text-[#8E8E93]'}>
                            {selectedPurposeLabel || copy.purposePlaceholder}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-[#6E6E73] transition-transform dark:text-[#A1A1A6] ${purposeMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        <AnimatePresence>
                          {purposeMenuOpen && (
                            <motion.div
                              id="contact-purpose-options"
                              role="listbox"
                              aria-label={copy.purposeLabel}
                              initial={{ opacity: 0, y: -6, scale: 0.99 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.99 }}
                              transition={{ duration: 0.16, ease: APPLE_EASE }}
                              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-black/[0.08] bg-white/95 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[#1C1C1E]/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                            >
                              {purposeOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  role="option"
                                  aria-selected={formState.purpose === option.value}
                                  onClick={() => {
                                    setSubmitError(null);
                                    setFormState((prev) => ({ ...prev, purpose: option.value }));
                                    if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: undefined }));
                                    setPurposeMenuOpen(false);
                                  }}
                                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0071E3] dark:focus-visible:outline-[#2997FF] ${
                                    formState.purpose === option.value
                                      ? 'bg-[#F5F5F7] font-medium text-[#0071E3] dark:bg-[#2C2C2E] dark:text-[#2997FF]'
                                      : 'text-[#1D1D1F] hover:bg-[#F5F5F7] dark:text-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {formState.purpose === option.value && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <AnimatePresence>
                        {errors.purpose && (
                          <motion.p
                            id="error-purpose"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: APPLE_EASE }}
                            className="mt-1.5 text-xs font-medium text-[#D70015] dark:text-[#FF6961]"
                          >
                            {errors.purpose}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {copy.subjectLabel}
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={formState.subject}
                        onChange={(e) => {
                          setSubmitError(null);
                          setFormState((prev) => ({ ...prev, subject: e.target.value }));
                          if (errors.subject) {
                            setErrors((prev) => ({ ...prev, subject: undefined }));
                          }
                        }}
                        placeholder={copy.subjectPlaceholder}
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? 'error-subject' : undefined}
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1D1D1F] placeholder-[#6E6E73] transition-colors focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/[0.14] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:placeholder-[#6E6E73] dark:focus:border-[#2997FF] dark:focus:bg-[#161618]"
                      />
                      <AnimatePresence>
                        {errors.subject && (
                          <motion.p
                            id="error-subject"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: APPLE_EASE }}
                            className="mt-1.5 text-xs font-medium text-[#D70015] dark:text-[#FF6961]"
                          >
                            {errors.subject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {copy.messageLabel}
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        value={formState.message}
                        onChange={(e) => {
                          setSubmitError(null);
                          setFormState((prev) => ({
                            ...prev,
                            message: e.target.value
                          }));
                          if (errors.message) {
                            setErrors((prev) => ({
                              ...prev,
                              message: undefined
                            }));
                          }
                        }}
                        placeholder={copy.messagePlaceholder}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={
                          errors.message ? 'error-message' : undefined
                        }
                        className="mt-1.5 w-full rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-3 text-sm text-[#1D1D1F] placeholder-[#6E6E73] transition-colors focus:border-[#0071E3] focus:bg-white focus:outline-none dark:border-white/[0.14] dark:bg-[#0B0B0D] dark:text-[#F5F5F7] dark:placeholder-[#6E6E73] dark:focus:border-[#2997FF] dark:focus:bg-[#161618]"
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.p
                            id="error-message"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: APPLE_EASE }}
                            className="mt-1.5 text-xs font-medium text-[#D70015] dark:text-[#FF6961]"
                          >
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={isSubmitting ? undefined : { y: -1.5, scale: 1.015 }}
                      whileTap={{ scale: 0.97 }}
                      transition={APPLE_SPRING_SNAPPY}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0077ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] sm:w-auto dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                    >
                      <Send className={`h-4 w-4 ${isSubmitting ? 'animate-pulse' : ''}`} aria-hidden="true" />
                      <span>{isSubmitting ? copy.sendingButton : copy.submitButton}</span>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </RevealBlock>
        </div>

        <RevealDivider className="mt-16" />

        <RevealBlock
          delay={0.05}
          className="mt-8 flex items-center justify-center text-xs text-[#6E6E73] dark:text-[#A1A1A6]"
        >
          <p>
            © <span className="tabular-nums">2026</span> {profile.name}
          </p>
        </RevealBlock>
      </div>
    </footer>
  );
}
