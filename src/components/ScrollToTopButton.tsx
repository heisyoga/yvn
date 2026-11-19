import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { PortfolioCopy } from '../data/portfolioData';
import { hasScrolledPastHero } from '../utils/portfolioLogic';
import { APPLE_EASE, APPLE_SPRING_SNAPPY } from './MotionPrimitives';

interface ScrollToTopButtonProps {
  copy: PortfolioCopy['scrollToTop'];
  heroId?: string;
  floating?: boolean;
}

export function ScrollToTopButton({
  copy,
  heroId = 'top',
  floating = true
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const evaluateVisibility = () => {
      const heroEl = document.getElementById(heroId);
      if (!heroEl) {
        setIsVisible((prev) => (prev ? false : prev));
        return;
      }
      const next = hasScrolledPastHero(heroEl.getBoundingClientRect().bottom, 68);
      setIsVisible((prev) => (prev === next ? prev : next));
    };

    const scheduleCheck = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        evaluateVisibility();
      });
    };

    evaluateVisibility();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [heroId]);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  const positionClass = floating
    ? 'fixed right-5 bottom-6 z-30 sm:right-8 sm:bottom-8'
    : 'relative';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top-button"
          type="button"
          data-testid="scroll-to-top"
          aria-label={copy.ariaLabel}
          title={copy.title}
          onClick={handleScrollToTop}
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }
          }
          transition={{ duration: 0.24, ease: APPLE_EASE }}
          whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          className={`${positionClass} inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-black/[0.08] bg-white/90 text-[#1D1D1F] shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors duration-150 hover:border-[#0071E3]/30 hover:bg-white hover:text-[#0071E3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.14] dark:bg-[#1C1C1E]/90 dark:text-[#F5F5F7] dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)] dark:hover:border-[#2997FF]/40 dark:hover:bg-[#2C2C2E] dark:hover:text-[#2997FF]`}
        >
          <motion.span
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex items-center justify-center"
          >
            <ArrowUp className="h-4.5 w-4.5" aria-hidden="true" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
