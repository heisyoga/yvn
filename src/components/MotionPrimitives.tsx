import type { ReactNode } from 'react';
import { motion, type Transition } from 'motion/react';

export const APPLE_EASE = [0.22, 1, 0.36, 1] as const;
export const APPLE_DECEL = [0.16, 1, 0.3, 1] as const;

export const APPLE_SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8
};

export const APPLE_SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 0.95
};

interface RevealBlockProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealBlock({
  children,
  delay = 0,
  className = ''
}: RevealBlockProps) {
  return (
    <motion.div
      data-reveal="true"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.6, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealCard({
  children,
  delay = 0,
  className = ''
}: RevealBlockProps) {
  return (
    <motion.div
      data-reveal="true"
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      whileHover={{ y: -3, transition: APPLE_SPRING_SNAPPY }}
      transition={{ duration: 0.55, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealDivider({ className = '' }: { className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.7, ease: APPLE_EASE }}
      className={`h-px w-full origin-left bg-black/[0.08] dark:bg-white/[0.10] ${className}`}
    />
  );
}

export function HeroMountBlock({
  children,
  delay = 0,
  className = ''
}: RevealBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroScaleBlock({
  children,
  delay = 0,
  className = ''
}: RevealBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.965 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
