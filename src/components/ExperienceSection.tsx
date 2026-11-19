import { useState } from 'react';
import { Award } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  CertificateItem,
  ExperienceFilterKey,
  ExperienceItem,
  PortfolioCopy
} from '../data/portfolioData';
import { filterExperiences } from '../utils/portfolioLogic';
import {
  APPLE_EASE,
  APPLE_SPRING_SNAPPY,
  RevealBlock
} from './MotionPrimitives';

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
  certificates: CertificateItem[];
  copy: PortfolioCopy['experience'];
}

export function ExperienceSection({
  experiences,
  certificates,
  copy
}: ExperienceSectionProps) {
  const [selectedFilter, setSelectedFilter] =
    useState<ExperienceFilterKey>('all');

  const visibleExperiences = filterExperiences(experiences, selectedFilter);

  const baseRepeatCount =
    visibleExperiences.length <= 2
      ? 3
      : visibleExperiences.length === 3
        ? 2
        : 1;

  const baseHalf = Array.from(
    { length: baseRepeatCount },
    () => visibleExperiences
  ).flat();

  const marqueeItems = [...baseHalf, ...baseHalf];
  const durationSeconds = Math.max(24, baseHalf.length * 7.5);

  return (
    <section
      id="experience"
      className="border-t border-black/[0.06] bg-white py-20 md:py-28 dark:border-white/[0.08] dark:bg-[#0B0B0D]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealBlock className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF]">
              {copy.kicker}
            </p>
            <h2 className="text-balance mt-2 text-3xl font-bold tracking-tight text-[#1D1D1F] sm:text-4xl dark:text-[#F5F5F7]">
              {copy.heading}
            </h2>
          </div>

          <div
            role="group"
            aria-label={copy.filterAria}
            className="inline-flex w-fit items-center gap-1 rounded-xl border border-black/[0.08] bg-[#F5F5F7] p-1 dark:border-white/[0.10] dark:bg-[#161618]"
          >
            {copy.filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <motion.button
                  key={filter.key}
                  type="button"
                  onClick={() => setSelectedFilter(filter.key)}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.96 }}
                  className={`relative min-h-[36px] shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
                    isActive
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="experience-filter-pill"
                      aria-hidden="true"
                      transition={APPLE_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-[#2C2C2E]"
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </RevealBlock>
      </div>

      <div
        aria-label={copy.marqueeAria}
        data-testid="experience-horizontal-track"
        className="apple-marquee-wrap relative mt-12 overflow-hidden py-2"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-20 dark:from-[#0B0B0D]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-20 dark:from-[#0B0B0D]"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: APPLE_EASE }}
          >
            <div
              className="apple-marquee-ltr flex w-max gap-6"
              style={{
                ['--marquee-duration' as string]: `${durationSeconds}s`
              }}
            >
              {marqueeItems.map((item, idx) => {
                const isPrimaryOccurrence = idx < visibleExperiences.length;
                return (
                  <article
                    key={`${item.id}-${idx}`}
                    aria-hidden={!isPrimaryOccurrence || undefined}
                    data-testid={
                      isPrimaryOccurrence ? 'experience-card' : undefined
                    }
                    className="flex w-[310px] shrink-0 flex-col justify-between rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-6 transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-black/[0.15] sm:w-[390px] sm:p-7 lg:w-[420px] dark:border-white/[0.10] dark:bg-[#161618] dark:hover:border-white/[0.18]"
                  >
                    <div>
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                            {item.organization} · {item.categoryLabel}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-[#1D1D1F] sm:text-xl dark:text-[#F5F5F7]">
                            {item.role}
                          </h3>
                        </div>

                        <p className="tabular-nums shrink-0 font-mono text-xs font-medium text-[#0071E3] dark:text-[#2997FF]">
                          {item.period}
                        </p>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-[#424245] dark:text-[#A1A1A6]">
                        {item.summary}
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
                      {item.responsibilities.map((resp, respIdx) => (
                        <li
                          key={respIdx}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-[#424245] sm:text-sm dark:text-[#A1A1A6]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6E6E73] dark:bg-[#A1A1A6]"
                          />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-16 border-t border-black/[0.06] pt-14 dark:border-white/[0.08]">
          <RevealBlock>
            <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF]">
              {copy.certificatesKicker}
            </p>
            <h3 className="text-balance mt-2 text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-3xl dark:text-[#F5F5F7]">
              {copy.certificatesHeading}
            </h3>
          </RevealBlock>

          <div
            data-testid="certificates-grid"
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {certificates.map((cert, idx) => (
              <motion.article
                key={cert.id}
                data-reveal="true"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -3, transition: APPLE_SPRING_SNAPPY }}
                viewport={{ once: true, amount: 'some' }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.07,
                  ease: APPLE_EASE
                }}
                className="flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-6 transition-colors duration-200 hover:border-black/[0.14] dark:border-white/[0.10] dark:bg-[#161618] dark:hover:border-white/[0.18]"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                    <Award
                      className="h-4 w-4 shrink-0 text-[#0071E3] dark:text-[#2997FF]"
                      aria-hidden="true"
                    />
                    <span>
                      {cert.scope} · {cert.issuer}
                    </span>
                  </div>
                  <h4 className="mt-3 text-lg font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {cert.title}
                  </h4>
                </div>

                <p className="mt-4 border-t border-black/[0.06] pt-3 font-mono text-xs font-semibold text-[#0071E3] dark:border-white/[0.08] dark:text-[#2997FF]">
                  {cert.award}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
