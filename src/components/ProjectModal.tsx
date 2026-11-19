import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Github, Layers, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { PortfolioCopy, ProjectItem } from '../data/portfolioData.ts';
import {
  APPLE_EASE,
  APPLE_SPRING_GENTLE,
  APPLE_SPRING_SNAPPY
} from './MotionPrimitives.tsx';
import { ResilientImage } from './ResilientImage.tsx';
import { TechLogo } from './TechLogos.tsx';

export type ProjectModalTab = 'preview' | 'code';

interface ProjectModalProps {
  project: ProjectItem | null;
  initialTab: ProjectModalTab;
  copy: PortfolioCopy['modal'];
  onClose: () => void;
}

export function ProjectModal({
  project,
  initialTab,
  copy,
  onClose
}: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<ProjectModalTab>(initialTab);
  const [copiedRepo, setCopiedRepo] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setCopiedRepo(false);
  }, [project?.id, initialTab]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  const handleCopyRepo = async () => {
    if (!project?.githubUrl) return;
    try {
      await navigator.clipboard.writeText(project.githubUrl);
      setCopiedRepo(true);
      window.setTimeout(() => setCopiedRepo(false), 2000);
    } catch {
      setCopiedRepo(true);
      window.setTimeout(() => setCopiedRepo(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: APPLE_EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={APPLE_SPRING_GENTLE}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-2xl dark:border-white/[0.12] dark:bg-[#161618]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/[0.08] bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/[0.10] dark:bg-[#161618]/95">
              <div className="min-w-0">
                <h3
                  id="project-modal-title"
                  className="truncate text-lg font-bold text-[#1D1D1F] sm:text-xl dark:text-[#F5F5F7]"
                >
                  {project.title}
                </h3>
              </div>

              <motion.button
                type="button"
                onClick={onClose}
                aria-label={`${copy.closePrefix} ${project.title}`}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                transition={APPLE_SPRING_SNAPPY}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-[#F5F5F7] text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] dark:border-white/[0.12] dark:bg-[#232326] dark:text-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="sticky top-[61px] z-[9] border-b border-black/[0.06] bg-white/95 px-6 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#161618]/95">
              <div
                role="tablist"
                aria-label={copy.tabsAria}
                className="inline-flex items-center gap-1 rounded-xl border border-black/[0.08] bg-[#F5F5F7] p-1 dark:border-white/[0.10] dark:bg-[#0B0B0D]"
              >
                <motion.button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'preview'}
                  onClick={() => setActiveTab('preview')}
                  whileTap={{ scale: 0.96 }}
                  className={`relative inline-flex min-h-[36px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'preview'
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {activeTab === 'preview' && (
                    <motion.span
                      layoutId="modal-tab-pill"
                      aria-hidden="true"
                      transition={APPLE_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-[#2C2C2E]"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.previewTab}</span>
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'code'}
                  onClick={() => setActiveTab('code')}
                  whileTap={{ scale: 0.96 }}
                  className={`relative inline-flex min-h-[36px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'code'
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {activeTab === 'code' && (
                    <motion.span
                      layoutId="modal-tab-pill"
                      aria-hidden="true"
                      transition={APPLE_SPRING_SNAPPY}
                      className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-[#2C2C2E]"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.codeTab}</span>
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="space-y-6 p-6 pt-5">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'preview' ? (
                  <motion.div
                    key="tab-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: APPLE_EASE }}
                    className="space-y-5"
                  >
                    <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-[#F5F5F7] dark:border-white/[0.10] dark:bg-[#0B0B0D]">
                      <ResilientImage
                        src={project.thumbnail}
                        alt={project.thumbnailAlt}
                        fallbackTitle={project.title}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>

                    <p className="text-sm leading-relaxed text-[#424245] sm:text-base dark:text-[#A1A1A6]">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#F5F5F7] px-4 py-3 dark:border-white/[0.10] dark:bg-[#0B0B0D]">
                      <div className="min-w-0">
                        <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
                          {copy.liveUrlLabel}
                        </p>
                        <p className="truncate font-mono text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {project.displayUrl}
                        </p>
                      </div>

                      {project.actionState === 'live' && project.demoUrl ? (
                        <motion.a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={APPLE_SPRING_SNAPPY}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#0071E3] px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#0077ED] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{copy.openLiveSite}</span>
                        </motion.a>
                      ) : project.actionState === 'this-website' ? (
                        <motion.a
                          href="#top"
                          onClick={onClose}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={APPLE_SPRING_SNAPPY}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#0071E3] px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#0077ED] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                        >
                          <span>{project.actionLabel}</span>
                        </motion.a>
                      ) : project.actionState === 'deprecated' ? (
                        <span className="inline-flex min-h-[36px] items-center rounded-lg bg-[#D70015] px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-[#DC2626] dark:text-white">
                          {project.actionLabel}
                        </span>
                      ) : project.actionState === 'archived' ? (
                        <span className="inline-flex min-h-[36px] items-center rounded-lg bg-[#E5E5EA] px-3.5 py-1.5 text-xs font-semibold text-[#48484A] dark:bg-[#2C2C2E] dark:text-[#A1A1A6]">
                          {project.actionLabel}
                        </span>
                      ) : project.actionState === 'discontinued' ? (
                        <span className="inline-flex min-h-[36px] items-center rounded-lg bg-[#D70015] px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-[#DC2626] dark:text-white">
                          {project.actionLabel}
                        </span>
                      ) : (
                        <span className="inline-flex min-h-[36px] items-center rounded-lg bg-[#E5E5EA] px-3.5 py-1.5 text-xs font-semibold text-[#48484A] dark:bg-[#2C2C2E] dark:text-[#A1A1A6]">
                          {project.actionLabel}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
                      <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {copy.highlightsHeading}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {project.highlights.map((highlight, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-sm text-[#424245] dark:text-[#A1A1A6]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0071E3] dark:bg-[#2997FF]"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-code"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: APPLE_EASE }}
                    className="space-y-5"
                  >
                    <div className="rounded-xl border border-black/[0.08] bg-[#F5F5F7] p-4 dark:border-white/[0.10] dark:bg-[#0B0B0D]">
                      <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {copy.architectureHeading}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#424245] dark:text-[#A1A1A6]">
                        {project.architectureNote}
                      </p>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#0071E3] dark:text-[#2997FF]" aria-hidden="true" />
                        <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {copy.techStackHeading}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-xs font-medium text-[#1D1D1F] dark:border-white/[0.12] dark:bg-[#232326] dark:text-[#F5F5F7]"
                          >
                            <TechLogo name={tech} size={15} />
                            <span>{tech}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#F5F5F7] px-4 py-3 dark:border-white/[0.10] dark:bg-[#0B0B0D]">
                      <div className="min-w-0">
                        <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6]">
                          {copy.repoLabel}
                        </p>
                        <p className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {project.githubUrl ?? copy.githubUnavailable}
                        </p>
                      </div>

                      {project.githubUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyRepo}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-black/[0.10] bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED] dark:border-white/[0.14] dark:bg-[#161618] dark:text-[#F5F5F7] dark:hover:bg-[#232326]"
                          >
                            {copiedRepo ? (
                              <>
                                <Check
                                  className="h-3.5 w-3.5 text-[#0071E3] dark:text-[#2997FF]"
                                  aria-hidden="true"
                                />
                                <span>{copy.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{copy.copyUrl}</span>
                              </>
                            )}
                          </button>

                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#0071E3] px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#0077ED] dark:bg-[#2997FF] dark:text-[#000000] dark:hover:bg-[#52ABFF]"
                          >
                            <Github className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{copy.openGithub}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
