import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play
} from 'lucide-react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';
import type {
  PortfolioCopy,
  ProjectFilterKey,
  ProjectItem
} from '../data/portfolioData';
import {
  CAROUSEL_AUTOPLAY_MS,
  computeCarouselStep,
  filterProjects
} from '../utils/portfolioLogic';
import {
  APPLE_SPRING_GENTLE,
  APPLE_SPRING_SNAPPY,
  RevealBlock
} from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';
import { TechLogo } from './TechLogos';
import type { ProjectModalTab } from './ProjectModal';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  copy: PortfolioCopy['projects'];
  onOpenProject: (project: ProjectItem, tab: ProjectModalTab) => void;
}

export function ProjectsSection({
  projects,
  copy,
  onOpenProject
}: ProjectsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<ProjectFilterKey>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const elapsedRef = useRef(0);
  const activeIndexRef = useRef(0);
  const slideProgress = useMotionValue(0);

  const visibleProjects = filterProjects(projects, selectedFilter);
  const totalSlides = visibleProjects.length;
  const safeIndex = totalSlides > 0 ? activeIndex % totalSlides : 0;
  activeIndexRef.current = safeIndex;

  const resetProgress = useCallback(() => {
    elapsedRef.current = 0;
    slideProgress.set(0);
  }, [slideProgress]);

  useEffect(() => {
    setActiveIndex(0);
    resetProgress();
  }, [selectedFilter, resetProgress]);

  useEffect(() => {
    if (totalSlides <= 1 || isPaused || isHovered || prefersReducedMotion) {
      return;
    }

    let rafId = 0;
    let lastTimestamp = performance.now();

    const tick = (now: number) => {
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;

      const step = computeCarouselStep({
        elapsedMs: elapsedRef.current,
        deltaMs,
        durationMs: CAROUSEL_AUTOPLAY_MS,
        currentIndex: activeIndexRef.current,
        totalSlides
      });

      elapsedRef.current = step.nextElapsedMs;
      slideProgress.set(step.progress);

      if (step.didAdvance) {
        activeIndexRef.current = step.nextIndex;
        setActiveIndex(step.nextIndex);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [totalSlides, isPaused, isHovered, prefersReducedMotion, slideProgress]);

  const handlePrev = () => {
    if (totalSlides <= 1) return;
    resetProgress();
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    if (totalSlides <= 1) return;
    resetProgress();
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleSelectSlide = (idx: number) => {
    resetProgress();
    setActiveIndex(idx);
  };

  const renderProjectAction = (project: ProjectItem) => {
    switch (project.actionState) {
      case 'live':
        return (
          <motion.button
            type="button"
            onClick={() => onOpenProject(project, 'preview')}
            aria-label={`${copy.demoAriaPrefix} ${project.title}`}
            whileHover={{ y: -1.5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0077ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span>{project.actionLabel}</span>
          </motion.button>
        );
      case 'archived':
        return (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#E5E5EA] px-5 py-2.5 text-sm font-semibold text-[#48484A] dark:bg-[#2C2C2E] dark:text-[#A1A1A6]"
          >
            {project.actionLabel}
          </button>
        );
      case 'discontinued':
        return (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#D70015] px-5 py-2.5 text-sm font-semibold text-white dark:bg-[#DC2626] dark:text-white"
          >
            {project.actionLabel}
          </button>
        );
      case 'deprecated':
        return (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#D70015] px-5 py-2.5 text-sm font-semibold text-white dark:bg-[#DC2626] dark:text-white"
          >
            {project.actionLabel}
          </button>
        );
      case 'this-website':
        return (
          <motion.a
            href="#top"
            whileHover={{ y: -1.5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0077ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
          >
            {project.actionLabel}
          </motion.a>
        );
    }
  };

  return (
    <section
      id="projects"
      className="border-t border-black/[0.06] bg-[#F5F5F7] py-20 md:py-28 dark:border-white/[0.08] dark:bg-[#000000]"
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
            className="inline-flex w-fit flex-wrap items-center gap-1 rounded-xl border border-black/[0.08] bg-white p-1 dark:border-white/[0.10] dark:bg-[#161618]"
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
                      ? 'text-white dark:text-[#000000]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="projects-filter-pill"
                      aria-hidden="true"
                      transition={APPLE_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-lg bg-[#1D1D1F] dark:bg-[#F5F5F7]"
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </RevealBlock>

        <RevealBlock
          delay={0.08}
          className="mt-12"
        >
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              data-testid="projects-carousel-viewport"
              onFocusCapture={() => setIsHovered(true)}
              onBlurCapture={() => setIsHovered(false)}
              className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.04)] dark:border-white/[0.10] dark:bg-[#161618] dark:shadow-[0_16px_42px_rgba(0,0,0,0.4)]"
            >
              <motion.div
                data-testid="projects-carousel-track"
                animate={{ x: `-${safeIndex * 100}%` }}
                transition={APPLE_SPRING_GENTLE}
                className="flex"
              >
                {visibleProjects.map((project, idx) => (
                  <article
                    key={project.id}
                    data-testid="project-card"
                    className="grid w-full shrink-0 grid-cols-1 lg:grid-cols-12"
                  >
                    {project.showThumbnail && (
                      <button
                        type="button"
                        onClick={() => onOpenProject(project, 'preview')}
                        aria-label={`${copy.openDetailPrefix} ${project.title}`}
                        className="group block w-full overflow-hidden bg-[#E8E8ED] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] lg:col-span-7 dark:bg-[#0B0B0D]"
                      >
                        <motion.div
                          animate={{ scale: idx === safeIndex ? 1 : 1.03 }}
                          transition={APPLE_SPRING_GENTLE}
                          className="h-full w-full"
                        >
                          <ResilientImage
                            src={project.thumbnail}
                            alt={project.thumbnailAlt}
                            fallbackTitle={project.title}
                            className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </motion.div>
                      </button>
                    )}

                    <div
                      className={`flex flex-col justify-between p-6 sm:p-8 lg:p-10 ${
                        project.showThumbnail ? 'lg:col-span-5' : 'lg:col-span-12'
                      }`}
                    >
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-3xl dark:text-[#F5F5F7]">
                          {project.title}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-[#424245] sm:text-base dark:text-[#A1A1A6]">
                          {project.summary}
                        </p>

                        <div
                          aria-label={copy.techStackAria}
                          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-black/[0.06] pt-5 font-mono text-xs text-[#424245] dark:border-white/[0.08] dark:text-[#D1D1D6]"
                        >
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <TechLogo name={tech} size={16} />
                              <span>{tech}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8">{renderProjectAction(project)}</div>
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>

            {totalSlides > 1 && (
              <div
                data-testid="projects-carousel-controls"
                className="mt-6 flex flex-wrap items-center justify-center gap-3"
              >
                <motion.button
                  type="button"
                  onClick={handlePrev}
                  aria-label={copy.prevSlide}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </motion.button>

                <div
                  role="tablist"
                  aria-label={copy.slideDotsAria}
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 dark:border-white/[0.12] dark:bg-[#161618]"
                >
                  {visibleProjects.map((project, idx) => {
                    const isCurrent = idx === safeIndex;
                    return (
                      <motion.button
                        key={project.id}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`${copy.goToSlidePrefix} ${project.title}`}
                        onClick={() => handleSelectSlide(idx)}
                        whileTap={{ scale: 0.9 }}
                        className={`relative h-2 overflow-hidden rounded-full transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
                          isCurrent
                            ? 'w-10 bg-black/15 dark:bg-white/20'
                            : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/25 dark:hover:bg-white/45'
                        }`}
                      >
                        {isCurrent && (
                          <motion.span
                            data-testid="carousel-pill-progress"
                            aria-hidden="true"
                            style={{
                              scaleX: prefersReducedMotion ? 1 : slideProgress
                            }}
                            className="absolute inset-0 origin-left rounded-full bg-[#0071E3] will-change-transform dark:bg-[#2997FF]"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                  <span className="tabular-nums ml-1.5 font-mono text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                    {String(safeIndex + 1).padStart(2, '0')}/
                    {String(totalSlides).padStart(2, '0')}
                  </span>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? copy.playAuto : copy.pauseAuto}
                  aria-pressed={isPaused}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Pause className="h-4 w-4" aria-hidden="true" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  aria-label={copy.nextSlide}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>
            )}
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
