import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check, ChevronDown, Globe, Menu, Moon, Sun, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll
} from 'motion/react';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type Language, type PortfolioCopy } from '../data/portfolioData';
import type { ThemeMode } from '../utils/portfolioLogic';
import { APPLE_EASE, APPLE_SPRING_SNAPPY } from './MotionPrimitives';

interface NavbarProps {
  brandName: string;
  theme: ThemeMode;
  language: Language;
  copy: PortfolioCopy['nav'];
  isHome?: boolean;
  onNavigateHomeSection?: (href: string) => void;
  onToggleTheme: () => void;
  onSelectLanguage: (language: Language) => void;
}

export function Navbar({
  brandName,
  theme,
  language,
  copy,
  isHome = true,
  onNavigateHomeSection,
  onToggleTheme,
  onSelectLanguage
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const [activeHref, setActiveHref] = useState<string>('');
  const prefersReducedMotion = useReducedMotion();
  const scrollSpyLockUntilRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (!languageMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLanguageMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [languageMenuOpen]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 16;
    setIsScrolled((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (!isHome) {
      setActiveHref((prev) => (prev === '' ? prev : ''));
      return;
    }

    const computeActiveSection = () => {
      if (Date.now() < scrollSpyLockUntilRef.current) {
        return;
      }

      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setActiveHref((prev) => (prev === '' ? prev : ''));
        return;
      }

      const viewportBottom = currentScrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (viewportBottom >= docHeight - 36) {
        const lastHref = copy.links[copy.links.length - 1]?.href ?? '';
        setActiveHref((prev) => (prev === lastHref ? prev : lastHref));
        return;
      }

      const probeY = currentScrollY + 148;
      let matched = '';
      for (const link of copy.links) {
        const id = link.href.replace('#', '');
        const el = document.getElementById(id);
        if (!el) continue;
        const absoluteTop = el.getBoundingClientRect().top + currentScrollY;
        if (absoluteTop <= probeY) {
          matched = link.href;
        }
      }

      setActiveHref((prev) => (prev === matched ? prev : matched));
    };

    const onScrollOrResize = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        computeActiveSection();
      });
    };

    computeActiveSection();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [copy.links, isHome]);

  const scrollToHref = (href: string, delayMs = 0) => {
    const id = href.replace('#', '');
    const performScroll = () => {
      if (id === 'top' || id === '') {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        return;
      }
      const targetEl = document.getElementById(id);
      if (!targetEl) return;
      const navOffset = 68;
      const targetTop = Math.max(
        0,
        targetEl.getBoundingClientRect().top + window.scrollY - navOffset
      );
      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    };

    if (delayMs > 0) {
      window.setTimeout(performScroll, delayMs);
    } else {
      performScroll();
    }
  };

  const handleNavLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    fromMobile: boolean
  ) => {
    event.preventDefault();
    if (!isHome && onNavigateHomeSection) {
      setMobileMenuOpen(false);
      onNavigateHomeSection(href);
      return;
    }

    scrollSpyLockUntilRef.current = Date.now() + 850;
    setActiveHref(href);

    if (fromMobile) {
      setMobileMenuOpen(false);
      scrollToHref(href, 70);
    } else {
      scrollToHref(href, 0);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: APPLE_EASE }}
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
        isScrolled
          ? 'border-black/[0.10] bg-[#F5F5F7]/92 shadow-[0_6px_24px_rgba(0,0,0,0.04)] dark:border-white/[0.12] dark:bg-[#000000]/88 dark:shadow-[0_6px_24px_rgba(0,0,0,0.4)]'
          : 'border-black/[0.08] bg-[#F5F5F7]/85 dark:border-white/[0.10] dark:bg-[#000000]/80'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
        <motion.a
          href="#top"
          whileHover={{ opacity: 0.72 }}
          whileTap={{ scale: 0.96 }}
          transition={APPLE_SPRING_SNAPPY}
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            if (!isHome && onNavigateHomeSection) {
              onNavigateHomeSection('#top');
              return;
            }
            scrollSpyLockUntilRef.current = Date.now() + 850;
            setActiveHref('');
            scrollToHref('#top', 0);
          }}
          className="shrink-0 whitespace-nowrap font-[var(--font-display)] text-base font-semibold tracking-tight text-[#1D1D1F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071E3] dark:text-[#F5F5F7]"
        >
          {brandName}
        </motion.a>

        <nav
          aria-label={copy.ariaMain}
          className="hidden items-center gap-7 md:flex"
        >
          {copy.links.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <motion.a
                key={link.href}
                href={link.href}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => handleNavLinkClick(e, link.href, false)}
                className={`relative shrink-0 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071E3] ${
                  isActive
                    ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    aria-hidden="true"
                    transition={APPLE_SPRING_SNAPPY}
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#0071E3] dark:bg-[#2997FF]"
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div ref={languageMenuRef} className="relative">
            <motion.button
              type="button"
              aria-label={copy.switchLangLabel}
              aria-haspopup="listbox"
              aria-expanded={languageMenuOpen}
              aria-controls="language-menu-options"
              data-testid="language-toggle"
              onClick={() => setLanguageMenuOpen((open) => !open)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={APPLE_SPRING_SNAPPY}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 text-xs font-semibold text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
            >
              <Globe className="h-3.5 w-3.5 text-[#0071E3] dark:text-[#2997FF]" aria-hidden="true" />
              <span>{LANGUAGE_LABELS[language]}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-[#6E6E73] transition-transform dark:text-[#A1A1A6] ${languageMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {languageMenuOpen && (
                <motion.div
                  id="language-menu-options"
                  role="listbox"
                  aria-label={copy.switchLangLabel}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: APPLE_EASE }}
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-36 overflow-hidden rounded-xl border border-black/[0.08] bg-white/95 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[#1C1C1E]/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  {SUPPORTED_LANGUAGES.map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      role="option"
                      aria-selected={language === locale}
                      onClick={() => {
                        onSelectLanguage(locale);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex min-h-10 w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0071E3] dark:focus-visible:outline-[#2997FF] ${
                        language === locale
                          ? 'bg-[#F5F5F7] text-[#0071E3] dark:bg-[#2C2C2E] dark:text-[#2997FF]'
                          : 'text-[#1D1D1F] hover:bg-[#F5F5F7] dark:text-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                      }`}
                    >
                      <span>{LANGUAGE_LABELS[locale]}</span>
                      {language === locale && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? copy.enableLight : copy.enableDark}
            aria-pressed={theme === 'dark'}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 text-xs font-medium whitespace-nowrap shrink-0 text-[#1D1D1F] transition-colors duration-150 hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span
                  key="light"
                  initial={{ opacity: 0, rotate: -25, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 25, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: APPLE_EASE }}
                  className="inline-flex items-center gap-2"
                >
                  <Sun className="h-4 w-4 text-[#2997FF]" aria-hidden="true" />
                  <span className="hidden sm:inline">Light</span>
                </motion.span>
              ) : (
                <motion.span
                  key="dark"
                  initial={{ opacity: 0, rotate: -25, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 25, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: APPLE_EASE }}
                  className="inline-flex items-center gap-2"
                >
                  <Moon className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
                  <span className="hidden sm:inline">Dark</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? copy.closeMenu : copy.openMenu}
            whileTap={{ scale: 0.92 }}
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] md:hidden dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-navigation-drawer"
            aria-label={copy.ariaMobile}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: APPLE_EASE }}
            className="overflow-hidden border-t border-black/[0.06] bg-white/95 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-[#161618]/95"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {copy.links.map((link, idx) => {
                const isActive = activeHref === link.href;
                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href, true)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: idx * 0.03,
                      ease: APPLE_EASE
                    }}
                    className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/15 dark:text-[#2997FF]'
                        : 'text-[#1D1D1F] hover:bg-[#F5F5F7] dark:text-[#F5F5F7] dark:hover:bg-[#232326]'
                    }`}
                  >
                    <span>{link.label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
