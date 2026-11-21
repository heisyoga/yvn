import { Suspense, lazy, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AboutSection } from './components/AboutSection.tsx';
import { ContactFooter } from './components/ContactFooter.tsx';
import { ExperienceSection } from './components/ExperienceSection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { NotFoundPage } from './components/NotFoundPage.tsx';
import { PortfolioChatbot } from './components/PortfolioChatbot.tsx';
import { ProjectModal, type ProjectModalTab } from './components/ProjectModal.tsx';
import { ProjectsSection } from './components/ProjectsSection.tsx';
import { ScrollProgressBar } from './components/ScrollProgressBar.tsx';
import { ScrollToTopButton } from './components/ScrollToTopButton.tsx';
import { SkillsSection } from './components/SkillsSection.tsx';
import {
  PORTFOLIO_DATA,
  type Language,
  type ProjectItem
} from './data/portfolioData.ts';

import {
  buildCvDocument,
  isPortfolioHomePath,
  resolveInitialLanguage,
  resolveInitialTheme,
  resolveSeoMetadata,
  toggleThemeMode,
  type ThemeMode
} from './utils/portfolioLogic.ts';

const AdminPage = lazy(() => import('./components/AdminPage.tsx'));

const THEME_STORAGE_KEY = 'portfolio-theme';
const LANG_STORAGE_KEY = 'portfolio-lang';

