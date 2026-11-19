import type { PortfolioCopy, ProfileData } from '../data/portfolioData.ts';
import { RevealBlock, RevealCard, RevealDivider } from './MotionPrimitives.tsx';

interface AboutSectionProps {
  profile: ProfileData;
  copy: PortfolioCopy['about'];
}

export function AboutSection({ profile, copy }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="bg-[#F5F5F7] py-20 md:py-28 dark:bg-[#000000]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <RevealBlock className="lg:col-span-4">
            <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF]">
              {copy.kicker}
            </p>
            <h2 className="text-balance mt-2 text-3xl font-bold tracking-tight text-[#1D1D1F] sm:text-4xl dark:text-[#F5F5F7]">
              {copy.heading}
            </h2>
          </RevealBlock>

          <div className="space-y-5 lg:col-span-8">
            {profile.aboutParagraphs.map((paragraph, idx) => (
              <RevealBlock key={idx} delay={0.07 * idx}>
                <p className="max-w-3xl text-base leading-relaxed text-[#424245] sm:text-lg dark:text-[#A1A1A6] dark:tracking-[0.01em]">
                  {paragraph}
                </p>
              </RevealBlock>
            ))}

            <RevealDivider className="mt-10" />

            <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
              {profile.principles.map((principle, idx) => (
                <RevealCard
                  key={principle.index}
                  delay={0.08 + idx * 0.07}
                  className="space-y-2 rounded-xl p-2 -m-2 transition-colors duration-200 hover:bg-black/[0.025] dark:hover:bg-white/[0.03]"
                >
                  <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6E6E73] dark:text-[#A1A1A6]">
                    {principle.description}
                  </p>
                </RevealCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
