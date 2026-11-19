import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import type { PortfolioCopy, ProfileData } from '../data/portfolioData';
import { APPLE_EASE, APPLE_SPRING_SNAPPY } from './MotionPrimitives';

interface NotFoundPageProps {
  profile: ProfileData;
  copy: PortfolioCopy['notFound'];
}

export function NotFoundPage({ profile, copy }: NotFoundPageProps) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#F5F5F7] text-[#1D1D1F] dark:bg-[#000000] dark:text-[#F5F5F7]">
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: APPLE_EASE }}
          >
            <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF]">
              {copy.eyebrow}
            </p>

            <p
              aria-hidden="true"
              className="mt-3 font-[var(--font-display)] text-[clamp(4.25rem,11vw,7rem)] font-bold leading-none tracking-[-0.04em] text-[#1D1D1F] tabular-nums dark:text-[#F5F5F7]"
            >
              404
            </p>

            <h1 className="text-balance mt-5 font-[var(--font-display)] text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-4xl dark:text-[#F5F5F7]">
              {copy.title}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#424245] dark:text-[#A1A1A6] dark:tracking-[0.01em]">
              {copy.description}
            </p>

            <p className="mt-5 text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
              <span>{copy.pathLabel}: </span>
              <code className="font-[var(--font-mono)] text-[#1D1D1F] dark:text-[#F5F5F7]">
                {location.pathname}
              </code>
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.015 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={APPLE_SPRING_SNAPPY}
              >
                <Link
                  to="/"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-6 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-150 hover:bg-[#0077ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.backHomeButton}</span>
                </Link>
              </motion.div>

              <Link
                to="/#projects"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0071E3] transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071E3] dark:text-[#2997FF]"
              >
                <span>{copy.viewProjectsButton}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-black/[0.06] py-6 text-center text-xs text-[#6E6E73] dark:border-white/[0.08] dark:text-[#A1A1A6]">
        <p>
          © <span className="tabular-nums">2026</span> {profile.name}
        </p>
      </footer>
    </div>
  );
}
