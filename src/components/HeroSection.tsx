import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, Check, Download } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform
} from 'motion/react';
import type { PortfolioCopy, ProfileData } from '../data/portfolioData';
import {
  APPLE_EASE,
  APPLE_SPRING_SNAPPY,
  HeroMountBlock,
  HeroScaleBlock
} from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  profile: ProfileData;
  copy: PortfolioCopy['hero'];
  onDownloadCv: () => void;
  cvDownloaded: boolean;
}

export function HeroSection({
  profile,
  copy,
  onDownloadCv,
  cvDownloaded
}: HeroSectionProps) {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const portraitRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ['start end', 'end start']
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveRoleIndex((prev) => (prev + 1) % profile.roles.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [profile.roles.length, prefersReducedMotion]);

  return (
    <section
      id="top"
      className="border-b border-black/[0.06] bg-white pb-16 pt-12 md:pb-24 md:pt-20 dark:border-white/[0.08] dark:bg-[#000000]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <HeroMountBlock delay={0}>
              <h1 className="text-balance text-[clamp(2.35rem,4.5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {profile.name}
              </h1>
            </HeroMountBlock>

            <HeroMountBlock delay={0.05}>
              <div
                aria-label={copy.rolesAria}
                className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium sm:gap-x-3 sm:text-xl"
              >
                {profile.roles.map((role, index) => {
                  const isActive = index === activeRoleIndex;
                  return (
                    <span
                      key={role}
                      className="inline-flex items-center gap-2 sm:gap-3"
                    >
                      <motion.button
                        type="button"
                        onClick={() => setActiveRoleIndex(index)}
                        whileTap={{ scale: 0.96 }}
                        transition={APPLE_SPRING_SNAPPY}
                        className={`relative pb-1 text-left whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
                          isActive
                            ? 'font-semibold text-[#0071E3] dark:text-[#2997FF]'
                            : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                        }`}
                      >
                        <span>{role}</span>
                        {isActive && (
                          <motion.span
                            layoutId="hero-role-underline"
                            aria-hidden="true"
                            transition={APPLE_SPRING_SNAPPY}
                            className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#0071E3] dark:bg-[#2997FF]"
                          />
                        )}
                      </motion.button>
                      {index < profile.roles.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="pb-1 text-[#D2D2D7] dark:text-[#3A3A3C]"
                        >
                          |
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </HeroMountBlock>

            <HeroMountBlock delay={0.15}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#424245] sm:text-lg dark:text-[#A1A1A6] dark:tracking-[0.01em]">
                {profile.heroSummary}
              </p>
            </HeroMountBlock>

            <HeroMountBlock delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <motion.a
                  href="#projects"
                  whileHover={{ y: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap shrink-0 text-white transition-colors duration-150 hover:bg-[#0077ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] sm:px-6 sm:text-sm dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                >
                  <span>{copy.viewProjects}</span>
                  <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </motion.a>

                <motion.button
                  type="button"
                  onClick={onDownloadCv}
                  whileHover={{ y: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-black/[0.12] bg-[#F5F5F7] px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap shrink-0 text-[#1D1D1F] transition-colors duration-150 hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] sm:px-6 sm:text-sm dark:border-white/[0.16] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {cvDownloaded ? (
                      <motion.span
                        key="downloaded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.16, ease: APPLE_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check
                          className="h-4 w-4 text-[#0071E3] dark:text-[#2997FF]"
                          aria-hidden="true"
                        />
                        <span>{copy.cvDownloaded}</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="download"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.16, ease: APPLE_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span>{copy.downloadCv}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </HeroMountBlock>
          </div>

          <HeroScaleBlock delay={0.12} className="lg:col-span-5">
            <div
              ref={portraitRef}
              className="h-full overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:border-white/[0.10] dark:bg-[#161618]"
            >
              <motion.div
                style={prefersReducedMotion ? undefined : { y: portraitY }}
                className="h-full w-full scale-[1.04]"
              >
                <ResilientImage
                  src="/src/assets/images/IMG_3115.jpeg"
                  alt={copy.portraitAlt}
                  fallbackTitle="Adi Yoga — Studio Workspace"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </HeroScaleBlock>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 border-t border-black/[0.08] pt-8 md:grid-cols-4 dark:border-white/[0.10]">
          {profile.highlights.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2, transition: APPLE_SPRING_SNAPPY }}
              transition={{
                duration: 0.5,
                delay: 0.22 + idx * 0.06,
                ease: APPLE_EASE
              }}
              className="space-y-1"
            >
              <p className="tabular-nums font-[var(--font-display)] text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-3xl dark:text-[#F5F5F7]">
                {item.value}
              </p>
              <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                {item.label}
              </p>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
