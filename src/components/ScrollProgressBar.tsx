import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { calculateScrollProgress } from '../utils/portfolioLogic';

export function ScrollProgressBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001
  });

  useEffect(() => {
    const updatePercent = () => {
      if (!trackRef.current) return;
      const ratio = calculateScrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      trackRef.current.setAttribute(
        'data-progress',
        String(Math.round(ratio * 100))
      );
    };

    updatePercent();
    window.addEventListener('scroll', updatePercent, { passive: true });
    window.addEventListener('resize', updatePercent, { passive: true });
    return () => {
      window.removeEventListener('scroll', updatePercent);
      window.removeEventListener('resize', updatePercent);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      data-testid="scroll-progress-track"
      data-progress="0"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <motion.div
        data-testid="scroll-progress-bar"
        className="h-full w-full origin-left bg-[#0071E3] dark:bg-[#2997FF]"
        style={{ scaleX }}
      />
    </div>
  );
}
