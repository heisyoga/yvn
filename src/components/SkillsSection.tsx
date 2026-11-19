import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion
} from 'motion/react';
import type {
  PortfolioCopy,
  SkillFilterKey,
  SkillItem
} from '../data/portfolioData.ts';
import {
  computeSkillTransition,
  filterSkills,
  flattenSkillIcons,
  type FloatingSkillIcon
} from '../utils/portfolioLogic.ts';
import {
  APPLE_SPRING_SNAPPY,
  RevealBlock
} from './MotionPrimitives.tsx';
import { TechLogo } from './TechLogos.tsx';

interface SkillsSectionProps {
  skills: SkillItem[];
  copy: PortfolioCopy['skills'];
}

interface CardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point2D {
  x: number;
  y: number;
}

interface HideFlightCard {
  icon: FloatingSkillIcon;
  start: Point2D;
  stackOffset: Point2D;
  rotate: number;
}

interface RevealFlightCard {
  icon: FloatingSkillIcon;
  target: Point2D;
  arcOffset: Point2D;
  rotate: number;
}

interface ActiveFlight {
  seq: number;
  dock: Point2D;
  cardWidth: number;
  cardHeight: number;
  keepDockMounted: boolean;
  hideCards: HideFlightCard[];
  revealCards: RevealFlightCard[];
  revealStartDelaySec: number;
  revealStaggerSec: number;
}

function HiddenGlassesIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="6.5" cy="13" r="3.5" />
      <circle cx="17.5" cy="13" r="3.5" />
      <path d="M10 13c1.2-1 2.8-1 4 0" />
      <path d="M3 13l1.5-5.5a2 2 0 0 1 1.9-1.5H8" />
      <path d="M21 13l-1.5-5.5a2 2 0 0 0-1.9-1.5H16" />
      <path d="M3.5 3.5l17 17" />
    </svg>
  );
}

interface PendingMeasurement {
  seq: number;
  nextFilter: SkillFilterKey;
  toHide: FloatingSkillIcon[];
  toReveal: FloatingSkillIcon[];
  prevCardRects: Map<string, CardRect>;
  prevDock: Point2D | null;
  cardWidth: number;
  cardHeight: number;
}