interface RouteNavigationState {
  scrollTo?: string;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = isPortfolioHomePath(location.pathname);
  const isAdminRoute = location.pathname.replace(/\/+$/, '') === '/_gate';

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    return resolveInitialTheme(stored, prefersDark);
  });

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'id';
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return resolveInitialLanguage(stored);
  });

  const [portfolioData, setPortfolioData] = useState(PORTFOLIO_DATA);
  const [cvDownloaded, setCvDownloaded] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [modalTab, setModalTab] = useState<ProjectModalTab>('preview');

  const localized = portfolioData[language];

  useEffect(() => {
    let active = true;
    fetch('/api/portfolio')
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json() as { data?: typeof PORTFOLIO_DATA };
        return payload.data ?? null;
      })
      .then((data) => {
        if (active && data) setPortfolioData(data);
      })
      .catch(() => {
        // Keep bundled content available if spreadsheet service is unavailable.
      });
    return () => { active = false; };
  }, []);
  const selectedProject =
    localized.projects.find((p) => p.id === selectedProjectId) ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [language]);

  useEffect(() => {
    const baseSeo = resolveSeoMetadata({
      language,
      pathname: location.pathname,
      origin: window.location.origin,
      isHome
    });
    const configuredSeo = (portfolioData[language] as (typeof portfolioData)[Language] & { seo?: { title?: string; description?: string; imageAlt?: string; socialImageUrl?: string } }).seo;
    const seo = {
      ...baseSeo,
      ...(isHome && configuredSeo ? {
        title: configuredSeo.title || baseSeo.title,
        description: configuredSeo.description || baseSeo.description,
        imageAlt: configuredSeo.imageAlt || baseSeo.imageAlt,
        imageUrl: configuredSeo.socialImageUrl || baseSeo.imageUrl
      } : {})
    };

    document.title = seo.title;

    const setMeta = (
      attr: 'name' | 'property',
      key: string,
      value: string
    ) => {
      const selector = `meta[${attr}="${key}"]`;
      let tag = document.head.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', isAdminRoute ? 'noindex, nofollow' : seo.robots);
    setMeta('property', 'og:site_name', seo.siteName);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:url', seo.canonicalUrl);
    setMeta('property', 'og:image', seo.imageUrl);
    setMeta('property', 'og:image:secure_url', seo.imageUrl);
    setMeta('property', 'og:image:alt', seo.imageAlt);
    setMeta('property', 'og:locale', seo.locale);
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', seo.imageUrl);
    setMeta('name', 'twitter:image:alt', seo.imageAlt);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonicalUrl);
  }, [isAdminRoute, isHome, language, location.pathname, portfolioData]);

  useEffect(() => {
    if (!isHome) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const navState = location.state as RouteNavigationState | null;
    const targetHref = navState?.scrollTo || location.hash;
    if (!targetHref) return;

    const targetId = targetHref.replace('#', '');
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timer = window.setTimeout(() => {
      if (targetId === 'top' || targetId === '') {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      } else {
        const el = document.getElementById(targetId);
        if (el) {
          const top = Math.max(
            0,
            el.getBoundingClientRect().top + window.scrollY - 68
          );
          window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }

      if (navState?.scrollTo) {
        navigate(location.pathname, { replace: true, state: null });
      }
    }, 60);

    return () => window.clearTimeout(timer);
  }, [isHome, location.hash, location.pathname, location.state, navigate]);

  const handleToggleTheme = () => {
    setTheme((prev) => toggleThemeMode(prev));
  };

  const handleSelectLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  const handleNavigateHomeSection = (href: string) => {
    if (isHome) {
      const targetId = href.replace('#', '');
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (targetId === 'top' || targetId === '') {
        window.scrollTo({
          top: 0,
          behavior: prefersReduced ? 'auto' : 'smooth'
        });
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        const top = Math.max(
          0,
          el.getBoundingClientRect().top + window.scrollY - 68
        );
        window.scrollTo({
          top,
          behavior: prefersReduced ? 'auto' : 'smooth'
        });
      }
      return;
    }

    navigate('/', { state: { scrollTo: href } satisfies RouteNavigationState });
  };

  const handleDownloadCv = () => {
    const cvContent = buildCvDocument(localized, language);
    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `CV_Adi_Yoga_INSTIKI_${language}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setCvDownloaded(true);
    window.setTimeout(() => setCvDownloaded(false), 3000);
  };

  const handleOpenProject = (project: ProjectItem, tab: ProjectModalTab) => {
    setSelectedProjectId(project.id);
    setModalTab(tab);
  };

  const homeElement = (
    <>
      <main>
        <HeroSection
          profile={localized.profile}
          copy={localized.copy.hero}
          onDownloadCv={handleDownloadCv}
          cvDownloaded={cvDownloaded}
        />

        <AboutSection
          profile={localized.profile}
          copy={localized.copy.about}
        />

        <ExperienceSection
          experiences={localized.experiences}
          certificates={localized.certificates}
          copy={localized.copy.experience}
        />

        <ProjectsSection
          projects={localized.projects}
          copy={localized.copy.projects}
          onOpenProject={handleOpenProject}
        />

        <SkillsSection
          skills={localized.skills}
          copy={localized.copy.skills}
        />
      </main>

      <ContactFooter
        profile={localized.profile}
        language={language}
        copy={localized.copy.contact}
      />

      <ProjectModal
        project={selectedProject}
        initialTab={modalTab}
        copy={localized.copy.modal}
        onClose={() => setSelectedProjectId(null)}
      />
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] transition-colors duration-200 dark:bg-[#000000] dark:text-[#F5F5F7]">
        {isHome && <ScrollProgressBar />}
        {!isAdminRoute && <Navbar
          brandName={localized.profile.shortName}
          theme={theme}
          language={language}
          copy={localized.copy.nav}
          isHome={isHome}
          onNavigateHomeSection={handleNavigateHomeSection}
          onToggleTheme={handleToggleTheme}
          onSelectLanguage={handleSelectLanguage}
        />}

        <Routes>
          <Route path="/_gate" element={<Suspense fallback={<div className="min-h-screen bg-[#F5F5F7] dark:bg-black" />}><AdminPage /></Suspense>} />
          <Route path="/" element={homeElement} />
          <Route path="/index.html" element={homeElement} />
          <Route
            path="*"
            element={
              <NotFoundPage
                profile={localized.profile}
                copy={localized.copy.notFound}
              />
            }
          />
        </Routes>

        {!isAdminRoute && (
          <PortfolioChatbot
            language={language}
            copy={localized.copy.chatbot}
            onNavigateSection={handleNavigateHomeSection}
            leadingAccessory={
              isHome ? (
                <ScrollToTopButton
                  floating={false}
                  copy={localized.copy.scrollToTop}
                />
              ) : null
            }
          />
        )}
      </div>
    </MotionConfig>
  );
}