export function SkillsSection({ skills, copy }: SkillsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<SkillFilterKey>('all');
  const [displayedFilter, setDisplayedFilter] = useState<SkillFilterKey>('all');
  const [concealedIds, setConcealedIds] = useState<Set<string>>(new Set());
  const [activeFlight, setActiveFlight] = useState<ActiveFlight | null>(null);
  const [dockCatchKey, setDockCatchKey] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const dockIconRef = useRef<HTMLSpanElement>(null);
  const pendingRef = useRef<PendingMeasurement | null>(null);
  const seqRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const isGridInView = useInView(gridRef, { amount: 0.05 });

  const allIcons = useMemo(() => flattenSkillIcons(skills), [skills]);

  const activeIcons = useMemo(
    () => flattenSkillIcons(filterSkills(skills, displayedFilter)),
    [skills, displayedFilter]
  );

  const hiddenIcons = useMemo(() => {
    if (displayedFilter === 'all') {
      return [];
    }
    return allIcons.filter((icon) => icon.filterKey !== displayedFilter);
  }, [allIcons, displayedFilter]);

  const showDock =
    hiddenIcons.length > 0 || Boolean(activeFlight?.keepDockMounted);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const measureCurrentLayout = () => {
    const container = gridRef.current;
    const cardRects = new Map<string, CardRect>();
    let cardWidth = 104;
    let cardHeight = 120;
    let dockPoint: Point2D | null = null;

    if (!container) {
      return {
        cardRects,
        dockPoint,
        cardWidth,
        cardHeight,
        width: 800,
        height: 260
      };
    }

    const containerRect = container.getBoundingClientRect();
    const cards = container.querySelectorAll<HTMLElement>('[data-skill-card]');
    cards.forEach((el) => {
      const id = el.dataset.skillCard;
      if (!id) return;
      const rect = el.getBoundingClientRect();
      cardWidth = rect.width || cardWidth;
      cardHeight = rect.height || cardHeight;
      cardRects.set(id, {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height
      });
    });

    if (dockIconRef.current) {
      const dockRect = dockIconRef.current.getBoundingClientRect();
      dockPoint = {
        x: dockRect.left + dockRect.width / 2 - containerRect.left,
        y: dockRect.top + dockRect.height / 2 - containerRect.top
      };
    }

    return {
      cardRects,
      dockPoint,
      cardWidth,
      cardHeight,
      width: containerRect.width,
      height: containerRect.height
    };
  };

  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;

    const {
      cardRects: nextRects,
      dockPoint: nextDock,
      cardWidth: measuredWidth,
      cardHeight: measuredHeight,
      width,
      height
    } = measureCurrentLayout();

    const cardWidth = measuredWidth || pending.cardWidth || 104;
    const cardHeight = measuredHeight || pending.cardHeight || 120;
    const dock: Point2D = nextDock ??
      pending.prevDock ?? {
        x: width / 2,
        y: Math.max(height - 32, 180)
      };

    const dockTopLeftX = dock.x - cardWidth / 2;
    const dockTopLeftY = dock.y - cardHeight / 2;

    const hideCards: HideFlightCard[] = pending.toHide.map((icon, idx) => {
      const prevRect = pending.prevCardRects.get(icon.id);
      const start: Point2D = prevRect
        ? { x: prevRect.x, y: prevRect.y }
        : { x: dockTopLeftX, y: Math.max(dockTopLeftY - 120, 0) };

      const stackOffset: Point2D =
        pending.toHide.length <= 4
          ? {
              x: (idx - (pending.toHide.length - 1) / 2) * 8,
              y: -idx * 3
            }
          : {
              x: ((idx % 5) - 2) * 5,
              y: -Math.min(idx, 10) * 2.4
            };
      const rotate =
        pending.toHide.length <= 4
          ? (idx - (pending.toHide.length - 1) / 2) * 5
          : ((idx % 7) - 3) * 3.5;

      return { icon, start, stackOffset, rotate };
    });

    const revealCards: RevealFlightCard[] = pending.toReveal.map((icon, idx) => {
      const nextRect = nextRects.get(icon.id);
      const target: Point2D = nextRect
        ? { x: nextRect.x, y: nextRect.y }
        : {
            x: dockTopLeftX + ((idx % 5) - 2) * 90,
            y: 40
          };
      const spreadX = (target.x - dockTopLeftX) * 0.16;
      const liftY = Math.min(target.y, dockTopLeftY - 86) - 20;
      return {
        icon,
        target,
        arcOffset: { x: dockTopLeftX + spreadX, y: liftY },
        rotate: ((idx % 5) - 2) * 4
      };
    });

    const hideDurationMs = hideCards.length > 0 ? 660 : 0;
    const revealStartDelaySec = hideCards.length > 0 ? 0.38 : 0;
    const revealStaggerSec =
      revealCards.length <= 3
        ? 0.095
        : revealCards.length <= 7
          ? 0.055
          : 0.02;
    const revealFlightMs = 540;
    const revealTotalMs =
      revealCards.length > 0
        ? revealStartDelaySec * 1000 +
          Math.max(0, revealCards.length - 1) * revealStaggerSec * 1000 +
          revealFlightMs
        : 0;

    const totalMs = Math.max(hideDurationMs, revealTotalMs) + 40;

    setActiveFlight({
      seq: pending.seq,
      dock,
      cardWidth,
      cardHeight,
      keepDockMounted: pending.nextFilter === 'all' && revealCards.length > 0,
      hideCards,
      revealCards,
      revealStartDelaySec,
      revealStaggerSec
    });

    const scheduled: number[] = [];

    if (hideCards.length > 0) {
      scheduled.push(
        window.setTimeout(() => {
          setDockCatchKey((prev) => prev + 1);
        }, 580)
      );
    }

    // Commit grid visibility once at flight end so GPU compositing runs with zero mid-flight re-renders.
    scheduled.push(
      window.setTimeout(() => {
        setConcealedIds(new Set());
        setActiveFlight(null);
      }, totalMs)
    );

    timersRef.current = scheduled;
  }, [displayedFilter]);

  const handleSelectFilter = (nextFilter: SkillFilterKey) => {
    if (nextFilter === selectedFilter) return;

    const prevFilter = selectedFilter;
    clearTimers();
    setSelectedFilter(nextFilter);

    if (prefersReducedMotion) {
      pendingRef.current = null;
      setConcealedIds(new Set());
      setActiveFlight(null);
      setDisplayedFilter(nextFilter);
      return;
    }

    const { toHide, toReveal } = computeSkillTransition(
      allIcons,
      prevFilter,
      nextFilter
    );

    if (toHide.length === 0 && toReveal.length === 0) {
      pendingRef.current = null;
      setConcealedIds(new Set());
      setActiveFlight(null);
      setDisplayedFilter(nextFilter);
      return;
    }

    const { cardRects, dockPoint, cardWidth, cardHeight } =
      measureCurrentLayout();
    seqRef.current += 1;

    pendingRef.current = {
      seq: seqRef.current,
      nextFilter,
      toHide,
      toReveal,
      prevCardRects: cardRects,
      prevDock: dockPoint,
      cardWidth,
      cardHeight
    };

    setConcealedIds(new Set(toReveal.map((item) => item.id)));
    setDisplayedFilter(nextFilter);
  };

  return (
    <section
      id="skills"
      className="border-t border-black/[0.06] bg-white py-20 md:py-28 dark:border-white/[0.08] dark:bg-[#0B0B0D]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealBlock className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
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
            className="inline-flex w-fit flex-wrap items-center gap-1 rounded-xl border border-black/[0.08] bg-[#F5F5F7] p-1 lg:shrink-0 lg:flex-nowrap dark:border-white/[0.10] dark:bg-[#161618]"
          >
            {copy.filters.map((filter) => {
              const isActive = selectedFilter === filter.key;
              return (
                <motion.button
                  key={filter.key}
                  type="button"
                  onClick={() => handleSelectFilter(filter.key)}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.96 }}
                  className={`relative min-h-[36px] shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
                    isActive
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="skills-filter-pill"
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

        <div ref={gridRef} className="relative mt-14 min-h-[220px]">
          <div
            data-testid="skills-floating-grid"
            aria-label={copy.floatingAria}
            className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-9 sm:gap-x-7 sm:gap-y-10 ${
              isGridInView && !activeFlight ? '' : 'apple-float-paused'
            }`}
          >
            {activeIcons.map((item, idx) => {
              const isConcealed = concealedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  data-testid="floating-tech-item"
                  data-skill-card={item.id}
                  className={`group flex w-24 flex-col items-center text-center sm:w-[104px] ${
                    isConcealed ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div
                    className={
                      isConcealed
                        ? ''
                        : idx % 2 === 0
                          ? 'apple-float-even'
                          : 'apple-float-odd'
                    }
                    style={{
                      ['--float-duration' as string]: `${3.6 + (idx % 4) * 0.4}s`,
                      ['--float-delay' as string]: `${(idx % 5) * 0.25}s`
                    }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-black/[0.08] bg-[#F5F5F7] shadow-sm transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95 sm:h-[72px] sm:w-[72px] dark:border-white/[0.12] dark:bg-[#161618]">
                      <TechLogo name={item.name} size={32} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#1D1D1F] sm:text-sm dark:text-[#F5F5F7]">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                    {item.categoryLabel}
                  </p>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {showDock && (
              <motion.div
                key="hide-dock-wrapper"
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                transition={APPLE_SPRING_SNAPPY}
                className="mt-10 flex justify-center"
              >
                <motion.button
                  type="button"
                  data-testid="skills-hide-dock"
                  onClick={() => handleSelectFilter('all')}
                  aria-label={copy.hiddenDockAria}
                  title={copy.restoreAllLabel}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-black/[0.10] bg-[#F5F5F7] px-4 py-3 shadow-sm transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#161618] dark:hover:bg-[#232326]"
                >
                  <motion.span
                    ref={dockIconRef}
                    data-testid="skills-hide-dock-icon"
                    key={`catch-${dockCatchKey}-${displayedFilter}`}
                    initial={{ scale: 0.76, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={APPLE_SPRING_SNAPPY}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1D1D1F] text-white dark:bg-[#F5F5F7] dark:text-[#000000]"
                  >
                    <HiddenGlassesIcon className="h-5 w-5" />
                  </motion.span>

                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {copy.hiddenDockLabel} ·{' '}
                      <span className="tabular-nums text-[#0071E3] dark:text-[#2997FF]">
                        {activeFlight?.keepDockMounted
                          ? activeFlight.revealCards.length
                          : hiddenIcons.length}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                      {copy.restoreAllLabel}
                    </span>
                  </div>

                  {hiddenIcons.length > 0 && (
                    <div
                      aria-hidden="true"
                      className="flex items-center -space-x-1.5 pl-1"
                    >
                      {hiddenIcons.slice(0, 7).map((hidden) => (
                        <span
                          key={hidden.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.08] bg-white shadow-xs dark:border-white/[0.12] dark:bg-[#232326]"
                        >
                          <TechLogo name={hidden.name} size={15} />
                        </span>
                      ))}
                      {hiddenIcons.length > 7 && (
                        <span className="tabular-nums inline-flex h-7 items-center justify-center rounded-lg border border-black/[0.08] bg-white px-2 text-[10px] font-semibold text-[#6E6E73] dark:border-white/[0.12] dark:bg-[#232326] dark:text-[#A1A1A6]">
                          +{hiddenIcons.length - 7}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {activeFlight && (
            <div
              key={`flight-layer-${activeFlight.seq}`}
              data-testid="skills-flight-layer"
              data-hide-count={activeFlight.hideCards.length}
              data-reveal-count={activeFlight.revealCards.length}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20"
            >
              {activeFlight.hideCards.map((card, idx) => {
                const dockTopLeftX =
                  activeFlight.dock.x - activeFlight.cardWidth / 2;
                const dockTopLeftY =
                  activeFlight.dock.y - activeFlight.cardHeight / 2;
                const stackX = dockTopLeftX + card.stackOffset.x;
                const stackY = dockTopLeftY - 76 + card.stackOffset.y;

                return (
                  <motion.div
                    key={`hide-flight-${card.icon.id}`}
                    data-testid="flight-hide-card"
                    initial={{
                      x: card.start.x,
                      y: card.start.y,
                      scale: 1,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{
                      x: [card.start.x, stackX, dockTopLeftX],
                      y: [card.start.y, stackY, dockTopLeftY],
                      scale: [1, 1.05, 0.18],
                      rotate: [0, card.rotate, card.rotate * 1.3],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 0.66,
                      delay: Math.min(idx * 0.007, 0.08),
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.48, 1]
                    }}
                    style={{
                      left: 0,
                      top: 0,
                      width: activeFlight.cardWidth,
                      height: activeFlight.cardHeight,
                      zIndex: idx + 1
                    }}
                    className="will-change-transform absolute flex flex-col items-center text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-black/[0.08] bg-[#F5F5F7] shadow-md sm:h-[72px] sm:w-[72px] dark:border-white/[0.14] dark:bg-[#1C1C1E]">
                      <TechLogo name={card.icon.name} size={32} />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#1D1D1F] sm:text-sm dark:text-[#F5F5F7]">
                      {card.icon.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                      {card.icon.categoryLabel}
                    </p>
                  </motion.div>
                );
              })}

              {activeFlight.revealCards.map((card, idx) => {
                const dockTopLeftX =
                  activeFlight.dock.x - activeFlight.cardWidth / 2;
                const dockTopLeftY =
                  activeFlight.dock.y - activeFlight.cardHeight / 2;

                return (
                  <motion.div
                    key={`reveal-flight-${card.icon.id}`}
                    data-testid="flight-reveal-card"
                    initial={{
                      x: dockTopLeftX,
                      y: dockTopLeftY,
                      scale: 0.18,
                      rotate: card.rotate * 1.5,
                      opacity: 0
                    }}
                    animate={{
                      x: [dockTopLeftX, card.arcOffset.x, card.target.x],
                      y: [dockTopLeftY, card.arcOffset.y, card.target.y],
                      scale: [0.18, 1.06, 1],
                      rotate: [card.rotate * 1.5, card.rotate * 0.4, 0],
                      opacity: [0, 1, 1]
                    }}
                    transition={{
                      duration: 0.54,
                      delay:
                        activeFlight.revealStartDelaySec +
                        idx * activeFlight.revealStaggerSec,
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.36, 1]
                    }}
                    style={{
                      left: 0,
                      top: 0,
                      width: activeFlight.cardWidth,
                      height: activeFlight.cardHeight,
                      zIndex: idx + 1
                    }}
                    className="will-change-transform absolute flex flex-col items-center text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-black/[0.08] bg-[#F5F5F7] shadow-md sm:h-[72px] sm:w-[72px] dark:border-white/[0.14] dark:bg-[#1C1C1E]">
                      <TechLogo name={card.icon.name} size={32} />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#1D1D1F] sm:text-sm dark:text-[#F5F5F7]">
                      {card.icon.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                      {card.icon.categoryLabel}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
